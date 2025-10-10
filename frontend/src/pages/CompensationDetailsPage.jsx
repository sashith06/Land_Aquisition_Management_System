import React, { useState, useEffect } from 'react';
import { Users, DollarSign, MapPin, Search } from 'lucide-react';
import CompensationDetailsTab from '../components/CompensationDetailsTab';
import Breadcrumb from '../components/Breadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';
import api, { getPlanById } from '../api';

const CompensationDetailsPage = () => {
  const [lotsData, setLotsData] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [planId, setPlanId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [projectContext, setProjectContext] = useState({ projectName: '', projectId: '' });
  const { generateBreadcrumbs } = useBreadcrumbs();

  // Determine user role based on current route
  const getCurrentUserRole = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/fo-dashboard')) return 'financial_officer';
    if (currentPath.includes('/pe-dashboard')) return 'project_engineer';
    if (currentPath.includes('/ce-dashboard')) return 'chief_engineer';
    return 'land_officer'; // Default role
  };

  const userRole = getCurrentUserRole();

  // Get plan ID from URL
  useEffect(() => {
    const pathParts = window.location.pathname.split('/');
    const planIdFromUrl = pathParts[3]; // Assuming URL structure like /fo-dashboard/plan/123/compensation
    if (planIdFromUrl) {
      setPlanId(planIdFromUrl);
      fetchPlanAndProjectData(planIdFromUrl);
      fetchLotsData(planIdFromUrl);
    }
  }, []);

  const fetchPlanAndProjectData = async (currentPlanId) => {
    try {
      const planResponse = await getPlanById(currentPlanId);
      if (planResponse.data) {
        const plan = planResponse.data;
        setProjectContext({
          projectId: plan.project_id,
          projectName: plan.project_name || `Project ${plan.project_id}`
        });
      }
    } catch (error) {
      console.error('Error fetching plan data:', error);
    }
  };

  const fetchLotsData = async (currentPlanId) => {
    if (!currentPlanId) return;
    
    setIsLoading(true);
    try {
      const response = await api.get(`/api/lots/plan/${currentPlanId}`);
      if (response.data.success) {
        const lots = response.data.lots.map(lot => ({
          ...lot,
          backend_id: lot.id,
          id: `L${String(lot.id).padStart(3, '0')}`,
          owners: lot.owners || []
        }));
        setLotsData(lots);
        
        // Auto-select first lot if available
        if (lots.length > 0) {
          const firstLot = lots[0].owners && lots[0].owners.length > 0 
            ? { ...lots[0], selectedOwnerIdx: 0 } 
            : lots[0];
          setSelectedLot(firstLot);
        }
      }
    } catch (error) {
      console.error('Error fetching lots data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLotSelect = (lot) => {
    const lotWithSelectedOwner = lot.owners && lot.owners.length > 0 
      ? { ...lot, selectedOwnerIdx: 0 } 
      : lot;
    setSelectedLot(lotWithSelectedOwner);
  };

  // Filter lots based on search term and status
  const filteredLots = lotsData.filter(lot => {
    const matchesSearch = lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         lot.owners?.some(owner => 
                           owner.name?.toLowerCase().includes(searchTerm.toLowerCase())
                         );
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'with-owners') return matchesSearch && lot.owners && lot.owners.length > 0;
    if (filterStatus === 'no-owners') return matchesSearch && (!lot.owners || lot.owners.length === 0);
    
    return matchesSearch;
  });

  const getCompensationStatus = (lot) => {
    if (!lot.owners || lot.owners.length === 0) return 'No Owners';
    // This would need to be determined based on actual compensation data
    // For now, return a placeholder status
    return 'Pending Assessment';
  };

  const getCompensationTotal = (lot) => {
    // This would need to be calculated from actual compensation data
    // For now, return a placeholder
    return 'Rs. 0';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <Breadcrumb items={generateBreadcrumbs({
          projectId: projectContext.projectId,
          projectName: projectContext.projectName,
          planId: planId
        })} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center">
                <DollarSign className="w-8 h-8 mr-3 text-orange-600" />
                Compensation Details Management
              </h1>
              <p className="text-gray-600 mt-2">
                Manage owner-wise compensation details for land acquisition
              </p>
              {planId && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Plan ID: {planId}
                  </span>
                </div>
              )}
            </div>
            
            {/* Role indicator */}
            <div className="text-right">
              <div className="text-sm text-gray-500">Current Role</div>
              <div className={`text-lg font-semibold ${
                userRole === 'financial_officer' ? 'text-green-600' : 'text-orange-600'
              }`}>
                {userRole === 'financial_officer' ? 'Financial Officer' : 
                 userRole === 'land_officer' ? 'Land Officer' :
                 userRole === 'project_engineer' ? 'Project Engineer' : 'Chief Engineer'}
              </div>
              {userRole !== 'financial_officer' && (
                <div className="text-xs text-gray-500 mt-1">View Only Access</div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Loading lots data...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Lots List Panel */}
            <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-blue-600" />
                  Lots Overview
                </h2>
                <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded-full">
                  {filteredLots.length}
                </span>
              </div>

              {/* Search and Filter */}
              <div className="space-y-4 mb-6">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search lots..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Lots</option>
                  <option value="with-owners">With Owners</option>
                  <option value="no-owners">No Owners</option>
                </select>
              </div>

              {/* Lots List */}
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredLots.map((lot) => (
                  <div
                    key={lot.backend_id}
                    onClick={() => handleLotSelect(lot)}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-md ${
                      selectedLot?.backend_id === lot.backend_id
                        ? 'border-orange-500 bg-orange-50 shadow-md'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800">{lot.id}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        lot.owners && lot.owners.length > 0
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {lot.owners ? lot.owners.length : 0} Owners
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-2">
                      <div className="flex items-center">
                        <MapPin className="w-3 h-3 mr-1" />
                        {lot.owners && lot.owners.length > 0 && lot.owners[0].address
                          ? lot.owners[0].address
                          : lot.location || 'Location not specified'}
                      </div>
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Size: {lot.size || 'Not specified'}</div>
                      <div>Status: {getCompensationStatus(lot)}</div>
                      <div className="font-medium text-green-600">
                        Total: {getCompensationTotal(lot)}
                      </div>
                    </div>
                  </div>
                ))}
                
                {filteredLots.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                    <p>No lots found</p>
                    <p className="text-sm">Try adjusting your search or filter</p>
                  </div>
                )}
              </div>
            </div>

            {/* Compensation Details Panel */}
            <div className="lg:col-span-3 bg-white rounded-xl shadow-lg border border-gray-200">
              {selectedLot ? (
                <div className="h-full">
                  <CompensationDetailsTab 
                    selectedLot={selectedLot}
                    planId={planId}
                    userRole={userRole}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-96">
                  <div className="text-center">
                    <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lot</h3>
                    <p className="text-gray-500">
                      Choose a lot from the left panel to view and manage compensation details
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompensationDetailsPage;

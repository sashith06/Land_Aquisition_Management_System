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
        const lots = await Promise.all(response.data.lots.map(async (lot) => {
          // Fetch compensation progress for each lot
          let compensationProgress = null;
          let compensationSummary = null;
          
          try {
            const progressResponse = await api.get(`/api/progress/plan/${currentPlanId}/lot/${lot.id}`);
            if (progressResponse.data.success && progressResponse.data.data.aggregates) {
              compensationProgress = progressResponse.data.data.aggregates.compensation;
            }
          } catch (progressError) {
            console.log(`Progress data not available for lot ${lot.id}`);
          }
          
          try {
            const compensationResponse = await api.get(`/api/compensation/plans/${currentPlanId}/lots/${lot.id}/compensation`);
            if (compensationResponse.data.success) {
              compensationSummary = compensationResponse.data.summary;
            }
          } catch (compError) {
            console.log(`Compensation data not available for lot ${lot.id}`);
          }
          
          return {
            ...lot,
            backend_id: lot.id,
            id: `L${String(lot.id).padStart(3, '0')}`,
            owners: lot.owners || [],
            compensation_progress: compensationProgress,
            compensation_summary: compensationSummary
          };
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
    
    // Enhanced compensation-based filters
    if (filterStatus === 'compensation-complete') {
      return matchesSearch && lot.compensation_progress && 
             lot.compensation_progress.fully_complete === lot.compensation_progress.total_records &&
             lot.compensation_progress.total_records > 0;
    }
    if (filterStatus === 'compensation-partial') {
      return matchesSearch && lot.compensation_progress && 
             lot.compensation_progress.with_amount > 0 &&
             lot.compensation_progress.fully_complete < lot.compensation_progress.total_records;
    }
    if (filterStatus === 'compensation-pending') {
      return matchesSearch && (!lot.compensation_progress || lot.compensation_progress.with_amount === 0);
    }
    if (filterStatus === 'missing-balance') {
      return matchesSearch && lot.compensation_progress && 
             lot.compensation_progress.with_zero_balance < lot.compensation_progress.total_records;
    }
    if (filterStatus === 'missing-interest') {
      return matchesSearch && lot.compensation_progress && 
             lot.compensation_progress.with_interest_complete < lot.compensation_progress.total_records;
    }
    if (filterStatus === 'missing-division-date') {
      return matchesSearch && lot.compensation_progress && 
             lot.compensation_progress.with_division_date < lot.compensation_progress.total_records;
    }
    
    return matchesSearch;
  });

  const getCompensationStatus = (lot) => {
    if (!lot.owners || lot.owners.length === 0) return 'No Owners';
    
    // Enhanced status based on new completion criteria
    if (lot.compensation_progress) {
      const progress = lot.compensation_progress;
      if (progress.fully_complete === progress.total_records && progress.total_records > 0) {
        return 'Complete ✅';
      } else if (progress.with_amount > 0) {
        const missing = [];
        if (progress.with_zero_balance < progress.total_records) missing.push('Balance');
        if (progress.with_interest_complete < progress.total_records) missing.push('Interest');
        if (progress.with_division_date < progress.total_records) missing.push('Division Date');
        
        return missing.length > 0 ? `Partial - Missing: ${missing.join(', ')}` : 'In Progress';
      }
    }
    
    return 'Pending Assessment';
  };

  const getCompensationTotal = (lot) => {
    if (lot.compensation_summary) {
      const total = lot.compensation_summary.total_compensation || 0;
      const interest = lot.compensation_summary.total_interest || 0;
      const grandTotal = total + interest;
      return grandTotal > 0 ? `Rs. ${grandTotal.toLocaleString()}` : 'Rs. 0';
    }
    return 'Rs. 0';
  };

  const getCompensationProgress = (lot) => {
    if (lot.compensation_progress && lot.compensation_progress.total_records > 0) {
      const progress = lot.compensation_progress;
      const completionRate = (progress.fully_complete / progress.total_records) * 100;
      return Math.round(completionRate);
    }
    return 0;
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
                <div className="mt-2 space-x-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    Plan ID: {planId}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    Interest Rate: 7% Annual
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
                  <option value="compensation-complete">Compensation Complete</option>
                  <option value="compensation-partial">Compensation Partial</option>
                  <option value="compensation-pending">Compensation Pending</option>
                  <option value="missing-balance">Missing Balance Clearance</option>
                  <option value="missing-interest">Missing Interest Payment</option>
                  <option value="missing-division-date">Missing Division Date</option>
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
                      <div className="flex items-center justify-between">
                        <span>Status: {getCompensationStatus(lot)}</span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          getCompensationProgress(lot) === 100 ? 'bg-green-100 text-green-800' :
                          getCompensationProgress(lot) > 0 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {getCompensationProgress(lot)}%
                        </span>
                      </div>
                      <div className="font-medium text-green-600">
                        Total: {getCompensationTotal(lot)}
                      </div>
                      
                      {/* Enhanced progress indicators */}
                      {lot.compensation_progress && lot.compensation_progress.total_records > 0 && (
                        <div className="mt-2 space-y-1">
                          <div className="flex items-center text-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-blue-600 h-1.5 rounded-full" 
                                style={{width: `${(lot.compensation_progress.with_amount / lot.compensation_progress.total_records) * 100}%`}}
                              ></div>
                            </div>
                            <span className="ml-2 text-gray-400">Amount</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-green-600 h-1.5 rounded-full" 
                                style={{width: `${(lot.compensation_progress.with_zero_balance / lot.compensation_progress.total_records) * 100}%`}}
                              ></div>
                            </div>
                            <span className="ml-2 text-gray-400">Balance</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-orange-600 h-1.5 rounded-full" 
                                style={{width: `${(lot.compensation_progress.with_interest_complete / lot.compensation_progress.total_records) * 100}%`}}
                              ></div>
                            </div>
                            <span className="ml-2 text-gray-400">Interest</span>
                          </div>
                          <div className="flex items-center text-xs">
                            <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                              <div 
                                className="bg-purple-600 h-1.5 rounded-full" 
                                style={{width: `${(lot.compensation_progress.with_division_date / lot.compensation_progress.total_records) * 100}%`}}
                              ></div>
                            </div>
                            <span className="ml-2 text-gray-400">Division</span>
                          </div>
                        </div>
                      )}
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
                    onDataUpdate={() => fetchLotsData(planId)}
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

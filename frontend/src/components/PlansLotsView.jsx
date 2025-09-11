import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Eye, FileText, MapPin, Calendar, User } from 'lucide-react';
import api from '../api';

const PlansLotsView = ({ userRole }) => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState('plans'); // 'plans' or 'lots'
  const [plans, setPlans] = useState([]);
  const [lots, setLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [error, setError] = useState(null);

  // Load data based on user role
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Determine API endpoints based on user role
        let plansEndpoint, lotsEndpoint;
        
        if (userRole === 'CE' || userRole === 'chief_engineer') {
          plansEndpoint = '/api/plans/dashboard/all';
          lotsEndpoint = '/api/lots/dashboard/all';
        } else if (userRole === 'PE' || userRole === 'project_engineer') {
          plansEndpoint = '/api/plans/dashboard/pe';
          lotsEndpoint = '/api/lots/dashboard/pe';
        } else {
          throw new Error('Invalid user role for dashboard access');
        }

        // Load both plans and lots
        const [plansResponse, lotsResponse] = await Promise.all([
          api.get(plansEndpoint),
          api.get(lotsEndpoint)
        ]);

        setPlans(plansResponse.data || []);
        setLots(lotsResponse.data || []);
      } catch (error) {
        console.error('Error loading plans/lots data:', error);
        setError(error.response?.data?.error || 'Failed to load data');
        setPlans([]);
        setLots([]);
      } finally {
        setLoading(false);
      }
    };

    if (userRole) {
      loadData();
    }
  }, [userRole]);

  // Filter and search logic
  const filteredPlans = useMemo(() => {
    let filtered = plans;

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(plan => plan.status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(plan =>
        plan.plan_number?.toLowerCase().includes(term) ||
        plan.project_name?.toLowerCase().includes(term) ||
        plan.description?.toLowerCase().includes(term) ||
        plan.created_by_name?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [plans, searchTerm, filterStatus]);

  const filteredLots = useMemo(() => {
    let filtered = lots;

    // Filter by status (using project status for lots)
    if (filterStatus !== 'all') {
      filtered = filtered.filter(lot => lot.project_status === filterStatus);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(lot =>
        lot.plan_number?.toLowerCase().includes(term) ||
        lot.project_name?.toLowerCase().includes(term) ||
        lot.lot_no?.toString().includes(term) ||
        lot.created_by_name?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [lots, searchTerm, filterStatus]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleViewDetails = (plan, e) => {
    e.stopPropagation(); // Prevent any parent click handlers
    // Navigate to plan detail page based on current dashboard
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate(`/pe-dashboard/plan/${plan.id}`);
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate(`/ce-dashboard/plan/${plan.id}`);
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate(`/fo-dashboard/plan/${plan.id}`);
    } else {
      navigate(`/dashboard/plan/${plan.id}`);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans and lots...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 text-red-700">
          <FileText size={20} />
          <h3 className="font-semibold">Error Loading Data</h3>
        </div>
        <p className="text-red-600 mt-2">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Plans & Lots Overview</h1>
          <p className="text-gray-600">
            {userRole === 'CE' ? 'All plans and lots across projects' : 'Plans and lots for your assigned projects'}
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode('plans')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'plans'
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Plans ({filteredPlans.length})
          </button>
          <button
            onClick={() => setViewMode('lots')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'lots'
                ? 'bg-white text-blue-600 shadow-sm font-medium'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Lots ({filteredLots.length})
          </button>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
        {/* Search */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder={`Search ${viewMode}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="approved">Approved</option>
          </select>
          <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
        </div>
      </div>

      {/* Plans View */}
      {viewMode === 'plans' && (
        <div className="space-y-4">
          {filteredPlans.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No plans match your search criteria.' 
                  : 'Plans will appear here when Land Officers create them for assigned projects.'
                }
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPlans.map((plan) => (
                <div key={plan.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  {/* Plan Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {plan.plan_number || plan.cadastral_no || `Plan-${plan.id}`}
                      </h3>
                      <p className="text-sm text-blue-600">{plan.project_name}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        plan.status === 'completed' ? 'bg-green-100 text-green-800' :
                        plan.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                        plan.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status}
                      </span>
                      <button
                        onClick={(e) => handleViewDetails(plan, e)}
                        className="p-2 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors"
                        title="View Plan Details"
                      >
                        <Eye size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Plan Details */}
                  <div className="space-y-2 text-sm">
                    {plan.description && (
                      <p className="text-gray-600">{plan.description}</p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <MapPin size={14} />
                        <span>{plan.location || plan.divisional_secretary || 'N/A'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText size={14} />
                        <span>{plan.lots_count || 0} lots</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4 text-gray-500">
                      <div className="flex items-center space-x-1">
                        <User size={14} />
                        <span>{plan.created_by_name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar size={14} />
                        <span>{formatDate(plan.created_at)}</span>
                      </div>
                    </div>

                    {plan.estimated_cost && (
                      <div className="pt-2 border-t border-gray-100">
                        <span className="text-sm font-medium text-gray-900">
                          Estimated Cost: LKR {parseFloat(plan.estimated_cost).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lots View */}
      {viewMode === 'lots' && (
        <div className="space-y-4">
          {filteredLots.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Lots Found</h3>
              <p className="text-gray-500">
                {searchTerm || filterStatus !== 'all' 
                  ? 'No lots match your search criteria.' 
                  : 'Lots will appear here when Land Officers create them within plans.'
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Lot Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Plan & Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Land Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owners
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLots.map((lot) => (
                    <tr key={lot.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Lot #{lot.lot_no}
                          </div>
                          <div className="text-sm text-gray-500">
                            ID: {lot.id}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lot.plan_number || lot.cadastral_no || `Plan-${lot.plan_id}`}
                          </div>
                          <div className="text-sm text-blue-600">
                            {lot.project_name}
                          </div>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            lot.project_status === 'completed' ? 'bg-green-100 text-green-800' :
                            lot.project_status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                            lot.project_status === 'approved' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {lot.project_status}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="text-gray-900">
                            Type: {lot.land_type || 'N/A'}
                          </div>
                          {(lot.extent_ha || lot.extent_perch) && (
                            <div className="text-gray-500">
                              Extent: {lot.extent_ha ? `${lot.extent_ha} ha` : ''} 
                              {lot.extent_perch ? ` ${lot.extent_perch} perch` : ''}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {lot.created_by_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDate(lot.created_at)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            (lot.owners_count || 0) > 0 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {lot.owners_count || 0} owners
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PlansLotsView;

import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  ChevronRight, 
  Calendar,
  BarChart3,
  MapPin,
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  XCircle,
  Loader,
  RefreshCw,
  Download,
  TrendingUp,
  PieChart
} from 'lucide-react';
import api from '../api';
import ProjectProgressChart from '../components/charts/ProjectProgressChart';
import PlanProgressChart from '../components/charts/PlanProgressChart';
import LotProgressChart from '../components/charts/LotProgressChart';

const ProjectProgress = () => {
  const [projects, setProjects] = useState([]);
  const [chartData, setChartData] = useState({ projects: [], plans: [], lots: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedProjects, setExpandedProjects] = useState(new Set());
  const [expandedPlans, setExpandedPlans] = useState(new Set());
  const [summary, setSummary] = useState({});
  const [lastUpdated, setLastUpdated] = useState(null);
  const [activeTab, setActiveTab] = useState('hierarchy');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'all',
    dateFrom: '',
    dateTo: '',
    minProgress: '',
    maxProgress: '',
    projectId: '',
    searchTerm: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  // Chart filter states
  const [chartFilters, setChartFilters] = useState({
    projects: { status: 'all' },
    plans: { status: 'all', projectId: 'all' },
    lots: { status: 'all', projectId: 'all', planId: 'all', chartType: 'bar' }
  });

  // Fetch project hierarchy data
  const fetchProjectHierarchy = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.append('dateTo', filters.dateTo);
      if (filters.minProgress) params.append('minProgress', filters.minProgress);
      if (filters.maxProgress) params.append('maxProgress', filters.maxProgress);
      if (filters.projectId) params.append('projectId', filters.projectId);

      const response = await api.get(`/api/stats/project-hierarchy?${params.toString()}`);
      
      if (response.data.success) {
        let projectsData = response.data.data.projects;
        
        // Apply search filter on frontend
        if (filters.searchTerm) {
          const searchLower = filters.searchTerm.toLowerCase();
          projectsData = projectsData.filter(project =>
            project.name.toLowerCase().includes(searchLower) ||
            project.description?.toLowerCase().includes(searchLower) ||
            project.plans.some(plan => 
              plan.plan_identifier?.toLowerCase().includes(searchLower) ||
              plan.description?.toLowerCase().includes(searchLower)
            )
          );
        }
        
        setProjects(projectsData);
        setChartData(response.data.data.charts || { projects: [], plans: [], lots: [] });
        setSummary(response.data.data.summary);
        setLastUpdated(response.data.lastUpdated);
        setError(null);
      } else {
        setError('Failed to fetch project data');
      }
    } catch (err) {
      console.error('Error fetching project hierarchy:', err);
      setError('Error loading project data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectHierarchy();
  }, []);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    fetchProjectHierarchy();
  };

  const resetFilters = () => {
    setFilters({
      status: 'all',
      dateFrom: '',
      dateTo: '',
      minProgress: '',
      maxProgress: '',
      projectId: '',
      searchTerm: ''
    });
    setTimeout(() => fetchProjectHierarchy(), 100);
  };

  // Chart filter handlers
  const handleChartFilterChange = (chartType, key, value) => {
    setChartFilters(prev => ({
      ...prev,
      [chartType]: {
        ...prev[chartType],
        [key]: value
      }
    }));
  };

  // Toggle expand/collapse
  const toggleProjectExpansion = (projectId) => {
    const newExpanded = new Set(expandedProjects);
    if (newExpanded.has(projectId)) {
      newExpanded.delete(projectId);
    } else {
      newExpanded.add(projectId);
    }
    setExpandedProjects(newExpanded);
  };

  const togglePlanExpansion = (planId) => {
    const newExpanded = new Set(expandedPlans);
    if (newExpanded.has(planId)) {
      newExpanded.delete(planId);
    } else {
      newExpanded.add(planId);
    }
    setExpandedPlans(newExpanded);
  };

  // Status badge component
  const StatusBadge = ({ status, type = 'project' }) => {
    const getStatusConfig = () => {
      const configs = {
        pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
        approved: { color: 'bg-blue-100 text-blue-800', icon: CheckCircle },
        in_progress: { color: 'bg-indigo-100 text-indigo-800', icon: BarChart3 },
        completed: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
        on_hold: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
        rejected: { color: 'bg-red-100 text-red-800', icon: XCircle },
        active: { color: 'bg-blue-100 text-blue-800', icon: BarChart3 },
      };
      return configs[status] || { color: 'bg-gray-100 text-gray-800', icon: AlertCircle };
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        <Icon className="h-3 w-3" />
        {status?.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  // Progress bar component
  const ProgressBar = ({ progress, className = "" }) => (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <div 
        className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
        style={{ width: `${Math.min(progress, 100)}%` }}
      ></div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-600">
          <Loader className="h-5 w-5 animate-spin" />
          <span>Loading project hierarchy...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Project Progress Tracking</h1>
            <p className="text-gray-600 mt-1">Monitor progress across projects, plans, and lots</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={fetchProjectHierarchy}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Projects</p>
                <p className="text-xl font-bold text-gray-900">{summary.total_projects || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <MapPin className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Plans</p>
                <p className="text-xl font-bold text-gray-900">{summary.total_plans || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Lots</p>
                <p className="text-xl font-bold text-gray-900">{summary.total_lots || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <DollarSign className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Compensation</p>
                <p className="text-xl font-bold text-gray-900">
                  LKR {(summary.total_compensation || 0).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <BarChart3 className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-xl font-bold text-gray-900">{summary.avg_progress || 0}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="p-4 border-b border-gray-200">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-gray-900"
          >
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filters</span>
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.searchTerm}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    placeholder="Search projects, plans..."
                    className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Date From */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Date To */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Min Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.minProgress}
                  onChange={(e) => handleFilterChange('minProgress', e.target.value)}
                  placeholder="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Max Progress */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Progress (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={filters.maxProgress}
                  onChange={(e) => handleFilterChange('maxProgress', e.target.value)}
                  placeholder="100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Project ID */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project ID</label>
                <input
                  type="text"
                  value={filters.projectId}
                  onChange={(e) => handleFilterChange('projectId', e.target.value)}
                  placeholder="Enter project ID"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Filter Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center gap-2 text-red-800">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('hierarchy')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'hierarchy'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Project Hierarchy
            </div>
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'charts'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Progress Charts
            </div>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'hierarchy' && (
        <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No projects found matching your criteria</p>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or add some projects to the system</p>
          </div>
        ) : (
          projects.map(project => (
            <ProjectCard 
              key={project.id} 
              project={project}
              isExpanded={expandedProjects.has(project.id)}
              onToggleExpansion={() => toggleProjectExpansion(project.id)}
              expandedPlans={expandedPlans}
              onTogglePlanExpansion={togglePlanExpansion}
              StatusBadge={StatusBadge}
              ProgressBar={ProgressBar}
            />
          ))
        )}
        </div>
      )}

      {/* Charts Tab Content */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Project Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Progress</h3>
              <div className="flex items-center gap-3">
                <select
                  value={chartFilters.projects.status}
                  onChange={(e) => handleChartFilterChange('projects', 'status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="not_started">Not Started</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
            </div>
            <ProjectProgressChart 
              data={chartData.projects} 
              filterBy={chartFilters.projects.status}
              title="Project Completion Progress"
            />
          </div>

          {/* Plan Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Plan Progress</h3>
              <div className="flex items-center gap-3">
                <select
                  value={chartFilters.plans.projectId}
                  onChange={(e) => handleChartFilterChange('plans', 'projectId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {chartData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={chartFilters.plans.status}
                  onChange={(e) => handleChartFilterChange('plans', 'status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="not_started">Not Started</option>
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
            <PlanProgressChart 
              data={chartData.plans}
              filterBy={chartFilters.plans.status}
              projectFilter={chartFilters.plans.projectId}
              title="Plan Completion Progress"
            />
          </div>

          {/* Lot Progress Chart */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Lot Progress</h3>
              <div className="flex items-center gap-3">
                <select
                  value={chartFilters.lots.projectId}
                  onChange={(e) => handleChartFilterChange('lots', 'projectId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Projects</option>
                  {chartData.projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
                <select
                  value={chartFilters.lots.planId}
                  onChange={(e) => handleChartFilterChange('lots', 'planId', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Plans</option>
                  {chartData.plans
                    .filter(plan => chartFilters.lots.projectId === 'all' || plan.project_id.toString() === chartFilters.lots.projectId)
                    .map(plan => (
                      <option key={plan.id} value={plan.id}>{plan.plan_identifier}</option>
                    ))}
                </select>
                <select
                  value={chartFilters.lots.status}
                  onChange={(e) => handleChartFilterChange('lots', 'status', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="approved">Approved</option>
                  <option value="pending">Pending</option>
                </select>
                <select
                  value={chartFilters.lots.chartType}
                  onChange={(e) => handleChartFilterChange('lots', 'chartType', e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="bar">Bar Chart</option>
                  <option value="doughnut">Doughnut Chart</option>
                </select>
              </div>
            </div>
            <LotProgressChart 
              data={chartData.lots}
              filterBy={chartFilters.lots.status}
              projectFilter={chartFilters.lots.projectId}
              planFilter={chartFilters.lots.planId}
              chartType={chartFilters.lots.chartType}
              title="Lot Completion Progress"
            />
          </div>
        </div>
      )}

      {/* Last Updated */}
      {lastUpdated && (
        <div className="mt-6 text-center text-sm text-gray-500">
          Last updated: {new Date(lastUpdated).toLocaleString()}
        </div>
      )}
    </div>
  );
};

// Project Card Component
const ProjectCard = ({ 
  project, 
  isExpanded, 
  onToggleExpansion, 
  expandedPlans, 
  onTogglePlanExpansion, 
  StatusBadge, 
  ProgressBar 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200">
    {/* Project Header */}
    <div className="p-4 border-b border-gray-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleExpansion}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? 
              <ChevronDown className="h-4 w-4 text-gray-600" /> : 
              <ChevronRight className="h-4 w-4 text-gray-600" />
            }
          </button>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
            <p className="text-sm text-gray-600">ID: {project.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={project.status} />
          <div className="text-right">
            <p className="text-lg font-bold text-gray-900">{project.project_progress}%</p>
            <p className="text-xs text-gray-500">Complete</p>
          </div>
        </div>
      </div>

      {/* Project Metrics */}
      <div className="mt-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Plans</p>
            <p className="font-semibold">{project.completed_plans}/{project.total_plans}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Lots</p>
            <p className="font-semibold">{project.completed_lots}/{project.total_lots}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Compensations</p>
            <p className="font-semibold">{project.total_compensations}</p>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">Amount</p>
            <p className="font-semibold">LKR {project.total_compensation_amount.toLocaleString()}</p>
          </div>
        </div>
        <ProgressBar progress={project.project_progress} />
      </div>

      {/* Project Details */}
      {project.description && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">{project.description}</p>
        </div>
      )}
    </div>

    {/* Plans (Expanded Content) */}
    {isExpanded && (
      <div className="p-4">
        {project.plans.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No plans available for this project</p>
        ) : (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 mb-3">Plans ({project.plans.length})</h4>
            {project.plans.map(plan => (
              <PlanCard
                key={plan.id}
                plan={plan}
                isExpanded={expandedPlans.has(plan.id)}
                onToggleExpansion={() => onTogglePlanExpansion(plan.id)}
                StatusBadge={StatusBadge}
              />
            ))}
          </div>
        )}
      </div>
    )}
  </div>
);

// Plan Card Component
const PlanCard = ({ plan, isExpanded, onToggleExpansion, StatusBadge }) => (
  <div className="bg-gray-50 rounded-lg border border-gray-200 p-3">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleExpansion}
          className="p-1 hover:bg-gray-200 rounded transition-colors"
        >
          {isExpanded ? 
            <ChevronDown className="h-3 w-3 text-gray-600" /> : 
            <ChevronRight className="h-3 w-3 text-gray-600" />
          }
        </button>
        <div>
          <p className="font-medium text-gray-900">{plan.plan_identifier}</p>
          <p className="text-xs text-gray-600">Plan ID: {plan.id}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <StatusBadge status={plan.status} />
        <div className="text-right text-sm">
          <p className="font-medium">LKR {(plan.estimated_cost || 0).toLocaleString()}</p>
          <p className="text-xs text-gray-500">{plan.total_extent || 0} Ha</p>
        </div>
      </div>
    </div>

    {plan.description && (
      <div className="mt-2 ml-6">
        <p className="text-xs text-gray-600">{plan.description}</p>
      </div>
    )}

    {/* Lots (Expanded Content) */}
    {isExpanded && (
      <div className="mt-3 ml-6">
        {plan.lots.length === 0 ? (
          <p className="text-gray-500 text-xs py-2">No lots available for this plan</p>
        ) : (
          <div className="space-y-2">
            <h5 className="text-xs font-medium text-gray-700 mb-2">Lots ({plan.lots.length})</h5>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {plan.lots.map(lot => (
                <div key={lot.id} className="bg-white rounded p-2 border border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">Lot {lot.lot_no}</p>
                      <p className="text-xs text-gray-500">
                        {lot.extent_ha}Ha {lot.extent_perch}P
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={lot.status} />
                      <p className="text-xs text-gray-500 mt-1">{lot.land_type}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )}
  </div>
);

export default ProjectProgress;
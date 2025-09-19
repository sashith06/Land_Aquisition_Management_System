import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  DollarSign,
  MapPin,
  Clock,
  RefreshCw,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { 
  LineChart, 
  BarChart, 
  PieChart, 
  DoughnutChart, 
  MixedChart 
} from '../components/charts';
import { useDashboardData } from '../hooks/useDashboardData';

const RealtimeDashboard = () => {
  const { 
    data: dashboardData, 
    loading: isLoading, 
    error, 
    lastUpdated, 
    refreshData 
  } = useDashboardData(30000); // Update every 30 seconds
  
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setIsRefreshing(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const stats = [
    {
      title: 'Total Projects',
      value: dashboardData.stats.totalProjects,
      icon: BarChart3,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: '+12%'
    },
    {
      title: 'In Progress',
      value: dashboardData.stats.inProgress,
      icon: TrendingUp,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      trend: '+5%'
    },
    {
      title: 'Completed',
      value: dashboardData.stats.completed,
      icon: Activity,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: '+8%'
    },
    {
      title: 'Total Landowners',
      value: dashboardData.stats.totalLandowners,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: '+15%'
    },
    {
      title: 'Total Compensation',
      value: formatCurrency(dashboardData.stats.totalCompensation),
      icon: DollarSign,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      trend: '+22%'
    },
    {
      title: 'Average Progress',
      value: `${dashboardData.stats.averageProgress}%`,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: '+3%'
    }
  ];

  // Error state component
  if (error) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="h-6 w-6 text-red-600" />
              <h2 className="text-lg font-semibold text-red-800">Dashboard Error</h2>
            </div>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={handleRefresh}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-gray-800">Real-time Analytics Dashboard</h1>
              <div className="flex items-center gap-2">
                {error ? (
                  <WifiOff className="h-5 w-5 text-red-500" />
                ) : (
                  <Wifi className="h-5 w-5 text-green-500" />
                )}
                <span className={`text-sm px-2 py-1 rounded-full ${
                  error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                }`}>
                  {error ? 'Offline' : 'Live'}
                </span>
              </div>
            </div>
            <p className="text-gray-600">
              Last updated: {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Never'}
            </p>
          </div>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-200">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <IconComponent className={`${stat.color} h-6 w-6`} />
                  </div>
                  <span className="text-sm font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                    {stat.trend}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Project Progress Trend */}
          <LineChart
            data={dashboardData.chartData.projectProgress || { labels: [], datasets: [] }}
            title="Project Progress Trend"
            height={350}
          />

          {/* Monthly Project Completion */}
          <BarChart
            data={dashboardData.chartData.monthlyProgress || { labels: [], datasets: [] }}
            title="Monthly Project Completion"
            height={350}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Project Status Distribution */}
          <PieChart
            data={dashboardData.chartData.projectStatus || { labels: [], datasets: [] }}
            title="Project Status Distribution"
            height={350}
            legendPosition="bottom"
          />

          {/* Location Distribution */}
          <DoughnutChart
            data={dashboardData.chartData.locationDistribution || { labels: [], datasets: [] }}
            title="Projects by Location"
            height={350}
            legendPosition="bottom"
            centerText={{
              value: dashboardData.stats.totalProjects,
              label: 'Total Projects'
            }}
          />

          {/* Key Metrics Summary */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium">Active Locations</span>
                </div>
                <span className="font-semibold text-gray-800">5</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-green-600" />
                  <span className="text-sm font-medium">Avg. Completion Time</span>
                </div>
                <span className="font-semibold text-gray-800">6.2 months</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  <span className="text-sm font-medium">Avg. Compensation</span>
                </div>
                <span className="font-semibold text-gray-800">LKR 16.7K</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compensation Trend */}
        <div className="mb-8">
          <MixedChart
            data={dashboardData.chartData.compensationTrend || { labels: [], datasets: [] }}
            title="Compensation Payment Trend"
            height={400}
          />
        </div>

        {/* Real-time Status Indicator */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-3 w-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">Live Data Feed</span>
            </div>
            <div className="text-sm text-gray-500">
              Next update in {Math.floor(Math.random() * 30) + 1} seconds
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RealtimeDashboard;
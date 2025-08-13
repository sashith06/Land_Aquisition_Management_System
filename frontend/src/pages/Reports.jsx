import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { plansData } from '../data/mockData';

const Reports = () => {
  const reports = [
    { id: 1, title: 'Monthly Progress Report', description: 'Comprehensive progress report for all active projects', date: '2025-01-15', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Budget Utilization Report', description: 'Financial analysis and budget allocation report', date: '2025-01-10', type: 'Excel', size: '1.8 MB' },
    { id: 3, title: 'Land Acquisition Status', description: 'Status report on land acquisition for all projects', date: '2025-01-05', type: 'PDF', size: '3.2 MB' },
    { id: 4, title: 'Environmental Impact Assessment', description: 'Environmental impact analysis for new projects', date: '2024-12-28', type: 'PDF', size: '5.6 MB' },
  ];

  return (
    <div className="flex flex-col h-screen">
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Nav / Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <div className="flex space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Filter size={16} /> <span>Filter</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
              <Calendar size={16} /> <span>Date Range</span>
            </button>
          </div>
        </header>

        {/* Content Area with scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Total Projects</h3>
              <p className="text-3xl font-bold text-orange-600">{plansData.length}</p>
              <p className="text-sm text-gray-500 mt-2">Active projects in system</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Reports Generated</h3>
              <p className="text-3xl font-bold text-blue-600">{reports.length}</p>
              <p className="text-sm text-gray-500 mt-2">This month</p>
            </div>
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Avg. Progress</h3>
              <p className="text-3xl font-bold text-green-600">
                {Math.round(plansData.reduce((sum, p) => sum + p.progress, 0) / plansData.length)}%
              </p>
              <p className="text-sm text-gray-500 mt-2">Across all projects</p>
            </div>
          </div>

          {/* Reports List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Available Reports</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {reports.map((report) => (
                <div key={report.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-3 bg-orange-100 rounded-lg">
                        <FileText className="text-orange-600" size={24} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800">{report.title}</h3>
                        <p className="text-gray-600 mt-1">{report.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                          <span>Generated: {report.date}</span>
                          <span>Type: {report.type}</span>
                          <span>Size: {report.size}</span>
                        </div>
                      </div>
                    </div>
                    <button className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">
                      <Download size={16} /> <span>Download</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;

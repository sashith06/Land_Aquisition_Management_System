import { FileText, Download, Calendar, Filter } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plansData, projectsData, lotsData } from '../data/mockData';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
  { id: 'item-details', name: 'Item-wise Details', path: '/report/item-details' },
  { id: 'item-progress', name: 'Item-wise Progress', path: '/report/item-progress' },
  { id: 'lot-info', name: 'Lot-wise Information', path: '/report/lot-info' },
  { id: 'plan-number', name: 'Plan Number-wise Info', path: '/report/plan-number' },
  { id: 'project-wise', name: 'Project-wise Info', path: '/report/project-wise' },
];

const reportTypeForms = {
  'item-details': ({ onSelect, selectedId }) => (
    <div className="space-y-4">
      <label className="block font-medium">Select Lot:</label>
      <select value={selectedId} onChange={onSelect} className="border p-2 rounded w-full">
        <option value="">-- Select Lot --</option>
        {lotsData.map(lot => (
          <option key={lot.id} value={lot.id}>{lot.id}</option>
        ))}
      </select>
      {selectedId && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-2 font-bold">Lot ID: {selectedId}</div>
          {lotsData.find(lot => lot.id === selectedId)?.owners.map((owner, idx) => (
            <div key={idx} className="mb-2">
              <div>Name: {owner.name}</div>
              <div>NIC: {owner.nic}</div>
              <div>Mobile: {owner.mobile}</div>
              <div>Address: {owner.address}</div>
            </div>
          ))}
          <div>Status: {lotsData.find(lot => lot.id === selectedId)?.status}</div>
        </div>
      )}
    </div>
  ),
  'item-progress': ({ onSelect, selectedId }) => (
    <div className="space-y-4">
      <label className="block font-medium">Select Plan:</label>
      <select value={selectedId} onChange={onSelect} className="border p-2 rounded w-full">
        <option value="">-- Select Plan --</option>
        {plansData.map(plan => (
          <option key={plan.id} value={plan.id}>{plan.id}</option>
        ))}
      </select>
      {selectedId && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-2 font-bold">Plan ID: {selectedId}</div>
          <div>Estimated Cost: {plansData.find(plan => plan.id === selectedId)?.estimatedCost}</div>
          <div>Estimated Extent: {plansData.find(plan => plan.id === selectedId)?.estimatedExtent}</div>
          <div>Project Date: {plansData.find(plan => plan.id === selectedId)?.projectDate}</div>
          <div>Progress: {plansData.find(plan => plan.id === selectedId)?.progress}%</div>
        </div>
      )}
    </div>
  ),
  'lot-info': ({ onSelect, selectedId }) => (
    <div className="space-y-4">
      <label className="block font-medium">Select Lot:</label>
      <select value={selectedId} onChange={onSelect} className="border p-2 rounded w-full">
        <option value="">-- Select Lot --</option>
        {lotsData.map(lot => (
          <option key={lot.id} value={lot.id}>{lot.id}</option>
        ))}
      </select>
      {selectedId && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-2 font-bold">Lot ID: {selectedId}</div>
          <div>Status: {lotsData.find(lot => lot.id === selectedId)?.status}</div>
          <div>Owners:</div>
          {lotsData.find(lot => lot.id === selectedId)?.owners.map((owner, idx) => (
            <div key={idx} className="ml-4 mb-2">
              <div>Name: {owner.name}</div>
              <div>NIC: {owner.nic}</div>
              <div>Mobile: {owner.mobile}</div>
              <div>Address: {owner.address}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  ),
  'plan-number': ({ onSelect, selectedId }) => (
    <div className="space-y-4">
      <label className="block font-medium">Select Plan:</label>
      <select value={selectedId} onChange={onSelect} className="border p-2 rounded w-full">
        <option value="">-- Select Plan --</option>
        {plansData.map(plan => (
          <option key={plan.id} value={plan.id}>{plan.id}</option>
        ))}
      </select>
      {selectedId && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-2 font-bold">Plan ID: {selectedId}</div>
          <div>Estimated Cost: {plansData.find(plan => plan.id === selectedId)?.estimatedCost}</div>
          <div>Estimated Extent: {plansData.find(plan => plan.id === selectedId)?.estimatedExtent}</div>
          <div>Project Date: {plansData.find(plan => plan.id === selectedId)?.projectDate}</div>
        </div>
      )}
    </div>
  ),
  'project-wise': ({ onSelect, selectedId }) => (
    <div className="space-y-4">
      <label className="block font-medium">Select Project:</label>
      <select value={selectedId} onChange={onSelect} className="border p-2 rounded w-full">
        <option value="">-- Select Project --</option>
        {projectsData.map(project => (
          <option key={project.id} value={project.id}>{project.name}</option>
        ))}
      </select>
      {selectedId && (
        <div className="bg-gray-50 p-4 rounded border">
          <div className="mb-2 font-bold">Project Name: {projectsData.find(project => project.id === selectedId)?.name}</div>
          <div>Description: {projectsData.find(project => project.id === selectedId)?.description}</div>
          <div>Created Date: {projectsData.find(project => project.id === selectedId)?.createdDate}</div>
          <div>Progress: {projectsData.find(project => project.id === selectedId)?.progress}%</div>
        </div>
      )}
    </div>
  ),
};

const dateFilters = [
  { label: 'All', value: 'all' },
  { label: 'Within 1 Month', value: '1m' },
  { label: 'Within 3 Months', value: '3m' },
  { label: 'Within 1 Year', value: '1y' },
];

function filterReportsByDate(reports, filter) {
  if (filter === 'all') return reports;
  const now = new Date();
  return reports.filter(report => {
    const reportDate = new Date(report.date);
    if (filter === '1m') {
      const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
      return reportDate >= oneMonthAgo;
    }
    if (filter === '3m') {
      const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
      return reportDate >= threeMonthsAgo;
    }
    if (filter === '1y') {
      const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return reportDate >= oneYearAgo;
    }
    return true;
  });
}

const Reports = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState([]); // array of type ids
  const [selectedIds, setSelectedIds] = useState({}); // { typeId: selectedId }
  const [reports, setReports] = useState([
    { id: 1, title: 'Monthly Progress Report', description: 'Comprehensive progress report for all active projects', date: '2025-01-15', type: 'PDF', size: '2.4 MB' },
    { id: 2, title: 'Budget Utilization Report', description: 'Financial analysis and budget allocation report', date: '2025-01-10', type: 'Excel', size: '1.8 MB' },
    { id: 3, title: 'Land Acquisition Status', description: 'Status report on land acquisition for all projects', date: '2025-01-05', type: 'PDF', size: '3.2 MB' },
    { id: 4, title: 'Environmental Impact Assessment', description: 'Environmental impact analysis for new projects', date: '2024-12-28', type: 'PDF', size: '5.6 MB' },
  ]);
  const [lastDeletedReport, setLastDeletedReport] = useState(null);
  const [dateFilter, setDateFilter] = useState('all');

  // Multi-select filter UI
  const handleTypeToggle = (typeId) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((id) => id !== typeId) : [...prev, typeId]
    );
    setSelectedIds((prev) => ({ ...prev, [typeId]: '' }));
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 flex-shrink-0 relative">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
          <div className="flex space-x-4 relative">
            {/* Filter Button */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter size={16} /> <span>Filter</span>
              </button>
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {reportTypes.map((type) => (
                    <label key={type.id} className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer rounded">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes(type.id)}
                        onChange={() => handleTypeToggle(type.id)}
                        className="mr-2"
                      />
                      {type.name}
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Button */}
            <select
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            >
              {dateFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </header>

        {/* Content */}
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

          {/* Render selected report type forms above the reports list */}
          {selectedTypes.length > 0 && (
            <div className="my-6 p-6 bg-white rounded-xl border border-gray-200">
              <h2 className="text-lg font-bold mb-4">Select Data for Combined Report</h2>
              <input
                type="text"
                placeholder="Enter report name (optional)"
                className="border p-2 rounded w-full mb-4"
                value={selectedIds.customName || ''}
                onChange={e => setSelectedIds({ ...selectedIds, customName: e.target.value })}
              />
              {selectedTypes.map((typeId) => (
                <div key={typeId} className="mb-6">
                  <h3 className="font-semibold mb-2">{reportTypes.find(t => t.id === typeId)?.name}</h3>
                  {reportTypeForms[typeId]({
                    onSelect: (e) => setSelectedIds({ ...selectedIds, [typeId]: e.target.value }),
                    selectedId: selectedIds[typeId] || '',
                  })}
                </div>
              ))}
              {selectedTypes.every(typeId => selectedIds[typeId]) && (
                <button
                  className="mt-4 bg-orange-500 text-white px-4 py-2 rounded"
                  onClick={() => {
                    let combinedTitle = selectedIds.customName?.trim() ? selectedIds.customName : 'Combined Report: ' + selectedTypes.map(typeId => reportTypes.find(t => t.id === typeId)?.name).join(', ');
                    let combinedDesc = selectedTypes.map(typeId => {
                      let item, desc;
                      if (typeId === 'item-details' || typeId === 'lot-info') {
                        item = lotsData.find(lot => lot.id === selectedIds[typeId]);
                        desc = `Lot ${item.id}: ` + item.owners.map(o => o.name).join(', ');
                      } else if (typeId === 'item-progress' || typeId === 'plan-number') {
                        item = plansData.find(plan => plan.id === selectedIds[typeId]);
                        desc = `Plan ${item.id}: ` + item.estimatedCost + ', ' + item.estimatedExtent;
                      } else if (typeId === 'project-wise') {
                        item = projectsData.find(project => project.id === selectedIds[typeId]);
                        desc = `Project ${item.name}: ` + item.description;
                      }
                      return desc;
                    }).join(' | ');
                    setReports([
                      {
                        id: Date.now(),
                        title: combinedTitle,
                        description: combinedDesc,
                        date: new Date().toISOString().slice(0,10),
                        type: 'PDF',
                        size: '2.0 MB',
                      },
                      ...reports,
                    ]);
                    setSelectedTypes([]);
                    setSelectedIds({});
                  }}
                >
                  Generate Combined Report
                </button>
              )}
            </div>
          )}

          {/* Reports List */}
          <div className="bg-white rounded-xl border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Available Reports</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {filterReportsByDate(reports, dateFilter).map((report) => (
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
                    <div className="flex items-center">
                      <button
                        className="flex items-center space-x-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors mr-2"
                        onClick={() => {
                          const doc = new jsPDF();
                          doc.setFontSize(16);
                          doc.text(`Report Title: ${report.title}`, 10, 20);
                          doc.setFontSize(12);
                          doc.text(`Date: ${report.date}`, 10, 30);
                          doc.text(`Type: ${report.type}`, 10, 40);
                          doc.text(`Size: ${report.size}`, 10, 50);
                          let y = 60;
                          // Enhanced owners details table logic for combined/custom reports
                          if (report.title.startsWith('Combined Report:') || report.title === selectedIds.customName) {
                            // Parse description for selected types and ids
                            const sections = report.description.split('|');
                            sections.forEach((section, idx) => {
                              let typeLabel = section.split(':')[0].trim();
                              let idMatch = section.match(/Lot (L\d+)/) || section.match(/Plan (\d+)/) || section.match(/Project ([^:]+)/);
                              let id = idMatch ? idMatch[1] : null;
                              let tableData = [];
                              if (typeLabel.startsWith('Lot')) {
                                const lot = lotsData.find(l => l.id === id);
                                if (lot) {
                                  doc.text(`Owners for ${lot.id}:`, 10, y);
                                  y += 10;
                                  tableData = lot.owners.map(owner => [owner.name, owner.nic, owner.mobile, owner.address]);
                                  autoTable(doc, {
                                    head: [['Name', 'NIC', 'Mobile', 'Address']],
                                    body: tableData,
                                    startY: y
                                  });
                                  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                                }
                              } else if (typeLabel.startsWith('Plan')) {
                                const lots = lotsData.filter(lot => lot.id.startsWith(id?.slice(-2)));
                                doc.text(`Lots and Owners for Plan ${id}:`, 10, y);
                                y += 10;
                                tableData = lots.map(lot => [lot.id, lot.owners.map(o => o.name).join(', ')]);
                                autoTable(doc, {
                                  head: [['Lot Number', 'Owners']],
                                  body: tableData,
                                  startY: y
                                });
                                y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                              } else if (typeLabel.startsWith('Project')) {
                                const project = projectsData.find(p => p.name === id);
                                if (project) {
                                  doc.text(`Lots and Owners for Project ${project.name}:`, 10, y);
                                  y += 10;
                                  const projectPlans = plansData.filter(plan => plan.projectId === project.id);
                                  let allLots = [];
                                  projectPlans.forEach(plan => {
                                    allLots = allLots.concat(lotsData.filter(lot => lot.id.startsWith(plan.id.slice(-2))));
                                  });
                                  if (allLots.length === 0) allLots = lotsData;
                                  tableData = allLots.map(lot => [lot.id, lot.owners.map(o => o.name).join(', ')]);
                                  autoTable(doc, {
                                    head: [['Lot Number', 'Owners']],
                                    body: tableData,
                                    startY: y
                                  });
                                  y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                                }
                              }
                            });
                          } else if (report.title.startsWith('Project Report:')) {
                            const projectName = report.title.replace('Project Report: ', '');
                            const project = projectsData.find(p => p.name === projectName);
                            if (project) {
                              doc.text('Lots and Owners:', 10, y);
                              y += 10;
                              const projectPlans = plansData.filter(plan => plan.projectId === project.id);
                              let allLots = [];
                              projectPlans.forEach(plan => {
                                allLots = allLots.concat(lotsData.filter(lot => lot.id.startsWith(plan.id.slice(-2))));
                              });
                              if (allLots.length === 0) allLots = lotsData;
                              const tableData = allLots.map(lot => [
                                lot.id,
                                lot.owners.map(o => o.name).join(', ')
                              ]);
                              autoTable(doc, {
                                head: [['Lot Number', 'Owners']],
                                body: tableData,
                                startY: y
                              });
                              y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                            }
                          } else if (report.title.startsWith('Lot Report:')) {
                            const lotId = report.title.replace('Lot Report: ', '');
                            const lot = lotsData.find(l => l.id === lotId);
                            if (lot) {
                              doc.text('Owners:', 10, y);
                              y += 10;
                              const tableData = lot.owners.map(owner => [owner.name, owner.nic, owner.mobile, owner.address]);
                              autoTable(doc, {
                                head: [['Name', 'NIC', 'Mobile', 'Address']],
                                body: tableData,
                                startY: y
                              });
                              y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                            }
                          } else if (report.title.startsWith('Plan Report:')) {
                            const planId = report.title.replace('Plan Report: ', '');
                            const lots = lotsData.filter(lot => lot.id.startsWith(planId.slice(-2)));
                            doc.text('Lots and Owners:', 10, y);
                            y += 10;
                            const tableData = lots.map(lot => [
                              lot.id,
                              lot.owners.map(o => o.name).join(', ')
                            ]);
                            autoTable(doc, {
                              head: [['Lot Number', 'Owners']],
                              body: tableData,
                              startY: y
                            });
                            y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                          } else {
                            // Fallback: show all lots and owners
                            doc.text('Lots and Owners:', 10, y);
                            y += 10;
                            const tableData = lotsData.map(lot => [
                              lot.id,
                              lot.owners.map(o => o.name).join(', ')
                            ]);
                            autoTable(doc, {
                              head: [['Lot Number', 'Owners']],
                              body: tableData,
                              startY: y
                            });
                            y = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : y + 30;
                          }
                          doc.save(`${report.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
                        }}
                      >
                        <Download size={16} /> <span>Download</span>
                      </button>
                      <button
                        className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                        onClick={() => {
                          setLastDeletedReport(report);
                          setReports(reports.filter(r => r.id !== report.id));
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Undo delete notification */}
      {lastDeletedReport && (
        <div className="fixed bottom-6 right-6 bg-yellow-100 border border-yellow-400 text-yellow-800 px-6 py-4 rounded shadow-lg z-50 flex items-center space-x-4">
          <span>Report "{lastDeletedReport.title}" deleted.</span>
          <button
            className="bg-yellow-400 text-white px-4 py-2 rounded hover:bg-yellow-500"
            onClick={() => {
              setReports([lastDeletedReport, ...reports]);
              setLastDeletedReport(null);
            }}
          >
            Undo
          </button>
          <button
            className="ml-2 text-yellow-800 hover:text-yellow-900"
            onClick={() => setLastDeletedReport(null)}
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
};

export default Reports;

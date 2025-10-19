import { FileText, Download, Calendar, Filter, TrendingUp, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const reportTypes = [
  { 
    id: 'financial-progress', 
    name: 'Financial Progress Report', 
    icon: DollarSign,
    description: 'Financial progress including compensation, payments, and costs'
  },
  { 
    id: 'physical-progress', 
    name: 'Physical Progress Report', 
    icon: TrendingUp,
    description: 'Physical progress tracking of land acquisition process'
  }
];

const Reports = () => {
  const navigate = useNavigate();
  const [selectedReportType, setSelectedReportType] = useState('');
  const [projects, setProjects] = useState([]);
  const [plans, setPlans] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchPlansForProject(selectedProjectId);
    } else {
      setPlans([]);
      setSelectedPlanId('');
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/api/projects/all');
      // Handle direct array response (not wrapped in success object)
      if (Array.isArray(response.data)) {
        setProjects(response.data);
      } else if (response.data.success) {
        setProjects(response.data.data || []);
      } else {
        setProjects([]);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to fetch projects');
    }
  };

  const fetchPlansForProject = async (projectId) => {
    try {
      const response = await api.get(`/api/plans/project/${projectId}`);
      // Handle direct array response (not wrapped in success object)
      if (Array.isArray(response.data)) {
        setPlans(response.data);
      } else if (response.data.success) {
        setPlans(response.data.data || []);
      } else {
        setPlans([]);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
      setError('Failed to fetch plans for selected project');
    }
  };

  const generateReport = async () => {
    if (!selectedReportType) {
      setError('Please select a report type');
      return;
    }

    if (!selectedProjectId && !selectedPlanId) {
      setError('Please select either a project or plan');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let endpoint = `/api/reports/${selectedReportType}`;
      const params = new URLSearchParams();
      
      if (selectedPlanId) {
        params.append('plan_id', selectedPlanId);
      } else if (selectedProjectId) {
        params.append('project_id', selectedProjectId);
      }

      const response = await api.get(`${endpoint}?${params.toString()}`);
      
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReportAsPDF = () => {
    if (!reportData) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    const pageHeight = doc.internal.pageSize.height;
    
    // Government Letterhead
    addGovernmentLetterhead(doc, pageWidth);
    
    // Report specific content starts after letterhead - adjusted for proper spacing
    let startY = 75;
    
    // Skip duplicate header - specific report functions will handle their own headers
    startY += 10;

    if (selectedReportType === 'financial-progress') {
      generateFinancialReportPDF(doc, reportData, startY);
    } else if (selectedReportType === 'physical-progress') {
      generatePhysicalReportPDF(doc, reportData, startY);
    }

    const fileName = `${reportData.report_type.replace(/\s+/g, '_')}_${reportData.report_date || 'report'}.pdf`;
    doc.save(fileName);
  };

  // Government Letterhead Function
  const addGovernmentLetterhead = (doc, pageWidth) => {
    // Top border line - orange
    doc.setDrawColor(255, 140, 0); // Orange border
    doc.setLineWidth(3);
    doc.line(0, 0, pageWidth, 0);
    
    // Main Header Text - centered, no background
    doc.setTextColor(0, 0, 0); // Black text
    doc.setFont('times', 'bold');
    doc.setFontSize(16);
    doc.text('ROAD DEVELOPMENT AUTHORITY', pageWidth / 2, 18, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setFont('times', 'normal');
    doc.text('MISCELLANEOUS FOREIGN AIDED PROJECTS', pageWidth / 2, 28, { align: 'center' });
    
    // Address section (left side) - clean layout
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('Address:', 20, 40);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('"Maganeguma Mahamedura"', 20, 46);
    doc.text('No. 216, Denzil Kobbekaduwa Mawatha', 20, 50);
    doc.text('Koswatta, Battaramulla, Sri Lanka', 20, 54);
    
    // Contact section (right side) - clean layout
    doc.setFont('times', 'bold');
    doc.setFontSize(10);
    doc.text('Contact:', pageWidth - 80, 40);
    
    doc.setFont('times', 'normal');
    doc.setFontSize(9);
    doc.text('Phone: +94 11 2 046200', pageWidth - 80, 46);
    doc.text('Email: info@rda.gov.lk', pageWidth - 80, 50);
    doc.text('Web: www.rda.gov.lk', pageWidth - 80, 54);
    
    // Bottom border of letterhead
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(1);
    doc.line(10, 60, pageWidth - 10, 60);
    
    // Reset colors for content
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
  };

  const generateFinancialReportPDF = (doc, data, startY) => {
    if (data.financial_data && data.financial_data.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('Financial Progress Report', 10, startY);
      doc.setFont('times', 'normal');
      
      const tableData = data.financial_data.map(item => [
        item.name_of_road || 'N/A',
        item.plan_name || 'N/A',
        `Lot ${item.lot_number}` || 'N/A',
        parseFloat(item.full_compensation || 0).toFixed(2),
        parseFloat(item.payment_done || 0).toFixed(2),
        parseFloat(item.balance_due || 0).toFixed(2),
        parseFloat(item.interest_7_percent || 0).toFixed(2),
        parseFloat(item.interest_paid || 0).toFixed(2)
      ]);

      autoTable(doc, {
        head: [['Name of Road', 'Plan No.', 'Lot No.', 'Full Compensation (Rs)', 'Payment Done (Rs)', 'Balance Due (Rs)', 'Interest to be Paid (Rs)', 'Interest Paid (Rs)']],
        body: tableData,
        startY: startY + 10,
        styles: { 
          fontSize: 10,
          cellPadding: 4,
          font: 'times'
        },
        headStyles: { 
          fillColor: [255, 140, 0],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          font: 'times'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { cellWidth: 30 },
          1: { halign: 'center', cellWidth: 15 },
          2: { halign: 'center', cellWidth: 15 },
          3: { halign: 'right', cellWidth: 25 },
          4: { halign: 'right', cellWidth: 25 },
          5: { halign: 'right', cellWidth: 25 },
          6: { halign: 'right', cellWidth: 25 },
          7: { halign: 'right', cellWidth: 25 }
        }
      });


    }
  };

  const generatePhysicalReportPDF = (doc, data, startY) => {
    if (data.physical_progress_data && data.physical_progress_data.length > 0) {
      // Main Report Header
      doc.setFont('times', 'bold');
      doc.setFontSize(18);
      doc.text('Physical Progress Report', 10, startY);
      
      startY += 25;
      
      // Report details in two-column format
      doc.setFont('times', 'normal');
      doc.setFontSize(12);
      
      const planNo = data.plan_no || data.plan_details?.plan_identifier || 'N/A';
      const projectName = data.project_name || data.plan_details?.project_name || data.project_details?.project_name || 'N/A';
      const divisionalSecretary = data.plan_details?.divisional_secretary || 'N/A';
      const overallProgress = data.overall_project_progress || data.summary?.overall_progress_percent || 0;
      
      const leftColumnX = 10;
      const rightColumnX = 110; // Right column position
      const currentStartY = startY;
      
      // Left column
      doc.text(`Plan: ${planNo}`, leftColumnX, startY);
      startY += 12;
      
      doc.text(`Project: ${projectName}`, leftColumnX, startY);
      startY += 12;
      
      doc.text(`Divisional Secretary: ${divisionalSecretary}`, leftColumnX, startY);
      startY += 12;
      
      doc.text(`Overall Project Progress: ${overallProgress}%`, leftColumnX, startY);
      
      // Right column - aligned with left column
      let rightY = currentStartY;
      doc.text(`Total Lots: ${data.summary?.total_lots || 0}`, rightColumnX, rightY);
      rightY += 12;
      
      doc.text(`Acquired Lots: ${data.summary?.total_acquired_lots || 0}`, rightColumnX, rightY);
      rightY += 12;
      
      doc.text(`Total Extent (Ha): ${parseFloat(data.summary?.total_extent_ha || 0).toFixed(2)}`, rightColumnX, rightY);
      
      startY += 20;
      
      doc.text(`Generated: ${data.report_date || new Date().toISOString().split('T')[0]}`, leftColumnX, startY);
      startY += 25;

      // Create simplified table data (no Plan No. column)
      const tableData = data.physical_progress_data.map((item, index) => [
        (item.no || (index + 1)).toString(),
        item.lot_no ? `Lot ${item.lot_no}` : 'N/A',
        item.owner_name || 'No Owner Assigned',
        parseFloat(item.lot_extent_ha || 0).toFixed(2),
        item.acquisition_status || 'Not Acquired',
        (item.owners_count || item.lot_owners_count || 1).toString(),
        item.court_case || item.court_case_status || 'No',
        item.compensation_type || 'regulation'
      ]);

      autoTable(doc, {
        head: [['No.', 'Lot No.', 'Owner Name', 'Lot Extent (Ha)', 'Acquisition Status', 'Owners Count', 'Court Case', 'Compensation Type']],
        body: tableData,
        startY: startY,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          font: 'times'
        },
        headStyles: { 
          fillColor: [34, 197, 94], // Green color to match UI
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          font: 'times'
        },
        alternateRowStyles: {
          fillColor: [249, 250, 251]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 15 }, // No.
          1: { cellWidth: 25 }, // Lot No.
          2: { cellWidth: 35 }, // Owner Name
          3: { halign: 'right', cellWidth: 20 }, // Lot Extent
          4: { halign: 'center', cellWidth: 25 }, // Acquisition Status
          5: { halign: 'center', cellWidth: 18 }, // Owners Count
          6: { halign: 'center', cellWidth: 18 }, // Court Case
          7: { halign: 'center', cellWidth: 30 } // Compensation Type
        }
      });


    }
  };

  const FinancialProgressDisplay = ({ data }) => {
    if (!data || !data.financial_data) return <div>No financial data available</div>;

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-orange-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-orange-800">
            Details on Land Acquisition & Compensation
          </h3>
          {data.plan_details && (
            <div className="mt-2 text-sm text-orange-700">
              <p>Plan: {data.plan_details.plan_identifier}</p>
              <p>Project: {data.plan_details.project_name}</p>
              {data.plan_details.divisional_secretary && (
                <p>Divisional Secretary: {data.plan_details.divisional_secretary}</p>
              )}
            </div>
          )}
          <p className="text-sm text-orange-600 mt-2">
            Report Date: {data.report_date}
          </p>
        </div>

        {/* Financial Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead className="bg-orange-500 text-white">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-sm">Name of Road</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Plan No.</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Lot No.</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Full Compensation (Rs.)</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Payment Done (Rs.)</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Balance Due (Rs.)</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Interest to be Paid (Rs.)</th>
                <th className="border border-gray-300 px-4 py-2 text-sm">Interest Paid (Rs.)</th>
              </tr>
            </thead>
            <tbody>
              {data.financial_data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-sm font-medium">{item.name_of_road || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center font-semibold text-blue-600">{item.plan_name || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center font-semibold text-blue-600">Lot {item.lot_number || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">Rs. {parseFloat(item.full_compensation || 0).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-green-600">Rs. {parseFloat(item.payment_done || 0).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-red-600">Rs. {parseFloat(item.balance_due || 0).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">Rs. {parseFloat(item.interest_7_percent || 0).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-blue-600">Rs. {parseFloat(item.interest_paid || 0).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>


      </div>
    );
  };

  const PhysicalProgressDisplay = ({ data }) => {
    if (!data || !data.physical_progress_data) return <div>No progress data available</div>;

    return (
      <div className="space-y-6">
        {/* Project Header - Shown Once */}
        <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
          <h3 className="text-xl font-bold text-green-800 mb-3">
            {data.project_name || data.plan_details?.project_name || data.project_details?.project_name || 'N/A'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Plan No. */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <span className="text-sm font-medium text-gray-600">Plan:</span>
              <p className="text-lg font-bold text-blue-800 mt-1">
                {data.plan_no || data.plan_details?.plan_identifier || 'N/A'}
              </p>
            </div>
            {/* Overall Project Progress */}
            <div className="bg-white p-4 rounded border shadow-sm">
              <span className="text-sm font-medium text-gray-600">Overall Project Progress:</span>
              <p className="text-2xl font-bold text-green-800 mt-1">
                {data.overall_project_progress || data.summary?.overall_progress_percent || 0}%
              </p>
            </div>
          </div>
          <p className="text-sm text-green-600 mt-3">Generated: {data.report_date || new Date().toISOString().split('T')[0]}</p>
        </div>

        {/* Summary Cards - Total Lots, Acquired Lots, Total Extent */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Total Lots</h4>
            <p className="text-3xl font-bold text-blue-600">{data.summary?.total_lots || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Acquired Lots</h4>
            <p className="text-3xl font-bold text-green-600">{data.summary?.total_acquired_lots || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h4 className="text-lg font-semibold text-gray-600 mb-2">Total Extent (Ha)</h4>
            <p className="text-3xl font-bold text-orange-600">{parseFloat(data.summary?.total_extent_ha || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Simplified Physical Progress Table - Plan No. shown in header */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800">Lot Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="border border-white px-3 py-3 text-center">No.</th>
                  <th className="border border-white px-4 py-3">Lot No.</th>
                  <th className="border border-white px-4 py-3">Owner Name</th>
                  <th className="border border-white px-3 py-3">Lot Extent (Ha)</th>
                  <th className="border border-white px-3 py-3">Acquisition Status</th>
                  <th className="border border-white px-3 py-3">Owners Count</th>
                  <th className="border border-white px-3 py-3">Court Case</th>
                  <th className="border border-white px-4 py-3">Compensation Type</th>
                </tr>
              </thead>
              <tbody>
                {data.physical_progress_data.map((item, index) => (
                  <tr key={`${item.lot_no}-${index}`} className="hover:bg-gray-50 border-b border-gray-100">
                    <td className="border-r border-gray-200 px-3 py-3 text-center text-gray-600 font-medium">
                      {item.no || (index + 1)}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-3 font-semibold text-blue-600">
                      {item.lot_no ? `Lot ${item.lot_no}` : 'N/A'}
                    </td>
                    <td className="border-r border-gray-200 px-4 py-3 text-gray-700">
                      {item.owner_name || 'No Owner Assigned'}
                    </td>
                    <td className="border-r border-gray-200 px-3 py-3 text-right text-gray-700 font-medium">
                      {parseFloat(item.lot_extent_ha || 0).toFixed(2)}
                    </td>
                    <td className="border-r border-gray-200 px-3 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.acquisition_status === 'Acquired' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.acquisition_status || 'Not Acquired'}
                      </span>
                    </td>
                    <td className="border-r border-gray-200 px-3 py-3 text-center font-medium text-gray-700">
                      {item.owners_count || item.lot_owners_count || 1}
                    </td>
                    <td className="border-r border-gray-200 px-3 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        item.court_case === 'Yes' || item.court_case_status === 'Yes' ? 'bg-red-100 text-red-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.court_case || item.court_case_status || 'No'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.compensation_type === 'normal' ? 'bg-blue-100 text-blue-800' :
                        item.compensation_type === 'special committee decision' ? 'bg-purple-100 text-purple-800' :
                        item.compensation_type === 'larc/super larc' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.compensation_type || 'regulation'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>


      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 flex items-center justify-between px-6 bg-white border-b border-gray-200 flex-shrink-0">
          <h1 className="text-2xl font-bold text-gray-800">Reports</h1>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Report Type Selection */}
          <div className="bg-white rounded-xl border border-gray-200 mb-6">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-800">Report Types</h2>
              <p className="text-gray-600 mt-1">Select a report type to generate</p>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reportTypes.map((type) => {
                  const Icon = type.icon;
                  return (
                    <div
                      key={type.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        selectedReportType === type.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedReportType(type.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon size={24} className={selectedReportType === type.id ? 'text-orange-600' : 'text-gray-600'} />
                        <div>
                          <h3 className="font-semibold text-gray-800">{type.name}</h3>
                          <p className="text-sm text-gray-600">{type.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Filter Selection */}
          {selectedReportType && (
            <div className="bg-white rounded-xl border border-gray-200 mb-6">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Report Filters</h2>
                <p className="text-gray-600 mt-1">Select project and/or plan for the report</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="">-- Select Project --</option>
                      {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                          {project.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Select Plan (Optional)
                    </label>
                    <select
                      value={selectedPlanId}
                      onChange={(e) => setSelectedPlanId(e.target.value)}
                      disabled={!selectedProjectId}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:bg-gray-100"
                    >
                      <option value="">-- Select Plan (Optional) --</option>
                      {plans.map((plan) => (
                        <option key={plan.id} value={plan.id}>
                          {plan.plan_identifier}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                {error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                  </div>
                )}
                <div className="mt-6 flex space-x-4">
                  <button
                    onClick={generateReport}
                    disabled={loading || !selectedReportType || (!selectedProjectId && !selectedPlanId)}
                    className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400"
                  >
                    {loading ? 'Generating...' : 'Generate Report'}
                  </button>
                  {reportData && (
                    <button
                      onClick={downloadReportAsPDF}
                      className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Report Display */}
          {reportData && (
            <div className="bg-white rounded-xl border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-800">Generated Report</h2>
              </div>
              <div className="p-6">
                {selectedReportType === 'financial-progress' && (
                  <FinancialProgressDisplay data={reportData} />
                )}
                {selectedReportType === 'physical-progress' && (
                  <PhysicalProgressDisplay data={reportData} />
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;

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
    let startY = 72;
    
    // Report Details Section - using Times New Roman
    doc.setFontSize(12);
    doc.setFont('times', 'bold');
    doc.text(reportData.report_type || 'Report', 10, startY);
    doc.setFont('times', 'normal');
    
    startY += 15;
    
    if (reportData.plan_details) {
      doc.text(`Plan: ${reportData.plan_details.plan_identifier || 'N/A'}`, 10, startY);
      doc.text(`Project: ${reportData.plan_details.project_name || 'N/A'}`, 10, startY + 10);
      if (reportData.plan_details.divisional_secretary) {
        doc.text(`Divisional Secretary: ${reportData.plan_details.divisional_secretary}`, 10, startY + 20);
        startY += 30;
      } else {
        startY += 20;
      }
    } else if (reportData.project_details) {
      doc.text(`Project: ${reportData.project_details.project_name || 'N/A'}`, 10, startY);
      if (reportData.project_details.divisional_secretary) {
        doc.text(`Divisional Secretary: ${reportData.project_details.divisional_secretary}`, 10, startY + 10);
        startY += 20;
      } else {
        startY += 10;
      }
    }
    
    doc.text(`Generated: ${reportData.report_date || new Date().toISOString().split('T')[0]}`, 10, startY + 10);
    startY += 25;

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
    // Header background - adjusted height to accommodate text and border spacing
    doc.setFillColor(52, 64, 84); // Dark blue-gray background matching RDA theme
    doc.rect(0, 0, pageWidth, 58, 'F');
    
    // Top border line
    doc.setDrawColor(255, 140, 0); // Orange border
    doc.setLineWidth(3);
    doc.line(0, 0, pageWidth, 0);
    
    // Logo container area (small div-like box)
    doc.setFillColor(255, 255, 255); // White background for logo container
    doc.roundedRect(12, 8, 40, 40, 4, 4, 'F');
    
    // Border for logo container
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(1);
    doc.roundedRect(12, 8, 40, 40, 4, 4, 'S');
    
    // Main Logo - small and contained without stretching
    try {
      // Add main logo from logo.png - smaller size, centered in container
      doc.addImage('/logo.png', 'PNG', 16, 12, 32, 32);
    } catch (error) {
      console.warn('Could not load logo.png, using fallback');
      // Fallback if logo can't be loaded
      doc.setFillColor(255, 140, 0);
      doc.roundedRect(16, 12, 32, 32, 4, 4, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text('LOGO', 32, 30, { align: 'center' });
    }
    
    // Reset text color for main header
    doc.setTextColor(255, 255, 255);
    
    // Main Header Text (center area) - using Times New Roman
    doc.setFont('times', 'bold');
    doc.setFontSize(14);
    doc.text('ROAD DEVELOPMENT AUTHORITY', 75, 18);
    
    doc.setFontSize(10);
    doc.text('MISCELLANEOUS FOREIGN AIDED PROJECTS', 75, 28);
    
    // Address section (left-center area) - separate lines
    doc.setTextColor(255, 140, 0); // Orange for headers
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.text('Address:', 75, 36);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'normal');
    doc.setFontSize(7);
    doc.text('"Maganeguma Mahamedura"', 75, 42);
    doc.text('No. 216, Denzil Kobbekaduwa Mawatha', 75, 46);
    doc.text('Koswatta, Battaramulla, Sri Lanka', 75, 50);
    
    // Contact section (far right side) - separate lines
    doc.setTextColor(255, 140, 0);
    doc.setFont('times', 'bold');
    doc.setFontSize(8);
    doc.text('Contact:', pageWidth - 85, 36);
    
    doc.setTextColor(255, 255, 255);
    doc.setFont('times', 'normal');
    doc.setFontSize(7);
    doc.text('Phone: +94 11 2 046200', pageWidth - 85, 42);
    doc.text('Email: info@rda.gov.lk', pageWidth - 85, 46);
    doc.text('Web: www.rda.gov.lk', pageWidth - 85, 50);
    
    // Bottom border of letterhead - positioned below text to avoid crossing
    doc.setDrawColor(255, 140, 0);
    doc.setLineWidth(2);
    doc.line(10, 54, pageWidth - 10, 54);
    
    // Reset colors for content
    doc.setTextColor(0, 0, 0);
    doc.setDrawColor(0, 0, 0);
  };

  const generateFinancialReportPDF = (doc, data, startY) => {
    if (data.financial_data && data.financial_data.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('Financial Progress Details', 10, startY);
      doc.setFont('times', 'normal');
      
      const tableData = data.financial_data.map(item => [
        item.name_of_road || 'N/A',
        item.acquired_lots?.toString() || '0',
        item.compensation_paid_lots_rs || '0.00',
        item.compensation_under_sec_17_rs_mn || '0.00',
        item.development_cost_rs_mn || '0.00',
        item.court_deposit_rs_mn || '0.00',
        item.compensation_paid_rs_mn || '0.00',
        item.interest_paid_rs_mn || '0.00',
        `${item.payment_progress_percentage || 0}%`
      ]);

      autoTable(doc, {
        head: [['Name of Road', 'Acquired Lots', 'Compensation (Rs)', 'Compensation Under Sec 17', 'Development Cost', 'Court Deposit', 'Compensation Paid', 'Interest Paid', 'Progress %']],
        body: tableData,
        startY: startY + 10,
        styles: { 
          fontSize: 9,
          cellPadding: 3,
          font: 'times'
        },
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          font: 'times'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        }
      });

      // Summary - using same font and size as report details
      if (data.summary) {
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text('Summary:', 10, finalY);
        doc.text(`Total Lots: ${data.summary.total_lots}`, 10, finalY + 10);
        doc.text(`Total Compensation Allocated: Rs. ${data.summary.total_compensation_allocated}`, 10, finalY + 20);
        doc.text(`Total Compensation Paid: Rs. ${data.summary.total_compensation_paid}`, 10, finalY + 30);
        doc.text(`Total Interest Paid: Rs. ${data.summary.total_interest_paid}`, 10, finalY + 40);
        doc.text(`Overall Progress: ${data.summary.overall_payment_progress}%`, 10, finalY + 50);
      }
    }
  };

  const generatePhysicalReportPDF = (doc, data, startY) => {
    if (data.physical_progress_data && data.physical_progress_data.length > 0) {
      doc.setFont('times', 'bold');
      doc.setFontSize(14);
      doc.text('Physical Progress Report', 10, startY);
      doc.setFont('times', 'normal');
      
      const tableData = data.physical_progress_data.map((item, index) => [
        (index + 1).toString(),
        item.area_name || 'N/A',
        item.plan_survey_number || 'N/A',
        parseFloat(item.total_extent_ha || 0).toFixed(2),
        item.total_lots?.toString() || '0',
        item.acquired_lots_count?.toString() || '0',
        item.total_owners?.toString() || '0',
        item.court_cases?.toString() || '0',
        item.compensation_type || 'N/A',
        parseFloat(item.total_compensation_paid || 0).toFixed(2),
        parseFloat(item.total_interest_paid || 0).toFixed(2),
        `${data.summary?.overall_progress_percent || 0}%`
      ]);

      autoTable(doc, {
        head: [['No.', 'Area/Project Name', 'Plan/Survey Number', 'Total Extent (Ha)', 'Total Lots', 'Acquired Lots', 'Total Owners', 'Court Cases', 'Compensation Type', 'Compensation Paid (Rs.)', 'Interest Paid (Rs.)', 'Overall Progress']],
        body: tableData,
        startY: startY + 10,
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          font: 'times'
        },
        headStyles: { 
          fillColor: [0, 51, 102],
          textColor: [255, 255, 255],
          fontStyle: 'bold',
          font: 'times'
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245]
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 8 },
          3: { halign: 'right' },
          4: { halign: 'center' },
          5: { halign: 'center' },
          6: { halign: 'center' },
          7: { halign: 'center' },
          8: { halign: 'center' },
          9: { halign: 'center' },
          10: { halign: 'center' },
          11: { halign: 'right' },
          12: { halign: 'right' }
        }
      });

      // Summary - using same font and size as report details
      if (data.summary) {
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFont('times', 'normal');
        doc.setFontSize(12);
        doc.text('Summary:', 10, finalY);
        doc.text(`Total Lots: ${data.summary.total_lots}`, 10, finalY + 10);
        doc.text(`Total Acquired Lots: ${data.summary.total_acquired_lots}`, 10, finalY + 20);
        doc.text(`Total Extent: ${parseFloat(data.summary.total_extent_ha || 0).toFixed(2)} Ha`, 10, finalY + 30);
        doc.text(`Overall Progress: ${data.summary.overall_progress_percent}%`, 10, finalY + 40);
        doc.text(`Court Cases: ${data.summary.total_court_cases}`, 10, finalY + 50);
        doc.text(`Compensation Type: ${data.plan_details?.compensation_type || 'N/A'}`, 10, finalY + 60);
        doc.text(`Total Owners: ${data.summary.total_owners || 0}`, 10, finalY + 70);
        doc.text(`Compensation Paid: Rs. ${parseFloat(data.summary.total_compensation_paid || 0).toLocaleString()}`, 10, finalY + 80);
        doc.text(`Interest Paid: Rs. ${parseFloat(data.summary.total_interest_paid || 0).toLocaleString()}`, 10, finalY + 90);
      }
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
                <th className="border border-gray-300 px-4 py-2 text-xs">NAME OF THE ROAD</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">ACQUIRED LOTS</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">COMPENSATION PAID (Rs.)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">COMPENSATION UNDER SEC 17 (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">DEVELOPMENT COST (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">COURT DEPOSIT (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">TOTAL COMPENSATION PAID (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">INTEREST PAID (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">WORKERS IN HECTARES PAID (Rs.Mn)</th>
                <th className="border border-gray-300 px-4 py-2 text-xs">OVERALL PROGRESS (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.financial_data.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2 text-sm font-medium">{item.name_of_road || 'N/A'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center">{item.acquired_lots || 0}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">Rs. {parseFloat(item.compensation_paid_lots_rs || 0).toLocaleString()}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">{(parseFloat(item.compensation_under_sec_17_rs_mn || 0) / 1000000).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">{(parseFloat(item.development_cost_rs_mn || 0) / 1000000).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">{(parseFloat(item.court_deposit_rs_mn || 0) / 1000000).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-green-600">{(parseFloat(item.compensation_paid_rs_mn || 0) / 1000000).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right font-semibold text-blue-600">{(parseFloat(item.interest_paid_rs_mn || 0) / 1000000).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-right">{parseFloat(item.workers_in_hectares || 0).toFixed(2)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-sm text-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      parseFloat(item.payment_progress_percentage || 0) >= 80 ? 'bg-green-100 text-green-800' :
                      parseFloat(item.payment_progress_percentage || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {parseFloat(item.payment_progress_percentage || 0).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        {data.summary && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Financial Progress Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-600">Total Lots</p>
                <p className="text-lg font-semibold">{data.summary.total_lots}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Final Compensation</p>
                <p className="text-lg font-semibold">Rs. {parseFloat(data.summary.total_compensation_allocated || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Compensation Paid</p>
                <p className="text-lg font-semibold text-green-600">Rs. {parseFloat(data.summary.total_compensation_paid || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Interest Paid</p>
                <p className="text-lg font-semibold text-blue-600">Rs. {parseFloat(data.summary.total_interest_paid || 0).toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Overall Progress</p>
                <p className={`text-lg font-semibold ${
                  parseFloat(data.summary.overall_payment_progress || 0) >= 80 ? 'text-green-600' :
                  parseFloat(data.summary.overall_payment_progress || 0) >= 50 ? 'text-yellow-600' :
                  'text-red-600'
                }`}>{data.summary.overall_payment_progress}%</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const PhysicalProgressDisplay = ({ data }) => {
    if (!data || !data.physical_progress_data) return <div>No progress data available</div>;

    return (
      <div className="space-y-6">
        {/* Header Info */}
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">
            Physical Progress Report
          </h3>
          {data.plan_details && (
            <div className="mt-2 text-sm text-green-700">
              <p>Plan: {data.plan_details.plan_identifier}</p>
              <p>Project: {data.plan_details.project_name}</p>
              {data.plan_details.divisional_secretary && (
                <p>Divisional Secretary: {data.plan_details.divisional_secretary}</p>
              )}
              <p>Report Period: {data.summary?.report_period || 'Physical Progress Report'}</p>
            </div>
          )}
          <p className="text-sm text-green-600 mt-2">Report Date: {data.report_date}</p>
        </div>

        {/* Progress Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Total Lots</h4>
            <p className="text-2xl font-bold text-blue-600">{data.summary?.total_lots || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Acquired Lots</h4>
            <p className="text-2xl font-bold text-green-600">{data.summary?.total_acquired_lots || 0}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Total Extent (Ha)</h4>
            <p className="text-2xl font-bold text-orange-600">{parseFloat(data.summary?.total_extent_ha || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h4 className="text-sm font-semibold text-gray-600 mb-1">Overall Progress</h4>
            <p className="text-2xl font-bold text-purple-600">{data.summary?.overall_progress_percent || 0}%</p>
          </div>
        </div>

        {/* Physical Progress Details Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-lg font-semibold text-gray-800">Physical Progress Details</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-green-500 text-white">
                <tr>
                  <th className="border border-gray-300 px-2 py-2 text-center">No.</th>
                  <th className="border border-gray-300 px-3 py-2">Area/Project Name</th>
                  <th className="border border-gray-300 px-3 py-2">Plan/Survey Number</th>
                  <th className="border border-gray-300 px-2 py-2">Total Extent (Ha)</th>
                  <th className="border border-gray-300 px-2 py-2">Total Lots</th>
                  <th className="border border-gray-300 px-2 py-2">Acquired Lots</th>
                  <th className="border border-gray-300 px-2 py-2">Total Owners</th>
                  <th className="border border-gray-300 px-2 py-2">Court Cases</th>
                  <th className="border border-gray-300 px-3 py-2">Compensation Type</th>
                  <th className="border border-gray-300 px-3 py-2">Compensation Paid (Rs.)</th>
                  <th className="border border-gray-300 px-3 py-2">Interest Paid (Rs.)</th>
                  <th className="border border-gray-300 px-2 py-2">Overall Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.physical_progress_data.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="border border-gray-300 px-2 py-2 text-center text-gray-600">{index + 1}</td>
                    <td className="border border-gray-300 px-3 py-2 font-medium">{item.area_name || 'N/A'}</td>
                    <td className="border border-gray-300 px-3 py-2">{item.plan_survey_number || 'N/A'}</td>
                    <td className="border border-gray-300 px-2 py-2 text-right">{parseFloat(item.total_extent_ha || 0).toFixed(2)}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{item.total_lots || 0}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <span className="text-green-600 font-semibold">{item.acquired_lots_count || 0}</span>
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">{item.total_owners || 0}</td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      {item.court_cases > 0 ? (
                        <span className="text-red-600 font-semibold">{item.court_cases}</span>
                      ) : (
                        <span className="text-gray-400">0</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        item.compensation_type === 'normal' ? 'bg-blue-100 text-blue-800' :
                        item.compensation_type === 'special committee decision' ? 'bg-purple-100 text-purple-800' :
                        item.compensation_type === 'larc/super larc' ? 'bg-orange-100 text-orange-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.compensation_type || 'N/A'}
                      </span>
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-green-600">
                      Rs. {parseFloat(item.total_compensation_paid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 text-right font-semibold text-blue-600">
                      Rs. {parseFloat(item.total_interest_paid || 0).toLocaleString('en-US', {minimumFractionDigits: 2})}
                    </td>
                    <td className="border border-gray-300 px-2 py-2 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        parseFloat(data.summary?.overall_progress_percent || 0) >= 80 ? 'bg-green-100 text-green-800' :
                        parseFloat(data.summary?.overall_progress_percent || 0) >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.summary?.overall_progress_percent || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Project Information</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Court Cases:</span>
                <span className="font-semibold text-red-600">{data.summary?.total_court_cases || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Owners:</span>
                <span className="font-semibold text-blue-600">{data.summary?.total_owners || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Compensation Type:</span>
                <span className={`font-semibold ${
                  data.plan_details?.compensation_type === 'normal' ? 'text-blue-600' :
                  data.plan_details?.compensation_type === 'special committee decision' ? 'text-purple-600' :
                  data.plan_details?.compensation_type === 'larc/super larc' ? 'text-orange-600' :
                  'text-gray-600'
                }`}>
                  {data.plan_details?.compensation_type || 'N/A'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Financial Summary</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Compensation Paid:</span>
                <span className="font-semibold text-green-600">Rs. {parseFloat(data.summary?.total_compensation_paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Interest Paid:</span>
                <span className="font-semibold text-blue-600">Rs. {parseFloat(data.summary?.total_interest_paid || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total Acquired:</span>
                <span className="font-semibold text-green-600">{data.summary?.total_acquired_lots || 0} lots</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Overall Progress</h4>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {data.summary?.overall_progress_percent || 0}%
              </div>
              <div className="text-sm text-gray-600">
                Project Progress Complete
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                <div 
                  className={`h-2 rounded-full transition-all duration-300 ${
                    parseFloat(data.summary?.overall_progress_percent || 0) >= 80 ? 'bg-green-600' :
                    parseFloat(data.summary?.overall_progress_percent || 0) >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${data.summary?.overall_progress_percent || 0}%` }}
                ></div>
              </div>
            </div>
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

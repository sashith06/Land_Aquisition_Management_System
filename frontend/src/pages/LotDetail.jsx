// src/pages/LotDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import Breadcrumb from "../components/Breadcrumb";
import CompensationDetails from "../components/CompensationDetails";

const LotDetail = () => {
  const { planId, lotId } = useParams();
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Determine user role - prioritize authenticated role over route-based detection
  const getCurrentUserRole = () => {
    // First try to get authenticated user role from token
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.role;
      }
    } catch (error) {
      console.error('Error getting authenticated user role:', error);
    }

    // Fallback to route-based detection
    const currentPath = window.location.pathname;
    if (currentPath.includes('/fo-dashboard')) return 'financial_officer';
    if (currentPath.includes('/pe-dashboard')) return 'project_engineer';
    if (currentPath.includes('/ce-dashboard')) return 'chief_engineer';
    return 'land_officer'; // Default role
  };

  const userRole = getCurrentUserRole();

  // Fetch plan data
  useEffect(() => {
    const fetchPlanData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/api/plans/${planId}`);
        setPlanData(response.data);
      } catch (error) {
        console.error('Error fetching plan data:', error);
        // If plan not found, we'll still show the planId as fallback
      } finally {
        setLoading(false);
      }
    };

    if (planId) {
      fetchPlanData();
    }
  }, [planId]);

  // Mock lot data - this should come from your actual data source
  const getLotDetails = () => {
    // Check if there's saved compensation data
    const savedCompensationData = JSON.parse(localStorage.getItem('compensationData') || '{}');
    const lotKey = `${planId}_${lotId}`;
    const compensationInfo = savedCompensationData[lotKey];

    return {
      id: lotId,
      owner: "John Doe",
      nic: "200127702072",
      mobile: "077-9504969",
      address: "1st mile post, Pituwela road, Elpitiya",
      status: lotDetails.status || "active",
      landArea: "2.5 acres",
      valuation: "Rs. 2,500,000",
      compensation: compensationInfo?.totalCompensation 
        ? `Rs. ${parseFloat(compensationInfo.totalCompensation).toLocaleString()}` 
        : "Rs. 2,200,000",
      lastUpdated: compensationInfo?.lastUpdated 
        ? new Date(compensationInfo.lastUpdated).toLocaleDateString()
        : "2024-01-15",
      compensationStatus: compensationInfo?.approvalStatus || 'pending_assessment',
      paymentStatus: compensationInfo?.paymentStatus || 'pending'
    };
  };

  const lotDetails = getLotDetails();

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb navigation */}
      <Breadcrumb items={generateBreadcrumbs({ 
        projectId: planData?.project_id, 
        projectName: planData?.project_name,
        planId: planId,
        planName: planData?.plan_identifier || planData?.plan_no,
        lotId: lotId
      })} />

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Lot {lotId} Details
          </h1>
        </div>
        <div className="flex space-x-3">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Edit Lot
          </button>
          <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors">
            Delete Lot
          </button>
        </div>
      </div>

      {/* Lot Details Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Owner Information */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Owner Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Owner Name</label>
              <p className="text-gray-800 font-medium">{lotDetails.owner}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">NIC Number</label>
              <p className="text-gray-800 font-medium">{lotDetails.nic}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Mobile Number</label>
              <p className="text-gray-800 font-medium">{lotDetails.mobile}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Address</label>
              <p className="text-gray-800 font-medium">{lotDetails.address}</p>
            </div>
          </div>
        </div>

        {/* Lot Information */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Lot Information</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Lot ID</label>
              <p className="text-gray-800 font-medium">{lotDetails.id}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Land Area</label>
              <p className="text-gray-800 font-medium">{lotDetails.landArea}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                lotDetails.status === 'active' ? 'bg-slate-200 text-slate-800' :
                lotDetails.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                'bg-blue-200 text-blue-800'
              }`}>
                {lotDetails.status}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Last Updated</label>
              <p className="text-gray-800 font-medium">{lotDetails.lastUpdated}</p>
            </div>
          </div>
        </div>

        {/* Valuation Details */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Valuation Details</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Property Valuation</label>
              <p className="text-gray-800 font-medium text-lg">{lotDetails.valuation}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Compensation Amount</label>
              <p className="text-gray-800 font-medium text-lg">{lotDetails.compensation}</p>
            </div>
            {userRole !== 'financial_officer' && (
              <div className="pt-3">
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  Update Valuation
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Compensation Summary - Visible for all users */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Compensation Summary</h2>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-gray-600">Current Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ml-2 ${
                lotDetails.compensationStatus === 'approved' ? 'bg-slate-200 text-slate-800' :
                lotDetails.compensationStatus === 'submitted' ? 'bg-blue-200 text-blue-800' :
                lotDetails.compensationStatus === 'rejected' ? 'bg-red-200 text-red-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {lotDetails.compensationStatus === 'pending_assessment' ? 'Assessment Pending' :
                 lotDetails.compensationStatus === 'draft' ? 'Draft' :
                 lotDetails.compensationStatus}
              </span>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Assessment Date</label>
              <p className="text-gray-800 font-medium">
                {lotDetails.compensationStatus === 'pending_assessment' ? 'Not assessed yet' : lotDetails.lastUpdated}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">Payment Status</label>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                lotDetails.paymentStatus === 'paid' ? 'bg-slate-200 text-slate-800' :
                lotDetails.paymentStatus === 'approved' ? 'bg-blue-200 text-blue-800' :
                lotDetails.paymentStatus === 'partial' ? 'bg-orange-200 text-orange-800' :
                'bg-yellow-200 text-yellow-800'
              }`}>
                {lotDetails.paymentStatus === 'pending' ? 'Pending Assessment' : lotDetails.paymentStatus}
              </span>
            </div>
            {userRole === 'financial_officer' ? (
              <div className="pt-3">
                <p className="text-sm text-blue-600 italic">
                  You can add detailed compensation information below
                </p>
              </div>
            ) : (
              <div className="pt-3">
                <p className="text-sm text-gray-500 italic">
                  Detailed compensation information managed by Financial Officer
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-slate-600 text-white py-2 rounded-lg hover:bg-slate-700 transition-colors">
              Generate Report
            </button>
            <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
              View Documents
            </button>
            <button className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition-colors">
              Contact Owner
            </button>
            <button className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors">
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Compensation Details Section - Only visible for Financial Officers */}
      {userRole === 'financial_officer' && (
        <div className="mt-8">
          <CompensationDetails 
            lotId={lotId} 
            planId={planId} 
            userRole={userRole} 
          />
        </div>
      )}

      {/* Additional Information */}
      <div className="mt-8 bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Additional Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Legal Status</h3>
            <p className="text-gray-600">Clear title, no pending disputes</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Survey Details</h3>
            <p className="text-gray-600">Survey completed on 2024-01-10</p>
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Payment Status</h3>
            <p className="text-gray-600">Compensation pending approval</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotDetail;

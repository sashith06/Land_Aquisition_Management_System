// src/pages/LotDetail.jsx
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const LotDetail = () => {
  const { planId, lotId } = useParams();
  const navigate = useNavigate();

  // Mock lot data - this should come from your actual data source
  const lotDetails = {
    id: lotId,
    owner: "John Doe",
    nic: "200127702072",
    mobile: "077-9504969",
    address: "1st mile post, Pituwela road, Elpitiya",
    status: "active",
    landArea: "2.5 acres",
    valuation: "Rs. 2,500,000",
    compensation: "Rs. 2,200,000",
    lastUpdated: "2024-01-15"
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Breadcrumb navigation */}
      <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
        <Link 
          to={
            window.location.pathname.includes('/pe-dashboard') ? "/pe-dashboard" :
            window.location.pathname.includes('/ce-dashboard') ? "/ce-dashboard" :
            window.location.pathname.includes('/fo-dashboard') ? "/fo-dashboard" :
            "/dashboard"
          } 
          className="hover:text-blue-600 transition-colors"
        >
          Dashboard
        </Link>
        <span>/</span>
        <Link 
          to={
            window.location.pathname.includes('/pe-dashboard') ? `/pe-dashboard/plan/${planId}/lots` :
            window.location.pathname.includes('/ce-dashboard') ? `/ce-dashboard/plan/${planId}/lots` :
            window.location.pathname.includes('/fo-dashboard') ? `/fo-dashboard/plan/${planId}/lots` :
            `/dashboard/plan/${planId}/lots`
          } 
          className="hover:text-blue-600 transition-colors"
        >
          Plan {planId} Lots
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-medium">Lot {lotId}</span>
      </nav>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate(
              window.location.pathname.includes('/pe-dashboard') ? `/pe-dashboard/plan/${planId}/lots` :
              window.location.pathname.includes('/ce-dashboard') ? `/ce-dashboard/plan/${planId}/lots` :
              window.location.pathname.includes('/fo-dashboard') ? `/fo-dashboard/plan/${planId}/lots` :
              `/dashboard/plan/${planId}/lots`
            )}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Lots</span>
          </button>
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
                lotDetails.status === 'active' ? 'bg-green-200 text-green-800' :
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
            <div className="pt-3">
              <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Update Valuation
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
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

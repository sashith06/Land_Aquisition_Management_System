// src/pages/LotsPage.jsx

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import Breadcrumb from "../components/Breadcrumb";
import ValuationDetails from "../components/LotValuationDetails";
import CompensationDetailsTab from "../components/CompensationDetailsTab";
import LandDetailsForm from "../components/LandDetailsForm";

const tabs = [
  "Owner Details",
  "Valuation Details",
  "Compensation Details",
  "Land Details",
  "Inquiries",
];

const LotsPage = () => {
  const { planId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Owner Details");
  const [search, setSearch] = useState("");
  const [lotsData, setLotsData] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ownerFields, setOwnerFields] = useState([{ name: '', nic: '', mobile: '', address: '', email: '' }]);
  const [lotNumber, setLotNumber] = useState("");
  const [lotStatus, setLotStatus] = useState("active");
  const [deletedLot, setDeletedLot] = useState(null);
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [landDetails, setLandDetails] = useState(null);
  const [landDetailsLoading, setLandDetailsLoading] = useState(false);

  // Determine user role based on current route
  const getCurrentUserRole = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/fo-dashboard')) return 'Financial Officer';
    if (currentPath.includes('/pe-dashboard')) return 'Project Engineer';
    if (currentPath.includes('/ce-dashboard')) return 'Chief Engineer';
    return 'Land Officer'; // Default role
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

  // Fetch lots data for the plan
  useEffect(() => {
    const fetchLotsData = async () => {
      try {
        const response = await api.get(`/api/lots/plan/${planId}`);
        console.log('Raw API response:', response.data); // Debug log
        
        // Transform backend data to match frontend format
        const transformedLots = response.data.map(lot => ({
          id: `L${String(lot.lot_no).padStart(3, '0')}`,
          backend_id: lot.id, // Store backend ID for API calls
          lot_no: lot.lot_no,
          extent_ha: lot.extent_ha,
          extent_perch: lot.extent_perch,
          land_type: lot.land_type || 'Private',
          status: 'active', // Default status
          owners: lot.owners || [], // Use actual owner data from backend
          created_by_name: lot.created_by_name || 'Unknown'
        }));
        
        console.log('Transformed lots:', transformedLots); // Debug log
        setLotsData(transformedLots);
      } catch (error) {
        console.error('Error fetching lots data:', error);
        // Keep empty array as fallback
        setLotsData([]);
      }
    };

    if (planId) {
      fetchLotsData();
    }
  }, [planId]);

  // Filter lots by search
  const filteredLots = lotsData.filter((lot) =>
    lot.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleLotClick = (lot) => {
    // Automatically select first owner if lot has owners
    const lotWithSelectedOwner = lot.owners && lot.owners.length > 0
      ? { ...lot, selectedOwnerIdx: 0 }
      : lot;
    setSelectedLot(lotWithSelectedOwner);

    // Reset form state when selecting a lot (hide create form)
    setShowCreateModal(false);
    setActiveTab("Owner Details");

    // Load land details when lot is selected and Land Details tab is active
    if (activeTab === "Land Details") {
      loadLandDetails(lot.backend_id || lot.id);
    }
  };

  // Load land details for selected lot
  const loadLandDetails = async (lotId) => {
    if (!lotId) return;
    
    try {
      setLandDetailsLoading(true);
      const response = await api.get(`/api/lots/${lotId}/land-details`);
      setLandDetails(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading land details:', error);
      }
      // If no land details exist (404), that's fine - we'll show empty form
      setLandDetails(null);
    } finally {
      setLandDetailsLoading(false);
    }
  };

  // Load land details when Land Details tab is selected
  useEffect(() => {
    if (activeTab === "Land Details" && selectedLot) {
      loadLandDetails(selectedLot.backend_id || selectedLot.id);
    }
  }, [activeTab, selectedLot]);

  // Handle saving land details
  const handleSaveLandDetails = (updatedLandDetails) => {
    setLandDetails(updatedLandDetails);
  };

  const handleBackToPlansProgress = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate('/pe-dashboard', { state: { returnToProject: true, planId: planId } });
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate('/ce-dashboard', { state: { returnToProject: true, planId: planId } });
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate('/fo-dashboard', { state: { returnToProject: true, planId: planId } });
    } else {
      navigate('/dashboard', { state: { returnToProject: true, planId: planId } });
    }
  };

  const handleAddOwner = () => setOwnerFields([...ownerFields, { name: '', nic: '', mobile: '', address: '', email: '' }]);

  const handleRemoveOwner = (idx) => setOwnerFields(ownerFields.filter((_, i) => i !== idx));

  const handleOwnerChange = (idx, field, value) => {
    const updated = ownerFields.map((owner, i) => i === idx ? { ...owner, [field]: value } : owner);
    setOwnerFields(updated);
  };

  const handleClearForm = () => {
    setOwnerFields([{ name: '', nic: '', mobile: '', address: '', email: '' }]);
    setSearch("");
    setSelectedLot(null);
    setActiveTab("Owner Details");
    setLotNumber("");
    setLotStatus("active");
  };

  // Auto-hide deleted lot banner after 5 seconds
  useEffect(() => {
    if (deletedLot) {
      const timer = setTimeout(() => setDeletedLot(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [deletedLot]);

  // Create or Edit Lot
  const handleSubmitLot = async () => {
    if (!lotNumber || lotNumber.trim() === '') {
      alert('Please enter a lot number');
      return;
    }

    try {
      console.log('Submitting lot with data:', { lotNumber, planId }); // Debug log
      
      if (!selectedLot) {
        // Create new lot
        // Create lot data (without owners - they'll be added separately)
        const lotData = {
          plan_id: planId,
          lot_no: lotNumber, // This should be the lot number entered by user
          extent_ha: 0, // Default value, can be updated later
          extent_perch: 0, // Default value, can be updated later
          land_type: 'Private'
        };

        console.log('Sending lot data to backend:', lotData); // Debug log

        const response = await api.post('/api/lots/create', lotData);
        const lotId = response.data.id;
        // Add owners to lot via backend
        let ownersAdded = [];
        for (const owner of ownerFields.filter(o => o.name.trim() && o.nic.trim())) {
          try {
            const ownerPayload = {
              nic: owner.nic || '',
              name: owner.name || '',
              address: owner.address || '',
              phone: owner.phone || owner.mobile || '',
              mobile: owner.mobile || owner.phone || '',
              email: owner.email || ''
            };
            await api.post(`/api/lots/${lotId}/owners`, ownerPayload);
            ownersAdded.push(owner);
          } catch (err) {
            if (err.response) {
              console.error('Error adding owner to lot:', {
                status: err.response.status,
                data: err.response.data,
                ownerPayload,
              });
              alert(`Error adding owner: ${err.response.data?.error || err.message}`);
            } else {
              console.error('Error adding owner to lot:', err);
              alert(`Error adding owner: ${err.message}`);
            }
          }
        }
        // Add the new lot to the local state
        const newLot = {
          id: `L${String(lotNumber).padStart(3, '0')}`,
          backend_id: lotId,
          lot_no: lotNumber,
          extent_ha: 0,
          extent_perch: 0,
          land_type: 'Private',
          status: 'active',
          owners: ownersAdded,
          created_by_name: response.data.created_by_name || 'You'
        };
        setLotsData([...lotsData, newLot]);
        setSelectedLot(newLot);
        alert('Lot created successfully!');

      } else {
        // Edit existing lot
        const lotData = {
          lot_no: parseInt(lotNumber.replace(/^L/i, '')), // Always send integer
          extent_ha: selectedLot.extent_ha || 0,
          extent_perch: selectedLot.extent_perch || 0,
          land_type: selectedLot.land_type || 'Private',
          status: lotStatus
        };

        await api.put(`/api/lots/${selectedLot.backend_id}`, lotData);

        // Add owners to lot via backend
        let ownersAdded = [];
        for (const owner of ownerFields.filter(o => o.name.trim() && o.nic.trim())) {
          try {
            const ownerPayload = {
              nic: owner.nic,
              name: owner.name,
              address: owner.address,
              phone: owner.mobile,
              email: owner.email || ''
            };
            await api.post(`/api/lots/${selectedLot.backend_id}/owners`, ownerPayload);
            ownersAdded.push(owner);
          } catch (err) {
            console.error('Error adding owner to lot:', err);
          }
        }

        // Update the local state
        const updatedLots = lotsData.map((lot) =>
          lot.id === selectedLot.id
            ? { 
                ...lot, 
                id: `L${String(lotNumber).padStart(3, '0')}`,
                lot_no: lotNumber,
                status: lotStatus, 
                owners: ownersAdded 
              }
            : lot
        );
        setLotsData(updatedLots);
        setSelectedLot({ 
          ...selectedLot,
          id: `L${String(lotNumber).padStart(3, '0')}`,
          lot_no: lotNumber,
          status: lotStatus, 
          owners: ownersAdded 
        });
        alert('Lot updated successfully!');
      }
      
      setShowCreateModal(false);
      handleClearForm();
    } catch (error) {
      console.error('Error saving lot:', error);
      console.error('Error response:', error.response?.data); // Debug log
      
      const errorMessage = error.response?.data?.error || 'Error saving lot. Please try again.';
      alert(errorMessage);
    }
  };

  const handleEditLot = () => {
    if (!selectedLot) return;

    // Transform owner data to match form format
    const transformedOwners = selectedLot.owners.map(owner => ({
      name: owner.name || '',
      nic: owner.nic || '',
      mobile: owner.mobile || owner.phone || '',
      address: owner.address || '',
      email: owner.email || ''
    }));

    setLotNumber(selectedLot.id.replace('L', ''));
    setLotStatus(selectedLot.status || 'active');
    setOwnerFields(transformedOwners.length > 0 ? transformedOwners : [{ name: '', nic: '', mobile: '', address: '', email: '' }]);
    setShowCreateModal(true);
  };

  const handleDeleteLot = async () => {
    if (!selectedLot) return;
    
    if (!confirm('Are you sure you want to delete this lot? This action cannot be undone.')) {
      return;
    }

    try {
      // Only call API if this lot has a backend_id (meaning it exists in database)
      if (selectedLot.backend_id) {
        await api.delete(`/api/lots/${selectedLot.backend_id}`);
      }
      
      setDeletedLot(selectedLot);
      const updatedLots = lotsData.filter((lot) => lot.id !== selectedLot.id);
      setLotsData(updatedLots);
      setSelectedLot(null);
      
      alert('Lot deleted successfully!');
    } catch (error) {
      console.error('Error deleting lot:', error);
      alert('Error deleting lot. Please try again.');
    }
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Plans & Progress", to: "#", onClick: handleBackToPlansProgress },
          { label: `Lots for Plan ${planData?.plan_number || planId}` }
        ]}
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span>Loading lots...</span>
          </div>
        ) : (
          `Lots for Plan ${planData?.plan_number || planId}`
        )}
      </h1>

      {/* Undo Deleted Lot */}
      {deletedLot && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded flex justify-between items-center">
          <span>Lot {deletedLot.id} deleted.</span>
          <button
            className="bg-yellow-600 text-white px-2 py-1 rounded hover:bg-yellow-700"
            onClick={() => {
              setLotsData([...lotsData, deletedLot]);
              setDeletedLot(null);
            }}
          >
            Undo
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Left Panel */}
        <div className="bg-slate-100 p-4 rounded-xl space-y-4 flex flex-col h-full">
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-left ${
                  activeTab === tab
                    ? "bg-slate-600 text-white"
                    : "bg-white text-gray-700 hover:bg-slate-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search lots..."
            className="w-full p-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <div className="grid grid-cols-4 gap-2 mb-4">
            {filteredLots.map((lot, i) => (
              <button
                key={lot.id}
                onClick={() => handleLotClick(lot)}
                className={`p-3 text-white font-bold rounded-lg transition-all hover:scale-105 ${
                  selectedLot?.id === lot.id
                    ? "bg-purple-600 ring-2 ring-purple-300"
                    : "bg-blue-500 hover:bg-blue-600"
                }`}
              >
                {lot.id.replace("L", "")}
              </button>
            ))}
          </div>

          {userRole !== 'Financial Officer' && (
            <div className="space-y-2">
              <button
                className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 w-full"
                onClick={() => { handleClearForm(); setShowCreateModal(true); }}
              >
                Create Lot
              </button>
              {showCreateModal && (
                <button
                  className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 w-full"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border">
          {showCreateModal ? (
            /* Inline Create/Edit Form */
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-800">
                  {selectedLot ? "Edit Lot Details" : "Create New Lot"}
                </h2>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-6">
                {/* Basic Lot Information */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    Lot Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Lot Number Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Lot Number *
                      </label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                        placeholder="e.g. L009"
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                        required
                      />
                    </div>

                    {/* Status Field */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Status
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white"
                        value={lotStatus}
                        onChange={(e) => setLotStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Owner Information Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      Owner Information
                    </h3>
                    <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {ownerFields.length} owner{ownerFields.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Owner Fields */}
                  <div className="space-y-4">
                    {ownerFields.map((owner, idx) => (
                      <div key={idx} className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <span className="text-blue-600 font-bold text-sm">{idx + 1}</span>
                            </div>
                            Owner Information
                          </h3>
                          {ownerFields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOwner(idx)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                              title="Remove owner"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Name Field */}
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="Enter owner's full name"
                              value={owner.name}
                              onChange={e => handleOwnerChange(idx, 'name', e.target.value)}
                              required
                            />
                          </div>

                          {/* NIC Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              NIC Number *
                            </label>
                            <input
                              type="text"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="123456789V"
                              value={owner.nic}
                              onChange={e => handleOwnerChange(idx, 'nic', e.target.value)}
                              required
                            />
                          </div>

                          {/* Mobile Field */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Mobile Number
                            </label>
                            <input
                              type="tel"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="+94 77 123 4567"
                              value={owner.mobile}
                              onChange={e => handleOwnerChange(idx, 'mobile', e.target.value)}
                            />
                          </div>

                          {/* Email Field */}
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Email Address
                            </label>
                            <input
                              type="email"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                              placeholder="owner@example.com"
                              value={owner.email || ''}
                              onChange={e => handleOwnerChange(idx, 'email', e.target.value)}
                            />
                          </div>

                          {/* Address Field */}
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Address
                            </label>
                            <textarea
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-vertical"
                              placeholder="Enter complete address"
                              rows="3"
                              value={owner.address}
                              onChange={e => handleOwnerChange(idx, 'address', e.target.value)}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Owner Button */}
                  <div className="flex justify-center pt-4">
                    <button
                      type="button"
                      onClick={handleAddOwner}
                      className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Add Another Owner
                    </button>
                  </div>
                </div>

                {/* Form Action Buttons */}
                <div className="flex gap-3 pt-4 border-t">
                  <button
                    type="button"
                    className="flex-1 bg-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 transition-colors font-medium"
                    onClick={handleSubmitLot}
                  >
                    {selectedLot ? "Save Changes" : "Create Lot"}
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-gray-400 text-white rounded-lg hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors font-medium"
                    onClick={() => setShowCreateModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors font-medium"
                    onClick={handleClearForm}
                  >
                    Clear All
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* Normal Tab Content */
            <>
              <h2 className="text-xl font-bold mb-4 text-gray-800">{activeTab}</h2>

          {activeTab === "Owner Details" && (
            <div className="space-y-3">
              {selectedLot ? (
                <div className="space-y-3">
                  {/* Lot Header Card - Compact */}
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 rounded-lg shadow-md">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-bold">{selectedLot.id}</h3>
                        <p className="text-blue-100 text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500 bg-opacity-30">
                            <div className={`w-1.5 h-1.5 rounded-full mr-1 ${selectedLot.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'}`}></div>
                            {selectedLot.status || 'Active'}
                          </span>
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-blue-100 text-xs">Owners</div>
                        <div className="text-xl font-bold">{selectedLot.owners?.length || 0}</div>
                      </div>
                    </div>
                  </div>

                  {/* Owners Section */}
                  {selectedLot.owners && selectedLot.owners.length > 0 ? (
                    <div className="space-y-3">
                      {/* Owner Selection Tabs - Compact */}
                      <div className="bg-white rounded-md p-3 shadow-sm border">
                        <h4 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
                          <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Select Owner
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedLot.owners.map((owner, idx) => (
                            <button
                              key={idx}
                              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                selectedLot.selectedOwnerIdx === idx
                                  ? 'bg-blue-600 text-white shadow-sm'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                              onClick={() => setSelectedLot({ ...selectedLot, selectedOwnerIdx: idx })}
                            >
                              <div className="flex items-center">
                                <div className={`w-2 h-2 rounded-full mr-1.5 ${
                                  selectedLot.selectedOwnerIdx === idx ? 'bg-white' : 'bg-blue-600'
                                }`}></div>
                                {idx + 1}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Selected Owner Details - Compact */}
                      {selectedLot.selectedOwnerIdx !== undefined && selectedLot.owners[selectedLot.selectedOwnerIdx] ? (
                        <div className="bg-white rounded-lg shadow-md border overflow-hidden">
                          <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-3">
                            <h4 className="text-lg font-bold flex items-center">
                              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                              Owner Details
                            </h4>
                          </div>
                          <div className="p-4 space-y-3">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              {/* Name */}
                              <div className="bg-gray-50 rounded-md p-3">
                                <div className="flex items-center mb-1">
                                  <svg className="w-4 h-4 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">Full Name</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {selectedLot.owners[selectedLot.selectedOwnerIdx].name || 'Not provided'}
                                </p>
                              </div>

                              {/* NIC */}
                              <div className="bg-gray-50 rounded-md p-3">
                                <div className="flex items-center mb-1">
                                  <svg className="w-4 h-4 text-purple-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">NIC Number</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800 font-mono">
                                  {selectedLot.owners[selectedLot.selectedOwnerIdx].nic || 'Not provided'}
                                </p>
                              </div>

                              {/* Mobile */}
                              <div className="bg-gray-50 rounded-md p-3">
                                <div className="flex items-center mb-1">
                                  <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">Mobile</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {selectedLot.owners[selectedLot.selectedOwnerIdx].phone || selectedLot.owners[selectedLot.selectedOwnerIdx].mobile || 'Not provided'}
                                </p>
                              </div>

                              {/* Email */}
                              <div className="bg-gray-50 rounded-md p-3">
                                <div className="flex items-center mb-1">
                                  <svg className="w-4 h-4 text-red-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-xs font-medium text-gray-600">Email</span>
                                </div>
                                <p className="text-sm font-semibold text-gray-800">
                                  {selectedLot.owners[selectedLot.selectedOwnerIdx].email || 'Not provided'}
                                </p>
                              </div>
                            </div>

                            {/* Address - Compact */}
                            <div className="bg-gray-50 rounded-md p-3">
                              <div className="flex items-center mb-1">
                                <svg className="w-4 h-4 text-orange-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                                <span className="text-xs font-medium text-gray-600">Address</span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 leading-relaxed">
                                {selectedLot.owners[selectedLot.selectedOwnerIdx].address || 'Not provided'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-center">
                          <svg className="w-8 h-8 text-yellow-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <h4 className="text-sm font-semibold text-yellow-800 mb-1">Select an Owner</h4>
                          <p className="text-xs text-yellow-700">Please select an owner from the tabs above.</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                      <svg className="w-10 h-10 text-red-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <h4 className="text-base font-bold text-red-800 mb-1">No Owners Found</h4>
                      <p className="text-sm text-red-700 mb-2">This lot doesn't have any owners.</p>
                      <p className="text-xs text-red-600">Owners may not have been added when the lot was created.</p>
                    </div>
                  )}

                  {/* Action Buttons - Compact */}
                  {userRole === 'Land Officer' && (
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={handleEditLot}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit Lot
                        </div>
                      </button>
                      <button
                        onClick={handleDeleteLot}
                        className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md hover:from-red-700 hover:to-red-800 transition-all duration-200 text-sm font-medium shadow-md hover:shadow-lg"
                      >
                        <div className="flex items-center justify-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">No Lot Selected</h3>
                  <p className="text-sm text-gray-500">Please select a lot from the left panel.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Valuation Details" && (
            <ValuationDetails 
              selectedLot={selectedLot} 
              planId={planId} 
              userRole={userRole} 
            />
          )}

          {activeTab === "Compensation Details" && (
            <CompensationDetailsTab 
              selectedLot={selectedLot} 
              planId={planId} 
              userRole={userRole} 
            />
          )}

          {activeTab === "Land Details" && (
            <div>
              {selectedLot ? (
                landDetailsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600">Loading land details...</span>
                    </div>
                  </div>
                ) : (
                  <LandDetailsForm
                    lotId={selectedLot.backend_id || selectedLot.id}
                    initialData={landDetails}
                    onSave={handleSaveLandDetails}
                  />
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Please select a lot to view land details</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Inquiries" && (
            <div className="text-center text-gray-500 py-8">
              <p>Inquiries will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotsPage;

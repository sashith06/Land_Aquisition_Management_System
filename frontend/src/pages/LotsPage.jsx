// src/pages/LotsPage.jsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import Breadcrumb from "../components/Breadcrumb";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
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
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [activeTab, setActiveTab] = useState("Owner Details");
  const [search, setSearch] = useState("");
  const [lotsData, setLotsData] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [ownerFields, setOwnerFields] = useState([{ name: '', nic: '', mobile: '', address: '' }]);
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
          status: lot.status || 'active', // Use actual status from database
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

  const handleAddOwner = () => setOwnerFields([...ownerFields, { name: '', nic: '', mobile: '', address: ''}]);

  const handleRemoveOwner = (idx) => setOwnerFields(ownerFields.filter((_, i) => i !== idx));

  const handleOwnerChange = (idx, field, value) => {
    const updated = ownerFields.map((owner, i) => i === idx ? { ...owner, [field]: value } : owner);
    setOwnerFields(updated);
  };

  const handleClearForm = () => {
    setOwnerFields([{ name: '', nic: '', mobile: '', address: '' }]);
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
        // Create lot data including owners
        const lotData = {
          plan_id: planId,
          lot_no: lotNumber, // This should be the lot number entered by user
          extent_ha: 0, // Default value, can be updated later
          extent_perch: 0, // Default value, can be updated later
          land_type: 'Private',
          status: lotStatus,
          owners: ownerFields.filter(owner => owner.name.trim() && owner.nic.trim()) // Only include owners with at least name and NIC
        };

        console.log('Sending lot data to backend:', lotData); // Debug log

        const response = await api.post('/api/lots/create', lotData);
        
        // Add the new lot to the local state
        const newLot = {
          id: `L${String(lotNumber).padStart(3, '0')}`,
          backend_id: response.data.id, // Store the backend ID
          lot_no: lotNumber,
          extent_ha: 0,
          extent_perch: 0,
          land_type: 'Private',
          status: lotStatus,
          owners: ownerFields,
          created_by_name: response.data.created_by_name || 'You'
        };
        
        setLotsData([...lotsData, newLot]);
        setSelectedLot(newLot);
        alert('Lot created successfully!');
      } else {
        // Edit existing lot
        const lotData = {
          lot_no: parseInt(lotNumber) || lotNumber.replace(/^L/i, ''), // Remove 'L' prefix if present
          extent_ha: selectedLot.extent_ha || 0,
          extent_perch: selectedLot.extent_perch || 0,
          land_type: selectedLot.land_type || 'Private',
          status: lotStatus,
          owners: ownerFields.filter(owner => owner.name.trim() && owner.nic.trim()) // Only include owners with at least name and NIC
        };

        await api.put(`/api/lots/${selectedLot.backend_id}`, lotData);
        
        // Update the local state
        const updatedLots = lotsData.map((lot) =>
          lot.id === selectedLot.id
            ? { 
                ...lot, 
                id: `L${String(lotNumber).padStart(3, '0')}`,
                lot_no: lotNumber,
                status: lotStatus, 
                owners: ownerFields 
              }
            : lot
        );
        setLotsData(updatedLots);
        setSelectedLot({ 
          ...selectedLot,
          id: `L${String(lotNumber).padStart(3, '0')}`,
          lot_no: lotNumber,
          status: lotStatus, 
          owners: ownerFields 
        });
        alert('Lot updated successfully!');
      }
      
      setShowCreateForm(false);
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
    setLotNumber(selectedLot.id);
    setLotStatus(selectedLot.status);
    setOwnerFields(selectedLot.owners);
    setShowCreateForm(true);
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
      <Breadcrumb items={generateBreadcrumbs()} />
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
            {filteredLots.map((lot) => (
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
            <button
              className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700 mt-auto"
              onClick={() => { handleClearForm(); setShowCreateForm(true); }}
            >
              Create Lot
            </button>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{activeTab}</h2>

          {activeTab === "Owner Details" && (
            <div className="space-y-6">
              {showCreateForm ? (
                /* Create/Edit Lot Form */
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-2xl border border-blue-200/50 shadow-lg">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-800">{selectedLot ? 'Edit Lot' : 'Create New Lot'}</h3>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Lot Number *</label>
                      <input
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                        placeholder="e.g. 001"
                        value={lotNumber}
                        onChange={(e) => setLotNumber(e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-semibold text-gray-700">Status</label>
                      <select
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                        value={lotStatus}
                        onChange={(e) => setLotStatus(e.target.value)}
                      >
                        <option value="active">Active</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                  </div>

                  {/* Owner Fields */}
                  <div className="mb-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-700">Add Owners (Optional)</h4>
                    </div>
                    <div className="space-y-4">
                      {ownerFields.map((owner, idx) => (
                        <div key={idx} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                          <div className="flex justify-between items-center mb-4">
                            <h5 className="font-semibold text-gray-800 flex items-center space-x-2">
                              <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">
                                {idx + 1}
                              </div>
                              <span>Owner {idx + 1}</span>
                            </h5>
                            {ownerFields.length > 1 && (
                              <button
                                type="button"
                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-105"
                                onClick={() => handleRemoveOwner(idx)}
                              >
                                Remove
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Name</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="Owner Name"
                                value={owner.name}
                                onChange={e => handleOwnerChange(idx, 'name', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">NIC</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="NIC"
                                value={owner.nic}
                                onChange={e => handleOwnerChange(idx, 'nic', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Mobile</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="Mobile"
                                value={owner.mobile}
                                onChange={e => handleOwnerChange(idx, 'mobile', e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="block text-sm font-semibold text-gray-700">Address</label>
                              <input
                                type="text"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm"
                                placeholder="Address"
                                value={owner.address}
                                onChange={e => handleOwnerChange(idx, 'address', e.target.value)}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:shadow-md transform hover:scale-105 flex items-center space-x-2"
                      onClick={handleAddOwner}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      <span>Add Owner</span>
                    </button>
                  </div>

                  <div className="flex gap-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                      onClick={handleSubmitLot}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{selectedLot ? 'Update Lot' : 'Create Lot'}</span>
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      onClick={() => { handleClearForm(); setShowCreateForm(false); }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                      onClick={handleClearForm}
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : selectedLot ? (
                /* Selected Lot Details */
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-2xl border border-emerald-200/50 shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-800">Lot {selectedLot.id}</h3>
                        <p className="text-gray-600">Land Acquisition Details</p>
                      </div>
                    </div>
                    {userRole !== 'Financial Officer' && (
                      <div className="flex gap-3">
                        <button
                          onClick={handleEditLot}
                          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={handleDeleteLot}
                          className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          <span>Delete</span>
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Lot Number</label>
                      <p className="text-gray-900 font-medium text-lg">{selectedLot.id}</p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                      <label className="block text-sm font-semibold text-gray-600 uppercase tracking-wide mb-2">Status</label>
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm font-semibold ${
                        selectedLot.status === 'active' ? 'bg-green-100 text-green-800' :
                        selectedLot.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {selectedLot.status}
                      </span>
                    </div>
                  </div>

                  {/* Owner Details Section */}
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      <h4 className="text-lg font-semibold text-gray-700">Owner Information</h4>
                    </div>

                    {selectedLot.owners && selectedLot.owners.length > 0 ? (
                      <div className="space-y-4">
                        <div className="flex gap-2 mb-4">
                          {selectedLot.owners.map((owner, idx) => (
                            <button
                              key={idx}
                              className={`px-4 py-2 rounded-xl font-semibold transition-all duration-200 ${
                                selectedLot.selectedOwnerIdx === idx
                                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg transform scale-105'
                                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:shadow-md'
                              }`}
                              onClick={() => setSelectedLot({ ...selectedLot, selectedOwnerIdx: idx })}
                            >
                              Owner {idx + 1}
                            </button>
                          ))}
                        </div>

                        {selectedLot.selectedOwnerIdx !== undefined && selectedLot.owners[selectedLot.selectedOwnerIdx] && (
                          <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Name</p>
                                <p className="text-gray-900 font-medium text-lg">{selectedLot.owners[selectedLot.selectedOwnerIdx].name}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">NIC</p>
                                <p className="text-gray-900 font-medium text-lg">{selectedLot.owners[selectedLot.selectedOwnerIdx].nic}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Mobile</p>
                                <p className="text-gray-900 font-medium text-lg">{selectedLot.owners[selectedLot.selectedOwnerIdx].phone || selectedLot.owners[selectedLot.selectedOwnerIdx].mobile || 'Not provided'}</p>
                              </div>
                              <div className="space-y-2">
                                <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</p>
                                <p className="text-gray-900 font-medium text-lg">{selectedLot.owners[selectedLot.selectedOwnerIdx].address || 'Not provided'}</p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <div>
                            <p className="text-yellow-800 font-medium">No owner information available</p>
                            <p className="text-yellow-700 text-sm mt-1">Owners may not have been added when the lot was created.</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                /* No lot selected */
                <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-12 rounded-2xl border border-gray-200/50 shadow-sm text-center">
                  <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <h3 className="text-xl font-semibold text-gray-600 mb-2">No Lot Selected</h3>
                  <p className="text-gray-500">Please select a lot from the left panel to view owner details and manage information.</p>
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
                    planData={planData}
                  />
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Please select a lot to view land details</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LotsPage;

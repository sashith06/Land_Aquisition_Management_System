// src/pages/LotsPage.jsx

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { MapPin, CheckCircle2, Clock, AlertCircle, TrendingUp, Users, DollarSign, FileText } from "lucide-react";
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
  "Progress",
];

// Component to show owner details with their individual documents
const OwnerDetailsWithDocuments = ({ owner, ownerIndex, totalOwners }) => {
  const [ownerDocuments, setOwnerDocuments] = useState({ id_card: null, bank_book: null });
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Fetch documents for this specific owner
  useEffect(() => {
    const fetchOwnerDocuments = async () => {
      if (!owner.nic) return;
      
      try {
        setDocumentsLoading(true);
        const response = await api.get(`/api/landowner/documents-by-nic/${owner.nic}`);
        console.log(`Documents for owner ${owner.name} (${owner.nic}):`, response.data);
        setOwnerDocuments(response.data.documents);
      } catch (error) {
        console.error(`Error fetching documents for owner ${owner.name}:`, error);
        setOwnerDocuments({ id_card: null, bank_book: null });
      } finally {
        setDocumentsLoading(false);
      }
    };

    fetchOwnerDocuments();
  }, [owner.nic]);

  return (
    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-gray-200/50 shadow-sm">
      {/* Owner Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {totalOwners > 1 ? `Owner ${ownerIndex + 1} - ${owner.name}` : owner.name}
          </h3>
        </div>
      </div>

      {/* Owner Basic Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Name</p>
          <p className="text-gray-900 font-medium text-lg">{owner.name}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">NIC</p>
          <p className="text-gray-900 font-medium text-lg">{owner.nic}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Mobile</p>
          <p className="text-gray-900 font-medium text-lg">{owner.phone || owner.mobile || 'Not provided'}</p>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Address</p>
          <p className="text-gray-900 font-medium text-lg">{owner.address || 'Not provided'}</p>
        </div>
      </div>

      {/* Documents Section for this Owner */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center space-x-2 mb-4">
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-lg font-semibold text-gray-700">Documents</h4>
        </div>

        {documentsLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-600 ml-2">Loading documents...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ID Card */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707v11a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-gray-900">ID Card</h5>
              </div>
              {ownerDocuments.id_card ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-800 text-sm font-medium">Document Uploaded</span>
                    </div>
                    <a
                      href={`http://localhost:5000/${ownerDocuments.id_card.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>File: {ownerDocuments.id_card.file_name}</p>
                    <p>Uploaded: {new Date(ownerDocuments.id_card.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-gray-600 text-sm">No ID card uploaded</span>
                  </div>
                </div>
              )}
            </div>

            {/* Bank Book */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h5 className="font-semibold text-gray-900">Bank Book</h5>
              </div>
              {ownerDocuments.bank_book ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-green-800 text-sm font-medium">Document Uploaded</span>
                    </div>
                    <a
                      href={`http://localhost:5000/${ownerDocuments.bank_book.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      View
                    </a>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>File: {ownerDocuments.bank_book.file_name}</p>
                    <p>Uploaded: {new Date(ownerDocuments.bank_book.uploaded_at).toLocaleDateString()}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <span className="text-gray-600 text-sm">No bank book uploaded</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

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
 const [inquiries, setInquiries] = useState([]);
 const [inquiriesLoading, setInquiriesLoading] = useState(false);
 const [showLandDetailsForm, setShowLandDetailsForm] = useState(false);
 const [lotProgress, setLotProgress] = useState(null);
 const [planProgress, setPlanProgress] = useState(null);
 const [progressLoading, setProgressLoading] = useState(false);



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

  // Load inquiries when Inquiries tab is selected
  useEffect(() => {
    if (activeTab === "Inquiries" && selectedLot) {
      fetchInquiries();
    }
  }, [activeTab, selectedLot]);

  // Load progress when Progress tab is selected
  useEffect(() => {
    if (activeTab === "Progress" && selectedLot) {
      fetchLotProgress();
    }
  }, [activeTab, selectedLot]);



  // Handle saving land details
  const handleSaveLandDetails = async (updatedLandDetails) => {
    try {
      // Close the form first
      setShowLandDetailsForm(false);
      
      // Reload the land details from the server to ensure we have the latest data
      if (selectedLot) {
        await loadLandDetails(selectedLot.backend_id || selectedLot.id);
      }
    } catch (error) {
      console.error('Error refreshing land details:', error);
      // If refresh fails, at least show the updated data we have
      setLandDetails(updatedLandDetails);
    }
  };

  // Handle deleting land details
  const handleDeleteLandDetails = async () => {
    if (!selectedLot) return;
    
    if (!confirm('Are you sure you want to delete the land details for this lot? This action cannot be undone.')) {
      return;
    }

    try {
      const lotId = selectedLot.backend_id || selectedLot.id;
      await api.delete(`/api/lots/${lotId}/land-details`);
      
      setLandDetails(null);
      alert('Land details deleted successfully!');
    } catch (error) {
      console.error('Error deleting land details:', error);
      alert('Error deleting land details. Please try again.');
    }
  };



  // Fetch inquiries for selected lot
  const fetchInquiries = async () => {
    if (!selectedLot) return;

    try {
      setInquiriesLoading(true);
      const response = await api.get(`/api/inquiries/lot/${selectedLot.backend_id || selectedLot.id}`);
      setInquiries(response.data);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
      setInquiries([]);
    } finally {
      setInquiriesLoading(false);
    }
  };

  // Fetch plan progress
  const fetchPlanProgress = async () => {
    try {
      const response = await api.get(`/api/progress/plan/${planId}`);
      setPlanProgress(response.data.data);
      console.log('Plan Progress Data:', response.data.data);
    } catch (error) {
      console.error('Error fetching plan progress:', error);
      setPlanProgress(null);
    }
  };

  // Fetch progress for selected lot
  const fetchLotProgress = async () => {
    if (!selectedLot) return;

    try {
      setProgressLoading(true);
      // Fetch both plan and lot progress
      await Promise.all([
        fetchPlanProgress(),
        (async () => {
          const lotId = selectedLot.backend_id || selectedLot.id;
          const response = await api.get(`/api/progress/plan/${planId}/lot/${lotId}`);
          setLotProgress(response.data.data);
        })()
      ]);
    } catch (error) {
      console.error('Error fetching progress:', error);
      setLotProgress(null);
      setPlanProgress(null);
    } finally {
      setProgressLoading(false);
    }
  };

  // Check for duplicate NICs in owner fields
  const checkDuplicateNICs = (owners) => {
    const nicCounts = {};
    const duplicates = [];
    
    owners.forEach((owner, index) => {
      if (owner.nic && owner.nic.trim()) {
        const nic = owner.nic.trim().toLowerCase();
        if (nicCounts[nic]) {
          nicCounts[nic].push(index);
        } else {
          nicCounts[nic] = [index];
        }
      }
    });
    
    Object.keys(nicCounts).forEach(nic => {
      if (nicCounts[nic].length > 1) {
        duplicates.push(...nicCounts[nic]);
      }
    });
    
    return duplicates;
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
    // Financial officers cannot create or edit lots
    if (userRole === 'financial_officer') {
      alert('Financial Officers are not allowed to create or edit lots. You can only manage valuation and compensation details.');
      return;
    }

    if (!lotNumber || lotNumber.trim() === '') {
      alert('Please enter a lot number');
      return;
    }

    // Check for duplicate NICs before submitting
    const validOwners = ownerFields.filter(owner => owner.name.trim() && owner.nic.trim());
    const duplicateIndices = checkDuplicateNICs(validOwners);
    if (duplicateIndices.length > 0) {
      alert('Error: One lot cannot have the same owner twice. Please check for duplicate NIC numbers and remove duplicates before saving.');
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
    // Financial officers cannot edit lots
    if (userRole === 'financial_officer') {
      alert('Financial Officers are not allowed to edit lot details. You can only manage valuation and compensation details.');
      return;
    }

    if (!selectedLot) return;
    setLotNumber(selectedLot.id);
    setLotStatus(selectedLot.status);
    setOwnerFields(selectedLot.owners);
    setShowCreateForm(true);
  };

  const handleDeleteLot = async () => {
    // Financial officers cannot delete lots
    if (userRole === 'financial_officer') {
      alert('Financial Officers are not allowed to delete lots. You can only manage valuation and compensation details.');
      return;
    }

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
      <Breadcrumb items={generateBreadcrumbs({ 
        projectId: planData?.project_id, 
        projectName: planData?.project_name,
        planId: planId,
        planName: planData?.plan_identifier || planData?.plan_no
      })} />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
            <span>Loading lots...</span>
          </div>
        ) : (
          `Lots for Plan No - ${planData?.plan_no || planData?.plan_identifier || planId}`
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

          {userRole !== 'financial_officer' && (
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
                    
                    {/* Duplicate owners warning */}
                    {checkDuplicateNICs(ownerFields).length > 0 && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">!</div>
                          <div>
                            <h5 className="text-red-800 font-semibold mb-1">Duplicate Owner Detected</h5>
                            <p className="text-red-700 text-sm">
                              One lot cannot have the same owner twice. Please remove duplicate owners with the same NIC number before saving.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
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
                                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:border-transparent transition-all duration-200 bg-white/80 backdrop-blur-sm shadow-sm ${
                                  checkDuplicateNICs(ownerFields).includes(idx) 
                                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                                    : 'border-gray-200 focus:ring-blue-500 focus:border-blue-500'
                                }`}
                                placeholder="NIC"
                                value={owner.nic}
                                onChange={e => handleOwnerChange(idx, 'nic', e.target.value)}
                              />
                              {checkDuplicateNICs(ownerFields).includes(idx) && (
                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                  <span className="w-3 h-3 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">!</span>
                                  This NIC is already used by another owner in this lot. One lot cannot have the same owner twice.
                                </p>
                              )}
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
                      className={`px-6 py-3 font-semibold rounded-xl transition-all duration-200 flex items-center space-x-2 ${
                        checkDuplicateNICs(ownerFields).length > 0
                          ? 'bg-gray-400 cursor-not-allowed text-white'
                          : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white hover:shadow-lg transform hover:scale-105'
                      }`}
                      onClick={handleSubmitLot}
                      disabled={checkDuplicateNICs(ownerFields).length > 0}
                      title={checkDuplicateNICs(ownerFields).length > 0 ? 'Please remove duplicate owners before saving' : ''}
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
                    {userRole !== 'financial_officer' && (
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
                      <div className="space-y-6">
                        {selectedLot.owners.map((owner, idx) => (
                          <OwnerDetailsWithDocuments 
                            key={`${owner.nic}-${idx}`}
                            owner={owner}
                            ownerIndex={idx}
                            totalOwners={selectedLot.owners.length}
                          />
                        ))}
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
              landDetails={landDetails}
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
                  <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-blue-600" />
                        <h2 className="text-xl font-semibold text-gray-800">Land Details</h2>
                      </div>
                      {landDetails && userRole !== 'financial_officer' && (
                        <div className="flex gap-3">
                          <button
                            onClick={() => setShowLandDetailsForm(true)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-200 hover:shadow-lg transform hover:scale-105 flex items-center space-x-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={handleDeleteLandDetails}
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

                    {showLandDetailsForm ? (
                      <LandDetailsForm
                        lotId={selectedLot.backend_id || selectedLot.id}
                        initialData={landDetails}
                        onSave={handleSaveLandDetails}
                        onCancel={() => setShowLandDetailsForm(false)}
                        planData={planData}
                      />
                    ) : landDetails ? (
                      <div className="space-y-6">
                        {/* Type of Land */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Type of Land
                          </label>
                          <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                            {landDetails.land_type || 'N/A'}
                          </div>
                        </div>

                        {/* Advance Tracing No */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Advance Tracing No
                          </label>
                          <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                            {landDetails.advance_tracing_no || 'N/A'}
                          </div>
                        </div>

                        {/* Size of The Lot */}
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h3 className="text-lg font-medium text-gray-800 mb-4">Size of The Lot</h3>
                          
                          {/* Advance Tracing Extent */}
                          <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Advance Tracing Extent
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">(ha)</label>
                                <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                                  {landDetails.advance_tracing_extent_ha || '0.0000'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Perch</label>
                                <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                                  {landDetails.advance_tracing_extent_perch || '0.0000'}
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Preliminary Plan */}
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Preliminary Plan
                            </label>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">(ha)</label>
                                <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                                  {landDetails.preliminary_plan_extent_ha || '0.0000'}
                                </div>
                              </div>
                              <div>
                                <label className="block text-xs text-gray-500 mb-1">Perch</label>
                                <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                                  {landDetails.preliminary_plan_extent_perch || '0.0000'}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <div className="mb-4">
                          <MapPin className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <h3 className="text-lg font-semibold text-gray-600 mb-2">No Land Details Found</h3>
                          <p className="text-gray-500 mb-6">Land details have not been added for this lot yet.</p>
                        </div>
                        {userRole !== 'financial_officer' && (
                          <button
                            onClick={() => setShowLandDetailsForm(true)}
                            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 mx-auto"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            <span>Add Land Details</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Please select a lot to view land details</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Inquiries" && (
            <div>
              {selectedLot ? (
                inquiriesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600">Loading inquiries...</span>
                    </div>
                  </div>
                ) : inquiries.length > 0 ? (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className={`p-4 border rounded-lg ${inquiry.is_read ? 'bg-gray-50 border-gray-200' : 'bg-white border-blue-200 shadow-sm'}`}>
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <p className="text-gray-800 mb-2">{inquiry.inquiry_text}</p>
                            <p className="text-xs text-gray-500">Created: {new Date(inquiry.created_at).toLocaleString()}</p>
                          </div>
                          {!inquiry.is_read && (
                            <button
                              onClick={async () => {
                                try {
                                  await api.put(`/api/inquiries/${inquiry.id}/read`);
                                  setInquiries(inquiries.map(i => i.id === inquiry.id ? { ...i, is_read: 1 } : i));
                                } catch (error) {
                                  console.error('Error marking as read:', error);
                                }
                              }}
                              className="ml-4 px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                            >
                              Mark as Read
                            </button>
                          )}
                        </div>
                        {inquiry.attachments && inquiry.attachments.length > 0 && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600 mb-2">Attachments:</p>
                            <div className="flex flex-wrap gap-2">
                              {inquiry.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={`http://localhost:5000/${att.file_path}`}
                                  download={att.file_name}
                                  className="inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded transition-colors"
                                >
                                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {att.file_name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <p>No inquiries found for this lot.</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Please select a lot to view inquiries.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "Progress" && (
            <div>
              {selectedLot ? (
                progressLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                      <span className="text-gray-600">Loading progress data...</span>
                    </div>
                  </div>
                ) : (lotProgress || planProgress) ? (
                  <div className="space-y-6">
                    {/* Plan Creation Progress Card */}
                    {planProgress && (
                      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-green-500 rounded-lg">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-xl font-bold text-gray-900">Plan Creation Progress</h2>
                              <p className="text-sm text-gray-600">Basic plan information and gazette details</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-3xl font-bold text-green-600">{planProgress.creation_progress}%</div>
                            <div className="text-sm text-gray-600">of 10% max</div>
                          </div>
                        </div>

                        {/* Plan Creation Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-white rounded-full h-3 shadow-inner">
                            <div
                              className="h-3 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all duration-700 ease-out"
                              style={{ width: `${(planProgress.creation_progress / 10) * 100}%` }}
                            ></div>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mt-1">
                            <span>Plan Creation</span>
                            <span>{planProgress.creation_progress}/10%</span>
                          </div>
                        </div>

                        {/* Progress Breakdown */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span>Plan No/Cadastral No (2%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span>Section 07 Gazette (3%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span>Section 38 Gazette (3%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span>Divisional Secretary (1%)</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            <span>Section 5 Gazette No (1%)</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Overall Progress Card */}
                    {lotProgress && (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200 shadow-md">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="p-3 bg-blue-500 rounded-lg">
                              <TrendingUp className="w-6 h-6 text-white" />
                            </div>
                            <div>
                              <h2 className="text-2xl font-bold text-gray-900">Lot Progress</h2>
                              <p className="text-sm text-gray-600">Lot {selectedLot.lot_no} - {lotProgress.total_owners || 0} owner(s)</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-4xl font-bold text-blue-600">{lotProgress.overall_percent}%</div>
                            <div className="text-sm text-gray-600">Complete</div>
                          </div>
                        </div>

                      {/* Progress Bar */}
                      <div className="mb-4">
                        <div className="w-full bg-white rounded-full h-4 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${lotProgress.overall_percent}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* Status Message */}
                      {lotProgress.status_message && (
                        <div className={`p-4 rounded-lg border ${
                          lotProgress.status_message === 'All sections complete'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-yellow-50 border-yellow-200'
                        }`}>
                          <div className="flex items-center space-x-2">
                            {lotProgress.status_message === 'All sections complete' ? (
                              <CheckCircle2 className="w-5 h-5 text-green-600" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-yellow-600" />
                            )}
                            <p className={`font-medium ${
                              lotProgress.status_message === 'All sections complete'
                                ? 'text-green-800'
                                : 'text-yellow-800'
                            }`}>
                              {lotProgress.status_message}
                            </p>
                          </div>
                        </div>
                      )}

                        {/* Last Completed Section */}
                        {lotProgress.last_completed_section && (
                          <div className="mt-4 flex items-center space-x-2 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>Last completed: <strong>{lotProgress.last_completed_section}</strong></span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Sections Progress */}
                    {lotProgress && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-gray-900 mb-4">Section-wise Progress</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {lotProgress.sections?.map((section, idx) => {
                          const getStatusColor = (status) => {
                            switch (status) {
                              case "complete":
                                return "border-green-500 bg-green-50";
                              case "partial":
                                return "border-yellow-500 bg-yellow-50";
                              case "not_started":
                                return "border-red-500 bg-red-50";
                              case "blocked":
                                return "border-gray-400 bg-gray-100";
                              default:
                                return "border-gray-300 bg-gray-50";
                            }
                          };

                          const getStatusIcon = (status) => {
                            switch (status) {
                              case "complete":
                                return <CheckCircle2 className="w-6 h-6 text-green-600" />;
                              case "partial":
                                return <Clock className="w-6 h-6 text-yellow-600" />;
                              case "not_started":
                                return <AlertCircle className="w-6 h-6 text-red-600" />;
                              case "blocked":
                                return <div className="w-6 h-6 text-gray-500 flex items-center justify-center">🔒</div>;
                              default:
                                return <AlertCircle className="w-6 h-6 text-gray-600" />;
                            }
                          };

                          const getSectionIcon = (sectionName) => {
                            switch (sectionName) {
                              case "Owner Details":
                                return <Users className="w-5 h-5" />;
                              case "Land Details":
                                return <MapPin className="w-5 h-5" />;
                              case "Valuation":
                                return <TrendingUp className="w-5 h-5" />;
                              case "Compensation":
                                return <DollarSign className="w-5 h-5" />;
                              default:
                                return <FileText className="w-5 h-5" />;
                            }
                          };

                          return (
                            <div
                              key={idx}
                              className={`border-2 rounded-xl p-5 shadow-sm hover:shadow-md transition-all ${getStatusColor(section.status)}`}
                            >
                              {/* Section Header */}
                              <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center space-x-3">
                                  <div className={`p-2 rounded-lg ${
                                    section.status === "complete" ? "bg-green-200" :
                                    section.status === "partial" ? "bg-yellow-200" :
                                    section.status === "blocked" ? "bg-gray-200" : "bg-red-200"
                                  }`}>
                                    {getSectionIcon(section.name)}
                                  </div>
                                  <h4 className="font-bold text-gray-900 text-lg">{section.name}</h4>
                                </div>
                                <div>
                                  {getStatusIcon(section.status)}
                                </div>
                              </div>

                              {/* Progress Percentage */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-gray-700 font-medium">Completion</span>
                                  <span className="font-bold text-gray-900 text-lg">
                                    {Math.round(section.completeness * 100)}%
                                  </span>
                                </div>
                                <div className="w-full bg-white rounded-full h-3 shadow-inner">
                                  <div
                                    className={`h-3 rounded-full transition-all duration-500 ${
                                      section.status === "complete"
                                        ? "bg-gradient-to-r from-green-400 to-green-600"
                                        : section.status === "partial"
                                        ? "bg-gradient-to-r from-yellow-400 to-yellow-600"
                                        : section.status === "blocked"
                                        ? "bg-gradient-to-r from-gray-400 to-gray-500"
                                        : "bg-gradient-to-r from-red-400 to-red-600"
                                    }`}
                                    style={{ width: `${section.completeness * 100}%` }}
                                  ></div>
                                </div>
                              </div>

                              {/* Missing Fields */}
                              {section.missing && section.missing.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                  <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-1" />
                                    Missing Fields:
                                  </p>
                                  <ul className="space-y-1">
                                    {section.missing.map((field, fieldIdx) => (
                                      <li
                                        key={fieldIdx}
                                        className="text-sm text-red-700 flex items-center font-medium"
                                      >
                                        <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
                                        {field}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Complete Badge */}
                              {section.status === "complete" && section.missing.length === 0 && (
                                <div className="mt-4 pt-4 border-t border-green-300">
                                  <div className="flex items-center text-green-700">
                                    <CheckCircle2 className="w-4 h-4 mr-2" />
                                    <span className="text-sm font-semibold">All fields complete</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-12">
                    <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">No Progress Data Available</h3>
                    <p className="text-gray-600">Unable to load progress information for this lot.</p>
                  </div>
                )
              ) : (
                <div className="text-center text-gray-500 py-12">
                  <TrendingUp className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Lot Selected</h3>
                  <p className="text-gray-600">Please select a lot to view progress tracking.</p>
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

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Upload,
  Send,
  User,
  Mail,
  CreditCard,
  FileText,
  MessageSquare,
  X,
  Paperclip,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  DollarSign,
} from "lucide-react";
import Navigation from "../../../components/Navigation";
import api from "../../../api";

const NAVBAR_HEIGHT = "64px"; // define navbar height
const BACKEND_URL = 'http://localhost:5000';


function LODashboard() {
  const navigate = useNavigate();
  const [selectedLot, setSelectedLot] = useState(null);
  const [inquiryType, setInquiryType] = useState("general");
  const [inquiryText, setInquiryText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [bankBookFile, setBankBookFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [landownerData, setLandownerData] = useState(null);
  const [lotsData, setLotsData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inquiryLoading, setInquiryLoading] = useState(false);
  const [inquiryMessage, setInquiryMessage] = useState('');
  const [myInquiries, setMyInquiries] = useState([]);
  const [myInquiriesLoading, setMyInquiriesLoading] = useState(false);
  const [documents, setDocuments] = useState({ id_card: null, bank_book: null });
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [lotProgressData, setLotProgressData] = useState({});
  const [progressLoading, setProgressLoading] = useState(false);

  useEffect(() => {
    fetchLandownerData();
  }, []);

  const fetchLandownerData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/landowner');
        return;
      }

      const config = {
        headers: { Authorization: `Bearer ${token}` }
      };

      // Fetch landowner profile
      const profileRes = await axios.get(`${BACKEND_URL}/api/landowner/profile`, config);
      setLandownerData(profileRes.data.landowner);

      // Fetch landowner lots
      const lotsRes = await axios.get(`${BACKEND_URL}/api/landowner/lots`, config);
      setLotsData(lotsRes.data.data);

      // Set first lot as selected if available
      const projects = Object.keys(lotsRes.data.data);
      if (projects.length > 0) {
        const firstProject = projects[0];
        const plans = Object.keys(lotsRes.data.data[firstProject]);
        if (plans.length > 0) {
          const firstPlan = plans[0];
          const firstLot = lotsRes.data.data[firstProject][firstPlan][0];
          setSelectedLot({
            project: firstProject,
            plan: firstPlan,
            lot: firstLot
          });
        }
      }

      // Fetch my inquiries
      await fetchMyInquiries();

      // Fetch documents
      await fetchDocuments();

    } catch (err) {
      console.error('Error fetching landowner data:', err);
      setError('Failed to load landowner data');
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/landowner');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get progress data for a specific lot
  const getLotProgressData = (projectName, planName, lotId) => {
    const key = `${projectName}-${planName}-${lotId}`;
    return lotProgressData[key] || null;
  };

  // Fetch progress data when lots data is available
  useEffect(() => {
    if (lotsData && Object.keys(lotsData).length > 0 && !loading) {
      fetchAllLotsProgress();
    }
  }, [lotsData, loading]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileUpload = (e) => {
    setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
  };

  const handleBankBookUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', 'bank_book');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/landowner/upload-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setBankBookFile(file);
      alert('Bank book uploaded successfully!');
      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error uploading bank book:', error);
      alert('Failed to upload bank book. Please try again.');
    }
  };

  const handleIdCardUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('document', file);
    formData.append('document_type', 'id_card');

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`${BACKEND_URL}/api/landowner/upload-document`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIdCardFile(file);
      alert('ID card uploaded successfully!');
      fetchDocuments(); // Refresh documents
    } catch (error) {
      console.error('Error uploading ID card:', error);
      alert('Failed to upload ID card. Please try again.');
    }
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleInquirySubmit = async () => {
    if (!inquiryText.trim()) {
      alert("Please enter your inquiry message");
      return;
    }
    if (!selectedLot) {
      alert("Please select a lot for the inquiry");
      return;
    }

    setInquiryLoading(true);
    setInquiryMessage('');

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('lot_id', selectedLot.lot.lotId);
      formData.append('inquiry_text', inquiryText);

      attachedFiles.forEach((file, index) => {
        formData.append('files', file);
      });

      const response = await axios.post(`${BACKEND_URL}/api/inquiries/create`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      setInquiryMessage('Inquiry submitted successfully!');
      setInquiryText("");
      setAttachedFiles([]);
      
      // Refresh my inquiries after submitting
      fetchMyInquiries();
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      setInquiryMessage('Failed to submit inquiry. Please try again.');
    } finally {
      setInquiryLoading(false);
    }
  };

  // Fetch my inquiries
  const fetchMyInquiries = async () => {
    try {
      setMyInquiriesLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/inquiries/my`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMyInquiries(response.data);
    } catch (error) {
      console.error('Error fetching my inquiries:', error);
    } finally {
      setMyInquiriesLoading(false);
    }
  };

  // Fetch documents
  const fetchDocuments = async () => {
    try {
      setDocumentsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/landowner/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch progress for a specific lot
  const fetchLotProgress = async (planId, lotId) => {
    try {
      const response = await api.get(`/api/progress/plan/${planId}/lot/${lotId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lot progress:', error);
      return null;
    }
  };

  // Fetch progress for all lots
  const fetchAllLotsProgress = async () => {
    if (!lotsData || Object.keys(lotsData).length === 0) return;

    try {
      setProgressLoading(true);
      const progressPromises = [];

      // Create promises for all lots
      Object.entries(lotsData).forEach(([projectName, plans]) => {
        Object.entries(plans).forEach(([planName, lots]) => {
          lots.forEach((lot) => {
            const promise = fetchLotProgress(lot.planId, lot.lotId).then(progressData => ({
              key: `${projectName}-${planName}-${lot.lotId}`,
              data: progressData
            }));
            progressPromises.push(promise);
          });
        });
      });

      // Wait for all progress data to be fetched
      const progressResults = await Promise.all(progressPromises);
      
      // Create progress data object
      const progressObj = {};
      progressResults.forEach(result => {
        if (result.data) {
          progressObj[result.key] = result.data;
        }
      });

      setLotProgressData(progressObj);
    } catch (error) {
      console.error('Error fetching all lots progress:', error);
    } finally {
      setProgressLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-orange-500 mx-auto"></div>
          <p className="mt-6 text-gray-700 text-lg font-semibold">Loading your land information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-6 text-lg font-semibold">{error}</p>
          <button
            onClick={fetchLandownerData}
            className="bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 font-bold text-base transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <header
        className="fixed top-0 left-0 right-0 bg-white shadow z-20 flex items-center"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <Navigation />
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-3 sm:p-6" style={{ paddingTop: '80px' }}>
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 mt-4">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 tracking-tight">
              Welcome back, {landownerData?.name || 'Landowner'}
            </h1>
            <p className="text-sm sm:text-base lg:text-lg text-gray-600 font-medium">Track your land acquisition process</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT SIDE */}
            <div className="lg:col-span-7 xl:col-span-8 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                {Object.entries(lotsData).map(([projectName, plans]) =>
                  Object.entries(plans).map(([planName, lots]) =>
                    lots.map((lot, index) => (
                      <div
                        key={`${projectName}-${planName}-${lot.lotId}`}
                        className={`bg-white p-4 rounded-xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                          selectedLot?.lot?.lotId === lot.lotId ? 'border-orange-500 bg-orange-50' : 'border-amber-500'
                        }`}
                        onClick={() => setSelectedLot({ project: projectName, plan: planName, lot })}
                      >
                        <h2 className="text-lg font-bold mb-2 text-gray-900 tracking-tight">
                          {projectName}
                        </h2>
                        <p className="text-gray-600 text-sm mb-2 font-medium">{planName}</p>
                        <p className="text-xl font-bold text-gray-900 mb-1">Lot No: {lot.lotNo}</p>
                        <p className="text-sm text-gray-600 mt-2 font-medium">
                          Extent: {lot.advanceTracingExtentHa || lot.extentHa} ha {lot.advanceTracingExtentPerch || lot.extentPerch} perch
                        </p>
                        
                        {/* Progress indicator for lot card */}
                        {(() => {
                          const progressData = getLotProgressData(projectName, planName, lot.lotId);
                          if (progressData) {
                            return (
                              <div className="mt-3">
                                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                  <span>Progress</span>
                                  <span className="font-semibold">{progressData.overall_percent}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-gradient-to-r from-blue-400 to-indigo-500 h-1.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progressData.overall_percent}%` }}
                                  ></div>
                                </div>
                              </div>
                            );
                          }
                          return progressLoading ? (
                            <div className="mt-3 flex items-center justify-center">
                              <div className="animate-spin rounded-full h-3 w-3 border border-gray-300 border-t-blue-500"></div>
                              <span className="ml-1 text-xs text-gray-500">Loading...</span>
                            </div>
                          ) : null;
                        })()}
                        
                        {selectedLot?.lot?.lotId === lot.lotId && (
                          <div className="mt-2 text-orange-600 text-sm font-semibold">✓ Selected</div>
                        )}
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Lot Info & Progress */}
              {selectedLot && (
                <div className="bg-white p-4 rounded-xl shadow-lg border border-dashed border-gray-300">
                  <h2 className="text-lg font-bold mb-2 text-gray-900 tracking-tight">
                    {selectedLot.project}
                  </h2>
                  <p className="text-gray-600 text-sm mb-2 font-medium">{selectedLot.plan}</p>
                  <p className="text-xl font-bold text-gray-900 mb-3 tracking-tight">Lot No: {selectedLot.lot.lotNo}</p>

                  {/* Enhanced Progress Section */}
                  {(() => {
                    const progressData = getLotProgressData(selectedLot.project, selectedLot.plan, selectedLot.lot.lotId);
                    if (progressLoading) {
                      return (
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                            <span className="ml-2 text-gray-600">Loading progress...</span>
                          </div>
                        </div>
                      );
                    }
                    
                    if (!progressData) {
                      return (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                          <div className="bg-gradient-to-r from-gray-400 to-gray-500 h-2 rounded-full w-0"></div>
                        </div>
                      );
                    }

                    return (
                      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 mb-4 border border-blue-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <TrendingUp className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-gray-900">Progress Status</h3>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">{progressData.overall_percent}%</div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="w-full bg-white rounded-full h-3 mb-3 shadow-inner">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${progressData.overall_percent}%` }}
                          ></div>
                        </div>
                        
                        
                      </div>
                    );
                  })()}

                  <div className="bg-white p-4 rounded-xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                    <h1 className="text-lg font-bold text-gray-900 mb-4 tracking-tight">
                      Lot Information
                    </h1>

                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Lot Number:</span>
                        <span className="text-gray-900 font-bold text-sm">{selectedLot.lot.lotNo}</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Extent:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.advanceTracingExtentHa || selectedLot.lot.extentHa} ha {selectedLot.lot.advanceTracingExtentPerch || selectedLot.lot.extentPerch} perch
                        </span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Land Type:</span>
                        <span className="text-gray-900 font-bold text-sm">{selectedLot.lot.landType}</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Ownership:</span>
                        <span className="text-gray-900 font-bold text-sm">{selectedLot.lot.ownershipPercentage}%</span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Valuation:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.valuationAmount ? `Rs. ${selectedLot.lot.valuationAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Full Compensation:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.fullCompensationAmount ? `Rs. ${selectedLot.lot.fullCompensationAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Paid Compensation:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.paidCompensationAmount ? `Rs. ${selectedLot.lot.paidCompensationAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between items-center border-b pb-2">
                        <span className="font-semibold text-gray-600 text-xs">Interest:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.interestAmount ? `Rs. ${selectedLot.lot.interestAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-semibold text-gray-600">Status:</span>
                        <span className={`px-3 py-1 rounded text-sm font-semibold ${
                          selectedLot.lot.compensationStatus === 'completed' ? 'bg-green-100 text-green-800' :
                          selectedLot.lot.compensationStatus === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {selectedLot.lot.compensationStatus || 'Pending'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              {/* Profile Information */}
              <div className="bg-white p-4 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 space-y-4">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="p-2 bg-indigo-100 rounded-lg mr-3">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 tracking-tight">
                      Profile Information
                    </h2>
                  </div>



                  {/* Profile Information List */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <User className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">Name</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{landownerData?.name || 'N/A'}</span>
                      </li>
                      <li className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">NIC</span>
                        </div>
                        <span className="text-sm font-mono font-bold text-gray-900">{landownerData?.nic || 'N/A'}</span>
                      </li>
                      <li className="flex items-center justify-between py-2 border-b border-gray-200 last:border-b-0">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">Mobile</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{landownerData?.mobile || 'N/A'}</span>
                      </li>
                      <li className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">Address</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900 text-right max-w-48 break-words">{landownerData?.address || 'N/A'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bank Book & ID Card */}
                  <div className="space-y-4 mb-6">
                    {/* Bank Book */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          <CreditCard className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">Bank Book Upload</h3>
                      </div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-blue-800 font-semibold mb-1">📝 Instructions:</p>
                        <ul className="text-xs text-blue-700 space-y-1">
                          <li>• Upload a clear photo or scan of your bank book first page</li>
                          <li>• Accepted formats: JPG, PNG, PDF</li>
                          <li>• This is required for payment processing</li>
                        </ul>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleBankBookUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.pdf"
                          id="bankBookUpload"
                        />
                        <label
                          htmlFor="bankBookUpload"
                          className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-emerald-50 to-emerald-100 border-2 border-dashed border-emerald-300 rounded-lg cursor-pointer hover:from-emerald-100 hover:to-emerald-200 hover:border-emerald-400 transition-all duration-200"
                        >
                          <Upload className="w-4 h-4 text-emerald-600 mr-2" />
                          <span className="text-sm font-semibold text-emerald-700">
                            Click to upload Bank Book
                          </span>
                        </label>
                      </div>
                      {documents.bank_book ? (
                        <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded">
                          <div className="flex items-center">
                            <CreditCard className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-800">Bank Book Uploaded</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`${BACKEND_URL}/${documents.bank_book.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </a>
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.delete(`${BACKEND_URL}/api/landowner/documents/bank_book`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchDocuments();
                                  alert('Bank book deleted successfully!');
                                } catch (error) {
                                  console.error('Error deleting bank book:', error);
                                  alert('Failed to delete bank book.');
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : bankBookFile && (
                        <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>{bankBookFile.name}</span>
                          <button
                            onClick={() => setBankBookFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* ID Card */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-2">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <FileText className="h-4 w-4 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">ID Card Upload</h3>
                      </div>
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-3">
                        <p className="text-xs text-amber-800 font-semibold mb-1">📝 Instructions:</p>
                        <ul className="text-xs text-amber-700 space-y-1">
                          <li>• Upload both sides of your National ID Card</li>
                          <li>• Make sure text is clearly readable</li>
                          <li>• Required for identity verification</li>
                        </ul>
                      </div>

                      <div className="relative">
                        <input
                          type="file"
                          onChange={handleIdCardUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          accept=".jpg,.jpeg,.png,.pdf"
                          id="idCardUpload"
                        />
                        <label
                          htmlFor="idCardUpload"
                          className="flex items-center justify-center w-full h-12 bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-dashed border-orange-300 rounded-lg cursor-pointer hover:from-orange-100 hover:to-orange-200 hover:border-orange-400 transition-all duration-200"
                        >
                          <Upload className="w-4 h-4 text-orange-600 mr-2" />
                          <span className="text-sm font-semibold text-orange-700">
                            Click to upload ID Card
                          </span>
                        </label>
                      </div>
                      {documents.id_card ? (
                        <div className="mt-2 flex items-center justify-between bg-green-50 border border-green-200 p-2 rounded">
                          <div className="flex items-center">
                            <FileText className="h-4 w-4 text-green-600 mr-2" />
                            <span className="text-green-800">ID Card Uploaded</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <a
                              href={`${BACKEND_URL}/${documents.id_card.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                              View
                            </a>
                            <button
                              onClick={async () => {
                                try {
                                  const token = localStorage.getItem('token');
                                  await axios.delete(`${BACKEND_URL}/api/landowner/documents/id_card`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                  });
                                  fetchDocuments();
                                  alert('ID card deleted successfully!');
                                } catch (error) {
                                  console.error('Error deleting ID card:', error);
                                  alert('Failed to delete ID card.');
                                }
                              }}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ) : idCardFile && (
                        <div className="mt-2 flex items-center justify-between bg-gray-100 p-2 rounded">
                          <span>{idCardFile.name}</span>
                          <button
                            onClick={() => setIdCardFile(null)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* My Inquiries Section */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <MessageSquare className="w-4 h-4 text-gray-600" />
                      <h4 className="text-sm font-bold text-gray-900 tracking-tight">My Inquiries</h4>
                    </div>

                    {myInquiriesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-600 ml-2">Loading inquiries...</span>
                      </div>
                    ) : myInquiries.length > 0 ? (
                      <div className="space-y-2 max-h-48 overflow-y-auto">
                        {myInquiries.map((inquiry) => (
                          <div key={inquiry.id} className={`p-3 border rounded-lg ${inquiry.is_read ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex justify-between items-start mb-1">
                              <div className="flex-1 pr-2">
                                <p className="text-xs text-gray-800 mb-1 truncate">{inquiry.inquiry_text}</p>
                                <p className="text-xs text-gray-600 font-medium">{inquiry.lot_info}</p>
                                <p className="text-xs text-gray-500">Submitted: {new Date(inquiry.created_at).toLocaleDateString()}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-semibold rounded-full flex-shrink-0 ${inquiry.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {inquiry.is_read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                            {inquiry.attachments && inquiry.attachments.length > 0 && (
                              <div className="mt-2">
                                <p className="text-sm text-gray-600 mb-2 font-medium">Attachments:</p>
                                <div className="flex flex-wrap gap-2">
                                  {inquiry.attachments.map((att) => (
                                    <a
                                      key={att.id}
                                      href={`http://localhost:5000/${att.file_path}`}
                                      download={att.file_name}
                                      className="inline-flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium rounded transition-colors"
                                    >
                                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                      <div className="text-center text-gray-500 py-4">
                        <p className="text-sm">No inquiries submitted yet.</p>
                      </div>
                    )}
                  </div>


                </div>
              </div>
            </div>
          </div>

          {/* Submit Inquiry Section - Horizontal */}
          <div className="mt-8 lg:col-span-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-xl mr-4">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                  Submit an Inquiry
                </h2>
              </div>

              {/* Inquiry Instructions */}
              <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
                <h4 className="text-sm font-bold text-indigo-900 mb-3">💡 How to Submit an Inquiry:</h4>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 text-sm text-indigo-800">
                  <div><strong>Step 1:</strong> Select which lot you want to ask about</div>
                  <div><strong>Step 2:</strong> Choose inquiry type (General questions or Payment related)</div>
                  <div><strong>Step 3:</strong> Write your question clearly</div>
                  <div><strong>Step 4:</strong> Attach any relevant documents (optional)</div>
                  <div><strong>Step 5:</strong> Click "Send Inquiry" button</div>
                </div>
              </div>

              {/* Horizontal Form Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Lot Selection */}
                <div>
                  <span className="block text-sm font-bold text-gray-900 mb-4">Select Lot for Inquiry:</span>
                  <div className="space-y-3 max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-4">
                    {Object.entries(lotsData).map(([projectName, plans]) =>
                      Object.entries(plans).map(([planName, lots]) =>
                        lots.map((lot) => (
                          <label key={lot.lotId} className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="radio"
                              name="selectedLot"
                              value={lot.lotId}
                              checked={selectedLot?.lot?.lotId === lot.lotId}
                              onChange={() => setSelectedLot({ project: projectName, plan: planName, lot })}
                              className="accent-orange-600 w-4 h-4"
                            />
                            <span className="text-sm font-semibold text-gray-800">
                              Lot {lot.lotNo} - {projectName} ({planName})
                            </span>
                          </label>
                        ))
                      )
                    )}
                  </div>
                  {selectedLot && (
                    <div className="mt-3 text-sm text-gray-600 font-medium bg-orange-50 p-3 rounded flex items-center gap-2">
                      <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                      </div>
                      <span>Lot {selectedLot.lot.lotNo} - {selectedLot.project} ({selectedLot.plan})</span>
                    </div>
                  )}
                </div>

                {/* Middle Column - Inquiry Type & Question */}
                <div>
                  {/* Inquiry Type */}
                  <div className="mb-6">
                    <span className="block text-sm font-bold text-gray-900 mb-4">Inquiry Type:</span>
                    <div className="flex gap-6 bg-gray-50 rounded-lg p-4">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="general"
                          checked={inquiryType === "general"}
                          onChange={() => setInquiryType("general")}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-gray-800">General</span>
                      </label>
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="payment"
                          checked={inquiryType === "payment"}
                          onChange={() => setInquiryType("payment")}
                          className="accent-blue-600 w-4 h-4"
                        />
                        <span className="text-sm font-semibold text-gray-800">Payment</span>
                      </label>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Selected: <span className="font-bold capitalize text-gray-900">{inquiryType}</span>
                    </div>
                  </div>

                  {/* Question */}
                  <div>
                    <label className="block mb-3 font-bold text-gray-900 text-sm">
                      {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry for Lot {selectedLot?.lot?.lotNo || 'N/A'}
                    </label>
                    <textarea
                      rows={4}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-4 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium"
                      placeholder={`Write your ${inquiryType} inquiry about Lot ${selectedLot?.lot?.lotNo || 'N/A'} here...`}
                    />
                  </div>
                </div>

                {/* Right Column - File Upload & Submit */}
                <div>
                  {/* File Upload */}
                  <div className="mb-6">
                    <label className="block mb-3 font-bold text-gray-900 text-sm">
                      Attach Files
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        id="inquiryFilesUpload"
                      />
                      <label
                        htmlFor="inquiryFilesUpload"
                        className="flex items-center justify-center w-full h-20 bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:from-blue-100 hover:to-indigo-200 hover:border-blue-400 transition-all duration-200"
                      >
                        <div className="text-center">
                          <Paperclip className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                          <span className="text-sm font-semibold text-blue-700 block">
                            Click to attach files
                          </span>
                          <span className="text-xs text-blue-600">
                            You can select multiple files
                          </span>
                        </div>
                      </label>
                    </div>
                    {attachedFiles.length > 0 && (
                      <ul className="mt-3 space-y-2">
                        {attachedFiles.map((file, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between bg-gray-100 p-3 rounded"
                          >
                            <span className="text-sm">{file.name}</span>
                            <button
                              onClick={() => removeAttachedFile(idx)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      onClick={handleInquirySubmit}
                      disabled={inquiryLoading}
                      className="w-full flex items-center justify-center px-6 py-4 bg-orange-500 text-white font-bold text-base rounded-xl shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inquiryLoading ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      ) : (
                        <Send className="w-5 h-5 mr-3" />
                      )}
                      Send {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry
                    </button>
                    {inquiryMessage && (
                      <p className={`mt-3 text-sm ${inquiryMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                        {inquiryMessage}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LODashboard;
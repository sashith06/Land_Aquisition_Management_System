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
} from "lucide-react";
import Navigation from "../../../components/Navigation";

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
                          Extent: {lot.extentHa} ha {lot.extentPerch} perch
                        </p>
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

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${selectedLot.lot.compensationStatus === 'completed' ? 100 : selectedLot.lot.compensationStatus === 'in_progress' ? 60 : 25}%` }}
                    ></div>
                  </div>

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
                        <span className="text-gray-900 font-bold text-sm">{selectedLot.lot.extentHa} ha {selectedLot.lot.extentPerch} perch</span>
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
                        <span className="font-semibold text-gray-600 text-xs">Compensation:</span>
                        <span className="text-gray-900 font-bold text-sm">
                          {selectedLot.lot.compensationAmount ? `Rs. ${selectedLot.lot.compensationAmount.toLocaleString()}` : 'Pending'}
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
                      <li className="flex items-center justify-between py-2">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-semibold text-gray-600">Mobile</span>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{landownerData?.mobile || 'N/A'}</span>
                      </li>
                    </ul>
                  </div>

                  {/* Bank Book & ID Card */}
                  <div className="space-y-4 mb-6">
                    {/* Bank Book */}
                    <div className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          <CreditCard className="h-4 w-4 text-emerald-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">Bank Book</h3>
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
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <FileText className="h-4 w-4 text-orange-600" />
                        </div>
                        <h3 className="font-bold text-gray-900 text-sm">ID Card</h3>
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

                  {/* Lot Selection Radio Buttons */}
                  <div className="mb-4">
                    <span className="block text-sm font-bold text-gray-900 mb-3">Select Lot for Inquiry:</span>
                    <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 rounded-lg p-3">
                      {Object.entries(lotsData).map(([projectName, plans]) =>
                        Object.entries(plans).map(([planName, lots]) =>
                          lots.map((lot) => (
                            <label key={lot.lotId} className="flex items-center gap-2 cursor-pointer text-sm">
                              <input
                                type="radio"
                                name="selectedLot"
                                value={lot.lotId}
                                checked={selectedLot?.lot?.lotId === lot.lotId}
                                onChange={() => setSelectedLot({ project: projectName, plan: planName, lot })}
                                className="accent-orange-600 w-3 h-3"
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
                      <div className="mt-2 text-xs text-gray-600 font-medium bg-orange-50 p-2 rounded">
                        ✓ Selected: Lot {selectedLot.lot.lotNo} - {selectedLot.lot.extentHa} ha {selectedLot.lot.extentPerch} perch
                      </div>
                    )}
                  </div>

                  {/* Inquiry Type Radio Buttons */}
                  <div className="mb-4">
                    <span className="block text-sm font-bold text-gray-900 mb-3">Inquiry Type:</span>
                    <div className="flex gap-4 bg-gray-50 rounded-lg p-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="general"
                          checked={inquiryType === "general"}
                          onChange={() => setInquiryType("general")}
                          className="accent-blue-600 w-3 h-3"
                        />
                        <span className="text-sm font-semibold text-gray-800">General</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="payment"
                          checked={inquiryType === "payment"}
                          onChange={() => setInquiryType("payment")}
                          className="accent-blue-600 w-3 h-3"
                        />
                        <span className="text-sm font-semibold text-gray-800">Payment</span>
                      </label>
                    </div>
                    <div className="mt-2 text-xs text-gray-600">
                      Selected: <span className="font-bold capitalize text-gray-900">{inquiryType}</span>
                    </div>
                  </div>

                  {/* Inquiry Textarea */}
                  <div className="mb-4">
                    <label className="block mb-2 font-bold text-gray-900 text-sm">
                      {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry for Lot {selectedLot?.lot?.lotNo || 'N/A'}
                    </label>
                    <textarea
                      rows={3}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm font-medium"
                      placeholder={`Write your ${inquiryType} inquiry about Lot ${selectedLot?.lot?.lotNo || 'N/A'} here...`}
                    />
                  </div>

                  {/* Attach Files */}
                  <div className="mb-4">
                    <label className="block mb-2 font-bold text-gray-900 text-sm">
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
                        className="flex items-center justify-center w-full h-16 bg-gradient-to-r from-blue-50 to-indigo-100 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer hover:from-blue-100 hover:to-indigo-200 hover:border-blue-400 transition-all duration-200"
                      >
                        <div className="text-center">
                          <Paperclip className="w-5 h-5 text-blue-600 mx-auto mb-1" />
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
                      <ul className="mt-2 space-y-1">
                        {attachedFiles.map((file, idx) => (
                          <li
                            key={idx}
                            className="flex justify-between bg-gray-100 p-2 rounded"
                          >
                            <span>{file.name}</span>
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
                      className="w-full flex items-center justify-center px-4 py-3 bg-orange-500 text-white font-bold text-sm rounded-lg shadow-lg hover:bg-orange-600 hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {inquiryLoading ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      Send {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry
                    </button>
                    {inquiryMessage && (
                      <p className={`mt-2 text-sm ${inquiryMessage.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
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
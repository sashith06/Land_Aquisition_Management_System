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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your land information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchLandownerData}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600"
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

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 pt-[80px]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {landownerData?.name || 'Landowner'}
            </h1>
            <p className="text-gray-600">Track your land acquisition process</p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* LEFT SIDE */}
            <div className="xl:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6">
                {Object.entries(lotsData).map(([projectName, plans]) =>
                  Object.entries(plans).map(([planName, lots]) =>
                    lots.map((lot, index) => (
                      <div
                        key={`${projectName}-${planName}-${lot.lotId}`}
                        className={`bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                          selectedLot?.lot?.lotId === lot.lotId ? 'border-orange-500 bg-orange-50' : 'border-amber-500'
                        }`}
                        onClick={() => setSelectedLot({ project: projectName, plan: planName, lot })}
                      >
                        <h2 className="text-lg font-semibold mb-2 text-gray-900">
                          {projectName}
                        </h2>
                        <p className="text-gray-600 text-sm mb-1">{planName}</p>
                        <p className="text-2xl font-bold text-gray-900">Lot No: {lot.lotNo}</p>
                        <p className="text-sm text-gray-600 mt-1">
                          Extent: {lot.extentHa} ha {lot.extentPerch} perch
                        </p>
                        {selectedLot?.lot?.lotId === lot.lotId && (
                          <div className="mt-2 text-orange-600 text-sm font-medium">Selected</div>
                        )}
                      </div>
                    ))
                  )
                )}
              </div>

              {/* Lot Info & Progress */}
              {selectedLot && (
                <div className="bg-white p-6 rounded-2xl shadow-lg border border-dashed border-gray-300">
                  <h2 className="text-lg font-semibold mb-2 text-gray-900">
                    {selectedLot.project}
                  </h2>
                  <p className="text-gray-600 text-sm mb-1">{selectedLot.plan}</p>
                  <p className="text-2xl font-bold text-gray-900 mb-4">Lot No: {selectedLot.lot.lotNo}</p>

                  <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${selectedLot.lot.compensationStatus === 'completed' ? 100 : selectedLot.lot.compensationStatus === 'in_progress' ? 60 : 25}%` }}
                    ></div>
                  </div>

                  <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                    <h1 className="text-lg font-bold text-gray-900 mb-4">
                      Lot Information
                    </h1>

                    <ul className="space-y-3 text-sm text-gray-700">
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Lot Number:</span>
                        <span className="text-gray-900">{selectedLot.lot.lotNo}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Extent:</span>
                        <span className="text-gray-900">{selectedLot.lot.extentHa} ha {selectedLot.lot.extentPerch} perch</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Land Type:</span>
                        <span className="text-gray-900">{selectedLot.lot.landType}</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Ownership:</span>
                        <span className="text-gray-900">{selectedLot.lot.ownershipPercentage}%</span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Valuation Amount:</span>
                        <span className="text-gray-900">
                          {selectedLot.lot.valuationAmount ? `Rs. ${selectedLot.lot.valuationAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between border-b pb-2">
                        <span className="font-medium text-gray-600">Compensation Amount:</span>
                        <span className="text-gray-900">
                          {selectedLot.lot.compensationAmount ? `Rs. ${selectedLot.lot.compensationAmount.toLocaleString()}` : 'Pending'}
                        </span>
                      </li>
                      <li className="flex justify-between">
                        <span className="font-medium text-gray-600">Status:</span>
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
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
            <div className="xl:col-span-2 space-y-8">
              {/* Profile Information */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 space-y-8">
                <div>
                  <div className="flex items-center mb-6">
                    <div className="p-3 bg-indigo-100 rounded-xl mr-4">
                      <User className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      Profile Information
                    </h2>
                  </div>



                  {/* Profile Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <User className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium text-gray-900">{landownerData?.name || 'N/A'}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">NIC</p>
                        <p className="font-mono text-gray-900">
                          {landownerData?.nic || 'N/A'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-normal text-gray-900">
                          {landownerData?.mobile || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Bank Book & ID Card */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Bank Book */}
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          <CreditCard className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">Bank Book</h3>
                      </div>
                      <input
                        type="file"
                        onChange={handleBankBookUpload}
                        className="w-full text-sm text-gray-700 border rounded p-2"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
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
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-orange-100 rounded-lg mr-3">
                          <FileText className="h-5 w-5 text-orange-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">ID Card</h3>
                      </div>
                      <input
                        type="file"
                        onChange={handleIdCardUpload}
                        className="w-full text-sm text-gray-700 border rounded p-2"
                        accept=".jpg,.jpeg,.png,.pdf"
                      />
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
                  <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                      <MessageSquare className="w-5 h-5 text-gray-600" />
                      <h4 className="text-lg font-semibold text-gray-700">My Inquiries</h4>
                    </div>

                    {myInquiriesLoading ? (
                      <div className="flex items-center justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                        <span className="text-gray-600 ml-2">Loading inquiries...</span>
                      </div>
                    ) : myInquiries.length > 0 ? (
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {myInquiries.map((inquiry) => (
                          <div key={inquiry.id} className={`p-3 border rounded-lg ${inquiry.is_read ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex-1">
                                <p className="text-sm text-gray-800 mb-1">{inquiry.inquiry_text}</p>
                                <p className="text-xs text-gray-600">{inquiry.lot_info}</p>
                                <p className="text-xs text-gray-500">Submitted: {new Date(inquiry.created_at).toLocaleString()}</p>
                              </div>
                              <span className={`px-2 py-1 text-xs rounded-full ${inquiry.is_read ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {inquiry.is_read ? 'Read' : 'Unread'}
                              </span>
                            </div>
                            {inquiry.attachments && inquiry.attachments.length > 0 && (
                              <div className="mt-2">
                                <p className="text-xs text-gray-600 mb-1">Attachments:</p>
                                <div className="flex flex-wrap gap-1">
                                  {inquiry.attachments.map((att) => (
                                    <a
                                      key={att.id}
                                      href={`http://localhost:5000/${att.file_path}`}
                                      download={att.file_name}
                                      className="inline-flex items-center px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs rounded transition-colors"
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
                  <div className="mb-6">
                    <span className="block text-sm font-medium text-gray-700 mb-3">Select Lot for Inquiry:</span>
                    <div className="space-y-2">
                      {Object.entries(lotsData).map(([projectName, plans]) =>
                        Object.entries(plans).map(([planName, lots]) =>
                          lots.map((lot) => (
                            <label key={lot.lotId} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="radio"
                                name="selectedLot"
                                value={lot.lotId}
                                checked={selectedLot?.lot?.lotId === lot.lotId}
                                onChange={() => setSelectedLot({ project: projectName, plan: planName, lot })}
                                className="accent-orange-600"
                              />
                              <span className="text-sm font-medium">
                                Lot {lot.lotNo} - {projectName} ({planName})
                              </span>
                            </label>
                          ))
                        )
                      )}
                    </div>
                    {selectedLot && (
                      <div className="mt-2 text-xs text-gray-500">
                        Currently selected: Lot {selectedLot.lot.lotNo} - {selectedLot.lot.extentHa} ha {selectedLot.lot.extentPerch} perch
                      </div>
                    )}
                  </div>

                  {/* Inquiry Type Radio Buttons */}
                  <div className="mb-6">
                    <span className="block text-sm font-medium text-gray-700 mb-3">Inquiry Type:</span>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="general"
                          checked={inquiryType === "general"}
                          onChange={() => setInquiryType("general")}
                          className="accent-blue-600"
                        />
                        <span className="text-sm">General</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="inquiryType"
                          value="payment"
                          checked={inquiryType === "payment"}
                          onChange={() => setInquiryType("payment")}
                          className="accent-blue-600"
                        />
                        <span className="text-sm">Payment</span>
                      </label>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Selected inquiry type: <span className="font-medium capitalize">{inquiryType}</span>
                    </div>
                  </div>

                  {/* Inquiry Textarea */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry for Lot {selectedLot?.lot?.lotNo || 'N/A'}
                    </label>
                    <textarea
                      rows={4}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder={`Write your ${inquiryType} inquiry about Lot ${selectedLot?.lot?.lotNo || 'N/A'} here...`}
                    />
                  </div>

                  {/* Attach Files */}
                  <div className="mt-4">
                    <label className="block mb-2 font-semibold text-gray-700">
                      Attach Files
                    </label>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="w-full text-sm text-gray-700 border rounded p-2"
                    />
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
                  <div className="mt-6">
                    <button
                      onClick={handleInquirySubmit}
                      disabled={inquiryLoading}
                      className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow hover:bg-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
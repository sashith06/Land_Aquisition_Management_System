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

  const handleBankBookUpload = (e) => {
    setBankBookFile(e.target.files[0]);
  };

  const handleIdCardUpload = (e) => {
    setIdCardFile(e.target.files[0]);
  };

  const removeAttachedFile = (index) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const handleInquirySubmit = () => {
    if (!inquiryText.trim()) {
      alert("Please enter your inquiry message");
      return;
    }
    alert(`${inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} inquiry sent for Lot ${currentLot.lotNumber}: ${inquiryText} with ${attachedFiles.length} file(s)`);
    setInquiryText("");
    setAttachedFiles([]);
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
                      />
                      {bankBookFile && (
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
                      />
                      {idCardFile && (
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
                      className="flex items-center justify-center px-6 py-3 bg-orange-500 text-white font-semibold rounded-xl shadow hover:bg-orange-600 transition-all"
                    >
                      <Send className="w-4 h-4 mr-2" /> Send {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry
                    </button>
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
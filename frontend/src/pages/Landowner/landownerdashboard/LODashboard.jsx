import { useState } from "react";
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
import Navbar from "../../../components/Navbar";

const NAVBAR_HEIGHT = "64px"; // define navbar height


function LODashboard() {
  const [selectedLot, setSelectedLot] = useState("lot4");
  const [inquiryType, setInquiryType] = useState("general");
  const [inquiryText, setInquiryText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [bankBookFile, setBankBookFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  // Lot data
  const lotData = {
    lot4: {
      lotNumber: 4,
      compensationAmount: "Rs. 1,200,000",
      interest: "5% per annum",
      acquisitionDate: "12 Aug 2024",
      acquisitionAmount: "Rs. 950,000",
      otherOwners: "None",
      progress: 75
    },
    lot5: {
      lotNumber: 5,
      compensationAmount: "Rs. 1,500,000",
      interest: "5.5% per annum",
      acquisitionDate: "15 Aug 2024",
      acquisitionAmount: "Rs. 1,100,000",
      otherOwners: "Jane Smith",
      progress: 60
    }
  };

  const currentLot = lotData[selectedLot];

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

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Fixed Navbar */}
      <header
        className="fixed top-0 left-0 right-0 bg-white shadow z-20 flex items-center"
        style={{ height: NAVBAR_HEIGHT }}
      >
        <Navbar />
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 pt-[80px]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {" "}Land
              </span>
              in Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {" "}Process
              </span>
            </h1>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* LEFT SIDE */}
            <div className="xl:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-6">
                <div 
                  className={`bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                    selectedLot === 'lot4' ? 'border-orange-500 bg-orange-50' : 'border-amber-500'
                  }`}
                  onClick={() => setSelectedLot('lot4')}
                >
                  <h2 className="text-lg font-semibold mb-2 text-gray-900">
                    Diyagama - Walgama
                  </h2>
                  <p className="text-gray-600 text-sm mb-1">Plan 8890</p>
                  <p className="text-2xl font-bold text-gray-900">Lot No: 4</p>
                  {selectedLot === 'lot4' && (
                    <div className="mt-2 text-orange-600 text-sm font-medium">Selected</div>
                  )}
                </div>

                <div 
                  className={`bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                    selectedLot === 'lot5' ? 'border-orange-500 bg-orange-50' : 'border-amber-500'
                  }`}
                  onClick={() => setSelectedLot('lot5')}
                >
                  <h2 className="text-lg font-semibold mb-2 text-gray-900">
                    Diyagama - Walgama
                  </h2>
                  <p className="text-gray-600 text-sm mb-1">Plan 8890</p>
                  <p className="text-2xl font-bold text-gray-900">Lot No: 5</p>
                  {selectedLot === 'lot5' && (
                    <div className="mt-2 text-orange-600 text-sm font-medium">Selected</div>
                  )}
                </div>
              </div>

              {/* Lot Info & Progress */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-dashed border-gray-300">
                <h2 className="text-lg font-semibold mb-2 text-gray-900">
                  Diyagama - Walgama
                </h2>
                <p className="text-gray-600 text-sm mb-1">Plan 8890</p>
                <p className="text-2xl font-bold text-gray-900 mb-4">Lot No: {currentLot.lotNumber}</p>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${currentLot.progress}%` }}
                  ></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                  <h1 className="text-lg font-bold text-gray-900 mb-4">
                    Lot Information
                  </h1>

                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Compensation Amount:</span>
                      <span className="text-gray-900">{currentLot.compensationAmount}</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Interest:</span>
                      <span className="text-gray-900">{currentLot.interest}</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Acquisition Date:</span>
                      <span className="text-gray-900">{currentLot.acquisitionDate}</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">Acquisition Amount:</span>
                      <span className="text-gray-900">{currentLot.acquisitionAmount}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium text-gray-600">Other Owners:</span>
                      <span className="text-gray-900">{currentLot.otherOwners}</span>
                    </li>
                  </ul>
                </div>
              </div>
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
                        <p className="font-medium text-gray-900">John Doe</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <Mail className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p className="font-mono text-gray-900">
                          john@example.com
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                      <Phone className="h-5 w-5 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Mobile</p>
                        <p className="font-normal text-gray-900">
                          +94 77 123 4567
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
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedLot"
                          value="lot4"
                          checked={selectedLot === "lot4"}
                          onChange={() => setSelectedLot("lot4")}
                          className="accent-orange-600"
                        />
                        <span className="text-sm font-medium">Lot 4</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="selectedLot"
                          value="lot5"
                          checked={selectedLot === "lot5"}
                          onChange={() => setSelectedLot("lot5")}
                          className="accent-orange-600"
                        />
                        <span className="text-sm font-medium">Lot 5</span>
                      </label>
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Currently selected: Lot {currentLot.lotNumber} - {currentLot.compensationAmount}
                    </div>
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
                      {inquiryType.charAt(0).toUpperCase() + inquiryType.slice(1)} Inquiry for Lot {currentLot.lotNumber}
                    </label>
                    <textarea
                      rows={4}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder={`Write your ${inquiryType} inquiry about Lot ${currentLot.lotNumber} here...`}
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
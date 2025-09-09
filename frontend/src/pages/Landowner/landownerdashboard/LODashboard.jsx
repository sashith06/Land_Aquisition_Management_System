import { useState, useEffect } from "react";
import {
  Upload,
  Send,
  User,
  Mail,
  CreditCard,
  FileText,
  X,
  Phone,
} from "lucide-react";
import Navigation from "../../../components/Navigation";
import { getLandownerDashboard } from "../../../api";

const NAVBAR_HEIGHT = "64px"; // define navbar height

function LODashboard() {
  const [selectedLot, setSelectedLot] = useState(null);
  const [inquiryText, setInquiryText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [bankBookFile, setBankBookFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [lots, setLots] = useState([]);
  const [owner, setOwner] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await getLandownerDashboard();
        setOwner(response.data.owner);
        setLots(response.data.lots);
        if (response.data.lots.length > 0) {
          setSelectedLot(response.data.lots[0]);
        }
      } catch (err) {
        setError("Failed to load dashboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        {error}
      </div>
    );
  }

  if (lots.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        No lots found for your account.
      </div>
    );
  }

  const currentLot = selectedLot;

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
    alert(
      `Inquiry sent for Lot ${currentLot.lot_no}: ${inquiryText} with ${attachedFiles.length} file(s)`
    );
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
        <Navigation />
      </header>

      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 pt-[80px]">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Your
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {" "}
                Land
              </span>
              in Our
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">
                {" "}
                Process
              </span>
            </h1>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* LEFT SIDE */}
            <div className="xl:col-span-2 space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 gap-6">
                {lots.map((lot) => (
                  <div
                    key={lot.id}
                    className={`bg-white p-6 rounded-2xl shadow-lg border hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer ${
                      selectedLot?.id === lot.id
                        ? "border-orange-500 bg-orange-50"
                        : "border-amber-500"
                    }`}
                    onClick={() => setSelectedLot(lot)}
                  >
                    <h2 className="text-lg font-semibold mb-2 text-gray-900">
                      {lot.project_name}
                    </h2>
                    <p className="text-gray-600 text-sm mb-1">
                      Plan {lot.plan_number}
                    </p>
                    <p className="text-2xl font-bold text-gray-900">
                      Lot No: {lot.lot_no}
                    </p>
                    {selectedLot?.id === lot.id && (
                      <div className="mt-2 text-orange-600 text-sm font-medium">
                        Selected
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Lot Info & Progress */}
              <div className="bg-white p-6 rounded-2xl shadow-lg border border-dashed border-gray-300">
                <h2 className="text-lg font-semibold mb-2 text-gray-900">
                  {currentLot.project_name}
                </h2>
                <p className="text-gray-600 text-sm mb-1">
                  Plan {currentLot.plan_number}
                </p>
                <p className="text-2xl font-bold text-gray-900 mb-4">
                  Lot No: {currentLot.lot_no}
                </p>

                <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
                  <div
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                    style={{ width: `50%` }}
                  ></div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-lg border border-blue-200 hover:shadow-xl transition-all duration-300">
                  <h1 className="text-lg font-bold text-gray-900 mb-4">
                    Lot Information
                  </h1>

                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Lot Number:
                      </span>
                      <span className="text-gray-900">{currentLot.lot_no}</span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Extent (Ha):
                      </span>
                      <span className="text-gray-900">
                        {currentLot.extent_ha}
                      </span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Extent (Perch):
                      </span>
                      <span className="text-gray-900">
                        {currentLot.extent_perch}
                      </span>
                    </li>
                    <li className="flex justify-between border-b pb-2">
                      <span className="font-medium text-gray-600">
                        Land Type:
                      </span>
                      <span className="text-gray-900">
                        {currentLot.land_type}
                      </span>
                    </li>
                    <li className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Location:
                      </span>
                      <span className="text-gray-900">
                        {currentLot.location || "N/A"}
                      </span>
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
                  <div className="mb-6">
                    <ul className="space-y-4">
                      <li className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <User className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-600">Name:</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {owner?.name || "N/A"}
                        </span>
                      </li>

                      <li className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <CreditCard className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-600">NIC:</span>
                        </div>
                        <span className="font-mono text-gray-900">
                          {owner?.nic || "N/A"}
                        </span>
                      </li>

                      <li className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                          <Mail className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-600">Email:</span>
                        </div>
                        <span className="font-mono text-gray-900">
                          {owner?.email || "Not provided"}
                        </span>
                      </li>

                      <li className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <Phone className="h-5 w-5 text-gray-500" />
                          <span className="font-medium text-gray-600">Mobile:</span>
                        </div>
                        <span className="font-normal text-gray-900">
                          {owner?.phone || "N/A"}
                        </span>
                      </li>
                    </ul>
                  </div>

                  {/* Bank Book & ID Card */}
                  <div className="flex flex-col md:flex-row gap-6 mb-6">
                    {/* Bank Book */}
                    <div className="flex-1">
                      <div className="flex items-center mb-3">
                        <div className="p-2 bg-emerald-100 rounded-lg mr-3">
                          <CreditCard className="h-5 w-5 text-emerald-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900">
                          Bank Book
                        </h3>
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
                    <span className="block text-sm font-medium text-gray-700 mb-3">
                      Select Lot for Inquiry:
                    </span>
                    <div className="flex gap-4 flex-wrap">
                      {lots.map((lot) => (
                        <label
                          key={lot.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="radio"
                            name="selectedLot"
                            value={lot.id}
                            checked={selectedLot?.id === lot.id}
                            onChange={() => setSelectedLot(lot)}
                            className="accent-orange-600"
                          />
                          <span className="text-sm font-medium">
                            Lot {lot.lot_no}
                          </span>
                        </label>
                      ))}
                    </div>
                    <div className="mt-2 text-xs text-gray-500">
                      Currently selected: Lot {currentLot.lot_no}
                    </div>
                  </div>

                  {/* Inquiry Textarea */}
                  <div>
                    <label className="block mb-2 font-semibold text-gray-700">
                      Inquiry for Lot {currentLot.lot_no}
                    </label>
                    <textarea
                      rows={4}
                      value={inquiryText}
                      onChange={(e) => setInquiryText(e.target.value)}
                      className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-orange-400"
                      placeholder={`Write your inquiry about Lot ${currentLot.lot_no} here...`}
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
                      <Send className="w-4 h-4 mr-2" /> Send Inquiry
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

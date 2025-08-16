import { useState } from "react";

const Dashboard = () => {
  const [inquiryText, setInquiryText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState([]);

  const handleFileUpload = (e) => {
    setAttachedFiles([...attachedFiles, ...Array.from(e.target.files)]);
  };

  const handleInquirySubmit = () => {
    alert(`Inquiry sent: ${inquiryText} with ${attachedFiles.length} file(s)`);
    setInquiryText("");
    setAttachedFiles([]);
  };

  return (
    <div className="p-6 grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* LEFT SIDE */}
      <div className="xl:col-span-3 space-y-8">
        {/* Two Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Card 1</h2>
            <p className="text-gray-600">Some stats or info here.</p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow">
            <h2 className="text-lg font-semibold mb-2">Card 2</h2>
            <p className="text-gray-600">Some stats or info here.</p>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Profile Information</h2>
          <p><strong>Name:</strong> John Doe</p>
          <p><strong>Email:</strong> john@example.com</p>
          <p><strong>Role:</strong> Project Manager</p>
        </div>
      </div>

      {/* RIGHT SIDE */}
      <div className="xl:col-span-1 space-y-6">
        {/* Bank Book Upload */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Upload Bank Book</h2>
          <input type="file" accept="image/*" className="mb-2" />
        </div>

        {/* ID Card Upload */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Upload ID Card</h2>
          <input type="file" accept="image/*" className="mb-2" />
        </div>

        {/* Inquiry Portal */}
        <div className="bg-white p-6 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-4">Send Inquiry</h2>
          <textarea
            value={inquiryText}
            onChange={(e) => setInquiryText(e.target.value)}
            className="w-full p-2 border rounded mb-3"
            placeholder="Type your inquiry..."
            rows={4}
          />
          <input
            type="file"
            multiple
            onChange={handleFileUpload}
            className="mb-3"
          />
          {attachedFiles.length > 0 && (
            <p className="text-sm text-gray-500 mb-2">
              {attachedFiles.length} file(s) attached
            </p>
          )}
          <button
            onClick={handleInquirySubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Send Inquiry
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

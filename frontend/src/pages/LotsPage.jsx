// src/pages/LotsPage.jsx
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { lotsData } from "../data/mockData";



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
  const [selectedLot, setSelectedLot] = useState(null);

  // Filter lots by search term
  const filteredLots = lotsData.filter((lot) =>
    lot.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleLotClick = (lot) => {
    setSelectedLot(lot);
  };

  const handleBackToDashboard = () => {
    // Determine which dashboard to navigate back to based on current path
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate('/pe-dashboard');
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate('/ce-dashboard');
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate('/fo-dashboard');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="p-6">
      {/* Header with back button */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleBackToDashboard}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Lots for Plan {planId}
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-full">
        {/* Left side panel */}
        <div className="bg-green-100 p-4 rounded-xl space-y-4">
          {/* Tab buttons */}
          <div className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`w-full py-2 px-4 rounded-lg font-semibold text-left ${
                  activeTab === tab
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 hover:bg-green-200"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          

          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search lots..."
            className="w-full p-2 border rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* Lots grid */}
          <div className="grid grid-cols-4 gap-2">
            {filteredLots.map((lot, i) => (
              <button
                key={lot.id}
                onClick={() => handleLotClick(lot)}
                className={`p-3 text-white font-bold rounded-lg transition-all hover:scale-105 ${
                  selectedLot?.id === lot.id
                    ? "bg-purple-600 ring-2 ring-purple-300"
                    : i % 3 === 0
                    ? "bg-red-500 hover:bg-red-600"
                    : i % 3 === 1
                    ? "bg-gray-800 hover:bg-gray-900"
                    : "bg-yellow-400 hover:bg-yellow-500"
                }`}
              >
                {lot.id.replace("L", "")}
              </button>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button className="flex-1 bg-black text-white py-2 rounded-lg font-semibold hover:bg-gray-800">
              Mark All
            </button>
            <button className="flex-1 bg-gray-600 text-white py-2 rounded-lg font-semibold hover:bg-gray-700">
              Unmark All
            </button>
          </div>
        </div>

        {/* Right side content */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{activeTab}</h2>
          
          {activeTab === "Owner Details" && (
            <div className="space-y-4">
              {selectedLot ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Selected Lot: {selectedLot.id}</h3>
                  <div className="flex justify-between items-start">
                    <div>
                      <p>
                        <span className="font-semibold">Name:</span> {selectedLot.owner}
                      </p>
                      <p>
                        <span className="font-semibold">NIC:</span> 200127702072
                      </p>
                      <p>
                        <span className="font-semibold">Mobile:</span> 077-9504969
                      </p>
                      <p>
                        <span className="font-semibold">Address:</span> 1st mile
                        post, Pituwela road, Elpitiya
                      </p>
                      <p>
                        <span className="font-semibold">Status:</span> 
                        <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                          selectedLot.status === 'active' ? 'bg-green-200 text-green-800' :
                          selectedLot.status === 'pending' ? 'bg-yellow-200 text-yellow-800' :
                          'bg-blue-200 text-blue-800'
                        }`}>
                          {selectedLot.status}
                        </span>
                      </p>
                    </div>
                    <button className="bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800">
                      Edit
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p>Select a lot from the left panel to view owner details</p>
                </div>
              )}

              {/* Show all lots for reference */}
              <div className="mt-6">
                <h4 className="font-semibold mb-3">All Lots in this Plan:</h4>
                <div className="space-y-2">
                  {filteredLots.map((lot) => (
                    <div
                      key={lot.id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100"
                      onClick={() => handleLotClick(lot)}
                    >
                      <div>
                        <p>
                          <span className="font-semibold">Name:</span> {lot.owner}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-semibold">Lot ID:</span> {lot.id}
                        </p>
                      </div>
                      <button className="bg-black text-white px-4 py-1 rounded-lg hover:bg-gray-800">
                        Edit
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Valuation Details" && (
            <div className="text-center text-gray-500 py-8">
              <p>Valuation details will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}

          {activeTab === "Compensation Details" && (
            <div className="text-center text-gray-500 py-8">
              <p>Compensation details will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}

          {activeTab === "Land Details" && (
            <div className="text-center text-gray-500 py-8">
              <p>Land details will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}

          {activeTab === "Inquiries" && (
            <div className="text-center text-gray-500 py-8">
              <p>Inquiries will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}

          {/* Bottom Buttons */}
          <div className="flex gap-2 justify-end mt-6">
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Add new
            </button>
            <button className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-800">
              Import
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LotsPage;

// src/pages/LotsPage.jsx

import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { lotsData as initialLots } from "../data/mockData";
import Breadcrumb from "../components/Breadcrumb";
import ValuationDetails from "../components/ValuationDetails";
import CompensationDetailsTab from "../components/CompensationDetailsTab";

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
  const [lotsData, setLotsData] = useState(initialLots);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [ownerFields, setOwnerFields] = useState([{ name: '', nic: '', mobile: '', address: '' }]);
  const [lotNumber, setLotNumber] = useState("");
  const [lotStatus, setLotStatus] = useState("active");
  const [deletedLot, setDeletedLot] = useState(null);

  const [modalPosition, setModalPosition] = useState({ x: 100, y: 100 });
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const mouseStart = useRef({ x: 0, y: 0 });

  // Determine user role based on current route
  const getCurrentUserRole = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/fo-dashboard')) return 'Financial Officer';
    if (currentPath.includes('/pe-dashboard')) return 'Project Engineer';
    if (currentPath.includes('/ce-dashboard')) return 'Chief Engineer';
    return 'Land Officer'; // Default role
  };

  const userRole = getCurrentUserRole();

  // Filter lots by search
  const filteredLots = lotsData.filter((lot) =>
    lot.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleLotClick = (lot) => setSelectedLot(lot);

  const handleBackToPlansProgress = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate('/pe-dashboard', { state: { returnToProject: true, planId: planId } });
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate('/ce-dashboard', { state: { returnToProject: true, planId: planId } });
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate('/fo-dashboard', { state: { returnToProject: true, planId: planId } });
    } else {
      navigate('/dashboard', { state: { returnToProject: true, planId: planId } });
    }
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

  // Drag & drop handlers
  function handleHeaderMouseDown(e) {
    setDragging(true);
    dragStart.current = { x: modalPosition.x, y: modalPosition.y };
    mouseStart.current = { x: e.clientX, y: e.clientY };
  }

  function handleMouseUp() { setDragging(false); }

  function handleMouseMove(e) {
    if (dragging) {
      const dx = e.clientX - mouseStart.current.x;
      const dy = e.clientY - mouseStart.current.y;
      setModalPosition({
        x: dragStart.current.x + dx,
        y: dragStart.current.y + dy
      });
    }
  }

  useEffect(() => {
    if (dragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dragging]);

  // Auto-hide deleted lot banner after 5 seconds
  useEffect(() => {
    if (deletedLot) {
      const timer = setTimeout(() => setDeletedLot(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [deletedLot]);

  // Create or Edit Lot
  const handleSubmitLot = () => {
    if (!lotNumber) return;

    if (!selectedLot) {
      // Create new
      const newLot = { id: lotNumber, status: lotStatus, owners: ownerFields };
      setLotsData([...lotsData, newLot]);
      setSelectedLot(newLot);
    } else {
      // Edit existing
      const updatedLots = lotsData.map((lot) =>
        lot.id === selectedLot.id
          ? { ...lot, id: lotNumber, status: lotStatus, owners: ownerFields }
          : lot
      );
      setLotsData(updatedLots);
      setSelectedLot({ id: lotNumber, status: lotStatus, owners: ownerFields });
    }
    setShowCreateModal(false);
    handleClearForm();
  };

  const handleEditLot = () => {
    if (!selectedLot) return;
    setLotNumber(selectedLot.id);
    setLotStatus(selectedLot.status);
    setOwnerFields(selectedLot.owners);
    setShowCreateModal(true);
  };

  const handleDeleteLot = () => {
    if (!selectedLot) return;
    setDeletedLot(selectedLot);
    const updatedLots = lotsData.filter((lot) => lot.id !== selectedLot.id);
    setLotsData(updatedLots);
    setSelectedLot(null);
  };

  return (
    <div className="p-6">
      {/* Breadcrumb */}
      <Breadcrumb
        items={[
          { label: "Plans & Progress", to: "#", onClick: handleBackToPlansProgress },
          { label: `Lots for Plan ${planId}` }
        ]}
      />
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Lots for Plan {planId}
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
            {filteredLots.map((lot, i) => (
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
              onClick={() => { handleClearForm(); setShowCreateModal(true); }}
            >
              Create Lot
            </button>
          )}
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 bg-white p-6 rounded-xl border">
          <h2 className="text-xl font-bold mb-4 text-gray-800">{activeTab}</h2>

          {activeTab === "Owner Details" && (
            <div className="space-y-4">
              {selectedLot ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold text-lg mb-3">Selected Lot: {selectedLot.id}</h3>
                  <p className="mb-2"><span className="font-semibold">Status:</span> {selectedLot.status}</p>
                  <div className="flex flex-col items-start">
                    <span className="font-semibold mb-2">Owners:</span>
                    <div className="flex gap-2 mb-4">
                      {selectedLot.owners.map((owner, idx) => (
                        <button
                          key={idx}
                          className={`px-3 py-1 rounded-lg font-semibold border border-slate-600 text-slate-700 bg-white hover:bg-slate-100 ${selectedLot.selectedOwnerIdx === idx ? 'bg-slate-200' : ''}`}
                          onClick={() => setSelectedLot({ ...selectedLot, selectedOwnerIdx: idx })}
                        >
                          Owner {idx + 1}
                        </button>
                      ))}
                    </div>
                    {selectedLot.selectedOwnerIdx !== undefined && selectedLot.owners[selectedLot.selectedOwnerIdx] ? (
                      <div className="bg-white p-4 rounded-lg border w-full mb-4">
                        <p><span className="font-semibold">Name:</span> {selectedLot.owners[selectedLot.selectedOwnerIdx].name}</p>
                        <p><span className="font-semibold">NIC:</span> {selectedLot.owners[selectedLot.selectedOwnerIdx].nic}</p>
                        <p><span className="font-semibold">Mobile:</span> {selectedLot.owners[selectedLot.selectedOwnerIdx].mobile}</p>
                        <p><span className="font-semibold">Address:</span> {selectedLot.owners[selectedLot.selectedOwnerIdx].address}</p>
                      </div>
                    ) : (
                      <div className="text-gray-500 mb-4">Select an owner to view details.</div>
                    )}
                    {userRole !== 'Financial Officer' && (
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={handleEditLot}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                        >
                          Edit Lot
                        </button>
                        <button
                          onClick={handleDeleteLot}
                          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        >
                          Delete Lot
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-gray-500 text-center py-8">
                  <p>No lot selected. Please select a lot to view details.</p>
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

          {(activeTab === "Land Details" || activeTab === "Inquiries") && (
            <div className="text-center text-gray-500 py-8">
              <p>{activeTab} will be shown here</p>
              {selectedLot && <p className="mt-2">for Lot: {selectedLot.id}</p>}
            </div>
          )}
        </div>
      </div>

      {/* Modal for Create/Edit Lot */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md"
            style={{ maxHeight: '80vh', overflowY: 'auto', position: 'absolute', left: modalPosition.x, top: modalPosition.y }}
          >
            <div
              className="font-semibold text-lg mb-3 cursor-move bg-gray-200 p-2 rounded"
              onMouseDown={handleHeaderMouseDown}
              style={{ userSelect: 'none' }}
            >
              {selectedLot ? "Edit Lot" : "Create New Lot"}
            </div>
            <form className="space-y-4">
              <div>
                <label className="font-semibold">Lot Number:</label>
                <input
                  type="text"
                  className="ml-2 p-1 border rounded w-full"
                  placeholder="e.g. L009"
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="font-semibold">Status:</label>
                <select
                  className="ml-2 p-1 border rounded w-full"
                  value={lotStatus}
                  onChange={(e) => setLotStatus(e.target.value)}
                >
                  <option value="active">Active</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Owner Fields */}
              {ownerFields.map((owner, idx) => (
                <div key={idx} className="border rounded p-2 mb-2 relative">
                  <div>
                    <label className="font-semibold">Owner {idx + 1} Name:</label>
                    <input
                      type="text"
                      className="ml-2 p-1 border rounded w-full"
                      placeholder="Owner Name"
                      value={owner.name}
                      onChange={e => handleOwnerChange(idx, 'name', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">NIC:</label>
                    <input
                      type="text"
                      className="ml-2 p-1 border rounded w-full"
                      placeholder="NIC"
                      value={owner.nic}
                      onChange={e => handleOwnerChange(idx, 'nic', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Mobile:</label>
                    <input
                      type="text"
                      className="ml-2 p-1 border rounded w-full"
                      placeholder="Mobile"
                      value={owner.mobile}
                      onChange={e => handleOwnerChange(idx, 'mobile', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="font-semibold">Address:</label>
                    <input
                      type="text"
                      className="ml-2 p-1 border rounded w-full"
                      placeholder="Address"
                      value={owner.address}
                      onChange={e => handleOwnerChange(idx, 'address', e.target.value)}
                    />
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs"
                    onClick={() => handleRemoveOwner(idx)}
                  >
                    &times;
                  </button>
                </div>
              ))}

              <button
                type="button"
                className="bg-blue-500 text-white px-2 py-1 rounded-full"
                onClick={handleAddOwner}
              >
                +
              </button>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  className="bg-slate-600 text-white px-4 py-2 rounded-lg hover:bg-slate-700"
                  onClick={handleSubmitLot}
                >
                  {selectedLot ? "Save Changes" : "Create Lot"}
                </button>
                <button
                  type="button"
                  className="bg-gray-400 text-white px-4 py-2 rounded-lg hover:bg-gray-500"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                  onClick={handleClearForm}
                >
                  Clear All
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotsPage;

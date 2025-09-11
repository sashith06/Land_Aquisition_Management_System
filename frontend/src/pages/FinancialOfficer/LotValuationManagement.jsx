import React, { useState, useEffect } from 'react';
import { Calculator, Save, Edit, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { projectsData, plansData, lotsData } from '../../data/mockData';

const LotValuationManagement = () => {
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [selectedProject, setSelectedProject] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [lots, setLots] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLot, setEditingLot] = useState(null);
  const [valuationData, setValuationData] = useState({});

  // Load saved valuations from localStorage
  useEffect(() => {
    const savedValuations = JSON.parse(localStorage.getItem('lotValuations') || '{}');
    setValuationData(savedValuations);
  }, []);

  // Get lots for selected plan
  useEffect(() => {
    if (selectedPlan) {
      // In a real app, this would be filtered by planId
      setLots(lotsData);
    } else {
      setLots([]);
    }
  }, [selectedPlan]);

  const filteredLots = lots.filter(lot => 
    lot.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lot.owners.some(owner => 
      owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      owner.nic.includes(searchTerm)
    )
  );

  const handleProjectSelect = (project) => {
    setSelectedProject(project);
    setSelectedPlan(null);
    setEditingLot(null);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setEditingLot(null);
  };

  const handleEditValuation = (lot) => {
    const key = `${selectedPlan.id}_${lot.id}`;
    const existing = valuationData[key] || {
      statutorilyAmount: '',
      additionAmount: '',
      developmentAmount: '',
      courtAmount: '',
      thirtyThreeAmount: '',
      boardOfReviewAmount: '',
      totalValue: '',
      assessmentDate: new Date().toISOString().split('T')[0],
      assessorName: 'Financial Officer',
      notes: '',
      status: 'draft'
    };
    
    setEditingLot({ ...lot, valuation: existing });
  };

  const handleSaveValuation = () => {
    if (!editingLot || !selectedPlan) return;

    const key = `${selectedPlan.id}_${editingLot.id}`;
    const valuation = editingLot.valuation;
    
    // Calculate total value
    const total = parseFloat(valuation.statutorilyAmount || 0) +
                  parseFloat(valuation.additionAmount || 0) +
                  parseFloat(valuation.developmentAmount || 0) +
                  parseFloat(valuation.courtAmount || 0) +
                  parseFloat(valuation.thirtyThreeAmount || 0) +
                  parseFloat(valuation.boardOfReviewAmount || 0);
    
    const updatedValuation = {
      ...valuation,
      totalValue: total.toString(),
      lastUpdated: new Date().toISOString(),
      status: 'completed'
    };

    const updatedValuations = {
      ...valuationData,
      [key]: updatedValuation
    };

    setValuationData(updatedValuations);
    localStorage.setItem('lotValuations', JSON.stringify(updatedValuations));
    setEditingLot(null);
    
    alert('Valuation saved successfully!');
  };

  const handleInputChange = (field, value) => {
    setEditingLot(prev => ({
      ...prev,
      valuation: {
        ...prev.valuation,
        [field]: value
      }
    }));
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    return `Rs. ${parseFloat(value).toLocaleString()}`;
  };

  const getValuationStatus = (lot) => {
    const key = `${selectedPlan?.id}_${lot.id}`;
    return valuationData[key]?.status || 'pending';
  };

  const getValuationTotal = (lot) => {
    const key = `${selectedPlan?.id}_${lot.id}`;
    return valuationData[key]?.totalValue || '0';
  };

  if (!selectedProject) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Breadcrumb items={generateBreadcrumbs()} />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Lot Valuation Management</h1>
            <p className="text-gray-600 mt-1">Select a project to manage lot valuations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectsData.map(project => (
            <div 
              key={project.id}
              onClick={() => handleProjectSelect(project)}
              className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-2">{project.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{project.description}</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Created: {project.createdDate}</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                  {project.progress}% Complete
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!selectedPlan) {
    const projectPlans = plansData.filter(plan => plan.projectId === selectedProject.id);
    
    return (
      <div className="p-6">
        <div className="mb-6">
          <Breadcrumb items={generateBreadcrumbs({ projectName: selectedProject.name })} />
        </div>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Select Plan</h1>
            <p className="text-gray-600 mt-1">Project: {selectedProject.name}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projectPlans.map(plan => (
            <div 
              key={plan.id}
              onClick={() => handlePlanSelect(plan)}
              className="bg-white p-6 rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-center mb-4">
                <Calculator className="text-blue-600 mr-3" size={24} />
                <h3 className="text-lg font-semibold text-gray-800">Plan {plan.id}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Cost:</span>
                  <span className="text-sm font-medium">{plan.estimatedCost}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Extent:</span>
                  <span className="text-sm font-medium">{plan.estimatedExtent}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Progress:</span>
                  <span className="text-sm font-medium">{plan.progress}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs({ projectName: selectedProject.name, planName: selectedPlan.id })} />
      </div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Lot Valuations</h1>
          <p className="text-gray-600 mt-1">
            Project: {selectedProject.name} | Plan: {selectedPlan.id}
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search lots by ID or owner name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Lots List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredLots.map(lot => (
          <div key={lot.id} className="bg-white p-6 rounded-xl border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h3 className="text-lg font-semibold text-gray-800">Lot {lot.id}</h3>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  getValuationStatus(lot) === 'completed' ? 'bg-green-100 text-green-800' :
                  getValuationStatus(lot) === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {getValuationStatus(lot) === 'completed' ? 'Valued' :
                   getValuationStatus(lot) === 'draft' ? 'Draft' : 'Pending'}
                </span>
              </div>
              <button
                onClick={() => handleEditValuation(lot)}
                className="flex items-center space-x-2 px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {getValuationStatus(lot) === 'pending' ? <Plus size={16} /> : <Edit size={16} />}
                <span>{getValuationStatus(lot) === 'pending' ? 'Add' : 'Edit'}</span>
              </button>
            </div>

            {/* Owner Information */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-600 mb-2">Owners:</h4>
              {lot.owners.map((owner, index) => (
                <div key={index} className="text-sm text-gray-800 mb-1">
                  {owner.name} (NIC: {owner.nic})
                </div>
              ))}
            </div>

            {/* Valuation Summary */}
            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600">Total Valuation:</span>
                <span className="text-lg font-semibold text-green-600">
                  {formatCurrency(getValuationTotal(lot))}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Valuation Form Modal */}
      {editingLot && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800">
                  Valuation Form - Lot {editingLot.id}
                </h2>
                <button
                  onClick={() => setEditingLot(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <form className="space-y-6">
                {/* Assessment Information */}
                <div className="border border-blue-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-blue-700 mb-4">Assessment Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assessment Date
                      </label>
                      <input
                        type="date"
                        value={editingLot.valuation.assessmentDate}
                        onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Assessor Name
                      </label>
                      <input
                        type="text"
                        value={editingLot.valuation.assessorName}
                        onChange={(e) => handleInputChange('assessorName', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Financial Officer"
                      />
                    </div>
                  </div>
                </div>

                {/* Valuation Breakdown */}
                <div className="border border-green-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-green-700 mb-4">Valuation Breakdown</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Statutorily Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.statutorilyAmount}
                        onChange={(e) => handleInputChange('statutorilyAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 2000000"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Addition Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.additionAmount}
                        onChange={(e) => handleInputChange('additionAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 300000"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Development Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.developmentAmount}
                        onChange={(e) => handleInputChange('developmentAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 50000"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Court Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.courtAmount}
                        onChange={(e) => handleInputChange('courtAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 25000"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        33% Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.thirtyThreeAmount}
                        onChange={(e) => handleInputChange('thirtyThreeAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 100000"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Board of Review Amount (Rs.)
                      </label>
                      <input
                        type="number"
                        value={editingLot.valuation.boardOfReviewAmount}
                        onChange={(e) => handleInputChange('boardOfReviewAmount', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="e.g., 75000"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Total Calculation */}
                  <div className="mt-4 bg-green-50 p-3 rounded-md">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-green-700">Total Valuation:</span>
                      <span className="text-lg font-semibold text-green-800">
                        {formatCurrency(
                          (parseFloat(editingLot.valuation.statutorilyAmount) || 0) +
                          (parseFloat(editingLot.valuation.additionAmount) || 0) +
                          (parseFloat(editingLot.valuation.developmentAmount) || 0) +
                          (parseFloat(editingLot.valuation.courtAmount) || 0) +
                          (parseFloat(editingLot.valuation.thirtyThreeAmount) || 0) +
                          (parseFloat(editingLot.valuation.boardOfReviewAmount) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                <div className="border border-gray-300 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-700 mb-4">Notes</h3>
                  <textarea
                    value={editingLot.valuation.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    rows={4}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                    placeholder="Add any notes about the valuation..."
                  />
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setEditingLot(null)}
                    className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveValuation}
                    className="flex items-center space-x-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    <Save size={16} />
                    <span>Save Valuation</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotValuationManagement;

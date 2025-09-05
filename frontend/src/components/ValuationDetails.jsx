import React, { useState, useEffect } from 'react';
import { Calculator, Save, Edit, Lock } from 'lucide-react';

const ValuationDetails = ({ selectedLot, planId, userRole = 'Financial Officer' }) => {
  const [valuationData, setValuationData] = useState({
    statutorilyAmount: '',
    additionAmount: '',
    developmentAmount: '',
    courtAmount: '',
    thirtyThreeAmount: '',
    boardOfReviewAmount: '',
    totalValue: '',
    assessmentDate: '',
    assessorName: 'Financial Officer',
    notes: '',
    status: 'draft'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has permission to edit
  const canEdit = userRole === 'Financial Officer';

  useEffect(() => {
    if (selectedLot && planId) {
      // Load existing valuation data if available
      const savedValuations = JSON.parse(localStorage.getItem('lotValuations') || '{}');
      const lotKey = `${planId}_${selectedLot.id}`;
      
      if (savedValuations[lotKey]) {
        setValuationData(savedValuations[lotKey]);
      } else {
        // Set default assessment date to today
        setValuationData(prev => ({
          ...prev,
          assessmentDate: new Date().toISOString().split('T')[0]
        }));
      }
    }
  }, [selectedLot, planId]);

  // Calculate total value when individual values change
  useEffect(() => {
    if (isEditing) {
      const values = [
        valuationData.statutorilyAmount,
        valuationData.additionAmount,
        valuationData.developmentAmount,
        valuationData.courtAmount,
        valuationData.thirtyThreeAmount,
        valuationData.boardOfReviewAmount
      ];
      
      const total = values.reduce((sum, value) => {
        const numValue = parseFloat(value) || 0;
        return sum + numValue;
      }, 0);
      
      setValuationData(prev => ({
        ...prev,
        totalValue: total.toString()
      }));
    }
  }, [
    valuationData.landValue,
    valuationData.buildingValue,
    valuationData.treeValue,
    valuationData.cropsValue,
    isEditing
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValuationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!canEdit || !selectedLot || !planId) {
      alert('You do not have permission to edit valuation details.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Save valuation data to localStorage
      const existingData = JSON.parse(localStorage.getItem('lotValuations') || '{}');
      const lotKey = `${planId}_${selectedLot.id}`;
      
      existingData[lotKey] = {
        ...valuationData,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: userRole,
        status: 'completed'
      };
      
      localStorage.setItem('lotValuations', JSON.stringify(existingData));
      
      setIsEditing(false);
      alert('Valuation details saved successfully!');
    } catch (error) {
      alert('Error saving valuation details. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      alert('Only Financial Officers can edit valuation details.');
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reload data from localStorage to cancel changes
    if (selectedLot && planId) {
      const savedValuations = JSON.parse(localStorage.getItem('lotValuations') || '{}');
      const lotKey = `${planId}_${selectedLot.id}`;
      
      if (savedValuations[lotKey]) {
        setValuationData(savedValuations[lotKey]);
      }
    }
    setIsEditing(false);
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    const numValue = parseFloat(value);
    return `Rs. ${numValue.toLocaleString()}`;
  };

  if (!selectedLot) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Calculator className="mx-auto mb-4 text-gray-400" size={48} />
        <p>No lot selected. Please select a lot to view valuation details.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calculator className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">
            Valuation Details - Lot {selectedLot.id}
          </h3>
          {!canEdit && (
            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
              <Lock size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">View Only</span>
            </div>
          )}
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <button
              onClick={handleEdit}
              disabled={!canEdit}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                canEdit 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Edit size={16} />
              <span>Edit</span>
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {isEditing ? (
        <form className="space-y-6">
          {/* Assessment Information */}
          <div className="border border-blue-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-blue-700 mb-4">Assessment Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Date
                </label>
                <input
                  type="date"
                  name="assessmentDate"
                  value={valuationData.assessmentDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessor Name
                </label>
                <input
                  type="text"
                  name="assessorName"
                  value={valuationData.assessorName}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Financial Officer"
                />
              </div>
            </div>
          </div>

          {/* Valuation Breakdown */}
          <div className="border border-slate-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-slate-700 mb-4">Valuation Breakdown</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Statutorily Amount (Rs.)
                </label>
                <input
                  type="number"
                  name="statutorilyAmount"
                  value={valuationData.statutorilyAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  name="additionAmount"
                  value={valuationData.additionAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  name="developmentAmount"
                  value={valuationData.developmentAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  name="courtAmount"
                  value={valuationData.courtAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  name="thirtyThreeAmount"
                  value={valuationData.thirtyThreeAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
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
                  name="boardOfReviewAmount"
                  value={valuationData.boardOfReviewAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., 75000"
                  step="0.01"
                />
              </div>
            </div>

            {/* Total Calculation */}
            <div className="mt-4 bg-slate-50 p-3 rounded-md">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-slate-700">Total Valuation:</span>
                <span className="text-lg font-semibold text-slate-800">
                  {formatCurrency(valuationData.totalValue)}
                </span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-4">Notes</h4>
            <textarea
              name="notes"
              value={valuationData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Add any notes about the valuation..."
            />
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Display Mode */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Assessment Date</label>
                <p className="text-gray-800 font-medium">
                  {valuationData.assessmentDate || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Assessor Name</label>
                <p className="text-gray-800 font-medium">
                  {valuationData.assessorName || 'Not assigned'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Statutorily Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.statutorilyAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Addition Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.additionAmount)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Development Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.developmentAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Court Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.courtAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">33% Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.thirtyThreeAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Board of Review Amount</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(valuationData.boardOfReviewAmount)}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  valuationData.status === 'completed' ? 'bg-slate-200 text-slate-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {valuationData.status === 'completed' ? 'Completed' : 'Draft'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Valuation</label>
                <p className="text-gray-800 font-medium text-lg">
                  {formatCurrency(valuationData.totalValue)}
                </p>
              </div>
            </div>
          </div>

          {valuationData.notes && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-gray-800 mt-1">{valuationData.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ValuationDetails;

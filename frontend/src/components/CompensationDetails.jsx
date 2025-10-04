import React, { useState, useEffect } from 'react';
import { DollarSign, Save, Edit, Lock } from 'lucide-react';

const CompensationDetails = ({ lotId, planId, userRole = 'Financial Officer' }) => {
  const [compensationData, setCompensationData] = useState({
    propertyValuation: '',
    compensationAmount: '',
    marketValue: '',
    buildingValue: '',
    treeValue: '',
    cropsValue: '',
    disturbanceAllowance: '',
    solatiumPayment: '',
    additionalCompensation: '',
    totalCompensation: '',
    finalCompensationAmount: '',
    paymentStatus: 'pending',
    approvalStatus: 'draft',
    assessmentDate: '',
    approvalDate: '',
    notes: '',
    lastUpdatedBy: '',
    lastUpdated: ''
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Check if user has permission to edit
  const canEdit = userRole === 'financial_officer';

  useEffect(() => {
    // Load existing compensation data if available
    const savedCompensationData = JSON.parse(localStorage.getItem('compensationData') || '{}');
    const lotKey = `${planId}_${lotId}`;
    
    if (savedCompensationData[lotKey]) {
      setCompensationData(savedCompensationData[lotKey]);
    } else {
      // Set default assessment date to today
      setCompensationData(prev => ({
        ...prev,
        assessmentDate: new Date().toISOString().split('T')[0]
      }));
    }
  }, [lotId, planId]);

  // Calculate total compensation when individual values change
  useEffect(() => {
    if (isEditing) {
      const values = [
        compensationData.propertyValuation,
        compensationData.buildingValue,
        compensationData.treeValue,
        compensationData.cropsValue,
        compensationData.disturbanceAllowance,
        compensationData.solatiumPayment,
        compensationData.additionalCompensation
      ];
      
      const total = values.reduce((sum, value) => {
        const numValue = parseFloat(value) || 0;
        return sum + numValue;
      }, 0);
      
      setCompensationData(prev => ({
        ...prev,
        totalCompensation: total.toString(),
        compensationAmount: total.toString()
      }));
    }
  }, [
    compensationData.propertyValuation,
    compensationData.buildingValue,
    compensationData.treeValue,
    compensationData.cropsValue,
    compensationData.disturbanceAllowance,
    compensationData.solatiumPayment,
    compensationData.additionalCompensation,
    isEditing
  ]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompensationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!canEdit) {
      alert('You do not have permission to edit compensation details.');
      return;
    }

    setIsSaving(true);
    
    try {
      // Save compensation data to localStorage
      const existingData = JSON.parse(localStorage.getItem('compensationData') || '{}');
      const lotKey = `${planId}_${lotId}`;
      
      existingData[lotKey] = {
        ...compensationData,
        lastUpdated: new Date().toISOString(),
        lastUpdatedBy: userRole,
        approvalStatus: compensationData.approvalStatus || 'draft'
      };
      
      localStorage.setItem('compensationData', JSON.stringify(existingData));
      
      setIsEditing(false);
      alert('Compensation details saved successfully!');
    } catch (error) {
      alert('Error saving compensation details. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (!canEdit) {
      alert('Only Financial Officers can edit compensation details.');
      return;
    }
    setIsEditing(true);
  };

  const handleCancel = () => {
    // Reload data from localStorage to cancel changes
    const savedCompensationData = JSON.parse(localStorage.getItem('compensationData') || '{}');
    const lotKey = `${planId}_${lotId}`;
    
    if (savedCompensationData[lotKey]) {
      setCompensationData(savedCompensationData[lotKey]);
    }
    setIsEditing(false);
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    const numValue = parseFloat(value);
    return `Rs. ${numValue.toLocaleString()}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <DollarSign className="text-green-600" size={24} />
          <h2 className="text-xl font-bold text-gray-800">Compensation Details</h2>
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
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
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
            <h3 className="text-lg font-medium text-blue-700 mb-4">Assessment Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Date
                </label>
                <input
                  type="date"
                  name="assessmentDate"
                  value={compensationData.assessmentDate}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Market Value (Rs.)
                </label>
                <input
                  type="number"
                  name="marketValue"
                  value={compensationData.marketValue}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 2500000"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Compensation Breakdown */}
          <div className="border border-green-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-green-700 mb-4">Compensation Breakdown</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Property Valuation (Rs.)
                </label>
                <input
                  type="number"
                  name="propertyValuation"
                  value={compensationData.propertyValuation}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 2000000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Building Value (Rs.)
                </label>
                <input
                  type="number"
                  name="buildingValue"
                  value={compensationData.buildingValue}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 300000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tree Value (Rs.)
                </label>
                <input
                  type="number"
                  name="treeValue"
                  value={compensationData.treeValue}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 50000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Crops Value (Rs.)
                </label>
                <input
                  type="number"
                  name="cropsValue"
                  value={compensationData.cropsValue}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 25000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Disturbance Allowance (Rs.)
                </label>
                <input
                  type="number"
                  name="disturbanceAllowance"
                  value={compensationData.disturbanceAllowance}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 100000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Solatium Payment (Rs.)
                </label>
                <input
                  type="number"
                  name="solatiumPayment"
                  value={compensationData.solatiumPayment}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 75000"
                  step="0.01"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Compensation (Rs.)
                </label>
                <input
                  type="number"
                  name="additionalCompensation"
                  value={compensationData.additionalCompensation}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 50000"
                  step="0.01"
                />
              </div>
              <div className="bg-green-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-green-700 mb-1">
                  Total Compensation (Rs.)
                </label>
                <div className="text-lg font-semibold text-green-800">
                  {formatCurrency(compensationData.totalCompensation)}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Final Compensation Amount to be Paid (Rs.)
                </label>
                <input
                  type="number"
                  name="finalCompensationAmount"
                  value={compensationData.finalCompensationAmount}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="e.g., 2550000"
                  step="0.01"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Enter the final compensation amount to be paid (may differ from calculated total due to adjustments, approvals, etc.)
                </p>
              </div>
            </div>
          </div>

          {/* Status and Approval */}
          <div className="border border-orange-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-orange-700 mb-4">Status & Approval</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Status
                </label>
                <select
                  name="paymentStatus"
                  value={compensationData.paymentStatus}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial Payment</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Approval Status
                </label>
                <select
                  name="approvalStatus"
                  value={compensationData.approvalStatus}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="draft">Draft</option>
                  <option value="submitted">Submitted for Approval</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Notes & Comments</h3>
            <textarea
              name="notes"
              value={compensationData.notes}
              onChange={handleInputChange}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
              placeholder="Add any notes or comments about the compensation assessment..."
            />
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          {/* Display Mode */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Assessment Date</label>
                <p className="text-gray-800 font-medium">
                  {compensationData.assessmentDate || 'Not set'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Market Value</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(compensationData.marketValue)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Property Valuation</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(compensationData.propertyValuation)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Building Value</label>
                <p className="text-gray-800 font-medium">
                  {formatCurrency(compensationData.buildingValue)}
                </p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-600">Payment Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  compensationData.paymentStatus === 'paid' ? 'bg-green-200 text-green-800' :
                  compensationData.paymentStatus === 'approved' ? 'bg-blue-200 text-blue-800' :
                  compensationData.paymentStatus === 'partial' ? 'bg-orange-200 text-orange-800' :
                  'bg-yellow-200 text-yellow-800'
                }`}>
                  {compensationData.paymentStatus || 'pending'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Total Compensation</label>
                <p className="text-gray-800 font-medium text-lg">
                  {formatCurrency(compensationData.totalCompensation)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Final Compensation Amount to be Paid</label>
                <p className="font-medium text-lg text-green-600">
                  {formatCurrency(compensationData.finalCompensationAmount)}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Approval Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                  compensationData.approvalStatus === 'approved' ? 'bg-green-200 text-green-800' :
                  compensationData.approvalStatus === 'submitted' ? 'bg-blue-200 text-blue-800' :
                  compensationData.approvalStatus === 'rejected' ? 'bg-red-200 text-red-800' :
                  'bg-gray-200 text-gray-800'
                }`}>
                  {compensationData.approvalStatus || 'draft'}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Last Updated</label>
                <p className="text-gray-600 text-sm">
                  {compensationData.lastUpdated 
                    ? `${new Date(compensationData.lastUpdated).toLocaleDateString()} by ${compensationData.lastUpdatedBy}`
                    : 'Not updated yet'
                  }
                </p>
              </div>
            </div>
          </div>

          {compensationData.notes && (
            <div className="border-t pt-4">
              <label className="text-sm font-medium text-gray-600">Notes</label>
              <p className="text-gray-800 mt-1">{compensationData.notes}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompensationDetails;

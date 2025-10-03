import React, { useState, useEffect } from 'react';
import { Calculator, Save, Edit, Lock } from 'lucide-react';
import { saveValuation, getValuation } from '../api';

const LotValuationDetails = ({ selectedLot, planId, userRole = 'Financial_Officer' }) => {
  const [valuationData, setValuationData] = useState({
    statutorily_amount: '',
    addition_amount: '',
    development_amount: '',
    court_amount: '',
    thirty_three_amount: '',
    board_of_review_amount: '',
    total_value: '',
    assessment_date: new Date().toISOString().split('T')[0], // Default to current date
    assessor_name: 'Financial_Officer',
    notes: '',
    status: 'draft'
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user can edit (only Financial Officers)
  const canEdit = userRole === 'financial_officer';

  useEffect(() => {
    if (selectedLot && planId) {
      loadValuationData();
    }
  }, [selectedLot, planId]);

  const loadValuationData = async () => {
    if (!selectedLot || !planId) return;
    
    setIsLoading(true);
    try {
      // Use backend_id which is the actual database ID, not the formatted display ID
      let lotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof lotId === 'string' && lotId.startsWith('L')) {
        // Extract numeric part from formatted ID like "L001" -> "1"
        lotId = parseInt(lotId.substring(1));
      }
      
      console.log('Loading valuation for lot:', lotId, 'plan:', planId);
      console.log('selectedLot object:', selectedLot);
      console.log('selectedLot.backend_id:', selectedLot.backend_id, 'selectedLot.id:', selectedLot.id);
      
      const response = await getValuation(planId, lotId);
      
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        setValuationData({
          statutorily_amount: data.statutorily_amount || '',
          addition_amount: data.addition_amount || '',
          development_amount: data.development_amount || '',
          court_amount: data.court_amount || '',
          thirty_three_amount: data.thirty_three_amount || '',
          board_of_review_amount: data.board_of_review_amount || '',
          total_value: data.total_value || '',
          assessment_date: data.assessment_date || '',
          assessor_name: data.assessor_name || 'Financial Officer',
          notes: data.notes || '',
          status: data.status || 'draft'
        });
      } else {
        // No valuation data exists yet
        setValuationData(prev => ({
          ...prev,
          assessment_date: new Date().toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error loading valuation data:', error);
      setValuationData(prev => ({
        ...prev,
        assessment_date: new Date().toISOString().split('T')[0]
      }));
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate total when amounts change
  useEffect(() => {
    if (isEditing) {
      const values = [
        valuationData.statutorily_amount,
        valuationData.addition_amount,
        valuationData.development_amount,
        valuationData.court_amount,
        valuationData.thirty_three_amount,
        valuationData.board_of_review_amount
      ];

      const total = values.reduce((sum, value) => {
        const num = parseFloat(value) || 0;
        return sum + num;
      }, 0);

      setValuationData(prev => ({
        ...prev,
        total_value: total.toFixed(2)
      }));
    }
  }, [
    valuationData.statutorily_amount,
    valuationData.addition_amount,
    valuationData.development_amount,
    valuationData.court_amount,
    valuationData.thirty_three_amount,
    valuationData.board_of_review_amount,
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
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        ...valuationData,
        assessment_date: valuationData.assessment_date || new Date().toISOString().split('T')[0], // Ensure we have a date
        status: 'completed'
      };

      // Use backend_id which is the actual database ID
      let lotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof lotId === 'string' && lotId.startsWith('L')) {
        // Extract numeric part from formatted ID like "L001" -> "1"
        lotId = parseInt(lotId.substring(1));
      }
      
      console.log('Saving valuation for lot:', lotId, 'plan:', planId);

      const response = await saveValuation(planId, lotId, payload);

      if (response.data.success) {
        setIsEditing(false);
        // Reload the data to get the latest from server
        await loadValuationData();
        alert('Valuation saved successfully!');
      } else {
        throw new Error(response.data.message || 'Failed to save valuation');
      }
    } catch (error) {
      console.error('Error saving valuation:', error);
      setError(error.message || 'Failed to save valuation');
      alert('Error saving valuation: ' + (error.message || 'Unknown error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = () => {
    if (canEdit) {
      setIsEditing(true);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    loadValuationData(); // Reload original data
  };

  const formatCurrency = (amount) => {
    if (!amount || amount === '') return 'LKR 0.00';
    const num = parseFloat(amount);
    if (isNaN(num)) return 'LKR 0.00';
    
    return new Intl.NumberFormat('en-LK', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(num);
  };

  if (!selectedLot) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <div className="text-center">
          <Calculator className="mx-auto mb-2 text-gray-400" size={48} />
          <p>Select a lot to view valuation details</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading valuation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Calculator className="text-blue-600" size={24} />
          <h3 className="text-lg font-semibold text-gray-800">
            Valuation Details - Lot {selectedLot.lot_no}
          </h3>
          {!canEdit && (
            <div className="flex items-center space-x-1 bg-gray-100 px-2 py-1 rounded-full">
              <Lock size={14} className="text-gray-500" />
              <span className="text-xs text-gray-500">View Only</span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-3">
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
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                <span>Cancel</span>
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                <Save size={16} />
                <span>{isSaving ? 'Saving...' : 'Save'}</span>
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {isEditing ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Statutorily Amount (LKR)
              </label>
              <input
                type="number"
                name="statutorily_amount"
                value={valuationData.statutorily_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Addition Amount (LKR)
              </label>
              <input
                type="number"
                name="addition_amount"
                value={valuationData.addition_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Development Amount (LKR)
              </label>
              <input
                type="number"
                name="development_amount"
                value={valuationData.development_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Court Amount (LKR)
              </label>
              <input
                type="number"
                name="court_amount"
                value={valuationData.court_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thirty Three Amount (LKR)
              </label>
              <input
                type="number"
                name="thirty_three_amount"
                value={valuationData.thirty_three_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Board of Review Amount (LKR)
              </label>
              <input
                type="number"
                name="board_of_review_amount"
                value={valuationData.board_of_review_amount}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="md:col-span-2 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessment Date
              </label>
              <input
                type="date"
                name="assessment_date"
                value={valuationData.assessment_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Assessor Name
              </label>
              <input
                type="text"
                name="assessor_name"
                value={valuationData.assessor_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Financial Officer"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={valuationData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional notes about the valuation..."
              />
            </div>

            <div className="border border-green-300 rounded-lg p-4 bg-green-50">
              <h4 className="text-md font-medium text-green-700 mb-2">Total Valuation</h4>
              <div className="text-3xl font-bold text-green-600">
                {formatCurrency(valuationData.total_value)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Valuation Amounts</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Statutorily Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.statutorily_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Addition Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.addition_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Development Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.development_amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-3">Additional Amounts</h4>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Court Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.court_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Thirty Three Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.thirty_three_amount)}
                </p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Board of Review Amount:</span>
                <p className="font-medium text-lg">
                  {formatCurrency(valuationData.board_of_review_amount)}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-green-300 rounded-lg p-4 bg-green-50">
            <h4 className="text-md font-medium text-green-700 mb-2">Total Valuation</h4>
            <div className="text-3xl font-bold text-green-600">
              {formatCurrency(valuationData.total_value)}
            </div>
          </div>

          {valuationData.notes && (
            <div className="border border-gray-300 rounded-lg p-4">
              <h4 className="text-md font-medium text-gray-700 mb-2">Notes</h4>
              <p className="text-gray-600">{valuationData.notes}</p>
            </div>
          )}

          <div className="border border-gray-300 rounded-lg p-4">
            <h4 className="text-md font-medium text-gray-700 mb-2">Status</h4>
            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
              {valuationData.status || 'Draft'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default LotValuationDetails;

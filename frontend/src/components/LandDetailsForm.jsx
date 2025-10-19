import React, { useState, useEffect } from 'react';
import { Save, MapPin } from 'lucide-react';
import api from '../api';
import { hectaresToPerches, perchesToHectares, HECTARE_TO_PERCH_RATIO } from '../utils/areaConversion';

const LandDetailsForm = ({ lotId, initialData, onSave, onCancel, planData }) => {
  const [formData, setFormData] = useState({
    land_type: 'Private',
    advance_tracing_no: '',
    advance_tracing_extent_ha: '',
    advance_tracing_extent_perch: '',
    preliminary_plan_extent_ha: '',
    preliminary_plan_extent_perch: ''
  });

  const [advanceTracingNumbers, setAdvanceTracingNumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const landTypes = ['State', 'Private', 'Development Only'];

  useEffect(() => {
    if (initialData) {
      setFormData({
        land_type: initialData.land_type || 'Private',
        advance_tracing_no: initialData.advance_tracing_no || '',
        advance_tracing_extent_ha: initialData.advance_tracing_extent_ha || '',
        advance_tracing_extent_perch: initialData.advance_tracing_extent_perch || '',
        preliminary_plan_extent_ha: initialData.preliminary_plan_extent_ha || '',
        preliminary_plan_extent_perch: initialData.preliminary_plan_extent_perch || ''
      });
    }
  }, [initialData]);

  useEffect(() => {
    // Set advance tracing number from plan data if available
    if (planData?.advance_tracing_no && !formData.advance_tracing_no) {
      setFormData(prev => ({
        ...prev,
        advance_tracing_no: planData.advance_tracing_no
      }));
    }
  }, [planData]);

  const loadAdvanceTracingNumbers = async () => {
    try {
      const response = await api.get('/api/lots/advance-tracing-numbers');
      setAdvanceTracingNumbers(response.data);
    } catch (error) {
      console.error('Error loading advance tracing numbers:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Area conversion using utility functions
    
    // Handle advance tracing extent ha to perch conversion
    if (name === 'advance_tracing_extent_ha' && value !== '') {
      const hectares = parseFloat(value);
      if (!isNaN(hectares)) {
        const perches = hectaresToPerches(hectares);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          advance_tracing_extent_perch: perches
        }));
        return;
      }
    }
    
    // Handle advance tracing extent perch to ha conversion
    if (name === 'advance_tracing_extent_perch' && value !== '') {
      const perches = parseFloat(value);
      if (!isNaN(perches)) {
        const hectares = perchesToHectares(perches);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          advance_tracing_extent_ha: hectares
        }));
        return;
      }
    }
    
    // Handle preliminary plan extent ha to perch conversion
    if (name === 'preliminary_plan_extent_ha' && value !== '') {
      const hectares = parseFloat(value);
      if (!isNaN(hectares)) {
        const perches = hectaresToPerches(hectares);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          preliminary_plan_extent_perch: perches
        }));
        return;
      }
    }
    
    // Handle preliminary plan extent perch to ha conversion
    if (name === 'preliminary_plan_extent_perch' && value !== '') {
      const perches = parseFloat(value);
      if (!isNaN(perches)) {
        const hectares = perchesToHectares(perches);
        setFormData(prev => ({
          ...prev,
          [name]: value,
          preliminary_plan_extent_ha: hectares
        }));
        return;
      }
    }
    
    // Regular input handling for other fields
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear any previous errors

    try {
      const dataToSend = {
        land_type: formData.land_type,
        advance_tracing_no: formData.advance_tracing_no || null,
        advance_tracing_extent_ha: parseFloat(formData.advance_tracing_extent_ha) || null,
        advance_tracing_extent_perch: parseFloat(formData.advance_tracing_extent_perch) || null,
        preliminary_plan_extent_ha: parseFloat(formData.preliminary_plan_extent_ha) || null,
        preliminary_plan_extent_perch: parseFloat(formData.preliminary_plan_extent_perch) || null
      };

      console.log('Saving land details:', dataToSend);
      const response = await api.post(`/api/lots/${lotId}/land-details`, dataToSend);
      
      if (onSave) {
        // Pass the landDetails from the response, or the original data if not available
        onSave(response.data.landDetails || dataToSend);
      }
      
      // Show success message
      alert('Land details saved successfully!');
    } catch (error) {
      console.error('Error saving land details:', error);
      setError(
        error.response?.data?.error || 
        'Failed to save land details. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-2 mb-6">
        <MapPin className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-800">Land Details</h2>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type of Land */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type of Land <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="land_type"
              value={formData.land_type}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              required
            >
              {landTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Advance Tracing No */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Advance Tracing No
          </label>
          <div className="relative">
            <select
              name="advance_tracing_no"
              value={formData.advance_tracing_no}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="">Select Advance Tracing No</option>
              {/* Show plan's Advance Tracing No first if available */}
              {planData?.advance_tracing_no && (
                <option value={planData.advance_tracing_no}>
                  {planData.advance_tracing_no} (From Plan)
                </option>
              )}
              {/* Show other available advance tracing numbers */}
              {advanceTracingNumbers
                .filter(number => number !== planData?.advance_tracing_no)
                .map((number) => (
                  <option key={number} value={number}>
                    {number}
                  </option>
                ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {planData?.advance_tracing_no 
              ? `Plan's Advance Tracing No: ${planData.advance_tracing_no}`
              : 'Same for relevant lot under relevant plan under relevant project'
            }
          </div>
        </div>

        {/* Size of The Lot */}
        <div>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Size of The Lot</h3>
          
          {/* Advance Tracing Extent */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Advance Tracing Extent
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  (ha)
                  {formData.advance_tracing_extent_perch && (
                    <span className="text-blue-600 font-normal ml-1">(Auto-calculated from perches)</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="advance_tracing_extent_ha"
                  value={formData.advance_tracing_extent_ha}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.advance_tracing_extent_perch ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  placeholder="0.0000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Perch
                  {formData.advance_tracing_extent_ha && (
                    <span className="text-blue-600 font-normal ml-1">(Auto-calculated from hectares)</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="advance_tracing_extent_perch"
                  value={formData.advance_tracing_extent_perch}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.advance_tracing_extent_ha ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  placeholder="0.0000"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Conversion: 1 hectare = {HECTARE_TO_PERCH_RATIO} perches. Enter value in either field to auto-calculate the other.
            </div>
          </div>

          {/* Preliminary Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preliminary Plan
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  (ha)
                  {formData.preliminary_plan_extent_perch && (
                    <span className="text-blue-600 font-normal ml-1">(Auto-calculated from perches)</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="preliminary_plan_extent_ha"
                  value={formData.preliminary_plan_extent_ha}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.preliminary_plan_extent_perch ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  placeholder="0.0000"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  Perch
                  {formData.preliminary_plan_extent_ha && (
                    <span className="text-blue-600 font-normal ml-1">(Auto-calculated from hectares)</span>
                  )}
                </label>
                <input
                  type="number"
                  step="0.0001"
                  name="preliminary_plan_extent_perch"
                  value={formData.preliminary_plan_extent_perch}
                  onChange={handleInputChange}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.preliminary_plan_extent_ha ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                  placeholder="0.0000"
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Conversion: 1 hectare = {HECTARE_TO_PERCH_RATIO} perches. Enter value in either field to auto-calculate the other.
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? 'Saving...' : 'Save Land Details'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default LandDetailsForm;

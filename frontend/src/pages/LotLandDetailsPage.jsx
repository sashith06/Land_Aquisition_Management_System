import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import api from '../api';
import LandDetailsForm from '../components/LandDetailsForm';

const LotLandDetailsPage = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  
  const [lot, setLot] = useState(null);
  const [landDetails, setLandDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLotAndLandDetails();
  }, [lotId]);

  const loadLotAndLandDetails = async () => {
    try {
      setLoading(true);
      
      // Load lot basic info
      const lotResponse = await api.get(`/api/lots/${lotId}`);
      setLot(lotResponse.data);
      
      // Load existing land details if any
      try {
        const landDetailsResponse = await api.get(`/api/lots/${lotId}/land-details`);
        setLandDetails(landDetailsResponse.data);
      } catch (err) {
        // If no land details exist yet, that's okay
        if (err.response?.status !== 404) {
          throw err;
        }
      }
      
    } catch (error) {
      console.error('Error loading data:', error);
      setError(error.response?.data?.error || 'Failed to load lot information');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLandDetails = (updatedLandDetails) => {
    setLandDetails(updatedLandDetails);
  };

  const handleBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading lot details...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error</h3>
          <p className="text-red-600 mt-1">{error}</p>
          <button 
            onClick={handleBack}
            className="mt-3 text-red-600 hover:text-red-800 underline"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Land Details - Lot {lot?.lot_number}
          </h1>
          {lot && (
            <p className="text-gray-600 mt-1">
              Plan: {lot.plan_name || 'N/A'} | Project: {lot.project_name || 'N/A'}
            </p>
          )}
        </div>
      </div>

      {/* Land Details Form */}
      <LandDetailsForm
        lotId={lotId}
        initialData={landDetails}
        onSave={handleSaveLandDetails}
        onCancel={handleBack}
      />
    </div>
  );
};

export default LotLandDetailsPage;
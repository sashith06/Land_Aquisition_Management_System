import React, { useState, useEffect } from 'react';
import { User, DollarSign, Save, Edit, Building, TreePine, Wheat, Home, Users, MapPin, Phone, Percent, Lock, Check } from 'lucide-react';
import { saveCompensation, getCompensation, getPlanById } from '../api';
import { getUserRole } from './ProtectedRoute';

const CompensationDetailsTab = ({ selectedLot, planId, userRole }) => {
  const [compensationData, setCompensationData] = useState({});
  const [editingOwner, setEditingOwner] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Get planId from URL if not provided
  const currentPlanId = planId || window.location.pathname.split('/')[3];

  // Get authenticated user role if not provided
  const authenticatedRole = getUserRole();
  const effectiveUserRole = userRole || authenticatedRole;

  // Check if user has permission to edit - only Financial Officers can edit compensation
  const canEdit = effectiveUserRole === 'financial_officer' || effectiveUserRole === 'Financial Officer' || effectiveUserRole === 'FO';

  // Load plan data to get Section 38 gazette date
  useEffect(() => {
    if (currentPlanId) {
      loadPlanData();
    }
  }, [currentPlanId]);

  // Load compensation data from API
  useEffect(() => {
    if (selectedLot && currentPlanId) {
      loadCompensationData();
    }
  }, [selectedLot, currentPlanId]);

  const loadPlanData = async () => {
    try {
      const response = await getPlanById(currentPlanId);
      console.log('Plan data response:', response.data);
      setPlanData(response.data);
    } catch (error) {
      console.error('Error loading plan data:', error);
    }
  };

  const loadCompensationData = async () => {
    if (!selectedLot || !currentPlanId) return;
    
    setIsLoading(true);
    try {
      // Use backend_id which is the actual database ID
      let lotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof lotId === 'string' && lotId.startsWith('L')) {
        lotId = parseInt(lotId.substring(1));
      }
      
      console.log('Loading compensation for lot:', lotId, 'plan:', currentPlanId);
      
      const response = await getCompensation(currentPlanId, lotId);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        
        // Convert API data back to component format
        const ownerData = data.owner_data || [];
        const newCompensationData = {};
        
        ownerData.forEach(owner => {
          const key = `${currentPlanId}_${lotId}_${owner.nic}`;
          newCompensationData[key] = owner;
        });
        
        setCompensationData(newCompensationData);
        setPaymentDetails(data.compensation_payment || {});
      }
    } catch (error) {
      console.error('Error loading compensation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompensation = (owner) => {
    // Check if user has permission to edit
    if (!canEdit) {
      alert('Access Denied: Only Financial Officers can edit compensation details.');
      return;
    }

    // Use backend_id for consistent key generation
    const editLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${editLotId}_${owner.nic}`;
    const existing = compensationData[key] || {
      propertyValue: '',
      buildingValue: '',
      treeValue: '',
      cropsValue: '',
      disturbanceAllowance: '',
      solatiumPayment: '',
      additionalCompensation: '',
      totalCompensation: '',
      paymentStatus: 'pending',
      approvalStatus: 'pending',
      assessmentDate: new Date().toISOString().split('T')[0],
      assessorName: effectiveUserRole,
      notes: '',
      bankDetails: {
        accountName: owner.name,
        accountNumber: '',
        bankName: '',
        branchCode: ''
      },
      lotShare: (100 / selectedLot.owners.length).toString()
    };
    
    setEditingOwner({ ...owner, compensation: existing });
  };

  const handleSaveCompensation = async () => {
    if (!editingOwner || !canEdit) return;

    setIsSaving(true);
    
    try {
      // Use backend_id for consistent key generation
      const actualLotId = selectedLot.backend_id || selectedLot.id;
      const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
      const compensationInfo = editingOwner.compensation;
      
      // Calculate total compensation
      const total = [
        'propertyValue', 'buildingValue', 'treeValue', 'cropsValue',
        'disturbanceAllowance', 'solatiumPayment', 'additionalCompensation'
      ].reduce((sum, field) => {
        return sum + (parseFloat(compensationInfo[field]) || 0);
      }, 0);

      const updatedCompensation = {
        ...compensationInfo,
        totalCompensation: total.toString(),
        lastUpdated: new Date().toISOString(),
        nic: editingOwner.nic,
        name: editingOwner.name,
        compensation_amount: total
      };

      const newData = {
        ...compensationData,
        [key]: updatedCompensation
      };

      // Prepare data for API
      const ownerDataArray = Object.values(newData);
      const compensationPayload = {
        owner_data: ownerDataArray,
        compensation_payment: paymentDetails,
        interest_payment: {},
        interest_voucher: {},
        account_division: {},
        total_compensation: ownerDataArray.reduce((sum, owner) => sum + (parseFloat(owner.totalCompensation) || 0), 0)
      };

      // Use backend_id which is the actual database ID
      let saveLotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof saveLotId === 'string' && saveLotId.startsWith('L')) {
        saveLotId = parseInt(saveLotId.substring(1));
      }
      
      console.log('Saving compensation for lot:', saveLotId, 'plan:', currentPlanId);

      const response = await saveCompensation(currentPlanId, saveLotId, compensationPayload);
      
      if (response.data.success) {
        setCompensationData(newData);
        setEditingOwner(null);
        alert('Compensation details saved successfully!');
        await loadCompensationData();
      } else {
        alert('Error saving compensation details. Please try again.');
      }
    } catch (error) {
      console.error('Save error:', error);
      
      if (error.response?.status === 403) {
        alert('Access Denied: Only Financial Officers can modify compensation details.');
      } else if (error.response?.status === 401) {
        alert('Authentication required. Please login again.');
      } else {
        alert('Error saving compensation details. Please try again.');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (!editingOwner) return;
    
    if (field.startsWith('bankDetails.')) {
      const bankField = field.split('.')[1];
      setEditingOwner(prev => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          bankDetails: {
            ...prev.compensation.bankDetails,
            [bankField]: value
          }
        }
      }));
    } else {
      setEditingOwner(prev => ({
        ...prev,
        compensation: {
          ...prev.compensation,
          [field]: value
        }
      }));
    }
  };

  const handlePaymentDetailsChange = (section, field, subField, value) => {
    const key = `${currentPlanId}_${selectedLot.id}_${editingOwner.nic}`;
    
    setPaymentDetails(prev => {
      const updated = { ...prev };
      if (!updated[key]) updated[key] = {};
      if (!updated[key][section]) updated[key][section] = {};
      
      if (subField) {
        if (!updated[key][section][field]) updated[key][section][field] = {};
        updated[key][section][field][subField] = value;
      } else {
        updated[key][section][field] = value;
      }
      
      return updated;
    });
  };

  const getPaymentDetailsValue = (section, field, subField = null) => {
    if (!editingOwner) return '';
    const key = `${currentPlanId}_${selectedLot.id}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data[section] || !data[section][field]) return '';
    return subField ? (data[section][field][subField] || '') : data[section][field];
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    return `Rs. ${parseFloat(value).toLocaleString()}`;
  };

  const getOwnerCompensationStatus = (owner) => {
    const key = `${currentPlanId}_${selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    if (!data) return 'pending';
    return data.paymentStatus || 'pending';
  };

  const getOwnerCompensationTotal = (owner) => {
    const key = `${currentPlanId}_${selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    return data?.totalCompensation || '0';
  };

  const getOwnerSharePercentage = (owner) => {
    const key = `${currentPlanId}_${selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    return data?.lotShare || (100 / selectedLot.owners.length).toString();
  };

  const getLotTotalCompensation = () => {
    if (!selectedLot) return 0;
    
    let total = 0;
    selectedLot.owners.forEach(owner => {
      const ownerTotal = parseFloat(getOwnerCompensationTotal(owner)) || 0;
      total += ownerTotal;
    });
    
    return total;
  };

  if (!selectedLot) {
    return (
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Lot</h3>
        <p className="text-gray-500">
          Please select a lot from the left panel to manage owner-wise compensation details.
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading compensation data...</p>
        </div>
      </div>
    );
  }

  if (!selectedLot.owners || selectedLot.owners.length === 0) {
    return (
      <div className="text-center py-12 bg-yellow-50 rounded-lg border border-yellow-200">
        <Users className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">No Owners Found</h3>
        <p className="text-yellow-600">
          This lot doesn't have any owners assigned. Please add owners in the Owner Details tab first.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Lot Summary */}
      <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-lg border border-orange-200">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-orange-800 flex items-center">
              <Users className="w-6 h-6 mr-2" />
              Owner-wise Compensation Management
            </h3>
            <p className="text-orange-600 mt-1">
              Individual compensation details for each property owner
            </p>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-700">Plan {currentPlanId}</div>
            <div className="text-lg font-semibold text-orange-800">
              Lot {selectedLot.id}
            </div>
          </div>
        </div>

        {/* Access Restriction Notice */}
        {!canEdit && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
            <div className="flex items-center">
              <Lock className="w-5 h-5 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  View-Only Mode
                </p>
                <p className="text-xs text-yellow-700">
                  Only Financial Officers can edit compensation details. You can view existing data but cannot make changes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Lot Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Total Owners</div>
            <div className="text-xl font-bold text-orange-600">{selectedLot.owners.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Lot Size</div>
            <div className="text-xl font-bold text-slate-600">{selectedLot.size}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Location</div>
            <div className="text-sm font-medium text-slate-600 flex items-center">
              <MapPin className="w-3 h-3 mr-1" />
              {selectedLot.location}
            </div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Total Compensation</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(getLotTotalCompensation())}</div>
          </div>
        </div>
      </div>

      {/* Rest of the component remains the same... */}
      {/* Individual Owner Compensation Cards and Modal */}
    </div>
  );
};

export default CompensationDetailsTab;
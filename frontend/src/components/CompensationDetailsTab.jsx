import React, { useState, useEffect } from 'react';
import { User, DollarSign, Save, Edit, Building, TreePine, Wheat, Home, Users, MapPin, Phone, Percent, Check, Eye, Lock } from 'lucide-react';
import api, { saveCompensation, getCompensation, getPlanById } from '../api';
import { getUserRole } from './ProtectedRoute';

const CompensationDetailsTab = ({ selectedLot, planId, landDetails: propLandDetails }) => {
  const [compensationData, setCompensationData] = useState({});
  const [editingOwner, setEditingOwner] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [landDetails, setLandDetails] = useState(null);

  // Get planId from URL if not provided
  const currentPlanId = planId || window.location.pathname.split('/')[3];

  // Get actual user role from token
  const actualUserRole = getUserRole();

  // Check if user has permission to edit (only financial officers can edit)
  const canEdit = actualUserRole === 'financial_officer';

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
      loadLandDetails();
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

  const loadLandDetails = async () => {
    if (!selectedLot) return;
    
    try {
      const lotId = selectedLot.backend_id || selectedLot.id;
      const response = await api.get(`/api/lots/${lotId}/land-details`);
      setLandDetails(response.data);
    } catch (error) {
      if (error.response?.status !== 404) {
        console.error('Error loading land details:', error);
      }
      // If no land details exist (404), that's fine
      setLandDetails(null);
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
        // Extract numeric part from formatted ID like "L001" -> "1"
        lotId = parseInt(lotId.substring(1));
      }
      
      console.log('Loading compensation for lot:', lotId, 'plan:', currentPlanId);
      console.log('selectedLot object:', selectedLot);
      console.log('selectedLot.backend_id:', selectedLot.backend_id, 'selectedLot.id:', selectedLot.id);
      console.log('Final URL will be: /api/plans/' + currentPlanId + '/lots/' + lotId + '/compensation');
      
      const response = await getCompensation(currentPlanId, lotId);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('📡 Received compensation data from API:', data);
        
        // Convert API data back to component format
        const ownerData = data.owner_data || [];
        const newCompensationData = {};
        
        console.log('👥 Owner data from API:', ownerData);
        
        ownerData.forEach(owner => {
          // Use same key format as handleEditCompensation for consistency
          const dataLotId = selectedLot.backend_id || selectedLot.id;
          const key = `${currentPlanId}_${dataLotId}_${owner.nic}`;
          console.log('💾 Storing data with key:', key, 'for owner:', owner.name || owner.nic);
          console.log('💾 Owner data being stored:', owner);
          newCompensationData[key] = owner;
        });
        
        console.log('📋 Final compensationData state:', newCompensationData);
        setCompensationData(newCompensationData);
        setPaymentDetails(data.compensation_payment || {});
      } else {
        console.log('❌ No data received or unsuccessful response:', response.data);
      }
    } catch (error) {
      console.error('Error loading compensation data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditCompensation = (owner) => {
    // Opens compensation form modal for viewing/editing (role-based access controlled by canEdit)
    // Use backend_id for consistent key generation
    const editLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${editLotId}_${owner.nic}`;
    
    console.log('🔍 Opening compensation form for owner:', owner.name);
    console.log('🔍 Looking for data with key:', key);
    console.log('🔍 Available compensation data keys:', Object.keys(compensationData));
    console.log('🔍 Data found for this owner:', compensationData[key]);
    
    const existing = compensationData[key] || {
      // Only final compensation amount - no breakdown calculations
      finalCompensationAmount: '',
      paymentStatus: 'pending',
      assessmentDate: new Date().toISOString().split('T')[0],
      assessorName: actualUserRole,
      notes: ''
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
      
      // No breakdown calculation - just use the final compensation amount
      const updatedCompensation = {
        ...compensationInfo,
        lastUpdated: new Date().toISOString(),
        nic: editingOwner.nic,
        name: editingOwner.name,
        finalCompensationAmount: compensationInfo.finalCompensationAmount || 0
      };

      const newData = {
        ...compensationData,
        [key]: updatedCompensation
      };

      // Prepare data for API - flat structure for new controller
      const ownerKey = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
      const ownerPaymentData = paymentDetails[ownerKey] || {};
      const compensationPaymentData = ownerPaymentData.compensationPayment || {};
      
      const compensationPayload = {
        owner_nic: editingOwner.nic,
        owner_name: editingOwner.name,
        final_compensation_amount: updatedCompensation.finalCompensationAmount || 0,
        
        // Compensation payment details
        compensation_full_payment_date: compensationPaymentData.fullPayment?.date || null,
        compensation_full_payment_cheque_no: compensationPaymentData.fullPayment?.chequeNo || null,
        compensation_full_payment_deducted_amount: compensationPaymentData.fullPayment?.deductedAmount || 0,
        compensation_full_payment_paid_amount: compensationPaymentData.fullPayment?.paidAmount || 0,
        
        compensation_part_payment_01_date: compensationPaymentData.partPayment01?.date || null,
        compensation_part_payment_01_cheque_no: compensationPaymentData.partPayment01?.chequeNo || null,
        compensation_part_payment_01_deducted_amount: compensationPaymentData.partPayment01?.deductedAmount || 0,
        compensation_part_payment_01_paid_amount: compensationPaymentData.partPayment01?.paidAmount || 0,
        
        compensation_part_payment_02_date: compensationPaymentData.partPayment02?.date || null,
        compensation_part_payment_02_cheque_no: compensationPaymentData.partPayment02?.chequeNo || null,
        compensation_part_payment_02_deducted_amount: compensationPaymentData.partPayment02?.deductedAmount || 0,
        compensation_part_payment_02_paid_amount: compensationPaymentData.partPayment02?.paidAmount || 0,
        
        created_by: 'system',
        updated_by: 'system'
      };
      
      console.log('🛰 Sending payload:', compensationPayload);

      // Use backend_id which is the actual database ID
      let saveLotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof saveLotId === 'string' && saveLotId.startsWith('L')) {
        // Extract numeric part from formatted ID like "L001" -> "1"
        saveLotId = parseInt(saveLotId.substring(1));
      }
      
      console.log('Saving compensation for lot:', saveLotId, 'plan:', currentPlanId);

      const response = await saveCompensation(currentPlanId, saveLotId, compensationPayload);
      
      if (response.data.success) {
        setCompensationData(newData);
        setEditingOwner(null);
        alert('Compensation details saved successfully!');
        // Reload data to get latest from server
        await loadCompensationData();
      } else {
        alert('Error saving compensation details. Please try again.');
      }
    } catch (error) {
      alert('Error saving compensation details. Please try again.');
      console.error('Save error:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (!editingOwner) return;
    
    setEditingOwner(prev => ({
      ...prev,
      compensation: {
        ...prev.compensation,
        [field]: value
      }
    }));
  };

  // Payment details handler for the new payment form structure
  const handlePaymentDetailsChange = (section, field, subField, value) => {
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    
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
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data[section] || !data[section][field]) return '';
    return subField ? (data[section][field][subField] || '') : data[section][field];
  };

  // Helper function to check if payment details are filled
  const isPaymentFilled = (section, field) => {
    if (!editingOwner) return false;
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data[section] || !data[section][field]) return false;
    
    const fieldData = data[section][field];
    // Check if at least date and one amount field are filled
    return fieldData.date && (fieldData.paidAmount || fieldData.chequeNo);
  };

  // Helper function to check if account division date is filled
  const isAccountDivisionFilled = () => {
    if (!editingOwner) return false;
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data.accountDivision || !data.accountDivision.sentDate) return false;
    return data.accountDivision.sentDate.date;
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    return `Rs. ${parseFloat(value).toLocaleString()}`;
  };

  const getOwnerCompensationStatus = (owner) => {
    const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    if (!data) return 'pending';
    return data.paymentStatus || 'pending';
  };

  const getOwnerCompensationTotal = (owner) => {
    const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    return data?.totalCompensation || '0';
  };

  const getOwnerSharePercentage = (owner) => {
    const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
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

  // Get the sum of all finalCompensationAmount values for all owners
  const getLotTotalFinalCompensation = () => {
    if (!selectedLot) return 0;
    
    let total = 0;
    selectedLot.owners.forEach(owner => {
      const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
      const data = compensationData[key];
      const finalAmount = parseFloat(data?.finalCompensationAmount) || 0;
      total += finalAmount;
    });
    
    return total;
  };

  // Get owner's final compensation amount
  const getOwnerFinalCompensation = (owner) => {
    const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    return parseFloat(data?.finalCompensationAmount) || 0;
  };

  // Get total payment done for an owner
  const getOwnerTotalPaymentDone = (owner) => {
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${owner.nic}`;
    const data = paymentDetails[key];
    if (!data) return 0;
    
    let total = 0;
    // Sum up all compensation payments
    if (data.compensationPayment) {
      total += parseFloat(data.compensationPayment.fullPayment?.paidAmount) || 0;
      total += parseFloat(data.compensationPayment.partPayment01?.paidAmount) || 0;
      total += parseFloat(data.compensationPayment.partPayment02?.paidAmount) || 0;
    }
    return total;
  };

  // Get balance due for an owner
  const getOwnerBalanceDue = (owner) => {
    const finalAmount = getOwnerFinalCompensation(owner);
    const paymentDone = getOwnerTotalPaymentDone(owner);
    return Math.max(0, finalAmount - paymentDone);
  };

  // Calculate interest for an owner
  const getOwnerInterest = (owner) => {
    const finalAmount = getOwnerFinalCompensation(owner);
    const gazetteDate = planData?.section_38_gazette_date;
    
    if (!gazetteDate || !finalAmount) return 0;
    
    const startDate = new Date(gazetteDate);
    const currentDate = new Date();
    const timeDiff = currentDate.getTime() - startDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    if (daysDiff <= 0) return 0;
    
    // Calculate daily interest: (Principal × Annual Rate × Days) / 365
    const annualRate = 0.07; // 7%
    const dailyInterest = (finalAmount * annualRate * daysDiff) / 365;
    
    return dailyInterest;
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
          
          {/* Role indicator */}
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
              canEdit 
                ? 'bg-green-100 text-green-800 border border-green-300' 
                : 'bg-blue-100 text-blue-800 border border-blue-300'
            }`}>
              {canEdit ? (
                <>
                  <Edit size={16} />
                  Edit Mode
                </>
              ) : (
                <>
                  <Eye size={16} />
                  View Only
                </>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-orange-700">Plan {currentPlanId}</div>
            <div className="text-lg font-semibold text-orange-800">
              Lot {selectedLot.id}
            </div>
          </div>
        </div>

        {/* Lot Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Total Owners</div>
            <div className="text-xl font-bold text-orange-600">{selectedLot.owners.length}</div>
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Lot Size</div>
            <div className="text-xl font-bold text-slate-600">
              {landDetails?.preliminary_plan_extent_ha 
                ? `${parseFloat(landDetails.preliminary_plan_extent_ha).toFixed(4)} ha` 
                : landDetails?.advance_tracing_extent_ha 
                ? `${parseFloat(landDetails.advance_tracing_extent_ha).toFixed(4)} ha`
                : selectedLot.size || 'Not set'}
            </div>
            {landDetails?.preliminary_plan_extent_perch && parseFloat(landDetails.preliminary_plan_extent_perch) > 0 && (
              <div className="text-xs text-gray-500">{parseFloat(landDetails.preliminary_plan_extent_perch).toFixed(4)} perch</div>
            )}
          </div>
          <div className="bg-white p-3 rounded-lg border border-orange-200">
            <div className="text-sm text-gray-600">Total Final Compensation</div>
            <div className="text-lg font-bold text-green-600">{formatCurrency(getLotTotalFinalCompensation())}</div>
            <div className="text-xs text-gray-500 mt-1">Sum of all final compensation amounts</div>
          </div>
        </div>
      </div>

      {/* Individual Owner Compensation Cards */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
          Individual Owner Compensation Details
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedLot.owners.map((owner, index) => {
            const status = getOwnerCompensationStatus(owner);
            
            return (
              <div key={owner.nic} className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center shadow-inner">
                      <User className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <h5 className="text-lg font-semibold text-gray-900">{owner.name}</h5>
                      <p className="text-sm text-gray-500 flex items-center">
                        <span className="mr-2">NIC:</span>
                        <span className="font-mono">{owner.nic}</span>
                      </p>
                      <div className="flex items-center mt-1">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                        <span className="text-xs text-orange-600 font-medium">
                          Owner {index + 1} of {selectedLot.owners.length}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    status === 'completed' ? 'bg-green-100 text-green-800 border border-green-200' :
                    status === 'in-progress' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                    'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </span>
                </div>

                {/* Owner Details */}
                <div className="space-y-3 mb-6">
                  <div className="flex items-center text-sm text-gray-600">
                    <Phone className="w-4 h-4 mr-2 text-gray-400" />
                    <span className="font-medium">{owner.phone}</span>
                  </div>
                  
                  <div className="flex items-start text-sm text-gray-600">
                    <MapPin className="w-4 h-4 mr-2 text-gray-400 mt-0.5" />
                    <span className="font-medium">{owner.address}</span>
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="space-y-3 mb-6">
                  {/* Full Compensation Amount */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-3 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm font-medium text-green-800">Full Compensation</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-700">
                          {formatCurrency(getOwnerFinalCompensation(owner))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Done */}
                  <div className="bg-gradient-to-r from-blue-50 to-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Check className="w-4 h-4 text-blue-600 mr-2" />
                        <span className="text-sm font-medium text-blue-800">Payment Done</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-700">
                          {formatCurrency(getOwnerTotalPaymentDone(owner))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Balance Due */}
                  <div className={`p-3 rounded-lg border ${
                    getOwnerBalanceDue(owner) > 0 
                      ? 'bg-gradient-to-r from-orange-50 to-orange-50 border-orange-200' 
                      : 'bg-gradient-to-r from-green-50 to-green-50 border-green-200'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <DollarSign className={`w-4 h-4 mr-2 ${
                          getOwnerBalanceDue(owner) > 0 ? 'text-orange-600' : 'text-green-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          getOwnerBalanceDue(owner) > 0 ? 'text-orange-800' : 'text-green-800'
                        }`}>Balance Due</span>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${
                          getOwnerBalanceDue(owner) > 0 ? 'text-orange-700' : 'text-green-700'
                        }`}>
                          {formatCurrency(getOwnerBalanceDue(owner))}
                        </div>
                        {getOwnerBalanceDue(owner) === 0 && getOwnerFinalCompensation(owner) > 0 && (
                          <div className="text-xs text-green-600">✓ Fully Paid</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Interest */}
                  <div className="bg-gradient-to-r from-yellow-50 to-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Percent className="w-4 h-4 text-yellow-600 mr-2" />
                        <span className="text-sm font-medium text-yellow-800">Interest (7% p.a.)</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-yellow-700">
                          {formatCurrency(getOwnerInterest(owner))}
                        </div>
                        {planData?.section_38_gazette_date ? (
                          <div className="text-xs text-yellow-600">
                            From {new Date(planData.section_38_gazette_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            Gazette date not set
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEditCompensation(owner)}
                    className={`w-full flex items-center justify-center px-4 py-3 rounded-lg font-medium transition-colors ${
                      canEdit 
                        ? 'bg-orange-600 text-white hover:bg-orange-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {canEdit ? <Edit className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {canEdit 
                      ? (getOwnerFinalCompensation(owner) === 0 ? 'Add Compensation' : 'Edit Compensation')
                      : (getOwnerFinalCompensation(owner) === 0 ? 'View Compensation Details' : 'View Compensation')
                    }
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>


               {/* Compensation Management Modal */}
      {editingOwner && (
        <div className="fixed inset-0 bg-white bg-opacity-20 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white bg-opacity-95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 w-full max-w-6xl max-h-[90vh] overflow-y-auto border border-white border-opacity-30"
               style={{
                 boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1)'
               }}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-200">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                  <DollarSign className="w-6 h-6 text-white" />
                </div>
                <div className="ml-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Compensation Details
                  </h2>
                  <p className="text-lg font-semibold text-orange-600">{editingOwner.name}</p>
                  <p className="text-sm text-gray-500">Lot {selectedLot.id} - Plan {currentPlanId}</p>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setEditingOwner(null)}
                  className="px-6 py-3 text-gray-700 bg-gray-50 bg-opacity-80 backdrop-blur rounded-xl hover:bg-gray-100 transition-all duration-200 border border-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveCompensation}
                  disabled={isSaving}
                  className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg font-medium disabled:opacity-50"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Owner Information */}
              <div className="bg-gradient-to-br from-slate-50 to-slate-100 backdrop-blur-sm p-6 rounded-xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-slate-600 rounded-lg flex items-center justify-center mr-3">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  Owner Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Name:</strong> {editingOwner.name}</div>
                  <div><strong>NIC:</strong> {editingOwner.nic}</div>
                  <div><strong>Phone:</strong> {editingOwner.phone}</div>
                  <div><strong>Address:</strong> {editingOwner.address}</div>
                </div>
              </div>

              {/* Lot Information */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 backdrop-blur-sm p-6 rounded-xl border border-blue-200 shadow-sm">
                <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                    <MapPin className="w-4 h-4 text-white" />
                  </div>
                  Lot Information
                </h3>
                <div className="space-y-2 text-sm">
                  <div><strong>Lot ID:</strong> {selectedLot.id}</div>
                  <div><strong>Size:</strong> {landDetails.preliminary_plan_extent_ha}</div>
                  <div><strong>Total Owners:</strong> {selectedLot.owners.length}</div>
                </div>
              </div>

              {/* Assessment Information */}
              <div className="bg-gradient-to-br from-green-50 to-green-100 backdrop-blur-sm p-6 rounded-xl border border-green-200 shadow-sm">
                <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center">
                  <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-3">
                    <Percent className="w-4 h-4 text-white" />
                  </div>
                  Assessment Details
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ownership Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={editingOwner.compensation.lotShare}
                      onChange={(e) => handleInputChange('lotShare', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
                    <input
                      type="date"
                      value={editingOwner.compensation.assessmentDate}
                      onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessor Name</label>
                    <input
                      type="text"
                      value={editingOwner.compensation.assessorName}
                      onChange={(e) => handleInputChange('assessorName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Final Compensation Amount Section */}
            <div className="space-y-6">
              <div className="bg-green-50/80 backdrop-blur-sm rounded-xl p-6 border border-green-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Final Compensation Amount</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Final Compensation Amount to be Paid (Rs.) *
                    </label>
                    <input
                      type="number"
                      value={editingOwner.compensation.finalCompensationAmount || ''}
                      onChange={(e) => handleInputChange('finalCompensationAmount', e.target.value)}
                      className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="e.g., 2550000"
                      step="0.01"
                    />
                    <p className="text-xs text-gray-500 mt-1">Enter the final compensation amount to be paid</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Balance Due (Rs.)
                    </label>
                    <div className="relative">
                      <div className={`w-full px-3 py-2 border rounded-lg font-medium flex items-center justify-between ${(() => {
                        const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                        const totalPaid = 
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount') || 0) +
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount') || 0) +
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount') || 0);
                        const balanceDue = finalAmount - totalPaid;
                        return balanceDue <= 0 
                          ? 'bg-green-50 border-green-300 text-green-800' 
                          : 'bg-orange-50 border-orange-300 text-orange-800';
                      })()}`}>
                        <span>
                          {(() => {
                            const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                            const totalPaid = 
                              parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount') || 0) +
                              parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount') || 0) +
                              parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount') || 0);
                            const balanceDue = finalAmount - totalPaid;
                            return balanceDue >= 0 
                              ? `Rs. ${balanceDue.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`
                              : `Rs. 0.00`;
                          })()}
                        </span>
                        {(() => {
                          const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                          const totalPaid = 
                            parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount') || 0) +
                            parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount') || 0) +
                            parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount') || 0);
                          const balanceDue = finalAmount - totalPaid;
                          if (balanceDue <= 0 && finalAmount > 0) {
                            return (
                              <div className="flex items-center space-x-2">
                                <Check size={20} className="text-green-600" />
                                <span className="text-sm font-bold text-green-600">FULLY PAID</span>
                              </div>
                            );
                          }
                          return null;
                        })()}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                        const totalPaid = 
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount') || 0) +
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount') || 0) +
                          parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount') || 0);
                        const balanceDue = finalAmount - totalPaid;
                        return balanceDue <= 0 && finalAmount > 0
                          ? 'Compensation fully paid ✓'
                          : 'Automatically calculated: Final Amount - Total Paid';
                      })()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Compensation Payment Details Form */}
            <div className="space-y-8">
              {/* Compensation Payment Details */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Compensation Payment Details</h3>
                </div>

                <div className="space-y-6">
                  {/* Full Payment */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                      Full Payment
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part Payment 01 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                      Part Payment 01
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part Payment 02 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                      Part Payment 02
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest to be paid */}
              <div className="bg-yellow-50/80 backdrop-blur-sm rounded-xl p-6 border border-yellow-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Interest to be paid</h3>
                </div>

                <div className="space-y-4">
                  {/* Section 38 Gazette Date Input */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4">Section 38 Gazette Date (Auto-populated from Plan)</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Section 38 Gazette Date (from Plan)</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-800 font-medium">
                          {planData?.section_38_gazette_date 
                            ? new Date(planData.section_38_gazette_date).toLocaleDateString('en-CA') // YYYY-MM-DD format
                            : 'Not set in plan'
                          }
                        </div>
                        <p className="text-xs text-gray-500 mt-1">This date is automatically taken from the plan created by Land Officer</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest Rate per Annum</label>
                        <div className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-gray-800 font-medium">
                          7.00%
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Fixed annual interest rate</p>
                      </div>
                    </div>
                  </div>

                  {/* Interest Calculation Results */}
                  <div className="border border-yellow-300 rounded-lg p-4 bg-yellow-50/50">
                    <h4 className="font-semibold text-gray-800 mb-4">Calculated Interest Amount</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Days Since Gazette</label>
                        <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800 font-medium">
                          {(() => {
                            const gazetteDate = planData?.section_38_gazette_date;
                            if (!gazetteDate) return '0';
                            const startDate = new Date(gazetteDate);
                            const currentDate = new Date();
                            const timeDiff = currentDate.getTime() - startDate.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            return daysDiff > 0 ? daysDiff : 0;
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Principal Amount (Rs.)</label>
                        <div className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-800 font-medium">
                          {(() => {
                            const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                            return `Rs. ${finalAmount.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
                          })()}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Interest to be paid (Rs.)</label>
                        <div className="w-full px-3 py-2 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-800 font-bold text-lg">
                          {(() => {
                            const gazetteDate = planData?.section_38_gazette_date;
                            const finalAmount = parseFloat(editingOwner.compensation.finalCompensationAmount || 0);
                            
                            if (!gazetteDate || !finalAmount) return 'Rs. 0.00';
                            
                            const startDate = new Date(gazetteDate);
                            const currentDate = new Date();
                            const timeDiff = currentDate.getTime() - startDate.getTime();
                            const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
                            
                            if (daysDiff <= 0) return 'Rs. 0.00';
                            
                            // Calculate daily interest: (Principal × Annual Rate × Days) / 365
                            const annualRate = 0.07; // 7%
                            const dailyInterest = (finalAmount * annualRate * daysDiff) / 365;
                            
                            return `Rs. ${dailyInterest.toLocaleString('en-LK', { minimumFractionDigits: 2 })}`;
                          })()}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Calculated daily at 7% per annum from plan gazette date</p>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-blue-50 rounded-md">
                      <p className="text-sm text-blue-700">
                        <strong>Formula:</strong> (Final Compensation Amount × 7% annual rate × Days Since Gazette) ÷ 365 days
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        Daily Interest = (Principal × Annual Interest Rate ÷ 365) × Number of Days
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Payment Details */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center">
                    <Percent className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Interest Payment Details</h3>
                </div>

                <div className="space-y-6">
                  {/* Full Payment */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-emerald-500 text-white rounded-full flex items-center justify-center text-sm">1</span>
                      Full Payment
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part Payment 01 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm">2</span>
                      Part Payment 01
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Part Payment 02 */}
                  <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                    <h4 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <span className="w-6 h-6 bg-cyan-500 text-white rounded-full flex items-center justify-center text-sm">3</span>
                      Part Payment 02
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div className="col-span-2 md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="DD"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'day')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'day', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="MM"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'month')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'month', e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="YY"
                            maxLength="2"
                            className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                            value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'year')}
                            onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'year', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'chequeNo', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'deductedAmount', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'paidAmount', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sent To Account Division */}
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 border border-white/30">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                    <Building className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800">Sent To Account Division</h3>
                </div>

                <div className="border border-gray-200 rounded-lg p-4 bg-white/30">
                  <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                    <div className="col-span-2 md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="DD"
                          maxLength="2"
                          className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('accountDivision', 'sentDate', 'day')}
                          onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'day', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="MM"
                          maxLength="2"
                          className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('accountDivision', 'sentDate', 'month')}
                          onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'month', e.target.value)}
                        />
                        <input
                          type="text"
                          placeholder="YY"
                          maxLength="2"
                          className="w-12 px-2 py-2 border border-gray-300 rounded-md text-center bg-white/70 backdrop-blur-sm"
                          value={getPaymentDetailsValue('accountDivision', 'sentDate', 'year')}
                          onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'year', e.target.value)}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cheque No / Slip No</label>
                      <input
                        type="text"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                        value={getPaymentDetailsValue('accountDivision', 'sentDate', 'chequeNo')}
                        onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'chequeNo', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Deducted Amount</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                        value={getPaymentDetailsValue('accountDivision', 'sentDate', 'deductedAmount')}
                        onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'deductedAmount', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Paid Amount</label>
                      <input
                        type="number"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm"
                        value={getPaymentDetailsValue('accountDivision', 'sentDate', 'paidAmount')}
                        onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'paidAmount', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Summary Section */}
            <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-6 rounded-xl border border-orange-200 shadow-sm">
              <h3 className="text-xl font-semibold text-orange-800 mb-4 flex items-center">
                <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center mr-3">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                Payment Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-sm text-orange-700">Owner Information</div>
                  <div className="text-lg font-bold text-orange-800">{editingOwner.name}</div>
                  <div className="text-sm text-orange-600">NIC: {editingOwner.nic}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-orange-700">Lot Details</div>
                  <div className="text-lg font-bold text-orange-800">Lot {selectedLot.id}</div>
                  <div className="text-sm text-orange-600">Plan {currentPlanId}</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-orange-700">Last Updated</div>
                  <div className="text-lg font-bold text-orange-800">{new Date().toLocaleDateString()}</div>
                  <div className="text-sm text-orange-600">Payment Records</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}




       
          
          
        
      

      {/* Rest of the component remains the same... */}
      {/* Individual Owner Compensation Cards and Modal */}
    </div>
  );
};

export default CompensationDetailsTab;
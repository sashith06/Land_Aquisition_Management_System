import React, { useState, useEffect } from 'react';
import { User, DollarSign, Save, Edit, Building, TreePine, Wheat, Home, Users, MapPin, Phone, Percent, Check, Eye, Lock } from 'lucide-react';
import { saveCompensation, getCompensation, getPlanById } from '../api';
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

  // Helper function to check if payment details are filled
  const isPaymentFilled = (section, field) => {
    if (!editingOwner) return false;
    const key = `${currentPlanId}_${selectedLot.id}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data[section] || !data[section][field]) return false;
    
    const fieldData = data[section][field];
    // Check if at least date and one amount field are filled
    return fieldData.date && (fieldData.paidAmount || fieldData.chequeNo);
  };

  // Helper function to check if account division date is filled
  const isAccountDivisionFilled = () => {
    if (!editingOwner) return false;
    const key = `${currentPlanId}_${selectedLot.id}_${editingOwner.nic}`;
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
    const key = `${currentPlanId}_${selectedLot.id}_${owner.nic}`;
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
                  {canEdit ? 'Cancel' : 'Close'}
                </button>
                {canEdit && (
                  <button
                    onClick={handleSaveCompensation}
                    disabled={isSaving}
                    className="flex items-center px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition-all duration-200 shadow-lg font-medium disabled:opacity-50"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isSaving ? 'Saving...' : 'Save'}
                  </button>
                )}
              </div>
            </div>

            {/* Access Control Notice for Non-Financial Officers */}
            {!canEdit && (
              <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
                <div className="flex items-center">
                  <Eye className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">
                      View-Only Mode
                    </p>
                    <p className="text-xs text-blue-700">
                      You can view all compensation details but cannot make changes. Only Financial Officers can edit compensation data.
                      <br/>Current role: <strong>{actualUserRole || 'Not detected'}</strong>
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className={`${!canEdit ? 'pointer-events-none opacity-60' : ''}`}>
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
                  <div><strong>Size:</strong> {selectedLot.size}</div>
                  <div><strong>Location:</strong> {selectedLot.location}</div>
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
                      disabled={!canEdit}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        !canEdit ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Date</label>
                    <input
                      type="date"
                      value={editingOwner.compensation.assessmentDate}
                      onChange={(e) => handleInputChange('assessmentDate', e.target.value)}
                      disabled={!canEdit}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        !canEdit ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assessor Name</label>
                    <input
                      type="text"
                      value={editingOwner.compensation.assessorName}
                      onChange={(e) => handleInputChange('assessorName', e.target.value)}
                      disabled={!canEdit}
                      className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                        !canEdit ? 'bg-gray-100 cursor-not-allowed text-gray-600' : ''
                      }`}
                    />
                  </div>
                </div>
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
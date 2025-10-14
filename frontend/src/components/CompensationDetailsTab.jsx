import React, { useState, useEffect } from 'react';
import { User, DollarSign, Save, Edit, Building, TreePine, Wheat, Home, Users, MapPin, Phone, Percent, Check, Eye, Lock } from 'lucide-react';
import api, { saveCompensation, getCompensation, getPlanById } from '../api';
import { getUserRole } from './ProtectedRoute';

const CompensationDetailsTab = ({ selectedLot, planId, landDetails: propLandDetails, onDataUpdate }) => {
  const [compensationData, setCompensationData] = useState({});
  const [editingOwner, setEditingOwner] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [planData, setPlanData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [landDetails, setLandDetails] = useState(null);

  // Get planId from URL if not provided
  const currentPlanId = planId || window.location.pathname.split('/')[3];

  // Get actual user role from token with useState to ensure reactivity
  const [actualUserRole, setActualUserRole] = useState(null);
  const [canEdit, setCanEdit] = useState(false);

  // Check token validity for additional authentication info
  const [tokenStatus, setTokenStatus] = useState('checking');
  
  // Initialize user role on mount
  useEffect(() => {
    const role = getUserRole();
    setActualUserRole(role);
    
    // Check if user has permission to edit (only financial officers can edit)
    // Support multiple role formats: 'financial_officer', 'Financial Officer', 'FO'
    const financialOfficerRoles = ['financial_officer', 'Financial Officer', 'FO'];
    const hasEditPermission = financialOfficerRoles.includes(role);
    setCanEdit(hasEditPermission);
    
    // Debug role information
    console.log('🔐 User Role Debug:', {
      actualUserRole: role,
      canEdit: hasEditPermission,
      supportedRoles: financialOfficerRoles,
      token: !!localStorage.getItem('token')
    });
  }, []);
  
  useEffect(() => {
    const checkToken = () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setTokenStatus('missing');
        setCanEdit(false);
        return;
      }
      
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const isExpired = payload.exp < (Date.now() / 1000);
        setTokenStatus(isExpired ? 'expired' : 'valid');
        
        // Re-verify role from token
        if (!isExpired && payload.role) {
          const financialOfficerRoles = ['financial_officer', 'Financial Officer', 'FO'];
          const hasEditPermission = financialOfficerRoles.includes(payload.role);
          setActualUserRole(payload.role);
          setCanEdit(hasEditPermission);
          
          console.log('🔐 Token verified - Role:', payload.role, 'Can Edit:', hasEditPermission);
        } else if (isExpired) {
          setCanEdit(false);
        }
      } catch (e) {
        setTokenStatus('invalid');
        setCanEdit(false);
      }
    };
    
    checkToken();
    
    // Re-check token every minute
    const interval = setInterval(checkToken, 60000);
    return () => clearInterval(interval);
  }, []);

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

  const loadLandDetails = async () => {
    try {
      const response = await api.get(`/api/plans/${currentPlanId}/lots/${selectedLot.backend_id || selectedLot.id}/land-details`);
      if (response.data.success) {
        setLandDetails(response.data.data);
        console.log('Land details loaded:', response.data.data);
      }
    } catch (error) {
      console.log('Land details API not available (404), using default data');
      // If we can't load specific land details, use what's provided as prop or create basic structure
      if (propLandDetails) {
        setLandDetails(propLandDetails);
      } else {
        // Create basic land details structure for display
        setLandDetails({
          preliminary_plan_extent_ha: selectedLot.extent_ha || '0.0000',
          preliminary_plan_extent_perch: selectedLot.extent_perch || '0.0000'
        });
      }
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
      
      console.log('🔄 Loading compensation for lot:', lotId, 'plan:', currentPlanId);
      console.log('🔄 selectedLot object:', selectedLot);
      console.log('🔄 selectedLot.backend_id:', selectedLot.backend_id, 'selectedLot.id:', selectedLot.id);
      console.log('🔄 Final URL will be: /api/plans/' + currentPlanId + '/lots/' + lotId + '/compensation');
      
      const response = await getCompensation(currentPlanId, lotId);
      if (response.data.success && response.data.data) {
        const data = response.data.data;
        console.log('📡 Received compensation data from API:', data);
        console.log('💰 Calculated Interest Amounts from API:', 
          data.owner_data?.map(o => ({ nic: o.nic, calculatedInterest: o.calculatedInterestAmount }))
        );
        
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
        
        // Convert compensation_payment data and split dates into day/month/year format for the form
        const processedPaymentDetails = {};
        if (data.compensation_payment) {
          Object.keys(data.compensation_payment).forEach(key => {
            const payment = data.compensation_payment[key];
            processedPaymentDetails[key] = {
              compensationPayment: {
                fullPayment: {
                  fullDate: normalizeDateForInput(payment.compensationPayment?.fullPayment?.date || ''),
                  chequeNo: payment.compensationPayment?.fullPayment?.chequeNo || '',
                  deductedAmount: payment.compensationPayment?.fullPayment?.deductedAmount || 0,
                  paidAmount: payment.compensationPayment?.fullPayment?.paidAmount || 0
                },
                partPayment01: {
                  fullDate: normalizeDateForInput(payment.compensationPayment?.partPayment01?.date || ''),
                  chequeNo: payment.compensationPayment?.partPayment01?.chequeNo || '',
                  deductedAmount: payment.compensationPayment?.partPayment01?.deductedAmount || 0,
                  paidAmount: payment.compensationPayment?.partPayment01?.paidAmount || 0
                },
                partPayment02: {
                  fullDate: normalizeDateForInput(payment.compensationPayment?.partPayment02?.date || ''),
                  chequeNo: payment.compensationPayment?.partPayment02?.chequeNo || '',
                  deductedAmount: payment.compensationPayment?.partPayment02?.deductedAmount || 0,
                  paidAmount: payment.compensationPayment?.partPayment02?.paidAmount || 0
                }
              },
              interestPayment: {
                fullPayment: {
                  fullDate: normalizeDateForInput(payment.interestPayment?.fullPayment?.date || ''),
                  chequeNo: payment.interestPayment?.fullPayment?.chequeNo || '',
                  deductedAmount: payment.interestPayment?.fullPayment?.deductedAmount || 0,
                  paidAmount: payment.interestPayment?.fullPayment?.paidAmount || 0
                },
                partPayment01: {
                  fullDate: normalizeDateForInput(payment.interestPayment?.partPayment01?.date || ''),
                  chequeNo: payment.interestPayment?.partPayment01?.chequeNo || '',
                  deductedAmount: payment.interestPayment?.partPayment01?.deductedAmount || 0,
                  paidAmount: payment.interestPayment?.partPayment01?.paidAmount || 0
                },
                partPayment02: {
                  fullDate: normalizeDateForInput(payment.interestPayment?.partPayment02?.date || ''),
                  chequeNo: payment.interestPayment?.partPayment02?.chequeNo || '',
                  deductedAmount: payment.interestPayment?.partPayment02?.deductedAmount || 0,
                  paidAmount: payment.interestPayment?.partPayment02?.paidAmount || 0
                }
              },
              accountDivision: {
                sentDate: {
                  fullDate: normalizeDateForInput(payment.accountDivision?.sentDate?.date || '')
                }
              }
            };
            
            console.log(`🔍 Processing payment for key: ${key}`);
            console.log(`📅 Raw account division from API:`, payment.accountDivision);
            console.log(`📅 Processed account division:`, processedPaymentDetails[key].accountDivision);
            console.log(`📅 Final fullDate value:`, processedPaymentDetails[key].accountDivision.sentDate.fullDate);
            
            if (processedPaymentDetails[key].interestPayment) {
              console.log(`🏦 Key "${key}" interest payment:`, processedPaymentDetails[key].interestPayment);
            }
            
            if (processedPaymentDetails[key].accountDivision) {
              console.log(`📅 Key "${key}" account division:`, processedPaymentDetails[key].accountDivision);
            }
          });
        
          setPaymentDetails(processedPaymentDetails);
          console.log('✅ Payment details state updated successfully');
        }
      } else {
        console.log('❌ No data received or unsuccessful response:', response.data);
      }
    } catch (error) {
      console.error('❌ Error loading compensation data:', error);
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
    
    const existingData = compensationData[key];
    console.log('🔍 Data found for this owner:', existingData);
    
    // Use existing data if available, otherwise initialize with basic structure
    const ownerData = {
      name: owner.name,
      nic: owner.nic,
      compensation: {
        finalCompensationAmount: existingData?.finalCompensationAmount || 0,
        assessmentDate: existingData?.assessmentDate || '',
        assessorName: existingData?.assessorName || '',
        lotShare: existingData?.lotShare || (100 / selectedLot.owners.length).toString(),
        ...existingData?.compensation
      }
    };
    
    console.log('🔍 Setting editing owner with data:', ownerData);
    setEditingOwner(ownerData);
    
    // Load land details if not already loaded
    if (!landDetails) {
      loadLandDetails();
    }
  };

  // Helper function to normalize date values for HTML date inputs
  const normalizeDateForInput = (dateValue) => {
    if (!dateValue || dateValue.trim() === '') return '';
    try {
      // Handle ISO datetime strings like "2025-07-22T18:30:00.000Z"
      if (dateValue.includes('T')) {
        // Extract date part directly without timezone conversion
        return dateValue.split('T')[0]; // Get YYYY-MM-DD part before 'T'
      }
      // Already in YYYY-MM-DD format
      return dateValue;
    } catch (error) {
      console.error('Date normalization error:', error);
      return '';
    }
  };

  // Helper function to split date from YYYY-MM-DD to day/month/year components
  const splitDate = (dateString) => {
    if (!dateString) return { day: '', month: '', year: '' };
    
    const [year, month, day] = dateString.split('-');
    return { day, month, year };
  };

  // Helper function to format date from YYYY-MM-DD or ISO datetime to backend format
  const formatDateFromFullDate = (fullDate) => {
    if (!fullDate || fullDate.trim() === '') return null;
    try {
      // Handle ISO datetime strings like "2025-07-22T18:30:00.000Z"
      if (fullDate.includes('T')) {
        // Extract date part directly without timezone conversion
        return fullDate.split('T')[0]; // Get YYYY-MM-DD part before 'T'
      }
      // Input format: YYYY-MM-DD, return as-is for backend
      return fullDate;
    } catch (error) {
      console.error('Date formatting error:', error);
      return null;
    }
  };

  const handleSaveCompensation = async () => {
    if (!editingOwner || !canEdit) return;

    setIsSaving(true);
    
    try {
      // Helper function to format date - now handles direct YYYY-MM-DD format
      const formatDate = (dateValue) => {
        if (!dateValue) return null;
        
        // If it's already in YYYY-MM-DD format (from type="date" inputs), return as-is
        if (typeof dateValue === 'string' && dateValue.match(/^\d{4}-\d{2}-\d{2}$/)) {
          return dateValue;
        }
        
        // Handle object format {date: 'YYYY-MM-DD'}
        if (typeof dateValue === 'object' && dateValue.date) {
          if (!dateValue.date.trim()) return null;
          
          // If it's already in YYYY-MM-DD format
          if (dateValue.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return dateValue.date;
          }
          
          // Handle DD/MM/YY format conversion
          const dateParts = dateValue.date.split('/');
          if (dateParts.length === 3) {
            const day = dateParts[0].padStart(2, '0');
            const month = dateParts[1].padStart(2, '0');
            const year = dateParts[2].length === 2 ? '20' + dateParts[2] : dateParts[2];
            const formatted = `${year}-${month}-${day}`;
            console.log('🗓️ Formatted date from DD/MM/YY:', formatted);
            return formatted;
          }
        }
        
        console.log('🗓️ Unknown date format, returning null');
        return null;
      };
      
      // Use backend_id for consistent key generation
      const actualLotId = selectedLot.backend_id || selectedLot.id;
      const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
      
      // Ensure compensation object exists with default values
      const compensationInfo = editingOwner.compensation || {
        finalCompensationAmount: 0,
        assessmentDate: '',
        assessorName: '',
        lotShare: (100 / selectedLot.owners.length).toString()
      };
      
      // No breakdown calculation - just use the final compensation amount
      const updatedCompensation = {
        ...compensationInfo,
        lastUpdated: new Date().toISOString(),
        nic: editingOwner.nic,
        name: editingOwner.name,
        finalCompensationAmount: parseFloat(compensationInfo.finalCompensationAmount) || 0
      };

      const newData = {
        ...compensationData,
        [key]: updatedCompensation
      };

      // Prepare data for API - flat structure for new controller
      const ownerKey = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
      const ownerPaymentData = paymentDetails[ownerKey] || {};
      const compensationPaymentData = ownerPaymentData.compensationPayment || {};
      const interestPaymentData = ownerPaymentData.interestPayment || {};
      const accountDivisionData = ownerPaymentData.accountDivision || {};
      
      // Debug: Log payment details values
      console.log('🔍 DEBUG: Payment details for key:', ownerKey);
      console.log('🔍 DEBUG: ownerPaymentData:', ownerPaymentData);
      console.log('🔍 DEBUG: paymentDetails state:', paymentDetails);
      
      console.log('🔍 DEBUG: Compensation Part Payment 01 values:');
      console.log('  Full Date:', getPaymentDetailsValue('compensationPayment', 'partPayment01', 'fullDate'));
      console.log('  Cheque No:', getPaymentDetailsValue('compensationPayment', 'partPayment01', 'chequeNo'));
      console.log('  Paid Amount:', getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount'));
      console.log('  Formatted date:', formatDateFromFullDate(
        getPaymentDetailsValue('compensationPayment', 'partPayment01', 'fullDate')
      ));
      
      console.log('🔍 DEBUG: Interest Part Payment 01 values:');
      const intFullDate = getPaymentDetailsValue('interestPayment', 'partPayment01', 'fullDate');
      const intCheque = getPaymentDetailsValue('interestPayment', 'partPayment01', 'chequeNo');
      const intPaid = getPaymentDetailsValue('interestPayment', 'partPayment01', 'paidAmount');
      console.log('  Full Date:', `"${intFullDate}" (type: ${typeof intFullDate})`);
      console.log('  Cheque No:', `"${intCheque}" (type: ${typeof intCheque})`);
      console.log('  Paid Amount:', `"${intPaid}" (type: ${typeof intPaid})`);
      console.log('  Formatted date:', formatDateFromFullDate(intFullDate));
      
      console.log('🔍 DEBUG: Account Division values:');
      const accFullDate = getPaymentDetailsValue('accountDivision', 'sentDate', 'fullDate');
      console.log('  Full Date:', `"${accFullDate}" (type: ${typeof accFullDate})`);
      console.log('  Formatted date:', formatDateFromFullDate(accFullDate));
      
      const compensationPayload = {
        owner_nic: editingOwner.nic,
        owner_name: editingOwner.name,
        final_compensation_amount: updatedCompensation.finalCompensationAmount || 0,
        
        // Helper function to convert day/month/year to proper date format
        // Compensation payment details with proper date formatting
        compensation_full_payment_date: formatDateFromFullDate(
          getPaymentDetailsValue('compensationPayment', 'fullPayment', 'fullDate')
        ),
        compensation_full_payment_cheque_no: getPaymentDetailsValue('compensationPayment', 'fullPayment', 'chequeNo') || null,
        compensation_full_payment_deducted_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'deductedAmount')) || 0,
        compensation_full_payment_paid_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount')) || 0,
        
        compensation_part_payment_01_date: formatDateFromFullDate(
          getPaymentDetailsValue('compensationPayment', 'partPayment01', 'fullDate')
        ),
        compensation_part_payment_01_cheque_no: getPaymentDetailsValue('compensationPayment', 'partPayment01', 'chequeNo') || null,
        compensation_part_payment_01_deducted_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'deductedAmount')) || 0,
        compensation_part_payment_01_paid_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount')) || 0,
        
        compensation_part_payment_02_date: formatDateFromFullDate(
          getPaymentDetailsValue('compensationPayment', 'partPayment02', 'fullDate')
        ),
        compensation_part_payment_02_cheque_no: getPaymentDetailsValue('compensationPayment', 'partPayment02', 'chequeNo') || null,
        compensation_part_payment_02_deducted_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'deductedAmount')) || 0,
        compensation_part_payment_02_paid_amount: parseFloat(getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount')) || 0,
        
        // Interest payment details with proper date formatting
        interest_full_payment_date: formatDateFromFullDate(
          getPaymentDetailsValue('interestPayment', 'fullPayment', 'fullDate')
        ),
        interest_full_payment_cheque_no: getPaymentDetailsValue('interestPayment', 'fullPayment', 'chequeNo') || null,
        interest_full_payment_deducted_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'fullPayment', 'deductedAmount')) || 0,
        interest_full_payment_paid_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'fullPayment', 'paidAmount')) || 0,
        
        interest_part_payment_01_date: formatDateFromFullDate(
          getPaymentDetailsValue('interestPayment', 'partPayment01', 'fullDate')
        ),
        interest_part_payment_01_cheque_no: getPaymentDetailsValue('interestPayment', 'partPayment01', 'chequeNo') || null,
        interest_part_payment_01_deducted_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'partPayment01', 'deductedAmount')) || 0,
        interest_part_payment_01_paid_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'partPayment01', 'paidAmount')) || 0,
        
        interest_part_payment_02_date: formatDateFromFullDate(
          getPaymentDetailsValue('interestPayment', 'partPayment02', 'fullDate')
        ),
        interest_part_payment_02_cheque_no: getPaymentDetailsValue('interestPayment', 'partPayment02', 'chequeNo') || null,
        interest_part_payment_02_deducted_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'partPayment02', 'deductedAmount')) || 0,
        interest_part_payment_02_paid_amount: parseFloat(getPaymentDetailsValue('interestPayment', 'partPayment02', 'paidAmount')) || 0,
        
        // Calculate and include the calculated interest amount for backend comparison
        calculated_interest_amount: getEditingOwnerInterest(),
        
        // Account division details (only date field, no payment fields as per requirements)
        // IMPORTANT: Database has TWO date fields that need to be populated:
        // 1. account_division_sent_date (original field)
        // 2. send_account_division_date (new field for completion tracking)
        account_division_sent_date: formatDateFromFullDate(
          getPaymentDetailsValue('accountDivision', 'sentDate', 'fullDate')
        ),
        send_account_division_date: formatDateFromFullDate(
          getPaymentDetailsValue('accountDivision', 'sentDate', 'fullDate')
        ),
        
        created_by: 'system',
        updated_by: 'system'
      };
      
      console.log('🛰 Sending payload:', compensationPayload);
      console.log('💰 Interest Calculation Debug:');
      console.log('  - Calculated Interest Amount:', compensationPayload.calculated_interest_amount);
      console.log('  - Interest Full Payment:', compensationPayload.interest_full_payment_paid_amount);
      console.log('  - Interest Part 01:', compensationPayload.interest_part_payment_01_paid_amount);
      console.log('  - Interest Part 02:', compensationPayload.interest_part_payment_02_paid_amount);
      console.log('  - Total Interest Paid:', 
        (compensationPayload.interest_full_payment_paid_amount || 0) +
        (compensationPayload.interest_part_payment_01_paid_amount || 0) +
        (compensationPayload.interest_part_payment_02_paid_amount || 0)
      );
      console.log('📅 Account Division Date Debug:');
      console.log('  - Raw Value from State:', getPaymentDetailsValue('accountDivision', 'sentDate', 'fullDate'));
      console.log('  - account_division_sent_date (for model):', compensationPayload.account_division_sent_date);
      console.log('  - send_account_division_date (for progress):', compensationPayload.send_account_division_date);
      console.log('  - Is NULL?:', compensationPayload.account_division_sent_date === null);
      console.log('  - Is Empty String?:', compensationPayload.account_division_sent_date === '');
      console.log('  - Type:', typeof compensationPayload.account_division_sent_date);

      // Check token before sending
      const token = localStorage.getItem('token');
      console.log('🔐 Token check - Token exists:', !!token);
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          console.log('🔐 Token payload:', { role: payload.role, exp: payload.exp, current: Date.now() / 1000 });
          console.log('🔐 Token expired:', payload.exp < (Date.now() / 1000));
        } catch (e) {
          console.log('🔐 Token decode error:', e.message);
        }
      }

      // Use backend_id which is the actual database ID
      let saveLotId = selectedLot.backend_id || selectedLot.id;
      
      // Ensure we have a numeric ID, not a formatted display ID
      if (typeof saveLotId === 'string' && saveLotId.startsWith('L')) {
        // Extract numeric part from formatted ID like "L001" -> "1"
        saveLotId = parseInt(saveLotId.substring(1));
      }
      
      console.log('Saving compensation for lot:', saveLotId, 'plan:', currentPlanId);
      console.log('💾 Compensation payload being sent:', compensationPayload);

      const response = await saveCompensation(currentPlanId, saveLotId, compensationPayload);
      
      console.log('💾 Save response:', response.data);
      
      if (response.data.success) {
        setCompensationData(newData);
        setEditingOwner(null);
        alert('Compensation details saved successfully!');
        // Reload data to get latest from server
        await loadCompensationData();
        
        // Trigger parent refresh if available
        if (onDataUpdate) {
          console.log('🔄 Triggering parent data refresh...');
          onDataUpdate();
        }
      } else {
        alert('Error saving compensation details: ' + (response.data.message || 'Unknown error'));
        console.error('Save failed:', response.data);
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.error === 'Invalid token.') {
        alert('Your session has expired. Please log in again as a Financial Officer to save compensation data.');
        // Redirect to login
        window.location.href = '/login';
      } else {
        alert('Error saving compensation details. Please try again.');
      }
      console.error('Save error:', error.response?.data || error.message || error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    if (!editingOwner) return;
    
    setEditingOwner(prev => ({
      ...prev,
      compensation: {
        ...(prev.compensation || {}),
        [field]: value
      }
    }));
  };

  // Payment details handler for the new payment form structure
  const handlePaymentDetailsChange = (section, field, subField, value) => {
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    
    // Debug account division date changes
    if (section === 'accountDivision') {
      console.log('📅 Account Division Date Change:', {
        section,
        field,
        subField,
        value,
        key
      });
    }
    
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
      
      // Debug the updated state
      if (section === 'accountDivision') {
        console.log('📅 Updated payment details:', updated[key][section]);
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
    return fieldData.fullDate && (fieldData.paidAmount || fieldData.chequeNo);
  };

  // Helper function to check if account division date is filled
  const isAccountDivisionFilled = () => {
    if (!editingOwner) return false;
    // Use consistent key format with backend_id like in save function
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data.accountDivision || !data.accountDivision.sentDate) return false;
    return data.accountDivision.sentDate.fullDate;
  };

  const formatCurrency = (value) => {
    if (!value) return 'Rs. 0';
    return `Rs. ${parseFloat(value).toLocaleString()}`;
  };

  const getOwnerCompensationStatus = (owner) => {
    const key = `${currentPlanId}_${selectedLot.backend_id || selectedLot.id}_${owner.nic}`;
    const data = compensationData[key];
    if (!data) return 'not_started';
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
      const finalAmount = getOwnerFinalCompensation(owner);
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
      if (data.compensationPayment.fullPayment?.paidAmount) total += parseFloat(data.compensationPayment.fullPayment.paidAmount);
      if (data.compensationPayment.partPayment01?.paidAmount) total += parseFloat(data.compensationPayment.partPayment01.paidAmount);
      if (data.compensationPayment.partPayment02?.paidAmount) total += parseFloat(data.compensationPayment.partPayment02.paidAmount);
    }
    return total;
  };

  // Get balance due for an owner
  const getOwnerBalanceDue = (owner) => {
    const finalAmount = getOwnerFinalCompensation(owner);
    const paymentDone = getOwnerTotalPaymentDone(owner);
    return Math.max(0, finalAmount - paymentDone);
  };

  // Helper function to extract payment dates and amounts
  const extractPayments = (paymentData) => {
    const payments = [];
    
    if (!paymentData || !paymentData.compensationPayment) return payments;
    
    const comp = paymentData.compensationPayment;
    
    // Full payment
    if (comp.fullPayment?.fullDate && comp.fullPayment?.paidAmount) {
      const amount = parseFloat(comp.fullPayment.paidAmount);
      if (amount > 0) {
        payments.push({
          date: comp.fullPayment.fullDate,
          amount: amount
        });
      }
    }
    
    // Part payment 01
    if (comp.partPayment01?.fullDate && comp.partPayment01?.paidAmount) {
      const amount = parseFloat(comp.partPayment01.paidAmount);
      if (amount > 0) {
        payments.push({
          date: comp.partPayment01.fullDate,
          amount: amount
        });
      }
    }
    
    // Part payment 02
    if (comp.partPayment02?.fullDate && comp.partPayment02?.paidAmount) {
      const amount = parseFloat(comp.partPayment02.paidAmount);
      if (amount > 0) {
        payments.push({
          date: comp.partPayment02.fullDate,
          amount: amount
        });
      }
    }
    
    return payments;
  };

  // Calculate interest with period-based logic (considers payment dates)
  const calculateInterestWithPayments = (finalAmount, gazetteDate, payments) => {
    if (!gazetteDate || !finalAmount || finalAmount <= 0) return 0;
    
    // Sort payments chronologically
    const sortedPayments = payments
      .filter(p => p.date && p.amount > 0)
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    let totalInterest = 0;
    let remainingPrincipal = finalAmount;
    let periodStart = new Date(gazetteDate);
    
    // Calculate interest for each payment period
    for (const payment of sortedPayments) {
      const paymentDate = new Date(payment.date);
      
      // Skip if payment date is before gazette date
      if (paymentDate < periodStart) continue;
      
      // Calculate days in this period
      const days = Math.floor((paymentDate - periodStart) / (1000 * 60 * 60 * 24));
      
      if (days > 0 && remainingPrincipal > 0) {
        const periodInterest = (remainingPrincipal * 0.07 * days) / 365;
        totalInterest += periodInterest;
        
        console.log(`📊 Period: ${periodStart.toISOString().split('T')[0]} to ${paymentDate.toISOString().split('T')[0]}`);
        console.log(`   Days: ${days}, Principal: Rs.${remainingPrincipal.toFixed(2)}, Interest: Rs.${periodInterest.toFixed(2)}`);
      }
      
      // Reduce principal by payment amount
      remainingPrincipal -= payment.amount;
      remainingPrincipal = Math.max(0, remainingPrincipal); // Can't be negative
      
      // Move to next period
      periodStart = paymentDate;
    }
    
    // Calculate interest for remaining unpaid amount (up to current date)
    if (remainingPrincipal > 0) {
      const currentDate = new Date();
      const days = Math.floor((currentDate - periodStart) / (1000 * 60 * 60 * 24));
      
      if (days > 0) {
        const periodInterest = (remainingPrincipal * 0.07 * days) / 365;
        totalInterest += periodInterest;
        
        console.log(`📊 Final Period: ${periodStart.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}`);
        console.log(`   Days: ${days}, Principal: Rs.${remainingPrincipal.toFixed(2)}, Interest: Rs.${periodInterest.toFixed(2)}`);
      }
    }
    
    console.log(`💰 Total Interest: Rs.${totalInterest.toFixed(2)}`);
    return Math.round(totalInterest * 100) / 100;
  };

  // Calculate interest for an owner (UPDATED: Period-based calculation)
  // Formula: Calculate interest period by period based on payment dates
  const getOwnerInterest = (owner) => {
    // First, try to get the stored calculated interest from the database
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${owner.nic}`;
    const storedData = compensationData[key];
    
    // If we have a stored calculated interest amount, use it (more accurate and consistent)
    if (storedData && storedData.calculatedInterestAmount && storedData.calculatedInterestAmount > 0) {
      console.log(`💰 Using stored calculated interest for ${owner.name}: ${storedData.calculatedInterestAmount}`);
      return parseFloat(storedData.calculatedInterestAmount);
    }
    
    // Otherwise, calculate it dynamically with period-based logic
    const finalAmount = getOwnerFinalCompensation(owner);
    const gazetteDate = planData?.section_38_gazette_date;
    
    if (!gazetteDate || !finalAmount) return 0;
    
    // Extract payment dates and amounts
    const paymentData = paymentDetails[key];
    const payments = extractPayments(paymentData);
    
    // Calculate interest using period-based method
    return calculateInterestWithPayments(finalAmount, gazetteDate, payments);
  };

  // Calculate interest dynamically for editing owner (UPDATED: Period-based, updates in real-time)
  const getEditingOwnerInterest = () => {
    if (!editingOwner) return 0;
    
    const finalAmount = parseFloat(editingOwner.compensation?.finalCompensationAmount) || 0;
    const gazetteDate = planData?.section_38_gazette_date;
    
    if (!gazetteDate || !finalAmount) return 0;
    
    // Extract payment dates and amounts for the editing owner
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const paymentData = paymentDetails[key];
    const payments = extractPayments(paymentData);
    
    // Calculate interest using period-based method
    return calculateInterestWithPayments(finalAmount, gazetteDate, payments);
  };

  // Get total compensation paid for editing owner (updates in real-time)
  const getEditingOwnerTotalPaid = () => {
    if (!editingOwner) return 0;
    
    // Get payment details for this owner
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    
    let totalPaid = 0;
    if (data && data.compensationPayment) {
      if (data.compensationPayment.fullPayment?.paidAmount) {
        totalPaid += parseFloat(data.compensationPayment.fullPayment.paidAmount) || 0;
      }
      if (data.compensationPayment.partPayment01?.paidAmount) {
        totalPaid += parseFloat(data.compensationPayment.partPayment01.paidAmount) || 0;
      }
      if (data.compensationPayment.partPayment02?.paidAmount) {
        totalPaid += parseFloat(data.compensationPayment.partPayment02.paidAmount) || 0;
      }
    }
    
    return totalPaid;
  };

  // Calculate balance due dynamically for editing owner (updates in real-time)
  const getEditingOwnerBalanceDue = () => {
    if (!editingOwner) return 0;
    
    const finalAmount = parseFloat(editingOwner.compensation?.finalCompensationAmount) || 0;
    const totalPaid = getEditingOwnerTotalPaid();
    
    return Math.max(0, finalAmount - totalPaid);
  };

  // Get total interest payments made for an owner
  const getOwnerTotalInterestPaid = (owner) => {
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${owner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data.interestPayment) return 0;
    
    let total = 0;
    if (data.interestPayment.fullPayment?.paidAmount) {
      total += parseFloat(data.interestPayment.fullPayment.paidAmount);
    }
    if (data.interestPayment.partPayment01?.paidAmount) {
      total += parseFloat(data.interestPayment.partPayment01.paidAmount);
    }
    if (data.interestPayment.partPayment02?.paidAmount) {
      total += parseFloat(data.interestPayment.partPayment02.paidAmount);
    }
    return total;
  };

  // Get total interest payments made for the editing owner
  const getEditingOwnerInterestPaid = () => {
    if (!editingOwner) return 0;
    
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${editingOwner.nic}`;
    const data = paymentDetails[key];
    if (!data || !data.interestPayment) return 0;
    
    let total = 0;
    if (data.interestPayment.fullPayment?.paidAmount) {
      total += parseFloat(data.interestPayment.fullPayment.paidAmount) || 0;
    }
    if (data.interestPayment.partPayment01?.paidAmount) {
      total += parseFloat(data.interestPayment.partPayment01.paidAmount) || 0;
    }
    if (data.interestPayment.partPayment02?.paidAmount) {
      total += parseFloat(data.interestPayment.partPayment02.paidAmount) || 0;
    }
    return total;
  };

  // Get interest due for the editing owner (Calculated - Paid)
  const getEditingOwnerInterestDue = () => {
    const calculatedInterest = getEditingOwnerInterest();
    const paidInterest = getEditingOwnerInterestPaid();
    return Math.max(0, calculatedInterest - paidInterest);
  };

  // Check if interest payments are complete (paid amount equals calculated interest)
  const isInterestPaymentComplete = (owner) => {
    const finalAmount = getOwnerFinalCompensation(owner);
    
    // If no compensation amount is set yet, interest payment cannot be complete
    if (finalAmount === 0) return false;
    
    const calculatedInterest = getOwnerInterest(owner);
    const paidInterest = getOwnerTotalInterestPaid(owner);
    
    // If calculated interest is 0 (no gazette date or amount), consider it complete only if amount is set
    if (calculatedInterest === 0) return true;
    
    // Allow small rounding differences (within 1 rupee)
    return Math.abs(calculatedInterest - paidInterest) <= 1;
  };

  // Check if send account division date is set
  const isSendAccountDivisionComplete = (owner) => {
    // Check the payment details for this specific owner (not just editingOwner)
    const actualLotId = selectedLot.backend_id || selectedLot.id;
    const key = `${currentPlanId}_${actualLotId}_${owner.nic}`;
    const data = paymentDetails[key];
    
    console.log(`🔍 Checking account division completion for ${owner.name} (${owner.nic})`);
    console.log(`  Key: ${key}`);
    console.log(`  Payment Details Exists: ${!!data}`);
    console.log(`  Account Division Exists: ${!!(data?.accountDivision)}`);
    console.log(`  Sent Date Exists: ${!!(data?.accountDivision?.sentDate)}`);
    console.log(`  Full Date Value: "${data?.accountDivision?.sentDate?.fullDate}"`);
    
    if (!data || !data.accountDivision || !data.accountDivision.sentDate) {
      console.log(`  ❌ Division date NOT complete - missing data structure`);
      return false;
    }
    
    const isComplete = data.accountDivision.sentDate.fullDate && data.accountDivision.sentDate.fullDate.trim() !== '';
    console.log(`  ${isComplete ? '✅' : '❌'} Division date ${isComplete ? 'IS' : 'NOT'} complete`);
    return isComplete;
  };

  // Get overall completion status for an owner based on new criteria
  const getOwnerCompletionStatus = (owner) => {
    const hasAmount = getOwnerFinalCompensation(owner) > 0;
    
    // Balance cleared: Only true if amount is set AND balance is 0
    const balanceCleared = hasAmount && getOwnerBalanceDue(owner) === 0;
    
    const interestComplete = isInterestPaymentComplete(owner);
    const divisionDateSet = isSendAccountDivisionComplete(owner);
    
    if (hasAmount && balanceCleared && interestComplete && divisionDateSet) {
      return { status: 'complete', percentage: 100 };
    } else {
      // Calculate partial completion percentage based on 4 criteria (25% each)
      let completedCriteria = 0;
      if (hasAmount) completedCriteria++;
      if (balanceCleared) completedCriteria++;
      if (interestComplete) completedCriteria++;
      if (divisionDateSet) completedCriteria++;
      
      const percentage = (completedCriteria / 4) * 100;
      
      if (percentage >= 75) {
        return { status: 'near_complete', percentage };
      } else if (percentage >= 25) {
        return { status: 'partial', percentage };
      } else {
        return { status: 'not_started', percentage };
      }
    }
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
      <div className="text-center py-12 bg-slate-50 rounded-lg border border-slate-200">
        <Users className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Owners Found</h3>
        <p className="text-gray-500">This lot doesn't have any registered owners yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Authentication Warning Banner */}
      {(tokenStatus === 'expired' || tokenStatus === 'invalid' || tokenStatus === 'missing') && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Lock className="h-5 w-5 text-red-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Authentication Required
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  {tokenStatus === 'expired' && 'Your session has expired.'}
                  {tokenStatus === 'invalid' && 'Your authentication token is invalid.'}  
                  {tokenStatus === 'missing' && 'You are not logged in.'}
                  {' '}You need to <strong>log in as a Financial Officer</strong> to save compensation data.
                </p>
              </div>
              <div className="mt-4">
                <div className="flex">
                  <a
                    href="/login"
                    className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 transition-colors"
                  >
                    Go to Login
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header Section */}
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
          
          {/* Role-based Access Indicator */}
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

        {/* Summary Cards */}
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

      {/* Owner Cards */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center">
          <DollarSign className="w-5 h-5 mr-2 text-orange-600" />
          Individual Owner Compensation Details
        </h4>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {selectedLot.owners.map((owner, index) => {
            const completionStatus = getOwnerCompletionStatus(owner);
            const finalCompensation = getOwnerFinalCompensation(owner);
            const totalPaid = getOwnerTotalPaymentDone(owner); // Total compensation paid
            const balanceDue = getOwnerBalanceDue(owner);
            const calculatedInterest = getOwnerInterest(owner);
            const paidInterest = getOwnerTotalInterestPaid(owner);
            const interestDue = Math.max(0, calculatedInterest - paidInterest); // Interest Due = Calculated - Paid
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300">
                {/* Header with completion status */}
                <div className={`p-4 ${
                  completionStatus.status === 'complete' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                  completionStatus.status === 'near_complete' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                  completionStatus.status === 'partial' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                  'bg-gradient-to-r from-gray-500 to-gray-600'
                }`}>
                  <div className="flex items-center justify-between text-white">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                        <User size={20} />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{owner.name}</h3>
                        <p className="text-sm opacity-90">NIC: {owner.nic}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{completionStatus.percentage}%</div>
                      <div className="text-xs opacity-90">Complete</div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 space-y-4">
                  {/* Completion Criteria Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        finalCompensation > 0 ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={finalCompensation > 0 ? 'text-green-700' : 'text-gray-500'}>
                        Amount Set
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        (finalCompensation > 0 && balanceDue === 0) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={(finalCompensation > 0 && balanceDue === 0) ? 'text-green-700' : 'text-gray-500'}>
                        Balance Cleared
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        isInterestPaymentComplete(owner) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={isInterestPaymentComplete(owner) ? 'text-green-700' : 'text-gray-500'}>
                        Interest Paid
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm">
                      <div className={`w-4 h-4 rounded-full mr-2 ${
                        isSendAccountDivisionComplete(owner) ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      <span className={isSendAccountDivisionComplete(owner) ? 'text-green-700' : 'text-gray-500'}>
                        Division Date
                      </span>
                    </div>
                  </div>

                  {/* Financial Summary */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Final Amount:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(finalCompensation)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Paid:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(totalPaid)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Balance Due:</span>
                      <span className={`font-semibold ${balanceDue === 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(balanceDue)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Calculated Interest:</span>
                      <span className="font-semibold text-blue-600">
                        {formatCurrency(calculatedInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest Paid:</span>
                      <span className="font-semibold text-green-600">
                        {formatCurrency(paidInterest)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Interest Due:</span>
                      <span className={`font-semibold ${interestDue === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {formatCurrency(interestDue)}
                      </span>
                    </div>
                  </div>

                  {/* Action Button - Only show for Financial Officers */}
                  {canEdit && (
                    <button
                      onClick={() => handleEditCompensation(owner)}
                      className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center bg-orange-500 hover:bg-orange-600 text-white shadow-md hover:shadow-lg"
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Details
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal for editing/viewing compensation details */}
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

            {/* Basic Owner Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 bg-opacity-80 backdrop-blur rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-gray-600" />
                  Owner Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Owner Name</label>
                    <div className="text-lg font-semibold text-gray-900">{editingOwner.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">NIC Number</label>
                    <div className="text-gray-900">{editingOwner.nic}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Share Percentage</label>
                    <div className="text-lg font-semibold text-blue-600">
                      {getOwnerSharePercentage(editingOwner)}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 bg-opacity-80 backdrop-blur rounded-xl p-6 border border-green-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Compensation Summary
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Final Compensation Amount</label>
                    {canEdit ? (
                      <input
                        type="number"
                        value={editingOwner.compensation?.finalCompensationAmount || ''}
                        onChange={(e) => handleInputChange('finalCompensationAmount', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white bg-opacity-90 backdrop-blur"
                        placeholder="Enter final compensation amount"
                      />
                    ) : (
                      <div className="text-lg font-semibold text-green-600">
                        {formatCurrency(editingOwner.compensation?.finalCompensationAmount || 0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Total Paid</label>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(getEditingOwnerTotalPaid())}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Sum of all compensation payments
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Balance Due</label>
                    <div className={`text-lg font-semibold ${getEditingOwnerBalanceDue() === 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatCurrency(getEditingOwnerBalanceDue())}
                    </div>
                  </div>
                </div>
                
                {/* Interest Summary - Three columns */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Calculated Interest (7% p.a.)</label>
                    <div className="text-lg font-semibold text-blue-600">
                      {formatCurrency(getEditingOwnerInterest())}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Interest Paid</label>
                    <div className="text-lg font-semibold text-green-600">
                      {formatCurrency(getEditingOwnerInterestPaid())}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Interest Due</label>
                    <div className={`text-lg font-semibold ${getEditingOwnerInterestDue() === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                      {formatCurrency(getEditingOwnerInterestDue())}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {canEdit && (
              <>
                {/* Compensation Payment Details */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 bg-opacity-80 backdrop-blur rounded-xl p-6 border border-blue-200 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <DollarSign className="w-6 h-6 mr-2 text-blue-600" />
                    Compensation Payment Details
                  </h3>
                  
                  {/* Compensation Full Payment */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 mb-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('compensationPayment', 'fullPayment') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Full Payment
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'fullPayment', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'fullPayment', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compensation Part Payment 01 */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 mb-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('compensationPayment', 'partPayment01') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Part Payment 01
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment01', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment01', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Compensation Part Payment 02 */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 border border-blue-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('compensationPayment', 'partPayment02') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Part Payment 02
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('compensationPayment', 'partPayment02', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('compensationPayment', 'partPayment02', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interest Payment Details */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 bg-opacity-80 backdrop-blur rounded-xl p-6 border border-purple-200 mb-8">
                  <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <Percent className="w-6 h-6 mr-2 text-purple-600" />
                    Interest Payment Details (7% annually)
                  </h3>
                  
                  {/* Interest calculation display */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 mb-4 border border-purple-200">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-600">Calculated Interest:</span>
                        <span className="text-lg font-bold text-purple-600 ml-2">
                          {formatCurrency(getEditingOwnerInterest())}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Interest Paid:</span>
                        <span className="text-lg font-bold text-green-600 ml-2">
                          {formatCurrency(getOwnerTotalInterestPaid(editingOwner))}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Interest Full Payment */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 mb-4 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('interestPayment', 'fullPayment') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Interest Full Payment
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'fullPayment', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'fullPayment', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interest Part Payment 01 */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 mb-4 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('interestPayment', 'partPayment01') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Interest Part Payment 01
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment01', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment01', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Interest Part Payment 02 */}
                  <div className="bg-white bg-opacity-90 backdrop-blur rounded-lg p-4 border border-purple-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                      <div className={`w-4 h-4 rounded-full mr-2 ${isPaymentFilled('interestPayment', 'partPayment02') ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Interest Part Payment 02
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'fullDate', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Cheque No</label>
                        <input
                          type="text"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'chequeNo')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'chequeNo', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="Cheque number"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Deducted Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'deductedAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'deductedAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-600 mb-1">Paid Amount</label>
                        <input
                          type="number"
                          value={getPaymentDetailsValue('interestPayment', 'partPayment02', 'paidAmount')}
                          onChange={(e) => handlePaymentDetailsChange('interestPayment', 'partPayment02', 'paidAmount', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
                          placeholder="0.00"
                        />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        <input
                          type="date"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white/70 backdrop-blur-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                          value={getPaymentDetailsValue('accountDivision', 'sentDate', 'fullDate')}
                          onChange={(e) => handlePaymentDetailsChange('accountDivision', 'sentDate', 'fullDate', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CompensationDetailsTab;
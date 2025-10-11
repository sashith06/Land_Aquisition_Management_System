const CompensationPaymentDetails = require("../models/compensationPaymentDetailsModel");

// Create or update payment details
const createOrUpdatePaymentDetails = (req, res) => {
  const { plan_id, lot_id, owner_nic } = req.params;
  
  console.log('=== COMPENSATION PAYMENT DETAILS CONTROLLER DEBUG ===');
  console.log('User:', req.user);
  console.log('User ID:', req.user?.id);
  console.log('User Role:', req.user?.role);
  console.log('createOrUpdatePaymentDetails called with:', { plan_id, lot_id, owner_nic });
  console.log('Request Body:', req.body);
  console.log('=== END DEBUG ===');
  
  // Check if user has permission to modify payment details
  if (!req.user || !['financial_officer', 'FO'].includes(req.user.role)) {
    console.error('Unauthorized access attempt:', { 
      userId: req.user?.id, 
      userRole: req.user?.role 
    });
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers can modify payment details."
    });
  }
  
  // Validate parameters
  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    console.error('Invalid lot_id or plan_id:', { lot_id, plan_id, parsedLotId, parsedPlanId });
    return res.status(400).json({ 
      success: false, 
      message: "Invalid lot_id or plan_id. Must be numbers." 
    });
  }

  if (!owner_nic || typeof owner_nic !== 'string') {
    console.error('Invalid owner_nic:', owner_nic);
    return res.status(400).json({ 
      success: false, 
      message: "Invalid owner_nic. Must be provided." 
    });
  }

  // Validate required user information
  if (!req.user || !req.user.id) {
    console.error('Missing user information in request');
    return res.status(401).json({
      success: false,
      message: "User authentication required"
    });
  }

  const paymentData = {
    plan_id: parsedPlanId,
    lot_id: parsedLotId,
    owner_nic: owner_nic,
    ...req.body,
    created_by: req.user.id,
    updated_by: req.user.id
  };

  console.log('Saving payment data:', paymentData);

  CompensationPaymentDetails.createOrUpdate(paymentData, (err, result) => {
    if (err) {
      console.error("Error saving payment details:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error saving payment details",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    console.log('Payment details saved successfully:', result);
    res.status(200).json({
      success: true,
      message: "Payment details saved successfully",
      data: {
        id: result.insertId || result.affectedRows
      }
    });
  });
};

// Get payment details by owner
const getPaymentDetailsByOwner = (req, res) => {
  const { plan_id, lot_id, owner_nic } = req.params;

  console.log('=== getPaymentDetailsByOwner DEBUG START ===');
  console.log('Raw req.params:', req.params);
  console.log('plan_id:', plan_id, 'type:', typeof plan_id);
  console.log('lot_id:', lot_id, 'type:', typeof lot_id);
  console.log('owner_nic:', owner_nic, 'type:', typeof owner_nic);
  console.log('User:', req.user);
  console.log('=== getPaymentDetailsByOwner DEBUG END ===');

  // Validate parameters
  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    console.error('Invalid lot_id or plan_id:', { lot_id, plan_id, parsedLotId, parsedPlanId });
    return res.status(400).json({ 
      success: false, 
      message: "Invalid lot_id or plan_id. Must be numbers." 
    });
  }

  if (!owner_nic) {
    return res.status(400).json({ 
      success: false, 
      message: "owner_nic is required." 
    });
  }

  CompensationPaymentDetails.getByOwner(parsedPlanId, parsedLotId, owner_nic, (err, results) => {
    if (err) {
      console.error("Error fetching payment details:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching payment details",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    console.log('Payment details results:', results);
    res.status(200).json({
      success: true,
      data: results.length > 0 ? results[0] : null
    });
  });
};

// Get payment details by lot
const getPaymentDetailsByLot = (req, res) => {
  const { plan_id, lot_id } = req.params;

  console.log('getPaymentDetailsByLot called with:', { plan_id, lot_id });

  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lot_id or plan_id. Must be numbers."
    });
  }

  CompensationPaymentDetails.getByLot(parsedPlanId, parsedLotId, (err, results) => {
    if (err) {
      console.error("Error fetching payment details for lot:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching payment details",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Get all payment details for a plan
const getPaymentDetailsByPlan = (req, res) => {
  const { plan_id } = req.params;

  console.log('getPaymentDetailsByPlan called with plan_id:', plan_id);

  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan_id. Must be a number."
    });
  }

  CompensationPaymentDetails.getByPlan(parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching payment details for plan:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching payment details",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Get payment summary for a plan
const getPaymentSummary = (req, res) => {
  const { plan_id } = req.params;

  console.log('getPaymentSummary called with plan_id:', plan_id);

  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid plan_id. Must be a number."
    });
  }

  CompensationPaymentDetails.getPaymentSummary(parsedPlanId, (err, results) => {
    if (err) {
      console.error("Error fetching payment summary:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error fetching payment summary",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    res.status(200).json({
      success: true,
      data: results
    });
  });
};

// Delete payment details
const deletePaymentDetails = (req, res) => {
  const { plan_id, lot_id, owner_nic } = req.params;

  console.log('deletePaymentDetails called with:', { plan_id, lot_id, owner_nic });

  // Check if user has permission to delete payment details
  if (!req.user || !['financial_officer', 'FO', 'admin'].includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers or Admins can delete payment details."
    });
  }

  const parsedLotId = parseInt(lot_id);
  const parsedPlanId = parseInt(plan_id);
  
  if (isNaN(parsedLotId) || isNaN(parsedPlanId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid lot_id or plan_id. Must be numbers."
    });
  }

  if (!owner_nic) {
    return res.status(400).json({
      success: false,
      message: "owner_nic is required."
    });
  }

  CompensationPaymentDetails.delete(parsedPlanId, parsedLotId, owner_nic, (err, result) => {
    if (err) {
      console.error("Error deleting payment details:", err);
      return res.status(500).json({ 
        success: false, 
        message: "Error deleting payment details",
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Payment details not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Payment details deleted successfully"
    });
  });
};

// Legacy compatibility methods for old compensation API
const createOrUpdateCompensation = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('=== LEGACY COMPENSATION CONTROLLER DEBUG ===');
  console.log('User:', req.user);
  console.log('createOrUpdateCompensation called with:', { plan_id, lot_id });
  console.log('Request Body:', req.body);
  console.log('=== END DEBUG ===');
  console.log('🚀 Starting permission and format checks...');
  
  // Check if user has permission to modify compensation details
  if (!req.user || !['financial_officer', 'FO'].includes(req.user.role)) {
    console.error('Unauthorized access attempt:', { 
      userId: req.user?.id, 
      userRole: req.user?.role 
    });
    return res.status(403).json({
      success: false,
      message: "Access denied. Only Financial Officers can modify compensation details."
    });
  }

  console.log('✅ Permission check passed, proceeding to format detection...');

  // Handle both old and new data formats
  let processData;
  
  // Check if it's the new direct format (single owner data)
  console.log('🔍 Checking format - owner_nic:', req.body.owner_nic, 'owner_name:', req.body.owner_name);
  console.log('🔍 Condition evaluation:', !!(req.body.owner_nic && req.body.owner_name));
  
  if (req.body.owner_nic && req.body.owner_name) {
    console.log('✅ Processing new direct format');
    
    // Validate parameters
    const parsedPlanId = parseInt(plan_id);
    const parsedLotId = parseInt(lot_id);
    
    if (isNaN(parsedPlanId) || isNaN(parsedLotId)) {
      console.error('Invalid plan_id or lot_id:', { plan_id, lot_id, parsedPlanId, parsedLotId });
      return res.status(400).json({ 
        success: false, 
        message: "Invalid plan_id or lot_id. Must be numbers." 
      });
    }

    // Validate required user information
    if (!req.user || !req.user.id) {
      console.error('Missing user information in request');
      return res.status(401).json({
        success: false,
        message: "User authentication required"
      });
    }

    const paymentData = {
      plan_id: parsedPlanId,
      lot_id: parsedLotId,
      owner_nic: req.body.owner_nic,
      owner_name: req.body.owner_name,
      final_compensation_amount: req.body.final_compensation_amount || 0,
      
      // Compensation payment details
      compensation_full_payment_date: req.body.compensation_full_payment_date || null,
      compensation_full_payment_cheque_no: req.body.compensation_full_payment_cheque_no || null,
      compensation_full_payment_deducted_amount: req.body.compensation_full_payment_deducted_amount || 0,
      compensation_full_payment_paid_amount: req.body.compensation_full_payment_paid_amount || 0,
      
      compensation_part_payment_01_date: req.body.compensation_part_payment_01_date || null,
      compensation_part_payment_01_cheque_no: req.body.compensation_part_payment_01_cheque_no || null,
      compensation_part_payment_01_deducted_amount: req.body.compensation_part_payment_01_deducted_amount || 0,
      compensation_part_payment_01_paid_amount: req.body.compensation_part_payment_01_paid_amount || 0,
      
      compensation_part_payment_02_date: req.body.compensation_part_payment_02_date || null,
      compensation_part_payment_02_cheque_no: req.body.compensation_part_payment_02_cheque_no || null,
      compensation_part_payment_02_deducted_amount: req.body.compensation_part_payment_02_deducted_amount || 0,
      compensation_part_payment_02_paid_amount: req.body.compensation_part_payment_02_paid_amount || 0,
      
      created_by: req.user.id.toString(),
      updated_by: req.user.id.toString()
    };

    console.log('Saving direct format payment data:', paymentData);

    CompensationPaymentDetails.createOrUpdate(paymentData, (err, result) => {
      if (err) {
        console.error("Error saving compensation details:", err);
        return res.status(500).json({ 
          success: false, 
          message: "Error saving compensation details",
          error: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
      }

      console.log('Compensation details saved successfully:', result);
      res.status(200).json({
        success: true,
        message: "Compensation details saved successfully",
        data: {
          id: result.insertId || result.affectedRows
        }
      });
    });
    
    return; // Exit early for new format
  }
  
  // Handle old format with owner_data and compensation_payment arrays
  console.log('❌ New format not detected, trying old format...');
  const { owner_data, compensation_payment } = req.body;
  
  console.log('🔍 owner_data:', owner_data, 'type:', typeof owner_data, 'isArray:', Array.isArray(owner_data));
  console.log('🔍 compensation_payment:', compensation_payment, 'type:', typeof compensation_payment);
  
  if (!owner_data || !Array.isArray(owner_data)) {
    console.log('❌ Invalid owner_data format - sending 400 error');
    return res.status(400).json({
      success: false,
      message: "Invalid data format. Expected either direct format with owner_nic/owner_name or old format with owner_data array."
    });
  }

  // Save each owner's data
  let savedCount = 0;
  const errors = [];

  owner_data.forEach((owner, index) => {
    console.log(`Processing owner ${index}:`, owner);
    
    const paymentData = {
      plan_id: parseInt(plan_id),
      lot_id: parseInt(lot_id),
      owner_nic: owner.nic,
      owner_name: owner.name,
      created_by: req.user.id.toString(),
      updated_by: req.user.id.toString()
    };
    
    console.log('Raw owner data received:', owner);
    
    // Store the final compensation amount in the proper field
    if (owner.finalCompensationAmount && parseFloat(owner.finalCompensationAmount) > 0) {
      paymentData.final_compensation_amount = parseFloat(owner.finalCompensationAmount);
    }

    // Extract payment details for this owner from compensation_payment data
    const ownerKey = `${plan_id}_${lot_id}_${owner.nic}`;
    console.log('Looking for payment details with key:', ownerKey);
    console.log('Available payment detail keys:', Object.keys(compensation_payment || {}));
    console.log('Full compensation_payment object:', JSON.stringify(compensation_payment, null, 2));
    
    // Additional debugging - check if compensation_payment exists and has data
    console.log('compensation_payment exists:', !!compensation_payment);
    console.log('compensation_payment type:', typeof compensation_payment);
    console.log('compensation_payment length:', compensation_payment ? Object.keys(compensation_payment).length : 0);
    
    if (compensation_payment && compensation_payment[ownerKey]) {
      const ownerPaymentData = compensation_payment[ownerKey];
      console.log('Found payment details for owner:', ownerPaymentData);
      
      // Check if there are any actual payment details (not just empty objects)
      const hasActualPaymentData = (
        (ownerPaymentData.compensationPayment?.fullPayment?.date) ||
        (ownerPaymentData.compensationPayment?.fullPayment?.chequeNo) ||
        (ownerPaymentData.compensationPayment?.fullPayment?.paidAmount) ||
        (ownerPaymentData.compensationPayment?.partPayment01?.date) ||
        (ownerPaymentData.compensationPayment?.partPayment01?.paidAmount) ||
        (ownerPaymentData.compensationPayment?.partPayment02?.date) ||
        (ownerPaymentData.compensationPayment?.partPayment02?.paidAmount) ||
        (ownerPaymentData.interestPayment?.fullPayment?.date) ||
        (ownerPaymentData.interestPayment?.fullPayment?.paidAmount) ||
        (ownerPaymentData.accountDivision?.sentDate?.date)
      );
      
      console.log('Has actual payment data:', hasActualPaymentData);
      
      if (hasActualPaymentData) {
        console.log('Processing payment details');
        
        // Map compensation payment details
      if (ownerPaymentData.compensationPayment) {
        const compPay = ownerPaymentData.compensationPayment;
        
        // Full payment details
        if (compPay.fullPayment) {
          console.log('Processing fullPayment:', compPay.fullPayment);
          if (compPay.fullPayment.date) {
            paymentData.compensation_full_payment_date = compPay.fullPayment.date;
            console.log('Set compensation_full_payment_date:', compPay.fullPayment.date);
          }
          if (compPay.fullPayment.chequeNo) {
            paymentData.compensation_full_payment_cheque_no = compPay.fullPayment.chequeNo;
            console.log('Set compensation_full_payment_cheque_no:', compPay.fullPayment.chequeNo);
          }
          if (compPay.fullPayment.deductedAmount !== undefined && compPay.fullPayment.deductedAmount !== '') {
            paymentData.compensation_full_payment_deducted_amount = parseFloat(compPay.fullPayment.deductedAmount) || 0;
            console.log('Set compensation_full_payment_deducted_amount:', paymentData.compensation_full_payment_deducted_amount);
          }
          if (compPay.fullPayment.paidAmount !== undefined && compPay.fullPayment.paidAmount !== '') {
            paymentData.compensation_full_payment_paid_amount = parseFloat(compPay.fullPayment.paidAmount) || 0;
            console.log('Set compensation_full_payment_paid_amount:', paymentData.compensation_full_payment_paid_amount);
          }
        } else {
          console.log('No fullPayment data found in compPay');
        }
        
        // Part payment 01 details
        if (compPay.partPayment01) {
          if (compPay.partPayment01.date) paymentData.compensation_part_payment_01_date = compPay.partPayment01.date;
          if (compPay.partPayment01.chequeNo) paymentData.compensation_part_payment_01_cheque_no = compPay.partPayment01.chequeNo;
          if (compPay.partPayment01.deductedAmount !== undefined && compPay.partPayment01.deductedAmount !== '') paymentData.compensation_part_payment_01_deducted_amount = parseFloat(compPay.partPayment01.deductedAmount) || 0;
          if (compPay.partPayment01.paidAmount !== undefined && compPay.partPayment01.paidAmount !== '') paymentData.compensation_part_payment_01_paid_amount = parseFloat(compPay.partPayment01.paidAmount) || 0;
        }
        
        // Part payment 02 details
        if (compPay.partPayment02) {
          if (compPay.partPayment02.date) paymentData.compensation_part_payment_02_date = compPay.partPayment02.date;
          if (compPay.partPayment02.chequeNo) paymentData.compensation_part_payment_02_cheque_no = compPay.partPayment02.chequeNo;
          if (compPay.partPayment02.deductedAmount !== undefined && compPay.partPayment02.deductedAmount !== '') paymentData.compensation_part_payment_02_deducted_amount = parseFloat(compPay.partPayment02.deductedAmount) || 0;
          if (compPay.partPayment02.paidAmount !== undefined && compPay.partPayment02.paidAmount !== '') paymentData.compensation_part_payment_02_paid_amount = parseFloat(compPay.partPayment02.paidAmount) || 0;
        }
      }
      
      // Map interest payment details if present
      if (ownerPaymentData.interestPayment) {
        const intPay = ownerPaymentData.interestPayment;
        
        // Interest full payment details
        if (intPay.fullPayment) {
          if (intPay.fullPayment.date) paymentData.interest_full_payment_date = intPay.fullPayment.date;
          if (intPay.fullPayment.chequeNo) paymentData.interest_full_payment_cheque_no = intPay.fullPayment.chequeNo;
          if (intPay.fullPayment.deductedAmount) paymentData.interest_full_payment_deducted_amount = parseFloat(intPay.fullPayment.deductedAmount) || 0;
          if (intPay.fullPayment.paidAmount) paymentData.interest_full_payment_paid_amount = parseFloat(intPay.fullPayment.paidAmount) || 0;
        }
        
        // Interest part payment 01
        if (intPay.partPayment01) {
          if (intPay.partPayment01.date) paymentData.interest_part_payment_01_date = intPay.partPayment01.date;
          if (intPay.partPayment01.chequeNo) paymentData.interest_part_payment_01_cheque_no = intPay.partPayment01.chequeNo;
          if (intPay.partPayment01.deductedAmount) paymentData.interest_part_payment_01_deducted_amount = parseFloat(intPay.partPayment01.deductedAmount) || 0;
          if (intPay.partPayment01.paidAmount) paymentData.interest_part_payment_01_paid_amount = parseFloat(intPay.partPayment01.paidAmount) || 0;
        }
        
        // Interest part payment 02
        if (intPay.partPayment02) {
          if (intPay.partPayment02.date) paymentData.interest_part_payment_02_date = intPay.partPayment02.date;
          if (intPay.partPayment02.chequeNo) paymentData.interest_part_payment_02_cheque_no = intPay.partPayment02.chequeNo;
          if (intPay.partPayment02.deductedAmount) paymentData.interest_part_payment_02_deducted_amount = parseFloat(intPay.partPayment02.deductedAmount) || 0;
          if (intPay.partPayment02.paidAmount) paymentData.interest_part_payment_02_paid_amount = parseFloat(intPay.partPayment02.paidAmount) || 0;
        }
      }
      
        // Map account division details if present
        if (ownerPaymentData.accountDivision && ownerPaymentData.accountDivision.sentDate) {
          paymentData.account_division_sent_date = ownerPaymentData.accountDivision.sentDate.date;
        }
      } else {
        console.log('No actual payment data found, skipping payment detail processing');
      }
    }
    
    console.log('Prepared payment data:', paymentData);

    CompensationPaymentDetails.createOrUpdate(paymentData, (err, result) => {
      if (err) {
        console.error(`Error saving owner ${index}:`, err);
        errors.push(`Owner ${owner.name}: ${err.message}`);
      } else {
        savedCount++;
      }

      // Check if all owners processed
      if (savedCount + errors.length === owner_data.length) {
        if (errors.length === 0) {
          res.status(200).json({
            success: true,
            message: "Compensation saved successfully",
            data: { saved_owners: savedCount }
          });
        } else {
          res.status(500).json({
            success: false,
            message: `Partial save completed. Errors: ${errors.join(', ')}`,
            data: { saved_owners: savedCount, errors }
          });
        }
      }
    });
  });
};

const getCompensationByLot = (req, res) => {
  const { plan_id, lot_id } = req.params;
  
  console.log('=== LEGACY getCompensationByLot DEBUG ===');
  console.log('plan_id:', plan_id, 'lot_id:', lot_id);
  console.log('Parsed values:', parseInt(plan_id), parseInt(lot_id));
  
  // Validate parameters
  const parsedPlanId = parseInt(plan_id);
  const parsedLotId = parseInt(lot_id);
  
  if (isNaN(parsedPlanId) || isNaN(parsedLotId)) {
    console.error('Invalid parameters:', { plan_id, lot_id, parsedPlanId, parsedLotId });
    return res.status(400).json({
      success: false,
      message: "Invalid plan_id or lot_id. Must be numbers."
    });
  }
  
  CompensationPaymentDetails.getByLot(parsedPlanId, parsedLotId, (err, results) => {
    if (err) {
      console.error("Error fetching compensation by lot:", err);
      return res.status(500).json({
        success: false,
        message: "Error fetching compensation data"
      });
    }

    // Convert to format including all payment details
    const owner_data = results.map(result => ({
      nic: result.owner_nic,
      name: result.owner_name,
      finalCompensationAmount: result.final_compensation_amount || 0
    }));

    // Build compensation_payment data structure for frontend
    const compensation_payment = {};
    results.forEach(result => {
      const key = `${parsedPlanId}_${parsedLotId}_${result.owner_nic}`;
      compensation_payment[key] = {
        compensationPayment: {
          fullPayment: {
            date: result.compensation_full_payment_date || '',
            chequeNo: result.compensation_full_payment_cheque_no || '',
            deductedAmount: result.compensation_full_payment_deducted_amount || 0,
            paidAmount: result.compensation_full_payment_paid_amount || 0
          },
          partPayment01: {
            date: result.compensation_part_payment_01_date || '',
            chequeNo: result.compensation_part_payment_01_cheque_no || '',
            deductedAmount: result.compensation_part_payment_01_deducted_amount || 0,
            paidAmount: result.compensation_part_payment_01_paid_amount || 0
          },
          partPayment02: {
            date: result.compensation_part_payment_02_date || '',
            chequeNo: result.compensation_part_payment_02_cheque_no || '',
            deductedAmount: result.compensation_part_payment_02_deducted_amount || 0,
            paidAmount: result.compensation_part_payment_02_paid_amount || 0
          }
        },
        interestPayment: {
          fullPayment: {
            date: result.interest_full_payment_date || '',
            chequeNo: result.interest_full_payment_cheque_no || '',
            deductedAmount: result.interest_full_payment_deducted_amount || 0,
            paidAmount: result.interest_full_payment_paid_amount || 0
          },
          partPayment01: {
            date: result.interest_part_payment_01_date || '',
            chequeNo: result.interest_part_payment_01_cheque_no || '',
            deductedAmount: result.interest_part_payment_01_deducted_amount || 0,
            paidAmount: result.interest_part_payment_01_paid_amount || 0
          },
          partPayment02: {
            date: result.interest_part_payment_02_date || '',
            chequeNo: result.interest_part_payment_02_cheque_no || '',
            deductedAmount: result.interest_part_payment_02_deducted_amount || 0,
            paidAmount: result.interest_part_payment_02_paid_amount || 0
          }
        },
        accountDivision: {
          sentDate: {
            date: result.account_division_sent_date || ''
          }
        }
      };
    });

    res.status(200).json({
      success: true,
      data: {
        owner_data,
        compensation_payment: compensation_payment,
        interest_payment: {},
        total_compensation: owner_data.reduce((sum, owner) => sum + parseFloat(owner.finalCompensationAmount || 0), 0)
      }
    });
  });
};

// Helper function to extract payment details from old format
const extractPaymentDetails = (compensation_payment, owner_nic) => {
  if (!compensation_payment || !compensation_payment[owner_nic]) {
    return {};
  }
  
  const ownerPayment = compensation_payment[owner_nic];
  return {
    // Extract and map payment details as needed
    // This depends on your payment structure
  };
};

module.exports = {
  createOrUpdatePaymentDetails,
  getPaymentDetailsByOwner,
  getPaymentDetailsByLot,
  getPaymentDetailsByPlan,
  getPaymentSummary,
  deletePaymentDetails,
  // Legacy compatibility methods
  createOrUpdateCompensation,
  getCompensationByLot
};
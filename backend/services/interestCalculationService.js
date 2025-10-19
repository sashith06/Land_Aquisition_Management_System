const db = require('../config/db').promise;

/**
 * Interest Calculation Service
 * Calculates Interest to be paid using period-based calculation:
 * Interest is calculated period by period based on payment dates.
 * Principal reduces after each payment, affecting subsequent interest calculations.
 */

class InterestCalculationService {
  
  /**
   * Calculate interest with period-based logic (considers payment dates)
   * @param {number} finalCompensationAmount - Final compensation amount (principal)
   * @param {Date} gazetteDate - Section 38 Gazette Date (start date)
   * @param {Array} payments - Array of payment objects: [{ date, amount }, ...]
   * @returns {number} Calculated interest amount
   */
  static calculateInterestWithPayments(finalCompensationAmount, gazetteDate, payments = []) {
    if (!finalCompensationAmount || !gazetteDate) return 0;
    
    // Sort payments chronologically
    const sortedPayments = payments
      .filter(p => p.date && p.amount > 0)
      .map(p => ({
        date: new Date(p.date),
        amount: parseFloat(p.amount)
      }))
      .sort((a, b) => a.date - b.date);
    
    let totalInterest = 0;
    let remainingPrincipal = parseFloat(finalCompensationAmount);
    let periodStart = new Date(gazetteDate);
    
    // Calculate interest for each payment period
    for (const payment of sortedPayments) {
      const paymentDate = payment.date;
      
      // Skip if payment date is before gazette date
      if (paymentDate < periodStart) continue;
      
      // Calculate days in this period
      const days = Math.floor((paymentDate - periodStart) / (1000 * 60 * 60 * 24));
      
      if (days > 0 && remainingPrincipal > 0) {
        const periodInterest = (remainingPrincipal * 0.07 * days) / 365.0;
        totalInterest += periodInterest;
        
        console.log(`📊 Interest Period: ${periodStart.toISOString().split('T')[0]} to ${paymentDate.toISOString().split('T')[0]}`);
        console.log(`   Days: ${days}, Principal: ${remainingPrincipal.toFixed(2)}, Interest: ${periodInterest.toFixed(2)}`);
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
        const periodInterest = (remainingPrincipal * 0.07 * days) / 365.0;
        totalInterest += periodInterest;
        
        console.log(`📊 Final Period: ${periodStart.toISOString().split('T')[0]} to ${currentDate.toISOString().split('T')[0]}`);
        console.log(`   Days: ${days}, Principal: ${remainingPrincipal.toFixed(2)}, Interest: ${periodInterest.toFixed(2)}`);
      }
    }
    
    console.log(`💰 Total Interest Calculated: ${totalInterest.toFixed(2)}`);
    return Math.round(totalInterest * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Legacy method: Calculate interest for a specific compensation record
   * NOTE: This uses simple calculation without considering payment dates
   * Use calculateInterestWithPayments() for accurate period-based calculation
   * @param {number} finalCompensationAmount - Final compensation amount
   * @param {Date} gazetteDate - Section 38 Gazette Date
   * @returns {number} Calculated interest amount
   */
  static calculateInterest(finalCompensationAmount, gazetteDate) {
    if (!finalCompensationAmount || !gazetteDate) return 0;
    
    const currentDate = new Date();
    const gazette = new Date(gazetteDate);
    const daysDifference = Math.floor((currentDate - gazette) / (1000 * 60 * 60 * 24));
    
    if (daysDifference <= 0) return 0;
    
    // Simple formula: (Final Compensation Amount × 7% annual rate × Days Since Gazette) ÷ 365 days
    // NOTE: This doesn't consider payment dates - use calculateInterestWithPayments() instead
    const interest = (finalCompensationAmount * 0.07 * daysDifference) / 365.0;
    return Math.round(interest * 100) / 100; // Round to 2 decimal places
  }
  
  /**
   * Update interest for a specific compensation record
   * @param {number} planId - Plan ID
   * @param {number} lotId - Lot ID
   */
  static async updateInterestForLot(planId, lotId) {
    try {
      // Get compensation and gazette date
      const [records] = await db.query(`
        SELECT 
          cpd.id,
          cpd.final_compensation_amount,
          cpd.gazette_date,
          pl.section_38_gazette_date
        FROM compensation_payment_details cpd
        LEFT JOIN plans pl ON pl.id = cpd.plan_id
        WHERE cpd.plan_id = ? AND cpd.lot_id = ?
      `, [planId, lotId]);
      
      if (records.length === 0) return;
      
      const record = records[0];
      const gazetteDate = record.gazette_date || record.section_38_gazette_date;
      
      if (!gazetteDate || !record.final_compensation_amount) return;
      
      const interestAmount = this.calculateInterest(record.final_compensation_amount, gazetteDate);
      
      // Update the database
      await db.query(`
        UPDATE compensation_payment_details 
        SET 
          interest_to_be_paid = ?,
          gazette_date = COALESCE(gazette_date, ?)
        WHERE plan_id = ? AND lot_id = ?
      `, [interestAmount, gazetteDate, planId, lotId]);
      
      return interestAmount;
    } catch (error) {
      console.error('Error updating interest for lot:', error);
      throw error;
    }
  }
  
  /**
   * Update interest for all lots in a plan
   * @param {number} planId - Plan ID
   */
  static async updateInterestForPlan(planId) {
    try {
      console.log(`Updating interest calculations for plan ${planId}...`);
      
      // Get plan gazette date
      const [planData] = await db.query(`
        SELECT section_38_gazette_date FROM plans WHERE id = ?
      `, [planId]);
      
      if (planData.length === 0 || !planData[0].section_38_gazette_date) {
        console.log('No gazette date found for plan');
        return;
      }
      
      const gazetteDate = planData[0].section_38_gazette_date;
      
      // Update all compensation records for this plan
      const updateQuery = `
        UPDATE compensation_payment_details 
        SET 
          interest_to_be_paid = CASE 
            WHEN final_compensation_amount > 0 
            THEN (final_compensation_amount * 0.07 * DATEDIFF(CURDATE(), ?)) / 365.0
            ELSE 0 
          END,
          gazette_date = ?
        WHERE plan_id = ? AND final_compensation_amount > 0
      `;
      
      const [result] = await db.query(updateQuery, [gazetteDate, gazetteDate, planId]);
      console.log(`✅ Updated interest for ${result.affectedRows} lots in plan ${planId}`);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating interest for plan:', error);
      throw error;
    }
  }
  
  /**
   * Update interest for all compensation records
   */
  static async updateAllInterestCalculations() {
    try {
      console.log('Updating all interest calculations...');
      
      const updateQuery = `
        UPDATE compensation_payment_details cpd
        JOIN plans p ON p.id = cpd.plan_id
        SET 
          cpd.interest_to_be_paid = CASE 
            WHEN cpd.final_compensation_amount > 0 AND p.section_38_gazette_date IS NOT NULL
            THEN (cpd.final_compensation_amount * 0.07 * DATEDIFF(CURDATE(), p.section_38_gazette_date)) / 365.0
            ELSE 0 
          END,
          cpd.gazette_date = COALESCE(cpd.gazette_date, p.section_38_gazette_date)
        WHERE cpd.final_compensation_amount > 0
      `;
      
      const [result] = await db.query(updateQuery);
      console.log(`✅ Updated interest for ${result.affectedRows} compensation records`);
      
      return result.affectedRows;
    } catch (error) {
      console.error('Error updating all interest calculations:', error);
      throw error;
    }
  }
  
  /**
   * Get interest calculation details for a lot
   * @param {number} planId - Plan ID
   * @param {number} lotId - Lot ID
   */
  static async getInterestDetails(planId, lotId) {
    try {
      const [records] = await db.query(`
        SELECT 
          cpd.final_compensation_amount,
          cpd.gazette_date,
          cpd.interest_to_be_paid,
          DATEDIFF(CURDATE(), cpd.gazette_date) as days_since_gazette,
          pl.plan_identifier,
          l.lot_no
        FROM compensation_payment_details cpd
        LEFT JOIN plans pl ON pl.id = cpd.plan_id
        LEFT JOIN lots l ON l.id = cpd.lot_id
        WHERE cpd.plan_id = ? AND cpd.lot_id = ?
      `, [planId, lotId]);
      
      return records[0] || null;
    } catch (error) {
      console.error('Error getting interest details:', error);
      throw error;
    }
  }
}

module.exports = InterestCalculationService;

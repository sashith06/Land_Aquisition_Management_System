const db = require("../config/db").pool.promise();

class InterestRateService {
  constructor() {
    this.defaultRate = parseFloat(process.env.DEFAULT_INTEREST_RATE) || 0.07;
    this.rateCache = new Map();
  }

  // Get interest rate from database configuration
  async getInterestRate(projectId = null, effectiveDate = null) {
    try {
      let configKey = 'default_interest_rate';
      
      // Check for project-specific rate first
      if (projectId) {
        configKey = `project_${projectId}_interest_rate`;
        
        const [projectRate] = await db.query(
          'SELECT config_value FROM system_config WHERE config_key = ?',
          [configKey]
        );
        
        if (projectRate.length > 0) {
          return parseFloat(projectRate[0].config_value);
        }
      }
      
      // Fall back to default rate
      const [defaultRate] = await db.query(
        'SELECT config_value FROM system_config WHERE config_key = ?',
        ['default_interest_rate']
      );
      
      if (defaultRate.length > 0) {
        return parseFloat(defaultRate[0].config_value);
      }
      
      // Final fallback to environment/hardcoded default
      return this.defaultRate;
      
    } catch (error) {
      console.error('Error fetching interest rate from database:', error);
      return this.defaultRate;
    }
  }

  // Calculate interest with automatic rate lookup
  async calculateInterest(compensationAmount, fromDate, toDate, projectId = null, customRate = null) {
    if (!compensationAmount || !fromDate || !toDate) return 0;
    
    // Use custom rate if provided, otherwise lookup from database
    const interestRate = customRate || await this.getInterestRate(projectId);
    
    const from = new Date(fromDate);
    const to = new Date(toDate);
    const daysDiff = Math.ceil((to - from) / (1000 * 60 * 60 * 24));
    const yearsDiff = daysDiff / 365.25;
    
    const interestAmount = compensationAmount * interestRate * yearsDiff;
    
    return {
      interest_amount: Math.round(interestAmount * 100) / 100,
      interest_rate: interestRate,
      days_calculated: daysDiff,
      years_calculated: Math.round(yearsDiff * 1000) / 1000,
      calculation_date: new Date().toISOString().split('T')[0]
    };
  }

  // Update interest rate configuration
  async updateInterestRate(configKey, newRate, description = null) {
    try {
      const sql = `
        INSERT INTO system_config (config_key, config_value, description) 
        VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE 
        config_value = VALUES(config_value),
        description = COALESCE(VALUES(description), description),
        updated_at = CURRENT_TIMESTAMP
      `;
      
      await db.query(sql, [configKey, newRate.toString(), description]);
      
      // Clear cache
      this.rateCache.clear();
      
      return { success: true, message: 'Interest rate updated successfully' };
      
    } catch (error) {
      console.error('Error updating interest rate:', error);
      return { success: false, message: 'Failed to update interest rate' };
    }
  }

  // Get all interest rate configurations
  async getAllRates() {
    try {
      const [rates] = await db.query(`
        SELECT config_key, config_value, description, updated_at 
        FROM system_config 
        WHERE config_key LIKE '%interest_rate%'
        ORDER BY config_key
      `);
      
      return rates.map(rate => ({
        key: rate.config_key,
        rate: parseFloat(rate.config_value),
        percentage: (parseFloat(rate.config_value) * 100).toFixed(2) + '%',
        description: rate.description,
        updated_at: rate.updated_at
      }));
      
    } catch (error) {
      console.error('Error fetching interest rates:', error);
      return [];
    }
  }
}

module.exports = new InterestRateService();
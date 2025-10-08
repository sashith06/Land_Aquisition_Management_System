const LandValuation = require('../models/landValuationModel');
const landValuationService = require('../services/landValuationService');
const geminiService = require('../services/geminiService');

/**
 * Get all projects available for valuation based on user role
 */
exports.getProjects = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Only CE and PE can access valuation
  if (!['CE', 'chief_engineer', 'PE', 'project_engineer'].includes(userRole)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied. Only Chief Engineer and Project Engineer can access land valuation.' 
    });
  }

  LandValuation.getProjectsByRole(userId, userRole, (err, results) => {
    if (err) {
      console.error('Error fetching projects:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching projects',
        error: err.message 
      });
    }

    res.json({
      success: true,
      projects: results
    });
  });
};

/**
 * Get project details with plans
 */
exports.getProjectDetails = (req, res) => {
  const { projectId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  // Check access
  if (!['CE', 'chief_engineer', 'PE', 'project_engineer'].includes(userRole)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }

  LandValuation.getProjectDetails(projectId, (err, projectResults) => {
    if (err) {
      console.error('Error fetching project:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching project details',
        error: err.message 
      });
    }

    if (projectResults.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Project not found' 
      });
    }

    const project = projectResults[0];

    // Get plans for the project
    LandValuation.getPlansByProject(projectId, (err, plans) => {
      if (err) {
        console.error('Error fetching plans:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching plans',
          error: err.message 
        });
      }

      res.json({
        success: true,
        project: project,
        plans: plans
      });
    });
  });
};

/**
 * Calculate land valuation for a project
 */
exports.calculateValuation = async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Check access
    if (!['CE', 'chief_engineer', 'PE', 'project_engineer'].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }

    // Get project details
    LandValuation.getProjectDetails(projectId, async (err, projectResults) => {
      if (err) {
        console.error('Error fetching project:', err);
        return res.status(500).json({ 
          success: false, 
          message: 'Error fetching project',
          error: err.message 
        });
      }

      if (projectResults.length === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Project not found' 
        });
      }

      const project = projectResults[0];

      // Check if we have a stored valuation first (unless force recalculate is requested)
      const forceRecalculate = req.query.recalculate === 'true';
      
      if (!forceRecalculate) {
        LandValuation.getStoredValuation(projectId, (err, storedResults) => {
          // storedResults is an array from MySQL query
          const stored = storedResults && storedResults.length > 0 ? storedResults[0] : null;
          
          if (!err && stored && stored.valuation_data) {
            console.log(`✅ Using stored valuation for project ${projectId} (calculated at ${stored.calculated_at})`);
            
            try {
              // MySQL JSON column type auto-parses, so it's already an object
              const valuationData = stored.valuation_data;
              
              valuationData.stored = true;
              valuationData.calculatedAt = stored.calculated_at;
              valuationData.calculatedBy = stored.calculated_by_name;
              
              return res.json({
                success: true,
                valuation: valuationData,
                message: 'Using stored valuation from ' + new Date(stored.calculated_at).toLocaleDateString()
              });
            } catch (error) {
              console.error('Error reading stored valuation:', error);
              // If reading fails, recalculate
              console.log('🔄 Recalculating due to read error');
              calculateNewValuation(projectId, project, userId, res);
            }
          } else {
            // No stored valuation, proceed with calculation
            console.log(`🆕 No stored valuation found for project ${projectId}, calculating new...`);
            calculateNewValuation(projectId, project, userId, res);
          }
        });
      } else {
        // Force recalculate requested
        console.log(`Force recalculating valuation for project ${projectId}`);
        calculateNewValuation(projectId, project, userId, res);
      }
    });

  } catch (error) {
    console.error('Error in calculateValuation:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

/**
 * Helper function to calculate new valuation
 */
async function calculateNewValuation(projectId, project, userId, res) {
  // Get plans
  LandValuation.getPlansByProject(projectId, async (err, plans) => {
    if (err) {
      console.error('Error fetching plans:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching plans',
        error: err.message 
      });
    }

    if (plans.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'No plans found for this project' 
      });
    }

    try {
      // Calculate valuation
      console.log(`Calculating NEW valuation for project ${projectId} with ${plans.length} plans`);
      const valuationResults = await landValuationService.calculateProjectValuation(plans);

      // Add project info
      valuationResults.projectId = projectId;
      valuationResults.projectName = project.name;
      valuationResults.projectStatus = project.status;
      valuationResults.stored = false;

      // Generate AI insights (optional - don't fail if it doesn't work)
      try {
        const insights = await geminiService.generateValuationInsights(
          { projectName: project.name },
          valuationResults
        );
        valuationResults.insights = insights;
      } catch (insightError) {
        console.error('Error generating AI insights:', insightError.message);
        // Provide basic summary instead of AI insights
        valuationResults.insights = `Valuation Summary:
• Total land value estimated at ${valuationResults.totalValue.toLocaleString()} LKR
• Based on ${valuationResults.plans.length} plan(s) across ${valuationResults.locations} location(s)
• Total extent: ${valuationResults.totalExtentPerches.toFixed(2)} perches
• Average price per perch: ${valuationResults.averagePricePerPerch.toLocaleString()} LKR

Note: AI-powered insights are currently unavailable. Please consult with a professional valuer for official valuations.`;
      }

      // Save results to database for future use
      LandValuation.saveValuationResults(projectId, valuationResults, userId, (err) => {
        if (err) {
          console.error('Error saving valuation results:', err);
          // Don't fail the request if saving fails
        } else {
          console.log(`Valuation saved to database for project ${projectId}`);
        }
      });

      // Prepare response message
      let message = 'Valuation calculated and saved successfully';
      if (valuationResults.warnings && valuationResults.warnings.length > 0) {
        const missingExtentWarning = valuationResults.warnings.find(w => w.type === 'missing_extent');
        if (missingExtentWarning) {
          message = `⚠️ Warning: ${missingExtentWarning.message}. Please add extent data to these plans for accurate valuation.`;
        }
      }

      res.json({
        success: true,
        valuation: valuationResults,
        message: message
      });

    } catch (valuationError) {
      console.error('Error calculating valuation:', valuationError);
      res.status(500).json({
        success: false,
        message: 'Error calculating land valuation',
        error: valuationError.message
      });
    }
  });
}

/**
 * Get valuation history for a project
 */
exports.getValuationHistory = (req, res) => {
  const { projectId } = req.params;
  const userRole = req.user.role;

  // Check access
  if (!['CE', 'chief_engineer', 'PE', 'project_engineer'].includes(userRole)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }

  LandValuation.getValuationHistory(projectId, (err, results) => {
    if (err) {
      console.error('Error fetching valuation history:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching history',
        error: err.message 
      });
    }

    res.json({
      success: true,
      history: results
    });
  });
};

/**
 * Clear valuation cache (admin only)
 */
exports.clearCache = (req, res) => {
  const userRole = req.user.role;

  // Only CE can clear cache
  if (userRole !== 'CE' && userRole !== 'chief_engineer') {
    return res.status(403).json({ 
      success: false, 
      message: 'Only Chief Engineer can clear cache' 
    });
  }

  try {
    landValuationService.clearCache();
    res.json({
      success: true,
      message: 'Valuation cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Error clearing cache',
      error: error.message
    });
  }
};

/**
 * Get valuation statistics
 */
exports.getStats = (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  // Check access
  if (!['CE', 'chief_engineer', 'PE', 'project_engineer', 'FO', 'financial_officer'].includes(userRole)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Access denied' 
    });
  }

  LandValuation.getValuationStats(userId, userRole, (err, results) => {
    if (err) {
      console.error('Error fetching stats:', err);
      return res.status(500).json({ 
        success: false, 
        message: 'Error fetching statistics',
        error: err.message 
      });
    }

    res.json({
      success: true,
      stats: results[0] || {}
    });
  });
};

const db = require('../config/db');

// Get dashboard statistics
exports.getDashboardStats = (req, res) => {
  try {
    // Query for active projects (approved projects)
    const activeProjectsQuery = `
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE status = 'approved'
    `;

    // Query for ongoing projects (in_progress projects)
    const ongoingProjectsQuery = `
      SELECT COUNT(*) as count 
      FROM projects 
      WHERE status = 'in_progress'
    `;

    // Query for approved users (status = 'approved')
    const activeUsersQuery = `
      SELECT COUNT(*) as count 
      FROM users 
      WHERE status = 'approved'
    `;

    // Execute all queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(activeProjectsQuery, (err, result) => {
          if (err) {
            console.error('Error in activeProjectsQuery:', err);
            reject(err);
          }
          else resolve(result[0]?.count || 0);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(ongoingProjectsQuery, (err, result) => {
          if (err) {
            console.error('Error in ongoingProjectsQuery:', err);
            reject(err);
          }
          else resolve(result[0]?.count || 0);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(activeUsersQuery, (err, result) => {
          if (err) {
            console.error('Error in activeUsersQuery:', err);
            reject(err);
          }
          else resolve(result[0]?.count || 0);
        });
      })
    ]).then(([activeProjects, ongoingProjects, activeUsers]) => {
      console.log('Stats fetched:', { activeProjects, ongoingProjects, activeUsers });
      res.json({
        success: true,
        activeProjects: parseInt(activeProjects) || 0,
        ongoingProjects: parseInt(ongoingProjects) || 0,
        activeUsers: parseInt(activeUsers) || 0,
        lastUpdated: new Date().toISOString()
      });
    }).catch(error => {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics',
        activeProjects: 0,
        ongoingProjects: 0,
        activeUsers: 0
      });
    });

  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      activeProjects: 0,
      ongoingProjects: 0,
      activeUsers: 0
    });
  }
};

// Get detailed statistics for admin dashboard
exports.getDetailedStats = (req, res) => {
  try {
    const usersByRoleQuery = `
      SELECT role, COUNT(*) as count 
      FROM users 
      WHERE status = 'approved' 
      GROUP BY role
    `;

    const projectsByStatusQuery = `
      SELECT status, COUNT(*) as count 
      FROM projects 
      GROUP BY status
    `;

    const recentProjectsQuery = `
      SELECT id, name, status, created_at 
      FROM projects 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    const recentUsersQuery = `
      SELECT id, username, role, created_at 
      FROM users 
      WHERE status = 'approved' 
      ORDER BY created_at DESC 
      LIMIT 5
    `;

    // Execute all queries in parallel
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(usersByRoleQuery, (err, result) => {
          if (err) {
            console.error('Error in usersByRoleQuery:', err);
            reject(err);
          }
          else resolve(result || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(projectsByStatusQuery, (err, result) => {
          if (err) {
            console.error('Error in projectsByStatusQuery:', err);
            reject(err);
          }
          else resolve(result || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(recentProjectsQuery, (err, result) => {
          if (err) {
            console.error('Error in recentProjectsQuery:', err);
            reject(err);
          }
          else resolve(result || []);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(recentUsersQuery, (err, result) => {
          if (err) {
            console.error('Error in recentUsersQuery:', err);
            reject(err);
          }
          else resolve(result || []);
        });
      })
    ]).then(([usersByRole, projectsByStatus, recentProjects, recentUsers]) => {
      console.log('Detailed stats fetched:', {
        usersByRole: usersByRole.length,
        projectsByStatus: projectsByStatus.length,
        recentProjects: recentProjects.length,
        recentUsers: recentUsers.length
      });

      res.json({
        success: true,
        data: {
          usersByRole: usersByRole.map(row => ({
            role: row.role,
            count: parseInt(row.count) || 0
          })),
          projectsByStatus: projectsByStatus.map(row => ({
            status: row.status,
            count: parseInt(row.count) || 0
          })),
          recentProjects: recentProjects.map(project => ({
            id: project.id,
            name: project.name,
            status: project.status,
            created_at: project.created_at
          })),
          recentUsers: recentUsers.map(user => ({
            id: user.id,
            username: user.username,
            role: user.role,
            created_at: user.created_at
          }))
        },
        lastUpdated: new Date().toISOString()
      });
    }).catch(error => {
      console.error('Error fetching detailed stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch detailed statistics',
        data: {
          usersByRole: [],
          projectsByStatus: [],
          recentProjects: [],
          recentUsers: []
        }
      });
    });

  } catch (error) {
    console.error('Error in getDetailedStats:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: {
        usersByRole: [],
        projectsByStatus: [],
        recentProjects: [],
        recentUsers: []
      }
    });
  }
};

// Get comprehensive dashboard analytics
exports.getDashboardAnalytics = (req, res) => {
  try {
    console.log('getDashboardAnalytics called - fetching real database data');
    
    // Execute multiple queries to get real data from your database
    Promise.all([
      // Get project statistics
      new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as total FROM projects', (err, result) => {
          if (err) reject(err);
          else resolve(result[0]?.total || 0);
        });
      }),
      
      // Get project status breakdown
      new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            status, 
            COUNT(*) as count 
          FROM projects 
          GROUP BY status
        `, (err, result) => {
          if (err) reject(err);
          else resolve(result || []);
        });
      }),
      
      // Get total users count
      new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as total FROM users', (err, result) => {
          if (err) reject(err);
          else resolve(result[0]?.total || 0);
        });
      }),
      
      // Get total landowners count
      new Promise((resolve, reject) => {
        db.query('SELECT COUNT(*) as total FROM owners', (err, result) => {
          if (err) reject(err);
          else resolve(result[0]?.total || 0);
        });
      }),
      
      // Get total compensation amount
      new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            COALESCE(SUM(compensation_amount), 0) as total_compensation,
            COUNT(*) as total_payments,
            COALESCE(AVG(compensation_amount), 0) as avg_compensation
          FROM compensations 
          WHERE status IN ('approved', 'paid')
        `, (err, result) => {
          if (err) reject(err);
          else resolve(result[0] || {total_compensation: 0, total_payments: 0, avg_compensation: 0});
        });
      }),
      
      // Get total lots count and status
      new Promise((resolve, reject) => {
        db.query(`
          SELECT 
            COUNT(*) as total_lots,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as completed_lots
          FROM lots
        `, (err, result) => {
          if (err) reject(err);
          else resolve(result[0] || {total_lots: 0, completed_lots: 0});
        });
      })
      
    ]).then(([
      totalProjects, 
      projectStatusBreakdown, 
      totalUsers, 
      totalLandowners, 
      compensationData, 
      lotsData
    ]) => {
      
      // Process project status breakdown
      const statusCounts = {
        pending: 0,
        approved: 0,
        in_progress: 0,
        completed: 0,
        on_hold: 0,
        rejected: 0
      };
      
      projectStatusBreakdown.forEach(row => {
        if (statusCounts.hasOwnProperty(row.status)) {
          statusCounts[row.status] = parseInt(row.count) || 0;
        }
      });
      
      // Calculate progress percentage
      const progressPercentage = lotsData.total_lots > 0 
        ? Math.round((lotsData.completed_lots / lotsData.total_lots) * 100) 
        : 0;

      const realStats = {
        totalProjects: parseInt(totalProjects),
        inProgress: statusCounts.in_progress,
        completed: statusCounts.completed,
        approved: statusCounts.approved,
        pending: statusCounts.pending,
        onHold: statusCounts.on_hold,
        rejected: statusCounts.rejected,
        totalUsers: parseInt(totalUsers),
        totalLandowners: parseInt(totalLandowners),
        totalCompensation: parseFloat(compensationData.total_compensation),
        avgCompensation: parseFloat(compensationData.avg_compensation),
        totalPayments: parseInt(compensationData.total_payments),
        totalLots: parseInt(lotsData.total_lots),
        completedLots: parseInt(lotsData.completed_lots),
        averageProgress: progressPercentage
      };

      // Generate real chart data based on actual database content
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      // Project Status Chart Data (using real status counts)
      const statusChartData = {
        labels: ['Pending', 'Approved', 'In Progress', 'Completed', 'On Hold', 'Rejected'],
        datasets: [{
          data: [
            statusCounts.pending,
            statusCounts.approved,
            statusCounts.in_progress,
            statusCounts.completed,
            statusCounts.on_hold,
            statusCounts.rejected
          ],
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',
            'rgba(251, 191, 36, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(107, 114, 128, 0.8)',
            'rgba(220, 38, 127, 0.8)'
          ]
        }]
      };

      // Progress Chart Data (showing lot completion progress)
      const progressChartData = {
        labels: ['Total Lots', 'Completed Lots', 'Remaining Lots'],
        datasets: [{
          label: 'Lot Progress',
          data: [
            parseInt(lotsData.total_lots),
            parseInt(lotsData.completed_lots),
            parseInt(lotsData.total_lots) - parseInt(lotsData.completed_lots)
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(239, 68, 68, 1)'
          ]
        }]
      };

      // Compensation Overview (showing payment status distribution)
      const compensationChartData = {
        labels: ['Total Compensation', 'Average per Payment'],
        datasets: [{
          type: 'bar',
          label: 'Compensation Amount (LKR)',
          data: [
            parseFloat(compensationData.total_compensation),
            parseFloat(compensationData.avg_compensation)
          ],
          backgroundColor: [
            'rgba(147, 51, 234, 0.8)',
            'rgba(236, 72, 153, 0.8)'
          ],
          borderColor: [
            'rgba(147, 51, 234, 1)',
            'rgba(236, 72, 153, 1)'
          ]
        }]
      };

      // User Role Distribution Chart (showing actual user counts by role)
      const userRoleChartData = {
        labels: ['Total Users', 'Total Landowners', 'Active Projects'],
        datasets: [{
          label: 'System Overview',
          data: [
            parseInt(totalUsers),
            parseInt(totalLandowners), 
            parseInt(totalProjects)
          ],
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(34, 197, 94, 0.8)',
            'rgba(251, 191, 36, 0.8)'
          ],
          borderColor: [
            'rgba(59, 130, 246, 1)',
            'rgba(34, 197, 94, 1)',
            'rgba(251, 191, 36, 1)'
          ]
        }]
      };

      console.log('Real dashboard analytics prepared:', {
        totalProjects: realStats.totalProjects,
        totalLandowners: realStats.totalLandowners,
        totalCompensation: realStats.totalCompensation,
        totalPayments: realStats.totalPayments
      });

      res.json({
        success: true,
        data: {
          stats: realStats,
          charts: {
            projectStatus: statusChartData,
            lotProgress: progressChartData,
            compensationOverview: compensationChartData,
            systemOverview: userRoleChartData
          }
        },
        lastUpdated: new Date().toISOString()
      });

    });

  } catch (error) {
    console.error('Error in getDashboardAnalytics:', error);
    res.status(500).json({
      success: false,
      error: 'Server error',
      data: null
    });
  }
};

// Get real-time project progress data
exports.getProjectProgressData = (req, res) => {
  try {
    // Check if location column exists
    db.query('DESCRIBE projects', (descErr, columns) => {
      const hasLocation = columns && columns.some(col => col.Field === 'location');
      
      // Check lots table structure to see what columns exist
      db.query('DESCRIBE lots', (lotsErr, lotColumns) => {
        const hasProjectId = lotColumns && lotColumns.some(col => col.Field === 'project_id');
        const hasStatus = lotColumns && lotColumns.some(col => col.Field === 'status');
        
        let progressQuery;
        // Updated query to use correct database relationships
        // Based on your schema: projects -> plans -> lots
        progressQuery = `
          SELECT 
            p.id,
            p.name,
            p.status,
            p.created_at,
            ${hasLocation ? 'p.location,' : "'N/A' as location,"}
            COALESCE(
              (SELECT 
                (COUNT(CASE WHEN l.status = 'completed' THEN 1 END) * 100.0) / 
                NULLIF(COUNT(l.id), 0)
               FROM plans pl 
               LEFT JOIN lots l ON pl.id = l.plan_id 
               WHERE pl.project_id = p.id
              ), 0
            ) as progress_percentage,
            (SELECT COUNT(pl.id) FROM plans pl WHERE pl.project_id = p.id) as total_plans,
            (SELECT COUNT(l.id) FROM plans pl LEFT JOIN lots l ON pl.id = l.plan_id WHERE pl.project_id = p.id) as total_lots
          FROM projects p
          ORDER BY p.created_at DESC
          LIMIT 20
        `;

        db.query(progressQuery, (err, results) => {
          if (err) {
            console.error('Error fetching project progress:', err);
            return res.status(500).json({
              success: false,
              error: 'Failed to fetch project progress data'
            });
          }

          const progressData = results.map(project => ({
            id: project.id,
            name: project.name,
            status: project.status,
            location: project.location,
            progress: Math.round(parseFloat(project.progress_percentage) || 0),
            total_plans: parseInt(project.total_plans) || 0,
            total_lots: parseInt(project.total_lots) || 0,
            created_at: project.created_at
          }));

          // Create chart data for project progress trend
          const chartData = {
            labels: progressData.map(p => p.name.substring(0, 15) + '...'),
            datasets: [{
              label: 'Project Progress (%)',
              data: progressData.map(p => p.progress),
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              fill: true,
              tension: 0.1
            }]
          };

          res.json({
            success: true,
            data: {
              projects: progressData,
              chartData: chartData
            },
            lastUpdated: new Date().toISOString()
          });
        });
      });
    });

  } catch (error) {
    console.error('Error in getProjectProgressData:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

// Get detailed project hierarchy with progress tracking
exports.getProjectHierarchy = (req, res) => {
  try {
    console.log('getProjectHierarchy called');
    
    // Get filters from query parameters
    const { 
      status, 
      dateFrom, 
      dateTo, 
      minProgress, 
      maxProgress,
      projectId 
    } = req.query;

    // Build dynamic WHERE clauses
    let projectFilter = '1=1';
    let params = [];
    
    if (status && status !== 'all') {
      projectFilter += ' AND p.status = ?';
      params.push(status);
    }
    
    if (dateFrom) {
      projectFilter += ' AND p.created_at >= ?';
      params.push(dateFrom);
    }
    
    if (dateTo) {
      projectFilter += ' AND p.created_at <= ?';
      params.push(dateTo + ' 23:59:59');
    }
    
    if (projectId) {
      projectFilter += ' AND p.id = ?';
      params.push(projectId);
    }

    const hierarchyQuery = `
      SELECT 
        p.id as project_id,
        p.name as project_name,
        p.status as project_status,
        p.created_at as project_created,
        p.start_date as project_start,
        p.expected_completion_date as project_expected_completion,
        p.description as project_description,
        
        pl.id as plan_id,
        pl.plan_identifier,
        pl.description as plan_description,
        pl.status as plan_status,
        pl.total_extent as plan_extent,
        pl.estimated_cost as plan_cost,
        pl.created_at as plan_created,
        
        l.id as lot_id,
        l.lot_no,
        l.extent_ha,
        l.extent_perch,
        l.land_type,
        l.status as lot_status,
        l.created_at as lot_created,
        
        -- Progress calculations
        (SELECT COUNT(*) FROM plans WHERE project_id = p.id) as total_plans,
        (SELECT COUNT(*) FROM plans pl2 WHERE pl2.project_id = p.id AND pl2.status = 'completed') as completed_plans,
        
        (SELECT COUNT(*) 
         FROM lots l2 
         JOIN plans pl2 ON l2.plan_id = pl2.id 
         WHERE pl2.project_id = p.id) as total_lots,
         
        (SELECT COUNT(*) 
         FROM lots l2 
         JOIN plans pl2 ON l2.plan_id = pl2.id 
         WHERE pl2.project_id = p.id AND l2.status = 'completed') as completed_lots,
         
        -- Compensation info
        (SELECT COUNT(*) 
         FROM compensations c 
         JOIN lots l3 ON c.lot_id = l3.id 
         JOIN plans pl3 ON l3.plan_id = pl3.id 
         WHERE pl3.project_id = p.id) as total_compensations,
         
        (SELECT COALESCE(SUM(c.compensation_amount), 0) 
         FROM compensations c 
         JOIN lots l3 ON c.lot_id = l3.id 
         JOIN plans pl3 ON l3.plan_id = pl3.id 
         WHERE pl3.project_id = p.id AND c.status IN ('approved', 'paid')) as total_compensation_amount
        
      FROM projects p
      LEFT JOIN plans pl ON p.id = pl.project_id
      LEFT JOIN lots l ON pl.id = l.plan_id
      WHERE ${projectFilter}
      ORDER BY p.created_at DESC, pl.id ASC, l.lot_no ASC
    `;

    db.query(hierarchyQuery, params, (err, results) => {
      if (err) {
        console.error('Error fetching project hierarchy:', err);
        return res.status(500).json({
          success: false,
          error: 'Failed to fetch project hierarchy data'
        });
      }

      // Process results into hierarchical structure
      const projectsMap = new Map();
      
      results.forEach(row => {
        // Initialize project if not exists
        if (!projectsMap.has(row.project_id)) {
          const totalLots = parseInt(row.total_lots) || 0;
          const completedLots = parseInt(row.completed_lots) || 0;
          const totalPlans = parseInt(row.total_plans) || 0;
          const completedPlans = parseInt(row.completed_plans) || 0;
          
          const projectProgress = totalLots > 0 ? Math.round((completedLots / totalLots) * 100) : 0;
          const planProgress = totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;
          
          projectsMap.set(row.project_id, {
            id: row.project_id,
            name: row.project_name,
            status: row.project_status,
            description: row.project_description,
            created_at: row.project_created,
            start_date: row.project_start,
            expected_completion_date: row.project_expected_completion,
            
            // Progress metrics
            total_plans: totalPlans,
            completed_plans: completedPlans,
            total_lots: totalLots,
            completed_lots: completedLots,
            project_progress: projectProgress,
            plan_progress: planProgress,
            
            // Financial metrics
            total_compensations: parseInt(row.total_compensations) || 0,
            total_compensation_amount: parseFloat(row.total_compensation_amount) || 0,
            
            plans: new Map()
          });
        }
        
        const project = projectsMap.get(row.project_id);
        
        // Initialize plan if exists and not already added
        if (row.plan_id && !project.plans.has(row.plan_id)) {
          project.plans.set(row.plan_id, {
            id: row.plan_id,
            plan_identifier: row.plan_identifier,
            description: row.plan_description,
            status: row.plan_status,
            total_extent: parseFloat(row.plan_extent) || 0,
            estimated_cost: parseFloat(row.plan_cost) || 0,
            created_at: row.plan_created,
            lots: []
          });
        }
        
        // Add lot if exists
        if (row.lot_id && row.plan_id) {
          const plan = project.plans.get(row.plan_id);
          plan.lots.push({
            id: row.lot_id,
            lot_no: row.lot_no,
            extent_ha: parseFloat(row.extent_ha) || 0,
            extent_perch: parseFloat(row.extent_perch) || 0,
            land_type: row.land_type,
            status: row.lot_status,
            created_at: row.lot_created
          });
        }
      });

      // Convert to array and clean up
      const projectsArray = Array.from(projectsMap.values()).map(project => ({
        ...project,
        plans: Array.from(project.plans.values())
      }));
      
      // Apply progress filters if provided
      let filteredProjects = projectsArray;
      if (minProgress !== undefined || maxProgress !== undefined) {
        filteredProjects = projectsArray.filter(project => {
          const progress = project.project_progress;
          const minCheck = minProgress === undefined || progress >= parseInt(minProgress);
          const maxCheck = maxProgress === undefined || progress <= parseInt(maxProgress);
          return minCheck && maxCheck;
        });
      }

      console.log(`Project hierarchy fetched: ${filteredProjects.length} projects`);
      
      // Prepare chart data for individual progress tracking
      const projectsChartData = filteredProjects.map(p => ({
        id: p.id,
        name: p.name,
        progress: p.project_progress,
        status: p.status,
        total_plans: p.total_plans,
        completed_plans: p.completed_plans,
        total_compensation: p.total_compensation_amount
      }));

      const plansChartData = [];
      const lotsChartData = [];

      filteredProjects.forEach(project => {
        project.plans.forEach(plan => {
          // Calculate plan progress based on completed lots
          const planProgress = plan.lots.length > 0 
            ? Math.round((plan.lots.filter(lot => lot.status === 'completed').length / plan.lots.length) * 100)
            : 0;

          plansChartData.push({
            id: plan.id,
            project_id: project.id,
            project_name: project.name,
            plan_identifier: plan.plan_identifier,
            progress: planProgress,
            status: plan.status,
            total_lots: plan.lots.length,
            completed_lots: plan.lots.filter(lot => lot.status === 'completed').length,
            estimated_cost: plan.estimated_cost || 0,
            total_extent: plan.total_extent || 0
          });

          // Add lots data
          plan.lots.forEach(lot => {
            const lotProgress = lot.status === 'completed' ? 100 : 
                              lot.status === 'in_progress' ? 50 : 
                              lot.status === 'approved' ? 25 : 0;
            
            lotsChartData.push({
              id: lot.id,
              plan_id: plan.id,
              project_id: project.id,
              project_name: project.name,
              plan_identifier: plan.plan_identifier,
              lot_no: lot.lot_no,
              progress: lotProgress,
              status: lot.status,
              extent_ha: lot.extent_ha || 0,
              extent_perch: lot.extent_perch || 0,
              land_type: lot.land_type
            });
          });
        });
      });
      
      res.json({
        success: true,
        data: {
          projects: filteredProjects,
          charts: {
            projects: projectsChartData,
            plans: plansChartData,
            lots: lotsChartData
          },
          summary: {
            total_projects: filteredProjects.length,
            total_plans: filteredProjects.reduce((sum, p) => sum + p.total_plans, 0),
            total_lots: filteredProjects.reduce((sum, p) => sum + p.total_lots, 0),
            total_compensation: filteredProjects.reduce((sum, p) => sum + p.total_compensation_amount, 0),
            avg_progress: filteredProjects.length > 0 
              ? Math.round(filteredProjects.reduce((sum, p) => sum + p.project_progress, 0) / filteredProjects.length)
              : 0
          }
        },
        lastUpdated: new Date().toISOString()
      });
    });

  } catch (error) {
    console.error('Error in getProjectHierarchy:', error);
    res.status(500).json({
      success: false,
      error: 'Server error'
    });
  }
};

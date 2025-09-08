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

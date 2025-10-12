import axios from 'axios';

const BACKEND_URL = 'http://localhost:5000';

export const progressService = {
  // Fetch progress for a specific lot
  async getLotProgress(planId, lotId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/progress/plan/${planId}/lot/${lotId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching lot progress:', error);
      throw error;
    }
  },

  // Fetch progress for a plan (aggregated)
  async getPlanProgress(planId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/progress/plan/${planId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching plan progress:', error);
      throw error;
    }
  },

  // Fetch progress for a project (aggregated)
  async getProjectProgress(projectId) {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${BACKEND_URL}/api/progress/project/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data.data;
    } catch (error) {
      console.error('Error fetching project progress:', error);
      throw error;
    }
  },

  // Calculate lot progress from the sections data
  calculateSectionProgress(sections) {
    const sectionWeights = {
      'Owner Details': 25,
      'Land Details': 25,
      'Valuation': 25,
      'Compensation': 25
    };

    let totalProgress = 0;
    let completedSections = 0;

    sections.forEach(section => {
      const weight = sectionWeights[section.name] || 0;
      totalProgress += section.completeness * weight;
      if (section.status === 'complete') {
        completedSections++;
      }
    });

    return {
      totalProgress: Math.round(totalProgress),
      completedSections,
      totalSections: sections.length
    };
  },

  // Get section color based on status
  getSectionColor(status) {
    switch (status) {
      case 'complete':
        return {
          bg: 'bg-green-100',
          text: 'text-green-800',
          border: 'border-green-200',
          progress: 'bg-green-500'
        };
      case 'partial':
        return {
          bg: 'bg-yellow-100',
          text: 'text-yellow-800',
          border: 'border-yellow-200',
          progress: 'bg-yellow-500'
        };
      case 'blocked':
        return {
          bg: 'bg-red-100',
          text: 'text-red-800',
          border: 'border-red-200',
          progress: 'bg-red-500'
        };
      default:
        return {
          bg: 'bg-gray-100',
          text: 'text-gray-800',
          border: 'border-gray-200',
          progress: 'bg-gray-400'
        };
    }
  },

  // Get section icon based on section name
  getSectionIcon(sectionName) {
    switch (sectionName) {
      case 'Owner Details':
        return 'User';
      case 'Land Details':
        return 'MapPin';
      case 'Valuation':
        return 'DollarSign';
      case 'Compensation':
        return 'CreditCard';
      default:
        return 'FileText';
    }
  },

  // Format progress message for display
  formatProgressMessage(progressData) {
    if (!progressData) return 'Loading progress...';
    
    const { overall_percent, status_message, last_completed_section, aggregates } = progressData;
    
    if (overall_percent === 100) {
      return 'All sections completed! 🎉';
    } else if (overall_percent === 0) {
      return 'Ready to start - Please add owner details first';
    } else if (last_completed_section) {
      // Enhanced message for compensation section
      if (aggregates && aggregates.compensation && overall_percent >= 75) {
        const comp = aggregates.compensation;
        const missing = [];
        if (comp.with_zero_balance < comp.total_records) missing.push('balance due');
        if (comp.with_interest_complete < comp.total_records) missing.push('interest payments');
        if (comp.with_division_date < comp.total_records) missing.push('account division date');
        
        if (missing.length > 0) {
          return `${overall_percent}% complete - Missing: ${missing.join(', ')}`;
        }
      }
      return `${overall_percent}% complete - ${status_message}`;
    } else {
      return `${overall_percent}% complete - ${status_message}`;
    }
  },

  // Get next action text
  getNextAction(sections) {
    for (const section of sections) {
      if (section.status === 'blocked') {
        return `Complete prerequisites first`;
      }
      if (section.status !== 'complete') {
        if (section.missing && section.missing.length > 0) {
          // Enhanced action text for compensation section
          if (section.name === 'Compensation') {
            const firstMissing = section.missing[0];
            if (firstMissing.includes('Balance due')) return 'Complete all payments';
            if (firstMissing.includes('Interest payments')) return 'Complete interest payments';
            if (firstMissing.includes('account division date')) return 'Set account division date';
            return `Add ${firstMissing}`;
          }
          return `Add ${section.missing[0]}`;
        }
        return `Complete ${section.name}`;
      }
    }
    return 'All done!';
  },

  // New helper function to get compensation completion details
  getCompensationDetails(progressData) {
    if (!progressData || !progressData.aggregates || !progressData.aggregates.compensation) {
      return null;
    }

    const comp = progressData.aggregates.compensation;
    const total = comp.total_records || 0;
    
    if (total === 0) {
      return {
        message: 'No compensation records found',
        details: []
      };
    }

    const details = [
      {
        label: 'With Compensation Amount',
        count: comp.with_amount || 0,
        total: total,
        percentage: Math.round(((comp.with_amount || 0) / total) * 100)
      },
      {
        label: 'Balance Due = 0',
        count: comp.with_zero_balance || 0,
        total: total,
        percentage: Math.round(((comp.with_zero_balance || 0) / total) * 100)
      },
      {
        label: 'Interest Complete',
        count: comp.with_interest_complete || 0,
        total: total,
        percentage: Math.round(((comp.with_interest_complete || 0) / total) * 100)
      },
      {
        label: 'Account Division Date Set',
        count: comp.with_division_date || 0,
        total: total,
        percentage: Math.round(((comp.with_division_date || 0) / total) * 100)
      }
    ];

    return {
      message: `${comp.fully_complete || 0} of ${total} owners fully complete`,
      details: details
    };
  }
};

export default progressService;
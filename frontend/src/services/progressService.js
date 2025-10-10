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
    
    const { overall_percent, status_message, last_completed_section } = progressData;
    
    if (overall_percent === 100) {
      return 'All sections completed! 🎉';
    } else if (overall_percent === 0) {
      return 'Ready to start - Please add owner details first';
    } else if (last_completed_section) {
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
          return `Add ${section.missing[0]}`;
        }
        return `Complete ${section.name}`;
      }
    }
    return 'All done!';
  }
};

export default progressService;
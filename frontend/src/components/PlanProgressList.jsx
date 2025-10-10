import { Building2, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api';

const PlanProgressList = ({ plans, onPlanSelect, selectedPlan, showProgress = true }) => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState('');
  const [userId, setUserId] = useState(null);

  // Get user role and ID from token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUserRole(payload.role);
        setUserId(payload.id);
      } catch (error) {
        console.error('Error parsing token:', error);
      }
    }
  }, []);

  const handlePlanClick = (plan, e) => {
    // Don't navigate if clicking on action buttons
    if (e.target.closest('.action-buttons')) {
      console.log('Clicked on action buttons, preventing navigation');
      return;
    }
    
    console.log('Plan clicked, navigating to lots page');
    onPlanSelect(plan);
    // Determine which dashboard context we're in
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate(`/pe-dashboard/plan/${plan.id}/lots`);
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate(`/ce-dashboard/plan/${plan.id}/lots`);
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate(`/fo-dashboard/plan/${plan.id}/lots`);
    } else {
      navigate(`/dashboard/plan/${plan.id}/lots`);
    }
  };

  const handleEditPlan = (planId, e) => {
    e.stopPropagation();
    console.log('Edit plan clicked:', planId);
    // Determine the correct dashboard route based on current location
    const currentPath = window.location.pathname;
    console.log('Current path:', currentPath);
    navigate(`/dashboard/edit-plan/${planId}`);
  };

  const handleDeletePlan = async (planId, planName, e) => {
    e.stopPropagation();
    console.log('Delete plan clicked:', planId);
    
    if (window.confirm(`Are you sure you want to delete plan "${planName}"? This action cannot be undone.`)) {
      try {
        await api.delete(`/api/plans/${planId}`);
        
        // Show success message and reload the page/plans
        alert('Plan deleted successfully!');
        window.location.reload(); // Refresh to update the plan list
      } catch (error) {
        console.error('Error deleting plan:', error);
        if (error.response?.data?.error) {
          if (error.response.status === 403) {
            alert('You do not have permission to delete this plan');
          } else {
            alert(error.response.data.error);
          }
        } else {
          alert('An error occurred while deleting the plan');
        }
      }
    }
  };

  const canEditPlan = (plan) => {
    return userRole === 'land_officer' && plan.created_by == userId; // Use == for type-flexible comparison
  };

  const handleViewDetails = (plan, e) => {
    e.stopPropagation(); // Prevent triggering the card click
    // Navigate to plan detail page based on current dashboard
    const currentPath = window.location.pathname;
    if (currentPath.includes('/pe-dashboard')) {
      navigate(`/pe-dashboard/plan/${plan.id}`);
    } else if (currentPath.includes('/ce-dashboard')) {
      navigate(`/ce-dashboard/plan/${plan.id}`);
    } else if (currentPath.includes('/fo-dashboard')) {
      navigate(`/fo-dashboard/plan/${plan.id}`);
    } else {
      navigate(`/dashboard/plan/${plan.id}`);
    }
  };

  const formatPlanDisplay = (plan) => {
    // For our actual database structure with plan_number and project_name
    const planIdentifier = plan.plan_no || plan.plan_identifier || plan.cadastral_no || `Plan-${plan.id}`;
    const displayId = plan.plan_no || plan.plan_identifier ? `Plan No - ${planIdentifier}` : planIdentifier;

    console.log(`PlanProgressList: Plan ${plan.id} raw progress:`, plan.progress);
    console.log(`PlanProgressList: Plan ${plan.id} all fields:`, {
      id: plan.id,
      plan_no: plan.plan_no,
      progress: plan.progress,
      description: plan.description
    });
    
    const progressValue = plan.progress || 0;
    console.log(`PlanProgressList: Plan ${plan.id} final progress:`, progressValue);

    return {
      id: displayId,
      name: plan.project_name || plan.description || 'No description',
      progress: progressValue
    };
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Plans & Progress</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {plans.map((plan) => {
          const displayData = formatPlanDisplay(plan);
          const canEdit = canEditPlan(plan);
          
          return (
            <div
              key={plan.id}
              onClick={(e) => handlePlanClick(plan, e)}
              className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg flex flex-col space-y-4 relative pb-16
                ${selectedPlan?.id === plan.id
                  ? 'border-orange-500 shadow-lg'
                  : 'border-gray-200 hover:border-orange-300'
                }`}
            >
              {/* Action buttons */}
              <div className="action-buttons absolute top-3 right-3 flex gap-1">
                {/* Edit button for land officers who own the plan */}
                {canEdit && (
                  <button
                    onClick={(e) => handleEditPlan(plan.id, e)}
                    className="p-1 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition-colors"
                    title="Edit Plan"
                  >
                    <Edit size={14} />
                  </button>
                )}

                {/* View Details button for all users */}
                <button
                  onClick={(e) => handleViewDetails(plan, e)}
                  className="p-1 bg-green-100 text-green-600 rounded hover:bg-green-200 transition-colors"
                  title="View Plan Details"
                >
                  <Eye size={14} />
                </button>
              </div>

              <div className="flex items-center space-x-3">
                {plan.image ? (
                  <img
                    src={plan.image}
                    alt={displayData.name}
                    className="w-12 h-12 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Building2 size={20} className="text-gray-600" />
                  </div>
                )}
                <div className="flex-1 min-w-0 pr-8"> {/* Add right padding to avoid overlap with action buttons */}
                  <p className="font-bold text-lg text-gray-800 truncate">{displayData.id}</p>
                  <p className="text-sm text-gray-500 truncate">{displayData.name}</p>
                  {plan.created_by_name && (
                    <p className="text-xs text-gray-400 mt-1">Created by: {plan.created_by_name}</p>
                  )}
                </div>
              </div>

              {/* Delete icon for land officers who own the plan */}
              {canEdit && (
                <div className="absolute bottom-3 right-3">
                  <button
                    onClick={(e) => handleDeletePlan(plan.id, displayData.id, e)}
                    className="p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors"
                    title="Delete Plan"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}

              {showProgress && (
                <div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-orange-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${displayData.progress}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 text-sm font-semibold text-gray-600">
                    {displayData.progress}% Done
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlanProgressList;

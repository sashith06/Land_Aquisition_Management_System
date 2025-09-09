import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import { FileText, Calendar, Eye } from 'lucide-react';
import PlanProgressList from '../../components/PlanProgressList';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import api from '../../api';

export default function PEProjectPlans() {
  const { projectId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const { projectName } = location.state || {};
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (projectId) {
      loadPlans();
    }
  }, [projectId]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/api/plans/project/${projectId}`);
      console.log('Plans loaded:', response.data);
      setPlans(response.data);
    } catch (error) {
      console.error('Error loading plans:', error);
      setError('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handlePlanSelect = (plan) => {
    console.log('Plan selected for viewing:', plan);
    // Navigate to lots page for this plan
    navigate(`/pe-dashboard/plan/${plan.id}/lots`, {
      state: { 
        planId: plan.id,
        planNumber: plan.plan_number || plan.id,
        projectName: projectName,
        returnToProject: projectId
      }
    });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Breadcrumb items={generateBreadcrumbs({ projectName })} />
          <h1 className="text-2xl font-bold text-gray-900">
            {projectName ? `${projectName} - Plans` : 'Project Plans'}
          </h1>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs({ projectName })} />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {projectName ? `${projectName} - Plans` : 'Project Plans'}
            </h1>
            <p className="text-gray-600 mt-1">View plans for this project</p>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
          <button 
            onClick={loadPlans}
            className="mt-2 text-red-600 hover:text-red-800 font-medium"
          >
            Try Again
          </button>
        </div>
      )}

      {plans.length === 0 && !loading && !error ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Found</h3>
          <p className="text-gray-500">
            No plans have been created for this project yet.
          </p>
        </div>
      ) : (
        <PlanProgressList
          plans={plans}
          onPlanSelect={handlePlanSelect}
          selectedPlan={selectedPlan}
          showActions={false} // PE can view but not edit plans directly
        />
      )}
    </div>
  );
}

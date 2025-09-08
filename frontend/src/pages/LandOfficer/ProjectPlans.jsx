import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { FileText, Calendar, Plus } from 'lucide-react';
import PlanProgressList from '../../components/PlanProgressList';
import Breadcrumb from '../../components/Breadcrumb';
import api from '../../api';

export default function ProjectPlans() {
  const { projectId } = useParams();
  const location = useLocation();
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
    setSelectedPlan(plan);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <Breadcrumb
            items={[
              { label: "Dashboard", to: "/lo-dashboard" },
              { label: projectName || "Project", to: `/lo-dashboard/project/${projectId}/plans` },
              { label: "Plans" },
            ]}
          />
          <h1 className="text-2xl font-bold text-gray-900">
            {projectName ? `${projectName} - Plans` : 'Project Plans'}
          </h1>
        </div>

        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading plans...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb
          items={[
            { label: "Dashboard", to: "/lo-dashboard" },
            { label: projectName || "Project", to: `/lo-dashboard/project/${projectId}/plans` },
            { label: "Plans" },
          ]}
        />
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {projectName ? `${projectName} - Plans` : 'Project Plans'}
            </h1>
            <p className="text-gray-600 mt-1">Manage plans for this project</p>
          </div>
          <Link
            to={`/lo-dashboard/create-plan/${projectId}`}
            state={{ projectName }}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create New Plan
          </Link>
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

      {plans.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Plans Yet</h3>
              <p className="text-gray-500 mb-4">Plans for this project will appear here once created.</p>
              <Link
                to={`/lo-dashboard/create-plan/${projectId}`}
                state={{ projectName }}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Plan
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <PlanProgressList
          plans={plans}
          onPlanSelect={handlePlanSelect}
          selectedPlan={selectedPlan}
          showProgress={true}
        />
      )}
    </div>
  );
}

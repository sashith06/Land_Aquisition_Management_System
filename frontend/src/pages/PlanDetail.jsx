import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { X, Eye, Building2, FileText, Calendar, User, MapPin, DollarSign } from 'lucide-react';
import Breadcrumb from "../components/Breadcrumb";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import api from "../api";

const PlanDetail = () => {
  const { id } = useParams();
  const location = useLocation();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load plan data when component mounts
  useEffect(() => {
    if (id) {
      loadPlanData();
    }
  }, [id]);

  const loadPlanData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get(`/api/plans/${id}`);
      setPlanData(response.data);
    } catch (error) {
      console.error('Error loading plan data:', error);
      setError(error.response?.data?.error || 'Failed to load plan details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `LKR ${parseFloat(amount).toLocaleString()}`;
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading plan details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!planData) {
    return (
      <div className="p-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Plan Not Found</h1>
          <p className="text-gray-600 mb-6">
            The requested plan could not be found.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb navigation */}
        <Breadcrumb items={generateBreadcrumbs()} />

        <div className="space-y-6">
          {/* Plan Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <Building2 size={24} className="text-blue-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {planData.plan_no || planData.plan_identifier || `Plan-${planData.id}`}
                </h1>
                <p className="text-lg text-gray-600">{planData.project_name}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <User size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Created by: {planData.created_by_name}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar size={16} className="text-gray-500" />
                <span className="text-sm text-gray-700">Created: {formatDate(planData.created_at)}</span>
              </div>
            </div>
          </div>

          {/* Plan Identifier Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              📄 Plan No / Cadastral No Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.project_name || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan No / Cadastral No <span className="text-red-500">*</span>
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.plan_no || planData.plan_identifier || 'N/A'}
                </div>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900 min-h-[60px]">
                {planData.description || 'No description provided'}
              </div>
            </div>
          </div>

          {/* Gazette Details */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📄 Gazette Details</h3>
            
            {/* Section 07 Gazette */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Section 07 Gazette</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section 07 Gazette No
                    </label>
                    <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {planData.section_07_gazette_no || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date (DD/MM/YY)
                    </label>
                    <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {planData.section_07_gazette_date ? formatDate(planData.section_07_gazette_date) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 38 Gazette */}
            <div className="mb-4">
              <h4 className="text-md font-medium text-gray-700 mb-3">Section 38 Gazette</h4>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Section 38 Gazette No
                    </label>
                    <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {planData.section_38_gazette_no || 'N/A'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date (DD/MM/YY)
                    </label>
                    <div className="bg-white px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                      {planData.section_38_gazette_date ? formatDate(planData.section_38_gazette_date) : 'N/A'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional Information */}
                    {/* Additional Information */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">📋 Additional Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Advance Trading No
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.advance_tracing_no || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section 5 Gazette No
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.section_5_gazette_no || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Divisional Secretary
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.divisional_secretary || 'N/A'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pending Cost Estimate
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {formatCurrency(planData.pending_cost_estimate)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Cost
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {formatCurrency(planData.estimated_cost)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estimated Extent
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {planData.estimated_extent || 'N/A'}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Extent Value
                </label>
                <div className="bg-gray-50 px-3 py-2 border border-gray-300 rounded-lg text-gray-900">
                  {formatCurrency(planData.current_extent_value)}
                </div>
              </div>
            </div>
          </div>

          {/* Statistics */}
          <div className="bg-green-50 rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              📊 Plan Statistics
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {planData.lots_count || 0}
                </div>
                <div className="text-sm text-gray-600">Total Lots</div>
              </div>

              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-teal-600">
                  {planData.active_lots || 0}
                </div>
                <div className="text-sm text-gray-600">Active Lots</div>
              </div>

              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {planData.completed_lots || 0}
                </div>
                <div className="text-sm text-gray-600">Completed Lots</div>
              </div>

              <div className="bg-white rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {planData.pending_lots || 0}
                </div>
                <div className="text-sm text-gray-600">Pending Lots</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanDetail;

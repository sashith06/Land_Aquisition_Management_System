import { useState, useEffect } from 'react';
import { DollarSign, Save } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';
import { projectsData } from '../../data/mockData';

const FinancialDetails = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const { generateBreadcrumbs } = useBreadcrumbs();
  const [project, setProject] = useState(null);
  const [financialData, setFinancialData] = useState({
    budgetAllocated: '',
    budgetUsed: '',
    pendingPayments: '',
    contractorPayments: '',
    materialCosts: '',
    laborCosts: '',
    equipmentCosts: '',
    administrativeCosts: '',
    contingencyCosts: '',
    notes: ''
  });

  useEffect(() => {
    // Find project by ID
    const allProjects = [...projectsData, ...JSON.parse(localStorage.getItem('projectsData') || '[]')];
    const foundProject = allProjects.find(p => p.id === projectId);
    setProject(foundProject);

    // Load existing financial data if available
    const savedFinancialData = JSON.parse(localStorage.getItem('financialData') || '{}');
    if (savedFinancialData[projectId]) {
      setFinancialData(savedFinancialData[projectId]);
    }
  }, [projectId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFinancialData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Save financial data to localStorage
    const existingData = JSON.parse(localStorage.getItem('financialData') || '{}');
    existingData[projectId] = {
      ...financialData,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'Financial Officer'
    };
    localStorage.setItem('financialData', JSON.stringify(existingData));
    
    alert('Financial details saved successfully!');
    navigate('/fo-dashboard');
  };

  const calculateTotalCosts = () => {
    const costs = [
      financialData.contractorPayments,
      financialData.materialCosts,
      financialData.laborCosts,
      financialData.equipmentCosts,
      financialData.administrativeCosts,
      financialData.contingencyCosts
    ];
    
    return costs.reduce((total, cost) => {
      const numValue = parseFloat(cost) || 0;
      return total + numValue;
    }, 0);
  };

  const calculateRemainingBudget = () => {
    const allocated = parseFloat(financialData.budgetAllocated) || 0;
    const used = parseFloat(financialData.budgetUsed) || 0;
    return allocated - used;
  };

  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Project not found</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={generateBreadcrumbs()} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
            Financial Details
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            Manage financial information for {project.name}
          </p>
        </div>
      </div>

      {/* Financial Form */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-slate-900">Project Financial Information</h2>
          <div className="text-center text-sm text-slate-600">
            Ministry of Highways<br />
            Road Development Authority<br />
            Financial Management
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Budget Overview Section */}
          <div className="border border-slate-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-slate-700 mb-4">Budget Overview</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Total Budget Allocated
                </label>
                <input
                  type="number"
                  name="budgetAllocated"
                  value={financialData.budgetAllocated}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., 1000000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Budget Used
                </label>
                <input
                  type="number"
                  name="budgetUsed"
                  value={financialData.budgetUsed}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., 750000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Pending Payments
                </label>
                <input
                  type="number"
                  name="pendingPayments"
                  value={financialData.pendingPayments}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  placeholder="e.g., 50000"
                  step="0.01"
                />
              </div>

              <div className="bg-slate-50 p-3 rounded-md">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Remaining Budget
                </label>
                <div className="text-lg font-semibold text-slate-800">
                  ${calculateRemainingBudget().toLocaleString()}
                </div>
              </div>
            </div>
          </div>

          {/* Cost Breakdown Section */}
          <div className="border border-blue-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-700 mb-4">Cost Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contractor Payments
                </label>
                <input
                  type="number"
                  name="contractorPayments"
                  value={financialData.contractorPayments}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 300000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Material Costs
                </label>
                <input
                  type="number"
                  name="materialCosts"
                  value={financialData.materialCosts}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 200000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Labor Costs
                </label>
                <input
                  type="number"
                  name="laborCosts"
                  value={financialData.laborCosts}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 150000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Equipment Costs
                </label>
                <input
                  type="number"
                  name="equipmentCosts"
                  value={financialData.equipmentCosts}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 80000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Administrative Costs
                </label>
                <input
                  type="number"
                  name="administrativeCosts"
                  value={financialData.administrativeCosts}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 25000"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Contingency Costs
                </label>
                <input
                  type="number"
                  name="contingencyCosts"
                  value={financialData.contingencyCosts}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., 20000"
                  step="0.01"
                />
              </div>
            </div>

            <div className="mt-4 bg-blue-50 p-3 rounded-md">
              <label className="block text-sm font-medium text-blue-700 mb-1">
                Total Calculated Costs
              </label>
              <div className="text-lg font-semibold text-blue-800">
                ${calculateTotalCosts().toLocaleString()}
              </div>
            </div>
          </div>

          {/* Notes Section */}
          <div className="border border-gray-300 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-700 mb-4">Additional Notes</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Financial Notes & Comments
              </label>
              <textarea
                name="notes"
                value={financialData.notes}
                onChange={handleInputChange}
                rows={4}
                className="w-full p-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                placeholder="Add any financial notes, comments, or special considerations..."
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-6 py-2 bg-slate-600 text-white rounded-md hover:bg-slate-700 focus:ring-2 focus:ring-slate-500 flex items-center space-x-2"
            >
              <Save size={16} />
              <span>Save Financial Details</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FinancialDetails;

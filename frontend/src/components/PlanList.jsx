import { Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlanList = ({ plans, onPlanSelect, selectedPlan }) => {
  const navigate = useNavigate();

  const handlePlanClick = (plan) => {
    onPlanSelect(plan);
    // Navigate to a detailed view of the plan
    navigate(`/plan/${plan.id}`, { state: { plan } });
  };

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Plans</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            onClick={() => handlePlanClick(plan)}
            className={`bg-white rounded-xl p-6 border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedPlan?.id === plan.id
                ? 'border-orange-500 shadow-lg'
                : 'border-gray-200 hover:border-orange-300'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <Building2 size={20} className="text-gray-600" />
              </div>
              <div>
                <p className="font-bold text-lg text-gray-800">{plan.id}</p>
                <p className="text-sm text-gray-500 truncate">{plan.name}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlanList;
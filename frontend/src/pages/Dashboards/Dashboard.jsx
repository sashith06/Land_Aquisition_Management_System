import { useState, useMemo } from 'react';
import SearchBar from '../../components/SearchBar';
import ProjectDetails from '../../components/ProjectDetails';
import ProjectOptionButtons from '../../components/ProjectOptionButtons';
import PlanProgressList from '../../components/PlanProgressList'; // ✅ correct import
import { plansData } from '../../data/mockData';

const Dashboard = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter plans based on search term
  const filteredPlans = useMemo(() => {
    return plansData.filter(plan =>
      plan.id.toString().includes(searchTerm) ||
      plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleProjectAction = (action) => {
    switch (action) {
      case 'create':
        alert('Create new plan functionality will be implemented');
        break;
      case 'edit':
        if (selectedPlan) alert(`Edit project: ${selectedPlan.name}`);
        break;
      case 'delete':
        if (selectedPlan && window.confirm(`Delete project: ${selectedPlan.name}?`)) {
          alert('Delete functionality will be implemented');
        }
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6">
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="xl:col-span-3 space-y-8">
          <PlanProgressList
            plans={filteredPlans}
            onPlanSelect={handlePlanSelect}
            selectedPlan={selectedPlan}
          />
          <ProjectOptionButtons
            onAction={handleProjectAction}
            selectedProject={selectedPlan}
          />
        </div>

        {/* Right Sidebar */}
        <div className="xl:col-span-1 space-y-6">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
          <ProjectDetails project={selectedPlan} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

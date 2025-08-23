import { useState, useMemo } from 'react';
import { plansData } from '../../data/mockData';
import PlanList from '../../components/PlanList';
import ProjectDetails from '../../components/ProjectDetails';
import SearchBar from '../../components/SearchBar';

// Header component for the dashboard
const CEDashboardHeader = () => (
  <div className="mb-6 sm:mb-8">
    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
      Chief Engineer Dashboard
    </h1>
    <p className="text-sm sm:text-base text-slate-600">
      Overview and management of all land acquisition projects
    </p>
  </div>
);

// Main content grid component - VIEW ONLY
const MainContent = ({ filteredPlans, selectedPlan, onPlanSelect }) => (
  <div className="space-y-6 sm:space-y-8">
    <PlanList
      plans={filteredPlans}
      onPlanSelect={onPlanSelect}
      selectedPlan={selectedPlan}
    />
    
    {/* Project Summary Stats */}
    <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">Project Overview</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{filteredPlans.length}</div>
          <div className="text-sm text-slate-600">Total Projects</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {filteredPlans.filter(p => p.progress >= 75).length}
          </div>
          <div className="text-sm text-slate-600">Near Completion</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">
            {filteredPlans.filter(p => p.progress >= 25 && p.progress < 75).length}
          </div>
          <div className="text-sm text-slate-600">In Progress</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">
            {filteredPlans.filter(p => p.progress < 25).length}
          </div>
          <div className="text-sm text-slate-600">Early Stage</div>
        </div>
      </div>
    </div>
  </div>
);

// Sidebar component
const CEDashboardSidebar = ({ searchTerm, onSearchChange, selectedPlan }) => (
  <div className="space-y-6">
    <SearchBar
      searchTerm={searchTerm}
      onSearchChange={onSearchChange}
    />
    
    <ProjectDetails project={selectedPlan} />
  </div>
);

const CEDashboardMain = () => {
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Memoized filtered plans for better performance
  const filteredPlans = useMemo(() => {
    if (!searchTerm.trim()) return plansData;
    
    const term = searchTerm.toLowerCase();
    return plansData.filter(plan =>
      plan.id.toLowerCase().includes(term) ||
      plan.name.toLowerCase().includes(term) ||
      plan.estimatedCost.toLowerCase().includes(term)
    );
  }, [searchTerm]);

  const handlePlanSelect = (plan) => {
    console.log('Plan selected for viewing:', plan);
    setSelectedPlan(plan);
  };

  return (
    <div className="space-y-6">
      <CEDashboardHeader />
      {/* Dashboard Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 sm:gap-8">
        {/* Main Content Area */}
        <div className="xl:col-span-3 order-2 xl:order-1">
          <MainContent
            filteredPlans={filteredPlans}
            selectedPlan={selectedPlan}
            onPlanSelect={handlePlanSelect}
          />
        </div>
        {/* Right Sidebar */}
        <div className="xl:col-span-1 order-1 xl:order-2">
          <CEDashboardSidebar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            selectedPlan={selectedPlan}
          />
        </div>
      </div>
    </div>
  );
};

export default CEDashboardMain;

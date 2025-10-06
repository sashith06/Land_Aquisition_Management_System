import React from 'react';
import ProjectBasedPrediction from '../components/ProjectBasedPrediction';
import Breadcrumb from '../components/Breadcrumb';
import { useBreadcrumbs } from '../hooks/useBreadcrumbs';

const CostPredictionPage = ({ userRole }) => {
  const { generateBreadcrumbs } = useBreadcrumbs();

  const breadcrumbItems = generateBreadcrumbs([
    { label: 'Dashboard', path: userRole === 'chief_engineer' ? '/ce-dashboard' : '/pe-dashboard' },
    { label: 'AI Cost Prediction', path: '/cost-prediction' }
  ]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-6">
      <div className="max-w-7xl mx-auto">
        <Breadcrumb items={breadcrumbItems} />
        <ProjectBasedPrediction userRole={userRole} />
      </div>
    </div>
  );
};

export default CostPredictionPage;
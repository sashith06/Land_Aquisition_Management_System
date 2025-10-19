import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Eye, Edit } from 'lucide-react';
import Breadcrumb from '../../components/Breadcrumb';
import { useBreadcrumbs } from '../../hooks/useBreadcrumbs';

export default function AssignedProjects() {
  const { generateBreadcrumbs } = useBreadcrumbs();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Breadcrumb items={generateBreadcrumbs()} />
      </div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Assigned Projects</h1>
        <p className="text-gray-600 mt-1">Projects assigned to you by project engineers</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Assigned Projects</h3>
            <p className="text-gray-500 mb-4">Projects assigned to you will appear here.</p>
            <Link 
              to="/dashboard" 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Eye className="w-4 h-4 mr-2" />
              Go to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

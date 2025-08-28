import React from 'react';
import { Link } from 'react-router-dom';
import { User, Settings, Plus, DollarSign } from 'lucide-react';

const DashboardSelector = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Land Acquisition Management System
          </h1>
          <p className="text-gray-600">
            Select your dashboard to continue
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chief Engineer Dashboard */}
          <Link
            to="/ce-dashboard"
            className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <Settings size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Chief Engineer</h3>
              <p className="text-blue-100 text-sm">
                Manage users, review project requests, and oversee all operations
              </p>
              <div className="mt-4 text-sm opacity-75">
                • User Management
                <br />
                • Project Requests
                <br />
                • System Administration
              </div>
            </div>
          </Link>

          {/* Project Engineer Dashboard */}
          <Link
            to="/pe-dashboard"
            className="group bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <Plus size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Project Engineer</h3>
              <p className="text-green-100 text-sm">
                Create and manage land acquisition projects
              </p>
              <div className="mt-4 text-sm opacity-75">
                • Create Projects
                <br />
                • Manage Proposals
                <br />
                • Track Progress
              </div>
            </div>
          </Link>

          {/* Financial Officer Dashboard */}
          <Link
            to="/fo-dashboard"
            className="group bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <DollarSign size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Officer</h3>
              <p className="text-emerald-100 text-sm">
                Manage financial details and budget tracking
              </p>
              <div className="mt-4 text-sm opacity-75">
                • Financial Details
                <br />
                • Budget Management
                <br />
                • Cost Tracking
              </div>
            </div>
          </Link>

          {/* Regular User Dashboard */}
          <Link
            to="/dashboard"
            className="group bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl p-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-colors">
                <User size={32} />
              </div>
              <h3 className="text-xl font-semibold mb-2">Land Officer</h3>
              <p className="text-orange-100 text-sm">
                View and track land acquisition plans
              </p>
              <div className="mt-4 text-sm opacity-75">
                • View Projects
                <br />
                • Track Progress
                <br />
                • Generate Reports
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-gray-500 hover:text-gray-700 text-sm"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSelector;

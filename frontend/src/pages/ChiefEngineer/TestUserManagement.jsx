import React from 'react';

const TestUserManagement = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">
        User Management Test Page
      </h1>
      <p className="text-gray-600">
        This is a test page to verify that the routing to User Management is working correctly.
      </p>
      <div className="mt-4 p-4 bg-green-100 border border-green-400 rounded">
        <p className="text-green-700">
          ✅ If you can see this page, the routing is working correctly!
        </p>
      </div>
    </div>
  );
};

export default TestUserManagement;

import React, { useState, useEffect } from 'react';

const DebugWorkflow = () => {
  const [pendingProjects, setPendingProjects] = useState([]);
  const [approvedProjects, setApprovedProjects] = useState([]);

  useEffect(() => {
    const pending = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    const approved = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
    setPendingProjects(pending);
    setApprovedProjects(approved);
  }, []);

  const addTestProject = () => {
    const testProject = {
      id: `pp${Date.now()}`,
      projectName: 'Debug Test Project',
      estimatedCost: '$100 Mn',
      extentHa: '50',
      extentPerch: '100',
      createdBy: 'PE001',
      createdDate: '2025.08.27',
      status: 'pending'
    };
    
    const existing = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    existing.push(testProject);
    localStorage.setItem('pendingProjects', JSON.stringify(existing));
    setPendingProjects(existing);
    alert('Test project added to pending!');
  };

  const approveProject = (projectId) => {
    const pending = JSON.parse(localStorage.getItem('pendingProjects') || '[]');
    const project = pending.find(p => p.id === projectId);
    
    if (project) {
      // Add to approved
      const approved = JSON.parse(localStorage.getItem('approvedProjects') || '[]');
      const approvedProject = {
        ...project,
        id: `p${Date.now()}`,
        status: 'approved',
        approvedBy: 'CE001',
        approvedDate: '2025.08.27'
      };
      approved.push(approvedProject);
      localStorage.setItem('approvedProjects', JSON.stringify(approved));
      
      // Remove from pending
      const updatedPending = pending.filter(p => p.id !== projectId);
      localStorage.setItem('pendingProjects', JSON.stringify(updatedPending));
      
      setPendingProjects(updatedPending);
      setApprovedProjects(approved);
      alert('Project approved!');
    }
  };

  const clearAll = () => {
    localStorage.removeItem('pendingProjects');
    localStorage.removeItem('approvedProjects');
    setPendingProjects([]);
    setApprovedProjects([]);
    alert('All data cleared!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Workflow Debug Tool</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={addTestProject}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Add Test Project (PE)
        </button>
        <button 
          onClick={clearAll}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 ml-2"
        >
          Clear All Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Pending Projects ({pendingProjects.length})</h2>
          {pendingProjects.length === 0 ? (
            <p className="text-gray-500">No pending projects</p>
          ) : (
            pendingProjects.map(project => (
              <div key={project.id} className="border p-3 mb-2 rounded">
                <h3 className="font-semibold">{project.projectName}</h3>
                <p className="text-sm text-gray-600">ID: {project.id}</p>
                <p className="text-sm text-gray-600">Cost: {project.estimatedCost}</p>
                <button 
                  onClick={() => approveProject(project.id)}
                  className="mt-2 px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600"
                >
                  Approve (CE)
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border p-4 rounded">
          <h2 className="text-lg font-semibold mb-3">Approved Projects ({approvedProjects.length})</h2>
          {approvedProjects.length === 0 ? (
            <p className="text-gray-500">No approved projects</p>
          ) : (
            approvedProjects.map(project => (
              <div key={project.id} className="border p-3 mb-2 rounded bg-green-50">
                <h3 className="font-semibold">{project.projectName}</h3>
                <p className="text-sm text-gray-600">ID: {project.id}</p>
                <p className="text-sm text-gray-600">Cost: {project.estimatedCost}</p>
                <p className="text-sm text-green-600">Status: {project.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mt-6 p-4 bg-gray-100 rounded">
        <h3 className="font-semibold mb-2">Navigation Test Links:</h3>
        <div className="space-x-2">
          <a href="/pe-dashboard" className="text-blue-500 hover:underline">PE Dashboard</a>
          <a href="/dashboard" className="text-blue-500 hover:underline">Main Dashboard</a>
          <a href="/ce-dashboard" className="text-blue-500 hover:underline">CE Dashboard</a>
          <a href="/ce-dashboard/project-requests" className="text-blue-500 hover:underline">Project Requests</a>
        </div>
      </div>
    </div>
  );
};

export default DebugWorkflow;

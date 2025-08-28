// src/data/mockData.js

// src/data/mockData.js

export const projectsData = [
  {
    id: 'p1',
    name: 'Colombo Expansion Project',
    description: 'Urban land development in Colombo district',
    createdDate: '2024.12.01',
    progress: 63, // Average of plans: (74 + 52) / 2 = 63
  },
  {
    id: 'p2',
    name: 'Kandy Expressway Project',
    description: 'Highway land acquisition for expressway',
    createdDate: '2025.01.10',
    progress: 18, // Average of plans: (36 + 0) / 2 = 18
  },
  {
    id: 'p3',
    name: 'Northern Province Development',
    description: 'Large-scale agricultural land allocation',
    createdDate: '2025.02.20',
    progress: 18, // Average of plans: (36 + 0) / 2 = 18
  }
];

export const plansData = [
  {
    id: '8890',
    projectId: 'p1', // belongs to Colombo project ✅
    estimatedCost: '$105 Mn',
    estimatedExtent: '104.2 ha',
    projectDate: '2025.01.01',
    progress: 74,
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8894',
    projectId: 'p1',
    estimatedCost: '$89 Mn',
    estimatedExtent: '87.5 ha',
    projectDate: '2025.02.15',
    progress: 52,
    image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8893',
    projectId: 'p2', // belongs to Kandy expressway
    estimatedCost: '$124 Mn',
    estimatedExtent: '156.8 ha',
    projectDate: '2025.03.10',
    progress: 36,
    image: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8891',
    projectId: 'p2',
    estimatedCost: '$78 Mn',
    estimatedExtent: '92.3 ha',
    projectDate: '2025.04.20',
    progress: 0,
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8895',
    projectId: 'p3',
    estimatedCost: '$198 Mn',
    estimatedExtent: '245.1 ha',
    projectDate: '2025.05.05',
    progress: 36,
    image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8896',
    projectId: 'p3',
    estimatedCost: '$156 Mn',
    estimatedExtent: '178.9 ha',
    projectDate: '2025.06.30',
    progress: 0,
    image: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];
// Mock lots data for now - this should come from your actual data source
export const lotsData = [
  { id: "L001", owner: "John Doe", status: "active" },
  { id: "L002", owner: "Jane Smith", status: "pending" },
  { id: "L003", owner: "Bob Johnson", status: "completed" },
  { id: "L004", owner: "Alice Brown", status: "active" },
  { id: "L005", owner: "Charlie Wilson", status: "pending" },
  { id: "L006", owner: "Diana Davis", status: "active" },
  { id: "L007", owner: "Eva Martinez", status: "completed" },
  { id: "L008", owner: "Frank Anderson", status: "active" },
];


export const userData = {
  name: 'Umesh Sandeepa',
  role: 'Land Officer',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  notifications: 2
};

// Sample created projects data for Project Engineer
export const sampleCreatedProjects = [
  {
    projectName: 'Walgama - Diyagama Project',
    estimatedCost: '$105 Mn',
    extentHa: '104.2',
    extentPerch: '256',
    acquisitionType: 'regulation',
    createdDate: '2025-08-20'
  },
  {
    projectName: 'Kottawa - Thalagala Project', 
    estimatedCost: '$89 Mn',
    extentHa: '87.5',
    extentPerch: '215',
    acquisitionType: 'larc',
    createdDate: '2025-08-21'
  },
  {
    projectName: 'Kotte - Bope Project',
    estimatedCost: '$124 Mn', 
    extentHa: '156.8',
    extentPerch: '385',
    acquisitionType: 'special',
    createdDate: '2025-08-22'
  }
];

export const navigationItems = [
  { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
  
  { path: '/dashboard/analysis', label: 'Analysis', icon: 'BarChart3' },
  { path: '/dashboard/messages', label: 'Messages', icon: 'MessageSquare', badge: 3 },
  { path: '/dashboard/reports', label: 'Reports', icon: 'FileText' }
];

export const bottomItems = [
  { path: '/dashboard/settings', label: 'Settings', icon: 'Settings' },
  { path: '/dashboard/info', label: 'Info', icon: 'Info' }
];

// src/data/mockData.js





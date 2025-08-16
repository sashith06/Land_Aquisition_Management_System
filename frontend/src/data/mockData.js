// src/data/mockData.js

export const plansData = [
  {
    id: '8890',
    
    estimatedCost: '$105 Mn',
    estimatedExtent: '104.2 ha',
    projectDate: '2025.01.01',
    progress: 74,
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8894',
    
    estimatedCost: '$89 Mn',
    estimatedExtent: '87.5 ha',
    projectDate: '2025.02.15',
    progress: 52,
    image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8893',
    
    estimatedCost: '$124 Mn',
    estimatedExtent: '156.8 ha',
    projectDate: '2025.03.10',
    progress: 36,
    image: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8891',
    
    estimatedCost: '$78 Mn',
    estimatedExtent: '92.3 ha',
    projectDate: '2025.04.20',
    progress: 0,
    image: 'https://images.pexels.com/photos/2219024/pexels-photo-2219024.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8895',
    
    estimatedCost: '$198 Mn',
    estimatedExtent: '245.1 ha',
    projectDate: '2025.05.05',
    progress: 36,
    image: 'https://images.pexels.com/photos/1202723/pexels-photo-1202723.jpeg?auto=compress&cs=tinysrgb&w=400'
  },
  {
    id: '8896',
    
    estimatedCost: '$156 Mn',
    estimatedExtent: '178.9 ha',
    projectDate: '2025.06.30',
    progress: 0,
    image: 'https://images.pexels.com/photos/1906658/pexels-photo-1906658.jpeg?auto=compress&cs=tinysrgb&w=400'
  }
];

export const userData = {
  name: 'Umesh Sandeepa',
  role: 'Land Officer',
  avatar: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=150',
  notifications: 2
};

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




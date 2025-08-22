import { User, Bell, Shield, Palette, Globe } from 'lucide-react';

const Settings = () => {
  const settingsCategories = [
    {
      title: 'Profile Settings',
      icon: User,
      items: [
        { label: 'Personal Information', description: 'Update your name, email, and contact details' },
        { label: 'Profile Picture', description: 'Change your profile picture' },
        { label: 'Password', description: 'Change your account password' }
      ]
    },
    {
      title: 'Notifications',
      icon: Bell,
      items: [
        { label: 'Email Notifications', description: 'Receive updates via email' },
        { label: 'Push Notifications', description: 'Browser and mobile notifications' },
        { label: 'Project Alerts', description: 'Get notified about project changes' }
      ]
    },
    {
      title: 'Security',
      icon: Shield,
      items: [
        { label: 'Two-Factor Authentication', description: 'Add an extra layer of security' },
        { label: 'Login History', description: 'View your recent login activity' },
        { label: 'Active Sessions', description: 'Manage your active sessions' }
      ]
    },
    {
      title: 'Preferences',
      icon: Palette,
      items: [
        { label: 'Theme', description: 'Choose your preferred theme' },
        { label: 'Language', description: 'Select your language preference' },
        { label: 'Dashboard Layout', description: 'Customize your dashboard layout' }
      ]
    }
  ];

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8">Settings</h1>
        
        <div className="space-y-6">
          {settingsCategories.map((category) => {
            const IconComponent = category.icon;
            return (
              <div key={category.title} className="bg-white rounded-xl border border-gray-200">
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <IconComponent className="text-orange-600" size={20} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800">{category.title}</h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.items.map((item) => (
                    <div key={item.label} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-gray-800">{item.label}</h3>
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        </div>
                        <button className="px-4 py-2 text-sm text-orange-600 hover:text-orange-700 font-medium">
                          Configure
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Settings;
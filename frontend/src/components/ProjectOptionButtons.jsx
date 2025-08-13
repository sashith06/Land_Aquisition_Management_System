import { Plus, Edit, Trash2 } from 'lucide-react';

const ProjectOptionButtons = ({ onAction, selectedProject }) => {
  const buttons = [
    {
      id: 'create',
      label: 'Create new Plans',
      icon: Plus,
      variant: 'primary',
      onClick: () => onAction('create')
    },
    {
      id: 'edit',
      label: 'Edit Project Details',
      icon: Edit,
      variant: 'primary',
      onClick: () => onAction('edit'),
      disabled: !selectedProject
    },
    {
      id: 'delete1',
      label: 'Delete',
      icon: Trash2,
      variant: 'secondary',
      onClick: () => onAction('delete'),
      disabled: !selectedProject
    },
    {
      id: 'delete2',
      label: 'Delete',
      icon: Trash2,
      variant: 'secondary',
      onClick: () => onAction('delete'),
      disabled: !selectedProject
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Plan Option</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {buttons.map((button) => {
          const IconComponent = button.icon;
          return (
            <button
              key={button.id}
              onClick={button.onClick}
              disabled={button.disabled}
              className={`flex items-center justify-center space-x-2 px-6 py-4 rounded-full font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${
                button.variant === 'primary'
                  ? 'bg-orange-500 text-white hover:bg-orange-600 shadow-lg hover:shadow-xl'
                  : 'bg-orange-400 text-white hover:bg-orange-500 shadow-md hover:shadow-lg'
              }`}
            >
              <IconComponent size={18} />
              <span>{button.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectOptionButtons;
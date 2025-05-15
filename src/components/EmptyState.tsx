import { DivideIcon as LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  color?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  color = 'primary',
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
      <Icon className={`h-12 w-12 mx-auto mb-4 text-${color}`} />
      <h3 className="text-xl font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{description}</p>
      <button
        onClick={onAction}
        className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-${color} hover:bg-${color}/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}/50 transition-all`}
      >
        {actionLabel}
      </button>
    </div>
  );
};

export default EmptyState;
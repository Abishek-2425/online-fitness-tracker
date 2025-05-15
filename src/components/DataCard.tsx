import { DivideIcon as LucideIcon } from 'lucide-react';

interface DataCardProps {
  title: string;
  icon: LucideIcon;
  color?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
}

const DataCard: React.FC<DataCardProps> = ({
  title,
  icon: Icon,
  color = 'primary',
  children,
  actions,
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 border-${color} hover:shadow-md transition-shadow`}>
      <div className="p-4">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <div className="flex items-center">
              <Icon className={`mr-2 h-5 w-5 text-${color}`} />
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            </div>
            {children}
          </div>
          {actions && (
            <div className="flex space-x-2 ml-4">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataCard;
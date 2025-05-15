import { DivideIcon as LucideIcon } from 'lucide-react';
import Tooltip from './Tooltip';

interface ActionButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  color?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  color = 'primary',
}) => {
  return (
    <Tooltip content={label}>
      <button
        onClick={onClick}
        className={`p-1 rounded-full text-gray-400 hover:text-${color} hover:bg-gray-100 transition-colors`}
      >
        <Icon className="h-5 w-5" />
      </button>
    </Tooltip>
  );
};

export default ActionButton;
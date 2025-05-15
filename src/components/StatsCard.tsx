import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  color: 'workout' | 'weight' | 'water' | 'sleep';
  linkTo: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, linkTo }) => {
  const colorMap = {
    workout: {
      bg: 'bg-orange-50',
      text: 'text-workout',
      hover: 'hover:bg-orange-100',
    },
    weight: {
      bg: 'bg-purple-50',
      text: 'text-weight',
      hover: 'hover:bg-purple-100',
    },
    water: {
      bg: 'bg-blue-50',
      text: 'text-water',
      hover: 'hover:bg-blue-100',
    },
    sleep: {
      bg: 'bg-purple-50',
      text: 'text-sleep',
      hover: 'hover:bg-purple-100',
    },
  };

  return (
    <Link to={linkTo}>
      <div className={`${colorMap[color].bg} rounded-lg shadow-sm p-4 transition-all ${colorMap[color].hover} group`}>
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-md ${colorMap[color].text} bg-white shadow-sm`}>
            {icon}
          </div>
          <ArrowRight className={`${colorMap[color].text} h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity`} />
        </div>
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-xl font-semibold mt-1 ${colorMap[color].text}`}>{value}</p>
        </div>
      </div>
    </Link>
  );
};

export default StatsCard;
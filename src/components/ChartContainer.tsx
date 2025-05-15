import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ChartContainerProps {
  title: string;
  icon: React.ReactNode;
  chartData: ChartData<'line' | 'bar'>;
  type: 'line' | 'bar';
  emptyMessage: string;
}

const ChartContainer: React.FC<ChartContainerProps> = ({
  title,
  icon,
  chartData,
  type,
  emptyMessage
}) => {
  const hasData = chartData.labels && chartData.labels.length > 0;

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 animate-fade-in">
      <div className="flex items-center mb-4">
        <div className="mr-2">{icon}</div>
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      </div>
      
      {hasData ? (
        <div className="h-64">
          {type === 'line' ? (
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        let label = context.dataset.label || '';
                        if (label) {
                          label += ': ';
                        }
                        if (context.parsed.y !== null) {
                          label += context.parsed.y;
                        }
                        return label;
                      }
                    }
                  }
                },
                elements: {
                  line: {
                    tension: 0.4
                  }
                },
              }}
            />
          ) : (
            <Bar
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          )}
        </div>
      ) : (
        <div className="h-64 flex items-center justify-center text-gray-500 bg-gray-50 rounded-lg">
          {emptyMessage}
        </div>
      )}
    </div>
  );
};

export default ChartContainer;
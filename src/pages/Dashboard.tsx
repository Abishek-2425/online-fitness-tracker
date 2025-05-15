import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import StatsCard from '../components/StatsCard';
import ChartContainer from '../components/ChartContainer';
import { Activity, Weight, Droplets, Moon, Plus } from 'lucide-react';
import { Database } from '../types/supabase';
import Loading from '../components/Loading';
import toast from 'react-hot-toast';

type Workout = Database['public']['Tables']['workouts']['Row'];
type BodyWeight = Database['public']['Tables']['body_weight']['Row'];
type WaterIntake = Database['public']['Tables']['water_intake']['Row'];
type SleepTracker = Database['public']['Tables']['sleep_tracker']['Row'];

const Dashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    latestWeight: 0,
    lastSleep: 0,
    todayWater: 0,
    workoutToday: false,
  });
  
  const [chartData, setChartData] = useState({
    weights: { labels: [], data: [] } as { labels: string[], data: number[] },
    water: { labels: [], data: [] } as { labels: string[], data: number[] },
    sleep: { labels: [], data: [] } as { labels: string[], data: number[] },
    workouts: { labels: [], data: [] } as { labels: string[], data: number[] },
  });

  const today = format(new Date(), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Get latest weight
        const { data: weightData, error: weightError } = await supabase
          .from('body_weight')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
          
        if (weightError) throw weightError;
        
        // Last night's sleep
        const { data: sleepData, error: sleepError } = await supabase
          .from('sleep_tracker')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
          
        if (sleepError) throw sleepError;
        
        // Today's water intake
        const { data: waterData, error: waterError } = await supabase
          .from('water_intake')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(10);
          
        if (waterError) throw waterError;
        
        // Check if workout logged today
        const { data: workoutData, error: workoutError } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .limit(1);
          
        if (workoutError) throw workoutError;
        
        // Weekly workout frequency (last 7 days)
        const { data: workoutFrequency, error: workoutFreqError } = await supabase
          .from('workouts')
          .select('date, id')
          .eq('user_id', user.id)
          .gte('date', format(new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'))
          .order('date', { ascending: true });
          
        if (workoutFreqError) throw workoutFreqError;
        
        // Process the data
        setStats({
          latestWeight: weightData?.[0]?.weight || 0,
          lastSleep: sleepData?.[0]?.duration_hr || 0,
          todayWater: waterData?.filter(w => w.date === today).reduce((sum, w) => sum + w.amount_ml, 0) || 0,
          workoutToday: workoutData && workoutData.length > 0,
        });
        
        // Prepare chart data
        setChartData({
          weights: prepareChartData(weightData as BodyWeight[], 'date', 'weight'),
          water: prepareChartData(waterData as WaterIntake[], 'date', 'amount_ml'),
          sleep: prepareChartData(sleepData as SleepTracker[], 'date', 'duration_hr'),
          workouts: prepareWorkoutFrequencyData(workoutFrequency as Workout[]),
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [user, today]);
  
  const prepareChartData = (data: any[], labelKey: string, valueKey: string) => {
    if (!data || data.length === 0) {
      return { labels: [], data: [] };
    }
    
    // Sort by date
    const sortedData = [...data].sort((a, b) => new Date(a[labelKey]).getTime() - new Date(b[labelKey]).getTime());
    
    // Format dates and extract values
    const labels = sortedData.map(item => format(new Date(item[labelKey]), 'MMM dd'));
    const values = sortedData.map(item => item[valueKey]);
    
    return { labels, data: values };
  };
  
  const prepareWorkoutFrequencyData = (workouts: Workout[]) => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - i);
      return format(date, 'yyyy-MM-dd');
    }).reverse();
    
    // Count workouts per day
    const counts = last7Days.map(date => {
      return workouts.filter(w => w.date === date).length;
    });
    
    return {
      labels: last7Days.map(date => format(new Date(date), 'MMM dd')),
      data: counts,
    };
  };
  
  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome to your fitness dashboard</h1>
        <p className="text-gray-600">Today is {format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>
      
      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatsCard 
          title="Latest Weight" 
          value={stats.latestWeight > 0 ? `${stats.latestWeight} kg` : 'Not recorded'} 
          icon={<Weight className="h-6 w-6" />}
          color="weight"
          linkTo="/weight"
        />
        <StatsCard 
          title="Last Sleep" 
          value={stats.lastSleep > 0 ? `${stats.lastSleep} hrs` : 'Not recorded'} 
          icon={<Moon className="h-6 w-6" />}
          color="sleep"
          linkTo="/sleep"
        />
        <StatsCard 
          title="Today's Water" 
          value={stats.todayWater > 0 ? `${stats.todayWater / 1000} L` : 'Not recorded'} 
          icon={<Droplets className="h-6 w-6" />}
          color="water"
          linkTo="/water"
        />
        <StatsCard 
          title="Workout Today" 
          value={stats.workoutToday ? 'Completed' : 'Not yet'} 
          icon={<Activity className="h-6 w-6" />}
          color="workout"
          linkTo="/workouts"
        />
      </div>
      
      {/* Quick action buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link to="/workouts" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-workout hover:bg-workout/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-workout/50 transition-colors">
          <Plus className="mr-1 h-4 w-4" />
          Add Workout
        </Link>
        <Link to="/weight" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-weight hover:bg-weight/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-weight/50 transition-colors">
          <Plus className="mr-1 h-4 w-4" />
          Log Weight
        </Link>
        <Link to="/water" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water/50 transition-colors">
          <Plus className="mr-1 h-4 w-4" />
          Log Water
        </Link>
        <Link to="/sleep" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sleep hover:bg-sleep/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sleep/50 transition-colors">
          <Plus className="mr-1 h-4 w-4" />
          Log Sleep
        </Link>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartContainer 
          title="Weight History" 
          icon={<Weight className="h-5 w-5 text-weight" />}
          chartData={{
            labels: chartData.weights.labels,
            datasets: [{
              label: 'Weight (kg)',
              data: chartData.weights.data,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderColor: 'rgba(139, 92, 246, 1)',
              borderWidth: 2,
              tension: 0.4,
            }]
          }}
          type="line"
          emptyMessage="No weight data recorded yet."
        />
        
        <ChartContainer 
          title="Water Intake" 
          icon={<Droplets className="h-5 w-5 text-water" />}
          chartData={{
            labels: chartData.water.labels,
            datasets: [{
              label: 'Water (L)',
              data: chartData.water.data.map(ml => ml / 1000),
              backgroundColor: 'rgba(14, 165, 233, 0.2)',
              borderColor: 'rgba(14, 165, 233, 1)',
              borderWidth: 2,
              tension: 0.4,
            }]
          }}
          type="line"
          emptyMessage="No water intake recorded yet."
        />
        
        <ChartContainer 
          title="Sleep Duration" 
          icon={<Moon className="h-5 w-5 text-sleep" />}
          chartData={{
            labels: chartData.sleep.labels,
            datasets: [{
              label: 'Hours',
              data: chartData.sleep.data,
              backgroundColor: 'rgba(139, 92, 246, 0.2)',
              borderColor: 'rgba(139, 92, 246, 1)',
              borderWidth: 2,
              tension: 0.4,
            }]
          }}
          type="line"
          emptyMessage="No sleep data recorded yet."
        />
        
        <ChartContainer 
          title="Workout Frequency" 
          icon={<Activity className="h-5 w-5 text-workout" />}
          chartData={{
            labels: chartData.workouts.labels,
            datasets: [{
              label: 'Workouts',
              data: chartData.workouts.data,
              backgroundColor: 'rgba(249, 115, 22, 0.2)',
              borderColor: 'rgba(249, 115, 22, 1)',
              borderWidth: 2,
              barThickness: 20,
            }]
          }}
          type="bar"
          emptyMessage="No workout data recorded yet."
        />
      </div>
    </div>
  );
};

export default Dashboard;
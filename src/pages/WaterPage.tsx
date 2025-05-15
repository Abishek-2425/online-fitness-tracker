import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Droplets, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { Database } from '../types/supabase';
import { Bar } from 'react-chartjs-2';

type WaterIntake = Database['public']['Tables']['water_intake']['Row'];
type WaterIntakeInsert = Database['public']['Tables']['water_intake']['Insert'];

const WaterPage = () => {
  const { user } = useAuth();
  const [waterIntakes, setWaterIntakes] = useState<WaterIntake[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWaterIntake, setCurrentWaterIntake] = useState<WaterIntakeInsert>({
    user_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    amount_ml: 0,
  });

  // Common water amounts
  const quickAmounts = [250, 500, 750, 1000];

  useEffect(() => {
    fetchWaterIntakes();
  }, [user]);

  const fetchWaterIntakes = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('water_intake')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setWaterIntakes(data || []);
    } catch (error) {
      console.error('Error fetching water intakes:', error);
      toast.error('Failed to load water intake data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (waterIntake?: WaterIntake) => {
    if (waterIntake) {
      setCurrentWaterIntake(waterIntake);
      setIsEditing(true);
    } else {
      setCurrentWaterIntake({
        user_id: user!.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        amount_ml: 250,  // Default to 250ml
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      let result;
      
      if (isEditing) {
        const { id, ...waterData } = currentWaterIntake as WaterIntake;
        result = await supabase
          .from('water_intake')
          .update(waterData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('water_intake')
          .insert([currentWaterIntake]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditing ? 'Water intake updated successfully' : 'Water intake added successfully');
      setIsModalOpen(false);
      fetchWaterIntakes();
    } catch (error) {
      console.error('Error saving water intake:', error);
      toast.error('Failed to save water intake data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this water intake record?')) return;
    
    try {
      const { error } = await supabase
        .from('water_intake')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Water intake deleted successfully');
      fetchWaterIntakes();
    } catch (error) {
      console.error('Error deleting water intake:', error);
      toast.error('Failed to delete water intake');
    }
  };

  // Prepare chart data by aggregating by date
  const prepareChartData = () => {
    const dateMap = new Map();
    
    waterIntakes.forEach(intake => {
      const date = intake.date;
      const existingAmount = dateMap.get(date) || 0;
      dateMap.set(date, existingAmount + intake.amount_ml);
    });
    
    // Sort by date (ascending)
    const sortedDates = Array.from(dateMap.keys()).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
    
    // Get the 7 most recent dates
    const recentDates = sortedDates.slice(-7);
    
    return {
      labels: recentDates.map(date => format(new Date(date), 'MMM d')),
      datasets: [
        {
          label: 'Water Intake (L)',
          data: recentDates.map(date => dateMap.get(date) / 1000), // Convert to liters
          backgroundColor: 'rgba(14, 165, 233, 0.6)',
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 1,
          barThickness: 30,
        },
      ],
    };
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Droplets className="mr-2 h-6 w-6 text-water" />
            Water Intake Tracker
          </h1>
          <p className="text-gray-600">Track your daily hydration</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water/50 transition-all"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Water
        </button>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-lg font-semibold mb-3">Quick Add</h3>
        <div className="flex flex-wrap gap-2">
          {quickAmounts.map(amount => (
            <button
              key={amount}
              onClick={() => {
                setCurrentWaterIntake({
                  user_id: user!.id,
                  date: format(new Date(), 'yyyy-MM-dd'),
                  amount_ml: amount,
                });
                setIsEditing(false);
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water/50 transition-all"
            >
              <Droplets className="h-4 w-4 mr-1" />
              {amount} ml
            </button>
          ))}
        </div>
      </div>

      {/* Water Chart */}
      {waterIntakes.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Water Intake (Last 7 Days)</h3>
          <div className="h-64">
            <Bar
              data={prepareChartData()}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: true,
                    title: {
                      display: true,
                      text: 'Liters (L)',
                    },
                  },
                },
                plugins: {
                  legend: {
                    display: false,
                  },
                },
              }}
            />
          </div>
        </div>
      ) : null}

      {waterIntakes.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Droplets className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No water intake records yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your hydration by adding your first water intake.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-water hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water/50 transition-all"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Water Intake
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {waterIntakes.map((intake) => (
                  <tr key={intake.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(intake.date), 'MMMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intake.amount_ml} ml ({(intake.amount_ml / 1000).toFixed(2)} L)
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(intake)}
                          className="text-water hover:text-water/80 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(intake.id)}
                          className="text-error hover:text-error/80 transition-colors"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Water Intake Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center">
                      <Droplets className="mr-2 h-5 w-5 text-water" />
                      {isEditing ? 'Edit Water Intake' : 'Add Water Intake'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-water focus:border-water transition-colors"
                        value={currentWaterIntake.date}
                        onChange={(e) => setCurrentWaterIntake({ ...currentWaterIntake, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="amount_ml" className="block text-sm font-medium text-gray-700">Amount (ml)</label>
                      <input
                        type="number"
                        id="amount_ml"
                        min="0"
                        step="50"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-water focus:border-water transition-colors"
                        value={currentWaterIntake.amount_ml}
                        onChange={(e) => setCurrentWaterIntake({ ...currentWaterIntake, amount_ml: parseInt(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quickAmounts.map(amount => (
                        <button
                          key={amount}
                          type="button"
                          onClick={() => setCurrentWaterIntake({ ...currentWaterIntake, amount_ml: amount })}
                          className={`px-3 py-1 text-sm rounded-md ${
                            currentWaterIntake.amount_ml === amount
                              ? 'bg-water text-white'
                              : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                          } transition-colors`}
                        >
                          {amount} ml
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-water text-base font-medium text-white hover:bg-water/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-water sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  >
                    {isEditing ? 'Update' : 'Save'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WaterPage;
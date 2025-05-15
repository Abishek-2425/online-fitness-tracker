import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Weight, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { Database } from '../types/supabase';
import { Line } from 'react-chartjs-2';

type BodyWeight = Database['public']['Tables']['body_weight']['Row'];
type BodyWeightInsert = Database['public']['Tables']['body_weight']['Insert'];

const WeightPage = () => {
  const { user } = useAuth();
  const [weights, setWeights] = useState<BodyWeight[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<BodyWeightInsert>({
    user_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    weight: 0,
  });

  useEffect(() => {
    fetchWeights();
  }, [user]);

  const fetchWeights = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('body_weight')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setWeights(data || []);
    } catch (error) {
      console.error('Error fetching weights:', error);
      toast.error('Failed to load weight data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (weight?: BodyWeight) => {
    if (weight) {
      setCurrentWeight(weight);
      setIsEditing(true);
    } else {
      setCurrentWeight({
        user_id: user!.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        weight: 0,
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
        const { id, ...weightData } = currentWeight as BodyWeight;
        result = await supabase
          .from('body_weight')
          .update(weightData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('body_weight')
          .insert([currentWeight]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditing ? 'Weight updated successfully' : 'Weight added successfully');
      setIsModalOpen(false);
      fetchWeights();
    } catch (error) {
      console.error('Error saving weight:', error);
      toast.error('Failed to save weight data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this weight record?')) return;
    
    try {
      const { error } = await supabase
        .from('body_weight')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Weight record deleted successfully');
      fetchWeights();
    } catch (error) {
      console.error('Error deleting weight record:', error);
      toast.error('Failed to delete weight record');
    }
  };

  const chartData = {
    labels: weights.map(w => format(new Date(w.date), 'MMM d')),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weights.map(w => w.weight),
        fill: false,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        tension: 0.4,
      },
    ],
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Weight className="mr-2 h-6 w-6 text-weight" />
            Weight Tracker
          </h1>
          <p className="text-gray-600">Track your body weight changes over time</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-weight hover:bg-weight/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-weight/50 transition-all"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Weight
        </button>
      </div>

      {/* Weight Chart */}
      {weights.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Weight Progress</h3>
          <div className="h-64">
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
                },
              }}
            />
          </div>
        </div>
      ) : null}

      {weights.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Weight className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No weight records yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your weight changes by adding your first record.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-weight hover:bg-weight/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-weight/50 transition-all"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Weight Record
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
                    Weight (kg)
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {weights.map((weight) => (
                  <tr key={weight.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {format(new Date(weight.date), 'MMMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {weight.weight} kg
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleOpenModal(weight)}
                          className="text-weight hover:text-weight/80 transition-colors"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(weight.id)}
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

      {/* Weight Form Modal */}
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
                      <Weight className="mr-2 h-5 w-5 text-weight" />
                      {isEditing ? 'Edit Weight' : 'Add Weight'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-weight focus:border-weight transition-colors"
                        value={currentWeight.date}
                        onChange={(e) => setCurrentWeight({ ...currentWeight, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                      <input
                        type="number"
                        id="weight"
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-weight focus:border-weight transition-colors"
                        value={currentWeight.weight}
                        onChange={(e) => setCurrentWeight({ ...currentWeight, weight: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-weight text-base font-medium text-white hover:bg-weight/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-weight sm:ml-3 sm:w-auto sm:text-sm transition-colors"
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

export default WeightPage;
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Moon, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { Database } from '../types/supabase';
import { Line } from 'react-chartjs-2';

type SleepEntry = Database['public']['Tables']['sleep_tracker']['Row'];
type SleepEntryInsert = Database['public']['Tables']['sleep_tracker']['Insert'];

const SleepPage = () => {
  const { user } = useAuth();
  const [sleepEntries, setSleepEntries] = useState<SleepEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSleepEntry, setCurrentSleepEntry] = useState<SleepEntryInsert>({
    user_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    duration_hr: 0,
    notes: '',
  });

  useEffect(() => {
    fetchSleepEntries();
  }, [user]);

  const fetchSleepEntries = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('sleep_tracker')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setSleepEntries(data || []);
    } catch (error) {
      console.error('Error fetching sleep entries:', error);
      toast.error('Failed to load sleep data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (sleepEntry?: SleepEntry) => {
    if (sleepEntry) {
      setCurrentSleepEntry(sleepEntry);
      setIsEditing(true);
    } else {
      setCurrentSleepEntry({
        user_id: user!.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        duration_hr: 8,
        notes: '',
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
        const { id, ...sleepData } = currentSleepEntry as SleepEntry;
        result = await supabase
          .from('sleep_tracker')
          .update(sleepData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('sleep_tracker')
          .insert([currentSleepEntry]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditing ? 'Sleep entry updated successfully' : 'Sleep entry added successfully');
      setIsModalOpen(false);
      fetchSleepEntries();
    } catch (error) {
      console.error('Error saving sleep entry:', error);
      toast.error('Failed to save sleep data');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this sleep record?')) return;
    
    try {
      const { error } = await supabase
        .from('sleep_tracker')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Sleep record deleted successfully');
      fetchSleepEntries();
    } catch (error) {
      console.error('Error deleting sleep record:', error);
      toast.error('Failed to delete sleep record');
    }
  };

  const chartData = {
    labels: sleepEntries.map(entry => format(new Date(entry.date), 'MMM d')),
    datasets: [
      {
        label: 'Sleep Duration (hours)',
        data: sleepEntries.map(entry => entry.duration_hr),
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
            <Moon className="mr-2 h-6 w-6 text-sleep" />
            Sleep Tracker
          </h1>
          <p className="text-gray-600">Track your sleep duration and quality</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sleep hover:bg-sleep/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sleep/50 transition-all"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Sleep
        </button>
      </div>

      {/* Sleep Chart */}
      {sleepEntries.length > 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <h3 className="text-lg font-semibold mb-4">Sleep Duration Trend</h3>
          <div className="h-64">
            <Line
              data={chartData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                  y: {
                    beginAtZero: false,
                    suggestedMin: 4,
                    suggestedMax: 12,
                    title: {
                      display: true,
                      text: 'Hours',
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

      {sleepEntries.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Moon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No sleep records yet</h3>
          <p className="text-gray-500 mb-4">Start tracking your sleep patterns by adding your first sleep record.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-sleep hover:bg-sleep/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sleep/50 transition-all"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Your First Sleep Record
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {sleepEntries.slice().reverse().map((entry) => (
            <div key={entry.id} className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {format(new Date(entry.date), 'MMMM d, yyyy')}
                    </h3>
                    <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
                      entry.duration_hr < 6 ? 'bg-error/10 text-error' :
                      entry.duration_hr < 7 ? 'bg-warning/10 text-warning' :
                      'bg-success/10 text-success'
                    }`}>
                      {entry.duration_hr} hours
                    </span>
                  </div>
                  {entry.notes && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">{entry.notes}</p>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleOpenModal(entry)}
                    className="p-1 rounded-full text-gray-400 hover:text-sleep hover:bg-gray-100 transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 rounded-full text-gray-400 hover:text-error hover:bg-gray-100 transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sleep Form Modal */}
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
                      <Moon className="mr-2 h-5 w-5 text-sleep" />
                      {isEditing ? 'Edit Sleep Entry' : 'Add Sleep Entry'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                      <input
                        type="date"
                        id="date"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sleep focus:border-sleep transition-colors"
                        value={currentSleepEntry.date}
                        onChange={(e) => setCurrentSleepEntry({ ...currentSleepEntry, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="duration_hr" className="block text-sm font-medium text-gray-700">Sleep Duration (hours)</label>
                      <input
                        type="number"
                        id="duration_hr"
                        min="0"
                        step="0.25"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sleep focus:border-sleep transition-colors"
                        value={currentSleepEntry.duration_hr}
                        onChange={(e) => setCurrentSleepEntry({ ...currentSleepEntry, duration_hr: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-sleep focus:border-sleep transition-colors"
                        value={currentSleepEntry.notes || ''}
                        onChange={(e) => setCurrentSleepEntry({ ...currentSleepEntry, notes: e.target.value })}
                        placeholder="How did you sleep? Any disturbances?"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-sleep text-base font-medium text-white hover:bg-sleep/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sleep sm:ml-3 sm:w-auto sm:text-sm transition-colors"
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

export default SleepPage;
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Target, Edit, Trash2, Plus, Check, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import { Database } from '../types/supabase';

type Goal = Database['public']['Tables']['goals']['Row'];
type GoalInsert = Database['public']['Tables']['goals']['Insert'];

const GoalsPage = () => {
  const { user } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentGoal, setCurrentGoal] = useState<GoalInsert>({
    user_id: '',
    title: '',
    target_type: 'weight',
    target_value: 0,
    deadline: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 30 days from now
    notes: '',
  });

  const targetTypes = [
    { value: 'weight', label: 'Weight (kg)' },
    { value: 'workout', label: 'Workouts per week' },
    { value: 'water', label: 'Daily water intake (L)' },
    { value: 'sleep', label: 'Sleep duration (hrs)' },
  ];

  useEffect(() => {
    fetchGoals();
  }, [user]);

  const fetchGoals = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('goals')
        .select('*')
        .eq('user_id', user.id)
        .order('deadline', { ascending: true });

      if (error) throw error;
      setGoals(data || []);
    } catch (error) {
      console.error('Error fetching goals:', error);
      toast.error('Failed to load goals data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (goal?: Goal) => {
    if (goal) {
      setCurrentGoal(goal);
      setIsEditing(true);
    } else {
      setCurrentGoal({
        user_id: user!.id,
        title: '',
        target_type: 'weight',
        target_value: 0,
        deadline: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
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
        const { id, ...goalData } = currentGoal as Goal;
        result = await supabase
          .from('goals')
          .update(goalData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('goals')
          .insert([currentGoal]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditing ? 'Goal updated successfully' : 'Goal added successfully');
      setIsModalOpen(false);
      fetchGoals();
    } catch (error) {
      console.error('Error saving goal:', error);
      toast.error('Failed to save goal');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      const { error } = await supabase
        .from('goals')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Goal deleted successfully');
      fetchGoals();
    } catch (error) {
      console.error('Error deleting goal:', error);
      toast.error('Failed to delete goal');
    }
  };

  // Check if a goal's deadline has passed
  const isGoalExpired = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    return deadlineDate < today;
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Target className="mr-2 h-6 w-6 text-primary-600" />
            Fitness Goals
          </h1>
          <p className="text-gray-600">Set and track your fitness goals</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </button>
      </div>

      {goals.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium text-gray-900 mb-2">No goals set yet</h3>
          <p className="text-gray-500 mb-4">Start by setting your first fitness goal to track your progress.</p>
          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all"
          >
            <Plus className="h-4 w-4 mr-1" />
            Set Your First Goal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map((goal) => {
            const expired = isGoalExpired(goal.deadline);
            return (
              <div 
                key={goal.id} 
                className={`bg-white rounded-lg shadow-sm overflow-hidden border-l-4 ${
                  expired ? 'border-error' : 'border-primary-500'
                } hover:shadow-md transition-shadow`}
              >
                <div className="p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{goal.title}</h3>
                      <div className="mt-2 space-y-2">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-24">Target:</span>
                          <span className="text-sm text-gray-700">
                            {goal.target_value} {goal.target_type === 'weight' ? 'kg' : 
                                              goal.target_type === 'water' ? 'L' : 
                                              goal.target_type === 'sleep' ? 'hrs' : 
                                              'per week'}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-24">Type:</span>
                          <span className="text-sm text-gray-700">
                            {targetTypes.find(t => t.value === goal.target_type)?.label || goal.target_type}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-500 w-24">Deadline:</span>
                          <span className={`text-sm ${expired ? 'text-error' : 'text-gray-700'}`}>
                            {format(new Date(goal.deadline), 'MMMM d, yyyy')}
                            {expired && ' (Expired)'}
                          </span>
                        </div>
                        {goal.notes && (
                          <div>
                            <span className="text-sm font-medium text-gray-500">Notes:</span>
                            <p className="text-sm text-gray-700 mt-1">{goal.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleOpenModal(goal)}
                        className="p-1 rounded-full text-gray-400 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-1 rounded-full text-gray-400 hover:text-error hover:bg-gray-100 transition-colors"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Goal Form Modal */}
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
                      <Target className="mr-2 h-5 w-5 text-primary-600" />
                      {isEditing ? 'Edit Goal' : 'Add New Goal'}
                    </h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="title" className="block text-sm font-medium text-gray-700">Goal Title</label>
                      <input
                        type="text"
                        id="title"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={currentGoal.title}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, title: e.target.value })}
                        placeholder="e.g., Lose weight, Run a marathon"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="target_type" className="block text-sm font-medium text-gray-700">Goal Type</label>
                      <select
                        id="target_type"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={currentGoal.target_type}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, target_type: e.target.value })}
                        required
                      >
                        {targetTypes.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="target_value" className="block text-sm font-medium text-gray-700">Target Value</label>
                      <input
                        type="number"
                        id="target_value"
                        min="0"
                        step="0.1"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={currentGoal.target_value}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, target_value: parseFloat(e.target.value) })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                      <input
                        type="date"
                        id="deadline"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={currentGoal.deadline}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, deadline: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
                      <textarea
                        id="notes"
                        rows={3}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                        value={currentGoal.notes || ''}
                        onChange={(e) => setCurrentGoal({ ...currentGoal, notes: e.target.value })}
                        placeholder="Additional details about your goal"
                      />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
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

export default GoalsPage;
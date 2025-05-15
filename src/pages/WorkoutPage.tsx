import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Activity, Edit, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import DataCard from '../components/DataCard';
import ActionButton from '../components/ActionButton';
import { Database } from '../types/supabase';

type Workout = Database['public']['Tables']['workouts']['Row'];
type WorkoutInsert = Database['public']['Tables']['workouts']['Insert'];

const WorkoutPage = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentWorkout, setCurrentWorkout] = useState<WorkoutInsert>({
    user_id: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    exercise_name: '',
    sets: 0,
    reps: 0,
    weight: 0,
    duration: 0,
    notes: '',
  });

  useEffect(() => {
    fetchWorkouts();
  }, [user]);

  const fetchWorkouts = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setWorkouts(data || []);
    } catch (error) {
      console.error('Error fetching workouts:', error);
      toast.error('Failed to load workout data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (workout?: Workout) => {
    if (workout) {
      setCurrentWorkout(workout);
      setIsEditing(true);
    } else {
      setCurrentWorkout({
        user_id: user!.id,
        date: format(new Date(), 'yyyy-MM-dd'),
        exercise_name: '',
        sets: 0,
        reps: 0,
        weight: 0,
        duration: 0,
        notes: '',
      });
      setIsEditing(false);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      let result;
      
      if (isEditing) {
        const { id, ...workoutData } = currentWorkout as Workout;
        result = await supabase
          .from('workouts')
          .update(workoutData)
          .eq('id', id);
      } else {
        result = await supabase
          .from('workouts')
          .insert([currentWorkout]);
      }
      
      if (result.error) throw result.error;
      
      toast.success(isEditing ? 'Workout updated successfully' : 'Workout added successfully');
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout data');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this workout?')) return;
    
    try {
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast.success('Workout deleted successfully');
      fetchWorkouts();
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 flex items-center">
            <Activity className="mr-2 h-6 w-6 text-workout" />
            Workout Tracker
          </h1>
          <p className="text-gray-600">Track and manage your exercise activity</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-workout hover:bg-workout/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-workout/50 transition-all"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No workouts yet"
          description="Start tracking your fitness journey by adding your first workout."
          actionLabel="Add Your First Workout"
          onAction={() => handleOpenModal()}
          color="workout"
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {workouts.map((workout) => (
            <DataCard
              key={workout.id}
              title={workout.exercise_name}
              icon={Activity}
              color="workout"
              actions={
                <>
                  <ActionButton
                    icon={Edit}
                    label="Edit workout"
                    onClick={() => handleOpenModal(workout)}
                    color="workout"
                  />
                  <ActionButton
                    icon={Trash2}
                    label="Delete workout"
                    onClick={() => handleDelete(workout.id)}
                    color="error"
                  />
                </>
              }
            >
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs rounded-full bg-orange-100 text-orange-800">
                  {format(new Date(workout.date), 'MMMM d, yyyy')}
                </span>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-24">Sets:</span>
                    <span className="text-sm text-gray-700">{workout.sets}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-24">Reps:</span>
                    <span className="text-sm text-gray-700">{workout.reps}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-24">Weight:</span>
                    <span className="text-sm text-gray-700">{workout.weight} kg</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-500 w-24">Duration:</span>
                    <span className="text-sm text-gray-700">{workout.duration} min</span>
                  </div>
                  {workout.notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-500">Notes:</span>
                      <p className="text-sm text-gray-700 mt-1">{workout.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </DataCard>
          ))}
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={isEditing ? 'Edit Workout' : 'Add Workout'}
        icon={Activity}
        color="workout"
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              id="date"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
              value={currentWorkout.date}
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, date: e.target.value })}
              required
            />
          </div>
          <div>
            <label htmlFor="exercise_name" className="block text-sm font-medium text-gray-700">Exercise Name</label>
            <input
              type="text"
              id="exercise_name"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
              value={currentWorkout.exercise_name}
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, exercise_name: e.target.value })}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="sets" className="block text-sm font-medium text-gray-700">Sets</label>
              <input
                type="number"
                id="sets"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
                value={currentWorkout.sets}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, sets: parseInt(e.target.value) })}
                required
              />
            </div>
            <div>
              <label htmlFor="reps" className="block text-sm font-medium text-gray-700">Reps</label>
              <input
                type="number"
                id="reps"
                min="0"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
                value={currentWorkout.reps}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, reps: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="weight" className="block text-sm font-medium text-gray-700">Weight (kg)</label>
              <input
                type="number"
                id="weight"
                min="0"
                step="0.1"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
                value={currentWorkout.weight}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, weight: parseFloat(e.target.value) })}
                required
              />
            </div>
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700">Duration (min)</label>
              <input
                type="number"
                id="duration"
                min="0"
                step="0.5"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
                value={currentWorkout.duration}
                onChange={(e) => setCurrentWorkout({ ...currentWorkout, duration: parseFloat(e.target.value) })}
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-workout focus:border-workout transition-colors"
              value={currentWorkout.notes || ''}
              onChange={(e) => setCurrentWorkout({ ...currentWorkout, notes: e.target.value })}
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkoutPage;
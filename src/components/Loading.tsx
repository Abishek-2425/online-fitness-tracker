import { ActivitySquare } from 'lucide-react';

const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <ActivitySquare className="w-16 h-16 mx-auto mb-4 text-primary-500 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-700">Loading...</h2>
        <p className="text-gray-500">Please wait while we prepare your fitness data</p>
      </div>
    </div>
  );
};

export default Loading;
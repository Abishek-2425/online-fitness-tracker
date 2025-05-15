import { ReactNode } from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon: LucideIcon;
  children: ReactNode;
  color?: string;
  isSubmitting?: boolean;
  onSubmit?: (e: React.FormEvent) => void;
}

const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  icon: Icon,
  children,
  color = 'primary',
  isSubmitting = false,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const Content = () => (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <Icon className={`mr-2 h-5 w-5 text-${color}`} />
          {title}
        </h3>
      </div>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={onClose}></div>
        </div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full animate-slide-up">
          {onSubmit ? (
            <form onSubmit={onSubmit}>
              <Content />
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-${color} text-base font-medium text-white hover:bg-${color}/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color} sm:ml-3 sm:w-auto sm:text-sm transition-colors disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm transition-colors"
                  onClick={onClose}
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <Content />
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:w-auto sm:text-sm transition-colors"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
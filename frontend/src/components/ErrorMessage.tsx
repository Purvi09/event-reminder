import React from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message, 
  onRetry 
}) => {
  return (
    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-4" role="alert">
      <strong className="font-bold mr-1">{title}:</strong>
      <span className="block sm:inline">{message}</span>
      {onRetry && (
        <div className="mt-2">
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
};

export default ErrorMessage; 
import React from 'react';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  fullPage?: boolean;
  message?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'md', 
  fullPage = false,
  message = 'Loading...' 
}) => {
  const spinnerSize = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  }[size];

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50">
        <div className="text-center">
          <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-blue-500 mx-auto`}></div>
          {message && <p className="mt-4 text-gray-600">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className={`animate-spin rounded-full ${spinnerSize} border-t-2 border-b-2 border-blue-500 mx-auto`}></div>
        {message && <p className="mt-2 text-gray-600 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default LoadingSpinner; 
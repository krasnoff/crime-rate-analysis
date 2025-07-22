import React from "react";

const PleaseWaitComponent: React.FC = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="flex items-center space-x-3">
        {/* Spinner */}
        <div className="w-6 h-6 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        {/* Text */}
        <span className="text-lg font-medium text-gray-700">Please wait...</span>
      </div>
    </div>
  );
};

export default PleaseWaitComponent;

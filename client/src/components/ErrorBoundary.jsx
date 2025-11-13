import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">Oops!</h1>
        <p className="text-xl text-gray-600 mb-4">Sorry, an unexpected error has occurred.</p>
        <p className="text-gray-500 mb-8">
          <i>{error?.statusText || error?.message || "Unknown error"}</i>
        </p>
        <Link 
          to="/" 
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorBoundary;




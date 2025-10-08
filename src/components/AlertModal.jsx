import React from 'react';

const AlertModal = ({ message, visible }) => {
  if (!visible) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transition-opacity duration-300 opacity-100">
      {message}
    </div>
  );
};

export default AlertModal;

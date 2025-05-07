import React, { useState, useEffect } from 'react';

function Notification({ message, type = 'success', duration = 3000, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  if (!visible) return null;

  const backgroundColor = 
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500';

  return (
    <div className={`fixed top-5 right-5 ${backgroundColor} text-white py-2 px-4 rounded shadow-lg z-50 flex items-center`}>
      <span>{message}</span>
      <button 
        className="ml-3 text-white hover:text-gray-200" 
        onClick={() => {
          setVisible(false);
          if (onClose) onClose();
        }}
      >
        ✕
      </button>
    </div>
  );
}

export default Notification;
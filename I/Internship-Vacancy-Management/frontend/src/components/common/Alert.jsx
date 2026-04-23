import React from 'react';
import { FiAlertCircle, FiCheckCircle, FiInfo, FiXCircle } from 'react-icons/fi';

const Alert = ({ type, message, onClose }) => {
  const types = {
    success: {
      icon: FiCheckCircle,
      bgColor: 'bg-green-50',
      textColor: 'text-green-800',
      borderColor: 'border-green-400',
    },
    error: {
      icon: FiXCircle,
      bgColor: 'bg-red-50',
      textColor: 'text-red-800',
      borderColor: 'border-red-400',
    },
    warning: {
      icon: FiAlertCircle,
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-800',
      borderColor: 'border-yellow-400',
    },
    info: {
      icon: FiInfo,
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-800',
      borderColor: 'border-blue-400',
    },
  };

  const { icon: Icon, bgColor, textColor, borderColor } = types[type] || types.info;

  return (
    <div className={`${bgColor} border-l-4 ${borderColor} p-4 mb-4 rounded-md`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Icon className={`h-5 w-5 ${textColor} mr-2`} />
          <p className={`text-sm ${textColor}`}>{message}</p>
        </div>
        {onClose && (
          <button onClick={onClose} className={`${textColor} hover:opacity-75`}>
            <FiXCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default Alert;
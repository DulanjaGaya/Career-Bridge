import React from 'react';
import { FiInbox, FiPlus } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const EmptyState = ({ title, message, actionText, actionLink, icon: Icon = FiInbox }) => {
  return (
    <div className="text-center py-12 animate-fade-in">
      <Icon className="h-16 w-16 text-slate-500 mx-auto mb-4" />
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-md mx-auto">{message}</p>
      {actionText && actionLink && (
        <Link
          to={actionLink}
          className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
        >
          <FiPlus className="mr-2" />
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
import React from 'react';
const ClientStatusBadge = ({ status }) => {
  const styles = {
    Active: 'bg-green-100 text-green-700 ring-1 ring-inset ring-green-200',
    Upcoming: 'bg-blue-100 text-blue-700 ring-1 ring-inset ring-blue-200',
    Overdue: 'bg-red-100 text-red-700 ring-1 ring-inset ring-red-200',
    Inactive: 'bg-gray-100 text-gray-600 ring-1 ring-inset ring-gray-200',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>{status}</span>
  );
};
export default ClientStatusBadge;

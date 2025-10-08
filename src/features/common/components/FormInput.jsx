import React from 'react';

const FormInput = ({ 
  label, 
  name, 
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  error,
  className = '',
  ...props 
}) => {
  const requiredMark = required ? <span className="text-red-500">*</span> : null;
  
  return (
    <div className="flex flex-col">
      {label && (
        <label className="block text-sm font-medium mb-1" htmlFor={name}>
          {label} {requiredMark}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${
          error ? 'border-red-500' : ''
        } ${className}`}
        {...props}
      />
      {error && <span className="text-red-500 text-sm mt-1">{error}</span>}
    </div>
  );
};

export default FormInput;
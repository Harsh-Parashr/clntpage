import React from 'react';

const BasicInfoSection = ({ formData, handleChange, passwordMatch, requiredFields = [] }) => {
  const requiredMark = <span className="text-red-500">*</span>;
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">Basic Information</h2>
      <div className="grid md:grid-cols-2 gap-6 text-left">
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="fullName">
            Full Name {requiredFields.includes('fullName') && requiredMark}
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="email">
            Email Address {requiredFields.includes('email') && requiredMark}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="phone">
            Phone Number {requiredFields.includes('phone') && requiredMark}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="password">
            Password {requiredFields.includes('password') && requiredMark}
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" htmlFor="confirmPassword">
            Confirm Password {requiredFields.includes('confirmPassword') && requiredMark}
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {passwordMatch.message && (
            <div className={`text-xs mt-1 ${passwordMatch.isMatching ? 'text-green-600' : 'text-red-600'}`}>{passwordMatch.message}</div>
          )}
        </div>
      </div>
    </section>
  );
};

export default BasicInfoSection;

import React from 'react';

const SessionDetailsSection = ({ formData, handleChange, handleAddRate }) => (
  <section className="mb-8">
  <h2 className="text-xl font-semibold text-gray-800 mb-4 text-left">Session Details</h2>
    <div className="grid md:grid-cols-2 gap-6 items-center mb-6">
      <label className="flex flex-col">
        <span className="text-sm font-medium mb-1 text-left text-gray-500">Session Charges</span>
        <div className="flex items-center space-x-2">
          <span className="text-xl">₹</span>
          <input
            type="number"
            name="sessionCharges"
            value={formData.sessionCharges}
            onChange={handleChange}
            placeholder="950"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-500">per session</span>
        </div>
        <button
          type="button"
          onClick={handleAddRate}
          className="mt-4 px-6 py-2 bg-green-50 text-green-600 rounded-lg font-medium text-left transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200 w-fit"
        >
          Add Rate
        </button>
      </label>
    </div>
    <div className="mb-6">
      <label className="flex flex-col">
        <span className="text-sm font-medium mb-1 text-left text-gray-500">Practice Address</span>
        <textarea
          name="practiceAddress"
          value={formData.practiceAddress}
          onChange={handleChange}
          placeholder="123 Wellness Lane, Suite 100, San Francisco, CA 94105"
          rows="3"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        ></textarea>
      </label>
    </div>
  </section>
);

export default SessionDetailsSection;

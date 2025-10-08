import React from 'react';
import { SPECIALIZATIONS } from '../constants/enums';
import { ChevronDownIcon } from './shared/icons';

const ProfileDetailsSection = ({ formData, handleFileChange, handleChange, specializations, selectedFileName }) => (
  <section className="mb-8">
  <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">Profile Details</h2>
  <div className="grid md:grid-cols-2 gap-6 items-center mb-6 text-left">
      <label className="flex flex-col">
        <span className="text-sm font-medium mb-1 text-gray-500">Profile Picture</span>
        <div className="flex items-center space-x-4 mt-2">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
            {formData.profilePicture ? (
              <img src={formData.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <span className="text-gray-500 text-sm">No Photo</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer bg-transparent border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-full shadow-sm hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              Choose File
            </label>
            <span className="text-sm text-gray-500">{selectedFileName ? selectedFileName : "No file chosen"}</span>
          </div>
        </div>
      </label>
    </div>
    <div className="mb-6 text-left">
      <label className="flex flex-col text-left">
  <span className="text-sm font-medium mb-1 text-left text-gray-500">Bio</span>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          placeholder="Share a brief introduction about your approach, experience, and what clients can expect when working with you"
          rows="4"
          className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
        ></textarea>
      </label>
    </div>
  <div className="grid md:grid-cols-2 gap-6 mb-6 text-left">
      <div className="flex flex-col relative">
        <label className="text-sm font-medium mb-1 text-gray-500">Specialization</label>
        <div className="relative">
          <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
            <ChevronDownIcon />
          </span>
          <select
            name="specialization"
            value={formData.specialization}
            onChange={handleChange}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
          >
            <option value="">Select a primary specialization</option>
            <option value={SPECIALIZATIONS.CLINICAL}>{SPECIALIZATIONS.CLINICAL}</option>
            <option value={SPECIALIZATIONS.COUNSELLING}>{SPECIALIZATIONS.COUNSELLING}</option>
            <option value={SPECIALIZATIONS.LIFE_COACH}>{SPECIALIZATIONS.LIFE_COACH}</option>
          </select>
        </div>
      </div>
      <div className="flex flex-col relative">
        <label className="text-sm font-medium mb-1 text-gray-500">Practice Since</label>
        <div className="relative">

          <input
            type="date"
            name="practiceSince"
            value={formData.practiceSince}
            onChange={handleChange}
            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  </section>
);

export default ProfileDetailsSection;

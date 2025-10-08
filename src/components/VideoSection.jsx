import React from 'react';

const VideoSection = ({ formData, handleChange }) => (
  <section className="mb-8">
  <h2 className="text-xl font-semibold text-gray-900 mb-4 text-left">Introduction Video URL (Optional)</h2>
    <label className="flex flex-col">
      <input
        type="url"
        name="introductionVideoUrl"
        value={formData.introductionVideoUrl}
        onChange={handleChange}
        placeholder="https://vimeo.com/your-intro-video"
        className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </label>
  </section>
);

export default VideoSection;

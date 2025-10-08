import React from 'react';
import { Pencil, Trash } from 'lucide-react';

const PencilIcon = () => <Pencil size={16} className="text-gray-500" />;
const TrashIcon = () => <Trash size={16} className="text-red-500" />;

const ProfessionalInfoSection = ({
  formData,
  languages,
  expertiseAreas,
  handleLanguageToggle,
  handleExpertiseToggle,
  handleAddLanguage,
  handleAddExpertise,
  customLanguage,
  setCustomLanguage,
  customExpertise,
  setCustomExpertise,
  handleAddQualification,
  handleAddCertification,
  handleEditQualification,
  handleDeleteQualification,
  handleEditCertification,
  handleDeleteCertification,
}) => (
  <section className="mb-8">
    <h2 className="text-xl font-semibold text-left text-gray-800 mb-4">Professional Information</h2>
    {/* Languages */}
    <div className="mb-6">
      <label className="text-sm font-medium mb-2 block text-left text-gray-500">Languages</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {languages.map((lang, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleLanguageToggle(lang)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 w-fit mr-2 mb-2 ${
              formData.languages.includes(lang)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Add another language"
          value={customLanguage}
          onChange={e => setCustomLanguage(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition-colors"
          onClick={handleAddLanguage}
        >
          Add
        </button>
      </div>
    </div>
    {/* Areas of Expertise */}
    <div className="mb-6">
  <label className="text-sm font-medium mb-2 block text-left text-gray-500">Areas of Expertise</label>
      <div className="flex flex-wrap gap-2 mb-2">
        {expertiseAreas.map((area, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleExpertiseToggle(area)}
            className={`px-4 py-2 rounded-full font-semibold transition-colors duration-200 w-fit mr-2 mb-2 ${
              formData.expertiseAreas.includes(area)
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {area}
          </button>
        ))}
      </div>
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="text"
          placeholder="Add another area of expertise"
          value={customExpertise}
          onChange={e => setCustomExpertise(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-md flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="button"
          className="bg-green-600 text-white font-semibold py-2 px-4 rounded-full hover:bg-green-700 transition-colors"
          onClick={handleAddExpertise}
        >
          Add
        </button>
      </div>
    </div>
    {/* Qualifications */}
    <div className="mb-6">
  <label className="text-sm font-medium mb-2 block text-left text-gray-500">Qualifications</label>
      {formData.qualifications.map((q, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
          <div>
            <p className="font-semibold text-gray-800">{q.degreeName} ({q.degreeType})</p>
            <p className="text-sm text-gray-500">{q.instituteName} - {q.yearOfPassing}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleEditQualification(index)}><PencilIcon /></button>
            <button type="button" onClick={() => handleDeleteQualification(index)}><TrashIcon /></button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddQualification}
        className="w-full mt-4 py-3 text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200"
      >
        Add Qualification
      </button>
    </div>
    {/* Certifications */}
    <div className="mb-6">
  <label className="text-sm font-medium mb-2 block text-left text-gray-500">Certifications</label>
      {formData.certifications.map((c, index) => (
        <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 mb-2">
          <div>
            <p className="font-semibold text-gray-800">{c.certificationName}</p>
            <p className="text-sm text-gray-500">
              {c.certificationNumber} - {c.certificationAuthority}
            </p>
            <p className="text-xs text-gray-500">
              Issued: {c.certificationYear}
              {c.certificationExpiryDate && ` - Expires: ${c.certificationExpiryDate}`}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button type="button" onClick={() => handleEditCertification(index)}><PencilIcon /></button>
            <button type="button" onClick={() => handleDeleteCertification(index)}><TrashIcon /></button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={handleAddCertification}
        className="w-full mt-4 py-3 text-green-600 font-medium bg-green-50 border border-green-200 rounded-lg transition-colors hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-200"
      >
        Add Certification
      </button>
    </div>
  </section>
);

export default ProfessionalInfoSection;

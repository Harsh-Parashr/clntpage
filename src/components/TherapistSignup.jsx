import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { X } from 'lucide-react';

// Firebase imports
import { app, auth } from '../services/firebase/config';
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { addTherapist } from '../services/firebase/firestore';
import { registerTherapist, updateUserProfile } from '../services/firebase/auth';

// Constants and Components
import { DEGREE_TYPES } from '../constants/enums';
import BasicInfoSection from './BasicInfoSection';
import ProfileDetailsSection from './ProfileDetailsSection';
import ProfessionalInfoSection from './ProfessionalInfoSection';
import VideoSection from './VideoSection';
import AlertModal from './AlertModal';
import { ChevronDownIcon } from './shared/icons';

// Hardcoded data for demonstration
const specializations = ['Select a primary specialization', 'Clinical psychologist', 'Counselling psychologist', 'Life coach'];
const languages = ['English', 'Hindi'];
const expertiseAreas = ['Depression', 'Stress Management', 'Grief', 'ADHD'];


const TherapistSignup = () => {
  const navigate = useNavigate();
  // Form state
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    pronoun: '',
    profilePicture: '',
    bio: '',
    specialization: '',
    practiceSince: '',
    languages: [],
    expertiseAreas: [],
  qualifications: [],
  certifications: [],
    practiceAddress: '',
    introductionVideoUrl: '',
    password: '',
    confirmPassword: '',
  });


  // UI state
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [selectedFileName, setSelectedFileName] = useState("");
  const [alert, setAlert] = useState({ message: '', visible: false });
  const [passwordMatch, setPasswordMatch] = useState({ isMatching: true, message: '' });

  // Required fields validation (after passwordMatch is initialized)
  const requiredFieldsFilled =
    formData.fullName.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.phone.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    passwordMatch.isMatching;
  // Modal state
  const [isQualificationModalOpen, setIsQualificationModalOpen] = useState(false);
  const [isCertificationModalOpen, setIsCertificationModalOpen] = useState(false);

  // Custom inputs state
  const [customLanguage, setCustomLanguage] = useState("");
  const [customExpertise, setCustomExpertise] = useState("");
  const [allLanguages, setAllLanguages] = useState(languages);
  const [allExpertiseAreas, setAllExpertiseAreas] = useState(expertiseAreas);

  // Qualification and certification state
  const [newQualification, setNewQualification] = useState({
    degreeName: '',
    degreeType: '',
    instituteName: '',
    yearOfPassing: '',
  });

  const [newCertification, setNewCertification] = useState({
    certificationName: '',
    certificationNumber: '',
    certificationAuthority: '',
    certificationYear: '',
    certificationExpiryDate: ''
  });

  const [editingQualificationIndex, setEditingQualificationIndex] = useState(null);
  const [editingCertificationIndex, setEditingCertificationIndex] = useState(null);

  const handleEditQualification = (index) => {
    const q = formData.qualifications[index];
    setNewQualification({
      degreeName: q.degreeName || '',
      degreeType: q.degreeType || '',
      instituteName: q.instituteName || '',
      yearOfPassing: q.yearOfPassing || ''
    });
    setIsQualificationModalOpen(true);
    setEditingQualificationIndex(index);
  };
    
    const handleDeleteQualification = (index) => {
      setFormData(prevData => ({
        ...prevData,
        qualifications: prevData.qualifications.filter((_, i) => i !== index)
      }));
    };

    const handleSaveQualification = (e) => {
      e.preventDefault();
      if (editingQualificationIndex !== null) {
        setFormData(prevData => ({
          ...prevData,
          qualifications: prevData.qualifications.map((q, i) => 
            i === editingQualificationIndex ? newQualification : q
          )
        }));
        setEditingQualificationIndex(null);
      } else {
        setFormData(prevData => ({
          ...prevData,
          qualifications: [...prevData.qualifications, newQualification]
        }));
      }
      setNewQualification({
        degreeName: '',
        degreeType: '',
        instituteName: '',
        yearOfPassing: ''
      });
      setIsQualificationModalOpen(false);
    };

    const handleQualificationModalChange = (e) => {
      const { name, value } = e.target;
      setNewQualification(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleEditCertification = (index) => {
      const cert = formData.certifications[index];
      setNewCertification({
        certificationName: cert.certificationName || '',
        certificationNumber: cert.certificationNumber || '',
        certificationAuthority: cert.certificationAuthority || '',
        certificationYear: cert.certificationYear || '',
        certificationExpiryDate: cert.certificationExpiryDate || ''
      });
      setEditingCertificationIndex(index);
      setIsCertificationModalOpen(true);
    };

    const handleDeleteCertification = (index) => {
      setFormData(prevData => ({
        ...prevData,
        certifications: prevData.certifications.filter((_, i) => i !== index)
      }));
    };

    const handleCertificationModalChange = (e) => {
      const { name, value } = e.target;
      setNewCertification(prev => ({
        ...prev,
        [name]: value
      }));
    };

    const handleSaveCertification = (e) => {
      e.preventDefault();
      if (editingCertificationIndex !== null) {
        setFormData(prevData => ({
          ...prevData,
          certifications: prevData.certifications.map((c, i) => 
            i === editingCertificationIndex ? newCertification : c
          )
        }));
        setEditingCertificationIndex(null);
      } else {
        setFormData(prevData => ({
          ...prevData,
          certifications: [...prevData.certifications, newCertification]
        }));
      }
      setNewCertification({
        certificationName: '',
        certificationNumber: '',
        certificationAuthority: '',
        certificationYear: '',
        certificationExpiryDate: ''
      });
      setIsCertificationModalOpen(false);
    };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => {
      const newData = {
        ...prevData,
        [name]: value,
      };
      
      // Check password match when either password or confirmPassword changes
      if (name === 'password' || name === 'confirmPassword') {
        const password = name === 'password' ? value : newData.password;
        const confirmPassword = name === 'confirmPassword' ? value : newData.confirmPassword;
        
        if (!password || !confirmPassword) {
          setPasswordMatch({ isMatching: true, message: '' });
        } else if (password === confirmPassword) {
          setPasswordMatch({ isMatching: true, message: 'Passwords match! ✓' });
        } else {
          setPasswordMatch({ isMatching: false, message: 'Passwords do not match!' });
        }
      }
      
      return newData;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFileName(file.name);
      
      try {
        const storage = getStorage(app);
        const storageRef = ref(storage, `profile-pictures/${Date.now()}_${file.name}`);
        
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        
        setFormData(prevData => ({
          ...prevData,
          profilePicture: downloadURL
        }));
      } catch (error) {
        console.error('Error uploading file:', error);
        showAlert('Failed to upload profile picture. Please try again.');
      }
    }
  };

  const showAlert = (message) => {
    setAlert({ message, visible: true });
    setTimeout(() => {
      setAlert({ message: '', visible: false });
    }, 3000);
  };

  const handleAddQualification = () => {
    setIsQualificationModalOpen(true);
  };

  const handleAddCertification = () => {
    setIsCertificationModalOpen(true);
  };

  const handleLanguageToggle = (language) => {
    setFormData(prevData => ({
      ...prevData,
      languages: prevData.languages.includes(language)
        ? prevData.languages.filter(l => l !== language)
        : [...prevData.languages, language]
    }));
  };

  const handleExpertiseToggle = (expertise) => {
    setFormData(prevData => ({
      ...prevData,
      expertiseAreas: prevData.expertiseAreas.includes(expertise)
        ? prevData.expertiseAreas.filter(e => e !== expertise)
        : [...prevData.expertiseAreas, expertise]
    }));
  };

  const handleAddLanguage = () => {
    if (customLanguage && !allLanguages.includes(customLanguage)) {
      setAllLanguages(prev => [...prev, customLanguage]);
      setFormData(prev => ({
        ...prev,
        languages: [...prev.languages, customLanguage]
      }));
      setCustomLanguage("");
    }
  };

  const handleAddExpertise = () => {
    if (customExpertise && !allExpertiseAreas.includes(customExpertise)) {
      setAllExpertiseAreas(prev => [...prev, customExpertise]);
      setFormData(prev => ({
        ...prev,
        expertiseAreas: [...prev.expertiseAreas, customExpertise]
      }));
      setCustomExpertise("");
    }
  };

  // ...session rate handling removed (no session details on signup)

  // Generate years for the dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1900 + 1 }, (_, i) => 1900 + i);

// Clean, correct handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setSubmitError('');
  // Validate password match
  if (formData.password !== formData.confirmPassword) {
    setLoading(false);
    setSubmitError('Passwords do not match.');
    showAlert('Passwords do not match.');
    return;
  }
  // Register user in Firebase Auth
  let uid;
  try {
    uid = await registerTherapist(formData.email, formData.password);
    // If a profilePicture was uploaded, update the Firebase Auth profile photoURL as well
    if (formData.profilePicture) {
      try {
        await updateUserProfile({ photoURL: formData.profilePicture, displayName: formData.fullName || undefined });
      } catch (err) {
        console.warn('Failed to update Auth profile:', err);
      }
    }
  } catch (authError) {
    setLoading(false);
    setSubmitError(authError.message || 'Failed to create user.');
    showAlert(authError.message || 'Failed to create user.');
    return;
  }
  // Map formData to Firestore schema (do not store password)
  const therapistData = {
    uid,
    name: formData.fullName || '',
    email: formData.email || '',
    phone: formData.phone || '',
    profilePicture: formData.profilePicture || '',
    specialization: formData.specialization || '',
    practiceSince: formData.practiceSince || '',
    youtubeProfile: formData.introductionVideoUrl || '',
    languages: Array.isArray(formData.languages) ? formData.languages : [],
    expertise: Array.isArray(formData.expertiseAreas) ? formData.expertiseAreas : [],
    approved: false,
    pronouns: formData.pronoun || '',
    slug: '',
    address: {
      address: formData.practiceAddress || '',
      city: '',
      state: '',
      country: '',
      zipCode: '',
    },
    qualifications: Array.isArray(formData.qualifications)
      ? formData.qualifications.map(q => ({
          degreeName: q.degreeName || q.name || '',
          degreeType: q.degreeType || '',
          instituteName: q.instituteName || q.institution || '',
          yearOfPassing: q.yearOfPassing || q.year || ''
        }))
      : [],
    certifications: Array.isArray(formData.certifications)
      ? formData.certifications.map(c => ({
          certificationName: c.certificationName || c.name || '',
          certificationNumber: c.certificationNumber || c.license || '',
          certificationAuthority: c.certificationAuthority || '',
          certificationYear: c.certificationYear || c.issued || '',
          certificationExpiryDate: c.certificationExpiryDate || c.expiry || ''
        }))
      : [],
    charges: [
      {
        sessionType: 'individual',
        amount: 0
      }
    ]
  };
  try {
    await addTherapist(therapistData);
    setLoading(false);
    showAlert('Therapist profile submitted and saved!');
    // Navigate to login page after successful registration
    setTimeout(() => {
      navigate('/login');
    }, 1500); // Give time for the success message to be visible
  } catch (err) {
    setLoading(false);
    setSubmitError('Failed to submit therapist data. Please try again.');
    showAlert('Error submitting therapist data.');
  }
};

  return (
    <div className="bg-gray-100 min-h-screen py-8 font-sans antialiased text-gray-800">
      <AlertModal message={alert.message} visible={alert.visible} />
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-md border border-gray-200">
        <header className="text-center mb-10">
          <h1 className="text-2xl font-bold text-gray-900">Join MentCura as a Therapist</h1>
          <p className="mt-2 text-gray-600">Create your professional profile to connect with clients.</p>
        </header>

  <form onSubmit={handleSubmit} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
          {loading && (
            <div className="text-center text-blue-600 mb-4">Saving therapist data...</div>
          )}
          {submitError && (
            <div className="text-center text-red-600 mb-4">{submitError}</div>
          )}
          <BasicInfoSection 
            formData={formData}
            handleChange={handleChange}
            passwordMatch={passwordMatch}
            requiredFields={['fullName', 'email', 'phone', 'password', 'confirmPassword']}
          />
          <ProfileDetailsSection formData={formData} handleFileChange={handleFileChange} handleChange={handleChange} specializations={specializations} selectedFileName={selectedFileName} />
          <ProfessionalInfoSection
            formData={formData}
            languages={allLanguages}
            expertiseAreas={allExpertiseAreas}
            handleLanguageToggle={handleLanguageToggle}
            handleExpertiseToggle={handleExpertiseToggle}
            handleAddLanguage={handleAddLanguage}
            handleAddExpertise={handleAddExpertise}
            customLanguage={customLanguage}
            setCustomLanguage={setCustomLanguage}
            customExpertise={customExpertise}
            setCustomExpertise={setCustomExpertise}
            handleAddQualification={handleAddQualification}
            handleAddCertification={handleAddCertification}
              handleEditQualification={handleEditQualification}
              handleDeleteQualification={handleDeleteQualification}
              handleEditCertification={handleEditCertification}
              handleDeleteCertification={handleDeleteCertification}
          />
          {/* Session details removed from signup */}
          <VideoSection formData={formData} handleChange={handleChange} />
          <div className="flex justify-center gap-4">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="bg-gray-200 text-gray-800 font-semibold py-3 px-6 rounded-full hover:bg-gray-300 transition-colors"
            >
              Back to Login
            </button>

            <button
              type="submit"
              disabled={!requiredFieldsFilled || loading}
              className={`bg-green-600 text-white font-semibold py-3 px-8 rounded-full hover:bg-green-700 transition-colors ${(!requiredFieldsFilled || loading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>

      {isQualificationModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Qualification</h2>
              <button onClick={() => setIsQualificationModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveQualification} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Degree Name</label>
                <input
                  type="text"
                  name="degreeName"
                  value={newQualification.degreeName}
                  onChange={handleQualificationModalChange}
                  placeholder="e.g., Clinical Psychology"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Degree Type</label>
                <div className="relative">
                  <select
                    name="degreeType"
                    value={newQualification.degreeType}
                    onChange={handleQualificationModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{ background: 'none' }}
                  >
                    <option value="">Select a degree type</option>
                    <option value={DEGREE_TYPES.BACHELOR}>Bachelor's</option>
                    <option value={DEGREE_TYPES.MASTER}>Master's</option>
                    <option value={DEGREE_TYPES.PHD}>PhD</option>
                  </select>
                  <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                    <ChevronDownIcon />
                  </span>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Institute Name</label>
                <input
                  type="text"
                  name="instituteName"
                  value={newQualification.instituteName}
                  onChange={handleQualificationModalChange}
                  placeholder="e.g., University of California"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium mb-1">Year of Passing</label>
                <div className="relative">
                  <select
                    name="yearOfPassing"
                    value={newQualification.yearOfPassing}
                    onChange={handleQualificationModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                    style={{ background: 'none' }}
                  >
                    <option value="">Select a year</option>
                    {years.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsQualificationModalOpen(false)}
                  className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-green-700 transition-colors"
                >
                  {editingQualificationIndex !== null ? 'Update' : 'Add'} Qualification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isCertificationModalOpen && (
        <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Add Certification</h2>
              <button onClick={() => setIsCertificationModalOpen(false)} className="text-gray-500 hover:text-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleSaveCertification} onKeyDown={e => { if (e.key === 'Enter') e.preventDefault(); }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Certification Name</label>
                <input
                  type="text"
                  name="certificationName"
                  value={newCertification.certificationName}
                  onChange={handleCertificationModalChange}
                  placeholder="e.g., Licensed Professional Counselor"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">License Number</label>
                <input
                  type="text"
                  name="certificationNumber"
                  value={newCertification.certificationNumber}
                  onChange={handleCertificationModalChange}
                  placeholder="e.g., LPC-12345"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Certification Authority</label>
                <input
                  type="text"
                  name="certificationAuthority"
                  value={newCertification.certificationAuthority}
                  onChange={handleCertificationModalChange}
                  placeholder="e.g., National Board for Certified Counselors"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Certification Year</label>
                  <div className="relative">
                    <select
                      name="certificationYear"
                      value={newCertification.certificationYear}
                      onChange={handleCertificationModalChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
                      style={{ background: 'none' }}
                    >
                      <option value="">YYYY</option>
                      {years.map((year) => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center">
                      <ChevronDownIcon />
                    </span>
                  </div>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-1">Certification Expiry Date (Optional)</label>
                  <input
                    type="date"
                    name="certificationExpiryDate"
                    value={newCertification.certificationExpiryDate}
                    onChange={handleCertificationModalChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => setIsCertificationModalOpen(false)}
                  className="bg-gray-200 text-gray-800 font-semibold py-2 px-6 rounded-full hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-green-600 text-white font-semibold py-2 px-6 rounded-full hover:bg-green-700 transition-colors"
                >
                  {editingCertificationIndex !== null ? 'Update' : 'Add'} Certification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapistSignup;

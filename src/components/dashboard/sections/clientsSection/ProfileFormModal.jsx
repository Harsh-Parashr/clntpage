import React, { useState } from 'react';
import XCircle from './icons/XCircle';

const ProfileFormModal = ({ client, onClose, onSave, isNewClient = false }) => {
    const [formData, setFormData] = useState(client || {
        name: '', email: '', phone: '', dob: '', gender: 'Male', address: '',
        status: 'Active', lastSession: 'N/A', nextAppointment: 'Not Scheduled', totalSessions: 0,
        sessionHistory: [], notes: []
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // If editing an existing client, call PUT API directly
        if (!isNewClient && formData.id) {
            try {
                const res = await fetch(`http://localhost:3001/api/clients/${formData.id}`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
                if (!res.ok) throw new Error('Failed to update client');
                const savedClient = await res.json();
                onSave(savedClient);
            } catch (error) {
                // Optionally show error to user
                console.error('Failed to update client', error);
            }
        } else {
            // For new client, just call onSave (handled by parent)
            onSave(formData);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                 <div className="flex justify-between items-center border-b pb-3 mb-5">
                    <h2 className="text-2xl font-bold text-gray-800">{isNewClient ? 'Add New Client Manually' : 'Edit Profile'}</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                        <XCircle size={20} className="text-gray-500"/>
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500" />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                            <select name="gender" value={formData.gender} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                                <option>Male</option>
                                <option>Female</option>
                                <option>Other</option>
                                <option>Prefer not to say</option>
                            </select>
                        </div>
                         <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea name="address" value={formData.address} onChange={handleChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"></textarea>
                        </div>
                    </div>
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm">Cancel</button>
                        <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm shadow-sm">Save Changes</button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default ProfileFormModal;

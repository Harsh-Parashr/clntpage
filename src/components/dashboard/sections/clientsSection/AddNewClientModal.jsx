import React from 'react';
import XCircle from './icons/XCircle';

const AddNewClientModal = ({ onClose, onAddManually }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b pb-3 mb-5">
                <h2 className="text-xl font-bold text-gray-800">Add New Client</h2>
                <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200">
                    <XCircle size={20} className="text-gray-500"/>
                </button>
            </div>
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Client Selection Method</label>
                    <select className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white">
                        <option>Select from session attendees</option>
                    </select>
                </div>
                <div className="text-right">
                    <button onClick={onAddManually} className="text-sm font-medium text-teal-600 hover:text-teal-800">
                        Add manually instead
                    </button>
                </div>
            </div>
             <div className="flex justify-end gap-3 mt-6 border-t pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-semibold text-sm">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 font-semibold text-sm shadow-sm disabled:bg-gray-300" disabled>Add Selected Client</button>
            </div>
        </div>
    </div>
);
export default AddNewClientModal;

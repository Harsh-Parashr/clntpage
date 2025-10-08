import React from 'react';
import Avatar from './Avatar';
import ClientStatusBadge from './ClientStatusBadge';

// Destructure 'delay' from the single props object
const ClientCard = ({ client, onViewProfile, index = 0, delay = 80 }) => (
    <div
        className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col gap-4 transition-all hover:shadow-md opacity-0 animate-fadein"
        // Use the 'delay' prop in the style calculation
        style={{ animationDelay: `${index * delay}ms`, animationFillMode: 'forwards' }}
    >
        <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
                <Avatar name={client.name} />
                <div>
                    <h3 className="font-bold text-lg text-gray-800">{client.name}</h3>
                    <p className="text-sm text-gray-500">{client.email}</p>
                    <p className="text-sm text-gray-500">{client.phone}</p>
                </div>
            </div>
            <ClientStatusBadge status={client.status} />
        </div>
        <div className="grid grid-cols-3 gap-4 text-sm border-t border-gray-200 pt-4 mt-2">
            <div><p className="text-gray-500 mb-1">Last Session</p><p className="font-semibold text-gray-800">{client.lastSession}</p></div>
            <div><p className="text-gray-500 mb-1">Next Appointment</p><p className={`font-semibold ${client.nextAppointment === 'None Scheduled' || client.nextAppointment === 'None' ? 'text-red-500' : 'text-gray-800'}`}>{client.nextAppointment}</p></div>
            <div><p className="text-gray-500 mb-1">Total Sessions</p><p className="font-semibold text-gray-800">{client.totalSessions}</p></div>
        </div>
        <div className="flex gap-2 mt-2">
            <button onClick={() => onViewProfile(client)} className="flex-1 px-4 py-2 text-sm font-semibold bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">View Profile</button>
            <button className="flex-1 px-4 py-2 text-sm font-semibold bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors">Schedule Session</button>
        </div>
    </div>
);

export default ClientCard;
import React from 'react';
import ArrowLeft from './icons/ArrowLeft';
import Edit from './icons/Edit';
import FileText from './icons/FileText';
import CheckCircle from './icons/CheckCircle';
import XCircle from './icons/XCircle';
import Lock from './icons/Lock';
import Avatar from './Avatar';
import ClientStatusBadge from './ClientStatusBadge';
import formatDateAndAge from './utils/formatDateAndAge';

const ClientProfile = ({ client, onBack, onEdit }) => {
    const SessionStatusIcon = ({ status }) => {
        if (status === 'Completed') return <CheckCircle className="text-green-500" size={18}/>;
        if (status === 'Canceled') return <XCircle className="text-red-500" size={18}/>;
        return null;
    };
    return (
        <div className="bg-white p-4 sm:p-6 lg:p-8 rounded-lg shadow-lg">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4 border-b pb-4">
                <div className="flex items-center gap-4">
                     <button onClick={onBack} className="p-2 rounded-full hover:bg-gray-100">
                        <ArrowLeft size={24} className="text-gray-600" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-bold text-gray-800">{client.name}</h1>
                            <ClientStatusBadge status={client.status}/>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">Client ID: #{client.id}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm"><FileText size={18}/> Schedule Session</button>
                    <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"><Edit size={18}/> Edit Profile</button>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column */}
                <div className="lg:col-span-1 flex flex-col gap-6">
                    <div className="bg-gray-50 p-5 rounded-lg border">
                       <div className="flex items-center gap-4">
                           <Avatar name={client.name} size="w-20 h-20" textSize="text-3xl"/>
                           <div>
                                <h3 className="font-bold text-xl text-gray-800">{client.name}</h3>
                                <p className="text-sm text-gray-500">{client.email}</p>
                                <p className="text-sm text-gray-500">{client.phone}</p>
                           </div>
                       </div>
                       <div className="text-sm text-gray-700 mt-4 space-y-2 border-t pt-4">
                           <p><strong>DOB:</strong> {formatDateAndAge(client.dob)}</p>
                           <p><strong>Gender:</strong> {client.gender}</p>
                           <p><strong>Address:</strong> {client.address}</p>
                       </div>
                    </div>
                     <div className="bg-gray-50 p-5 rounded-lg border">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Session Summary</h3>
                        <div className="text-sm space-y-2 text-gray-700">
                            <div className="flex justify-between"><span className="text-gray-500">Total Sessions:</span> <strong>{client.totalSessions}</strong></div>
                            <div className="flex justify-between"><span className="text-gray-500">Last Session:</span> <strong>{client.lastSession}</strong></div>
                            <div className="flex justify-between"><span className="text-gray-500">Next Session:</span> <strong className="text-teal-600">{client.nextAppointment}</strong></div>
                        </div>
                    </div>
                </div>
                {/* Right Column */}
                <div className="lg:col-span-2">
                   {/* Session History */}
                    <div className="mb-6">
                        <h3 className="font-bold text-lg text-gray-800 mb-3">Session History</h3>
                         <div className="overflow-x-auto border rounded-lg">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Date</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Time</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Type</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Duration</th>
                                        <th className="px-4 py-2 text-left font-medium text-gray-500">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {client.sessionHistory?.map((session, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 text-gray-700">{session.date}</td>
                                            <td className="px-4 py-3 text-gray-700">{session.time}</td>
                                            <td className="px-4 py-3 text-gray-700">{session.type}</td>
                                            <td className="px-4 py-3 text-gray-700">{session.duration}</td>
                                            <td className="px-4 py-3 text-gray-700"><div className="flex items-center gap-2"><SessionStatusIcon status={session.status}/> {session.status}</div></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                     {/* Notes & Observations */}
                    <div>
                         <div className="flex justify-between items-center mb-3">
                            <h3 className="font-bold text-lg text-gray-800">Notes & Observations</h3>
                            <button className="flex items-center gap-2 bg-[#D6F3E5] text-[#0F8C4A] px-4 py-2 rounded-lg font-medium">
                                <Lock className="w-4 h-4" /> Add Secure Note
                            </button>
                         </div>
                         <div className="space-y-4">
                            {client.notes?.map((note, index) => (
                                <div key={index} className="bg-gray-50 p-4 rounded-lg border">
                                    <p className="text-xs font-semibold text-gray-500 mb-2">{note.date}</p>
                                    <p className="text-sm text-gray-700">{note.content}</p>
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default ClientProfile;

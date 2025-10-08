import React from 'react';
import { LayoutDashboard, Users, Calendar, DollarSign, BarChart } from 'lucide-react';
import { auth } from '../../services/firebase/config';
import MentCuraLogo from '../../assets/mentcura_logo.svg';

const NAV_ITEMS = [
  { key: 'Dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { key: 'Clients', label: 'Clients', icon: Users },
  { key: 'Schedule', label: 'Schedule', icon: Calendar },
  { key: 'Billing', label: 'Billing', icon: DollarSign },
  { key: 'Reports', label: 'Reports', icon: BarChart },
];

export default function Sidebar({ activeSection, onSelect, therapistName, profilePicture }) {
  const handleSignOut = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <aside className="w-64 flex-shrink-0 bg-white p-6 flex flex-col">
      <div className="flex items-center justify-center mb-8">
        <img src={MentCuraLogo} alt="MentCura" className="h-10 w-auto mx-auto" />
      </div>
      <div className="text-center mb-10">
        <img
          src={profilePicture || 'https://i.pravatar.cc/150?img=32'}
          alt={therapistName || 'Therapist'}
          className="w-28 h-28 rounded-full mx-auto mb-4 border-4 border-gray-100"
        />
        <h2 className="text-lg font-semibold text-gray-800">{therapistName || 'Therapist'}</h2>
        <p className="text-sm text-gray-500">Licensed Therapist</p>
      </div>
      <nav className="flex flex-col gap-2 flex-grow">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={() => onSelect(item.key)}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left text-gray-600 font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 ${
              activeSection === item.key
                ? 'bg-emerald-50 text-emerald-600'
                : 'hover:bg-gray-100 hover:text-gray-900'
            }`}
          >
            {React.createElement(item.icon, { className: 'h-5 w-5' })}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
      <button
        onClick={handleSignOut}
        className="mt-auto w-full px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
        Sign Out
      </button>
    </aside>
  );
}



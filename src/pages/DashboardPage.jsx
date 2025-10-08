import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../services/firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import Sidebar from '../components/dashboard/Sidebar';
import DashboardSection from '../components/dashboard/sections/DashboardSection';
import ClientsSection from '../components/dashboard/sections/clientsSection/ClientsSection';
import ScheduleSection from '../components/dashboard/sections/ScheduleSection';

export default function DashboardPage() {
  const [therapistName, setTherapistName] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [activeSection, setActiveSection] = useState('Dashboard');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user && user.email) {
        const therapistsRef = collection(db, 'Therapist');
        const q = query(therapistsRef, where('email', '==', user.email));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          setTherapistName(docData.name || "Therapist");
          setProfilePicture(docData.profilePicture || "");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onSelect={setActiveSection} therapistName={therapistName} profilePicture={profilePicture} />
      {activeSection === 'Dashboard' && (
        <DashboardSection therapistName={therapistName} />
      )}
      {activeSection === 'Clients' && (
        <main className="flex-1 p-8">
          <ClientsSection />
        </main>
      )}
      {activeSection === 'Schedule' && (
        <main className="flex-1 p-8">
          <ScheduleSection />
        </main>
      )}
    </div>
  );
}


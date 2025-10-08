import React, { useState, useEffect } from 'react';
import Plus from './icons/Plus';
import Search from './icons/Search';
import ChevronDown from './icons/ChevronDown';
import ClientCard from './ClientCard';
import ClientProfile from './ClientProfile';
import AddNewClientModal from './AddNewClientModal';
import ProfileFormModal from './ProfileFormModal';

// Simulated API for fetching initial clients
// import getInitialClientsApi from './utils/getInitialClientsApi';
// import { addClientToInitialClients } from './utils/initialClients';

// Main ClientsSection Component

export default function ClientsSection() {
    const [clients, setClients] = useState(null); // null means loading

    // Fetch clients from backend API on mount
    useEffect(() => {
        const fetchClients = async () => {
            try {
                setClients(null); // show loading
                const res = await fetch('http://localhost:3001/api/clients');
                if (!res.ok) throw new Error('Failed to fetch clients');
                const data = await res.json();
                setClients(data);
            } catch (error) {
                console.error('Failed to load clients', error);
                setClients([]);
            }
        };
        fetchClients();
    }, []);

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedClient, setSelectedClient] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddClientModalOpen, setIsAddClientModalOpen] = useState(false);
    const [isManualAddModalOpen, setIsManualAddModalOpen] = useState(false);
    
    // No localStorage sync needed; backend is source of truth

    const handleViewProfile = (client) => {
        const fullClient = clients.find(c => c.id === client.id);
        setSelectedClient(fullClient);
    };
    
    const handleBackToList = () => {
        setSelectedClient(null);
    };

    const handleOpenEditModal = () => {
        setIsEditModalOpen(true);
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
    };

    const handleUpdateClient = async (updatedClient) => {
        try {
            const res = await fetch(`http://localhost:3001/api/clients/${updatedClient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedClient)
            });
            if (!res.ok) throw new Error('Failed to update client');
            const savedClient = await res.json();
            // Update local state with the updated client
            setClients(prevClients => prevClients.map(c => c.id === savedClient.id ? savedClient : c));
            setSelectedClient(savedClient);
            setIsEditModalOpen(false);
        } catch (error) {
            console.error('Failed to update client', error);
        }
    };
    
    const handleOpenAddClientModal = () => setIsAddClientModalOpen(true);
    const handleCloseAddClientModal = () => setIsAddClientModalOpen(false);
    
    const handleOpenManualAddModal = () => {
        setIsAddClientModalOpen(false);
        setIsManualAddModalOpen(true);
    };
    
    const handleCloseManualAddModal = () => setIsManualAddModalOpen(false);
    
    const handleAddNewClient = async (newClientData) => {
        try {
            const newClient = {
                ...newClientData,
                id: `CL-${Date.now()}` // Generate a simple unique ID
            };
            const res = await fetch('http://localhost:3001/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient)
            });
            if (!res.ok) throw new Error('Failed to add client');
            const savedClient = await res.json();
            setClients(prevClients => [...prevClients, savedClient]);
            setIsManualAddModalOpen(false);
        } catch (error) {
            console.error('Failed to add client', error);
        }
    };


    const filteredClients = clients
        ? clients.filter(client =>
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.phone.toLowerCase().includes(searchTerm.toLowerCase())
        )
        : [];
    
    if (clients === null) {
        // Loading state
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-gray-500 text-lg animate-pulse">Loading clients...</div>
            </div>
        );
    }

    if (selectedClient) {
        return (
             <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
                 <div className="max-w-7xl mx-auto">
                    <ClientProfile client={selectedClient} onBack={handleBackToList} onEdit={handleOpenEditModal} />
                    {isEditModalOpen && (
                        <ProfileFormModal client={selectedClient} onClose={handleCloseEditModal} onSave={handleUpdateClient} />
                    )}
                </div>
            </div>
        )
    }

    return (
      <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-800">Clients</h1>
                    <p className="text-gray-500 mt-1">Showing {filteredClients.length} of {clients.length} clients</p>
                </div>
                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input type="text" placeholder="Search clients..." className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full sm:w-64 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                    </div>
                    <button onClick={handleOpenAddClientModal} className="flex items-center justify-center gap-2 px-4 py-2.5 bg-teal-600 text-white font-semibold rounded-lg hover:bg-teal-700 transition-colors shadow-sm w-full sm:w-auto"><Plus size={20} /> Add New Client</button>
                </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 mb-6">
                <span className="text-gray-600 text-sm">Sort by:</span>
                <button className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-md hover:bg-gray-50">Last Name (A-Z) <ChevronDown size={16} /></button>
            </div>

            {/* Client Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {filteredClients.map((client, idx) => (
                    <ClientCard key={client.id} client={client} onViewProfile={handleViewProfile} index={idx} />
                ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
                <button className="px-6 py-2.5 text-sm font-semibold bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors">Load More</button>
            </div>
            
            {isAddClientModalOpen && (
                <AddNewClientModal onClose={handleCloseAddClientModal} onAddManually={handleOpenManualAddModal} />
            )}

            {isManualAddModalOpen && (
                <ProfileFormModal 
                    onClose={handleCloseManualAddModal} 
                    onSave={handleAddNewClient}
                    isNewClient={true}
                />
            )}
        </div>
      </div>
    );
}


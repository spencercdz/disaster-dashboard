'use client';

import { useState } from 'react';

// Define types for request data
interface RequestItem {
    id: string;
    type: string;
    location: string;
    description: string;
    status: 'pending' | 'in-progress' | 'completed';
    priority: 'low' | 'medium' | 'high';
    timestamp: string;
}

export default function Requests() {
    // Mock data for requests
    const [requests, setRequests] = useState<RequestItem[]>([
        {
            id: '1',
            type: 'Medical',
            location: 'Yangon, Myanmar',
            description: 'Need medical supplies for local clinic',
            status: 'pending',
            priority: 'high',
            timestamp: '2023-06-15T09:30:00Z'
        },
        {
            id: '2',
            type: 'Food',
            location: 'Mandalay, Myanmar',
            description: 'Food distribution needed for 200 families',
            status: 'in-progress',
            priority: 'medium',
            timestamp: '2023-06-14T14:45:00Z'
        },
        {
            id: '3',
            type: 'Shelter',
            location: 'Bago, Myanmar',
            description: 'Temporary shelters needed for displaced people',
            status: 'completed',
            priority: 'high',
            timestamp: '2023-06-13T11:20:00Z'
        }
    ]);

    // Form state
    const [formData, setFormData] = useState({
        type: '',
        location: '',
        description: '',
        priority: 'medium'
    });

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    // Handle form submission
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, you would send this to an API
        const newRequest: RequestItem = {
            id: Date.now().toString(),
            type: formData.type,
            location: formData.location,
            description: formData.description,
            status: 'pending',
            priority: formData.priority as 'low' | 'medium' | 'high',
            timestamp: new Date().toISOString()
        };
        
        setRequests([newRequest, ...requests]);
        
        // Reset form
        setFormData({
            type: '',
            location: '',
            description: '',
            priority: 'medium'
        });
    };

    // Function to get status color
    const getStatusColor = (status: string) => {
        switch(status) {
            case 'pending': return 'bg-yellow-500';
            case 'in-progress': return 'bg-blue-500';
            case 'completed': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    // Function to get priority color
    const getPriorityColor = (priority: string) => {
        switch(priority) {
            case 'low': return 'bg-gray-400';
            case 'medium': return 'bg-orange-400';
            case 'high': return 'bg-red-500';
            default: return 'bg-gray-400';
        }
    };

    return (
        <div className="flex container-default flex-col h-full overflow-hidden">
            <div className="mb-4">
                <h1 className="text-1xl font-bold">Aid Requests</h1>
            </div>
            
            {/* New Request Form */}
            <div className="mb-4 p-3 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group">
                <h2 className="text-md font-semibold mb-2">Submit New Request</h2>
                <form onSubmit={handleSubmit} className="flex flex-col space-y-2">
                    <div className="flex space-x-2">
                        <select 
                            name="type" 
                            value={formData.type} 
                            onChange={handleInputChange}
                            className="search-input flex-1 h-10"
                            required
                        >
                            <option value="">Select Type</option>
                            <option value="Medical">Medical</option>
                            <option value="Food">Food</option>
                            <option value="Water">Water</option>
                            <option value="Shelter">Shelter</option>
                            <option value="Rescue">Rescue</option>
                            <option value="Other">Other</option>
                        </select>
                        
                        <select 
                            name="priority" 
                            value={formData.priority} 
                            onChange={handleInputChange}
                            className="search-input flex-1 h-10"
                        >
                            <option value="low">Low Priority</option>
                            <option value="medium">Medium Priority</option>
                            <option value="high">High Priority</option>
                        </select>
                    </div>
                    
                    <input 
                        type="text" 
                        name="location" 
                        placeholder="Location" 
                        value={formData.location}
                        onChange={handleInputChange}
                        className="search-input w-full"
                        required
                    />
                    
                    <textarea 
                        name="description" 
                        placeholder="Description" 
                        value={formData.description}
                        onChange={handleInputChange}
                        className="search-input w-full min-h-[60px] resize-none"
                        required
                    />
                    
                    <button type="submit" className="search-button self-end">
                        Submit Request
                    </button>
                </form>
            </div>
            
            {/* Requests List */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-2">
                    {requests.map(request => (
                        <div key={request.id} className="p-3 rounded-lg bg-gradient-to-br from-black/60 to-black/30 shadow-md group">
                            <div className="flex justify-between items-start mb-2">
                                <div className="flex items-center">
                                    <span className="font-semibold mr-2">{request.type}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(request.status)}`}>
                                        {request.status}
                                    </span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(request.priority)}`}>
                                    {request.priority} priority
                                </span>
                            </div>
                            <p className="text-sm mb-1">{request.description}</p>
                            <div className="flex justify-between text-xs text-gray-300">
                                <span>{request.location}</span>
                                <span>{new Date(request.timestamp).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
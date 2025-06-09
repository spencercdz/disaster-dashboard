'use client';

import { useState } from 'react';

// Define types for search filters
interface SearchFilters {
    country: string;
    disasterType: string;
    year: string;
    severity: string;
    dateRange: {
        start: string;
        end: string;
    };
    keywords: string;
}

// Define disaster type options
const disasterTypes = [
    { value: '', label: 'All Types' },
    { value: 'flood', label: 'Flood' },
    { value: 'earthquake', label: 'Earthquake' },
    { value: 'cyclone', label: 'Cyclone/Typhoon' },
    { value: 'drought', label: 'Drought' },
    { value: 'wildfire', label: 'Wildfire' },
    { value: 'landslide', label: 'Landslide' },
    { value: 'tsunami', label: 'Tsunami' },
    { value: 'volcanic', label: 'Volcanic Activity' },
];

// Define severity levels
const severityLevels = [
    { value: '', label: 'All Levels' },
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical' },
];

// Generate years for dropdown (last 20 years)
const currentYear = new Date().getFullYear();
const years = [
    { value: '', label: 'All Years' },
    ...Array.from({ length: 20 }, (_, i) => {
        const year = currentYear - i;
        return { value: year.toString(), label: year.toString() };
    })
];

export default function Search() {
    // State for search filters
    const [filters, setFilters] = useState<SearchFilters>({
        country: 'Myanmar',
        disasterType: '',
        year: '',
        severity: '',
        dateRange: {
            start: '',
            end: ''
        },
        keywords: ''
    });

    // State for advanced filters visibility
    const [showAdvanced, setShowAdvanced] = useState(false);

    // Handle input changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        
        if (name === 'start' || name === 'end') {
            setFilters(prev => ({
                ...prev,
                dateRange: {
                    ...prev.dateRange,
                    [name]: value
                }
            }));
        } else {
            setFilters(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Handle search submission
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Search with filters:', filters);
        // Here you would typically call an API or update parent component
    };

    // Handle reset filters
    const handleReset = () => {
        setFilters({
            country: 'Myanmar',
            disasterType: '',
            year: '',
            severity: '',
            dateRange: {
                start: '',
                end: ''
            },
            keywords: ''
        });
    };

    return (
        <div className="container-default h-full flex flex-col overflow-hidden">
            <form onSubmit={handleSearch} className="space-y-3 flex-grow overflow-y-auto pr-2">
                <div className="flex flex-col space-y-2">
                    {/* Basic Search Fields */}
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="country" className="block text-xs mb-1">Country</label>
                            <input
                                type="text"
                                id="country"
                                name="country"
                                value={filters.country}
                                onChange={handleChange}
                                className="search-input w-full h-10"
                            />
                        </div>
                        <div>
                            <label htmlFor="disasterType" className="block text-xs mb-1">Disaster Type</label>
                            <select
                                id="disasterType"
                                name="disasterType"
                                value={filters.disasterType}
                                onChange={handleChange}
                                className="search-input w-full h-10"
                            >
                                {disasterTypes.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label htmlFor="year" className="block text-xs mb-1">Year</label>
                            <select
                                id="year"
                                name="year"
                                value={filters.year}
                                onChange={handleChange}
                                className="search-input w-full h-10"
                            >
                                {years.map(option => (
                                    <option key={option.value} value={option.value}>
                                        {option.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label htmlFor="keywords" className="block text-xs mb-1">Keywords</label>
                            <input
                                type="text"
                                id="keywords"
                                name="keywords"
                                value={filters.keywords}
                                onChange={handleChange}
                                placeholder="Search terms..."
                                className="search-input w-full h-10"
                            />
                        </div>
                    </div>
                    
                    {/* Advanced Search Toggle */}
                    <button 
                        type="button" 
                        className="text-xs text-blue-400 hover:text-blue-300 text-left"
                        onClick={() => setShowAdvanced(!showAdvanced)}
                    >
                        {showAdvanced ? '- Hide Advanced Filters' : '+ Show Advanced Filters'}
                    </button>
                    
                    {/* Advanced Search Fields */}
                    {showAdvanced && (
                        <div className="space-y-2 pt-1 border-t border-gray-700">
                            <div>
                                <label htmlFor="severity" className="block text-xs mb-1">Severity Level</label>
                                <select
                                    id="severity"
                                    name="severity"
                                    value={filters.severity}
                                    onChange={handleChange}
                                    className="search-input w-full"
                                >
                                    {severityLevels.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label htmlFor="start" className="block text-xs mb-1">Start Date</label>
                                    <input
                                        type="date"
                                        id="start"
                                        name="start"
                                        value={filters.dateRange.start}
                                        onChange={handleChange}
                                        className="search-input w-full"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="end" className="block text-xs mb-1">End Date</label>
                                    <input
                                        type="date"
                                        id="end"
                                        name="end"
                                        value={filters.dateRange.end}
                                        onChange={handleChange}
                                        className="search-input w-full"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Search Actions and Tips */}
                <div className="pt-2 border-t border-gray-700 space-y-2">
                    <div className="flex justify-between items-center">
                        <button type="button" onClick={handleReset} className="search-button">
                            Reset Filters
                        </button>
                        <button type="submit" className="search-button">
                            Search
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
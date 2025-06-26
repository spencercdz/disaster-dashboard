"use client";

import { useState } from 'react';
import { Tweet } from '../app/types/tweet';

interface SearchProps {
    onTweetsFetched: (tweets: any[]) => void;
}

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

export default function ContainerSearch({ onTweetsFetched }: SearchProps) {
    const [country, setCountry] = useState('Myanmar');
    const [disasterType, setDisasterType] = useState('earthquake');
    const [year, setYear] = useState('2025');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (!country || !disasterType || !year) {
            setError('Please fill in all fields.');
            return;
        }
        setLoading(true);
        try {
            const query = `${country.trim()} ${disasterType.trim()} ${year.trim()}`;
            const res = await fetch(`/api/tweets?query=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error('Failed to fetch tweets');
            const data = await res.json();
            onTweetsFetched(data);
        } catch (err: any) {
            setError(err.message || 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container-default h-full flex flex-col overflow-hidden">
            <form onSubmit={handleSearch} className="flex flex-row items-end gap-2">
                <div className="flex flex-col flex-1">
                    <label htmlFor="country" className="block text-xs mb-1">Country</label>
                    <input
                        type="text"
                        id="country"
                        name="country"
                        value={country}
                        onChange={e => setCountry(e.target.value)}
                        className="search-input w-full h-10"
                    />
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="disasterType" className="block text-xs mb-1">Disaster Type</label>
                    <select
                        id="disasterType"
                        name="disasterType"
                        value={disasterType}
                        onChange={e => setDisasterType(e.target.value)}
                        className="search-input w-full h-10"
                    >
                        {disasterTypes.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex flex-col flex-1">
                    <label htmlFor="year" className="block text-xs mb-1">Year</label>
                    <select
                        id="year"
                        name="year"
                        value={year}
                        onChange={e => setYear(e.target.value)}
                        className="search-input w-full h-10"
                    >
                        {years.map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
                <button type="submit" className="search-button text-xs h-10 min-w-[80px]" disabled={loading}>
                    {loading ? 'Searching...' : 'Search'}
                </button>
            </form>
            {error && <div className="text-red-400 mt-2">{error}</div>}
        </div>
    );
}
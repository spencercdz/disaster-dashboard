export default function Search() {
    return (
        <div className = "flex container-default flex-col h-full">
            <div className="mb-2">
                <h1 className="text-1xl font-bold">Search</h1>
            </div>
            <div className="flex space-x-4">
                <input type="text" placeholder="Country" className="search-input" />
                <input type="text" placeholder="Disaster Type" className="search-input" />
                <input type="text" placeholder="Year" className="search-input" />
                <button className="search-button whitespace-nowrap">Search</button>
            </div>
        </div>
    )
}
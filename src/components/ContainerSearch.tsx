export default function Search() {
    return (
        <div className = "flex container-default justify-between h-full">
            <div>
                <h1 className="text-1xl font-bold">Search</h1>
            </div>
            <div>
                <input type="text" placeholder="Country" className="search-input" />
                <input type="text" placeholder="Disaster Type" className="search-input" />
                <input type="text" placeholder="Year" className="search-input" />
            </div>
            <div>
                <button className="search-button">Search</button>
            </div>
        </div>
    )
}
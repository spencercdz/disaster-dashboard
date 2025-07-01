'use client';

import { useEffect, useRef, useMemo } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Map() {
    // References for the map container and map instance with proper types
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<maplibregl.Map | null>(null);
    
    // Myanmar coordinates with proper type
    const myanmarCoordinates = useMemo<[number, number]>(() => [95.9560, 21.9162], []);
    const myanmarZoomLevel: number = 4.5;

    useEffect(() => {
        // Prevent re-initialization if map already exists
        if (map.current) return;
        if (!mapContainer.current) return;

        // Initialize the map
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    // Terrain map tiles from Thunderforest
                    'terrain-tiles': {
                        type: 'raster',
                        tiles: ['https://tile.thunderforest.com/outdoors/{z}/{x}/{y}.png?apikey=6170aad10dfd42a38d4d8c709a536f38'],
                        tileSize: 256
                        // Attribution removed as requested
                    },
                    // Hillshade for terrain elevation
                    'hillshade': {
                        type: 'raster-dem',
                        tiles: ['https://demotiles.maplibre.org/terrain-tiles/{z}/{x}/{y}.png'],
                        tileSize: 256,
                        maxzoom: 14
                    }
                },
                
                layers: [
                    // Background layer
                    {
                        id: 'background',
                        type: 'background',
                        paint: {
                            'background-color': '#222222'
                        }
                    },
                    // Main terrain layer
                    {
                        id: 'terrain-tiles',
                        type: 'raster',
                        source: 'terrain-tiles',
                        minzoom: 0,
                        maxzoom: 19,
                        paint: {
                            'raster-opacity': 0.9,
                            'raster-contrast': 0.3,
                            'raster-saturation': 0.3,
                            'raster-brightness-min': 0.4,
                            'raster-brightness-max': 1.0
                        }
                    },
                    // Hillshade layer for terrain visualization
                    {
                        id: 'hillshade',
                        type: 'hillshade',
                        source: 'hillshade',
                        layout: {visibility: 'visible'},
                        paint: {
                            'hillshade-shadow-color': '#473B24',
                            'hillshade-highlight-color': '#FFFFFF',
                            'hillshade-accent-color': '#5E4322',
                            'hillshade-illumination-direction': 335,
                            'hillshade-exaggeration': 0.5
                        }
                    }
                ],
                glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
            },
            center: myanmarCoordinates,
            zoom: myanmarZoomLevel,
            attributionControl: false
        });
        
        // Create a custom center map control with proper types
        class CenterMapControl implements maplibregl.IControl {
            _map: maplibregl.Map | undefined;
            _container!: HTMLDivElement;
            
            onAdd(map: maplibregl.Map): HTMLElement {
                this._map = map;
                this._container = document.createElement('div');
                this._container.className = 'maplibregl-ctrl maplibregl-ctrl-group';
                
                const button = document.createElement('button');
                button.className = 'maplibregl-ctrl-icon center-map';
                button.innerHTML = '<span style="display:inline-block;width:20px;height:20px;text-align:center;font-weight:bold;font-size:18px;color:white;">⚲</span>';
                button.title = 'Center Map';
                button.addEventListener('click', () => {
                    if (this._map) {
                        this._map.flyTo({
                            center: myanmarCoordinates,
                            zoom: myanmarZoomLevel,
                            essential: true
                        });
                    }
                });
                
                this._container.appendChild(button);
                return this._container;
            }
            
            onRemove(): void {
                if (this._container.parentNode) {
                    this._container.parentNode.removeChild(this._container);
                }
                this._map = undefined;
            }
        }

        // Add navigation controls (zoom in/out only) at the top right
        map.current.addControl(new maplibregl.NavigationControl({
            showCompass: false,
            showZoom: true
        }), 'top-right');
        
        // Add our custom center map control at the bottom right
        map.current.addControl(new CenterMapControl(), 'bottom-right');

        // Cleanup function to remove the map when component unmounts
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, [myanmarCoordinates]);

    return (
        <div className="flex container-default flex-col h-full">
            <div className="mb-2">
                <h1 className="text-1xl font-bold">World Map</h1>
            </div>
            <div 
                ref={mapContainer} 
                className="w-full flex-1 min-h-[300px] rounded-md overflow-hidden"
                style={{ position: 'relative' }}
            />
        </div>
    );
}
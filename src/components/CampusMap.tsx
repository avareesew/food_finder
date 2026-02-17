'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

export default function CampusMap() {
    const mapContainerRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<L.Map | null>(null);

    useEffect(() => {
        if (!mapContainerRef.current || mapInstanceRef.current) return;

        // Initialize Map
        const map = L.map(mapContainerRef.current, {
            center: [40.2483, -111.6493], // BYU (roughly TMCB/Wilk area)
            zoom: 16,
            scrollWheelZoom: false,
            zoomControl: false, // Keep it clean
            attributionControl: false // We'll add it manually if needed or keep it minimal
        });

        mapInstanceRef.current = map;

        // Add Tile Layer (CartoDB Positron)
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
        }).addTo(map);

        // Fix default icons if referenced, but we are using custom ones.
        // Custom "Hot" Icon for food events
        const hotIcon = L.divIcon({
            className: 'custom-icon',
            html: `<div style="background-color: #FF5A1F; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); display: flex; align-items: center; justify-content: center; font-size: 16px;">🍕</div>`,
            iconSize: [30, 30],
            iconAnchor: [15, 15],
            popupAnchor: [0, -15]
        });

        // Add Markers
        const pizzaMarker = L.marker([40.2485, -111.6475], { icon: hotIcon })
            .addTo(map)
            .bindPopup('<div class="text-center font-sans"><strong class="block text-[#FF5A1F] text-lg font-serif">Pizza Social</strong><span class="text-gray-500 text-xs">TMCB • Live Now</span></div>');

        L.marker([40.2497, -111.6492], { icon: hotIcon })
            .addTo(map)
            .bindPopup('<div class="text-center font-sans"><strong class="block text-[#FF5A1F] text-lg font-serif">Leftover Bagels</strong><span class="text-gray-500 text-xs">Wilk Projector Room • 15m ago</span></div>');

        // Open one popup by default
        pizzaMarker.openPopup();

        // Cleanup
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return <div ref={mapContainerRef} className="w-full h-full rounded-[3rem] z-0 outline-none focus:outline-none" style={{ background: '#f0f0f0' }} />;
}

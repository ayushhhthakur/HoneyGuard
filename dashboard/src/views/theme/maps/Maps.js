import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import API_URL from '../../../config/api.js';

// Mapbox token
mapboxgl.accessToken = 'pk.eyJ1IjoiYXNoaGh0aGFrdXIiLCJhIjoiY2x0bXBpdmE2MWY3ODJpcXZqYWwycDlndiJ9.ys7DCo22YZzs6u6eW9jf0w';

const Maps = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [ipLocations, setIpLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch IP locations
  useEffect(() => {
    const fetchIpLocations = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/fetch-ip`);
        console.log('IP Locations Response:', response.data);
        
        if (response.data.success && Array.isArray(response.data.data)) {
          // Log the total number of IPs received
          console.log('Total IPs received:', response.data.data.length);
          
          // Filter valid locations and log any invalid ones
          const validLocations = response.data.data.filter(loc => {
            const isValid = loc && 
                          typeof loc.latitude === 'number' && 
                          typeof loc.longitude === 'number' &&
                          !isNaN(loc.latitude) && 
                          !isNaN(loc.longitude) &&
                          loc.latitude !== 0 && 
                          loc.longitude !== 0;
            
            if (!isValid) {
              console.log('Invalid location data:', loc);
            }
            return isValid;
          });

          console.log('Valid locations:', validLocations);
          setIpLocations(validLocations);
          
          if (validLocations.length === 0) {
            setError('No valid IP locations found');
          } else if (validLocations.length < response.data.data.length) {
            console.log(`Filtered out ${response.data.data.length - validLocations.length} invalid locations`);
          }
        } else {
          setError('Invalid data format received from server');
        }
      } catch (error) {
        console.error('Error fetching IP locations:', error);
        setError(error.message || 'Failed to fetch IP locations');
      } finally {
        setLoading(false);
      }
    };

    fetchIpLocations();
  }, []);

  // Initialize map
  useEffect(() => {
    if (loading) return;
    if (!mapContainer.current || map.current) return;

    try {
      console.log('Initializing map...');
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v10',
        center: [0, 0],
        zoom: 1,
        pitch: 0, // Start with a flat view for better location accuracy
        bearing: 0
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      // Wait for map to load before adding markers
      map.current.on('load', () => {
        console.log('Map loaded, adding markers...');
        if (ipLocations.length > 0) {
          addMarkers();
          fitMapToMarkers();
        }
      });

    } catch (err) {
      console.error('Error initializing map:', err);
      setError('Failed to initialize map');
    }

    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading]);

  // Clear existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];
  };

  // Fit map to show all markers
  const fitMapToMarkers = () => {
    if (!map.current || ipLocations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    ipLocations.forEach(location => {
      bounds.extend([location.longitude, location.latitude]);
    });

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 15
    });
  };

  // Add markers to the map
  const addMarkers = () => {
    if (!map.current) return;

    clearMarkers();
    console.log(`Adding ${ipLocations.length} markers to the map`);

    // Group IPs by location
    const locationGroups = new Map();
    ipLocations.forEach(location => {
      const key = `${location.latitude},${location.longitude}`;
      if (!locationGroups.has(key)) {
        locationGroups.set(key, []);
      }
      locationGroups.get(key).push(location);
    });

    // Add a single marker for each unique location
    locationGroups.forEach((locations, key) => {
      const [latitude, longitude] = key.split(',').map(Number);
      console.log(`Adding marker for location [${longitude}, ${latitude}] with ${locations.length} IPs`);
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'custom-marker';
      Object.assign(el.style, {
        width: locations.length > 1 ? '20px' : '15px',
        height: locations.length > 1 ? '20px' : '15px',
        backgroundColor: locations.length > 1 ? '#ff4444' : '#ff0000',
        borderRadius: '50%',
        border: '2px solid #ffffff',
        boxShadow: '0 0 10px rgba(255, 0, 0, 0.5)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '10px',
        fontWeight: 'bold'
      });

      // Add count for multiple IPs
      if (locations.length > 1) {
        el.textContent = locations.length;
      }

      try {
        // Create popup HTML with all IPs from this location
        const popupHTML = `
          <div style="padding: 10px; max-width: 300px;">
            <h4 style="margin: 0 0 10px 0; border-bottom: 1px solid #ddd; padding-bottom: 5px;">
              ${locations.length > 1 ? `${locations.length} IPs at this Location` : 'IP Location'}
            </h4>
            <div style="max-height: 200px; overflow-y: auto;">
              ${locations.map((loc, index) => `
                <div style="margin-bottom: ${index === locations.length - 1 ? '0' : '10px'}; padding-bottom: ${index === locations.length - 1 ? '0' : '10px'}; ${index !== locations.length - 1 ? 'border-bottom: 1px solid #eee;' : ''}">
                  <p style="margin: 0; font-weight: bold;">IP: ${loc.ip_address}</p>
                  <p style="margin: 3px 0 0 0; font-size: 0.9em;">
                    ${loc.city || 'Unknown City'}, ${loc.country || 'Unknown Country'}
                  </p>
                  ${loc.isp ? `<p style="margin: 3px 0 0 0; font-size: 0.8em; color: #666;">ISP: ${loc.isp}</p>` : ''}
                </div>
              `).join('')}
            </div>
            <p style="margin: 10px 0 0 0; padding-top: 5px; border-top: 1px solid #ddd; font-size: 0.8em; color: #666;">
              Coordinates: [${longitude.toFixed(4)}, ${latitude.toFixed(4)}]
            </p>
          </div>
        `;

        // Create and store marker
        const marker = new mapboxgl.Marker({
          element: el,
          anchor: 'center'
        })
          .setLngLat([longitude, latitude])
          .setPopup(
            new mapboxgl.Popup({ 
              offset: 25,
              maxWidth: '300px'
            })
            .setHTML(popupHTML)
          )
          .addTo(map.current);

        markersRef.current.push(marker);
      } catch (error) {
        console.error(`Error adding marker for location [${longitude}, ${latitude}]:`, error);
      }
    });

    console.log(`Successfully added ${markersRef.current.length} markers to the map`);
  };

  // Update markers when ipLocations changes
  useEffect(() => {
    if (map.current && ipLocations.length > 0) {
      addMarkers();
      fitMapToMarkers();
    }
  }, [ipLocations]);

  if (loading) {
    return (
      <div className="container-fluid mt-4">
        <div className="card">
          <div className="card-body">
            <div className="text-center">Loading map data...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid mt-4">
      <div className="card">
        <div className="card-header">
          <h4>IP Address Locations</h4>
          <small>
            {error ? (
              <span className="text-danger">{error}</span>
            ) : (
              `Displaying ${ipLocations.length} IP addresses from token logs`
            )}
          </small>
        </div>
        <div className="card-body p-0" style={{ minHeight: '75vh' }}>
          <div 
            ref={mapContainer} 
            style={{
              position: 'relative',
              height: '75vh',
              width: '100%'
            }} 
          />
        </div>
      </div>
    </div>
  );
};

export default Maps;

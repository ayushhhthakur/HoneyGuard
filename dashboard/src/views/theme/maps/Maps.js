import React, { useEffect, useMemo, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import axios from 'axios';
import API_URL from '../../../config/api.js';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || '';

const themeFromDom = () => document.documentElement.getAttribute('data-coreui-theme') || 'light';

const Maps = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [totals, setTotals] = useState({ points: 0, zones: 0, red_zones: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTheme, setCurrentTheme] = useState(themeFromDom());

  const primaryLocations = useMemo(() => (zones.length > 0 ? zones : locations), [zones, locations]);

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/stats/map`);

        if (!response.data?.success) {
          throw new Error(response.data?.error || 'Failed to fetch map data');
        }

        const payload = response.data.data;
        if (Array.isArray(payload)) {
          const validLocations = payload.filter(
            (loc) => loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number' && loc.latitude !== 0 && loc.longitude !== 0
          );
          setLocations(validLocations);
          setZones([]);
          setTotals({ points: validLocations.length, zones: validLocations.length, red_zones: 0 });
        } else if (payload && Array.isArray(payload.zones)) {
          const validZones = payload.zones.filter(
            (zone) => zone && typeof zone.latitude === 'number' && typeof zone.longitude === 'number' && zone.latitude !== 0 && zone.longitude !== 0
          );
          setZones(validZones);
          setLocations(Array.isArray(payload.locations) ? payload.locations : []);
          setTotals(payload.totals || { points: validZones.length, zones: validZones.length, red_zones: 0 });
        } else {
          throw new Error('Invalid data format received from server');
        }
      } catch (fetchError) {
        setError(fetchError.message || 'Failed to fetch map data');
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'data-coreui-theme') {
          setCurrentTheme(themeFromDom());
          if (primaryLocations.length > 0) {
            clearMarkers();
            addMarkers();
          }
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-coreui-theme'] });
    return () => observer.disconnect();
  }, [primaryLocations]);

  useEffect(() => {
    if (loading) return;
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/dark-v11',
        center: [0, 20],
        zoom: 1.2,
        pitch: 0,
        bearing: 0,
      });

      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.on('load', () => {
        if (primaryLocations.length > 0) {
          addMarkers();
          fitMapToMarkers();
        }
      });
    } catch (err) {
      setError('Failed to initialize map');
      console.error('Error initializing map:', err);
    }

    return () => {
      clearMarkers();
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [loading, primaryLocations]);

  const clearMarkers = () => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];
  };

  const fitMapToMarkers = () => {
    if (!map.current || primaryLocations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    primaryLocations.forEach((point) => {
      bounds.extend([point.longitude, point.latitude]);
    });

    map.current.fitBounds(bounds, { padding: 70, maxZoom: 10 });
  };

  const markerStyleFor = (point) => {
    const count = point.ip_count || 1;
    const redZone = point.is_red_zone || count >= 3;
    return {
      size: Math.min(18 + count * 4, 40),
      backgroundColor: redZone ? '#ff2d2d' : count > 1 ? '#ff7a18' : '#f97316',
      ringColor: redZone ? 'rgba(255,45,45,0.45)' : 'rgba(249,115,22,0.35)',
    };
  };

  const addMarkers = () => {
    if (!map.current) return;

    clearMarkers();

    primaryLocations.forEach((point) => {
      const style = markerStyleFor(point);
      const el = document.createElement('div');
      el.className = 'custom-zone-marker';
      Object.assign(el.style, {
        width: `${style.size}px`,
        height: `${style.size}px`,
        backgroundColor: style.backgroundColor,
        borderRadius: '50%',
        border: '2px solid #ffffff',
        boxShadow: `0 0 0 12px ${style.ringColor}, 0 0 18px rgba(0,0,0,0.25)`,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#ffffff',
        fontSize: '11px',
        fontWeight: '700',
        letterSpacing: '0.02em',
      });

      el.textContent = String(point.ip_count || 1);

      const isDarkMode = currentTheme === 'dark';
      const zoneLabel = point.is_red_zone ? 'Red Zone' : point.ip_count > 1 ? 'Clustered Zone' : 'Single Point';
      const popupHTML = `
        <div style="padding:12px;max-width:340px;background:${isDarkMode ? '#1f2433' : '#ffffff'};color:${isDarkMode ? '#f8fafc' : '#111827'};border-radius:14px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${isDarkMode ? '#94a3b8' : '#6b7280'};">${zoneLabel}</div>
              <h4 style="margin:4px 0 0;font-size:16px;line-height:1.2;">${point.city || 'Unknown City'}, ${point.country || 'Unknown Country'}</h4>
            </div>
            <div style="padding:6px 10px;border-radius:999px;background:${style.backgroundColor};color:#fff;font-size:12px;font-weight:700;">
              ${point.ip_count || 1} IPs
            </div>
          </div>
          <div style="margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:12px;">
            <div style="padding:8px 10px;border-radius:10px;background:${isDarkMode ? '#111827' : '#f3f4f6'};">
              <div style="color:${isDarkMode ? '#94a3b8' : '#6b7280'};">Fingerprints</div>
              <div style="font-weight:700;">${point.fingerprint_count || 0}</div>
            </div>
            <div style="padding:8px 10px;border-radius:10px;background:${isDarkMode ? '#111827' : '#f3f4f6'};">
              <div style="color:${isDarkMode ? '#94a3b8' : '#6b7280'};">Events</div>
              <div style="font-weight:700;">${point.event_count || 0}</div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:${isDarkMode ? '#cbd5e1' : '#374151'};">
            <div><strong>Coordinates:</strong> [${Number(point.longitude).toFixed(4)}, ${Number(point.latitude).toFixed(4)}]</div>
            <div style="margin-top:4px;"><strong>IPs:</strong> ${(point.ip_addresses || []).join(', ')}</div>
            <div style="margin-top:4px;"><strong>Regions:</strong> ${(point.regions || []).join(', ') || 'Unknown'}</div>
            <div style="margin-top:4px;"><strong>ISPs:</strong> ${(point.isps || []).join(', ') || 'Unknown'}</div>
          </div>
        </div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: 'center' })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(new mapboxgl.Popup({ offset: 20, maxWidth: '360px' }).setHTML(popupHTML))
        .addTo(map.current);

      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (map.current && primaryLocations.length > 0) {
      addMarkers();
      fitMapToMarkers();
    }
  }, [primaryLocations]);

  const redZones = zones.filter((zone) => zone.is_red_zone);

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
      <div className="row g-3 mb-3">
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-uppercase text-muted small">Total Points</div>
              <div className="fs-3 fw-bold">{totals.points}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-uppercase text-muted small">Attack Zones</div>
              <div className="fs-3 fw-bold">{totals.zones}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-uppercase text-muted small">Red Zones</div>
              <div className="fs-3 fw-bold text-danger">{totals.red_zones}</div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card h-100">
            <div className="card-body">
              <div className="text-uppercase text-muted small">Fingerprint Hits</div>
              <div className="fs-3 fw-bold">{zones.reduce((sum, zone) => sum + (zone.fingerprint_count || 0), 0)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap gap-2">
          <div>
            <h4 className="mb-0">IP Attack Zones</h4>
            <small>{error ? <span className="text-danger">{error}</span> : 'Grouped by geolocation clusters and fingerprint activity'}</small>
          </div>
          <div className="text-end small text-muted">
            {redZones.length > 0 ? `${redZones.length} red zone${redZones.length === 1 ? '' : 's'} detected` : 'No red zones yet'}
          </div>
        </div>
        <div className="card-body p-0">
          <div className="row g-0">
            <div className="col-lg-8" style={{ minHeight: '75vh' }}>
              <div ref={mapContainer} style={{ height: '75vh', width: '100%' }} />
            </div>
            <div className="col-lg-4 border-start">
              <div className="p-3" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
                <h5 className="mb-3">Structured Zone View</h5>
                {zones.length === 0 ? (
                  <div className="text-muted">No zone data available.</div>
                ) : (
                  <div className="d-grid gap-3">
                    {zones.map((zone) => (
                      <div key={zone.zone_key} className={`p-3 rounded border ${zone.is_red_zone ? 'border-danger' : 'border-secondary'}`} style={{ background: zone.is_red_zone ? 'rgba(255, 45, 45, 0.08)' : 'rgba(255,255,255,0.02)' }}>
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <div>
                            <div className="small text-uppercase text-muted">{zone.is_red_zone ? 'Red Zone' : 'Clustered Zone'}</div>
                            <div className="fw-semibold">{zone.city || 'Unknown City'}, {zone.country || 'Unknown Country'}</div>
                          </div>
                          <span className={`badge ${zone.is_red_zone ? 'bg-danger' : 'bg-warning text-dark'}`}>{zone.ip_count} IPs</span>
                        </div>
                        <div className="small text-muted mb-2">{zone.latitude.toFixed(4)}, {zone.longitude.toFixed(4)}</div>
                        <div className="row g-2 small">
                          <div className="col-6"><strong>Hits:</strong> {zone.hit_count}</div>
                          <div className="col-6"><strong>Fps:</strong> {zone.fingerprint_count}</div>
                          <div className="col-12"><strong>IPs:</strong> {zone.ip_addresses.join(', ')}</div>
                          <div className="col-12"><strong>Regions:</strong> {zone.regions.join(', ') || 'Unknown'}</div>
                          <div className="col-12"><strong>ISPs:</strong> {zone.isps.join(', ') || 'Unknown'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maps;

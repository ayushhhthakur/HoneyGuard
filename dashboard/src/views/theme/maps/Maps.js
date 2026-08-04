import React, { useEffect, useMemo, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { statsApi } from "@/api/stats.api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

const Maps = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [totals, setTotals] = useState({ points: 0, zones: 0, red_zones: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const primaryLocations = useMemo(
    () => (zones.length > 0 ? zones : locations),
    [zones, locations],
  );

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true);
        const response = await statsApi.map();

        if (!response.data?.success) {
          throw new Error(response.data?.error || "Failed to fetch map data");
        }

        const payload = response.data.data;
        if (Array.isArray(payload)) {
          const validLocations = payload.filter(
            (loc) =>
              loc &&
              typeof loc.latitude === "number" &&
              typeof loc.longitude === "number" &&
              loc.latitude !== 0 &&
              loc.longitude !== 0,
          );
          setLocations(validLocations);
          setZones([]);
          setTotals({
            points: validLocations.length,
            zones: validLocations.length,
            red_zones: 0,
          });
        } else if (payload && Array.isArray(payload.zones)) {
          const validZones = payload.zones.filter(
            (zone) =>
              zone &&
              typeof zone.latitude === "number" &&
              typeof zone.longitude === "number" &&
              zone.latitude !== 0 &&
              zone.longitude !== 0,
          );
          setZones(validZones);
          setLocations(
            Array.isArray(payload.locations) ? payload.locations : [],
          );
          setTotals(
            payload.totals || {
              points: validZones.length,
              zones: validZones.length,
              red_zones: 0,
            },
          );
        } else {
          throw new Error("Invalid data format received from server");
        }
      } catch (fetchError) {
        setError(fetchError.message || "Failed to fetch map data");
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, []);

  useEffect(() => {
    if (loading) return;
    if (!mapContainer.current || map.current) return;

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [0, 20],
        zoom: 1.2,
        pitch: 0,
        bearing: 0,
      });

      map.current.addControl(new mapboxgl.NavigationControl());
      map.current.on("load", () => {
        if (primaryLocations.length > 0) {
          addMarkers();
          fitMapToMarkers();
        }
      });
    } catch (err) {
      setError("Failed to initialize map");
      console.error("Error initializing map:", err);
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
      backgroundColor: redZone ? "#ff2d2d" : count > 1 ? "#ff7a18" : "#f97316",
      ringColor: redZone ? "rgba(255,45,45,0.45)" : "rgba(249,115,22,0.35)",
    };
  };

  const addMarkers = () => {
    if (!map.current) return;

    clearMarkers();

    primaryLocations.forEach((point) => {
      const style = markerStyleFor(point);
      const el = document.createElement("div");
      el.className = "custom-zone-marker";
      Object.assign(el.style, {
        width: `${style.size}px`,
        height: `${style.size}px`,
        backgroundColor: style.backgroundColor,
        borderRadius: "50%",
        border: "2px solid #ffffff",
        boxShadow: `0 0 0 12px ${style.ringColor}, 0 0 18px rgba(0,0,0,0.25)`,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#ffffff",
        fontSize: "11px",
        fontWeight: "700",
        letterSpacing: "0.02em",
      });

      el.textContent = String(point.ip_count || 1);

      const isDarkMode = false;
      const zoneLabel = point.is_red_zone
        ? "Red Zone"
        : point.ip_count > 1
          ? "Clustered Zone"
          : "Single Point";
      const popupHTML = `
        <div style="padding:12px;max-width:340px;background:${isDarkMode ? "#1f2433" : "#ffffff"};color:${isDarkMode ? "#f8fafc" : "#111827"};border-radius:14px;">
          <div style="display:flex;justify-content:space-between;gap:12px;align-items:flex-start;">
            <div>
              <div style="font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:${isDarkMode ? "#94a3b8" : "#6b7280"};">${zoneLabel}</div>
              <h4 style="margin:4px 0 0;font-size:16px;line-height:1.2;">${point.city || "Unknown City"}, ${point.country || "Unknown Country"}</h4>
            </div>
            <div style="padding:6px 10px;border-radius:999px;background:${style.backgroundColor};color:#fff;font-size:12px;font-weight:700;">
              ${point.ip_count || 1} IPs
            </div>
          </div>
          <div style="margin-top:12px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:8px;font-size:12px;">
            <div style="padding:8px 10px;border-radius:10px;background:${isDarkMode ? "#111827" : "#f3f4f6"};">
              <div style="color:${isDarkMode ? "#94a3b8" : "#6b7280"};">Fingerprints</div>
              <div style="font-weight:700;">${point.fingerprint_count || 0}</div>
            </div>
            <div style="padding:8px 10px;border-radius:10px;background:${isDarkMode ? "#111827" : "#f3f4f6"};">
              <div style="color:${isDarkMode ? "#94a3b8" : "#6b7280"};">Events</div>
              <div style="font-weight:700;">${point.event_count || 0}</div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:12px;color:${isDarkMode ? "#cbd5e1" : "#374151"};">
            <div><strong>Coordinates:</strong> [${Number(point.longitude).toFixed(4)}, ${Number(point.latitude).toFixed(4)}]</div>
            <div style="margin-top:4px;"><strong>IPs:</strong> ${(point.ip_addresses || []).join(", ")}</div>
            <div style="margin-top:4px;"><strong>Regions:</strong> ${(point.regions || []).join(", ") || "Unknown"}</div>
            <div style="margin-top:4px;"><strong>ISPs:</strong> ${(point.isps || []).join(", ") || "Unknown"}</div>
          </div>
        </div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
        .setLngLat([point.longitude, point.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 20, maxWidth: "360px" }).setHTML(
            popupHTML,
          ),
        )
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
      <div className="flex justify-center py-10 text-sm text-muted-foreground">
        Loading map data...
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">
              Total Points
            </div>
            <div className="mt-1 text-2xl font-bold">{totals.points}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">
              Attack Zones
            </div>
            <div className="mt-1 text-2xl font-bold">{totals.zones}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">
              Red Zones
            </div>
            <div className="mt-1 text-2xl font-bold text-destructive">
              {totals.red_zones}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-xs uppercase text-muted-foreground">
              Fingerprint Hits
            </div>
            <div className="mt-1 text-2xl font-bold">
              {zones.reduce(
                (sum, zone) => sum + (zone.fingerprint_count || 0),
                0,
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
          <div>
            <h2 className="text-sm font-semibold">IP Attack Zones</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {error ? (
                <span className="text-destructive">{error}</span>
              ) : (
                "Grouped by geolocation clusters and fingerprint activity"
              )}
            </p>
          </div>
          <div className="text-right text-xs text-muted-foreground">
            {redZones.length > 0
              ? `${redZones.length} red zone${redZones.length === 1 ? "" : "s"} detected`
              : "No red zones yet"}
          </div>
        </div>
        <CardContent className="p-0">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-8" style={{ minHeight: "75vh" }}>
              <div
                ref={mapContainer}
                style={{ height: "75vh", width: "100%" }}
              />
            </div>
            <div className="border-t border-border lg:col-span-4 lg:border-l lg:border-t-0">
              <div
                className="p-3"
                style={{ maxHeight: "75vh", overflowY: "auto" }}
              >
                <h3 className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Structured Zone View
                </h3>
                {zones.length === 0 ? (
                  <div className="text-xs text-muted-foreground">
                    No zone data available.
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    {zones.map((zone) => (
                      <div
                        key={zone.zone_key}
                        className={cn(
                          "rounded-lg border p-3",
                          zone.is_red_zone
                            ? "border-destructive/30 bg-destructive/5"
                            : "border-border bg-muted/30",
                        )}
                      >
                        <div className="mb-2 flex items-start justify-between gap-2">
                          <div>
                            <div className="text-[10px] uppercase text-muted-foreground">
                              {zone.is_red_zone ? "Red Zone" : "Clustered Zone"}
                            </div>
                            <div className="text-xs font-semibold">
                              {zone.city || "Unknown City"},{" "}
                              {zone.country || "Unknown Country"}
                            </div>
                          </div>
                          <Badge
                            variant={
                              zone.is_red_zone ? "destructive" : "warning"
                            }
                          >
                            {zone.ip_count} IPs
                          </Badge>
                        </div>
                        <div className="mb-2 text-[11px] text-muted-foreground text-mono">
                          {zone.latitude.toFixed(4)},{" "}
                          {zone.longitude.toFixed(4)}
                        </div>
                        <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                          <div>
                            <span className="font-semibold">Hits:</span>{" "}
                            {zone.hit_count}
                          </div>
                          <div>
                            <span className="font-semibold">Fps:</span>{" "}
                            {zone.fingerprint_count}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">IPs:</span>{" "}
                            {zone.ip_addresses.join(", ")}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">Regions:</span>{" "}
                            {zone.regions.join(", ") || "Unknown"}
                          </div>
                          <div className="col-span-2">
                            <span className="font-semibold">ISPs:</span>{" "}
                            {zone.isps.join(", ") || "Unknown"}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Maps;

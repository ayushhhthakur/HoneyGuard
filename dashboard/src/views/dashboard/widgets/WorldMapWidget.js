import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Globe, ArrowRight } from "lucide-react";
import { WidgetCard } from "@/components/widgets/WidgetCard";
import { SkeletonWidget } from "@/components/widgets/Skeleton";
import { EmptyState } from "@/components/ui/AsyncStates";
import { statsApi } from "@/api/stats.api";
import { useAuth } from "@/contexts/AuthContext";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN || "";

export const WorldMapWidget = () => {
  const { activeOrg } = useAuth();
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!activeOrg) return;
    setLoading(true);
    statsApi
      .map()
      .then(({ data }) =>
        setPoints((data.data || []).filter((p) => p.latitude && p.longitude)),
      )
      .catch(() => setPoints([]))
      .finally(() => setLoading(false));
  }, [activeOrg]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current || !mapboxgl.accessToken)
      return undefined;

    mapRef.current = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [10, 20],
      zoom: 0.7,
      attributionControl: false,
      interactive: true,
      scrollZoom: false,
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    points.forEach((p) => {
      const el = document.createElement("div");
      el.style.width = "8px";
      el.style.height = "8px";
      el.style.borderRadius = "50%";
      el.style.background = "#dc2626";
      el.style.boxShadow = "0 0 0 3px rgba(220,38,38,0.15)";
      const marker = new mapboxgl.Marker(el)
        .setLngLat([p.longitude, p.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 12, closeButton: false }).setHTML(
            `<div style="font-family:Inter,sans-serif;font-size:12px;color:#111">${p.city || "Unknown"}, ${p.country || "Unknown"}<br/><span style="font-family:monospace">${p.ip_address}</span></div>`,
          ),
        );
      if (map) marker.addTo(map);
      markersRef.current.push(marker);
    });
  }, [points]);

  const noToken = !mapboxgl.accessToken;
  const hidden = loading || noToken || points.length === 0;

  return (
    <WidgetCard
      title="World Map"
      icon={Globe}
      actions={
        <a
          href="#/utils/maps"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
        >
          Full view <ArrowRight className="h-3 w-3" />
        </a>
      }
      bodyClassName="p-0"
    >
      {loading ? (
        <div className="p-3.5">
          <SkeletonWidget rows={2} />
        </div>
      ) : noToken ? (
        <div className="p-3.5">
          <EmptyState>Set VITE_MAPBOX_TOKEN to enable the live map.</EmptyState>
        </div>
      ) : points.length === 0 ? (
        <div className="p-3.5">
          <EmptyState>No geolocated attacker traffic yet.</EmptyState>
        </div>
      ) : null}
      <div
        ref={containerRef}
        className="h-[220px]"
        style={{ display: hidden ? "none" : "block" }}
      />
    </WidgetCard>
  );
};

export default WorldMapWidget;

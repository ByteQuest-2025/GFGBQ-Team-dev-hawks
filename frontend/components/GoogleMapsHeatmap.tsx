"use client";

import { useMemo } from "react";
import { GoogleMap, LoadScript, HeatmapLayer } from "@react-google-maps/api";
import { Card, CardContent } from "@/components/ui/card";

interface HeatmapPoint {
  lat: number;
  lng: number;
  weight: number;
  count: number;
}

interface GoogleMapsHeatmapProps {
  heatmapData: HeatmapPoint[];
  apiKey: string;
  center?: { lat: number; lng: number };
  zoom?: number;
}

const containerStyle = {
  width: "100%",
  height: "100%",
};

const defaultCenter = {
  lat: 28.6139, // Default to India center (can be adjusted)
  lng: 77.2090,
};

const defaultZoom = 11;

export function GoogleMapsHeatmap({
  heatmapData,
  apiKey,
  center = defaultCenter,
  zoom = defaultZoom,
}: GoogleMapsHeatmapProps) {
  // Format heatmap data - using plain objects instead of LatLng for better compatibility
  const heatmapDataFormatted = useMemo(() => {
    return heatmapData.map((point) => ({
      location: { lat: point.lat, lng: point.lng },
      weight: point.weight * point.count, // Weight based on severity and count
    }));
  }, [heatmapData]);

  const gradient = [
    "rgba(0, 255, 255, 0)",
    "rgba(0, 255, 255, 1)",
    "rgba(0, 191, 255, 1)",
    "rgba(0, 127, 255, 1)",
    "rgba(0, 63, 255, 1)",
    "rgba(0, 0, 255, 1)",
    "rgba(0, 0, 223, 1)",
    "rgba(0, 0, 191, 1)",
    "rgba(0, 0, 159, 1)",
    "rgba(0, 0, 127, 1)",
    "rgba(63, 0, 91, 1)",
    "rgba(127, 0, 63, 1)",
    "rgba(191, 0, 31, 1)",
    "rgba(255, 0, 0, 1)",
  ];

  return (
    <Card className="w-full h-[350px] overflow-hidden">
      <CardContent className="p-0 h-full">
        <LoadScript googleMapsApiKey={apiKey}>
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={center}
            zoom={zoom}
            options={{
              mapTypeId: "roadmap",
              styles: [
                {
                  featureType: "poi",
                  elementType: "labels",
                  stylers: [{ visibility: "off" }],
                },
              ],
            }}
          >
            {heatmapDataFormatted.length > 0 && (
              <HeatmapLayer
                data={heatmapDataFormatted}
                options={{
                  radius: 20,
                  opacity: 0.6,
                  gradient: gradient,
                }}
              />
            )}
          </GoogleMap>
        </LoadScript>
      </CardContent>
    </Card>
  );
}


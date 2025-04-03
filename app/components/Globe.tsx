/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from "react-simple-maps";
import { scaleLinear } from "d3-scale";

const geoUrl = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";

// Random city coordinates for verification markers
const cities = [
  { name: "New York", coordinates: [-74.006, 40.7128] },
  { name: "London", coordinates: [-0.1278, 51.5074] },
  { name: "Tokyo", coordinates: [139.6917, 35.6895] },
  { name: "Lagos", coordinates: [3.3792, 6.5244] },
  { name: "Berlin", coordinates: [13.405, 52.52] },
  { name: "Mumbai", coordinates: [72.8777, 19.076] },
  { name: "São Paulo", coordinates: [-46.6333, -23.5505] },
  { name: "Sydney", coordinates: [151.2093, -33.8688] },
];

const Globe = () => {
  const [markers, setMarkers] = useState<{ coordinates: [number, number] }[]>(
    []
  );
  const [hovered, setHovered] = useState<number | null>(null);

  // Generate random markers
  useEffect(() => {
    const generateMarkers = () => {
      const count = 3 + Math.floor(Math.random() * 5);
      const newMarkers = [];

      for (let i = 0; i < count; i++) {
        const city = cities[Math.floor(Math.random() * cities.length)];
        // Add slight randomness to the position
        const randomOffset = () => (Math.random() - 0.5) * 5;
        newMarkers.push({
          coordinates: [
            city.coordinates[0] + randomOffset(),
            city.coordinates[1] + randomOffset(),
          ] as [number, number],
        });
      }

      setMarkers(newMarkers);
    };

    generateMarkers();
    const interval = setInterval(generateMarkers, 3000);
    return () => clearInterval(interval);
  }, []);

  const colorScale = scaleLinear<string>()
    .domain([0, 1])
    .range(["#ffedea", "#ff5233"]);

  return (
    <div className="w-full h-full relative">
      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{
          rotate: [-10, -30, 0],
          scale: 220,
        }}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "1rem",
          backgroundColor: "#f8fafc",
          //   boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        }}
      >
        <ZoomableGroup center={[0, 0]} zoom={1}>
          <Geographies geography={geoUrl}>
            {({ geographies }: { geographies: any[] }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#DDD"
                  stroke="#FFF"
                  strokeWidth={0.5}
                  style={{
                    default: { outline: "none" },
                    hover: { fill: "#EEE", outline: "none" },
                    pressed: { fill: "#EEE", outline: "none" },
                  }}
                />
              ))
            }
          </Geographies>
          {markers.map((marker, index) => (
            <Marker key={index} coordinates={marker.coordinates}>
              <g
                onMouseEnter={() => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
              >
                <circle
                  r={6}
                  fill={colorScale(Math.random())}
                  stroke="#fff"
                  strokeWidth={2}
                  style={{
                    animation: "pulse 2s infinite",
                    cursor: "pointer",
                  }}
                />
                {hovered === index && (
                  <text
                    textAnchor="middle"
                    y={-15}
                    style={{
                      fontFamily: "system-ui",
                      fill: "#333",
                      fontSize: "12px",
                      fontWeight: "bold",
                      backgroundColor: "white",
                      padding: "2px 6px",
                      borderRadius: "4px",
                      //   boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    }}
                  >
                    Verification Active
                  </text>
                )}
              </g>
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Add CSS for pulse animation */}
      <style jsx global>{`
        @keyframes pulse {
          0% {
            transform: scale(0.95);
            opacity: 0.8;
          }
          50% {
            transform: scale(1.1);
            opacity: 1;
          }
          100% {
            transform: scale(0.95);
            opacity: 0.8;
          }
        }
      `}</style>
    </div>
  );
};

export default Globe;

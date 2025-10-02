/**
 * Cluster Label Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/advanced-use-cases-cluster-label--story
 *
 * Demonstrates:
 * - Loading JSON graph data with cluster information (euroSIS - European research institutes)
 * - Leaflet map integration showing European geography in the background
 * - Mapping countries to geographic coordinates (lat/lng)
 * - Calculating cluster barycenters (center points) for each country
 * - Generating color palettes with iwanthue
 * - Custom DOM overlays that sync with camera movement
 * - Node sizing based on degree
 * - Rendering cluster labels at calculated positions
 */

import { useEffect, useState } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import { MultiGraph } from "graphology";
import type { SerializedGraph, Attributes } from "graphology-types";
import iwanthue from "iwanthue";
import { SigmaContainer } from "@/components/SigmaContainer";
import bindLeafletLayer from "@sigma/layer-leaflet";
import "@react-sigma/core/lib/style.css";
import "leaflet/dist/leaflet.css";
import euroSISData from "@/data/graphs/euroSIS.json";
import "./cluster-label.css";

const SETTINGS = {
  renderLabels: false, // Hide node labels to focus on cluster labels
  defaultNodeColor: "#999",
  defaultEdgeColor: "#e0e0e0",
};

// Geographic coordinates (lat/lng) for each country's center
const COUNTRY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  "Armenia": { lat: 40.0691, lng: 45.0382 },
  "Belgium": { lat: 50.5039, lng: 4.4699 },
  "Bulgaria": { lat: 42.7339, lng: 25.4858 },
  "Czech Republic": { lat: 49.8175, lng: 15.473 },
  "Estonia": { lat: 58.5953, lng: 25.0136 },
  "Finland": { lat: 61.9241, lng: 25.7482 },
  "France": { lat: 46.2276, lng: 2.2137 },
  "Hungary": { lat: 47.1625, lng: 19.5033 },
  "International": { lat: 50.8503, lng: 4.3517 }, // Brussels (EU capital)
  "Italy": { lat: 41.8719, lng: 12.5674 },
  "Montenegro": { lat: 42.7087, lng: 19.3744 },
  "Poland": { lat: 51.9194, lng: 19.1451 },
  "Portugal": { lat: 39.3999, lng: -8.2245 },
};

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

// Cluster interface matching vanilla example
interface Cluster {
  label: string;
  x: number;
  y: number;
  color: string;
  positions: { x: number; y: number }[];
}

// Node attributes from euroSIS.json
interface NodeAttributes {
  key: string;
  label: string;
  country: string;
  x: number;
  y: number;
  [key: string]: unknown;
}

// Component to load cluster graph and calculate cluster positions
const LoadClusterGraph: FC<{ onClustersReady: (clusters: Record<string, Cluster>) => void }> = ({ onClustersReady }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    const data = euroSISData as unknown as SerializedGraph<NodeAttributes>;

    // The euroSIS.json file contains duplicate undirected edges (e.g., both 1039→1040 and 1040→1039)
    // We need to import into MultiGraph first, then manually deduplicate edges

    // Step 1: Import into MultiGraph (accepts duplicates during import)
    const multiGraph = new MultiGraph();
    multiGraph.import(data);

    // Step 2: Create clean simple Graph for better performance
    const graph = new Graph();

    // Step 3: Copy all nodes with their attributes
    multiGraph.forEachNode((node, attributes) => {
      graph.addNode(node, attributes);
    });

    // Step 4: Copy edges, deduplicating undirected edges
    const addedEdges = new Set<string>();
    multiGraph.forEachEdge((_edge, attributes, source, target) => {
      // Create a canonical edge key (sorted to handle undirected duplicates)
      const edgeKey = [source, target].sort().join("-");
      if (!addedEdges.has(edgeKey)) {
        addedEdges.add(edgeKey);
        graph.addEdge(source, target, attributes);
      }
    });

    // Initialize clusters from graph data
    const countryClusters: Record<string, Cluster> = {};
    graph.forEachNode((_node, atts) => {
      if (!countryClusters[atts.country]) {
        countryClusters[atts.country] = {
          label: atts.country,
          positions: [],
          x: 0,
          y: 0,
          color: "",
        };
      }
    });

    // Create and assign one color per cluster using iwanthue
    const palette = iwanthue(Object.keys(countryClusters).length, { seed: "eurSISCountryClusters" });
    for (const country in countryClusters) {
      countryClusters[country].color = palette.pop() || "#999";
    }

    // Change node appearance and collect positions
    graph.forEachNode((node, atts) => {
      const cluster = countryClusters[atts.country];

      // Node color depends on the cluster it belongs to
      graph.setNodeAttribute(node, "color", cluster.color);

      // Node size depends on its degree
      const size = Math.sqrt(graph.degree(node)) / 2;
      graph.setNodeAttribute(node, "size", size);

      // Store cluster's nodes positions to calculate cluster label position
      cluster.positions.push({ x: atts.x, y: atts.y });
    });

    // Calculate the cluster's nodes barycenter (center point) to use as cluster label position
    for (const country in countryClusters) {
      const cluster = countryClusters[country];
      cluster.x = cluster.positions.reduce((acc, p) => acc + p.x, 0) / cluster.positions.length;
      cluster.y = cluster.positions.reduce((acc, p) => acc + p.y, 0) / cluster.positions.length;
    }

    loadGraph(graph);
    onClustersReady(countryClusters);
    graphLoaded = true;
  }, [loadGraph, onClustersReady]);

  return null;
};

// Component for rendering cluster labels that sync with camera position
const ClusterLabels: FC<{ clusters: Record<string, Cluster> | null; showLabels: boolean }> = ({ clusters, showLabels }) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [labelPositions, setLabelPositions] = useState<Record<string, { x: number; y: number }>>({});

  // Update label positions whenever the camera moves
  const updateLabelPositions = () => {
    if (!clusters) return;

    const newPositions: Record<string, { x: number; y: number }> = {};
    for (const country in clusters) {
      const cluster = clusters[country];
      // Convert graph coordinates to viewport (screen) coordinates
      const viewportPos = sigma.graphToViewport({ x: cluster.x, y: cluster.y });
      newPositions[country] = viewportPos;
    }
    setLabelPositions(newPositions);
  };

  // Update positions on initial render and after every render
  useEffect(() => {
    if (!clusters) return;

    updateLabelPositions();

    // Register afterRender event to keep labels synced with camera
    registerEvents({
      afterRender: updateLabelPositions,
    });
  }, [clusters, sigma, registerEvents]);

  if (!clusters || !showLabels) return null;

  return (
    <div className="cluster-labels-overlay">
      {Object.entries(clusters).map(([country, cluster]) => {
        const pos = labelPositions[country];
        if (!pos) return null;

        return (
          <div
            key={country}
            className="cluster-label"
            style={{
              top: pos.y,
              left: pos.x,
              color: cluster.color,
            }}
          >
            {cluster.label}
          </div>
        );
      })}
    </div>
  );
};

// Component to bind Leaflet map layer
const LeafletMapLayer: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    // Bind Leaflet layer with custom lat/lng mapping based on country
    const { clean } = bindLeafletLayer(sigma, {
      getNodeLatLng: (attrs: Attributes) => {
        const coords = COUNTRY_COORDINATES[attrs.country as string];
        if (!coords) {
          console.warn(`No coordinates found for country: ${attrs.country}`);
          return { lat: 50, lng: 10 }; // Default to center of Europe
        }
        return coords;
      },
      tileLayer: {
        urlTemplate: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    });

    // Cleanup on unmount
    return () => {
      clean();
    };
  }, [sigma]);

  return null;
};

// Legend component showing all clusters with their colors
const ClusterLegend: FC<{ clusters: Record<string, Cluster> | null; showLabels: boolean; onToggleLabels: () => void }> = ({
  clusters,
  showLabels,
  onToggleLabels,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!clusters) return null;

  const sortedClusters = Object.values(clusters).sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className={`cluster-legend ${isExpanded ? 'expanded' : 'collapsed'}`}>
      {/* Header */}
      <div className={`cluster-legend-header ${isExpanded ? 'expanded' : 'collapsed'}`}>
        <h3 className="cluster-legend-title">
          Countries ({sortedClusters.length})
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="cluster-legend-toggle"
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {isExpanded && (
        <div className="cluster-legend-content">
          {/* Toggle labels button */}
          <button
            onClick={onToggleLabels}
            className={`cluster-legend-button ${showLabels ? 'active' : 'inactive'}`}
          >
            {showLabels ? "Hide" : "Show"} Cluster Labels
          </button>

          {/* Cluster list */}
          <div className="cluster-list">
            {sortedClusters.map((cluster) => (
              <div key={cluster.label} className="cluster-list-item">
                <div
                  className="cluster-color-swatch"
                  style={{ background: cluster.color }}
                />
                <span className="cluster-label-text">{cluster.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main component
export const ClusterLabel: FC = () => {
  const [clusters, setClusters] = useState<Record<string, Cluster> | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  return (
    <div className="cluster-label-container">
      <SigmaContainer className="cluster-label-sigma-container" settings={SETTINGS}>
        <LoadClusterGraph onClustersReady={setClusters} />
        <LeafletMapLayer />
        <ClusterLabels clusters={clusters} showLabels={showLabels} />
      </SigmaContainer>
      <ClusterLegend
        clusters={clusters}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />
    </div>
  );
};

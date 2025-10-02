/**
 * Cluster Label Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/advanced-use-cases-cluster-label--story
 *
 * Demonstrates:
 * - Loading JSON graph data with cluster information
 * - Calculating cluster barycenters (center points)
 * - Generating color palettes with iwanthue
 * - Custom DOM overlays that sync with camera movement
 * - Node sizing based on degree
 * - Rendering cluster labels at calculated positions
 */

import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import { MultiGraph } from "graphology";
import type { SerializedGraph } from "graphology-types";
import iwanthue from "iwanthue";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";

const SETTINGS = {
  renderLabels: false, // Hide node labels to focus on cluster labels
  defaultNodeColor: "#999",
  defaultEdgeColor: "#e0e0e0",
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

    let cancelled = false;

    // Fetch euroSIS.json file from public folder
    fetch("/euroSIS.json")
      .then((res) => res.json())
      .then((data: SerializedGraph<NodeAttributes>) => {
        if (cancelled) return;

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
        multiGraph.forEachEdge((edge, attributes, source, target) => {
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
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error loading euroSIS.json:", error);
        // Create a simple fallback graph if file loading fails
        const fallbackGraph = new Graph();
        fallbackGraph.addNode("1", { x: 0, y: 0, size: 10, label: "Error loading data", color: "#ff0000" });
        loadGraph(fallbackGraph);
        graphLoaded = true;
      });

    return () => {
      cancelled = true;
    };
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
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none", // Allow clicks to pass through to the graph
        zIndex: 1,
      }}
    >
      {Object.entries(clusters).map(([country, cluster]) => {
        const pos = labelPositions[country];
        if (!pos) return null;

        return (
          <div
            key={country}
            style={{
              position: "absolute",
              top: pos.y,
              left: pos.x,
              transform: "translate(-50%, -50%)", // Center the label on the point
              color: cluster.color,
              fontSize: "18px",
              fontWeight: "700",
              fontFamily: "system-ui, -apple-system, sans-serif",
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              textShadow: "0 0 4px rgba(255,255,255,0.9), 0 0 8px rgba(255,255,255,0.7), 0 1px 2px rgba(0,0,0,0.3)",
              whiteSpace: "nowrap",
              transition: "opacity 0.2s",
              opacity: 0.95,
              WebkitFontSmoothing: "antialiased",
            }}
          >
            {cluster.label}
          </div>
        );
      })}
    </div>
  );
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
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "white",
        padding: isExpanded ? "16px" : "12px",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        maxHeight: "calc(100vh - 100px)",
        overflowY: "auto",
        fontFamily: "system-ui, -apple-system, sans-serif",
        minWidth: "200px",
        maxWidth: "280px",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: isExpanded ? "12px" : "0",
        }}
      >
        <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "600", color: "#111" }}>
          Countries ({sortedClusters.length})
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "18px",
            padding: "4px",
            color: "#666",
          }}
        >
          {isExpanded ? "▼" : "▶"}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Toggle labels button */}
          <button
            onClick={onToggleLabels}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginBottom: "12px",
              fontSize: "13px",
              fontWeight: "500",
              color: showLabels ? "#fff" : "#666",
              background: showLabels ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" : "#f0f0f0",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            {showLabels ? "Hide" : "Show"} Cluster Labels
          </button>

          {/* Cluster list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {sortedClusters.map((cluster) => (
              <div
                key={cluster.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontSize: "13px",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "3px",
                    background: cluster.color,
                    flexShrink: 0,
                    boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  }}
                />
                <span style={{ color: "#333" }}>{cluster.label}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

// Main component
export const ClusterLabel: FC = () => {
  const [clusters, setClusters] = useState<Record<string, Cluster> | null>(null);
  const [showLabels, setShowLabels] = useState(true);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadClusterGraph onClustersReady={setClusters} />
        <ClusterLabels clusters={clusters} showLabels={showLabels} />
      </SigmaContainerWithCleanup>
      <ClusterLegend
        clusters={clusters}
        showLabels={showLabels}
        onToggleLabels={() => setShowLabels(!showLabels)}
      />
    </div>
  );
};

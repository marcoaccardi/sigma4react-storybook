/**
 * Load GEXF File Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/load-gexf-file--story
 *
 * Demonstrates:
 * - Loading GEXF graph files
 * - Using graphology-gexf parser
 * - Camera controls (zoom in/out/reset)
 * - Dynamic label threshold control
 * - Async data loading with fetch
 */

import { useEffect, useState, useMemo } from "react";
import type { FC } from "react";
import { useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { MultiGraph } from "graphology";
import { parse } from "graphology-gexf/browser";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import arcticGexfText from "@/data/graphs/arctic.gexf?raw";
import "@react-sigma/core/lib/style.css";

const SETTINGS = {
  minCameraRatio: 0.08,
  maxCameraRatio: 3,
  renderLabels: true,
};

// Parse GEXF data at module level
const createGraphFromGexf = () => {
  // Parse GEXF with MultiGraph to handle duplicate edges in the file
  // (The arctic.gexf file has duplicate undirected edges like 123->124 and 124->123)
  const multiGraph = parse(MultiGraph, arcticGexfText);

  // Convert to simple Graph by deduplicating edges
  const graph = new Graph();

  // Copy all nodes with their attributes
  multiGraph.forEachNode((node, attributes) => {
    graph.addNode(node, attributes);
  });

  // Copy edges, automatically deduplicating (simple graph ignores duplicate undirected edges)
  const addedEdges = new Set<string>();
  multiGraph.forEachEdge((edge, attributes, source, target) => {
    // Create a canonical edge key (sorted to handle undirected duplicates)
    const edgeKey = [source, target].sort().join("-");
    if (!addedEdges.has(edgeKey)) {
      addedEdges.add(edgeKey);
      graph.addEdge(source, target, attributes);
    }
  });

  return graph;
};

// Component for camera zoom controls
const ZoomControls: FC = () => {
  const sigma = useSigma();

  const handleZoomIn = () => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ duration: 600 });
  };

  const handleZoomOut = () => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ duration: 600 });
  };

  const handleZoomReset = () => {
    const camera = sigma.getCamera();
    camera.animatedReset({ duration: 600 });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        background: "white",
        padding: "10px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      }}
    >
      <button
        onClick={handleZoomIn}
        style={{
          padding: "8px 16px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        +
      </button>
      <button
        onClick={handleZoomOut}
        style={{
          padding: "8px 16px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        −
      </button>
      <button
        onClick={handleZoomReset}
        style={{
          padding: "8px 16px",
          border: "1px solid #ddd",
          borderRadius: "4px",
          background: "white",
          cursor: "pointer",
          fontSize: "14px",
        }}
      >
        ⟲
      </button>
    </div>
  );
};

// Component for label threshold control
const LabelThresholdControl: FC = () => {
  const sigma = useSigma();
  const [threshold, setThreshold] = useState<number>(
    sigma.getSetting("labelRenderedSizeThreshold") || 0
  );

  const handleThresholdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(event.target.value);
    setThreshold(value);
    sigma.setSetting("labelRenderedSizeThreshold", value);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: "20px",
        left: "20px",
        background: "white",
        padding: "12px 16px",
        borderRadius: "4px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        minWidth: "250px",
      }}
    >
      <label
        style={{
          display: "block",
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: "500",
          color: "#333",
        }}
      >
        Labels Threshold: {threshold}
      </label>
      <input
        type="range"
        min="0"
        max="15"
        step="0.5"
        value={threshold}
        onChange={handleThresholdChange}
        style={{
          width: "100%",
          cursor: "pointer",
        }}
      />
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "12px",
          color: "#666",
          marginTop: "4px",
        }}
      >
        <span>More labels</span>
        <span>Fewer labels</span>
      </div>
    </div>
  );
};

// Main component
export const LoadGexfFile: FC = () => {
  const graph = useMemo(() => createGraphFromGexf(), []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS} graph={graph}>
        <ZoomControls />
        <LabelThresholdControl />
      </SigmaContainerWithCleanup>
    </div>
  );
};

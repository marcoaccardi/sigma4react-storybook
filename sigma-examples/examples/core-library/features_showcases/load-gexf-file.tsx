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

import { useState, useMemo } from "react";
import type { FC } from "react";
import { useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { MultiGraph } from "graphology";
import { parse } from "graphology-gexf/browser";
import { SigmaContainer } from "@/components/SigmaContainer";
import arcticGexfText from "@/data/graphs/arctic.gexf?raw";
import "@react-sigma/core/lib/style.css";
import "./load-gexf-file.css";

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
  multiGraph.forEachEdge((_edge, attributes, source, target) => {
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
    <div className="load-gexf-zoom-controls">
      <button onClick={handleZoomIn} className="load-gexf-zoom-button">
        +
      </button>
      <button onClick={handleZoomOut} className="load-gexf-zoom-button">
        −
      </button>
      <button onClick={handleZoomReset} className="load-gexf-zoom-button">
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
    <div className="load-gexf-threshold-control">
      <label className="load-gexf-threshold-label">
        Labels Threshold: {threshold}
      </label>
      <input
        type="range"
        min="0"
        max="15"
        step="0.5"
        value={threshold}
        onChange={handleThresholdChange}
        className="load-gexf-threshold-slider"
      />
      <div className="load-gexf-threshold-legend">
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
    <div className="load-gexf-container">
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS} graph={graph}>
        <ZoomControls />
        <LabelThresholdControl />
      </SigmaContainer>
    </div>
  );
};

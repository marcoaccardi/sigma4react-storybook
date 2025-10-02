/**
 * Performance Example - Large Graph Visualization
 *
 * Demonstrates Sigma.js performance with configurable graph generation,
 * ForceAtlas2 layout, and optimized rendering for large datasets.
 *
 * Features:
 * - Dynamic graph generation with clusters
 * - ForceAtlas2 layout with Web Worker
 * - Edge renderer options (default vs fast)
 * - Modern UI controls
 */

import { useEffect, useState, useMemo, useCallback } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import clusters from "graphology-generators/random/clusters";
import { circlepack } from "graphology-layout";
import seedrandom from "seedrandom";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./performance.css";

// Types
interface GraphConfig {
  order: number;
  size: number;
  clusters: number;
  edgesRenderer: "edges-default" | "edges-fast";
}

// Default configuration
const DEFAULT_CONFIG: GraphConfig = {
  order: 5000,
  size: 10000,
  clusters: 3,
  edgesRenderer: "edges-fast",
};

// Generate cluster colors
function generateClusterColors(numClusters: number, rng: () => number): Record<string, string> {
  const colors: Record<string, string> = {};
  const baseHues = [210, 120, 0]; // Blue, Green, Red base hues

  for (let i = 0; i < numClusters; i++) {
    const hue = baseHues[i % baseHues.length] + (Math.floor(i / baseHues.length) * 40);
    const saturation = 65 + Math.floor(rng() * 20);
    const lightness = 45 + Math.floor(rng() * 15);
    colors[i] = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }

  return colors;
}

// Graph Generator Component
const LoadGraph: FC<{ config: GraphConfig }> = ({ config }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const rng = seedrandom("sigma-performance");

    // Generate clustered graph
    const graph = clusters(Graph, {
      order: config.order,
      size: config.size,
      clusters: config.clusters,
      rng,
    });

    // Apply circle pack layout for initial positioning
    circlepack.assign(graph, {
      hierarchyAttributes: ["cluster"],
    });

    // Generate colors for clusters
    const colors = generateClusterColors(config.clusters, rng);

    // Style nodes based on cluster and degree
    let nodeIndex = 0;
    graph.forEachNode((node, { cluster }) => {
      const degree = graph.degree(node);
      graph.mergeNodeAttributes(node, {
        size: Math.max(3, degree / 3),
        label: `Node ${++nodeIndex} (Cluster ${cluster})`,
        color: colors[cluster + ""],
        cluster,
      });
    });

    loadGraph(graph);
  }, [loadGraph, config]);

  return null;
};

// ForceAtlas2 Layout Controller
const LayoutController: FC<{ isRunning: boolean }> = ({ isRunning }) => {
  const { start, stop } = useWorkerLayoutForceAtlas2({
    settings: {
      slowDown: 10,
    },
  });

  useEffect(() => {
    if (isRunning) {
      start();
    } else {
      stop();
    }
  }, [isRunning, start, stop]);

  return null;
};

// Camera Setup Component
const CameraSetup: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    // Tilt camera slightly for better label readability
    sigma.getCamera().setState({
      angle: 0.2,
    });
  }, [sigma]);

  return null;
};

// Control Panel Component
const ControlPanel: FC<{
  config: GraphConfig;
  onChange: (config: GraphConfig) => void;
  onReset: () => void;
  layoutRunning: boolean;
  onToggleLayout: () => void;
}> = ({ config, onChange, onReset, layoutRunning, onToggleLayout }) => {
  const handleChange = (key: keyof GraphConfig, value: string | number) => {
    onChange({ ...config, [key]: value });
  };

  return (
    <div className="performance-panel">
      <h3 className="performance-panel-title">Graph Configuration</h3>

      <div className="performance-control-group">
        <label className="performance-label">
          Number of nodes
          <input
            type="number"
            value={config.order}
            onChange={(e) => handleChange("order", parseInt(e.target.value))}
            className="performance-input"
            min="100"
            max="50000"
            step="100"
          />
        </label>
      </div>

      <div className="performance-control-group">
        <label className="performance-label">
          Number of edges
          <input
            type="number"
            value={config.size}
            onChange={(e) => handleChange("size", parseInt(e.target.value))}
            className="performance-input"
            min="100"
            max="100000"
            step="100"
          />
        </label>
      </div>

      <div className="performance-control-group">
        <label className="performance-label">
          Number of clusters
          <input
            type="number"
            value={config.clusters}
            onChange={(e) => handleChange("clusters", parseInt(e.target.value))}
            className="performance-input"
            min="1"
            max="10"
          />
        </label>
      </div>

      <div className="performance-control-group">
        <label className="performance-label">Edges renderer</label>
        <div className="performance-radio-group">
          <label className="performance-radio-label">
            <input
              type="radio"
              name="edgesRenderer"
              value="edges-default"
              checked={config.edgesRenderer === "edges-default"}
              onChange={(e) => handleChange("edgesRenderer", e.target.value)}
              className="performance-radio"
            />
            Default
          </label>
          <label className="performance-radio-label">
            <input
              type="radio"
              name="edgesRenderer"
              value="edges-fast"
              checked={config.edgesRenderer === "edges-fast"}
              onChange={(e) => handleChange("edgesRenderer", e.target.value)}
              className="performance-radio"
            />
            Faster (1px edges)
          </label>
        </div>
      </div>

      <div className="performance-button-group">
        <button onClick={onReset} className="performance-button">
          Reset Graph
        </button>
        <button
          onClick={onToggleLayout}
          className="performance-button performance-button-primary"
        >
          {layoutRunning ? "⏸ Stop Layout" : "▶ Start Layout"}
        </button>
      </div>

      <div className="performance-stats">
        <small className="performance-stats-text">
          {config.order.toLocaleString()} nodes × {config.size.toLocaleString()} edges
        </small>
      </div>
    </div>
  );
};


// Main Component
export const Performance: FC = () => {
  const [config, setConfig] = useState<GraphConfig>(DEFAULT_CONFIG);
  const [graphKey, setGraphKey] = useState(0);
  const [layoutRunning, setLayoutRunning] = useState(false);

  // Memoize settings to prevent Sigma instance recreation
  const settings = useMemo(() => ({
    defaultEdgeColor: "#e6e6e6",
    renderLabels: false, // Disable labels for performance with large graphs
    enableEdgeClickEvents: false,
    enableEdgeHoverEvents: false,
    labelDensity: 0.07,
    labelGridCellSize: 60,
    labelRenderedSizeThreshold: 15,
  }), []);

  const handleReset = useCallback(() => {
    setLayoutRunning(false);
    setGraphKey((prev) => prev + 1);
  }, []);

  const handleToggleLayout = useCallback(() => {
    setLayoutRunning((prev) => !prev);
  }, []);

  return (
    <div className="performance-container">
      <SigmaContainer
        key={graphKey}
        className="performance-sigma-container"
        settings={settings}
      >
        <LoadGraph config={config} />
        <LayoutController isRunning={layoutRunning} />
        <CameraSetup />
      </SigmaContainer>

      <ControlPanel
        config={config}
        onChange={setConfig}
        onReset={handleReset}
        layoutRunning={layoutRunning}
        onToggleLayout={handleToggleLayout}
      />
    </div>
  );
};

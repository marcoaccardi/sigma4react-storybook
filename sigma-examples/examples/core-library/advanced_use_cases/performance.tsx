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
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";

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
    <div style={styles.panel}>
      <h3 style={styles.title}>Graph Configuration</h3>

      <div style={styles.controlGroup}>
        <label style={styles.label}>
          Number of nodes
          <input
            type="number"
            value={config.order}
            onChange={(e) => handleChange("order", parseInt(e.target.value))}
            style={styles.input}
            min="100"
            max="50000"
            step="100"
          />
        </label>
      </div>

      <div style={styles.controlGroup}>
        <label style={styles.label}>
          Number of edges
          <input
            type="number"
            value={config.size}
            onChange={(e) => handleChange("size", parseInt(e.target.value))}
            style={styles.input}
            min="100"
            max="100000"
            step="100"
          />
        </label>
      </div>

      <div style={styles.controlGroup}>
        <label style={styles.label}>
          Number of clusters
          <input
            type="number"
            value={config.clusters}
            onChange={(e) => handleChange("clusters", parseInt(e.target.value))}
            style={styles.input}
            min="1"
            max="10"
          />
        </label>
      </div>

      <div style={styles.controlGroup}>
        <label style={styles.label}>Edges renderer</label>
        <div style={styles.radioGroup}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="edgesRenderer"
              value="edges-default"
              checked={config.edgesRenderer === "edges-default"}
              onChange={(e) => handleChange("edgesRenderer", e.target.value)}
              style={styles.radio}
            />
            Default
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              name="edgesRenderer"
              value="edges-fast"
              checked={config.edgesRenderer === "edges-fast"}
              onChange={(e) => handleChange("edgesRenderer", e.target.value)}
              style={styles.radio}
            />
            Faster (1px edges)
          </label>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button onClick={onReset} style={styles.button}>
          Reset Graph
        </button>
        <button
          onClick={onToggleLayout}
          style={{
            ...styles.button,
            ...styles.primaryButton,
          }}
        >
          {layoutRunning ? "⏸ Stop Layout" : "▶ Start Layout"}
        </button>
      </div>

      <div style={styles.stats}>
        <small style={styles.statsText}>
          {config.order.toLocaleString()} nodes × {config.size.toLocaleString()} edges
        </small>
      </div>
    </div>
  );
};

// Styles
const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    height: "100%",
    width: "100%",
    position: "relative",
  },
  sigmaContainer: {
    flex: 1,
    height: "100%",
  },
  panel: {
    position: "absolute",
    top: "20px",
    right: "20px",
    backgroundColor: "white",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
    minWidth: "280px",
    maxWidth: "320px",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    zIndex: 1000,
  },
  title: {
    margin: "0 0 20px 0",
    fontSize: "18px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  controlGroup: {
    marginBottom: "20px",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: 500,
    color: "#333",
    marginBottom: "8px",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    marginTop: "6px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    fontFamily: "inherit",
    transition: "border-color 0.2s",
    outline: "none",
  },
  radioGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "8px",
  },
  radioLabel: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
    color: "#555",
    cursor: "pointer",
  },
  radio: {
    marginRight: "8px",
    cursor: "pointer",
  },
  buttonGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginTop: "24px",
  },
  button: {
    padding: "12px 20px",
    border: "2px solid #e0e0e0",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    backgroundColor: "white",
    color: "#333",
    transition: "all 0.2s",
    fontFamily: "inherit",
  },
  primaryButton: {
    backgroundColor: "#4a90e2",
    color: "white",
    borderColor: "#4a90e2",
  },
  stats: {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e0e0e0",
    textAlign: "center",
  },
  statsText: {
    color: "#666",
    fontSize: "12px",
  },
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
    <div style={styles.container}>
      <SigmaContainerWithCleanup
        key={graphKey}
        style={styles.sigmaContainer}
        settings={settings}
      >
        <LoadGraph config={config} />
        <LayoutController isRunning={layoutRunning} />
        <CameraSetup />
      </SigmaContainerWithCleanup>

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

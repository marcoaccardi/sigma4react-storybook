/**
 * Export Image - Available Options
 *
 * Converted from Storybook vanilla JS example
 *
 * This example demonstrates:
 * - Exporting graph as image (PNG, JPEG)
 * - Various export options: layers, dimensions, format, background color
 * - Image download functionality using @sigma/export-image
 * - Force-directed layout with ForceAtlas2 algorithm
 * - Modern glassmorphism UI with collapsible controls
 */

import { useEffect, useState } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { downloadAsImage } from "@sigma/export-image";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./available-options.css";

// Color constants
const RED = "#FA4F40";
const BLUE = "#727EE0";
const GREEN = "#5DB346";

// Settings (immutable)
const SETTINGS = {
  renderEdgeLabels: true,
  renderLabels: true,
  allowInvalidContainer: true, // Prevents width errors during initial render
};

// Export options state type
interface ExportOptions {
  layers: {
    edges: boolean;
    nodes: boolean;
    edgeLabels: boolean;
    labels: boolean;
  };
  width: string;
  height: string;
  filename: string;
  format: "png" | "jpeg";
  backgroundColor: string;
  resetCameraState: boolean;
}

// Graph loader with force layout
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();

  useEffect(() => {
    const graph = new Graph();

    // Add nodes
    graph.addNode("John", { size: 15, label: "John", color: RED });
    graph.addNode("Mary", { size: 15, label: "Mary", color: RED });
    graph.addNode("Suzan", { size: 15, label: "Suzan", color: RED });
    graph.addNode("Nantes", { size: 15, label: "Nantes", color: BLUE });
    graph.addNode("New-York", { size: 15, label: "New-York", color: BLUE });
    graph.addNode("Sushis", { size: 7, label: "Sushis", color: GREEN });
    graph.addNode("Falafels", { size: 7, label: "Falafels", color: GREEN });
    graph.addNode("Kouign Amann", {
      size: 7,
      label: "Kouign Amann",
      color: GREEN,
    });

    // Add edges
    graph.addEdge("John", "Mary", {
      type: "line",
      label: "works with",
      size: 5,
    });
    graph.addEdge("Mary", "Suzan", {
      type: "line",
      label: "works with",
      size: 5,
    });
    graph.addEdge("Mary", "Nantes", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });
    graph.addEdge("John", "New-York", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });
    graph.addEdge("Suzan", "New-York", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });
    graph.addEdge("John", "Falafels", {
      type: "arrow",
      label: "eats",
      size: 5,
    });
    graph.addEdge("Mary", "Sushis", { type: "arrow", label: "eats", size: 5 });
    graph.addEdge("Suzan", "Kouign Amann", {
      type: "arrow",
      label: "eats",
      size: 5,
    });

    // Position nodes in a circle
    graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / graph.order;
      graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
      graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    });

    loadGraph(graph);

    // Start force layout
    const layout = new ForceSupervisor(graph);
    layout.start();

    return () => {
      layout.kill();
    };
  }, [loadGraph, sigma]);

  return null;
};

// Export controls component with modern UI
const ExportControls: FC = () => {
  const sigma = useSigma();
  const [isExpanded, setIsExpanded] = useState(true);
  const [options, setOptions] = useState<ExportOptions>({
    layers: {
      edges: true,
      nodes: true,
      edgeLabels: true,
      labels: true,
    },
    width: "",
    height: "",
    filename: "graph",
    format: "png",
    backgroundColor: "#ffffff",
    resetCameraState: false,
  });

  const handleExport = () => {
    const layers = Object.entries(options.layers)
      .filter(([_, enabled]) => enabled)
      .map(([layer]) => layer);

    const width = options.width ? parseInt(options.width) : undefined;
    const height = options.height ? parseInt(options.height) : undefined;

    downloadAsImage(sigma, {
      layers,
      format: options.format,
      fileName: options.filename,
      backgroundColor: options.backgroundColor,
      width: !width || isNaN(width) ? undefined : width,
      height: !height || isNaN(height) ? undefined : height,
      cameraState: options.resetCameraState
        ? { x: 0.5, y: 0.5, angle: 0, ratio: 1 }
        : undefined,
    });
  };

  const layerOptions = [
    { key: "edges" as const, label: "Edges" },
    { key: "nodes" as const, label: "Nodes" },
    { key: "edgeLabels" as const, label: "Edge Labels" },
    { key: "labels" as const, label: "Labels" },
  ];

  return (
    <div className="available-options-panel">
      {/* Header with collapse button */}
      <div className="available-options-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4 className="available-options-panel-title">🎨 Export Controls</h4>
        <span className={`available-options-chevron ${isExpanded ? "expanded" : ""}`}>
          ▼
        </span>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="available-options-panel-content">
          {/* Layers Section */}
          <div className="available-options-section">
            <div className="available-options-section-title">Layers to Export</div>
            <div className="available-options-checkbox-grid">
              {layerOptions.map(({ key, label }) => (
                <label
                  key={key}
                  htmlFor={`layer-${key}`}
                  className="available-options-checkbox-label"
                >
                  <input
                    type="checkbox"
                    id={`layer-${key}`}
                    checked={options.layers[key]}
                    onChange={(e) =>
                      setOptions({
                        ...options,
                        layers: { ...options.layers, [key]: e.target.checked },
                      })
                    }
                    className="available-options-checkbox"
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions Section */}
          <div className="available-options-section">
            <div className="available-options-section-title">Dimensions</div>
            <div className="available-options-input-row">
              <div>
                <label htmlFor="width" className="available-options-label">
                  Width
                </label>
                <input
                  type="number"
                  id="width"
                  placeholder="Auto"
                  value={options.width}
                  onChange={(e) => setOptions({ ...options, width: e.target.value })}
                  className="available-options-input"
                />
              </div>
              <div>
                <label htmlFor="height" className="available-options-label">
                  Height
                </label>
                <input
                  type="number"
                  id="height"
                  placeholder="Auto"
                  value={options.height}
                  onChange={(e) => setOptions({ ...options, height: e.target.value })}
                  className="available-options-input"
                />
              </div>
            </div>
          </div>

          {/* File Settings Section */}
          <div className="available-options-section">
            <div className="available-options-section-title">File Settings</div>
            <div className="available-options-input-group">
              <label htmlFor="filename" className="available-options-label">
                Filename
              </label>
              <input
                type="text"
                id="filename"
                value={options.filename}
                onChange={(e) => setOptions({ ...options, filename: e.target.value })}
                className="available-options-input"
              />
            </div>
            <div className="available-options-input-row">
              <div>
                <label htmlFor="format" className="available-options-label">
                  Format
                </label>
                <select
                  id="format"
                  value={options.format}
                  onChange={(e) =>
                    setOptions({ ...options, format: e.target.value as "png" | "jpeg" })
                  }
                  className="available-options-select"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
              <div>
                <label htmlFor="backgroundColor" className="available-options-label">
                  Background
                </label>
                <input
                  type="color"
                  id="backgroundColor"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    setOptions({ ...options, backgroundColor: e.target.value })
                  }
                  className="available-options-input"
                  style={{ height: "42px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* Camera Section */}
          <div className="available-options-section">
            <label
              htmlFor="resetCameraState"
              className="available-options-checkbox-label"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                id="resetCameraState"
                checked={options.resetCameraState}
                onChange={(e) =>
                  setOptions({ ...options, resetCameraState: e.target.checked })
                }
                className="available-options-checkbox"
              />
              <span>Reset camera state</span>
            </label>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="available-options-button"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Image
          </button>
        </div>
      )}
    </div>
  );
};

// Main export
export const AvailableOptions: FC = () => {
  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <ExportControls />
      </SigmaContainer>
    </div>
  );
};

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

// Modern UI Styles
const STYLES = {
  panel: {
    position: "absolute" as const,
    top: "16px",
    left: "16px",
    maxWidth: "340px",
    background: "rgba(255, 255, 255, 0.95)",
    backdropFilter: "blur(10px)",
    borderRadius: "12px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontSize: "14px",
    zIndex: 1000,
    border: "1px solid rgba(0, 0, 0, 0.08)",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 20px",
    borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
    cursor: "pointer",
    userSelect: "none" as const,
  },
  panelTitle: {
    margin: 0,
    fontSize: "16px",
    fontWeight: 600,
    color: "#1a1a1a",
  },
  panelContent: {
    padding: "20px",
  },
  section: {
    marginBottom: "20px",
  },
  sectionTitle: {
    margin: "0 0 12px 0",
    fontSize: "13px",
    fontWeight: 600,
    color: "#666",
    textTransform: "uppercase" as const,
    letterSpacing: "0.5px",
  },
  checkboxGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.2s ease",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#3b82f6",
  },
  inputGroup: {
    marginBottom: "12px",
  },
  label: {
    display: "block",
    marginBottom: "6px",
    fontSize: "13px",
    fontWeight: 500,
    color: "#444",
  },
  input: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(0, 0, 0, 0.15)",
    borderRadius: "6px",
    fontSize: "14px",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box" as const,
  },
  inputRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
  },
  select: {
    width: "100%",
    padding: "10px 12px",
    border: "1px solid rgba(0, 0, 0, 0.15)",
    borderRadius: "6px",
    fontSize: "14px",
    backgroundColor: "white",
    cursor: "pointer",
    transition: "border-color 0.2s ease, box-shadow 0.2s ease",
    boxSizing: "border-box" as const,
  },
  button: {
    width: "100%",
    padding: "14px 24px",
    background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "white",
    border: "none",
    borderRadius: "8px",
    fontSize: "15px",
    fontWeight: 600,
    cursor: "pointer",
    transition: "transform 0.2s ease, box-shadow 0.2s ease",
    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
  },
  chevron: {
    transition: "transform 0.3s ease",
    fontSize: "12px",
  },
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
    <div style={STYLES.panel}>
      {/* Header with collapse button */}
      <div style={STYLES.panelHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <h4 style={STYLES.panelTitle}>🎨 Export Controls</h4>
        <span
          style={{
            ...STYLES.chevron,
            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
          }}
        >
          ▼
        </span>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div style={STYLES.panelContent}>
          {/* Layers Section */}
          <div style={STYLES.section}>
            <div style={STYLES.sectionTitle}>Layers to Export</div>
            <div style={STYLES.checkboxGrid}>
              {layerOptions.map(({ key, label }) => (
                <label
                  key={key}
                  htmlFor={`layer-${key}`}
                  style={STYLES.checkboxLabel}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)")
                  }
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
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
                    style={STYLES.checkbox}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions Section */}
          <div style={STYLES.section}>
            <div style={STYLES.sectionTitle}>Dimensions</div>
            <div style={STYLES.inputRow}>
              <div>
                <label htmlFor="width" style={STYLES.label}>
                  Width
                </label>
                <input
                  type="number"
                  id="width"
                  placeholder="Auto"
                  value={options.width}
                  onChange={(e) => setOptions({ ...options, width: e.target.value })}
                  style={STYLES.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.15)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
              <div>
                <label htmlFor="height" style={STYLES.label}>
                  Height
                </label>
                <input
                  type="number"
                  id="height"
                  placeholder="Auto"
                  value={options.height}
                  onChange={(e) => setOptions({ ...options, height: e.target.value })}
                  style={STYLES.input}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.15)";
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* File Settings Section */}
          <div style={STYLES.section}>
            <div style={STYLES.sectionTitle}>File Settings</div>
            <div style={STYLES.inputGroup}>
              <label htmlFor="filename" style={STYLES.label}>
                Filename
              </label>
              <input
                type="text"
                id="filename"
                value={options.filename}
                onChange={(e) => setOptions({ ...options, filename: e.target.value })}
                style={STYLES.input}
                onFocus={(e) => {
                  e.target.style.borderColor = "#3b82f6";
                  e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "rgba(0, 0, 0, 0.15)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
            <div style={STYLES.inputRow}>
              <div>
                <label htmlFor="format" style={STYLES.label}>
                  Format
                </label>
                <select
                  id="format"
                  value={options.format}
                  onChange={(e) =>
                    setOptions({ ...options, format: e.target.value as "png" | "jpeg" })
                  }
                  style={STYLES.select}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#3b82f6";
                    e.target.style.boxShadow = "0 0 0 3px rgba(59, 130, 246, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "rgba(0, 0, 0, 0.15)";
                    e.target.style.boxShadow = "none";
                  }}
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPEG</option>
                </select>
              </div>
              <div>
                <label htmlFor="backgroundColor" style={STYLES.label}>
                  Background
                </label>
                <input
                  type="color"
                  id="backgroundColor"
                  value={options.backgroundColor}
                  onChange={(e) =>
                    setOptions({ ...options, backgroundColor: e.target.value })
                  }
                  style={{ ...STYLES.input, height: "42px", cursor: "pointer" }}
                />
              </div>
            </div>
          </div>

          {/* Camera Section */}
          <div style={STYLES.section}>
            <label
              htmlFor="resetCameraState"
              style={{
                ...STYLES.checkboxLabel,
                marginBottom: 0,
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)")
              }
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <input
                type="checkbox"
                id="resetCameraState"
                checked={options.resetCameraState}
                onChange={(e) =>
                  setOptions({ ...options, resetCameraState: e.target.checked })
                }
                style={STYLES.checkbox}
              />
              <span>Reset camera state</span>
            </label>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            style={STYLES.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
              e.currentTarget.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "scale(1)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.3)";
            }}
            onMouseDown={(e) => {
              e.currentTarget.style.transform = "scale(0.98)";
            }}
            onMouseUp={(e) => {
              e.currentTarget.style.transform = "scale(1.02)";
            }}
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

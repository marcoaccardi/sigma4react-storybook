/**
 * Export Image - Custom Layers and Renderers
 *
 * Converted from: https://www.sigmajs.org/storybook/
 *
 * This example demonstrates:
 * - Exporting graph with custom node renderers (NodeImageProgram)
 * - Custom WebGL layers (contours layer)
 * - Selective layer export with checkboxes
 * - Optional node image inclusion in exports
 * - Custom background color in exported images
 * - Modern glassmorphism UI with collapsible controls
 */

import { useEffect, useMemo, useState } from "react";
import type { FC } from "react";
import { useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { downloadAsPNG } from "@sigma/export-image";
import { bindWebGLLayer, createContoursProgram } from "@sigma/layer-webgl";
import { NodeImageProgram } from "@sigma/node-image";
import { DEFAULT_NODE_PROGRAM_CLASSES } from "sigma/settings";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";

// Settings
const SETTINGS = {
  defaultNodeType: "image",
  nodeProgramClasses: {
    image: NodeImageProgram,
  },
  allowInvalidContainer: true, // Prevents width errors during NodeImageProgram initialization
};

// Modern UI Styles
const STYLES = {
  panel: {
    position: "absolute" as const,
    top: "16px",
    left: "16px",
    maxWidth: "300px",
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
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badge: {
    background: "rgba(59, 130, 246, 0.1)",
    color: "#3b82f6",
    padding: "2px 8px",
    borderRadius: "10px",
    fontSize: "11px",
    fontWeight: 600,
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    cursor: "pointer",
    padding: "8px",
    borderRadius: "6px",
    transition: "background 0.2s ease",
    marginBottom: "6px",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    cursor: "pointer",
    accentColor: "#3b82f6",
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

// Create graph outside component to ensure stability
const createGraph = () => {
  const graph = new Graph();

  graph.addNode("a", {
    x: 0,
    y: 0,
    size: 20,
    label: "Jim",
    image: "https://upload.wikimedia.org/wikipedia/commons/7/7f/Jim_Morrison_1969.JPG",
  });
  graph.addNode("b", {
    x: 1,
    y: -1,
    size: 40,
    label: "Johnny",
    image: "https://upload.wikimedia.org/wikipedia/commons/a/a8/Johnny_Hallyday_%E2%80%94_Milan%2C_1973.jpg",
  });
  graph.addNode("c", {
    x: 3,
    y: -2,
    size: 20,
    label: "Jimi",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/6c/Jimi-Hendrix-1967-Helsinki-d.jpg",
  });
  graph.addNode("d", {
    x: 1,
    y: -3,
    size: 20,
    label: "Bob",
    image:
      "https://upload.wikimedia.org/wikipedia/commons/c/c5/Bob-Dylan-arrived-at-Arlanda-surrounded-by-twenty-bodyguards-and-assistants-391770740297_%28cropped%29.jpg",
  });
  graph.addNode("e", {
    x: 3,
    y: -4,
    size: 40,
    label: "Eric",
    image: "https://upload.wikimedia.org/wikipedia/commons/b/b1/Eric_Clapton_1.jpg",
  });
  graph.addNode("f", {
    x: 4,
    y: -5,
    size: 20,
    label: "Mick",
    image: "https://upload.wikimedia.org/wikipedia/commons/6/66/Mick-Jagger-1965b.jpg",
  });

  graph.addEdge("a", "b", { size: 10 });
  graph.addEdge("b", "c", { size: 10 });
  graph.addEdge("b", "d", { size: 10 });
  graph.addEdge("c", "b", { size: 10 });
  graph.addEdge("c", "e", { size: 10 });
  graph.addEdge("d", "c", { size: 10 });
  graph.addEdge("d", "e", { size: 10 });
  graph.addEdge("e", "d", { size: 10 });
  graph.addEdge("f", "e", { size: 10 });

  return graph;
};

// List of available layers (excluding internal/temporary ones)
const SKIPPED_LAYERS = new Set(["mouse", "edgeLabels", "hovers", "hoverNodes"]);

// Component to bind custom WebGL contours layer
const ContoursLayer: FC<{ graph: Graph }> = ({ graph }) => {
  const sigma = useSigma();

  useEffect(() => {
    const contoursProgram = createContoursProgram(graph.nodes(), {
      radius: 400,
      border: {
        color: "#666666",
        thickness: 8,
      },
      levels: [
        {
          color: "#00000000",
          threshold: 0.8,
        },
      ],
    });

    bindWebGLLayer("graphContour", sigma, contoursProgram);
  }, [sigma, graph]);

  return null;
};

// Export controls component with modern UI
const ExportControls: FC<{ graph: Graph }> = ({ graph }) => {
  const sigma = useSigma();
  const [isExpanded, setIsExpanded] = useState(true);
  const [allLayers, setAllLayers] = useState<string[]>([]);
  const [selectedLayers, setSelectedLayers] = useState<Set<string>>(new Set());
  const [includeImages, setIncludeImages] = useState(true);

  // Detect available layers from the sigma container
  useEffect(() => {
    const container = sigma.getContainer();
    const layers = [...container.querySelectorAll("canvas")]
      .map((layer) => (layer.className || "").replace("sigma-", ""))
      .filter((name) => name && !SKIPPED_LAYERS.has(name));

    setAllLayers(layers);
    setSelectedLayers(new Set(layers)); // All selected by default
  }, [sigma]);

  const toggleLayer = (layer: string) => {
    setSelectedLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) {
        next.delete(layer);
      } else {
        next.add(layer);
      }
      return next;
    });
  };

  const handleExport = () => {
    const contoursProgram = createContoursProgram(graph.nodes(), {
      radius: 400,
      border: {
        color: "#666666",
        thickness: 8,
      },
      levels: [
        {
          color: "#00000000",
          threshold: 0.8,
        },
      ],
    });

    downloadAsPNG(sigma, {
      layers: Array.from(selectedLayers),
      backgroundColor: "#ffffff",
      withTempRenderer: (tempRenderer) => {
        bindWebGLLayer("graphContour", tempRenderer, contoursProgram);
      },
      sigmaSettings: !includeImages
        ? { defaultNodeType: "circle", nodeProgramClasses: DEFAULT_NODE_PROGRAM_CLASSES }
        : {},
    });
  };

  const startCase = (str: string) => {
    return str.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
  };

  return (
    <div style={STYLES.panel}>
      {/* Header with collapse button */}
      <div style={STYLES.panelHeader} onClick={() => setIsExpanded(!isExpanded)}>
        <h4 style={STYLES.panelTitle}>🖼️ Export Controls</h4>
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
            <div style={STYLES.sectionTitle}>
              <span>Export Layers</span>
              <span style={STYLES.badge}>
                {selectedLayers.size}/{allLayers.length}
              </span>
            </div>
            {allLayers.map((layer) => (
              <label
                key={layer}
                htmlFor={`layer-${layer}`}
                style={STYLES.checkboxLabel}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(59, 130, 246, 0.08)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <input
                  type="checkbox"
                  id={`layer-${layer}`}
                  checked={selectedLayers.has(layer)}
                  onChange={() => toggleLayer(layer)}
                  style={STYLES.checkbox}
                />
                <span>{startCase(layer)}</span>
              </label>
            ))}
          </div>

          {/* Rendering Options Section */}
          <div style={STYLES.section}>
            <div style={STYLES.sectionTitle}>Rendering Options</div>
            <label
              htmlFor="include-images"
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
                id="include-images"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                style={STYLES.checkbox}
              />
              <span>Include node images</span>
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
            Export PNG
          </button>
        </div>
      )}
    </div>
  );
};

// Main component
export const CustomLayersAndRenderers: FC = () => {
  const graph = useMemo(() => createGraph(), []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS} graph={graph}>
        <ContoursLayer graph={graph} />
        <ExportControls graph={graph} />
      </SigmaContainer>
    </div>
  );
};

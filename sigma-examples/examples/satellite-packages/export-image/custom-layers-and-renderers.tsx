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
import "./custom-layers-and-renderers.css";

// Settings
const SETTINGS = {
  defaultNodeType: "image",
  nodeProgramClasses: {
    image: NodeImageProgram,
  },
  allowInvalidContainer: true, // Prevents width errors during NodeImageProgram initialization
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
    <div className="custom-layers-panel">
      {/* Header with collapse button */}
      <div className="custom-layers-panel-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h4 className="custom-layers-panel-title">🖼️ Export Controls</h4>
        <span className={`custom-layers-chevron ${isExpanded ? "expanded" : ""}`}>
          ▼
        </span>
      </div>

      {/* Collapsible content */}
      {isExpanded && (
        <div className="custom-layers-panel-content">
          {/* Layers Section */}
          <div className="custom-layers-section">
            <div className="custom-layers-section-title">
              <span>Export Layers</span>
              <span className="custom-layers-badge">
                {selectedLayers.size}/{allLayers.length}
              </span>
            </div>
            {allLayers.map((layer) => (
              <label
                key={layer}
                htmlFor={`layer-${layer}`}
                className="custom-layers-checkbox-label"
              >
                <input
                  type="checkbox"
                  id={`layer-${layer}`}
                  checked={selectedLayers.has(layer)}
                  onChange={() => toggleLayer(layer)}
                  className="custom-layers-checkbox"
                />
                <span>{startCase(layer)}</span>
              </label>
            ))}
          </div>

          {/* Rendering Options Section */}
          <div className="custom-layers-section">
            <div className="custom-layers-section-title">Rendering Options</div>
            <label
              htmlFor="include-images"
              className="custom-layers-checkbox-label"
              style={{ marginBottom: 0 }}
            >
              <input
                type="checkbox"
                id="include-images"
                checked={includeImages}
                onChange={(e) => setIncludeImages(e.target.checked)}
                className="custom-layers-checkbox"
              />
              <span>Include node images</span>
            </label>
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={handleExport}
            className="custom-layers-button"
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

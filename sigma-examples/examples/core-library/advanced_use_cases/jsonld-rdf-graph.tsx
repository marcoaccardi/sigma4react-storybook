/**
 * JSON-LD / RDF Graph Visualization
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/rdf-json-ld--story
 *
 * Demonstrates:
 * - Loading and parsing JSON-LD semantic data
 * - Expanding JSON-LD to full RDF graph using jsonld library
 * - Recursive graph construction from nested structures
 * - Directed multi-graph (multiple edges between same nodes)
 * - Edge labels showing predicates (relationships)
 * - ForceAtlas2 layout with web worker
 * - Knowledge graph visualization
 *
 * Example Data: Piña Colada recipe as structured data (schema.org Recipe)
 * Converts nested JSON-LD into a knowledge graph where:
 * - Nodes = Entities (Recipe, Person, HowToStep, etc.)
 * - Edges = Predicates (name, author, recipeIngredient, etc.)
 */

import { useEffect, useState } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import jsonld, { type NodeObject } from "jsonld";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./jsonld-rdf-graph.css";
import pinaColadaData from "@/data/graphs/pina-colada.jsonld";

const SETTINGS = {
  minCameraRatio: 0.08,
  maxCameraRatio: 3,
  renderEdgeLabels: true,
  edgeLabelSize: 10,
  edgeLabelColor: { color: "#666" },
  labelSize: 12,
  renderLabels: true,
  defaultEdgeType: "arrow",
};

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

// Track global ID to avoid merging nodes of the same type
let globalId = 0;

/**
 * Recursive function that parses the extended JSON-LD structure
 * and builds the graph.
 */
const parseJsonLdExtended = (item: NodeObject | string, graph: Graph): string => {
  globalId++;

  // If we just have the type, we add a unique ID to avoid merging nodes of same type
  const subjectId =
    typeof item === "object"
      ? (item as NodeObject)["@id"] ||
        (item as NodeObject)["@value"] ||
        `${(item as NodeObject)["@type"]}#${globalId}`
      : `${item}`;

  // Determine node type for styling
  const nodeType =
    typeof item === "object" && "@type" in item ? (item as NodeObject)["@type"] : "Value";

  // Color by type
  const getColorByType = (type: string | undefined): string => {
    if (!type) return "#999";
    if (typeof type !== "string") return "#999";

    const typeStr = type.toString();
    if (typeStr.includes("Recipe")) return "#3b82f6"; // blue
    if (typeStr.includes("Person")) return "#10b981"; // green
    if (typeStr.includes("HowToStep")) return "#f59e0b"; // orange
    if (typeStr.includes("Nutrition")) return "#ec4899"; // pink
    if (typeStr.includes("Rating")) return "#8b5cf6"; // purple
    if (typeStr.includes("Video")) return "#ef4444"; // red
    return "#6b7280"; // gray for values
  };

  graph.mergeNode(subjectId, {
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: 10,
    label: subjectId,
    color: getColorByType(nodeType as string),
    nodeType: nodeType,
  });

  if (typeof item === "object" && "@type" in item) {
    // For each predicate, object, we build the edge (and the subgraph if needed by recursion)
    for (const [predicate, objects] of Object.entries(item)) {
      // Skip special JSON-LD keys
      if (predicate.startsWith("@")) continue;

      if (Array.isArray(objects)) {
        for (const obj of objects) {
          if (obj !== null) {
            const objectId = parseJsonLdExtended(obj as NodeObject, graph);
            try {
              graph.addDirectedEdge(subjectId, objectId, {
                type: "arrow",
                label: predicate,
                size: 1,
              });
            } catch (e) {
              // Edge might already exist in multi-graph, that's ok
            }
          }
        }
      } else if (objects !== null && typeof objects === "object") {
        const objectId = parseJsonLdExtended(objects as NodeObject, graph);
        try {
          graph.addDirectedEdge(subjectId, objectId, {
            type: "arrow",
            label: predicate,
            size: 1,
          });
        } catch (e) {
          // Edge might already exist in multi-graph, that's ok
        }
      }
    }
  }

  return `${subjectId}`;
};

// Component to load and parse JSON-LD file
const LoadRDFGraph: FC<{ onGraphReady: (stats: { nodes: number; edges: number }) => void }> = ({ onGraphReady }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    // Reset global ID counter
    globalId = 0;

    // Process JSON-LD data
    const processData = async () => {
      // Create directed multi-graph (allows multiple edges between same nodes)
      const graph = new Graph({ type: "directed", multi: true });

      // Expand the JSON-LD to a full RDF graph
      const expanded = await jsonld.expand(pinaColadaData);

      // Parse each expanded item
      for (const item of expanded) {
        parseJsonLdExtended(item, graph);
      }

      // Load the graph
      loadGraph(graph);
      onGraphReady({ nodes: graph.order, edges: graph.size });
      graphLoaded = true;
    };

    processData().catch((error) => {
      console.error("Error loading JSON-LD:", error);

      // Create a simple fallback graph
      const fallbackGraph = new Graph();
      fallbackGraph.addNode("error", {
        x: 0,
        y: 0,
        size: 10,
        label: "Error loading RDF data",
        color: "#ff0000",
      });
      loadGraph(fallbackGraph);
      graphLoaded = true;
    });
  }, [loadGraph, onGraphReady]);

  return null;
};

// ForceAtlas2 layout controls
const ForceAtlas2Controls: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  // Guard: Don't initialize if graph is empty
  if (graph.order === 0) {
    return null;
  }

  const { start, stop, kill, isRunning } = useWorkerLayoutForceAtlas2({
    settings: forceAtlas2.inferSettings(graph),
  });

  // Auto-start layout on mount
  useEffect(() => {
    start();

    // Optional: Auto-stop after some time
    const timer = setTimeout(() => {
      stop();
    }, 10000); // Stop after 10 seconds

    return () => {
      clearTimeout(timer);
      stop();
      kill(); // Terminate web worker on cleanup
    };
  }, [start, stop, kill]);

  const handleToggle = () => {
    if (isRunning) {
      stop();
    } else {
      start();
    }
  };

  return (
    <div className="jsonld-controls-panel">
      <button
        onClick={handleToggle}
        className={`jsonld-toggle-button ${isRunning ? "running" : "stopped"}`}
      >
        {isRunning ? "⏸ Stop" : "▶ Start"} ForceAtlas2
      </button>
      <div className="jsonld-status-text">
        {isRunning ? "Layout running..." : "Layout stopped"}
      </div>
    </div>
  );
};

// Info panel explaining the example
const RDFGraphInfo: FC<{ stats: { nodes: number; edges: number } | null }> = ({ stats }) => {
  return (
    <div className="jsonld-info-panel">
      <div className="jsonld-info-title">
        🌐 JSON-LD / RDF Knowledge Graph
      </div>

      <div className="jsonld-info-description">
        This example visualizes <strong>semantic web data</strong> (JSON-LD) as a knowledge graph. A Piña Colada recipe
        is parsed into RDF triples where:
      </div>

      <ul className="jsonld-info-list">
        <li>
          <strong>Nodes</strong> = Entities (Recipe, Person, HowToStep)
        </li>
        <li>
          <strong>Edges</strong> = Predicates (relationships like "author", "ingredient")
        </li>
      </ul>

      {stats && (
        <div className="jsonld-stats-box">
          <div className="jsonld-stat-row">
            <span className="jsonld-stat-label">Nodes:</span>
            <span className="jsonld-stat-value">{stats.nodes}</span>
          </div>
          <div className="jsonld-stat-row">
            <span className="jsonld-stat-label">Edges:</span>
            <span className="jsonld-stat-value">{stats.edges}</span>
          </div>
        </div>
      )}

      <div className="jsonld-legend">
        <span className="jsonld-legend-title">Color Legend:</span>
        <div className="jsonld-legend-items">
          <span className="jsonld-legend-item">
            <div className="jsonld-legend-dot" style={{ background: "#3b82f6" }} />
            Recipe
          </span>
          <span className="jsonld-legend-item">
            <div className="jsonld-legend-dot" style={{ background: "#10b981" }} />
            Person
          </span>
          <span className="jsonld-legend-item">
            <div className="jsonld-legend-dot" style={{ background: "#f59e0b" }} />
            Step
          </span>
          <span className="jsonld-legend-item">
            <div className="jsonld-legend-dot" style={{ background: "#6b7280" }} />
            Value
          </span>
        </div>
      </div>
    </div>
  );
};

// Main component
export const JSONLDRDFGraph: FC = () => {
  const [graphStats, setGraphStats] = useState<{ nodes: number; edges: number } | null>(null);
  const [graphReady, setGraphReady] = useState(false);

  const handleGraphReady = (stats: { nodes: number; edges: number }) => {
    setGraphStats(stats);
    setGraphReady(true); // Signal that graph is ready for layout
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadRDFGraph onGraphReady={handleGraphReady} />
        {/* Only render ForceAtlas2Controls after graph is loaded */}
        {graphReady && <ForceAtlas2Controls />}
      </SigmaContainer>

      <RDFGraphInfo stats={graphStats} />
    </div>
  );
};

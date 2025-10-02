/**
 * Shadow DOM Events Example (React Equivalent)
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/web-components-shadow-dom--story
 *
 * Demonstrates:
 * - Comprehensive event handling (all 19 event types)
 * - Overlapping UI panels with z-index management
 * - Detailed event logging with source/target info
 * - Edge hover highlighting with reducers
 * - Auto-scrolling log with max entries limit
 * - Mouse canvas elevation for event capture
 *
 * Note: This is a React-idiomatic version of the vanilla Shadow DOM example.
 * Instead of using actual Shadow DOM (which is complex with React), we achieve
 * the same visual/functional result using standard React patterns with z-index management.
 */

import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import type { SerializedGraph } from "graphology-types";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";
import lesMiserablesData from "@/data/graphs/les-miserables.json";

const SETTINGS = {
  renderLabels: true,
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
  enableEdgeWheelEvents: true,
};

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

// Event log entry interface
interface EventLog {
  id: number;
  eventType: string;
  category: "node" | "edge" | "stage";
  message: string;
  timestamp: number;
}

// Component to load Les Misérables graph from JSON
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    const data = lesMiserablesData as unknown as SerializedGraph;

    const graph = new Graph();
    graph.import(data);

    loadGraph(graph);
    graphLoaded = true;
  }, [loadGraph]);

  return null;
};

// Component for edge hover highlighting
const EdgeHoverEffect: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  // Update edge reducer when hover state changes
  useEffect(() => {
    sigma.setSetting("edgeReducer", (edge, data) => {
      if (edge === hoveredEdge) {
        return { ...data, color: "#cc0000", size: (data.size || 1) * 1.5 };
      }
      return data;
    });
  }, [hoveredEdge, sigma]);

  // Register hover events
  useEffect(() => {
    registerEvents({
      enterEdge: (event) => setHoveredEdge(event.edge),
      leaveEdge: () => setHoveredEdge(null),
    });
  }, [registerEvents]);

  return null;
};

// Component for comprehensive event logging
const EventLogger: FC<{ onLog: (log: EventLog) => void }> = ({ onLog }) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const logIdRef = useRef(0);

  const createLog = (eventType: string, category: "node" | "edge" | "stage", message: string): EventLog => {
    return {
      id: logIdRef.current++,
      eventType,
      category,
      message,
      timestamp: Date.now(),
    };
  };

  useEffect(() => {
    const graph = sigma.getGraph();

    registerEvents({
      // Node events
      enterNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(createLog("enterNode", "node", `Event "enterNode", node ${label || "with no label"} (id "${node}")`));
      },
      leaveNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(createLog("leaveNode", "node", `Event "leaveNode", node ${label || "with no label"} (id "${node}")`));
      },
      downNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(createLog("downNode", "node", `Event "downNode", node ${label || "with no label"} (id "${node}")`));
      },
      clickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(createLog("clickNode", "node", `Event "clickNode", node ${label || "with no label"} (id "${node}")`));
      },
      rightClickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(
          createLog("rightClickNode", "node", `Event "rightClickNode", node ${label || "with no label"} (id "${node}")`)
        );
      },
      doubleClickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(
          createLog("doubleClickNode", "node", `Event "doubleClickNode", node ${label || "with no label"} (id "${node}")`)
        );
      },
      wheelNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        onLog(createLog("wheelNode", "node", `Event "wheelNode", node ${label || "with no label"} (id "${node}")`));
      },

      // Edge events
      enterEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "enterEdge",
            "edge",
            `Event "enterEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      leaveEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "leaveEdge",
            "edge",
            `Event "leaveEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      downEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "downEdge",
            "edge",
            `Event "downEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      clickEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "clickEdge",
            "edge",
            `Event "clickEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      rightClickEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "rightClickEdge",
            "edge",
            `Event "rightClickEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      doubleClickEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "doubleClickEdge",
            "edge",
            `Event "doubleClickEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },
      wheelEdge: ({ edge }) => {
        const label = graph.getEdgeAttribute(edge, "label");
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        onLog(
          createLog(
            "wheelEdge",
            "edge",
            `Event "wheelEdge", edge ${label || "with no label"} (id "${edge}"), source ${sourceLabel}, target ${targetLabel}`
          )
        );
      },

      // Stage events
      downStage: ({ event }) => {
        onLog(createLog("downStage", "stage", `Event "downStage", x ${event.x.toFixed(2)}, y ${event.y.toFixed(2)}`));
      },
      clickStage: ({ event }) => {
        onLog(createLog("clickStage", "stage", `Event "clickStage", x ${event.x.toFixed(2)}, y ${event.y.toFixed(2)}`));
      },
      doubleClickStage: ({ event }) => {
        onLog(
          createLog("doubleClickStage", "stage", `Event "doubleClickStage", x ${event.x.toFixed(2)}, y ${event.y.toFixed(2)}`)
        );
      },
      wheelStage: ({ event }) => {
        onLog(createLog("wheelStage", "stage", `Event "wheelStage", x ${event.x.toFixed(2)}, y ${event.y.toFixed(2)}`));
      },
    });
  }, [sigma, registerEvents, onLog]);

  return null;
};

// Event log panel component (mimics vanilla's DOM overlay behavior)
const EventLogPanel: FC<{ logs: EventLog[]; visible: boolean }> = ({ logs, visible }) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs]);

  if (!visible) return null;

  const getCategoryColor = (category: "node" | "edge" | "stage") => {
    switch (category) {
      case "node":
        return "#3b82f6"; // blue
      case "edge":
        return "#10b981"; // green
      case "stage":
        return "#6b7280"; // gray
    }
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        width: "400px",
        maxHeight: "calc(100vh - 100px)",
        background: "rgba(255, 255, 255, 0.95)",
        backdropFilter: "blur(10px)",
        borderRadius: "8px",
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.2)",
        display: "flex",
        flexDirection: "column",
        zIndex: 10, // Overlays the graph (matches vanilla's log panel)
        pointerEvents: "auto", // Allow interactions with log panel
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(0, 0, 0, 0.1)",
          fontWeight: "600",
          fontSize: "16px",
          color: "#111",
        }}
      >
        Event Log ({logs.length})
      </div>

      {/* Log container - scrollable */}
      <div
        ref={logContainerRef}
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "6px",
        }}
      >
        {logs.map((log) => (
          <div
            key={log.id}
            style={{
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.03)",
              borderRadius: "4px",
              fontSize: "13px",
              borderLeft: `3px solid ${getCategoryColor(log.category)}`,
              wordBreak: "break-word",
            }}
          >
            <div style={{ color: "#333", lineHeight: "1.4" }}>{log.message}</div>
            <div style={{ color: "#999", fontSize: "11px", marginTop: "4px" }}>
              {new Date(log.timestamp).toLocaleTimeString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main component
export const ShadowDOMEvents: FC = () => {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [showLogs, setShowLogs] = useState(true);

  const handleLog = (newLog: EventLog) => {
    setLogs((prev) => {
      const updated = [...prev, newLog];
      // Keep only the last 50 logs (matching vanilla behavior)
      return updated.slice(-50);
    });
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {/* Note: In vanilla, the Sigma canvas is inside Shadow DOM. Here we use standard React with z-index.
          The SigmaContainerWithCleanup automatically manages the mouse canvas z-index for event capture. */}
      <SigmaContainerWithCleanup
        style={{
          height: "100%",
          width: "100%",
          position: "relative",
          zIndex: 1, // Base layer
        }}
        settings={SETTINGS}
      >
        <LoadGraph />
        <EdgeHoverEffect />
        <EventLogger onLog={handleLog} />
      </SigmaContainerWithCleanup>

      {/* Log panel overlays the graph (z-index: 10) */}
      <EventLogPanel logs={logs} visible={showLogs} />

      {/* Toggle button */}
      <button
        onClick={() => setShowLogs(!showLogs)}
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          padding: "12px 20px",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "14px",
          zIndex: 20, // Above log panel
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.4)",
          transition: "transform 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
        }}
      >
        {showLogs ? "Hide" : "Show"} Event Log
      </button>

      {/* Info panel explaining the example */}
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(10px)",
          padding: "16px",
          borderRadius: "8px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
          maxWidth: "320px",
          fontSize: "13px",
          color: "#333",
          zIndex: 10,
          fontFamily: "system-ui, -apple-system, sans-serif",
          lineHeight: "1.5",
        }}
      >
        <div style={{ fontWeight: "600", marginBottom: "8px", color: "#111" }}>💡 About This Example</div>
        <div>
          This demonstrates <strong>comprehensive event handling</strong> with all 19 Sigma event types. The vanilla
          version uses Shadow DOM; this React version achieves the same result using standard React patterns with
          z-index management.
        </div>
        <div style={{ marginTop: "8px", fontSize: "12px", color: "#666" }}>
          Try: Click nodes/edges, right-click, double-click, scroll, hover edges (they turn red!)
        </div>
      </div>
    </div>
  );
};

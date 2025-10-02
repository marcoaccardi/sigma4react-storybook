/**
 * Events Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/events--story
 *
 * Demonstrates:
 * - Comprehensive event handling (node, edge, stage events)
 * - Edge hover highlighting with reducers
 * - Real-time event logging with elegant on-canvas display
 * - Loading JSON graph data
 */

import type { FC } from "react";
import { useEffect, useState } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./events.css";
import lesMiserablesData from "@/data/graphs/les-miserables.json";

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

const SETTINGS = {
  renderLabels: true,
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
  enableEdgeWheelEvents: true,
};

// Event log entry type
interface EventLog {
  id: number;
  event: string;
  type: "node" | "edge" | "stage";
  message: string;
  timestamp: number;
}

// Component to load Les Misérables graph from JSON
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    // Create graph and import JSON data
    const graph = new Graph();
    graph.import(lesMiserablesData);

    loadGraph(graph);
    graphLoaded = true;
  }, [loadGraph]);

  return null;
};

// Component to handle edge highlighting on hover
const EdgeHighlighter: FC<{ hoveredEdge: string | null }> = ({ hoveredEdge }) => {
  const sigma = useSigma();

  useEffect(() => {
    // Set edge reducer to highlight hovered edge
    sigma.setSetting("edgeReducer", (edge, data) => {
      const result = { ...data };
      if (edge === hoveredEdge) {
        result.color = "#cc0000";
        result.size = (data.size || 1) * 2;
      }
      return result;
    });
  }, [hoveredEdge, sigma]);

  return null;
};

// Component to handle all events and logging
const EventLogger: FC<{
  onEvent: (log: EventLog) => void;
  onEdgeHover: (edge: string | null) => void;
}> = ({ onEvent, onEdgeHover }) => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const graph = sigma.getGraph();

  let eventIdCounter = 0;

  const logEvent = (eventName: string, type: "node" | "edge" | "stage", message: string) => {
    onEvent({
      id: eventIdCounter++,
      event: eventName,
      type,
      message,
      timestamp: Date.now(),
    });
  };

  useEffect(() => {
    registerEvents({
      // Node events
      enterNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("enterNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      leaveNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("leaveNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      clickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("clickNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      doubleClickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("doubleClickNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      rightClickNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("rightClickNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      downNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("downNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },
      wheelNode: ({ node }) => {
        const label = graph.getNodeAttribute(node, "label");
        logEvent("wheelNode", "node", `${label || "unlabeled"} (id "${node}")`);
      },

      // Edge events
      enterEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("enterEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
        onEdgeHover(edge);
      },
      leaveEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("leaveEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
        onEdgeHover(null);
      },
      clickEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("clickEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
      },
      doubleClickEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("doubleClickEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
      },
      rightClickEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("rightClickEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
      },
      downEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("downEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
      },
      wheelEdge: ({ edge }) => {
        const source = graph.source(edge);
        const target = graph.target(edge);
        const sourceLabel = graph.getNodeAttribute(source, "label");
        const targetLabel = graph.getNodeAttribute(target, "label");
        logEvent("wheelEdge", "edge", `${sourceLabel} → ${targetLabel} (id "${edge}")`);
      },

      // Stage events (canvas interactions)
      clickStage: ({ event }) => {
        logEvent("clickStage", "stage", `x: ${event.x.toFixed(2)}, y: ${event.y.toFixed(2)}`);
      },
      doubleClickStage: ({ event }) => {
        logEvent("doubleClickStage", "stage", `x: ${event.x.toFixed(2)}, y: ${event.y.toFixed(2)}`);
      },
      rightClickStage: ({ event }) => {
        logEvent("rightClickStage", "stage", `x: ${event.x.toFixed(2)}, y: ${event.y.toFixed(2)}`);
      },
      downStage: ({ event }) => {
        logEvent("downStage", "stage", `x: ${event.x.toFixed(2)}, y: ${event.y.toFixed(2)}`);
      },
      wheelStage: ({ event }) => {
        logEvent("wheelStage", "stage", `x: ${event.x.toFixed(2)}, y: ${event.y.toFixed(2)}`);
      },
    });
  }, [registerEvents, graph, onEvent, onEdgeHover]);

  return null;
};

// Elegant event log display panel
const EventLogPanel: FC<{ logs: EventLog[] }> = ({ logs }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Get color based on event type
  const getEventColor = (type: "node" | "edge" | "stage") => {
    switch (type) {
      case "node":
        return "#3b82f6"; // blue
      case "edge":
        return "#f97316"; // orange
      case "stage":
        return "#6b7280"; // gray
    }
  };

  return (
    <div className={`events-log-panel ${isExpanded ? "expanded" : "collapsed"}`}>
      {/* Header */}
      <div
        className={`events-log-header ${isExpanded ? "expanded" : ""}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="events-log-title">
          Event Log ({logs.length})
        </div>
        <div className={`events-log-chevron ${isExpanded ? "expanded" : ""}`}>
          ▼
        </div>
      </div>

      {/* Event list */}
      {isExpanded && (
        <div className="events-log-list">
          {logs.length === 0 ? (
            <div className="events-log-empty">
              Interact with the graph to see events
            </div>
          ) : (
            logs.map((log) => (
              <div
                key={log.id}
                className={`events-log-item ${log.type}`}
              >
                <div className="events-log-event-name" style={{ color: getEventColor(log.type) }}>
                  {log.event}
                </div>
                <div className="events-log-event-message">{log.message}</div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

// Main component
export const Events: FC = () => {
  const [logs, setLogs] = useState<EventLog[]>([]);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);

  const handleEvent = (log: EventLog) => {
    setLogs((prevLogs) => {
      const newLogs = [...prevLogs, log];
      // Keep only last 50 events
      if (newLogs.length > 50) {
        return newLogs.slice(-50);
      }
      return newLogs;
    });
  };

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <EdgeHighlighter hoveredEdge={hoveredEdge} />
        <EventLogger onEvent={handleEvent} onEdgeHover={setHoveredEdge} />
        <EventLogPanel logs={logs} />
      </SigmaContainer>
    </div>
  );
};

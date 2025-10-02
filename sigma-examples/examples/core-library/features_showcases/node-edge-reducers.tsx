/**
 * Node and Edge Reducers Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/use-reducers--story
 *
 * Demonstrates:
 * - Node and edge reducers for dynamic styling
 * - Interactive search with autocomplete
 * - Hover effects with neighbor highlighting
 * - Camera animation to selected nodes
 * - Performance optimization with skipIndexation
 */

import { FC, useEffect, useState, useRef } from "react";
import { useLoadGraph, useSigma, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import type { Coordinates, EdgeDisplayData, NodeDisplayData } from "sigma/types";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";
import lesMiserablesData from "@/data/graphs/les-miserables.json";

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

const SETTINGS = {
  renderLabels: true,
};

// State interface
interface State {
  searchQuery: string;
  hoveredNode?: string;
  selectedNode?: string;
  suggestions?: Set<string>;
  hoveredNeighbors?: Set<string>;
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

// Search bar component
const SearchBar: FC<{
  value: string;
  onChange: (value: string) => void;
  onBlur: () => void;
  suggestions: string[];
}> = ({ value, onChange, onBlur, suggestions }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "rgba(26, 26, 26, 0.95)",
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
          padding: "12px 16px",
          minWidth: "400px",
        }}
      >
        <div style={{ position: "relative" }}>
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onBlur={onBlur}
            placeholder="Search nodes..."
            list="node-suggestions"
            style={{
              width: "100%",
              padding: "10px 12px",
              paddingLeft: "36px",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              color: "#fff",
              fontSize: "14px",
              outline: "none",
              transition: "all 0.2s",
            }}
            onFocus={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.borderColor = "#3b82f6";
            }}
            onBlurCapture={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
            }}
          />
          {/* Search icon */}
          <div
            style={{
              position: "absolute",
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#9ca3af",
              fontSize: "16px",
            }}
          >
            🔍
          </div>
        </div>

        {/* Datalist for autocomplete */}
        <datalist id="node-suggestions">
          {suggestions.map((suggestion, idx) => (
            <option key={idx} value={suggestion} />
          ))}
        </datalist>

        {/* Helper text */}
        <div
          style={{
            marginTop: "8px",
            fontSize: "11px",
            color: "#9ca3af",
            textAlign: "center",
          }}
        >
          {value ? `${suggestions.length} suggestions` : "Type to search for nodes"}
        </div>
      </div>
    </div>
  );
};

// Reducer controller component
const ReducerController: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  const registerEvents = useRegisterEvents();

  // State management
  const [state, setState] = useState<State>({
    searchQuery: "",
  });

  // Get all node labels for autocomplete
  const allNodeLabels = graph.nodes().map((node) => graph.getNodeAttribute(node, "label") as string);

  // Handle search query changes
  const handleSearchQuery = (query: string) => {
    const newState: State = { searchQuery: query };

    if (query) {
      const lcQuery = query.toLowerCase();
      const matchingNodes = graph
        .nodes()
        .map((n) => ({ id: n, label: graph.getNodeAttribute(n, "label") as string }))
        .filter(({ label }) => label.toLowerCase().includes(lcQuery));

      // Single perfect match = select node and animate camera
      if (matchingNodes.length === 1 && matchingNodes[0].label === query) {
        newState.selectedNode = matchingNodes[0].id;
        newState.suggestions = undefined;

        // Animate camera to selected node
        const nodePosition = sigma.getNodeDisplayData(newState.selectedNode) as Coordinates;
        sigma.getCamera().animate(nodePosition, {
          duration: 500,
        });
      }
      // Multiple matches = show suggestions
      else {
        newState.selectedNode = undefined;
        newState.suggestions = new Set(matchingNodes.map(({ id }) => id));
      }
    }
    // Empty query = reset
    else {
      newState.selectedNode = undefined;
      newState.suggestions = undefined;
    }

    setState((prev) => ({ ...prev, ...newState }));
  };

  // Handle hover state
  const handleHoveredNode = (node?: string) => {
    if (node) {
      setState((prev) => ({
        ...prev,
        hoveredNode: node,
        hoveredNeighbors: new Set(graph.neighbors(node)),
      }));
    } else {
      setState((prev) => ({
        ...prev,
        hoveredNode: undefined,
        hoveredNeighbors: undefined,
      }));
    }
  };

  // Register hover events
  useEffect(() => {
    registerEvents({
      enterNode: ({ node }) => handleHoveredNode(node),
      leaveNode: () => handleHoveredNode(undefined),
    });
  }, [registerEvents]);

  // Update node reducer when state changes
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      const res: Partial<NodeDisplayData> = { ...data };

      // Priority 1: Hover state (grey out non-neighbors)
      if (state.hoveredNeighbors && !state.hoveredNeighbors.has(node) && state.hoveredNode !== node) {
        res.label = "";
        res.color = "#f6f6f6";
      }

      // Priority 2: Selected node (highlight)
      if (state.selectedNode === node) {
        res.highlighted = true;
      }
      // Priority 3: Search suggestions
      else if (state.suggestions) {
        if (state.suggestions.has(node)) {
          res.forceLabel = true;
        } else {
          res.label = "";
          res.color = "#f6f6f6";
        }
      }

      return res;
    });

    // Refresh with performance optimization
    sigma.refresh({ skipIndexation: true });
  }, [state, sigma]);

  // Update edge reducer when state changes
  useEffect(() => {
    sigma.setSetting("edgeReducer", (edge, data) => {
      const res: Partial<EdgeDisplayData> = { ...data };

      // Hide edges not connected to hovered node
      if (
        state.hoveredNode &&
        !graph.extremities(edge).every((n) => n === state.hoveredNode || graph.areNeighbors(n, state.hoveredNode))
      ) {
        res.hidden = true;
      }

      // Hide edges not connecting two suggested nodes
      if (
        state.suggestions &&
        (!state.suggestions.has(graph.source(edge)) || !state.suggestions.has(graph.target(edge)))
      ) {
        res.hidden = true;
      }

      return res;
    });

    // Refresh with performance optimization
    sigma.refresh({ skipIndexation: true });
  }, [state, sigma, graph]);

  return (
    <SearchBar
      value={state.searchQuery}
      onChange={handleSearchQuery}
      onBlur={() => handleSearchQuery("")}
      suggestions={allNodeLabels}
    />
  );
};

// Main component
export const NodeEdgeReducers: FC = () => {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <ReducerController />
      </SigmaContainerWithCleanup>
    </div>
  );
};

/**
 * Layouts Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/layouts--story
 *
 * Demonstrates:
 * - ForceAtlas2 layout (iterative, web worker-based)
 * - Circular layout (deterministic)
 * - Random layout (custom implementation)
 * - Smooth layout transitions with animations
 * - Layout control panel UI
 */

import { FC, useEffect, useState, useCallback } from "react";
import {
  useLoadGraph,
  useSigma,
} from "@react-sigma/core";
import Graph from "graphology";
import { circular } from "graphology-layout";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { animateNodes } from "sigma/utils";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

const SETTINGS = {
  renderLabels: true,
};

// Component to load Les Misérables graph from JSON
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    let cancelled = false;

    // Fetch JSON file from public folder
    fetch("/les-miserables.json")
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;

        // Create graph and import JSON data
        const graph = new Graph();
        graph.import(data);

        loadGraph(graph);
        graphLoaded = true;
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Error loading graph data:", error);

        // Create fallback graph
        const fallbackGraph = new Graph();
        fallbackGraph.addNode("1", {
          x: 0,
          y: 0,
          size: 10,
          label: "Error loading data",
          color: "#ff0000",
        });
        loadGraph(fallbackGraph);
        graphLoaded = true;
      });

    return () => {
      cancelled = true;
    };
  }, [loadGraph]);

  return null;
};

// Component to manage all layouts
const LayoutController: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  // State for tracking current animation
  const [cancelCurrentAnimation, setCancelCurrentAnimation] = useState<(() => void) | null>(null);

  // ForceAtlas2 layout (worker-based)
  const { start: startFA2, stop: stopFA2, kill: killFA2, isRunning: isFA2Running } = useWorkerLayoutForceAtlas2({
    settings: forceAtlas2.inferSettings(graph),
  });

  // Circular layout hook
  const { positions: circularPositions } = useLayoutCircular({ scale: 100 });

  // Cleanup FA2 worker on unmount
  useEffect(() => {
    return () => {
      killFA2();
    };
  }, [killFA2]);

  // Toggle ForceAtlas2 layout
  const handleForceAtlas2 = useCallback(() => {
    if (isFA2Running) {
      stopFA2();
    } else {
      // Cancel any ongoing animation
      if (cancelCurrentAnimation) {
        cancelCurrentAnimation();
        setCancelCurrentAnimation(null);
      }
      startFA2();
    }
  }, [isFA2Running, stopFA2, startFA2, cancelCurrentAnimation]);

  // Apply Circular layout
  const handleCircular = useCallback(() => {
    // Stop FA2 if running
    if (isFA2Running) {
      stopFA2();
    }

    // Cancel any ongoing animation
    if (cancelCurrentAnimation) {
      cancelCurrentAnimation();
    }

    // Calculate circular positions
    const positions = circularPositions();

    // Animate to new positions
    const cancel = animateNodes(graph, positions, {
      duration: 2000,
      easing: "linear",
    });

    setCancelCurrentAnimation(() => cancel);
  }, [graph, circularPositions, isFA2Running, stopFA2, cancelCurrentAnimation]);

  // Apply Random layout
  const handleRandom = useCallback(() => {
    // Stop FA2 if running
    if (isFA2Running) {
      stopFA2();
    }

    // Cancel any ongoing animation
    if (cancelCurrentAnimation) {
      cancelCurrentAnimation();
    }

    // Calculate position extents to maintain scale
    const xExtents = { min: 0, max: 0 };
    const yExtents = { min: 0, max: 0 };

    graph.forEachNode((_node, attributes) => {
      xExtents.min = Math.min(attributes.x, xExtents.min);
      xExtents.max = Math.max(attributes.x, xExtents.max);
      yExtents.min = Math.min(attributes.y, yExtents.min);
      yExtents.max = Math.max(attributes.y, yExtents.max);
    });

    // Generate random positions within extents
    const randomPositions: Record<string, { x: number; y: number }> = {};
    graph.forEachNode((node) => {
      randomPositions[node] = {
        x: Math.random() * (xExtents.max - xExtents.min),
        y: Math.random() * (yExtents.max - yExtents.min),
      };
    });

    // Animate to new positions
    const cancel = animateNodes(graph, randomPositions, { duration: 2000 });
    setCancelCurrentAnimation(() => cancel);
  }, [graph, isFA2Running, stopFA2, cancelCurrentAnimation]);

  return (
    <LayoutControlPanel
      onForceAtlas2={handleForceAtlas2}
      onCircular={handleCircular}
      onRandom={handleRandom}
      isFA2Running={isFA2Running}
    />
  );
};

// Layout control panel UI
const LayoutControlPanel: FC<{
  onForceAtlas2: () => void;
  onCircular: () => void;
  onRandom: () => void;
  isFA2Running: boolean;
}> = ({ onForceAtlas2, onCircular, onRandom, isFA2Running }) => {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        left: "20px",
        background: "rgba(26, 26, 26, 0.95)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minWidth: "200px",
      }}
    >
      {/* Header */}
      <div
        style={{
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          marginBottom: "4px",
        }}
      >
        Layout Controls
      </div>

      {/* ForceAtlas2 Button */}
      <button
        onClick={onForceAtlas2}
        style={{
          padding: "10px 16px",
          background: isFA2Running ? "#22c55e" : "#374151",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        <span>ForceAtlas2</span>
        <span style={{ fontSize: "10px", opacity: 0.8 }}>
          {isFA2Running ? "■ Stop" : "▶ Start"}
        </span>
      </button>

      {/* Circular Button */}
      <button
        onClick={onCircular}
        style={{
          padding: "10px 16px",
          background: "#3b82f6",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Circular Layout
      </button>

      {/* Random Button */}
      <button
        onClick={onRandom}
        style={{
          padding: "10px 16px",
          background: "#8b5cf6",
          border: "none",
          borderRadius: "6px",
          color: "#fff",
          fontSize: "13px",
          fontWeight: "500",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 8px rgba(0, 0, 0, 0.2)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Random Layout
      </button>

      {/* Info text */}
      <div
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          marginTop: "4px",
          lineHeight: "1.4",
        }}
      >
        {isFA2Running
          ? "ForceAtlas2 is running..."
          : "Click a button to apply a layout"}
      </div>
    </div>
  );
};

// Main component
export const Layouts: FC = () => {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <LayoutController />
      </SigmaContainerWithCleanup>
    </div>
  );
};

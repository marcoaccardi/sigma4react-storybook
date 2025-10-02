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

import type { FC } from "react";
import { useEffect, useState, useCallback } from "react";
import {
  useLoadGraph,
  useSigma,
} from "@react-sigma/core";
import Graph from "graphology";
import forceAtlas2 from "graphology-layout-forceatlas2";
import { useWorkerLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { animateNodes } from "sigma/utils";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./layouts.css";
import lesMiserablesData from "@/data/graphs/les-miserables.json";

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

    // Create graph and import JSON data
    const graph = new Graph();
    graph.import(lesMiserablesData);

    loadGraph(graph);
    graphLoaded = true;
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
    <div className="layouts-control-panel">
      {/* Header */}
      <div className="layouts-panel-header">
        Layout Controls
      </div>

      {/* ForceAtlas2 Button */}
      <button
        onClick={onForceAtlas2}
        className={`layouts-button layouts-button-fa2 ${isFA2Running ? "running" : ""}`}
      >
        <span>ForceAtlas2</span>
        <span className="layouts-button-fa2-status">
          {isFA2Running ? "■ Stop" : "▶ Start"}
        </span>
      </button>

      {/* Circular Button */}
      <button
        onClick={onCircular}
        className="layouts-button layouts-button-circular"
      >
        Circular Layout
      </button>

      {/* Random Button */}
      <button
        onClick={onRandom}
        className="layouts-button layouts-button-random"
      >
        Random Layout
      </button>

      {/* Info text */}
      <div className="layouts-info-text">
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
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <LayoutController />
      </SigmaContainer>
    </div>
  );
};

/**
 * Edge Curve - Arrow Heads
 *
 * Converted from Storybook vanilla JS example
 *
 * This example demonstrates:
 * - Curved and straight directed edges with arrow heads
 * - Arrow head positioning on curves
 * - Directed graph visualization
 * - Interactive arrow type switching (no arrow, arrow, double-arrow)
 * - Multiple edge programs with different arrow configurations
 */

import type { FC } from "react";
import { useEffect, useState } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { SigmaContainer } from "@/components/SigmaContainer";
import { MultiGraph } from "graphology";
import EdgeCurveProgram, {
  EdgeCurvedArrowProgram,
  EdgeCurvedDoubleArrowProgram,
} from "@sigma/edge-curve";
import {
  EdgeArrowProgram,
  EdgeDoubleArrowProgram,
  EdgeRectangleProgram,
} from "sigma/rendering";
import "@react-sigma/core/lib/style.css";

// Arrow type options
type ArrowType = "NoArrow" | "Arrow" | "DoubleArrow";

// Settings (immutable)
const SETTINGS = {
  allowInvalidContainer: true,
  defaultEdgeType: "straightNoArrow",
  renderLabels: true,
  renderEdgeLabels: true,
  edgeProgramClasses: {
    straightNoArrow: EdgeRectangleProgram,
    curvedNoArrow: EdgeCurveProgram,
    straightArrow: EdgeArrowProgram,
    curvedArrow: EdgeCurvedArrowProgram,
    straightDoubleArrow: EdgeDoubleArrowProgram,
    curvedDoubleArrow: EdgeCurvedDoubleArrowProgram,
  },
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Create a MultiGraph to support parallel edges
    const graph = new MultiGraph();

    // Add nodes (scaled coordinates for better visibility)
    graph.addNode("a", { x: 0, y: 0, size: 10, label: "Alexandra" });
    graph.addNode("b", { x: 10, y: -10, size: 20, label: "Bastian" });
    graph.addNode("c", { x: 30, y: -20, size: 10, label: "Charles" });
    graph.addNode("d", { x: 10, y: -30, size: 10, label: "Dorothea" });
    graph.addNode("e", { x: 30, y: -40, size: 20, label: "Ernestine" });
    graph.addNode("f", { x: 40, y: -50, size: 10, label: "Fabian" });

    // Add edges with various configurations
    graph.addEdge("a", "b", { size: 5, curved: false });
    graph.addEdge("b", "c", { size: 6, curved: true });
    graph.addEdge("b", "d", { size: 5, curved: false });
    graph.addEdge("c", "b", { size: 5, curved: true });
    graph.addEdge("c", "e", { size: 9, curved: false });
    graph.addEdge("d", "c", { size: 5, curved: true });
    graph.addEdge("d", "e", { size: 5, curved: true });
    graph.addEdge("e", "d", { size: 4, curved: true });
    graph.addEdge("f", "e", { size: 7, curved: true });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Arrow type controller
const ArrowTypeController: FC<{
  arrowType: ArrowType;
  onArrowTypeChange: (type: ArrowType) => void;
}> = ({ arrowType, onArrowTypeChange }) => {
  const sigma = useSigma();

  // Update edge types when arrow type changes
  useEffect(() => {
    const graph = sigma.getGraph();
    const suffix = arrowType;

    graph.forEachEdge((edge, attributes) => {
      const curved = attributes.curved as boolean;
      graph.setEdgeAttribute(
        edge,
        "type",
        `${curved ? "curved" : "straight"}${suffix}`
      );
    });
  }, [arrowType, sigma]);

  return (
    <div
      style={{
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 1000,
      }}
    >
      <select
        value={arrowType}
        onChange={(e) => onArrowTypeChange(e.target.value as ArrowType)}
        style={{
          fontFamily: "sans-serif",
          padding: "10px",
          fontSize: "14px",
          cursor: "pointer",
        }}
      >
        <option value="NoArrow">No arrow</option>
        <option value="Arrow">Arrows</option>
        <option value="DoubleArrow">Double-sided arrows</option>
      </select>
    </div>
  );
};

// Main export
export const ArrowHeads: FC = () => {
  const [arrowType, setArrowType] = useState<ArrowType>("Arrow");

  return (
    <div style={{ position: "relative", height: "100%", width: "100%" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGraph />
        <ArrowTypeController
          arrowType={arrowType}
          onArrowTypeChange={setArrowType}
        />
      </SigmaContainer>
    </div>
  );
};

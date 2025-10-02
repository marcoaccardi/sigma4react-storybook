/**
 * Edge Curve - Parallel Edges
 *
 * Converted from: https://www.sigmajs.org/storybook/
 *
 * This example demonstrates:
 * - Multiple edges between the same nodes using MultiGraph
 * - Curved edges to avoid overlapping parallel edges
 * - indexParallelEdgesIndex helper to identify parallel edges
 * - Custom curvature calculation for parallel edges
 * - Mixed straight and curved edge rendering
 */

import { FC, useMemo } from "react";
import { SigmaContainer } from "@/components/SigmaContainer";
import { MultiGraph } from "graphology";
import { DEFAULT_EDGE_CURVATURE, EdgeCurvedArrowProgram, indexParallelEdgesIndex } from "@sigma/edge-curve";
import { EdgeArrowProgram } from "sigma/rendering";
import "@react-sigma/core/lib/style.css";

// Curvature calculation for parallel edges
function getCurvature(index: number, maxIndex: number): number {
  if (maxIndex <= 0) throw new Error("Invalid maxIndex");
  if (index < 0) return -getCurvature(-index, maxIndex);
  const amplitude = 3.5;
  const maxCurvature = amplitude * (1 - Math.exp(-maxIndex / amplitude)) * DEFAULT_EDGE_CURVATURE;
  return (maxCurvature * index) / maxIndex;
}

// Settings
const SETTINGS = {
  allowInvalidContainer: true,
  defaultEdgeType: "straight",
  edgeProgramClasses: {
    straight: EdgeArrowProgram,
    curved: EdgeCurvedArrowProgram,
  },
};

// Main component
export const ParallelEdges: FC = () => {
  // Create graph with useMemo to ensure it's only created once
  const graph = useMemo(() => {
    // Create a MultiGraph to support parallel edges
    const g = new MultiGraph();

    // Add nodes - top row
    g.addNode("a1", { x: 0, y: 0, size: 10 });
    g.addNode("b1", { x: 10, y: 0, size: 20 });
    g.addNode("c1", { x: 20, y: 0, size: 10 });
    g.addNode("d1", { x: 30, y: 0, size: 10 });
    g.addNode("e1", { x: 40, y: 0, size: 20 });

    // Add nodes - bottom row
    g.addNode("a2", { x: 0, y: -10, size: 20 });
    g.addNode("b2", { x: 10, y: -10, size: 10 });
    g.addNode("c2", { x: 20, y: -10, size: 10 });
    g.addNode("d2", { x: 30, y: -10, size: 20 });
    g.addNode("e2", { x: 40, y: -10, size: 10 });

    // Parallel edges in the same direction (top row)
    g.addEdge("a1", "b1", { size: 6 });
    g.addEdge("b1", "c1", { size: 3 });
    g.addEdge("b1", "c1", { size: 6 });
    g.addEdge("c1", "d1", { size: 3 });
    g.addEdge("c1", "d1", { size: 6 });
    g.addEdge("c1", "d1", { size: 10 });
    g.addEdge("d1", "e1", { size: 3 });
    g.addEdge("d1", "e1", { size: 6 });
    g.addEdge("d1", "e1", { size: 10 });
    g.addEdge("d1", "e1", { size: 3 });
    g.addEdge("d1", "e1", { size: 10 });

    // Parallel edges in both directions (bottom row)
    g.addEdge("a2", "b2", { size: 3 });
    g.addEdge("b2", "a2", { size: 6 });

    g.addEdge("b2", "c2", { size: 6 });
    g.addEdge("b2", "c2", { size: 10 });
    g.addEdge("c2", "b2", { size: 3 });
    g.addEdge("c2", "b2", { size: 3 });

    g.addEdge("c2", "d2", { size: 3 });
    g.addEdge("c2", "d2", { size: 6 });
    g.addEdge("c2", "d2", { size: 6 });
    g.addEdge("c2", "d2", { size: 10 });
    g.addEdge("d2", "c2", { size: 3 });

    g.addEdge("d2", "e2", { size: 3 });
    g.addEdge("d2", "e2", { size: 3 });
    g.addEdge("d2", "e2", { size: 3 });
    g.addEdge("d2", "e2", { size: 6 });
    g.addEdge("d2", "e2", { size: 10 });
    g.addEdge("e2", "d2", { size: 3 });
    g.addEdge("e2", "d2", { size: 3 });
    g.addEdge("e2", "d2", { size: 6 });
    g.addEdge("e2", "d2", { size: 6 });
    g.addEdge("e2", "d2", { size: 10 });

    // Use dedicated helper to identify parallel edges
    indexParallelEdgesIndex(g, {
      edgeIndexAttribute: "parallelIndex",
      edgeMinIndexAttribute: "parallelMinIndex",
      edgeMaxIndexAttribute: "parallelMaxIndex",
    });

    // Adapt types and curvature of parallel edges for rendering
    g.forEachEdge(
      (
        edge,
        {
          parallelIndex,
          parallelMinIndex,
          parallelMaxIndex,
        }:
          | { parallelIndex: number; parallelMinIndex?: number; parallelMaxIndex: number }
          | { parallelIndex?: null; parallelMinIndex?: null; parallelMaxIndex?: null },
      ) => {
        if (typeof parallelMinIndex === "number") {
          g.mergeEdgeAttributes(edge, {
            type: parallelIndex ? "curved" : "straight",
            curvature: getCurvature(parallelIndex, parallelMaxIndex),
          });
        } else if (typeof parallelIndex === "number") {
          g.mergeEdgeAttributes(edge, {
            type: "curved",
            curvature: getCurvature(parallelIndex, parallelMaxIndex),
          });
        } else {
          g.setEdgeAttribute(edge, "type", "straight");
        }
      },
    );

    return g;
  }, []);

  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS} graph={graph}>
    </SigmaContainer>
  );
};

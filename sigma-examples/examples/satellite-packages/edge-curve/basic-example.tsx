/**
 * Edge Curve - Basic Example
 *
 * Converted from vanilla Sigma.js Storybook example
 *
 * Description:
 * Demonstrates the use of EdgeCurveProgram from @sigma/edge-curve satellite package
 * to render curved edges instead of straight lines. Uses the Les Misérables character
 * network to showcase curved edge rendering.
 *
 * Features:
 * - Custom edge rendering with EdgeCurveProgram
 * - Curved edges for better visual clarity in dense graphs
 * - Les Misérables character network dataset
 *
 * Storybook: https://www.sigmajs.org/storybook/?path=/story/edge-curve-basic-example
 */

import { useEffect } from "react";
import type { FC } from "react";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import EdgeCurveProgram from "@sigma/edge-curve";
import "@react-sigma/core/lib/style.css";

// Import Les Misérables data
import lesMiserablesData from "@/data/graphs/les-miserables.json";

// Settings (immutable) - register the curve edge program
const SETTINGS = {
  defaultEdgeType: "curve",
  edgeProgramClasses: {
    curve: EdgeCurveProgram,
  },
  renderLabels: true,
  labelSize: 12,
  labelColor: { color: "#000000" },
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Import the Les Misérables data
    graph.import(lesMiserablesData);

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Main component
export const BasicExample: FC = () => {
  return (
    <div style={{ height: "100%", width: "100%" }}>
      <SigmaContainer
        style={{ height: "100%", width: "100%" }}
        settings={SETTINGS}
      >
        <LoadGraph />
      </SigmaContainer>
    </div>
  );
};

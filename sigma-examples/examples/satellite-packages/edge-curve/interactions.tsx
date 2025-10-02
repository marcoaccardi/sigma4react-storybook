/**
 * Edge Curve - Interactions
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/satellite-packages-edge-curve
 *
 * Demonstrates:
 * - Custom curved edge rendering with EdgeCurveProgram
 * - Edge hover interactions with highlighting
 * - Dynamic edge and node styling based on hover state
 * - Using zIndex for layering during interactions
 */

import type { FC } from "react";
import { useEffect, useState } from "react";
import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import EdgeCurveProgram from "@sigma/edge-curve";
import Graph from "graphology";
import type { EdgeDisplayData, NodeDisplayData } from "sigma/types";
import "@react-sigma/core/lib/style.css";

import data from "@/data/graphs/les-miserables.json";

// Settings with curved edges enabled
const SETTINGS = {
  defaultEdgeType: "curve",
  enableEdgeHoverEvents: true,
  zIndex: true,
  edgeProgramClasses: {
    curve: EdgeCurveProgram,
  },
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    graph.import(data);
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Edge hover interaction handler
const EdgeHoverHandler: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredEdge, setHoveredEdge] = useState<{ edge: string; source: string; target: string } | null>(null);

  // Update reducers when hovered edge changes
  useEffect(() => {
    // Edge reducer: highlight hovered edge, dim others
    sigma.setSetting("edgeReducer", (edge, attributes) => {
      const res: Partial<EdgeDisplayData> = { ...attributes };

      if (hoveredEdge) {
        if (edge === hoveredEdge.edge) {
          res.size = (res.size || 1) * 1.5;
          res.zIndex = 1;
        } else {
          res.color = "#f0f0f0";
          res.zIndex = 0;
        }
      }

      return res;
    });

    // Node reducer: highlight source and target nodes, hide other labels
    sigma.setSetting("nodeReducer", (node, attributes) => {
      const res: Partial<NodeDisplayData> = { ...attributes };

      if (hoveredEdge) {
        if (node === hoveredEdge.source || node === hoveredEdge.target) {
          res.highlighted = true;
          res.zIndex = 1;
        } else {
          res.label = undefined;
          res.zIndex = 0;
        }
      }

      return res;
    });
  }, [hoveredEdge, sigma]);

  // Register hover events
  useEffect(() => {
    const graph = sigma.getGraph();

    registerEvents({
      enterEdge: ({ edge }) => {
        setHoveredEdge({
          edge,
          source: graph.source(edge),
          target: graph.target(edge),
        });
      },
      leaveEdge: () => {
        setHoveredEdge(null);
      },
    });
  }, [registerEvents, sigma]);

  return null;
};

// Main component
export const Interactions: FC = () => {
  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
      <LoadGraph />
      <EdgeHoverHandler />
    </SigmaContainer>
  );
};

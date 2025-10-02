/**
 * Basic Graph Example
 * 
 * Demonstrates:
 * - Creating a simple graph with nodes and edges
 * - Using SigmaContainer
 * - Loading graph with useLoadGraph hook
 */

import { useEffect } from "react";
import type { FC } from "react";
import { useLoadGraph } from "@react-sigma/core";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";

const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
  labelColor: { color: "#000" },
};

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Add nodes
    graph.addNode("1", {
      x: 0,
      y: 0,
      size: 15,
      label: "Node 1",
      color: "#3388ff",
    });

    graph.addNode("2", {
      x: 1,
      y: 1,
      size: 20,
      label: "Node 2",
      color: "#ff8833",
    });

    graph.addNode("3", {
      x: -1,
      y: 0.5,
      size: 10,
      label: "Node 3",
      color: "#88ff33",
    });

    // Add edges
    graph.addEdge("1", "2", { size: 3, color: "#ccc" });
    graph.addEdge("2", "3", { size: 3, color: "#ccc" });
    graph.addEdge("3", "1", { size: 3, color: "#ccc" });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export const BasicGraph: FC = () => {
  return (
    <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
      <LoadGraph />
    </SigmaContainerWithCleanup>
  );
};
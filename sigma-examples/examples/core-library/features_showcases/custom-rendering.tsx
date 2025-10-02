/**
 * Custom Rendering Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/custom-rendering--story
 *
 * Demonstrates:
 * - Multiple node rendering programs (image + border)
 * - Using @sigma/node-image for icon nodes
 * - Using @sigma/node-border for gradient-style nodes
 * - Different node types in the same graph
 * - ForceAtlas2 physics-based layout
 * - Edge labels
 */

import { useEffect, useMemo } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { NodeImageProgram } from "@sigma/node-image";
import { NodeBorderProgram } from "@sigma/node-border";
import ForceSupervisor from "graphology-layout-force/worker";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./custom-rendering.css";
import userSvg from "@/data/assets/user.svg";
import citySvg from "@/data/assets/city.svg";

// Color constants
const RED = "#FA4F40";
const BLUE = "#727EE0";
const GREEN = "#5DB346";

// Settings with custom node programs (immutable)
const SETTINGS = {
  renderLabels: true,
  renderEdgeLabels: true,
  nodeProgramClasses: {
    image: NodeImageProgram,
    border: NodeBorderProgram,
  },
};

// Component to load the social network graph
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Add person nodes with images
    graph.addNode("John", {
      size: 15,
      label: "John",
      type: "image",
      image: userSvg,
      color: RED,
    });

    graph.addNode("Mary", {
      size: 15,
      label: "Mary",
      type: "image",
      image: userSvg,
      color: RED,
    });

    graph.addNode("Suzan", {
      size: 15,
      label: "Suzan",
      type: "image",
      image: userSvg,
      color: RED,
    });

    // Add city nodes with images
    graph.addNode("Nantes", {
      size: 15,
      label: "Nantes",
      type: "image",
      image: citySvg,
      color: BLUE,
    });

    graph.addNode("New-York", {
      size: 15,
      label: "New-York",
      type: "image",
      image: citySvg,
      color: BLUE,
    });

    // Add food nodes with border style (gradient effect)
    graph.addNode("Sushis", {
      size: 7,
      label: "Sushis",
      type: "border",
      color: "#ffffff",
      borderColor: GREEN,
    });

    graph.addNode("Falafels", {
      size: 7,
      label: "Falafels",
      type: "border",
      color: "#ffffff",
      borderColor: GREEN,
    });

    graph.addNode("Kouign Amann", {
      size: 7,
      label: "Kouign Amann",
      type: "border",
      color: "#ffffff",
      borderColor: GREEN,
    });

    // Add edges with labels
    graph.addEdge("John", "Mary", {
      type: "line",
      label: "works with",
      size: 5,
    });

    graph.addEdge("Mary", "Suzan", {
      type: "line",
      label: "works with",
      size: 5,
    });

    graph.addEdge("Mary", "Nantes", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });

    graph.addEdge("John", "New-York", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });

    graph.addEdge("Suzan", "New-York", {
      type: "arrow",
      label: "lives in",
      size: 5,
    });

    graph.addEdge("John", "Falafels", {
      type: "arrow",
      label: "eats",
      size: 5,
    });

    graph.addEdge("Mary", "Sushis", {
      type: "arrow",
      label: "eats",
      size: 5,
    });

    graph.addEdge("Suzan", "Kouign Amann", {
      type: "arrow",
      label: "eats",
      size: 5,
    });

    // Position nodes in a circle initially
    graph.nodes().forEach((node, i) => {
      const angle = (i * 2 * Math.PI) / graph.order;
      graph.setNodeAttribute(node, "x", 100 * Math.cos(angle));
      graph.setNodeAttribute(node, "y", 100 * Math.sin(angle));
    });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Component to manage ForceAtlas2 layout
const ForceLayoutController: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  // Create and start force layout
  useEffect(() => {
    const layout = new ForceSupervisor(graph, {
      isNodeFixed: (_node, attributes) => attributes.highlighted || false,
    });
    layout.start();

    // Cleanup on unmount
    return () => {
      layout.kill();
    };
  }, [graph]);

  return null;
};

// Main component
export const CustomRendering: FC = () => {
  // Memoize settings to ensure they never change
  const settings = useMemo(() => SETTINGS, []);

  return (
    <SigmaContainer className="custom-rendering-container" settings={settings}>
      <LoadGraph />
      <ForceLayoutController />
    </SigmaContainer>
  );
};

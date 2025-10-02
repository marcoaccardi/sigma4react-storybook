/**
 * Drag Nodes Example
 *
 * Demonstrates:
 * - Drag and drop nodes with mouse
 * - Click on stage to create new nodes
 * - Auto-connect new nodes to closest existing nodes
 * - Force layout with fixed nodes during drag
 * - Node highlighting during interaction
 * - Viewport coordinate translation
 */

import { useEffect, useState, useRef } from "react";
import type { FC } from "react";
import { useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import ForceSupervisor from "graphology-layout-force/worker";
import chroma from "chroma-js";
import { v4 as uuid } from "uuid";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./drag-nodes.css";

// Settings (immutable)
const SETTINGS = {
  renderLabels: false,
  minCameraRatio: 0.5,
  maxCameraRatio: 2,
};

// Initial graph setup
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Create initial nodes
    graph.addNode("n1", { x: 0, y: 0, size: 10, color: chroma.random().hex() });
    graph.addNode("n2", { x: -5, y: 5, size: 10, color: chroma.random().hex() });
    graph.addNode("n3", { x: 5, y: 5, size: 10, color: chroma.random().hex() });
    graph.addNode("n4", { x: 0, y: 10, size: 10, color: chroma.random().hex() });

    // Create initial edges
    graph.addEdge("n1", "n2");
    graph.addEdge("n2", "n4");
    graph.addEdge("n4", "n3");
    graph.addEdge("n3", "n1");

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Force Layout Controller
const ForceLayout: FC = () => {
  const sigma = useSigma();
  const layoutRef = useRef<ForceSupervisor | null>(null);

  useEffect(() => {
    const graph = sigma.getGraph();

    // Create force layout with fixed nodes during drag
    const layout = new ForceSupervisor(graph, {
      isNodeFixed: (_, attr) => attr.highlighted,
    });

    layout.start();
    layoutRef.current = layout;

    return () => {
      layout.kill();
      layoutRef.current = null;
    };
  }, [sigma]);

  return null;
};

// Drag and Drop + Click to Create Handler
const InteractionHandler: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const graph = sigma.getGraph();

    registerEvents({
      // On mouse down on a node - start dragging
      downNode: (e) => {
        setIsDragging(true);
        setDraggedNode(e.node);
        graph.setNodeAttribute(e.node, "highlighted", true);

        // Set custom bounding box to prevent auto-zoom
        if (!sigma.getCustomBBox()) {
          sigma.setCustomBBox(sigma.getBBox());
        }
      },

      // On mouse move - update dragged node position
      moveBody: (e) => {
        if (!isDragging || !draggedNode) return;

        // Convert viewport coordinates to graph coordinates
        const pos = sigma.viewportToGraph(e.event);

        graph.setNodeAttribute(draggedNode, "x", pos.x);
        graph.setNodeAttribute(draggedNode, "y", pos.y);

        // Prevent sigma default behavior
        e.preventSigmaDefault();
        e.event.original.preventDefault();
        e.event.original.stopPropagation();
      },

      // On mouse up on node - stop dragging
      upNode: () => {
        if (draggedNode) {
          graph.removeNodeAttribute(draggedNode, "highlighted");
        }
        setIsDragging(false);
        setDraggedNode(null);
      },

      // On mouse up on stage - stop dragging
      upStage: () => {
        if (draggedNode) {
          graph.removeNodeAttribute(draggedNode, "highlighted");
        }
        setIsDragging(false);
        setDraggedNode(null);
      },

      // On click stage - create new node
      clickStage: (e) => {
        // Convert viewport coordinates to graph coordinates
        const coordForGraph = sigma.viewportToGraph({ x: e.event.x, y: e.event.y });

        // Create new node
        const node = {
          ...coordForGraph,
          size: 10,
          color: chroma.random().hex(),
        };

        // Find two closest nodes to auto-create edges
        const closestNodes = graph
          .nodes()
          .map((nodeId) => {
            const attrs = graph.getNodeAttributes(nodeId);
            const distance = Math.pow(node.x - attrs.x, 2) + Math.pow(node.y - attrs.y, 2);
            return { nodeId, distance };
          })
          .sort((a, b) => a.distance - b.distance)
          .slice(0, 2);

        // Add the new node
        const id = uuid();
        graph.addNode(id, node);

        // Create edges to closest nodes
        closestNodes.forEach((closest) => graph.addEdge(id, closest.nodeId));
      },
    });
  }, [sigma, registerEvents, isDragging, draggedNode]);

  return null;
};

// Instructions Panel
const Instructions: FC = () => {
  return (
    <div className="drag-nodes-instructions">
      <h3 className="drag-nodes-title">Drag & Create Nodes</h3>
      <ul className="drag-nodes-list">
        <li className="drag-nodes-list-item">
          <strong>Drag:</strong> Click and drag any node to move it
        </li>
        <li className="drag-nodes-list-item">
          <strong>Create:</strong> Click on empty space to create a new node
        </li>
        <li className="drag-nodes-list-item">New nodes automatically connect to the 2 closest nodes</li>
        <li className="drag-nodes-list-item">Force layout keeps the graph organized</li>
      </ul>
    </div>
  );
};

// Main Component
export const DragNodes: FC = () => {
  return (
    <div className="drag-nodes-container">
      <SigmaContainer className="drag-nodes-sigma-container" settings={SETTINGS}>
        <LoadGraph />
        <ForceLayout />
        <InteractionHandler />
      </SigmaContainer>
      <Instructions />
    </div>
  );
};

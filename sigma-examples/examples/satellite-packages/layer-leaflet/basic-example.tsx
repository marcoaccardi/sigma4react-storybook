/**
 * Layer Leaflet - Basic Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/layer-leaflet--story
 *
 * This example demonstrates:
 * - Sigma graph overlay on Leaflet map
 * - Geographic data visualization with airports
 * - Map-based graph rendering using lat/lng coordinates
 */

import type { FC } from "react";
import { useEffect } from "react";
import { SigmaContainer, useLoadGraph, useSigma } from "@react-sigma/core";
import bindLeafletLayer from "@sigma/layer-leaflet";
import Graph from "graphology";
import type { Attributes } from "graphology-types";
import "@react-sigma/core/lib/style.css";

import airportsData from "@/data/graphs/airports.json";

// Settings
const SETTINGS = {
  labelRenderedSizeThreshold: 20,
  defaultNodeColor: "#e22352",
  defaultEdgeColor: "#ffaeaf",
  minEdgeThickness: 1,
};

// Load graph with airport data
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Add nodes from data
    airportsData.nodes.forEach((nodeData) => {
      graph.addNode(nodeData.key, {
        ...nodeData.attributes,
        label: nodeData.attributes.fullName,
        x: 0,
        y: 0,
      });
    });

    // Add edges from data
    airportsData.edges.forEach((edgeData) => {
      graph.addEdge(edgeData.source, edgeData.target);
    });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Apply Leaflet layer binding and node reducer
const LeafletLayer: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    const graph = sigma.getGraph();

    // Set node reducer to size nodes by degree
    sigma.setSetting("nodeReducer", (node, attrs) => ({
      ...attrs,
      size: Math.sqrt(graph.degree(node)) / 2,
    }));

    // Bind Leaflet layer with lat/lng mapping
    bindLeafletLayer(sigma, {
      getNodeLatLng: (attrs: Attributes) => ({
        lat: attrs.latitude,
        lng: attrs.longitude,
      }),
    });
  }, [sigma]);

  return null;
};

// Main component
export const BasicExample: FC = () => {
  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
      <LoadGraph />
      <LeafletLayer />
    </SigmaContainer>
  );
};

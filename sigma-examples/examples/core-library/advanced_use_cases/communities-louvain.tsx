/**
 * Communities Detection with Louvain Algorithm
 *
 * Converted from vanilla Sigma.js Storybook example
 *
 * Description:
 * Demonstrates community detection using the Louvain algorithm on the Les Misérables dataset.
 * Each community is assigned a distinct color, and users can zoom to specific communities.
 *
 * Features:
 * - Louvain community detection algorithm
 * - Color-coded communities using iwanthue
 * - Interactive buttons to zoom to each community
 * - Les Misérables character network dataset
 */

import { useEffect, useState, useCallback } from "react";
import type { FC } from "react";
import { useLoadGraph, useSigma } from "@react-sigma/core";
import { SigmaContainer } from "@/components/SigmaContainer";
import Graph from "graphology";
import louvain from "graphology-communities-louvain";
import iwanthue from "iwanthue";
import { fitViewportToNodes } from "@sigma/utils";
import "@react-sigma/core/lib/style.css";
import "./communities-louvain.css";

// Import Les Misérables data
import lesMiserablesData from "@/data/graphs/les-miserables.json";

// Settings (immutable)
const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
  labelColor: { color: "#000000" },
  defaultNodeColor: "#999",
  defaultEdgeColor: "#ccc",
};

// Graph loader with community detection
const LoadGraph: FC<{
  onCommunitiesDetected: (communities: number[], palette: Record<number, string>) => void
}> = ({ onCommunitiesDetected }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Import the Les Misérables data
    graph.import(lesMiserablesData);

    // Detect communities using Louvain algorithm
    louvain.assign(graph, { nodeCommunityAttribute: "community" });

    // Collect all unique communities
    const communitiesSet = new Set<number>();
    graph.forEachNode((_, attrs) => {
      if (typeof attrs.community === "number") {
        communitiesSet.add(attrs.community);
      }
    });
    const communitiesArray = Array.from(communitiesSet).sort((a, b) => a - b);

    // Generate color palette for communities
    const colors = iwanthue(communitiesSet.size);
    const palette: Record<number, string> = communitiesArray.reduce(
      (acc, community, i) => ({
        ...acc,
        [community]: colors[i],
      }),
      {}
    );

    // Apply colors to nodes based on their community
    graph.forEachNode((node, attrs) => {
      const community = attrs.community as number;
      graph.setNodeAttribute(node, "color", palette[community]);
    });

    loadGraph(graph);
    onCommunitiesDetected(communitiesArray, palette);
  }, [loadGraph, onCommunitiesDetected]);

  return null;
};

// Community buttons component
const CommunityButtons: FC<{
  communities: number[];
  palette: Record<number, string>;
}> = ({ communities, palette }) => {
  const sigma = useSigma();

  const handleCommunityClick = (community: number) => {
    const graph = sigma.getGraph();

    // Get all nodes in this community
    const communityNodes = graph.filterNodes((_, attrs) => attrs.community === community);

    // Fit viewport to these nodes with animation
    fitViewportToNodes(sigma, communityNodes, { animate: true });
  };

  return (
    <div className="communities-louvain-buttons-container">
      {communities.map((community) => (
        <button
          key={community}
          onClick={() => handleCommunityClick(community)}
          className="communities-louvain-button"
          style={{ color: palette[community] }}
        >
          Community n°{community + 1}
        </button>
      ))}
    </div>
  );
};

// Main component
export const CommunitiesLouvain: FC = () => {
  const [communities, setCommunities] = useState<number[]>([]);
  const [palette, setPalette] = useState<Record<number, string>>({});

  const handleCommunitiesDetected = useCallback((
    detectedCommunities: number[],
    colorPalette: Record<number, string>
  ) => {
    setCommunities(detectedCommunities);
    setPalette(colorPalette);
  }, []); // Empty deps - function is stable across renders, preventing infinite loop

  return (
    <div className="communities-louvain-container">
      <SigmaContainer
        style={{ height: "100%", width: "100%" }}
        settings={SETTINGS}
      >
        <LoadGraph onCommunitiesDetected={handleCommunitiesDetected} />
        {communities.length > 0 && (
          <CommunityButtons communities={communities} palette={palette} />
        )}
      </SigmaContainer>
    </div>
  );
};

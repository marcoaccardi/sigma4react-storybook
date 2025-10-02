/**
 * CSV Bipartite Network Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/csv-to-network--story
 *
 * Demonstrates:
 * - Parsing CSV files with PapaParse
 * - Building a bipartite network (institutions ↔ subjects)
 * - Using graphology-components to extract largest connected component
 * - Sizing nodes by degree (number of connections)
 * - Coloring nodes by type
 * - Applying circular + ForceAtlas2 layout
 * - Loading state management
 *
 * Dataset: Political Science research centers in France
 * Source: https://cartosciencepolitique.sciencespo.fr/#/en
 */

import { useEffect, useState } from "react";
import type { FC } from "react";
import { useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import { cropToLargestConnectedComponent } from "graphology-components";
import forceAtlas2 from "graphology-layout-forceatlas2";
import circular from "graphology-layout/circular";
import Papa from "papaparse";
import { SigmaContainer } from "@/components/SigmaContainer";
import "@react-sigma/core/lib/style.css";
import "./csv-bipartite-network.css";
import csvDataPath from "@/data/csv/institutions-subjects.csv?url";

// Settings (immutable)
const SETTINGS = {
  renderLabels: true,
};

// Color constants for node types
const COLORS = {
  institution: "#FA5A3D",
  subject: "#5A75DB",
};

// CSV row type
interface CsvRow {
  name: string;
  acronym: string;
  subject_terms: string;
}

// Track if graph has been loaded (persists across StrictMode remounts)
let graphLoaded = false;

// Component to load and parse CSV file
const LoadCsvGraph: FC<{
  onLoadStart: () => void;
  onLoadEnd: () => void;
}> = ({ onLoadStart, onLoadEnd }) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Only load once - prevents double loading in React StrictMode
    if (graphLoaded) return;

    onLoadStart();

    // Parse CSV file using PapaParse
    Papa.parse<CsvRow>(csvDataPath, {
      download: true,
      header: true,
      delimiter: ",",
      complete: (results) => {
        try {
          const graph = new Graph();

          // Build the bipartite graph
          results.data.forEach((line) => {
            // Skip empty lines
            if (!line.name || !line.subject_terms) return;

            const institution = line.name;
            const acronym = line.acronym;

            // Create the institution node
            graph.addNode(institution, {
              nodeType: "institution",
              label: [acronym, institution].filter((s) => !!s).join(" - "),
            });

            // Extract subjects list (format: "* Subject\n* Another Subject")
            const subjects = (
              line.subject_terms.match(/(?:\* )[^\n\r]*/g) || []
            ).map((str) => str.replace(/^\* /, ""));

            // For each subject, create the node if it doesn't exist yet
            subjects.forEach((subject) => {
              if (!graph.hasNode(subject)) {
                graph.addNode(subject, {
                  nodeType: "subject",
                  label: subject,
                });
              }

              // Add edge between institution and subject
              graph.addEdge(institution, subject, { weight: 1 });
            });
          });

          // Only keep the main connected component
          cropToLargestConnectedComponent(graph);

          // Add colors to nodes based on node types
          graph.forEachNode((node, attributes) => {
            const nodeType = attributes.nodeType as keyof typeof COLORS;
            graph.setNodeAttribute(node, "color", COLORS[nodeType]);
          });

          // Use degrees for node sizes
          const degrees = graph.nodes().map((node) => graph.degree(node));
          const minDegree = Math.min(...degrees);
          const maxDegree = Math.max(...degrees);
          const minSize = 2;
          const maxSize = 15;

          graph.forEachNode((node) => {
            const degree = graph.degree(node);
            const size =
              minSize +
              ((degree - minDegree) / (maxDegree - minDegree)) *
                (maxSize - minSize);
            graph.setNodeAttribute(node, "size", size);
          });

          // Position nodes on a circle, then run ForceAtlas2 for layout
          circular.assign(graph);
          const settings = forceAtlas2.inferSettings(graph);
          forceAtlas2.assign(graph, { settings, iterations: 600 });

          loadGraph(graph);
          graphLoaded = true;
          onLoadEnd();
        } catch (error) {
          console.error("Error processing CSV:", error);
          // Create fallback graph on error
          const fallbackGraph = new Graph();
          fallbackGraph.addNode("error", {
            x: 0,
            y: 0,
            size: 10,
            label: "Error loading CSV data",
            color: "#ff0000",
          });
          loadGraph(fallbackGraph);
          graphLoaded = true;
          onLoadEnd();
        }
      },
      error: (error) => {
        console.error("Error loading CSV file:", error);
        // Create fallback graph on error
        const fallbackGraph = new Graph();
        fallbackGraph.addNode("error", {
          x: 0,
          y: 0,
          size: 10,
          label: "Error loading CSV file",
          color: "#ff0000",
        });
        loadGraph(fallbackGraph);
        graphLoaded = true;
        onLoadEnd();
      },
    });
  }, [loadGraph, onLoadStart, onLoadEnd]);

  return null;
};

// Loading spinner component
const LoadingSpinner: FC = () => {
  return (
    <div className="csv-loading-spinner-container">
      <div className="csv-loading-spinner" />
      <div className="csv-loading-text">
        Loading CSV data...
      </div>
    </div>
  );
};

// Legend component
const Legend: FC = () => {
  return (
    <div className="csv-legend-panel">
      <div className="csv-legend-title">
        Node Types
      </div>
      <div className="csv-legend-item">
        <div
          className="csv-legend-dot"
          style={{ background: COLORS.institution }}
        />
        <span className="csv-legend-label">Institutions</span>
      </div>
      <div className="csv-legend-item">
        <div
          className="csv-legend-dot"
          style={{ background: COLORS.subject }}
        />
        <span className="csv-legend-label">Subjects</span>
      </div>
      <div className="csv-legend-info">
        Node size = number of connections
      </div>
    </div>
  );
};

// Main component
export const CsvBipartiteNetwork: FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      {isLoading && <LoadingSpinner />}
      <SigmaContainer
        style={{ height: "100%", width: "100%" }}
        settings={SETTINGS}
      >
        <LoadCsvGraph
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
        {!isLoading && <Legend />}
      </SigmaContainer>
    </div>
  );
};

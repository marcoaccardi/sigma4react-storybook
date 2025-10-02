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
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import "@react-sigma/core/lib/style.css";

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
    Papa.parse<CsvRow>("/data.csv", {
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
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "16px",
      }}
    >
      <div
        style={{
          width: "50px",
          height: "50px",
          border: "5px solid #f3f3f3",
          borderTop: "5px solid #3498db",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
      <div style={{ color: "#333", fontSize: "14px", fontWeight: "500" }}>
        Loading CSV data...
      </div>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

// Legend component
const Legend: FC = () => {
  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "rgba(26, 26, 26, 0.95)",
        borderRadius: "8px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.3)",
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        minWidth: "200px",
      }}
    >
      <div
        style={{
          color: "#fff",
          fontWeight: "600",
          fontSize: "14px",
          marginBottom: "4px",
        }}
      >
        Node Types
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: COLORS.institution,
          }}
        />
        <span style={{ color: "#fff", fontSize: "13px" }}>Institutions</span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div
          style={{
            width: "16px",
            height: "16px",
            borderRadius: "50%",
            background: COLORS.subject,
          }}
        />
        <span style={{ color: "#fff", fontSize: "13px" }}>Subjects</span>
      </div>
      <div
        style={{
          fontSize: "11px",
          color: "#9ca3af",
          marginTop: "4px",
          lineHeight: "1.4",
        }}
      >
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
      <SigmaContainerWithCleanup
        style={{ height: "100%", width: "100%" }}
        settings={SETTINGS}
      >
        <LoadCsvGraph
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
        />
        {!isLoading && <Legend />}
      </SigmaContainerWithCleanup>
    </div>
  );
};

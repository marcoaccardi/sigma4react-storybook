/**
 * Camera Settings Example
 *
 * Converted from: https://www.sigmajs.org/storybook/?path=/story/settings--camera
 *
 * Demonstrates:
 * - Dynamic camera settings control (zoom, pan, rotation)
 * - Camera boundaries (min/max zoom ratios)
 * - Pan boundaries with tolerance
 * - Real-time settings updates without recreating Sigma instance
 * - Contextual UI (disabled states based on toggles)
 */

import { useEffect, useState, useMemo } from "react";
import type { FC } from "react";
import { useSigma } from "@react-sigma/core";
import Graph from "graphology";
import { MultiGraph } from "graphology";
import { parse } from "graphology-gexf/browser";
import { SigmaContainerWithCleanup } from "../../../src/components/SigmaContainerWithCleanup";
import arcticGexfText from "@/data/graphs/arctic.gexf?raw";
import "@react-sigma/core/lib/style.css";

const SETTINGS = {
  renderLabels: true,
};

// Parse GEXF data at module level
const createGraphFromGexf = () => {
  // Parse GEXF with MultiGraph to handle duplicate edges in the file
  const multiGraph = parse(MultiGraph, arcticGexfText);

  // Convert to simple Graph by deduplicating edges
  const graph = new Graph();

  // Copy all nodes with their attributes
  multiGraph.forEachNode((node, attributes) => {
    graph.addNode(node, attributes);
  });

  // Copy edges, automatically deduplicating
  const addedEdges = new Set<string>();
  multiGraph.forEachEdge((edge, attributes, source, target) => {
    const edgeKey = [source, target].sort().join("-");
    if (!addedEdges.has(edgeKey)) {
      addedEdges.add(edgeKey);
      graph.addEdge(source, target, attributes);
    }
  });

  return graph;
};

// Component for camera controls
const CameraControls: FC = () => {
  const sigma = useSigma();

  // Interaction toggles
  const [enablePanning, setEnablePanning] = useState(true);
  const [enableZooming, setEnableZooming] = useState(true);
  const [enableRotation, setEnableRotation] = useState(true);

  // Zoom boundaries
  const [minRatio, setMinRatio] = useState("0.08");
  const [maxRatio, setMaxRatio] = useState("3");

  // Pan boundaries
  const [boundCamera, setBoundCamera] = useState(true);
  const [tolerance, setTolerance] = useState("500");

  // Update sigma settings when state changes
  useEffect(() => {
    sigma.setSetting("enableCameraPanning", enablePanning);
  }, [enablePanning, sigma]);

  useEffect(() => {
    sigma.setSetting("enableCameraZooming", enableZooming);
  }, [enableZooming, sigma]);

  useEffect(() => {
    sigma.setSetting("enableCameraRotation", enableRotation);
  }, [enableRotation, sigma]);

  useEffect(() => {
    const min = minRatio ? +minRatio : null;
    const max = maxRatio ? +maxRatio : null;
    sigma.setSetting("minCameraRatio", min);
    sigma.setSetting("maxCameraRatio", max);
  }, [minRatio, maxRatio, sigma]);

  useEffect(() => {
    if (boundCamera) {
      sigma.setSetting("cameraPanBoundaries", {
        tolerance: +(tolerance || 0),
      });
    } else {
      sigma.setSetting("cameraPanBoundaries", null);
    }
  }, [boundCamera, tolerance, sigma]);

  const handleResetCamera = () => {
    sigma.getCamera().animatedReset({ duration: 600 });
  };

  return (
    <div
      style={{
        position: "absolute",
        top: "20px",
        right: "20px",
        background: "white",
        padding: "20px",
        borderRadius: "8px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
        minWidth: "320px",
        maxWidth: "360px",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "20px" }}>
        <h3 style={{ margin: "0 0 4px 0", fontSize: "18px", fontWeight: "600", color: "#111" }}>
          Camera Settings
        </h3>
        <p style={{ margin: 0, fontSize: "13px", color: "#666" }}>
          Adjust camera behavior and boundaries
        </p>
      </div>

      {/* Interactions Section */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
          🎮 Interactions
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={enablePanning}
              onChange={(e) => setEnablePanning(e.target.checked)}
              style={{ marginRight: "8px", cursor: "pointer" }}
            />
            Enable panning
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={enableZooming}
              onChange={(e) => setEnableZooming(e.target.checked)}
              style={{ marginRight: "8px", cursor: "pointer" }}
            />
            Enable zooming
          </label>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={enableRotation}
              onChange={(e) => setEnableRotation(e.target.checked)}
              style={{ marginRight: "8px", cursor: "pointer" }}
            />
            Enable camera rotations
            <span style={{ fontSize: "12px", color: "#999", marginLeft: "4px" }}>(multitouch only)</span>
          </label>
        </div>
      </div>

      {/* Camera Zoom Section */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
          🔍 Camera Zoom
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", marginBottom: "4px", color: "#555" }}>
              Minimum camera zoom ratio
              <span style={{ fontSize: "11px", color: "#999", marginLeft: "4px" }}>(leave empty for no limit)</span>
            </label>
            <input
              type="text"
              value={minRatio}
              onChange={(e) => setMinRatio(e.target.value)}
              disabled={!enableZooming}
              placeholder="0.08"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                opacity: enableZooming ? 1 : 0.5,
                cursor: enableZooming ? "text" : "not-allowed",
              }}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", marginBottom: "4px", color: "#555" }}>
              Maximum camera zoom ratio
              <span style={{ fontSize: "11px", color: "#999", marginLeft: "4px" }}>(leave empty for no limit)</span>
            </label>
            <input
              type="text"
              value={maxRatio}
              onChange={(e) => setMaxRatio(e.target.value)}
              disabled={!enableZooming}
              placeholder="3"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                opacity: enableZooming ? 1 : 0.5,
                cursor: enableZooming ? "text" : "not-allowed",
              }}
            />
          </div>
        </div>
      </div>

      {/* Pan Boundaries Section */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", color: "#333" }}>
          📍 Pan Boundaries
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <label style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "14px" }}>
            <input
              type="checkbox"
              checked={boundCamera}
              onChange={(e) => setBoundCamera(e.target.checked)}
              disabled={!enablePanning}
              style={{
                marginRight: "8px",
                cursor: enablePanning ? "pointer" : "not-allowed",
                opacity: enablePanning ? 1 : 0.5,
              }}
            />
            Bound camera
          </label>
          <div>
            <label style={{ display: "block", fontSize: "13px", marginBottom: "4px", color: "#555" }}>
              Tolerance (in pixels)
            </label>
            <input
              type="text"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              disabled={!enablePanning || !boundCamera}
              placeholder="500"
              style={{
                width: "100%",
                padding: "8px 10px",
                fontSize: "14px",
                border: "1px solid #ddd",
                borderRadius: "4px",
                boxSizing: "border-box",
                opacity: enablePanning && boundCamera ? 1 : 0.5,
                cursor: enablePanning && boundCamera ? "text" : "not-allowed",
              }}
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetCamera}
        style={{
          width: "100%",
          padding: "12px",
          fontSize: "14px",
          fontWeight: "600",
          color: "white",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          border: "none",
          borderRadius: "6px",
          cursor: "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 12px rgba(102, 126, 234, 0.4)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        🎯 Reset Camera Position
      </button>
    </div>
  );
};

// Main component
export const CameraSettings: FC = () => {
  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainerWithCleanup style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
        <LoadGexf />
        <CameraControls />
      </SigmaContainerWithCleanup>
    </div>
  );
};

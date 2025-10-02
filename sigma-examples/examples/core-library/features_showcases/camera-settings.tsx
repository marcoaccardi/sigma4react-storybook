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
import { SigmaContainer } from "@/components/SigmaContainer";
import arcticGexfText from "@/data/graphs/arctic.gexf?raw";
import "@react-sigma/core/lib/style.css";
import "./camera-settings.css";

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
  multiGraph.forEachEdge((_edge, attributes, source, target) => {
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
    <div className="camera-settings-panel">
      {/* Header */}
      <div className="camera-settings-header">
        <h3 className="camera-settings-title">
          Camera Settings
        </h3>
        <p className="camera-settings-subtitle">
          Adjust camera behavior and boundaries
        </p>
      </div>

      {/* Interactions Section */}
      <div className="camera-settings-section">
        <div className="camera-settings-section-title">
          🎮 Interactions
        </div>
        <div className="camera-settings-checkboxes">
          <label className="camera-settings-checkbox-label">
            <input
              type="checkbox"
              checked={enablePanning}
              onChange={(e) => setEnablePanning(e.target.checked)}
              className="camera-settings-checkbox"
            />
            Enable panning
          </label>
          <label className="camera-settings-checkbox-label">
            <input
              type="checkbox"
              checked={enableZooming}
              onChange={(e) => setEnableZooming(e.target.checked)}
              className="camera-settings-checkbox"
            />
            Enable zooming
          </label>
          <label className="camera-settings-checkbox-label">
            <input
              type="checkbox"
              checked={enableRotation}
              onChange={(e) => setEnableRotation(e.target.checked)}
              className="camera-settings-checkbox"
            />
            Enable camera rotations
            <span className="camera-settings-hint">(multitouch only)</span>
          </label>
        </div>
      </div>

      {/* Camera Zoom Section */}
      <div className="camera-settings-section">
        <div className="camera-settings-section-title">
          🔍 Camera Zoom
        </div>
        <div className="camera-settings-inputs">
          <div className="camera-settings-input-group">
            <label>
              Minimum camera zoom ratio
              <span className="camera-settings-hint">(leave empty for no limit)</span>
            </label>
            <input
              type="text"
              value={minRatio}
              onChange={(e) => setMinRatio(e.target.value)}
              disabled={!enableZooming}
              placeholder="0.08"
              className="camera-settings-input"
            />
          </div>
          <div className="camera-settings-input-group">
            <label>
              Maximum camera zoom ratio
              <span className="camera-settings-hint">(leave empty for no limit)</span>
            </label>
            <input
              type="text"
              value={maxRatio}
              onChange={(e) => setMaxRatio(e.target.value)}
              disabled={!enableZooming}
              placeholder="3"
              className="camera-settings-input"
            />
          </div>
        </div>
      </div>

      {/* Pan Boundaries Section */}
      <div className="camera-settings-section">
        <div className="camera-settings-section-title">
          📍 Pan Boundaries
        </div>
        <div className="camera-settings-inputs">
          <label className="camera-settings-checkbox-label">
            <input
              type="checkbox"
              checked={boundCamera}
              onChange={(e) => setBoundCamera(e.target.checked)}
              disabled={!enablePanning}
              className="camera-settings-checkbox"
              style={{ opacity: enablePanning ? 1 : 0.5 }}
            />
            Bound camera
          </label>
          <div className="camera-settings-input-group">
            <label>
              Tolerance (in pixels)
            </label>
            <input
              type="text"
              value={tolerance}
              onChange={(e) => setTolerance(e.target.value)}
              disabled={!enablePanning || !boundCamera}
              placeholder="500"
              className="camera-settings-input"
            />
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={handleResetCamera}
        className="camera-settings-button"
      >
        🎯 Reset Camera Position
      </button>
    </div>
  );
};

// Main component
export const CameraSettings: FC = () => {
  const graph = useMemo(() => createGraphFromGexf(), []);

  return (
    <div style={{ height: "100%", width: "100%", position: "relative" }}>
      <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS} graph={graph}>
        <CameraControls />
      </SigmaContainer>
    </div>
  );
};

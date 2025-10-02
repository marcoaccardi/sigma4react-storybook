/**
 * Edge Curve - Labels
 *
 * Converted from Storybook vanilla JS example
 *
 * This example demonstrates:
 * - Curved edges with labels
 * - Label positioning on curved paths
 * - Edge label rendering
 * - Multiple edge types (straight and curved)
 * - Custom edge programs (EdgeArrowProgram and EdgeCurveProgram)
 */

import type { FC } from 'react';
import { useEffect } from 'react';
import { useLoadGraph } from '@react-sigma/core';
import { SigmaContainer } from '@/components/SigmaContainer';
import { MultiGraph } from 'graphology';
import EdgeCurveProgram from '@sigma/edge-curve';
import { EdgeArrowProgram } from 'sigma/rendering';
import '@react-sigma/core/lib/style.css';

// Settings (immutable)
const SETTINGS = {
  allowInvalidContainer: true,
  defaultEdgeType: 'straight',
  renderLabels: true,
  renderEdgeLabels: true,
  edgeProgramClasses: {
    straight: EdgeArrowProgram,
    curved: EdgeCurveProgram,
  },
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Create a MultiGraph to support parallel edges
    const graph = new MultiGraph();

    // Add nodes (scaled coordinates for better visibility)
    graph.addNode('a', { x: 0, y: 0, size: 10, label: 'Alexandra' });
    graph.addNode('b', { x: 10, y: -10, size: 20, label: 'Bastian' });
    graph.addNode('c', { x: 30, y: -20, size: 10, label: 'Charles' });
    graph.addNode('d', { x: 10, y: -30, size: 10, label: 'Dorothea' });
    graph.addNode('e', { x: 30, y: -40, size: 20, label: 'Ernestine' });
    graph.addNode('f', { x: 40, y: -50, size: 10, label: 'Fabian' });

    // Add edges with various configurations (straight and curved)
    graph.addEdge('a', 'b', { forceLabel: true, size: 2, label: 'works with' });
    graph.addEdge('b', 'c', {
      forceLabel: true,
      label: 'works with',
      type: 'curved',
      curvature: 0.5,
    });
    graph.addEdge('b', 'd', { forceLabel: true, label: 'works with' });
    graph.addEdge('c', 'b', {
      forceLabel: true,
      size: 3,
      label: 'works with',
      type: 'curved',
    });
    graph.addEdge('c', 'e', { forceLabel: true, size: 3, label: 'works with' });
    graph.addEdge('d', 'c', {
      forceLabel: true,
      label: 'works with',
      type: 'curved',
      curvature: 0.1,
    });
    graph.addEdge('d', 'e', {
      forceLabel: true,
      label: 'works with',
      type: 'curved',
      curvature: 1,
    });
    graph.addEdge('e', 'd', {
      forceLabel: true,
      size: 2,
      label: 'works with',
      type: 'curved',
    });
    graph.addEdge('f', 'e', {
      forceLabel: true,
      label: 'works with',
      type: 'curved',
    });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Main export
export const Labels: FC = () => {
  return (
    <SigmaContainer
      style={{ height: '100%', width: '100%' }}
      settings={SETTINGS}
    >
      <LoadGraph />
    </SigmaContainer>
  );
};

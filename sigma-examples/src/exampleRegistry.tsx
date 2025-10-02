import type { FC } from 'react';

// Import examples as you create them
import { BasicGraph } from '../examples/core-library/features_showcases/basic-graph';
import { LoadGexfFile } from '../examples/core-library/features_showcases/load-gexf-file';
import { Events } from '../examples/core-library/features_showcases/events';
import { Layouts } from '../examples/core-library/features_showcases/layouts';
import { NodeEdgeReducers } from '../examples/core-library/features_showcases/node-edge-reducers';
import { CustomRendering } from '../examples/core-library/features_showcases/custom-rendering';
import { CsvBipartiteNetwork } from '../examples/core-library/features_showcases/csv-bipartite-network';
import { CameraSettings } from '../examples/core-library/features_showcases/camera-settings';
import { ClusterLabel } from '../examples/core-library/advanced_use_cases/cluster-label';
import { ShadowDOMEvents } from '../examples/core-library/advanced_use_cases/shadow-dom-events';
import { JSONLDRDFGraph } from '../examples/core-library/advanced_use_cases/jsonld-rdf-graph';
import { Performance } from '../examples/core-library/advanced_use_cases/performance';
import { DragNodes } from '../examples/core-library/advanced_use_cases/drag-nodes';
import { CommunitiesLouvain } from '../examples/core-library/advanced_use_cases/communities-louvain';
import { BasicExample as EdgeCurveBasicExample } from '../examples/satellite-packages/edge-curve/basic-example';
import { Interactions as EdgeCurveInteractions } from '../examples/satellite-packages/edge-curve/interactions';
import { Labels as EdgeCurveLabels } from '../examples/satellite-packages/edge-curve/labels';
import { ArrowHeads as EdgeCurveArrowHeads } from '../examples/satellite-packages/edge-curve/arrow-heads';
import { ParallelEdges } from '../examples/satellite-packages/edge-curve/parallel-edges';
import { AvailableOptions as ExportImageAvailableOptions } from '../examples/satellite-packages/export-image/available-options';
import { CustomLayersAndRenderers } from '../examples/satellite-packages/export-image/custom-layers-and-renderers';
import { BasicExample as LayerLeafletBasicExample } from '../examples/satellite-packages/layer-leaflet/basic-example';
import { FitViewportToNodes } from '../examples/satellite-packages/utils/fit-viewport-to-nodes';

export interface Example {
  id: string;
  name: string;
  category: string;
  component: FC;
  description: string;
  storybookUrl?: string;
}

export const exampleRegistry: Example[] = [
  {
    id: 'basic-graph',
    name: 'Basic Graph',
    category: 'Getting Started',
    component: BasicGraph,
    description: 'Simple graph with nodes and edges',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/basic',
  },
  {
    id: 'load-gexf-file',
    name: 'Load GEXF File',
    category: 'Data Loading',
    component: LoadGexfFile,
    description: 'Load graph data from GEXF file with zoom controls and label threshold slider',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/load-gexf-file--story',
  },
  {
    id: 'csv-bipartite-network',
    name: 'CSV Bipartite Network',
    category: 'Data Loading',
    component: CsvBipartiteNetwork,
    description: 'Parse CSV to build bipartite network of institutions and subjects with ForceAtlas2 layout',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/csv-to-network--story',
  },
  {
    id: 'events',
    name: 'Events',
    category: 'Interactions',
    component: Events,
    description: 'Comprehensive event handling for nodes, edges, and stage with real-time logging',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/events--story',
  },
  {
    id: 'camera-settings',
    name: 'Camera Settings',
    category: 'Interactions',
    component: CameraSettings,
    description: 'Dynamic camera control: zoom/pan/rotation toggles, boundaries, and tolerance settings',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/settings--camera',
  },
  {
    id: 'layouts',
    name: 'Layouts',
    category: 'Layouts',
    component: Layouts,
    description: 'ForceAtlas2, Circular, and Random layouts with smooth animated transitions',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/layouts--story',
  },
  {
    id: 'node-edge-reducers',
    name: 'Node & Edge Reducers',
    category: 'Advanced',
    component: NodeEdgeReducers,
    description: 'Dynamic node/edge styling with search, autocomplete, hover effects, and camera animation',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/use-reducers--story',
  },
  {
    id: 'custom-rendering',
    name: 'Custom Rendering',
    category: 'Advanced',
    component: CustomRendering,
    description: 'Multiple node rendering programs with image nodes and border nodes, animated with ForceAtlas2 layout',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/custom-rendering--story',
  },
  {
    id: 'cluster-label',
    name: 'Cluster Label',
    category: 'Advanced Use Cases',
    component: ClusterLabel,
    description: 'Country-based clustering with custom DOM overlay labels that sync with camera movement',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/advanced-use-cases-cluster-label--story',
  },
  {
    id: 'shadow-dom-events',
    name: 'Shadow DOM Events',
    category: 'Advanced Use Cases',
    component: ShadowDOMEvents,
    description: 'Comprehensive event handling (19 event types) with overlay logging, z-index management, and edge hover effects',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/web-components-shadow-dom--story',
  },
  {
    id: 'jsonld-rdf-graph',
    name: 'JSON-LD / RDF Graph',
    category: 'Advanced Use Cases',
    component: JSONLDRDFGraph,
    description: 'Semantic web visualization: parse JSON-LD into RDF knowledge graph with recursive structure and edge labels',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/rdf-json-ld--story',
  },
  {
    id: 'performance',
    name: 'Performance',
    category: 'Performance',
    component: Performance,
    description: 'Large graph visualization with configurable nodes/edges/clusters, ForceAtlas2 layout worker, and optimized rendering',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/performance--story',
  },
  {
    id: 'drag-nodes',
    name: 'Drag Nodes',
    category: 'Interactions',
    component: DragNodes,
    description: 'Drag and drop nodes, click to create new nodes with auto-connecting edges, force layout keeps graph organized',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/mouse-manipulation--story',
  },
  {
    id: 'communities-louvain',
    name: 'Communities (Louvain)',
    category: 'Advanced',
    component: CommunitiesLouvain,
    description: 'Community detection using Louvain algorithm on Les Misérables network with color-coded clusters and zoom controls',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/communities--story',
  },
  {
    id: 'edge-curve-basic-example',
    name: 'Edge Curve - Basic Example',
    category: 'Satellite Packages',
    component: EdgeCurveBasicExample,
    description: 'Curved edges using EdgeCurveProgram from @sigma/edge-curve satellite package on Les Misérables network',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/edge-curve-basic-example',
  },
  {
    id: 'edge-curve-interactions',
    name: 'Edge Curve - Interactions',
    category: 'Satellite Packages',
    component: EdgeCurveInteractions,
    description: 'Interactive curved edges with hover effects: highlight edge on hover, show connected nodes, dim other elements',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-edge-curve',
  },
  {
    id: 'edge-curve-labels',
    name: 'Edge Curve - Labels',
    category: 'Satellite Packages',
    component: EdgeCurveLabels,
    description: 'Curved and straight edges with edge labels using EdgeArrowProgram and EdgeCurveProgram with various curvature settings',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-edge-curve-labels',
  },
  {
    id: 'edge-curve-arrow-heads',
    name: 'Edge Curve - Arrow Heads',
    category: 'Satellite Packages',
    component: EdgeCurveArrowHeads,
    description: 'Interactive arrow head visualization with dropdown to toggle between no arrow, single arrow, and double-sided arrows on curved and straight edges',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-edge-curve-arrow-heads',
  },
  {
    id: 'edge-curve-parallel-edges',
    name: 'Edge Curve - Parallel Edges',
    category: 'Satellite Packages',
    component: ParallelEdges,
    description: 'Multiple edges between same nodes using MultiGraph with automatic curvature calculation to prevent overlap',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-edge-curve-parallel-edges',
  },
  {
    id: 'export-image-available-options',
    name: 'Export Image - Available Options',
    category: 'Satellite Packages',
    component: ExportImageAvailableOptions,
    description: 'Export graph snapshot as PNG or JPEG with configurable layers, dimensions, background color, and camera state using @sigma/export-image',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-export-image',
  },
  {
    id: 'export-image-custom-layers-and-renderers',
    name: 'Export Image - Custom Layers & Renderers',
    category: 'Satellite Packages',
    component: CustomLayersAndRenderers,
    description: 'Export with custom node images (NodeImageProgram) and WebGL contours layer, with checkbox controls to select layers and toggle image inclusion',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/satellite-packages-export-image-custom-layers',
  },
  {
    id: 'layer-leaflet-basic-example',
    name: 'Layer Leaflet - Basic Example',
    category: 'Satellite Packages',
    component: LayerLeafletBasicExample,
    description: 'Sigma graph overlay on Leaflet map showing airport network with geographic coordinates (lat/lng)',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/layer-leaflet--story',
  },
  {
    id: 'utils-fit-viewport-to-nodes',
    name: 'Utils - Fit Viewport to Nodes',
    category: 'Satellite Packages',
    component: FitViewportToNodes,
    description: 'Zoom and fit viewport to specific node selections using fitViewportToNodes from @sigma/utils with animated transitions',
    storybookUrl: 'https://www.sigmajs.org/storybook/?path=/story/utils-fit-viewport-to-nodes--story',
  },
  // Add more examples here as you convert them
];

// Group examples by category
export const groupedExamples = exampleRegistry.reduce((acc, example) => {
  if (!acc[example.category]) {
    acc[example.category] = [];
  }
  acc[example.category].push(example);
  return acc;
}, {} as Record<string, Example[]>);

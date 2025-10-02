# API Patterns & Code Snippets

**Copy-paste ready patterns for common Sigma.js tasks in React**

---

## Table of Contents

1. [Graphology API (Graph Manipulation)](#graphology-api)
2. [Sigma Camera API](#camera-api)
3. [Event Handling Patterns](#event-handling-patterns)
4. [Reducer Patterns (Dynamic Styling)](#reducer-patterns)
5. [Layout Patterns](#layout-patterns)
6. [Data Loading Patterns](#data-loading-patterns)

---

## Graphology API

### Graph Creation

```typescript
import Graph from "graphology";
import { DirectedGraph, UndirectedGraph, MultiDirectedGraph } from "graphology";

// Standard graph (mixed edges)
const graph = new Graph();

// Directed graph only
const directedGraph = new DirectedGraph();

// Undirected graph only
const undirectedGraph = new UndirectedGraph();

// Multi-graph (allows parallel edges)
const multiGraph = new MultiDirectedGraph();
```

### Adding Nodes

```typescript
// Basic node
graph.addNode("node1", {
  x: 0,
  y: 0,
  size: 10,
  label: "Node 1",
  color: "#3388ff",
});

// Generate nodes programmatically
for (let i = 0; i < 10; i++) {
  graph.addNode(`node${i}`, {
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 10 + 5,
    label: `Node ${i}`,
    color: `hsl(${Math.random() * 360}, 70%, 50%)`,
  });
}

// Add node with custom attributes
interface CustomNodeAttributes {
  x: number;
  y: number;
  size: number;
  label: string;
  category?: string;
  value?: number;
}

graph.addNode("customNode", {
  x: 50,
  y: 50,
  size: 15,
  label: "Custom",
  category: "important",
  value: 42,
});
```

### Adding Edges

```typescript
// Basic edge
graph.addEdge("node1", "node2");

// Edge with attributes
graph.addEdge("node1", "node2", {
  size: 2,
  color: "#cccccc",
  label: "connects to",
});

// Directed edge (for mixed graphs)
graph.addDirectedEdge("source", "target");

// Undirected edge (for mixed graphs)
graph.addUndirectedEdge("node1", "node2");

// Multiple edges between same nodes (requires MultiGraph)
const multiGraph = new MultiDirectedGraph();
multiGraph.addNode("A", { x: 0, y: 0, size: 10 });
multiGraph.addNode("B", { x: 10, y: 10, size: 10 });
multiGraph.addEdge("A", "B", { label: "Edge 1" });
multiGraph.addEdge("A", "B", { label: "Edge 2" }); // Parallel edge!
```

### Querying Nodes

```typescript
const sigma = useSigma();
const graph = sigma.getGraph();

// Check if node exists
if (graph.hasNode("node1")) {
  console.log("Node exists");
}

// Get node attributes
const attributes = graph.getNodeAttributes("node1");
console.log(attributes); // { x: 0, y: 0, size: 10, ... }

// Get specific attribute
const size = graph.getNodeAttribute("node1", "size");

// Get all nodes
const nodes = graph.nodes();
console.log(nodes); // ["node1", "node2", "node3"]

// Count nodes
const nodeCount = graph.order;
console.log(`Graph has ${nodeCount} nodes`);

// Iterate over nodes
graph.forEachNode((node, attributes) => {
  console.log(node, attributes);
});

// Get neighbors of a node
const neighbors = graph.neighbors("node1");
console.log(neighbors); // ["node2", "node3"]

// Get node degree (number of connections)
const degree = graph.degree("node1");
console.log(`Node1 has ${degree} connections`);
```

### Querying Edges

```typescript
const sigma = useSigma();
const graph = sigma.getGraph();

// Check if edge exists
if (graph.hasEdge("node1", "node2")) {
  console.log("Edge exists");
}

// Get edge by nodes
const edge = graph.edge("node1", "node2");

// Get edge attributes
const attributes = graph.getEdgeAttributes(edge);

// Get all edges
const edges = graph.edges();
console.log(edges); // ["edge1", "edge2", "edge3"]

// Count edges
const edgeCount = graph.size;
console.log(`Graph has ${edgeCount} edges`);

// Iterate over edges
graph.forEachEdge((edge, attributes, source, target) => {
  console.log(`${source} -> ${target}`, attributes);
});

// Get edges of a node
const nodeEdges = graph.edges("node1");

// Get directed edges from a node
const outEdges = graph.outEdges("node1");

// Get directed edges to a node
const inEdges = graph.inEdges("node1");
```

### Updating Nodes

```typescript
const sigma = useSigma();
const graph = sigma.getGraph();

// Set single attribute
graph.setNodeAttribute("node1", "color", "#ff0000");

// Update attribute with function
graph.updateNodeAttribute("node1", "size", (size) => size * 2);

// Merge multiple attributes
graph.mergeNodeAttributes("node1", {
  color: "#00ff00",
  size: 20,
  highlighted: true,
});

// Remove attribute
graph.removeNodeAttribute("node1", "highlighted");

// Replace all attributes
graph.replaceNodeAttributes("node1", {
  x: 0,
  y: 0,
  size: 10,
  label: "Updated Node",
});
```

### Updating Edges

```typescript
const sigma = useSigma();
const graph = sigma.getGraph();

// Get edge ID
const edge = graph.edge("node1", "node2");

// Set single attribute
graph.setEdgeAttribute(edge, "color", "#ff0000");

// Update attribute with function
graph.updateEdgeAttribute(edge, "size", (size) => size * 2);

// Merge multiple attributes
graph.mergeEdgeAttributes(edge, {
  color: "#00ff00",
  size: 3,
  label: "Updated",
});

// Remove attribute
graph.removeEdgeAttribute(edge, "label");
```

### Deleting Nodes & Edges

```typescript
const sigma = useSigma();
const graph = sigma.getGraph();

// Remove node (also removes connected edges)
graph.dropNode("node1");

// Remove edge
const edge = graph.edge("node1", "node2");
graph.dropEdge(edge);

// Remove edge by nodes
graph.dropEdge("node1", "node2");

// Clear all nodes and edges
graph.clear();
```

---

## Camera API

### Get Camera

```typescript
const sigma = useSigma();
const camera = sigma.getCamera();
```

### Camera State

```typescript
// Get current camera state
const state = camera.getState();
console.log(state); // { x: 0, y: 0, ratio: 1, angle: 0 }

// Get individual values
const x = camera.x;
const y = camera.y;
const ratio = camera.ratio; // Zoom level (higher = zoomed out)
const angle = camera.angle; // Rotation in radians
```

### Camera Movement

```typescript
const camera = sigma.getCamera();

// Go to specific position
camera.setState({ x: 100, y: 100, ratio: 0.5 });

// Simplified goTo (same as setState)
camera.goTo({ x: 0, y: 0, ratio: 1 });

// Animated zoom
camera.animatedZoom({ duration: 1000 }); // 1 second

// Animated unzoom
camera.animatedUnzoom({ duration: 1000 });

// Animated reset to default view
camera.animatedReset({ duration: 500 });
```

### Focus on Node

```typescript
const FocusNode: FC<{ nodeId: string }> = ({ nodeId }) => {
  const sigma = useSigma();

  const focusOnNode = () => {
    const camera = sigma.getCamera();
    const graph = sigma.getGraph();

    if (!graph.hasNode(nodeId)) return;

    const nodePosition = graph.getNodeAttributes(nodeId);

    camera.animate(
      { x: nodePosition.x, y: nodePosition.y, ratio: 0.5 },
      { duration: 500 }
    );
  };

  return <button onClick={focusOnNode}>Focus on Node</button>;
};
```

### Fit Graph to View

```typescript
const FitGraphToView: FC = () => {
  const sigma = useSigma();

  const fitToView = () => {
    const camera = sigma.getCamera();
    const graph = sigma.getGraph();

    // Get graph bounds
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;

    graph.forEachNode((node, attrs) => {
      minX = Math.min(minX, attrs.x);
      maxX = Math.max(maxX, attrs.x);
      minY = Math.min(minY, attrs.y);
      maxY = Math.max(maxY, attrs.y);
    });

    // Calculate center and zoom
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    const width = maxX - minX;
    const height = maxY - minY;
    const ratio = Math.max(width, height) / 500; // Adjust for your container

    camera.animate(
      { x: centerX, y: centerY, ratio },
      { duration: 500 }
    );
  };

  return <button onClick={fitToView}>Fit to View</button>;
};
```

### Zoom Controls

```typescript
const ZoomControls: FC = () => {
  const sigma = useSigma();

  const zoomIn = () => {
    const camera = sigma.getCamera();
    camera.animatedZoom({ duration: 300 });
  };

  const zoomOut = () => {
    const camera = sigma.getCamera();
    camera.animatedUnzoom({ duration: 300 });
  };

  const resetZoom = () => {
    const camera = sigma.getCamera();
    camera.animatedReset({ duration: 300 });
  };

  return (
    <div>
      <button onClick={zoomIn}>Zoom In</button>
      <button onClick={zoomOut}>Zoom Out</button>
      <button onClick={resetZoom}>Reset</button>
    </div>
  );
};
```

---

## Event Handling Patterns

### Basic Events

```typescript
const BasicEvents: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log("Clicked node:", event.node);
        console.log("Mouse event:", event.event);
      },
      clickStage: (event) => {
        console.log("Clicked empty space");
      },
    });
  }, [registerEvents]);

  return null;
};
```

### Events with State

```typescript
const EventsWithState: FC = () => {
  const registerEvents = useRegisterEvents();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        setSelectedNode(event.node);
      },
      clickStage: () => {
        setSelectedNode(null);
      },
      enterNode: (event) => {
        setHoveredNode(event.node);
      },
      leaveNode: () => {
        setHoveredNode(null);
      },
    });
  }, [registerEvents]);

  return (
    <div style={{ position: "absolute", top: 10, left: 10 }}>
      {selectedNode && <div>Selected: {selectedNode}</div>}
      {hoveredNode && <div>Hovered: {hoveredNode}</div>}
    </div>
  );
};
```

### All Event Types

```typescript
const AllEvents: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      // Node events
      clickNode: (e) => console.log("clickNode", e.node),
      doubleClickNode: (e) => console.log("doubleClickNode", e.node),
      rightClickNode: (e) => console.log("rightClickNode", e.node),
      downNode: (e) => console.log("downNode", e.node),
      enterNode: (e) => console.log("enterNode", e.node),
      leaveNode: (e) => console.log("leaveNode", e.node),

      // Edge events (must enable in settings!)
      clickEdge: (e) => console.log("clickEdge", e.edge),
      enterEdge: (e) => console.log("enterEdge", e.edge),
      leaveEdge: (e) => console.log("leaveEdge", e.edge),

      // Stage events
      clickStage: (e) => console.log("clickStage"),
      doubleClickStage: (e) => console.log("doubleClickStage"),
      rightClickStage: (e) => console.log("rightClickStage"),
      downStage: (e) => console.log("downStage"),

      // Other events
      mousemovebody: (e) => console.log("mousemove"),
      beforeRender: () => console.log("beforeRender"),
      afterRender: () => console.log("afterRender"),
    });
  }, [registerEvents]);

  return null;
};
```

---

## Reducer Patterns

### Hover Highlighting

```typescript
const HoverHighlight: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Update reducer when hover state changes
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return {
          ...data,
          color: "#ff0000",
          size: data.size * 1.5,
        };
      }
      return data;
    });
  }, [hoveredNode, sigma]);

  // Register hover events
  useEffect(() => {
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return null;
};
```

### Selection (Click to Select)

```typescript
const NodeSelection: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Highlight selected node
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === selectedNode) {
        return {
          ...data,
          color: "#ff0000",
          borderColor: "#000000",
          borderSize: 2,
        };
      }
      return data;
    });
  }, [selectedNode, sigma]);

  // Handle click events
  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        setSelectedNode(event.node);
      },
      clickStage: () => {
        setSelectedNode(null);
      },
    });
  }, [registerEvents]);

  return null;
};
```

### Highlight Neighbors

```typescript
const HighlightNeighbors: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Update node and edge reducers
  useEffect(() => {
    const graph = sigma.getGraph();
    const neighbors = hoveredNode ? graph.neighbors(hoveredNode) : [];

    sigma.setSetting("nodeReducer", (node, data) => {
      // Highlight hovered node
      if (node === hoveredNode) {
        return { ...data, color: "#ff0000", zIndex: 1 };
      }
      // Highlight neighbors
      if (neighbors.includes(node)) {
        return { ...data, color: "#00ff00", zIndex: 1 };
      }
      // Fade other nodes
      if (hoveredNode) {
        return { ...data, color: "#cccccc", zIndex: 0 };
      }
      return data;
    });

    sigma.setSetting("edgeReducer", (edge, data) => {
      const graph = sigma.getGraph();
      const { source, target } = graph.extremities(edge);

      // Highlight edges connected to hovered node
      if (source === hoveredNode || target === hoveredNode) {
        return { ...data, color: "#ff0000", size: data.size * 2 };
      }
      // Fade other edges
      if (hoveredNode) {
        return { ...data, color: "#eeeeee" };
      }
      return data;
    });
  }, [hoveredNode, sigma]);

  // Register events
  useEffect(() => {
    registerEvents({
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return null;
};
```

### Dynamic Node Sizing by Degree

```typescript
const SizeByDegree: FC = () => {
  const sigma = useSigma();

  useEffect(() => {
    const graph = sigma.getGraph();

    // Calculate min/max degree
    let minDegree = Infinity;
    let maxDegree = -Infinity;

    graph.forEachNode((node) => {
      const degree = graph.degree(node);
      minDegree = Math.min(minDegree, degree);
      maxDegree = Math.max(maxDegree, degree);
    });

    // Set reducer to scale size by degree
    sigma.setSetting("nodeReducer", (node, data) => {
      const degree = graph.degree(node);
      const normalizedDegree = (degree - minDegree) / (maxDegree - minDegree);
      const size = 5 + normalizedDegree * 20; // Size between 5 and 25

      return {
        ...data,
        size,
        label: `${data.label} (${degree})`,
      };
    });
  }, [sigma]);

  return null;
};
```

---

## Layout Patterns

### Circular Layout

```typescript
const CircularLayoutExample: FC = () => {
  const { assign } = useLayoutCircular();

  useEffect(() => {
    assign(); // Apply circular layout immediately
  }, [assign]);

  return null;
};
```

### ForceAtlas2 Layout

```typescript
const ForceAtlas2Example: FC = () => {
  const { start, stop, isRunning } = useLayoutForceAtlas2({
    settings: {
      gravity: 1,
      scalingRatio: 10,
      slowDown: 1,
      barnesHutOptimize: true,
      barnesHutTheta: 0.5,
    },
  });

  useEffect(() => {
    // Start layout
    start();

    // Stop after 3 seconds
    const timeout = setTimeout(() => {
      stop();
    }, 3000);

    return () => {
      clearTimeout(timeout);
      stop();
    };
  }, [start, stop]);

  return (
    <div style={{ position: "absolute", top: 10, left: 10 }}>
      {isRunning ? "Layout running..." : "Layout stopped"}
    </div>
  );
};
```

### Layout with Controls

```typescript
const LayoutControls: FC = () => {
  const { start, stop, kill, isRunning } = useLayoutForceAtlas2();
  const [duration, setDuration] = useState(3000);

  const runLayout = () => {
    start();
    setTimeout(() => stop(), duration);
  };

  return (
    <div>
      <button onClick={runLayout} disabled={isRunning}>
        Run Layout
      </button>
      <button onClick={stop} disabled={!isRunning}>
        Stop
      </button>
      <input
        type="range"
        min="1000"
        max="10000"
        step="1000"
        value={duration}
        onChange={(e) => setDuration(Number(e.target.value))}
      />
      <span>{duration}ms</span>
      <div>Status: {isRunning ? "Running" : "Stopped"}</div>
    </div>
  );
};
```

---

## Data Loading Patterns

### Load from JSON

```typescript
interface GraphData {
  nodes: Array<{ id: string; label: string; x: number; y: number; size: number }>;
  edges: Array<{ source: string; target: string }>;
}

const LoadFromJSON: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    fetch("/data/graph.json")
      .then((res) => res.json())
      .then((data: GraphData) => {
        const graph = new Graph();

        // Add nodes
        data.nodes.forEach((node) => {
          graph.addNode(node.id, {
            x: node.x,
            y: node.y,
            size: node.size,
            label: node.label,
          });
        });

        // Add edges
        data.edges.forEach((edge) => {
          graph.addEdge(edge.source, edge.target);
        });

        loadGraph(graph);
      });
  }, [loadGraph]);

  return null;
};
```

### Generate Random Graph

```typescript
const GenerateRandom: FC<{ nodeCount: number; edgeDensity: number }> = ({
  nodeCount,
  edgeDensity,
}) => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // Add nodes in a circle
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i / nodeCount) * 2 * Math.PI;
      graph.addNode(`node${i}`, {
        x: Math.cos(angle) * 100,
        y: Math.sin(angle) * 100,
        size: 10,
        label: `Node ${i}`,
        color: `hsl(${(i / nodeCount) * 360}, 70%, 50%)`,
      });
    }

    // Add random edges
    const maxEdges = (nodeCount * (nodeCount - 1)) / 2;
    const edgeCount = Math.floor(maxEdges * edgeDensity);

    for (let i = 0; i < edgeCount; i++) {
      const source = `node${Math.floor(Math.random() * nodeCount)}`;
      const target = `node${Math.floor(Math.random() * nodeCount)}`;

      if (source !== target && !graph.hasEdge(source, target)) {
        graph.addEdge(source, target);
      }
    }

    loadGraph(graph);
  }, [nodeCount, edgeDensity, loadGraph]);

  return null;
};

// Usage
export const RandomGraphExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <GenerateRandom nodeCount={50} edgeDensity={0.1} />
  </SigmaContainer>
);
```

---

## Complete Example: Interactive Graph

```typescript
/**
 * Complete interactive graph example combining multiple patterns
 */

const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
  labelColor: { color: "#000000" },
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
};

const InteractiveGraph: FC = () => {
  const loadGraph = useLoadGraph();
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const { assign } = useLayoutCircular();

  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Load graph
  useEffect(() => {
    const graph = new Graph();

    // Create a simple network
    for (let i = 0; i < 10; i++) {
      graph.addNode(`node${i}`, {
        x: 0,
        y: 0,
        size: 10,
        label: `Node ${i}`,
        color: "#3388ff",
      });
    }

    // Add random edges
    for (let i = 0; i < 15; i++) {
      const source = `node${Math.floor(Math.random() * 10)}`;
      const target = `node${Math.floor(Math.random() * 10)}`;
      if (source !== target && !graph.hasEdge(source, target)) {
        graph.addEdge(source, target);
      }
    }

    loadGraph(graph);
    assign(); // Apply circular layout
  }, [loadGraph, assign]);

  // Node reducer for highlighting
  useEffect(() => {
    const graph = sigma.getGraph();
    const neighbors = hoveredNode ? graph.neighbors(hoveredNode) : [];

    sigma.setSetting("nodeReducer", (node, data) => {
      // Selected node
      if (node === selectedNode) {
        return { ...data, color: "#ff0000", size: data.size * 1.5 };
      }
      // Hovered node
      if (node === hoveredNode) {
        return { ...data, color: "#ffaa00", size: data.size * 1.3 };
      }
      // Neighbors of hovered node
      if (neighbors.includes(node)) {
        return { ...data, color: "#00ff00" };
      }
      // Fade non-relevant nodes when hovering
      if (hoveredNode) {
        return { ...data, color: "#cccccc" };
      }
      return data;
    });
  }, [selectedNode, hoveredNode, sigma]);

  // Register events
  useEffect(() => {
    registerEvents({
      clickNode: (event) => setSelectedNode(event.node),
      clickStage: () => setSelectedNode(null),
      enterNode: (event) => setHoveredNode(event.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return (
    <div style={{ position: "absolute", top: 10, left: 10, background: "white", padding: 10 }}>
      {selectedNode && <div>Selected: {selectedNode}</div>}
      {hoveredNode && <div>Hovered: {hoveredNode}</div>}
    </div>
  );
};

export const InteractiveGraphExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
    <InteractiveGraph />
  </SigmaContainer>
);
```

---

**Last updated:** 2025-10-01

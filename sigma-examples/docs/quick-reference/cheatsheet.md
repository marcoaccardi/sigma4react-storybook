# React Sigma Quick Reference

**Fast lookup guide for converting vanilla Sigma.js to React TypeScript**

---

## Essential Imports

```typescript
import { FC, useEffect, useState, useMemo } from "react";
import {
  SigmaContainer,
  useLoadGraph,
  useSigma,
  useRegisterEvents
} from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";
```

### Layout Imports (when needed)

```typescript
import { useLayoutCircular } from "@react-sigma/layout-circular";
import { useLayoutForceAtlas2 } from "@react-sigma/layout-forceatlas2";
```

---

## Basic Component Template

```typescript
// Settings (MUST be outside component or memoized!)
const SETTINGS = {
  renderLabels: true,
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    // Add nodes/edges here
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Main component
export const ExampleName: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
    <LoadGraph />
  </SigmaContainer>
);
```

---

## Node Attributes

**Required:**
```typescript
{
  x: number,        // X position
  y: number,        // Y position
  size: number,     // Node size
}
```

**Optional:**
```typescript
{
  label: string,           // Node label text
  color: string,           // Hex or CSS color
  type: string,            // Renderer type (default: "circle")
  hidden: boolean,         // Hide node
  highlighted: boolean,    // Highlight state
  forceLabel: boolean,     // Always show label
  zIndex: number,          // Rendering order
}
```

**Example:**
```typescript
graph.addNode("node1", {
  x: 0,
  y: 0,
  size: 10,
  label: "Node 1",
  color: "#3388ff",
});
```

---

## Edge Attributes

**Required:**
```typescript
// Source and target nodes must exist
graph.addEdge("sourceId", "targetId");
```

**Optional:**
```typescript
{
  size: number,      // Edge thickness
  color: string,     // Hex or CSS color
  label: string,     // Edge label
  type: string,      // Renderer type (default: "line")
  hidden: boolean,   // Hide edge
  forceLabel: boolean,  // Always show label
}
```

**Example:**
```typescript
graph.addEdge("node1", "node2", {
  size: 2,
  color: "#cccccc",
  label: "connects",
});
```

---

## Common Settings

```typescript
const SETTINGS = {
  // Labels
  renderLabels: true,                   // Show node labels
  labelSize: 12,                        // Label font size
  labelColor: { color: "#000000" },     // Label color
  labelWeight: "normal",                // Font weight
  labelDensity: 0.07,                   // Label collision detection
  labelGridCellSize: 60,                // Grid cell size
  labelRenderedSizeThreshold: 6,        // Min size to show labels

  // Edge Events (disabled by default!)
  enableEdgeClickEvents: true,          // Enable edge clicks
  enableEdgeHoverEvents: true,          // Enable edge hovers
  enableEdgeWheelEvents: true,          // Enable edge wheel

  // Edge Labels
  renderEdgeLabels: false,              // Show edge labels
  edgeLabelSize: 10,                    // Edge label size
  edgeLabelColor: { color: "#000000" }, // Edge label color

  // Colors
  defaultNodeColor: "#999999",          // Default node color
  defaultEdgeColor: "#cccccc",          // Default edge color

  // Performance
  hideEdgesOnMove: false,               // Hide edges while moving
  hideLabelsOnMove: false,              // Hide labels while moving
  renderLabels: true,                   // Render labels at all

  // Camera
  minCameraRatio: 0.1,                  // Max zoom in
  maxCameraRatio: 10,                   // Max zoom out
};
```

---

## Graph Types

```typescript
import Graph from "graphology";                    // Default (mixed)
import { DirectedGraph } from "graphology";        // Directed only
import { UndirectedGraph } from "graphology";      // Undirected only
import { MultiGraph } from "graphology";           // Allows parallel edges
import { MultiDirectedGraph } from "graphology";   // Most common for complex graphs
```

**Usage:**
```typescript
// Option 1: Create and load
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  useEffect(() => {
    const graph = new MultiDirectedGraph();
    loadGraph(graph);
  }, [loadGraph]);
  return null;
};

// Option 2: Pass constructor to container
<SigmaContainer graph={MultiDirectedGraph}>
  <LoadGraph />
</SigmaContainer>
```

---

## React Sigma Hooks

### useLoadGraph()

```typescript
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    // ... add nodes/edges
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};
```

### useSigma()

```typescript
const MyComponent: FC = () => {
  const sigma = useSigma();

  const handleClick = () => {
    const graph = sigma.getGraph();
    const camera = sigma.getCamera();
    sigma.refresh();
  };

  return <button onClick={handleClick}>Action</button>;
};
```

### useRegisterEvents()

```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => console.log(event.node),
      enterNode: (event) => console.log(event.node),
      leaveNode: (event) => console.log(event.node),
    });
  }, [registerEvents]);

  return null;
};
```

### useLayoutCircular()

```typescript
const LayoutComponent: FC = () => {
  const { assign } = useLayoutCircular();

  useEffect(() => {
    assign(); // Apply layout
  }, [assign]);

  return null;
};
```

### useLayoutForceAtlas2()

```typescript
const LayoutComponent: FC = () => {
  const { start, stop, isRunning } = useLayoutForceAtlas2();

  useEffect(() => {
    start();
    setTimeout(() => stop(), 3000); // Run for 3 seconds
  }, [start, stop]);

  return null;
};
```

---

## Event Types

### Node Events
- `clickNode` - Click on node
- `doubleClickNode` - Double click
- `rightClickNode` - Right click
- `downNode` - Mouse down
- `enterNode` - Mouse enter (hover start)
- `leaveNode` - Mouse leave (hover end)
- `wheelNode` - Mouse wheel on node

### Edge Events (must enable in settings!)
- `clickEdge` - Click on edge
- `doubleClickEdge` - Double click
- `rightClickEdge` - Right click
- `downEdge` - Mouse down
- `enterEdge` - Mouse enter
- `leaveEdge` - Mouse leave
- `wheelEdge` - Mouse wheel on edge

### Stage Events (canvas background)
- `clickStage` - Click on empty space
- `doubleClickStage` - Double click
- `rightClickStage` - Right click
- `downStage` - Mouse down
- `wheelStage` - Mouse wheel on canvas

### Other Events
- `mousemovebody` - Mouse movement anywhere
- `beforeRender` - Before each render frame
- `afterRender` - After each render frame
- `resize` - Canvas resized
- `kill` - Sigma instance destroyed

---

## Conversion Quick Guide

| Vanilla JS | React TypeScript |
|------------|------------------|
| `new Sigma(graph, container, settings)` | `<SigmaContainer settings={SETTINGS}>` |
| `const graph = new Graph()` | `useLoadGraph()` in `useEffect` |
| `sigma.on("clickNode", handler)` | `useRegisterEvents({ clickNode: handler })` |
| `sigma.getGraph()` | `useSigma().getGraph()` |
| `sigma.getCamera()` | `useSigma().getCamera()` |
| `sigma.refresh()` | Usually automatic in React |
| `sigma.setSetting(key, val)` | Same: `sigma.setSetting(key, val)` |
| Settings in constructor | `settings` prop (immutable!) |

---

## Critical Rules ⚠️

1. **Always set explicit height:**
   ```typescript
   <SigmaContainer style={{ height: "100%", width: "100%" }}>
   ```

2. **Always import CSS:**
   ```typescript
   import "@react-sigma/core/lib/style.css";
   ```

3. **Settings MUST be immutable:**
   ```typescript
   // ✅ GOOD
   const SETTINGS = { ... };

   // ❌ BAD - will recreate Sigma instance every render!
   const settings = { ... }; // Inside component
   ```

4. **Enable edge events explicitly:**
   ```typescript
   const SETTINGS = {
     enableEdgeClickEvents: true,
     enableEdgeHoverEvents: true,
   };
   ```

5. **Use hooks only inside SigmaContainer children:**
   ```typescript
   // ❌ BAD
   export const App = () => {
     const sigma = useSigma(); // Error!
   };

   // ✅ GOOD
   const MyComponent = () => {
     const sigma = useSigma(); // Works!
   };
   export const App = () => (
     <SigmaContainer>
       <MyComponent />
     </SigmaContainer>
   );
   ```

---

## File Structure Convention

```
sigma-examples/
├── examples/
│   ├── basic-graph.tsx           # Simple example
│   ├── events-example.tsx        # Event handling
│   ├── layout-forceatlas2.tsx    # ForceAtlas2 layout
│   └── hover-highlight.tsx       # Reducers example
├── src/
│   ├── App.tsx                   # Main app
│   └── exampleRegistry.tsx       # Example registry
└── docs/
    ├── vanilla-to-react-conversion.md
    └── quick-reference/
        ├── cheatsheet.md         # This file
        ├── common-mistakes.md
        └── api-patterns.md
```

---

## Next Steps

- **For detailed conversion workflow:** See [vanilla-to-react-conversion.md](../vanilla-to-react-conversion.md)
- **For troubleshooting:** See [common-mistakes.md](./common-mistakes.md)
- **For API patterns:** See [api-patterns.md](./api-patterns.md)
- **For comprehensive rules:** See [CLAUDE.md](../../../CLAUDE.md) at project root

---

**Last updated:** 2025-10-01

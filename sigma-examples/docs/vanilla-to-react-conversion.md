# Vanilla JavaScript to React TypeScript Conversion Guide

Step-by-step workflow for converting Sigma.js Storybook examples from vanilla JavaScript to React TypeScript components.

## Overview

This guide walks you through the complete process of converting any Sigma.js example from the official Storybook to a React TypeScript component.

**Time per conversion:** 15-30 minutes (after practice)

**Difficulty levels:**
- 🟢 **Beginner**: Basic graphs, simple styling
- 🟡 **Intermediate**: Events, reducers, layouts
- 🔴 **Advanced**: Complex interactions, custom renderers

---

## Conversion Workflow

### Phase 1: Discovery & Planning

#### Step 1.1: Find an Example
1. Browse https://www.sigmajs.org/storybook/
2. Pick an example that interests you
3. Note its category and complexity

**Categories to explore:**
- **Basic**: Simple graphs, node/edge creation
- **Interactions**: Events, drag & drop, tooltips
- **Layouts**: ForceAtlas2, circular, random
- **Styling**: Colors, sizes, labels, reducers
- **Data**: Loading GEXF, JSON, CSV files
- **Advanced**: Custom renderers, WebGL programs

#### Step 1.2: Understand the Vanilla Code
1. Click "Show code" in Storybook
2. Copy the vanilla JavaScript code
3. Identify the key parts:
   - Graph creation
   - Node/edge addition
   - Settings object
   - Event listeners
   - Reducers (if any)
   - DOM manipulation

**Example vanilla code structure:**
```javascript
const graph = new Graph();           // Graph creation
graph.addNode(...);                  // Data
graph.addEdge(...);                  // Data

const sigma = new Sigma(             // Sigma instantiation
  graph,
  container,
  { settings }                       // Settings
);

sigma.on("clickNode", handler);     // Events
```

#### Step 1.3: Test in Vanilla Reference (Optional)
1. Open `/examples/vanilla-reference/index.html`
2. Add a new example if needed
3. Test that it works correctly
4. Take screenshots/notes for comparison

---

### Phase 2: Conversion

#### Step 2.1: Create File Structure

**File location:** `sigma-examples/examples/[example-name].tsx`

**Template:**
```typescript
/**
 * [Example Name]
 *
 * Converted from: [Storybook URL]
 *
 * Demonstrates:
 * - Feature 1
 * - Feature 2
 * - Feature 3
 */

import { FC, useEffect } from "react";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";

// Settings (immutable)
const SETTINGS = {
  // ... settings
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    // ... graph creation
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Main export
export const ExampleName: FC = () => {
  return (
    <div style={{ height: "600px", width: "100%" }}>
      <SigmaContainer style={{ height: "100%" }} settings={SETTINGS}>
        <LoadGraph />
      </SigmaContainer>
    </div>
  );
};
```

#### Step 2.2: Convert Settings

**Vanilla:**
```javascript
const sigma = new Sigma(graph, container, {
  renderLabels: true,
  labelSize: 12,
  enableEdgeEvents: true,
});
```

**React:**
```typescript
const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
  enableEdgeClickEvents: true,  // Note: specific event types in React
  enableEdgeHoverEvents: true,
};
```

**⚠️ CRITICAL:** Settings must be outside component OR wrapped in useMemo!

```typescript
// ✅ GOOD - Outside component
const SETTINGS = { ... };

// ✅ GOOD - Inside with useMemo
const settings = useMemo(() => ({ ... }), []);

// ❌ BAD - Will kill/recreate Sigma instance!
const settings = { ... };  // Inside component without useMemo
```

#### Step 2.3: Convert Graph Creation

**Vanilla:**
```javascript
const graph = new Graph();
graph.addNode("1", { x: 0, y: 0, size: 10, label: "A" });
graph.addNode("2", { x: 1, y: 1, size: 10, label: "B" });
graph.addEdge("1", "2");
```

**React:**
```typescript
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    graph.addNode("1", { x: 0, y: 0, size: 10, label: "A" });
    graph.addNode("2", { x: 1, y: 1, size: 10, label: "B" });
    graph.addEdge("1", "2");

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};
```

**Key changes:**
- Wrap in `useLoadGraph()` hook
- Create graph inside `useEffect`
- Call `loadGraph(graph)` when done
- Return `null` (component is just for side effects)

#### Step 2.4: Convert Events

**Vanilla:**
```javascript
sigma.on("clickNode", (event) => {
  console.log("Clicked:", event.node);
});

sigma.on("enterNode", (event) => {
  console.log("Hover:", event.node);
});
```

**React:**
```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log("Clicked:", event.node);
      },
      enterNode: (event) => {
        console.log("Hover:", event.node);
      },
    });
  }, [registerEvents]);

  return null;
};

// Then add to main component:
<SigmaContainer style={{ height: "100%" }} settings={SETTINGS}>
  <LoadGraph />
  <EventHandler />
</SigmaContainer>
```

**Available events:**
- Node: `clickNode`, `enterNode`, `leaveNode`, `downNode`, `doubleClickNode`, `rightClickNode`
- Edge: `clickEdge`, `enterEdge`, `leaveEdge`, `downEdge`, `doubleClickEdge`, `rightClickEdge`
- Stage: `clickStage`, `doubleClickStage`, `rightClickStage`, `downStage`, `wheelStage`
- Other: `mousemovebody`, `beforeRender`, `afterRender`

#### Step 2.5: Convert Reducers (Dynamic Styling)

**Vanilla:**
```javascript
let hoveredNode = null;

const sigma = new Sigma(graph, container, {
  nodeReducer: (node, data) => {
    if (node === hoveredNode) {
      return { ...data, color: "#f00", size: data.size * 1.5 };
    }
    return data;
  },
});

sigma.on("enterNode", (e) => {
  hoveredNode = e.node;
  sigma.refresh();
});

sigma.on("leaveNode", () => {
  hoveredNode = null;
  sigma.refresh();
});
```

**React:**
```typescript
const NodeHighlight: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Update reducer when state changes
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return { ...data, color: "#f00", size: data.size * 1.5 };
      }
      return data;
    });
  }, [hoveredNode, sigma]);

  // Register events
  useEffect(() => {
    registerEvents({
      enterNode: (e) => setHoveredNode(e.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return null;
};
```

**Key patterns:**
1. Use state for hover/selection tracking
2. Update reducer in `useEffect` when state changes
3. Use `sigma.setSetting()` to update reducer dynamically
4. Reducer automatically triggers re-render (no need for `sigma.refresh()`)

#### Step 2.6: Convert Sigma Instance Access

**Vanilla:**
```javascript
// You have direct access
const graph = sigma.getGraph();
const camera = sigma.getCamera();

sigma.refresh();
camera.goTo({ x: 0, y: 0, ratio: 1 });
```

**React:**
```typescript
const MyComponent: FC = () => {
  const sigma = useSigma();

  const handleAction = () => {
    const graph = sigma.getGraph();
    const camera = sigma.getCamera();

    camera.goTo({ x: 0, y: 0, ratio: 1 });
    // Note: sigma.refresh() usually not needed in React
  };

  return <button onClick={handleAction}>Action</button>;
};
```

---

### Phase 3: Integration

#### Step 3.1: Add to Example Registry

**File:** `sigma-examples/src/exampleRegistry.tsx`

```typescript
// 1. Import at top
import { ExampleName } from "../examples/example-name";

// 2. Add to array
export const exampleRegistry: Example[] = [
  // ... existing examples
  {
    id: "example-name",                     // kebab-case, matches filename
    name: "Example Display Name",           // User-friendly name
    category: "Category Name",              // Group in sidebar
    component: ExampleName,                 // Component reference
    description: "Brief description",       // Shown in UI
    storybookUrl: "https://...",           // Link to original
  },
];
```

**Categories:**
- "Getting Started"
- "Interactions"
- "Layouts"
- "Visual Styling"
- "Data Loading"
- "Performance"
- "Advanced"

#### Step 3.2: Test the Example

```bash
cd sigma-examples
npm run dev
```

**Checklist:**
- [ ] No TypeScript compilation errors
- [ ] Example appears in sidebar
- [ ] Clicking example loads it
- [ ] Graph renders correctly
- [ ] No console errors
- [ ] Events work (if applicable)
- [ ] Performance is acceptable

#### Step 3.3: Compare with Vanilla

Open side-by-side:
1. Your React version: `http://localhost:5173`
2. Vanilla version: `examples/vanilla-reference/index.html` or Storybook

**Verify:**
- Visual appearance matches
- Interactions work the same
- Performance is similar
- Labels/colors/sizes match

---

## Common Conversion Patterns

### Pattern 1: Basic Static Graph

**Vanilla:**
```javascript
const graph = new Graph();
graph.addNode("1", { x: 0, y: 0, size: 10 });

const sigma = new Sigma(graph, container, {
  renderLabels: true
});
```

**React:**
```typescript
const SETTINGS = { renderLabels: true };

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  useEffect(() => {
    const graph = new Graph();
    graph.addNode("1", { x: 0, y: 0, size: 10 });
    loadGraph(graph);
  }, [loadGraph]);
  return null;
};

export const Example: FC = () => (
  <SigmaContainer style={{ height: "600px" }} settings={SETTINGS}>
    <LoadGraph />
  </SigmaContainer>
);
```

**Complexity:** 🟢 Beginner

---

### Pattern 2: Events Without State

**Vanilla:**
```javascript
sigma.on("clickNode", (e) => alert(`Clicked ${e.node}`));
```

**React:**
```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();
  useEffect(() => {
    registerEvents({
      clickNode: (e) => alert(`Clicked ${e.node}`),
    });
  }, [registerEvents]);
  return null;
};
```

**Complexity:** 🟢 Beginner

---

### Pattern 3: Events With State (Hover Highlighting)

**Vanilla:**
```javascript
let hoveredNode = null;

sigma.setSetting("nodeReducer", (node, data) => {
  if (node === hoveredNode) {
    return { ...data, highlighted: true };
  }
  return data;
});

sigma.on("enterNode", (e) => {
  hoveredNode = e.node;
  sigma.refresh();
});
```

**React:**
```typescript
const NodeHighlight: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return { ...data, highlighted: true };
      }
      return data;
    });
  }, [hoveredNode, sigma]);

  useEffect(() => {
    registerEvents({
      enterNode: (e) => setHoveredNode(e.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, [registerEvents]);

  return null;
};
```

**Complexity:** 🟡 Intermediate

---

### Pattern 4: Dynamic Graph Manipulation

**Vanilla:**
```javascript
document.getElementById("addNode").addEventListener("click", () => {
  const graph = sigma.getGraph();
  graph.addNode(Date.now().toString(), {
    x: Math.random(),
    y: Math.random(),
    size: 10,
  });
});
```

**React:**
```typescript
const GraphManipulator: FC = () => {
  const sigma = useSigma();

  const addNode = () => {
    const graph = sigma.getGraph();
    graph.addNode(Date.now().toString(), {
      x: Math.random(),
      y: Math.random(),
      size: 10,
    });
  };

  return <button onClick={addNode}>Add Node</button>;
};
```

**Complexity:** 🟡 Intermediate

---

### Pattern 5: Layout Algorithms

**Vanilla:**
```javascript
import { circular } from "graphology-layout";

const graph = new Graph();
// ... add nodes
circular.assign(graph);

const sigma = new Sigma(graph, container);
```

**React:**
```typescript
import { useLayoutCircular } from "@react-sigma/layout-circular";

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  const { assign } = useLayoutCircular();

  useEffect(() => {
    const graph = new Graph();
    // ... add nodes
    loadGraph(graph);
    assign();  // Apply circular layout
  }, [loadGraph, assign]);

  return null;
};
```

**Complexity:** 🟡 Intermediate

**Note:** Requires `@react-sigma/layout-circular` package

---

### Pattern 6: Multiple Graph Types

**Vanilla:**
```javascript
const graph = new MultiDirectedGraph();  // Specific graph type
```

**React:**
```typescript
import { MultiDirectedGraph } from "graphology";

export const Example: FC = () => (
  <SigmaContainer
    graph={MultiDirectedGraph}  // Pass constructor
    style={{ height: "600px" }}
  >
    <LoadGraph />
  </SigmaContainer>
);
```

**Complexity:** 🟢 Beginner

---

## Troubleshooting Common Issues

### Issue 1: "Container has no height"

**Error:**
```
Error: container has no height
```

**Cause:** SigmaContainer needs explicit height

**Fix:**
```typescript
// ❌ Wrong
<SigmaContainer>

// ✅ Correct
<SigmaContainer style={{ height: "600px" }}>
```

---

### Issue 2: Graph Flickers / Performance Issues

**Symptom:** Graph constantly re-renders, camera resets, poor performance

**Cause:** Settings object changing on every render

**Fix:**
```typescript
// ❌ Wrong - creates new object every render
const Example: FC = () => {
  const settings = { renderLabels: true };  // BAD!
  return <SigmaContainer settings={settings}>

// ✅ Correct - outside component
const SETTINGS = { renderLabels: true };
const Example: FC = () => (
  <SigmaContainer settings={SETTINGS}>

// ✅ Correct - memoized
const Example: FC = () => {
  const settings = useMemo(() => ({ renderLabels: true }), []);
  return <SigmaContainer settings={settings}>
```

---

### Issue 3: Edge Events Not Firing

**Symptom:** `clickEdge`, `enterEdge` events don't work

**Cause:** Edge events disabled by default for performance

**Fix:**
```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,   // Enable edge clicks
  enableEdgeHoverEvents: true,   // Enable edge hovers
};
```

---

### Issue 4: Reducer Not Updating

**Symptom:** Changes to state don't affect node/edge appearance

**Cause:** Reducer not re-registered when state changes

**Fix:**
```typescript
// ✅ Correct - updates when hoveredNode changes
useEffect(() => {
  sigma.setSetting("nodeReducer", (node, data) => {
    if (node === hoveredNode) {
      return { ...data, highlighted: true };
    }
    return data;
  });
}, [hoveredNode, sigma]);  // Dependencies!
```

---

### Issue 5: TypeScript Errors

**Error:** Type issues with node/edge attributes

**Fix:**
```typescript
// Define custom types
interface NodeAttributes {
  x: number;
  y: number;
  size: number;
  label: string;
  color?: string;
}

// Use with graphology
const graph = new Graph<NodeAttributes>();
```

---

## Quick Reference

### Must-Have Imports

```typescript
import { FC, useEffect, useState, useMemo } from "react";
import {
  SigmaContainer,
  useLoadGraph,
  useRegisterEvents,
  useSigma
} from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";
```

### Component Structure Template

```typescript
const SETTINGS = { /* ... */ };

const LoadGraph: FC = () => { /* ... */ };
const EventHandler: FC = () => { /* ... */ };
const FeatureComponent: FC = () => { /* ... */ };

export const ExampleName: FC = () => (
  <div style={{ height: "600px", width: "100%" }}>
    <SigmaContainer style={{ height: "100%" }} settings={SETTINGS}>
      <LoadGraph />
      <EventHandler />
      <FeatureComponent />
    </SigmaContainer>
  </div>
);
```

### Conversion Checklist

- [ ] Settings outside component or memoized
- [ ] Graph loaded with `useLoadGraph()`
- [ ] Events registered with `useRegisterEvents()`
- [ ] Explicit height on SigmaContainer
- [ ] CSS imported (`@react-sigma/core/lib/style.css`)
- [ ] Edge events enabled in settings (if needed)
- [ ] Reducers updated via `sigma.setSetting()`
- [ ] All imports correct
- [ ] TypeScript compiles
- [ ] No console errors

---

## Advanced Topics

### Custom Renderers

Some examples use custom WebGL programs. These require deeper knowledge of Sigma's rendering pipeline.

**Difficulty:** 🔴 Advanced

**Resources:**
- Sigma.js custom renderers documentation
- WebGL program examples in Storybook

### Data Loading

Examples that load GEXF, JSON, or CSV files need adaptation for React's build system.

**Pattern:**
```typescript
// Place data file in public/ folder
// Then fetch it:

useEffect(() => {
  fetch("/data/graph.json")
    .then(res => res.json())
    .then(data => {
      const graph = new Graph();
      // Process data
      loadGraph(graph);
    });
}, [loadGraph]);
```

**Difficulty:** 🟡 Intermediate

---

## Next Steps

1. ✅ Complete this guide
2. Pick your first example from Storybook
3. Follow the workflow above
4. Test thoroughly
5. Add to registry
6. Repeat!

**Suggested progression:**
1. Start with 🟢 basic examples
2. Move to 🟡 intermediate with events
3. Try 🟡 layouts and styling
4. Tackle 🔴 advanced features

Happy converting! 🚀

# Sigma.js React TypeScript Project

## Project Overview
Converting Sigma.js Storybook examples from vanilla JavaScript to React TypeScript components for a data visualization coding interview.

**Technology Stack:**
- React 18+ with TypeScript (strict mode)
- Sigma.js 3.x (WebGL graph visualization)
- @react-sigma/core (React bindings)
- Graphology (graph data structure)
- Vite (build tool)

**Goal:** Create a library of working React examples converted from https://www.sigmajs.org/storybook/

---

## Quick Reference Documentation

Fast lookup guides are available in [sigma-examples/docs/quick-reference/](sigma-examples/docs/quick-reference/):

- **[cheatsheet.md](sigma-examples/docs/quick-reference/cheatsheet.md)** - One-page syntax reference (imports, templates, settings)
- **[common-mistakes.md](sigma-examples/docs/quick-reference/common-mistakes.md)** - Troubleshooting guide for 10 common errors
- **[api-patterns.md](sigma-examples/docs/quick-reference/api-patterns.md)** - Copy-paste code for Graphology, Camera, Events, Reducers
- **[settings-reference.md](sigma-examples/docs/quick-reference/settings-reference.md)** - Complete Sigma.js settings reference *(coming soon)*

**When to use:**
- This CLAUDE.md file = Comprehensive conversion rules and principles
- Quick reference docs = Fast lookups during coding/interviews

---

## THE 7 ESSENTIAL CONVERSION RULES

### Rule 1: Sigma Instantiation

**❌ Vanilla JS:**
```javascript
const container = document.getElementById("sigma-container");
const sigma = new Sigma(graph, container, settings);
```

**✅ React TypeScript:**
```typescript
import { SigmaContainer } from "@react-sigma/core";
import "@react-sigma/core/lib/style.css";

export const MyExample: FC = () => (
  <SigmaContainer
    style={{ height: "100%", width: "100%" }}
    settings={SETTINGS}
  >
    {/* children components */}
  </SigmaContainer>
);
```

**Key Points:**
- React manages the Sigma lifecycle through the container component
- Container MUST have explicit height (will error otherwise)
- Use `height: "100%"` to fill available space in the layout
- Always import the CSS file
- Settings should be immutable (see Rule 5)

---

### Rule 2: Loading/Creating Graph

**❌ Vanilla JS:**
```javascript
const graph = new Graph();
graph.addNode("1", { x: 0, y: 0, size: 10, label: "Node 1" });
graph.addNode("2", { x: 1, y: 1, size: 20, label: "Node 2" });
graph.addEdge("1", "2");

const sigma = new Sigma(graph, container);
```

**✅ React TypeScript:**
```typescript
import { FC, useEffect } from "react";
import { useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    graph.addNode("1", { x: 0, y: 0, size: 10, label: "Node 1" });
    graph.addNode("2", { x: 1, y: 1, size: 20, label: "Node 2" });
    graph.addEdge("1", "2");
    
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Usage:
export const MyExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
  </SigmaContainer>
);
```

**Key Points:**
- `useLoadGraph()` hook integrates with React lifecycle
- Graph creation happens inside useEffect
- Component returns null (it's just for side effects)
- loadGraph should be in dependency array

---

### Rule 3: Event Handling

**❌ Vanilla JS:**
```javascript
sigma.on("clickNode", (event) => {
  console.log("Clicked node:", event.node);
});

sigma.on("enterNode", (event) => {
  console.log("Hover node:", event.node);
});

sigma.on("leaveNode", (event) => {
  console.log("Leave node:", event.node);
});
```

**✅ React TypeScript:**
```typescript
import { FC, useEffect } from "react";
import { useRegisterEvents } from "@react-sigma/core";

const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log("Clicked node:", event.node);
      },
      enterNode: (event) => {
        console.log("Hover node:", event.node);
      },
      leaveNode: (event) => {
        console.log("Leave node:", event.node);
      },
    });
  }, [registerEvents]);

  return null;
};

// Usage:
export const MyExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
    <EventHandler />
  </SigmaContainer>
);
```

**Key Points:**
- `useRegisterEvents()` automatically handles cleanup
- All events go in one registerEvents call
- Event names are the same as vanilla (clickNode, enterNode, etc.)
- registerEvents should be in dependency array

**Available Events:**
- Node: clickNode, doubleClickNode, rightClickNode, downNode, enterNode, leaveNode
- Edge: clickEdge, doubleClickEdge, rightClickEdge, downEdge, enterEdge, leaveEdge
- Stage: clickStage, doubleClickStage, rightClickStage, downStage, wheelStage
- Other: mousemovebody, beforeRender, afterRender

---

### Rule 4: Accessing Sigma Instance

**❌ Vanilla JS:**
```javascript
// You already have the instance
sigma.getGraph().forEachNode((node) => {
  console.log(node);
});

sigma.getCamera().goTo({ x: 0, y: 0, ratio: 1 });
```

**✅ React TypeScript:**
```typescript
import { FC } from "react";
import { useSigma } from "@react-sigma/core";

const MyComponent: FC = () => {
  const sigma = useSigma();
  
  const handleClick = () => {
    // Access graph
    const graph = sigma.getGraph();
    graph.forEachNode((node) => {
      console.log(node);
    });
    
    // Access camera
    sigma.getCamera().goTo({ x: 0, y: 0, ratio: 1 });
  };

  return <button onClick={handleClick}>Do Something</button>;
};

// Usage:
export const MyExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
    <MyComponent />
  </SigmaContainer>
);
```

**Key Points:**
- `useSigma()` gives you access to the sigma instance
- Can only be used inside SigmaContainer children
- Use `sigma.getGraph()` to access the graph
- Use `sigma.getCamera()` to access the camera

---

### Rule 5: Settings (CRITICAL!)

**❌ Vanilla JS:**
```javascript
const sigma = new Sigma(graph, container, {
  renderLabels: true,
  labelSize: 12,
  enableEdgeEvents: true,
});
```

**❌ React (WRONG - will cause re-renders and kill Sigma instance!):**
```typescript
// DON'T DO THIS:
export const MyExample: FC = () => {
  const [settings, setSettings] = useState({
    renderLabels: true,
  });

  return (
    <SigmaContainer settings={settings}> {/* BAD! */}
      <LoadGraph />
    </SigmaContainer>
  );
};
```

**✅ React (CORRECT - Option 1: Constant outside component):**
```typescript
const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
  labelColor: { color: "#000" },
  enableEdgeClickEvents: true,
};

export const MyExample: FC = () => (
  <SigmaContainer
    style={{ height: "100%", width: "100%" }}
    settings={SETTINGS}
  >
    <LoadGraph />
  </SigmaContainer>
);
```

**✅ React (CORRECT - Option 2: useMemo inside component):**
```typescript
import { useMemo } from "react";

export const MyExample: FC = () => {
  const settings = useMemo(() => ({
    renderLabels: true,
    labelSize: 12,
    labelColor: { color: "#000" },
    enableEdgeClickEvents: true,
  }), []); // Empty deps = never changes

  return (
    <SigmaContainer
      style={{ height: "100%", width: "100%" }}
      settings={settings}
    >
      <LoadGraph />
    </SigmaContainer>
  );
};
```

**Why This Matters:**
If the settings object reference changes, SigmaContainer will **kill and recreate** the entire Sigma instance! This:
- Destroys performance
- Loses camera state (though it tries to restore)
- Resets all internal state
- Causes flickering

**Common Settings:**
```typescript
{
  renderLabels: true,              // Show node labels
  labelSize: 12,                   // Label font size
  labelColor: { color: "#000" },   // Label color
  labelDensity: 0.07,              // Label collision detection
  labelGridCellSize: 60,           // Grid for label placement
  labelRenderedSizeThreshold: 6,   // Min size to show labels
  
  enableEdgeClickEvents: true,     // Enable edge click events
  enableEdgeHoverEvents: true,     // Enable edge hover events
  enableEdgeWheelEvents: true,     // Enable edge wheel events
  
  renderEdgeLabels: false,         // Show edge labels
  defaultNodeColor: "#999",        // Default node color
  defaultEdgeColor: "#ccc",        // Default edge color
}
```

---

### Rule 6: Reducers (Dynamic Styling)

**❌ Vanilla JS:**
```javascript
let hoveredNode = null;

const sigma = new Sigma(graph, container, {
  nodeReducer: (node, data) => {
    if (node === hoveredNode) {
      return { ...data, color: "#ff0000", size: data.size * 1.5 };
    }
    return data;
  },
});

sigma.on("enterNode", (event) => {
  hoveredNode = event.node;
  sigma.refresh(); // Trigger re-render
});
```

**✅ React TypeScript:**
```typescript
import { FC, useEffect, useState } from "react";
import { useSigma, useRegisterEvents } from "@react-sigma/core";

const NodeHighlight: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Update reducer when hoveredNode changes
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return { 
          ...data, 
          color: "#ff0000", 
          size: data.size * 1.5 
        };
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

export const MyExample: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
    <NodeHighlight />
  </SigmaContainer>
);
```

**Key Points:**
- Reducers transform node/edge attributes at render time
- Use `sigma.setSetting()` to update reducers dynamically
- Don't pass reducers in initial settings if they depend on state
- Reducers are called on every render, so keep them fast
- Return a new object, don't mutate the data parameter

**Common Reducer Pattern:**
```typescript
sigma.setSetting("nodeReducer", (node, data) => {
  const result = { ...data }; // Copy data
  
  // Apply transformations
  if (someCondition) {
    result.color = "#f00";
    result.size = data.size * 1.5;
  }
  
  return result;
});
```

---

### Rule 7: Edge Events (Must Enable!)

**❌ Vanilla JS:**
```javascript
const sigma = new Sigma(graph, container, {
  enableEdgeEvents: true, // Must enable!
});

sigma.on("clickEdge", (event) => {
  console.log("Clicked edge:", event.edge);
});
```

**✅ React TypeScript:**
```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,  // Enable edge clicks
  enableEdgeHoverEvents: true,  // Enable edge hovers
  enableEdgeWheelEvents: true,  // Enable edge wheel events
};

const EdgeEventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickEdge: (event) => {
        console.log("Clicked edge:", event.edge);
      },
      enterEdge: (event) => {
        console.log("Hover edge:", event.edge);
      },
    });
  }, [registerEvents]);

  return null;
};

export const MyExample: FC = () => (
  <SigmaContainer
    style={{ height: "100%", width: "100%" }}
    settings={SETTINGS}
  >
    <LoadGraph />
    <EdgeEventHandler />
  </SigmaContainer>
);
```

**Key Points:**
- Edge events are **disabled by default** for performance
- Must enable in settings before events will fire
- Enable only what you need (click, hover, wheel)
- Works the same as node events once enabled

---

## CRITICAL RULES SUMMARY

### ✅ ALWAYS DO:

1. **Set explicit height on SigmaContainer**
   ```typescript
   <SigmaContainer style={{ height: "100%", width: "100%" }}>
   ```

2. **Import CSS file**
   ```typescript
   import "@react-sigma/core/lib/style.css";
   ```

3. **Use React Sigma hooks**
   - `useLoadGraph()` - for loading graph data
   - `useSigma()` - for accessing sigma instance
   - `useRegisterEvents()` - for event handling

4. **Make settings immutable**
   ```typescript
   const SETTINGS = { ... }; // Outside component
   // OR
   const settings = useMemo(() => ({ ... }), []); // Inside with useMemo
   ```

5. **Use proper TypeScript types**
   ```typescript
   import { FC } from "react";
   import type { NodeDisplayData, EdgeDisplayData } from "sigma/types";
   ```

### ❌ NEVER DO:

1. **Don't update SigmaContainer props after mount**
   - Changing settings, graph, or other props will kill and recreate the instance
   - Use `sigma.setSetting()` or graph methods to update dynamically

2. **Don't create Sigma instance directly**
   - Use `<SigmaContainer>` component, not `new Sigma()`

3. **Don't forget container height**
   - Will throw error: "container has no height"

4. **Don't mutate settings object**
   - Will cause instance re-creation and performance issues

5. **Don't forget to enable edge events**
   - Edge events disabled by default, must enable in settings

---

## Conversion Workflow

When converting a Storybook vanilla example:

### Step 1: Identify Components

Look at the vanilla code and identify:
- **Graph creation** → goes in `useLoadGraph()` component
- **Event listeners** → goes in `useRegisterEvents()` component
- **Settings object** → goes in `settings` prop (as const)
- **Graph manipulation** → component using `useSigma()`
- **UI elements** → separate components

### Step 2: Create File Structure

```typescript
// examples/[example-name].tsx

import { FC, useEffect } from "react";
import { SigmaContainer, useLoadGraph, useRegisterEvents, useSigma } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";

// 1. Settings (outside component)
const SETTINGS = {
  // ... settings from vanilla example
};

// 2. Graph loader component
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  useEffect(() => {
    const graph = new Graph();
    // ... graph creation from vanilla example
    loadGraph(graph);
  }, [loadGraph]);
  return null;
};

// 3. Event handler component (if needed)
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();
  useEffect(() => {
    registerEvents({
      // ... events from vanilla example
    });
  }, [registerEvents]);
  return null;
};

// 4. Other components (if needed)
const SomeFeature: FC = () => {
  const sigma = useSigma();
  // ... other logic
  return <div>...</div>;
};

// 5. Main component
export const ExampleName: FC = () => {
  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
      <LoadGraph />
      <EventHandler />
      <SomeFeature />
    </SigmaContainer>
  );
};
```

### Step 3: Convert Each Part

**Graph Creation:**
```typescript
// Vanilla: const graph = new Graph();
// React: Same, but inside useLoadGraph() hook
```

**Adding Nodes/Edges:**
```typescript
// Vanilla: graph.addNode("id", { x, y, size, label, color });
// React: Same, no changes needed
```

**Event Listeners:**
```typescript
// Vanilla: sigma.on("clickNode", handler);
// React: registerEvents({ clickNode: handler });
```

**Settings:**
```typescript
// Vanilla: passed to new Sigma(graph, container, settings)
// React: passed to <SigmaContainer settings={SETTINGS}>
```

---

## Quick Reference Card

| Task | Vanilla JS | React TypeScript |
|------|-----------|-----------------|
| **Instantiate Sigma** | `new Sigma(graph, container)` | `<SigmaContainer>` |
| **Load graph** | Pass to constructor | `useLoadGraph()` in useEffect |
| **Add event listener** | `sigma.on("event", handler)` | `useRegisterEvents({ event: handler })` |
| **Access sigma instance** | Direct reference | `useSigma()` hook |
| **Access graph** | `sigma.getGraph()` | `useSigma().getGraph()` |
| **Access camera** | `sigma.getCamera()` | `useSigma().getCamera()` |
| **Set settings** | Constructor argument | `settings` prop (immutable) |
| **Update settings** | `sigma.setSetting(key, val)` | Same: `sigma.setSetting(key, val)` |
| **Enable edge events** | `enableEdgeEvents: true` | `enableEdgeClickEvents: true` |

---

## Common Issues and Solutions

### Issue 1: "Container has no height"

**Error:** `Error: container has no height`

**Solution:**
```typescript
// ❌ Wrong
<SigmaContainer>

// ✅ Correct
<SigmaContainer style={{ height: "100%", width: "100%" }}>
```

---

### Issue 2: Performance Issues / Graph Flickering

**Cause:** Settings object is changing, killing/recreating Sigma

**Solution:**
```typescript
// ❌ Wrong
const [settings] = useState({ renderLabels: true });

// ✅ Correct - option 1
const SETTINGS = { renderLabels: true };

// ✅ Correct - option 2
const settings = useMemo(() => ({ renderLabels: true }), []);
```

---

### Issue 3: Edge Events Not Firing

**Cause:** Edge events disabled by default

**Solution:**
```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
};
```

---

### Issue 4: Graph Not Updating

**Cause:** Not using graph mutation methods correctly

**Solution:**
```typescript
const MyComponent = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();
  
  // ✅ Correct - use graph methods
  graph.addNode("newNode", { x: 0, y: 0, size: 10 });
  graph.setNodeAttribute("node1", "color", "#f00");
  
  // ❌ Wrong - direct mutation
  // graph.nodes["node1"].color = "#f00";
};
```

---

### Issue 5: WebGL Context Leak / "Too many active WebGL contexts" Warning

**Error:** `WARNING: Too many active WebGL contexts. Oldest context will be lost.`

**Root Cause:** The `@react-sigma/core` library has a critical bug in `SigmaContainer.tsx` (lines 92-110). The `useEffect` that creates Sigma instances lacks a cleanup function to call `sigma.kill()` on unmount, causing WebGL contexts to accumulate and never be released.

**Impact:**
- Each Sigma instance creates a WebGL context
- When components unmount (e.g., switching examples), contexts are not freed
- React StrictMode amplifies this by double-mounting components in development
- Browsers limit WebGL contexts (typically 8-16), causing warnings/errors

**Solution:** Disable React StrictMode in development

```typescript
// main.tsx
// ❌ Wrong - causes double-mounting and 2x WebGL contexts
import { StrictMode } from 'react'
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// ✅ Correct - single mount per component
createRoot(document.getElementById('root')!).render(
  <App />
)
```

**Why This Works:**
- StrictMode intentionally double-mounts components to detect side effects
- Without StrictMode, each component only mounts once
- Combined with `key` prop on example components, old instances unmount before new ones mount
- This limits WebGL contexts to 1 per active example

**Note:** This is a workaround for the library bug. The proper fix would be to add a cleanup function in `@react-sigma/core/src/components/SigmaContainer.tsx`:

```typescript
// Proper fix (in library code):
useEffect(() => {
  setSigma(/* ... create instance ... */);

  // Missing cleanup function:
  return () => {
    if (sigma) sigma.kill();
  };
}, [containerRef, graph, sigmaSettings]);
```

---

### Issue 6: TypeScript Errors

**Solution:** Import proper types
```typescript
import { FC } from "react";
import Graph from "graphology";
import type { Attributes } from "graphology-types";
import type { NodeDisplayData, EdgeDisplayData } from "sigma/types";

// For node/edge data types
interface NodeAttributes extends Attributes {
  x: number;
  y: number;
  size: number;
  label: string;
  color: string;
}
```

---

## Example Template

Use this as a starting point for every conversion:

```typescript
/**
 * [Example Name]
 * 
 * Converted from: [Storybook URL]
 * 
 * Description: [Brief description of what this example demonstrates]
 */

import { FC, useEffect } from "react";
import { SigmaContainer, useLoadGraph, useRegisterEvents } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";

// Settings (immutable)
const SETTINGS = {
  renderLabels: true,
  // ... other settings
};

// Graph loader
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();
    
    // Add nodes
    graph.addNode("1", {
      x: 0,
      y: 0,
      size: 10,
      label: "Node 1",
      color: "#3388ff",
    });
    
    // Add edges
    graph.addEdge("1", "2");
    
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

// Event handlers (optional)
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        console.log("Clicked node:", event.node);
      },
    });
  }, [registerEvents]);

  return null;
};

// Main export
export const ExampleName: FC = () => {
  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={SETTINGS}>
      <LoadGraph />
      <EventHandler />
    </SigmaContainer>
  );
};
```

---

## Testing Checklist

After converting an example, verify:

- [ ] npm run dev starts without errors
- [ ] Graph renders with proper height
- [ ] All nodes and edges are visible
- [ ] Events fire correctly (check console)
- [ ] No console errors or warnings
- [ ] TypeScript compiles without errors
- [ ] Performance is acceptable (no flickering)
- [ ] Camera controls work (zoom, pan)
- [ ] Matches vanilla example behavior

---

## Additional Resources

### Official Documentation
- **React Sigma Docs:** https://sim51.github.io/react-sigma/
- **Sigma.js Docs:** https://www.sigmajs.org/docs/
- **Sigma.js Storybook:** https://www.sigmajs.org/storybook/
- **Graphology Docs:** https://graphology.github.io/

### Quick Reference (Local)
For fast lookups during coding/interviews, see [sigma-examples/docs/quick-reference/](sigma-examples/docs/quick-reference/):
- **[cheatsheet.md](sigma-examples/docs/quick-reference/cheatsheet.md)** - One-page syntax reference
- **[common-mistakes.md](sigma-examples/docs/quick-reference/common-mistakes.md)** - Troubleshooting errors
- **[api-patterns.md](sigma-examples/docs/quick-reference/api-patterns.md)** - Copy-paste code snippets
- **[settings-reference.md](sigma-examples/docs/quick-reference/settings-reference.md)** - Complete settings documentation

---

## Notes for Claude Code

When asked to convert a vanilla Sigma.js example:

1. **Read the vanilla code carefully** and identify all components
2. **Follow the 7 conversion rules** strictly
3. **Use the example template** as a starting point
4. **Test imports** - ensure all are correct
5. **Add comments** explaining any complex conversions
6. **Keep it simple** - don't over-engineer
7. **One file per example** in the examples/ directory

Remember: The goal is working, understandable React components that demonstrate Sigma.js features for interview preparation.
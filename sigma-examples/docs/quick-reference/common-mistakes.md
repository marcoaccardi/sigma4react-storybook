# Common Mistakes & Solutions

**Troubleshooting guide for React Sigma.js conversions**

---

## 1. Container Has No Height

### Error Message
```
Error: container has no height
```

### Why This Happens
SigmaContainer needs an explicit height to render the canvas. CSS doesn't automatically provide height.

### ❌ Wrong

```typescript
export const Example: FC = () => (
  <SigmaContainer>
    <LoadGraph />
  </SigmaContainer>
);
```

### ✅ Correct

```typescript
// Option 1: Fill available space (recommended)
export const Example: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
  </SigmaContainer>
);

// Option 2: Full viewport
export const Example: FC = () => (
  <div style={{ height: "100vh" }}>
    <SigmaContainer style={{ height: "100%", width: "100%" }}>
      <LoadGraph />
    </SigmaContainer>
  </div>
);

// Option 3: CSS class (less common)
export const Example: FC = () => (
  <SigmaContainer className="sigma-container">
    <LoadGraph />
  </SigmaContainer>
);
// In CSS: .sigma-container { height: 100%; }
```

---

## 2. Graph Flickering / Performance Issues

### Symptoms
- Graph constantly re-renders
- Camera position resets
- Stuttering/laggy interactions
- High CPU usage

### Why This Happens
Settings object reference changes on every render, causing SigmaContainer to destroy and recreate the Sigma instance.

### ❌ Wrong

```typescript
export const Example: FC = () => {
  // Creates new object on EVERY render!
  const settings = { renderLabels: true };

  return (
    <SigmaContainer settings={settings}>
      <LoadGraph />
    </SigmaContainer>
  );
};
```

### ✅ Correct - Option 1: Outside Component

```typescript
// Created once, never changes
const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
};

export const Example: FC = () => (
  <SigmaContainer settings={SETTINGS}>
    <LoadGraph />
  </SigmaContainer>
);
```

### ✅ Correct - Option 2: useMemo

```typescript
export const Example: FC = () => {
  // Memoized, only created once
  const settings = useMemo(() => ({
    renderLabels: true,
    labelSize: 12,
  }), []); // Empty deps = never recreates

  return (
    <SigmaContainer settings={settings}>
      <LoadGraph />
    </SigmaContainer>
  );
};
```

### When to Use Each
- **Outside component**: When settings never change (most common)
- **useMemo**: When settings depend on props/state (rare)

---

## 3. Edge Events Not Firing

### Symptoms
- `clickEdge`, `enterEdge`, `leaveEdge` handlers don't work
- No errors in console
- Node events work fine

### Why This Happens
Edge events are **disabled by default** for performance reasons. You must explicitly enable them in settings.

### ❌ Wrong

```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickEdge: (event) => {
        console.log("Clicked edge"); // Never fires!
      },
    });
  }, [registerEvents]);

  return null;
};
```

### ✅ Correct

```typescript
// 1. Enable in settings
const SETTINGS = {
  enableEdgeClickEvents: true,   // Enable clicks
  enableEdgeHoverEvents: true,   // Enable hover
  enableEdgeWheelEvents: true,   // Enable wheel (if needed)
};

// 2. Now events will fire
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickEdge: (event) => {
        console.log("Clicked edge:", event.edge); // Works!
      },
      enterEdge: (event) => {
        console.log("Hover edge:", event.edge); // Works!
      },
    });
  }, [registerEvents]);

  return null;
};

// 3. Use in component
export const Example: FC = () => (
  <SigmaContainer settings={SETTINGS}>
    <LoadGraph />
    <EventHandler />
  </SigmaContainer>
);
```

### Performance Note
Only enable the edge events you actually need:
- `enableEdgeClickEvents: true` - For click interactions
- `enableEdgeHoverEvents: true` - For hover effects
- `enableEdgeWheelEvents: true` - Rarely needed

---

## 4. Forgot CSS Import

### Symptoms
- Graph renders but looks wrong
- Missing default styles
- Controls/UI elements misaligned

### Why This Happens
React Sigma requires its CSS file for proper rendering.

### ❌ Wrong

```typescript
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
// Missing CSS import!
```

### ✅ Correct

```typescript
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css"; // Don't forget!
```

### Where to Import
Import in **every file** that uses Sigma components, or once in your main entry file (e.g., `main.tsx` or `App.tsx`).

---

## 5. Graph Created in Render Function

### Symptoms
- Graph recreated on every render
- Poor performance
- Loss of state
- Memory leaks

### Why This Happens
Creating the graph outside `useEffect` causes it to be recreated every time the component renders.

### ❌ Wrong

```typescript
export const Example: FC = () => {
  // Created on EVERY render!
  const graph = new Graph();
  graph.addNode("1", { x: 0, y: 0, size: 10 });

  return (
    <SigmaContainer graph={graph}>
      <LoadGraph />
    </SigmaContainer>
  );
};
```

### ✅ Correct

```typescript
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Created once
    const graph = new Graph();
    graph.addNode("1", { x: 0, y: 0, size: 10 });
    loadGraph(graph);
  }, [loadGraph]);

  return null;
};

export const Example: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
  </SigmaContainer>
);
```

---

## 6. Using Sigma Hooks Outside SigmaContainer

### Error Message
```
Error: useSigma must be used within a SigmaContainer
```

### Why This Happens
React Sigma hooks require the Sigma context, which is only available inside `<SigmaContainer>` children.

### ❌ Wrong

```typescript
export const App: FC = () => {
  const sigma = useSigma(); // Error! No context!

  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }}>
      <LoadGraph />
    </SigmaContainer>
  );
};
```

### ✅ Correct

```typescript
// Component that uses hooks
const MyComponent: FC = () => {
  const sigma = useSigma(); // Works! Inside context
  const handleClick = () => {
    console.log(sigma.getGraph());
  };
  return <button onClick={handleClick}>Log Graph</button>;
};

// Parent component
export const App: FC = () => (
  <SigmaContainer style={{ height: "100%", width: "100%" }}>
    <LoadGraph />
    <MyComponent /> {/* Hooks work here */}
  </SigmaContainer>
);
```

### Affected Hooks
- `useSigma()`
- `useLoadGraph()`
- `useRegisterEvents()`
- `useLayoutCircular()`
- `useLayoutForceAtlas2()`

All must be used inside `<SigmaContainer>` children.

---

## 7. Mutating Graph Directly

### Symptoms
- Changes don't reflect in UI
- Inconsistent state
- Errors in console

### Why This Happens
Graphology uses method-based mutations, not direct property assignment.

### ❌ Wrong

```typescript
const MyComponent: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const changeColor = () => {
    // Direct mutation - doesn't work!
    graph.nodes["node1"].color = "#ff0000";
  };

  return <button onClick={changeColor}>Change Color</button>;
};
```

### ✅ Correct

```typescript
const MyComponent: FC = () => {
  const sigma = useSigma();
  const graph = sigma.getGraph();

  const changeColor = () => {
    // Use graph methods
    graph.setNodeAttribute("node1", "color", "#ff0000");
  };

  return <button onClick={changeColor}>Change Color</button>;
};
```

### Common Graph Methods

**Nodes:**
```typescript
graph.setNodeAttribute(node, key, value);
graph.updateNodeAttribute(node, key, updater);
graph.mergeNodeAttributes(node, attributes);
graph.removeNodeAttribute(node, key);
```

**Edges:**
```typescript
graph.setEdgeAttribute(edge, key, value);
graph.updateEdgeAttribute(edge, key, updater);
graph.mergeEdgeAttributes(edge, attributes);
graph.removeEdgeAttribute(edge, key);
```

---

## 8. Reducer Not Updating

### Symptoms
- Changes to state don't affect node/edge appearance
- Hover effects don't work
- Highlighting broken

### Why This Happens
Reducer function needs to be re-registered when dependent state changes.

### ❌ Wrong

```typescript
const NodeHighlight: FC = () => {
  const sigma = useSigma();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Registered once with initial hoveredNode value (null)
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return { ...data, color: "#ff0000" };
      }
      return data;
    });
  }, [sigma]); // Missing hoveredNode!

  // Events update state but reducer doesn't see it
  useEffect(() => {
    const registerEvents = useRegisterEvents();
    registerEvents({
      enterNode: (e) => setHoveredNode(e.node),
      leaveNode: () => setHoveredNode(null),
    });
  }, []);

  return null;
};
```

### ✅ Correct

```typescript
const NodeHighlight: FC = () => {
  const sigma = useSigma();
  const registerEvents = useRegisterEvents();
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);

  // Re-register reducer when hoveredNode changes
  useEffect(() => {
    sigma.setSetting("nodeReducer", (node, data) => {
      if (node === hoveredNode) {
        return { ...data, color: "#ff0000" };
      }
      return data;
    });
  }, [hoveredNode, sigma]); // Include hoveredNode!

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

### Key Rule
**Reducer dependencies**: Include all state/props that the reducer uses in the `useEffect` dependency array.

---

## 9. TypeScript Type Errors

### Error Messages
```
Type 'X' is not assignable to type 'Y'
Property 'x' does not exist on type 'NodeAttributes'
```

### Why This Happens
Graphology and Sigma use generic types that need proper type annotations.

### ❌ Wrong

```typescript
const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    const graph = new Graph();

    // TypeScript doesn't know what attributes are valid
    graph.addNode("1", {
      x: 0,
      y: 0,
      size: 10,
      customProp: "value", // May cause issues
    });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};
```

### ✅ Correct

```typescript
import type { Attributes } from "graphology-types";

// Define your node attributes
interface NodeAttributes extends Attributes {
  x: number;
  y: number;
  size: number;
  label: string;
  color?: string;
  customProp?: string;
}

// Define your edge attributes
interface EdgeAttributes extends Attributes {
  size?: number;
  color?: string;
  label?: string;
}

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();

  useEffect(() => {
    // Type-safe graph
    const graph = new Graph<NodeAttributes, EdgeAttributes>();

    graph.addNode("1", {
      x: 0,
      y: 0,
      size: 10,
      label: "Node 1",
      customProp: "value", // TypeScript validates this
    });

    loadGraph(graph);
  }, [loadGraph]);

  return null;
};
```

### Common Type Imports

```typescript
import type { Attributes } from "graphology-types";
import type { NodeDisplayData, EdgeDisplayData } from "sigma/types";
import type { Settings } from "sigma/settings";
```

---

## 10. Missing Dependencies in useEffect

### Symptoms
- Stale closures
- State not updating
- Events not firing correctly
- React warnings in console

### Why This Happens
`useEffect` dependencies determine when the effect re-runs. Missing dependencies cause the effect to use stale values.

### ❌ Wrong

```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();
  const [count, setCount] = useState(0);

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        // Always logs 0 because count is captured at mount
        console.log("Count:", count);
        setCount(count + 1); // Won't work as expected
      },
    });
  }, []); // Missing registerEvents and count!

  return null;
};
```

### ✅ Correct

```typescript
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();
  const [count, setCount] = useState(0);

  useEffect(() => {
    registerEvents({
      clickNode: (event) => {
        // Use functional update to avoid dependency on count
        setCount(c => c + 1);
        console.log("Clicked node:", event.node);
      },
    });
  }, [registerEvents]); // Include registerEvents

  return null;
};
```

### Best Practices

1. **Always include hook dependencies:**
   ```typescript
   useEffect(() => {
     // Use loadGraph
   }, [loadGraph]); // Include it!
   ```

2. **Use functional updates for state:**
   ```typescript
   setCount(c => c + 1); // Doesn't depend on count
   ```

3. **Use React DevTools to check for warnings:**
   - Open browser DevTools
   - Look for "React Hook useEffect has a missing dependency" warnings

---

## Quick Troubleshooting Checklist

When something doesn't work, check:

- [ ] SigmaContainer has explicit height
- [ ] CSS imported (`@react-sigma/core/lib/style.css`)
- [ ] Settings object is immutable (outside component or useMemo)
- [ ] Edge events enabled in settings (if using edge events)
- [ ] Hooks used inside SigmaContainer children
- [ ] Graph mutations use methods (not direct property access)
- [ ] Reducer useEffect includes all dependencies
- [ ] useEffect dependency arrays are complete
- [ ] TypeScript types are properly defined
- [ ] No console errors or warnings

---

## Still Stuck?

1. **Check CLAUDE.md** - Comprehensive conversion rules
2. **Check vanilla-to-react-conversion.md** - Detailed workflow
3. **Check console** - Look for errors/warnings
4. **Compare with working example** - Look at [basic-graph.tsx](../../examples/basic-graph.tsx)
5. **Test in vanilla JS first** - Make sure the vanilla version works

---

**Last updated:** 2025-10-01

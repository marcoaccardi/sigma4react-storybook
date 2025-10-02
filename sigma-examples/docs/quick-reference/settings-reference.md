# Sigma.js Settings Reference

**Complete reference for all Sigma.js settings in React**

Based on official Sigma.js v3.x and React Sigma v5.x documentation.

---

## Table of Contents

1. [Critical Settings (React-Specific)](#critical-settings-react-specific)
2. [Label Settings](#label-settings)
3. [Edge Label Settings](#edge-label-settings)
4. [Event Settings](#event-settings)
5. [Rendering Settings](#rendering-settings)
6. [Camera Settings](#camera-settings)
7. [Performance Settings](#performance-settings)
8. [Program Settings (Advanced)](#program-settings-advanced)
9. [Complete Settings Example](#complete-settings-example)

---

## Critical Settings (React-Specific)

### Settings Immutability ⚠️

**CRITICAL:** In React Sigma, settings MUST be immutable. If the settings object reference changes, SigmaContainer will destroy and recreate the entire Sigma instance.

```typescript
// ✅ CORRECT - Outside component
const SETTINGS = {
  renderLabels: true,
  labelSize: 12,
};

export const MyExample: FC = () => (
  <SigmaContainer settings={SETTINGS}>
    {/* ... */}
  </SigmaContainer>
);

// ✅ CORRECT - Memoized
export const MyExample: FC = () => {
  const settings = useMemo(() => ({
    renderLabels: true,
    labelSize: 12,
  }), []);

  return (
    <SigmaContainer settings={settings}>
      {/* ... */}
    </SigmaContainer>
  );
};

// ❌ WRONG - Will recreate instance on every render!
export const MyExample: FC = () => {
  const settings = { renderLabels: true }; // New object every render!
  return <SigmaContainer settings={settings}> {/* BAD */}
};
```

### allowInvalidContainer

**Type:** `boolean`
**Default:** `false`
**React Note:** Often set to `true` in examples for flexibility

```typescript
const SETTINGS = {
  allowInvalidContainer: true,
};
```

When `true`, allows Sigma to be initialized in a container without explicit dimensions. Generally needed for certain testing or SSR scenarios.

---

## Label Settings

### renderLabels

**Type:** `boolean`
**Default:** `true`

Controls whether node labels are rendered.

```typescript
const SETTINGS = {
  renderLabels: true, // Show labels
};
```

### labelFont

**Type:** `string`
**Default:** `"Arial, sans-serif"`

CSS font family for node labels.

```typescript
const SETTINGS = {
  labelFont: "Lato, sans-serif",
};
```

### labelSize

**Type:** `number`
**Default:** `14`

Font size of node labels in pixels.

```typescript
const SETTINGS = {
  labelSize: 12,
};
```

### labelWeight

**Type:** `string`
**Default:** `"normal"`

Font weight of node labels. Accepts CSS font-weight values (`"normal"`, `"bold"`, `"400"`, `"700"`, etc.).

```typescript
const SETTINGS = {
  labelWeight: "bold",
};
```

### labelColor

**Type:** `{ color: string } | { attribute: string; color?: string }`
**Default:** `{ color: "#000000" }`

Color of node labels. Can be:
- Fixed color: `{ color: "#000000" }`
- Attribute-based: `{ attribute: "labelColor", color: "#000000" }` (uses node's attribute with fallback)

```typescript
// Fixed color
const SETTINGS = {
  labelColor: { color: "#333333" },
};

// Attribute-based with fallback
const SETTINGS = {
  labelColor: {
    attribute: "labelColor", // Use node.labelColor attribute
    color: "#000000" // Fallback if attribute missing
  },
};
```

### labelDensity

**Type:** `number`
**Default:** `0.07`

Controls label collision detection density. Higher values = fewer labels shown (more aggressive collision detection).

```typescript
const SETTINGS = {
  labelDensity: 0.07, // Default
  // labelDensity: 0.15, // Show fewer labels
  // labelDensity: 0.01, // Show more labels
};
```

### labelGridCellSize

**Type:** `number`
**Default:** `60`

Size of grid cells used for label collision detection (in pixels).

```typescript
const SETTINGS = {
  labelGridCellSize: 60,
};
```

### labelRenderedSizeThreshold

**Type:** `number`
**Default:** `6`

Minimum rendered size for a node to display its label. Nodes smaller than this threshold won't show labels (unless `forceLabel: true`).

```typescript
const SETTINGS = {
  labelRenderedSizeThreshold: 6, // Only show labels on nodes >= 6px
};
```

---

## Edge Label Settings

### renderEdgeLabels

**Type:** `boolean`
**Default:** `false`

Controls whether edge labels are rendered.

```typescript
const SETTINGS = {
  renderEdgeLabels: true, // Show edge labels
};
```

### edgeLabelFont

**Type:** `string`
**Default:** `"Arial, sans-serif"`

CSS font family for edge labels.

```typescript
const SETTINGS = {
  edgeLabelFont: "Lato, sans-serif",
};
```

### edgeLabelSize

**Type:** `number`
**Default:** `10`

Font size of edge labels in pixels.

```typescript
const SETTINGS = {
  edgeLabelSize: 10,
};
```

### edgeLabelWeight

**Type:** `string`
**Default:** `"normal"`

Font weight of edge labels.

```typescript
const SETTINGS = {
  edgeLabelWeight: "normal",
};
```

### edgeLabelColor

**Type:** `{ color: string } | { attribute: string; color?: string }`
**Default:** `{ color: "#000000" }`

Color of edge labels (same structure as `labelColor`).

```typescript
const SETTINGS = {
  edgeLabelColor: { color: "#666666" },
};
```

---

## Event Settings

### Edge Events (Must Enable!)

**IMPORTANT:** Edge events are **disabled by default** for performance. You must explicitly enable them.

#### enableEdgeClickEvents

**Type:** `boolean`
**Default:** `false`

Enable click events on edges (`clickEdge`, `doubleClickEdge`, `rightClickEdge`).

```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,
};
```

#### enableEdgeHoverEvents

**Type:** `boolean`
**Default:** `false`

Enable hover events on edges (`enterEdge`, `leaveEdge`).

```typescript
const SETTINGS = {
  enableEdgeHoverEvents: true,
};
```

#### enableEdgeWheelEvents

**Type:** `boolean`
**Default:** `false`

Enable wheel events on edges (`wheelEdge`).

```typescript
const SETTINGS = {
  enableEdgeWheelEvents: true,
};
```

### Complete Edge Events Example

```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,  // Enable clicks
  enableEdgeHoverEvents: true,  // Enable hover
  enableEdgeWheelEvents: true,  // Enable wheel (rarely needed)
};

// Now edge events will fire
const EventHandler: FC = () => {
  const registerEvents = useRegisterEvents();

  useEffect(() => {
    registerEvents({
      clickEdge: (event) => console.log("Clicked edge:", event.edge),
      enterEdge: (event) => console.log("Hover edge:", event.edge),
    });
  }, [registerEvents]);

  return null;
};
```

---

## Rendering Settings

### defaultNodeColor

**Type:** `string`
**Default:** `"#999999"`

Default color for nodes that don't have a `color` attribute.

```typescript
const SETTINGS = {
  defaultNodeColor: "#3388ff",
};
```

### defaultNodeType

**Type:** `string`
**Default:** `"circle"`

Default renderer type for nodes. Must match a key in `nodeProgramClasses`.

Built-in types:
- `"circle"` - NodeCircleProgram (default)
- `"point"` - NodePointProgram (efficient, limited to 100px radius)

```typescript
const SETTINGS = {
  defaultNodeType: "circle",
};
```

### defaultEdgeColor

**Type:** `string`
**Default:** `"#cccccc"`

Default color for edges that don't have a `color` attribute.

```typescript
const SETTINGS = {
  defaultEdgeColor: "#dddddd",
};
```

### defaultEdgeType

**Type:** `string`
**Default:** `"line"`

Default renderer type for edges. Must match a key in `edgeProgramClasses`.

Built-in types:
- `"line"` - EdgeLineProgram (1px lines, always)
- `"rectangle"` - EdgeRectangleProgram (thick edges)
- `"arrow"` - EdgeArrowProgram (directed edges with arrow heads)
- `"straight"` - For directed edges
- `"curved"` - For curved edges (parallel edges)

```typescript
const SETTINGS = {
  defaultEdgeType: "arrow",
};
```

### zIndex

**Type:** `boolean`
**Default:** `false`

Enable z-index support for layering nodes/edges. When enabled, nodes and edges with higher `zIndex` attribute values are drawn on top.

```typescript
const SETTINGS = {
  zIndex: true,
};

// Then on nodes/edges:
graph.addNode("node1", {
  x: 0, y: 0, size: 10,
  zIndex: 1, // Draw on top
});
```

**Note:** Edges can never be drawn on top of nodes, regardless of zIndex.

---

## Camera Settings

### minCameraRatio

**Type:** `number`
**Default:** `0.1`

Minimum camera ratio (maximum zoom in). Lower values allow closer zoom.

```typescript
const SETTINGS = {
  minCameraRatio: 0.1, // Can zoom in 10x
};
```

### maxCameraRatio

**Type:** `number`
**Default:** `10`

Maximum camera ratio (maximum zoom out). Higher values allow further zoom out.

```typescript
const SETTINGS = {
  maxCameraRatio: 10, // Can zoom out 10x
};
```

---

## Performance Settings

### hideEdgesOnMove

**Type:** `boolean`
**Default:** `false`

Hide edges while the camera is moving (improves performance on large graphs).

```typescript
const SETTINGS = {
  hideEdgesOnMove: true, // Hide edges during pan/zoom
};
```

### hideLabelsOnMove

**Type:** `boolean`
**Default:** `false`

Hide labels while the camera is moving (improves performance).

```typescript
const SETTINGS = {
  hideLabelsOnMove: true, // Hide labels during pan/zoom
};
```

---

## Program Settings (Advanced)

### nodeProgramClasses

**Type:** `{ [key: string]: NodeProgramConstructor }`
**Default:** `{ circle: NodeCircleProgram }`

Map of node renderer classes. Keys are node `type` values.

```typescript
import { NodeCircleProgram, NodePointProgram } from "sigma/rendering";

const SETTINGS = {
  nodeProgramClasses: {
    circle: NodeCircleProgram,
    point: NodePointProgram,
  },
};

// Use different types on nodes:
graph.addNode("1", { x: 0, y: 0, size: 10, type: "circle" });
graph.addNode("2", { x: 1, y: 1, size: 10, type: "point" });
```

### edgeProgramClasses

**Type:** `{ [key: string]: EdgeProgramConstructor }`
**Default:** `{ line: EdgeLineProgram }`

Map of edge renderer classes. Keys are edge `type` values.

```typescript
import { EdgeArrowProgram, EdgeRectangleProgram } from "sigma/rendering";

const SETTINGS = {
  edgeProgramClasses: {
    arrow: EdgeArrowProgram,
    rectangle: EdgeRectangleProgram,
  },
};

// Use different types on edges:
graph.addEdge("1", "2", { type: "arrow" });
graph.addEdge("2", "3", { type: "rectangle" });
```

### Custom Programs Example

```typescript
import { NodeImageProgram } from "@sigma/node-image";
import EdgeCurveProgram from "@sigma/edge-curve";

const SETTINGS = {
  nodeProgramClasses: {
    image: NodeImageProgram,
  },
  edgeProgramClasses: {
    curved: EdgeCurveProgram,
  },
  defaultNodeType: "image",
  defaultEdgeType: "curved",
};
```

---

## Complete Settings Example

Here's a comprehensive example with commonly used settings:

```typescript
import { useMemo } from "react";
import { EdgeArrowProgram } from "sigma/rendering";

export const MyExample: FC = () => {
  const settings = useMemo(() => ({
    // Container
    allowInvalidContainer: true,

    // Node labels
    renderLabels: true,
    labelFont: "Lato, sans-serif",
    labelSize: 12,
    labelWeight: "bold",
    labelColor: { color: "#000000" },
    labelDensity: 0.07,
    labelGridCellSize: 60,
    labelRenderedSizeThreshold: 6,

    // Edge labels
    renderEdgeLabels: true,
    edgeLabelSize: 10,
    edgeLabelColor: { color: "#666666" },

    // Edge events (disabled by default!)
    enableEdgeClickEvents: true,
    enableEdgeHoverEvents: true,

    // Rendering
    defaultNodeColor: "#3388ff",
    defaultEdgeColor: "#cccccc",
    defaultNodeType: "circle",
    defaultEdgeType: "arrow",
    zIndex: true,

    // Edge programs
    edgeProgramClasses: {
      arrow: EdgeArrowProgram,
    },

    // Camera
    minCameraRatio: 0.1,
    maxCameraRatio: 10,

    // Performance
    hideEdgesOnMove: false,
    hideLabelsOnMove: false,
  }), []);

  return (
    <SigmaContainer style={{ height: "100%", width: "100%" }} settings={settings}>
      {/* children */}
    </SigmaContainer>
  );
};
```

---

## Dynamic Settings Updates

You can update settings dynamically using `sigma.setSetting()` inside components:

```typescript
const MyComponent: FC = () => {
  const sigma = useSigma();

  const toggleLabels = () => {
    const current = sigma.getSetting("renderLabels");
    sigma.setSetting("renderLabels", !current);
  };

  return <button onClick={toggleLabels}>Toggle Labels</button>;
};
```

**Common Dynamic Settings:**
- `renderLabels` - Toggle label visibility
- `renderEdgeLabels` - Toggle edge label visibility
- `nodeReducer` - Update node appearance (see reducers)
- `edgeReducer` - Update edge appearance (see reducers)

---

## Reducers (Dynamic Styling)

Reducers are special settings that transform node/edge attributes before rendering:

### nodeReducer

**Type:** `(node: string, data: NodeDisplayData) => NodeDisplayData`

Transform node attributes dynamically.

```typescript
const [hoveredNode, setHoveredNode] = useState<string | null>(null);

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
```

### edgeReducer

**Type:** `(edge: string, data: EdgeDisplayData) => EdgeDisplayData`

Transform edge attributes dynamically.

```typescript
const [hoveredNode, setHoveredNode] = useState<string | null>(null);

useEffect(() => {
  const graph = sigma.getGraph();

  sigma.setSetting("edgeReducer", (edge, data) => {
    const { source, target } = graph.extremities(edge);

    if (source === hoveredNode || target === hoveredNode) {
      return {
        ...data,
        color: "#ff0000",
        size: data.size * 2,
      };
    }
    return data;
  });
}, [hoveredNode, sigma]);
```

**Important:** Reducers are called on every render, so keep them fast!

---

## Settings Best Practices

### 1. Always Make Settings Immutable

```typescript
// ✅ GOOD
const SETTINGS = { renderLabels: true };

// ❌ BAD
const settings = { renderLabels: true }; // Inside component
```

### 2. Only Enable Edge Events When Needed

```typescript
// ✅ GOOD - Only enable what you use
const SETTINGS = {
  enableEdgeClickEvents: true, // Only clicks
};

// ❌ BAD - Enabling all (worse performance)
const SETTINGS = {
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
  enableEdgeWheelEvents: true,
};
```

### 3. Use TypeScript for Settings

```typescript
import type { Settings } from "sigma/settings";

const SETTINGS: Partial<Settings> = {
  renderLabels: true,
  labelSize: 12,
  // TypeScript will validate these!
};
```

### 4. Update Settings Dynamically (Not Props)

```typescript
// ✅ GOOD - Update via sigma instance
const sigma = useSigma();
sigma.setSetting("renderLabels", false);

// ❌ BAD - Changing settings prop recreates instance!
const [settings, setSettings] = useState({ renderLabels: true });
setSettings({ renderLabels: false }); // DON'T DO THIS
```

---

## Quick Settings Lookup

**Need to:**
- Show node labels → `renderLabels: true`
- Show edge labels → `renderEdgeLabels: true`
- Enable edge clicks → `enableEdgeClickEvents: true`
- Enable edge hovers → `enableEdgeHoverEvents: true`
- Change label size → `labelSize: 12`
- Change label color → `labelColor: { color: "#000" }`
- Hide edges while moving → `hideEdgesOnMove: true`
- Set default node color → `defaultNodeColor: "#3388ff"`
- Set default edge color → `defaultEdgeColor: "#cccccc"`
- Enable z-index → `zIndex: true`
- Use arrow edges → `defaultEdgeType: "arrow"` + `edgeProgramClasses: { arrow: EdgeArrowProgram }`
- Limit zoom → `minCameraRatio: 0.1, maxCameraRatio: 10`

---

## Resources

- **Official Sigma.js docs:** https://www.sigmajs.org/docs/
- **React Sigma docs:** https://sim51.github.io/react-sigma/
- **Sigma settings TypeScript types:** `sigma/settings`
- **Example settings:** See [cheatsheet.md](./cheatsheet.md)

---

**Last updated:** 2025-10-01
**Based on:** Sigma.js v3.0.2, React Sigma v5.0.4

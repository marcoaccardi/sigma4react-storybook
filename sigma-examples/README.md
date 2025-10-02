# Sigma.js React TypeScript Examples

Interactive browser for Sigma.js examples converted from vanilla JavaScript to React TypeScript.

## 🎯 Purpose

This project is a learning tool for:
- Converting Sigma.js Storybook examples to React
- Understanding @react-sigma/core patterns
- Preparing for data visualization coding interviews
- Building a reference library of working examples

## 📖 Documentation

**Essential Reading:**
- **[../CLAUDE.md](../CLAUDE.md)** - The 7 conversion rules (READ THIS FIRST!)
- **[docs/quick-reference/README.md](docs/quick-reference/README.md)** - Quick reference navigation
- **[docs/vanilla-to-react-conversion.md](docs/vanilla-to-react-conversion.md)** - Step-by-step workflow

**Quick Reference (For Interviews):**
- [cheatsheet.md](docs/quick-reference/cheatsheet.md) - Syntax quick lookup
- [common-mistakes.md](docs/quick-reference/common-mistakes.md) - Troubleshooting
- [api-patterns.md](docs/quick-reference/api-patterns.md) - Copy-paste code
- [settings-reference.md](docs/quick-reference/settings-reference.md) - Complete settings

## 🚀 Quick Start

```bash
# Install dependencies (if not already done)
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

Then open: **http://localhost:5173**

## 📁 Project Structure

```
sigma-examples/
├── src/
│   ├── App.tsx                    # Main app with sidebar navigation
│   ├── App.css                    # Application styling
│   ├── main.tsx                   # React entry point
│   └── exampleRegistry.tsx        # Registry of all examples
├── examples/
│   ├── basic-graph.tsx            # Example: Basic graph
│   └── ...                        # More examples as you add them
├── docs/
│   └── vanilla-to-react-conversion.md  # Conversion guide
├── public/                        # Static assets
├── package.json                   # Dependencies
├── tsconfig.json                  # TypeScript configuration
└── vite.config.ts                 # Vite build configuration
```

## 📚 Key Files

### `src/exampleRegistry.tsx`
Central registry of all examples. Add new examples here.

**Example:**
```typescript
import { BasicGraph } from "../examples/basic-graph";

export const exampleRegistry: Example[] = [
  {
    id: "basic-graph",
    name: "Basic Graph",
    category: "Getting Started",
    component: BasicGraph,
    description: "Simple graph with nodes and edges",
    storybookUrl: "https://www.sigmajs.org/storybook/?path=/story/...",
  },
  // Add more here...
];
```

### `examples/[name].tsx`
Individual example components following conversion rules from [CLAUDE.md](../CLAUDE.md).

**Template:**
```typescript
import { FC, useEffect } from "react";
import { SigmaContainer, useLoadGraph } from "@react-sigma/core";
import Graph from "graphology";
import "@react-sigma/core/lib/style.css";

const SETTINGS = {
  renderLabels: true,
};

const LoadGraph: FC = () => {
  const loadGraph = useLoadGraph();
  useEffect(() => {
    const graph = new Graph();
    // ... create graph
    loadGraph(graph);
  }, [loadGraph]);
  return null;
};

export const ExampleName: FC = () => (
  <div style={{ height: "600px", width: "100%" }}>
    <SigmaContainer style={{ height: "100%" }} settings={SETTINGS}>
      <LoadGraph />
    </SigmaContainer>
  </div>
);
```

## 🔧 Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19.1.1 | UI framework |
| **TypeScript** | 5.8.3 | Type safety |
| **Vite** | 7.1.12 | Build tool & dev server |
| **Sigma.js** | 3.0.2 | Graph visualization (WebGL) |
| **@react-sigma/core** | 5.0.4 | React bindings for Sigma |
| **Graphology** | 0.26.0 | Graph data structure |

### Optional Packages (installed)

- **@react-sigma/layout-forceatlas2**: Force-directed layout
- **@react-sigma/layout-circular**: Circular layout
- **lodash**: Utility functions

## 📖 Adding New Examples

### Step 1: Find Example in Storybook
Browse https://www.sigmajs.org/storybook/ and pick an example.

### Step 2: Create Component
Create `examples/[example-name].tsx` following the template above.

**Conversion rules:** See [CLAUDE.md](../CLAUDE.md)

### Step 3: Add to Registry
Update `src/exampleRegistry.tsx`:

```typescript
// 1. Import
import { NewExample } from "../examples/new-example";

// 2. Add to array
{
  id: "new-example",
  name: "New Example",
  category: "Category",
  component: NewExample,
  description: "What it demonstrates",
  storybookUrl: "https://...",
}
```

### Step 4: Test
```bash
npm run dev
```

Check:
- [ ] No TypeScript errors
- [ ] Example appears in sidebar
- [ ] Graph renders correctly
- [ ] No console errors

## 📂 Example Categories

Organize examples into these categories:

- **Getting Started** - Basic graphs, simple examples
- **Interactions** - Events, drag & drop, hover
- **Layouts** - ForceAtlas2, circular, custom
- **Visual Styling** - Reducers, colors, sizes
- **Data Loading** - GEXF, JSON, CSV
- **Performance** - Large graphs, optimization
- **Advanced** - Custom renderers, complex features

## 🎨 UI Features

### Sidebar Navigation
- Categorized example list
- Active example highlighting
- Example counter

### Example Display
- Full-screen graph visualization
- Example metadata (name, description)
- Link to original Storybook example
- File path reference

## 🛠️ Development Scripts

```bash
# Development
npm run dev          # Start dev server (http://localhost:5173)

# Building
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
```

## 🐛 Common Issues

### "Container has no height" Error

**Cause:** SigmaContainer missing height

**Fix:**
```typescript
<SigmaContainer style={{ height: "600px" }}>
```

### Graph Flickering / Performance Issues

**Cause:** Settings object recreated on each render

**Fix:**
```typescript
// ✅ Correct
const SETTINGS = { ... };  // Outside component

// ❌ Wrong
const Example = () => {
  const settings = { ... };  // Inside without useMemo
```

### Edge Events Not Firing

**Cause:** Edge events disabled by default

**Fix:**
```typescript
const SETTINGS = {
  enableEdgeClickEvents: true,
  enableEdgeHoverEvents: true,
};
```

## 📚 Learning Resources

### Documentation
- **[CLAUDE.md](../CLAUDE.md)** - The 7 essential conversion rules
- **[Conversion Guide](docs/vanilla-to-react-conversion.md)** - Step-by-step workflow
- **[Installation Verification](../INSTALLATION-VERIFICATION.md)** - Setup checklist

### External Resources
- **Sigma.js Storybook**: https://www.sigmajs.org/storybook/
- **Sigma.js Documentation**: https://www.sigmajs.org/docs/
- **@react-sigma Docs**: https://sim51.github.io/react-sigma/
- **Graphology Docs**: https://graphology.github.io/

## 🎯 Project Goals

### Learning Objectives
- ✅ Master React hooks (useState, useEffect, useMemo)
- ✅ Understand @react-sigma patterns (useLoadGraph, useRegisterEvents, useSigma)
- ✅ Learn graph data structures (graphology)
- ✅ Practice TypeScript in React
- ✅ Build reusable visualization components

### Deliverables
- [ ] 10+ converted examples
- [ ] All major Storybook categories covered
- [ ] Working reference library
- [ ] Documentation complete

## 🔍 Example Conversion Workflow

```
1. Find example on Sigma.js Storybook
         ↓
2. (Optional) Test in vanilla-reference
         ↓
3. Convert using CLAUDE.md rules
         ↓
4. Save to examples/[name].tsx
         ↓
5. Add to exampleRegistry.tsx
         ↓
6. Test in browser
         ↓
7. Verify matches original behavior
```

## 💡 Tips for Success

1. **Start Simple** - Begin with basic examples before tackling complex ones
2. **Follow CLAUDE.md** - The 7 rules are essential for correct conversion
3. **Test Frequently** - Run dev server often to catch errors early
4. **Compare Outputs** - Verify your React version matches vanilla behavior
5. **Read Documentation** - Sigma.js and @react-sigma docs are invaluable

## 🚧 Roadmap

### Phase 1: Basics ✅
- [x] Project setup
- [x] Basic graph example
- [x] Sidebar navigation

### Phase 2: Core Examples (Current)
- [ ] Event handling examples
- [ ] Layout examples (ForceAtlas2, circular)
- [ ] Styling examples (reducers, custom colors)

### Phase 3: Advanced
- [ ] Data loading examples
- [ ] Performance optimization examples
- [ ] Custom renderer examples

### Phase 4: Polish
- [ ] Add code viewer
- [ ] Add comparison mode (vanilla vs React)
- [ ] Export examples as templates

## 📄 License

MIT License - Free to use for learning and interview preparation.

## 🤝 Contributing

This is a personal learning project, but if you find it useful:
1. Star the repository
2. Share with others learning Sigma.js
3. Open issues for bugs or suggestions

## 📞 Support

- **Issues**: Check [INSTALLATION-VERIFICATION.md](../INSTALLATION-VERIFICATION.md)
- **Questions**: Refer to [CLAUDE.md](../CLAUDE.md) conversion rules
- **Examples**: See [vanilla-to-react-conversion.md](docs/vanilla-to-react-conversion.md)

---

**Built with React, TypeScript, Sigma.js, and @react-sigma/core**

Happy visualizing! 🎉📊

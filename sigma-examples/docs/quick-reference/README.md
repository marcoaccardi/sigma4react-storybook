# Quick Reference Documentation

**Fast lookup guides for React Sigma.js development**

These docs are designed for **quick access during coding interviews** or rapid development. They complement the comprehensive [CLAUDE.md](../../../CLAUDE.md) conversion guide.

---

## 📚 Documentation Files

### 1. [cheatsheet.md](./cheatsheet.md)
**One-page quick reference for common patterns**

- Essential imports
- Basic component template
- Node/edge attributes reference
- Common settings
- Graph types
- React Sigma hooks
- Event types
- Conversion table

**When to use:** Need a quick reminder of syntax, imports, or structure.

---

### 2. [common-mistakes.md](./common-mistakes.md)
**Troubleshooting guide for common errors**

- Container has no height
- Graph flickering / performance issues
- Edge events not firing
- Missing CSS import
- Graph created in render
- Using hooks outside SigmaContainer
- Direct graph mutation
- Reducer not updating
- TypeScript type errors
- Missing useEffect dependencies

**When to use:** Something's not working and you need to debug quickly.

---

### 3. [api-patterns.md](./api-patterns.md)
**Copy-paste code snippets for common tasks**

- Graphology API (graph manipulation)
- Camera API (movement, zoom, focus)
- Event handling patterns
- Reducer patterns (highlighting, selection)
- Layout patterns (circular, ForceAtlas2)
- Data loading patterns

**When to use:** Need to implement a specific feature and want working code.

---

### 4. [settings-reference.md](./settings-reference.md) *(coming soon)*
**Complete Sigma.js settings reference**

- All available settings
- Type definitions
- Default values
- Use cases and examples

**When to use:** Need to configure Sigma's rendering, labels, or behavior.

---

## 🚀 Quick Start Workflow

### For First-Time Setup
1. Read [CLAUDE.md](../../../CLAUDE.md) - Comprehensive conversion guide
2. Read [vanilla-to-react-conversion.md](../vanilla-to-react-conversion.md) - Step-by-step workflow
3. Bookmark [cheatsheet.md](./cheatsheet.md) for quick reference

### For Converting Examples
1. Find example in [Sigma.js Storybook](https://www.sigmajs.org/storybook/)
2. Follow workflow in [vanilla-to-react-conversion.md](../vanilla-to-react-conversion.md)
3. Reference [cheatsheet.md](./cheatsheet.md) for syntax
4. Copy patterns from [api-patterns.md](./api-patterns.md) as needed
5. Troubleshoot with [common-mistakes.md](./common-mistakes.md)

### For Interview Coding
1. Keep [cheatsheet.md](./cheatsheet.md) open in one tab
2. Keep [api-patterns.md](./api-patterns.md) open in another
3. Reference [common-mistakes.md](./common-mistakes.md) when debugging

---

## 📖 Documentation Hierarchy

```
Documentation Structure:

CLAUDE.md (ROOT)
├── THE 7 ESSENTIAL CONVERSION RULES
│   ├── Rule 1: Sigma Instantiation
│   ├── Rule 2: Loading/Creating Graph
│   ├── Rule 3: Event Handling
│   ├── Rule 4: Accessing Sigma Instance
│   ├── Rule 5: Settings (CRITICAL!)
│   ├── Rule 6: Reducers (Dynamic Styling)
│   └── Rule 7: Edge Events (Must Enable!)
├── CRITICAL RULES SUMMARY
├── Conversion Workflow
├── Quick Reference Card
├── Common Issues and Solutions
└── Example Template

docs/vanilla-to-react-conversion.md
├── Conversion Workflow (detailed)
├── Common Conversion Patterns
└── Troubleshooting Common Issues

docs/quick-reference/
├── cheatsheet.md          ← Fast syntax lookup
├── common-mistakes.md     ← Error troubleshooting
├── api-patterns.md        ← Copy-paste code
└── settings-reference.md  ← Settings documentation
```

---

## 🎯 Use Case Guide

| I need to... | Use this document |
|-------------|-------------------|
| Understand conversion principles | [CLAUDE.md](../../../CLAUDE.md) |
| Follow step-by-step workflow | [vanilla-to-react-conversion.md](../vanilla-to-react-conversion.md) |
| Look up syntax quickly | [cheatsheet.md](./cheatsheet.md) |
| Fix an error | [common-mistakes.md](./common-mistakes.md) |
| Implement a feature | [api-patterns.md](./api-patterns.md) |
| Configure Sigma settings | [settings-reference.md](./settings-reference.md) |

---

## 💡 Tips for Interview Use

### Preparation
1. **Print or bookmark** these quick-reference docs
2. **Practice** converting 2-3 examples before the interview
3. **Memorize** the basic component template from cheatsheet.md
4. **Know where** common mistakes are documented

### During Interview
1. **Don't memorize everything** - use the docs
2. **Start with cheatsheet.md** for basic structure
3. **Copy from api-patterns.md** for specific features
4. **Debug with common-mistakes.md** when stuck

### Common Interview Tasks
- ✅ Create basic graph → [cheatsheet.md](./cheatsheet.md) (basic template)
- ✅ Add event handling → [api-patterns.md](./api-patterns.md) (event patterns)
- ✅ Implement hover highlighting → [api-patterns.md](./api-patterns.md) (reducer patterns)
- ✅ Add zoom controls → [api-patterns.md](./api-patterns.md) (camera API)
- ✅ Load data from JSON → [api-patterns.md](./api-patterns.md) (data loading)
- ✅ Fix performance issue → [common-mistakes.md](./common-mistakes.md) (settings mutability)

---

## 🔗 External Resources

### Official Documentation
- **React Sigma Docs:** https://sim51.github.io/react-sigma/
- **Sigma.js Docs:** https://www.sigmajs.org/docs/
- **Sigma.js Storybook:** https://www.sigmajs.org/storybook/
- **Graphology Docs:** https://graphology.github.io/

### Installed Packages (v5.0.4)
- `@react-sigma/core` - Main React bindings
- `@react-sigma/layout-circular` - Circular layout
- `@react-sigma/layout-forceatlas2` - Force-directed layout
- `graphology` - Graph data structure
- `sigma` - Rendering engine
- `react` & `react-dom` - UI framework

---

## 🛠️ Maintenance

### Updating Documentation
When you encounter new patterns or mistakes:

1. **New pattern?** Add to [api-patterns.md](./api-patterns.md)
2. **New mistake?** Add to [common-mistakes.md](./common-mistakes.md)
3. **New setting?** Add to [settings-reference.md](./settings-reference.md)
4. **General rule change?** Update [CLAUDE.md](../../../CLAUDE.md)

### Version Information
- **Last updated:** 2025-10-01
- **React Sigma version:** 5.0.4
- **Sigma.js version:** 3.0.2
- **Graphology version:** 0.26.0

---

## ✅ Documentation Checklist

Before your interview, verify you can:

- [ ] Find the basic component template in cheatsheet.md
- [ ] Look up node/edge attributes quickly
- [ ] Find event handling patterns
- [ ] Debug "container has no height" error
- [ ] Debug "settings causing re-renders" error
- [ ] Copy camera movement code
- [ ] Copy hover highlighting code
- [ ] Copy layout patterns
- [ ] Know where to find graph mutation methods
- [ ] Know where to find all settings options

---

**Ready to code? Start with [cheatsheet.md](./cheatsheet.md)!** 🚀

# Vanilla JavaScript Sigma.js Examples

This folder contains vanilla JavaScript examples from the Sigma.js Storybook for reference when converting to React TypeScript.

## Purpose

Use these examples to:
1. **Compare** vanilla JS code with React TypeScript implementations
2. **Test** vanilla Sigma.js behavior before converting
3. **Reference** the original implementation when troubleshooting

## How to Use

1. Open `index.html` in your browser
2. Select an example from the dropdown
3. View the source code to see vanilla implementation
4. Compare with the React version in `/sigma-examples/examples/`

## Structure

```
vanilla-reference/
├── index.html          # Main HTML file with example selector
├── examples/
│   ├── basic.html     # Basic graph example
│   ├── events.html    # Event handling example
│   └── ...            # More examples as needed
└── README.md          # This file
```

## Adding New Vanilla Examples

When you find an example in the Storybook you want to convert:

1. Copy the vanilla code from Storybook
2. Create a new `.html` file in `examples/`
3. Add it to the dropdown in `index.html`
4. Test it works in vanilla JS
5. Convert to React TypeScript using CLAUDE.md rules

## Resources

- **Sigma.js Storybook**: https://www.sigmajs.org/storybook/
- **Sigma.js Documentation**: https://www.sigmajs.org/docs/
- **Graphology Documentation**: https://graphology.github.io/

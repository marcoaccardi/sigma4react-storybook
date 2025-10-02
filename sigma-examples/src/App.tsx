import { useState } from "react";
import { exampleRegistry, groupedExamples } from "./exampleRegistry";
import "./App.css";

// Helper function to group satellite packages by subcategory
function groupSatellitePackages(examples: typeof exampleRegistry) {
  const satelliteExamples = examples.filter(ex => ex.category === "Satellite Packages");
  const subcategories: Record<string, typeof exampleRegistry> = {};

  satelliteExamples.forEach(example => {
    // Extract subcategory from name (e.g., "Edge Curve - Basic" -> "Edge Curve")
    const match = example.name.match(/^([^-]+)\s*-/);
    const subcategory = match ? match[1].trim() : "Other";

    if (!subcategories[subcategory]) {
      subcategories[subcategory] = [];
    }
    subcategories[subcategory].push(example);
  });

  return subcategories;
}

function App() {
  const [selectedExample, setSelectedExample] = useState(
    exampleRegistry[0]
  );
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({
      ...prev,
      [sectionKey]: !prev[sectionKey]
    }));
  };

  const satelliteSubcategories = groupSatellitePackages(exampleRegistry);
  const SelectedComponent = selectedExample.component;

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <h1>Sigma.js Examples</h1>
          <div className="subtitle">React TypeScript Conversions</div>
        </div>

        <div className="sidebar-content">
          {Object.entries(groupedExamples).map(([category, examples]) => (
            <div key={category} className="category">
              <div className="category-title">{category}</div>

              {category === "Satellite Packages" ? (
                // Render satellite packages with subcategories
                Object.entries(satelliteSubcategories).map(([subcategory, subExamples]) => {
                  const sectionKey = `satellite-${subcategory}`;
                  const isCollapsed = collapsedSections[sectionKey];

                  return (
                    <div key={subcategory} className="subcategory">
                      <button
                        className="subcategory-toggle"
                        onClick={() => toggleSection(sectionKey)}
                      >
                        <span className="toggle-icon">{isCollapsed ? "▶" : "▼"}</span>
                        {subcategory}
                      </button>
                      {!isCollapsed && (
                        <div className="subcategory-examples">
                          {subExamples.map((example) => (
                            <button
                              key={example.id}
                              className={`example-button ${
                                selectedExample.id === example.id ? "active" : ""
                              }`}
                              onClick={() => setSelectedExample(example)}
                            >
                              {example.name.replace(`${subcategory} - `, "")}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })
              ) : (
                // Render other categories normally
                examples.map((example) => (
                  <button
                    key={example.id}
                    className={`example-button ${
                      selectedExample.id === example.id ? "active" : ""
                    }`}
                    onClick={() => setSelectedExample(example)}
                  >
                    {example.name}
                  </button>
                ))
              )}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          Total Examples: {exampleRegistry.length}
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="example-header">
          <h2>{selectedExample.name}</h2>
          <div className="description">{selectedExample.description}</div>
          {selectedExample.storybookUrl && (
            <a
              href={selectedExample.storybookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="storybook-link"
            >
              View Original in Storybook →
            </a>
          )}
        </div>

        <div className="example-container">
          <SelectedComponent key={selectedExample.id} />
        </div>

        <div className="example-footer">
          <code>
            File: examples/{selectedExample.id}.tsx
          </code>
        </div>
      </div>
    </div>
  );
}

export default App;
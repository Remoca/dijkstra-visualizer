# Dijkstra Algorithm Visualizer

An interactive web-based visualizer for **Dijkstra's shortest path algorithm**, featuring an editable graph canvas, step-by-step animation, and JSON import/export.

## Features

- **Interactive Graph Editing**  
  - Add nodes by clicking the canvas  
  - Connect nodes with edges (input positive weight)  
  - Delete a node by double-clicking it  
  - Drag nodes to rearrange layout  
  - Prevents invalid weights (non-positive) and duplicate edges

- **Dijkstra Algorithm Execution**  
  - Step-by-step animation (Next Step)  
  - Auto-run (1 second per step)  
  - Highlights visited nodes, in-progress paths (yellow), and confirmed paths (red)  
  - Distance labels shown on each node

- **Info Panel Display**  
  - Shows start node, step queue, and current distance table  
  - Dynamically updates with each algorithm step

- **Import & Export**  
  - Import graph from `.json` file  
  - Save current graph structure as `.json` after validating connectivity  
  - Only available during **edit mode**

---

## Demo Mode

Click **Demo** to load a prebuilt graph and visualize Dijkstra directly.

---

## Buttons Overview

| Button        | Description                                  |
| ------------- | -------------------------------------------- |
| **New**       | Enter graph editing mode                     |
| **Demo**      | Load default example graph                   |
| **Save**      | Exit editing mode; optionally export `.json` |
| **Import**    | Upload `.json` to restore a graph            |
| **Start**     | Initialize Dijkstra from selected start node |
| **Next Step** | Execute next step of Dijkstra                |
| **Auto**      | Auto-run Dijkstra (1 step/sec)               |
| **Reset**     | Clear state and return to selection mode     |

---

## JSON Format

### Exported file structure:

```json
{
  "nodes": [
    { "x": 100, "y": 200 },
    ...
  ],
  "edges": [
    { "from": 0, "to": 1, "weight": 5 },
    ...
  ]
}
```

Coordinates define canvas positions.

`from` and `to` are node indices in the `nodes` array.

`weight` must be **positive integers**.




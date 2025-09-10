import React, { Component } from 'react';
import Node from './Node/node';
import { dijkstra } from '../algorithms/dijikstra';
import { bfs } from '../algorithms/bfs';
import { dfs } from '../algorithms/dfs';
import "./GridNavigator.css";

const ALGORITHMS = [
    { value: 'dijkstra', label: 'Dijkstra' },
    { value: 'bfs', label: 'BFS' },
    { value: 'dfs', label: 'DFS' },
];

export default class GridNavigator extends Component {
    constructor(props) {
        super(props);
        this.rows = 50;
        this.cols = 100;
        this.state = {
            startNode: null,
            endNode: null,
            selecting: 'start',
            walls: new Set(),
            wallDrawing: false,
            markingCell: null,
            selectedAlgorithm: 'dijkstra',
            path: new Set(),
            visited: new Set(),
            animating: false,
            showPath: false,
            disableWalls: false,
            animatingVisited: new Set(),
            animatingPath: new Set(),
        };
        this.animationTimeouts = [];
    }

    componentWillUnmount() {
        this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    }

    handleNodeClick = (row, col) => {
        const { selecting, startNode, endNode, wallDrawing, disableWalls } = this.state;
        if (disableWalls) return;
        if (selecting === 'start') {
            this.setState({ startNode: { row, col }, selecting: 'end' });
        } else if (selecting === 'end') {
            if (startNode && startNode.row === row && startNode.col === col) return;
            this.setState({ endNode: { row, col }, selecting: null });
        } else if (!wallDrawing && startNode && endNode) {
            this.setState({ wallDrawing: true });
        } else if (wallDrawing) {
            this.setState({ wallDrawing: false });
        }
    };

    handleNodeHover = (row, col) => {
        const { startNode, endNode, selecting, walls, wallDrawing, disableWalls } = this.state;
        if (disableWalls) return;
        if (selecting === null && wallDrawing) {
            const key = `${row}-${col}`;
            if (
                (startNode && startNode.row === row && startNode.col === col) ||
                (endNode && endNode.row === row && endNode.col === col) ||
                walls.has(key)
            ) {
                return;
            }
            this.setState({ markingCell: key });
            setTimeout(() => {
                this.setState(prevState => {
                    const newWalls = new Set(prevState.walls);
                    newWalls.add(key);
                    return { walls: newWalls, markingCell: null };
                });
            }, 120);
        }
    };

    handleSelectStart = () => {
        if (this.state.disableWalls) return;
        this.setState({ selecting: 'start' });
    };

    handleSelectEnd = () => {
        if (this.state.disableWalls) return;
        this.setState({ selecting: 'end' });
    };

    handleAlgorithmChange = (e) => {
        this.setState({ selectedAlgorithm: e.target.value });
    };

    // Build grid as a 2D array of values: 0-empty, 1-wall, 2-start, 3-end
   buildGridObject = () => {
    const { startNode, endNode, walls } = this.state;
    const grid = [];
    for (let row = 0; row < this.rows; row++) {
        const rowArr = [];
        for (let col = 0; col < this.cols; col++) {
            const key = `${row}-${col}`;
            if (walls.has(key)) rowArr.push(1); // wall
            else if (startNode && startNode.row === row && startNode.col === col) rowArr.push(2); // start
            else if (endNode && endNode.row === row && endNode.col === col) rowArr.push(3); // end
            else rowArr.push(0); // empty
        }
        grid.push(rowArr);
    }
    return {
        grid,
        numRows: this.rows,
        numCols: this.cols,
        startNode,
        endNode,
        walls: Array.from(walls), // Array of "row-col" strings
    };
};
   handleStartPath = () => {
    const { selectedAlgorithm } = this.state;
  const gridObj = this.buildGridObject();

let result = { visitedNodesInOrder: [], shortestPath: [] };
if (selectedAlgorithm === 'dijkstra') {
    result = dijkstra(gridObj);
} else if (selectedAlgorithm === 'bfs') {
    result = bfs(gridObj);
} else if (selectedAlgorithm === 'dfs') {
    result = dfs(gridObj);
}

    // Animate visited cells one by one
   this.setState({
    animating: true,
    path: new Set(), // empty
    visited: new Set(), // empty
    showPath: false,
    disableWalls: true,
    animatingVisited: new Set(),
    animatingPath: new Set(),
});

    this.animationTimeouts.forEach(timeout => clearTimeout(timeout));
    this.animationTimeouts = [];

    // Animate visited cells
    result.visitedNodesInOrder.forEach((node, idx) => {
        const timeout = setTimeout(() => {
            this.setState(prevState => {
                const newAnimatingVisited = new Set(prevState.animatingVisited);
                newAnimatingVisited.add(`${node.row}-${node.col}`);
                return { animatingVisited: newAnimatingVisited };
            });
        }, idx * 20); // 20ms per cell
        this.animationTimeouts.push(timeout);
    });

    // Animate path after visited cells
    const pathStartDelay = result.visitedNodesInOrder.length * 20 + 500;
    result.shortestPath.forEach((node, idx) => {
        const timeout = setTimeout(() => {
            this.setState(prevState => {
                const newAnimatingPath = new Set(prevState.animatingPath || []);
                newAnimatingPath.add(`${node.row}-${node.col}`);
                return { animatingPath: newAnimatingPath };
            });
        }, pathStartDelay + idx * 50);
        this.animationTimeouts.push(timeout);
    });

    // Finalize state after animation
    const totalAnimTime = pathStartDelay + result.shortestPath.length * 50 + 500;
   const finishTimeout = setTimeout(() => {
    this.setState({
        animating: false,
        showPath: true,
        path: new Set(result.shortestPath.map(n => `${n.row}-${n.col}`)),
        visited: new Set(result.visitedNodesInOrder.map(n => `${n.row}-${n.col}`)),
        animatingVisited: new Set(),
        animatingPath: new Set(),
    });
}, totalAnimTime);
    this.animationTimeouts.push(finishTimeout);
};
    renderGrid() {
    const grid = [];
    const { startNode, endNode, walls, markingCell, path, visited, animating, showPath, animatingVisited, animatingPath } = this.state;
    for (let row = 0; row < this.rows; row++) {
        const currentRow = [];
        for (let col = 0; col < this.cols; col++) {
            let nodeType = '';
            const key = `${row}-${col}`;
            if (startNode && startNode.row === row && startNode.col === col) {
                nodeType = 'start';
            } else if (endNode && endNode.row === row && endNode.col === col) {
                nodeType = 'end';
            } else if (walls.has(key)) {
                nodeType = 'wall';
            } else if (animatingPath && animatingPath.has(key)) {
                nodeType = 'path-anim';
            } else if (showPath && path.has(key)) {
                nodeType = 'path';
            } else if (animating && animatingVisited.has(key)) {
                nodeType = 'visited-anim';
            } else if (visited.has(key)) {
                nodeType = 'visited';
            }
            const isMarking = markingCell === key;
            currentRow.push(
                <Node
                    key={key}
                    row={row}
                    col={col}
                    nodeType={nodeType}
                    isMarking={isMarking}
                    onClick={this.handleNodeClick}
                    onMouseEnter={this.handleNodeHover}
                />
            );
        }
        grid.push(
            <div key={row} className="grid-row">
                {currentRow}
            </div>
        );
    }
    return grid;
}

   render() {
    const { selecting, selectedAlgorithm } = this.state;
    return (
        <div>
            <nav className="navbar-custom">
                <div className="navbar-title">Grid Navigator</div>
                <div className="navbar-controls">
                    <div className="dropdown-group">
                        <label>
                            Algorithms&nbsp;
                            <select value={selectedAlgorithm} onChange={this.handleAlgorithmChange}>
                                {ALGORITHMS.map(algo => (
                                    <option key={algo.value} value={algo.value}>{algo.label}</option>
                                ))}
                            </select>
                        </label>
                    </div>
                    <button
                        className={selecting === 'start' ? 'active-btn' : ''}
                        onClick={this.handleSelectStart}
                    >
                        Mark Start Node
                    </button>
                    <button
                        className={selecting === 'end' ? 'active-btn' : ''}
                        onClick={this.handleSelectEnd}
                    >
                        Mark End Node
                    </button>
                    <button
                        className="visualize-btn"
                        onClick={this.handleStartPath}
                    >
                        Visualize!
                    </button>
                    <button onClick={() => window.location.reload()} className="clear-btn">
                        Clear Board
                    </button>
                </div>
            </nav>
            <div className="legend">
                <span className="legend-item">
                    <span className="legend-icon legend-start"></span> Start Node
                </span>
                <span className="legend-item">
                    <span className="legend-icon legend-end"></span> Target Node
                </span>
                <span className="legend-item">
                    <span className="legend-icon legend-wall"></span> Wall Node
                </span>
                <span className="legend-item">
                    <span className="legend-icon legend-unvisited"></span> Unvisited Node
                </span>
                <span className="legend-item">
                    <span className="legend-icon legend-visited"></span> Visited Node
                </span>
                <span className="legend-item">
                    <span className="legend-icon legend-path"></span> Shortest-path Node
                </span>
            </div>
            <div className="grid-container">
                {this.renderGrid()}
            </div>
        </div>
    );
}
}
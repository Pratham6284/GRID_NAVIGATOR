/**
 * Breadth-First Search (BFS) for a grid object.
 * @param {Object} gridObj - { grid, numRows, numCols }
 * @returns {Object} { visitedNodesInOrder, shortestPath }
 */
export function bfs({ grid, numRows, numCols }) {
    let startNode = null, endNode = null;
    const walls = new Set();

    for (let row = 0; row < numRows; row++) {
        for (let col = 0; col < numCols; col++) {
            if (grid[row][col] === 2) startNode = { row, col };
            else if (grid[row][col] === 3) endNode = { row, col };
            else if (grid[row][col] === 1) walls.add(`${row}-${col}`);
        }
    }

    const visitedNodesInOrder = [];
    const visited = Array.from({ length: numRows }, () =>
        Array(numCols).fill(false)
    );
    const prev = Array.from({ length: numRows }, () =>
        Array(numCols).fill(null)
    );

    const queue = [];
    queue.push({ row: startNode.row, col: startNode.col });
    visited[startNode.row][startNode.col] = true;

    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    while (queue.length > 0) {
        const { row, col } = queue.shift();
        visitedNodesInOrder.push({ row, col });

        if (row === endNode.row && col === endNode.col) break;

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            const key = `${newRow}-${newCol}`;
            if (
                newRow >= 0 && newRow < numRows &&
                newCol >= 0 && newCol < numCols &&
                !walls.has(key) &&
                !visited[newRow][newCol]
            ) {
                queue.push({ row: newRow, col: newCol });
                visited[newRow][newCol] = true;
                prev[newRow][newCol] = { row, col };
            }
        }
    }

    // Reconstruct shortest path
    const shortestPath = [];
    let curr = endNode;
    while (curr && prev[curr.row][curr.col] !== null) {
        shortestPath.unshift(curr);
        curr = prev[curr.row][curr.col];
    }
    if (curr && curr.row === startNode.row && curr.col === startNode.col) {
        shortestPath.unshift(startNode);
    } else {
        return { visitedNodesInOrder, shortestPath: [] };
    }

    return { visitedNodesInOrder, shortestPath };
}
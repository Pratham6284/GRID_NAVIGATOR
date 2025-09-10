/**
 * Dijkstra's algorithm for a grid object.
 * @param {Object} gridObj - { grid, numRows, numCols, startNode, endNode, walls }
 * @returns {Object} { visitedNodesInOrder, shortestPath }
 */
export function dijkstra({ grid, numRows, numCols, startNode, endNode, walls }) {
    // If startNode or endNode is not provided, scan the grid to find them (fallback)
    let sNode = startNode, eNode = endNode;
    const wallSet = new Set(walls || []);

    if (!sNode || !eNode) {
        for (let row = 0; row < numRows; row++) {
            for (let col = 0; col < numCols; col++) {
                if (grid[row][col] === 2) sNode = { row, col };
                else if (grid[row][col] === 3) eNode = { row, col };
            }
        }
    }
    if (!sNode || !eNode) return { visitedNodesInOrder: [], shortestPath: [] };

    const visitedNodesInOrder = [];
    const distances = Array.from({ length: numRows }, () =>
        Array(numCols).fill(Infinity)
    );
    const prev = Array.from({ length: numRows }, () =>
        Array(numCols).fill(null)
    );
    const visited = Array.from({ length: numRows }, () =>
        Array(numCols).fill(false)
    );

    const pq = [];
    distances[sNode.row][sNode.col] = 0;
    pq.push({ row: sNode.row, col: sNode.col, dist: 0 });

    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    while (pq.length > 0) {
        pq.sort((a, b) => a.dist - b.dist);
        const { row, col, dist } = pq.shift();

        if (visited[row][col]) continue;
        visited[row][col] = true;
        visitedNodesInOrder.push({ row, col });

        if (row === eNode.row && col === eNode.col) break;

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            const key = `${newRow}-${newCol}`;
            if (
                newRow >= 0 && newRow < numRows &&
                newCol >= 0 && newCol < numCols &&
                !wallSet.has(key) &&
                !visited[newRow][newCol]
            ) {
                const newDist = dist + 1;
                if (newDist < distances[newRow][newCol]) {
                    distances[newRow][newCol] = newDist;
                    prev[newRow][newCol] = { row, col };
                    pq.push({ row: newRow, col: newCol, dist: newDist });
                }
            }
        }
    }

    // Reconstruct shortest path
    const shortestPath = [];
    let curr = eNode;
    while (curr && prev[curr.row][curr.col] !== null) {
        shortestPath.unshift(curr);
        curr = prev[curr.row][curr.col];
    }
    if (curr && curr.row === sNode.row && curr.col === sNode.col) {
        shortestPath.unshift(sNode);
    } else {
        return { visitedNodesInOrder, shortestPath: [] };
    }

    return { visitedNodesInOrder, shortestPath };
}
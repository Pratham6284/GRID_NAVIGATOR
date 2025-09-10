import React from 'react';
import './Node.css';

export default function Node({ row, col, nodeType, isMarking, onClick, onMouseEnter }) {
    let className = 'node';
    if (nodeType === 'start') className += ' node-start';
    else if (nodeType === 'end') className += ' node-end';
    else if (nodeType === 'wall') className += ' node-wall';
    else if (nodeType === 'path') className += ' node-path';
    else if (nodeType === 'visited') className += ' node-visited';
    if (isMarking) className += ' node-marking';

    return (
        <div
            className={className}
            onClick={() => onClick(row, col)}
            onMouseEnter={() => onMouseEnter(row, col)}
        ></div>
    );
}   
import React, { useCallback, useRef, useState, FC } from 'react';
import produce from 'immer';
import './Game.css'
import Button from '../common/Button';

const numRows = 25;
const numCols = 25;
const speed = 500;

const operations = [
    [-1, -1],
    [-1, 0],
    [-1, 1],
    [0, -1],
    [0, 1],
    [1, -1],
    [1, 0],
    [1, 1],
];

const colors = ['#FF6633', '#FFB399', '#FF33FF', '#FFFF99', '#00B3E6',
    '#E6B333', '#3366E6', '#999966', '#99FF99', '#B34D4D',
    '#80B300', '#809900', '#E6B3B3', '#6680B3', '#66991A',
    '#FF99E6', '#CCFF1A', '#FF1A66', '#E6331A', '#33FFCC',
    '#66994D', '#B366CC', '#4D8000', '#B33300', '#CC80CC',
    '#66664D', '#991AFF', '#E666FF', '#4DB3FF', '#1AB399',
    '#E666B3', '#33991A', '#CC9999', '#B3B31A', '#00E680',
    '#4D8066', '#809980', '#E6FF80', '#1AFF33', '#999933',
    '#FF3380', '#CCCC00', '#66E64D', '#4D80CC', '#9900B3',
    '#E64D66', '#4DB380', '#FF4D4D', '#99E6E6', '#6666FF'];

const resetGrid = () =>
    Array.from({ length: numRows }).map(() =>
        Array.from({ length: numCols }).fill(0),
    );

const seedGrid = () => {
    const rows = [];
    for (let i = 0; i < numRows; i++) {
        rows.push(Array.from(Array(numCols), () => (Math.random() > 0.7 ? 1 : 0)));
    }
    return rows;
};

const countNeighbors = (grid: any[][], x: number, y: number) => {
    return operations.reduce((acc, [i, j]) => {
        const row = (x + i + numRows) % numRows;
        const col = (y + j + numCols) % numCols;
        acc += grid[row][col];
        return acc;
    }, 0);
};

export const Game: FC = () => {
    const [grid, setGrid] = useState(() => resetGrid());

    const [running, setRunning] = useState(false);
    const [generation, setGeneration] = useState(0);

    const runningRef = useRef(running);
    runningRef.current = running;

    const generationRef = useRef(generation);
    generationRef.current = generation;

    const runSimulation = useCallback(() => {
        setInterval(() => {
            if (!runningRef.current) {
                return;
            }

            setGrid((currentGrid) =>
                produce(currentGrid, (gridCopy) => {
                    for (let i = 0; i < numRows; i++) {
                        for (let j = 0; j < numCols; j++) {
                            const count = countNeighbors(currentGrid, i, j);
                            if (currentGrid[i][j] === 1 && (count < 2 || count > 3))
                                gridCopy[i][j] = 0;
                            if (!currentGrid[i][j] && count === 3) gridCopy[i][j] = 1;
                        }
                    }
                }),
            );
            setGeneration(++generationRef.current);
        }, speed);
    }, []);

    const handleSimulation = () => {
        setRunning(!running);
        runningRef.current = !running;
        if (!running) {
            runSimulation();
        }
    }

    const handleManualFill = (rowIdx: number, colIdx: number) => {
        const newGrid = produce(grid, (gridCopy) => {
            gridCopy[rowIdx][colIdx] = grid[rowIdx][colIdx] ? 0 : 1;
        });
        setGrid(newGrid);
    }

    const handleClear = () => {
        setGrid(resetGrid());
        setGeneration(0);
    }

    const randomizeColor = () => {
        const randomIndex = Math.floor(Math.random() * 50)
        return colors[randomIndex]
    }

    return (
        <div className='game-container'>
            <div className='btn-block'>
                <Button onClick={handleSimulation}>
                    {!running ? 'Start' : 'Stop'}
                </Button>
                <Button onClick={handleClear}>
                    Clear
                </Button>
                <Button onClick={() => { setGrid(seedGrid()) }}>
                    Seed
                </Button>
            </div>

            <p className='info'>Generation: {generation}</p>

            <div className='field' style={{ gridTemplateColumns: `repeat(${numCols}, 20px)` }}>
                {grid.map((rows, rowIdx) =>
                    rows.map((col, colIdx) => (
                        <div className='cell'
                            key={`${rowIdx}-${colIdx}`}
                            onClick={() => handleManualFill(rowIdx, colIdx)}
                            style={{ backgroundColor: grid[rowIdx][colIdx] ? randomizeColor() : '#eee' }}
                        />
                    )),
                )}
            </div>
        </div>
    );
};
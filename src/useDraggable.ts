import React, { useState, useRef } from 'react';

type Position = {
    x: number;
    y: number;
};

export default function useDraggable<TElement>(startAt: Position): [Position, (e: React.MouseEvent<TElement>) => void] {
    const lastMousePosition = useRef<Position | null>();
    const [position, setPosition] = useState(startAt);

    function onMouseMove(e: MouseEvent) {
        const currentPosition: Position = { x: e.clientX, y: e.clientY };

        if (!lastMousePosition.current) {
            lastMousePosition.current = currentPosition;
            return;
        }

        const xDelta = currentPosition.x - lastMousePosition.current.x;
        const yDelta = currentPosition.y - lastMousePosition.current.y;

        lastMousePosition.current = currentPosition;
        setPosition(({ x, y }) => ({ x: x + xDelta, y: y + yDelta }));
    }

    function onMouseDown(e: React.MouseEvent<TElement>) {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseMove);
        lastMousePosition.current = null;
    }

    return [position, onMouseDown];
}

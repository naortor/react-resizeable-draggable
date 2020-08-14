import React, { useState, useRef } from 'react';

type Position = {
    x: number;
    y: number;
};

export default function useDraggable<TElement>(startAt: Position): [(e: React.MouseEvent<TElement>) => void, Position] {
    const lastMousePosition = useRef<Position | null>();
    const [position, setPosition] = useState(startAt);

    function onMouseMove(e: MouseEvent) {
        const currentX = e.clientX;
        const currentY = e.clientY;

        if (!lastMousePosition.current) {
            lastMousePosition.current = { x: currentX, y: currentY };
            return;
        }

        const { x: lastX, y: lastY } = lastMousePosition.current;

        const xDelta = currentX - lastX;
        const yDelta = currentY - lastY;

        lastMousePosition.current = { x: currentX, y: currentY };
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

    return [onMouseDown, position];
}

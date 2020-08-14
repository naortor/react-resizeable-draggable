import React, { useState, useRef, useEffect } from 'react';
import { minmax } from './utils';

type Position = {
    x: number;
    y: number;
};

type Options = {
    maxX: number;
    maxY: number;
    minX: number;
    minY: number;
};

const defaultOptions: Options = {
    minX: 0,
    minY: 0,
    maxX: Math.max(document.documentElement.clientWidth ?? 0, window.innerWidth ?? 0),
    maxY: Math.max(document.documentElement.clientHeight ?? 0, window.innerHeight ?? 0),
};

export default function useDraggable<TElement>(
    startAt: Position,
    options?: Partial<Options>,
): [(e: React.MouseEvent<TElement>) => void, Position] {
    const lastMousePosition = useRef<Position | null>();
    const [position, setPosition] = useState(startAt);
    const { minX, minY, maxX, maxY } = { ...defaultOptions, ...options };

    useEffect(() => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }, []);

    function getCalculatedPosition(deltaX: number, deltaY: number) {
        return ({ x, y }: Position): Position => {
            return {
                x: minmax(x + deltaX, minX, maxX),
                y: minmax(y + deltaY, minY, maxY),
            };
        };
    }

    function onMouseMove(e: MouseEvent) {
        const currentX = e.clientX;
        const currentY = e.clientY;

        if (!lastMousePosition.current) {
            lastMousePosition.current = { x: currentX, y: currentY };
            return;
        }

        const { x: lastX, y: lastY } = lastMousePosition.current;

        const deltaX = currentX - lastX;
        const deltaY = currentY - lastY;

        lastMousePosition.current = { x: currentX, y: currentY };
        setPosition(getCalculatedPosition(deltaX, deltaY));
    }

    function onMouseDown(e: React.MouseEvent<TElement>) {
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
        lastMousePosition.current = { x: e.clientX, y: e.clientY };
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        lastMousePosition.current = null;
    }

    return [onMouseDown, position];
}

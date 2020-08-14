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
    translate: boolean;
    grid: [number, number];
};

const defaultOptions: Options = {
    minX: 0,
    minY: 0,
    maxX: Math.max(document.documentElement.clientWidth ?? 0, window.innerWidth ?? 0),
    maxY: Math.max(document.documentElement.clientHeight ?? 0, window.innerHeight ?? 0),
    translate: false,
    grid: [15, 15],
};

export default function useDraggable<TElement>(
    startAt: Position,
    options?: Partial<Options>,
): [(e: React.MouseEvent<TElement>) => void, Position] {
    const originalPosition = useRef<Position>(startAt);
    const lastMousePosition = useRef<Position | null>();
    const [position, setPosition] = useState(startAt);
    const {
        minX,
        minY,
        maxX,
        maxY,
        translate,
        grid: [stepX, stepY],
    } = { ...defaultOptions, ...options };

    useEffect(() => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }, []);

    function getCalculatedPosition({ deltaX = 0, deltaY = 0 }: { deltaX?: number; deltaY?: number }) {
        return ({ x, y }: Position): Position => ({
            x: minmax(x + deltaX, minX, maxX),
            y: minmax(y + deltaY, minY, maxY),
        });
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

        if (Math.abs(deltaX) < stepX && Math.abs(deltaY) < stepY) return;

        if (Math.abs(deltaX) < stepX) {
            setPosition(getCalculatedPosition({ deltaY }));
            return;
        }

        if (Math.abs(deltaY) < stepY) {
            setPosition(getCalculatedPosition({ deltaX }));
            return;
        }

        setPosition(getCalculatedPosition({ deltaX, deltaY }));
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

    if (!translate) {
        return [onMouseDown, position];
    }

    const translatePosition: Position = {
        x: (position.x - originalPosition.current.x) * -1,
        y: (position.y - originalPosition.current.y) * -1,
    };

    return [onMouseDown, translatePosition];
}

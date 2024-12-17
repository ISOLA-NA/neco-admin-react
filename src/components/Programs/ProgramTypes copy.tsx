import React, { useState, useRef, useEffect, MouseEvent } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import 'daisyui';

export default function DaisyPanelDemo() {
    const [isMaximized, setIsMaximized] = useState(false);
    const [panelWidth, setPanelWidth] = useState(50); // Initial width percentage for Panel 1
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null); // Explicitly typing the ref

    const togglePanelSize = () => {
        setIsMaximized((prev) => !prev);
    };

    const startDragging = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const stopDragging = () => {
        setIsDragging(false);
    };

    const handleMouseMove = (e: MouseEvent | globalThis.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;

        const containerOffsetLeft = containerRef.current.getBoundingClientRect().left;
        const containerWidth = containerRef.current.getBoundingClientRect().width;
        let newWidth = ((e.clientX - containerOffsetLeft) / containerWidth) * 100;

        // Set minimum and maximum widths (e.g., 10% to 90%)
        if (newWidth < 10) newWidth = 10;
        if (newWidth > 90) newWidth = 90;

        setPanelWidth(newWidth);
    };

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopDragging);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
        }

        // Cleanup on unmount
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
        };
    }, [isDragging]);

    return (
        <div
            ref={containerRef}
            className="flex w-full flex-col lg:flex-row h-64 gap-0 relative"
        >
            {/* پنل اول */}
            <div
                className={`card bg-base-300 rounded-box h-full grid place-items-center transition-all duration-300 ${
                    isMaximized ? 'w-0 overflow-hidden' : 'w-full lg:w-1/2'
                }`}
                style={{
                    width: isMaximized ? '0%' : `${panelWidth}%`,
                    flexGrow: isMaximized ? 0 : 0,
                }}
            >
                {!isMaximized && <div>Panel 1</div>}
            </div>

            {/* Divider */}
            {!isMaximized && (
                <div
                    onMouseDown={startDragging}
                    className="flex items-center justify-center lg:divider lg:divider-horizontal cursor-ew-resize w-2"
                    style={{ userSelect: 'none', cursor: 'col-resize' }}
                >
                    <div className="h-full w-1 bg-neutral rounded"></div>
                </div>
            )}

            {/* پنل دوم */}
            <div
                className={`card bg-base-300 rounded-box h-full grid place-items-center relative transition-all duration-300 ${
                    isMaximized ? 'w-full' : 'w-full lg:w-1/2'
                }`}
                style={{
                    width: isMaximized ? '100%' : `${100 - panelWidth}%`,
                    flexGrow: isMaximized ? 1 : 0,
                }}
            >
                {/* دکمه آیکون در بالا-راست */}
                <button
                    onClick={togglePanelSize}
                    className="absolute top-2 right-2 text-xl btn btn-circle btn-sm btn-outline"
                >
                    {isMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>
                Panel 2
            </div>
        </div>
    );
}

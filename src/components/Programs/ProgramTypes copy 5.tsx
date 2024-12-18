import React, { useState, useRef, useEffect, MouseEvent, useCallback } from 'react';
import { FiMaximize2, FiMinimize2 } from 'react-icons/fi';
import 'daisyui';

export default function DaisyPanelDemo() {
    const [isMaximized, setIsMaximized] = useState(false);
    const [panelWidth, setPanelWidth] = useState(50); // پهنای اولیه پنل سمت چپ به درصد
    const [isDragging, setIsDragging] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const togglePanelSize = () => {
        setIsMaximized((prev) => !prev);
    };

    const startDragging = (e: MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isMaximized) {
            setIsDragging(true);
        }
    };

    const stopDragging = useCallback(() => {
        setIsDragging(false);
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent | globalThis.MouseEvent) => {
            if (!isDragging || !containerRef.current || isMaximized) return;

            const containerRect = containerRef.current.getBoundingClientRect();
            const containerOffsetLeft = containerRect.left;
            const containerWidth = containerRect.width;
            let newWidth = ((e.clientX - containerOffsetLeft) / containerWidth) * 100;

            // محدودیت‌ها روی عرض پنل چپ
            if (newWidth < 10) newWidth = 10;
            if (newWidth > 90) newWidth = 90;

            setPanelWidth(newWidth);
        },
        [isDragging, isMaximized]
    );

    useEffect(() => {
        if (isDragging) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', stopDragging);
        } else {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
        }

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDragging);
        };
    }, [isDragging, handleMouseMove, stopDragging]);

    // در حالت ماکسیمایز کل صفحه برای Panel2 در نظر گرفته می‌شود.
    // اسپلینتر روی همه قرار می‌گیرد تا دیده شود.
    // Panel2 در حالت معمولی کنار Panel1 است.
    // در حالت ماکسیمایز Panel2 با انیمیشن از سمت راست وارد می‌شود.

    return (
        <div
            ref={containerRef}
            className="relative w-full h-64 overflow-hidden bg-base-100"
        >
            {/* Panel 1 */}
            <div
                className="h-full bg-base-300 rounded-box transition-all duration-300"
                style={{
                    width: isMaximized ? `${panelWidth}%` : `${panelWidth}%`,
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    bottom: 0,
                    overflow: 'hidden',
                }}
            >
                {!isMaximized && (
                    <div className="w-full h-full flex items-center justify-center">
                        Panel 1
                    </div>
                )}
            </div>

            {/* Splitter */}
            <div
                onMouseDown={startDragging}
                className="cursor-col-resize z-30"
                style={{
                    position: 'absolute',
                    top: 0,
                    bottom: 0,
                    width: '2px',
                    background: '#555',
                    left: isMaximized ? '0%' : `${panelWidth}%`,
                    transform: 'translateX(-1px)',
                    userSelect: 'none',
                    transition: 'left 300ms ease',
                }}
            ></div>

            {/* Panel 2 */}
            <div
                className="bg-base-300 rounded-box h-full flex items-center justify-center"
                style={{
                    position: isMaximized ? 'absolute' : 'absolute',
                    top: 0,
                    bottom: 0,
                    right: 0,
                    width: isMaximized ? '100%' : `${100 - panelWidth}%`,
                    transition: 'transform 300ms ease, opacity 300ms ease, width 300ms ease',
                    transform: isMaximized ? 'translateX(0)' : 'translateX(0)',
                    opacity: 1,
                    zIndex: isMaximized ? 10 : 1,
                }}
            >
                <button
                    onClick={togglePanelSize}
                    className="absolute top-2 right-2 text-xl btn btn-circle btn-sm btn-outline z-50"
                >
                    {isMaximized ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>
                <div>Panel 2</div>
            </div>

            {isMaximized && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        pointerEvents: 'none',
                    }}
                >
                    {/* این لایه فقط برای پوشاندن Panel1 زیر Panel2 است و از Panel2 شفاف می‌ماند. */}
                </div>
            )}
        </div>
    );
}

"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface AnimatedSectionProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
}

export function AnimatedSection({
    children,
    className = "",
    delay = 0,
    direction = "up",
}: AnimatedSectionProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
        none: { y: 0, x: 0 },
    };

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                y: directions[direction].y,
                x: directions[direction].x,
            }}
            animate={
                isInView
                    ? { opacity: 1, y: 0, x: 0 }
                    : { opacity: 0, y: directions[direction].y, x: directions[direction].x }
            }
            transition={{
                duration: 0.8,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Stagger children animation wrapper
interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
}

export function StaggerContainer({
    children,
    className = "",
    staggerDelay = 0.1,
}: StaggerContainerProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-50px" });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            variants={{
                visible: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

export function StaggerItem({
    children,
    className = "",
}: {
    children: React.ReactNode;
    className?: string;
}) {
    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 30 },
                visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

// Animated counter for stats
interface AnimatedCounterProps {
    target: number;
    duration?: number;
    suffix?: string;
    prefix?: string;
    className?: string;
}

export function AnimatedCounter({
    target,
    duration = 2,
    suffix = "",
    prefix = "",
    className = "",
}: AnimatedCounterProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.span
            ref={ref}
            className={className}
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
        >
            {isInView ? (
                <motion.span>
                    {prefix}
                    <Counter from={0} to={target} duration={duration} />
                    {suffix}
                </motion.span>
            ) : (
                <span>{prefix}0{suffix}</span>
            )}
        </motion.span>
    );
}

function Counter({ from, to, duration }: { from: number; to: number; duration: number }) {
    return (
        <motion.span
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration }}
        >
            <CounterInner from={from} to={to} duration={duration} />
        </motion.span>
    );
}

function CounterInner({ from, to, duration }: { from: number; to: number; duration: number }) {
    const ref = useRef<HTMLSpanElement>(null);

    React.useEffect(() => {
        if (!ref.current) return;
        const start = performance.now();
        const step = (time: number) => {
            const elapsed = (time - start) / 1000;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            const value = Math.round(from + (to - from) * eased);
            if (ref.current) ref.current.textContent = value.toLocaleString();
            if (progress < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [from, to, duration]);

    return <span ref={ref}>{from}</span>;
}

import React from "react";

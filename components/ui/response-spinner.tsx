"use client";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface ResponseSpinnerProps {
	isLoading: boolean;
	hasStartedReceiving?: boolean;
	className?: string;
	onTimeUpdate?: (timeElapsed: number) => void;
}

export function ResponseSpinner({
	isLoading,
	hasStartedReceiving = false,
	className,
	onTimeUpdate,
}: ResponseSpinnerProps) {
	const [timeElapsed, setTimeElapsed] = useState(0);
	const [startTime, setStartTime] = useState<number | null>(null);

	useEffect(() => {
		if (isLoading && !hasStartedReceiving) {
			// Start the timer when loading begins
			if (startTime === null) {
				setStartTime(Date.now());
				setTimeElapsed(0);
			}

			const interval = setInterval(() => {
				if (startTime) {
					const elapsed = Date.now() - startTime;
					const seconds = elapsed / 1000;
					setTimeElapsed(seconds);
					onTimeUpdate?.(seconds);
				}
			}, 100); // Update every 100ms for smooth animation

			return () => clearInterval(interval);
		} else {
			// Reset when loading stops or response starts
			setStartTime(null);
			setTimeElapsed(0);
		}
	}, [isLoading, hasStartedReceiving, startTime, onTimeUpdate]);

	// Don't show spinner if not loading or if already receiving response
	if (!isLoading || hasStartedReceiving) {
		return null;
	}

	const formatTime = (seconds: number): string => {
		if (seconds < 1) {
			return `${Math.floor(seconds * 1000)}ms`;
		}
		return `${seconds.toFixed(1)}s`;
	};

	return (
		<div
			className={cn(
				"flex items-center justify-center gap-2 p-4 text-sm text-muted-foreground",
				className
			)}
		>
			<Loader2 className="h-4 w-4 animate-spin" />
			<span>Thinking... {formatTime(timeElapsed)}</span>
		</div>
	);
}

ResponseSpinner.displayName = "ResponseSpinner";

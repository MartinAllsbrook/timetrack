import { useEffect } from "preact/hooks";
import type { Signal } from "@preact/signals";
import type { ActiveSession, ProjectWithStats } from "../types.ts";

interface TimerProps {
    activeSession: Signal<ActiveSession | null>;
    selectedProject: Signal<ProjectWithStats | null>;
    onStart: () => void;
    onStop: () => void;
    isLoading: Signal<boolean>;
}

export default function Timer(props: TimerProps) {
    const currentTime = new Date().getTime();
    const startTime = props.activeSession.value?.startTime.getTime() ||
        currentTime;
    const elapsed = currentTime - startTime;

    // Re-render every second when tracking is active
    useEffect(() => {
        if (!props.activeSession.value) return;

        const interval = setInterval(() => {
            // Force re-render by updating a signal
            props.activeSession.value = { ...props.activeSession.value! };
        }, 1000);

        return () => clearInterval(interval);
    }, [props.activeSession.value]);

    const isTracking = !!props.activeSession.value;
    const canStart = !!props.selectedProject.value && !isTracking;

    return (
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div class="text-center space-y-4">
                {/* Timer Display */}
                <div class="space-y-2">
                    <div
                        class={`text-4xl font-mono font-bold timer-display ${
                            isTracking ? "text-green-600" : "text-gray-400"
                        }`}
                    >
                        {formatTime(isTracking ? elapsed : 0)}
                    </div>
                    {isTracking && props.selectedProject.value && (
                        <div class="flex items-center justify-center space-x-2 status-active">
                            <div
                                class="w-3 h-3 rounded-full"
                                style={{
                                    backgroundColor:
                                        props.selectedProject.value.color,
                                }}
                            >
                            </div>
                            <span class="text-lg font-medium text-gray-800">
                                {props.selectedProject.value.name}
                            </span>
                            <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse">
                            </div>
                        </div>
                    )}
                </div>

                {/* Control Buttons */}
                <div class="flex justify-center space-x-4">
                    {!isTracking
                        ? (
                            <button
                                type="button"
                                onClick={props.onStart}
                                disabled={!canStart || props.isLoading.value}
                                class={`px-8 py-3 rounded-lg font-medium text-white transition-all btn-hover-scale ${
                                    canStart && !props.isLoading.value
                                        ? "bg-green-600 hover:bg-green-700"
                                        : "bg-gray-400 cursor-not-allowed"
                                }`}
                            >
                                {props.isLoading.value
                                    ? "Starting..."
                                    : "Start Tracking"}
                            </button>
                        )
                        : (
                            <button
                                type="button"
                                onClick={props.onStop}
                                disabled={props.isLoading.value}
                                class="px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-all btn-hover-scale disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {props.isLoading.value
                                    ? "Stopping..."
                                    : "Stop Tracking"}
                            </button>
                        )}
                </div>

                {/* Status Message */}
                {!props.selectedProject.value && !isTracking && (
                    <p class="text-gray-500 text-sm">
                        Select a project to start tracking time
                    </p>
                )}
            </div>
        </div>
    );
}

function formatTime(milliseconds: number): string {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${
        minutes.toString().padStart(2, "0")
    }:${seconds.toString().padStart(2, "0")}`;
}

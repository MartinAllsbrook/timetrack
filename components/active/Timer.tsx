import { useSignal, useSignalEffect, type Signal } from "@preact/signals";
import type { ActiveSession, ProjectWithStats } from "src/types.ts";

interface TimerProps {
    activeSession: Signal<ActiveSession | null>;
    selectedProject: Signal<ProjectWithStats | null>;
}

export default function Timer(props: TimerProps) {
    const isTracking = useSignal(false);
    // const canStart = useSignal(false);

    const currentTime = new Date().getTime();
    const startTime = props.activeSession.value?.startTime 
        ? props.activeSession.value.startTime.getTime()
        : currentTime;
    const elapsed = currentTime - startTime;

    // Re-render every second when tracking is active
    useSignalEffect(() => {
        if (!props.activeSession.value) return;

        const timeout = setTimeout(() => {
            // Force re-render by updating a signal
            props.activeSession.value = { ...props.activeSession.value! };
        }, 1000);

        return () => clearTimeout(timeout);
    });

    isTracking.value = !!props.activeSession.value;
    // canStart.value = !!props.selectedProject.value && !isTracking.value;
    
    return (
        <div class="text-center space-y-4">
            {/* Timer Display */}
            <div class="space-y-2">
                <div
                    class={`text-2xl font-mono font-bold timer-display ${
                        isTracking.value ? "text-green-600" : "text-gray-400"
                    }`}
                >
                    {formatTime(isTracking.value ? elapsed : 0)}
                </div>
            </div>

            {/* Status Message */}
            {/* {!props.selectedProject.value && !isTracking.value && (
                <p class="text-gray-500 text-sm">
                    Select a project to start tracking time
                </p>
            )} */}
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

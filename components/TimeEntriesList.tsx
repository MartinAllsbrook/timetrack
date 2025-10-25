import type { Signal } from "@preact/signals";
import type { TimeEntryWithProject } from "../src/types.ts";

interface TimeEntriesListProps {
    timeEntries: Signal<TimeEntryWithProject[]>;
    onDeleteEntry: (id: string) => void;
}

export default function TimeEntriesList(props: TimeEntriesListProps) {
    const recentEntries = props.timeEntries.value.slice(0, 10); // Show last 10 entries
    return (
        <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">
                Recent Time Entries
            </h3>

            {recentEntries.length === 0
                ? (
                    <div class="text-center py-8 text-gray-500">
                        <p>
                            No time entries yet. Start tracking to see your
                            entries here!
                        </p>
                    </div>
                )
                : (
                    <div class="space-y-3 max-h-96 overflow-y-auto time-entries-scroll">
                        {recentEntries.map((entry) => (
                            <div
                                key={entry.id}
                                class="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50"
                            >
                                <div class="flex items-center space-x-3">
                                    <div
                                        class="w-3 h-3 rounded-full"
                                        style={{
                                            backgroundColor:
                                                entry.project.color,
                                        }}
                                    >
                                    </div>
                                    <div>
                                        <div class="font-medium text-gray-900">
                                            {entry.project.name}
                                        </div>
                                        {entry.description && (
                                            <div class="text-sm text-gray-600">
                                                {entry.description}
                                            </div>
                                        )}
                                        <div class="text-xs text-gray-500">
                                            {formatDate(entry.startTime)}
                                            {entry.endTime &&
                                                ` • ${
                                                    formatTimeRange(
                                                        entry.startTime,
                                                        entry.endTime,
                                                    )
                                                }`}
                                            {!entry.endTime && " • Active"}
                                        </div>
                                    </div>
                                </div>

                                <div class="flex items-center space-x-3">
                                    <div class="text-right">
                                        <div class="font-medium text-gray-900">
                                            {entry.endTime
                                                ? formatDuration(
                                                    entry.endTime.getTime() -
                                                    entry.startTime.getTime(),
                                                )
                                                : formatDuration(
                                                    new Date().getTime() -
                                                    entry.startTime.getTime(),
                                                )}
                                        </div>
                                        {!entry.endTime && (
                                            <div class="text-xs text-green-600 font-medium">
                                                Running
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            props.onDeleteEntry(entry.id)}
                                        class="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                                        title="Delete entry"
                                    >
                                        <svg
                                            class="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                                clipRule="evenodd"
                                            >
                                            </path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
        </div>
    );
}

function formatDate(date: Date): string {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (isSameDay(date, today)) {
        return `Today ${
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }`;
    } else if (isSameDay(date, yesterday)) {
        return `Yesterday ${
            date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        }`;
    } else {
        return date.toLocaleDateString([], {
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    }
}

function formatTimeRange(start: Date, end: Date): string {
    return `${
        start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    } - ${end.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function formatDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
        return `${minutes}m`;
    } else {
        return `${seconds}s`;
    }
}

function isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate();
}

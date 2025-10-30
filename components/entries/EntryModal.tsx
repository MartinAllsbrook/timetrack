import { useState } from "preact/hooks";
import { Project, UpdateTimeEntryRequest, TimeEntryWithProject } from "../../src/types.ts";

interface EntryModalProps {
    isOpen: boolean;
    entry: TimeEntryWithProject;
    projects: Project[];
    onClose: () => void;
    onUpdate: (id: string, updates: UpdateTimeEntryRequest) => Promise<void>;
}

export function EntryModal(props: EntryModalProps) {
    const [description, setDescription] = useState(props.entry.description || "");
    const [projectId, setProjectId] = useState(props.entry.projectId);
    
    // Helper function to convert UTC date to local datetime-local format
    const formatDateForInput = (date: Date | null) => {
        if (!date) return "";
        const localDate = new Date(date);
        // Adjust for timezone offset to get local time
        localDate.setMinutes(localDate.getMinutes() - localDate.getTimezoneOffset());
        return localDate.toISOString().slice(0, 16);
    };
    
    const [startTime, setStartTime] = useState(formatDateForInput(props.entry.startTime));
    const [endTime, setEndTime] = useState(formatDateForInput(props.entry.endTime));
    const [isSubmitting, setIsSubmitting] = useState(false);

    const selectedProject = props.projects.find(p => p.id === projectId);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        
        setIsSubmitting(true);
        try {
            const updates: UpdateTimeEntryRequest = {};
            
            // Only include fields that have changed
            if (description !== (props.entry.description || "")) {
                updates.description = description.trim() || undefined;
            }
            
            if (projectId !== props.entry.projectId) {
                updates.projectId = projectId;
            }
            
            if (startTime && formatDateForInput(props.entry.startTime) !== startTime) {
                updates.startTime = new Date(startTime);
            }
            
            if (endTime && formatDateForInput(props.entry.endTime) !== endTime) {
                updates.endTime = new Date(endTime);
            }
            
            // If endTime was cleared (from having a value to empty)
            if (!endTime && props.entry.endTime) {
                updates.endTime = undefined;
            }
            
            await props.onUpdate(props.entry.id, updates);
            props.onClose();
        } catch (error) {
            console.error("Failed to update entry:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatDateTime = (date: Date | null) => {
        if (!date) return "Not set";
        return new Date(date).toLocaleString();
    };

    const formatDuration = () => {
        if (!props.entry.endTime) return "Currently tracking";
        const start = new Date(props.entry.startTime);
        const end = new Date(props.entry.endTime);
        const duration = end.getTime() - start.getTime();
        const hours = Math.floor(duration / (1000 * 60 * 60));
        const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };

    if (!props.isOpen) return null;

    return (
        <div class="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black opacity-25" onClick={props.onClose}></div>
            <div class="relative bg-white rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    Time Entry Details
                </h2>

                <form onSubmit={handleSubmit} class="space-y-4">
                    {/* Read-only fields */}
                    <div class="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-md">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-1">
                                Entry ID
                            </label>
                            <p class="text-sm text-gray-800 font-mono">{props.entry.id}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-1">
                                Duration
                            </label>
                            <p class="text-sm text-gray-800">{formatDuration()}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-1">
                                Created At
                            </label>
                            <p class="text-sm text-gray-800">{formatDateTime(props.entry.createdAt)}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 mb-1">
                                Updated At
                            </label>
                            <p class="text-sm text-gray-800">{formatDateTime(props.entry.updatedAt)}</p>
                        </div>
                    </div>

                    {/* Editable fields */}
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Project
                        </label>
                        <select
                            value={projectId}
                            onChange={(e) => setProjectId((e.target as HTMLSelectElement).value)}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            disabled={isSubmitting}
                        >
                            {props.projects.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name}
                                </option>
                            ))}
                        </select>
                        {selectedProject && (
                            <div class="flex items-center space-x-2 mt-1">
                                <div
                                    class="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: selectedProject.color }}
                                />
                                <span class="text-sm text-gray-600">{selectedProject.description}</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            value={description}
                            onInput={(e) => setDescription((e.target as HTMLTextAreaElement).value)}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter time entry description"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                Start Time
                            </label>
                            <input
                                type="datetime-local"
                                value={startTime}
                                onInput={(e) => setStartTime((e.target as HTMLInputElement).value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                                required
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-1">
                                End Time
                            </label>
                            <input
                                type="datetime-local"
                                value={endTime}
                                onInput={(e) => setEndTime((e.target as HTMLInputElement).value)}
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                disabled={isSubmitting}
                            />
                            <p class="text-xs text-gray-500 mt-1">
                                Leave empty if currently tracking
                            </p>
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={props.onClose}
                            disabled={isSubmitting}
                            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
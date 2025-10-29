import { Signal, useSignal } from "@preact/signals";
import { ProjectWithStats } from "../src/types.ts";

interface ProjectSelectProps {
    projects: Signal<ProjectWithStats[]>;
    selectedProjectId: Signal<string | null>;
    onProjectSelect: (projectId: string) => void;
}

export function ProjectSelect(props: ProjectSelectProps) {
    const isOpen = useSignal(false);
    
    const selectedProject = props.projects.value.find(
        p => p.id === props.selectedProjectId.value
    );
    
    const handleProjectSelect = (projectId: string) => {
        props.onProjectSelect(projectId);
        isOpen.value = false;
    };
    
    return (
        <div class="relative">
            {/* Dropdown Button */}
            <button
                type="button"
                onClick={() => isOpen.value = !isOpen.value}
                class="w-full px-3 py-2 text-left bg-transparent border-none text-xl font-bold placeholder-gray-400 focus:outline-none"
            >
                <div class="flex items-center space-x-2">
                    {selectedProject ? (
                        <>
                            <div
                                class="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: selectedProject.color }}
                            />
                            <span class="text-gray-900 truncate">{selectedProject.name}</span>
                        </>
                    ) : (
                        <span class="text-gray-400">Select a project</span>
                    )}
                </div>
            </button>

            {/* Dropdown Menu */}
            {isOpen.value && (
                <div class="absolute z-10 right-0 w-80 mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {props.projects.value.length === 0 ? (
                        <div class="px-4 py-3 text-sm text-gray-500 text-center">
                            No projects available
                        </div>
                    ) : (
                        props.projects.value.map((project) => (
                            <button
                                key={project.id}
                                type="button"
                                onClick={() => handleProjectSelect(project.id)}
                                class={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                                    props.selectedProjectId.value === project.id
                                        ? "bg-blue-50 text-blue-900"
                                        : "text-gray-900"
                                }`}
                            >
                                <div class="flex items-center justify-between">
                                    <div class="flex items-center space-x-3">
                                        <div
                                            class="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: project.color }}
                                        />
                                        <div>
                                            <div class="font-medium">{project.name}</div>
                                            {project.description && (
                                                <div class="text-sm text-gray-600">
                                                    {project.description}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div class="text-right">
                                        <div class="text-sm font-medium text-gray-700">
                                            {formatDuration(project.totalTime)}
                                        </div>
                                        {project.activeEntry && (
                                            <div class="text-xs text-green-600 font-medium">
                                                • Active
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            )}
            
            {/* Backdrop to close dropdown when clicking outside */}
            {isOpen.value && (
                <div
                    class="fixed inset-0 z-0"
                    onClick={() => isOpen.value = false}
                />
            )}
        </div>
    );
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
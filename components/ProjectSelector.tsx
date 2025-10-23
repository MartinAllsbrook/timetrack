import type { Signal } from "@preact/signals";
import type { ProjectWithStats } from "../src/types.ts";

interface ProjectSelectorProps {
    projects: Signal<ProjectWithStats[]>;
    selectedProjectId: Signal<string | null>;
    onProjectSelect: (projectId: string) => void;
    onCreateProject: () => void;
}

export default function ProjectSelector(props: ProjectSelectorProps) {
    return (
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">
                    Select Project
                </h3>
                <button
                    type="button"
                    onClick={() => {
                        // console.log("Calling", props.onCreateProject); 
                        props.onCreateProject();
                    }}
                    class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                >
                    + New Project
                </button>
            </div>

            <div class="grid grid-cols-1 gap-2 max-h-64 overflow-y-auto">
                {props.projects.value.map((project) => (
                    <div
                        key={project.id}
                        onClick={() => props.onProjectSelect(project.id)}
                        class={`project-card p-3 rounded-lg border-2 cursor-pointer transition-all ${
                            props.selectedProjectId.value === project.id
                                ? "border-blue-500 bg-blue-50"
                                : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                        <div class="flex items-center justify-between">
                            <div class="flex items-center space-x-3">
                                <div
                                    class="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: project.color }}
                                >
                                </div>
                                <div>
                                    <h4 class="font-medium text-gray-900">
                                        {project.name}
                                    </h4>
                                    {project.description && (
                                        <p class="text-sm text-gray-600">
                                            {project.description}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-medium text-gray-900">
                                    {formatDuration(project.totalTime)}
                                </div>
                                {project.activeEntry && (
                                    <div class="text-xs text-green-600 font-medium">
                                        • Active
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {props.projects.value.length === 0 && (
                    <div class="text-center py-8 text-gray-500">
                        <p>
                            No projects yet. Create your first project to start
                            tracking time!
                        </p>
                    </div>
                )}
            </div>
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

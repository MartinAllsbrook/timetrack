import type { Signal } from "@preact/signals";
import type { ProjectWithStats } from "../src/types.ts";

interface ProjectEditorProps {
    projects: Signal<ProjectWithStats[]>;
    onProjectEdit: (projectId: string) => void;
    onCreateProject: () => void;
}

export default function ProjectEditor(props: ProjectEditorProps) {
    return (
        <div class="space-y-3">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold text-gray-800">
                    Manage Projects
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
                        class="p-3 rounded-lg border-2 border-gray-200"
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
                            <div class="flex items-center space-x-2">
                                <div class="text-right mr-2">
                                    <div class="text-sm font-medium text-gray-900">
                                        {formatDuration(project.totalTime)}
                                    </div>
                                    {project.activeEntry && (
                                        <div class="text-xs text-green-600 font-medium">
                                            • Active
                                        </div>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => props.onProjectEdit(project.id)}
                                    class="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-800 transition-colors"
                                >
                                    Edit
                                </button>
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

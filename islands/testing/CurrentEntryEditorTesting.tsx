import { useSignal, signal } from "@preact/signals";
import { CurrentEntryEditor } from "components/active/CurrentEntryEditor.tsx";
import type { ProjectWithStats } from "src/types.ts";

export default function CurrentEntryEditorTesting() {
    // Mock projects data for testing CurrentEntryEditor
    const projects = signal<ProjectWithStats[]>([
        {
            id: "1",
            name: "Web Development",
            description: "Frontend and backend development tasks",
            color: "#3B82F6",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalTime: 7200000, // 2 hours in milliseconds
            activeEntry: undefined
        },
        {
            id: "2", 
            name: "Mobile App",
            description: "React Native mobile application",
            color: "#10B981",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalTime: 3600000, // 1 hour in milliseconds
            activeEntry: {
                id: "entry-1",
                projectId: "2",
                startTime: new Date(Date.now() - 1800000), // 30 minutes ago
                endTime: null,
                createdAt: new Date(),
                updatedAt: new Date()
            }
        },
        {
            id: "3",
            name: "Design System",
            description: "UI/UX design and component library",
            color: "#F59E0B",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalTime: 5400000, // 1.5 hours in milliseconds
            activeEntry: undefined
        },
        {
            id: "4",
            name: "Documentation",
            description: "Writing and updating project documentation",
            color: "#8B5CF6",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalTime: 1800000, // 30 minutes in milliseconds
            activeEntry: undefined
        }
    ]);
    
    const selectedProjectId = useSignal<string | null>(null);
    const currentDescription = useSignal<string>("");
    
    const editActiveEntry = (projectId?: string, description?: string) => {
        if (projectId !== undefined) {
            selectedProjectId.value = projectId;
            console.log("Selected project:", projectId);
        }
        if (description !== undefined) {
            currentDescription.value = description;
            console.log("Description changed:", description);
        }
    };

    return (
        <div class="p-6 max-w-2xl mx-auto space-y-6">
            <h1 class="text-2xl font-bold text-gray-800">Current Entry Editor Testing</h1>
            
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">Current Entry Editor</h2>
                <CurrentEntryEditor
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    editActiveEntry={editActiveEntry}
                />
            </div>
            
            {/* Debug Information */}
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 class="text-md font-semibold text-gray-700 mb-2">Debug Information</h3>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-medium text-gray-600">Selected Project ID:</span>{" "}
                        <span class="text-gray-900">
                            {selectedProjectId.value || "None"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Selected Project Name:</span>{" "}
                        <span class="text-gray-900">
                            {selectedProjectId.value 
                                ? projects.value.find(p => p.id === selectedProjectId.value)?.name || "Unknown"
                                : "None"
                            }
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Current Description:</span>{" "}
                        <span class="text-gray-900">
                            {currentDescription.value || "Empty"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Description Length:</span>{" "}
                        <span class="text-gray-900">
                            {currentDescription.value.length} characters
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Usage Instructions */}
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 class="text-md font-semibold text-blue-800 mb-2">Testing Instructions</h3>
                <ul class="text-sm text-blue-700 space-y-1">
                    <li>• Select different projects from the dropdown</li>
                    <li>• Type in the description field and observe the debounced updates</li>
                    <li>• Check the debug information below to see real-time state changes</li>
                    <li>• Notice the 750ms delay before description changes are logged</li>
                    <li>• Test with projects that have active entries (Mobile App)</li>
                    <li>• Description is saved to localStorage and restored on page reload</li>
                </ul>
            </div>
        </div>
    );
}
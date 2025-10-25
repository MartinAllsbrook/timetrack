import { useSignal } from "@preact/signals";
import EditProjectModal from "../../components/EditProjectModal.tsx";
import { Project } from "../../src/types.ts";

export default function EditProjectModalTesting() {
    const selectedProject = useSignal<Project | null>(null);
    const editedProjects = useSignal<Array<{
        id: string;
        name: string;
        description?: string;
        color: string;
        editedAt: Date;
        originalData: Project;
    }>>([]);
    const lastEditedProject = useSignal<{
        id: string;
        name: string;
        description?: string;
        color: string;
        originalData: Project;
    } | null>(null);
    const isEditingProject = useSignal(false);
    const editError = useSignal<string | null>(null);

    // Sample projects for testing
    const sampleProjects: Project[] = [
        {
            id: "1",
            name: "Website Redesign",
            description: "Complete redesign of company website",
            color: "#3b82f6",
            createdAt: new Date("2024-01-15"),
            updatedAt: new Date("2024-01-15")
        },
        {
            id: "2",
            name: "Mobile App",
            description: "Development of mobile application",
            color: "#22c55e",
            createdAt: new Date("2024-02-01"),
            updatedAt: new Date("2024-02-01")
        },
        {
            id: "3",
            name: "Database Migration",
            color: "#f59e0b",
            createdAt: new Date("2024-02-10"),
            updatedAt: new Date("2024-02-10")
        },
        {
            id: "4",
            name: "API Development",
            description: "REST API for customer portal",
            color: "#ef4444",
            createdAt: new Date("2024-02-15"),
            updatedAt: new Date("2024-02-15")
        }
    ];
    
    const handleOpenModal = (project: Project) => {
        selectedProject.value = project;
        editError.value = null;
    };
    
    const handleCloseModal = () => {
        selectedProject.value = null;
        editError.value = null;
    };
    
    const handleEditProject = async (
        id: string,
        name: string,
        description?: string,
        color?: string,
    ): Promise<void> => {
        isEditingProject.value = true;
        editError.value = null;
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate occasional error for testing error handling
            if (Math.random() < 0.2) {
                throw new Error("Simulated API error");
            }
            
            const originalProject = selectedProject.value;
            if (!originalProject) {
                throw new Error("No project selected");
            }
            
            const editedProject = {
                id,
                name,
                description,
                color: color || "#3b82f6",
                editedAt: new Date(),
                originalData: originalProject,
            };
            
            editedProjects.value = [...editedProjects.value, editedProject];
            lastEditedProject.value = editedProject;
            
            console.log("Project edited:", editedProject);
            
        } catch (error) {
            editError.value = error instanceof Error ? error.message : "Failed to edit project";
            console.error("Failed to edit project:", error);
            throw error; // Re-throw to let the modal handle the error
        } finally {
            isEditingProject.value = false;
        }
    };
    
    const handleClearHistory = () => {
        editedProjects.value = [];
        lastEditedProject.value = null;
        editError.value = null;
    };

    return (
        <div class="p-6 max-w-4xl mx-auto space-y-6">
            <h1 class="text-2xl font-bold text-gray-800">Edit Project Modal Testing</h1>
            
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">Sample Projects</h2>
                <p class="text-sm text-gray-600 mb-4">
                    Click on any project below to open the edit modal with that project's data:
                </p>
                <div class="grid gap-3">
                    {sampleProjects.map((project) => (
                        <div 
                            key={project.id}
                            class="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"
                        >
                            <div class="flex items-center gap-3">
                                <div 
                                    class="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: project.color }}
                                />
                                <div>
                                    <div class="font-medium text-gray-900">{project.name}</div>
                                    {project.description && (
                                        <div class="text-sm text-gray-600">{project.description}</div>
                                    )}
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleOpenModal(project)}
                                class="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Edit
                            </button>
                        </div>
                    ))}
                </div>
                <div class="mt-4 pt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Clear Edit History
                    </button>
                </div>
            </div>
            
            {/* Modal Component */}
            <EditProjectModal
                project={selectedProject.value}
                onClose={handleCloseModal}
                onEditProject={handleEditProject}
            />
            
            {/* Debug Information */}
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 class="text-md font-semibold text-gray-700 mb-2">Debug Information</h3>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-medium text-gray-600">Selected Project:</span>{" "}
                        <span class="text-gray-900">
                            {selectedProject.value ? selectedProject.value.name : "None"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Editing Project:</span>{" "}
                        <span class="text-gray-900">
                            {isEditingProject.value ? "Yes" : "No"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Last Error:</span>{" "}
                        <span class={`${editError.value ? "text-red-600" : "text-gray-900"}`}>
                            {editError.value || "None"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Total Edits Made:</span>{" "}
                        <span class="text-gray-900">
                            {editedProjects.value.length}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Last Edited Project */}
            {lastEditedProject.value && (
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 class="text-md font-semibold text-green-800 mb-2">Last Edited Project</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div class="space-y-2 text-sm">
                            <h4 class="font-medium text-green-700">Original Data:</h4>
                            <div>
                                <span class="font-medium text-green-600">Name:</span>{" "}
                                <span class="text-green-900">
                                    {lastEditedProject.value.originalData.name}
                                </span>
                            </div>
                            <div>
                                <span class="font-medium text-green-600">Description:</span>{" "}
                                <span class="text-green-900">
                                    {lastEditedProject.value.originalData.description || "None"}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-medium text-green-600">Color:</span>
                                <div 
                                    class="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: lastEditedProject.value.originalData.color }}
                                />
                                <span class="text-green-900">
                                    {lastEditedProject.value.originalData.color}
                                </span>
                            </div>
                        </div>
                        <div class="space-y-2 text-sm">
                            <h4 class="font-medium text-green-700">Updated Data:</h4>
                            <div>
                                <span class="font-medium text-green-600">Name:</span>{" "}
                                <span class="text-green-900">
                                    {lastEditedProject.value.name}
                                </span>
                            </div>
                            <div>
                                <span class="font-medium text-green-600">Description:</span>{" "}
                                <span class="text-green-900">
                                    {lastEditedProject.value.description || "None"}
                                </span>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="font-medium text-green-600">Color:</span>
                                <div 
                                    class="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: lastEditedProject.value.color }}
                                />
                                <span class="text-green-900">
                                    {lastEditedProject.value.color}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Edit History */}
            {editedProjects.value.length > 0 && (
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 class="text-md font-semibold text-gray-700 mb-3">Edit History</h3>
                    <div class="space-y-3">
                        {editedProjects.value.map((edit, index) => (
                            <div key={index} class="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div 
                                    class="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: edit.color }}
                                />
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">
                                        {edit.originalData.name} → {edit.name}
                                    </div>
                                    <div class="text-sm text-gray-600">
                                        ID: {edit.id}
                                        {edit.description && ` • ${edit.description}`}
                                    </div>
                                </div>
                                <div class="text-xs text-gray-500">
                                    {edit.editedAt.toLocaleTimeString()}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            
            {/* Usage Instructions */}
            <div class="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 class="text-md font-semibold text-blue-800 mb-2">Testing Instructions</h3>
                <ul class="text-sm text-blue-700 space-y-1">
                    <li>• Click "Edit" on any sample project to open the edit modal</li>
                    <li>• Verify that the form is prefilled with the project's current data</li>
                    <li>• Test form validation by trying to clear the name field</li>
                    <li>• Modify the name, description, and/or color and submit</li>
                    <li>• Test the color selection by clicking different color swatches</li>
                    <li>• Submit the form to test the edit flow (includes 1s delay simulation)</li>
                    <li>• The modal has a 20% chance of simulating an API error for error testing</li>
                    <li>• Test the Cancel button and close modal behavior</li>
                    <li>• Check the debug information and edit history below</li>
                    <li>• Compare original vs updated data in the "Last Edited Project" section</li>
                    <li>• Use "Clear Edit History" to reset the edits list</li>
                </ul>
            </div>
        </div>
    );
}
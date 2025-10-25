import { useSignal } from "@preact/signals";
import CreateProjectModal from "../../components/CreateProjectModal.tsx";

export default function CreateProjectModalTesting() {
    const isModalOpen = useSignal(false);
    const createdProjects = useSignal<Array<{
        name: string;
        description?: string;
        color: string;
        createdAt: Date;
    }>>([]);
    const lastCreatedProject = useSignal<{
        name: string;
        description?: string;
        color: string;
    } | null>(null);
    const isCreatingProject = useSignal(false);
    const createError = useSignal<string | null>(null);
    
    const handleOpenModal = () => {
        isModalOpen.value = true;
        createError.value = null;
    };
    
    const handleCloseModal = () => {
        isModalOpen.value = false;
        createError.value = null;
    };
    
    const handleCreateProject = async (
        name: string,
        description?: string,
        color?: string,
    ): Promise<void> => {
        isCreatingProject.value = true;
        createError.value = null;
        
        try {
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Simulate occasional error for testing error handling
            if (Math.random() < 0.2) {
                throw new Error("Simulated API error");
            }
            
            const newProject = {
                name,
                description,
                color: color || "#3b82f6",
                createdAt: new Date(),
            };
            
            createdProjects.value = [...createdProjects.value, newProject];
            lastCreatedProject.value = { name, description, color: color || "#3b82f6" };
            
            console.log("Project created:", newProject);
            
        } catch (error) {
            createError.value = error instanceof Error ? error.message : "Failed to create project";
            console.error("Failed to create project:", error);
            throw error; // Re-throw to let the modal handle the error
        } finally {
            isCreatingProject.value = false;
        }
    };
    
    const handleClearHistory = () => {
        createdProjects.value = [];
        lastCreatedProject.value = null;
        createError.value = null;
    };

    return (
        <div class="p-6 max-w-4xl mx-auto space-y-6">
            <h1 class="text-2xl font-bold text-gray-800">Create Project Modal Testing</h1>
            
            <div class="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 class="text-lg font-semibold text-gray-700 mb-4">Modal Controls</h2>
                <div class="flex gap-4">
                    <button
                        type="button"
                        onClick={handleOpenModal}
                        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Open Create Project Modal
                    </button>
                    <button
                        type="button"
                        onClick={handleClearHistory}
                        class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
                    >
                        Clear History
                    </button>
                </div>
            </div>
            
            {/* Modal Component */}
            <CreateProjectModal
                isOpen={isModalOpen.value}
                onClose={handleCloseModal}
                onCreateProject={handleCreateProject}
            />
            
            {/* Debug Information */}
            <div class="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 class="text-md font-semibold text-gray-700 mb-2">Debug Information</h3>
                <div class="space-y-2 text-sm">
                    <div>
                        <span class="font-medium text-gray-600">Modal Open:</span>{" "}
                        <span class="text-gray-900">
                            {isModalOpen.value ? "Yes" : "No"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Creating Project:</span>{" "}
                        <span class="text-gray-900">
                            {isCreatingProject.value ? "Yes" : "No"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Last Error:</span>{" "}
                        <span class={`${createError.value ? "text-red-600" : "text-gray-900"}`}>
                            {createError.value || "None"}
                        </span>
                    </div>
                    <div>
                        <span class="font-medium text-gray-600">Total Projects Created:</span>{" "}
                        <span class="text-gray-900">
                            {createdProjects.value.length}
                        </span>
                    </div>
                </div>
            </div>
            
            {/* Last Created Project */}
            {lastCreatedProject.value && (
                <div class="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h3 class="text-md font-semibold text-green-800 mb-2">Last Created Project</h3>
                    <div class="space-y-2 text-sm">
                        <div>
                            <span class="font-medium text-green-700">Name:</span>{" "}
                            <span class="text-green-900">
                                {lastCreatedProject.value.name}
                            </span>
                        </div>
                        <div>
                            <span class="font-medium text-green-700">Description:</span>{" "}
                            <span class="text-green-900">
                                {lastCreatedProject.value.description || "None"}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <span class="font-medium text-green-700">Color:</span>
                            <div 
                                class="w-4 h-4 rounded-full border border-gray-300"
                                style={{ backgroundColor: lastCreatedProject.value.color }}
                            />
                            <span class="text-green-900">
                                {lastCreatedProject.value.color}
                            </span>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Created Projects History */}
            {createdProjects.value.length > 0 && (
                <div class="bg-white p-4 rounded-lg border border-gray-200">
                    <h3 class="text-md font-semibold text-gray-700 mb-3">Created Projects History</h3>
                    <div class="space-y-3">
                        {createdProjects.value.map((project, index) => (
                            <div key={index} class="flex items-center gap-3 p-3 bg-gray-50 rounded-md">
                                <div 
                                    class="w-4 h-4 rounded-full border border-gray-300"
                                    style={{ backgroundColor: project.color }}
                                />
                                <div class="flex-1">
                                    <div class="font-medium text-gray-900">{project.name}</div>
                                    {project.description && (
                                        <div class="text-sm text-gray-600">{project.description}</div>
                                    )}
                                </div>
                                <div class="text-xs text-gray-500">
                                    {project.createdAt.toLocaleTimeString()}
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
                    <li>• Click "Open Create Project Modal" to test the modal display</li>
                    <li>• Test form validation by trying to submit with empty name</li>
                    <li>• Fill out the form with different combinations of name, description, and color</li>
                    <li>• Test the color selection by clicking different color swatches</li>
                    <li>• Submit the form to test the creation flow (includes 1s delay simulation)</li>
                    <li>• The modal has a 20% chance of simulating an API error for error testing</li>
                    <li>• Test the Cancel button and close modal behavior</li>
                    <li>• Check the debug information and project history below</li>
                    <li>• Use "Clear History" to reset the created projects list</li>
                </ul>
            </div>
        </div>
    );
}
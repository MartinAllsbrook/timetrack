import { signal } from "@preact/signals";
import ProjectEditor from "../../components/ProjectEditor.tsx";
import type { ProjectWithStats } from "../../src/types.ts";

export default function ProjectEditorTesting() {
    // Mock projects data for testing ProjectEditor
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
            name: "Research Project",
            description: "Market research and competitive analysis",
            color: "#8B5CF6",
            createdAt: new Date(),
            updatedAt: new Date(),
            totalTime: 1800000, // 30 minutes in milliseconds
            activeEntry: undefined
        }
    ]);
    
    const handleProjectEdit = (projectId: string) => {
        const project = projects.value.find(p => p.id === projectId);
        console.log("Edit project:", project?.name, "with ID:", projectId);
        // In a real app, this would open an edit modal or navigate to edit page
        alert(`Editing project: ${project?.name}`);
    };

    const handleCreateProject = () => {
        console.log("Create new project clicked");
        // In a real app, this would open a create modal or navigate to create page
        alert("Create new project functionality would open here");
    };

    return (
        <div class="p-6 max-w-2xl mx-auto space-y-6">
            <h1 class="text-2xl font-bold text-gray-800">Project Editor Testing</h1>
            
            <div>
                <h2 class="text-lg font-semibold text-gray-700 mb-4">Project Editor Component</h2>
                <div class="bg-white rounded-lg shadow-md p-4">
                    <ProjectEditor
                        projects={projects}
                        onProjectEdit={handleProjectEdit}
                        onCreateProject={handleCreateProject}
                    />
                </div>
                
                <div class="mt-4 p-4 bg-gray-50 rounded-lg">
                    <h3 class="text-md font-medium text-gray-700 mb-2">Test Instructions:</h3>
                    <ul class="text-sm text-gray-600 space-y-1">
                        <li>• Click "Edit" on any project to test the edit callback</li>
                        <li>• Click "+ New Project" to test the create callback</li>
                        <li>• Notice the active project indicator on "Mobile App"</li>
                        <li>• Verify time formatting displays correctly</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}
import { useSignal, signal } from "@preact/signals";
import { ProjectSelect } from "../components/ProjectSelect.tsx";
import type { ProjectWithStats } from "../src/types.ts";

export default function Testing() {
    // Mock projects data for testing ProjectSelect
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
        }
    ]);
    
    const selectedProjectId = useSignal<string | null>(null);
    
    const handleProjectSelect = (projectId: string) => {
        selectedProjectId.value = projectId;
        console.log("Selected project:", projectId);
    }

    return (
        <div class="p-6 max-w-md mx-auto space-y-6">
            <h1 class="text-2xl font-bold text-gray-800">Testing Components</h1>
            
            <div>
                <h2 class="text-lg font-semibold text-gray-700 mb-2">Project Select Dropdown</h2>
                <ProjectSelect
                    projects={projects}
                    selectedProjectId={selectedProjectId}
                    onProjectSelect={handleProjectSelect}
                />
                {selectedProjectId.value && (
                    <p class="mt-2 text-sm text-gray-600">
                        Selected: {projects.value.find(p => p.id === selectedProjectId.value)?.name}
                    </p>
                )}
            </div>
        </div>
    );
}
import { useEffect } from "preact/hooks";
import { useSignal, useSignalEffect } from "@preact/signals";
import type {
    ActiveSession,
    ProjectWithStats,
    TimeEntryWithProject,
} from "../src/types.ts";
import ProjectSelector from "../components/ProjectSelector.tsx";
import Timer from "../components/Timer.tsx";
import TimeEntriesList from "../components/TimeEntriesList.tsx";
import CreateProjectModal from "../components/CreateProjectModal.tsx";
import { ProjectSelect } from "../components/ProjectSelect.tsx";

export default function TimeTracker() {
    // Signals for state management
    const projects = useSignal<ProjectWithStats[]>([]);
    const selectedProjectId = useSignal<string | null>(null);
    const selectedProject = useSignal<ProjectWithStats | null>(null);
    const timeEntries = useSignal<TimeEntryWithProject[]>([]);
    const activeSession = useSignal<ActiveSession | null>(null);
    const isLoading = useSignal(false);
    const isCreateModalOpen = useSignal(false);

    // Load initial data
    useEffect(() => {
        loadData();
    }, []);

    // Update selected project when selection changes
    useSignalEffect(() => {
        const project = projects.value.find((p) =>
            p.id === selectedProjectId.value
        ) || null;
        selectedProject.value = project;
    });

    async function loadData() {
        try {
            isLoading.value = true;

            // Load projects, time entries, and active session in parallel
            const [projectsRes, entriesRes, sessionRes] = await Promise.all([
                fetch("/api/projects"),
                fetch("/api/time-entries"),
                fetch("/api/tracking/stop"), // This GET endpoint returns active session
            ]);

            if (projectsRes.ok) {
                const projectsData = await projectsRes.json();
                projects.value = projectsData;

                // If there's an active project, select it
                const activeProject = projectsData.find((p: ProjectWithStats) =>
                    p.activeEntry
                );
                if (activeProject) {
                    selectedProjectId.value = activeProject.id;
                }
            }

            if (entriesRes.ok) {
                const entriesData = await entriesRes.json();
                timeEntries.value = entriesData;
            }

            if (sessionRes.ok) {
                const sessionData = await sessionRes.json();
                activeSession.value = sessionData.activeSession;
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            isLoading.value = false;
        }
    }

    async function createProject(
        name: string,
        description?: string,
        color?: string,
    ) {
        try {
            const response = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, description, color }),
            });

            if (response.ok) {
                const newProject = await response.json();
                projects.value = [...projects.value, {
                    ...newProject,
                    totalTime: 0,
                }];
                selectedProjectId.value = newProject.id;
            } else {
                throw new Error("Failed to create project");
            }
        } catch (error) {
            console.error("Error creating project:", error);
            throw error;
        }
    }

    async function startTracking() {
        if (!selectedProjectId.value) return;

        try {
            isLoading.value = true;

            const response = await fetch("/api/time-entries", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    projectId: selectedProjectId.value,
                }),
            });

            if (response.ok) {
                const newEntry = await response.json();
                activeSession.value = {
                    entryId: newEntry.id,
                    projectId: newEntry.projectId,
                    startTime: new Date(newEntry.startTime),
                };

                // Reload data to get updated projects and entries
                await loadData();
            } else {
                throw new Error("Failed to start tracking");
            }
        } catch (error) {
            console.error("Error starting tracking:", error);
        } finally {
            isLoading.value = false;
        }
    }

    async function stopTracking() {
        try {
            isLoading.value = true;

            const response = await fetch("/api/tracking/stop", {
                method: "POST",
            });

            if (response.ok) {
                activeSession.value = null;
                // Reload data to get updated projects and entries
                await loadData();
            } else {
                throw new Error("Failed to stop tracking");
            }
        } catch (error) {
            console.error("Error stopping tracking:", error);
        } finally {
            isLoading.value = false;
        }
    }

    async function deleteTimeEntry(entryId: string) {
        try {
            const response = await fetch(`/api/time-entries/${entryId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                timeEntries.value = timeEntries.value.filter((entry) =>
                    entry.id !== entryId
                );
                // Reload projects to update stats
                const projectsRes = await fetch("/api/projects");
                if (projectsRes.ok) {
                    projects.value = await projectsRes.json();
                }
            } else {
                throw new Error("Failed to delete time entry");
            }
        } catch (error) {
            console.error("Error deleting time entry:", error);
        }
    }

    function handleProjectSelect(projectId: string) {
        selectedProjectId.value = projectId;
    }

    function openCreateModal() {
        console.log("Vlaue before:", isCreateModalOpen.value);
        isCreateModalOpen.value = true;
        console.log("Value after:", isCreateModalOpen.value);
    }

    function closeCreateModal() {
        isCreateModalOpen.value = false;
    }

    return (

        <div class="max-w-6xl mx-auto space-y-6">
            {/* Header */}
            <div class="text-center">
                <h1 class="text-3xl font-bold text-gray-900 mb-2">
                    Time Tracker
                </h1>
                <p class="text-gray-600">
                    Track your time across different projects
                </p>
            </div>

            {/* Main Content Grid */}
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div class="space-y-6">
                    {/* Project Selector */}
                    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <ProjectSelector
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectSelect={handleProjectSelect}
                            onCreateProject={openCreateModal}
                        />
                    </div>

                    {/* Timer */}
                    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <Timer
                            activeSession={activeSession}
                            selectedProject={selectedProject}
                            onStart={startTracking}
                            onStop={stopTracking}
                            isLoading={isLoading}
                        />
                        <ProjectSelect
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectSelect={handleProjectSelect}
                        />
                    </div>
                </div>

                {/* Right Column */}
                <div>
                    <TimeEntriesList
                        timeEntries={timeEntries}
                        onDeleteEntry={deleteTimeEntry}
                    />
                </div>
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen.value}
                onClose={closeCreateModal}
                onCreateProject={createProject}
            />
        </div>
    );
}

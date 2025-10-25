import { useEffect } from "preact/hooks";
import { useSignal, useSignalEffect } from "@preact/signals";
import type {
    ActiveSession,
    Project,
    ProjectWithStats,
    TimeEntryWithProject,
} from "../src/types.ts";
import Timer from "../components/Timer.tsx";
import TimeEntriesList from "../components/TimeEntriesList.tsx";
import CreateProjectModal from "../components/CreateProjectModal.tsx";
import { CurrentEntryEditor } from "../components/CurrentEntryEditor.tsx";
import ProjectEditor from "../components/ProjectEditor.tsx";
import EditProjectModal from "../components/EditProjectModal.tsx";
import Timeline from "../components/timeline/Timeline.tsx";

export default function TimeTracker() {
    // Signals for state management
    const projects = useSignal<ProjectWithStats[]>([]);
    const selectedProjectId = useSignal<string | null>(null);
    const selectedProject = useSignal<ProjectWithStats | null>(null);
    const timeEntries = useSignal<TimeEntryWithProject[]>([]);
    const activeSession = useSignal<ActiveSession | null>(null);
    const isLoading = useSignal(false);
    const isCreateModalOpen = useSignal(false);
    const projectToEditId = useSignal<Project | null>(null);

    /** A desciption of the current task / entry being tracked */
    let currentEntryDesciption: string | undefined = undefined; 


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
                for (const entry of entriesData) {
                    entry.startTime = new Date(entry.startTime);
                    if (entry.endTime) {
                        entry.endTime = new Date(entry.endTime);
                    }
                }

                timeEntries.value = entriesData;
            }

            if (sessionRes.ok) {
                const sessionData = await sessionRes.json();
                const session = sessionData.activeSession;
                if (session) session.startTime = new Date(session.startTime)
                
                activeSession.value = session;
            }
        } catch (error) {
            console.error("Failed to load data:", error);
        } finally {
            isLoading.value = false;
        }
    }

    async function editProject(
        projectId: string,
        name?: string,
        description?: string,
        color?: string,
    ) {
        try {
            const response = await fetch("/api/projects", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: projectId, name, description, color }),
            });
            if (response.ok) {
                const updatedProject = await response.json();
                projects.value = projects.value.map((project) =>
                    project.id === projectId
                        ? { ...project, ...updatedProject }
                        : project
                );
            } else {
                throw new Error("Failed to update project");
            }
        } catch (error) {
            console.error("Error updating project:", error);
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
                    description: currentEntryDesciption,
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
        isCreateModalOpen.value = true;
    }

    function closeCreateModal() {
        isCreateModalOpen.value = false;
    }

    function openEditModal(projectId: string) {
        projectToEditId.value = projects.value.find((p) => p.id === projectId) || null;
    }

    function closeEditModal() {
        projectToEditId.value = null;
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
                    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <CurrentEntryEditor
                            projects={projects}
                            selectedProjectId={selectedProjectId}
                            onProjectSelect={handleProjectSelect}
                            onDescriptionChange={(desc) => {
                                currentEntryDesciption = desc;
                            }}
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
                    </div>
                </div>

                {/* Right Column */}
                <div class="space-y-6">
                    <TimeEntriesList
                        timeEntries={timeEntries}
                        onDeleteEntry={deleteTimeEntry}
                    />

                    {/* Project Selector */}
                    <div class="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
                        <ProjectEditor
                            projects={projects}
                            onCreateProject={openCreateModal}
                            onProjectEdit={openEditModal}
                        />
                    </div>
                </div>
            </div>

            <div>
                <Timeline
                    date={new Date()}
                    timeEntries={timeEntries.value}
                />
            </div>

            {/* Create Project Modal */}
            <CreateProjectModal
                isOpen={isCreateModalOpen.value}
                onClose={closeCreateModal}
                onCreateProject={createProject}
            />

            {/* Edit Project Modal */}
            <EditProjectModal
                onClose={closeEditModal}
                project={projectToEditId.value}
                onEditProject={editProject}
            />
        </div>
    );
}

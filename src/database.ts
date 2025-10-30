/// <reference lib="deno.unstable" />

import type {
    ActiveSession,
    CreateProjectRequest,
    CreateTimeEntryRequest,
    Project,
    ProjectWithStats,
    TimeEntry,
    TimeEntryWithProject,
    UpdateProjectRequest,
    UpdateTimeEntryRequest,
} from "./types.ts";
import { dateUtils } from "./types.ts";

class DatabaseService {
    private kv: Deno.Kv;

    constructor(kv: Deno.Kv) {
        this.kv = kv;
    }

    //#region Project operations

    async createProject(data: CreateProjectRequest): Promise<Project> {
        const id = crypto.randomUUID();
        const now = dateUtils.now();

        const project: Project = {
            id,
            name: data.name,
            description: data.description,
            color: data.color || this.generateRandomColor(),
            createdAt: now,
            updatedAt: now,
        };

        const result = await this.kv.set(["projects", id], project);
        if (!result.ok) {
            throw new Error("Failed to create project");
        }

        return project;
    }

    async getProject(id: string): Promise<Project | null> {
        const result = await this.kv.get<Project>(["projects", id]);
        if (!result.value) {
            return null;
        }
        
        return result.value;
    }

    async getAllProjects(): Promise<Project[]> {
        const projects: Project[] = [];
        const iter = this.kv.list<Project>({ prefix: ["projects"] });

        for await (const entry of iter) {
            projects.push(entry.value);
        }

        return projects.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getProjectsWithStats(): Promise<ProjectWithStats[]> {
        const projects = await this.getAllProjects();
        const projectsWithStats: ProjectWithStats[] = [];

        for (const project of projects) {
            const entries = await this.getTimeEntriesByProject(project.id);
            const totalTime = entries.reduce((sum, entry) => {
                if (entry.endTime) {
                    return sum + dateUtils.getDurationMs(entry.startTime, entry.endTime);
                }
                return sum;
            }, 0);

            const activeEntry = entries.find((entry) => !entry.endTime);

            projectsWithStats.push({
                ...project,
                totalTime,
                activeEntry,
            });
        }

        return projectsWithStats;
    }

    async updateProject(
        id: string,
        data: UpdateProjectRequest,
    ): Promise<Project | null> {
        const existing = await this.getProject(id);
        if (!existing) {
            return null;
        }

        const updated: Project = {
            ...existing,
            ...data,
            updatedAt: dateUtils.now(),
        };

        const result = await this.kv.set(["projects", id], updated);
        if (!result.ok) {
            throw new Error("Failed to update project");
        }

        return updated;
    }

    async deleteProject(id: string): Promise<boolean> {
        // First check if there are any time entries for this project
        const entries = await this.getTimeEntriesByProject(id);
        if (entries.length > 0) {
            throw new Error("Cannot delete project with existing time entries");
        }

        await this.kv.delete(["projects", id]);
        return true;
    }

    //#endregion

    //#region Time entry operations
    async createTimeEntry(data: CreateTimeEntryRequest): Promise<TimeEntry> {
        const id = crypto.randomUUID();
        const now = dateUtils.now();

        const timeEntry: TimeEntry = {
            id,
            projectId: data.projectId,
            startTime: now,
            endTime: null, // New entries are always active
            description: data.description,
            createdAt: now,
            updatedAt: now,
        };

        const result = await this.kv.set(["timeEntries", id], timeEntry);
        if (!result.ok) {
            throw new Error("Failed to create time entry");
        }

        // Set as active session
        await this.setActiveSession({
            entryId: id,
            projectId: data.projectId,
            startTime: now,
        });

        return timeEntry;
    }

    async getTimeEntry(id: string): Promise<TimeEntry | null> {
        const result = await this.kv.get<TimeEntry>(["timeEntries", id]);
        if (!result.value) {
            return null;
        }
        
        return result.value;
    }

    async getAllTimeEntries(): Promise<TimeEntry[]> {
        const entries: TimeEntry[] = [];
        const iter = this.kv.list<TimeEntry>({ prefix: ["timeEntries"] });

        for await (const entry of iter) {
            entries.push(entry.value);
        }

        return entries.sort((a, b) => {
            const aTime = dateUtils.toDate(b.startTime).getTime();
            const bTime = dateUtils.toDate(a.startTime).getTime();
            return aTime - bTime;
        });
    }

    async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
        const allEntries = await this.getAllTimeEntries();
        return allEntries.filter((entry) => entry.projectId === projectId);
    }

    async getTimeEntriesWithProjects(): Promise<TimeEntryWithProject[]> {
        const entries = await this.getAllTimeEntries();
        const projects = await this.getAllProjects();
        const projectMap = new Map(projects.map((p) => [p.id, p]));

        return entries
            .map((entry) => {
                const project = projectMap.get(entry.projectId);
                if (!project) return null;
                return { ...entry, project };
            })
            .filter((entry): entry is TimeEntryWithProject => entry !== null);
    }

    async updateTimeEntry(
        id: string,
        data: UpdateTimeEntryRequest,
    ): Promise<TimeEntry | null> {
        const existing = await this.getTimeEntry(id);
        if (!existing) {
            return null;
        }

        const updated: TimeEntry = {
            ...existing,
            ...data,
            updatedAt: dateUtils.now(),
        };

        const result = await this.kv.set(["timeEntries", id], updated);
        if (!result.ok) {
            throw new Error("Failed to update time entry");
        }

        // If ending the entry, clear active session
        if (data.endTime && !existing.endTime) {
            await this.clearActiveSession();
        }

        return updated;
    }

    async deleteTimeEntry(id: string): Promise<boolean> {
        const entry = await this.getTimeEntry(id);
        if (entry && !entry.endTime) {
            // If deleting an active entry, clear the active session
            await this.clearActiveSession();
        }

        await this.kv.delete(["timeEntries", id]);
        return true;
    }

    //#endregion

    // Active session operations
    async getActiveSession(): Promise<ActiveSession | null> {
        const result = await this.kv.get<ActiveSession>(["activeSession"]);
        return result.value;
    }

    async setActiveSession(session: ActiveSession): Promise<void> {
        // First clear any existing active session
        await this.clearActiveSession();

        const result = await this.kv.set(["activeSession"], session);
        if (!result.ok) {
            throw new Error("Failed to set active session");
        }
    }

    async clearActiveSession(): Promise<void> {
        const activeSession = await this.getActiveSession();
        if (activeSession) {
            // End the current time entry
            await this.updateTimeEntry(activeSession.entryId, {
                endTime: dateUtils.now(),
            });
        }

        await this.kv.delete(["activeSession"]);
    }

    // Utility methods
    private generateRandomColor(): string {
        const colors = [
            "#ef4444",
            "#f97316",
            "#f59e0b",
            "#eab308",
            "#84cc16",
            "#22c55e",
            "#10b981",
            "#14b8a6",
            "#06b6d4",
            "#0ea5e9",
            "#3b82f6",
            "#6366f1",
            "#8b5cf6",
            "#a855f7",
            "#d946ef",
            "#ec4899",
            "#f43f5e",
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }

    // Statistics
    async getTotalTimeToday(): Promise<number> {
        const today = dateUtils.startOfDay();
        const tomorrow = dateUtils.startOfDay(
            new Date(dateUtils.toDate(today).getTime() + 24 * 60 * 60 * 1000).toISOString()
        );

        const entries = await this.getAllTimeEntries();
        const todayEntries = entries.filter((entry) =>
            entry.startTime >= today && entry.startTime < tomorrow
        );

        return todayEntries.reduce((sum, entry) => {
            return sum + dateUtils.getDurationMs(entry.startTime, entry.endTime);
        }, 0);
    }

    async getTotalTimeThisWeek(): Promise<number> {
        const startOfWeek = dateUtils.startOfWeek();

        const entries = await this.getAllTimeEntries();
        const weekEntries = entries.filter((entry) =>
            entry.startTime >= startOfWeek
        );

        return weekEntries.reduce((sum, entry) => {
            return sum + dateUtils.getDurationMs(entry.startTime, entry.endTime);
        }, 0);
    }
}

// Global database instance
let dbInstance: DatabaseService | null = null;

export async function getDatabase(): Promise<DatabaseService> {
    if (!dbInstance) {
        const kv = await Deno.openKv();
        dbInstance = new DatabaseService(kv);
    }
    return dbInstance;
}

export { DatabaseService };

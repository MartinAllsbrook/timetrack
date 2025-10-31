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
    User,
} from "./types.ts";
import { dateUtils } from "./types.ts";

class DatabaseService {
    private kv: Deno.Kv;

    constructor(kv: Deno.Kv) {
        this.kv = kv;
    }

    //#region Project operations

    async createProject(userId: string, data: CreateProjectRequest): Promise<Project> {
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

        const result = await this.kv.set(["user_data", userId, "projects", id], project);
        if (!result.ok) {
            throw new Error("Failed to create project");
        }

        return project;
    }

    async getProject(userId: string, id: string): Promise<Project | null> {
        const result = await this.kv.get<Project>(["user_data", userId, "projects", id]);
        if (!result.value) {
            return null;
        }
        
        return result.value;
    }

    async getAllProjects(userId: string): Promise<Project[]> {
        const projects: Project[] = [];
        const iter = this.kv.list<Project>({ prefix: ["user_data", userId, "projects"] });

        for await (const entry of iter) {
            projects.push(entry.value);
        }

        return projects.sort((a, b) => a.name.localeCompare(b.name));
    }

    async getProjectsWithStats(userId: string): Promise<ProjectWithStats[]> {
        const projects = await this.getAllProjects(userId);
        const projectsWithStats: ProjectWithStats[] = [];

        for (const project of projects) {
            const entries = await this.getTimeEntriesByProject(userId, project.id);
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
        userId: string,
        id: string,
        data: UpdateProjectRequest,
    ): Promise<Project | null> {
        const existing = await this.getProject(userId, id);
        if (!existing) {
            return null;
        }

        const updated: Project = {
            ...existing,
            ...data,
            updatedAt: dateUtils.now(),
        };

        const result = await this.kv.set(["user_data", userId, "projects", id], updated);
        if (!result.ok) {
            throw new Error("Failed to update project");
        }

        return updated;
    }

    async deleteProject(userId: string, id: string): Promise<boolean> {
        // First check if there are any time entries for this project
        const entries = await this.getTimeEntriesByProject(userId, id);
        if (entries.length > 0) {
            throw new Error("Cannot delete project with existing time entries");
        }

        await this.kv.delete(["user_data", userId, "projects", id]);
        return true;
    }

    //#endregion

    //#region Time entry operations
    async createTimeEntry(userId: string, data: CreateTimeEntryRequest): Promise<TimeEntry> {
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

        const result = await this.kv.set(["user_data", userId, "timeEntries", id], timeEntry);
        if (!result.ok) {
            throw new Error("Failed to create time entry");
        }

        // Set as active session
        await this.setActiveSession(userId, {
            entryId: id,
            projectId: data.projectId,
            startTime: now,
        });

        return timeEntry;
    }

    async getTimeEntry(userId: string, id: string): Promise<TimeEntry | null> {
        const result = await this.kv.get<TimeEntry>(["user_data", userId, "timeEntries", id]);
        if (!result.value) {
            return null;
        }
        
        return result.value;
    }

    async getAllTimeEntries(userId: string): Promise<TimeEntry[]> {
        const entries: TimeEntry[] = [];
        const iter = this.kv.list<TimeEntry>({ prefix: ["user_data", userId, "timeEntries"] });

        for await (const entry of iter) {
            entries.push(entry.value);
        }

        return entries.sort((a, b) => {
            const aTime = dateUtils.toDate(b.startTime).getTime();
            const bTime = dateUtils.toDate(a.startTime).getTime();
            return aTime - bTime;
        });
    }

    async getTimeEntriesByProject(userId: string, projectId: string): Promise<TimeEntry[]> {
        const allEntries = await this.getAllTimeEntries(userId);
        return allEntries.filter((entry) => entry.projectId === projectId);
    }

    async getTimeEntriesWithProjects(userId: string): Promise<TimeEntryWithProject[]> {
        const entries = await this.getAllTimeEntries(userId);
        const projects = await this.getAllProjects(userId);
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
        userId: string,
        id: string,
        data: UpdateTimeEntryRequest,
    ): Promise<TimeEntry | null> {
        const existing = await this.getTimeEntry(userId, id);
        if (!existing) {
            return null;
        }

        const updated: TimeEntry = {
            ...existing,
            ...data,
            updatedAt: dateUtils.now(),
        };

        const result = await this.kv.set(["user_data", userId, "timeEntries", id], updated);
        if (!result.ok) {
            throw new Error("Failed to update time entry");
        }

        // If ending the entry, clear active session
        if (data.endTime && !existing.endTime) {
            await this.clearActiveSession(userId);
        }

        return updated;
    }

    async deleteTimeEntry(userId: string, id: string): Promise<boolean> {
        const entry = await this.getTimeEntry(userId, id);
        if (entry && !entry.endTime) {
            // If deleting an active entry, clear the active session
            await this.clearActiveSession(userId);
        }

        await this.kv.delete(["user_data", userId, "timeEntries", id]);
        return true;
    }

    //#endregion

    //#region Active session operations
    async getActiveSession(userId: string): Promise<ActiveSession | null> {
        const result = await this.kv.get<ActiveSession>(["user_data", userId, "activeSession"]);
        return result.value;
    }

    async setActiveSession(userId: string, session: ActiveSession): Promise<void> {
        // First clear any existing active session
        await this.clearActiveSession(userId);

        const result = await this.kv.set(["user_data", userId, "activeSession"], session);
        if (!result.ok) {
            throw new Error("Failed to set active session");
        }
    }

    async clearActiveSession(userId: string): Promise<void> {
        const activeSession = await this.getActiveSession(userId);
        if (activeSession) {
            // End the current time entry
            await this.updateTimeEntry(userId, activeSession.entryId, {
                endTime: dateUtils.now(),
            });
        }

        await this.kv.delete(["user_data", userId, "activeSession"]);
    }
    //#endregion

    //#region Authentication
    /**
     * Adds a user to the database.
     * @param user - The user object to add.
     */
    public async addUser(user: User): Promise<void> {
        const response = await this.kv.get<User>(["users", user.id]);
        if (response.value) {
            console.warn("User already exists:", user.id);
            return;
        }
        await this.kv.set(["users", user.id], user);
    }

    /**
     * Updates an existing user in the database.
     * @param user - The user object to update.
     */
    public async updateUser(user: User): Promise<void> {
        const key = ["users", user.id];
        await this.kv.set(key, user);
    }

    /**
     * Retrieves a user from the database.
     * @param userID - The ID of the user to retrieve.
     * @returns The User object if found, otherwise null.
     */
    public async getUser(userID: string): Promise<User | null> {
        const result = await this.kv.get<User>(["users", userID]);
        return result.value;
    }
    //#endregion

    //#region Utility methods
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
    //#endregion

    //#region Statistics
    async getTotalTimeToday(userId: string): Promise<number> {
        const today = dateUtils.startOfDay();
        const tomorrow = dateUtils.startOfDay(
            new Date(dateUtils.toDate(today).getTime() + 24 * 60 * 60 * 1000).toISOString()
        );

        const entries = await this.getAllTimeEntries(userId);
        const todayEntries = entries.filter((entry) =>
            entry.startTime >= today && entry.startTime < tomorrow
        );

        return todayEntries.reduce((sum, entry) => {
            return sum + dateUtils.getDurationMs(entry.startTime, entry.endTime);
        }, 0);
    }
    async getTotalTimeThisWeek(userId: string): Promise<number> {
        const startOfWeek = dateUtils.startOfWeek();

        const entries = await this.getAllTimeEntries(userId);
        const weekEntries = entries.filter((entry) =>
            entry.startTime >= startOfWeek
        );

        return weekEntries.reduce((sum, entry) => {
            return sum + dateUtils.getDurationMs(entry.startTime, entry.endTime);
        }, 0);
    }
    //#endregion

    //#region Migration utilities
    /**
     * Migrates existing data from the old flat structure to the new user-scoped structure.
     * This should be run once after updating to the new database schema.
     * @param defaultUserId - The user ID to assign to existing data
     */
    async migrateToUserScopedData(defaultUserId: string): Promise<void> {
        console.log("Starting migration to user-scoped data structure...");

        // Migrate projects
        const oldProjects = this.kv.list<Project>({ prefix: ["projects"] });
        for await (const entry of oldProjects) {
            const project = entry.value;
            await this.kv.set(["user_data", defaultUserId, "projects", project.id], project);
            await this.kv.delete(entry.key);
            console.log(`Migrated project: ${project.name}`);
        }

        // Migrate time entries
        const oldTimeEntries = this.kv.list<TimeEntry>({ prefix: ["timeEntries"] });
        for await (const entry of oldTimeEntries) {
            const timeEntry = entry.value;
            await this.kv.set(["user_data", defaultUserId, "timeEntries", timeEntry.id], timeEntry);
            await this.kv.delete(entry.key);
            console.log(`Migrated time entry: ${timeEntry.id}`);
        }

        // Migrate active session
        const oldActiveSession = await this.kv.get<ActiveSession>(["activeSession"]);
        if (oldActiveSession.value) {
            await this.kv.set(["user_data", defaultUserId, "activeSession"], oldActiveSession.value);
            await this.kv.delete(["activeSession"]);
            console.log("Migrated active session");
        }

        console.log("Migration completed successfully!");
    }

    /**
     * Gets all user IDs in the database
     */
    async getAllUserIds(): Promise<string[]> {
        const userIds: string[] = [];
        const iter = this.kv.list<User>({ prefix: ["users"] });

        for await (const entry of iter) {
            userIds.push(entry.value.id);
        }

        return userIds;
    }
    //#endregion
}

//#region Global database instance
let dbInstance: DatabaseService | null = null;

export async function getDatabase(): Promise<DatabaseService> {
    if (!dbInstance) {
        const kv = await Deno.openKv();
        dbInstance = new DatabaseService(kv);
    }
    return dbInstance;
}

export { DatabaseService };
//#endregion

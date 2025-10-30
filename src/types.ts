// Database and application types for the time tracking app

export interface Project {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface TimeEntry {
    id: string;
    projectId: string;
    startTime: string; // ISO date string
    endTime: string | null; // null means currently tracking
    description?: string;
    createdAt: string; // ISO date string
    updatedAt: string; // ISO date string
}

export interface ActiveSession {
    entryId: string;
    projectId: string;
    startTime: string; // ISO date string
}

// API Response types
export interface TimeEntryWithProject extends TimeEntry {
    project: Project;
}

export interface ProjectWithStats extends Project {
    totalTime: number; // in milliseconds
    activeEntry?: TimeEntry;
}

// API Request types
export interface CreateProjectRequest {
    name: string;
    description?: string;
    color?: string;
}

export interface UpdateProjectRequest {
    name?: string;
    description?: string;
    color?: string;
}

export interface CreateTimeEntryRequest {
    projectId: string;
    description?: string;
}

export interface UpdateTimeEntryRequest {
    endTime?: string; // ISO date string
    description?: string;
    projectId?: string;
    startTime?: string; // ISO date string
}

// Application state
export interface TimeTrackingState {
    projects: Project[];
    timeEntries: TimeEntry[];
    activeSession: ActiveSession | null;
    selectedProjectId: string | null;
    isLoading: boolean;
}

// Date utility functions
export const dateUtils = {
    // Get current time as ISO string
    now: (): string => new Date().toISOString(),
    
    // Convert ISO string to Date object for calculations
    toDate: (isoString: string): Date => new Date(isoString),
    
    // Get duration between two ISO strings (in milliseconds)
    getDurationMs: (startTime: string, endTime: string | null = null): number => {
        const start = new Date(startTime);
        const end = endTime ? new Date(endTime) : new Date();
        return end.getTime() - start.getTime();
    },
    
    // Format duration as human readable string
    getDurationString: (startTime: string, endTime: string | null = null): string => {
        const ms = dateUtils.getDurationMs(startTime, endTime);
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((ms % (1000 * 60)) / 1000);
        
        if (hours > 0) {
            return `${hours}h ${minutes}m ${seconds}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        } else {
            return `${seconds}s`;
        }
    },
    
    // Check if date is today
    isToday: (isoString: string): boolean => {
        const date = new Date(isoString);
        const today = new Date();
        return date.toDateString() === today.toDateString();
    },
    
    // Get start of day as ISO string
    startOfDay: (isoString?: string): string => {
        const date = isoString ? new Date(isoString) : new Date();
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
    },
    
    // Get start of week as ISO string
    startOfWeek: (isoString?: string): string => {
        const date = isoString ? new Date(isoString) : new Date();
        const day = date.getDay();
        const diff = date.getDate() - day;
        date.setDate(diff);
        date.setHours(0, 0, 0, 0);
        return date.toISOString();
    }
};

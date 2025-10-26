// Database and application types for the time tracking app

export interface Project {
    id: string;
    name: string;
    description?: string;
    color?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface TimeEntry {
    id: string;
    projectId: string;
    startTime: Date;
    endTime: Date | null; // null means currently tracking
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}

export interface ActiveSession {
    entryId: string;
    projectId: string;
    startTime: Date;
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
    endTime?: Date;
    description?: string;
}

// Application state
export interface TimeTrackingState {
    projects: Project[];
    timeEntries: TimeEntry[];
    activeSession: ActiveSession | null;
    selectedProjectId: string | null;
    isLoading: boolean;
}

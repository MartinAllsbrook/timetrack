import { useState } from "preact/hooks";
import Timeline from "../../components/timeline/Timeline.tsx";
import { TimeEntryWithProject, Project, TimeEntry } from "../../src/types.ts";

// Mock data for testing
const mockProjects: Project[] = [
    {
        id: "1",
        name: "Frontend Development",
        description: "React and TypeScript work",
        color: "#3B82F6",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "2",
        name: "Backend API",
        description: "Node.js and database work",
        color: "#10B981",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "3",
        name: "Meetings",
        description: "Team meetings and calls",
        color: "#F59E0B",
        createdAt: new Date(),
        updatedAt: new Date()
    },
    {
        id: "4",
        name: "Code Review",
        description: "Reviewing pull requests",
        color: "#8B5CF6",
        createdAt: new Date(),
        updatedAt: new Date()
    }
];

const createMockTimeEntry = (
    id: string,
    projectId: string,
    startHour: number,
    startMinute: number,
    durationMinutes: number,
    description?: string,
    isActive = false
): TimeEntry => {
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), startHour, startMinute);
    const endTime = isActive ? null : new Date(startTime.getTime() + durationMinutes * 60 * 1000);
    
    return {
        id,
        projectId,
        startTime,
        endTime,
        description,
        createdAt: startTime,
        updatedAt: endTime || startTime
    };
};

const createMockTimeEntries = (): TimeEntry[] => [
    createMockTimeEntry("1", "1", 9, 0, 120, "Setting up project structure"),
    createMockTimeEntry("2", "3", 11, 0, 30, "Daily standup meeting"),
    createMockTimeEntry("3", "1", 11, 30, 90, "Implementing timeline component"),
    createMockTimeEntry("4", "2", 13, 30, 60, "Database schema updates"),
    createMockTimeEntry("5", "4", 14, 30, 45, "Pull request reviews"),
    createMockTimeEntry("6", "1", 15, 30, 150, "Frontend debugging and testing"),
    createMockTimeEntry("7", "3", 18, 0, 60, "Team retrospective"),
    createMockTimeEntry("8", "1", 20, 0, 0, "Evening coding session", true) // Active entry
];

export default function TimelineTesting() {
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [timeEntries] = useState(() => createMockTimeEntries());
    
    // Combine time entries with projects
    const timeEntriesWithProjects: TimeEntryWithProject[] = timeEntries.map(entry => {
        const project = mockProjects.find(p => p.id === entry.projectId)!;
        return {
            ...entry,
            project
        };
    });
    
    const handleEntryClick = (entry: TimeEntry) => {
        const project = mockProjects.find(p => p.id === entry.projectId);
        alert(`Clicked entry: ${project?.name}\nTime: ${entry.startTime.toLocaleTimeString()} - ${entry.endTime?.toLocaleTimeString() || 'Active'}\nDescription: ${entry.description || 'No description'}`);
    };
    
    const addTestEntry = () => {
        const now = new Date();
        const newEntry = createMockTimeEntry(
            Date.now().toString(),
            mockProjects[Math.floor(Math.random() * mockProjects.length)].id,
            now.getHours(),
            now.getMinutes(),
            Math.floor(Math.random() * 120) + 15,
            "Test entry added at runtime"
        );
        
        // In a real app, you'd update state here
        console.log("Would add entry:", newEntry);
    };
    
    const changeDate = (direction: 'prev' | 'next') => {
        const newDate = new Date(selectedDate);
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        setSelectedDate(newDate);
    };
    
    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Timeline Component Testing</h1>
            
            {/* Date Navigation */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px',
                padding: '16px',
                backgroundColor: '#F9FAFB',
                borderRadius: '8px',
                border: '1px solid #E5E7EB'
            }}>
                <button
                    type="button"
                    onClick={() => changeDate('prev')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    ← Previous Day
                </button>
                
                <input
                    type="date"
                    value={selectedDate.toISOString().split('T')[0]}
                    onChange={(e) => {
                        const target = e.target as HTMLInputElement;
                        if (target?.value) {
                            setSelectedDate(new Date(target.value));
                        }
                    }}
                    style={{
                        padding: '8px',
                        border: '1px solid #D1D5DB',
                        borderRadius: '4px'
                    }}
                />
                
                <button
                    type="button"
                    onClick={() => changeDate('next')}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#3B82F6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Next Day →
                </button>
                
                <button
                    type="button"
                    onClick={() => setSelectedDate(new Date())}
                    style={{
                        padding: '8px 16px',
                        backgroundColor: '#10B981',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer'
                    }}
                >
                    Today
                </button>
            </div>
            
            {/* Timeline Component */}
            <Timeline
                timeEntries={timeEntriesWithProjects}
                date={selectedDate}
                onEntryClick={handleEntryClick}
                className="test-timeline"
            />
            
            {/* Test Controls */}
            <div style={{
                marginTop: '32px',
                padding: '16px',
                backgroundColor: '#F3F4F6',
                borderRadius: '8px'
            }}>
                <h3>Test Controls</h3>
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <button
                        type="button"
                        onClick={addTestEntry}
                        style={{
                            padding: '8px 16px',
                            backgroundColor: '#8B5CF6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Random Entry
                    </button>
                </div>
            </div>
            
            {/* Mock Data Display */}
            <details style={{ marginTop: '32px' }}>
                <summary style={{ cursor: 'pointer', fontSize: '16px', fontWeight: '600' }}>
                    View Mock Data
                </summary>
                <div style={{ marginTop: '16px' }}>
                    <h4>Projects:</h4>
                    <pre style={{ 
                        backgroundColor: '#1F2937', 
                        color: '#F9FAFB', 
                        padding: '16px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(mockProjects, null, 2)}
                    </pre>
                    
                    <h4>Time Entries for {selectedDate.toDateString()}:</h4>
                    <pre style={{ 
                        backgroundColor: '#1F2937', 
                        color: '#F9FAFB', 
                        padding: '16px', 
                        borderRadius: '4px',
                        fontSize: '12px',
                        overflow: 'auto'
                    }}>
                        {JSON.stringify(
                            timeEntriesWithProjects.filter(entry => 
                                entry.startTime.toDateString() === selectedDate.toDateString()
                            ), 
                            null, 
                            2
                        )}
                    </pre>
                </div>
            </details>
        </div>
    );
}
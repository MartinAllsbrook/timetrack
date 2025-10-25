import { TimeEntry, Project } from "../../src/types.ts";

interface TimelineEntryProps {
    timeEntry: TimeEntry;
    project: Project;
    startOfDay: Date;
    endOfDay: Date;
    onEntryClick?: (entry: TimeEntry) => void;
}

export default function TimelineEntry({ 
    timeEntry, 
    project, 
    startOfDay, 
    endOfDay,
    onEntryClick 
}: TimelineEntryProps) {
    const dayDuration = endOfDay.getTime() - startOfDay.getTime();
    const entryStart = Math.max(timeEntry.startTime.getTime(), startOfDay.getTime());
    const entryEnd = timeEntry.endTime 
        ? Math.min(timeEntry.endTime.getTime(), endOfDay.getTime())
        : endOfDay.getTime(); // If still running, show until end of day
    
    const entryDuration = entryEnd - entryStart;
    const startOffset = entryStart - startOfDay.getTime();
    
    // Calculate position and width as percentages
    const leftPercent = (startOffset / dayDuration) * 100;
    const widthPercent = (entryDuration / dayDuration) * 100;
    
    const isActive = !timeEntry.endTime;
    
    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
        });
    };
    
    const formatDuration = (ms: number) => {
        const hours = Math.floor(ms / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };
    
    return (
        <div
            className="timeline-entry"
            style={{
                position: 'absolute',
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                height: '40px',
                backgroundColor: project.color || '#3B82F6',
                border: isActive ? '2px solid #10B981' : '1px solid rgba(255,255,255,0.2)',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '12px',
                fontWeight: '500',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                transition: 'all 0.2s ease',
                minWidth: '2px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onClick={() => onEntryClick?.(timeEntry)}
            title={`${project.name}\n${formatTime(timeEntry.startTime)} - ${timeEntry.endTime ? formatTime(timeEntry.endTime) : 'Active'}\n${formatDuration(entryDuration)}${timeEntry.description ? `\n${timeEntry.description}` : ''}`}
        >
            {widthPercent > 15 && (
                <span style={{ 
                    overflow: 'hidden', 
                    textOverflow: 'ellipsis', 
                    whiteSpace: 'nowrap',
                    padding: '0 4px'
                }}>
                    {project.name}
                </span>
            )}
            {isActive && (
                <div
                    style={{
                        position: 'absolute',
                        right: '2px',
                        top: '2px',
                        width: '8px',
                        height: '8px',
                        backgroundColor: '#10B981',
                        borderRadius: '50%',
                        animation: 'pulse 2s infinite'
                    }}
                />
            )}
        </div>
    );
}
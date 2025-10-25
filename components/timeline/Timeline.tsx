import { TimeEntry, TimeEntryWithProject } from "../../src/types.ts";
import TimelineEntry from "./TimelineEntry.tsx";

interface TimelineProps {
    timeEntries: TimeEntryWithProject[];
    date: Date;
    onEntryClick?: (entry: TimeEntry) => void;
    className?: string;
}

export default function Timeline({ 
    timeEntries, 
    date, 
    onEntryClick, 
    className = "" 
}: TimelineProps) {
    // Create start and end of the day
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    // Filter entries for this day
    const dayEntries = timeEntries.filter(entry => {
        const entryDate = new Date(entry.startTime);
        return entryDate.toDateString() === date.toDateString();
    });
    
    // Generate hour markers
    const hourMarkers = Array.from({ length: 25 }, (_, i) => {
        const hour = new Date(startOfDay);
        hour.setHours(i);
        return hour;
    });
    
    const formatHour = (hour: Date) => {
        return hour.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            hour12: false 
        }).replace(':00', '');
    };
    
    const getTotalDuration = () => {
        const total = dayEntries.reduce((acc, entry) => {
            const start = Math.max(entry.startTime.getTime(), startOfDay.getTime());
            const end = entry.endTime 
                ? Math.min(entry.endTime.getTime(), endOfDay.getTime())
                : Date.now();
            return acc + (end - start);
        }, 0);
        
        const hours = Math.floor(total / (1000 * 60 * 60));
        const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
        return `${hours}h ${minutes}m`;
    };
    
    return (
        <div className={`timeline-container ${className}`}>
            {/* Header */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                padding: '0 8px'
            }}>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600' }}>
                    {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </h3>
                <div style={{ 
                    fontSize: '14px', 
                    color: '#6B7280',
                    display: 'flex',
                    gap: '16px'
                }}>
                    <span>{dayEntries.length} entries</span>
                    <span>Total: {getTotalDuration()}</span>
                </div>
            </div>
            
            {/* Timeline */}
            <div style={{
                position: 'relative',
                height: '80px',
                backgroundColor: '#F9FAFB',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                overflow: 'hidden'
            }}>
                {/* Hour markers */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '20px',
                    borderBottom: '1px solid #E5E7EB',
                    display: 'flex'
                }}>
                    {hourMarkers.slice(0, 24).map((hour, index) => (
                        <div
                            key={index}
                            style={{
                                flex: 1,
                                borderRight: index < 23 ? '1px solid #F3F4F6' : 'none',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '10px',
                                color: '#9CA3AF',
                                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F9FAFB'
                            }}
                        >
                            {formatHour(hour)}
                        </div>
                    ))}
                </div>
                
                {/* Timeline entries */}
                <div style={{
                    position: 'absolute',
                    top: '20px',
                    left: 0,
                    right: 0,
                    bottom: 0,
                    padding: '8px'
                }}>
                    {dayEntries.map((entry) => (
                        <TimelineEntry
                            key={entry.id}
                            timeEntry={entry}
                            project={entry.project}
                            startOfDay={startOfDay}
                            endOfDay={endOfDay}
                            onEntryClick={onEntryClick}
                        />
                    ))}
                </div>
                
                {/* Empty state */}
                {dayEntries.length === 0 && (
                    <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#9CA3AF',
                        fontSize: '14px',
                        textAlign: 'center'
                    }}>
                        No time entries for this day
                    </div>
                )}
            </div>
            
            {/* Legend */}
            {dayEntries.length > 0 && (
                <div style={{
                    marginTop: '12px',
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '8px',
                    fontSize: '12px'
                }}>
                    {Array.from(new Set(dayEntries.map(e => e.project.id)))
                        .map(projectId => {
                            const project = dayEntries.find(e => e.project.id === projectId)?.project;
                            if (!project) return null;
                            
                            return (
                                <div
                                    key={projectId}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '4px'
                                    }}
                                >
                                    <div
                                        style={{
                                            width: '12px',
                                            height: '12px',
                                            backgroundColor: project.color || '#3B82F6',
                                            borderRadius: '2px'
                                        }}
                                    />
                                    <span>{project.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
            )}
            
            <style>
                {`
                    @keyframes pulse {
                        0%, 100% {
                            opacity: 1;
                        }
                        50% {
                            opacity: 0.5;
                        }
                    }
                    
                    .timeline-entry:hover {
                        transform: translateY(-1px);
                        box-shadow: 0 4px 8px rgba(0,0,0,0.15) !important;
                    }
                `}
            </style>
        </div>
    );
}
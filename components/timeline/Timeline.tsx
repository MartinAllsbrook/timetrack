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
    const hourMarkers = Array.from({ length: 24 }, (_, i) => i);
    
    const formatHour = (hour: number) => {
        return hour.toString().padStart(2, '0');
    };
    
    /**
     * Gets total duration of all entries for the day
     * @returns - Formatted total duration string
     */
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
            <div className="flex justify-between items-center mb-4 px-2">
                <h3 className="m-0 text-lg font-semibold">
                    {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </h3>
                <div className="text-sm text-gray-500 flex gap-4">
                    <span>{dayEntries.length} entries</span>
                    <span>Total: {getTotalDuration()}</span>
                </div>
            </div>
            
            {/* Timeline */}
            <div className="relative h-20 bg-gray-50 border border-gray-200 rounded-lg overflow-hidden">
                {/* Hour markers */}
                <div className="absolute top-0 left-0 right-0 h-5 border-b border-gray-200 flex">
                    {hourMarkers.map((hour, index) => (
                        <div
                            key={index}
                            className={`flex-1 flex items-center justify-center text-xs text-gray-400 ${
                                index < 23 ? 'border-r border-gray-100' : ''
                            } ${
                                index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                            }`}
                        >
                            {formatHour(hour)}
                        </div>
                    ))}
                </div>
                
                {/* Timeline entries */}
                <div className="absolute top-5 left-0 right-0 bottom-0 p-2">
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
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-gray-400 text-sm text-center">
                        No time entries for this day
                    </div>
                )}
            </div>
            
            {/* Legend */}
            {dayEntries.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    {Array.from(new Set(dayEntries.map(e => e.project.id)))
                        .map(projectId => {
                            const project = dayEntries.find(e => e.project.id === projectId)?.project;
                            if (!project) return null;
                            
                            return (
                                <div
                                    key={projectId}
                                    className="flex items-center gap-1"
                                >
                                    <div
                                        className="w-3 h-3 rounded-sm"
                                        style={{
                                            backgroundColor: project.color || '#3B82F6'
                                        }}
                                    />
                                    <span>{project.name}</span>
                                </div>
                            );
                        })
                    }
                </div>
            )}

        </div>
    );
}
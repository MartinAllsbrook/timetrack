import { TimeEntryWithProject } from "../../src/types.ts";

interface TimelineEntryProps {
    timeEntry: TimeEntryWithProject;
    startOfDay: Date;
    endOfDay: Date;
    onEntryClick?: (entry: TimeEntryWithProject) => void;
}

export default function TimelineEntry({ 
    timeEntry, 
    startOfDay, 
    endOfDay,
    onEntryClick 
}: TimelineEntryProps) {
    const dayDuration = endOfDay.getTime() - startOfDay.getTime();
    const entryStart = Math.max(timeEntry.startTime.getTime(), startOfDay.getTime());
    const entryEnd = timeEntry.endTime 
        ? Math.min(timeEntry.endTime.getTime(), endOfDay.getTime())
        : Math.min(Date.now(), endOfDay.getTime()); // If still running, show until now or end of day
    
    const entryDuration = entryEnd - entryStart;
    const startOffset = entryStart - startOfDay.getTime();
    
    // Calculate position and width as percentages
    const leftPercent = (startOffset / dayDuration) * 100;
    const widthPercent = (entryDuration / dayDuration) * 100;
    
    const isActive = !timeEntry.endTime; // TODO: We've kindof already calculated this above but idk if it's that important
    
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
            className={`absolute h-10 rounded cursor-pointer flex items-center justify-center text-white text-xs font-medium transition-all duration-200 min-w-0.5 shadow-sm hover:-translate-y-px hover:shadow-md ${
                isActive ? 'border-2 border-emerald-500' : 'border border-white border-opacity-20'
            }`}
            style={{
                left: `${leftPercent}%`,
                width: `${widthPercent}%`,
                backgroundColor: timeEntry.project.color || '#3B82F6',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)'
            }}
            onClick={() => onEntryClick?.(timeEntry)}
            title={`${timeEntry.project.name}\n${formatTime(timeEntry.startTime)} - ${timeEntry.endTime ? formatTime(timeEntry.endTime) : 'Active'}\n${formatDuration(entryDuration)}${timeEntry.description ? `\n${timeEntry.description}` : ''}`}
        >
            {widthPercent > 15 && (
                <span className="overflow-hidden text-ellipsis whitespace-nowrap px-1">
                    {timeEntry.project.name}
                </span>
            )}
            {isActive && (
                <div className="absolute right-0.5 top-0.5 w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            )}
        </div>
    );
}
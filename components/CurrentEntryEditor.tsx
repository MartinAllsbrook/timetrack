import { ProjectSelect } from "./ProjectSelect.tsx";
import { ProjectWithStats } from "../src/types.ts";
import { Signal, useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

interface CurrentEntryEditorProps {
    projects: Signal<ProjectWithStats[]>;
    selectedProjectId: Signal<string | null>;
    editActiveEntry: (projectId?: string, description?: string) => void;
}

const STORAGE_KEY = "timetrack_current_description";

export function CurrentEntryEditor(props: CurrentEntryEditorProps) {
    const description = useSignal("");
    const debounceTimeout = useSignal<number | null>(null);

    // Load saved description on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                description.value = saved;
                // Restore the description to the active entry
                props.editActiveEntry(undefined, saved);
            }
        } catch (error) {
            console.warn("Failed to load saved description:", error);
        }
    }, []);

    const handleDescriptionChange = (value: string) => {
        description.value = value;
        
        // Clear existing timeout
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value);
        }
        
        // Set Timeout so that we are not constantly updating.
        debounceTimeout.value = setTimeout(() => {
            props.editActiveEntry(undefined, value);

            // Save to localStorage
            // Should we do this only on successful save of the entry or more frequently. This keeps it synced with the DB so it might cause less unexpected behavior
            try {
                if (value.trim()) {
                    localStorage.setItem(STORAGE_KEY, value);
                } else {
                    localStorage.removeItem(STORAGE_KEY);
                }
            } catch (error) {
                console.warn("Failed to save description:", error);
            }
        }, 750); // TODO: I wonder if there's like a cool way to adjust this dynamically... 
    };

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout.value) {
                clearTimeout(debounceTimeout.value);
            }
        };
    }, []);

    return (
        <div class="space-y-4">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Project:
                </label>
                <ProjectSelect
                    projects={props.projects}
                    selectedProjectId={props.selectedProjectId}
                    onProjectSelect={(projectId) => props.editActiveEntry(projectId)}
                />
            </div>
            
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Task Description:
                </label>
                <textarea
                    value={description.value}
                    onInput={(e) => handleDescriptionChange((e.target as HTMLTextAreaElement).value)}
                    placeholder="What are you working on? (optional)"
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    rows={3}
                />
                <p class="mt-1 text-xs text-gray-500">
                    Describe the specific task or feature you're working on
                </p>
            </div>
        </div>
    );
}
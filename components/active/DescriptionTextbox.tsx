import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const STORAGE_KEY = "timetrack_current_description";

export function DescriptionTextbox(props: { onDescriptionChange: (value: string) => void; }) {
    const description = useSignal("");
    const debounceTimeout = useSignal<number | null>(null);

    // Load saved description on mount
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                description.value = saved;

                // Restore the description to the active entry
                props.onDescriptionChange(saved);
            }
        } catch (error) {
            console.warn("Failed to load saved description:", error);
        }
        
        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeout.value) {
                clearTimeout(debounceTimeout.value);
            }
        };
    }, []);


    const handleDescriptionChange = (value: string) => {
        description.value = value;

        // Clear existing timeout
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value);
        }
        
        // Set Timeout so that we are not constantly updating.
        debounceTimeout.value = setTimeout(() => {
            props.onDescriptionChange(value);

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

    return (
        <div class="relative flex">
            <textarea
                    value={description.value}
                    onInput={(e) => handleDescriptionChange((e.target as HTMLTextAreaElement).value)}
                    placeholder="What are you working on?"
                    class="w-full px-3 py-2 border-none text-xl font-bold placeholder-gray-400 focus:outline-none resize-none"
                    rows={1}
                    aria-label="Task description"
                    role="textbox"
                    aria-describedby="description-help"
                    title="Describe what you're working on"
            />
            {/* TODO: Accessability */}
            {/* <span id="description-help" class="sr-only">
                Enter a description of the task you're currently working on. This field is optional.
            </span> */}
        </div>
    );
}
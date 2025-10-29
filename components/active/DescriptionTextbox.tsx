import { useSignal } from "@preact/signals";
import { useEffect } from "preact/hooks";

const STORAGE_KEY = "timetrack_current_description";

export function DescriptionTextbox(props: { 
    onDescriptionChange: (value: string) => void;
    currentDescription?: string;
    isTracking?: boolean;
}) {
    const description = useSignal("");
    const debounceTimeout = useSignal<number | null>(null);

    // Load saved description on mount and sync with current description
    useEffect(() => {
        // If there's a current description from an active session, use that
        if (props.currentDescription !== undefined) {
            console.log("Using current description from props:", props.currentDescription);
            description.value = props.currentDescription;
        } else if (props.isTracking) {
            // Only restore from localStorage if we're tracking but no current description
            try {
                const saved = localStorage.getItem(STORAGE_KEY);
                if (saved) {
                    description.value = saved;
                    console.log("Restored description from localStorage:", saved);
                    props.onDescriptionChange(saved);
                }
            } catch (error) {
                console.warn("Failed to load saved description:", error);
            }
        } else {
            // Not tracking, clear the description and localStorage
            description.value = "";
            try {
                localStorage.removeItem(STORAGE_KEY);
            } catch (error) {
                console.warn("Failed to clear saved description:", error);
            }
        }
        
        // Cleanup timeout on unmount
        return () => {
            if (debounceTimeout.value) {
                clearTimeout(debounceTimeout.value);
            }
        };
    }, [props.currentDescription, props.isTracking]);


    const handleDescriptionChange = (value: string) => {
        description.value = value;

        // Clear existing timeout
        if (debounceTimeout.value) {
            clearTimeout(debounceTimeout.value);
        }
        
        // Set Timeout so that we are not constantly updating.
        debounceTimeout.value = setTimeout(() => {
            props.onDescriptionChange(value);

            // Save to localStorage only when tracking
            if (props.isTracking) {
                try {
                    if (value.trim()) {
                        localStorage.setItem(STORAGE_KEY, value);
                    } else {
                        localStorage.removeItem(STORAGE_KEY);
                    }
                } catch (error) {
                    console.warn("Failed to save description:", error);
                }
            }
        }, 750); // TODO: I wonder if there's like a cool way to adjust this dynamically... 
    
    };

    return (
        <div class="relative flex">
            <textarea
                    value={description.value}
                    onInput={(e) => handleDescriptionChange((e.target as HTMLTextAreaElement).value)}
                    placeholder="What are you working on?"
                    class="w-full border-none text-xl font-bold placeholder-gray-400 focus:outline-none resize-none"
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
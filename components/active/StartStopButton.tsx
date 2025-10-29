import { Signal } from "@preact/signals";

export function StartStopButton(props: {
    started: Signal<boolean>;
    onStart?: () => void;
    onStop?: () => void;
    canStart: Signal<boolean>;
    isLoading: Signal<boolean>;
}) {
    const { started, canStart, isLoading} = props;

    const handleClick = () => {
        if (started.value) {
            props.onStop?.();
        } else {
            props.onStart?.();
        }
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            className={`
                w-20 h-8 rounded-lg cursor-pointer bg-white border-2
                text-sm font-bold
                transition-colors duration-200 ease-in-out
                ${((!canStart.value && !started.value) || isLoading.value) ?
                    "text-gray-400 border-gray-400 cursor-not-allowed" :
                    (started.value ? 
                        "text-red-600 border-red-600 hover:bg-red-50" : 
                        "text-green-600 border-green-600 hover:bg-green-50"
                    )
                }
            `}
            title={started.value ? 
                (isLoading.value ? "Stop" : "Stoping...") : 
                (isLoading.value ? "Start" : "Starting...")
            }
        >
            {started.value ? "STOP" : "START"}
        </button>
    );
}
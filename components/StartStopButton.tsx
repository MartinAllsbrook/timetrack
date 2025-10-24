import { Signal } from "@preact/signals";

export function StartStopButton(props: {
    started: Signal<boolean>;
    onStart?: () => void;
    onStop?: () => void;
    canStart: Signal<boolean>;
    isLoading: Signal<boolean>;
}) {
    const { started, canStart, isLoading} = props;

    console.log("StartStopButton - started:", started.value, "canStart:", canStart.value, "isLoading:", isLoading.value);

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
                w-20 h-20 rounded-lg cursor-pointer 
                text-sm font-bold text-white
                transition-colors duration-200 ease-in-out
                ${((!canStart.value && !started.value) || isLoading.value) ?
                    "bg-gray-400 cursor-not-allowed" :
                    (started.value ? 
                        "bg-red-600 hover:bg-red-700" : 
                        "bg-green-600 hover:bg-green-700"
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
import { Signal } from "@preact/signals";

export function StartStopButton(props: {
    started: boolean;
    onStart?: () => void;
    onStop?: () => void;
    canStart?: boolean;
    isLoading?: boolean;
}) {
    const { started, canStart, isLoading} = props;

    console.log("StartStopButton - started:", started, "canStart:", canStart, "isLoading:", isLoading);

    const handleClick = () => {
        if (started) {
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
                ${((!canStart && !started) || isLoading) ?
                    "bg-gray-400 cursor-not-allowed" :
                    (started ? 
                        "bg-red-600 hover:bg-red-700" : 
                        "bg-green-600 hover:bg-green-700"
                    )
                }
            `}
            title={started ? 
                (isLoading ? "Stop" : "Stoping...") : 
                (isLoading ? "Start" : "Starting...")
            }
        >
            {started ? "STOP" : "START"}
        </button>
    );
}
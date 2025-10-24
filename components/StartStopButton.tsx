import { Signal } from "@preact/signals";

export function StartStopButton(props: {
    started: Signal<boolean>;
}) {
    const started = props.started;

    const handleClick = () => {
        started.value = !started.value;
    };

    return (
        <button
            type="button"
            onClick={handleClick}
            style={{
                width: "80px",
                height: "80px",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: started.value ? "#dc2626" : "#16a34a",
                transition: "background-color 0.2s ease",
            }}
            title={started.value ? "Click to Stop" : "Click to Start"}
        >
            {started.value ? "STOP" : "START"}
        </button>
    );
}
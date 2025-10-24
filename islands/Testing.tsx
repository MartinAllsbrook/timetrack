import { useSignal } from "@preact/signals";
import { StartStopButton } from "../components/StartStopButton.tsx";

export default function Testing() {
    const active = useSignal(false);

    const handleStart = () => {
        active.value = true;
    }

    const handleStop = () => {
        active.value = false;
    }

    return (
        <div>
            <StartStopButton started={active.value} onStart={handleStart} onStop={handleStop} canStart/>
        </div>
    );
}
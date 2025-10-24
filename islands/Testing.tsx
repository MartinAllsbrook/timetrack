import { useSignal } from "@preact/signals";
import { StartStopButton } from "../components/StartStopButton.tsx";

export default function Testing() {
    const active = useSignal(false);

    return (
        <div>
            <StartStopButton started={active}/>
        </div>
    );
}
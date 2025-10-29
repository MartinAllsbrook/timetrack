import { Signal, useSignal } from "@preact/signals";
import { ProjectSelect } from "../ProjectSelect.tsx";
import { DescriptionTextbox } from "./DescriptionTextbox.tsx";
import { ActiveSession, ProjectWithStats } from "src/types.ts";
import { StartStopButton } from "./StartStopButton.tsx";
import Timer from "./Timer.tsx";

interface TrackingBarProps {
    projects: Signal<ProjectWithStats[]>;
    selectedProjectId: Signal<string | null>;
    selectedProject: Signal<ProjectWithStats | null>;
    activeSession: Signal<ActiveSession | null>;
    isLoading: Signal<boolean>;
    editActiveEntry: (projectId?: string, description?: string) => void;
    onStart: () => void;
    onStop: () => void;
}

export function TrackingBar(props: TrackingBarProps) {
    const isTracking = useSignal(false);
    const canStart = useSignal(false);

    // TODO: is there a way to get this logic out of here? 
    isTracking.value = !!props.activeSession.value;
    canStart.value = !!props.selectedProject.value && !isTracking.value;

    const handleDescriptionChange = (value: string) => {
        console.log("Description changed to:", value);

        props.editActiveEntry(undefined, value);
    };

    const handleProjectSelect = (projectId: string) => {
        console.log("Project selected:", projectId);

        props.editActiveEntry(projectId, undefined);
    }

    return (
        <div class="bg-white rounded-lg border border-gray-200 px-8 py-4 shadow-sm flex items-center">
            <div class="flex-1">
                <DescriptionTextbox
                    onDescriptionChange={handleDescriptionChange}
                />
            </div>

            <div class="flex-shrink-0 ml-4">
                <ProjectSelect
                    projects={props.projects}
                    selectedProjectId={props.selectedProjectId}
                    onProjectSelect={handleProjectSelect}
                />
            </div>



            <div class="flex-shrink-0 ml-4 flex items-center">
                <Timer
                    activeSession={props.activeSession}
                    selectedProject={props.selectedProject}
                />
            </div>

            <div class="flex-shrink-0 ml-4 flex items-center">
                <StartStopButton
                    started={isTracking}
                    onStart={props.onStart}
                    onStop={props.onStop}
                    canStart={canStart}
                    isLoading={props.isLoading}
                />
            </div>
        </div>
    );
}
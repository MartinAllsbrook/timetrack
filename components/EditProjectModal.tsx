import { useState, useEffect } from "preact/hooks";
import { Project } from "../src/types.ts";

interface EditProjectModalProps {
    project: Project | null;
    onClose: () => void;
    onEditProject: (
        id: string,
        name: string,
        description?: string,
        color?: string,
    ) => Promise<void>;
}

const PROJECT_COLORS = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#eab308",
    "#84cc16",
    "#22c55e",
    "#10b981",
    "#14b8a6",
    "#06b6d4",
    "#0ea5e9",
    "#3b82f6",
    "#6366f1",
    "#8b5cf6",
    "#a855f7",
    "#d946ef",
    "#ec4899",
];

export default function EditProjectModal(props: EditProjectModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Prefill form when project changes
    useEffect(() => {
        if (props.project) {
            setName(props.project.name);
            setDescription(props.project.description || "");
            setSelectedColor(props.project.color || PROJECT_COLORS[0]);
        }
    }, [props.project]);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name.trim() || !props.project) return;

        setIsSubmitting(true);
        try {
            await props.onEditProject(
                props.project.id,
                name.trim(),
                description.trim() || undefined,
                selectedColor,
            );
            props.onClose();
        } catch (error) {
            console.error("Failed to edit project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!props.project) return null;

    return (
        <div class="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black opacity-25"></div>
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    Edit Project
                </h2>

                <form onSubmit={handleSubmit} class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Project Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onInput={(e) =>
                                setName((e.target as HTMLInputElement).value)}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project name"
                            required
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-1">
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onInput={(e) =>
                                setDescription(
                                    (e.target as HTMLTextAreaElement).value,
                                )}
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter project description"
                            rows={3}
                            disabled={isSubmitting}
                        />
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Project Color
                        </label>
                        <div class="grid grid-cols-8 gap-2">
                            {PROJECT_COLORS.map((color) => (
                                <button
                                    key={color}
                                    type="button"
                                    onClick={() => setSelectedColor(color)}
                                    disabled={isSubmitting}
                                    class={`w-8 h-8 rounded-full border-2 transition-all ${
                                        selectedColor === color
                                            ? "border-gray-800 scale-110"
                                            : "border-gray-300 hover:scale-105"
                                    }`}
                                    style={{ backgroundColor: color }}
                                />
                            ))}
                        </div>
                    </div>

                    <div class="flex justify-end space-x-3 pt-4">
                        <button
                            type="button"
                            onClick={props.onClose}
                            disabled={isSubmitting}
                            class="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim() || isSubmitting || !props.project}
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Updating..." : "Update Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

import { useState } from "preact/hooks";

interface CreateProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateProject: (
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

export default function CreateProjectModal(props: CreateProjectModalProps) {
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: Event) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await props.onCreateProject(
                name.trim(),
                description.trim() || undefined,
                selectedColor,
            );
            setName("");
            setDescription("");
            setSelectedColor(PROJECT_COLORS[0]);
            props.onClose();
        } catch (error) {
            console.error("Failed to create project:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!props.isOpen) return null;

    return (
        <div class="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black opacity-25"></div>
            <div class="bg-white rounded-lg p-6 w-full max-w-md">
                <h2 class="text-xl font-semibold text-gray-800 mb-4">
                    Create New Project
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
                            disabled={!name.trim() || isSubmitting}
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? "Creating..." : "Create Project"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

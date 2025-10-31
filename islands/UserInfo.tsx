import type { User } from "../src/types.ts";

interface Props {
    user: User | null;
}

export function UserInfo({ user }: Props) {
    return (
        <div class="max-w-6xl mx-auto space-y-6">
            <h2 class="text-2xl font-bold mb-4">User Information</h2>
            {user ? (
                <div class="bg-white shadow rounded-lg p-6">
                    <p class="text-gray-800"><strong>Name:</strong> {user.name}</p>
                    <p class="text-gray-800"><strong>ID:</strong> {user.id}</p>
                </div>
            ) : (
                <p class="text-gray-600">No user is logged in.</p>
            )}

            <a
                href="/"
                class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
                Back
            </a>
        </div>
    )
}
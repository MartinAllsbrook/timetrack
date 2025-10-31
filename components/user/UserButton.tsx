export function UserButton() {
    const onClick = () => {
        globalThis.location.href = '/user';
    };

    return (
        <button
            type="button"
            className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300"
            onClick={onClick}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
            >
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
        </button>
    )
}
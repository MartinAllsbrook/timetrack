interface EntryModalProps {

}

export function EntryModal(props: EntryModalProps) {
    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50">
            <div className="absolute inset-0 bg-black opacity-25"></div>
            <div className="relative bg-white rounded-lg border border-gray-200 px-8 py-4 shadow-sm">
            Entry Modal
            </div>
        </div>
    )
}
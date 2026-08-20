export default function MovieSkeleton() {
    return (
        <div className="group relative block w-full overflow-hidden rounded-xl bg-card border border-gray-800 animate-pulse">
            <div className="relative aspect-[2/3] w-full bg-gray-800"></div>
            <div className="p-3">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-800 rounded w-1/4"></div>
            </div>
        </div>
    );
}

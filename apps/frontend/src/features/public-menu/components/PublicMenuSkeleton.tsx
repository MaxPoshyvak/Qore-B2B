function ItemCardSkeleton() {
    return (
        <div className="flex gap-3 rounded-[1.25rem] border border-black/5 bg-white/60 p-3.5 sm:gap-4 sm:rounded-[1.5rem] sm:p-4 dark:border-white/10 dark:bg-[#121215]/60">
            <div className="flex flex-1 flex-col justify-between gap-2">
                <div className="space-y-1.5">
                    <div className="h-4 w-32 animate-pulse rounded-md bg-black/[0.06] dark:bg-white/10" />
                    <div className="h-3 w-full animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                    <div className="h-3 w-2/3 animate-pulse rounded-md bg-black/[0.05] dark:bg-white/[0.07]" />
                </div>
                <div className="flex items-center justify-between">
                    <div className="h-5 w-14 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
                    <div className="h-7 w-7 animate-pulse rounded-full bg-black/[0.06] dark:bg-white/10" />
                </div>
            </div>
            <div className="h-20 w-20 shrink-0 animate-pulse rounded-xl bg-black/[0.05] sm:h-24 sm:w-24 dark:bg-white/[0.07]" />
        </div>
    );
}

/** Loading placeholder mirroring the venue menu layout with zero CLS. */
export function PublicMenuSkeleton() {
    return (
        <div className="w-full">
            {/* Header skeleton matching VenueHeader */}
            <div className="mt-2.5 sm:mt-6">
                <div className="relative">
                    {/* Cover Image banner */}
                    <div className="h-28 w-full animate-pulse rounded-[1.5rem] bg-black/[0.06] sm:h-44 sm:rounded-[2rem] dark:bg-white/10" />
                    {/* Logo overlapping banner */}
                    <div className="absolute -bottom-5 left-4 sm:-bottom-8 sm:left-6">
                        <div className="h-16 w-16 animate-pulse rounded-[1.25rem] border-4 border-[#FAFAF8] bg-black/[0.06] sm:h-24 sm:w-24 sm:rounded-[1.5rem] dark:border-[#0A0A0C] dark:bg-white/10" />
                    </div>
                </div>

                {/* Venue Details */}
                <div className="mt-8 space-y-2 text-left sm:mt-10">
                    <div className="h-6 w-44 animate-pulse rounded-md bg-black/[0.06] sm:h-7 sm:w-56 dark:bg-white/10" />
                    <div className="h-4 w-64 animate-pulse rounded-md bg-black/[0.05] sm:w-80 dark:bg-white/[0.07]" />
                </div>
            </div>

            {/* Sticky Nav Skeleton */}
            <div className="my-2 rounded-[1.25rem] border border-black/5 p-1 sm:my-3 sm:p-1.5 dark:border-white/10">
                <div className="flex gap-2 overflow-x-hidden px-0.5 py-0.5">
                    {[72, 88, 64, 80].map((width, i) => (
                        <div
                            key={i}
                            style={{ width: `${width}px` }}
                            className="h-7 shrink-0 animate-pulse rounded-lg bg-black/[0.06] dark:bg-white/10"
                        />
                    ))}
                </div>
            </div>

            {/* Menu Items Grid */}
            <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <ItemCardSkeleton key={i} />
                ))}
            </div>
        </div>
    );
}

import Skeleton from './Skeleton'

function DashboardSkeleton() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-9 w-64" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <div
            key={item}
            className="rounded-xl bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-3 h-9 w-20" />
            <Skeleton className="mt-3 h-3 w-24" />
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <Skeleton className="h-6 w-48" />
        <Skeleton className="mt-3 h-4 w-72" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    </div>
  )
}

export default DashboardSkeleton
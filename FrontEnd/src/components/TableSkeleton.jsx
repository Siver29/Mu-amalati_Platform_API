import Skeleton from './Skeleton'

function TableSkeleton({ rows = 6 }) {
  return (
    <div className="overflow-hidden rounded-xl bg-white shadow">
      <div className="overflow-x-auto">
        <table className="w-full">
          <tbody>
            {Array.from({ length: rows }).map(
              (_, index) => (
                <tr
                  key={index}
                  className="border-b last:border-0"
                >
                  <td className="px-6 py-5">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-2 h-3 w-24" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-4 w-28" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-4 w-24" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-6 w-20" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-6 w-16" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-4 w-20" />
                  </td>

                  <td className="px-6 py-5">
                    <Skeleton className="h-4 w-10" />
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default TableSkeleton
<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\TransactionStatus;
use App\Http\Controllers\Controller;
use App\Http\Responses\ApiResponse;
use App\Models\Department;
use App\Models\Transaction;
use App\Models\TransactionType;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    use ApiResponse;

    /**
     * Employee dashboard.
     */
    public function employee(Request $request): JsonResponse
    {
        $user = $request->user();

        $transactions = $user->createdTransactions();

        $counts = [
            'total' => (clone $transactions)->count(),
            'draft' => (clone $transactions)->where('status', TransactionStatus::Draft)->count(),
            'pending' => (clone $transactions)->where('status', TransactionStatus::Pending)->count(),
            'returned' => (clone $transactions)->where('status', TransactionStatus::Returned)->count(),
            'rejected' => (clone $transactions)->where('status', TransactionStatus::Rejected)->count(),
            'approved' => (clone $transactions)->where('status', TransactionStatus::Approved)->count(),
            'completed' => (clone $transactions)->where('status', TransactionStatus::Completed)->count(),
        ];

        $recent = (clone $transactions)
            ->with(['transactionType'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        $unread = $user->notifications()->where('is_read', false)->count();

        return $this->success([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'job_title' => $user->job_title,
                'department' => $user->department ? ['id' => $user->department->id, 'name' => $user->department->name] : null,
            ],
            'leave_balance' => [
                'annual_leave_days' => $user->annual_leave_days,
                'used_leave_days' => $user->used_leave_days,
                'remaining_leave_days' => max(0, $user->annual_leave_days - $user->used_leave_days),
            ],
            'transaction_counts' => $counts,
            'recent_transactions' => $recent->map(fn ($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'title' => $t->title,
                'status' => $t->status->value,
                'priority' => $t->priority->value,
                'transaction_type' => $t->transactionType?->name_en,
                'created_at' => $t->created_at?->toISOString(),
            ]),
            'unread_notification_count' => $unread,
        ]);
    }

    /**
     * Manager dashboard.
     */
    public function manager(Request $request): JsonResponse
    {
        $user = $request->user();
        $departmentIds = $user->managedDepartmentIds();

        $pendingQuery = Transaction::where('status', TransactionStatus::Pending)
            ->whereIn('current_department_id', $departmentIds);

        $today = now()->toDateString();

        $pendingCount = (clone $pendingQuery)->count();
        $approvedToday = Transaction::where('status', TransactionStatus::Approved)
            ->whereIn('source_department_id', $departmentIds)
            ->whereDate('approved_at', $today)
            ->count();
        $returnedToday = Transaction::where('status', TransactionStatus::Returned)
            ->whereIn('source_department_id', $departmentIds)
            ->whereDate('returned_at', $today)
            ->count();
        $rejectedToday = Transaction::where('status', TransactionStatus::Rejected)
            ->whereIn('source_department_id', $departmentIds)
            ->whereDate('rejected_at', $today)
            ->count();

        $pendingFive = (clone $pendingQuery)
            ->with(['creator', 'transactionType'])
            ->orderByRaw("CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END")
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return $this->success([
            'manager' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'managed_departments' => Department::whereIn('id', $departmentIds)->get(['id', 'name']),
            'pending_approval_count' => $pendingCount,
            'approved_today_count' => $approvedToday,
            'returned_today_count' => $returnedToday,
            'rejected_today_count' => $rejectedToday,
            'pending_transactions' => $pendingFive->map(fn ($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'title' => $t->title,
                'priority' => $t->priority->value,
                'creator' => $t->creator?->name,
                'transaction_type' => $t->transactionType?->name_en,
            ]),
        ]);
    }

    /**
     * Admin dashboard.
     */
    public function admin(Request $request): JsonResponse
    {
        $totalEmployees = User::where('role', 'employee')->count();
        $totalManagers = User::where('role', 'manager')->count();
        $activeUsers = User::where('status', 'active')->count();
        $inactiveUsers = User::where('status', 'inactive')->count();
        $totalDepartments = Department::count();
        $totalTypes = TransactionType::count();
        $totalTransactions = Transaction::count();

        $byStatus = Transaction::query()
            ->selectRaw('status, count(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $usersByDept = User::query()
            ->selectRaw('department_id, count(*) as total')
            ->whereNotNull('department_id')
            ->groupBy('department_id')
            ->with('department:id,name')
            ->get()
            ->map(fn ($row) => [
                'department' => $row->department?->name,
                'total' => $row->total,
            ]);

        $transactionsByDept = Transaction::query()
            ->selectRaw('source_department_id, count(*) as total')
            ->groupBy('source_department_id')
            ->with('sourceDepartment:id,name')
            ->get()
            ->map(fn ($row) => [
                'department' => $row->sourceDepartment?->name,
                'total' => $row->total,
            ]);

        $latestUsers = User::with('department')->orderBy('created_at', 'desc')->limit(5)->get();

        $latestTransactions = Transaction::with(['transactionType', 'creator'])
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get();

        return $this->success([
            'total_employees' => $totalEmployees,
            'total_managers' => $totalManagers,
            'active_users' => $activeUsers,
            'inactive_users' => $inactiveUsers,
            'total_departments' => $totalDepartments,
            'total_transaction_types' => $totalTypes,
            'total_transactions' => $totalTransactions,
            'transactions_by_status' => $byStatus,
            'users_by_department' => $usersByDept,
            'transactions_by_department' => $transactionsByDept,
            'latest_users' => $latestUsers->map(fn ($u) => [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role->value,
                'department' => $u->department?->name,
            ]),
            'latest_transactions' => $latestTransactions->map(fn ($t) => [
                'id' => $t->id,
                'transaction_number' => $t->transaction_number,
                'title' => $t->title,
                'status' => $t->status->value,
                'transaction_type' => $t->transactionType?->name_en,
                'creator' => $t->creator?->name,
            ]),
        ]);
    }
}

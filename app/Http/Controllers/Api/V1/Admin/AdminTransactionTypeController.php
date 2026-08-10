<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreTransactionTypeRequest;
use App\Http\Requests\Admin\UpdateTransactionTypeRequest;
use App\Http\Resources\TransactionTypeResource;
use App\Http\Responses\ApiResponse;
use App\Models\TransactionType;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminTransactionTypeController extends Controller
{
    use ApiResponse;

    /**
     * List all transaction types.
     */
    public function index(Request $request): JsonResponse
    {
        $perPage = min($request->integer('per_page', 10), 50);

        $types = TransactionType::with(['destinationDepartment', 'workflowSteps.department'])
            ->when($request->filled('is_active'), fn ($q) => $q->where('is_active', $request->boolean('is_active')))
            ->orderBy('name_en')
            ->paginate($perPage);

        return $this->successCollection(
            TransactionTypeResource::collection($types),
            200,
            [
                'current_page' => $types->currentPage(),
                'per_page' => $types->perPage(),
                'total' => $types->total(),
                'last_page' => $types->lastPage(),
            ]
        );
    }

    /**
     * Create a transaction type.
     */
    public function store(StoreTransactionTypeRequest $request): JsonResponse
    {
        $type = TransactionType::create($request->validated());

        return $this->success(
            new TransactionTypeResource($type->load('destinationDepartment', 'workflowSteps.department')),
            'Transaction type created successfully.',
            201
        );
    }

    /**
     * Show a transaction type.
     */
    public function show(TransactionType $transactionType): JsonResponse
    {
        return $this->success(new TransactionTypeResource($transactionType->load('destinationDepartment', 'workflowSteps.department')));
    }

    /**
     * Update a transaction type.
     */
    public function update(UpdateTransactionTypeRequest $request, TransactionType $transactionType): JsonResponse
    {
        $transactionType->update($request->validated());

        return $this->success(
            new TransactionTypeResource($transactionType->load('destinationDepartment', 'workflowSteps.department')),
            'Transaction type updated successfully.'
        );
    }

    /**
     * Delete a transaction type, or refuse if referenced.
     */
    public function destroy(TransactionType $transactionType): JsonResponse
    {
        if ($transactionType->transactions()->exists()) {
            return $this->error('This transaction type is referenced by transactions and cannot be deleted. Deactivate it instead.', 422);
        }

        $transactionType->delete();

        return $this->success(null, 'Transaction type deleted successfully.', 204);
    }

    /**
     * Activate a transaction type.
     */
    public function activate(TransactionType $transactionType): JsonResponse
    {
        $transactionType->update(['is_active' => true]);

        return $this->success(
            new TransactionTypeResource($transactionType->load('destinationDepartment', 'workflowSteps.department')),
            'Transaction type activated successfully.'
        );
    }

    /**
     * Deactivate a transaction type.
     */
    public function deactivate(TransactionType $transactionType): JsonResponse
    {
        $transactionType->update(['is_active' => false]);

        return $this->success(
            new TransactionTypeResource($transactionType->load('destinationDepartment', 'workflowSteps.department')),
            'Transaction type deactivated successfully.'
        );
    }
}

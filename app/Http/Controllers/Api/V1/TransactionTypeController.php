<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\TransactionTypeResource;
use App\Http\Responses\ApiResponse;
use App\Models\TransactionType;
use Illuminate\Http\JsonResponse;

class TransactionTypeController extends Controller
{
    use ApiResponse;

    /**
     * List active transaction types with their workflow steps.
     */
    public function index(): JsonResponse
    {
        $types = TransactionType::with(['destinationDepartment', 'workflowSteps.department'])
            ->where('is_active', true)
            ->orderBy('name_en')
            ->get();

        return $this->success(TransactionTypeResource::collection($types));
    }

    /**
     * Show a single active transaction type.
     */
    public function show(TransactionType $transactionType): JsonResponse
    {
        if (! $transactionType->is_active) {
            return $this->notFound('Transaction type not found.');
        }

        $transactionType->load(['destinationDepartment', 'workflowSteps.department']);

        return $this->success(new TransactionTypeResource($transactionType));
    }
}

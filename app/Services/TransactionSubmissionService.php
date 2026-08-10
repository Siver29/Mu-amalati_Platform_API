<?php

namespace App\Services;

use App\Enums\TransactionHistoryAction;
use App\Enums\TransactionStatus;
use App\Enums\WorkflowStepStatus;
use App\Models\Transaction;
use App\Models\TransactionHistory;
use App\Models\TransactionTypeWorkflowStep;
use App\Models\TransactionWorkflowStep;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransactionSubmissionService
{
    public function __construct(
        private readonly TransactionNotificationService $notificationService,
    ) {}

    /**
     * Submit a draft transaction, snapshotting the configured workflow.
     *
     * @return array{transaction: Transaction, submitted: bool, message: string}
     */
    public function submit(Transaction $transaction, User $actor): array
    {
        return DB::transaction(function () use ($transaction, $actor) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            if ($transaction->status !== TransactionStatus::Draft) {
                throw new RuntimeException('Only draft transactions can be submitted.');
            }

            $type = $transaction->transactionType()->lockForUpdate()->first();

            if (! $type || ! $type->is_active) {
                throw new RuntimeException('The selected transaction type is not active.');
            }

            $steps = TransactionTypeWorkflowStep::where('transaction_type_id', $type->id)
                ->orderBy('step_order')
                ->get();

            if ($steps->isEmpty()) {
                throw new RuntimeException('This transaction type has no workflow configured.');
            }

            if ($type->requires_attachment && $transaction->attachments()->count() === 0) {
                throw new RuntimeException('This transaction type requires at least one attachment.');
            }

            $snapshots = $this->snapshotWorkflow($transaction, $steps);

            $first = $snapshots->first();

            $transaction->update([
                'status' => TransactionStatus::Pending,
                'current_workflow_step_id' => $first->id,
                'current_department_id' => $first->department_id,
                'submitted_at' => now(),
                'last_action_by' => $actor->id,
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::Submitted);

            $this->notificationService->notifyManagerForReview($transaction, $first->department_id);

            return [
                'transaction' => $transaction,
                'submitted' => true,
                'message' => 'Transaction submitted successfully.',
            ];
        });
    }

    /**
     * Resubmit a returned transaction, resuming from the returned step.
     *
     * @return array{transaction: Transaction, submitted: bool, message: string}
     */
    public function resubmit(Transaction $transaction, User $actor): array
    {
        return DB::transaction(function () use ($transaction, $actor) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            if ($transaction->status !== TransactionStatus::Returned) {
                throw new RuntimeException('Only returned transactions can be resubmitted.');
            }

            $type = $transaction->transactionType;

            if (! $type || ! $type->is_active) {
                throw new RuntimeException('The selected transaction type is not active.');
            }

            if ($type->requires_attachment && $transaction->attachments()->count() === 0) {
                throw new RuntimeException('This transaction type requires at least one attachment.');
            }

            $returnedStep = $transaction->workflowSteps()
                ->where('status', WorkflowStepStatus::Returned)
                ->orderBy('step_order')
                ->first();

            if (! $returnedStep) {
                throw new RuntimeException('No returned workflow step was found for this transaction.');
            }

            $returnedStep->update([
                'status' => WorkflowStepStatus::Pending,
                'reviewed_by' => null,
                'comment' => null,
                'reviewed_at' => null,
            ]);

            $transaction->update([
                'status' => TransactionStatus::Pending,
                'current_workflow_step_id' => $returnedStep->id,
                'current_department_id' => $returnedStep->department_id,
                'returned_at' => null,
                'last_action_by' => $actor->id,
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::Resubmitted);

            $this->notificationService->notifyManagerForReview($transaction, $returnedStep->department_id);

            return [
                'transaction' => $transaction,
                'submitted' => true,
                'message' => 'Transaction resubmitted successfully.',
            ];
        });
    }

    /**
     * Copy the transaction type workflow definitions into snapshot records.
     *
     * @return Collection<int, TransactionWorkflowStep>
     */
    protected function snapshotWorkflow(Transaction $transaction, $definitions)
    {
        $snapshots = collect();

        foreach ($definitions as $index => $definition) {
            $isFirst = $index === 0;

            $snapshot = TransactionWorkflowStep::create([
                'transaction_id' => $transaction->id,
                'department_id' => $definition->department_id,
                'original_workflow_step_id' => $definition->id,
                'step_order' => $definition->step_order,
                'name' => $definition->name,
                'status' => $isFirst ? WorkflowStepStatus::Pending : WorkflowStepStatus::Waiting,
            ]);

            $snapshots->push($snapshot);
        }

        return $snapshots;
    }

    /**
     * Record a history entry for the transaction.
     */
    protected function recordHistory(
        Transaction $transaction,
        User $actor,
        TransactionHistoryAction $action,
        ?string $comment = null
    ): TransactionHistory {
        return TransactionHistory::create([
            'transaction_id' => $transaction->id,
            'performed_by' => $actor->id,
            'action' => $action,
            'old_status' => $transaction->getOriginal('status') instanceof TransactionStatus
                ? $transaction->getOriginal('status')->value
                : $transaction->getOriginal('status'),
            'new_status' => $transaction->status->value,
            'comment' => $comment,
        ]);
    }
}

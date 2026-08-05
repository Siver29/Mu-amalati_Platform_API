<?php

namespace App\Services;

use App\Enums\TransactionHistoryAction;
use App\Enums\TransactionStatus;
use App\Enums\WorkflowStepStatus;
use App\Models\Transaction;
use App\Models\TransactionHistory;
use App\Models\TransactionWorkflowStep;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use RuntimeException;

class TransactionWorkflowService
{
    public function __construct(
        private readonly TransactionNotificationService $notificationService,
    ) {}

    /**
     * Approve the current pending workflow step.
     */
    public function approve(Transaction $transaction, User $actor, ?string $comment = null): Transaction
    {
        return DB::transaction(function () use ($transaction, $actor, $comment) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            $this->assertReviewable($transaction, $actor);

            $step = $this->pendingStep($transaction);

            $step->update([
                'status' => WorkflowStepStatus::Approved,
                'reviewed_by' => $actor->id,
                'comment' => $comment,
                'reviewed_at' => now(),
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::ApprovedStep, $comment, $step->name);

            $nextStep = TransactionWorkflowStep::where('transaction_id', $transaction->id)
                ->where('step_order', '>', $step->step_order)
                ->where('status', WorkflowStepStatus::Waiting)
                ->orderBy('step_order')
                ->first();

            if ($nextStep) {
                $nextStep->update(['status' => WorkflowStepStatus::Pending]);

                $transaction->update([
                    'current_workflow_step_id' => $nextStep->id,
                    'current_department_id' => $nextStep->department_id,
                    'last_action_by' => $actor->id,
                ]);

                $this->notificationService->notifyManagerForReview($transaction, $nextStep->department_id);
            } else {
                $transaction->update([
                    'status' => TransactionStatus::Approved,
                    'current_workflow_step_id' => null,
                    'current_department_id' => null,
                    'approved_at' => now(),
                    'last_action_by' => $actor->id,
                ]);

                $this->recordHistory($transaction, $actor, TransactionHistoryAction::FullyApproved);

                $this->notificationService->notifyCreator($transaction, 'transaction_approved', 'fully approved');
            }

            return $transaction;
        });
    }

    /**
     * Return the transaction to the creator for modification.
     */
    public function return(Transaction $transaction, User $actor, string $comment): Transaction
    {
        return DB::transaction(function () use ($transaction, $actor, $comment) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            $this->assertReviewable($transaction, $actor);

            $step = $this->pendingStep($transaction);

            $step->update([
                'status' => WorkflowStepStatus::Returned,
                'reviewed_by' => $actor->id,
                'comment' => $comment,
                'reviewed_at' => now(),
            ]);

            $transaction->update([
                'status' => TransactionStatus::Returned,
                'returned_at' => now(),
                'last_action_by' => $actor->id,
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::Returned, $comment, $step->name);

            $this->notificationService->notifyCreator($transaction, 'transaction_returned', 'returned');

            return $transaction;
        });
    }

    /**
     * Reject the transaction, ending the workflow.
     */
    public function reject(Transaction $transaction, User $actor, string $comment): Transaction
    {
        return DB::transaction(function () use ($transaction, $actor, $comment) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            $this->assertReviewable($transaction, $actor);

            $step = $this->pendingStep($transaction);

            $step->update([
                'status' => WorkflowStepStatus::Rejected,
                'reviewed_by' => $actor->id,
                'comment' => $comment,
                'reviewed_at' => now(),
            ]);

            $transaction->update([
                'status' => TransactionStatus::Rejected,
                'current_workflow_step_id' => null,
                'current_department_id' => null,
                'rejected_at' => now(),
                'last_action_by' => $actor->id,
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::Rejected, $comment, $step->name);

            $this->notificationService->notifyCreator($transaction, 'transaction_rejected', 'rejected');

            return $transaction;
        });
    }

    /**
     * Complete an approved transaction.
     */
    public function complete(Transaction $transaction, User $actor, ?string $comment = null): Transaction
    {
        return DB::transaction(function () use ($transaction, $actor, $comment) {
            $transaction = Transaction::whereKey($transaction->getKey())->lockForUpdate()->first();

            if ($transaction->status !== TransactionStatus::Approved) {
                throw new RuntimeException('Only approved transactions can be completed.');
            }

            $transaction->update([
                'status' => TransactionStatus::Completed,
                'completed_at' => now(),
                'last_action_by' => $actor->id,
            ]);

            $this->recordHistory($transaction, $actor, TransactionHistoryAction::Completed, $comment);

            $this->notificationService->notifyCreator($transaction, 'transaction_completed', 'completed');

            return $transaction;
        });
    }

    /**
     * Assert the transaction is pending and the actor is authorized to review it.
     */
    protected function assertReviewable(Transaction $transaction, User $actor): void
    {
        if ($transaction->status !== TransactionStatus::Pending) {
            throw new RuntimeException('Only pending transactions can be reviewed.');
        }

        if ($transaction->created_by === $actor->id) {
            throw new RuntimeException('A creator cannot review their own transaction.');
        }

        $step = $this->pendingStepOrFail($transaction);

        if (! $actor->isAdmin() && ! $actor->managedDepartments()->where('id', $step->department_id)->exists()) {
            throw new RuntimeException('You are not authorized to review this transaction.');
        }
    }

    /**
     * Get the current pending step, or throw.
     */
    protected function pendingStep(Transaction $transaction): TransactionWorkflowStep
    {
        return $this->pendingStepOrFail($transaction);
    }

    /**
     * Get the current pending step or throw a conflict.
     */
    protected function pendingStepOrFail(Transaction $transaction): TransactionWorkflowStep
    {
        $step = TransactionWorkflowStep::where('transaction_id', $transaction->id)
            ->where('status', WorkflowStepStatus::Pending)
            ->orderBy('step_order')
            ->first();

        if (! $step) {
            throw new RuntimeException('No pending workflow step is available for review.');
        }

        return $step;
    }

    /**
     * Record a history entry for the transaction.
     */
    protected function recordHistory(
        Transaction $transaction,
        User $actor,
        TransactionHistoryAction $action,
        ?string $comment = null,
        ?string $stepName = null
    ): TransactionHistory {
        return TransactionHistory::create([
            'transaction_id' => $transaction->id,
            'performed_by' => $actor->id,
            'action' => $action,
            'old_status' => $transaction->getOriginal('status') instanceof TransactionStatus
                ? $transaction->getOriginal('status')->value
                : $transaction->getOriginal('status'),
            'new_status' => $transaction->status->value,
            'workflow_step_name' => $stepName,
            'comment' => $comment,
        ]);
    }
}

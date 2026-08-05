<?php

namespace App\Policies;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use App\Models\User;

class TransactionPolicy
{
    /**
     * Determine whether the user can view the transaction.
     */
    public function view(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($transaction->created_by === $user->id) {
            return true;
        }

        return $this->isAuthorizedReviewer($user, $transaction);
    }

    /**
     * Determine whether the user can create a transaction.
     */
    public function create(User $user): bool
    {
        return $user->isEmployee() || $user->isManager();
    }

    /**
     * Determine whether the user can update the transaction.
     */
    public function update(User $user, Transaction $transaction): bool
    {
        return $transaction->created_by === $user->id
            && $transaction->status->isEditable();
    }

    /**
     * Determine whether the user can delete the transaction.
     */
    public function delete(User $user, Transaction $transaction): bool
    {
        return $transaction->created_by === $user->id
            && $transaction->status === TransactionStatus::Draft;
    }

    /**
     * Determine whether the user can submit/resubmit the transaction.
     */
    public function submit(User $user, Transaction $transaction): bool
    {
        return $transaction->created_by === $user->id
            && ($transaction->status === TransactionStatus::Draft
                || $transaction->status === TransactionStatus::Returned);
    }

    /**
     * Determine whether the user can review (approve/return/reject) the transaction.
     */
    public function review(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        if ($transaction->created_by === $user->id) {
            return false;
        }

        return $this->isAuthorizedReviewer($user, $transaction);
    }

    /**
     * Determine whether the user can add or remove attachments.
     */
    public function manageAttachments(User $user, Transaction $transaction): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $transaction->created_by === $user->id
            && $transaction->status->isEditable();
    }

    /**
     * Determine whether the user is an authorized reviewer for the transaction.
     */
    protected function isAuthorizedReviewer(User $user, Transaction $transaction): bool
    {
        if (! $user->isManager()) {
            return false;
        }

        $currentDepartmentId = $transaction->current_department_id;

        if (! $currentDepartmentId) {
            return false;
        }

        return $user->managedDepartments()->where('id', $currentDepartmentId)->exists();
    }
}

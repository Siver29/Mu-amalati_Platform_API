<?php

namespace App\Http\Requests\Transaction;

use App\Enums\TransactionPriority;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateTransactionRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'transaction_type_id' => ['sometimes', 'required', 'integer', 'exists:transaction_types,id'],
            'title' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['sometimes', 'required', 'string', 'max:5000'],
            'priority' => ['sometimes', 'required', Rule::enum(TransactionPriority::class)],
        ];
    }
}

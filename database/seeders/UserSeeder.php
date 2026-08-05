<?php

namespace Database\Seeders;

use App\Enums\UserRole;
use App\Enums\UserStatus;
use App\Models\Department;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Seed the demo users for local development only.
     */
    public function run(): void
    {
        $hr = Department::where('name', 'Human Resources')->first();
        $finance = Department::where('name', 'Finance')->first();
        $it = Department::where('name', 'Information Technology')->first();
        $procurement = Department::where('name', 'Procurement')->first();
        $operations = Department::where('name', 'Operations')->first();

        // Admin
        $admin = User::updateOrCreate(
            ['email' => 'admin@company.test'],
            [
                'name' => 'System Admin',
                'password' => Hash::make('password'),
                'role' => UserRole::Admin,
                'status' => UserStatus::Active,
                'department_id' => null,
            ]
        );

        // Managers
        $managers = [
            ['email' => 'hr.manager@company.test', 'name' => 'HR Manager', 'department' => $hr],
            ['email' => 'finance.manager@company.test', 'name' => 'Finance Manager', 'department' => $finance],
            ['email' => 'it.manager@company.test', 'name' => 'IT Manager', 'department' => $it],
            ['email' => 'procurement.manager@company.test', 'name' => 'Procurement Manager', 'department' => $procurement],
            ['email' => 'operations.manager@company.test', 'name' => 'Operations Manager', 'department' => $operations],
        ];

        foreach ($managers as $m) {
            $manager = User::updateOrCreate(
                ['email' => $m['email']],
                [
                    'name' => $m['name'],
                    'password' => Hash::make('password'),
                    'role' => UserRole::Manager,
                    'status' => UserStatus::Active,
                    'department_id' => $m['department']?->id,
                ]
            );

            if ($m['department']) {
                $m['department']->update(['manager_id' => $manager->id]);
            }
        }

        // Employees
        $employees = [
            ['email' => 'employee@company.test', 'name' => 'Ahmad Mohammad', 'department' => $hr, 'job_title' => 'HR Specialist'],
            ['email' => 'hr.employee@company.test', 'name' => 'Sara Ali', 'department' => $hr, 'job_title' => 'HR Coordinator'],
            ['email' => 'finance.employee@company.test', 'name' => 'Omar Hassan', 'department' => $finance, 'job_title' => 'Accountant'],
            ['email' => 'it.employee@company.test', 'name' => 'Layla Ibrahim', 'department' => $it, 'job_title' => 'Support Engineer'],
        ];

        foreach ($employees as $e) {
            User::updateOrCreate(
                ['email' => $e['email']],
                [
                    'name' => $e['name'],
                    'password' => Hash::make('password'),
                    'role' => UserRole::Employee,
                    'status' => UserStatus::Active,
                    'department_id' => $e['department']?->id,
                    'job_title' => $e['job_title'],
                ]
            );
        }
    }
}

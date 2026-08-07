# Company Internal Transaction Management System — Transformation TODO

## Phase 1: Inspection and cleanup
- [x] Inspect project (Laravel 12, PHP 8.2, Sanctum, PHPUnit, Pint)
- [x] Remove Baladna-specific business code
- [x] Remove obsolete enums, models, controllers, requests, resources, policies, services, factories, seeders, migrations, tests
- [x] Update project name / config (APP_NAME, composer description)
- [x] Keep application bootable

## Phase 2: Core organization
- [x] Create enums (UserRole, UserStatus, TransactionPriority, TransactionStatus, WorkflowStepStatus, TransactionHistoryAction, NotificationType)
- [x] Create departments (model + migration)
- [x] Transform users and roles (role + status + department + leave fields)
- [x] Update authentication (login/logout/logout-all/me/update/password)
- [x] Create admin user management
- [x] Create department APIs
- [x] Create seeders and factories

## Phase 3: Transaction configuration
- [x] Create transaction types
- [x] Create workflow definitions
- [x] Create admin workflow APIs
- [x] Add validation and policies
- [x] Seed workflow configurations

## Phase 4: Transactions
- [x] Create transactions
- [x] Create workflow snapshots
- [x] Create history
- [x] Create attachments
- [x] Implement transaction CRUD
- [x] Implement submission and resubmission
- [x] Implement filters and pagination

## Phase 5: Manager workflow
- [x] Implement manager authorization
- [x] Implement approve / return / reject / complete
- [x] Add database locking
- [x] Add workflow notifications

## Phase 6: Notifications and dashboards
- [x] Create notification APIs
- [x] Create employee / manager / admin dashboards

## Phase 7: Tests and documentation
- [x] Remove all obsolete tests
- [x] Add complete new tests
- [ ] Rewrite README
- [ ] Rewrite API_REFERENCE
- [ ] Replace API collection (Postman)
- [ ] Add React integration examples
- [ ] Add ER and workflow diagrams

## Phase 8: Final cleanup
- [x] Run migrate:fresh --seed
- [x] Run all tests
- [x] Run Laravel Pint
- [x] Search for obsolete Baladna terms
- [x] Check routes
- [x] Verify storage upload / CORS
- [ ] Provide Git reinitialization commands

# Company Internal Transaction Management System — Transformation TODO

## Phase 1: Inspection and cleanup
- [x] Inspect project (Laravel 12, PHP 8.2, Sanctum, PHPUnit, Pint)
- [ ] Remove Baladna-specific business code
- [ ] Remove obsolete enums, models, controllers, requests, resources, policies, services, factories, seeders, migrations, tests
- [ ] Update project name / config (APP_NAME, composer description)
- [ ] Keep application bootable

## Phase 2: Core organization
- [ ] Create enums (UserRole, UserStatus, TransactionPriority, TransactionStatus, WorkflowStepStatus, TransactionHistoryAction, NotificationType)
- [ ] Create departments (model + migration)
- [ ] Transform users and roles (role + status + department + leave fields)
- [ ] Update authentication (login/logout/logout-all/me/update/password)
- [ ] Create admin user management
- [ ] Create department APIs
- [ ] Create seeders and factories

## Phase 3: Transaction configuration
- [ ] Create transaction types
- [ ] Create workflow definitions
- [ ] Create admin workflow APIs
- [ ] Add validation and policies
- [ ] Seed workflow configurations

## Phase 4: Transactions
- [ ] Create transactions
- [ ] Create workflow snapshots
- [ ] Create history
- [ ] Create attachments
- [ ] Implement transaction CRUD
- [ ] Implement submission and resubmission
- [ ] Implement filters and pagination

## Phase 5: Manager workflow
- [ ] Implement manager authorization
- [ ] Implement approve / return / reject / complete
- [ ] Add database locking
- [ ] Add workflow notifications

## Phase 6: Notifications and dashboards
- [ ] Create notification APIs
- [ ] Create employee / manager / admin dashboards

## Phase 7: Tests and documentation
- [ ] Remove all obsolete tests
- [ ] Add complete new tests
- [ ] Rewrite README
- [ ] Rewrite API_REFERENCE
- [ ] Replace API collection (Postman)
- [ ] Add React integration examples
- [ ] Add ER and workflow diagrams

## Phase 8: Final cleanup
- [ ] Run migrate:fresh --seed
- [ ] Run all tests
- [ ] Run Laravel Pint
- [ ] Search for obsolete Baladna terms
- [ ] Check routes
- [ ] Verify storage upload / CORS
- [ ] Provide Git reinitialization commands

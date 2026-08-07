# Mu'amalati Platform — Diagrams

Render these Mermaid diagrams in any Mermaid-compatible viewer (VS Code + Mermaid extension, GitHub, mermaid.live).

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    DEPARTMENTS ||--o{ USERS : "belongs to"
    DEPARTMENTS ||--o{ TRANSACTIONS : "source"
    DEPARTMENTS ||--o{ TRANSACTIONS : "destination"
    DEPARTMENTS ||--o{ TRANSACTIONS : "current"
    DEPARTMENTS ||--o{ TRANSACTION_TYPE_WORKFLOW_STEPS : "approver"
    USERS ||--o{ TRANSACTIONS : "creates"
    USERS ||--o{ TRANSACTION_WORKFLOW_STEPS : "reviews"
    USERS ||--o{ TRANSACTION_ATTACHMENTS : "uploads"
    USERS ||--o{ NOTIFICATIONS : "receives"
    TRANSACTION_TYPES ||--o{ TRANSACTIONS : "categorizes"
    TRANSACTION_TYPES ||--o{ TRANSACTION_TYPE_WORKFLOW_STEPS : "defines"
    TRANSACTIONS ||--o{ TRANSACTION_WORKFLOW_STEPS : "has snapshot"
    TRANSACTIONS ||--o{ TRANSACTION_HISTORIES : "has trail"
    TRANSACTIONS ||--o{ TRANSACTION_ATTACHMENTS : "has files"
    TRANSACTIONS ||--o{ NOTIFICATIONS : "triggers"

    DEPARTMENTS {
        int id PK
        string name
        string code
        string status
    }
    USERS {
        int id PK
        int department_id FK
        string name
        string email
        string role
        string status
        string job_title
        int annual_leave_days
        int used_leave_days
    }
    TRANSACTION_TYPES {
        int id PK
        string code
        string name_en
        string name_ar
        string status
    }
    TRANSACTION_TYPE_WORKFLOW_STEPS {
        int id PK
        int transaction_type_id FK
        int department_id FK
        int step_order
        string name
    }
    TRANSACTIONS {
        int id PK
        string transaction_number UK
        int transaction_type_id FK
        int created_by FK
        int source_department_id FK
        int destination_department_id FK
        int current_department_id FK
        int current_workflow_step_id FK
        string title
        text description
        string priority
        string status
        timestamps submitted_at approved_at rejected_at returned_at completed_at
    }
    TRANSACTION_WORKFLOW_STEPS {
        int id PK
        int transaction_id FK
        int reviewer_id FK
        int step_order
        string name
        string status
        text comment
        timestamp reviewed_at
    }
    TRANSACTION_HISTORIES {
        int id PK
        int transaction_id FK
        int performer_id FK
        string action
        string old_status
        string new_status
        string workflow_step_name
        text comment
    }
    TRANSACTION_ATTACHMENTS {
        int id PK
        int transaction_id FK
        int uploader_id FK
        string original_name
        string file_path
        string mime_type
        int file_size
    }
    NOTIFICATIONS {
        int id PK
        int user_id FK
        int transaction_id FK
        string title
        text message
        string type
        boolean is_read
        timestamp read_at
    }
```

---

## 2. Transaction Workflow (State Machine)

```mermaid
stateDiagram-v2
    [*] --> Draft: POST /transactions

    Draft --> Pending: POST /transactions/{id}/submit
    Draft --> [*]: DELETE (owner)

    Pending --> Pending: Manager approves (next step)
    Pending --> Returned: Manager returns
    Pending --> Rejected: Manager rejects
    Pending --> Approved: Final step approved

    Returned --> Pending: POST /transactions/{id}/resubmit
    Returned --> [*]: DELETE (owner)

    Approved --> Completed: POST /admin/transactions/{id}/complete
    Approved --> [*]

    Rejected --> [*]
    Completed --> [*]
```

---

## 3. Workflow Approval Flow (Sequence)

```mermaid
sequenceDiagram
    participant E as Employee
    participant API as API
    participant M1 as Manager (Step 1)
    participant M2 as Manager (Step 2)
    participant A as Admin

    E->>API: POST /transactions (draft)
    API-->>E: 201 draft
    E->>API: POST /transactions/{id}/submit
    API-->>M1: Notification: pending approval
    API-->>E: 200 pending

    M1->>API: POST /manager/transactions/{id}/approve
    API-->>M2: Notification: next step
    API-->>M1: 200 (step approved)

    M2->>API: POST /manager/transactions/{id}/approve
    API-->>E: Notification: approved
    API-->>M2: 200 (final → approved)

    A->>API: POST /admin/transactions/{id}/complete
    API-->>E: Notification: completed
    API-->>A: 200 completed
```

---

## 4. Return / Resubmit Flow (Sequence)

```mermaid
sequenceDiagram
    participant E as Employee
    participant API as API
    participant M as Manager

    E->>API: POST /transactions/{id}/submit
    API-->>M: Notification: pending
    M->>API: POST /manager/transactions/{id}/return (comment)
    API-->>E: Notification: returned
    API-->>M: 200 returned

    E->>API: PATCH /transactions/{id} (edit)
    E->>API: POST /transactions/{id}/resubmit
    API-->>M: Notification: pending (same step)
    API-->>E: 200 pending

# EKA-AI v7.0 Repository Structure

```text
eka-ai-7.0/
├── app/                          # Main backend application
│   ├── ai/                       # AI/ML services
│   │   ├── llm_client.py
│   │   ├── summarization.py
│   │   └── intelligence_service.py
│   ├── approvals/                # Approval workflow module
│   │   ├── models.py
│   │   ├── router.py
│   │   └── service.py
│   ├── core/                     # Core services
│   │   ├── config.py            # Application configuration
│   │   ├── dependencies.py      # FastAPI dependencies
│   │   ├── notifications.py     # Email/SMS service (P2-3)
│   │   ├── notification_router.py
│   │   └── rbac.py              # Role-based access control
│   ├── data_privacy/            # GDPR/privacy compliance
│   ├── db/                      # Database
│   │   ├── base.py              # SQLAlchemy base models
│   │   ├── models.py            # Database models
│   │   └── session.py           # Database session management
│   ├── i18n/                    # Internationalization
│   ├── modules/                 # Business logic modules
│   │   ├── catalog/             # Parts/inventory catalog
│   │   ├── dashboard/           # Analytics & KPIs
│   │   ├── invoices/            # Invoice management
│   │   │   ├── pdf_generator.py # PDF generation (P2-1)
│   │   │   ├── router.py
│   │   │   ├── schema.py
│   │   │   └── service.py
│   │   ├── job_cards/           # Job card workflow
│   │   │   ├── model.py
│   │   │   ├── router.py
│   │   │   ├── schema.py
│   │   │   └── service.py
│   │   ├── mg_engine/           # MG calculation engine
│   │   │   ├── deterministic_engine.py
│   │   │   ├── model.py
│   │   │   ├── router.py
│   │   │   └── schema.py
│   │   ├── operator/            # Operator AI
│   │   │   ├── intent_parser.py # NLU parser (P1-3)
│   │   │   ├── model.py
│   │   │   ├── router.py
│   │   │   ├── schema.py
│   │   │   └── tool_handler.py
│   │   └── vehicles/            # Vehicle management
│   ├── security/                # Security utilities
│   ├── subscriptions/           # Subscription/plans
│   ├── utils/                   # Utility functions
│   └── workers/                 # Background workers
│
├── frontend/                    # React frontend
│   ├── dist/                    # Production build
│   ├── public/                  # Static assets
│   └── src/
│       ├── components/          # Reusable components
│       │   ├── EstimateForm.jsx
│       │   ├── FeatureGate.jsx
│       │   ├── JobCardStateTransition.jsx
│       │   ├── ShortcutsHelpModal.jsx
│       │   ├── Sidebar.jsx
│       │   └── SubscriptionUpgradeModal.jsx
│       ├── context/             # React contexts
│       │   ├── AuthContext.jsx
│       │   ├── SubscriptionContext.jsx
│       │   └── ThemeContext.jsx
│       ├── pages/               # Page components
│       │   ├── AnalyticsPage.jsx
│       │   ├── ApprovalsPage.jsx
│       │   ├── ChatPage.jsx
│       │   ├── DashboardPage.jsx
│       │   ├── InvoicesPage.jsx
│       │   ├── JobCardDetailPage.jsx
│       │   ├── JobsPage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── MGPage.jsx
│       │   ├── OperatorPage.jsx
│       │   └── VehiclesPage.jsx
│       ├── App.jsx
│       ├── api.js
│       └── index.css
│
├── migrations/                  # Alembic migrations
│   ├── env.py
│   └── versions/
│       ├── 0020_tenant_user_rls.py
│       └── cd8c1207ce67_add_variant_to_vehicles.py
│
├── tests/                       # Test suite
│   ├── conftest.py
│   ├── integration/             # Integration tests
│   │   ├── test_chat_api.py
│   │   ├── test_dashboard.py
│   │   ├── test_invoices.py
│   │   ├── test_job_cards.py
│   │   ├── test_mg_engine.py
│   │   ├── test_operator.py
│   │   └── test_summarize_endpoint.py
│   ├── load_test.py             # Locust load tests
│   └── unit/                    # Unit tests
│       ├── test_governance_gates.py
│       ├── test_subscription_enforcement.py
│       └── test_vehicle_service.py
│
├── scripts/                     # Utility scripts
│   └── seed_mg_engine.py
│
├── docker/                      # Docker configuration
│   └── Dockerfile
│
├── k8s/                         # Kubernetes manifests
│
├── experiments/                 # Experimental/prototype code
│   └── gemini_prototype.py      # ⚠️  Not for production
│
├── memory/                      # Project memory/docs
│   ├── CHANGELOG.md
│   └── PRD.md
│
├── .emergent/                   # Emergent behavior tracking
│
├── .github/                     # GitHub workflows
│
├── docs/                        # Documentation
│   ├── API_DOCUMENTATION.md
│   ├── ARCHITECTURE.md
│   ├── BRD_TDD_COMPLIANCE_AUDIT.md
│   ├── DEPLOYMENT_CHECKLIST.md
│   ├── P0_CHECKLIST.md
│   ├── P1_HIGH_PRIORITY_FIXES_PLAN.md
│   ├── P2_MEDIUM_PRIORITY_FIXES_PLAN.md
│   ├── PRODUCTION_READINESS_REPORT_v7.0.md
│   └── REPO_STRUCTURE.md
│
├── .env                         # Environment variables
├── .env.example                 # Example environment
├── .gitignore                   # Git ignore rules
├── alembic.ini                  # Alembic configuration
├── docker-compose.yml           # Docker Compose
├── requirements.txt             # Python dependencies
└── README.md                    # Main README

```text

## Module Dependencies

```text

app/
├── modules/
│   ├── job_cards/ → vehicles, approvals, invoices
│   ├── invoices/ → job_cards
│   ├── mg_engine/ → vehicles
│   ├── operator/ → job_cards, vehicles
│   └── dashboard/ → job_cards, invoices, vehicles

```text

## Key Files

| File | Purpose |
| ---------------- | ------------------------ |
| `app/main.py` | FastAPI application entry point |
| `app/core/config.py` | Application settings |
| `frontend/src/App.jsx` | React app root |
| `requirements.txt` | Python dependencies |
| `alembic.ini` | Database migration config |

## Testing

```bash

# Run all tests

pytest tests/

# Run integration tests only

pytest tests/integration/

# Run with coverage

pytest --cov=app tests/

```text

## Development

```bash

# Backend

uvicorn app.main:app --reload --port 8001

# Frontend

cd frontend && npm run dev

# Database migrations

alembic revision --autogenerate -m "description"
alembic upgrade head

```text

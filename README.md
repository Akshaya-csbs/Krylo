# SheBuilds-Hackathon


flowchart TD

subgraph group_frontend["Frontend"]
  node_frontend_entry["App entry &amp; layout<br/>Next.js app<br/>[page.tsx]"]
  node_dashboard["Dashboard shell<br/>dashboard coordinator"]
  node_analysis_views["Analysis views<br/>dashboard views"]
  node_decision_views["Decision-support views<br/>dashboard views"]
end

subgraph group_api["Backend API"]
  node_backend_app["Backend application<br/>FastAPI entry<br/>[main.py]"]
  node_api_router["API router<br/>route aggregator<br/>[router.py]"]
  node_route_modules["Product routes<br/>HTTP routes<br/>[brands.py]"]
  node_api_dependencies["Shared dependencies<br/>request dependencies<br/>[deps.py]"]
  node_schemas["API contracts<br/>request/response schemas<br/>[brand.py]"]
end

subgraph group_services["Workflows"]
  node_domain_workflows["Brand &amp; campaign workflows<br/>domain services<br/>[brand_service.py]"]
  node_job_dashboard["Jobs &amp; dashboard aggregation<br/>application services<br/>[job_service.py]"]
end

subgraph group_ai["AI Pipeline"]
  node_ai_service["AI analysis orchestration<br/>analysis service"]
  node_ai_analyzers{{"Groq &amp; multimodal analyzers<br/>AI integrations<br/>[groq_analyzer.py]"}}
end

subgraph group_data["Data &amp; Storage"]
  node_database[("Database setup<br/>relational persistence<br/>[database.py]")]
  node_core_models["Core entities<br/>ORM models<br/>[brand.py]"]
  node_analysis_models["Analysis entities<br/>ORM models<br/>[identity.py]"]
  node_asset_storage[("Brand asset storage<br/>local storage")]
  node_storage_utils["Storage &amp; security utilities<br/>infrastructure utilities<br/>[storage.py]"]
end

node_frontend_entry -->|"renders"| node_dashboard
node_dashboard -->|"hosts"| node_analysis_views
node_dashboard -->|"hosts"| node_decision_views
node_dashboard -->|"API requests"| node_api_router
node_backend_app -->|"mounts"| node_api_router
node_api_router -->|"dispatches"| node_route_modules
node_route_modules -->|"uses"| node_api_dependencies
node_route_modules -->|"validates with"| node_schemas
node_route_modules -->|"invokes"| node_domain_workflows
node_route_modules -->|"analysis endpoints"| node_ai_service
node_domain_workflows -->|"schedules &amp; aggregates"| node_job_dashboard
node_domain_workflows -->|"manages"| node_core_models
node_domain_workflows -->|"produces"| node_analysis_models
node_domain_workflows -->|"ingests assets"| node_asset_storage
node_job_dashboard -->|"persists jobs"| node_database
node_ai_service -->|"orchestrates"| node_ai_analyzers
node_ai_service -->|"stores results"| node_analysis_models
node_ai_service -->|"analyzes materials"| node_asset_storage
node_storage_utils -->|"reads &amp; writes"| node_asset_storage
node_core_models -->|"mapped to"| node_database
node_analysis_models -->|"mapped to"| node_database

click node_frontend_entry "https://github.com/akshaya-csbs/krylo/blob/main/frontend/src/app/page.tsx"
click node_dashboard "https://github.com/akshaya-csbs/krylo/blob/main/frontend/src/components/dashboard/DashboardClient.tsx"
click node_analysis_views "https://github.com/akshaya-csbs/krylo/blob/main/frontend/src/components/dashboard/BrandIdentityView.tsx"
click node_decision_views "https://github.com/akshaya-csbs/krylo/blob/main/frontend/src/components/dashboard/TrendAnalyticsView.tsx"
click node_backend_app "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/main.py"
click node_api_router "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/api/router.py"
click node_route_modules "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/api/brands.py"
click node_api_dependencies "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/api/deps.py"
click node_schemas "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/schemas/brand.py"
click node_domain_workflows "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/services/brand_service.py"
click node_job_dashboard "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/services/job_service.py"
click node_ai_service "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/services/ai_analysis_service.py"
click node_ai_analyzers "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/ai/groq_analyzer.py"
click node_database "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/database.py"
click node_core_models "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/models/brand.py"
click node_analysis_models "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/models/identity.py"
click node_asset_storage "https://github.com/akshaya-csbs/krylo/tree/main/backend/storage/brands"
click node_storage_utils "https://github.com/akshaya-csbs/krylo/blob/main/backend/app/utils/storage.py"

classDef toneNeutral fill:#f8fafc,stroke:#334155,stroke-width:1.5px,color:#0f172a
classDef toneBlue fill:#dbeafe,stroke:#2563eb,stroke-width:1.5px,color:#172554
classDef toneAmber fill:#fef3c7,stroke:#d97706,stroke-width:1.5px,color:#78350f
classDef toneMint fill:#dcfce7,stroke:#16a34a,stroke-width:1.5px,color:#14532d
classDef toneRose fill:#ffe4e6,stroke:#e11d48,stroke-width:1.5px,color:#881337
classDef toneIndigo fill:#e0e7ff,stroke:#4f46e5,stroke-width:1.5px,color:#312e81
classDef toneTeal fill:#ccfbf1,stroke:#0f766e,stroke-width:1.5px,color:#134e4a
class node_frontend_entry,node_dashboard,node_analysis_views,node_decision_views toneBlue
class node_backend_app,node_api_router,node_route_modules,node_api_dependencies,node_schemas toneAmber
class node_domain_workflows,node_job_dashboard toneMint
class node_ai_service,node_ai_analyzers toneRose
class node_database,node_core_models,node_analysis_models,node_asset_storage,node_storage_utils toneIndigo

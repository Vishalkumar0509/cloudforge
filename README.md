# CloudForge — Cloud-Native Application & DevOps Project

CloudForge is a containerized full-stack application deployed on local Kubernetes using Docker Desktop, Helm and Argo CD. The project has a formal **v1.0.0 release** and subsequent **v1.0.1 backend** and **v1.0.3 frontend image iterations**.

The project demonstrates application development, containerization, Kubernetes orchestration, GitOps-based deployments, CI/CD automation, monitoring, persistent storage and container security hardening.

The application consists of a React frontend, Django REST API and PostgreSQL database, supported by Prometheus, Grafana and Alertmanager.

| Item | Status |
|---|---|
| Current deployment | Local Docker Desktop Kubernetes |
| Latest formal release | v1.0.0 |
| Current backend image | v1.0.1 |
| Current frontend image | v1.0.3 |
| Latest formal Git tag | v1.0.0 |
| Argo CD status | Synced and Healthy |
| AWS deployment | Offline; AWS infrastructure work is historical |

The backend v1.0.1 and frontend v1.0.3 are subsequent local image iterations. They are not separate formal GitHub releases or Git tags. The Helm chart metadata remains at version 1.0.0.



## Screenshots

### CloudForge application
![CloudForge application](docs/screenshots/application.png)

### Argo CD GitOps dashboard
![Argo CD GitOps dashboard](docs/screenshots/argocd-gitops.png)

### Grafana Local Monitoring
![Grafana Local Monitoring dashboard](docs/screenshots/grafana-health.png)

### Grafana Kubernetes monitoring

**Part 1**
![Grafana Kubernetes monitoring dashboard - part 1](docs/screenshots/grafana-performance-1.png)

**Part 2**
![Grafana Kubernetes monitoring dashboard - part 2](docs/screenshots/grafana-performance-2.png)

### Kubernetes workloads
![CloudForge Kubernetes workloads](docs/screenshots/kubernetes-workloads.png)

### Prometheus targets
![Prometheus targets showing active scrape status](docs/screenshots/prometheus-targets.png)

---

## Table of Contents

- [Screenshots](#screenshots)

1. [Architecture](#architecture)
2. [Technology Stack](#technology-stack)
3. [Application Features](#application-features)
4. [Repository Structure](#repository-structure)
5. [Run Locally with Docker Compose](#run-locally-with-docker-compose)
6. [Kubernetes Deployment](#kubernetes-deployment)
7. [Helm and Argo CD GitOps](#helm-and-argo-cd-gitops)
8. [PostgreSQL Backup and Disaster Recovery](#postgresql-backup-and-disaster-recovery)
9. [Monitoring and Alerting](#monitoring-and-alerting)
10. [Container Security](#container-security)
11. [CI/CD Pipeline](#cicd-pipeline)
12. [Release Management](#release-management)
13. [Verification Results](#verification-results)
14. [Rollback Strategy](#rollback-strategy)
15. [Historical AWS Deployment](#historical-aws-deployment)
16. [Terraform and Infrastructure Management](#terraform-and-infrastructure-management)
17. [Security and Operational Notes](#security-and-operational-notes)
18. [Current Scope and Limitations](#current-scope-and-limitations)
19. [Author](#author)

---

## Architecture

### Current local Kubernetes architecture

```mermaid
flowchart TB
    Browser["User Browser"]

    subgraph K8S["Docker Desktop Kubernetes"]
        subgraph TRAEFIK_NS["traefik namespace"]
            Traefik["Traefik Ingress<br/>host: localhost"]
        end

        subgraph CLOUD_NS["cloudforge namespace"]
            Frontend["React Frontend<br/>Service: 3000"]
            Backend["Django REST API<br/>Service: 8000"]
            DB[("PostgreSQL<br/>Service: 5432")]

            Prom["Prometheus<br/>Service: 9090"]
            Grafana["Grafana<br/>Service: 3000"]
            Alert["Alertmanager<br/>Service: 9093"]

            DBPVC[("postgres-data<br/>2 GiB hostpath PVC")]
            PromPVC[("prometheus-data<br/>2 GiB hostpath PVC")]
            GrafanaPVC[("grafana-data<br/>2 GiB hostpath PVC")]
            AlertPVC[("alertmanager-data<br/>2 GiB hostpath PVC")]

            Backend --> DB
            Prom -->|"Scrapes /metrics every 15s"| Backend
            Prom -->|"Scrapes itself"| Prom
            Grafana -->|"Queries default datasource"| Prom
            Prom -->|"Configured alerts"| Alert

            DB --- DBPVC
            Prom --- PromPVC
            Grafana --- GrafanaPVC
            Alert --- AlertPVC
        end

        subgraph ARGO_NS["argocd namespace"]
            Argo["Argo CD<br/>Manual sync"]
        end
    end

    Browser --> Traefik
    Traefik -->|"/"| Frontend
    Traefik -->|"/api"| Backend

    SMTP["External SMTP Relay"]
    Alert -->|"Email notifications"| SMTP

    subgraph GITOPS["GitHub CI and GitOps"]
        GitHub["GitHub Repository<br/>main branch"]
        Actions["GitHub Actions<br/>CI checks"]
        Helm["Helm Chart<br/>helm/cloudforge"]

        GitHub --> Actions
        GitHub -->|"Watches repository"| Argo
        Argo -->|"Renders chart"| Helm
    end

    Helm -->|"Applies manifests<br/>after manual sync"| K8S
```

### Application request flow

1. A browser accesses CloudForge through the local Traefik Ingress.
2. Requests to `/` are forwarded to the React frontend.
3. Requests to `/api/` are forwarded to the Django REST API.
4. Django communicates with PostgreSQL for application data.
5. Prometheus scrapes backend metrics from `/metrics`.
6. Grafana uses Prometheus as its metrics datasource.
7. Prometheus forwards configured alerts to Alertmanager.

### GitOps deployment flow

1. Code and Kubernetes configuration are maintained in GitHub.
2. GitHub Actions runs backend checks and frontend builds.
3. Argo CD monitors the GitHub repository.
4. Argo CD renders the Helm chart.
5. Changes are deployed through manual Argo CD synchronization.

The CloudForge Argo CD application uses manual synchronization rather than automatic deployment.

---

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React, Node.js |
| Backend | Python 3.12, Django, Django REST Framework |
| Application server | Gunicorn |
| Database | PostgreSQL 16 |
| Containerization | Docker, Docker Compose |
| Orchestration | Kubernetes (Docker Desktop) |
| Package management | Helm |
| GitOps | Argo CD |
| Ingress | Traefik |
| Monitoring | Prometheus |
| Dashboards | Grafana |
| Alert management | Alertmanager |
| CI/CD | GitHub Actions |
| Infrastructure as Code | Terraform |
| Cloud infrastructure | AWS ECS, Fargate, ECR, RDS, ALB |

---

## Application Features

- React-based frontend for managing notes.
- Full CRUD functionality: create, list, retrieve, update and delete notes.
- Django REST Framework API with list/create and detail/update/delete endpoints.
- PostgreSQL database persistence.
- Frontend form validation and error handling.
- Docker-based frontend and backend images.
- Kubernetes Deployments, Services and Ingress.
- Persistent storage for PostgreSQL and monitoring components.
- Helm-based application configuration.
- Argo CD GitOps integration.
- GitHub Actions backend and frontend CI checks.
- Prometheus metrics collection and alert rules.
- Grafana monitoring dashboards.
- Alertmanager notification routing.
- Non-root backend and frontend containers.
- Kubernetes health and readiness checks.
- Versioned application images and Git release tags.

---

## Repository Structure

```text
cloudforge/
│
├── .github/
│   └── workflows/
│       └── ci.yml
│
├── app/
│   ├── backend/
│   │   ├── core/
│   │   ├── notes/
│   │   ├── requirements/
│   │   ├── Dockerfile
│   │   ├── entrypoint.sh
│   │   └── manage.py
│   │
│   └── frontend/
│       └── notes-frontend/
│           ├── Dockerfile
│           └── package.json
│
├── helm/
│   └── cloudforge/
│       ├── Chart.yaml
│       ├── values.yaml
│       └── templates/
│           ├── 01-database.yaml
│           ├── 02-backend.yaml
│           ├── 03-frontend.yaml
│           ├── 04-prometheus.yaml
│           ├── 05-grafana.yaml
│           ├── 06-prometheus-rules.yaml
│           ├── 07-alertmanager.yaml
│           ├── 08-ingress.yaml
│           └── _helpers.tpl
│
├── k8s/
│   ├── 01-database.yaml
│   ├── 02-backend.yaml
│   ├── 03-frontend.yaml
│   ├── 04-monitoring.yaml
│   ├── 05-grafana.yaml
│   ├── 06-ingress.yaml
│   ├── 07-prometheus-rules.yaml
│   └── 08-alertmanager.yaml
│
├── monitoring/
│   └── prometheus.yml
│
├── terraform/
│   ├── main.tf
│   └── .terraform.lock.hcl
│
├── .env.example
├── .gitignore
├── docker-compose.yml
└── README.md
```

The `helm/cloudforge/` directory is the primary Kubernetes deployment configuration used by Argo CD.

The `k8s/` directory contains the separate Kubernetes manifest-based configuration.

---

## Run Locally with Docker Compose

### Prerequisites

- Git
- Docker Desktop
- Docker Compose plugin
- Python 3.12 (optional for local development outside Docker)
- Node.js 24 (optional for frontend development outside Docker)

### 1. Clone the repository

```bash
git clone https://github.com/Vishalkumar0509/cloudforge.git
cd cloudforge
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and configure the required local database and application settings.

Use local development credentials only. Never commit `.env` or production credentials.

### 3. Build and start the application

```bash
docker compose up --build -d
```

### 4. Verify containers

```bash
docker compose ps
```

### 5. Access the application

| Component | URL |
|---|---|
| React frontend | http://localhost:3000/ |
| Notes API | http://localhost:8000/api/notes/ |
| Backend health | http://localhost:8000/healthz/ |

These endpoints require the corresponding Docker Compose containers to be running.

### 6. Inspect logs

```bash
docker compose logs --tail=100
```

### 7. Stop the application

```bash
docker compose down
```

The normal `docker compose down` command retains named database volumes.

**Do not use `docker compose down -v` unless you deliberately intend to delete the database volume.**

---

## Kubernetes Deployment

CloudForge's current Kubernetes environment uses the Docker Desktop Kubernetes cluster. This is a local Kubernetes deployment, not Amazon EKS.

### Prerequisites

- Docker Desktop with Kubernetes enabled.
- `kubectl`
- Helm
- Argo CD installed in the cluster.
- Traefik Ingress Controller.
- Docker images available to the Kubernetes node.

### Application and monitoring components

The Kubernetes namespace is:

```text
cloudforge
```

The deployment includes:

| Component | Kubernetes resource |
|---|---|
| Backend | Deployment and Service |
| Frontend | Deployment and Service |
| PostgreSQL | Deployment, Service and PVC |
| Prometheus | Deployment, Service and ConfigMaps |
| Grafana | Deployment, Service and PVC |
| Alertmanager | Deployment, Service, ConfigMaps and PVC |
| Application routing | Traefik Ingress |

### Persistent storage

The local Kubernetes deployment uses persistent volume claims for stateful services:

| PVC | Component | Capacity | Access mode | Verification |
|---|---|---:|---|---|
| `postgres-data` | PostgreSQL | 2Gi | ReadWriteOnce | Bound |
| `prometheus-data` | Prometheus | 2Gi | ReadWriteOnce | Bound |
| `grafana-data` | Grafana | 2Gi | ReadWriteOnce | Bound |
| `alertmanager-data` | Alertmanager | 2Gi | ReadWriteOnce | Bound |

These claims use the local Docker Desktop Kubernetes storage provisioner. Local PVCs are not off-machine backups.

### Required Kubernetes Secrets

The application references locally created Kubernetes Secrets. Create these securely before deploying to a fresh cluster.

| Secret | Required keys |
|---|---|
| `cloudforge-db` | `POSTGRES_DB`, `POSTGRES_USERNAME`, `POSTGRES_PASSWORD` |
| `django-secret-key` | `DJANGO_SECRET_KEY` |
| `grafana-admin` | `admin-user`, `admin-password` |
| `grafana-smtp` | `username`, `password` |

Use secure credentials and an interactive creation process. Never commit Secret values or include them in application manifests.

If the Secrets already exist, do not overwrite them merely to repeat the deployment.

For a fresh cluster, create the namespace:

```bash
kubectl create namespace cloudforge
```

Create the required Secrets securely. This example stores credentials in temporary files with restricted permissions. Secret values are not passed as command-line arguments.

```bash
(
  set -eu
  umask 077
  secret_dir="$(mktemp -d)"
  trap 'rm -rf "$secret_dir"' EXIT

  read -r -p "Database name: " DB_NAME
  read -r -p "Database username: " DB_USER
  read -r -s -p "Database password: " DB_PASSWORD
  printf '\n'
  printf '%s' "$DB_NAME" > "$secret_dir/POSTGRES_DB"
  printf '%s' "$DB_USER" > "$secret_dir/POSTGRES_USERNAME"
  printf '%s' "$DB_PASSWORD" > "$secret_dir/POSTGRES_PASSWORD"
  kubectl create secret generic cloudforge-db -n cloudforge \
    --from-file=POSTGRES_DB="$secret_dir/POSTGRES_DB" \
    --from-file=POSTGRES_USERNAME="$secret_dir/POSTGRES_USERNAME" \
    --from-file=POSTGRES_PASSWORD="$secret_dir/POSTGRES_PASSWORD"
  unset DB_PASSWORD

  read -r -s -p "Django secret key: " DJANGO_KEY
  printf '\n'
  printf '%s' "$DJANGO_KEY" > "$secret_dir/DJANGO_SECRET_KEY"
  kubectl create secret generic django-secret-key -n cloudforge \
    --from-file=DJANGO_SECRET_KEY="$secret_dir/DJANGO_SECRET_KEY"
  unset DJANGO_KEY

  read -r -p "Grafana admin username: " GRAFANA_USER
  read -r -s -p "Grafana admin password: " GRAFANA_PASSWORD
  printf '\n'
  printf '%s' "$GRAFANA_USER" > "$secret_dir/admin-user"
  printf '%s' "$GRAFANA_PASSWORD" > "$secret_dir/admin-password"
  kubectl create secret generic grafana-admin -n cloudforge \
    --from-file=admin-user="$secret_dir/admin-user" \
    --from-file=admin-password="$secret_dir/admin-password"
  unset GRAFANA_PASSWORD

  read -r -p "SMTP email address: " SMTP_USER
  read -r -s -p "SMTP app password: " SMTP_PASSWORD
  printf '\n'
  printf '%s' "$SMTP_USER" > "$secret_dir/username"
  printf '%s' "$SMTP_PASSWORD" > "$secret_dir/password"
  kubectl create secret generic grafana-smtp -n cloudforge \
    --from-file=username="$secret_dir/username" \
    --from-file=password="$secret_dir/password"
  unset SMTP_PASSWORD
)
```

Verify Secret names without displaying their values:

```bash
kubectl get secrets -n cloudforge
```

Do not recreate existing Secrets. Use a unique Django secret key and an SMTP app password where required by your email provider.

### Build local release images

For a fresh local environment, build the application images:

Backend:

```bash
docker build \
  -t cloudforge-backend:v1.0.1 \
  ./app/backend
```

Frontend:

```bash
docker build \
  --build-arg VITE_API_URL= \
  -t cloudforge-frontend:v1.0.3 \
  ./app/frontend/notes-frontend
```

Verify the image tags:

```bash
docker image inspect cloudforge-backend:v1.0.1
docker image inspect cloudforge-frontend:v1.0.3
```

Ensure the Docker Desktop Kubernetes node can see both images before deploying. The Helm configuration uses `IfNotPresent`, which allows Kubernetes to use locally available images.

### Application access

The Traefik Ingress exposes the application at:

| Component | URL |
|---|---|
| Frontend | http://localhost/ |
| Notes API | http://localhost/api/notes/ |

The backend health endpoint is `/healthz/`. The current Ingress routes `/` to the frontend and `/api/` to the backend. Backend health and metrics can also be accessed through the backend Service port-forward documented in the Monitoring and Alerting section.

---

## Helm and Argo CD GitOps

CloudForge uses Helm for Kubernetes configuration and Argo CD for GitOps deployment.

### Helm chart structure

```text
helm/cloudforge/
├── Chart.yaml
├── values.yaml
└── templates/
    ├── 01-database.yaml
    ├── 02-backend.yaml
    ├── 03-frontend.yaml
    ├── 04-prometheus.yaml
    ├── 05-grafana.yaml
    ├── 06-prometheus-rules.yaml
    ├── 07-alertmanager.yaml
    ├── 08-ingress.yaml
    └── _helpers.tpl
```

### Release configuration

The Helm chart metadata in `Chart.yaml` remains at version 1.0.0 with appVersion 1.0.0:

```yaml
version: 1.0.0
appVersion: "1.0.0"
```

The current local application image configuration in `values.yaml` is:

```yaml
backend:
  image:
    repository: cloudforge-backend
    tag: v1.0.1
    pullPolicy: IfNotPresent

frontend:
  image:
    repository: cloudforge-frontend
    tag: v1.0.3
    pullPolicy: IfNotPresent
```

The backend v1.0.1 and frontend v1.0.3 images are local iterations; they have not been published to ECR.

### Validate the Helm chart

```bash
helm lint ./helm/cloudforge
```

Render the Kubernetes resources:

```bash
helm template cloudforge ./helm/cloudforge \
  --namespace cloudforge
```

Package the release:

```bash
helm package ./helm/cloudforge
```

### Argo CD application configuration

The CloudForge Argo CD Application uses:

| Setting | Configuration |
|---|---|
| Application | `cloudforge` |
| Namespace | `argocd` |
| Repository | `Vishalkumar0509/cloudforge` |
| Branch | `main` |
| Helm path | `helm/cloudforge` |
| Helm release | `cloudforge` |
| Destination namespace | `cloudforge` |
| Sync policy | Manual |

Argo CD tracks the Helm chart in GitHub and compares the desired configuration with the running Kubernetes resources.

Useful commands:

```bash
kubectl get application cloudforge -n argocd
```

```bash
kubectl get deployments -n cloudforge
```

```bash
kubectl get pods -n cloudforge
```

```bash
kubectl get pvc -n cloudforge
```

For deployments, review the Argo CD diff before performing a manual sync.

### Access Argo CD locally

Start a local port-forward:

```bash
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Open the Argo CD interface at:

```text
https://localhost:8080
```

Keep the port-forward terminal open while using the interface. Stop it with `Ctrl+C`.

**Important:** Do not use direct `helm upgrade` or `kubectl apply` to modify application resources managed by Argo CD. Use the GitOps workflow so the Git repository remains the source of truth.

---

## PostgreSQL Backup and Disaster Recovery

CloudForge uses scheduled PostgreSQL custom-format backups for its local
Docker Desktop Kubernetes database.

### Backup locations

Backups are maintained in two filesystem locations on the same computer:

- WSL backup directory: `~/.cloudforge-backups/postgres/`
- Windows backup directory: `CloudForgeBackups/postgres/` under the Windows user profile.

The directory structure contains:

```text
postgres/
├── daily/
│   ├── cloudforge-k8s-mydatabase-YYYY-MM-DD_HHMMSS.dump
│   └── corresponding .sha256 files
├── weekly/
│   ├── weekly backup archives
│   └── corresponding .sha256 files
└── backup.log
```

These are two copies on the same physical computer, not independent
off-site backups.

### Backup format and validation

The backup script uses PostgreSQL `pg_dump` with:

- Custom archive format (`-Fc`).
- Ownership excluded (`--no-owner`).
- ACLs excluded (`--no-acl`).
- A non-empty archive check.
- `pg_restore --list` archive integrity validation.
- SHA256 checksum generation and verification.

The script uses a lock to prevent overlapping runs. On exit, it removes
an unfinished local `.partial` archive. Failures after the archive is
finalized may leave an archive or copy that requires inspection.

### Schedule and startup recovery

The systemd timer is named:

`cloudforge-postgres-backup.timer`

Its configuration includes:

| Setting | Value |
|---|---|
| Daily schedule | 20:30 UTC (02:00 IST the following day) |
| Startup trigger | 2 minutes after the WSL systemd instance starts (`OnBootSec=2min`) |
| Missed-run handling | `Persistent=true` |
| Backup service | `cloudforge-postgres-backup.service` |
| Service timeout | 15 minutes |
| Retry | On failure, every 2 minutes; limited to 10 start attempts within 30 minutes |

The recovery script:

1. Checks that the Kubernetes context is `docker-desktop`.
2. Checks whether a verified backup pair already exists for the current IST date.
3. Waits for the PostgreSQL Deployment and pod to become ready.
4. Checks PostgreSQL connection readiness.
5. Runs the existing backup script if a verified backup pair is not already available.

The recovery script creates backups; it does not automatically restore or
overwrite the live database.

Windows Task Scheduler also contains a user-logon task that initializes
Ubuntu WSL. Docker Desktop is configured to launch at Windows sign-in.

### Retention policy

| Backup type | Retention |
|---|---:|
| Daily | 7 archives |
| Weekly | 4 archives |

Weekly snapshots are created on Sundays. Retention removes older archive
files and their associated checksum files.

### Backup inventory — November 27, 2026

The latest verified inventory contains:

| Location | Daily archives | Weekly archives | Checksum results |
|---|---:|---:|---:|
| WSL backup directory | 7 | 1 | 8/8 passed |
| Windows backup directory | 7 | 1 | 8/8 passed |

All 16 checksum files across both locations passed `sha256sum -c`.

The latest daily archive is `cloudforge-k8s-mydatabase-2026-11-27_091656.dump` (31,358 bytes). Its checksum passed in both WSL and Windows backup directories. The separately documented full restore test used the November 25 archive.

### Restore testing approach

Test restores against a separate temporary database, never directly against the live application database.

The November 25 restore verification below documents the completed isolated restore test.


### November 25, 2026 restore verification

The November 25 backup was restored successfully into a separate temporary
PostgreSQL database.

Verification included:

- SHA256 validation of the backup archive.
- `pg_restore --list` archive inspection.
- Full restore using `pg_restore --exit-on-error`.
- Successful restore in a single transaction.
- Row-count comparison across all 11 Django tables.
- Exact comparison of all six `notes_note` records, including IDs,
  titles, content and timestamps.
- Removal of the temporary restore-test database after verification.

All 11 table row counts matched the source database, and all six note
records matched exactly. The live application database was not overwritten.

### PostgreSQL pod restart verification

The PostgreSQL pod was deleted and Kubernetes created a replacement pod.
The original `postgres-data` PVC remained Bound with the same PVC UID and
volume identity.

After replacement:

- PostgreSQL readiness check succeeded.
- All six application notes remained present.
- The Notes API returned HTTP 200.
- The replacement PostgreSQL pod was Ready with zero restarts at verification.

This verified local persistent-volume recovery in addition to the separate
backup restore test.

### Backup limitations and security

- The WSL and Windows copies reside on the same physical computer.
- They do not protect against complete host-disk failure or site loss.
- The backup scripts do not encrypt archive files.
- Protect the host account, filesystem permissions and backup directories.
- Consider an encrypted off-site copy for stronger disaster recovery.
- A full restore was tested in a separate database; automatic production
  restoration has not been configured or tested.

## Monitoring and Alerting

CloudForge includes two separate monitoring environments:

1. Docker Compose monitoring for local development.
2. Kubernetes monitoring for the deployed CloudForge application.

### Kubernetes monitoring

| Component | Purpose |
|---|---|
| Prometheus | Metrics collection and alert rule evaluation |
| Grafana | Monitoring dashboards |
| Alertmanager | Alert routing and notifications |

Prometheus scrapes:

```text
backend:8000/metrics
```

Backend health endpoint:

```text
/healthz/
```

The monitoring stack includes the `CloudForge Kubernetes Monitoring` Grafana dashboard and the `CloudForgeBackendDown` Prometheus alert rule.

The backend-down rule evaluates `up{job="cloudforge-backend"} == 0` with a one-minute pending period and critical severity. Its expected state is inactive while the backend is healthy.

### Local Kubernetes port-forwards

Run each command in a separate terminal:

Backend:

```bash
kubectl port-forward -n cloudforge service/backend 18000:8000
```

Prometheus:

```bash
kubectl port-forward -n cloudforge service/prometheus 19090:9090
```

Grafana:

```bash
kubectl port-forward -n cloudforge service/grafana 13003:3000
```

Alertmanager:

```bash
kubectl port-forward -n cloudforge service/alertmanager 19093:9093
```

Access the services:

| Service | Local URL |
|---|---|
| Backend API | http://localhost:18000/api/notes/ |
| Backend health | http://localhost:18000/healthz/ |
| Backend metrics | http://localhost:18000/metrics |
| Prometheus | http://localhost:19090 |
| Grafana | http://localhost:13003 |
| Alertmanager | http://localhost:19093 |

Keep the port-forward terminal open while using the corresponding endpoint. Stop it with `Ctrl+C`.

### Monitoring verification

Prometheus readiness:

```bash
curl -sS http://localhost:19090/-/ready
```

Prometheus targets:

```bash
curl -sS http://localhost:19090/api/v1/targets
```

Grafana health:

```bash
curl -sS http://localhost:13003/api/health
```

Alertmanager readiness:

```bash
curl -sS http://localhost:19093/-/ready
```

### SMTP email notifications

Grafana and Alertmanager obtain SMTP credentials from the Kubernetes `grafana-smtp` Secret. The Secret contains `username` and `password` keys; credentials are not stored in the Helm values file or committed to Git.

Alertmanager generates its runtime configuration using the Secret-provided SMTP username and password. Its configuration supports resolved notifications as well as firing notifications.

A controlled Alertmanager test verified delivery of both a firing notification and its corresponding resolved notification by email. This was a controlled SMTP delivery test; it does not mean the actual backend-down alert rule was triggered.

### Docker Compose monitoring

The separate Docker Compose monitoring stack provides Prometheus and Grafana for local development.

Its historical local endpoints are:

| Service | URL |
|---|---|
| Grafana | http://localhost:3001 |
| Prometheus | http://localhost:9090 |
| Prometheus targets | http://localhost:9090/targets |
| Backend metrics | http://localhost:8000/metrics |

The Docker Compose monitoring environment is not the Kubernetes monitoring environment or an AWS-hosted service.

---

## Container Security

The CloudForge backend v1.0.1 and frontend v1.0.3 images are the current deployed local Kubernetes image iterations. The formal v1.0.0 release images remain historical release artifacts.

### Backend security

| Setting | Value |
|---|---|
| Image | `cloudforge-backend:v1.0.1` |
| User | `cloudforge` |
| UID/GID | `10001` |
| Non-root enforcement | Enabled |
| Seccomp | `RuntimeDefault` |
| Privilege escalation | Disabled |
| Linux capabilities | All dropped |

### Frontend security

| Setting | Value |
|---|---|
| Image | `cloudforge-frontend:v1.0.3` |
| User | `node` |
| UID/GID | `1000` |
| Non-root enforcement | Enabled |
| Seccomp | `RuntimeDefault` |
| Privilege escalation | Disabled |
| Linux capabilities | All dropped |

The settings are applied through Kubernetes pod-level and container-level security contexts.

### Verification commands

Inspect the backend:

```bash
kubectl get deployment backend -n cloudforge -o yaml
```

Inspect the frontend:

```bash
kubectl get deployment frontend -n cloudforge -o yaml
```

Check the running backend identity:

```bash
kubectl exec -n cloudforge deployment/backend -- id
```

Check the running frontend identity:

```bash
kubectl exec -n cloudforge deployment/frontend -- id
```

These security settings apply to the hardened application containers. They should not be interpreted as a claim that every container in the project uses identical security settings.

---

## CI/CD Pipeline

Workflow file:

```text
.github/workflows/ci.yml
```

The GitHub Actions workflow runs on pushes and pull requests targeting `main`.

### CI jobs

**1. Backend Checks**

- Sets up Python 3.12.
- Installs backend requirements.
- Runs Django system checks.
- Runs the notes application tests.
- Uses PostgreSQL 16 as a test service.

**2. Frontend Build**

- Sets up Node.js 24.
- Installs dependencies using `npm ci`.
- Builds the React application.

**3. AWS publishing and deployment job**

The AWS job is conditional:

```yaml
if: github.event_name == 'push' &&
    github.ref == 'refs/heads/main' &&
    vars.ENABLE_AWS_DEPLOY == 'true'
```

When explicitly enabled, this job:

- Obtains AWS credentials using GitHub Actions OIDC.
- Authenticates with Amazon ECR.
- Builds and pushes backend and frontend images.
- Updates the ECS backend and frontend services.
- Waits for the ECS services to stabilize.

When `ENABLE_AWS_DEPLOY` is unset or not equal to `true`, the AWS job is skipped.

**Keep this variable disabled for local-only development and deployment.** Enabling it can trigger AWS publishing and ECS deployments.

### v1.0.0 release CI run

Release commit:

```text
a8195a94eab232626809756a7532747ef7d52672
```

Workflow run:

```text
42182510547
```

| Job | Result |
|---|---|
| Backend Checks | Success |
| Frontend Build | Success |
| Build and Push Docker Images to ECR | Skipped |

Latest follow-up CI run on November 8, 2026:

- Commit: `8e83acb`
- Workflow run: `42461034073`
- Result: Successful

GitHub Actions CLI commands:

```bash
gh run list --repo Vishalkumar0509/cloudforge --branch main --limit 5
```

Inspect an individual run:

```bash
gh run view RUN_ID --repo Vishalkumar0509/cloudforge
```

---

## Release Management

CloudForge v1.0.0 is the first stable tagged release.

### Release metadata

| Item | Value |
|---|---|
| Application version | `1.0.0` |
| Helm chart version | `1.0.0` |
| Docker backend tag | `v1.0.0` |
| Docker frontend tag at formal release | `v1.0.0` |
| Current backend image iteration | `v1.0.1` |
| Current frontend image iteration | `v1.0.3` |
| Git tag | `v1.0.0` |
| Release commit | `a8195a94eab232626809756a7532747ef7d52672` |

### Versioned images

```text
cloudforge-backend:v1.0.0
cloudforge-frontend:v1.0.1
```

The formal v1.0.0 backend and frontend tags were created from the already-tested security-hardened images without rebuilding them. The frontend was subsequently updated to the local v1.0.1 image iteration.

The current deployed backend v1.0.1 and frontend v1.0.3 images are local Docker Desktop Kubernetes images. They have not been published to ECR. The formal v1.0.0 release tags remain historical release artifacts.

### Release tag verification

```bash
git show v1.0.0
```

```bash
git ls-remote --tags origin 'refs/tags/v1.0.0*'
```

The annotated Git tag is published to GitHub. A separate GitHub Release page and published container registry artifacts are separate distribution steps.

---

## Verification Results

The following results were verified during the CloudForge v1.0.0 local Kubernetes release process on November 6, 2026. Additional frontend, monitoring and SMTP verification was completed on November 7, 2026.

### Kubernetes workload status

All six Deployments were verified with one ready replica:

| Deployment | Result |
|---|---|
| Backend | 1/1 Ready |
| Frontend | 1/1 Ready |
| PostgreSQL | 1/1 Ready |
| Prometheus | 1/1 Ready |
| Grafana | 1/1 Ready |
| Alertmanager | 1/1 Ready |

### Application verification

- React frontend returned HTTP 200 through Traefik.
- Django Notes API returned HTTP 200.
- Four existing notes were returned by the API.
- Backend `/healthz/` endpoint returned HTTP 200.
- Backend successfully connected to PostgreSQL.
- Django reported no pending migrations.
- Existing PostgreSQL records remained accessible after the backend image rollout.

### November 7 follow-up verification

- Frontend Deployment updated to the local `cloudforge-frontend:v1.0.1` image and reached 1/1 ready.
- Frontend Ingress and Notes API Ingress both returned HTTP 200.
- The Notes application displayed five notes during browser verification.
- Prometheus reported both configured scrape targets UP (2/2).
- The `CloudForgeBackendDown` rule was loaded and healthy; it remained inactive while the backend was up.
- Grafana dashboard included backend status, HTTP request rate, response status, memory and CPU panels.
- Alertmanager accepted a controlled test alert, and both firing and resolved notification emails were received.

**GitOps status:** On November 8, 2026, the SMTP-related Helm template and values changes were committed and pushed in commit `8e83acb` (`fix(monitoring): secure SMTP configuration and document alerts`). Argo CD subsequently reported `Synced` and `Healthy` at revision `8e83acbd59dc881b91e05555b11ddb2dd1b4233c`. At the time of this GitOps verification, the local Git branch matched `origin/main` and the working tree was clean. This README documentation update is a subsequent, separate change.

### November 8 follow-up verification

The following checks were completed against the current local Kubernetes deployment:

- Frontend Ingress returned HTTP 200.
- Notes API Ingress returned HTTP 200.
- All six application and monitoring Deployments were verified with one ready replica each.
- Prometheus reported both active scrape targets as UP (2/2): `cloudforge-backend` and `prometheus`.
- Grafana health API reported database `ok` on version `11.4.0`.
- Alertmanager readiness endpoint returned HTTP 200 and `OK`.
- The `CloudForgeBackendDown` rule was loaded with health `ok`, state `inactive`, and a 60-second pending period.
- Argo CD reported `Synced` and `Healthy` at the latest Git commit.
- Git working tree was clean after removal of an accidental empty untracked file.

The inactive backend-down rule is expected while the backend target is healthy. The actual backend-down condition was not deliberately triggered during this verification.

### November 10 follow-up: persistence and runtime incident

- Alertmanager persistent storage was added to the Helm chart and committed in `0377ec4` (`feat: add persistent storage for Alertmanager`).
- Argo CD reported `Synced` and `Healthy` at revision `0377ec4cdb4fbfa635cc9ad975054ef51fc3c9b5`.
- All four application and monitoring PVCs (`postgres-data`, `prometheus-data`, `grafana-data` and `alertmanager-data`) were Bound at 2Gi with ReadWriteOnce access.
- Alertmanager's `/-/ready` endpoint returned `OK`; its Deployment had one available replica.
- All six application and monitoring Deployments were running with one ready replica each.

**Runtime incident:** On November 10, 2026, at approximately 05:52 UTC, all nine observed Kubernetes system containers and multiple CloudForge application containers terminated with `Error` and exit code `255` within the same one-second interval. The Kubernetes node subsequently reported Ready, with MemoryPressure, DiskPressure and PIDPressure all False. The WSL2 Ubuntu and Docker Desktop distributions were both running during follow-up checks.

The simultaneous termination pattern strongly suggests a shared Docker Desktop/WSL2 Kubernetes runtime interruption rather than independent application failures. The exact trigger was not established. The workloads were healthy again during verification; no manual restart was performed solely to clear historical restart counts.

### November 10 final reliability verification

- Added Kubernetes liveness probes for PostgreSQL (`pg_isready`), Grafana (`/api/health`) and Alertmanager (`/-/ready`) in commit `2353b2e` (`feat: add liveness probes for stateful services`).
- Helm validation completed successfully: `helm lint helm/cloudforge` reported zero chart failures, and Helm template rendering succeeded.
- Argo CD reported `Synced` and `Healthy` at revision `2353b2e7091d6d64be497f7d6c12f36eacc7a4c4`.
- All six CloudForge Deployments had one available replica, and all six CloudForge pods were Ready. All four 2Gi ReadWriteOnce PVCs remained Bound.
- PostgreSQL persistence was tested through the application API. A temporary test note was created, verified through the API and directly in PostgreSQL, and remained present after a PostgreSQL Deployment restart. The API returned HTTP 200 after the restart. The temporary test record was then removed; the five pre-existing notes remained.
- A PostgreSQL custom-format backup archive was created and its table of contents was successfully inspected with `pg_restore --list` (86 entries). At the time of this November 10 verification, a full restore into a separate database had not yet been tested. This was subsequently completed successfully on November 25; see the November 25 verification section below.
- GitHub Actions CI passed for commit `2353b2e` (run `42832329810`, approximately 40 seconds).

These checks validate the local Docker Desktop Kubernetes environment. They do not establish production readiness, an off-machine backup, or a tested database recovery procedure. The AWS deployment remains offline.

### Security verification

- Backend actual runtime identity: UID/GID 10001.
- Frontend actual runtime identity: UID/GID 1000.
- Both application containers ran as non-root.
- RuntimeDefault seccomp was configured.
- Privilege escalation was disabled.
- All Linux capabilities were dropped.
- Both hardened image rollouts completed with zero restarts on their new pods.

### GitOps and monitoring verification

- At the November 10 final verification, Argo CD reported `Synced` and `Healthy` at revision `2353b2e7091d6d64be497f7d6c12f36eacc7a4c4`.
- Prometheus server readiness passed.
- Prometheus backend and self-monitoring targets reported `up`.
- Grafana health endpoint reported database `ok`.
- Alertmanager readiness endpoint returned `OK`.

These results describe the verified local release. They do not mean that the AWS deployment is currently online.

---

### November 15 CRUD release verification

- Backend image v1.0.1 and frontend image v1.0.3 deployed successfully to local Docker Desktop Kubernetes.
- Backend automated tests passed: 8/8.
- Frontend automated tests passed: 6/6.
- Backend and frontend Kubernetes rollouts completed successfully.
- Both Deployments reached 1/1 ready replicas.
- Frontend and Notes API returned HTTP 200 through Traefik.
- Argo CD reported Synced and Healthy at commit `04d2012`.
- Browser-based CRUD verification passed:
  - Create: passed.
  - Read: passed.
  - Update: passed.
  - Delete: passed.
- The temporary CRUD verification note was deleted after testing.
- The six pre-existing notes remained visible after the CRUD tests.

These results were verified on the local Kubernetes environment. AWS deployment remains offline.

---

### November 25 final local reliability verification

The following additional checks were completed on November 25, 2026:

- All six CloudForge Deployments reported one available replica.
- All four persistent volume claims remained Bound at 2Gi.
- The PostgreSQL replacement pod became Ready and retained all six notes.
- The Notes API returned HTTP 200 and returned all six expected records.
- The PostgreSQL backup archive passed checksum and archive inspection.
- A full isolated restore succeeded, and all 11 table row counts matched.
- All six note records matched exactly between the source and restored databases.
- Daily and weekly WSL and Windows backup checksums passed: 16/16.
- The systemd backup timer was enabled and active.
- The backup service's latest recorded result was successful.
- Argo CD reported `Healthy` and `Synced` at revision
  `55a91b23e8bd45ac87ea99cf64678cac18551842`.
- All 21 Argo CD-managed resources reported `Synced`.
- The Git working tree was clean, and local `main` matched `origin/main`.
- The live backend and frontend images were `v1.0.1` and `v1.0.3`.
- The Notes API returned HTTP 200 during final verification.

**Runtime observation:** Five application and monitoring pods showed
historical container terminations with exit code `255` at approximately
04:57 UTC on November 25. The Kubernetes node was subsequently Ready,
without memory, disk or PID pressure. The previous frontend container log
was no longer available. A shared Docker Desktop or WSL2 runtime interruption
is a possible explanation, but the exact cause was not established.

**Startup testing limitation:** Windows logon startup settings, Docker
Desktop startup configuration, WSL2 status and systemd timer configuration
were inspected. A complete fresh Windows/WSL boot-recovery exercise has
not yet been performed.

These checks validate the local Docker Desktop Kubernetes environment.
They do not establish an AWS deployment or an off-site disaster-recovery
capability.

---

## Rollback Strategy

CloudForge uses Git and Argo CD as the source of truth for Kubernetes application configuration.

The known previous image tags from the v1.0.0 promotion are:

```text
cloudforge-backend:security-test
cloudforge-frontend:security-test
```

Those tags pointed to the same tested image contents as the corresponding v1.0.0 tags during this release.

### Recommended rollback approach

If a future application release causes problems:

1. Identify the last known-good image tags and Git commit.
2. Change the affected Helm image tag in `helm/cloudforge/values.yaml` to the verified previous image.
3. Increase the Helm chart version for the corrective release.
4. Run `helm lint` and `helm template`.
5. Commit and push the reviewed rollback configuration.
6. Review the Argo CD diff.
7. Manually sync the affected application Deployment.
8. Verify Kubernetes readiness, application health and database records.

Avoid using `kubectl rollout undo` as the permanent GitOps rollback method because Argo CD may reconcile the Deployment back to the configuration in Git.

**Rollback procedure status:** The previous image tags are available locally. A separate rollback exercise has not been documented as completed.

---

## Historical AWS Deployment

CloudForge was previously deployed in AWS region:

```text
ap-south-2
```

The historical architecture included:

- Amazon ECS with AWS Fargate.
- Amazon ECR repositories.
- Application Load Balancer.
- Amazon RDS for PostgreSQL.
- VPC, subnets and security groups.
- Terraform-managed infrastructure.
- GitHub Actions OIDC authentication.

The AWS application deployment has since been taken offline for cost control.

The last documented state recorded the following actions:

- Application Load Balancer deleted.
- ECS services scaled to zero.
- RDS instance stopped.

There is no currently verified public AWS application endpoint.

AWS should be considered a separate future deployment milestone. Before reactivating it, review infrastructure status, Terraform state, IAM permissions, image publishing and estimated costs.

---

## Terraform and Infrastructure Management

The Terraform configuration is maintained under:

```text
terraform/
```

The configuration describes historical AWS infrastructure, including networking, security groups, ECS services, ECR repositories, an Application Load Balancer and RDS PostgreSQL.

### Terraform validation

From the repository root:

```bash
cd terraform
terraform init
terraform validate
```

Inspect the working state before any plan:

```bash
terraform state list
```

A fresh Git clone does not contain the local Terraform state. Without the correct state, Terraform may propose creating or replacing infrastructure.

**Never apply a Terraform plan without confirming the correct state and reviewing every proposed action.**

Terraform state files, backup files, `.terraform/` and production variable files are excluded from Git.

Never commit state files, credentials or production secrets.

---

## Security and Operational Notes

- Never commit `.env` files or Kubernetes Secret values.
- Keep Django secret keys and PostgreSQL credentials out of Git.
- Protect Terraform state and backup files.
- Use IAM least privilege for AWS operations.
- Keep the AWS publishing/deployment workflow disabled during local-only work.
- The current local application is served over HTTP.
- Local Kubernetes PVC storage is not a substitute for off-machine database backups.
- Docker Desktop and its Kubernetes cluster must be running for the local deployment to remain available.
- Review image tags and Argo CD differences before deployment.
- Do not delete PostgreSQL or Grafana PVCs as part of ordinary troubleshooting.

---

## Current Scope and Limitations

The formal CloudForge v1.0.0 release and subsequent backend and frontend image iterations demonstrate:

- Full-stack application development.
- Full CRUD note management.
- Docker containerization.
- Kubernetes deployment and persistent storage.
- Helm chart management.
- Argo CD GitOps workflows.
- GitHub Actions CI.
- Prometheus, Grafana and Alertmanager monitoring.
- Container security hardening.
- Versioned image and release management.
- Historical AWS and Terraform infrastructure work.

The current verified deployment is local Kubernetes on Docker Desktop. AWS deployment is offline, and the versioned application images are available in the local image store rather than a published container registry.

---

## Author

**Vishal Kumar Anumasa**

- GitHub: https://github.com/Vishalkumar0509
- Project repository: https://github.com/Vishalkumar0509/cloudforge

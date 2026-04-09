# 🚀 DevOps Practice Task List — Fast Food Delivery Platform

A hands-on, progressive task list to practice **every major DevOps concept** using your microservices project. Work through these in order — each phase builds on the previous one.

---

## Phase 1: Docker Fundamentals

> [!TIP]
> Start here. Docker is the foundation of everything that follows.

### 1.1 — Dockerize Individual Services
- [ ] Write a `Dockerfile` for **user-service**
  - Use `node:18-alpine` base image
  - Set working directory, copy `package.json`, run `npm install`, copy source, expose port, define `CMD`
- [ ] Write a `Dockerfile` for **restaurant-service**
- [ ] Write a `Dockerfile` for **order-service**
- [ ] Write a `Dockerfile` for **api-gateway**
- [ ] Write a `Dockerfile` for **frontend** (multi-stage build: build with Node, serve with Nginx)
- [ ] Understand and practice `.dockerignore` for each service

### 1.2 — Docker Build & Run
- [ ] Build each image manually: `docker build -t user-service:v1 .`
- [ ] Run each container individually with proper port mapping (`-p`)
- [ ] Pass environment variables using `-e` and `--env-file`
- [ ] Practice `docker logs`, `docker exec -it`, `docker inspect`
- [ ] Practice `docker stop`, `docker rm`, `docker rmi`

### 1.3 — Docker Image Optimization
- [ ] Compare image sizes: `node:18` vs `node:18-alpine`
- [ ] Implement **multi-stage builds** for frontend (build stage → Nginx serve stage)
- [ ] Use proper **layer caching**: copy `package.json` first, then `npm install`, then copy source
- [ ] Practice tagging: `docker tag user-service:v1 user-service:latest`

### 1.4 — Docker Networking
- [ ] Create a custom Docker network: `docker network create food-delivery`
- [ ] Run all services on the same network
- [ ] Test container-to-container communication using **container names** as hostnames
- [ ] Understand bridge vs host networking

### 1.5 — Docker Volumes
- [ ] Create a named volume for MongoDB data persistence
- [ ] Mount the volume when running MongoDB container
- [ ] Stop and restart MongoDB — verify data persists
- [ ] Practice bind mounts for local development (mount source code into container)

---

## Phase 2: Docker Compose

> [!TIP]
> Compose lets you define and run all services with a single command.

### 2.1 — Basic Compose File
- [ ] Write `docker-compose.yml` with all 5 app services + MongoDB
- [ ] Define `services`, `ports`, `environment`, `depends_on`
- [ ] Start everything: `docker-compose up -d`
- [ ] Practice `docker-compose logs -f`, `docker-compose ps`
- [ ] Stop everything: `docker-compose down`

### 2.2 — Compose Advanced Features
- [ ] Define a custom **network** in compose file
- [ ] Add **named volumes** for MongoDB data persistence
- [ ] Use **environment files** (`.env`) with `env_file` directive
- [ ] Add **health checks** for each service
- [ ] Set **restart policies** (`restart: unless-stopped`)
- [ ] Use `depends_on` with **condition: service_healthy**

### 2.3 — Multi-Environment Compose
- [ ] Create `docker-compose.override.yml` for **development** (bind mounts, nodemon)
- [ ] Create `docker-compose.prod.yml` for **production** (no source mounts, optimized images)
- [ ] Practice merging: `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up`

### 2.4 — Compose Build & Scaling
- [ ] Use `build` context in compose instead of pre-built images
- [ ] Scale a service: `docker-compose up -d --scale restaurant-service=3`
- [ ] Understand the limitations of compose scaling (no load balancer)

---

## Phase 3: Container Registry

> [!TIP]
> Push your images to a registry so they can be pulled from anywhere.

### 3.1 — Docker Hub
- [ ] Create a Docker Hub account
- [ ] Tag images properly: `yourusername/food-delivery-user-service:v1`
- [ ] `docker login` and `docker push` each image
- [ ] `docker pull` on a different machine or after removing local images
- [ ] Practice image versioning: `:v1`, `:v2`, `:latest`

### 3.2 — Private Registry (Optional)
- [ ] Set up a local registry: `docker run -d -p 5050:5000 registry:2`
- [ ] Push and pull images from private registry
- [ ] Understand when to use ECR / GCR / ACR (cloud registries)

---

## Phase 4: Linux & Shell Scripting

> [!TIP]
> DevOps engineers live in the terminal. Get comfortable.

### 4.1 — Essential Linux Commands
- [ ] Practice `ssh`, `scp`, `rsync` to remote servers
- [ ] File management: `ls`, `cd`, `cp`, `mv`, `rm`, `find`, `grep`
- [ ] Process management: `ps aux`, `top`, `htop`, `kill`, `systemctl`
- [ ] Networking: `curl`, `wget`, `netstat`, `ss`, `ping`, `traceroute`
- [ ] Permissions: `chmod`, `chown`, `umask`
- [ ] Logs: `tail -f`, `journalctl`, `cat`, `less`

### 4.2 — Shell Scripts for Automation
- [ ] Write `scripts/build-all.sh` — builds all Docker images
- [ ] Write `scripts/start-local.sh` — starts all services locally (npm start)
- [ ] Write `scripts/health-check.sh` — curls each service's `/health` endpoint
- [ ] Write `scripts/seed-data.sh` — seeds sample restaurant data
- [ ] Write `scripts/cleanup.sh` — stops containers, removes images/volumes
- [ ] Make scripts executable, add error handling (`set -e`), add colored output

---

## Phase 5: Nginx & Reverse Proxy

> [!TIP]
> Replace the Node.js API Gateway with Nginx for production-grade routing.

### 5.1 — Nginx Basics
- [ ] Install Nginx (or use Docker image)
- [ ] Write `nginx.conf` to serve the React frontend (static files)
- [ ] Configure **reverse proxy** to route `/api/users` → user-service:5001
- [ ] Configure reverse proxy for `/api/restaurants` → restaurant-service:5002
- [ ] Configure reverse proxy for `/api/orders` → order-service:5003

### 5.2 — Nginx Advanced
- [ ] Add **gzip compression** for static assets
- [ ] Configure **SSL/TLS** with self-signed certificate
- [ ] Add **rate limiting** (`limit_req_zone`)
- [ ] Add **caching headers** for static files
- [ ] Add **CORS headers** in Nginx config
- [ ] Configure **upstream load balancing** for scaled services

---

## Phase 6: Kubernetes (K8s) — Core Concepts

> [!IMPORTANT]
> This is the big one. Take your time with each concept.

### 6.1 — Setup & Basics
- [ ] Install **Minikube** or **Kind** for local K8s cluster
- [ ] Install **kubectl** and verify: `kubectl cluster-info`
- [ ] Understand K8s architecture: API Server, etcd, Scheduler, Controller Manager, Kubelet
- [ ] Practice `kubectl get nodes`, `kubectl get pods`, `kubectl get namespaces`

### 6.2 — Pods & Deployments
- [ ] Write a **Pod YAML** for user-service (just to learn — never use bare pods)
- [ ] Write a **Deployment YAML** for each service:
  - `user-service-deployment.yaml` (replicas: 2)
  - `restaurant-service-deployment.yaml` (replicas: 2)
  - `order-service-deployment.yaml` (replicas: 2)
  - `api-gateway-deployment.yaml` (replicas: 2)
  - `frontend-deployment.yaml` (replicas: 2)
- [ ] Apply deployments: `kubectl apply -f`
- [ ] Practice: `kubectl get pods`, `kubectl describe pod`, `kubectl logs`
- [ ] Practice: `kubectl exec -it <pod> -- /bin/sh`

### 6.3 — Services (K8s Networking)
- [ ] Write **ClusterIP Service** for each backend microservice
- [ ] Write **NodePort Service** for the frontend
- [ ] Write **LoadBalancer Service** (for cloud or using MetalLB locally)
- [ ] Understand DNS in K8s: `service-name.namespace.svc.cluster.local`
- [ ] Test inter-pod communication using service DNS names

### 6.4 — ConfigMaps & Secrets
- [ ] Create **ConfigMaps** for non-sensitive config (service URLs, ports)
- [ ] Create **Secrets** for sensitive data (JWT_SECRET, MONGO_URI)
- [ ] Mount ConfigMaps as environment variables in deployments
- [ ] Mount Secrets as environment variables
- [ ] Practice `kubectl get configmaps`, `kubectl get secrets`

### 6.5 — MongoDB on K8s
- [ ] Deploy MongoDB as a **StatefulSet**
- [ ] Create a **PersistentVolume** and **PersistentVolumeClaim** for data
- [ ] Create a **Headless Service** for MongoDB
- [ ] Store MongoDB credentials in a Secret
- [ ] Connect application services to MongoDB using K8s DNS

### 6.6 — Ingress
- [ ] Install an **Ingress Controller** (Nginx Ingress)
- [ ] Write an **Ingress resource** to route:
  - `food-delivery.local/` → frontend service
  - `food-delivery.local/api/users` → user-service
  - `food-delivery.local/api/restaurants` → restaurant-service
  - `food-delivery.local/api/orders` → order-service
- [ ] Add host entry to `/etc/hosts` for testing
- [ ] Test path-based routing

### 6.7 — Namespaces & Resource Management
- [ ] Create a **namespace**: `kubectl create namespace food-delivery`
- [ ] Deploy all resources in the namespace
- [ ] Set **resource requests & limits** (CPU, memory) on each deployment
- [ ] Understand **QoS classes**: Guaranteed, Burstable, BestEffort
- [ ] Practice **LimitRange** and **ResourceQuota**

### 6.8 — Scaling & Rolling Updates
- [ ] **Manual scaling**: `kubectl scale deployment user-service --replicas=5`
- [ ] Set up **Horizontal Pod Autoscaler (HPA)** based on CPU
- [ ] Perform a **rolling update**: change image tag, apply, and watch
- [ ] Practice **rollback**: `kubectl rollout undo deployment/user-service`
- [ ] Check rollout history: `kubectl rollout history deployment/user-service`

---

## Phase 7: Helm Charts

> [!TIP]
> Helm is the package manager for Kubernetes. Think npm for K8s.

### 7.1 — Helm Basics
- [ ] Install Helm
- [ ] Create a Helm chart: `helm create food-delivery`
- [ ] Understand chart structure: `Chart.yaml`, `values.yaml`, `templates/`
- [ ] Understand template functions: `{{ .Values }}`, `{{ .Release }}`, `{{ include }}`

### 7.2 — Chart for Each Service
- [ ] Create a reusable **library chart** (`common-lib`) with shared templates
- [ ] Create individual charts for each microservice using the library
- [ ] Define `values.yaml` with:
  - Image name/tag
  - Replica count
  - Port configuration
  - Environment variables
  - Resource limits

### 7.3 — Helm Operations
- [ ] Install chart: `helm install food-delivery ./chart`
- [ ] Upgrade release: `helm upgrade food-delivery ./chart`
- [ ] Rollback: `helm rollback food-delivery 1`
- [ ] Create **environment-specific values**: `values-dev.yaml`, `values-prod.yaml`
- [ ] Install with overrides: `helm install -f values-prod.yaml food-delivery ./chart`
- [ ] Practice `helm list`, `helm status`, `helm history`, `helm uninstall`

---

## Phase 8: Monitoring & Logging

### 8.1 — Application Logging
- [ ] Add structured **JSON logging** (using Winston or Pino) to each service
- [ ] Add **request ID tracking** across services (correlation ID)
- [ ] Log important events: requests, errors, DB queries, inter-service calls

### 8.2 — Prometheus + Grafana
- [ ] Deploy **Prometheus** on K8s (using Helm chart)
- [ ] Add `/metrics` endpoint to each Node.js service (using `prom-client`)
- [ ] Configure Prometheus to scrape all services
- [ ] Deploy **Grafana** and connect to Prometheus data source
- [ ] Create dashboards for:
  - Request rate per service
  - Response time (p50, p95, p99)
  - Error rate
  - Node.js memory/CPU usage

### 8.3 — ELK / EFK Stack (Log Aggregation)
- [ ] Deploy **Elasticsearch + Fluentd + Kibana** (or Loki + Promtail + Grafana)
- [ ] Configure log collection from all pods
- [ ] Create Kibana dashboards to search and filter logs
- [ ] Set up log-based **alerts** for error spikes

### 8.4 — Health Checks & Alerts
- [ ] Configure K8s **liveness probes** (restart on crash)
- [ ] Configure K8s **readiness probes** (don't send traffic until ready)
- [ ] Configure K8s **startup probes** (for slow-starting apps)
- [ ] Set up **Alertmanager** with Prometheus for critical alerts (Slack/email)

---

## Phase 9: CI/CD Pipelines

> [!IMPORTANT]
> This ties everything together. Automate build → test → deploy.

### 9.1 — Git Best Practices (Pre-requisite)
- [ ] Initialize a **Git repo** for the project
- [ ] Create branching strategy: `main`, `develop`, `feature/*`, `hotfix/*`
- [ ] Write proper `.gitignore` (node_modules, .env, etc.)
- [ ] Practice **pull requests** and **code reviews**

### 9.2 — GitHub Actions — Build Pipeline
- [ ] Create `.github/workflows/ci.yml`
- [ ] **Trigger** on push to `main` and `develop`, and on PRs
- [ ] **Jobs to implement:**
  - Lint code (ESLint)
  - Run unit tests (Jest) for each service
  - Build Docker images for each service
  - Push images to Docker Hub (with git SHA tags)
- [ ] Use **matrix strategy** to build all services in parallel
- [ ] Add **caching** for `node_modules` and Docker layers

### 9.3 — GitHub Actions — Deploy Pipeline
- [ ] Create `.github/workflows/cd.yml`
- [ ] **Trigger** on push to `main` (or manual dispatch)
- [ ] **Jobs:**
  - Build and push images (reuse from CI)
  - Update Kubernetes deployments with new image tags
  - Or: run `helm upgrade` with new values
- [ ] Use **GitHub Secrets** for Docker Hub credentials, Kubeconfig
- [ ] Add **environment protection rules** (require approval for production)

### 9.4 — Jenkins (Alternative)
- [ ] Set up Jenkins server (or use Docker: `jenkins/jenkins`)
- [ ] Write a `Jenkinsfile` (declarative pipeline)
- [ ] Create **stages**: Checkout → Build → Test → Docker Build → Push → Deploy
- [ ] Configure **webhooks** to trigger builds on git push
- [ ] Set up **multibranch pipeline** for automatic branch detection

### 9.5 — ArgoCD (GitOps)
- [ ] Install **ArgoCD** on K8s cluster
- [ ] Create a **GitOps repository** with K8s manifests / Helm charts
- [ ] Connect ArgoCD to the GitOps repo
- [ ] Configure **automatic sync** — push to git → auto-deploy to K8s
- [ ] Practice ArgoCD **rollback** via git revert
- [ ] Understand GitOps principles: git as single source of truth

---

## Phase 10: Infrastructure as Code (IaC)

### 10.1 — Terraform Basics
- [ ] Install Terraform
- [ ] Learn HCL syntax: `provider`, `resource`, `variable`, `output`
- [ ] Practice `terraform init`, `plan`, `apply`, `destroy`
- [ ] Understand **state management** (`terraform.tfstate`)

### 10.2 — Terraform for Cloud (AWS / Azure / GCP)
- [ ] Provision a **VPC + Subnets**
- [ ] Provision an **EKS / AKS / GKE** Kubernetes cluster
- [ ] Provision an **ECR / ACR / GCR** container registry
- [ ] Provision a **MongoDB Atlas** cluster (or DocumentDB)
- [ ] Use **variables** and **modules** for reusability
- [ ] Use **remote state** (S3 + DynamoDB for locking)

### 10.3 — Ansible (Configuration Management)
- [ ] Install Ansible
- [ ] Write a playbook to install Node.js and MongoDB on a VM
- [ ] Write a playbook to deploy your services to VMs (non-K8s approach)
- [ ] Understand the difference: Terraform (infra) vs Ansible (config)

---

## Phase 11: Security

### 11.1 — Container Security
- [ ] Scan Docker images for vulnerabilities: `trivy image user-service:v1`
- [ ] Run containers as **non-root user** (add `USER node` in Dockerfile)
- [ ] Use **read-only filesystem** where possible
- [ ] Implement **Docker Content Trust** (image signing)

### 11.2 — Kubernetes Security
- [ ] Implement **RBAC**: create roles, cluster roles, bindings
- [ ] Use **NetworkPolicies** to restrict pod-to-pod communication
- [ ] Enable **PodSecurityStandards** (restricted profile)
- [ ] Scan K8s manifests with **kubesec** or **kube-bench**

### 11.3 — Secrets Management
- [ ] Use **Sealed Secrets** or **External Secrets Operator** in K8s
- [ ] Integrate with **HashiCorp Vault** for dynamic secrets
- [ ] Never commit `.env` files or secrets to git
- [ ] Rotate secrets and understand secret lifecycle

---

## 📊 Progress Tracker

| Phase | Topic | Status |
|-------|-------|--------|
| 1 | Docker Fundamentals | ⬜ Not Started |
| 2 | Docker Compose | ⬜ Not Started |
| 3 | Container Registry | ⬜ Not Started |
| 4 | Linux & Shell Scripting | ⬜ Not Started |
| 5 | Nginx & Reverse Proxy | ⬜ Not Started |
| 6 | Kubernetes Core | ⬜ Not Started |
| 7 | Helm Charts | ⬜ Not Started |
| 8 | Monitoring & Logging | ⬜ Not Started |
| 9 | CI/CD Pipelines | ⬜ Not Started |
| 10 | Infrastructure as Code | ⬜ Not Started |
| 11 | Security | ⬜ Not Started |

> [!NOTE]
> **Estimated total time:** 4–6 weeks if practicing daily (2-3 hours/day).
> Phases 1-5 can be done in week 1-2. Phases 6-7 in week 2-3. Phases 8-11 in week 3-6.

> [!TIP]
> **Pro tip:** Don't just follow tutorials — **break things intentionally**, debug them, and understand *why* something works. That's how you truly learn DevOps.

# 🚀 8-Hour DevOps Marathon — Fast Food Delivery Platform

> Your complete hands-on DevOps revision plan. Every minute is accounted for.
> **Focus: 70% Kubernetes, 30% Docker + CI/CD**

---

## ⏰ Time Breakdown

| Block | Time | Duration | Topic |
|-------|------|----------|-------|
| 🟠 1 | 0:00 – 1:00 | 1 hr | Docker: Dockerfiles + Build |
| 🟠 2 | 1:00 – 1:45 | 45 min | Docker Compose: Full Stack |
| 🔵 3 | 1:45 – 2:30 | 45 min | K8s Setup + Pods + Deployments |
| 🔵 4 | 2:30 – 3:15 | 45 min | K8s Services + ConfigMaps + Secrets |
| ☕ | 3:15 – 3:30 | 15 min | **BREAK** |
| 🔵 5 | 3:30 – 4:30 | 1 hr | K8s Storage: PV, PVC, StorageClass + MongoDB StatefulSet |
| 🔵 6 | 4:30 – 5:30 | 1 hr | K8s Gateway API (KGateway) + HTTPRoute |
| 🔵 7 | 5:30 – 6:15 | 45 min | K8s Scaling: HPA + Rolling Updates + Rollbacks |
| ☕ | 6:15 – 6:30 | 15 min | **BREAK** |
| 🟢 8 | 6:30 – 7:15 | 45 min | Helm Charts |
| 🟣 9 | 7:15 – 8:00 | 45 min | CI/CD: GitHub Actions Pipeline |

---

## 🟠 Block 1 — Docker: Dockerfiles + Build `[0:00 – 1:00]`

> **Goal:** Dockerize all 5 services. Understand every Dockerfile instruction.

### Concepts to Revise
- `FROM`, `WORKDIR`, `COPY`, `RUN`, `EXPOSE`, `CMD` vs `ENTRYPOINT`
- Multi-stage builds (frontend)
- Layer caching strategy: copy `package.json` → `npm install` → copy source
- `.dockerignore` — why it matters
- `alpine` vs full images — size difference

### Tasks

- [ ] **1.1** Create `user-service/Dockerfile`
  ```dockerfile
  FROM node:18-alpine
  WORKDIR /app
  COPY package*.json ./
  RUN npm install --production
  COPY . .
  EXPOSE 5001
  CMD ["node", "server.js"]
  ```

- [ ] **1.2** Create `restaurant-service/Dockerfile` (same pattern, port 5002)

- [ ] **1.3** Create `order-service/Dockerfile` (same pattern, port 5003)

- [ ] **1.4** Create `api-gateway/Dockerfile` (same pattern, port 5000)

- [ ] **1.5** Create `frontend/Dockerfile` — **Multi-stage build**
  ```dockerfile
  # Stage 1: Build
  FROM node:18-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm install
  COPY . .
  RUN npm run build

  # Stage 2: Serve
  FROM nginx:alpine
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 80
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] **1.6** Create `frontend/nginx.conf`
  ```nginx
  server {
      listen 80;
      location / {
          root /usr/share/nginx/html;
          index index.html;
          try_files $uri $uri/ /index.html;
      }
      location /api/ {
          proxy_pass http://api-gateway:5000;
      }
  }
  ```

- [ ] **1.7** Create `.dockerignore` in each service
  ```
  node_modules
  .env
  .git
  npm-debug.log
  ```

- [ ] **1.8** Build all images
  ```bash
  docker build -t food/user-service:v1 ./user-service
  docker build -t food/restaurant-service:v1 ./restaurant-service
  docker build -t food/order-service:v1 ./order-service
  docker build -t food/api-gateway:v1 ./api-gateway
  docker build -t food/frontend:v1 ./frontend
  ```

- [ ] **1.9** Verify all images: `docker images | grep food/`

- [ ] **1.10** Test one container manually
  ```bash
  docker run -d --name test-user -p 5001:5001 \
    -e MONGO_URI=mongodb://host.docker.internal:27017/food_users \
    -e JWT_SECRET=mysecret \
    food/user-service:v1
  
  curl http://localhost:5001/health
  docker logs test-user
  docker stop test-user && docker rm test-user
  ```

### ✅ Checkpoint: 5 Docker images built, multi-stage for frontend

---

## 🟠 Block 2 — Docker Compose `[1:00 – 1:45]`

> **Goal:** Single command to start the entire platform.

### Concepts to Revise
- `services`, `networks`, `volumes`
- `depends_on` with `condition: service_healthy`
- Health checks
- Named volumes for data persistence
- Environment variable management

### Tasks

- [ ] **2.1** Create `docker-compose.yml` in project root
  ```yaml
  version: '3.8'

  services:
    mongodb:
      image: mongo:7
      container_name: food-mongodb
      ports:
        - "27017:27017"
      volumes:
        - mongo-data:/data/db
      networks:
        - food-network
      healthcheck:
        test: ["CMD", "mongosh", "--eval", "db.adminCommand('ping')"]
        interval: 10s
        timeout: 5s
        retries: 5

    user-service:
      build: ./user-service
      container_name: food-user-service
      ports:
        - "5001:5001"
      environment:
        - PORT=5001
        - MONGO_URI=mongodb://mongodb:27017/food_delivery_users
        - JWT_SECRET=jwt_secret_key_2024
        - JWT_EXPIRE=7d
      depends_on:
        mongodb:
          condition: service_healthy
      networks:
        - food-network
      restart: unless-stopped
      healthcheck:
        test: ["CMD", "wget", "--spider", "-q", "http://localhost:5001/health"]
        interval: 15s
        timeout: 5s
        retries: 3

    restaurant-service:
      build: ./restaurant-service
      container_name: food-restaurant-service
      ports:
        - "5002:5002"
      environment:
        - PORT=5002
        - MONGO_URI=mongodb://mongodb:27017/food_delivery_restaurants
        - JWT_SECRET=jwt_secret_key_2024
      depends_on:
        mongodb:
          condition: service_healthy
      networks:
        - food-network
      restart: unless-stopped

    order-service:
      build: ./order-service
      container_name: food-order-service
      ports:
        - "5003:5003"
      environment:
        - PORT=5003
        - MONGO_URI=mongodb://mongodb:27017/food_delivery_orders
        - JWT_SECRET=jwt_secret_key_2024
        - RESTAURANT_SERVICE_URL=http://restaurant-service:5002
        - USER_SERVICE_URL=http://user-service:5001
      depends_on:
        mongodb:
          condition: service_healthy
      networks:
        - food-network
      restart: unless-stopped

    api-gateway:
      build: ./api-gateway
      container_name: food-api-gateway
      ports:
        - "5000:5000"
      environment:
        - PORT=5000
        - USER_SERVICE_URL=http://user-service:5001
        - RESTAURANT_SERVICE_URL=http://restaurant-service:5002
        - ORDER_SERVICE_URL=http://order-service:5003
        - JWT_SECRET=jwt_secret_key_2024
      depends_on:
        - user-service
        - restaurant-service
        - order-service
      networks:
        - food-network
      restart: unless-stopped

    frontend:
      build: ./frontend
      container_name: food-frontend
      ports:
        - "3000:80"
      depends_on:
        - api-gateway
      networks:
        - food-network
      restart: unless-stopped

  volumes:
    mongo-data:
      driver: local

  networks:
    food-network:
      driver: bridge
  ```

- [ ] **2.2** Start everything: `docker-compose up -d --build`
- [ ] **2.3** Verify: `docker-compose ps` — all services healthy
- [ ] **2.4** Check logs: `docker-compose logs -f api-gateway`
- [ ] **2.5** Test seed: `curl -X POST http://localhost:5000/api/seed`
- [ ] **2.6** Visit `http://localhost:3000` — verify frontend works
- [ ] **2.7** Tear down: `docker-compose down`
- [ ] **2.8** Tear down with volumes: `docker-compose down -v` — understand the difference

### ✅ Checkpoint: Full stack running with one command

---

## 🔵 Block 3 — K8s: Pods + Deployments `[1:45 – 2:30]`

> **Goal:** Deploy all services to Kubernetes as Deployments.

### Concepts to Revise
- Pod = smallest deployable unit (1+ containers)
- Deployment = manages ReplicaSets → manages Pods
- Labels & Selectors — how K8s connects things
- Container spec: `image`, `ports`, `env`, `resources`
- `kubectl apply`, `get`, `describe`, `logs`, `exec`, `delete`

### Tasks

- [ ] **3.1** Start local cluster
  ```bash
  minikube start --driver=docker --cpus=4 --memory=8192
  # OR
  kind create cluster --name food-delivery
  ```

- [ ] **3.2** Create namespace
  ```bash
  kubectl create namespace food-delivery
  kubectl config set-context --current --namespace=food-delivery
  ```

- [ ] **3.3** Create `k8s/` folder in project root

- [ ] **3.4** Create `k8s/mongodb-deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: mongodb
    namespace: food-delivery
    labels:
      app: mongodb
  spec:
    replicas: 1
    selector:
      matchLabels:
        app: mongodb
    template:
      metadata:
        labels:
          app: mongodb
      spec:
        containers:
          - name: mongodb
            image: mongo:7
            ports:
              - containerPort: 27017
            resources:
              requests:
                cpu: 250m
                memory: 256Mi
              limits:
                cpu: 500m
                memory: 512Mi
  ```

- [ ] **3.5** Create `k8s/user-service-deployment.yaml`
  ```yaml
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: user-service
    namespace: food-delivery
    labels:
      app: user-service
      tier: backend
  spec:
    replicas: 2
    selector:
      matchLabels:
        app: user-service
    template:
      metadata:
        labels:
          app: user-service
          tier: backend
      spec:
        containers:
          - name: user-service
            image: food/user-service:v1
            imagePullPolicy: IfNotPresent
            ports:
              - containerPort: 5001
            env:
              - name: PORT
                value: "5001"
              - name: MONGO_URI
                value: "mongodb://mongodb-svc:27017/food_delivery_users"
              - name: JWT_SECRET
                valueFrom:
                  secretKeyRef:
                    name: app-secrets
                    key: JWT_SECRET
            resources:
              requests:
                cpu: 100m
                memory: 128Mi
              limits:
                cpu: 250m
                memory: 256Mi
            livenessProbe:
              httpGet:
                path: /health
                port: 5001
              initialDelaySeconds: 15
              periodSeconds: 20
            readinessProbe:
              httpGet:
                path: /health
                port: 5001
              initialDelaySeconds: 5
              periodSeconds: 10
  ```

- [ ] **3.6** Create `k8s/restaurant-service-deployment.yaml` (same pattern, port 5002)

- [ ] **3.7** Create `k8s/order-service-deployment.yaml` (port 5003, add `RESTAURANT_SERVICE_URL` env)

- [ ] **3.8** Create `k8s/api-gateway-deployment.yaml` (port 5000, add all service URLs)

- [ ] **3.9** Create `k8s/frontend-deployment.yaml` (port 80, image: `food/frontend:v1`)

- [ ] **3.10** Load images into cluster (if using Minikube/Kind)
  ```bash
  # Minikube:
  minikube image load food/user-service:v1
  minikube image load food/restaurant-service:v1
  minikube image load food/order-service:v1
  minikube image load food/api-gateway:v1
  minikube image load food/frontend:v1

  # Kind:
  kind load docker-image food/user-service:v1 --name food-delivery
  ```

- [ ] **3.11** Apply all deployments
  ```bash
  kubectl apply -f k8s/
  ```

- [ ] **3.12** Verify
  ```bash
  kubectl get deployments
  kubectl get pods -o wide
  kubectl describe pod <user-service-pod-name>
  kubectl logs <user-service-pod-name>
  kubectl exec -it <pod-name> -- /bin/sh
  ```

### ✅ Checkpoint: All pods running in food-delivery namespace

---

## 🔵 Block 4 — K8s: Services + ConfigMaps + Secrets `[2:30 – 3:15]`

> **Goal:** Enable pod-to-pod communication. Externalize config.

### Concepts to Revise

**Services:**
- **ClusterIP** (default) — internal only, pods talk to each other
- **NodePort** — expose on each node's IP at a static port (30000-32767)
- **LoadBalancer** — external LB (cloud), or MetalLB locally
- Service DNS: `<service-name>.<namespace>.svc.cluster.local`

**ConfigMaps & Secrets:**
- ConfigMap = non-sensitive config (URLs, ports, feature flags)
- Secret = sensitive data (passwords, tokens) — base64 encoded
- Mount as env vars or volume files

### Tasks

- [ ] **4.1** Create `k8s/mongodb-service.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mongodb-svc
    namespace: food-delivery
  spec:
    type: ClusterIP
    selector:
      app: mongodb
    ports:
      - port: 27017
        targetPort: 27017
  ```

- [ ] **4.2** Create `k8s/user-service-svc.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: user-service-svc
    namespace: food-delivery
  spec:
    type: ClusterIP
    selector:
      app: user-service
    ports:
      - port: 5001
        targetPort: 5001
  ```

- [ ] **4.3** Create services for restaurant-service (5002), order-service (5003), api-gateway (5000)

- [ ] **4.4** Create `k8s/frontend-service.yaml` — **NodePort**
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: frontend-svc
    namespace: food-delivery
  spec:
    type: NodePort
    selector:
      app: frontend
    ports:
      - port: 80
        targetPort: 80
        nodePort: 30080
  ```

- [ ] **4.5** Create `k8s/configmap.yaml`
  ```yaml
  apiVersion: v1
  kind: ConfigMap
  metadata:
    name: app-config
    namespace: food-delivery
  data:
    USER_SERVICE_URL: "http://user-service-svc:5001"
    RESTAURANT_SERVICE_URL: "http://restaurant-service-svc:5002"
    ORDER_SERVICE_URL: "http://order-service-svc:5003"
    MONGO_URI_USERS: "mongodb://mongodb-svc:27017/food_delivery_users"
    MONGO_URI_RESTAURANTS: "mongodb://mongodb-svc:27017/food_delivery_restaurants"
    MONGO_URI_ORDERS: "mongodb://mongodb-svc:27017/food_delivery_orders"
  ```

- [ ] **4.6** Create `k8s/secrets.yaml`
  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: app-secrets
    namespace: food-delivery
  type: Opaque
  data:
    JWT_SECRET: and0X3NlY3JldF9rZXlfMjAyNA==          # base64 of jwt_secret_key_2024
    MONGO_ROOT_PASSWORD: cm9vdHBhc3N3b3Jk              # base64 of rootpassword
  ```
  ```bash
  # How to encode:
  echo -n "jwt_secret_key_2024" | base64
  ```

- [ ] **4.7** Update deployments to use ConfigMap and Secret references
  ```yaml
  # In deployment env section, replace hardcoded values:
  env:
    - name: MONGO_URI
      valueFrom:
        configMapKeyRef:
          name: app-config
          key: MONGO_URI_USERS
    - name: JWT_SECRET
      valueFrom:
        secretKeyRef:
          name: app-secrets
          key: JWT_SECRET
  # Or load all keys from configmap:
  envFrom:
    - configMapRef:
        name: app-config
  ```

- [ ] **4.8** Apply everything
  ```bash
  kubectl apply -f k8s/
  kubectl get svc
  kubectl get configmaps
  kubectl get secrets
  ```

- [ ] **4.9** Test internal DNS
  ```bash
  kubectl exec -it <user-service-pod> -- /bin/sh
  wget -qO- http://restaurant-service-svc:5002/health
  ```

- [ ] **4.10** Test external access
  ```bash
  minikube service frontend-svc -n food-delivery
  # OR
  kubectl port-forward svc/api-gateway-svc 5000:5000 -n food-delivery
  ```

### ✅ Checkpoint: Services communicating via K8s DNS, config externalized

---

## ☕ BREAK `[3:15 – 3:30]` — Stretch, hydrate, review notes

---

## 🔵 Block 5 — K8s: Storage (PV, PVC, StorageClass) + StatefulSet `[3:30 – 4:30]`

> **Goal:** Persistent MongoDB with proper K8s storage hierarchy.

### Concepts to Revise

```
StorageClass              ← Defines HOW storage is provisioned
    ↓
PersistentVolume (PV)     ← Actual storage resource (disk)
    ↓
PersistentVolumeClaim (PVC) ← Pod's request for storage
    ↓
Pod / StatefulSet          ← Uses the PVC as a volume
```

- **StorageClass** — Defines the provisioner (e.g., `hostpath`, `ebs-csi`, `gce-pd`). Enables **dynamic provisioning**.
- **PersistentVolume (PV)** — Cluster-level resource. Represents actual storage. Has capacity, access modes, reclaim policy.
- **PersistentVolumeClaim (PVC)** — Namespace-level. A request for storage matching certain criteria. Binds to a PV.
- **Access Modes**: `ReadWriteOnce (RWO)`, `ReadOnlyMany (ROX)`, `ReadWriteMany (RWX)`
- **Reclaim Policy**: `Retain` (keep data), `Delete` (delete with PVC), `Recycle` (deprecated)
- **StatefulSet** — Like Deployment but for stateful apps. Gives stable network IDs and persistent storage per pod.

### Tasks

- [ ] **5.1** Create `k8s/storage-class.yaml`
  ```yaml
  apiVersion: storage.k8s.io/v1
  kind: StorageClass
  metadata:
    name: fast-storage
  provisioner: k8s.io/minikube-hostpath    # Use 'rancher.io/local-path' for Kind
  reclaimPolicy: Retain
  volumeBindingMode: Immediate
  allowVolumeExpansion: true
  ```

- [ ] **5.2** Create `k8s/mongo-pv.yaml` — Manual PV (understand static provisioning)
  ```yaml
  apiVersion: v1
  kind: PersistentVolume
  metadata:
    name: mongo-pv
    labels:
      type: local
      app: mongodb
  spec:
    storageClassName: fast-storage
    capacity:
      storage: 5Gi
    accessModes:
      - ReadWriteOnce
    persistentVolumeReclaimPolicy: Retain
    hostPath:
      path: /data/mongo-storage
  ```

- [ ] **5.3** Create `k8s/mongo-pvc.yaml`
  ```yaml
  apiVersion: v1
  kind: PersistentVolumeClaim
  metadata:
    name: mongo-pvc
    namespace: food-delivery
  spec:
    storageClassName: fast-storage
    accessModes:
      - ReadWriteOnce
    resources:
      requests:
        storage: 5Gi
  ```

- [ ] **5.4** Verify PV/PVC binding
  ```bash
  kubectl apply -f k8s/storage-class.yaml
  kubectl apply -f k8s/mongo-pv.yaml
  kubectl apply -f k8s/mongo-pvc.yaml
  
  kubectl get sc
  kubectl get pv
  kubectl get pvc -n food-delivery
  # PVC status should be "Bound"
  ```

- [ ] **5.5** Create `k8s/mongodb-statefulset.yaml` — Replace the Deployment
  ```yaml
  apiVersion: apps/v1
  kind: StatefulSet
  metadata:
    name: mongodb
    namespace: food-delivery
  spec:
    serviceName: mongodb-headless
    replicas: 1
    selector:
      matchLabels:
        app: mongodb
    template:
      metadata:
        labels:
          app: mongodb
      spec:
        containers:
          - name: mongodb
            image: mongo:7
            ports:
              - containerPort: 27017
            env:
              - name: MONGO_INITDB_ROOT_USERNAME
                value: "admin"
              - name: MONGO_INITDB_ROOT_PASSWORD
                valueFrom:
                  secretKeyRef:
                    name: app-secrets
                    key: MONGO_ROOT_PASSWORD
            volumeMounts:
              - name: mongo-persistent-storage
                mountPath: /data/db
            resources:
              requests:
                cpu: 250m
                memory: 256Mi
              limits:
                cpu: 500m
                memory: 512Mi
        volumes:
          - name: mongo-persistent-storage
            persistentVolumeClaim:
              claimName: mongo-pvc
  ```

- [ ] **5.6** Create `k8s/mongodb-headless-service.yaml`
  ```yaml
  apiVersion: v1
  kind: Service
  metadata:
    name: mongodb-headless
    namespace: food-delivery
  spec:
    clusterIP: None           # Headless!
    selector:
      app: mongodb
    ports:
      - port: 27017
        targetPort: 27017
  ---
  # Also keep the regular ClusterIP service for app access
  apiVersion: v1
  kind: Service
  metadata:
    name: mongodb-svc
    namespace: food-delivery
  spec:
    type: ClusterIP
    selector:
      app: mongodb
    ports:
      - port: 27017
        targetPort: 27017
  ```

- [ ] **5.7** Delete old MongoDB deployment, apply new StatefulSet
  ```bash
  kubectl delete deployment mongodb -n food-delivery
  kubectl apply -f k8s/mongodb-statefulset.yaml
  kubectl apply -f k8s/mongodb-headless-service.yaml
  ```

- [ ] **5.8** Verify persistence
  ```bash
  # Seed data
  kubectl port-forward svc/api-gateway-svc 5000:5000 -n food-delivery &
  curl -X POST http://localhost:5000/api/seed
  
  # Delete the MongoDB pod (it will restart)
  kubectl delete pod mongodb-0 -n food-delivery
  
  # Wait for it to come back, then verify data still exists
  curl http://localhost:5000/api/restaurants
  # Data should persist! ✅
  ```

- [ ] **5.9** Explore dynamic provisioning (with `volumeClaimTemplates`)
  ```yaml
  # Alternative: let StatefulSet create PVCs automatically
  # Add this to StatefulSet spec (instead of volumes + PVC):
  volumeClaimTemplates:
    - metadata:
        name: mongo-data
      spec:
        storageClassName: fast-storage
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 5Gi
  # Then in container, mount "mongo-data" instead of "mongo-pvc"
  ```

- [ ] **5.10** Inspect storage objects
  ```bash
  kubectl get sc                        # StorageClasses
  kubectl get pv                        # PersistentVolumes (cluster-scoped)
  kubectl get pvc -n food-delivery      # PersistentVolumeClaims (namespaced)
  kubectl describe pv mongo-pv
  kubectl describe pvc mongo-pvc -n food-delivery
  ```

### ✅ Checkpoint: MongoDB with persistent storage that survives pod restarts

---

## 🔵 Block 6 — K8s: Gateway API (KGateway) + HTTPRoute `[4:30 – 5:30]`

> **Goal:** Replace Ingress with the modern Kubernetes Gateway API.

### Concepts to Revise

> [!IMPORTANT]
> **Gateway API** is the successor to Ingress. It's more expressive, role-oriented, and supports advanced routing.

```
GatewayClass              ← Defines the controller implementation (like IngressClass)
    ↓
Gateway                   ← Actual listener (binds ports, protocols, hostnames)
    ↓
HTTPRoute                 ← Routing rules: path → service mapping
    ↓
Service → Pods            ← Backend targets
```

**Key differences from Ingress:**
| Aspect | Ingress | Gateway API |
|--------|---------|-------------|
| API | `networking.k8s.io/v1` | `gateway.networking.k8s.io/v1` |
| Routing | Limited (path/host only) | Rich (headers, methods, mirrors, weights) |
| Roles | Single resource | Split: Infra admin (Gateway) + App dev (HTTPRoute) |
| Traffic splitting | ❌ | ✅ Weighted backends |
| Header matching | ❌ | ✅ |
| Request redirect | ❌ (annotation hacks) | ✅ Native |

### Tasks

- [ ] **6.1** Install Gateway API CRDs
  ```bash
  kubectl apply -f https://github.com/kubernetes-sigs/gateway-api/releases/download/v1.2.0/standard-install.yaml
  ```

- [ ] **6.2** Install a Gateway API controller (choose one)
  ```bash
  # Option A: Envoy Gateway (recommended)
  helm install eg oci://docker.io/envoyproxy/gateway-helm \
    --version v1.2.0 -n envoy-gateway-system --create-namespace

  # Option B: Nginx Gateway Fabric
  kubectl apply -f https://github.com/nginxinc/nginx-gateway-fabric/releases/download/v1.5.0/nginx-gateway-fabric.yaml

  # Option C: Istio (if you want service mesh later)
  istioctl install --set profile=minimal
  ```

- [ ] **6.3** Verify GatewayClass is available
  ```bash
  kubectl get gatewayclass
  ```

- [ ] **6.4** Create `k8s/gateway.yaml`
  ```yaml
  apiVersion: gateway.networking.k8s.io/v1
  kind: Gateway
  metadata:
    name: food-delivery-gateway
    namespace: food-delivery
  spec:
    gatewayClassName: eg       # matches your installed controller
    listeners:
      - name: http
        protocol: HTTP
        port: 80
        allowedRoutes:
          namespaces:
            from: Same
  ```

- [ ] **6.5** Create `k8s/httproute-frontend.yaml`
  ```yaml
  apiVersion: gateway.networking.k8s.io/v1
  kind: HTTPRoute
  metadata:
    name: frontend-route
    namespace: food-delivery
  spec:
    parentRefs:
      - name: food-delivery-gateway
    rules:
      - matches:
          - path:
              type: PathPrefix
              value: /
        backendRefs:
          - name: frontend-svc
            port: 80
  ```

- [ ] **6.6** Create `k8s/httproute-api.yaml` — Route API requests
  ```yaml
  apiVersion: gateway.networking.k8s.io/v1
  kind: HTTPRoute
  metadata:
    name: api-routes
    namespace: food-delivery
  spec:
    parentRefs:
      - name: food-delivery-gateway
    rules:
      # User Service routes
      - matches:
          - path:
              type: PathPrefix
              value: /api/users
        backendRefs:
          - name: user-service-svc
            port: 5001

      # Restaurant Service routes
      - matches:
          - path:
              type: PathPrefix
              value: /api/restaurants
        backendRefs:
          - name: restaurant-service-svc
            port: 5002

      # Seed route
      - matches:
          - path:
              type: PathPrefix
              value: /api/seed
        backendRefs:
          - name: restaurant-service-svc
            port: 5002

      # Order Service routes
      - matches:
          - path:
              type: PathPrefix
              value: /api/orders
        backendRefs:
          - name: order-service-svc
            port: 5003
  ```

- [ ] **6.7** Apply and verify
  ```bash
  kubectl apply -f k8s/gateway.yaml
  kubectl apply -f k8s/httproute-frontend.yaml
  kubectl apply -f k8s/httproute-api.yaml

  kubectl get gateway -n food-delivery
  kubectl get httproute -n food-delivery
  kubectl describe gateway food-delivery-gateway -n food-delivery
  ```

- [ ] **6.8** Test the Gateway
  ```bash
  # Get gateway external IP/port
  kubectl get gateway food-delivery-gateway -n food-delivery -o jsonpath='{.status.addresses[0].value}'
  
  # For Minikube, use port-forward:
  kubectl port-forward svc/food-delivery-gateway 8080:80 -n food-delivery

  curl http://localhost:8080/api/users/health
  curl http://localhost:8080/api/restaurants
  ```

- [ ] **6.9** Advanced: Add **header-based routing**
  ```yaml
  # Route API versioning via headers
  - matches:
      - path:
          type: PathPrefix
          value: /api/users
        headers:
          - name: X-API-Version
            value: v2
    backendRefs:
      - name: user-service-v2-svc
        port: 5001
  ```

- [ ] **6.10** Advanced: Add **traffic splitting** (canary)
  ```yaml
  # 90% to v1, 10% to v2
  - matches:
      - path:
          type: PathPrefix
          value: /api/users
    backendRefs:
      - name: user-service-svc
        port: 5001
        weight: 90
      - name: user-service-v2-svc
        port: 5001
        weight: 10
  ```

### ✅ Checkpoint: Gateway API routing all traffic, no Ingress needed

---

## 🔵 Block 7 — K8s: Scaling + Rolling Updates + Probes `[5:30 – 6:15]`

> **Goal:** Scale services, perform zero-downtime deployments.

### Concepts to Revise
- **HPA** — auto-scales pods based on CPU/memory metrics
- **Rolling Update** — replace pods gradually (default strategy)
- **Rollback** — revert to previous deployment revision
- **Liveness Probe** — restart container if unhealthy
- **Readiness Probe** — remove from service if not ready
- **Startup Probe** — for slow-starting containers

### Tasks

- [ ] **7.1** Install metrics-server (required for HPA)
  ```bash
  minikube addons enable metrics-server
  # OR
  kubectl apply -f https://github.com/kubernetes-sigs/metrics-server/releases/latest/download/components.yaml
  ```

- [ ] **7.2** Manual scaling
  ```bash
  kubectl scale deployment user-service --replicas=5 -n food-delivery
  kubectl get pods -l app=user-service -n food-delivery -w  # Watch
  kubectl scale deployment user-service --replicas=2 -n food-delivery
  ```

- [ ] **7.3** Create `k8s/hpa.yaml`
  ```yaml
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: user-service-hpa
    namespace: food-delivery
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: user-service
    minReplicas: 2
    maxReplicas: 10
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 70
      - type: Resource
        resource:
          name: memory
          target:
            type: Utilization
            averageUtilization: 80
  ---
  apiVersion: autoscaling/v2
  kind: HorizontalPodAutoscaler
  metadata:
    name: restaurant-service-hpa
    namespace: food-delivery
  spec:
    scaleTargetRef:
      apiVersion: apps/v1
      kind: Deployment
      name: restaurant-service
    minReplicas: 2
    maxReplicas: 8
    metrics:
      - type: Resource
        resource:
          name: cpu
          target:
            type: Utilization
            averageUtilization: 70
  ```

- [ ] **7.4** Apply and watch HPA
  ```bash
  kubectl apply -f k8s/hpa.yaml
  kubectl get hpa -n food-delivery -w
  ```

- [ ] **7.5** Rolling Update — deploy a new version
  ```bash
  # Build v2 image
  docker build -t food/user-service:v2 ./user-service
  minikube image load food/user-service:v2

  # Update deployment image
  kubectl set image deployment/user-service \
    user-service=food/user-service:v2 -n food-delivery

  # Watch the rollout
  kubectl rollout status deployment/user-service -n food-delivery
  kubectl get pods -l app=user-service -n food-delivery -w
  ```

- [ ] **7.6** Configure rolling update strategy (add to deployment spec)
  ```yaml
  spec:
    strategy:
      type: RollingUpdate
      rollingUpdate:
        maxUnavailable: 1
        maxSurge: 1
  ```

- [ ] **7.7** Rollback
  ```bash
  # Check history
  kubectl rollout history deployment/user-service -n food-delivery

  # Rollback to previous version
  kubectl rollout undo deployment/user-service -n food-delivery

  # Rollback to specific revision
  kubectl rollout undo deployment/user-service --to-revision=1 -n food-delivery
  ```

- [ ] **7.8** Verify probes are working
  ```bash
  # Kill the health endpoint temporarily (exec into pod)
  kubectl exec -it <pod> -- /bin/sh
  # The liveness probe should detect failure and restart the pod
  
  kubectl get events -n food-delivery --sort-by=.metadata.creationTimestamp
  ```

### ✅ Checkpoint: HPA scaling, zero-downtime deploys, rollbacks working

---

## ☕ BREAK `[6:15 – 6:30]` — Almost there. Final stretch!

---

## 🟢 Block 8 — Helm Charts `[6:30 – 7:15]`

> **Goal:** Package all K8s manifests into a reusable Helm chart.

### Concepts to Revise
- Chart structure: `Chart.yaml`, `values.yaml`, `templates/`
- Template syntax: `{{ .Values.x }}`, `{{ .Release.Name }}`, `{{ include }}`, `{{ if }}`
- `values.yaml` = runtime configuration
- `helm install`, `upgrade`, `rollback`, `uninstall`

### Tasks

- [ ] **8.1** Create chart
  ```bash
  helm create helm/food-delivery
  cd helm/food-delivery
  rm -rf templates/*    # Start fresh
  ```

- [ ] **8.2** Write `helm/food-delivery/values.yaml`
  ```yaml
  global:
    namespace: food-delivery
    jwtSecret: jwt_secret_key_2024

  mongodb:
    image: mongo:7
    storage: 5Gi
    storageClassName: fast-storage

  userService:
    name: user-service
    image: food/user-service
    tag: v1
    replicas: 2
    port: 5001

  restaurantService:
    name: restaurant-service
    image: food/restaurant-service
    tag: v1
    replicas: 2
    port: 5002

  orderService:
    name: order-service
    image: food/order-service
    tag: v1
    replicas: 2
    port: 5003

  apiGateway:
    name: api-gateway
    image: food/api-gateway
    tag: v1
    replicas: 2
    port: 5000

  frontend:
    name: frontend
    image: food/frontend
    tag: v1
    replicas: 2
    port: 80
  ```

- [ ] **8.3** Create template `templates/microservice.yaml` (reusable)
  ```yaml
  {{- range $key, $svc := list .Values.userService .Values.restaurantService .Values.orderService .Values.apiGateway .Values.frontend }}
  ---
  apiVersion: apps/v1
  kind: Deployment
  metadata:
    name: {{ $svc.name }}
    labels:
      app: {{ $svc.name }}
  spec:
    replicas: {{ $svc.replicas }}
    selector:
      matchLabels:
        app: {{ $svc.name }}
    template:
      metadata:
        labels:
          app: {{ $svc.name }}
      spec:
        containers:
          - name: {{ $svc.name }}
            image: "{{ $svc.image }}:{{ $svc.tag }}"
            ports:
              - containerPort: {{ $svc.port }}
  ---
  apiVersion: v1
  kind: Service
  metadata:
    name: {{ $svc.name }}-svc
  spec:
    type: ClusterIP
    selector:
      app: {{ $svc.name }}
    ports:
      - port: {{ $svc.port }}
        targetPort: {{ $svc.port }}
  {{- end }}
  ```

- [ ] **8.4** Add ConfigMap + Secret templates

- [ ] **8.5** Dry run to verify
  ```bash
  helm template food-delivery ./helm/food-delivery
  helm install food-delivery ./helm/food-delivery --dry-run --debug
  ```

- [ ] **8.6** Install the chart
  ```bash
  helm install food-delivery ./helm/food-delivery -n food-delivery --create-namespace
  ```

- [ ] **8.7** Upgrade with different values
  ```bash
  helm upgrade food-delivery ./helm/food-delivery \
    --set userService.replicas=4 \
    --set userService.tag=v2
  ```

- [ ] **8.8** List, history, rollback
  ```bash
  helm list -n food-delivery
  helm history food-delivery -n food-delivery
  helm rollback food-delivery 1 -n food-delivery
  ```

- [ ] **8.9** Create `values-prod.yaml` with production overrides
  ```yaml
  userService:
    replicas: 4
    tag: v2
  mongodb:
    storage: 20Gi
  ```
  ```bash
  helm upgrade food-delivery ./helm/food-delivery -f values-prod.yaml
  ```

### ✅ Checkpoint: Entire platform deployable via single helm install

---

## 🟣 Block 9 — CI/CD: GitHub Actions `[7:15 – 8:00]`

> **Goal:** Automate build → push → deploy pipeline.

### Concepts to Revise
- Workflow triggers: `push`, `pull_request`, `workflow_dispatch`
- Jobs, steps, actions
- Secrets management in GitHub
- Matrix builds (parallel jobs)
- Artifact & image caching

### Tasks

- [ ] **9.1** Create `.github/workflows/ci-cd.yml`
  ```yaml
  name: Food Delivery CI/CD

  on:
    push:
      branches: [main, develop]
    pull_request:
      branches: [main]
    workflow_dispatch:

  env:
    DOCKER_HUB_USERNAME: ${{ secrets.DOCKER_HUB_USERNAME }}

  jobs:
    # =================== BUILD & TEST ===================
    build-and-test:
      runs-on: ubuntu-latest
      strategy:
        matrix:
          service: [user-service, restaurant-service, order-service, api-gateway]
      steps:
        - name: Checkout code
          uses: actions/checkout@v4

        - name: Setup Node.js
          uses: actions/setup-node@v4
          with:
            node-version: '18'
            cache: 'npm'
            cache-dependency-path: ${{ matrix.service }}/package-lock.json

        - name: Install dependencies
          working-directory: ${{ matrix.service }}
          run: npm ci

        # - name: Run tests
        #   working-directory: ${{ matrix.service }}
        #   run: npm test

    # =================== DOCKER BUILD & PUSH ===================
    docker-build:
      runs-on: ubuntu-latest
      needs: build-and-test
      if: github.ref == 'refs/heads/main'
      strategy:
        matrix:
          include:
            - service: user-service
              context: ./user-service
            - service: restaurant-service
              context: ./restaurant-service
            - service: order-service
              context: ./order-service
            - service: api-gateway
              context: ./api-gateway
            - service: frontend
              context: ./frontend
      steps:
        - name: Checkout
          uses: actions/checkout@v4

        - name: Login to Docker Hub
          uses: docker/login-action@v3
          with:
            username: ${{ secrets.DOCKER_HUB_USERNAME }}
            password: ${{ secrets.DOCKER_HUB_TOKEN }}

        - name: Set up Docker Buildx
          uses: docker/setup-buildx-action@v3

        - name: Build and push
          uses: docker/build-push-action@v6
          with:
            context: ${{ matrix.context }}
            push: true
            tags: |
              ${{ secrets.DOCKER_HUB_USERNAME }}/food-${{ matrix.service }}:latest
              ${{ secrets.DOCKER_HUB_USERNAME }}/food-${{ matrix.service }}:${{ github.sha }}
            cache-from: type=gha
            cache-to: type=gha,mode=max

    # =================== DEPLOY TO K8S ===================
    deploy:
      runs-on: ubuntu-latest
      needs: docker-build
      if: github.ref == 'refs/heads/main'
      environment: production
      steps:
        - name: Checkout
          uses: actions/checkout@v4

        - name: Set up kubectl
          uses: azure/setup-kubectl@v4

        - name: Configure kubeconfig
          run: |
            mkdir -p $HOME/.kube
            echo "${{ secrets.KUBE_CONFIG }}" | base64 -d > $HOME/.kube/config

        - name: Deploy with Helm
          run: |
            helm upgrade --install food-delivery ./helm/food-delivery \
              --namespace food-delivery \
              --create-namespace \
              --set userService.tag=${{ github.sha }} \
              --set restaurantService.tag=${{ github.sha }} \
              --set orderService.tag=${{ github.sha }} \
              --set apiGateway.tag=${{ github.sha }} \
              --set frontend.tag=${{ github.sha }} \
              --wait --timeout 300s
  ```

- [ ] **9.2** Add required GitHub Secrets
  ```
  Settings → Secrets → Actions:
    DOCKER_HUB_USERNAME  = your username
    DOCKER_HUB_TOKEN     = your access token
    KUBE_CONFIG           = base64 encoded kubeconfig
  ```

- [ ] **9.3** Create `.gitignore`
  ```
  node_modules/
  .env
  dist/
  *.log
  ```

- [ ] **9.4** Initialize git and push
  ```bash
  git init
  git add .
  git commit -m "feat: complete food delivery platform with K8s + CI/CD"
  git remote add origin <your-repo-url>
  git branch -M main
  git push -u origin main
  ```

- [ ] **9.5** Watch pipeline run on GitHub Actions tab

- [ ] **9.6** Make a small change, push, watch auto-deploy

### ✅ Checkpoint: Push to main → auto build → push images → deploy to K8s

---

## 🏁 Final Verification Checklist

```bash
# Docker
docker images | grep food/                     # All 5 images exist

# Docker Compose
docker-compose up -d && docker-compose ps       # All services healthy

# Kubernetes
kubectl get all -n food-delivery                # All resources running
kubectl get sc                                  # StorageClass exists
kubectl get pv                                  # PV bound
kubectl get pvc -n food-delivery                # PVC bound
kubectl get gateway -n food-delivery            # Gateway ready
kubectl get httproute -n food-delivery          # Routes configured
kubectl get hpa -n food-delivery                # HPA active

# Helm
helm list -n food-delivery                      # Release installed
helm history food-delivery -n food-delivery     # Revision history

# CI/CD
# Check GitHub Actions → green pipeline ✅
```

---

## 📝 Quick Reference — Commands Cheat Sheet

| Action | Command |
|--------|---------|
| Build image | `docker build -t name:tag .` |
| Compose up | `docker-compose up -d --build` |
| Apply manifest | `kubectl apply -f file.yaml` |
| Get all resources | `kubectl get all -n food-delivery` |
| Describe resource | `kubectl describe pod/svc/deploy <name>` |
| Pod logs | `kubectl logs <pod> -f` |
| Exec into pod | `kubectl exec -it <pod> -- /bin/sh` |
| Port forward | `kubectl port-forward svc/<name> local:remote` |
| Scale | `kubectl scale deploy <name> --replicas=N` |
| Rolling update | `kubectl set image deploy/<name> container=img:tag` |
| Rollback | `kubectl rollout undo deploy/<name>` |
| Helm install | `helm install <release> ./chart` |
| Helm upgrade | `helm upgrade <release> ./chart --set key=val` |
| Helm rollback | `helm rollback <release> <revision>` |

---

> [!IMPORTANT]
> **You don't learn DevOps by reading — you learn by typing commands and fixing errors.** Every error you encounter is a learning opportunity. Don't copy-paste blindly; understand what each command does.

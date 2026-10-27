# Production AWS Deployment Guide
## Doctor Website & Clinic Management System (MediNexus OS)

This guide provides step-by-step instructions for deploying your clinic website and management platform to Amazon Web Services (AWS) so that doctors, reception staff, and patients can access it 24/7 worldwide from any mobile phone, tablet, or desktop.

---

## 1. Architecture Options on AWS

Depending on your budget and clinical scale, choose one of the two architectures below:

| Criteria | Option A: AWS Lightsail / EC2 (Docker) | Option B: AWS ECS Fargate + RDS |
| :--- | :--- | :--- |
| **Best For** | Single clinic or regional practice (Pune, Mumbai) | Large SaaS serving 20+ independent clinics |
| **Monthly Cost** | **\$5 – \$20 / month** | \$60 – \$150 / month |
| **Setup Time** | **15 minutes** | 45 minutes |
| **Maintenance** | Very low (Docker automated compose) | Fully managed serverless containers |
| **Database** | PostgreSQL in container or Lightsail DB | AWS RDS PostgreSQL with automated snapshots |
| **Domain & SSL** | Free automated Let's Encrypt SSL | AWS Certificate Manager (ACM) via ALB |

---

## 2. Option A: Fastest 15-Minute Deployment (AWS Lightsail or EC2)

### Step 1: Launch an AWS Instance
1. Log in to [AWS Console](https://console.aws.amazon.com/).
2. Navigate to **Amazon Lightsail** (or **EC2**).
3. Click **Create Instance**:
   - **Platform**: Linux/Unix
   - **Blueprint**: Ubuntu 22.04 LTS (or 24.04 LTS)
   - **Instance Plan**: \$10/month (2 GB RAM, 1 vCPU, 60 GB SSD) — perfect for Next.js App Router + PostgreSQL.
   - **Name**: `medinexus-apex-clinic`
4. Click **Create instance**.

### Step 2: Open Firewall Ports in AWS
In your Lightsail/EC2 Networking tab, add firewall rules for:
- **Port 80 (HTTP)**: `0.0.0.0/0`
- **Port 443 (HTTPS)**: `0.0.0.0/0`
- **Port 3001 (App Port - optional if using reverse proxy)**: `0.0.0.0/0`
- **Port 22 (SSH)**: Your IP or browser SSH

### Step 3: Connect via SSH & Install Docker
Connect to your server via browser SSH or terminal:
```bash
sudo apt update && sudo apt upgrade -y

# Install Docker & Docker Compose plugin
sudo apt install -y docker.io docker-compose-v2 git

# Add your user to the docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Step 4: Clone the Codebase
```bash
cd /home/ubuntu
git clone <YOUR_GIT_REPO_URL> clinic-os
cd clinic-os
```

### Step 5: Configure Production Environment Variables
Create a `.env.production` file:
```bash
nano .env.production
```
Paste your production settings:
```env
NODE_ENV=production
PORT=3001

# Production Database (PostgreSQL container inside docker network)
DATABASE_URL="postgresql://medinexus_user:StrongSecurePassword2026@postgres:5432/medinexus_db?schema=public"

# Cryptographic Session Secret (Generate via: openssl rand -base64 32)
JWT_SECRET="c2VjdXJlX2NsaW5pY19zZXNzaW9uX2tleV9mb3JfcHVuZV8yMDI2"

# Public Clinic Metadata
NEXT_PUBLIC_CLINIC_NAME="Apex Dental & Aesthetic Lounge"
NEXT_PUBLIC_CLINIC_PHONE="+91 98230 45678"
NEXT_PUBLIC_CLINIC_WHATSAPP="+91 98230 45678"
NEXT_PUBLIC_CLINIC_CITY="Pune"
NEXT_PUBLIC_BASE_URL="https://yourclinicdomain.com"
```

### Step 6: Build & Launch with Docker Compose
```bash
# Build the production image and start database + web app
docker compose -f docker-compose.prod.yml up -d --build

# Run database schema migration & seed demo clinic records
docker compose -f docker-compose.prod.yml exec web npx prisma db push
docker compose -f docker-compose.prod.yml exec web npm run seed
```

### Step 7: Configure Custom Domain & Free SSL (Nginx + Certbot)
To point your clinic domain (e.g. `apexdental.in` or `drananya.in`) with automated HTTPS:

1. Install Nginx and Certbot:
   ```bash
   sudo apt install -y nginx certbot python3-certbot-nginx
   ```
2. Configure Nginx reverse proxy:
   ```bash
   sudo nano /etc/nginx/sites-available/clinic
   ```
   Paste:
   ```nginx
   server {
       server_name yourclinicdomain.com www.yourclinicdomain.com;

       location / {
           proxy_pass http://127.0.0.1:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
3. Enable site and issue SSL:
   ```bash
   sudo ln -s /etc/nginx/sites-available/clinic /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   sudo certbot --nginx -d yourclinicdomain.com -d www.yourclinicdomain.com
   ```

Certbot will automatically install SSL certificates and configure auto-renewal via cron.

---

## 3. Option B: AWS ECS Fargate + RDS (High-Availability Cloud Architecture)

For medical practices requiring Multi-AZ redundancy, HIPAA/DPDP data compliance, and automated scaling:

```
[Internet Users] 
       │
       ▼
[AWS Route 53 (DNS)] 
       │
       ▼
[AWS Application Load Balancer (HTTPS / ACM SSL)]
       │
       ▼
[AWS ECS Fargate Cluster] ──► Auto-scaling container tasks running Dockerfile
       │
       ▼
[AWS RDS PostgreSQL (Multi-AZ)] ──► Daily automated encrypted backups
```

### Deployment Steps:
1. **Push Container to AWS ECR**:
   ```bash
   aws ecr create-repository --repository-name medinexus-clinic --region ap-south-1
   aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com
   docker build -t medinexus-clinic .
   docker tag medinexus-clinic:latest <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/medinexus-clinic:latest
   docker push <AWS_ACCOUNT_ID>.dkr.ecr.ap-south-1.amazonaws.com/medinexus-clinic:latest
   ```
2. **Create AWS RDS PostgreSQL**:
   - Engine: PostgreSQL 16
   - Region: `ap-south-1` (Mumbai) for sub-10ms Indian latency
   - Enable automated snapshots & encryption at rest (KMS).
3. **Create ECS Fargate Task Definition**:
   - CPU: 0.5 vCPU, Memory: 1 GB
   - Port mappings: 3001
   - Inject `DATABASE_URL` from AWS Secrets Manager.
4. **Attach Application Load Balancer (ALB)**:
   - Target group: Port 3001
   - Health check path: `/`
   - Attach AWS Certificate Manager (ACM) wildcard certificate.

---

## 4. Maintenance, Backups & Verification

### Viewing Live Logs:
```bash
docker compose -f docker-compose.prod.yml logs -f web
```

### Automated Database Backups:
Add a daily cron job to back up your database to AWS S3:
```bash
crontab -e
# Add daily backup at 2:00 AM IST:
0 2 * * * docker compose -f /home/ubuntu/clinic-os/docker-compose.prod.yml exec -T postgres pg_dump -U medinexus_user medinexus_db | gzip > /home/ubuntu/backups/clinic_$(date +\%F).sql.gz
```

### Zero-Downtime Updates:
When you push code updates:
```bash
git pull origin main
docker compose -f docker-compose.prod.yml up -d --build web
```
The Docker container will perform a rolling update without dropping active patient appointments.

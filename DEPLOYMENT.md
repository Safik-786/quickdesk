# QuickDesk Deployment Guide

QuickDesk is fully containerized using Docker, making deployment incredibly easy. This guide covers both **Local Development** and **Production Deployment via Docker Hub**.

---

## 💻 1. Local Development Deployment

If you are running the app on your local machine to write code or test:

1. Ensure **Docker** and **Docker Compose** are installed.
2. In the `quickdesk-api` folder, copy `.env.example` to `.env` and insert your `GEMINI_API_KEY`.
3. Open a terminal in the root `QuickDesk` directory and run:

```bash
docker-compose up -d --build
```

- **Web App**: [http://localhost](http://localhost)
- **API Server**: [http://localhost:3000](http://localhost:3000)

*(This uses `docker-compose.yml` to build the images from your local code on the fly).*

---

## 🚀 2. Production Deployment (Docker Hub)

When deploying to a live remote server (like AWS, DigitalOcean, or an internal enterprise server), you don't send your raw code. Instead, you build the Docker images, push them to a public/private registry like Docker Hub, and then the production server simply pulls them.

### Step A: Build & Push Images to Docker Hub (From your Local Machine)

First, log into Docker Hub using your terminal:
```bash
docker login
```

Next, build and "tag" your images with your Docker Hub username (replace `yourusername` with your actual Docker username):

**1. Build & Push the API Image:**
```bash
# Build the image using the API Dockerfile
docker build -t yourusername/quickdesk-api:latest ./quickdesk-api

# Push the image to Docker Hub
docker push yourusername/quickdesk-api:latest
```

**2. Build & Push the Web Image:**
```bash
# Build the image using the Web Dockerfile
docker build -t yourusername/quickdesk-web:latest ./quickdesk-web

# Push the image to Docker Hub
docker push yourusername/quickdesk-web:latest
```

---

### Step B: Setup the Production Server

SSH into your production server. The **only** two things you need on your server are the `docker-compose.prod.yml` file and a `.env` file.

**1. Transfer the Docker Compose file**
Copy the contents of `docker-compose.prod.yml` to your server (e.g., using `nano docker-compose.yml` and pasting it).

**2. Create the Secure `.env` File**
Because secrets are never pushed to Docker Hub, you must manually create the `.env` file on the server.

```bash
nano .env
```

Paste your secure production variables into it:
```env
DOCKER_USERNAME=yourusername
DB_PASSWORD=your_super_secure_database_password
GEMINI_API_KEY=AIzaSyB...your_api_key_here...
JWT_SECRET=your_super_secure_jwt_secret
PORT=3000
```
Save and exit (`Ctrl+O`, `Enter`, `Ctrl+X`).

---

### Step C: Run the Application in Production

While SSH'd into your production server (in the same folder as your new `.env` and `docker-compose.yml` files), run:

```bash
docker-compose up -d
```

### What happens in Production?
1. Docker reads your `DOCKER_USERNAME` from the `.env` file.
2. It automatically pulls `yourusername/quickdesk-api:latest` and `yourusername/quickdesk-web:latest` securely from Docker Hub.
3. The `postgres` container starts up with `pgvector`.
4. The API container automatically runs `npx prisma migrate deploy` to create your database tables and runs the seed script to insert your AI Knowledge Base embeddings.
5. The API and Web servers start instantly!

## Useful Commands

**View live logs:**
```bash
docker-compose logs -f
```

**Pull latest images & restart (When you release an update):**
```bash
docker-compose pull
docker-compose up -d
```

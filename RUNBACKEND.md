# 🧠 Chorely Backend + DB (for Frontend Devs)


#### You do **not** need to clone or modify the backend repo to run the backend.

#### This guide is for anyone who wants to run the ***Chorely backend and database** locally using Docker. 
---

## 🧰 Requirements
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

---

## 🚀 One-Step Setup
From the chorely frontend project root (where `docker-compose.yml` should already exist):

```bash
docker compose up --pull always --build
```

This will:
- Pull the backend image from GitHub (if updated)
- Build it for production (faster startup)
- Start the PostgreSQL database
    - https://dbdiagram.io/d/68983724dd90d178653d33e4
- Run all database migrations and seeds

---

## 🌐 API Access
Once running, the backend API will be live at:
```
http://localhost:4000
```

Refer to the API documentation here:
👉 [ApiDoc.md](https://github.com/lmmeqa/chorely-backend/blob/main/ApiDoc.md)
or here: [Postman documentation](https://documenter.getpostman.com/view/19704779/2sB3BBrXzG)

---

## 🛑 Stopping It
When you're done:
```bash
Ctrl + C       # stops the containers
```
To remove all containers and volumes:
```bash
docker compose down -v
```

---

## 💡 Notes
- Any backend or DB changes made while the container is running are **temporary**.
- If the `start_demo.sh` script changes, you should re-pull and rebuild:
```bash
docker compose up --pull always --build
```

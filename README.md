# Localization Management System

This repository contains a **full-stack localization management system**, combining two separate projects:

- **Frontend (UI)**: Built with **React**, **Next.js**, **Zustand**, and **React Query**
- **Backend (API & Data)**: Built with **FastAPI** and **Supabase**


##  Overview

This system enables teams to manage localization keys and translations across multiple projects and languages, with secure user authentication and powerful inline management features.


##  Project Structure

```
repo-root/
│
├── ui/            # Frontend (Next.js + React)
│
└── backend/       # Backend (FastAPI + Supabase)
```


##  Frontend (UI)

### 🔧 Tech Stack
- **React & Next.js** — component-based architecture & server-side rendering
- **Zustand** — global state management (uiStore for auth & selections)
- **React Query** — API data fetching & caching
- **Supabase Auth** — secure JWT-based authentication

###  App Flow & Features
- **Login Page**: Authenticates users with Supabase IAM, stores JWT in Zustand.
- **Main Page Layout**:
  - **Header**: Displays logged-in user’s email.
  - **Sidebar**: Dropdowns to select a **Project** and **Language**.
  - **Hero Section**:
    - **Search Bar**: Local search (future: server-side with pagination).
    - **Filter Panel**: Multi-select categories (can later fetch from DB).
    - **Add Key**: Insert new localization key.
    - **Bulk Add**: Upload CSV to insert multiple keys.
    - **Translation Manager Grid**: Inline editing and deletion.

### State & Security
- JWT token is stored in Zustand and attached to every API call via `Authorization` header.
- Unauthorized requests result in `401 Unauthorized`.


## Backend (FastAPI + Supabase)

### Database Schema
- Normalized relational schema with foreign key constraints:


projects --> translation\_keys --> translations


- `language_store` table manages language metadata.

### Authentication
- Supabase IAM manages users & issues JWTs.
- All API routes use JWT verification via Supabase `get_user()` and `get_current_user`.

### API Endpoints
| Method | Endpoint                                      | Description                                 |
|--------|-----------------------------------------------|---------------------------------------------|
| GET    | `/profile`                                    | Validates token, returns current user email |
| GET    | `/localizations/`                             | Fetch projects & languages                  |
| GET    | `/localizations/{project_id}/{locale}`        | Get keys & translations for project/lang    |
| POST   | `/localizations/{project_id}`                 | Add new key + values for all languages      |
| PUT    | `/localizations/{project_id}`                 | Update translation value & metadata         |
| DELETE | `/localizations/{project_id}/{key}`           | Delete a key & its translations             |
| POST   | `/localizations/upload/{project_id}/{lang}`   | Bulk upload translations via CSV            |

### Design Highlights
- **UUIDs** for primary keys to avoid collisions & support distributed inserts.
- Bulk CSV upload for rapid onboarding of large localization datasets.
- Responses are transformed into UI-friendly JSON.

---

## Trade-offs & Improvements
- API authorization adds slight overhead for each request (but improves security).
- Bulk inserts use multiple `insert()` calls (simpler error handling), can later optimize.
- Currently uses local client-side search — can migrate to server-side with pagination as data grows.

---

## Getting Started

### Clone the repo
```bash
git clone https://github.com/your-org/localization-management.git
cd localization-management
````

### Setup the Frontend

```bash
cd ui
cp .env.local.example .env.local
npm install
npm run dev
```

### Setup the Backend

```bash
cd ../backend
cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload
```

---

## ✅ Usage

* Log in using your Supabase IAM credentials.
* Select a Project & Language from the sidebar.
* Manage translation keys via the grid, add new keys, or upload bulk CSV files.

---

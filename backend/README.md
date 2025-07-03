# Localization Management API

This is a FastAPI application to manage localizations.

## Setup

1.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

3.  Add the .env File with:
    ```bash
    SUPABASE_URL="https://<project_id>.supabase.co"
    SUPABASE_ANON_KEY="GET_KEY_FROM_SUPABASE"
    SUPABASE_KEY=""GET_KEY_FROM_SUPABASE""
    SUPABASE_PROJECT_ID="<project_id>"
    ```
4.  Runnig Unit test cases:
    ```bash
    # Need to update the Bearer token
    pytest test_main.py
    ```

## Running the server

```bash
uvicorn src.localization_management_api.main:app --reload
```
## Swagger to test all the URLs

```bash
`http://127.0.0.1:8000/docs`
```



The API will be available at `http://127.0.0.1:8000`.

### Example Usage

To get localizations for a project, you can access:
`http://127.0.0.1:8000/localizations/your_project_id/en_US`

### Database Schema from SupaBase
```bash
create table public.language_store (
  id text not null,
  value text not null,
  constraint language_store_pkey primary key (id)
) TABLESPACE pg_default;

create table public.projects (
  id text not null,
  project_name text not null,
  constraint projects_pkey primary key (id)
) TABLESPACE pg_default;

create table public.translation_keys (
  id text not null,
  key text not null default ''::text,
  category text not null default ''::text,
  description text null default ''::text,
  project_id text not null,
  constraint translation_keys_pkey primary key (id),
  constraint translation_keys_id_key unique (id),
  constraint translation_keys_key_key unique (key),
  constraint translation_keys_project_id_fkey foreign KEY (project_id) references projects (id)
) TABLESPACE pg_default;

create table public.translations (
  id text not null default ''::text,
  key_id text not null default ''::text,
  language_code text not null,
  value text null default ''::text,
  updated_at timestamp without time zone null default now(),
  updated_by text null,
  project_id text not null,
  constraint translations_pkey primary key (id),
  constraint translations_id_key unique (id),
  constraint translations_project_id_fkey foreign KEY (project_id) references projects (id)
) TABLESPACE pg_default;
```
---
### Architecture


1. **Schema Design**:

   * Designed normalized schema with **foreign key constraints**:

     * `projects` ⟶ `translation_keys` ⟶ `translations` (One-to-Many relationships).
   * Added `language_store` table to manage language metadata.
   * Enforced relational integrity at the database level to avoid orphan records.

2. **Authentication**:

   * Integrated **Supabase IAM** (Identity and Access Management).
   * API-level access protected using **JWT-based Authorization**.
   * Verified tokens using Supabase’s `get_user()` and custom `get_current_user` dependency.

3. **API Endpoints**:

   * `GET /profile`: Validates and returns current user email.
   * `GET /localizations/`: Fetches available projects and languages.
   * `GET /localizations/{project_id}/{locale}`: Returns translation keys and their localized values.
   * `POST /localizations/{project_id}`: Adds a new translation key with values for all available languages.
   * `PUT /localizations/{project_id}`: Updates a translation's value and metadata.
   * `DELETE /localizations/{project_id}/{key}`: Deletes a translation key and its child translations.
   * `POST /localizations/upload/{project_id}/{lang}`: Supports **bulk translation upload** via CSV.

4. **Impactful Design Choices**:

   * Used **UUIDs** for primary keys to avoid collisions and support distributed insertions.
   * CSV uploads support scalable onboarding of localization content.
   * Data is returned in a **UI-consumable JSON format** by transforming raw Supabase responses.

5. **Trade-offs**:

   * Authorization is performed for every API call for security, which introduces slight overhead.
   * Bulk insertions use multiple `insert()` calls instead of batched queries (simpler error handling but slower performance for very large files).
   * Search currently done client-side; can be moved to server-side with pagination as data grows.

---


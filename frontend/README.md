# Localization Management UI 
## Getting Started

First, run the development server:

```bash
npm install
# then
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.


### Need to add .env.local File
```bash
  # Include this lines
  NEXT_PUBLIC_SUPABASE_URL=https://<project_id>.supabase.co
  NEXT_PUBLIC_SUPABASE_ANON_KEY=GET_FROM_SUPABASE
```
---

### Architecture

1. The UI is modularized into **Components**, **Hooks**, and a global state managed via **Zustand** (`uiStore`).
2. Initially, the application loads the **Login** component (`login.tsx`), where Supabase Auth is directly used to authenticate the user. Upon successful login, the auth token is retrieved and stored in the Zustand store for subsequent API calls.
3. After successful login, the user is redirected to the **Main Page**.
4. The Main Page is structured into three primary areas: **Header (Top Nav)**, **Sidebar (Navigation)**, and the **Hero Section** (Toolbar + Translation Manager Grid).
5. The **Top Navigation Bar** displays the logged-in user's email. (Note: The user must be enrolled in the Supabase IAM beforehand.)
6. The **Sidebar** includes dropdowns for selecting a **Project** and a **Language**, enabling users to view localization keys specific to a project-language pair.
7. The **Hero Section** includes:

   * A **Search Bar** that performs a local search based on key matches. (Currently local; can later be replaced with a server-side search API using pagination/chunking.)
   * A **Filter Panel** with multi-select capabilities for predefined categories. (These can later be made dynamic by fetching from the database.)
   * An **"Add Key"** button to insert a new key with its value, description, and category.
   * A **"Bulk Add"** option to upload a CSV file and insert multiple keys at once.
8. The **Translation Manager Grid** displays all keys along with their translations and descriptions. It supports **inline editing** and **deletion** of keys.
9. All API interactions are managed using **React Query**, with global state handled by **Zustand**. Every API request includes the Supabase auth token in the Authorization header. Without it, the server returns a `401 Unauthorized` error.

---


### Screenshot for the Project

#### Home Page
![Home Page](https://raw.githubusercontent.com/ParagShah97/HeliumUI/main/screenshots/HomePage.jpg)


---
#### Edit Mode
![Grid Edit Mode](https://raw.githubusercontent.com/ParagShah97/HeliumUI/main/screenshots/edit_mode.jpg)

---

#### Search and Filters Toolbar
![Search & Filter](https://raw.githubusercontent.com/ParagShah97/HeliumUI/main/screenshots/search%20and%20filter.jpg)

---

#### Add Single Key
![Add Single Key](https://raw.githubusercontent.com/ParagShah97/HeliumUI/main/screenshots/Add%20keys.jpg)

---

#### Add Bulk Keys with CSV
![Add Bulk Keys](https://raw.githubusercontent.com/ParagShah97/HeliumUI/main/screenshots/buld%20add.jpg)




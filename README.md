![Project Banner](docs/readme-agent/banner.svg)

# Admin Inter

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Technology Stack

- JavaScript
- CSS
- HTML
- npm

# Admin Inter

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Admin Inter is a template designed for building administrative interfaces, featuring robust authentication flows and real-time order monitoring capabilities.

## 🚀 Features

This application is structured to handle complex administrative tasks, including:

*   **Authentication:** Dedicated components for user login, forgot password, and protected routes (`src/auth/Login.jsx`, `src/auth/ProtectedRoute.jsx`).
*   **State Management:** Custom hooks for handling authentication state (`src/hooks/useAdminAuth.js`) and session timeouts.
*   **Order Monitoring:** Components for displaying live order data (`src/components/LiveOrderCard.jsx`) and monitoring campus orders (`src/hooks/useCampusOrderMonitor.js`).
*   **Database Integration:** Includes Supabase migration files for real-time public shop data (`supabase/migrations/20260404120000_realtime_public_shops.sql`).

## 🛠️ Tech Stack

*   JavaScript
*   CSS
*   HTML
*   npm

## ⚙️ Installation

To get started, follow these steps:

1.  **Clone the repository:**
    ```bash
git clone [repository-url]
cd admin-inter
```
2.  **Install dependencies:**
    ```bash
npm install
```

## ▶️ Usage

### Development

To run the application in development mode with Hot Module Replacement (HMR):
```bash
npm run dev
```

### Building for Production

To create a production build of the application:
```bash
npm run build
```

### Running Tests (Linting)

To run ESLint checks on the project:
```bash
npm run lint
```

### Previewing the Build

To serve the production build locally for testing:
```bash
npm run preview
```

## 📂 Project Structure

The project is organized into several key directories:

*   **`src/`**: Contains all application source code, including components, hooks, and authentication logic.
    *   `src/auth/`: Authentication related files (e.g., `Login.jsx`, `ForgotPassword.jsx`).
    *   `src/hooks/`: Custom hooks for business logic (e.g., `useAdminAuth.js`).
    *   `src/components/`: Reusable UI components (e.g., `LiveOrderCard.jsx`).
*   **`supabase/`**: Contains database migration scripts for Supabase integration.
*   **`public/`**: Static assets like favicons and icons.
*   **Root**: Configuration files (`package.json`, `vite.config.js`, `eslint.config.js`).

## Setup Guide

### Frontend Setup

```bash

npm install
npm run dev     # development
npm run build && npm start   # production
```

Open `http://127.0.0.1:5173` (or the port shown in the terminal).

### Configuration

Copy environment templates before running:

- `.env.example` → copy to `.env` in the same directory

### Running the Application

1. **Start web app** — `npm run dev` in `./`

```bash
cd .
npm install
npm run dev
```

## System Architecture

High-level system design, data flows, API map, and workflow pipelines derived from the repository structure.

### System Architecture

```mermaid
graph TB
    subgraph Client["Client Layer"]
        user["User / Operator"]
        api_client["API / CLI Client"]
    end

    subgraph Core["src/ — Application Core"]
    end

    subgraph Data["Data & Artifacts"]
        datasets["Datasets · JSON · CSV"]
    end

    subgraph Charts["Metrics & Dashboard Charts"]
        page_views["Page views chart"]
        nav_sections["Navigation sections map"]
        project_showcase["Project showcase grid"]
        skills_timeline["Skills & experience timeline"]
        contact_funnel["Contact conversion funnel"]
        media_gallery["Media & assets gallery"]
    end

    user --> api_client
    api_client --> Core
    user -->|Web UI| dashboard_kpis
    Core --> page_views
    page_views --> user
```

### Data Flow & Charts Pipeline

```mermaid
flowchart LR
    U["User / Event"] --> IN["Untrusted Input"]

    subgraph Pipeline["Processing Pipeline"]
        p0["Input"]
        p1["Processing"]
        p2["Output"]
        p0 --> p1
        p1 --> p2
    end

    subgraph Metrics["Metrics & Chart Feeds"]
        page_views["Page views chart"]
        nav_sections["Navigation sections map"]
        project_showcase["Project showcase grid"]
        skills_timeline["Skills & experience timeline"]
        contact_funnel["Contact conversion funnel"]
        media_gallery["Media & assets gallery"]
    end

    IN --> p0
    p2 --> OUT["Authorized Output"]
    OUT --> U
    p2 --> page_views
    page_views --> U
```

### Component & API Map

```mermaid
graph LR
    subgraph App["src Components"]
        main["main<br/>Main"]
    end
```

### Application Page Map

```mermaid
mindmap
  root((admin-inter))
    Web UI
      dashboard
```

## Application Pages

Screenshots captured from the running application. Each page is listed with its function.

### Application

#### Analytics

Analytics — application page at `/analytics`

![Analytics](docs/readme-agent/pages/analytics.png)

#### Forgot Password

Forgot Password — application page at `/forgot-password`

![Forgot Password](docs/readme-agent/pages/forgot-password.png)

#### Reset Password

Reset Password — application page at `/reset-password`

![Reset Password](docs/readme-agent/pages/reset-password.png)

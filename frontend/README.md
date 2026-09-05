# VIGIL — Infrastructure Early Warning System Frontend

Frontend command center interface for **VIGIL (Vehicle for Infrastructure Governance & Intervention Logistics)**.

Designed for government infrastructure judges, senior oversight officers, and public auditors:
- **National Command Center (`/`)**: Portfolio macro metrics, risk distribution, sector capital exposure, and prioritized intervention queue.
- **Project Console (`/projects/:projectId`)**: Real-time point-in-time project health, trajectory kinematics, and deterministic TreeSHAP "WHY?" attribution.
- **Historical Replay Engine (`/projects/:projectId/replay`)**: Longitudinal month-by-month interactive replay proving early-warning alert precedence and lead time before deterioration.

---

## 1. Quick Start

### Prerequisites
- Node.js `v18+` (recommended: Node `v20+`)
- Python `.venv` with FastAPI backend dependencies installed

### Step 1: Start Backend API
In the project root:
```bash
.venv/bin/uvicorn vigil.api:app --reload --port 8000
```
Backend API will be live at `http://127.0.0.1:8000` (`/health`, `/api/projects`, etc.).

### Step 2: Start Frontend Development Server
In the `frontend/` directory:
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 2. Environment Configuration

By default, Vite proxies requests from `/api` and `/health` to `http://127.0.0.1:8000`.

To connect to a remote or custom backend endpoint, configure `VITE_API_URL`:
```bash
# In frontend/.env.local or shell:
VITE_API_URL=http://localhost:8000
```

---

## 3. Production Build

To compile TypeScript and create an optimized production bundle:
```bash
cd frontend
npm run build
```
Built assets will be emitted to `frontend/dist/`.

To preview the production build locally:
```bash
npm run preview
```

---

## 4. Key Screens

| Screen | Route | Key Features |
| :--- | :--- | :--- |
| **National Command Center** | `/` | 6 Macro KPIs, Risk Distribution breakdown, Sector Risk Exposure, Prioritized Intervention Queue ($P \times C_{\text{base}}$). |
| **Project Console** | `/projects/:projectId` | Current Risk Hero Panel, TreeSHAP "WHY?" attribution card, Trajectory Risk curve, Financial baseline vs expenditure, Schedule deviation. |
| **Historical Replay** | `/projects/:projectId/replay` | Month-by-month playback controls (Play, Pause, Scrub, Speed), Alert milestone markers, Deterioration detection, Validated Lead Time. |

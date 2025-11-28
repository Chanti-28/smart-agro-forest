# Smart Agriculture & Forestry – Full Stack Console (with Auth)

This project is a **modern end-to-end web application** for managing farms, plots,
sensors, readings and alerts, with:

- Full CRUD for all entities
- Smart analytics (irrigation recommendation + fire-risk assessment)
- **Real backend authentication** (register, login, logout, current user)
- AWS-style console UI with green agriculture & forestry theme
- Charts (Recharts) and map (React-Leaflet + OpenStreetMap)

## 1. Tech stack

- **Backend:** FastAPI (Python), SQLite, SQLAlchemy
- **Frontend:** React + Vite + React Router
- **Charts:** Recharts
- **Map:** React-Leaflet
- **Custom domain library:** `smart_agri_forest` (irrigation + fire risk)
- **Auth:** Users table + session tokens stored in DB, validated by backend

## 2. Backend – setup & run

1. Open a terminal and go to the backend folder:

   ```bash
   cd backend
   ```

2. (Optional but recommended) Create a virtual environment:

   ```bash
   python -m venv venv
   # Windows:
   venv\Scripts\activate
   # macOS/Linux:
   # source venv/bin/activate
   ```

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Run the API:

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at: **http://localhost:8000**

   Useful endpoints:

   - Root health: `GET /`
   - Auth:
     - `POST /auth/register`
     - `POST /auth/login`
     - `POST /auth/logout`
     - `GET /auth/me`
   - CRUD:
     - `/farms`, `/plots`, `/sensors`, `/readings`, `/alerts`
   - Analytics:
     - `GET /analytics/plots/{plot_id}/status`

   A local SQLite database file `smart_agro_forest.db` will be created in the
   backend folder automatically.

## 3. Frontend – setup & run

1. Open a **new terminal** and go to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

   Vite will show a URL like:

   - **http://localhost:5173**

4. Open that URL in your browser.

## 4. Using authentication (Login / Register / Logout)

1. When you open the app, you will see the **Landing page** with two modes:

   - **Login**
   - **Register**

2. To create a new user:

   - Switch to **Register**
   - Fill in: name, email, password
   - Click **"Register & Login"**
   - The frontend calls:
     - `POST /auth/register` to create the user
     - `POST /auth/login` to obtain a session token
   - The token is stored in `localStorage` and sent in the `Authorization: Bearer ...`
     header on all subsequent API calls.

3. To sign in with an existing user:

   - Use **Login** mode
   - Enter email + password
   - Click **Login**

4. After login:

   - You are redirected to the console.
   - The top-right of the top bar shows:
     - Online status chip
     - Your **name and email**
     - A **Logout** button

5. To logout:

   - Click **Logout** in the top bar.
   - The frontend calls `POST /auth/logout`, clears the token locally,
     and returns you to the Landing page.

All CRUD and analytics endpoints require a valid token; unauthenticated calls
receive `401 Not authenticated` errors.

## 5. Working with the console

Once logged in:

- **Dashboard**
  - Summary cards: farms, plots, sensors, alerts
  - Trend chart: moisture / temperature / humidity
  - Latest alerts list

- **Data Management**
  - Full CRUD tables + forms for:
    - Farms
    - Plots
    - Sensors
    - Readings
    - Alerts
  - Each table row has **Edit** and **Delete** actions.

- **Analytics & Map**
  - Select a plot and click **Get Status**:
    - Calls backend analytics using the `smart_agri_forest` library
    - Returns avg moisture / temperature / humidity
    - Irrigation recommendation
    - Fire-risk (for forestry plots with tree species)
  - Per-plot time series chart for readings
  - Interactive map with approximate farm markers

This project can be used directly for your cloud platform assignment and can
be adapted for deployment on a public cloud (API Gateway/Lambda or container,
static hosting for the frontend, managed DB, etc.).

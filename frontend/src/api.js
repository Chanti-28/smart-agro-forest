// const API_BASE = "https://o4ylf5nkxl.execute-api.us-east-1.amazonaws.com/prod";



// async function request(path, options = {}) {
//   const token = localStorage.getItem("authToken");
//   const headers = {
//     "Content-Type": "application/json",
//     ...(options.headers || {}),
//   };
//   if (token) {
//     headers["Authorization"] = `Bearer ${token}`;
//   }

//   const res = await fetch(API_BASE + path, {
//     ...options,
//     headers,
//   });
//   if (!res.ok) {
//     const text = await res.text();
//     throw new Error(text || "Request failed");
//   }
//   const contentType = res.headers.get("content-type") || "";
//   if (contentType.includes("application/json")) {
//     return res.json();
//   }
//   return null;
// }

// export const api = {
//   // auth
//   login: (data) =>
//     request("/auth/login", {
//       method: "POST",
//       body: JSON.stringify(data),
//     }),
//   register: (data) =>
//     request("/auth/register", {
//       method: "POST",
//       body: JSON.stringify(data),
//     }),
//   me: () => request("/auth/me"),
//   logout: () =>
//     request("/auth/logout", {
//       method: "POST",
//     }),

//   // farms
//   listFarms: () => request("/farms/"),
//   createFarm: (data) =>
//     request("/farms/", { method: "POST", body: JSON.stringify(data) }),
//   updateFarm: (id, data) =>
//     request(`/farms/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     }),
//   deleteFarm: (id) => request(`/farms/${id}`, { method: "DELETE" }),

//   // plots
//   listPlots: () => request("/plots/"),
//   createPlot: (data) =>
//     request("/plots/", { method: "POST", body: JSON.stringify(data) }),
//   updatePlot: (id, data) =>
//     request(`/plots/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     }),
//   deletePlot: (id) => request(`/plots/${id}`, { method: "DELETE" }),

//   // sensors
//   listSensors: () => request("/sensors/"),
//   createSensor: (data) =>
//     request("/sensors/", { method: "POST", body: JSON.stringify(data) }),
//   updateSensor: (id, data) =>
//     request(`/sensors/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     }),
//   deleteSensor: (id) => request(`/sensors/${id}`, { method: "DELETE" }),

//   // readings
//   listReadings: () => request("/readings/"),
//   createReading: (data) =>
//     request("/readings/", { method: "POST", body: JSON.stringify(data) }),
//   updateReading: (id, data) =>
//     request(`/readings/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     }),
//   deleteReading: (id) => request(`/readings/${id}`, { method: "DELETE" }),

//   // alerts
//   listAlerts: () => request("/alerts/"),
//   createAlert: (data) =>
//     request("/alerts/", { method: "POST", body: JSON.stringify(data) }),
//   updateAlert: (id, data) =>
//     request(`/alerts/${id}`, {
//       method: "PUT",
//       body: JSON.stringify(data),
//     }),
//   deleteAlert: (id) => request(`/alerts/${id}`, { method: "DELETE" }),

//   // analytics
//   getPlotStatus: (plotId) => request(`/analytics/plots/${plotId}/status`),
// };
// === AWS API BASE URL ===
const API_BASE =
  "http://98.92.252.172:8000";

// === UNIVERSAL REQUEST HANDLER WITH FULL DEBUG ===
async function request(path, options = {}) {
  const token = localStorage.getItem("authToken");

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response;

  // ---- NETWORK ERRORS (CORS, DNS, offline, blocked) ----
  try {
    response = await fetch(API_BASE + path, {
      ...options,
      headers,
    });
  } catch (networkErr) {
    console.error("❌ Network error calling:", API_BASE + path, networkErr);
    throw new Error(
      `Network error calling ${path}: ${networkErr.message || networkErr}`
    );
  }

  // ---- HTTP ERRORS (401, 403, 404, 500) ----
  if (!response.ok) {
    const text = await response.text();
    const message = `HTTP ${response.status} ${response.statusText} for ${path}: ${
      text || "Request failed"
    }`;

    console.error("❌ API error:", message);

    throw new Error(message);
  }

  // ---- JSON response ----
  const contentType = response.headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return response.json();
  }

  return null;
}

// === FULL API CLIENT ===
export const api = {
  // AUTH --------------------------------------------------------------------
  login: (data) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  register: (data) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: () => request("/auth/me"),

  logout: () =>
    request("/auth/logout", {
      method: "POST",
    }),

  // FARMS -------------------------------------------------------------------
  listFarms: () => request("/farms/"),

  createFarm: (data) =>
    request("/farms/", { method: "POST", body: JSON.stringify(data) }),

  updateFarm: (id, data) =>
    request(`/farms/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteFarm: (id) => request(`/farms/${id}`, { method: "DELETE" }),

  // PLOTS -------------------------------------------------------------------
  listPlots: () => request("/plots/"),

  createPlot: (data) =>
    request("/plots/", { method: "POST", body: JSON.stringify(data) }),

  updatePlot: (id, data) =>
    request(`/plots/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deletePlot: (id) => request(`/plots/${id}`, { method: "DELETE" }),

  // SENSORS -----------------------------------------------------------------
  listSensors: () => request("/sensors/"),

  createSensor: (data) =>
    request("/sensors/", { method: "POST", body: JSON.stringify(data) }),

  updateSensor: (id, data) =>
    request(`/sensors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteSensor: (id) => request(`/sensors/${id}`, { method: "DELETE" }),

  // READINGS ----------------------------------------------------------------
  listReadings: () => request("/readings/"),

  createReading: (data) =>
    request("/readings/", { method: "POST", body: JSON.stringify(data) }),

  updateReading: (id, data) =>
    request(`/readings/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteReading: (id) => request(`/readings/${id}`, { method: "DELETE" }),

  // ALERTS ------------------------------------------------------------------
  listAlerts: () => request("/alerts/"),

  createAlert: (data) =>
    request("/alerts/", { method: "POST", body: JSON.stringify(data) }),

  updateAlert: (id, data) =>
    request(`/alerts/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteAlert: (id) => request(`/alerts/${id}`, { method: "DELETE" }),

  // ANALYTICS ---------------------------------------------------------------
  getPlotStatus: (plotId) =>
    request(`/analytics/plots/${plotId}/status`),
};

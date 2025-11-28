// import React, { useEffect, useState } from "react";
// import { api } from "../api";
// import {
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// function StatCard({ label, value, accent }) {
//   return (
//     <div className="stat-card">
//       <div className="stat-label">{label}</div>
//       <div className="stat-value">{value}</div>
//       <div className="stat-accent">{accent}</div>
//     </div>
//   );
// }

// function Dashboard() {
//   const [farms, setFarms] = useState([]);
//   const [plots, setPlots] = useState([]);
//   const [sensors, setSensors] = useState([]);
//   const [readings, setReadings] = useState([]);
//   const [alerts, setAlerts] = useState([]);

//   useEffect(() => {
//     const load = async () => {
//       try {
//         const [f, p, s, r, a] = await Promise.all([
//           api.listFarms(),
//           api.listPlots(),
//           api.listSensors(),
//           api.listReadings(),
//           api.listAlerts(),
//         ]);
//         setFarms(f);
//         setPlots(p);
//         setSensors(s);
//         setReadings(r);
//         setAlerts(a);
//       } catch (err) {
//         console.error(err);
//         alert("Error loading data. Ensure backend is running on http://localhost:8000");
//       }
//     };
//     load();
//   }, []);

//   const recentReadings = readings.slice(-20).map((r, idx) => ({
//     index: idx + 1,
//     moisture: r.moisture ?? null,
//     temperature: r.temperature ?? null,
//     humidity: r.humidity ?? null,
//   }));

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <h1>Overview</h1>
//         <p>
//           High-level summary of your smart agriculture and forestry
//           environment.
//         </p>
//       </div>

//       <div className="stat-grid">
//         <StatCard
//           label="Farms / Sites"
//           value={farms.length}
//           accent="Manage multiple locations"
//         />
//         <StatCard
//           label="Plots / Blocks"
//           value={plots.length}
//           accent="Fields & forest blocks"
//         />
//         <StatCard
//           label="Active Sensors"
//           value={sensors.length}
//           accent="Soil & weather devices"
//         />
//         <StatCard
//           label="Open Alerts"
//           value={alerts.length}
//           accent="Irrigation & risk warnings"
//         />
//       </div>

//       <div className="panel-grid">
//         <div className="panel">
//           <div className="panel-header">
//             <h2>Recent Sensor Trends</h2>
//             <p>Last {recentReadings.length || 0} readings across sensors.</p>
//           </div>
//           {recentReadings.length === 0 ? (
//             <p className="muted">
//               No readings yet. Add some readings in the Data Management tab.
//             </p>
//           ) : (
//             <div className="chart-wrapper">
//               <ResponsiveContainer width="100%" height={260}>
//                 <LineChart data={recentReadings}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="index" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line
//                     type="monotone"
//                     dataKey="moisture"
//                     dot={false}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="temperature"
//                     dot={false}
//                   />
//                   <Line
//                     type="monotone"
//                     dataKey="humidity"
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </div>
//           )}
//         </div>

//         <div className="panel">
//           <div className="panel-header">
//             <h2>Latest Alerts</h2>
//             <p>Most recent irrigation / risk alerts.</p>
//           </div>
//           <div className="alert-list">
//             {alerts.length === 0 && (
//               <p className="muted">No alerts yet.</p>
//             )}
//             {alerts
//               .slice()
//               .reverse()
//               .slice(0, 5)
//               .map((a) => (
//                 <div key={a.id} className={`alert-item alert-${a.severity}`}>
//                   <div className="alert-title">
//                     {a.severity.toUpperCase()} – Plot #{a.plot_id}
//                   </div>
//                   <div className="alert-message">{a.message}</div>
//                 </div>
//               ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Dashboard;
import React, { useEffect, useState } from "react";
import { api } from "../api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

function StatCard({ label, value, accent }) {
  return (
    <div className="stat-card">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-accent">{accent}</div>
    </div>
  );
}

function Dashboard() {
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, p, s, r, a] = await Promise.all([
          api.listFarms(),
          api.listPlots(),
          api.listSensors(),
          api.listReadings(),
          api.listAlerts(),
        ]);
        setFarms(f);
        setPlots(p);
        setSensors(s);
        setReadings(r);
        setAlerts(a);
      } catch (err) {
        console.error(err);
        // Updated message for AWS deployment – no localhost reference
        alert(
          "Error loading dashboard data from the backend API. " +
            "Please check that you are logged in and the API is reachable."
        );
      }
    };
    load();
  }, []);

  const recentReadings = readings.slice(-20).map((r, idx) => ({
    index: idx + 1,
    moisture: r.moisture ?? null,
    temperature: r.temperature ?? null,
    humidity: r.humidity ?? null,
  }));

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Overview</h1>
        <p>
          High-level summary of your smart agriculture and forestry environment.
        </p>
      </div>

      <div className="stat-grid">
        <StatCard
          label="Farms / Sites"
          value={farms.length}
          accent="Manage multiple locations"
        />
        <StatCard
          label="Plots / Blocks"
          value={plots.length}
          accent="Fields & forest blocks"
        />
        <StatCard
          label="Active Sensors"
          value={sensors.length}
          accent="Soil & weather devices"
        />
        <StatCard
          label="Open Alerts"
          value={alerts.length}
          accent="Irrigation & risk warnings"
        />
      </div>

      <div className="panel-grid">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Sensor Trends</h2>
            <p>Last {recentReadings.length || 0} readings across sensors.</p>
          </div>
          {recentReadings.length === 0 ? (
            <p className="muted">
              No readings yet. Add some readings in the Data Management tab.
            </p>
          ) : (
            <div className="chart-wrapper">
              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={recentReadings}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="index" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="moisture" dot={false} />
                  <Line type="monotone" dataKey="temperature" dot={false} />
                  <Line type="monotone" dataKey="humidity" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div className="panel">
          <div className="panel-header">
            <h2>Latest Alerts</h2>
            <p>Most recent irrigation / risk alerts.</p>
          </div>
          <div className="alert-list">
            {alerts.length === 0 && <p className="muted">No alerts yet.</p>}
            {alerts
              .slice()
              .reverse()
              .slice(0, 5)
              .map((a) => (
                <div
                  key={a.id}
                  className={`alert-item alert-${a.severity}`}
                >
                  <div className="alert-title">
                    {a.severity.toUpperCase()} – Plot #{a.plot_id}
                  </div>
                  <div className="alert-message">{a.message}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;

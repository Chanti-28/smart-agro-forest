// import React, { useEffect, useMemo, useState } from "react";
// import { api } from "../api";
// import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

// function Analytics() {
//   const [plots, setPlots] = useState([]);
//   const [farms, setFarms] = useState([]);
//   const [sensors, setSensors] = useState([]);
//   const [readings, setReadings] = useState([]);
//   const [selectedPlotId, setSelectedPlotId] = useState("");
//   const [plotStatus, setPlotStatus] = useState(null);

//   useEffect(() => {
//     const load = async () => {
//       const [f, p, s, r] = await Promise.all([
//         api.listFarms(),
//         api.listPlots(),
//         api.listSensors(),
//         api.listReadings(),
//       ]);
//       setFarms(f);
//       setPlots(p);
//       setSensors(s);
//       setReadings(r);
//     };
//     load().catch((err) => {
//       console.error(err);
//       alert("Error loading analytics data. Check backend.");
//     });
//   }, []);

//   const handleFetchStatus = async () => {
//     if (!selectedPlotId) return;
//     const status = await api.getPlotStatus(Number(selectedPlotId));
//     setPlotStatus(status);
//   };

//   const readingsForPlot = useMemo(() => {
//     if (!selectedPlotId) return [];
//     const plotIdNum = Number(selectedPlotId);
//     const sensorIds = sensors.filter((s) => s.plot_id === plotIdNum).map((s) => s.id);
//     return readings
//       .filter((r) => sensorIds.includes(r.sensor_id))
//       .map((r, idx) => ({
//         index: idx + 1,
//         moisture: r.moisture ?? null,
//         temperature: r.temperature ?? null,
//         humidity: r.humidity ?? null,
//       }));
//   }, [selectedPlotId, sensors, readings]);

//   // Fake coordinates for map markers (based on farm id)
//   const farmMarkers = farms.map((f, idx) => {
//     const baseLat = 53.34; // around Dublin
//     const baseLng = -6.26;
//     const lat = baseLat + 0.05 * Math.sin(idx);
//     const lng = baseLng + 0.05 * Math.cos(idx);
//     return { ...f, lat, lng };
//   });

//   return (
//     <div className="analytics">
//       <div className="dashboard-header">
//         <h1>Analytics & Map</h1>
//         <p>
//           Visualise plot health, sensor trends and approximate farm locations.
//         </p>
//       </div>

//       <div className="panel-grid">
//         <section className="panel">
//           <div className="panel-header">
//             <h2>Plot Analytics</h2>
//             <p>Use the custom library to compute irrigation & fire risk.</p>
//           </div>
//           <div className="form-row">
//             <select
//               value={selectedPlotId}
//               onChange={(e) => setSelectedPlotId(e.target.value)}
//             >
//               <option value="">Select plot</option>
//               {plots.map((p) => (
//                 <option key={p.id} value={p.id}>
//                   {p.name} (Farm #{p.farm_id})
//                 </option>
//               ))}
//             </select>
//             <button onClick={handleFetchStatus} disabled={!selectedPlotId}>
//               Get Status
//             </button>
//           </div>

//           {plotStatus && (
//             <div className="status-card">
//               <p>
//                 <strong>Avg Moisture:</strong>{" "}
//                 {plotStatus.avg_moisture !== null
//                   ? plotStatus.avg_moisture.toFixed(1)
//                   : "No data"}
//               </p>
//               <p>
//                 <strong>Avg Temperature:</strong>{" "}
//                 {plotStatus.avg_temperature !== null
//                   ? plotStatus.avg_temperature.toFixed(1)
//                   : "No data"}
//               </p>
//               <p>
//                 <strong>Avg Humidity:</strong>{" "}
//                 {plotStatus.avg_humidity !== null
//                   ? plotStatus.avg_humidity.toFixed(1)
//                   : "No data"}
//               </p>
//               <p>
//                 <strong>Irrigation Recommendation:</strong>{" "}
//                 {plotStatus.irrigation_recommendation}
//               </p>
//               {plotStatus.fire_risk && (
//                 <p>
//                   <strong>Fire Risk:</strong> {plotStatus.fire_risk}
//                 </p>
//               )}
//             </div>
//           )}

//           <div className="chart-wrapper mt-1">
//             {readingsForPlot.length === 0 ? (
//               <p className="muted">
//                 No readings for this plot yet. Create readings in the Data
//                 Management tab.
//               </p>
//             ) : (
//               <ResponsiveContainer width="100%" height={240}>
//                 <LineChart data={readingsForPlot}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="index" />
//                   <YAxis />
//                   <Tooltip />
//                   <Legend />
//                   <Line type="monotone" dataKey="moisture" dot={false} />
//                   <Line type="monotone" dataKey="temperature" dot={false} />
//                   <Line type="monotone" dataKey="humidity" dot={false} />
//                 </LineChart>
//               </ResponsiveContainer>
//             )}
//           </div>
//         </section>

//         <section className="panel">
//           <div className="panel-header">
//             <h2>Farm & Forestry Map</h2>
//             <p>
//               Approximate locations of all farms / forestry sites (for demo
//               purposes).
//             </p>
//           </div>
//           <div className="map-wrapper">
//             <MapContainer
//               center={[53.34, -6.26]}
//               zoom={9}
//               scrollWheelZoom={false}
//               className="map"
//             >
//               <TileLayer
//                 attribution="&copy; OpenStreetMap contributors"
//                 url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//               />
//               {farmMarkers.map((f) => (
//                 <Marker key={f.id} position={[f.lat, f.lng]}>
//                   <Popup>
//                     <strong>{f.name}</strong>
//                     <br />
//                     {f.location || "No location set"}
//                   </Popup>
//                 </Marker>
//               ))}
//             </MapContainer>
//           </div>
//         </section>
//       </div>
//     </div>
//   );
// }

// export default Analytics;
import React, { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
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

function Analytics() {
  const [plots, setPlots] = useState([]);
  const [farms, setFarms] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState([]);
  const [selectedPlotId, setSelectedPlotId] = useState("");
  const [plotStatus, setPlotStatus] = useState(null);

  useEffect(() => {
    const load = async () => {
      const [f, p, s, r] = await Promise.all([
        api.listFarms(),
        api.listPlots(),
        api.listSensors(),
        api.listReadings(),
      ]);
      setFarms(f);
      setPlots(p);
      setSensors(s);
      setReadings(r);
    };

    load().catch((err) => {
      console.error(err);
      alert(
        "Error loading analytics data from the backend API. " +
          "Please check that you are logged in and the API is reachable."
      );
    });
  }, []);

  const handleFetchStatus = async () => {
    if (!selectedPlotId) return;
    try {
      const status = await api.getPlotStatus(Number(selectedPlotId));
      setPlotStatus(status);
    } catch (err) {
      console.error(err);
      alert(
        "Error fetching plot status from the backend API. " +
          "Please check that you are logged in and that analytics is enabled."
      );
    }
  };

  const readingsForPlot = useMemo(() => {
    if (!selectedPlotId) return [];
    const plotIdNum = Number(selectedPlotId);
    const sensorIds = sensors
      .filter((s) => s.plot_id === plotIdNum)
      .map((s) => s.id);

    return readings
      .filter((r) => sensorIds.includes(r.sensor_id))
      .map((r, idx) => ({
        index: idx + 1,
        moisture: r.moisture ?? null,
        temperature: r.temperature ?? null,
        humidity: r.humidity ?? null,
      }));
  }, [selectedPlotId, sensors, readings]);

  // Fake coordinates for map markers (based on farm index)
  const farmMarkers = farms.map((f, idx) => {
    const baseLat = 53.34; // around Dublin
    const baseLng = -6.26;
    const lat = baseLat + 0.05 * Math.sin(idx);
    const lng = baseLng + 0.05 * Math.cos(idx);
    return { ...f, lat, lng };
  });

  return (
    <div className="analytics">
      <div className="dashboard-header">
        <h1>Analytics & Map</h1>
        <p>
          Visualise plot health, sensor trends and approximate farm locations.
        </p>
      </div>

      <div className="panel-grid">
        <section className="panel">
          <div className="panel-header">
            <h2>Plot Analytics</h2>
            <p>Use the custom library to compute irrigation & fire risk.</p>
          </div>
          <div className="form-row">
            <select
              value={selectedPlotId}
              onChange={(e) => setSelectedPlotId(e.target.value)}
            >
              <option value="">Select plot</option>
              {plots.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Farm #{p.farm_id})
                </option>
              ))}
            </select>
            <button onClick={handleFetchStatus} disabled={!selectedPlotId}>
              Get Status
            </button>
          </div>

          {plotStatus && (
            <div className="status-card">
              <p>
                <strong>Avg Moisture:</strong>{" "}
                {plotStatus.avg_moisture !== null
                  ? plotStatus.avg_moisture.toFixed(1)
                  : "No data"}
              </p>
              <p>
                <strong>Avg Temperature:</strong>{" "}
                {plotStatus.avg_temperature !== null
                  ? plotStatus.avg_temperature.toFixed(1)
                  : "No data"}
              </p>
              <p>
                <strong>Avg Humidity:</strong>{" "}
                {plotStatus.avg_humidity !== null
                  ? plotStatus.avg_humidity.toFixed(1)
                  : "No data"}
              </p>
              <p>
                <strong>Irrigation Recommendation:</strong>{" "}
                {plotStatus.irrigation_recommendation}
              </p>
              {plotStatus.fire_risk && (
                <p>
                  <strong>Fire Risk:</strong> {plotStatus.fire_risk}
                </p>
              )}
            </div>
          )}

          <div className="chart-wrapper mt-1">
            {readingsForPlot.length === 0 ? (
              <p className="muted">
                No readings for this plot yet. Create readings in the Data
                Management tab.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={readingsForPlot}>
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
            )}
          </div>
        </section>

        <section className="panel">
          <div className="panel-header">
            <h2>Farm & Forestry Map</h2>
            <p>
              Approximate locations of all farms / forestry sites (for demo
              purposes).
            </p>
          </div>
          <div className="map-wrapper">
            <MapContainer
              center={[53.34, -6.26]}
              zoom={9}
              scrollWheelZoom={false}
              className="map"
            >
              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {farmMarkers.map((f) => (
                <Marker key={f.id} position={[f.lat, f.lng]}>
                  <Popup>
                    <strong>{f.name}</strong>
                    <br />
                    {f.location || "No location set"}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Analytics;

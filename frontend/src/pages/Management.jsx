// import React, { useEffect, useState } from "react";
// import { api } from "../api";

// function Section({ title, subtitle, children }) {
//   return (
//     <section className="panel">
//       <div className="panel-header">
//         <h2>{title}</h2>
//         {subtitle && <p>{subtitle}</p>}
//       </div>
//       {children}
//     </section>
//   );
// }

// function Management() {
//   const [farms, setFarms] = useState([]);
//   const [plots, setPlots] = useState([]);
//   const [sensors, setSensors] = useState([]);
//   const [readings, setReadings] = useState([]);
//   const [alerts, setAlerts] = useState([]);

//   // Forms + edit state
//   const [farmForm, setFarmForm] = useState({ id: null, name: "", location: "", description: "" });
//   const [plotForm, setPlotForm] = useState({ id: null, name: "", farm_id: "", crop_type: "", tree_species: "" });
//   const [sensorForm, setSensorForm] = useState({ id: null, name: "", plot_id: "", sensor_type: "soil", status: "active" });
//   const [readingForm, setReadingForm] = useState({ id: null, sensor_id: "", moisture: "", temperature: "", humidity: "" });
//   const [alertForm, setAlertForm] = useState({ id: null, plot_id: "", message: "", severity: "info" });

//   const loadAll = async () => {
//     const [f, p, s, r, a] = await Promise.all([
//       api.listFarms(),
//       api.listPlots(),
//       api.listSensors(),
//       api.listReadings(),
//       api.listAlerts(),
//     ]);
//     setFarms(f);
//     setPlots(p);
//     setSensors(s);
//     setReadings(r);
//     setAlerts(a);
//   };

//   useEffect(() => {
//     loadAll().catch((err) => {
//       console.error(err);
//       alert("Error loading data. Ensure backend is running on http://localhost:8000");
//     });
//   }, []);

//   // Farm handlers
//   const handleSubmitFarm = async (e) => {
//     e.preventDefault();
//     const payload = { name: farmForm.name, location: farmForm.location, description: farmForm.description };
//     if (farmForm.id) {
//       await api.updateFarm(farmForm.id, payload);
//     } else {
//       await api.createFarm(payload);
//     }
//     setFarmForm({ id: null, name: "", location: "", description: "" });
//     loadAll();
//   };

//   const handleEditFarm = (f) => {
//     setFarmForm({ id: f.id, name: f.name, location: f.location || "", description: f.description || "" });
//   };

//   const handleDeleteFarm = async (id) => {
//     if (!window.confirm("Delete this farm and all related plots, sensors, readings and alerts?")) return;
//     await api.deleteFarm(id);
//     loadAll();
//   };

//   // Plot handlers
//   const handleSubmitPlot = async (e) => {
//     e.preventDefault();
//     const payload = {
//       name: plotForm.name,
//       farm_id: Number(plotForm.farm_id),
//       crop_type: plotForm.crop_type || null,
//       tree_species: plotForm.tree_species || null,
//     };
//     if (plotForm.id) {
//       await api.updatePlot(plotForm.id, payload);
//     } else {
//       await api.createPlot(payload);
//     }
//     setPlotForm({ id: null, name: "", farm_id: "", crop_type: "", tree_species: "" });
//     loadAll();
//   };

//   const handleEditPlot = (p) => {
//     setPlotForm({
//       id: p.id,
//       name: p.name,
//       farm_id: String(p.farm_id),
//       crop_type: p.crop_type || "",
//       tree_species: p.tree_species || "",
//     });
//   };

//   const handleDeletePlot = async (id) => {
//     if (!window.confirm("Delete this plot and all related sensors, readings and alerts?")) return;
//     await api.deletePlot(id);
//     loadAll();
//   };

//   // Sensor handlers
//   const handleSubmitSensor = async (e) => {
//     e.preventDefault();
//     const payload = {
//       name: sensorForm.name,
//       plot_id: Number(sensorForm.plot_id),
//       sensor_type: sensorForm.sensor_type,
//       status: sensorForm.status,
//     };
//     if (sensorForm.id) {
//       await api.updateSensor(sensorForm.id, payload);
//     } else {
//       await api.createSensor(payload);
//     }
//     setSensorForm({ id: null, name: "", plot_id: "", sensor_type: "soil", status: "active" });
//     loadAll();
//   };

//   const handleEditSensor = (s) => {
//     setSensorForm({
//       id: s.id,
//       name: s.name,
//       plot_id: String(s.plot_id),
//       sensor_type: s.sensor_type,
//       status: s.status,
//     });
//   };

//   const handleDeleteSensor = async (id) => {
//     if (!window.confirm("Delete this sensor and all related readings?")) return;
//     await api.deleteSensor(id);
//     loadAll();
//   };

//   // Reading handlers
//   const handleSubmitReading = async (e) => {
//     e.preventDefault();
//     const payload = {
//       sensor_id: Number(readingForm.sensor_id),
//       moisture: readingForm.moisture === "" ? null : Number(readingForm.moisture),
//       temperature: readingForm.temperature === "" ? null : Number(readingForm.temperature),
//       humidity: readingForm.humidity === "" ? null : Number(readingForm.humidity),
//     };
//     if (readingForm.id) {
//       await api.updateReading(readingForm.id, payload);
//     } else {
//       await api.createReading(payload);
//     }
//     setReadingForm({ id: null, sensor_id: "", moisture: "", temperature: "", humidity: "" });
//     loadAll();
//   };

//   const handleEditReading = (r) => {
//     setReadingForm({
//       id: r.id,
//       sensor_id: String(r.sensor_id),
//       moisture: r.moisture ?? "",
//       temperature: r.temperature ?? "",
//       humidity: r.humidity ?? "",
//     });
//   };

//   const handleDeleteReading = async (id) => {
//     if (!window.confirm("Delete this reading?")) return;
//     await api.deleteReading(id);
//     loadAll();
//   };

//   // Alert handlers
//   const handleSubmitAlert = async (e) => {
//     e.preventDefault();
//     const payload = {
//       plot_id: Number(alertForm.plot_id),
//       message: alertForm.message,
//       severity: alertForm.severity,
//     };
//     if (alertForm.id) {
//       await api.updateAlert(alertForm.id, payload);
//     } else {
//       await api.createAlert(payload);
//     }
//     setAlertForm({ id: null, plot_id: "", message: "", severity: "info" });
//     loadAll();
//   };

//   const handleEditAlert = (a) => {
//     setAlertForm({
//       id: a.id,
//       plot_id: String(a.plot_id),
//       message: a.message,
//       severity: a.severity,
//     });
//   };

//   const handleDeleteAlert = async (id) => {
//     if (!window.confirm("Delete this alert?")) return;
//     await api.deleteAlert(id);
//     loadAll();
//   };

//   return (
//     <div className="management">
//       <div className="dashboard-header">
//         <h1>Data Management</h1>
//         <p>
//           Full CRUD console for farms, plots, sensors, readings and alerts.
//         </p>
//       </div>

//       <div className="panel-grid">
//         <Section
//           title="Farms / Forestry Sites"
//           subtitle="Create and manage your high-level locations."
//         >
//           <form className="form" onSubmit={handleSubmitFarm}>
//             <div className="form-row">
//               <input
//                 placeholder="Name"
//                 value={farmForm.name}
//                 onChange={(e) => setFarmForm({ ...farmForm, name: e.target.value })}
//                 required
//               />
//               <input
//                 placeholder="Location"
//                 value={farmForm.location}
//                 onChange={(e) =>
//                   setFarmForm({ ...farmForm, location: e.target.value })
//                 }
//               />
//             </div>
//             <textarea
//               placeholder="Description"
//               value={farmForm.description}
//               onChange={(e) =>
//                 setFarmForm({ ...farmForm, description: e.target.value })
//               }
//             />
//             <button type="submit">
//               {farmForm.id ? "Update Farm" : "Create Farm"}
//             </button>
//           </form>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Location</th>
//                   <th>Description</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {farms.map((f) => (
//                   <tr key={f.id}>
//                     <td>{f.id}</td>
//                     <td>{f.name}</td>
//                     <td>{f.location || "-"}</td>
//                     <td>{f.description || "-"}</td>
//                     <td className="table-actions">
//                       <button
//                         type="button"
//                         onClick={() => handleEditFarm(f)}
//                       >
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="btn-danger"
//                         onClick={() => handleDeleteFarm(f.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {farms.length === 0 && (
//                   <tr>
//                     <td colSpan={5} className="muted">
//                       No farms yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Section>

//         <Section
//           title="Plots / Blocks"
//           subtitle="Define fields and forest blocks within each farm."
//         >
//           <form className="form" onSubmit={handleSubmitPlot}>
//             <div className="form-row">
//               <input
//                 placeholder="Name"
//                 value={plotForm.name}
//                 onChange={(e) =>
//                   setPlotForm({ ...plotForm, name: e.target.value })
//                 }
//                 required
//               />
//               <select
//                 value={plotForm.farm_id}
//                 onChange={(e) =>
//                   setPlotForm({ ...plotForm, farm_id: e.target.value })
//                 }
//                 required
//               >
//                 <option value="">Select farm</option>
//                 {farms.map((f) => (
//                   <option key={f.id} value={f.id}>
//                     {f.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-row">
//               <input
//                 placeholder="Crop type (optional)"
//                 value={plotForm.crop_type}
//                 onChange={(e) =>
//                   setPlotForm({ ...plotForm, crop_type: e.target.value })
//                 }
//               />
//               <input
//                 placeholder="Tree species (optional)"
//                 value={plotForm.tree_species}
//                 onChange={(e) =>
//                   setPlotForm({ ...plotForm, tree_species: e.target.value })
//                 }
//               />
//             </div>
//             <button type="submit">
//               {plotForm.id ? "Update Plot" : "Create Plot"}
//             </button>
//           </form>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Farm</th>
//                   <th>Crop</th>
//                   <th>Trees</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {plots.map((p) => (
//                   <tr key={p.id}>
//                     <td>{p.id}</td>
//                     <td>{p.name}</td>
//                     <td>#{p.farm_id}</td>
//                     <td>{p.crop_type || "-"}</td>
//                     <td>{p.tree_species || "-"}</td>
//                     <td className="table-actions">
//                       <button type="button" onClick={() => handleEditPlot(p)}>
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="btn-danger"
//                         onClick={() => handleDeletePlot(p.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {plots.length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="muted">
//                       No plots yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Section>

//         <Section
//           title="Sensors"
//           subtitle="Attach soil and weather sensors to plots."
//         >
//           <form className="form" onSubmit={handleSubmitSensor}>
//             <div className="form-row">
//               <input
//                 placeholder="Name"
//                 value={sensorForm.name}
//                 onChange={(e) =>
//                   setSensorForm({ ...sensorForm, name: e.target.value })
//                 }
//                 required
//               />
//               <select
//                 value={sensorForm.plot_id}
//                 onChange={(e) =>
//                   setSensorForm({ ...sensorForm, plot_id: e.target.value })
//                 }
//                 required
//               >
//                 <option value="">Select plot</option>
//                 {plots.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//             </div>
//             <div className="form-row">
//               <select
//                 value={sensorForm.sensor_type}
//                 onChange={(e) =>
//                   setSensorForm({ ...sensorForm, sensor_type: e.target.value })
//                 }
//               >
//                 <option value="soil">Soil</option>
//                 <option value="weather">Weather</option>
//               </select>
//               <select
//                 value={sensorForm.status}
//                 onChange={(e) =>
//                   setSensorForm({ ...sensorForm, status: e.target.value })
//                 }
//               >
//                 <option value="active">Active</option>
//                 <option value="inactive">Inactive</option>
//                 <option value="maintenance">Maintenance</option>
//               </select>
//             </div>
//             <button type="submit">
//               {sensorForm.id ? "Update Sensor" : "Create Sensor"}
//             </button>
//           </form>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Name</th>
//                   <th>Plot</th>
//                   <th>Type</th>
//                   <th>Status</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sensors.map((s) => (
//                   <tr key={s.id}>
//                     <td>{s.id}</td>
//                     <td>{s.name}</td>
//                     <td>#{s.plot_id}</td>
//                     <td>{s.sensor_type}</td>
//                     <td>{s.status}</td>
//                     <td className="table-actions">
//                       <button type="button" onClick={() => handleEditSensor(s)}>
//                         Edit
//                       </button>
//                       <button
//                         type="button"
//                         className="btn-danger"
//                         onClick={() => handleDeleteSensor(s.id)}
//                       >
//                         Delete
//                       </button>
//                     </td>
//                   </tr>
//                 ))}
//                 {sensors.length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="muted">
//                       No sensors yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Section>

//         <Section
//           title="Readings"
//           subtitle="Capture sensor measurements for analytics."
//         >
//           <form className="form" onSubmit={handleSubmitReading}>
//             <div className="form-row">
//               <select
//                 value={readingForm.sensor_id}
//                 onChange={(e) =>
//                   setReadingForm({ ...readingForm, sensor_id: e.target.value })
//                 }
//                 required
//               >
//                 <option value="">Select sensor</option>
//                 {sensors.map((s) => (
//                   <option key={s.id} value={s.id}>
//                     {s.name}
//                   </option>
//                 ))}
//               </select>
//               <input
//                 type="number"
//                 step="0.1"
//                 placeholder="Moisture"
//                 value={readingForm.moisture}
//                 onChange={(e) =>
//                   setReadingForm({ ...readingForm, moisture: e.target.value })
//                 }
//               />
//               <input
//                 type="number"
//                 step="0.1"
//                 placeholder="Temperature"
//                 value={readingForm.temperature}
//                 onChange={(e) =>
//                   setReadingForm({ ...readingForm, temperature: e.target.value })
//                 }
//               />
//               <input
//                 type="number"
//                 step="0.1"
//                 placeholder="Humidity"
//                 value={readingForm.humidity}
//                 onChange={(e) =>
//                   setReadingForm({ ...readingForm, humidity: e.target.value })
//                 }
//               />
//             </div>
//             <button type="submit">
//               {readingForm.id ? "Update Reading" : "Create Reading"}
//             </button>
//           </form>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Sensor</th>
//                   <th>Moisture</th>
//                   <th>Temperature</th>
//                   <th>Humidity</th>
//                   <th>Timestamp</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {readings
//                   .slice()
//                   .reverse()
//                   .map((r) => (
//                     <tr key={r.id}>
//                       <td>{r.id}</td>
//                       <td>#{r.sensor_id}</td>
//                       <td>{r.moisture ?? "-"}</td>
//                       <td>{r.temperature ?? "-"}</td>
//                       <td>{r.humidity ?? "-"}</td>
//                       <td>{new Date(r.timestamp).toLocaleString()}</td>
//                       <td className="table-actions">
//                         <button type="button" onClick={() => handleEditReading(r)}>
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           className="btn-danger"
//                           onClick={() => handleDeleteReading(r.id)}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 {readings.length === 0 && (
//                   <tr>
//                     <td colSpan={7} className="muted">
//                       No readings yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Section>

//         <Section
//           title="Alerts"
//           subtitle="Create manual alerts to complement automated analytics."
//         >
//           <form className="form" onSubmit={handleSubmitAlert}>
//             <div className="form-row">
//               <select
//                 value={alertForm.plot_id}
//                 onChange={(e) =>
//                   setAlertForm({ ...alertForm, plot_id: e.target.value })
//                 }
//                 required
//               >
//                 <option value="">Select plot</option>
//                 {plots.map((p) => (
//                   <option key={p.id} value={p.id}>
//                     {p.name}
//                   </option>
//                 ))}
//               </select>
//               <select
//                 value={alertForm.severity}
//                 onChange={(e) =>
//                   setAlertForm({ ...alertForm, severity: e.target.value })
//                 }
//               >
//                 <option value="info">Info</option>
//                 <option value="warning">Warning</option>
//                 <option value="critical">Critical</option>
//               </select>
//             </div>
//             <textarea
//               placeholder="Alert message"
//               value={alertForm.message}
//               onChange={(e) =>
//                 setAlertForm({ ...alertForm, message: e.target.value })
//               }
//               required
//             />
//             <button type="submit">
//               {alertForm.id ? "Update Alert" : "Create Alert"}
//             </button>
//           </form>
//           <div className="table-wrapper">
//             <table>
//               <thead>
//                 <tr>
//                   <th>ID</th>
//                   <th>Plot</th>
//                   <th>Severity</th>
//                   <th>Message</th>
//                   <th>Created</th>
//                   <th></th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {alerts
//                   .slice()
//                   .reverse()
//                   .map((a) => (
//                     <tr key={a.id}>
//                       <td>{a.id}</td>
//                       <td>#{a.plot_id}</td>
//                       <td>{a.severity}</td>
//                       <td>{a.message}</td>
//                       <td>{new Date(a.created_at).toLocaleString()}</td>
//                       <td className="table-actions">
//                         <button type="button" onClick={() => handleEditAlert(a)}>
//                           Edit
//                         </button>
//                         <button
//                           type="button"
//                           className="btn-danger"
//                           onClick={() => handleDeleteAlert(a.id)}
//                         >
//                           Delete
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 {alerts.length === 0 && (
//                   <tr>
//                     <td colSpan={6} className="muted">
//                       No alerts yet.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//         </Section>
//       </div>
//     </div>
//   );
// }

// export default Management;
import React, { useEffect, useState } from "react";
import { api } from "../api";

function Section({ title, subtitle, children }) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Management() {
  const [farms, setFarms] = useState([]);
  const [plots, setPlots] = useState([]);
  const [sensors, setSensors] = useState([]);
  const [readings, setReadings] = useState([]);
  const [alerts, setAlerts] = useState([]);

  // Forms + edit state
  const [farmForm, setFarmForm] = useState({
    id: null,
    name: "",
    location: "",
    description: "",
  });
  const [plotForm, setPlotForm] = useState({
    id: null,
    name: "",
    farm_id: "",
    crop_type: "",
    tree_species: "",
  });
  const [sensorForm, setSensorForm] = useState({
    id: null,
    name: "",
    plot_id: "",
    sensor_type: "soil",
    status: "active",
  });
  const [readingForm, setReadingForm] = useState({
    id: null,
    sensor_id: "",
    moisture: "",
    temperature: "",
    humidity: "",
  });
  const [alertForm, setAlertForm] = useState({
    id: null,
    plot_id: "",
    message: "",
    severity: "info",
  });

  const loadAll = async () => {
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
  };

  useEffect(() => {
    loadAll().catch((err) => {
      console.error(err);
      // Updated message for AWS deployment – no localhost reference
      alert(
        "Error loading data from the backend API. " +
          "Please check that you are logged in and the API is reachable."
      );
    });
  }, []);

  // Farm handlers
  const handleSubmitFarm = async (e) => {
    e.preventDefault();
    const payload = {
      name: farmForm.name,
      location: farmForm.location,
      description: farmForm.description,
    };
    if (farmForm.id) {
      await api.updateFarm(farmForm.id, payload);
    } else {
      await api.createFarm(payload);
    }
    setFarmForm({ id: null, name: "", location: "", description: "" });
    loadAll();
  };

  const handleEditFarm = (f) => {
    setFarmForm({
      id: f.id,
      name: f.name,
      location: f.location || "",
      description: f.description || "",
    });
  };

  const handleDeleteFarm = async (id) => {
    if (
      !window.confirm(
        "Delete this farm and all related plots, sensors, readings and alerts?"
      )
    )
      return;
    await api.deleteFarm(id);
    loadAll();
  };

  // Plot handlers
  const handleSubmitPlot = async (e) => {
    e.preventDefault();
    const payload = {
      name: plotForm.name,
      farm_id: Number(plotForm.farm_id),
      crop_type: plotForm.crop_type || null,
      tree_species: plotForm.tree_species || null,
    };
    if (plotForm.id) {
      await api.updatePlot(plotForm.id, payload);
    } else {
      await api.createPlot(payload);
    }
    setPlotForm({
      id: null,
      name: "",
      farm_id: "",
      crop_type: "",
      tree_species: "",
    });
    loadAll();
  };

  const handleEditPlot = (p) => {
    setPlotForm({
      id: p.id,
      name: p.name,
      farm_id: String(p.farm_id),
      crop_type: p.crop_type || "",
      tree_species: p.tree_species || "",
    });
  };

  const handleDeletePlot = async (id) => {
    if (
      !window.confirm(
        "Delete this plot and all related sensors, readings and alerts?"
      )
    )
      return;
    await api.deletePlot(id);
    loadAll();
  };

  // Sensor handlers
  const handleSubmitSensor = async (e) => {
    e.preventDefault();
    const payload = {
      name: sensorForm.name,
      plot_id: Number(sensorForm.plot_id),
      sensor_type: sensorForm.sensor_type,
      status: sensorForm.status,
    };
    if (sensorForm.id) {
      await api.updateSensor(sensorForm.id, payload);
    } else {
      await api.createSensor(payload);
    }
    setSensorForm({
      id: null,
      name: "",
      plot_id: "",
      sensor_type: "soil",
      status: "active",
    });
    loadAll();
  };

  const handleEditSensor = (s) => {
    setSensorForm({
      id: s.id,
      name: s.name,
      plot_id: String(s.plot_id),
      sensor_type: s.sensor_type,
      status: s.status,
    });
  };

  const handleDeleteSensor = async (id) => {
    if (!window.confirm("Delete this sensor and all related readings?")) return;
    await api.deleteSensor(id);
    loadAll();
  };

  // Reading handlers
  const handleSubmitReading = async (e) => {
    e.preventDefault();
    const payload = {
      sensor_id: Number(readingForm.sensor_id),
      moisture:
        readingForm.moisture === "" ? null : Number(readingForm.moisture),
      temperature:
        readingForm.temperature === ""
          ? null
          : Number(readingForm.temperature),
      humidity:
        readingForm.humidity === "" ? null : Number(readingForm.humidity),
    };
    if (readingForm.id) {
      await api.updateReading(readingForm.id, payload);
    } else {
      await api.createReading(payload);
    }
    setReadingForm({
      id: null,
      sensor_id: "",
      moisture: "",
      temperature: "",
      humidity: "",
    });
    loadAll();
  };

  const handleEditReading = (r) => {
    setReadingForm({
      id: r.id,
      sensor_id: String(r.sensor_id),
      moisture: r.moisture ?? "",
      temperature: r.temperature ?? "",
      humidity: r.humidity ?? "",
    });
  };

  const handleDeleteReading = async (id) => {
    if (!window.confirm("Delete this reading?")) return;
    await api.deleteReading(id);
    loadAll();
  };

  // Alert handlers
  const handleSubmitAlert = async (e) => {
    e.preventDefault();
    const payload = {
      plot_id: Number(alertForm.plot_id),
      message: alertForm.message,
      severity: alertForm.severity,
    };
    if (alertForm.id) {
      await api.updateAlert(alertForm.id, payload);
    } else {
      await api.createAlert(payload);
    }
    setAlertForm({ id: null, plot_id: "", message: "", severity: "info" });
    loadAll();
  };

  const handleEditAlert = (a) => {
    setAlertForm({
      id: a.id,
      plot_id: String(a.plot_id),
      message: a.message,
      severity: a.severity,
    });
  };

  const handleDeleteAlert = async (id) => {
    if (!window.confirm("Delete this alert?")) return;
    await api.deleteAlert(id);
    loadAll();
  };

  return (
    <div className="management">
      <div className="dashboard-header">
        <h1>Data Management</h1>
        <p>Full CRUD console for farms, plots, sensors, readings and alerts.</p>
      </div>

      <div className="panel-grid">
        <Section
          title="Farms / Forestry Sites"
          subtitle="Create and manage your high-level locations."
        >
          <form className="form" onSubmit={handleSubmitFarm}>
            <div className="form-row">
              <input
                placeholder="Name"
                value={farmForm.name}
                onChange={(e) =>
                  setFarmForm({ ...farmForm, name: e.target.value })
                }
                required
              />
              <input
                placeholder="Location"
                value={farmForm.location}
                onChange={(e) =>
                  setFarmForm({ ...farmForm, location: e.target.value })
                }
              />
            </div>
            <textarea
              placeholder="Description"
              value={farmForm.description}
              onChange={(e) =>
                setFarmForm({ ...farmForm, description: e.target.value })
              }
            />
            <button type="submit">
              {farmForm.id ? "Update Farm" : "Create Farm"}
            </button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Location</th>
                  <th>Description</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {farms.map((f) => (
                  <tr key={f.id}>
                    <td>{f.id}</td>
                    <td>{f.name}</td>
                    <td>{f.location || "-"}</td>
                    <td>{f.description || "-"}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEditFarm(f)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeleteFarm(f.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {farms.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted">
                      No farms yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Plots / Blocks"
          subtitle="Define fields and forest blocks within each farm."
        >
          <form className="form" onSubmit={handleSubmitPlot}>
            <div className="form-row">
              <input
                placeholder="Name"
                value={plotForm.name}
                onChange={(e) =>
                  setPlotForm({ ...plotForm, name: e.target.value })
                }
                required
              />
              <select
                value={plotForm.farm_id}
                onChange={(e) =>
                  setPlotForm({ ...plotForm, farm_id: e.target.value })
                }
                required
              >
                <option value="">Select farm</option>
                {farms.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <input
                placeholder="Crop type (optional)"
                value={plotForm.crop_type}
                onChange={(e) =>
                  setPlotForm({ ...plotForm, crop_type: e.target.value })
                }
              />
              <input
                placeholder="Tree species (optional)"
                value={plotForm.tree_species}
                onChange={(e) =>
                  setPlotForm({ ...plotForm, tree_species: e.target.value })
                }
              />
            </div>
            <button type="submit">
              {plotForm.id ? "Update Plot" : "Create Plot"}
            </button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Farm</th>
                  <th>Crop</th>
                  <th>Trees</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {plots.map((p) => (
                  <tr key={p.id}>
                    <td>{p.id}</td>
                    <td>{p.name}</td>
                    <td>#{p.farm_id}</td>
                    <td>{p.crop_type || "-"}</td>
                    <td>{p.tree_species || "-"}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEditPlot(p)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeletePlot(p.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {plots.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No plots yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Sensors"
          subtitle="Attach soil and weather sensors to plots."
        >
          <form className="form" onSubmit={handleSubmitSensor}>
            <div className="form-row">
              <input
                placeholder="Name"
                value={sensorForm.name}
                onChange={(e) =>
                  setSensorForm({ ...sensorForm, name: e.target.value })
                }
                required
              />
              <select
                value={sensorForm.plot_id}
                onChange={(e) =>
                  setSensorForm({ ...sensorForm, plot_id: e.target.value })
                }
                required
              >
                <option value="">Select plot</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <select
                value={sensorForm.sensor_type}
                onChange={(e) =>
                  setSensorForm({
                    ...sensorForm,
                    sensor_type: e.target.value,
                  })
                }
              >
                <option value="soil">Soil</option>
                <option value="weather">Weather</option>
              </select>
              <select
                value={sensorForm.status}
                onChange={(e) =>
                  setSensorForm({ ...sensorForm, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </div>
            <button type="submit">
              {sensorForm.id ? "Update Sensor" : "Create Sensor"}
            </button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Plot</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sensors.map((s) => (
                  <tr key={s.id}>
                    <td>{s.id}</td>
                    <td>{s.name}</td>
                    <td>#{s.plot_id}</td>
                    <td>{s.sensor_type}</td>
                    <td>{s.status}</td>
                    <td className="table-actions">
                      <button type="button" onClick={() => handleEditSensor(s)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="btn-danger"
                        onClick={() => handleDeleteSensor(s.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {sensors.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No sensors yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Readings"
          subtitle="Capture sensor measurements for analytics."
        >
          <form className="form" onSubmit={handleSubmitReading}>
            <div className="form-row">
              <select
                value={readingForm.sensor_id}
                onChange={(e) =>
                  setReadingForm({
                    ...readingForm,
                    sensor_id: e.target.value,
                  })
                }
                required
              >
                <option value="">Select sensor</option>
                {sensors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.1"
                placeholder="Moisture"
                value={readingForm.moisture}
                onChange={(e) =>
                  setReadingForm({
                    ...readingForm,
                    moisture: e.target.value,
                  })
                }
              />
              <input
                type="number"
                step="0.1"
                placeholder="Temperature"
                value={readingForm.temperature}
                onChange={(e) =>
                  setReadingForm({
                    ...readingForm,
                    temperature: e.target.value,
                  })
                }
              />
              <input
                type="number"
                step="0.1"
                placeholder="Humidity"
                value={readingForm.humidity}
                onChange={(e) =>
                  setReadingForm({
                    ...readingForm,
                    humidity: e.target.value,
                  })
                }
              />
            </div>
            <button type="submit">
              {readingForm.id ? "Update Reading" : "Create Reading"}
            </button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Sensor</th>
                  <th>Moisture</th>
                  <th>Temperature</th>
                  <th>Humidity</th>
                  <th>Timestamp</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {readings
                  .slice()
                  .reverse()
                  .map((r) => (
                    <tr key={r.id}>
                      <td>{r.id}</td>
                      <td>#{r.sensor_id}</td>
                      <td>{r.moisture ?? "-"}</td>
                      <td>{r.temperature ?? "-"}</td>
                      <td>{r.humidity ?? "-"}</td>
                      <td>{new Date(r.timestamp).toLocaleString()}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          onClick={() => handleEditReading(r)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteReading(r.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                {readings.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted">
                      No readings yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>

        <Section
          title="Alerts"
          subtitle="Create manual alerts to complement automated analytics."
        >
          <form className="form" onSubmit={handleSubmitAlert}>
            <div className="form-row">
              <select
                value={alertForm.plot_id}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, plot_id: e.target.value })
                }
                required
              >
                <option value="">Select plot</option>
                {plots.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                value={alertForm.severity}
                onChange={(e) =>
                  setAlertForm({ ...alertForm, severity: e.target.value })
                }
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>
            </div>
            <textarea
              placeholder="Alert message"
              value={alertForm.message}
              onChange={(e) =>
                setAlertForm({ ...alertForm, message: e.target.value })
              }
              required
            />
            <button type="submit">
              {alertForm.id ? "Update Alert" : "Create Alert"}
            </button>
          </form>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Plot</th>
                  <th>Severity</th>
                  <th>Message</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {alerts
                  .slice()
                  .reverse()
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.id}</td>
                      <td>#{a.plot_id}</td>
                      <td>{a.severity}</td>
                      <td>{a.message}</td>
                      <td>{new Date(a.created_at).toLocaleString()}</td>
                      <td className="table-actions">
                        <button
                          type="button"
                          onClick={() => handleEditAlert(a)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="btn-danger"
                          onClick={() => handleDeleteAlert(a.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                {alerts.length === 0 && (
                  <tr>
                    <td colSpan={6} className="muted">
                      No alerts yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Section>
      </div>
    </div>
  );
}

export default Management;

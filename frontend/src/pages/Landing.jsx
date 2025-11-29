// import React, { useState } from "react";
// import { api } from "../api";

// function Landing({ onAuthSuccess }) {
//   const [mode, setMode] = useState("login"); // 'login' or 'register'
//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setError("");
//     setLoading(true);
//     try {
//       if (mode === "register") {
//         if (!name) {
//           setError("Please provide your name to register.");
//           setLoading(false);
//           return;
//         }
//         await api.register({ name, email, password });
//       }
//       const tokenResp = await api.login({ email, password });
//       if (!tokenResp || !tokenResp.access_token) {
//         throw new Error("Invalid response from auth server");
//       }
//       await onAuthSuccess(tokenResp.access_token);
//     } catch (err) {
//       console.error("Auth error:", err);
//       setError(err.message || "Authentication failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="landing">
//       <div className="landing-panel">
//         <div className="landing-left">
//           <div className="brand-pill">Smart Agriculture & Forestry</div>
//           <h1>Monitor your fields & forests in one cloud dashboard.</h1>
//           <p>
//             A modern console-style interface to manage farms, plots, sensors,
//             and environmental data with built-in irrigation and fire-risk
//             analytics.
//           </p>
//           <ul className="landing-list">
//             <li>✅ Modern AWS-style dashboard</li>
//             <li>✅ Green agricultural & forestry theme</li>
//             <li>✅ Full CRUD with authenticated access</li>
//             <li>✅ Smart irrigation & fire-risk insights</li>
//           </ul>
//         </div>
//         <div className="landing-right">
//           <div className="login-card">
//             <h2>{mode === "login" ? "Login" : "Register"}</h2>
//             <p className="login-subtitle">
//               {mode === "login"
//                 ? "Sign in with your email and password to access the console."
//                 : "Create an account. Then you will be logged into the console."}
//             </p>
//             <div className="form-row" style={{ marginBottom: "0.5rem" }}>
//               <button
//                 type="button"
//                 className="chip chip-outline"
//                 onClick={() => setMode("login")}
//                 style={{
//                   opacity: mode === "login" ? 1 : 0.6,
//                   borderColor:
//                     mode === "login" ? "rgba(34,197,94,0.9)" : undefined,
//                 }}
//               >
//                 Login
//               </button>
//               <button
//                 type="button"
//                 className="chip chip-outline"
//                 onClick={() => setMode("register")}
//                 style={{
//                   opacity: mode === "register" ? 1 : 0.6,
//                   borderColor:
//                     mode === "register" ? "rgba(34,197,94,0.9)" : undefined,
//                 }}
//               >
//                 Register
//               </button>
//             </div>
//             <form onSubmit={handleSubmit} className="form">
//               {mode === "register" && (
//                 <input
//                   placeholder="Your name"
//                   value={name}
//                   onChange={(e) => setName(e.target.value)}
//                   required={mode === "register"}
//                 />
//               )}
//               <input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 required
//               />
//               <input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 required
//               />
//               {error && (
//                 <p className="muted" style={{ color: "#fca5a5" }}>
//                   {error}
//                 </p>
//               )}
//               <button type="submit" disabled={loading}>
//                 {loading
//                   ? "Please wait..."
//                   : mode === "login"
//                   ? "Login"
//                   : "Register & Login"}
//               </button>
//             </form>
//             <p className="login-footnote">
//               This authentication is implemented on the backend using a user
//               table and signed session tokens stored in the database.
//             </p>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default Landing;
import React, { useState } from "react";
import { api } from "../api";

function Landing({ onAuthSuccess }) {
  const [mode, setMode] = useState("login"); // 'login' or 'register'
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Helper to extract a clean backend message from our api.js Error
  function normalizeErrorMessage(err) {
    let message = err?.message || "Authentication failed";

    // Case 1: message is plain JSON: {"detail":"..."}
    try {
      const parsed = JSON.parse(message);
      if (parsed && parsed.detail) {
        return parsed.detail;
      }
    } catch {
      // ignore, not plain JSON
    }

    // Case 2: message is like:
    // "HTTP 400 Bad Request for /auth/register: {"detail":"Email already registered"}"
    const braceIndex = message.indexOf("{");
    if (braceIndex !== -1) {
      const jsonPart = message.slice(braceIndex);
      try {
        const parsed = JSON.parse(jsonPart);
        if (parsed && parsed.detail) {
          return parsed.detail;
        }
      } catch {
        // ignore JSON parse errors, fall back
      }
    }

    // Fallback: show the full message
    return message;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1) If we are in "register" mode, try to create the user first.
      if (mode === "register") {
        if (!name) {
          setError("Please provide your name to register.");
          setLoading(false);
          return;
        }
        try {
          await api.register({ name, email, password });
        } catch (registerErr) {
          console.error("Register error:", registerErr);
          const msg = normalizeErrorMessage(registerErr);
          // Example: "Email already registered"
          setError(msg);
          setLoading(false);
          return; // ⛔ Do NOT try to login if register failed
        }
      }

      // 2) Then login (for both login & successful-register flows)
      const tokenResp = await api.login({ email, password });

      // Support multiple token field names from backend
      const token =
        (tokenResp && tokenResp.access_token) ||
        (tokenResp && tokenResp.access) ||
        (tokenResp && tokenResp.token) ||
        (tokenResp && tokenResp.auth_token);

      if (!token) {
        throw new Error("Invalid response from auth server (no token returned)");
      }

      // 3) Let App.js store the token and load the user
      await onAuthSuccess(token);
    } catch (err) {
      console.error("Auth error:", err);
      const msg = normalizeErrorMessage(err);
      setError(msg); // e.g. "Invalid email or password"
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing">
      <div className="landing-panel">
        <div className="landing-left">
          <div className="brand-pill">Smart Agriculture & Forestry</div>
          <h1>Monitor your fields & forests in one cloud dashboard.</h1>
          <p>
            A modern console-style interface to manage farms, plots, sensors,
            and environmental data with built-in irrigation and fire-risk
            analytics.
          </p>
          <ul className="landing-list">
            <li>✅ Modern-style dashboard</li>
            <li>✅ Green agricultural & forestry theme</li>
            <li>✅ Full CRUD with authenticated access</li>
            <li>✅ Smart irrigation & fire-risk insights</li>
          </ul>
        </div>
        <div className="landing-right">
          <div className="login-card">
            <h2>{mode === "login" ? "Login" : "Register"}</h2>
            <p className="login-subtitle">
              {mode === "login"
                ? "Sign in with your email and password to access the console."
                : "Create an account. Then you will be logged into the console."}
            </p>
            <div className="form-row" style={{ marginBottom: "0.5rem" }}>
              <button
                type="button"
                className="chip chip-outline"
                onClick={() => {
                  setMode("login");
                  setError("");
                }}
                style={{
                  opacity: mode === "login" ? 1 : 0.6,
                  borderColor:
                    mode === "login" ? "rgba(34,197,94,0.9)" : undefined,
                }}
              >
                Login
              </button>
              <button
                type="button"
                className="chip chip-outline"
                onClick={() => {
                  setMode("register");
                  setError("");
                }}
                style={{
                  opacity: mode === "register" ? 1 : 0.6,
                  borderColor:
                    mode === "register" ? "rgba(34,197,94,0.9)" : undefined,
                }}
              >
                Register
              </button>
            </div>
            <form onSubmit={handleSubmit} className="form">
              {mode === "register" && (
                <input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required={mode === "register"}
                />
              )}
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              {error && (
                <p className="muted" style={{ color: "#fca5a5" }}>
                  {error}
                </p>
              )}
              <button type="submit" disabled={loading}>
                {loading
                  ? "Please wait..."
                  : mode === "login"
                  ? "Login"
                  : "Register & Login"}
              </button>
            </form>
            <p className="login-footnote">
              This authentication is implemented on the backend using a user
              table and signed tokens, which are validated on each API request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Landing;


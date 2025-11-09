const API_BASE = "http://localhost:5000/api";

// --- LOGIN ---
async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  const msg = document.getElementById("loginMsg");

  if (!username || !password) {
    msg.innerText = "Please enter both username and password.";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok && data.token) {
      // ✅ Save token + role securely before redirect
      localStorage.setItem("token", data.token);

      const payload = JSON.parse(atob(data.token.split(".")[1]));
      localStorage.setItem("role", payload.role);

      msg.innerText = "✅ Login successful! Redirecting...";

      // ✅ Delay redirect to ensure localStorage write completes
      setTimeout(() => {
        if (payload.role === "SuperVendor") {
          window.location.href = "super-dashboard.html";
        } else if (payload.role === "SubVendor") {
          window.location.href = "sub-dashboard.html";
        } else {
          alert("Unknown role. Please contact admin.");
        }
      }, 300);
    } else {
      msg.innerText = data.error || "Invalid credentials. Try again.";
    }
  } catch (err) {
    console.error("❌ Login error:", err);
    msg.innerText = "Server not responding. Please try later.";
  }
}

// --- REGISTER (for SuperVendor only) ---
async function register() {
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value.trim();

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role: "SuperVendor" }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("✅ SuperVendor registered successfully! You can now log in.");
    window.location.href = "vendor-login.html";
  } else {
    alert(data.error || "Registration failed. Try again.");
  }
}

// --- LOGOUT (for dashboards) ---
function logout() {
  localStorage.clear();
  window.location.href = "vendor-login.html";
}

// --- DASHBOARD TOKEN VERIFY (for all dashboards) ---
async function verifyLogin() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    console.warn("⚠️ Token missing. Redirecting to login...");
    window.location.href = "vendor-login.html";
    return;
  }

  try {
    const res = await fetch(`${API_BASE}/vendors/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) throw new Error("Invalid or expired token");

    const data = await res.json();
    console.log(`✅ Verified: ${data.vendor?.name || "Unknown"} (${role})`);
  } catch (err) {
    console.warn("❌ Token invalid:", err.message);
    alert("Your session expired. Please log in again.");
    localStorage.clear();
    window.location.href = "vendor-login.html";
  }
}

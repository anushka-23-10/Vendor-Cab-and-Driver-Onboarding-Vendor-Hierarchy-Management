const API_BASE = "http://localhost:5000/api";

// --- LOGIN ---
async function login() {
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value.trim();

  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();

  if (data.token) {
    localStorage.setItem("token", data.token);
    // Decode JWT payload to find role
    const payload = JSON.parse(atob(data.token.split(".")[1]));
    localStorage.setItem("role", payload.role);

    // Redirect based on role
    if (payload.role === "SuperVendor") {
      window.location.href = "super-dashboard.html";
    } else if (payload.role === "SubVendor") {
      window.location.href = "sub-dashboard.html";
    } else {
      alert("Unknown role!");
    }
  } else {
    alert(data.error || "Login failed");
  }
}


// --- REGISTER ---
async function register() {
  const username = document.getElementById("regUsername").value;
  const password = document.getElementById("regPassword").value;
  const role = document.getElementById("regRole").value;

  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, role })
  });

  const data = await res.json();
  if (res.ok) {
    document.getElementById("registerMsg").innerText = "✅ Registered successfully! You can log in now.";
  } else {
    document.getElementById("registerMsg").innerText = data.error || "Registration failed";
  }
}

// --- LOGOUT (on dashboard) ---
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// --- Load Vendors (on dashboard) ---
async function getAllVendors() {
  const res = await fetch(`${API_BASE}/vendors/all`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });
  const data = await res.json();
  const list = document.getElementById("vendorList");
  list.innerHTML = "";
  data.forEach(v => {
    const li = document.createElement("li");
    li.className = "list-group-item";
    li.innerText = `${v.name} (${v.role})`;
    list.appendChild(li);
  });
}

if (window.location.pathname.includes("dashboard.html")) getAllVendors();

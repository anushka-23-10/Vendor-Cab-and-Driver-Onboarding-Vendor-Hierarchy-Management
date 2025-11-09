const API_BASE = "http://localhost:5000/api";
let token = localStorage.getItem("token");

// --- LOGIN ---
async function login() {
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password })
  });

  const data = await res.json();
  if (data.token) {
    localStorage.setItem("token", data.token);
    window.location.href = "dashboard.html";
  } else {
    document.getElementById("errorMsg").innerText = data.error || "Login failed";
  }
}

// --- LOGOUT ---
function logout() {
  localStorage.removeItem("token");
  window.location.href = "index.html";
}

// --- CREATE SUBVENDOR ---
async function createSubVendor() {
  const name = document.getElementById("vendorName").value;
  const address = document.getElementById("vendorAddress").value;

  const res = await fetch(`${API_BASE}/vendors/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": "Bearer " + localStorage.getItem("token")
    },
    body: JSON.stringify({ name, address, contactInfo: "N/A" })
  });

  const data = await res.json();
  alert(data.message || data.error);
  getAllVendors();
}

// --- GET ALL VENDORS ---
async function getAllVendors() {
  const res = await fetch(`${API_BASE}/vendors/all`, {
    headers: { "Authorization": "Bearer " + localStorage.getItem("token") }
  });

  const data = await res.json();
  const list = document.getElementById("vendorList");
  list.innerHTML = "";
  data.forEach(v => {
    const item = document.createElement("li");
    item.className = "list-group-item";
    item.innerText = `${v.name} (${v.role})`;
    list.appendChild(item);
  });
}

// Load data when on dashboard
if (window.location.pathname.includes("dashboard.html")) {
  getAllVendors();
}

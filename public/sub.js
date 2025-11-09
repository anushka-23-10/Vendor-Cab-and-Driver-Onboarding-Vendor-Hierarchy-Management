function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// 🟢 Display Parent Info
async function loadParentInfo() {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));

  if (payload.parentVendorId) {
    const res = await fetch(`/api/vendors/${payload.parentVendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const parent = await res.json();
    document.getElementById("parentInfo").innerHTML =
      `<h4>Parent Vendor: ${parent.name} (${parent.role})</h4>`;
  } else {
    document.getElementById("parentInfo").innerHTML =
      `<h4>No Parent Vendor (Top Level)</h4>`;
  }

  // Populate role dropdown based on current vendor role
  const roleSelect = document.getElementById("role");
  roleSelect.innerHTML = "";

  switch (payload.role) {
    case "SuperVendor":
      roleSelect.innerHTML = `
        <option value="RegionalVendor">Regional Vendor</option>
        <option value="CityVendor">City Vendor</option>
        <option value="LocalVendor">Local Vendor</option>
      `;
      break;
    case "RegionalVendor":
      roleSelect.innerHTML = `
        <option value="CityVendor">City Vendor</option>
        <option value="LocalVendor">Local Vendor</option>
      `;
      break;
    case "CityVendor":
      roleSelect.innerHTML = `<option value="LocalVendor">Local Vendor</option>`;
      break;
    default:
      roleSelect.innerHTML = `<option value="">No roles available</option>`;
      document.getElementById("subVendorForm").style.display = "none";
  }
}

// 🟣 Create subvendor (using chosen role)
document.getElementById("subVendorForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;
  const address = document.getElementById("address").value;
  const contactInfo = document.getElementById("contactInfo").value;
  const role = document.getElementById("role").value;

  const res = await fetch("/api/vendors/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ username, password, address, contactInfo, role }),
  });

  const data = await res.json();
  if (res.ok) {
    alert(`${data.vendor.role} created successfully!`);
    loadSubVendors();
  } else {
    alert(data.error);
  }
});

// 🟡 Load subvendors
async function loadSubVendors() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/vendors/mysubs", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const subs = await res.json();

  const list = document.getElementById("subVendorList");
  list.innerHTML = "";
  subs.forEach((s) => {
    const li = document.createElement("li");
    li.textContent = `${s.name} (${s.role}) — ${s.address}`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  loadParentInfo();
  loadSubVendors();
});

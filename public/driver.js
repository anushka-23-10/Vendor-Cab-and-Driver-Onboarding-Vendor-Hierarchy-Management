function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

document.getElementById("driverForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const name = document.getElementById("driverName").value;
  const licenseNo = document.getElementById("licenseNo").value;

  const res = await fetch("/api/drivers/onboard", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ name, licenseNo }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("Driver added successfully!");
    loadDrivers();
  } else {
    alert(data.error);
  }
});

// 🟡 Load all drivers for this SubVendor
async function loadDrivers() {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1])); // decode JWT
  const vendorId = payload.id;

  const res = await fetch(`/api/drivers/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const drivers = await res.json();
  const list = document.getElementById("driverList");
  list.innerHTML = "";

  drivers.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = `${d.name} — License: ${d.licenseNo}`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", loadDrivers);

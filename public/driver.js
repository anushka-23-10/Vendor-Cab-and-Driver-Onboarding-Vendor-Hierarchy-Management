function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// Add new driver
document.getElementById("driverForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const name = document.getElementById("driverName").value;
  const licenseNo = document.getElementById("licenseNo").value;

  const res = await fetch("/api/drivers/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ name, licenseNo })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Driver added successfully!");
    loadDrivers();
  } else {
    alert(data.error);
  }
});

// Load drivers for current vendor
async function loadDrivers() {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const vendorId = payload.id;

  const res = await fetch(`/api/drivers/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const drivers = await res.json();

  const list = document.getElementById("driverList");
  const dropdown = document.getElementById("driverSelect");
  list.innerHTML = "";
  dropdown.innerHTML = "";

  drivers.forEach((d) => {
    const li = document.createElement("li");
    li.textContent = `${d.name} (License: ${d.licenseNo})`;
    list.appendChild(li);

    const option = document.createElement("option");
    option.value = d._id;
    option.textContent = d.name;
    dropdown.appendChild(option);
  });
}

document.getElementById("docForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("file", document.getElementById("file").files[0]);
  formData.append("type", document.getElementById("type").value);
  formData.append("ownerId", document.getElementById("driverSelect").value);
  formData.append("issueDate", document.getElementById("issueDate").value);
  formData.append("expiryDate", document.getElementById("expiryDate").value);
  formData.append("ownerType", "Driver");

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (res.ok) alert("Document uploaded successfully!");
  else alert(data.error);
});


// Upload driver document
document.getElementById("docForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData();

  formData.append("file", document.getElementById("file").files[0]);
  formData.append("type", document.getElementById("type").value);
  formData.append("ownerId", document.getElementById("ownerId").value);
  formData.append("issueDate", document.getElementById("issueDate").value);
  formData.append("expiryDate", document.getElementById("expiryDate").value);
  formData.append("ownerType", "Driver");

  const res = await fetch("/api/documents/upload", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  const data = await res.json();
  if (res.ok) {
    alert("Document uploaded successfully!");
  } else {
    alert(data.error);
  }
});

document.addEventListener("DOMContentLoaded", loadDrivers);

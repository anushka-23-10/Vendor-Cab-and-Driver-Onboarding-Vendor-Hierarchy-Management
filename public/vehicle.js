function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

document.getElementById("vehicleForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const token = localStorage.getItem("token");

  const registrationNo = document.getElementById("registrationNo").value;
  const model = document.getElementById("model").value;
  const fuelType = document.getElementById("fuelType").value;
  const capacity = document.getElementById("capacity").value;

  const res = await fetch("/api/vehicles/add", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ registrationNo, model, fuelType, capacity })
  });

  const data = await res.json();
  if (res.ok) {
    alert("Vehicle added successfully!");
    loadVehicles();
  } else {
    alert(data.error);
  }
});

async function loadVehicles() {
  const token = localStorage.getItem("token");
  const payload = JSON.parse(atob(token.split(".")[1]));
  const vendorId = payload.id;

  const res = await fetch(`/api/vehicles/${vendorId}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const vehicles = await res.json();
  const list = document.getElementById("vehicleList");
  list.innerHTML = "";
  vehicles.forEach((v) => {
    const li = document.createElement("li");
    li.textContent = `${v.registrationNo} (${v.model}) - ${v.fuelType}, ${v.capacity} seats`;
    list.appendChild(li);
  });
}

document.addEventListener("DOMContentLoaded", loadVehicles);

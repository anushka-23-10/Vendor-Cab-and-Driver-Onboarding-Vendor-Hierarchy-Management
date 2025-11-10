async function loadDrivers() {
  try {
    const res = await fetch("/api/drivers/list", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    const data = await res.json();
    console.log("👥 Driver API Response:", data);

    const tbody = document.querySelector("#driverTable tbody");
    const driverSelect = document.getElementById("driverSelect");
    tbody.innerHTML = "";
    driverSelect.innerHTML = '<option value="">-- Select Driver --</option>';

    if (!data.success || !data.drivers?.length) {
      tbody.innerHTML =
        '<tr><td colspan="5" style="text-align:center;">No drivers found</td></tr>';
      return;
    }

    data.drivers.forEach((d) => {
      const assigned = d.assignedVehicle
        ? d.assignedVehicle.registrationNumber
        : "—";

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${d.name}</td>
        <td>${d.licenseNumber}</td>
        <td>${d.contactInfo || "—"}</td>
        <td>${assigned}</td>
        <td>✅ Active</td>`;
      tbody.appendChild(tr);

      driverSelect.innerHTML += `<option value="${d._id}">${d.name}</option>`;
    });
  } catch (err) {
    console.error("❌ loadDrivers Error:", err);
  }
}

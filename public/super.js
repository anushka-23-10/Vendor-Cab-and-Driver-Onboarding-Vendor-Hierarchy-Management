async function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

document.getElementById("subVendorForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const token = localStorage.getItem("token");
  const name = document.getElementById("name").value;
  const category = document.getElementById("category").value;
  const location = document.getElementById("location").value;

  const res = await fetch("/api/vendors/create", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name,
      address: location,
      contactInfo: category,
    }),
  });

  const data = await res.json();
  if (res.ok) {
    alert("SubVendor created successfully!");
    loadSubVendors();
  } else {
    alert(data.error);
  }
});

async function loadSubVendors() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/vendors/all", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const vendors = await res.json();

  const list = document.getElementById("subVendorList");
  const hierarchy = document.getElementById("hierarchyContainer");

  list.innerHTML = "";
  hierarchy.innerHTML = "";

  const subVendors = vendors.filter((v) => v.role === "SubVendor");

  subVendors.forEach((v) => {
    const li = document.createElement("li");
    li.textContent = `${v.name} — ${v.contactInfo} (${v.address})`;
    list.appendChild(li);

    // Simple box representation
    const box = document.createElement("div");
    box.style.border = "1px solid black";
    box.style.padding = "10px";
    box.style.margin = "5px";
    box.style.display = "inline-block";
    box.innerText = `SubVendor: ${v.name}\nCategory: ${v.contactInfo}\nLocation: ${v.address}`;
    hierarchy.appendChild(box);
  });
}

document.addEventListener("DOMContentLoaded", loadSubVendors);

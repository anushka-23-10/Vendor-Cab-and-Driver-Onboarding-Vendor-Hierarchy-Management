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
  list.innerHTML = "";
  vendors
    .filter((v) => v.role === "SubVendor")
    .forEach((v) => {
      const li = document.createElement("li");
      li.textContent = `${v.name} — ${v.contactInfo} (${v.address})`;
      list.appendChild(li);
    });
}

document.addEventListener("DOMContentLoaded", loadSubVendors);

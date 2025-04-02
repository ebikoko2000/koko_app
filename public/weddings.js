document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token"); // ✅ Fetch token

    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "/";
        return;
    }

    fetch("http://localhost:3000/api/weddings", {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Unauthorized access");
        }
        return response.json();
    })
    .then((data) => {
        const tableBody = document.getElementById("weddingTableBody");
        tableBody.innerHTML = ""; // Clear previous data

        data.forEach((wedding) => {
            const row = `
                <tr>
                    <td>${wedding.id}</td>
                    <td>${wedding.feature}</td> <!-- Changed from couple_name -->
                    <td>${wedding.description}</td> <!-- Changed from date -->
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    })
    // .catch(() => {
    //     alert("Session expired. Please log in again.");
    //     localStorage.removeItem("token");
    //     window.location.href = "/";
    // });

    // ✅ Logout Function
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("token");
        alert("Logged out successfully");
        window.location.href = "/";
    });
});

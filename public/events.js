document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "/";
        return;
    }

    fetch("http://localhost:3000/api/events", {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Unauthorized access");
        }
        return response.json();
    })
    .then((data) => {
        const tableBody = document.getElementById("eventsTableBody");
        tableBody.innerHTML = ""; // Clear previous data

        data.forEach((event) => {
            const row = `
                <tr>
                    <td>${event.id}</td>
                    <td>${event.event_type}</td>
                    <td>${event.description}</td>
                </tr>
            `;
            tableBody.innerHTML += row;
        });
    });

    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("token");
        alert("Logged out successfully");
        window.location.href = "/";
    });
});

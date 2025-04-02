document.addEventListener("DOMContentLoaded", function () {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("You must be logged in to access this page.");
        window.location.href = "/";
        return;
    }

    fetch("http://localhost:3000/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
    })
    .then((response) => {
        if (!response.ok) {
            throw new Error("Unauthorized access");
        }
        return response.text();
    })
    .catch(() => {
        alert("Session expired. Please log in again.");
        localStorage.removeItem("token");
        window.location.href = "/";
    });

    // Decode JWT token to get user info
    try {
        const decoded = JSON.parse(atob(token.split(".")[1]));
        document.getElementById("userInfo").innerText = `Hello, ${decoded.username}`;
    } catch (error) {
        console.error("Error decoding token:", error);
        localStorage.removeItem("token");
        window.location.href = "/";
    }

    // Logout Function
    document.getElementById("logoutBtn").addEventListener("click", function () {
        localStorage.removeItem("token");
        alert("Logged out successfully");
        window.location.href = "/";
    });

        const sections = document.querySelectorAll(".scroll-section");
    
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("show");
                } else {
                    entry.target.classList.remove("show"); // Optional: Remove if you don't want it to fade out
                }
            });
        }, {
            threshold: 0.2 // Trigger when 20% of the section is visible
        });
    
        sections.forEach((section) => {
            observer.observe(section);
        });
    
});

document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("registerBtn").addEventListener("click", async function () {
      const username = document.getElementById("regUsername").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const password = document.getElementById("regPassword").value.trim();

      if (!username || !email || !password) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await fetch("http://localhost:3000/api/register", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ username, email, password }),
          });

          const data = await response.json();
          alert(response.ok ? "User registered successfully" : `Error: ${data.error}`);
      } catch (error) {
          console.error("Registration error:", error);
          alert("An error occurred. Please try again.");
      }
  });

  document.getElementById("loginBtn").addEventListener("click", async function () {
      const email = document.getElementById("loginEmail").value.trim();
      const password = document.getElementById("loginPassword").value.trim();

      if (!email || !password) {
          alert("Please fill in all fields.");
          return;
      }

      try {
          const response = await fetch("http://localhost:3000/api/login", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email, password }),
          });

          const data = await response.json();
          if (response.ok) {
              localStorage.setItem("token", data.token);
              alert("Login successful");
              window.location.href = "/dashboard.html"; // Redirect to dashboard
          } else {
              alert(`Error: ${data.error}`);
          }
      } catch (error) {
          console.error("Login error:", error);
          alert("An error occurred. Please try again.");
      }
  });
});

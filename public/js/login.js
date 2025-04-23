const loginForm = document.getElementById("login-form");
const loginText = document.getElementById("login-text");
const loginButton = document.getElementById("loginButton");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    loginText.textContent = "Logging in...";

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please fill in all fields.");
      loginText.textContent = "";
      return;
    }

    try {
      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      console.log("data : ", data);
      if (data.success) {
        loginText.textContent = "";
        if (data.role === "admin" || data.role === "superadmin" ) {
          window.location.href = "/admin-dashboard";
        } else {
          window.location.href = "/home";
        }
      } else {
        alert(data.message || "Login failed. Please try again.");
        loginText.textContent = "";
      }
    } catch (error) {
      console.error("Error:", error);
      alert(error.message);
      loginText.textContent = "";
    }
  });
}


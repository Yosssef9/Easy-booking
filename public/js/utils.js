// utils.js
export function setupLogout() {
    const logoutButton = document.getElementById("logout");
    
    if (logoutButton) {
      logoutButton.addEventListener("click", function(e) {
        e.preventDefault();
        
        fetch("http://localhost:5000/api/auth/logout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })
        .then((response) => response.json())
        .then((data) => {
          if (data.message === "Logout successful") {
            window.location.href = "/login";
          }
        })
        .catch((error) => console.error("Error logging out:", error));
      });
    } else {
      console.warn("Logout button not found");
    }
  }
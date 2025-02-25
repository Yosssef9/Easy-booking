async function getAllProperties() {
    try {
        const response = await fetch("http://localhost:5000/api/property/getAllUserProperties", {
            method: "GET",
        });

        if (response.ok) {
            const result = await response.json();
            console.log(result);
            displayAllProperties(result.data);
        } else {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to fetch properties.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("There was an error fetching the properties. Please try again.");
    }
}

async function displayAllProperties(data) {
    let propertiesContainer = document.getElementById("properties-container");
    data.forEach(property => {
        let div = document.createElement("div");
        div.classList.add("property-card");

        div.innerHTML = `
            <img src="${property.thumbnail}" alt="${property.name}">
            <h3>${property.name}</h3>
        `;

        propertiesContainer.appendChild(div);
    });
}

getAllProperties();




document.getElementById("logout").addEventListener("click", function (e) {
    e.preventDefault();  // Prevent default link behavior

    fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",  // Ensure cookies are included
    })
    .then(response => response.json())
    .then(data => {
      if (data.message === "Logout successful") {
        window.location.href = "/login";  // Redirect after logout
      }
    })
    .catch(error => console.error("Error logging out:", error));
  });
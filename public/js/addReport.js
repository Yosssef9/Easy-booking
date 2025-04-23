document.addEventListener("DOMContentLoaded", function () {
  const reportForm = document.querySelector(".report-form");

  reportForm.addEventListener("submit", async function (event) {
    event.preventDefault(); // Prevent the default form submission

    // Get the form data
    const title = reportForm.querySelector('[name="title"]').value;
    const description = reportForm.querySelector('[name="description"]').value;

    // Prepare the data to send to the server
    const reportData = {
      title,
      description,
    };

    try {
      const response = await fetch(
        "http://localhost:5000/api/auth/sendReport",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(reportData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log("result", result);
        alert("Report created successfully!"); // Success message
        // Reset the form
        reportForm.reset();
      } else {
        const error = await response.json();
        console.log("error", error);
        alert(error.message || "Failed to create the report."); // Error message
      }
    } catch (error) {
      alert("An error occurred: " + error.message); // Catch network or other errors
    }
  });
});

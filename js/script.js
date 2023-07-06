// Represent each entry in the parking lot
class Entry {
  constructor(owner, model, numberPlate, entryDate, exitDate) {
    this.owner = owner;
    this.model = model;
    this.numberPlate = numberPlate;
    this.entryDate = entryDate;
    this.exitDate = exitDate;
  }
}
// Handle User Interface Tasks
const UI = {
  // Display entries in the UI table
  displayEntries: async () => {
    try {
      const entries = await API.getEntries();
      entries.forEach((entry) => {
        UI.addEntryToTable(entry);
      });
    } catch (error) {
      UI.showAlert("Failed to retrieve entries from the API", "danger");
    }
  },

  // Add an entry to the UI table
  addEntryToTable: (entry) => {
    const tableBody = document.querySelector("#tableBody");
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${entry.owner}</td>
      <td>${entry.model}</td>
      <td>${entry.numberPlate}</td>
      <td>${entry.entryDate}</td>
      <td>${entry.exitDate}</td>
      <td><button class="btn btn-danger delete" data-number-plate="${entry.owner}">Delete</button></td>
    `;
    tableBody.appendChild(row);
  },

  // Remove an entry from the UI table
  deleteEntry: (target) => {
    if (target.classList.contains("delete")) {
      const owner = target.dataset.owner;
      API.deleteEntry(owner)
        .then(() => {
          target.parentElement.parentElement.remove();
          UI.showAlert(
            "Car successfully removed from the parking lot list",
            "success"
          );
        })
        .catch((error) => {
          UI.showAlert("Failed to delete entry from the API", error);
        });
    }
  },

  // Show an alert message in the UI
  showAlert: (message, className) => {
    const div = document.createElement("div");
    div.className = `alert alert-${className} w-50 mx-auto`;
    div.appendChild(document.createTextNode(message));

    // Find the container where the form is located
    const formContainer = document.querySelector(".form-container");
    const form = document.querySelector("#entryForm");

    formContainer.insertBefore(div, form); // Insert the alert div before the form in the container

    const alert = document.querySelector(".alert");
    setTimeout(() => alert.remove(), 3000); // Set a timeout to remove the alert after 3 seconds
  },

  validateInputs: () => {
    const owner = document.querySelector("#owner").value;
    const model = document.querySelector("#model").value;
    const numberPlate = document.querySelector("#numberPlate").value;
    const entryDate = document.querySelector("#entryDate").value;
    const exitDate = document.querySelector("#exitDate").value;

    if (
      owner === "" ||
      model === "" ||
      numberPlate === "" ||
      entryDate === "" ||
      exitDate === ""
    ) {
      UI.showAlert("All fields must be filled!", "danger");
      return false;
    }
    if (exitDate < entryDate) {
      UI.showAlert("Exit Date cannot be lower than Entry Date", "danger");
      return false;
    }

    return true;
  },
};

// Handle API Requests
const API = {
  getEntries: async () => {
    const response = await fetch("http://localhost:3000/entries");

    if (!response.ok) {
      throw new Error("Failed to retrieve entries from the API");
    }

    const data = await response.json();
    return data;
  },

  addEntry: async (entry) => {
    const response = await fetch("http://localhost:3000/entries", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(entry),
    });

    if (!response.ok) {
      throw new Error("Failed to add entry to the API");
    }
  },

  deleteEntry: async (owner) => {
    const response = await fetch(`http://localhost:3000/entries/${owner}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error("Failed to delete entry from the API");
    }
  },
};

// Display entries when the DOM is loaded
document.addEventListener("DOMContentLoaded", UI.displayEntries);

// Add an entry
document.querySelector("#entryForm").addEventListener("submit", (e) => {
  e.preventDefault();

  // Declare Variables
  const owner = document.querySelector("#owner").value;
  const model = document.querySelector("#model").value;
  const numberPlate = document.querySelector("#numberPlate").value;
  const entryDate = document.querySelector("#entryDate").value;
  const exitDate = document.querySelector("#exitDate").value;

  if (UI.validateInputs() === false) {
    return;
  }
  // Initiate Entry
  const entry = new Entry(owner, model, numberPlate, entryDate, exitDate);

  // Add the entry to the UI table
  UI.addEntryToTable(entry);

  API.addEntry(entry)
    .then(() => {
      UI.showAlert("Car successfully added to the parking lot", "success");
      document.querySelector("#entryForm").reset();
    })
    .catch(() => {
      UI.showAlert("Failed to add entry to the API", "danger");
    });
});

// Delete an entry
document.querySelector("#tableBody").addEventListener("click", (e) => {
  const target = e.target;
  if (target.classList.contains("delete")) {
    UI.deleteEntry(target);
  }
});

// Search entries
document.querySelector("#searchInput").addEventListener("keyup", () => {
  const searchValue = document
    .querySelector("#searchInput")
    .value.toUpperCase();

  const tableLine = document.querySelector("#tableBody").querySelectorAll("tr");

  // for loop #1 (used to pass all the lines)
  for (let i = 0; i < tableLine.length; i++) {
    let count = 0;

    // Get all columns of each line
    const lineValues = tableLine[i].querySelectorAll("td");

    // for loop #2 (used to pass all the columns)
    for (let j = 0; j < lineValues.length - 1; j++) {
      // Check if any column of the line starts with the input search string
      if (lineValues[j].innerHTML.toUpperCase().startsWith(searchValue)) {
        count++;
      }
    }
    if (count > 0) {
      // If any column contains the search value the display block
      tableLine[i].style.display = "";
    } else {
      // Else display none
      tableLine[i].style.display = "none";
    }
  }
});

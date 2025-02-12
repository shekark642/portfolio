console.log('IT’S ALIVE!');

function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}



const darkModeToggle = document.getElementById("dark-mode-toggle");
const body = document.body;

// Check for saved user preference
if (localStorage.getItem("darkMode") === "enabled") {
  body.classList.add("dark-mode");
}

// Toggle dark mode when the button is clicked
darkModeToggle.addEventListener("click", () => {
  body.classList.toggle("dark-mode");

  // Save user preference in local storage
  if (body.classList.contains("dark-mode")) {
    localStorage.setItem("darkMode", "enabled");
  } else {
    localStorage.setItem("darkMode", "disabled");
  }
});
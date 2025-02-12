console.log('IT’S ALIVE!');



function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}

let pages = [
  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'contact/', title: 'Contact' },
  { url: 'resume/', title: 'Resume' },
  { url: 'https://github.com/shekark642', title: 'GitHub' },
];

const ARE_WE_HOME = document.documentElement.classList.contains('home');

let nav = document.createElement('nav');
document.body.prepend(nav);

for (let p of pages) {
  let url = p.url;
  let title = p.title;

  // Adjust URL if not on the home page and URL is relative
  url = !ARE_WE_HOME && !url.startsWith('http') ? '../' + url : url;

  // Create the link and add it to <nav>
  // nav.insertAdjacentHTML('beforeend', `<a href="${url}">${title}</a>`);
  let a = document.createElement('a');
  a.href = url;
  a.textContent = title;

  a.classList.toggle(
  'current',
  a.host === location.host && a.pathname === location.pathname
  );

  if (a.host !== location.host) {
  a.target = '_blank';
  }

  nav.append(a);

}

let navLinks = Array.from(nav.querySelectorAll("a"));
let currentLink = navLinks.find(
(a) => a.host === location.host && a.pathname === location.pathname
);

currentLink?.classList.add("current");




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






export async function fetchJSON(url) {
    try {
        // Fetch the JSON file from the given URL
        const response = await fetch(url);

        // Check if the response was successful
        if (!response.ok) {
            throw new Error(`Failed to fetch projects: ${response.statusText}`);
        }

        // Parse response data
        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}
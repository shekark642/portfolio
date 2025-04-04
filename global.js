console.log('IT’S ALIVE!');



function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}



let pages = [

  { url: '', title: 'Home' },
  { url: 'projects/', title: 'Projects' },
  { url: 'news/', title: 'News' },
  { url: 'meta/', title: 'Meta' },
  { url: 'contact/', title: 'Contact' }


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






let darkModeContainer = document.createElement('div');
darkModeContainer.classList.add('dark-mode-toggle');

// Create dark mode button
let darkModeButton = document.createElement('button');
darkModeButton.id = "dark-mode-toggle";
darkModeButton.textContent = "🌙";

// Append the dark mode button to its container
darkModeContainer.appendChild(darkModeButton);

// Append the dark mode container to the navbar
nav.appendChild(darkModeContainer);






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

        const data = await response.json();
        return data; 

    } catch (error) {
        console.error('Error fetching or parsing JSON data:', error);
    }
}




export function renderProjects(projects, containerElement, headingLevel ='h2') {
  // Clear the existing content of the container element
  containerElement.innerHTML = '';

  // Loop through each project to create an article element for each
  for (let project of projects) {
      // Create a new <article> element to hold the project's details
      const article = document.createElement('article');

      // Create the heading element dynamically
      const heading = document.createElement(headingLevel);
      heading.textContent = project.title;

      // Create a span for the project year
      const yearSpan = document.createElement('span');
      yearSpan.textContent = ` (${project.year})`;
      yearSpan.style.fontWeight = 'bold';
      yearSpan.style.marginLeft = '8px';
      yearSpan.style.color = '#555';


      // Wrap heading and year together in a div
      const headingContainer = document.createElement('div');
      headingContainer.appendChild(heading);
      headingContainer.appendChild(yearSpan);

      // Create an image element
      const img = document.createElement('img');
      img.src = project.image;
      img.alt = project.title;

      // Create a paragraph for the description
      const description = document.createElement('p');
      description.textContent = project.description;
      description.innerHTML = project.description;


      // Append all elements to the article
      article.appendChild(headingContainer);
      article.appendChild(img);
      article.appendChild(description);
      article.appendChild(yearSpan);


      // Append the article to the container element
      containerElement.appendChild(article);
  }
}



export async function fetchGitHubData(username) {
  return fetchJSON(`https://api.github.com/users/${username}`);
}
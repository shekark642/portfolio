import { fetchJSON, renderProjects, fetchGitHubData} from './global.js';


const projects = await fetchJSON('./lib/projects.json');
const latestProjects = projects.slice(0, 1);
const projectsContainer = document.querySelector('.projects');
renderProjects(latestProjects, projectsContainer, 'h2');



const githubData = await fetchGitHubData('giorgianicolaou');



const profileStats = document.querySelector('#profile-stats');



const profileStatsContainer = document.createElement('div');
profileStatsContainer.classList.add('profile-stats-container');

// Move the existing profile stats inside the container
profileStatsContainer.appendChild(profileStats);

// Prepend the container to the body so it's at the top
document.body.prepend(profileStatsContainer);


if (profileStats) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
            <dt>Created:</dt><dd>${githubData.created_at}</dd>
          </dl>
      `;
  }
  
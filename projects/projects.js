import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm";
console.log(d3); // This should print the d3 object in the console
import { fetchJSON, renderProjects } from '../global.js';
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');
const projectsTitle = document.querySelector('.projects-title');
projectsTitle.textContent = `Projects Count: ${projects.length}`;

function renderPieChart(projectsGiven, selectedIndex = -1) {
    let newSVG = d3.select('svg');

    newSVG.selectAll('path').remove();
    let legend = d3.select('.legend');
    legend.selectAll('li').remove();
  
    // Recalculate rolled data and data for the pie chart
    let newRolledData = d3.rollups(
      projectsGiven,
      (v) => v.length,
      (d) => d.year
    );
    
    let newData = newRolledData.map(([year, count]) => {
      return { value: count, label: year };
    });
  
    // Re-calculate slice generator, arc data, arc, etc.
    let newSliceGenerator = d3.pie().value((d) => d.value);
    let newArcData = newSliceGenerator(newData);
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let arcs = newArcData.map((d) => arcGenerator(d));
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
  

    arcs.forEach((arc, idx) => {
      let path = newSVG.append('path')
        .attr('d', arc)
        .attr('fill', colors(idx))
        .on('click', () => {
          // Toggle selection (deselect if the same wedge is clicked again)
          selectedIndex = selectedIndex === idx ? -1 : idx;
  
          // Update the wedge selection (use class 'selected' to persist highlight)
          newSVG.selectAll('path')
            .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
  
          // Update the legend to reflect the selection
          legend.selectAll('li')
            .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'));
  
          // Filter projects when a wedge is clicked
          if (selectedIndex !== -1) {
            // Filter projects based on the selected year
            const selectedYear = newData[selectedIndex].label;
            let filteredProjects = projects.filter((project) => project.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
          } else {
            // If no wedge is selected, show all projects
            renderProjects(projects, projectsContainer, 'h2');
          }
        });
    });

    
  
    newData.forEach((d, idx) => {
      legend.append('li')
        .attr('style', `--color:${colors(idx)}`)  
        .attr('class', 'legend-item')
        .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`)
        .on('click', () => {
          selectedIndex = selectedIndex === idx ? -1 : idx;
  
          newSVG.selectAll('path')
            .attr('class', (_, i) => (i === selectedIndex ? 'selected' : ''));
  
          legend.selectAll('li')
            .attr('class', (_, i) => (i === selectedIndex ? 'legend-item selected' : 'legend-item'));
  
          if (selectedIndex !== -1) {
            // Filter projects based on the selected year
            const selectedYear = newData[selectedIndex].label;
            let filteredProjects = projects.filter((project) => project.year === selectedYear);
            renderProjects(filteredProjects, projectsContainer, 'h2');
          } else {
            // If no legend item is selected, show all projects
            renderProjects(projects, projectsContainer, 'h2');
          }
        });
        
    });

  }
  
  renderPieChart(projects);
  
  let query = '';
  let searchInput = document.querySelector('.searchBar');
  
  searchInput.addEventListener('change', (event) => {
    query = event.target.value.toLowerCase();
  
    let filteredProjects = projects.filter((project) => {
      let values = Object.values(project).join('\n').toLowerCase();
      return values.includes(query);
    });
  
    renderProjects(filteredProjects, projectsContainer, 'h2');
        renderPieChart(filteredProjects);
  });
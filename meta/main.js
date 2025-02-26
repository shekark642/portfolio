let data = [];
let xScale, yScale; 



document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  createScatterplot();

}, 




);

async function loadData() {
    data = await d3.csv('loc.csv', (row) => ({
      ...row,
      line: Number(row.line), // or just +row.line
      depth: Number(row.depth),
      length: Number(row.length),
      date: new Date(row.date + 'T00:00' + row.timezone),
      datetime: new Date(row.datetime),
    }));

    displayStats();
    console.log(commits);
  }




  let commits = d3.groups(data, (d) => d.commit);

  function processCommits() {
    commits = d3
      .groups(data, (d) => d.commit)
      .map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        let ret = {
          id: commit,
          url: 'https://github.com/shekark642/portfolio/commit/' + commit,
          author,
          date,
          time,
          timezone,
          datetime,
          hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
          totalLines: lines.length,
        };

  
        Object.defineProperty(ret, 'lines', {
          value: lines,
          // What other options do we need to set?
          // Hint: look up configurable, writable, and enumerable

        });
  
        return ret;
      });
  }



  function displayStats() {
    // Process commits first
    processCommits();
  
    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');
  
    // Add total LOC
    dl.append('dt').text('Total Lines of Code:');
    dl.append('dd').text(data.length);
  
    // Add total commits
    dl.append('dt').text('Total commits:');
    dl.append('dd').text(commits.length);

    dl.append('dt').text('Last commit:');
    dl.append('dd').text(commits[0].date.toISOString().substring(0, 10));


    // Add total number of files
    dl.append('dt').text('Number of files:');
    dl.append('dd').text((d3.group(data, d => d.file).size));


    dl.append('dt').text('Longest line length:');
    dl.append('dd').text(d3.max(data, d => d.length));


    dl.append('dt').text('Average length per file:').append('dd').text((d3.sum([...d3.group(data, d => d.file).values()], lines => lines.length) / d3.group(data, d => d.file).size || 0).toFixed(2));

  }


  
  function createScatterplot() {
    const width = 800;
    const height = 500;
  
    const svg = d3
      .select("#chart")
      .append("svg")

      .attr("transform", "translate(-70, 20)")
      .style("overflow", "visible");
  

      
    xScale = 
      d3.scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  
    yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  
    const dots = svg.append("g").attr("class", "dots");
  
    // **CORRECTED COLOR SCALE BASED ON ACTUAL TIME OF DAY**
    const colorScale = d3.scaleLinear()
      .domain([0, 6, 12, 18, 24]) // Midnight → Morning → Noon → Evening → Midnight
      .range(["#1e3c72", "#4682b4", "#ffcc00", "#ff8c00", "#1e3c72"]) // Dark blue → Light blue → Yellow → Orange → Dark blue
      .interpolate(d3.interpolateRgb);




    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const sortedCommits = d3.sort(commits, (d) => -d.totalLines);



    const rScale = d3
    .scaleSqrt() // Change only this line
    .domain([minLines, maxLines])
    .range([2, 30]);
    

    brushSelector();
    // Append dots with color based on actual time of day
    dots
      .selectAll('circle')
      .data(sortedCommits)
      .join('circle')
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d.hourFrac)) // **Now maps to correct time**
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.8)
      .attr('r', (d) => rScale(d.totalLines))
      .style('fill-opacity', 0.7) // Add transparency for overlapping dots


      




      .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Full opacity on hover
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);

      })
      .on('mouseleave', () => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore transparency

        updateTooltipContent({});
        updateTooltipVisibility(false);
      });




      

      
  
    const margin = { top: 10, right: 10, bottom: 30, left: 20 };
  
    const usableArea = {
      top: margin.top,
      right: width - margin.right,
      bottom: height - margin.bottom,
      left: margin.left,
      width: width - margin.left - margin.right,
      height: height - margin.top - margin.bottom,
    };
  
    // Update scales with new ranges
    xScale.range([usableArea.left, usableArea.right]);
    yScale.range([usableArea.bottom, usableArea.top]);
  
    // Add gridlines BEFORE the axes
    const gridlines = svg
      .append("g")
      .attr("class", "gridlines")
      .attr("transform", `translate(${usableArea.left}, 0)`);
  
    // Create gridlines as an axis with no labels and full-width ticks
    gridlines.call(d3.axisLeft(yScale).tickFormat("").tickSize(-usableArea.width));
  
    // Create the axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale).tickFormat((d) => String(d % 24).padStart(2, "0") + ":00");
  
    // Add X axis
    svg.append("g").attr("transform", `translate(0, ${usableArea.bottom})`).call(xAxis);
  
    // Add Y axis
    svg.append("g").attr("transform", `translate(${usableArea.left}, 0)`).call(yAxis);


  }
  



  function updateTooltipContent(commit) {
    const link = document.getElementById('commit-link');
    const date = document.getElementById('commit-date');
  
    if (Object.keys(commit).length === 0) return;
  
    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', {
      dateStyle: 'full',
    });
  }


  function updateTooltipVisibility(isVisible) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.hidden = !isVisible;
  }

  function updateTooltipPosition(event) {
    const tooltip = document.getElementById('commit-tooltip');
    tooltip.style.left = `${event.clientX+20}px`;
    tooltip.style.top = `${event.clientY+20}px`;
  }


  function brushSelector() {

    const svg = document.querySelector('svg');

    //d3.select(svg).call(d3.brush());  
    d3.select(svg).call(d3.brush().on('start brush end', brushed));

    d3.select(svg).selectAll('.dots, .overlay ~ *').raise();

  }


let brushSelection = null;
function brushed(event) {
  brushSelection = event.selection;
  updateSelection();
  updateSelectionCount();
  updateLanguageBreakdown();
}

function isCommitSelected(commit) {
  if (!brushSelection) return false;

  const min = { x: brushSelection[0][0], y: brushSelection[0][1] };
  const max = { x: brushSelection[1][0], y: brushSelection[1][1] };

  const x = xScale(commit.datetime); // Use global xScale
  const y = yScale(commit.hourFrac); // Use global yScale

  return x >= min.x && x <= max.x && y >= min.y && y <= max.y;
}









function updateSelection() {
  // Update visual state of dots based on selection
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(d));
}


function updateSelectionCount() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${
    selectedCommits.length || 'No'
  } commits selected`;

  return selectedCommits;
}


function updateLanguageBreakdown() {
  const selectedCommits = brushSelection
    ? commits.filter(isCommitSelected)
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }
  const requiredCommits = selectedCommits.length ? selectedCommits : commits;
  const lines = requiredCommits.flatMap((d) => d.lines);

  // Use d3.rollup to count lines per language
  const breakdown = d3.rollup(
    lines,
    (v) => v.length,
    (d) => d.type
  );

  // Update DOM with breakdown
  container.innerHTML = '';

  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <dt>${language}</dt>
            <dd>${count} lines (${formatted})</dd>
        `;
  }

  return breakdown;
}
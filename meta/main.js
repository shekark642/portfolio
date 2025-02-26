let data = [];


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
    const width = 1000;
    const height = 600;
  
    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("viewBox", `0 0 ${width} ${height}`)
      .style("overflow", "visible");
  
    const xScale = d3
      .scaleTime()
      .domain(d3.extent(commits, (d) => d.datetime))
      .range([0, width])
      .nice();
  
    const yScale = d3.scaleLinear().domain([0, 24]).range([height, 0]);
  
    const dots = svg.append("g").attr("class", "dots");
  
    // **CORRECTED COLOR SCALE BASED ON ACTUAL TIME OF DAY**
    const colorScale = d3.scaleLinear()
      .domain([0, 6, 12, 18, 24]) // Midnight → Morning → Noon → Evening → Midnight
      .range(["#1e3c72", "#4682b4", "#ffcc00", "#ff8c00", "#1e3c72"]) // Dark blue → Light blue → Yellow → Orange → Dark blue
      .interpolate(d3.interpolateRgb);
  
    // Append dots with color based on actual time of day
    dots
      .selectAll("circle")
      .data(commits)
      .join("circle")
      .attr("cx", (d) => xScale(d.datetime))
      .attr("cy", (d) => yScale(d.hourFrac))
      .attr("r", 5)
      .attr("fill", (d) => colorScale(d.hourFrac)) // **Now maps to correct time**
      .attr("stroke", "black")
      .attr("stroke-width", 0.5)
      .attr("opacity", 0.8)


      .on('mouseenter', (event, commit) => {
        updateTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);

      })
      .on('mouseleave', () => {
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
    tooltip.style.left = `${event.clientX}px`;
    tooltip.style.top = `${event.clientY}px`;
  }
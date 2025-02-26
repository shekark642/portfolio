let data = [];


document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
});

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





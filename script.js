async function fetchScheduleOneDate(dateStr) {
  const proxy = "https://api.allorigins.win/raw?url=";
  const url = `https://www.espn.com/wnba/schedule/_/date/${dateStr}`;

  try {
    const res = await fetch(proxy + encodeURIComponent(url));
    const html = await res.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");

    // Find the schedule table — ESPN uses a table with class "schedule"
    const table = doc.querySelector("table.schedule");
    if (!table) {
      console.log("Schedule table not found");
      return;
    }

    const rows = table.querySelectorAll("tbody > tr");
    const schedule = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length < 3) return;

      // Column 1 = matchup teams
      // Column 2 = time (ET)
      const matchup = cols[0].innerText.trim().replace(/\s+vs\.?\s+/i, " v. ");
      const timeET = cols[1].innerText.trim();

      schedule.push({ date: formatDate(dateStr), time: timeET, matchup });
    });

    renderSchedule(schedule);

  } catch (err) {
    console.error(err);
  }
}

function formatDate(dateStr) {
  // dateStr like '20250703'
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  return `${m}/${d}/${y}`;
}

function renderSchedule(schedule) {
  const tbody = document.querySelector("#schedule-table tbody");
  tbody.innerHTML = "";
  schedule.forEach(({ date, time, matchup }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${date}</td><td>${time}</td><td>${matchup}</td>`;
    tbody.appendChild(tr);
  });
}

// Run test for one date:
fetchScheduleOneDate("20250703");

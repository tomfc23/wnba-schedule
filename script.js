async function fetchWNBAHTMLSchedule() {
  const proxy = "https://corsproxy.io/?";
  const baseUrl = "https://www.espn.com/wnba/schedule/_/date/";
  const startDate = new Date("2025-05-14");  // approximate season start
  const endDate = new Date("2025-09-15");    // approximate season end

  const oneDay = 86400000; // ms in a day
  const schedule = [];

  for (let d = startDate; d <= endDate; d = new Date(d.getTime() + oneDay)) {
    const dateStr = d.toISOString().slice(0, 10).replace(/-/g, "");
    const url = proxy + baseUrl + dateStr;

    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, "text/html");
      const tables = doc.querySelectorAll("table");
      if (!tables.length) continue;

      tables.forEach(table => {
        const rows = table.querySelectorAll("tbody > tr");
        rows.forEach(row => {
          const cols = row.querySelectorAll("td");
          if (cols.length < 3) return;

          const matchup = cols[0].innerText.trim().replace("vs", "v.");
          const timeET = convertToEST(cols[1].innerText.trim());
          const dateFormatted = d.toLocaleDateString("en-US");

          schedule.push({ date: dateFormatted, time: timeET, matchup });
        });
      });

    } catch (err) {
      console.error("Failed on date:", d.toISOString(), err);
    }
  }

  renderSchedule(schedule);
}

function convertToEST(timeStr) {
  // e.g. "9:00 PM", "8:30 AM"
  const [time, meridian] = timeStr.split(" ");
  if (!time || !meridian) return timeStr;
  const [h, m] = time.split(":").map(Number);
  const d = new Date();
  d.setUTCHours(meridian === "PM" ? h + 12 : h, m || 0, 0);

  // Convert to EST (New York time, DST-safe)
  const estTime = d.toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "numeric",
    minute: "2-digit"
  });
  return estTime;
}

function renderSchedule(schedule) {
  const tbody = document.querySelector("#schedule-table tbody");
  schedule.forEach(({ date, time, matchup }) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${date}</td><td>${time}</td><td>${matchup}</td>`;
    tbody.appendChild(tr);
  });
}

fetchWNBAHTMLSchedule();

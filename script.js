const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTV0ITDll09moWFzxf29ma1yYwwuFoayx6La0Nm8ej_5MtjRh6s2GFqif2GEVR-hsBsy8cp8RqvJtzQ/pub?output=csv";

let games = [];
let columns = { mlb: {}, wnba: {} };

Papa.parse(csvUrl, {
  download: true,
  header: true,
  complete: function (results) {
    games = results.data;
    detectColumns(games[0]);
  }
});

// Dynamically detect which columns belong to MLB and WNBA
function detectColumns(row) {
  const keys = Object.keys(row);
  const mlbCols = keys.slice(0, 3); // Assumes MLB columns come first
  const wnbaCols = keys.slice(3);   // Then WNBA columns

  columns.mlb = {
    date: mlbCols.find(k => k.toLowerCase().includes("date")),
    time: mlbCols.find(k => k.toLowerCase().includes("time")),
    matchup: mlbCols.find(k => k.toLowerCase().includes("matchup"))
  };

  columns.wnba = {
    date: wnbaCols.find(k => k.toLowerCase().includes("date")),
    time: wnbaCols.find(k => k.toLowerCase().includes("time")),
    matchup: wnbaCols.find(k => k.toLowerCase().includes("matchup"))
  };
}

function showSchedule() {
  const inputDate = document.getElementById("datePicker").value;
  if (!inputDate) return;

  const dateStr = formatToShortDate(inputDate);
  const selectedDate = new Date(inputDate);

  const mlbGames = games.filter(g => g[columns.mlb.date] === dateStr);
  const wnbaGames = games.filter(g => g[columns.wnba.date] === dateStr);

  const mlbTime = getEarliestTime(mlbGames, columns.mlb.time);
  const wnbaTime = getEarliestTime(wnbaGames, columns.wnba.time);

  const formattedDate = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    month: "numeric",
    day: "numeric"
  });

  const summary = [
    `Games on ${formattedDate}:`,
    `———————————————`,
    `${mlbGames.length} MLB ${mlbTime ? `(${mlbTime})` : ''}`,
    `${wnbaGames.length} WNBA ${wnbaTime ? `(${wnbaTime})` : ''}`,
    `———————————————`,
    `${mlbGames.length + wnbaGames.length} total games`,
    `———————————————`
  ].join("\n");

  document.getElementById("output").innerText = summary;
}

function formatToShortDate(dateStr) {
  const d = new Date(dateStr);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const yy = d.getFullYear().toString().slice(2);
  return `${mm}/${dd}/${yy}`;
}

function getEarliestTime(gameList, timeKey) {
  const validTimes = gameList
    .map(g => parseTime(g[timeKey]))
    .filter(t => t !== null)
    .sort((a, b) => a - b);

  return validTimes.length ? formatTime(validTimes[0]) : null;
}

function parseTime(str) {
  if (!str || !str.includes(":")) return null;
  const [time, period] = str.trim().split(" ");
  if (!time || !period) return null;

  let [h, m] = time.split(":").map(Number);
  if (period === "PM" && h < 12) h += 12;
  if (period === "AM" && h === 12) h = 0;

  return new Date(0, 0, 0, h, m);
}

function formatTime(date) {
  const h = date.getHours();
  const m = date.getMinutes().toString().padStart(2, '0');
  const suffix = h < 12 ? 'A' : '';
  return `${(h % 12 || 12)}:${m}${suffix}`;
}

const csvUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTV0ITDll09moWFzxf29ma1yYwwuFoayx6La0Nm8ej_5MtjRh6s2GFqif2GEVR-hsBsy8cp8RqvJtzQ/pub?output=csv";

let games = [];

Papa.parse(csvUrl, {
  download: true,
  header: true,
  complete: function (results) {
    games = results.data;
  }
});

function showSchedule() {
  const selected = document.getElementById("datePicker").value;
  if (!selected) return;

  const mlbGames = [];
  const wnbaGames = [];

  const selectedDate = new Date(selected);
  const mmddyy = `${selectedDate.getMonth() + 1}/${selectedDate.getDate()}/${String(selectedDate.getFullYear()).slice(2)}`;

  games.forEach(game => {
    if (game["MLB Date"] === mmddyy) {
      mlbGames.push(game);
    }
    if (game["WNBA Date"] === mmddyy) {
      wnbaGames.push(game);
    }
  });

  const earliestTime = (list, timeKey) => {
    const times = list
      .map(g => parseTime(g[timeKey]))
      .sort((a, b) => a - b);
    return times.length ? formatTime(times[0]) : null;
  };

  const formatOutput = () => {
    const day = selectedDate.toLocaleDateString("en-US", {
      weekday: "long",
      month: "numeric",
      day: "numeric"
    });

    const mlbTime = earliestTime(mlbGames, "MLB Time");
    const wnbaTime = earliestTime(wnbaGames, "WNBA Time");

    let result = `Games on ${day}:\n———————————————\n`;
    result += `${mlbGames.length} MLB ${mlbTime ? `(${mlbTime})` : ''}\n`;
    result += `${wnbaGames.length} WNBA ${wnbaTime ? `(${wnbaTime})` : ''}\n`;
    result += `———————————————\n${mlbGames.length + wnbaGames.length} total games\n———————————————`;

    document.getElementById("output").innerText = result;
  };

  formatOutput();
}

function parseTime(timeStr) {
  if (!timeStr) return null;
  const [time, period] = timeStr.split(" ");
  let [hour, minute] = time.split(":").map(Number);
  if (period === "PM" && hour !== 12) hour += 12;
  if (period === "AM" && hour === 12) hour = 0;
  return new Date(0, 0, 0, hour, minute);
}

function formatTime(dateObj) {
  const hours = dateObj.getHours();
  const mins = dateObj.getMinutes().toString().padStart(2, '0');
  const suffix = hours < 12 ? 'A' : '';
  const formatted = `${(hours % 12 || 12)}:${mins}${suffix}`;
  return formatted;
}

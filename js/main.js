gsap.registerPlugin(ScrollTrigger);

const yearSpan = document.getElementById("current-year");
const currentYear = new Date().getFullYear();
yearSpan.textContent = currentYear;

function updateTime() {
  const timeContainer = document.getElementById("time");
  const options = {
    timeZone: "Australia/Melbourne",
    hour: "2-digit",
    minute: "2-digit",
  };
  const formatter = new Intl.DateTimeFormat([], options);
  const timeString = formatter.format(new Date());
  timeContainer.textContent = timeString;
}

updateTime();
setInterval(updateTime, 1000); // Update the time every second

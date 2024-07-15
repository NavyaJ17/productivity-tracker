let host;
let currentInterval = null;

const getDate = () => {
  let d = new Date();
  let date = d.getDate();
  let month = d.getMonth();
  let year = d.getFullYear();
  return {
    date: `${date}-${month}-${year}`,
    month: `${month}-${year}`,
  };
};

const display = (seconds) => {
  let s = String(seconds % 60).padStart(2, "0");
  let m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  let h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  document.querySelector(".second").innerHTML = s;
  document.querySelector(".minute").innerHTML = m;
  document.querySelector(".hour").innerHTML = h;
};

const main = (host) => {
  chrome.storage.local.get(host, (value) => {
    const date = getDate().date;
    let data = value[host];
    if (data.limit.type === "Ignore") return;
    display(data.perDay[date]);
    if (data.limit.type === "Block") {
      document.querySelector(".time-used").classList.add("true-limit");
      return;
    }
    if (data.limit.type === "Time-Limit") {
      if (data.perDay[date] >= data.limit.score * 60) {
        document.querySelector(".time-used").classList.add("true-limit");
        return;
      }
    }
    document.querySelector(".time-used").classList.remove("true-limit");
  });
};

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    host = new URL(changeInfo.url).hostname;
    if (currentInterval) {
      clearInterval(currentInterval);
      currentInterval = null;
    }
    currentInterval = setInterval(() => {
      main(host);
    }, 1000);
  });
});

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  host = new URL(tabs[0].url).hostname;
  currentInterval = setInterval(() => {
    main(host);
  }, 1000);
});

document.querySelector("#statisticsButton").addEventListener("click", () => {
  chrome.tabs.create({ url: chrome.runtime.getURL("statistics.html") });
});

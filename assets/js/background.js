let currentInterval = null;

const getDate = () => {
  let d = new Date();
  let date = d.getDate();
  let month = d.getMonth();
  let year = d.getFullYear();
  return {
    day: `${date}-${month}-${year}`,
    month: `${month}-${year}`,
  };
};

const increment = (x) => (x === undefined ? 1 : x + 1);

const timer = (host) => {
  chrome.storage.local.get(host, (value) => {
    let data = value[host];
    const { day, month } = getDate();
    if (data.limit.type === "Ignore") return;
    if (data.limit.type === "Block") {
      chrome.tabs.sendMessage({ msg: "Hello" });
      return 0;
    }
    if (data.limit.type === "Time-Limit") {
      if (increment(data.perDay[day]) - 1 >= data.limit.score * 60) {
        console.log("Time");
        return 0;
      }
    }
    data.perDay[day] = increment(data.perDay[day]);
    data.perMonth[month] = increment(data.perMonth[month]);
    data.all++;
    chrome.storage.local.set({ [host]: data });
  });
};

const main = (host) => {
  if (currentInterval) {
    clearInterval(currentInterval);
    currentInterval = null;
  }

  chrome.storage.local.get(host, (value) => {
    let data = value[host];
    if (data === undefined) {
      chrome.storage.local.set({
        [host]: {
          perDay: {},
          perMonth: {},
          all: 0,
          limit: { type: "None", score: "" },
        },
      });
    }
    currentInterval = setInterval(() => {
      timer(host);
    }, 1000);
  });
};

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    let host = new URL(tab.url).hostname;
    main(host);
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tab.active && changeInfo.url) {
    let host = new URL(changeInfo.url).hostname;
    main(host);
  }
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === "getDomain") sendResponse({ domain: host });
});

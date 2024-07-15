const dctx = document.querySelector(".dctx");
const sctx = document.querySelector(".sctx");
const list = document.querySelector(".limits");

const selectEvent = () => {
  const selectEle = document.querySelectorAll("select");
  selectEle.forEach((select) => {
    select.addEventListener("input", () => {
      chrome.storage.local.get(select.getAttribute("domain"), (value) => {
        let data = value[select.getAttribute("domain")];
        data.limit.type = select.value;
        let input = document.querySelectorAll(
          `[domain="${select.getAttribute("domain")}"]`
        )[1];
        if (select.value === "Time-Limit") {
          input.style.display = "";
          input.value = "";
          input.addEventListener("input", () => {
            data.limit.score = input.value;
            chrome.storage.local.set({
              [select.getAttribute("domain")]: data,
            });
          });
        } else {
          input.style.display = "none";
          data.limit.score = "";
          chrome.storage.local.set({
            [select.getAttribute("domain")]: data,
          });
        }
      });
    });
  });
};

const displayLimits = (data) => {
  let today = Object.keys(data)[Object.keys(data).length - 1];
  for (let domain in data[today]) {
    const listItem = document.createElement("div");
    listItem.classList.add("list-item");
    list.appendChild(listItem);
    listItem.innerHTML = `<span>${domain}</span>
          <div class="select">
            <select id="limitation" domain=${domain}>
              <option value="None">None</option>
              <option value="Ignore">Ignore</option>
              <option value="Block">Block</option>
              <option value="Time-Limit">Time-Limit</option>
            </select>
          </div>
          <div class="inp">
            <input type="number" domain=${domain} style="display: none">
          </div>`;
  }
  let selectEle = document.querySelectorAll("select");
  selectEle.forEach((select) => {
    chrome.storage.local.get(select.getAttribute("domain"), (value) => {
      for (let child of select.children) {
        if (
          child.innerHTML === value[select.getAttribute("domain")].limit.type
        ) {
          child.setAttribute("selected", true);
        }
      }
      let data = value[select.getAttribute("domain")];
      if (data.limit.type === "Time-Limit") {
        let input = document.querySelectorAll(
          `[domain="${select.getAttribute("domain")}"]`
        )[1];
        input.style.display = "";
        input.value = data.limit.score;
      }
    });
  });
  selectEvent();
};

const getColors = (data) => {
  let len = Object.keys(data).length;
  let colors = [];
  for (let i = 0; i < len; i++) {
    colors.push(
      `rgb(${Math.floor(Math.random() * 255)}, ${Math.floor(
        Math.random() * 255
      )}, ${Math.floor(Math.random() * 255)})`
    );
  }
  return colors;
};

const donutChart = (datasets, ctx, data) => {
  let colors = getColors(data);
  for (let date in datasets) {
    let canvasContainer = document.createElement("div");
    let canvas = document.createElement("canvas");
    ctx.appendChild(canvasContainer);
    canvasContainer.appendChild(canvas);
    new Chart(canvas, {
      type: "doughnut",
      data: {
        labels: Object.keys(datasets[date]),
        datasets: [
          {
            label: date,
            data: Object.values(datasets[date]),
            backgroundColor: colors,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: date,
          },
        },
      },
    });
  }
};

const dayWiseData = (data) => {
  let datasets = {};
  for (let domain in data) {
    for (let date in data[domain].perDay) {
      if (!datasets[date]) {
        datasets[date] = {};
      }
      datasets[date][domain] = data[domain].perDay[date];
    }
  }
  donutChart(datasets, dctx, data);
  displayLimits(datasets);
};

const siteWiseData = (data) => {
  let canvas = document.createElement("canvas");
  sctx.appendChild(canvas);
  new Chart(canvas, {
    type: "line",
    data: {
      labels: Object.keys(data),
      datasets: [
        {
          data: Object.keys(data).map((domain) => data[domain].all),
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });
};

chrome.storage.local.get(null, (response) => {
  let data = response;
  dayWiseData(data);
  siteWiseData(data);
});

import { API_URL } from "./config.js";

// const api = "https://api.mp3quran.net/radios/radio_english.json";

const stationsContainer = document.querySelector(".stations");
const stationName = document.querySelector(".station-name");
const controller = document.querySelector(".controller");
const playBtn = document.querySelector(".play-btn");
const pauseBtn = document.querySelector(".pause-btn");
const favBtn = document.querySelector(".fav-btn");
const favContainer = document.querySelector(".popular-stations");
const favStation = document.querySelector(".popular-station");
const audioEl = document.createElement("audio");
const shuffleBtn = document.querySelector(".shuffle-btn");

let favObj = Object.keys(localStorage);

const state = {
  activeEl: "",
  running: "",
  play: false,
};

const stationMarkup = (radio, id, favorite) => {
  return `<li class="station" data-url = "${
    radio.radio_url
  }" data-name = "${radio.name.replaceAll(
    "-",
    ""
  )}" id="${id}" data-fav = "${favorite}">
                      <button class="controller-btn play-btn" type="button" data-role="play/pause"> &InvisibleComma; 
                      <i class="ph-play-fill icon play pointer"></i> </button>
                      <button class="controller-btn hidden pause-btn" type="button" data-role="play/pause">&InvisibleComma; 
                      <i class="ph-pause-fill icon pause pointer"></i> </button>
                      <span class="name-station">${radio.name.replaceAll(
                        "-",
                        ""
                      )}</span>
                  </li>`;
};

const addFav = function () {
  const icon = favBtn.getElementsByClassName("ph-heart");
  icon[0].classList.add("ph-heart-fill");
};

const removeFav = function () {
  const icon = favBtn.getElementsByClassName("ph-heart");
  icon[0].classList.remove("ph-heart-fill");
};

const runStation = function (station) {
  removeFav();

  if (station.dataset.fav === "true") addFav();

  if (state.activeEl) {
    state.activeEl.classList.remove("active");
    state.activeEl.querySelector(".play-btn").classList.remove("hidden");
    state.activeEl.querySelector(".pause-btn").classList.add("hidden");
    // state.play = false;
  }

  state.activeEl = station;
  state.running = station.dataset.name.replaceAll(" ", "");
  if (!state.play) togglePlayer();

  station.classList.add("active");
  station.querySelector(".play-btn").classList.add("hidden");
  station.querySelector(".pause-btn").classList.remove("hidden");

  stationName.textContent = station.dataset.name;
  loadStation(state.activeEl.dataset.url);
  audioEl.play();
};

const loadStation = function (url) {
  audioEl.src = url;
  audioEl.load();
};

const trimName = function (name, limit) {
  if (!(name.length > limit)) return name;
  return `${name.slice(0, limit - 4)} `.padEnd(limit, ".");
};

const togglePlayer = function () {
  state.activeEl.querySelector(".play-btn").classList.toggle("hidden");
  state.activeEl.querySelector(".pause-btn").classList.toggle("hidden");
  playBtn.classList.toggle("hidden");
  pauseBtn.classList.toggle("hidden");
  state.play = state.play ? false : true;
};

const controllerCallback = function (e) {
  const btn = e.target.closest(".controller-btn");
  if (!btn) return;

  // console.log(btn);
  if (
    (btn.dataset.role === "play" || btn.dataset.role === "pause") &&
    state.activeEl
  ) {
    togglePlayer();
    if (btn.dataset.role === "play") audioEl.play();
    if (btn.dataset.role === "pause") audioEl.pause();
  }
};

const getStations = async function () {
  const data = await fetch(API_URL);
  const { radios } = await data.json();

  // console.log(radios);

  radios.forEach((radio) =>
    stationsContainer.insertAdjacentHTML(
      "beforeend",
      stationMarkup(
        radio,
        `${radio.name.replaceAll("-", "").replaceAll(" ", "")}-main`,
        favObj.includes(radio.name.replaceAll("-", "").replaceAll(" ", ""))
          ? true
          : false
      )
    )
  );

  favObj.forEach((i) =>
    favContainer.insertAdjacentHTML("beforeend", localStorage.getItem(i))
  );
};

getStations();

stationsContainer.addEventListener("click", function (e) {
  const curStation = e.target.closest(".station");
  if (!curStation) return;

  runStation(curStation);
});

controller.addEventListener("click", controllerCallback);

//make the audio element play when the page loads
audioEl.addEventListener("loadeddata", function () {
  audioEl.play();
});

////////////////////////////
//IMPLEMENT FAVORITE FEATURE
const favMarkup = (stationData, id) => {
  return `<div class="popular-station eid" id = "${id}" data-name="${stationData.name}" data-url="${stationData.url}">
            <h3 class="popular-station--name">${stationData.name}</h3>
          </div>`;
};

favBtn.addEventListener("click", function () {
  addFav();

  // if (favObj[state.running]) {
  //   document.getElementById(`${state.running}-fav`).remove();
  //   document.getElementById(`${state.running}-main`).dataset.fav = false;
  //   removeFav();
  //   favObj[state.running] = "";

  //   return;
  // }
  // let favObj = [];

  if (favObj.includes(state.running)) {
    document.getElementById(`${state.running}-fav`).remove();
    document.getElementById(`${state.running}-main`).dataset.fav = false;
    removeFav();
    console.log(favObj);
    favObj = favObj.filter((i) => i != state.running);
    console.log(favObj);
    localStorage.removeItem(state.running);
    return;
  }

  state.activeEl.dataset.fav = true;

  const stName = state.activeEl.dataset.name.replaceAll(" ", "");
  const markup = favMarkup(state.activeEl.dataset, `${stName}-fav`);

  favObj.push(stName);
  favContainer.insertAdjacentHTML("beforeend", markup);

  // favorite.push(markup);

  // localStorage.setItem("favorite", favorite);
  localStorage.setItem(stName, markup);
});

favContainer.addEventListener("click", function (e) {
  const curStation = e.target.closest(".popular-station");
  if (!curStation) return;

  addFav();

  if (state.activeEl) {
    state.activeEl.classList.remove("active");
    state.activeEl.querySelector(".play-btn").classList.remove("hidden");
    state.activeEl.querySelector(".pause-btn").classList.add("hidden");
    // state.play = false;
  }

  state.running = curStation.dataset.name.replaceAll(" ", "");
  state.activeEl = document.getElementById(`${state.running}-main`);

  state.activeEl.classList.add("active");
  state.activeEl.querySelector(".play-btn").classList.add("hidden");
  state.activeEl.querySelector(".pause-btn").classList.remove("hidden");

  stationName.textContent = curStation.dataset.name;
  loadStation(curStation.dataset.url);
  audioEl.play();

  //////////////

  if (!state.play) togglePlayer();
});

///////////////////////////
//SHUFFLE FEATURE OR CHOOSE RANDOM STATION
shuffleBtn.addEventListener("click", function () {
  const stations = document.querySelectorAll(".station");
  const curStation = stations[Math.floor(Math.random() * stations.length)];

  runStation(curStation);
});

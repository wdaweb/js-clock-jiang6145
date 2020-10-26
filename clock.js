// Clock
const clock = document.querySelector('.clock');
const hourHand = document.querySelector('.hour-hand');
const minuteHand = document.querySelector('.minute-hand');
const secondHand = document.querySelector('.second-hand');
// Time Text
const timeContent = document.querySelector('.time-content');
const cityText = document.querySelector('.city-text');
const timeText = document.querySelector('.time-text');
const dateText = document.querySelector('.date-text');
// Search
const searchInput = document.querySelector('.search-input');
const searchList = document.querySelector('.search-list');
// 數據
let searchItems = null;
let timer = null;
let markers = [];
// 設定 marker icon 的樣式
const orangeIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
const greyIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-grey.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 取得時區資料
const xhr = new XMLHttpRequest();
xhr.open('get', 'time-zone.json', true);
xhr.send(null);
xhr.onload = () => {
  const timeZoneData = JSON.parse(xhr.responseText);
  // 初始時區
  const initTimeZone = timeZoneData.filter((timeZone) => {
    return timeZone.region === '台灣/台北';
  })[0];
  // 初始化
  setMap(timeZoneData);
  setClock(initTimeZone);
  setSearchList();
  isChecked(initTimeZone.id);
  // 地圖設定
  function setMap(timeZoneData) {
    // 創建地圖容器, 初始設定與屬性
    const corner1 = L.latLng(83.55971676457146, -171.21093750000003);
    const corner2 = L.latLng(-82.40242347938855, 203.55468750000003);
    const bounds = L.latLngBounds(corner1, corner2);
    let map = L.map('map', {
      center: initTimeZone.latlng,
      zoom: 5,
      minZoom: 2,
      maxZoom: 5,
      zoomControl: false,
      maxBounds: bounds,
    });
    // 取得地圖資料與圖片放進容器
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
    }).addTo(map);

    // 創建 marker icon 及 marker 事件處理
    timeZoneData.forEach((timeZone, index) => {
      markers[index] = L.marker(timeZone.latlng, { icon: greyIcon, id: timeZone.id, isChecked: false })
        .addTo(map)
        .bindPopup(`<h3>${timeZone.region}</h3>`, { autoClose: false, closeButton: false })
        .on('mouseover mouseout click', (e) => {
          const checkedID = e.target.options.id;
          if (e.type === 'mouseover') e.target.openPopup();
          if (e.type === 'mouseout' && !e.target.options.isChecked) e.target.closePopup();
          if (e.type === 'click') isChecked(checkedID);
        });
    });
  }
  // 處理 marker 的 isChecked 狀態
  function isChecked(checkedID) {
    let checkedTimeZone = null;
    timeZoneData.forEach((timeZone, index) => {
      if (timeZone.id == checkedID) {
        markers[index].options.isChecked = true;
        checkedTimeZone = timeZone;
      } else {
        markers[index].options.isChecked = false;
      }
    });
    // 樣式處理
    markerChecked();
    seaechListChecked(checkedID);
    // 時間處理
    clearInterval(timer);
    timer = null;
    setClock(checkedTimeZone);
    if (timer === null) {
      timer = setInterval(() => setClock(checkedTimeZone), 1000);
    }
  }
  // 處理 marker樣式與對話框
  function markerChecked() {
    markers.forEach((marker) => {
      if (marker.options.isChecked) {
        marker.openPopup();
        marker.setIcon(orangeIcon);
      } else {
        marker.closePopup();
        marker.setIcon(greyIcon);
      }
    });
  }
  function seaechListChecked(checkedID) {
    searchItems = searchList.querySelectorAll('.item');
    searchItems.forEach((item) => {
      if (item.dataset.id == checkedID) {
        item.style.backgroundColor = 'rgba(255, 166, 0, 0.5)';
      } else {
        item.style.backgroundColor = '';
      }
    });
  }

  // Clock Handler
  function setClock(timeDate) {
    const now = moment();
    let zoneNow = now.tz(timeDate.timeZone); // 轉換時區
    const hour = zoneNow.hours();
    const minute = zoneNow.minutes();
    const second = zoneNow.seconds();
    // 計算旋轉角度
    let hoursDeg = hour * 30 + (minute * 30) / 60;
    let minuteDeg = minute * 6 + (second * 6) / 60;
    let secondDeg = second * 6;
    // 轉換時區的動畫
    if (timer === null) {
      clock.classList.add('transition');
      timeContent.classList.add('animate__animated', 'animate__pulse');
      clock.addEventListener('transitionend', () => clock.classList.remove('transition'));
      timeContent.addEventListener('animationend', () =>
        timeContent.classList.remove('animate__animated', 'animate__pulse')
      );
    }
    // 控制指針角度
    hourHand.style.transform = `rotate(${hoursDeg}deg)`;
    minuteHand.style.transform = `rotate(${minuteDeg}deg)`;
    secondHand.style.transform = `rotate(${secondDeg}deg)`;
    // 時間文字
    cityText.innerText = timeDate.region;
    timeText.innerText = now.format('HH:mm:ss');
    dateText.innerText = now.format('YYYY/MM/DD');
  }
  // search 相關
  searchInput.addEventListener('focus', () => (searchList.style.height = '90vh'));
  searchInput.addEventListener('blur', () => (searchList.style.height = '0'));
  searchInput.addEventListener('keyup', function (e) {
    const searchValue = this.value.trim();
    searchItems.forEach((item) => {
      if (item.innerText.includes(searchValue)) {
        item.style.display = 'block';
        if (e.keyCode === 13) isChecked(item.dataset.id);
      } else {
        item.style.display = 'none';
      }
    });
  });

  function setSearchList() {
    let searchListContent = '';
    timeZoneData.forEach((timeZone) => {
      searchListContent += `<li class="item" data-id=${timeZone.id}>${timeZone.region}</li>`;
    });
    searchList.innerHTML = searchListContent;
  }
  searchList.addEventListener('click', (e) => {
    if (e.target.className !== 'item') return;
    const checkedID = e.target.dataset.id;
    isChecked(checkedID);
  });
};

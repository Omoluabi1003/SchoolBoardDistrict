// This is the main initialization script for the application.
(function() {
  let commissionersData = [];
  // Hide the loading indicator and show the main page
  var mainLoading = document.getElementById('main-loading');
  var mainPage = document.getElementById('main-page');

  mainLoading.style.display = 'none';
  mainPage.style.display = 'block';

  // You can add your application's initialization logic here.
  console.log('Application initialized.');

  require([
    "esri/Map",
    "esri/views/MapView",
    "esri/layers/FeatureLayer",
    "esri/widgets/Legend",
    "esri/widgets/Search",
    "esri/rest/locator",
    "esri/Graphic"
  ], function(Map, MapView, FeatureLayer, Legend, Search, locator, Graphic) {
    const districtRenderer = {
      type: "unique-value",
      field: "DISTRICT",
      uniqueValueInfos: [
        { value: "1", symbol: { type: "simple-fill", color: "#fbb4ae", outline: { color: "white", width: 1 } }, label: "District 1" },
        { value: "2", symbol: { type: "simple-fill", color: "#b3cde3", outline: { color: "white", width: 1 } }, label: "District 2" },
        { value: "3", symbol: { type: "simple-fill", color: "#ccebc5", outline: { color: "white", width: 1 } }, label: "District 3" },
        { value: "4", symbol: { type: "simple-fill", color: "#decbe4", outline: { color: "white", width: 1 } }, label: "District 4" },
        { value: "5", symbol: { type: "simple-fill", color: "#fed9a6", outline: { color: "white", width: 1 } }, label: "District 5" }
      ]
    };

    const districtLayer = new FeatureLayer({
      url: "https://slcgis.stlucieco.gov/hosting/rest/services/Political/SchoolBoardDistricts/MapServer/0",
      outFields: ["*"],
      renderer: districtRenderer,
      popupEnabled: false
    });

    const map = new Map({
      basemap: "streets-navigation-vector",
      layers: [districtLayer]
    });

    const view = new MapView({
      container: "map-container",
      map: map,
      center: [-80.4, 27.3],
      zoom: 9
    });

    const locatorUrl = "https://slcgis.stlucieco.gov/hosting/rest/services/AddressLocators/GeocodeServer";

    const searchWidget = new Search({
      view: view,
      includeDefaultSources: false,
      sources: [{
        locator: locator({ url: locatorUrl }),
        singleLineFieldName: "SingleLine",
        name: "Address",
        placeholder: "Search address"
      }]
    });
    view.ui.add(searchWidget, { position: "top-left", index: 0 });
    const searchContainer = document.getElementById("search-container");
    if (searchContainer) {
      searchContainer.appendChild(searchWidget.container);
    }

    const legend = new Legend({
      view: view,
      container: "legendDiv",
      layerInfos: [{ layer: districtLayer, title: "School Board Districts" }]
    });

    const legendToggle = document.getElementById("legend-toggle");
    const legendPanel = document.getElementById("legend-panel");
    if (legendToggle && legendPanel) {
      legendToggle.addEventListener("click", function() {
        legendPanel.classList.toggle("open");
      });
    }

    view.whenLayerView(districtLayer).then(function(layerView) {
      let highlight;
      const districtSelect = document.getElementById("district-select");
      districtSelect.addEventListener("change", function(e) {
        if (highlight) {
          highlight.remove();
          highlight = null;
        }
        const district = e.target.value;
        if (district) {
          const query = districtLayer.createQuery();
          query.where = "DISTRICT = '" + district + "'";
          layerView.queryFeatures(query).then(function(res) {
            if (res.features.length) {
              highlight = layerView.highlight(res.features.map(f => f.attributes.OBJECTID));
              view.goTo(res.features[0].geometry.extent.expand(1.5));
            }
          });
        }
      });

      view.on("click", function(event) {
        view.hitTest(event).then(function(response) {
          const result = response.results.find(function(r) {
            return r.graphic && r.graphic.layer === districtLayer;
          });
          if (result) {
            const district = result.graphic.attributes.DISTRICT;
            const commissioner = commissionersData.find(c => c.district === district);
            if (commissioner) {
              const content = `<div class="popup-commissioner"><img src="${commissioner.image}" alt="Commissioner"><div><strong>${commissioner.name}</strong><br>${commissioner.title}<br><a href="mailto:${commissioner.email}">${commissioner.email}</a></div></div>`;
              view.popup.open({
                title: `District ${district}`,
                location: event.mapPoint,
                content: content
              });
            }
          }
        });
      });
    });
  });

  // Fetch commissioner data and populate the dropdown
  fetch('commissioners.json')
    .then(response => response.json())
    .then(commissioners => {
      commissionersData = commissioners;
      const districtSelect = document.getElementById('district-select');

      // Add a default option
      const defaultOption = document.createElement('option');
      defaultOption.value = '';
      defaultOption.textContent = 'Select a district';
      districtSelect.appendChild(defaultOption);

      commissioners.forEach(commissioner => {
        const option = document.createElement('option');
        option.value = commissioner.district;
        option.textContent = `District ${commissioner.district}`;
        districtSelect.appendChild(option);
      });

      districtSelect.addEventListener('change', (event) => {
        const selectedDistrict = event.target.value;
        if (selectedDistrict) {
          const selectedCommissioner = commissioners.find(c => c.district === selectedDistrict);
          displayCommissioner(selectedCommissioner, "");
        } else {
            clearCommissionerInfo();
        }
      });
    });

    searchWidget.on("select-result", function(event) {
      const point = event.result.feature.geometry;
      const address = event.result.name;
      view.graphics.removeAll();
      view.graphics.add(new Graphic({
        geometry: point,
        symbol: { type: "simple-marker", color: "red", size: 8 }
      }));
      view.goTo({ target: point, zoom: 14 });

      const query = districtLayer.createQuery();
      query.geometry = point;
      query.spatialRelationship = "intersects";
      query.outFields = ["DISTRICT"];
      districtLayer.queryFeatures(query).then(function(res){
        if (res.features.length) {
          const district = res.features[0].attributes.DISTRICT;
          const commissioner = commissionersData.find(c => c.district === district);
          if (commissioner) {
            displayCommissioner(commissioner, address);
          } else {
            clearCommissionerInfo();
          }
        } else {
          clearCommissionerInfo();
        }
      });
    });

  function displayCommissioner(commissioner, address) {
    document.getElementById('commissioner-name').textContent = commissioner.name;
    document.getElementById('commissioner-title').textContent = commissioner.title;
    document.getElementById('commissioner-district').textContent = `District ${commissioner.district}`;
    document.getElementById('search-address').textContent = address || '';
    const emailLink = document.getElementById('commissioner-email');
    emailLink.textContent = commissioner.email;
    emailLink.href = `mailto:${commissioner.email}`;
    document.getElementById('commissioner-image').src = commissioner.image;
  }

  function clearCommissionerInfo() {
    document.getElementById('commissioner-name').textContent = '';
    document.getElementById('commissioner-title').textContent = '';
    document.getElementById('commissioner-district').textContent = '';
    document.getElementById('search-address').textContent = '';
    const emailLink = document.getElementById('commissioner-email');
    emailLink.textContent = '';
    emailLink.href = '';
    document.getElementById('commissioner-image').src = '';
  }
})();

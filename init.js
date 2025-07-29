// This is the main initialization script for the application.
(function() {
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
    "esri/layers/FeatureLayer"
  ], function(Map, MapView, FeatureLayer) {
    const districtLayer = new FeatureLayer({
      url: "https://slcgis.stlucieco.gov/hosting/rest/services/Political/SchoolBoardDistricts/MapServer/0",
      outFields: ["*"]
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
    });
  });

  // Fetch commissioner data and populate the dropdown
  fetch('commissioners.json')
    .then(response => response.json())
    .then(commissioners => {
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
          displayCommissioner(selectedCommissioner);
        } else {
            clearCommissionerInfo();
        }
      });
    });

    const searchButton = document.getElementById('search-button');
    searchButton.addEventListener('click', () => {
        const address = document.getElementById('address-input').value;
        // For now, we will mock the geocoding and randomly select a commissioner
        // In a real application, you would use a geocoding service to get the district for the address
        if (address) {
            fetch('commissioners.json')
                .then(response => response.json())
                .then(commissioners => {
                    const randomIndex = Math.floor(Math.random() * commissioners.length);
                    const randomCommissioner = commissioners[randomIndex];
                    displayCommissioner(randomCommissioner);
                });
        }
    });

  function displayCommissioner(commissioner) {
    document.getElementById('commissioner-name').textContent = commissioner.name;
    document.getElementById('commissioner-title').textContent = commissioner.title;
    document.getElementById('commissioner-district').textContent = `District ${commissioner.district}`;
    const emailLink = document.getElementById('commissioner-email');
    emailLink.textContent = commissioner.email;
    emailLink.href = `mailto:${commissioner.email}`;
    document.getElementById('commissioner-image').src = commissioner.image;
  }

  function clearCommissionerInfo() {
    document.getElementById('commissioner-name').textContent = '';
    document.getElementById('commissioner-title').textContent = '';
    document.getElementById('commissioner-district').textContent = '';
    const emailLink = document.getElementById('commissioner-email');
    emailLink.textContent = '';
    emailLink.href = '';
    document.getElementById('commissioner-image').src = '';
  }
})();

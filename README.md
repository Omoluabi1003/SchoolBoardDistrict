# SchoolBoardDistrict

This application displays the St. Lucie County School Board Districts using the ArcGIS JavaScript API. To run it locally you may need an ArcGIS API key for the basemap service. Configure the key and optional basemap in `env.js`:

```javascript
window.appConfig = {
  // Replace with your own ArcGIS Developer API key
  apiKey: "YOUR_ARCGIS_API_KEY",
  // basemap id such as "streets-navigation-vector" or "arcgis-topographic"
  basemap: "streets-navigation-vector"
};
```

After setting the configuration, open `index.html` in a modern web browser.


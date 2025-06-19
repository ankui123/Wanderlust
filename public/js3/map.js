maptilersdk.config.apiKey = mapToken;

  const map = new maptilersdk.Map({
    container: 'map',
    style: maptilersdk.MapStyle.STREETS,
    center: coordinates,
    zoom: 9,
  });

  map.addControl(new maptilersdk.NavigationControl());
 
  const popup = new maptilersdk.Popup({ offset: 25 })
  .setHTML(`<h6>${locationName}</h6><p>Exact location provied after booking</p>`);
   
  new maptilersdk.Marker({ color: 'red' })
    .setLngLat(coordinates)
    .setPopup(popup)
    .addTo(map);


const mapDiv = document.getElementById('map');
const trigger = document.querySelector('a');
const status = document.querySelector('#status');

const createGeoJSONCircle = function(center, radiusInKm, points) {
    if(!points) points = 64;

    const coords = {
        latitude: center[1],
        longitude: center[0]
    };

    const km = radiusInKm;

    const ret = [];
    const distanceX = km/(111.320*Math.cos(coords.latitude*Math.PI/180));
    const distanceY = km/110.574;

    let theta, x, y;
    for(let i=0; i<points; i++) {
        theta = (i/points)*(2*Math.PI);
        x = distanceX*Math.cos(theta);
        y = distanceY*Math.sin(theta);

        ret.push([coords.longitude+x, coords.latitude+y]);
    }
    ret.push(ret[0]);

    return {
        "type": "geojson",
        "data": {
            "type": "FeatureCollection",
            "features": [{
                "type": "Feature",
                "geometry": {
                    "type": "Polygon",
                    "coordinates": [ret]
                }
            }]
        }
    };
};

const display = (map, center) => {
  map.on('load', () => {
    map.addSource("polygon", createGeoJSONCircle(center, 1));

    map.addLayer({
        "id": "polygon",
        "type": "fill",
        "source": "polygon",
        "layout": {},
        "paint": {
            "fill-color": "blue",
            "fill-opacity": 0.3
        }
    });
  })

  var marker = new mapboxgl.Marker() // initialize a new marker
    .setLngLat(center) // Marker [lng, lat] coordinates
    .addTo(map); // Add the marker to the map
};


const initMap = (center) => {
  const info = document.querySelector('.info');
  info.style.display = 'none';
  // initialize map
  mapboxgl.accessToken = 'pk.eyJ1IjoidGhpYmF1bHRhZGV0IiwiYSI6ImNrNnc0OWxkcTAwamwzbXM2OHJ6NmRmbTQifQ.pnbyUlQE3c2YRnb0nevz7w';
  var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: center, // starting position [lng, lat]
    zoom: 14 // starting zoom
  });
  var language = new MapboxLanguage();
  map.addControl(language);
  display(map, center);
};

const getPos = (position) => {
  const centerLng = position.coords.longitude;
  const centerLat = position.coords.latitude;
  return [centerLng, centerLat];
};

const geoFindMe = (event) => {
  event.preventDefault();
  const options = { enableHighAccuracy: true };

  const success = (position) => {
    const center = getPos(position);
    mapDiv.classList.remove('display-none'); // display map
    initMap(center);
  };

  const error = (err) => {
    console.log(err)
    console.log(status)
    status.classList.add('highlight');
    status.innerText = "Nous avons besoin de connaître votre position pour pouvoir vous montrez ou vous pouvez aller pendant le confinement. Faites nous confiances, aucune donnée n'est sauvegardé.";
  };

  if (!navigator.geolocation) {
    status.classList.add('highlight');
    status.innerText = "La géolocalisation n'est pas supporté par votre navigateur... mes compétences s'arrêtent ici. Je suis désolé!\n Vous pouvez changer de navigateur ou prendre une carte papier, si ça existe encore... Courage !";
  } else {
    status.classList.add('highlight');
    status.innerText = "Je vous cherche... Merci d'accepter la demande de géolocalisation";
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
};

trigger.addEventListener('click', geoFindMe);

// map.scrollZoom.disable();

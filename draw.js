import './style.css';
import { Map, View } from 'ol';
import Draw from 'ol/interaction/Draw.js';
import OSM from 'ol/source/OSM';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';


let firstPoint = [];
let center = [];
let featureArray = [];
let draw; // global so we can remove it later

const vectorSource = new VectorSource({
  features: featureArray,
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const rasterLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [rasterLayer, vectorLayer],
  view: new View({
    center: [-165027.54, 7052978.36],
    zoom: 8,
    maxZoom: 20,
  }),
});


function addInteraction() {
  draw = new Draw({
    source: vectorSource,
    features: featureArray,
    type: "LineString",
  });
  map.addInteraction(draw);
}

addInteraction();


map.on('click', function (evt) {
  let coordinate = evt.coordinate;
  console.log(coordinate);
  //addPoint(coordinate);
});


//////////////////////////////////////////////////////////////////////
// add marker at center of map 
////////////////////////////////////////////////////////////////////// 
function getCenterCoords() {
  // const map = evt.map;
  //console.log(map.getInteractions());
  center = map.getView().getCenter(map.getSize());
  console.log('getCenterCoords');
  console.log(center);
}

function addMarker(center) {
    //store first coords
    if (firstPoint.length == 0) {
      firstPoint.push(center);
    }
    draw.appendCoordinates([center])
}

function closeLoop() {
  console.log("closeLoop");
  draw.appendCoordinates(firstPoint);
  draw.finishDrawing();
  // Get the array of features
  let features = vectorSource.getFeatures()
  console.log(vectorSource);

  features = vectorLayer.getSource().getFeatures();
  console.log(vectorLayer);
  console.log(features);

  // Go through this array and get coordinates of their geometry.
  features.forEach(function (feature) {
    console.log(feature.getGeometry().getCoordinates());
  });
}



function clearAllMarkers() {
  console.log('clearAll');
  // remove all markers
  vectorLayer.getSource().clear();
}


//////////////////////////////////////////////////////////////////////
// button pixel panning 
////////////////////////////////////////////////////////////////////// 
const step = 10; // pixels

function moveMap([xDirection, yDirection]) {
  var center = map.getView().getCenter();
  var resolution = map.getView().getResolution();
  map.getView().setCenter([center[0] + xDirection * resolution, center[1] + yDirection * resolution]);
}

document.getElementById('select-area').onclick = function (evt) {
  getCenterCoords(evt);
  const center = map.getView().getCenter(map.getSize());
  addMarker(center);
};
document.getElementById('pan-up').onclick = function () {
  moveMap([0, step]);
};
document.getElementById('pan-left').onclick = function () {
  moveMap([-step, 0]);
};
document.getElementById('pan-right').onclick = function () {
  moveMap([step, 0]);
};
document.getElementById('pan-down').onclick = function () {
  moveMap([0, -step]);
};
document.getElementById('zoom-out').onclick = function () {
  const view = map.getView();
  const zoom = view.getZoom();
  view.setZoom(zoom - 1);
};
document.getElementById('zoom-in').onclick = function () {
  const view = map.getView();
  const zoom = view.getZoom();
  view.setZoom(zoom + 1);
};

document.getElementById('close-loop').onclick = function () {
  closeLoop();
};
document.getElementById('clear-all').onclick = function () {
  clearAllMarkers();
};
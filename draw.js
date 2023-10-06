import './style.css';
import { Map, View } from 'ol';
import Draw from 'ol/interaction/Draw.js';
import OSM from 'ol/source/OSM';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { Fill, Stroke, Icon, Style } from 'ol/style.js';
import Point from 'ol/geom/Point.js';
import Feature from 'ol/Feature.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as olEvents from 'ol/events';

const GeoJSON_URL = "data/lad.json";
const pin_URL = "assets/pin.png";
// option to display a marker icon
let displayMarker = false;
let firstPoint = [];

const iconFeature = new Feature({
  geometry: new Point([-165027.54, 7052978.36]) // sheffield
});

const defaultStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.1)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 0.4)',
    width: 0.5,
  }),
});

/* 
const newStyle = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.3)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 1,
  })
});
 */

const highlightStyle = new Style({
  fill: new Fill({
    color: 'rgba(0, 0, 255, 0.5)',
  }),
  stroke: new Stroke({
    color: 'rgba(0, 0, 0, 1)',
    width: 1,
  }),
});

const iconStyle = new Style({
  image: new Icon({
    anchor: [0.5, 1],
    anchorXUnits: 'fraction',
    anchorYUnits: 'fraction',
    src: pin_URL,
    scale: 0.1
  }),
});

let center = [];
iconFeature.setStyle(iconStyle);
let featureArray = [];
if(displayMarker){
  featureArray = [iconFeature]
}

const vectorSource = new VectorSource({
  features: featureArray,
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
});

const LSOALayer = new VectorLayer({
  //background: '#1a2b39',
  source: new VectorSource({
    url: GeoJSON_URL,
    format: new GeoJSON(),
  }),
  style: defaultStyle,
});

const rasterLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [rasterLayer, LSOALayer, vectorLayer],
  view: new View({
    center: [-165027.54, 7052978.36],
    zoom: 8,
    maxZoom: 20,
  }),
});

let draw; // global so we can remove it later

function addInteraction() {
  const value = "LineString";
  draw = new Draw({
    source: vectorSource,
    features: featureArray,
    type: value,
  });
  map.addInteraction(draw);

}
addInteraction();



function onMoveEnd(evt) {
  const map = evt.map;
  console.log(evt);
/*   const extent = map.getView().calculateExtent(map.getSize());
  const bottomLeft = toLonLat(getBottomLeft(extent));
  const topRight = toLonLat(getTopRight(extent));
  display('left', wrapLon(bottomLeft[0]));
  display('bottom', bottomLeft[1]);
  display('right', wrapLon(topRight[0]));
  display('top', topRight[1]); */
}

//map.on('moveend', onMoveEnd);

draw.on('drawend', function (evt) {
  console.log('drawend');
  console.log(draw);
  //map.removeInteraction(draw);
});
draw.on('drawstart', function (evt) {
  console.log('drawstart');
});

/*
map.on("moveend", function (e) {
  console.log("moveend");
  getCenterCoords();
});
*/

map.on('click', function (evt) {
  let coordinate = evt.coordinate;
  console.log(coordinate);
  addMarker(coordinate);
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
  //const center = map.getView().getCenter(map.getSize());

  displayMarker = document.querySelector('input[name=marker]:checked');
  console.log(displayMarker);
  if(displayMarker){
    const iconFeature = new Feature({
      geometry: new Point(center)
    });
/* 
    // add pin icon
    iconFeature.setStyle(iconStyle);
    vectorLayer.getSource().addFeature(iconFeature)
 */
    //store first coords
    if(firstPoint.length==0){
      firstPoint.push(center);
    }
    draw.appendCoordinates([center])

  }else{

    // find the polygon that contains the point
    let polygon = LSOALayer.getSource().getFeaturesAtCoordinate(center)[0];
    //console.log(polygon.getProperties().LAD13NM);
    if(polygon){
      polygon.setStyle(highlightStyle);
    }
  }
}

function closeLoop() {
  console.log("closeLoop");

  draw.appendCoordinates(firstPoint);
  draw.finishDrawing();
console.log(draw);
console.log(draw.sketchCoords_);
// Get the array of features
let features = vectorSource.getFeatures()
console.log(vectorSource);

features = vectorLayer.getSource().getFeatures();
console.log(vectorLayer);
console.log(features);

// Go through this array and get coordinates of their geometry.
features.forEach(function(feature) {
   console.log(feature.getGeometry().getCoordinates());
});
  
/*   const event = new Event("drawend");
  document.dispatchEvent(event); */
}



function clearAllMarkers() {
  console.log('clearAll');
  let polygons = LSOALayer.getSource().getFeatures();
  
  for (var i=0; i< polygons.length; i++){
    polygons[i].setStyle(defaultStyle);
  }
  // remove all markers
  vectorLayer.getSource().clear();
}


//////////////////////////////////////////////////////////////////////
// button pixel panning 
////////////////////////////////////////////////////////////////////// 
function moveMap([xDirection, yDirection]) {
  var center = map.getView().getCenter();
  var resolution = map.getView().getResolution();
  map.getView().setCenter([center[0] + xDirection * resolution, center[1] + yDirection * resolution]);
}
const step = 10; // pixels

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
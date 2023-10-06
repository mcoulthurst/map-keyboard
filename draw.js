import './style.css';
import { Map, View } from 'ol';
import Point from 'ol/geom/Point.js';
import Draw from 'ol/interaction/Draw.js';
import OSM from 'ol/source/OSM';
import { Vector as VectorSource } from 'ol/source.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import {Fill, RegularShape, Stroke, Style} from 'ol/style.js';

let firstPoint = [];
let center = [];
let featureArray = [];
let draw; // global so we can remove it later


const styleFunction = function (feature) {
  const geometry = feature.getGeometry();
  const styles = [
    // linestring
    new Style({
      stroke: new Stroke({
        color: '#0000FF',
        width: 4,
        dash: [10, 10],
      }),
    }),
  ];
/* 
  geometry.forEachSegment(function (start, end) {
    const dx = end[0] - start[0];
    const dy = end[1] - start[1];
    const rotation = Math.atan2(dy, dx);
    // arrows
    styles.push(
      new Style({
        geometry: new Point(end),
//         image: new Icon({
//          src: 'data/arrow.png',
//          anchor: [0.75, 0.5],
//          rotateWithView: true,
//          rotation: -rotation,
//        }), 
      })
    );
  });
 */
  return styles;
};


const vectorSource = new VectorSource({
  features: featureArray,
});

const vectorLayer = new VectorLayer({
  source: vectorSource,
  style: styleFunction,
});

const tileLayer = new TileLayer({
  source: new OSM(),
});

const map = new Map({
  target: 'map',
  layers: [tileLayer, vectorLayer],
  view: new View({
    center: [-165027.54, 7052978.36],
    zoom: 8,
    maxZoom: 20,
  }),
});

/* 
//  custom points: w-i-p
const stroke = new Stroke({color: 'black', width: 2});
const fill = new Fill({color: 'red'});
var pointStyle = new Style({
    image: new RegularShape({
      fill: fill,
      stroke: stroke,
      points: 4,
      radius: 10,
      angle: Math.PI / 4,
    }),
  });
 */


function addInteraction() {
  draw = new Draw({
    source: vectorSource,
    features: featureArray,
    type: "LineString",
    /* style: pointStyle, */
  });
  map.addInteraction(draw);
}

addInteraction();

var drawStyle = function(feature) {
  var styles = [];
  if (feature.getGeometry().getType() == 'LineString') {
      var coordinates = feature.getGeometry().getCoordinates();
      styles.push(new ol.style.Style({
          geometry: new ol.geom.LineString(coordinates.slice(-2)),
          stroke: new ol.style.Stroke({
              color: '#0000FF',
              lineDash: [1, 20],
              width: 5,
            lineCap:'square',
            lineJoin:'round',
            lineDashOffset:10
          })
      })); 
      styles.push(new ol.style.Style({
          geometry: new ol.geom.MultiPoint(coordinates),
          image: new ol.style.RegularShape({
            points: 4,
            radius: 6,
            angle: Math.PI / 4,
            fill: new ol.style.Fill({
              color: 'blue'
            }),
            stroke: new ol.style.Stroke({
              color: 'blue'
            }),
          })
      })); 
      if (coordinates.length > 2) {
        styles.push(new ol.style.Style({
          geometry: new ol.geom.LineString(coordinates.slice(0,-1)),
          stroke: new ol.style.Stroke({
              color: '#0000FF',
              width: 2,
            lineCap:'square',
            lineJoin:'round'
          })
        }));
      }
  }
  return styles;
}

map.on('click', function (evt) {
  let coordinate = evt.coordinate;
  console.log(coordinate);
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
  // reset the first point
  firstPoint = [];

  // Get the array of features
  let features = vectorSource.getFeatures()
  features = vectorLayer.getSource().getFeatures();
  
  //console.log(vectorSource);
  //console.log(vectorLayer);
  //console.log(features);


  // Go through this array and get coordinates of their geometry.
  features.forEach(function (feature) {
    var coords = feature.getGeometry().getCoordinates();
    let str = ""
    coords.forEach(function (point) {
      str += "[" + point + "],<br />";
    });
    traceOut(str)
  });
}



function traceOut(txt) {
  console.log(txt);
  var paragraph = document.getElementById("trace");
  var existing = paragraph.innerHTML;
  paragraph.innerHTML = existing + "<br/>" + txt;
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
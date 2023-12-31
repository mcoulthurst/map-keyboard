import './style.css';
import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';

const array = [];
let i = 0;

for (i=0;i<=99;i++){
  // add div
  var iDiv = document.createElement('div');
  iDiv.id = 'map'+i;
  iDiv.className = 'map';
  document.getElementById('fullscreen').appendChild(iDiv);

  const tileLayer = new TileLayer({
    source: new OSM(),
  });
   let zoom = 17;
   let x = -165000 + i* 140;
   let y = 7053000;
/*   let zoom = i;
  if (i>19){
    zoom = 40 - i ;
  } */


  let view = new View({
    center: [x, y],
    zoom: zoom,
    maxZoom: 20,
  });

  array[i] = new Map({
    controls: [], //  hide attribution and zoom
    target: 'map'+i,
    layers: [tileLayer],
    view: view
  });

}


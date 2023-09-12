import './style.css';
import { Map, View } from 'ol';
import OSM from 'ol/source/OSM';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';

const array = [];
let i = 0;

for (i=0;i<29;i++){
  console.log(i);

  const rasterLayer = new TileLayer({
    source: new OSM(),
  });
  let zoom = i;
  if (i>19){
    zoom = 40 - i ;
  }
  let view = new View({
    center: [-165027.54, 7052978.36],
    zoom: zoom,
    maxZoom: 20,
  });

  array[i] = new Map({
    controls: [], //  hide attribution and zoom
    target: 'map'+i,
    layers: [rasterLayer],
    view: view
  });

}


/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
import { SourceData } from './sourceData';
import { FlightPath } from './flightPath';
import { datasets } from './cycleDatasets';
import { MapVis } from './mapVis';
console.log(datasets);
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';

/*
Pedestrian sensor locations: ygaw-6rzq

**Trees: http://localhost:3002/#fp38-wiyy

Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

let def = (a, b) => a !== undefined ? a : b;

let whenMapLoaded = (map, f) => map.loaded() ? f() : map.once('load', f);

//false && whenMapLoaded(() =>
//  setVisColumn(sourceData.numericColumns[Math.floor(Math.random() * sourceData.numericColumns.length)]));

// TODO decide if this should be in MapVis
function showFeatureTable(feature, sourceData, mapvis) {
    function rowsInArray(array, classStr) {
        return '<table>' + 
            Object.keys(feature)
                .filter(key => 
                    array === undefined || array.indexOf(key) >= 0)
                .map(key =>
                    `<tr><td ${classStr}>${key}</td><td>${feature[key]}</td></tr>`)
                .join('\n') + 
            '</table>';
        }

    if (feature === undefined) {
        // Called before the user has selected anything
        feature = {};
        sourceData.textColumns.forEach(c => feature[c] = '');
        sourceData.numericColumns.forEach(c => feature[c] = '');
        sourceData.boringColumns.forEach(c => feature[c] = '');

    } else if (sourceData.shape === 'polygon') { // TODO check that this is a block lookup choropleth
        feature = sourceData.getRowForBlock(feature.block_id, feature.census_yr);        
    }



    document.getElementById('features').innerHTML = 
        '<h4>Click a field to visualise with colour</h4>' +
        rowsInArray(sourceData.textColumns, 'class="enum-field"') + 
        '<h4>Click a field to visualise with size</h4>' +
        rowsInArray(sourceData.numericColumns, 'class="numeric-field"') + 
        '<h4>Other fields</h4>' +
        rowsInArray(sourceData.boringColumns, '');


    document.querySelectorAll('#features td').forEach(td => 
        td.addEventListener('click', e => {
            mapvis.setVisColumn(e.target.innerText) ; // TODO highlight the selected row
        }));
}

var lastFeature;


function chooseDataset() {
    if (window.location.hash) {
        return window.location.hash.replace('#','');
    }

    // known CLUE block datasets that work ok
    var clueChoices = [
        'b36j-kiy4', // employment
        '234q-gg83', // floor space by use by block
        'c3gt-hrz6' // business establishments -- this one is complete, the others have gappy data for confidentiality
    ];

    // known point datasets that work ok
    var pointChoices = [
        'fp38-wiyy', // trees
        'ygaw-6rzq', // pedestrian sensor locations
        '84bf-dihi', // Venues for events
        'tdvh-n9dv', // Live bike share
        'gh7s-qda8', // DAM
        'sfrg-zygb', // Cafes and Restaurants
        'ew6k-chz4', // Bio Blitz 2016
        '7vrd-4av5', // wayfinding
        'ss79-v558', // bus stops
        'mffi-m9yn', // pubs
        'svux-bada', // soil textures - nice one
        'qjwc-f5sh', // community food guide - good
        'fthy-zajy', // properties over $2.5m
        'tx8h-2jgi', // accessible toilets
        '6u5z-ubvh', // bicycle parking
        //bs7n-5veh, // business establishments. 100,000 rows, too fragile.
        ];

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';
    
    return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    document.querySelector('#caption h1').innerHTML = caption || '';
    document.querySelector('#footer .dataset').innerHTML = name || '';
    
    // TODO reinstate for non-demo mode.
    //document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    //document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
 
 }

 function tweakBasemap(map) {
    var placecolor = '#888'; //'rgb(206, 219, 175)';
    var roadcolor = '#777'; //'rgb(240, 191, 156)';
    map.getStyle().layers.forEach(layer => {
        if (layer.paint['text-color'] === 'hsl(0, 0%, 60%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 20%)');
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 70%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 78%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 45%)'); // roads mostly
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 90%)')
            map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');
    });
    ['poi-parks-scalerank1', 'poi-parks-scalerank1', 'poi-parks-scalerank1'].forEach(id => {
        map.setPaintProperty(id, 'text-color', '#333');
    });

    map.removeLayer('place-city-lg-s'); // remove the Melbourne label itself.

}

/*
  Refresh the map view for this new dataset.
*/
function showDataset(map, dataset, filter, caption) {
    showCaption(dataset.name, dataset.dataId, caption);

    let mapvis = new MapVis(map, dataset, filter, showFeatureTable);

    showFeatureTable(undefined, dataset, mapvis); 
    return mapvis;
}

/*
  Show a dataset that already exists on Mapbox
*/
function showMapboxDataset(map, dataset) {
    if (!map.getSource(dataset.mapbox.source)) {
        map.addSource(dataset.mapbox.source, {
            type: 'vector',
            url: dataset.mapbox.source
        });
    }
    if (!map.getLayer(dataset.mapbox.id)) {
        map.addLayer(dataset.mapbox);
    }
    showCaption(dataset.name, dataset.dataId, dataset.caption);
}


/* Advance and display the next dataset in our loop */
function nextDataset(map, datasetNo) {
    let d = datasets[datasetNo], nextD = datasets[(datasetNo + 1) % datasets.length], mapvis;
    if (d.mapbox) {
        showMapboxDataset(map, d);
    } else {
        mapvis = showDataset(map, d.dataset, d.filter, d.caption);
        mapvis.setVisColumn(d.column);
    }
    // We're aiming to arrive at the viewpoint 1/3 of the way through the dataset's appearance
    // and leave 2/3 of the way through.
    if (d.flyTo && !map.isMoving()) {
        d.flyTo.duration = d.delay/3;// so it lands about a third of the way through the dataset's visibility.
        map.flyTo(d.flyTo);
    }
    
    if (nextD.flyTo) {
        nextD.flyTo.duration = d.delay/3.0 + nextD.delay/3.0;// so it lands about a third of the way through the dataset's visibility.
        setTimeout(() => {
            map.flyTo(nextD.flyTo);
        }, d.delay * 2.0/3.0);
    }

    setTimeout(() => {
        if (mapvis)
            mapvis.remove();
        
        if (d.mapbox)
            map.removeLayer(d.mapbox.id);

        nextDataset(map, (datasetNo + 1) % datasets.length);
    }, d.delay );
}

/* Pre download all datasets in the loop */
function loadDatasets() {
    return Promise
        .all(datasets.map(d => d.dataset ? d.dataset.load() : Promise.resolve ()))
        .then(() => datasets[0].dataset);
}

function loadOneDataset() {
    return new SourceData(chooseDataset()).load();
}

(function start() {
    let demoMode = window.location.hash === '#demo';
    if (demoMode) {
        // if we did this after the map was loading, call map.resize();
        document.querySelector('#features').style.display = 'none';        
        document.querySelector('#legends').style.display = 'none';        
    }

    let map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [144.95, -37.813],
        zoom: 15,//13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl(), 'top-left');
    map.once('load', () => tweakBasemap(map));
    map.on('moveend', e=> {
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });

    (demoMode ? loadDatasets() : loadOneDataset())
    .then(dataset => {
        
        if (dataset) 
            showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, () => {
            if (demoMode) {
                nextDataset(map, 5);
            } else {
                showDataset(map, dataset);
            }
            document.querySelectorAll('#loading')[0].outerHTML='';

            if (demoMode) {
                //var fp = new FlightPath(map);
            }
        });
        

    });
})();

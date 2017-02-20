/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
import { SourceData } from './sourceData';
import { FlightPath } from './flightPath';
import { datasets } from './cycleDatasets';
import { MapVis } from './mapVis';
console.log(datasets);
//mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mbWVsYm91cm5lIiwiYSI6ImNpejdob2J0czAwOWQzM21ubGt6MDVqaHoifQ.55YbqeTHWMK_b6CEAmoUlA';
/*
Pedestrian sensor locations: ygaw-6rzq

**Trees: http://localhost:3002/#fp38-wiyy

Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

let def = (a, b) => a !== undefined ? a : b;

let whenMapLoaded = (map, f) => map.loaded() ? f() : map.once('load', f);

let clone = obj => JSON.parse(JSON.stringify(obj));

const opacityProp = {
            fill: 'fill-opacity',
            circle: 'circle-opacity',
            symbol: 'icon-opacity',
            'fill-extrusion': 'fill-extrusion-opacity'
        };

// returns a value like 'circle-opacity', for a given layer style.
function getOpacityProp(layer) {
    if (layer.layout && layer.layout['text-field'])
        return 'text-opacity';
    else
        return opacityProp[layer.type];
}

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
        'fthi-zajy', // properties over $2.5m
        'tx8h-2jgi', // accessible toilets
        '6u5z-ubvh', // bicycle parking
        //bs7n-5veh, // business establishments. 100,000 rows, too fragile.
        ];

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';
    
    return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    document.querySelector('#caption h1').innerHTML = /*(_datasetNo || '') + */(caption || name || '');
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
function showDataset(map, dataset, filter, caption, noFeatureInfo, options, invisible) {
    
    options = def(options, {});
    if (invisible) {
        options.invisible = true;
    } else {
        showCaption(dataset.name, dataset.dataId, caption);
    }

    let mapvis = new MapVis(map, dataset, filter, !noFeatureInfo? showFeatureTable : null, options);

    showFeatureTable(undefined, dataset, mapvis); 
    return mapvis;
}

function addMapboxDataset(map, dataset) {
    if (!map.getSource(dataset.mapbox.source)) {
        map.addSource(dataset.mapbox.source, {
            type: 'vector',
            url: dataset.mapbox.source
        });
    }
}
/*
  Show a dataset that already exists on Mapbox
*/
function showMapboxDataset(map, dataset, invisible) {
    addMapboxDataset(map, dataset);
    let style = map.getLayer(dataset.mapbox.id);
    if (!style) {
        //if (invisible)
            //dataset.mapbox
        style = clone(dataset.mapbox);
        if (invisible) {
            style.paint[getOpacityProp(style)] = 0;
        }
        map.addLayer(style);
    } else {
        map.setPaintProperty(dataset.mapbox.id, getOpacityProp(style), 0.9); // TODO set right opacity
    }

    if (!invisible) 
        showCaption(dataset.name, dataset.dataId, dataset.caption);
}

let _datasetNo='';
/* Advance and display the next dataset in our loop */
    /*
        Pre-load datasets by:
        - calling the load/display code for the next dataset now, but with opacity 0
        - keeping track of the layer ID
        - if it's present when the dataset gets "shown", 
    */
function nextDataset(map, datasetNo) {
    function displayDataset(d, invisible) {
        if (d.mapbox) {
            showMapboxDataset(map, d, invisible);
            if (!invisible) {
                showCaption(d.name, undefined, d.caption);
            }
        } else {
            d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options,  invisible);
            d.mapvis.setVisColumn(d.column);
            d.layerId = d.mapvis.layerId;
            if (!invisible) {
                showCaption(d.dataset.name, d.dataset.dataId, d.caption);
            }
        }
    }

    _datasetNo = datasetNo;
    let d = datasets[datasetNo], 
        nextD = datasets[(datasetNo + 1) % datasets.length];
        //mapvis;

    if (d.layerId) {
        // layer is pre-loaded
        // TODO change 0.9 to something specific for each type
        map.setPaintProperty(d.layerId, getOpacityProp(map.getLayer(d.layerId)), 0.9);
        if (d.mapbox) { // TODO remove this repetition
            showCaption(d.name, undefined, d.caption);
        } else {
            showCaption(d.dataset.name, d.dataset.dataId, d.caption);
        }
        //mapvis = d.mapvis; 
    } else 
        displayDataset(d, false);

    // load, but don't show, next one. // Comment out the next line to not do the pre-loading thing.
    displayDataset(nextD, true);

    if (d.showLegend) {
        document.querySelector('#legends').style.display = 'block';
    } else {
        document.querySelector('#legends').style.display = 'none';
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
        if (d.mapvis)
            d.mapvis.remove();
        
        if (d.mapbox)
            map.removeLayer(d.mapbox.id);

        
    }, d.delay + 0); /*def(d.linger, 1000)); */// let it linger a bit while the next one is loading.
    setTimeout(() => {
        nextDataset(map, (datasetNo + 1) % datasets.length);
    }, d.delay );
}

/* Pre download all datasets in the loop */
function loadDatasets(map) {
    return Promise
        .all(datasets.map(d => { 
            if (d.dataset)
                return d.dataset.load();
            else
                return Promise.resolve();
                // style isn't done loading so we can't add sources. not sure it will actually trigger downloading anyway.
                //return Promise.resolve (addMapboxDataset(map, d));
        })).then(() => datasets[0].dataset);
}

function loadOneDataset() {
    let dataset = chooseDataset();
    return new SourceData(dataset).load();
    /*if (dataset.match(/....-..../))
        
    else
        return Promise.resolve(true);*/
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
        //style: 'mapbox://styles/mapbox/dark-v9',
        style: 'mapbox://styles/cityofmelbourne/ciz983lqo001w2ss2eou49eos?fresh=2',
        center: [144.95, -37.813],
        zoom: 15,//13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl(), 'top-left');
    //map.once('load', () => tweakBasemap(map));
    map.on('moveend', e=> {
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });

    (demoMode ? loadDatasets(map) : loadOneDataset())
    .then(dataset => {
        
        if (dataset) 
            showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, () => {
            if (demoMode) {
                nextDataset(map, 10);
            } else {
                showDataset(map, dataset);
                // would be nice to support loading mapbox datasets but
                // it's a faff to guess how to style it
                //if (dataset.match(/....-..../))
                //else

            }
            document.querySelectorAll('#loading')[0].outerHTML='';

            if (demoMode) {
                //var fp = new FlightPath(map);
            }
        });
        

    });
})();

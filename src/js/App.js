/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
import { SourceData } from './sourceData';
import { FlightPath } from './flightPath';
import { spin } from './flightPath';
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
            'line': 'line-opacity',
            'fill-extrusion': 'fill-extrusion-opacity'
        };

// returns a value like 'circle-opacity', for a given layer style.
// Can't just use 'visibility' prop, because when a layer is invisible it doesn't preload.
function getOpacityProps(layer) {
    let ret = [opacityProp[layer.type]];
    if (layer.layout && layer.layout['text-field'])
        ret.push('text-opacity');
    if (layer.paint && layer.paint['circle-stroke-color'])
        ret.push('circle-stroke-opacity');
    
    return ret;
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

    document.querySelector('#caption h1').innerHTML = 'Loading random dataset...';
    return pointChoices[Math.round(Math.random() * pointChoices.length)];
    //return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    let includeNo = false;
    document.querySelector('#caption h1').innerHTML = (includeNo ? (_datasetNo || ''):'') + (caption || name || '');
    document.querySelector('#footer .dataset').innerHTML = name || '';
    
    // TODO reinstate for non-demo mode.
    //document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    //document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
 
 }

 function tweakPlaceLabels(map, up) {
    ['place-suburb', 'place-neighbourhood'].forEach(layerId => {

        //rgb(227, 4, 80); CoM pop magenta
        //map.setPaintProperty(layerId, 'text-color', up ? 'rgb(227,4,80)' : 'hsl(0,0,30%)'); // CoM pop magenta
        map.setPaintProperty(layerId, 'text-color', up ? 'rgb(0,183,79)' : 'hsl(0,0,30%)'); // CoM pop green
        
    });
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
        //showCaption(dataset.name, dataset.dataId, caption);
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
            getOpacityProps(style).forEach(prop => style.paint[prop] = 0);
            
        }
        map.addLayer(style);
    } else if (!invisible){
        getOpacityProps(style).forEach(prop =>
            map.setPaintProperty(dataset.mapbox.id, prop, def(dataset.opacity,0.9)));
    }
    dataset._layerId = dataset.mapbox.id;

    //if (!invisible) 
        // surely this is an error - mapbox datasets don't have 'dataId'
        //showCaption(dataset.name, dataset.dataId, dataset.caption);
}

function preloadDataset(map, d) {
    console.log('Preload: ' + d.caption);
    if (d.mapbox) {

        showMapboxDataset(map, d, true);
    } else if (d.dataset) {
        d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options,  true);
        d.mapvis.setVisColumn(d.column);
        d._layerId = d.mapvis.layerId;
    }
}
// Turn invisible dataset into visible
function revealDataset(map, d) {
    console.log('Reveal: ' + d.caption  + ` (${_datasetNo})`);
    // TODO change 0.9 to something specific for each type
    if (d.mapbox || d.dataset) {
        getOpacityProps(map.getLayer(d._layerId)).forEach(prop =>
            map.setPaintProperty(d._layerId, prop, def(d.opacity, 0.9)));
    } else if (d.paint) {
        d._oldPaint = [];
        d.paint.forEach(paint => {
            d._oldPaint.push([paint[0], paint[1], map.getPaintProperty(paint[0], paint[1])]);
            map.setPaintProperty(paint[0], paint[1], paint[2]);
        });
    }
    if (d.dataset) {
        showCaption(d.dataset.name, d.dataset.dataId, d.caption);
    } else  if (d.caption) {
        showCaption(d.name, undefined, d.caption);
    }
    if (d.superCaption)
        document.querySelector('#caption').classList.add('supercaption');
}
// Remove the dataset from the map, like it was never loaded.
function removeDataset(map, d) {
    console.log('Remove: ' + d.caption  + ` (${_datasetNo})`);
    if (d.mapvis)
        d.mapvis.remove();
    
    if (d.mapbox)
        map.removeLayer(d.mapbox.id);

    if (d.paint && !d.keepPaint) // restore paint settings before they were messed up
        d._oldPaint.forEach(paint => {
            map.setPaintProperty(paint[0], paint[1], paint[2]);
        });

    if (d.superCaption)
        document.querySelector('#caption').classList.remove('supercaption');

    d._layerId = undefined;
}



let _datasetNo='';
/* Advance and display the next dataset in our loop 
Each dataset is pre-loaded by being "shown" invisible (opacity 0), then "revealed" at the right time.

    // TODO clean this up so relationship between "now" and "next" is clearer, no repetition.

*/
function nextDataset(map, datasetNo, removeFirst) {
    // Invisibly load dataset into the map.
    function delay(f, ms) {
        window.setTimeout(() => !window.stopped && f(), ms);
    }

    _datasetNo = datasetNo;
    let d = datasets[datasetNo], 
        nextD = datasets[(datasetNo + 1) % datasets.length];

    if (removeFirst)
        removeDataset(map, datasets[(datasetNo - 1 + datasets.length) % datasets.length]);

    // if for some reason this dataset hasn't already been loaded.
    if (!d._layerId) {
        preloadDataset(map, d);
    }
    if (d._layerId && !map.getLayer(d._layerId))
        throw 'Help: Layer not loaded: ' + d._layerId;
    revealDataset(map, d);
        

    // load, but don't show, next one. // Comment out the next line to not do the pre-loading thing.
    // we want to skip "datasets" that are just captions etc.
    let nextRealDatasetNo = (datasetNo + 1) % datasets.length;
    while (datasets[nextRealDatasetNo] && !datasets[nextRealDatasetNo].dataset && !datasets[nextRealDatasetNo].mapbox && nextRealDatasetNo < datasets.length)
        nextRealDatasetNo ++;
    if (datasets[nextRealDatasetNo])
        preloadDataset(map, datasets[nextRealDatasetNo]);

    if (d.showLegend) {
        document.querySelector('#legends').style.display = 'block';
    } else {
        document.querySelector('#legends').style.display = 'none';
    }

    // We're aiming to arrive at the viewpoint 1/3 of the way through the dataset's appearance
    // and leave 2/3 of the way through.
    if (d.flyTo && !map.isMoving()) {
        d.flyTo.duration = d.delay/3;// so it lands about a third of the way through the dataset's visibility.
        map.flyTo(d.flyTo, { source: 'nextDataset'});
    }
    
    if (nextD.flyTo) {
        // got to be careful if the data overrides this,
        nextD.flyTo.duration = def(nextD.flyTo.duration, d.delay/3 + nextD.delay/3);// so it lands about a third of the way through the dataset's visibility.
        delay(() => map.flyTo(nextD.flyTo, { source: 'nextDataset'}), d.delay * 2/3);
    }

    delay(() => removeDataset(map, d), d.delay + def(d.linger, 0)); // optional "linger" time allows overlap. Not generally needed since we implemented preloading.
    
    delay(() => nextDataset(map, (datasetNo + 1) % datasets.length), d.delay );
}

function listenForKeystrokes(map, options) {
    document.querySelector('body').addEventListener('keydown', e=> {
        //console.log(e.keyCode);
        // , and . stop the animation and advance forward/back
        if ([190, 188].indexOf(e.keyCode) > -1 && options.demoMode) {
            map.stop();
            window.stopped = true;
            removeDataset(map, datasets[_datasetNo]);
            nextDataset(map, (_datasetNo + {190: 1, 188: -1}[e.keyCode] + datasets.length) % datasets.length);
        } else if (e.keyCode === 32 && options.demoMode) {
            // Space = start/stop
            window.stopped = !window.stopped;
            if (window.stopped)
                map.stop();
            else {
                removeDataset(map, datasets[_datasetNo]);
                nextDataset(map, _datasetNo);
            }
        }
    });
}

function setupMap(options) {
    let map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/dark-v9',
        style: 'mapbox://styles/cityofmelbourne/ciz983lqo001w2ss2eou49eos?fresh=5',
        center: [144.95, -37.813],
        zoom: 13,//13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl({compact:true}), 'top-right');
    //map.once('load', () => tweakBasemap(map));
    //map.once('load',() => tweakPlaceLabels(map,true));
    //setTimeout(()=>tweakPlaceLabels(map, false), 8000);
    
    map.on('moveend', (e,data)=> {
        if (e.source === 'nextDataset')
            return;
        // When we manually position the map, dump the location to console - makes it easy to create tours.
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });
    map.on('error', e => {
        // Hide those annoying non-error errors
        if (e && e.error !== 'Error: Not Found')
            console.error(e);
    });
    listenForKeystrokes(map, options);
    if (options.spin)
        spin(map);
    return map;
}

/* Pre download all non-mapbox datasets in the loop */
// also get rid of the sidebar. :)
function loadDatasets(map) {
    // if we did this after the map was loading, call map.resize();
    document.querySelector('#features').style.display = 'none';        
    document.querySelector('#legends').style.display = 'none';
    // For people who want the "script".        
    window.captions = datasets.map(d => `${d.caption} (${d.delay / 1000}s)`).join('\n');


    return Promise
        .all(datasets.map(d => { 
            if (d.dataset) {
                console.log('Loading dataset ' + d.dataset.dataId);
                return d.dataset.load();
            } else
                return Promise.resolve();
        })).then(() => datasets[0].dataset);
}

function loadOneDataset(dataset) {
    return new SourceData(dataset).load();
    /*if (dataset.match(/....-..../))
        
    else
        return Promise.resolve(true);*/
}

/*

URL structures:

/                   pick a random dataset
/#demo              non-interactive mode, run a whole showcase
/#abcd-1234         load a particular socrata ID
/#snthosuntaheoeut  load a Mapbox tileset ID
/#....&logo
/#....&spin


*/
// list tilesets: sk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXp4cWp4bXgwMXpqMzJxcXc5emFhYjF5In0.1inqcZNJu-Z4PQlUTQ-GRw
// https://api.mapbox.com/tilesets/v1/stevage?access_token=sk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXp4cWp4bXgwMXpqMzJxcXc5emFhYjF5In0.1inqcZNJu-Z4PQlUTQ-GRw
function parseUrl() {
    let options = {};
    let hash = window.location.hash;
    if (hash === '#demo') {
        options.demoMode = true;
    } else if (hash) {
        // ### replace with more selective RE
        options.dataset = def(hash.match(/#([a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})/), [])[1];
        options.spin = /&spin/.test(hash);
        options.mapboxId = def(hash.match(/(mapbox:\/\/[a-zA-Z0-9]+\.[a-zA-Z0-9]+), [])[1];
        if (options.mapboxId) {
            options.mapboxDataset = {
                id: 'mapbox-points',
                type: 'circle',
                source: options.mapbox

            }
        }
    }
    return options;
}

(function start() {
    try { document.documentElement.requestFullscreen(); } catch (e) { } // probably does nothing.

    let p, options = parseUrl();
    if (options.demoMode) {
        p = loadDatasets(map);
    } else {
        if (!options.dataset)
            options.dataset = chooseDataset();
        p = loadOneDataset(options.dataset);
    }
    let map = setupMap(options);
    p.then(dataset => {
        window.scrollTo(0,1); // does this hide the address bar? Nope    
        if (dataset) 
            showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, () => {

            if (options.demoMode) {
                // start the cycle of datasets (0 = first dataset)
                nextDataset(map, 0); 
                //var fp = new FlightPath(map);
            } else {
                showDataset(map, dataset); // just show one dataset.
            }
            document.querySelector('#loading').outerHTML='';
        });
        

    });
})();

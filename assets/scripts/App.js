(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _sourceData = require('./sourceData');

var _flightPath = require('./flightPath');

var _cycleDatasets = require('./cycleDatasets');

var _mapVis = require('./mapVis');

/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
console.log(_cycleDatasets.datasets);
//mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
mapboxgl.accessToken = 'pk.eyJ1IjoiY2l0eW9mbWVsYm91cm5lIiwiYSI6ImNpejdob2J0czAwOWQzM21ubGt6MDVqaHoifQ.55YbqeTHWMK_b6CEAmoUlA';
/*
Pedestrian sensor locations: ygaw-6rzq

**Trees: http://localhost:3002/#fp38-wiyy

Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

var def = function def(a, b) {
    return a !== undefined ? a : b;
};

var whenMapLoaded = function whenMapLoaded(map, f) {
    return map.loaded() ? f() : map.once('load', f);
};

var clone = function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
};

var opacityProp = {
    fill: 'fill-opacity',
    circle: 'circle-opacity',
    symbol: 'icon-opacity',
    'line': 'line-opacity',
    'fill-extrusion': 'fill-extrusion-opacity'
};

// returns a value like 'circle-opacity', for a given layer style.
function getOpacityProps(layer) {
    var ret = [opacityProp[layer.type]];
    if (layer.layout && layer.layout['text-field']) ret.push('text-opacity');

    return ret;
}

//false && whenMapLoaded(() =>
//  setVisColumn(sourceData.numericColumns[Math.floor(Math.random() * sourceData.numericColumns.length)]));

// TODO decide if this should be in MapVis
function showFeatureTable(feature, sourceData, mapvis) {
    function rowsInArray(array, classStr) {
        return '<table>' + Object.keys(feature).filter(function (key) {
            return array === undefined || array.indexOf(key) >= 0;
        }).map(function (key) {
            return '<tr><td ' + classStr + '>' + key + '</td><td>' + feature[key] + '</td></tr>';
        }).join('\n') + '</table>';
    }

    if (feature === undefined) {
        // Called before the user has selected anything
        feature = {};
        sourceData.textColumns.forEach(function (c) {
            return feature[c] = '';
        });
        sourceData.numericColumns.forEach(function (c) {
            return feature[c] = '';
        });
        sourceData.boringColumns.forEach(function (c) {
            return feature[c] = '';
        });
    } else if (sourceData.shape === 'polygon') {
        // TODO check that this is a block lookup choropleth
        feature = sourceData.getRowForBlock(feature.block_id, feature.census_yr);
    }

    document.getElementById('features').innerHTML = '<h4>Click a field to visualise with colour</h4>' + rowsInArray(sourceData.textColumns, 'class="enum-field"') + '<h4>Click a field to visualise with size</h4>' + rowsInArray(sourceData.numericColumns, 'class="numeric-field"') + '<h4>Other fields</h4>' + rowsInArray(sourceData.boringColumns, '');

    document.querySelectorAll('#features td').forEach(function (td) {
        return td.addEventListener('click', function (e) {
            mapvis.setVisColumn(e.target.innerText); // TODO highlight the selected row
        });
    });
}

var lastFeature;

function chooseDataset() {
    if (window.location.hash) {
        return window.location.hash.replace('#', '');
    }

    // known CLUE block datasets that work ok
    var clueChoices = ['b36j-kiy4', // employment
    '234q-gg83', // floor space by use by block
    'c3gt-hrz6' // business establishments -- this one is complete, the others have gappy data for confidentiality
    ];

    // known point datasets that work ok
    var pointChoices = ['fp38-wiyy', // trees
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
    '6u5z-ubvh'];

    document.querySelector('#caption h1').innerHTML = 'Loading random dataset...';
    return pointChoices[Math.round(Math.random() * pointChoices.length)];
    //return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    var includeNo = false;
    document.querySelector('#caption h1').innerHTML = (includeNo ? _datasetNo || '' : '') + (caption || name || '');
    document.querySelector('#footer .dataset').innerHTML = name || '';

    // TODO reinstate for non-demo mode.
    //document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    //document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
}

function tweakPlaceLabels(map, up) {
    ['place-suburb', 'place-neighbourhood'].forEach(function (layerId) {

        //rgb(227, 4, 80); CoM pop magenta
        //map.setPaintProperty(layerId, 'text-color', up ? 'rgb(227,4,80)' : 'hsl(0,0,30%)'); // CoM pop magenta
        map.setPaintProperty(layerId, 'text-color', up ? 'rgb(0,183,79)' : 'hsl(0,0,30%)'); // CoM pop green
    });
}

function tweakBasemap(map) {
    var placecolor = '#888'; //'rgb(206, 219, 175)';
    var roadcolor = '#777'; //'rgb(240, 191, 156)';
    map.getStyle().layers.forEach(function (layer) {
        if (layer.paint['text-color'] === 'hsl(0, 0%, 60%)') map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 20%)');else if (layer.paint['text-color'] === 'hsl(0, 0%, 70%)') map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');else if (layer.paint['text-color'] === 'hsl(0, 0%, 78%)') map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 45%)'); // roads mostly
        else if (layer.paint['text-color'] === 'hsl(0, 0%, 90%)') map.setPaintProperty(layer.id, 'text-color', 'hsl(0, 0%, 50%)');
    });
    ['poi-parks-scalerank1', 'poi-parks-scalerank1', 'poi-parks-scalerank1'].forEach(function (id) {
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

    var mapvis = new _mapVis.MapVis(map, dataset, filter, !noFeatureInfo ? showFeatureTable : null, options);

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
    var style = map.getLayer(dataset.mapbox.id);
    if (!style) {
        //if (invisible)
        //dataset.mapbox
        style = clone(dataset.mapbox);
        if (invisible) {
            getOpacityProps(style).forEach(function (prop) {
                return style.paint[prop] = 0;
            });
        }
        map.addLayer(style);
    } else if (!invisible) {
        getOpacityProps(style).forEach(function (prop) {
            return map.setPaintProperty(dataset.mapbox.id, prop, def(dataset.opacity, 0.9));
        });
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
        d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options, true);
        d.mapvis.setVisColumn(d.column);
        d._layerId = d.mapvis.layerId;
    }
}
// Turn invisible dataset into visible
function revealDataset(map, d) {
    console.log('Reveal: ' + d.caption + (' (' + _datasetNo + ')'));
    // TODO change 0.9 to something specific for each type
    if (d.mapbox || d.dataset) {
        getOpacityProps(map.getLayer(d._layerId)).forEach(function (prop) {
            return map.setPaintProperty(d._layerId, prop, def(d.opacity, 0.9));
        });
    } else if (d.paint) {
        d._oldPaint = [];
        d.paint.forEach(function (paint) {
            d._oldPaint.push([paint[0], paint[1], map.getPaintProperty(paint[0], paint[1])]);
            map.setPaintProperty(paint[0], paint[1], paint[2]);
        });
    }
    if (d.caption) {
        showCaption(d.name, undefined, d.caption);
    } else if (d.dataset) {
        showCaption(d.dataset.name, d.dataset.dataId, d.caption);
    }

    if (d.superCaption) document.querySelector('#caption').classList.add('supercaption');
}
// Remove the dataset from the map, like it was never loaded.
function removeDataset(map, d) {
    console.log('Remove: ' + d.caption + (' (' + _datasetNo + ')'));
    if (d.mapvis) d.mapvis.remove();

    if (d.mapbox) map.removeLayer(d.mapbox.id);

    if (d.paint && !d.keepPaint) // restore paint settings before they were messed up
        d._oldPaint.forEach(function (paint) {
            map.setPaintProperty(paint[0], paint[1], paint[2]);
        });

    if (d.superCaption) document.querySelector('#caption').classList.remove('supercaption');

    d._layerId = undefined;
}

var _datasetNo = '';
/* Advance and display the next dataset in our loop 
Each dataset is pre-loaded by being "shown" invisible (opacity 0), then "revealed" at the right time.

    // TODO clean this up so relationship between "now" and "next" is clearer, no repetition.

*/
function nextDataset(map, datasetNo, removeFirst) {
    // Invisibly load dataset into the map.
    function delay(f, ms) {
        window.setTimeout(function () {
            return !window.stopped && f();
        }, ms);
    }

    _datasetNo = datasetNo;
    var d = _cycleDatasets.datasets[datasetNo],
        nextD = _cycleDatasets.datasets[(datasetNo + 1) % _cycleDatasets.datasets.length];

    if (removeFirst) removeDataset(map, _cycleDatasets.datasets[(datasetNo - 1 + _cycleDatasets.datasets.length) % _cycleDatasets.datasets.length]);

    // if for some reason this dataset hasn't already been loaded.
    if (!d._layerId) {
        preloadDataset(map, d);
    }
    if (d._layerId && !map.getLayer(d._layerId)) throw 'Help: Layer not loaded: ' + d._layerId;
    revealDataset(map, d);

    // load, but don't show, next one. // Comment out the next line to not do the pre-loading thing.
    // we want to skip "datasets" that are just captions etc.
    var nextRealDatasetNo = (datasetNo + 1) % _cycleDatasets.datasets.length;
    while (_cycleDatasets.datasets[nextRealDatasetNo] && !_cycleDatasets.datasets[nextRealDatasetNo].dataset && !_cycleDatasets.datasets[nextRealDatasetNo].mapbox && nextRealDatasetNo < _cycleDatasets.datasets.length) {
        nextRealDatasetNo++;
    }if (_cycleDatasets.datasets[nextRealDatasetNo]) preloadDataset(map, _cycleDatasets.datasets[nextRealDatasetNo]);

    if (d.showLegend) {
        document.querySelector('#legends').style.display = 'block';
    } else {
        document.querySelector('#legends').style.display = 'none';
    }

    // We're aiming to arrive at the viewpoint 1/3 of the way through the dataset's appearance
    // and leave 2/3 of the way through.
    if (d.flyTo && !map.isMoving()) {
        d.flyTo.duration = d.delay / 3; // so it lands about a third of the way through the dataset's visibility.
        map.flyTo(d.flyTo, { source: 'nextDataset' });
    }

    if (nextD.flyTo) {
        // got to be careful if the data overrides this,
        nextD.flyTo.duration = def(nextD.flyTo.duration, d.delay / 3 + nextD.delay / 3); // so it lands about a third of the way through the dataset's visibility.
        delay(function () {
            return map.flyTo(nextD.flyTo, { source: 'nextDataset' });
        }, d.delay * 2 / 3);
    }

    delay(function () {
        return removeDataset(map, d);
    }, d.delay + def(d.linger, 0)); // optional "linger" time allows overlap. Not generally needed since we implemented preloading.

    delay(function () {
        return nextDataset(map, (datasetNo + 1) % _cycleDatasets.datasets.length);
    }, d.delay);
}

/* Pre download all non-mapbox datasets in the loop */
function loadDatasets(map) {
    return Promise.all(_cycleDatasets.datasets.map(function (d) {
        if (d.dataset) {
            console.log('Loading dataset ' + d.dataset.dataId);
            return d.dataset.load();
        } else return Promise.resolve();
    })).then(function () {
        return _cycleDatasets.datasets[0].dataset;
    });
}

function loadOneDataset() {
    var dataset = chooseDataset();
    return new _sourceData.SourceData(dataset).load();
    /*if (dataset.match(/....-..../))
        
    else
        return Promise.resolve(true);*/
}

(function start() {

    try {
        document.documentElement.requestFullscreen();
    } catch (e) {}

    var demoMode = window.location.hash === '#demo';
    if (demoMode) {
        // if we did this after the map was loading, call map.resize();
        document.querySelector('#features').style.display = 'none';
        document.querySelector('#legends').style.display = 'none';
        // For people who want the script.        
        window.captions = _cycleDatasets.datasets.map(function (d) {
            return d.caption + ' (' + d.delay / 1000 + 's)';
        }).join('\n');
    }

    var map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/dark-v9',
        style: 'mapbox://styles/cityofmelbourne/ciz983lqo001w2ss2eou49eos?fresh=5',
        center: [144.95, -37.813],
        zoom: 13, //13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), 'top-right');
    //map.once('load', () => tweakBasemap(map));
    //map.once('load',() => tweakPlaceLabels(map,true));
    //setTimeout(()=>tweakPlaceLabels(map, false), 8000);
    map.on('moveend', function (e, data) {
        if (e.source === 'nextDataset') return;

        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });
    /*map.on('error', e => {
        console.error(e);
    });*/
    document.querySelector('body').addEventListener('keydown', function (e) {
        //console.log(e.keyCode);
        // , and . stop the animation and advance forward/back
        if ([190, 188].indexOf(e.keyCode) > -1 && demoMode) {
            map.stop();
            window.stopped = true;
            removeDataset(map, _cycleDatasets.datasets[_datasetNo]);
            nextDataset(map, (_datasetNo + { 190: 1, 188: -1 }[e.keyCode] + _cycleDatasets.datasets.length) % _cycleDatasets.datasets.length);
        } else if (e.keyCode === 32 && demoMode) {
            // Space = start/stop
            window.stopped = !window.stopped;
            if (window.stopped) map.stop();else {
                removeDataset(map, _cycleDatasets.datasets[_datasetNo]);
                nextDataset(map, _datasetNo);
            }
        }
    });

    (demoMode ? loadDatasets(map) : loadOneDataset()).then(function (dataset) {
        window.scrollTo(0, 1); // does this hide the address bar? Nope    
        if (dataset) showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, function () {

            if (demoMode) {
                nextDataset(map, 28); // which dataset to start at. (0 for prod)
                //var fp = new FlightPath(map);
            } else {
                showDataset(map, dataset);
            }
            document.querySelector('#loading').outerHTML = '';
        });
    });
})();

},{"./cycleDatasets":2,"./flightPath":3,"./mapVis":5,"./sourceData":12}],2:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.datasets2 = exports.datasets = undefined;

var _sourceData = require('./sourceData');

/* jshint esnext:true */

/*
Suggestions:

This is Melbourne
Here are our precincts
As you'd guess, we have a lot of data:
- addresses, boundaries


1. Orient with precincts

2. But we also have: 
- wedding
- bin nights
- dogs last 
- toilets
-- all
-- wheelchairs with icons

*/

/*
Intro
- Overview (suburb names highlighted)
- Property boundaries
- Street addresses

Urban forest:
- elms
- gums
- planes
- all

CLUE
- employment
- transport sector
- social/health sector

DAM
- applications
- construction
- completed

Did you know:
- community food
- Garbage Collection Zones
- Bookable Event Venues
-- weddingable
-- all
- Toilets
-- all 
-- accessible
- Cafes and Restaurants
- Dog walking zones

Finale:
- Skyline
- What can you do with our open data?


Garbage Collection Zones
Dog Walking Zones off-leash
Bike Share Stations
Bookable Event Venues
- weddingable


Grand finale "What can you do with our open data"?
- buildings
- cafes
- 



These need a home:
- bike share stations
- pedestrian sensors
- addresses
- property boundaries
- buildings
- cafes
- community food



*/

/*

Dataset run order
- buildings (3D)
- trees (from my opentrees account)
- cafes (city of melbourne, styled with coffee symbol)
- bars (similar)
- garbage collection zones
- dog walking zones
- CLUE (3D blocks)
-- business establishments per block
--- various types, then total
-- employment (various types with specific vantage points - beware that not all data included; then total)
-- floor use (ditto)




Minimum
- floaty cameras
- clue 3D,
- bike share stations

Header:
- dataset name
- column name

Footer: data.melbourne.vic.gov.au

CoM logo


Medium
- Municipality boundary overlaid

Stretch goals
- overlay a text label on a building/clueblock (eg, Freemasons Hospital - to show why so much healthcare)





*/

var CoM = {
    blue: 'rgb(0,174,203)',
    magenta: 'rgb(227, 4, 80)',
    green: 'rgb(0,183,79)'
};
CoM.enumColors = [CoM.blue, CoM.magenta, CoM.green];

var datasets = exports.datasets = [{
    delay: 5000,
    caption: 'Melbourne has a lot of data.',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 8000,
    caption: 'This is Melbourne',
    paint: [['place-suburb', 'text-color', 'rgb(0,183,79)'], ['place-neighbourhood', 'text-color', 'rgb(0,183,79)']],
    name: '',
    flyTo: { center: { lng: 144.95, lat: -37.813 }, zoom: 13, pitch: 45, bearing: 0 }

}, {
    delay: 1000,
    name: 'Property boundaries',
    caption: 'We have data like property boundaries for planning',
    opacity: 1,
    mapbox: {
        id: 'boundaries-1',
        type: 'line',
        source: 'mapbox://cityofmelbourne.799drouh',
        'source-layer': 'Property_boundaries-061k0x',
        paint: {

            'line-color': 'rgb(0,183,79)',
            'line-width': {
                stops: [[13, 0.5], [16, 2]]
            }

        }
    },
    linger: 1000, // just to avoid flash
    flyTo: { "center": { lng: 144.953086, lat: -37.807509 }, zoom: 14, bearing: 0, pitch: 0, duration: 10000 }
},
// repeat - just to force the timing
{
    delay: 10000,
    linger: 3000,
    name: 'Property boundaries',
    caption: 'We have data like property boundaries for planning',
    opacity: 1,
    mapbox: {
        id: 'boundaries-2',
        type: 'line',
        source: 'mapbox://cityofmelbourne.799drouh',
        'source-layer': 'Property_boundaries-061k0x',
        paint: {

            'line-color': 'rgb(0,183,79)',
            'line-width': {
                stops: [[13, 0.5], [16, 2]]
            }

        }
    }
}, {
    delay: 14000,
    name: 'Street addresses',
    caption: 'As you\'d guess, we have data like every street address',
    // need to zoom in close on this one
    mapbox: {
        id: 'addresses',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.3ip3couo',
        'source-layer': 'Street_addresses-97e5on',
        paint: {

            'text-color': 'rgb(0,183,79)'

        },
        layout: {
            'text-field': '{street_no}',
            'text-allow-overlap': true,
            'text-size': 10
        }
    },
    // near uni-ish
    flyTo: { "center": { "lng": 144.97001736426068, "lat": -37.79770798860123 }, "zoom": 18, "bearing": -45.70203040506084, "pitch": 48, duration: 14000 }
    // roundabout of death lookng nw
    //flyTo: {"center":{"lng":144.95910487061184,"lat":-37.80061088971732},"zoom":18.572204782819195,"bearing":-20.435636691643822,"pitch":57.99999999999999}
},

/*{
    delay: 10000,
    caption: 'The health and type of each tree in our urban forest',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',            
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 2,
            'circle-color': 'hsl(146, 50%, 36%)',
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-opacity': 0.6
        },
        filter: [ 'in', 'Genus', 'Ulmus' ]
     },
    flyTo: {"center":{"lng":144.95767415418266,"lat":-37.791686619772975},"zoom":15.487337457356691,"bearing":-122.40000000000009,"pitch":60}
    //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
},*/
{
    delay: 5000,
    caption: 'Urban Forest',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 10000,
    caption: 'The Urban Forest contains every elm tree...',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            'circle-color': 'hsl(30, 80%, 56%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Ulmus']

    },
    flyTo: { "center": { "lng": 144.963138, "lat": -37.788843 }, "zoom": 15.2, "bearing": -106.14, "pitch": 55 }

}, {
    delay: 5000,
    caption: '...every gum tree...', // add a number
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'gumtrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            'circle-color': 'hsl(146, 100%, 36%)',
            //'circle-color': 'hsl(146, 50%, 36%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Eucalyptus', 'Corymbia', 'Angophora']

    },
    //flyTo: {"center":{"lng":144.8473748868907,"lat":-37.811779740787244},"zoom":13.162524150847315,"bearing":0,"pitch":45}
    flyTo: { "center": { "lng": 144.94318163755105, "lat": -37.78351953419449 }, "zoom": 15.773488574721082, "bearing": 200, "pitch": 59.99589825769096 }
    //flyTo: {"center":{"lng":144.9427325673331,"lat":-37.78444940593038},"zoom":14.5,"bearing":-163.3102224426674,"pitch":35.500000000000014}
}, {
    delay: 8000,
    //datasetLead: 3000,
    caption: '...and every plane tree.', // add a number
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'planetrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-color': 'hsl(340, 97%,65%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Platanus']

    },
    flyTo: { "center": { "lng": 144.94394633838965, "lat": -37.79588870668271 }, "zoom": 15.905130361446668, "bearing": 157.5999999999974, "pitch": 60 }
    //flyTo: {"center":{"lng":144.92672531478553,"lat":-37.804385949276394},"zoom":15,"bearing":119.78868682882374,"pitch":60}

    //flyTo: {"center":{"lng":144.91478510016202,"lat":-37.78434147167477},"zoom":13.922228461793669,"bearing":122.9947834604346,"pitch":47.50000000000003}
    //flyTo: {"center":{"lng":144.9534345075516,"lat":-37.80134118012522},"zoom":15,"bearing":151.00073048827338,"pitch":58.99999999999999}
    //flyTo: {"center":{"lng":144.9561388488409,"lat":-37.80902710531632},"zoom":14.241757030816636,"bearing":-163.3102224426674,"pitch":35.500000000000014}
}, {
    delay: 10000,
    caption: 'Nearly 70,000 trees in all.',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 2,
            'circle-color': 'hsl(146, 50%, 36%)',
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-opacity': 0.9
        }

    },
    flyTo: { "center": { "lng": 144.94191157000034, "lat": -37.80036709214022 }, "zoom": 14.1, "bearing": 144.92728392742694, "pitch": 60 }
    //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
}, {
    delay: 5000,
    caption: 'Census of Land Use and Employment (CLUE)',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('b36j-kiy4'),
    column: 'Total employment in block',
    caption: 'CLUE reveals where employment is concentrated',
    flyTo: { "center": { "lng": 144.9267253147857, "lat": -37.804385949276494 }, "zoom": 13.88628732015981, "bearing": 119.78868682882374, "pitch": 60 }
    //flyTo: {"center":{"lng":144.9598533456214,"lat":-37.83581916243661},"zoom":13.649116614872836,"bearing":0,"pitch":45}
},

/*{
    delay:12000,
    caption: 'Where the Council\'s significant property holdings are located.',
    dataset: new SourceData('fthi-zajy'),
    column: 'Ownership or Control',
    showLegend: true,
    flyTo: {"center":{"lng":144.96390308723846,"lat":-37.818631660810425},"zoom":13.5,"bearing":0,"pitch":45}
 },
*/

{
    delay: 10000,
    dataset: new _sourceData.SourceData('c3gt-hrz6'),
    column: 'Transport, Postal and Storage',
    caption: '...where the transport, postal and storage sector is located.',
    flyTo: { "center": { "lng": 144.92768176710712, "lat": -37.829218248587246 }, "zoom": 12.728431217914919, "bearing": 68.70388312187458, "pitch": 60 }
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('c3gt-hrz6'),
    column: 'Health Care and Social Assistance',
    caption: 'and where the healthcare and social assistance organisations are based.',
    flyTo: { "center": { "lng": 144.9572331121853, "lat": -37.82706374763824 }, "zoom": 13.063757386232242, "bearing": 26.37478691852334, "pitch": 60 }
}, {
    delay: 5000,
    caption: 'Development Activity Monitor (DAM)',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 7000,
    linger: 9000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    options: { enumColors: CoM.enumColors },
    filter: ['==', 'status', 'APPLIED'],
    caption: 'DAM tracks major projects in the planning stage...',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 4000,
    linger: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    options: { enumColors: CoM.enumColors },
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: '...projects under construction',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    options: { enumColors: CoM.enumColors },
    column: 'status',
    filter: ['==', 'status', 'COMPLETED'],
    caption: '...and those already completed.',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

},
//*********************  "But did you know" data
{
    delay: 10000,
    caption: 'But did you know we have data about healthy, affordable food services?',
    name: 'Community food services with opening hours, public transport and parking options',
    mapbox: {
        id: 'food',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.7xvk0k3l',
        'source-layer': 'Community_food_services_with_-a7cj9v',
        paint: {
            'text-color': 'hsl(30, 80%, 56%)' // bright orange
            //'text-color': 'rgb(249, 243, 178)', // muted orange, a city for people
        },
        layout: {
            'text-field': '{Name}',
            'text-size': 12

        }
    },
    //south Melbourne ish
    flyTo: { "center": { "lng": 144.96844507663542, "lat": -37.82459949103244 }, "zoom": 14.016979864482233, "bearing": -11.578336166142888, "pitch": 60 }
    //flyTo: {"center":{"lng":144.97473730944466,"lat":-37.8049071559513},"zoom":15.348676099922852,"bearing":-154.4971333289701,"pitch":60}
    //flyTo: {"center":{"lng":144.98492251438307,"lat":-37.80310972727281},"zoom":15.358509789790808,"bearing":-78.3999999999997,"pitch":58.500000000000014}
}, {
    delay: 1,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night?',
    mapbox: {
        id: 'garbage-1',
        type: 'line',
        source: 'mapbox://cityofmelbourne.8arqwmhr',
        'source-layer': 'Garbage_collection_zones-9nytsk',
        paint: {

            'line-color': 'hsl(23, 94%, 64%)',
            'line-width': {
                stops: [[13, 6], [16, 10]]
            }

        }
    },
    linger: 10000,
    // Fawkner Parkish
    flyTo: { center: { lng: 144.965437, lat: -37.814225 }, zoom: 13.7, bearing: -30.8, pitch: 60 }
    // birds eye, zoomed out
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:13,bearing:0,pitch:0},
}, {
    delay: 10000,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night',
    mapbox: {
        id: 'garbage-2',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.8arqwmhr',
        'source-layer': 'Garbage_collection_zones-9nytsk',
        paint: {

            'text-color': 'hsl(23, 94%, 64%)'
        },
        layout: {
            'text-field': '{rub_day}',
            'text-size': {
                stops: [[13, 18], [16, 20]]
            }
        }
    }
    // birds eye
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
}, {
    name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
    caption: 'How many "Blue Bikes" are ready in each station.',
    column: 'NBBikes',
    delay: 20000,
    dataset: new _sourceData.SourceData('tdvh-n9dv'),
    options: {
        symbol: {
            layout: {
                'icon-image': 'bicycle-share-15',
                'icon-allow-overlap': true,
                'icon-size': 2,
                'text-field': '{NBBikes}',
                //'text-allow-overlap': true,
                'text-offset': [1.5, 0],
                'text-size': 20
                // for some reason it gets silently rejected with this:
                /*'icon-size': {
                    property: 'NBBikes',
                     "stops": [
                      [0, 0.5],
                      [30, 3]
                     ]
                }*/
            },
            paint: {
                'text-color': 'hsl(239,71%,66%)' // match the blue bike icons
                //'text-color': 'rgb(0,174,203)' // CoM pop blue
            }
        }
    },

    flyTo: { "center": { "lng": 144.97768414562887, "lat": -37.81998948372839 }, "zoom": 14.670221676238507, "bearing": -57.93230251736117, "pitch": 60 }
}, // bike share
{
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...',
    filter: ['==', 'WEDDING', 'Y'],
    column: 'WEDDING',
    delay: 4000,
    opacity: 0.8,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -67.19999999999999, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...or something else.',
    column: 'WEDDING',
    delay: 6000,
    opacity: 0.8,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -80, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...',
    delay: 5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    options: {
        symbol: {
            layout: {
                'icon-image': 'toilet-15',
                'icon-allow-overlap': true
            }
        }
    }
}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...that are accessible for wheelchair users',
    filter: ['==', 'wheelchair', 'yes'],
    delay: 1,
    linger: 5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    options: {
        symbol: {
            layout: {
                'icon-image': 'wheelchair-15',
                'icon-allow-overlap': true
            }
        }
    }

}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...that are accessible for wheelchair users',
    delay: 5000,
    //linger:5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    filter: ['!=', 'wheelchair', 'yes'],
    options: {
        symbol: {
            layout: {
                'icon-image': 'toilet-15',
                'icon-allow-overlap': true
            }
        }
    }

}, {
    delay: 10000,

    caption: 'Our data tells you where your dog doesn\'t need a leash',
    name: 'Dog Walking Zones',
    mapbox: {
        id: '2',
        type: 'fill',
        source: 'mapbox://cityofmelbourne.clzap2je',
        'source-layer': 'Dog_Walking_Zones-3fh9q4',
        paint: {
            'fill-color': 'hsl(340, 97%,65%)', //hsl(340, 97%, 45%)
            'fill-opacity': 0.8
        },
        filter: ['==', 'status', 'offleash']
    },
    flyTo: { "center": { "lng": 144.95746092528066, "lat": -37.79450697427422 }, "zoom": 14.955544903145544, "bearing": -44.84132745183728, "pitch": 60 }
    //flyTo: {"center":{"lng":144.96472084161525,"lat":-37.79947747257584},"zoom":14.933931528036048,"bearing":-57.64132745183708,"pitch":60}
    //flyTo:{"center":{"lng":144.98613987732932,"lat":-37.83888266596187},"zoom":15.096419579432878,"bearing":-30,"pitch":57.49999999999999}
}, {
    delay: 10000,
    caption: 'There\'s even every cafe and restaurant',

    dataset: new _sourceData.SourceData('sfrg-zygb'),
    // CBD looking towards Carlton
    flyTo: { "center": { "lng": 144.96420099897045, "lat": -37.8040762916216 }, "zoom": 15.695662136339653, "bearing": -22.56971876500631, "pitch": 60 },
    //flyTo: {"center":{"lng":144.97027688989027,"lat":-37.81107254397835},"zoom":14.8,"bearing":-89.74253780407638,"pitch":60},
    //flyTo:{"center":{"lng":144.97098789992964,"lat":-37.81021310404749},"zoom":16.02773233201699,"bearing":-135.21975308641981,"pitch":60},
    options: {
        symbol: {
            layout: {
                'icon-image': 'cafe-15',
                'icon-allow-overlap': true
            }
        }
    }
}, {
    delay: 2000,
    linger: 26000,
    caption: 'What will <b><i>you</i></b> do with our data?',
    name: 'Building outlines',
    opacity: 0.1,
    mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': {
                property: 'height',
                stops: [[0, 'hsl(146, 50%, 10%)'], [200, 'hsl(146, 100%, 60%)']]
            },
            //'hsl(146, 100%, 20%)',

            'fill-extrusion-height': {
                'property': 'height',
                type: 'identity'
            }
        }

    }
}, {
    delay: 2000,
    paint: [['buildings', 'fill-extrusion-opacity', 0.3]],
    keepPaint: true,
    flyTo: { center: { lng: 144.95, lat: -37.813 }, bearing: 0, zoom: 14, pitch: 45, duration: 20000 }
}, {
    delay: 2000,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.5]]
}, {
    delay: 2000,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.6]]
}, {
    delay: 20000,
    caption: 'What will <b><i>you</i></b> do with our data?',
    name: 'Building outlines',
    //opacity:0.6,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.7]],
    /*mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': 'hsl(146, 100%, 20%)',
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-height': {
                'property':'height',
                type: 'identity'
            }
        }
     },*/
    //matching starting position?
    flyTo: { center: { lng: 144.95, lat: -37.813 }, bearing: 0, zoom: 14, pitch: 45, duration: 20000 }
    // from abbotsfordish
    //flyTo:{"center":{"lng":144.9725135032764,"lat":-37.807415209051285},"zoom":14.896259153012243,"bearing":-106.40000000000015,"pitch":60}
    //from south
    //flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
}];
/*
const crappyFinale = [
    //////////////////////////////////
    // Ze grande finale
    {
        delay:1,
        dataset: new SourceData('sfrg-zygb'), // cafes
        options: {
            symbol: {
                layout: {
                    'icon-image': 'cafe-15',
                    'icon-allow-overlap': true,
                    'icon-size': 0.5
                }
            }
        },
        linger:20000
    },
    {
        delay: 1,
        mapbox: {
            id: 'alltrees',            
            type: 'circle',
            source: 'mapbox://cityofmelbourne.9trpnbu6',
            'source-layer': 'Trees__with_species_and_dimen-77b9mn',
            paint: {
                'circle-radius': 2,
                'circle-color': 'hsl(146, 50%, 36%)',
                //'circle-color': 'hsl(146, 100%, 36%)',
                'circle-opacity': 0.9
            },

        },
        linger:20000
    },   
    { 
        delay:11, linger:20000,
        mapbox: {
            id: 'boundaries',
            type: 'line',
            source: 'mapbox://cityofmelbourne.799drouh',
            'source-layer': 'Property_boundaries-061k0x',
            paint: {
                
                'line-color': 'rgb(0,183,79)',
                'line-width': {
                    stops: [
                        [13, 0.5],
                        [16, 2]
                    ]
                }

                
            },
        },
    },
    { // pedestrian sensors
        delay:1,linger:20000,
        dataset: new SourceData('ygaw-6rzq'),
        flyTo: {"center":{"lng":144.96367854761945,"lat":-37.80236896106898},"zoom":15.389393850725732,"bearing":-143.5844675124954,"pitch":60}                                
    },

    {
        caption: 'What will <u>you</u>&nbsp; do with our data?',
        delay:20000,
        linger:30000,
        opacity:0.4,
        mapbox: {
            id: 'buildings',
            type: 'fill-extrusion',
            source: 'mapbox://cityofmelbourne.052wfh9y',
            'source-layer': 'Building_outlines-0mm7az',
            paint: {
                'fill-extrusion-color': 'hsl(146, 0%, 20%)',
                'fill-extrusion-opacity': 0.9,
                'fill-extrusion-height': {
                    'property':'height',
                    type: 'identity'
                }
            }

        },
    },

];
*/

var unused = [{
    delay: 10000,
    caption: 'Pedestrian sensors count foot traffic every hour',
    name: 'Pedestrian sensor locations',
    dataset: new _sourceData.SourceData('ygaw-6rzq'),
    flyTo: { "center": { "lng": 144.96367854761945, "lat": -37.80236896106898 }, "zoom": 15.389393850725732, "bearing": -143.5844675124954, "pitch": 60 }
}];

var datasets2 = exports.datasets2 = [{
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPLIED'],
    caption: 'Major development project applications'

}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPROVED'],
    caption: 'Major development projects approved'
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: 'Major development projects under construction'
}, { delay: 5000, dataset: new _sourceData.SourceData('tdvh-n9dv') }, // bike share
{ delay: 9000, dataset: new _sourceData.SourceData('c3gt-hrz6'), column: 'Accommodation' }, { delay: 10000, dataset: new _sourceData.SourceData('b36j-kiy4'), column: 'Arts and Recreation Services' },
//{ delay: 3000, dataset: new SourceData('c3gt-hrz6'), column: 'Retail Trade' },
{ delay: 9000, dataset: new _sourceData.SourceData('c3gt-hrz6'), column: 'Construction' }
//{ delay: 1000, dataset: 'b36j-kiy4' },
//{ delay: 2000, dataset: '234q-gg83' }
];

},{"./sourceData":12}],3:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FlightPath = undefined;

var _melbourneRoute = require('./melbourneRoute');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* jshint esnext:true */


/*
Continuously moves the Mapbox vantage point around a GeoJSON-defined path.
*/

function whenLoaded(map, f) {
    if (map.loaded()) {
        console.log('Already loaded.');
        f();
    } else {
        console.log('Wait for load');
        map.once('load', f);
    }
}

var def = function def(a, b) {
    return a !== undefined ? a : b;
};

var FlightPath = exports.FlightPath = function FlightPath(map, route) {
    var _this = this;

    _classCallCheck(this, FlightPath);

    this.route = route;
    if (this.route === undefined) this.route = _melbourneRoute.melbourneRoute;

    this.map = map;

    this.speed = 0.01;

    this.posNo = 0;

    this.positions = this.route.features.map(function (feature) {
        return {
            center: feature.geometry.coordinates,
            zoom: def(feature.properties.zoom, 14),
            bearing: feature.properties.bearing,
            pitch: def(feature.properties.pitch, 60)
        };
    });

    this.pauseTime = 0;

    this.bearing = 0;

    this.stopped = false;

    /*var positions = [
        { center: [144.96, -37.8], zoom: 15, bearing: 10},
        { center: [144.98, -37.84], zoom: 15, bearing: 160, pitch: 10},
        { center: [144.995, -37.825], zoom: 15, bearing: -90},
        { center: [144.97, -37.82], zoom: 15, bearing: 140}
     ];*/

    this.moveCamera = function () {
        console.log('moveCamera');
        if (this.stopped) return;
        var pos = this.positions[this.posNo];
        pos.speed = this.speed;
        pos.curve = 0.48; //1;
        pos.easing = function (t) {
            return t;
        }; // linear easing

        console.log('flyTo');
        this.map.flyTo(pos, { source: 'flightpath' });

        this.posNo = (this.posNo + 1) % this.positions.length;

        //map.rotateTo(bearing, { easing: easing });
        //bearing += 5;
    }.bind(this);

    this.map.on('moveend', function (data) {
        if (data.source === 'flightpath') setTimeout(_this.moveCamera, _this.pauseTime);
    });

    /*
    This seemed to be unreliable - wasn't always getting the loaded event.
    whenLoaded(this.map, () => {
        console.log('Loaded.');
        setTimeout(this.moveCamera, this.pauseTime);
    });
    */

    this.map.jumpTo(this.positions[0]);
    this.posNo++;
    setTimeout(this.moveCamera, 0 /*this.pauseTime*/);

    this.map.on('click', function () {
        if (_this.stopped) {
            _this.stopped = false;
            setTimeout(_this.moveCamera, _this.pauseTime);
        } else {
            _this.stopped = true;
            _this.map.stop();
        }
    });
};

},{"./melbourneRoute":6}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.showRadiusLegend = showRadiusLegend;
exports.showExtrusionHeightLegend = showExtrusionHeightLegend;
exports.showCategoryLegend = showCategoryLegend;
/* jshint esnext:true */
function showRadiusLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = (closeHandler ? '<div class="close">Close ✖</div>' : '') + ('<h3>' + columnName + '</h3>') + (
    // TODO pad the small circle so the text starts at the same X position for both
    '<span class="circle" style="height:6px; width: 6px; border-radius: 3px"></span><label>' + minVal + '</label><br/>') + ('<span class="circle" style="height:20px; width: 20px; border-radius: 10px"></span><label>' + maxVal + '</label>');

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}

function showExtrusionHeightLegend(id, columnName, minVal, maxVal, closeHandler) {
    var legendHtml = (closeHandler ? '<div class="close">Close ✖</div>' : '') + ('<h3>' + columnName + '</h3>') + ('<span class="circle" style="height:20px; width: 12px; background: rgb(40,40,250)"></span><label>' + maxVal + '</label><br/>') + ('<span class="circle" style="height:3px; width: 12px; background: rgb(20,20,40)"></span><label>' + minVal + '</label>');

    document.querySelector(id).innerHTML = legendHtml;
    if (closeHandler) {
        document.querySelector(id + ' .close').addEventListener('click', closeHandler);
    }
}

function showCategoryLegend(id, columnName, colorStops, closeHandler) {
    var legendHtml = '<div class="close">Close ✖</div>' + ('<h3>' + columnName + '</h3>') + colorStops.sort(function (stopa, stopb) {
        return stopa[0].localeCompare(stopb[0]);
    }) // sort on values
    .map(function (stop) {
        return '<span class="box" style=\'background: ' + stop[1] + '\'></span><label>' + stop[0] + '</label><br/>';
    }).join('\n');

    document.querySelector(id).innerHTML = legendHtml;
    document.querySelector(id + ' .close').addEventListener('click', closeHandler);
}

},{}],5:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.MapVis = undefined;

var _legend = require('./legend');

var legend = _interopRequireWildcard(_legend);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* jshint esnext:true */

/*
Wraps a Mapbox map with data vis capabilities like circle size and color, and polygon height.

sourceData is an object with:
- dataId
- locationColumn
- textColumns
- numericColumns
- rows
- shape
- mins, maxs
*/
var def = function def(a, b) {
    return a !== undefined ? a : b;
};

var unique = 0;

var MapVis = exports.MapVis = function MapVis(map, sourceData, filter, featureHoverHook, options) {
    var _this2 = this;

    _classCallCheck(this, MapVis);

    this.map = map;
    this.sourceData = sourceData;
    this.filter = filter;
    this.featureHoverHook = featureHoverHook; // f(properties, sourceData)
    options = def(options, {});
    this.options = {
        circleRadius: def(options.circleRadius, 20),
        invisible: options.invisible, // whether to create with opacity 0
        symbol: options.symbol, // Mapbox symbol properties, meaning we show symbol instead of circle
        enumColors: options.enumColors // override default color choices
    };

    //this.options.invisible = false;
    // TODO should be passed a Legend object of some kind.

    this.dataColumn = undefined;

    this.layerId = sourceData.shape + '-' + sourceData.dataId + '-' + unique++;
    this.layerIdHighlight = this.layerId + '-highlight';

    // Convert a table of rows to a Mapbox datasource
    this.addPointsToMap = function () {
        var sourceId = 'dataset-' + this.sourceData.dataId;
        if (!this.map.getSource(sourceId)) this.map.addSource(sourceId, pointDatasetToGeoJSON(this.sourceData));

        if (!this.options.symbol) {
            this.map.addLayer(circleLayer(sourceId, this.layerId, this.filter, false, this.options.circleRadius, this.options.invisible));
            if (this.featureHoverHook) this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.circleRadius, this.options.invisible)); // highlight layer
        } else {
            this.map.addLayer(symbolLayer(sourceId, this.layerId, this.options.symbol, this.filter, false, this.options.invisible));
            if (this.featureHoverHook)
                // try using a circle highlight even on an icon
                this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.circleRadius, this.options.invisible)); // highlight layer
            //this.map.addLayer(symbolLayer(sourceId, this.layerIdHighlight, this.options.symbol, ['==', this.sourceData.locationColumn, '-'], true)); // highlight layer
        }
    };

    this.addPolygonsToMap = function () {
        // we don't need to construct a "polygon datasource", the geometry exists in Mapbox already
        // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4

        // add CLUE blocks polygon dataset, ripe for choroplething
        var sourceId = 'dataset-' + this.sourceData.dataId;
        if (!this.map.getSource(sourceId)) this.map.addSource(sourceId, {
            type: 'vector',
            url: 'mapbox://opencouncildata.aedfmyp8'
        });
        if (this.featureHoverHook) {
            this.map.addLayer(polygonHighlightLayer(sourceId, this.layerIdHighlight, this.options.invisible));
        }
        this.map.addLayer(polygonLayer(sourceId, this.layerId, this.options.invisible));
    };

    // switch visualisation to using this column
    this.setVisColumn = function (columnName) {
        if (this.options.symbol) {
            //console.log('This is a symbol layer, we ignore setVisColumn.');
            return;
        }
        if (columnName === undefined) {
            columnName = sourceData.textColumns[0];
        }
        this.dataColumn = columnName;
        console.log('Data column: ' + this.dataColumn);

        if (sourceData.numericColumns.indexOf(this.dataColumn) >= 0) {
            if (sourceData.shape === 'point') {
                this.setCircleRadiusStyle(this.dataColumn);
            } else {
                // polygon
                this.setPolygonHeightStyle(this.dataColumn);
                // TODO add close button behaviour. maybe?
            }
        } else if (sourceData.textColumns.indexOf(this.dataColumn) >= 0) {
            // TODO handle enum fields on polygons (no example currently)
            this.setCircleColorStyle(this.dataColumn);
        }
    };

    this.setCircleRadiusStyle = function (dataColumn) {
        var minSize = 0.3 * this.options.circleRadius;
        var maxSize = this.options.circleRadius;

        this.map.setPaintProperty(this.layerId, 'circle-radius', {
            property: dataColumn,
            stops: [[{ zoom: 10, value: sourceData.mins[dataColumn] }, minSize / 3], [{ zoom: 10, value: sourceData.maxs[dataColumn] }, maxSize / 3], [{ zoom: 17, value: sourceData.mins[dataColumn] }, minSize], [{ zoom: 17, value: sourceData.maxs[dataColumn] }, maxSize]]
        });

        legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn] /*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
    };

    this.removeCircleRadius = function (e) {
        console.log(pointLayer().paint['circle-radius']);
        this.map.setPaintProperty(this.layerId, 'circle-radius', pointLayer().paint['circle-radius']);
        document.querySelector('#legend-numeric').innerHTML = '';
    };

    this.setCircleColorStyle = function (dataColumn) {
        // from ColorBrewer
        var enumColors = def(this.options.enumColors, ['#1f78b4', '#fb9a99', '#b2df8a', '#33a02c', '#e31a1c', '#fdbf6f', '#a6cee3', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928']);

        var enumStops = this.sourceData.sortedFrequencies[dataColumn].map(function (val, i) {
            return [val, enumColors[i % enumColors.length]];
        });
        this.map.setPaintProperty(this.layerId, 'circle-color', {
            property: dataColumn,
            type: 'categorical',
            stops: enumStops
        });
        // TODO test close handler, currently non functional due to pointer-events:none in CSS
        legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, this.removeCircleColor.bind(this));
    };

    this.removeCircleColor = function (e) {
        this.map.setPaintProperty(this.layerId, 'circle-color', pointLayer().paint['circle-color']);
        document.querySelector('#legend-enum').innerHTML = '';
    };
    /*
        Applies a style that represents numeric data values as heights of extruded polygons.
        TODO: add removePolygonHeight
    */
    this.setPolygonHeightStyle = function (dataColumn) {
        var _this = this;

        this.map.setPaintProperty(this.layerId, 'fill-extrusion-height', {
            // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
            property: 'block_id', //locationColumn, // the ID on the actual geometry dataset
            type: 'categorical',
            stops: this.sourceData.filteredRows().map(function (row) {
                return [row[_this.sourceData.locationColumn], row[dataColumn] / _this.sourceData.maxs[dataColumn] * 1000];
            })
        });
        this.map.setPaintProperty(this.layerId, 'fill-extrusion-color', {
            property: 'block_id',
            type: 'categorical',
            stops: this.sourceData.filteredRows()
            //.map(row => [row[this.sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / this.sourceData.maxs[dataColumn] * 200) + ')'])
            .map(function (row) {
                return [row[_this.sourceData.locationColumn], 'hsl(340,88%,' + Math.round(20 + row[dataColumn] / _this.sourceData.maxs[dataColumn] * 50) + '%)'];
            })
        });
        this.map.setFilter(this.layerId, ['!in', 'block_id'].concat(_toConsumableArray( /* ### TODO generalise */
        this.sourceData.filteredRows().filter(function (row) {
            return row[dataColumn] === 0;
        }).map(function (row) {
            return row[_this.sourceData.locationColumn];
        }))));

        legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, this.sourceData.mins[dataColumn], this.sourceData.maxs[dataColumn] /*, removeCircleRadius*/);
    };

    this.lastFeature = undefined;

    this.remove = function () {
        this.map.removeLayer(this.layerId);
        if (this.mousemove) {
            this.map.removeLayer(this.layerIdHighlight);
            this.map.off('mousemove', this.mousemove);
            this.mousemove = undefined;
        }
    };
    // The actual constructor...
    if (this.sourceData.shape === 'point') {
        this.addPointsToMap();
    } else {
        this.addPolygonsToMap();
    }
    if (featureHoverHook) {
        this.mousemove = function (e) {
            var f = _this2.map.queryRenderedFeatures(e.point, { layers: [_this2.layerId] })[0];
            if (f && f !== _this2.lastFeature) {
                _this2.map.getCanvas().style.cursor = 'pointer';

                _this2.lastFeature = f;
                if (featureHoverHook) {
                    featureHoverHook(f.properties, _this2.sourceData, _this2);
                }

                if (sourceData.shape === 'point') {
                    _this2.map.setFilter(_this2.layerIdHighlight, ['==', _this2.sourceData.locationColumn, f.properties[_this2.sourceData.locationColumn]]); // we don't have any other reliable key?
                } else {
                    _this2.map.setFilter(_this2.layerIdHighlight, ['==', 'block_id', f.properties.block_id]); // don't have a general way to match other kinds of polygons
                    //console.log(f.properties);
                }
            } else {
                _this2.map.getCanvas().style.cursor = '';
            }
        }.bind(this);
        this.map.on('mousemove', this.mousemove);
    }
};

// convert a table of rows to GeoJSON


function pointDatasetToGeoJSON(sourceData) {
    var datasource = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    sourceData.rows.forEach(function (row) {
        try {
            if (row[sourceData.locationColumn]) {
                datasource.data.features.push({
                    type: 'Feature',
                    properties: row,
                    geometry: {
                        type: 'Point',
                        coordinates: row[sourceData.locationColumn]
                    }
                });
            }
        } catch (e) {
            // Just don't push it 
            console.log('Bad location: ' + row[sourceData.locationColumn]);
        }
    });
    return datasource;
};

function circleLayer(sourceId, layerId, filter, highlight, size, invisible) {
    var ret = {
        id: layerId,
        type: 'circle',
        source: sourceId,
        paint: {
            //            'circle-color': highlight ? 'hsl(20, 95%, 50%)' : 'hsl(220,80%,50%)',
            'circle-color': highlight ? 'rgba(0,0,0,0)' : 'hsl(220,80%,50%)',
            'circle-opacity': !invisible ? 0.95 : 0,
            'circle-stroke-color': highlight ? 'white' : 'rgba(50,50,50,0.5)',
            'circle-stroke-width': 1,
            'circle-radius': {
                stops: highlight ? [[10, size * 0.4], [17, size * 1.0]] : [[10, size * 0.2], [17, size * 0.5]]
            }
        }
    };
    if (filter) ret.filter = filter;
    return ret;
}

function symbolLayer(sourceId, layerId, symbol, filter, highlight, invisible) {
    var ret = {
        id: layerId,
        type: 'symbol',
        source: sourceId
    };
    if (filter) ret.filter = filter;

    ret.paint = def(symbol.paint, {});
    ret.paint['icon-opacity'] = !invisible ? 0.95 : 0;

    //ret.layout = def(symbol.layout, {});
    if (symbol.layout) {
        if (symbol.layout['text-field'] && invisible) ret.paint['text-opacity'] = 0;
        ret.layout = symbol.layout;
    }

    return ret;
}

function polygonLayer(sourceId, layerId, invisible) {
    return {
        id: layerId,
        type: 'fill-extrusion',
        source: sourceId,
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-extrusion-opacity': !invisible ? 0.8 : 0,
            'fill-extrusion-height': 0,
            'fill-extrusion-color': '#003'
        }
    };
}
function polygonHighlightLayer(sourceId, layerId) {
    return {
        id: layerId,
        type: 'fill',
        source: sourceId,
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-color': 'white'
        },
        filter: ['==', 'block_id', '-']
    };
}

},{"./legend":4}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
var melbourneRoute = exports.melbourneRoute = {
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "properties": {
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "",
      "bearing": 350
    },
    "geometry": {
      "type": "Point",
      "coordinates": [144.96288299560547, -37.82171764783965]
    }
  }, {
    "type": "Feature",
    "properties": {
      "bearing": 270
    },
    "geometry": {
      "type": "Point",
      "coordinates": [144.9785041809082, -37.808359917423594]
    }
  }, {
    "type": "Feature",
    "properties": {
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "",
      "bearing": 180
    },
    "geometry": {
      "type": "Point",
      "coordinates": [144.95558738708496, -37.8057830213145]
    }
  }, {
    "type": "Feature",
    "properties": {
      "marker-color": "#7e7e7e",
      "marker-size": "medium",
      "marker-symbol": "",
      "bearing": 90
    },
    "geometry": {
      "type": "Point",
      "coordinates": [144.94434356689453, -37.81649689372308]
    }
  }]
};

},{}],7:[function(require,module,exports){
// https://d3js.org/d3-collection/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var prefix = "$";

function Map() {}

Map.prototype = map.prototype = {
  constructor: Map,
  has: function(key) {
    return (prefix + key) in this;
  },
  get: function(key) {
    return this[prefix + key];
  },
  set: function(key, value) {
    this[prefix + key] = value;
    return this;
  },
  remove: function(key) {
    var property = prefix + key;
    return property in this && delete this[property];
  },
  clear: function() {
    for (var property in this) if (property[0] === prefix) delete this[property];
  },
  keys: function() {
    var keys = [];
    for (var property in this) if (property[0] === prefix) keys.push(property.slice(1));
    return keys;
  },
  values: function() {
    var values = [];
    for (var property in this) if (property[0] === prefix) values.push(this[property]);
    return values;
  },
  entries: function() {
    var entries = [];
    for (var property in this) if (property[0] === prefix) entries.push({key: property.slice(1), value: this[property]});
    return entries;
  },
  size: function() {
    var size = 0;
    for (var property in this) if (property[0] === prefix) ++size;
    return size;
  },
  empty: function() {
    for (var property in this) if (property[0] === prefix) return false;
    return true;
  },
  each: function(f) {
    for (var property in this) if (property[0] === prefix) f(this[property], property.slice(1), this);
  }
};

function map(object, f) {
  var map = new Map;

  // Copy constructor.
  if (object instanceof Map) object.each(function(value, key) { map.set(key, value); });

  // Index array by numeric index or specified key function.
  else if (Array.isArray(object)) {
    var i = -1,
        n = object.length,
        o;

    if (f == null) while (++i < n) map.set(i, object[i]);
    else while (++i < n) map.set(f(o = object[i], i, object), o);
  }

  // Convert object to map.
  else if (object) for (var key in object) map.set(key, object[key]);

  return map;
}

var nest = function() {
  var keys = [],
      sortKeys = [],
      sortValues,
      rollup,
      nest;

  function apply(array, depth, createResult, setResult) {
    if (depth >= keys.length) return rollup != null
        ? rollup(array) : (sortValues != null
        ? array.sort(sortValues)
        : array);

    var i = -1,
        n = array.length,
        key = keys[depth++],
        keyValue,
        value,
        valuesByKey = map(),
        values,
        result = createResult();

    while (++i < n) {
      if (values = valuesByKey.get(keyValue = key(value = array[i]) + "")) {
        values.push(value);
      } else {
        valuesByKey.set(keyValue, [value]);
      }
    }

    valuesByKey.each(function(values, key) {
      setResult(result, key, apply(values, depth, createResult, setResult));
    });

    return result;
  }

  function entries(map$$1, depth) {
    if (++depth > keys.length) return map$$1;
    var array, sortKey = sortKeys[depth - 1];
    if (rollup != null && depth >= keys.length) array = map$$1.entries();
    else array = [], map$$1.each(function(v, k) { array.push({key: k, values: entries(v, depth)}); });
    return sortKey != null ? array.sort(function(a, b) { return sortKey(a.key, b.key); }) : array;
  }

  return nest = {
    object: function(array) { return apply(array, 0, createObject, setObject); },
    map: function(array) { return apply(array, 0, createMap, setMap); },
    entries: function(array) { return entries(apply(array, 0, createMap, setMap), 0); },
    key: function(d) { keys.push(d); return nest; },
    sortKeys: function(order) { sortKeys[keys.length - 1] = order; return nest; },
    sortValues: function(order) { sortValues = order; return nest; },
    rollup: function(f) { rollup = f; return nest; }
  };
};

function createObject() {
  return {};
}

function setObject(object, key, value) {
  object[key] = value;
}

function createMap() {
  return map();
}

function setMap(map$$1, key, value) {
  map$$1.set(key, value);
}

function Set() {}

var proto = map.prototype;

Set.prototype = set.prototype = {
  constructor: Set,
  has: proto.has,
  add: function(value) {
    value += "";
    this[prefix + value] = value;
    return this;
  },
  remove: proto.remove,
  clear: proto.clear,
  values: proto.keys,
  size: proto.size,
  empty: proto.empty,
  each: proto.each
};

function set(object, f) {
  var set = new Set;

  // Copy constructor.
  if (object instanceof Set) object.each(function(value) { set.add(value); });

  // Otherwise, assume it’s an array.
  else if (object) {
    var i = -1, n = object.length;
    if (f == null) while (++i < n) set.add(object[i]);
    else while (++i < n) set.add(f(object[i], i, object));
  }

  return set;
}

var keys = function(map) {
  var keys = [];
  for (var key in map) keys.push(key);
  return keys;
};

var values = function(map) {
  var values = [];
  for (var key in map) values.push(map[key]);
  return values;
};

var entries = function(map) {
  var entries = [];
  for (var key in map) entries.push({key: key, value: map[key]});
  return entries;
};

exports.nest = nest;
exports.set = set;
exports.map = map;
exports.keys = keys;
exports.values = values;
exports.entries = entries;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],8:[function(require,module,exports){
// https://d3js.org/d3-dispatch/ Version 1.0.2. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

var noop = {value: function() {}};

function dispatch() {
  for (var i = 0, n = arguments.length, _ = {}, t; i < n; ++i) {
    if (!(t = arguments[i] + "") || (t in _)) throw new Error("illegal type: " + t);
    _[t] = [];
  }
  return new Dispatch(_);
}

function Dispatch(_) {
  this._ = _;
}

function parseTypenames(typenames, types) {
  return typenames.trim().split(/^|\s+/).map(function(t) {
    var name = "", i = t.indexOf(".");
    if (i >= 0) name = t.slice(i + 1), t = t.slice(0, i);
    if (t && !types.hasOwnProperty(t)) throw new Error("unknown type: " + t);
    return {type: t, name: name};
  });
}

Dispatch.prototype = dispatch.prototype = {
  constructor: Dispatch,
  on: function(typename, callback) {
    var _ = this._,
        T = parseTypenames(typename + "", _),
        t,
        i = -1,
        n = T.length;

    // If no callback was specified, return the callback of the given type and name.
    if (arguments.length < 2) {
      while (++i < n) if ((t = (typename = T[i]).type) && (t = get(_[t], typename.name))) return t;
      return;
    }

    // If a type was specified, set the callback for the given type and name.
    // Otherwise, if a null callback was specified, remove callbacks of the given name.
    if (callback != null && typeof callback !== "function") throw new Error("invalid callback: " + callback);
    while (++i < n) {
      if (t = (typename = T[i]).type) _[t] = set(_[t], typename.name, callback);
      else if (callback == null) for (t in _) _[t] = set(_[t], typename.name, null);
    }

    return this;
  },
  copy: function() {
    var copy = {}, _ = this._;
    for (var t in _) copy[t] = _[t].slice();
    return new Dispatch(copy);
  },
  call: function(type, that) {
    if ((n = arguments.length - 2) > 0) for (var args = new Array(n), i = 0, n, t; i < n; ++i) args[i] = arguments[i + 2];
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  },
  apply: function(type, that, args) {
    if (!this._.hasOwnProperty(type)) throw new Error("unknown type: " + type);
    for (var t = this._[type], i = 0, n = t.length; i < n; ++i) t[i].value.apply(that, args);
  }
};

function get(type, name) {
  for (var i = 0, n = type.length, c; i < n; ++i) {
    if ((c = type[i]).name === name) {
      return c.value;
    }
  }
}

function set(type, name, callback) {
  for (var i = 0, n = type.length; i < n; ++i) {
    if (type[i].name === name) {
      type[i] = noop, type = type.slice(0, i).concat(type.slice(i + 1));
      break;
    }
  }
  if (callback != null) type.push({name: name, value: callback});
  return type;
}

exports.dispatch = dispatch;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{}],9:[function(require,module,exports){
// https://d3js.org/d3-dsv/ Version 1.0.3. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.d3 = global.d3 || {})));
}(this, (function (exports) { 'use strict';

function objectConverter(columns) {
  return new Function("d", "return {" + columns.map(function(name, i) {
    return JSON.stringify(name) + ": d[" + i + "]";
  }).join(",") + "}");
}

function customConverter(columns, f) {
  var object = objectConverter(columns);
  return function(row, i) {
    return f(object(row), i, columns);
  };
}

// Compute unique columns in order of discovery.
function inferColumns(rows) {
  var columnSet = Object.create(null),
      columns = [];

  rows.forEach(function(row) {
    for (var column in row) {
      if (!(column in columnSet)) {
        columns.push(columnSet[column] = column);
      }
    }
  });

  return columns;
}

function dsv(delimiter) {
  var reFormat = new RegExp("[\"" + delimiter + "\n]"),
      delimiterCode = delimiter.charCodeAt(0);

  function parse(text, f) {
    var convert, columns, rows = parseRows(text, function(row, i) {
      if (convert) return convert(row, i - 1);
      columns = row, convert = f ? customConverter(row, f) : objectConverter(row);
    });
    rows.columns = columns;
    return rows;
  }

  function parseRows(text, f) {
    var EOL = {}, // sentinel value for end-of-line
        EOF = {}, // sentinel value for end-of-file
        rows = [], // output rows
        N = text.length,
        I = 0, // current character index
        n = 0, // the current line number
        t, // the current token
        eol; // is the current token followed by EOL?

    function token() {
      if (I >= N) return EOF; // special case: end of file
      if (eol) return eol = false, EOL; // special case: end of line

      // special case: quotes
      var j = I, c;
      if (text.charCodeAt(j) === 34) {
        var i = j;
        while (i++ < N) {
          if (text.charCodeAt(i) === 34) {
            if (text.charCodeAt(i + 1) !== 34) break;
            ++i;
          }
        }
        I = i + 2;
        c = text.charCodeAt(i + 1);
        if (c === 13) {
          eol = true;
          if (text.charCodeAt(i + 2) === 10) ++I;
        } else if (c === 10) {
          eol = true;
        }
        return text.slice(j + 1, i).replace(/""/g, "\"");
      }

      // common case: find next delimiter or newline
      while (I < N) {
        var k = 1;
        c = text.charCodeAt(I++);
        if (c === 10) eol = true; // \n
        else if (c === 13) { eol = true; if (text.charCodeAt(I) === 10) ++I, ++k; } // \r|\r\n
        else if (c !== delimiterCode) continue;
        return text.slice(j, I - k);
      }

      // special case: last token before EOF
      return text.slice(j);
    }

    while ((t = token()) !== EOF) {
      var a = [];
      while (t !== EOL && t !== EOF) {
        a.push(t);
        t = token();
      }
      if (f && (a = f(a, n++)) == null) continue;
      rows.push(a);
    }

    return rows;
  }

  function format(rows, columns) {
    if (columns == null) columns = inferColumns(rows);
    return [columns.map(formatValue).join(delimiter)].concat(rows.map(function(row) {
      return columns.map(function(column) {
        return formatValue(row[column]);
      }).join(delimiter);
    })).join("\n");
  }

  function formatRows(rows) {
    return rows.map(formatRow).join("\n");
  }

  function formatRow(row) {
    return row.map(formatValue).join(delimiter);
  }

  function formatValue(text) {
    return text == null ? ""
        : reFormat.test(text += "") ? "\"" + text.replace(/\"/g, "\"\"") + "\""
        : text;
  }

  return {
    parse: parse,
    parseRows: parseRows,
    format: format,
    formatRows: formatRows
  };
}

var csv = dsv(",");

var csvParse = csv.parse;
var csvParseRows = csv.parseRows;
var csvFormat = csv.format;
var csvFormatRows = csv.formatRows;

var tsv = dsv("\t");

var tsvParse = tsv.parse;
var tsvParseRows = tsv.parseRows;
var tsvFormat = tsv.format;
var tsvFormatRows = tsv.formatRows;

exports.dsvFormat = dsv;
exports.csvParse = csvParse;
exports.csvParseRows = csvParseRows;
exports.csvFormat = csvFormat;
exports.csvFormatRows = csvFormatRows;
exports.tsvParse = tsvParse;
exports.tsvParseRows = tsvParseRows;
exports.tsvFormat = tsvFormat;
exports.tsvFormatRows = tsvFormatRows;

Object.defineProperty(exports, '__esModule', { value: true });

})));
},{}],10:[function(require,module,exports){
// https://d3js.org/d3-request/ Version 1.0.3. Copyright 2016 Mike Bostock.
(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('d3-collection'), require('d3-dispatch'), require('d3-dsv')) :
  typeof define === 'function' && define.amd ? define(['exports', 'd3-collection', 'd3-dispatch', 'd3-dsv'], factory) :
  (factory((global.d3 = global.d3 || {}),global.d3,global.d3,global.d3));
}(this, (function (exports,d3Collection,d3Dispatch,d3Dsv) { 'use strict';

var request = function(url, callback) {
  var request,
      event = d3Dispatch.dispatch("beforesend", "progress", "load", "error"),
      mimeType,
      headers = d3Collection.map(),
      xhr = new XMLHttpRequest,
      user = null,
      password = null,
      response,
      responseType,
      timeout = 0;

  // If IE does not support CORS, use XDomainRequest.
  if (typeof XDomainRequest !== "undefined"
      && !("withCredentials" in xhr)
      && /^(http(s)?:)?\/\//.test(url)) xhr = new XDomainRequest;

  "onload" in xhr
      ? xhr.onload = xhr.onerror = xhr.ontimeout = respond
      : xhr.onreadystatechange = function(o) { xhr.readyState > 3 && respond(o); };

  function respond(o) {
    var status = xhr.status, result;
    if (!status && hasResponse(xhr)
        || status >= 200 && status < 300
        || status === 304) {
      if (response) {
        try {
          result = response.call(request, xhr);
        } catch (e) {
          event.call("error", request, e);
          return;
        }
      } else {
        result = xhr;
      }
      event.call("load", request, result);
    } else {
      event.call("error", request, o);
    }
  }

  xhr.onprogress = function(e) {
    event.call("progress", request, e);
  };

  request = {
    header: function(name, value) {
      name = (name + "").toLowerCase();
      if (arguments.length < 2) return headers.get(name);
      if (value == null) headers.remove(name);
      else headers.set(name, value + "");
      return request;
    },

    // If mimeType is non-null and no Accept header is set, a default is used.
    mimeType: function(value) {
      if (!arguments.length) return mimeType;
      mimeType = value == null ? null : value + "";
      return request;
    },

    // Specifies what type the response value should take;
    // for instance, arraybuffer, blob, document, or text.
    responseType: function(value) {
      if (!arguments.length) return responseType;
      responseType = value;
      return request;
    },

    timeout: function(value) {
      if (!arguments.length) return timeout;
      timeout = +value;
      return request;
    },

    user: function(value) {
      return arguments.length < 1 ? user : (user = value == null ? null : value + "", request);
    },

    password: function(value) {
      return arguments.length < 1 ? password : (password = value == null ? null : value + "", request);
    },

    // Specify how to convert the response content to a specific type;
    // changes the callback value on "load" events.
    response: function(value) {
      response = value;
      return request;
    },

    // Alias for send("GET", …).
    get: function(data, callback) {
      return request.send("GET", data, callback);
    },

    // Alias for send("POST", …).
    post: function(data, callback) {
      return request.send("POST", data, callback);
    },

    // If callback is non-null, it will be used for error and load events.
    send: function(method, data, callback) {
      xhr.open(method, url, true, user, password);
      if (mimeType != null && !headers.has("accept")) headers.set("accept", mimeType + ",*/*");
      if (xhr.setRequestHeader) headers.each(function(value, name) { xhr.setRequestHeader(name, value); });
      if (mimeType != null && xhr.overrideMimeType) xhr.overrideMimeType(mimeType);
      if (responseType != null) xhr.responseType = responseType;
      if (timeout > 0) xhr.timeout = timeout;
      if (callback == null && typeof data === "function") callback = data, data = null;
      if (callback != null && callback.length === 1) callback = fixCallback(callback);
      if (callback != null) request.on("error", callback).on("load", function(xhr) { callback(null, xhr); });
      event.call("beforesend", request, xhr);
      xhr.send(data == null ? null : data);
      return request;
    },

    abort: function() {
      xhr.abort();
      return request;
    },

    on: function() {
      var value = event.on.apply(event, arguments);
      return value === event ? request : value;
    }
  };

  if (callback != null) {
    if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
    return request.get(callback);
  }

  return request;
};

function fixCallback(callback) {
  return function(error, xhr) {
    callback(error == null ? xhr : null);
  };
}

function hasResponse(xhr) {
  var type = xhr.responseType;
  return type && type !== "text"
      ? xhr.response // null on error
      : xhr.responseText; // "" on error
}

var type = function(defaultMimeType, response) {
  return function(url, callback) {
    var r = request(url).mimeType(defaultMimeType).response(response);
    if (callback != null) {
      if (typeof callback !== "function") throw new Error("invalid callback: " + callback);
      return r.get(callback);
    }
    return r;
  };
};

var html = type("text/html", function(xhr) {
  return document.createRange().createContextualFragment(xhr.responseText);
});

var json = type("application/json", function(xhr) {
  return JSON.parse(xhr.responseText);
});

var text = type("text/plain", function(xhr) {
  return xhr.responseText;
});

var xml = type("application/xml", function(xhr) {
  var xml = xhr.responseXML;
  if (!xml) throw new Error("parse error");
  return xml;
});

var dsv = function(defaultMimeType, parse) {
  return function(url, row, callback) {
    if (arguments.length < 3) callback = row, row = null;
    var r = request(url).mimeType(defaultMimeType);
    r.row = function(_) { return arguments.length ? r.response(responseOf(parse, row = _)) : row; };
    r.row(row);
    return callback ? r.get(callback) : r;
  };
};

function responseOf(parse, row) {
  return function(request$$1) {
    return parse(request$$1.responseText, row);
  };
}

var csv = dsv("text/csv", d3Dsv.csvParse);

var tsv = dsv("text/tab-separated-values", d3Dsv.tsvParse);

exports.request = request;
exports.html = html;
exports.json = json;
exports.text = text;
exports.xml = xml;
exports.csv = csv;
exports.tsv = tsv;

Object.defineProperty(exports, '__esModule', { value: true });

})));

},{"d3-collection":7,"d3-dispatch":8,"d3-dsv":9}],11:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],n):(e.d3=e.d3||{},e.d3.promise=n(e.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var u=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(u))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t});
},{"d3-request":10}],12:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/* jshint esnext:true */
var d3 = require('d3.promise');

function def(a, b) {
    return a !== undefined ? a : b;
}
/*
Manages fetching a dataset from Socrata and preparing it for visualisation by
counting field value frequencies etc. 
*/

var SourceData = exports.SourceData = function () {
    function SourceData(dataId, activeCensusYear) {
        _classCallCheck(this, SourceData);

        this.dataId = dataId;
        this.activeCensusYear = def(activeCensusYear, 2015);

        this.locationColumn = undefined; // name of column which holds lat/lon or block ID
        this.locationIsPoint = undefined; // if the dataset type is 'point' (used for parsing location field)
        this.numericColumns = []; // names of columns suitable for numeric datavis
        this.textColumns = []; // names of columns suitable for enum datavis
        this.boringColumns = []; // names of other columns
        this.mins = {}; // min and max of each numeric column
        this.maxs = {};
        this.frequencies = {}; // 
        this.sortedFrequencies = {}; // most frequent values in each text column
        this.shape = 'point'; // point or polygon (CLUE block)
        this.rows = undefined; // processed rows
        this.blockIndex = {}; // cache of CLUE block IDs
    }

    _createClass(SourceData, [{
        key: 'chooseColumnTypes',
        value: function chooseColumnTypes(columns) {
            var _this = this;

            //var lc = columns.filter(col => col.dataTypeName === 'location' || col.dataTypeName === 'point' || col.name === 'Block ID')[0];
            // "location" and "point" are both point data types, expressed differently.
            // Otherwise, a "block ID" can be joined against the CLUE Block polygons which are in Mapbox.
            var lc = columns.filter(function (col) {
                return col.dataTypeName === 'location' || col.dataTypeName === 'point';
            })[0];
            if (!lc) {
                lc = columns.filter(function (col) {
                    return col.name === 'Block ID';
                })[0];
            }

            if (lc.dataTypeName === 'point') this.locationIsPoint = true;

            if (lc.name === 'Block ID') {
                this.shape = 'polygon';
            }

            this.locationColumn = lc.name;

            columns = columns.filter(function (col) {
                return col !== lc;
            });

            this.numericColumns = columns.filter(function (col) {
                return col.dataTypeName === 'number' && col.name !== 'Latitude' && col.name !== 'Longitude';
            }).map(function (col) {
                return col.name;
            });

            this.numericColumns.forEach(function (col) {
                _this.mins[col] = 1e9;_this.maxs[col] = -1e9;
            });

            this.textColumns = columns.filter(function (col) {
                return col.dataTypeName === 'text';
            }).map(function (col) {
                return col.name;
            });

            this.textColumns.forEach(function (col) {
                return _this.frequencies[col] = {};
            });

            this.boringColumns = columns.map(function (col) {
                return col.name;
            }).filter(function (col) {
                return _this.numericColumns.indexOf(col) < 0 && _this.textColumns.indexOf(col) < 0;
            });
        }

        // TODO better name and behaviour

    }, {
        key: 'filter',
        value: function filter(row) {
            // TODO move this somewhere better
            if (row['CLUE small area'] && row['CLUE small area'] === 'City of Melbourne total') return false;
            if (row['Census year'] && row['Census year'] !== this.activeCensusYear) return false;
            return true;
        }

        // convert numeric columns to numbers for data vis

    }, {
        key: 'convertRow',
        value: function convertRow(row) {
            var _this2 = this;

            // convert location types (string) to [lon, lat] array.
            function locationToCoords(location) {
                if (String(location).length === 0) return null;
                try {
                    // "new backend" datasets use a WKT field [POINT (lon lat)] instead of (lat, lon)
                    if (this.locationIsPoint) {
                        return location.replace('POINT (', '').replace(')', '').split(' ').map(function (n) {
                            return Number(n);
                        });
                    } else if (this.shape === 'point') {
                        //console.log(location.length);
                        return [Number(location.split(', ')[1].replace(')', '')), Number(location.split(', ')[0].replace('(', ''))];
                    } else return location;
                } catch (e) {
                    console.log('Unreadable location ' + location + ' in ' + this.name + '.');
                    console.error(e);
                }
            }

            // TODO use column.cachedContents.smallest and .largest
            this.numericColumns.forEach(function (col) {
                row[col] = Number(row[col]); // +row[col] apparently faster, but breaks on simple things like blank values
                // we don't want to include the total values in 
                if (row[col] < _this2.mins[col] && _this2.filter(row)) _this2.mins[col] = row[col];

                if (row[col] > _this2.maxs[col] && _this2.filter(row)) _this2.maxs[col] = row[col];
            });
            this.textColumns.forEach(function (col) {
                var val = row[col];
                _this2.frequencies[col][val] = (_this2.frequencies[col][val] || 0) + 1;
            });

            row[this.locationColumn] = locationToCoords.call(this, row[this.locationColumn]);

            if (!row[this.locationColumn]) return null; // skip this row.

            return row;
        }
    }, {
        key: 'computeSortedFrequencies',
        value: function computeSortedFrequencies() {
            var _this3 = this;

            var newTextColumns = [];
            this.textColumns.forEach(function (col) {
                _this3.sortedFrequencies[col] = Object.keys(_this3.frequencies[col]).sort(function (vala, valb) {
                    return _this3.frequencies[col][vala] < _this3.frequencies[col][valb] ? 1 : -1;
                }).slice(0, 12);

                if (Object.keys(_this3.frequencies[col]).length < 2 || Object.keys(_this3.frequencies[col]).length > 20 && _this3.frequencies[col][_this3.sortedFrequencies[col][1]] <= 5) {
                    // It's boring if all values the same, or if too many different values (as judged by second-most common value being 5 times or fewer)
                    _this3.boringColumns.push(col);
                } else {
                    newTextColumns.push(col); // how do you safely delete from array you're looping over?
                }
            });
            this.textColumns = newTextColumns;
            //console.log(this.sortedFrequencies);
        }

        // Retrieve rows from Socrata (returns Promise). "New backend" views go through an additional step to find the real
        // API endpoint.

    }, {
        key: 'load',
        value: function load() {
            var _this4 = this;

            return d3.json('https://data.melbourne.vic.gov.au/api/views/' + this.dataId + '.json').then(function (props) {
                _this4.name = props.name;
                if (props.newBackend && props.childViews.length > 0) {

                    _this4.dataId = props.childViews[0];

                    return d3.json('https://data.melbourne.vic.gov.au/api/views/' + _this4.dataId).then(function (props) {
                        return _this4.chooseColumnTypes(props.columns);
                    });
                } else {
                    _this4.chooseColumnTypes(props.columns);
                    return Promise.resolve(true);
                }
            }).then(function () {
                try {
                    return d3.csv('https://data.melbourne.vic.gov.au/api/views/' + _this4.dataId + '/rows.csv?accessType=DOWNLOAD', _this4.convertRow.bind(_this4)).then(function (rows) {
                        //console.log("Got rows for " + this.name);
                        _this4.rows = rows;
                        _this4.computeSortedFrequencies();
                        if (_this4.shape === 'polygon') _this4.computeBlockIndex();
                        return _this4;
                    }).catch(function (e) {
                        console.error('Problem loading ' + _this4.name + '.');
                        console.error(e);
                    });
                } catch (e) {
                    console.error('Problem loading ' + _this4.name);
                    console.error(e);
                }
            });
        }

        // Create a hash table lookup from [year, block ID] to dataset row

    }, {
        key: 'computeBlockIndex',
        value: function computeBlockIndex() {
            var _this5 = this;

            this.rows.forEach(function (row, index) {
                if (_this5.blockIndex[row['Census year']] === undefined) _this5.blockIndex[row['Census year']] = {};
                _this5.blockIndex[row['Census year']][row['Block ID']] = index;
            });
        }
    }, {
        key: 'getRowForBlock',
        value: function getRowForBlock(blockId /* census_year */) {
            return this.rows[this.blockIndex[this.activeCensusYear][blockId]];
        }
    }, {
        key: 'filteredRows',
        value: function filteredRows() {
            var _this6 = this;

            return this.rows.filter(function (row) {
                return row['Census year'] === _this6.activeCensusYear && row['CLUE small area'] !== 'City of Melbourne total';
            });
        }
    }]);

    return SourceData;
}();

},{"d3.promise":11}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBTkE7QUFDQTtBQUNBO0FBS0EsUUFBUSxHQUFSO0FBQ0E7QUFDQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFjLHFCQUFxQixPQUFLLElBQTFCLEdBQWlDLEdBQS9DO0FBQ0EsZ0NBQVEsS0FBUixDQUFjLENBQWQ7QUFDSCxxQkFaTSxDQUFQO0FBYUMsaUJBZEQsQ0FjRSxPQUFPLENBQVAsRUFBVTtBQUNSLDRCQUFRLEtBQVIsQ0FBYyxxQkFBcUIsT0FBSyxJQUF4QztBQUNBLDRCQUFRLEtBQVIsQ0FBYyxDQUFkO0FBQ0g7QUFDSixhQWhDTSxDQUFQO0FBaUNIOztBQUdEOzs7OzRDQUNvQjtBQUFBOztBQUNoQixpQkFBSyxJQUFMLENBQVUsT0FBVixDQUFrQixVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQzlCLG9CQUFJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsTUFBd0MsU0FBNUMsRUFDSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLElBQXNDLEVBQXRDO0FBQ0osdUJBQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsRUFBb0MsSUFBSSxVQUFKLENBQXBDLElBQXVELEtBQXZEO0FBQ0gsYUFKRDtBQUtIOzs7dUNBRWMsTyxDQUFRLGlCLEVBQW1CO0FBQ3RDLG1CQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLGdCQUFyQixFQUF1QyxPQUF2QyxDQUFWLENBQVA7QUFDSDs7O3VDQUVjO0FBQUE7O0FBQ1gsbUJBQU8sS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQjtBQUFBLHVCQUFPLElBQUksYUFBSixNQUF1QixPQUFLLGdCQUE1QixJQUFnRCxJQUFJLGlCQUFKLE1BQTJCLHlCQUFsRjtBQUFBLGFBQWpCLENBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbi8vJ3VzZSBzdHJpY3QnO1xuLy92YXIgbWFwYm94Z2wgPSByZXF1aXJlKCdtYXBib3gtZ2wnKTtcbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuaW1wb3J0IHsgRmxpZ2h0UGF0aCB9IGZyb20gJy4vZmxpZ2h0UGF0aCc7XG5pbXBvcnQgeyBkYXRhc2V0cyB9IGZyb20gJy4vY3ljbGVEYXRhc2V0cyc7XG5pbXBvcnQgeyBNYXBWaXMgfSBmcm9tICcuL21hcFZpcyc7XG5jb25zb2xlLmxvZyhkYXRhc2V0cyk7XG4vL21hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWGh4Y0dzMGJ6Y3dZbk0zTW5ac09XSmlhalZ3YUhKMkluMC5STjdLeXdNT3hMTE5tY1RGZm4wY2lnJztcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWTJsMGVXOW1iV1ZzWW05MWNtNWxJaXdpWVNJNkltTnBlamRvYjJKMGN6QXdPV1F6TTIxdWJHdDZNRFZxYUhvaWZRLjU1WWJxZVRIV01LX2I2Q0VBbW9VbEEnO1xuLypcblBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uczogeWdhdy02cnpxXG5cbioqVHJlZXM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZnAzOC13aXl5XG5cbkV2ZW50IGJvb2tpbmdzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvIzg0YmYtZGloaVxuQmlrZSBzaGFyZSBzdGF0aW9uczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyN0ZHZoLW45ZHZcbkRBTTogaHR0cDovL2xvY2FsaG9zdDozMDAyLyNnaDdzLXFkYThcbiovXG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmxldCB3aGVuTWFwTG9hZGVkID0gKG1hcCwgZikgPT4gbWFwLmxvYWRlZCgpID8gZigpIDogbWFwLm9uY2UoJ2xvYWQnLCBmKTtcblxubGV0IGNsb25lID0gb2JqID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG5cbmNvbnN0IG9wYWNpdHlQcm9wID0ge1xuICAgICAgICAgICAgZmlsbDogJ2ZpbGwtb3BhY2l0eScsXG4gICAgICAgICAgICBjaXJjbGU6ICdjaXJjbGUtb3BhY2l0eScsXG4gICAgICAgICAgICBzeW1ib2w6ICdpY29uLW9wYWNpdHknLFxuICAgICAgICAgICAgJ2xpbmUnOiAnbGluZS1vcGFjaXR5JyxcbiAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbic6ICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5J1xuICAgICAgICB9O1xuXG4vLyByZXR1cm5zIGEgdmFsdWUgbGlrZSAnY2lyY2xlLW9wYWNpdHknLCBmb3IgYSBnaXZlbiBsYXllciBzdHlsZS5cbmZ1bmN0aW9uIGdldE9wYWNpdHlQcm9wcyhsYXllcikge1xuICAgIGxldCByZXQgPSBbb3BhY2l0eVByb3BbbGF5ZXIudHlwZV1dO1xuICAgIGlmIChsYXllci5sYXlvdXQgJiYgbGF5ZXIubGF5b3V0Wyd0ZXh0LWZpZWxkJ10pXG4gICAgICAgIHJldC5wdXNoKCd0ZXh0LW9wYWNpdHknKTtcbiAgICBcbiAgICByZXR1cm4gcmV0O1xufVxuXG4vL2ZhbHNlICYmIHdoZW5NYXBMb2FkZWQoKCkgPT5cbi8vICBzZXRWaXNDb2x1bW4oc291cmNlRGF0YS5udW1lcmljQ29sdW1uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmxlbmd0aCldKSk7XG5cbi8vIFRPRE8gZGVjaWRlIGlmIHRoaXMgc2hvdWxkIGJlIGluIE1hcFZpc1xuZnVuY3Rpb24gc2hvd0ZlYXR1cmVUYWJsZShmZWF0dXJlLCBzb3VyY2VEYXRhLCBtYXB2aXMpIHtcbiAgICBmdW5jdGlvbiByb3dzSW5BcnJheShhcnJheSwgY2xhc3NTdHIpIHtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+JyArIFxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZmVhdHVyZSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkgPT09IHVuZGVmaW5lZCB8fCBhcnJheS5pbmRleE9mKGtleSkgPj0gMClcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PlxuICAgICAgICAgICAgICAgICAgICBgPHRyPjx0ZCAke2NsYXNzU3RyfT4ke2tleX08L3RkPjx0ZD4ke2ZlYXR1cmVba2V5XX08L3RkPjwvdHI+YClcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJykgKyBcbiAgICAgICAgICAgICc8L3RhYmxlPic7XG4gICAgICAgIH1cblxuICAgIGlmIChmZWF0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQ2FsbGVkIGJlZm9yZSB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYW55dGhpbmdcbiAgICAgICAgZmVhdHVyZSA9IHt9O1xuICAgICAgICBzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG5cbiAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2x5Z29uJykgeyAvLyBUT0RPIGNoZWNrIHRoYXQgdGhpcyBpcyBhIGJsb2NrIGxvb2t1cCBjaG9yb3BsZXRoXG4gICAgICAgIGZlYXR1cmUgPSBzb3VyY2VEYXRhLmdldFJvd0ZvckJsb2NrKGZlYXR1cmUuYmxvY2tfaWQsIGZlYXR1cmUuY2Vuc3VzX3lyKTsgICAgICAgIFxuICAgIH1cblxuXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmVhdHVyZXMnKS5pbm5lckhUTUwgPSBcbiAgICAgICAgJzxoND5DbGljayBhIGZpZWxkIHRvIHZpc3VhbGlzZSB3aXRoIGNvbG91cjwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEudGV4dENvbHVtbnMsICdjbGFzcz1cImVudW0tZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBzaXplPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucywgJ2NsYXNzPVwibnVtZXJpYy1maWVsZFwiJykgKyBcbiAgICAgICAgJzxoND5PdGhlciBmaWVsZHM8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMsICcnKTtcblxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2ZlYXR1cmVzIHRkJykuZm9yRWFjaCh0ZCA9PiBcbiAgICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgIG1hcHZpcy5zZXRWaXNDb2x1bW4oZS50YXJnZXQuaW5uZXJUZXh0KSA7IC8vIFRPRE8gaGlnaGxpZ2h0IHRoZSBzZWxlY3RlZCByb3dcbiAgICAgICAgfSkpO1xufVxuXG52YXIgbGFzdEZlYXR1cmU7XG5cblxuZnVuY3Rpb24gY2hvb3NlRGF0YXNldCgpIHtcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCcnKTtcbiAgICB9XG5cbiAgICAvLyBrbm93biBDTFVFIGJsb2NrIGRhdGFzZXRzIHRoYXQgd29yayBva1xuICAgIHZhciBjbHVlQ2hvaWNlcyA9IFtcbiAgICAgICAgJ2IzNmota2l5NCcsIC8vIGVtcGxveW1lbnRcbiAgICAgICAgJzIzNHEtZ2c4MycsIC8vIGZsb29yIHNwYWNlIGJ5IHVzZSBieSBibG9ja1xuICAgICAgICAnYzNndC1ocno2JyAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cyAtLSB0aGlzIG9uZSBpcyBjb21wbGV0ZSwgdGhlIG90aGVycyBoYXZlIGdhcHB5IGRhdGEgZm9yIGNvbmZpZGVudGlhbGl0eVxuICAgIF07XG5cbiAgICAvLyBrbm93biBwb2ludCBkYXRhc2V0cyB0aGF0IHdvcmsgb2tcbiAgICB2YXIgcG9pbnRDaG9pY2VzID0gW1xuICAgICAgICAnZnAzOC13aXl5JywgLy8gdHJlZXNcbiAgICAgICAgJ3lnYXctNnJ6cScsIC8vIHBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uc1xuICAgICAgICAnODRiZi1kaWhpJywgLy8gVmVudWVzIGZvciBldmVudHNcbiAgICAgICAgJ3RkdmgtbjlkdicsIC8vIExpdmUgYmlrZSBzaGFyZVxuICAgICAgICAnZ2g3cy1xZGE4JywgLy8gREFNXG4gICAgICAgICdzZnJnLXp5Z2InLCAvLyBDYWZlcyBhbmQgUmVzdGF1cmFudHNcbiAgICAgICAgJ2V3NmstY2h6NCcsIC8vIEJpbyBCbGl0eiAyMDE2XG4gICAgICAgICc3dnJkLTRhdjUnLCAvLyB3YXlmaW5kaW5nXG4gICAgICAgICdzczc5LXY1NTgnLCAvLyBidXMgc3RvcHNcbiAgICAgICAgJ21mZmktbTl5bicsIC8vIHB1YnNcbiAgICAgICAgJ3N2dXgtYmFkYScsIC8vIHNvaWwgdGV4dHVyZXMgLSBuaWNlIG9uZVxuICAgICAgICAncWp3Yy1mNXNoJywgLy8gY29tbXVuaXR5IGZvb2QgZ3VpZGUgLSBnb29kXG4gICAgICAgICdmdGhpLXphanknLCAvLyBwcm9wZXJ0aWVzIG92ZXIgJDIuNW1cbiAgICAgICAgJ3R4OGgtMmpnaScsIC8vIGFjY2Vzc2libGUgdG9pbGV0c1xuICAgICAgICAnNnU1ei11YnZoJywgLy8gYmljeWNsZSBwYXJraW5nXG4gICAgICAgIC8vYnM3bi01dmVoLCAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cy4gMTAwLDAwMCByb3dzLCB0b28gZnJhZ2lsZS5cbiAgICAgICAgXTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uIGgxJykuaW5uZXJIVE1MID0gJ0xvYWRpbmcgcmFuZG9tIGRhdGFzZXQuLi4nO1xuICAgIHJldHVybiBwb2ludENob2ljZXNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogcG9pbnRDaG9pY2VzLmxlbmd0aCldO1xuICAgIC8vcmV0dXJuICdjM2d0LWhyejYnO1xufVxuXG5mdW5jdGlvbiBzaG93Q2FwdGlvbihuYW1lLCBkYXRhSWQsIGNhcHRpb24pIHtcbiAgICBsZXQgaW5jbHVkZU5vID0gZmFsc2U7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcHRpb24gaDEnKS5pbm5lckhUTUwgPSAoaW5jbHVkZU5vID8gKF9kYXRhc2V0Tm8gfHwgJycpOicnKSArIChjYXB0aW9uIHx8IG5hbWUgfHwgJycpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb290ZXIgLmRhdGFzZXQnKS5pbm5lckhUTUwgPSBuYW1lIHx8ICcnO1xuICAgIFxuICAgIC8vIFRPRE8gcmVpbnN0YXRlIGZvciBub24tZGVtbyBtb2RlLlxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NvdXJjZScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvZC8nICsgZGF0YUlkKTtcbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaGFyZScpLmlubmVySFRNTCA9IGBTaGFyZSB0aGlzOiA8YSBocmVmPVwiaHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH1cIj5odHRwczovL2NpdHktb2YtbWVsYm91cm5lLmdpdGh1Yi5pby9EYXRhM0QvIyR7ZGF0YUlkfTwvYT5gOyAgICBcbiBcbiB9XG5cbiBmdW5jdGlvbiB0d2Vha1BsYWNlTGFiZWxzKG1hcCwgdXApIHtcbiAgICBbJ3BsYWNlLXN1YnVyYicsICdwbGFjZS1uZWlnaGJvdXJob29kJ10uZm9yRWFjaChsYXllcklkID0+IHtcblxuICAgICAgICAvL3JnYigyMjcsIDQsIDgwKTsgQ29NIHBvcCBtYWdlbnRhXG4gICAgICAgIC8vbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXJJZCwgJ3RleHQtY29sb3InLCB1cCA/ICdyZ2IoMjI3LDQsODApJyA6ICdoc2woMCwwLDMwJSknKTsgLy8gQ29NIHBvcCBtYWdlbnRhXG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVySWQsICd0ZXh0LWNvbG9yJywgdXAgPyAncmdiKDAsMTgzLDc5KScgOiAnaHNsKDAsMCwzMCUpJyk7IC8vIENvTSBwb3AgZ3JlZW5cbiAgICAgICAgXG4gICAgfSk7XG4gfVxuXG4gZnVuY3Rpb24gdHdlYWtCYXNlbWFwKG1hcCkge1xuICAgIHZhciBwbGFjZWNvbG9yID0gJyM4ODgnOyAvLydyZ2IoMjA2LCAyMTksIDE3NSknO1xuICAgIHZhciByb2FkY29sb3IgPSAnIzc3Nyc7IC8vJ3JnYigyNDAsIDE5MSwgMTU2KSc7XG4gICAgbWFwLmdldFN0eWxlKCkubGF5ZXJzLmZvckVhY2gobGF5ZXIgPT4ge1xuICAgICAgICBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNjAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCAyMCUpJyk7XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDcwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA3OCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDQ1JSknKTsgLy8gcm9hZHMgbW9zdGx5XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDkwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgIH0pO1xuICAgIFsncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnXS5mb3JFYWNoKGlkID0+IHtcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoaWQsICd0ZXh0LWNvbG9yJywgJyMzMzMnKTtcbiAgICB9KTtcblxuICAgIG1hcC5yZW1vdmVMYXllcigncGxhY2UtY2l0eS1sZy1zJyk7IC8vIHJlbW92ZSB0aGUgTWVsYm91cm5lIGxhYmVsIGl0c2VsZi5cblxufVxuXG4vKlxuICBSZWZyZXNoIHRoZSBtYXAgdmlldyBmb3IgdGhpcyBuZXcgZGF0YXNldC5cbiovXG5mdW5jdGlvbiBzaG93RGF0YXNldChtYXAsIGRhdGFzZXQsIGZpbHRlciwgY2FwdGlvbiwgbm9GZWF0dXJlSW5mbywgb3B0aW9ucywgaW52aXNpYmxlKSB7XG4gICAgXG4gICAgb3B0aW9ucyA9IGRlZihvcHRpb25zLCB7fSk7XG4gICAgaWYgKGludmlzaWJsZSkge1xuICAgICAgICBvcHRpb25zLmludmlzaWJsZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy9zaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkLCBjYXB0aW9uKTtcbiAgICB9XG5cbiAgICBsZXQgbWFwdmlzID0gbmV3IE1hcFZpcyhtYXAsIGRhdGFzZXQsIGZpbHRlciwgIW5vRmVhdHVyZUluZm8/IHNob3dGZWF0dXJlVGFibGUgOiBudWxsLCBvcHRpb25zKTtcblxuICAgIHNob3dGZWF0dXJlVGFibGUodW5kZWZpbmVkLCBkYXRhc2V0LCBtYXB2aXMpOyBcbiAgICByZXR1cm4gbWFwdmlzO1xufVxuXG5mdW5jdGlvbiBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCkge1xuICAgIGlmICghbWFwLmdldFNvdXJjZShkYXRhc2V0Lm1hcGJveC5zb3VyY2UpKSB7XG4gICAgICAgIG1hcC5hZGRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlLCB7XG4gICAgICAgICAgICB0eXBlOiAndmVjdG9yJyxcbiAgICAgICAgICAgIHVybDogZGF0YXNldC5tYXBib3guc291cmNlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8qXG4gIFNob3cgYSBkYXRhc2V0IHRoYXQgYWxyZWFkeSBleGlzdHMgb24gTWFwYm94XG4qL1xuZnVuY3Rpb24gc2hvd01hcGJveERhdGFzZXQobWFwLCBkYXRhc2V0LCBpbnZpc2libGUpIHtcbiAgICBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCk7XG4gICAgbGV0IHN0eWxlID0gbWFwLmdldExheWVyKGRhdGFzZXQubWFwYm94LmlkKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIC8vaWYgKGludmlzaWJsZSlcbiAgICAgICAgICAgIC8vZGF0YXNldC5tYXBib3hcbiAgICAgICAgc3R5bGUgPSBjbG9uZShkYXRhc2V0Lm1hcGJveCk7XG4gICAgICAgIGlmIChpbnZpc2libGUpIHtcbiAgICAgICAgICAgIGdldE9wYWNpdHlQcm9wcyhzdHlsZSkuZm9yRWFjaChwcm9wID0+IHN0eWxlLnBhaW50W3Byb3BdID0gMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYXAuYWRkTGF5ZXIoc3R5bGUpO1xuICAgIH0gZWxzZSBpZiAoIWludmlzaWJsZSl7XG4gICAgICAgIGdldE9wYWNpdHlQcm9wcyhzdHlsZSkuZm9yRWFjaChwcm9wID0+XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShkYXRhc2V0Lm1hcGJveC5pZCwgcHJvcCwgZGVmKGRhdGFzZXQub3BhY2l0eSwwLjkpKSk7XG4gICAgfVxuICAgIGRhdGFzZXQuX2xheWVySWQgPSBkYXRhc2V0Lm1hcGJveC5pZDtcblxuICAgIC8vaWYgKCFpbnZpc2libGUpIFxuICAgICAgICAvLyBzdXJlbHkgdGhpcyBpcyBhbiBlcnJvciAtIG1hcGJveCBkYXRhc2V0cyBkb24ndCBoYXZlICdkYXRhSWQnXG4gICAgICAgIC8vc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgZGF0YXNldC5jYXB0aW9uKTtcbn1cblxuZnVuY3Rpb24gcHJlbG9hZERhdGFzZXQobWFwLCBkKSB7XG4gICAgY29uc29sZS5sb2coJ1ByZWxvYWQ6ICcgKyBkLmNhcHRpb24pO1xuICAgIGlmIChkLm1hcGJveCkge1xuXG4gICAgICAgIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZCwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChkLmRhdGFzZXQpIHtcbiAgICAgICAgZC5tYXB2aXMgPSBzaG93RGF0YXNldChtYXAsIGQuZGF0YXNldCwgZC5maWx0ZXIsIGQuY2FwdGlvbiwgdHJ1ZSwgZC5vcHRpb25zLCAgdHJ1ZSk7XG4gICAgICAgIGQubWFwdmlzLnNldFZpc0NvbHVtbihkLmNvbHVtbik7XG4gICAgICAgIGQuX2xheWVySWQgPSBkLm1hcHZpcy5sYXllcklkO1xuICAgIH1cbn1cbi8vIFR1cm4gaW52aXNpYmxlIGRhdGFzZXQgaW50byB2aXNpYmxlXG5mdW5jdGlvbiByZXZlYWxEYXRhc2V0KG1hcCwgZCkge1xuICAgIGNvbnNvbGUubG9nKCdSZXZlYWw6ICcgKyBkLmNhcHRpb24gICsgYCAoJHtfZGF0YXNldE5vfSlgKTtcbiAgICAvLyBUT0RPIGNoYW5nZSAwLjkgdG8gc29tZXRoaW5nIHNwZWNpZmljIGZvciBlYWNoIHR5cGVcbiAgICBpZiAoZC5tYXBib3ggfHwgZC5kYXRhc2V0KSB7XG4gICAgICAgIGdldE9wYWNpdHlQcm9wcyhtYXAuZ2V0TGF5ZXIoZC5fbGF5ZXJJZCkpLmZvckVhY2gocHJvcCA9PlxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoZC5fbGF5ZXJJZCwgcHJvcCwgZGVmKGQub3BhY2l0eSwgMC45KSkpO1xuICAgIH0gZWxzZSBpZiAoZC5wYWludCkge1xuICAgICAgICBkLl9vbGRQYWludCA9IFtdO1xuICAgICAgICBkLnBhaW50LmZvckVhY2gocGFpbnQgPT4ge1xuICAgICAgICAgICAgZC5fb2xkUGFpbnQucHVzaChbcGFpbnRbMF0sIHBhaW50WzFdLCBtYXAuZ2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0pXSk7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0sIHBhaW50WzJdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkLmNhcHRpb24pIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgfSBlbHNlIGlmIChkLmRhdGFzZXQpIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZC5kYXRhc2V0Lm5hbWUsIGQuZGF0YXNldC5kYXRhSWQsIGQuY2FwdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKGQuc3VwZXJDYXB0aW9uKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbicpLmNsYXNzTGlzdC5hZGQoJ3N1cGVyY2FwdGlvbicpO1xufVxuLy8gUmVtb3ZlIHRoZSBkYXRhc2V0IGZyb20gdGhlIG1hcCwgbGlrZSBpdCB3YXMgbmV2ZXIgbG9hZGVkLlxuZnVuY3Rpb24gcmVtb3ZlRGF0YXNldChtYXAsIGQpIHtcbiAgICBjb25zb2xlLmxvZygnUmVtb3ZlOiAnICsgZC5jYXB0aW9uICArIGAgKCR7X2RhdGFzZXROb30pYCk7XG4gICAgaWYgKGQubWFwdmlzKVxuICAgICAgICBkLm1hcHZpcy5yZW1vdmUoKTtcbiAgICBcbiAgICBpZiAoZC5tYXBib3gpXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihkLm1hcGJveC5pZCk7XG5cbiAgICBpZiAoZC5wYWludCAmJiAhZC5rZWVwUGFpbnQpIC8vIHJlc3RvcmUgcGFpbnQgc2V0dGluZ3MgYmVmb3JlIHRoZXkgd2VyZSBtZXNzZWQgdXBcbiAgICAgICAgZC5fb2xkUGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0sIHBhaW50WzJdKTtcbiAgICAgICAgfSk7XG5cbiAgICBpZiAoZC5zdXBlckNhcHRpb24pXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnc3VwZXJjYXB0aW9uJyk7XG5cbiAgICBkLl9sYXllcklkID0gdW5kZWZpbmVkO1xufVxuXG5cblxubGV0IF9kYXRhc2V0Tm89Jyc7XG4vKiBBZHZhbmNlIGFuZCBkaXNwbGF5IHRoZSBuZXh0IGRhdGFzZXQgaW4gb3VyIGxvb3AgXG5FYWNoIGRhdGFzZXQgaXMgcHJlLWxvYWRlZCBieSBiZWluZyBcInNob3duXCIgaW52aXNpYmxlIChvcGFjaXR5IDApLCB0aGVuIFwicmV2ZWFsZWRcIiBhdCB0aGUgcmlnaHQgdGltZS5cblxuICAgIC8vIFRPRE8gY2xlYW4gdGhpcyB1cCBzbyByZWxhdGlvbnNoaXAgYmV0d2VlbiBcIm5vd1wiIGFuZCBcIm5leHRcIiBpcyBjbGVhcmVyLCBubyByZXBldGl0aW9uLlxuXG4qL1xuZnVuY3Rpb24gbmV4dERhdGFzZXQobWFwLCBkYXRhc2V0Tm8sIHJlbW92ZUZpcnN0KSB7XG4gICAgLy8gSW52aXNpYmx5IGxvYWQgZGF0YXNldCBpbnRvIHRoZSBtYXAuXG4gICAgZnVuY3Rpb24gZGVsYXkoZiwgbXMpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gIXdpbmRvdy5zdG9wcGVkICYmIGYoKSwgbXMpO1xuICAgIH1cblxuICAgIF9kYXRhc2V0Tm8gPSBkYXRhc2V0Tm87XG4gICAgbGV0IGQgPSBkYXRhc2V0c1tkYXRhc2V0Tm9dLCBcbiAgICAgICAgbmV4dEQgPSBkYXRhc2V0c1soZGF0YXNldE5vICsgMSkgJSBkYXRhc2V0cy5sZW5ndGhdO1xuXG4gICAgaWYgKHJlbW92ZUZpcnN0KVxuICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbKGRhdGFzZXRObyAtIDEgKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoXSk7XG5cbiAgICAvLyBpZiBmb3Igc29tZSByZWFzb24gdGhpcyBkYXRhc2V0IGhhc24ndCBhbHJlYWR5IGJlZW4gbG9hZGVkLlxuICAgIGlmICghZC5fbGF5ZXJJZCkge1xuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGQpO1xuICAgIH1cbiAgICBpZiAoZC5fbGF5ZXJJZCAmJiAhbWFwLmdldExheWVyKGQuX2xheWVySWQpKVxuICAgICAgICB0aHJvdyAnSGVscDogTGF5ZXIgbm90IGxvYWRlZDogJyArIGQuX2xheWVySWQ7XG4gICAgcmV2ZWFsRGF0YXNldChtYXAsIGQpO1xuICAgICAgICBcblxuICAgIC8vIGxvYWQsIGJ1dCBkb24ndCBzaG93LCBuZXh0IG9uZS4gLy8gQ29tbWVudCBvdXQgdGhlIG5leHQgbGluZSB0byBub3QgZG8gdGhlIHByZS1sb2FkaW5nIHRoaW5nLlxuICAgIC8vIHdlIHdhbnQgdG8gc2tpcCBcImRhdGFzZXRzXCIgdGhhdCBhcmUganVzdCBjYXB0aW9ucyBldGMuXG4gICAgbGV0IG5leHRSZWFsRGF0YXNldE5vID0gKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoO1xuICAgIHdoaWxlIChkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10gJiYgIWRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXS5kYXRhc2V0ICYmICFkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10ubWFwYm94ICYmIG5leHRSZWFsRGF0YXNldE5vIDwgZGF0YXNldHMubGVuZ3RoKVxuICAgICAgICBuZXh0UmVhbERhdGFzZXRObyArKztcbiAgICBpZiAoZGF0YXNldHNbbmV4dFJlYWxEYXRhc2V0Tm9dKVxuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXSk7XG5cbiAgICBpZiAoZC5zaG93TGVnZW5kKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmRzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFdlJ3JlIGFpbWluZyB0byBhcnJpdmUgYXQgdGhlIHZpZXdwb2ludCAxLzMgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgYXBwZWFyYW5jZVxuICAgIC8vIGFuZCBsZWF2ZSAyLzMgb2YgdGhlIHdheSB0aHJvdWdoLlxuICAgIGlmIChkLmZseVRvICYmICFtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgICBkLmZseVRvLmR1cmF0aW9uID0gZC5kZWxheS8zOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgbWFwLmZseVRvKGQuZmx5VG8sIHsgc291cmNlOiAnbmV4dERhdGFzZXQnfSk7XG4gICAgfVxuICAgIFxuICAgIGlmIChuZXh0RC5mbHlUbykge1xuICAgICAgICAvLyBnb3QgdG8gYmUgY2FyZWZ1bCBpZiB0aGUgZGF0YSBvdmVycmlkZXMgdGhpcyxcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkZWYobmV4dEQuZmx5VG8uZHVyYXRpb24sIGQuZGVsYXkvMyArIG5leHRELmRlbGF5LzMpOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgZGVsYXkoKCkgPT4gbWFwLmZseVRvKG5leHRELmZseVRvLCB7IHNvdXJjZTogJ25leHREYXRhc2V0J30pLCBkLmRlbGF5ICogMi8zKTtcbiAgICB9XG5cbiAgICBkZWxheSgoKSA9PiByZW1vdmVEYXRhc2V0KG1hcCwgZCksIGQuZGVsYXkgKyBkZWYoZC5saW5nZXIsIDApKTsgLy8gb3B0aW9uYWwgXCJsaW5nZXJcIiB0aW1lIGFsbG93cyBvdmVybGFwLiBOb3QgZ2VuZXJhbGx5IG5lZWRlZCBzaW5jZSB3ZSBpbXBsZW1lbnRlZCBwcmVsb2FkaW5nLlxuICAgIFxuICAgIGRlbGF5KCgpID0+IG5leHREYXRhc2V0KG1hcCwgKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoKSwgZC5kZWxheSApO1xufVxuXG4vKiBQcmUgZG93bmxvYWQgYWxsIG5vbi1tYXBib3ggZGF0YXNldHMgaW4gdGhlIGxvb3AgKi9cbmZ1bmN0aW9uIGxvYWREYXRhc2V0cyhtYXApIHtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGRhdGFzZXRzLm1hcChkID0+IHsgXG4gICAgICAgICAgICBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcgZGF0YXNldCAnICsgZC5kYXRhc2V0LmRhdGFJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQuZGF0YXNldC5sb2FkKCk7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pKS50aGVuKCgpID0+IGRhdGFzZXRzWzBdLmRhdGFzZXQpO1xufVxuXG5mdW5jdGlvbiBsb2FkT25lRGF0YXNldCgpIHtcbiAgICBsZXQgZGF0YXNldCA9IGNob29zZURhdGFzZXQoKTtcbiAgICByZXR1cm4gbmV3IFNvdXJjZURhdGEoZGF0YXNldCkubG9hZCgpO1xuICAgIC8qaWYgKGRhdGFzZXQubWF0Y2goLy4uLi4tLi4uLi8pKVxuICAgICAgICBcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7Ki9cbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICB9XG5cblxuICAgIGxldCBkZW1vTW9kZSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAnI2RlbW8nO1xuICAgIGlmIChkZW1vTW9kZSkge1xuICAgICAgICAvLyBpZiB3ZSBkaWQgdGhpcyBhZnRlciB0aGUgbWFwIHdhcyBsb2FkaW5nLCBjYWxsIG1hcC5yZXNpemUoKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlYXR1cmVzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIC8vIEZvciBwZW9wbGUgd2hvIHdhbnQgdGhlIHNjcmlwdC4gICAgICAgIFxuICAgICAgICB3aW5kb3cuY2FwdGlvbnMgPSBkYXRhc2V0cy5tYXAoZCA9PiBgJHtkLmNhcHRpb259ICgke2QuZGVsYXkgLyAxMDAwfXMpYCkuam9pbignXFxuJyk7XG4gICAgfVxuXG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9NScsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDEzLC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCh7Y29tcGFjdDp0cnVlfSksICd0b3AtcmlnaHQnKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywgKCkgPT4gdHdlYWtCYXNlbWFwKG1hcCkpO1xuICAgIC8vbWFwLm9uY2UoJ2xvYWQnLCgpID0+IHR3ZWFrUGxhY2VMYWJlbHMobWFwLHRydWUpKTtcbiAgICAvL3NldFRpbWVvdXQoKCk9PnR3ZWFrUGxhY2VMYWJlbHMobWFwLCBmYWxzZSksIDgwMDApO1xuICAgIG1hcC5vbignbW92ZWVuZCcsIChlLGRhdGEpPT4ge1xuICAgICAgICBpZiAoZS5zb3VyY2UgPT09ICduZXh0RGF0YXNldCcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICAgICAgY2VudGVyOiBtYXAuZ2V0Q2VudGVyKCksXG4gICAgICAgICAgICB6b29tOiBtYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgYmVhcmluZzogbWFwLmdldEJlYXJpbmcoKSxcbiAgICAgICAgICAgIHBpdGNoOiBtYXAuZ2V0UGl0Y2goKVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAvKm1hcC5vbignZXJyb3InLCBlID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTsqL1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZT0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlLmtleUNvZGUpO1xuICAgICAgICAvLyAsIGFuZCAuIHN0b3AgdGhlIGFuaW1hdGlvbiBhbmQgYWR2YW5jZSBmb3J3YXJkL2JhY2tcbiAgICAgICAgaWYgKFsxOTAsIDE4OF0uaW5kZXhPZihlLmtleUNvZGUpID4gLTEgJiYgZGVtb01vZGUpIHtcbiAgICAgICAgICAgIG1hcC5zdG9wKCk7XG4gICAgICAgICAgICB3aW5kb3cuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbX2RhdGFzZXROb10pO1xuICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAoX2RhdGFzZXRObyArIHsxOTA6IDEsIDE4ODogLTF9W2Uua2V5Q29kZV0gKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDMyICYmIGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAvLyBTcGFjZSA9IHN0YXJ0L3N0b3BcbiAgICAgICAgICAgIHdpbmRvdy5zdG9wcGVkID0gIXdpbmRvdy5zdG9wcGVkO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5zdG9wcGVkKVxuICAgICAgICAgICAgICAgIG1hcC5zdG9wKCk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbX2RhdGFzZXROb10pO1xuICAgICAgICAgICAgICAgIG5leHREYXRhc2V0KG1hcCwgX2RhdGFzZXRObyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIChkZW1vTW9kZSA/IGxvYWREYXRhc2V0cyhtYXApIDogbG9hZE9uZURhdGFzZXQoKSlcbiAgICAudGhlbihkYXRhc2V0ID0+IHtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsMSk7IC8vIGRvZXMgdGhpcyBoaWRlIHRoZSBhZGRyZXNzIGJhcj8gTm9wZSAgICBcbiAgICAgICAgaWYgKGRhdGFzZXQpIFxuICAgICAgICAgICAgc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCk7XG5cbiAgICAgICAgd2hlbk1hcExvYWRlZChtYXAsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAyOCk7IC8vIHdoaWNoIGRhdGFzZXQgdG8gc3RhcnQgYXQuICgwIGZvciBwcm9kKVxuICAgICAgICAgICAgICAgIC8vdmFyIGZwID0gbmV3IEZsaWdodFBhdGgobWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0RhdGFzZXQobWFwLCBkYXRhc2V0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsb2FkaW5nJykub3V0ZXJIVE1MPScnO1xuICAgICAgICB9KTtcbiAgICAgICAgXG5cbiAgICB9KTtcbn0pKCk7XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuLypcblN1Z2dlc3Rpb25zOlxuXG5UaGlzIGlzIE1lbGJvdXJuZVxuSGVyZSBhcmUgb3VyIHByZWNpbmN0c1xuQXMgeW91J2QgZ3Vlc3MsIHdlIGhhdmUgYSBsb3Qgb2YgZGF0YTpcbi0gYWRkcmVzc2VzLCBib3VuZGFyaWVzXG5cblxuMS4gT3JpZW50IHdpdGggcHJlY2luY3RzXG5cbjIuIEJ1dCB3ZSBhbHNvIGhhdmU6IFxuLSB3ZWRkaW5nXG4tIGJpbiBuaWdodHNcbi0gZG9ncyBsYXN0IFxuLSB0b2lsZXRzXG4tLSBhbGxcbi0tIHdoZWVsY2hhaXJzIHdpdGggaWNvbnNcblxuKi9cblxuXG5cblxuXG4vKlxuSW50cm9cbi0gT3ZlcnZpZXcgKHN1YnVyYiBuYW1lcyBoaWdobGlnaHRlZClcbi0gUHJvcGVydHkgYm91bmRhcmllc1xuLSBTdHJlZXQgYWRkcmVzc2VzXG5cblVyYmFuIGZvcmVzdDpcbi0gZWxtc1xuLSBndW1zXG4tIHBsYW5lc1xuLSBhbGxcblxuQ0xVRVxuLSBlbXBsb3ltZW50XG4tIHRyYW5zcG9ydCBzZWN0b3Jcbi0gc29jaWFsL2hlYWx0aCBzZWN0b3JcblxuREFNXG4tIGFwcGxpY2F0aW9uc1xuLSBjb25zdHJ1Y3Rpb25cbi0gY29tcGxldGVkXG5cbkRpZCB5b3Uga25vdzpcbi0gY29tbXVuaXR5IGZvb2Rcbi0gR2FyYmFnZSBDb2xsZWN0aW9uIFpvbmVzXG4tIEJvb2thYmxlIEV2ZW50IFZlbnVlc1xuLS0gd2VkZGluZ2FibGVcbi0tIGFsbFxuLSBUb2lsZXRzXG4tLSBhbGwgXG4tLSBhY2Nlc3NpYmxlXG4tIENhZmVzIGFuZCBSZXN0YXVyYW50c1xuLSBEb2cgd2Fsa2luZyB6b25lc1xuXG5GaW5hbGU6XG4tIFNreWxpbmVcbi0gV2hhdCBjYW4geW91IGRvIHdpdGggb3VyIG9wZW4gZGF0YT9cblxuXG5HYXJiYWdlIENvbGxlY3Rpb24gWm9uZXNcbkRvZyBXYWxraW5nIFpvbmVzIG9mZi1sZWFzaFxuQmlrZSBTaGFyZSBTdGF0aW9uc1xuQm9va2FibGUgRXZlbnQgVmVudWVzXG4tIHdlZGRpbmdhYmxlXG5cblxuR3JhbmQgZmluYWxlIFwiV2hhdCBjYW4geW91IGRvIHdpdGggb3VyIG9wZW4gZGF0YVwiP1xuLSBidWlsZGluZ3Ncbi0gY2FmZXNcbi0gXG5cblxuXG5UaGVzZSBuZWVkIGEgaG9tZTpcbi0gYmlrZSBzaGFyZSBzdGF0aW9uc1xuLSBwZWRlc3RyaWFuIHNlbnNvcnNcbi0gYWRkcmVzc2VzXG4tIHByb3BlcnR5IGJvdW5kYXJpZXNcbi0gYnVpbGRpbmdzXG4tIGNhZmVzXG4tIGNvbW11bml0eSBmb29kXG5cblxuXG4qL1xuXG5cblxuXG5cblxuXG5cblxuXG4vKlxuXG5EYXRhc2V0IHJ1biBvcmRlclxuLSBidWlsZGluZ3MgKDNEKVxuLSB0cmVlcyAoZnJvbSBteSBvcGVudHJlZXMgYWNjb3VudClcbi0gY2FmZXMgKGNpdHkgb2YgbWVsYm91cm5lLCBzdHlsZWQgd2l0aCBjb2ZmZWUgc3ltYm9sKVxuLSBiYXJzIChzaW1pbGFyKVxuLSBnYXJiYWdlIGNvbGxlY3Rpb24gem9uZXNcbi0gZG9nIHdhbGtpbmcgem9uZXNcbi0gQ0xVRSAoM0QgYmxvY2tzKVxuLS0gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMgcGVyIGJsb2NrXG4tLS0gdmFyaW91cyB0eXBlcywgdGhlbiB0b3RhbFxuLS0gZW1wbG95bWVudCAodmFyaW91cyB0eXBlcyB3aXRoIHNwZWNpZmljIHZhbnRhZ2UgcG9pbnRzIC0gYmV3YXJlIHRoYXQgbm90IGFsbCBkYXRhIGluY2x1ZGVkOyB0aGVuIHRvdGFsKVxuLS0gZmxvb3IgdXNlIChkaXR0bylcblxuXG5cblxuTWluaW11bVxuLSBmbG9hdHkgY2FtZXJhc1xuLSBjbHVlIDNELFxuLSBiaWtlIHNoYXJlIHN0YXRpb25zXG5cbkhlYWRlcjpcbi0gZGF0YXNldCBuYW1lXG4tIGNvbHVtbiBuYW1lXG5cbkZvb3RlcjogZGF0YS5tZWxib3VybmUudmljLmdvdi5hdVxuXG5Db00gbG9nb1xuXG5cbk1lZGl1bVxuLSBNdW5pY2lwYWxpdHkgYm91bmRhcnkgb3ZlcmxhaWRcblxuU3RyZXRjaCBnb2Fsc1xuLSBvdmVybGF5IGEgdGV4dCBsYWJlbCBvbiBhIGJ1aWxkaW5nL2NsdWVibG9jayAoZWcsIEZyZWVtYXNvbnMgSG9zcGl0YWwgLSB0byBzaG93IHdoeSBzbyBtdWNoIGhlYWx0aGNhcmUpXG5cblxuXG5cblxuKi9cblxuXG5jb25zdCBDb00gPSB7XG4gICAgYmx1ZTogJ3JnYigwLDE3NCwyMDMpJyxcbiAgICBtYWdlbnRhOidyZ2IoMjI3LCA0LCA4MCknLFxuICAgIGdyZWVuOiAncmdiKDAsMTgzLDc5KSdcbn07XG5Db00uZW51bUNvbG9ycyA9IFtDb00uYmx1ZSwgQ29NLm1hZ2VudGEsIENvTS5ncmVlbl07XG5cbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuXG5leHBvcnQgY29uc3QgZGF0YXNldHMgPSBbXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidNZWxib3VybmUgaGFzIGEgbG90IG9mIGRhdGEuJyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OjgwMDAsXG4gICAgICAgIGNhcHRpb246J1RoaXMgaXMgTWVsYm91cm5lJyxcbiAgICAgICAgcGFpbnQ6IFtcbiAgICAgICAgICAgIFsncGxhY2Utc3VidXJiJywgJ3RleHQtY29sb3InLCAncmdiKDAsMTgzLDc5KSddLFxuICAgICAgICAgICAgWydwbGFjZS1uZWlnaGJvdXJob29kJywgJ3RleHQtY29sb3InLCAncmdiKDAsMTgzLDc5KSddXG4gICAgICAgIF0sXG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBmbHlUbzoge2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sem9vbToxMyxwaXRjaDo0NSxiZWFyaW5nOjB9XG5cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAsXG4gICAgICAgIG5hbWU6ICdQcm9wZXJ0eSBib3VuZGFyaWVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1dlIGhhdmUgZGF0YSBsaWtlIHByb3BlcnR5IGJvdW5kYXJpZXMgZm9yIHBsYW5uaW5nJyxcbiAgICAgICAgb3BhY2l0eTogMSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMtMScsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MTAwMCwgLy8ganVzdCB0byBhdm9pZCBmbGFzaFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxNCxiZWFyaW5nOjAscGl0Y2g6MCwgZHVyYXRpb246MTAwMDB9LFxuICAgIH0sXG4gICAgLy8gcmVwZWF0IC0ganVzdCB0byBmb3JjZSB0aGUgdGltaW5nXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGxpbmdlcjozMDAwLFxuICAgICAgICBuYW1lOiAnUHJvcGVydHkgYm91bmRhcmllcycsXG4gICAgICAgIGNhcHRpb246ICdXZSBoYXZlIGRhdGEgbGlrZSBwcm9wZXJ0eSBib3VuZGFyaWVzIGZvciBwbGFubmluZycsXG4gICAgICAgIG9wYWNpdHk6MSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMtMicsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBqdXN0IHJlcGVhdCBwcmV2aW91cyB2aWV3LlxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjE0MDAwLFxuICAgICAgICBuYW1lOiAnU3RyZWV0IGFkZHJlc3NlcycsXG4gICAgICAgIGNhcHRpb246ICdBcyB5b3VcXCdkIGd1ZXNzLCB3ZSBoYXZlIGRhdGEgbGlrZSBldmVyeSBzdHJlZXQgYWRkcmVzcycsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWRkcmVzc2VzJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnU3RyZWV0X2FkZHJlc3Nlcy05N2U1b24nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7c3RyZWV0X25vfScsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IDEwLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBuZWFyIHVuaS1pc2hcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDAxNzM2NDI2MDY4LFwibGF0XCI6LTM3Ljc5NzcwNzk4ODYwMTIzfSxcInpvb21cIjoxOCxcImJlYXJpbmdcIjotNDUuNzAyMDMwNDA1MDYwODQsXCJwaXRjaFwiOjQ4LCBkdXJhdGlvbjoxNDAwMH1cbiAgICAgICAgLy8gcm91bmRhYm91dCBvZiBkZWF0aCBsb29rbmcgbndcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTEwNDg3MDYxMTg0LFwibGF0XCI6LTM3LjgwMDYxMDg4OTcxNzMyfSxcInpvb21cIjoxOC41NzIyMDQ3ODI4MTkxOTUsXCJiZWFyaW5nXCI6LTIwLjQzNTYzNjY5MTY0MzgyMixcInBpdGNoXCI6NTcuOTk5OTk5OTk5OTk5OTl9XG4gICAgfSxcblxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBoZWFsdGggYW5kIHR5cGUgb2YgZWFjaCB0cmVlIGluIG91ciB1cmJhbiBmb3Jlc3QnLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuNlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnVWxtdXMnIF1cblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzY3NDE1NDE4MjY2LFwibGF0XCI6LTM3Ljc5MTY4NjYxOTc3Mjk3NX0sXCJ6b29tXCI6MTUuNDg3MzM3NDU3MzU2NjkxLFwiYmVhcmluZ1wiOi0xMjIuNDAwMDAwMDAwMDAwMDksXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sKi9cbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J1VyYmFuIEZvcmVzdCcsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgVXJiYW4gRm9yZXN0IGNvbnRhaW5zIGV2ZXJ5IGVsbSB0cmVlLi4uJyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzAsIDgwJSwgNTYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdVbG11cycgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzMTM4LFwibGF0XCI6LTM3Ljc4ODg0M30sXCJ6b29tXCI6MTUuMixcImJlYXJpbmdcIjotMTA2LjE0LFwicGl0Y2hcIjo1NX1cblxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJy4uLmV2ZXJ5IGd1bSB0cmVlLi4uJywgLy8gYWRkIGEgbnVtYmVyXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2d1bXRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAzLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdFdWNhbHlwdHVzJywgJ0NvcnltYmlhJywgJ0FuZ29waG9yYScgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC44NDczNzQ4ODY4OTA3LFwibGF0XCI6LTM3LjgxMTc3OTc0MDc4NzI0NH0sXCJ6b29tXCI6MTMuMTYyNTI0MTUwODQ3MzE1LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MjAwLFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MjczMjU2NzMzMzEsXCJsYXRcIjotMzcuNzg0NDQ5NDA1OTMwMzh9LFwiem9vbVwiOjE0LjUsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA4MDAwLFxuICAgICAgICAvL2RhdGFzZXRMZWFkOiAzMDAwLFxuICAgICAgICBjYXB0aW9uOiAnLi4uYW5kIGV2ZXJ5IHBsYW5lIHRyZWUuJywgLy8gYWRkIGEgbnVtYmVyXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ3BsYW5ldHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDM0MCwgOTclLDY1JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnUGxhdGFudXMnIF1cbiAgICAgICAgICAgIFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzOTQ2MzM4Mzg5NjUsXCJsYXRcIjotMzcuNzk1ODg4NzA2NjgyNzF9LFwiem9vbVwiOjE1LjkwNTEzMDM2MTQ0NjY2OCxcImJlYXJpbmdcIjoxNTcuNTk5OTk5OTk5OTk3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU1MyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzYzOTR9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE0Nzg1MTAwMTYyMDIsXCJsYXRcIjotMzcuNzg0MzQxNDcxNjc0Nzd9LFwiem9vbVwiOjEzLjkyMjIyODQ2MTc5MzY2OSxcImJlYXJpbmdcIjoxMjIuOTk0NzgzNDYwNDM0NixcInBpdGNoXCI6NDcuNTAwMDAwMDAwMDAwMDN9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTM0MzQ1MDc1NTE2LFwibGF0XCI6LTM3LjgwMTM0MTE4MDEyNTIyfSxcInpvb21cIjoxNSxcImJlYXJpbmdcIjoxNTEuMDAwNzMwNDg4MjczMzgsXCJwaXRjaFwiOjU4Ljk5OTk5OTk5OTk5OTk5fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU2MTM4ODQ4ODQwOSxcImxhdFwiOi0zNy44MDkwMjcxMDUzMTYzMn0sXCJ6b29tXCI6MTQuMjQxNzU3MDMwODE2NjM2LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdOZWFybHkgNzAsMDAwIHRyZWVzIGluIGFsbC4nLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MTkxMTU3MDAwMDM0LFwibGF0XCI6LTM3LjgwMDM2NzA5MjE0MDIyfSxcInpvb21cIjoxNC4xLFwiYmVhcmluZ1wiOjE0NC45MjcyODM5Mjc0MjY5NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjE0Ny42NTIxOTM4MjM3MzEwNyxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonQ2Vuc3VzIG9mIExhbmQgVXNlIGFuZCBFbXBsb3ltZW50IChDTFVFKScsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAgXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIFxuICAgICAgICBjb2x1bW46ICdUb3RhbCBlbXBsb3ltZW50IGluIGJsb2NrJyAsXG4gICAgICAgIGNhcHRpb246ICdDTFVFIHJldmVhbHMgd2hlcmUgZW1wbG95bWVudCBpcyBjb25jZW50cmF0ZWQnLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTcsXCJsYXRcIjotMzcuODA0Mzg1OTQ5Mjc2NDk0fSxcInpvb21cIjoxMy44ODYyODczMjAxNTk4MSxcImJlYXJpbmdcIjoxMTkuNzg4Njg2ODI4ODIzNzQsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU5ODUzMzQ1NjIxNCxcImxhdFwiOi0zNy44MzU4MTkxNjI0MzY2MX0sXCJ6b29tXCI6MTMuNjQ5MTE2NjE0ODcyODM2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuICAgIH0sXG5cbiAgICAvKntcbiAgICAgICAgZGVsYXk6MTIwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGVyZSB0aGUgQ291bmNpbFxcJ3Mgc2lnbmlmaWNhbnQgcHJvcGVydHkgaG9sZGluZ3MgYXJlIGxvY2F0ZWQuJyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2Z0aGktemFqeScpLFxuICAgICAgICBjb2x1bW46ICdPd25lcnNoaXAgb3IgQ29udHJvbCcsXG4gICAgICAgIHNob3dMZWdlbmQ6IHRydWUsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzOTAzMDg3MjM4NDYsXCJsYXRcIjotMzcuODE4NjMxNjYwODEwNDI1fSxcInpvb21cIjoxMy41LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuXG4gICAgfSxcbiAgICAqL1xuICAgICBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdUcmFuc3BvcnQsIFBvc3RhbCBhbmQgU3RvcmFnZScgLFxuICAgICAgICBjYXB0aW9uOiAnLi4ud2hlcmUgdGhlIHRyYW5zcG9ydCwgcG9zdGFsIGFuZCBzdG9yYWdlIHNlY3RvciBpcyBsb2NhdGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI3NjgxNzY3MTA3MTIsXCJsYXRcIjotMzcuODI5MjE4MjQ4NTg3MjQ2fSxcInpvb21cIjoxMi43Mjg0MzEyMTc5MTQ5MTksXCJiZWFyaW5nXCI6NjguNzAzODgzMTIxODc0NTgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnSGVhbHRoIENhcmUgYW5kIFNvY2lhbCBBc3Npc3RhbmNlJyAsXG4gICAgICAgIGNhcHRpb246ICdhbmQgd2hlcmUgdGhlIGhlYWx0aGNhcmUgYW5kIHNvY2lhbCBhc3Npc3RhbmNlIG9yZ2FuaXNhdGlvbnMgYXJlIGJhc2VkLicsXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTcyMzMxMTIxODUzLFwibGF0XCI6LTM3LjgyNzA2Mzc0NzYzODI0fSxcInpvb21cIjoxMy4wNjM3NTczODYyMzIyNDIsXCJiZWFyaW5nXCI6MjYuMzc0Nzg2OTE4NTIzMzQsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidEZXZlbG9wbWVudCBBY3Rpdml0eSBNb25pdG9yIChEQU0pJyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNzAwMCwgXG4gICAgICAgIGxpbmdlcjo5MDAwLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgb3B0aW9uczogeyBlbnVtQ29sb3JzOiBDb00uZW51bUNvbG9yc30sXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUExJRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnREFNIHRyYWNrcyBtYWpvciBwcm9qZWN0cyBpbiB0aGUgcGxhbm5pbmcgc3RhZ2UuLi4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDQwMDAsXG4gICAgICAgIGxpbmdlcjo1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgb3B0aW9uczogeyBlbnVtQ29sb3JzOiBDb00uZW51bUNvbG9yc30sXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsICAgICAgICAgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5wcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgb3B0aW9uczogeyBlbnVtQ29sb3JzOiBDb00uZW51bUNvbG9yc30sXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdDT01QTEVURUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnLi4uYW5kIHRob3NlIGFscmVhZHkgY29tcGxldGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG4vLyoqKioqKioqKioqKioqKioqKioqKiAgXCJCdXQgZGlkIHlvdSBrbm93XCIgZGF0YVxuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdCdXQgZGlkIHlvdSBrbm93IHdlIGhhdmUgZGF0YSBhYm91dCBoZWFsdGh5LCBhZmZvcmRhYmxlIGZvb2Qgc2VydmljZXM/JyxcbiAgICAgICAgbmFtZTogJ0NvbW11bml0eSBmb29kIHNlcnZpY2VzIHdpdGggb3BlbmluZyBob3VycywgcHVibGljIHRyYW5zcG9ydCBhbmQgcGFya2luZyBvcHRpb25zJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2Zvb2QnLFxuICAgICAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuN3h2azBrM2wnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdDb21tdW5pdHlfZm9vZF9zZXJ2aWNlc193aXRoXy1hN2NqOXYnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdoc2woMzAsIDgwJSwgNTYlKScgLy8gYnJpZ2h0IG9yYW5nZVxuICAgICAgICAgICAgICAgIC8vJ3RleHQtY29sb3InOiAncmdiKDI0OSwgMjQzLCAxNzgpJywgLy8gbXV0ZWQgb3JhbmdlLCBhIGNpdHkgZm9yIHBlb3BsZVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tOYW1lfScsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IDEyLFxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vc291dGggTWVsYm91cm5lIGlzaFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2ODQ0NTA3NjYzNTQyLFwibGF0XCI6LTM3LjgyNDU5OTQ5MTAzMjQ0fSxcInpvb21cIjoxNC4wMTY5Nzk4NjQ0ODIyMzMsXCJiZWFyaW5nXCI6LTExLjU3ODMzNjE2NjE0Mjg4OCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzQ3MzczMDk0NDQ2NixcImxhdFwiOi0zNy44MDQ5MDcxNTU5NTEzfSxcInpvb21cIjoxNS4zNDg2NzYwOTk5MjI4NTIsXCJiZWFyaW5nXCI6LTE1NC40OTcxMzMzMjg5NzAxLFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NDkyMjUxNDM4MzA3LFwibGF0XCI6LTM3LjgwMzEwOTcyNzI3MjgxfSxcInpvb21cIjoxNS4zNTg1MDk3ODk3OTA4MDgsXCJiZWFyaW5nXCI6LTc4LjM5OTk5OTk5OTk5OTcsXCJwaXRjaFwiOjU4LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIFxuXG5cbiAgICB7IFxuICAgICAgICBkZWxheToxLFxuICAgICAgICBuYW1lOiAnR2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1doaWNoIG5pZ2h0IGlzIGJpbiBuaWdodD8nLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ2FyYmFnZS0xJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS44YXJxd21ocicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0dhcmJhZ2VfY29sbGVjdGlvbl96b25lcy05bnl0c2snLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdoc2woMjMsIDk0JSwgNjQlKScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDZdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAxMF1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgbGluZ2VyOjEwMDAwLFxuICAgICAgICAvLyBGYXdrbmVyIFBhcmtpc2hcbiAgICAgICAgZmx5VG86IHtjZW50ZXI6IHsgbG5nOjE0NC45NjU0MzcsIGxhdDotMzcuODE0MjI1fSwgem9vbTogMTMuNyxiZWFyaW5nOi0zMC44LCBwaXRjaDo2MH1cbiAgICAgICAgLy8gYmlyZHMgZXllLCB6b29tZWQgb3V0XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTMsYmVhcmluZzowLHBpdGNoOjB9LFxuICAgIH0sXG5cblxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIG5hbWU6ICdHYXJiYWdlIGNvbGxlY3Rpb24gem9uZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2hpY2ggbmlnaHQgaXMgYmluIG5pZ2h0JyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2dhcmJhZ2UtMicsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS44YXJxd21ocicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0dhcmJhZ2VfY29sbGVjdGlvbl96b25lcy05bnl0c2snLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdoc2woMjMsIDk0JSwgNjQlKScsXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tydWJfZGF5fScsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMThdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyMF1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgLy8gYmlyZHMgZXllXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuXG5cbiAgICB7IFxuICAgICAgICBuYW1lOiAnTWVsYm91cm5lIEJpa2UgU2hhcmUgc3RhdGlvbnMsIHdpdGggY3VycmVudCBudW1iZXIgb2YgZnJlZSBhbmQgdXNlZCBkb2NrcyAoZXZlcnkgMTUgbWludXRlcyknLFxuICAgICAgICBjYXB0aW9uOiAnSG93IG1hbnkgXCJCbHVlIEJpa2VzXCIgYXJlIHJlYWR5IGluIGVhY2ggc3RhdGlvbi4nLFxuICAgICAgICBjb2x1bW46ICdOQkJpa2VzJyxcbiAgICAgICAgZGVsYXk6IDIwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3RkdmgtbjlkdicpICxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ2JpY3ljbGUtc2hhcmUtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tc2l6ZSc6IDIsXG4gICAgICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tOQkJpa2VzfScsXG4gICAgICAgICAgICAgICAgICAgIC8vJ3RleHQtYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICd0ZXh0LW9mZnNldCc6IFsxLjUsMF0sXG4gICAgICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOjIwXG4gICAgICAgICAgICAgICAgICAgIC8vIGZvciBzb21lIHJlYXNvbiBpdCBnZXRzIHNpbGVudGx5IHJlamVjdGVkIHdpdGggdGhpczpcbiAgICAgICAgICAgICAgICAgICAgLyonaWNvbi1zaXplJzoge1xuICAgICAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdOQkJpa2VzJyxcblxuICAgICAgICAgICAgICAgICAgICAgICAgXCJzdG9wc1wiOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFswLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgICBbMzAsIDNdXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgfSovXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6J2hzbCgyMzksNzElLDY2JSknIC8vIG1hdGNoIHRoZSBibHVlIGJpa2UgaWNvbnNcbiAgICAgICAgICAgICAgICAgICAgLy8ndGV4dC1jb2xvcic6ICdyZ2IoMCwxNzQsMjAzKScgLy8gQ29NIHBvcCBibHVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTc3Njg0MTQ1NjI4ODcsXCJsYXRcIjotMzcuODE5OTg5NDgzNzI4Mzl9LFwiem9vbVwiOjE0LjY3MDIyMTY3NjIzODUwNyxcImJlYXJpbmdcIjotNTcuOTMyMzAyNTE3MzYxMTcsXCJwaXRjaFwiOjYwfVxuICAgIH0sIC8vIGJpa2Ugc2hhcmVcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCc4NGJmLWRpaGknKSxcbiAgICAgICAgY2FwdGlvbjogJ1BsYWNlcyB5b3UgY2FuIGJvb2sgZm9yIGEgd2VkZGluZy4uLicsXG4gICAgICAgIGZpbHRlcjogWyc9PScsICdXRURESU5HJywgJ1knXSxcbiAgICAgICAgY29sdW1uOiAnV0VERElORycsXG4gICAgICAgIGRlbGF5OiA0MDAwLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTczNjI1NTY2OTMzNixcImxhdFwiOi0zNy44MTM5NjI3MTMzNDQzMn0sXCJ6b29tXCI6MTQuNDA1NTkxMDkxNjcxMDU4LFwiYmVhcmluZ1wiOi02Ny4xOTk5OTk5OTk5OTk5OSxcInBpdGNoXCI6NTQuMDAwMDAwMDAwMDAwMDJ9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCc4NGJmLWRpaGknKSxcbiAgICAgICAgY2FwdGlvbjogJ1BsYWNlcyB5b3UgY2FuIGJvb2sgZm9yIGEgd2VkZGluZy4uLm9yIHNvbWV0aGluZyBlbHNlLicsXG4gICAgICAgIGNvbHVtbjogJ1dFRERJTkcnLFxuICAgICAgICBkZWxheTogNjAwMCxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MzYyNTU2NjkzMzYsXCJsYXRcIjotMzcuODEzOTYyNzEzMzQ0MzJ9LFwiem9vbVwiOjE0LjQwNTU5MTA5MTY3MTA1OCxcImJlYXJpbmdcIjotODAsXCJwaXRjaFwiOjU0LjAwMDAwMDAwMDAwMDAyfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLicsXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd0b2lsZXQtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLnRoYXQgYXJlIGFjY2Vzc2libGUgZm9yIHdoZWVsY2hhaXIgdXNlcnMnLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCd3aGVlbGNoYWlyJywneWVzJ10sXG4gICAgICAgIGRlbGF5OiAxLFxuICAgICAgICBsaW5nZXI6NTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnd2hlZWxjaGFpci0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4udGhhdCBhcmUgYWNjZXNzaWJsZSBmb3Igd2hlZWxjaGFpciB1c2VycycsXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICAvL2xpbmdlcjo1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBmaWx0ZXI6IFsnIT0nLCd3aGVlbGNoYWlyJywneWVzJ10sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3RvaWxldC0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIFxuICAgICAgICBjYXB0aW9uOiAnT3VyIGRhdGEgdGVsbHMgeW91IHdoZXJlIHlvdXIgZG9nIGRvZXNuXFwndCBuZWVkIGEgbGVhc2gnLFxuICAgICAgICBuYW1lOiAnRG9nIFdhbGtpbmcgWm9uZXMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnMicsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuY2x6YXAyamUnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdEb2dfV2Fsa2luZ19ab25lcy0zZmg5cTQnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsIC8vaHNsKDM0MCwgOTclLCA0NSUpXG4gICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAuOFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyc9PScsICdzdGF0dXMnLCAnb2ZmbGVhc2gnXVxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzQ2MDkyNTI4MDY2LFwibGF0XCI6LTM3Ljc5NDUwNjk3NDI3NDIyfSxcInpvb21cIjoxNC45NTU1NDQ5MDMxNDU1NDQsXCJiZWFyaW5nXCI6LTQ0Ljg0MTMyNzQ1MTgzNzI4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2NDcyMDg0MTYxNTI1LFwibGF0XCI6LTM3Ljc5OTQ3NzQ3MjU3NTg0fSxcInpvb21cIjoxNC45MzM5MzE1MjgwMzYwNDgsXCJiZWFyaW5nXCI6LTU3LjY0MTMyNzQ1MTgzNzA4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg2MTM5ODc3MzI5MzIsXCJsYXRcIjotMzcuODM4ODgyNjY1OTYxODd9LFwiem9vbVwiOjE1LjA5NjQxOTU3OTQzMjg3OCxcImJlYXJpbmdcIjotMzAsXCJwaXRjaFwiOjU3LjQ5OTk5OTk5OTk5OTk5fVxuICAgIH0sXG5cblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlcmVcXCdzIGV2ZW4gZXZlcnkgY2FmZSBhbmQgcmVzdGF1cmFudCcsXG4gICAgICAgIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnc2ZyZy16eWdiJyksXG4gICAgICAgIC8vIENCRCBsb29raW5nIHRvd2FyZHMgQ2FybHRvblxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY0MjAwOTk4OTcwNDUsXCJsYXRcIjotMzcuODA0MDc2MjkxNjIxNn0sXCJ6b29tXCI6MTUuNjk1NjYyMTM2MzM5NjUzLFwiYmVhcmluZ1wiOi0yMi41Njk3MTg3NjUwMDYzMSxcInBpdGNoXCI6NjB9LFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDk4Nzg5OTkyOTY0LFwibGF0XCI6LTM3LjgxMDIxMzEwNDA0NzQ5fSxcInpvb21cIjoxNi4wMjc3MzIzMzIwMTY5OSxcImJlYXJpbmdcIjotMTM1LjIxOTc1MzA4NjQxOTgxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAgbGluZ2VyOjI2MDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDxiPjxpPnlvdTwvaT48L2I+IGRvIHdpdGggb3VyIGRhdGE/JyxcbiAgICAgICAgbmFtZTogJ0J1aWxkaW5nIG91dGxpbmVzJyxcbiAgICAgICAgb3BhY2l0eTowLjEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6IHtcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydHk6ICdoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzAsICdoc2woMTQ2LCA1MCUsIDEwJSknXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsyMDAsICdoc2woMTQ2LCAxMDAlLCA2MCUpJ11cbiAgICAgICAgICAgICAgICAgICAgXSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAvLydoc2woMTQ2LCAxMDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGZyb20gYWJib3RzZm9yZGlzaFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzI1MTM1MDMyNzY0LFwibGF0XCI6LTM3LjgwNzQxNTIwOTA1MTI4NX0sXCJ6b29tXCI6MTQuODk2MjU5MTUzMDEyMjQzLFwiYmVhcmluZ1wiOi0xMDYuNDAwMDAwMDAwMDAwMTUsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2Zyb20gc291dGhcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0NzAxNDA3NTM0NDUsXCJsYXRcIjotMzcuODE1MjAwNjI3MjY2NjZ9LFwiem9vbVwiOjE1LjQ1ODc4NDkzMDIzODY3MixcImJlYXJpbmdcIjo5OC4zOTk5OTk5OTk5OTk4OCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjNdXSxcbiAgICAgICAga2VlcFBhaW50OiB0cnVlLFxuICAgICAgICBmbHlUbzp7Y2VudGVyOntsbmc6MTQ0Ljk1LGxhdDotMzcuODEzfSxiZWFyaW5nOjAsem9vbToxNCxwaXRjaDo0NSxkdXJhdGlvbjoyMDAwMH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAga2VlcFBhaW50OiB0cnVlLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC41XSBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuNl0gXVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doYXQgd2lsbCA8Yj48aT55b3U8L2k+PC9iPiBkbyB3aXRoIG91ciBkYXRhPycsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIC8vb3BhY2l0eTowLjYsXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuN10gXSxcbiAgICAgICAgLyptYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjYsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCovXG4gICAgICAgIC8vbWF0Y2hpbmcgc3RhcnRpbmcgcG9zaXRpb24/XG4gICAgICAgIGZseVRvOntjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LGJlYXJpbmc6MCx6b29tOjE0LHBpdGNoOjQ1LGR1cmF0aW9uOjIwMDAwfVxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcyNTEzNTAzMjc2NCxcImxhdFwiOi0zNy44MDc0MTUyMDkwNTEyODV9LFwiem9vbVwiOjE0Ljg5NjI1OTE1MzAxMjI0MyxcImJlYXJpbmdcIjotMTA2LjQwMDAwMDAwMDAwMDE1LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mcm9tIHNvdXRoXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDcwMTQwNzUzNDQ1LFwibGF0XCI6LTM3LjgxNTIwMDYyNzI2NjY2fSxcInpvb21cIjoxNS40NTg3ODQ5MzAyMzg2NzIsXCJiZWFyaW5nXCI6OTguMzk5OTk5OTk5OTk5ODgsXCJwaXRjaFwiOjYwfVxuICAgIH1cbl07XG4vKlxuY29uc3QgY3JhcHB5RmluYWxlID0gW1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBaZSBncmFuZGUgZmluYWxlXG4gICAge1xuICAgICAgICBkZWxheToxLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnc2ZyZy16eWdiJyksIC8vIGNhZmVzXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLXNpemUnOiAwLjVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoyMDAwMFxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoyMDAwMFxuICAgIH0sICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTEsIGxpbmdlcjoyMDAwMCxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHsgLy8gcGVkZXN0cmlhbiBzZW5zb3JzXG4gICAgICAgIGRlbGF5OjEsbGluZ2VyOjIwMDAwLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgneWdhdy02cnpxJyksXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNjc4NTQ3NjE5NDUsXCJsYXRcIjotMzcuODAyMzY4OTYxMDY4OTh9LFwiem9vbVwiOjE1LjM4OTM5Mzg1MDcyNTczMixcImJlYXJpbmdcIjotMTQzLjU4NDQ2NzUxMjQ5NTQsXCJwaXRjaFwiOjYwfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgY2FwdGlvbjogJ1doYXQgd2lsbCA8dT55b3U8L3U+Jm5ic3A7IGRvIHdpdGggb3VyIGRhdGE/JyxcbiAgICAgICAgZGVsYXk6MjAwMDAsXG4gICAgICAgIGxpbmdlcjozMDAwMCxcbiAgICAgICAgb3BhY2l0eTowLjQsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICdoc2woMTQ2LCAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjksXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgIH0sXG5cbl07XG4qL1xuXG5jb25zdCB1bnVzZWQgPSBbXG57XG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnUGVkZXN0cmlhbiBzZW5zb3JzIGNvdW50IGZvb3QgdHJhZmZpYyBldmVyeSBob3VyJyxcbiAgICAgICAgbmFtZTogJ1BlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9ucycsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd5Z2F3LTZyenEnKSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM2Nzg1NDc2MTk0NSxcImxhdFwiOi0zNy44MDIzNjg5NjEwNjg5OH0sXCJ6b29tXCI6MTUuMzg5MzkzODUwNzI1NzMyLFwiYmVhcmluZ1wiOi0xNDMuNTg0NDY3NTEyNDk1NCxcInBpdGNoXCI6NjB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9XG5dO1xuXG5cblxuXG5cbmV4cG9ydCBjb25zdCBkYXRhc2V0czIgPSBbXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUExJRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnTWFqb3IgZGV2ZWxvcG1lbnQgcHJvamVjdCBhcHBsaWNhdGlvbnMnLFxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUFJPVkVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIGFwcHJvdmVkJyBcbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIHVuZGVyIGNvbnN0cnVjdGlvbicgXG4gICAgfSwgXG4gICAgeyBkZWxheTogNTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3RkdmgtbjlkdicpIH0sIC8vIGJpa2Ugc2hhcmVcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0FjY29tbW9kYXRpb24nIH0sXG4gICAgeyBkZWxheTogMTAwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgY29sdW1uOiAnQXJ0cyBhbmQgUmVjcmVhdGlvbiBTZXJ2aWNlcycgfSxcbiAgICAvL3sgZGVsYXk6IDMwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnUmV0YWlsIFRyYWRlJyB9LFxuICAgIHsgZGVsYXk6IDkwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnQ29uc3RydWN0aW9uJyB9XG4gICAgLy97IGRlbGF5OiAxMDAwLCBkYXRhc2V0OiAnYjM2ai1raXk0JyB9LFxuICAgIC8veyBkZWxheTogMjAwMCwgZGF0YXNldDogJzIzNHEtZ2c4MycgfVxuXTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuaW1wb3J0IHsgbWVsYm91cm5lUm91dGUgfSBmcm9tICcuL21lbGJvdXJuZVJvdXRlJztcblxuLypcbkNvbnRpbnVvdXNseSBtb3ZlcyB0aGUgTWFwYm94IHZhbnRhZ2UgcG9pbnQgYXJvdW5kIGEgR2VvSlNPTi1kZWZpbmVkIHBhdGguXG4qL1xuXG5mdW5jdGlvbiB3aGVuTG9hZGVkKG1hcCwgZikge1xuICAgIGlmIChtYXAubG9hZGVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0FscmVhZHkgbG9hZGVkLicpO1xuICAgICAgICBmKCk7XG4gICAgfVxuICAgIGVsc2UgeyBcbiAgICAgICAgY29uc29sZS5sb2coJ1dhaXQgZm9yIGxvYWQnKTtcbiAgICAgICAgbWFwLm9uY2UoJ2xvYWQnLCBmKTtcbiAgICB9XG59XG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmV4cG9ydCBjbGFzcyBGbGlnaHRQYXRoIHtcblxuICAgIGNvbnN0cnVjdG9yKG1hcCwgcm91dGUpIHtcbiAgICAgICAgdGhpcy5yb3V0ZSA9IHJvdXRlO1xuICAgICAgICBpZiAodGhpcy5yb3V0ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhpcy5yb3V0ZSA9IG1lbGJvdXJuZVJvdXRlO1xuXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAwLjAxO1xuXG4gICAgICAgIHRoaXMucG9zTm8gPSAwO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25zID0gdGhpcy5yb3V0ZS5mZWF0dXJlcy5tYXAoZmVhdHVyZSA9PiAoe1xuICAgICAgICAgICAgY2VudGVyOiBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgem9vbTogZGVmKGZlYXR1cmUucHJvcGVydGllcy56b29tLCAxNCksXG4gICAgICAgICAgICBiZWFyaW5nOiBmZWF0dXJlLnByb3BlcnRpZXMuYmVhcmluZyxcbiAgICAgICAgICAgIHBpdGNoOiBkZWYoZmVhdHVyZS5wcm9wZXJ0aWVzLnBpdGNoLCA2MClcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMucGF1c2VUaW1lID0gMDtcblxuICAgICAgICB0aGlzLmJlYXJpbmc9MDtcblxuICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuXG5cbiAgICAvKnZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk2LCAtMzcuOF0sIHpvb206IDE1LCBiZWFyaW5nOiAxMH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk4LCAtMzcuODRdLCB6b29tOiAxNSwgYmVhcmluZzogMTYwLCBwaXRjaDogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OTUsIC0zNy44MjVdLCB6b29tOiAxNSwgYmVhcmluZzogLTkwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTcsIC0zNy44Ml0sIHpvb206IDE1LCBiZWFyaW5nOiAxNDB9XG5cbiAgICBdOyovXG5cbiAgICAgICAgdGhpcy5tb3ZlQ2FtZXJhID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3ZlQ2FtZXJhJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5wb3NpdGlvbnNbdGhpcy5wb3NOb107XG4gICAgICAgICAgICBwb3Muc3BlZWQgPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgcG9zLmN1cnZlID0gMC40ODsgLy8xO1xuICAgICAgICAgICAgcG9zLmVhc2luZyA9ICh0KSA9PiB0OyAvLyBsaW5lYXIgZWFzaW5nXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmbHlUbycpO1xuICAgICAgICAgICAgdGhpcy5tYXAuZmx5VG8ocG9zLCB7IHNvdXJjZTogJ2ZsaWdodHBhdGgnIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnBvc05vID0gKHRoaXMucG9zTm8gKyAxKSAlIHRoaXMucG9zaXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9tYXAucm90YXRlVG8oYmVhcmluZywgeyBlYXNpbmc6IGVhc2luZyB9KTtcbiAgICAgICAgICAgIC8vYmVhcmluZyArPSA1O1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gXG4gICAgICAgIHRoaXMubWFwLm9uKCdtb3ZlZW5kJywgKGRhdGEpID0+IHsgXG4gICAgICAgICAgICBpZiAoZGF0YS5zb3VyY2UgPT09ICdmbGlnaHRwYXRoJykgXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICAvKlxuICAgICAgICBUaGlzIHNlZW1lZCB0byBiZSB1bnJlbGlhYmxlIC0gd2Fzbid0IGFsd2F5cyBnZXR0aW5nIHRoZSBsb2FkZWQgZXZlbnQuXG4gICAgICAgIHdoZW5Mb2FkZWQodGhpcy5tYXAsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkZWQuJyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgKi9cbiAgICAgICAgXG4gICAgICAgIHRoaXMubWFwLmp1bXBUbyh0aGlzLnBvc2l0aW9uc1swXSk7XG4gICAgICAgIHRoaXMucG9zTm8gKys7XG4gICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCAwIC8qdGhpcy5wYXVzZVRpbWUqLyk7XG5cbiAgICAgICAgdGhpcy5tYXAub24oJ2NsaWNrJywgKCkgPT4geyBcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLnN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0gICAgXG5cbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93UmFkaXVzTGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICAvLyBUT0RPIHBhZCB0aGUgc21hbGwgY2lyY2xlIHNvIHRoZSB0ZXh0IHN0YXJ0cyBhdCB0aGUgc2FtZSBYIHBvc2l0aW9uIGZvciBib3RoXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjZweDsgd2lkdGg6IDZweDsgYm9yZGVyLXJhZGl1czogM3B4XCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAyMHB4OyBib3JkZXItcmFkaXVzOiAxMHB4XCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPmA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG5cbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYig0MCw0MCwyNTApXCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjNweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYigyMCwyMCw0MClcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+YDsgXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NhdGVnb3J5TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBjb2xvclN0b3BzLCBjbG9zZUhhbmRsZXIpIHtcbiAgICBsZXQgbGVnZW5kSHRtbCA9IFxuICAgICAgICAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyArXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICBjb2xvclN0b3BzXG4gICAgICAgICAgICAuc29ydCgoc3RvcGEsIHN0b3BiKSA9PiBzdG9wYVswXS5sb2NhbGVDb21wYXJlKHN0b3BiWzBdKSkgLy8gc29ydCBvbiB2YWx1ZXNcbiAgICAgICAgICAgIC5tYXAoc3RvcCA9PiBgPHNwYW4gY2xhc3M9XCJib3hcIiBzdHlsZT0nYmFja2dyb3VuZDogJHtzdG9wWzFdfSc+PC9zcGFuPjxsYWJlbD4ke3N0b3BbMF19PC9sYWJlbD48YnIvPmApXG4gICAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgICAgO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5cbmltcG9ydCAqIGFzIGxlZ2VuZCBmcm9tICcuL2xlZ2VuZCc7XG4vKlxuV3JhcHMgYSBNYXBib3ggbWFwIHdpdGggZGF0YSB2aXMgY2FwYWJpbGl0aWVzIGxpa2UgY2lyY2xlIHNpemUgYW5kIGNvbG9yLCBhbmQgcG9seWdvbiBoZWlnaHQuXG5cbnNvdXJjZURhdGEgaXMgYW4gb2JqZWN0IHdpdGg6XG4tIGRhdGFJZFxuLSBsb2NhdGlvbkNvbHVtblxuLSB0ZXh0Q29sdW1uc1xuLSBudW1lcmljQ29sdW1uc1xuLSByb3dzXG4tIHNoYXBlXG4tIG1pbnMsIG1heHNcbiovXG5jb25zdCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmxldCB1bmlxdWUgPSAwO1xuXG5leHBvcnQgY2xhc3MgTWFwVmlzIHtcbiAgICBjb25zdHJ1Y3RvcihtYXAsIHNvdXJjZURhdGEsIGZpbHRlciwgZmVhdHVyZUhvdmVySG9vaywgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5zb3VyY2VEYXRhID0gc291cmNlRGF0YTtcbiAgICAgICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgICAgIHRoaXMuZmVhdHVyZUhvdmVySG9vayA9IGZlYXR1cmVIb3Zlckhvb2s7IC8vIGYocHJvcGVydGllcywgc291cmNlRGF0YSlcbiAgICAgICAgb3B0aW9ucyA9IGRlZihvcHRpb25zLCB7fSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNpcmNsZVJhZGl1czogZGVmKG9wdGlvbnMuY2lyY2xlUmFkaXVzLCAyMCksXG4gICAgICAgICAgICBpbnZpc2libGU6IG9wdGlvbnMuaW52aXNpYmxlLCAvLyB3aGV0aGVyIHRvIGNyZWF0ZSB3aXRoIG9wYWNpdHkgMFxuICAgICAgICAgICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCwgLy8gTWFwYm94IHN5bWJvbCBwcm9wZXJ0aWVzLCBtZWFuaW5nIHdlIHNob3cgc3ltYm9sIGluc3RlYWQgb2YgY2lyY2xlXG4gICAgICAgICAgICBlbnVtQ29sb3JzOiBvcHRpb25zLmVudW1Db2xvcnMgLy8gb3ZlcnJpZGUgZGVmYXVsdCBjb2xvciBjaG9pY2VzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy90aGlzLm9wdGlvbnMuaW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIFRPRE8gc2hvdWxkIGJlIHBhc3NlZCBhIExlZ2VuZCBvYmplY3Qgb2Ygc29tZSBraW5kLlxuXG4gICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmxheWVySWQgPSBzb3VyY2VEYXRhLnNoYXBlICsgJy0nICsgc291cmNlRGF0YS5kYXRhSWQgKyAnLScgKyAodW5pcXVlKyspO1xuICAgICAgICB0aGlzLmxheWVySWRIaWdobGlnaHQgPSB0aGlzLmxheWVySWQgKyAnLWhpZ2hsaWdodCc7XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgcG9pbnREYXRhc2V0VG9HZW9KU09OKHRoaXMuc291cmNlRGF0YSkgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ5IHVzaW5nIGEgY2lyY2xlIGhpZ2hsaWdodCBldmVuIG9uIGFuIGljb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuc3ltYm9sLCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgICAgICAgICAvLyBodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvRWNvbm9teS9FbXBsb3ltZW50LWJ5LWJsb2NrLWJ5LWluZHVzdHJ5L2IzNmota2l5NFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgeyBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsIFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdtYXBib3g6Ly9vcGVuY291bmNpbGRhdGEuYWVkZm15cDgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25MYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1RoaXMgaXMgYSBzeW1ib2wgbGF5ZXIsIHdlIGlnbm9yZSBzZXRWaXNDb2x1bW4uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbHVtbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSBzb3VyY2VEYXRhLnRleHRDb2x1bW5zWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gY29sdW1uTmFtZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhIGNvbHVtbjogJyArIHRoaXMuZGF0YUNvbHVtbik7XG5cbiAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHBvbHlnb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBhZGQgY2xvc2UgYnV0dG9uIGJlaGF2aW91ci4gbWF5YmU/XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBoYW5kbGUgZW51bSBmaWVsZHMgb24gcG9seWdvbnMgKG5vIGV4YW1wbGUgY3VycmVudGx5KVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgbGV0IG1pblNpemUgPSAwLjMgKiB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuICAgICAgICAgICAgbGV0IG1heFNpemUgPSB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuXG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1yYWRpdXMnLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCBtaW5TaXplLzNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemUvM10sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgbWluU2l6ZV0sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgbWF4U2l6ZV1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dSYWRpdXNMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgLy8gQ2FuJ3Qgc2FmZWx5IGNsb3NlIG51bWVyaWMgY29sdW1ucyB5ZXQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8zOTQ5XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVSYWRpdXMgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLXJhZGl1cycsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtbnVtZXJpYycpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIC8vIGZyb20gQ29sb3JCcmV3ZXJcbiAgICAgICAgICAgIGNvbnN0IGVudW1Db2xvcnMgPSBkZWYodGhpcy5vcHRpb25zLmVudW1Db2xvcnMsIFsnIzFmNzhiNCcsJyNmYjlhOTknLCcjYjJkZjhhJywnIzMzYTAyYycsJyNlMzFhMWMnLCcjZmRiZjZmJywnI2E2Y2VlMycsICcjZmY3ZjAwJywnI2NhYjJkNicsJyM2YTNkOWEnLCcjZmZmZjk5JywnI2IxNTkyOCddKTtcblxuICAgICAgICAgICAgbGV0IGVudW1TdG9wcyA9IHRoaXMuc291cmNlRGF0YS5zb3J0ZWRGcmVxdWVuY2llc1tkYXRhQ29sdW1uXS5tYXAoKHZhbCxpKSA9PiBbdmFsLCBlbnVtQ29sb3JzW2kgJSBlbnVtQ29sb3JzLmxlbmd0aF1dKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IGVudW1TdG9wc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUT0RPIHRlc3QgY2xvc2UgaGFuZGxlciwgY3VycmVudGx5IG5vbiBmdW5jdGlvbmFsIGR1ZSB0byBwb2ludGVyLWV2ZW50czpub25lIGluIENTU1xuICAgICAgICAgICAgbGVnZW5kLnNob3dDYXRlZ29yeUxlZ2VuZCgnI2xlZ2VuZC1lbnVtJywgZGF0YUNvbHVtbiwgZW51bVN0b3BzLCB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yLmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLWNvbG9yJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtY29sb3InXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLWVudW0nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICAgIEFwcGxpZXMgYSBzdHlsZSB0aGF0IHJlcHJlc2VudHMgbnVtZXJpYyBkYXRhIHZhbHVlcyBhcyBoZWlnaHRzIG9mIGV4dHJ1ZGVkIHBvbHlnb25zLlxuICAgICAgICAgICAgVE9ETzogYWRkIHJlbW92ZVBvbHlnb25IZWlnaHRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCcsICB7XG4gICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIsIHRoZSBkYXRhIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHBvbHlnb24gc2V0LCBpdCdzIGp1c3QgYSBodWdlIHZhbHVlIGxvb2t1cFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLC8vbG9jYXRpb25Db2x1bW4sIC8vIHRoZSBJRCBvbiB0aGUgYWN0dWFsIGdlb21ldHJ5IGRhdGFzZXRcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAxMDAwXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLy8ubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdyZ2IoMCwwLCcgKyBNYXRoLnJvdW5kKDQwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAyMDApICsgJyknXSlcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAnaHNsKDM0MCw4OCUsJyArIE1hdGgucm91bmQoMjAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDUwKSArICclKSddKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkLCBbJyFpbicsICdibG9ja19pZCcsIC4uLigvKiAjIyMgVE9ETyBnZW5lcmFsaXNlICovIFxuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvd1tkYXRhQ29sdW1uXSA9PT0gMClcbiAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiByb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkpXSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCB0aGlzLnNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWQpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5vZmYoJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gVGhlIGFjdHVhbCBjb25zdHJ1Y3Rvci4uLlxuICAgICAgICBpZiAodGhpcy5zb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSAoZSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSB0aGlzLm1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZS5wb2ludCwgeyBsYXllcnM6IFt0aGlzLmxheWVySWRdfSlbMF07ICBcbiAgICAgICAgICAgICAgICBpZiAoZiAmJiBmICE9PSB0aGlzLmxhc3RGZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVIb3Zlckhvb2soZi5wcm9wZXJ0aWVzLCB0aGlzLnNvdXJjZURhdGEsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgZi5wcm9wZXJ0aWVzW3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1dKTsgLy8gd2UgZG9uJ3QgaGF2ZSBhbnkgb3RoZXIgcmVsaWFibGUga2V5P1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsICdibG9ja19pZCcsIGYucHJvcGVydGllcy5ibG9ja19pZF0pOyAvLyBkb24ndCBoYXZlIGEgZ2VuZXJhbCB3YXkgdG8gbWF0Y2ggb3RoZXIga2luZHMgb2YgcG9seWdvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZi5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICB9XG4gICAgICAgIFxuXG5cblxuICAgICAgICBcblxuICAgIH1cbn1cblxuLy8gY29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gR2VvSlNPTlxuZnVuY3Rpb24gcG9pbnREYXRhc2V0VG9HZW9KU09OKHNvdXJjZURhdGEpIHtcbiAgICBsZXQgZGF0YXNvdXJjZSA9IHtcbiAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc291cmNlRGF0YS5yb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pIHtcbiAgICAgICAgICAgICAgICBkYXRhc291cmNlLmRhdGEuZmVhdHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcm93LFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiByb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgLy8gSnVzdCBkb24ndCBwdXNoIGl0IFxuICAgICAgICAgICAgY29uc29sZS5sb2coYEJhZCBsb2NhdGlvbjogJHtyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl19YCk7ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YXNvdXJjZTtcbn07XG5cbmZ1bmN0aW9uIGNpcmNsZUxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBmaWx0ZXIsIGhpZ2hsaWdodCwgc2l6ZSwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICBwYWludDoge1xuLy8gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ2hzbCgyMCwgOTUlLCA1MCUpJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAncmdiYSgwLDAsMCwwKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC45NSA6IDAsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS1jb2xvcic6IGhpZ2hsaWdodCA/ICd3aGl0ZScgOiAncmdiYSg1MCw1MCw1MCwwLjUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzoge1xuICAgICAgICAgICAgICAgIHN0b3BzOiBoaWdobGlnaHQgPyBbXG4gICAgICAgICAgICAgICAgICAgIFsxMCxzaXplICogMC40XSwgXG4gICAgICAgICAgICAgICAgICAgIFsxNyxzaXplICogMS4wXVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIFsxMCxzaXplICogMC4yXSwgXG4gICAgICAgICAgICAgICAgICAgIFsxNyxzaXplICogMC41XV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzeW1ib2xMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgc3ltYm9sLCBmaWx0ZXIsIGhpZ2hsaWdodCwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkXG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuXG4gICAgcmV0LnBhaW50ID0gZGVmKHN5bWJvbC5wYWludCwge30pO1xuICAgIHJldC5wYWludFsnaWNvbi1vcGFjaXR5J10gPSAhaW52aXNpYmxlID8gMC45NSA6IDA7XG5cbiAgICAvL3JldC5sYXlvdXQgPSBkZWYoc3ltYm9sLmxheW91dCwge30pO1xuICAgIGlmIChzeW1ib2wubGF5b3V0KSB7XG4gICAgICAgIGlmIChzeW1ib2wubGF5b3V0Wyd0ZXh0LWZpZWxkJ10gJiYgaW52aXNpYmxlKVxuICAgICAgICAgICAgcmV0LnBhaW50Wyd0ZXh0LW9wYWNpdHknXSA9IDA7XG4gICAgICAgIHJldC5sYXlvdXQgPSBzeW1ib2wubGF5b3V0O1xuICAgIH1cblxuXG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5cbiBmdW5jdGlvbiBwb2x5Z29uTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGludmlzaWJsZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOCA6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJyMwMDMnXG4gICAgICAgICB9LFxuICAgIH07XG59XG4gZnVuY3Rpb24gcG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCBsYXllcklkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ2Jsb2NrX2lkJywgJy0nXVxuICAgIH07XG59XG5cbiIsImV4cG9ydCBjb25zdCBtZWxib3VybmVSb3V0ZSA9IHtcbiAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgXCJmZWF0dXJlc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAzNTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk2Mjg4Mjk5NTYwNTQ3LFxuICAgICAgICAgIC0zNy44MjE3MTc2NDc4Mzk2NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcImJlYXJpbmdcIjogMjcwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45Nzg1MDQxODA5MDgyLFxuICAgICAgICAgIC0zNy44MDgzNTk5MTc0MjM1OTRcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAxODBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk1NTU4NzM4NzA4NDk2LFxuICAgICAgICAgIC0zNy44MDU3ODMwMjEzMTQ1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogOTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk0NDM0MzU2Njg5NDUzLFxuICAgICAgICAgIC0zNy44MTY0OTY4OTM3MjMwOFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICBdXG59OyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtY29sbGVjdGlvbi8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJlZml4ID0gXCIkXCI7XG5cbmZ1bmN0aW9uIE1hcCgpIHt9XG5cbk1hcC5wcm90b3R5cGUgPSBtYXAucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogTWFwLFxuICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiAocHJlZml4ICsga2V5KSBpbiB0aGlzO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzW3ByZWZpeCArIGtleV07XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHRoaXNbcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBwcm9wZXJ0eSA9IHByZWZpeCArIGtleTtcbiAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBrZXlzLnB1c2gocHJvcGVydHkuc2xpY2UoMSkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9LFxuICB2YWx1ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgdmFsdWVzLnB1c2godGhpc1twcm9wZXJ0eV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0sXG4gIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGVudHJpZXMucHVzaCh7a2V5OiBwcm9wZXJ0eS5zbGljZSgxKSwgdmFsdWU6IHRoaXNbcHJvcGVydHldfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH0sXG4gIHNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgKytzaXplO1xuICAgIHJldHVybiBzaXplO1xuICB9LFxuICBlbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24oZikge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBmKHRoaXNbcHJvcGVydHldLCBwcm9wZXJ0eS5zbGljZSgxKSwgdGhpcyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hcChvYmplY3QsIGYpIHtcbiAgdmFyIG1hcCA9IG5ldyBNYXA7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBtYXAuc2V0KGtleSwgdmFsdWUpOyB9KTtcblxuICAvLyBJbmRleCBhcnJheSBieSBudW1lcmljIGluZGV4IG9yIHNwZWNpZmllZCBrZXkgZnVuY3Rpb24uXG4gIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICBvO1xuXG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoaSwgb2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGYobyA9IG9iamVjdFtpXSwgaSwgb2JqZWN0KSwgbyk7XG4gIH1cblxuICAvLyBDb252ZXJ0IG9iamVjdCB0byBtYXAuXG4gIGVsc2UgaWYgKG9iamVjdCkgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgbmVzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIga2V5cyA9IFtdLFxuICAgICAgc29ydEtleXMgPSBbXSxcbiAgICAgIHNvcnRWYWx1ZXMsXG4gICAgICByb2xsdXAsXG4gICAgICBuZXN0O1xuXG4gIGZ1bmN0aW9uIGFwcGx5KGFycmF5LCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpIHtcbiAgICBpZiAoZGVwdGggPj0ga2V5cy5sZW5ndGgpIHJldHVybiByb2xsdXAgIT0gbnVsbFxuICAgICAgICA/IHJvbGx1cChhcnJheSkgOiAoc29ydFZhbHVlcyAhPSBudWxsXG4gICAgICAgID8gYXJyYXkuc29ydChzb3J0VmFsdWVzKVxuICAgICAgICA6IGFycmF5KTtcblxuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGtleSA9IGtleXNbZGVwdGgrK10sXG4gICAgICAgIGtleVZhbHVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdmFsdWVzQnlLZXkgPSBtYXAoKSxcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICByZXN1bHQgPSBjcmVhdGVSZXN1bHQoKTtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodmFsdWVzID0gdmFsdWVzQnlLZXkuZ2V0KGtleVZhbHVlID0ga2V5KHZhbHVlID0gYXJyYXlbaV0pICsgXCJcIikpIHtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbdmFsdWVdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZXNCeUtleS5lYWNoKGZ1bmN0aW9uKHZhbHVlcywga2V5KSB7XG4gICAgICBzZXRSZXN1bHQocmVzdWx0LCBrZXksIGFwcGx5KHZhbHVlcywgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZW50cmllcyhtYXAkJDEsIGRlcHRoKSB7XG4gICAgaWYgKCsrZGVwdGggPiBrZXlzLmxlbmd0aCkgcmV0dXJuIG1hcCQkMTtcbiAgICB2YXIgYXJyYXksIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCAtIDFdO1xuICAgIGlmIChyb2xsdXAgIT0gbnVsbCAmJiBkZXB0aCA+PSBrZXlzLmxlbmd0aCkgYXJyYXkgPSBtYXAkJDEuZW50cmllcygpO1xuICAgIGVsc2UgYXJyYXkgPSBbXSwgbWFwJCQxLmVhY2goZnVuY3Rpb24odiwgaykgeyBhcnJheS5wdXNoKHtrZXk6IGssIHZhbHVlczogZW50cmllcyh2LCBkZXB0aCl9KTsgfSk7XG4gICAgcmV0dXJuIHNvcnRLZXkgIT0gbnVsbCA/IGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gc29ydEtleShhLmtleSwgYi5rZXkpOyB9KSA6IGFycmF5O1xuICB9XG5cbiAgcmV0dXJuIG5lc3QgPSB7XG4gICAgb2JqZWN0OiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU9iamVjdCwgc2V0T2JqZWN0KTsgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApOyB9LFxuICAgIGVudHJpZXM6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBlbnRyaWVzKGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCksIDApOyB9LFxuICAgIGtleTogZnVuY3Rpb24oZCkgeyBrZXlzLnB1c2goZCk7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRLZXlzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRWYWx1ZXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRWYWx1ZXMgPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgcm9sbHVwOiBmdW5jdGlvbihmKSB7IHJvbGx1cCA9IGY7IHJldHVybiBuZXN0OyB9XG4gIH07XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3QoKSB7XG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gc2V0T2JqZWN0KG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gIHJldHVybiBtYXAoKTtcbn1cblxuZnVuY3Rpb24gc2V0TWFwKG1hcCQkMSwga2V5LCB2YWx1ZSkge1xuICBtYXAkJDEuc2V0KGtleSwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBTZXQoKSB7fVxuXG52YXIgcHJvdG8gPSBtYXAucHJvdG90eXBlO1xuXG5TZXQucHJvdG90eXBlID0gc2V0LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNldCxcbiAgaGFzOiBwcm90by5oYXMsXG4gIGFkZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YWx1ZSArPSBcIlwiO1xuICAgIHRoaXNbcHJlZml4ICsgdmFsdWVdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogcHJvdG8ucmVtb3ZlLFxuICBjbGVhcjogcHJvdG8uY2xlYXIsXG4gIHZhbHVlczogcHJvdG8ua2V5cyxcbiAgc2l6ZTogcHJvdG8uc2l6ZSxcbiAgZW1wdHk6IHByb3RvLmVtcHR5LFxuICBlYWNoOiBwcm90by5lYWNoXG59O1xuXG5mdW5jdGlvbiBzZXQob2JqZWN0LCBmKSB7XG4gIHZhciBzZXQgPSBuZXcgU2V0O1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBTZXQpIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IHNldC5hZGQodmFsdWUpOyB9KTtcblxuICAvLyBPdGhlcndpc2UsIGFzc3VtZSBpdOKAmXMgYW4gYXJyYXkuXG4gIGVsc2UgaWYgKG9iamVjdCkge1xuICAgIHZhciBpID0gLTEsIG4gPSBvYmplY3QubGVuZ3RoO1xuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChmKG9iamVjdFtpXSwgaSwgb2JqZWN0KSk7XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG52YXIga2V5cyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgdmFsdWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgdmFsdWVzLnB1c2gobWFwW2tleV0pO1xuICByZXR1cm4gdmFsdWVzO1xufTtcblxudmFyIGVudHJpZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGVudHJpZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgZW50cmllcy5wdXNoKHtrZXk6IGtleSwgdmFsdWU6IG1hcFtrZXldfSk7XG4gIHJldHVybiBlbnRyaWVzO1xufTtcblxuZXhwb3J0cy5uZXN0ID0gbmVzdDtcbmV4cG9ydHMuc2V0ID0gc2V0O1xuZXhwb3J0cy5tYXAgPSBtYXA7XG5leHBvcnRzLmtleXMgPSBrZXlzO1xuZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5leHBvcnRzLmVudHJpZXMgPSBlbnRyaWVzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kaXNwYXRjaC8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9vcCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnRzLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRzdi8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiZFwiLCBcInJldHVybiB7XCIgKyBjb2x1bW5zLm1hcChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgXCI6IGRbXCIgKyBpICsgXCJdXCI7XG4gIH0pLmpvaW4oXCIsXCIpICsgXCJ9XCIpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21Db252ZXJ0ZXIoY29sdW1ucywgZikge1xuICB2YXIgb2JqZWN0ID0gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpO1xuICByZXR1cm4gZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgcmV0dXJuIGYob2JqZWN0KHJvdyksIGksIGNvbHVtbnMpO1xuICB9O1xufVxuXG4vLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS5cbmZ1bmN0aW9uIGluZmVyQ29sdW1ucyhyb3dzKSB7XG4gIHZhciBjb2x1bW5TZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgICAgY29sdW1ucyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7XG4gICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvbHVtbnM7XG59XG5cbmZ1bmN0aW9uIGRzdihkZWxpbWl0ZXIpIHtcbiAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cChcIltcXFwiXCIgKyBkZWxpbWl0ZXIgKyBcIlxcbl1cIiksXG4gICAgICBkZWxpbWl0ZXJDb2RlID0gZGVsaW1pdGVyLmNoYXJDb2RlQXQoMCk7XG5cbiAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikge1xuICAgIHZhciBjb252ZXJ0LCBjb2x1bW5zLCByb3dzID0gcGFyc2VSb3dzKHRleHQsIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgaWYgKGNvbnZlcnQpIHJldHVybiBjb252ZXJ0KHJvdywgaSAtIDEpO1xuICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpO1xuICAgIH0pO1xuICAgIHJvd3MuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikge1xuICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lXG4gICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGVcbiAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93c1xuICAgICAgICBOID0gdGV4dC5sZW5ndGgsXG4gICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleFxuICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/XG5cbiAgICBmdW5jdGlvbiB0b2tlbigpIHtcbiAgICAgIGlmIChJID49IE4pIHJldHVybiBFT0Y7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGZpbGVcbiAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBsaW5lXG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogcXVvdGVzXG4gICAgICB2YXIgaiA9IEksIGM7XG4gICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkge1xuICAgICAgICB2YXIgaSA9IGo7XG4gICAgICAgIHdoaWxlIChpKysgPCBOKSB7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDEpICE9PSAzNCkgYnJlYWs7XG4gICAgICAgICAgICArK2k7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEkgPSBpICsgMjtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgIGlmIChjID09PSAxMykge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpKS5yZXBsYWNlKC9cIlwiL2csIFwiXFxcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZVxuICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgIHZhciBrID0gMTtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspO1xuICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxcblxuICAgICAgICBlbHNlIGlmIChjID09PSAxMykgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSAxMCkgKytJLCArK2s7IH0gLy8gXFxyfFxcclxcblxuICAgICAgICBlbHNlIGlmIChjICE9PSBkZWxpbWl0ZXJDb2RlKSBjb250aW51ZTtcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiwgSSAtIGspO1xuICAgICAgfVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGxhc3QgdG9rZW4gYmVmb3JlIEVPRlxuICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoaik7XG4gICAgfVxuXG4gICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikge1xuICAgICAgdmFyIGEgPSBbXTtcbiAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7XG4gICAgICAgIGEucHVzaCh0KTtcbiAgICAgICAgdCA9IHRva2VuKCk7XG4gICAgICB9XG4gICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7XG4gICAgICByb3dzLnB1c2goYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykge1xuICAgIGlmIChjb2x1bW5zID09IG51bGwpIGNvbHVtbnMgPSBpbmZlckNvbHVtbnMocm93cyk7XG4gICAgcmV0dXJuIFtjb2x1bW5zLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpXS5jb25jYXQocm93cy5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbY29sdW1uXSk7XG4gICAgICB9KS5qb2luKGRlbGltaXRlcik7XG4gICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93KHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/IFwiXCJcbiAgICAgICAgOiByZUZvcm1hdC50ZXN0KHRleHQgKz0gXCJcIikgPyBcIlxcXCJcIiArIHRleHQucmVwbGFjZSgvXFxcIi9nLCBcIlxcXCJcXFwiXCIpICsgXCJcXFwiXCJcbiAgICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgZm9ybWF0Um93czogZm9ybWF0Um93c1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwiLFwiKTtcblxudmFyIGNzdlBhcnNlID0gY3N2LnBhcnNlO1xudmFyIGNzdlBhcnNlUm93cyA9IGNzdi5wYXJzZVJvd3M7XG52YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDtcbnZhciBjc3ZGb3JtYXRSb3dzID0gY3N2LmZvcm1hdFJvd3M7XG5cbnZhciB0c3YgPSBkc3YoXCJcXHRcIik7XG5cbnZhciB0c3ZQYXJzZSA9IHRzdi5wYXJzZTtcbnZhciB0c3ZQYXJzZVJvd3MgPSB0c3YucGFyc2VSb3dzO1xudmFyIHRzdkZvcm1hdCA9IHRzdi5mb3JtYXQ7XG52YXIgdHN2Rm9ybWF0Um93cyA9IHRzdi5mb3JtYXRSb3dzO1xuXG5leHBvcnRzLmRzdkZvcm1hdCA9IGRzdjtcbmV4cG9ydHMuY3N2UGFyc2UgPSBjc3ZQYXJzZTtcbmV4cG9ydHMuY3N2UGFyc2VSb3dzID0gY3N2UGFyc2VSb3dzO1xuZXhwb3J0cy5jc3ZGb3JtYXQgPSBjc3ZGb3JtYXQ7XG5leHBvcnRzLmNzdkZvcm1hdFJvd3MgPSBjc3ZGb3JtYXRSb3dzO1xuZXhwb3J0cy50c3ZQYXJzZSA9IHRzdlBhcnNlO1xuZXhwb3J0cy50c3ZQYXJzZVJvd3MgPSB0c3ZQYXJzZVJvd3M7XG5leHBvcnRzLnRzdkZvcm1hdCA9IHRzdkZvcm1hdDtcbmV4cG9ydHMudHN2Rm9ybWF0Um93cyA9IHRzdkZvcm1hdFJvd3M7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1yZXF1ZXN0LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMsIHJlcXVpcmUoJ2QzLWNvbGxlY3Rpb24nKSwgcmVxdWlyZSgnZDMtZGlzcGF0Y2gnKSwgcmVxdWlyZSgnZDMtZHN2JykpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cycsICdkMy1jb2xsZWN0aW9uJywgJ2QzLWRpc3BhdGNoJywgJ2QzLWRzdiddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pLGdsb2JhbC5kMyxnbG9iYWwuZDMsZ2xvYmFsLmQzKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cyxkM0NvbGxlY3Rpb24sZDNEaXNwYXRjaCxkM0RzdikgeyAndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdCxcbiAgICAgIGV2ZW50ID0gZDNEaXNwYXRjaC5kaXNwYXRjaChcImJlZm9yZXNlbmRcIiwgXCJwcm9ncmVzc1wiLCBcImxvYWRcIiwgXCJlcnJvclwiKSxcbiAgICAgIG1pbWVUeXBlLFxuICAgICAgaGVhZGVycyA9IGQzQ29sbGVjdGlvbi5tYXAoKSxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCxcbiAgICAgIHVzZXIgPSBudWxsLFxuICAgICAgcGFzc3dvcmQgPSBudWxsLFxuICAgICAgcmVzcG9uc2UsXG4gICAgICByZXNwb25zZVR5cGUsXG4gICAgICB0aW1lb3V0ID0gMDtcblxuICAvLyBJZiBJRSBkb2VzIG5vdCBzdXBwb3J0IENPUlMsIHVzZSBYRG9tYWluUmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgJiYgIShcIndpdGhDcmVkZW50aWFsc1wiIGluIHhocilcbiAgICAgICYmIC9eKGh0dHAocyk/Oik/XFwvXFwvLy50ZXN0KHVybCkpIHhociA9IG5ldyBYRG9tYWluUmVxdWVzdDtcblxuICBcIm9ubG9hZFwiIGluIHhoclxuICAgICAgPyB4aHIub25sb2FkID0geGhyLm9uZXJyb3IgPSB4aHIub250aW1lb3V0ID0gcmVzcG9uZFxuICAgICAgOiB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24obykgeyB4aHIucmVhZHlTdGF0ZSA+IDMgJiYgcmVzcG9uZChvKTsgfTtcblxuICBmdW5jdGlvbiByZXNwb25kKG8pIHtcbiAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cywgcmVzdWx0O1xuICAgIGlmICghc3RhdHVzICYmIGhhc1Jlc3BvbnNlKHhocilcbiAgICAgICAgfHwgc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgICAgfHwgc3RhdHVzID09PSAzMDQpIHtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlLmNhbGwocmVxdWVzdCwgeGhyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHhocjtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmNhbGwoXCJsb2FkXCIsIHJlcXVlc3QsIHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBvKTtcbiAgICB9XG4gIH1cblxuICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBldmVudC5jYWxsKFwicHJvZ3Jlc3NcIiwgcmVxdWVzdCwgZSk7XG4gIH07XG5cbiAgcmVxdWVzdCA9IHtcbiAgICBoZWFkZXI6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBuYW1lID0gKG5hbWUgKyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gaGVhZGVycy5nZXQobmFtZSk7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgaGVhZGVycy5yZW1vdmUobmFtZSk7XG4gICAgICBlbHNlIGhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlICsgXCJcIik7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gSWYgbWltZVR5cGUgaXMgbm9uLW51bGwgYW5kIG5vIEFjY2VwdCBoZWFkZXIgaXMgc2V0LCBhIGRlZmF1bHQgaXMgdXNlZC5cbiAgICBtaW1lVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1pbWVUeXBlO1xuICAgICAgbWltZVR5cGUgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZpZXMgd2hhdCB0eXBlIHRoZSByZXNwb25zZSB2YWx1ZSBzaG91bGQgdGFrZTtcbiAgICAvLyBmb3IgaW5zdGFuY2UsIGFycmF5YnVmZmVyLCBibG9iLCBkb2N1bWVudCwgb3IgdGV4dC5cbiAgICByZXNwb25zZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByZXNwb25zZVR5cGU7XG4gICAgICByZXNwb25zZVR5cGUgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB0aW1lb3V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGltZW91dDtcbiAgICAgIHRpbWVvdXQgPSArdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHVzZXIgOiAodXNlciA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgcGFzc3dvcmQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyBwYXNzd29yZCA6IChwYXNzd29yZCA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmeSBob3cgdG8gY29udmVydCB0aGUgcmVzcG9uc2UgY29udGVudCB0byBhIHNwZWNpZmljIHR5cGU7XG4gICAgLy8gY2hhbmdlcyB0aGUgY2FsbGJhY2sgdmFsdWUgb24gXCJsb2FkXCIgZXZlbnRzLlxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmVzcG9uc2UgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIkdFVFwiLCDigKYpLlxuICAgIGdldDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJHRVRcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIlBPU1RcIiwg4oCmKS5cbiAgICBwb3N0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIlBPU1RcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBJZiBjYWxsYmFjayBpcyBub24tbnVsbCwgaXQgd2lsbCBiZSB1c2VkIGZvciBlcnJvciBhbmQgbG9hZCBldmVudHMuXG4gICAgc2VuZDogZnVuY3Rpb24obWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUsIHVzZXIsIHBhc3N3b3JkKTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmICFoZWFkZXJzLmhhcyhcImFjY2VwdFwiKSkgaGVhZGVycy5zZXQoXCJhY2NlcHRcIiwgbWltZVR5cGUgKyBcIiwqLypcIik7XG4gICAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIGhlYWRlcnMuZWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7IH0pO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgeGhyLm92ZXJyaWRlTWltZVR5cGUpIHhoci5vdmVycmlkZU1pbWVUeXBlKG1pbWVUeXBlKTtcbiAgICAgIGlmIChyZXNwb25zZVR5cGUgIT0gbnVsbCkgeGhyLnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICAgIGlmICh0aW1lb3V0ID4gMCkgeGhyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgdHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIGNhbGxiYWNrLmxlbmd0aCA9PT0gMSkgY2FsbGJhY2sgPSBmaXhDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgcmVxdWVzdC5vbihcImVycm9yXCIsIGNhbGxiYWNrKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oeGhyKSB7IGNhbGxiYWNrKG51bGwsIHhocik7IH0pO1xuICAgICAgZXZlbnQuY2FsbChcImJlZm9yZXNlbmRcIiwgcmVxdWVzdCwgeGhyKTtcbiAgICAgIHhoci5zZW5kKGRhdGEgPT0gbnVsbCA/IG51bGwgOiBkYXRhKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBhYm9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gZXZlbnQgPyByZXF1ZXN0IDogdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5mdW5jdGlvbiBmaXhDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyb3IsIHhocikge1xuICAgIGNhbGxiYWNrKGVycm9yID09IG51bGwgPyB4aHIgOiBudWxsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFzUmVzcG9uc2UoeGhyKSB7XG4gIHZhciB0eXBlID0geGhyLnJlc3BvbnNlVHlwZTtcbiAgcmV0dXJuIHR5cGUgJiYgdHlwZSAhPT0gXCJ0ZXh0XCJcbiAgICAgID8geGhyLnJlc3BvbnNlIC8vIG51bGwgb24gZXJyb3JcbiAgICAgIDogeGhyLnJlc3BvbnNlVGV4dDsgLy8gXCJcIiBvbiBlcnJvclxufVxuXG52YXIgdHlwZSA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcmVzcG9uc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiByLmdldChjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xufTtcblxudmFyIGh0bWwgPSB0eXBlKFwidGV4dC9odG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIGpzb24gPSB0eXBlKFwiYXBwbGljYXRpb24vanNvblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIHRleHQgPSB0eXBlKFwidGV4dC9wbGFpblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIHhoci5yZXNwb25zZVRleHQ7XG59KTtcblxudmFyIHhtbCA9IHR5cGUoXCJhcHBsaWNhdGlvbi94bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHZhciB4bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gIGlmICgheG1sKSB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSBlcnJvclwiKTtcbiAgcmV0dXJuIHhtbDtcbn0pO1xuXG52YXIgZHN2ID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCBwYXJzZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCByb3csIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBjYWxsYmFjayA9IHJvdywgcm93ID0gbnVsbDtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpO1xuICAgIHIucm93ID0gZnVuY3Rpb24oXykgeyByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHIucmVzcG9uc2UocmVzcG9uc2VPZihwYXJzZSwgcm93ID0gXykpIDogcm93OyB9O1xuICAgIHIucm93KHJvdyk7XG4gICAgcmV0dXJuIGNhbGxiYWNrID8gci5nZXQoY2FsbGJhY2spIDogcjtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIHJlc3BvbnNlT2YocGFyc2UsIHJvdykge1xuICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCQkMSkge1xuICAgIHJldHVybiBwYXJzZShyZXF1ZXN0JCQxLnJlc3BvbnNlVGV4dCwgcm93KTtcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcInRleHQvY3N2XCIsIGQzRHN2LmNzdlBhcnNlKTtcblxudmFyIHRzdiA9IGRzdihcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIiwgZDNEc3YudHN2UGFyc2UpO1xuXG5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuZXhwb3J0cy5odG1sID0gaHRtbDtcbmV4cG9ydHMuanNvbiA9IGpzb247XG5leHBvcnRzLnRleHQgPSB0ZXh0O1xuZXhwb3J0cy54bWwgPSB4bWw7XG5leHBvcnRzLmNzdiA9IGNzdjtcbmV4cG9ydHMudHN2ID0gdHN2O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiIWZ1bmN0aW9uKGUsbil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bihyZXF1aXJlKFwiZDMtcmVxdWVzdFwiKSk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJkMy1yZXF1ZXN0XCJdLG4pOihlLmQzPWUuZDN8fHt9LGUuZDMucHJvbWlzZT1uKGUuZDMpKX0odGhpcyxmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciB0PWFyZ3VtZW50cy5sZW5ndGgscj1BcnJheSh0KSxvPTA7dD5vO28rKylyW29dPWFyZ3VtZW50c1tvXTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxvKXt2YXIgdT1mdW5jdGlvbihlLG4pe3JldHVybiBlP3ZvaWQgbyhFcnJvcihlKSk6dm9pZCB0KG4pfTtuLmFwcGx5KGUsci5jb25jYXQodSkpfSl9fXZhciB0PXt9O3JldHVybltcImNzdlwiLFwidHN2XCIsXCJqc29uXCIsXCJ4bWxcIixcInRleHRcIixcImh0bWxcIl0uZm9yRWFjaChmdW5jdGlvbihyKXt0W3JdPW4oZSxlW3JdKX0pLHR9KTsiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbnZhciBkMyA9IHJlcXVpcmUoJ2QzLnByb21pc2UnKTtcblxuZnVuY3Rpb24gZGVmKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG59XG4vKlxuTWFuYWdlcyBmZXRjaGluZyBhIGRhdGFzZXQgZnJvbSBTb2NyYXRhIGFuZCBwcmVwYXJpbmcgaXQgZm9yIHZpc3VhbGlzYXRpb24gYnlcbmNvdW50aW5nIGZpZWxkIHZhbHVlIGZyZXF1ZW5jaWVzIGV0Yy4gXG4qL1xuZXhwb3J0IGNsYXNzIFNvdXJjZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKGRhdGFJZCwgYWN0aXZlQ2Vuc3VzWWVhcikge1xuICAgICAgICB0aGlzLmRhdGFJZCA9IGRhdGFJZDtcbiAgICAgICAgdGhpcy5hY3RpdmVDZW5zdXNZZWFyID0gZGVmKGFjdGl2ZUNlbnN1c1llYXIsIDIwMTUpO1xuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSB1bmRlZmluZWQ7ICAvLyBuYW1lIG9mIGNvbHVtbiB3aGljaCBob2xkcyBsYXQvbG9uIG9yIGJsb2NrIElEXG4gICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdW5kZWZpbmVkOyAvLyBpZiB0aGUgZGF0YXNldCB0eXBlIGlzICdwb2ludCcgKHVzZWQgZm9yIHBhcnNpbmcgbG9jYXRpb24gZmllbGQpXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTsgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBudW1lcmljIGRhdGF2aXNcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IFtdOyAgICAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIGVudW0gZGF0YXZpc1xuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBbXTsgICAgICAgICAgLy8gbmFtZXMgb2Ygb3RoZXIgY29sdW1uc1xuICAgICAgICB0aGlzLm1pbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gbWluIGFuZCBtYXggb2YgZWFjaCBudW1lcmljIGNvbHVtblxuICAgICAgICB0aGlzLm1heHMgPSB7fTtcbiAgICAgICAgdGhpcy5mcmVxdWVuY2llcyA9IHt9OyAgICAgICAgICAgIC8vIFxuICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzID0ge307ICAgICAgLy8gbW9zdCBmcmVxdWVudCB2YWx1ZXMgaW4gZWFjaCB0ZXh0IGNvbHVtblxuICAgICAgICB0aGlzLnNoYXBlID0gJ3BvaW50JzsgICAgICAgICAgICAgLy8gcG9pbnQgb3IgcG9seWdvbiAoQ0xVRSBibG9jaylcbiAgICAgICAgdGhpcy5yb3dzID0gdW5kZWZpbmVkOyAgICAgICAgICAgIC8vIHByb2Nlc3NlZCByb3dzXG4gICAgICAgIHRoaXMuYmxvY2tJbmRleCA9IHt9OyAgICAgICAgICAgICAvLyBjYWNoZSBvZiBDTFVFIGJsb2NrIElEc1xuICAgIH1cblxuXG4gICAgY2hvb3NlQ29sdW1uVHlwZXMgKGNvbHVtbnMpIHtcbiAgICAgICAgLy92YXIgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnIHx8IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgLy8gXCJsb2NhdGlvblwiIGFuZCBcInBvaW50XCIgYXJlIGJvdGggcG9pbnQgZGF0YSB0eXBlcywgZXhwcmVzc2VkIGRpZmZlcmVudGx5LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGEgXCJibG9jayBJRFwiIGNhbiBiZSBqb2luZWQgYWdhaW5zdCB0aGUgQ0xVRSBCbG9jayBwb2x5Z29ucyB3aGljaCBhcmUgaW4gTWFwYm94LlxuICAgICAgICBsZXQgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVswXTtcbiAgICAgICAgaWYgKCFsYykge1xuICAgICAgICAgICAgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAobGMuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChsYy5uYW1lID09PSAnQmxvY2sgSUQnKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlID0gJ3BvbHlnb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IGxjLm5hbWU7XG5cbiAgICAgICAgY29sdW1ucyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wgIT09IGxjKTtcblxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ251bWJlcicgJiYgY29sLm5hbWUgIT09ICdMYXRpdHVkZScgJiYgY29sLm5hbWUgIT09ICdMb25naXR1ZGUnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHsgdGhpcy5taW5zW2NvbF0gPSAxZTk7IHRoaXMubWF4c1tjb2xdID0gLTFlOTsgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3RleHQnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF0gPSB7fSk7XG5cbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiB0aGlzLm51bWVyaWNDb2x1bW5zLmluZGV4T2YoY29sKSA8IDAgJiYgdGhpcy50ZXh0Q29sdW1ucy5pbmRleE9mKGNvbCkgPCAwKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGJldHRlciBuYW1lIGFuZCBiZWhhdmlvdXJcbiAgICBmaWx0ZXIocm93KSB7XG4gICAgICAgIC8vIFRPRE8gbW92ZSB0aGlzIHNvbWV3aGVyZSBiZXR0ZXJcbiAgICAgICAgaWYgKHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSA9PT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHJvd1snQ2Vuc3VzIHllYXInXSAmJiByb3dbJ0NlbnN1cyB5ZWFyJ10gIT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cblxuICAgIC8vIGNvbnZlcnQgbnVtZXJpYyBjb2x1bW5zIHRvIG51bWJlcnMgZm9yIGRhdGEgdmlzXG4gICAgY29udmVydFJvdyhyb3cpIHtcblxuICAgICAgICAvLyBjb252ZXJ0IGxvY2F0aW9uIHR5cGVzIChzdHJpbmcpIHRvIFtsb24sIGxhdF0gYXJyYXkuXG4gICAgICAgIGZ1bmN0aW9uIGxvY2F0aW9uVG9Db29yZHMobG9jYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9jYXRpb24pLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gXCJuZXcgYmFja2VuZFwiIGRhdGFzZXRzIHVzZSBhIFdLVCBmaWVsZCBbUE9JTlQgKGxvbiBsYXQpXSBpbnN0ZWFkIG9mIChsYXQsIGxvbilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2NhdGlvbklzUG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJlcGxhY2UoJ1BPSU5UICgnLCAnJykucmVwbGFjZSgnKScsICcnKS5zcGxpdCgnICcpLm1hcChuID0+IE51bWJlcihuKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobG9jYXRpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMV0ucmVwbGFjZSgnKScsICcnKSksIE51bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVswXS5yZXBsYWNlKCcoJywgJycpKV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5yZWFkYWJsZSBsb2NhdGlvbiAke2xvY2F0aW9ufSBpbiAke3RoaXMubmFtZX0uYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPIHVzZSBjb2x1bW4uY2FjaGVkQ29udGVudHMuc21hbGxlc3QgYW5kIC5sYXJnZXN0XG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgcm93W2NvbF0gPSBOdW1iZXIocm93W2NvbF0pIDsgLy8gK3Jvd1tjb2xdIGFwcGFyZW50bHkgZmFzdGVyLCBidXQgYnJlYWtzIG9uIHNpbXBsZSB0aGluZ3MgbGlrZSBibGFuayB2YWx1ZXNcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaW5jbHVkZSB0aGUgdG90YWwgdmFsdWVzIGluIFxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdIDwgdGhpcy5taW5zW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnNbY29sXSA9IHJvd1tjb2xdO1xuXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPiB0aGlzLm1heHNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWF4c1tjb2xdID0gcm93W2NvbF07XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHZhciB2YWwgPSByb3dbY29sXTtcbiAgICAgICAgICAgIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxdID0gKHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxdIHx8IDApICsgMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dID0gbG9jYXRpb25Ub0Nvb3Jkcy5jYWxsKHRoaXMsIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSk7XG5cbiAgICAgICAgaWYgKCFyb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gc2tpcCB0aGlzIHJvdy5cblxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpIHtcbiAgICAgICAgdmFyIG5ld1RleHRDb2x1bW5zID0gW107XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdID0gT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKVxuICAgICAgICAgICAgICAgIC5zb3J0KCh2YWxhLCB2YWxiKSA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYV0gPCB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYl0gPyAxIDogLTEpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsMTIpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPCAyIHx8IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoID4gMjAgJiYgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3RoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXVsxXV0gPD0gNSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYm9yaW5nIGlmIGFsbCB2YWx1ZXMgdGhlIHNhbWUsIG9yIGlmIHRvbyBtYW55IGRpZmZlcmVudCB2YWx1ZXMgKGFzIGp1ZGdlZCBieSBzZWNvbmQtbW9zdCBjb21tb24gdmFsdWUgYmVpbmcgNSB0aW1lcyBvciBmZXdlcilcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUZXh0Q29sdW1ucy5wdXNoKGNvbCk7IC8vIGhvdyBkbyB5b3Ugc2FmZWx5IGRlbGV0ZSBmcm9tIGFycmF5IHlvdSdyZSBsb29waW5nIG92ZXI/XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IG5ld1RleHRDb2x1bW5zO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29ydGVkRnJlcXVlbmNpZXMpO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHJvd3MgZnJvbSBTb2NyYXRhIChyZXR1cm5zIFByb21pc2UpLiBcIk5ldyBiYWNrZW5kXCIgdmlld3MgZ28gdGhyb3VnaCBhbiBhZGRpdGlvbmFsIHN0ZXAgdG8gZmluZCB0aGUgcmVhbFxuICAgIC8vIEFQSSBlbmRwb2ludC5cbiAgICBsb2FkKCkge1xuICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnLmpzb24nKVxuICAgICAgICAudGhlbihwcm9wcyA9PiB7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBwcm9wcy5uYW1lO1xuICAgICAgICAgICAgaWYgKHByb3BzLm5ld0JhY2tlbmQgJiYgcHJvcHMuY2hpbGRWaWV3cy5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFJZCA9IHByb3BzLmNoaWxkVmlld3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHByb3BzID0+IHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBkMy5jc3YoJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy9yb3dzLmNzdj9hY2Nlc3NUeXBlPURPV05MT0FEJywgdGhpcy5jb252ZXJ0Um93LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiR290IHJvd3MgZm9yIFwiICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2x5Z29uJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlQmxvY2tJbmRleCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQcm9ibGVtIGxvYWRpbmcgJyArIHRoaXMubmFtZSArICcuJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2JsZW0gbG9hZGluZyAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIENyZWF0ZSBhIGhhc2ggdGFibGUgbG9va3VwIGZyb20gW3llYXIsIGJsb2NrIElEXSB0byBkYXRhc2V0IHJvd1xuICAgIGNvbXB1dGVCbG9ja0luZGV4KCkge1xuICAgICAgICB0aGlzLnJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dW3Jvd1snQmxvY2sgSUQnXV0gPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0Um93Rm9yQmxvY2soYmxvY2tJZCAvKiBjZW5zdXNfeWVhciAqLykge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzW3RoaXMuYmxvY2tJbmRleFt0aGlzLmFjdGl2ZUNlbnN1c1llYXJdW2Jsb2NrSWRdXTtcbiAgICB9XG5cbiAgICBmaWx0ZXJlZFJvd3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKHJvdyA9PiByb3dbJ0NlbnN1cyB5ZWFyJ10gPT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciAmJiByb3dbJ0NMVUUgc21hbGwgYXJlYSddICE9PSAnQ2l0eSBvZiBNZWxib3VybmUgdG90YWwnKTtcbiAgICB9XG59Il19

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
                nextDataset(map, 0); // which dataset to start at. (0 for prod)
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBTkE7QUFDQTtBQUNBO0FBS0EsUUFBUSxHQUFSO0FBQ0E7QUFDQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QUFjLHFCQUFxQixPQUFLLElBQTFCLEdBQWlDLEdBQS9DO0FBQ0EsZ0NBQVEsS0FBUixDQUFjLENBQWQ7QUFDSCxxQkFaTSxDQUFQO0FBYUMsaUJBZEQsQ0FjRSxPQUFPLENBQVAsRUFBVTtBQUNSLDRCQUFRLEtBQVIsQ0FBYyxxQkFBcUIsT0FBSyxJQUF4QztBQUNBLDRCQUFRLEtBQVIsQ0FBYyxDQUFkO0FBQ0g7QUFDSixhQWhDTSxDQUFQO0FBaUNIOztBQUdEOzs7OzRDQUNvQjtBQUFBOztBQUNoQixpQkFBSyxJQUFMLENBQVUsT0FBVixDQUFrQixVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQzlCLG9CQUFJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsTUFBd0MsU0FBNUMsRUFDSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLElBQXNDLEVBQXRDO0FBQ0osdUJBQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsRUFBb0MsSUFBSSxVQUFKLENBQXBDLElBQXVELEtBQXZEO0FBQ0gsYUFKRDtBQUtIOzs7dUNBRWMsTyxDQUFRLGlCLEVBQW1CO0FBQ3RDLG1CQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLGdCQUFyQixFQUF1QyxPQUF2QyxDQUFWLENBQVA7QUFDSDs7O3VDQUVjO0FBQUE7O0FBQ1gsbUJBQU8sS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQjtBQUFBLHVCQUFPLElBQUksYUFBSixNQUF1QixPQUFLLGdCQUE1QixJQUFnRCxJQUFJLGlCQUFKLE1BQTJCLHlCQUFsRjtBQUFBLGFBQWpCLENBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbi8vJ3VzZSBzdHJpY3QnO1xuLy92YXIgbWFwYm94Z2wgPSByZXF1aXJlKCdtYXBib3gtZ2wnKTtcbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuaW1wb3J0IHsgRmxpZ2h0UGF0aCB9IGZyb20gJy4vZmxpZ2h0UGF0aCc7XG5pbXBvcnQgeyBkYXRhc2V0cyB9IGZyb20gJy4vY3ljbGVEYXRhc2V0cyc7XG5pbXBvcnQgeyBNYXBWaXMgfSBmcm9tICcuL21hcFZpcyc7XG5jb25zb2xlLmxvZyhkYXRhc2V0cyk7XG4vL21hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWGh4Y0dzMGJ6Y3dZbk0zTW5ac09XSmlhalZ3YUhKMkluMC5STjdLeXdNT3hMTE5tY1RGZm4wY2lnJztcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWTJsMGVXOW1iV1ZzWW05MWNtNWxJaXdpWVNJNkltTnBlamRvYjJKMGN6QXdPV1F6TTIxdWJHdDZNRFZxYUhvaWZRLjU1WWJxZVRIV01LX2I2Q0VBbW9VbEEnO1xuLypcblBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uczogeWdhdy02cnpxXG5cbioqVHJlZXM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZnAzOC13aXl5XG5cbkV2ZW50IGJvb2tpbmdzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvIzg0YmYtZGloaVxuQmlrZSBzaGFyZSBzdGF0aW9uczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyN0ZHZoLW45ZHZcbkRBTTogaHR0cDovL2xvY2FsaG9zdDozMDAyLyNnaDdzLXFkYThcbiovXG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmxldCB3aGVuTWFwTG9hZGVkID0gKG1hcCwgZikgPT4gbWFwLmxvYWRlZCgpID8gZigpIDogbWFwLm9uY2UoJ2xvYWQnLCBmKTtcblxubGV0IGNsb25lID0gb2JqID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG5cbmNvbnN0IG9wYWNpdHlQcm9wID0ge1xuICAgICAgICAgICAgZmlsbDogJ2ZpbGwtb3BhY2l0eScsXG4gICAgICAgICAgICBjaXJjbGU6ICdjaXJjbGUtb3BhY2l0eScsXG4gICAgICAgICAgICBzeW1ib2w6ICdpY29uLW9wYWNpdHknLFxuICAgICAgICAgICAgJ2xpbmUnOiAnbGluZS1vcGFjaXR5JyxcbiAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbic6ICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5J1xuICAgICAgICB9O1xuXG4vLyByZXR1cm5zIGEgdmFsdWUgbGlrZSAnY2lyY2xlLW9wYWNpdHknLCBmb3IgYSBnaXZlbiBsYXllciBzdHlsZS5cbmZ1bmN0aW9uIGdldE9wYWNpdHlQcm9wcyhsYXllcikge1xuICAgIGxldCByZXQgPSBbb3BhY2l0eVByb3BbbGF5ZXIudHlwZV1dO1xuICAgIGlmIChsYXllci5sYXlvdXQgJiYgbGF5ZXIubGF5b3V0Wyd0ZXh0LWZpZWxkJ10pXG4gICAgICAgIHJldC5wdXNoKCd0ZXh0LW9wYWNpdHknKTtcbiAgICBcbiAgICByZXR1cm4gcmV0O1xufVxuXG4vL2ZhbHNlICYmIHdoZW5NYXBMb2FkZWQoKCkgPT5cbi8vICBzZXRWaXNDb2x1bW4oc291cmNlRGF0YS5udW1lcmljQ29sdW1uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmxlbmd0aCldKSk7XG5cbi8vIFRPRE8gZGVjaWRlIGlmIHRoaXMgc2hvdWxkIGJlIGluIE1hcFZpc1xuZnVuY3Rpb24gc2hvd0ZlYXR1cmVUYWJsZShmZWF0dXJlLCBzb3VyY2VEYXRhLCBtYXB2aXMpIHtcbiAgICBmdW5jdGlvbiByb3dzSW5BcnJheShhcnJheSwgY2xhc3NTdHIpIHtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+JyArIFxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZmVhdHVyZSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkgPT09IHVuZGVmaW5lZCB8fCBhcnJheS5pbmRleE9mKGtleSkgPj0gMClcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PlxuICAgICAgICAgICAgICAgICAgICBgPHRyPjx0ZCAke2NsYXNzU3RyfT4ke2tleX08L3RkPjx0ZD4ke2ZlYXR1cmVba2V5XX08L3RkPjwvdHI+YClcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJykgKyBcbiAgICAgICAgICAgICc8L3RhYmxlPic7XG4gICAgICAgIH1cblxuICAgIGlmIChmZWF0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQ2FsbGVkIGJlZm9yZSB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYW55dGhpbmdcbiAgICAgICAgZmVhdHVyZSA9IHt9O1xuICAgICAgICBzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG5cbiAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2x5Z29uJykgeyAvLyBUT0RPIGNoZWNrIHRoYXQgdGhpcyBpcyBhIGJsb2NrIGxvb2t1cCBjaG9yb3BsZXRoXG4gICAgICAgIGZlYXR1cmUgPSBzb3VyY2VEYXRhLmdldFJvd0ZvckJsb2NrKGZlYXR1cmUuYmxvY2tfaWQsIGZlYXR1cmUuY2Vuc3VzX3lyKTsgICAgICAgIFxuICAgIH1cblxuXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmVhdHVyZXMnKS5pbm5lckhUTUwgPSBcbiAgICAgICAgJzxoND5DbGljayBhIGZpZWxkIHRvIHZpc3VhbGlzZSB3aXRoIGNvbG91cjwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEudGV4dENvbHVtbnMsICdjbGFzcz1cImVudW0tZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBzaXplPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucywgJ2NsYXNzPVwibnVtZXJpYy1maWVsZFwiJykgKyBcbiAgICAgICAgJzxoND5PdGhlciBmaWVsZHM8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMsICcnKTtcblxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2ZlYXR1cmVzIHRkJykuZm9yRWFjaCh0ZCA9PiBcbiAgICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgIG1hcHZpcy5zZXRWaXNDb2x1bW4oZS50YXJnZXQuaW5uZXJUZXh0KSA7IC8vIFRPRE8gaGlnaGxpZ2h0IHRoZSBzZWxlY3RlZCByb3dcbiAgICAgICAgfSkpO1xufVxuXG52YXIgbGFzdEZlYXR1cmU7XG5cblxuZnVuY3Rpb24gY2hvb3NlRGF0YXNldCgpIHtcbiAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2gpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJyMnLCcnKTtcbiAgICB9XG5cbiAgICAvLyBrbm93biBDTFVFIGJsb2NrIGRhdGFzZXRzIHRoYXQgd29yayBva1xuICAgIHZhciBjbHVlQ2hvaWNlcyA9IFtcbiAgICAgICAgJ2IzNmota2l5NCcsIC8vIGVtcGxveW1lbnRcbiAgICAgICAgJzIzNHEtZ2c4MycsIC8vIGZsb29yIHNwYWNlIGJ5IHVzZSBieSBibG9ja1xuICAgICAgICAnYzNndC1ocno2JyAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cyAtLSB0aGlzIG9uZSBpcyBjb21wbGV0ZSwgdGhlIG90aGVycyBoYXZlIGdhcHB5IGRhdGEgZm9yIGNvbmZpZGVudGlhbGl0eVxuICAgIF07XG5cbiAgICAvLyBrbm93biBwb2ludCBkYXRhc2V0cyB0aGF0IHdvcmsgb2tcbiAgICB2YXIgcG9pbnRDaG9pY2VzID0gW1xuICAgICAgICAnZnAzOC13aXl5JywgLy8gdHJlZXNcbiAgICAgICAgJ3lnYXctNnJ6cScsIC8vIHBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uc1xuICAgICAgICAnODRiZi1kaWhpJywgLy8gVmVudWVzIGZvciBldmVudHNcbiAgICAgICAgJ3RkdmgtbjlkdicsIC8vIExpdmUgYmlrZSBzaGFyZVxuICAgICAgICAnZ2g3cy1xZGE4JywgLy8gREFNXG4gICAgICAgICdzZnJnLXp5Z2InLCAvLyBDYWZlcyBhbmQgUmVzdGF1cmFudHNcbiAgICAgICAgJ2V3NmstY2h6NCcsIC8vIEJpbyBCbGl0eiAyMDE2XG4gICAgICAgICc3dnJkLTRhdjUnLCAvLyB3YXlmaW5kaW5nXG4gICAgICAgICdzczc5LXY1NTgnLCAvLyBidXMgc3RvcHNcbiAgICAgICAgJ21mZmktbTl5bicsIC8vIHB1YnNcbiAgICAgICAgJ3N2dXgtYmFkYScsIC8vIHNvaWwgdGV4dHVyZXMgLSBuaWNlIG9uZVxuICAgICAgICAncWp3Yy1mNXNoJywgLy8gY29tbXVuaXR5IGZvb2QgZ3VpZGUgLSBnb29kXG4gICAgICAgICdmdGhpLXphanknLCAvLyBwcm9wZXJ0aWVzIG92ZXIgJDIuNW1cbiAgICAgICAgJ3R4OGgtMmpnaScsIC8vIGFjY2Vzc2libGUgdG9pbGV0c1xuICAgICAgICAnNnU1ei11YnZoJywgLy8gYmljeWNsZSBwYXJraW5nXG4gICAgICAgIC8vYnM3bi01dmVoLCAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cy4gMTAwLDAwMCByb3dzLCB0b28gZnJhZ2lsZS5cbiAgICAgICAgXTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uIGgxJykuaW5uZXJIVE1MID0gJ0xvYWRpbmcgcmFuZG9tIGRhdGFzZXQuLi4nO1xuICAgIHJldHVybiBwb2ludENob2ljZXNbTWF0aC5yb3VuZChNYXRoLnJhbmRvbSgpICogcG9pbnRDaG9pY2VzLmxlbmd0aCldO1xuICAgIC8vcmV0dXJuICdjM2d0LWhyejYnO1xufVxuXG5mdW5jdGlvbiBzaG93Q2FwdGlvbihuYW1lLCBkYXRhSWQsIGNhcHRpb24pIHtcbiAgICBsZXQgaW5jbHVkZU5vID0gZmFsc2U7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcHRpb24gaDEnKS5pbm5lckhUTUwgPSAoaW5jbHVkZU5vID8gKF9kYXRhc2V0Tm8gfHwgJycpOicnKSArIChjYXB0aW9uIHx8IG5hbWUgfHwgJycpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb290ZXIgLmRhdGFzZXQnKS5pbm5lckhUTUwgPSBuYW1lIHx8ICcnO1xuICAgIFxuICAgIC8vIFRPRE8gcmVpbnN0YXRlIGZvciBub24tZGVtbyBtb2RlLlxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NvdXJjZScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvZC8nICsgZGF0YUlkKTtcbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaGFyZScpLmlubmVySFRNTCA9IGBTaGFyZSB0aGlzOiA8YSBocmVmPVwiaHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH1cIj5odHRwczovL2NpdHktb2YtbWVsYm91cm5lLmdpdGh1Yi5pby9EYXRhM0QvIyR7ZGF0YUlkfTwvYT5gOyAgICBcbiBcbiB9XG5cbiBmdW5jdGlvbiB0d2Vha1BsYWNlTGFiZWxzKG1hcCwgdXApIHtcbiAgICBbJ3BsYWNlLXN1YnVyYicsICdwbGFjZS1uZWlnaGJvdXJob29kJ10uZm9yRWFjaChsYXllcklkID0+IHtcblxuICAgICAgICAvL3JnYigyMjcsIDQsIDgwKTsgQ29NIHBvcCBtYWdlbnRhXG4gICAgICAgIC8vbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXJJZCwgJ3RleHQtY29sb3InLCB1cCA/ICdyZ2IoMjI3LDQsODApJyA6ICdoc2woMCwwLDMwJSknKTsgLy8gQ29NIHBvcCBtYWdlbnRhXG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVySWQsICd0ZXh0LWNvbG9yJywgdXAgPyAncmdiKDAsMTgzLDc5KScgOiAnaHNsKDAsMCwzMCUpJyk7IC8vIENvTSBwb3AgZ3JlZW5cbiAgICAgICAgXG4gICAgfSk7XG4gfVxuXG4gZnVuY3Rpb24gdHdlYWtCYXNlbWFwKG1hcCkge1xuICAgIHZhciBwbGFjZWNvbG9yID0gJyM4ODgnOyAvLydyZ2IoMjA2LCAyMTksIDE3NSknO1xuICAgIHZhciByb2FkY29sb3IgPSAnIzc3Nyc7IC8vJ3JnYigyNDAsIDE5MSwgMTU2KSc7XG4gICAgbWFwLmdldFN0eWxlKCkubGF5ZXJzLmZvckVhY2gobGF5ZXIgPT4ge1xuICAgICAgICBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNjAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCAyMCUpJyk7XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDcwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA3OCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDQ1JSknKTsgLy8gcm9hZHMgbW9zdGx5XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDkwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgIH0pO1xuICAgIFsncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnXS5mb3JFYWNoKGlkID0+IHtcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoaWQsICd0ZXh0LWNvbG9yJywgJyMzMzMnKTtcbiAgICB9KTtcblxuICAgIG1hcC5yZW1vdmVMYXllcigncGxhY2UtY2l0eS1sZy1zJyk7IC8vIHJlbW92ZSB0aGUgTWVsYm91cm5lIGxhYmVsIGl0c2VsZi5cblxufVxuXG4vKlxuICBSZWZyZXNoIHRoZSBtYXAgdmlldyBmb3IgdGhpcyBuZXcgZGF0YXNldC5cbiovXG5mdW5jdGlvbiBzaG93RGF0YXNldChtYXAsIGRhdGFzZXQsIGZpbHRlciwgY2FwdGlvbiwgbm9GZWF0dXJlSW5mbywgb3B0aW9ucywgaW52aXNpYmxlKSB7XG4gICAgXG4gICAgb3B0aW9ucyA9IGRlZihvcHRpb25zLCB7fSk7XG4gICAgaWYgKGludmlzaWJsZSkge1xuICAgICAgICBvcHRpb25zLmludmlzaWJsZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy9zaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkLCBjYXB0aW9uKTtcbiAgICB9XG5cbiAgICBsZXQgbWFwdmlzID0gbmV3IE1hcFZpcyhtYXAsIGRhdGFzZXQsIGZpbHRlciwgIW5vRmVhdHVyZUluZm8/IHNob3dGZWF0dXJlVGFibGUgOiBudWxsLCBvcHRpb25zKTtcblxuICAgIHNob3dGZWF0dXJlVGFibGUodW5kZWZpbmVkLCBkYXRhc2V0LCBtYXB2aXMpOyBcbiAgICByZXR1cm4gbWFwdmlzO1xufVxuXG5mdW5jdGlvbiBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCkge1xuICAgIGlmICghbWFwLmdldFNvdXJjZShkYXRhc2V0Lm1hcGJveC5zb3VyY2UpKSB7XG4gICAgICAgIG1hcC5hZGRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlLCB7XG4gICAgICAgICAgICB0eXBlOiAndmVjdG9yJyxcbiAgICAgICAgICAgIHVybDogZGF0YXNldC5tYXBib3guc291cmNlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8qXG4gIFNob3cgYSBkYXRhc2V0IHRoYXQgYWxyZWFkeSBleGlzdHMgb24gTWFwYm94XG4qL1xuZnVuY3Rpb24gc2hvd01hcGJveERhdGFzZXQobWFwLCBkYXRhc2V0LCBpbnZpc2libGUpIHtcbiAgICBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCk7XG4gICAgbGV0IHN0eWxlID0gbWFwLmdldExheWVyKGRhdGFzZXQubWFwYm94LmlkKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIC8vaWYgKGludmlzaWJsZSlcbiAgICAgICAgICAgIC8vZGF0YXNldC5tYXBib3hcbiAgICAgICAgc3R5bGUgPSBjbG9uZShkYXRhc2V0Lm1hcGJveCk7XG4gICAgICAgIGlmIChpbnZpc2libGUpIHtcbiAgICAgICAgICAgIGdldE9wYWNpdHlQcm9wcyhzdHlsZSkuZm9yRWFjaChwcm9wID0+IHN0eWxlLnBhaW50W3Byb3BdID0gMCk7XG4gICAgICAgICAgICBcbiAgICAgICAgfVxuICAgICAgICBtYXAuYWRkTGF5ZXIoc3R5bGUpO1xuICAgIH0gZWxzZSBpZiAoIWludmlzaWJsZSl7XG4gICAgICAgIGdldE9wYWNpdHlQcm9wcyhzdHlsZSkuZm9yRWFjaChwcm9wID0+XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShkYXRhc2V0Lm1hcGJveC5pZCwgcHJvcCwgZGVmKGRhdGFzZXQub3BhY2l0eSwwLjkpKSk7XG4gICAgfVxuICAgIGRhdGFzZXQuX2xheWVySWQgPSBkYXRhc2V0Lm1hcGJveC5pZDtcblxuICAgIC8vaWYgKCFpbnZpc2libGUpIFxuICAgICAgICAvLyBzdXJlbHkgdGhpcyBpcyBhbiBlcnJvciAtIG1hcGJveCBkYXRhc2V0cyBkb24ndCBoYXZlICdkYXRhSWQnXG4gICAgICAgIC8vc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgZGF0YXNldC5jYXB0aW9uKTtcbn1cblxuZnVuY3Rpb24gcHJlbG9hZERhdGFzZXQobWFwLCBkKSB7XG4gICAgY29uc29sZS5sb2coJ1ByZWxvYWQ6ICcgKyBkLmNhcHRpb24pO1xuICAgIGlmIChkLm1hcGJveCkge1xuXG4gICAgICAgIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZCwgdHJ1ZSk7XG4gICAgfSBlbHNlIGlmIChkLmRhdGFzZXQpIHtcbiAgICAgICAgZC5tYXB2aXMgPSBzaG93RGF0YXNldChtYXAsIGQuZGF0YXNldCwgZC5maWx0ZXIsIGQuY2FwdGlvbiwgdHJ1ZSwgZC5vcHRpb25zLCAgdHJ1ZSk7XG4gICAgICAgIGQubWFwdmlzLnNldFZpc0NvbHVtbihkLmNvbHVtbik7XG4gICAgICAgIGQuX2xheWVySWQgPSBkLm1hcHZpcy5sYXllcklkO1xuICAgIH1cbn1cbi8vIFR1cm4gaW52aXNpYmxlIGRhdGFzZXQgaW50byB2aXNpYmxlXG5mdW5jdGlvbiByZXZlYWxEYXRhc2V0KG1hcCwgZCkge1xuICAgIGNvbnNvbGUubG9nKCdSZXZlYWw6ICcgKyBkLmNhcHRpb24gICsgYCAoJHtfZGF0YXNldE5vfSlgKTtcbiAgICAvLyBUT0RPIGNoYW5nZSAwLjkgdG8gc29tZXRoaW5nIHNwZWNpZmljIGZvciBlYWNoIHR5cGVcbiAgICBpZiAoZC5tYXBib3ggfHwgZC5kYXRhc2V0KSB7XG4gICAgICAgIGdldE9wYWNpdHlQcm9wcyhtYXAuZ2V0TGF5ZXIoZC5fbGF5ZXJJZCkpLmZvckVhY2gocHJvcCA9PlxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoZC5fbGF5ZXJJZCwgcHJvcCwgZGVmKGQub3BhY2l0eSwgMC45KSkpO1xuICAgIH0gZWxzZSBpZiAoZC5wYWludCkge1xuICAgICAgICBkLl9vbGRQYWludCA9IFtdO1xuICAgICAgICBkLnBhaW50LmZvckVhY2gocGFpbnQgPT4ge1xuICAgICAgICAgICAgZC5fb2xkUGFpbnQucHVzaChbcGFpbnRbMF0sIHBhaW50WzFdLCBtYXAuZ2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0pXSk7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0sIHBhaW50WzJdKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGlmIChkLmNhcHRpb24pIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgfSBlbHNlIGlmIChkLmRhdGFzZXQpIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZC5kYXRhc2V0Lm5hbWUsIGQuZGF0YXNldC5kYXRhSWQsIGQuY2FwdGlvbik7XG4gICAgfVxuXG4gICAgaWYgKGQuc3VwZXJDYXB0aW9uKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbicpLmNsYXNzTGlzdC5hZGQoJ3N1cGVyY2FwdGlvbicpO1xufVxuLy8gUmVtb3ZlIHRoZSBkYXRhc2V0IGZyb20gdGhlIG1hcCwgbGlrZSBpdCB3YXMgbmV2ZXIgbG9hZGVkLlxuZnVuY3Rpb24gcmVtb3ZlRGF0YXNldChtYXAsIGQpIHtcbiAgICBjb25zb2xlLmxvZygnUmVtb3ZlOiAnICsgZC5jYXB0aW9uICArIGAgKCR7X2RhdGFzZXROb30pYCk7XG4gICAgaWYgKGQubWFwdmlzKVxuICAgICAgICBkLm1hcHZpcy5yZW1vdmUoKTtcbiAgICBcbiAgICBpZiAoZC5tYXBib3gpXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihkLm1hcGJveC5pZCk7XG5cbiAgICBpZiAoZC5wYWludCAmJiAhZC5rZWVwUGFpbnQpIC8vIHJlc3RvcmUgcGFpbnQgc2V0dGluZ3MgYmVmb3JlIHRoZXkgd2VyZSBtZXNzZWQgdXBcbiAgICAgICAgZC5fb2xkUGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0sIHBhaW50WzJdKTtcbiAgICAgICAgfSk7XG5cbiAgICBpZiAoZC5zdXBlckNhcHRpb24pXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnc3VwZXJjYXB0aW9uJyk7XG5cbiAgICBkLl9sYXllcklkID0gdW5kZWZpbmVkO1xufVxuXG5cblxubGV0IF9kYXRhc2V0Tm89Jyc7XG4vKiBBZHZhbmNlIGFuZCBkaXNwbGF5IHRoZSBuZXh0IGRhdGFzZXQgaW4gb3VyIGxvb3AgXG5FYWNoIGRhdGFzZXQgaXMgcHJlLWxvYWRlZCBieSBiZWluZyBcInNob3duXCIgaW52aXNpYmxlIChvcGFjaXR5IDApLCB0aGVuIFwicmV2ZWFsZWRcIiBhdCB0aGUgcmlnaHQgdGltZS5cblxuICAgIC8vIFRPRE8gY2xlYW4gdGhpcyB1cCBzbyByZWxhdGlvbnNoaXAgYmV0d2VlbiBcIm5vd1wiIGFuZCBcIm5leHRcIiBpcyBjbGVhcmVyLCBubyByZXBldGl0aW9uLlxuXG4qL1xuZnVuY3Rpb24gbmV4dERhdGFzZXQobWFwLCBkYXRhc2V0Tm8sIHJlbW92ZUZpcnN0KSB7XG4gICAgLy8gSW52aXNpYmx5IGxvYWQgZGF0YXNldCBpbnRvIHRoZSBtYXAuXG4gICAgZnVuY3Rpb24gZGVsYXkoZiwgbXMpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gIXdpbmRvdy5zdG9wcGVkICYmIGYoKSwgbXMpO1xuICAgIH1cblxuICAgIF9kYXRhc2V0Tm8gPSBkYXRhc2V0Tm87XG4gICAgbGV0IGQgPSBkYXRhc2V0c1tkYXRhc2V0Tm9dLCBcbiAgICAgICAgbmV4dEQgPSBkYXRhc2V0c1soZGF0YXNldE5vICsgMSkgJSBkYXRhc2V0cy5sZW5ndGhdO1xuXG4gICAgaWYgKHJlbW92ZUZpcnN0KVxuICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbKGRhdGFzZXRObyAtIDEgKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoXSk7XG5cbiAgICAvLyBpZiBmb3Igc29tZSByZWFzb24gdGhpcyBkYXRhc2V0IGhhc24ndCBhbHJlYWR5IGJlZW4gbG9hZGVkLlxuICAgIGlmICghZC5fbGF5ZXJJZCkge1xuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGQpO1xuICAgIH1cbiAgICBpZiAoZC5fbGF5ZXJJZCAmJiAhbWFwLmdldExheWVyKGQuX2xheWVySWQpKVxuICAgICAgICB0aHJvdyAnSGVscDogTGF5ZXIgbm90IGxvYWRlZDogJyArIGQuX2xheWVySWQ7XG4gICAgcmV2ZWFsRGF0YXNldChtYXAsIGQpO1xuICAgICAgICBcblxuICAgIC8vIGxvYWQsIGJ1dCBkb24ndCBzaG93LCBuZXh0IG9uZS4gLy8gQ29tbWVudCBvdXQgdGhlIG5leHQgbGluZSB0byBub3QgZG8gdGhlIHByZS1sb2FkaW5nIHRoaW5nLlxuICAgIC8vIHdlIHdhbnQgdG8gc2tpcCBcImRhdGFzZXRzXCIgdGhhdCBhcmUganVzdCBjYXB0aW9ucyBldGMuXG4gICAgbGV0IG5leHRSZWFsRGF0YXNldE5vID0gKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoO1xuICAgIHdoaWxlIChkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10gJiYgIWRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXS5kYXRhc2V0ICYmICFkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10ubWFwYm94ICYmIG5leHRSZWFsRGF0YXNldE5vIDwgZGF0YXNldHMubGVuZ3RoKVxuICAgICAgICBuZXh0UmVhbERhdGFzZXRObyArKztcbiAgICBpZiAoZGF0YXNldHNbbmV4dFJlYWxEYXRhc2V0Tm9dKVxuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXSk7XG5cbiAgICBpZiAoZC5zaG93TGVnZW5kKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmRzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFdlJ3JlIGFpbWluZyB0byBhcnJpdmUgYXQgdGhlIHZpZXdwb2ludCAxLzMgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgYXBwZWFyYW5jZVxuICAgIC8vIGFuZCBsZWF2ZSAyLzMgb2YgdGhlIHdheSB0aHJvdWdoLlxuICAgIGlmIChkLmZseVRvICYmICFtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgICBkLmZseVRvLmR1cmF0aW9uID0gZC5kZWxheS8zOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgbWFwLmZseVRvKGQuZmx5VG8sIHsgc291cmNlOiAnbmV4dERhdGFzZXQnfSk7XG4gICAgfVxuICAgIFxuICAgIGlmIChuZXh0RC5mbHlUbykge1xuICAgICAgICAvLyBnb3QgdG8gYmUgY2FyZWZ1bCBpZiB0aGUgZGF0YSBvdmVycmlkZXMgdGhpcyxcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkZWYobmV4dEQuZmx5VG8uZHVyYXRpb24sIGQuZGVsYXkvMyArIG5leHRELmRlbGF5LzMpOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgZGVsYXkoKCkgPT4gbWFwLmZseVRvKG5leHRELmZseVRvLCB7IHNvdXJjZTogJ25leHREYXRhc2V0J30pLCBkLmRlbGF5ICogMi8zKTtcbiAgICB9XG5cbiAgICBkZWxheSgoKSA9PiByZW1vdmVEYXRhc2V0KG1hcCwgZCksIGQuZGVsYXkgKyBkZWYoZC5saW5nZXIsIDApKTsgLy8gb3B0aW9uYWwgXCJsaW5nZXJcIiB0aW1lIGFsbG93cyBvdmVybGFwLiBOb3QgZ2VuZXJhbGx5IG5lZWRlZCBzaW5jZSB3ZSBpbXBsZW1lbnRlZCBwcmVsb2FkaW5nLlxuICAgIFxuICAgIGRlbGF5KCgpID0+IG5leHREYXRhc2V0KG1hcCwgKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoKSwgZC5kZWxheSApO1xufVxuXG4vKiBQcmUgZG93bmxvYWQgYWxsIG5vbi1tYXBib3ggZGF0YXNldHMgaW4gdGhlIGxvb3AgKi9cbmZ1bmN0aW9uIGxvYWREYXRhc2V0cyhtYXApIHtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGRhdGFzZXRzLm1hcChkID0+IHsgXG4gICAgICAgICAgICBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRpbmcgZGF0YXNldCAnICsgZC5kYXRhc2V0LmRhdGFJZCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGQuZGF0YXNldC5sb2FkKCk7XG4gICAgICAgICAgICB9IGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH0pKS50aGVuKCgpID0+IGRhdGFzZXRzWzBdLmRhdGFzZXQpO1xufVxuXG5mdW5jdGlvbiBsb2FkT25lRGF0YXNldCgpIHtcbiAgICBsZXQgZGF0YXNldCA9IGNob29zZURhdGFzZXQoKTtcbiAgICByZXR1cm4gbmV3IFNvdXJjZURhdGEoZGF0YXNldCkubG9hZCgpO1xuICAgIC8qaWYgKGRhdGFzZXQubWF0Y2goLy4uLi4tLi4uLi8pKVxuICAgICAgICBcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7Ki9cbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIFxuICAgIHRyeSB7XG4gICAgICAgIGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICB9XG5cblxuICAgIGxldCBkZW1vTW9kZSA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoID09PSAnI2RlbW8nO1xuICAgIGlmIChkZW1vTW9kZSkge1xuICAgICAgICAvLyBpZiB3ZSBkaWQgdGhpcyBhZnRlciB0aGUgbWFwIHdhcyBsb2FkaW5nLCBjYWxsIG1hcC5yZXNpemUoKTtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZlYXR1cmVzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJzsgICAgICAgIFxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgICAgIC8vIEZvciBwZW9wbGUgd2hvIHdhbnQgdGhlIHNjcmlwdC4gICAgICAgIFxuICAgICAgICB3aW5kb3cuY2FwdGlvbnMgPSBkYXRhc2V0cy5tYXAoZCA9PiBgJHtkLmNhcHRpb259ICgke2QuZGVsYXkgLyAxMDAwfXMpYCkuam9pbignXFxuJyk7XG4gICAgfVxuXG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9NScsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDEzLC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCh7Y29tcGFjdDp0cnVlfSksICd0b3AtcmlnaHQnKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywgKCkgPT4gdHdlYWtCYXNlbWFwKG1hcCkpO1xuICAgIC8vbWFwLm9uY2UoJ2xvYWQnLCgpID0+IHR3ZWFrUGxhY2VMYWJlbHMobWFwLHRydWUpKTtcbiAgICAvL3NldFRpbWVvdXQoKCk9PnR3ZWFrUGxhY2VMYWJlbHMobWFwLCBmYWxzZSksIDgwMDApO1xuICAgIG1hcC5vbignbW92ZWVuZCcsIChlLGRhdGEpPT4ge1xuICAgICAgICBpZiAoZS5zb3VyY2UgPT09ICduZXh0RGF0YXNldCcpXG4gICAgICAgICAgICByZXR1cm47XG5cbiAgICAgICAgY29uc29sZS5sb2coe1xuICAgICAgICAgICAgY2VudGVyOiBtYXAuZ2V0Q2VudGVyKCksXG4gICAgICAgICAgICB6b29tOiBtYXAuZ2V0Wm9vbSgpLFxuICAgICAgICAgICAgYmVhcmluZzogbWFwLmdldEJlYXJpbmcoKSxcbiAgICAgICAgICAgIHBpdGNoOiBtYXAuZ2V0UGl0Y2goKVxuICAgICAgICB9KTtcbiAgICB9KTtcbiAgICAvKm1hcC5vbignZXJyb3InLCBlID0+IHtcbiAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTsqL1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZT0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlLmtleUNvZGUpO1xuICAgICAgICAvLyAsIGFuZCAuIHN0b3AgdGhlIGFuaW1hdGlvbiBhbmQgYWR2YW5jZSBmb3J3YXJkL2JhY2tcbiAgICAgICAgaWYgKFsxOTAsIDE4OF0uaW5kZXhPZihlLmtleUNvZGUpID4gLTEgJiYgZGVtb01vZGUpIHtcbiAgICAgICAgICAgIG1hcC5zdG9wKCk7XG4gICAgICAgICAgICB3aW5kb3cuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbX2RhdGFzZXROb10pO1xuICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAoX2RhdGFzZXRObyArIHsxOTA6IDEsIDE4ODogLTF9W2Uua2V5Q29kZV0gKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDMyICYmIGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAvLyBTcGFjZSA9IHN0YXJ0L3N0b3BcbiAgICAgICAgICAgIHdpbmRvdy5zdG9wcGVkID0gIXdpbmRvdy5zdG9wcGVkO1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5zdG9wcGVkKVxuICAgICAgICAgICAgICAgIG1hcC5zdG9wKCk7XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbX2RhdGFzZXROb10pO1xuICAgICAgICAgICAgICAgIG5leHREYXRhc2V0KG1hcCwgX2RhdGFzZXRObyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIChkZW1vTW9kZSA/IGxvYWREYXRhc2V0cyhtYXApIDogbG9hZE9uZURhdGFzZXQoKSlcbiAgICAudGhlbihkYXRhc2V0ID0+IHtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsMSk7IC8vIGRvZXMgdGhpcyBoaWRlIHRoZSBhZGRyZXNzIGJhcj8gTm9wZSAgICBcbiAgICAgICAgaWYgKGRhdGFzZXQpIFxuICAgICAgICAgICAgc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCk7XG5cbiAgICAgICAgd2hlbk1hcExvYWRlZChtYXAsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAwKTsgLy8gd2hpY2ggZGF0YXNldCB0byBzdGFydCBhdC4gKDAgZm9yIHByb2QpXG4gICAgICAgICAgICAgICAgLy92YXIgZnAgPSBuZXcgRmxpZ2h0UGF0aChtYXApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzaG93RGF0YXNldChtYXAsIGRhdGFzZXQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKS5vdXRlckhUTUw9Jyc7XG4gICAgICAgIH0pO1xuICAgICAgICBcblxuICAgIH0pO1xufSkoKTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG4vKlxuU3VnZ2VzdGlvbnM6XG5cblRoaXMgaXMgTWVsYm91cm5lXG5IZXJlIGFyZSBvdXIgcHJlY2luY3RzXG5BcyB5b3UnZCBndWVzcywgd2UgaGF2ZSBhIGxvdCBvZiBkYXRhOlxuLSBhZGRyZXNzZXMsIGJvdW5kYXJpZXNcblxuXG4xLiBPcmllbnQgd2l0aCBwcmVjaW5jdHNcblxuMi4gQnV0IHdlIGFsc28gaGF2ZTogXG4tIHdlZGRpbmdcbi0gYmluIG5pZ2h0c1xuLSBkb2dzIGxhc3QgXG4tIHRvaWxldHNcbi0tIGFsbFxuLS0gd2hlZWxjaGFpcnMgd2l0aCBpY29uc1xuXG4qL1xuXG5cblxuXG5cbi8qXG5JbnRyb1xuLSBPdmVydmlldyAoc3VidXJiIG5hbWVzIGhpZ2hsaWdodGVkKVxuLSBQcm9wZXJ0eSBib3VuZGFyaWVzXG4tIFN0cmVldCBhZGRyZXNzZXNcblxuVXJiYW4gZm9yZXN0OlxuLSBlbG1zXG4tIGd1bXNcbi0gcGxhbmVzXG4tIGFsbFxuXG5DTFVFXG4tIGVtcGxveW1lbnRcbi0gdHJhbnNwb3J0IHNlY3RvclxuLSBzb2NpYWwvaGVhbHRoIHNlY3RvclxuXG5EQU1cbi0gYXBwbGljYXRpb25zXG4tIGNvbnN0cnVjdGlvblxuLSBjb21wbGV0ZWRcblxuRGlkIHlvdSBrbm93OlxuLSBjb21tdW5pdHkgZm9vZFxuLSBHYXJiYWdlIENvbGxlY3Rpb24gWm9uZXNcbi0gQm9va2FibGUgRXZlbnQgVmVudWVzXG4tLSB3ZWRkaW5nYWJsZVxuLS0gYWxsXG4tIFRvaWxldHNcbi0tIGFsbCBcbi0tIGFjY2Vzc2libGVcbi0gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4tIERvZyB3YWxraW5nIHpvbmVzXG5cbkZpbmFsZTpcbi0gU2t5bGluZVxuLSBXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhP1xuXG5cbkdhcmJhZ2UgQ29sbGVjdGlvbiBab25lc1xuRG9nIFdhbGtpbmcgWm9uZXMgb2ZmLWxlYXNoXG5CaWtlIFNoYXJlIFN0YXRpb25zXG5Cb29rYWJsZSBFdmVudCBWZW51ZXNcbi0gd2VkZGluZ2FibGVcblxuXG5HcmFuZCBmaW5hbGUgXCJXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhXCI/XG4tIGJ1aWxkaW5nc1xuLSBjYWZlc1xuLSBcblxuXG5cblRoZXNlIG5lZWQgYSBob21lOlxuLSBiaWtlIHNoYXJlIHN0YXRpb25zXG4tIHBlZGVzdHJpYW4gc2Vuc29yc1xuLSBhZGRyZXNzZXNcbi0gcHJvcGVydHkgYm91bmRhcmllc1xuLSBidWlsZGluZ3Ncbi0gY2FmZXNcbi0gY29tbXVuaXR5IGZvb2RcblxuXG5cbiovXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbkRhdGFzZXQgcnVuIG9yZGVyXG4tIGJ1aWxkaW5ncyAoM0QpXG4tIHRyZWVzIChmcm9tIG15IG9wZW50cmVlcyBhY2NvdW50KVxuLSBjYWZlcyAoY2l0eSBvZiBtZWxib3VybmUsIHN0eWxlZCB3aXRoIGNvZmZlZSBzeW1ib2wpXG4tIGJhcnMgKHNpbWlsYXIpXG4tIGdhcmJhZ2UgY29sbGVjdGlvbiB6b25lc1xuLSBkb2cgd2Fsa2luZyB6b25lc1xuLSBDTFVFICgzRCBibG9ja3MpXG4tLSBidXNpbmVzcyBlc3RhYmxpc2htZW50cyBwZXIgYmxvY2tcbi0tLSB2YXJpb3VzIHR5cGVzLCB0aGVuIHRvdGFsXG4tLSBlbXBsb3ltZW50ICh2YXJpb3VzIHR5cGVzIHdpdGggc3BlY2lmaWMgdmFudGFnZSBwb2ludHMgLSBiZXdhcmUgdGhhdCBub3QgYWxsIGRhdGEgaW5jbHVkZWQ7IHRoZW4gdG90YWwpXG4tLSBmbG9vciB1c2UgKGRpdHRvKVxuXG5cblxuXG5NaW5pbXVtXG4tIGZsb2F0eSBjYW1lcmFzXG4tIGNsdWUgM0QsXG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcblxuSGVhZGVyOlxuLSBkYXRhc2V0IG5hbWVcbi0gY29sdW1uIG5hbWVcblxuRm9vdGVyOiBkYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1XG5cbkNvTSBsb2dvXG5cblxuTWVkaXVtXG4tIE11bmljaXBhbGl0eSBib3VuZGFyeSBvdmVybGFpZFxuXG5TdHJldGNoIGdvYWxzXG4tIG92ZXJsYXkgYSB0ZXh0IGxhYmVsIG9uIGEgYnVpbGRpbmcvY2x1ZWJsb2NrIChlZywgRnJlZW1hc29ucyBIb3NwaXRhbCAtIHRvIHNob3cgd2h5IHNvIG11Y2ggaGVhbHRoY2FyZSlcblxuXG5cblxuXG4qL1xuXG5cbmNvbnN0IENvTSA9IHtcbiAgICBibHVlOiAncmdiKDAsMTc0LDIwMyknLFxuICAgIG1hZ2VudGE6J3JnYigyMjcsIDQsIDgwKScsXG4gICAgZ3JlZW46ICdyZ2IoMCwxODMsNzkpJ1xufTtcbkNvTS5lbnVtQ29sb3JzID0gW0NvTS5ibHVlLCBDb00ubWFnZW50YSwgQ29NLmdyZWVuXTtcblxuaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gJy4vc291cmNlRGF0YSc7XG5cbmV4cG9ydCBjb25zdCBkYXRhc2V0cyA9IFtcbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J01lbGJvdXJuZSBoYXMgYSBsb3Qgb2YgZGF0YS4nLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6ODAwMCxcbiAgICAgICAgY2FwdGlvbjonVGhpcyBpcyBNZWxib3VybmUnLFxuICAgICAgICBwYWludDogW1xuICAgICAgICAgICAgWydwbGFjZS1zdWJ1cmInLCAndGV4dC1jb2xvcicsICdyZ2IoMCwxODMsNzkpJ10sXG4gICAgICAgICAgICBbJ3BsYWNlLW5laWdoYm91cmhvb2QnLCAndGV4dC1jb2xvcicsICdyZ2IoMCwxODMsNzkpJ11cbiAgICAgICAgXSxcbiAgICAgICAgbmFtZTogJycsXG4gICAgICAgIGZseVRvOiB7Y2VudGVyOntsbmc6MTQ0Ljk1LGxhdDotMzcuODEzfSx6b29tOjEzLHBpdGNoOjQ1LGJlYXJpbmc6MH1cblxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2UgaGF2ZSBkYXRhIGxpa2UgcHJvcGVydHkgYm91bmRhcmllcyBmb3IgcGxhbm5pbmcnLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcy0xJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwLCAvLyBqdXN0IHRvIGF2b2lkIGZsYXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcbiAgICAvLyByZXBlYXQgLSBqdXN0IHRvIGZvcmNlIHRoZSB0aW1pbmdcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbGluZ2VyOjMwMDAsXG4gICAgICAgIG5hbWU6ICdQcm9wZXJ0eSBib3VuZGFyaWVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1dlIGhhdmUgZGF0YSBsaWtlIHByb3BlcnR5IGJvdW5kYXJpZXMgZm9yIHBsYW5uaW5nJyxcbiAgICAgICAgb3BhY2l0eToxLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcy0yJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGp1c3QgcmVwZWF0IHByZXZpb3VzIHZpZXcuXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTQwMDAsXG4gICAgICAgIG5hbWU6ICdTdHJlZXQgYWRkcmVzc2VzJyxcbiAgICAgICAgY2FwdGlvbjogJ0FzIHlvdVxcJ2QgZ3Vlc3MsIHdlIGhhdmUgZGF0YSBsaWtlIGV2ZXJ5IHN0cmVldCBhZGRyZXNzJyxcbiAgICAgICAgLy8gbmVlZCB0byB6b29tIGluIGNsb3NlIG9uIHRoaXMgb25lXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhZGRyZXNzZXMnLFxuICAgICAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuM2lwM2NvdW8nLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdTdHJlZXRfYWRkcmVzc2VzLTk3ZTVvbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tzdHJlZXRfbm99JyxcbiAgICAgICAgICAgICAgICAndGV4dC1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTAsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIG5lYXIgdW5pLWlzaFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMDE3MzY0MjYwNjgsXCJsYXRcIjotMzcuNzk3NzA3OTg4NjAxMjN9LFwiem9vbVwiOjE4LFwiYmVhcmluZ1wiOi00NS43MDIwMzA0MDUwNjA4NCxcInBpdGNoXCI6NDgsIGR1cmF0aW9uOjE0MDAwfVxuICAgICAgICAvLyByb3VuZGFib3V0IG9mIGRlYXRoIGxvb2tuZyBud1xuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU5MTA0ODcwNjExODQsXCJsYXRcIjotMzcuODAwNjEwODg5NzE3MzJ9LFwiem9vbVwiOjE4LjU3MjIwNDc4MjgxOTE5NSxcImJlYXJpbmdcIjotMjAuNDM1NjM2NjkxNjQzODIyLFwicGl0Y2hcIjo1Ny45OTk5OTk5OTk5OTk5OX1cbiAgICB9LFxuXG5cbiAgICAvKntcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlIGhlYWx0aCBhbmQgdHlwZSBvZiBlYWNoIHRyZWUgaW4gb3VyIHVyYmFuIGZvcmVzdCcsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC42XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdVbG11cycgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU3Njc0MTU0MTgyNjYsXCJsYXRcIjotMzcuNzkxNjg2NjE5NzcyOTc1fSxcInpvb21cIjoxNS40ODczMzc0NTczNTY2OTEsXCJiZWFyaW5nXCI6LTEyMi40MDAwMDAwMDAwMDAwOSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjE0Ny42NTIxOTM4MjM3MzEwNyxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgfSwqL1xuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonVXJiYW4gRm9yZXN0JyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBVcmJhbiBGb3Jlc3QgY29udGFpbnMgZXZlcnkgZWxtIHRyZWUuLi4nLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1VsbXVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjMxMzgsXCJsYXRcIjotMzcuNzg4ODQzfSxcInpvb21cIjoxNS4yLFwiYmVhcmluZ1wiOi0xMDYuMTQsXCJwaXRjaFwiOjU1fVxuXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBjYXB0aW9uOiAnLi4uZXZlcnkgZ3VtIHRyZWUuLi4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ3VtdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ0V1Y2FseXB0dXMnLCAnQ29yeW1iaWEnLCAnQW5nb3Bob3JhJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljg0NzM3NDg4Njg5MDcsXCJsYXRcIjotMzcuODExNzc5NzQwNzg3MjQ0fSxcInpvb21cIjoxMy4xNjI1MjQxNTA4NDczMTUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoyMDAsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQyNzMyNTY3MzMzMSxcImxhdFwiOi0zNy43ODQ0NDk0MDU5MzAzOH0sXCJ6b29tXCI6MTQuNSxcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDgwMDAsXG4gICAgICAgIC8vZGF0YXNldExlYWQ6IDMwMDAsXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgZXZlcnkgcGxhbmUgdHJlZS4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAncGxhbmV0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdQbGF0YW51cycgXVxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDM5NDYzMzgzODk2NSxcImxhdFwiOi0zNy43OTU4ODg3MDY2ODI3MX0sXCJ6b29tXCI6MTUuOTA1MTMwMzYxNDQ2NjY4LFwiYmVhcmluZ1wiOjE1Ny41OTk5OTk5OTk5OTc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTUzLFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjM5NH0sXCJ6b29tXCI6MTUsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTQ3ODUxMDAxNjIwMixcImxhdFwiOi0zNy43ODQzNDE0NzE2NzQ3N30sXCJ6b29tXCI6MTMuOTIyMjI4NDYxNzkzNjY5LFwiYmVhcmluZ1wiOjEyMi45OTQ3ODM0NjA0MzQ2LFwicGl0Y2hcIjo0Ny41MDAwMDAwMDAwMDAwM31cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1MzQzNDUwNzU1MTYsXCJsYXRcIjotMzcuODAxMzQxMTgwMTI1MjJ9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjE1MS4wMDA3MzA0ODgyNzMzOCxcInBpdGNoXCI6NTguOTk5OTk5OTk5OTk5OTl9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTYxMzg4NDg4NDA5LFwibGF0XCI6LTM3LjgwOTAyNzEwNTMxNjMyfSxcInpvb21cIjoxNC4yNDE3NTcwMzA4MTY2MzYsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ05lYXJseSA3MCwwMDAgdHJlZXMgaW4gYWxsLicsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQxOTExNTcwMDAwMzQsXCJsYXRcIjotMzcuODAwMzY3MDkyMTQwMjJ9LFwiem9vbVwiOjE0LjEsXCJiZWFyaW5nXCI6MTQ0LjkyNzI4MzkyNzQyNjk0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MTQ3LjY1MjE5MzgyMzczMTA3LFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidDZW5zdXMgb2YgTGFuZCBVc2UgYW5kIEVtcGxveW1lbnQgKENMVUUpJyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICBcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RvdGFsIGVtcGxveW1lbnQgaW4gYmxvY2snICxcbiAgICAgICAgY2FwdGlvbjogJ0NMVUUgcmV2ZWFscyB3aGVyZSBlbXBsb3ltZW50IGlzIGNvbmNlbnRyYXRlZCcsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI2NzI1MzE0Nzg1NyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzY0OTR9LFwiem9vbVwiOjEzLjg4NjI4NzMyMDE1OTgxLFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTk4NTMzNDU2MjE0LFwibGF0XCI6LTM3LjgzNTgxOTE2MjQzNjYxfSxcInpvb21cIjoxMy42NDkxMTY2MTQ4NzI4MzYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgfSxcblxuICAgIC8qe1xuICAgICAgICBkZWxheToxMjAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doZXJlIHRoZSBDb3VuY2lsXFwncyBzaWduaWZpY2FudCBwcm9wZXJ0eSBob2xkaW5ncyBhcmUgbG9jYXRlZC4nLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZnRoaS16YWp5JyksXG4gICAgICAgIGNvbHVtbjogJ093bmVyc2hpcCBvciBDb250cm9sJyxcbiAgICAgICAgc2hvd0xlZ2VuZDogdHJ1ZSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM5MDMwODcyMzg0NixcImxhdFwiOi0zNy44MTg2MzE2NjA4MTA0MjV9LFwiem9vbVwiOjEzLjUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG5cbiAgICB9LFxuICAgICovXG4gICAgIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RyYW5zcG9ydCwgUG9zdGFsIGFuZCBTdG9yYWdlJyAsXG4gICAgICAgIGNhcHRpb246ICcuLi53aGVyZSB0aGUgdHJhbnNwb3J0LCBwb3N0YWwgYW5kIHN0b3JhZ2Ugc2VjdG9yIGlzIGxvY2F0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Mjc2ODE3NjcxMDcxMixcImxhdFwiOi0zNy44MjkyMTgyNDg1ODcyNDZ9LFwiem9vbVwiOjEyLjcyODQzMTIxNzkxNDkxOSxcImJlYXJpbmdcIjo2OC43MDM4ODMxMjE4NzQ1OCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdIZWFsdGggQ2FyZSBhbmQgU29jaWFsIEFzc2lzdGFuY2UnICxcbiAgICAgICAgY2FwdGlvbjogJ2FuZCB3aGVyZSB0aGUgaGVhbHRoY2FyZSBhbmQgc29jaWFsIGFzc2lzdGFuY2Ugb3JnYW5pc2F0aW9ucyBhcmUgYmFzZWQuJyxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzIzMzExMjE4NTMsXCJsYXRcIjotMzcuODI3MDYzNzQ3NjM4MjR9LFwiem9vbVwiOjEzLjA2Mzc1NzM4NjIzMjI0MixcImJlYXJpbmdcIjoyNi4zNzQ3ODY5MTg1MjMzNCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J0RldmVsb3BtZW50IEFjdGl2aXR5IE1vbml0b3IgKERBTSknLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA3MDAwLCBcbiAgICAgICAgbGluZ2VyOjkwMDAsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQTElFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdEQU0gdHJhY2tzIG1ham9yIHByb2plY3RzIGluIHRoZSBwbGFubmluZyBzdGFnZS4uLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNDAwMCxcbiAgICAgICAgbGluZ2VyOjUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgICAgICAgICBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLnByb2plY3RzIHVuZGVyIGNvbnN0cnVjdGlvbicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0NPTVBMRVRFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgdGhvc2UgYWxyZWFkeSBjb21wbGV0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbi8vKioqKioqKioqKioqKioqKioqKioqICBcIkJ1dCBkaWQgeW91IGtub3dcIiBkYXRhXG4gICAge1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0J1dCBkaWQgeW91IGtub3cgd2UgaGF2ZSBkYXRhIGFib3V0IGhlYWx0aHksIGFmZm9yZGFibGUgZm9vZCBzZXJ2aWNlcz8nLFxuICAgICAgICBuYW1lOiAnQ29tbXVuaXR5IGZvb2Qgc2VydmljZXMgd2l0aCBvcGVuaW5nIGhvdXJzLCBwdWJsaWMgdHJhbnNwb3J0IGFuZCBwYXJraW5nIG9wdGlvbnMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZm9vZCcsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43eHZrMGszbCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0NvbW11bml0eV9mb29kX3NlcnZpY2VzX3dpdGhfLWE3Y2o5dicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyAvLyBicmlnaHQgb3JhbmdlXG4gICAgICAgICAgICAgICAgLy8ndGV4dC1jb2xvcic6ICdyZ2IoMjQ5LCAyNDMsIDE3OCknLCAvLyBtdXRlZCBvcmFuZ2UsIGEgY2l0eSBmb3IgcGVvcGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05hbWV9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTIsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy9zb3V0aCBNZWxib3VybmUgaXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY4NDQ1MDc2NjM1NDIsXCJsYXRcIjotMzcuODI0NTk5NDkxMDMyNDR9LFwiem9vbVwiOjE0LjAxNjk3OTg2NDQ4MjIzMyxcImJlYXJpbmdcIjotMTEuNTc4MzM2MTY2MTQyODg4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NDczNzMwOTQ0NDY2LFwibGF0XCI6LTM3LjgwNDkwNzE1NTk1MTN9LFwiem9vbVwiOjE1LjM0ODY3NjA5OTkyMjg1MixcImJlYXJpbmdcIjotMTU0LjQ5NzEzMzMyODk3MDEsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0OTIyNTE0MzgzMDcsXCJsYXRcIjotMzcuODAzMTA5NzI3MjcyODF9LFwiem9vbVwiOjE1LjM1ODUwOTc4OTc5MDgwOCxcImJlYXJpbmdcIjotNzguMzk5OTk5OTk5OTk5NyxcInBpdGNoXCI6NTguNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAgXG5cblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEsXG4gICAgICAgIG5hbWU6ICdHYXJiYWdlIGNvbGxlY3Rpb24gem9uZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2hpY2ggbmlnaHQgaXMgYmluIG5pZ2h0PycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdnYXJiYWdlLTEnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgNl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDEwXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MTAwMDAsXG4gICAgICAgIC8vIEZhd2tuZXIgUGFya2lzaFxuICAgICAgICBmbHlUbzoge2NlbnRlcjogeyBsbmc6MTQ0Ljk2NTQzNywgbGF0Oi0zNy44MTQyMjV9LCB6b29tOiAxMy43LGJlYXJpbmc6LTMwLjgsIHBpdGNoOjYwfVxuICAgICAgICAvLyBiaXJkcyBleWUsIHpvb21lZCBvdXRcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxMyxiZWFyaW5nOjAscGl0Y2g6MH0sXG4gICAgfSxcblxuXG5cbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbmFtZTogJ0dhcmJhZ2UgY29sbGVjdGlvbiB6b25lcycsXG4gICAgICAgIGNhcHRpb246ICdXaGljaCBuaWdodCBpcyBiaW4gbmlnaHQnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ2FyYmFnZS0yJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3J1Yl9kYXl9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAxOF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDIwXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICAvLyBiaXJkcyBleWVcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxNCxiZWFyaW5nOjAscGl0Y2g6MCwgZHVyYXRpb246MTAwMDB9LFxuICAgIH0sXG5cblxuICAgIHsgXG4gICAgICAgIG5hbWU6ICdNZWxib3VybmUgQmlrZSBTaGFyZSBzdGF0aW9ucywgd2l0aCBjdXJyZW50IG51bWJlciBvZiBmcmVlIGFuZCB1c2VkIGRvY2tzIChldmVyeSAxNSBtaW51dGVzKScsXG4gICAgICAgIGNhcHRpb246ICdIb3cgbWFueSBcIkJsdWUgQmlrZXNcIiBhcmUgcmVhZHkgaW4gZWFjaCBzdGF0aW9uLicsXG4gICAgICAgIGNvbHVtbjogJ05CQmlrZXMnLFxuICAgICAgICBkZWxheTogMjAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgndGR2aC1uOWR2JykgLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnYmljeWNsZS1zaGFyZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1zaXplJzogMixcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05CQmlrZXN9JyxcbiAgICAgICAgICAgICAgICAgICAgLy8ndGV4dC1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtb2Zmc2V0JzogWzEuNSwwXSxcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6MjBcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHNvbWUgcmVhc29uIGl0IGdldHMgc2lsZW50bHkgcmVqZWN0ZWQgd2l0aCB0aGlzOlxuICAgICAgICAgICAgICAgICAgICAvKidpY29uLXNpemUnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ05CQmlrZXMnLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0b3BzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFszMCwgM11cblxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzonaHNsKDIzOSw3MSUsNjYlKScgLy8gbWF0Y2ggdGhlIGJsdWUgYmlrZSBpY29uc1xuICAgICAgICAgICAgICAgICAgICAvLyd0ZXh0LWNvbG9yJzogJ3JnYigwLDE3NCwyMDMpJyAvLyBDb00gcG9wIGJsdWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Nzc2ODQxNDU2Mjg4NyxcImxhdFwiOi0zNy44MTk5ODk0ODM3MjgzOX0sXCJ6b29tXCI6MTQuNjcwMjIxNjc2MjM4NTA3LFwiYmVhcmluZ1wiOi01Ny45MzIzMDI1MTczNjExNyxcInBpdGNoXCI6NjB9XG4gICAgfSwgLy8gYmlrZSBzaGFyZVxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJzg0YmYtZGloaScpLFxuICAgICAgICBjYXB0aW9uOiAnUGxhY2VzIHlvdSBjYW4gYm9vayBmb3IgYSB3ZWRkaW5nLi4uJyxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ1dFRERJTkcnLCAnWSddLFxuICAgICAgICBjb2x1bW46ICdXRURESU5HJyxcbiAgICAgICAgZGVsYXk6IDQwMDAsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTY3LjE5OTk5OTk5OTk5OTk5LFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJzg0YmYtZGloaScpLFxuICAgICAgICBjYXB0aW9uOiAnUGxhY2VzIHlvdSBjYW4gYm9vayBmb3IgYSB3ZWRkaW5nLi4ub3Igc29tZXRoaW5nIGVsc2UuJyxcbiAgICAgICAgY29sdW1uOiAnV0VERElORycsXG4gICAgICAgIGRlbGF5OiA2MDAwLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTczNjI1NTY2OTMzNixcImxhdFwiOi0zNy44MTM5NjI3MTMzNDQzMn0sXCJ6b29tXCI6MTQuNDA1NTkxMDkxNjcxMDU4LFwiYmVhcmluZ1wiOi04MCxcInBpdGNoXCI6NTQuMDAwMDAwMDAwMDAwMDJ9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4uJyxcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3RvaWxldC0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4udGhhdCBhcmUgYWNjZXNzaWJsZSBmb3Igd2hlZWxjaGFpciB1c2VycycsXG4gICAgICAgIGZpbHRlcjogWyc9PScsJ3doZWVsY2hhaXInLCd5ZXMnXSxcbiAgICAgICAgZGVsYXk6IDEsXG4gICAgICAgIGxpbmdlcjo1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd3aGVlbGNoYWlyLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi50aGF0IGFyZSBhY2Nlc3NpYmxlIGZvciB3aGVlbGNoYWlyIHVzZXJzJyxcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIC8vbGluZ2VyOjUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIGZpbHRlcjogWychPScsJ3doZWVsY2hhaXInLCd5ZXMnXSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAndG9pbGV0LTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgXG4gICAgICAgIGNhcHRpb246ICdPdXIgZGF0YSB0ZWxscyB5b3Ugd2hlcmUgeW91ciBkb2cgZG9lc25cXCd0IG5lZWQgYSBsZWFzaCcsXG4gICAgICAgIG5hbWU6ICdEb2cgV2Fsa2luZyBab25lcycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS5jbHphcDJqZScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0RvZ19XYWxraW5nX1pvbmVzLTNmaDlxNCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ2hzbCgzNDAsIDk3JSw2NSUpJywgLy9oc2woMzQwLCA5NyUsIDQ1JSlcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMC44XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbJz09JywgJ3N0YXR1cycsICdvZmZsZWFzaCddXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU3NDYwOTI1MjgwNjYsXCJsYXRcIjotMzcuNzk0NTA2OTc0Mjc0MjJ9LFwiem9vbVwiOjE0Ljk1NTU0NDkwMzE0NTU0NCxcImJlYXJpbmdcIjotNDQuODQxMzI3NDUxODM3MjgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY0NzIwODQxNjE1MjUsXCJsYXRcIjotMzcuNzk5NDc3NDcyNTc1ODR9LFwiem9vbVwiOjE0LjkzMzkzMTUyODAzNjA0OCxcImJlYXJpbmdcIjotNTcuNjQxMzI3NDUxODM3MDgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODYxMzk4NzczMjkzMixcImxhdFwiOi0zNy44Mzg4ODI2NjU5NjE4N30sXCJ6b29tXCI6MTUuMDk2NDE5NTc5NDMyODc4LFwiYmVhcmluZ1wiOi0zMCxcInBpdGNoXCI6NTcuNDk5OTk5OTk5OTk5OTl9XG4gICAgfSxcblxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGVyZVxcJ3MgZXZlbiBldmVyeSBjYWZlIGFuZCByZXN0YXVyYW50JyxcbiAgICAgICAgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdzZnJnLXp5Z2InKSxcbiAgICAgICAgLy8gQ0JEIGxvb2tpbmcgdG93YXJkcyBDYXJsdG9uXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjQyMDA5OTg5NzA0NSxcImxhdFwiOi0zNy44MDQwNzYyOTE2MjE2fSxcInpvb21cIjoxNS42OTU2NjIxMzYzMzk2NTMsXCJiZWFyaW5nXCI6LTIyLjU2OTcxODc2NTAwNjMxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwOTg3ODk5OTI5NjQsXCJsYXRcIjotMzcuODEwMjEzMTA0MDQ3NDl9LFwiem9vbVwiOjE2LjAyNzczMjMzMjAxNjk5LFwiYmVhcmluZ1wiOi0xMzUuMjE5NzUzMDg2NDE5ODEsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ2NhZmUtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBsaW5nZXI6MjYwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPGI+PGk+eW91PC9pPjwvYj4gZG8gd2l0aCBvdXIgZGF0YT8nLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICBvcGFjaXR5OjAuMSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzoge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMCwgJ2hzbCgxNDYsIDUwJSwgMTAlKSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzIwMCwgJ2hzbCgxNDYsIDEwMCUsIDYwJSknXVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vJ2hzbCgxNDYsIDEwMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgLy8gZnJvbSBhYmJvdHNmb3JkaXNoXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuM11dLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIGZseVRvOntjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LGJlYXJpbmc6MCx6b29tOjE0LHBpdGNoOjQ1LGR1cmF0aW9uOjIwMDAwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjVdIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAga2VlcFBhaW50OiB0cnVlLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC42XSBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDxiPjxpPnlvdTwvaT48L2I+IGRvIHdpdGggb3VyIGRhdGE/JyxcbiAgICAgICAgbmFtZTogJ0J1aWxkaW5nIG91dGxpbmVzJyxcbiAgICAgICAgLy9vcGFjaXR5OjAuNixcbiAgICAgICAga2VlcFBhaW50OiB0cnVlLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC43XSBdLFxuICAgICAgICAvKm1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuNixcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sKi9cbiAgICAgICAgLy9tYXRjaGluZyBzdGFydGluZyBwb3NpdGlvbj9cbiAgICAgICAgZmx5VG86e2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sYmVhcmluZzowLHpvb206MTQscGl0Y2g6NDUsZHVyYXRpb246MjAwMDB9XG4gICAgICAgIC8vIGZyb20gYWJib3RzZm9yZGlzaFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzI1MTM1MDMyNzY0LFwibGF0XCI6LTM3LjgwNzQxNTIwOTA1MTI4NX0sXCJ6b29tXCI6MTQuODk2MjU5MTUzMDEyMjQzLFwiYmVhcmluZ1wiOi0xMDYuNDAwMDAwMDAwMDAwMTUsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2Zyb20gc291dGhcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0NzAxNDA3NTM0NDUsXCJsYXRcIjotMzcuODE1MjAwNjI3MjY2NjZ9LFwiem9vbVwiOjE1LjQ1ODc4NDkzMDIzODY3MixcImJlYXJpbmdcIjo5OC4zOTk5OTk5OTk5OTk4OCxcInBpdGNoXCI6NjB9XG4gICAgfVxuXTtcbi8qXG5jb25zdCBjcmFwcHlGaW5hbGUgPSBbXG4gICAgLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuICAgIC8vIFplIGdyYW5kZSBmaW5hbGVcbiAgICB7XG4gICAgICAgIGRlbGF5OjEsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdzZnJnLXp5Z2InKSwgLy8gY2FmZXNcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ2NhZmUtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tc2l6ZSc6IDAuNVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgbGluZ2VyOjIwMDAwXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDIsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSxcbiAgICAgICAgbGluZ2VyOjIwMDAwXG4gICAgfSwgICBcbiAgICB7IFxuICAgICAgICBkZWxheToxMSwgbGluZ2VyOjIwMDAwLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcycsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgIH0sXG4gICAgeyAvLyBwZWRlc3RyaWFuIHNlbnNvcnNcbiAgICAgICAgZGVsYXk6MSxsaW5nZXI6MjAwMDAsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd5Z2F3LTZyenEnKSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM2Nzg1NDc2MTk0NSxcImxhdFwiOi0zNy44MDIzNjg5NjEwNjg5OH0sXCJ6b29tXCI6MTUuMzg5MzkzODUwNzI1NzMyLFwiYmVhcmluZ1wiOi0xNDMuNTg0NDY3NTEyNDk1NCxcInBpdGNoXCI6NjB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9LFxuXG4gICAge1xuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDx1PnlvdTwvdT4mbmJzcDsgZG8gd2l0aCBvdXIgZGF0YT8nLFxuICAgICAgICBkZWxheToyMDAwMCxcbiAgICAgICAgbGluZ2VyOjMwMDAwLFxuICAgICAgICBvcGFjaXR5OjAuNCxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJ2hzbCgxNDYsIDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuOSxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgfSxcblxuXTtcbiovXG5cbmNvbnN0IHVudXNlZCA9IFtcbntcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdQZWRlc3RyaWFuIHNlbnNvcnMgY291bnQgZm9vdCB0cmFmZmljIGV2ZXJ5IGhvdXInLFxuICAgICAgICBuYW1lOiAnUGVkZXN0cmlhbiBzZW5zb3IgbG9jYXRpb25zJyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3lnYXctNnJ6cScpLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzY3ODU0NzYxOTQ1LFwibGF0XCI6LTM3LjgwMjM2ODk2MTA2ODk4fSxcInpvb21cIjoxNS4zODkzOTM4NTA3MjU3MzIsXCJiZWFyaW5nXCI6LTE0My41ODQ0Njc1MTI0OTU0LFwicGl0Y2hcIjo2MH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH1cbl07XG5cblxuXG5cblxuZXhwb3J0IGNvbnN0IGRhdGFzZXRzMiA9IFtcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQTElFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0IGFwcGxpY2F0aW9ucycsXG5cbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQUk9WRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnTWFqb3IgZGV2ZWxvcG1lbnQgcHJvamVjdHMgYXBwcm92ZWQnIFxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdVTkRFUiBDT05TVFJVQ1RJT04nIF0sIFxuICAgICAgICBjYXB0aW9uOiAnTWFqb3IgZGV2ZWxvcG1lbnQgcHJvamVjdHMgdW5kZXIgY29uc3RydWN0aW9uJyBcbiAgICB9LCBcbiAgICB7IGRlbGF5OiA1MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgndGR2aC1uOWR2JykgfSwgLy8gYmlrZSBzaGFyZVxuICAgIHsgZGVsYXk6IDkwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnQWNjb21tb2RhdGlvbicgfSxcbiAgICB7IGRlbGF5OiAxMDAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2IzNmota2l5NCcpLCBjb2x1bW46ICdBcnRzIGFuZCBSZWNyZWF0aW9uIFNlcnZpY2VzJyB9LFxuICAgIC8veyBkZWxheTogMzAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdSZXRhaWwgVHJhZGUnIH0sXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdDb25zdHJ1Y3Rpb24nIH1cbiAgICAvL3sgZGVsYXk6IDEwMDAsIGRhdGFzZXQ6ICdiMzZqLWtpeTQnIH0sXG4gICAgLy97IGRlbGF5OiAyMDAwLCBkYXRhc2V0OiAnMjM0cS1nZzgzJyB9XG5dO1xuIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5pbXBvcnQgeyBtZWxib3VybmVSb3V0ZSB9IGZyb20gJy4vbWVsYm91cm5lUm91dGUnO1xuXG4vKlxuQ29udGludW91c2x5IG1vdmVzIHRoZSBNYXBib3ggdmFudGFnZSBwb2ludCBhcm91bmQgYSBHZW9KU09OLWRlZmluZWQgcGF0aC5cbiovXG5cbmZ1bmN0aW9uIHdoZW5Mb2FkZWQobWFwLCBmKSB7XG4gICAgaWYgKG1hcC5sb2FkZWQoKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQWxyZWFkeSBsb2FkZWQuJyk7XG4gICAgICAgIGYoKTtcbiAgICB9XG4gICAgZWxzZSB7IFxuICAgICAgICBjb25zb2xlLmxvZygnV2FpdCBmb3IgbG9hZCcpO1xuICAgICAgICBtYXAub25jZSgnbG9hZCcsIGYpO1xuICAgIH1cbn1cblxubGV0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxuZXhwb3J0IGNsYXNzIEZsaWdodFBhdGgge1xuXG4gICAgY29uc3RydWN0b3IobWFwLCByb3V0ZSkge1xuICAgICAgICB0aGlzLnJvdXRlID0gcm91dGU7XG4gICAgICAgIGlmICh0aGlzLnJvdXRlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLnJvdXRlID0gbWVsYm91cm5lUm91dGU7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IDAuMDE7XG5cbiAgICAgICAgdGhpcy5wb3NObyA9IDA7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbnMgPSB0aGlzLnJvdXRlLmZlYXR1cmVzLm1hcChmZWF0dXJlID0+ICh7XG4gICAgICAgICAgICBjZW50ZXI6IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICB6b29tOiBkZWYoZmVhdHVyZS5wcm9wZXJ0aWVzLnpvb20sIDE0KSxcbiAgICAgICAgICAgIGJlYXJpbmc6IGZlYXR1cmUucHJvcGVydGllcy5iZWFyaW5nLFxuICAgICAgICAgICAgcGl0Y2g6IGRlZihmZWF0dXJlLnByb3BlcnRpZXMucGl0Y2gsIDYwKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuXG4gICAgICAgIHRoaXMuYmVhcmluZz0wO1xuXG4gICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG5cblxuICAgIC8qdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTYsIC0zNy44XSwgem9vbTogMTUsIGJlYXJpbmc6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTgsIC0zNy44NF0sIHpvb206IDE1LCBiZWFyaW5nOiAxNjAsIHBpdGNoOiAxMH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk5NSwgLTM3LjgyNV0sIHpvb206IDE1LCBiZWFyaW5nOiAtOTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45NywgLTM3LjgyXSwgem9vbTogMTUsIGJlYXJpbmc6IDE0MH1cblxuICAgIF07Ki9cblxuICAgICAgICB0aGlzLm1vdmVDYW1lcmEgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmVDYW1lcmEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLnBvc2l0aW9uc1t0aGlzLnBvc05vXTtcbiAgICAgICAgICAgIHBvcy5zcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICBwb3MuY3VydmUgPSAwLjQ4OyAvLzE7XG4gICAgICAgICAgICBwb3MuZWFzaW5nID0gKHQpID0+IHQ7IC8vIGxpbmVhciBlYXNpbmdcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZseVRvJyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5mbHlUbyhwb3MsIHsgc291cmNlOiAnZmxpZ2h0cGF0aCcgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zTm8gPSAodGhpcy5wb3NObyArIDEpICUgdGhpcy5wb3NpdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21hcC5yb3RhdGVUbyhiZWFyaW5nLCB7IGVhc2luZzogZWFzaW5nIH0pO1xuICAgICAgICAgICAgLy9iZWFyaW5nICs9IDU7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiBcbiAgICAgICAgdGhpcy5tYXAub24oJ21vdmVlbmQnLCAoZGF0YSkgPT4geyBcbiAgICAgICAgICAgIGlmIChkYXRhLnNvdXJjZSA9PT0gJ2ZsaWdodHBhdGgnKSBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8qXG4gICAgICAgIFRoaXMgc2VlbWVkIHRvIGJlIHVucmVsaWFibGUgLSB3YXNuJ3QgYWx3YXlzIGdldHRpbmcgdGhlIGxvYWRlZCBldmVudC5cbiAgICAgICAgd2hlbkxvYWRlZCh0aGlzLm1hcCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRlZC4nKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXAuanVtcFRvKHRoaXMucG9zaXRpb25zWzBdKTtcbiAgICAgICAgdGhpcy5wb3NObyArKztcbiAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIDAgLyp0aGlzLnBhdXNlVGltZSovKTtcblxuICAgICAgICB0aGlzLm1hcC5vbignY2xpY2snLCAoKSA9PiB7IFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSAgICBcblxufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dSYWRpdXNMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIC8vIFRPRE8gcGFkIHRoZSBzbWFsbCBjaXJjbGUgc28gdGhlIHRleHQgc3RhcnRzIGF0IHRoZSBzYW1lIFggcG9zaXRpb24gZm9yIGJvdGhcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6NnB4OyB3aWR0aDogNnB4OyBib3JkZXItcmFkaXVzOiAzcHhcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDIwcHg7IGJvcmRlci1yYWRpdXM6IDEwcHhcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+YDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcblxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDQwLDQwLDI1MClcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6M3B4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDIwLDIwLDQwKVwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD5gOyBcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2F0ZWdvcnlMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIGNvbG9yU3RvcHMsIGNsb3NlSGFuZGxlcikge1xuICAgIGxldCBsZWdlbmRIdG1sID0gXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nICtcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIGNvbG9yU3RvcHNcbiAgICAgICAgICAgIC5zb3J0KChzdG9wYSwgc3RvcGIpID0+IHN0b3BhWzBdLmxvY2FsZUNvbXBhcmUoc3RvcGJbMF0pKSAvLyBzb3J0IG9uIHZhbHVlc1xuICAgICAgICAgICAgLm1hcChzdG9wID0+IGA8c3BhbiBjbGFzcz1cImJveFwiIHN0eWxlPSdiYWNrZ3JvdW5kOiAke3N0b3BbMV19Jz48L3NwYW4+PGxhYmVsPiR7c3RvcFswXX08L2xhYmVsPjxici8+YClcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuaW1wb3J0ICogYXMgbGVnZW5kIGZyb20gJy4vbGVnZW5kJztcbi8qXG5XcmFwcyBhIE1hcGJveCBtYXAgd2l0aCBkYXRhIHZpcyBjYXBhYmlsaXRpZXMgbGlrZSBjaXJjbGUgc2l6ZSBhbmQgY29sb3IsIGFuZCBwb2x5Z29uIGhlaWdodC5cblxuc291cmNlRGF0YSBpcyBhbiBvYmplY3Qgd2l0aDpcbi0gZGF0YUlkXG4tIGxvY2F0aW9uQ29sdW1uXG4tIHRleHRDb2x1bW5zXG4tIG51bWVyaWNDb2x1bW5zXG4tIHJvd3Ncbi0gc2hhcGVcbi0gbWlucywgbWF4c1xuKi9cbmNvbnN0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxubGV0IHVuaXF1ZSA9IDA7XG5cbmV4cG9ydCBjbGFzcyBNYXBWaXMge1xuICAgIGNvbnN0cnVjdG9yKG1hcCwgc291cmNlRGF0YSwgZmlsdGVyLCBmZWF0dXJlSG92ZXJIb29rLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLnNvdXJjZURhdGEgPSBzb3VyY2VEYXRhO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICAgICAgdGhpcy5mZWF0dXJlSG92ZXJIb29rID0gZmVhdHVyZUhvdmVySG9vazsgLy8gZihwcm9wZXJ0aWVzLCBzb3VyY2VEYXRhKVxuICAgICAgICBvcHRpb25zID0gZGVmKG9wdGlvbnMsIHt9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgY2lyY2xlUmFkaXVzOiBkZWYob3B0aW9ucy5jaXJjbGVSYWRpdXMsIDIwKSxcbiAgICAgICAgICAgIGludmlzaWJsZTogb3B0aW9ucy5pbnZpc2libGUsIC8vIHdoZXRoZXIgdG8gY3JlYXRlIHdpdGggb3BhY2l0eSAwXG4gICAgICAgICAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sLCAvLyBNYXBib3ggc3ltYm9sIHByb3BlcnRpZXMsIG1lYW5pbmcgd2Ugc2hvdyBzeW1ib2wgaW5zdGVhZCBvZiBjaXJjbGVcbiAgICAgICAgICAgIGVudW1Db2xvcnM6IG9wdGlvbnMuZW51bUNvbG9ycyAvLyBvdmVycmlkZSBkZWZhdWx0IGNvbG9yIGNob2ljZXNcbiAgICAgICAgfTtcblxuICAgICAgICAvL3RoaXMub3B0aW9ucy5pbnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gVE9ETyBzaG91bGQgYmUgcGFzc2VkIGEgTGVnZW5kIG9iamVjdCBvZiBzb21lIGtpbmQuXG5cbiAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMubGF5ZXJJZCA9IHNvdXJjZURhdGEuc2hhcGUgKyAnLScgKyBzb3VyY2VEYXRhLmRhdGFJZCArICctJyArICh1bmlxdWUrKyk7XG4gICAgICAgIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCA9IHRoaXMubGF5ZXJJZCArICctaGlnaGxpZ2h0JztcblxuXG4gICAgICAgIFxuICAgICAgICAvLyBDb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBhIE1hcGJveCBkYXRhc291cmNlXG4gICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCBwb2ludERhdGFzZXRUb0dlb0pTT04odGhpcy5zb3VyY2VEYXRhKSApO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLmZpbHRlciwgZmFsc2UsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuc3ltYm9sLCB0aGlzLmZpbHRlciwgZmFsc2UsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKVxuICAgICAgICAgICAgICAgICAgICAvLyB0cnkgdXNpbmcgYSBjaXJjbGUgaGlnaGxpZ2h0IGV2ZW4gb24gYW4gaWNvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMubWFwLmFkZExheWVyKHN5bWJvbExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5zeW1ib2wsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgXG5cbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGNvbnN0cnVjdCBhIFwicG9seWdvbiBkYXRhc291cmNlXCIsIHRoZSBnZW9tZXRyeSBleGlzdHMgaW4gTWFwYm94IGFscmVhZHlcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9FY29ub215L0VtcGxveW1lbnQtYnktYmxvY2stYnktaW5kdXN0cnkvYjM2ai1raXk0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGFkZCBDTFVFIGJsb2NrcyBwb2x5Z29uIGRhdGFzZXQsIHJpcGUgZm9yIGNob3JvcGxldGhpbmdcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCB7IFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjdG9yJywgXG4gICAgICAgICAgICAgICAgICAgIHVybDogJ21hcGJveDovL29wZW5jb3VuY2lsZGF0YS5hZWRmbXlwOCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG5cblxuICAgIFxuICAgICAgICAvLyBzd2l0Y2ggdmlzdWFsaXNhdGlvbiB0byB1c2luZyB0aGlzIGNvbHVtblxuICAgICAgICB0aGlzLnNldFZpc0NvbHVtbiA9IGZ1bmN0aW9uKGNvbHVtbk5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnVGhpcyBpcyBhIHN5bWJvbCBsYXllciwgd2UgaWdub3JlIHNldFZpc0NvbHVtbi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9IHNvdXJjZURhdGEudGV4dENvbHVtbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RhdGEgY29sdW1uOiAnICsgdGhpcy5kYXRhQ29sdW1uKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9zZSBidXR0b24gYmVoYXZpb3VyLiBtYXliZT9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBlbnVtIGZpZWxkcyBvbiBwb2x5Z29ucyAobm8gZXhhbXBsZSBjdXJyZW50bHkpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICBsZXQgbWluU2l6ZSA9IDAuMyAqIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICBsZXQgbWF4U2l6ZSA9IHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLXJhZGl1cycsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemUvM10sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgbWF4U2l6ZS8zXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCBtaW5TaXplXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCBtYXhTaXplXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd1JhZGl1c0xlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyAvLyBDYW4ndCBzYWZlbHkgY2xvc2UgbnVtZXJpYyBjb2x1bW5zIHlldC4gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzM5NDlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZVJhZGl1cyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtcmFkaXVzJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1udW1lcmljJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgLy8gZnJvbSBDb2xvckJyZXdlclxuICAgICAgICAgICAgY29uc3QgZW51bUNvbG9ycyA9IGRlZih0aGlzLm9wdGlvbnMuZW51bUNvbG9ycywgWycjMWY3OGI0JywnI2ZiOWE5OScsJyNiMmRmOGEnLCcjMzNhMDJjJywnI2UzMWExYycsJyNmZGJmNmYnLCcjYTZjZWUzJywgJyNmZjdmMDAnLCcjY2FiMmQ2JywnIzZhM2Q5YScsJyNmZmZmOTknLCcjYjE1OTI4J10pO1xuXG4gICAgICAgICAgICBsZXQgZW51bVN0b3BzID0gdGhpcy5zb3VyY2VEYXRhLnNvcnRlZEZyZXF1ZW5jaWVzW2RhdGFDb2x1bW5dLm1hcCgodmFsLGkpID0+IFt2YWwsIGVudW1Db2xvcnNbaSAlIGVudW1Db2xvcnMubGVuZ3RoXV0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogZW51bVN0b3BzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFRPRE8gdGVzdCBjbG9zZSBoYW5kbGVyLCBjdXJyZW50bHkgbm9uIGZ1bmN0aW9uYWwgZHVlIHRvIHBvaW50ZXItZXZlbnRzOm5vbmUgaW4gQ1NTXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0NhdGVnb3J5TGVnZW5kKCcjbGVnZW5kLWVudW0nLCBkYXRhQ29sdW1uLCBlbnVtU3RvcHMsIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVDb2xvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtY29sb3InLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1jb2xvciddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtZW51bScpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgICAgQXBwbGllcyBhIHN0eWxlIHRoYXQgcmVwcmVzZW50cyBudW1lcmljIGRhdGEgdmFsdWVzIGFzIGhlaWdodHMgb2YgZXh0cnVkZWQgcG9seWdvbnMuXG4gICAgICAgICAgICBUT0RPOiBhZGQgcmVtb3ZlUG9seWdvbkhlaWdodFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24taGVpZ2h0JywgIHtcbiAgICAgICAgICAgICAgICAvLyByZW1lbWJlciwgdGhlIGRhdGEgZG9lc24ndCBleGlzdCBpbiB0aGUgcG9seWdvbiBzZXQsIGl0J3MganVzdCBhIGh1Z2UgdmFsdWUgbG9va3VwXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsLy9sb2NhdGlvbkNvbHVtbiwgLy8gdGhlIElEIG9uIHRoZSBhY3R1YWwgZ2VvbWV0cnkgZGF0YXNldFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDEwMDBdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgICAgICAvLy5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ3JnYigwLDAsJyArIE1hdGgucm91bmQoNDAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdoc2woMzQwLDg4JSwnICsgTWF0aC5yb3VuZCgyMCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogNTApICsgJyUpJ10pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWQsIFsnIWluJywgJ2Jsb2NrX2lkJywgLi4uKC8qICMjIyBUT0RPIGdlbmVyYWxpc2UgKi8gXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihyb3cgPT4gcm93W2RhdGFDb2x1bW5dID09PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHJvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSldKTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHRoaXMuc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWRIaWdobGlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnN0cnVjdG9yLi4uXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IChlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IHRoaXMubWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhlLnBvaW50LCB7IGxheWVyczogW3RoaXMubGF5ZXJJZF19KVswXTsgIFxuICAgICAgICAgICAgICAgIGlmIChmICYmIGYgIT09IHRoaXMubGFzdEZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSBmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZUhvdmVySG9vayhmLnByb3BlcnRpZXMsIHRoaXMuc291cmNlRGF0YSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCBmLnByb3BlcnRpZXNbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXV0pOyAvLyB3ZSBkb24ndCBoYXZlIGFueSBvdGhlciByZWxpYWJsZSBrZXk/XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgJ2Jsb2NrX2lkJywgZi5wcm9wZXJ0aWVzLmJsb2NrX2lkXSk7IC8vIGRvbid0IGhhdmUgYSBnZW5lcmFsIHdheSB0byBtYXRjaCBvdGhlciBraW5kcyBvZiBwb2x5Z29uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cblxuXG4gICAgICAgIFxuXG4gICAgfVxufVxuXG4vLyBjb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBHZW9KU09OXG5mdW5jdGlvbiBwb2ludERhdGFzZXRUb0dlb0pTT04oc291cmNlRGF0YSkge1xuICAgIGxldCBkYXRhc291cmNlID0ge1xuICAgICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICAgICAgICBmZWF0dXJlczogW11cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzb3VyY2VEYXRhLnJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkge1xuICAgICAgICAgICAgICAgIGRhdGFzb3VyY2UuZGF0YS5mZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkgeyAvLyBKdXN0IGRvbid0IHB1c2ggaXQgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQmFkIGxvY2F0aW9uOiAke3Jvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXX1gKTsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhc291cmNlO1xufTtcblxuZnVuY3Rpb24gY2lyY2xlTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGZpbHRlciwgaGlnaGxpZ2h0LCBzaXplLCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgIHBhaW50OiB7XG4vLyAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAnaHNsKDIwLCA5NSUsIDUwJSknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdyZ2JhKDAsMCwwLDApJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjk1IDogMCxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3doaXRlJyA6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiB7XG4gICAgICAgICAgICAgICAgc3RvcHM6IGhpZ2hsaWdodCA/IFtcbiAgICAgICAgICAgICAgICAgICAgWzEwLHNpemUgKiAwLjRdLCBcbiAgICAgICAgICAgICAgICAgICAgWzE3LHNpemUgKiAxLjBdXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgWzEwLHNpemUgKiAwLjJdLCBcbiAgICAgICAgICAgICAgICAgICAgWzE3LHNpemUgKiAwLjVdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHN5bWJvbExheWVyKHNvdXJjZUlkLCBsYXllcklkLCBzeW1ib2wsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWRcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG5cbiAgICByZXQucGFpbnQgPSBkZWYoc3ltYm9sLnBhaW50LCB7fSk7XG4gICAgcmV0LnBhaW50WydpY29uLW9wYWNpdHknXSA9ICFpbnZpc2libGUgPyAwLjk1IDogMDtcblxuICAgIC8vcmV0LmxheW91dCA9IGRlZihzeW1ib2wubGF5b3V0LCB7fSk7XG4gICAgaWYgKHN5bWJvbC5sYXlvdXQpIHtcbiAgICAgICAgaWYgKHN5bWJvbC5sYXlvdXRbJ3RleHQtZmllbGQnXSAmJiBpbnZpc2libGUpXG4gICAgICAgICAgICByZXQucGFpbnRbJ3RleHQtb3BhY2l0eSddID0gMDtcbiAgICAgICAgcmV0LmxheW91dCA9IHN5bWJvbC5sYXlvdXQ7XG4gICAgfVxuXG5cblxuICAgIHJldHVybiByZXQ7XG59XG5cblxuIGZ1bmN0aW9uIHBvbHlnb25MYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgaW52aXNpYmxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC44IDogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0JzogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnIzAwMydcbiAgICAgICAgIH0sXG4gICAgfTtcbn1cbiBmdW5jdGlvbiBwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQsIGxheWVySWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ3doaXRlJ1xuICAgICAgICB9LFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnYmxvY2tfaWQnLCAnLSddXG4gICAgfTtcbn1cblxuIiwiZXhwb3J0IGNvbnN0IG1lbGJvdXJuZVJvdXRlID0ge1xuICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICBcImZlYXR1cmVzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDM1MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTYyODgyOTk1NjA1NDcsXG4gICAgICAgICAgLTM3LjgyMTcxNzY0NzgzOTY1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwiYmVhcmluZ1wiOiAyNzBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk3ODUwNDE4MDkwODIsXG4gICAgICAgICAgLTM3LjgwODM1OTkxNzQyMzU5NFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDE4MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTU1NTg3Mzg3MDg0OTYsXG4gICAgICAgICAgLTM3LjgwNTc4MzAyMTMxNDVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiA5MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTQ0MzQzNTY2ODk0NTMsXG4gICAgICAgICAgLTM3LjgxNjQ5Njg5MzcyMzA4XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG4gIF1cbn07IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1jb2xsZWN0aW9uLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBwcmVmaXggPSBcIiRcIjtcblxuZnVuY3Rpb24gTWFwKCkge31cblxuTWFwLnByb3RvdHlwZSA9IG1hcC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBNYXAsXG4gIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIChwcmVmaXggKyBrZXkpIGluIHRoaXM7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXNbcHJlZml4ICsga2V5XTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdGhpc1twcmVmaXggKyBrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHByb3BlcnR5ID0gcHJlZml4ICsga2V5O1xuICAgIHJldHVybiBwcm9wZXJ0eSBpbiB0aGlzICYmIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGtleXMucHVzaChwcm9wZXJ0eS5zbGljZSgxKSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH0sXG4gIHZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSB2YWx1ZXMucHVzaCh0aGlzW3Byb3BlcnR5XSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSxcbiAgZW50cmllczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZW50cmllcy5wdXNoKHtrZXk6IHByb3BlcnR5LnNsaWNlKDEpLCB2YWx1ZTogdGhpc1twcm9wZXJ0eV19KTtcbiAgICByZXR1cm4gZW50cmllcztcbiAgfSxcbiAgc2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSAwO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSArK3NpemU7XG4gICAgcmV0dXJuIHNpemU7XG4gIH0sXG4gIGVtcHR5OiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBlYWNoOiBmdW5jdGlvbihmKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGYodGhpc1twcm9wZXJ0eV0sIHByb3BlcnR5LnNsaWNlKDEpLCB0aGlzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWFwKG9iamVjdCwgZikge1xuICB2YXIgbWFwID0gbmV3IE1hcDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTWFwKSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IG1hcC5zZXQoa2V5LCB2YWx1ZSk7IH0pO1xuXG4gIC8vIEluZGV4IGFycmF5IGJ5IG51bWVyaWMgaW5kZXggb3Igc3BlY2lmaWVkIGtleSBmdW5jdGlvbi5cbiAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIG87XG5cbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChpLCBvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoZihvID0gb2JqZWN0W2ldLCBpLCBvYmplY3QpLCBvKTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgb2JqZWN0IHRvIG1hcC5cbiAgZWxzZSBpZiAob2JqZWN0KSBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSBtYXAuc2V0KGtleSwgb2JqZWN0W2tleV0pO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBuZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBrZXlzID0gW10sXG4gICAgICBzb3J0S2V5cyA9IFtdLFxuICAgICAgc29ydFZhbHVlcyxcbiAgICAgIHJvbGx1cCxcbiAgICAgIG5lc3Q7XG5cbiAgZnVuY3Rpb24gYXBwbHkoYXJyYXksIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkge1xuICAgIGlmIChkZXB0aCA+PSBrZXlzLmxlbmd0aCkgcmV0dXJuIHJvbGx1cCAhPSBudWxsXG4gICAgICAgID8gcm9sbHVwKGFycmF5KSA6IChzb3J0VmFsdWVzICE9IG51bGxcbiAgICAgICAgPyBhcnJheS5zb3J0KHNvcnRWYWx1ZXMpXG4gICAgICAgIDogYXJyYXkpO1xuXG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IGFycmF5Lmxlbmd0aCxcbiAgICAgICAga2V5ID0ga2V5c1tkZXB0aCsrXSxcbiAgICAgICAga2V5VmFsdWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB2YWx1ZXNCeUtleSA9IG1hcCgpLFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVJlc3VsdCgpO1xuXG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh2YWx1ZXMgPSB2YWx1ZXNCeUtleS5nZXQoa2V5VmFsdWUgPSBrZXkodmFsdWUgPSBhcnJheVtpXSkgKyBcIlwiKSkge1xuICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZXNCeUtleS5zZXQoa2V5VmFsdWUsIFt2YWx1ZV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlc0J5S2V5LmVhY2goZnVuY3Rpb24odmFsdWVzLCBrZXkpIHtcbiAgICAgIHNldFJlc3VsdChyZXN1bHQsIGtleSwgYXBwbHkodmFsdWVzLCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBlbnRyaWVzKG1hcCQkMSwgZGVwdGgpIHtcbiAgICBpZiAoKytkZXB0aCA+IGtleXMubGVuZ3RoKSByZXR1cm4gbWFwJCQxO1xuICAgIHZhciBhcnJheSwgc29ydEtleSA9IHNvcnRLZXlzW2RlcHRoIC0gMV07XG4gICAgaWYgKHJvbGx1cCAhPSBudWxsICYmIGRlcHRoID49IGtleXMubGVuZ3RoKSBhcnJheSA9IG1hcCQkMS5lbnRyaWVzKCk7XG4gICAgZWxzZSBhcnJheSA9IFtdLCBtYXAkJDEuZWFjaChmdW5jdGlvbih2LCBrKSB7IGFycmF5LnB1c2goe2tleTogaywgdmFsdWVzOiBlbnRyaWVzKHYsIGRlcHRoKX0pOyB9KTtcbiAgICByZXR1cm4gc29ydEtleSAhPSBudWxsID8gYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBzb3J0S2V5KGEua2V5LCBiLmtleSk7IH0pIDogYXJyYXk7XG4gIH1cblxuICByZXR1cm4gbmVzdCA9IHtcbiAgICBvYmplY3Q6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlT2JqZWN0LCBzZXRPYmplY3QpOyB9LFxuICAgIG1hcDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCk7IH0sXG4gICAgZW50cmllczogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGVudHJpZXMoYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKSwgMCk7IH0sXG4gICAga2V5OiBmdW5jdGlvbihkKSB7IGtleXMucHVzaChkKTsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydEtleXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRLZXlzW2tleXMubGVuZ3RoIC0gMV0gPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydFZhbHVlczogZnVuY3Rpb24ob3JkZXIpIHsgc29ydFZhbHVlcyA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICByb2xsdXA6IGZ1bmN0aW9uKGYpIHsgcm9sbHVwID0gZjsgcmV0dXJuIG5lc3Q7IH1cbiAgfTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdCgpIHtcbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBzZXRPYmplY3Qob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgcmV0dXJuIG1hcCgpO1xufVxuXG5mdW5jdGlvbiBzZXRNYXAobWFwJCQxLCBrZXksIHZhbHVlKSB7XG4gIG1hcCQkMS5zZXQoa2V5LCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIFNldCgpIHt9XG5cbnZhciBwcm90byA9IG1hcC5wcm90b3R5cGU7XG5cblNldC5wcm90b3R5cGUgPSBzZXQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2V0LFxuICBoYXM6IHByb3RvLmhhcyxcbiAgYWRkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhbHVlICs9IFwiXCI7XG4gICAgdGhpc1twcmVmaXggKyB2YWx1ZV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBwcm90by5yZW1vdmUsXG4gIGNsZWFyOiBwcm90by5jbGVhcixcbiAgdmFsdWVzOiBwcm90by5rZXlzLFxuICBzaXplOiBwcm90by5zaXplLFxuICBlbXB0eTogcHJvdG8uZW1wdHksXG4gIGVhY2g6IHByb3RvLmVhY2hcbn07XG5cbmZ1bmN0aW9uIHNldChvYmplY3QsIGYpIHtcbiAgdmFyIHNldCA9IG5ldyBTZXQ7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIFNldCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUpIHsgc2V0LmFkZCh2YWx1ZSk7IH0pO1xuXG4gIC8vIE90aGVyd2lzZSwgYXNzdW1lIGl04oCZcyBhbiBhcnJheS5cbiAgZWxzZSBpZiAob2JqZWN0KSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IG9iamVjdC5sZW5ndGg7XG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIHNldC5hZGQob2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKGYob2JqZWN0W2ldLCBpLCBvYmplY3QpKTtcbiAgfVxuXG4gIHJldHVybiBzZXQ7XG59XG5cbnZhciBrZXlzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn07XG5cbnZhciB2YWx1ZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSB2YWx1ZXMucHVzaChtYXBba2V5XSk7XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG52YXIgZW50cmllcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgZW50cmllcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBlbnRyaWVzLnB1c2goe2tleToga2V5LCB2YWx1ZTogbWFwW2tleV19KTtcbiAgcmV0dXJuIGVudHJpZXM7XG59O1xuXG5leHBvcnRzLm5lc3QgPSBuZXN0O1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG5leHBvcnRzLm1hcCA9IG1hcDtcbmV4cG9ydHMua2V5cyA9IGtleXM7XG5leHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcbmV4cG9ydHMuZW50cmllcyA9IGVudHJpZXM7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRpc3BhdGNoLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBub29wID0ge3ZhbHVlOiBmdW5jdGlvbigpIHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydHMuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZHN2LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdENvbnZlcnRlcihjb2x1bW5zKSB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb24oXCJkXCIsIFwicmV0dXJuIHtcIiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSkgKyBcIjogZFtcIiArIGkgKyBcIl1cIjtcbiAgfSkuam9pbihcIixcIikgKyBcIn1cIik7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUNvbnZlcnRlcihjb2x1bW5zLCBmKSB7XG4gIHZhciBvYmplY3QgPSBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucyk7XG4gIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHtcbiAgICByZXR1cm4gZihvYmplY3Qocm93KSwgaSwgY29sdW1ucyk7XG4gIH07XG59XG5cbi8vIENvbXB1dGUgdW5pcXVlIGNvbHVtbnMgaW4gb3JkZXIgb2YgZGlzY292ZXJ5LlxuZnVuY3Rpb24gaW5mZXJDb2x1bW5zKHJvd3MpIHtcbiAgdmFyIGNvbHVtblNldCA9IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICBjb2x1bW5zID0gW107XG5cbiAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdykge1xuICAgIGZvciAodmFyIGNvbHVtbiBpbiByb3cpIHtcbiAgICAgIGlmICghKGNvbHVtbiBpbiBjb2x1bW5TZXQpKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChjb2x1bW5TZXRbY29sdW1uXSA9IGNvbHVtbik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29sdW1ucztcbn1cblxuZnVuY3Rpb24gZHN2KGRlbGltaXRlcikge1xuICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKFwiW1xcXCJcIiArIGRlbGltaXRlciArIFwiXFxuXVwiKSxcbiAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTtcblxuICBmdW5jdGlvbiBwYXJzZSh0ZXh0LCBmKSB7XG4gICAgdmFyIGNvbnZlcnQsIGNvbHVtbnMsIHJvd3MgPSBwYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICBpZiAoY29udmVydCkgcmV0dXJuIGNvbnZlcnQocm93LCBpIC0gMSk7XG4gICAgICBjb2x1bW5zID0gcm93LCBjb252ZXJ0ID0gZiA/IGN1c3RvbUNvbnZlcnRlcihyb3csIGYpIDogb2JqZWN0Q29udmVydGVyKHJvdyk7XG4gICAgfSk7XG4gICAgcm93cy5jb2x1bW5zID0gY29sdW1ucztcbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUm93cyh0ZXh0LCBmKSB7XG4gICAgdmFyIEVPTCA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWxpbmVcbiAgICAgICAgRU9GID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtZmlsZVxuICAgICAgICByb3dzID0gW10sIC8vIG91dHB1dCByb3dzXG4gICAgICAgIE4gPSB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgSSA9IDAsIC8vIGN1cnJlbnQgY2hhcmFjdGVyIGluZGV4XG4gICAgICAgIG4gPSAwLCAvLyB0aGUgY3VycmVudCBsaW5lIG51bWJlclxuICAgICAgICB0LCAvLyB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICBlb2w7IC8vIGlzIHRoZSBjdXJyZW50IHRva2VuIGZvbGxvd2VkIGJ5IEVPTD9cblxuICAgIGZ1bmN0aW9uIHRva2VuKCkge1xuICAgICAgaWYgKEkgPj0gTikgcmV0dXJuIEVPRjsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgZmlsZVxuICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGxpbmVcblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBxdW90ZXNcbiAgICAgIHZhciBqID0gSSwgYztcbiAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IDM0KSB7XG4gICAgICAgIHZhciBpID0gajtcbiAgICAgICAgd2hpbGUgKGkrKyA8IE4pIHtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkpID09PSAzNCkge1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMSkgIT09IDM0KSBicmVhaztcbiAgICAgICAgICAgICsraTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgSSA9IGkgKyAyO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgaWYgKGMgPT09IDEzKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAyKSA9PT0gMTApICsrSTtcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAxMCkge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiArIDEsIGkpLnJlcGxhY2UoL1wiXCIvZywgXCJcXFwiXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBjb21tb24gY2FzZTogZmluZCBuZXh0IGRlbGltaXRlciBvciBuZXdsaW5lXG4gICAgICB3aGlsZSAoSSA8IE4pIHtcbiAgICAgICAgdmFyIGsgPSAxO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KEkrKyk7XG4gICAgICAgIGlmIChjID09PSAxMCkgZW9sID0gdHJ1ZTsgLy8gXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgPT09IDEzKSB7IGVvbCA9IHRydWU7IGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsrazsgfSAvLyBcXHJ8XFxyXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlO1xuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogbGFzdCB0b2tlbiBiZWZvcmUgRU9GXG4gICAgICByZXR1cm4gdGV4dC5zbGljZShqKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7XG4gICAgICB2YXIgYSA9IFtdO1xuICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHtcbiAgICAgICAgYS5wdXNoKHQpO1xuICAgICAgICB0ID0gdG9rZW4oKTtcbiAgICAgIH1cbiAgICAgIGlmIChmICYmIChhID0gZihhLCBuKyspKSA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIHJvd3MucHVzaChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdChyb3dzLCBjb2x1bW5zKSB7XG4gICAgaWYgKGNvbHVtbnMgPT0gbnVsbCkgY29sdW1ucyA9IGluZmVyQ29sdW1ucyhyb3dzKTtcbiAgICByZXR1cm4gW2NvbHVtbnMubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcildLmNvbmNhdChyb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFZhbHVlKHJvd1tjb2x1bW5dKTtcbiAgICAgIH0pLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9KSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvd3Mocm93cykge1xuICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFZhbHVlKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dCA9PSBudWxsID8gXCJcIlxuICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSBcIlwiKSA/IFwiXFxcIlwiICsgdGV4dC5yZXBsYWNlKC9cXFwiL2csIFwiXFxcIlxcXCJcIikgKyBcIlxcXCJcIlxuICAgICAgICA6IHRleHQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhcnNlOiBwYXJzZSxcbiAgICBwYXJzZVJvd3M6IHBhcnNlUm93cyxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICBmb3JtYXRSb3dzOiBmb3JtYXRSb3dzXG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCIsXCIpO1xuXG52YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7XG52YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93cztcbnZhciBjc3ZGb3JtYXQgPSBjc3YuZm9ybWF0O1xudmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93cztcblxudmFyIHRzdiA9IGRzdihcIlxcdFwiKTtcblxudmFyIHRzdlBhcnNlID0gdHN2LnBhcnNlO1xudmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7XG52YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDtcbnZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7XG5cbmV4cG9ydHMuZHN2Rm9ybWF0ID0gZHN2O1xuZXhwb3J0cy5jc3ZQYXJzZSA9IGNzdlBhcnNlO1xuZXhwb3J0cy5jc3ZQYXJzZVJvd3MgPSBjc3ZQYXJzZVJvd3M7XG5leHBvcnRzLmNzdkZvcm1hdCA9IGNzdkZvcm1hdDtcbmV4cG9ydHMuY3N2Rm9ybWF0Um93cyA9IGNzdkZvcm1hdFJvd3M7XG5leHBvcnRzLnRzdlBhcnNlID0gdHN2UGFyc2U7XG5leHBvcnRzLnRzdlBhcnNlUm93cyA9IHRzdlBhcnNlUm93cztcbmV4cG9ydHMudHN2Rm9ybWF0ID0gdHN2Rm9ybWF0O1xuZXhwb3J0cy50c3ZGb3JtYXRSb3dzID0gdHN2Rm9ybWF0Um93cztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTsiLCIvLyBodHRwczovL2QzanMub3JnL2QzLXJlcXVlc3QvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cywgcmVxdWlyZSgnZDMtY29sbGVjdGlvbicpLCByZXF1aXJlKCdkMy1kaXNwYXRjaCcpLCByZXF1aXJlKCdkMy1kc3YnKSkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJywgJ2QzLWNvbGxlY3Rpb24nLCAnZDMtZGlzcGF0Y2gnLCAnZDMtZHN2J10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSksZ2xvYmFsLmQzLGdsb2JhbC5kMyxnbG9iYWwuZDMpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzLGQzQ29sbGVjdGlvbixkM0Rpc3BhdGNoLGQzRHN2KSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3QgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gIHZhciByZXF1ZXN0LFxuICAgICAgZXZlbnQgPSBkM0Rpc3BhdGNoLmRpc3BhdGNoKFwiYmVmb3Jlc2VuZFwiLCBcInByb2dyZXNzXCIsIFwibG9hZFwiLCBcImVycm9yXCIpLFxuICAgICAgbWltZVR5cGUsXG4gICAgICBoZWFkZXJzID0gZDNDb2xsZWN0aW9uLm1hcCgpLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0LFxuICAgICAgdXNlciA9IG51bGwsXG4gICAgICBwYXNzd29yZCA9IG51bGwsXG4gICAgICByZXNwb25zZSxcbiAgICAgIHJlc3BvbnNlVHlwZSxcbiAgICAgIHRpbWVvdXQgPSAwO1xuXG4gIC8vIElmIElFIGRvZXMgbm90IHN1cHBvcnQgQ09SUywgdXNlIFhEb21haW5SZXF1ZXN0LlxuICBpZiAodHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAmJiAhKFwid2l0aENyZWRlbnRpYWxzXCIgaW4geGhyKVxuICAgICAgJiYgL14oaHR0cChzKT86KT9cXC9cXC8vLnRlc3QodXJsKSkgeGhyID0gbmV3IFhEb21haW5SZXF1ZXN0O1xuXG4gIFwib25sb2FkXCIgaW4geGhyXG4gICAgICA/IHhoci5vbmxvYWQgPSB4aHIub25lcnJvciA9IHhoci5vbnRpbWVvdXQgPSByZXNwb25kXG4gICAgICA6IHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihvKSB7IHhoci5yZWFkeVN0YXRlID4gMyAmJiByZXNwb25kKG8pOyB9O1xuXG4gIGZ1bmN0aW9uIHJlc3BvbmQobykge1xuICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzLCByZXN1bHQ7XG4gICAgaWYgKCFzdGF0dXMgJiYgaGFzUmVzcG9uc2UoeGhyKVxuICAgICAgICB8fCBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMFxuICAgICAgICB8fCBzdGF0dXMgPT09IDMwNCkge1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2UuY2FsbChyZXF1ZXN0LCB4aHIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0geGhyO1xuICAgICAgfVxuICAgICAgZXZlbnQuY2FsbChcImxvYWRcIiwgcmVxdWVzdCwgcmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIG8pO1xuICAgIH1cbiAgfVxuXG4gIHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSkge1xuICAgIGV2ZW50LmNhbGwoXCJwcm9ncmVzc1wiLCByZXF1ZXN0LCBlKTtcbiAgfTtcblxuICByZXF1ZXN0ID0ge1xuICAgIGhlYWRlcjogZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIG5hbWUgPSAobmFtZSArIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiBoZWFkZXJzLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSBoZWFkZXJzLnJlbW92ZShuYW1lKTtcbiAgICAgIGVsc2UgaGVhZGVycy5zZXQobmFtZSwgdmFsdWUgKyBcIlwiKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBJZiBtaW1lVHlwZSBpcyBub24tbnVsbCBhbmQgbm8gQWNjZXB0IGhlYWRlciBpcyBzZXQsIGEgZGVmYXVsdCBpcyB1c2VkLlxuICAgIG1pbWVUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbWltZVR5cGU7XG4gICAgICBtaW1lVHlwZSA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZmllcyB3aGF0IHR5cGUgdGhlIHJlc3BvbnNlIHZhbHVlIHNob3VsZCB0YWtlO1xuICAgIC8vIGZvciBpbnN0YW5jZSwgYXJyYXlidWZmZXIsIGJsb2IsIGRvY3VtZW50LCBvciB0ZXh0LlxuICAgIHJlc3BvbnNlVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJlc3BvbnNlVHlwZTtcbiAgICAgIHJlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHRpbWVvdXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aW1lb3V0O1xuICAgICAgdGltZW91dCA9ICt2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB1c2VyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gdXNlciA6ICh1c2VyID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICBwYXNzd29yZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHBhc3N3b3JkIDogKHBhc3N3b3JkID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZ5IGhvdyB0byBjb252ZXJ0IHRoZSByZXNwb25zZSBjb250ZW50IHRvIGEgc3BlY2lmaWMgdHlwZTtcbiAgICAvLyBjaGFuZ2VzIHRoZSBjYWxsYmFjayB2YWx1ZSBvbiBcImxvYWRcIiBldmVudHMuXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiR0VUXCIsIOKApikuXG4gICAgZ2V0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIkdFVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiUE9TVFwiLCDigKYpLlxuICAgIHBvc3Q6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiUE9TVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIElmIGNhbGxiYWNrIGlzIG5vbi1udWxsLCBpdCB3aWxsIGJlIHVzZWQgZm9yIGVycm9yIGFuZCBsb2FkIGV2ZW50cy5cbiAgICBzZW5kOiBmdW5jdGlvbihtZXRob2QsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSwgdXNlciwgcGFzc3dvcmQpO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgIWhlYWRlcnMuaGFzKFwiYWNjZXB0XCIpKSBoZWFkZXJzLnNldChcImFjY2VwdFwiLCBtaW1lVHlwZSArIFwiLCovKlwiKTtcbiAgICAgIGlmICh4aHIuc2V0UmVxdWVzdEhlYWRlcikgaGVhZGVycy5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTsgfSk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiB4aHIub3ZlcnJpZGVNaW1lVHlwZSkgeGhyLm92ZXJyaWRlTWltZVR5cGUobWltZVR5cGUpO1xuICAgICAgaWYgKHJlc3BvbnNlVHlwZSAhPSBudWxsKSB4aHIucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlO1xuICAgICAgaWYgKHRpbWVvdXQgPiAwKSB4aHIudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICBpZiAoY2FsbGJhY2sgPT0gbnVsbCAmJiB0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgY2FsbGJhY2subGVuZ3RoID09PSAxKSBjYWxsYmFjayA9IGZpeENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgY2FsbGJhY2spLm9uKFwibG9hZFwiLCBmdW5jdGlvbih4aHIpIHsgY2FsbGJhY2sobnVsbCwgeGhyKTsgfSk7XG4gICAgICBldmVudC5jYWxsKFwiYmVmb3Jlc2VuZFwiLCByZXF1ZXN0LCB4aHIpO1xuICAgICAgeGhyLnNlbmQoZGF0YSA9PSBudWxsID8gbnVsbCA6IGRhdGEpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIGFib3J0OiBmdW5jdGlvbigpIHtcbiAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGV2ZW50Lm9uLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBldmVudCA/IHJlcXVlc3QgOiB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHJldHVybiByZXF1ZXN0LmdldChjYWxsYmFjayk7XG4gIH1cblxuICByZXR1cm4gcmVxdWVzdDtcbn07XG5cbmZ1bmN0aW9uIGZpeENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbihlcnJvciwgeGhyKSB7XG4gICAgY2FsbGJhY2soZXJyb3IgPT0gbnVsbCA/IHhociA6IG51bGwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoYXNSZXNwb25zZSh4aHIpIHtcbiAgdmFyIHR5cGUgPSB4aHIucmVzcG9uc2VUeXBlO1xuICByZXR1cm4gdHlwZSAmJiB0eXBlICE9PSBcInRleHRcIlxuICAgICAgPyB4aHIucmVzcG9uc2UgLy8gbnVsbCBvbiBlcnJvclxuICAgICAgOiB4aHIucmVzcG9uc2VUZXh0OyAvLyBcIlwiIG9uIGVycm9yXG59XG5cbnZhciB0eXBlID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCByZXNwb25zZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSkucmVzcG9uc2UocmVzcG9uc2UpO1xuICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuIHIuZ2V0KGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH07XG59O1xuXG52YXIgaHRtbCA9IHR5cGUoXCJ0ZXh0L2h0bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVSYW5nZSgpLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIganNvbiA9IHR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIgdGV4dCA9IHR5cGUoXCJ0ZXh0L3BsYWluXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dDtcbn0pO1xuXG52YXIgeG1sID0gdHlwZShcImFwcGxpY2F0aW9uL3htbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgdmFyIHhtbCA9IHhoci5yZXNwb25zZVhNTDtcbiAgaWYgKCF4bWwpIHRocm93IG5ldyBFcnJvcihcInBhcnNlIGVycm9yXCIpO1xuICByZXR1cm4geG1sO1xufSk7XG5cbnZhciBkc3YgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHBhcnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIHJvdywgY2FsbGJhY2spIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGNhbGxiYWNrID0gcm93LCByb3cgPSBudWxsO1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSk7XG4gICAgci5yb3cgPSBmdW5jdGlvbihfKSB7IHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gci5yZXNwb25zZShyZXNwb25zZU9mKHBhcnNlLCByb3cgPSBfKSkgOiByb3c7IH07XG4gICAgci5yb3cocm93KTtcbiAgICByZXR1cm4gY2FsbGJhY2sgPyByLmdldChjYWxsYmFjaykgOiByO1xuICB9O1xufTtcblxuZnVuY3Rpb24gcmVzcG9uc2VPZihwYXJzZSwgcm93KSB7XG4gIHJldHVybiBmdW5jdGlvbihyZXF1ZXN0JCQxKSB7XG4gICAgcmV0dXJuIHBhcnNlKHJlcXVlc3QkJDEucmVzcG9uc2VUZXh0LCByb3cpO1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwidGV4dC9jc3ZcIiwgZDNEc3YuY3N2UGFyc2UpO1xuXG52YXIgdHN2ID0gZHN2KFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiLCBkM0Rzdi50c3ZQYXJzZSk7XG5cbmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG5leHBvcnRzLmh0bWwgPSBodG1sO1xuZXhwb3J0cy5qc29uID0ganNvbjtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG5leHBvcnRzLnhtbCA9IHhtbDtcbmV4cG9ydHMuY3N2ID0gY3N2O1xuZXhwb3J0cy50c3YgPSB0c3Y7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIhZnVuY3Rpb24oZSxuKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1uKHJlcXVpcmUoXCJkMy1yZXF1ZXN0XCIpKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImQzLXJlcXVlc3RcIl0sbik6KGUuZDM9ZS5kM3x8e30sZS5kMy5wcm9taXNlPW4oZS5kMykpfSh0aGlzLGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSxuKXtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aCxyPUFycmF5KHQpLG89MDt0Pm87bysrKXJbb109YXJndW1lbnRzW29dO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbih0LG8pe3ZhciB1PWZ1bmN0aW9uKGUsbil7cmV0dXJuIGU/dm9pZCBvKEVycm9yKGUpKTp2b2lkIHQobil9O24uYXBwbHkoZSxyLmNvbmNhdCh1KSl9KX19dmFyIHQ9e307cmV0dXJuW1wiY3N2XCIsXCJ0c3ZcIixcImpzb25cIixcInhtbFwiLFwidGV4dFwiLFwiaHRtbFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHIpe3Rbcl09bihlLGVbcl0pfSksdH0pOyIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xudmFyIGQzID0gcmVxdWlyZSgnZDMucHJvbWlzZScpO1xuXG5mdW5jdGlvbiBkZWYoYSwgYikge1xuICAgIHJldHVybiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcbn1cbi8qXG5NYW5hZ2VzIGZldGNoaW5nIGEgZGF0YXNldCBmcm9tIFNvY3JhdGEgYW5kIHByZXBhcmluZyBpdCBmb3IgdmlzdWFsaXNhdGlvbiBieVxuY291bnRpbmcgZmllbGQgdmFsdWUgZnJlcXVlbmNpZXMgZXRjLiBcbiovXG5leHBvcnQgY2xhc3MgU291cmNlRGF0YSB7XG4gICAgY29uc3RydWN0b3IoZGF0YUlkLCBhY3RpdmVDZW5zdXNZZWFyKSB7XG4gICAgICAgIHRoaXMuZGF0YUlkID0gZGF0YUlkO1xuICAgICAgICB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgPSBkZWYoYWN0aXZlQ2Vuc3VzWWVhciwgMjAxNSk7XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IHVuZGVmaW5lZDsgIC8vIG5hbWUgb2YgY29sdW1uIHdoaWNoIGhvbGRzIGxhdC9sb24gb3IgYmxvY2sgSURcbiAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB1bmRlZmluZWQ7IC8vIGlmIHRoZSBkYXRhc2V0IHR5cGUgaXMgJ3BvaW50JyAodXNlZCBmb3IgcGFyc2luZyBsb2NhdGlvbiBmaWVsZClcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IFtdOyAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIG51bWVyaWMgZGF0YXZpc1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gW107ICAgICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgZW51bSBkYXRhdmlzXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IFtdOyAgICAgICAgICAvLyBuYW1lcyBvZiBvdGhlciBjb2x1bW5zXG4gICAgICAgIHRoaXMubWlucyA9IHt9OyAgICAgICAgICAgICAgICAgICAvLyBtaW4gYW5kIG1heCBvZiBlYWNoIG51bWVyaWMgY29sdW1uXG4gICAgICAgIHRoaXMubWF4cyA9IHt9O1xuICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzID0ge307ICAgICAgICAgICAgLy8gXG4gICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXMgPSB7fTsgICAgICAvLyBtb3N0IGZyZXF1ZW50IHZhbHVlcyBpbiBlYWNoIHRleHQgY29sdW1uXG4gICAgICAgIHRoaXMuc2hhcGUgPSAncG9pbnQnOyAgICAgICAgICAgICAvLyBwb2ludCBvciBwb2x5Z29uIChDTFVFIGJsb2NrKVxuICAgICAgICB0aGlzLnJvd3MgPSB1bmRlZmluZWQ7ICAgICAgICAgICAgLy8gcHJvY2Vzc2VkIHJvd3NcbiAgICAgICAgdGhpcy5ibG9ja0luZGV4ID0ge307ICAgICAgICAgICAgIC8vIGNhY2hlIG9mIENMVUUgYmxvY2sgSURzXG4gICAgfVxuXG5cbiAgICBjaG9vc2VDb2x1bW5UeXBlcyAoY29sdW1ucykge1xuICAgICAgICAvL3ZhciBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbG9jYXRpb24nIHx8IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcgfHwgY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICAvLyBcImxvY2F0aW9uXCIgYW5kIFwicG9pbnRcIiBhcmUgYm90aCBwb2ludCBkYXRhIHR5cGVzLCBleHByZXNzZWQgZGlmZmVyZW50bHkuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgYSBcImJsb2NrIElEXCIgY2FuIGJlIGpvaW5lZCBhZ2FpbnN0IHRoZSBDTFVFIEJsb2NrIHBvbHlnb25zIHdoaWNoIGFyZSBpbiBNYXBib3guXG4gICAgICAgIGxldCBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbG9jYXRpb24nIHx8IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcpWzBdO1xuICAgICAgICBpZiAoIWxjKSB7XG4gICAgICAgICAgICBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChsYy5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcpXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGxjLm5hbWUgPT09ICdCbG9jayBJRCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUgPSAncG9seWdvbic7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gbGMubmFtZTtcblxuICAgICAgICBjb2x1bW5zID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbCAhPT0gbGMpO1xuXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbnVtYmVyJyAmJiBjb2wubmFtZSAhPT0gJ0xhdGl0dWRlJyAmJiBjb2wubmFtZSAhPT0gJ0xvbmdpdHVkZScpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4geyB0aGlzLm1pbnNbY29sXSA9IDFlOTsgdGhpcy5tYXhzW2NvbF0gPSAtMWU5OyB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAndGV4dCcpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG5cbiAgICAgICAgdGhpcy50ZXh0Q29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHRoaXMuZnJlcXVlbmNpZXNbY29sXSA9IHt9KTtcblxuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IHRoaXMubnVtZXJpY0NvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCAmJiB0aGlzLnRleHRDb2x1bW5zLmluZGV4T2YoY29sKSA8IDApO1xuICAgIH1cblxuICAgIC8vIFRPRE8gYmV0dGVyIG5hbWUgYW5kIGJlaGF2aW91clxuICAgIGZpbHRlcihyb3cpIHtcbiAgICAgICAgLy8gVE9ETyBtb3ZlIHRoaXMgc29tZXdoZXJlIGJldHRlclxuICAgICAgICBpZiAocm93WydDTFVFIHNtYWxsIGFyZWEnXSAmJiByb3dbJ0NMVUUgc21hbGwgYXJlYSddID09PSAnQ2l0eSBvZiBNZWxib3VybmUgdG90YWwnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAocm93WydDZW5zdXMgeWVhciddICYmIHJvd1snQ2Vuc3VzIHllYXInXSAhPT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuXG4gICAgLy8gY29udmVydCBudW1lcmljIGNvbHVtbnMgdG8gbnVtYmVycyBmb3IgZGF0YSB2aXNcbiAgICBjb252ZXJ0Um93KHJvdykge1xuXG4gICAgICAgIC8vIGNvbnZlcnQgbG9jYXRpb24gdHlwZXMgKHN0cmluZykgdG8gW2xvbiwgbGF0XSBhcnJheS5cbiAgICAgICAgZnVuY3Rpb24gbG9jYXRpb25Ub0Nvb3Jkcyhsb2NhdGlvbikge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsb2NhdGlvbikubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBcIm5ldyBiYWNrZW5kXCIgZGF0YXNldHMgdXNlIGEgV0tUIGZpZWxkIFtQT0lOVCAobG9uIGxhdCldIGluc3RlYWQgb2YgKGxhdCwgbG9uKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uSXNQb2ludCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb24ucmVwbGFjZSgnUE9JTlQgKCcsICcnKS5yZXBsYWNlKCcpJywgJycpLnNwbGl0KCcgJykubWFwKG4gPT4gTnVtYmVyKG4pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsb2NhdGlvbi5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW051bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVsxXS5yZXBsYWNlKCcpJywgJycpKSwgTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzBdLnJlcGxhY2UoJygnLCAnJykpXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbnJlYWRhYmxlIGxvY2F0aW9uICR7bG9jYXRpb259IGluICR7dGhpcy5uYW1lfS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gdXNlIGNvbHVtbi5jYWNoZWRDb250ZW50cy5zbWFsbGVzdCBhbmQgLmxhcmdlc3RcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICByb3dbY29sXSA9IE51bWJlcihyb3dbY29sXSkgOyAvLyArcm93W2NvbF0gYXBwYXJlbnRseSBmYXN0ZXIsIGJ1dCBicmVha3Mgb24gc2ltcGxlIHRoaW5ncyBsaWtlIGJsYW5rIHZhbHVlc1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoZSB0b3RhbCB2YWx1ZXMgaW4gXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPCB0aGlzLm1pbnNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWluc1tjb2xdID0gcm93W2NvbF07XG5cbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA+IHRoaXMubWF4c1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhzW2NvbF0gPSByb3dbY29sXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHJvd1tjb2xdO1xuICAgICAgICAgICAgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gPSAodGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0gPSBsb2NhdGlvblRvQ29vcmRzLmNhbGwodGhpcywgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKTtcblxuICAgICAgICBpZiAoIXJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSlcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBza2lwIHRoaXMgcm93LlxuXG4gICAgICAgIHJldHVybiByb3c7XG4gICAgfVxuXG4gICAgY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCkge1xuICAgICAgICB2YXIgbmV3VGV4dENvbHVtbnMgPSBbXTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF0gPSBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pXG4gICAgICAgICAgICAgICAgLnNvcnQoKHZhbGEsIHZhbGIpID0+IHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxhXSA8IHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxiXSA/IDEgOiAtMSlcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwxMik7XG5cbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA8IDIgfHwgT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPiAyMCAmJiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdWzFdXSA8PSA1KSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBib3JpbmcgaWYgYWxsIHZhbHVlcyB0aGUgc2FtZSwgb3IgaWYgdG9vIG1hbnkgZGlmZmVyZW50IHZhbHVlcyAoYXMganVkZ2VkIGJ5IHNlY29uZC1tb3N0IGNvbW1vbiB2YWx1ZSBiZWluZyA1IHRpbWVzIG9yIGZld2VyKVxuICAgICAgICAgICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucy5wdXNoKGNvbCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1RleHRDb2x1bW5zLnB1c2goY29sKTsgLy8gaG93IGRvIHlvdSBzYWZlbHkgZGVsZXRlIGZyb20gYXJyYXkgeW91J3JlIGxvb3Bpbmcgb3Zlcj9cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gbmV3VGV4dENvbHVtbnM7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3J0ZWRGcmVxdWVuY2llcyk7XG4gICAgfVxuXG4gICAgLy8gUmV0cmlldmUgcm93cyBmcm9tIFNvY3JhdGEgKHJldHVybnMgUHJvbWlzZSkuIFwiTmV3IGJhY2tlbmRcIiB2aWV3cyBnbyB0aHJvdWdoIGFuIGFkZGl0aW9uYWwgc3RlcCB0byBmaW5kIHRoZSByZWFsXG4gICAgLy8gQVBJIGVuZHBvaW50LlxuICAgIGxvYWQoKSB7XG4gICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZCArICcuanNvbicpXG4gICAgICAgIC50aGVuKHByb3BzID0+IHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IHByb3BzLm5hbWU7XG4gICAgICAgICAgICBpZiAocHJvcHMubmV3QmFja2VuZCAmJiBwcm9wcy5jaGlsZFZpZXdzLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YUlkID0gcHJvcHMuY2hpbGRWaWV3c1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocHJvcHMgPT4gdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGQzLmNzdignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnL3Jvd3MuY3N2P2FjY2Vzc1R5cGU9RE9XTkxPQUQnLCB0aGlzLmNvbnZlcnRSb3cuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKHJvd3MgPT4ge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJHb3Qgcm93cyBmb3IgXCIgKyB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvbHlnb24nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVCbG9ja0luZGV4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2JsZW0gbG9hZGluZyAnICsgdGhpcy5uYW1lICsgJy4nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUHJvYmxlbSBsb2FkaW5nICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gQ3JlYXRlIGEgaGFzaCB0YWJsZSBsb29rdXAgZnJvbSBbeWVhciwgYmxvY2sgSURdIHRvIGRhdGFzZXQgcm93XG4gICAgY29tcHV0ZUJsb2NrSW5kZXgoKSB7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV1bcm93WydCbG9jayBJRCddXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSb3dGb3JCbG9jayhibG9ja0lkIC8qIGNlbnN1c195ZWFyICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbdGhpcy5ibG9ja0luZGV4W3RoaXMuYWN0aXZlQ2Vuc3VzWWVhcl1bYmxvY2tJZF1dO1xuICAgIH1cblxuICAgIGZpbHRlcmVkUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIocm93ID0+IHJvd1snQ2Vuc3VzIHllYXInXSA9PT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gIT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpO1xuICAgIH1cbn0iXX0=

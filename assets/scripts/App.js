(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _sourceData = require('./sourceData');

var _flightPath = require('./flightPath');

var _cycleDatasets = require('./cycleDatasets');

var _mapVis = require('./mapVis');

console.log(_cycleDatasets.datasets);
//mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
/* jshint esnext:true */
//'use strict';
//var mapboxgl = require('mapbox-gl');
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
// Can't just use 'visibility' prop, because when a layer is invisible it doesn't preload.
function getOpacityProps(layer) {
    var ret = [opacityProp[layer.type]];
    if (layer.layout && layer.layout['text-field']) ret.push('text-opacity');
    if (layer.paint && layer.paint['circle-stroke-color']) ret.push('circle-stroke-opacity');

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
    if (d.dataset) {
        showCaption(d.dataset.name, d.dataset.dataId, d.caption);
    } else if (d.caption) {
        showCaption(d.name, undefined, d.caption);
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

function listenForKeystrokes(map, options) {
    document.querySelector('body').addEventListener('keydown', function (e) {
        //console.log(e.keyCode);
        // , and . stop the animation and advance forward/back
        if ([190, 188].indexOf(e.keyCode) > -1 && options.demoMode) {
            map.stop();
            window.stopped = true;
            removeDataset(map, _cycleDatasets.datasets[_datasetNo]);
            nextDataset(map, (_datasetNo + { 190: 1, 188: -1 }[e.keyCode] + _cycleDatasets.datasets.length) % _cycleDatasets.datasets.length);
        } else if (e.keyCode === 32 && options.demoMode) {
            // Space = start/stop
            window.stopped = !window.stopped;
            if (window.stopped) map.stop();else {
                removeDataset(map, _cycleDatasets.datasets[_datasetNo]);
                nextDataset(map, _datasetNo);
            }
        }
    });
}

function setupMap(options) {
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
        // When we manually position the map, dump the location to console - makes it easy to create tours.
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });
    map.on('error', function (e) {
        // Hide those annoying non-error errors
        if (e && e.error !== 'Error: Not Found') console.error(e);
    });
    listenForKeystrokes(map, options);
    if (options.spin) (0, _flightPath.spin)(map);
    return map;
}

/* Pre download all non-mapbox datasets in the loop */
// also get rid of the sidebar. :)
function loadDatasets(map) {
    // if we did this after the map was loading, call map.resize();
    document.querySelector('#features').style.display = 'none';
    document.querySelector('#legends').style.display = 'none';
    // For people who want the "script".        
    window.captions = _cycleDatasets.datasets.map(function (d) {
        return d.caption + ' (' + d.delay / 1000 + 's)';
    }).join('\n');

    return Promise.all(_cycleDatasets.datasets.map(function (d) {
        if (d.dataset) {
            console.log('Loading dataset ' + d.dataset.dataId);
            return d.dataset.load();
        } else return Promise.resolve();
    })).then(function () {
        return _cycleDatasets.datasets[0].dataset;
    });
}

function loadOneDataset(dataset) {
    return new _sourceData.SourceData(dataset).load();
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
    function getRegexPart(hash, regex, part) {
        return def(hash.match(regex), [])[part + 1];
    }
    var options = {};
    var hash = window.location.hash;
    if (hash.match('#demo')) {
        options.demoMode = true;
        options.start = def(getRegexPart(hash, /&start=(\d+)/, 0), 0);
        console.log(options.start);
    } else if (hash) {
        // ### replace with more selective RE
        options.dataset = def(hash.match(/#([a-zA-Z0-9]{4}-[a-zA-Z0-9]{4})/), [])[1];
        options.spin = /&spin/.test(hash);
        /*options.mapboxId = def(hash.match(/(mapbox:\/\/[a-zA-Z0-9]+\.[a-zA-Z0-9]+), [])[1];
        if (options.mapboxId) {
            options.mapboxDataset = {
                id: 'mapbox-points',
                type: 'circle',
                source: options.mapbox
             }
        }*/
    }
    return options;
}

(function start() {
    try {
        document.documentElement.requestFullscreen();
    } catch (e) {} // probably does nothing.

    var p = void 0,
        options = parseUrl();
    if (options.demoMode) {
        p = loadDatasets(map);
    } else {
        if (!options.dataset) options.dataset = chooseDataset();
        p = loadOneDataset(options.dataset);
    }
    var map = setupMap(options);
    p.then(function (dataset) {
        window.scrollTo(0, 1); // does this hide the address bar? Nope    
        if (dataset) showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, function () {

            if (options.demoMode) {
                // start the cycle of datasets (0 = first dataset)
                nextDataset(map, options.start);
                //var fp = new FlightPath(map);
            } else {
                showDataset(map, dataset); // just show one dataset.
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
    caption: 'Melbourne has a lot of data, ready for you to access and use through our Open Data Platform.',
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
    caption: 'We have data about property boundaries that we use for planning',
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
    caption: 'We have data about property boundaries that we use for planning',
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
    caption: 'And data about every street address.',
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
    caption: 'Our urban forest data contains every elm tree...',
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
    caption: 'CLUE reveals our employment hot spots.',
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
        layout: {
            'line-join': 'round'

        },
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
    caption: 'Which night is bin night?',
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
    caption: 'How many bikes are available at each of our bike-share stations.',
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

    caption: 'Our data tells you where your dog can roam free.',
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
    caption: 'What will <b><i>you</i></b> do with our data?<br/>Find your next dataset at data.melbourne.vic.gov.au',
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
    caption: 'What will <b><i>you</i></b> do with our data?<br/>Find your next dataset at data.melbourne.vic.gov.au',
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
exports.spin = spin;

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

function spinMore(map) {
    var lapTime = 60; // time in seconds for one complete revolution. Slow is good!
    map.rotateTo((map.getBearing() + 45) % 360, {
        easing: function easing(t) {
            return t;
        },
        duration: lapTime / (360 / 45) * 1000
    }, { source: 'spin' });
}

function spin(map) {
    spinMore(map);

    if (!map._spinning) {
        map._spinning = true; // ok it's hacky but I seriously couldn't think of another way to make sure we only do this once.
        map.on('moveend', function (e) {
            if (e.source === 'spin') {
                spinMore(map);
            }
        });
    }
}

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
            'circle-stroke-opacity': !invisible ? 0.95 : 0,
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0EsUUFBUSxHQUFSO0FBQ0E7QUFUQTtBQUNBO0FBQ0E7QUFRQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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QUpDLEtBRmhCO0FBUUUsZ0JBQVk7QUFDVixjQUFRLE9BREU7QUFFVixxQkFBZSxDQUNiLGtCQURhLEVBRWIsQ0FBQyxpQkFGWTtBQUZMO0FBUmQsR0E5Q1U7QUFGZ0IsQ0FBdkI7OztBQ0FQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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Q0g7O0FBR0Q7Ozs7NENBQ29CO0FBQUE7O0FBQ2hCLGlCQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLFVBQUMsR0FBRCxFQUFNLEtBQU4sRUFBZ0I7QUFDOUIsb0JBQUksT0FBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixNQUF3QyxTQUE1QyxFQUNJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsSUFBc0MsRUFBdEM7QUFDSix1QkFBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixFQUFvQyxJQUFJLFVBQUosQ0FBcEMsSUFBdUQsS0FBdkQ7QUFDSCxhQUpEO0FBS0g7Ozt1Q0FFYyxPLENBQVEsaUIsRUFBbUI7QUFDdEMsbUJBQU8sS0FBSyxJQUFMLENBQVUsS0FBSyxVQUFMLENBQWdCLEtBQUssZ0JBQXJCLEVBQXVDLE9BQXZDLENBQVYsQ0FBUDtBQUNIOzs7dUNBRWM7QUFBQTs7QUFDWCxtQkFBTyxLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCO0FBQUEsdUJBQU8sSUFBSSxhQUFKLE1BQXVCLE9BQUssZ0JBQTVCLElBQWdELElBQUksaUJBQUosTUFBMkIseUJBQWxGO0FBQUEsYUFBakIsQ0FBUDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuLy8ndXNlIHN0cmljdCc7XG4vL3ZhciBtYXBib3hnbCA9IHJlcXVpcmUoJ21hcGJveC1nbCcpO1xuaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gJy4vc291cmNlRGF0YSc7XG5pbXBvcnQgeyBGbGlnaHRQYXRoIH0gZnJvbSAnLi9mbGlnaHRQYXRoJztcbmltcG9ydCB7IHNwaW4gfSBmcm9tICcuL2ZsaWdodFBhdGgnO1xuaW1wb3J0IHsgZGF0YXNldHMgfSBmcm9tICcuL2N5Y2xlRGF0YXNldHMnO1xuaW1wb3J0IHsgTWFwVmlzIH0gZnJvbSAnLi9tYXBWaXMnO1xuY29uc29sZS5sb2coZGF0YXNldHMpO1xuLy9tYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWMzUmxkbUZuWlNJc0ltRWlPaUpqYVhoeGNHczBiemN3WW5NM01uWnNPV0ppYWpWd2FISjJJbjAuUk43S3l3TU94TExObWNURmZuMGNpZyc7XG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaVkybDBlVzltYldWc1ltOTFjbTVsSWl3aVlTSTZJbU5wZWpkb2IySjBjekF3T1dRek0yMXViR3Q2TURWcWFIb2lmUS41NVlicWVUSFdNS19iNkNFQW1vVWxBJztcbi8qXG5QZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnM6IHlnYXctNnJ6cVxuXG4qKlRyZWVzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvI2ZwMzgtd2l5eVxuXG5FdmVudCBib29raW5nczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyM4NGJmLWRpaGlcbkJpa2Ugc2hhcmUgc3RhdGlvbnM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jdGR2aC1uOWR2XG5EQU06IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZ2g3cy1xZGE4XG4qL1xuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgd2hlbk1hcExvYWRlZCA9IChtYXAsIGYpID0+IG1hcC5sb2FkZWQoKSA/IGYoKSA6IG1hcC5vbmNlKCdsb2FkJywgZik7XG5cbmxldCBjbG9uZSA9IG9iaiA9PiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuXG5jb25zdCBvcGFjaXR5UHJvcCA9IHtcbiAgICAgICAgICAgIGZpbGw6ICdmaWxsLW9wYWNpdHknLFxuICAgICAgICAgICAgY2lyY2xlOiAnY2lyY2xlLW9wYWNpdHknLFxuICAgICAgICAgICAgc3ltYm9sOiAnaWNvbi1vcGFjaXR5JyxcbiAgICAgICAgICAgICdsaW5lJzogJ2xpbmUtb3BhY2l0eScsXG4gICAgICAgICAgICAnZmlsbC1leHRydXNpb24nOiAnZmlsbC1leHRydXNpb24tb3BhY2l0eSdcbiAgICAgICAgfTtcblxuLy8gcmV0dXJucyBhIHZhbHVlIGxpa2UgJ2NpcmNsZS1vcGFjaXR5JywgZm9yIGEgZ2l2ZW4gbGF5ZXIgc3R5bGUuXG4vLyBDYW4ndCBqdXN0IHVzZSAndmlzaWJpbGl0eScgcHJvcCwgYmVjYXVzZSB3aGVuIGEgbGF5ZXIgaXMgaW52aXNpYmxlIGl0IGRvZXNuJ3QgcHJlbG9hZC5cbmZ1bmN0aW9uIGdldE9wYWNpdHlQcm9wcyhsYXllcikge1xuICAgIGxldCByZXQgPSBbb3BhY2l0eVByb3BbbGF5ZXIudHlwZV1dO1xuICAgIGlmIChsYXllci5sYXlvdXQgJiYgbGF5ZXIubGF5b3V0Wyd0ZXh0LWZpZWxkJ10pXG4gICAgICAgIHJldC5wdXNoKCd0ZXh0LW9wYWNpdHknKTtcbiAgICBpZiAobGF5ZXIucGFpbnQgJiYgbGF5ZXIucGFpbnRbJ2NpcmNsZS1zdHJva2UtY29sb3InXSlcbiAgICAgICAgcmV0LnB1c2goJ2NpcmNsZS1zdHJva2Utb3BhY2l0eScpO1xuICAgIFxuICAgIHJldHVybiByZXQ7XG59XG5cbi8vZmFsc2UgJiYgd2hlbk1hcExvYWRlZCgoKSA9PlxuLy8gIHNldFZpc0NvbHVtbihzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMubGVuZ3RoKV0pKTtcblxuLy8gVE9ETyBkZWNpZGUgaWYgdGhpcyBzaG91bGQgYmUgaW4gTWFwVmlzXG5mdW5jdGlvbiBzaG93RmVhdHVyZVRhYmxlKGZlYXR1cmUsIHNvdXJjZURhdGEsIG1hcHZpcykge1xuICAgIGZ1bmN0aW9uIHJvd3NJbkFycmF5KGFycmF5LCBjbGFzc1N0cikge1xuICAgICAgICByZXR1cm4gJzx0YWJsZT4nICsgXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhmZWF0dXJlKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IFxuICAgICAgICAgICAgICAgICAgICBhcnJheSA9PT0gdW5kZWZpbmVkIHx8IGFycmF5LmluZGV4T2Yoa2V5KSA+PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+XG4gICAgICAgICAgICAgICAgICAgIGA8dHI+PHRkICR7Y2xhc3NTdHJ9PiR7a2V5fTwvdGQ+PHRkPiR7ZmVhdHVyZVtrZXldfTwvdGQ+PC90cj5gKVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKSArIFxuICAgICAgICAgICAgJzwvdGFibGU+JztcbiAgICAgICAgfVxuXG4gICAgaWYgKGZlYXR1cmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBDYWxsZWQgYmVmb3JlIHRoZSB1c2VyIGhhcyBzZWxlY3RlZCBhbnl0aGluZ1xuICAgICAgICBmZWF0dXJlID0ge307XG4gICAgICAgIHNvdXJjZURhdGEudGV4dENvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG4gICAgICAgIHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG4gICAgICAgIHNvdXJjZURhdGEuYm9yaW5nQ29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcblxuICAgIH0gZWxzZSBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvbHlnb24nKSB7IC8vIFRPRE8gY2hlY2sgdGhhdCB0aGlzIGlzIGEgYmxvY2sgbG9va3VwIGNob3JvcGxldGhcbiAgICAgICAgZmVhdHVyZSA9IHNvdXJjZURhdGEuZ2V0Um93Rm9yQmxvY2soZmVhdHVyZS5ibG9ja19pZCwgZmVhdHVyZS5jZW5zdXNfeXIpOyAgICAgICAgXG4gICAgfVxuXG5cblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmZWF0dXJlcycpLmlubmVySFRNTCA9IFxuICAgICAgICAnPGg0PkNsaWNrIGEgZmllbGQgdG8gdmlzdWFsaXNlIHdpdGggY29sb3VyPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS50ZXh0Q29sdW1ucywgJ2NsYXNzPVwiZW51bS1maWVsZFwiJykgKyBcbiAgICAgICAgJzxoND5DbGljayBhIGZpZWxkIHRvIHZpc3VhbGlzZSB3aXRoIHNpemU8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLCAnY2xhc3M9XCJudW1lcmljLWZpZWxkXCInKSArIFxuICAgICAgICAnPGg0Pk90aGVyIGZpZWxkczwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEuYm9yaW5nQ29sdW1ucywgJycpO1xuXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZmVhdHVyZXMgdGQnKS5mb3JFYWNoKHRkID0+IFxuICAgICAgICB0ZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgbWFwdmlzLnNldFZpc0NvbHVtbihlLnRhcmdldC5pbm5lclRleHQpIDsgLy8gVE9ETyBoaWdobGlnaHQgdGhlIHNlbGVjdGVkIHJvd1xuICAgICAgICB9KSk7XG59XG5cbnZhciBsYXN0RmVhdHVyZTtcblxuXG5mdW5jdGlvbiBjaG9vc2VEYXRhc2V0KCkge1xuXG4gICAgLy8ga25vd24gQ0xVRSBibG9jayBkYXRhc2V0cyB0aGF0IHdvcmsgb2tcbiAgICB2YXIgY2x1ZUNob2ljZXMgPSBbXG4gICAgICAgICdiMzZqLWtpeTQnLCAvLyBlbXBsb3ltZW50XG4gICAgICAgICcyMzRxLWdnODMnLCAvLyBmbG9vciBzcGFjZSBieSB1c2UgYnkgYmxvY2tcbiAgICAgICAgJ2MzZ3QtaHJ6NicgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMgLS0gdGhpcyBvbmUgaXMgY29tcGxldGUsIHRoZSBvdGhlcnMgaGF2ZSBnYXBweSBkYXRhIGZvciBjb25maWRlbnRpYWxpdHlcbiAgICBdOyBcblxuXG4gICAgLy8ga25vd24gcG9pbnQgZGF0YXNldHMgdGhhdCB3b3JrIG9rXG4gICAgdmFyIHBvaW50Q2hvaWNlcyA9IFtcbiAgICAgICAgJ2ZwMzgtd2l5eScsIC8vIHRyZWVzXG4gICAgICAgICd5Z2F3LTZyenEnLCAvLyBwZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnNcbiAgICAgICAgJzg0YmYtZGloaScsIC8vIFZlbnVlcyBmb3IgZXZlbnRzXG4gICAgICAgICd0ZHZoLW45ZHYnLCAvLyBMaXZlIGJpa2Ugc2hhcmVcbiAgICAgICAgJ2doN3MtcWRhOCcsIC8vIERBTVxuICAgICAgICAnc2ZyZy16eWdiJywgLy8gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4gICAgICAgICdldzZrLWNoejQnLCAvLyBCaW8gQmxpdHogMjAxNlxuICAgICAgICAnN3ZyZC00YXY1JywgLy8gd2F5ZmluZGluZ1xuICAgICAgICAnc3M3OS12NTU4JywgLy8gYnVzIHN0b3BzXG4gICAgICAgICdtZmZpLW05eW4nLCAvLyBwdWJzXG4gICAgICAgICdzdnV4LWJhZGEnLCAvLyBzb2lsIHRleHR1cmVzIC0gbmljZSBvbmVcbiAgICAgICAgJ3Fqd2MtZjVzaCcsIC8vIGNvbW11bml0eSBmb29kIGd1aWRlIC0gZ29vZFxuICAgICAgICAnZnRoaS16YWp5JywgLy8gcHJvcGVydGllcyBvdmVyICQyLjVtXG4gICAgICAgICd0eDhoLTJqZ2knLCAvLyBhY2Nlc3NpYmxlIHRvaWxldHNcbiAgICAgICAgJzZ1NXotdWJ2aCcsIC8vIGJpY3ljbGUgcGFya2luZ1xuICAgICAgICAvL2JzN24tNXZlaCwgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMuIDEwMCwwMDAgcm93cywgdG9vIGZyYWdpbGUuXG4gICAgICAgIF07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbiBoMScpLmlubmVySFRNTCA9ICdMb2FkaW5nIHJhbmRvbSBkYXRhc2V0Li4uJztcbiAgICByZXR1cm4gcG9pbnRDaG9pY2VzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIHBvaW50Q2hvaWNlcy5sZW5ndGgpXTtcbiAgICAvL3JldHVybiAnYzNndC1ocno2Jztcbn1cblxuZnVuY3Rpb24gc2hvd0NhcHRpb24obmFtZSwgZGF0YUlkLCBjYXB0aW9uKSB7XG4gICAgbGV0IGluY2x1ZGVObyA9IGZhbHNlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uIGgxJykuaW5uZXJIVE1MID0gKGluY2x1ZGVObyA/IChfZGF0YXNldE5vIHx8ICcnKTonJykgKyAoY2FwdGlvbiB8fCBuYW1lIHx8ICcnKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZm9vdGVyIC5kYXRhc2V0JykuaW5uZXJIVE1MID0gbmFtZSB8fCAnJztcbiAgICBcbiAgICAvLyBUT0RPIHJlaW5zdGF0ZSBmb3Igbm9uLWRlbW8gbW9kZS5cbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb3VyY2UnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2QvJyArIGRhdGFJZCk7XG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hhcmUnKS5pbm5lckhUTUwgPSBgU2hhcmUgdGhpczogPGEgaHJlZj1cImh0dHBzOi8vY2l0eS1vZi1tZWxib3VybmUuZ2l0aHViLmlvL0RhdGEzRC8jJHtkYXRhSWR9XCI+aHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH08L2E+YDsgICAgXG4gXG4gfVxuXG4gZnVuY3Rpb24gdHdlYWtQbGFjZUxhYmVscyhtYXAsIHVwKSB7XG4gICAgWydwbGFjZS1zdWJ1cmInLCAncGxhY2UtbmVpZ2hib3VyaG9vZCddLmZvckVhY2gobGF5ZXJJZCA9PiB7XG5cbiAgICAgICAgLy9yZ2IoMjI3LCA0LCA4MCk7IENvTSBwb3AgbWFnZW50YVxuICAgICAgICAvL21hcC5zZXRQYWludFByb3BlcnR5KGxheWVySWQsICd0ZXh0LWNvbG9yJywgdXAgPyAncmdiKDIyNyw0LDgwKScgOiAnaHNsKDAsMCwzMCUpJyk7IC8vIENvTSBwb3AgbWFnZW50YVxuICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllcklkLCAndGV4dC1jb2xvcicsIHVwID8gJ3JnYigwLDE4Myw3OSknIDogJ2hzbCgwLDAsMzAlKScpOyAvLyBDb00gcG9wIGdyZWVuXG4gICAgICAgIFxuICAgIH0pO1xuIH1cblxuIGZ1bmN0aW9uIHR3ZWFrQmFzZW1hcChtYXApIHtcbiAgICB2YXIgcGxhY2Vjb2xvciA9ICcjODg4JzsgLy8ncmdiKDIwNiwgMjE5LCAxNzUpJztcbiAgICB2YXIgcm9hZGNvbG9yID0gJyM3NzcnOyAvLydyZ2IoMjQwLCAxOTEsIDE1NiknO1xuICAgIG1hcC5nZXRTdHlsZSgpLmxheWVycy5mb3JFYWNoKGxheWVyID0+IHtcbiAgICAgICAgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDYwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgMjAlKScpO1xuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA3MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDUwJSknKTtcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNzglKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA0NSUpJyk7IC8vIHJvYWRzIG1vc3RseVxuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA5MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDUwJSknKTtcbiAgICB9KTtcbiAgICBbJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJywgJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJywgJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJ10uZm9yRWFjaChpZCA9PiB7XG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGlkLCAndGV4dC1jb2xvcicsICcjMzMzJyk7XG4gICAgfSk7XG5cbiAgICBtYXAucmVtb3ZlTGF5ZXIoJ3BsYWNlLWNpdHktbGctcycpOyAvLyByZW1vdmUgdGhlIE1lbGJvdXJuZSBsYWJlbCBpdHNlbGYuXG5cbn1cblxuLypcbiAgUmVmcmVzaCB0aGUgbWFwIHZpZXcgZm9yIHRoaXMgbmV3IGRhdGFzZXQuXG4qL1xuZnVuY3Rpb24gc2hvd0RhdGFzZXQobWFwLCBkYXRhc2V0LCBmaWx0ZXIsIGNhcHRpb24sIG5vRmVhdHVyZUluZm8sIG9wdGlvbnMsIGludmlzaWJsZSkge1xuICAgIFxuICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgIGlmIChpbnZpc2libGUpIHtcbiAgICAgICAgb3B0aW9ucy5pbnZpc2libGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgY2FwdGlvbik7XG4gICAgfVxuXG4gICAgbGV0IG1hcHZpcyA9IG5ldyBNYXBWaXMobWFwLCBkYXRhc2V0LCBmaWx0ZXIsICFub0ZlYXR1cmVJbmZvPyBzaG93RmVhdHVyZVRhYmxlIDogbnVsbCwgb3B0aW9ucyk7XG5cbiAgICBzaG93RmVhdHVyZVRhYmxlKHVuZGVmaW5lZCwgZGF0YXNldCwgbWFwdmlzKTsgXG4gICAgcmV0dXJuIG1hcHZpcztcbn1cblxuZnVuY3Rpb24gYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpIHtcbiAgICBpZiAoIW1hcC5nZXRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlKSkge1xuICAgICAgICBtYXAuYWRkU291cmNlKGRhdGFzZXQubWFwYm94LnNvdXJjZSwge1xuICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsXG4gICAgICAgICAgICB1cmw6IGRhdGFzZXQubWFwYm94LnNvdXJjZVxuICAgICAgICB9KTtcbiAgICB9XG59XG4vKlxuICBTaG93IGEgZGF0YXNldCB0aGF0IGFscmVhZHkgZXhpc3RzIG9uIE1hcGJveFxuKi9cbmZ1bmN0aW9uIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCwgaW52aXNpYmxlKSB7XG4gICAgYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpO1xuICAgIGxldCBzdHlsZSA9IG1hcC5nZXRMYXllcihkYXRhc2V0Lm1hcGJveC5pZCk7XG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICAvL2lmIChpbnZpc2libGUpXG4gICAgICAgICAgICAvL2RhdGFzZXQubWFwYm94XG4gICAgICAgIHN0eWxlID0gY2xvbmUoZGF0YXNldC5tYXBib3gpO1xuICAgICAgICBpZiAoaW52aXNpYmxlKSB7XG4gICAgICAgICAgICBnZXRPcGFjaXR5UHJvcHMoc3R5bGUpLmZvckVhY2gocHJvcCA9PiBzdHlsZS5wYWludFtwcm9wXSA9IDApO1xuICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICAgICAgbWFwLmFkZExheWVyKHN0eWxlKTtcbiAgICB9IGVsc2UgaWYgKCFpbnZpc2libGUpe1xuICAgICAgICBnZXRPcGFjaXR5UHJvcHMoc3R5bGUpLmZvckVhY2gocHJvcCA9PlxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoZGF0YXNldC5tYXBib3guaWQsIHByb3AsIGRlZihkYXRhc2V0Lm9wYWNpdHksMC45KSkpO1xuICAgIH1cbiAgICBkYXRhc2V0Ll9sYXllcklkID0gZGF0YXNldC5tYXBib3guaWQ7XG5cbiAgICAvL2lmICghaW52aXNpYmxlKSBcbiAgICAgICAgLy8gc3VyZWx5IHRoaXMgaXMgYW4gZXJyb3IgLSBtYXBib3ggZGF0YXNldHMgZG9uJ3QgaGF2ZSAnZGF0YUlkJ1xuICAgICAgICAvL3Nob3dDYXB0aW9uKGRhdGFzZXQubmFtZSwgZGF0YXNldC5kYXRhSWQsIGRhdGFzZXQuY2FwdGlvbik7XG59XG5cbmZ1bmN0aW9uIHByZWxvYWREYXRhc2V0KG1hcCwgZCkge1xuICAgIGNvbnNvbGUubG9nKCdQcmVsb2FkOiAnICsgZC5jYXB0aW9uKTtcbiAgICBpZiAoZC5tYXBib3gpIHtcblxuICAgICAgICBzaG93TWFwYm94RGF0YXNldChtYXAsIGQsIHRydWUpO1xuICAgIH0gZWxzZSBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgIGQubWFwdmlzID0gc2hvd0RhdGFzZXQobWFwLCBkLmRhdGFzZXQsIGQuZmlsdGVyLCBkLmNhcHRpb24sIHRydWUsIGQub3B0aW9ucywgIHRydWUpO1xuICAgICAgICBkLm1hcHZpcy5zZXRWaXNDb2x1bW4oZC5jb2x1bW4pO1xuICAgICAgICBkLl9sYXllcklkID0gZC5tYXB2aXMubGF5ZXJJZDtcbiAgICB9XG59XG4vLyBUdXJuIGludmlzaWJsZSBkYXRhc2V0IGludG8gdmlzaWJsZVxuZnVuY3Rpb24gcmV2ZWFsRGF0YXNldChtYXAsIGQpIHtcbiAgICBjb25zb2xlLmxvZygnUmV2ZWFsOiAnICsgZC5jYXB0aW9uICArIGAgKCR7X2RhdGFzZXROb30pYCk7XG4gICAgLy8gVE9ETyBjaGFuZ2UgMC45IHRvIHNvbWV0aGluZyBzcGVjaWZpYyBmb3IgZWFjaCB0eXBlXG4gICAgaWYgKGQubWFwYm94IHx8IGQuZGF0YXNldCkge1xuICAgICAgICBnZXRPcGFjaXR5UHJvcHMobWFwLmdldExheWVyKGQuX2xheWVySWQpKS5mb3JFYWNoKHByb3AgPT5cbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGQuX2xheWVySWQsIHByb3AsIGRlZihkLm9wYWNpdHksIDAuOSkpKTtcbiAgICB9IGVsc2UgaWYgKGQucGFpbnQpIHtcbiAgICAgICAgZC5fb2xkUGFpbnQgPSBbXTtcbiAgICAgICAgZC5wYWludC5mb3JFYWNoKHBhaW50ID0+IHtcbiAgICAgICAgICAgIGQuX29sZFBhaW50LnB1c2goW3BhaW50WzBdLCBwYWludFsxXSwgbWFwLmdldFBhaW50UHJvcGVydHkocGFpbnRbMF0sIHBhaW50WzFdKV0pO1xuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkocGFpbnRbMF0sIHBhaW50WzFdLCBwYWludFsyXSk7XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgIHNob3dDYXB0aW9uKGQuZGF0YXNldC5uYW1lLCBkLmRhdGFzZXQuZGF0YUlkLCBkLmNhcHRpb24pO1xuICAgIH0gZWxzZSAgaWYgKGQuY2FwdGlvbikge1xuICAgICAgICBzaG93Q2FwdGlvbihkLm5hbWUsIHVuZGVmaW5lZCwgZC5jYXB0aW9uKTtcbiAgICB9XG4gICAgaWYgKGQuc3VwZXJDYXB0aW9uKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbicpLmNsYXNzTGlzdC5hZGQoJ3N1cGVyY2FwdGlvbicpO1xufVxuLy8gUmVtb3ZlIHRoZSBkYXRhc2V0IGZyb20gdGhlIG1hcCwgbGlrZSBpdCB3YXMgbmV2ZXIgbG9hZGVkLlxuZnVuY3Rpb24gcmVtb3ZlRGF0YXNldChtYXAsIGQpIHtcbiAgICBjb25zb2xlLmxvZygnUmVtb3ZlOiAnICsgZC5jYXB0aW9uICArIGAgKCR7X2RhdGFzZXROb30pYCk7XG4gICAgaWYgKGQubWFwdmlzKVxuICAgICAgICBkLm1hcHZpcy5yZW1vdmUoKTtcbiAgICBcbiAgICBpZiAoZC5tYXBib3gpXG4gICAgICAgIG1hcC5yZW1vdmVMYXllcihkLm1hcGJveC5pZCk7XG5cbiAgICBpZiAoZC5wYWludCAmJiAhZC5rZWVwUGFpbnQpIC8vIHJlc3RvcmUgcGFpbnQgc2V0dGluZ3MgYmVmb3JlIHRoZXkgd2VyZSBtZXNzZWQgdXBcbiAgICAgICAgZC5fb2xkUGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0sIHBhaW50WzJdKTtcbiAgICAgICAgfSk7XG5cbiAgICBpZiAoZC5zdXBlckNhcHRpb24pXG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uJykuY2xhc3NMaXN0LnJlbW92ZSgnc3VwZXJjYXB0aW9uJyk7XG5cbiAgICBkLl9sYXllcklkID0gdW5kZWZpbmVkO1xufVxuXG5cblxubGV0IF9kYXRhc2V0Tm89Jyc7XG4vKiBBZHZhbmNlIGFuZCBkaXNwbGF5IHRoZSBuZXh0IGRhdGFzZXQgaW4gb3VyIGxvb3AgXG5FYWNoIGRhdGFzZXQgaXMgcHJlLWxvYWRlZCBieSBiZWluZyBcInNob3duXCIgaW52aXNpYmxlIChvcGFjaXR5IDApLCB0aGVuIFwicmV2ZWFsZWRcIiBhdCB0aGUgcmlnaHQgdGltZS5cblxuICAgIC8vIFRPRE8gY2xlYW4gdGhpcyB1cCBzbyByZWxhdGlvbnNoaXAgYmV0d2VlbiBcIm5vd1wiIGFuZCBcIm5leHRcIiBpcyBjbGVhcmVyLCBubyByZXBldGl0aW9uLlxuXG4qL1xuZnVuY3Rpb24gbmV4dERhdGFzZXQobWFwLCBkYXRhc2V0Tm8sIHJlbW92ZUZpcnN0KSB7XG4gICAgLy8gSW52aXNpYmx5IGxvYWQgZGF0YXNldCBpbnRvIHRoZSBtYXAuXG4gICAgZnVuY3Rpb24gZGVsYXkoZiwgbXMpIHtcbiAgICAgICAgd2luZG93LnNldFRpbWVvdXQoKCkgPT4gIXdpbmRvdy5zdG9wcGVkICYmIGYoKSwgbXMpO1xuICAgIH1cblxuICAgIF9kYXRhc2V0Tm8gPSBkYXRhc2V0Tm87XG4gICAgbGV0IGQgPSBkYXRhc2V0c1tkYXRhc2V0Tm9dLCBcbiAgICAgICAgbmV4dEQgPSBkYXRhc2V0c1soZGF0YXNldE5vICsgMSkgJSBkYXRhc2V0cy5sZW5ndGhdO1xuXG4gICAgaWYgKHJlbW92ZUZpcnN0KVxuICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbKGRhdGFzZXRObyAtIDEgKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoXSk7XG5cbiAgICAvLyBpZiBmb3Igc29tZSByZWFzb24gdGhpcyBkYXRhc2V0IGhhc24ndCBhbHJlYWR5IGJlZW4gbG9hZGVkLlxuICAgIGlmICghZC5fbGF5ZXJJZCkge1xuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGQpO1xuICAgIH1cbiAgICBpZiAoZC5fbGF5ZXJJZCAmJiAhbWFwLmdldExheWVyKGQuX2xheWVySWQpKVxuICAgICAgICB0aHJvdyAnSGVscDogTGF5ZXIgbm90IGxvYWRlZDogJyArIGQuX2xheWVySWQ7XG4gICAgcmV2ZWFsRGF0YXNldChtYXAsIGQpO1xuICAgICAgICBcblxuICAgIC8vIGxvYWQsIGJ1dCBkb24ndCBzaG93LCBuZXh0IG9uZS4gLy8gQ29tbWVudCBvdXQgdGhlIG5leHQgbGluZSB0byBub3QgZG8gdGhlIHByZS1sb2FkaW5nIHRoaW5nLlxuICAgIC8vIHdlIHdhbnQgdG8gc2tpcCBcImRhdGFzZXRzXCIgdGhhdCBhcmUganVzdCBjYXB0aW9ucyBldGMuXG4gICAgbGV0IG5leHRSZWFsRGF0YXNldE5vID0gKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoO1xuICAgIHdoaWxlIChkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10gJiYgIWRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXS5kYXRhc2V0ICYmICFkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10ubWFwYm94ICYmIG5leHRSZWFsRGF0YXNldE5vIDwgZGF0YXNldHMubGVuZ3RoKVxuICAgICAgICBuZXh0UmVhbERhdGFzZXRObyArKztcbiAgICBpZiAoZGF0YXNldHNbbmV4dFJlYWxEYXRhc2V0Tm9dKVxuICAgICAgICBwcmVsb2FkRGF0YXNldChtYXAsIGRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXSk7XG5cbiAgICBpZiAoZC5zaG93TGVnZW5kKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmRzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFdlJ3JlIGFpbWluZyB0byBhcnJpdmUgYXQgdGhlIHZpZXdwb2ludCAxLzMgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgYXBwZWFyYW5jZVxuICAgIC8vIGFuZCBsZWF2ZSAyLzMgb2YgdGhlIHdheSB0aHJvdWdoLlxuICAgIGlmIChkLmZseVRvICYmICFtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgICBkLmZseVRvLmR1cmF0aW9uID0gZC5kZWxheS8zOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgbWFwLmZseVRvKGQuZmx5VG8sIHsgc291cmNlOiAnbmV4dERhdGFzZXQnfSk7XG4gICAgfVxuICAgIFxuICAgIGlmIChuZXh0RC5mbHlUbykge1xuICAgICAgICAvLyBnb3QgdG8gYmUgY2FyZWZ1bCBpZiB0aGUgZGF0YSBvdmVycmlkZXMgdGhpcyxcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkZWYobmV4dEQuZmx5VG8uZHVyYXRpb24sIGQuZGVsYXkvMyArIG5leHRELmRlbGF5LzMpOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgZGVsYXkoKCkgPT4gbWFwLmZseVRvKG5leHRELmZseVRvLCB7IHNvdXJjZTogJ25leHREYXRhc2V0J30pLCBkLmRlbGF5ICogMi8zKTtcbiAgICB9XG5cbiAgICBkZWxheSgoKSA9PiByZW1vdmVEYXRhc2V0KG1hcCwgZCksIGQuZGVsYXkgKyBkZWYoZC5saW5nZXIsIDApKTsgLy8gb3B0aW9uYWwgXCJsaW5nZXJcIiB0aW1lIGFsbG93cyBvdmVybGFwLiBOb3QgZ2VuZXJhbGx5IG5lZWRlZCBzaW5jZSB3ZSBpbXBsZW1lbnRlZCBwcmVsb2FkaW5nLlxuICAgIFxuICAgIGRlbGF5KCgpID0+IG5leHREYXRhc2V0KG1hcCwgKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoKSwgZC5kZWxheSApO1xufVxuXG5mdW5jdGlvbiBsaXN0ZW5Gb3JLZXlzdHJva2VzKG1hcCwgb3B0aW9ucykge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKS5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZT0+IHtcbiAgICAgICAgLy9jb25zb2xlLmxvZyhlLmtleUNvZGUpO1xuICAgICAgICAvLyAsIGFuZCAuIHN0b3AgdGhlIGFuaW1hdGlvbiBhbmQgYWR2YW5jZSBmb3J3YXJkL2JhY2tcbiAgICAgICAgaWYgKFsxOTAsIDE4OF0uaW5kZXhPZihlLmtleUNvZGUpID4gLTEgJiYgb3B0aW9ucy5kZW1vTW9kZSkge1xuICAgICAgICAgICAgbWFwLnN0b3AoKTtcbiAgICAgICAgICAgIHdpbmRvdy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHJlbW92ZURhdGFzZXQobWFwLCBkYXRhc2V0c1tfZGF0YXNldE5vXSk7XG4gICAgICAgICAgICBuZXh0RGF0YXNldChtYXAsIChfZGF0YXNldE5vICsgezE5MDogMSwgMTg4OiAtMX1bZS5rZXlDb2RlXSArIGRhdGFzZXRzLmxlbmd0aCkgJSBkYXRhc2V0cy5sZW5ndGgpO1xuICAgICAgICB9IGVsc2UgaWYgKGUua2V5Q29kZSA9PT0gMzIgJiYgb3B0aW9ucy5kZW1vTW9kZSkge1xuICAgICAgICAgICAgLy8gU3BhY2UgPSBzdGFydC9zdG9wXG4gICAgICAgICAgICB3aW5kb3cuc3RvcHBlZCA9ICF3aW5kb3cuc3RvcHBlZDtcbiAgICAgICAgICAgIGlmICh3aW5kb3cuc3RvcHBlZClcbiAgICAgICAgICAgICAgICBtYXAuc3RvcCgpO1xuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVtb3ZlRGF0YXNldChtYXAsIGRhdGFzZXRzW19kYXRhc2V0Tm9dKTtcbiAgICAgICAgICAgICAgICBuZXh0RGF0YXNldChtYXAsIF9kYXRhc2V0Tm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHNldHVwTWFwKG9wdGlvbnMpIHtcbiAgICBsZXQgbWFwID0gbmV3IG1hcGJveGdsLk1hcCh7XG4gICAgICAgIGNvbnRhaW5lcjogJ21hcCcsXG4gICAgICAgIC8vc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjknLFxuICAgICAgICBzdHlsZTogJ21hcGJveDovL3N0eWxlcy9jaXR5b2ZtZWxib3VybmUvY2l6OTgzbHFvMDAxdzJzczJlb3U0OWVvcz9mcmVzaD01JyxcbiAgICAgICAgY2VudGVyOiBbMTQ0Ljk1LCAtMzcuODEzXSxcbiAgICAgICAgem9vbTogMTMsLy8xM1xuICAgICAgICBwaXRjaDogNDUsIC8vIFRPRE8gcmV2ZXJ0IGZvciBmbGF0XG4gICAgICAgIGF0dHJpYnV0aW9uQ29udHJvbDogZmFsc2VcbiAgICB9KTtcbiAgICBtYXAuYWRkQ29udHJvbChuZXcgbWFwYm94Z2wuQXR0cmlidXRpb25Db250cm9sKHtjb21wYWN0OnRydWV9KSwgJ3RvcC1yaWdodCcpO1xuICAgIC8vbWFwLm9uY2UoJ2xvYWQnLCAoKSA9PiB0d2Vha0Jhc2VtYXAobWFwKSk7XG4gICAgLy9tYXAub25jZSgnbG9hZCcsKCkgPT4gdHdlYWtQbGFjZUxhYmVscyhtYXAsdHJ1ZSkpO1xuICAgIC8vc2V0VGltZW91dCgoKT0+dHdlYWtQbGFjZUxhYmVscyhtYXAsIGZhbHNlKSwgODAwMCk7XG4gICAgXG4gICAgbWFwLm9uKCdtb3ZlZW5kJywgKGUsZGF0YSk9PiB7XG4gICAgICAgIGlmIChlLnNvdXJjZSA9PT0gJ25leHREYXRhc2V0JylcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgLy8gV2hlbiB3ZSBtYW51YWxseSBwb3NpdGlvbiB0aGUgbWFwLCBkdW1wIHRoZSBsb2NhdGlvbiB0byBjb25zb2xlIC0gbWFrZXMgaXQgZWFzeSB0byBjcmVhdGUgdG91cnMuXG4gICAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgICAgIGNlbnRlcjogbWFwLmdldENlbnRlcigpLFxuICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIGJlYXJpbmc6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICBwaXRjaDogbWFwLmdldFBpdGNoKClcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgbWFwLm9uKCdlcnJvcicsIGUgPT4ge1xuICAgICAgICAvLyBIaWRlIHRob3NlIGFubm95aW5nIG5vbi1lcnJvciBlcnJvcnNcbiAgICAgICAgaWYgKGUgJiYgZS5lcnJvciAhPT0gJ0Vycm9yOiBOb3QgRm91bmQnKVxuICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICB9KTtcbiAgICBsaXN0ZW5Gb3JLZXlzdHJva2VzKG1hcCwgb3B0aW9ucyk7XG4gICAgaWYgKG9wdGlvbnMuc3BpbilcbiAgICAgICAgc3BpbihtYXApO1xuICAgIHJldHVybiBtYXA7XG59XG5cbi8qIFByZSBkb3dubG9hZCBhbGwgbm9uLW1hcGJveCBkYXRhc2V0cyBpbiB0aGUgbG9vcCAqL1xuLy8gYWxzbyBnZXQgcmlkIG9mIHRoZSBzaWRlYmFyLiA6KVxuZnVuY3Rpb24gbG9hZERhdGFzZXRzKG1hcCkge1xuICAgIC8vIGlmIHdlIGRpZCB0aGlzIGFmdGVyIHRoZSBtYXAgd2FzIGxvYWRpbmcsIGNhbGwgbWFwLnJlc2l6ZSgpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgICAgICBcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgLy8gRm9yIHBlb3BsZSB3aG8gd2FudCB0aGUgXCJzY3JpcHRcIi4gICAgICAgIFxuICAgIHdpbmRvdy5jYXB0aW9ucyA9IGRhdGFzZXRzLm1hcChkID0+IGAke2QuY2FwdGlvbn0gKCR7ZC5kZWxheSAvIDEwMDB9cylgKS5qb2luKCdcXG4nKTtcblxuXG4gICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgLmFsbChkYXRhc2V0cy5tYXAoZCA9PiB7IFxuICAgICAgICAgICAgaWYgKGQuZGF0YXNldCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkaW5nIGRhdGFzZXQgJyArIGQuZGF0YXNldC5kYXRhSWQpO1xuICAgICAgICAgICAgICAgIHJldHVybiBkLmRhdGFzZXQubG9hZCgpO1xuICAgICAgICAgICAgfSBlbHNlXG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9KSkudGhlbigoKSA9PiBkYXRhc2V0c1swXS5kYXRhc2V0KTtcbn1cblxuZnVuY3Rpb24gbG9hZE9uZURhdGFzZXQoZGF0YXNldCkge1xuICAgIHJldHVybiBuZXcgU291cmNlRGF0YShkYXRhc2V0KS5sb2FkKCk7XG4gICAgLyppZiAoZGF0YXNldC5tYXRjaCgvLi4uLi0uLi4uLykpXG4gICAgICAgIFxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTsqL1xufVxuXG4vKlxuXG5VUkwgc3RydWN0dXJlczpcblxuLyAgICAgICAgICAgICAgICAgICBwaWNrIGEgcmFuZG9tIGRhdGFzZXRcbi8jZGVtbyAgICAgICAgICAgICAgbm9uLWludGVyYWN0aXZlIG1vZGUsIHJ1biBhIHdob2xlIHNob3djYXNlXG4vI2FiY2QtMTIzNCAgICAgICAgIGxvYWQgYSBwYXJ0aWN1bGFyIHNvY3JhdGEgSURcbi8jc250aG9zdW50YWhlb2V1dCAgbG9hZCBhIE1hcGJveCB0aWxlc2V0IElEXG4vIy4uLi4mbG9nb1xuLyMuLi4uJnNwaW5cblxuXG4qL1xuLy8gbGlzdCB0aWxlc2V0czogc2suZXlKMUlqb2ljM1JsZG1GblpTSXNJbUVpT2lKamFYcDRjV3A0Ylhnd01YcHFNekp4Y1hjNWVtRmhZakY1SW4wLjFpbnFjWk5KdS1aNFBRbFVUUS1HUndcbi8vIGh0dHBzOi8vYXBpLm1hcGJveC5jb20vdGlsZXNldHMvdjEvc3RldmFnZT9hY2Nlc3NfdG9rZW49c2suZXlKMUlqb2ljM1JsZG1GblpTSXNJbUVpT2lKamFYcDRjV3A0Ylhnd01YcHFNekp4Y1hjNWVtRmhZakY1SW4wLjFpbnFjWk5KdS1aNFBRbFVUUS1HUndcbmZ1bmN0aW9uIHBhcnNlVXJsKCkge1xuICAgIGZ1bmN0aW9uIGdldFJlZ2V4UGFydChoYXNoLCByZWdleCwgcGFydCkge1xuICAgICAgICByZXR1cm4gZGVmKGhhc2gubWF0Y2gocmVnZXgpLCBbXSlbcGFydCArIDFdO1xuICAgIH1cbiAgICBsZXQgb3B0aW9ucyA9IHt9O1xuICAgIGxldCBoYXNoID0gd2luZG93LmxvY2F0aW9uLmhhc2g7XG4gICAgaWYgKGhhc2gubWF0Y2goJyNkZW1vJykpIHtcbiAgICAgICAgb3B0aW9ucy5kZW1vTW9kZSA9IHRydWU7XG4gICAgICAgIG9wdGlvbnMuc3RhcnQgPSBkZWYoZ2V0UmVnZXhQYXJ0KGhhc2gsIC8mc3RhcnQ9KFxcZCspLywgMCksIDApO1xuICAgICAgICBjb25zb2xlLmxvZyhvcHRpb25zLnN0YXJ0KTtcbiAgICAgICAgXG4gICAgfSBlbHNlIGlmIChoYXNoKSB7XG4gICAgICAgIC8vICMjIyByZXBsYWNlIHdpdGggbW9yZSBzZWxlY3RpdmUgUkVcbiAgICAgICAgb3B0aW9ucy5kYXRhc2V0ID0gZGVmKGhhc2gubWF0Y2goLyMoW2EtekEtWjAtOV17NH0tW2EtekEtWjAtOV17NH0pLyksIFtdKVsxXTtcbiAgICAgICAgb3B0aW9ucy5zcGluID0gLyZzcGluLy50ZXN0KGhhc2gpO1xuICAgICAgICAvKm9wdGlvbnMubWFwYm94SWQgPSBkZWYoaGFzaC5tYXRjaCgvKG1hcGJveDpcXC9cXC9bYS16QS1aMC05XStcXC5bYS16QS1aMC05XSspLCBbXSlbMV07XG4gICAgICAgIGlmIChvcHRpb25zLm1hcGJveElkKSB7XG4gICAgICAgICAgICBvcHRpb25zLm1hcGJveERhdGFzZXQgPSB7XG4gICAgICAgICAgICAgICAgaWQ6ICdtYXBib3gtcG9pbnRzJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgICAgICBzb3VyY2U6IG9wdGlvbnMubWFwYm94XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSovXG4gICAgfVxuICAgIHJldHVybiBvcHRpb25zO1xufVxuXG4oZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgdHJ5IHsgZG9jdW1lbnQuZG9jdW1lbnRFbGVtZW50LnJlcXVlc3RGdWxsc2NyZWVuKCk7IH0gY2F0Y2ggKGUpIHsgfSAvLyBwcm9iYWJseSBkb2VzIG5vdGhpbmcuXG5cbiAgICBsZXQgcCwgb3B0aW9ucyA9IHBhcnNlVXJsKCk7XG4gICAgaWYgKG9wdGlvbnMuZGVtb01vZGUpIHtcbiAgICAgICAgcCA9IGxvYWREYXRhc2V0cyhtYXApO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGlmICghb3B0aW9ucy5kYXRhc2V0KVxuICAgICAgICAgICAgb3B0aW9ucy5kYXRhc2V0ID0gY2hvb3NlRGF0YXNldCgpO1xuICAgICAgICBwID0gbG9hZE9uZURhdGFzZXQob3B0aW9ucy5kYXRhc2V0KTtcbiAgICB9XG4gICAgbGV0IG1hcCA9IHNldHVwTWFwKG9wdGlvbnMpO1xuICAgIHAudGhlbihkYXRhc2V0ID0+IHtcbiAgICAgICAgd2luZG93LnNjcm9sbFRvKDAsMSk7IC8vIGRvZXMgdGhpcyBoaWRlIHRoZSBhZGRyZXNzIGJhcj8gTm9wZSAgICBcbiAgICAgICAgaWYgKGRhdGFzZXQpIFxuICAgICAgICAgICAgc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCk7XG5cbiAgICAgICAgd2hlbk1hcExvYWRlZChtYXAsICgpID0+IHtcblxuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGVtb01vZGUpIHtcbiAgICAgICAgICAgICAgICAvLyBzdGFydCB0aGUgY3ljbGUgb2YgZGF0YXNldHMgKDAgPSBmaXJzdCBkYXRhc2V0KVxuICAgICAgICAgICAgICAgIG5leHREYXRhc2V0KG1hcCwgb3B0aW9ucy5zdGFydCk7IFxuICAgICAgICAgICAgICAgIC8vdmFyIGZwID0gbmV3IEZsaWdodFBhdGgobWFwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0RhdGFzZXQobWFwLCBkYXRhc2V0KTsgLy8ganVzdCBzaG93IG9uZSBkYXRhc2V0LlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xvYWRpbmcnKS5vdXRlckhUTUw9Jyc7XG4gICAgICAgIH0pO1xuICAgICAgICBcblxuICAgIH0pO1xufSkoKTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG4vKlxuU3VnZ2VzdGlvbnM6XG5cblRoaXMgaXMgTWVsYm91cm5lXG5IZXJlIGFyZSBvdXIgcHJlY2luY3RzXG5BcyB5b3UnZCBndWVzcywgd2UgaGF2ZSBhIGxvdCBvZiBkYXRhOlxuLSBhZGRyZXNzZXMsIGJvdW5kYXJpZXNcblxuXG4xLiBPcmllbnQgd2l0aCBwcmVjaW5jdHNcblxuMi4gQnV0IHdlIGFsc28gaGF2ZTogXG4tIHdlZGRpbmdcbi0gYmluIG5pZ2h0c1xuLSBkb2dzIGxhc3QgXG4tIHRvaWxldHNcbi0tIGFsbFxuLS0gd2hlZWxjaGFpcnMgd2l0aCBpY29uc1xuXG4qL1xuXG5cblxuXG5cbi8qXG5JbnRyb1xuLSBPdmVydmlldyAoc3VidXJiIG5hbWVzIGhpZ2hsaWdodGVkKVxuLSBQcm9wZXJ0eSBib3VuZGFyaWVzXG4tIFN0cmVldCBhZGRyZXNzZXNcblxuVXJiYW4gZm9yZXN0OlxuLSBlbG1zXG4tIGd1bXNcbi0gcGxhbmVzXG4tIGFsbFxuXG5DTFVFXG4tIGVtcGxveW1lbnRcbi0gdHJhbnNwb3J0IHNlY3RvclxuLSBzb2NpYWwvaGVhbHRoIHNlY3RvclxuXG5EQU1cbi0gYXBwbGljYXRpb25zXG4tIGNvbnN0cnVjdGlvblxuLSBjb21wbGV0ZWRcblxuRGlkIHlvdSBrbm93OlxuLSBjb21tdW5pdHkgZm9vZFxuLSBHYXJiYWdlIENvbGxlY3Rpb24gWm9uZXNcbi0gQm9va2FibGUgRXZlbnQgVmVudWVzXG4tLSB3ZWRkaW5nYWJsZVxuLS0gYWxsXG4tIFRvaWxldHNcbi0tIGFsbCBcbi0tIGFjY2Vzc2libGVcbi0gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4tIERvZyB3YWxraW5nIHpvbmVzXG5cbkZpbmFsZTpcbi0gU2t5bGluZVxuLSBXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhP1xuXG5cbkdhcmJhZ2UgQ29sbGVjdGlvbiBab25lc1xuRG9nIFdhbGtpbmcgWm9uZXMgb2ZmLWxlYXNoXG5CaWtlIFNoYXJlIFN0YXRpb25zXG5Cb29rYWJsZSBFdmVudCBWZW51ZXNcbi0gd2VkZGluZ2FibGVcblxuXG5HcmFuZCBmaW5hbGUgXCJXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhXCI/XG4tIGJ1aWxkaW5nc1xuLSBjYWZlc1xuLSBcblxuXG5cblRoZXNlIG5lZWQgYSBob21lOlxuLSBiaWtlIHNoYXJlIHN0YXRpb25zXG4tIHBlZGVzdHJpYW4gc2Vuc29yc1xuLSBhZGRyZXNzZXNcbi0gcHJvcGVydHkgYm91bmRhcmllc1xuLSBidWlsZGluZ3Ncbi0gY2FmZXNcbi0gY29tbXVuaXR5IGZvb2RcblxuXG5cbiovXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbkRhdGFzZXQgcnVuIG9yZGVyXG4tIGJ1aWxkaW5ncyAoM0QpXG4tIHRyZWVzIChmcm9tIG15IG9wZW50cmVlcyBhY2NvdW50KVxuLSBjYWZlcyAoY2l0eSBvZiBtZWxib3VybmUsIHN0eWxlZCB3aXRoIGNvZmZlZSBzeW1ib2wpXG4tIGJhcnMgKHNpbWlsYXIpXG4tIGdhcmJhZ2UgY29sbGVjdGlvbiB6b25lc1xuLSBkb2cgd2Fsa2luZyB6b25lc1xuLSBDTFVFICgzRCBibG9ja3MpXG4tLSBidXNpbmVzcyBlc3RhYmxpc2htZW50cyBwZXIgYmxvY2tcbi0tLSB2YXJpb3VzIHR5cGVzLCB0aGVuIHRvdGFsXG4tLSBlbXBsb3ltZW50ICh2YXJpb3VzIHR5cGVzIHdpdGggc3BlY2lmaWMgdmFudGFnZSBwb2ludHMgLSBiZXdhcmUgdGhhdCBub3QgYWxsIGRhdGEgaW5jbHVkZWQ7IHRoZW4gdG90YWwpXG4tLSBmbG9vciB1c2UgKGRpdHRvKVxuXG5cblxuXG5NaW5pbXVtXG4tIGZsb2F0eSBjYW1lcmFzXG4tIGNsdWUgM0QsXG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcblxuSGVhZGVyOlxuLSBkYXRhc2V0IG5hbWVcbi0gY29sdW1uIG5hbWVcblxuRm9vdGVyOiBkYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1XG5cbkNvTSBsb2dvXG5cblxuTWVkaXVtXG4tIE11bmljaXBhbGl0eSBib3VuZGFyeSBvdmVybGFpZFxuXG5TdHJldGNoIGdvYWxzXG4tIG92ZXJsYXkgYSB0ZXh0IGxhYmVsIG9uIGEgYnVpbGRpbmcvY2x1ZWJsb2NrIChlZywgRnJlZW1hc29ucyBIb3NwaXRhbCAtIHRvIHNob3cgd2h5IHNvIG11Y2ggaGVhbHRoY2FyZSlcblxuXG5cblxuXG4qL1xuXG5cbmNvbnN0IENvTSA9IHtcbiAgICBibHVlOiAncmdiKDAsMTc0LDIwMyknLFxuICAgIG1hZ2VudGE6J3JnYigyMjcsIDQsIDgwKScsXG4gICAgZ3JlZW46ICdyZ2IoMCwxODMsNzkpJ1xufTtcbkNvTS5lbnVtQ29sb3JzID0gW0NvTS5ibHVlLCBDb00ubWFnZW50YSwgQ29NLmdyZWVuXTtcblxuaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gJy4vc291cmNlRGF0YSc7XG5cbmV4cG9ydCBjb25zdCBkYXRhc2V0cyA9IFtcbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J01lbGJvdXJuZSBoYXMgYSBsb3Qgb2YgZGF0YSwgcmVhZHkgZm9yIHlvdSB0byBhY2Nlc3MgYW5kIHVzZSB0aHJvdWdoIG91ciBPcGVuIERhdGEgUGxhdGZvcm0uJyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OjgwMDAsXG4gICAgICAgIGNhcHRpb246J1RoaXMgaXMgTWVsYm91cm5lJyxcbiAgICAgICAgcGFpbnQ6IFtcbiAgICAgICAgICAgIFsncGxhY2Utc3VidXJiJywgJ3RleHQtY29sb3InLCAncmdiKDAsMTgzLDc5KSddLFxuICAgICAgICAgICAgWydwbGFjZS1uZWlnaGJvdXJob29kJywgJ3RleHQtY29sb3InLCAncmdiKDAsMTgzLDc5KSddXG4gICAgICAgIF0sXG4gICAgICAgIG5hbWU6ICcnLFxuICAgICAgICBmbHlUbzoge2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sem9vbToxMyxwaXRjaDo0NSxiZWFyaW5nOjB9XG5cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAsXG4gICAgICAgIG5hbWU6ICdQcm9wZXJ0eSBib3VuZGFyaWVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1dlIGhhdmUgZGF0YSBhYm91dCBwcm9wZXJ0eSBib3VuZGFyaWVzIHRoYXQgd2UgdXNlIGZvciBwbGFubmluZycsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzLTEnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgbGluZ2VyOjEwMDAsIC8vIGp1c3QgdG8gYXZvaWQgZmxhc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuICAgIC8vIHJlcGVhdCAtIGp1c3QgdG8gZm9yY2UgdGhlIHRpbWluZ1xuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBsaW5nZXI6MzAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2UgaGF2ZSBkYXRhIGFib3V0IHByb3BlcnR5IGJvdW5kYXJpZXMgdGhhdCB3ZSB1c2UgZm9yIHBsYW5uaW5nJyxcbiAgICAgICAgb3BhY2l0eToxLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcy0yJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGp1c3QgcmVwZWF0IHByZXZpb3VzIHZpZXcuXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTQwMDAsXG4gICAgICAgIG5hbWU6ICdTdHJlZXQgYWRkcmVzc2VzJyxcbiAgICAgICAgY2FwdGlvbjogJ0FuZCBkYXRhIGFib3V0IGV2ZXJ5IHN0cmVldCBhZGRyZXNzLicsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWRkcmVzc2VzJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnU3RyZWV0X2FkZHJlc3Nlcy05N2U1b24nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7c3RyZWV0X25vfScsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IDEwLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBuZWFyIHVuaS1pc2hcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDAxNzM2NDI2MDY4LFwibGF0XCI6LTM3Ljc5NzcwNzk4ODYwMTIzfSxcInpvb21cIjoxOCxcImJlYXJpbmdcIjotNDUuNzAyMDMwNDA1MDYwODQsXCJwaXRjaFwiOjQ4LCBkdXJhdGlvbjoxNDAwMH1cbiAgICAgICAgLy8gcm91bmRhYm91dCBvZiBkZWF0aCBsb29rbmcgbndcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTEwNDg3MDYxMTg0LFwibGF0XCI6LTM3LjgwMDYxMDg4OTcxNzMyfSxcInpvb21cIjoxOC41NzIyMDQ3ODI4MTkxOTUsXCJiZWFyaW5nXCI6LTIwLjQzNTYzNjY5MTY0MzgyMixcInBpdGNoXCI6NTcuOTk5OTk5OTk5OTk5OTl9XG4gICAgfSxcblxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBoZWFsdGggYW5kIHR5cGUgb2YgZWFjaCB0cmVlIGluIG91ciB1cmJhbiBmb3Jlc3QnLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuNlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnVWxtdXMnIF1cblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzY3NDE1NDE4MjY2LFwibGF0XCI6LTM3Ljc5MTY4NjYxOTc3Mjk3NX0sXCJ6b29tXCI6MTUuNDg3MzM3NDU3MzU2NjkxLFwiYmVhcmluZ1wiOi0xMjIuNDAwMDAwMDAwMDAwMDksXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sKi9cbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J1VyYmFuIEZvcmVzdCcsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdPdXIgdXJiYW4gZm9yZXN0IGRhdGEgY29udGFpbnMgZXZlcnkgZWxtIHRyZWUuLi4nLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1VsbXVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjMxMzgsXCJsYXRcIjotMzcuNzg4ODQzfSxcInpvb21cIjoxNS4yLFwiYmVhcmluZ1wiOi0xMDYuMTQsXCJwaXRjaFwiOjU1fVxuXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBjYXB0aW9uOiAnLi4uZXZlcnkgZ3VtIHRyZWUuLi4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ3VtdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ0V1Y2FseXB0dXMnLCAnQ29yeW1iaWEnLCAnQW5nb3Bob3JhJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljg0NzM3NDg4Njg5MDcsXCJsYXRcIjotMzcuODExNzc5NzQwNzg3MjQ0fSxcInpvb21cIjoxMy4xNjI1MjQxNTA4NDczMTUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoyMDAsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQyNzMyNTY3MzMzMSxcImxhdFwiOi0zNy43ODQ0NDk0MDU5MzAzOH0sXCJ6b29tXCI6MTQuNSxcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDgwMDAsXG4gICAgICAgIC8vZGF0YXNldExlYWQ6IDMwMDAsXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgZXZlcnkgcGxhbmUgdHJlZS4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAncGxhbmV0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdQbGF0YW51cycgXVxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDM5NDYzMzgzODk2NSxcImxhdFwiOi0zNy43OTU4ODg3MDY2ODI3MX0sXCJ6b29tXCI6MTUuOTA1MTMwMzYxNDQ2NjY4LFwiYmVhcmluZ1wiOjE1Ny41OTk5OTk5OTk5OTc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTUzLFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjM5NH0sXCJ6b29tXCI6MTUsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTQ3ODUxMDAxNjIwMixcImxhdFwiOi0zNy43ODQzNDE0NzE2NzQ3N30sXCJ6b29tXCI6MTMuOTIyMjI4NDYxNzkzNjY5LFwiYmVhcmluZ1wiOjEyMi45OTQ3ODM0NjA0MzQ2LFwicGl0Y2hcIjo0Ny41MDAwMDAwMDAwMDAwM31cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1MzQzNDUwNzU1MTYsXCJsYXRcIjotMzcuODAxMzQxMTgwMTI1MjJ9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjE1MS4wMDA3MzA0ODgyNzMzOCxcInBpdGNoXCI6NTguOTk5OTk5OTk5OTk5OTl9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTYxMzg4NDg4NDA5LFwibGF0XCI6LTM3LjgwOTAyNzEwNTMxNjMyfSxcInpvb21cIjoxNC4yNDE3NTcwMzA4MTY2MzYsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ05lYXJseSA3MCwwMDAgdHJlZXMgaW4gYWxsLicsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQxOTExNTcwMDAwMzQsXCJsYXRcIjotMzcuODAwMzY3MDkyMTQwMjJ9LFwiem9vbVwiOjE0LjEsXCJiZWFyaW5nXCI6MTQ0LjkyNzI4MzkyNzQyNjk0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MTQ3LjY1MjE5MzgyMzczMTA3LFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidDZW5zdXMgb2YgTGFuZCBVc2UgYW5kIEVtcGxveW1lbnQgKENMVUUpJyxcbiAgICAgICAgc3VwZXJDYXB0aW9uOiB0cnVlLFxuICAgICAgICBwYWludDpbXSxcbiAgICAgICAgbmFtZTonJ1xuICAgIH0sXG5cbiAgICBcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RvdGFsIGVtcGxveW1lbnQgaW4gYmxvY2snICxcbiAgICAgICAgY2FwdGlvbjogJ0NMVUUgcmV2ZWFscyBvdXIgZW1wbG95bWVudCBob3Qgc3BvdHMuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU3LFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjQ5NH0sXCJ6b29tXCI6MTMuODg2Mjg3MzIwMTU5ODEsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTg1MzM0NTYyMTQsXCJsYXRcIjotMzcuODM1ODE5MTYyNDM2NjF9LFwiem9vbVwiOjEzLjY0OTExNjYxNDg3MjgzNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICB9LFxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OjEyMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hlcmUgdGhlIENvdW5jaWxcXCdzIHNpZ25pZmljYW50IHByb3BlcnR5IGhvbGRpbmdzIGFyZSBsb2NhdGVkLicsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdmdGhpLXphanknKSxcbiAgICAgICAgY29sdW1uOiAnT3duZXJzaGlwIG9yIENvbnRyb2wnLFxuICAgICAgICBzaG93TGVnZW5kOiB0cnVlLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzkwMzA4NzIzODQ2LFwibGF0XCI6LTM3LjgxODYzMTY2MDgxMDQyNX0sXCJ6b29tXCI6MTMuNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cblxuICAgIH0sXG4gICAgKi9cbiAgICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnVHJhbnNwb3J0LCBQb3N0YWwgYW5kIFN0b3JhZ2UnICxcbiAgICAgICAgY2FwdGlvbjogJy4uLndoZXJlIHRoZSB0cmFuc3BvcnQsIHBvc3RhbCBhbmQgc3RvcmFnZSBzZWN0b3IgaXMgbG9jYXRlZC4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNzY4MTc2NzEwNzEyLFwibGF0XCI6LTM3LjgyOTIxODI0ODU4NzI0Nn0sXCJ6b29tXCI6MTIuNzI4NDMxMjE3OTE0OTE5LFwiYmVhcmluZ1wiOjY4LjcwMzg4MzEyMTg3NDU4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgXG4gICAgICAgIGNvbHVtbjogJ0hlYWx0aCBDYXJlIGFuZCBTb2NpYWwgQXNzaXN0YW5jZScgLFxuICAgICAgICBjYXB0aW9uOiAnYW5kIHdoZXJlIHRoZSBoZWFsdGhjYXJlIGFuZCBzb2NpYWwgYXNzaXN0YW5jZSBvcmdhbmlzYXRpb25zIGFyZSBiYXNlZC4nLFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU3MjMzMTEyMTg1MyxcImxhdFwiOi0zNy44MjcwNjM3NDc2MzgyNH0sXCJ6b29tXCI6MTMuMDYzNzU3Mzg2MjMyMjQyLFwiYmVhcmluZ1wiOjI2LjM3NDc4NjkxODUyMzM0LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonRGV2ZWxvcG1lbnQgQWN0aXZpdHkgTW9uaXRvciAoREFNKScsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDcwMDAsIFxuICAgICAgICBsaW5nZXI6OTAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ0RBTSB0cmFja3MgbWFqb3IgcHJvamVjdHMgaW4gdGhlIHBsYW5uaW5nIHN0YWdlLi4uJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA0MDAwLFxuICAgICAgICBsaW5nZXI6NTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCAgICAgICAgIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdVTkRFUiBDT05TVFJVQ1RJT04nIF0sIFxuICAgICAgICBjYXB0aW9uOiAnLi4ucHJvamVjdHMgdW5kZXIgY29uc3RydWN0aW9uJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogNTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQ09NUExFVEVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLmFuZCB0aG9zZSBhbHJlYWR5IGNvbXBsZXRlZC4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuLy8qKioqKioqKioqKioqKioqKioqKiogIFwiQnV0IGRpZCB5b3Uga25vd1wiIGRhdGFcbiAgICB7XG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnQnV0IGRpZCB5b3Uga25vdyB3ZSBoYXZlIGRhdGEgYWJvdXQgaGVhbHRoeSwgYWZmb3JkYWJsZSBmb29kIHNlcnZpY2VzPycsXG4gICAgICAgIG5hbWU6ICdDb21tdW5pdHkgZm9vZCBzZXJ2aWNlcyB3aXRoIG9wZW5pbmcgaG91cnMsIHB1YmxpYyB0cmFuc3BvcnQgYW5kIHBhcmtpbmcgb3B0aW9ucycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdmb29kJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjd4dmswazNsJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQ29tbXVuaXR5X2Zvb2Rfc2VydmljZXNfd2l0aF8tYTdjajl2JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAnaHNsKDMwLCA4MCUsIDU2JSknIC8vIGJyaWdodCBvcmFuZ2VcbiAgICAgICAgICAgICAgICAvLyd0ZXh0LWNvbG9yJzogJ3JnYigyNDksIDI0MywgMTc4KScsIC8vIG11dGVkIG9yYW5nZSwgYSBjaXR5IGZvciBwZW9wbGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7TmFtZX0nLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMixcblxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvL3NvdXRoIE1lbGJvdXJuZSBpc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Njg0NDUwNzY2MzU0MixcImxhdFwiOi0zNy44MjQ1OTk0OTEwMzI0NH0sXCJ6b29tXCI6MTQuMDE2OTc5ODY0NDgyMjMzLFwiYmVhcmluZ1wiOi0xMS41NzgzMzYxNjYxNDI4ODgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTc0NzM3MzA5NDQ0NjYsXCJsYXRcIjotMzcuODA0OTA3MTU1OTUxM30sXCJ6b29tXCI6MTUuMzQ4Njc2MDk5OTIyODUyLFwiYmVhcmluZ1wiOi0xNTQuNDk3MTMzMzI4OTcwMSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ5MjI1MTQzODMwNyxcImxhdFwiOi0zNy44MDMxMDk3MjcyNzI4MX0sXCJ6b29tXCI6MTUuMzU4NTA5Nzg5NzkwODA4LFwiYmVhcmluZ1wiOi03OC4zOTk5OTk5OTk5OTk3LFwicGl0Y2hcIjo1OC41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICBcblxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MSxcbiAgICAgICAgbmFtZTogJ0dhcmJhZ2UgY29sbGVjdGlvbiB6b25lcycsXG4gICAgICAgIGNhcHRpb246ICdXaGljaCBuaWdodCBpcyBiaW4gbmlnaHQ/JyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2dhcmJhZ2UtMScsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOGFycXdtaHInLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdHYXJiYWdlX2NvbGxlY3Rpb25fem9uZXMtOW55dHNrJyxcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICdsaW5lLWpvaW4nOiAncm91bmQnLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAnaHNsKDIzLCA5NCUsIDY0JSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCA2XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMTBdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwMCxcbiAgICAgICAgLy8gRmF3a25lciBQYXJraXNoXG4gICAgICAgIGZseVRvOiB7Y2VudGVyOiB7IGxuZzoxNDQuOTY1NDM3LCBsYXQ6LTM3LjgxNDIyNX0sIHpvb206IDEzLjcsYmVhcmluZzotMzAuOCwgcGl0Y2g6NjB9XG4gICAgICAgIC8vIGJpcmRzIGV5ZSwgem9vbWVkIG91dFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjEzLGJlYXJpbmc6MCxwaXRjaDowfSxcbiAgICB9LFxuXG5cblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBuYW1lOiAnR2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1doaWNoIG5pZ2h0IGlzIGJpbiBuaWdodD8nLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ2FyYmFnZS0yJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3J1Yl9kYXl9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAxOF0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDIwXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICAvLyBiaXJkcyBleWVcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxNCxiZWFyaW5nOjAscGl0Y2g6MCwgZHVyYXRpb246MTAwMDB9LFxuICAgIH0sXG5cblxuICAgIHsgXG4gICAgICAgIG5hbWU6ICdNZWxib3VybmUgQmlrZSBTaGFyZSBzdGF0aW9ucywgd2l0aCBjdXJyZW50IG51bWJlciBvZiBmcmVlIGFuZCB1c2VkIGRvY2tzIChldmVyeSAxNSBtaW51dGVzKScsXG4gICAgICAgIGNhcHRpb246ICdIb3cgbWFueSBiaWtlcyBhcmUgYXZhaWxhYmxlIGF0IGVhY2ggb2Ygb3VyIGJpa2Utc2hhcmUgc3RhdGlvbnMuJyxcbiAgICAgICAgY29sdW1uOiAnTkJCaWtlcycsXG4gICAgICAgIGRlbGF5OiAyMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSAsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdiaWN5Y2xlLXNoYXJlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLXNpemUnOiAyLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7TkJCaWtlc30nLFxuICAgICAgICAgICAgICAgICAgICAvLyd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1vZmZzZXQnOiBbMS41LDBdLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1zaXplJzoyMFxuICAgICAgICAgICAgICAgICAgICAvLyBmb3Igc29tZSByZWFzb24gaXQgZ2V0cyBzaWxlbnRseSByZWplY3RlZCB3aXRoIHRoaXM6XG4gICAgICAgICAgICAgICAgICAgIC8qJ2ljb24tc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnTkJCaWtlcycsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgWzMwLCAzXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOidoc2woMjM5LDcxJSw2NiUpJyAvLyBtYXRjaCB0aGUgYmx1ZSBiaWtlIGljb25zXG4gICAgICAgICAgICAgICAgICAgIC8vJ3RleHQtY29sb3InOiAncmdiKDAsMTc0LDIwMyknIC8vIENvTSBwb3AgYmx1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NzY4NDE0NTYyODg3LFwibGF0XCI6LTM3LjgxOTk4OTQ4MzcyODM5fSxcInpvb21cIjoxNC42NzAyMjE2NzYyMzg1MDcsXCJiZWFyaW5nXCI6LTU3LjkzMjMwMjUxNzM2MTE3LFwicGl0Y2hcIjo2MH1cbiAgICB9LCAvLyBiaWtlIHNoYXJlXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi4nLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnV0VERElORycsICdZJ10sXG4gICAgICAgIGNvbHVtbjogJ1dFRERJTkcnLFxuICAgICAgICBkZWxheTogNDAwMCxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MzYyNTU2NjkzMzYsXCJsYXRcIjotMzcuODEzOTYyNzEzMzQ0MzJ9LFwiem9vbVwiOjE0LjQwNTU5MTA5MTY3MTA1OCxcImJlYXJpbmdcIjotNjcuMTk5OTk5OTk5OTk5OTksXCJwaXRjaFwiOjU0LjAwMDAwMDAwMDAwMDAyfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi5vciBzb21ldGhpbmcgZWxzZS4nLFxuICAgICAgICBjb2x1bW46ICdXRURESU5HJyxcbiAgICAgICAgZGVsYXk6IDYwMDAsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTgwLFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi4nLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAndG9pbGV0LTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi50aGF0IGFyZSBhY2Nlc3NpYmxlIGZvciB3aGVlbGNoYWlyIHVzZXJzJyxcbiAgICAgICAgZmlsdGVyOiBbJz09Jywnd2hlZWxjaGFpcicsJ3llcyddLFxuICAgICAgICBkZWxheTogMSxcbiAgICAgICAgbGluZ2VyOjUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3doZWVsY2hhaXItMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLnRoYXQgYXJlIGFjY2Vzc2libGUgZm9yIHdoZWVsY2hhaXIgdXNlcnMnLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgLy9saW5nZXI6NTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgZmlsdGVyOiBbJyE9Jywnd2hlZWxjaGFpcicsJ3llcyddLFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd0b2lsZXQtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBcbiAgICAgICAgY2FwdGlvbjogJ091ciBkYXRhIHRlbGxzIHlvdSB3aGVyZSB5b3VyIGRvZyBjYW4gcm9hbSBmcmVlLicsXG4gICAgICAgIG5hbWU6ICdEb2cgV2Fsa2luZyBab25lcycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS5jbHphcDJqZScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0RvZ19XYWxraW5nX1pvbmVzLTNmaDlxNCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ2hzbCgzNDAsIDk3JSw2NSUpJywgLy9oc2woMzQwLCA5NyUsIDQ1JSlcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMC44XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbJz09JywgJ3N0YXR1cycsICdvZmZsZWFzaCddXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU3NDYwOTI1MjgwNjYsXCJsYXRcIjotMzcuNzk0NTA2OTc0Mjc0MjJ9LFwiem9vbVwiOjE0Ljk1NTU0NDkwMzE0NTU0NCxcImJlYXJpbmdcIjotNDQuODQxMzI3NDUxODM3MjgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY0NzIwODQxNjE1MjUsXCJsYXRcIjotMzcuNzk5NDc3NDcyNTc1ODR9LFwiem9vbVwiOjE0LjkzMzkzMTUyODAzNjA0OCxcImJlYXJpbmdcIjotNTcuNjQxMzI3NDUxODM3MDgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODYxMzk4NzczMjkzMixcImxhdFwiOi0zNy44Mzg4ODI2NjU5NjE4N30sXCJ6b29tXCI6MTUuMDk2NDE5NTc5NDMyODc4LFwiYmVhcmluZ1wiOi0zMCxcInBpdGNoXCI6NTcuNDk5OTk5OTk5OTk5OTl9XG4gICAgfSxcblxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGVyZVxcJ3MgZXZlbiBldmVyeSBjYWZlIGFuZCByZXN0YXVyYW50JyxcbiAgICAgICAgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdzZnJnLXp5Z2InKSxcbiAgICAgICAgLy8gQ0JEIGxvb2tpbmcgdG93YXJkcyBDYXJsdG9uXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjQyMDA5OTg5NzA0NSxcImxhdFwiOi0zNy44MDQwNzYyOTE2MjE2fSxcInpvb21cIjoxNS42OTU2NjIxMzYzMzk2NTMsXCJiZWFyaW5nXCI6LTIyLjU2OTcxODc2NTAwNjMxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwOTg3ODk5OTI5NjQsXCJsYXRcIjotMzcuODEwMjEzMTA0MDQ3NDl9LFwiem9vbVwiOjE2LjAyNzczMjMzMjAxNjk5LFwiYmVhcmluZ1wiOi0xMzUuMjE5NzUzMDg2NDE5ODEsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ2NhZmUtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAgXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBsaW5nZXI6MjYwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPGI+PGk+eW91PC9pPjwvYj4gZG8gd2l0aCBvdXIgZGF0YT88YnIvPkZpbmQgeW91ciBuZXh0IGRhdGFzZXQgYXQgZGF0YS5tZWxib3VybmUudmljLmdvdi5hdScsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIG9wYWNpdHk6MC4xLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFswLCAnaHNsKDE0NiwgNTAlLCAxMCUpJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMjAwLCAnaHNsKDE0NiwgMTAwJSwgNjAlKSddXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy8naHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcyNTEzNTAzMjc2NCxcImxhdFwiOi0zNy44MDc0MTUyMDkwNTEyODV9LFwiem9vbVwiOjE0Ljg5NjI1OTE1MzAxMjI0MyxcImJlYXJpbmdcIjotMTA2LjQwMDAwMDAwMDAwMDE1LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mcm9tIHNvdXRoXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDcwMTQwNzUzNDQ1LFwibGF0XCI6LTM3LjgxNTIwMDYyNzI2NjY2fSxcInpvb21cIjoxNS40NTg3ODQ5MzAyMzg2NzIsXCJiZWFyaW5nXCI6OTguMzk5OTk5OTk5OTk5ODgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC4zXV0sXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgZmx5VG86e2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sYmVhcmluZzowLHpvb206MTQscGl0Y2g6NDUsZHVyYXRpb246MjAwMDB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuNV0gXVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjZdIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPGI+PGk+eW91PC9pPjwvYj4gZG8gd2l0aCBvdXIgZGF0YT88YnIvPkZpbmQgeW91ciBuZXh0IGRhdGFzZXQgYXQgZGF0YS5tZWxib3VybmUudmljLmdvdi5hdScsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIC8vb3BhY2l0eTowLjYsXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuN10gXSxcbiAgICAgICAgLyptYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjYsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCovXG4gICAgICAgIC8vbWF0Y2hpbmcgc3RhcnRpbmcgcG9zaXRpb24/XG4gICAgICAgIGZseVRvOntjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LGJlYXJpbmc6MCx6b29tOjE0LHBpdGNoOjQ1LGR1cmF0aW9uOjIwMDAwfVxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcyNTEzNTAzMjc2NCxcImxhdFwiOi0zNy44MDc0MTUyMDkwNTEyODV9LFwiem9vbVwiOjE0Ljg5NjI1OTE1MzAxMjI0MyxcImJlYXJpbmdcIjotMTA2LjQwMDAwMDAwMDAwMDE1LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mcm9tIHNvdXRoXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDcwMTQwNzUzNDQ1LFwibGF0XCI6LTM3LjgxNTIwMDYyNzI2NjY2fSxcInpvb21cIjoxNS40NTg3ODQ5MzAyMzg2NzIsXCJiZWFyaW5nXCI6OTguMzk5OTk5OTk5OTk5ODgsXCJwaXRjaFwiOjYwfVxuICAgIH1cbl07XG4vKlxuY29uc3QgY3JhcHB5RmluYWxlID0gW1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBaZSBncmFuZGUgZmluYWxlXG4gICAge1xuICAgICAgICBkZWxheToxLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnc2ZyZy16eWdiJyksIC8vIGNhZmVzXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLXNpemUnOiAwLjVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoyMDAwMFxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoyMDAwMFxuICAgIH0sICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTEsIGxpbmdlcjoyMDAwMCxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICB9LFxuICAgIHsgLy8gcGVkZXN0cmlhbiBzZW5zb3JzXG4gICAgICAgIGRlbGF5OjEsbGluZ2VyOjIwMDAwLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgneWdhdy02cnpxJyksXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNjc4NTQ3NjE5NDUsXCJsYXRcIjotMzcuODAyMzY4OTYxMDY4OTh9LFwiem9vbVwiOjE1LjM4OTM5Mzg1MDcyNTczMixcImJlYXJpbmdcIjotMTQzLjU4NDQ2NzUxMjQ5NTQsXCJwaXRjaFwiOjYwfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgY2FwdGlvbjogJ1doYXQgd2lsbCA8dT55b3U8L3U+Jm5ic3A7IGRvIHdpdGggb3VyIGRhdGE/JyxcbiAgICAgICAgZGVsYXk6MjAwMDAsXG4gICAgICAgIGxpbmdlcjozMDAwMCxcbiAgICAgICAgb3BhY2l0eTowLjQsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICdoc2woMTQ2LCAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjksXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgIH0sXG5cbl07XG4qL1xuXG5jb25zdCB1bnVzZWQgPSBbXG57XG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnUGVkZXN0cmlhbiBzZW5zb3JzIGNvdW50IGZvb3QgdHJhZmZpYyBldmVyeSBob3VyJyxcbiAgICAgICAgbmFtZTogJ1BlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9ucycsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd5Z2F3LTZyenEnKSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM2Nzg1NDc2MTk0NSxcImxhdFwiOi0zNy44MDIzNjg5NjEwNjg5OH0sXCJ6b29tXCI6MTUuMzg5MzkzODUwNzI1NzMyLFwiYmVhcmluZ1wiOi0xNDMuNTg0NDY3NTEyNDk1NCxcInBpdGNoXCI6NjB9ICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBcbiAgICB9XG5dO1xuXG5cblxuXG5cbmV4cG9ydCBjb25zdCBkYXRhc2V0czIgPSBbXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUExJRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnTWFqb3IgZGV2ZWxvcG1lbnQgcHJvamVjdCBhcHBsaWNhdGlvbnMnLFxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUFJPVkVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIGFwcHJvdmVkJyBcbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIHVuZGVyIGNvbnN0cnVjdGlvbicgXG4gICAgfSwgXG4gICAgeyBkZWxheTogNTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3RkdmgtbjlkdicpIH0sIC8vIGJpa2Ugc2hhcmVcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0FjY29tbW9kYXRpb24nIH0sXG4gICAgeyBkZWxheTogMTAwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgY29sdW1uOiAnQXJ0cyBhbmQgUmVjcmVhdGlvbiBTZXJ2aWNlcycgfSxcbiAgICAvL3sgZGVsYXk6IDMwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnUmV0YWlsIFRyYWRlJyB9LFxuICAgIHsgZGVsYXk6IDkwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnQ29uc3RydWN0aW9uJyB9XG4gICAgLy97IGRlbGF5OiAxMDAwLCBkYXRhc2V0OiAnYjM2ai1raXk0JyB9LFxuICAgIC8veyBkZWxheTogMjAwMCwgZGF0YXNldDogJzIzNHEtZ2c4MycgfVxuXTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuaW1wb3J0IHsgbWVsYm91cm5lUm91dGUgfSBmcm9tICcuL21lbGJvdXJuZVJvdXRlJztcblxuLypcbkNvbnRpbnVvdXNseSBtb3ZlcyB0aGUgTWFwYm94IHZhbnRhZ2UgcG9pbnQgYXJvdW5kIGEgR2VvSlNPTi1kZWZpbmVkIHBhdGguXG4qL1xuXG5mdW5jdGlvbiB3aGVuTG9hZGVkKG1hcCwgZikge1xuICAgIGlmIChtYXAubG9hZGVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0FscmVhZHkgbG9hZGVkLicpO1xuICAgICAgICBmKCk7XG4gICAgfVxuICAgIGVsc2UgeyBcbiAgICAgICAgY29uc29sZS5sb2coJ1dhaXQgZm9yIGxvYWQnKTtcbiAgICAgICAgbWFwLm9uY2UoJ2xvYWQnLCBmKTtcbiAgICB9XG59XG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmZ1bmN0aW9uIHNwaW5Nb3JlKG1hcCkge1xuICAgIGNvbnN0IGxhcFRpbWUgPSA2MDsgLy8gdGltZSBpbiBzZWNvbmRzIGZvciBvbmUgY29tcGxldGUgcmV2b2x1dGlvbi4gU2xvdyBpcyBnb29kIVxuICAgIG1hcC5yb3RhdGVUbygobWFwLmdldEJlYXJpbmcoKSArIDQ1KSAlIDM2MCwge1xuICAgICAgICBlYXNpbmc6IHQgPT4gdCxcbiAgICAgICAgZHVyYXRpb246IGxhcFRpbWUgLyAoMzYwIC8gNDUpICogMTAwMFxuICAgIH0sIHsgc291cmNlOiAnc3BpbicgfSk7XG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNwaW4obWFwKSB7XG4gICAgc3Bpbk1vcmUobWFwKTtcblxuICAgIGlmICghbWFwLl9zcGlubmluZykge1xuICAgICAgICBtYXAuX3NwaW5uaW5nID0gdHJ1ZTsgLy8gb2sgaXQncyBoYWNreSBidXQgSSBzZXJpb3VzbHkgY291bGRuJ3QgdGhpbmsgb2YgYW5vdGhlciB3YXkgdG8gbWFrZSBzdXJlIHdlIG9ubHkgZG8gdGhpcyBvbmNlLlxuICAgICAgICBtYXAub24oJ21vdmVlbmQnLCBlID0+IHtcbiAgICAgICAgICAgIGlmIChlLnNvdXJjZSA9PT0gJ3NwaW4nKSB7XG4gICAgICAgICAgICAgICAgc3Bpbk1vcmUobWFwKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxufVxuXG5leHBvcnQgY2xhc3MgRmxpZ2h0UGF0aCB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXAsIHJvdXRlKSB7XG4gICAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMucm91dGUgPSBtZWxib3VybmVSb3V0ZTtcblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMC4wMTtcblxuICAgICAgICB0aGlzLnBvc05vID0gMDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IHRoaXMucm91dGUuZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKHtcbiAgICAgICAgICAgIGNlbnRlcjogZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgIHpvb206IGRlZihmZWF0dXJlLnByb3BlcnRpZXMuem9vbSwgMTQpLFxuICAgICAgICAgICAgYmVhcmluZzogZmVhdHVyZS5wcm9wZXJ0aWVzLmJlYXJpbmcsXG4gICAgICAgICAgICBwaXRjaDogZGVmKGZlYXR1cmUucHJvcGVydGllcy5waXRjaCwgNjApXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5iZWFyaW5nPTA7XG5cbiAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cblxuXG4gICAgLyp2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICB7IGNlbnRlcjogWzE0NC45NiwgLTM3LjhdLCB6b29tOiAxNSwgYmVhcmluZzogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OCwgLTM3Ljg0XSwgem9vbTogMTUsIGJlYXJpbmc6IDE2MCwgcGl0Y2g6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTk1LCAtMzcuODI1XSwgem9vbTogMTUsIGJlYXJpbmc6IC05MH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk3LCAtMzcuODJdLCB6b29tOiAxNSwgYmVhcmluZzogMTQwfVxuXG4gICAgXTsqL1xuXG4gICAgICAgIHRoaXMubW92ZUNhbWVyYSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbW92ZUNhbWVyYScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zaXRpb25zW3RoaXMucG9zTm9dO1xuICAgICAgICAgICAgcG9zLnNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIHBvcy5jdXJ2ZSA9IDAuNDg7IC8vMTtcbiAgICAgICAgICAgIHBvcy5lYXNpbmcgPSAodCkgPT4gdDsgLy8gbGluZWFyIGVhc2luZ1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmx5VG8nKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmZseVRvKHBvcywgeyBzb3VyY2U6ICdmbGlnaHRwYXRoJyB9KTtcblxuICAgICAgICAgICAgdGhpcy5wb3NObyA9ICh0aGlzLnBvc05vICsgMSkgJSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFwLnJvdGF0ZVRvKGJlYXJpbmcsIHsgZWFzaW5nOiBlYXNpbmcgfSk7XG4gICAgICAgICAgICAvL2JlYXJpbmcgKz0gNTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuIFxuICAgICAgICB0aGlzLm1hcC5vbignbW92ZWVuZCcsIChkYXRhKSA9PiB7IFxuICAgICAgICAgICAgaWYgKGRhdGEuc291cmNlID09PSAnZmxpZ2h0cGF0aCcpIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgVGhpcyBzZWVtZWQgdG8gYmUgdW5yZWxpYWJsZSAtIHdhc24ndCBhbHdheXMgZ2V0dGluZyB0aGUgbG9hZGVkIGV2ZW50LlxuICAgICAgICB3aGVuTG9hZGVkKHRoaXMubWFwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGVkLicpO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcC5qdW1wVG8odGhpcy5wb3NpdGlvbnNbMF0pO1xuICAgICAgICB0aGlzLnBvc05vICsrO1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgMCAvKnRoaXMucGF1c2VUaW1lKi8pO1xuXG4gICAgICAgIHRoaXMubWFwLm9uKCdjbGljaycsICgpID0+IHsgXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9ICAgIFxuXG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JhZGl1c0xlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgLy8gVE9ETyBwYWQgdGhlIHNtYWxsIGNpcmNsZSBzbyB0aGUgdGV4dCBzdGFydHMgYXQgdGhlIHNhbWUgWCBwb3NpdGlvbiBmb3IgYm90aFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDo2cHg7IHdpZHRoOiA2cHg7IGJvcmRlci1yYWRpdXM6IDNweFwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMjBweDsgYm9yZGVyLXJhZGl1czogMTBweFwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD5gO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoNDAsNDAsMjUwKVwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDozcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoMjAsMjAsNDApXCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPmA7IFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDYXRlZ29yeUxlZ2VuZChpZCwgY29sdW1uTmFtZSwgY29sb3JTdG9wcywgY2xvc2VIYW5kbGVyKSB7XG4gICAgbGV0IGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgK1xuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgY29sb3JTdG9wc1xuICAgICAgICAgICAgLnNvcnQoKHN0b3BhLCBzdG9wYikgPT4gc3RvcGFbMF0ubG9jYWxlQ29tcGFyZShzdG9wYlswXSkpIC8vIHNvcnQgb24gdmFsdWVzXG4gICAgICAgICAgICAubWFwKHN0b3AgPT4gYDxzcGFuIGNsYXNzPVwiYm94XCIgc3R5bGU9J2JhY2tncm91bmQ6ICR7c3RvcFsxXX0nPjwvc3Bhbj48bGFiZWw+JHtzdG9wWzBdfTwvbGFiZWw+PGJyLz5gKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgKiBhcyBsZWdlbmQgZnJvbSAnLi9sZWdlbmQnO1xuLypcbldyYXBzIGEgTWFwYm94IG1hcCB3aXRoIGRhdGEgdmlzIGNhcGFiaWxpdGllcyBsaWtlIGNpcmNsZSBzaXplIGFuZCBjb2xvciwgYW5kIHBvbHlnb24gaGVpZ2h0LlxuXG5zb3VyY2VEYXRhIGlzIGFuIG9iamVjdCB3aXRoOlxuLSBkYXRhSWRcbi0gbG9jYXRpb25Db2x1bW5cbi0gdGV4dENvbHVtbnNcbi0gbnVtZXJpY0NvbHVtbnNcbi0gcm93c1xuLSBzaGFwZVxuLSBtaW5zLCBtYXhzXG4qL1xuY29uc3QgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgdW5pcXVlID0gMDtcblxuZXhwb3J0IGNsYXNzIE1hcFZpcyB7XG4gICAgY29uc3RydWN0b3IobWFwLCBzb3VyY2VEYXRhLCBmaWx0ZXIsIGZlYXR1cmVIb3Zlckhvb2ssIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuc291cmNlRGF0YSA9IHNvdXJjZURhdGE7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB0aGlzLmZlYXR1cmVIb3Zlckhvb2sgPSBmZWF0dXJlSG92ZXJIb29rOyAvLyBmKHByb3BlcnRpZXMsIHNvdXJjZURhdGEpXG4gICAgICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjaXJjbGVSYWRpdXM6IGRlZihvcHRpb25zLmNpcmNsZVJhZGl1cywgMjApLFxuICAgICAgICAgICAgaW52aXNpYmxlOiBvcHRpb25zLmludmlzaWJsZSwgLy8gd2hldGhlciB0byBjcmVhdGUgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsIC8vIE1hcGJveCBzeW1ib2wgcHJvcGVydGllcywgbWVhbmluZyB3ZSBzaG93IHN5bWJvbCBpbnN0ZWFkIG9mIGNpcmNsZVxuICAgICAgICAgICAgZW51bUNvbG9yczogb3B0aW9ucy5lbnVtQ29sb3JzIC8vIG92ZXJyaWRlIGRlZmF1bHQgY29sb3IgY2hvaWNlc1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vdGhpcy5vcHRpb25zLmludmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBUT0RPIHNob3VsZCBiZSBwYXNzZWQgYSBMZWdlbmQgb2JqZWN0IG9mIHNvbWUga2luZC5cblxuICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5sYXllcklkID0gc291cmNlRGF0YS5zaGFwZSArICctJyArIHNvdXJjZURhdGEuZGF0YUlkICsgJy0nICsgKHVuaXF1ZSsrKTtcbiAgICAgICAgdGhpcy5sYXllcklkSGlnaGxpZ2h0ID0gdGhpcy5sYXllcklkICsgJy1oaWdobGlnaHQnO1xuXG5cbiAgICAgICAgXG4gICAgICAgIC8vIENvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIGEgTWFwYm94IGRhdGFzb3VyY2VcbiAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHBvaW50RGF0YXNldFRvR2VvSlNPTih0aGlzLnNvdXJjZURhdGEpICk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHN5bWJvbExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMub3B0aW9ucy5zeW1ib2wsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIC8vIHRyeSB1c2luZyBhIGNpcmNsZSBoaWdobGlnaHQgZXZlbiBvbiBhbiBpY29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBcblxuICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gY29uc3RydWN0IGEgXCJwb2x5Z29uIGRhdGFzb3VyY2VcIiwgdGhlIGdlb21ldHJ5IGV4aXN0cyBpbiBNYXBib3ggYWxyZWFkeVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L0Vjb25vbXkvRW1wbG95bWVudC1ieS1ibG9jay1ieS1pbmR1c3RyeS9iMzZqLWtpeTRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYWRkIENMVUUgYmxvY2tzIHBvbHlnb24gZGF0YXNldCwgcmlwZSBmb3IgY2hvcm9wbGV0aGluZ1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHsgXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2ZWN0b3InLCBcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnbWFwYm94Oi8vb3BlbmNvdW5jaWxkYXRhLmFlZGZteXA4J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihwb2x5Z29uTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG5cblxuXG4gICAgXG4gICAgICAgIC8vIHN3aXRjaCB2aXN1YWxpc2F0aW9uIHRvIHVzaW5nIHRoaXMgY29sdW1uXG4gICAgICAgIHRoaXMuc2V0VmlzQ29sdW1uID0gZnVuY3Rpb24oY29sdW1uTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdUaGlzIGlzIGEgc3ltYm9sIGxheWVyLCB3ZSBpZ25vcmUgc2V0VmlzQ29sdW1uLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2x1bW5OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID0gc291cmNlRGF0YS50ZXh0Q29sdW1uc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IGNvbHVtbk5hbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRGF0YSBjb2x1bW46ICcgKyB0aGlzLmRhdGFDb2x1bW4pO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBwb2x5Z29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gYWRkIGNsb3NlIGJ1dHRvbiBiZWhhdmlvdXIuIG1heWJlP1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlRGF0YS50ZXh0Q29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gaGFuZGxlIGVudW0gZmllbGRzIG9uIHBvbHlnb25zIChubyBleGFtcGxlIGN1cnJlbnRseSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIGxldCBtaW5TaXplID0gMC4zICogdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgIGxldCBtYXhTaXplID0gdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcblxuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtcmFkaXVzJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgbWluU2l6ZS8zXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCBtYXhTaXplLzNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemVdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemVdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93UmFkaXVzTGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IC8vIENhbid0IHNhZmVseSBjbG9zZSBudW1lcmljIGNvbHVtbnMgeWV0LiBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMzk0OVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlUmFkaXVzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1yYWRpdXMnLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLW51bWVyaWMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICAvLyBmcm9tIENvbG9yQnJld2VyXG4gICAgICAgICAgICBjb25zdCBlbnVtQ29sb3JzID0gZGVmKHRoaXMub3B0aW9ucy5lbnVtQ29sb3JzLCBbJyMxZjc4YjQnLCcjZmI5YTk5JywnI2IyZGY4YScsJyMzM2EwMmMnLCcjZTMxYTFjJywnI2ZkYmY2ZicsJyNhNmNlZTMnLCAnI2ZmN2YwMCcsJyNjYWIyZDYnLCcjNmEzZDlhJywnI2ZmZmY5OScsJyNiMTU5MjgnXSk7XG5cbiAgICAgICAgICAgIGxldCBlbnVtU3RvcHMgPSB0aGlzLnNvdXJjZURhdGEuc29ydGVkRnJlcXVlbmNpZXNbZGF0YUNvbHVtbl0ubWFwKCh2YWwsaSkgPT4gW3ZhbCwgZW51bUNvbG9yc1tpICUgZW51bUNvbG9ycy5sZW5ndGhdXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBlbnVtU3RvcHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVE9ETyB0ZXN0IGNsb3NlIGhhbmRsZXIsIGN1cnJlbnRseSBub24gZnVuY3Rpb25hbCBkdWUgdG8gcG9pbnRlci1ldmVudHM6bm9uZSBpbiBDU1NcbiAgICAgICAgICAgIGxlZ2VuZC5zaG93Q2F0ZWdvcnlMZWdlbmQoJyNsZWdlbmQtZW51bScsIGRhdGFDb2x1bW4sIGVudW1TdG9wcywgdGhpcy5yZW1vdmVDaXJjbGVDb2xvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1jb2xvcicsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLWNvbG9yJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1lbnVtJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG4gICAgICAgIC8qXG4gICAgICAgICAgICBBcHBsaWVzIGEgc3R5bGUgdGhhdCByZXByZXNlbnRzIG51bWVyaWMgZGF0YSB2YWx1ZXMgYXMgaGVpZ2h0cyBvZiBleHRydWRlZCBwb2x5Z29ucy5cbiAgICAgICAgICAgIFRPRE86IGFkZCByZW1vdmVQb2x5Z29uSGVpZ2h0XG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnLCAge1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyLCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0IGluIHRoZSBwb2x5Z29uIHNldCwgaXQncyBqdXN0IGEgaHVnZSB2YWx1ZSBsb29rdXBcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJywvL2xvY2F0aW9uQ29sdW1uLCAvLyB0aGUgSUQgb24gdGhlIGFjdHVhbCBnZW9tZXRyeSBkYXRhc2V0XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMTAwMF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24tY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgICAgIC8vLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAncmdiKDAsMCwnICsgTWF0aC5yb3VuZCg0MCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMjAwKSArICcpJ10pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ2hzbCgzNDAsODglLCcgKyBNYXRoLnJvdW5kKDIwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiA1MCkgKyAnJSknXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZCwgWychaW4nLCAnYmxvY2tfaWQnLCAuLi4oLyogIyMjIFRPRE8gZ2VuZXJhbGlzZSAqLyBcbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3dbZGF0YUNvbHVtbl0gPT09IDApXG4gICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pKV0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgdGhpcy5zb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdXNlbW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRoZSBhY3R1YWwgY29uc3RydWN0b3IuLi5cbiAgICAgICAgaWYgKHRoaXMuc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlID0gKGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBmID0gdGhpcy5tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGUucG9pbnQsIHsgbGF5ZXJzOiBbdGhpcy5sYXllcklkXX0pWzBdOyAgXG4gICAgICAgICAgICAgICAgaWYgKGYgJiYgZiAhPT0gdGhpcy5sYXN0RmVhdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IGY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmZWF0dXJlSG92ZXJIb29rKGYucHJvcGVydGllcywgdGhpcy5zb3VyY2VEYXRhLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sIGYucHJvcGVydGllc1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXSk7IC8vIHdlIGRvbid0IGhhdmUgYW55IG90aGVyIHJlbGlhYmxlIGtleT9cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCAnYmxvY2tfaWQnLCBmLnByb3BlcnRpZXMuYmxvY2tfaWRdKTsgLy8gZG9uJ3QgaGF2ZSBhIGdlbmVyYWwgd2F5IHRvIG1hdGNoIG90aGVyIGtpbmRzIG9mIHBvbHlnb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGYucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYXAub24oJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgfVxuICAgICAgICBcblxuXG5cbiAgICAgICAgXG5cbiAgICB9XG59XG5cbi8vIGNvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIEdlb0pTT05cbmZ1bmN0aW9uIHBvaW50RGF0YXNldFRvR2VvSlNPTihzb3VyY2VEYXRhKSB7XG4gICAgbGV0IGRhdGFzb3VyY2UgPSB7XG4gICAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIGZlYXR1cmVzOiBbXVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNvdXJjZURhdGEucm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSB7XG4gICAgICAgICAgICAgICAgZGF0YXNvdXJjZS5kYXRhLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHJvdyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7IC8vIEp1c3QgZG9uJ3QgcHVzaCBpdCBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWQgbG9jYXRpb246ICR7cm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dfWApOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFzb3VyY2U7XG59O1xuXG5mdW5jdGlvbiBjaXJjbGVMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgZmlsdGVyLCBoaWdobGlnaHQsIHNpemUsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgcGFpbnQ6IHtcbi8vICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdoc2woMjAsIDk1JSwgNTAlKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3JnYmEoMCwwLDAsMCknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOTUgOiAwLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjk1IDogMCxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3doaXRlJyA6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiB7XG4gICAgICAgICAgICAgICAgc3RvcHM6IGhpZ2hsaWdodCA/IFtcbiAgICAgICAgICAgICAgICAgICAgWzEwLHNpemUgKiAwLjRdLCBcbiAgICAgICAgICAgICAgICAgICAgWzE3LHNpemUgKiAxLjBdXG4gICAgICAgICAgICAgICAgXSA6IFtcbiAgICAgICAgICAgICAgICAgICAgWzEwLHNpemUgKiAwLjJdLCBcbiAgICAgICAgICAgICAgICAgICAgWzE3LHNpemUgKiAwLjVdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHN5bWJvbExheWVyKHNvdXJjZUlkLCBsYXllcklkLCBzeW1ib2wsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWRcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG5cbiAgICByZXQucGFpbnQgPSBkZWYoc3ltYm9sLnBhaW50LCB7fSk7XG4gICAgcmV0LnBhaW50WydpY29uLW9wYWNpdHknXSA9ICFpbnZpc2libGUgPyAwLjk1IDogMDtcblxuICAgIC8vcmV0LmxheW91dCA9IGRlZihzeW1ib2wubGF5b3V0LCB7fSk7XG4gICAgaWYgKHN5bWJvbC5sYXlvdXQpIHtcbiAgICAgICAgaWYgKHN5bWJvbC5sYXlvdXRbJ3RleHQtZmllbGQnXSAmJiBpbnZpc2libGUpXG4gICAgICAgICAgICByZXQucGFpbnRbJ3RleHQtb3BhY2l0eSddID0gMDtcbiAgICAgICAgcmV0LmxheW91dCA9IHN5bWJvbC5sYXlvdXQ7XG4gICAgfVxuXG5cblxuICAgIHJldHVybiByZXQ7XG59XG5cblxuIGZ1bmN0aW9uIHBvbHlnb25MYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgaW52aXNpYmxlKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC44IDogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0JzogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnIzAwMydcbiAgICAgICAgIH0sXG4gICAgfTtcbn1cbiBmdW5jdGlvbiBwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQsIGxheWVySWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ3doaXRlJ1xuICAgICAgICB9LFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnYmxvY2tfaWQnLCAnLSddXG4gICAgfTtcbn1cblxuIiwiZXhwb3J0IGNvbnN0IG1lbGJvdXJuZVJvdXRlID0ge1xuICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICBcImZlYXR1cmVzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDM1MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTYyODgyOTk1NjA1NDcsXG4gICAgICAgICAgLTM3LjgyMTcxNzY0NzgzOTY1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwiYmVhcmluZ1wiOiAyNzBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk3ODUwNDE4MDkwODIsXG4gICAgICAgICAgLTM3LjgwODM1OTkxNzQyMzU5NFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDE4MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTU1NTg3Mzg3MDg0OTYsXG4gICAgICAgICAgLTM3LjgwNTc4MzAyMTMxNDVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiA5MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTQ0MzQzNTY2ODk0NTMsXG4gICAgICAgICAgLTM3LjgxNjQ5Njg5MzcyMzA4XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG4gIF1cbn07IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1jb2xsZWN0aW9uLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBwcmVmaXggPSBcIiRcIjtcblxuZnVuY3Rpb24gTWFwKCkge31cblxuTWFwLnByb3RvdHlwZSA9IG1hcC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBNYXAsXG4gIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIChwcmVmaXggKyBrZXkpIGluIHRoaXM7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXNbcHJlZml4ICsga2V5XTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdGhpc1twcmVmaXggKyBrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHByb3BlcnR5ID0gcHJlZml4ICsga2V5O1xuICAgIHJldHVybiBwcm9wZXJ0eSBpbiB0aGlzICYmIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGtleXMucHVzaChwcm9wZXJ0eS5zbGljZSgxKSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH0sXG4gIHZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSB2YWx1ZXMucHVzaCh0aGlzW3Byb3BlcnR5XSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSxcbiAgZW50cmllczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZW50cmllcy5wdXNoKHtrZXk6IHByb3BlcnR5LnNsaWNlKDEpLCB2YWx1ZTogdGhpc1twcm9wZXJ0eV19KTtcbiAgICByZXR1cm4gZW50cmllcztcbiAgfSxcbiAgc2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSAwO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSArK3NpemU7XG4gICAgcmV0dXJuIHNpemU7XG4gIH0sXG4gIGVtcHR5OiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBlYWNoOiBmdW5jdGlvbihmKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGYodGhpc1twcm9wZXJ0eV0sIHByb3BlcnR5LnNsaWNlKDEpLCB0aGlzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWFwKG9iamVjdCwgZikge1xuICB2YXIgbWFwID0gbmV3IE1hcDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTWFwKSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IG1hcC5zZXQoa2V5LCB2YWx1ZSk7IH0pO1xuXG4gIC8vIEluZGV4IGFycmF5IGJ5IG51bWVyaWMgaW5kZXggb3Igc3BlY2lmaWVkIGtleSBmdW5jdGlvbi5cbiAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIG87XG5cbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChpLCBvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoZihvID0gb2JqZWN0W2ldLCBpLCBvYmplY3QpLCBvKTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgb2JqZWN0IHRvIG1hcC5cbiAgZWxzZSBpZiAob2JqZWN0KSBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSBtYXAuc2V0KGtleSwgb2JqZWN0W2tleV0pO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBuZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBrZXlzID0gW10sXG4gICAgICBzb3J0S2V5cyA9IFtdLFxuICAgICAgc29ydFZhbHVlcyxcbiAgICAgIHJvbGx1cCxcbiAgICAgIG5lc3Q7XG5cbiAgZnVuY3Rpb24gYXBwbHkoYXJyYXksIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkge1xuICAgIGlmIChkZXB0aCA+PSBrZXlzLmxlbmd0aCkgcmV0dXJuIHJvbGx1cCAhPSBudWxsXG4gICAgICAgID8gcm9sbHVwKGFycmF5KSA6IChzb3J0VmFsdWVzICE9IG51bGxcbiAgICAgICAgPyBhcnJheS5zb3J0KHNvcnRWYWx1ZXMpXG4gICAgICAgIDogYXJyYXkpO1xuXG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IGFycmF5Lmxlbmd0aCxcbiAgICAgICAga2V5ID0ga2V5c1tkZXB0aCsrXSxcbiAgICAgICAga2V5VmFsdWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB2YWx1ZXNCeUtleSA9IG1hcCgpLFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVJlc3VsdCgpO1xuXG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh2YWx1ZXMgPSB2YWx1ZXNCeUtleS5nZXQoa2V5VmFsdWUgPSBrZXkodmFsdWUgPSBhcnJheVtpXSkgKyBcIlwiKSkge1xuICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZXNCeUtleS5zZXQoa2V5VmFsdWUsIFt2YWx1ZV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlc0J5S2V5LmVhY2goZnVuY3Rpb24odmFsdWVzLCBrZXkpIHtcbiAgICAgIHNldFJlc3VsdChyZXN1bHQsIGtleSwgYXBwbHkodmFsdWVzLCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBlbnRyaWVzKG1hcCQkMSwgZGVwdGgpIHtcbiAgICBpZiAoKytkZXB0aCA+IGtleXMubGVuZ3RoKSByZXR1cm4gbWFwJCQxO1xuICAgIHZhciBhcnJheSwgc29ydEtleSA9IHNvcnRLZXlzW2RlcHRoIC0gMV07XG4gICAgaWYgKHJvbGx1cCAhPSBudWxsICYmIGRlcHRoID49IGtleXMubGVuZ3RoKSBhcnJheSA9IG1hcCQkMS5lbnRyaWVzKCk7XG4gICAgZWxzZSBhcnJheSA9IFtdLCBtYXAkJDEuZWFjaChmdW5jdGlvbih2LCBrKSB7IGFycmF5LnB1c2goe2tleTogaywgdmFsdWVzOiBlbnRyaWVzKHYsIGRlcHRoKX0pOyB9KTtcbiAgICByZXR1cm4gc29ydEtleSAhPSBudWxsID8gYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBzb3J0S2V5KGEua2V5LCBiLmtleSk7IH0pIDogYXJyYXk7XG4gIH1cblxuICByZXR1cm4gbmVzdCA9IHtcbiAgICBvYmplY3Q6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlT2JqZWN0LCBzZXRPYmplY3QpOyB9LFxuICAgIG1hcDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCk7IH0sXG4gICAgZW50cmllczogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGVudHJpZXMoYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKSwgMCk7IH0sXG4gICAga2V5OiBmdW5jdGlvbihkKSB7IGtleXMucHVzaChkKTsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydEtleXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRLZXlzW2tleXMubGVuZ3RoIC0gMV0gPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydFZhbHVlczogZnVuY3Rpb24ob3JkZXIpIHsgc29ydFZhbHVlcyA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICByb2xsdXA6IGZ1bmN0aW9uKGYpIHsgcm9sbHVwID0gZjsgcmV0dXJuIG5lc3Q7IH1cbiAgfTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdCgpIHtcbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBzZXRPYmplY3Qob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgcmV0dXJuIG1hcCgpO1xufVxuXG5mdW5jdGlvbiBzZXRNYXAobWFwJCQxLCBrZXksIHZhbHVlKSB7XG4gIG1hcCQkMS5zZXQoa2V5LCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIFNldCgpIHt9XG5cbnZhciBwcm90byA9IG1hcC5wcm90b3R5cGU7XG5cblNldC5wcm90b3R5cGUgPSBzZXQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2V0LFxuICBoYXM6IHByb3RvLmhhcyxcbiAgYWRkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhbHVlICs9IFwiXCI7XG4gICAgdGhpc1twcmVmaXggKyB2YWx1ZV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBwcm90by5yZW1vdmUsXG4gIGNsZWFyOiBwcm90by5jbGVhcixcbiAgdmFsdWVzOiBwcm90by5rZXlzLFxuICBzaXplOiBwcm90by5zaXplLFxuICBlbXB0eTogcHJvdG8uZW1wdHksXG4gIGVhY2g6IHByb3RvLmVhY2hcbn07XG5cbmZ1bmN0aW9uIHNldChvYmplY3QsIGYpIHtcbiAgdmFyIHNldCA9IG5ldyBTZXQ7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIFNldCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUpIHsgc2V0LmFkZCh2YWx1ZSk7IH0pO1xuXG4gIC8vIE90aGVyd2lzZSwgYXNzdW1lIGl04oCZcyBhbiBhcnJheS5cbiAgZWxzZSBpZiAob2JqZWN0KSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IG9iamVjdC5sZW5ndGg7XG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIHNldC5hZGQob2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKGYob2JqZWN0W2ldLCBpLCBvYmplY3QpKTtcbiAgfVxuXG4gIHJldHVybiBzZXQ7XG59XG5cbnZhciBrZXlzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn07XG5cbnZhciB2YWx1ZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSB2YWx1ZXMucHVzaChtYXBba2V5XSk7XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG52YXIgZW50cmllcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgZW50cmllcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBlbnRyaWVzLnB1c2goe2tleToga2V5LCB2YWx1ZTogbWFwW2tleV19KTtcbiAgcmV0dXJuIGVudHJpZXM7XG59O1xuXG5leHBvcnRzLm5lc3QgPSBuZXN0O1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG5leHBvcnRzLm1hcCA9IG1hcDtcbmV4cG9ydHMua2V5cyA9IGtleXM7XG5leHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcbmV4cG9ydHMuZW50cmllcyA9IGVudHJpZXM7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRpc3BhdGNoLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBub29wID0ge3ZhbHVlOiBmdW5jdGlvbigpIHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydHMuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZHN2LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdENvbnZlcnRlcihjb2x1bW5zKSB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb24oXCJkXCIsIFwicmV0dXJuIHtcIiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSkgKyBcIjogZFtcIiArIGkgKyBcIl1cIjtcbiAgfSkuam9pbihcIixcIikgKyBcIn1cIik7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUNvbnZlcnRlcihjb2x1bW5zLCBmKSB7XG4gIHZhciBvYmplY3QgPSBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucyk7XG4gIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHtcbiAgICByZXR1cm4gZihvYmplY3Qocm93KSwgaSwgY29sdW1ucyk7XG4gIH07XG59XG5cbi8vIENvbXB1dGUgdW5pcXVlIGNvbHVtbnMgaW4gb3JkZXIgb2YgZGlzY292ZXJ5LlxuZnVuY3Rpb24gaW5mZXJDb2x1bW5zKHJvd3MpIHtcbiAgdmFyIGNvbHVtblNldCA9IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICBjb2x1bW5zID0gW107XG5cbiAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdykge1xuICAgIGZvciAodmFyIGNvbHVtbiBpbiByb3cpIHtcbiAgICAgIGlmICghKGNvbHVtbiBpbiBjb2x1bW5TZXQpKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChjb2x1bW5TZXRbY29sdW1uXSA9IGNvbHVtbik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29sdW1ucztcbn1cblxuZnVuY3Rpb24gZHN2KGRlbGltaXRlcikge1xuICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKFwiW1xcXCJcIiArIGRlbGltaXRlciArIFwiXFxuXVwiKSxcbiAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTtcblxuICBmdW5jdGlvbiBwYXJzZSh0ZXh0LCBmKSB7XG4gICAgdmFyIGNvbnZlcnQsIGNvbHVtbnMsIHJvd3MgPSBwYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICBpZiAoY29udmVydCkgcmV0dXJuIGNvbnZlcnQocm93LCBpIC0gMSk7XG4gICAgICBjb2x1bW5zID0gcm93LCBjb252ZXJ0ID0gZiA/IGN1c3RvbUNvbnZlcnRlcihyb3csIGYpIDogb2JqZWN0Q29udmVydGVyKHJvdyk7XG4gICAgfSk7XG4gICAgcm93cy5jb2x1bW5zID0gY29sdW1ucztcbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUm93cyh0ZXh0LCBmKSB7XG4gICAgdmFyIEVPTCA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWxpbmVcbiAgICAgICAgRU9GID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtZmlsZVxuICAgICAgICByb3dzID0gW10sIC8vIG91dHB1dCByb3dzXG4gICAgICAgIE4gPSB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgSSA9IDAsIC8vIGN1cnJlbnQgY2hhcmFjdGVyIGluZGV4XG4gICAgICAgIG4gPSAwLCAvLyB0aGUgY3VycmVudCBsaW5lIG51bWJlclxuICAgICAgICB0LCAvLyB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICBlb2w7IC8vIGlzIHRoZSBjdXJyZW50IHRva2VuIGZvbGxvd2VkIGJ5IEVPTD9cblxuICAgIGZ1bmN0aW9uIHRva2VuKCkge1xuICAgICAgaWYgKEkgPj0gTikgcmV0dXJuIEVPRjsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgZmlsZVxuICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGxpbmVcblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBxdW90ZXNcbiAgICAgIHZhciBqID0gSSwgYztcbiAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IDM0KSB7XG4gICAgICAgIHZhciBpID0gajtcbiAgICAgICAgd2hpbGUgKGkrKyA8IE4pIHtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkpID09PSAzNCkge1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMSkgIT09IDM0KSBicmVhaztcbiAgICAgICAgICAgICsraTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgSSA9IGkgKyAyO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgaWYgKGMgPT09IDEzKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAyKSA9PT0gMTApICsrSTtcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAxMCkge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiArIDEsIGkpLnJlcGxhY2UoL1wiXCIvZywgXCJcXFwiXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBjb21tb24gY2FzZTogZmluZCBuZXh0IGRlbGltaXRlciBvciBuZXdsaW5lXG4gICAgICB3aGlsZSAoSSA8IE4pIHtcbiAgICAgICAgdmFyIGsgPSAxO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KEkrKyk7XG4gICAgICAgIGlmIChjID09PSAxMCkgZW9sID0gdHJ1ZTsgLy8gXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgPT09IDEzKSB7IGVvbCA9IHRydWU7IGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsrazsgfSAvLyBcXHJ8XFxyXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlO1xuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogbGFzdCB0b2tlbiBiZWZvcmUgRU9GXG4gICAgICByZXR1cm4gdGV4dC5zbGljZShqKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7XG4gICAgICB2YXIgYSA9IFtdO1xuICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHtcbiAgICAgICAgYS5wdXNoKHQpO1xuICAgICAgICB0ID0gdG9rZW4oKTtcbiAgICAgIH1cbiAgICAgIGlmIChmICYmIChhID0gZihhLCBuKyspKSA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIHJvd3MucHVzaChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdChyb3dzLCBjb2x1bW5zKSB7XG4gICAgaWYgKGNvbHVtbnMgPT0gbnVsbCkgY29sdW1ucyA9IGluZmVyQ29sdW1ucyhyb3dzKTtcbiAgICByZXR1cm4gW2NvbHVtbnMubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcildLmNvbmNhdChyb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFZhbHVlKHJvd1tjb2x1bW5dKTtcbiAgICAgIH0pLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9KSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvd3Mocm93cykge1xuICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFZhbHVlKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dCA9PSBudWxsID8gXCJcIlxuICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSBcIlwiKSA/IFwiXFxcIlwiICsgdGV4dC5yZXBsYWNlKC9cXFwiL2csIFwiXFxcIlxcXCJcIikgKyBcIlxcXCJcIlxuICAgICAgICA6IHRleHQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhcnNlOiBwYXJzZSxcbiAgICBwYXJzZVJvd3M6IHBhcnNlUm93cyxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICBmb3JtYXRSb3dzOiBmb3JtYXRSb3dzXG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCIsXCIpO1xuXG52YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7XG52YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93cztcbnZhciBjc3ZGb3JtYXQgPSBjc3YuZm9ybWF0O1xudmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93cztcblxudmFyIHRzdiA9IGRzdihcIlxcdFwiKTtcblxudmFyIHRzdlBhcnNlID0gdHN2LnBhcnNlO1xudmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7XG52YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDtcbnZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7XG5cbmV4cG9ydHMuZHN2Rm9ybWF0ID0gZHN2O1xuZXhwb3J0cy5jc3ZQYXJzZSA9IGNzdlBhcnNlO1xuZXhwb3J0cy5jc3ZQYXJzZVJvd3MgPSBjc3ZQYXJzZVJvd3M7XG5leHBvcnRzLmNzdkZvcm1hdCA9IGNzdkZvcm1hdDtcbmV4cG9ydHMuY3N2Rm9ybWF0Um93cyA9IGNzdkZvcm1hdFJvd3M7XG5leHBvcnRzLnRzdlBhcnNlID0gdHN2UGFyc2U7XG5leHBvcnRzLnRzdlBhcnNlUm93cyA9IHRzdlBhcnNlUm93cztcbmV4cG9ydHMudHN2Rm9ybWF0ID0gdHN2Rm9ybWF0O1xuZXhwb3J0cy50c3ZGb3JtYXRSb3dzID0gdHN2Rm9ybWF0Um93cztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTsiLCIvLyBodHRwczovL2QzanMub3JnL2QzLXJlcXVlc3QvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cywgcmVxdWlyZSgnZDMtY29sbGVjdGlvbicpLCByZXF1aXJlKCdkMy1kaXNwYXRjaCcpLCByZXF1aXJlKCdkMy1kc3YnKSkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJywgJ2QzLWNvbGxlY3Rpb24nLCAnZDMtZGlzcGF0Y2gnLCAnZDMtZHN2J10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSksZ2xvYmFsLmQzLGdsb2JhbC5kMyxnbG9iYWwuZDMpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzLGQzQ29sbGVjdGlvbixkM0Rpc3BhdGNoLGQzRHN2KSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3QgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gIHZhciByZXF1ZXN0LFxuICAgICAgZXZlbnQgPSBkM0Rpc3BhdGNoLmRpc3BhdGNoKFwiYmVmb3Jlc2VuZFwiLCBcInByb2dyZXNzXCIsIFwibG9hZFwiLCBcImVycm9yXCIpLFxuICAgICAgbWltZVR5cGUsXG4gICAgICBoZWFkZXJzID0gZDNDb2xsZWN0aW9uLm1hcCgpLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0LFxuICAgICAgdXNlciA9IG51bGwsXG4gICAgICBwYXNzd29yZCA9IG51bGwsXG4gICAgICByZXNwb25zZSxcbiAgICAgIHJlc3BvbnNlVHlwZSxcbiAgICAgIHRpbWVvdXQgPSAwO1xuXG4gIC8vIElmIElFIGRvZXMgbm90IHN1cHBvcnQgQ09SUywgdXNlIFhEb21haW5SZXF1ZXN0LlxuICBpZiAodHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAmJiAhKFwid2l0aENyZWRlbnRpYWxzXCIgaW4geGhyKVxuICAgICAgJiYgL14oaHR0cChzKT86KT9cXC9cXC8vLnRlc3QodXJsKSkgeGhyID0gbmV3IFhEb21haW5SZXF1ZXN0O1xuXG4gIFwib25sb2FkXCIgaW4geGhyXG4gICAgICA/IHhoci5vbmxvYWQgPSB4aHIub25lcnJvciA9IHhoci5vbnRpbWVvdXQgPSByZXNwb25kXG4gICAgICA6IHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihvKSB7IHhoci5yZWFkeVN0YXRlID4gMyAmJiByZXNwb25kKG8pOyB9O1xuXG4gIGZ1bmN0aW9uIHJlc3BvbmQobykge1xuICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzLCByZXN1bHQ7XG4gICAgaWYgKCFzdGF0dXMgJiYgaGFzUmVzcG9uc2UoeGhyKVxuICAgICAgICB8fCBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMFxuICAgICAgICB8fCBzdGF0dXMgPT09IDMwNCkge1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2UuY2FsbChyZXF1ZXN0LCB4aHIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0geGhyO1xuICAgICAgfVxuICAgICAgZXZlbnQuY2FsbChcImxvYWRcIiwgcmVxdWVzdCwgcmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIG8pO1xuICAgIH1cbiAgfVxuXG4gIHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSkge1xuICAgIGV2ZW50LmNhbGwoXCJwcm9ncmVzc1wiLCByZXF1ZXN0LCBlKTtcbiAgfTtcblxuICByZXF1ZXN0ID0ge1xuICAgIGhlYWRlcjogZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIG5hbWUgPSAobmFtZSArIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiBoZWFkZXJzLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSBoZWFkZXJzLnJlbW92ZShuYW1lKTtcbiAgICAgIGVsc2UgaGVhZGVycy5zZXQobmFtZSwgdmFsdWUgKyBcIlwiKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBJZiBtaW1lVHlwZSBpcyBub24tbnVsbCBhbmQgbm8gQWNjZXB0IGhlYWRlciBpcyBzZXQsIGEgZGVmYXVsdCBpcyB1c2VkLlxuICAgIG1pbWVUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbWltZVR5cGU7XG4gICAgICBtaW1lVHlwZSA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZmllcyB3aGF0IHR5cGUgdGhlIHJlc3BvbnNlIHZhbHVlIHNob3VsZCB0YWtlO1xuICAgIC8vIGZvciBpbnN0YW5jZSwgYXJyYXlidWZmZXIsIGJsb2IsIGRvY3VtZW50LCBvciB0ZXh0LlxuICAgIHJlc3BvbnNlVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJlc3BvbnNlVHlwZTtcbiAgICAgIHJlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHRpbWVvdXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aW1lb3V0O1xuICAgICAgdGltZW91dCA9ICt2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB1c2VyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gdXNlciA6ICh1c2VyID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICBwYXNzd29yZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHBhc3N3b3JkIDogKHBhc3N3b3JkID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZ5IGhvdyB0byBjb252ZXJ0IHRoZSByZXNwb25zZSBjb250ZW50IHRvIGEgc3BlY2lmaWMgdHlwZTtcbiAgICAvLyBjaGFuZ2VzIHRoZSBjYWxsYmFjayB2YWx1ZSBvbiBcImxvYWRcIiBldmVudHMuXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiR0VUXCIsIOKApikuXG4gICAgZ2V0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIkdFVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiUE9TVFwiLCDigKYpLlxuICAgIHBvc3Q6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiUE9TVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIElmIGNhbGxiYWNrIGlzIG5vbi1udWxsLCBpdCB3aWxsIGJlIHVzZWQgZm9yIGVycm9yIGFuZCBsb2FkIGV2ZW50cy5cbiAgICBzZW5kOiBmdW5jdGlvbihtZXRob2QsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSwgdXNlciwgcGFzc3dvcmQpO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgIWhlYWRlcnMuaGFzKFwiYWNjZXB0XCIpKSBoZWFkZXJzLnNldChcImFjY2VwdFwiLCBtaW1lVHlwZSArIFwiLCovKlwiKTtcbiAgICAgIGlmICh4aHIuc2V0UmVxdWVzdEhlYWRlcikgaGVhZGVycy5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTsgfSk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiB4aHIub3ZlcnJpZGVNaW1lVHlwZSkgeGhyLm92ZXJyaWRlTWltZVR5cGUobWltZVR5cGUpO1xuICAgICAgaWYgKHJlc3BvbnNlVHlwZSAhPSBudWxsKSB4aHIucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlO1xuICAgICAgaWYgKHRpbWVvdXQgPiAwKSB4aHIudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICBpZiAoY2FsbGJhY2sgPT0gbnVsbCAmJiB0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgY2FsbGJhY2subGVuZ3RoID09PSAxKSBjYWxsYmFjayA9IGZpeENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgY2FsbGJhY2spLm9uKFwibG9hZFwiLCBmdW5jdGlvbih4aHIpIHsgY2FsbGJhY2sobnVsbCwgeGhyKTsgfSk7XG4gICAgICBldmVudC5jYWxsKFwiYmVmb3Jlc2VuZFwiLCByZXF1ZXN0LCB4aHIpO1xuICAgICAgeGhyLnNlbmQoZGF0YSA9PSBudWxsID8gbnVsbCA6IGRhdGEpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIGFib3J0OiBmdW5jdGlvbigpIHtcbiAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGV2ZW50Lm9uLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBldmVudCA/IHJlcXVlc3QgOiB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHJldHVybiByZXF1ZXN0LmdldChjYWxsYmFjayk7XG4gIH1cblxuICByZXR1cm4gcmVxdWVzdDtcbn07XG5cbmZ1bmN0aW9uIGZpeENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbihlcnJvciwgeGhyKSB7XG4gICAgY2FsbGJhY2soZXJyb3IgPT0gbnVsbCA/IHhociA6IG51bGwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoYXNSZXNwb25zZSh4aHIpIHtcbiAgdmFyIHR5cGUgPSB4aHIucmVzcG9uc2VUeXBlO1xuICByZXR1cm4gdHlwZSAmJiB0eXBlICE9PSBcInRleHRcIlxuICAgICAgPyB4aHIucmVzcG9uc2UgLy8gbnVsbCBvbiBlcnJvclxuICAgICAgOiB4aHIucmVzcG9uc2VUZXh0OyAvLyBcIlwiIG9uIGVycm9yXG59XG5cbnZhciB0eXBlID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCByZXNwb25zZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSkucmVzcG9uc2UocmVzcG9uc2UpO1xuICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuIHIuZ2V0KGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH07XG59O1xuXG52YXIgaHRtbCA9IHR5cGUoXCJ0ZXh0L2h0bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVSYW5nZSgpLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIganNvbiA9IHR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIgdGV4dCA9IHR5cGUoXCJ0ZXh0L3BsYWluXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dDtcbn0pO1xuXG52YXIgeG1sID0gdHlwZShcImFwcGxpY2F0aW9uL3htbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgdmFyIHhtbCA9IHhoci5yZXNwb25zZVhNTDtcbiAgaWYgKCF4bWwpIHRocm93IG5ldyBFcnJvcihcInBhcnNlIGVycm9yXCIpO1xuICByZXR1cm4geG1sO1xufSk7XG5cbnZhciBkc3YgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHBhcnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIHJvdywgY2FsbGJhY2spIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGNhbGxiYWNrID0gcm93LCByb3cgPSBudWxsO1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSk7XG4gICAgci5yb3cgPSBmdW5jdGlvbihfKSB7IHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gci5yZXNwb25zZShyZXNwb25zZU9mKHBhcnNlLCByb3cgPSBfKSkgOiByb3c7IH07XG4gICAgci5yb3cocm93KTtcbiAgICByZXR1cm4gY2FsbGJhY2sgPyByLmdldChjYWxsYmFjaykgOiByO1xuICB9O1xufTtcblxuZnVuY3Rpb24gcmVzcG9uc2VPZihwYXJzZSwgcm93KSB7XG4gIHJldHVybiBmdW5jdGlvbihyZXF1ZXN0JCQxKSB7XG4gICAgcmV0dXJuIHBhcnNlKHJlcXVlc3QkJDEucmVzcG9uc2VUZXh0LCByb3cpO1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwidGV4dC9jc3ZcIiwgZDNEc3YuY3N2UGFyc2UpO1xuXG52YXIgdHN2ID0gZHN2KFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiLCBkM0Rzdi50c3ZQYXJzZSk7XG5cbmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG5leHBvcnRzLmh0bWwgPSBodG1sO1xuZXhwb3J0cy5qc29uID0ganNvbjtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG5leHBvcnRzLnhtbCA9IHhtbDtcbmV4cG9ydHMuY3N2ID0gY3N2O1xuZXhwb3J0cy50c3YgPSB0c3Y7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIhZnVuY3Rpb24oZSxuKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1uKHJlcXVpcmUoXCJkMy1yZXF1ZXN0XCIpKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImQzLXJlcXVlc3RcIl0sbik6KGUuZDM9ZS5kM3x8e30sZS5kMy5wcm9taXNlPW4oZS5kMykpfSh0aGlzLGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSxuKXtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aCxyPUFycmF5KHQpLG89MDt0Pm87bysrKXJbb109YXJndW1lbnRzW29dO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbih0LG8pe3ZhciB1PWZ1bmN0aW9uKGUsbil7cmV0dXJuIGU/dm9pZCBvKEVycm9yKGUpKTp2b2lkIHQobil9O24uYXBwbHkoZSxyLmNvbmNhdCh1KSl9KX19dmFyIHQ9e307cmV0dXJuW1wiY3N2XCIsXCJ0c3ZcIixcImpzb25cIixcInhtbFwiLFwidGV4dFwiLFwiaHRtbFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHIpe3Rbcl09bihlLGVbcl0pfSksdH0pOyIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xudmFyIGQzID0gcmVxdWlyZSgnZDMucHJvbWlzZScpO1xuXG5mdW5jdGlvbiBkZWYoYSwgYikge1xuICAgIHJldHVybiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcbn1cbi8qXG5NYW5hZ2VzIGZldGNoaW5nIGEgZGF0YXNldCBmcm9tIFNvY3JhdGEgYW5kIHByZXBhcmluZyBpdCBmb3IgdmlzdWFsaXNhdGlvbiBieVxuY291bnRpbmcgZmllbGQgdmFsdWUgZnJlcXVlbmNpZXMgZXRjLiBcbiovXG5leHBvcnQgY2xhc3MgU291cmNlRGF0YSB7XG4gICAgY29uc3RydWN0b3IoZGF0YUlkLCBhY3RpdmVDZW5zdXNZZWFyKSB7XG4gICAgICAgIHRoaXMuZGF0YUlkID0gZGF0YUlkO1xuICAgICAgICB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgPSBkZWYoYWN0aXZlQ2Vuc3VzWWVhciwgMjAxNSk7XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IHVuZGVmaW5lZDsgIC8vIG5hbWUgb2YgY29sdW1uIHdoaWNoIGhvbGRzIGxhdC9sb24gb3IgYmxvY2sgSURcbiAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB1bmRlZmluZWQ7IC8vIGlmIHRoZSBkYXRhc2V0IHR5cGUgaXMgJ3BvaW50JyAodXNlZCBmb3IgcGFyc2luZyBsb2NhdGlvbiBmaWVsZClcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IFtdOyAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIG51bWVyaWMgZGF0YXZpc1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gW107ICAgICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgZW51bSBkYXRhdmlzXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IFtdOyAgICAgICAgICAvLyBuYW1lcyBvZiBvdGhlciBjb2x1bW5zXG4gICAgICAgIHRoaXMubWlucyA9IHt9OyAgICAgICAgICAgICAgICAgICAvLyBtaW4gYW5kIG1heCBvZiBlYWNoIG51bWVyaWMgY29sdW1uXG4gICAgICAgIHRoaXMubWF4cyA9IHt9O1xuICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzID0ge307ICAgICAgICAgICAgLy8gXG4gICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXMgPSB7fTsgICAgICAvLyBtb3N0IGZyZXF1ZW50IHZhbHVlcyBpbiBlYWNoIHRleHQgY29sdW1uXG4gICAgICAgIHRoaXMuc2hhcGUgPSAncG9pbnQnOyAgICAgICAgICAgICAvLyBwb2ludCBvciBwb2x5Z29uIChDTFVFIGJsb2NrKVxuICAgICAgICB0aGlzLnJvd3MgPSB1bmRlZmluZWQ7ICAgICAgICAgICAgLy8gcHJvY2Vzc2VkIHJvd3NcbiAgICAgICAgdGhpcy5ibG9ja0luZGV4ID0ge307ICAgICAgICAgICAgIC8vIGNhY2hlIG9mIENMVUUgYmxvY2sgSURzXG4gICAgfVxuXG5cbiAgICBjaG9vc2VDb2x1bW5UeXBlcyAoY29sdW1ucykge1xuICAgICAgICAvL3ZhciBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbG9jYXRpb24nIHx8IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcgfHwgY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICAvLyBcImxvY2F0aW9uXCIgYW5kIFwicG9pbnRcIiBhcmUgYm90aCBwb2ludCBkYXRhIHR5cGVzLCBleHByZXNzZWQgZGlmZmVyZW50bHkuXG4gICAgICAgIC8vIE90aGVyd2lzZSwgYSBcImJsb2NrIElEXCIgY2FuIGJlIGpvaW5lZCBhZ2FpbnN0IHRoZSBDTFVFIEJsb2NrIHBvbHlnb25zIHdoaWNoIGFyZSBpbiBNYXBib3guXG4gICAgICAgIGxldCBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbG9jYXRpb24nIHx8IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcpWzBdO1xuICAgICAgICBpZiAoIWxjKSB7XG4gICAgICAgICAgICBsYyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIH1cblxuXG4gICAgICAgIGlmIChsYy5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcpXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGxjLm5hbWUgPT09ICdCbG9jayBJRCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUgPSAncG9seWdvbic7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gbGMubmFtZTtcblxuICAgICAgICBjb2x1bW5zID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbCAhPT0gbGMpO1xuXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbnVtYmVyJyAmJiBjb2wubmFtZSAhPT0gJ0xhdGl0dWRlJyAmJiBjb2wubmFtZSAhPT0gJ0xvbmdpdHVkZScpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4geyB0aGlzLm1pbnNbY29sXSA9IDFlOTsgdGhpcy5tYXhzW2NvbF0gPSAtMWU5OyB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAndGV4dCcpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG5cbiAgICAgICAgdGhpcy50ZXh0Q29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHRoaXMuZnJlcXVlbmNpZXNbY29sXSA9IHt9KTtcblxuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IHRoaXMubnVtZXJpY0NvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCAmJiB0aGlzLnRleHRDb2x1bW5zLmluZGV4T2YoY29sKSA8IDApO1xuICAgIH1cblxuICAgIC8vIFRPRE8gYmV0dGVyIG5hbWUgYW5kIGJlaGF2aW91clxuICAgIGZpbHRlcihyb3cpIHtcbiAgICAgICAgLy8gVE9ETyBtb3ZlIHRoaXMgc29tZXdoZXJlIGJldHRlclxuICAgICAgICBpZiAocm93WydDTFVFIHNtYWxsIGFyZWEnXSAmJiByb3dbJ0NMVUUgc21hbGwgYXJlYSddID09PSAnQ2l0eSBvZiBNZWxib3VybmUgdG90YWwnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAocm93WydDZW5zdXMgeWVhciddICYmIHJvd1snQ2Vuc3VzIHllYXInXSAhPT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuXG4gICAgLy8gY29udmVydCBudW1lcmljIGNvbHVtbnMgdG8gbnVtYmVycyBmb3IgZGF0YSB2aXNcbiAgICBjb252ZXJ0Um93KHJvdykge1xuXG4gICAgICAgIC8vIGNvbnZlcnQgbG9jYXRpb24gdHlwZXMgKHN0cmluZykgdG8gW2xvbiwgbGF0XSBhcnJheS5cbiAgICAgICAgZnVuY3Rpb24gbG9jYXRpb25Ub0Nvb3Jkcyhsb2NhdGlvbikge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsb2NhdGlvbikubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICAvLyBcIm5ldyBiYWNrZW5kXCIgZGF0YXNldHMgdXNlIGEgV0tUIGZpZWxkIFtQT0lOVCAobG9uIGxhdCldIGluc3RlYWQgb2YgKGxhdCwgbG9uKVxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uSXNQb2ludCkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb24ucmVwbGFjZSgnUE9JTlQgKCcsICcnKS5yZXBsYWNlKCcpJywgJycpLnNwbGl0KCcgJykubWFwKG4gPT4gTnVtYmVyKG4pKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhsb2NhdGlvbi5sZW5ndGgpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gW051bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVsxXS5yZXBsYWNlKCcpJywgJycpKSwgTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzBdLnJlcGxhY2UoJygnLCAnJykpXTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcblxuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBVbnJlYWRhYmxlIGxvY2F0aW9uICR7bG9jYXRpb259IGluICR7dGhpcy5uYW1lfS5gKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuXG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gdXNlIGNvbHVtbi5jYWNoZWRDb250ZW50cy5zbWFsbGVzdCBhbmQgLmxhcmdlc3RcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICByb3dbY29sXSA9IE51bWJlcihyb3dbY29sXSkgOyAvLyArcm93W2NvbF0gYXBwYXJlbnRseSBmYXN0ZXIsIGJ1dCBicmVha3Mgb24gc2ltcGxlIHRoaW5ncyBsaWtlIGJsYW5rIHZhbHVlc1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoZSB0b3RhbCB2YWx1ZXMgaW4gXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPCB0aGlzLm1pbnNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWluc1tjb2xdID0gcm93W2NvbF07XG5cbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA+IHRoaXMubWF4c1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhzW2NvbF0gPSByb3dbY29sXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHJvd1tjb2xdO1xuICAgICAgICAgICAgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gPSAodGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0gPSBsb2NhdGlvblRvQ29vcmRzLmNhbGwodGhpcywgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKTtcblxuICAgICAgICBpZiAoIXJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSlcbiAgICAgICAgICAgIHJldHVybiBudWxsOyAvLyBza2lwIHRoaXMgcm93LlxuXG4gICAgICAgIHJldHVybiByb3c7XG4gICAgfVxuXG4gICAgY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCkge1xuICAgICAgICB2YXIgbmV3VGV4dENvbHVtbnMgPSBbXTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF0gPSBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pXG4gICAgICAgICAgICAgICAgLnNvcnQoKHZhbGEsIHZhbGIpID0+IHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxhXSA8IHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxiXSA/IDEgOiAtMSlcbiAgICAgICAgICAgICAgICAuc2xpY2UoMCwxMik7XG5cbiAgICAgICAgICAgIGlmIChPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA8IDIgfHwgT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPiAyMCAmJiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdWzFdXSA8PSA1KSB7XG4gICAgICAgICAgICAgICAgLy8gSXQncyBib3JpbmcgaWYgYWxsIHZhbHVlcyB0aGUgc2FtZSwgb3IgaWYgdG9vIG1hbnkgZGlmZmVyZW50IHZhbHVlcyAoYXMganVkZ2VkIGJ5IHNlY29uZC1tb3N0IGNvbW1vbiB2YWx1ZSBiZWluZyA1IHRpbWVzIG9yIGZld2VyKVxuICAgICAgICAgICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucy5wdXNoKGNvbCk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIG5ld1RleHRDb2x1bW5zLnB1c2goY29sKTsgLy8gaG93IGRvIHlvdSBzYWZlbHkgZGVsZXRlIGZyb20gYXJyYXkgeW91J3JlIGxvb3Bpbmcgb3Zlcj9cbiAgICAgICAgICAgIH1cblxuXG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gbmV3VGV4dENvbHVtbnM7XG4gICAgICAgIC8vY29uc29sZS5sb2codGhpcy5zb3J0ZWRGcmVxdWVuY2llcyk7XG4gICAgfVxuXG4gICAgLy8gUmV0cmlldmUgcm93cyBmcm9tIFNvY3JhdGEgKHJldHVybnMgUHJvbWlzZSkuIFwiTmV3IGJhY2tlbmRcIiB2aWV3cyBnbyB0aHJvdWdoIGFuIGFkZGl0aW9uYWwgc3RlcCB0byBmaW5kIHRoZSByZWFsXG4gICAgLy8gQVBJIGVuZHBvaW50LlxuICAgIGxvYWQoKSB7XG4gICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZCArICcuanNvbicpXG4gICAgICAgIC50aGVuKHByb3BzID0+IHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IHByb3BzLm5hbWU7XG4gICAgICAgICAgICBpZiAocHJvcHMubmV3QmFja2VuZCAmJiBwcm9wcy5jaGlsZFZpZXdzLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YUlkID0gcHJvcHMuY2hpbGRWaWV3c1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZClcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4ocHJvcHMgPT4gdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIGQzLmNzdignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnL3Jvd3MuY3N2P2FjY2Vzc1R5cGU9RE9XTkxPQUQnLCB0aGlzLmNvbnZlcnRSb3cuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKHJvd3MgPT4ge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coXCJHb3Qgcm93cyBmb3IgXCIgKyB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvbHlnb24nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVCbG9ja0luZGV4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLmNhdGNoKGUgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2JsZW0gbG9hZGluZyAnICsgdGhpcy5uYW1lICsgJy4nKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUHJvYmxlbSBsb2FkaW5nICcgKyB0aGlzLm5hbWUpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gQ3JlYXRlIGEgaGFzaCB0YWJsZSBsb29rdXAgZnJvbSBbeWVhciwgYmxvY2sgSURdIHRvIGRhdGFzZXQgcm93XG4gICAgY29tcHV0ZUJsb2NrSW5kZXgoKSB7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV1bcm93WydCbG9jayBJRCddXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSb3dGb3JCbG9jayhibG9ja0lkIC8qIGNlbnN1c195ZWFyICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbdGhpcy5ibG9ja0luZGV4W3RoaXMuYWN0aXZlQ2Vuc3VzWWVhcl1bYmxvY2tJZF1dO1xuICAgIH1cblxuICAgIGZpbHRlcmVkUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIocm93ID0+IHJvd1snQ2Vuc3VzIHllYXInXSA9PT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gIT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpO1xuICAgIH1cbn0iXX0=

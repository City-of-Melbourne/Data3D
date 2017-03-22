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
    return a !== undefined && a !== null ? a : b;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBRUE7O0FBQ0E7O0FBQ0EsUUFBUSxHQUFSO0FBQ0E7QUFUQTtBQUNBO0FBQ0E7QUFRQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixJQUFtQixNQUFNLElBQXpCLEdBQWdDLENBQWhDLEdBQW9DLENBQTlDO0FBQUEsQ0FBVjs7QUFFQSxJQUFJLGdCQUFnQixTQUFoQixhQUFnQixDQUFDLEdBQUQsRUFBTSxDQUFOO0FBQUEsV0FBWSxJQUFJLE1BQUosS0FBZSxHQUFmLEdBQXFCLElBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsQ0FBakIsQ0FB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RUFITDtBQUlaLGlCQUFXO0FBSkMsS0FGaEI7QUFRRSxnQkFBWTtBQUNWLGNBQVEsT0FERTtBQUVWLHFCQUFlLENBQ2Isa0JBRGEsRUFFYixDQUFDLGlCQUZZO0FBRkw7QUFSZCxHQTlDVTtBQUZnQixDQUF2Qjs7O0FDQVA7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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Q0osYUFoQ00sQ0FBUDtBQWlDSDs7QUFHRDs7Ozs0Q0FDb0I7QUFBQTs7QUFDaEIsaUJBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUM5QixvQkFBSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLE1BQXdDLFNBQTVDLEVBQ0ksT0FBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixJQUFzQyxFQUF0QztBQUNKLHVCQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLEVBQW9DLElBQUksVUFBSixDQUFwQyxJQUF1RCxLQUF2RDtBQUNILGFBSkQ7QUFLSDs7O3VDQUVjLE8sQ0FBUSxpQixFQUFtQjtBQUN0QyxtQkFBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxnQkFBckIsRUFBdUMsT0FBdkMsQ0FBVixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUFBOztBQUNYLG1CQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSx1QkFBTyxJQUFJLGFBQUosTUFBdUIsT0FBSyxnQkFBNUIsSUFBZ0QsSUFBSSxpQkFBSixNQUEyQix5QkFBbEY7QUFBQSxhQUFqQixDQUFQO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG4vLyd1c2Ugc3RyaWN0Jztcbi8vdmFyIG1hcGJveGdsID0gcmVxdWlyZSgnbWFwYm94LWdsJyk7XG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcbmltcG9ydCB7IEZsaWdodFBhdGggfSBmcm9tICcuL2ZsaWdodFBhdGgnO1xuaW1wb3J0IHsgc3BpbiB9IGZyb20gJy4vZmxpZ2h0UGF0aCc7XG5pbXBvcnQgeyBkYXRhc2V0cyB9IGZyb20gJy4vY3ljbGVEYXRhc2V0cyc7XG5pbXBvcnQgeyBNYXBWaXMgfSBmcm9tICcuL21hcFZpcyc7XG5jb25zb2xlLmxvZyhkYXRhc2V0cyk7XG4vL21hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWGh4Y0dzMGJ6Y3dZbk0zTW5ac09XSmlhalZ3YUhKMkluMC5STjdLeXdNT3hMTE5tY1RGZm4wY2lnJztcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWTJsMGVXOW1iV1ZzWW05MWNtNWxJaXdpWVNJNkltTnBlamRvYjJKMGN6QXdPV1F6TTIxdWJHdDZNRFZxYUhvaWZRLjU1WWJxZVRIV01LX2I2Q0VBbW9VbEEnO1xuLypcblBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uczogeWdhdy02cnpxXG5cbioqVHJlZXM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZnAzOC13aXl5XG5cbkV2ZW50IGJvb2tpbmdzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvIzg0YmYtZGloaVxuQmlrZSBzaGFyZSBzdGF0aW9uczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyN0ZHZoLW45ZHZcbkRBTTogaHR0cDovL2xvY2FsaG9zdDozMDAyLyNnaDdzLXFkYThcbiovXG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkICYmIGEgIT09IG51bGwgPyBhIDogYjtcblxubGV0IHdoZW5NYXBMb2FkZWQgPSAobWFwLCBmKSA9PiBtYXAubG9hZGVkKCkgPyBmKCkgOiBtYXAub25jZSgnbG9hZCcsIGYpO1xuXG5sZXQgY2xvbmUgPSBvYmogPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcblxuY29uc3Qgb3BhY2l0eVByb3AgPSB7XG4gICAgICAgICAgICBmaWxsOiAnZmlsbC1vcGFjaXR5JyxcbiAgICAgICAgICAgIGNpcmNsZTogJ2NpcmNsZS1vcGFjaXR5JyxcbiAgICAgICAgICAgIHN5bWJvbDogJ2ljb24tb3BhY2l0eScsXG4gICAgICAgICAgICAnbGluZSc6ICdsaW5lLW9wYWNpdHknLFxuICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uJzogJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknXG4gICAgICAgIH07XG5cbi8vIHJldHVybnMgYSB2YWx1ZSBsaWtlICdjaXJjbGUtb3BhY2l0eScsIGZvciBhIGdpdmVuIGxheWVyIHN0eWxlLlxuLy8gQ2FuJ3QganVzdCB1c2UgJ3Zpc2liaWxpdHknIHByb3AsIGJlY2F1c2Ugd2hlbiBhIGxheWVyIGlzIGludmlzaWJsZSBpdCBkb2Vzbid0IHByZWxvYWQuXG5mdW5jdGlvbiBnZXRPcGFjaXR5UHJvcHMobGF5ZXIpIHtcbiAgICBsZXQgcmV0ID0gW29wYWNpdHlQcm9wW2xheWVyLnR5cGVdXTtcbiAgICBpZiAobGF5ZXIubGF5b3V0ICYmIGxheWVyLmxheW91dFsndGV4dC1maWVsZCddKVxuICAgICAgICByZXQucHVzaCgndGV4dC1vcGFjaXR5Jyk7XG4gICAgaWYgKGxheWVyLnBhaW50ICYmIGxheWVyLnBhaW50WydjaXJjbGUtc3Ryb2tlLWNvbG9yJ10pXG4gICAgICAgIHJldC5wdXNoKCdjaXJjbGUtc3Ryb2tlLW9wYWNpdHknKTtcbiAgICBcbiAgICByZXR1cm4gcmV0O1xufVxuXG4vL2ZhbHNlICYmIHdoZW5NYXBMb2FkZWQoKCkgPT5cbi8vICBzZXRWaXNDb2x1bW4oc291cmNlRGF0YS5udW1lcmljQ29sdW1uc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmxlbmd0aCldKSk7XG5cbi8vIFRPRE8gZGVjaWRlIGlmIHRoaXMgc2hvdWxkIGJlIGluIE1hcFZpc1xuZnVuY3Rpb24gc2hvd0ZlYXR1cmVUYWJsZShmZWF0dXJlLCBzb3VyY2VEYXRhLCBtYXB2aXMpIHtcbiAgICBmdW5jdGlvbiByb3dzSW5BcnJheShhcnJheSwgY2xhc3NTdHIpIHtcbiAgICAgICAgcmV0dXJuICc8dGFibGU+JyArIFxuICAgICAgICAgICAgT2JqZWN0LmtleXMoZmVhdHVyZSlcbiAgICAgICAgICAgICAgICAuZmlsdGVyKGtleSA9PiBcbiAgICAgICAgICAgICAgICAgICAgYXJyYXkgPT09IHVuZGVmaW5lZCB8fCBhcnJheS5pbmRleE9mKGtleSkgPj0gMClcbiAgICAgICAgICAgICAgICAubWFwKGtleSA9PlxuICAgICAgICAgICAgICAgICAgICBgPHRyPjx0ZCAke2NsYXNzU3RyfT4ke2tleX08L3RkPjx0ZD4ke2ZlYXR1cmVba2V5XX08L3RkPjwvdHI+YClcbiAgICAgICAgICAgICAgICAuam9pbignXFxuJykgKyBcbiAgICAgICAgICAgICc8L3RhYmxlPic7XG4gICAgICAgIH1cblxuICAgIGlmIChmZWF0dXJlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gQ2FsbGVkIGJlZm9yZSB0aGUgdXNlciBoYXMgc2VsZWN0ZWQgYW55dGhpbmdcbiAgICAgICAgZmVhdHVyZSA9IHt9O1xuICAgICAgICBzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuICAgICAgICBzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG5cbiAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2x5Z29uJykgeyAvLyBUT0RPIGNoZWNrIHRoYXQgdGhpcyBpcyBhIGJsb2NrIGxvb2t1cCBjaG9yb3BsZXRoXG4gICAgICAgIGZlYXR1cmUgPSBzb3VyY2VEYXRhLmdldFJvd0ZvckJsb2NrKGZlYXR1cmUuYmxvY2tfaWQsIGZlYXR1cmUuY2Vuc3VzX3lyKTsgICAgICAgIFxuICAgIH1cblxuXG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnZmVhdHVyZXMnKS5pbm5lckhUTUwgPSBcbiAgICAgICAgJzxoND5DbGljayBhIGZpZWxkIHRvIHZpc3VhbGlzZSB3aXRoIGNvbG91cjwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEudGV4dENvbHVtbnMsICdjbGFzcz1cImVudW0tZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBzaXplPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucywgJ2NsYXNzPVwibnVtZXJpYy1maWVsZFwiJykgKyBcbiAgICAgICAgJzxoND5PdGhlciBmaWVsZHM8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLmJvcmluZ0NvbHVtbnMsICcnKTtcblxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2ZlYXR1cmVzIHRkJykuZm9yRWFjaCh0ZCA9PiBcbiAgICAgICAgdGQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBlID0+IHtcbiAgICAgICAgICAgIG1hcHZpcy5zZXRWaXNDb2x1bW4oZS50YXJnZXQuaW5uZXJUZXh0KSA7IC8vIFRPRE8gaGlnaGxpZ2h0IHRoZSBzZWxlY3RlZCByb3dcbiAgICAgICAgfSkpO1xufVxuXG52YXIgbGFzdEZlYXR1cmU7XG5cblxuZnVuY3Rpb24gY2hvb3NlRGF0YXNldCgpIHtcblxuICAgIC8vIGtub3duIENMVUUgYmxvY2sgZGF0YXNldHMgdGhhdCB3b3JrIG9rXG4gICAgdmFyIGNsdWVDaG9pY2VzID0gW1xuICAgICAgICAnYjM2ai1raXk0JywgLy8gZW1wbG95bWVudFxuICAgICAgICAnMjM0cS1nZzgzJywgLy8gZmxvb3Igc3BhY2UgYnkgdXNlIGJ5IGJsb2NrXG4gICAgICAgICdjM2d0LWhyejYnIC8vIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzIC0tIHRoaXMgb25lIGlzIGNvbXBsZXRlLCB0aGUgb3RoZXJzIGhhdmUgZ2FwcHkgZGF0YSBmb3IgY29uZmlkZW50aWFsaXR5XG4gICAgXTsgXG5cblxuICAgIC8vIGtub3duIHBvaW50IGRhdGFzZXRzIHRoYXQgd29yayBva1xuICAgIHZhciBwb2ludENob2ljZXMgPSBbXG4gICAgICAgICdmcDM4LXdpeXknLCAvLyB0cmVlc1xuICAgICAgICAneWdhdy02cnpxJywgLy8gcGVkZXN0cmlhbiBzZW5zb3IgbG9jYXRpb25zXG4gICAgICAgICc4NGJmLWRpaGknLCAvLyBWZW51ZXMgZm9yIGV2ZW50c1xuICAgICAgICAndGR2aC1uOWR2JywgLy8gTGl2ZSBiaWtlIHNoYXJlXG4gICAgICAgICdnaDdzLXFkYTgnLCAvLyBEQU1cbiAgICAgICAgJ3NmcmctenlnYicsIC8vIENhZmVzIGFuZCBSZXN0YXVyYW50c1xuICAgICAgICAnZXc2ay1jaHo0JywgLy8gQmlvIEJsaXR6IDIwMTZcbiAgICAgICAgJzd2cmQtNGF2NScsIC8vIHdheWZpbmRpbmdcbiAgICAgICAgJ3NzNzktdjU1OCcsIC8vIGJ1cyBzdG9wc1xuICAgICAgICAnbWZmaS1tOXluJywgLy8gcHVic1xuICAgICAgICAnc3Z1eC1iYWRhJywgLy8gc29pbCB0ZXh0dXJlcyAtIG5pY2Ugb25lXG4gICAgICAgICdxandjLWY1c2gnLCAvLyBjb21tdW5pdHkgZm9vZCBndWlkZSAtIGdvb2RcbiAgICAgICAgJ2Z0aGktemFqeScsIC8vIHByb3BlcnRpZXMgb3ZlciAkMi41bVxuICAgICAgICAndHg4aC0yamdpJywgLy8gYWNjZXNzaWJsZSB0b2lsZXRzXG4gICAgICAgICc2dTV6LXVidmgnLCAvLyBiaWN5Y2xlIHBhcmtpbmdcbiAgICAgICAgLy9iczduLTV2ZWgsIC8vIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzLiAxMDAsMDAwIHJvd3MsIHRvbyBmcmFnaWxlLlxuICAgICAgICBdO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcHRpb24gaDEnKS5pbm5lckhUTUwgPSAnTG9hZGluZyByYW5kb20gZGF0YXNldC4uLic7XG4gICAgcmV0dXJuIHBvaW50Q2hvaWNlc1tNYXRoLnJvdW5kKE1hdGgucmFuZG9tKCkgKiBwb2ludENob2ljZXMubGVuZ3RoKV07XG4gICAgLy9yZXR1cm4gJ2MzZ3QtaHJ6Nic7XG59XG5cbmZ1bmN0aW9uIHNob3dDYXB0aW9uKG5hbWUsIGRhdGFJZCwgY2FwdGlvbikge1xuICAgIGxldCBpbmNsdWRlTm8gPSBmYWxzZTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbiBoMScpLmlubmVySFRNTCA9IChpbmNsdWRlTm8gPyAoX2RhdGFzZXRObyB8fCAnJyk6JycpICsgKGNhcHRpb24gfHwgbmFtZSB8fCAnJyk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2Zvb3RlciAuZGF0YXNldCcpLmlubmVySFRNTCA9IG5hbWUgfHwgJyc7XG4gICAgXG4gICAgLy8gVE9ETyByZWluc3RhdGUgZm9yIG5vbi1kZW1vIG1vZGUuXG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc291cmNlJykuc2V0QXR0cmlidXRlKCdocmVmJywgJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9kLycgKyBkYXRhSWQpO1xuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NoYXJlJykuaW5uZXJIVE1MID0gYFNoYXJlIHRoaXM6IDxhIGhyZWY9XCJodHRwczovL2NpdHktb2YtbWVsYm91cm5lLmdpdGh1Yi5pby9EYXRhM0QvIyR7ZGF0YUlkfVwiPmh0dHBzOi8vY2l0eS1vZi1tZWxib3VybmUuZ2l0aHViLmlvL0RhdGEzRC8jJHtkYXRhSWR9PC9hPmA7ICAgIFxuIFxuIH1cblxuIGZ1bmN0aW9uIHR3ZWFrUGxhY2VMYWJlbHMobWFwLCB1cCkge1xuICAgIFsncGxhY2Utc3VidXJiJywgJ3BsYWNlLW5laWdoYm91cmhvb2QnXS5mb3JFYWNoKGxheWVySWQgPT4ge1xuXG4gICAgICAgIC8vcmdiKDIyNywgNCwgODApOyBDb00gcG9wIG1hZ2VudGFcbiAgICAgICAgLy9tYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllcklkLCAndGV4dC1jb2xvcicsIHVwID8gJ3JnYigyMjcsNCw4MCknIDogJ2hzbCgwLDAsMzAlKScpOyAvLyBDb00gcG9wIG1hZ2VudGFcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXJJZCwgJ3RleHQtY29sb3InLCB1cCA/ICdyZ2IoMCwxODMsNzkpJyA6ICdoc2woMCwwLDMwJSknKTsgLy8gQ29NIHBvcCBncmVlblxuICAgICAgICBcbiAgICB9KTtcbiB9XG5cbiBmdW5jdGlvbiB0d2Vha0Jhc2VtYXAobWFwKSB7XG4gICAgdmFyIHBsYWNlY29sb3IgPSAnIzg4OCc7IC8vJ3JnYigyMDYsIDIxOSwgMTc1KSc7XG4gICAgdmFyIHJvYWRjb2xvciA9ICcjNzc3JzsgLy8ncmdiKDI0MCwgMTkxLCAxNTYpJztcbiAgICBtYXAuZ2V0U3R5bGUoKS5sYXllcnMuZm9yRWFjaChsYXllciA9PiB7XG4gICAgICAgIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA2MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDIwJSknKTtcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNzAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA1MCUpJyk7XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDc4JSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNDUlKScpOyAvLyByb2FkcyBtb3N0bHlcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgOTAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA1MCUpJyk7XG4gICAgfSk7XG4gICAgWydwb2ktcGFya3Mtc2NhbGVyYW5rMScsICdwb2ktcGFya3Mtc2NhbGVyYW5rMScsICdwb2ktcGFya3Mtc2NhbGVyYW5rMSddLmZvckVhY2goaWQgPT4ge1xuICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShpZCwgJ3RleHQtY29sb3InLCAnIzMzMycpO1xuICAgIH0pO1xuXG4gICAgbWFwLnJlbW92ZUxheWVyKCdwbGFjZS1jaXR5LWxnLXMnKTsgLy8gcmVtb3ZlIHRoZSBNZWxib3VybmUgbGFiZWwgaXRzZWxmLlxuXG59XG5cbi8qXG4gIFJlZnJlc2ggdGhlIG1hcCB2aWV3IGZvciB0aGlzIG5ldyBkYXRhc2V0LlxuKi9cbmZ1bmN0aW9uIHNob3dEYXRhc2V0KG1hcCwgZGF0YXNldCwgZmlsdGVyLCBjYXB0aW9uLCBub0ZlYXR1cmVJbmZvLCBvcHRpb25zLCBpbnZpc2libGUpIHtcbiAgICBcbiAgICBvcHRpb25zID0gZGVmKG9wdGlvbnMsIHt9KTtcbiAgICBpZiAoaW52aXNpYmxlKSB7XG4gICAgICAgIG9wdGlvbnMuaW52aXNpYmxlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvL3Nob3dDYXB0aW9uKGRhdGFzZXQubmFtZSwgZGF0YXNldC5kYXRhSWQsIGNhcHRpb24pO1xuICAgIH1cblxuICAgIGxldCBtYXB2aXMgPSBuZXcgTWFwVmlzKG1hcCwgZGF0YXNldCwgZmlsdGVyLCAhbm9GZWF0dXJlSW5mbz8gc2hvd0ZlYXR1cmVUYWJsZSA6IG51bGwsIG9wdGlvbnMpO1xuXG4gICAgc2hvd0ZlYXR1cmVUYWJsZSh1bmRlZmluZWQsIGRhdGFzZXQsIG1hcHZpcyk7IFxuICAgIHJldHVybiBtYXB2aXM7XG59XG5cbmZ1bmN0aW9uIGFkZE1hcGJveERhdGFzZXQobWFwLCBkYXRhc2V0KSB7XG4gICAgaWYgKCFtYXAuZ2V0U291cmNlKGRhdGFzZXQubWFwYm94LnNvdXJjZSkpIHtcbiAgICAgICAgbWFwLmFkZFNvdXJjZShkYXRhc2V0Lm1hcGJveC5zb3VyY2UsIHtcbiAgICAgICAgICAgIHR5cGU6ICd2ZWN0b3InLFxuICAgICAgICAgICAgdXJsOiBkYXRhc2V0Lm1hcGJveC5zb3VyY2VcbiAgICAgICAgfSk7XG4gICAgfVxufVxuLypcbiAgU2hvdyBhIGRhdGFzZXQgdGhhdCBhbHJlYWR5IGV4aXN0cyBvbiBNYXBib3hcbiovXG5mdW5jdGlvbiBzaG93TWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQsIGludmlzaWJsZSkge1xuICAgIGFkZE1hcGJveERhdGFzZXQobWFwLCBkYXRhc2V0KTtcbiAgICBsZXQgc3R5bGUgPSBtYXAuZ2V0TGF5ZXIoZGF0YXNldC5tYXBib3guaWQpO1xuICAgIGlmICghc3R5bGUpIHtcbiAgICAgICAgLy9pZiAoaW52aXNpYmxlKVxuICAgICAgICAgICAgLy9kYXRhc2V0Lm1hcGJveFxuICAgICAgICBzdHlsZSA9IGNsb25lKGRhdGFzZXQubWFwYm94KTtcbiAgICAgICAgaWYgKGludmlzaWJsZSkge1xuICAgICAgICAgICAgZ2V0T3BhY2l0eVByb3BzKHN0eWxlKS5mb3JFYWNoKHByb3AgPT4gc3R5bGUucGFpbnRbcHJvcF0gPSAwKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgICAgIG1hcC5hZGRMYXllcihzdHlsZSk7XG4gICAgfSBlbHNlIGlmICghaW52aXNpYmxlKXtcbiAgICAgICAgZ2V0T3BhY2l0eVByb3BzKHN0eWxlKS5mb3JFYWNoKHByb3AgPT5cbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGRhdGFzZXQubWFwYm94LmlkLCBwcm9wLCBkZWYoZGF0YXNldC5vcGFjaXR5LDAuOSkpKTtcbiAgICB9XG4gICAgZGF0YXNldC5fbGF5ZXJJZCA9IGRhdGFzZXQubWFwYm94LmlkO1xuXG4gICAgLy9pZiAoIWludmlzaWJsZSkgXG4gICAgICAgIC8vIHN1cmVseSB0aGlzIGlzIGFuIGVycm9yIC0gbWFwYm94IGRhdGFzZXRzIGRvbid0IGhhdmUgJ2RhdGFJZCdcbiAgICAgICAgLy9zaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkLCBkYXRhc2V0LmNhcHRpb24pO1xufVxuXG5mdW5jdGlvbiBwcmVsb2FkRGF0YXNldChtYXAsIGQpIHtcbiAgICBjb25zb2xlLmxvZygnUHJlbG9hZDogJyArIGQuY2FwdGlvbik7XG4gICAgaWYgKGQubWFwYm94KSB7XG5cbiAgICAgICAgc2hvd01hcGJveERhdGFzZXQobWFwLCBkLCB0cnVlKTtcbiAgICB9IGVsc2UgaWYgKGQuZGF0YXNldCkge1xuICAgICAgICBkLm1hcHZpcyA9IHNob3dEYXRhc2V0KG1hcCwgZC5kYXRhc2V0LCBkLmZpbHRlciwgZC5jYXB0aW9uLCB0cnVlLCBkLm9wdGlvbnMsICB0cnVlKTtcbiAgICAgICAgZC5tYXB2aXMuc2V0VmlzQ29sdW1uKGQuY29sdW1uKTtcbiAgICAgICAgZC5fbGF5ZXJJZCA9IGQubWFwdmlzLmxheWVySWQ7XG4gICAgfVxufVxuLy8gVHVybiBpbnZpc2libGUgZGF0YXNldCBpbnRvIHZpc2libGVcbmZ1bmN0aW9uIHJldmVhbERhdGFzZXQobWFwLCBkKSB7XG4gICAgY29uc29sZS5sb2coJ1JldmVhbDogJyArIGQuY2FwdGlvbiAgKyBgICgke19kYXRhc2V0Tm99KWApO1xuICAgIC8vIFRPRE8gY2hhbmdlIDAuOSB0byBzb21ldGhpbmcgc3BlY2lmaWMgZm9yIGVhY2ggdHlwZVxuICAgIGlmIChkLm1hcGJveCB8fCBkLmRhdGFzZXQpIHtcbiAgICAgICAgZ2V0T3BhY2l0eVByb3BzKG1hcC5nZXRMYXllcihkLl9sYXllcklkKSkuZm9yRWFjaChwcm9wID0+XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShkLl9sYXllcklkLCBwcm9wLCBkZWYoZC5vcGFjaXR5LCAwLjkpKSk7XG4gICAgfSBlbHNlIGlmIChkLnBhaW50KSB7XG4gICAgICAgIGQuX29sZFBhaW50ID0gW107XG4gICAgICAgIGQucGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICBkLl9vbGRQYWludC5wdXNoKFtwYWludFswXSwgcGFpbnRbMV0sIG1hcC5nZXRQYWludFByb3BlcnR5KHBhaW50WzBdLCBwYWludFsxXSldKTtcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KHBhaW50WzBdLCBwYWludFsxXSwgcGFpbnRbMl0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaWYgKGQuZGF0YXNldCkge1xuICAgICAgICBzaG93Q2FwdGlvbihkLmRhdGFzZXQubmFtZSwgZC5kYXRhc2V0LmRhdGFJZCwgZC5jYXB0aW9uKTtcbiAgICB9IGVsc2UgIGlmIChkLmNhcHRpb24pIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgfVxuICAgIGlmIChkLnN1cGVyQ2FwdGlvbilcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcHRpb24nKS5jbGFzc0xpc3QuYWRkKCdzdXBlcmNhcHRpb24nKTtcbn1cbi8vIFJlbW92ZSB0aGUgZGF0YXNldCBmcm9tIHRoZSBtYXAsIGxpa2UgaXQgd2FzIG5ldmVyIGxvYWRlZC5cbmZ1bmN0aW9uIHJlbW92ZURhdGFzZXQobWFwLCBkKSB7XG4gICAgY29uc29sZS5sb2coJ1JlbW92ZTogJyArIGQuY2FwdGlvbiAgKyBgICgke19kYXRhc2V0Tm99KWApO1xuICAgIGlmIChkLm1hcHZpcylcbiAgICAgICAgZC5tYXB2aXMucmVtb3ZlKCk7XG4gICAgXG4gICAgaWYgKGQubWFwYm94KVxuICAgICAgICBtYXAucmVtb3ZlTGF5ZXIoZC5tYXBib3guaWQpO1xuXG4gICAgaWYgKGQucGFpbnQgJiYgIWQua2VlcFBhaW50KSAvLyByZXN0b3JlIHBhaW50IHNldHRpbmdzIGJlZm9yZSB0aGV5IHdlcmUgbWVzc2VkIHVwXG4gICAgICAgIGQuX29sZFBhaW50LmZvckVhY2gocGFpbnQgPT4ge1xuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkocGFpbnRbMF0sIHBhaW50WzFdLCBwYWludFsyXSk7XG4gICAgICAgIH0pO1xuXG4gICAgaWYgKGQuc3VwZXJDYXB0aW9uKVxuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbicpLmNsYXNzTGlzdC5yZW1vdmUoJ3N1cGVyY2FwdGlvbicpO1xuXG4gICAgZC5fbGF5ZXJJZCA9IHVuZGVmaW5lZDtcbn1cblxuXG5cbmxldCBfZGF0YXNldE5vPScnO1xuLyogQWR2YW5jZSBhbmQgZGlzcGxheSB0aGUgbmV4dCBkYXRhc2V0IGluIG91ciBsb29wIFxuRWFjaCBkYXRhc2V0IGlzIHByZS1sb2FkZWQgYnkgYmVpbmcgXCJzaG93blwiIGludmlzaWJsZSAob3BhY2l0eSAwKSwgdGhlbiBcInJldmVhbGVkXCIgYXQgdGhlIHJpZ2h0IHRpbWUuXG5cbiAgICAvLyBUT0RPIGNsZWFuIHRoaXMgdXAgc28gcmVsYXRpb25zaGlwIGJldHdlZW4gXCJub3dcIiBhbmQgXCJuZXh0XCIgaXMgY2xlYXJlciwgbm8gcmVwZXRpdGlvbi5cblxuKi9cbmZ1bmN0aW9uIG5leHREYXRhc2V0KG1hcCwgZGF0YXNldE5vLCByZW1vdmVGaXJzdCkge1xuICAgIC8vIEludmlzaWJseSBsb2FkIGRhdGFzZXQgaW50byB0aGUgbWFwLlxuICAgIGZ1bmN0aW9uIGRlbGF5KGYsIG1zKSB7XG4gICAgICAgIHdpbmRvdy5zZXRUaW1lb3V0KCgpID0+ICF3aW5kb3cuc3RvcHBlZCAmJiBmKCksIG1zKTtcbiAgICB9XG5cbiAgICBfZGF0YXNldE5vID0gZGF0YXNldE5vO1xuICAgIGxldCBkID0gZGF0YXNldHNbZGF0YXNldE5vXSwgXG4gICAgICAgIG5leHREID0gZGF0YXNldHNbKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoXTtcblxuICAgIGlmIChyZW1vdmVGaXJzdClcbiAgICAgICAgcmVtb3ZlRGF0YXNldChtYXAsIGRhdGFzZXRzWyhkYXRhc2V0Tm8gLSAxICsgZGF0YXNldHMubGVuZ3RoKSAlIGRhdGFzZXRzLmxlbmd0aF0pO1xuXG4gICAgLy8gaWYgZm9yIHNvbWUgcmVhc29uIHRoaXMgZGF0YXNldCBoYXNuJ3QgYWxyZWFkeSBiZWVuIGxvYWRlZC5cbiAgICBpZiAoIWQuX2xheWVySWQpIHtcbiAgICAgICAgcHJlbG9hZERhdGFzZXQobWFwLCBkKTtcbiAgICB9XG4gICAgaWYgKGQuX2xheWVySWQgJiYgIW1hcC5nZXRMYXllcihkLl9sYXllcklkKSlcbiAgICAgICAgdGhyb3cgJ0hlbHA6IExheWVyIG5vdCBsb2FkZWQ6ICcgKyBkLl9sYXllcklkO1xuICAgIHJldmVhbERhdGFzZXQobWFwLCBkKTtcbiAgICAgICAgXG5cbiAgICAvLyBsb2FkLCBidXQgZG9uJ3Qgc2hvdywgbmV4dCBvbmUuIC8vIENvbW1lbnQgb3V0IHRoZSBuZXh0IGxpbmUgdG8gbm90IGRvIHRoZSBwcmUtbG9hZGluZyB0aGluZy5cbiAgICAvLyB3ZSB3YW50IHRvIHNraXAgXCJkYXRhc2V0c1wiIHRoYXQgYXJlIGp1c3QgY2FwdGlvbnMgZXRjLlxuICAgIGxldCBuZXh0UmVhbERhdGFzZXRObyA9IChkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aDtcbiAgICB3aGlsZSAoZGF0YXNldHNbbmV4dFJlYWxEYXRhc2V0Tm9dICYmICFkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10uZGF0YXNldCAmJiAhZGF0YXNldHNbbmV4dFJlYWxEYXRhc2V0Tm9dLm1hcGJveCAmJiBuZXh0UmVhbERhdGFzZXRObyA8IGRhdGFzZXRzLmxlbmd0aClcbiAgICAgICAgbmV4dFJlYWxEYXRhc2V0Tm8gKys7XG4gICAgaWYgKGRhdGFzZXRzW25leHRSZWFsRGF0YXNldE5vXSlcbiAgICAgICAgcHJlbG9hZERhdGFzZXQobWFwLCBkYXRhc2V0c1tuZXh0UmVhbERhdGFzZXROb10pO1xuXG4gICAgaWYgKGQuc2hvd0xlZ2VuZCkge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmRzJykuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICB9XG5cbiAgICAvLyBXZSdyZSBhaW1pbmcgdG8gYXJyaXZlIGF0IHRoZSB2aWV3cG9pbnQgMS8zIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIGFwcGVhcmFuY2VcbiAgICAvLyBhbmQgbGVhdmUgMi8zIG9mIHRoZSB3YXkgdGhyb3VnaC5cbiAgICBpZiAoZC5mbHlUbyAmJiAhbWFwLmlzTW92aW5nKCkpIHtcbiAgICAgICAgZC5mbHlUby5kdXJhdGlvbiA9IGQuZGVsYXkvMzsvLyBzbyBpdCBsYW5kcyBhYm91dCBhIHRoaXJkIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIHZpc2liaWxpdHkuXG4gICAgICAgIG1hcC5mbHlUbyhkLmZseVRvLCB7IHNvdXJjZTogJ25leHREYXRhc2V0J30pO1xuICAgIH1cbiAgICBcbiAgICBpZiAobmV4dEQuZmx5VG8pIHtcbiAgICAgICAgLy8gZ290IHRvIGJlIGNhcmVmdWwgaWYgdGhlIGRhdGEgb3ZlcnJpZGVzIHRoaXMsXG4gICAgICAgIG5leHRELmZseVRvLmR1cmF0aW9uID0gZGVmKG5leHRELmZseVRvLmR1cmF0aW9uLCBkLmRlbGF5LzMgKyBuZXh0RC5kZWxheS8zKTsvLyBzbyBpdCBsYW5kcyBhYm91dCBhIHRoaXJkIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIHZpc2liaWxpdHkuXG4gICAgICAgIGRlbGF5KCgpID0+IG1hcC5mbHlUbyhuZXh0RC5mbHlUbywgeyBzb3VyY2U6ICduZXh0RGF0YXNldCd9KSwgZC5kZWxheSAqIDIvMyk7XG4gICAgfVxuXG4gICAgZGVsYXkoKCkgPT4gcmVtb3ZlRGF0YXNldChtYXAsIGQpLCBkLmRlbGF5ICsgZGVmKGQubGluZ2VyLCAwKSk7IC8vIG9wdGlvbmFsIFwibGluZ2VyXCIgdGltZSBhbGxvd3Mgb3ZlcmxhcC4gTm90IGdlbmVyYWxseSBuZWVkZWQgc2luY2Ugd2UgaW1wbGVtZW50ZWQgcHJlbG9hZGluZy5cbiAgICBcbiAgICBkZWxheSgoKSA9PiBuZXh0RGF0YXNldChtYXAsIChkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aCksIGQuZGVsYXkgKTtcbn1cblxuZnVuY3Rpb24gbGlzdGVuRm9yS2V5c3Ryb2tlcyhtYXAsIG9wdGlvbnMpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGU9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZS5rZXlDb2RlKTtcbiAgICAgICAgLy8gLCBhbmQgLiBzdG9wIHRoZSBhbmltYXRpb24gYW5kIGFkdmFuY2UgZm9yd2FyZC9iYWNrXG4gICAgICAgIGlmIChbMTkwLCAxODhdLmluZGV4T2YoZS5rZXlDb2RlKSA+IC0xICYmIG9wdGlvbnMuZGVtb01vZGUpIHtcbiAgICAgICAgICAgIG1hcC5zdG9wKCk7XG4gICAgICAgICAgICB3aW5kb3cuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICByZW1vdmVEYXRhc2V0KG1hcCwgZGF0YXNldHNbX2RhdGFzZXROb10pO1xuICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAoX2RhdGFzZXRObyArIHsxOTA6IDEsIDE4ODogLTF9W2Uua2V5Q29kZV0gKyBkYXRhc2V0cy5sZW5ndGgpICUgZGF0YXNldHMubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIGlmIChlLmtleUNvZGUgPT09IDMyICYmIG9wdGlvbnMuZGVtb01vZGUpIHtcbiAgICAgICAgICAgIC8vIFNwYWNlID0gc3RhcnQvc3RvcFxuICAgICAgICAgICAgd2luZG93LnN0b3BwZWQgPSAhd2luZG93LnN0b3BwZWQ7XG4gICAgICAgICAgICBpZiAod2luZG93LnN0b3BwZWQpXG4gICAgICAgICAgICAgICAgbWFwLnN0b3AoKTtcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJlbW92ZURhdGFzZXQobWFwLCBkYXRhc2V0c1tfZGF0YXNldE5vXSk7XG4gICAgICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCBfZGF0YXNldE5vKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBzZXR1cE1hcChvcHRpb25zKSB7XG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9NScsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDEzLC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCh7Y29tcGFjdDp0cnVlfSksICd0b3AtcmlnaHQnKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywgKCkgPT4gdHdlYWtCYXNlbWFwKG1hcCkpO1xuICAgIC8vbWFwLm9uY2UoJ2xvYWQnLCgpID0+IHR3ZWFrUGxhY2VMYWJlbHMobWFwLHRydWUpKTtcbiAgICAvL3NldFRpbWVvdXQoKCk9PnR3ZWFrUGxhY2VMYWJlbHMobWFwLCBmYWxzZSksIDgwMDApO1xuICAgIFxuICAgIG1hcC5vbignbW92ZWVuZCcsIChlLGRhdGEpPT4ge1xuICAgICAgICBpZiAoZS5zb3VyY2UgPT09ICduZXh0RGF0YXNldCcpXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIC8vIFdoZW4gd2UgbWFudWFsbHkgcG9zaXRpb24gdGhlIG1hcCwgZHVtcCB0aGUgbG9jYXRpb24gdG8gY29uc29sZSAtIG1ha2VzIGl0IGVhc3kgdG8gY3JlYXRlIHRvdXJzLlxuICAgICAgICBjb25zb2xlLmxvZyh7XG4gICAgICAgICAgICBjZW50ZXI6IG1hcC5nZXRDZW50ZXIoKSxcbiAgICAgICAgICAgIHpvb206IG1hcC5nZXRab29tKCksXG4gICAgICAgICAgICBiZWFyaW5nOiBtYXAuZ2V0QmVhcmluZygpLFxuICAgICAgICAgICAgcGl0Y2g6IG1hcC5nZXRQaXRjaCgpXG4gICAgICAgIH0pO1xuICAgIH0pO1xuICAgIG1hcC5vbignZXJyb3InLCBlID0+IHtcbiAgICAgICAgLy8gSGlkZSB0aG9zZSBhbm5veWluZyBub24tZXJyb3IgZXJyb3JzXG4gICAgICAgIGlmIChlICYmIGUuZXJyb3IgIT09ICdFcnJvcjogTm90IEZvdW5kJylcbiAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSk7XG4gICAgbGlzdGVuRm9yS2V5c3Ryb2tlcyhtYXAsIG9wdGlvbnMpO1xuICAgIGlmIChvcHRpb25zLnNwaW4pXG4gICAgICAgIHNwaW4obWFwKTtcbiAgICByZXR1cm4gbWFwO1xufVxuXG4vKiBQcmUgZG93bmxvYWQgYWxsIG5vbi1tYXBib3ggZGF0YXNldHMgaW4gdGhlIGxvb3AgKi9cbi8vIGFsc28gZ2V0IHJpZCBvZiB0aGUgc2lkZWJhci4gOilcbmZ1bmN0aW9uIGxvYWREYXRhc2V0cyhtYXApIHtcbiAgICAvLyBpZiB3ZSBkaWQgdGhpcyBhZnRlciB0aGUgbWFwIHdhcyBsb2FkaW5nLCBjYWxsIG1hcC5yZXNpemUoKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZmVhdHVyZXMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgICAgICAgXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIC8vIEZvciBwZW9wbGUgd2hvIHdhbnQgdGhlIFwic2NyaXB0XCIuICAgICAgICBcbiAgICB3aW5kb3cuY2FwdGlvbnMgPSBkYXRhc2V0cy5tYXAoZCA9PiBgJHtkLmNhcHRpb259ICgke2QuZGVsYXkgLyAxMDAwfXMpYCkuam9pbignXFxuJyk7XG5cblxuICAgIHJldHVybiBQcm9taXNlXG4gICAgICAgIC5hbGwoZGF0YXNldHMubWFwKGQgPT4geyBcbiAgICAgICAgICAgIGlmIChkLmRhdGFzZXQpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGluZyBkYXRhc2V0ICcgKyBkLmRhdGFzZXQuZGF0YUlkKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5kYXRhc2V0LmxvYWQoKTtcbiAgICAgICAgICAgIH0gZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfSkpLnRoZW4oKCkgPT4gZGF0YXNldHNbMF0uZGF0YXNldCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRPbmVEYXRhc2V0KGRhdGFzZXQpIHtcbiAgICByZXR1cm4gbmV3IFNvdXJjZURhdGEoZGF0YXNldCkubG9hZCgpO1xuICAgIC8qaWYgKGRhdGFzZXQubWF0Y2goLy4uLi4tLi4uLi8pKVxuICAgICAgICBcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7Ki9cbn1cblxuLypcblxuVVJMIHN0cnVjdHVyZXM6XG5cbi8gICAgICAgICAgICAgICAgICAgcGljayBhIHJhbmRvbSBkYXRhc2V0XG4vI2RlbW8gICAgICAgICAgICAgIG5vbi1pbnRlcmFjdGl2ZSBtb2RlLCBydW4gYSB3aG9sZSBzaG93Y2FzZVxuLyNhYmNkLTEyMzQgICAgICAgICBsb2FkIGEgcGFydGljdWxhciBzb2NyYXRhIElEXG4vI3NudGhvc3VudGFoZW9ldXQgIGxvYWQgYSBNYXBib3ggdGlsZXNldCBJRFxuLyMuLi4uJmxvZ29cbi8jLi4uLiZzcGluXG5cblxuKi9cbi8vIGxpc3QgdGlsZXNldHM6IHNrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWHA0Y1dwNGJYZ3dNWHBxTXpKeGNYYzVlbUZoWWpGNUluMC4xaW5xY1pOSnUtWjRQUWxVVFEtR1J3XG4vLyBodHRwczovL2FwaS5tYXBib3guY29tL3RpbGVzZXRzL3YxL3N0ZXZhZ2U/YWNjZXNzX3Rva2VuPXNrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWHA0Y1dwNGJYZ3dNWHBxTXpKeGNYYzVlbUZoWWpGNUluMC4xaW5xY1pOSnUtWjRQUWxVVFEtR1J3XG5mdW5jdGlvbiBwYXJzZVVybCgpIHtcbiAgICBmdW5jdGlvbiBnZXRSZWdleFBhcnQoaGFzaCwgcmVnZXgsIHBhcnQpIHtcbiAgICAgICAgcmV0dXJuIGRlZihoYXNoLm1hdGNoKHJlZ2V4KSwgW10pW3BhcnQgKyAxXTtcbiAgICB9XG4gICAgbGV0IG9wdGlvbnMgPSB7fTtcbiAgICBsZXQgaGFzaCA9IHdpbmRvdy5sb2NhdGlvbi5oYXNoO1xuICAgIGlmIChoYXNoLm1hdGNoKCcjZGVtbycpKSB7XG4gICAgICAgIG9wdGlvbnMuZGVtb01vZGUgPSB0cnVlO1xuICAgICAgICBvcHRpb25zLnN0YXJ0ID0gZGVmKGdldFJlZ2V4UGFydChoYXNoLCAvJnN0YXJ0PShcXGQrKS8sIDApLCAwKTtcbiAgICAgICAgY29uc29sZS5sb2cob3B0aW9ucy5zdGFydCk7XG4gICAgICAgIFxuICAgIH0gZWxzZSBpZiAoaGFzaCkge1xuICAgICAgICAvLyAjIyMgcmVwbGFjZSB3aXRoIG1vcmUgc2VsZWN0aXZlIFJFXG4gICAgICAgIG9wdGlvbnMuZGF0YXNldCA9IGRlZihoYXNoLm1hdGNoKC8jKFthLXpBLVowLTldezR9LVthLXpBLVowLTldezR9KS8pLCBbXSlbMV07XG4gICAgICAgIG9wdGlvbnMuc3BpbiA9IC8mc3Bpbi8udGVzdChoYXNoKTtcbiAgICAgICAgLypvcHRpb25zLm1hcGJveElkID0gZGVmKGhhc2gubWF0Y2goLyhtYXBib3g6XFwvXFwvW2EtekEtWjAtOV0rXFwuW2EtekEtWjAtOV0rKSwgW10pWzFdO1xuICAgICAgICBpZiAob3B0aW9ucy5tYXBib3hJZCkge1xuICAgICAgICAgICAgb3B0aW9ucy5tYXBib3hEYXRhc2V0ID0ge1xuICAgICAgICAgICAgICAgIGlkOiAnbWFwYm94LXBvaW50cycsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICAgICAgc291cmNlOiBvcHRpb25zLm1hcGJveFxuXG4gICAgICAgICAgICB9XG4gICAgICAgIH0qL1xuICAgIH1cbiAgICByZXR1cm4gb3B0aW9ucztcbn1cblxuKGZ1bmN0aW9uIHN0YXJ0KCkge1xuICAgIHRyeSB7IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5yZXF1ZXN0RnVsbHNjcmVlbigpOyB9IGNhdGNoIChlKSB7IH0gLy8gcHJvYmFibHkgZG9lcyBub3RoaW5nLlxuXG4gICAgbGV0IHAsIG9wdGlvbnMgPSBwYXJzZVVybCgpO1xuICAgIGlmIChvcHRpb25zLmRlbW9Nb2RlKSB7XG4gICAgICAgIHAgPSBsb2FkRGF0YXNldHMobWFwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBpZiAoIW9wdGlvbnMuZGF0YXNldClcbiAgICAgICAgICAgIG9wdGlvbnMuZGF0YXNldCA9IGNob29zZURhdGFzZXQoKTtcbiAgICAgICAgcCA9IGxvYWRPbmVEYXRhc2V0KG9wdGlvbnMuZGF0YXNldCk7XG4gICAgfVxuICAgIGxldCBtYXAgPSBzZXR1cE1hcChvcHRpb25zKTtcbiAgICBwLnRoZW4oZGF0YXNldCA9PiB7XG4gICAgICAgIHdpbmRvdy5zY3JvbGxUbygwLDEpOyAvLyBkb2VzIHRoaXMgaGlkZSB0aGUgYWRkcmVzcyBiYXI/IE5vcGUgICAgXG4gICAgICAgIGlmIChkYXRhc2V0KSBcbiAgICAgICAgICAgIHNob3dDYXB0aW9uKGRhdGFzZXQubmFtZSwgZGF0YXNldC5kYXRhSWQpO1xuXG4gICAgICAgIHdoZW5NYXBMb2FkZWQobWFwLCAoKSA9PiB7XG5cbiAgICAgICAgICAgIGlmIChvcHRpb25zLmRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgLy8gc3RhcnQgdGhlIGN5Y2xlIG9mIGRhdGFzZXRzICgwID0gZmlyc3QgZGF0YXNldClcbiAgICAgICAgICAgICAgICBuZXh0RGF0YXNldChtYXAsIG9wdGlvbnMuc3RhcnQpOyBcbiAgICAgICAgICAgICAgICAvL3ZhciBmcCA9IG5ldyBGbGlnaHRQYXRoKG1hcCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dEYXRhc2V0KG1hcCwgZGF0YXNldCk7IC8vIGp1c3Qgc2hvdyBvbmUgZGF0YXNldC5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsb2FkaW5nJykub3V0ZXJIVE1MPScnO1xuICAgICAgICB9KTtcbiAgICAgICAgXG5cbiAgICB9KTtcbn0pKCk7XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuLypcblN1Z2dlc3Rpb25zOlxuXG5UaGlzIGlzIE1lbGJvdXJuZVxuSGVyZSBhcmUgb3VyIHByZWNpbmN0c1xuQXMgeW91J2QgZ3Vlc3MsIHdlIGhhdmUgYSBsb3Qgb2YgZGF0YTpcbi0gYWRkcmVzc2VzLCBib3VuZGFyaWVzXG5cblxuMS4gT3JpZW50IHdpdGggcHJlY2luY3RzXG5cbjIuIEJ1dCB3ZSBhbHNvIGhhdmU6IFxuLSB3ZWRkaW5nXG4tIGJpbiBuaWdodHNcbi0gZG9ncyBsYXN0IFxuLSB0b2lsZXRzXG4tLSBhbGxcbi0tIHdoZWVsY2hhaXJzIHdpdGggaWNvbnNcblxuKi9cblxuXG5cblxuXG4vKlxuSW50cm9cbi0gT3ZlcnZpZXcgKHN1YnVyYiBuYW1lcyBoaWdobGlnaHRlZClcbi0gUHJvcGVydHkgYm91bmRhcmllc1xuLSBTdHJlZXQgYWRkcmVzc2VzXG5cblVyYmFuIGZvcmVzdDpcbi0gZWxtc1xuLSBndW1zXG4tIHBsYW5lc1xuLSBhbGxcblxuQ0xVRVxuLSBlbXBsb3ltZW50XG4tIHRyYW5zcG9ydCBzZWN0b3Jcbi0gc29jaWFsL2hlYWx0aCBzZWN0b3JcblxuREFNXG4tIGFwcGxpY2F0aW9uc1xuLSBjb25zdHJ1Y3Rpb25cbi0gY29tcGxldGVkXG5cbkRpZCB5b3Uga25vdzpcbi0gY29tbXVuaXR5IGZvb2Rcbi0gR2FyYmFnZSBDb2xsZWN0aW9uIFpvbmVzXG4tIEJvb2thYmxlIEV2ZW50IFZlbnVlc1xuLS0gd2VkZGluZ2FibGVcbi0tIGFsbFxuLSBUb2lsZXRzXG4tLSBhbGwgXG4tLSBhY2Nlc3NpYmxlXG4tIENhZmVzIGFuZCBSZXN0YXVyYW50c1xuLSBEb2cgd2Fsa2luZyB6b25lc1xuXG5GaW5hbGU6XG4tIFNreWxpbmVcbi0gV2hhdCBjYW4geW91IGRvIHdpdGggb3VyIG9wZW4gZGF0YT9cblxuXG5HYXJiYWdlIENvbGxlY3Rpb24gWm9uZXNcbkRvZyBXYWxraW5nIFpvbmVzIG9mZi1sZWFzaFxuQmlrZSBTaGFyZSBTdGF0aW9uc1xuQm9va2FibGUgRXZlbnQgVmVudWVzXG4tIHdlZGRpbmdhYmxlXG5cblxuR3JhbmQgZmluYWxlIFwiV2hhdCBjYW4geW91IGRvIHdpdGggb3VyIG9wZW4gZGF0YVwiP1xuLSBidWlsZGluZ3Ncbi0gY2FmZXNcbi0gXG5cblxuXG5UaGVzZSBuZWVkIGEgaG9tZTpcbi0gYmlrZSBzaGFyZSBzdGF0aW9uc1xuLSBwZWRlc3RyaWFuIHNlbnNvcnNcbi0gYWRkcmVzc2VzXG4tIHByb3BlcnR5IGJvdW5kYXJpZXNcbi0gYnVpbGRpbmdzXG4tIGNhZmVzXG4tIGNvbW11bml0eSBmb29kXG5cblxuXG4qL1xuXG5cblxuXG5cblxuXG5cblxuXG4vKlxuXG5EYXRhc2V0IHJ1biBvcmRlclxuLSBidWlsZGluZ3MgKDNEKVxuLSB0cmVlcyAoZnJvbSBteSBvcGVudHJlZXMgYWNjb3VudClcbi0gY2FmZXMgKGNpdHkgb2YgbWVsYm91cm5lLCBzdHlsZWQgd2l0aCBjb2ZmZWUgc3ltYm9sKVxuLSBiYXJzIChzaW1pbGFyKVxuLSBnYXJiYWdlIGNvbGxlY3Rpb24gem9uZXNcbi0gZG9nIHdhbGtpbmcgem9uZXNcbi0gQ0xVRSAoM0QgYmxvY2tzKVxuLS0gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMgcGVyIGJsb2NrXG4tLS0gdmFyaW91cyB0eXBlcywgdGhlbiB0b3RhbFxuLS0gZW1wbG95bWVudCAodmFyaW91cyB0eXBlcyB3aXRoIHNwZWNpZmljIHZhbnRhZ2UgcG9pbnRzIC0gYmV3YXJlIHRoYXQgbm90IGFsbCBkYXRhIGluY2x1ZGVkOyB0aGVuIHRvdGFsKVxuLS0gZmxvb3IgdXNlIChkaXR0bylcblxuXG5cblxuTWluaW11bVxuLSBmbG9hdHkgY2FtZXJhc1xuLSBjbHVlIDNELFxuLSBiaWtlIHNoYXJlIHN0YXRpb25zXG5cbkhlYWRlcjpcbi0gZGF0YXNldCBuYW1lXG4tIGNvbHVtbiBuYW1lXG5cbkZvb3RlcjogZGF0YS5tZWxib3VybmUudmljLmdvdi5hdVxuXG5Db00gbG9nb1xuXG5cbk1lZGl1bVxuLSBNdW5pY2lwYWxpdHkgYm91bmRhcnkgb3ZlcmxhaWRcblxuU3RyZXRjaCBnb2Fsc1xuLSBvdmVybGF5IGEgdGV4dCBsYWJlbCBvbiBhIGJ1aWxkaW5nL2NsdWVibG9jayAoZWcsIEZyZWVtYXNvbnMgSG9zcGl0YWwgLSB0byBzaG93IHdoeSBzbyBtdWNoIGhlYWx0aGNhcmUpXG5cblxuXG5cblxuKi9cblxuXG5jb25zdCBDb00gPSB7XG4gICAgYmx1ZTogJ3JnYigwLDE3NCwyMDMpJyxcbiAgICBtYWdlbnRhOidyZ2IoMjI3LCA0LCA4MCknLFxuICAgIGdyZWVuOiAncmdiKDAsMTgzLDc5KSdcbn07XG5Db00uZW51bUNvbG9ycyA9IFtDb00uYmx1ZSwgQ29NLm1hZ2VudGEsIENvTS5ncmVlbl07XG5cbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuXG5leHBvcnQgY29uc3QgZGF0YXNldHMgPSBbXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidNZWxib3VybmUgaGFzIGEgbG90IG9mIGRhdGEsIHJlYWR5IGZvciB5b3UgdG8gYWNjZXNzIGFuZCB1c2UgdGhyb3VnaCBvdXIgT3BlbiBEYXRhIFBsYXRmb3JtLicsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTo4MDAwLFxuICAgICAgICBjYXB0aW9uOidUaGlzIGlzIE1lbGJvdXJuZScsXG4gICAgICAgIHBhaW50OiBbXG4gICAgICAgICAgICBbJ3BsYWNlLXN1YnVyYicsICd0ZXh0LWNvbG9yJywgJ3JnYigwLDE4Myw3OSknXSxcbiAgICAgICAgICAgIFsncGxhY2UtbmVpZ2hib3VyaG9vZCcsICd0ZXh0LWNvbG9yJywgJ3JnYigwLDE4Myw3OSknXVxuICAgICAgICBdLFxuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgZmx5VG86IHtjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LHpvb206MTMscGl0Y2g6NDUsYmVhcmluZzowfVxuXG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwLFxuICAgICAgICBuYW1lOiAnUHJvcGVydHkgYm91bmRhcmllcycsXG4gICAgICAgIGNhcHRpb246ICdXZSBoYXZlIGRhdGEgYWJvdXQgcHJvcGVydHkgYm91bmRhcmllcyB0aGF0IHdlIHVzZSBmb3IgcGxhbm5pbmcnLFxuICAgICAgICBvcGFjaXR5OiAxLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcy0xJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwLCAvLyBqdXN0IHRvIGF2b2lkIGZsYXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcbiAgICAvLyByZXBlYXQgLSBqdXN0IHRvIGZvcmNlIHRoZSB0aW1pbmdcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbGluZ2VyOjMwMDAsXG4gICAgICAgIG5hbWU6ICdQcm9wZXJ0eSBib3VuZGFyaWVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1dlIGhhdmUgZGF0YSBhYm91dCBwcm9wZXJ0eSBib3VuZGFyaWVzIHRoYXQgd2UgdXNlIGZvciBwbGFubmluZycsXG4gICAgICAgIG9wYWNpdHk6MSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMtMicsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBqdXN0IHJlcGVhdCBwcmV2aW91cyB2aWV3LlxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjE0MDAwLFxuICAgICAgICBuYW1lOiAnU3RyZWV0IGFkZHJlc3NlcycsXG4gICAgICAgIGNhcHRpb246ICdBbmQgZGF0YSBhYm91dCBldmVyeSBzdHJlZXQgYWRkcmVzcy4nLFxuICAgICAgICAvLyBuZWVkIHRvIHpvb20gaW4gY2xvc2Ugb24gdGhpcyBvbmVcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FkZHJlc3NlcycsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1N0cmVldF9hZGRyZXNzZXMtOTdlNW9uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3N0cmVldF9ub30nLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gbmVhciB1bmktaXNoXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAwMTczNjQyNjA2OCxcImxhdFwiOi0zNy43OTc3MDc5ODg2MDEyM30sXCJ6b29tXCI6MTgsXCJiZWFyaW5nXCI6LTQ1LjcwMjAzMDQwNTA2MDg0LFwicGl0Y2hcIjo0OCwgZHVyYXRpb246MTQwMDB9XG4gICAgICAgIC8vIHJvdW5kYWJvdXQgb2YgZGVhdGggbG9va25nIG53XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTkxMDQ4NzA2MTE4NCxcImxhdFwiOi0zNy44MDA2MTA4ODk3MTczMn0sXCJ6b29tXCI6MTguNTcyMjA0NzgyODE5MTk1LFwiYmVhcmluZ1wiOi0yMC40MzU2MzY2OTE2NDM4MjIsXCJwaXRjaFwiOjU3Ljk5OTk5OTk5OTk5OTk5fVxuICAgIH0sXG5cblxuICAgIC8qe1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgaGVhbHRoIGFuZCB0eXBlIG9mIGVhY2ggdHJlZSBpbiBvdXIgdXJiYW4gZm9yZXN0JyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDIsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1VsbXVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTc2NzQxNTQxODI2NixcImxhdFwiOi0zNy43OTE2ODY2MTk3NzI5NzV9LFwiem9vbVwiOjE1LjQ4NzMzNzQ1NzM1NjY5MSxcImJlYXJpbmdcIjotMTIyLjQwMDAwMDAwMDAwMDA5LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MTQ3LjY1MjE5MzgyMzczMTA3LFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICB9LCovXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidVcmJhbiBGb3Jlc3QnLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnT3VyIHVyYmFuIGZvcmVzdCBkYXRhIGNvbnRhaW5zIGV2ZXJ5IGVsbSB0cmVlLi4uJyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzAsIDgwJSwgNTYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdVbG11cycgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzMTM4LFwibGF0XCI6LTM3Ljc4ODg0M30sXCJ6b29tXCI6MTUuMixcImJlYXJpbmdcIjotMTA2LjE0LFwicGl0Y2hcIjo1NX1cblxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJy4uLmV2ZXJ5IGd1bSB0cmVlLi4uJywgLy8gYWRkIGEgbnVtYmVyXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2d1bXRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAzLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdFdWNhbHlwdHVzJywgJ0NvcnltYmlhJywgJ0FuZ29waG9yYScgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC44NDczNzQ4ODY4OTA3LFwibGF0XCI6LTM3LjgxMTc3OTc0MDc4NzI0NH0sXCJ6b29tXCI6MTMuMTYyNTI0MTUwODQ3MzE1LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MjAwLFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MjczMjU2NzMzMzEsXCJsYXRcIjotMzcuNzg0NDQ5NDA1OTMwMzh9LFwiem9vbVwiOjE0LjUsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA4MDAwLFxuICAgICAgICAvL2RhdGFzZXRMZWFkOiAzMDAwLFxuICAgICAgICBjYXB0aW9uOiAnLi4uYW5kIGV2ZXJ5IHBsYW5lIHRyZWUuJywgLy8gYWRkIGEgbnVtYmVyXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ3BsYW5ldHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDM0MCwgOTclLDY1JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnUGxhdGFudXMnIF1cbiAgICAgICAgICAgIFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzOTQ2MzM4Mzg5NjUsXCJsYXRcIjotMzcuNzk1ODg4NzA2NjgyNzF9LFwiem9vbVwiOjE1LjkwNTEzMDM2MTQ0NjY2OCxcImJlYXJpbmdcIjoxNTcuNTk5OTk5OTk5OTk3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU1MyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzYzOTR9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE0Nzg1MTAwMTYyMDIsXCJsYXRcIjotMzcuNzg0MzQxNDcxNjc0Nzd9LFwiem9vbVwiOjEzLjkyMjIyODQ2MTc5MzY2OSxcImJlYXJpbmdcIjoxMjIuOTk0NzgzNDYwNDM0NixcInBpdGNoXCI6NDcuNTAwMDAwMDAwMDAwMDN9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTM0MzQ1MDc1NTE2LFwibGF0XCI6LTM3LjgwMTM0MTE4MDEyNTIyfSxcInpvb21cIjoxNSxcImJlYXJpbmdcIjoxNTEuMDAwNzMwNDg4MjczMzgsXCJwaXRjaFwiOjU4Ljk5OTk5OTk5OTk5OTk5fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU2MTM4ODQ4ODQwOSxcImxhdFwiOi0zNy44MDkwMjcxMDUzMTYzMn0sXCJ6b29tXCI6MTQuMjQxNzU3MDMwODE2NjM2LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdOZWFybHkgNzAsMDAwIHRyZWVzIGluIGFsbC4nLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MTkxMTU3MDAwMDM0LFwibGF0XCI6LTM3LjgwMDM2NzA5MjE0MDIyfSxcInpvb21cIjoxNC4xLFwiYmVhcmluZ1wiOjE0NC45MjcyODM5Mjc0MjY5NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjE0Ny42NTIxOTM4MjM3MzEwNyxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonQ2Vuc3VzIG9mIExhbmQgVXNlIGFuZCBFbXBsb3ltZW50IChDTFVFKScsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAgXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIFxuICAgICAgICBjb2x1bW46ICdUb3RhbCBlbXBsb3ltZW50IGluIGJsb2NrJyAsXG4gICAgICAgIGNhcHRpb246ICdDTFVFIHJldmVhbHMgb3VyIGVtcGxveW1lbnQgaG90IHNwb3RzLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI2NzI1MzE0Nzg1NyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzY0OTR9LFwiem9vbVwiOjEzLjg4NjI4NzMyMDE1OTgxLFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTk4NTMzNDU2MjE0LFwibGF0XCI6LTM3LjgzNTgxOTE2MjQzNjYxfSxcInpvb21cIjoxMy42NDkxMTY2MTQ4NzI4MzYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgfSxcblxuICAgIC8qe1xuICAgICAgICBkZWxheToxMjAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doZXJlIHRoZSBDb3VuY2lsXFwncyBzaWduaWZpY2FudCBwcm9wZXJ0eSBob2xkaW5ncyBhcmUgbG9jYXRlZC4nLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZnRoaS16YWp5JyksXG4gICAgICAgIGNvbHVtbjogJ093bmVyc2hpcCBvciBDb250cm9sJyxcbiAgICAgICAgc2hvd0xlZ2VuZDogdHJ1ZSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM5MDMwODcyMzg0NixcImxhdFwiOi0zNy44MTg2MzE2NjA4MTA0MjV9LFwiem9vbVwiOjEzLjUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG5cbiAgICB9LFxuICAgICovXG4gICAgIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RyYW5zcG9ydCwgUG9zdGFsIGFuZCBTdG9yYWdlJyAsXG4gICAgICAgIGNhcHRpb246ICcuLi53aGVyZSB0aGUgdHJhbnNwb3J0LCBwb3N0YWwgYW5kIHN0b3JhZ2Ugc2VjdG9yIGlzIGxvY2F0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Mjc2ODE3NjcxMDcxMixcImxhdFwiOi0zNy44MjkyMTgyNDg1ODcyNDZ9LFwiem9vbVwiOjEyLjcyODQzMTIxNzkxNDkxOSxcImJlYXJpbmdcIjo2OC43MDM4ODMxMjE4NzQ1OCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdIZWFsdGggQ2FyZSBhbmQgU29jaWFsIEFzc2lzdGFuY2UnICxcbiAgICAgICAgY2FwdGlvbjogJ2FuZCB3aGVyZSB0aGUgaGVhbHRoY2FyZSBhbmQgc29jaWFsIGFzc2lzdGFuY2Ugb3JnYW5pc2F0aW9ucyBhcmUgYmFzZWQuJyxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzIzMzExMjE4NTMsXCJsYXRcIjotMzcuODI3MDYzNzQ3NjM4MjR9LFwiem9vbVwiOjEzLjA2Mzc1NzM4NjIzMjI0MixcImJlYXJpbmdcIjoyNi4zNzQ3ODY5MTg1MjMzNCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J0RldmVsb3BtZW50IEFjdGl2aXR5IE1vbml0b3IgKERBTSknLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA3MDAwLCBcbiAgICAgICAgbGluZ2VyOjkwMDAsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQTElFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdEQU0gdHJhY2tzIG1ham9yIHByb2plY3RzIGluIHRoZSBwbGFubmluZyBzdGFnZS4uLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNDAwMCxcbiAgICAgICAgbGluZ2VyOjUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgICAgICAgICBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLnByb2plY3RzIHVuZGVyIGNvbnN0cnVjdGlvbicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBvcHRpb25zOiB7IGVudW1Db2xvcnM6IENvTS5lbnVtQ29sb3JzfSxcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0NPTVBMRVRFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgdGhvc2UgYWxyZWFkeSBjb21wbGV0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbi8vKioqKioqKioqKioqKioqKioqKioqICBcIkJ1dCBkaWQgeW91IGtub3dcIiBkYXRhXG4gICAge1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0J1dCBkaWQgeW91IGtub3cgd2UgaGF2ZSBkYXRhIGFib3V0IGhlYWx0aHksIGFmZm9yZGFibGUgZm9vZCBzZXJ2aWNlcz8nLFxuICAgICAgICBuYW1lOiAnQ29tbXVuaXR5IGZvb2Qgc2VydmljZXMgd2l0aCBvcGVuaW5nIGhvdXJzLCBwdWJsaWMgdHJhbnNwb3J0IGFuZCBwYXJraW5nIG9wdGlvbnMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZm9vZCcsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43eHZrMGszbCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0NvbW11bml0eV9mb29kX3NlcnZpY2VzX3dpdGhfLWE3Y2o5dicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyAvLyBicmlnaHQgb3JhbmdlXG4gICAgICAgICAgICAgICAgLy8ndGV4dC1jb2xvcic6ICdyZ2IoMjQ5LCAyNDMsIDE3OCknLCAvLyBtdXRlZCBvcmFuZ2UsIGEgY2l0eSBmb3IgcGVvcGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05hbWV9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTIsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy9zb3V0aCBNZWxib3VybmUgaXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY4NDQ1MDc2NjM1NDIsXCJsYXRcIjotMzcuODI0NTk5NDkxMDMyNDR9LFwiem9vbVwiOjE0LjAxNjk3OTg2NDQ4MjIzMyxcImJlYXJpbmdcIjotMTEuNTc4MzM2MTY2MTQyODg4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NDczNzMwOTQ0NDY2LFwibGF0XCI6LTM3LjgwNDkwNzE1NTk1MTN9LFwiem9vbVwiOjE1LjM0ODY3NjA5OTkyMjg1MixcImJlYXJpbmdcIjotMTU0LjQ5NzEzMzMyODk3MDEsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0OTIyNTE0MzgzMDcsXCJsYXRcIjotMzcuODAzMTA5NzI3MjcyODF9LFwiem9vbVwiOjE1LjM1ODUwOTc4OTc5MDgwOCxcImJlYXJpbmdcIjotNzguMzk5OTk5OTk5OTk5NyxcInBpdGNoXCI6NTguNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAgXG5cblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEsXG4gICAgICAgIG5hbWU6ICdHYXJiYWdlIGNvbGxlY3Rpb24gem9uZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2hpY2ggbmlnaHQgaXMgYmluIG5pZ2h0PycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdnYXJiYWdlLTEnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAnbGluZS1qb2luJzogJ3JvdW5kJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgNl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDEwXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MTAwMDAsXG4gICAgICAgIC8vIEZhd2tuZXIgUGFya2lzaFxuICAgICAgICBmbHlUbzoge2NlbnRlcjogeyBsbmc6MTQ0Ljk2NTQzNywgbGF0Oi0zNy44MTQyMjV9LCB6b29tOiAxMy43LGJlYXJpbmc6LTMwLjgsIHBpdGNoOjYwfVxuICAgICAgICAvLyBiaXJkcyBleWUsIHpvb21lZCBvdXRcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxMyxiZWFyaW5nOjAscGl0Y2g6MH0sXG4gICAgfSxcblxuXG5cbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbmFtZTogJ0dhcmJhZ2UgY29sbGVjdGlvbiB6b25lcycsXG4gICAgICAgIGNhcHRpb246ICdXaGljaCBuaWdodCBpcyBiaW4gbmlnaHQ/JyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2dhcmJhZ2UtMicsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS44YXJxd21ocicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0dhcmJhZ2VfY29sbGVjdGlvbl96b25lcy05bnl0c2snLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdoc2woMjMsIDk0JSwgNjQlKScsXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tydWJfZGF5fScsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMThdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyMF1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgLy8gYmlyZHMgZXllXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuXG5cbiAgICB7IFxuICAgICAgICBuYW1lOiAnTWVsYm91cm5lIEJpa2UgU2hhcmUgc3RhdGlvbnMsIHdpdGggY3VycmVudCBudW1iZXIgb2YgZnJlZSBhbmQgdXNlZCBkb2NrcyAoZXZlcnkgMTUgbWludXRlcyknLFxuICAgICAgICBjYXB0aW9uOiAnSG93IG1hbnkgYmlrZXMgYXJlIGF2YWlsYWJsZSBhdCBlYWNoIG9mIG91ciBiaWtlLXNoYXJlIHN0YXRpb25zLicsXG4gICAgICAgIGNvbHVtbjogJ05CQmlrZXMnLFxuICAgICAgICBkZWxheTogMjAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgndGR2aC1uOWR2JykgLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnYmljeWNsZS1zaGFyZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1zaXplJzogMixcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05CQmlrZXN9JyxcbiAgICAgICAgICAgICAgICAgICAgLy8ndGV4dC1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtb2Zmc2V0JzogWzEuNSwwXSxcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6MjBcbiAgICAgICAgICAgICAgICAgICAgLy8gZm9yIHNvbWUgcmVhc29uIGl0IGdldHMgc2lsZW50bHkgcmVqZWN0ZWQgd2l0aCB0aGlzOlxuICAgICAgICAgICAgICAgICAgICAvKidpY29uLXNpemUnOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ05CQmlrZXMnLFxuXG4gICAgICAgICAgICAgICAgICAgICAgICBcInN0b3BzXCI6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgWzAsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICAgIFszMCwgM11cblxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICB9Ki9cbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzonaHNsKDIzOSw3MSUsNjYlKScgLy8gbWF0Y2ggdGhlIGJsdWUgYmlrZSBpY29uc1xuICAgICAgICAgICAgICAgICAgICAvLyd0ZXh0LWNvbG9yJzogJ3JnYigwLDE3NCwyMDMpJyAvLyBDb00gcG9wIGJsdWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG5cbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Nzc2ODQxNDU2Mjg4NyxcImxhdFwiOi0zNy44MTk5ODk0ODM3MjgzOX0sXCJ6b29tXCI6MTQuNjcwMjIxNjc2MjM4NTA3LFwiYmVhcmluZ1wiOi01Ny45MzIzMDI1MTczNjExNyxcInBpdGNoXCI6NjB9XG4gICAgfSwgLy8gYmlrZSBzaGFyZVxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJzg0YmYtZGloaScpLFxuICAgICAgICBjYXB0aW9uOiAnUGxhY2VzIHlvdSBjYW4gYm9vayBmb3IgYSB3ZWRkaW5nLi4uJyxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ1dFRERJTkcnLCAnWSddLFxuICAgICAgICBjb2x1bW46ICdXRURESU5HJyxcbiAgICAgICAgZGVsYXk6IDQwMDAsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTY3LjE5OTk5OTk5OTk5OTk5LFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJzg0YmYtZGloaScpLFxuICAgICAgICBjYXB0aW9uOiAnUGxhY2VzIHlvdSBjYW4gYm9vayBmb3IgYSB3ZWRkaW5nLi4ub3Igc29tZXRoaW5nIGVsc2UuJyxcbiAgICAgICAgY29sdW1uOiAnV0VERElORycsXG4gICAgICAgIGRlbGF5OiA2MDAwLFxuICAgICAgICBvcGFjaXR5OiAwLjgsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTczNjI1NTY2OTMzNixcImxhdFwiOi0zNy44MTM5NjI3MTMzNDQzMn0sXCJ6b29tXCI6MTQuNDA1NTkxMDkxNjcxMDU4LFwiYmVhcmluZ1wiOi04MCxcInBpdGNoXCI6NTQuMDAwMDAwMDAwMDAwMDJ9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4uJyxcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3RvaWxldC0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4udGhhdCBhcmUgYWNjZXNzaWJsZSBmb3Igd2hlZWxjaGFpciB1c2VycycsXG4gICAgICAgIGZpbHRlcjogWyc9PScsJ3doZWVsY2hhaXInLCd5ZXMnXSxcbiAgICAgICAgZGVsYXk6IDEsXG4gICAgICAgIGxpbmdlcjo1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd3aGVlbGNoYWlyLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi50aGF0IGFyZSBhY2Nlc3NpYmxlIGZvciB3aGVlbGNoYWlyIHVzZXJzJyxcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIC8vbGluZ2VyOjUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIGZpbHRlcjogWychPScsJ3doZWVsY2hhaXInLCd5ZXMnXSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAndG9pbGV0LTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgXG4gICAgICAgIGNhcHRpb246ICdPdXIgZGF0YSB0ZWxscyB5b3Ugd2hlcmUgeW91ciBkb2cgY2FuIHJvYW0gZnJlZS4nLFxuICAgICAgICBuYW1lOiAnRG9nIFdhbGtpbmcgWm9uZXMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnMicsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuY2x6YXAyamUnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdEb2dfV2Fsa2luZ19ab25lcy0zZmg5cTQnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsIC8vaHNsKDM0MCwgOTclLCA0NSUpXG4gICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAuOFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyc9PScsICdzdGF0dXMnLCAnb2ZmbGVhc2gnXVxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzQ2MDkyNTI4MDY2LFwibGF0XCI6LTM3Ljc5NDUwNjk3NDI3NDIyfSxcInpvb21cIjoxNC45NTU1NDQ5MDMxNDU1NDQsXCJiZWFyaW5nXCI6LTQ0Ljg0MTMyNzQ1MTgzNzI4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2NDcyMDg0MTYxNTI1LFwibGF0XCI6LTM3Ljc5OTQ3NzQ3MjU3NTg0fSxcInpvb21cIjoxNC45MzM5MzE1MjgwMzYwNDgsXCJiZWFyaW5nXCI6LTU3LjY0MTMyNzQ1MTgzNzA4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg2MTM5ODc3MzI5MzIsXCJsYXRcIjotMzcuODM4ODgyNjY1OTYxODd9LFwiem9vbVwiOjE1LjA5NjQxOTU3OTQzMjg3OCxcImJlYXJpbmdcIjotMzAsXCJwaXRjaFwiOjU3LjQ5OTk5OTk5OTk5OTk5fVxuICAgIH0sXG5cblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlcmVcXCdzIGV2ZW4gZXZlcnkgY2FmZSBhbmQgcmVzdGF1cmFudCcsXG4gICAgICAgIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnc2ZyZy16eWdiJyksXG4gICAgICAgIC8vIENCRCBsb29raW5nIHRvd2FyZHMgQ2FybHRvblxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY0MjAwOTk4OTcwNDUsXCJsYXRcIjotMzcuODA0MDc2MjkxNjIxNn0sXCJ6b29tXCI6MTUuNjk1NjYyMTM2MzM5NjUzLFwiYmVhcmluZ1wiOi0yMi41Njk3MTg3NjUwMDYzMSxcInBpdGNoXCI6NjB9LFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDk4Nzg5OTkyOTY0LFwibGF0XCI6LTM3LjgxMDIxMzEwNDA0NzQ5fSxcInpvb21cIjoxNi4wMjc3MzIzMzIwMTY5OSxcImJlYXJpbmdcIjotMTM1LjIxOTc1MzA4NjQxOTgxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAgbGluZ2VyOjI2MDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDxiPjxpPnlvdTwvaT48L2I+IGRvIHdpdGggb3VyIGRhdGE/PGJyLz5GaW5kIHlvdXIgbmV4dCBkYXRhc2V0IGF0IGRhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUnLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICBvcGFjaXR5OjAuMSxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzoge1xuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMCwgJ2hzbCgxNDYsIDUwJSwgMTAlKSddLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzIwMCwgJ2hzbCgxNDYsIDEwMCUsIDYwJSknXVxuICAgICAgICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIC8vJ2hzbCgxNDYsIDEwMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgLy8gZnJvbSBhYmJvdHNmb3JkaXNoXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuM11dLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIGZseVRvOntjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LGJlYXJpbmc6MCx6b29tOjE0LHBpdGNoOjQ1LGR1cmF0aW9uOjIwMDAwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjVdIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMCxcbiAgICAgICAga2VlcFBhaW50OiB0cnVlLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC42XSBdXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDxiPjxpPnlvdTwvaT48L2I+IGRvIHdpdGggb3VyIGRhdGE/PGJyLz5GaW5kIHlvdXIgbmV4dCBkYXRhc2V0IGF0IGRhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUnLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICAvL29wYWNpdHk6MC42LFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjddIF0sXG4gICAgICAgIC8qbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogMC42LFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSwqL1xuICAgICAgICAvL21hdGNoaW5nIHN0YXJ0aW5nIHBvc2l0aW9uP1xuICAgICAgICBmbHlUbzp7Y2VudGVyOntsbmc6MTQ0Ljk1LGxhdDotMzcuODEzfSxiZWFyaW5nOjAsem9vbToxNCxwaXRjaDo0NSxkdXJhdGlvbjoyMDAwMH1cbiAgICAgICAgLy8gZnJvbSBhYmJvdHNmb3JkaXNoXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9XG5dO1xuLypcbmNvbnN0IGNyYXBweUZpbmFsZSA9IFtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gWmUgZ3JhbmRlIGZpbmFsZVxuICAgIHtcbiAgICAgICAgZGVsYXk6MSxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLCAvLyBjYWZlc1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnY2FmZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1zaXplJzogMC41XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LCAgIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjExLCBsaW5nZXI6MjAwMDAsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB7IC8vIHBlZGVzdHJpYW4gc2Vuc29yc1xuICAgICAgICBkZWxheToxLGxpbmdlcjoyMDAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3lnYXctNnJ6cScpLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzY3ODU0NzYxOTQ1LFwibGF0XCI6LTM3LjgwMjM2ODk2MTA2ODk4fSxcInpvb21cIjoxNS4zODkzOTM4NTA3MjU3MzIsXCJiZWFyaW5nXCI6LTE0My41ODQ0Njc1MTI0OTU0LFwicGl0Y2hcIjo2MH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPHU+eW91PC91PiZuYnNwOyBkbyB3aXRoIG91ciBkYXRhPycsXG4gICAgICAgIGRlbGF5OjIwMDAwLFxuICAgICAgICBsaW5nZXI6MzAwMDAsXG4gICAgICAgIG9wYWNpdHk6MC40LFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogMC45LFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICB9LFxuXG5dO1xuKi9cblxuY29uc3QgdW51c2VkID0gW1xue1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1BlZGVzdHJpYW4gc2Vuc29ycyBjb3VudCBmb290IHRyYWZmaWMgZXZlcnkgaG91cicsXG4gICAgICAgIG5hbWU6ICdQZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnMnLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgneWdhdy02cnpxJyksXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNjc4NTQ3NjE5NDUsXCJsYXRcIjotMzcuODAyMzY4OTYxMDY4OTh9LFwiem9vbVwiOjE1LjM4OTM5Mzg1MDcyNTczMixcImJlYXJpbmdcIjotMTQzLjU4NDQ2NzUxMjQ5NTQsXCJwaXRjaFwiOjYwfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfVxuXTtcblxuXG5cblxuXG5leHBvcnQgY29uc3QgZGF0YXNldHMyID0gW1xuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3QgYXBwbGljYXRpb25zJyxcblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBST1ZFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyBhcHByb3ZlZCcgXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nIFxuICAgIH0sIFxuICAgIHsgZGVsYXk6IDUwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSB9LCAvLyBiaWtlIHNoYXJlXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdBY2NvbW1vZGF0aW9uJyB9LFxuICAgIHsgZGVsYXk6IDEwMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIGNvbHVtbjogJ0FydHMgYW5kIFJlY3JlYXRpb24gU2VydmljZXMnIH0sXG4gICAgLy97IGRlbGF5OiAzMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ1JldGFpbCBUcmFkZScgfSxcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0NvbnN0cnVjdGlvbicgfVxuICAgIC8veyBkZWxheTogMTAwMCwgZGF0YXNldDogJ2IzNmota2l5NCcgfSxcbiAgICAvL3sgZGVsYXk6IDIwMDAsIGRhdGFzZXQ6ICcyMzRxLWdnODMnIH1cbl07XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmltcG9ydCB7IG1lbGJvdXJuZVJvdXRlIH0gZnJvbSAnLi9tZWxib3VybmVSb3V0ZSc7XG5cbi8qXG5Db250aW51b3VzbHkgbW92ZXMgdGhlIE1hcGJveCB2YW50YWdlIHBvaW50IGFyb3VuZCBhIEdlb0pTT04tZGVmaW5lZCBwYXRoLlxuKi9cblxuZnVuY3Rpb24gd2hlbkxvYWRlZChtYXAsIGYpIHtcbiAgICBpZiAobWFwLmxvYWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbHJlYWR5IGxvYWRlZC4nKTtcbiAgICAgICAgZigpO1xuICAgIH1cbiAgICBlbHNlIHsgXG4gICAgICAgIGNvbnNvbGUubG9nKCdXYWl0IGZvciBsb2FkJyk7XG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG4gICAgfVxufVxuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5mdW5jdGlvbiBzcGluTW9yZShtYXApIHtcbiAgICBjb25zdCBsYXBUaW1lID0gNjA7IC8vIHRpbWUgaW4gc2Vjb25kcyBmb3Igb25lIGNvbXBsZXRlIHJldm9sdXRpb24uIFNsb3cgaXMgZ29vZCFcbiAgICBtYXAucm90YXRlVG8oKG1hcC5nZXRCZWFyaW5nKCkgKyA0NSkgJSAzNjAsIHtcbiAgICAgICAgZWFzaW5nOiB0ID0+IHQsXG4gICAgICAgIGR1cmF0aW9uOiBsYXBUaW1lIC8gKDM2MCAvIDQ1KSAqIDEwMDBcbiAgICB9LCB7IHNvdXJjZTogJ3NwaW4nIH0pO1xuXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzcGluKG1hcCkge1xuICAgIHNwaW5Nb3JlKG1hcCk7XG5cbiAgICBpZiAoIW1hcC5fc3Bpbm5pbmcpIHtcbiAgICAgICAgbWFwLl9zcGlubmluZyA9IHRydWU7IC8vIG9rIGl0J3MgaGFja3kgYnV0IEkgc2VyaW91c2x5IGNvdWxkbid0IHRoaW5rIG9mIGFub3RoZXIgd2F5IHRvIG1ha2Ugc3VyZSB3ZSBvbmx5IGRvIHRoaXMgb25jZS5cbiAgICAgICAgbWFwLm9uKCdtb3ZlZW5kJywgZSA9PiB7XG4gICAgICAgICAgICBpZiAoZS5zb3VyY2UgPT09ICdzcGluJykge1xuICAgICAgICAgICAgICAgIHNwaW5Nb3JlKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuZXhwb3J0IGNsYXNzIEZsaWdodFBhdGgge1xuXG4gICAgY29uc3RydWN0b3IobWFwLCByb3V0ZSkge1xuICAgICAgICB0aGlzLnJvdXRlID0gcm91dGU7XG4gICAgICAgIGlmICh0aGlzLnJvdXRlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLnJvdXRlID0gbWVsYm91cm5lUm91dGU7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IDAuMDE7XG5cbiAgICAgICAgdGhpcy5wb3NObyA9IDA7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbnMgPSB0aGlzLnJvdXRlLmZlYXR1cmVzLm1hcChmZWF0dXJlID0+ICh7XG4gICAgICAgICAgICBjZW50ZXI6IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICB6b29tOiBkZWYoZmVhdHVyZS5wcm9wZXJ0aWVzLnpvb20sIDE0KSxcbiAgICAgICAgICAgIGJlYXJpbmc6IGZlYXR1cmUucHJvcGVydGllcy5iZWFyaW5nLFxuICAgICAgICAgICAgcGl0Y2g6IGRlZihmZWF0dXJlLnByb3BlcnRpZXMucGl0Y2gsIDYwKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuXG4gICAgICAgIHRoaXMuYmVhcmluZz0wO1xuXG4gICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG5cblxuICAgIC8qdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTYsIC0zNy44XSwgem9vbTogMTUsIGJlYXJpbmc6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTgsIC0zNy44NF0sIHpvb206IDE1LCBiZWFyaW5nOiAxNjAsIHBpdGNoOiAxMH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk5NSwgLTM3LjgyNV0sIHpvb206IDE1LCBiZWFyaW5nOiAtOTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45NywgLTM3LjgyXSwgem9vbTogMTUsIGJlYXJpbmc6IDE0MH1cblxuICAgIF07Ki9cblxuICAgICAgICB0aGlzLm1vdmVDYW1lcmEgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmVDYW1lcmEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLnBvc2l0aW9uc1t0aGlzLnBvc05vXTtcbiAgICAgICAgICAgIHBvcy5zcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICBwb3MuY3VydmUgPSAwLjQ4OyAvLzE7XG4gICAgICAgICAgICBwb3MuZWFzaW5nID0gKHQpID0+IHQ7IC8vIGxpbmVhciBlYXNpbmdcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZseVRvJyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5mbHlUbyhwb3MsIHsgc291cmNlOiAnZmxpZ2h0cGF0aCcgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zTm8gPSAodGhpcy5wb3NObyArIDEpICUgdGhpcy5wb3NpdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21hcC5yb3RhdGVUbyhiZWFyaW5nLCB7IGVhc2luZzogZWFzaW5nIH0pO1xuICAgICAgICAgICAgLy9iZWFyaW5nICs9IDU7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiBcbiAgICAgICAgdGhpcy5tYXAub24oJ21vdmVlbmQnLCAoZGF0YSkgPT4geyBcbiAgICAgICAgICAgIGlmIChkYXRhLnNvdXJjZSA9PT0gJ2ZsaWdodHBhdGgnKSBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8qXG4gICAgICAgIFRoaXMgc2VlbWVkIHRvIGJlIHVucmVsaWFibGUgLSB3YXNuJ3QgYWx3YXlzIGdldHRpbmcgdGhlIGxvYWRlZCBldmVudC5cbiAgICAgICAgd2hlbkxvYWRlZCh0aGlzLm1hcCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRlZC4nKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXAuanVtcFRvKHRoaXMucG9zaXRpb25zWzBdKTtcbiAgICAgICAgdGhpcy5wb3NObyArKztcbiAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIDAgLyp0aGlzLnBhdXNlVGltZSovKTtcblxuICAgICAgICB0aGlzLm1hcC5vbignY2xpY2snLCAoKSA9PiB7IFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSAgICBcblxufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dSYWRpdXNMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIC8vIFRPRE8gcGFkIHRoZSBzbWFsbCBjaXJjbGUgc28gdGhlIHRleHQgc3RhcnRzIGF0IHRoZSBzYW1lIFggcG9zaXRpb24gZm9yIGJvdGhcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6NnB4OyB3aWR0aDogNnB4OyBib3JkZXItcmFkaXVzOiAzcHhcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDIwcHg7IGJvcmRlci1yYWRpdXM6IDEwcHhcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+YDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcblxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDQwLDQwLDI1MClcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6M3B4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDIwLDIwLDQwKVwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD5gOyBcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2F0ZWdvcnlMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIGNvbG9yU3RvcHMsIGNsb3NlSGFuZGxlcikge1xuICAgIGxldCBsZWdlbmRIdG1sID0gXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nICtcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIGNvbG9yU3RvcHNcbiAgICAgICAgICAgIC5zb3J0KChzdG9wYSwgc3RvcGIpID0+IHN0b3BhWzBdLmxvY2FsZUNvbXBhcmUoc3RvcGJbMF0pKSAvLyBzb3J0IG9uIHZhbHVlc1xuICAgICAgICAgICAgLm1hcChzdG9wID0+IGA8c3BhbiBjbGFzcz1cImJveFwiIHN0eWxlPSdiYWNrZ3JvdW5kOiAke3N0b3BbMV19Jz48L3NwYW4+PGxhYmVsPiR7c3RvcFswXX08L2xhYmVsPjxici8+YClcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuaW1wb3J0ICogYXMgbGVnZW5kIGZyb20gJy4vbGVnZW5kJztcbi8qXG5XcmFwcyBhIE1hcGJveCBtYXAgd2l0aCBkYXRhIHZpcyBjYXBhYmlsaXRpZXMgbGlrZSBjaXJjbGUgc2l6ZSBhbmQgY29sb3IsIGFuZCBwb2x5Z29uIGhlaWdodC5cblxuc291cmNlRGF0YSBpcyBhbiBvYmplY3Qgd2l0aDpcbi0gZGF0YUlkXG4tIGxvY2F0aW9uQ29sdW1uXG4tIHRleHRDb2x1bW5zXG4tIG51bWVyaWNDb2x1bW5zXG4tIHJvd3Ncbi0gc2hhcGVcbi0gbWlucywgbWF4c1xuKi9cbmNvbnN0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxubGV0IHVuaXF1ZSA9IDA7XG5cbmV4cG9ydCBjbGFzcyBNYXBWaXMge1xuICAgIGNvbnN0cnVjdG9yKG1hcCwgc291cmNlRGF0YSwgZmlsdGVyLCBmZWF0dXJlSG92ZXJIb29rLCBvcHRpb25zKSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLnNvdXJjZURhdGEgPSBzb3VyY2VEYXRhO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICAgICAgdGhpcy5mZWF0dXJlSG92ZXJIb29rID0gZmVhdHVyZUhvdmVySG9vazsgLy8gZihwcm9wZXJ0aWVzLCBzb3VyY2VEYXRhKVxuICAgICAgICBvcHRpb25zID0gZGVmKG9wdGlvbnMsIHt9KTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0ge1xuICAgICAgICAgICAgY2lyY2xlUmFkaXVzOiBkZWYob3B0aW9ucy5jaXJjbGVSYWRpdXMsIDIwKSxcbiAgICAgICAgICAgIGludmlzaWJsZTogb3B0aW9ucy5pbnZpc2libGUsIC8vIHdoZXRoZXIgdG8gY3JlYXRlIHdpdGggb3BhY2l0eSAwXG4gICAgICAgICAgICBzeW1ib2w6IG9wdGlvbnMuc3ltYm9sLCAvLyBNYXBib3ggc3ltYm9sIHByb3BlcnRpZXMsIG1lYW5pbmcgd2Ugc2hvdyBzeW1ib2wgaW5zdGVhZCBvZiBjaXJjbGVcbiAgICAgICAgICAgIGVudW1Db2xvcnM6IG9wdGlvbnMuZW51bUNvbG9ycyAvLyBvdmVycmlkZSBkZWZhdWx0IGNvbG9yIGNob2ljZXNcbiAgICAgICAgfTtcblxuICAgICAgICAvL3RoaXMub3B0aW9ucy5pbnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gVE9ETyBzaG91bGQgYmUgcGFzc2VkIGEgTGVnZW5kIG9iamVjdCBvZiBzb21lIGtpbmQuXG5cbiAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMubGF5ZXJJZCA9IHNvdXJjZURhdGEuc2hhcGUgKyAnLScgKyBzb3VyY2VEYXRhLmRhdGFJZCArICctJyArICh1bmlxdWUrKyk7XG4gICAgICAgIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCA9IHRoaXMubGF5ZXJJZCArICctaGlnaGxpZ2h0JztcblxuXG4gICAgICAgIFxuICAgICAgICAvLyBDb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBhIE1hcGJveCBkYXRhc291cmNlXG4gICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCBwb2ludERhdGFzZXRUb0dlb0pTT04odGhpcy5zb3VyY2VEYXRhKSApO1xuXG4gICAgICAgICAgICBpZiAoIXRoaXMub3B0aW9ucy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLmZpbHRlciwgZmFsc2UsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuc3ltYm9sLCB0aGlzLmZpbHRlciwgZmFsc2UsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKVxuICAgICAgICAgICAgICAgICAgICAvLyB0cnkgdXNpbmcgYSBjaXJjbGUgaGlnaGxpZ2h0IGV2ZW4gb24gYW4gaWNvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihjaXJjbGVMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgICAgICAgICAvL3RoaXMubWFwLmFkZExheWVyKHN5bWJvbExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5zeW1ib2wsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgXG5cbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGNvbnN0cnVjdCBhIFwicG9seWdvbiBkYXRhc291cmNlXCIsIHRoZSBnZW9tZXRyeSBleGlzdHMgaW4gTWFwYm94IGFscmVhZHlcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9FY29ub215L0VtcGxveW1lbnQtYnktYmxvY2stYnktaW5kdXN0cnkvYjM2ai1raXk0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGFkZCBDTFVFIGJsb2NrcyBwb2x5Z29uIGRhdGFzZXQsIHJpcGUgZm9yIGNob3JvcGxldGhpbmdcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCB7IFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjdG9yJywgXG4gICAgICAgICAgICAgICAgICAgIHVybDogJ21hcGJveDovL29wZW5jb3VuY2lsZGF0YS5hZWRmbXlwOCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIFxuICAgICAgICB9O1xuXG5cblxuICAgIFxuICAgICAgICAvLyBzd2l0Y2ggdmlzdWFsaXNhdGlvbiB0byB1c2luZyB0aGlzIGNvbHVtblxuICAgICAgICB0aGlzLnNldFZpc0NvbHVtbiA9IGZ1bmN0aW9uKGNvbHVtbk5hbWUpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZygnVGhpcyBpcyBhIHN5bWJvbCBsYXllciwgd2UgaWdub3JlIHNldFZpc0NvbHVtbi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9IHNvdXJjZURhdGEudGV4dENvbHVtbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RhdGEgY29sdW1uOiAnICsgdGhpcy5kYXRhQ29sdW1uKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9zZSBidXR0b24gYmVoYXZpb3VyLiBtYXliZT9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBlbnVtIGZpZWxkcyBvbiBwb2x5Z29ucyAobm8gZXhhbXBsZSBjdXJyZW50bHkpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICBsZXQgbWluU2l6ZSA9IDAuMyAqIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICBsZXQgbWF4U2l6ZSA9IHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLXJhZGl1cycsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemUvM10sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgbWF4U2l6ZS8zXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCBtaW5TaXplXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCBtYXhTaXplXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd1JhZGl1c0xlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyAvLyBDYW4ndCBzYWZlbHkgY2xvc2UgbnVtZXJpYyBjb2x1bW5zIHlldC4gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzM5NDlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZVJhZGl1cyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtcmFkaXVzJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1udW1lcmljJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgLy8gZnJvbSBDb2xvckJyZXdlclxuICAgICAgICAgICAgY29uc3QgZW51bUNvbG9ycyA9IGRlZih0aGlzLm9wdGlvbnMuZW51bUNvbG9ycywgWycjMWY3OGI0JywnI2ZiOWE5OScsJyNiMmRmOGEnLCcjMzNhMDJjJywnI2UzMWExYycsJyNmZGJmNmYnLCcjYTZjZWUzJywgJyNmZjdmMDAnLCcjY2FiMmQ2JywnIzZhM2Q5YScsJyNmZmZmOTknLCcjYjE1OTI4J10pO1xuXG4gICAgICAgICAgICBsZXQgZW51bVN0b3BzID0gdGhpcy5zb3VyY2VEYXRhLnNvcnRlZEZyZXF1ZW5jaWVzW2RhdGFDb2x1bW5dLm1hcCgodmFsLGkpID0+IFt2YWwsIGVudW1Db2xvcnNbaSAlIGVudW1Db2xvcnMubGVuZ3RoXV0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogZW51bVN0b3BzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFRPRE8gdGVzdCBjbG9zZSBoYW5kbGVyLCBjdXJyZW50bHkgbm9uIGZ1bmN0aW9uYWwgZHVlIHRvIHBvaW50ZXItZXZlbnRzOm5vbmUgaW4gQ1NTXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0NhdGVnb3J5TGVnZW5kKCcjbGVnZW5kLWVudW0nLCBkYXRhQ29sdW1uLCBlbnVtU3RvcHMsIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVDb2xvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtY29sb3InLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1jb2xvciddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtZW51bScpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgICAgQXBwbGllcyBhIHN0eWxlIHRoYXQgcmVwcmVzZW50cyBudW1lcmljIGRhdGEgdmFsdWVzIGFzIGhlaWdodHMgb2YgZXh0cnVkZWQgcG9seWdvbnMuXG4gICAgICAgICAgICBUT0RPOiBhZGQgcmVtb3ZlUG9seWdvbkhlaWdodFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24taGVpZ2h0JywgIHtcbiAgICAgICAgICAgICAgICAvLyByZW1lbWJlciwgdGhlIGRhdGEgZG9lc24ndCBleGlzdCBpbiB0aGUgcG9seWdvbiBzZXQsIGl0J3MganVzdCBhIGh1Z2UgdmFsdWUgbG9va3VwXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsLy9sb2NhdGlvbkNvbHVtbiwgLy8gdGhlIElEIG9uIHRoZSBhY3R1YWwgZ2VvbWV0cnkgZGF0YXNldFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDEwMDBdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgICAgICAvLy5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ3JnYigwLDAsJyArIE1hdGgucm91bmQoNDAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdoc2woMzQwLDg4JSwnICsgTWF0aC5yb3VuZCgyMCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogNTApICsgJyUpJ10pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWQsIFsnIWluJywgJ2Jsb2NrX2lkJywgLi4uKC8qICMjIyBUT0RPIGdlbmVyYWxpc2UgKi8gXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihyb3cgPT4gcm93W2RhdGFDb2x1bW5dID09PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHJvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSldKTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHRoaXMuc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWRIaWdobGlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnN0cnVjdG9yLi4uXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IChlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IHRoaXMubWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhlLnBvaW50LCB7IGxheWVyczogW3RoaXMubGF5ZXJJZF19KVswXTsgIFxuICAgICAgICAgICAgICAgIGlmIChmICYmIGYgIT09IHRoaXMubGFzdEZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSBmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZUhvdmVySG9vayhmLnByb3BlcnRpZXMsIHRoaXMuc291cmNlRGF0YSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCBmLnByb3BlcnRpZXNbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXV0pOyAvLyB3ZSBkb24ndCBoYXZlIGFueSBvdGhlciByZWxpYWJsZSBrZXk/XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgJ2Jsb2NrX2lkJywgZi5wcm9wZXJ0aWVzLmJsb2NrX2lkXSk7IC8vIGRvbid0IGhhdmUgYSBnZW5lcmFsIHdheSB0byBtYXRjaCBvdGhlciBraW5kcyBvZiBwb2x5Z29uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cblxuXG4gICAgICAgIFxuXG4gICAgfVxufVxuXG4vLyBjb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBHZW9KU09OXG5mdW5jdGlvbiBwb2ludERhdGFzZXRUb0dlb0pTT04oc291cmNlRGF0YSkge1xuICAgIGxldCBkYXRhc291cmNlID0ge1xuICAgICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICAgICAgICBmZWF0dXJlczogW11cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzb3VyY2VEYXRhLnJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkge1xuICAgICAgICAgICAgICAgIGRhdGFzb3VyY2UuZGF0YS5mZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkgeyAvLyBKdXN0IGRvbid0IHB1c2ggaXQgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQmFkIGxvY2F0aW9uOiAke3Jvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXX1gKTsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhc291cmNlO1xufTtcblxuZnVuY3Rpb24gY2lyY2xlTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGZpbHRlciwgaGlnaGxpZ2h0LCBzaXplLCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgIHBhaW50OiB7XG4vLyAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAnaHNsKDIwLCA5NSUsIDUwJSknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdyZ2JhKDAsMCwwLDApJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjk1IDogMCxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC45NSA6IDAsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS1jb2xvcic6IGhpZ2hsaWdodCA/ICd3aGl0ZScgOiAncmdiYSg1MCw1MCw1MCwwLjUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzoge1xuICAgICAgICAgICAgICAgIHN0b3BzOiBoaWdobGlnaHQgPyBbXG4gICAgICAgICAgICAgICAgICAgIFsxMCxzaXplICogMC40XSwgXG4gICAgICAgICAgICAgICAgICAgIFsxNyxzaXplICogMS4wXVxuICAgICAgICAgICAgICAgIF0gOiBbXG4gICAgICAgICAgICAgICAgICAgIFsxMCxzaXplICogMC4yXSwgXG4gICAgICAgICAgICAgICAgICAgIFsxNyxzaXplICogMC41XV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5mdW5jdGlvbiBzeW1ib2xMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgc3ltYm9sLCBmaWx0ZXIsIGhpZ2hsaWdodCwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkXG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuXG4gICAgcmV0LnBhaW50ID0gZGVmKHN5bWJvbC5wYWludCwge30pO1xuICAgIHJldC5wYWludFsnaWNvbi1vcGFjaXR5J10gPSAhaW52aXNpYmxlID8gMC45NSA6IDA7XG5cbiAgICAvL3JldC5sYXlvdXQgPSBkZWYoc3ltYm9sLmxheW91dCwge30pO1xuICAgIGlmIChzeW1ib2wubGF5b3V0KSB7XG4gICAgICAgIGlmIChzeW1ib2wubGF5b3V0Wyd0ZXh0LWZpZWxkJ10gJiYgaW52aXNpYmxlKVxuICAgICAgICAgICAgcmV0LnBhaW50Wyd0ZXh0LW9wYWNpdHknXSA9IDA7XG4gICAgICAgIHJldC5sYXlvdXQgPSBzeW1ib2wubGF5b3V0O1xuICAgIH1cblxuXG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5cbiBmdW5jdGlvbiBwb2x5Z29uTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGludmlzaWJsZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOCA6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJyMwMDMnXG4gICAgICAgICB9LFxuICAgIH07XG59XG4gZnVuY3Rpb24gcG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCBsYXllcklkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ2Jsb2NrX2lkJywgJy0nXVxuICAgIH07XG59XG5cbiIsImV4cG9ydCBjb25zdCBtZWxib3VybmVSb3V0ZSA9IHtcbiAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgXCJmZWF0dXJlc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAzNTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk2Mjg4Mjk5NTYwNTQ3LFxuICAgICAgICAgIC0zNy44MjE3MTc2NDc4Mzk2NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcImJlYXJpbmdcIjogMjcwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45Nzg1MDQxODA5MDgyLFxuICAgICAgICAgIC0zNy44MDgzNTk5MTc0MjM1OTRcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAxODBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk1NTU4NzM4NzA4NDk2LFxuICAgICAgICAgIC0zNy44MDU3ODMwMjEzMTQ1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogOTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk0NDM0MzU2Njg5NDUzLFxuICAgICAgICAgIC0zNy44MTY0OTY4OTM3MjMwOFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICBdXG59OyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtY29sbGVjdGlvbi8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJlZml4ID0gXCIkXCI7XG5cbmZ1bmN0aW9uIE1hcCgpIHt9XG5cbk1hcC5wcm90b3R5cGUgPSBtYXAucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogTWFwLFxuICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiAocHJlZml4ICsga2V5KSBpbiB0aGlzO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzW3ByZWZpeCArIGtleV07XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHRoaXNbcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBwcm9wZXJ0eSA9IHByZWZpeCArIGtleTtcbiAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBrZXlzLnB1c2gocHJvcGVydHkuc2xpY2UoMSkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9LFxuICB2YWx1ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgdmFsdWVzLnB1c2godGhpc1twcm9wZXJ0eV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0sXG4gIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGVudHJpZXMucHVzaCh7a2V5OiBwcm9wZXJ0eS5zbGljZSgxKSwgdmFsdWU6IHRoaXNbcHJvcGVydHldfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH0sXG4gIHNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgKytzaXplO1xuICAgIHJldHVybiBzaXplO1xuICB9LFxuICBlbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24oZikge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBmKHRoaXNbcHJvcGVydHldLCBwcm9wZXJ0eS5zbGljZSgxKSwgdGhpcyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hcChvYmplY3QsIGYpIHtcbiAgdmFyIG1hcCA9IG5ldyBNYXA7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBtYXAuc2V0KGtleSwgdmFsdWUpOyB9KTtcblxuICAvLyBJbmRleCBhcnJheSBieSBudW1lcmljIGluZGV4IG9yIHNwZWNpZmllZCBrZXkgZnVuY3Rpb24uXG4gIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICBvO1xuXG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoaSwgb2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGYobyA9IG9iamVjdFtpXSwgaSwgb2JqZWN0KSwgbyk7XG4gIH1cblxuICAvLyBDb252ZXJ0IG9iamVjdCB0byBtYXAuXG4gIGVsc2UgaWYgKG9iamVjdCkgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgbmVzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIga2V5cyA9IFtdLFxuICAgICAgc29ydEtleXMgPSBbXSxcbiAgICAgIHNvcnRWYWx1ZXMsXG4gICAgICByb2xsdXAsXG4gICAgICBuZXN0O1xuXG4gIGZ1bmN0aW9uIGFwcGx5KGFycmF5LCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpIHtcbiAgICBpZiAoZGVwdGggPj0ga2V5cy5sZW5ndGgpIHJldHVybiByb2xsdXAgIT0gbnVsbFxuICAgICAgICA/IHJvbGx1cChhcnJheSkgOiAoc29ydFZhbHVlcyAhPSBudWxsXG4gICAgICAgID8gYXJyYXkuc29ydChzb3J0VmFsdWVzKVxuICAgICAgICA6IGFycmF5KTtcblxuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGtleSA9IGtleXNbZGVwdGgrK10sXG4gICAgICAgIGtleVZhbHVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdmFsdWVzQnlLZXkgPSBtYXAoKSxcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICByZXN1bHQgPSBjcmVhdGVSZXN1bHQoKTtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodmFsdWVzID0gdmFsdWVzQnlLZXkuZ2V0KGtleVZhbHVlID0ga2V5KHZhbHVlID0gYXJyYXlbaV0pICsgXCJcIikpIHtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbdmFsdWVdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZXNCeUtleS5lYWNoKGZ1bmN0aW9uKHZhbHVlcywga2V5KSB7XG4gICAgICBzZXRSZXN1bHQocmVzdWx0LCBrZXksIGFwcGx5KHZhbHVlcywgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZW50cmllcyhtYXAkJDEsIGRlcHRoKSB7XG4gICAgaWYgKCsrZGVwdGggPiBrZXlzLmxlbmd0aCkgcmV0dXJuIG1hcCQkMTtcbiAgICB2YXIgYXJyYXksIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCAtIDFdO1xuICAgIGlmIChyb2xsdXAgIT0gbnVsbCAmJiBkZXB0aCA+PSBrZXlzLmxlbmd0aCkgYXJyYXkgPSBtYXAkJDEuZW50cmllcygpO1xuICAgIGVsc2UgYXJyYXkgPSBbXSwgbWFwJCQxLmVhY2goZnVuY3Rpb24odiwgaykgeyBhcnJheS5wdXNoKHtrZXk6IGssIHZhbHVlczogZW50cmllcyh2LCBkZXB0aCl9KTsgfSk7XG4gICAgcmV0dXJuIHNvcnRLZXkgIT0gbnVsbCA/IGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gc29ydEtleShhLmtleSwgYi5rZXkpOyB9KSA6IGFycmF5O1xuICB9XG5cbiAgcmV0dXJuIG5lc3QgPSB7XG4gICAgb2JqZWN0OiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU9iamVjdCwgc2V0T2JqZWN0KTsgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApOyB9LFxuICAgIGVudHJpZXM6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBlbnRyaWVzKGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCksIDApOyB9LFxuICAgIGtleTogZnVuY3Rpb24oZCkgeyBrZXlzLnB1c2goZCk7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRLZXlzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRWYWx1ZXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRWYWx1ZXMgPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgcm9sbHVwOiBmdW5jdGlvbihmKSB7IHJvbGx1cCA9IGY7IHJldHVybiBuZXN0OyB9XG4gIH07XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3QoKSB7XG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gc2V0T2JqZWN0KG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gIHJldHVybiBtYXAoKTtcbn1cblxuZnVuY3Rpb24gc2V0TWFwKG1hcCQkMSwga2V5LCB2YWx1ZSkge1xuICBtYXAkJDEuc2V0KGtleSwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBTZXQoKSB7fVxuXG52YXIgcHJvdG8gPSBtYXAucHJvdG90eXBlO1xuXG5TZXQucHJvdG90eXBlID0gc2V0LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNldCxcbiAgaGFzOiBwcm90by5oYXMsXG4gIGFkZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YWx1ZSArPSBcIlwiO1xuICAgIHRoaXNbcHJlZml4ICsgdmFsdWVdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogcHJvdG8ucmVtb3ZlLFxuICBjbGVhcjogcHJvdG8uY2xlYXIsXG4gIHZhbHVlczogcHJvdG8ua2V5cyxcbiAgc2l6ZTogcHJvdG8uc2l6ZSxcbiAgZW1wdHk6IHByb3RvLmVtcHR5LFxuICBlYWNoOiBwcm90by5lYWNoXG59O1xuXG5mdW5jdGlvbiBzZXQob2JqZWN0LCBmKSB7XG4gIHZhciBzZXQgPSBuZXcgU2V0O1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBTZXQpIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IHNldC5hZGQodmFsdWUpOyB9KTtcblxuICAvLyBPdGhlcndpc2UsIGFzc3VtZSBpdOKAmXMgYW4gYXJyYXkuXG4gIGVsc2UgaWYgKG9iamVjdCkge1xuICAgIHZhciBpID0gLTEsIG4gPSBvYmplY3QubGVuZ3RoO1xuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChmKG9iamVjdFtpXSwgaSwgb2JqZWN0KSk7XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG52YXIga2V5cyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgdmFsdWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgdmFsdWVzLnB1c2gobWFwW2tleV0pO1xuICByZXR1cm4gdmFsdWVzO1xufTtcblxudmFyIGVudHJpZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGVudHJpZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgZW50cmllcy5wdXNoKHtrZXk6IGtleSwgdmFsdWU6IG1hcFtrZXldfSk7XG4gIHJldHVybiBlbnRyaWVzO1xufTtcblxuZXhwb3J0cy5uZXN0ID0gbmVzdDtcbmV4cG9ydHMuc2V0ID0gc2V0O1xuZXhwb3J0cy5tYXAgPSBtYXA7XG5leHBvcnRzLmtleXMgPSBrZXlzO1xuZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5leHBvcnRzLmVudHJpZXMgPSBlbnRyaWVzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kaXNwYXRjaC8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9vcCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnRzLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRzdi8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiZFwiLCBcInJldHVybiB7XCIgKyBjb2x1bW5zLm1hcChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgXCI6IGRbXCIgKyBpICsgXCJdXCI7XG4gIH0pLmpvaW4oXCIsXCIpICsgXCJ9XCIpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21Db252ZXJ0ZXIoY29sdW1ucywgZikge1xuICB2YXIgb2JqZWN0ID0gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpO1xuICByZXR1cm4gZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgcmV0dXJuIGYob2JqZWN0KHJvdyksIGksIGNvbHVtbnMpO1xuICB9O1xufVxuXG4vLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS5cbmZ1bmN0aW9uIGluZmVyQ29sdW1ucyhyb3dzKSB7XG4gIHZhciBjb2x1bW5TZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgICAgY29sdW1ucyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7XG4gICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvbHVtbnM7XG59XG5cbmZ1bmN0aW9uIGRzdihkZWxpbWl0ZXIpIHtcbiAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cChcIltcXFwiXCIgKyBkZWxpbWl0ZXIgKyBcIlxcbl1cIiksXG4gICAgICBkZWxpbWl0ZXJDb2RlID0gZGVsaW1pdGVyLmNoYXJDb2RlQXQoMCk7XG5cbiAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikge1xuICAgIHZhciBjb252ZXJ0LCBjb2x1bW5zLCByb3dzID0gcGFyc2VSb3dzKHRleHQsIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgaWYgKGNvbnZlcnQpIHJldHVybiBjb252ZXJ0KHJvdywgaSAtIDEpO1xuICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpO1xuICAgIH0pO1xuICAgIHJvd3MuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikge1xuICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lXG4gICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGVcbiAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93c1xuICAgICAgICBOID0gdGV4dC5sZW5ndGgsXG4gICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleFxuICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/XG5cbiAgICBmdW5jdGlvbiB0b2tlbigpIHtcbiAgICAgIGlmIChJID49IE4pIHJldHVybiBFT0Y7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGZpbGVcbiAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBsaW5lXG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogcXVvdGVzXG4gICAgICB2YXIgaiA9IEksIGM7XG4gICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkge1xuICAgICAgICB2YXIgaSA9IGo7XG4gICAgICAgIHdoaWxlIChpKysgPCBOKSB7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDEpICE9PSAzNCkgYnJlYWs7XG4gICAgICAgICAgICArK2k7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEkgPSBpICsgMjtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgIGlmIChjID09PSAxMykge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpKS5yZXBsYWNlKC9cIlwiL2csIFwiXFxcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZVxuICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgIHZhciBrID0gMTtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspO1xuICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxcblxuICAgICAgICBlbHNlIGlmIChjID09PSAxMykgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSAxMCkgKytJLCArK2s7IH0gLy8gXFxyfFxcclxcblxuICAgICAgICBlbHNlIGlmIChjICE9PSBkZWxpbWl0ZXJDb2RlKSBjb250aW51ZTtcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiwgSSAtIGspO1xuICAgICAgfVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGxhc3QgdG9rZW4gYmVmb3JlIEVPRlxuICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoaik7XG4gICAgfVxuXG4gICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikge1xuICAgICAgdmFyIGEgPSBbXTtcbiAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7XG4gICAgICAgIGEucHVzaCh0KTtcbiAgICAgICAgdCA9IHRva2VuKCk7XG4gICAgICB9XG4gICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7XG4gICAgICByb3dzLnB1c2goYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykge1xuICAgIGlmIChjb2x1bW5zID09IG51bGwpIGNvbHVtbnMgPSBpbmZlckNvbHVtbnMocm93cyk7XG4gICAgcmV0dXJuIFtjb2x1bW5zLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpXS5jb25jYXQocm93cy5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbY29sdW1uXSk7XG4gICAgICB9KS5qb2luKGRlbGltaXRlcik7XG4gICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93KHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/IFwiXCJcbiAgICAgICAgOiByZUZvcm1hdC50ZXN0KHRleHQgKz0gXCJcIikgPyBcIlxcXCJcIiArIHRleHQucmVwbGFjZSgvXFxcIi9nLCBcIlxcXCJcXFwiXCIpICsgXCJcXFwiXCJcbiAgICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgZm9ybWF0Um93czogZm9ybWF0Um93c1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwiLFwiKTtcblxudmFyIGNzdlBhcnNlID0gY3N2LnBhcnNlO1xudmFyIGNzdlBhcnNlUm93cyA9IGNzdi5wYXJzZVJvd3M7XG52YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDtcbnZhciBjc3ZGb3JtYXRSb3dzID0gY3N2LmZvcm1hdFJvd3M7XG5cbnZhciB0c3YgPSBkc3YoXCJcXHRcIik7XG5cbnZhciB0c3ZQYXJzZSA9IHRzdi5wYXJzZTtcbnZhciB0c3ZQYXJzZVJvd3MgPSB0c3YucGFyc2VSb3dzO1xudmFyIHRzdkZvcm1hdCA9IHRzdi5mb3JtYXQ7XG52YXIgdHN2Rm9ybWF0Um93cyA9IHRzdi5mb3JtYXRSb3dzO1xuXG5leHBvcnRzLmRzdkZvcm1hdCA9IGRzdjtcbmV4cG9ydHMuY3N2UGFyc2UgPSBjc3ZQYXJzZTtcbmV4cG9ydHMuY3N2UGFyc2VSb3dzID0gY3N2UGFyc2VSb3dzO1xuZXhwb3J0cy5jc3ZGb3JtYXQgPSBjc3ZGb3JtYXQ7XG5leHBvcnRzLmNzdkZvcm1hdFJvd3MgPSBjc3ZGb3JtYXRSb3dzO1xuZXhwb3J0cy50c3ZQYXJzZSA9IHRzdlBhcnNlO1xuZXhwb3J0cy50c3ZQYXJzZVJvd3MgPSB0c3ZQYXJzZVJvd3M7XG5leHBvcnRzLnRzdkZvcm1hdCA9IHRzdkZvcm1hdDtcbmV4cG9ydHMudHN2Rm9ybWF0Um93cyA9IHRzdkZvcm1hdFJvd3M7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1yZXF1ZXN0LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMsIHJlcXVpcmUoJ2QzLWNvbGxlY3Rpb24nKSwgcmVxdWlyZSgnZDMtZGlzcGF0Y2gnKSwgcmVxdWlyZSgnZDMtZHN2JykpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cycsICdkMy1jb2xsZWN0aW9uJywgJ2QzLWRpc3BhdGNoJywgJ2QzLWRzdiddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pLGdsb2JhbC5kMyxnbG9iYWwuZDMsZ2xvYmFsLmQzKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cyxkM0NvbGxlY3Rpb24sZDNEaXNwYXRjaCxkM0RzdikgeyAndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdCxcbiAgICAgIGV2ZW50ID0gZDNEaXNwYXRjaC5kaXNwYXRjaChcImJlZm9yZXNlbmRcIiwgXCJwcm9ncmVzc1wiLCBcImxvYWRcIiwgXCJlcnJvclwiKSxcbiAgICAgIG1pbWVUeXBlLFxuICAgICAgaGVhZGVycyA9IGQzQ29sbGVjdGlvbi5tYXAoKSxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCxcbiAgICAgIHVzZXIgPSBudWxsLFxuICAgICAgcGFzc3dvcmQgPSBudWxsLFxuICAgICAgcmVzcG9uc2UsXG4gICAgICByZXNwb25zZVR5cGUsXG4gICAgICB0aW1lb3V0ID0gMDtcblxuICAvLyBJZiBJRSBkb2VzIG5vdCBzdXBwb3J0IENPUlMsIHVzZSBYRG9tYWluUmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgJiYgIShcIndpdGhDcmVkZW50aWFsc1wiIGluIHhocilcbiAgICAgICYmIC9eKGh0dHAocyk/Oik/XFwvXFwvLy50ZXN0KHVybCkpIHhociA9IG5ldyBYRG9tYWluUmVxdWVzdDtcblxuICBcIm9ubG9hZFwiIGluIHhoclxuICAgICAgPyB4aHIub25sb2FkID0geGhyLm9uZXJyb3IgPSB4aHIub250aW1lb3V0ID0gcmVzcG9uZFxuICAgICAgOiB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24obykgeyB4aHIucmVhZHlTdGF0ZSA+IDMgJiYgcmVzcG9uZChvKTsgfTtcblxuICBmdW5jdGlvbiByZXNwb25kKG8pIHtcbiAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cywgcmVzdWx0O1xuICAgIGlmICghc3RhdHVzICYmIGhhc1Jlc3BvbnNlKHhocilcbiAgICAgICAgfHwgc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgICAgfHwgc3RhdHVzID09PSAzMDQpIHtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlLmNhbGwocmVxdWVzdCwgeGhyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHhocjtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmNhbGwoXCJsb2FkXCIsIHJlcXVlc3QsIHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBvKTtcbiAgICB9XG4gIH1cblxuICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBldmVudC5jYWxsKFwicHJvZ3Jlc3NcIiwgcmVxdWVzdCwgZSk7XG4gIH07XG5cbiAgcmVxdWVzdCA9IHtcbiAgICBoZWFkZXI6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBuYW1lID0gKG5hbWUgKyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gaGVhZGVycy5nZXQobmFtZSk7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgaGVhZGVycy5yZW1vdmUobmFtZSk7XG4gICAgICBlbHNlIGhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlICsgXCJcIik7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gSWYgbWltZVR5cGUgaXMgbm9uLW51bGwgYW5kIG5vIEFjY2VwdCBoZWFkZXIgaXMgc2V0LCBhIGRlZmF1bHQgaXMgdXNlZC5cbiAgICBtaW1lVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1pbWVUeXBlO1xuICAgICAgbWltZVR5cGUgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZpZXMgd2hhdCB0eXBlIHRoZSByZXNwb25zZSB2YWx1ZSBzaG91bGQgdGFrZTtcbiAgICAvLyBmb3IgaW5zdGFuY2UsIGFycmF5YnVmZmVyLCBibG9iLCBkb2N1bWVudCwgb3IgdGV4dC5cbiAgICByZXNwb25zZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByZXNwb25zZVR5cGU7XG4gICAgICByZXNwb25zZVR5cGUgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB0aW1lb3V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGltZW91dDtcbiAgICAgIHRpbWVvdXQgPSArdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHVzZXIgOiAodXNlciA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgcGFzc3dvcmQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyBwYXNzd29yZCA6IChwYXNzd29yZCA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmeSBob3cgdG8gY29udmVydCB0aGUgcmVzcG9uc2UgY29udGVudCB0byBhIHNwZWNpZmljIHR5cGU7XG4gICAgLy8gY2hhbmdlcyB0aGUgY2FsbGJhY2sgdmFsdWUgb24gXCJsb2FkXCIgZXZlbnRzLlxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmVzcG9uc2UgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIkdFVFwiLCDigKYpLlxuICAgIGdldDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJHRVRcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIlBPU1RcIiwg4oCmKS5cbiAgICBwb3N0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIlBPU1RcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBJZiBjYWxsYmFjayBpcyBub24tbnVsbCwgaXQgd2lsbCBiZSB1c2VkIGZvciBlcnJvciBhbmQgbG9hZCBldmVudHMuXG4gICAgc2VuZDogZnVuY3Rpb24obWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUsIHVzZXIsIHBhc3N3b3JkKTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmICFoZWFkZXJzLmhhcyhcImFjY2VwdFwiKSkgaGVhZGVycy5zZXQoXCJhY2NlcHRcIiwgbWltZVR5cGUgKyBcIiwqLypcIik7XG4gICAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIGhlYWRlcnMuZWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7IH0pO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgeGhyLm92ZXJyaWRlTWltZVR5cGUpIHhoci5vdmVycmlkZU1pbWVUeXBlKG1pbWVUeXBlKTtcbiAgICAgIGlmIChyZXNwb25zZVR5cGUgIT0gbnVsbCkgeGhyLnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICAgIGlmICh0aW1lb3V0ID4gMCkgeGhyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgdHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIGNhbGxiYWNrLmxlbmd0aCA9PT0gMSkgY2FsbGJhY2sgPSBmaXhDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgcmVxdWVzdC5vbihcImVycm9yXCIsIGNhbGxiYWNrKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oeGhyKSB7IGNhbGxiYWNrKG51bGwsIHhocik7IH0pO1xuICAgICAgZXZlbnQuY2FsbChcImJlZm9yZXNlbmRcIiwgcmVxdWVzdCwgeGhyKTtcbiAgICAgIHhoci5zZW5kKGRhdGEgPT0gbnVsbCA/IG51bGwgOiBkYXRhKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBhYm9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gZXZlbnQgPyByZXF1ZXN0IDogdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5mdW5jdGlvbiBmaXhDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyb3IsIHhocikge1xuICAgIGNhbGxiYWNrKGVycm9yID09IG51bGwgPyB4aHIgOiBudWxsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFzUmVzcG9uc2UoeGhyKSB7XG4gIHZhciB0eXBlID0geGhyLnJlc3BvbnNlVHlwZTtcbiAgcmV0dXJuIHR5cGUgJiYgdHlwZSAhPT0gXCJ0ZXh0XCJcbiAgICAgID8geGhyLnJlc3BvbnNlIC8vIG51bGwgb24gZXJyb3JcbiAgICAgIDogeGhyLnJlc3BvbnNlVGV4dDsgLy8gXCJcIiBvbiBlcnJvclxufVxuXG52YXIgdHlwZSA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcmVzcG9uc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiByLmdldChjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xufTtcblxudmFyIGh0bWwgPSB0eXBlKFwidGV4dC9odG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIGpzb24gPSB0eXBlKFwiYXBwbGljYXRpb24vanNvblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIHRleHQgPSB0eXBlKFwidGV4dC9wbGFpblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIHhoci5yZXNwb25zZVRleHQ7XG59KTtcblxudmFyIHhtbCA9IHR5cGUoXCJhcHBsaWNhdGlvbi94bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHZhciB4bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gIGlmICgheG1sKSB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSBlcnJvclwiKTtcbiAgcmV0dXJuIHhtbDtcbn0pO1xuXG52YXIgZHN2ID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCBwYXJzZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCByb3csIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBjYWxsYmFjayA9IHJvdywgcm93ID0gbnVsbDtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpO1xuICAgIHIucm93ID0gZnVuY3Rpb24oXykgeyByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHIucmVzcG9uc2UocmVzcG9uc2VPZihwYXJzZSwgcm93ID0gXykpIDogcm93OyB9O1xuICAgIHIucm93KHJvdyk7XG4gICAgcmV0dXJuIGNhbGxiYWNrID8gci5nZXQoY2FsbGJhY2spIDogcjtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIHJlc3BvbnNlT2YocGFyc2UsIHJvdykge1xuICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCQkMSkge1xuICAgIHJldHVybiBwYXJzZShyZXF1ZXN0JCQxLnJlc3BvbnNlVGV4dCwgcm93KTtcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcInRleHQvY3N2XCIsIGQzRHN2LmNzdlBhcnNlKTtcblxudmFyIHRzdiA9IGRzdihcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIiwgZDNEc3YudHN2UGFyc2UpO1xuXG5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuZXhwb3J0cy5odG1sID0gaHRtbDtcbmV4cG9ydHMuanNvbiA9IGpzb247XG5leHBvcnRzLnRleHQgPSB0ZXh0O1xuZXhwb3J0cy54bWwgPSB4bWw7XG5leHBvcnRzLmNzdiA9IGNzdjtcbmV4cG9ydHMudHN2ID0gdHN2O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiIWZ1bmN0aW9uKGUsbil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bihyZXF1aXJlKFwiZDMtcmVxdWVzdFwiKSk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJkMy1yZXF1ZXN0XCJdLG4pOihlLmQzPWUuZDN8fHt9LGUuZDMucHJvbWlzZT1uKGUuZDMpKX0odGhpcyxmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciB0PWFyZ3VtZW50cy5sZW5ndGgscj1BcnJheSh0KSxvPTA7dD5vO28rKylyW29dPWFyZ3VtZW50c1tvXTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxvKXt2YXIgdT1mdW5jdGlvbihlLG4pe3JldHVybiBlP3ZvaWQgbyhFcnJvcihlKSk6dm9pZCB0KG4pfTtuLmFwcGx5KGUsci5jb25jYXQodSkpfSl9fXZhciB0PXt9O3JldHVybltcImNzdlwiLFwidHN2XCIsXCJqc29uXCIsXCJ4bWxcIixcInRleHRcIixcImh0bWxcIl0uZm9yRWFjaChmdW5jdGlvbihyKXt0W3JdPW4oZSxlW3JdKX0pLHR9KTsiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbnZhciBkMyA9IHJlcXVpcmUoJ2QzLnByb21pc2UnKTtcblxuZnVuY3Rpb24gZGVmKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG59XG4vKlxuTWFuYWdlcyBmZXRjaGluZyBhIGRhdGFzZXQgZnJvbSBTb2NyYXRhIGFuZCBwcmVwYXJpbmcgaXQgZm9yIHZpc3VhbGlzYXRpb24gYnlcbmNvdW50aW5nIGZpZWxkIHZhbHVlIGZyZXF1ZW5jaWVzIGV0Yy4gXG4qL1xuZXhwb3J0IGNsYXNzIFNvdXJjZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKGRhdGFJZCwgYWN0aXZlQ2Vuc3VzWWVhcikge1xuICAgICAgICB0aGlzLmRhdGFJZCA9IGRhdGFJZDtcbiAgICAgICAgdGhpcy5hY3RpdmVDZW5zdXNZZWFyID0gZGVmKGFjdGl2ZUNlbnN1c1llYXIsIDIwMTUpO1xuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSB1bmRlZmluZWQ7ICAvLyBuYW1lIG9mIGNvbHVtbiB3aGljaCBob2xkcyBsYXQvbG9uIG9yIGJsb2NrIElEXG4gICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdW5kZWZpbmVkOyAvLyBpZiB0aGUgZGF0YXNldCB0eXBlIGlzICdwb2ludCcgKHVzZWQgZm9yIHBhcnNpbmcgbG9jYXRpb24gZmllbGQpXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTsgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBudW1lcmljIGRhdGF2aXNcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IFtdOyAgICAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIGVudW0gZGF0YXZpc1xuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBbXTsgICAgICAgICAgLy8gbmFtZXMgb2Ygb3RoZXIgY29sdW1uc1xuICAgICAgICB0aGlzLm1pbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gbWluIGFuZCBtYXggb2YgZWFjaCBudW1lcmljIGNvbHVtblxuICAgICAgICB0aGlzLm1heHMgPSB7fTtcbiAgICAgICAgdGhpcy5mcmVxdWVuY2llcyA9IHt9OyAgICAgICAgICAgIC8vIFxuICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzID0ge307ICAgICAgLy8gbW9zdCBmcmVxdWVudCB2YWx1ZXMgaW4gZWFjaCB0ZXh0IGNvbHVtblxuICAgICAgICB0aGlzLnNoYXBlID0gJ3BvaW50JzsgICAgICAgICAgICAgLy8gcG9pbnQgb3IgcG9seWdvbiAoQ0xVRSBibG9jaylcbiAgICAgICAgdGhpcy5yb3dzID0gdW5kZWZpbmVkOyAgICAgICAgICAgIC8vIHByb2Nlc3NlZCByb3dzXG4gICAgICAgIHRoaXMuYmxvY2tJbmRleCA9IHt9OyAgICAgICAgICAgICAvLyBjYWNoZSBvZiBDTFVFIGJsb2NrIElEc1xuICAgIH1cblxuXG4gICAgY2hvb3NlQ29sdW1uVHlwZXMgKGNvbHVtbnMpIHtcbiAgICAgICAgLy92YXIgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnIHx8IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgLy8gXCJsb2NhdGlvblwiIGFuZCBcInBvaW50XCIgYXJlIGJvdGggcG9pbnQgZGF0YSB0eXBlcywgZXhwcmVzc2VkIGRpZmZlcmVudGx5LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGEgXCJibG9jayBJRFwiIGNhbiBiZSBqb2luZWQgYWdhaW5zdCB0aGUgQ0xVRSBCbG9jayBwb2x5Z29ucyB3aGljaCBhcmUgaW4gTWFwYm94LlxuICAgICAgICBsZXQgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVswXTtcbiAgICAgICAgaWYgKCFsYykge1xuICAgICAgICAgICAgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAobGMuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChsYy5uYW1lID09PSAnQmxvY2sgSUQnKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlID0gJ3BvbHlnb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IGxjLm5hbWU7XG5cbiAgICAgICAgY29sdW1ucyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wgIT09IGxjKTtcblxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ251bWJlcicgJiYgY29sLm5hbWUgIT09ICdMYXRpdHVkZScgJiYgY29sLm5hbWUgIT09ICdMb25naXR1ZGUnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHsgdGhpcy5taW5zW2NvbF0gPSAxZTk7IHRoaXMubWF4c1tjb2xdID0gLTFlOTsgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3RleHQnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF0gPSB7fSk7XG5cbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiB0aGlzLm51bWVyaWNDb2x1bW5zLmluZGV4T2YoY29sKSA8IDAgJiYgdGhpcy50ZXh0Q29sdW1ucy5pbmRleE9mKGNvbCkgPCAwKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGJldHRlciBuYW1lIGFuZCBiZWhhdmlvdXJcbiAgICBmaWx0ZXIocm93KSB7XG4gICAgICAgIC8vIFRPRE8gbW92ZSB0aGlzIHNvbWV3aGVyZSBiZXR0ZXJcbiAgICAgICAgaWYgKHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSA9PT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHJvd1snQ2Vuc3VzIHllYXInXSAmJiByb3dbJ0NlbnN1cyB5ZWFyJ10gIT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cblxuICAgIC8vIGNvbnZlcnQgbnVtZXJpYyBjb2x1bW5zIHRvIG51bWJlcnMgZm9yIGRhdGEgdmlzXG4gICAgY29udmVydFJvdyhyb3cpIHtcblxuICAgICAgICAvLyBjb252ZXJ0IGxvY2F0aW9uIHR5cGVzIChzdHJpbmcpIHRvIFtsb24sIGxhdF0gYXJyYXkuXG4gICAgICAgIGZ1bmN0aW9uIGxvY2F0aW9uVG9Db29yZHMobG9jYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9jYXRpb24pLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgLy8gXCJuZXcgYmFja2VuZFwiIGRhdGFzZXRzIHVzZSBhIFdLVCBmaWVsZCBbUE9JTlQgKGxvbiBsYXQpXSBpbnN0ZWFkIG9mIChsYXQsIGxvbilcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sb2NhdGlvbklzUG9pbnQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJlcGxhY2UoJ1BPSU5UICgnLCAnJykucmVwbGFjZSgnKScsICcnKS5zcGxpdCgnICcpLm1hcChuID0+IE51bWJlcihuKSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobG9jYXRpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFtOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMV0ucmVwbGFjZSgnKScsICcnKSksIE51bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVswXS5yZXBsYWNlKCcoJywgJycpKV07XG4gICAgICAgICAgICAgICAgfSBlbHNlIFxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XG5cbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhgVW5yZWFkYWJsZSBsb2NhdGlvbiAke2xvY2F0aW9ufSBpbiAke3RoaXMubmFtZX0uYCk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcblxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH1cblxuICAgICAgICAvLyBUT0RPIHVzZSBjb2x1bW4uY2FjaGVkQ29udGVudHMuc21hbGxlc3QgYW5kIC5sYXJnZXN0XG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgcm93W2NvbF0gPSBOdW1iZXIocm93W2NvbF0pIDsgLy8gK3Jvd1tjb2xdIGFwcGFyZW50bHkgZmFzdGVyLCBidXQgYnJlYWtzIG9uIHNpbXBsZSB0aGluZ3MgbGlrZSBibGFuayB2YWx1ZXNcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IHdhbnQgdG8gaW5jbHVkZSB0aGUgdG90YWwgdmFsdWVzIGluIFxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdIDwgdGhpcy5taW5zW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1pbnNbY29sXSA9IHJvd1tjb2xdO1xuXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPiB0aGlzLm1heHNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWF4c1tjb2xdID0gcm93W2NvbF07XG4gICAgICAgIH0pO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHZhciB2YWwgPSByb3dbY29sXTtcbiAgICAgICAgICAgIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxdID0gKHRoaXMuZnJlcXVlbmNpZXNbY29sXVt2YWxdIHx8IDApICsgMTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dID0gbG9jYXRpb25Ub0Nvb3Jkcy5jYWxsKHRoaXMsIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSk7XG5cbiAgICAgICAgaWYgKCFyb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pXG4gICAgICAgICAgICByZXR1cm4gbnVsbDsgLy8gc2tpcCB0aGlzIHJvdy5cblxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpIHtcbiAgICAgICAgdmFyIG5ld1RleHRDb2x1bW5zID0gW107XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdID0gT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKVxuICAgICAgICAgICAgICAgIC5zb3J0KCh2YWxhLCB2YWxiKSA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYV0gPCB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYl0gPyAxIDogLTEpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsMTIpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPCAyIHx8IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoID4gMjAgJiYgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3RoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXVsxXV0gPD0gNSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYm9yaW5nIGlmIGFsbCB2YWx1ZXMgdGhlIHNhbWUsIG9yIGlmIHRvbyBtYW55IGRpZmZlcmVudCB2YWx1ZXMgKGFzIGp1ZGdlZCBieSBzZWNvbmQtbW9zdCBjb21tb24gdmFsdWUgYmVpbmcgNSB0aW1lcyBvciBmZXdlcilcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUZXh0Q29sdW1ucy5wdXNoKGNvbCk7IC8vIGhvdyBkbyB5b3Ugc2FmZWx5IGRlbGV0ZSBmcm9tIGFycmF5IHlvdSdyZSBsb29waW5nIG92ZXI/XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IG5ld1RleHRDb2x1bW5zO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29ydGVkRnJlcXVlbmNpZXMpO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHJvd3MgZnJvbSBTb2NyYXRhIChyZXR1cm5zIFByb21pc2UpLiBcIk5ldyBiYWNrZW5kXCIgdmlld3MgZ28gdGhyb3VnaCBhbiBhZGRpdGlvbmFsIHN0ZXAgdG8gZmluZCB0aGUgcmVhbFxuICAgIC8vIEFQSSBlbmRwb2ludC5cbiAgICBsb2FkKCkge1xuICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnLmpzb24nKVxuICAgICAgICAudGhlbihwcm9wcyA9PiB7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBwcm9wcy5uYW1lO1xuICAgICAgICAgICAgaWYgKHByb3BzLm5ld0JhY2tlbmQgJiYgcHJvcHMuY2hpbGRWaWV3cy5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFJZCA9IHByb3BzLmNoaWxkVmlld3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHByb3BzID0+IHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHJldHVybiBkMy5jc3YoJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy9yb3dzLmNzdj9hY2Nlc3NUeXBlPURPV05MT0FEJywgdGhpcy5jb252ZXJ0Um93LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKFwiR290IHJvd3MgZm9yIFwiICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2x5Z29uJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlQmxvY2tJbmRleCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIC5jYXRjaChlID0+IHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQcm9ibGVtIGxvYWRpbmcgJyArIHRoaXMubmFtZSArICcuJyk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoJ1Byb2JsZW0gbG9hZGluZyAnICsgdGhpcy5uYW1lKTtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIENyZWF0ZSBhIGhhc2ggdGFibGUgbG9va3VwIGZyb20gW3llYXIsIGJsb2NrIElEXSB0byBkYXRhc2V0IHJvd1xuICAgIGNvbXB1dGVCbG9ja0luZGV4KCkge1xuICAgICAgICB0aGlzLnJvd3MuZm9yRWFjaCgocm93LCBpbmRleCkgPT4ge1xuICAgICAgICAgICAgaWYgKHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPSB7fTtcbiAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dW3Jvd1snQmxvY2sgSUQnXV0gPSBpbmRleDtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgZ2V0Um93Rm9yQmxvY2soYmxvY2tJZCAvKiBjZW5zdXNfeWVhciAqLykge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzW3RoaXMuYmxvY2tJbmRleFt0aGlzLmFjdGl2ZUNlbnN1c1llYXJdW2Jsb2NrSWRdXTtcbiAgICB9XG5cbiAgICBmaWx0ZXJlZFJvd3MoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3MuZmlsdGVyKHJvdyA9PiByb3dbJ0NlbnN1cyB5ZWFyJ10gPT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciAmJiByb3dbJ0NMVUUgc21hbGwgYXJlYSddICE9PSAnQ2l0eSBvZiBNZWxib3VybmUgdG90YWwnKTtcbiAgICB9XG59Il19

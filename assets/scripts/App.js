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
    'fill-extrusion': 'fill-extrusion-opacity'
};

// returns a value like 'circle-opacity', for a given layer style.
function getOpacityProp(layer) {
    if (layer.layout && layer.layout['text-field']) return 'text-opacity';else return opacityProp[layer.type];
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

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';

    return 'c3gt-hrz6';
}

function showCaption(name, dataId, caption) {
    document.querySelector('#caption h1').innerHTML = /*(_datasetNo || '') + */caption || name || '';
    document.querySelector('#footer .dataset').innerHTML = name || '';

    // TODO reinstate for non-demo mode.
    //document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    //document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
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
        showCaption(dataset.name, dataset.dataId, caption);
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
            style.paint[getOpacityProp(style)] = 0;
        }
        map.addLayer(style);
    } else {
        map.setPaintProperty(dataset.mapbox.id, getOpacityProp(style), def(dataset.opacity, 0.9)); // TODO set right opacity
    }

    if (!invisible) showCaption(dataset.name, dataset.dataId, dataset.caption);
}

var _datasetNo = '';
/* Advance and display the next dataset in our loop */
/*
    Pre-load datasets by:
    - calling the load/display code for the next dataset now, but with opacity 0
    - keeping track of the layer ID
    - if it's present when the dataset gets "shown", 
*/
// TODO clean this up so relationship between "now" and "next" is clearer, no repetition.
function nextDataset(map, datasetNo) {
    function displayDataset(d, invisible) {
        if (d.mapbox) {
            showMapboxDataset(map, d, invisible);
            if (!invisible) {
                showCaption(d.name, undefined, d.caption);
            }
        } else {
            d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options, invisible);
            d.mapvis.setVisColumn(d.column);
            d.layerId = d.mapvis.layerId;
            if (!invisible) {
                showCaption(d.dataset.name, d.dataset.dataId, d.caption);
            }
        }
    }

    _datasetNo = datasetNo;
    var d = _cycleDatasets.datasets[datasetNo],
        nextD = _cycleDatasets.datasets[(datasetNo + 1) % _cycleDatasets.datasets.length];
    //mapvis;

    if (d.layerId) {
        // layer is pre-loaded
        // TODO change 0.9 to something specific for each type
        map.setPaintProperty(d.layerId, getOpacityProp(map.getLayer(d.layerId)), 0.9);
        if (d.mapbox) {
            // TODO remove this repetition
            showCaption(d.name, undefined, d.caption);
        } else {
            showCaption(d.dataset.name, d.dataset.dataId, d.caption);
        }
        //mapvis = d.mapvis; 
    } else displayDataset(d, false);

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
        d.flyTo.duration = d.delay / 3; // so it lands about a third of the way through the dataset's visibility.
        map.flyTo(d.flyTo);
    }

    if (nextD.flyTo) {
        // got to be careful if the data overrides this,
        nextD.flyTo.duration = def(nextD.flyTo.duration, d.delay / 3.0 + nextD.delay / 3.0); // so it lands about a third of the way through the dataset's visibility.
        setTimeout(function () {
            map.flyTo(nextD.flyTo);
        }, d.delay * 2.0 / 3.0);
    }

    setTimeout(function () {
        if (d.mapvis) d.mapvis.remove();

        if (d.mapbox) map.removeLayer(d.mapbox.id);
    }, d.delay + def(d.linger, 0)); // let it linger a bit while the next one is loading.
    setTimeout(function () {
        nextDataset(map, (datasetNo + 1) % _cycleDatasets.datasets.length);
    }, d.delay);
}

/* Pre download all datasets in the loop */
function loadDatasets(map) {
    return Promise.all(_cycleDatasets.datasets.map(function (d) {
        if (d.dataset) return d.dataset.load();else return Promise.resolve();
        // style isn't done loading so we can't add sources. not sure it will actually trigger downloading anyway.
        //return Promise.resolve (addMapboxDataset(map, d));
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
    window.scrollTo(0, 1); // does this hide the address bar?
    var demoMode = window.location.hash === '#demo';
    if (demoMode) {
        // if we did this after the map was loading, call map.resize();
        document.querySelector('#features').style.display = 'none';
        document.querySelector('#legends').style.display = 'none';
    }

    var map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/dark-v9',
        style: 'mapbox://styles/cityofmelbourne/ciz983lqo001w2ss2eou49eos?fresh=2',
        center: [144.95, -37.813],
        zoom: 15, //13
        pitch: 45, // TODO revert for flat
        attributionControl: false
    });
    map.addControl(new mapboxgl.AttributionControl(), 'top-left');
    //map.once('load', () => tweakBasemap(map));
    map.on('moveend', function (e) {
        console.log({
            center: map.getCenter(),
            zoom: map.getZoom(),
            bearing: map.getBearing(),
            pitch: map.getPitch()
        });
    });

    (demoMode ? loadDatasets(map) : loadOneDataset()).then(function (dataset) {

        if (dataset) showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, function () {
            if (demoMode) {
                nextDataset(map, 14);
            } else {
                showDataset(map, dataset);
                // would be nice to support loading mapbox datasets but
                // it's a faff to guess how to style it
                //if (dataset.match(/....-..../))
                //else
            }
            document.querySelectorAll('#loading')[0].outerHTML = '';

            if (demoMode) {
                //var fp = new FlightPath(map);
            }
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

var datasets = exports.datasets = [{
    delay: 10000,
    caption: 'Food services available free or low cost to our community',
    name: 'Community food services with opening hours, public transport and parking options',
    mapbox: {
        id: 'food',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.7xvk0k3l',
        'source-layer': 'Community_food_services_with_-a7cj9v',
        paint: {
            'text-color': 'rgb(249, 243, 178)' },
        layout: {
            'text-field': '{Name}',
            'text-size': 12

        }
    },
    flyTo: { "center": { "lng": 144.97473730944466, "lat": -37.8049071559513 }, "zoom": 15.348676099922852, "bearing": -154.4971333289701, "pitch": 60 }
    //flyTo: {"center":{"lng":144.98492251438307,"lat":-37.80310972727281},"zoom":15.358509789790808,"bearing":-78.3999999999997,"pitch":58.500000000000014}
}, {
    delay: 10000,
    caption: 'Pedestrian sensors count foot traffic every hour',
    name: 'Pedestrian sensor locations',
    dataset: new _sourceData.SourceData('ygaw-6rzq'),
    flyTo: { "center": { "lng": 144.96367854761945, "lat": -37.80236896106898 }, "zoom": 15.389393850725732, "bearing": -143.5844675124954, "pitch": 60 }
}, {
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
        }

    },
    flyTo: { "center": { "lng": 144.95767415418266, "lat": -37.791686619772975 }, "zoom": 15.487337457356691, "bearing": -122.40000000000009, "pitch": 60 }
    //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
}, {
    delay: 5000,
    caption: 'Including gum trees', // add a number
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
    flyTo: { "center": { "lng": 144.94318163755105, "lat": -37.78351953419449 }, "zoom": 15.773488574721082, "bearing": 147.65219382373107, "pitch": 59.99589825769096 }
    //flyTo: {"center":{"lng":144.9427325673331,"lat":-37.78444940593038},"zoom":14.5,"bearing":-163.3102224426674,"pitch":35.500000000000014}
}, {
    delay: 10000,
    //datasetLead: 3000,
    caption: 'And Melbourne\'s famous London plane trees.', // add a number
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
    dataset: new _sourceData.SourceData('b36j-kiy4'),
    column: 'Total employment in block',
    caption: 'The Census of Land Use and Employment (CLUE) reveals where employment is concentrated',
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
    caption: '...where the transport, postal and storage sector is concentrated.',
    flyTo: { "center": { "lng": 144.92768176710712, "lat": -37.829218248587246 }, "zoom": 12.728431217914919, "bearing": 68.70388312187458, "pitch": 60 }
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('c3gt-hrz6'),
    column: 'Health Care and Social Assistance',
    caption: 'and where the healthcare and social assistance organisations are based.',
    flyTo: { "center": { "lng": 144.9572331121853, "lat": -37.82706374763824 }, "zoom": 13.063757386232242, "bearing": 26.37478691852334, "pitch": 60 }
}, {
    delay: 7000,
    linger: 9000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPLIED'],
    caption: 'Development Activity Monitor tracks major projects in the planning stage...',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 4000,
    linger: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: '...projects under construction',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'COMPLETED'],
    caption: '...and those already completed.',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 10000,
    linger: 5000,
    caption: 'Where you can walk your dog off the leash',
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
    flyTo: { "center": { "lng": 144.98613987732932, "lat": -37.83888266596187 }, "zoom": 15.096419579432878, "bearing": -30, "pitch": 57.49999999999999 }
}, {
    delay: 10000,
    name: 'Street addresses',
    caption: 'Every single street address in the municipality',
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
    //mapboxpoints: 'mapbox://cityofmelbourne.3ip3couo'//'Street_addresses-97e5on',
    // north melbourne
    //flyTo: {"center":{"lng":144.91686220714365,"lat":-37.79330210287267},"zoom":18.098035466133457,"bearing":64.79999999999961,"pitch":45}
    // south yarra/prahran ish
    flyTo: { "center": { "lng": 144.984790451856, "lat": -37.83391831182901 }, "zoom": 18, "bearing": -39.99999999999949, "pitch": 60 }
}, {
    delay: 1000,
    name: 'Property boundaries',
    caption: 'And every property boundary',
    // need to zoom in close on this one
    mapbox: {
        id: 'boundaries-repeat',
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
    // just repeat previous view.
    flyTo: { "center": { "lng": 144.984790451856, "lat": -37.83391831182901 }, "zoom": 18, "bearing": -39.99999999999949, "pitch": 60 }
}, {
    delay: 15000,
    name: 'Property boundaries',
    caption: 'And every property boundary',
    // need to zoom in close on this one
    mapbox: {
        id: 'boundaries',
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
    // birds eye
    flyTo: { "center": { lng: 144.953086, lat: -37.807509 }, zoom: 14, bearing: 0, pitch: 0, duration: 10000 }

}, {
    delay: 0,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night',
    // need to zoom in close on this one
    mapbox: {
        id: 'garbage-1',
        type: 'line',
        source: 'mapbox://cityofmelbourne.8arqwmhr',
        'source-layer': 'Garbage_collection_zones-9nytsk',
        paint: {

            'line-color': 'hsl(23, 94%, 64%)',
            'line-width': {
                stops: [[13, 1], [16, 3]]
            }

        }
    },
    linger: 10000
    // birds eye
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
}, {
    delay: 10000,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night',
    // need to zoom in close on this one
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
                stops: [[13, 12], [16, 16]]
            }
        }
    }
    // birds eye
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
}, {
    name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
    caption: 'How many "Blue Bikes" are ready in each station.',
    column: 'NBBikes',
    delay: 10000,
    dataset: new _sourceData.SourceData('tdvh-n9dv'),
    flyTo: { "center": { "lng": 144.97768414562887, "lat": -37.81998948372839 }, "zoom": 14.670221676238507, "bearing": -57.93230251736117, "pitch": 60 }
}, // bike share
{
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...',
    filter: ['==', 'WEDDING', 'Y'],
    delay: 5000,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -67.19999999999999, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...or something else.',
    delay: 5000,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -67.19999999999999, "pitch": 54.00000000000002 }
}, {
    delay: 10000,
    caption: 'The skyline of our city',
    name: 'Building outlines',
    opacity: 0.6,
    mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': 'hsl(146, 100%, 20%)',
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-height': {
                'property': 'height',
                type: 'identity'
            }
        }

    },
    // from abbotsfordish
    flyTo: { "center": { "lng": 144.9725135032764, "lat": -37.807415209051285 }, "zoom": 14.896259153012243, "bearing": -106.40000000000015, "pitch": 60 }
    //from south
    //flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
}, {
    delay: 10000,
    caption: 'Every cafe and restaurant',
    name: 'Cafes and Restaurants only',
    dataset: new _sourceData.SourceData('sfrg-zygb'),
    flyTo: { "center": { "lng": 144.97098789992964, "lat": -37.81021310404749 }, "zoom": 16.02773233201699, "bearing": -135.21975308641981, "pitch": 60 },
    options: {
        symbol: {
            layout: {
                'icon-image': 'cafe-15',
                'icon-allow-overlap': true
            }
        }
    }
}]; /* jshint esnext:true */
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
        circleRadius: def(options.circleRadius, 10),
        invisible: options.invisible, // whether to create with opacity 0
        symbol: options.symbol // Mapbox symbol properties, meaning we show symbol instead of circle
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
            this.map.addLayer(circleLayer(sourceId, this.layerId, this.filter, false, this.options.invisible));
            if (this.featureHoverHook) this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
        } else {
            this.map.addLayer(symbolLayer(sourceId, this.layerId, this.options.symbol, this.filter, false, this.options.invisible));
            if (this.featureHoverHook)
                // try using a circle highlight even on an icon
                this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
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
        if (this.symbol) {
            console.log('This is a symbol layer, we ignore setVisColumn.');
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
            stops: [[{ zoom: 10, value: sourceData.mins[dataColumn] }, 1], [{ zoom: 10, value: sourceData.maxs[dataColumn] }, 3], [{ zoom: 17, value: sourceData.mins[dataColumn] }, minSize], [{ zoom: 17, value: sourceData.maxs[dataColumn] }, maxSize]]
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
        var enumColors = ['#1f78b4', '#fb9a99', '#b2df8a', '#33a02c', '#e31a1c', '#fdbf6f', '#a6cee3', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        var enumStops = this.sourceData.sortedFrequencies[dataColumn].map(function (val, i) {
            return [val, enumColors[i]];
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
            thouse.mousemove = undefined;
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

function circleLayer(sourceId, layerId, filter, highlight, invisible) {
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
                stops: highlight ? [[10, 4], [17, 10]] : [[10, 2], [17, 5]]
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
    if (symbol.layout) ret.layout = symbol.layout;

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
                // "new backend" datasets use a WKT field [POINT (lon lat)] instead of (lat, lon)
                if (this.locationIsPoint) {
                    return location.replace('POINT (', '').replace(')', '').split(' ').map(function (n) {
                        return Number(n);
                    });
                } else if (this.shape === 'point') {
                    //console.log(location.length);
                    return [Number(location.split(', ')[1].replace(')', '')), Number(location.split(', ')[0].replace('(', ''))];
                } else return location;
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
                return d3.csv('https://data.melbourne.vic.gov.au/api/views/' + _this4.dataId + '/rows.csv?accessType=DOWNLOAD', _this4.convertRow.bind(_this4)).then(function (rows) {
                    _this4.rows = rows;
                    _this4.computeSortedFrequencies();
                    if (_this4.shape === 'polygon') _this4.computeBlockIndex();
                    return _this4;
                });
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBTkE7QUFDQTtBQUNBO0FBS0EsUUFBUSxHQUFSO0FBQ0E7QUFDQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7Ozs7Ozs7Ozs7OztBQ0FBO0FBQ0EsSUFBSSxLQUFLLFFBQVEsWUFBUixDQUFUOztBQUVBLFNBQVMsR0FBVCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUI7QUFDZixXQUFPLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUE3QjtBQUNIO0FBQ0Q7Ozs7O0lBSWEsVSxXQUFBLFU7QUFDVCx3QkFBWSxNQUFaLEVBQW9CLGdCQUFwQixFQUFzQztBQUFBOztBQUNsQyxhQUFLLE1BQUwsR0FBYyxNQUFkO0FBQ0EsYUFBSyxnQkFBTCxHQUF3QixJQUFJLGdCQUFKLEVBQXNCLElBQXRCLENBQXhCOztBQUVBLGFBQUssY0FBTCxHQUFzQixTQUF0QixDQUprQyxDQUlBO0FBQ2xDLGFBQUssZUFBTCxHQUF1QixTQUF2QixDQUxrQyxDQUtBO0FBQ2xDLGFBQUssY0FBTCxHQUFzQixFQUF0QixDQU5rQyxDQU1BO0FBQ2xDLGFBQUssV0FBTCxHQUFtQixFQUFuQixDQVBrQyxDQU9BO0FBQ2xDLGFBQUssYUFBTCxHQUFxQixFQUFyQixDQVJrQyxDQVFBO0FBQ2xDLGFBQUssSUFBTCxHQUFZLEVBQVosQ0FUa0MsQ0FTQTtBQUNsQyxhQUFLLElBQUwsR0FBWSxFQUFaO0FBQ0EsYUFBSyxXQUFMLEdBQW1CLEVBQW5CLENBWGtDLENBV0E7QUFDbEMsYUFBSyxpQkFBTCxHQUF5QixFQUF6QixDQVprQyxDQVlBO0FBQ2xDLGFBQUssS0FBTCxHQUFhLE9BQWIsQ0Fia0MsQ0FhQTtBQUNsQyxhQUFLLElBQUwsR0FBWSxTQUFaLENBZGtDLENBY0E7QUFDbEMsYUFBSyxVQUFMLEdBQWtCLEVBQWxCLENBZmtDLENBZUE7QUFDckM7Ozs7MENBR2tCLE8sRUFBUztBQUFBOztBQUN4QjtBQUNBO0FBQ0E7QUFDQSxnQkFBSSxLQUFLLFFBQVEsTUFBUixDQUFlO0FBQUEsdUJBQU8sSUFBSSxZQUFKLEtBQXFCLFVBQXJCLElBQW1DLElBQUksWUFBSixLQUFxQixPQUEvRDtBQUFBLGFBQWYsRUFBdUYsQ0FBdkYsQ0FBVDtBQUNBLGdCQUFJLENBQUMsRUFBTCxFQUFTO0FBQ0wscUJBQUssUUFBUSxNQUFSLENBQWU7QUFBQSwyQkFBTyxJQUFJLElBQUosS0FBYSxVQUFwQjtBQUFBLGlCQUFmLEVBQStDLENBQS9DLENBQUw7QUFDSDs7QUFHRCxnQkFBSSxHQUFHLFlBQUgsS0FBb0IsT0FBeEIsRUFDSSxLQUFLLGVBQUwsR0FBdUIsSUFBdkI7O0FBRUosZ0JBQUksR0FBRyxJQUFILEtBQVksVUFBaEIsRUFBNEI7QUFDeEIscUJBQUssS0FBTCxHQUFhLFNBQWI7QUFDSDs7QUFFRCxpQkFBSyxjQUFMLEdBQXNCLEdBQUcsSUFBekI7O0FBRUEsc0JBQVUsUUFBUSxNQUFSLENBQWU7QUFBQSx1QkFBTyxRQUFRLEVBQWY7QUFBQSxhQUFmLENBQVY7O0FBRUEsaUJBQUssY0FBTCxHQUFzQixRQUNqQixNQURpQixDQUNWO0FBQUEsdUJBQU8sSUFBSSxZQUFKLEtBQXFCLFFBQXJCLElBQWlDLElBQUksSUFBSixLQUFhLFVBQTlDLElBQTRELElBQUksSUFBSixLQUFhLFdBQWhGO0FBQUEsYUFEVSxFQUVqQixHQUZpQixDQUViO0FBQUEsdUJBQU8sSUFBSSxJQUFYO0FBQUEsYUFGYSxDQUF0Qjs7QUFJQSxpQkFBSyxjQUFMLENBQ0ssT0FETCxDQUNhLGVBQU87QUFBRSxzQkFBSyxJQUFMLENBQVUsR0FBVixJQUFpQixHQUFqQixDQUFzQixNQUFLLElBQUwsQ0FBVSxHQUFWLElBQWlCLENBQUMsR0FBbEI7QUFBd0IsYUFEcEU7O0FBR0EsaUJBQUssV0FBTCxHQUFtQixRQUNkLE1BRGMsQ0FDUDtBQUFBLHVCQUFPLElBQUksWUFBSixLQUFxQixNQUE1QjtBQUFBLGFBRE8sRUFFZCxHQUZjLENBRVY7QUFBQSx1QkFBTyxJQUFJLElBQVg7QUFBQSxhQUZVLENBQW5COztBQUlBLGlCQUFLLFdBQUwsQ0FDSyxPQURMLENBQ2E7QUFBQSx1QkFBTyxNQUFLLFdBQUwsQ0FBaUIsR0FBakIsSUFBd0IsRUFBL0I7QUFBQSxhQURiOztBQUdBLGlCQUFLLGFBQUwsR0FBcUIsUUFDaEIsR0FEZ0IsQ0FDWjtBQUFBLHVCQUFPLElBQUksSUFBWDtBQUFBLGFBRFksRUFFaEIsTUFGZ0IsQ0FFVDtBQUFBLHVCQUFPLE1BQUssY0FBTCxDQUFvQixPQUFwQixDQUE0QixHQUE1QixJQUFtQyxDQUFuQyxJQUF3QyxNQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsR0FBekIsSUFBZ0MsQ0FBL0U7QUFBQSxhQUZTLENBQXJCO0FBR0g7O0FBRUQ7Ozs7K0JBQ08sRyxFQUFLO0FBQ1I7QUFDQSxnQkFBSSxJQUFJLGlCQUFKLEtBQTBCLElBQUksaUJBQUosTUFBMkIseUJBQXpELEVBQ0ksT0FBTyxLQUFQO0FBQ0osZ0JBQUksSUFBSSxhQUFKLEtBQXNCLElBQUksYUFBSixNQUF1QixLQUFLLGdCQUF0RCxFQUNJLE9BQU8sS0FBUDtBQUNKLG1CQUFPLElBQVA7QUFDSDs7QUFJRDs7OzttQ0FDVyxHLEVBQUs7QUFBQTs7QUFFWjtBQUNBLHFCQUFTLGdCQUFULENBQTBCLFFBQTFCLEVBQW9DO0FBQ2hDLG9CQUFJLE9BQU8sUUFBUCxFQUFpQixNQUFqQixLQUE0QixDQUFoQyxFQUNJLE9BQU8sSUFBUDtBQUNKO0FBQ0Esb0JBQUksS0FBSyxlQUFULEVBQTBCO0FBQ3RCLDJCQUFPLFNBQVMsT0FBVCxDQUFpQixTQUFqQixFQUE0QixFQUE1QixFQUFnQyxPQUFoQyxDQUF3QyxHQUF4QyxFQUE2QyxFQUE3QyxFQUFpRCxLQUFqRCxDQUF1RCxHQUF2RCxFQUE0RCxHQUE1RCxDQUFnRTtBQUFBLCtCQUFLLE9BQU8sQ0FBUCxDQUFMO0FBQUEscUJBQWhFLENBQVA7QUFDSCxpQkFGRCxNQUVPLElBQUksS0FBSyxLQUFMLEtBQWUsT0FBbkIsRUFBNEI7QUFDL0I7QUFDQSwyQkFBTyxDQUFDLE9BQU8sU0FBUyxLQUFULENBQWUsSUFBZixFQUFxQixDQUFyQixFQUF3QixPQUF4QixDQUFnQyxHQUFoQyxFQUFxQyxFQUFyQyxDQUFQLENBQUQsRUFBbUQsT0FBTyxTQUFTLEtBQVQsQ0FBZSxJQUFmLEVBQXFCLENBQXJCLEVBQXdCLE9BQXhCLENBQWdDLEdBQWhDLEVBQXFDLEVBQXJDLENBQVAsQ0FBbkQsQ0FBUDtBQUNILGlCQUhNLE1BSVAsT0FBTyxRQUFQO0FBRUg7O0FBRUQ7QUFDQSxpQkFBSyxjQUFMLENBQW9CLE9BQXBCLENBQTRCLGVBQU87QUFDL0Isb0JBQUksR0FBSixJQUFXLE9BQU8sSUFBSSxHQUFKLENBQVAsQ0FBWCxDQUQrQixDQUNEO0FBQzlCO0FBQ0Esb0JBQUksSUFBSSxHQUFKLElBQVcsT0FBSyxJQUFMLENBQVUsR0FBVixDQUFYLElBQTZCLE9BQUssTUFBTCxDQUFZLEdBQVosQ0FBakMsRUFDSSxPQUFLLElBQUwsQ0FBVSxHQUFWLElBQWlCLElBQUksR0FBSixDQUFqQjs7QUFFSixvQkFBSSxJQUFJLEdBQUosSUFBVyxPQUFLLElBQUwsQ0FBVSxHQUFWLENBQVgsSUFBNkIsT0FBSyxNQUFMLENBQVksR0FBWixDQUFqQyxFQUNJLE9BQUssSUFBTCxDQUFVLEdBQVYsSUFBaUIsSUFBSSxHQUFKLENBQWpCO0FBQ1AsYUFSRDtBQVNBLGlCQUFLLFdBQUwsQ0FBaUIsT0FBakIsQ0FBeUIsZUFBTztBQUM1QixvQkFBSSxNQUFNLElBQUksR0FBSixDQUFWO0FBQ0EsdUJBQUssV0FBTCxDQUFpQixHQUFqQixFQUFzQixHQUF0QixJQUE2QixDQUFDLE9BQUssV0FBTCxDQUFpQixHQUFqQixFQUFzQixHQUF0QixLQUE4QixDQUEvQixJQUFvQyxDQUFqRTtBQUNILGFBSEQ7O0FBS0EsZ0JBQUksS0FBSyxjQUFULElBQTJCLGlCQUFpQixJQUFqQixDQUFzQixJQUF0QixFQUE0QixJQUFJLEtBQUssY0FBVCxDQUE1QixDQUEzQjs7QUFJQSxtQkFBTyxHQUFQO0FBQ0g7OzttREFFMEI7QUFBQTs7QUFDdkIsZ0JBQUksaUJBQWlCLEVBQXJCO0FBQ0EsaUJBQUssV0FBTCxDQUFpQixPQUFqQixDQUF5QixlQUFPO0FBQzVCLHVCQUFLLGlCQUFMLENBQXVCLEdBQXZCLElBQThCLE9BQU8sSUFBUCxDQUFZLE9BQUssV0FBTCxDQUFpQixHQUFqQixDQUFaLEVBQ3pCLElBRHlCLENBQ3BCLFVBQUMsSUFBRCxFQUFPLElBQVA7QUFBQSwyQkFBZ0IsT0FBSyxXQUFMLENBQWlCLEdBQWpCLEVBQXNCLElBQXRCLElBQThCLE9BQUssV0FBTCxDQUFpQixHQUFqQixFQUFzQixJQUF0QixDQUE5QixHQUE0RCxDQUE1RCxHQUFnRSxDQUFDLENBQWpGO0FBQUEsaUJBRG9CLEVBRXpCLEtBRnlCLENBRW5CLENBRm1CLEVBRWpCLEVBRmlCLENBQTlCOztBQUlBLG9CQUFJLE9BQU8sSUFBUCxDQUFZLE9BQUssV0FBTCxDQUFpQixHQUFqQixDQUFaLEVBQW1DLE1BQW5DLEdBQTRDLENBQTVDLElBQWlELE9BQU8sSUFBUCxDQUFZLE9BQUssV0FBTCxDQUFpQixHQUFqQixDQUFaLEVBQW1DLE1BQW5DLEdBQTRDLEVBQTVDLElBQWtELE9BQUssV0FBTCxDQUFpQixHQUFqQixFQUFzQixPQUFLLGlCQUFMLENBQXVCLEdBQXZCLEVBQTRCLENBQTVCLENBQXRCLEtBQXlELENBQWhLLEVBQW1LO0FBQy9KO0FBQ0EsMkJBQUssYUFBTCxDQUFtQixJQUFuQixDQUF3QixHQUF4QjtBQUVILGlCQUpELE1BSU87QUFDSCxtQ0FBZSxJQUFmLENBQW9CLEdBQXBCLEVBREcsQ0FDdUI7QUFDN0I7QUFHSixhQWREO0FBZUEsaUJBQUssV0FBTCxHQUFtQixjQUFuQjtBQUNBO0FBQ0g7O0FBRUQ7QUFDQTs7OzsrQkFDTztBQUFBOztBQUNILG1CQUFPLEdBQUcsSUFBSCxDQUFRLGlEQUFpRCxLQUFLLE1BQXRELEdBQStELE9BQXZFLEVBQ04sSUFETSxDQUNELGlCQUFTO0FBQ1gsdUJBQUssSUFBTCxHQUFZLE1BQU0sSUFBbEI7QUFDQSxvQkFBSSxNQUFNLFVBQU4sSUFBb0IsTUFBTSxVQUFOLENBQWlCLE1BQWpCLEdBQTBCLENBQWxELEVBQXFEOztBQUVqRCwyQkFBSyxNQUFMLEdBQWMsTUFBTSxVQUFOLENBQWlCLENBQWpCLENBQWQ7O0FBRUEsMkJBQU8sR0FBRyxJQUFILENBQVEsaURBQWlELE9BQUssTUFBOUQsRUFDRixJQURFLENBQ0c7QUFBQSwrQkFBUyxPQUFLLGlCQUFMLENBQXVCLE1BQU0sT0FBN0IsQ0FBVDtBQUFBLHFCQURILENBQVA7QUFFSCxpQkFORCxNQU1PO0FBQ0gsMkJBQUssaUJBQUwsQ0FBdUIsTUFBTSxPQUE3QjtBQUNBLDJCQUFPLFFBQVEsT0FBUixDQUFnQixJQUFoQixDQUFQO0FBQ0g7QUFDSixhQWJNLEVBYUosSUFiSSxDQWFDLFlBQU07QUFDVix1QkFBTyxHQUFHLEdBQUgsQ0FBTyxpREFBaUQsT0FBSyxNQUF0RCxHQUErRCwrQkFBdEUsRUFBdUcsT0FBSyxVQUFMLENBQWdCLElBQWhCLFFBQXZHLEVBQ04sSUFETSxDQUNELGdCQUFRO0FBQ1YsMkJBQUssSUFBTCxHQUFZLElBQVo7QUFDQSwyQkFBSyx3QkFBTDtBQUNBLHdCQUFJLE9BQUssS0FBTCxLQUFlLFNBQW5CLEVBQ0ksT0FBSyxpQkFBTDtBQUNKO0FBQ0gsaUJBUE0sQ0FBUDtBQVFILGFBdEJNLENBQVA7QUF1Qkg7O0FBR0Q7Ozs7NENBQ29CO0FBQUE7O0FBQ2hCLGlCQUFLLElBQUwsQ0FBVSxPQUFWLENBQWtCLFVBQUMsR0FBRCxFQUFNLEtBQU4sRUFBZ0I7QUFDOUIsb0JBQUksT0FBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixNQUF3QyxTQUE1QyxFQUNJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsSUFBc0MsRUFBdEM7QUFDSix1QkFBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixFQUFvQyxJQUFJLFVBQUosQ0FBcEMsSUFBdUQsS0FBdkQ7QUFDSCxhQUpEO0FBS0g7Ozt1Q0FFYyxPLENBQVEsaUIsRUFBbUI7QUFDdEMsbUJBQU8sS0FBSyxJQUFMLENBQVUsS0FBSyxVQUFMLENBQWdCLEtBQUssZ0JBQXJCLEVBQXVDLE9BQXZDLENBQVYsQ0FBUDtBQUNIOzs7dUNBRWM7QUFBQTs7QUFDWCxtQkFBTyxLQUFLLElBQUwsQ0FBVSxNQUFWLENBQWlCO0FBQUEsdUJBQU8sSUFBSSxhQUFKLE1BQXVCLE9BQUssZ0JBQTVCLElBQWdELElBQUksaUJBQUosTUFBMkIseUJBQWxGO0FBQUEsYUFBakIsQ0FBUDtBQUNIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuLy8ndXNlIHN0cmljdCc7XG4vL3ZhciBtYXBib3hnbCA9IHJlcXVpcmUoJ21hcGJveC1nbCcpO1xuaW1wb3J0IHsgU291cmNlRGF0YSB9IGZyb20gJy4vc291cmNlRGF0YSc7XG5pbXBvcnQgeyBGbGlnaHRQYXRoIH0gZnJvbSAnLi9mbGlnaHRQYXRoJztcbmltcG9ydCB7IGRhdGFzZXRzIH0gZnJvbSAnLi9jeWNsZURhdGFzZXRzJztcbmltcG9ydCB7IE1hcFZpcyB9IGZyb20gJy4vbWFwVmlzJztcbmNvbnNvbGUubG9nKGRhdGFzZXRzKTtcbi8vbWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2ljM1JsZG1GblpTSXNJbUVpT2lKamFYaHhjR3MwYnpjd1luTTNNblpzT1dKaWFqVndhSEoySW4wLlJON0t5d01PeExMTm1jVEZmbjBjaWcnO1xubWFwYm94Z2wuYWNjZXNzVG9rZW4gPSAncGsuZXlKMUlqb2lZMmwwZVc5bWJXVnNZbTkxY201bElpd2lZU0k2SW1OcGVqZG9iMkowY3pBd09XUXpNMjF1Ykd0Nk1EVnFhSG9pZlEuNTVZYnFlVEhXTUtfYjZDRUFtb1VsQSc7XG4vKlxuUGVkZXN0cmlhbiBzZW5zb3IgbG9jYXRpb25zOiB5Z2F3LTZyenFcblxuKipUcmVlczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyNmcDM4LXdpeXlcblxuRXZlbnQgYm9va2luZ3M6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jODRiZi1kaWhpXG5CaWtlIHNoYXJlIHN0YXRpb25zOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvI3RkdmgtbjlkdlxuREFNOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvI2doN3MtcWRhOFxuKi9cblxubGV0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxubGV0IHdoZW5NYXBMb2FkZWQgPSAobWFwLCBmKSA9PiBtYXAubG9hZGVkKCkgPyBmKCkgOiBtYXAub25jZSgnbG9hZCcsIGYpO1xuXG5sZXQgY2xvbmUgPSBvYmogPT4gSlNPTi5wYXJzZShKU09OLnN0cmluZ2lmeShvYmopKTtcblxuY29uc3Qgb3BhY2l0eVByb3AgPSB7XG4gICAgICAgICAgICBmaWxsOiAnZmlsbC1vcGFjaXR5JyxcbiAgICAgICAgICAgIGNpcmNsZTogJ2NpcmNsZS1vcGFjaXR5JyxcbiAgICAgICAgICAgIHN5bWJvbDogJ2ljb24tb3BhY2l0eScsXG4gICAgICAgICAgICAnZmlsbC1leHRydXNpb24nOiAnZmlsbC1leHRydXNpb24tb3BhY2l0eSdcbiAgICAgICAgfTtcblxuLy8gcmV0dXJucyBhIHZhbHVlIGxpa2UgJ2NpcmNsZS1vcGFjaXR5JywgZm9yIGEgZ2l2ZW4gbGF5ZXIgc3R5bGUuXG5mdW5jdGlvbiBnZXRPcGFjaXR5UHJvcChsYXllcikge1xuICAgIGlmIChsYXllci5sYXlvdXQgJiYgbGF5ZXIubGF5b3V0Wyd0ZXh0LWZpZWxkJ10pXG4gICAgICAgIHJldHVybiAndGV4dC1vcGFjaXR5JztcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBvcGFjaXR5UHJvcFtsYXllci50eXBlXTtcbn1cblxuLy9mYWxzZSAmJiB3aGVuTWFwTG9hZGVkKCgpID0+XG4vLyAgc2V0VmlzQ29sdW1uKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5sZW5ndGgpXSkpO1xuXG4vLyBUT0RPIGRlY2lkZSBpZiB0aGlzIHNob3VsZCBiZSBpbiBNYXBWaXNcbmZ1bmN0aW9uIHNob3dGZWF0dXJlVGFibGUoZmVhdHVyZSwgc291cmNlRGF0YSwgbWFwdmlzKSB7XG4gICAgZnVuY3Rpb24gcm93c0luQXJyYXkoYXJyYXksIGNsYXNzU3RyKSB7XG4gICAgICAgIHJldHVybiAnPHRhYmxlPicgKyBcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGZlYXR1cmUpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4gXG4gICAgICAgICAgICAgICAgICAgIGFycmF5ID09PSB1bmRlZmluZWQgfHwgYXJyYXkuaW5kZXhPZihrZXkpID49IDApXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT5cbiAgICAgICAgICAgICAgICAgICAgYDx0cj48dGQgJHtjbGFzc1N0cn0+JHtrZXl9PC90ZD48dGQ+JHtmZWF0dXJlW2tleV19PC90ZD48L3RyPmApXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpICsgXG4gICAgICAgICAgICAnPC90YWJsZT4nO1xuICAgICAgICB9XG5cbiAgICBpZiAoZmVhdHVyZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIENhbGxlZCBiZWZvcmUgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIGFueXRoaW5nXG4gICAgICAgIGZlYXR1cmUgPSB7fTtcbiAgICAgICAgc291cmNlRGF0YS50ZXh0Q29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuXG4gICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9seWdvbicpIHsgLy8gVE9ETyBjaGVjayB0aGF0IHRoaXMgaXMgYSBibG9jayBsb29rdXAgY2hvcm9wbGV0aFxuICAgICAgICBmZWF0dXJlID0gc291cmNlRGF0YS5nZXRSb3dGb3JCbG9jayhmZWF0dXJlLmJsb2NrX2lkLCBmZWF0dXJlLmNlbnN1c195cik7ICAgICAgICBcbiAgICB9XG5cblxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZlYXR1cmVzJykuaW5uZXJIVE1MID0gXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBjb2xvdXI8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLnRleHRDb2x1bW5zLCAnY2xhc3M9XCJlbnVtLWZpZWxkXCInKSArIFxuICAgICAgICAnPGg0PkNsaWNrIGEgZmllbGQgdG8gdmlzdWFsaXNlIHdpdGggc2l6ZTwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMsICdjbGFzcz1cIm51bWVyaWMtZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+T3RoZXIgZmllbGRzPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLCAnJyk7XG5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNmZWF0dXJlcyB0ZCcpLmZvckVhY2godGQgPT4gXG4gICAgICAgIHRkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICBtYXB2aXMuc2V0VmlzQ29sdW1uKGUudGFyZ2V0LmlubmVyVGV4dCkgOyAvLyBUT0RPIGhpZ2hsaWdodCB0aGUgc2VsZWN0ZWQgcm93XG4gICAgICAgIH0pKTtcbn1cblxudmFyIGxhc3RGZWF0dXJlO1xuXG5cbmZ1bmN0aW9uIGNob29zZURhdGFzZXQoKSB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywnJyk7XG4gICAgfVxuXG4gICAgLy8ga25vd24gQ0xVRSBibG9jayBkYXRhc2V0cyB0aGF0IHdvcmsgb2tcbiAgICB2YXIgY2x1ZUNob2ljZXMgPSBbXG4gICAgICAgICdiMzZqLWtpeTQnLCAvLyBlbXBsb3ltZW50XG4gICAgICAgICcyMzRxLWdnODMnLCAvLyBmbG9vciBzcGFjZSBieSB1c2UgYnkgYmxvY2tcbiAgICAgICAgJ2MzZ3QtaHJ6NicgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMgLS0gdGhpcyBvbmUgaXMgY29tcGxldGUsIHRoZSBvdGhlcnMgaGF2ZSBnYXBweSBkYXRhIGZvciBjb25maWRlbnRpYWxpdHlcbiAgICBdO1xuXG4gICAgLy8ga25vd24gcG9pbnQgZGF0YXNldHMgdGhhdCB3b3JrIG9rXG4gICAgdmFyIHBvaW50Q2hvaWNlcyA9IFtcbiAgICAgICAgJ2ZwMzgtd2l5eScsIC8vIHRyZWVzXG4gICAgICAgICd5Z2F3LTZyenEnLCAvLyBwZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnNcbiAgICAgICAgJzg0YmYtZGloaScsIC8vIFZlbnVlcyBmb3IgZXZlbnRzXG4gICAgICAgICd0ZHZoLW45ZHYnLCAvLyBMaXZlIGJpa2Ugc2hhcmVcbiAgICAgICAgJ2doN3MtcWRhOCcsIC8vIERBTVxuICAgICAgICAnc2ZyZy16eWdiJywgLy8gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4gICAgICAgICdldzZrLWNoejQnLCAvLyBCaW8gQmxpdHogMjAxNlxuICAgICAgICAnN3ZyZC00YXY1JywgLy8gd2F5ZmluZGluZ1xuICAgICAgICAnc3M3OS12NTU4JywgLy8gYnVzIHN0b3BzXG4gICAgICAgICdtZmZpLW05eW4nLCAvLyBwdWJzXG4gICAgICAgICdzdnV4LWJhZGEnLCAvLyBzb2lsIHRleHR1cmVzIC0gbmljZSBvbmVcbiAgICAgICAgJ3Fqd2MtZjVzaCcsIC8vIGNvbW11bml0eSBmb29kIGd1aWRlIC0gZ29vZFxuICAgICAgICAnZnRoaS16YWp5JywgLy8gcHJvcGVydGllcyBvdmVyICQyLjVtXG4gICAgICAgICd0eDhoLTJqZ2knLCAvLyBhY2Nlc3NpYmxlIHRvaWxldHNcbiAgICAgICAgJzZ1NXotdWJ2aCcsIC8vIGJpY3ljbGUgcGFya2luZ1xuICAgICAgICAvL2JzN24tNXZlaCwgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMuIDEwMCwwMDAgcm93cywgdG9vIGZyYWdpbGUuXG4gICAgICAgIF07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjY2FwdGlvbiBoMScpWzBdLmlubmVySFRNTCA9ICdMb2FkaW5nIHJhbmRvbSBkYXRhc2V0Li4uJztcbiAgICBcbiAgICByZXR1cm4gJ2MzZ3QtaHJ6Nic7XG59XG5cbmZ1bmN0aW9uIHNob3dDYXB0aW9uKG5hbWUsIGRhdGFJZCwgY2FwdGlvbikge1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uIGgxJykuaW5uZXJIVE1MID0gLyooX2RhdGFzZXRObyB8fCAnJykgKyAqLyhjYXB0aW9uIHx8IG5hbWUgfHwgJycpO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmb290ZXIgLmRhdGFzZXQnKS5pbm5lckhUTUwgPSBuYW1lIHx8ICcnO1xuICAgIFxuICAgIC8vIFRPRE8gcmVpbnN0YXRlIGZvciBub24tZGVtbyBtb2RlLlxuICAgIC8vZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NvdXJjZScpLnNldEF0dHJpYnV0ZSgnaHJlZicsICdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvZC8nICsgZGF0YUlkKTtcbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzaGFyZScpLmlubmVySFRNTCA9IGBTaGFyZSB0aGlzOiA8YSBocmVmPVwiaHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH1cIj5odHRwczovL2NpdHktb2YtbWVsYm91cm5lLmdpdGh1Yi5pby9EYXRhM0QvIyR7ZGF0YUlkfTwvYT5gOyAgICBcbiBcbiB9XG5cbiBmdW5jdGlvbiB0d2Vha0Jhc2VtYXAobWFwKSB7XG4gICAgdmFyIHBsYWNlY29sb3IgPSAnIzg4OCc7IC8vJ3JnYigyMDYsIDIxOSwgMTc1KSc7XG4gICAgdmFyIHJvYWRjb2xvciA9ICcjNzc3JzsgLy8ncmdiKDI0MCwgMTkxLCAxNTYpJztcbiAgICBtYXAuZ2V0U3R5bGUoKS5sYXllcnMuZm9yRWFjaChsYXllciA9PiB7XG4gICAgICAgIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA2MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDIwJSknKTtcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNzAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA1MCUpJyk7XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDc4JSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNDUlKScpOyAvLyByb2FkcyBtb3N0bHlcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgOTAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA1MCUpJyk7XG4gICAgfSk7XG4gICAgWydwb2ktcGFya3Mtc2NhbGVyYW5rMScsICdwb2ktcGFya3Mtc2NhbGVyYW5rMScsICdwb2ktcGFya3Mtc2NhbGVyYW5rMSddLmZvckVhY2goaWQgPT4ge1xuICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShpZCwgJ3RleHQtY29sb3InLCAnIzMzMycpO1xuICAgIH0pO1xuXG4gICAgbWFwLnJlbW92ZUxheWVyKCdwbGFjZS1jaXR5LWxnLXMnKTsgLy8gcmVtb3ZlIHRoZSBNZWxib3VybmUgbGFiZWwgaXRzZWxmLlxuXG59XG5cbi8qXG4gIFJlZnJlc2ggdGhlIG1hcCB2aWV3IGZvciB0aGlzIG5ldyBkYXRhc2V0LlxuKi9cbmZ1bmN0aW9uIHNob3dEYXRhc2V0KG1hcCwgZGF0YXNldCwgZmlsdGVyLCBjYXB0aW9uLCBub0ZlYXR1cmVJbmZvLCBvcHRpb25zLCBpbnZpc2libGUpIHtcbiAgICBcbiAgICBvcHRpb25zID0gZGVmKG9wdGlvbnMsIHt9KTtcbiAgICBpZiAoaW52aXNpYmxlKSB7XG4gICAgICAgIG9wdGlvbnMuaW52aXNpYmxlID0gdHJ1ZTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBzaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkLCBjYXB0aW9uKTtcbiAgICB9XG5cbiAgICBsZXQgbWFwdmlzID0gbmV3IE1hcFZpcyhtYXAsIGRhdGFzZXQsIGZpbHRlciwgIW5vRmVhdHVyZUluZm8/IHNob3dGZWF0dXJlVGFibGUgOiBudWxsLCBvcHRpb25zKTtcblxuICAgIHNob3dGZWF0dXJlVGFibGUodW5kZWZpbmVkLCBkYXRhc2V0LCBtYXB2aXMpOyBcbiAgICByZXR1cm4gbWFwdmlzO1xufVxuXG5mdW5jdGlvbiBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCkge1xuICAgIGlmICghbWFwLmdldFNvdXJjZShkYXRhc2V0Lm1hcGJveC5zb3VyY2UpKSB7XG4gICAgICAgIG1hcC5hZGRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlLCB7XG4gICAgICAgICAgICB0eXBlOiAndmVjdG9yJyxcbiAgICAgICAgICAgIHVybDogZGF0YXNldC5tYXBib3guc291cmNlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cbi8qXG4gIFNob3cgYSBkYXRhc2V0IHRoYXQgYWxyZWFkeSBleGlzdHMgb24gTWFwYm94XG4qL1xuZnVuY3Rpb24gc2hvd01hcGJveERhdGFzZXQobWFwLCBkYXRhc2V0LCBpbnZpc2libGUpIHtcbiAgICBhZGRNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCk7XG4gICAgbGV0IHN0eWxlID0gbWFwLmdldExheWVyKGRhdGFzZXQubWFwYm94LmlkKTtcbiAgICBpZiAoIXN0eWxlKSB7XG4gICAgICAgIC8vaWYgKGludmlzaWJsZSlcbiAgICAgICAgICAgIC8vZGF0YXNldC5tYXBib3hcbiAgICAgICAgc3R5bGUgPSBjbG9uZShkYXRhc2V0Lm1hcGJveCk7XG4gICAgICAgIGlmIChpbnZpc2libGUpIHtcbiAgICAgICAgICAgIHN0eWxlLnBhaW50W2dldE9wYWNpdHlQcm9wKHN0eWxlKV0gPSAwO1xuICAgICAgICB9XG4gICAgICAgIG1hcC5hZGRMYXllcihzdHlsZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoZGF0YXNldC5tYXBib3guaWQsIGdldE9wYWNpdHlQcm9wKHN0eWxlKSwgZGVmKGRhdGFzZXQub3BhY2l0eSwwLjkpKTsgLy8gVE9ETyBzZXQgcmlnaHQgb3BhY2l0eVxuICAgIH1cblxuICAgIGlmICghaW52aXNpYmxlKSBcbiAgICAgICAgc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgZGF0YXNldC5jYXB0aW9uKTtcbn1cblxubGV0IF9kYXRhc2V0Tm89Jyc7XG4vKiBBZHZhbmNlIGFuZCBkaXNwbGF5IHRoZSBuZXh0IGRhdGFzZXQgaW4gb3VyIGxvb3AgKi9cbiAgICAvKlxuICAgICAgICBQcmUtbG9hZCBkYXRhc2V0cyBieTpcbiAgICAgICAgLSBjYWxsaW5nIHRoZSBsb2FkL2Rpc3BsYXkgY29kZSBmb3IgdGhlIG5leHQgZGF0YXNldCBub3csIGJ1dCB3aXRoIG9wYWNpdHkgMFxuICAgICAgICAtIGtlZXBpbmcgdHJhY2sgb2YgdGhlIGxheWVyIElEXG4gICAgICAgIC0gaWYgaXQncyBwcmVzZW50IHdoZW4gdGhlIGRhdGFzZXQgZ2V0cyBcInNob3duXCIsIFxuICAgICovXG4gICAgLy8gVE9ETyBjbGVhbiB0aGlzIHVwIHNvIHJlbGF0aW9uc2hpcCBiZXR3ZWVuIFwibm93XCIgYW5kIFwibmV4dFwiIGlzIGNsZWFyZXIsIG5vIHJlcGV0aXRpb24uXG5mdW5jdGlvbiBuZXh0RGF0YXNldChtYXAsIGRhdGFzZXRObykge1xuICAgIGZ1bmN0aW9uIGRpc3BsYXlEYXRhc2V0KGQsIGludmlzaWJsZSkge1xuICAgICAgICBpZiAoZC5tYXBib3gpIHtcbiAgICAgICAgICAgIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZCwgaW52aXNpYmxlKTtcbiAgICAgICAgICAgIGlmICghaW52aXNpYmxlKSB7XG4gICAgICAgICAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBkLm1hcHZpcyA9IHNob3dEYXRhc2V0KG1hcCwgZC5kYXRhc2V0LCBkLmZpbHRlciwgZC5jYXB0aW9uLCB0cnVlLCBkLm9wdGlvbnMsICBpbnZpc2libGUpO1xuICAgICAgICAgICAgZC5tYXB2aXMuc2V0VmlzQ29sdW1uKGQuY29sdW1uKTtcbiAgICAgICAgICAgIGQubGF5ZXJJZCA9IGQubWFwdmlzLmxheWVySWQ7XG4gICAgICAgICAgICBpZiAoIWludmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHNob3dDYXB0aW9uKGQuZGF0YXNldC5uYW1lLCBkLmRhdGFzZXQuZGF0YUlkLCBkLmNhcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2RhdGFzZXRObyA9IGRhdGFzZXRObztcbiAgICBsZXQgZCA9IGRhdGFzZXRzW2RhdGFzZXROb10sIFxuICAgICAgICBuZXh0RCA9IGRhdGFzZXRzWyhkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aF07XG4gICAgICAgIC8vbWFwdmlzO1xuXG4gICAgaWYgKGQubGF5ZXJJZCkge1xuICAgICAgICAvLyBsYXllciBpcyBwcmUtbG9hZGVkXG4gICAgICAgIC8vIFRPRE8gY2hhbmdlIDAuOSB0byBzb21ldGhpbmcgc3BlY2lmaWMgZm9yIGVhY2ggdHlwZVxuICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShkLmxheWVySWQsIGdldE9wYWNpdHlQcm9wKG1hcC5nZXRMYXllcihkLmxheWVySWQpKSwgMC45KTtcbiAgICAgICAgaWYgKGQubWFwYm94KSB7IC8vIFRPRE8gcmVtb3ZlIHRoaXMgcmVwZXRpdGlvblxuICAgICAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzaG93Q2FwdGlvbihkLmRhdGFzZXQubmFtZSwgZC5kYXRhc2V0LmRhdGFJZCwgZC5jYXB0aW9uKTtcbiAgICAgICAgfVxuICAgICAgICAvL21hcHZpcyA9IGQubWFwdmlzOyBcbiAgICB9IGVsc2UgXG4gICAgICAgIGRpc3BsYXlEYXRhc2V0KGQsIGZhbHNlKTtcblxuICAgIC8vIGxvYWQsIGJ1dCBkb24ndCBzaG93LCBuZXh0IG9uZS4gLy8gQ29tbWVudCBvdXQgdGhlIG5leHQgbGluZSB0byBub3QgZG8gdGhlIHByZS1sb2FkaW5nIHRoaW5nLlxuICAgIGRpc3BsYXlEYXRhc2V0KG5leHRELCB0cnVlKTtcblxuICAgIGlmIChkLnNob3dMZWdlbmQpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gV2UncmUgYWltaW5nIHRvIGFycml2ZSBhdCB0aGUgdmlld3BvaW50IDEvMyBvZiB0aGUgd2F5IHRocm91Z2ggdGhlIGRhdGFzZXQncyBhcHBlYXJhbmNlXG4gICAgLy8gYW5kIGxlYXZlIDIvMyBvZiB0aGUgd2F5IHRocm91Z2guXG4gICAgaWYgKGQuZmx5VG8gJiYgIW1hcC5pc01vdmluZygpKSB7XG4gICAgICAgIGQuZmx5VG8uZHVyYXRpb24gPSBkLmRlbGF5LzM7Ly8gc28gaXQgbGFuZHMgYWJvdXQgYSB0aGlyZCBvZiB0aGUgd2F5IHRocm91Z2ggdGhlIGRhdGFzZXQncyB2aXNpYmlsaXR5LlxuICAgICAgICBtYXAuZmx5VG8oZC5mbHlUbyk7XG4gICAgfVxuICAgIFxuICAgIGlmIChuZXh0RC5mbHlUbykge1xuICAgICAgICAvLyBnb3QgdG8gYmUgY2FyZWZ1bCBpZiB0aGUgZGF0YSBvdmVycmlkZXMgdGhpcyxcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkZWYobmV4dEQuZmx5VG8uZHVyYXRpb24sIGQuZGVsYXkvMy4wICsgbmV4dEQuZGVsYXkvMy4wKTsvLyBzbyBpdCBsYW5kcyBhYm91dCBhIHRoaXJkIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIHZpc2liaWxpdHkuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbWFwLmZseVRvKG5leHRELmZseVRvKTtcbiAgICAgICAgfSwgZC5kZWxheSAqIDIuMC8zLjApO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoZC5tYXB2aXMpXG4gICAgICAgICAgICBkLm1hcHZpcy5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChkLm1hcGJveClcbiAgICAgICAgICAgIG1hcC5yZW1vdmVMYXllcihkLm1hcGJveC5pZCk7XG5cbiAgICAgICAgXG4gICAgfSwgZC5kZWxheSArIGRlZihkLmxpbmdlciwgMCkpOyAvLyBsZXQgaXQgbGluZ2VyIGEgYml0IHdoaWxlIHRoZSBuZXh0IG9uZSBpcyBsb2FkaW5nLlxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBuZXh0RGF0YXNldChtYXAsIChkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aCk7XG4gICAgfSwgZC5kZWxheSApO1xufVxuXG4vKiBQcmUgZG93bmxvYWQgYWxsIGRhdGFzZXRzIGluIHRoZSBsb29wICovXG5mdW5jdGlvbiBsb2FkRGF0YXNldHMobWFwKSB7XG4gICAgcmV0dXJuIFByb21pc2VcbiAgICAgICAgLmFsbChkYXRhc2V0cy5tYXAoZCA9PiB7IFxuICAgICAgICAgICAgaWYgKGQuZGF0YXNldClcbiAgICAgICAgICAgICAgICByZXR1cm4gZC5kYXRhc2V0LmxvYWQoKTtcbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgLy8gc3R5bGUgaXNuJ3QgZG9uZSBsb2FkaW5nIHNvIHdlIGNhbid0IGFkZCBzb3VyY2VzLiBub3Qgc3VyZSBpdCB3aWxsIGFjdHVhbGx5IHRyaWdnZXIgZG93bmxvYWRpbmcgYW55d2F5LlxuICAgICAgICAgICAgICAgIC8vcmV0dXJuIFByb21pc2UucmVzb2x2ZSAoYWRkTWFwYm94RGF0YXNldChtYXAsIGQpKTtcbiAgICAgICAgfSkpLnRoZW4oKCkgPT4gZGF0YXNldHNbMF0uZGF0YXNldCk7XG59XG5cbmZ1bmN0aW9uIGxvYWRPbmVEYXRhc2V0KCkge1xuICAgIGxldCBkYXRhc2V0ID0gY2hvb3NlRGF0YXNldCgpO1xuICAgIHJldHVybiBuZXcgU291cmNlRGF0YShkYXRhc2V0KS5sb2FkKCk7XG4gICAgLyppZiAoZGF0YXNldC5tYXRjaCgvLi4uLi0uLi4uLykpXG4gICAgICAgIFxuICAgIGVsc2VcbiAgICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSh0cnVlKTsqL1xufVxuXG4oZnVuY3Rpb24gc3RhcnQoKSB7XG4gICAgd2luZG93LnNjcm9sbFRvKDAsMSk7IC8vIGRvZXMgdGhpcyBoaWRlIHRoZSBhZGRyZXNzIGJhcj9cbiAgICBsZXQgZGVtb01vZGUgPSB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gJyNkZW1vJztcbiAgICBpZiAoZGVtb01vZGUpIHtcbiAgICAgICAgLy8gaWYgd2UgZGlkIHRoaXMgYWZ0ZXIgdGhlIG1hcCB3YXMgbG9hZGluZywgY2FsbCBtYXAucmVzaXplKCk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgICAgICAgXG4gICAgfVxuXG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9MicsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDE1LC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCgpLCAndG9wLWxlZnQnKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywgKCkgPT4gdHdlYWtCYXNlbWFwKG1hcCkpO1xuICAgIG1hcC5vbignbW92ZWVuZCcsIGU9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgICAgIGNlbnRlcjogbWFwLmdldENlbnRlcigpLFxuICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIGJlYXJpbmc6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICBwaXRjaDogbWFwLmdldFBpdGNoKClcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAoZGVtb01vZGUgPyBsb2FkRGF0YXNldHMobWFwKSA6IGxvYWRPbmVEYXRhc2V0KCkpXG4gICAgLnRoZW4oZGF0YXNldCA9PiB7XG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YXNldCkgXG4gICAgICAgICAgICBzaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkKTtcblxuICAgICAgICB3aGVuTWFwTG9hZGVkKG1hcCwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAxNCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dEYXRhc2V0KG1hcCwgZGF0YXNldCk7XG4gICAgICAgICAgICAgICAgLy8gd291bGQgYmUgbmljZSB0byBzdXBwb3J0IGxvYWRpbmcgbWFwYm94IGRhdGFzZXRzIGJ1dFxuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBmYWZmIHRvIGd1ZXNzIGhvdyB0byBzdHlsZSBpdFxuICAgICAgICAgICAgICAgIC8vaWYgKGRhdGFzZXQubWF0Y2goLy4uLi4tLi4uLi8pKVxuICAgICAgICAgICAgICAgIC8vZWxzZVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbG9hZGluZycpWzBdLm91dGVySFRNTD0nJztcblxuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgLy92YXIgZnAgPSBuZXcgRmxpZ2h0UGF0aChtYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG5cbiAgICB9KTtcbn0pKCk7XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbi8qXG5cbkRhdGFzZXQgcnVuIG9yZGVyXG4tIGJ1aWxkaW5ncyAoM0QpXG4tIHRyZWVzIChmcm9tIG15IG9wZW50cmVlcyBhY2NvdW50KVxuLSBjYWZlcyAoY2l0eSBvZiBtZWxib3VybmUsIHN0eWxlZCB3aXRoIGNvZmZlZSBzeW1ib2wpXG4tIGJhcnMgKHNpbWlsYXIpXG4tIGdhcmJhZ2UgY29sbGVjdGlvbiB6b25lc1xuLSBkb2cgd2Fsa2luZyB6b25lc1xuLSBDTFVFICgzRCBibG9ja3MpXG4tLSBidXNpbmVzcyBlc3RhYmxpc2htZW50cyBwZXIgYmxvY2tcbi0tLSB2YXJpb3VzIHR5cGVzLCB0aGVuIHRvdGFsXG4tLSBlbXBsb3ltZW50ICh2YXJpb3VzIHR5cGVzIHdpdGggc3BlY2lmaWMgdmFudGFnZSBwb2ludHMgLSBiZXdhcmUgdGhhdCBub3QgYWxsIGRhdGEgaW5jbHVkZWQ7IHRoZW4gdG90YWwpXG4tLSBmbG9vciB1c2UgKGRpdHRvKVxuXG5cblxuXG5NaW5pbXVtXG4tIGZsb2F0eSBjYW1lcmFzXG4tIGNsdWUgM0QsXG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcblxuSGVhZGVyOlxuLSBkYXRhc2V0IG5hbWVcbi0gY29sdW1uIG5hbWVcblxuRm9vdGVyOiBkYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1XG5cbkNvTSBsb2dvXG5cblxuTWVkaXVtXG4tIE11bmljaXBhbGl0eSBib3VuZGFyeSBvdmVybGFpZFxuXG5TdHJldGNoIGdvYWxzXG4tIG92ZXJsYXkgYSB0ZXh0IGxhYmVsIG9uIGEgYnVpbGRpbmcvY2x1ZWJsb2NrIChlZywgRnJlZW1hc29ucyBIb3NwaXRhbCAtIHRvIHNob3cgd2h5IHNvIG11Y2ggaGVhbHRoY2FyZSlcblxuXG5cblxuXG4qL1xuXG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcblxuZXhwb3J0IGNvbnN0IGRhdGFzZXRzID0gW1xuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdGb29kIHNlcnZpY2VzIGF2YWlsYWJsZSBmcmVlIG9yIGxvdyBjb3N0IHRvIG91ciBjb21tdW5pdHknLFxuICAgICAgICBuYW1lOiAnQ29tbXVuaXR5IGZvb2Qgc2VydmljZXMgd2l0aCBvcGVuaW5nIGhvdXJzLCBwdWJsaWMgdHJhbnNwb3J0IGFuZCBwYXJraW5nIG9wdGlvbnMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZm9vZCcsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43eHZrMGszbCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0NvbW11bml0eV9mb29kX3NlcnZpY2VzX3dpdGhfLWE3Y2o5dicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ3JnYigyNDksIDI0MywgMTc4KScsIC8vIGEgY2l0eSBmb3IgcGVvcGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05hbWV9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTIsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzQ3MzczMDk0NDQ2NixcImxhdFwiOi0zNy44MDQ5MDcxNTU5NTEzfSxcInpvb21cIjoxNS4zNDg2NzYwOTk5MjI4NTIsXCJiZWFyaW5nXCI6LTE1NC40OTcxMzMzMjg5NzAxLFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NDkyMjUxNDM4MzA3LFwibGF0XCI6LTM3LjgwMzEwOTcyNzI3MjgxfSxcInpvb21cIjoxNS4zNTg1MDk3ODk3OTA4MDgsXCJiZWFyaW5nXCI6LTc4LjM5OTk5OTk5OTk5OTcsXCJwaXRjaFwiOjU4LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdQZWRlc3RyaWFuIHNlbnNvcnMgY291bnQgZm9vdCB0cmFmZmljIGV2ZXJ5IGhvdXInLFxuICAgICAgICBuYW1lOiAnUGVkZXN0cmlhbiBzZW5zb3IgbG9jYXRpb25zJyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3lnYXctNnJ6cScpLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzY3ODU0NzYxOTQ1LFwibGF0XCI6LTM3LjgwMjM2ODk2MTA2ODk4fSxcInpvb21cIjoxNS4zODkzOTM4NTA3MjU3MzIsXCJiZWFyaW5nXCI6LTE0My41ODQ0Njc1MTI0OTU0LFwicGl0Y2hcIjo2MH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBoZWFsdGggYW5kIHR5cGUgb2YgZWFjaCB0cmVlIGluIG91ciB1cmJhbiBmb3Jlc3QnLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuNlxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzY3NDE1NDE4MjY2LFwibGF0XCI6LTM3Ljc5MTY4NjYxOTc3Mjk3NX0sXCJ6b29tXCI6MTUuNDg3MzM3NDU3MzU2NjkxLFwiYmVhcmluZ1wiOi0xMjIuNDAwMDAwMDAwMDAwMDksXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0luY2x1ZGluZyBndW0gdHJlZXMnLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ3VtdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ0V1Y2FseXB0dXMnLCAnQ29yeW1iaWEnLCAnQW5nb3Bob3JhJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljg0NzM3NDg4Njg5MDcsXCJsYXRcIjotMzcuODExNzc5NzQwNzg3MjQ0fSxcInpvb21cIjoxMy4xNjI1MjQxNTA4NDczMTUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQyNzMyNTY3MzMzMSxcImxhdFwiOi0zNy43ODQ0NDk0MDU5MzAzOH0sXCJ6b29tXCI6MTQuNSxcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICAvL2RhdGFzZXRMZWFkOiAzMDAwLFxuICAgICAgICBjYXB0aW9uOiAnQW5kIE1lbGJvdXJuZVxcJ3MgZmFtb3VzIExvbmRvbiBwbGFuZSB0cmVlcy4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAncGxhbmV0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdQbGF0YW51cycgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzOTQ2MzM4Mzg5NjUsXCJsYXRcIjotMzcuNzk1ODg4NzA2NjgyNzF9LFwiem9vbVwiOjE1LjkwNTEzMDM2MTQ0NjY2OCxcImJlYXJpbmdcIjoxNTcuNTk5OTk5OTk5OTk3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU1MyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzYzOTR9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE0Nzg1MTAwMTYyMDIsXCJsYXRcIjotMzcuNzg0MzQxNDcxNjc0Nzd9LFwiem9vbVwiOjEzLjkyMjIyODQ2MTc5MzY2OSxcImJlYXJpbmdcIjoxMjIuOTk0NzgzNDYwNDM0NixcInBpdGNoXCI6NDcuNTAwMDAwMDAwMDAwMDN9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTM0MzQ1MDc1NTE2LFwibGF0XCI6LTM3LjgwMTM0MTE4MDEyNTIyfSxcInpvb21cIjoxNSxcImJlYXJpbmdcIjoxNTEuMDAwNzMwNDg4MjczMzgsXCJwaXRjaFwiOjU4Ljk5OTk5OTk5OTk5OTk5fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU2MTM4ODQ4ODQwOSxcImxhdFwiOi0zNy44MDkwMjcxMDUzMTYzMn0sXCJ6b29tXCI6MTQuMjQxNzU3MDMwODE2NjM2LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIFxuICAgICAgICBjb2x1bW46ICdUb3RhbCBlbXBsb3ltZW50IGluIGJsb2NrJyAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgQ2Vuc3VzIG9mIExhbmQgVXNlIGFuZCBFbXBsb3ltZW50IChDTFVFKSByZXZlYWxzIHdoZXJlIGVtcGxveW1lbnQgaXMgY29uY2VudHJhdGVkJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU3LFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjQ5NH0sXCJ6b29tXCI6MTMuODg2Mjg3MzIwMTU5ODEsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTg1MzM0NTYyMTQsXCJsYXRcIjotMzcuODM1ODE5MTYyNDM2NjF9LFwiem9vbVwiOjEzLjY0OTExNjYxNDg3MjgzNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICB9LFxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OjEyMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hlcmUgdGhlIENvdW5jaWxcXCdzIHNpZ25pZmljYW50IHByb3BlcnR5IGhvbGRpbmdzIGFyZSBsb2NhdGVkLicsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdmdGhpLXphanknKSxcbiAgICAgICAgY29sdW1uOiAnT3duZXJzaGlwIG9yIENvbnRyb2wnLFxuICAgICAgICBzaG93TGVnZW5kOiB0cnVlLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzkwMzA4NzIzODQ2LFwibGF0XCI6LTM3LjgxODYzMTY2MDgxMDQyNX0sXCJ6b29tXCI6MTMuNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cblxuICAgIH0sXG4gICAgKi9cbiAgICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnVHJhbnNwb3J0LCBQb3N0YWwgYW5kIFN0b3JhZ2UnICxcbiAgICAgICAgY2FwdGlvbjogJy4uLndoZXJlIHRoZSB0cmFuc3BvcnQsIHBvc3RhbCBhbmQgc3RvcmFnZSBzZWN0b3IgaXMgY29uY2VudHJhdGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI3NjgxNzY3MTA3MTIsXCJsYXRcIjotMzcuODI5MjE4MjQ4NTg3MjQ2fSxcInpvb21cIjoxMi43Mjg0MzEyMTc5MTQ5MTksXCJiZWFyaW5nXCI6NjguNzAzODgzMTIxODc0NTgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnSGVhbHRoIENhcmUgYW5kIFNvY2lhbCBBc3Npc3RhbmNlJyAsXG4gICAgICAgIGNhcHRpb246ICdhbmQgd2hlcmUgdGhlIGhlYWx0aGNhcmUgYW5kIHNvY2lhbCBhc3Npc3RhbmNlIG9yZ2FuaXNhdGlvbnMgYXJlIGJhc2VkLicsXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTcyMzMxMTIxODUzLFwibGF0XCI6LTM3LjgyNzA2Mzc0NzYzODI0fSxcInpvb21cIjoxMy4wNjM3NTczODYyMzIyNDIsXCJiZWFyaW5nXCI6MjYuMzc0Nzg2OTE4NTIzMzQsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNzAwMCwgXG4gICAgICAgIGxpbmdlcjo5MDAwLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQTElFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdEZXZlbG9wbWVudCBBY3Rpdml0eSBNb25pdG9yIHRyYWNrcyBtYWpvciBwcm9qZWN0cyBpbiB0aGUgcGxhbm5pbmcgc3RhZ2UuLi4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDQwMDAsXG4gICAgICAgIGxpbmdlcjo1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5wcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0NPTVBMRVRFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgdGhvc2UgYWxyZWFkeSBjb21wbGV0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbiAgICBcblxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGxpbmdlcjogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doZXJlIHlvdSBjYW4gd2FsayB5b3VyIGRvZyBvZmYgdGhlIGxlYXNoJyxcbiAgICAgICAgbmFtZTogJ0RvZyBXYWxraW5nIFpvbmVzJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLmNsemFwMmplJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnRG9nX1dhbGtpbmdfWm9uZXMtM2ZoOXE0JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnaHNsKDM0MCwgOTclLDY1JSknLCAvL2hzbCgzNDAsIDk3JSwgNDUlKVxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnc3RhdHVzJywgJ29mZmxlYXNoJ11cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NjEzOTg3NzMyOTMyLFwibGF0XCI6LTM3LjgzODg4MjY2NTk2MTg3fSxcInpvb21cIjoxNS4wOTY0MTk1Nzk0MzI4NzgsXCJiZWFyaW5nXCI6LTMwLFwicGl0Y2hcIjo1Ny40OTk5OTk5OTk5OTk5OX1cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBuYW1lOiAnU3RyZWV0IGFkZHJlc3NlcycsXG4gICAgICAgIGNhcHRpb246ICdFdmVyeSBzaW5nbGUgc3RyZWV0IGFkZHJlc3MgaW4gdGhlIG11bmljaXBhbGl0eScsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWRkcmVzc2VzJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnU3RyZWV0X2FkZHJlc3Nlcy05N2U1b24nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7c3RyZWV0X25vfScsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IDEwLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvL21hcGJveHBvaW50czogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycvLydTdHJlZXRfYWRkcmVzc2VzLTk3ZTVvbicsXG4gICAgICAgIC8vIG5vcnRoIG1lbGJvdXJuZVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE2ODYyMjA3MTQzNjUsXCJsYXRcIjotMzcuNzkzMzAyMTAyODcyNjd9LFwiem9vbVwiOjE4LjA5ODAzNTQ2NjEzMzQ1NyxcImJlYXJpbmdcIjo2NC43OTk5OTk5OTk5OTk2MSxcInBpdGNoXCI6NDV9XG4gICAgICAgIC8vIHNvdXRoIHlhcnJhL3ByYWhyYW4gaXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0NzkwNDUxODU2LFwibGF0XCI6LTM3LjgzMzkxODMxMTgyOTAxfSxcInpvb21cIjoxOCxcImJlYXJpbmdcIjotMzkuOTk5OTk5OTk5OTk5NDksXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnQW5kIGV2ZXJ5IHByb3BlcnR5IGJvdW5kYXJ5JyxcbiAgICAgICAgLy8gbmVlZCB0byB6b29tIGluIGNsb3NlIG9uIHRoaXMgb25lXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzLXJlcGVhdCcsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBqdXN0IHJlcGVhdCBwcmV2aW91cyB2aWV3LlxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NDc5MDQ1MTg1NixcImxhdFwiOi0zNy44MzM5MTgzMTE4MjkwMX0sXCJ6b29tXCI6MTgsXCJiZWFyaW5nXCI6LTM5Ljk5OTk5OTk5OTk5OTQ5LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjE1MDAwLFxuICAgICAgICBuYW1lOiAnUHJvcGVydHkgYm91bmRhcmllcycsXG4gICAgICAgIGNhcHRpb246ICdBbmQgZXZlcnkgcHJvcGVydHkgYm91bmRhcnknLFxuICAgICAgICAvLyBuZWVkIHRvIHpvb20gaW4gY2xvc2Ugb24gdGhpcyBvbmVcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8gYmlyZHMgZXllXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgICAgIFxuICAgICAgICAvLyBzb3V0aCB5YXJyYS9wcmFocmFuIGlzaFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0NzkwNDUxODU2LFwibGF0XCI6LTM3LjgzMzkxODMxMTgyOTAxfSxcInpvb21cIjoxNi4xOTI0MjMzNjY5MDg2MyxcImJlYXJpbmdcIjotMzkuOTk5OTk5OTk5OTk5NDksXCJwaXRjaFwiOjYwfVxuICAgICAgICBcblxuICAgICAgICAvL21hcGJveHBvaW50czogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycvLydTdHJlZXRfYWRkcmVzc2VzLTk3ZTVvbicsXG4gICAgICAgIC8vIG5vcnRoIG1lbGJvdXJuZVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE2ODYyMjA3MTQzNjUsXCJsYXRcIjotMzcuNzkzMzAyMTAyODcyNjd9LFwiem9vbVwiOjE4LjA5ODAzNTQ2NjEzMzQ1NyxcImJlYXJpbmdcIjo2NC43OTk5OTk5OTk5OTk2MSxcInBpdGNoXCI6NDV9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ3OTA0NTE4NTYsXCJsYXRcIjotMzcuODMzOTE4MzExODI5MDF9LFwiem9vbVwiOjE2LjE5MjQyMzM2NjkwODYzLFwiYmVhcmluZ1wiOi0zOS45OTk5OTk5OTk5OTk0OSxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheTowLFxuICAgICAgICBuYW1lOiAnR2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1doaWNoIG5pZ2h0IGlzIGJpbiBuaWdodCcsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ2FyYmFnZS0xJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS44YXJxd21ocicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0dhcmJhZ2VfY29sbGVjdGlvbl96b25lcy05bnl0c2snLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdoc2woMjMsIDk0JSwgNjQlKScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDFdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAzXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MTAwMDBcbiAgICAgICAgLy8gYmlyZHMgZXllXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBuYW1lOiAnR2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1doaWNoIG5pZ2h0IGlzIGJpbiBuaWdodCcsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ2FyYmFnZS0yJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgIH0sIFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3J1Yl9kYXl9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAxMl0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDE2XVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgfVxuICAgICAgICAvLyBiaXJkcyBleWVcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxNCxiZWFyaW5nOjAscGl0Y2g6MCwgZHVyYXRpb246MTAwMDB9LFxuICAgIH0sXG5cblxuICAgIHsgXG4gICAgICAgIG5hbWU6ICdNZWxib3VybmUgQmlrZSBTaGFyZSBzdGF0aW9ucywgd2l0aCBjdXJyZW50IG51bWJlciBvZiBmcmVlIGFuZCB1c2VkIGRvY2tzIChldmVyeSAxNSBtaW51dGVzKScsXG4gICAgICAgIGNhcHRpb246ICdIb3cgbWFueSBcIkJsdWUgQmlrZXNcIiBhcmUgcmVhZHkgaW4gZWFjaCBzdGF0aW9uLicsXG4gICAgICAgIGNvbHVtbjogJ05CQmlrZXMnLFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgndGR2aC1uOWR2JykgLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NzY4NDE0NTYyODg3LFwibGF0XCI6LTM3LjgxOTk4OTQ4MzcyODM5fSxcInpvb21cIjoxNC42NzAyMjE2NzYyMzg1MDcsXCJiZWFyaW5nXCI6LTU3LjkzMjMwMjUxNzM2MTE3LFwicGl0Y2hcIjo2MH1cbiAgICB9LCAvLyBiaWtlIHNoYXJlXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi4nLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnV0VERElORycsICdZJ10sXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MzYyNTU2NjkzMzYsXCJsYXRcIjotMzcuODEzOTYyNzEzMzQ0MzJ9LFwiem9vbVwiOjE0LjQwNTU5MTA5MTY3MTA1OCxcImJlYXJpbmdcIjotNjcuMTk5OTk5OTk5OTk5OTksXCJwaXRjaFwiOjU0LjAwMDAwMDAwMDAwMDAyfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi5vciBzb21ldGhpbmcgZWxzZS4nLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTY3LjE5OTk5OTk5OTk5OTk5LFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgc2t5bGluZSBvZiBvdXIgY2l0eScsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIG9wYWNpdHk6MC42LFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjYsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnRXZlcnkgY2FmZSBhbmQgcmVzdGF1cmFudCcsXG4gICAgICAgIG5hbWU6ICdDYWZlcyBhbmQgUmVzdGF1cmFudHMgb25seScsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdzZnJnLXp5Z2InKSxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDk4Nzg5OTkyOTY0LFwibGF0XCI6LTM3LjgxMDIxMzEwNDA0NzQ5fSxcInpvb21cIjoxNi4wMjc3MzIzMzIwMTY5OSxcImJlYXJpbmdcIjotMTM1LjIxOTc1MzA4NjQxOTgxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbl07XG5leHBvcnQgY29uc3QgZGF0YXNldHMyID0gW1xuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3QgYXBwbGljYXRpb25zJyxcblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBST1ZFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyBhcHByb3ZlZCcgXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nIFxuICAgIH0sIFxuICAgIHsgZGVsYXk6IDUwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSB9LCAvLyBiaWtlIHNoYXJlXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdBY2NvbW1vZGF0aW9uJyB9LFxuICAgIHsgZGVsYXk6IDEwMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIGNvbHVtbjogJ0FydHMgYW5kIFJlY3JlYXRpb24gU2VydmljZXMnIH0sXG4gICAgLy97IGRlbGF5OiAzMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ1JldGFpbCBUcmFkZScgfSxcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0NvbnN0cnVjdGlvbicgfVxuICAgIC8veyBkZWxheTogMTAwMCwgZGF0YXNldDogJ2IzNmota2l5NCcgfSxcbiAgICAvL3sgZGVsYXk6IDIwMDAsIGRhdGFzZXQ6ICcyMzRxLWdnODMnIH1cbl07XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmltcG9ydCB7IG1lbGJvdXJuZVJvdXRlIH0gZnJvbSAnLi9tZWxib3VybmVSb3V0ZSc7XG5cbi8qXG5Db250aW51b3VzbHkgbW92ZXMgdGhlIE1hcGJveCB2YW50YWdlIHBvaW50IGFyb3VuZCBhIEdlb0pTT04tZGVmaW5lZCBwYXRoLlxuKi9cblxuZnVuY3Rpb24gd2hlbkxvYWRlZChtYXAsIGYpIHtcbiAgICBpZiAobWFwLmxvYWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbHJlYWR5IGxvYWRlZC4nKTtcbiAgICAgICAgZigpO1xuICAgIH1cbiAgICBlbHNlIHsgXG4gICAgICAgIGNvbnNvbGUubG9nKCdXYWl0IGZvciBsb2FkJyk7XG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG4gICAgfVxufVxuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5leHBvcnQgY2xhc3MgRmxpZ2h0UGF0aCB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXAsIHJvdXRlKSB7XG4gICAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMucm91dGUgPSBtZWxib3VybmVSb3V0ZTtcblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMC4wMTtcblxuICAgICAgICB0aGlzLnBvc05vID0gMDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IHRoaXMucm91dGUuZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKHtcbiAgICAgICAgICAgIGNlbnRlcjogZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgIHpvb206IGRlZihmZWF0dXJlLnByb3BlcnRpZXMuem9vbSwgMTQpLFxuICAgICAgICAgICAgYmVhcmluZzogZmVhdHVyZS5wcm9wZXJ0aWVzLmJlYXJpbmcsXG4gICAgICAgICAgICBwaXRjaDogZGVmKGZlYXR1cmUucHJvcGVydGllcy5waXRjaCwgNjApXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5iZWFyaW5nPTA7XG5cbiAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cblxuXG4gICAgLyp2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICB7IGNlbnRlcjogWzE0NC45NiwgLTM3LjhdLCB6b29tOiAxNSwgYmVhcmluZzogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OCwgLTM3Ljg0XSwgem9vbTogMTUsIGJlYXJpbmc6IDE2MCwgcGl0Y2g6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTk1LCAtMzcuODI1XSwgem9vbTogMTUsIGJlYXJpbmc6IC05MH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk3LCAtMzcuODJdLCB6b29tOiAxNSwgYmVhcmluZzogMTQwfVxuXG4gICAgXTsqL1xuXG4gICAgICAgIHRoaXMubW92ZUNhbWVyYSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbW92ZUNhbWVyYScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zaXRpb25zW3RoaXMucG9zTm9dO1xuICAgICAgICAgICAgcG9zLnNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIHBvcy5jdXJ2ZSA9IDAuNDg7IC8vMTtcbiAgICAgICAgICAgIHBvcy5lYXNpbmcgPSAodCkgPT4gdDsgLy8gbGluZWFyIGVhc2luZ1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmx5VG8nKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmZseVRvKHBvcywgeyBzb3VyY2U6ICdmbGlnaHRwYXRoJyB9KTtcblxuICAgICAgICAgICAgdGhpcy5wb3NObyA9ICh0aGlzLnBvc05vICsgMSkgJSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFwLnJvdGF0ZVRvKGJlYXJpbmcsIHsgZWFzaW5nOiBlYXNpbmcgfSk7XG4gICAgICAgICAgICAvL2JlYXJpbmcgKz0gNTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuIFxuICAgICAgICB0aGlzLm1hcC5vbignbW92ZWVuZCcsIChkYXRhKSA9PiB7IFxuICAgICAgICAgICAgaWYgKGRhdGEuc291cmNlID09PSAnZmxpZ2h0cGF0aCcpIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgVGhpcyBzZWVtZWQgdG8gYmUgdW5yZWxpYWJsZSAtIHdhc24ndCBhbHdheXMgZ2V0dGluZyB0aGUgbG9hZGVkIGV2ZW50LlxuICAgICAgICB3aGVuTG9hZGVkKHRoaXMubWFwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGVkLicpO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcC5qdW1wVG8odGhpcy5wb3NpdGlvbnNbMF0pO1xuICAgICAgICB0aGlzLnBvc05vICsrO1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgMCAvKnRoaXMucGF1c2VUaW1lKi8pO1xuXG4gICAgICAgIHRoaXMubWFwLm9uKCdjbGljaycsICgpID0+IHsgXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9ICAgIFxuXG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JhZGl1c0xlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgLy8gVE9ETyBwYWQgdGhlIHNtYWxsIGNpcmNsZSBzbyB0aGUgdGV4dCBzdGFydHMgYXQgdGhlIHNhbWUgWCBwb3NpdGlvbiBmb3IgYm90aFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDo2cHg7IHdpZHRoOiA2cHg7IGJvcmRlci1yYWRpdXM6IDNweFwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMjBweDsgYm9yZGVyLXJhZGl1czogMTBweFwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD5gO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoNDAsNDAsMjUwKVwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDozcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoMjAsMjAsNDApXCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPmA7IFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDYXRlZ29yeUxlZ2VuZChpZCwgY29sdW1uTmFtZSwgY29sb3JTdG9wcywgY2xvc2VIYW5kbGVyKSB7XG4gICAgbGV0IGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgK1xuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgY29sb3JTdG9wc1xuICAgICAgICAgICAgLnNvcnQoKHN0b3BhLCBzdG9wYikgPT4gc3RvcGFbMF0ubG9jYWxlQ29tcGFyZShzdG9wYlswXSkpIC8vIHNvcnQgb24gdmFsdWVzXG4gICAgICAgICAgICAubWFwKHN0b3AgPT4gYDxzcGFuIGNsYXNzPVwiYm94XCIgc3R5bGU9J2JhY2tncm91bmQ6ICR7c3RvcFsxXX0nPjwvc3Bhbj48bGFiZWw+JHtzdG9wWzBdfTwvbGFiZWw+PGJyLz5gKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgKiBhcyBsZWdlbmQgZnJvbSAnLi9sZWdlbmQnO1xuLypcbldyYXBzIGEgTWFwYm94IG1hcCB3aXRoIGRhdGEgdmlzIGNhcGFiaWxpdGllcyBsaWtlIGNpcmNsZSBzaXplIGFuZCBjb2xvciwgYW5kIHBvbHlnb24gaGVpZ2h0LlxuXG5zb3VyY2VEYXRhIGlzIGFuIG9iamVjdCB3aXRoOlxuLSBkYXRhSWRcbi0gbG9jYXRpb25Db2x1bW5cbi0gdGV4dENvbHVtbnNcbi0gbnVtZXJpY0NvbHVtbnNcbi0gcm93c1xuLSBzaGFwZVxuLSBtaW5zLCBtYXhzXG4qL1xuY29uc3QgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgdW5pcXVlID0gMDtcblxuZXhwb3J0IGNsYXNzIE1hcFZpcyB7XG4gICAgY29uc3RydWN0b3IobWFwLCBzb3VyY2VEYXRhLCBmaWx0ZXIsIGZlYXR1cmVIb3Zlckhvb2ssIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuc291cmNlRGF0YSA9IHNvdXJjZURhdGE7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB0aGlzLmZlYXR1cmVIb3Zlckhvb2sgPSBmZWF0dXJlSG92ZXJIb29rOyAvLyBmKHByb3BlcnRpZXMsIHNvdXJjZURhdGEpXG4gICAgICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjaXJjbGVSYWRpdXM6IGRlZihvcHRpb25zLmNpcmNsZVJhZGl1cywgMTApLFxuICAgICAgICAgICAgaW52aXNpYmxlOiBvcHRpb25zLmludmlzaWJsZSwgLy8gd2hldGhlciB0byBjcmVhdGUgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wgLy8gTWFwYm94IHN5bWJvbCBwcm9wZXJ0aWVzLCBtZWFuaW5nIHdlIHNob3cgc3ltYm9sIGluc3RlYWQgb2YgY2lyY2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy90aGlzLm9wdGlvbnMuaW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIFRPRE8gc2hvdWxkIGJlIHBhc3NlZCBhIExlZ2VuZCBvYmplY3Qgb2Ygc29tZSBraW5kLlxuXG4gICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmxheWVySWQgPSBzb3VyY2VEYXRhLnNoYXBlICsgJy0nICsgc291cmNlRGF0YS5kYXRhSWQgKyAnLScgKyAodW5pcXVlKyspO1xuICAgICAgICB0aGlzLmxheWVySWRIaWdobGlnaHQgPSB0aGlzLmxheWVySWQgKyAnLWhpZ2hsaWdodCc7XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgcG9pbnREYXRhc2V0VG9HZW9KU09OKHRoaXMuc291cmNlRGF0YSkgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ5IHVzaW5nIGEgY2lyY2xlIGhpZ2hsaWdodCBldmVuIG9uIGFuIGljb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuc3ltYm9sLCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgICAgICAgICAvLyBodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvRWNvbm9teS9FbXBsb3ltZW50LWJ5LWJsb2NrLWJ5LWluZHVzdHJ5L2IzNmota2l5NFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgeyBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsIFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdtYXBib3g6Ly9vcGVuY291bmNpbGRhdGEuYWVkZm15cDgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25MYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBpcyBhIHN5bWJvbCBsYXllciwgd2UgaWdub3JlIHNldFZpc0NvbHVtbi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9IHNvdXJjZURhdGEudGV4dENvbHVtbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RhdGEgY29sdW1uOiAnICsgdGhpcy5kYXRhQ29sdW1uKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9zZSBidXR0b24gYmVoYXZpb3VyLiBtYXliZT9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBlbnVtIGZpZWxkcyBvbiBwb2x5Z29ucyAobm8gZXhhbXBsZSBjdXJyZW50bHkpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICBsZXQgbWluU2l6ZSA9IDAuMyAqIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICBsZXQgbWF4U2l6ZSA9IHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLXJhZGl1cycsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIDFdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIDNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemVdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemVdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93UmFkaXVzTGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IC8vIENhbid0IHNhZmVseSBjbG9zZSBudW1lcmljIGNvbHVtbnMgeWV0LiBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMzk0OVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlUmFkaXVzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1yYWRpdXMnLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLW51bWVyaWMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICAvLyBmcm9tIENvbG9yQnJld2VyXG4gICAgICAgICAgICBjb25zdCBlbnVtQ29sb3JzID0gWycjMWY3OGI0JywnI2ZiOWE5OScsJyNiMmRmOGEnLCcjMzNhMDJjJywnI2UzMWExYycsJyNmZGJmNmYnLCcjYTZjZWUzJywgJyNmZjdmMDAnLCcjY2FiMmQ2JywnIzZhM2Q5YScsJyNmZmZmOTknLCcjYjE1OTI4J107XG5cbiAgICAgICAgICAgIGxldCBlbnVtU3RvcHMgPSB0aGlzLnNvdXJjZURhdGEuc29ydGVkRnJlcXVlbmNpZXNbZGF0YUNvbHVtbl0ubWFwKCh2YWwsaSkgPT4gW3ZhbCwgZW51bUNvbG9yc1tpXV0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogZW51bVN0b3BzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFRPRE8gdGVzdCBjbG9zZSBoYW5kbGVyLCBjdXJyZW50bHkgbm9uIGZ1bmN0aW9uYWwgZHVlIHRvIHBvaW50ZXItZXZlbnRzOm5vbmUgaW4gQ1NTXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0NhdGVnb3J5TGVnZW5kKCcjbGVnZW5kLWVudW0nLCBkYXRhQ29sdW1uLCBlbnVtU3RvcHMsIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVDb2xvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtY29sb3InLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1jb2xvciddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtZW51bScpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgICAgQXBwbGllcyBhIHN0eWxlIHRoYXQgcmVwcmVzZW50cyBudW1lcmljIGRhdGEgdmFsdWVzIGFzIGhlaWdodHMgb2YgZXh0cnVkZWQgcG9seWdvbnMuXG4gICAgICAgICAgICBUT0RPOiBhZGQgcmVtb3ZlUG9seWdvbkhlaWdodFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24taGVpZ2h0JywgIHtcbiAgICAgICAgICAgICAgICAvLyByZW1lbWJlciwgdGhlIGRhdGEgZG9lc24ndCBleGlzdCBpbiB0aGUgcG9seWdvbiBzZXQsIGl0J3MganVzdCBhIGh1Z2UgdmFsdWUgbG9va3VwXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsLy9sb2NhdGlvbkNvbHVtbiwgLy8gdGhlIElEIG9uIHRoZSBhY3R1YWwgZ2VvbWV0cnkgZGF0YXNldFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDEwMDBdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgICAgICAvLy5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ3JnYigwLDAsJyArIE1hdGgucm91bmQoNDAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdoc2woMzQwLDg4JSwnICsgTWF0aC5yb3VuZCgyMCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogNTApICsgJyUpJ10pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWQsIFsnIWluJywgJ2Jsb2NrX2lkJywgLi4uKC8qICMjIyBUT0RPIGdlbmVyYWxpc2UgKi8gXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihyb3cgPT4gcm93W2RhdGFDb2x1bW5dID09PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHJvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSldKTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHRoaXMuc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWRIaWdobGlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICAgICAgICAgIHRob3VzZS5tb3VzZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRoZSBhY3R1YWwgY29uc3RydWN0b3IuLi5cbiAgICAgICAgaWYgKHRoaXMuc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlID0gKGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBmID0gdGhpcy5tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGUucG9pbnQsIHsgbGF5ZXJzOiBbdGhpcy5sYXllcklkXX0pWzBdOyAgXG4gICAgICAgICAgICAgICAgaWYgKGYgJiYgZiAhPT0gdGhpcy5sYXN0RmVhdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IGY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmZWF0dXJlSG92ZXJIb29rKGYucHJvcGVydGllcywgdGhpcy5zb3VyY2VEYXRhLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sIGYucHJvcGVydGllc1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXSk7IC8vIHdlIGRvbid0IGhhdmUgYW55IG90aGVyIHJlbGlhYmxlIGtleT9cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCAnYmxvY2tfaWQnLCBmLnByb3BlcnRpZXMuYmxvY2tfaWRdKTsgLy8gZG9uJ3QgaGF2ZSBhIGdlbmVyYWwgd2F5IHRvIG1hdGNoIG90aGVyIGtpbmRzIG9mIHBvbHlnb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGYucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYXAub24oJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgfVxuICAgICAgICBcblxuXG5cbiAgICAgICAgXG5cbiAgICB9XG59XG5cbi8vIGNvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIEdlb0pTT05cbmZ1bmN0aW9uIHBvaW50RGF0YXNldFRvR2VvSlNPTihzb3VyY2VEYXRhKSB7XG4gICAgbGV0IGRhdGFzb3VyY2UgPSB7XG4gICAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIGZlYXR1cmVzOiBbXVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNvdXJjZURhdGEucm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSB7XG4gICAgICAgICAgICAgICAgZGF0YXNvdXJjZS5kYXRhLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHJvdyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7IC8vIEp1c3QgZG9uJ3QgcHVzaCBpdCBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWQgbG9jYXRpb246ICR7cm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dfWApOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFzb3VyY2U7XG59O1xuXG5mdW5jdGlvbiBjaXJjbGVMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgZmlsdGVyLCBoaWdobGlnaHQsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgcGFpbnQ6IHtcbi8vICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdoc2woMjAsIDk1JSwgNTAlKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3JnYmEoMCwwLDAsMCknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOTUgOiAwLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2UtY29sb3InOiBoaWdobGlnaHQgPyAnd2hpdGUnIDogJ3JnYmEoNTAsNTAsNTAsMC41KScsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IHtcbiAgICAgICAgICAgICAgICBzdG9wczogaGlnaGxpZ2h0ID8gW1sxMCw0XSwgWzE3LDEwXV0gOiBbWzEwLDJdLCBbMTcsNV1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc3ltYm9sTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIHN5bWJvbCwgZmlsdGVyLCBoaWdobGlnaHQsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZFxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXQucGFpbnQgPSBkZWYoc3ltYm9sLnBhaW50LCB7fSk7XG4gICAgcmV0LnBhaW50WydpY29uLW9wYWNpdHknXSA9ICFpbnZpc2libGUgPyAwLjk1IDogMDtcbiAgICBpZiAoc3ltYm9sLmxheW91dClcbiAgICAgICAgcmV0LmxheW91dCA9IHN5bWJvbC5sYXlvdXQ7XG5cbiAgICByZXR1cm4gcmV0O1xufVxuXG5cbiBmdW5jdGlvbiBwb2x5Z29uTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGludmlzaWJsZSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICAnc291cmNlLWxheWVyJzogJ0Jsb2Nrc19mb3JfQ2Vuc3VzX29mX0xhbmRfVXNlLTd5ajl2aCcsIC8vIFRPRG8gYXJndW1lbnQ/XG4gICAgICAgIHBhaW50OiB7IFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOCA6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJyMwMDMnXG4gICAgICAgICB9LFxuICAgIH07XG59XG4gZnVuY3Rpb24gcG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCBsYXllcklkKSB7XG4gICAgcmV0dXJuIHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ2Jsb2NrX2lkJywgJy0nXVxuICAgIH07XG59XG5cbiIsImV4cG9ydCBjb25zdCBtZWxib3VybmVSb3V0ZSA9IHtcbiAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgXCJmZWF0dXJlc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAzNTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk2Mjg4Mjk5NTYwNTQ3LFxuICAgICAgICAgIC0zNy44MjE3MTc2NDc4Mzk2NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcImJlYXJpbmdcIjogMjcwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45Nzg1MDQxODA5MDgyLFxuICAgICAgICAgIC0zNy44MDgzNTk5MTc0MjM1OTRcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAxODBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk1NTU4NzM4NzA4NDk2LFxuICAgICAgICAgIC0zNy44MDU3ODMwMjEzMTQ1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogOTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk0NDM0MzU2Njg5NDUzLFxuICAgICAgICAgIC0zNy44MTY0OTY4OTM3MjMwOFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICBdXG59OyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtY29sbGVjdGlvbi8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJlZml4ID0gXCIkXCI7XG5cbmZ1bmN0aW9uIE1hcCgpIHt9XG5cbk1hcC5wcm90b3R5cGUgPSBtYXAucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogTWFwLFxuICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiAocHJlZml4ICsga2V5KSBpbiB0aGlzO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzW3ByZWZpeCArIGtleV07XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHRoaXNbcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBwcm9wZXJ0eSA9IHByZWZpeCArIGtleTtcbiAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBrZXlzLnB1c2gocHJvcGVydHkuc2xpY2UoMSkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9LFxuICB2YWx1ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgdmFsdWVzLnB1c2godGhpc1twcm9wZXJ0eV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0sXG4gIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGVudHJpZXMucHVzaCh7a2V5OiBwcm9wZXJ0eS5zbGljZSgxKSwgdmFsdWU6IHRoaXNbcHJvcGVydHldfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH0sXG4gIHNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgKytzaXplO1xuICAgIHJldHVybiBzaXplO1xuICB9LFxuICBlbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24oZikge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBmKHRoaXNbcHJvcGVydHldLCBwcm9wZXJ0eS5zbGljZSgxKSwgdGhpcyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hcChvYmplY3QsIGYpIHtcbiAgdmFyIG1hcCA9IG5ldyBNYXA7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBtYXAuc2V0KGtleSwgdmFsdWUpOyB9KTtcblxuICAvLyBJbmRleCBhcnJheSBieSBudW1lcmljIGluZGV4IG9yIHNwZWNpZmllZCBrZXkgZnVuY3Rpb24uXG4gIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICBvO1xuXG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoaSwgb2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGYobyA9IG9iamVjdFtpXSwgaSwgb2JqZWN0KSwgbyk7XG4gIH1cblxuICAvLyBDb252ZXJ0IG9iamVjdCB0byBtYXAuXG4gIGVsc2UgaWYgKG9iamVjdCkgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgbmVzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIga2V5cyA9IFtdLFxuICAgICAgc29ydEtleXMgPSBbXSxcbiAgICAgIHNvcnRWYWx1ZXMsXG4gICAgICByb2xsdXAsXG4gICAgICBuZXN0O1xuXG4gIGZ1bmN0aW9uIGFwcGx5KGFycmF5LCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpIHtcbiAgICBpZiAoZGVwdGggPj0ga2V5cy5sZW5ndGgpIHJldHVybiByb2xsdXAgIT0gbnVsbFxuICAgICAgICA/IHJvbGx1cChhcnJheSkgOiAoc29ydFZhbHVlcyAhPSBudWxsXG4gICAgICAgID8gYXJyYXkuc29ydChzb3J0VmFsdWVzKVxuICAgICAgICA6IGFycmF5KTtcblxuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGtleSA9IGtleXNbZGVwdGgrK10sXG4gICAgICAgIGtleVZhbHVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdmFsdWVzQnlLZXkgPSBtYXAoKSxcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICByZXN1bHQgPSBjcmVhdGVSZXN1bHQoKTtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodmFsdWVzID0gdmFsdWVzQnlLZXkuZ2V0KGtleVZhbHVlID0ga2V5KHZhbHVlID0gYXJyYXlbaV0pICsgXCJcIikpIHtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbdmFsdWVdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZXNCeUtleS5lYWNoKGZ1bmN0aW9uKHZhbHVlcywga2V5KSB7XG4gICAgICBzZXRSZXN1bHQocmVzdWx0LCBrZXksIGFwcGx5KHZhbHVlcywgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZW50cmllcyhtYXAkJDEsIGRlcHRoKSB7XG4gICAgaWYgKCsrZGVwdGggPiBrZXlzLmxlbmd0aCkgcmV0dXJuIG1hcCQkMTtcbiAgICB2YXIgYXJyYXksIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCAtIDFdO1xuICAgIGlmIChyb2xsdXAgIT0gbnVsbCAmJiBkZXB0aCA+PSBrZXlzLmxlbmd0aCkgYXJyYXkgPSBtYXAkJDEuZW50cmllcygpO1xuICAgIGVsc2UgYXJyYXkgPSBbXSwgbWFwJCQxLmVhY2goZnVuY3Rpb24odiwgaykgeyBhcnJheS5wdXNoKHtrZXk6IGssIHZhbHVlczogZW50cmllcyh2LCBkZXB0aCl9KTsgfSk7XG4gICAgcmV0dXJuIHNvcnRLZXkgIT0gbnVsbCA/IGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gc29ydEtleShhLmtleSwgYi5rZXkpOyB9KSA6IGFycmF5O1xuICB9XG5cbiAgcmV0dXJuIG5lc3QgPSB7XG4gICAgb2JqZWN0OiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU9iamVjdCwgc2V0T2JqZWN0KTsgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApOyB9LFxuICAgIGVudHJpZXM6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBlbnRyaWVzKGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCksIDApOyB9LFxuICAgIGtleTogZnVuY3Rpb24oZCkgeyBrZXlzLnB1c2goZCk7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRLZXlzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRWYWx1ZXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRWYWx1ZXMgPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgcm9sbHVwOiBmdW5jdGlvbihmKSB7IHJvbGx1cCA9IGY7IHJldHVybiBuZXN0OyB9XG4gIH07XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3QoKSB7XG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gc2V0T2JqZWN0KG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gIHJldHVybiBtYXAoKTtcbn1cblxuZnVuY3Rpb24gc2V0TWFwKG1hcCQkMSwga2V5LCB2YWx1ZSkge1xuICBtYXAkJDEuc2V0KGtleSwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBTZXQoKSB7fVxuXG52YXIgcHJvdG8gPSBtYXAucHJvdG90eXBlO1xuXG5TZXQucHJvdG90eXBlID0gc2V0LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNldCxcbiAgaGFzOiBwcm90by5oYXMsXG4gIGFkZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YWx1ZSArPSBcIlwiO1xuICAgIHRoaXNbcHJlZml4ICsgdmFsdWVdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogcHJvdG8ucmVtb3ZlLFxuICBjbGVhcjogcHJvdG8uY2xlYXIsXG4gIHZhbHVlczogcHJvdG8ua2V5cyxcbiAgc2l6ZTogcHJvdG8uc2l6ZSxcbiAgZW1wdHk6IHByb3RvLmVtcHR5LFxuICBlYWNoOiBwcm90by5lYWNoXG59O1xuXG5mdW5jdGlvbiBzZXQob2JqZWN0LCBmKSB7XG4gIHZhciBzZXQgPSBuZXcgU2V0O1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBTZXQpIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IHNldC5hZGQodmFsdWUpOyB9KTtcblxuICAvLyBPdGhlcndpc2UsIGFzc3VtZSBpdOKAmXMgYW4gYXJyYXkuXG4gIGVsc2UgaWYgKG9iamVjdCkge1xuICAgIHZhciBpID0gLTEsIG4gPSBvYmplY3QubGVuZ3RoO1xuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChmKG9iamVjdFtpXSwgaSwgb2JqZWN0KSk7XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG52YXIga2V5cyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgdmFsdWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgdmFsdWVzLnB1c2gobWFwW2tleV0pO1xuICByZXR1cm4gdmFsdWVzO1xufTtcblxudmFyIGVudHJpZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGVudHJpZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgZW50cmllcy5wdXNoKHtrZXk6IGtleSwgdmFsdWU6IG1hcFtrZXldfSk7XG4gIHJldHVybiBlbnRyaWVzO1xufTtcblxuZXhwb3J0cy5uZXN0ID0gbmVzdDtcbmV4cG9ydHMuc2V0ID0gc2V0O1xuZXhwb3J0cy5tYXAgPSBtYXA7XG5leHBvcnRzLmtleXMgPSBrZXlzO1xuZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5leHBvcnRzLmVudHJpZXMgPSBlbnRyaWVzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kaXNwYXRjaC8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9vcCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnRzLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRzdi8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiZFwiLCBcInJldHVybiB7XCIgKyBjb2x1bW5zLm1hcChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgXCI6IGRbXCIgKyBpICsgXCJdXCI7XG4gIH0pLmpvaW4oXCIsXCIpICsgXCJ9XCIpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21Db252ZXJ0ZXIoY29sdW1ucywgZikge1xuICB2YXIgb2JqZWN0ID0gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpO1xuICByZXR1cm4gZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgcmV0dXJuIGYob2JqZWN0KHJvdyksIGksIGNvbHVtbnMpO1xuICB9O1xufVxuXG4vLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS5cbmZ1bmN0aW9uIGluZmVyQ29sdW1ucyhyb3dzKSB7XG4gIHZhciBjb2x1bW5TZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgICAgY29sdW1ucyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7XG4gICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvbHVtbnM7XG59XG5cbmZ1bmN0aW9uIGRzdihkZWxpbWl0ZXIpIHtcbiAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cChcIltcXFwiXCIgKyBkZWxpbWl0ZXIgKyBcIlxcbl1cIiksXG4gICAgICBkZWxpbWl0ZXJDb2RlID0gZGVsaW1pdGVyLmNoYXJDb2RlQXQoMCk7XG5cbiAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikge1xuICAgIHZhciBjb252ZXJ0LCBjb2x1bW5zLCByb3dzID0gcGFyc2VSb3dzKHRleHQsIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgaWYgKGNvbnZlcnQpIHJldHVybiBjb252ZXJ0KHJvdywgaSAtIDEpO1xuICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpO1xuICAgIH0pO1xuICAgIHJvd3MuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikge1xuICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lXG4gICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGVcbiAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93c1xuICAgICAgICBOID0gdGV4dC5sZW5ndGgsXG4gICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleFxuICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/XG5cbiAgICBmdW5jdGlvbiB0b2tlbigpIHtcbiAgICAgIGlmIChJID49IE4pIHJldHVybiBFT0Y7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGZpbGVcbiAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBsaW5lXG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogcXVvdGVzXG4gICAgICB2YXIgaiA9IEksIGM7XG4gICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkge1xuICAgICAgICB2YXIgaSA9IGo7XG4gICAgICAgIHdoaWxlIChpKysgPCBOKSB7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDEpICE9PSAzNCkgYnJlYWs7XG4gICAgICAgICAgICArK2k7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEkgPSBpICsgMjtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgIGlmIChjID09PSAxMykge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpKS5yZXBsYWNlKC9cIlwiL2csIFwiXFxcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZVxuICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgIHZhciBrID0gMTtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspO1xuICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxcblxuICAgICAgICBlbHNlIGlmIChjID09PSAxMykgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSAxMCkgKytJLCArK2s7IH0gLy8gXFxyfFxcclxcblxuICAgICAgICBlbHNlIGlmIChjICE9PSBkZWxpbWl0ZXJDb2RlKSBjb250aW51ZTtcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiwgSSAtIGspO1xuICAgICAgfVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGxhc3QgdG9rZW4gYmVmb3JlIEVPRlxuICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoaik7XG4gICAgfVxuXG4gICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikge1xuICAgICAgdmFyIGEgPSBbXTtcbiAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7XG4gICAgICAgIGEucHVzaCh0KTtcbiAgICAgICAgdCA9IHRva2VuKCk7XG4gICAgICB9XG4gICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7XG4gICAgICByb3dzLnB1c2goYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykge1xuICAgIGlmIChjb2x1bW5zID09IG51bGwpIGNvbHVtbnMgPSBpbmZlckNvbHVtbnMocm93cyk7XG4gICAgcmV0dXJuIFtjb2x1bW5zLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpXS5jb25jYXQocm93cy5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbY29sdW1uXSk7XG4gICAgICB9KS5qb2luKGRlbGltaXRlcik7XG4gICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93KHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/IFwiXCJcbiAgICAgICAgOiByZUZvcm1hdC50ZXN0KHRleHQgKz0gXCJcIikgPyBcIlxcXCJcIiArIHRleHQucmVwbGFjZSgvXFxcIi9nLCBcIlxcXCJcXFwiXCIpICsgXCJcXFwiXCJcbiAgICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgZm9ybWF0Um93czogZm9ybWF0Um93c1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwiLFwiKTtcblxudmFyIGNzdlBhcnNlID0gY3N2LnBhcnNlO1xudmFyIGNzdlBhcnNlUm93cyA9IGNzdi5wYXJzZVJvd3M7XG52YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDtcbnZhciBjc3ZGb3JtYXRSb3dzID0gY3N2LmZvcm1hdFJvd3M7XG5cbnZhciB0c3YgPSBkc3YoXCJcXHRcIik7XG5cbnZhciB0c3ZQYXJzZSA9IHRzdi5wYXJzZTtcbnZhciB0c3ZQYXJzZVJvd3MgPSB0c3YucGFyc2VSb3dzO1xudmFyIHRzdkZvcm1hdCA9IHRzdi5mb3JtYXQ7XG52YXIgdHN2Rm9ybWF0Um93cyA9IHRzdi5mb3JtYXRSb3dzO1xuXG5leHBvcnRzLmRzdkZvcm1hdCA9IGRzdjtcbmV4cG9ydHMuY3N2UGFyc2UgPSBjc3ZQYXJzZTtcbmV4cG9ydHMuY3N2UGFyc2VSb3dzID0gY3N2UGFyc2VSb3dzO1xuZXhwb3J0cy5jc3ZGb3JtYXQgPSBjc3ZGb3JtYXQ7XG5leHBvcnRzLmNzdkZvcm1hdFJvd3MgPSBjc3ZGb3JtYXRSb3dzO1xuZXhwb3J0cy50c3ZQYXJzZSA9IHRzdlBhcnNlO1xuZXhwb3J0cy50c3ZQYXJzZVJvd3MgPSB0c3ZQYXJzZVJvd3M7XG5leHBvcnRzLnRzdkZvcm1hdCA9IHRzdkZvcm1hdDtcbmV4cG9ydHMudHN2Rm9ybWF0Um93cyA9IHRzdkZvcm1hdFJvd3M7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1yZXF1ZXN0LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMsIHJlcXVpcmUoJ2QzLWNvbGxlY3Rpb24nKSwgcmVxdWlyZSgnZDMtZGlzcGF0Y2gnKSwgcmVxdWlyZSgnZDMtZHN2JykpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cycsICdkMy1jb2xsZWN0aW9uJywgJ2QzLWRpc3BhdGNoJywgJ2QzLWRzdiddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pLGdsb2JhbC5kMyxnbG9iYWwuZDMsZ2xvYmFsLmQzKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cyxkM0NvbGxlY3Rpb24sZDNEaXNwYXRjaCxkM0RzdikgeyAndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdCxcbiAgICAgIGV2ZW50ID0gZDNEaXNwYXRjaC5kaXNwYXRjaChcImJlZm9yZXNlbmRcIiwgXCJwcm9ncmVzc1wiLCBcImxvYWRcIiwgXCJlcnJvclwiKSxcbiAgICAgIG1pbWVUeXBlLFxuICAgICAgaGVhZGVycyA9IGQzQ29sbGVjdGlvbi5tYXAoKSxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCxcbiAgICAgIHVzZXIgPSBudWxsLFxuICAgICAgcGFzc3dvcmQgPSBudWxsLFxuICAgICAgcmVzcG9uc2UsXG4gICAgICByZXNwb25zZVR5cGUsXG4gICAgICB0aW1lb3V0ID0gMDtcblxuICAvLyBJZiBJRSBkb2VzIG5vdCBzdXBwb3J0IENPUlMsIHVzZSBYRG9tYWluUmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgJiYgIShcIndpdGhDcmVkZW50aWFsc1wiIGluIHhocilcbiAgICAgICYmIC9eKGh0dHAocyk/Oik/XFwvXFwvLy50ZXN0KHVybCkpIHhociA9IG5ldyBYRG9tYWluUmVxdWVzdDtcblxuICBcIm9ubG9hZFwiIGluIHhoclxuICAgICAgPyB4aHIub25sb2FkID0geGhyLm9uZXJyb3IgPSB4aHIub250aW1lb3V0ID0gcmVzcG9uZFxuICAgICAgOiB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24obykgeyB4aHIucmVhZHlTdGF0ZSA+IDMgJiYgcmVzcG9uZChvKTsgfTtcblxuICBmdW5jdGlvbiByZXNwb25kKG8pIHtcbiAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cywgcmVzdWx0O1xuICAgIGlmICghc3RhdHVzICYmIGhhc1Jlc3BvbnNlKHhocilcbiAgICAgICAgfHwgc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgICAgfHwgc3RhdHVzID09PSAzMDQpIHtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlLmNhbGwocmVxdWVzdCwgeGhyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHhocjtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmNhbGwoXCJsb2FkXCIsIHJlcXVlc3QsIHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBvKTtcbiAgICB9XG4gIH1cblxuICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBldmVudC5jYWxsKFwicHJvZ3Jlc3NcIiwgcmVxdWVzdCwgZSk7XG4gIH07XG5cbiAgcmVxdWVzdCA9IHtcbiAgICBoZWFkZXI6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBuYW1lID0gKG5hbWUgKyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gaGVhZGVycy5nZXQobmFtZSk7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgaGVhZGVycy5yZW1vdmUobmFtZSk7XG4gICAgICBlbHNlIGhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlICsgXCJcIik7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gSWYgbWltZVR5cGUgaXMgbm9uLW51bGwgYW5kIG5vIEFjY2VwdCBoZWFkZXIgaXMgc2V0LCBhIGRlZmF1bHQgaXMgdXNlZC5cbiAgICBtaW1lVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1pbWVUeXBlO1xuICAgICAgbWltZVR5cGUgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZpZXMgd2hhdCB0eXBlIHRoZSByZXNwb25zZSB2YWx1ZSBzaG91bGQgdGFrZTtcbiAgICAvLyBmb3IgaW5zdGFuY2UsIGFycmF5YnVmZmVyLCBibG9iLCBkb2N1bWVudCwgb3IgdGV4dC5cbiAgICByZXNwb25zZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByZXNwb25zZVR5cGU7XG4gICAgICByZXNwb25zZVR5cGUgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB0aW1lb3V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGltZW91dDtcbiAgICAgIHRpbWVvdXQgPSArdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHVzZXIgOiAodXNlciA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgcGFzc3dvcmQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyBwYXNzd29yZCA6IChwYXNzd29yZCA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmeSBob3cgdG8gY29udmVydCB0aGUgcmVzcG9uc2UgY29udGVudCB0byBhIHNwZWNpZmljIHR5cGU7XG4gICAgLy8gY2hhbmdlcyB0aGUgY2FsbGJhY2sgdmFsdWUgb24gXCJsb2FkXCIgZXZlbnRzLlxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmVzcG9uc2UgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIkdFVFwiLCDigKYpLlxuICAgIGdldDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJHRVRcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIlBPU1RcIiwg4oCmKS5cbiAgICBwb3N0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIlBPU1RcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBJZiBjYWxsYmFjayBpcyBub24tbnVsbCwgaXQgd2lsbCBiZSB1c2VkIGZvciBlcnJvciBhbmQgbG9hZCBldmVudHMuXG4gICAgc2VuZDogZnVuY3Rpb24obWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUsIHVzZXIsIHBhc3N3b3JkKTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmICFoZWFkZXJzLmhhcyhcImFjY2VwdFwiKSkgaGVhZGVycy5zZXQoXCJhY2NlcHRcIiwgbWltZVR5cGUgKyBcIiwqLypcIik7XG4gICAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIGhlYWRlcnMuZWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7IH0pO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgeGhyLm92ZXJyaWRlTWltZVR5cGUpIHhoci5vdmVycmlkZU1pbWVUeXBlKG1pbWVUeXBlKTtcbiAgICAgIGlmIChyZXNwb25zZVR5cGUgIT0gbnVsbCkgeGhyLnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICAgIGlmICh0aW1lb3V0ID4gMCkgeGhyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgdHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIGNhbGxiYWNrLmxlbmd0aCA9PT0gMSkgY2FsbGJhY2sgPSBmaXhDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgcmVxdWVzdC5vbihcImVycm9yXCIsIGNhbGxiYWNrKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oeGhyKSB7IGNhbGxiYWNrKG51bGwsIHhocik7IH0pO1xuICAgICAgZXZlbnQuY2FsbChcImJlZm9yZXNlbmRcIiwgcmVxdWVzdCwgeGhyKTtcbiAgICAgIHhoci5zZW5kKGRhdGEgPT0gbnVsbCA/IG51bGwgOiBkYXRhKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBhYm9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gZXZlbnQgPyByZXF1ZXN0IDogdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5mdW5jdGlvbiBmaXhDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyb3IsIHhocikge1xuICAgIGNhbGxiYWNrKGVycm9yID09IG51bGwgPyB4aHIgOiBudWxsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFzUmVzcG9uc2UoeGhyKSB7XG4gIHZhciB0eXBlID0geGhyLnJlc3BvbnNlVHlwZTtcbiAgcmV0dXJuIHR5cGUgJiYgdHlwZSAhPT0gXCJ0ZXh0XCJcbiAgICAgID8geGhyLnJlc3BvbnNlIC8vIG51bGwgb24gZXJyb3JcbiAgICAgIDogeGhyLnJlc3BvbnNlVGV4dDsgLy8gXCJcIiBvbiBlcnJvclxufVxuXG52YXIgdHlwZSA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcmVzcG9uc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiByLmdldChjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xufTtcblxudmFyIGh0bWwgPSB0eXBlKFwidGV4dC9odG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIGpzb24gPSB0eXBlKFwiYXBwbGljYXRpb24vanNvblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIHRleHQgPSB0eXBlKFwidGV4dC9wbGFpblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIHhoci5yZXNwb25zZVRleHQ7XG59KTtcblxudmFyIHhtbCA9IHR5cGUoXCJhcHBsaWNhdGlvbi94bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHZhciB4bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gIGlmICgheG1sKSB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSBlcnJvclwiKTtcbiAgcmV0dXJuIHhtbDtcbn0pO1xuXG52YXIgZHN2ID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCBwYXJzZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCByb3csIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBjYWxsYmFjayA9IHJvdywgcm93ID0gbnVsbDtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpO1xuICAgIHIucm93ID0gZnVuY3Rpb24oXykgeyByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHIucmVzcG9uc2UocmVzcG9uc2VPZihwYXJzZSwgcm93ID0gXykpIDogcm93OyB9O1xuICAgIHIucm93KHJvdyk7XG4gICAgcmV0dXJuIGNhbGxiYWNrID8gci5nZXQoY2FsbGJhY2spIDogcjtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIHJlc3BvbnNlT2YocGFyc2UsIHJvdykge1xuICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCQkMSkge1xuICAgIHJldHVybiBwYXJzZShyZXF1ZXN0JCQxLnJlc3BvbnNlVGV4dCwgcm93KTtcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcInRleHQvY3N2XCIsIGQzRHN2LmNzdlBhcnNlKTtcblxudmFyIHRzdiA9IGRzdihcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIiwgZDNEc3YudHN2UGFyc2UpO1xuXG5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuZXhwb3J0cy5odG1sID0gaHRtbDtcbmV4cG9ydHMuanNvbiA9IGpzb247XG5leHBvcnRzLnRleHQgPSB0ZXh0O1xuZXhwb3J0cy54bWwgPSB4bWw7XG5leHBvcnRzLmNzdiA9IGNzdjtcbmV4cG9ydHMudHN2ID0gdHN2O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiIWZ1bmN0aW9uKGUsbil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bihyZXF1aXJlKFwiZDMtcmVxdWVzdFwiKSk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJkMy1yZXF1ZXN0XCJdLG4pOihlLmQzPWUuZDN8fHt9LGUuZDMucHJvbWlzZT1uKGUuZDMpKX0odGhpcyxmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciB0PWFyZ3VtZW50cy5sZW5ndGgscj1BcnJheSh0KSxvPTA7dD5vO28rKylyW29dPWFyZ3VtZW50c1tvXTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxvKXt2YXIgdT1mdW5jdGlvbihlLG4pe3JldHVybiBlP3ZvaWQgbyhFcnJvcihlKSk6dm9pZCB0KG4pfTtuLmFwcGx5KGUsci5jb25jYXQodSkpfSl9fXZhciB0PXt9O3JldHVybltcImNzdlwiLFwidHN2XCIsXCJqc29uXCIsXCJ4bWxcIixcInRleHRcIixcImh0bWxcIl0uZm9yRWFjaChmdW5jdGlvbihyKXt0W3JdPW4oZSxlW3JdKX0pLHR9KTsiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbnZhciBkMyA9IHJlcXVpcmUoJ2QzLnByb21pc2UnKTtcblxuZnVuY3Rpb24gZGVmKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG59XG4vKlxuTWFuYWdlcyBmZXRjaGluZyBhIGRhdGFzZXQgZnJvbSBTb2NyYXRhIGFuZCBwcmVwYXJpbmcgaXQgZm9yIHZpc3VhbGlzYXRpb24gYnlcbmNvdW50aW5nIGZpZWxkIHZhbHVlIGZyZXF1ZW5jaWVzIGV0Yy4gXG4qL1xuZXhwb3J0IGNsYXNzIFNvdXJjZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKGRhdGFJZCwgYWN0aXZlQ2Vuc3VzWWVhcikge1xuICAgICAgICB0aGlzLmRhdGFJZCA9IGRhdGFJZDtcbiAgICAgICAgdGhpcy5hY3RpdmVDZW5zdXNZZWFyID0gZGVmKGFjdGl2ZUNlbnN1c1llYXIsIDIwMTUpO1xuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSB1bmRlZmluZWQ7ICAvLyBuYW1lIG9mIGNvbHVtbiB3aGljaCBob2xkcyBsYXQvbG9uIG9yIGJsb2NrIElEXG4gICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdW5kZWZpbmVkOyAvLyBpZiB0aGUgZGF0YXNldCB0eXBlIGlzICdwb2ludCcgKHVzZWQgZm9yIHBhcnNpbmcgbG9jYXRpb24gZmllbGQpXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTsgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBudW1lcmljIGRhdGF2aXNcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IFtdOyAgICAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIGVudW0gZGF0YXZpc1xuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBbXTsgICAgICAgICAgLy8gbmFtZXMgb2Ygb3RoZXIgY29sdW1uc1xuICAgICAgICB0aGlzLm1pbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gbWluIGFuZCBtYXggb2YgZWFjaCBudW1lcmljIGNvbHVtblxuICAgICAgICB0aGlzLm1heHMgPSB7fTtcbiAgICAgICAgdGhpcy5mcmVxdWVuY2llcyA9IHt9OyAgICAgICAgICAgIC8vIFxuICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzID0ge307ICAgICAgLy8gbW9zdCBmcmVxdWVudCB2YWx1ZXMgaW4gZWFjaCB0ZXh0IGNvbHVtblxuICAgICAgICB0aGlzLnNoYXBlID0gJ3BvaW50JzsgICAgICAgICAgICAgLy8gcG9pbnQgb3IgcG9seWdvbiAoQ0xVRSBibG9jaylcbiAgICAgICAgdGhpcy5yb3dzID0gdW5kZWZpbmVkOyAgICAgICAgICAgIC8vIHByb2Nlc3NlZCByb3dzXG4gICAgICAgIHRoaXMuYmxvY2tJbmRleCA9IHt9OyAgICAgICAgICAgICAvLyBjYWNoZSBvZiBDTFVFIGJsb2NrIElEc1xuICAgIH1cblxuXG4gICAgY2hvb3NlQ29sdW1uVHlwZXMgKGNvbHVtbnMpIHtcbiAgICAgICAgLy92YXIgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnIHx8IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgLy8gXCJsb2NhdGlvblwiIGFuZCBcInBvaW50XCIgYXJlIGJvdGggcG9pbnQgZGF0YSB0eXBlcywgZXhwcmVzc2VkIGRpZmZlcmVudGx5LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGEgXCJibG9jayBJRFwiIGNhbiBiZSBqb2luZWQgYWdhaW5zdCB0aGUgQ0xVRSBCbG9jayBwb2x5Z29ucyB3aGljaCBhcmUgaW4gTWFwYm94LlxuICAgICAgICBsZXQgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVswXTtcbiAgICAgICAgaWYgKCFsYykge1xuICAgICAgICAgICAgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAobGMuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChsYy5uYW1lID09PSAnQmxvY2sgSUQnKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlID0gJ3BvbHlnb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IGxjLm5hbWU7XG5cbiAgICAgICAgY29sdW1ucyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wgIT09IGxjKTtcblxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ251bWJlcicgJiYgY29sLm5hbWUgIT09ICdMYXRpdHVkZScgJiYgY29sLm5hbWUgIT09ICdMb25naXR1ZGUnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHsgdGhpcy5taW5zW2NvbF0gPSAxZTk7IHRoaXMubWF4c1tjb2xdID0gLTFlOTsgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3RleHQnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF0gPSB7fSk7XG5cbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiB0aGlzLm51bWVyaWNDb2x1bW5zLmluZGV4T2YoY29sKSA8IDAgJiYgdGhpcy50ZXh0Q29sdW1ucy5pbmRleE9mKGNvbCkgPCAwKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGJldHRlciBuYW1lIGFuZCBiZWhhdmlvdXJcbiAgICBmaWx0ZXIocm93KSB7XG4gICAgICAgIC8vIFRPRE8gbW92ZSB0aGlzIHNvbWV3aGVyZSBiZXR0ZXJcbiAgICAgICAgaWYgKHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSA9PT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHJvd1snQ2Vuc3VzIHllYXInXSAmJiByb3dbJ0NlbnN1cyB5ZWFyJ10gIT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cblxuICAgIC8vIGNvbnZlcnQgbnVtZXJpYyBjb2x1bW5zIHRvIG51bWJlcnMgZm9yIGRhdGEgdmlzXG4gICAgY29udmVydFJvdyhyb3cpIHtcblxuICAgICAgICAvLyBjb252ZXJ0IGxvY2F0aW9uIHR5cGVzIChzdHJpbmcpIHRvIFtsb24sIGxhdF0gYXJyYXkuXG4gICAgICAgIGZ1bmN0aW9uIGxvY2F0aW9uVG9Db29yZHMobG9jYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9jYXRpb24pLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIC8vIFwibmV3IGJhY2tlbmRcIiBkYXRhc2V0cyB1c2UgYSBXS1QgZmllbGQgW1BPSU5UIChsb24gbGF0KV0gaW5zdGVhZCBvZiAobGF0LCBsb24pXG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhdGlvbklzUG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb24ucmVwbGFjZSgnUE9JTlQgKCcsICcnKS5yZXBsYWNlKCcpJywgJycpLnNwbGl0KCcgJykubWFwKG4gPT4gTnVtYmVyKG4pKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobG9jYXRpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW051bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVsxXS5yZXBsYWNlKCcpJywgJycpKSwgTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzBdLnJlcGxhY2UoJygnLCAnJykpXTtcbiAgICAgICAgICAgIH0gZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyB1c2UgY29sdW1uLmNhY2hlZENvbnRlbnRzLnNtYWxsZXN0IGFuZCAubGFyZ2VzdFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHJvd1tjb2xdID0gTnVtYmVyKHJvd1tjb2xdKSA7IC8vICtyb3dbY29sXSBhcHBhcmVudGx5IGZhc3RlciwgYnV0IGJyZWFrcyBvbiBzaW1wbGUgdGhpbmdzIGxpa2UgYmxhbmsgdmFsdWVzXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluY2x1ZGUgdGhlIHRvdGFsIHZhbHVlcyBpbiBcbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA8IHRoaXMubWluc1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5taW5zW2NvbF0gPSByb3dbY29sXTtcblxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdID4gdGhpcy5tYXhzW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1heHNbY29sXSA9IHJvd1tjb2xdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB2YXIgdmFsID0gcm93W2NvbF07XG4gICAgICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSA9ICh0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSA9IGxvY2F0aW9uVG9Db29yZHMuY2FsbCh0aGlzLCByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pO1xuXG5cblxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpIHtcbiAgICAgICAgdmFyIG5ld1RleHRDb2x1bW5zID0gW107XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdID0gT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKVxuICAgICAgICAgICAgICAgIC5zb3J0KCh2YWxhLCB2YWxiKSA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYV0gPCB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYl0gPyAxIDogLTEpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsMTIpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPCAyIHx8IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoID4gMjAgJiYgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3RoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXVsxXV0gPD0gNSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYm9yaW5nIGlmIGFsbCB2YWx1ZXMgdGhlIHNhbWUsIG9yIGlmIHRvbyBtYW55IGRpZmZlcmVudCB2YWx1ZXMgKGFzIGp1ZGdlZCBieSBzZWNvbmQtbW9zdCBjb21tb24gdmFsdWUgYmVpbmcgNSB0aW1lcyBvciBmZXdlcilcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUZXh0Q29sdW1ucy5wdXNoKGNvbCk7IC8vIGhvdyBkbyB5b3Ugc2FmZWx5IGRlbGV0ZSBmcm9tIGFycmF5IHlvdSdyZSBsb29waW5nIG92ZXI/XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IG5ld1RleHRDb2x1bW5zO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29ydGVkRnJlcXVlbmNpZXMpO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHJvd3MgZnJvbSBTb2NyYXRhIChyZXR1cm5zIFByb21pc2UpLiBcIk5ldyBiYWNrZW5kXCIgdmlld3MgZ28gdGhyb3VnaCBhbiBhZGRpdGlvbmFsIHN0ZXAgdG8gZmluZCB0aGUgcmVhbFxuICAgIC8vIEFQSSBlbmRwb2ludC5cbiAgICBsb2FkKCkge1xuICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnLmpzb24nKVxuICAgICAgICAudGhlbihwcm9wcyA9PiB7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBwcm9wcy5uYW1lO1xuICAgICAgICAgICAgaWYgKHByb3BzLm5ld0JhY2tlbmQgJiYgcHJvcHMuY2hpbGRWaWV3cy5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFJZCA9IHByb3BzLmNoaWxkVmlld3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHByb3BzID0+IHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGQzLmNzdignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnL3Jvd3MuY3N2P2FjY2Vzc1R5cGU9RE9XTkxPQUQnLCB0aGlzLmNvbnZlcnRSb3cuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKHJvd3MgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvbHlnb24nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVCbG9ja0luZGV4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgYSBoYXNoIHRhYmxlIGxvb2t1cCBmcm9tIFt5ZWFyLCBibG9jayBJRF0gdG8gZGF0YXNldCByb3dcbiAgICBjb21wdXRlQmxvY2tJbmRleCgpIHtcbiAgICAgICAgdGhpcy5yb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID0ge307XG4gICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXVtyb3dbJ0Jsb2NrIElEJ11dID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJvd0ZvckJsb2NrKGJsb2NrSWQgLyogY2Vuc3VzX3llYXIgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93c1t0aGlzLmJsb2NrSW5kZXhbdGhpcy5hY3RpdmVDZW5zdXNZZWFyXVtibG9ja0lkXV07XG4gICAgfVxuXG4gICAgZmlsdGVyZWRSb3dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93WydDZW5zdXMgeWVhciddID09PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSAhPT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJyk7XG4gICAgfVxufSJdfQ==

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
        map.setPaintProperty(dataset.mapbox.id, getOpacityProp(style), 0.9); // TODO set right opacity
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
        nextD.flyTo.duration = d.delay / 3.0 + nextD.delay / 3.0; // so it lands about a third of the way through the dataset's visibility.
        setTimeout(function () {
            map.flyTo(nextD.flyTo);
        }, d.delay * 2.0 / 3.0);
    }

    setTimeout(function () {
        if (d.mapvis) d.mapvis.remove();

        if (d.mapbox) map.removeLayer(d.mapbox.id);
    }, d.delay + 0); /*def(d.linger, 1000)); */ // let it linger a bit while the next one is loading.
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
                nextDataset(map, 10);
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
    flyTo: { "center": { "lng": 144.98492251438307, "lat": -37.80310972727281 }, "zoom": 15.358509789790808, "bearing": -78.3999999999997, "pitch": 58.500000000000014 }
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
    flyTo: { "center": { "lng": 144.94318163755105, "lat": -37.78351953419449 }, "zoom": 15.773488574721082, "bearing": 147.65219382373107, "pitch": 59.99589825769096 }
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
    delay: 10000,
    linger: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPLIED'],
    caption: 'Development Activity Monitor tracks major projects in the planning stage',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 5000,
    linger: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: '...under construction',
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
    name: 'dogzones-offleash',
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
    delay: 10000,
    name: 'Property boundaries',
    caption: 'And property boundary',
    // need to zoom in close on this one
    mapbox: {
        id: 'boundaries',
        type: 'line',
        source: 'mapbox://cityofmelbourne.799drouh',
        'source-layer': 'Property_boundaries-061k0x',
        paint: {

            'line-color': 'rgb(0,183,79)',
            'line-width': 2

        }
    },
    //mapboxpoints: 'mapbox://cityofmelbourne.3ip3couo'//'Street_addresses-97e5on',
    // north melbourne
    //flyTo: {"center":{"lng":144.91686220714365,"lat":-37.79330210287267},"zoom":18.098035466133457,"bearing":64.79999999999961,"pitch":45}
    // south yarra/prahran ish
    flyTo: { "center": { "lng": 144.984790451856, "lat": -37.83391831182901 }, "zoom": 16.19242336690863, "bearing": -39.99999999999949, "pitch": 60 }
}, {
    name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
    caption: 'How many "Blue Bikes" are ready in each station.',
    column: 'NBBikes',
    delay: 10000,
    dataset: new _sourceData.SourceData('tdvh-n9dv'),
    flyTo: { "center": { "lng": 144.97768414562887, "lat": -37.81998948372839 }, "zoom": 14.670221676238507, "bearing": -57.93230251736117, "pitch": 60 }
}, // bike share
{
    delay: 10000,
    caption: 'The skyline of our city',
    name: 'Building outlines',
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
    }
    // The actual constructor...
    if (this.sourceData.shape === 'point') {
        this.addPointsToMap();
    } else {
        this.addPolygonsToMap();
    }
    this.map.on('mousemove', this.mousemove);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBTkE7QUFDQTtBQUNBO0FBS0EsUUFBUSxHQUFSO0FBQ0E7QUFDQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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O0FBQ0EsMkJBQUssd0JBQUw7QUFDQSx3QkFBSSxPQUFLLEtBQUwsS0FBZSxTQUFuQixFQUNJLE9BQUssaUJBQUw7QUFDSjtBQUNILGlCQVBNLENBQVA7QUFRSCxhQXRCTSxDQUFQO0FBdUJIOztBQUdEOzs7OzRDQUNvQjtBQUFBOztBQUNoQixpQkFBSyxJQUFMLENBQVUsT0FBVixDQUFrQixVQUFDLEdBQUQsRUFBTSxLQUFOLEVBQWdCO0FBQzlCLG9CQUFJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsTUFBd0MsU0FBNUMsRUFDSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLElBQXNDLEVBQXRDO0FBQ0osdUJBQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsRUFBb0MsSUFBSSxVQUFKLENBQXBDLElBQXVELEtBQXZEO0FBQ0gsYUFKRDtBQUtIOzs7dUNBRWMsTyxDQUFRLGlCLEVBQW1CO0FBQ3RDLG1CQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLGdCQUFyQixFQUF1QyxPQUF2QyxDQUFWLENBQVA7QUFDSDs7O3VDQUVjO0FBQUE7O0FBQ1gsbUJBQU8sS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQjtBQUFBLHVCQUFPLElBQUksYUFBSixNQUF1QixPQUFLLGdCQUE1QixJQUFnRCxJQUFJLGlCQUFKLE1BQTJCLHlCQUFsRjtBQUFBLGFBQWpCLENBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbi8vJ3VzZSBzdHJpY3QnO1xuLy92YXIgbWFwYm94Z2wgPSByZXF1aXJlKCdtYXBib3gtZ2wnKTtcbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuaW1wb3J0IHsgRmxpZ2h0UGF0aCB9IGZyb20gJy4vZmxpZ2h0UGF0aCc7XG5pbXBvcnQgeyBkYXRhc2V0cyB9IGZyb20gJy4vY3ljbGVEYXRhc2V0cyc7XG5pbXBvcnQgeyBNYXBWaXMgfSBmcm9tICcuL21hcFZpcyc7XG5jb25zb2xlLmxvZyhkYXRhc2V0cyk7XG4vL21hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pYzNSbGRtRm5aU0lzSW1FaU9pSmphWGh4Y0dzMGJ6Y3dZbk0zTW5ac09XSmlhalZ3YUhKMkluMC5STjdLeXdNT3hMTE5tY1RGZm4wY2lnJztcbm1hcGJveGdsLmFjY2Vzc1Rva2VuID0gJ3BrLmV5SjFJam9pWTJsMGVXOW1iV1ZzWW05MWNtNWxJaXdpWVNJNkltTnBlamRvYjJKMGN6QXdPV1F6TTIxdWJHdDZNRFZxYUhvaWZRLjU1WWJxZVRIV01LX2I2Q0VBbW9VbEEnO1xuLypcblBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uczogeWdhdy02cnpxXG5cbioqVHJlZXM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZnAzOC13aXl5XG5cbkV2ZW50IGJvb2tpbmdzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvIzg0YmYtZGloaVxuQmlrZSBzaGFyZSBzdGF0aW9uczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyN0ZHZoLW45ZHZcbkRBTTogaHR0cDovL2xvY2FsaG9zdDozMDAyLyNnaDdzLXFkYThcbiovXG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmxldCB3aGVuTWFwTG9hZGVkID0gKG1hcCwgZikgPT4gbWFwLmxvYWRlZCgpID8gZigpIDogbWFwLm9uY2UoJ2xvYWQnLCBmKTtcblxubGV0IGNsb25lID0gb2JqID0+IEpTT04ucGFyc2UoSlNPTi5zdHJpbmdpZnkob2JqKSk7XG5cbmNvbnN0IG9wYWNpdHlQcm9wID0ge1xuICAgICAgICAgICAgZmlsbDogJ2ZpbGwtb3BhY2l0eScsXG4gICAgICAgICAgICBjaXJjbGU6ICdjaXJjbGUtb3BhY2l0eScsXG4gICAgICAgICAgICBzeW1ib2w6ICdpY29uLW9wYWNpdHknLFxuICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uJzogJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknXG4gICAgICAgIH07XG5cbi8vIHJldHVybnMgYSB2YWx1ZSBsaWtlICdjaXJjbGUtb3BhY2l0eScsIGZvciBhIGdpdmVuIGxheWVyIHN0eWxlLlxuZnVuY3Rpb24gZ2V0T3BhY2l0eVByb3AobGF5ZXIpIHtcbiAgICBpZiAobGF5ZXIubGF5b3V0ICYmIGxheWVyLmxheW91dFsndGV4dC1maWVsZCddKVxuICAgICAgICByZXR1cm4gJ3RleHQtb3BhY2l0eSc7XG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gb3BhY2l0eVByb3BbbGF5ZXIudHlwZV07XG59XG5cbi8vZmFsc2UgJiYgd2hlbk1hcExvYWRlZCgoKSA9PlxuLy8gIHNldFZpc0NvbHVtbihzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMubGVuZ3RoKV0pKTtcblxuLy8gVE9ETyBkZWNpZGUgaWYgdGhpcyBzaG91bGQgYmUgaW4gTWFwVmlzXG5mdW5jdGlvbiBzaG93RmVhdHVyZVRhYmxlKGZlYXR1cmUsIHNvdXJjZURhdGEsIG1hcHZpcykge1xuICAgIGZ1bmN0aW9uIHJvd3NJbkFycmF5KGFycmF5LCBjbGFzc1N0cikge1xuICAgICAgICByZXR1cm4gJzx0YWJsZT4nICsgXG4gICAgICAgICAgICBPYmplY3Qua2V5cyhmZWF0dXJlKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIoa2V5ID0+IFxuICAgICAgICAgICAgICAgICAgICBhcnJheSA9PT0gdW5kZWZpbmVkIHx8IGFycmF5LmluZGV4T2Yoa2V5KSA+PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAoa2V5ID0+XG4gICAgICAgICAgICAgICAgICAgIGA8dHI+PHRkICR7Y2xhc3NTdHJ9PiR7a2V5fTwvdGQ+PHRkPiR7ZmVhdHVyZVtrZXldfTwvdGQ+PC90cj5gKVxuICAgICAgICAgICAgICAgIC5qb2luKCdcXG4nKSArIFxuICAgICAgICAgICAgJzwvdGFibGU+JztcbiAgICAgICAgfVxuXG4gICAgaWYgKGZlYXR1cmUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAvLyBDYWxsZWQgYmVmb3JlIHRoZSB1c2VyIGhhcyBzZWxlY3RlZCBhbnl0aGluZ1xuICAgICAgICBmZWF0dXJlID0ge307XG4gICAgICAgIHNvdXJjZURhdGEudGV4dENvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG4gICAgICAgIHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuZm9yRWFjaChjID0+IGZlYXR1cmVbY10gPSAnJyk7XG4gICAgICAgIHNvdXJjZURhdGEuYm9yaW5nQ29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcblxuICAgIH0gZWxzZSBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvbHlnb24nKSB7IC8vIFRPRE8gY2hlY2sgdGhhdCB0aGlzIGlzIGEgYmxvY2sgbG9va3VwIGNob3JvcGxldGhcbiAgICAgICAgZmVhdHVyZSA9IHNvdXJjZURhdGEuZ2V0Um93Rm9yQmxvY2soZmVhdHVyZS5ibG9ja19pZCwgZmVhdHVyZS5jZW5zdXNfeXIpOyAgICAgICAgXG4gICAgfVxuXG5cblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdmZWF0dXJlcycpLmlubmVySFRNTCA9IFxuICAgICAgICAnPGg0PkNsaWNrIGEgZmllbGQgdG8gdmlzdWFsaXNlIHdpdGggY29sb3VyPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS50ZXh0Q29sdW1ucywgJ2NsYXNzPVwiZW51bS1maWVsZFwiJykgKyBcbiAgICAgICAgJzxoND5DbGljayBhIGZpZWxkIHRvIHZpc3VhbGlzZSB3aXRoIHNpemU8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLCAnY2xhc3M9XCJudW1lcmljLWZpZWxkXCInKSArIFxuICAgICAgICAnPGg0Pk90aGVyIGZpZWxkczwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEuYm9yaW5nQ29sdW1ucywgJycpO1xuXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjZmVhdHVyZXMgdGQnKS5mb3JFYWNoKHRkID0+IFxuICAgICAgICB0ZC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGUgPT4ge1xuICAgICAgICAgICAgbWFwdmlzLnNldFZpc0NvbHVtbihlLnRhcmdldC5pbm5lclRleHQpIDsgLy8gVE9ETyBoaWdobGlnaHQgdGhlIHNlbGVjdGVkIHJvd1xuICAgICAgICB9KSk7XG59XG5cbnZhciBsYXN0RmVhdHVyZTtcblxuXG5mdW5jdGlvbiBjaG9vc2VEYXRhc2V0KCkge1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsJycpO1xuICAgIH1cblxuICAgIC8vIGtub3duIENMVUUgYmxvY2sgZGF0YXNldHMgdGhhdCB3b3JrIG9rXG4gICAgdmFyIGNsdWVDaG9pY2VzID0gW1xuICAgICAgICAnYjM2ai1raXk0JywgLy8gZW1wbG95bWVudFxuICAgICAgICAnMjM0cS1nZzgzJywgLy8gZmxvb3Igc3BhY2UgYnkgdXNlIGJ5IGJsb2NrXG4gICAgICAgICdjM2d0LWhyejYnIC8vIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzIC0tIHRoaXMgb25lIGlzIGNvbXBsZXRlLCB0aGUgb3RoZXJzIGhhdmUgZ2FwcHkgZGF0YSBmb3IgY29uZmlkZW50aWFsaXR5XG4gICAgXTtcblxuICAgIC8vIGtub3duIHBvaW50IGRhdGFzZXRzIHRoYXQgd29yayBva1xuICAgIHZhciBwb2ludENob2ljZXMgPSBbXG4gICAgICAgICdmcDM4LXdpeXknLCAvLyB0cmVlc1xuICAgICAgICAneWdhdy02cnpxJywgLy8gcGVkZXN0cmlhbiBzZW5zb3IgbG9jYXRpb25zXG4gICAgICAgICc4NGJmLWRpaGknLCAvLyBWZW51ZXMgZm9yIGV2ZW50c1xuICAgICAgICAndGR2aC1uOWR2JywgLy8gTGl2ZSBiaWtlIHNoYXJlXG4gICAgICAgICdnaDdzLXFkYTgnLCAvLyBEQU1cbiAgICAgICAgJ3NmcmctenlnYicsIC8vIENhZmVzIGFuZCBSZXN0YXVyYW50c1xuICAgICAgICAnZXc2ay1jaHo0JywgLy8gQmlvIEJsaXR6IDIwMTZcbiAgICAgICAgJzd2cmQtNGF2NScsIC8vIHdheWZpbmRpbmdcbiAgICAgICAgJ3NzNzktdjU1OCcsIC8vIGJ1cyBzdG9wc1xuICAgICAgICAnbWZmaS1tOXluJywgLy8gcHVic1xuICAgICAgICAnc3Z1eC1iYWRhJywgLy8gc29pbCB0ZXh0dXJlcyAtIG5pY2Ugb25lXG4gICAgICAgICdxandjLWY1c2gnLCAvLyBjb21tdW5pdHkgZm9vZCBndWlkZSAtIGdvb2RcbiAgICAgICAgJ2Z0aGktemFqeScsIC8vIHByb3BlcnRpZXMgb3ZlciAkMi41bVxuICAgICAgICAndHg4aC0yamdpJywgLy8gYWNjZXNzaWJsZSB0b2lsZXRzXG4gICAgICAgICc2dTV6LXVidmgnLCAvLyBiaWN5Y2xlIHBhcmtpbmdcbiAgICAgICAgLy9iczduLTV2ZWgsIC8vIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzLiAxMDAsMDAwIHJvd3MsIHRvbyBmcmFnaWxlLlxuICAgICAgICBdO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnI2NhcHRpb24gaDEnKVswXS5pbm5lckhUTUwgPSAnTG9hZGluZyByYW5kb20gZGF0YXNldC4uLic7XG4gICAgXG4gICAgcmV0dXJuICdjM2d0LWhyejYnO1xufVxuXG5mdW5jdGlvbiBzaG93Q2FwdGlvbihuYW1lLCBkYXRhSWQsIGNhcHRpb24pIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbiBoMScpLmlubmVySFRNTCA9IC8qKF9kYXRhc2V0Tm8gfHwgJycpICsgKi8oY2FwdGlvbiB8fCBuYW1lIHx8ICcnKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZm9vdGVyIC5kYXRhc2V0JykuaW5uZXJIVE1MID0gbmFtZSB8fCAnJztcbiAgICBcbiAgICAvLyBUT0RPIHJlaW5zdGF0ZSBmb3Igbm9uLWRlbW8gbW9kZS5cbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb3VyY2UnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2QvJyArIGRhdGFJZCk7XG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hhcmUnKS5pbm5lckhUTUwgPSBgU2hhcmUgdGhpczogPGEgaHJlZj1cImh0dHBzOi8vY2l0eS1vZi1tZWxib3VybmUuZ2l0aHViLmlvL0RhdGEzRC8jJHtkYXRhSWR9XCI+aHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH08L2E+YDsgICAgXG4gXG4gfVxuXG4gZnVuY3Rpb24gdHdlYWtCYXNlbWFwKG1hcCkge1xuICAgIHZhciBwbGFjZWNvbG9yID0gJyM4ODgnOyAvLydyZ2IoMjA2LCAyMTksIDE3NSknO1xuICAgIHZhciByb2FkY29sb3IgPSAnIzc3Nyc7IC8vJ3JnYigyNDAsIDE5MSwgMTU2KSc7XG4gICAgbWFwLmdldFN0eWxlKCkubGF5ZXJzLmZvckVhY2gobGF5ZXIgPT4ge1xuICAgICAgICBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNjAlKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCAyMCUpJyk7XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDcwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA3OCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDQ1JSknKTsgLy8gcm9hZHMgbW9zdGx5XG4gICAgICAgIGVsc2UgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDkwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgNTAlKScpO1xuICAgIH0pO1xuICAgIFsncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnLCAncG9pLXBhcmtzLXNjYWxlcmFuazEnXS5mb3JFYWNoKGlkID0+IHtcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoaWQsICd0ZXh0LWNvbG9yJywgJyMzMzMnKTtcbiAgICB9KTtcblxuICAgIG1hcC5yZW1vdmVMYXllcigncGxhY2UtY2l0eS1sZy1zJyk7IC8vIHJlbW92ZSB0aGUgTWVsYm91cm5lIGxhYmVsIGl0c2VsZi5cblxufVxuXG4vKlxuICBSZWZyZXNoIHRoZSBtYXAgdmlldyBmb3IgdGhpcyBuZXcgZGF0YXNldC5cbiovXG5mdW5jdGlvbiBzaG93RGF0YXNldChtYXAsIGRhdGFzZXQsIGZpbHRlciwgY2FwdGlvbiwgbm9GZWF0dXJlSW5mbywgb3B0aW9ucywgaW52aXNpYmxlKSB7XG4gICAgXG4gICAgb3B0aW9ucyA9IGRlZihvcHRpb25zLCB7fSk7XG4gICAgaWYgKGludmlzaWJsZSkge1xuICAgICAgICBvcHRpb25zLmludmlzaWJsZSA9IHRydWU7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgY2FwdGlvbik7XG4gICAgfVxuXG4gICAgbGV0IG1hcHZpcyA9IG5ldyBNYXBWaXMobWFwLCBkYXRhc2V0LCBmaWx0ZXIsICFub0ZlYXR1cmVJbmZvPyBzaG93RmVhdHVyZVRhYmxlIDogbnVsbCwgb3B0aW9ucyk7XG5cbiAgICBzaG93RmVhdHVyZVRhYmxlKHVuZGVmaW5lZCwgZGF0YXNldCwgbWFwdmlzKTsgXG4gICAgcmV0dXJuIG1hcHZpcztcbn1cblxuZnVuY3Rpb24gYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpIHtcbiAgICBpZiAoIW1hcC5nZXRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlKSkge1xuICAgICAgICBtYXAuYWRkU291cmNlKGRhdGFzZXQubWFwYm94LnNvdXJjZSwge1xuICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsXG4gICAgICAgICAgICB1cmw6IGRhdGFzZXQubWFwYm94LnNvdXJjZVxuICAgICAgICB9KTtcbiAgICB9XG59XG4vKlxuICBTaG93IGEgZGF0YXNldCB0aGF0IGFscmVhZHkgZXhpc3RzIG9uIE1hcGJveFxuKi9cbmZ1bmN0aW9uIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCwgaW52aXNpYmxlKSB7XG4gICAgYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpO1xuICAgIGxldCBzdHlsZSA9IG1hcC5nZXRMYXllcihkYXRhc2V0Lm1hcGJveC5pZCk7XG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICAvL2lmIChpbnZpc2libGUpXG4gICAgICAgICAgICAvL2RhdGFzZXQubWFwYm94XG4gICAgICAgIHN0eWxlID0gY2xvbmUoZGF0YXNldC5tYXBib3gpO1xuICAgICAgICBpZiAoaW52aXNpYmxlKSB7XG4gICAgICAgICAgICBzdHlsZS5wYWludFtnZXRPcGFjaXR5UHJvcChzdHlsZSldID0gMDtcbiAgICAgICAgfVxuICAgICAgICBtYXAuYWRkTGF5ZXIoc3R5bGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGRhdGFzZXQubWFwYm94LmlkLCBnZXRPcGFjaXR5UHJvcChzdHlsZSksIDAuOSk7IC8vIFRPRE8gc2V0IHJpZ2h0IG9wYWNpdHlcbiAgICB9XG5cbiAgICBpZiAoIWludmlzaWJsZSkgXG4gICAgICAgIHNob3dDYXB0aW9uKGRhdGFzZXQubmFtZSwgZGF0YXNldC5kYXRhSWQsIGRhdGFzZXQuY2FwdGlvbik7XG59XG5cbmxldCBfZGF0YXNldE5vPScnO1xuLyogQWR2YW5jZSBhbmQgZGlzcGxheSB0aGUgbmV4dCBkYXRhc2V0IGluIG91ciBsb29wICovXG4gICAgLypcbiAgICAgICAgUHJlLWxvYWQgZGF0YXNldHMgYnk6XG4gICAgICAgIC0gY2FsbGluZyB0aGUgbG9hZC9kaXNwbGF5IGNvZGUgZm9yIHRoZSBuZXh0IGRhdGFzZXQgbm93LCBidXQgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgLSBrZWVwaW5nIHRyYWNrIG9mIHRoZSBsYXllciBJRFxuICAgICAgICAtIGlmIGl0J3MgcHJlc2VudCB3aGVuIHRoZSBkYXRhc2V0IGdldHMgXCJzaG93blwiLCBcbiAgICAqL1xuZnVuY3Rpb24gbmV4dERhdGFzZXQobWFwLCBkYXRhc2V0Tm8pIHtcbiAgICBmdW5jdGlvbiBkaXNwbGF5RGF0YXNldChkLCBpbnZpc2libGUpIHtcbiAgICAgICAgaWYgKGQubWFwYm94KSB7XG4gICAgICAgICAgICBzaG93TWFwYm94RGF0YXNldChtYXAsIGQsIGludmlzaWJsZSk7XG4gICAgICAgICAgICBpZiAoIWludmlzaWJsZSkge1xuICAgICAgICAgICAgICAgIHNob3dDYXB0aW9uKGQubmFtZSwgdW5kZWZpbmVkLCBkLmNhcHRpb24pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZC5tYXB2aXMgPSBzaG93RGF0YXNldChtYXAsIGQuZGF0YXNldCwgZC5maWx0ZXIsIGQuY2FwdGlvbiwgdHJ1ZSwgZC5vcHRpb25zLCAgaW52aXNpYmxlKTtcbiAgICAgICAgICAgIGQubWFwdmlzLnNldFZpc0NvbHVtbihkLmNvbHVtbik7XG4gICAgICAgICAgICBkLmxheWVySWQgPSBkLm1hcHZpcy5sYXllcklkO1xuICAgICAgICAgICAgaWYgKCFpbnZpc2libGUpIHtcbiAgICAgICAgICAgICAgICBzaG93Q2FwdGlvbihkLmRhdGFzZXQubmFtZSwgZC5kYXRhc2V0LmRhdGFJZCwgZC5jYXB0aW9uKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIF9kYXRhc2V0Tm8gPSBkYXRhc2V0Tm87XG4gICAgbGV0IGQgPSBkYXRhc2V0c1tkYXRhc2V0Tm9dLCBcbiAgICAgICAgbmV4dEQgPSBkYXRhc2V0c1soZGF0YXNldE5vICsgMSkgJSBkYXRhc2V0cy5sZW5ndGhdO1xuICAgICAgICAvL21hcHZpcztcblxuICAgIGlmIChkLmxheWVySWQpIHtcbiAgICAgICAgLy8gbGF5ZXIgaXMgcHJlLWxvYWRlZFxuICAgICAgICAvLyBUT0RPIGNoYW5nZSAwLjkgdG8gc29tZXRoaW5nIHNwZWNpZmljIGZvciBlYWNoIHR5cGVcbiAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkoZC5sYXllcklkLCBnZXRPcGFjaXR5UHJvcChtYXAuZ2V0TGF5ZXIoZC5sYXllcklkKSksIDAuOSk7XG4gICAgICAgIGlmIChkLm1hcGJveCkgeyAvLyBUT0RPIHJlbW92ZSB0aGlzIHJlcGV0aXRpb25cbiAgICAgICAgICAgIHNob3dDYXB0aW9uKGQubmFtZSwgdW5kZWZpbmVkLCBkLmNhcHRpb24pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hvd0NhcHRpb24oZC5kYXRhc2V0Lm5hbWUsIGQuZGF0YXNldC5kYXRhSWQsIGQuY2FwdGlvbik7XG4gICAgICAgIH1cbiAgICAgICAgLy9tYXB2aXMgPSBkLm1hcHZpczsgXG4gICAgfSBlbHNlIFxuICAgICAgICBkaXNwbGF5RGF0YXNldChkLCBmYWxzZSk7XG5cbiAgICAvLyBsb2FkLCBidXQgZG9uJ3Qgc2hvdywgbmV4dCBvbmUuIC8vIENvbW1lbnQgb3V0IHRoZSBuZXh0IGxpbmUgdG8gbm90IGRvIHRoZSBwcmUtbG9hZGluZyB0aGluZy5cbiAgICBkaXNwbGF5RGF0YXNldChuZXh0RCwgdHJ1ZSk7XG5cbiAgICBpZiAoZC5zaG93TGVnZW5kKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmRzJykuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgIH1cblxuICAgIC8vIFdlJ3JlIGFpbWluZyB0byBhcnJpdmUgYXQgdGhlIHZpZXdwb2ludCAxLzMgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgYXBwZWFyYW5jZVxuICAgIC8vIGFuZCBsZWF2ZSAyLzMgb2YgdGhlIHdheSB0aHJvdWdoLlxuICAgIGlmIChkLmZseVRvICYmICFtYXAuaXNNb3ZpbmcoKSkge1xuICAgICAgICBkLmZseVRvLmR1cmF0aW9uID0gZC5kZWxheS8zOy8vIHNvIGl0IGxhbmRzIGFib3V0IGEgdGhpcmQgb2YgdGhlIHdheSB0aHJvdWdoIHRoZSBkYXRhc2V0J3MgdmlzaWJpbGl0eS5cbiAgICAgICAgbWFwLmZseVRvKGQuZmx5VG8pO1xuICAgIH1cbiAgICBcbiAgICBpZiAobmV4dEQuZmx5VG8pIHtcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkLmRlbGF5LzMuMCArIG5leHRELmRlbGF5LzMuMDsvLyBzbyBpdCBsYW5kcyBhYm91dCBhIHRoaXJkIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIHZpc2liaWxpdHkuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbWFwLmZseVRvKG5leHRELmZseVRvKTtcbiAgICAgICAgfSwgZC5kZWxheSAqIDIuMC8zLjApO1xuICAgIH1cblxuICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICBpZiAoZC5tYXB2aXMpXG4gICAgICAgICAgICBkLm1hcHZpcy5yZW1vdmUoKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChkLm1hcGJveClcbiAgICAgICAgICAgIG1hcC5yZW1vdmVMYXllcihkLm1hcGJveC5pZCk7XG5cbiAgICAgICAgXG4gICAgfSwgZC5kZWxheSArIDApOyAvKmRlZihkLmxpbmdlciwgMTAwMCkpOyAqLy8vIGxldCBpdCBsaW5nZXIgYSBiaXQgd2hpbGUgdGhlIG5leHQgb25lIGlzIGxvYWRpbmcuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIG5leHREYXRhc2V0KG1hcCwgKGRhdGFzZXRObyArIDEpICUgZGF0YXNldHMubGVuZ3RoKTtcbiAgICB9LCBkLmRlbGF5ICk7XG59XG5cbi8qIFByZSBkb3dubG9hZCBhbGwgZGF0YXNldHMgaW4gdGhlIGxvb3AgKi9cbmZ1bmN0aW9uIGxvYWREYXRhc2V0cyhtYXApIHtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGRhdGFzZXRzLm1hcChkID0+IHsgXG4gICAgICAgICAgICBpZiAoZC5kYXRhc2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiBkLmRhdGFzZXQubG9hZCgpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAvLyBzdHlsZSBpc24ndCBkb25lIGxvYWRpbmcgc28gd2UgY2FuJ3QgYWRkIHNvdXJjZXMuIG5vdCBzdXJlIGl0IHdpbGwgYWN0dWFsbHkgdHJpZ2dlciBkb3dubG9hZGluZyBhbnl3YXkuXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlIChhZGRNYXBib3hEYXRhc2V0KG1hcCwgZCkpO1xuICAgICAgICB9KSkudGhlbigoKSA9PiBkYXRhc2V0c1swXS5kYXRhc2V0KTtcbn1cblxuZnVuY3Rpb24gbG9hZE9uZURhdGFzZXQoKSB7XG4gICAgbGV0IGRhdGFzZXQgPSBjaG9vc2VEYXRhc2V0KCk7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VEYXRhKGRhdGFzZXQpLmxvYWQoKTtcbiAgICAvKmlmIChkYXRhc2V0Lm1hdGNoKC8uLi4uLS4uLi4vKSlcbiAgICAgICAgXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpOyovXG59XG5cbihmdW5jdGlvbiBzdGFydCgpIHtcbiAgICBsZXQgZGVtb01vZGUgPSB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gJyNkZW1vJztcbiAgICBpZiAoZGVtb01vZGUpIHtcbiAgICAgICAgLy8gaWYgd2UgZGlkIHRoaXMgYWZ0ZXIgdGhlIG1hcCB3YXMgbG9hZGluZywgY2FsbCBtYXAucmVzaXplKCk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgICAgICAgXG4gICAgfVxuXG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9MicsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDE1LC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCgpLCAndG9wLWxlZnQnKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywgKCkgPT4gdHdlYWtCYXNlbWFwKG1hcCkpO1xuICAgIG1hcC5vbignbW92ZWVuZCcsIGU9PiB7XG4gICAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgICAgIGNlbnRlcjogbWFwLmdldENlbnRlcigpLFxuICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIGJlYXJpbmc6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICBwaXRjaDogbWFwLmdldFBpdGNoKClcbiAgICAgICAgfSk7XG4gICAgfSk7XG5cbiAgICAoZGVtb01vZGUgPyBsb2FkRGF0YXNldHMobWFwKSA6IGxvYWRPbmVEYXRhc2V0KCkpXG4gICAgLnRoZW4oZGF0YXNldCA9PiB7XG4gICAgICAgIFxuICAgICAgICBpZiAoZGF0YXNldCkgXG4gICAgICAgICAgICBzaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkKTtcblxuICAgICAgICB3aGVuTWFwTG9hZGVkKG1hcCwgKCkgPT4ge1xuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAxMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNob3dEYXRhc2V0KG1hcCwgZGF0YXNldCk7XG4gICAgICAgICAgICAgICAgLy8gd291bGQgYmUgbmljZSB0byBzdXBwb3J0IGxvYWRpbmcgbWFwYm94IGRhdGFzZXRzIGJ1dFxuICAgICAgICAgICAgICAgIC8vIGl0J3MgYSBmYWZmIHRvIGd1ZXNzIGhvdyB0byBzdHlsZSBpdFxuICAgICAgICAgICAgICAgIC8vaWYgKGRhdGFzZXQubWF0Y2goLy4uLi4tLi4uLi8pKVxuICAgICAgICAgICAgICAgIC8vZWxzZVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbG9hZGluZycpWzBdLm91dGVySFRNTD0nJztcblxuICAgICAgICAgICAgaWYgKGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICAgICAgLy92YXIgZnAgPSBuZXcgRmxpZ2h0UGF0aChtYXApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgXG5cbiAgICB9KTtcbn0pKCk7XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbi8qXG5cbkRhdGFzZXQgcnVuIG9yZGVyXG4tIGJ1aWxkaW5ncyAoM0QpXG4tIHRyZWVzIChmcm9tIG15IG9wZW50cmVlcyBhY2NvdW50KVxuLSBjYWZlcyAoY2l0eSBvZiBtZWxib3VybmUsIHN0eWxlZCB3aXRoIGNvZmZlZSBzeW1ib2wpXG4tIGJhcnMgKHNpbWlsYXIpXG4tIGdhcmJhZ2UgY29sbGVjdGlvbiB6b25lc1xuLSBkb2cgd2Fsa2luZyB6b25lc1xuLSBDTFVFICgzRCBibG9ja3MpXG4tLSBidXNpbmVzcyBlc3RhYmxpc2htZW50cyBwZXIgYmxvY2tcbi0tLSB2YXJpb3VzIHR5cGVzLCB0aGVuIHRvdGFsXG4tLSBlbXBsb3ltZW50ICh2YXJpb3VzIHR5cGVzIHdpdGggc3BlY2lmaWMgdmFudGFnZSBwb2ludHMgLSBiZXdhcmUgdGhhdCBub3QgYWxsIGRhdGEgaW5jbHVkZWQ7IHRoZW4gdG90YWwpXG4tLSBmbG9vciB1c2UgKGRpdHRvKVxuXG5cblxuXG5NaW5pbXVtXG4tIGZsb2F0eSBjYW1lcmFzXG4tIGNsdWUgM0QsXG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcblxuSGVhZGVyOlxuLSBkYXRhc2V0IG5hbWVcbi0gY29sdW1uIG5hbWVcblxuRm9vdGVyOiBkYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1XG5cbkNvTSBsb2dvXG5cblxuTWVkaXVtXG4tIE11bmljaXBhbGl0eSBib3VuZGFyeSBvdmVybGFpZFxuXG5TdHJldGNoIGdvYWxzXG4tIG92ZXJsYXkgYSB0ZXh0IGxhYmVsIG9uIGEgYnVpbGRpbmcvY2x1ZWJsb2NrIChlZywgRnJlZW1hc29ucyBIb3NwaXRhbCAtIHRvIHNob3cgd2h5IHNvIG11Y2ggaGVhbHRoY2FyZSlcblxuXG5cblxuXG4qL1xuXG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcblxuZXhwb3J0IGNvbnN0IGRhdGFzZXRzID0gW1xuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdGb29kIHNlcnZpY2VzIGF2YWlsYWJsZSBmcmVlIG9yIGxvdyBjb3N0IHRvIG91ciBjb21tdW5pdHknLFxuICAgICAgICBuYW1lOiAnQ29tbXVuaXR5IGZvb2Qgc2VydmljZXMgd2l0aCBvcGVuaW5nIGhvdXJzLCBwdWJsaWMgdHJhbnNwb3J0IGFuZCBwYXJraW5nIG9wdGlvbnMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZm9vZCcsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43eHZrMGszbCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0NvbW11bml0eV9mb29kX3NlcnZpY2VzX3dpdGhfLWE3Y2o5dicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ3JnYigyNDksIDI0MywgMTc4KScsIC8vIGEgY2l0eSBmb3IgcGVvcGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05hbWV9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTIsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ5MjI1MTQzODMwNyxcImxhdFwiOi0zNy44MDMxMDk3MjcyNzI4MX0sXCJ6b29tXCI6MTUuMzU4NTA5Nzg5NzkwODA4LFwiYmVhcmluZ1wiOi03OC4zOTk5OTk5OTk5OTk3LFwicGl0Y2hcIjo1OC41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlIGhlYWx0aCBhbmQgdHlwZSBvZiBlYWNoIHRyZWUgaW4gb3VyIHVyYmFuIGZvcmVzdCcsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC42XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0luY2x1ZGluZyBndW0gdHJlZXMnLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ3VtdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ0V1Y2FseXB0dXMnLCAnQ29yeW1iaWEnLCAnQW5nb3Bob3JhJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljg0NzM3NDg4Njg5MDcsXCJsYXRcIjotMzcuODExNzc5NzQwNzg3MjQ0fSxcInpvb21cIjoxMy4xNjI1MjQxNTA4NDczMTUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQyNzMyNTY3MzMzMSxcImxhdFwiOi0zNy43ODQ0NDk0MDU5MzAzOH0sXCJ6b29tXCI6MTQuNSxcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICAvL2RhdGFzZXRMZWFkOiAzMDAwLFxuICAgICAgICBjYXB0aW9uOiAnQW5kIE1lbGJvdXJuZVxcJ3MgZmFtb3VzIExvbmRvbiBwbGFuZSB0cmVlcy4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAncGxhbmV0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdQbGF0YW51cycgXVxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzOTQ2MzM4Mzg5NjUsXCJsYXRcIjotMzcuNzk1ODg4NzA2NjgyNzF9LFwiem9vbVwiOjE1LjkwNTEzMDM2MTQ0NjY2OCxcImJlYXJpbmdcIjoxNTcuNTk5OTk5OTk5OTk3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU1MyxcImxhdFwiOi0zNy44MDQzODU5NDkyNzYzOTR9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjExOS43ODg2ODY4Mjg4MjM3NCxcInBpdGNoXCI6NjB9XG4gICAgICAgIFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE0Nzg1MTAwMTYyMDIsXCJsYXRcIjotMzcuNzg0MzQxNDcxNjc0Nzd9LFwiem9vbVwiOjEzLjkyMjIyODQ2MTc5MzY2OSxcImJlYXJpbmdcIjoxMjIuOTk0NzgzNDYwNDM0NixcInBpdGNoXCI6NDcuNTAwMDAwMDAwMDAwMDN9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTM0MzQ1MDc1NTE2LFwibGF0XCI6LTM3LjgwMTM0MTE4MDEyNTIyfSxcInpvb21cIjoxNSxcImJlYXJpbmdcIjoxNTEuMDAwNzMwNDg4MjczMzgsXCJwaXRjaFwiOjU4Ljk5OTk5OTk5OTk5OTk5fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU2MTM4ODQ4ODQwOSxcImxhdFwiOi0zNy44MDkwMjcxMDUzMTYzMn0sXCJ6b29tXCI6MTQuMjQxNzU3MDMwODE2NjM2LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIFxuICAgICAgICBjb2x1bW46ICdUb3RhbCBlbXBsb3ltZW50IGluIGJsb2NrJyAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgQ2Vuc3VzIG9mIExhbmQgVXNlIGFuZCBFbXBsb3ltZW50IChDTFVFKSByZXZlYWxzIHdoZXJlIGVtcGxveW1lbnQgaXMgY29uY2VudHJhdGVkJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU3LFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjQ5NH0sXCJ6b29tXCI6MTMuODg2Mjg3MzIwMTU5ODEsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTg1MzM0NTYyMTQsXCJsYXRcIjotMzcuODM1ODE5MTYyNDM2NjF9LFwiem9vbVwiOjEzLjY0OTExNjYxNDg3MjgzNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICB9LFxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OjEyMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hlcmUgdGhlIENvdW5jaWxcXCdzIHNpZ25pZmljYW50IHByb3BlcnR5IGhvbGRpbmdzIGFyZSBsb2NhdGVkLicsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdmdGhpLXphanknKSxcbiAgICAgICAgY29sdW1uOiAnT3duZXJzaGlwIG9yIENvbnRyb2wnLFxuICAgICAgICBzaG93TGVnZW5kOiB0cnVlLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzkwMzA4NzIzODQ2LFwibGF0XCI6LTM3LjgxODYzMTY2MDgxMDQyNX0sXCJ6b29tXCI6MTMuNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cblxuICAgIH0sXG4gICAgKi9cbiAgICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnVHJhbnNwb3J0LCBQb3N0YWwgYW5kIFN0b3JhZ2UnICxcbiAgICAgICAgY2FwdGlvbjogJy4uLndoZXJlIHRoZSB0cmFuc3BvcnQsIHBvc3RhbCBhbmQgc3RvcmFnZSBzZWN0b3IgaXMgY29uY2VudHJhdGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI3NjgxNzY3MTA3MTIsXCJsYXRcIjotMzcuODI5MjE4MjQ4NTg3MjQ2fSxcInpvb21cIjoxMi43Mjg0MzEyMTc5MTQ5MTksXCJiZWFyaW5nXCI6NjguNzAzODgzMTIxODc0NTgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnSGVhbHRoIENhcmUgYW5kIFNvY2lhbCBBc3Npc3RhbmNlJyAsXG4gICAgICAgIGNhcHRpb246ICdhbmQgd2hlcmUgdGhlIGhlYWx0aGNhcmUgYW5kIHNvY2lhbCBhc3Npc3RhbmNlIG9yZ2FuaXNhdGlvbnMgYXJlIGJhc2VkLicsXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTcyMzMxMTIxODUzLFwibGF0XCI6LTM3LjgyNzA2Mzc0NzYzODI0fSxcInpvb21cIjoxMy4wNjM3NTczODYyMzIyNDIsXCJiZWFyaW5nXCI6MjYuMzc0Nzg2OTE4NTIzMzQsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBsaW5nZXI6MTAwMDAsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ0RldmVsb3BtZW50IEFjdGl2aXR5IE1vbml0b3IgdHJhY2tzIG1ham9yIHByb2plY3RzIGluIHRoZSBwbGFubmluZyBzdGFnZScsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgbGluZ2VyOjUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLnVuZGVyIGNvbnN0cnVjdGlvbicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDUwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQ09NUExFVEVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLmFuZCB0aG9zZSBhbHJlYWR5IGNvbXBsZXRlZC4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuICAgIFxuXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgbGluZ2VyOiA1MDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hlcmUgeW91IGNhbiB3YWxrIHlvdXIgZG9nIG9mZiB0aGUgbGVhc2gnLFxuICAgICAgICBuYW1lOiAnZG9nem9uZXMtb2ZmbGVhc2gnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnMicsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuY2x6YXAyamUnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdEb2dfV2Fsa2luZ19ab25lcy0zZmg5cTQnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsIC8vaHNsKDM0MCwgOTclLCA0NSUpXG4gICAgICAgICAgICAgICAgJ2ZpbGwtb3BhY2l0eSc6IDAuOFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyc9PScsICdzdGF0dXMnLCAnb2ZmbGVhc2gnXVxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg2MTM5ODc3MzI5MzIsXCJsYXRcIjotMzcuODM4ODgyNjY1OTYxODd9LFwiem9vbVwiOjE1LjA5NjQxOTU3OTQzMjg3OCxcImJlYXJpbmdcIjotMzAsXCJwaXRjaFwiOjU3LjQ5OTk5OTk5OTk5OTk5fVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIG5hbWU6ICdTdHJlZXQgYWRkcmVzc2VzJyxcbiAgICAgICAgY2FwdGlvbjogJ0V2ZXJ5IHNpbmdsZSBzdHJlZXQgYWRkcmVzcyBpbiB0aGUgbXVuaWNpcGFsaXR5JyxcbiAgICAgICAgLy8gbmVlZCB0byB6b29tIGluIGNsb3NlIG9uIHRoaXMgb25lXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhZGRyZXNzZXMnLFxuICAgICAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuM2lwM2NvdW8nLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdTdHJlZXRfYWRkcmVzc2VzLTk3ZTVvbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tzdHJlZXRfbm99JyxcbiAgICAgICAgICAgICAgICAndGV4dC1hbGxvdy1vdmVybGFwJzogdHJ1ZSxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTAsXG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vbWFwYm94cG9pbnRzOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJy8vJ1N0cmVldF9hZGRyZXNzZXMtOTdlNW9uJyxcbiAgICAgICAgLy8gbm9ydGggbWVsYm91cm5lXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTY4NjIyMDcxNDM2NSxcImxhdFwiOi0zNy43OTMzMDIxMDI4NzI2N30sXCJ6b29tXCI6MTguMDk4MDM1NDY2MTMzNDU3LFwiYmVhcmluZ1wiOjY0Ljc5OTk5OTk5OTk5OTYxLFwicGl0Y2hcIjo0NX1cbiAgICAgICAgLy8gc291dGggeWFycmEvcHJhaHJhbiBpc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ3OTA0NTE4NTYsXCJsYXRcIjotMzcuODMzOTE4MzExODI5MDF9LFwiem9vbVwiOjE4LFwiYmVhcmluZ1wiOi0zOS45OTk5OTk5OTk5OTk0OSxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnQW5kIHByb3BlcnR5IGJvdW5kYXJ5JyxcbiAgICAgICAgLy8gbmVlZCB0byB6b29tIGluIGNsb3NlIG9uIHRoaXMgb25lXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiAyXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvL21hcGJveHBvaW50czogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycvLydTdHJlZXRfYWRkcmVzc2VzLTk3ZTVvbicsXG4gICAgICAgIC8vIG5vcnRoIG1lbGJvdXJuZVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTE2ODYyMjA3MTQzNjUsXCJsYXRcIjotMzcuNzkzMzAyMTAyODcyNjd9LFwiem9vbVwiOjE4LjA5ODAzNTQ2NjEzMzQ1NyxcImJlYXJpbmdcIjo2NC43OTk5OTk5OTk5OTk2MSxcInBpdGNoXCI6NDV9XG4gICAgICAgIC8vIHNvdXRoIHlhcnJhL3ByYWhyYW4gaXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0NzkwNDUxODU2LFwibGF0XCI6LTM3LjgzMzkxODMxMTgyOTAxfSxcInpvb21cIjoxNi4xOTI0MjMzNjY5MDg2MyxcImJlYXJpbmdcIjotMzkuOTk5OTk5OTk5OTk5NDksXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgbmFtZTogJ01lbGJvdXJuZSBCaWtlIFNoYXJlIHN0YXRpb25zLCB3aXRoIGN1cnJlbnQgbnVtYmVyIG9mIGZyZWUgYW5kIHVzZWQgZG9ja3MgKGV2ZXJ5IDE1IG1pbnV0ZXMpJyxcbiAgICAgICAgY2FwdGlvbjogJ0hvdyBtYW55IFwiQmx1ZSBCaWtlc1wiIGFyZSByZWFkeSBpbiBlYWNoIHN0YXRpb24uJyxcbiAgICAgICAgY29sdW1uOiAnTkJCaWtlcycsXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTc3Njg0MTQ1NjI4ODcsXCJsYXRcIjotMzcuODE5OTg5NDgzNzI4Mzl9LFwiem9vbVwiOjE0LjY3MDIyMTY3NjIzODUwNyxcImJlYXJpbmdcIjotNTcuOTMyMzAyNTE3MzYxMTcsXCJwaXRjaFwiOjYwfVxuICAgIH0sIC8vIGJpa2Ugc2hhcmVcbiAgICB7XG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlIHNreWxpbmUgb2Ygb3VyIGNpdHknLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjYsXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnRXZlcnkgY2FmZSBhbmQgcmVzdGF1cmFudCcsXG4gICAgICAgIG5hbWU6ICdDYWZlcyBhbmQgUmVzdGF1cmFudHMgb25seScsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdzZnJnLXp5Z2InKSxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDk4Nzg5OTkyOTY0LFwibGF0XCI6LTM3LjgxMDIxMzEwNDA0NzQ5fSxcInpvb21cIjoxNi4wMjc3MzIzMzIwMTY5OSxcImJlYXJpbmdcIjotMTM1LjIxOTc1MzA4NjQxOTgxLFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdjYWZlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbl07XG5leHBvcnQgY29uc3QgZGF0YXNldHMyID0gW1xuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3QgYXBwbGljYXRpb25zJyxcblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBST1ZFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyBhcHByb3ZlZCcgXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nIFxuICAgIH0sIFxuICAgIHsgZGVsYXk6IDUwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSB9LCAvLyBiaWtlIHNoYXJlXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdBY2NvbW1vZGF0aW9uJyB9LFxuICAgIHsgZGVsYXk6IDEwMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIGNvbHVtbjogJ0FydHMgYW5kIFJlY3JlYXRpb24gU2VydmljZXMnIH0sXG4gICAgLy97IGRlbGF5OiAzMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ1JldGFpbCBUcmFkZScgfSxcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0NvbnN0cnVjdGlvbicgfVxuICAgIC8veyBkZWxheTogMTAwMCwgZGF0YXNldDogJ2IzNmota2l5NCcgfSxcbiAgICAvL3sgZGVsYXk6IDIwMDAsIGRhdGFzZXQ6ICcyMzRxLWdnODMnIH1cbl07XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmltcG9ydCB7IG1lbGJvdXJuZVJvdXRlIH0gZnJvbSAnLi9tZWxib3VybmVSb3V0ZSc7XG5cbi8qXG5Db250aW51b3VzbHkgbW92ZXMgdGhlIE1hcGJveCB2YW50YWdlIHBvaW50IGFyb3VuZCBhIEdlb0pTT04tZGVmaW5lZCBwYXRoLlxuKi9cblxuZnVuY3Rpb24gd2hlbkxvYWRlZChtYXAsIGYpIHtcbiAgICBpZiAobWFwLmxvYWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbHJlYWR5IGxvYWRlZC4nKTtcbiAgICAgICAgZigpO1xuICAgIH1cbiAgICBlbHNlIHsgXG4gICAgICAgIGNvbnNvbGUubG9nKCdXYWl0IGZvciBsb2FkJyk7XG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG4gICAgfVxufVxuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5leHBvcnQgY2xhc3MgRmxpZ2h0UGF0aCB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXAsIHJvdXRlKSB7XG4gICAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMucm91dGUgPSBtZWxib3VybmVSb3V0ZTtcblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMC4wMTtcblxuICAgICAgICB0aGlzLnBvc05vID0gMDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IHRoaXMucm91dGUuZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKHtcbiAgICAgICAgICAgIGNlbnRlcjogZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgIHpvb206IGRlZihmZWF0dXJlLnByb3BlcnRpZXMuem9vbSwgMTQpLFxuICAgICAgICAgICAgYmVhcmluZzogZmVhdHVyZS5wcm9wZXJ0aWVzLmJlYXJpbmcsXG4gICAgICAgICAgICBwaXRjaDogZGVmKGZlYXR1cmUucHJvcGVydGllcy5waXRjaCwgNjApXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5iZWFyaW5nPTA7XG5cbiAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cblxuXG4gICAgLyp2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICB7IGNlbnRlcjogWzE0NC45NiwgLTM3LjhdLCB6b29tOiAxNSwgYmVhcmluZzogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OCwgLTM3Ljg0XSwgem9vbTogMTUsIGJlYXJpbmc6IDE2MCwgcGl0Y2g6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTk1LCAtMzcuODI1XSwgem9vbTogMTUsIGJlYXJpbmc6IC05MH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk3LCAtMzcuODJdLCB6b29tOiAxNSwgYmVhcmluZzogMTQwfVxuXG4gICAgXTsqL1xuXG4gICAgICAgIHRoaXMubW92ZUNhbWVyYSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbW92ZUNhbWVyYScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zaXRpb25zW3RoaXMucG9zTm9dO1xuICAgICAgICAgICAgcG9zLnNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIHBvcy5jdXJ2ZSA9IDAuNDg7IC8vMTtcbiAgICAgICAgICAgIHBvcy5lYXNpbmcgPSAodCkgPT4gdDsgLy8gbGluZWFyIGVhc2luZ1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmx5VG8nKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmZseVRvKHBvcywgeyBzb3VyY2U6ICdmbGlnaHRwYXRoJyB9KTtcblxuICAgICAgICAgICAgdGhpcy5wb3NObyA9ICh0aGlzLnBvc05vICsgMSkgJSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFwLnJvdGF0ZVRvKGJlYXJpbmcsIHsgZWFzaW5nOiBlYXNpbmcgfSk7XG4gICAgICAgICAgICAvL2JlYXJpbmcgKz0gNTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuIFxuICAgICAgICB0aGlzLm1hcC5vbignbW92ZWVuZCcsIChkYXRhKSA9PiB7IFxuICAgICAgICAgICAgaWYgKGRhdGEuc291cmNlID09PSAnZmxpZ2h0cGF0aCcpIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgVGhpcyBzZWVtZWQgdG8gYmUgdW5yZWxpYWJsZSAtIHdhc24ndCBhbHdheXMgZ2V0dGluZyB0aGUgbG9hZGVkIGV2ZW50LlxuICAgICAgICB3aGVuTG9hZGVkKHRoaXMubWFwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGVkLicpO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcC5qdW1wVG8odGhpcy5wb3NpdGlvbnNbMF0pO1xuICAgICAgICB0aGlzLnBvc05vICsrO1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgMCAvKnRoaXMucGF1c2VUaW1lKi8pO1xuXG4gICAgICAgIHRoaXMubWFwLm9uKCdjbGljaycsICgpID0+IHsgXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9ICAgIFxuXG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JhZGl1c0xlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgLy8gVE9ETyBwYWQgdGhlIHNtYWxsIGNpcmNsZSBzbyB0aGUgdGV4dCBzdGFydHMgYXQgdGhlIHNhbWUgWCBwb3NpdGlvbiBmb3IgYm90aFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDo2cHg7IHdpZHRoOiA2cHg7IGJvcmRlci1yYWRpdXM6IDNweFwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMjBweDsgYm9yZGVyLXJhZGl1czogMTBweFwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD5gO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoNDAsNDAsMjUwKVwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDozcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoMjAsMjAsNDApXCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPmA7IFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDYXRlZ29yeUxlZ2VuZChpZCwgY29sdW1uTmFtZSwgY29sb3JTdG9wcywgY2xvc2VIYW5kbGVyKSB7XG4gICAgbGV0IGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgK1xuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgY29sb3JTdG9wc1xuICAgICAgICAgICAgLnNvcnQoKHN0b3BhLCBzdG9wYikgPT4gc3RvcGFbMF0ubG9jYWxlQ29tcGFyZShzdG9wYlswXSkpIC8vIHNvcnQgb24gdmFsdWVzXG4gICAgICAgICAgICAubWFwKHN0b3AgPT4gYDxzcGFuIGNsYXNzPVwiYm94XCIgc3R5bGU9J2JhY2tncm91bmQ6ICR7c3RvcFsxXX0nPjwvc3Bhbj48bGFiZWw+JHtzdG9wWzBdfTwvbGFiZWw+PGJyLz5gKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgKiBhcyBsZWdlbmQgZnJvbSAnLi9sZWdlbmQnO1xuLypcbldyYXBzIGEgTWFwYm94IG1hcCB3aXRoIGRhdGEgdmlzIGNhcGFiaWxpdGllcyBsaWtlIGNpcmNsZSBzaXplIGFuZCBjb2xvciwgYW5kIHBvbHlnb24gaGVpZ2h0LlxuXG5zb3VyY2VEYXRhIGlzIGFuIG9iamVjdCB3aXRoOlxuLSBkYXRhSWRcbi0gbG9jYXRpb25Db2x1bW5cbi0gdGV4dENvbHVtbnNcbi0gbnVtZXJpY0NvbHVtbnNcbi0gcm93c1xuLSBzaGFwZVxuLSBtaW5zLCBtYXhzXG4qL1xuY29uc3QgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgdW5pcXVlID0gMDtcblxuZXhwb3J0IGNsYXNzIE1hcFZpcyB7XG4gICAgY29uc3RydWN0b3IobWFwLCBzb3VyY2VEYXRhLCBmaWx0ZXIsIGZlYXR1cmVIb3Zlckhvb2ssIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuc291cmNlRGF0YSA9IHNvdXJjZURhdGE7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB0aGlzLmZlYXR1cmVIb3Zlckhvb2sgPSBmZWF0dXJlSG92ZXJIb29rOyAvLyBmKHByb3BlcnRpZXMsIHNvdXJjZURhdGEpXG4gICAgICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjaXJjbGVSYWRpdXM6IGRlZihvcHRpb25zLmNpcmNsZVJhZGl1cywgMTApLFxuICAgICAgICAgICAgaW52aXNpYmxlOiBvcHRpb25zLmludmlzaWJsZSwgLy8gd2hldGhlciB0byBjcmVhdGUgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wgLy8gTWFwYm94IHN5bWJvbCBwcm9wZXJ0aWVzLCBtZWFuaW5nIHdlIHNob3cgc3ltYm9sIGluc3RlYWQgb2YgY2lyY2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy90aGlzLm9wdGlvbnMuaW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIFRPRE8gc2hvdWxkIGJlIHBhc3NlZCBhIExlZ2VuZCBvYmplY3Qgb2Ygc29tZSBraW5kLlxuXG4gICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmxheWVySWQgPSBzb3VyY2VEYXRhLnNoYXBlICsgJy0nICsgc291cmNlRGF0YS5kYXRhSWQgKyAnLScgKyAodW5pcXVlKyspO1xuICAgICAgICB0aGlzLmxheWVySWRIaWdobGlnaHQgPSB0aGlzLmxheWVySWQgKyAnLWhpZ2hsaWdodCc7XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgcG9pbnREYXRhc2V0VG9HZW9KU09OKHRoaXMuc291cmNlRGF0YSkgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ5IHVzaW5nIGEgY2lyY2xlIGhpZ2hsaWdodCBldmVuIG9uIGFuIGljb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuc3ltYm9sLCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgICAgICAgICAvLyBodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvRWNvbm9teS9FbXBsb3ltZW50LWJ5LWJsb2NrLWJ5LWluZHVzdHJ5L2IzNmota2l5NFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgeyBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsIFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdtYXBib3g6Ly9vcGVuY291bmNpbGRhdGEuYWVkZm15cDgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25MYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZygnVGhpcyBpcyBhIHN5bWJvbCBsYXllciwgd2UgaWdub3JlIHNldFZpc0NvbHVtbi4nKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9IHNvdXJjZURhdGEudGV4dENvbHVtbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RhdGEgY29sdW1uOiAnICsgdGhpcy5kYXRhQ29sdW1uKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9zZSBidXR0b24gYmVoYXZpb3VyLiBtYXliZT9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBlbnVtIGZpZWxkcyBvbiBwb2x5Z29ucyAobm8gZXhhbXBsZSBjdXJyZW50bHkpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICBsZXQgbWluU2l6ZSA9IDAuMyAqIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG4gICAgICAgICAgICBsZXQgbWF4U2l6ZSA9IHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXM7XG5cbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLXJhZGl1cycsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIDFdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIDNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemVdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemVdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93UmFkaXVzTGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IC8vIENhbid0IHNhZmVseSBjbG9zZSBudW1lcmljIGNvbHVtbnMgeWV0LiBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMzk0OVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlUmFkaXVzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1yYWRpdXMnLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLW51bWVyaWMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICAvLyBmcm9tIENvbG9yQnJld2VyXG4gICAgICAgICAgICBjb25zdCBlbnVtQ29sb3JzID0gWycjMWY3OGI0JywnI2ZiOWE5OScsJyNiMmRmOGEnLCcjMzNhMDJjJywnI2UzMWExYycsJyNmZGJmNmYnLCcjYTZjZWUzJywgJyNmZjdmMDAnLCcjY2FiMmQ2JywnIzZhM2Q5YScsJyNmZmZmOTknLCcjYjE1OTI4J107XG5cbiAgICAgICAgICAgIGxldCBlbnVtU3RvcHMgPSB0aGlzLnNvdXJjZURhdGEuc29ydGVkRnJlcXVlbmNpZXNbZGF0YUNvbHVtbl0ubWFwKCh2YWwsaSkgPT4gW3ZhbCwgZW51bUNvbG9yc1tpXV0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogZW51bVN0b3BzXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIC8vIFRPRE8gdGVzdCBjbG9zZSBoYW5kbGVyLCBjdXJyZW50bHkgbm9uIGZ1bmN0aW9uYWwgZHVlIHRvIHBvaW50ZXItZXZlbnRzOm5vbmUgaW4gQ1NTXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0NhdGVnb3J5TGVnZW5kKCcjbGVnZW5kLWVudW0nLCBkYXRhQ29sdW1uLCBlbnVtU3RvcHMsIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IuYmluZCh0aGlzKSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVDb2xvciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtY29sb3InLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1jb2xvciddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtZW51bScpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuICAgICAgICAvKlxuICAgICAgICAgICAgQXBwbGllcyBhIHN0eWxlIHRoYXQgcmVwcmVzZW50cyBudW1lcmljIGRhdGEgdmFsdWVzIGFzIGhlaWdodHMgb2YgZXh0cnVkZWQgcG9seWdvbnMuXG4gICAgICAgICAgICBUT0RPOiBhZGQgcmVtb3ZlUG9seWdvbkhlaWdodFxuICAgICAgICAqL1xuICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24taGVpZ2h0JywgIHtcbiAgICAgICAgICAgICAgICAvLyByZW1lbWJlciwgdGhlIGRhdGEgZG9lc24ndCBleGlzdCBpbiB0aGUgcG9seWdvbiBzZXQsIGl0J3MganVzdCBhIGh1Z2UgdmFsdWUgbG9va3VwXG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsLy9sb2NhdGlvbkNvbHVtbiwgLy8gdGhlIElEIG9uIHRoZSBhY3R1YWwgZ2VvbWV0cnkgZGF0YXNldFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDEwMDBdKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgICAgICAvLy5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ3JnYigwLDAsJyArIE1hdGgucm91bmQoNDAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdoc2woMzQwLDg4JSwnICsgTWF0aC5yb3VuZCgyMCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogNTApICsgJyUpJ10pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWQsIFsnIWluJywgJ2Jsb2NrX2lkJywgLi4uKC8qICMjIyBUT0RPIGdlbmVyYWxpc2UgKi8gXG4gICAgICAgICAgICAgICAgdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihyb3cgPT4gcm93W2RhdGFDb2x1bW5dID09PSAwKVxuICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IHJvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSldKTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHRoaXMuc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5yZW1vdmUgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZCk7XG4gICAgICAgICAgICBpZiAodGhpcy5tb3VzZW1vdmUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWRIaWdobGlnaHQpO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLm9mZignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICAgICAgICAgIHRob3VzZS5tb3VzZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IChlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IHRoaXMubWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhlLnBvaW50LCB7IGxheWVyczogW3RoaXMubGF5ZXJJZF19KVswXTsgIFxuICAgICAgICAgICAgICAgIGlmIChmICYmIGYgIT09IHRoaXMubGFzdEZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSBmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZUhvdmVySG9vayhmLnByb3BlcnRpZXMsIHRoaXMuc291cmNlRGF0YSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCBmLnByb3BlcnRpZXNbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXV0pOyAvLyB3ZSBkb24ndCBoYXZlIGFueSBvdGhlciByZWxpYWJsZSBrZXk/XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgJ2Jsb2NrX2lkJywgZi5wcm9wZXJ0aWVzLmJsb2NrX2lkXSk7IC8vIGRvbid0IGhhdmUgYSBnZW5lcmFsIHdheSB0byBtYXRjaCBvdGhlciBraW5kcyBvZiBwb2x5Z29uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnN0cnVjdG9yLi4uXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCgpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG5cblxuXG4gICAgICAgIFxuXG4gICAgfVxufVxuXG4vLyBjb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBHZW9KU09OXG5mdW5jdGlvbiBwb2ludERhdGFzZXRUb0dlb0pTT04oc291cmNlRGF0YSkge1xuICAgIGxldCBkYXRhc291cmNlID0ge1xuICAgICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICAgICAgICBmZWF0dXJlczogW11cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzb3VyY2VEYXRhLnJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkge1xuICAgICAgICAgICAgICAgIGRhdGFzb3VyY2UuZGF0YS5mZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkgeyAvLyBKdXN0IGRvbid0IHB1c2ggaXQgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQmFkIGxvY2F0aW9uOiAke3Jvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXX1gKTsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhc291cmNlO1xufTtcblxuZnVuY3Rpb24gY2lyY2xlTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgIHBhaW50OiB7XG4vLyAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAnaHNsKDIwLCA5NSUsIDUwJSknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdyZ2JhKDAsMCwwLDApJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjk1IDogMCxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3doaXRlJyA6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiB7XG4gICAgICAgICAgICAgICAgc3RvcHM6IGhpZ2hsaWdodCA/IFtbMTAsNF0sIFsxNywxMF1dIDogW1sxMCwyXSwgWzE3LDVdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHN5bWJvbExheWVyKHNvdXJjZUlkLCBsYXllcklkLCBzeW1ib2wsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWRcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgcmV0LnBhaW50ID0gZGVmKHN5bWJvbC5wYWludCwge30pO1xuICAgIHJldC5wYWludFsnaWNvbi1vcGFjaXR5J10gPSAhaW52aXNpYmxlID8gMC45NSA6IDA7XG4gICAgaWYgKHN5bWJvbC5sYXlvdXQpXG4gICAgICAgIHJldC5sYXlvdXQgPSBzeW1ib2wubGF5b3V0O1xuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuXG4gZnVuY3Rpb24gcG9seWdvbkxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBpbnZpc2libGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjggOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICcjMDAzJ1xuICAgICAgICAgfSxcbiAgICB9O1xufVxuIGZ1bmN0aW9uIHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnd2hpdGUnXG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlcjogWyc9PScsICdibG9ja19pZCcsICctJ11cbiAgICB9O1xufVxuXG4iLCJleHBvcnQgY29uc3QgbWVsYm91cm5lUm91dGUgPSB7XG4gIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gIFwiZmVhdHVyZXNcIjogW1xuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogMzUwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NjI4ODI5OTU2MDU0NyxcbiAgICAgICAgICAtMzcuODIxNzE3NjQ3ODM5NjVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJiZWFyaW5nXCI6IDI3MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTc4NTA0MTgwOTA4MixcbiAgICAgICAgICAtMzcuODA4MzU5OTE3NDIzNTk0XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogMTgwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NTU1ODczODcwODQ5NixcbiAgICAgICAgICAtMzcuODA1NzgzMDIxMzE0NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDkwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NDQzNDM1NjY4OTQ1MyxcbiAgICAgICAgICAtMzcuODE2NDk2ODkzNzIzMDhcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cbiAgXVxufTsiLCIvLyBodHRwczovL2QzanMub3JnL2QzLWNvbGxlY3Rpb24vIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHByZWZpeCA9IFwiJFwiO1xuXG5mdW5jdGlvbiBNYXAoKSB7fVxuXG5NYXAucHJvdG90eXBlID0gbWFwLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IE1hcCxcbiAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gKHByZWZpeCArIGtleSkgaW4gdGhpcztcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpc1twcmVmaXggKyBrZXldO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzW3ByZWZpeCArIGtleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcHJvcGVydHkgPSBwcmVmaXggKyBrZXk7XG4gICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkga2V5cy5wdXNoKHByb3BlcnR5LnNsaWNlKDEpKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfSxcbiAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHZhbHVlcy5wdXNoKHRoaXNbcHJvcGVydHldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9LFxuICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBlbnRyaWVzLnB1c2goe2tleTogcHJvcGVydHkuc2xpY2UoMSksIHZhbHVlOiB0aGlzW3Byb3BlcnR5XX0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9LFxuICBzaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpICsrc2l6ZTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfSxcbiAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZih0aGlzW3Byb3BlcnR5XSwgcHJvcGVydHkuc2xpY2UoMSksIHRoaXMpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYXAob2JqZWN0LCBmKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwO1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgbWFwLnNldChrZXksIHZhbHVlKTsgfSk7XG5cbiAgLy8gSW5kZXggYXJyYXkgYnkgbnVtZXJpYyBpbmRleCBvciBzcGVjaWZpZWQga2V5IGZ1bmN0aW9uLlxuICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgbztcblxuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGksIG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChmKG8gPSBvYmplY3RbaV0sIGksIG9iamVjdCksIG8pO1xuICB9XG5cbiAgLy8gQ29udmVydCBvYmplY3QgdG8gbWFwLlxuICBlbHNlIGlmIChvYmplY3QpIGZvciAodmFyIGtleSBpbiBvYmplY3QpIG1hcC5zZXQoa2V5LCBvYmplY3Rba2V5XSk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIG5lc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGtleXMgPSBbXSxcbiAgICAgIHNvcnRLZXlzID0gW10sXG4gICAgICBzb3J0VmFsdWVzLFxuICAgICAgcm9sbHVwLFxuICAgICAgbmVzdDtcblxuICBmdW5jdGlvbiBhcHBseShhcnJheSwgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSB7XG4gICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwICE9IG51bGxcbiAgICAgICAgPyByb2xsdXAoYXJyYXkpIDogKHNvcnRWYWx1ZXMgIT0gbnVsbFxuICAgICAgICA/IGFycmF5LnNvcnQoc29ydFZhbHVlcylcbiAgICAgICAgOiBhcnJheSk7XG5cbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBrZXkgPSBrZXlzW2RlcHRoKytdLFxuICAgICAgICBrZXlWYWx1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHZhbHVlc0J5S2V5ID0gbWFwKCksXG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlUmVzdWx0KCk7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHZhbHVlcyA9IHZhbHVlc0J5S2V5LmdldChrZXlWYWx1ZSA9IGtleSh2YWx1ZSA9IGFycmF5W2ldKSArIFwiXCIpKSB7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlc0J5S2V5LnNldChrZXlWYWx1ZSwgW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsdWVzQnlLZXkuZWFjaChmdW5jdGlvbih2YWx1ZXMsIGtleSkge1xuICAgICAgc2V0UmVzdWx0KHJlc3VsdCwga2V5LCBhcHBseSh2YWx1ZXMsIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVudHJpZXMobWFwJCQxLCBkZXB0aCkge1xuICAgIGlmICgrK2RlcHRoID4ga2V5cy5sZW5ndGgpIHJldHVybiBtYXAkJDE7XG4gICAgdmFyIGFycmF5LCBzb3J0S2V5ID0gc29ydEtleXNbZGVwdGggLSAxXTtcbiAgICBpZiAocm9sbHVwICE9IG51bGwgJiYgZGVwdGggPj0ga2V5cy5sZW5ndGgpIGFycmF5ID0gbWFwJCQxLmVudHJpZXMoKTtcbiAgICBlbHNlIGFycmF5ID0gW10sIG1hcCQkMS5lYWNoKGZ1bmN0aW9uKHYsIGspIHsgYXJyYXkucHVzaCh7a2V5OiBrLCB2YWx1ZXM6IGVudHJpZXModiwgZGVwdGgpfSk7IH0pO1xuICAgIHJldHVybiBzb3J0S2V5ICE9IG51bGwgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTsgfSkgOiBhcnJheTtcbiAgfVxuXG4gIHJldHVybiBuZXN0ID0ge1xuICAgIG9iamVjdDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVPYmplY3QsIHNldE9iamVjdCk7IH0sXG4gICAgbWFwOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKTsgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gZW50cmllcyhhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApLCAwKTsgfSxcbiAgICBrZXk6IGZ1bmN0aW9uKGQpIHsga2V5cy5wdXNoKGQpOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0S2V5czogZnVuY3Rpb24ob3JkZXIpIHsgc29ydEtleXNba2V5cy5sZW5ndGggLSAxXSA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0VmFsdWVzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0VmFsdWVzID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHJvbGx1cDogZnVuY3Rpb24oZikgeyByb2xsdXAgPSBmOyByZXR1cm4gbmVzdDsgfVxuICB9O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0KCkge1xuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIHNldE9iamVjdChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICByZXR1cm4gbWFwKCk7XG59XG5cbmZ1bmN0aW9uIHNldE1hcChtYXAkJDEsIGtleSwgdmFsdWUpIHtcbiAgbWFwJCQxLnNldChrZXksIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gU2V0KCkge31cblxudmFyIHByb3RvID0gbWFwLnByb3RvdHlwZTtcblxuU2V0LnByb3RvdHlwZSA9IHNldC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZXQsXG4gIGhhczogcHJvdG8uaGFzLFxuICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFsdWUgKz0gXCJcIjtcbiAgICB0aGlzW3ByZWZpeCArIHZhbHVlXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IHByb3RvLnJlbW92ZSxcbiAgY2xlYXI6IHByb3RvLmNsZWFyLFxuICB2YWx1ZXM6IHByb3RvLmtleXMsXG4gIHNpemU6IHByb3RvLnNpemUsXG4gIGVtcHR5OiBwcm90by5lbXB0eSxcbiAgZWFjaDogcHJvdG8uZWFjaFxufTtcblxuZnVuY3Rpb24gc2V0KG9iamVjdCwgZikge1xuICB2YXIgc2V0ID0gbmV3IFNldDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgU2V0KSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSkgeyBzZXQuYWRkKHZhbHVlKTsgfSk7XG5cbiAgLy8gT3RoZXJ3aXNlLCBhc3N1bWUgaXTigJlzIGFuIGFycmF5LlxuICBlbHNlIGlmIChvYmplY3QpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gb2JqZWN0Lmxlbmd0aDtcbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIHNldC5hZGQoZihvYmplY3RbaV0sIGksIG9iamVjdCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldDtcbn1cblxudmFyIGtleXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufTtcblxudmFyIHZhbHVlcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgdmFsdWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIHZhbHVlcy5wdXNoKG1hcFtrZXldKTtcbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbnZhciBlbnRyaWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBlbnRyaWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGVudHJpZXMucHVzaCh7a2V5OiBrZXksIHZhbHVlOiBtYXBba2V5XX0pO1xuICByZXR1cm4gZW50cmllcztcbn07XG5cbmV4cG9ydHMubmVzdCA9IG5lc3Q7XG5leHBvcnRzLnNldCA9IHNldDtcbmV4cG9ydHMubWFwID0gbWFwO1xuZXhwb3J0cy5rZXlzID0ga2V5cztcbmV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuZXhwb3J0cy5lbnRyaWVzID0gZW50cmllcztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZGlzcGF0Y2gvIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIG5vb3AgPSB7dmFsdWU6IGZ1bmN0aW9uKCkge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0cy5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kc3YvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5mdW5jdGlvbiBkc3YoZGVsaW1pdGVyKSB7XG4gIHZhciByZUZvcm1hdCA9IG5ldyBSZWdFeHAoXCJbXFxcIlwiICsgZGVsaW1pdGVyICsgXCJcXG5dXCIpLFxuICAgICAgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHtcbiAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTtcbiAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTtcbiAgICB9KTtcbiAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSb3dzKHRleHQsIGYpIHtcbiAgICB2YXIgRU9MID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtbGluZVxuICAgICAgICBFT0YgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1maWxlXG4gICAgICAgIHJvd3MgPSBbXSwgLy8gb3V0cHV0IHJvd3NcbiAgICAgICAgTiA9IHRleHQubGVuZ3RoLFxuICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXhcbiAgICAgICAgbiA9IDAsIC8vIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgICAgIHQsIC8vIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgIGVvbDsgLy8gaXMgdGhlIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9MP1xuXG4gICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlXG4gICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgbGluZVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3Rlc1xuICAgICAgdmFyIGogPSBJLCBjO1xuICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHtcbiAgICAgICAgdmFyIGkgPSBqO1xuICAgICAgICB3aGlsZSAoaSsrIDwgTikge1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7XG4gICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrO1xuICAgICAgICAgICAgKytpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBJID0gaSArIDI7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICBpZiAoYyA9PT0gMTMpIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvXCJcIi9nLCBcIlxcXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbW1vbiBjYXNlOiBmaW5kIG5leHQgZGVsaW1pdGVyIG9yIG5ld2xpbmVcbiAgICAgIHdoaWxlIChJIDwgTikge1xuICAgICAgICB2YXIgayA9IDE7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDEwKSBlb2wgPSB0cnVlOyAvLyBcXG5cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxccnxcXHJcXG5cbiAgICAgICAgZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0ZcbiAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopO1xuICAgIH1cblxuICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICB3aGlsZSAodCAhPT0gRU9MICYmIHQgIT09IEVPRikge1xuICAgICAgICBhLnB1c2godCk7XG4gICAgICAgIHQgPSB0b2tlbigpO1xuICAgICAgfVxuICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgcm93cy5wdXNoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pO1xuICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH0pKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93cyhyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MubWFwKGZvcm1hdFJvdykuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvdyhyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkge1xuICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyBcIlwiXG4gICAgICAgIDogcmVGb3JtYXQudGVzdCh0ZXh0ICs9IFwiXCIpID8gXCJcXFwiXCIgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgXCJcXFwiXFxcIlwiKSArIFwiXFxcIlwiXG4gICAgICAgIDogdGV4dDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHBhcnNlUm93czogcGFyc2VSb3dzLFxuICAgIGZvcm1hdDogZm9ybWF0LFxuICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3NcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcIixcIik7XG5cbnZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTtcbnZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzO1xudmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7XG52YXIgY3N2Rm9ybWF0Um93cyA9IGNzdi5mb3JtYXRSb3dzO1xuXG52YXIgdHN2ID0gZHN2KFwiXFx0XCIpO1xuXG52YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7XG52YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93cztcbnZhciB0c3ZGb3JtYXQgPSB0c3YuZm9ybWF0O1xudmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93cztcblxuZXhwb3J0cy5kc3ZGb3JtYXQgPSBkc3Y7XG5leHBvcnRzLmNzdlBhcnNlID0gY3N2UGFyc2U7XG5leHBvcnRzLmNzdlBhcnNlUm93cyA9IGNzdlBhcnNlUm93cztcbmV4cG9ydHMuY3N2Rm9ybWF0ID0gY3N2Rm9ybWF0O1xuZXhwb3J0cy5jc3ZGb3JtYXRSb3dzID0gY3N2Rm9ybWF0Um93cztcbmV4cG9ydHMudHN2UGFyc2UgPSB0c3ZQYXJzZTtcbmV4cG9ydHMudHN2UGFyc2VSb3dzID0gdHN2UGFyc2VSb3dzO1xuZXhwb3J0cy50c3ZGb3JtYXQgPSB0c3ZGb3JtYXQ7XG5leHBvcnRzLnRzdkZvcm1hdFJvd3MgPSB0c3ZGb3JtYXRSb3dzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpOyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtcmVxdWVzdC8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzLCByZXF1aXJlKCdkMy1jb2xsZWN0aW9uJyksIHJlcXVpcmUoJ2QzLWRpc3BhdGNoJyksIHJlcXVpcmUoJ2QzLWRzdicpKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnLCAnZDMtY29sbGVjdGlvbicsICdkMy1kaXNwYXRjaCcsICdkMy1kc3YnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSxnbG9iYWwuZDMsZ2xvYmFsLmQzLGdsb2JhbC5kMykpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMsZDNDb2xsZWN0aW9uLGQzRGlzcGF0Y2gsZDNEc3YpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3QsXG4gICAgICBldmVudCA9IGQzRGlzcGF0Y2guZGlzcGF0Y2goXCJiZWZvcmVzZW5kXCIsIFwicHJvZ3Jlc3NcIiwgXCJsb2FkXCIsIFwiZXJyb3JcIiksXG4gICAgICBtaW1lVHlwZSxcbiAgICAgIGhlYWRlcnMgPSBkM0NvbGxlY3Rpb24ubWFwKCksXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QsXG4gICAgICB1c2VyID0gbnVsbCxcbiAgICAgIHBhc3N3b3JkID0gbnVsbCxcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgcmVzcG9uc2VUeXBlLFxuICAgICAgdGltZW91dCA9IDA7XG5cbiAgLy8gSWYgSUUgZG9lcyBub3Qgc3VwcG9ydCBDT1JTLCB1c2UgWERvbWFpblJlcXVlc3QuXG4gIGlmICh0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICYmICEoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpXG4gICAgICAmJiAvXihodHRwKHMpPzopP1xcL1xcLy8udGVzdCh1cmwpKSB4aHIgPSBuZXcgWERvbWFpblJlcXVlc3Q7XG5cbiAgXCJvbmxvYWRcIiBpbiB4aHJcbiAgICAgID8geGhyLm9ubG9hZCA9IHhoci5vbmVycm9yID0geGhyLm9udGltZW91dCA9IHJlc3BvbmRcbiAgICAgIDogeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKG8pIHsgeGhyLnJlYWR5U3RhdGUgPiAzICYmIHJlc3BvbmQobyk7IH07XG5cbiAgZnVuY3Rpb24gcmVzcG9uZChvKSB7XG4gICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMsIHJlc3VsdDtcbiAgICBpZiAoIXN0YXR1cyAmJiBoYXNSZXNwb25zZSh4aHIpXG4gICAgICAgIHx8IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwXG4gICAgICAgIHx8IHN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSByZXNwb25zZS5jYWxsKHJlcXVlc3QsIHhocik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB4aHI7XG4gICAgICB9XG4gICAgICBldmVudC5jYWxsKFwibG9hZFwiLCByZXF1ZXN0LCByZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgbyk7XG4gICAgfVxuICB9XG5cbiAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgZXZlbnQuY2FsbChcInByb2dyZXNzXCIsIHJlcXVlc3QsIGUpO1xuICB9O1xuXG4gIHJlcXVlc3QgPSB7XG4gICAgaGVhZGVyOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGhlYWRlcnMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIGhlYWRlcnMucmVtb3ZlKG5hbWUpO1xuICAgICAgZWxzZSBoZWFkZXJzLnNldChuYW1lLCB2YWx1ZSArIFwiXCIpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIElmIG1pbWVUeXBlIGlzIG5vbi1udWxsIGFuZCBubyBBY2NlcHQgaGVhZGVyIGlzIHNldCwgYSBkZWZhdWx0IGlzIHVzZWQuXG4gICAgbWltZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtaW1lVHlwZTtcbiAgICAgIG1pbWVUeXBlID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCI7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmaWVzIHdoYXQgdHlwZSB0aGUgcmVzcG9uc2UgdmFsdWUgc2hvdWxkIHRha2U7XG4gICAgLy8gZm9yIGluc3RhbmNlLCBhcnJheWJ1ZmZlciwgYmxvYiwgZG9jdW1lbnQsIG9yIHRleHQuXG4gICAgcmVzcG9uc2VUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmVzcG9uc2VUeXBlO1xuICAgICAgcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdGltZW91dDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpbWVvdXQ7XG4gICAgICB0aW1lb3V0ID0gK3ZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyB1c2VyIDogKHVzZXIgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIHBhc3N3b3JkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gcGFzc3dvcmQgOiAocGFzc3dvcmQgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZnkgaG93IHRvIGNvbnZlcnQgdGhlIHJlc3BvbnNlIGNvbnRlbnQgdG8gYSBzcGVjaWZpYyB0eXBlO1xuICAgIC8vIGNoYW5nZXMgdGhlIGNhbGxiYWNrIHZhbHVlIG9uIFwibG9hZFwiIGV2ZW50cy5cbiAgICByZXNwb25zZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJHRVRcIiwg4oCmKS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiR0VUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJQT1NUXCIsIOKApikuXG4gICAgcG9zdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJQT1NUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgY2FsbGJhY2sgaXMgbm9uLW51bGwsIGl0IHdpbGwgYmUgdXNlZCBmb3IgZXJyb3IgYW5kIGxvYWQgZXZlbnRzLlxuICAgIHNlbmQ6IGZ1bmN0aW9uKG1ldGhvZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlLCB1c2VyLCBwYXNzd29yZCk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoXCJhY2NlcHRcIikpIGhlYWRlcnMuc2V0KFwiYWNjZXB0XCIsIG1pbWVUeXBlICsgXCIsKi8qXCIpO1xuICAgICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSBoZWFkZXJzLmVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpOyB9KTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKSB4aHIub3ZlcnJpZGVNaW1lVHlwZShtaW1lVHlwZSk7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlICE9IG51bGwpIHhoci5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG4gICAgICBpZiAodGltZW91dCA+IDApIHhoci50aW1lb3V0ID0gdGltZW91dDtcbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiBjYWxsYmFjay5sZW5ndGggPT09IDEpIGNhbGxiYWNrID0gZml4Q2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHJlcXVlc3Qub24oXCJlcnJvclwiLCBjYWxsYmFjaykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKHhocikgeyBjYWxsYmFjayhudWxsLCB4aHIpOyB9KTtcbiAgICAgIGV2ZW50LmNhbGwoXCJiZWZvcmVzZW5kXCIsIHJlcXVlc3QsIHhocik7XG4gICAgICB4aHIuc2VuZChkYXRhID09IG51bGwgPyBudWxsIDogZGF0YSk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgYWJvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgeGhyLmFib3J0KCk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgb246IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlID0gZXZlbnQub24uYXBwbHkoZXZlbnQsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IGV2ZW50ID8gcmVxdWVzdCA6IHZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHJlcXVlc3QuZ2V0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZnVuY3Rpb24gZml4Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yLCB4aHIpIHtcbiAgICBjYWxsYmFjayhlcnJvciA9PSBudWxsID8geGhyIDogbnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhc1Jlc3BvbnNlKHhocikge1xuICB2YXIgdHlwZSA9IHhoci5yZXNwb25zZVR5cGU7XG4gIHJldHVybiB0eXBlICYmIHR5cGUgIT09IFwidGV4dFwiXG4gICAgICA/IHhoci5yZXNwb25zZSAvLyBudWxsIG9uIGVycm9yXG4gICAgICA6IHhoci5yZXNwb25zZVRleHQ7IC8vIFwiXCIgb24gZXJyb3Jcbn1cblxudmFyIHR5cGUgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHJlc3BvbnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKS5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgICByZXR1cm4gci5nZXQoY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfTtcbn07XG5cbnZhciBodG1sID0gdHlwZShcInRleHQvaHRtbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciBqc29uID0gdHlwZShcImFwcGxpY2F0aW9uL2pzb25cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciB0ZXh0ID0gdHlwZShcInRleHQvcGxhaW5cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiB4aHIucmVzcG9uc2VUZXh0O1xufSk7XG5cbnZhciB4bWwgPSB0eXBlKFwiYXBwbGljYXRpb24veG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICB2YXIgeG1sID0geGhyLnJlc3BvbnNlWE1MO1xuICBpZiAoIXhtbCkgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgZXJyb3JcIik7XG4gIHJldHVybiB4bWw7XG59KTtcblxudmFyIGRzdiA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcGFyc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgcm93LCBjYWxsYmFjaykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgY2FsbGJhY2sgPSByb3csIHJvdyA9IG51bGw7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKTtcbiAgICByLnJvdyA9IGZ1bmN0aW9uKF8pIHsgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyByLnJlc3BvbnNlKHJlc3BvbnNlT2YocGFyc2UsIHJvdyA9IF8pKSA6IHJvdzsgfTtcbiAgICByLnJvdyhyb3cpO1xuICAgIHJldHVybiBjYWxsYmFjayA/IHIuZ2V0KGNhbGxiYWNrKSA6IHI7XG4gIH07XG59O1xuXG5mdW5jdGlvbiByZXNwb25zZU9mKHBhcnNlLCByb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QkJDEpIHtcbiAgICByZXR1cm4gcGFyc2UocmVxdWVzdCQkMS5yZXNwb25zZVRleHQsIHJvdyk7XG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCJ0ZXh0L2NzdlwiLCBkM0Rzdi5jc3ZQYXJzZSk7XG5cbnZhciB0c3YgPSBkc3YoXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsIGQzRHN2LnRzdlBhcnNlKTtcblxuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbmV4cG9ydHMuaHRtbCA9IGh0bWw7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy50ZXh0ID0gdGV4dDtcbmV4cG9ydHMueG1sID0geG1sO1xuZXhwb3J0cy5jc3YgPSBjc3Y7XG5leHBvcnRzLnRzdiA9IHRzdjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIiFmdW5jdGlvbihlLG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4ocmVxdWlyZShcImQzLXJlcXVlc3RcIikpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZDMtcmVxdWVzdFwiXSxuKTooZS5kMz1lLmQzfHx7fSxlLmQzLnByb21pc2U9bihlLmQzKSl9KHRoaXMsZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlLG4pe3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgdD1hcmd1bWVudHMubGVuZ3RoLHI9QXJyYXkodCksbz0wO3Q+bztvKyspcltvXT1hcmd1bWVudHNbb107cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHQsbyl7dmFyIHU9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gZT92b2lkIG8oRXJyb3IoZSkpOnZvaWQgdChuKX07bi5hcHBseShlLHIuY29uY2F0KHUpKX0pfX12YXIgdD17fTtyZXR1cm5bXCJjc3ZcIixcInRzdlwiLFwianNvblwiLFwieG1sXCIsXCJ0ZXh0XCIsXCJodG1sXCJdLmZvckVhY2goZnVuY3Rpb24ocil7dFtyXT1uKGUsZVtyXSl9KSx0fSk7IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG52YXIgZDMgPSByZXF1aXJlKCdkMy5wcm9taXNlJyk7XG5cbmZ1bmN0aW9uIGRlZihhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xufVxuLypcbk1hbmFnZXMgZmV0Y2hpbmcgYSBkYXRhc2V0IGZyb20gU29jcmF0YSBhbmQgcHJlcGFyaW5nIGl0IGZvciB2aXN1YWxpc2F0aW9uIGJ5XG5jb3VudGluZyBmaWVsZCB2YWx1ZSBmcmVxdWVuY2llcyBldGMuIFxuKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VEYXRhIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhSWQsIGFjdGl2ZUNlbnN1c1llYXIpIHtcbiAgICAgICAgdGhpcy5kYXRhSWQgPSBkYXRhSWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciA9IGRlZihhY3RpdmVDZW5zdXNZZWFyLCAyMDE1KTtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gdW5kZWZpbmVkOyAgLy8gbmFtZSBvZiBjb2x1bW4gd2hpY2ggaG9sZHMgbGF0L2xvbiBvciBibG9jayBJRFxuICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHVuZGVmaW5lZDsgLy8gaWYgdGhlIGRhdGFzZXQgdHlwZSBpcyAncG9pbnQnICh1c2VkIGZvciBwYXJzaW5nIGxvY2F0aW9uIGZpZWxkKVxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gW107ICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgbnVtZXJpYyBkYXRhdmlzXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBbXTsgICAgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBlbnVtIGRhdGF2aXNcbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gW107ICAgICAgICAgIC8vIG5hbWVzIG9mIG90aGVyIGNvbHVtbnNcbiAgICAgICAgdGhpcy5taW5zID0ge307ICAgICAgICAgICAgICAgICAgIC8vIG1pbiBhbmQgbWF4IG9mIGVhY2ggbnVtZXJpYyBjb2x1bW5cbiAgICAgICAgdGhpcy5tYXhzID0ge307XG4gICAgICAgIHRoaXMuZnJlcXVlbmNpZXMgPSB7fTsgICAgICAgICAgICAvLyBcbiAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llcyA9IHt9OyAgICAgIC8vIG1vc3QgZnJlcXVlbnQgdmFsdWVzIGluIGVhY2ggdGV4dCBjb2x1bW5cbiAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2ludCc7ICAgICAgICAgICAgIC8vIHBvaW50IG9yIHBvbHlnb24gKENMVUUgYmxvY2spXG4gICAgICAgIHRoaXMucm93cyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBwcm9jZXNzZWQgcm93c1xuICAgICAgICB0aGlzLmJsb2NrSW5kZXggPSB7fTsgICAgICAgICAgICAgLy8gY2FjaGUgb2YgQ0xVRSBibG9jayBJRHNcbiAgICB9XG5cblxuICAgIGNob29zZUNvbHVtblR5cGVzIChjb2x1bW5zKSB7XG4gICAgICAgIC8vdmFyIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JyB8fCBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIC8vIFwibG9jYXRpb25cIiBhbmQgXCJwb2ludFwiIGFyZSBib3RoIHBvaW50IGRhdGEgdHlwZXMsIGV4cHJlc3NlZCBkaWZmZXJlbnRseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhIFwiYmxvY2sgSURcIiBjYW4gYmUgam9pbmVkIGFnYWluc3QgdGhlIENMVUUgQmxvY2sgcG9seWdvbnMgd2hpY2ggYXJlIGluIE1hcGJveC5cbiAgICAgICAgbGV0IGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylbMF07XG4gICAgICAgIGlmICghbGMpIHtcbiAgICAgICAgICAgIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGxjLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdHJ1ZTtcblxuICAgICAgICBpZiAobGMubmFtZSA9PT0gJ0Jsb2NrIElEJykge1xuICAgICAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2x5Z29uJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSBsYy5uYW1lO1xuXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sICE9PSBsYyk7XG5cbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdudW1iZXInICYmIGNvbC5uYW1lICE9PSAnTGF0aXR1ZGUnICYmIGNvbC5uYW1lICE9PSAnTG9uZ2l0dWRlJylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB7IHRoaXMubWluc1tjb2xdID0gMWU5OyB0aGlzLm1heHNbY29sXSA9IC0xZTk7IH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICd0ZXh0JylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcblxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdID0ge30pO1xuXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKVxuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gdGhpcy5udW1lcmljQ29sdW1ucy5pbmRleE9mKGNvbCkgPCAwICYmIHRoaXMudGV4dENvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyBiZXR0ZXIgbmFtZSBhbmQgYmVoYXZpb3VyXG4gICAgZmlsdGVyKHJvdykge1xuICAgICAgICAvLyBUT0RPIG1vdmUgdGhpcyBzb21ld2hlcmUgYmV0dGVyXG4gICAgICAgIGlmIChyb3dbJ0NMVUUgc21hbGwgYXJlYSddICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gPT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChyb3dbJ0NlbnN1cyB5ZWFyJ10gJiYgcm93WydDZW5zdXMgeWVhciddICE9PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICAvLyBjb252ZXJ0IG51bWVyaWMgY29sdW1ucyB0byBudW1iZXJzIGZvciBkYXRhIHZpc1xuICAgIGNvbnZlcnRSb3cocm93KSB7XG5cbiAgICAgICAgLy8gY29udmVydCBsb2NhdGlvbiB0eXBlcyAoc3RyaW5nKSB0byBbbG9uLCBsYXRdIGFycmF5LlxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvblRvQ29vcmRzKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvY2F0aW9uKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAvLyBcIm5ldyBiYWNrZW5kXCIgZGF0YXNldHMgdXNlIGEgV0tUIGZpZWxkIFtQT0lOVCAobG9uIGxhdCldIGluc3RlYWQgb2YgKGxhdCwgbG9uKVxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25Jc1BvaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJlcGxhY2UoJ1BPSU5UICgnLCAnJykucmVwbGFjZSgnKScsICcnKS5zcGxpdCgnICcpLm1hcChuID0+IE51bWJlcihuKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGxvY2F0aW9uLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMV0ucmVwbGFjZSgnKScsICcnKSksIE51bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVswXS5yZXBsYWNlKCcoJywgJycpKV07XG4gICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gdXNlIGNvbHVtbi5jYWNoZWRDb250ZW50cy5zbWFsbGVzdCBhbmQgLmxhcmdlc3RcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICByb3dbY29sXSA9IE51bWJlcihyb3dbY29sXSkgOyAvLyArcm93W2NvbF0gYXBwYXJlbnRseSBmYXN0ZXIsIGJ1dCBicmVha3Mgb24gc2ltcGxlIHRoaW5ncyBsaWtlIGJsYW5rIHZhbHVlc1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoZSB0b3RhbCB2YWx1ZXMgaW4gXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPCB0aGlzLm1pbnNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWluc1tjb2xdID0gcm93W2NvbF07XG5cbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA+IHRoaXMubWF4c1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhzW2NvbF0gPSByb3dbY29sXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHJvd1tjb2xdO1xuICAgICAgICAgICAgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gPSAodGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0gPSBsb2NhdGlvblRvQ29vcmRzLmNhbGwodGhpcywgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKTtcblxuXG5cbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBjb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKSB7XG4gICAgICAgIHZhciBuZXdUZXh0Q29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXSA9IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSlcbiAgICAgICAgICAgICAgICAuc29ydCgodmFsYSwgdmFsYikgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGFdIDwgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGJdID8gMSA6IC0xKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLDEyKTtcblxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoIDwgMiB8fCBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA+IDIwICYmIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF1bMV1dIDw9IDUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCdzIGJvcmluZyBpZiBhbGwgdmFsdWVzIHRoZSBzYW1lLCBvciBpZiB0b28gbWFueSBkaWZmZXJlbnQgdmFsdWVzIChhcyBqdWRnZWQgYnkgc2Vjb25kLW1vc3QgY29tbW9uIHZhbHVlIGJlaW5nIDUgdGltZXMgb3IgZmV3ZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VGV4dENvbHVtbnMucHVzaChjb2wpOyAvLyBob3cgZG8geW91IHNhZmVseSBkZWxldGUgZnJvbSBhcnJheSB5b3UncmUgbG9vcGluZyBvdmVyP1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBuZXdUZXh0Q29sdW1ucztcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzKTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSByb3dzIGZyb20gU29jcmF0YSAocmV0dXJucyBQcm9taXNlKS4gXCJOZXcgYmFja2VuZFwiIHZpZXdzIGdvIHRocm91Z2ggYW4gYWRkaXRpb25hbCBzdGVwIHRvIGZpbmQgdGhlIHJlYWxcbiAgICAvLyBBUEkgZW5kcG9pbnQuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy5qc29uJylcbiAgICAgICAgLnRoZW4ocHJvcHMgPT4ge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5uZXdCYWNrZW5kICYmIHByb3BzLmNoaWxkVmlld3MubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhSWQgPSBwcm9wcy5jaGlsZFZpZXdzWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihwcm9wcyA9PiB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBkMy5jc3YoJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy9yb3dzLmNzdj9hY2Nlc3NUeXBlPURPV05MT0FEJywgdGhpcy5jb252ZXJ0Um93LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2x5Z29uJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlQmxvY2tJbmRleCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gQ3JlYXRlIGEgaGFzaCB0YWJsZSBsb29rdXAgZnJvbSBbeWVhciwgYmxvY2sgSURdIHRvIGRhdGFzZXQgcm93XG4gICAgY29tcHV0ZUJsb2NrSW5kZXgoKSB7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV1bcm93WydCbG9jayBJRCddXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSb3dGb3JCbG9jayhibG9ja0lkIC8qIGNlbnN1c195ZWFyICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbdGhpcy5ibG9ja0luZGV4W3RoaXMuYWN0aXZlQ2Vuc3VzWWVhcl1bYmxvY2tJZF1dO1xuICAgIH1cblxuICAgIGZpbHRlcmVkUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIocm93ID0+IHJvd1snQ2Vuc3VzIHllYXInXSA9PT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gIT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpO1xuICAgIH1cbn0iXX0=

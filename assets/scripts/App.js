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
            style.paint[getOpacityProp(style)] = 0;
        }
        map.addLayer(style);
    } else {
        map.setPaintProperty(dataset.mapbox.id, getOpacityProp(style), def(dataset.opacity, 0.9)); // TODO set right opacity
    }
    dataset.layerId = dataset.mapbox.id;

    //if (!invisible) 
    // surely this is an error - mapbox datasets don't have 'dataId'
    //showCaption(dataset.name, dataset.dataId, dataset.caption);
}

var _datasetNo = '';
/* Advance and display the next dataset in our loop 
Each dataset is pre-loaded by being "shown" invisible (opacity 0), then "revealed" at the right time.

    // TODO clean this up so relationship between "now" and "next" is clearer, no repetition.

*/
function nextDataset(map, datasetNo) {
    function reveal(d) {
        console.log('Reveal ' + (!!d.mapbox ? 'mapbox' : 'non-mapbox') + ' dataset: ' + d.caption);
        // TODO change 0.9 to something specific for each type
        if (d.mapbox || d.dataset) {
            map.setPaintProperty(d.layerId, getOpacityProp(map.getLayer(d.layerId)), def(d.opacity, 0.9));
        } else if (d.paint) {
            d._oldPaint = [];
            d.paint.forEach(function (paint) {
                d._oldPaint.push([paint[0], paint[1], map.getPaintProperty(paint[0], paint[1])]);
                map.setPaintProperty(paint[0], paint[1], paint[2]);
            });
        }
        if (d.mapbox || d.paint) {
            showCaption(d.name, undefined, d.caption);
        } else if (d.dataset) {
            showCaption(d.dataset.name, d.dataset.dataId, d.caption);
        }
    }
    function preloadDataset(d) {
        console.log('Preload ' + (!!d.mapbox ? 'mapbox' : 'non-mapbox') + ' dataset: ' + d.caption);
        if (d.mapbox) {

            showMapboxDataset(map, d, true);
        } else if (d.dataset) {
            d.mapvis = showDataset(map, d.dataset, d.filter, d.caption, true, d.options, true);
            d.mapvis.setVisColumn(d.column);
            d.layerId = d.mapvis.layerId;
        }
    }

    _datasetNo = datasetNo;
    var d = _cycleDatasets.datasets[datasetNo],
        nextD = _cycleDatasets.datasets[(datasetNo + 1) % _cycleDatasets.datasets.length];

    if (!d.layerId || !map.getLayer(d.layerId) /* this second test shouldn't be needed...*/) {
            preloadDataset(d);
        }
    reveal(d);

    // load, but don't show, next one. // Comment out the next line to not do the pre-loading thing.
    preloadDataset(nextD);

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

    if (nextD.flyTo && !window.stopped) {
        // got to be careful if the data overrides this,
        nextD.flyTo.duration = def(nextD.flyTo.duration, d.delay / 3.0 + nextD.delay / 3.0); // so it lands about a third of the way through the dataset's visibility.
        setTimeout(function () {
            map.flyTo(nextD.flyTo, { source: 'nextDataset' });
        }, d.delay * 2.0 / 3.0);
    }

    setTimeout(function () {
        if (d.mapvis) d.mapvis.remove();

        if (d.mapbox) map.removeLayer(d.mapbox.id);

        if (d.paint) // restore paint settings before they were messed up
            d._oldPaint.forEach(function (paint) {
                map.setPaintProperty(paint[0], paint[1], paint[2]);
            });
    }, d.delay + def(d.linger, 0)); // optional "linger" time allows overlap. Not generally needed since we implemented preloading.

    if (!window.stopped) {
        setTimeout(function () {
            nextDataset(map, (datasetNo + 1) % _cycleDatasets.datasets.length);
        }, d.delay);
    }
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

    try {
        document.documentElement.requestFullscreen();
    } catch (e) {}

    var demoMode = window.location.hash === '#demo';
    if (demoMode) {
        // if we did this after the map was loading, call map.resize();
        document.querySelector('#features').style.display = 'none';
        document.querySelector('#legends').style.display = 'none';
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
    map.addControl(new mapboxgl.AttributionControl(), 'top-right');
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
        if (e.keyCode === 190 || e.keyCode === 188 && demoMode) {
            map.stop();
            window.stopped = true;
            nextDataset(map, (_datasetNo + { 190: 1, 188: -1 }[e.keyCode]) % _cycleDatasets.datasets.length);
        }
    });

    (demoMode ? loadDatasets(map) : loadOneDataset()).then(function (dataset) {
        window.scrollTo(0, 1); // does this hide the address bar? Nope    
        if (dataset) showCaption(dataset.name, dataset.dataId);

        whenMapLoaded(map, function () {

            if (demoMode) {
                nextDataset(map, 22);
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
    delay: 8000,
    caption: 'This is Melbourne',
    paint: [['place-suburb', 'text-color', 'rgb(0,183,79)'], ['place-neighbourhood', 'text-color', 'rgb(0,183,79)']],
    name: ''

}, {
    delay: 1000,
    name: 'Property boundaries',
    caption: 'We have data like property boundaries for planning',
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
    caption: '...where the transport, postal and storage sector is located.',
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
    delay: 0,
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
                stops: [[13, 1], [16, 3]]
            }

        }
    },
    linger: 10000,
    // Fawkner Parkish
    flyTo: { center: { lng: 144.965437, lat: -37.814225 }, zoom: 13.7, bearing: -30.8, pitch: 60 }
    // birds eye, zoomed out
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:13,bearing:0,pitch:0},
},

/*    { 
        delay:10000,
        name: 'Garbage collection zones',
        caption: 'Which night is bin night',
        mapbox: {
            id: 'garbage-2',
            type: 'symbol',
            source: 'mapbox://cityofmelbourne.8arqwmhr',
            'source-layer': 'Garbage_collection_zones-9nytsk',
            paint: {
                
                'text-color': 'hsl(23, 94%, 64%)',
            }, 
            layout: {
                'text-field': '{rub_day}',
                'text-size': {
                    stops: [
                        [13, 14],
                        [16, 16]
                    ]
                }
            },
        }
        // birds eye
        //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
    },*/

{
    name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
    caption: 'How many "Blue Bikes" are ready in each station.',
    column: 'NBBikes',
    delay: 20000,
    dataset: new _sourceData.SourceData('tdvh-n9dv'),
    options: {
        symbol: {
            layout: {
                'icon-image': 'bicycle-share-15',
                'icon-allow-overlap': true
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
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -67.19999999999999, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...or something else.',
    column: 'WEDDING',
    delay: 6000,
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
    linger: 5000,
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
    flyTo: { "center": { "lng": 144.96472084161525, "lat": -37.79947747257584 }, "zoom": 14.933931528036048, "bearing": -57.64132745183708, "pitch": 60 }
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
    linger: 10000,
    caption: 'What will <b><i>you</i></b>do with our data?',
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

    }
}, {
    delay: 40000,
    caption: 'What will <b><i>you</i></b>do with our data?',
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
    //matching starting position?
    flyTo: { center: { lng: 144.95, lat: -37.813 }, bearing: 0, zoom: 14, pitch: 45, duration: 20000 }
    // from abbotsfordish
    //flyTo:{"center":{"lng":144.9725135032764,"lat":-37.807415209051285},"zoom":14.896259153012243,"bearing":-106.40000000000015,"pitch":60}
    //from south
    //flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
}]; /* jshint esnext:true */

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

var crappyFinale = [
//////////////////////////////////
// Ze grande finale
{
    delay: 1,
    dataset: new _sourceData.SourceData('sfrg-zygb'), // cafes
    options: {
        symbol: {
            layout: {
                'icon-image': 'cafe-15',
                'icon-allow-overlap': true,
                'icon-size': 0.5
            }
        }
    },
    linger: 20000
}, {
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
        }

    },
    linger: 20000
}, {
    delay: 11, linger: 20000,
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
    }
}, { // pedestrian sensors
    delay: 1, linger: 20000,
    dataset: new _sourceData.SourceData('ygaw-6rzq'),
    flyTo: { "center": { "lng": 144.96367854761945, "lat": -37.80236896106898 }, "zoom": 15.389393850725732, "bearing": -143.5844675124954, "pitch": 60 }
}, {
    caption: 'What will <u>you</u> do with our data?',
    delay: 20000,
    opacity: 0.4,
    mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': 'hsl(146, 0%, 20%)',
            'fill-extrusion-opacity': 0.9,
            'fill-extrusion-height': {
                'property': 'height',
                type: 'identity'
            }
        }

    }
}];

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

    //ret.layout = def(symbol.layout, {});
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9jeWNsZURhdGFzZXRzLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbGVnZW5kLmpzIiwic3JjL2pzL21hcFZpcy5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDR0E7O0FBQ0E7O0FBQ0E7O0FBQ0E7O0FBTkE7QUFDQTtBQUNBO0FBS0EsUUFBUSxHQUFSO0FBQ0E7QUFDQSxTQUFTLFdBQVQsR0FBdUIsc0dBQXZCO0FBQ0E7Ozs7Ozs7Ozs7QUFVQSxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0FBRUEsSUFBSSxnQkFBZ0IsU0FBaEIsYUFBZ0IsQ0FBQyxHQUFELEVBQU0sQ0FBTjtBQUFBLFdBQVksSUFBSSxNQUFKLEtBQWUsR0FBZixHQUFxQixJQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCLENBQWpDO0FBQUEsQ0FBcEI7O0FB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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDek5BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFD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UUFBdkcsRUFDTixJQURNLENBQ0QsZ0JBQVE7QUFDViwyQkFBSyxJQUFMLEdBQVksSUFBWjtBQUNBLDJCQUFLLHdCQUFMO0FBQ0Esd0JBQUksT0FBSyxLQUFMLEtBQWUsU0FBbkIsRUFDSSxPQUFLLGlCQUFMO0FBQ0o7QUFDSCxpQkFQTSxDQUFQO0FBUUgsYUF0Qk0sQ0FBUDtBQXVCSDs7QUFHRDs7Ozs0Q0FDb0I7QUFBQTs7QUFDaEIsaUJBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUM5QixvQkFBSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLE1BQXdDLFNBQTVDLEVBQ0ksT0FBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixJQUFzQyxFQUF0QztBQUNKLHVCQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLEVBQW9DLElBQUksVUFBSixDQUFwQyxJQUF1RCxLQUF2RDtBQUNILGFBSkQ7QUFLSDs7O3VDQUVjLE8sQ0FBUSxpQixFQUFtQjtBQUN0QyxtQkFBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxnQkFBckIsRUFBdUMsT0FBdkMsQ0FBVixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUFBOztBQUNYLG1CQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSx1QkFBTyxJQUFJLGFBQUosTUFBdUIsT0FBSyxnQkFBNUIsSUFBZ0QsSUFBSSxpQkFBSixNQUEyQix5QkFBbEY7QUFBQSxhQUFqQixDQUFQO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG4vLyd1c2Ugc3RyaWN0Jztcbi8vdmFyIG1hcGJveGdsID0gcmVxdWlyZSgnbWFwYm94LWdsJyk7XG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcbmltcG9ydCB7IEZsaWdodFBhdGggfSBmcm9tICcuL2ZsaWdodFBhdGgnO1xuaW1wb3J0IHsgZGF0YXNldHMgfSBmcm9tICcuL2N5Y2xlRGF0YXNldHMnO1xuaW1wb3J0IHsgTWFwVmlzIH0gZnJvbSAnLi9tYXBWaXMnO1xuY29uc29sZS5sb2coZGF0YXNldHMpO1xuLy9tYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWMzUmxkbUZuWlNJc0ltRWlPaUpqYVhoeGNHczBiemN3WW5NM01uWnNPV0ppYWpWd2FISjJJbjAuUk43S3l3TU94TExObWNURmZuMGNpZyc7XG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaVkybDBlVzltYldWc1ltOTFjbTVsSWl3aVlTSTZJbU5wZWpkb2IySjBjekF3T1dRek0yMXViR3Q2TURWcWFIb2lmUS41NVlicWVUSFdNS19iNkNFQW1vVWxBJztcbi8qXG5QZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnM6IHlnYXctNnJ6cVxuXG4qKlRyZWVzOiBodHRwOi8vbG9jYWxob3N0OjMwMDIvI2ZwMzgtd2l5eVxuXG5FdmVudCBib29raW5nczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyM4NGJmLWRpaGlcbkJpa2Ugc2hhcmUgc3RhdGlvbnM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jdGR2aC1uOWR2XG5EQU06IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZ2g3cy1xZGE4XG4qL1xuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgd2hlbk1hcExvYWRlZCA9IChtYXAsIGYpID0+IG1hcC5sb2FkZWQoKSA/IGYoKSA6IG1hcC5vbmNlKCdsb2FkJywgZik7XG5cbmxldCBjbG9uZSA9IG9iaiA9PiBKU09OLnBhcnNlKEpTT04uc3RyaW5naWZ5KG9iaikpO1xuXG5jb25zdCBvcGFjaXR5UHJvcCA9IHtcbiAgICAgICAgICAgIGZpbGw6ICdmaWxsLW9wYWNpdHknLFxuICAgICAgICAgICAgY2lyY2xlOiAnY2lyY2xlLW9wYWNpdHknLFxuICAgICAgICAgICAgc3ltYm9sOiAnaWNvbi1vcGFjaXR5JyxcbiAgICAgICAgICAgICdsaW5lJzogJ2xpbmUtb3BhY2l0eScsXG4gICAgICAgICAgICAnZmlsbC1leHRydXNpb24nOiAnZmlsbC1leHRydXNpb24tb3BhY2l0eSdcbiAgICAgICAgfTtcblxuLy8gcmV0dXJucyBhIHZhbHVlIGxpa2UgJ2NpcmNsZS1vcGFjaXR5JywgZm9yIGEgZ2l2ZW4gbGF5ZXIgc3R5bGUuXG5mdW5jdGlvbiBnZXRPcGFjaXR5UHJvcChsYXllcikge1xuICAgIGlmIChsYXllci5sYXlvdXQgJiYgbGF5ZXIubGF5b3V0Wyd0ZXh0LWZpZWxkJ10pXG4gICAgICAgIHJldHVybiAndGV4dC1vcGFjaXR5JztcbiAgICBlbHNlXG4gICAgICAgIHJldHVybiBvcGFjaXR5UHJvcFtsYXllci50eXBlXTtcbn1cblxuLy9mYWxzZSAmJiB3aGVuTWFwTG9hZGVkKCgpID0+XG4vLyAgc2V0VmlzQ29sdW1uKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5sZW5ndGgpXSkpO1xuXG4vLyBUT0RPIGRlY2lkZSBpZiB0aGlzIHNob3VsZCBiZSBpbiBNYXBWaXNcbmZ1bmN0aW9uIHNob3dGZWF0dXJlVGFibGUoZmVhdHVyZSwgc291cmNlRGF0YSwgbWFwdmlzKSB7XG4gICAgZnVuY3Rpb24gcm93c0luQXJyYXkoYXJyYXksIGNsYXNzU3RyKSB7XG4gICAgICAgIHJldHVybiAnPHRhYmxlPicgKyBcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGZlYXR1cmUpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4gXG4gICAgICAgICAgICAgICAgICAgIGFycmF5ID09PSB1bmRlZmluZWQgfHwgYXJyYXkuaW5kZXhPZihrZXkpID49IDApXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT5cbiAgICAgICAgICAgICAgICAgICAgYDx0cj48dGQgJHtjbGFzc1N0cn0+JHtrZXl9PC90ZD48dGQ+JHtmZWF0dXJlW2tleV19PC90ZD48L3RyPmApXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpICsgXG4gICAgICAgICAgICAnPC90YWJsZT4nO1xuICAgICAgICB9XG5cbiAgICBpZiAoZmVhdHVyZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIENhbGxlZCBiZWZvcmUgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIGFueXRoaW5nXG4gICAgICAgIGZlYXR1cmUgPSB7fTtcbiAgICAgICAgc291cmNlRGF0YS50ZXh0Q29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuXG4gICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9seWdvbicpIHsgLy8gVE9ETyBjaGVjayB0aGF0IHRoaXMgaXMgYSBibG9jayBsb29rdXAgY2hvcm9wbGV0aFxuICAgICAgICBmZWF0dXJlID0gc291cmNlRGF0YS5nZXRSb3dGb3JCbG9jayhmZWF0dXJlLmJsb2NrX2lkLCBmZWF0dXJlLmNlbnN1c195cik7ICAgICAgICBcbiAgICB9XG5cblxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZlYXR1cmVzJykuaW5uZXJIVE1MID0gXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBjb2xvdXI8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLnRleHRDb2x1bW5zLCAnY2xhc3M9XCJlbnVtLWZpZWxkXCInKSArIFxuICAgICAgICAnPGg0PkNsaWNrIGEgZmllbGQgdG8gdmlzdWFsaXNlIHdpdGggc2l6ZTwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMsICdjbGFzcz1cIm51bWVyaWMtZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+T3RoZXIgZmllbGRzPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLCAnJyk7XG5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNmZWF0dXJlcyB0ZCcpLmZvckVhY2godGQgPT4gXG4gICAgICAgIHRkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICBtYXB2aXMuc2V0VmlzQ29sdW1uKGUudGFyZ2V0LmlubmVyVGV4dCkgOyAvLyBUT0RPIGhpZ2hsaWdodCB0aGUgc2VsZWN0ZWQgcm93XG4gICAgICAgIH0pKTtcbn1cblxudmFyIGxhc3RGZWF0dXJlO1xuXG5cbmZ1bmN0aW9uIGNob29zZURhdGFzZXQoKSB7XG4gICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cubG9jYXRpb24uaGFzaC5yZXBsYWNlKCcjJywnJyk7XG4gICAgfVxuXG4gICAgLy8ga25vd24gQ0xVRSBibG9jayBkYXRhc2V0cyB0aGF0IHdvcmsgb2tcbiAgICB2YXIgY2x1ZUNob2ljZXMgPSBbXG4gICAgICAgICdiMzZqLWtpeTQnLCAvLyBlbXBsb3ltZW50XG4gICAgICAgICcyMzRxLWdnODMnLCAvLyBmbG9vciBzcGFjZSBieSB1c2UgYnkgYmxvY2tcbiAgICAgICAgJ2MzZ3QtaHJ6NicgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMgLS0gdGhpcyBvbmUgaXMgY29tcGxldGUsIHRoZSBvdGhlcnMgaGF2ZSBnYXBweSBkYXRhIGZvciBjb25maWRlbnRpYWxpdHlcbiAgICBdO1xuXG4gICAgLy8ga25vd24gcG9pbnQgZGF0YXNldHMgdGhhdCB3b3JrIG9rXG4gICAgdmFyIHBvaW50Q2hvaWNlcyA9IFtcbiAgICAgICAgJ2ZwMzgtd2l5eScsIC8vIHRyZWVzXG4gICAgICAgICd5Z2F3LTZyenEnLCAvLyBwZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnNcbiAgICAgICAgJzg0YmYtZGloaScsIC8vIFZlbnVlcyBmb3IgZXZlbnRzXG4gICAgICAgICd0ZHZoLW45ZHYnLCAvLyBMaXZlIGJpa2Ugc2hhcmVcbiAgICAgICAgJ2doN3MtcWRhOCcsIC8vIERBTVxuICAgICAgICAnc2ZyZy16eWdiJywgLy8gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4gICAgICAgICdldzZrLWNoejQnLCAvLyBCaW8gQmxpdHogMjAxNlxuICAgICAgICAnN3ZyZC00YXY1JywgLy8gd2F5ZmluZGluZ1xuICAgICAgICAnc3M3OS12NTU4JywgLy8gYnVzIHN0b3BzXG4gICAgICAgICdtZmZpLW05eW4nLCAvLyBwdWJzXG4gICAgICAgICdzdnV4LWJhZGEnLCAvLyBzb2lsIHRleHR1cmVzIC0gbmljZSBvbmVcbiAgICAgICAgJ3Fqd2MtZjVzaCcsIC8vIGNvbW11bml0eSBmb29kIGd1aWRlIC0gZ29vZFxuICAgICAgICAnZnRoaS16YWp5JywgLy8gcHJvcGVydGllcyBvdmVyICQyLjVtXG4gICAgICAgICd0eDhoLTJqZ2knLCAvLyBhY2Nlc3NpYmxlIHRvaWxldHNcbiAgICAgICAgJzZ1NXotdWJ2aCcsIC8vIGJpY3ljbGUgcGFya2luZ1xuICAgICAgICAvL2JzN24tNXZlaCwgLy8gYnVzaW5lc3MgZXN0YWJsaXNobWVudHMuIDEwMCwwMDAgcm93cywgdG9vIGZyYWdpbGUuXG4gICAgICAgIF07XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbiBoMScpLmlubmVySFRNTCA9ICdMb2FkaW5nIHJhbmRvbSBkYXRhc2V0Li4uJztcbiAgICByZXR1cm4gcG9pbnRDaG9pY2VzW01hdGgucm91bmQoTWF0aC5yYW5kb20oKSAqIHBvaW50Q2hvaWNlcy5sZW5ndGgpXTtcbiAgICAvL3JldHVybiAnYzNndC1ocno2Jztcbn1cblxuZnVuY3Rpb24gc2hvd0NhcHRpb24obmFtZSwgZGF0YUlkLCBjYXB0aW9uKSB7XG4gICAgbGV0IGluY2x1ZGVObyA9IGZhbHNlO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNjYXB0aW9uIGgxJykuaW5uZXJIVE1MID0gKGluY2x1ZGVObyA/IChfZGF0YXNldE5vIHx8ICcnKTonJykgKyAoY2FwdGlvbiB8fCBuYW1lIHx8ICcnKTtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjZm9vdGVyIC5kYXRhc2V0JykuaW5uZXJIVE1MID0gbmFtZSB8fCAnJztcbiAgICBcbiAgICAvLyBUT0RPIHJlaW5zdGF0ZSBmb3Igbm9uLWRlbW8gbW9kZS5cbiAgICAvL2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb3VyY2UnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2QvJyArIGRhdGFJZCk7XG4gICAgLy9kb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjc2hhcmUnKS5pbm5lckhUTUwgPSBgU2hhcmUgdGhpczogPGEgaHJlZj1cImh0dHBzOi8vY2l0eS1vZi1tZWxib3VybmUuZ2l0aHViLmlvL0RhdGEzRC8jJHtkYXRhSWR9XCI+aHR0cHM6Ly9jaXR5LW9mLW1lbGJvdXJuZS5naXRodWIuaW8vRGF0YTNELyMke2RhdGFJZH08L2E+YDsgICAgXG4gXG4gfVxuXG4gZnVuY3Rpb24gdHdlYWtQbGFjZUxhYmVscyhtYXAsIHVwKSB7XG4gICAgWydwbGFjZS1zdWJ1cmInLCAncGxhY2UtbmVpZ2hib3VyaG9vZCddLmZvckVhY2gobGF5ZXJJZCA9PiB7XG5cbiAgICAgICAgLy9yZ2IoMjI3LCA0LCA4MCk7IENvTSBwb3AgbWFnZW50YVxuICAgICAgICAvL21hcC5zZXRQYWludFByb3BlcnR5KGxheWVySWQsICd0ZXh0LWNvbG9yJywgdXAgPyAncmdiKDIyNyw0LDgwKScgOiAnaHNsKDAsMCwzMCUpJyk7IC8vIENvTSBwb3AgbWFnZW50YVxuICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllcklkLCAndGV4dC1jb2xvcicsIHVwID8gJ3JnYigwLDE4Myw3OSknIDogJ2hzbCgwLDAsMzAlKScpOyAvLyBDb00gcG9wIGdyZWVuXG4gICAgICAgIFxuICAgIH0pO1xuIH1cblxuIGZ1bmN0aW9uIHR3ZWFrQmFzZW1hcChtYXApIHtcbiAgICB2YXIgcGxhY2Vjb2xvciA9ICcjODg4JzsgLy8ncmdiKDIwNiwgMjE5LCAxNzUpJztcbiAgICB2YXIgcm9hZGNvbG9yID0gJyM3NzcnOyAvLydyZ2IoMjQwLCAxOTEsIDE1NiknO1xuICAgIG1hcC5nZXRTdHlsZSgpLmxheWVycy5mb3JFYWNoKGxheWVyID0+IHtcbiAgICAgICAgaWYgKGxheWVyLnBhaW50Wyd0ZXh0LWNvbG9yJ10gPT09ICdoc2woMCwgMCUsIDYwJSknKVxuICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkobGF5ZXIuaWQsICd0ZXh0LWNvbG9yJywgJ2hzbCgwLCAwJSwgMjAlKScpO1xuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA3MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDUwJSknKTtcbiAgICAgICAgZWxzZSBpZiAobGF5ZXIucGFpbnRbJ3RleHQtY29sb3InXSA9PT0gJ2hzbCgwLCAwJSwgNzglKScpXG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShsYXllci5pZCwgJ3RleHQtY29sb3InLCAnaHNsKDAsIDAlLCA0NSUpJyk7IC8vIHJvYWRzIG1vc3RseVxuICAgICAgICBlbHNlIGlmIChsYXllci5wYWludFsndGV4dC1jb2xvciddID09PSAnaHNsKDAsIDAlLCA5MCUpJylcbiAgICAgICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGxheWVyLmlkLCAndGV4dC1jb2xvcicsICdoc2woMCwgMCUsIDUwJSknKTtcbiAgICB9KTtcbiAgICBbJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJywgJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJywgJ3BvaS1wYXJrcy1zY2FsZXJhbmsxJ10uZm9yRWFjaChpZCA9PiB7XG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGlkLCAndGV4dC1jb2xvcicsICcjMzMzJyk7XG4gICAgfSk7XG5cbiAgICBtYXAucmVtb3ZlTGF5ZXIoJ3BsYWNlLWNpdHktbGctcycpOyAvLyByZW1vdmUgdGhlIE1lbGJvdXJuZSBsYWJlbCBpdHNlbGYuXG5cbn1cblxuLypcbiAgUmVmcmVzaCB0aGUgbWFwIHZpZXcgZm9yIHRoaXMgbmV3IGRhdGFzZXQuXG4qL1xuZnVuY3Rpb24gc2hvd0RhdGFzZXQobWFwLCBkYXRhc2V0LCBmaWx0ZXIsIGNhcHRpb24sIG5vRmVhdHVyZUluZm8sIG9wdGlvbnMsIGludmlzaWJsZSkge1xuICAgIFxuICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgIGlmIChpbnZpc2libGUpIHtcbiAgICAgICAgb3B0aW9ucy5pbnZpc2libGUgPSB0cnVlO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vc2hvd0NhcHRpb24oZGF0YXNldC5uYW1lLCBkYXRhc2V0LmRhdGFJZCwgY2FwdGlvbik7XG4gICAgfVxuXG4gICAgbGV0IG1hcHZpcyA9IG5ldyBNYXBWaXMobWFwLCBkYXRhc2V0LCBmaWx0ZXIsICFub0ZlYXR1cmVJbmZvPyBzaG93RmVhdHVyZVRhYmxlIDogbnVsbCwgb3B0aW9ucyk7XG5cbiAgICBzaG93RmVhdHVyZVRhYmxlKHVuZGVmaW5lZCwgZGF0YXNldCwgbWFwdmlzKTsgXG4gICAgcmV0dXJuIG1hcHZpcztcbn1cblxuZnVuY3Rpb24gYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpIHtcbiAgICBpZiAoIW1hcC5nZXRTb3VyY2UoZGF0YXNldC5tYXBib3guc291cmNlKSkge1xuICAgICAgICBtYXAuYWRkU291cmNlKGRhdGFzZXQubWFwYm94LnNvdXJjZSwge1xuICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsXG4gICAgICAgICAgICB1cmw6IGRhdGFzZXQubWFwYm94LnNvdXJjZVxuICAgICAgICB9KTtcbiAgICB9XG59XG4vKlxuICBTaG93IGEgZGF0YXNldCB0aGF0IGFscmVhZHkgZXhpc3RzIG9uIE1hcGJveFxuKi9cbmZ1bmN0aW9uIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZGF0YXNldCwgaW52aXNpYmxlKSB7XG4gICAgYWRkTWFwYm94RGF0YXNldChtYXAsIGRhdGFzZXQpO1xuICAgIGxldCBzdHlsZSA9IG1hcC5nZXRMYXllcihkYXRhc2V0Lm1hcGJveC5pZCk7XG4gICAgaWYgKCFzdHlsZSkge1xuICAgICAgICAvL2lmIChpbnZpc2libGUpXG4gICAgICAgICAgICAvL2RhdGFzZXQubWFwYm94XG4gICAgICAgIHN0eWxlID0gY2xvbmUoZGF0YXNldC5tYXBib3gpO1xuICAgICAgICBpZiAoaW52aXNpYmxlKSB7XG4gICAgICAgICAgICBzdHlsZS5wYWludFtnZXRPcGFjaXR5UHJvcChzdHlsZSldID0gMDtcbiAgICAgICAgfVxuICAgICAgICBtYXAuYWRkTGF5ZXIoc3R5bGUpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIG1hcC5zZXRQYWludFByb3BlcnR5KGRhdGFzZXQubWFwYm94LmlkLCBnZXRPcGFjaXR5UHJvcChzdHlsZSksIGRlZihkYXRhc2V0Lm9wYWNpdHksMC45KSk7IC8vIFRPRE8gc2V0IHJpZ2h0IG9wYWNpdHlcbiAgICB9XG4gICAgZGF0YXNldC5sYXllcklkID0gZGF0YXNldC5tYXBib3guaWQ7XG5cbiAgICAvL2lmICghaW52aXNpYmxlKSBcbiAgICAgICAgLy8gc3VyZWx5IHRoaXMgaXMgYW4gZXJyb3IgLSBtYXBib3ggZGF0YXNldHMgZG9uJ3QgaGF2ZSAnZGF0YUlkJ1xuICAgICAgICAvL3Nob3dDYXB0aW9uKGRhdGFzZXQubmFtZSwgZGF0YXNldC5kYXRhSWQsIGRhdGFzZXQuY2FwdGlvbik7XG59XG5cbmxldCBfZGF0YXNldE5vPScnO1xuLyogQWR2YW5jZSBhbmQgZGlzcGxheSB0aGUgbmV4dCBkYXRhc2V0IGluIG91ciBsb29wIFxuRWFjaCBkYXRhc2V0IGlzIHByZS1sb2FkZWQgYnkgYmVpbmcgXCJzaG93blwiIGludmlzaWJsZSAob3BhY2l0eSAwKSwgdGhlbiBcInJldmVhbGVkXCIgYXQgdGhlIHJpZ2h0IHRpbWUuXG5cbiAgICAvLyBUT0RPIGNsZWFuIHRoaXMgdXAgc28gcmVsYXRpb25zaGlwIGJldHdlZW4gXCJub3dcIiBhbmQgXCJuZXh0XCIgaXMgY2xlYXJlciwgbm8gcmVwZXRpdGlvbi5cblxuKi9cbmZ1bmN0aW9uIG5leHREYXRhc2V0KG1hcCwgZGF0YXNldE5vKSB7XG4gICAgZnVuY3Rpb24gcmV2ZWFsKGQpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ1JldmVhbCAnICsgKCEhZC5tYXBib3g/J21hcGJveCc6J25vbi1tYXBib3gnKSArICcgZGF0YXNldDogJyArIGQuY2FwdGlvbik7XG4gICAgICAgIC8vIFRPRE8gY2hhbmdlIDAuOSB0byBzb21ldGhpbmcgc3BlY2lmaWMgZm9yIGVhY2ggdHlwZVxuICAgICAgICBpZiAoZC5tYXBib3ggfHwgZC5kYXRhc2V0KSB7XG4gICAgICAgICAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eShkLmxheWVySWQsIGdldE9wYWNpdHlQcm9wKG1hcC5nZXRMYXllcihkLmxheWVySWQpKSwgZGVmKGQub3BhY2l0eSwgMC45KSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZC5wYWludCkge1xuICAgICAgICAgICAgZC5fb2xkUGFpbnQgPSBbXTtcbiAgICAgICAgICAgIGQucGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICAgICAgZC5fb2xkUGFpbnQucHVzaChbcGFpbnRbMF0sIHBhaW50WzFdLCBtYXAuZ2V0UGFpbnRQcm9wZXJ0eShwYWludFswXSwgcGFpbnRbMV0pXSk7XG4gICAgICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkocGFpbnRbMF0sIHBhaW50WzFdLCBwYWludFsyXSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZC5tYXBib3ggfHwgZC5wYWludCkge1xuICAgICAgICAgICAgc2hvd0NhcHRpb24oZC5uYW1lLCB1bmRlZmluZWQsIGQuY2FwdGlvbik7XG4gICAgICAgIH0gZWxzZSBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgICAgICBzaG93Q2FwdGlvbihkLmRhdGFzZXQubmFtZSwgZC5kYXRhc2V0LmRhdGFJZCwgZC5jYXB0aW9uKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBwcmVsb2FkRGF0YXNldChkKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdQcmVsb2FkICcgKyAoISFkLm1hcGJveD8nbWFwYm94Jzonbm9uLW1hcGJveCcpICsgJyBkYXRhc2V0OiAnICsgZC5jYXB0aW9uKTtcbiAgICAgICAgaWYgKGQubWFwYm94KSB7XG5cbiAgICAgICAgICAgIHNob3dNYXBib3hEYXRhc2V0KG1hcCwgZCwgdHJ1ZSk7XG4gICAgICAgIH0gZWxzZSBpZiAoZC5kYXRhc2V0KSB7XG4gICAgICAgICAgICBkLm1hcHZpcyA9IHNob3dEYXRhc2V0KG1hcCwgZC5kYXRhc2V0LCBkLmZpbHRlciwgZC5jYXB0aW9uLCB0cnVlLCBkLm9wdGlvbnMsICB0cnVlKTtcbiAgICAgICAgICAgIGQubWFwdmlzLnNldFZpc0NvbHVtbihkLmNvbHVtbik7XG4gICAgICAgICAgICBkLmxheWVySWQgPSBkLm1hcHZpcy5sYXllcklkO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgX2RhdGFzZXRObyA9IGRhdGFzZXRObztcbiAgICBsZXQgZCA9IGRhdGFzZXRzW2RhdGFzZXROb10sIFxuICAgICAgICBuZXh0RCA9IGRhdGFzZXRzWyhkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aF07XG5cblxuICAgIGlmICghZC5sYXllcklkIHx8ICFtYXAuZ2V0TGF5ZXIoZC5sYXllcklkKSAvKiB0aGlzIHNlY29uZCB0ZXN0IHNob3VsZG4ndCBiZSBuZWVkZWQuLi4qLykge1xuICAgICAgICBwcmVsb2FkRGF0YXNldChkKTtcbiAgICB9XG4gICAgcmV2ZWFsKGQpO1xuICAgICAgICBcblxuICAgIC8vIGxvYWQsIGJ1dCBkb24ndCBzaG93LCBuZXh0IG9uZS4gLy8gQ29tbWVudCBvdXQgdGhlIG5leHQgbGluZSB0byBub3QgZG8gdGhlIHByZS1sb2FkaW5nIHRoaW5nLlxuICAgIHByZWxvYWREYXRhc2V0KG5leHREKTtcblxuICAgIGlmIChkLnNob3dMZWdlbmQpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ2Jsb2NrJztcbiAgICB9IGVsc2Uge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gICAgfVxuXG4gICAgLy8gV2UncmUgYWltaW5nIHRvIGFycml2ZSBhdCB0aGUgdmlld3BvaW50IDEvMyBvZiB0aGUgd2F5IHRocm91Z2ggdGhlIGRhdGFzZXQncyBhcHBlYXJhbmNlXG4gICAgLy8gYW5kIGxlYXZlIDIvMyBvZiB0aGUgd2F5IHRocm91Z2guXG4gICAgaWYgKGQuZmx5VG8gJiYgIW1hcC5pc01vdmluZygpKSB7XG4gICAgICAgIGQuZmx5VG8uZHVyYXRpb24gPSBkLmRlbGF5LzM7Ly8gc28gaXQgbGFuZHMgYWJvdXQgYSB0aGlyZCBvZiB0aGUgd2F5IHRocm91Z2ggdGhlIGRhdGFzZXQncyB2aXNpYmlsaXR5LlxuICAgICAgICBtYXAuZmx5VG8oZC5mbHlUbywgeyBzb3VyY2U6ICduZXh0RGF0YXNldCd9KTtcbiAgICB9XG4gICAgXG4gICAgaWYgKG5leHRELmZseVRvICYmICF3aW5kb3cuc3RvcHBlZCkge1xuICAgICAgICAvLyBnb3QgdG8gYmUgY2FyZWZ1bCBpZiB0aGUgZGF0YSBvdmVycmlkZXMgdGhpcyxcbiAgICAgICAgbmV4dEQuZmx5VG8uZHVyYXRpb24gPSBkZWYobmV4dEQuZmx5VG8uZHVyYXRpb24sIGQuZGVsYXkvMy4wICsgbmV4dEQuZGVsYXkvMy4wKTsvLyBzbyBpdCBsYW5kcyBhYm91dCBhIHRoaXJkIG9mIHRoZSB3YXkgdGhyb3VnaCB0aGUgZGF0YXNldCdzIHZpc2liaWxpdHkuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgbWFwLmZseVRvKG5leHRELmZseVRvLCB7IHNvdXJjZTogJ25leHREYXRhc2V0J30pO1xuICAgICAgICB9LCBkLmRlbGF5ICogMi4wLzMuMCk7XG4gICAgfVxuXG4gICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgIGlmIChkLm1hcHZpcylcbiAgICAgICAgICAgIGQubWFwdmlzLnJlbW92ZSgpO1xuICAgICAgICBcbiAgICAgICAgaWYgKGQubWFwYm94KVxuICAgICAgICAgICAgbWFwLnJlbW92ZUxheWVyKGQubWFwYm94LmlkKTtcblxuICAgICAgICBpZiAoZC5wYWludCkgLy8gcmVzdG9yZSBwYWludCBzZXR0aW5ncyBiZWZvcmUgdGhleSB3ZXJlIG1lc3NlZCB1cFxuICAgICAgICAgICAgZC5fb2xkUGFpbnQuZm9yRWFjaChwYWludCA9PiB7XG4gICAgICAgICAgICAgICAgbWFwLnNldFBhaW50UHJvcGVydHkocGFpbnRbMF0sIHBhaW50WzFdLCBwYWludFsyXSk7XG4gICAgICAgICAgICB9KTtcblxuXG4gICAgICAgIFxuICAgIH0sIGQuZGVsYXkgKyBkZWYoZC5saW5nZXIsIDApKTsgLy8gb3B0aW9uYWwgXCJsaW5nZXJcIiB0aW1lIGFsbG93cyBvdmVybGFwLiBOb3QgZ2VuZXJhbGx5IG5lZWRlZCBzaW5jZSB3ZSBpbXBsZW1lbnRlZCBwcmVsb2FkaW5nLlxuICAgIFxuICAgIGlmICghd2luZG93LnN0b3BwZWQpIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgICBuZXh0RGF0YXNldChtYXAsIChkYXRhc2V0Tm8gKyAxKSAlIGRhdGFzZXRzLmxlbmd0aCk7XG4gICAgICAgIH0sIGQuZGVsYXkgKTtcbiAgICB9XG59XG5cbi8qIFByZSBkb3dubG9hZCBhbGwgZGF0YXNldHMgaW4gdGhlIGxvb3AgKi9cbmZ1bmN0aW9uIGxvYWREYXRhc2V0cyhtYXApIHtcbiAgICByZXR1cm4gUHJvbWlzZVxuICAgICAgICAuYWxsKGRhdGFzZXRzLm1hcChkID0+IHsgXG4gICAgICAgICAgICBpZiAoZC5kYXRhc2V0KVxuICAgICAgICAgICAgICAgIHJldHVybiBkLmRhdGFzZXQubG9hZCgpO1xuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgICAgICAgICAvLyBzdHlsZSBpc24ndCBkb25lIGxvYWRpbmcgc28gd2UgY2FuJ3QgYWRkIHNvdXJjZXMuIG5vdCBzdXJlIGl0IHdpbGwgYWN0dWFsbHkgdHJpZ2dlciBkb3dubG9hZGluZyBhbnl3YXkuXG4gICAgICAgICAgICAgICAgLy9yZXR1cm4gUHJvbWlzZS5yZXNvbHZlIChhZGRNYXBib3hEYXRhc2V0KG1hcCwgZCkpO1xuICAgICAgICB9KSkudGhlbigoKSA9PiBkYXRhc2V0c1swXS5kYXRhc2V0KTtcbn1cblxuZnVuY3Rpb24gbG9hZE9uZURhdGFzZXQoKSB7XG4gICAgbGV0IGRhdGFzZXQgPSBjaG9vc2VEYXRhc2V0KCk7XG4gICAgcmV0dXJuIG5ldyBTb3VyY2VEYXRhKGRhdGFzZXQpLmxvYWQoKTtcbiAgICAvKmlmIChkYXRhc2V0Lm1hdGNoKC8uLi4uLS4uLi4vKSlcbiAgICAgICAgXG4gICAgZWxzZVxuICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpOyovXG59XG5cbihmdW5jdGlvbiBzdGFydCgpIHtcbiAgICBcbiAgICB0cnkge1xuICAgICAgICBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQucmVxdWVzdEZ1bGxzY3JlZW4oKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgfVxuXG5cbiAgICBsZXQgZGVtb01vZGUgPSB3aW5kb3cubG9jYXRpb24uaGFzaCA9PT0gJyNkZW1vJztcbiAgICBpZiAoZGVtb01vZGUpIHtcbiAgICAgICAgLy8gaWYgd2UgZGlkIHRoaXMgYWZ0ZXIgdGhlIG1hcCB3YXMgbG9hZGluZywgY2FsbCBtYXAucmVzaXplKCk7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNmZWF0dXJlcycpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7ICAgICAgICBcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZHMnKS5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnOyAgICAgICAgXG4gICAgfVxuXG4gICAgbGV0IG1hcCA9IG5ldyBtYXBib3hnbC5NYXAoe1xuICAgICAgICBjb250YWluZXI6ICdtYXAnLFxuICAgICAgICAvL3N0eWxlOiAnbWFwYm94Oi8vc3R5bGVzL21hcGJveC9kYXJrLXY5JyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvY2l0eW9mbWVsYm91cm5lL2Npejk4M2xxbzAwMXcyc3MyZW91NDllb3M/ZnJlc2g9NScsXG4gICAgICAgIGNlbnRlcjogWzE0NC45NSwgLTM3LjgxM10sXG4gICAgICAgIHpvb206IDEzLC8vMTNcbiAgICAgICAgcGl0Y2g6IDQ1LCAvLyBUT0RPIHJldmVydCBmb3IgZmxhdFxuICAgICAgICBhdHRyaWJ1dGlvbkNvbnRyb2w6IGZhbHNlXG4gICAgfSk7XG4gICAgbWFwLmFkZENvbnRyb2wobmV3IG1hcGJveGdsLkF0dHJpYnV0aW9uQ29udHJvbCgpLCAndG9wLXJpZ2h0Jyk7XG4gICAgLy9tYXAub25jZSgnbG9hZCcsICgpID0+IHR3ZWFrQmFzZW1hcChtYXApKTtcbiAgICAvL21hcC5vbmNlKCdsb2FkJywoKSA9PiB0d2Vha1BsYWNlTGFiZWxzKG1hcCx0cnVlKSk7XG4gICAgLy9zZXRUaW1lb3V0KCgpPT50d2Vha1BsYWNlTGFiZWxzKG1hcCwgZmFsc2UpLCA4MDAwKTtcbiAgICBtYXAub24oJ21vdmVlbmQnLCAoZSxkYXRhKT0+IHtcbiAgICAgICAgaWYgKGUuc291cmNlID09PSAnbmV4dERhdGFzZXQnKVxuICAgICAgICAgICAgcmV0dXJuO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKHtcbiAgICAgICAgICAgIGNlbnRlcjogbWFwLmdldENlbnRlcigpLFxuICAgICAgICAgICAgem9vbTogbWFwLmdldFpvb20oKSxcbiAgICAgICAgICAgIGJlYXJpbmc6IG1hcC5nZXRCZWFyaW5nKCksXG4gICAgICAgICAgICBwaXRjaDogbWFwLmdldFBpdGNoKClcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgLyptYXAub24oJ2Vycm9yJywgZSA9PiB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgfSk7Ki9cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5JykuYWRkRXZlbnRMaXN0ZW5lcigna2V5ZG93bicsIGU9PiB7XG4gICAgICAgIC8vY29uc29sZS5sb2coZS5rZXlDb2RlKTtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMTkwIHx8IGUua2V5Q29kZSA9PT0gMTg4ICYmIGRlbW9Nb2RlKSB7XG4gICAgICAgICAgICBtYXAuc3RvcCgpO1xuICAgICAgICAgICAgd2luZG93LnN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgbmV4dERhdGFzZXQobWFwLCAoX2RhdGFzZXRObyArIHsxOTA6IDEsIDE4ODogLTF9W2Uua2V5Q29kZV0pICUgZGF0YXNldHMubGVuZ3RoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgKGRlbW9Nb2RlID8gbG9hZERhdGFzZXRzKG1hcCkgOiBsb2FkT25lRGF0YXNldCgpKVxuICAgIC50aGVuKGRhdGFzZXQgPT4ge1xuICAgICAgICB3aW5kb3cuc2Nyb2xsVG8oMCwxKTsgLy8gZG9lcyB0aGlzIGhpZGUgdGhlIGFkZHJlc3MgYmFyPyBOb3BlICAgIFxuICAgICAgICBpZiAoZGF0YXNldCkgXG4gICAgICAgICAgICBzaG93Q2FwdGlvbihkYXRhc2V0Lm5hbWUsIGRhdGFzZXQuZGF0YUlkKTtcblxuICAgICAgICB3aGVuTWFwTG9hZGVkKG1hcCwgKCkgPT4ge1xuXG4gICAgICAgICAgICBpZiAoZGVtb01vZGUpIHtcbiAgICAgICAgICAgICAgICBuZXh0RGF0YXNldChtYXAsIDIyKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2hvd0RhdGFzZXQobWFwLCBkYXRhc2V0KTtcbiAgICAgICAgICAgICAgICAvLyB3b3VsZCBiZSBuaWNlIHRvIHN1cHBvcnQgbG9hZGluZyBtYXBib3ggZGF0YXNldHMgYnV0XG4gICAgICAgICAgICAgICAgLy8gaXQncyBhIGZhZmYgdG8gZ3Vlc3MgaG93IHRvIHN0eWxlIGl0XG4gICAgICAgICAgICAgICAgLy9pZiAoZGF0YXNldC5tYXRjaCgvLi4uLi0uLi4uLykpXG4gICAgICAgICAgICAgICAgLy9lbHNlXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNsb2FkaW5nJylbMF0ub3V0ZXJIVE1MPScnO1xuXG4gICAgICAgICAgICBpZiAoZGVtb01vZGUpIHtcbiAgICAgICAgICAgICAgICAvL3ZhciBmcCA9IG5ldyBGbGlnaHRQYXRoKG1hcCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICBcblxuICAgIH0pO1xufSkoKTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG4vKlxuU3VnZ2VzdGlvbnM6XG5cblRoaXMgaXMgTWVsYm91cm5lXG5IZXJlIGFyZSBvdXIgcHJlY2luY3RzXG5BcyB5b3UnZCBndWVzcywgd2UgaGF2ZSBhIGxvdCBvZiBkYXRhOlxuLSBhZGRyZXNzZXMsIGJvdW5kYXJpZXNcblxuXG4xLiBPcmllbnQgd2l0aCBwcmVjaW5jdHNcblxuMi4gQnV0IHdlIGFsc28gaGF2ZTogXG4tIHdlZGRpbmdcbi0gYmluIG5pZ2h0c1xuLSBkb2dzIGxhc3QgXG4tIHRvaWxldHNcbi0tIGFsbFxuLS0gd2hlZWxjaGFpcnMgd2l0aCBpY29uc1xuXG4qL1xuXG5cblxuXG5cbi8qXG5JbnRyb1xuLSBPdmVydmlldyAoc3VidXJiIG5hbWVzIGhpZ2hsaWdodGVkKVxuLSBQcm9wZXJ0eSBib3VuZGFyaWVzXG4tIFN0cmVldCBhZGRyZXNzZXNcblxuVXJiYW4gZm9yZXN0OlxuLSBlbG1zXG4tIGd1bXNcbi0gcGxhbmVzXG4tIGFsbFxuXG5DTFVFXG4tIGVtcGxveW1lbnRcbi0gdHJhbnNwb3J0IHNlY3RvclxuLSBzb2NpYWwvaGVhbHRoIHNlY3RvclxuXG5EQU1cbi0gYXBwbGljYXRpb25zXG4tIGNvbnN0cnVjdGlvblxuLSBjb21wbGV0ZWRcblxuRGlkIHlvdSBrbm93OlxuLSBjb21tdW5pdHkgZm9vZFxuLSBHYXJiYWdlIENvbGxlY3Rpb24gWm9uZXNcbi0gQm9va2FibGUgRXZlbnQgVmVudWVzXG4tLSB3ZWRkaW5nYWJsZVxuLS0gYWxsXG4tIFRvaWxldHNcbi0tIGFsbCBcbi0tIGFjY2Vzc2libGVcbi0gQ2FmZXMgYW5kIFJlc3RhdXJhbnRzXG4tIERvZyB3YWxraW5nIHpvbmVzXG5cbkZpbmFsZTpcbi0gU2t5bGluZVxuLSBXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhP1xuXG5cbkdhcmJhZ2UgQ29sbGVjdGlvbiBab25lc1xuRG9nIFdhbGtpbmcgWm9uZXMgb2ZmLWxlYXNoXG5CaWtlIFNoYXJlIFN0YXRpb25zXG5Cb29rYWJsZSBFdmVudCBWZW51ZXNcbi0gd2VkZGluZ2FibGVcblxuXG5HcmFuZCBmaW5hbGUgXCJXaGF0IGNhbiB5b3UgZG8gd2l0aCBvdXIgb3BlbiBkYXRhXCI/XG4tIGJ1aWxkaW5nc1xuLSBjYWZlc1xuLSBcblxuXG5cblRoZXNlIG5lZWQgYSBob21lOlxuLSBiaWtlIHNoYXJlIHN0YXRpb25zXG4tIHBlZGVzdHJpYW4gc2Vuc29yc1xuLSBhZGRyZXNzZXNcbi0gcHJvcGVydHkgYm91bmRhcmllc1xuLSBidWlsZGluZ3Ncbi0gY2FmZXNcbi0gY29tbXVuaXR5IGZvb2RcblxuXG5cbiovXG5cblxuXG5cblxuXG5cblxuXG5cbi8qXG5cbkRhdGFzZXQgcnVuIG9yZGVyXG4tIGJ1aWxkaW5ncyAoM0QpXG4tIHRyZWVzIChmcm9tIG15IG9wZW50cmVlcyBhY2NvdW50KVxuLSBjYWZlcyAoY2l0eSBvZiBtZWxib3VybmUsIHN0eWxlZCB3aXRoIGNvZmZlZSBzeW1ib2wpXG4tIGJhcnMgKHNpbWlsYXIpXG4tIGdhcmJhZ2UgY29sbGVjdGlvbiB6b25lc1xuLSBkb2cgd2Fsa2luZyB6b25lc1xuLSBDTFVFICgzRCBibG9ja3MpXG4tLSBidXNpbmVzcyBlc3RhYmxpc2htZW50cyBwZXIgYmxvY2tcbi0tLSB2YXJpb3VzIHR5cGVzLCB0aGVuIHRvdGFsXG4tLSBlbXBsb3ltZW50ICh2YXJpb3VzIHR5cGVzIHdpdGggc3BlY2lmaWMgdmFudGFnZSBwb2ludHMgLSBiZXdhcmUgdGhhdCBub3QgYWxsIGRhdGEgaW5jbHVkZWQ7IHRoZW4gdG90YWwpXG4tLSBmbG9vciB1c2UgKGRpdHRvKVxuXG5cblxuXG5NaW5pbXVtXG4tIGZsb2F0eSBjYW1lcmFzXG4tIGNsdWUgM0QsXG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcblxuSGVhZGVyOlxuLSBkYXRhc2V0IG5hbWVcbi0gY29sdW1uIG5hbWVcblxuRm9vdGVyOiBkYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1XG5cbkNvTSBsb2dvXG5cblxuTWVkaXVtXG4tIE11bmljaXBhbGl0eSBib3VuZGFyeSBvdmVybGFpZFxuXG5TdHJldGNoIGdvYWxzXG4tIG92ZXJsYXkgYSB0ZXh0IGxhYmVsIG9uIGEgYnVpbGRpbmcvY2x1ZWJsb2NrIChlZywgRnJlZW1hc29ucyBIb3NwaXRhbCAtIHRvIHNob3cgd2h5IHNvIG11Y2ggaGVhbHRoY2FyZSlcblxuXG5cblxuXG4qL1xuXG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcblxuZXhwb3J0IGNvbnN0IGRhdGFzZXRzID0gW1xuICAgIHtcbiAgICAgICAgZGVsYXk6ODAwMCxcbiAgICAgICAgY2FwdGlvbjonVGhpcyBpcyBNZWxib3VybmUnLFxuICAgICAgICBwYWludDogW1xuICAgICAgICAgICAgWydwbGFjZS1zdWJ1cmInLCAndGV4dC1jb2xvcicsICdyZ2IoMCwxODMsNzkpJ10sXG4gICAgICAgICAgICBbJ3BsYWNlLW5laWdoYm91cmhvb2QnLCAndGV4dC1jb2xvcicsICdyZ2IoMCwxODMsNzkpJ11cbiAgICAgICAgXSxcbiAgICAgICAgbmFtZTogJydcblxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2UgaGF2ZSBkYXRhIGxpa2UgcHJvcGVydHkgYm91bmRhcmllcyBmb3IgcGxhbm5pbmcnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYm91bmRhcmllcy0xJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwLCAvLyBqdXN0IHRvIGF2b2lkIGZsYXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcbiAgICAvLyByZXBlYXQgLSBqdXN0IHRvIGZvcmNlIHRoZSB0aW1pbmdcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbGluZ2VyOjMwMDAsXG4gICAgICAgIG5hbWU6ICdQcm9wZXJ0eSBib3VuZGFyaWVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1dlIGhhdmUgZGF0YSBsaWtlIHByb3BlcnR5IGJvdW5kYXJpZXMgZm9yIHBsYW5uaW5nJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMtMicsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuNzk5ZHJvdWgnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdQcm9wZXJ0eV9ib3VuZGFyaWVzLTA2MWsweCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ3JnYigwLDE4Myw3OSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCAwLjVdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAyXVxuICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICB9LFxuICAgICAgICAvLyBqdXN0IHJlcGVhdCBwcmV2aW91cyB2aWV3LlxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjE0MDAwLFxuICAgICAgICBuYW1lOiAnU3RyZWV0IGFkZHJlc3NlcycsXG4gICAgICAgIGNhcHRpb246ICdBcyB5b3VcXCdkIGd1ZXNzLCB3ZSBoYXZlIGRhdGEgbGlrZSBldmVyeSBzdHJlZXQgYWRkcmVzcycsXG4gICAgICAgIC8vIG5lZWQgdG8gem9vbSBpbiBjbG9zZSBvbiB0aGlzIG9uZVxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWRkcmVzc2VzJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnU3RyZWV0X2FkZHJlc3Nlcy05N2U1b24nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7c3RyZWV0X25vfScsXG4gICAgICAgICAgICAgICAgJ3RleHQtYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IDEwLFxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyBuZWFyIHVuaS1pc2hcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDAxNzM2NDI2MDY4LFwibGF0XCI6LTM3Ljc5NzcwNzk4ODYwMTIzfSxcInpvb21cIjoxOCxcImJlYXJpbmdcIjotNDUuNzAyMDMwNDA1MDYwODQsXCJwaXRjaFwiOjQ4LCBkdXJhdGlvbjoxNDAwMH1cbiAgICAgICAgLy8gcm91bmRhYm91dCBvZiBkZWF0aCBsb29rbmcgbndcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTEwNDg3MDYxMTg0LFwibGF0XCI6LTM3LjgwMDYxMDg4OTcxNzMyfSxcInpvb21cIjoxOC41NzIyMDQ3ODI4MTkxOTUsXCJiZWFyaW5nXCI6LTIwLjQzNTYzNjY5MTY0MzgyMixcInBpdGNoXCI6NTcuOTk5OTk5OTk5OTk5OTl9XG4gICAgfSxcblxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBoZWFsdGggYW5kIHR5cGUgb2YgZWFjaCB0cmVlIGluIG91ciB1cmJhbiBmb3Jlc3QnLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuNlxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnVWxtdXMnIF1cblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzY3NDE1NDE4MjY2LFwibGF0XCI6LTM3Ljc5MTY4NjYxOTc3Mjk3NX0sXCJ6b29tXCI6MTUuNDg3MzM3NDU3MzU2NjkxLFwiYmVhcmluZ1wiOi0xMjIuNDAwMDAwMDAwMDAwMDksXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sKi9cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBVcmJhbiBGb3Jlc3QgY29udGFpbnMgZXZlcnkgZWxtIHRyZWUuLi4nLFxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1VsbXVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjMxMzgsXCJsYXRcIjotMzcuNzg4ODQzfSxcInpvb21cIjoxNS4yLFwiYmVhcmluZ1wiOi0xMDYuMTQsXCJwaXRjaFwiOjU1fVxuXG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBjYXB0aW9uOiAnLi4uZXZlcnkgZ3VtIHRyZWUuLi4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZ3VtdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDMsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ0V1Y2FseXB0dXMnLCAnQ29yeW1iaWEnLCAnQW5nb3Bob3JhJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljg0NzM3NDg4Njg5MDcsXCJsYXRcIjotMzcuODExNzc5NzQwNzg3MjQ0fSxcInpvb21cIjoxMy4xNjI1MjQxNTA4NDczMTUsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NDV9XG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoyMDAsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQyNzMyNTY3MzMzMSxcImxhdFwiOi0zNy43ODQ0NDk0MDU5MzAzOH0sXCJ6b29tXCI6MTQuNSxcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDgwMDAsXG4gICAgICAgIC8vZGF0YXNldExlYWQ6IDMwMDAsXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgZXZlcnkgcGxhbmUgdHJlZS4nLCAvLyBhZGQgYSBudW1iZXJcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAncGxhbmV0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMzQwLCA5NyUsNjUlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbICdpbicsICdHZW51cycsICdQbGF0YW51cycgXVxuICAgICAgICAgICAgXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDM5NDYzMzgzODk2NSxcImxhdFwiOi0zNy43OTU4ODg3MDY2ODI3MX0sXCJ6b29tXCI6MTUuOTA1MTMwMzYxNDQ2NjY4LFwiYmVhcmluZ1wiOjE1Ny41OTk5OTk5OTk5OTc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTUzLFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjM5NH0sXCJ6b29tXCI6MTUsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTQ3ODUxMDAxNjIwMixcImxhdFwiOi0zNy43ODQzNDE0NzE2NzQ3N30sXCJ6b29tXCI6MTMuOTIyMjI4NDYxNzkzNjY5LFwiYmVhcmluZ1wiOjEyMi45OTQ3ODM0NjA0MzQ2LFwicGl0Y2hcIjo0Ny41MDAwMDAwMDAwMDAwM31cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1MzQzNDUwNzU1MTYsXCJsYXRcIjotMzcuODAxMzQxMTgwMTI1MjJ9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjE1MS4wMDA3MzA0ODgyNzMzOCxcInBpdGNoXCI6NTguOTk5OTk5OTk5OTk5OTl9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTYxMzg4NDg4NDA5LFwibGF0XCI6LTM3LjgwOTAyNzEwNTMxNjMyfSxcInpvb21cIjoxNC4yNDE3NTcwMzA4MTY2MzYsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ05lYXJseSA3MCwwMDAgdHJlZXMgaW4gYWxsLicsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAyLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgNTAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAvLydjaXJjbGUtY29sb3InOiAnaHNsKDE0NiwgMTAwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45XG4gICAgICAgICAgICB9LFxuXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQxOTExNTcwMDAwMzQsXCJsYXRcIjotMzcuODAwMzY3MDkyMTQwMjJ9LFwiem9vbVwiOjE0LjEsXCJiZWFyaW5nXCI6MTQ0LjkyNzI4MzkyNzQyNjk0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MTQ3LjY1MjE5MzgyMzczMTA3LFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICB9LFxuXG5cbiAgICBcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RvdGFsIGVtcGxveW1lbnQgaW4gYmxvY2snICxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBDZW5zdXMgb2YgTGFuZCBVc2UgYW5kIEVtcGxveW1lbnQgKENMVUUpIHJldmVhbHMgd2hlcmUgZW1wbG95bWVudCBpcyBjb25jZW50cmF0ZWQnLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTcsXCJsYXRcIjotMzcuODA0Mzg1OTQ5Mjc2NDk0fSxcInpvb21cIjoxMy44ODYyODczMjAxNTk4MSxcImJlYXJpbmdcIjoxMTkuNzg4Njg2ODI4ODIzNzQsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU5ODUzMzQ1NjIxNCxcImxhdFwiOi0zNy44MzU4MTkxNjI0MzY2MX0sXCJ6b29tXCI6MTMuNjQ5MTE2NjE0ODcyODM2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuICAgIH0sXG5cbiAgICAvKntcbiAgICAgICAgZGVsYXk6MTIwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGVyZSB0aGUgQ291bmNpbFxcJ3Mgc2lnbmlmaWNhbnQgcHJvcGVydHkgaG9sZGluZ3MgYXJlIGxvY2F0ZWQuJyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2Z0aGktemFqeScpLFxuICAgICAgICBjb2x1bW46ICdPd25lcnNoaXAgb3IgQ29udHJvbCcsXG4gICAgICAgIHNob3dMZWdlbmQ6IHRydWUsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzOTAzMDg3MjM4NDYsXCJsYXRcIjotMzcuODE4NjMxNjYwODEwNDI1fSxcInpvb21cIjoxMy41LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuXG4gICAgfSxcbiAgICAqL1xuICAgICBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdUcmFuc3BvcnQsIFBvc3RhbCBhbmQgU3RvcmFnZScgLFxuICAgICAgICBjYXB0aW9uOiAnLi4ud2hlcmUgdGhlIHRyYW5zcG9ydCwgcG9zdGFsIGFuZCBzdG9yYWdlIHNlY3RvciBpcyBsb2NhdGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI3NjgxNzY3MTA3MTIsXCJsYXRcIjotMzcuODI5MjE4MjQ4NTg3MjQ2fSxcInpvb21cIjoxMi43Mjg0MzEyMTc5MTQ5MTksXCJiZWFyaW5nXCI6NjguNzAzODgzMTIxODc0NTgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnSGVhbHRoIENhcmUgYW5kIFNvY2lhbCBBc3Npc3RhbmNlJyAsXG4gICAgICAgIGNhcHRpb246ICdhbmQgd2hlcmUgdGhlIGhlYWx0aGNhcmUgYW5kIHNvY2lhbCBhc3Npc3RhbmNlIG9yZ2FuaXNhdGlvbnMgYXJlIGJhc2VkLicsXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTcyMzMxMTIxODUzLFwibGF0XCI6LTM3LjgyNzA2Mzc0NzYzODI0fSxcInpvb21cIjoxMy4wNjM3NTczODYyMzIyNDIsXCJiZWFyaW5nXCI6MjYuMzc0Nzg2OTE4NTIzMzQsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG5cbiAgICB7IFxuICAgICAgICBkZWxheTogNzAwMCwgXG4gICAgICAgIGxpbmdlcjo5MDAwLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQVBQTElFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdEZXZlbG9wbWVudCBBY3Rpdml0eSBNb25pdG9yIHRyYWNrcyBtYWpvciBwcm9qZWN0cyBpbiB0aGUgcGxhbm5pbmcgc3RhZ2UuLi4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDQwMDAsXG4gICAgICAgIGxpbmdlcjo1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5wcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA1MDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0NPTVBMRVRFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICcuLi5hbmQgdGhvc2UgYWxyZWFkeSBjb21wbGV0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbi8vKioqKioqKioqKioqKioqKioqKioqICBcIkJ1dCBkaWQgeW91IGtub3dcIiBkYXRhXG4gICAge1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0J1dCBkaWQgeW91IGtub3cgd2UgaGF2ZSBkYXRhIGFib3V0IGhlYWx0aHksIGFmZm9yZGFibGUgZm9vZCBzZXJ2aWNlcz8nLFxuICAgICAgICBuYW1lOiAnQ29tbXVuaXR5IGZvb2Qgc2VydmljZXMgd2l0aCBvcGVuaW5nIGhvdXJzLCBwdWJsaWMgdHJhbnNwb3J0IGFuZCBwYXJraW5nIG9wdGlvbnMnLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnZm9vZCcsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43eHZrMGszbCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0NvbW11bml0eV9mb29kX3NlcnZpY2VzX3dpdGhfLWE3Y2o5dicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWNvbG9yJzogJ2hzbCgzMCwgODAlLCA1NiUpJyAvLyBicmlnaHQgb3JhbmdlXG4gICAgICAgICAgICAgICAgLy8ndGV4dC1jb2xvcic6ICdyZ2IoMjQ5LCAyNDMsIDE3OCknLCAvLyBtdXRlZCBvcmFuZ2UsIGEgY2l0eSBmb3IgcGVvcGxlXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne05hbWV9JyxcbiAgICAgICAgICAgICAgICAndGV4dC1zaXplJzogMTIsXG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy9zb3V0aCBNZWxib3VybmUgaXNoXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTY4NDQ1MDc2NjM1NDIsXCJsYXRcIjotMzcuODI0NTk5NDkxMDMyNDR9LFwiem9vbVwiOjE0LjAxNjk3OTg2NDQ4MjIzMyxcImJlYXJpbmdcIjotMTEuNTc4MzM2MTY2MTQyODg4LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NDczNzMwOTQ0NDY2LFwibGF0XCI6LTM3LjgwNDkwNzE1NTk1MTN9LFwiem9vbVwiOjE1LjM0ODY3NjA5OTkyMjg1MixcImJlYXJpbmdcIjotMTU0LjQ5NzEzMzMyODk3MDEsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTg0OTIyNTE0MzgzMDcsXCJsYXRcIjotMzcuODAzMTA5NzI3MjcyODF9LFwiem9vbVwiOjE1LjM1ODUwOTc4OTc5MDgwOCxcImJlYXJpbmdcIjotNzguMzk5OTk5OTk5OTk5NyxcInBpdGNoXCI6NTguNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAgXG5cblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjAsXG4gICAgICAgIG5hbWU6ICdHYXJiYWdlIGNvbGxlY3Rpb24gem9uZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2hpY2ggbmlnaHQgaXMgYmluIG5pZ2h0PycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdnYXJiYWdlLTEnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjhhcnF3bWhyJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnR2FyYmFnZV9jb2xsZWN0aW9uX3pvbmVzLTlueXRzaycsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICdsaW5lLWNvbG9yJzogJ2hzbCgyMywgOTQlLCA2NCUpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDNdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwMCxcbiAgICAgICAgLy8gRmF3a25lciBQYXJraXNoXG4gICAgICAgIGZseVRvOiB7Y2VudGVyOiB7IGxuZzoxNDQuOTY1NDM3LCBsYXQ6LTM3LjgxNDIyNX0sIHpvb206IDEzLjcsYmVhcmluZzotMzAuOCwgcGl0Y2g6NjB9XG4gICAgICAgIC8vIGJpcmRzIGV5ZSwgem9vbWVkIG91dFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjEzLGJlYXJpbmc6MCxwaXRjaDowfSxcbiAgICB9LFxuXG5cblxuLyogICAgeyBcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIG5hbWU6ICdHYXJiYWdlIGNvbGxlY3Rpb24gem9uZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2hpY2ggbmlnaHQgaXMgYmluIG5pZ2h0JyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2dhcmJhZ2UtMicsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS44YXJxd21ocicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0dhcmJhZ2VfY29sbGVjdGlvbl96b25lcy05bnl0c2snLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAndGV4dC1jb2xvcic6ICdoc2woMjMsIDk0JSwgNjQlKScsXG4gICAgICAgICAgICB9LCBcbiAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICd0ZXh0LWZpZWxkJzogJ3tydWJfZGF5fScsXG4gICAgICAgICAgICAgICAgJ3RleHQtc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMTRdLFxuICAgICAgICAgICAgICAgICAgICAgICAgWzE2LCAxNl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgIH1cbiAgICAgICAgLy8gYmlyZHMgZXllXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LCovXG5cblxuICAgIHsgXG4gICAgICAgIG5hbWU6ICdNZWxib3VybmUgQmlrZSBTaGFyZSBzdGF0aW9ucywgd2l0aCBjdXJyZW50IG51bWJlciBvZiBmcmVlIGFuZCB1c2VkIGRvY2tzIChldmVyeSAxNSBtaW51dGVzKScsXG4gICAgICAgIGNhcHRpb246ICdIb3cgbWFueSBcIkJsdWUgQmlrZXNcIiBhcmUgcmVhZHkgaW4gZWFjaCBzdGF0aW9uLicsXG4gICAgICAgIGNvbHVtbjogJ05CQmlrZXMnLFxuICAgICAgICBkZWxheTogMjAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgndGR2aC1uOWR2JykgLFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnYmljeWNsZS1zaGFyZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAvLyBmb3Igc29tZSByZWFzb24gaXQgZ2V0cyBzaWxlbnRseSByZWplY3RlZCB3aXRoIHRoaXM6XG4gICAgICAgICAgICAgICAgICAgIC8qJ2ljb24tc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnTkJCaWtlcycsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgWzMwLCAzXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NzY4NDE0NTYyODg3LFwibGF0XCI6LTM3LjgxOTk4OTQ4MzcyODM5fSxcInpvb21cIjoxNC42NzAyMjE2NzYyMzg1MDcsXCJiZWFyaW5nXCI6LTU3LjkzMjMwMjUxNzM2MTE3LFwicGl0Y2hcIjo2MH1cbiAgICB9LCAvLyBiaWtlIHNoYXJlXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi4nLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnV0VERElORycsICdZJ10sXG4gICAgICAgIGNvbHVtbjogJ1dFRERJTkcnLFxuICAgICAgICBkZWxheTogNDAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTY3LjE5OTk5OTk5OTk5OTk5LFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJzg0YmYtZGloaScpLFxuICAgICAgICBjYXB0aW9uOiAnUGxhY2VzIHlvdSBjYW4gYm9vayBmb3IgYSB3ZWRkaW5nLi4ub3Igc29tZXRoaW5nIGVsc2UuJyxcbiAgICAgICAgY29sdW1uOiAnV0VERElORycsXG4gICAgICAgIGRlbGF5OiA2MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MzYyNTU2NjkzMzYsXCJsYXRcIjotMzcuODEzOTYyNzEzMzQ0MzJ9LFwiem9vbVwiOjE0LjQwNTU5MTA5MTY3MTA1OCxcImJlYXJpbmdcIjotODAsXCJwaXRjaFwiOjU0LjAwMDAwMDAwMDAwMDAyfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLicsXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd0b2lsZXQtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLnRoYXQgYXJlIGFjY2Vzc2libGUgZm9yIHdoZWVsY2hhaXIgdXNlcnMnLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCd3aGVlbGNoYWlyJywneWVzJ10sXG4gICAgICAgIGRlbGF5OiAxLFxuICAgICAgICBsaW5nZXI6NTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnd2hlZWxjaGFpci0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdydTN6LTQ0d2UnKSxcbiAgICAgICAgY2FwdGlvbjogJ1B1YmxpYyB0b2lsZXRzLi4udGhhdCBhcmUgYWNjZXNzaWJsZSBmb3Igd2hlZWxjaGFpciB1c2VycycsXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICAvL2xpbmdlcjo1MDAwLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICBmaWx0ZXI6IFsnIT0nLCd3aGVlbGNoYWlyJywneWVzJ10sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3RvaWxldC0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cblxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGxpbmdlcjogNTAwMCxcbiAgICAgICAgY2FwdGlvbjogJ091ciBkYXRhIHRlbGxzIHlvdSB3aGVyZSB5b3VyIGRvZyBkb2VzblxcJ3QgbmVlZCBhIGxlYXNoJyxcbiAgICAgICAgbmFtZTogJ0RvZyBXYWxraW5nIFpvbmVzJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLmNsemFwMmplJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnRG9nX1dhbGtpbmdfWm9uZXMtM2ZoOXE0JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnaHNsKDM0MCwgOTclLDY1JSknLCAvL2hzbCgzNDAsIDk3JSwgNDUlKVxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnc3RhdHVzJywgJ29mZmxlYXNoJ11cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjQ3MjA4NDE2MTUyNSxcImxhdFwiOi0zNy43OTk0Nzc0NzI1NzU4NH0sXCJ6b29tXCI6MTQuOTMzOTMxNTI4MDM2MDQ4LFwiYmVhcmluZ1wiOi01Ny42NDEzMjc0NTE4MzcwOCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NjEzOTg3NzMyOTMyLFwibGF0XCI6LTM3LjgzODg4MjY2NTk2MTg3fSxcInpvb21cIjoxNS4wOTY0MTk1Nzk0MzI4NzgsXCJiZWFyaW5nXCI6LTMwLFwicGl0Y2hcIjo1Ny40OTk5OTk5OTk5OTk5OX1cbiAgICB9LFxuXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZXJlXFwncyBldmVuIGV2ZXJ5IGNhZmUgYW5kIHJlc3RhdXJhbnQnLFxuICAgICAgICBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLFxuICAgICAgICAvLyBDQkQgbG9va2luZyB0b3dhcmRzIENhcmx0b25cbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2NDIwMDk5ODk3MDQ1LFwibGF0XCI6LTM3LjgwNDA3NjI5MTYyMTZ9LFwiem9vbVwiOjE1LjY5NTY2MjEzNjMzOTY1MyxcImJlYXJpbmdcIjotMjIuNTY5NzE4NzY1MDA2MzEsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzA5ODc4OTk5Mjk2NCxcImxhdFwiOi0zNy44MTAyMTMxMDQwNDc0OX0sXCJ6b29tXCI6MTYuMDI3NzMyMzMyMDE2OTksXCJiZWFyaW5nXCI6LTEzNS4yMTk3NTMwODY0MTk4MSxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnY2FmZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIGxpbmdlcjoxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doYXQgd2lsbCA8Yj48aT55b3U8L2k+PC9iPmRvIHdpdGggb3VyIGRhdGE/JyxcbiAgICAgICAgbmFtZTogJ0J1aWxkaW5nIG91dGxpbmVzJyxcbiAgICAgICAgb3BhY2l0eTowLjYsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuNixcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGZyb20gYWJib3RzZm9yZGlzaFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzI1MTM1MDMyNzY0LFwibGF0XCI6LTM3LjgwNzQxNTIwOTA1MTI4NX0sXCJ6b29tXCI6MTQuODk2MjU5MTUzMDEyMjQzLFwiYmVhcmluZ1wiOi0xMDYuNDAwMDAwMDAwMDAwMTUsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2Zyb20gc291dGhcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0NzAxNDA3NTM0NDUsXCJsYXRcIjotMzcuODE1MjAwNjI3MjY2NjZ9LFwiem9vbVwiOjE1LjQ1ODc4NDkzMDIzODY3MixcImJlYXJpbmdcIjo5OC4zOTk5OTk5OTk5OTk4OCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjQwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hhdCB3aWxsIDxiPjxpPnlvdTwvaT48L2I+ZG8gd2l0aCBvdXIgZGF0YT8nLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICBvcGFjaXR5OjAuNixcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogMC42LFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICAgICAgLy9tYXRjaGluZyBzdGFydGluZyBwb3NpdGlvbj9cbiAgICAgICAgZmx5VG86e2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sYmVhcmluZzowLHpvb206MTQscGl0Y2g6NDUsZHVyYXRpb246MjAwMDB9XG4gICAgICAgIC8vIGZyb20gYWJib3RzZm9yZGlzaFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzI1MTM1MDMyNzY0LFwibGF0XCI6LTM3LjgwNzQxNTIwOTA1MTI4NX0sXCJ6b29tXCI6MTQuODk2MjU5MTUzMDEyMjQzLFwiYmVhcmluZ1wiOi0xMDYuNDAwMDAwMDAwMDAwMTUsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2Zyb20gc291dGhcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0NzAxNDA3NTM0NDUsXCJsYXRcIjotMzcuODE1MjAwNjI3MjY2NjZ9LFwiem9vbVwiOjE1LjQ1ODc4NDkzMDIzODY3MixcImJlYXJpbmdcIjo5OC4zOTk5OTk5OTk5OTk4OCxcInBpdGNoXCI6NjB9XG4gICAgfVxuXTtcbmNvbnN0IGNyYXBweUZpbmFsZSA9IFtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gWmUgZ3JhbmRlIGZpbmFsZVxuICAgIHtcbiAgICAgICAgZGVsYXk6MSxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLCAvLyBjYWZlc1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnY2FmZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1zaXplJzogMC41XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LCAgIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjExLCBsaW5nZXI6MjAwMDAsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB7IC8vIHBlZGVzdHJpYW4gc2Vuc29yc1xuICAgICAgICBkZWxheToxLGxpbmdlcjoyMDAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3lnYXctNnJ6cScpLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzY3ODU0NzYxOTQ1LFwibGF0XCI6LTM3LjgwMjM2ODk2MTA2ODk4fSxcInpvb21cIjoxNS4zODkzOTM4NTA3MjU3MzIsXCJiZWFyaW5nXCI6LTE0My41ODQ0Njc1MTI0OTU0LFwicGl0Y2hcIjo2MH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPHU+eW91PC91PiBkbyB3aXRoIG91ciBkYXRhPycsXG4gICAgICAgIGRlbGF5OjIwMDAwLFxuICAgICAgICBvcGFjaXR5OjAuNCxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJ2hzbCgxNDYsIDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuOSxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgfSxcblxuXTtcblxuY29uc3QgdW51c2VkID0gW1xue1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1BlZGVzdHJpYW4gc2Vuc29ycyBjb3VudCBmb290IHRyYWZmaWMgZXZlcnkgaG91cicsXG4gICAgICAgIG5hbWU6ICdQZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnMnLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgneWdhdy02cnpxJyksXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNjc4NTQ3NjE5NDUsXCJsYXRcIjotMzcuODAyMzY4OTYxMDY4OTh9LFwiem9vbVwiOjE1LjM4OTM5Mzg1MDcyNTczMixcImJlYXJpbmdcIjotMTQzLjU4NDQ2NzUxMjQ5NTQsXCJwaXRjaFwiOjYwfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfVxuXTtcblxuXG5cblxuXG5leHBvcnQgY29uc3QgZGF0YXNldHMyID0gW1xuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3QgYXBwbGljYXRpb25zJyxcblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBST1ZFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyBhcHByb3ZlZCcgXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nIFxuICAgIH0sIFxuICAgIHsgZGVsYXk6IDUwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSB9LCAvLyBiaWtlIHNoYXJlXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdBY2NvbW1vZGF0aW9uJyB9LFxuICAgIHsgZGVsYXk6IDEwMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIGNvbHVtbjogJ0FydHMgYW5kIFJlY3JlYXRpb24gU2VydmljZXMnIH0sXG4gICAgLy97IGRlbGF5OiAzMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ1JldGFpbCBUcmFkZScgfSxcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0NvbnN0cnVjdGlvbicgfVxuICAgIC8veyBkZWxheTogMTAwMCwgZGF0YXNldDogJ2IzNmota2l5NCcgfSxcbiAgICAvL3sgZGVsYXk6IDIwMDAsIGRhdGFzZXQ6ICcyMzRxLWdnODMnIH1cbl07XG4iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmltcG9ydCB7IG1lbGJvdXJuZVJvdXRlIH0gZnJvbSAnLi9tZWxib3VybmVSb3V0ZSc7XG5cbi8qXG5Db250aW51b3VzbHkgbW92ZXMgdGhlIE1hcGJveCB2YW50YWdlIHBvaW50IGFyb3VuZCBhIEdlb0pTT04tZGVmaW5lZCBwYXRoLlxuKi9cblxuZnVuY3Rpb24gd2hlbkxvYWRlZChtYXAsIGYpIHtcbiAgICBpZiAobWFwLmxvYWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbHJlYWR5IGxvYWRlZC4nKTtcbiAgICAgICAgZigpO1xuICAgIH1cbiAgICBlbHNlIHsgXG4gICAgICAgIGNvbnNvbGUubG9nKCdXYWl0IGZvciBsb2FkJyk7XG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG4gICAgfVxufVxuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5leHBvcnQgY2xhc3MgRmxpZ2h0UGF0aCB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXAsIHJvdXRlKSB7XG4gICAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMucm91dGUgPSBtZWxib3VybmVSb3V0ZTtcblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMC4wMTtcblxuICAgICAgICB0aGlzLnBvc05vID0gMDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IHRoaXMucm91dGUuZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKHtcbiAgICAgICAgICAgIGNlbnRlcjogZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgIHpvb206IGRlZihmZWF0dXJlLnByb3BlcnRpZXMuem9vbSwgMTQpLFxuICAgICAgICAgICAgYmVhcmluZzogZmVhdHVyZS5wcm9wZXJ0aWVzLmJlYXJpbmcsXG4gICAgICAgICAgICBwaXRjaDogZGVmKGZlYXR1cmUucHJvcGVydGllcy5waXRjaCwgNjApXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5iZWFyaW5nPTA7XG5cbiAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cblxuXG4gICAgLyp2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICB7IGNlbnRlcjogWzE0NC45NiwgLTM3LjhdLCB6b29tOiAxNSwgYmVhcmluZzogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OCwgLTM3Ljg0XSwgem9vbTogMTUsIGJlYXJpbmc6IDE2MCwgcGl0Y2g6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTk1LCAtMzcuODI1XSwgem9vbTogMTUsIGJlYXJpbmc6IC05MH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk3LCAtMzcuODJdLCB6b29tOiAxNSwgYmVhcmluZzogMTQwfVxuXG4gICAgXTsqL1xuXG4gICAgICAgIHRoaXMubW92ZUNhbWVyYSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbW92ZUNhbWVyYScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zaXRpb25zW3RoaXMucG9zTm9dO1xuICAgICAgICAgICAgcG9zLnNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIHBvcy5jdXJ2ZSA9IDAuNDg7IC8vMTtcbiAgICAgICAgICAgIHBvcy5lYXNpbmcgPSAodCkgPT4gdDsgLy8gbGluZWFyIGVhc2luZ1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmx5VG8nKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmZseVRvKHBvcywgeyBzb3VyY2U6ICdmbGlnaHRwYXRoJyB9KTtcblxuICAgICAgICAgICAgdGhpcy5wb3NObyA9ICh0aGlzLnBvc05vICsgMSkgJSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFwLnJvdGF0ZVRvKGJlYXJpbmcsIHsgZWFzaW5nOiBlYXNpbmcgfSk7XG4gICAgICAgICAgICAvL2JlYXJpbmcgKz0gNTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuIFxuICAgICAgICB0aGlzLm1hcC5vbignbW92ZWVuZCcsIChkYXRhKSA9PiB7IFxuICAgICAgICAgICAgaWYgKGRhdGEuc291cmNlID09PSAnZmxpZ2h0cGF0aCcpIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgVGhpcyBzZWVtZWQgdG8gYmUgdW5yZWxpYWJsZSAtIHdhc24ndCBhbHdheXMgZ2V0dGluZyB0aGUgbG9hZGVkIGV2ZW50LlxuICAgICAgICB3aGVuTG9hZGVkKHRoaXMubWFwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGVkLicpO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcC5qdW1wVG8odGhpcy5wb3NpdGlvbnNbMF0pO1xuICAgICAgICB0aGlzLnBvc05vICsrO1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgMCAvKnRoaXMucGF1c2VUaW1lKi8pO1xuXG4gICAgICAgIHRoaXMubWFwLm9uKCdjbGljaycsICgpID0+IHsgXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9ICAgIFxuXG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JhZGl1c0xlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgLy8gVE9ETyBwYWQgdGhlIHNtYWxsIGNpcmNsZSBzbyB0aGUgdGV4dCBzdGFydHMgYXQgdGhlIHNhbWUgWCBwb3NpdGlvbiBmb3IgYm90aFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDo2cHg7IHdpZHRoOiA2cHg7IGJvcmRlci1yYWRpdXM6IDNweFwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMjBweDsgYm9yZGVyLXJhZGl1czogMTBweFwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD5gO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoNDAsNDAsMjUwKVwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDozcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoMjAsMjAsNDApXCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPmA7IFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDYXRlZ29yeUxlZ2VuZChpZCwgY29sdW1uTmFtZSwgY29sb3JTdG9wcywgY2xvc2VIYW5kbGVyKSB7XG4gICAgbGV0IGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgK1xuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgY29sb3JTdG9wc1xuICAgICAgICAgICAgLnNvcnQoKHN0b3BhLCBzdG9wYikgPT4gc3RvcGFbMF0ubG9jYWxlQ29tcGFyZShzdG9wYlswXSkpIC8vIHNvcnQgb24gdmFsdWVzXG4gICAgICAgICAgICAubWFwKHN0b3AgPT4gYDxzcGFuIGNsYXNzPVwiYm94XCIgc3R5bGU9J2JhY2tncm91bmQ6ICR7c3RvcFsxXX0nPjwvc3Bhbj48bGFiZWw+JHtzdG9wWzBdfTwvbGFiZWw+PGJyLz5gKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgKiBhcyBsZWdlbmQgZnJvbSAnLi9sZWdlbmQnO1xuLypcbldyYXBzIGEgTWFwYm94IG1hcCB3aXRoIGRhdGEgdmlzIGNhcGFiaWxpdGllcyBsaWtlIGNpcmNsZSBzaXplIGFuZCBjb2xvciwgYW5kIHBvbHlnb24gaGVpZ2h0LlxuXG5zb3VyY2VEYXRhIGlzIGFuIG9iamVjdCB3aXRoOlxuLSBkYXRhSWRcbi0gbG9jYXRpb25Db2x1bW5cbi0gdGV4dENvbHVtbnNcbi0gbnVtZXJpY0NvbHVtbnNcbi0gcm93c1xuLSBzaGFwZVxuLSBtaW5zLCBtYXhzXG4qL1xuY29uc3QgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgdW5pcXVlID0gMDtcblxuZXhwb3J0IGNsYXNzIE1hcFZpcyB7XG4gICAgY29uc3RydWN0b3IobWFwLCBzb3VyY2VEYXRhLCBmaWx0ZXIsIGZlYXR1cmVIb3Zlckhvb2ssIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuc291cmNlRGF0YSA9IHNvdXJjZURhdGE7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB0aGlzLmZlYXR1cmVIb3Zlckhvb2sgPSBmZWF0dXJlSG92ZXJIb29rOyAvLyBmKHByb3BlcnRpZXMsIHNvdXJjZURhdGEpXG4gICAgICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjaXJjbGVSYWRpdXM6IGRlZihvcHRpb25zLmNpcmNsZVJhZGl1cywgMTApLFxuICAgICAgICAgICAgaW52aXNpYmxlOiBvcHRpb25zLmludmlzaWJsZSwgLy8gd2hldGhlciB0byBjcmVhdGUgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wgLy8gTWFwYm94IHN5bWJvbCBwcm9wZXJ0aWVzLCBtZWFuaW5nIHdlIHNob3cgc3ltYm9sIGluc3RlYWQgb2YgY2lyY2xlXG4gICAgICAgIH07XG5cbiAgICAgICAgLy90aGlzLm9wdGlvbnMuaW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIFRPRE8gc2hvdWxkIGJlIHBhc3NlZCBhIExlZ2VuZCBvYmplY3Qgb2Ygc29tZSBraW5kLlxuXG4gICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmxheWVySWQgPSBzb3VyY2VEYXRhLnNoYXBlICsgJy0nICsgc291cmNlRGF0YS5kYXRhSWQgKyAnLScgKyAodW5pcXVlKyspO1xuICAgICAgICB0aGlzLmxheWVySWRIaWdobGlnaHQgPSB0aGlzLmxheWVySWQgKyAnLWhpZ2hsaWdodCc7XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgcG9pbnREYXRhc2V0VG9HZW9KU09OKHRoaXMuc291cmNlRGF0YSkgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ5IHVzaW5nIGEgY2lyY2xlIGhpZ2hsaWdodCBldmVuIG9uIGFuIGljb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuc3ltYm9sLCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgICAgICAgICAvLyBodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvRWNvbm9teS9FbXBsb3ltZW50LWJ5LWJsb2NrLWJ5LWluZHVzdHJ5L2IzNmota2l5NFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgeyBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsIFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdtYXBib3g6Ly9vcGVuY291bmNpbGRhdGEuYWVkZm15cDgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25MYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1RoaXMgaXMgYSBzeW1ib2wgbGF5ZXIsIHdlIGlnbm9yZSBzZXRWaXNDb2x1bW4uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbHVtbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSBzb3VyY2VEYXRhLnRleHRDb2x1bW5zWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gY29sdW1uTmFtZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhIGNvbHVtbjogJyArIHRoaXMuZGF0YUNvbHVtbik7XG5cbiAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHBvbHlnb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBhZGQgY2xvc2UgYnV0dG9uIGJlaGF2aW91ci4gbWF5YmU/XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBoYW5kbGUgZW51bSBmaWVsZHMgb24gcG9seWdvbnMgKG5vIGV4YW1wbGUgY3VycmVudGx5KVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgbGV0IG1pblNpemUgPSAwLjMgKiB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuICAgICAgICAgICAgbGV0IG1heFNpemUgPSB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuXG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1yYWRpdXMnLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCAxXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCAzXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCBtaW5TaXplXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCBtYXhTaXplXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd1JhZGl1c0xlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyAvLyBDYW4ndCBzYWZlbHkgY2xvc2UgbnVtZXJpYyBjb2x1bW5zIHlldC4gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzM5NDlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZVJhZGl1cyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCdjaXJjbGUtcmFkaXVzJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1udW1lcmljJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgLy8gZnJvbSBDb2xvckJyZXdlclxuICAgICAgICAgICAgY29uc3QgZW51bUNvbG9ycyA9IFsnIzFmNzhiNCcsJyNmYjlhOTknLCcjYjJkZjhhJywnIzMzYTAyYycsJyNlMzFhMWMnLCcjZmRiZjZmJywnI2E2Y2VlMycsICcjZmY3ZjAwJywnI2NhYjJkNicsJyM2YTNkOWEnLCcjZmZmZjk5JywnI2IxNTkyOCddO1xuXG4gICAgICAgICAgICBsZXQgZW51bVN0b3BzID0gdGhpcy5zb3VyY2VEYXRhLnNvcnRlZEZyZXF1ZW5jaWVzW2RhdGFDb2x1bW5dLm1hcCgodmFsLGkpID0+IFt2YWwsIGVudW1Db2xvcnNbaV1dKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IGVudW1TdG9wc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUT0RPIHRlc3QgY2xvc2UgaGFuZGxlciwgY3VycmVudGx5IG5vbiBmdW5jdGlvbmFsIGR1ZSB0byBwb2ludGVyLWV2ZW50czpub25lIGluIENTU1xuICAgICAgICAgICAgbGVnZW5kLnNob3dDYXRlZ29yeUxlZ2VuZCgnI2xlZ2VuZC1lbnVtJywgZGF0YUNvbHVtbiwgZW51bVN0b3BzLCB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yLmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLWNvbG9yJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtY29sb3InXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLWVudW0nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICAgIEFwcGxpZXMgYSBzdHlsZSB0aGF0IHJlcHJlc2VudHMgbnVtZXJpYyBkYXRhIHZhbHVlcyBhcyBoZWlnaHRzIG9mIGV4dHJ1ZGVkIHBvbHlnb25zLlxuICAgICAgICAgICAgVE9ETzogYWRkIHJlbW92ZVBvbHlnb25IZWlnaHRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCcsICB7XG4gICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIsIHRoZSBkYXRhIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHBvbHlnb24gc2V0LCBpdCdzIGp1c3QgYSBodWdlIHZhbHVlIGxvb2t1cFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLC8vbG9jYXRpb25Db2x1bW4sIC8vIHRoZSBJRCBvbiB0aGUgYWN0dWFsIGdlb21ldHJ5IGRhdGFzZXRcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAxMDAwXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLy8ubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdyZ2IoMCwwLCcgKyBNYXRoLnJvdW5kKDQwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAyMDApICsgJyknXSlcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAnaHNsKDM0MCw4OCUsJyArIE1hdGgucm91bmQoMjAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDUwKSArICclKSddKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkLCBbJyFpbicsICdibG9ja19pZCcsIC4uLigvKiAjIyMgVE9ETyBnZW5lcmFsaXNlICovIFxuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvd1tkYXRhQ29sdW1uXSA9PT0gMClcbiAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiByb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkpXSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCB0aGlzLnNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWQpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5vZmYoJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgICAgICAgICB0aG91c2UubW91c2Vtb3ZlID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICAvLyBUaGUgYWN0dWFsIGNvbnN0cnVjdG9yLi4uXG4gICAgICAgIGlmICh0aGlzLnNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IChlID0+IHtcbiAgICAgICAgICAgICAgICB2YXIgZiA9IHRoaXMubWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhlLnBvaW50LCB7IGxheWVyczogW3RoaXMubGF5ZXJJZF19KVswXTsgIFxuICAgICAgICAgICAgICAgIGlmIChmICYmIGYgIT09IHRoaXMubGFzdEZlYXR1cmUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubGFzdEZlYXR1cmUgPSBmO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZmVhdHVyZUhvdmVySG9vayhmLnByb3BlcnRpZXMsIHRoaXMuc291cmNlRGF0YSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCBmLnByb3BlcnRpZXNbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXV0pOyAvLyB3ZSBkb24ndCBoYXZlIGFueSBvdGhlciByZWxpYWJsZSBrZXk/XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0LCBbJz09JywgJ2Jsb2NrX2lkJywgZi5wcm9wZXJ0aWVzLmJsb2NrX2lkXSk7IC8vIGRvbid0IGhhdmUgYSBnZW5lcmFsIHdheSB0byBtYXRjaCBvdGhlciBraW5kcyBvZiBwb2x5Z29uc1xuICAgICAgICAgICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhmLnByb3BlcnRpZXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSkuYmluZCh0aGlzKTtcbiAgICAgICAgICAgIHRoaXMubWFwLm9uKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgIH1cbiAgICAgICAgXG5cblxuXG4gICAgICAgIFxuXG4gICAgfVxufVxuXG4vLyBjb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBHZW9KU09OXG5mdW5jdGlvbiBwb2ludERhdGFzZXRUb0dlb0pTT04oc291cmNlRGF0YSkge1xuICAgIGxldCBkYXRhc291cmNlID0ge1xuICAgICAgICB0eXBlOiAnZ2VvanNvbicsXG4gICAgICAgIGRhdGE6IHtcbiAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsXG4gICAgICAgICAgICBmZWF0dXJlczogW11cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBzb3VyY2VEYXRhLnJvd3MuZm9yRWFjaChyb3cgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgaWYgKHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkge1xuICAgICAgICAgICAgICAgIGRhdGFzb3VyY2UuZGF0YS5mZWF0dXJlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmUnLFxuICAgICAgICAgICAgICAgICAgICBwcm9wZXJ0aWVzOiByb3csXG4gICAgICAgICAgICAgICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0eXBlOiAnUG9pbnQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgY29vcmRpbmF0ZXM6IHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7ICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBjYXRjaCAoZSkgeyAvLyBKdXN0IGRvbid0IHB1c2ggaXQgXG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgQmFkIGxvY2F0aW9uOiAke3Jvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXX1gKTsgICAgICAgICAgICBcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHJldHVybiBkYXRhc291cmNlO1xufTtcblxuZnVuY3Rpb24gY2lyY2xlTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgIHBhaW50OiB7XG4vLyAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAnaHNsKDIwLCA5NSUsIDUwJSknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdyZ2JhKDAsMCwwLDApJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjk1IDogMCxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3doaXRlJyA6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiB7XG4gICAgICAgICAgICAgICAgc3RvcHM6IGhpZ2hsaWdodCA/IFtbMTAsNF0sIFsxNywxMF1dIDogW1sxMCwyXSwgWzE3LDVdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuICAgIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIHN5bWJvbExheWVyKHNvdXJjZUlkLCBsYXllcklkLCBzeW1ib2wsIGZpbHRlciwgaGlnaGxpZ2h0LCBpbnZpc2libGUpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWRcbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG5cbiAgICByZXQucGFpbnQgPSBkZWYoc3ltYm9sLnBhaW50LCB7fSk7XG4gICAgcmV0LnBhaW50WydpY29uLW9wYWNpdHknXSA9ICFpbnZpc2libGUgPyAwLjk1IDogMDtcblxuICAgIC8vcmV0LmxheW91dCA9IGRlZihzeW1ib2wubGF5b3V0LCB7fSk7XG4gICAgaWYgKHN5bWJvbC5sYXlvdXQpXG4gICAgICAgIHJldC5sYXlvdXQgPSBzeW1ib2wubGF5b3V0O1xuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuXG4gZnVuY3Rpb24gcG9seWdvbkxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBpbnZpc2libGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjggOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICcjMDAzJ1xuICAgICAgICAgfSxcbiAgICB9O1xufVxuIGZ1bmN0aW9uIHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnd2hpdGUnXG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlcjogWyc9PScsICdibG9ja19pZCcsICctJ11cbiAgICB9O1xufVxuXG4iLCJleHBvcnQgY29uc3QgbWVsYm91cm5lUm91dGUgPSB7XG4gIFwidHlwZVwiOiBcIkZlYXR1cmVDb2xsZWN0aW9uXCIsXG4gIFwiZmVhdHVyZXNcIjogW1xuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogMzUwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NjI4ODI5OTU2MDU0NyxcbiAgICAgICAgICAtMzcuODIxNzE3NjQ3ODM5NjVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJiZWFyaW5nXCI6IDI3MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTc4NTA0MTgwOTA4MixcbiAgICAgICAgICAtMzcuODA4MzU5OTE3NDIzNTk0XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogMTgwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NTU1ODczODcwODQ5NixcbiAgICAgICAgICAtMzcuODA1NzgzMDIxMzE0NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDkwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45NDQzNDM1NjY4OTQ1MyxcbiAgICAgICAgICAtMzcuODE2NDk2ODkzNzIzMDhcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH1cbiAgXVxufTsiLCIvLyBodHRwczovL2QzanMub3JnL2QzLWNvbGxlY3Rpb24vIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHByZWZpeCA9IFwiJFwiO1xuXG5mdW5jdGlvbiBNYXAoKSB7fVxuXG5NYXAucHJvdG90eXBlID0gbWFwLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IE1hcCxcbiAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gKHByZWZpeCArIGtleSkgaW4gdGhpcztcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpc1twcmVmaXggKyBrZXldO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzW3ByZWZpeCArIGtleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcHJvcGVydHkgPSBwcmVmaXggKyBrZXk7XG4gICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkga2V5cy5wdXNoKHByb3BlcnR5LnNsaWNlKDEpKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfSxcbiAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHZhbHVlcy5wdXNoKHRoaXNbcHJvcGVydHldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9LFxuICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBlbnRyaWVzLnB1c2goe2tleTogcHJvcGVydHkuc2xpY2UoMSksIHZhbHVlOiB0aGlzW3Byb3BlcnR5XX0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9LFxuICBzaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpICsrc2l6ZTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfSxcbiAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZih0aGlzW3Byb3BlcnR5XSwgcHJvcGVydHkuc2xpY2UoMSksIHRoaXMpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYXAob2JqZWN0LCBmKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwO1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgbWFwLnNldChrZXksIHZhbHVlKTsgfSk7XG5cbiAgLy8gSW5kZXggYXJyYXkgYnkgbnVtZXJpYyBpbmRleCBvciBzcGVjaWZpZWQga2V5IGZ1bmN0aW9uLlxuICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgbztcblxuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGksIG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChmKG8gPSBvYmplY3RbaV0sIGksIG9iamVjdCksIG8pO1xuICB9XG5cbiAgLy8gQ29udmVydCBvYmplY3QgdG8gbWFwLlxuICBlbHNlIGlmIChvYmplY3QpIGZvciAodmFyIGtleSBpbiBvYmplY3QpIG1hcC5zZXQoa2V5LCBvYmplY3Rba2V5XSk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIG5lc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGtleXMgPSBbXSxcbiAgICAgIHNvcnRLZXlzID0gW10sXG4gICAgICBzb3J0VmFsdWVzLFxuICAgICAgcm9sbHVwLFxuICAgICAgbmVzdDtcblxuICBmdW5jdGlvbiBhcHBseShhcnJheSwgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSB7XG4gICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwICE9IG51bGxcbiAgICAgICAgPyByb2xsdXAoYXJyYXkpIDogKHNvcnRWYWx1ZXMgIT0gbnVsbFxuICAgICAgICA/IGFycmF5LnNvcnQoc29ydFZhbHVlcylcbiAgICAgICAgOiBhcnJheSk7XG5cbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBrZXkgPSBrZXlzW2RlcHRoKytdLFxuICAgICAgICBrZXlWYWx1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHZhbHVlc0J5S2V5ID0gbWFwKCksXG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlUmVzdWx0KCk7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHZhbHVlcyA9IHZhbHVlc0J5S2V5LmdldChrZXlWYWx1ZSA9IGtleSh2YWx1ZSA9IGFycmF5W2ldKSArIFwiXCIpKSB7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlc0J5S2V5LnNldChrZXlWYWx1ZSwgW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsdWVzQnlLZXkuZWFjaChmdW5jdGlvbih2YWx1ZXMsIGtleSkge1xuICAgICAgc2V0UmVzdWx0KHJlc3VsdCwga2V5LCBhcHBseSh2YWx1ZXMsIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVudHJpZXMobWFwJCQxLCBkZXB0aCkge1xuICAgIGlmICgrK2RlcHRoID4ga2V5cy5sZW5ndGgpIHJldHVybiBtYXAkJDE7XG4gICAgdmFyIGFycmF5LCBzb3J0S2V5ID0gc29ydEtleXNbZGVwdGggLSAxXTtcbiAgICBpZiAocm9sbHVwICE9IG51bGwgJiYgZGVwdGggPj0ga2V5cy5sZW5ndGgpIGFycmF5ID0gbWFwJCQxLmVudHJpZXMoKTtcbiAgICBlbHNlIGFycmF5ID0gW10sIG1hcCQkMS5lYWNoKGZ1bmN0aW9uKHYsIGspIHsgYXJyYXkucHVzaCh7a2V5OiBrLCB2YWx1ZXM6IGVudHJpZXModiwgZGVwdGgpfSk7IH0pO1xuICAgIHJldHVybiBzb3J0S2V5ICE9IG51bGwgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTsgfSkgOiBhcnJheTtcbiAgfVxuXG4gIHJldHVybiBuZXN0ID0ge1xuICAgIG9iamVjdDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVPYmplY3QsIHNldE9iamVjdCk7IH0sXG4gICAgbWFwOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKTsgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gZW50cmllcyhhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApLCAwKTsgfSxcbiAgICBrZXk6IGZ1bmN0aW9uKGQpIHsga2V5cy5wdXNoKGQpOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0S2V5czogZnVuY3Rpb24ob3JkZXIpIHsgc29ydEtleXNba2V5cy5sZW5ndGggLSAxXSA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0VmFsdWVzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0VmFsdWVzID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHJvbGx1cDogZnVuY3Rpb24oZikgeyByb2xsdXAgPSBmOyByZXR1cm4gbmVzdDsgfVxuICB9O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0KCkge1xuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIHNldE9iamVjdChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICByZXR1cm4gbWFwKCk7XG59XG5cbmZ1bmN0aW9uIHNldE1hcChtYXAkJDEsIGtleSwgdmFsdWUpIHtcbiAgbWFwJCQxLnNldChrZXksIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gU2V0KCkge31cblxudmFyIHByb3RvID0gbWFwLnByb3RvdHlwZTtcblxuU2V0LnByb3RvdHlwZSA9IHNldC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZXQsXG4gIGhhczogcHJvdG8uaGFzLFxuICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFsdWUgKz0gXCJcIjtcbiAgICB0aGlzW3ByZWZpeCArIHZhbHVlXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IHByb3RvLnJlbW92ZSxcbiAgY2xlYXI6IHByb3RvLmNsZWFyLFxuICB2YWx1ZXM6IHByb3RvLmtleXMsXG4gIHNpemU6IHByb3RvLnNpemUsXG4gIGVtcHR5OiBwcm90by5lbXB0eSxcbiAgZWFjaDogcHJvdG8uZWFjaFxufTtcblxuZnVuY3Rpb24gc2V0KG9iamVjdCwgZikge1xuICB2YXIgc2V0ID0gbmV3IFNldDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgU2V0KSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSkgeyBzZXQuYWRkKHZhbHVlKTsgfSk7XG5cbiAgLy8gT3RoZXJ3aXNlLCBhc3N1bWUgaXTigJlzIGFuIGFycmF5LlxuICBlbHNlIGlmIChvYmplY3QpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gb2JqZWN0Lmxlbmd0aDtcbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIHNldC5hZGQoZihvYmplY3RbaV0sIGksIG9iamVjdCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldDtcbn1cblxudmFyIGtleXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufTtcblxudmFyIHZhbHVlcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgdmFsdWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIHZhbHVlcy5wdXNoKG1hcFtrZXldKTtcbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbnZhciBlbnRyaWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBlbnRyaWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGVudHJpZXMucHVzaCh7a2V5OiBrZXksIHZhbHVlOiBtYXBba2V5XX0pO1xuICByZXR1cm4gZW50cmllcztcbn07XG5cbmV4cG9ydHMubmVzdCA9IG5lc3Q7XG5leHBvcnRzLnNldCA9IHNldDtcbmV4cG9ydHMubWFwID0gbWFwO1xuZXhwb3J0cy5rZXlzID0ga2V5cztcbmV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuZXhwb3J0cy5lbnRyaWVzID0gZW50cmllcztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZGlzcGF0Y2gvIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIG5vb3AgPSB7dmFsdWU6IGZ1bmN0aW9uKCkge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0cy5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kc3YvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5mdW5jdGlvbiBkc3YoZGVsaW1pdGVyKSB7XG4gIHZhciByZUZvcm1hdCA9IG5ldyBSZWdFeHAoXCJbXFxcIlwiICsgZGVsaW1pdGVyICsgXCJcXG5dXCIpLFxuICAgICAgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHtcbiAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTtcbiAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTtcbiAgICB9KTtcbiAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSb3dzKHRleHQsIGYpIHtcbiAgICB2YXIgRU9MID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtbGluZVxuICAgICAgICBFT0YgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1maWxlXG4gICAgICAgIHJvd3MgPSBbXSwgLy8gb3V0cHV0IHJvd3NcbiAgICAgICAgTiA9IHRleHQubGVuZ3RoLFxuICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXhcbiAgICAgICAgbiA9IDAsIC8vIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgICAgIHQsIC8vIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgIGVvbDsgLy8gaXMgdGhlIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9MP1xuXG4gICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlXG4gICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgbGluZVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3Rlc1xuICAgICAgdmFyIGogPSBJLCBjO1xuICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHtcbiAgICAgICAgdmFyIGkgPSBqO1xuICAgICAgICB3aGlsZSAoaSsrIDwgTikge1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7XG4gICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrO1xuICAgICAgICAgICAgKytpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBJID0gaSArIDI7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICBpZiAoYyA9PT0gMTMpIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvXCJcIi9nLCBcIlxcXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbW1vbiBjYXNlOiBmaW5kIG5leHQgZGVsaW1pdGVyIG9yIG5ld2xpbmVcbiAgICAgIHdoaWxlIChJIDwgTikge1xuICAgICAgICB2YXIgayA9IDE7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDEwKSBlb2wgPSB0cnVlOyAvLyBcXG5cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxccnxcXHJcXG5cbiAgICAgICAgZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0ZcbiAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopO1xuICAgIH1cblxuICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICB3aGlsZSAodCAhPT0gRU9MICYmIHQgIT09IEVPRikge1xuICAgICAgICBhLnB1c2godCk7XG4gICAgICAgIHQgPSB0b2tlbigpO1xuICAgICAgfVxuICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgcm93cy5wdXNoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pO1xuICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH0pKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93cyhyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MubWFwKGZvcm1hdFJvdykuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvdyhyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkge1xuICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyBcIlwiXG4gICAgICAgIDogcmVGb3JtYXQudGVzdCh0ZXh0ICs9IFwiXCIpID8gXCJcXFwiXCIgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgXCJcXFwiXFxcIlwiKSArIFwiXFxcIlwiXG4gICAgICAgIDogdGV4dDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHBhcnNlUm93czogcGFyc2VSb3dzLFxuICAgIGZvcm1hdDogZm9ybWF0LFxuICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3NcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcIixcIik7XG5cbnZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTtcbnZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzO1xudmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7XG52YXIgY3N2Rm9ybWF0Um93cyA9IGNzdi5mb3JtYXRSb3dzO1xuXG52YXIgdHN2ID0gZHN2KFwiXFx0XCIpO1xuXG52YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7XG52YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93cztcbnZhciB0c3ZGb3JtYXQgPSB0c3YuZm9ybWF0O1xudmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93cztcblxuZXhwb3J0cy5kc3ZGb3JtYXQgPSBkc3Y7XG5leHBvcnRzLmNzdlBhcnNlID0gY3N2UGFyc2U7XG5leHBvcnRzLmNzdlBhcnNlUm93cyA9IGNzdlBhcnNlUm93cztcbmV4cG9ydHMuY3N2Rm9ybWF0ID0gY3N2Rm9ybWF0O1xuZXhwb3J0cy5jc3ZGb3JtYXRSb3dzID0gY3N2Rm9ybWF0Um93cztcbmV4cG9ydHMudHN2UGFyc2UgPSB0c3ZQYXJzZTtcbmV4cG9ydHMudHN2UGFyc2VSb3dzID0gdHN2UGFyc2VSb3dzO1xuZXhwb3J0cy50c3ZGb3JtYXQgPSB0c3ZGb3JtYXQ7XG5leHBvcnRzLnRzdkZvcm1hdFJvd3MgPSB0c3ZGb3JtYXRSb3dzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpOyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtcmVxdWVzdC8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzLCByZXF1aXJlKCdkMy1jb2xsZWN0aW9uJyksIHJlcXVpcmUoJ2QzLWRpc3BhdGNoJyksIHJlcXVpcmUoJ2QzLWRzdicpKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnLCAnZDMtY29sbGVjdGlvbicsICdkMy1kaXNwYXRjaCcsICdkMy1kc3YnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSxnbG9iYWwuZDMsZ2xvYmFsLmQzLGdsb2JhbC5kMykpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMsZDNDb2xsZWN0aW9uLGQzRGlzcGF0Y2gsZDNEc3YpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3QsXG4gICAgICBldmVudCA9IGQzRGlzcGF0Y2guZGlzcGF0Y2goXCJiZWZvcmVzZW5kXCIsIFwicHJvZ3Jlc3NcIiwgXCJsb2FkXCIsIFwiZXJyb3JcIiksXG4gICAgICBtaW1lVHlwZSxcbiAgICAgIGhlYWRlcnMgPSBkM0NvbGxlY3Rpb24ubWFwKCksXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QsXG4gICAgICB1c2VyID0gbnVsbCxcbiAgICAgIHBhc3N3b3JkID0gbnVsbCxcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgcmVzcG9uc2VUeXBlLFxuICAgICAgdGltZW91dCA9IDA7XG5cbiAgLy8gSWYgSUUgZG9lcyBub3Qgc3VwcG9ydCBDT1JTLCB1c2UgWERvbWFpblJlcXVlc3QuXG4gIGlmICh0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICYmICEoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpXG4gICAgICAmJiAvXihodHRwKHMpPzopP1xcL1xcLy8udGVzdCh1cmwpKSB4aHIgPSBuZXcgWERvbWFpblJlcXVlc3Q7XG5cbiAgXCJvbmxvYWRcIiBpbiB4aHJcbiAgICAgID8geGhyLm9ubG9hZCA9IHhoci5vbmVycm9yID0geGhyLm9udGltZW91dCA9IHJlc3BvbmRcbiAgICAgIDogeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKG8pIHsgeGhyLnJlYWR5U3RhdGUgPiAzICYmIHJlc3BvbmQobyk7IH07XG5cbiAgZnVuY3Rpb24gcmVzcG9uZChvKSB7XG4gICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMsIHJlc3VsdDtcbiAgICBpZiAoIXN0YXR1cyAmJiBoYXNSZXNwb25zZSh4aHIpXG4gICAgICAgIHx8IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwXG4gICAgICAgIHx8IHN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSByZXNwb25zZS5jYWxsKHJlcXVlc3QsIHhocik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB4aHI7XG4gICAgICB9XG4gICAgICBldmVudC5jYWxsKFwibG9hZFwiLCByZXF1ZXN0LCByZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgbyk7XG4gICAgfVxuICB9XG5cbiAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgZXZlbnQuY2FsbChcInByb2dyZXNzXCIsIHJlcXVlc3QsIGUpO1xuICB9O1xuXG4gIHJlcXVlc3QgPSB7XG4gICAgaGVhZGVyOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGhlYWRlcnMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIGhlYWRlcnMucmVtb3ZlKG5hbWUpO1xuICAgICAgZWxzZSBoZWFkZXJzLnNldChuYW1lLCB2YWx1ZSArIFwiXCIpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIElmIG1pbWVUeXBlIGlzIG5vbi1udWxsIGFuZCBubyBBY2NlcHQgaGVhZGVyIGlzIHNldCwgYSBkZWZhdWx0IGlzIHVzZWQuXG4gICAgbWltZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtaW1lVHlwZTtcbiAgICAgIG1pbWVUeXBlID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCI7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmaWVzIHdoYXQgdHlwZSB0aGUgcmVzcG9uc2UgdmFsdWUgc2hvdWxkIHRha2U7XG4gICAgLy8gZm9yIGluc3RhbmNlLCBhcnJheWJ1ZmZlciwgYmxvYiwgZG9jdW1lbnQsIG9yIHRleHQuXG4gICAgcmVzcG9uc2VUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmVzcG9uc2VUeXBlO1xuICAgICAgcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdGltZW91dDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpbWVvdXQ7XG4gICAgICB0aW1lb3V0ID0gK3ZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyB1c2VyIDogKHVzZXIgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIHBhc3N3b3JkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gcGFzc3dvcmQgOiAocGFzc3dvcmQgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZnkgaG93IHRvIGNvbnZlcnQgdGhlIHJlc3BvbnNlIGNvbnRlbnQgdG8gYSBzcGVjaWZpYyB0eXBlO1xuICAgIC8vIGNoYW5nZXMgdGhlIGNhbGxiYWNrIHZhbHVlIG9uIFwibG9hZFwiIGV2ZW50cy5cbiAgICByZXNwb25zZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJHRVRcIiwg4oCmKS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiR0VUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJQT1NUXCIsIOKApikuXG4gICAgcG9zdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJQT1NUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgY2FsbGJhY2sgaXMgbm9uLW51bGwsIGl0IHdpbGwgYmUgdXNlZCBmb3IgZXJyb3IgYW5kIGxvYWQgZXZlbnRzLlxuICAgIHNlbmQ6IGZ1bmN0aW9uKG1ldGhvZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlLCB1c2VyLCBwYXNzd29yZCk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoXCJhY2NlcHRcIikpIGhlYWRlcnMuc2V0KFwiYWNjZXB0XCIsIG1pbWVUeXBlICsgXCIsKi8qXCIpO1xuICAgICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSBoZWFkZXJzLmVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpOyB9KTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKSB4aHIub3ZlcnJpZGVNaW1lVHlwZShtaW1lVHlwZSk7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlICE9IG51bGwpIHhoci5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG4gICAgICBpZiAodGltZW91dCA+IDApIHhoci50aW1lb3V0ID0gdGltZW91dDtcbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiBjYWxsYmFjay5sZW5ndGggPT09IDEpIGNhbGxiYWNrID0gZml4Q2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHJlcXVlc3Qub24oXCJlcnJvclwiLCBjYWxsYmFjaykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKHhocikgeyBjYWxsYmFjayhudWxsLCB4aHIpOyB9KTtcbiAgICAgIGV2ZW50LmNhbGwoXCJiZWZvcmVzZW5kXCIsIHJlcXVlc3QsIHhocik7XG4gICAgICB4aHIuc2VuZChkYXRhID09IG51bGwgPyBudWxsIDogZGF0YSk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgYWJvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgeGhyLmFib3J0KCk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgb246IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlID0gZXZlbnQub24uYXBwbHkoZXZlbnQsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IGV2ZW50ID8gcmVxdWVzdCA6IHZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHJlcXVlc3QuZ2V0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZnVuY3Rpb24gZml4Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yLCB4aHIpIHtcbiAgICBjYWxsYmFjayhlcnJvciA9PSBudWxsID8geGhyIDogbnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhc1Jlc3BvbnNlKHhocikge1xuICB2YXIgdHlwZSA9IHhoci5yZXNwb25zZVR5cGU7XG4gIHJldHVybiB0eXBlICYmIHR5cGUgIT09IFwidGV4dFwiXG4gICAgICA/IHhoci5yZXNwb25zZSAvLyBudWxsIG9uIGVycm9yXG4gICAgICA6IHhoci5yZXNwb25zZVRleHQ7IC8vIFwiXCIgb24gZXJyb3Jcbn1cblxudmFyIHR5cGUgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHJlc3BvbnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKS5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgICByZXR1cm4gci5nZXQoY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfTtcbn07XG5cbnZhciBodG1sID0gdHlwZShcInRleHQvaHRtbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciBqc29uID0gdHlwZShcImFwcGxpY2F0aW9uL2pzb25cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciB0ZXh0ID0gdHlwZShcInRleHQvcGxhaW5cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiB4aHIucmVzcG9uc2VUZXh0O1xufSk7XG5cbnZhciB4bWwgPSB0eXBlKFwiYXBwbGljYXRpb24veG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICB2YXIgeG1sID0geGhyLnJlc3BvbnNlWE1MO1xuICBpZiAoIXhtbCkgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgZXJyb3JcIik7XG4gIHJldHVybiB4bWw7XG59KTtcblxudmFyIGRzdiA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcGFyc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgcm93LCBjYWxsYmFjaykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgY2FsbGJhY2sgPSByb3csIHJvdyA9IG51bGw7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKTtcbiAgICByLnJvdyA9IGZ1bmN0aW9uKF8pIHsgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyByLnJlc3BvbnNlKHJlc3BvbnNlT2YocGFyc2UsIHJvdyA9IF8pKSA6IHJvdzsgfTtcbiAgICByLnJvdyhyb3cpO1xuICAgIHJldHVybiBjYWxsYmFjayA/IHIuZ2V0KGNhbGxiYWNrKSA6IHI7XG4gIH07XG59O1xuXG5mdW5jdGlvbiByZXNwb25zZU9mKHBhcnNlLCByb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QkJDEpIHtcbiAgICByZXR1cm4gcGFyc2UocmVxdWVzdCQkMS5yZXNwb25zZVRleHQsIHJvdyk7XG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCJ0ZXh0L2NzdlwiLCBkM0Rzdi5jc3ZQYXJzZSk7XG5cbnZhciB0c3YgPSBkc3YoXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsIGQzRHN2LnRzdlBhcnNlKTtcblxuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbmV4cG9ydHMuaHRtbCA9IGh0bWw7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy50ZXh0ID0gdGV4dDtcbmV4cG9ydHMueG1sID0geG1sO1xuZXhwb3J0cy5jc3YgPSBjc3Y7XG5leHBvcnRzLnRzdiA9IHRzdjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIiFmdW5jdGlvbihlLG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4ocmVxdWlyZShcImQzLXJlcXVlc3RcIikpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZDMtcmVxdWVzdFwiXSxuKTooZS5kMz1lLmQzfHx7fSxlLmQzLnByb21pc2U9bihlLmQzKSl9KHRoaXMsZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlLG4pe3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgdD1hcmd1bWVudHMubGVuZ3RoLHI9QXJyYXkodCksbz0wO3Q+bztvKyspcltvXT1hcmd1bWVudHNbb107cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHQsbyl7dmFyIHU9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gZT92b2lkIG8oRXJyb3IoZSkpOnZvaWQgdChuKX07bi5hcHBseShlLHIuY29uY2F0KHUpKX0pfX12YXIgdD17fTtyZXR1cm5bXCJjc3ZcIixcInRzdlwiLFwianNvblwiLFwieG1sXCIsXCJ0ZXh0XCIsXCJodG1sXCJdLmZvckVhY2goZnVuY3Rpb24ocil7dFtyXT1uKGUsZVtyXSl9KSx0fSk7IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG52YXIgZDMgPSByZXF1aXJlKCdkMy5wcm9taXNlJyk7XG5cbmZ1bmN0aW9uIGRlZihhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xufVxuLypcbk1hbmFnZXMgZmV0Y2hpbmcgYSBkYXRhc2V0IGZyb20gU29jcmF0YSBhbmQgcHJlcGFyaW5nIGl0IGZvciB2aXN1YWxpc2F0aW9uIGJ5XG5jb3VudGluZyBmaWVsZCB2YWx1ZSBmcmVxdWVuY2llcyBldGMuIFxuKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VEYXRhIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhSWQsIGFjdGl2ZUNlbnN1c1llYXIpIHtcbiAgICAgICAgdGhpcy5kYXRhSWQgPSBkYXRhSWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciA9IGRlZihhY3RpdmVDZW5zdXNZZWFyLCAyMDE1KTtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gdW5kZWZpbmVkOyAgLy8gbmFtZSBvZiBjb2x1bW4gd2hpY2ggaG9sZHMgbGF0L2xvbiBvciBibG9jayBJRFxuICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHVuZGVmaW5lZDsgLy8gaWYgdGhlIGRhdGFzZXQgdHlwZSBpcyAncG9pbnQnICh1c2VkIGZvciBwYXJzaW5nIGxvY2F0aW9uIGZpZWxkKVxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gW107ICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgbnVtZXJpYyBkYXRhdmlzXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBbXTsgICAgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBlbnVtIGRhdGF2aXNcbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gW107ICAgICAgICAgIC8vIG5hbWVzIG9mIG90aGVyIGNvbHVtbnNcbiAgICAgICAgdGhpcy5taW5zID0ge307ICAgICAgICAgICAgICAgICAgIC8vIG1pbiBhbmQgbWF4IG9mIGVhY2ggbnVtZXJpYyBjb2x1bW5cbiAgICAgICAgdGhpcy5tYXhzID0ge307XG4gICAgICAgIHRoaXMuZnJlcXVlbmNpZXMgPSB7fTsgICAgICAgICAgICAvLyBcbiAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llcyA9IHt9OyAgICAgIC8vIG1vc3QgZnJlcXVlbnQgdmFsdWVzIGluIGVhY2ggdGV4dCBjb2x1bW5cbiAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2ludCc7ICAgICAgICAgICAgIC8vIHBvaW50IG9yIHBvbHlnb24gKENMVUUgYmxvY2spXG4gICAgICAgIHRoaXMucm93cyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBwcm9jZXNzZWQgcm93c1xuICAgICAgICB0aGlzLmJsb2NrSW5kZXggPSB7fTsgICAgICAgICAgICAgLy8gY2FjaGUgb2YgQ0xVRSBibG9jayBJRHNcbiAgICB9XG5cblxuICAgIGNob29zZUNvbHVtblR5cGVzIChjb2x1bW5zKSB7XG4gICAgICAgIC8vdmFyIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JyB8fCBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIC8vIFwibG9jYXRpb25cIiBhbmQgXCJwb2ludFwiIGFyZSBib3RoIHBvaW50IGRhdGEgdHlwZXMsIGV4cHJlc3NlZCBkaWZmZXJlbnRseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhIFwiYmxvY2sgSURcIiBjYW4gYmUgam9pbmVkIGFnYWluc3QgdGhlIENMVUUgQmxvY2sgcG9seWdvbnMgd2hpY2ggYXJlIGluIE1hcGJveC5cbiAgICAgICAgbGV0IGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylbMF07XG4gICAgICAgIGlmICghbGMpIHtcbiAgICAgICAgICAgIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGxjLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdHJ1ZTtcblxuICAgICAgICBpZiAobGMubmFtZSA9PT0gJ0Jsb2NrIElEJykge1xuICAgICAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2x5Z29uJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSBsYy5uYW1lO1xuXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sICE9PSBsYyk7XG5cbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdudW1iZXInICYmIGNvbC5uYW1lICE9PSAnTGF0aXR1ZGUnICYmIGNvbC5uYW1lICE9PSAnTG9uZ2l0dWRlJylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB7IHRoaXMubWluc1tjb2xdID0gMWU5OyB0aGlzLm1heHNbY29sXSA9IC0xZTk7IH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICd0ZXh0JylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcblxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdID0ge30pO1xuXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKVxuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gdGhpcy5udW1lcmljQ29sdW1ucy5pbmRleE9mKGNvbCkgPCAwICYmIHRoaXMudGV4dENvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyBiZXR0ZXIgbmFtZSBhbmQgYmVoYXZpb3VyXG4gICAgZmlsdGVyKHJvdykge1xuICAgICAgICAvLyBUT0RPIG1vdmUgdGhpcyBzb21ld2hlcmUgYmV0dGVyXG4gICAgICAgIGlmIChyb3dbJ0NMVUUgc21hbGwgYXJlYSddICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gPT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChyb3dbJ0NlbnN1cyB5ZWFyJ10gJiYgcm93WydDZW5zdXMgeWVhciddICE9PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICAvLyBjb252ZXJ0IG51bWVyaWMgY29sdW1ucyB0byBudW1iZXJzIGZvciBkYXRhIHZpc1xuICAgIGNvbnZlcnRSb3cocm93KSB7XG5cbiAgICAgICAgLy8gY29udmVydCBsb2NhdGlvbiB0eXBlcyAoc3RyaW5nKSB0byBbbG9uLCBsYXRdIGFycmF5LlxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvblRvQ29vcmRzKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvY2F0aW9uKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAvLyBcIm5ldyBiYWNrZW5kXCIgZGF0YXNldHMgdXNlIGEgV0tUIGZpZWxkIFtQT0lOVCAobG9uIGxhdCldIGluc3RlYWQgb2YgKGxhdCwgbG9uKVxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25Jc1BvaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJlcGxhY2UoJ1BPSU5UICgnLCAnJykucmVwbGFjZSgnKScsICcnKS5zcGxpdCgnICcpLm1hcChuID0+IE51bWJlcihuKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGxvY2F0aW9uLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMV0ucmVwbGFjZSgnKScsICcnKSksIE51bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVswXS5yZXBsYWNlKCcoJywgJycpKV07XG4gICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gdXNlIGNvbHVtbi5jYWNoZWRDb250ZW50cy5zbWFsbGVzdCBhbmQgLmxhcmdlc3RcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICByb3dbY29sXSA9IE51bWJlcihyb3dbY29sXSkgOyAvLyArcm93W2NvbF0gYXBwYXJlbnRseSBmYXN0ZXIsIGJ1dCBicmVha3Mgb24gc2ltcGxlIHRoaW5ncyBsaWtlIGJsYW5rIHZhbHVlc1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoZSB0b3RhbCB2YWx1ZXMgaW4gXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPCB0aGlzLm1pbnNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWluc1tjb2xdID0gcm93W2NvbF07XG5cbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA+IHRoaXMubWF4c1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhzW2NvbF0gPSByb3dbY29sXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHJvd1tjb2xdO1xuICAgICAgICAgICAgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gPSAodGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0gPSBsb2NhdGlvblRvQ29vcmRzLmNhbGwodGhpcywgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKTtcblxuXG5cbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBjb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKSB7XG4gICAgICAgIHZhciBuZXdUZXh0Q29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXSA9IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSlcbiAgICAgICAgICAgICAgICAuc29ydCgodmFsYSwgdmFsYikgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGFdIDwgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGJdID8gMSA6IC0xKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLDEyKTtcblxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoIDwgMiB8fCBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA+IDIwICYmIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF1bMV1dIDw9IDUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCdzIGJvcmluZyBpZiBhbGwgdmFsdWVzIHRoZSBzYW1lLCBvciBpZiB0b28gbWFueSBkaWZmZXJlbnQgdmFsdWVzIChhcyBqdWRnZWQgYnkgc2Vjb25kLW1vc3QgY29tbW9uIHZhbHVlIGJlaW5nIDUgdGltZXMgb3IgZmV3ZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VGV4dENvbHVtbnMucHVzaChjb2wpOyAvLyBob3cgZG8geW91IHNhZmVseSBkZWxldGUgZnJvbSBhcnJheSB5b3UncmUgbG9vcGluZyBvdmVyP1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBuZXdUZXh0Q29sdW1ucztcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzKTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSByb3dzIGZyb20gU29jcmF0YSAocmV0dXJucyBQcm9taXNlKS4gXCJOZXcgYmFja2VuZFwiIHZpZXdzIGdvIHRocm91Z2ggYW4gYWRkaXRpb25hbCBzdGVwIHRvIGZpbmQgdGhlIHJlYWxcbiAgICAvLyBBUEkgZW5kcG9pbnQuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy5qc29uJylcbiAgICAgICAgLnRoZW4ocHJvcHMgPT4ge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5uZXdCYWNrZW5kICYmIHByb3BzLmNoaWxkVmlld3MubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhSWQgPSBwcm9wcy5jaGlsZFZpZXdzWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihwcm9wcyA9PiB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBkMy5jc3YoJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy9yb3dzLmNzdj9hY2Nlc3NUeXBlPURPV05MT0FEJywgdGhpcy5jb252ZXJ0Um93LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2x5Z29uJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlQmxvY2tJbmRleCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gQ3JlYXRlIGEgaGFzaCB0YWJsZSBsb29rdXAgZnJvbSBbeWVhciwgYmxvY2sgSURdIHRvIGRhdGFzZXQgcm93XG4gICAgY29tcHV0ZUJsb2NrSW5kZXgoKSB7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV1bcm93WydCbG9jayBJRCddXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSb3dGb3JCbG9jayhibG9ja0lkIC8qIGNlbnN1c195ZWFyICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbdGhpcy5ibG9ja0luZGV4W3RoaXMuYWN0aXZlQ2Vuc3VzWWVhcl1bYmxvY2tJZF1dO1xuICAgIH1cblxuICAgIGZpbHRlcmVkUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIocm93ID0+IHJvd1snQ2Vuc3VzIHllYXInXSA9PT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gIT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpO1xuICAgIH1cbn0iXX0=

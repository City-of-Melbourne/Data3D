(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var _legend = require('./legend');

var legend = _interopRequireWildcard(_legend);

var _sourceData = require('./sourceData');

var _flightPath = require('./flightPath');

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } } /* jshint esnext:true */
//var mapboxgl = require('mapbox-gl');


mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';

/*
Pedestrian sensor locations: ygaw-6rzq
Trees: http://localhost:3002/#fp38-wiyy
Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

function whenMapLoaded(map, f) {
    if (map.loaded()) f();else map.once('load', f);
}
var def = function def(a, b) {
    return a !== undefined ? a : b;
};

function setCircleRadiusStyle(dataColumn) {
    map.setPaintProperty('points', 'circle-radius', {
        property: dataColumn,
        stops: [[{ zoom: 10, value: sourceData.mins[dataColumn] }, 1], [{ zoom: 10, value: sourceData.maxs[dataColumn] }, 3], [{ zoom: 17, value: sourceData.mins[dataColumn] }, 3], [{ zoom: 17, value: sourceData.maxs[dataColumn] }, 10]]
    });

    legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn] /*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
}

function removeCircleRadius(e) {
    console.log(pointLayer().paint['circle-radius']);
    map.setPaintProperty('points', 'circle-radius', pointLayer().paint['circle-radius']);
    document.querySelector('#legend-numeric').innerHTML = '';
}

function setCircleColorStyle(dataColumn) {
    var enumStops = sourceData.sortedFrequencies[dataColumn].map(function (val, i) {
        return [val, enumColors[i]];
    });
    map.setPaintProperty('points', 'circle-color', {
        property: dataColumn,
        type: 'categorical',
        stops: enumStops
    });
    legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, removeCircleColor);
}

function removeCircleColor(e) {
    map.setPaintProperty('points', 'circle-color', pointLayer().paint['circle-color']);
    document.querySelector('#legend-enum').innerHTML = '';
}

function setPolygonHeightStyle(dataColumn) {
    map.setPaintProperty('polygons', 'fill-extrusion-height', {
        // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
        property: 'block_id', //locationColumn, // the ID on the actual geometry dataset
        type: 'categorical',
        stops: sourceData.filteredRows().map(function (row) {
            return [row[sourceData.locationColumn], row[dataColumn] / sourceData.maxs[dataColumn] * 1000];
        })
    });
    map.setPaintProperty('polygons', 'fill-extrusion-color', {
        property: 'block_id',
        type: 'categorical',
        stops: sourceData.filteredRows().map(function (row) {
            return [row[sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / sourceData.maxs[dataColumn] * 200) + ')'];
        })
    });
    map.setFilter('polygons', ['!in', 'block_id'].concat(_toConsumableArray( /* ### TODO generalise */
    sourceData.filteredRows().filter(function (row) {
        return row[dataColumn] === 0;
    }).map(function (row) {
        return row[sourceData.locationColumn];
    }))));

    legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn] /*, removeCircleRadius*/);
}

var dataColumn = void 0;

// switch visualisation to using this column
function setVisColumn(columnName) {
    dataColumn = columnName;
    console.log('Data column: ' + dataColumn);

    if (sourceData.numericColumns.indexOf(dataColumn) >= 0) {
        if (sourceData.shape === 'point') {
            setCircleRadiusStyle(dataColumn);
        } else {
            // polygon
            setPolygonHeightStyle(dataColumn);
            // TODO add close button behaviour. maybe?
        }
    } else if (sourceData.textColumns.indexOf(dataColumn) >= 0) {
        // TODO handle enum fields on polygons (no example currently)
        setCircleColorStyle(dataColumn);
    }
}
// from ColorBrewer
var enumColors = ['#1f78b4', '#fb9a99', '#b2df8a', '#33a02c', '#e31a1c', '#fdbf6f', '#a6cee3', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

// convert a table of rows to GeoJSON
function rowsToPointDatasource(rows) {
    var datasource = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    rows.forEach(function (row) {
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
}

function pointLayer(filter, highlight) {
    var ret = {
        id: 'points' + (highlight ? '-highlight' : ''),
        type: 'circle',
        source: 'dataset',
        paint: {
            //            'circle-color': highlight ? 'hsl(20, 95%, 50%)' : 'hsl(220,80%,50%)',
            'circle-color': highlight ? 'rgba(0,0,0,0)' : 'hsl(220,80%,50%)',
            'circle-opacity': 0.95,
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

// Convert a table of rows to a Mapbox datasource
function addPointsToMap(rows, map) {
    map.addSource('dataset', rowsToPointDatasource(rows));
    map.addLayer(pointLayer());
    map.addLayer(pointLayer(['==', sourceData.locationColumn, '-'], true)); // highlight layer
}

function polygonLayer(highlight) {
    var ret = {
        id: 'polygons',
        type: 'fill-extrusion',
        source: 'dataset',
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-extrusion-opacity': 0.8,
            'fill-extrusion-height': 0,
            'fill-extrusion-color': '#003'
        }
    };
    return ret;
}
function polygonHighlightLayer() {
    return {
        id: 'polygons-highlight',
        type: 'fill',
        source: 'dataset',
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-color': 'white'
        },
        filter: ['==', 'block_id', '-']
    };
}

function addPolygonsToMap(rows, map) {
    // we don't need to construct a "polygon datasource", the geometry exists in Mapbox already
    // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4

    // add CLUE blocks polygon dataset, ripe for choroplething
    map.addSource('dataset', {
        type: 'vector',
        url: 'mapbox://opencouncildata.aedfmyp8'
    });
    map.addLayer(polygonHighlightLayer());
    map.addLayer(polygonLayer());
}
//false && whenMapLoaded(() =>
//  setVisColumn(sourceData.numericColumns[Math.floor(Math.random() * sourceData.numericColumns.length)]));


function showFeatureTable(feature) {
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
            console.log(e);
            setVisColumn(e.target.innerText); // TODO highlight the selected row
        });
    });
}

var lastFeature;
function mousemove(e) {
    var feature = map.queryRenderedFeatures(e.point, { layers: [sourceData.shape + 's'] })[0]; /* yes, that's gross */
    if (feature && feature !== lastFeature) {
        map.getCanvas().style.cursor = 'pointer';

        lastFeature = feature;
        showFeatureTable(feature.properties);

        if (sourceData.shape === 'point') {
            map.setFilter('points-highlight', ['==', sourceData.locationColumn, feature.properties[sourceData.locationColumn]]); // we don't have any other reliable key?
        } else {
            // ### TODO add polygon highlights 
            map.setFilter('polygons-highlight', ['==', 'block_id', feature.properties.block_id]); // don't have a general way to match other kinds of polygons
            console.log(feature.properties);
        }
    } else {
        map.getCanvas().style.cursor = '';
    }
}

//function keyToId(key) {
//    return key.replace(/[^A-Za-z0-9_-]/g, '_');
//}

function chooseDataset() {
    if (window.location.hash) {
        return window.location.hash.replace('#', '');
    }

    // known point datasets that work ok
    var clueChoices = ['b36j-kiy4', // employment
    '234q-gg83', // floor space by use by block
    'c3gt-hrz6' // business establishments -- this one is complete, the others have gappy data for confidentiality
    ];

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
    'fthy-zajy', // properties over $2.5m
    'tx8h-2jgi', // accessible toilets
    '6u5z-ubvh'];

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';

    return 'c3gt-hrz6';
    //return 'gh7s-qda8';
    //return clueChoices[Math.floor(Math.random() * clueChoices.length)];
}

function showCaption(name, dataId) {
    document.querySelector('#caption h1').innerHTML = name;
    document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    document.querySelector('#share').innerHTML = 'Share this: <a href="https://city-of-melbourne.github.io/Data3D/#' + dataId + '">https://city-of-melbourne.github.io/Data3D/#' + dataId + '</a>';

    // ### Hide it for now
    document.querySelector('#caption').style.display = 'none';
}

var map = void 0,
    sourceData = void 0;

(function start() {

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [144.95, -37.813],
        zoom: 13,
        pitch: 45 // TODO revert for flat
    });

    var dataId = chooseDataset();
    sourceData = new _sourceData.SourceData(dataId);

    sourceData.load().then(function (rows) {
        showCaption(sourceData.name, dataId);

        whenMapLoaded(map, function () {
            if (sourceData.shape === 'point') {
                addPointsToMap(rows, map);
            } else {
                addPolygonsToMap(rows, map);
            }
            showFeatureTable();
            document.querySelectorAll('#loading')[0].outerHTML = '';

            map.on('mousemove', mousemove);
        });
        //var fp = new FlightPath(map);
    });
})();

},{"./flightPath":2,"./legend":3,"./sourceData":10}],2:[function(require,module,exports){
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

},{"./melbourneRoute":4}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
},{}],8:[function(require,module,exports){
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

},{"d3-collection":5,"d3-dispatch":6,"d3-dsv":7}],9:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],n):(e.d3=e.d3||{},e.d3.promise=n(e.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var u=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(u))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t});
},{"d3-request":8}],10:[function(require,module,exports){
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
        this.sourceRows = undefined; // processed rows
        this.blockIndex = {}; // cache of CLUE block IDs
    }

    _createClass(SourceData, [{
        key: 'chooseColumnTypes',
        value: function chooseColumnTypes(columns) {
            var _this = this;

            var lc = columns.filter(function (col) {
                return col.dataTypeName === 'location' || col.dataTypeName === 'point' || col.name === 'Block ID';
            })[0];
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
                    console.log(location.length);
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
                    console.log('Boring! ');
                    console.log(_this3.frequencies[col]);
                } else {
                    newTextColumns.push(col); // how do you safely delete from array you're looping over?
                }
            });
            this.textColumns = newTextColumns;
            console.log(this.sortedFrequencies);
        }

        // return promise for rows

    }, {
        key: 'load',
        value: function load() {
            var _this4 = this;

            return d3.json('https://data.melbourne.vic.gov.au/api/views/' + this.dataId + '.json').then(function (props) {
                _this4.name = props.name;
                if (props.newBackend && props.childViews.length > 0) {

                    _this4.dataId = props.childViews[0];

                    return d3.json('https://data.melbourne.vic.gov.au/api/views/' + dataId).then(function (props) {
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
                    return rows;
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

},{"d3.promise":9}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL0FwcC5qcyIsInNyYy9qcy9mbGlnaHRQYXRoLmpzIiwic3JjL2pzL2xlZ2VuZC5qcyIsInNyYy9qcy9tZWxib3VybmVSb3V0ZS5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtY29sbGVjdGlvbi9idWlsZC9kMy1jb2xsZWN0aW9uLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kaXNwYXRjaC9idWlsZC9kMy1kaXNwYXRjaC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZHN2L2J1aWxkL2QzLWRzdi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtcmVxdWVzdC9idWlsZC9kMy1yZXF1ZXN0LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy5wcm9taXNlL2Rpc3QvZDMucHJvbWlzZS5taW4uanMiLCJzcmMvanMvc291cmNlRGF0YS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7O0FDRUE7O0lBQVksTTs7QUFDWjs7QUFDQTs7OztvTUFKQTtBQUNBOzs7QUFJQSxTQUFTLFdBQVQsR0FBdUIsMkZBQXZCOztBQUVBOzs7Ozs7OztBQVFBLFNBQVMsYUFBVCxDQUF1QixHQUF2QixFQUE0QixDQUE1QixFQUErQjtBQUMzQixRQUFJLElBQUksTUFBSixFQUFKLEVBQ0ksSUFESixLQUdJLElBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsQ0FBakI7QUFDUDtBQUNELElBQUksTUFBTSxTQUFOLEdBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSjtBQUFBLFdBQVUsTUFBTSxTQUFOLEdBQWtCLENBQWxCLEdBQXNCLENBQWhDO0FBQUEsQ0FBVjs7QUFFQSxTQUFTLG9CQUFULENBQThCLFVBQTlCLEVBQTBDO0FBQ3ZDLFFBQUksZ0JBQUosQ0FBcUIsUUFBckIsRUFBK0IsZUFBL0IsRUFB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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QixDQUFQO0FBQ0g7QUFDSixhQWJNLEVBYUosSUFiSSxDQWFDLFlBQU07QUFDVix1QkFBTyxHQUFHLEdBQUgsQ0FBTyxpREFBaUQsT0FBSyxNQUF0RCxHQUErRCwrQkFBdEUsRUFBdUcsT0FBSyxVQUFMLENBQWdCLElBQWhCLFFBQXZHLEVBQ04sSUFETSxDQUNELGdCQUFRO0FBQ1YsMkJBQUssSUFBTCxHQUFZLElBQVo7QUFDQSwyQkFBSyx3QkFBTDtBQUNBLHdCQUFJLE9BQUssS0FBTCxLQUFlLFNBQW5CLEVBQ0ksT0FBSyxpQkFBTDtBQUNKLDJCQUFPLElBQVA7QUFDSCxpQkFQTSxDQUFQO0FBUUgsYUF0Qk0sQ0FBUDtBQXVCSDs7QUFHRDs7Ozs0Q0FDb0I7QUFBQTs7QUFDaEIsaUJBQUssSUFBTCxDQUFVLE9BQVYsQ0FBa0IsVUFBQyxHQUFELEVBQU0sS0FBTixFQUFnQjtBQUM5QixvQkFBSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLE1BQXdDLFNBQTVDLEVBQ0ksT0FBSyxVQUFMLENBQWdCLElBQUksYUFBSixDQUFoQixJQUFzQyxFQUF0QztBQUNKLHVCQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLEVBQW9DLElBQUksVUFBSixDQUFwQyxJQUF1RCxLQUF2RDtBQUNILGFBSkQ7QUFLSDs7O3VDQUVjLE8sQ0FBUSxpQixFQUFtQjtBQUN0QyxtQkFBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxnQkFBckIsRUFBdUMsT0FBdkMsQ0FBVixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUFBOztBQUNYLG1CQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSx1QkFBTyxJQUFJLGFBQUosTUFBdUIsT0FBSyxnQkFBNUIsSUFBZ0QsSUFBSSxpQkFBSixNQUEyQix5QkFBbEY7QUFBQSxhQUFqQixDQUFQO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG4vL3ZhciBtYXBib3hnbCA9IHJlcXVpcmUoJ21hcGJveC1nbCcpO1xuaW1wb3J0ICogYXMgbGVnZW5kIGZyb20gJy4vbGVnZW5kJztcbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuaW1wb3J0IHsgRmxpZ2h0UGF0aCB9IGZyb20gJy4vZmxpZ2h0UGF0aCc7XG5tYXBib3hnbC5hY2Nlc3NUb2tlbiA9ICdway5leUoxSWpvaWMzUmxkbUZuWlNJc0ltRWlPaUpqYVhoeGNHczBiemN3WW5NM01uWnNPV0ppYWpWd2FISjJJbjAuUk43S3l3TU94TExObWNURmZuMGNpZyc7XG5cbi8qXG5QZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnM6IHlnYXctNnJ6cVxuVHJlZXM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZnAzOC13aXl5XG5FdmVudCBib29raW5nczogaHR0cDovL2xvY2FsaG9zdDozMDAyLyM4NGJmLWRpaGlcbkJpa2Ugc2hhcmUgc3RhdGlvbnM6IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jdGR2aC1uOWR2XG5EQU06IGh0dHA6Ly9sb2NhbGhvc3Q6MzAwMi8jZ2g3cy1xZGE4XG4qL1xuXG5mdW5jdGlvbiB3aGVuTWFwTG9hZGVkKG1hcCwgZikge1xuICAgIGlmIChtYXAubG9hZGVkKCkpXG4gICAgICAgIGYoKTtcbiAgICBlbHNlXG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG59XG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5mdW5jdGlvbiBzZXRDaXJjbGVSYWRpdXNTdHlsZShkYXRhQ29sdW1uKSB7XG4gICBtYXAuc2V0UGFpbnRQcm9wZXJ0eSgncG9pbnRzJywgJ2NpcmNsZS1yYWRpdXMnLCB7XG4gICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCAxXSxcbiAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgM10sXG4gICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIDNdLFxuICAgICAgICAgICAgW3sgem9vbTogMTcsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCAxMF1cbiAgICAgICAgXVxuICAgIH0pO1xuXG4gICAgbGVnZW5kLnNob3dSYWRpdXNMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgLy8gQ2FuJ3Qgc2FmZWx5IGNsb3NlIG51bWVyaWMgY29sdW1ucyB5ZXQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8zOTQ5XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNpcmNsZVJhZGl1cyhlKSB7XG4gICAgY29uc29sZS5sb2cocG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgIG1hcC5zZXRQYWludFByb3BlcnR5KCdwb2ludHMnLCdjaXJjbGUtcmFkaXVzJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtbnVtZXJpYycpLmlubmVySFRNTCA9ICcnO1xufVxuXG5mdW5jdGlvbiBzZXRDaXJjbGVDb2xvclN0eWxlKGRhdGFDb2x1bW4pIHtcbiAgICBsZXQgZW51bVN0b3BzID0gc291cmNlRGF0YS5zb3J0ZWRGcmVxdWVuY2llc1tkYXRhQ29sdW1uXS5tYXAoKHZhbCxpKSA9PiBbdmFsLCBlbnVtQ29sb3JzW2ldXSk7XG4gICAgbWFwLnNldFBhaW50UHJvcGVydHkoJ3BvaW50cycsICdjaXJjbGUtY29sb3InLCB7XG4gICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICBzdG9wczogZW51bVN0b3BzXG4gICAgfSk7XG4gICAgbGVnZW5kLnNob3dDYXRlZ29yeUxlZ2VuZCgnI2xlZ2VuZC1lbnVtJywgZGF0YUNvbHVtbiwgZW51bVN0b3BzLCByZW1vdmVDaXJjbGVDb2xvcik7XG59XG5cbmZ1bmN0aW9uIHJlbW92ZUNpcmNsZUNvbG9yKGUpIHtcbiAgICBtYXAuc2V0UGFpbnRQcm9wZXJ0eSgncG9pbnRzJywnY2lyY2xlLWNvbG9yJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtY29sb3InXSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1lbnVtJykuaW5uZXJIVE1MID0gJyc7XG59XG5cbmZ1bmN0aW9uIHNldFBvbHlnb25IZWlnaHRTdHlsZShkYXRhQ29sdW1uKSB7XG4gICAgbWFwLnNldFBhaW50UHJvcGVydHkoJ3BvbHlnb25zJywgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCcsICB7XG4gICAgICAgIC8vIHJlbWVtYmVyLCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0IGluIHRoZSBwb2x5Z29uIHNldCwgaXQncyBqdXN0IGEgaHVnZSB2YWx1ZSBsb29rdXBcbiAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsLy9sb2NhdGlvbkNvbHVtbiwgLy8gdGhlIElEIG9uIHRoZSBhY3R1YWwgZ2VvbWV0cnkgZGF0YXNldFxuICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICBzdG9wczogc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKSAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sIHJvd1tkYXRhQ29sdW1uXSAvIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDEwMDBdKVxuICAgIH0pO1xuICAgIG1hcC5zZXRQYWludFByb3BlcnR5KCdwb2x5Z29ucycsICdmaWxsLWV4dHJ1c2lvbi1jb2xvcicsIHtcbiAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsXG4gICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgIHN0b3BzOiBzb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAncmdiKDAsMCwnICsgTWF0aC5yb3VuZCg0MCArIHJvd1tkYXRhQ29sdW1uXSAvIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgIH0pO1xuICAgIG1hcC5zZXRGaWx0ZXIoJ3BvbHlnb25zJywgWychaW4nLCAnYmxvY2tfaWQnLCAuLi4oLyogIyMjIFRPRE8gZ2VuZXJhbGlzZSAqLyBcbiAgICAgICAgc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3dbZGF0YUNvbHVtbl0gPT09IDApXG4gICAgICAgIC5tYXAocm93ID0+IHJvd1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkpXSk7XG5cbiAgICBsZWdlbmQuc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyBcbn1cblxubGV0IGRhdGFDb2x1bW47XG5cbi8vIHN3aXRjaCB2aXN1YWxpc2F0aW9uIHRvIHVzaW5nIHRoaXMgY29sdW1uXG5mdW5jdGlvbiBzZXRWaXNDb2x1bW4oY29sdW1uTmFtZSkge1xuICAgIGRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgIGNvbnNvbGUubG9nKCdEYXRhIGNvbHVtbjogJyArIGRhdGFDb2x1bW4pO1xuXG4gICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZihkYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICBzZXRDaXJjbGVSYWRpdXNTdHlsZShkYXRhQ29sdW1uKTtcbiAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgc2V0UG9seWdvbkhlaWdodFN0eWxlKGRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgLy8gVE9ETyBhZGQgY2xvc2UgYnV0dG9uIGJlaGF2aW91ci4gbWF5YmU/XG4gICAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZihkYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgIC8vIFRPRE8gaGFuZGxlIGVudW0gZmllbGRzIG9uIHBvbHlnb25zIChubyBleGFtcGxlIGN1cnJlbnRseSlcbiAgICAgICAgc2V0Q2lyY2xlQ29sb3JTdHlsZShkYXRhQ29sdW1uKTtcbiAgICAgICAgICAgIFxuICAgIH1cbn1cbi8vIGZyb20gQ29sb3JCcmV3ZXJcbmNvbnN0IGVudW1Db2xvcnMgPSBbJyMxZjc4YjQnLCcjZmI5YTk5JywnI2IyZGY4YScsJyMzM2EwMmMnLCcjZTMxYTFjJywnI2ZkYmY2ZicsJyNhNmNlZTMnLCAnI2ZmN2YwMCcsJyNjYWIyZDYnLCcjNmEzZDlhJywnI2ZmZmY5OScsJyNiMTU5MjgnXTtcblxuLy8gY29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gR2VvSlNPTlxuZnVuY3Rpb24gcm93c1RvUG9pbnREYXRhc291cmNlKHJvd3MpIHtcbiAgICBsZXQgZGF0YXNvdXJjZSA9IHtcbiAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSB7XG4gICAgICAgICAgICAgICAgZGF0YXNvdXJjZS5kYXRhLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHJvdyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7IC8vIEp1c3QgZG9uJ3QgcHVzaCBpdCBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWQgbG9jYXRpb246ICR7cm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dfWApOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFzb3VyY2U7XG59XG5cbmZ1bmN0aW9uIHBvaW50TGF5ZXIoZmlsdGVyLCBoaWdobGlnaHQpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogJ3BvaW50cycgKyAoaGlnaGxpZ2h0ID8gJy1oaWdobGlnaHQnOiAnJyksXG4gICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICBzb3VyY2U6ICdkYXRhc2V0JyxcbiAgICAgICAgcGFpbnQ6IHtcbi8vICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdoc2woMjAsIDk1JSwgNTAlKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3JnYmEoMCwwLDAsMCknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogMC45NSxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3doaXRlJyA6ICdyZ2JhKDUwLDUwLDUwLDAuNSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2Utd2lkdGgnOiAxLFxuICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiB7XG4gICAgICAgICAgICAgICAgc3RvcHM6IGhpZ2hsaWdodCA/IFtbMTAsNF0sIFsxNywxMF1dIDogW1sxMCwyXSwgWzE3LDVdXVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcbiAgICBpZiAoZmlsdGVyKVxuICAgICAgICByZXQuZmlsdGVyID0gZmlsdGVyO1xuICAgIHJldHVybiByZXQ7XG59XG5cblxuLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuZnVuY3Rpb24gYWRkUG9pbnRzVG9NYXAocm93cywgbWFwKSB7XG4gICAgbWFwLmFkZFNvdXJjZSgnZGF0YXNldCcsIHJvd3NUb1BvaW50RGF0YXNvdXJjZShyb3dzKSApO1xuICAgIG1hcC5hZGRMYXllcihwb2ludExheWVyKCkpO1xuICAgIG1hcC5hZGRMYXllcihwb2ludExheWVyKFsnPT0nLHNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG59XG5cbmZ1bmN0aW9uIHBvbHlnb25MYXllcihoaWdobGlnaHQpIHtcbiAgICBsZXQgcmV0ID0ge1xuICAgICAgICBpZDogJ3BvbHlnb25zJyxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiAnZGF0YXNldCcsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknOiAwLjgsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IDAsXG4gICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJyMwMDMnXG4gICAgICAgICB9LFxuICAgIH07XG4gICAgcmV0dXJuIHJldDtcbn1cbmZ1bmN0aW9uIHBvbHlnb25IaWdobGlnaHRMYXllcigpIHtcbiAgICByZXR1cm57XG4gICAgICAgIGlkOiAncG9seWdvbnMtaGlnaGxpZ2h0JyxcbiAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICBzb3VyY2U6ICdkYXRhc2V0JyxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ2Jsb2NrX2lkJywgJy0nXVxuICAgIH07XG59XG5cbmZ1bmN0aW9uIGFkZFBvbHlnb25zVG9NYXAocm93cywgbWFwKSB7XG4gICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgLy8gaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L0Vjb25vbXkvRW1wbG95bWVudC1ieS1ibG9jay1ieS1pbmR1c3RyeS9iMzZqLWtpeTRcbiAgICBcbiAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgbWFwLmFkZFNvdXJjZSgnZGF0YXNldCcsIHsgXG4gICAgICAgIHR5cGU6ICd2ZWN0b3InLCBcbiAgICAgICAgdXJsOiAnbWFwYm94Oi8vb3BlbmNvdW5jaWxkYXRhLmFlZGZteXA4J1xuICAgIH0pO1xuICAgIG1hcC5hZGRMYXllcihwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoKSk7XG4gICAgbWFwLmFkZExheWVyKHBvbHlnb25MYXllcigpKTtcbiAgICBcbn1cbi8vZmFsc2UgJiYgd2hlbk1hcExvYWRlZCgoKSA9PlxuLy8gIHNldFZpc0NvbHVtbihzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMubGVuZ3RoKV0pKTtcblxuICAgIFxuZnVuY3Rpb24gc2hvd0ZlYXR1cmVUYWJsZShmZWF0dXJlKSB7XG4gICAgZnVuY3Rpb24gcm93c0luQXJyYXkoYXJyYXksIGNsYXNzU3RyKSB7XG4gICAgICAgIHJldHVybiAnPHRhYmxlPicgKyBcbiAgICAgICAgICAgIE9iamVjdC5rZXlzKGZlYXR1cmUpXG4gICAgICAgICAgICAgICAgLmZpbHRlcihrZXkgPT4gXG4gICAgICAgICAgICAgICAgICAgIGFycmF5ID09PSB1bmRlZmluZWQgfHwgYXJyYXkuaW5kZXhPZihrZXkpID49IDApXG4gICAgICAgICAgICAgICAgLm1hcChrZXkgPT5cbiAgICAgICAgICAgICAgICAgICAgYDx0cj48dGQgJHtjbGFzc1N0cn0+JHtrZXl9PC90ZD48dGQ+JHtmZWF0dXJlW2tleV19PC90ZD48L3RyPmApXG4gICAgICAgICAgICAgICAgLmpvaW4oJ1xcbicpICsgXG4gICAgICAgICAgICAnPC90YWJsZT4nO1xuICAgICAgICB9XG5cbiAgICBpZiAoZmVhdHVyZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIENhbGxlZCBiZWZvcmUgdGhlIHVzZXIgaGFzIHNlbGVjdGVkIGFueXRoaW5nXG4gICAgICAgIGZlYXR1cmUgPSB7fTtcbiAgICAgICAgc291cmNlRGF0YS50ZXh0Q29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGMgPT4gZmVhdHVyZVtjXSA9ICcnKTtcbiAgICAgICAgc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLmZvckVhY2goYyA9PiBmZWF0dXJlW2NdID0gJycpO1xuXG4gICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9seWdvbicpIHsgLy8gVE9ETyBjaGVjayB0aGF0IHRoaXMgaXMgYSBibG9jayBsb29rdXAgY2hvcm9wbGV0aFxuICAgICAgICBmZWF0dXJlID0gc291cmNlRGF0YS5nZXRSb3dGb3JCbG9jayhmZWF0dXJlLmJsb2NrX2lkLCBmZWF0dXJlLmNlbnN1c195cik7ICAgICAgICBcbiAgICB9XG5cblxuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2ZlYXR1cmVzJykuaW5uZXJIVE1MID0gXG4gICAgICAgICc8aDQ+Q2xpY2sgYSBmaWVsZCB0byB2aXN1YWxpc2Ugd2l0aCBjb2xvdXI8L2g0PicgK1xuICAgICAgICByb3dzSW5BcnJheShzb3VyY2VEYXRhLnRleHRDb2x1bW5zLCAnY2xhc3M9XCJlbnVtLWZpZWxkXCInKSArIFxuICAgICAgICAnPGg0PkNsaWNrIGEgZmllbGQgdG8gdmlzdWFsaXNlIHdpdGggc2l6ZTwvaDQ+JyArXG4gICAgICAgIHJvd3NJbkFycmF5KHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMsICdjbGFzcz1cIm51bWVyaWMtZmllbGRcIicpICsgXG4gICAgICAgICc8aDQ+T3RoZXIgZmllbGRzPC9oND4nICtcbiAgICAgICAgcm93c0luQXJyYXkoc291cmNlRGF0YS5ib3JpbmdDb2x1bW5zLCAnJyk7XG5cblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNmZWF0dXJlcyB0ZCcpLmZvckVhY2godGQgPT4gXG4gICAgICAgIHRkLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhlKTtcbiAgICAgICAgICAgIHNldFZpc0NvbHVtbihlLnRhcmdldC5pbm5lclRleHQpIDsgLy8gVE9ETyBoaWdobGlnaHQgdGhlIHNlbGVjdGVkIHJvd1xuICAgICAgICB9KSk7XG59XG5cbnZhciBsYXN0RmVhdHVyZTtcbmZ1bmN0aW9uIG1vdXNlbW92ZShlKSB7XG4gICAgdmFyIGZlYXR1cmUgPSBtYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGUucG9pbnQsIHsgbGF5ZXJzOiBbc291cmNlRGF0YS5zaGFwZSArICdzJ119KVswXTsgIC8qIHllcywgdGhhdCdzIGdyb3NzICovXG4gICAgaWYgKGZlYXR1cmUgJiYgZmVhdHVyZSAhPT0gbGFzdEZlYXR1cmUpIHtcbiAgICAgICAgbWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgICAgICBsYXN0RmVhdHVyZSA9IGZlYXR1cmU7XG4gICAgICAgIHNob3dGZWF0dXJlVGFibGUoZmVhdHVyZS5wcm9wZXJ0aWVzKTtcbiAgICAgICAgXG4gICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICBtYXAuc2V0RmlsdGVyKCdwb2ludHMtaGlnaGxpZ2h0JywgWyc9PScsIHNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sIGZlYXR1cmUucHJvcGVydGllc1tzb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXV0pOyAvLyB3ZSBkb24ndCBoYXZlIGFueSBvdGhlciByZWxpYWJsZSBrZXk/XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyAjIyMgVE9ETyBhZGQgcG9seWdvbiBoaWdobGlnaHRzIFxuICAgICAgICAgICAgbWFwLnNldEZpbHRlcigncG9seWdvbnMtaGlnaGxpZ2h0JywgWyc9PScsICdibG9ja19pZCcsIGZlYXR1cmUucHJvcGVydGllcy5ibG9ja19pZF0pOyAvLyBkb24ndCBoYXZlIGEgZ2VuZXJhbCB3YXkgdG8gbWF0Y2ggb3RoZXIga2luZHMgb2YgcG9seWdvbnNcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGZlYXR1cmUucHJvcGVydGllcyk7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBtYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJyc7XG4gICAgfVxufVxuXG5cbi8vZnVuY3Rpb24ga2V5VG9JZChrZXkpIHtcbi8vICAgIHJldHVybiBrZXkucmVwbGFjZSgvW15BLVphLXowLTlfLV0vZywgJ18nKTtcbi8vfVxuXG5mdW5jdGlvbiBjaG9vc2VEYXRhc2V0KCkge1xuICAgIGlmICh3aW5kb3cubG9jYXRpb24uaGFzaCkge1xuICAgICAgICByZXR1cm4gd2luZG93LmxvY2F0aW9uLmhhc2gucmVwbGFjZSgnIycsJycpO1xuICAgIH1cblxuICAgIC8vIGtub3duIHBvaW50IGRhdGFzZXRzIHRoYXQgd29yayBva1xuICAgIHZhciBjbHVlQ2hvaWNlcyA9IFtcbiAgICAgICAgJ2IzNmota2l5NCcsIC8vIGVtcGxveW1lbnRcbiAgICAgICAgJzIzNHEtZ2c4MycsIC8vIGZsb29yIHNwYWNlIGJ5IHVzZSBieSBibG9ja1xuICAgICAgICAnYzNndC1ocno2JyAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cyAtLSB0aGlzIG9uZSBpcyBjb21wbGV0ZSwgdGhlIG90aGVycyBoYXZlIGdhcHB5IGRhdGEgZm9yIGNvbmZpZGVudGlhbGl0eVxuICAgIF07XG5cbiAgICB2YXIgcG9pbnRDaG9pY2VzID0gW1xuICAgICAgICAnZnAzOC13aXl5JywgLy8gdHJlZXNcbiAgICAgICAgJ3lnYXctNnJ6cScsIC8vIHBlZGVzdHJpYW4gc2Vuc29yIGxvY2F0aW9uc1xuICAgICAgICAnODRiZi1kaWhpJywgLy8gVmVudWVzIGZvciBldmVudHNcbiAgICAgICAgJ3RkdmgtbjlkdicsIC8vIExpdmUgYmlrZSBzaGFyZVxuICAgICAgICAnZ2g3cy1xZGE4JywgLy8gREFNXG4gICAgICAgICdzZnJnLXp5Z2InLCAvLyBDYWZlcyBhbmQgUmVzdGF1cmFudHNcbiAgICAgICAgJ2V3NmstY2h6NCcsIC8vIEJpbyBCbGl0eiAyMDE2XG4gICAgICAgICc3dnJkLTRhdjUnLCAvLyB3YXlmaW5kaW5nXG4gICAgICAgICdzczc5LXY1NTgnLCAvLyBidXMgc3RvcHNcbiAgICAgICAgJ21mZmktbTl5bicsIC8vIHB1YnNcbiAgICAgICAgJ3N2dXgtYmFkYScsIC8vIHNvaWwgdGV4dHVyZXMgLSBuaWNlIG9uZVxuICAgICAgICAncWp3Yy1mNXNoJywgLy8gY29tbXVuaXR5IGZvb2QgZ3VpZGUgLSBnb29kXG4gICAgICAgICdmdGh5LXphanknLCAvLyBwcm9wZXJ0aWVzIG92ZXIgJDIuNW1cbiAgICAgICAgJ3R4OGgtMmpnaScsIC8vIGFjY2Vzc2libGUgdG9pbGV0c1xuICAgICAgICAnNnU1ei11YnZoJywgLy8gYmljeWNsZSBwYXJraW5nXG4gICAgICAgIC8vYnM3bi01dmVoLCAvLyBidXNpbmVzcyBlc3RhYmxpc2htZW50cy4gMTAwLDAwMCByb3dzLCB0b28gZnJhZ2lsZS5cbiAgICAgICAgXTtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJyNjYXB0aW9uIGgxJylbMF0uaW5uZXJIVE1MID0gJ0xvYWRpbmcgcmFuZG9tIGRhdGFzZXQuLi4nO1xuICAgIFxuICAgIHJldHVybiAnYzNndC1ocno2JztcbiAgICAvL3JldHVybiAnZ2g3cy1xZGE4JztcbiAgICAvL3JldHVybiBjbHVlQ2hvaWNlc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBjbHVlQ2hvaWNlcy5sZW5ndGgpXTtcbn1cblxuZnVuY3Rpb24gc2hvd0NhcHRpb24obmFtZSwgZGF0YUlkKSB7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2NhcHRpb24gaDEnKS5pbm5lckhUTUwgPSBuYW1lO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNzb3VyY2UnKS5zZXRBdHRyaWJ1dGUoJ2hyZWYnLCAnaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2QvJyArIGRhdGFJZCk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI3NoYXJlJykuaW5uZXJIVE1MID0gYFNoYXJlIHRoaXM6IDxhIGhyZWY9XCJodHRwczovL2NpdHktb2YtbWVsYm91cm5lLmdpdGh1Yi5pby9EYXRhM0QvIyR7ZGF0YUlkfVwiPmh0dHBzOi8vY2l0eS1vZi1tZWxib3VybmUuZ2l0aHViLmlvL0RhdGEzRC8jJHtkYXRhSWR9PC9hPmA7ICAgIFxuIFxuICAgIC8vICMjIyBIaWRlIGl0IGZvciBub3dcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FwdGlvbicpLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG4gfVxuXG5sZXQgbWFwLCBzb3VyY2VEYXRhO1xuXG4oZnVuY3Rpb24gc3RhcnQoKSB7XG5cbiAgICBtYXAgPSBuZXcgbWFwYm94Z2wuTWFwKHtcbiAgICAgICAgY29udGFpbmVyOiAnbWFwJyxcbiAgICAgICAgc3R5bGU6ICdtYXBib3g6Ly9zdHlsZXMvbWFwYm94L2RhcmstdjknLFxuICAgICAgICBjZW50ZXI6IFsxNDQuOTUsIC0zNy44MTNdLFxuICAgICAgICB6b29tOiAxMyxcbiAgICAgICAgcGl0Y2g6IDQ1IC8vIFRPRE8gcmV2ZXJ0IGZvciBmbGF0XG4gICAgfSk7XG5cbiAgICBsZXQgZGF0YUlkID0gY2hvb3NlRGF0YXNldCgpO1xuICAgIHNvdXJjZURhdGEgPSBuZXcgU291cmNlRGF0YShkYXRhSWQpO1xuXG4gICAgICAgIHNvdXJjZURhdGFcbiAgICAgICAgLmxvYWQoKVxuICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgIHNob3dDYXB0aW9uKHNvdXJjZURhdGEubmFtZSwgZGF0YUlkKTtcblxuICAgICAgICAgICAgd2hlbk1hcExvYWRlZChtYXAsICgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICBhZGRQb2ludHNUb01hcChyb3dzLCBtYXApO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGFkZFBvbHlnb25zVG9NYXAocm93cywgbWFwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgc2hvd0ZlYXR1cmVUYWJsZSgpOyBcbiAgICAgICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjbG9hZGluZycpWzBdLm91dGVySFRNTD0nJztcblxuICAgICAgICAgICAgICAgIG1hcC5vbignbW91c2Vtb3ZlJywgbW91c2Vtb3ZlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy92YXIgZnAgPSBuZXcgRmxpZ2h0UGF0aChtYXApO1xuXG4gICAgICAgIH0pO1xufSkoKTtcbiIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuaW1wb3J0IHsgbWVsYm91cm5lUm91dGUgfSBmcm9tICcuL21lbGJvdXJuZVJvdXRlJztcblxuLypcbkNvbnRpbnVvdXNseSBtb3ZlcyB0aGUgTWFwYm94IHZhbnRhZ2UgcG9pbnQgYXJvdW5kIGEgR2VvSlNPTi1kZWZpbmVkIHBhdGguXG4qL1xuXG5mdW5jdGlvbiB3aGVuTG9hZGVkKG1hcCwgZikge1xuICAgIGlmIChtYXAubG9hZGVkKCkpIHtcbiAgICAgICAgY29uc29sZS5sb2coJ0FscmVhZHkgbG9hZGVkLicpO1xuICAgICAgICBmKCk7XG4gICAgfVxuICAgIGVsc2UgeyBcbiAgICAgICAgY29uc29sZS5sb2coJ1dhaXQgZm9yIGxvYWQnKTtcbiAgICAgICAgbWFwLm9uY2UoJ2xvYWQnLCBmKTtcbiAgICB9XG59XG5cbmxldCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmV4cG9ydCBjbGFzcyBGbGlnaHRQYXRoIHtcblxuICAgIGNvbnN0cnVjdG9yKG1hcCwgcm91dGUpIHtcbiAgICAgICAgdGhpcy5yb3V0ZSA9IHJvdXRlO1xuICAgICAgICBpZiAodGhpcy5yb3V0ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgdGhpcy5yb3V0ZSA9IG1lbGJvdXJuZVJvdXRlO1xuXG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuXG4gICAgICAgIHRoaXMuc3BlZWQgPSAwLjAxO1xuXG4gICAgICAgIHRoaXMucG9zTm8gPSAwO1xuXG4gICAgICAgIHRoaXMucG9zaXRpb25zID0gdGhpcy5yb3V0ZS5mZWF0dXJlcy5tYXAoZmVhdHVyZSA9PiAoe1xuICAgICAgICAgICAgY2VudGVyOiBmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzLFxuICAgICAgICAgICAgem9vbTogZGVmKGZlYXR1cmUucHJvcGVydGllcy56b29tLCAxNCksXG4gICAgICAgICAgICBiZWFyaW5nOiBmZWF0dXJlLnByb3BlcnRpZXMuYmVhcmluZyxcbiAgICAgICAgICAgIHBpdGNoOiBkZWYoZmVhdHVyZS5wcm9wZXJ0aWVzLnBpdGNoLCA2MClcbiAgICAgICAgfSkpO1xuXG4gICAgICAgIHRoaXMucGF1c2VUaW1lID0gMDtcblxuICAgICAgICB0aGlzLmJlYXJpbmc9MDtcblxuICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcblxuXG5cbiAgICAvKnZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk2LCAtMzcuOF0sIHpvb206IDE1LCBiZWFyaW5nOiAxMH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk4LCAtMzcuODRdLCB6b29tOiAxNSwgYmVhcmluZzogMTYwLCBwaXRjaDogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OTUsIC0zNy44MjVdLCB6b29tOiAxNSwgYmVhcmluZzogLTkwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTcsIC0zNy44Ml0sIHpvb206IDE1LCBiZWFyaW5nOiAxNDB9XG5cbiAgICBdOyovXG5cbiAgICAgICAgdGhpcy5tb3ZlQ2FtZXJhID0gZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdtb3ZlQ2FtZXJhJyk7XG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSByZXR1cm47XG4gICAgICAgICAgICB2YXIgcG9zID0gdGhpcy5wb3NpdGlvbnNbdGhpcy5wb3NOb107XG4gICAgICAgICAgICBwb3Muc3BlZWQgPSB0aGlzLnNwZWVkO1xuICAgICAgICAgICAgcG9zLmN1cnZlID0gMC40ODsgLy8xO1xuICAgICAgICAgICAgcG9zLmVhc2luZyA9ICh0KSA9PiB0OyAvLyBsaW5lYXIgZWFzaW5nXG5cbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdmbHlUbycpO1xuICAgICAgICAgICAgdGhpcy5tYXAuZmx5VG8ocG9zLCB7IHNvdXJjZTogJ2ZsaWdodHBhdGgnIH0pO1xuXG4gICAgICAgICAgICB0aGlzLnBvc05vID0gKHRoaXMucG9zTm8gKyAxKSAlIHRoaXMucG9zaXRpb25zLmxlbmd0aDtcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy9tYXAucm90YXRlVG8oYmVhcmluZywgeyBlYXNpbmc6IGVhc2luZyB9KTtcbiAgICAgICAgICAgIC8vYmVhcmluZyArPSA1O1xuICAgICAgICB9LmJpbmQodGhpcyk7XG4gXG4gICAgICAgIHRoaXMubWFwLm9uKCdtb3ZlZW5kJywgKGRhdGEpID0+IHsgXG4gICAgICAgICAgICBpZiAoZGF0YS5zb3VyY2UgPT09ICdmbGlnaHRwYXRoJykgXG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG5cblxuICAgICAgICAvKlxuICAgICAgICBUaGlzIHNlZW1lZCB0byBiZSB1bnJlbGlhYmxlIC0gd2Fzbid0IGFsd2F5cyBnZXR0aW5nIHRoZSBsb2FkZWQgZXZlbnQuXG4gICAgICAgIHdoZW5Mb2FkZWQodGhpcy5tYXAsICgpID0+IHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdMb2FkZWQuJyk7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgKi9cbiAgICAgICAgXG4gICAgICAgIHRoaXMubWFwLmp1bXBUbyh0aGlzLnBvc2l0aW9uc1swXSk7XG4gICAgICAgIHRoaXMucG9zTm8gKys7XG4gICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCAwIC8qdGhpcy5wYXVzZVRpbWUqLyk7XG5cbiAgICAgICAgdGhpcy5tYXAub24oJ2NsaWNrJywgKCkgPT4geyBcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3BwZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLnN0b3AoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cblxuICAgIH0gICAgXG5cbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93UmFkaXVzTGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICAvLyBUT0RPIHBhZCB0aGUgc21hbGwgY2lyY2xlIHNvIHRoZSB0ZXh0IHN0YXJ0cyBhdCB0aGUgc2FtZSBYIHBvc2l0aW9uIGZvciBib3RoXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjZweDsgd2lkdGg6IDZweDsgYm9yZGVyLXJhZGl1czogM3B4XCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAyMHB4OyBib3JkZXItcmFkaXVzOiAxMHB4XCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPmA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG5cbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYig0MCw0MCwyNTApXCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjNweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYigyMCwyMCw0MClcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+YDsgXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NhdGVnb3J5TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBjb2xvclN0b3BzLCBjbG9zZUhhbmRsZXIpIHtcbiAgICBsZXQgbGVnZW5kSHRtbCA9IFxuICAgICAgICAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyArXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICBjb2xvclN0b3BzXG4gICAgICAgICAgICAuc29ydCgoc3RvcGEsIHN0b3BiKSA9PiBzdG9wYVswXS5sb2NhbGVDb21wYXJlKHN0b3BiWzBdKSkgLy8gc29ydCBvbiB2YWx1ZXNcbiAgICAgICAgICAgIC5tYXAoc3RvcCA9PiBgPHNwYW4gY2xhc3M9XCJib3hcIiBzdHlsZT0nYmFja2dyb3VuZDogJHtzdG9wWzFdfSc+PC9zcGFuPjxsYWJlbD4ke3N0b3BbMF19PC9sYWJlbD48YnIvPmApXG4gICAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgICAgO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG59IiwiZXhwb3J0IGNvbnN0IG1lbGJvdXJuZVJvdXRlID0ge1xuICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICBcImZlYXR1cmVzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDM1MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTYyODgyOTk1NjA1NDcsXG4gICAgICAgICAgLTM3LjgyMTcxNzY0NzgzOTY1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwiYmVhcmluZ1wiOiAyNzBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk3ODUwNDE4MDkwODIsXG4gICAgICAgICAgLTM3LjgwODM1OTkxNzQyMzU5NFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDE4MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTU1NTg3Mzg3MDg0OTYsXG4gICAgICAgICAgLTM3LjgwNTc4MzAyMTMxNDVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiA5MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTQ0MzQzNTY2ODk0NTMsXG4gICAgICAgICAgLTM3LjgxNjQ5Njg5MzcyMzA4XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG4gIF1cbn07IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1jb2xsZWN0aW9uLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBwcmVmaXggPSBcIiRcIjtcblxuZnVuY3Rpb24gTWFwKCkge31cblxuTWFwLnByb3RvdHlwZSA9IG1hcC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBNYXAsXG4gIGhhczogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIChwcmVmaXggKyBrZXkpIGluIHRoaXM7XG4gIH0sXG4gIGdldDogZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIHRoaXNbcHJlZml4ICsga2V5XTtcbiAgfSxcbiAgc2V0OiBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgdGhpc1twcmVmaXggKyBrZXldID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIHByb3BlcnR5ID0gcHJlZml4ICsga2V5O1xuICAgIHJldHVybiBwcm9wZXJ0eSBpbiB0aGlzICYmIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAgY2xlYXI6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGtleXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGtleXMucHVzaChwcm9wZXJ0eS5zbGljZSgxKSk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH0sXG4gIHZhbHVlczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSB2YWx1ZXMucHVzaCh0aGlzW3Byb3BlcnR5XSk7XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfSxcbiAgZW50cmllczogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGVudHJpZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZW50cmllcy5wdXNoKHtrZXk6IHByb3BlcnR5LnNsaWNlKDEpLCB2YWx1ZTogdGhpc1twcm9wZXJ0eV19KTtcbiAgICByZXR1cm4gZW50cmllcztcbiAgfSxcbiAgc2l6ZTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNpemUgPSAwO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSArK3NpemU7XG4gICAgcmV0dXJuIHNpemU7XG4gIH0sXG4gIGVtcHR5OiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgcmV0dXJuIGZhbHNlO1xuICAgIHJldHVybiB0cnVlO1xuICB9LFxuICBlYWNoOiBmdW5jdGlvbihmKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGYodGhpc1twcm9wZXJ0eV0sIHByb3BlcnR5LnNsaWNlKDEpLCB0aGlzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gbWFwKG9iamVjdCwgZikge1xuICB2YXIgbWFwID0gbmV3IE1hcDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgTWFwKSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSwga2V5KSB7IG1hcC5zZXQoa2V5LCB2YWx1ZSk7IH0pO1xuXG4gIC8vIEluZGV4IGFycmF5IGJ5IG51bWVyaWMgaW5kZXggb3Igc3BlY2lmaWVkIGtleSBmdW5jdGlvbi5cbiAgZWxzZSBpZiAoQXJyYXkuaXNBcnJheShvYmplY3QpKSB7XG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IG9iamVjdC5sZW5ndGgsXG4gICAgICAgIG87XG5cbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChpLCBvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoZihvID0gb2JqZWN0W2ldLCBpLCBvYmplY3QpLCBvKTtcbiAgfVxuXG4gIC8vIENvbnZlcnQgb2JqZWN0IHRvIG1hcC5cbiAgZWxzZSBpZiAob2JqZWN0KSBmb3IgKHZhciBrZXkgaW4gb2JqZWN0KSBtYXAuc2V0KGtleSwgb2JqZWN0W2tleV0pO1xuXG4gIHJldHVybiBtYXA7XG59XG5cbnZhciBuZXN0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBrZXlzID0gW10sXG4gICAgICBzb3J0S2V5cyA9IFtdLFxuICAgICAgc29ydFZhbHVlcyxcbiAgICAgIHJvbGx1cCxcbiAgICAgIG5lc3Q7XG5cbiAgZnVuY3Rpb24gYXBwbHkoYXJyYXksIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkge1xuICAgIGlmIChkZXB0aCA+PSBrZXlzLmxlbmd0aCkgcmV0dXJuIHJvbGx1cCAhPSBudWxsXG4gICAgICAgID8gcm9sbHVwKGFycmF5KSA6IChzb3J0VmFsdWVzICE9IG51bGxcbiAgICAgICAgPyBhcnJheS5zb3J0KHNvcnRWYWx1ZXMpXG4gICAgICAgIDogYXJyYXkpO1xuXG4gICAgdmFyIGkgPSAtMSxcbiAgICAgICAgbiA9IGFycmF5Lmxlbmd0aCxcbiAgICAgICAga2V5ID0ga2V5c1tkZXB0aCsrXSxcbiAgICAgICAga2V5VmFsdWUsXG4gICAgICAgIHZhbHVlLFxuICAgICAgICB2YWx1ZXNCeUtleSA9IG1hcCgpLFxuICAgICAgICB2YWx1ZXMsXG4gICAgICAgIHJlc3VsdCA9IGNyZWF0ZVJlc3VsdCgpO1xuXG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh2YWx1ZXMgPSB2YWx1ZXNCeUtleS5nZXQoa2V5VmFsdWUgPSBrZXkodmFsdWUgPSBhcnJheVtpXSkgKyBcIlwiKSkge1xuICAgICAgICB2YWx1ZXMucHVzaCh2YWx1ZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZXNCeUtleS5zZXQoa2V5VmFsdWUsIFt2YWx1ZV0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHZhbHVlc0J5S2V5LmVhY2goZnVuY3Rpb24odmFsdWVzLCBrZXkpIHtcbiAgICAgIHNldFJlc3VsdChyZXN1bHQsIGtleSwgYXBwbHkodmFsdWVzLCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpKTtcbiAgICB9KTtcblxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cblxuICBmdW5jdGlvbiBlbnRyaWVzKG1hcCQkMSwgZGVwdGgpIHtcbiAgICBpZiAoKytkZXB0aCA+IGtleXMubGVuZ3RoKSByZXR1cm4gbWFwJCQxO1xuICAgIHZhciBhcnJheSwgc29ydEtleSA9IHNvcnRLZXlzW2RlcHRoIC0gMV07XG4gICAgaWYgKHJvbGx1cCAhPSBudWxsICYmIGRlcHRoID49IGtleXMubGVuZ3RoKSBhcnJheSA9IG1hcCQkMS5lbnRyaWVzKCk7XG4gICAgZWxzZSBhcnJheSA9IFtdLCBtYXAkJDEuZWFjaChmdW5jdGlvbih2LCBrKSB7IGFycmF5LnB1c2goe2tleTogaywgdmFsdWVzOiBlbnRyaWVzKHYsIGRlcHRoKX0pOyB9KTtcbiAgICByZXR1cm4gc29ydEtleSAhPSBudWxsID8gYXJyYXkuc29ydChmdW5jdGlvbihhLCBiKSB7IHJldHVybiBzb3J0S2V5KGEua2V5LCBiLmtleSk7IH0pIDogYXJyYXk7XG4gIH1cblxuICByZXR1cm4gbmVzdCA9IHtcbiAgICBvYmplY3Q6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlT2JqZWN0LCBzZXRPYmplY3QpOyB9LFxuICAgIG1hcDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCk7IH0sXG4gICAgZW50cmllczogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGVudHJpZXMoYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKSwgMCk7IH0sXG4gICAga2V5OiBmdW5jdGlvbihkKSB7IGtleXMucHVzaChkKTsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydEtleXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRLZXlzW2tleXMubGVuZ3RoIC0gMV0gPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgc29ydFZhbHVlczogZnVuY3Rpb24ob3JkZXIpIHsgc29ydFZhbHVlcyA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICByb2xsdXA6IGZ1bmN0aW9uKGYpIHsgcm9sbHVwID0gZjsgcmV0dXJuIG5lc3Q7IH1cbiAgfTtcbn07XG5cbmZ1bmN0aW9uIGNyZWF0ZU9iamVjdCgpIHtcbiAgcmV0dXJuIHt9O1xufVxuXG5mdW5jdGlvbiBzZXRPYmplY3Qob2JqZWN0LCBrZXksIHZhbHVlKSB7XG4gIG9iamVjdFtrZXldID0gdmFsdWU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU1hcCgpIHtcbiAgcmV0dXJuIG1hcCgpO1xufVxuXG5mdW5jdGlvbiBzZXRNYXAobWFwJCQxLCBrZXksIHZhbHVlKSB7XG4gIG1hcCQkMS5zZXQoa2V5LCB2YWx1ZSk7XG59XG5cbmZ1bmN0aW9uIFNldCgpIHt9XG5cbnZhciBwcm90byA9IG1hcC5wcm90b3R5cGU7XG5cblNldC5wcm90b3R5cGUgPSBzZXQucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogU2V0LFxuICBoYXM6IHByb3RvLmhhcyxcbiAgYWRkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhbHVlICs9IFwiXCI7XG4gICAgdGhpc1twcmVmaXggKyB2YWx1ZV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBwcm90by5yZW1vdmUsXG4gIGNsZWFyOiBwcm90by5jbGVhcixcbiAgdmFsdWVzOiBwcm90by5rZXlzLFxuICBzaXplOiBwcm90by5zaXplLFxuICBlbXB0eTogcHJvdG8uZW1wdHksXG4gIGVhY2g6IHByb3RvLmVhY2hcbn07XG5cbmZ1bmN0aW9uIHNldChvYmplY3QsIGYpIHtcbiAgdmFyIHNldCA9IG5ldyBTZXQ7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIFNldCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUpIHsgc2V0LmFkZCh2YWx1ZSk7IH0pO1xuXG4gIC8vIE90aGVyd2lzZSwgYXNzdW1lIGl04oCZcyBhbiBhcnJheS5cbiAgZWxzZSBpZiAob2JqZWN0KSB7XG4gICAgdmFyIGkgPSAtMSwgbiA9IG9iamVjdC5sZW5ndGg7XG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIHNldC5hZGQob2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKGYob2JqZWN0W2ldLCBpLCBvYmplY3QpKTtcbiAgfVxuXG4gIHJldHVybiBzZXQ7XG59XG5cbnZhciBrZXlzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBrZXlzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGtleXMucHVzaChrZXkpO1xuICByZXR1cm4ga2V5cztcbn07XG5cbnZhciB2YWx1ZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIHZhbHVlcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSB2YWx1ZXMucHVzaChtYXBba2V5XSk7XG4gIHJldHVybiB2YWx1ZXM7XG59O1xuXG52YXIgZW50cmllcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgZW50cmllcyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBlbnRyaWVzLnB1c2goe2tleToga2V5LCB2YWx1ZTogbWFwW2tleV19KTtcbiAgcmV0dXJuIGVudHJpZXM7XG59O1xuXG5leHBvcnRzLm5lc3QgPSBuZXN0O1xuZXhwb3J0cy5zZXQgPSBzZXQ7XG5leHBvcnRzLm1hcCA9IG1hcDtcbmV4cG9ydHMua2V5cyA9IGtleXM7XG5leHBvcnRzLnZhbHVlcyA9IHZhbHVlcztcbmV4cG9ydHMuZW50cmllcyA9IGVudHJpZXM7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRpc3BhdGNoLyBWZXJzaW9uIDEuMC4yLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbnZhciBub29wID0ge3ZhbHVlOiBmdW5jdGlvbigpIHt9fTtcblxuZnVuY3Rpb24gZGlzcGF0Y2goKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gYXJndW1lbnRzLmxlbmd0aCwgXyA9IHt9LCB0OyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKCEodCA9IGFyZ3VtZW50c1tpXSArIFwiXCIpIHx8ICh0IGluIF8pKSB0aHJvdyBuZXcgRXJyb3IoXCJpbGxlZ2FsIHR5cGU6IFwiICsgdCk7XG4gICAgX1t0XSA9IFtdO1xuICB9XG4gIHJldHVybiBuZXcgRGlzcGF0Y2goXyk7XG59XG5cbmZ1bmN0aW9uIERpc3BhdGNoKF8pIHtcbiAgdGhpcy5fID0gXztcbn1cblxuZnVuY3Rpb24gcGFyc2VUeXBlbmFtZXModHlwZW5hbWVzLCB0eXBlcykge1xuICByZXR1cm4gdHlwZW5hbWVzLnRyaW0oKS5zcGxpdCgvXnxcXHMrLykubWFwKGZ1bmN0aW9uKHQpIHtcbiAgICB2YXIgbmFtZSA9IFwiXCIsIGkgPSB0LmluZGV4T2YoXCIuXCIpO1xuICAgIGlmIChpID49IDApIG5hbWUgPSB0LnNsaWNlKGkgKyAxKSwgdCA9IHQuc2xpY2UoMCwgaSk7XG4gICAgaWYgKHQgJiYgIXR5cGVzLmhhc093blByb3BlcnR5KHQpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdCk7XG4gICAgcmV0dXJuIHt0eXBlOiB0LCBuYW1lOiBuYW1lfTtcbiAgfSk7XG59XG5cbkRpc3BhdGNoLnByb3RvdHlwZSA9IGRpc3BhdGNoLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IERpc3BhdGNoLFxuICBvbjogZnVuY3Rpb24odHlwZW5hbWUsIGNhbGxiYWNrKSB7XG4gICAgdmFyIF8gPSB0aGlzLl8sXG4gICAgICAgIFQgPSBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZSArIFwiXCIsIF8pLFxuICAgICAgICB0LFxuICAgICAgICBpID0gLTEsXG4gICAgICAgIG4gPSBULmxlbmd0aDtcblxuICAgIC8vIElmIG5vIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJldHVybiB0aGUgY2FsbGJhY2sgb2YgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSB7XG4gICAgICB3aGlsZSAoKytpIDwgbikgaWYgKCh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgJiYgKHQgPSBnZXQoX1t0XSwgdHlwZW5hbWUubmFtZSkpKSByZXR1cm4gdDtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICAvLyBJZiBhIHR5cGUgd2FzIHNwZWNpZmllZCwgc2V0IHRoZSBjYWxsYmFjayBmb3IgdGhlIGdpdmVuIHR5cGUgYW5kIG5hbWUuXG4gICAgLy8gT3RoZXJ3aXNlLCBpZiBhIG51bGwgY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmVtb3ZlIGNhbGxiYWNrcyBvZiB0aGUgZ2l2ZW4gbmFtZS5cbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiB0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgd2hpbGUgKCsraSA8IG4pIHtcbiAgICAgIGlmICh0ID0gKHR5cGVuYW1lID0gVFtpXSkudHlwZSkgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBjYWxsYmFjayk7XG4gICAgICBlbHNlIGlmIChjYWxsYmFjayA9PSBudWxsKSBmb3IgKHQgaW4gXykgX1t0XSA9IHNldChfW3RdLCB0eXBlbmFtZS5uYW1lLCBudWxsKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgY29weTogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGNvcHkgPSB7fSwgXyA9IHRoaXMuXztcbiAgICBmb3IgKHZhciB0IGluIF8pIGNvcHlbdF0gPSBfW3RdLnNsaWNlKCk7XG4gICAgcmV0dXJuIG5ldyBEaXNwYXRjaChjb3B5KTtcbiAgfSxcbiAgY2FsbDogZnVuY3Rpb24odHlwZSwgdGhhdCkge1xuICAgIGlmICgobiA9IGFyZ3VtZW50cy5sZW5ndGggLSAyKSA+IDApIGZvciAodmFyIGFyZ3MgPSBuZXcgQXJyYXkobiksIGkgPSAwLCBuLCB0OyBpIDwgbjsgKytpKSBhcmdzW2ldID0gYXJndW1lbnRzW2kgKyAyXTtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfSxcbiAgYXBwbHk6IGZ1bmN0aW9uKHR5cGUsIHRoYXQsIGFyZ3MpIHtcbiAgICBpZiAoIXRoaXMuXy5oYXNPd25Qcm9wZXJ0eSh0eXBlKSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHR5cGUpO1xuICAgIGZvciAodmFyIHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIGdldCh0eXBlLCBuYW1lKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGgsIGM7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoKGMgPSB0eXBlW2ldKS5uYW1lID09PSBuYW1lKSB7XG4gICAgICByZXR1cm4gYy52YWx1ZTtcbiAgICB9XG4gIH1cbn1cblxuZnVuY3Rpb24gc2V0KHR5cGUsIG5hbWUsIGNhbGxiYWNrKSB7XG4gIGZvciAodmFyIGkgPSAwLCBuID0gdHlwZS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAodHlwZVtpXS5uYW1lID09PSBuYW1lKSB7XG4gICAgICB0eXBlW2ldID0gbm9vcCwgdHlwZSA9IHR5cGUuc2xpY2UoMCwgaSkuY29uY2F0KHR5cGUuc2xpY2UoaSArIDEpKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgdHlwZS5wdXNoKHtuYW1lOiBuYW1lLCB2YWx1ZTogY2FsbGJhY2t9KTtcbiAgcmV0dXJuIHR5cGU7XG59XG5cbmV4cG9ydHMuZGlzcGF0Y2ggPSBkaXNwYXRjaDtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZHN2LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cyddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cykgeyAndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIG9iamVjdENvbnZlcnRlcihjb2x1bW5zKSB7XG4gIHJldHVybiBuZXcgRnVuY3Rpb24oXCJkXCIsIFwicmV0dXJuIHtcIiArIGNvbHVtbnMubWFwKGZ1bmN0aW9uKG5hbWUsIGkpIHtcbiAgICByZXR1cm4gSlNPTi5zdHJpbmdpZnkobmFtZSkgKyBcIjogZFtcIiArIGkgKyBcIl1cIjtcbiAgfSkuam9pbihcIixcIikgKyBcIn1cIik7XG59XG5cbmZ1bmN0aW9uIGN1c3RvbUNvbnZlcnRlcihjb2x1bW5zLCBmKSB7XG4gIHZhciBvYmplY3QgPSBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucyk7XG4gIHJldHVybiBmdW5jdGlvbihyb3csIGkpIHtcbiAgICByZXR1cm4gZihvYmplY3Qocm93KSwgaSwgY29sdW1ucyk7XG4gIH07XG59XG5cbi8vIENvbXB1dGUgdW5pcXVlIGNvbHVtbnMgaW4gb3JkZXIgb2YgZGlzY292ZXJ5LlxuZnVuY3Rpb24gaW5mZXJDb2x1bW5zKHJvd3MpIHtcbiAgdmFyIGNvbHVtblNldCA9IE9iamVjdC5jcmVhdGUobnVsbCksXG4gICAgICBjb2x1bW5zID0gW107XG5cbiAgcm93cy5mb3JFYWNoKGZ1bmN0aW9uKHJvdykge1xuICAgIGZvciAodmFyIGNvbHVtbiBpbiByb3cpIHtcbiAgICAgIGlmICghKGNvbHVtbiBpbiBjb2x1bW5TZXQpKSB7XG4gICAgICAgIGNvbHVtbnMucHVzaChjb2x1bW5TZXRbY29sdW1uXSA9IGNvbHVtbik7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICByZXR1cm4gY29sdW1ucztcbn1cblxuZnVuY3Rpb24gZHN2KGRlbGltaXRlcikge1xuICB2YXIgcmVGb3JtYXQgPSBuZXcgUmVnRXhwKFwiW1xcXCJcIiArIGRlbGltaXRlciArIFwiXFxuXVwiKSxcbiAgICAgIGRlbGltaXRlckNvZGUgPSBkZWxpbWl0ZXIuY2hhckNvZGVBdCgwKTtcblxuICBmdW5jdGlvbiBwYXJzZSh0ZXh0LCBmKSB7XG4gICAgdmFyIGNvbnZlcnQsIGNvbHVtbnMsIHJvd3MgPSBwYXJzZVJvd3ModGV4dCwgZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgICBpZiAoY29udmVydCkgcmV0dXJuIGNvbnZlcnQocm93LCBpIC0gMSk7XG4gICAgICBjb2x1bW5zID0gcm93LCBjb252ZXJ0ID0gZiA/IGN1c3RvbUNvbnZlcnRlcihyb3csIGYpIDogb2JqZWN0Q29udmVydGVyKHJvdyk7XG4gICAgfSk7XG4gICAgcm93cy5jb2x1bW5zID0gY29sdW1ucztcbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIHBhcnNlUm93cyh0ZXh0LCBmKSB7XG4gICAgdmFyIEVPTCA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWxpbmVcbiAgICAgICAgRU9GID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtZmlsZVxuICAgICAgICByb3dzID0gW10sIC8vIG91dHB1dCByb3dzXG4gICAgICAgIE4gPSB0ZXh0Lmxlbmd0aCxcbiAgICAgICAgSSA9IDAsIC8vIGN1cnJlbnQgY2hhcmFjdGVyIGluZGV4XG4gICAgICAgIG4gPSAwLCAvLyB0aGUgY3VycmVudCBsaW5lIG51bWJlclxuICAgICAgICB0LCAvLyB0aGUgY3VycmVudCB0b2tlblxuICAgICAgICBlb2w7IC8vIGlzIHRoZSBjdXJyZW50IHRva2VuIGZvbGxvd2VkIGJ5IEVPTD9cblxuICAgIGZ1bmN0aW9uIHRva2VuKCkge1xuICAgICAgaWYgKEkgPj0gTikgcmV0dXJuIEVPRjsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgZmlsZVxuICAgICAgaWYgKGVvbCkgcmV0dXJuIGVvbCA9IGZhbHNlLCBFT0w7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGxpbmVcblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBxdW90ZXNcbiAgICAgIHZhciBqID0gSSwgYztcbiAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaikgPT09IDM0KSB7XG4gICAgICAgIHZhciBpID0gajtcbiAgICAgICAgd2hpbGUgKGkrKyA8IE4pIHtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkpID09PSAzNCkge1xuICAgICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMSkgIT09IDM0KSBicmVhaztcbiAgICAgICAgICAgICsraTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgSSA9IGkgKyAyO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KGkgKyAxKTtcbiAgICAgICAgaWYgKGMgPT09IDEzKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAyKSA9PT0gMTApICsrSTtcbiAgICAgICAgfSBlbHNlIGlmIChjID09PSAxMCkge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiArIDEsIGkpLnJlcGxhY2UoL1wiXCIvZywgXCJcXFwiXCIpO1xuICAgICAgfVxuXG4gICAgICAvLyBjb21tb24gY2FzZTogZmluZCBuZXh0IGRlbGltaXRlciBvciBuZXdsaW5lXG4gICAgICB3aGlsZSAoSSA8IE4pIHtcbiAgICAgICAgdmFyIGsgPSAxO1xuICAgICAgICBjID0gdGV4dC5jaGFyQ29kZUF0KEkrKyk7XG4gICAgICAgIGlmIChjID09PSAxMCkgZW9sID0gdHJ1ZTsgLy8gXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgPT09IDEzKSB7IGVvbCA9IHRydWU7IGlmICh0ZXh0LmNoYXJDb2RlQXQoSSkgPT09IDEwKSArK0ksICsrazsgfSAvLyBcXHJ8XFxyXFxuXG4gICAgICAgIGVsc2UgaWYgKGMgIT09IGRlbGltaXRlckNvZGUpIGNvbnRpbnVlO1xuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqLCBJIC0gayk7XG4gICAgICB9XG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogbGFzdCB0b2tlbiBiZWZvcmUgRU9GXG4gICAgICByZXR1cm4gdGV4dC5zbGljZShqKTtcbiAgICB9XG5cbiAgICB3aGlsZSAoKHQgPSB0b2tlbigpKSAhPT0gRU9GKSB7XG4gICAgICB2YXIgYSA9IFtdO1xuICAgICAgd2hpbGUgKHQgIT09IEVPTCAmJiB0ICE9PSBFT0YpIHtcbiAgICAgICAgYS5wdXNoKHQpO1xuICAgICAgICB0ID0gdG9rZW4oKTtcbiAgICAgIH1cbiAgICAgIGlmIChmICYmIChhID0gZihhLCBuKyspKSA9PSBudWxsKSBjb250aW51ZTtcbiAgICAgIHJvd3MucHVzaChhKTtcbiAgICB9XG5cbiAgICByZXR1cm4gcm93cztcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdChyb3dzLCBjb2x1bW5zKSB7XG4gICAgaWYgKGNvbHVtbnMgPT0gbnVsbCkgY29sdW1ucyA9IGluZmVyQ29sdW1ucyhyb3dzKTtcbiAgICByZXR1cm4gW2NvbHVtbnMubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcildLmNvbmNhdChyb3dzLm1hcChmdW5jdGlvbihyb3cpIHtcbiAgICAgIHJldHVybiBjb2x1bW5zLm1hcChmdW5jdGlvbihjb2x1bW4pIHtcbiAgICAgICAgcmV0dXJuIGZvcm1hdFZhbHVlKHJvd1tjb2x1bW5dKTtcbiAgICAgIH0pLmpvaW4oZGVsaW1pdGVyKTtcbiAgICB9KSkuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvd3Mocm93cykge1xuICAgIHJldHVybiByb3dzLm1hcChmb3JtYXRSb3cpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3cocm93KSB7XG4gICAgcmV0dXJuIHJvdy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFZhbHVlKHRleHQpIHtcbiAgICByZXR1cm4gdGV4dCA9PSBudWxsID8gXCJcIlxuICAgICAgICA6IHJlRm9ybWF0LnRlc3QodGV4dCArPSBcIlwiKSA/IFwiXFxcIlwiICsgdGV4dC5yZXBsYWNlKC9cXFwiL2csIFwiXFxcIlxcXCJcIikgKyBcIlxcXCJcIlxuICAgICAgICA6IHRleHQ7XG4gIH1cblxuICByZXR1cm4ge1xuICAgIHBhcnNlOiBwYXJzZSxcbiAgICBwYXJzZVJvd3M6IHBhcnNlUm93cyxcbiAgICBmb3JtYXQ6IGZvcm1hdCxcbiAgICBmb3JtYXRSb3dzOiBmb3JtYXRSb3dzXG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCIsXCIpO1xuXG52YXIgY3N2UGFyc2UgPSBjc3YucGFyc2U7XG52YXIgY3N2UGFyc2VSb3dzID0gY3N2LnBhcnNlUm93cztcbnZhciBjc3ZGb3JtYXQgPSBjc3YuZm9ybWF0O1xudmFyIGNzdkZvcm1hdFJvd3MgPSBjc3YuZm9ybWF0Um93cztcblxudmFyIHRzdiA9IGRzdihcIlxcdFwiKTtcblxudmFyIHRzdlBhcnNlID0gdHN2LnBhcnNlO1xudmFyIHRzdlBhcnNlUm93cyA9IHRzdi5wYXJzZVJvd3M7XG52YXIgdHN2Rm9ybWF0ID0gdHN2LmZvcm1hdDtcbnZhciB0c3ZGb3JtYXRSb3dzID0gdHN2LmZvcm1hdFJvd3M7XG5cbmV4cG9ydHMuZHN2Rm9ybWF0ID0gZHN2O1xuZXhwb3J0cy5jc3ZQYXJzZSA9IGNzdlBhcnNlO1xuZXhwb3J0cy5jc3ZQYXJzZVJvd3MgPSBjc3ZQYXJzZVJvd3M7XG5leHBvcnRzLmNzdkZvcm1hdCA9IGNzdkZvcm1hdDtcbmV4cG9ydHMuY3N2Rm9ybWF0Um93cyA9IGNzdkZvcm1hdFJvd3M7XG5leHBvcnRzLnRzdlBhcnNlID0gdHN2UGFyc2U7XG5leHBvcnRzLnRzdlBhcnNlUm93cyA9IHRzdlBhcnNlUm93cztcbmV4cG9ydHMudHN2Rm9ybWF0ID0gdHN2Rm9ybWF0O1xuZXhwb3J0cy50c3ZGb3JtYXRSb3dzID0gdHN2Rm9ybWF0Um93cztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTsiLCIvLyBodHRwczovL2QzanMub3JnL2QzLXJlcXVlc3QvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cywgcmVxdWlyZSgnZDMtY29sbGVjdGlvbicpLCByZXF1aXJlKCdkMy1kaXNwYXRjaCcpLCByZXF1aXJlKCdkMy1kc3YnKSkgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJywgJ2QzLWNvbGxlY3Rpb24nLCAnZDMtZGlzcGF0Y2gnLCAnZDMtZHN2J10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSksZ2xvYmFsLmQzLGdsb2JhbC5kMyxnbG9iYWwuZDMpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzLGQzQ29sbGVjdGlvbixkM0Rpc3BhdGNoLGQzRHN2KSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHJlcXVlc3QgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gIHZhciByZXF1ZXN0LFxuICAgICAgZXZlbnQgPSBkM0Rpc3BhdGNoLmRpc3BhdGNoKFwiYmVmb3Jlc2VuZFwiLCBcInByb2dyZXNzXCIsIFwibG9hZFwiLCBcImVycm9yXCIpLFxuICAgICAgbWltZVR5cGUsXG4gICAgICBoZWFkZXJzID0gZDNDb2xsZWN0aW9uLm1hcCgpLFxuICAgICAgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0LFxuICAgICAgdXNlciA9IG51bGwsXG4gICAgICBwYXNzd29yZCA9IG51bGwsXG4gICAgICByZXNwb25zZSxcbiAgICAgIHJlc3BvbnNlVHlwZSxcbiAgICAgIHRpbWVvdXQgPSAwO1xuXG4gIC8vIElmIElFIGRvZXMgbm90IHN1cHBvcnQgQ09SUywgdXNlIFhEb21haW5SZXF1ZXN0LlxuICBpZiAodHlwZW9mIFhEb21haW5SZXF1ZXN0ICE9PSBcInVuZGVmaW5lZFwiXG4gICAgICAmJiAhKFwid2l0aENyZWRlbnRpYWxzXCIgaW4geGhyKVxuICAgICAgJiYgL14oaHR0cChzKT86KT9cXC9cXC8vLnRlc3QodXJsKSkgeGhyID0gbmV3IFhEb21haW5SZXF1ZXN0O1xuXG4gIFwib25sb2FkXCIgaW4geGhyXG4gICAgICA/IHhoci5vbmxvYWQgPSB4aHIub25lcnJvciA9IHhoci5vbnRpbWVvdXQgPSByZXNwb25kXG4gICAgICA6IHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbihvKSB7IHhoci5yZWFkeVN0YXRlID4gMyAmJiByZXNwb25kKG8pOyB9O1xuXG4gIGZ1bmN0aW9uIHJlc3BvbmQobykge1xuICAgIHZhciBzdGF0dXMgPSB4aHIuc3RhdHVzLCByZXN1bHQ7XG4gICAgaWYgKCFzdGF0dXMgJiYgaGFzUmVzcG9uc2UoeGhyKVxuICAgICAgICB8fCBzdGF0dXMgPj0gMjAwICYmIHN0YXR1cyA8IDMwMFxuICAgICAgICB8fCBzdGF0dXMgPT09IDMwNCkge1xuICAgICAgaWYgKHJlc3BvbnNlKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcmVzdWx0ID0gcmVzcG9uc2UuY2FsbChyZXF1ZXN0LCB4aHIpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIGUpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0ID0geGhyO1xuICAgICAgfVxuICAgICAgZXZlbnQuY2FsbChcImxvYWRcIiwgcmVxdWVzdCwgcmVzdWx0KTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXZlbnQuY2FsbChcImVycm9yXCIsIHJlcXVlc3QsIG8pO1xuICAgIH1cbiAgfVxuXG4gIHhoci5vbnByb2dyZXNzID0gZnVuY3Rpb24oZSkge1xuICAgIGV2ZW50LmNhbGwoXCJwcm9ncmVzc1wiLCByZXF1ZXN0LCBlKTtcbiAgfTtcblxuICByZXF1ZXN0ID0ge1xuICAgIGhlYWRlcjogZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICAgIG5hbWUgPSAobmFtZSArIFwiXCIpLnRvTG93ZXJDYXNlKCk7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHJldHVybiBoZWFkZXJzLmdldChuYW1lKTtcbiAgICAgIGlmICh2YWx1ZSA9PSBudWxsKSBoZWFkZXJzLnJlbW92ZShuYW1lKTtcbiAgICAgIGVsc2UgaGVhZGVycy5zZXQobmFtZSwgdmFsdWUgKyBcIlwiKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBJZiBtaW1lVHlwZSBpcyBub24tbnVsbCBhbmQgbm8gQWNjZXB0IGhlYWRlciBpcyBzZXQsIGEgZGVmYXVsdCBpcyB1c2VkLlxuICAgIG1pbWVUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gbWltZVR5cGU7XG4gICAgICBtaW1lVHlwZSA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZmllcyB3aGF0IHR5cGUgdGhlIHJlc3BvbnNlIHZhbHVlIHNob3VsZCB0YWtlO1xuICAgIC8vIGZvciBpbnN0YW5jZSwgYXJyYXlidWZmZXIsIGJsb2IsIGRvY3VtZW50LCBvciB0ZXh0LlxuICAgIHJlc3BvbnNlVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHJlc3BvbnNlVHlwZTtcbiAgICAgIHJlc3BvbnNlVHlwZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHRpbWVvdXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiB0aW1lb3V0O1xuICAgICAgdGltZW91dCA9ICt2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB1c2VyOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gdXNlciA6ICh1c2VyID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICBwYXNzd29yZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHBhc3N3b3JkIDogKHBhc3N3b3JkID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCIsIHJlcXVlc3QpO1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZ5IGhvdyB0byBjb252ZXJ0IHRoZSByZXNwb25zZSBjb250ZW50IHRvIGEgc3BlY2lmaWMgdHlwZTtcbiAgICAvLyBjaGFuZ2VzIHRoZSBjYWxsYmFjayB2YWx1ZSBvbiBcImxvYWRcIiBldmVudHMuXG4gICAgcmVzcG9uc2U6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXNwb25zZSA9IHZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiR0VUXCIsIOKApikuXG4gICAgZ2V0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIkdFVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIEFsaWFzIGZvciBzZW5kKFwiUE9TVFwiLCDigKYpLlxuICAgIHBvc3Q6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiUE9TVFwiLCBkYXRhLCBjYWxsYmFjayk7XG4gICAgfSxcblxuICAgIC8vIElmIGNhbGxiYWNrIGlzIG5vbi1udWxsLCBpdCB3aWxsIGJlIHVzZWQgZm9yIGVycm9yIGFuZCBsb2FkIGV2ZW50cy5cbiAgICBzZW5kOiBmdW5jdGlvbihtZXRob2QsIGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICB4aHIub3BlbihtZXRob2QsIHVybCwgdHJ1ZSwgdXNlciwgcGFzc3dvcmQpO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgIWhlYWRlcnMuaGFzKFwiYWNjZXB0XCIpKSBoZWFkZXJzLnNldChcImFjY2VwdFwiLCBtaW1lVHlwZSArIFwiLCovKlwiKTtcbiAgICAgIGlmICh4aHIuc2V0UmVxdWVzdEhlYWRlcikgaGVhZGVycy5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7IHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIHZhbHVlKTsgfSk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiB4aHIub3ZlcnJpZGVNaW1lVHlwZSkgeGhyLm92ZXJyaWRlTWltZVR5cGUobWltZVR5cGUpO1xuICAgICAgaWYgKHJlc3BvbnNlVHlwZSAhPSBudWxsKSB4aHIucmVzcG9uc2VUeXBlID0gcmVzcG9uc2VUeXBlO1xuICAgICAgaWYgKHRpbWVvdXQgPiAwKSB4aHIudGltZW91dCA9IHRpbWVvdXQ7XG4gICAgICBpZiAoY2FsbGJhY2sgPT0gbnVsbCAmJiB0eXBlb2YgZGF0YSA9PT0gXCJmdW5jdGlvblwiKSBjYWxsYmFjayA9IGRhdGEsIGRhdGEgPSBudWxsO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgY2FsbGJhY2subGVuZ3RoID09PSAxKSBjYWxsYmFjayA9IGZpeENhbGxiYWNrKGNhbGxiYWNrKTtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSByZXF1ZXN0Lm9uKFwiZXJyb3JcIiwgY2FsbGJhY2spLm9uKFwibG9hZFwiLCBmdW5jdGlvbih4aHIpIHsgY2FsbGJhY2sobnVsbCwgeGhyKTsgfSk7XG4gICAgICBldmVudC5jYWxsKFwiYmVmb3Jlc2VuZFwiLCByZXF1ZXN0LCB4aHIpO1xuICAgICAgeGhyLnNlbmQoZGF0YSA9PSBudWxsID8gbnVsbCA6IGRhdGEpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIGFib3J0OiBmdW5jdGlvbigpIHtcbiAgICAgIHhoci5hYm9ydCgpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIG9uOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciB2YWx1ZSA9IGV2ZW50Lm9uLmFwcGx5KGV2ZW50LCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIHZhbHVlID09PSBldmVudCA/IHJlcXVlc3QgOiB2YWx1ZTtcbiAgICB9XG4gIH07XG5cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHJldHVybiByZXF1ZXN0LmdldChjYWxsYmFjayk7XG4gIH1cblxuICByZXR1cm4gcmVxdWVzdDtcbn07XG5cbmZ1bmN0aW9uIGZpeENhbGxiYWNrKGNhbGxiYWNrKSB7XG4gIHJldHVybiBmdW5jdGlvbihlcnJvciwgeGhyKSB7XG4gICAgY2FsbGJhY2soZXJyb3IgPT0gbnVsbCA/IHhociA6IG51bGwpO1xuICB9O1xufVxuXG5mdW5jdGlvbiBoYXNSZXNwb25zZSh4aHIpIHtcbiAgdmFyIHR5cGUgPSB4aHIucmVzcG9uc2VUeXBlO1xuICByZXR1cm4gdHlwZSAmJiB0eXBlICE9PSBcInRleHRcIlxuICAgICAgPyB4aHIucmVzcG9uc2UgLy8gbnVsbCBvbiBlcnJvclxuICAgICAgOiB4aHIucmVzcG9uc2VUZXh0OyAvLyBcIlwiIG9uIGVycm9yXG59XG5cbnZhciB0eXBlID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCByZXNwb25zZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSkucmVzcG9uc2UocmVzcG9uc2UpO1xuICAgIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgICAgcmV0dXJuIHIuZ2V0KGNhbGxiYWNrKTtcbiAgICB9XG4gICAgcmV0dXJuIHI7XG4gIH07XG59O1xuXG52YXIgaHRtbCA9IHR5cGUoXCJ0ZXh0L2h0bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBkb2N1bWVudC5jcmVhdGVSYW5nZSgpLmNyZWF0ZUNvbnRleHR1YWxGcmFnbWVudCh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIganNvbiA9IHR5cGUoXCJhcHBsaWNhdGlvbi9qc29uXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KTtcbn0pO1xuXG52YXIgdGV4dCA9IHR5cGUoXCJ0ZXh0L3BsYWluXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4geGhyLnJlc3BvbnNlVGV4dDtcbn0pO1xuXG52YXIgeG1sID0gdHlwZShcImFwcGxpY2F0aW9uL3htbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgdmFyIHhtbCA9IHhoci5yZXNwb25zZVhNTDtcbiAgaWYgKCF4bWwpIHRocm93IG5ldyBFcnJvcihcInBhcnNlIGVycm9yXCIpO1xuICByZXR1cm4geG1sO1xufSk7XG5cbnZhciBkc3YgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHBhcnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIHJvdywgY2FsbGJhY2spIHtcbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIGNhbGxiYWNrID0gcm93LCByb3cgPSBudWxsO1xuICAgIHZhciByID0gcmVxdWVzdCh1cmwpLm1pbWVUeXBlKGRlZmF1bHRNaW1lVHlwZSk7XG4gICAgci5yb3cgPSBmdW5jdGlvbihfKSB7IHJldHVybiBhcmd1bWVudHMubGVuZ3RoID8gci5yZXNwb25zZShyZXNwb25zZU9mKHBhcnNlLCByb3cgPSBfKSkgOiByb3c7IH07XG4gICAgci5yb3cocm93KTtcbiAgICByZXR1cm4gY2FsbGJhY2sgPyByLmdldChjYWxsYmFjaykgOiByO1xuICB9O1xufTtcblxuZnVuY3Rpb24gcmVzcG9uc2VPZihwYXJzZSwgcm93KSB7XG4gIHJldHVybiBmdW5jdGlvbihyZXF1ZXN0JCQxKSB7XG4gICAgcmV0dXJuIHBhcnNlKHJlcXVlc3QkJDEucmVzcG9uc2VUZXh0LCByb3cpO1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwidGV4dC9jc3ZcIiwgZDNEc3YuY3N2UGFyc2UpO1xuXG52YXIgdHN2ID0gZHN2KFwidGV4dC90YWItc2VwYXJhdGVkLXZhbHVlc1wiLCBkM0Rzdi50c3ZQYXJzZSk7XG5cbmV4cG9ydHMucmVxdWVzdCA9IHJlcXVlc3Q7XG5leHBvcnRzLmh0bWwgPSBodG1sO1xuZXhwb3J0cy5qc29uID0ganNvbjtcbmV4cG9ydHMudGV4dCA9IHRleHQ7XG5leHBvcnRzLnhtbCA9IHhtbDtcbmV4cG9ydHMuY3N2ID0gY3N2O1xuZXhwb3J0cy50c3YgPSB0c3Y7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIhZnVuY3Rpb24oZSxuKXtcIm9iamVjdFwiPT10eXBlb2YgZXhwb3J0cyYmXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZT9tb2R1bGUuZXhwb3J0cz1uKHJlcXVpcmUoXCJkMy1yZXF1ZXN0XCIpKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImQzLXJlcXVlc3RcIl0sbik6KGUuZDM9ZS5kM3x8e30sZS5kMy5wcm9taXNlPW4oZS5kMykpfSh0aGlzLGZ1bmN0aW9uKGUpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIG4oZSxuKXtyZXR1cm4gZnVuY3Rpb24oKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aCxyPUFycmF5KHQpLG89MDt0Pm87bysrKXJbb109YXJndW1lbnRzW29dO3JldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbih0LG8pe3ZhciB1PWZ1bmN0aW9uKGUsbil7cmV0dXJuIGU/dm9pZCBvKEVycm9yKGUpKTp2b2lkIHQobil9O24uYXBwbHkoZSxyLmNvbmNhdCh1KSl9KX19dmFyIHQ9e307cmV0dXJuW1wiY3N2XCIsXCJ0c3ZcIixcImpzb25cIixcInhtbFwiLFwidGV4dFwiLFwiaHRtbFwiXS5mb3JFYWNoKGZ1bmN0aW9uKHIpe3Rbcl09bihlLGVbcl0pfSksdH0pOyIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xudmFyIGQzID0gcmVxdWlyZSgnZDMucHJvbWlzZScpO1xuXG5mdW5jdGlvbiBkZWYoYSwgYikge1xuICAgIHJldHVybiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcbn1cblxuZXhwb3J0IGNsYXNzIFNvdXJjZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKGRhdGFJZCwgYWN0aXZlQ2Vuc3VzWWVhcikge1xuICAgICAgICB0aGlzLmRhdGFJZCA9IGRhdGFJZDtcbiAgICAgICAgdGhpcy5hY3RpdmVDZW5zdXNZZWFyID0gZGVmKGFjdGl2ZUNlbnN1c1llYXIsIDIwMTUpO1xuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSB1bmRlZmluZWQ7ICAvLyBuYW1lIG9mIGNvbHVtbiB3aGljaCBob2xkcyBsYXQvbG9uIG9yIGJsb2NrIElEXG4gICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdW5kZWZpbmVkOyAvLyBpZiB0aGUgZGF0YXNldCB0eXBlIGlzICdwb2ludCcgKHVzZWQgZm9yIHBhcnNpbmcgbG9jYXRpb24gZmllbGQpXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTsgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBudW1lcmljIGRhdGF2aXNcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IFtdOyAgICAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIGVudW0gZGF0YXZpc1xuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBbXTsgICAgICAgICAgLy8gbmFtZXMgb2Ygb3RoZXIgY29sdW1uc1xuICAgICAgICB0aGlzLm1pbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gbWluIGFuZCBtYXggb2YgZWFjaCBudW1lcmljIGNvbHVtblxuICAgICAgICB0aGlzLm1heHMgPSB7fTtcbiAgICAgICAgdGhpcy5mcmVxdWVuY2llcyA9IHt9OyAgICAgICAgICAgIC8vIFxuICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzID0ge307ICAgICAgLy8gbW9zdCBmcmVxdWVudCB2YWx1ZXMgaW4gZWFjaCB0ZXh0IGNvbHVtblxuICAgICAgICB0aGlzLnNoYXBlID0gJ3BvaW50JzsgICAgICAgICAgICAgLy8gcG9pbnQgb3IgcG9seWdvbiAoQ0xVRSBibG9jaylcbiAgICAgICAgdGhpcy5zb3VyY2VSb3dzID0gdW5kZWZpbmVkOyAgICAgIC8vIHByb2Nlc3NlZCByb3dzXG4gICAgICAgIHRoaXMuYmxvY2tJbmRleCA9IHt9OyAgICAgICAgICAgICAvLyBjYWNoZSBvZiBDTFVFIGJsb2NrIElEc1xuICAgIH1cblxuXG4gICAgY2hvb3NlQ29sdW1uVHlwZXMgKGNvbHVtbnMpIHtcbiAgICAgICAgdmFyIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JyB8fCBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIGlmIChsYy5kYXRhVHlwZU5hbWUgPT09ICdwb2ludCcpXG4gICAgICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHRydWU7XG5cbiAgICAgICAgaWYgKGxjLm5hbWUgPT09ICdCbG9jayBJRCcpIHtcbiAgICAgICAgICAgIHRoaXMuc2hhcGUgPSAncG9seWdvbic7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gbGMubmFtZTtcblxuICAgICAgICBjb2x1bW5zID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbCAhPT0gbGMpO1xuXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAnbnVtYmVyJyAmJiBjb2wubmFtZSAhPT0gJ0xhdGl0dWRlJyAmJiBjb2wubmFtZSAhPT0gJ0xvbmdpdHVkZScpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4geyB0aGlzLm1pbnNbY29sXSA9IDFlOTsgdGhpcy5tYXhzW2NvbF0gPSAtMWU5OyB9KTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiBjb2wuZGF0YVR5cGVOYW1lID09PSAndGV4dCcpXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSk7XG5cbiAgICAgICAgdGhpcy50ZXh0Q29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHRoaXMuZnJlcXVlbmNpZXNbY29sXSA9IHt9KTtcblxuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBjb2x1bW5zXG4gICAgICAgICAgICAubWFwKGNvbCA9PiBjb2wubmFtZSlcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IHRoaXMubnVtZXJpY0NvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCAmJiB0aGlzLnRleHRDb2x1bW5zLmluZGV4T2YoY29sKSA8IDApO1xuICAgIH1cblxuICAgIC8vIFRPRE8gYmV0dGVyIG5hbWUgYW5kIGJlaGF2aW91clxuICAgIGZpbHRlcihyb3cpIHtcbiAgICAgICAgLy8gVE9ETyBtb3ZlIHRoaXMgc29tZXdoZXJlIGJldHRlclxuICAgICAgICBpZiAocm93WydDTFVFIHNtYWxsIGFyZWEnXSAmJiByb3dbJ0NMVUUgc21hbGwgYXJlYSddID09PSAnQ2l0eSBvZiBNZWxib3VybmUgdG90YWwnKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICBpZiAocm93WydDZW5zdXMgeWVhciddICYmIHJvd1snQ2Vuc3VzIHllYXInXSAhPT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyKVxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cblxuXG4gICAgLy8gY29udmVydCBudW1lcmljIGNvbHVtbnMgdG8gbnVtYmVycyBmb3IgZGF0YSB2aXNcbiAgICBjb252ZXJ0Um93KHJvdykge1xuXG4gICAgICAgIC8vIGNvbnZlcnQgbG9jYXRpb24gdHlwZXMgKHN0cmluZykgdG8gW2xvbiwgbGF0XSBhcnJheS5cbiAgICAgICAgZnVuY3Rpb24gbG9jYXRpb25Ub0Nvb3Jkcyhsb2NhdGlvbikge1xuICAgICAgICAgICAgaWYgKFN0cmluZyhsb2NhdGlvbikubGVuZ3RoID09PSAwKVxuICAgICAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICAgICAgLy8gXCJuZXcgYmFja2VuZFwiIGRhdGFzZXRzIHVzZSBhIFdLVCBmaWVsZCBbUE9JTlQgKGxvbiBsYXQpXSBpbnN0ZWFkIG9mIChsYXQsIGxvbilcbiAgICAgICAgICAgIGlmICh0aGlzLmxvY2F0aW9uSXNQb2ludCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbi5yZXBsYWNlKCdQT0lOVCAoJywgJycpLnJlcGxhY2UoJyknLCAnJykuc3BsaXQoJyAnKS5tYXAobiA9PiBOdW1iZXIobikpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICh0aGlzLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2cobG9jYXRpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW051bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVsxXS5yZXBsYWNlKCcpJywgJycpKSwgTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzBdLnJlcGxhY2UoJygnLCAnJykpXTtcbiAgICAgICAgICAgIH0gZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyB1c2UgY29sdW1uLmNhY2hlZENvbnRlbnRzLnNtYWxsZXN0IGFuZCAubGFyZ2VzdFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHJvd1tjb2xdID0gTnVtYmVyKHJvd1tjb2xdKSA7IC8vICtyb3dbY29sXSBhcHBhcmVudGx5IGZhc3RlciwgYnV0IGJyZWFrcyBvbiBzaW1wbGUgdGhpbmdzIGxpa2UgYmxhbmsgdmFsdWVzXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluY2x1ZGUgdGhlIHRvdGFsIHZhbHVlcyBpbiBcbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA8IHRoaXMubWluc1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5taW5zW2NvbF0gPSByb3dbY29sXTtcblxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdID4gdGhpcy5tYXhzW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1heHNbY29sXSA9IHJvd1tjb2xdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB2YXIgdmFsID0gcm93W2NvbF07XG4gICAgICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSA9ICh0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSA9IGxvY2F0aW9uVG9Db29yZHMuY2FsbCh0aGlzLCByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pO1xuXG5cblxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpIHtcbiAgICAgICAgdmFyIG5ld1RleHRDb2x1bW5zID0gW107XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdID0gT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKVxuICAgICAgICAgICAgICAgIC5zb3J0KCh2YWxhLCB2YWxiKSA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYV0gPCB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYl0gPyAxIDogLTEpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsMTIpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPCAyIHx8IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoID4gMjAgJiYgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3RoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXVsxXV0gPD0gNSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYm9yaW5nIGlmIGFsbCB2YWx1ZXMgdGhlIHNhbWUsIG9yIGlmIHRvbyBtYW55IGRpZmZlcmVudCB2YWx1ZXMgKGFzIGp1ZGdlZCBieSBzZWNvbmQtbW9zdCBjb21tb24gdmFsdWUgYmVpbmcgNSB0aW1lcyBvciBmZXdlcilcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKCdCb3JpbmchICcpOyBcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUZXh0Q29sdW1ucy5wdXNoKGNvbCk7IC8vIGhvdyBkbyB5b3Ugc2FmZWx5IGRlbGV0ZSBmcm9tIGFycmF5IHlvdSdyZSBsb29waW5nIG92ZXI/XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IG5ld1RleHRDb2x1bW5zO1xuICAgICAgICBjb25zb2xlLmxvZyh0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzKTtcbiAgICB9XG5cbiAgICAvLyByZXR1cm4gcHJvbWlzZSBmb3Igcm93c1xuICAgIGxvYWQoKSB7XG4gICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZCArICcuanNvbicpXG4gICAgICAgIC50aGVuKHByb3BzID0+IHtcbiAgICAgICAgICAgIHRoaXMubmFtZSA9IHByb3BzLm5hbWU7XG4gICAgICAgICAgICBpZiAocHJvcHMubmV3QmFja2VuZCAmJiBwcm9wcy5jaGlsZFZpZXdzLmxlbmd0aCA+IDApIHtcblxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YUlkID0gcHJvcHMuY2hpbGRWaWV3c1swXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBkMy5qc29uKCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyBkYXRhSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHByb3BzID0+IHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGQzLmNzdignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnL3Jvd3MuY3N2P2FjY2Vzc1R5cGU9RE9XTkxPQUQnLCB0aGlzLmNvbnZlcnRSb3cuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKHJvd3MgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvbHlnb24nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVCbG9ja0luZGV4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJvd3M7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgYSBoYXNoIHRhYmxlIGxvb2t1cCBmcm9tIFt5ZWFyLCBibG9jayBJRF0gdG8gZGF0YXNldCByb3dcbiAgICBjb21wdXRlQmxvY2tJbmRleCgpIHtcbiAgICAgICAgdGhpcy5yb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID0ge307XG4gICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXVtyb3dbJ0Jsb2NrIElEJ11dID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJvd0ZvckJsb2NrKGJsb2NrSWQgLyogY2Vuc3VzX3llYXIgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93c1t0aGlzLmJsb2NrSW5kZXhbdGhpcy5hY3RpdmVDZW5zdXNZZWFyXVtibG9ja0lkXV07XG4gICAgfVxuXG4gICAgZmlsdGVyZWRSb3dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93WydDZW5zdXMgeWVhciddID09PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSAhPT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJyk7XG4gICAgfVxufSJdfQ==

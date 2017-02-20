(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./sourceData":7}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

},{"d3-collection":2,"d3-dispatch":3,"d3-dsv":4}],6:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],n):(e.d3=e.d3||{},e.d3.promise=n(e.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var u=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(u))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t});
},{"d3-request":5}],7:[function(require,module,exports){
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

},{"d3.promise":6}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2N5Y2xlRGF0YXNldHMuanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLWNvbGxlY3Rpb24vYnVpbGQvZDMtY29sbGVjdGlvbi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvYnVpbGQvZDMtZGlzcGF0Y2guanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLWRzdi9idWlsZC9kMy1kc3YuanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLXJlcXVlc3QvYnVpbGQvZDMtcmVxdWVzdC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMucHJvbWlzZS9kaXN0L2QzLnByb21pc2UubWluLmpzIiwic3JjL2pzL3NvdXJjZURhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDNkNBOztBQUVPLElBQU0sOEJBQVcsQ0FDcEI7QUFDSSxXQUFNLEtBRFY7QUFFSSxhQUFTLDJEQUZiO0FBR0ksVUFBTSxrRkFIVjtBQUlJLFlBQVE7QUFDSixZQUFJLE1BREE7QUFFSixjQUFNLFFBRkY7QUFHSixnQkFBUSxtQ0FISjtBQUlKLHdCQUFnQixzQ0FKWjtBQUtKLGVBQU87QUFDSCwwQkFBYyxvQkFEWCxFQUxIO0FBUUosZ0JBQVE7QUFDSiwwQkFBYyxRQURWO0FBRUoseUJBQWE7O0FBRlQ7QUFSSixLQUpaO0FBa0JJLFdBQU8sRUFBQyxVQUFTLEVBQUMsT0FBTSxrQkFBUCxFQUEwQixPQUFNLENBQUMsaUJBQWpDLEVBQVYsRUFBOEQsUUFBTyxrQkFBckUsRUFBd0YsV0FBVSxDQUFDLGdCQUFuRyxFQUFvSCxTQUFRLGtCQUE1SDtBQWxCWCxDQURvQixFQXNCcEI7QUFDSSxXQUFPLEtBRFg7QUFFSSxhQUFTLHNEQUZiO0FBR0ksVUFBTSxtREFIVjtBQUlJLFlBQVE7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O0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3hLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4TkE7Ozs7Ozs7Ozs7OztBQ0FBO0FBQ0EsSUFBSSxLQUFLLFFBQVEsWUFBUixDQUFUOztBQUVBLFNBQVMsR0FBVCxDQUFhLENBQWIsRUFBZ0IsQ0FBaEIsRUFBbUI7QUFDZixX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IiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuLypcblxuRGF0YXNldCBydW4gb3JkZXJcbi0gYnVpbGRpbmdzICgzRClcbi0gdHJlZXMgKGZyb20gbXkgb3BlbnRyZWVzIGFjY291bnQpXG4tIGNhZmVzIChjaXR5IG9mIG1lbGJvdXJuZSwgc3R5bGVkIHdpdGggY29mZmVlIHN5bWJvbClcbi0gYmFycyAoc2ltaWxhcilcbi0gZ2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzXG4tIGRvZyB3YWxraW5nIHpvbmVzXG4tIENMVUUgKDNEIGJsb2Nrcylcbi0tIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzIHBlciBibG9ja1xuLS0tIHZhcmlvdXMgdHlwZXMsIHRoZW4gdG90YWxcbi0tIGVtcGxveW1lbnQgKHZhcmlvdXMgdHlwZXMgd2l0aCBzcGVjaWZpYyB2YW50YWdlIHBvaW50cyAtIGJld2FyZSB0aGF0IG5vdCBhbGwgZGF0YSBpbmNsdWRlZDsgdGhlbiB0b3RhbClcbi0tIGZsb29yIHVzZSAoZGl0dG8pXG5cblxuXG5cbk1pbmltdW1cbi0gZmxvYXR5IGNhbWVyYXNcbi0gY2x1ZSAzRCxcbi0gYmlrZSBzaGFyZSBzdGF0aW9uc1xuXG5IZWFkZXI6XG4tIGRhdGFzZXQgbmFtZVxuLSBjb2x1bW4gbmFtZVxuXG5Gb290ZXI6IGRhdGEubWVsYm91cm5lLnZpYy5nb3YuYXVcblxuQ29NIGxvZ29cblxuXG5NZWRpdW1cbi0gTXVuaWNpcGFsaXR5IGJvdW5kYXJ5IG92ZXJsYWlkXG5cblN0cmV0Y2ggZ29hbHNcbi0gb3ZlcmxheSBhIHRleHQgbGFiZWwgb24gYSBidWlsZGluZy9jbHVlYmxvY2sgKGVnLCBGcmVlbWFzb25zIEhvc3BpdGFsIC0gdG8gc2hvdyB3aHkgc28gbXVjaCBoZWFsdGhjYXJlKVxuXG5cblxuXG5cbiovXG5cbmltcG9ydCB7IFNvdXJjZURhdGEgfSBmcm9tICcuL3NvdXJjZURhdGEnO1xuXG5leHBvcnQgY29uc3QgZGF0YXNldHMgPSBbXG4gICAge1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ0Zvb2Qgc2VydmljZXMgYXZhaWxhYmxlIGZyZWUgb3IgbG93IGNvc3QgdG8gb3VyIGNvbW11bml0eScsXG4gICAgICAgIG5hbWU6ICdDb21tdW5pdHkgZm9vZCBzZXJ2aWNlcyB3aXRoIG9wZW5pbmcgaG91cnMsIHB1YmxpYyB0cmFuc3BvcnQgYW5kIHBhcmtpbmcgb3B0aW9ucycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdmb29kJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjd4dmswazNsJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQ29tbXVuaXR5X2Zvb2Rfc2VydmljZXNfd2l0aF8tYTdjajl2JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAncmdiKDI0OSwgMjQzLCAxNzgpJywgLy8gYSBjaXR5IGZvciBwZW9wbGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7TmFtZX0nLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMixcblxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NDkyMjUxNDM4MzA3LFwibGF0XCI6LTM3LjgwMzEwOTcyNzI3MjgxfSxcInpvb21cIjoxNS4zNTg1MDk3ODk3OTA4MDgsXCJiZWFyaW5nXCI6LTc4LjM5OTk5OTk5OTk5OTcsXCJwaXRjaFwiOjU4LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgaGVhbHRoIGFuZCB0eXBlIG9mIGVhY2ggdHJlZSBpbiBvdXIgdXJiYW4gZm9yZXN0JyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDIsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjZcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjE0Ny42NTIxOTM4MjM3MzEwNyxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBjYXB0aW9uOiAnSW5jbHVkaW5nIGd1bSB0cmVlcycsIC8vIGFkZCBhIG51bWJlclxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdndW10cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnRXVjYWx5cHR1cycsICdDb3J5bWJpYScsICdBbmdvcGhvcmEnIF1cblxuICAgICAgICB9LFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuODQ3Mzc0ODg2ODkwNyxcImxhdFwiOi0zNy44MTE3Nzk3NDA3ODcyNDR9LFwiem9vbVwiOjEzLjE2MjUyNDE1MDg0NzMxNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjE0Ny42NTIxOTM4MjM3MzEwNyxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDI3MzI1NjczMzMxLFwibGF0XCI6LTM3Ljc4NDQ0OTQwNTkzMDM4fSxcInpvb21cIjoxNC41LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIC8vZGF0YXNldExlYWQ6IDMwMDAsXG4gICAgICAgIGNhcHRpb246ICdBbmQgTWVsYm91cm5lXFwncyBmYW1vdXMgTG9uZG9uIHBsYW5lIHRyZWVzLicsIC8vIGFkZCBhIG51bWJlclxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdwbGFuZXRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAzLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgzNDAsIDk3JSw2NSUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1BsYXRhbnVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDM5NDYzMzgzODk2NSxcImxhdFwiOi0zNy43OTU4ODg3MDY2ODI3MX0sXCJ6b29tXCI6MTUuOTA1MTMwMzYxNDQ2NjY4LFwiYmVhcmluZ1wiOjE1Ny41OTk5OTk5OTk5OTc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTUzLFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjM5NH0sXCJ6b29tXCI6MTUsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTQ3ODUxMDAxNjIwMixcImxhdFwiOi0zNy43ODQzNDE0NzE2NzQ3N30sXCJ6b29tXCI6MTMuOTIyMjI4NDYxNzkzNjY5LFwiYmVhcmluZ1wiOjEyMi45OTQ3ODM0NjA0MzQ2LFwicGl0Y2hcIjo0Ny41MDAwMDAwMDAwMDAwM31cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1MzQzNDUwNzU1MTYsXCJsYXRcIjotMzcuODAxMzQxMTgwMTI1MjJ9LFwiem9vbVwiOjE1LFwiYmVhcmluZ1wiOjE1MS4wMDA3MzA0ODgyNzMzOCxcInBpdGNoXCI6NTguOTk5OTk5OTk5OTk5OTl9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTYxMzg4NDg4NDA5LFwibGF0XCI6LTM3LjgwOTAyNzEwNTMxNjMyfSxcInpvb21cIjoxNC4yNDE3NTcwMzA4MTY2MzYsXCJiZWFyaW5nXCI6LTE2My4zMTAyMjI0NDI2Njc0LFwicGl0Y2hcIjozNS41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgXG4gICAgICAgIGNvbHVtbjogJ1RvdGFsIGVtcGxveW1lbnQgaW4gYmxvY2snICxcbiAgICAgICAgY2FwdGlvbjogJ1RoZSBDZW5zdXMgb2YgTGFuZCBVc2UgYW5kIEVtcGxveW1lbnQgKENMVUUpIHJldmVhbHMgd2hlcmUgZW1wbG95bWVudCBpcyBjb25jZW50cmF0ZWQnLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNjcyNTMxNDc4NTcsXCJsYXRcIjotMzcuODA0Mzg1OTQ5Mjc2NDk0fSxcInpvb21cIjoxMy44ODYyODczMjAxNTk4MSxcImJlYXJpbmdcIjoxMTkuNzg4Njg2ODI4ODIzNzQsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU5ODUzMzQ1NjIxNCxcImxhdFwiOi0zNy44MzU4MTkxNjI0MzY2MX0sXCJ6b29tXCI6MTMuNjQ5MTE2NjE0ODcyODM2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuICAgIH0sXG5cbiAgICAvKntcbiAgICAgICAgZGVsYXk6MTIwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGVyZSB0aGUgQ291bmNpbFxcJ3Mgc2lnbmlmaWNhbnQgcHJvcGVydHkgaG9sZGluZ3MgYXJlIGxvY2F0ZWQuJyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2Z0aGktemFqeScpLFxuICAgICAgICBjb2x1bW46ICdPd25lcnNoaXAgb3IgQ29udHJvbCcsXG4gICAgICAgIHNob3dMZWdlbmQ6IHRydWUsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzOTAzMDg3MjM4NDYsXCJsYXRcIjotMzcuODE4NjMxNjYwODEwNDI1fSxcInpvb21cIjoxMy41LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjQ1fVxuXG4gICAgfSxcbiAgICAqL1xuICAgICBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdUcmFuc3BvcnQsIFBvc3RhbCBhbmQgU3RvcmFnZScgLFxuICAgICAgICBjYXB0aW9uOiAnLi4ud2hlcmUgdGhlIHRyYW5zcG9ydCwgcG9zdGFsIGFuZCBzdG9yYWdlIHNlY3RvciBpcyBjb25jZW50cmF0ZWQuJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Mjc2ODE3NjcxMDcxMixcImxhdFwiOi0zNy44MjkyMTgyNDg1ODcyNDZ9LFwiem9vbVwiOjEyLjcyODQzMTIxNzkxNDkxOSxcImJlYXJpbmdcIjo2OC43MDM4ODMxMjE4NzQ1OCxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIFxuICAgICAgICBjb2x1bW46ICdIZWFsdGggQ2FyZSBhbmQgU29jaWFsIEFzc2lzdGFuY2UnICxcbiAgICAgICAgY2FwdGlvbjogJ2FuZCB3aGVyZSB0aGUgaGVhbHRoY2FyZSBhbmQgc29jaWFsIGFzc2lzdGFuY2Ugb3JnYW5pc2F0aW9ucyBhcmUgYmFzZWQuJyxcbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NzIzMzExMjE4NTMsXCJsYXRcIjotMzcuODI3MDYzNzQ3NjM4MjR9LFwiem9vbVwiOjEzLjA2Mzc1NzM4NjIzMjI0MixcImJlYXJpbmdcIjoyNi4zNzQ3ODY5MTg1MjMzNCxcInBpdGNoXCI6NjB9XG4gICAgfSxcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGxpbmdlcjoxMDAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUExJRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnRGV2ZWxvcG1lbnQgQWN0aXZpdHkgTW9uaXRvciB0cmFja3MgbWFqb3IgcHJvamVjdHMgaW4gdGhlIHBsYW5uaW5nIHN0YWdlJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA1MDAwLFxuICAgICAgICBsaW5nZXI6NTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdVTkRFUiBDT05TVFJVQ1RJT04nIF0sIFxuICAgICAgICBjYXB0aW9uOiAnLi4udW5kZXIgY29uc3RydWN0aW9uJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogNTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdDT01QTEVURUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnLi4uYW5kIHRob3NlIGFscmVhZHkgY29tcGxldGVkLicsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNTQzNzk3NzUzMzUsXCJsYXRcIjotMzcuODI1OTUzMDY2NDY0NzZ9LFwiem9vbVwiOjE0LjY2NTQzNzM3NTc0MDQyNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo1OS41fVxuXG4gICAgfSwgXG4gICAgXG5cblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBsaW5nZXI6IDUwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGVyZSB5b3UgY2FuIHdhbGsgeW91ciBkb2cgb2ZmIHRoZSBsZWFzaCcsXG4gICAgICAgIG5hbWU6ICdkb2d6b25lcy1vZmZsZWFzaCcsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICcyJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS5jbHphcDJqZScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0RvZ19XYWxraW5nX1pvbmVzLTNmaDlxNCcsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWNvbG9yJzogJ2hzbCgzNDAsIDk3JSw2NSUpJywgLy9oc2woMzQwLCA5NyUsIDQ1JSlcbiAgICAgICAgICAgICAgICAnZmlsbC1vcGFjaXR5JzogMC44XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsdGVyOiBbJz09JywgJ3N0YXR1cycsICdvZmZsZWFzaCddXG4gICAgICAgIH0sXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODYxMzk4NzczMjkzMixcImxhdFwiOi0zNy44Mzg4ODI2NjU5NjE4N30sXCJ6b29tXCI6MTUuMDk2NDE5NTc5NDMyODc4LFwiYmVhcmluZ1wiOi0zMCxcInBpdGNoXCI6NTcuNDk5OTk5OTk5OTk5OTl9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgbmFtZTogJ1N0cmVldCBhZGRyZXNzZXMnLFxuICAgICAgICBjYXB0aW9uOiAnRXZlcnkgc2luZ2xlIHN0cmVldCBhZGRyZXNzIGluIHRoZSBtdW5pY2lwYWxpdHknLFxuICAgICAgICAvLyBuZWVkIHRvIHpvb20gaW4gY2xvc2Ugb24gdGhpcyBvbmVcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FkZHJlc3NlcycsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1N0cmVldF9hZGRyZXNzZXMtOTdlNW9uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3N0cmVldF9ub30nLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy9tYXBib3hwb2ludHM6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuM2lwM2NvdW8nLy8nU3RyZWV0X2FkZHJlc3Nlcy05N2U1b24nLFxuICAgICAgICAvLyBub3J0aCBtZWxib3VybmVcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkxNjg2MjIwNzE0MzY1LFwibGF0XCI6LTM3Ljc5MzMwMjEwMjg3MjY3fSxcInpvb21cIjoxOC4wOTgwMzU0NjYxMzM0NTcsXCJiZWFyaW5nXCI6NjQuNzk5OTk5OTk5OTk5NjEsXCJwaXRjaFwiOjQ1fVxuICAgICAgICAvLyBzb3V0aCB5YXJyYS9wcmFocmFuIGlzaFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NDc5MDQ1MTg1NixcImxhdFwiOi0zNy44MzM5MTgzMTE4MjkwMX0sXCJ6b29tXCI6MTgsXCJiZWFyaW5nXCI6LTM5Ljk5OTk5OTk5OTk5OTQ5LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBuYW1lOiAnUHJvcGVydHkgYm91bmRhcmllcycsXG4gICAgICAgIGNhcHRpb246ICdBbmQgcHJvcGVydHkgYm91bmRhcnknLFxuICAgICAgICAvLyBuZWVkIHRvIHpvb20gaW4gY2xvc2Ugb24gdGhpcyBvbmVcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2JvdW5kYXJpZXMnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IDJcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIC8vbWFwYm94cG9pbnRzOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjNpcDNjb3VvJy8vJ1N0cmVldF9hZGRyZXNzZXMtOTdlNW9uJyxcbiAgICAgICAgLy8gbm9ydGggbWVsYm91cm5lXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MTY4NjIyMDcxNDM2NSxcImxhdFwiOi0zNy43OTMzMDIxMDI4NzI2N30sXCJ6b29tXCI6MTguMDk4MDM1NDY2MTMzNDU3LFwiYmVhcmluZ1wiOjY0Ljc5OTk5OTk5OTk5OTYxLFwicGl0Y2hcIjo0NX1cbiAgICAgICAgLy8gc291dGggeWFycmEvcHJhaHJhbiBpc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ3OTA0NTE4NTYsXCJsYXRcIjotMzcuODMzOTE4MzExODI5MDF9LFwiem9vbVwiOjE2LjE5MjQyMzM2NjkwODYzLFwiYmVhcmluZ1wiOi0zOS45OTk5OTk5OTk5OTk0OSxcInBpdGNoXCI6NjB9XG4gICAgfSxcbiAgICB7IFxuICAgICAgICBuYW1lOiAnTWVsYm91cm5lIEJpa2UgU2hhcmUgc3RhdGlvbnMsIHdpdGggY3VycmVudCBudW1iZXIgb2YgZnJlZSBhbmQgdXNlZCBkb2NrcyAoZXZlcnkgMTUgbWludXRlcyknLFxuICAgICAgICBjYXB0aW9uOiAnSG93IG1hbnkgXCJCbHVlIEJpa2VzXCIgYXJlIHJlYWR5IGluIGVhY2ggc3RhdGlvbi4nLFxuICAgICAgICBjb2x1bW46ICdOQkJpa2VzJyxcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3RkdmgtbjlkdicpICxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Nzc2ODQxNDU2Mjg4NyxcImxhdFwiOi0zNy44MTk5ODk0ODM3MjgzOX0sXCJ6b29tXCI6MTQuNjcwMjIxNjc2MjM4NTA3LFwiYmVhcmluZ1wiOi01Ny45MzIzMDI1MTczNjExNyxcInBpdGNoXCI6NjB9XG4gICAgfSwgLy8gYmlrZSBzaGFyZVxuICAgIHtcbiAgICAgICAgZGVsYXk6MTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgc2t5bGluZSBvZiBvdXIgY2l0eScsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdidWlsZGluZ3MnLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4wNTJ3Zmg5eScsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ0J1aWxkaW5nX291dGxpbmVzLTBtbTdheicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAyMCUpJyxcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuNixcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0Jzoge1xuICAgICAgICAgICAgICAgICAgICAncHJvcGVydHknOidoZWlnaHQnLFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnaWRlbnRpdHknXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0sXG4gICAgICAgIC8vIGZyb20gYWJib3RzZm9yZGlzaFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcyNTEzNTAzMjc2NCxcImxhdFwiOi0zNy44MDc0MTUyMDkwNTEyODV9LFwiem9vbVwiOjE0Ljg5NjI1OTE1MzAxMjI0MyxcImJlYXJpbmdcIjotMTA2LjQwMDAwMDAwMDAwMDE1LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mcm9tIHNvdXRoXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDcwMTQwNzUzNDQ1LFwibGF0XCI6LTM3LjgxNTIwMDYyNzI2NjY2fSxcInpvb21cIjoxNS40NTg3ODQ5MzAyMzg2NzIsXCJiZWFyaW5nXCI6OTguMzk5OTk5OTk5OTk5ODgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdFdmVyeSBjYWZlIGFuZCByZXN0YXVyYW50JyxcbiAgICAgICAgbmFtZTogJ0NhZmVzIGFuZCBSZXN0YXVyYW50cyBvbmx5JyxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwOTg3ODk5OTI5NjQsXCJsYXRcIjotMzcuODEwMjEzMTA0MDQ3NDl9LFwiem9vbVwiOjE2LjAyNzczMjMzMjAxNjk5LFwiYmVhcmluZ1wiOi0xMzUuMjE5NzUzMDg2NDE5ODEsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczoge1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ2NhZmUtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXTtcbmV4cG9ydCBjb25zdCBkYXRhc2V0czIgPSBbXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUExJRUQnIF0sIFxuICAgICAgICBjYXB0aW9uOiAnTWFqb3IgZGV2ZWxvcG1lbnQgcHJvamVjdCBhcHBsaWNhdGlvbnMnLFxuXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ0FQUFJPVkVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIGFwcHJvdmVkJyBcbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogMTAwMDAsIFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnZ2g3cy1xZGE4JyksIFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnVU5ERVIgQ09OU1RSVUNUSU9OJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3RzIHVuZGVyIGNvbnN0cnVjdGlvbicgXG4gICAgfSwgXG4gICAgeyBkZWxheTogNTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3RkdmgtbjlkdicpIH0sIC8vIGJpa2Ugc2hhcmVcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0FjY29tbW9kYXRpb24nIH0sXG4gICAgeyBkZWxheTogMTAwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdiMzZqLWtpeTQnKSwgY29sdW1uOiAnQXJ0cyBhbmQgUmVjcmVhdGlvbiBTZXJ2aWNlcycgfSxcbiAgICAvL3sgZGVsYXk6IDMwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnUmV0YWlsIFRyYWRlJyB9LFxuICAgIHsgZGVsYXk6IDkwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgY29sdW1uOiAnQ29uc3RydWN0aW9uJyB9XG4gICAgLy97IGRlbGF5OiAxMDAwLCBkYXRhc2V0OiAnYjM2ai1raXk0JyB9LFxuICAgIC8veyBkZWxheTogMjAwMCwgZGF0YXNldDogJzIzNHEtZ2c4MycgfVxuXTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtY29sbGVjdGlvbi8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcHJlZml4ID0gXCIkXCI7XG5cbmZ1bmN0aW9uIE1hcCgpIHt9XG5cbk1hcC5wcm90b3R5cGUgPSBtYXAucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogTWFwLFxuICBoYXM6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiAocHJlZml4ICsga2V5KSBpbiB0aGlzO1xuICB9LFxuICBnZXQ6IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiB0aGlzW3ByZWZpeCArIGtleV07XG4gIH0sXG4gIHNldDogZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHRoaXNbcHJlZml4ICsga2V5XSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBwcm9wZXJ0eSA9IHByZWZpeCArIGtleTtcbiAgICByZXR1cm4gcHJvcGVydHkgaW4gdGhpcyAmJiBkZWxldGUgdGhpc1twcm9wZXJ0eV07XG4gIH0sXG4gIGNsZWFyOiBmdW5jdGlvbigpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBrZXlzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBrZXlzLnB1c2gocHJvcGVydHkuc2xpY2UoMSkpO1xuICAgIHJldHVybiBrZXlzO1xuICB9LFxuICB2YWx1ZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciB2YWx1ZXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgdmFsdWVzLnB1c2godGhpc1twcm9wZXJ0eV0pO1xuICAgIHJldHVybiB2YWx1ZXM7XG4gIH0sXG4gIGVudHJpZXM6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBlbnRyaWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGVudHJpZXMucHVzaCh7a2V5OiBwcm9wZXJ0eS5zbGljZSgxKSwgdmFsdWU6IHRoaXNbcHJvcGVydHldfSk7XG4gICAgcmV0dXJuIGVudHJpZXM7XG4gIH0sXG4gIHNpemU6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBzaXplID0gMDtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgKytzaXplO1xuICAgIHJldHVybiBzaXplO1xuICB9LFxuICBlbXB0eTogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHJldHVybiBmYWxzZTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfSxcbiAgZWFjaDogZnVuY3Rpb24oZikge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBmKHRoaXNbcHJvcGVydHldLCBwcm9wZXJ0eS5zbGljZSgxKSwgdGhpcyk7XG4gIH1cbn07XG5cbmZ1bmN0aW9uIG1hcChvYmplY3QsIGYpIHtcbiAgdmFyIG1hcCA9IG5ldyBNYXA7XG5cbiAgLy8gQ29weSBjb25zdHJ1Y3Rvci5cbiAgaWYgKG9iamVjdCBpbnN0YW5jZW9mIE1hcCkgb2JqZWN0LmVhY2goZnVuY3Rpb24odmFsdWUsIGtleSkgeyBtYXAuc2V0KGtleSwgdmFsdWUpOyB9KTtcblxuICAvLyBJbmRleCBhcnJheSBieSBudW1lcmljIGluZGV4IG9yIHNwZWNpZmllZCBrZXkgZnVuY3Rpb24uXG4gIGVsc2UgaWYgKEFycmF5LmlzQXJyYXkob2JqZWN0KSkge1xuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBvYmplY3QubGVuZ3RoLFxuICAgICAgICBvO1xuXG4gICAgaWYgKGYgPT0gbnVsbCkgd2hpbGUgKCsraSA8IG4pIG1hcC5zZXQoaSwgb2JqZWN0W2ldKTtcbiAgICBlbHNlIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGYobyA9IG9iamVjdFtpXSwgaSwgb2JqZWN0KSwgbyk7XG4gIH1cblxuICAvLyBDb252ZXJ0IG9iamVjdCB0byBtYXAuXG4gIGVsc2UgaWYgKG9iamVjdCkgZm9yICh2YXIga2V5IGluIG9iamVjdCkgbWFwLnNldChrZXksIG9iamVjdFtrZXldKTtcblxuICByZXR1cm4gbWFwO1xufVxuXG52YXIgbmVzdCA9IGZ1bmN0aW9uKCkge1xuICB2YXIga2V5cyA9IFtdLFxuICAgICAgc29ydEtleXMgPSBbXSxcbiAgICAgIHNvcnRWYWx1ZXMsXG4gICAgICByb2xsdXAsXG4gICAgICBuZXN0O1xuXG4gIGZ1bmN0aW9uIGFwcGx5KGFycmF5LCBkZXB0aCwgY3JlYXRlUmVzdWx0LCBzZXRSZXN1bHQpIHtcbiAgICBpZiAoZGVwdGggPj0ga2V5cy5sZW5ndGgpIHJldHVybiByb2xsdXAgIT0gbnVsbFxuICAgICAgICA/IHJvbGx1cChhcnJheSkgOiAoc29ydFZhbHVlcyAhPSBudWxsXG4gICAgICAgID8gYXJyYXkuc29ydChzb3J0VmFsdWVzKVxuICAgICAgICA6IGFycmF5KTtcblxuICAgIHZhciBpID0gLTEsXG4gICAgICAgIG4gPSBhcnJheS5sZW5ndGgsXG4gICAgICAgIGtleSA9IGtleXNbZGVwdGgrK10sXG4gICAgICAgIGtleVZhbHVlLFxuICAgICAgICB2YWx1ZSxcbiAgICAgICAgdmFsdWVzQnlLZXkgPSBtYXAoKSxcbiAgICAgICAgdmFsdWVzLFxuICAgICAgICByZXN1bHQgPSBjcmVhdGVSZXN1bHQoKTtcblxuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodmFsdWVzID0gdmFsdWVzQnlLZXkuZ2V0KGtleVZhbHVlID0ga2V5KHZhbHVlID0gYXJyYXlbaV0pICsgXCJcIikpIHtcbiAgICAgICAgdmFsdWVzLnB1c2godmFsdWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdmFsdWVzQnlLZXkuc2V0KGtleVZhbHVlLCBbdmFsdWVdKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB2YWx1ZXNCeUtleS5lYWNoKGZ1bmN0aW9uKHZhbHVlcywga2V5KSB7XG4gICAgICBzZXRSZXN1bHQocmVzdWx0LCBrZXksIGFwcGx5KHZhbHVlcywgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9XG5cbiAgZnVuY3Rpb24gZW50cmllcyhtYXAkJDEsIGRlcHRoKSB7XG4gICAgaWYgKCsrZGVwdGggPiBrZXlzLmxlbmd0aCkgcmV0dXJuIG1hcCQkMTtcbiAgICB2YXIgYXJyYXksIHNvcnRLZXkgPSBzb3J0S2V5c1tkZXB0aCAtIDFdO1xuICAgIGlmIChyb2xsdXAgIT0gbnVsbCAmJiBkZXB0aCA+PSBrZXlzLmxlbmd0aCkgYXJyYXkgPSBtYXAkJDEuZW50cmllcygpO1xuICAgIGVsc2UgYXJyYXkgPSBbXSwgbWFwJCQxLmVhY2goZnVuY3Rpb24odiwgaykgeyBhcnJheS5wdXNoKHtrZXk6IGssIHZhbHVlczogZW50cmllcyh2LCBkZXB0aCl9KTsgfSk7XG4gICAgcmV0dXJuIHNvcnRLZXkgIT0gbnVsbCA/IGFycmF5LnNvcnQoZnVuY3Rpb24oYSwgYikgeyByZXR1cm4gc29ydEtleShhLmtleSwgYi5rZXkpOyB9KSA6IGFycmF5O1xuICB9XG5cbiAgcmV0dXJuIG5lc3QgPSB7XG4gICAgb2JqZWN0OiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU9iamVjdCwgc2V0T2JqZWN0KTsgfSxcbiAgICBtYXA6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApOyB9LFxuICAgIGVudHJpZXM6IGZ1bmN0aW9uKGFycmF5KSB7IHJldHVybiBlbnRyaWVzKGFwcGx5KGFycmF5LCAwLCBjcmVhdGVNYXAsIHNldE1hcCksIDApOyB9LFxuICAgIGtleTogZnVuY3Rpb24oZCkgeyBrZXlzLnB1c2goZCk7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRLZXlzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0S2V5c1trZXlzLmxlbmd0aCAtIDFdID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHNvcnRWYWx1ZXM6IGZ1bmN0aW9uKG9yZGVyKSB7IHNvcnRWYWx1ZXMgPSBvcmRlcjsgcmV0dXJuIG5lc3Q7IH0sXG4gICAgcm9sbHVwOiBmdW5jdGlvbihmKSB7IHJvbGx1cCA9IGY7IHJldHVybiBuZXN0OyB9XG4gIH07XG59O1xuXG5mdW5jdGlvbiBjcmVhdGVPYmplY3QoKSB7XG4gIHJldHVybiB7fTtcbn1cblxuZnVuY3Rpb24gc2V0T2JqZWN0KG9iamVjdCwga2V5LCB2YWx1ZSkge1xuICBvYmplY3Rba2V5XSA9IHZhbHVlO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVNYXAoKSB7XG4gIHJldHVybiBtYXAoKTtcbn1cblxuZnVuY3Rpb24gc2V0TWFwKG1hcCQkMSwga2V5LCB2YWx1ZSkge1xuICBtYXAkJDEuc2V0KGtleSwgdmFsdWUpO1xufVxuXG5mdW5jdGlvbiBTZXQoKSB7fVxuXG52YXIgcHJvdG8gPSBtYXAucHJvdG90eXBlO1xuXG5TZXQucHJvdG90eXBlID0gc2V0LnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IFNldCxcbiAgaGFzOiBwcm90by5oYXMsXG4gIGFkZDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICB2YWx1ZSArPSBcIlwiO1xuICAgIHRoaXNbcHJlZml4ICsgdmFsdWVdID0gdmFsdWU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIHJlbW92ZTogcHJvdG8ucmVtb3ZlLFxuICBjbGVhcjogcHJvdG8uY2xlYXIsXG4gIHZhbHVlczogcHJvdG8ua2V5cyxcbiAgc2l6ZTogcHJvdG8uc2l6ZSxcbiAgZW1wdHk6IHByb3RvLmVtcHR5LFxuICBlYWNoOiBwcm90by5lYWNoXG59O1xuXG5mdW5jdGlvbiBzZXQob2JqZWN0LCBmKSB7XG4gIHZhciBzZXQgPSBuZXcgU2V0O1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBTZXQpIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlKSB7IHNldC5hZGQodmFsdWUpOyB9KTtcblxuICAvLyBPdGhlcndpc2UsIGFzc3VtZSBpdOKAmXMgYW4gYXJyYXkuXG4gIGVsc2UgaWYgKG9iamVjdCkge1xuICAgIHZhciBpID0gLTEsIG4gPSBvYmplY3QubGVuZ3RoO1xuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBzZXQuYWRkKG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChmKG9iamVjdFtpXSwgaSwgb2JqZWN0KSk7XG4gIH1cblxuICByZXR1cm4gc2V0O1xufVxuXG52YXIga2V5cyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIga2V5cyA9IFtdO1xuICBmb3IgKHZhciBrZXkgaW4gbWFwKSBrZXlzLnB1c2goa2V5KTtcbiAgcmV0dXJuIGtleXM7XG59O1xuXG52YXIgdmFsdWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciB2YWx1ZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgdmFsdWVzLnB1c2gobWFwW2tleV0pO1xuICByZXR1cm4gdmFsdWVzO1xufTtcblxudmFyIGVudHJpZXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGVudHJpZXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkgZW50cmllcy5wdXNoKHtrZXk6IGtleSwgdmFsdWU6IG1hcFtrZXldfSk7XG4gIHJldHVybiBlbnRyaWVzO1xufTtcblxuZXhwb3J0cy5uZXN0ID0gbmVzdDtcbmV4cG9ydHMuc2V0ID0gc2V0O1xuZXhwb3J0cy5tYXAgPSBtYXA7XG5leHBvcnRzLmtleXMgPSBrZXlzO1xuZXhwb3J0cy52YWx1ZXMgPSB2YWx1ZXM7XG5leHBvcnRzLmVudHJpZXMgPSBlbnRyaWVzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kaXNwYXRjaC8gVmVyc2lvbiAxLjAuMi4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgbm9vcCA9IHt2YWx1ZTogZnVuY3Rpb24oKSB7fX07XG5cbmZ1bmN0aW9uIGRpc3BhdGNoKCkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IGFyZ3VtZW50cy5sZW5ndGgsIF8gPSB7fSwgdDsgaSA8IG47ICsraSkge1xuICAgIGlmICghKHQgPSBhcmd1bWVudHNbaV0gKyBcIlwiKSB8fCAodCBpbiBfKSkgdGhyb3cgbmV3IEVycm9yKFwiaWxsZWdhbCB0eXBlOiBcIiArIHQpO1xuICAgIF9bdF0gPSBbXTtcbiAgfVxuICByZXR1cm4gbmV3IERpc3BhdGNoKF8pO1xufVxuXG5mdW5jdGlvbiBEaXNwYXRjaChfKSB7XG4gIHRoaXMuXyA9IF87XG59XG5cbmZ1bmN0aW9uIHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lcywgdHlwZXMpIHtcbiAgcmV0dXJuIHR5cGVuYW1lcy50cmltKCkuc3BsaXQoL158XFxzKy8pLm1hcChmdW5jdGlvbih0KSB7XG4gICAgdmFyIG5hbWUgPSBcIlwiLCBpID0gdC5pbmRleE9mKFwiLlwiKTtcbiAgICBpZiAoaSA+PSAwKSBuYW1lID0gdC5zbGljZShpICsgMSksIHQgPSB0LnNsaWNlKDAsIGkpO1xuICAgIGlmICh0ICYmICF0eXBlcy5oYXNPd25Qcm9wZXJ0eSh0KSkgdGhyb3cgbmV3IEVycm9yKFwidW5rbm93biB0eXBlOiBcIiArIHQpO1xuICAgIHJldHVybiB7dHlwZTogdCwgbmFtZTogbmFtZX07XG4gIH0pO1xufVxuXG5EaXNwYXRjaC5wcm90b3R5cGUgPSBkaXNwYXRjaC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBEaXNwYXRjaCxcbiAgb246IGZ1bmN0aW9uKHR5cGVuYW1lLCBjYWxsYmFjaykge1xuICAgIHZhciBfID0gdGhpcy5fLFxuICAgICAgICBUID0gcGFyc2VUeXBlbmFtZXModHlwZW5hbWUgKyBcIlwiLCBfKSxcbiAgICAgICAgdCxcbiAgICAgICAgaSA9IC0xLFxuICAgICAgICBuID0gVC5sZW5ndGg7XG5cbiAgICAvLyBJZiBubyBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZXR1cm4gdGhlIGNhbGxiYWNrIG9mIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikge1xuICAgICAgd2hpbGUgKCsraSA8IG4pIGlmICgodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpICYmICh0ID0gZ2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUpKSkgcmV0dXJuIHQ7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gSWYgYSB0eXBlIHdhcyBzcGVjaWZpZWQsIHNldCB0aGUgY2FsbGJhY2sgZm9yIHRoZSBnaXZlbiB0eXBlIGFuZCBuYW1lLlxuICAgIC8vIE90aGVyd2lzZSwgaWYgYSBudWxsIGNhbGxiYWNrIHdhcyBzcGVjaWZpZWQsIHJlbW92ZSBjYWxsYmFja3Mgb2YgdGhlIGdpdmVuIG5hbWUuXG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwgJiYgdHlwZW9mIGNhbGxiYWNrICE9PSBcImZ1bmN0aW9uXCIpIHRocm93IG5ldyBFcnJvcihcImludmFsaWQgY2FsbGJhY2s6IFwiICsgY2FsbGJhY2spO1xuICAgIHdoaWxlICgrK2kgPCBuKSB7XG4gICAgICBpZiAodCA9ICh0eXBlbmFtZSA9IFRbaV0pLnR5cGUpIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgY2FsbGJhY2spO1xuICAgICAgZWxzZSBpZiAoY2FsbGJhY2sgPT0gbnVsbCkgZm9yICh0IGluIF8pIF9bdF0gPSBzZXQoX1t0XSwgdHlwZW5hbWUubmFtZSwgbnVsbCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRoaXM7XG4gIH0sXG4gIGNvcHk6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjb3B5ID0ge30sIF8gPSB0aGlzLl87XG4gICAgZm9yICh2YXIgdCBpbiBfKSBjb3B5W3RdID0gX1t0XS5zbGljZSgpO1xuICAgIHJldHVybiBuZXcgRGlzcGF0Y2goY29weSk7XG4gIH0sXG4gIGNhbGw6IGZ1bmN0aW9uKHR5cGUsIHRoYXQpIHtcbiAgICBpZiAoKG4gPSBhcmd1bWVudHMubGVuZ3RoIC0gMikgPiAwKSBmb3IgKHZhciBhcmdzID0gbmV3IEFycmF5KG4pLCBpID0gMCwgbiwgdDsgaSA8IG47ICsraSkgYXJnc1tpXSA9IGFyZ3VtZW50c1tpICsgMl07XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHQgPSB0aGlzLl9bdHlwZV0sIGkgPSAwLCBuID0gdC5sZW5ndGg7IGkgPCBuOyArK2kpIHRbaV0udmFsdWUuYXBwbHkodGhhdCwgYXJncyk7XG4gIH0sXG4gIGFwcGx5OiBmdW5jdGlvbih0eXBlLCB0aGF0LCBhcmdzKSB7XG4gICAgaWYgKCF0aGlzLl8uaGFzT3duUHJvcGVydHkodHlwZSkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0eXBlKTtcbiAgICBmb3IgKHZhciB0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBnZXQodHlwZSwgbmFtZSkge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoLCBjOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKChjID0gdHlwZVtpXSkubmFtZSA9PT0gbmFtZSkge1xuICAgICAgcmV0dXJuIGMudmFsdWU7XG4gICAgfVxuICB9XG59XG5cbmZ1bmN0aW9uIHNldCh0eXBlLCBuYW1lLCBjYWxsYmFjaykge1xuICBmb3IgKHZhciBpID0gMCwgbiA9IHR5cGUubGVuZ3RoOyBpIDwgbjsgKytpKSB7XG4gICAgaWYgKHR5cGVbaV0ubmFtZSA9PT0gbmFtZSkge1xuICAgICAgdHlwZVtpXSA9IG5vb3AsIHR5cGUgPSB0eXBlLnNsaWNlKDAsIGkpLmNvbmNhdCh0eXBlLnNsaWNlKGkgKyAxKSk7XG4gICAgICBicmVhaztcbiAgICB9XG4gIH1cbiAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHR5cGUucHVzaCh7bmFtZTogbmFtZSwgdmFsdWU6IGNhbGxiYWNrfSk7XG4gIHJldHVybiB0eXBlO1xufVxuXG5leHBvcnRzLmRpc3BhdGNoID0gZGlzcGF0Y2g7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWRzdi8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMpIHsgJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBvYmplY3RDb252ZXJ0ZXIoY29sdW1ucykge1xuICByZXR1cm4gbmV3IEZ1bmN0aW9uKFwiZFwiLCBcInJldHVybiB7XCIgKyBjb2x1bW5zLm1hcChmdW5jdGlvbihuYW1lLCBpKSB7XG4gICAgcmV0dXJuIEpTT04uc3RyaW5naWZ5KG5hbWUpICsgXCI6IGRbXCIgKyBpICsgXCJdXCI7XG4gIH0pLmpvaW4oXCIsXCIpICsgXCJ9XCIpO1xufVxuXG5mdW5jdGlvbiBjdXN0b21Db252ZXJ0ZXIoY29sdW1ucywgZikge1xuICB2YXIgb2JqZWN0ID0gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpO1xuICByZXR1cm4gZnVuY3Rpb24ocm93LCBpKSB7XG4gICAgcmV0dXJuIGYob2JqZWN0KHJvdyksIGksIGNvbHVtbnMpO1xuICB9O1xufVxuXG4vLyBDb21wdXRlIHVuaXF1ZSBjb2x1bW5zIGluIG9yZGVyIG9mIGRpc2NvdmVyeS5cbmZ1bmN0aW9uIGluZmVyQ29sdW1ucyhyb3dzKSB7XG4gIHZhciBjb2x1bW5TZXQgPSBPYmplY3QuY3JlYXRlKG51bGwpLFxuICAgICAgY29sdW1ucyA9IFtdO1xuXG4gIHJvd3MuZm9yRWFjaChmdW5jdGlvbihyb3cpIHtcbiAgICBmb3IgKHZhciBjb2x1bW4gaW4gcm93KSB7XG4gICAgICBpZiAoIShjb2x1bW4gaW4gY29sdW1uU2V0KSkge1xuICAgICAgICBjb2x1bW5zLnB1c2goY29sdW1uU2V0W2NvbHVtbl0gPSBjb2x1bW4pO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNvbHVtbnM7XG59XG5cbmZ1bmN0aW9uIGRzdihkZWxpbWl0ZXIpIHtcbiAgdmFyIHJlRm9ybWF0ID0gbmV3IFJlZ0V4cChcIltcXFwiXCIgKyBkZWxpbWl0ZXIgKyBcIlxcbl1cIiksXG4gICAgICBkZWxpbWl0ZXJDb2RlID0gZGVsaW1pdGVyLmNoYXJDb2RlQXQoMCk7XG5cbiAgZnVuY3Rpb24gcGFyc2UodGV4dCwgZikge1xuICAgIHZhciBjb252ZXJ0LCBjb2x1bW5zLCByb3dzID0gcGFyc2VSb3dzKHRleHQsIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgICAgaWYgKGNvbnZlcnQpIHJldHVybiBjb252ZXJ0KHJvdywgaSAtIDEpO1xuICAgICAgY29sdW1ucyA9IHJvdywgY29udmVydCA9IGYgPyBjdXN0b21Db252ZXJ0ZXIocm93LCBmKSA6IG9iamVjdENvbnZlcnRlcihyb3cpO1xuICAgIH0pO1xuICAgIHJvd3MuY29sdW1ucyA9IGNvbHVtbnM7XG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBwYXJzZVJvd3ModGV4dCwgZikge1xuICAgIHZhciBFT0wgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1saW5lXG4gICAgICAgIEVPRiA9IHt9LCAvLyBzZW50aW5lbCB2YWx1ZSBmb3IgZW5kLW9mLWZpbGVcbiAgICAgICAgcm93cyA9IFtdLCAvLyBvdXRwdXQgcm93c1xuICAgICAgICBOID0gdGV4dC5sZW5ndGgsXG4gICAgICAgIEkgPSAwLCAvLyBjdXJyZW50IGNoYXJhY3RlciBpbmRleFxuICAgICAgICBuID0gMCwgLy8gdGhlIGN1cnJlbnQgbGluZSBudW1iZXJcbiAgICAgICAgdCwgLy8gdGhlIGN1cnJlbnQgdG9rZW5cbiAgICAgICAgZW9sOyAvLyBpcyB0aGUgY3VycmVudCB0b2tlbiBmb2xsb3dlZCBieSBFT0w/XG5cbiAgICBmdW5jdGlvbiB0b2tlbigpIHtcbiAgICAgIGlmIChJID49IE4pIHJldHVybiBFT0Y7IC8vIHNwZWNpYWwgY2FzZTogZW5kIG9mIGZpbGVcbiAgICAgIGlmIChlb2wpIHJldHVybiBlb2wgPSBmYWxzZSwgRU9MOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBsaW5lXG5cbiAgICAgIC8vIHNwZWNpYWwgY2FzZTogcXVvdGVzXG4gICAgICB2YXIgaiA9IEksIGM7XG4gICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGopID09PSAzNCkge1xuICAgICAgICB2YXIgaSA9IGo7XG4gICAgICAgIHdoaWxlIChpKysgPCBOKSB7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpKSA9PT0gMzQpIHtcbiAgICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDEpICE9PSAzNCkgYnJlYWs7XG4gICAgICAgICAgICArK2k7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEkgPSBpICsgMjtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChpICsgMSk7XG4gICAgICAgIGlmIChjID09PSAxMykge1xuICAgICAgICAgIGVvbCA9IHRydWU7XG4gICAgICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChpICsgMikgPT09IDEwKSArK0k7XG4gICAgICAgIH0gZWxzZSBpZiAoYyA9PT0gMTApIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGogKyAxLCBpKS5yZXBsYWNlKC9cIlwiL2csIFwiXFxcIlwiKTtcbiAgICAgIH1cblxuICAgICAgLy8gY29tbW9uIGNhc2U6IGZpbmQgbmV4dCBkZWxpbWl0ZXIgb3IgbmV3bGluZVxuICAgICAgd2hpbGUgKEkgPCBOKSB7XG4gICAgICAgIHZhciBrID0gMTtcbiAgICAgICAgYyA9IHRleHQuY2hhckNvZGVBdChJKyspO1xuICAgICAgICBpZiAoYyA9PT0gMTApIGVvbCA9IHRydWU7IC8vIFxcblxuICAgICAgICBlbHNlIGlmIChjID09PSAxMykgeyBlb2wgPSB0cnVlOyBpZiAodGV4dC5jaGFyQ29kZUF0KEkpID09PSAxMCkgKytJLCArK2s7IH0gLy8gXFxyfFxcclxcblxuICAgICAgICBlbHNlIGlmIChjICE9PSBkZWxpbWl0ZXJDb2RlKSBjb250aW51ZTtcbiAgICAgICAgcmV0dXJuIHRleHQuc2xpY2UoaiwgSSAtIGspO1xuICAgICAgfVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IGxhc3QgdG9rZW4gYmVmb3JlIEVPRlxuICAgICAgcmV0dXJuIHRleHQuc2xpY2Uoaik7XG4gICAgfVxuXG4gICAgd2hpbGUgKCh0ID0gdG9rZW4oKSkgIT09IEVPRikge1xuICAgICAgdmFyIGEgPSBbXTtcbiAgICAgIHdoaWxlICh0ICE9PSBFT0wgJiYgdCAhPT0gRU9GKSB7XG4gICAgICAgIGEucHVzaCh0KTtcbiAgICAgICAgdCA9IHRva2VuKCk7XG4gICAgICB9XG4gICAgICBpZiAoZiAmJiAoYSA9IGYoYSwgbisrKSkgPT0gbnVsbCkgY29udGludWU7XG4gICAgICByb3dzLnB1c2goYSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJvd3M7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXQocm93cywgY29sdW1ucykge1xuICAgIGlmIChjb2x1bW5zID09IG51bGwpIGNvbHVtbnMgPSBpbmZlckNvbHVtbnMocm93cyk7XG4gICAgcmV0dXJuIFtjb2x1bW5zLm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpXS5jb25jYXQocm93cy5tYXAoZnVuY3Rpb24ocm93KSB7XG4gICAgICByZXR1cm4gY29sdW1ucy5tYXAoZnVuY3Rpb24oY29sdW1uKSB7XG4gICAgICAgIHJldHVybiBmb3JtYXRWYWx1ZShyb3dbY29sdW1uXSk7XG4gICAgICB9KS5qb2luKGRlbGltaXRlcik7XG4gICAgfSkpLmpvaW4oXCJcXG5cIik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRSb3dzKHJvd3MpIHtcbiAgICByZXR1cm4gcm93cy5tYXAoZm9ybWF0Um93KS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93KHJvdykge1xuICAgIHJldHVybiByb3cubWFwKGZvcm1hdFZhbHVlKS5qb2luKGRlbGltaXRlcik7XG4gIH1cblxuICBmdW5jdGlvbiBmb3JtYXRWYWx1ZSh0ZXh0KSB7XG4gICAgcmV0dXJuIHRleHQgPT0gbnVsbCA/IFwiXCJcbiAgICAgICAgOiByZUZvcm1hdC50ZXN0KHRleHQgKz0gXCJcIikgPyBcIlxcXCJcIiArIHRleHQucmVwbGFjZSgvXFxcIi9nLCBcIlxcXCJcXFwiXCIpICsgXCJcXFwiXCJcbiAgICAgICAgOiB0ZXh0O1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBwYXJzZTogcGFyc2UsXG4gICAgcGFyc2VSb3dzOiBwYXJzZVJvd3MsXG4gICAgZm9ybWF0OiBmb3JtYXQsXG4gICAgZm9ybWF0Um93czogZm9ybWF0Um93c1xuICB9O1xufVxuXG52YXIgY3N2ID0gZHN2KFwiLFwiKTtcblxudmFyIGNzdlBhcnNlID0gY3N2LnBhcnNlO1xudmFyIGNzdlBhcnNlUm93cyA9IGNzdi5wYXJzZVJvd3M7XG52YXIgY3N2Rm9ybWF0ID0gY3N2LmZvcm1hdDtcbnZhciBjc3ZGb3JtYXRSb3dzID0gY3N2LmZvcm1hdFJvd3M7XG5cbnZhciB0c3YgPSBkc3YoXCJcXHRcIik7XG5cbnZhciB0c3ZQYXJzZSA9IHRzdi5wYXJzZTtcbnZhciB0c3ZQYXJzZVJvd3MgPSB0c3YucGFyc2VSb3dzO1xudmFyIHRzdkZvcm1hdCA9IHRzdi5mb3JtYXQ7XG52YXIgdHN2Rm9ybWF0Um93cyA9IHRzdi5mb3JtYXRSb3dzO1xuXG5leHBvcnRzLmRzdkZvcm1hdCA9IGRzdjtcbmV4cG9ydHMuY3N2UGFyc2UgPSBjc3ZQYXJzZTtcbmV4cG9ydHMuY3N2UGFyc2VSb3dzID0gY3N2UGFyc2VSb3dzO1xuZXhwb3J0cy5jc3ZGb3JtYXQgPSBjc3ZGb3JtYXQ7XG5leHBvcnRzLmNzdkZvcm1hdFJvd3MgPSBjc3ZGb3JtYXRSb3dzO1xuZXhwb3J0cy50c3ZQYXJzZSA9IHRzdlBhcnNlO1xuZXhwb3J0cy50c3ZQYXJzZVJvd3MgPSB0c3ZQYXJzZVJvd3M7XG5leHBvcnRzLnRzdkZvcm1hdCA9IHRzdkZvcm1hdDtcbmV4cG9ydHMudHN2Rm9ybWF0Um93cyA9IHRzdkZvcm1hdFJvd3M7XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCAnX19lc01vZHVsZScsIHsgdmFsdWU6IHRydWUgfSk7XG5cbn0pKSk7IiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1yZXF1ZXN0LyBWZXJzaW9uIDEuMC4zLiBDb3B5cmlnaHQgMjAxNiBNaWtlIEJvc3RvY2suXG4oZnVuY3Rpb24gKGdsb2JhbCwgZmFjdG9yeSkge1xuICB0eXBlb2YgZXhwb3J0cyA9PT0gJ29iamVjdCcgJiYgdHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgPyBmYWN0b3J5KGV4cG9ydHMsIHJlcXVpcmUoJ2QzLWNvbGxlY3Rpb24nKSwgcmVxdWlyZSgnZDMtZGlzcGF0Y2gnKSwgcmVxdWlyZSgnZDMtZHN2JykpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKFsnZXhwb3J0cycsICdkMy1jb2xsZWN0aW9uJywgJ2QzLWRpc3BhdGNoJywgJ2QzLWRzdiddLCBmYWN0b3J5KSA6XG4gIChmYWN0b3J5KChnbG9iYWwuZDMgPSBnbG9iYWwuZDMgfHwge30pLGdsb2JhbC5kMyxnbG9iYWwuZDMsZ2xvYmFsLmQzKSk7XG59KHRoaXMsIChmdW5jdGlvbiAoZXhwb3J0cyxkM0NvbGxlY3Rpb24sZDNEaXNwYXRjaCxkM0RzdikgeyAndXNlIHN0cmljdCc7XG5cbnZhciByZXF1ZXN0ID0gZnVuY3Rpb24odXJsLCBjYWxsYmFjaykge1xuICB2YXIgcmVxdWVzdCxcbiAgICAgIGV2ZW50ID0gZDNEaXNwYXRjaC5kaXNwYXRjaChcImJlZm9yZXNlbmRcIiwgXCJwcm9ncmVzc1wiLCBcImxvYWRcIiwgXCJlcnJvclwiKSxcbiAgICAgIG1pbWVUeXBlLFxuICAgICAgaGVhZGVycyA9IGQzQ29sbGVjdGlvbi5tYXAoKSxcbiAgICAgIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCxcbiAgICAgIHVzZXIgPSBudWxsLFxuICAgICAgcGFzc3dvcmQgPSBudWxsLFxuICAgICAgcmVzcG9uc2UsXG4gICAgICByZXNwb25zZVR5cGUsXG4gICAgICB0aW1lb3V0ID0gMDtcblxuICAvLyBJZiBJRSBkb2VzIG5vdCBzdXBwb3J0IENPUlMsIHVzZSBYRG9tYWluUmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBYRG9tYWluUmVxdWVzdCAhPT0gXCJ1bmRlZmluZWRcIlxuICAgICAgJiYgIShcIndpdGhDcmVkZW50aWFsc1wiIGluIHhocilcbiAgICAgICYmIC9eKGh0dHAocyk/Oik/XFwvXFwvLy50ZXN0KHVybCkpIHhociA9IG5ldyBYRG9tYWluUmVxdWVzdDtcblxuICBcIm9ubG9hZFwiIGluIHhoclxuICAgICAgPyB4aHIub25sb2FkID0geGhyLm9uZXJyb3IgPSB4aHIub250aW1lb3V0ID0gcmVzcG9uZFxuICAgICAgOiB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24obykgeyB4aHIucmVhZHlTdGF0ZSA+IDMgJiYgcmVzcG9uZChvKTsgfTtcblxuICBmdW5jdGlvbiByZXNwb25kKG8pIHtcbiAgICB2YXIgc3RhdHVzID0geGhyLnN0YXR1cywgcmVzdWx0O1xuICAgIGlmICghc3RhdHVzICYmIGhhc1Jlc3BvbnNlKHhocilcbiAgICAgICAgfHwgc3RhdHVzID49IDIwMCAmJiBzdGF0dXMgPCAzMDBcbiAgICAgICAgfHwgc3RhdHVzID09PSAzMDQpIHtcbiAgICAgIGlmIChyZXNwb25zZSkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHJlc3VsdCA9IHJlc3BvbnNlLmNhbGwocmVxdWVzdCwgeGhyKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBlKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdCA9IHhocjtcbiAgICAgIH1cbiAgICAgIGV2ZW50LmNhbGwoXCJsb2FkXCIsIHJlcXVlc3QsIHJlc3VsdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGV2ZW50LmNhbGwoXCJlcnJvclwiLCByZXF1ZXN0LCBvKTtcbiAgICB9XG4gIH1cblxuICB4aHIub25wcm9ncmVzcyA9IGZ1bmN0aW9uKGUpIHtcbiAgICBldmVudC5jYWxsKFwicHJvZ3Jlc3NcIiwgcmVxdWVzdCwgZSk7XG4gIH07XG5cbiAgcmVxdWVzdCA9IHtcbiAgICBoZWFkZXI6IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgICBuYW1lID0gKG5hbWUgKyBcIlwiKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAyKSByZXR1cm4gaGVhZGVycy5nZXQobmFtZSk7XG4gICAgICBpZiAodmFsdWUgPT0gbnVsbCkgaGVhZGVycy5yZW1vdmUobmFtZSk7XG4gICAgICBlbHNlIGhlYWRlcnMuc2V0KG5hbWUsIHZhbHVlICsgXCJcIik7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gSWYgbWltZVR5cGUgaXMgbm9uLW51bGwgYW5kIG5vIEFjY2VwdCBoZWFkZXIgaXMgc2V0LCBhIGRlZmF1bHQgaXMgdXNlZC5cbiAgICBtaW1lVHlwZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIG1pbWVUeXBlO1xuICAgICAgbWltZVR5cGUgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIjtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBTcGVjaWZpZXMgd2hhdCB0eXBlIHRoZSByZXNwb25zZSB2YWx1ZSBzaG91bGQgdGFrZTtcbiAgICAvLyBmb3IgaW5zdGFuY2UsIGFycmF5YnVmZmVyLCBibG9iLCBkb2N1bWVudCwgb3IgdGV4dC5cbiAgICByZXNwb25zZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiByZXNwb25zZVR5cGU7XG4gICAgICByZXNwb25zZVR5cGUgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICB0aW1lb3V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gdGltZW91dDtcbiAgICAgIHRpbWVvdXQgPSArdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdXNlcjogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJldHVybiBhcmd1bWVudHMubGVuZ3RoIDwgMSA/IHVzZXIgOiAodXNlciA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgcGFzc3dvcmQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyBwYXNzd29yZCA6IChwYXNzd29yZCA9IHZhbHVlID09IG51bGwgPyBudWxsIDogdmFsdWUgKyBcIlwiLCByZXF1ZXN0KTtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmeSBob3cgdG8gY29udmVydCB0aGUgcmVzcG9uc2UgY29udGVudCB0byBhIHNwZWNpZmljIHR5cGU7XG4gICAgLy8gY2hhbmdlcyB0aGUgY2FsbGJhY2sgdmFsdWUgb24gXCJsb2FkXCIgZXZlbnRzLlxuICAgIHJlc3BvbnNlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmVzcG9uc2UgPSB2YWx1ZTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIkdFVFwiLCDigKYpLlxuICAgIGdldDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJHRVRcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBBbGlhcyBmb3Igc2VuZChcIlBPU1RcIiwg4oCmKS5cbiAgICBwb3N0OiBmdW5jdGlvbihkYXRhLCBjYWxsYmFjaykge1xuICAgICAgcmV0dXJuIHJlcXVlc3Quc2VuZChcIlBPU1RcIiwgZGF0YSwgY2FsbGJhY2spO1xuICAgIH0sXG5cbiAgICAvLyBJZiBjYWxsYmFjayBpcyBub24tbnVsbCwgaXQgd2lsbCBiZSB1c2VkIGZvciBlcnJvciBhbmQgbG9hZCBldmVudHMuXG4gICAgc2VuZDogZnVuY3Rpb24obWV0aG9kLCBkYXRhLCBjYWxsYmFjaykge1xuICAgICAgeGhyLm9wZW4obWV0aG9kLCB1cmwsIHRydWUsIHVzZXIsIHBhc3N3b3JkKTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmICFoZWFkZXJzLmhhcyhcImFjY2VwdFwiKSkgaGVhZGVycy5zZXQoXCJhY2NlcHRcIiwgbWltZVR5cGUgKyBcIiwqLypcIik7XG4gICAgICBpZiAoeGhyLnNldFJlcXVlc3RIZWFkZXIpIGhlYWRlcnMuZWFjaChmdW5jdGlvbih2YWx1ZSwgbmFtZSkgeyB4aHIuc2V0UmVxdWVzdEhlYWRlcihuYW1lLCB2YWx1ZSk7IH0pO1xuICAgICAgaWYgKG1pbWVUeXBlICE9IG51bGwgJiYgeGhyLm92ZXJyaWRlTWltZVR5cGUpIHhoci5vdmVycmlkZU1pbWVUeXBlKG1pbWVUeXBlKTtcbiAgICAgIGlmIChyZXNwb25zZVR5cGUgIT0gbnVsbCkgeGhyLnJlc3BvbnNlVHlwZSA9IHJlc3BvbnNlVHlwZTtcbiAgICAgIGlmICh0aW1lb3V0ID4gMCkgeGhyLnRpbWVvdXQgPSB0aW1lb3V0O1xuICAgICAgaWYgKGNhbGxiYWNrID09IG51bGwgJiYgdHlwZW9mIGRhdGEgPT09IFwiZnVuY3Rpb25cIikgY2FsbGJhY2sgPSBkYXRhLCBkYXRhID0gbnVsbDtcbiAgICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIGNhbGxiYWNrLmxlbmd0aCA9PT0gMSkgY2FsbGJhY2sgPSBmaXhDYWxsYmFjayhjYWxsYmFjayk7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkgcmVxdWVzdC5vbihcImVycm9yXCIsIGNhbGxiYWNrKS5vbihcImxvYWRcIiwgZnVuY3Rpb24oeGhyKSB7IGNhbGxiYWNrKG51bGwsIHhocik7IH0pO1xuICAgICAgZXZlbnQuY2FsbChcImJlZm9yZXNlbmRcIiwgcmVxdWVzdCwgeGhyKTtcbiAgICAgIHhoci5zZW5kKGRhdGEgPT0gbnVsbCA/IG51bGwgOiBkYXRhKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBhYm9ydDogZnVuY3Rpb24oKSB7XG4gICAgICB4aHIuYWJvcnQoKTtcbiAgICAgIHJldHVybiByZXF1ZXN0O1xuICAgIH0sXG5cbiAgICBvbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgdmFsdWUgPSBldmVudC5vbi5hcHBseShldmVudCwgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiB2YWx1ZSA9PT0gZXZlbnQgPyByZXF1ZXN0IDogdmFsdWU7XG4gICAgfVxuICB9O1xuXG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB7XG4gICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICByZXR1cm4gcmVxdWVzdC5nZXQoY2FsbGJhY2spO1xuICB9XG5cbiAgcmV0dXJuIHJlcXVlc3Q7XG59O1xuXG5mdW5jdGlvbiBmaXhDYWxsYmFjayhjYWxsYmFjaykge1xuICByZXR1cm4gZnVuY3Rpb24oZXJyb3IsIHhocikge1xuICAgIGNhbGxiYWNrKGVycm9yID09IG51bGwgPyB4aHIgOiBudWxsKTtcbiAgfTtcbn1cblxuZnVuY3Rpb24gaGFzUmVzcG9uc2UoeGhyKSB7XG4gIHZhciB0eXBlID0geGhyLnJlc3BvbnNlVHlwZTtcbiAgcmV0dXJuIHR5cGUgJiYgdHlwZSAhPT0gXCJ0ZXh0XCJcbiAgICAgID8geGhyLnJlc3BvbnNlIC8vIG51bGwgb24gZXJyb3JcbiAgICAgIDogeGhyLnJlc3BvbnNlVGV4dDsgLy8gXCJcIiBvbiBlcnJvclxufVxuXG52YXIgdHlwZSA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcmVzcG9uc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpLnJlc3BvbnNlKHJlc3BvbnNlKTtcbiAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICAgIHJldHVybiByLmdldChjYWxsYmFjayk7XG4gICAgfVxuICAgIHJldHVybiByO1xuICB9O1xufTtcblxudmFyIGh0bWwgPSB0eXBlKFwidGV4dC9odG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlUmFuZ2UoKS5jcmVhdGVDb250ZXh0dWFsRnJhZ21lbnQoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIGpzb24gPSB0eXBlKFwiYXBwbGljYXRpb24vanNvblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCk7XG59KTtcblxudmFyIHRleHQgPSB0eXBlKFwidGV4dC9wbGFpblwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIHhoci5yZXNwb25zZVRleHQ7XG59KTtcblxudmFyIHhtbCA9IHR5cGUoXCJhcHBsaWNhdGlvbi94bWxcIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHZhciB4bWwgPSB4aHIucmVzcG9uc2VYTUw7XG4gIGlmICgheG1sKSB0aHJvdyBuZXcgRXJyb3IoXCJwYXJzZSBlcnJvclwiKTtcbiAgcmV0dXJuIHhtbDtcbn0pO1xuXG52YXIgZHN2ID0gZnVuY3Rpb24oZGVmYXVsdE1pbWVUeXBlLCBwYXJzZSkge1xuICByZXR1cm4gZnVuY3Rpb24odXJsLCByb3csIGNhbGxiYWNrKSB7XG4gICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSBjYWxsYmFjayA9IHJvdywgcm93ID0gbnVsbDtcbiAgICB2YXIgciA9IHJlcXVlc3QodXJsKS5taW1lVHlwZShkZWZhdWx0TWltZVR5cGUpO1xuICAgIHIucm93ID0gZnVuY3Rpb24oXykgeyByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA/IHIucmVzcG9uc2UocmVzcG9uc2VPZihwYXJzZSwgcm93ID0gXykpIDogcm93OyB9O1xuICAgIHIucm93KHJvdyk7XG4gICAgcmV0dXJuIGNhbGxiYWNrID8gci5nZXQoY2FsbGJhY2spIDogcjtcbiAgfTtcbn07XG5cbmZ1bmN0aW9uIHJlc3BvbnNlT2YocGFyc2UsIHJvdykge1xuICByZXR1cm4gZnVuY3Rpb24ocmVxdWVzdCQkMSkge1xuICAgIHJldHVybiBwYXJzZShyZXF1ZXN0JCQxLnJlc3BvbnNlVGV4dCwgcm93KTtcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcInRleHQvY3N2XCIsIGQzRHN2LmNzdlBhcnNlKTtcblxudmFyIHRzdiA9IGRzdihcInRleHQvdGFiLXNlcGFyYXRlZC12YWx1ZXNcIiwgZDNEc3YudHN2UGFyc2UpO1xuXG5leHBvcnRzLnJlcXVlc3QgPSByZXF1ZXN0O1xuZXhwb3J0cy5odG1sID0gaHRtbDtcbmV4cG9ydHMuanNvbiA9IGpzb247XG5leHBvcnRzLnRleHQgPSB0ZXh0O1xuZXhwb3J0cy54bWwgPSB4bWw7XG5leHBvcnRzLmNzdiA9IGNzdjtcbmV4cG9ydHMudHN2ID0gdHN2O1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiIWZ1bmN0aW9uKGUsbil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/bW9kdWxlLmV4cG9ydHM9bihyZXF1aXJlKFwiZDMtcmVxdWVzdFwiKSk6XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShbXCJkMy1yZXF1ZXN0XCJdLG4pOihlLmQzPWUuZDN8fHt9LGUuZDMucHJvbWlzZT1uKGUuZDMpKX0odGhpcyxmdW5jdGlvbihlKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7Zm9yKHZhciB0PWFyZ3VtZW50cy5sZW5ndGgscj1BcnJheSh0KSxvPTA7dD5vO28rKylyW29dPWFyZ3VtZW50c1tvXTtyZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24odCxvKXt2YXIgdT1mdW5jdGlvbihlLG4pe3JldHVybiBlP3ZvaWQgbyhFcnJvcihlKSk6dm9pZCB0KG4pfTtuLmFwcGx5KGUsci5jb25jYXQodSkpfSl9fXZhciB0PXt9O3JldHVybltcImNzdlwiLFwidHN2XCIsXCJqc29uXCIsXCJ4bWxcIixcInRleHRcIixcImh0bWxcIl0uZm9yRWFjaChmdW5jdGlvbihyKXt0W3JdPW4oZSxlW3JdKX0pLHR9KTsiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbnZhciBkMyA9IHJlcXVpcmUoJ2QzLnByb21pc2UnKTtcblxuZnVuY3Rpb24gZGVmKGEsIGIpIHtcbiAgICByZXR1cm4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG59XG4vKlxuTWFuYWdlcyBmZXRjaGluZyBhIGRhdGFzZXQgZnJvbSBTb2NyYXRhIGFuZCBwcmVwYXJpbmcgaXQgZm9yIHZpc3VhbGlzYXRpb24gYnlcbmNvdW50aW5nIGZpZWxkIHZhbHVlIGZyZXF1ZW5jaWVzIGV0Yy4gXG4qL1xuZXhwb3J0IGNsYXNzIFNvdXJjZURhdGEge1xuICAgIGNvbnN0cnVjdG9yKGRhdGFJZCwgYWN0aXZlQ2Vuc3VzWWVhcikge1xuICAgICAgICB0aGlzLmRhdGFJZCA9IGRhdGFJZDtcbiAgICAgICAgdGhpcy5hY3RpdmVDZW5zdXNZZWFyID0gZGVmKGFjdGl2ZUNlbnN1c1llYXIsIDIwMTUpO1xuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSB1bmRlZmluZWQ7ICAvLyBuYW1lIG9mIGNvbHVtbiB3aGljaCBob2xkcyBsYXQvbG9uIG9yIGJsb2NrIElEXG4gICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdW5kZWZpbmVkOyAvLyBpZiB0aGUgZGF0YXNldCB0eXBlIGlzICdwb2ludCcgKHVzZWQgZm9yIHBhcnNpbmcgbG9jYXRpb24gZmllbGQpXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnMgPSBbXTsgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBudW1lcmljIGRhdGF2aXNcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IFtdOyAgICAgICAgICAgIC8vIG5hbWVzIG9mIGNvbHVtbnMgc3VpdGFibGUgZm9yIGVudW0gZGF0YXZpc1xuICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMgPSBbXTsgICAgICAgICAgLy8gbmFtZXMgb2Ygb3RoZXIgY29sdW1uc1xuICAgICAgICB0aGlzLm1pbnMgPSB7fTsgICAgICAgICAgICAgICAgICAgLy8gbWluIGFuZCBtYXggb2YgZWFjaCBudW1lcmljIGNvbHVtblxuICAgICAgICB0aGlzLm1heHMgPSB7fTtcbiAgICAgICAgdGhpcy5mcmVxdWVuY2llcyA9IHt9OyAgICAgICAgICAgIC8vIFxuICAgICAgICB0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzID0ge307ICAgICAgLy8gbW9zdCBmcmVxdWVudCB2YWx1ZXMgaW4gZWFjaCB0ZXh0IGNvbHVtblxuICAgICAgICB0aGlzLnNoYXBlID0gJ3BvaW50JzsgICAgICAgICAgICAgLy8gcG9pbnQgb3IgcG9seWdvbiAoQ0xVRSBibG9jaylcbiAgICAgICAgdGhpcy5yb3dzID0gdW5kZWZpbmVkOyAgICAgICAgICAgIC8vIHByb2Nlc3NlZCByb3dzXG4gICAgICAgIHRoaXMuYmxvY2tJbmRleCA9IHt9OyAgICAgICAgICAgICAvLyBjYWNoZSBvZiBDTFVFIGJsb2NrIElEc1xuICAgIH1cblxuXG4gICAgY2hvb3NlQ29sdW1uVHlwZXMgKGNvbHVtbnMpIHtcbiAgICAgICAgLy92YXIgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnIHx8IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgLy8gXCJsb2NhdGlvblwiIGFuZCBcInBvaW50XCIgYXJlIGJvdGggcG9pbnQgZGF0YSB0eXBlcywgZXhwcmVzc2VkIGRpZmZlcmVudGx5LlxuICAgICAgICAvLyBPdGhlcndpc2UsIGEgXCJibG9jayBJRFwiIGNhbiBiZSBqb2luZWQgYWdhaW5zdCB0aGUgQ0xVRSBCbG9jayBwb2x5Z29ucyB3aGljaCBhcmUgaW4gTWFwYm94LlxuICAgICAgICBsZXQgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ2xvY2F0aW9uJyB8fCBjb2wuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVswXTtcbiAgICAgICAgaWYgKCFsYykge1xuICAgICAgICAgICAgbGMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sLm5hbWUgPT09ICdCbG9jayBJRCcpWzBdO1xuICAgICAgICB9XG5cblxuICAgICAgICBpZiAobGMuZGF0YVR5cGVOYW1lID09PSAncG9pbnQnKVxuICAgICAgICAgICAgdGhpcy5sb2NhdGlvbklzUG9pbnQgPSB0cnVlO1xuXG4gICAgICAgIGlmIChsYy5uYW1lID09PSAnQmxvY2sgSUQnKSB7XG4gICAgICAgICAgICB0aGlzLnNoYXBlID0gJ3BvbHlnb24nO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5sb2NhdGlvbkNvbHVtbiA9IGxjLm5hbWU7XG5cbiAgICAgICAgY29sdW1ucyA9IGNvbHVtbnMuZmlsdGVyKGNvbCA9PiBjb2wgIT09IGxjKTtcblxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ251bWJlcicgJiYgY29sLm5hbWUgIT09ICdMYXRpdHVkZScgJiYgY29sLm5hbWUgIT09ICdMb25naXR1ZGUnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuICAgICAgICBcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1uc1xuICAgICAgICAgICAgLmZvckVhY2goY29sID0+IHsgdGhpcy5taW5zW2NvbF0gPSAxZTk7IHRoaXMubWF4c1tjb2xdID0gLTFlOTsgfSk7XG4gICAgICAgIFxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3RleHQnKVxuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpO1xuXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF0gPSB7fSk7XG5cbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gY29sdW1uc1xuICAgICAgICAgICAgLm1hcChjb2wgPT4gY29sLm5hbWUpXG4gICAgICAgICAgICAuZmlsdGVyKGNvbCA9PiB0aGlzLm51bWVyaWNDb2x1bW5zLmluZGV4T2YoY29sKSA8IDAgJiYgdGhpcy50ZXh0Q29sdW1ucy5pbmRleE9mKGNvbCkgPCAwKTtcbiAgICB9XG5cbiAgICAvLyBUT0RPIGJldHRlciBuYW1lIGFuZCBiZWhhdmlvdXJcbiAgICBmaWx0ZXIocm93KSB7XG4gICAgICAgIC8vIFRPRE8gbW92ZSB0aGlzIHNvbWV3aGVyZSBiZXR0ZXJcbiAgICAgICAgaWYgKHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSA9PT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJylcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgaWYgKHJvd1snQ2Vuc3VzIHllYXInXSAmJiByb3dbJ0NlbnN1cyB5ZWFyJ10gIT09IHRoaXMuYWN0aXZlQ2Vuc3VzWWVhcilcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG5cblxuICAgIC8vIGNvbnZlcnQgbnVtZXJpYyBjb2x1bW5zIHRvIG51bWJlcnMgZm9yIGRhdGEgdmlzXG4gICAgY29udmVydFJvdyhyb3cpIHtcblxuICAgICAgICAvLyBjb252ZXJ0IGxvY2F0aW9uIHR5cGVzIChzdHJpbmcpIHRvIFtsb24sIGxhdF0gYXJyYXkuXG4gICAgICAgIGZ1bmN0aW9uIGxvY2F0aW9uVG9Db29yZHMobG9jYXRpb24pIHtcbiAgICAgICAgICAgIGlmIChTdHJpbmcobG9jYXRpb24pLmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIC8vIFwibmV3IGJhY2tlbmRcIiBkYXRhc2V0cyB1c2UgYSBXS1QgZmllbGQgW1BPSU5UIChsb24gbGF0KV0gaW5zdGVhZCBvZiAobGF0LCBsb24pXG4gICAgICAgICAgICBpZiAodGhpcy5sb2NhdGlvbklzUG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbG9jYXRpb24ucmVwbGFjZSgnUE9JTlQgKCcsICcnKS5yZXBsYWNlKCcpJywgJycpLnNwbGl0KCcgJykubWFwKG4gPT4gTnVtYmVyKG4pKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2cobG9jYXRpb24ubGVuZ3RoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gW051bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVsxXS5yZXBsYWNlKCcpJywgJycpKSwgTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzBdLnJlcGxhY2UoJygnLCAnJykpXTtcbiAgICAgICAgICAgIH0gZWxzZSBcbiAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbjtcblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyB1c2UgY29sdW1uLmNhY2hlZENvbnRlbnRzLnNtYWxsZXN0IGFuZCAubGFyZ2VzdFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHJvd1tjb2xdID0gTnVtYmVyKHJvd1tjb2xdKSA7IC8vICtyb3dbY29sXSBhcHBhcmVudGx5IGZhc3RlciwgYnV0IGJyZWFrcyBvbiBzaW1wbGUgdGhpbmdzIGxpa2UgYmxhbmsgdmFsdWVzXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluY2x1ZGUgdGhlIHRvdGFsIHZhbHVlcyBpbiBcbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA8IHRoaXMubWluc1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5taW5zW2NvbF0gPSByb3dbY29sXTtcblxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdID4gdGhpcy5tYXhzW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1heHNbY29sXSA9IHJvd1tjb2xdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB2YXIgdmFsID0gcm93W2NvbF07XG4gICAgICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSA9ICh0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSA9IGxvY2F0aW9uVG9Db29yZHMuY2FsbCh0aGlzLCByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pO1xuXG5cblxuICAgICAgICByZXR1cm4gcm93O1xuICAgIH1cblxuICAgIGNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpIHtcbiAgICAgICAgdmFyIG5ld1RleHRDb2x1bW5zID0gW107XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llc1tjb2xdID0gT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKVxuICAgICAgICAgICAgICAgIC5zb3J0KCh2YWxhLCB2YWxiKSA9PiB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYV0gPCB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsYl0gPyAxIDogLTEpXG4gICAgICAgICAgICAgICAgLnNsaWNlKDAsMTIpO1xuXG4gICAgICAgICAgICBpZiAoT2JqZWN0LmtleXModGhpcy5mcmVxdWVuY2llc1tjb2xdKS5sZW5ndGggPCAyIHx8IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoID4gMjAgJiYgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3RoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXVsxXV0gPD0gNSkge1xuICAgICAgICAgICAgICAgIC8vIEl0J3MgYm9yaW5nIGlmIGFsbCB2YWx1ZXMgdGhlIHNhbWUsIG9yIGlmIHRvbyBtYW55IGRpZmZlcmVudCB2YWx1ZXMgKGFzIGp1ZGdlZCBieSBzZWNvbmQtbW9zdCBjb21tb24gdmFsdWUgYmVpbmcgNSB0aW1lcyBvciBmZXdlcilcbiAgICAgICAgICAgICAgICB0aGlzLmJvcmluZ0NvbHVtbnMucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBuZXdUZXh0Q29sdW1ucy5wdXNoKGNvbCk7IC8vIGhvdyBkbyB5b3Ugc2FmZWx5IGRlbGV0ZSBmcm9tIGFycmF5IHlvdSdyZSBsb29waW5nIG92ZXI/XG4gICAgICAgICAgICB9XG5cblxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IG5ld1RleHRDb2x1bW5zO1xuICAgICAgICAvL2NvbnNvbGUubG9nKHRoaXMuc29ydGVkRnJlcXVlbmNpZXMpO1xuICAgIH1cblxuICAgIC8vIFJldHJpZXZlIHJvd3MgZnJvbSBTb2NyYXRhIChyZXR1cm5zIFByb21pc2UpLiBcIk5ldyBiYWNrZW5kXCIgdmlld3MgZ28gdGhyb3VnaCBhbiBhZGRpdGlvbmFsIHN0ZXAgdG8gZmluZCB0aGUgcmVhbFxuICAgIC8vIEFQSSBlbmRwb2ludC5cbiAgICBsb2FkKCkge1xuICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnLmpzb24nKVxuICAgICAgICAudGhlbihwcm9wcyA9PiB7XG4gICAgICAgICAgICB0aGlzLm5hbWUgPSBwcm9wcy5uYW1lO1xuICAgICAgICAgICAgaWYgKHByb3BzLm5ld0JhY2tlbmQgJiYgcHJvcHMuY2hpbGRWaWV3cy5sZW5ndGggPiAwKSB7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGFJZCA9IHByb3BzLmNoaWxkVmlld3NbMF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gZDMuanNvbignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKHByb3BzID0+IHRoaXMuY2hvb3NlQ29sdW1uVHlwZXMocHJvcHMuY29sdW1ucykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUodHJ1ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGQzLmNzdignaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L2FwaS92aWV3cy8nICsgdGhpcy5kYXRhSWQgKyAnL3Jvd3MuY3N2P2FjY2Vzc1R5cGU9RE9XTkxPQUQnLCB0aGlzLmNvbnZlcnRSb3cuYmluZCh0aGlzKSlcbiAgICAgICAgICAgIC50aGVuKHJvd3MgPT4ge1xuICAgICAgICAgICAgICAgIHRoaXMucm93cyA9IHJvd3M7XG4gICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvbHlnb24nKVxuICAgICAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVCbG9ja0luZGV4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgYSBoYXNoIHRhYmxlIGxvb2t1cCBmcm9tIFt5ZWFyLCBibG9jayBJRF0gdG8gZGF0YXNldCByb3dcbiAgICBjb21wdXRlQmxvY2tJbmRleCgpIHtcbiAgICAgICAgdGhpcy5yb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID0ge307XG4gICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXVtyb3dbJ0Jsb2NrIElEJ11dID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJvd0ZvckJsb2NrKGJsb2NrSWQgLyogY2Vuc3VzX3llYXIgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93c1t0aGlzLmJsb2NrSW5kZXhbdGhpcy5hY3RpdmVDZW5zdXNZZWFyXVtibG9ja0lkXV07XG4gICAgfVxuXG4gICAgZmlsdGVyZWRSb3dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93WydDZW5zdXMgeWVhciddID09PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSAhPT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJyk7XG4gICAgfVxufSJdfQ==

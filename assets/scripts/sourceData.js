(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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
},{}],4:[function(require,module,exports){
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

},{"d3-collection":1,"d3-dispatch":2,"d3-dsv":3}],5:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],n):(e.d3=e.d3||{},e.d3.promise=n(e.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var u=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(u))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t});
},{"d3-request":4}],6:[function(require,module,exports){
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

},{"d3.promise":5}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1jb2xsZWN0aW9uL2J1aWxkL2QzLWNvbGxlY3Rpb24uanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLWRpc3BhdGNoL2J1aWxkL2QzLWRpc3BhdGNoLmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1kc3YvYnVpbGQvZDMtZHN2LmpzIiwic3JjL2pzL25vZGVfbW9kdWxlcy9kMy1yZXF1ZXN0L2J1aWxkL2QzLXJlcXVlc3QuanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLnByb21pc2UvZGlzdC9kMy5wcm9taXNlLm1pbi5qcyIsInNyYy9qcy9zb3VyY2VEYXRhLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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O0FBQzlCLG9CQUFJLE9BQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsTUFBd0MsU0FBNUMsRUFDSSxPQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLElBQXNDLEVBQXRDO0FBQ0osdUJBQUssVUFBTCxDQUFnQixJQUFJLGFBQUosQ0FBaEIsRUFBb0MsSUFBSSxVQUFKLENBQXBDLElBQXVELEtBQXZEO0FBQ0gsYUFKRDtBQUtIOzs7dUNBRWMsTyxDQUFRLGlCLEVBQW1CO0FBQ3RDLG1CQUFPLEtBQUssSUFBTCxDQUFVLEtBQUssVUFBTCxDQUFnQixLQUFLLGdCQUFyQixFQUF1QyxPQUF2QyxDQUFWLENBQVA7QUFDSDs7O3VDQUVjO0FBQUE7O0FBQ1gsbUJBQU8sS0FBSyxJQUFMLENBQVUsTUFBVixDQUFpQjtBQUFBLHVCQUFPLElBQUksYUFBSixNQUF1QixPQUFLLGdCQUE1QixJQUFnRCxJQUFJLGlCQUFKLE1BQTJCLHlCQUFsRjtBQUFBLGFBQWpCLENBQVA7QUFDSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyBodHRwczovL2QzanMub3JnL2QzLWNvbGxlY3Rpb24vIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHByZWZpeCA9IFwiJFwiO1xuXG5mdW5jdGlvbiBNYXAoKSB7fVxuXG5NYXAucHJvdG90eXBlID0gbWFwLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IE1hcCxcbiAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gKHByZWZpeCArIGtleSkgaW4gdGhpcztcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpc1twcmVmaXggKyBrZXldO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzW3ByZWZpeCArIGtleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcHJvcGVydHkgPSBwcmVmaXggKyBrZXk7XG4gICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkga2V5cy5wdXNoKHByb3BlcnR5LnNsaWNlKDEpKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfSxcbiAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHZhbHVlcy5wdXNoKHRoaXNbcHJvcGVydHldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9LFxuICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBlbnRyaWVzLnB1c2goe2tleTogcHJvcGVydHkuc2xpY2UoMSksIHZhbHVlOiB0aGlzW3Byb3BlcnR5XX0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9LFxuICBzaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpICsrc2l6ZTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfSxcbiAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZih0aGlzW3Byb3BlcnR5XSwgcHJvcGVydHkuc2xpY2UoMSksIHRoaXMpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYXAob2JqZWN0LCBmKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwO1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgbWFwLnNldChrZXksIHZhbHVlKTsgfSk7XG5cbiAgLy8gSW5kZXggYXJyYXkgYnkgbnVtZXJpYyBpbmRleCBvciBzcGVjaWZpZWQga2V5IGZ1bmN0aW9uLlxuICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgbztcblxuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGksIG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChmKG8gPSBvYmplY3RbaV0sIGksIG9iamVjdCksIG8pO1xuICB9XG5cbiAgLy8gQ29udmVydCBvYmplY3QgdG8gbWFwLlxuICBlbHNlIGlmIChvYmplY3QpIGZvciAodmFyIGtleSBpbiBvYmplY3QpIG1hcC5zZXQoa2V5LCBvYmplY3Rba2V5XSk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIG5lc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGtleXMgPSBbXSxcbiAgICAgIHNvcnRLZXlzID0gW10sXG4gICAgICBzb3J0VmFsdWVzLFxuICAgICAgcm9sbHVwLFxuICAgICAgbmVzdDtcblxuICBmdW5jdGlvbiBhcHBseShhcnJheSwgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSB7XG4gICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwICE9IG51bGxcbiAgICAgICAgPyByb2xsdXAoYXJyYXkpIDogKHNvcnRWYWx1ZXMgIT0gbnVsbFxuICAgICAgICA/IGFycmF5LnNvcnQoc29ydFZhbHVlcylcbiAgICAgICAgOiBhcnJheSk7XG5cbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBrZXkgPSBrZXlzW2RlcHRoKytdLFxuICAgICAgICBrZXlWYWx1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHZhbHVlc0J5S2V5ID0gbWFwKCksXG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlUmVzdWx0KCk7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHZhbHVlcyA9IHZhbHVlc0J5S2V5LmdldChrZXlWYWx1ZSA9IGtleSh2YWx1ZSA9IGFycmF5W2ldKSArIFwiXCIpKSB7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlc0J5S2V5LnNldChrZXlWYWx1ZSwgW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsdWVzQnlLZXkuZWFjaChmdW5jdGlvbih2YWx1ZXMsIGtleSkge1xuICAgICAgc2V0UmVzdWx0KHJlc3VsdCwga2V5LCBhcHBseSh2YWx1ZXMsIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVudHJpZXMobWFwJCQxLCBkZXB0aCkge1xuICAgIGlmICgrK2RlcHRoID4ga2V5cy5sZW5ndGgpIHJldHVybiBtYXAkJDE7XG4gICAgdmFyIGFycmF5LCBzb3J0S2V5ID0gc29ydEtleXNbZGVwdGggLSAxXTtcbiAgICBpZiAocm9sbHVwICE9IG51bGwgJiYgZGVwdGggPj0ga2V5cy5sZW5ndGgpIGFycmF5ID0gbWFwJCQxLmVudHJpZXMoKTtcbiAgICBlbHNlIGFycmF5ID0gW10sIG1hcCQkMS5lYWNoKGZ1bmN0aW9uKHYsIGspIHsgYXJyYXkucHVzaCh7a2V5OiBrLCB2YWx1ZXM6IGVudHJpZXModiwgZGVwdGgpfSk7IH0pO1xuICAgIHJldHVybiBzb3J0S2V5ICE9IG51bGwgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTsgfSkgOiBhcnJheTtcbiAgfVxuXG4gIHJldHVybiBuZXN0ID0ge1xuICAgIG9iamVjdDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVPYmplY3QsIHNldE9iamVjdCk7IH0sXG4gICAgbWFwOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKTsgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gZW50cmllcyhhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApLCAwKTsgfSxcbiAgICBrZXk6IGZ1bmN0aW9uKGQpIHsga2V5cy5wdXNoKGQpOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0S2V5czogZnVuY3Rpb24ob3JkZXIpIHsgc29ydEtleXNba2V5cy5sZW5ndGggLSAxXSA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0VmFsdWVzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0VmFsdWVzID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHJvbGx1cDogZnVuY3Rpb24oZikgeyByb2xsdXAgPSBmOyByZXR1cm4gbmVzdDsgfVxuICB9O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0KCkge1xuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIHNldE9iamVjdChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICByZXR1cm4gbWFwKCk7XG59XG5cbmZ1bmN0aW9uIHNldE1hcChtYXAkJDEsIGtleSwgdmFsdWUpIHtcbiAgbWFwJCQxLnNldChrZXksIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gU2V0KCkge31cblxudmFyIHByb3RvID0gbWFwLnByb3RvdHlwZTtcblxuU2V0LnByb3RvdHlwZSA9IHNldC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZXQsXG4gIGhhczogcHJvdG8uaGFzLFxuICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFsdWUgKz0gXCJcIjtcbiAgICB0aGlzW3ByZWZpeCArIHZhbHVlXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IHByb3RvLnJlbW92ZSxcbiAgY2xlYXI6IHByb3RvLmNsZWFyLFxuICB2YWx1ZXM6IHByb3RvLmtleXMsXG4gIHNpemU6IHByb3RvLnNpemUsXG4gIGVtcHR5OiBwcm90by5lbXB0eSxcbiAgZWFjaDogcHJvdG8uZWFjaFxufTtcblxuZnVuY3Rpb24gc2V0KG9iamVjdCwgZikge1xuICB2YXIgc2V0ID0gbmV3IFNldDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgU2V0KSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSkgeyBzZXQuYWRkKHZhbHVlKTsgfSk7XG5cbiAgLy8gT3RoZXJ3aXNlLCBhc3N1bWUgaXTigJlzIGFuIGFycmF5LlxuICBlbHNlIGlmIChvYmplY3QpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gb2JqZWN0Lmxlbmd0aDtcbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIHNldC5hZGQoZihvYmplY3RbaV0sIGksIG9iamVjdCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldDtcbn1cblxudmFyIGtleXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufTtcblxudmFyIHZhbHVlcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgdmFsdWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIHZhbHVlcy5wdXNoKG1hcFtrZXldKTtcbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbnZhciBlbnRyaWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBlbnRyaWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGVudHJpZXMucHVzaCh7a2V5OiBrZXksIHZhbHVlOiBtYXBba2V5XX0pO1xuICByZXR1cm4gZW50cmllcztcbn07XG5cbmV4cG9ydHMubmVzdCA9IG5lc3Q7XG5leHBvcnRzLnNldCA9IHNldDtcbmV4cG9ydHMubWFwID0gbWFwO1xuZXhwb3J0cy5rZXlzID0ga2V5cztcbmV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuZXhwb3J0cy5lbnRyaWVzID0gZW50cmllcztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZGlzcGF0Y2gvIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIG5vb3AgPSB7dmFsdWU6IGZ1bmN0aW9uKCkge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0cy5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kc3YvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5mdW5jdGlvbiBkc3YoZGVsaW1pdGVyKSB7XG4gIHZhciByZUZvcm1hdCA9IG5ldyBSZWdFeHAoXCJbXFxcIlwiICsgZGVsaW1pdGVyICsgXCJcXG5dXCIpLFxuICAgICAgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHtcbiAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTtcbiAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTtcbiAgICB9KTtcbiAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSb3dzKHRleHQsIGYpIHtcbiAgICB2YXIgRU9MID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtbGluZVxuICAgICAgICBFT0YgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1maWxlXG4gICAgICAgIHJvd3MgPSBbXSwgLy8gb3V0cHV0IHJvd3NcbiAgICAgICAgTiA9IHRleHQubGVuZ3RoLFxuICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXhcbiAgICAgICAgbiA9IDAsIC8vIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgICAgIHQsIC8vIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgIGVvbDsgLy8gaXMgdGhlIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9MP1xuXG4gICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlXG4gICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgbGluZVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3Rlc1xuICAgICAgdmFyIGogPSBJLCBjO1xuICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHtcbiAgICAgICAgdmFyIGkgPSBqO1xuICAgICAgICB3aGlsZSAoaSsrIDwgTikge1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7XG4gICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrO1xuICAgICAgICAgICAgKytpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBJID0gaSArIDI7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICBpZiAoYyA9PT0gMTMpIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvXCJcIi9nLCBcIlxcXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbW1vbiBjYXNlOiBmaW5kIG5leHQgZGVsaW1pdGVyIG9yIG5ld2xpbmVcbiAgICAgIHdoaWxlIChJIDwgTikge1xuICAgICAgICB2YXIgayA9IDE7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDEwKSBlb2wgPSB0cnVlOyAvLyBcXG5cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxccnxcXHJcXG5cbiAgICAgICAgZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0ZcbiAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopO1xuICAgIH1cblxuICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICB3aGlsZSAodCAhPT0gRU9MICYmIHQgIT09IEVPRikge1xuICAgICAgICBhLnB1c2godCk7XG4gICAgICAgIHQgPSB0b2tlbigpO1xuICAgICAgfVxuICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgcm93cy5wdXNoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pO1xuICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH0pKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93cyhyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MubWFwKGZvcm1hdFJvdykuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvdyhyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkge1xuICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyBcIlwiXG4gICAgICAgIDogcmVGb3JtYXQudGVzdCh0ZXh0ICs9IFwiXCIpID8gXCJcXFwiXCIgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgXCJcXFwiXFxcIlwiKSArIFwiXFxcIlwiXG4gICAgICAgIDogdGV4dDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHBhcnNlUm93czogcGFyc2VSb3dzLFxuICAgIGZvcm1hdDogZm9ybWF0LFxuICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3NcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcIixcIik7XG5cbnZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTtcbnZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzO1xudmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7XG52YXIgY3N2Rm9ybWF0Um93cyA9IGNzdi5mb3JtYXRSb3dzO1xuXG52YXIgdHN2ID0gZHN2KFwiXFx0XCIpO1xuXG52YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7XG52YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93cztcbnZhciB0c3ZGb3JtYXQgPSB0c3YuZm9ybWF0O1xudmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93cztcblxuZXhwb3J0cy5kc3ZGb3JtYXQgPSBkc3Y7XG5leHBvcnRzLmNzdlBhcnNlID0gY3N2UGFyc2U7XG5leHBvcnRzLmNzdlBhcnNlUm93cyA9IGNzdlBhcnNlUm93cztcbmV4cG9ydHMuY3N2Rm9ybWF0ID0gY3N2Rm9ybWF0O1xuZXhwb3J0cy5jc3ZGb3JtYXRSb3dzID0gY3N2Rm9ybWF0Um93cztcbmV4cG9ydHMudHN2UGFyc2UgPSB0c3ZQYXJzZTtcbmV4cG9ydHMudHN2UGFyc2VSb3dzID0gdHN2UGFyc2VSb3dzO1xuZXhwb3J0cy50c3ZGb3JtYXQgPSB0c3ZGb3JtYXQ7XG5leHBvcnRzLnRzdkZvcm1hdFJvd3MgPSB0c3ZGb3JtYXRSb3dzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpOyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtcmVxdWVzdC8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzLCByZXF1aXJlKCdkMy1jb2xsZWN0aW9uJyksIHJlcXVpcmUoJ2QzLWRpc3BhdGNoJyksIHJlcXVpcmUoJ2QzLWRzdicpKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnLCAnZDMtY29sbGVjdGlvbicsICdkMy1kaXNwYXRjaCcsICdkMy1kc3YnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSxnbG9iYWwuZDMsZ2xvYmFsLmQzLGdsb2JhbC5kMykpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMsZDNDb2xsZWN0aW9uLGQzRGlzcGF0Y2gsZDNEc3YpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3QsXG4gICAgICBldmVudCA9IGQzRGlzcGF0Y2guZGlzcGF0Y2goXCJiZWZvcmVzZW5kXCIsIFwicHJvZ3Jlc3NcIiwgXCJsb2FkXCIsIFwiZXJyb3JcIiksXG4gICAgICBtaW1lVHlwZSxcbiAgICAgIGhlYWRlcnMgPSBkM0NvbGxlY3Rpb24ubWFwKCksXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QsXG4gICAgICB1c2VyID0gbnVsbCxcbiAgICAgIHBhc3N3b3JkID0gbnVsbCxcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgcmVzcG9uc2VUeXBlLFxuICAgICAgdGltZW91dCA9IDA7XG5cbiAgLy8gSWYgSUUgZG9lcyBub3Qgc3VwcG9ydCBDT1JTLCB1c2UgWERvbWFpblJlcXVlc3QuXG4gIGlmICh0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICYmICEoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpXG4gICAgICAmJiAvXihodHRwKHMpPzopP1xcL1xcLy8udGVzdCh1cmwpKSB4aHIgPSBuZXcgWERvbWFpblJlcXVlc3Q7XG5cbiAgXCJvbmxvYWRcIiBpbiB4aHJcbiAgICAgID8geGhyLm9ubG9hZCA9IHhoci5vbmVycm9yID0geGhyLm9udGltZW91dCA9IHJlc3BvbmRcbiAgICAgIDogeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKG8pIHsgeGhyLnJlYWR5U3RhdGUgPiAzICYmIHJlc3BvbmQobyk7IH07XG5cbiAgZnVuY3Rpb24gcmVzcG9uZChvKSB7XG4gICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMsIHJlc3VsdDtcbiAgICBpZiAoIXN0YXR1cyAmJiBoYXNSZXNwb25zZSh4aHIpXG4gICAgICAgIHx8IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwXG4gICAgICAgIHx8IHN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSByZXNwb25zZS5jYWxsKHJlcXVlc3QsIHhocik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB4aHI7XG4gICAgICB9XG4gICAgICBldmVudC5jYWxsKFwibG9hZFwiLCByZXF1ZXN0LCByZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgbyk7XG4gICAgfVxuICB9XG5cbiAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgZXZlbnQuY2FsbChcInByb2dyZXNzXCIsIHJlcXVlc3QsIGUpO1xuICB9O1xuXG4gIHJlcXVlc3QgPSB7XG4gICAgaGVhZGVyOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGhlYWRlcnMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIGhlYWRlcnMucmVtb3ZlKG5hbWUpO1xuICAgICAgZWxzZSBoZWFkZXJzLnNldChuYW1lLCB2YWx1ZSArIFwiXCIpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIElmIG1pbWVUeXBlIGlzIG5vbi1udWxsIGFuZCBubyBBY2NlcHQgaGVhZGVyIGlzIHNldCwgYSBkZWZhdWx0IGlzIHVzZWQuXG4gICAgbWltZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtaW1lVHlwZTtcbiAgICAgIG1pbWVUeXBlID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCI7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmaWVzIHdoYXQgdHlwZSB0aGUgcmVzcG9uc2UgdmFsdWUgc2hvdWxkIHRha2U7XG4gICAgLy8gZm9yIGluc3RhbmNlLCBhcnJheWJ1ZmZlciwgYmxvYiwgZG9jdW1lbnQsIG9yIHRleHQuXG4gICAgcmVzcG9uc2VUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmVzcG9uc2VUeXBlO1xuICAgICAgcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdGltZW91dDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpbWVvdXQ7XG4gICAgICB0aW1lb3V0ID0gK3ZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyB1c2VyIDogKHVzZXIgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIHBhc3N3b3JkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gcGFzc3dvcmQgOiAocGFzc3dvcmQgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZnkgaG93IHRvIGNvbnZlcnQgdGhlIHJlc3BvbnNlIGNvbnRlbnQgdG8gYSBzcGVjaWZpYyB0eXBlO1xuICAgIC8vIGNoYW5nZXMgdGhlIGNhbGxiYWNrIHZhbHVlIG9uIFwibG9hZFwiIGV2ZW50cy5cbiAgICByZXNwb25zZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJHRVRcIiwg4oCmKS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiR0VUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJQT1NUXCIsIOKApikuXG4gICAgcG9zdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJQT1NUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgY2FsbGJhY2sgaXMgbm9uLW51bGwsIGl0IHdpbGwgYmUgdXNlZCBmb3IgZXJyb3IgYW5kIGxvYWQgZXZlbnRzLlxuICAgIHNlbmQ6IGZ1bmN0aW9uKG1ldGhvZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlLCB1c2VyLCBwYXNzd29yZCk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoXCJhY2NlcHRcIikpIGhlYWRlcnMuc2V0KFwiYWNjZXB0XCIsIG1pbWVUeXBlICsgXCIsKi8qXCIpO1xuICAgICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSBoZWFkZXJzLmVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpOyB9KTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKSB4aHIub3ZlcnJpZGVNaW1lVHlwZShtaW1lVHlwZSk7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlICE9IG51bGwpIHhoci5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG4gICAgICBpZiAodGltZW91dCA+IDApIHhoci50aW1lb3V0ID0gdGltZW91dDtcbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiBjYWxsYmFjay5sZW5ndGggPT09IDEpIGNhbGxiYWNrID0gZml4Q2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHJlcXVlc3Qub24oXCJlcnJvclwiLCBjYWxsYmFjaykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKHhocikgeyBjYWxsYmFjayhudWxsLCB4aHIpOyB9KTtcbiAgICAgIGV2ZW50LmNhbGwoXCJiZWZvcmVzZW5kXCIsIHJlcXVlc3QsIHhocik7XG4gICAgICB4aHIuc2VuZChkYXRhID09IG51bGwgPyBudWxsIDogZGF0YSk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgYWJvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgeGhyLmFib3J0KCk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgb246IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlID0gZXZlbnQub24uYXBwbHkoZXZlbnQsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IGV2ZW50ID8gcmVxdWVzdCA6IHZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHJlcXVlc3QuZ2V0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZnVuY3Rpb24gZml4Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yLCB4aHIpIHtcbiAgICBjYWxsYmFjayhlcnJvciA9PSBudWxsID8geGhyIDogbnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhc1Jlc3BvbnNlKHhocikge1xuICB2YXIgdHlwZSA9IHhoci5yZXNwb25zZVR5cGU7XG4gIHJldHVybiB0eXBlICYmIHR5cGUgIT09IFwidGV4dFwiXG4gICAgICA/IHhoci5yZXNwb25zZSAvLyBudWxsIG9uIGVycm9yXG4gICAgICA6IHhoci5yZXNwb25zZVRleHQ7IC8vIFwiXCIgb24gZXJyb3Jcbn1cblxudmFyIHR5cGUgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHJlc3BvbnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKS5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgICByZXR1cm4gci5nZXQoY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfTtcbn07XG5cbnZhciBodG1sID0gdHlwZShcInRleHQvaHRtbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciBqc29uID0gdHlwZShcImFwcGxpY2F0aW9uL2pzb25cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciB0ZXh0ID0gdHlwZShcInRleHQvcGxhaW5cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiB4aHIucmVzcG9uc2VUZXh0O1xufSk7XG5cbnZhciB4bWwgPSB0eXBlKFwiYXBwbGljYXRpb24veG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICB2YXIgeG1sID0geGhyLnJlc3BvbnNlWE1MO1xuICBpZiAoIXhtbCkgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgZXJyb3JcIik7XG4gIHJldHVybiB4bWw7XG59KTtcblxudmFyIGRzdiA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcGFyc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgcm93LCBjYWxsYmFjaykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgY2FsbGJhY2sgPSByb3csIHJvdyA9IG51bGw7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKTtcbiAgICByLnJvdyA9IGZ1bmN0aW9uKF8pIHsgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyByLnJlc3BvbnNlKHJlc3BvbnNlT2YocGFyc2UsIHJvdyA9IF8pKSA6IHJvdzsgfTtcbiAgICByLnJvdyhyb3cpO1xuICAgIHJldHVybiBjYWxsYmFjayA/IHIuZ2V0KGNhbGxiYWNrKSA6IHI7XG4gIH07XG59O1xuXG5mdW5jdGlvbiByZXNwb25zZU9mKHBhcnNlLCByb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QkJDEpIHtcbiAgICByZXR1cm4gcGFyc2UocmVxdWVzdCQkMS5yZXNwb25zZVRleHQsIHJvdyk7XG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCJ0ZXh0L2NzdlwiLCBkM0Rzdi5jc3ZQYXJzZSk7XG5cbnZhciB0c3YgPSBkc3YoXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsIGQzRHN2LnRzdlBhcnNlKTtcblxuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbmV4cG9ydHMuaHRtbCA9IGh0bWw7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy50ZXh0ID0gdGV4dDtcbmV4cG9ydHMueG1sID0geG1sO1xuZXhwb3J0cy5jc3YgPSBjc3Y7XG5leHBvcnRzLnRzdiA9IHRzdjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIiFmdW5jdGlvbihlLG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4ocmVxdWlyZShcImQzLXJlcXVlc3RcIikpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZDMtcmVxdWVzdFwiXSxuKTooZS5kMz1lLmQzfHx7fSxlLmQzLnByb21pc2U9bihlLmQzKSl9KHRoaXMsZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlLG4pe3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgdD1hcmd1bWVudHMubGVuZ3RoLHI9QXJyYXkodCksbz0wO3Q+bztvKyspcltvXT1hcmd1bWVudHNbb107cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHQsbyl7dmFyIHU9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gZT92b2lkIG8oRXJyb3IoZSkpOnZvaWQgdChuKX07bi5hcHBseShlLHIuY29uY2F0KHUpKX0pfX12YXIgdD17fTtyZXR1cm5bXCJjc3ZcIixcInRzdlwiLFwianNvblwiLFwieG1sXCIsXCJ0ZXh0XCIsXCJodG1sXCJdLmZvckVhY2goZnVuY3Rpb24ocil7dFtyXT1uKGUsZVtyXSl9KSx0fSk7IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG52YXIgZDMgPSByZXF1aXJlKCdkMy5wcm9taXNlJyk7XG5cbmZ1bmN0aW9uIGRlZihhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xufVxuLypcbk1hbmFnZXMgZmV0Y2hpbmcgYSBkYXRhc2V0IGZyb20gU29jcmF0YSBhbmQgcHJlcGFyaW5nIGl0IGZvciB2aXN1YWxpc2F0aW9uIGJ5XG5jb3VudGluZyBmaWVsZCB2YWx1ZSBmcmVxdWVuY2llcyBldGMuIFxuKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VEYXRhIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhSWQsIGFjdGl2ZUNlbnN1c1llYXIpIHtcbiAgICAgICAgdGhpcy5kYXRhSWQgPSBkYXRhSWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciA9IGRlZihhY3RpdmVDZW5zdXNZZWFyLCAyMDE1KTtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gdW5kZWZpbmVkOyAgLy8gbmFtZSBvZiBjb2x1bW4gd2hpY2ggaG9sZHMgbGF0L2xvbiBvciBibG9jayBJRFxuICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHVuZGVmaW5lZDsgLy8gaWYgdGhlIGRhdGFzZXQgdHlwZSBpcyAncG9pbnQnICh1c2VkIGZvciBwYXJzaW5nIGxvY2F0aW9uIGZpZWxkKVxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gW107ICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgbnVtZXJpYyBkYXRhdmlzXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBbXTsgICAgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBlbnVtIGRhdGF2aXNcbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gW107ICAgICAgICAgIC8vIG5hbWVzIG9mIG90aGVyIGNvbHVtbnNcbiAgICAgICAgdGhpcy5taW5zID0ge307ICAgICAgICAgICAgICAgICAgIC8vIG1pbiBhbmQgbWF4IG9mIGVhY2ggbnVtZXJpYyBjb2x1bW5cbiAgICAgICAgdGhpcy5tYXhzID0ge307XG4gICAgICAgIHRoaXMuZnJlcXVlbmNpZXMgPSB7fTsgICAgICAgICAgICAvLyBcbiAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llcyA9IHt9OyAgICAgIC8vIG1vc3QgZnJlcXVlbnQgdmFsdWVzIGluIGVhY2ggdGV4dCBjb2x1bW5cbiAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2ludCc7ICAgICAgICAgICAgIC8vIHBvaW50IG9yIHBvbHlnb24gKENMVUUgYmxvY2spXG4gICAgICAgIHRoaXMucm93cyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBwcm9jZXNzZWQgcm93c1xuICAgICAgICB0aGlzLmJsb2NrSW5kZXggPSB7fTsgICAgICAgICAgICAgLy8gY2FjaGUgb2YgQ0xVRSBibG9jayBJRHNcbiAgICB9XG5cblxuICAgIGNob29zZUNvbHVtblR5cGVzIChjb2x1bW5zKSB7XG4gICAgICAgIC8vdmFyIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JyB8fCBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIC8vIFwibG9jYXRpb25cIiBhbmQgXCJwb2ludFwiIGFyZSBib3RoIHBvaW50IGRhdGEgdHlwZXMsIGV4cHJlc3NlZCBkaWZmZXJlbnRseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhIFwiYmxvY2sgSURcIiBjYW4gYmUgam9pbmVkIGFnYWluc3QgdGhlIENMVUUgQmxvY2sgcG9seWdvbnMgd2hpY2ggYXJlIGluIE1hcGJveC5cbiAgICAgICAgbGV0IGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylbMF07XG4gICAgICAgIGlmICghbGMpIHtcbiAgICAgICAgICAgIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGxjLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdHJ1ZTtcblxuICAgICAgICBpZiAobGMubmFtZSA9PT0gJ0Jsb2NrIElEJykge1xuICAgICAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2x5Z29uJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSBsYy5uYW1lO1xuXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sICE9PSBsYyk7XG5cbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdudW1iZXInICYmIGNvbC5uYW1lICE9PSAnTGF0aXR1ZGUnICYmIGNvbC5uYW1lICE9PSAnTG9uZ2l0dWRlJylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB7IHRoaXMubWluc1tjb2xdID0gMWU5OyB0aGlzLm1heHNbY29sXSA9IC0xZTk7IH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICd0ZXh0JylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcblxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdID0ge30pO1xuXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKVxuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gdGhpcy5udW1lcmljQ29sdW1ucy5pbmRleE9mKGNvbCkgPCAwICYmIHRoaXMudGV4dENvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyBiZXR0ZXIgbmFtZSBhbmQgYmVoYXZpb3VyXG4gICAgZmlsdGVyKHJvdykge1xuICAgICAgICAvLyBUT0RPIG1vdmUgdGhpcyBzb21ld2hlcmUgYmV0dGVyXG4gICAgICAgIGlmIChyb3dbJ0NMVUUgc21hbGwgYXJlYSddICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gPT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChyb3dbJ0NlbnN1cyB5ZWFyJ10gJiYgcm93WydDZW5zdXMgeWVhciddICE9PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICAvLyBjb252ZXJ0IG51bWVyaWMgY29sdW1ucyB0byBudW1iZXJzIGZvciBkYXRhIHZpc1xuICAgIGNvbnZlcnRSb3cocm93KSB7XG5cbiAgICAgICAgLy8gY29udmVydCBsb2NhdGlvbiB0eXBlcyAoc3RyaW5nKSB0byBbbG9uLCBsYXRdIGFycmF5LlxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvblRvQ29vcmRzKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvY2F0aW9uKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICAvLyBcIm5ldyBiYWNrZW5kXCIgZGF0YXNldHMgdXNlIGEgV0tUIGZpZWxkIFtQT0lOVCAobG9uIGxhdCldIGluc3RlYWQgb2YgKGxhdCwgbG9uKVxuICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25Jc1BvaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uLnJlcGxhY2UoJ1BPSU5UICgnLCAnJykucmVwbGFjZSgnKScsICcnKS5zcGxpdCgnICcpLm1hcChuID0+IE51bWJlcihuKSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGxvY2F0aW9uLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMV0ucmVwbGFjZSgnKScsICcnKSksIE51bWJlcihsb2NhdGlvbi5zcGxpdCgnLCAnKVswXS5yZXBsYWNlKCcoJywgJycpKV07XG4gICAgICAgICAgICB9IGVsc2UgXG4gICAgICAgICAgICByZXR1cm4gbG9jYXRpb247XG5cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRPRE8gdXNlIGNvbHVtbi5jYWNoZWRDb250ZW50cy5zbWFsbGVzdCBhbmQgLmxhcmdlc3RcbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICByb3dbY29sXSA9IE51bWJlcihyb3dbY29sXSkgOyAvLyArcm93W2NvbF0gYXBwYXJlbnRseSBmYXN0ZXIsIGJ1dCBicmVha3Mgb24gc2ltcGxlIHRoaW5ncyBsaWtlIGJsYW5rIHZhbHVlc1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3Qgd2FudCB0byBpbmNsdWRlIHRoZSB0b3RhbCB2YWx1ZXMgaW4gXG4gICAgICAgICAgICBpZiAocm93W2NvbF0gPCB0aGlzLm1pbnNbY29sXSAmJiB0aGlzLmZpbHRlcihyb3cpKVxuICAgICAgICAgICAgICAgIHRoaXMubWluc1tjb2xdID0gcm93W2NvbF07XG5cbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA+IHRoaXMubWF4c1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5tYXhzW2NvbF0gPSByb3dbY29sXTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMuZm9yRWFjaChjb2wgPT4ge1xuICAgICAgICAgICAgdmFyIHZhbCA9IHJvd1tjb2xdO1xuICAgICAgICAgICAgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gPSAodGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbF0gfHwgMCkgKyAxO1xuICAgICAgICB9KTtcblxuICAgICAgICByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0gPSBsb2NhdGlvblRvQ29vcmRzLmNhbGwodGhpcywgcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKTtcblxuXG5cbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBjb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKSB7XG4gICAgICAgIHZhciBuZXdUZXh0Q29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXSA9IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSlcbiAgICAgICAgICAgICAgICAuc29ydCgodmFsYSwgdmFsYikgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGFdIDwgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGJdID8gMSA6IC0xKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLDEyKTtcblxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoIDwgMiB8fCBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA+IDIwICYmIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF1bMV1dIDw9IDUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCdzIGJvcmluZyBpZiBhbGwgdmFsdWVzIHRoZSBzYW1lLCBvciBpZiB0b28gbWFueSBkaWZmZXJlbnQgdmFsdWVzIChhcyBqdWRnZWQgYnkgc2Vjb25kLW1vc3QgY29tbW9uIHZhbHVlIGJlaW5nIDUgdGltZXMgb3IgZmV3ZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VGV4dENvbHVtbnMucHVzaChjb2wpOyAvLyBob3cgZG8geW91IHNhZmVseSBkZWxldGUgZnJvbSBhcnJheSB5b3UncmUgbG9vcGluZyBvdmVyP1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBuZXdUZXh0Q29sdW1ucztcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzKTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSByb3dzIGZyb20gU29jcmF0YSAocmV0dXJucyBQcm9taXNlKS4gXCJOZXcgYmFja2VuZFwiIHZpZXdzIGdvIHRocm91Z2ggYW4gYWRkaXRpb25hbCBzdGVwIHRvIGZpbmQgdGhlIHJlYWxcbiAgICAvLyBBUEkgZW5kcG9pbnQuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy5qc29uJylcbiAgICAgICAgLnRoZW4ocHJvcHMgPT4ge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5uZXdCYWNrZW5kICYmIHByb3BzLmNoaWxkVmlld3MubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhSWQgPSBwcm9wcy5jaGlsZFZpZXdzWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihwcm9wcyA9PiB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBkMy5jc3YoJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy9yb3dzLmNzdj9hY2Nlc3NUeXBlPURPV05MT0FEJywgdGhpcy5jb252ZXJ0Um93LmJpbmQodGhpcykpXG4gICAgICAgICAgICAudGhlbihyb3dzID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLnJvd3MgPSByb3dzO1xuICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZVNvcnRlZEZyZXF1ZW5jaWVzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hhcGUgPT09ICdwb2x5Z29uJylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jb21wdXRlQmxvY2tJbmRleCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gQ3JlYXRlIGEgaGFzaCB0YWJsZSBsb29rdXAgZnJvbSBbeWVhciwgYmxvY2sgSURdIHRvIGRhdGFzZXQgcm93XG4gICAgY29tcHV0ZUJsb2NrSW5kZXgoKSB7XG4gICAgICAgIHRoaXMucm93cy5mb3JFYWNoKChyb3csIGluZGV4KSA9PiB7XG4gICAgICAgICAgICBpZiAodGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV0gPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9IHt9O1xuICAgICAgICAgICAgdGhpcy5ibG9ja0luZGV4W3Jvd1snQ2Vuc3VzIHllYXInXV1bcm93WydCbG9jayBJRCddXSA9IGluZGV4O1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBnZXRSb3dGb3JCbG9jayhibG9ja0lkIC8qIGNlbnN1c195ZWFyICovKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJvd3NbdGhpcy5ibG9ja0luZGV4W3RoaXMuYWN0aXZlQ2Vuc3VzWWVhcl1bYmxvY2tJZF1dO1xuICAgIH1cblxuICAgIGZpbHRlcmVkUm93cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93cy5maWx0ZXIocm93ID0+IHJvd1snQ2Vuc3VzIHllYXInXSA9PT0gdGhpcy5hY3RpdmVDZW5zdXNZZWFyICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gIT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpO1xuICAgIH1cbn0iXX0=

(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function (process){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

// resolves . and .. elements in a path array with directory names there
// must be no slashes, empty elements, or device names (c:\) in the array
// (so also no leading and trailing slashes - it does not distinguish
// relative and absolute paths)
function normalizeArray(parts, allowAboveRoot) {
  // if the path tries to go above the root, `up` ends up > 0
  var up = 0;
  for (var i = parts.length - 1; i >= 0; i--) {
    var last = parts[i];
    if (last === '.') {
      parts.splice(i, 1);
    } else if (last === '..') {
      parts.splice(i, 1);
      up++;
    } else if (up) {
      parts.splice(i, 1);
      up--;
    }
  }

  // if the path is allowed to go above the root, restore leading ..s
  if (allowAboveRoot) {
    for (; up--; up) {
      parts.unshift('..');
    }
  }

  return parts;
}

// Split a filename into [root, dir, basename, ext], unix version
// 'root' is just a slash, or nothing.
var splitPathRe =
    /^(\/?|)([\s\S]*?)((?:\.{1,2}|[^\/]+?|)(\.[^.\/]*|))(?:[\/]*)$/;
var splitPath = function(filename) {
  return splitPathRe.exec(filename).slice(1);
};

// path.resolve([from ...], to)
// posix version
exports.resolve = function() {
  var resolvedPath = '',
      resolvedAbsolute = false;

  for (var i = arguments.length - 1; i >= -1 && !resolvedAbsolute; i--) {
    var path = (i >= 0) ? arguments[i] : process.cwd();

    // Skip empty and invalid entries
    if (typeof path !== 'string') {
      throw new TypeError('Arguments to path.resolve must be strings');
    } else if (!path) {
      continue;
    }

    resolvedPath = path + '/' + resolvedPath;
    resolvedAbsolute = path.charAt(0) === '/';
  }

  // At this point the path should be resolved to a full absolute path, but
  // handle relative paths to be safe (might happen when process.cwd() fails)

  // Normalize the path
  resolvedPath = normalizeArray(filter(resolvedPath.split('/'), function(p) {
    return !!p;
  }), !resolvedAbsolute).join('/');

  return ((resolvedAbsolute ? '/' : '') + resolvedPath) || '.';
};

// path.normalize(path)
// posix version
exports.normalize = function(path) {
  var isAbsolute = exports.isAbsolute(path),
      trailingSlash = substr(path, -1) === '/';

  // Normalize the path
  path = normalizeArray(filter(path.split('/'), function(p) {
    return !!p;
  }), !isAbsolute).join('/');

  if (!path && !isAbsolute) {
    path = '.';
  }
  if (path && trailingSlash) {
    path += '/';
  }

  return (isAbsolute ? '/' : '') + path;
};

// posix version
exports.isAbsolute = function(path) {
  return path.charAt(0) === '/';
};

// posix version
exports.join = function() {
  var paths = Array.prototype.slice.call(arguments, 0);
  return exports.normalize(filter(paths, function(p, index) {
    if (typeof p !== 'string') {
      throw new TypeError('Arguments to path.join must be strings');
    }
    return p;
  }).join('/'));
};


// path.relative(from, to)
// posix version
exports.relative = function(from, to) {
  from = exports.resolve(from).substr(1);
  to = exports.resolve(to).substr(1);

  function trim(arr) {
    var start = 0;
    for (; start < arr.length; start++) {
      if (arr[start] !== '') break;
    }

    var end = arr.length - 1;
    for (; end >= 0; end--) {
      if (arr[end] !== '') break;
    }

    if (start > end) return [];
    return arr.slice(start, end - start + 1);
  }

  var fromParts = trim(from.split('/'));
  var toParts = trim(to.split('/'));

  var length = Math.min(fromParts.length, toParts.length);
  var samePartsLength = length;
  for (var i = 0; i < length; i++) {
    if (fromParts[i] !== toParts[i]) {
      samePartsLength = i;
      break;
    }
  }

  var outputParts = [];
  for (var i = samePartsLength; i < fromParts.length; i++) {
    outputParts.push('..');
  }

  outputParts = outputParts.concat(toParts.slice(samePartsLength));

  return outputParts.join('/');
};

exports.sep = '/';
exports.delimiter = ':';

exports.dirname = function(path) {
  var result = splitPath(path),
      root = result[0],
      dir = result[1];

  if (!root && !dir) {
    // No dirname whatsoever
    return '.';
  }

  if (dir) {
    // It has a dirname, strip trailing slash
    dir = dir.substr(0, dir.length - 1);
  }

  return root + dir;
};


exports.basename = function(path, ext) {
  var f = splitPath(path)[2];
  // TODO: make this comparison case-insensitive on windows?
  if (ext && f.substr(-1 * ext.length) === ext) {
    f = f.substr(0, f.length - ext.length);
  }
  return f;
};


exports.extname = function(path) {
  return splitPath(path)[3];
};

function filter (xs, f) {
    if (xs.filter) return xs.filter(f);
    var res = [];
    for (var i = 0; i < xs.length; i++) {
        if (f(xs[i], i, xs)) res.push(xs[i]);
    }
    return res;
}

// String.prototype.substr - negative index don't work in IE8
var substr = 'ab'.substr(-1) === 'b'
    ? function (str, start, len) { return str.substr(start, len) }
    : function (str, start, len) {
        if (start < 0) start = str.length + start;
        return str.substr(start, len);
    }
;

}).call(this,require('_process'))
},{"_process":2}],2:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
if (typeof Object.create === 'function') {
  // implementation from standard node.js 'util' module
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    ctor.prototype = Object.create(superCtor.prototype, {
      constructor: {
        value: ctor,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
  };
} else {
  // old school shim for old browsers
  module.exports = function inherits(ctor, superCtor) {
    ctor.super_ = superCtor
    var TempCtor = function () {}
    TempCtor.prototype = superCtor.prototype
    ctor.prototype = new TempCtor()
    ctor.prototype.constructor = ctor
  }
}

},{}],4:[function(require,module,exports){
module.exports = function isBuffer(arg) {
  return arg && typeof arg === 'object'
    && typeof arg.copy === 'function'
    && typeof arg.fill === 'function'
    && typeof arg.readUInt8 === 'function';
}
},{}],5:[function(require,module,exports){
(function (process,global){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

var formatRegExp = /%[sdj%]/g;
exports.format = function(f) {
  if (!isString(f)) {
    var objects = [];
    for (var i = 0; i < arguments.length; i++) {
      objects.push(inspect(arguments[i]));
    }
    return objects.join(' ');
  }

  var i = 1;
  var args = arguments;
  var len = args.length;
  var str = String(f).replace(formatRegExp, function(x) {
    if (x === '%%') return '%';
    if (i >= len) return x;
    switch (x) {
      case '%s': return String(args[i++]);
      case '%d': return Number(args[i++]);
      case '%j':
        try {
          return JSON.stringify(args[i++]);
        } catch (_) {
          return '[Circular]';
        }
      default:
        return x;
    }
  });
  for (var x = args[i]; i < len; x = args[++i]) {
    if (isNull(x) || !isObject(x)) {
      str += ' ' + x;
    } else {
      str += ' ' + inspect(x);
    }
  }
  return str;
};


// Mark that a method should not be used.
// Returns a modified function which warns once by default.
// If --no-deprecation is set, then it is a no-op.
exports.deprecate = function(fn, msg) {
  // Allow for deprecating things in the process of starting up.
  if (isUndefined(global.process)) {
    return function() {
      return exports.deprecate(fn, msg).apply(this, arguments);
    };
  }

  if (process.noDeprecation === true) {
    return fn;
  }

  var warned = false;
  function deprecated() {
    if (!warned) {
      if (process.throwDeprecation) {
        throw new Error(msg);
      } else if (process.traceDeprecation) {
        console.trace(msg);
      } else {
        console.error(msg);
      }
      warned = true;
    }
    return fn.apply(this, arguments);
  }

  return deprecated;
};


var debugs = {};
var debugEnviron;
exports.debuglog = function(set) {
  if (isUndefined(debugEnviron))
    debugEnviron = process.env.NODE_DEBUG || '';
  set = set.toUpperCase();
  if (!debugs[set]) {
    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
      var pid = process.pid;
      debugs[set] = function() {
        var msg = exports.format.apply(exports, arguments);
        console.error('%s %d: %s', set, pid, msg);
      };
    } else {
      debugs[set] = function() {};
    }
  }
  return debugs[set];
};


/**
 * Echos the value of a value. Trys to print the value out
 * in the best way possible given the different types.
 *
 * @param {Object} obj The object to print out.
 * @param {Object} opts Optional options object that alters the output.
 */
/* legacy: obj, showHidden, depth, colors*/
function inspect(obj, opts) {
  // default options
  var ctx = {
    seen: [],
    stylize: stylizeNoColor
  };
  // legacy...
  if (arguments.length >= 3) ctx.depth = arguments[2];
  if (arguments.length >= 4) ctx.colors = arguments[3];
  if (isBoolean(opts)) {
    // legacy...
    ctx.showHidden = opts;
  } else if (opts) {
    // got an "options" object
    exports._extend(ctx, opts);
  }
  // set default options
  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
  if (isUndefined(ctx.depth)) ctx.depth = 2;
  if (isUndefined(ctx.colors)) ctx.colors = false;
  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
  if (ctx.colors) ctx.stylize = stylizeWithColor;
  return formatValue(ctx, obj, ctx.depth);
}
exports.inspect = inspect;


// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
inspect.colors = {
  'bold' : [1, 22],
  'italic' : [3, 23],
  'underline' : [4, 24],
  'inverse' : [7, 27],
  'white' : [37, 39],
  'grey' : [90, 39],
  'black' : [30, 39],
  'blue' : [34, 39],
  'cyan' : [36, 39],
  'green' : [32, 39],
  'magenta' : [35, 39],
  'red' : [31, 39],
  'yellow' : [33, 39]
};

// Don't use 'blue' not visible on cmd.exe
inspect.styles = {
  'special': 'cyan',
  'number': 'yellow',
  'boolean': 'yellow',
  'undefined': 'grey',
  'null': 'bold',
  'string': 'green',
  'date': 'magenta',
  // "name": intentionally not styling
  'regexp': 'red'
};


function stylizeWithColor(str, styleType) {
  var style = inspect.styles[styleType];

  if (style) {
    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
           '\u001b[' + inspect.colors[style][1] + 'm';
  } else {
    return str;
  }
}


function stylizeNoColor(str, styleType) {
  return str;
}


function arrayToHash(array) {
  var hash = {};

  array.forEach(function(val, idx) {
    hash[val] = true;
  });

  return hash;
}


function formatValue(ctx, value, recurseTimes) {
  // Provide a hook for user-specified inspect functions.
  // Check that value is an object with an inspect function on it
  if (ctx.customInspect &&
      value &&
      isFunction(value.inspect) &&
      // Filter out the util module, it's inspect function is special
      value.inspect !== exports.inspect &&
      // Also filter out any prototype objects using the circular check.
      !(value.constructor && value.constructor.prototype === value)) {
    var ret = value.inspect(recurseTimes, ctx);
    if (!isString(ret)) {
      ret = formatValue(ctx, ret, recurseTimes);
    }
    return ret;
  }

  // Primitive types cannot have properties
  var primitive = formatPrimitive(ctx, value);
  if (primitive) {
    return primitive;
  }

  // Look up the keys of the object.
  var keys = Object.keys(value);
  var visibleKeys = arrayToHash(keys);

  if (ctx.showHidden) {
    keys = Object.getOwnPropertyNames(value);
  }

  // IE doesn't make error fields non-enumerable
  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
  if (isError(value)
      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
    return formatError(value);
  }

  // Some type of object without properties can be shortcutted.
  if (keys.length === 0) {
    if (isFunction(value)) {
      var name = value.name ? ': ' + value.name : '';
      return ctx.stylize('[Function' + name + ']', 'special');
    }
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    }
    if (isDate(value)) {
      return ctx.stylize(Date.prototype.toString.call(value), 'date');
    }
    if (isError(value)) {
      return formatError(value);
    }
  }

  var base = '', array = false, braces = ['{', '}'];

  // Make Array say that they are Array
  if (isArray(value)) {
    array = true;
    braces = ['[', ']'];
  }

  // Make functions say that they are functions
  if (isFunction(value)) {
    var n = value.name ? ': ' + value.name : '';
    base = ' [Function' + n + ']';
  }

  // Make RegExps say that they are RegExps
  if (isRegExp(value)) {
    base = ' ' + RegExp.prototype.toString.call(value);
  }

  // Make dates with properties first say the date
  if (isDate(value)) {
    base = ' ' + Date.prototype.toUTCString.call(value);
  }

  // Make error with message first say the error
  if (isError(value)) {
    base = ' ' + formatError(value);
  }

  if (keys.length === 0 && (!array || value.length == 0)) {
    return braces[0] + base + braces[1];
  }

  if (recurseTimes < 0) {
    if (isRegExp(value)) {
      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
    } else {
      return ctx.stylize('[Object]', 'special');
    }
  }

  ctx.seen.push(value);

  var output;
  if (array) {
    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
  } else {
    output = keys.map(function(key) {
      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
    });
  }

  ctx.seen.pop();

  return reduceToSingleString(output, base, braces);
}


function formatPrimitive(ctx, value) {
  if (isUndefined(value))
    return ctx.stylize('undefined', 'undefined');
  if (isString(value)) {
    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
                                             .replace(/'/g, "\\'")
                                             .replace(/\\"/g, '"') + '\'';
    return ctx.stylize(simple, 'string');
  }
  if (isNumber(value))
    return ctx.stylize('' + value, 'number');
  if (isBoolean(value))
    return ctx.stylize('' + value, 'boolean');
  // For some reason typeof null is "object", so special case here.
  if (isNull(value))
    return ctx.stylize('null', 'null');
}


function formatError(value) {
  return '[' + Error.prototype.toString.call(value) + ']';
}


function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
  var output = [];
  for (var i = 0, l = value.length; i < l; ++i) {
    if (hasOwnProperty(value, String(i))) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          String(i), true));
    } else {
      output.push('');
    }
  }
  keys.forEach(function(key) {
    if (!key.match(/^\d+$/)) {
      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
          key, true));
    }
  });
  return output;
}


function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
  var name, str, desc;
  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
  if (desc.get) {
    if (desc.set) {
      str = ctx.stylize('[Getter/Setter]', 'special');
    } else {
      str = ctx.stylize('[Getter]', 'special');
    }
  } else {
    if (desc.set) {
      str = ctx.stylize('[Setter]', 'special');
    }
  }
  if (!hasOwnProperty(visibleKeys, key)) {
    name = '[' + key + ']';
  }
  if (!str) {
    if (ctx.seen.indexOf(desc.value) < 0) {
      if (isNull(recurseTimes)) {
        str = formatValue(ctx, desc.value, null);
      } else {
        str = formatValue(ctx, desc.value, recurseTimes - 1);
      }
      if (str.indexOf('\n') > -1) {
        if (array) {
          str = str.split('\n').map(function(line) {
            return '  ' + line;
          }).join('\n').substr(2);
        } else {
          str = '\n' + str.split('\n').map(function(line) {
            return '   ' + line;
          }).join('\n');
        }
      }
    } else {
      str = ctx.stylize('[Circular]', 'special');
    }
  }
  if (isUndefined(name)) {
    if (array && key.match(/^\d+$/)) {
      return str;
    }
    name = JSON.stringify('' + key);
    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
      name = name.substr(1, name.length - 2);
      name = ctx.stylize(name, 'name');
    } else {
      name = name.replace(/'/g, "\\'")
                 .replace(/\\"/g, '"')
                 .replace(/(^"|"$)/g, "'");
      name = ctx.stylize(name, 'string');
    }
  }

  return name + ': ' + str;
}


function reduceToSingleString(output, base, braces) {
  var numLinesEst = 0;
  var length = output.reduce(function(prev, cur) {
    numLinesEst++;
    if (cur.indexOf('\n') >= 0) numLinesEst++;
    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
  }, 0);

  if (length > 60) {
    return braces[0] +
           (base === '' ? '' : base + '\n ') +
           ' ' +
           output.join(',\n  ') +
           ' ' +
           braces[1];
  }

  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
}


// NOTE: These type checking functions intentionally don't use `instanceof`
// because it is fragile and can be easily faked with `Object.create()`.
function isArray(ar) {
  return Array.isArray(ar);
}
exports.isArray = isArray;

function isBoolean(arg) {
  return typeof arg === 'boolean';
}
exports.isBoolean = isBoolean;

function isNull(arg) {
  return arg === null;
}
exports.isNull = isNull;

function isNullOrUndefined(arg) {
  return arg == null;
}
exports.isNullOrUndefined = isNullOrUndefined;

function isNumber(arg) {
  return typeof arg === 'number';
}
exports.isNumber = isNumber;

function isString(arg) {
  return typeof arg === 'string';
}
exports.isString = isString;

function isSymbol(arg) {
  return typeof arg === 'symbol';
}
exports.isSymbol = isSymbol;

function isUndefined(arg) {
  return arg === void 0;
}
exports.isUndefined = isUndefined;

function isRegExp(re) {
  return isObject(re) && objectToString(re) === '[object RegExp]';
}
exports.isRegExp = isRegExp;

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}
exports.isObject = isObject;

function isDate(d) {
  return isObject(d) && objectToString(d) === '[object Date]';
}
exports.isDate = isDate;

function isError(e) {
  return isObject(e) &&
      (objectToString(e) === '[object Error]' || e instanceof Error);
}
exports.isError = isError;

function isFunction(arg) {
  return typeof arg === 'function';
}
exports.isFunction = isFunction;

function isPrimitive(arg) {
  return arg === null ||
         typeof arg === 'boolean' ||
         typeof arg === 'number' ||
         typeof arg === 'string' ||
         typeof arg === 'symbol' ||  // ES6 symbol
         typeof arg === 'undefined';
}
exports.isPrimitive = isPrimitive;

exports.isBuffer = require('./support/isBuffer');

function objectToString(o) {
  return Object.prototype.toString.call(o);
}


function pad(n) {
  return n < 10 ? '0' + n.toString(10) : n.toString(10);
}


var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep',
              'Oct', 'Nov', 'Dec'];

// 26 Feb 16:19:34
function timestamp() {
  var d = new Date();
  var time = [pad(d.getHours()),
              pad(d.getMinutes()),
              pad(d.getSeconds())].join(':');
  return [d.getDate(), months[d.getMonth()], time].join(' ');
}


// log is just a thin wrapper to console.log that prepends a timestamp
exports.log = function() {
  console.log('%s - %s', timestamp(), exports.format.apply(exports, arguments));
};


/**
 * Inherit the prototype methods from one constructor into another.
 *
 * The Function.prototype.inherits from lang.js rewritten as a standalone
 * function (not on Function.prototype). NOTE: If this file is to be loaded
 * during bootstrapping this function needs to be rewritten using some native
 * functions as prototype setup using normal JavaScript does not work as
 * expected during bootstrapping (see mirror.js in r114903).
 *
 * @param {function} ctor Constructor function which needs to inherit the
 *     prototype.
 * @param {function} superCtor Constructor function to inherit prototype from.
 */
exports.inherits = require('inherits');

exports._extend = function(origin, add) {
  // Don't do anything if add isn't an object
  if (!add || !isObject(add)) return origin;

  var keys = Object.keys(add);
  var i = keys.length;
  while (i--) {
    origin[keys[i]] = add[keys[i]];
  }
  return origin;
};

function hasOwnProperty(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

}).call(this,require('_process'),typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./support/isBuffer":4,"_process":2,"inherits":3}],6:[function(require,module,exports){
'use strict';

/* jshint esnext:true */
var mapboxgl = require('mapbox-gl');
var d3 = require('d3-request');
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/stevage/cixqpi9cl004i2sokdme3g7lk',
    center: [144.95, -37.8],
    zoom: 14
});

var cafes = {
    type: 'FeatureCollection',
    features: []
};

function cafeLayer(size, filter) {
    var ret = {
        id: 'cafes-' + size,
        type: 'symbol',
        source: 'cafes',
        filter: filter,
        layout: {
            'icon-image': 'cafe-15',
            'icon-size': size,
            'text-field': '{name}',
            'text-font': ['Open Sans Semibold', 'Arial Unicode MS Bold'],
            'text-anchor': 'top',
            'text-size': { stops: [[15, 0], [16, 8], [18, 12]] },
            'text-offset': [0, 0.6],
            'text-optional': true
        }, paint: {
            'text-halo-color': 'white',
            'text-halo-width': { stops: [[15, 0], [17, 2]] },
            'text-halo-blur': { stops: [[15, 0], [17, 2]] },
            'text-color': 'hsl(0,80%,50%)'
        }
    };
    console.log(ret);
    return ret;
}

d3.csv('https://data.melbourne.vic.gov.au/api/views/sfrg-zygb/rows.csv?accessType=DOWNLOAD', function (rows) {
    rows.forEach(function (row) {
        if (row.Location && row['Seating type'] == 'Seats - Indoor') {
            var feature = {
                type: 'Feature',
                properties: {
                    'name': row['Trading name'],
                    'indoor': Number(row['Number of seats'])

                },
                geometry: {
                    type: 'Point',
                    coordinates: [Number(row.Location.split(', ')[1].replace(')', '')), Number(row.Location.split(', ')[0].replace('(', ''))]
                }
            };
            cafes.features.push(feature);
        }
    });
    var addCafes = function addCafes() {
        map.addSource('cafes', { type: 'geojson', data: cafes });
        map.addLayer(cafeLayer(0.75, ['<', 'indoor', 15]));
        map.addLayer(cafeLayer(1, ['all', ['>=', 'indoor', 15], ['<', 'indoor', 25]]));
        map.addLayer(cafeLayer(1.25, ['all', ['>=', 'indoor', 25], ['<', 'indoor', 75]]));
        map.addLayer(cafeLayer(1.5, ['all', ['>=', 'indoor', 75]]));
        document.querySelectorAll('#loading')[0].outerHTML = '';
    };
    if (map.loaded()) addCafes();else map.on('load', addCafes);
});

},{"d3-request":12,"mapbox-gl":94}],7:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.glMatrix = factory());
}(this, (function () { 'use strict';

function create() {
    var out = new Float32Array(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
}





























function transformMat3(out, a, m) {
    var x = a[0], y = a[1], z = a[2];
    out[0] = x * m[0] + y * m[3] + z * m[6];
    out[1] = x * m[1] + y * m[4] + z * m[7];
    out[2] = x * m[2] + y * m[5] + z * m[8];
    return out;
}




var vec = create();

function create$1() {
    var out = new Float32Array(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
}













function scale$1(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
    out[3] = a[3] * b;
    return out;
}







function normalize$1(out, a) {
    var x = a[0],
        y = a[1],
        z = a[2],
        w = a[3];
    var len = x * x + y * y + z * z + w * w;
    if (len > 0) {
        len = 1 / Math.sqrt(len);
        out[0] = x * len;
        out[1] = y * len;
        out[2] = z * len;
        out[3] = w * len;
    }
    return out;
}



function transformMat4$1(out, a, m) {
    var x = a[0], y = a[1], z = a[2], w = a[3];
    out[0] = m[0] * x + m[4] * y + m[8] * z + m[12] * w;
    out[1] = m[1] * x + m[5] * y + m[9] * z + m[13] * w;
    out[2] = m[2] * x + m[6] * y + m[10] * z + m[14] * w;
    out[3] = m[3] * x + m[7] * y + m[11] * z + m[15] * w;
    return out;
}

var vec$1 = create$1();

function create$2() {
    var out = new Float32Array(4);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
}










function rotate(out, a, rad) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        s = Math.sin(rad),
        c = Math.cos(rad);
    out[0] = a0 *  c + a2 * s;
    out[1] = a1 *  c + a3 * s;
    out[2] = a0 * -s + a2 * c;
    out[3] = a1 * -s + a3 * c;
    return out;
}
function scale$2(out, a, v) {
    var a0 = a[0], a1 = a[1], a2 = a[2], a3 = a[3],
        v0 = v[0], v1 = v[1];
    out[0] = a0 * v0;
    out[1] = a1 * v0;
    out[2] = a2 * v1;
    out[3] = a3 * v1;
    return out;
}

function create$3() {
    var out = new Float32Array(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}















function fromRotation$1(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad);
    out[0] = c;
    out[1] = s;
    out[2] = 0;
    out[3] = -s;
    out[4] = c;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
}

function create$4() {
    var out = new Float32Array(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}




function identity$2(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}

function invert$2(out, a) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15],
        b00 = a00 * a11 - a01 * a10,
        b01 = a00 * a12 - a02 * a10,
        b02 = a00 * a13 - a03 * a10,
        b03 = a01 * a12 - a02 * a11,
        b04 = a01 * a13 - a03 * a11,
        b05 = a02 * a13 - a03 * a12,
        b06 = a20 * a31 - a21 * a30,
        b07 = a20 * a32 - a22 * a30,
        b08 = a20 * a33 - a23 * a30,
        b09 = a21 * a32 - a22 * a31,
        b10 = a21 * a33 - a23 * a31,
        b11 = a22 * a33 - a23 * a32,
        det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;
    if (!det) {
        return null;
    }
    det = 1.0 / det;
    out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * det;
    out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * det;
    out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * det;
    out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * det;
    out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * det;
    out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * det;
    out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * det;
    out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * det;
    out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * det;
    out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * det;
    out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * det;
    out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * det;
    out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * det;
    out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * det;
    out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * det;
    out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * det;
    return out;
}


function multiply$4(out, a, b) {
    var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
        a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
        a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
        a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
    var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];
    out[0] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[1] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[2] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[3] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
    out[4] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[5] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[6] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[7] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
    out[8] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[9] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[10] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[11] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
    out[12] = b0 * a00 + b1 * a10 + b2 * a20 + b3 * a30;
    out[13] = b0 * a01 + b1 * a11 + b2 * a21 + b3 * a31;
    out[14] = b0 * a02 + b1 * a12 + b2 * a22 + b3 * a32;
    out[15] = b0 * a03 + b1 * a13 + b2 * a23 + b3 * a33;
    return out;
}
function translate$1(out, a, v) {
    var x = v[0], y = v[1], z = v[2],
        a00, a01, a02, a03,
        a10, a11, a12, a13,
        a20, a21, a22, a23;
    if (a === out) {
        out[12] = a[0] * x + a[4] * y + a[8] * z + a[12];
        out[13] = a[1] * x + a[5] * y + a[9] * z + a[13];
        out[14] = a[2] * x + a[6] * y + a[10] * z + a[14];
        out[15] = a[3] * x + a[7] * y + a[11] * z + a[15];
    } else {
        a00 = a[0]; a01 = a[1]; a02 = a[2]; a03 = a[3];
        a10 = a[4]; a11 = a[5]; a12 = a[6]; a13 = a[7];
        a20 = a[8]; a21 = a[9]; a22 = a[10]; a23 = a[11];
        out[0] = a00; out[1] = a01; out[2] = a02; out[3] = a03;
        out[4] = a10; out[5] = a11; out[6] = a12; out[7] = a13;
        out[8] = a20; out[9] = a21; out[10] = a22; out[11] = a23;
        out[12] = a00 * x + a10 * y + a20 * z + a[12];
        out[13] = a01 * x + a11 * y + a21 * z + a[13];
        out[14] = a02 * x + a12 * y + a22 * z + a[14];
        out[15] = a03 * x + a13 * y + a23 * z + a[15];
    }
    return out;
}
function scale$4(out, a, v) {
    var x = v[0], y = v[1], z = v[2];
    out[0] = a[0] * x;
    out[1] = a[1] * x;
    out[2] = a[2] * x;
    out[3] = a[3] * x;
    out[4] = a[4] * y;
    out[5] = a[5] * y;
    out[6] = a[6] * y;
    out[7] = a[7] * y;
    out[8] = a[8] * z;
    out[9] = a[9] * z;
    out[10] = a[10] * z;
    out[11] = a[11] * z;
    out[12] = a[12];
    out[13] = a[13];
    out[14] = a[14];
    out[15] = a[15];
    return out;
}

function rotateX$1(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7],
        a20 = a[8],
        a21 = a[9],
        a22 = a[10],
        a23 = a[11];
    if (a !== out) {
        out[0]  = a[0];
        out[1]  = a[1];
        out[2]  = a[2];
        out[3]  = a[3];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
}

function rotateZ$1(out, a, rad) {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = a[0],
        a01 = a[1],
        a02 = a[2],
        a03 = a[3],
        a10 = a[4],
        a11 = a[5],
        a12 = a[6],
        a13 = a[7];
    if (a !== out) {
        out[8]  = a[8];
        out[9]  = a[9];
        out[10] = a[10];
        out[11] = a[11];
        out[12] = a[12];
        out[13] = a[13];
        out[14] = a[14];
        out[15] = a[15];
    }
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
}














function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
}

function ortho(out, left, right, bottom, top, near, far) {
    var lr = 1 / (left - right),
        bt = 1 / (bottom - top),
        nf = 1 / (near - far);
    out[0] = -2 * lr;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = -2 * bt;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 2 * nf;
    out[11] = 0;
    out[12] = (left + right) * lr;
    out[13] = (top + bottom) * bt;
    out[14] = (far + near) * nf;
    out[15] = 1;
    return out;
}

var mapboxBuild = {
    vec3: {
        transformMat3: transformMat3
    },
    vec4: {
        transformMat4: transformMat4$1
    },
    mat2: {
        create: create$2,
        rotate: rotate,
        scale: scale$2
    },
    mat3: {
        create: create$3,
        fromRotation: fromRotation$1
    },
    mat4: {
        create: create$4,
        identity: identity$2,
        translate: translate$1,
        scale: scale$4,
        multiply: multiply$4,
        perspective: perspective,
        rotateX: rotateX$1,
        rotateZ: rotateZ$1,
        invert: invert$2,
        ortho: ortho
    }
};

return mapboxBuild;

})));

},{}],8:[function(require,module,exports){
// (c) Dean McNamee <dean@gmail.com>, 2012.
//
// https://github.com/deanm/css-color-parser-js
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
// FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
// IN THE SOFTWARE.

// http://www.w3.org/TR/css3-color/
var kCSSColorTable = {
  "transparent": [0,0,0,0], "aliceblue": [240,248,255,1],
  "antiquewhite": [250,235,215,1], "aqua": [0,255,255,1],
  "aquamarine": [127,255,212,1], "azure": [240,255,255,1],
  "beige": [245,245,220,1], "bisque": [255,228,196,1],
  "black": [0,0,0,1], "blanchedalmond": [255,235,205,1],
  "blue": [0,0,255,1], "blueviolet": [138,43,226,1],
  "brown": [165,42,42,1], "burlywood": [222,184,135,1],
  "cadetblue": [95,158,160,1], "chartreuse": [127,255,0,1],
  "chocolate": [210,105,30,1], "coral": [255,127,80,1],
  "cornflowerblue": [100,149,237,1], "cornsilk": [255,248,220,1],
  "crimson": [220,20,60,1], "cyan": [0,255,255,1],
  "darkblue": [0,0,139,1], "darkcyan": [0,139,139,1],
  "darkgoldenrod": [184,134,11,1], "darkgray": [169,169,169,1],
  "darkgreen": [0,100,0,1], "darkgrey": [169,169,169,1],
  "darkkhaki": [189,183,107,1], "darkmagenta": [139,0,139,1],
  "darkolivegreen": [85,107,47,1], "darkorange": [255,140,0,1],
  "darkorchid": [153,50,204,1], "darkred": [139,0,0,1],
  "darksalmon": [233,150,122,1], "darkseagreen": [143,188,143,1],
  "darkslateblue": [72,61,139,1], "darkslategray": [47,79,79,1],
  "darkslategrey": [47,79,79,1], "darkturquoise": [0,206,209,1],
  "darkviolet": [148,0,211,1], "deeppink": [255,20,147,1],
  "deepskyblue": [0,191,255,1], "dimgray": [105,105,105,1],
  "dimgrey": [105,105,105,1], "dodgerblue": [30,144,255,1],
  "firebrick": [178,34,34,1], "floralwhite": [255,250,240,1],
  "forestgreen": [34,139,34,1], "fuchsia": [255,0,255,1],
  "gainsboro": [220,220,220,1], "ghostwhite": [248,248,255,1],
  "gold": [255,215,0,1], "goldenrod": [218,165,32,1],
  "gray": [128,128,128,1], "green": [0,128,0,1],
  "greenyellow": [173,255,47,1], "grey": [128,128,128,1],
  "honeydew": [240,255,240,1], "hotpink": [255,105,180,1],
  "indianred": [205,92,92,1], "indigo": [75,0,130,1],
  "ivory": [255,255,240,1], "khaki": [240,230,140,1],
  "lavender": [230,230,250,1], "lavenderblush": [255,240,245,1],
  "lawngreen": [124,252,0,1], "lemonchiffon": [255,250,205,1],
  "lightblue": [173,216,230,1], "lightcoral": [240,128,128,1],
  "lightcyan": [224,255,255,1], "lightgoldenrodyellow": [250,250,210,1],
  "lightgray": [211,211,211,1], "lightgreen": [144,238,144,1],
  "lightgrey": [211,211,211,1], "lightpink": [255,182,193,1],
  "lightsalmon": [255,160,122,1], "lightseagreen": [32,178,170,1],
  "lightskyblue": [135,206,250,1], "lightslategray": [119,136,153,1],
  "lightslategrey": [119,136,153,1], "lightsteelblue": [176,196,222,1],
  "lightyellow": [255,255,224,1], "lime": [0,255,0,1],
  "limegreen": [50,205,50,1], "linen": [250,240,230,1],
  "magenta": [255,0,255,1], "maroon": [128,0,0,1],
  "mediumaquamarine": [102,205,170,1], "mediumblue": [0,0,205,1],
  "mediumorchid": [186,85,211,1], "mediumpurple": [147,112,219,1],
  "mediumseagreen": [60,179,113,1], "mediumslateblue": [123,104,238,1],
  "mediumspringgreen": [0,250,154,1], "mediumturquoise": [72,209,204,1],
  "mediumvioletred": [199,21,133,1], "midnightblue": [25,25,112,1],
  "mintcream": [245,255,250,1], "mistyrose": [255,228,225,1],
  "moccasin": [255,228,181,1], "navajowhite": [255,222,173,1],
  "navy": [0,0,128,1], "oldlace": [253,245,230,1],
  "olive": [128,128,0,1], "olivedrab": [107,142,35,1],
  "orange": [255,165,0,1], "orangered": [255,69,0,1],
  "orchid": [218,112,214,1], "palegoldenrod": [238,232,170,1],
  "palegreen": [152,251,152,1], "paleturquoise": [175,238,238,1],
  "palevioletred": [219,112,147,1], "papayawhip": [255,239,213,1],
  "peachpuff": [255,218,185,1], "peru": [205,133,63,1],
  "pink": [255,192,203,1], "plum": [221,160,221,1],
  "powderblue": [176,224,230,1], "purple": [128,0,128,1],
  "rebeccapurple": [102,51,153,1],
  "red": [255,0,0,1], "rosybrown": [188,143,143,1],
  "royalblue": [65,105,225,1], "saddlebrown": [139,69,19,1],
  "salmon": [250,128,114,1], "sandybrown": [244,164,96,1],
  "seagreen": [46,139,87,1], "seashell": [255,245,238,1],
  "sienna": [160,82,45,1], "silver": [192,192,192,1],
  "skyblue": [135,206,235,1], "slateblue": [106,90,205,1],
  "slategray": [112,128,144,1], "slategrey": [112,128,144,1],
  "snow": [255,250,250,1], "springgreen": [0,255,127,1],
  "steelblue": [70,130,180,1], "tan": [210,180,140,1],
  "teal": [0,128,128,1], "thistle": [216,191,216,1],
  "tomato": [255,99,71,1], "turquoise": [64,224,208,1],
  "violet": [238,130,238,1], "wheat": [245,222,179,1],
  "white": [255,255,255,1], "whitesmoke": [245,245,245,1],
  "yellow": [255,255,0,1], "yellowgreen": [154,205,50,1]}

function clamp_css_byte(i) {  // Clamp to integer 0 .. 255.
  i = Math.round(i);  // Seems to be what Chrome does (vs truncation).
  return i < 0 ? 0 : i > 255 ? 255 : i;
}

function clamp_css_float(f) {  // Clamp to float 0.0 .. 1.0.
  return f < 0 ? 0 : f > 1 ? 1 : f;
}

function parse_css_int(str) {  // int or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_byte(parseFloat(str) / 100 * 255);
  return clamp_css_byte(parseInt(str));
}

function parse_css_float(str) {  // float or percentage.
  if (str[str.length - 1] === '%')
    return clamp_css_float(parseFloat(str) / 100);
  return clamp_css_float(parseFloat(str));
}

function css_hue_to_rgb(m1, m2, h) {
  if (h < 0) h += 1;
  else if (h > 1) h -= 1;

  if (h * 6 < 1) return m1 + (m2 - m1) * h * 6;
  if (h * 2 < 1) return m2;
  if (h * 3 < 2) return m1 + (m2 - m1) * (2/3 - h) * 6;
  return m1;
}

function parseCSSColor(css_str) {
  // Remove all whitespace, not compliant, but should just be more accepting.
  var str = css_str.replace(/ /g, '').toLowerCase();

  // Color keywords (and transparent) lookup.
  if (str in kCSSColorTable) return kCSSColorTable[str].slice();  // dup.

  // #abc and #abc123 syntax.
  if (str[0] === '#') {
    if (str.length === 4) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xfff)) return null;  // Covers NaN.
      return [((iv & 0xf00) >> 4) | ((iv & 0xf00) >> 8),
              (iv & 0xf0) | ((iv & 0xf0) >> 4),
              (iv & 0xf) | ((iv & 0xf) << 4),
              1];
    } else if (str.length === 7) {
      var iv = parseInt(str.substr(1), 16);  // TODO(deanm): Stricter parsing.
      if (!(iv >= 0 && iv <= 0xffffff)) return null;  // Covers NaN.
      return [(iv & 0xff0000) >> 16,
              (iv & 0xff00) >> 8,
              iv & 0xff,
              1];
    }

    return null;
  }

  var op = str.indexOf('('), ep = str.indexOf(')');
  if (op !== -1 && ep + 1 === str.length) {
    var fname = str.substr(0, op);
    var params = str.substr(op+1, ep-(op+1)).split(',');
    var alpha = 1;  // To allow case fallthrough.
    switch (fname) {
      case 'rgba':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'rgb':
        if (params.length !== 3) return null;
        return [parse_css_int(params[0]),
                parse_css_int(params[1]),
                parse_css_int(params[2]),
                alpha];
      case 'hsla':
        if (params.length !== 4) return null;
        alpha = parse_css_float(params.pop());
        // Fall through.
      case 'hsl':
        if (params.length !== 3) return null;
        var h = (((parseFloat(params[0]) % 360) + 360) % 360) / 360;  // 0 .. 1
        // NOTE(deanm): According to the CSS spec s/l should only be
        // percentages, but we don't bother and let float or percentage.
        var s = parse_css_float(params[1]);
        var l = parse_css_float(params[2]);
        var m2 = l <= 0.5 ? l * (s + 1) : l + s - l * s;
        var m1 = l * 2 - m2;
        return [clamp_css_byte(css_hue_to_rgb(m1, m2, h+1/3) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h) * 255),
                clamp_css_byte(css_hue_to_rgb(m1, m2, h-1/3) * 255),
                alpha];
      default:
        return null;
    }
  }

  return null;
}

try { exports.parseCSSColor = parseCSSColor } catch(e) { }

},{}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
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

},{}],11:[function(require,module,exports){
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
},{}],12:[function(require,module,exports){
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

},{"d3-collection":9,"d3-dispatch":10,"d3-dsv":11}],13:[function(require,module,exports){
'use strict';

module.exports = earcut;

function earcut(data, holeIndices, dim) {

    dim = dim || 2;

    var hasHoles = holeIndices && holeIndices.length,
        outerLen = hasHoles ? holeIndices[0] * dim : data.length,
        outerNode = linkedList(data, 0, outerLen, dim, true),
        triangles = [];

    if (!outerNode) return triangles;

    var minX, minY, maxX, maxY, x, y, size;

    if (hasHoles) outerNode = eliminateHoles(data, holeIndices, outerNode, dim);

    // if the shape is not too simple, we'll use z-order curve hash later; calculate polygon bbox
    if (data.length > 80 * dim) {
        minX = maxX = data[0];
        minY = maxY = data[1];

        for (var i = dim; i < outerLen; i += dim) {
            x = data[i];
            y = data[i + 1];
            if (x < minX) minX = x;
            if (y < minY) minY = y;
            if (x > maxX) maxX = x;
            if (y > maxY) maxY = y;
        }

        // minX, minY and size are later used to transform coords into integers for z-order calculation
        size = Math.max(maxX - minX, maxY - minY);
    }

    earcutLinked(outerNode, triangles, dim, minX, minY, size);

    return triangles;
}

// create a circular doubly linked list from polygon points in the specified winding order
function linkedList(data, start, end, dim, clockwise) {
    var i, last;

    if (clockwise === (signedArea(data, start, end, dim) > 0)) {
        for (i = start; i < end; i += dim) last = insertNode(i, data[i], data[i + 1], last);
    } else {
        for (i = end - dim; i >= start; i -= dim) last = insertNode(i, data[i], data[i + 1], last);
    }

    if (last && equals(last, last.next)) {
        removeNode(last);
        last = last.next;
    }

    return last;
}

// eliminate colinear or duplicate points
function filterPoints(start, end) {
    if (!start) return start;
    if (!end) end = start;

    var p = start,
        again;
    do {
        again = false;

        if (!p.steiner && (equals(p, p.next) || area(p.prev, p, p.next) === 0)) {
            removeNode(p);
            p = end = p.prev;
            if (p === p.next) return null;
            again = true;

        } else {
            p = p.next;
        }
    } while (again || p !== end);

    return end;
}

// main ear slicing loop which triangulates a polygon (given as a linked list)
function earcutLinked(ear, triangles, dim, minX, minY, size, pass) {
    if (!ear) return;

    // interlink polygon nodes in z-order
    if (!pass && size) indexCurve(ear, minX, minY, size);

    var stop = ear,
        prev, next;

    // iterate through ears, slicing them one by one
    while (ear.prev !== ear.next) {
        prev = ear.prev;
        next = ear.next;

        if (size ? isEarHashed(ear, minX, minY, size) : isEar(ear)) {
            // cut off the triangle
            triangles.push(prev.i / dim);
            triangles.push(ear.i / dim);
            triangles.push(next.i / dim);

            removeNode(ear);

            // skipping the next vertice leads to less sliver triangles
            ear = next.next;
            stop = next.next;

            continue;
        }

        ear = next;

        // if we looped through the whole remaining polygon and can't find any more ears
        if (ear === stop) {
            // try filtering points and slicing again
            if (!pass) {
                earcutLinked(filterPoints(ear), triangles, dim, minX, minY, size, 1);

            // if this didn't work, try curing all small self-intersections locally
            } else if (pass === 1) {
                ear = cureLocalIntersections(ear, triangles, dim);
                earcutLinked(ear, triangles, dim, minX, minY, size, 2);

            // as a last resort, try splitting the remaining polygon into two
            } else if (pass === 2) {
                splitEarcut(ear, triangles, dim, minX, minY, size);
            }

            break;
        }
    }
}

// check whether a polygon node forms a valid ear with adjacent nodes
function isEar(ear) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // now make sure we don't have other points inside the potential ear
    var p = ear.next.next;

    while (p !== ear.prev) {
        if (pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.next;
    }

    return true;
}

function isEarHashed(ear, minX, minY, size) {
    var a = ear.prev,
        b = ear,
        c = ear.next;

    if (area(a, b, c) >= 0) return false; // reflex, can't be an ear

    // triangle bbox; min & max are calculated like this for speed
    var minTX = a.x < b.x ? (a.x < c.x ? a.x : c.x) : (b.x < c.x ? b.x : c.x),
        minTY = a.y < b.y ? (a.y < c.y ? a.y : c.y) : (b.y < c.y ? b.y : c.y),
        maxTX = a.x > b.x ? (a.x > c.x ? a.x : c.x) : (b.x > c.x ? b.x : c.x),
        maxTY = a.y > b.y ? (a.y > c.y ? a.y : c.y) : (b.y > c.y ? b.y : c.y);

    // z-order range for the current triangle bbox;
    var minZ = zOrder(minTX, minTY, minX, minY, size),
        maxZ = zOrder(maxTX, maxTY, minX, minY, size);

    // first look for points inside the triangle in increasing z-order
    var p = ear.nextZ;

    while (p && p.z <= maxZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.nextZ;
    }

    // then look for points in decreasing z-order
    p = ear.prevZ;

    while (p && p.z >= minZ) {
        if (p !== ear.prev && p !== ear.next &&
            pointInTriangle(a.x, a.y, b.x, b.y, c.x, c.y, p.x, p.y) &&
            area(p.prev, p, p.next) >= 0) return false;
        p = p.prevZ;
    }

    return true;
}

// go through all polygon nodes and cure small local self-intersections
function cureLocalIntersections(start, triangles, dim) {
    var p = start;
    do {
        var a = p.prev,
            b = p.next.next;

        if (!equals(a, b) && intersects(a, p, p.next, b) && locallyInside(a, b) && locallyInside(b, a)) {

            triangles.push(a.i / dim);
            triangles.push(p.i / dim);
            triangles.push(b.i / dim);

            // remove two nodes involved
            removeNode(p);
            removeNode(p.next);

            p = start = b;
        }
        p = p.next;
    } while (p !== start);

    return p;
}

// try splitting polygon into two and triangulate them independently
function splitEarcut(start, triangles, dim, minX, minY, size) {
    // look for a valid diagonal that divides the polygon into two
    var a = start;
    do {
        var b = a.next.next;
        while (b !== a.prev) {
            if (a.i !== b.i && isValidDiagonal(a, b)) {
                // split the polygon in two by the diagonal
                var c = splitPolygon(a, b);

                // filter colinear points around the cuts
                a = filterPoints(a, a.next);
                c = filterPoints(c, c.next);

                // run earcut on each half
                earcutLinked(a, triangles, dim, minX, minY, size);
                earcutLinked(c, triangles, dim, minX, minY, size);
                return;
            }
            b = b.next;
        }
        a = a.next;
    } while (a !== start);
}

// link every hole into the outer loop, producing a single-ring polygon without holes
function eliminateHoles(data, holeIndices, outerNode, dim) {
    var queue = [],
        i, len, start, end, list;

    for (i = 0, len = holeIndices.length; i < len; i++) {
        start = holeIndices[i] * dim;
        end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
        list = linkedList(data, start, end, dim, false);
        if (list === list.next) list.steiner = true;
        queue.push(getLeftmost(list));
    }

    queue.sort(compareX);

    // process holes from left to right
    for (i = 0; i < queue.length; i++) {
        eliminateHole(queue[i], outerNode);
        outerNode = filterPoints(outerNode, outerNode.next);
    }

    return outerNode;
}

function compareX(a, b) {
    return a.x - b.x;
}

// find a bridge between vertices that connects hole with an outer ring and and link it
function eliminateHole(hole, outerNode) {
    outerNode = findHoleBridge(hole, outerNode);
    if (outerNode) {
        var b = splitPolygon(outerNode, hole);
        filterPoints(b, b.next);
    }
}

// David Eberly's algorithm for finding a bridge between hole and outer polygon
function findHoleBridge(hole, outerNode) {
    var p = outerNode,
        hx = hole.x,
        hy = hole.y,
        qx = -Infinity,
        m;

    // find a segment intersected by a ray from the hole's leftmost point to the left;
    // segment's endpoint with lesser x will be potential connection point
    do {
        if (hy <= p.y && hy >= p.next.y) {
            var x = p.x + (hy - p.y) * (p.next.x - p.x) / (p.next.y - p.y);
            if (x <= hx && x > qx) {
                qx = x;
                if (x === hx) {
                    if (hy === p.y) return p;
                    if (hy === p.next.y) return p.next;
                }
                m = p.x < p.next.x ? p : p.next;
            }
        }
        p = p.next;
    } while (p !== outerNode);

    if (!m) return null;

    if (hx === qx) return m.prev; // hole touches outer segment; pick lower endpoint

    // look for points inside the triangle of hole point, segment intersection and endpoint;
    // if there are no points found, we have a valid connection;
    // otherwise choose the point of the minimum angle with the ray as connection point

    var stop = m,
        mx = m.x,
        my = m.y,
        tanMin = Infinity,
        tan;

    p = m.next;

    while (p !== stop) {
        if (hx >= p.x && p.x >= mx &&
                pointInTriangle(hy < my ? hx : qx, hy, mx, my, hy < my ? qx : hx, hy, p.x, p.y)) {

            tan = Math.abs(hy - p.y) / (hx - p.x); // tangential

            if ((tan < tanMin || (tan === tanMin && p.x > m.x)) && locallyInside(p, hole)) {
                m = p;
                tanMin = tan;
            }
        }

        p = p.next;
    }

    return m;
}

// interlink polygon nodes in z-order
function indexCurve(start, minX, minY, size) {
    var p = start;
    do {
        if (p.z === null) p.z = zOrder(p.x, p.y, minX, minY, size);
        p.prevZ = p.prev;
        p.nextZ = p.next;
        p = p.next;
    } while (p !== start);

    p.prevZ.nextZ = null;
    p.prevZ = null;

    sortLinked(p);
}

// Simon Tatham's linked list merge sort algorithm
// http://www.chiark.greenend.org.uk/~sgtatham/algorithms/listsort.html
function sortLinked(list) {
    var i, p, q, e, tail, numMerges, pSize, qSize,
        inSize = 1;

    do {
        p = list;
        list = null;
        tail = null;
        numMerges = 0;

        while (p) {
            numMerges++;
            q = p;
            pSize = 0;
            for (i = 0; i < inSize; i++) {
                pSize++;
                q = q.nextZ;
                if (!q) break;
            }

            qSize = inSize;

            while (pSize > 0 || (qSize > 0 && q)) {

                if (pSize === 0) {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                } else if (qSize === 0 || !q) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else if (p.z <= q.z) {
                    e = p;
                    p = p.nextZ;
                    pSize--;
                } else {
                    e = q;
                    q = q.nextZ;
                    qSize--;
                }

                if (tail) tail.nextZ = e;
                else list = e;

                e.prevZ = tail;
                tail = e;
            }

            p = q;
        }

        tail.nextZ = null;
        inSize *= 2;

    } while (numMerges > 1);

    return list;
}

// z-order of a point given coords and size of the data bounding box
function zOrder(x, y, minX, minY, size) {
    // coords are transformed into non-negative 15-bit integer range
    x = 32767 * (x - minX) / size;
    y = 32767 * (y - minY) / size;

    x = (x | (x << 8)) & 0x00FF00FF;
    x = (x | (x << 4)) & 0x0F0F0F0F;
    x = (x | (x << 2)) & 0x33333333;
    x = (x | (x << 1)) & 0x55555555;

    y = (y | (y << 8)) & 0x00FF00FF;
    y = (y | (y << 4)) & 0x0F0F0F0F;
    y = (y | (y << 2)) & 0x33333333;
    y = (y | (y << 1)) & 0x55555555;

    return x | (y << 1);
}

// find the leftmost node of a polygon ring
function getLeftmost(start) {
    var p = start,
        leftmost = start;
    do {
        if (p.x < leftmost.x) leftmost = p;
        p = p.next;
    } while (p !== start);

    return leftmost;
}

// check if a point lies within a convex triangle
function pointInTriangle(ax, ay, bx, by, cx, cy, px, py) {
    return (cx - px) * (ay - py) - (ax - px) * (cy - py) >= 0 &&
           (ax - px) * (by - py) - (bx - px) * (ay - py) >= 0 &&
           (bx - px) * (cy - py) - (cx - px) * (by - py) >= 0;
}

// check if a diagonal between two polygon nodes is valid (lies in polygon interior)
function isValidDiagonal(a, b) {
    return a.next.i !== b.i && a.prev.i !== b.i && !intersectsPolygon(a, b) &&
           locallyInside(a, b) && locallyInside(b, a) && middleInside(a, b);
}

// signed area of a triangle
function area(p, q, r) {
    return (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
}

// check if two points are equal
function equals(p1, p2) {
    return p1.x === p2.x && p1.y === p2.y;
}

// check if two segments intersect
function intersects(p1, q1, p2, q2) {
    if ((equals(p1, q1) && equals(p2, q2)) ||
        (equals(p1, q2) && equals(p2, q1))) return true;
    return area(p1, q1, p2) > 0 !== area(p1, q1, q2) > 0 &&
           area(p2, q2, p1) > 0 !== area(p2, q2, q1) > 0;
}

// check if a polygon diagonal intersects any polygon segments
function intersectsPolygon(a, b) {
    var p = a;
    do {
        if (p.i !== a.i && p.next.i !== a.i && p.i !== b.i && p.next.i !== b.i &&
                intersects(p, p.next, a, b)) return true;
        p = p.next;
    } while (p !== a);

    return false;
}

// check if a polygon diagonal is locally inside the polygon
function locallyInside(a, b) {
    return area(a.prev, a, a.next) < 0 ?
        area(a, b, a.next) >= 0 && area(a, a.prev, b) >= 0 :
        area(a, b, a.prev) < 0 || area(a, a.next, b) < 0;
}

// check if the middle point of a polygon diagonal is inside the polygon
function middleInside(a, b) {
    var p = a,
        inside = false,
        px = (a.x + b.x) / 2,
        py = (a.y + b.y) / 2;
    do {
        if (((p.y > py) !== (p.next.y > py)) && (px < (p.next.x - p.x) * (py - p.y) / (p.next.y - p.y) + p.x))
            inside = !inside;
        p = p.next;
    } while (p !== a);

    return inside;
}

// link two polygon vertices with a bridge; if the vertices belong to the same ring, it splits polygon into two;
// if one belongs to the outer ring and another to a hole, it merges it into a single ring
function splitPolygon(a, b) {
    var a2 = new Node(a.i, a.x, a.y),
        b2 = new Node(b.i, b.x, b.y),
        an = a.next,
        bp = b.prev;

    a.next = b;
    b.prev = a;

    a2.next = an;
    an.prev = a2;

    b2.next = a2;
    a2.prev = b2;

    bp.next = b2;
    b2.prev = bp;

    return b2;
}

// create a node and optionally link it with previous one (in a circular doubly linked list)
function insertNode(i, x, y, last) {
    var p = new Node(i, x, y);

    if (!last) {
        p.prev = p;
        p.next = p;

    } else {
        p.next = last.next;
        p.prev = last;
        last.next.prev = p;
        last.next = p;
    }
    return p;
}

function removeNode(p) {
    p.next.prev = p.prev;
    p.prev.next = p.next;

    if (p.prevZ) p.prevZ.nextZ = p.nextZ;
    if (p.nextZ) p.nextZ.prevZ = p.prevZ;
}

function Node(i, x, y) {
    // vertice index in coordinates array
    this.i = i;

    // vertex coordinates
    this.x = x;
    this.y = y;

    // previous and next vertice nodes in a polygon ring
    this.prev = null;
    this.next = null;

    // z-order curve value
    this.z = null;

    // previous and next nodes in z-order
    this.prevZ = null;
    this.nextZ = null;

    // indicates whether this is a steiner point
    this.steiner = false;
}

// return a percentage difference between the polygon area and its triangulation area;
// used to verify correctness of triangulation
earcut.deviation = function (data, holeIndices, dim, triangles) {
    var hasHoles = holeIndices && holeIndices.length;
    var outerLen = hasHoles ? holeIndices[0] * dim : data.length;

    var polygonArea = Math.abs(signedArea(data, 0, outerLen, dim));
    if (hasHoles) {
        for (var i = 0, len = holeIndices.length; i < len; i++) {
            var start = holeIndices[i] * dim;
            var end = i < len - 1 ? holeIndices[i + 1] * dim : data.length;
            polygonArea -= Math.abs(signedArea(data, start, end, dim));
        }
    }

    var trianglesArea = 0;
    for (i = 0; i < triangles.length; i += 3) {
        var a = triangles[i] * dim;
        var b = triangles[i + 1] * dim;
        var c = triangles[i + 2] * dim;
        trianglesArea += Math.abs(
            (data[a] - data[c]) * (data[b + 1] - data[a + 1]) -
            (data[a] - data[b]) * (data[c + 1] - data[a + 1]));
    }

    return polygonArea === 0 && trianglesArea === 0 ? 0 :
        Math.abs((trianglesArea - polygonArea) / polygonArea);
};

function signedArea(data, start, end, dim) {
    var sum = 0;
    for (var i = start, j = end - dim; i < end; i += dim) {
        sum += (data[j] - data[i]) * (data[i + 1] + data[j + 1]);
        j = i;
    }
    return sum;
}

// turn a polygon in a multi-dimensional array form (e.g. as in GeoJSON) into a form Earcut accepts
earcut.flatten = function (data) {
    var dim = data[0][0].length,
        result = {vertices: [], holes: [], dimensions: dim},
        holeIndex = 0;

    for (var i = 0; i < data.length; i++) {
        for (var j = 0; j < data[i].length; j++) {
            for (var d = 0; d < dim; d++) result.vertices.push(data[i][j][d]);
        }
        if (i > 0) {
            holeIndex += data[i - 1].length;
            result.holes.push(holeIndex);
        }
    }
    return result;
};

},{}],14:[function(require,module,exports){
var toString = {}.toString,
	isArray = Array.isArray || function(obj){
		return toString.call(obj) === "[object Array]";
	},
	objKeys = Object.keys || function(obj) {
			var keys = [];
			for (var name in obj) {
				if (obj.hasOwnProperty(name)) {
					keys.push(name);
				}
			}
			return keys;
		},
	strReg = /[\u0000-\u001f"\\]/g,
	strReplace = function(str) {
		var code = str.charCodeAt(0);
		switch (code) {
			case 34: return '\\"';
			case 92: return '\\\\';
			case 12: return "\\f";
			case 10: return "\\n";
			case 13: return "\\r";
			case 9: return "\\t";
			case 8: return "\\b";
			default:
				if (code > 15) {
					return "\\u00" + code.toString(16);
				} else {
					return "\\u000" + code.toString(16);
				}
		}
	};

/**
 * Simple stable stringify. Object keys sorted. No options, no spaces.
 * @param {*} val
 * @returns {string}
 */
module.exports = function simpleStableStringify(val) {
	if (val !== undefined) {
		return ''+ sss(val);
	}
};

module.exports.stringSearch = strReg;
module.exports.stringReplace = strReplace;

function sss(val) {
	var i, max, str, keys, key, pass;
	switch (typeof val) {
		case "object":
			if (val === null) {
				return null;
			} else if (isArray(val)) {
				str = '[';
				max = val.length - 1;
				for (i = 0; i < max; i++) {
					str += sss(val[i]) + ',';
				}
				if (max > -1) {
					str += sss(val[i]);
				}
				return str + ']';
			} else {
				// only object is left
				keys = objKeys(val).sort();
				max = keys.length;
				str = "{";
				key = keys[i = 0];
				pass = max > 0 && val[key] !== undefined;
				while (i < max) {
					if (pass) {
						str += '"' + key.replace(strReg, strReplace) + '":' + sss(val[key]);
						key = keys[++i];
						pass = i < max && val[key] !== undefined;
						if (pass) {
							str += ',';
						}
					} else {
						key = keys[++i];
						pass = i < max && val[key] !== undefined;
					}
				}
				return str + '}';
			}
		case "undefined":
			return null;
		case "string":
			return '"' + val.replace(strReg, strReplace) + '"';
		default:
			return val;
	}
}

},{}],15:[function(require,module,exports){
'use strict';

module.exports = createFilter;

var types = ['Unknown', 'Point', 'LineString', 'Polygon'];

/**
 * Given a filter expressed as nested arrays, return a new function
 * that evaluates whether a given feature (with a .properties or .tags property)
 * passes its test.
 *
 * @param {Array} filter mapbox gl filter
 * @returns {Function} filter-evaluating function
 */
function createFilter(filter) {
    return new Function('f', 'var p = (f && f.properties || {}); return ' + compile(filter));
}

function compile(filter) {
    if (!filter) return 'true';
    var op = filter[0];
    if (filter.length <= 1) return op === 'any' ? 'false' : 'true';
    var str =
        op === '==' ? compileComparisonOp(filter[1], filter[2], '===', false) :
        op === '!=' ? compileComparisonOp(filter[1], filter[2], '!==', false) :
        op === '<' ||
        op === '>' ||
        op === '<=' ||
        op === '>=' ? compileComparisonOp(filter[1], filter[2], op, true) :
        op === 'any' ? compileLogicalOp(filter.slice(1), '||') :
        op === 'all' ? compileLogicalOp(filter.slice(1), '&&') :
        op === 'none' ? compileNegation(compileLogicalOp(filter.slice(1), '||')) :
        op === 'in' ? compileInOp(filter[1], filter.slice(2)) :
        op === '!in' ? compileNegation(compileInOp(filter[1], filter.slice(2))) :
        op === 'has' ? compileHasOp(filter[1]) :
        op === '!has' ? compileNegation(compileHasOp([filter[1]])) :
        'true';
    return '(' + str + ')';
}

function compilePropertyReference(property) {
    return property === '$type' ? 'f.type' :
        property === '$id' ? 'f.id' :
        'p[' + JSON.stringify(property) + ']';
}

function compileComparisonOp(property, value, op, checkType) {
    var left = compilePropertyReference(property);
    var right = property === '$type' ? types.indexOf(value) : JSON.stringify(value);
    return (checkType ? 'typeof ' + left + '=== typeof ' + right + '&&' : '') + left + op + right;
}

function compileLogicalOp(expressions, op) {
    return expressions.map(compile).join(op);
}

function compileInOp(property, values) {
    if (property === '$type') values = values.map(function(value) { return types.indexOf(value); });
    var left = JSON.stringify(values.sort(compare));
    var right = compilePropertyReference(property);

    if (values.length <= 200) return left + '.indexOf(' + right + ') !== -1';

    return 'function(v, a, i, j) {' +
        'while (i <= j) { var m = (i + j) >> 1;' +
        '    if (a[m] === v) return true; if (a[m] > v) j = m - 1; else i = m + 1;' +
        '}' +
    'return false; }(' + right + ', ' + left + ',0,' + (values.length - 1) + ')';
}

function compileHasOp(property) {
    return JSON.stringify(property) + ' in p';
}

function compileNegation(expression) {
    return '!(' + expression + ')';
}

// Comparison function to sort numbers and strings
function compare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

},{}],16:[function(require,module,exports){
var wgs84 = require('wgs84');

module.exports.geometry = geometry;
module.exports.ring = ringArea;

function geometry(_) {
    if (_.type === 'Polygon') return polygonArea(_.coordinates);
    else if (_.type === 'MultiPolygon') {
        var area = 0;
        for (var i = 0; i < _.coordinates.length; i++) {
            area += polygonArea(_.coordinates[i]);
        }
        return area;
    } else {
        return null;
    }
}

function polygonArea(coords) {
    var area = 0;
    if (coords && coords.length > 0) {
        area += Math.abs(ringArea(coords[0]));
        for (var i = 1; i < coords.length; i++) {
            area -= Math.abs(ringArea(coords[i]));
        }
    }
    return area;
}

/**
 * Calculate the approximate area of the polygon were it projected onto
 *     the earth.  Note that this area will be positive if ring is oriented
 *     clockwise, otherwise it will be negative.
 *
 * Reference:
 * Robert. G. Chamberlain and William H. Duquette, "Some Algorithms for
 *     Polygons on a Sphere", JPL Publication 07-03, Jet Propulsion
 *     Laboratory, Pasadena, CA, June 2007 http://trs-new.jpl.nasa.gov/dspace/handle/2014/40409
 *
 * Returns:
 * {float} The approximate signed geodesic area of the polygon in square
 *     meters.
 */

function ringArea(coords) {
    var area = 0;

    if (coords.length > 2) {
        var p1, p2;
        for (var i = 0; i < coords.length - 1; i++) {
            p1 = coords[i];
            p2 = coords[i + 1];
            area += rad(p2[0] - p1[0]) * (2 + Math.sin(rad(p1[1])) + Math.sin(rad(p2[1])));
        }

        area = area * wgs84.RADIUS * wgs84.RADIUS / 2;
    }

    return area;
}

function rad(_) {
    return _ * Math.PI / 180;
}

},{"wgs84":218}],17:[function(require,module,exports){
var geojsonArea = require('geojson-area');

module.exports = rewind;

function rewind(gj, outer) {
    switch ((gj && gj.type) || null) {
        case 'FeatureCollection':
            gj.features = gj.features.map(curryOuter(rewind, outer));
            return gj;
        case 'Feature':
            gj.geometry = rewind(gj.geometry, outer);
            return gj;
        case 'Polygon':
        case 'MultiPolygon':
            return correct(gj, outer);
        default:
            return gj;
    }
}

function curryOuter(a, b) {
    return function(_) { return a(_, b); };
}

function correct(_, outer) {
    if (_.type === 'Polygon') {
        _.coordinates = correctRings(_.coordinates, outer);
    } else if (_.type === 'MultiPolygon') {
        _.coordinates = _.coordinates.map(curryOuter(correctRings, outer));
    }
    return _;
}

function correctRings(_, outer) {
    outer = !!outer;
    _[0] = wind(_[0], !outer);
    for (var i = 1; i < _.length; i++) {
        _[i] = wind(_[i], outer);
    }
    return _;
}

function wind(_, dir) {
    return cw(_) === dir ? _ : _.reverse();
}

function cw(_) {
    return geojsonArea.ring(_) >= 0;
}

},{"geojson-area":16}],18:[function(require,module,exports){
'use strict';

module.exports = clip;

var createFeature = require('./feature');

/* clip features between two axis-parallel lines:
 *     |        |
 *  ___|___     |     /
 * /   |   \____|____/
 *     |        |
 */

function clip(features, scale, k1, k2, axis, intersect, minAll, maxAll) {

    k1 /= scale;
    k2 /= scale;

    if (minAll >= k1 && maxAll <= k2) return features; // trivial accept
    else if (minAll > k2 || maxAll < k1) return null; // trivial reject

    var clipped = [];

    for (var i = 0; i < features.length; i++) {

        var feature = features[i],
            geometry = feature.geometry,
            type = feature.type,
            min, max;

        min = feature.min[axis];
        max = feature.max[axis];

        if (min >= k1 && max <= k2) { // trivial accept
            clipped.push(feature);
            continue;
        } else if (min > k2 || max < k1) continue; // trivial reject

        var slices = type === 1 ?
                clipPoints(geometry, k1, k2, axis) :
                clipGeometry(geometry, k1, k2, axis, intersect, type === 3);

        if (slices.length) {
            // if a feature got clipped, it will likely get clipped on the next zoom level as well,
            // so there's no need to recalculate bboxes
            clipped.push(createFeature(feature.tags, type, slices, feature.id));
        }
    }

    return clipped.length ? clipped : null;
}

function clipPoints(geometry, k1, k2, axis) {
    var slice = [];

    for (var i = 0; i < geometry.length; i++) {
        var a = geometry[i],
            ak = a[axis];

        if (ak >= k1 && ak <= k2) slice.push(a);
    }
    return slice;
}

function clipGeometry(geometry, k1, k2, axis, intersect, closed) {

    var slices = [];

    for (var i = 0; i < geometry.length; i++) {

        var ak = 0,
            bk = 0,
            b = null,
            points = geometry[i],
            area = points.area,
            dist = points.dist,
            outer = points.outer,
            len = points.length,
            a, j, last;

        var slice = [];

        for (j = 0; j < len - 1; j++) {
            a = b || points[j];
            b = points[j + 1];
            ak = bk || a[axis];
            bk = b[axis];

            if (ak < k1) {

                if ((bk > k2)) { // ---|-----|-->
                    slice.push(intersect(a, b, k1), intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);

                } else if (bk >= k1) slice.push(intersect(a, b, k1)); // ---|-->  |

            } else if (ak > k2) {

                if ((bk < k1)) { // <--|-----|---
                    slice.push(intersect(a, b, k2), intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);

                } else if (bk <= k2) slice.push(intersect(a, b, k2)); // |  <--|---

            } else {

                slice.push(a);

                if (bk < k1) { // <--|---  |
                    slice.push(intersect(a, b, k1));
                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);

                } else if (bk > k2) { // |  ---|-->
                    slice.push(intersect(a, b, k2));
                    if (!closed) slice = newSlice(slices, slice, area, dist, outer);
                }
                // | --> |
            }
        }

        // add the last point
        a = points[len - 1];
        ak = a[axis];
        if (ak >= k1 && ak <= k2) slice.push(a);

        // close the polygon if its endpoints are not the same after clipping

        last = slice[slice.length - 1];
        if (closed && last && (slice[0][0] !== last[0] || slice[0][1] !== last[1])) slice.push(slice[0]);

        // add the final slice
        newSlice(slices, slice, area, dist, outer);
    }

    return slices;
}

function newSlice(slices, slice, area, dist, outer) {
    if (slice.length) {
        // we don't recalculate the area/length of the unclipped geometry because the case where it goes
        // below the visibility threshold as a result of clipping is rare, so we avoid doing unnecessary work
        slice.area = area;
        slice.dist = dist;
        if (outer !== undefined) slice.outer = outer;

        slices.push(slice);
    }
    return [];
}

},{"./feature":20}],19:[function(require,module,exports){
'use strict';

module.exports = convert;

var simplify = require('./simplify');
var createFeature = require('./feature');

// converts GeoJSON feature into an intermediate projected JSON vector format with simplification data

function convert(data, tolerance) {
    var features = [];

    if (data.type === 'FeatureCollection') {
        for (var i = 0; i < data.features.length; i++) {
            convertFeature(features, data.features[i], tolerance);
        }
    } else if (data.type === 'Feature') {
        convertFeature(features, data, tolerance);

    } else {
        // single geometry or a geometry collection
        convertFeature(features, {geometry: data}, tolerance);
    }
    return features;
}

function convertFeature(features, feature, tolerance) {
    if (feature.geometry === null) {
        // ignore features with null geometry
        return;
    }

    var geom = feature.geometry,
        type = geom.type,
        coords = geom.coordinates,
        tags = feature.properties,
        id = feature.id,
        i, j, rings, projectedRing;

    if (type === 'Point') {
        features.push(createFeature(tags, 1, [projectPoint(coords)], id));

    } else if (type === 'MultiPoint') {
        features.push(createFeature(tags, 1, project(coords), id));

    } else if (type === 'LineString') {
        features.push(createFeature(tags, 2, [project(coords, tolerance)], id));

    } else if (type === 'MultiLineString' || type === 'Polygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            projectedRing = project(coords[i], tolerance);
            if (type === 'Polygon') projectedRing.outer = (i === 0);
            rings.push(projectedRing);
        }
        features.push(createFeature(tags, type === 'Polygon' ? 3 : 2, rings, id));

    } else if (type === 'MultiPolygon') {
        rings = [];
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                projectedRing = project(coords[i][j], tolerance);
                projectedRing.outer = (j === 0);
                rings.push(projectedRing);
            }
        }
        features.push(createFeature(tags, 3, rings, id));

    } else if (type === 'GeometryCollection') {
        for (i = 0; i < geom.geometries.length; i++) {
            convertFeature(features, {
                geometry: geom.geometries[i],
                properties: tags
            }, tolerance);
        }

    } else {
        throw new Error('Input data is not a valid GeoJSON object.');
    }
}

function project(lonlats, tolerance) {
    var projected = [];
    for (var i = 0; i < lonlats.length; i++) {
        projected.push(projectPoint(lonlats[i]));
    }
    if (tolerance) {
        simplify(projected, tolerance);
        calcSize(projected);
    }
    return projected;
}

function projectPoint(p) {
    var sin = Math.sin(p[1] * Math.PI / 180),
        x = (p[0] / 360 + 0.5),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);

    y = y < 0 ? 0 :
        y > 1 ? 1 : y;

    return [x, y, 0];
}

// calculate area and length of the poly
function calcSize(points) {
    var area = 0,
        dist = 0;

    for (var i = 0, a, b; i < points.length - 1; i++) {
        a = b || points[i];
        b = points[i + 1];

        area += a[0] * b[1] - b[0] * a[1];

        // use Manhattan distance instead of Euclidian one to avoid expensive square root computation
        dist += Math.abs(b[0] - a[0]) + Math.abs(b[1] - a[1]);
    }
    points.area = Math.abs(area / 2);
    points.dist = dist;
}

},{"./feature":20,"./simplify":22}],20:[function(require,module,exports){
'use strict';

module.exports = createFeature;

function createFeature(tags, type, geom, id) {
    var feature = {
        id: id || null,
        type: type,
        geometry: geom,
        tags: tags || null,
        min: [Infinity, Infinity], // initial bbox values
        max: [-Infinity, -Infinity]
    };
    calcBBox(feature);
    return feature;
}

// calculate the feature bounding box for faster clipping later
function calcBBox(feature) {
    var geometry = feature.geometry,
        min = feature.min,
        max = feature.max;

    if (feature.type === 1) {
        calcRingBBox(min, max, geometry);
    } else {
        for (var i = 0; i < geometry.length; i++) {
            calcRingBBox(min, max, geometry[i]);
        }
    }

    return feature;
}

function calcRingBBox(min, max, points) {
    for (var i = 0, p; i < points.length; i++) {
        p = points[i];
        min[0] = Math.min(p[0], min[0]);
        max[0] = Math.max(p[0], max[0]);
        min[1] = Math.min(p[1], min[1]);
        max[1] = Math.max(p[1], max[1]);
    }
}

},{}],21:[function(require,module,exports){
'use strict';

module.exports = geojsonvt;

var convert = require('./convert'),     // GeoJSON conversion and preprocessing
    transform = require('./transform'), // coordinate transformation
    clip = require('./clip'),           // stripe clipping algorithm
    wrap = require('./wrap'),           // date line processing
    createTile = require('./tile');     // final simplified tile generation


function geojsonvt(data, options) {
    return new GeoJSONVT(data, options);
}

function GeoJSONVT(data, options) {
    options = this.options = extend(Object.create(this.options), options);

    var debug = options.debug;

    if (debug) console.time('preprocess data');

    var z2 = 1 << options.maxZoom, // 2^z
        features = convert(data, options.tolerance / (z2 * options.extent));

    this.tiles = {};
    this.tileCoords = [];

    if (debug) {
        console.timeEnd('preprocess data');
        console.log('index: maxZoom: %d, maxPoints: %d', options.indexMaxZoom, options.indexMaxPoints);
        console.time('generate tiles');
        this.stats = {};
        this.total = 0;
    }

    features = wrap(features, options.buffer / options.extent, intersectX);

    // start slicing from the top tile down
    if (features.length) this.splitTile(features, 0, 0, 0);

    if (debug) {
        if (features.length) console.log('features: %d, points: %d', this.tiles[0].numFeatures, this.tiles[0].numPoints);
        console.timeEnd('generate tiles');
        console.log('tiles generated:', this.total, JSON.stringify(this.stats));
    }
}

GeoJSONVT.prototype.options = {
    maxZoom: 14,            // max zoom to preserve detail on
    indexMaxZoom: 5,        // max zoom in the tile index
    indexMaxPoints: 100000, // max number of points per tile in the tile index
    solidChildren: false,   // whether to tile solid square tiles further
    tolerance: 3,           // simplification tolerance (higher means simpler)
    extent: 4096,           // tile extent
    buffer: 64,             // tile buffer on each side
    debug: 0                // logging level (0, 1 or 2)
};

GeoJSONVT.prototype.splitTile = function (features, z, x, y, cz, cx, cy) {

    var stack = [features, z, x, y],
        options = this.options,
        debug = options.debug,
        solid = null;

    // avoid recursion by using a processing queue
    while (stack.length) {
        y = stack.pop();
        x = stack.pop();
        z = stack.pop();
        features = stack.pop();

        var z2 = 1 << z,
            id = toID(z, x, y),
            tile = this.tiles[id],
            tileTolerance = z === options.maxZoom ? 0 : options.tolerance / (z2 * options.extent);

        if (!tile) {
            if (debug > 1) console.time('creation');

            tile = this.tiles[id] = createTile(features, z2, x, y, tileTolerance, z === options.maxZoom);
            this.tileCoords.push({z: z, x: x, y: y});

            if (debug) {
                if (debug > 1) {
                    console.log('tile z%d-%d-%d (features: %d, points: %d, simplified: %d)',
                        z, x, y, tile.numFeatures, tile.numPoints, tile.numSimplified);
                    console.timeEnd('creation');
                }
                var key = 'z' + z;
                this.stats[key] = (this.stats[key] || 0) + 1;
                this.total++;
            }
        }

        // save reference to original geometry in tile so that we can drill down later if we stop now
        tile.source = features;

        // if it's the first-pass tiling
        if (!cz) {
            // stop tiling if we reached max zoom, or if the tile is too simple
            if (z === options.indexMaxZoom || tile.numPoints <= options.indexMaxPoints) continue;

        // if a drilldown to a specific tile
        } else {
            // stop tiling if we reached base zoom or our target tile zoom
            if (z === options.maxZoom || z === cz) continue;

            // stop tiling if it's not an ancestor of the target tile
            var m = 1 << (cz - z);
            if (x !== Math.floor(cx / m) || y !== Math.floor(cy / m)) continue;
        }

        // stop tiling if the tile is solid clipped square
        if (!options.solidChildren && isClippedSquare(tile, options.extent, options.buffer)) {
            if (cz) solid = z; // and remember the zoom if we're drilling down
            continue;
        }

        // if we slice further down, no need to keep source geometry
        tile.source = null;

        if (debug > 1) console.time('clipping');

        // values we'll use for clipping
        var k1 = 0.5 * options.buffer / options.extent,
            k2 = 0.5 - k1,
            k3 = 0.5 + k1,
            k4 = 1 + k1,
            tl, bl, tr, br, left, right;

        tl = bl = tr = br = null;

        left  = clip(features, z2, x - k1, x + k3, 0, intersectX, tile.min[0], tile.max[0]);
        right = clip(features, z2, x + k2, x + k4, 0, intersectX, tile.min[0], tile.max[0]);

        if (left) {
            tl = clip(left, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            bl = clip(left, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (right) {
            tr = clip(right, z2, y - k1, y + k3, 1, intersectY, tile.min[1], tile.max[1]);
            br = clip(right, z2, y + k2, y + k4, 1, intersectY, tile.min[1], tile.max[1]);
        }

        if (debug > 1) console.timeEnd('clipping');

        if (features.length) {
            stack.push(tl || [], z + 1, x * 2,     y * 2);
            stack.push(bl || [], z + 1, x * 2,     y * 2 + 1);
            stack.push(tr || [], z + 1, x * 2 + 1, y * 2);
            stack.push(br || [], z + 1, x * 2 + 1, y * 2 + 1);
        }
    }

    return solid;
};

GeoJSONVT.prototype.getTile = function (z, x, y) {
    var options = this.options,
        extent = options.extent,
        debug = options.debug;

    var z2 = 1 << z;
    x = ((x % z2) + z2) % z2; // wrap tile x coordinate

    var id = toID(z, x, y);
    if (this.tiles[id]) return transform.tile(this.tiles[id], extent);

    if (debug > 1) console.log('drilling down to z%d-%d-%d', z, x, y);

    var z0 = z,
        x0 = x,
        y0 = y,
        parent;

    while (!parent && z0 > 0) {
        z0--;
        x0 = Math.floor(x0 / 2);
        y0 = Math.floor(y0 / 2);
        parent = this.tiles[toID(z0, x0, y0)];
    }

    if (!parent || !parent.source) return null;

    // if we found a parent tile containing the original geometry, we can drill down from it
    if (debug > 1) console.log('found parent tile z%d-%d-%d', z0, x0, y0);

    // it parent tile is a solid clipped square, return it instead since it's identical
    if (isClippedSquare(parent, extent, options.buffer)) return transform.tile(parent, extent);

    if (debug > 1) console.time('drilling down');
    var solid = this.splitTile(parent.source, z0, x0, y0, z, x, y);
    if (debug > 1) console.timeEnd('drilling down');

    // one of the parent tiles was a solid clipped square
    if (solid !== null) {
        var m = 1 << (z - solid);
        id = toID(solid, Math.floor(x / m), Math.floor(y / m));
    }

    return this.tiles[id] ? transform.tile(this.tiles[id], extent) : null;
};

function toID(z, x, y) {
    return (((1 << z) * y + x) * 32) + z;
}

function intersectX(a, b, x) {
    return [x, (x - a[0]) * (b[1] - a[1]) / (b[0] - a[0]) + a[1], 1];
}
function intersectY(a, b, y) {
    return [(y - a[1]) * (b[0] - a[0]) / (b[1] - a[1]) + a[0], y, 1];
}

function extend(dest, src) {
    for (var i in src) dest[i] = src[i];
    return dest;
}

// checks whether a tile is a whole-area fill after clipping; if it is, there's no sense slicing it further
function isClippedSquare(tile, extent, buffer) {

    var features = tile.source;
    if (features.length !== 1) return false;

    var feature = features[0];
    if (feature.type !== 3 || feature.geometry.length > 1) return false;

    var len = feature.geometry[0].length;
    if (len !== 5) return false;

    for (var i = 0; i < len; i++) {
        var p = transform.point(feature.geometry[0][i], extent, tile.z2, tile.x, tile.y);
        if ((p[0] !== -buffer && p[0] !== extent + buffer) ||
            (p[1] !== -buffer && p[1] !== extent + buffer)) return false;
    }

    return true;
}

},{"./clip":18,"./convert":19,"./tile":23,"./transform":24,"./wrap":25}],22:[function(require,module,exports){
'use strict';

module.exports = simplify;

// calculate simplification data using optimized Douglas-Peucker algorithm

function simplify(points, tolerance) {

    var sqTolerance = tolerance * tolerance,
        len = points.length,
        first = 0,
        last = len - 1,
        stack = [],
        i, maxSqDist, sqDist, index;

    // always retain the endpoints (1 is the max value)
    points[first][2] = 1;
    points[last][2] = 1;

    // avoid recursion by using a stack
    while (last) {

        maxSqDist = 0;

        for (i = first + 1; i < last; i++) {
            sqDist = getSqSegDist(points[i], points[first], points[last]);

            if (sqDist > maxSqDist) {
                index = i;
                maxSqDist = sqDist;
            }
        }

        if (maxSqDist > sqTolerance) {
            points[index][2] = maxSqDist; // save the point importance in squared pixels as a z coordinate
            stack.push(first);
            stack.push(index);
            first = index;

        } else {
            last = stack.pop();
            first = stack.pop();
        }
    }
}

// square distance from a point to a segment
function getSqSegDist(p, a, b) {

    var x = a[0], y = a[1],
        bx = b[0], by = b[1],
        px = p[0], py = p[1],
        dx = bx - x,
        dy = by - y;

    if (dx !== 0 || dy !== 0) {

        var t = ((px - x) * dx + (py - y) * dy) / (dx * dx + dy * dy);

        if (t > 1) {
            x = bx;
            y = by;

        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = px - x;
    dy = py - y;

    return dx * dx + dy * dy;
}

},{}],23:[function(require,module,exports){
'use strict';

module.exports = createTile;

function createTile(features, z2, tx, ty, tolerance, noSimplify) {
    var tile = {
        features: [],
        numPoints: 0,
        numSimplified: 0,
        numFeatures: 0,
        source: null,
        x: tx,
        y: ty,
        z2: z2,
        transformed: false,
        min: [2, 1],
        max: [-1, 0]
    };
    for (var i = 0; i < features.length; i++) {
        tile.numFeatures++;
        addFeature(tile, features[i], tolerance, noSimplify);

        var min = features[i].min,
            max = features[i].max;

        if (min[0] < tile.min[0]) tile.min[0] = min[0];
        if (min[1] < tile.min[1]) tile.min[1] = min[1];
        if (max[0] > tile.max[0]) tile.max[0] = max[0];
        if (max[1] > tile.max[1]) tile.max[1] = max[1];
    }
    return tile;
}

function addFeature(tile, feature, tolerance, noSimplify) {

    var geom = feature.geometry,
        type = feature.type,
        simplified = [],
        sqTolerance = tolerance * tolerance,
        i, j, ring, p;

    if (type === 1) {
        for (i = 0; i < geom.length; i++) {
            simplified.push(geom[i]);
            tile.numPoints++;
            tile.numSimplified++;
        }

    } else {

        // simplify and transform projected coordinates for tile geometry
        for (i = 0; i < geom.length; i++) {
            ring = geom[i];

            // filter out tiny polylines & polygons
            if (!noSimplify && ((type === 2 && ring.dist < tolerance) ||
                                (type === 3 && ring.area < sqTolerance))) {
                tile.numPoints += ring.length;
                continue;
            }

            var simplifiedRing = [];

            for (j = 0; j < ring.length; j++) {
                p = ring[j];
                // keep points with importance > tolerance
                if (noSimplify || p[2] > sqTolerance) {
                    simplifiedRing.push(p);
                    tile.numSimplified++;
                }
                tile.numPoints++;
            }

            if (type === 3) rewind(simplifiedRing, ring.outer);

            simplified.push(simplifiedRing);
        }
    }

    if (simplified.length) {
        var tileFeature = {
            geometry: simplified,
            type: type,
            tags: feature.tags || null
        };
        if (feature.id !== null) {
            tileFeature.id = feature.id;
        }
        tile.features.push(tileFeature);
    }
}

function rewind(ring, clockwise) {
    var area = signedArea(ring);
    if (area < 0 === clockwise) ring.reverse();
}

function signedArea(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2[0] - p1[0]) * (p1[1] + p2[1]);
    }
    return sum;
}

},{}],24:[function(require,module,exports){
'use strict';

exports.tile = transformTile;
exports.point = transformPoint;

// Transforms the coordinates of each feature in the given tile from
// mercator-projected space into (extent x extent) tile space.
function transformTile(tile, extent) {
    if (tile.transformed) return tile;

    var z2 = tile.z2,
        tx = tile.x,
        ty = tile.y,
        i, j, k;

    for (i = 0; i < tile.features.length; i++) {
        var feature = tile.features[i],
            geom = feature.geometry,
            type = feature.type;

        if (type === 1) {
            for (j = 0; j < geom.length; j++) geom[j] = transformPoint(geom[j], extent, z2, tx, ty);

        } else {
            for (j = 0; j < geom.length; j++) {
                var ring = geom[j];
                for (k = 0; k < ring.length; k++) ring[k] = transformPoint(ring[k], extent, z2, tx, ty);
            }
        }
    }

    tile.transformed = true;

    return tile;
}

function transformPoint(p, extent, z2, tx, ty) {
    var x = Math.round(extent * (p[0] * z2 - tx)),
        y = Math.round(extent * (p[1] * z2 - ty));
    return [x, y];
}

},{}],25:[function(require,module,exports){
'use strict';

var clip = require('./clip');
var createFeature = require('./feature');

module.exports = wrap;

function wrap(features, buffer, intersectX) {
    var merged = features,
        left  = clip(features, 1, -1 - buffer, buffer,     0, intersectX, -1, 2), // left world copy
        right = clip(features, 1,  1 - buffer, 2 + buffer, 0, intersectX, -1, 2); // right world copy

    if (left || right) {
        merged = clip(features, 1, -buffer, 1 + buffer, 0, intersectX, -1, 2) || []; // center world copy

        if (left) merged = shiftFeatureCoords(left, 1).concat(merged); // merge left into center
        if (right) merged = merged.concat(shiftFeatureCoords(right, -1)); // merge right into center
    }

    return merged;
}

function shiftFeatureCoords(features, offset) {
    var newFeatures = [];

    for (var i = 0; i < features.length; i++) {
        var feature = features[i],
            type = feature.type;

        var newGeometry;

        if (type === 1) {
            newGeometry = shiftCoords(feature.geometry, offset);
        } else {
            newGeometry = [];
            for (var j = 0; j < feature.geometry.length; j++) {
                newGeometry.push(shiftCoords(feature.geometry[j], offset));
            }
        }

        newFeatures.push(createFeature(feature.tags, type, newGeometry, feature.id));
    }

    return newFeatures;
}

function shiftCoords(points, offset) {
    var newPoints = [];
    newPoints.area = points.area;
    newPoints.dist = points.dist;

    for (var i = 0; i < points.length; i++) {
        newPoints.push([points[i][0] + offset, points[i][1], points[i][2]]);
    }
    return newPoints;
}

},{"./clip":18,"./feature":20}],26:[function(require,module,exports){
'use strict';

module.exports = GridIndex;

var NUM_PARAMS = 3;

function GridIndex(extent, n, padding) {
    var cells = this.cells = [];

    if (extent instanceof ArrayBuffer) {
        this.arrayBuffer = extent;
        var array = new Int32Array(this.arrayBuffer);
        extent = array[0];
        n = array[1];
        padding = array[2];

        this.d = n + 2 * padding;
        for (var k = 0; k < this.d * this.d; k++) {
            var start = array[NUM_PARAMS + k];
            var end = array[NUM_PARAMS + k + 1];
            cells.push(start === end ?
                    null :
                    array.subarray(start, end));
        }
        var keysOffset = array[NUM_PARAMS + cells.length];
        var bboxesOffset = array[NUM_PARAMS + cells.length + 1];
        this.keys = array.subarray(keysOffset, bboxesOffset);
        this.bboxes = array.subarray(bboxesOffset);

        this.insert = this._insertReadonly;

    } else {
        this.d = n + 2 * padding;
        for (var i = 0; i < this.d * this.d; i++) {
            cells.push([]);
        }
        this.keys = [];
        this.bboxes = [];
    }

    this.n = n;
    this.extent = extent;
    this.padding = padding;
    this.scale = n / extent;
    this.uid = 0;

    var p = (padding / n) * extent;
    this.min = -p;
    this.max = extent + p;
}


GridIndex.prototype.insert = function(key, x1, y1, x2, y2) {
    this._forEachCell(x1, y1, x2, y2, this._insertCell, this.uid++);
    this.keys.push(key);
    this.bboxes.push(x1);
    this.bboxes.push(y1);
    this.bboxes.push(x2);
    this.bboxes.push(y2);
};

GridIndex.prototype._insertReadonly = function() {
    throw 'Cannot insert into a GridIndex created from an ArrayBuffer.';
};

GridIndex.prototype._insertCell = function(x1, y1, x2, y2, cellIndex, uid) {
    this.cells[cellIndex].push(uid);
};

GridIndex.prototype.query = function(x1, y1, x2, y2) {
    var min = this.min;
    var max = this.max;
    if (x1 <= min && y1 <= min && max <= x2 && max <= y2) {
        // We use `Array#slice` because `this.keys` may be a `Int32Array` and
        // some browsers (Safari and IE) do not support `TypedArray#slice`
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/TypedArray/slice#Browser_compatibility
        return Array.prototype.slice.call(this.keys);

    } else {
        var result = [];
        var seenUids = {};
        this._forEachCell(x1, y1, x2, y2, this._queryCell, result, seenUids);
        return result;
    }
};

GridIndex.prototype._queryCell = function(x1, y1, x2, y2, cellIndex, result, seenUids) {
    var cell = this.cells[cellIndex];
    if (cell !== null) {
        var keys = this.keys;
        var bboxes = this.bboxes;
        for (var u = 0; u < cell.length; u++) {
            var uid = cell[u];
            if (seenUids[uid] === undefined) {
                var offset = uid * 4;
                if ((x1 <= bboxes[offset + 2]) &&
                    (y1 <= bboxes[offset + 3]) &&
                    (x2 >= bboxes[offset + 0]) &&
                    (y2 >= bboxes[offset + 1])) {
                    seenUids[uid] = true;
                    result.push(keys[uid]);
                } else {
                    seenUids[uid] = false;
                }
            }
        }
    }
};

GridIndex.prototype._forEachCell = function(x1, y1, x2, y2, fn, arg1, arg2) {
    var cx1 = this._convertToCellCoord(x1);
    var cy1 = this._convertToCellCoord(y1);
    var cx2 = this._convertToCellCoord(x2);
    var cy2 = this._convertToCellCoord(y2);
    for (var x = cx1; x <= cx2; x++) {
        for (var y = cy1; y <= cy2; y++) {
            var cellIndex = this.d * y + x;
            if (fn.call(this, x1, y1, x2, y2, cellIndex, arg1, arg2)) return;
        }
    }
};

GridIndex.prototype._convertToCellCoord = function(x) {
    return Math.max(0, Math.min(this.d - 1, Math.floor(x * this.scale) + this.padding));
};

GridIndex.prototype.toArrayBuffer = function() {
    if (this.arrayBuffer) return this.arrayBuffer;

    var cells = this.cells;

    var metadataLength = NUM_PARAMS + this.cells.length + 1 + 1;
    var totalCellLength = 0;
    for (var i = 0; i < this.cells.length; i++) {
        totalCellLength += this.cells[i].length;
    }

    var array = new Int32Array(metadataLength + totalCellLength + this.keys.length + this.bboxes.length);
    array[0] = this.extent;
    array[1] = this.n;
    array[2] = this.padding;

    var offset = metadataLength;
    for (var k = 0; k < cells.length; k++) {
        var cell = cells[k];
        array[NUM_PARAMS + k] = offset;
        array.set(cell, offset);
        offset += cell.length;
    }

    array[NUM_PARAMS + cells.length] = offset;
    array.set(this.keys, offset);
    offset += this.keys.length;

    array[NUM_PARAMS + cells.length + 1] = offset;
    array.set(this.bboxes, offset);
    offset += this.bboxes.length;

    return array.buffer;
};

},{}],27:[function(require,module,exports){
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = nBytes * 8 - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = (value * c - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}

},{}],28:[function(require,module,exports){
'use strict';

var sort = require('./sort');
var range = require('./range');
var within = require('./within');

module.exports = kdbush;

function kdbush(points, getX, getY, nodeSize, ArrayType) {
    return new KDBush(points, getX, getY, nodeSize, ArrayType);
}

function KDBush(points, getX, getY, nodeSize, ArrayType) {
    getX = getX || defaultGetX;
    getY = getY || defaultGetY;
    ArrayType = ArrayType || Array;

    this.nodeSize = nodeSize || 64;
    this.points = points;

    this.ids = new ArrayType(points.length);
    this.coords = new ArrayType(points.length * 2);

    for (var i = 0; i < points.length; i++) {
        this.ids[i] = i;
        this.coords[2 * i] = getX(points[i]);
        this.coords[2 * i + 1] = getY(points[i]);
    }

    sort(this.ids, this.coords, this.nodeSize, 0, this.ids.length - 1, 0);
}

KDBush.prototype = {
    range: function (minX, minY, maxX, maxY) {
        return range(this.ids, this.coords, minX, minY, maxX, maxY, this.nodeSize);
    },

    within: function (x, y, r) {
        return within(this.ids, this.coords, x, y, r, this.nodeSize);
    }
};

function defaultGetX(p) { return p[0]; }
function defaultGetY(p) { return p[1]; }

},{"./range":29,"./sort":30,"./within":31}],29:[function(require,module,exports){
'use strict';

module.exports = range;

function range(ids, coords, minX, minY, maxX, maxY, nodeSize) {
    var stack = [0, ids.length - 1, 0];
    var result = [];
    var x, y;

    while (stack.length) {
        var axis = stack.pop();
        var right = stack.pop();
        var left = stack.pop();

        if (right - left <= nodeSize) {
            for (var i = left; i <= right; i++) {
                x = coords[2 * i];
                y = coords[2 * i + 1];
                if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[i]);
            }
            continue;
        }

        var m = Math.floor((left + right) / 2);

        x = coords[2 * m];
        y = coords[2 * m + 1];

        if (x >= minX && x <= maxX && y >= minY && y <= maxY) result.push(ids[m]);

        var nextAxis = (axis + 1) % 2;

        if (axis === 0 ? minX <= x : minY <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? maxX >= x : maxY >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

},{}],30:[function(require,module,exports){
'use strict';

module.exports = sortKD;

function sortKD(ids, coords, nodeSize, left, right, depth) {
    if (right - left <= nodeSize) return;

    var m = Math.floor((left + right) / 2);

    select(ids, coords, m, left, right, depth % 2);

    sortKD(ids, coords, nodeSize, left, m - 1, depth + 1);
    sortKD(ids, coords, nodeSize, m + 1, right, depth + 1);
}

function select(ids, coords, k, left, right, inc) {

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            select(ids, coords, k, newLeft, newRight, inc);
        }

        var t = coords[2 * k + inc];
        var i = left;
        var j = right;

        swapItem(ids, coords, left, k);
        if (coords[2 * right + inc] > t) swapItem(ids, coords, left, right);

        while (i < j) {
            swapItem(ids, coords, i, j);
            i++;
            j--;
            while (coords[2 * i + inc] < t) i++;
            while (coords[2 * j + inc] > t) j--;
        }

        if (coords[2 * left + inc] === t) swapItem(ids, coords, left, j);
        else {
            j++;
            swapItem(ids, coords, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swapItem(ids, coords, i, j) {
    swap(ids, i, j);
    swap(coords, 2 * i, 2 * j);
    swap(coords, 2 * i + 1, 2 * j + 1);
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

},{}],31:[function(require,module,exports){
'use strict';

module.exports = within;

function within(ids, coords, qx, qy, r, nodeSize) {
    var stack = [0, ids.length - 1, 0];
    var result = [];
    var r2 = r * r;

    while (stack.length) {
        var axis = stack.pop();
        var right = stack.pop();
        var left = stack.pop();

        if (right - left <= nodeSize) {
            for (var i = left; i <= right; i++) {
                if (sqDist(coords[2 * i], coords[2 * i + 1], qx, qy) <= r2) result.push(ids[i]);
            }
            continue;
        }

        var m = Math.floor((left + right) / 2);

        var x = coords[2 * m];
        var y = coords[2 * m + 1];

        if (sqDist(x, y, qx, qy) <= r2) result.push(ids[m]);

        var nextAxis = (axis + 1) % 2;

        if (axis === 0 ? qx - r <= x : qy - r <= y) {
            stack.push(left);
            stack.push(m - 1);
            stack.push(nextAxis);
        }
        if (axis === 0 ? qx + r >= x : qy + r >= y) {
            stack.push(m + 1);
            stack.push(right);
            stack.push(nextAxis);
        }
    }

    return result;
}

function sqDist(ax, ay, bx, by) {
    var dx = ax - bx;
    var dy = ay - by;
    return dx * dx + dy * dy;
}

},{}],32:[function(require,module,exports){
/**
 * lodash 3.0.7 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var isArray = require('lodash.isarray'),
    isTypedArray = require('lodash.istypedarray'),
    keys = require('lodash.keys');

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    stringTag = '[object String]';

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](https://people.mozilla.org/~jorendorff/es6-draft.html#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/**
 * A specialized version of `_.some` for arrays without support for callback
 * shorthands and `this` binding.
 *
 * @private
 * @param {Array} array The array to iterate over.
 * @param {Function} predicate The function invoked per iteration.
 * @returns {boolean} Returns `true` if any element passes the predicate check,
 *  else `false`.
 */
function arraySome(array, predicate) {
  var index = -1,
      length = array.length;

  while (++index < length) {
    if (predicate(array[index], index, array)) {
      return true;
    }
  }
  return false;
}

/**
 * The base implementation of `_.isEqual` without support for `this` binding
 * `customizer` functions.
 *
 * @private
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 */
function baseIsEqual(value, other, customizer, isLoose, stackA, stackB) {
  if (value === other) {
    return true;
  }
  if (value == null || other == null || (!isObject(value) && !isObjectLike(other))) {
    return value !== value && other !== other;
  }
  return baseIsEqualDeep(value, other, baseIsEqual, customizer, isLoose, stackA, stackB);
}

/**
 * A specialized version of `baseIsEqual` for arrays and objects which performs
 * deep comparisons and tracks traversed objects enabling objects with circular
 * references to be compared.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing objects.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA=[]] Tracks traversed `value` objects.
 * @param {Array} [stackB=[]] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function baseIsEqualDeep(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objIsArr = isArray(object),
      othIsArr = isArray(other),
      objTag = arrayTag,
      othTag = arrayTag;

  if (!objIsArr) {
    objTag = objToString.call(object);
    if (objTag == argsTag) {
      objTag = objectTag;
    } else if (objTag != objectTag) {
      objIsArr = isTypedArray(object);
    }
  }
  if (!othIsArr) {
    othTag = objToString.call(other);
    if (othTag == argsTag) {
      othTag = objectTag;
    } else if (othTag != objectTag) {
      othIsArr = isTypedArray(other);
    }
  }
  var objIsObj = objTag == objectTag,
      othIsObj = othTag == objectTag,
      isSameTag = objTag == othTag;

  if (isSameTag && !(objIsArr || objIsObj)) {
    return equalByTag(object, other, objTag);
  }
  if (!isLoose) {
    var objIsWrapped = objIsObj && hasOwnProperty.call(object, '__wrapped__'),
        othIsWrapped = othIsObj && hasOwnProperty.call(other, '__wrapped__');

    if (objIsWrapped || othIsWrapped) {
      return equalFunc(objIsWrapped ? object.value() : object, othIsWrapped ? other.value() : other, customizer, isLoose, stackA, stackB);
    }
  }
  if (!isSameTag) {
    return false;
  }
  // Assume cyclic values are equal.
  // For more information on detecting circular references see https://es5.github.io/#JO.
  stackA || (stackA = []);
  stackB || (stackB = []);

  var length = stackA.length;
  while (length--) {
    if (stackA[length] == object) {
      return stackB[length] == other;
    }
  }
  // Add `object` and `other` to the stack of traversed objects.
  stackA.push(object);
  stackB.push(other);

  var result = (objIsArr ? equalArrays : equalObjects)(object, other, equalFunc, customizer, isLoose, stackA, stackB);

  stackA.pop();
  stackB.pop();

  return result;
}

/**
 * A specialized version of `baseIsEqualDeep` for arrays with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Array} array The array to compare.
 * @param {Array} other The other array to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing arrays.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the arrays are equivalent, else `false`.
 */
function equalArrays(array, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var index = -1,
      arrLength = array.length,
      othLength = other.length;

  if (arrLength != othLength && !(isLoose && othLength > arrLength)) {
    return false;
  }
  // Ignore non-index properties.
  while (++index < arrLength) {
    var arrValue = array[index],
        othValue = other[index],
        result = customizer ? customizer(isLoose ? othValue : arrValue, isLoose ? arrValue : othValue, index) : undefined;

    if (result !== undefined) {
      if (result) {
        continue;
      }
      return false;
    }
    // Recursively compare arrays (susceptible to call stack limits).
    if (isLoose) {
      if (!arraySome(other, function(othValue) {
            return arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB);
          })) {
        return false;
      }
    } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, customizer, isLoose, stackA, stackB))) {
      return false;
    }
  }
  return true;
}

/**
 * A specialized version of `baseIsEqualDeep` for comparing objects of
 * the same `toStringTag`.
 *
 * **Note:** This function only supports comparing values with tags of
 * `Boolean`, `Date`, `Error`, `Number`, `RegExp`, or `String`.
 *
 * @private
 * @param {Object} value The object to compare.
 * @param {Object} other The other object to compare.
 * @param {string} tag The `toStringTag` of the objects to compare.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalByTag(object, other, tag) {
  switch (tag) {
    case boolTag:
    case dateTag:
      // Coerce dates and booleans to numbers, dates to milliseconds and booleans
      // to `1` or `0` treating invalid dates coerced to `NaN` as not equal.
      return +object == +other;

    case errorTag:
      return object.name == other.name && object.message == other.message;

    case numberTag:
      // Treat `NaN` vs. `NaN` as equal.
      return (object != +object)
        ? other != +other
        : object == +other;

    case regexpTag:
    case stringTag:
      // Coerce regexes to strings and treat strings primitives and string
      // objects as equal. See https://es5.github.io/#x15.10.6.4 for more details.
      return object == (other + '');
  }
  return false;
}

/**
 * A specialized version of `baseIsEqualDeep` for objects with support for
 * partial deep comparisons.
 *
 * @private
 * @param {Object} object The object to compare.
 * @param {Object} other The other object to compare.
 * @param {Function} equalFunc The function to determine equivalents of values.
 * @param {Function} [customizer] The function to customize comparing values.
 * @param {boolean} [isLoose] Specify performing partial comparisons.
 * @param {Array} [stackA] Tracks traversed `value` objects.
 * @param {Array} [stackB] Tracks traversed `other` objects.
 * @returns {boolean} Returns `true` if the objects are equivalent, else `false`.
 */
function equalObjects(object, other, equalFunc, customizer, isLoose, stackA, stackB) {
  var objProps = keys(object),
      objLength = objProps.length,
      othProps = keys(other),
      othLength = othProps.length;

  if (objLength != othLength && !isLoose) {
    return false;
  }
  var index = objLength;
  while (index--) {
    var key = objProps[index];
    if (!(isLoose ? key in other : hasOwnProperty.call(other, key))) {
      return false;
    }
  }
  var skipCtor = isLoose;
  while (++index < objLength) {
    key = objProps[index];
    var objValue = object[key],
        othValue = other[key],
        result = customizer ? customizer(isLoose ? othValue : objValue, isLoose? objValue : othValue, key) : undefined;

    // Recursively compare objects (susceptible to call stack limits).
    if (!(result === undefined ? equalFunc(objValue, othValue, customizer, isLoose, stackA, stackB) : result)) {
      return false;
    }
    skipCtor || (skipCtor = key == 'constructor');
  }
  if (!skipCtor) {
    var objCtor = object.constructor,
        othCtor = other.constructor;

    // Non `Object` object instances with different constructors are not equal.
    if (objCtor != othCtor &&
        ('constructor' in object && 'constructor' in other) &&
        !(typeof objCtor == 'function' && objCtor instanceof objCtor &&
          typeof othCtor == 'function' && othCtor instanceof othCtor)) {
      return false;
    }
  }
  return true;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

module.exports = baseIsEqual;

},{"lodash.isarray":36,"lodash.istypedarray":38,"lodash.keys":39}],33:[function(require,module,exports){
/**
 * lodash 3.0.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/**
 * A specialized version of `baseCallback` which only supports `this` binding
 * and specifying the number of arguments to provide to `func`.
 *
 * @private
 * @param {Function} func The function to bind.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {number} [argCount] The number of arguments to provide to `func`.
 * @returns {Function} Returns the callback.
 */
function bindCallback(func, thisArg, argCount) {
  if (typeof func != 'function') {
    return identity;
  }
  if (thisArg === undefined) {
    return func;
  }
  switch (argCount) {
    case 1: return function(value) {
      return func.call(thisArg, value);
    };
    case 3: return function(value, index, collection) {
      return func.call(thisArg, value, index, collection);
    };
    case 4: return function(accumulator, value, index, collection) {
      return func.call(thisArg, accumulator, value, index, collection);
    };
    case 5: return function(value, other, key, object, source) {
      return func.call(thisArg, value, other, key, object, source);
    };
  }
  return function() {
    return func.apply(thisArg, arguments);
  };
}

/**
 * This method returns the first argument provided to it.
 *
 * @static
 * @memberOf _
 * @category Utility
 * @param {*} value Any value.
 * @returns {*} Returns `value`.
 * @example
 *
 * var object = { 'user': 'fred' };
 *
 * _.identity(object) === object;
 * // => true
 */
function identity(value) {
  return value;
}

module.exports = bindCallback;

},{}],34:[function(require,module,exports){
/**
 * lodash 3.9.1 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = getNative;

},{}],35:[function(require,module,exports){
/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    funcTag = '[object Function]',
    genTag = '[object GeneratorFunction]';

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

module.exports = isArguments;

},{}],36:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */

/** `Object#toString` result references. */
var arrayTag = '[object Array]',
    funcTag = '[object Function]';

/** Used to detect host constructors (Safari > 5). */
var reIsHostCtor = /^\[object .+?Constructor\]$/;

/**
 * Checks if `value` is object-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to resolve the decompiled source of functions. */
var fnToString = Function.prototype.toString;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objToString = objectProto.toString;

/** Used to detect if a method is native. */
var reIsNative = RegExp('^' +
  fnToString.call(hasOwnProperty).replace(/[\\^$.*+?()[\]{}|]/g, '\\$&')
  .replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, '$1.*?') + '$'
);

/* Native method references for those with the same name as other `lodash` methods. */
var nativeIsArray = getNative(Array, 'isArray');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * Gets the native function at `key` of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @param {string} key The key of the method to get.
 * @returns {*} Returns the function if it's native, else `undefined`.
 */
function getNative(object, key) {
  var value = object == null ? undefined : object[key];
  return isNative(value) ? value : undefined;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(function() { return arguments; }());
 * // => false
 */
var isArray = nativeIsArray || function(value) {
  return isObjectLike(value) && isLength(value.length) && objToString.call(value) == arrayTag;
};

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in older versions of Chrome and Safari which return 'function' for regexes
  // and Safari 8 equivalents which return 'object' for typed array constructors.
  return isObject(value) && objToString.call(value) == funcTag;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is a native function.
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a native function, else `false`.
 * @example
 *
 * _.isNative(Array.prototype.push);
 * // => true
 *
 * _.isNative(_);
 * // => false
 */
function isNative(value) {
  if (value == null) {
    return false;
  }
  if (isFunction(value)) {
    return reIsNative.test(fnToString.call(value));
  }
  return isObjectLike(value) && reIsHostCtor.test(value);
}

module.exports = isArray;

},{}],37:[function(require,module,exports){
/**
 * lodash 3.0.4 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var baseIsEqual = require('lodash._baseisequal'),
    bindCallback = require('lodash._bindcallback');

/**
 * Performs a deep comparison between two values to determine if they are
 * equivalent. If `customizer` is provided it is invoked to compare values.
 * If `customizer` returns `undefined` comparisons are handled by the method
 * instead. The `customizer` is bound to `thisArg` and invoked with three
 * arguments: (value, other [, index|key]).
 *
 * **Note:** This method supports comparing arrays, booleans, `Date` objects,
 * numbers, `Object` objects, regexes, and strings. Objects are compared by
 * their own, not inherited, enumerable properties. Functions and DOM nodes
 * are **not** supported. Provide a customizer function to extend support
 * for comparing other values.
 *
 * @static
 * @memberOf _
 * @alias eq
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @param {Function} [customizer] The function to customize value comparisons.
 * @param {*} [thisArg] The `this` binding of `customizer`.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'user': 'fred' };
 * var other = { 'user': 'fred' };
 *
 * object == other;
 * // => false
 *
 * _.isEqual(object, other);
 * // => true
 *
 * // using a customizer callback
 * var array = ['hello', 'goodbye'];
 * var other = ['hi', 'goodbye'];
 *
 * _.isEqual(array, other, function(value, other) {
 *   if (_.every([value, other], RegExp.prototype.test, /^h(?:i|ello)$/)) {
 *     return true;
 *   }
 * });
 * // => true
 */
function isEqual(value, other, customizer, thisArg) {
  customizer = typeof customizer == 'function' ? bindCallback(customizer, thisArg, 3) : undefined;
  var result = customizer ? customizer(value, other) : undefined;
  return  result === undefined ? baseIsEqual(value, other, customizer) : !!result;
}

module.exports = isEqual;

},{"lodash._baseisequal":32,"lodash._bindcallback":33}],38:[function(require,module,exports){
/**
 * lodash 3.0.6 (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]',
    arrayTag = '[object Array]',
    boolTag = '[object Boolean]',
    dateTag = '[object Date]',
    errorTag = '[object Error]',
    funcTag = '[object Function]',
    mapTag = '[object Map]',
    numberTag = '[object Number]',
    objectTag = '[object Object]',
    regexpTag = '[object RegExp]',
    setTag = '[object Set]',
    stringTag = '[object String]',
    weakMapTag = '[object WeakMap]';

var arrayBufferTag = '[object ArrayBuffer]',
    dataViewTag = '[object DataView]',
    float32Tag = '[object Float32Array]',
    float64Tag = '[object Float64Array]',
    int8Tag = '[object Int8Array]',
    int16Tag = '[object Int16Array]',
    int32Tag = '[object Int32Array]',
    uint8Tag = '[object Uint8Array]',
    uint8ClampedTag = '[object Uint8ClampedArray]',
    uint16Tag = '[object Uint16Array]',
    uint32Tag = '[object Uint32Array]';

/** Used to identify `toStringTag` values of typed arrays. */
var typedArrayTags = {};
typedArrayTags[float32Tag] = typedArrayTags[float64Tag] =
typedArrayTags[int8Tag] = typedArrayTags[int16Tag] =
typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] =
typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] =
typedArrayTags[uint32Tag] = true;
typedArrayTags[argsTag] = typedArrayTags[arrayTag] =
typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] =
typedArrayTags[dataViewTag] = typedArrayTags[dateTag] =
typedArrayTags[errorTag] = typedArrayTags[funcTag] =
typedArrayTags[mapTag] = typedArrayTags[numberTag] =
typedArrayTags[objectTag] = typedArrayTags[regexpTag] =
typedArrayTags[setTag] = typedArrayTags[stringTag] =
typedArrayTags[weakMapTag] = false;

/** Used for built-in method references. */
var objectProto = Object.prototype;

/**
 * Used to resolve the [`toStringTag`](http://ecma-international.org/ecma-262/6.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length,
 *  else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Checks if `value` is classified as a typed array.
 *
 * @static
 * @memberOf _
 * @since 3.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is correctly classified,
 *  else `false`.
 * @example
 *
 * _.isTypedArray(new Uint8Array);
 * // => true
 *
 * _.isTypedArray([]);
 * // => false
 */
function isTypedArray(value) {
  return isObjectLike(value) &&
    isLength(value.length) && !!typedArrayTags[objectToString.call(value)];
}

module.exports = isTypedArray;

},{}],39:[function(require,module,exports){
/**
 * lodash 3.1.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern modularize exports="npm" -o ./`
 * Copyright 2012-2015 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
var getNative = require('lodash._getnative'),
    isArguments = require('lodash.isarguments'),
    isArray = require('lodash.isarray');

/** Used to detect unsigned integer values. */
var reIsUint = /^\d+$/;

/** Used for native method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/* Native method references for those with the same name as other `lodash` methods. */
var nativeKeys = getNative(Object, 'keys');

/**
 * Used as the [maximum length](http://ecma-international.org/ecma-262/6.0/#sec-number.max_safe_integer)
 * of an array-like value.
 */
var MAX_SAFE_INTEGER = 9007199254740991;

/**
 * The base implementation of `_.property` without support for deep paths.
 *
 * @private
 * @param {string} key The key of the property to get.
 * @returns {Function} Returns the new function.
 */
function baseProperty(key) {
  return function(object) {
    return object == null ? undefined : object[key];
  };
}

/**
 * Gets the "length" property value of `object`.
 *
 * **Note:** This function is used to avoid a [JIT bug](https://bugs.webkit.org/show_bug.cgi?id=142792)
 * that affects Safari on at least iOS 8.1-8.3 ARM64.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {*} Returns the "length" value.
 */
var getLength = baseProperty('length');

/**
 * Checks if `value` is array-like.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 */
function isArrayLike(value) {
  return value != null && isLength(getLength(value));
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  value = (typeof value == 'number' || reIsUint.test(value)) ? +value : -1;
  length = length == null ? MAX_SAFE_INTEGER : length;
  return value > -1 && value % 1 == 0 && value < length;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This function is based on [`ToLength`](http://ecma-international.org/ecma-262/6.0/#sec-tolength).
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 */
function isLength(value) {
  return typeof value == 'number' && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * A fallback implementation of `Object.keys` which creates an array of the
 * own enumerable property names of `object`.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function shimKeys(object) {
  var props = keysIn(object),
      propsLength = props.length,
      length = propsLength && object.length;

  var allowIndexes = !!length && isLength(length) &&
    (isArray(object) || isArguments(object));

  var index = -1,
      result = [];

  while (++index < propsLength) {
    var key = props[index];
    if ((allowIndexes && isIndex(key, length)) || hasOwnProperty.call(object, key)) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Checks if `value` is the [language type](https://es5.github.io/#x8) of `Object`.
 * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(1);
 * // => false
 */
function isObject(value) {
  // Avoid a V8 JIT bug in Chrome 19-20.
  // See https://code.google.com/p/v8/issues/detail?id=2291 for more details.
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/6.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
var keys = !nativeKeys ? shimKeys : function(object) {
  var Ctor = object == null ? undefined : object.constructor;
  if ((typeof Ctor == 'function' && Ctor.prototype === object) ||
      (typeof object != 'function' && isArrayLike(object))) {
    return shimKeys(object);
  }
  return isObject(object) ? nativeKeys(object) : [];
};

/**
 * Creates an array of the own and inherited enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects.
 *
 * @static
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keysIn(new Foo);
 * // => ['a', 'b', 'c'] (iteration order is not guaranteed)
 */
function keysIn(object) {
  if (object == null) {
    return [];
  }
  if (!isObject(object)) {
    object = Object(object);
  }
  var length = object.length;
  length = (length && isLength(length) &&
    (isArray(object) || isArguments(object)) && length) || 0;

  var Ctor = object.constructor,
      index = -1,
      isProto = typeof Ctor == 'function' && Ctor.prototype === object,
      result = Array(length),
      skipIndexes = length > 0;

  while (++index < length) {
    result[index] = (index + '');
  }
  for (var key in object) {
    if (!(skipIndexes && isIndex(key, length)) &&
        !(key == 'constructor' && (isProto || !hasOwnProperty.call(object, key)))) {
      result.push(key);
    }
  }
  return result;
}

module.exports = keys;

},{"lodash._getnative":34,"lodash.isarguments":35,"lodash.isarray":36}],40:[function(require,module,exports){
// Constants
var Kn = 18,
    Xn = 0.950470, // D65 standard referent
    Yn = 1,
    Zn = 1.088830,
    t0 = 4 / 29,
    t1 = 6 / 29,
    t2 = 3 * t1 * t1,
    t3 = t1 * t1 * t1,
    deg2rad = Math.PI / 180,
    rad2deg = 180 / Math.PI;

// Utilities
function xyz2lab(t) {
    return t > t3 ? Math.pow(t, 1 / 3) : t / t2 + t0;
}

function lab2xyz(t) {
    return t > t1 ? t * t * t : t2 * (t - t0);
}

function xyz2rgb(x) {
    return 255 * (x <= 0.0031308 ? 12.92 * x : 1.055 * Math.pow(x, 1 / 2.4) - 0.055);
}

function rgb2xyz(x) {
    return (x /= 255) <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

// LAB
function rgbToLab(rgbColor) {
    var b = rgb2xyz(rgbColor[0]),
        a = rgb2xyz(rgbColor[1]),
        l = rgb2xyz(rgbColor[2]),
        x = xyz2lab((0.4124564 * b + 0.3575761 * a + 0.1804375 * l) / Xn),
        y = xyz2lab((0.2126729 * b + 0.7151522 * a + 0.0721750 * l) / Yn),
        z = xyz2lab((0.0193339 * b + 0.1191920 * a + 0.9503041 * l) / Zn);

    return [
        116 * y - 16,
        500 * (x - y),
        200 * (y - z),
        rgbColor[3]
    ];
}

function labToRgb(labColor) {
    var y = (labColor[0] + 16) / 116,
        x = isNaN(labColor[1]) ? y : y + labColor[1] / 500,
        z = isNaN(labColor[2]) ? y : y - labColor[2] / 200;
    y = Yn * lab2xyz(y);
    x = Xn * lab2xyz(x);
    z = Zn * lab2xyz(z);
    return [
        xyz2rgb(3.2404542 * x - 1.5371385 * y - 0.4985314 * z), // D65 -> sRGB
        xyz2rgb(-0.9692660 * x + 1.8760108 * y + 0.0415560 * z),
        xyz2rgb(0.0556434 * x - 0.2040259 * y + 1.0572252 * z),
        labColor[3]
    ];
}

// HCL
function rgbToHcl(rgbColor) {
  var labColor = rgbToLab(rgbColor);
  var l = labColor[0],
    a = labColor[1],
    b = labColor[2];
  var h = Math.atan2(b, a) * rad2deg;
  return [
      h < 0 ? h + 360 : h,
      Math.sqrt(a * a + b * b),
      l,
      rgbColor[3]
  ];
}

function hclToRgb(hclColor) {
  var h = hclColor[0] * deg2rad,
    c = hclColor[1],
    l = hclColor[2];
  return labToRgb([
      l,
      Math.cos(h) * c,
      Math.sin(h) * c,
      hclColor[3]
  ]);
}

module.exports ={
  lab: {
    forward: rgbToLab,
    reverse: labToRgb
  },
  hcl: {
    forward: rgbToHcl,
    reverse: hclToRgb
  }
};

},{}],41:[function(require,module,exports){
'use strict';

var colorSpaces = require('./color_spaces');

function identityFunction(x) {
    return x;
}

function createFunction(parameters, defaultType) {
    var fun;

    if (!isFunctionDefinition(parameters)) {
        fun = function() { return parameters; };
        fun.isFeatureConstant = true;
        fun.isZoomConstant = true;

    } else {
        var zoomAndFeatureDependent = parameters.stops && typeof parameters.stops[0][0] === 'object';
        var featureDependent = zoomAndFeatureDependent || parameters.property !== undefined;
        var zoomDependent = zoomAndFeatureDependent || !featureDependent;
        var inputType = parameters.stops && typeof (zoomAndFeatureDependent ? parameters.stops[0][0].property : parameters.stops[0][0]);
        var type = parameters.type || defaultType || (inputType === 'string' ? 'categorical' : 'exponential');

        var innerFun;
        if (type === 'exponential') {
            innerFun = evaluateExponentialFunction;
        } else if (type === 'interval') {
            innerFun = evaluateIntervalFunction;
        } else if (type === 'categorical') {
            innerFun = evaluateCategoricalFunction;
        } else if (type === 'identity') {
            innerFun = evaluateIdentityFunction;
        } else {
            throw new Error('Unknown function type "' + type + '"');
        }

        var outputFunction;

        // If we're interpolating colors in a color system other than RGBA,
        // first translate all stop values to that color system, then interpolate
        // arrays as usual. The `outputFunction` option lets us then translate
        // the result of that interpolation back into RGBA.
        if (parameters.colorSpace && parameters.colorSpace !== 'rgb') {
            if (colorSpaces[parameters.colorSpace]) {
                var colorspace = colorSpaces[parameters.colorSpace];
                // Avoid mutating the parameters value
                parameters = JSON.parse(JSON.stringify(parameters));
                for (var s = 0; s < parameters.stops.length; s++) {
                    parameters.stops[s] = [
                        parameters.stops[s][0],
                        colorspace.forward(parameters.stops[s][1])
                    ];
                }
                outputFunction = colorspace.reverse;
            } else {
                throw new Error('Unknown color space: ' + parameters.colorSpace);
            }
        } else {
            outputFunction = identityFunction;
        }


        // For categorical functions, generate an Object as a hashmap of the stops for fast searching
        if (innerFun === evaluateCategoricalFunction) {
          var hashedStops = Object.create(null);
          for (var i = 0; i < parameters.stops.length; i++) {
            hashedStops[parameters.stops[i][0]] = parameters.stops[i][1];
          }
        }

        if (zoomAndFeatureDependent) {
            var featureFunctions = {};
            var featureFunctionStops = [];
            for (s = 0; s < parameters.stops.length; s++) {
                var stop = parameters.stops[s];
                if (featureFunctions[stop[0].zoom] === undefined) {
                    featureFunctions[stop[0].zoom] = {
                        zoom: stop[0].zoom,
                        type: parameters.type,
                        property: parameters.property,
                        stops: []
                    };
                }
                featureFunctions[stop[0].zoom].stops.push([stop[0].value, stop[1]]);
            }

            for (var z in featureFunctions) {
                featureFunctionStops.push([featureFunctions[z].zoom, createFunction(featureFunctions[z])]);
            }
            fun = function(zoom, feature) {
                return outputFunction(evaluateExponentialFunction({
                  stops: featureFunctionStops,
                  base: parameters.base
                }, zoom)(zoom, feature));
            };
            fun.isFeatureConstant = false;
            fun.isZoomConstant = false;

        } else if (zoomDependent) {
            fun = function(zoom) {
                if (innerFun === evaluateCategoricalFunction) {
                  return outputFunction(innerFun(parameters, zoom, hashedStops));
                }
                else return outputFunction(innerFun(parameters, zoom));
            };
            fun.isFeatureConstant = true;
            fun.isZoomConstant = false;
        } else {
            fun = function(zoom, feature) {
                if (innerFun === evaluateCategoricalFunction) {
                  return outputFunction(innerFun(parameters, feature[parameters.property], hashedStops));
                }
                else return outputFunction(
                  innerFun(parameters, feature[parameters.property]));
            };
            fun.isFeatureConstant = false;
            fun.isZoomConstant = true;
        }
    }

    return fun;
}

function evaluateCategoricalFunction(parameters, input, hashedStops) {
    var value = hashedStops[input];
    if (value === undefined) {
      // If the input is not found, return the first value from the original array by default
      return parameters.stops[0][1];
    }

    return value;
}

function evaluateIntervalFunction(parameters, input) {
    // Edge cases
    var n = parameters.stops.length;
    if (n === 1) return parameters.stops[0][1];
    if (input === undefined || input === null) return parameters.stops[n - 1][1];
    if (input <= parameters.stops[0][0]) return parameters.stops[0][1];
    if (input >= parameters.stops[n - 1][0]) return parameters.stops[n - 1][1];

    var index = binarySearchForIndex(parameters.stops, input);

    return parameters.stops[index][1];
}

function evaluateExponentialFunction(parameters, input) {
    var base = parameters.base !== undefined ? parameters.base : 1;

    // Edge cases
    var n = parameters.stops.length;
    if (n === 1) return parameters.stops[0][1];
    if (input === undefined || input === null) return parameters.stops[n - 1][1];
    if (input <= parameters.stops[0][0]) return parameters.stops[0][1];
    if (input >= parameters.stops[n - 1][0]) return parameters.stops[n - 1][1];

    var index = binarySearchForIndex(parameters.stops, input);

    return interpolate(
            input,
            base,
            parameters.stops[index][0],
            parameters.stops[index + 1][0],
            parameters.stops[index][1],
            parameters.stops[index + 1][1]
    );
}

function evaluateIdentityFunction(parameters, input) {
    return input;
}

function binarySearchForIndex(stops, input) {
  var n = stops.length;
  var lowerIndex = 0;
  var upperIndex = n - 1;
  var currentIndex = 0;
  var currentValue, upperValue;

  while (lowerIndex <= upperIndex) {
    currentIndex = Math.floor((lowerIndex + upperIndex) / 2);
    currentValue = stops[currentIndex][0];
    upperValue = stops[currentIndex + 1][0];
    if (input >= currentValue && input < upperValue) { // Search complete
      return currentIndex;
    } else if (currentValue < input) {
      lowerIndex = currentIndex + 1;
    } else if (currentValue > input) {
      upperIndex = currentIndex - 1;
    }
  }

  return Math.max(currentIndex - 1, 0);
}

function interpolate(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    if (typeof outputLower === 'function') {
        return function() {
            var evaluatedLower = outputLower.apply(undefined, arguments);
            var evaluatedUpper = outputUpper.apply(undefined, arguments);
            return interpolate(input, base, inputLower, inputUpper, evaluatedLower, evaluatedUpper);
        };
    } else if (outputLower.length) {
        return interpolateArray(input, base, inputLower, inputUpper, outputLower, outputUpper);
    } else {
        return interpolateNumber(input, base, inputLower, inputUpper, outputLower, outputUpper);
    }
}

function interpolateNumber(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var difference =  inputUpper - inputLower;
    var progress = input - inputLower;

    var ratio;
    if (base === 1) {
        ratio = progress / difference;
    } else {
        ratio = (Math.pow(base, progress) - 1) / (Math.pow(base, difference) - 1);
    }

    return (outputLower * (1 - ratio)) + (outputUpper * ratio);
}

function interpolateArray(input, base, inputLower, inputUpper, outputLower, outputUpper) {
    var output = [];
    for (var i = 0; i < outputLower.length; i++) {
        output[i] = interpolateNumber(input, base, inputLower, inputUpper, outputLower[i], outputUpper[i]);
    }
    return output;
}

function isFunctionDefinition(value) {
    return typeof value === 'object' && (value.stops || value.type === 'identity');
}


module.exports.isFunctionDefinition = isFunctionDefinition;

module.exports.interpolated = function(parameters) {
    return createFunction(parameters, 'exponential');
};

module.exports['piecewise-constant'] = function(parameters) {
    return createFunction(parameters, 'interval');
};

},{"./color_spaces":40}],42:[function(require,module,exports){
'use strict';

var refProperties = require('./util/ref_properties');

function deref(layer, parent) {
    var result = {};

    for (var k in layer) {
        if (k !== 'ref') {
            result[k] = layer[k];
        }
    }

    refProperties.forEach(function (k) {
        if (k in parent) {
            result[k] = parent[k];
        }
    });

    return result;
}

module.exports = derefLayers;

/**
 * Given an array of layers, some of which may contain `ref` properties
 * whose value is the `id` of another property, return a new array where
 * such layers have been augmented with the 'type', 'source', etc. properties
 * from the parent layer, and the `ref` property has been removed.
 *
 * The input is not modified. The output may contain references to portions
 * of the input.
 *
 * @param {Array<Layer>} layers
 * @returns {Array<Layer>}
 */
function derefLayers(layers) {
    layers = layers.slice();

    var map = Object.create(null), i;
    for (i = 0; i < layers.length; i++) {
        map[layers[i].id] = layers[i];
    }

    for (i = 0; i < layers.length; i++) {
        if ('ref' in layers[i]) {
            layers[i] = deref(layers[i], map[layers[i].ref]);
        }
    }

    return layers;
}

},{"./util/ref_properties":48}],43:[function(require,module,exports){
'use strict';

var isEqual = require('lodash.isequal');

var operations = {

    /*
     * { command: 'setStyle', args: [stylesheet] }
     */
    setStyle: 'setStyle',

    /*
     * { command: 'addLayer', args: [layer, 'beforeLayerId'] }
     */
    addLayer: 'addLayer',

    /*
     * { command: 'removeLayer', args: ['layerId'] }
     */
    removeLayer: 'removeLayer',

    /*
     * { command: 'setPaintProperty', args: ['layerId', 'prop', value] }
     */
    setPaintProperty: 'setPaintProperty',

    /*
     * { command: 'setLayoutProperty', args: ['layerId', 'prop', value] }
     */
    setLayoutProperty: 'setLayoutProperty',

    /*
     * { command: 'setFilter', args: ['layerId', filter] }
     */
    setFilter: 'setFilter',

    /*
     * { command: 'addSource', args: ['sourceId', source] }
     */
    addSource: 'addSource',

    /*
     * { command: 'removeSource', args: ['sourceId'] }
     */
    removeSource: 'removeSource',

    /*
     * { command: 'setLayerZoomRange', args: ['layerId', 0, 22] }
     */
    setLayerZoomRange: 'setLayerZoomRange',

    /*
     * { command: 'setLayerProperty', args: ['layerId', 'prop', value] }
     */
    setLayerProperty: 'setLayerProperty',

    /*
     * { command: 'setCenter', args: [[lon, lat]] }
     */
    setCenter: 'setCenter',

    /*
     * { command: 'setZoom', args: [zoom] }
     */
    setZoom: 'setZoom',

    /*
     * { command: 'setBearing', args: [bearing] }
     */
    setBearing: 'setBearing',

    /*
     * { command: 'setPitch', args: [pitch] }
     */
    setPitch: 'setPitch',

    /*
     * { command: 'setSprite', args: ['spriteUrl'] }
     */
    setSprite: 'setSprite',

    /*
     * { command: 'setGlyphs', args: ['glyphsUrl'] }
     */
    setGlyphs: 'setGlyphs',

    /*
     * { command: 'setTransition', args: [transition] }
     */
    setTransition: 'setTransition',

    /*
     * { command: 'setLighting', args: [lightProperties] }
     */
    setLight: 'setLight'

};


function diffSources(before, after, commands, sourcesRemoved) {
    before = before || {};
    after = after || {};

    var sourceId;

    // look for sources to remove
    for (sourceId in before) {
        if (!before.hasOwnProperty(sourceId)) continue;
        if (!after.hasOwnProperty(sourceId)) {
            commands.push({ command: operations.removeSource, args: [sourceId] });
            sourcesRemoved[sourceId] = true;
        }
    }

    // look for sources to add/update
    for (sourceId in after) {
        if (!after.hasOwnProperty(sourceId)) continue;
        if (!before.hasOwnProperty(sourceId)) {
            commands.push({ command: operations.addSource, args: [sourceId, after[sourceId]] });
        } else if (!isEqual(before[sourceId], after[sourceId])) {
            // no update command, must remove then add
            commands.push({ command: operations.removeSource, args: [sourceId] });
            commands.push({ command: operations.addSource, args: [sourceId, after[sourceId]] });
            sourcesRemoved[sourceId] = true;
        }
    }
}

function diffLayerPropertyChanges(before, after, commands, layerId, klass, command) {
    before = before || {};
    after = after || {};

    var prop;

    for (prop in before) {
        if (!before.hasOwnProperty(prop)) continue;
        if (!isEqual(before[prop], after[prop])) {
            commands.push({ command: command, args: [layerId, prop, after[prop], klass] });
        }
    }
    for (prop in after) {
        if (!after.hasOwnProperty(prop) || before.hasOwnProperty(prop)) continue;
        if (!isEqual(before[prop], after[prop])) {
            commands.push({ command: command, args: [layerId, prop, after[prop], klass] });
        }
    }
}

function pluckId(layer) {
    return layer.id;
}
function indexById(group, layer) {
    group[layer.id] = layer;
    return group;
}

function diffLayers(before, after, commands) {
    before = before || [];
    after = after || [];

    // order of layers by id
    var beforeOrder = before.map(pluckId);
    var afterOrder = after.map(pluckId);

    // index of layer by id
    var beforeIndex = before.reduce(indexById, {});
    var afterIndex = after.reduce(indexById, {});

    // track order of layers as if they have been mutated
    var tracker = beforeOrder.slice();

    // layers that have been added do not need to be diffed
    var clean = Object.create(null);

    var i, d, layerId, beforeLayer, afterLayer, insertBeforeLayerId, prop;

    // remove layers
    for (i = 0, d = 0; i < beforeOrder.length; i++) {
        layerId = beforeOrder[i];
        if (!afterIndex.hasOwnProperty(layerId)) {
            commands.push({ command: operations.removeLayer, args: [layerId] });
            tracker.splice(tracker.indexOf(layerId, d), 1);
        } else {
            // limit where in tracker we need to look for a match
            d++;
        }
    }

    // add/reorder layers
    for (i = 0, d = 0; i < afterOrder.length; i++) {
        // work backwards as insert is before an existing layer
        layerId = afterOrder[afterOrder.length - 1 - i];

        if (tracker[tracker.length - 1 - i] === layerId) continue;

        if (beforeIndex.hasOwnProperty(layerId)) {
            // remove the layer before we insert at the correct position
            commands.push({ command: operations.removeLayer, args: [layerId] });
            tracker.splice(tracker.lastIndexOf(layerId, tracker.length - d), 1);
        } else {
            // limit where in tracker we need to look for a match
            d++;
        }

        // add layer at correct position
        insertBeforeLayerId = tracker[tracker.length - i];
        commands.push({ command: operations.addLayer, args: [afterIndex[layerId], insertBeforeLayerId] });
        tracker.splice(tracker.length - i, 0, layerId);
        clean[layerId] = true;
    }

    // update layers
    for (i = 0; i < afterOrder.length; i++) {
        layerId = afterOrder[i];
        beforeLayer = beforeIndex[layerId];
        afterLayer = afterIndex[layerId];

        // no need to update if previously added (new or moved)
        if (clean[layerId] || isEqual(beforeLayer, afterLayer)) continue;

        // If source, source-layer, or type have changes, then remove the layer
        // and add it back 'from scratch'.
        if (!isEqual(beforeLayer.source, afterLayer.source) || !isEqual(beforeLayer['source-layer'], afterLayer['source-layer']) || !isEqual(beforeLayer.type, afterLayer.type)) {
            commands.push({ command: operations.removeLayer, args: [layerId] });
            // we add the layer back at the same position it was already in, so
            // there's no need to update the `tracker`
            insertBeforeLayerId = tracker[tracker.lastIndexOf(layerId) + 1];
            commands.push({ command: operations.addLayer, args: [afterLayer, insertBeforeLayerId] });
            continue;
        }

        // layout, paint, filter, minzoom, maxzoom
        diffLayerPropertyChanges(beforeLayer.layout, afterLayer.layout, commands, layerId, null, operations.setLayoutProperty);
        diffLayerPropertyChanges(beforeLayer.paint, afterLayer.paint, commands, layerId, null, operations.setPaintProperty);
        if (!isEqual(beforeLayer.filter, afterLayer.filter)) {
            commands.push({ command: operations.setFilter, args: [layerId, afterLayer.filter] });
        }
        if (!isEqual(beforeLayer.minzoom, afterLayer.minzoom) || !isEqual(beforeLayer.maxzoom, afterLayer.maxzoom)) {
            commands.push({ command: operations.setLayerZoomRange, args: [layerId, afterLayer.minzoom, afterLayer.maxzoom] });
        }

        // handle all other layer props, including paint.*
        for (prop in beforeLayer) {
            if (!beforeLayer.hasOwnProperty(prop)) continue;
            if (prop === 'layout' || prop === 'paint' || prop === 'filter'
                || prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom') continue;
            if (prop.indexOf('paint.') === 0) {
                diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), operations.setPaintProperty);
            } else if (!isEqual(beforeLayer[prop], afterLayer[prop])) {
                commands.push({ command: operations.setLayerProperty, args: [layerId, prop, afterLayer[prop]] });
            }
        }
        for (prop in afterLayer) {
            if (!afterLayer.hasOwnProperty(prop) || beforeLayer.hasOwnProperty(prop)) continue;
            if (prop === 'layout' || prop === 'paint' || prop === 'filter'
                || prop === 'metadata' || prop === 'minzoom' || prop === 'maxzoom') continue;
            if (prop.indexOf('paint.') === 0) {
                diffLayerPropertyChanges(beforeLayer[prop], afterLayer[prop], commands, layerId, prop.slice(6), operations.setPaintProperty);
            } else if (!isEqual(beforeLayer[prop], afterLayer[prop])) {
                commands.push({ command: operations.setLayerProperty, args: [layerId, prop, afterLayer[prop]] });
            }
        }
    }
}

/**
 * Diff two stylesheet
 *
 * Creates semanticly aware diffs that can easily be applied at runtime.
 * Operations produced by the diff closely resemble the mapbox-gl-js API. Any
 * error creating the diff will fall back to the 'setStyle' operation.
 *
 * Example diff:
 * [
 *     { command: 'setConstant', args: ['@water', '#0000FF'] },
 *     { command: 'setPaintProperty', args: ['background', 'background-color', 'black'] }
 * ]
 *
 * @param {*} [before] stylesheet to compare from
 * @param {*} after stylesheet to compare to
 * @returns Array list of changes
 */
function diffStyles(before, after) {
    if (!before) return [{ command: operations.setStyle, args: [after] }];

    var commands = [];

    try {
        // Handle changes to top-level properties
        if (!isEqual(before.version, after.version)) {
            return [{ command: operations.setStyle, args: [after] }];
        }
        if (!isEqual(before.center, after.center)) {
            commands.push({ command: operations.setCenter, args: [after.center] });
        }
        if (!isEqual(before.zoom, after.zoom)) {
            commands.push({ command: operations.setZoom, args: [after.zoom] });
        }
        if (!isEqual(before.bearing, after.bearing)) {
            commands.push({ command: operations.setBearing, args: [after.bearing] });
        }
        if (!isEqual(before.pitch, after.pitch)) {
            commands.push({ command: operations.setPitch, args: [after.pitch] });
        }
        if (!isEqual(before.sprite, after.sprite)) {
            commands.push({ command: operations.setSprite, args: [after.sprite] });
        }
        if (!isEqual(before.glyphs, after.glyphs)) {
            commands.push({ command: operations.setGlyphs, args: [after.glyphs] });
        }
        if (!isEqual(before.transition, after.transition)) {
            commands.push({ command: operations.setTransition, args: [after.transition] });
        }
        if (!isEqual(before.light, after.light)) {
            commands.push({ command: operations.setLight, args: [after.light] });
        }

        // Handle changes to `sources`
        // If a source is to be removed, we also--before the removeSource
        // command--need to remove all the style layers that depend on it.
        var sourcesRemoved = {};

        // First collect the {add,remove}Source commands
        var removeOrAddSourceCommands = [];
        diffSources(before.sources, after.sources, removeOrAddSourceCommands, sourcesRemoved);

        // Push a removeLayer command for each style layer that depends on a
        // source that's being removed.
        // Also, exclude any such layers them from the input to `diffLayers`
        // below, so that diffLayers produces the appropriate `addLayers`
        // command
        var beforeLayers = [];
        if (before.layers) {
            before.layers.forEach(function (layer) {
                if (sourcesRemoved[layer.source]) {
                    commands.push({ command: operations.removeLayer, args: [layer.id] });
                } else {
                    beforeLayers.push(layer);
                }
            });
        }
        commands = commands.concat(removeOrAddSourceCommands);

        // Handle changes to `layers`
        diffLayers(beforeLayers, after.layers, commands);

    } catch (e) {
        // fall back to setStyle
        console.warn('Unable to compute style diff:', e);
        commands = [{ command: operations.setStyle, args: [after] }];
    }

    return commands;
}

module.exports = diffStyles;
module.exports.operations = operations;

},{"lodash.isequal":37}],44:[function(require,module,exports){
'use strict';

var format = require('util').format;

function ValidationError(key, value /*, message, ...*/) {
    this.message = (
        (key ? key + ': ' : '') +
        format.apply(format, Array.prototype.slice.call(arguments, 2))
    );

    if (value !== null && value !== undefined && value.__line__) {
        this.line = value.__line__;
    }
}

module.exports = ValidationError;

},{"util":5}],45:[function(require,module,exports){
'use strict';

var refProperties = require('./util/ref_properties');
var stringify = require('fast-stable-stringify');

function key(layer) {
    return stringify(refProperties.map(function (k) {
        return layer[k];
    }));
}

module.exports = groupByLayout;

/**
 * Given an array of layers, return an array of arrays of layers where all
 * layers in each group have identical layout-affecting properties. These
 * are the properties that were formerly used by explicit `ref` mechanism
 * for layers: 'type', 'source', 'source-layer', 'minzoom', 'maxzoom',
 * 'filter', and 'layout'.
 *
 * The input is not modified. The output layers are references to the
 * input layers.
 *
 * @param {Array<Layer>} layers
 * @returns {Array<Array<Layer>>}
 */
function groupByLayout(layers) {
    var groups = {}, i, k;

    for (i = 0; i < layers.length; i++) {
        k = key(layers[i]);
        var group = groups[k];
        if (!group) {
            group = groups[k] = [];
        }
        group.push(layers[i]);
    }

    var result = [];

    for (k in groups) {
        result.push(groups[k]);
    }

    return result;
}

},{"./util/ref_properties":48,"fast-stable-stringify":14}],46:[function(require,module,exports){
'use strict';

module.exports = function (output) {
    for (var i = 1; i < arguments.length; i++) {
        var input = arguments[i];
        for (var k in input) {
            output[k] = input[k];
        }
    }
    return output;
};

},{}],47:[function(require,module,exports){
'use strict';

module.exports = function getType(val) {
    if (val instanceof Number) {
        return 'number';
    } else if (val instanceof String) {
        return 'string';
    } else if (val instanceof Boolean) {
        return 'boolean';
    } else if (Array.isArray(val)) {
        return 'array';
    } else if (val === null) {
        return 'null';
    } else {
        return typeof val;
    }
};

},{}],48:[function(require,module,exports){
'use strict';

module.exports = ['type', 'source', 'source-layer', 'minzoom', 'maxzoom', 'filter', 'layout'];

},{}],49:[function(require,module,exports){
'use strict';

// Turn jsonlint-lines-primitives objects into primitive objects
module.exports = function unbundle(value) {
    if (value instanceof Number || value instanceof String || value instanceof Boolean) {
        return value.valueOf();
    } else {
        return value;
    }
};

},{}],50:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');
var extend = require('../util/extend');

// Main recursive validation function. Tracks:
//
// - key: string representing location of validation in style tree. Used only
//   for more informative error reporting.
// - value: current value from style being evaluated. May be anything from a
//   high level object that needs to be descended into deeper or a simple
//   scalar value.
// - valueSpec: current spec being evaluated. Tracks value.

module.exports = function validate(options) {

    var validateFunction = require('./validate_function');
    var validateObject = require('./validate_object');
    var VALIDATORS = {
        '*': function() {
            return [];
        },
        'array': require('./validate_array'),
        'boolean': require('./validate_boolean'),
        'number': require('./validate_number'),
        'color': require('./validate_color'),
        'constants': require('./validate_constants'),
        'enum': require('./validate_enum'),
        'filter': require('./validate_filter'),
        'function': require('./validate_function'),
        'layer': require('./validate_layer'),
        'object': require('./validate_object'),
        'source': require('./validate_source'),
        'light': require('./validate_light'),
        'string': require('./validate_string')
    };

    var value = options.value;
    var valueSpec = options.valueSpec;
    var key = options.key;
    var styleSpec = options.styleSpec;
    var style = options.style;

    if (getType(value) === 'string' && value[0] === '@') {
        if (styleSpec.$version > 7) {
            return [new ValidationError(key, value, 'constants have been deprecated as of v8')];
        }
        if (!(value in style.constants)) {
            return [new ValidationError(key, value, 'constant "%s" not found', value)];
        }
        options = extend({}, options, { value: style.constants[value] });
    }

    if (valueSpec.function && getType(value) === 'object') {
        return validateFunction(options);

    } else if (valueSpec.type && VALIDATORS[valueSpec.type]) {
        return VALIDATORS[valueSpec.type](options);

    } else {
        return validateObject(extend({}, options, {
            valueSpec: valueSpec.type ? styleSpec[valueSpec.type] : valueSpec
        }));
    }
};

},{"../error/validation_error":44,"../util/extend":46,"../util/get_type":47,"./validate_array":51,"./validate_boolean":52,"./validate_color":53,"./validate_constants":54,"./validate_enum":55,"./validate_filter":56,"./validate_function":57,"./validate_layer":59,"./validate_light":61,"./validate_number":62,"./validate_object":63,"./validate_source":65,"./validate_string":66}],51:[function(require,module,exports){
'use strict';

var getType = require('../util/get_type');
var validate = require('./validate');
var ValidationError = require('../error/validation_error');

module.exports = function validateArray(options) {
    var array = options.value;
    var arraySpec = options.valueSpec;
    var style = options.style;
    var styleSpec = options.styleSpec;
    var key = options.key;
    var validateArrayElement = options.arrayElementValidator || validate;

    if (getType(array) !== 'array') {
        return [new ValidationError(key, array, 'array expected, %s found', getType(array))];
    }

    if (arraySpec.length && array.length !== arraySpec.length) {
        return [new ValidationError(key, array, 'array length %d expected, length %d found', arraySpec.length, array.length)];
    }

    if (arraySpec['min-length'] && array.length < arraySpec['min-length']) {
        return [new ValidationError(key, array, 'array length at least %d expected, length %d found', arraySpec['min-length'], array.length)];
    }

    var arrayElementSpec = {
        "type": arraySpec.value
    };

    if (styleSpec.$version < 7) {
        arrayElementSpec.function = arraySpec.function;
    }

    if (getType(arraySpec.value) === 'object') {
        arrayElementSpec = arraySpec.value;
    }

    var errors = [];
    for (var i = 0; i < array.length; i++) {
        errors = errors.concat(validateArrayElement({
            array: array,
            arrayIndex: i,
            value: array[i],
            valueSpec: arrayElementSpec,
            style: style,
            styleSpec: styleSpec,
            key: key + '[' + i + ']'
        }));
    }
    return errors;
};

},{"../error/validation_error":44,"../util/get_type":47,"./validate":50}],52:[function(require,module,exports){
'use strict';

var getType = require('../util/get_type');
var ValidationError = require('../error/validation_error');

module.exports = function validateBoolean(options) {
    var value = options.value;
    var key = options.key;
    var type = getType(value);

    if (type !== 'boolean') {
        return [new ValidationError(key, value, 'boolean expected, %s found', type)];
    }

    return [];
};

},{"../error/validation_error":44,"../util/get_type":47}],53:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');
var parseCSSColor = require('csscolorparser').parseCSSColor;

module.exports = function validateColor(options) {
    var key = options.key;
    var value = options.value;
    var type = getType(value);

    if (type !== 'string') {
        return [new ValidationError(key, value, 'color expected, %s found', type)];
    }

    if (parseCSSColor(value) === null) {
        return [new ValidationError(key, value, 'color expected, "%s" found', value)];
    }

    return [];
};

},{"../error/validation_error":44,"../util/get_type":47,"csscolorparser":8}],54:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');

module.exports = function validateConstants(options) {
    var key = options.key;
    var constants = options.value;
    var styleSpec = options.styleSpec;

    if (styleSpec.$version > 7) {
        if (constants) {
            return [new ValidationError(key, constants, 'constants have been deprecated as of v8')];
        } else {
            return [];
        }
    } else {
        var type = getType(constants);
        if (type !== 'object') {
            return [new ValidationError(key, constants, 'object expected, %s found', type)];
        }

        var errors = [];
        for (var constantName in constants) {
            if (constantName[0] !== '@') {
                errors.push(new ValidationError(key + '.' + constantName, constants[constantName], 'constants must start with "@"'));
            }
        }
        return errors;
    }

};

},{"../error/validation_error":44,"../util/get_type":47}],55:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var unbundle = require('../util/unbundle_jsonlint');

module.exports = function validateEnum(options) {
    var key = options.key;
    var value = options.value;
    var valueSpec = options.valueSpec;
    var errors = [];

    if (Array.isArray(valueSpec.values)) { // <=v7
        if (valueSpec.values.indexOf(unbundle(value)) === -1) {
            errors.push(new ValidationError(key, value, 'expected one of [%s], %s found', valueSpec.values.join(', '), value));
        }
    } else { // >=v8
        if (Object.keys(valueSpec.values).indexOf(unbundle(value)) === -1) {
            errors.push(new ValidationError(key, value, 'expected one of [%s], %s found', Object.keys(valueSpec.values).join(', '), value));
        }
    }
    return errors;
};

},{"../error/validation_error":44,"../util/unbundle_jsonlint":49}],56:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var validateEnum = require('./validate_enum');
var getType = require('../util/get_type');
var unbundle = require('../util/unbundle_jsonlint');

module.exports = function validateFilter(options) {
    var value = options.value;
    var key = options.key;
    var styleSpec = options.styleSpec;
    var type;

    var errors = [];

    if (getType(value) !== 'array') {
        return [new ValidationError(key, value, 'array expected, %s found', getType(value))];
    }

    if (value.length < 1) {
        return [new ValidationError(key, value, 'filter array must have at least 1 element')];
    }

    errors = errors.concat(validateEnum({
        key: key + '[0]',
        value: value[0],
        valueSpec: styleSpec.filter_operator,
        style: options.style,
        styleSpec: options.styleSpec
    }));

    switch (unbundle(value[0])) {
        case '<':
        case '<=':
        case '>':
        case '>=':
            if (value.length >= 2 && value[1] == '$type') {
                errors.push(new ValidationError(key, value, '"$type" cannot be use with operator "%s"', value[0]));
            }
        /* falls through */
        case '==':
        case '!=':
            if (value.length != 3) {
                errors.push(new ValidationError(key, value, 'filter array for operator "%s" must have 3 elements', value[0]));
            }
        /* falls through */
        case 'in':
        case '!in':
            if (value.length >= 2) {
                type = getType(value[1]);
                if (type !== 'string') {
                    errors.push(new ValidationError(key + '[1]', value[1], 'string expected, %s found', type));
                } else if (value[1][0] === '@') {
                    errors.push(new ValidationError(key + '[1]', value[1], 'filter key cannot be a constant'));
                }
            }
            for (var i = 2; i < value.length; i++) {
                type = getType(value[i]);
                if (value[1] == '$type') {
                    errors = errors.concat(validateEnum({
                        key: key + '[' + i + ']',
                        value: value[i],
                        valueSpec: styleSpec.geometry_type,
                        style: options.style,
                        styleSpec: options.styleSpec
                    }));
                } else if (type === 'string' && value[i][0] === '@') {
                    errors.push(new ValidationError(key + '[' + i + ']', value[i], 'filter value cannot be a constant'));
                } else if (type !== 'string' && type !== 'number' && type !== 'boolean') {
                    errors.push(new ValidationError(key + '[' + i + ']', value[i], 'string, number, or boolean expected, %s found', type));
                }
            }
            break;

        case 'any':
        case 'all':
        case 'none':
            for (i = 1; i < value.length; i++) {
                errors = errors.concat(validateFilter({
                    key: key + '[' + i + ']',
                    value: value[i],
                    style: options.style,
                    styleSpec: options.styleSpec
                }));
            }
            break;

        case 'has':
        case '!has':
            type = getType(value[1]);
            if (value.length !== 2) {
                errors.push(new ValidationError(key, value, 'filter array for "%s" operator must have 2 elements', value[0]));
            } else if (type !== 'string') {
                errors.push(new ValidationError(key + '[1]', value[1], 'string expected, %s found', type));
            } else if (value[1][0] === '@') {
                errors.push(new ValidationError(key + '[1]', value[1], 'filter key cannot be a constant'));
            }
            break;

    }

    return errors;
};

},{"../error/validation_error":44,"../util/get_type":47,"../util/unbundle_jsonlint":49,"./validate_enum":55}],57:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');
var validate = require('./validate');
var validateObject = require('./validate_object');
var validateArray = require('./validate_array');
var validateNumber = require('./validate_number');
var unbundle = require('../util/unbundle_jsonlint');

module.exports = function validateFunction(options) {
    var functionValueSpec = options.valueSpec;
    var functionType = unbundle(options.value.type);
    var stopKeyType;

    var isZoomFunction = options.value.property === undefined;
    var isPropertyFunction = options.value.property !== undefined;
    var isZoomAndPropertyFunction =
        getType(options.value.stops) === 'array' &&
        getType(options.value.stops[0]) === 'array' &&
        getType(options.value.stops[0][0]) === 'object';

    var errors = validateObject({
        key: options.key,
        value: options.value,
        valueSpec: options.styleSpec.function,
        style: options.style,
        styleSpec: options.styleSpec,
        objectElementValidators: { stops: validateFunctionStops }
    });

    if (functionType !== 'identity' && !options.value.stops) {
        errors.push(new ValidationError(options.key, options.value, 'missing required property "stops"'));
    }

    if (options.styleSpec.$version >= 8) {
       if (isPropertyFunction && !options.valueSpec['property-function']) {
           errors.push(new ValidationError(options.key, options.value, 'property functions not supported'));
       } else if (isZoomFunction && !options.valueSpec['zoom-function']) {
           errors.push(new ValidationError(options.key, options.value, 'zoom functions not supported'));
       }
    }

    return errors;

    function validateFunctionStops(options) {
        if (functionType === 'identity') {
            return [new ValidationError(options.key, options.value, 'identity function may not have a "stops" property')];
        }

        var errors = [];
        var value = options.value;

        errors = errors.concat(validateArray({
            key: options.key,
            value: value,
            valueSpec: options.valueSpec,
            style: options.style,
            styleSpec: options.styleSpec,
            arrayElementValidator: validateFunctionStop
        }));

        if (getType(value) === 'array' && value.length === 0) {
            errors.push(new ValidationError(options.key, value, 'array must have at least one stop'));
        }

        return errors;
    }

    function validateFunctionStop(options) {
        var errors = [];
        var value = options.value;
        var key = options.key;

        if (getType(value) !== 'array') {
            return [new ValidationError(key, value, 'array expected, %s found', getType(value))];
        }

        if (value.length !== 2) {
            return [new ValidationError(key, value, 'array length %d expected, length %d found', 2, value.length)];
        }

        if (isZoomAndPropertyFunction) {
            if (getType(value[0]) !== 'object') {
                return [new ValidationError(key, value, 'object expected, %s found', getType(value[0]))];
            }
            if (value[0].zoom === undefined) {
                return [new ValidationError(key, value, 'object stop key must have zoom')];
            }
            if (value[0].value === undefined) {
                return [new ValidationError(key, value, 'object stop key must have value')];
            }
            errors = errors.concat(validateObject({
                key: key + '[0]',
                value: value[0],
                valueSpec: { zoom: {} },
                style: options.style,
                styleSpec: options.styleSpec,
                objectElementValidators: { zoom: validateNumber, value: validateStopDomainValue }
            }));
        } else {
            errors = errors.concat((isZoomFunction ? validateNumber : validateStopDomainValue)({
                key: key + '[0]',
                value: value[0],
                valueSpec: {},
                style: options.style,
                styleSpec: options.styleSpec
            }));
        }

        errors = errors.concat(validate({
            key: key + '[1]',
            value: value[1],
            valueSpec: functionValueSpec,
            style: options.style,
            styleSpec: options.styleSpec
        }));

        if (getType(value[0]) === 'number') {
            if (functionValueSpec.function === 'piecewise-constant' && value[0] % 1 !== 0) {
                errors.push(new ValidationError(key + '[0]', value[0], 'zoom level for piecewise-constant functions must be an integer'));
            }

            if (options.arrayIndex !== 0) {
                if (value[0] < options.array[options.arrayIndex - 1][0]) {
                    errors.push(new ValidationError(key + '[0]', value[0], 'array stops must appear in ascending order'));
                }
            }
        }

        return errors;
    }

    function validateStopDomainValue(options) {
        var type = getType(options.value);

        if (!stopKeyType) {
            stopKeyType = type;
            if (!functionType && type === 'string') {
                functionType = 'categorical';
            }
        } else if (type !== stopKeyType) {
            return [new ValidationError(options.key, options.value, '%s stop domain type must match previous stop domain type %s', type, stopKeyType)];
        }

        if (type !== 'number' && type !== 'string') {
            return [new ValidationError(options.key, options.value, 'property value must be a number or string')];
        }

        if (type !== 'number' && functionType !== 'categorical') {
            return [new ValidationError(options.key, options.value, 'number expected, %s found', type)];
        }

        return [];
    }

};

},{"../error/validation_error":44,"../util/get_type":47,"../util/unbundle_jsonlint":49,"./validate":50,"./validate_array":51,"./validate_number":62,"./validate_object":63}],58:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var validateString = require('./validate_string');

module.exports = function(options) {
    var value = options.value;
    var key = options.key;

    var errors = validateString(options);
    if (errors.length) return errors;

    if (value.indexOf('{fontstack}') === -1) {
        errors.push(new ValidationError(key, value, '"glyphs" url must include a "{fontstack}" token'));
    }

    if (value.indexOf('{range}') === -1) {
        errors.push(new ValidationError(key, value, '"glyphs" url must include a "{range}" token'));
    }

    return errors;
};

},{"../error/validation_error":44,"./validate_string":66}],59:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var unbundle = require('../util/unbundle_jsonlint');
var validateObject = require('./validate_object');
var validateFilter = require('./validate_filter');
var validatePaintProperty = require('./validate_paint_property');
var validateLayoutProperty = require('./validate_layout_property');
var extend = require('../util/extend');

module.exports = function validateLayer(options) {
    var errors = [];

    var layer = options.value;
    var key = options.key;
    var style = options.style;
    var styleSpec = options.styleSpec;

    if (!layer.type && !layer.ref) {
        errors.push(new ValidationError(key, layer, 'either "type" or "ref" is required'));
    }
    var type = unbundle(layer.type);
    var ref = unbundle(layer.ref);

    if (layer.id) {
        for (var i = 0; i < options.arrayIndex; i++) {
            var otherLayer = style.layers[i];
            if (unbundle(otherLayer.id) === unbundle(layer.id)) {
                errors.push(new ValidationError(key, layer.id, 'duplicate layer id "%s", previously used at line %d', layer.id, otherLayer.id.__line__));
            }
        }
    }

    if ('ref' in layer) {
        ['type', 'source', 'source-layer', 'filter', 'layout'].forEach(function (p) {
            if (p in layer) {
                errors.push(new ValidationError(key, layer[p], '"%s" is prohibited for ref layers', p));
            }
        });

        var parent;

        style.layers.forEach(function(layer) {
            if (layer.id == ref) parent = layer;
        });

        if (!parent) {
            errors.push(new ValidationError(key, layer.ref, 'ref layer "%s" not found', ref));
        } else if (parent.ref) {
            errors.push(new ValidationError(key, layer.ref, 'ref cannot reference another ref layer'));
        } else {
            type = unbundle(parent.type);
        }
    } else if (type !== 'background') {
        if (!layer.source) {
            errors.push(new ValidationError(key, layer, 'missing required property "source"'));
        } else {
            var source = style.sources && style.sources[layer.source];
            if (!source) {
                errors.push(new ValidationError(key, layer.source, 'source "%s" not found', layer.source));
            } else if (source.type == 'vector' && type == 'raster') {
                errors.push(new ValidationError(key, layer.source, 'layer "%s" requires a raster source', layer.id));
            } else if (source.type == 'raster' && type != 'raster') {
                errors.push(new ValidationError(key, layer.source, 'layer "%s" requires a vector source', layer.id));
            } else if (source.type == 'vector' && !layer['source-layer']) {
                errors.push(new ValidationError(key, layer, 'layer "%s" must specify a "source-layer"', layer.id));
            }
        }
    }

    errors = errors.concat(validateObject({
        key: key,
        value: layer,
        valueSpec: styleSpec.layer,
        style: options.style,
        styleSpec: options.styleSpec,
        objectElementValidators: {
            '*': function() {
                return [];
            },
            filter: validateFilter,
            layout: function(options) {
                return validateObject({
                    layer: layer,
                    key: options.key,
                    value: options.value,
                    style: options.style,
                    styleSpec: options.styleSpec,
                    objectElementValidators: {
                        '*': function(options) {
                            return validateLayoutProperty(extend({layerType: type}, options));
                        }
                    }
                });
            },
            paint: function(options) {
                return validateObject({
                    layer: layer,
                    key: options.key,
                    value: options.value,
                    style: options.style,
                    styleSpec: options.styleSpec,
                    objectElementValidators: {
                        '*': function(options) {
                            return validatePaintProperty(extend({layerType: type}, options));
                        }
                    }
                });
            }
        }
    }));

    return errors;
};

},{"../error/validation_error":44,"../util/extend":46,"../util/unbundle_jsonlint":49,"./validate_filter":56,"./validate_layout_property":60,"./validate_object":63,"./validate_paint_property":64}],60:[function(require,module,exports){
'use strict';

var validate = require('./validate');
var ValidationError = require('../error/validation_error');

module.exports = function validateLayoutProperty(options) {
    var key = options.key;
    var style = options.style;
    var styleSpec = options.styleSpec;
    var value = options.value;
    var propertyKey = options.objectKey;
    var layerSpec = styleSpec['layout_' + options.layerType];

    if (!layerSpec) return [];

    if (options.valueSpec || layerSpec[propertyKey]) {
        var errors = [];

        if (options.layerType === 'symbol') {
            if (propertyKey === 'icon-image' && style && !style.sprite) {
                errors.push(new ValidationError(key, value, 'use of "icon-image" requires a style "sprite" property'));
            } else if (propertyKey === 'text-field' && style && !style.glyphs) {
                errors.push(new ValidationError(key, value, 'use of "text-field" requires a style "glyphs" property'));
            }
        }

        return errors.concat(validate({
            key: options.key,
            value: value,
            valueSpec: options.valueSpec || layerSpec[propertyKey],
            style: style,
            styleSpec: styleSpec
        }));

    } else {
        return [new ValidationError(key, value, 'unknown property "%s"', propertyKey)];
    }

};

},{"../error/validation_error":44,"./validate":50}],61:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');
var validate = require('./validate');

module.exports = function validateLight(options) {
    var light = options.value;
    var styleSpec = options.styleSpec;
    var lightSpec = styleSpec.light;
    var style = options.style;

    var errors = [];

    var rootType = getType(light);
    if (light === undefined) {
        return errors;
    } else if (rootType !== 'object') {
        errors = errors.concat([new ValidationError('light', light, 'object expected, %s found', rootType)]);
        return errors;
    }

    for (var key in light) {
        var transitionMatch = key.match(/^(.*)-transition$/);

        if (transitionMatch && lightSpec[transitionMatch[1]] && lightSpec[transitionMatch[1]].transition) {
            errors = errors.concat(validate({
                key: key,
                value: light[key],
                valueSpec: styleSpec.transition,
                style: style,
                styleSpec: styleSpec
            }));
        } else if (lightSpec[key]) {
            errors = errors.concat(validate({
                key: key,
                value: light[key],
                valueSpec: lightSpec[key],
                style: style,
                styleSpec: styleSpec
            }));
        } else {
            errors = errors.concat([new ValidationError(key, light[key], 'unknown property "%s"', key)]);
        }
    }

    return errors;
};

},{"../error/validation_error":44,"../util/get_type":47,"./validate":50}],62:[function(require,module,exports){
'use strict';

var getType = require('../util/get_type');
var ValidationError = require('../error/validation_error');

module.exports = function validateNumber(options) {
    var key = options.key;
    var value = options.value;
    var valueSpec = options.valueSpec;
    var type = getType(value);

    if (type !== 'number') {
        return [new ValidationError(key, value, 'number expected, %s found', type)];
    }

    if ('minimum' in valueSpec && value < valueSpec.minimum) {
        return [new ValidationError(key, value, '%s is less than the minimum value %s', value, valueSpec.minimum)];
    }

    if ('maximum' in valueSpec && value > valueSpec.maximum) {
        return [new ValidationError(key, value, '%s is greater than the maximum value %s', value, valueSpec.maximum)];
    }

    return [];
};

},{"../error/validation_error":44,"../util/get_type":47}],63:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var getType = require('../util/get_type');
var validateSpec = require('./validate');

module.exports = function validateObject(options) {
    var key = options.key;
    var object = options.value;
    var elementSpecs = options.valueSpec || {};
    var elementValidators = options.objectElementValidators || {};
    var style = options.style;
    var styleSpec = options.styleSpec;
    var errors = [];

    var type = getType(object);
    if (type !== 'object') {
        return [new ValidationError(key, object, 'object expected, %s found', type)];
    }

    for (var objectKey in object) {
        var elementSpecKey = objectKey.split('.')[0]; // treat 'paint.*' as 'paint'
        var elementSpec = elementSpecs[elementSpecKey] || elementSpecs['*'];

        var validateElement;
        if (elementValidators[elementSpecKey]) {
            validateElement = elementValidators[elementSpecKey];
        } else if (elementSpecs[elementSpecKey]) {
            validateElement = validateSpec;
        } else if (elementValidators['*']) {
            validateElement = elementValidators['*'];
        } else if (elementSpecs['*']) {
            validateElement = validateSpec;
        } else {
            errors.push(new ValidationError(key, object[objectKey], 'unknown property "%s"', objectKey));
            continue;
        }

        errors = errors.concat(validateElement({
            key: (key ? key + '.' : key) + objectKey,
            value: object[objectKey],
            valueSpec: elementSpec,
            style: style,
            styleSpec: styleSpec,
            object: object,
            objectKey: objectKey
        }));
    }

    for (elementSpecKey in elementSpecs) {
        if (elementSpecs[elementSpecKey].required && elementSpecs[elementSpecKey]['default'] === undefined && object[elementSpecKey] === undefined) {
            errors.push(new ValidationError(key, object, 'missing required property "%s"', elementSpecKey));
        }
    }

    return errors;
};

},{"../error/validation_error":44,"../util/get_type":47,"./validate":50}],64:[function(require,module,exports){
'use strict';

var validate = require('./validate');
var ValidationError = require('../error/validation_error');

module.exports = function validatePaintProperty(options) {
    var key = options.key;
    var style = options.style;
    var styleSpec = options.styleSpec;
    var value = options.value;
    var propertyKey = options.objectKey;
    var layerSpec = styleSpec['paint_' + options.layerType];

    if (!layerSpec) return [];

    var transitionMatch = propertyKey.match(/^(.*)-transition$/);

    if (transitionMatch && layerSpec[transitionMatch[1]] && layerSpec[transitionMatch[1]].transition) {
        return validate({
            key: key,
            value: value,
            valueSpec: styleSpec.transition,
            style: style,
            styleSpec: styleSpec
        });

    } else if (options.valueSpec || layerSpec[propertyKey]) {
        return validate({
            key: options.key,
            value: value,
            valueSpec: options.valueSpec || layerSpec[propertyKey],
            style: style,
            styleSpec: styleSpec
        });

    } else {
        return [new ValidationError(key, value, 'unknown property "%s"', propertyKey)];
    }

};

},{"../error/validation_error":44,"./validate":50}],65:[function(require,module,exports){
'use strict';

var ValidationError = require('../error/validation_error');
var unbundle = require('../util/unbundle_jsonlint');
var validateObject = require('./validate_object');
var validateEnum = require('./validate_enum');

module.exports = function validateSource(options) {
    var value = options.value;
    var key = options.key;
    var styleSpec = options.styleSpec;
    var style = options.style;

    if (!value.type) {
        return [new ValidationError(key, value, '"type" is required')];
    }

    var type = unbundle(value.type);
    switch (type) {
        case 'vector':
        case 'raster':
            var errors = [];
            errors = errors.concat(validateObject({
                key: key,
                value: value,
                valueSpec: styleSpec.source_tile,
                style: options.style,
                styleSpec: styleSpec
            }));
            if ('url' in value) {
                for (var prop in value) {
                    if (['type', 'url', 'tileSize'].indexOf(prop) < 0) {
                        errors.push(new ValidationError(key + '.' + prop, value[prop], 'a source with a "url" property may not include a "%s" property', prop));
                    }
                }
            }
            return errors;

        case 'geojson':
            return validateObject({
                key: key,
                value: value,
                valueSpec: styleSpec.source_geojson,
                style: style,
                styleSpec: styleSpec
            });

        case 'video':
            return validateObject({
                key: key,
                value: value,
                valueSpec: styleSpec.source_video,
                style: style,
                styleSpec: styleSpec
            });

        case 'image':
            return validateObject({
                key: key,
                value: value,
                valueSpec: styleSpec.source_image,
                style: style,
                styleSpec: styleSpec
            });

        default:
            return validateEnum({
                key: key + '.type',
                value: value.type,
                valueSpec: {values: ['vector', 'raster', 'geojson', 'video', 'image']},
                style: style,
                styleSpec: styleSpec
            });
    }
};

},{"../error/validation_error":44,"../util/unbundle_jsonlint":49,"./validate_enum":55,"./validate_object":63}],66:[function(require,module,exports){
'use strict';

var getType = require('../util/get_type');
var ValidationError = require('../error/validation_error');

module.exports = function validateString(options) {
    var value = options.value;
    var key = options.key;
    var type = getType(value);

    if (type !== 'string') {
        return [new ValidationError(key, value, 'string expected, %s found', type)];
    }

    return [];
};

},{"../error/validation_error":44,"../util/get_type":47}],67:[function(require,module,exports){
'use strict';

var validateConstants = require('./validate/validate_constants');
var validate = require('./validate/validate');
var latestStyleSpec = require('../reference/latest.min');
var validateGlyphsURL = require('./validate/validate_glyphs_url');

/**
 * Validate a Mapbox GL style against the style specification. This entrypoint,
 * `mapbox-gl-style-spec/lib/validate_style.min`, is designed to produce as
 * small a browserify bundle as possible by omitting unnecessary functionality
 * and legacy style specifications.
 *
 * @param {Object} style The style to be validated.
 * @param {Object} [styleSpec] The style specification to validate against.
 *     If omitted, the latest style spec is used.
 * @returns {Array<ValidationError>}
 * @example
 *   var validate = require('mapbox-gl-style-spec/lib/validate_style.min');
 *   var errors = validate(style);
 */
function validateStyleMin(style, styleSpec) {
    styleSpec = styleSpec || latestStyleSpec;

    var errors = [];

    errors = errors.concat(validate({
        key: '',
        value: style,
        valueSpec: styleSpec.$root,
        styleSpec: styleSpec,
        style: style,
        objectElementValidators: {
            glyphs: validateGlyphsURL,
            '*': function() {
                return [];
            }
        }
    }));

    if (styleSpec.$version > 7 && style.constants) {
        errors = errors.concat(validateConstants({
            key: 'constants',
            value: style.constants,
            style: style,
            styleSpec: styleSpec
        }));
    }

    return sortErrors(errors);
}

validateStyleMin.source = wrapCleanErrors(require('./validate/validate_source'));
validateStyleMin.light = wrapCleanErrors(require('./validate/validate_light'));
validateStyleMin.layer = wrapCleanErrors(require('./validate/validate_layer'));
validateStyleMin.filter = wrapCleanErrors(require('./validate/validate_filter'));
validateStyleMin.paintProperty = wrapCleanErrors(require('./validate/validate_paint_property'));
validateStyleMin.layoutProperty = wrapCleanErrors(require('./validate/validate_layout_property'));

function sortErrors(errors) {
    return [].concat(errors).sort(function (a, b) {
        return a.line - b.line;
    });
}

function wrapCleanErrors(inner) {
    return function() {
        return sortErrors(inner.apply(this, arguments));
    };
}

module.exports = validateStyleMin;

},{"../reference/latest.min":68,"./validate/validate":50,"./validate/validate_constants":54,"./validate/validate_filter":56,"./validate/validate_glyphs_url":58,"./validate/validate_layer":59,"./validate/validate_layout_property":60,"./validate/validate_light":61,"./validate/validate_paint_property":64,"./validate/validate_source":65}],68:[function(require,module,exports){
module.exports = require('./v8.min.json');

},{"./v8.min.json":69}],69:[function(require,module,exports){
module.exports={"$version":8,"$root":{"version":{"required":true,"type":"enum","values":[8]},"name":{"type":"string"},"metadata":{"type":"*"},"center":{"type":"array","value":"number"},"zoom":{"type":"number"},"bearing":{"type":"number","default":0,"period":360,"units":"degrees"},"pitch":{"type":"number","default":0,"units":"degrees"},"light":{"type":"light"},"sources":{"required":true,"type":"sources"},"sprite":{"type":"string"},"glyphs":{"type":"string"},"transition":{"type":"transition"},"layers":{"required":true,"type":"array","value":"layer"}},"sources":{"*":{"type":"source"}},"source":["source_tile","source_geojson","source_video","source_image"],"source_tile":{"type":{"required":true,"type":"enum","values":{"vector":{},"raster":{}}},"url":{"type":"string"},"tiles":{"type":"array","value":"string"},"minzoom":{"type":"number","default":0},"maxzoom":{"type":"number","default":22},"tileSize":{"type":"number","default":512,"units":"pixels"},"*":{"type":"*"}},"source_geojson":{"type":{"required":true,"type":"enum","values":{"geojson":{}}},"data":{"type":"*"},"maxzoom":{"type":"number","default":18},"buffer":{"type":"number","default":128,"maximum":512,"minimum":0},"tolerance":{"type":"number","default":0.375},"cluster":{"type":"boolean","default":false},"clusterRadius":{"type":"number","default":50,"minimum":0},"clusterMaxZoom":{"type":"number"}},"source_video":{"type":{"required":true,"type":"enum","values":{"video":{}}},"urls":{"required":true,"type":"array","value":"string"},"coordinates":{"required":true,"type":"array","length":4,"value":{"type":"array","length":2,"value":"number"}}},"source_image":{"type":{"required":true,"type":"enum","values":{"image":{}}},"url":{"required":true,"type":"string"},"coordinates":{"required":true,"type":"array","length":4,"value":{"type":"array","length":2,"value":"number"}}},"layer":{"id":{"type":"string","required":true},"type":{"type":"enum","values":{"fill":{},"line":{},"symbol":{},"circle":{},"fill-extrusion":{},"raster":{},"background":{}}},"metadata":{"type":"*"},"ref":{"type":"string"},"source":{"type":"string"},"source-layer":{"type":"string"},"minzoom":{"type":"number","minimum":0,"maximum":24},"maxzoom":{"type":"number","minimum":0,"maximum":24},"filter":{"type":"filter"},"layout":{"type":"layout"},"paint":{"type":"paint"},"paint.*":{"type":"paint"}},"layout":["layout_fill","layout_line","layout_circle","layout_fill-extrusion","layout_symbol","layout_raster","layout_background"],"layout_background":{"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_fill":{"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_circle":{"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_fill-extrusion":{"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_line":{"line-cap":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"butt":{},"round":{},"square":{}},"default":"butt"},"line-join":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"bevel":{},"round":{},"miter":{}},"default":"miter"},"line-miter-limit":{"type":"number","default":2,"function":"interpolated","zoom-function":true,"property-function":true,"requires":[{"line-join":"miter"}]},"line-round-limit":{"type":"number","default":1.05,"function":"interpolated","zoom-function":true,"property-function":true,"requires":[{"line-join":"round"}]},"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_symbol":{"symbol-placement":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"point":{},"line":{}},"default":"point"},"symbol-spacing":{"type":"number","default":250,"minimum":1,"function":"interpolated","zoom-function":true,"property-function":true,"units":"pixels","requires":[{"symbol-placement":"line"}]},"symbol-avoid-edges":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false},"icon-allow-overlap":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["icon-image"]},"icon-ignore-placement":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["icon-image"]},"icon-optional":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["icon-image","text-field"]},"icon-rotation-alignment":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{},"auto":{}},"default":"auto","requires":["icon-image"]},"icon-size":{"type":"number","default":1,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"requires":["icon-image"]},"icon-text-fit":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":false,"values":{"none":{},"width":{},"height":{},"both":{}},"default":"none","requires":["icon-image","text-field"]},"icon-text-fit-padding":{"type":"array","value":"number","length":4,"default":[0,0,0,0],"units":"pixels","function":"interpolated","zoom-function":true,"property-function":true,"requires":["icon-image","text-field",{"icon-text-fit":["both","width","height"]}]},"icon-image":{"type":"string","function":"piecewise-constant","zoom-function":true,"property-function":true,"tokens":true},"icon-rotate":{"type":"number","default":0,"period":360,"function":"interpolated","zoom-function":true,"property-function":true,"units":"degrees","requires":["icon-image"]},"icon-padding":{"type":"number","default":2,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"units":"pixels","requires":["icon-image"]},"icon-keep-upright":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["icon-image",{"icon-rotation-alignment":"map"},{"symbol-placement":"line"}]},"icon-offset":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"requires":["icon-image"]},"text-pitch-alignment":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{},"auto":{}},"default":"auto","requires":["text-field"]},"text-rotation-alignment":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{},"auto":{}},"default":"auto","requires":["text-field"]},"text-field":{"type":"string","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":"","tokens":true},"text-font":{"type":"array","value":"string","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":["Open Sans Regular","Arial Unicode MS Regular"],"requires":["text-field"]},"text-size":{"type":"number","default":16,"minimum":0,"units":"pixels","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-max-width":{"type":"number","default":10,"minimum":0,"units":"ems","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-line-height":{"type":"number","default":1.2,"units":"ems","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-letter-spacing":{"type":"number","default":0,"units":"ems","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-justify":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"left":{},"center":{},"right":{}},"default":"center","requires":["text-field"]},"text-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"center":{},"left":{},"right":{},"top":{},"bottom":{},"top-left":{},"top-right":{},"bottom-left":{},"bottom-right":{}},"default":"center","requires":["text-field"]},"text-max-angle":{"type":"number","default":45,"units":"degrees","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field",{"symbol-placement":"line"}]},"text-rotate":{"type":"number","default":0,"period":360,"units":"degrees","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-padding":{"type":"number","default":2,"minimum":0,"units":"pixels","function":"interpolated","zoom-function":true,"property-function":true,"requires":["text-field"]},"text-keep-upright":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":true,"requires":["text-field",{"text-rotation-alignment":"map"},{"symbol-placement":"line"}]},"text-transform":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"none":{},"uppercase":{},"lowercase":{}},"default":"none","requires":["text-field"]},"text-offset":{"type":"array","value":"number","units":"ems","function":"interpolated","zoom-function":true,"property-function":true,"length":2,"default":[0,0],"requires":["text-field"]},"text-allow-overlap":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["text-field"]},"text-ignore-placement":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["text-field"]},"text-optional":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":false,"requires":["text-field","icon-image"]},"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"layout_raster":{"visibility":{"type":"enum","function":"piecewise-constant","zoom-function":true,"values":{"visible":{},"none":{}},"default":"visible"}},"filter":{"type":"array","value":"*"},"filter_operator":{"type":"enum","values":{"==":{},"!=":{},">":{},">=":{},"<":{},"<=":{},"in":{},"!in":{},"all":{},"any":{},"none":{},"has":{},"!has":{}}},"geometry_type":{"type":"enum","values":{"Point":{},"LineString":{},"Polygon":{}}},"function":{"stops":{"type":"array","value":"function_stop"},"base":{"type":"number","default":1,"minimum":0},"property":{"type":"string","default":"$zoom"},"type":{"type":"enum","values":{"identity":{},"exponential":{},"interval":{},"categorical":{}},"default":"exponential"},"colorSpace":{"type":"enum","values":{"rgb":{},"lab":{},"hcl":{}},"default":"rgb"}},"function_stop":{"type":"array","minimum":0,"maximum":22,"value":["number","color"],"length":2},"light":{"anchor":{"type":"enum","default":"viewport","values":{"map":{},"viewport":{}},"transition":false},"position":{"type":"array","default":[1.15,210,30],"length":3,"value":"number","transition":true,"function":"interpolated","zoom-function":true,"property-function":false},"color":{"type":"color","default":"#ffffff","function":"interpolated","zoom-function":true,"property-function":false,"transition":true},"intensity":{"type":"number","default":0.5,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"property-function":false,"transition":true}},"paint":["paint_fill","paint_line","paint_circle","paint_fill-extrusion","paint_symbol","paint_raster","paint_background"],"paint_fill":{"fill-antialias":{"type":"boolean","function":"piecewise-constant","zoom-function":true,"property-function":true,"default":true},"fill-opacity":{"type":"number","function":"interpolated","zoom-function":true,"property-function":true,"default":1,"minimum":0,"maximum":1,"transition":true},"fill-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":[{"!":"fill-pattern"}]},"fill-outline-color":{"type":"color","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":[{"!":"fill-pattern"},{"fill-antialias":true}]},"fill-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"fill-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map","requires":["fill-translate"]},"fill-pattern":{"type":"string","function":"piecewise-constant","zoom-function":true,"property-function":true,"transition":true}},"paint_fill-extrusion":{"fill-extrusion-opacity":{"type":"number","function":"interpolated","zoom-function":true,"property-function":false,"default":1,"minimum":0,"maximum":1,"transition":true},"fill-extrusion-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":[{"!":"fill-pattern"}]},"fill-extrusion-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":false,"transition":true,"units":"pixels"},"fill-extrusion-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":false,"values":{"map":{},"viewport":{}},"default":"map","requires":["fill-extrusion-translate"]},"fill-extrusion-pattern":{"type":"string","function":"piecewise-constant","zoom-function":true,"property-function":false,"transition":true},"fill-extrusion-height":{"type":"number","function":"interpolated","zoom-function":true,"property-function":true,"default":0,"minimum":0,"units":"meters","transition":true},"fill-extrusion-base":{"type":"number","function":"interpolated","zoom-function":true,"property-function":true,"default":0,"minimum":0,"units":"meters","transition":true,"requires":[{"<=":"fill-extrusion-height"}]}},"paint_line":{"line-opacity":{"type":"number","function":"interpolated","zoom-function":true,"property-function":true,"default":1,"minimum":0,"maximum":1,"transition":true},"line-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":[{"!":"line-pattern"}]},"line-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"line-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map","requires":["line-translate"]},"line-width":{"type":"number","default":1,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"line-gap-width":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"line-offset":{"type":"number","default":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"line-blur":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"line-dasharray":{"type":"array","value":"number","function":"piecewise-constant","zoom-function":true,"property-function":true,"minimum":0,"transition":true,"units":"line widths","requires":[{"!":"line-pattern"}]},"line-pattern":{"type":"string","function":"piecewise-constant","zoom-function":true,"property-function":true,"transition":true}},"paint_circle":{"circle-radius":{"type":"number","default":5,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"circle-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true},"circle-blur":{"type":"number","default":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true},"circle-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true},"circle-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"circle-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map","requires":["circle-translate"]},"circle-pitch-scale":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map"},"circle-stroke-width":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels"},"circle-stroke-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true},"circle-stroke-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true}},"paint_symbol":{"icon-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["icon-image"]},"icon-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["icon-image"]},"icon-halo-color":{"type":"color","default":"rgba(0, 0, 0, 0)","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["icon-image"]},"icon-halo-width":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["icon-image"]},"icon-halo-blur":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["icon-image"]},"icon-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["icon-image"]},"icon-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map","requires":["icon-image","icon-translate"]},"text-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["text-field"]},"text-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["text-field"]},"text-halo-color":{"type":"color","default":"rgba(0, 0, 0, 0)","function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"requires":["text-field"]},"text-halo-width":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["text-field"]},"text-halo-blur":{"type":"number","default":0,"minimum":0,"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["text-field"]},"text-translate":{"type":"array","value":"number","length":2,"default":[0,0],"function":"interpolated","zoom-function":true,"property-function":true,"transition":true,"units":"pixels","requires":["text-field"]},"text-translate-anchor":{"type":"enum","function":"piecewise-constant","zoom-function":true,"property-function":true,"values":{"map":{},"viewport":{}},"default":"map","requires":["text-field","text-translate"]}},"paint_raster":{"raster-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"transition":true},"raster-hue-rotate":{"type":"number","default":0,"period":360,"function":"interpolated","zoom-function":true,"transition":true,"units":"degrees"},"raster-brightness-min":{"type":"number","function":"interpolated","zoom-function":true,"default":0,"minimum":0,"maximum":1,"transition":true},"raster-brightness-max":{"type":"number","function":"interpolated","zoom-function":true,"default":1,"minimum":0,"maximum":1,"transition":true},"raster-saturation":{"type":"number","default":0,"minimum":-1,"maximum":1,"function":"interpolated","zoom-function":true,"transition":true},"raster-contrast":{"type":"number","default":0,"minimum":-1,"maximum":1,"function":"interpolated","zoom-function":true,"transition":true},"raster-fade-duration":{"type":"number","default":300,"minimum":0,"function":"interpolated","zoom-function":true,"transition":true,"units":"milliseconds"}},"paint_background":{"background-color":{"type":"color","default":"#000000","function":"interpolated","zoom-function":true,"transition":true,"requires":[{"!":"background-pattern"}]},"background-pattern":{"type":"string","function":"piecewise-constant","zoom-function":true,"transition":true},"background-opacity":{"type":"number","default":1,"minimum":0,"maximum":1,"function":"interpolated","zoom-function":true,"transition":true}},"transition":{"duration":{"type":"number","default":300,"minimum":0,"units":"milliseconds"},"delay":{"type":"number","default":0,"minimum":0,"units":"milliseconds"}}}
},{}],70:[function(require,module,exports){
'use strict';

if (typeof module !== 'undefined' && module.exports) {
    module.exports = isSupported;
} else if (window) {
    window.mapboxgl = window.mapboxgl || {};
    window.mapboxgl.supported = isSupported;
}

/**
 * Test whether the current browser supports Mapbox GL JS
 * @param {Object} options
 * @param {boolean} [options.failIfMajorPerformanceCaveat=false] Return `false`
 *   if the performance of Mapbox GL JS would be dramatically worse than
 *   expected (i.e. a software renderer is would be used)
 * @return {boolean}
 */
function isSupported(options) {
    return !!(
        isBrowser() &&
        isArraySupported() &&
        isFunctionSupported() &&
        isObjectSupported() &&
        isJSONSupported() &&
        isWorkerSupported() &&
        isUint8ClampedArraySupported() &&
        isWebGLSupportedCached(options && options.failIfMajorPerformanceCaveat)
    );
}

function isBrowser() {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
}

function isArraySupported() {
    return (
        Array.prototype &&
        Array.prototype.every &&
        Array.prototype.filter &&
        Array.prototype.forEach &&
        Array.prototype.indexOf &&
        Array.prototype.lastIndexOf &&
        Array.prototype.map &&
        Array.prototype.some &&
        Array.prototype.reduce &&
        Array.prototype.reduceRight &&
        Array.isArray
    );
}

function isFunctionSupported() {
    return Function.prototype && Function.prototype.bind;
}

function isObjectSupported() {
    return (
        Object.keys &&
        Object.create &&
        Object.getPrototypeOf &&
        Object.getOwnPropertyNames &&
        Object.isSealed &&
        Object.isFrozen &&
        Object.isExtensible &&
        Object.getOwnPropertyDescriptor &&
        Object.defineProperty &&
        Object.defineProperties &&
        Object.seal &&
        Object.freeze &&
        Object.preventExtensions
    );
}

function isJSONSupported() {
    return 'JSON' in window && 'parse' in JSON && 'stringify' in JSON;
}

function isWorkerSupported() {
    return 'Worker' in window;
}

// IE11 only supports `Uint8ClampedArray` as of version
// [KB2929437](https://support.microsoft.com/en-us/kb/2929437)
function isUint8ClampedArraySupported() {
    return 'Uint8ClampedArray' in window;
}

var isWebGLSupportedCache = {};
function isWebGLSupportedCached(failIfMajorPerformanceCaveat) {

    if (isWebGLSupportedCache[failIfMajorPerformanceCaveat] === undefined) {
        isWebGLSupportedCache[failIfMajorPerformanceCaveat] = isWebGLSupported(failIfMajorPerformanceCaveat);
    }

    return isWebGLSupportedCache[failIfMajorPerformanceCaveat];
}

isSupported.webGLContextAttributes = {
    antialias: false,
    alpha: true,
    stencil: true,
    depth: true
};

function isWebGLSupported(failIfMajorPerformanceCaveat) {

    var canvas = document.createElement('canvas');

    var attributes = Object.create(isSupported.webGLContextAttributes);
    attributes.failIfMajorPerformanceCaveat = failIfMajorPerformanceCaveat;

    if (canvas.probablySupportsContext) {
        return (
            canvas.probablySupportsContext('webgl', attributes) ||
            canvas.probablySupportsContext('experimental-webgl', attributes)
        );

    } else if (canvas.supportsContext) {
        return (
            canvas.supportsContext('webgl', attributes) ||
            canvas.supportsContext('experimental-webgl', attributes)
        );

    } else {
        return (
            canvas.getContext('webgl', attributes) ||
            canvas.getContext('experimental-webgl', attributes)
        );
    }
}

},{}],71:[function(require,module,exports){
'use strict';
var ProgramConfiguration = require('./program_configuration');
var Segment = function Segment(vertexOffset, primitiveOffset) {
    this.vertexOffset = vertexOffset;
    this.primitiveOffset = primitiveOffset;
    this.vertexLength = 0;
    this.primitiveLength = 0;
};
var ArrayGroup = function ArrayGroup(programInterface, layers, zoom) {
    var this$1 = this;
    this.globalProperties = { zoom: zoom };
    var LayoutVertexArrayType = programInterface.layoutVertexArrayType;
    this.layoutVertexArray = new LayoutVertexArrayType();
    var ElementArrayType = programInterface.elementArrayType;
    if (ElementArrayType)
        this.elementArray = new ElementArrayType();
    var ElementArrayType2 = programInterface.elementArrayType2;
    if (ElementArrayType2)
        this.elementArray2 = new ElementArrayType2();
    this.layerData = {};
    for (var i = 0, list = layers; i < list.length; i += 1) {
        var layer = list[i];
        var programConfiguration = ProgramConfiguration.createDynamic(programInterface.paintAttributes || [], layer, zoom);
        this$1.layerData[layer.id] = {
            layer: layer,
            programConfiguration: programConfiguration,
            paintVertexArray: new programConfiguration.PaintVertexArray()
        };
    }
    this.segments = [];
    this.segments2 = [];
};
ArrayGroup.prototype.prepareSegment = function prepareSegment(numVertices) {
    var segment = this.segments[this.segments.length - 1];
    if (!segment || segment.vertexLength + numVertices > ArrayGroup.MAX_VERTEX_ARRAY_LENGTH) {
        segment = new Segment(this.layoutVertexArray.length, this.elementArray.length);
        this.segments.push(segment);
    }
    return segment;
};
ArrayGroup.prototype.prepareSegment2 = function prepareSegment2(numVertices) {
    var segment = this.segments2[this.segments2.length - 1];
    if (!segment || segment.vertexLength + numVertices > ArrayGroup.MAX_VERTEX_ARRAY_LENGTH) {
        segment = new Segment(this.layoutVertexArray.length, this.elementArray2.length);
        this.segments2.push(segment);
    }
    return segment;
};
ArrayGroup.prototype.populatePaintArrays = function populatePaintArrays(featureProperties) {
    var this$1 = this;
    for (var key in this.layerData) {
        var layerData = this$1.layerData[key];
        if (layerData.paintVertexArray.bytesPerElement === 0)
            continue;
        layerData.programConfiguration.populatePaintArray(layerData.layer, layerData.paintVertexArray, this$1.layoutVertexArray.length, this$1.globalProperties, featureProperties);
    }
};
ArrayGroup.prototype.isEmpty = function isEmpty() {
    return this.layoutVertexArray.length === 0;
};
ArrayGroup.prototype.serialize = function serialize(transferables) {
    return {
        layoutVertexArray: this.layoutVertexArray.serialize(transferables),
        elementArray: this.elementArray && this.elementArray.serialize(transferables),
        elementArray2: this.elementArray2 && this.elementArray2.serialize(transferables),
        paintVertexArrays: serializePaintVertexArrays(this.layerData, transferables),
        segments: this.segments,
        segments2: this.segments2
    };
};
function serializePaintVertexArrays(layerData, transferables) {
    var paintVertexArrays = {};
    for (var layerId in layerData) {
        var inputArray = layerData[layerId].paintVertexArray;
        if (inputArray.length === 0)
            continue;
        var array = inputArray.serialize(transferables);
        var type = inputArray.constructor.serialize();
        paintVertexArrays[layerId] = {
            array: array,
            type: type
        };
    }
    return paintVertexArrays;
}
ArrayGroup.MAX_VERTEX_ARRAY_LENGTH = Math.pow(2, 16) - 1;
module.exports = ArrayGroup;
},{"./program_configuration":85}],72:[function(require,module,exports){
'use strict';
var ArrayGroup = require('./array_group');
var BufferGroup = require('./buffer_group');
var util = require('../util/util');
var Bucket = function Bucket(options, programInterface) {
    this.zoom = options.zoom;
    this.overscaling = options.overscaling;
    this.layers = options.layers;
    this.index = options.index;
    if (options.arrays) {
        this.buffers = new BufferGroup(programInterface, options.layers, options.zoom, options.arrays);
    } else {
        this.arrays = new ArrayGroup(programInterface, options.layers, options.zoom);
    }
};
Bucket.prototype.populate = function populate(features, options) {
    var this$1 = this;
    for (var i = 0, list = features; i < list.length; i += 1) {
        var feature = list[i];
        if (this$1.layers[0].filter(feature)) {
            this$1.addFeature(feature);
            options.featureIndex.insert(feature, this$1.index);
        }
    }
};
Bucket.prototype.isEmpty = function isEmpty() {
    return this.arrays.isEmpty();
};
Bucket.prototype.serialize = function serialize(transferables) {
    return {
        zoom: this.zoom,
        layerIds: this.layers.map(function (l) {
            return l.id;
        }),
        arrays: this.arrays.serialize(transferables)
    };
};
Bucket.prototype.destroy = function destroy() {
    if (this.buffers) {
        this.buffers.destroy();
        this.buffers = null;
    }
};
module.exports = Bucket;
Bucket.deserialize = function (input, style) {
    if (!style)
        return;
    var output = {};
    for (var i = 0, list = input; i < list.length; i += 1) {
        var serialized = list[i];
        var layers = serialized.layerIds.map(function (id) {
            return style.getLayer(id);
        }).filter(Boolean);
        if (layers.length === 0) {
            continue;
        }
        var bucket = layers[0].createBucket(util.extend({ layers: layers }, serialized));
        for (var i$1 = 0, list$1 = layers; i$1 < list$1.length; i$1 += 1) {
            var layer = list$1[i$1];
            output[layer.id] = bucket;
        }
    }
    return output;
};
},{"../util/util":197,"./array_group":71,"./buffer_group":79}],73:[function(require,module,exports){
'use strict';
var Bucket = require('../bucket');
var createVertexArrayType = require('../vertex_array_type');
var createElementArrayType = require('../element_array_type');
var loadGeometry = require('../load_geometry');
var EXTENT = require('../extent');
var circleInterface = {
    layoutVertexArrayType: createVertexArrayType([{
            name: 'a_pos',
            components: 2,
            type: 'Int16'
        }]),
    elementArrayType: createElementArrayType(),
    paintAttributes: [
        {
            property: 'circle-color',
            type: 'Uint8'
        },
        {
            property: 'circle-radius',
            type: 'Uint16',
            multiplier: 10
        },
        {
            property: 'circle-blur',
            type: 'Uint16',
            multiplier: 10
        },
        {
            property: 'circle-opacity',
            type: 'Uint8',
            multiplier: 255
        },
        {
            property: 'circle-stroke-color',
            type: 'Uint8'
        },
        {
            property: 'circle-stroke-width',
            type: 'Uint16',
            multiplier: 10
        },
        {
            property: 'circle-stroke-opacity',
            type: 'Uint8',
            multiplier: 255
        }
    ]
};
function addCircleVertex(layoutVertexArray, x, y, extrudeX, extrudeY) {
    layoutVertexArray.emplaceBack(x * 2 + (extrudeX + 1) / 2, y * 2 + (extrudeY + 1) / 2);
}
var CircleBucket = function (Bucket) {
    function CircleBucket(options) {
        Bucket.call(this, options, circleInterface);
    }
    if (Bucket)
        CircleBucket.__proto__ = Bucket;
    CircleBucket.prototype = Object.create(Bucket && Bucket.prototype);
    CircleBucket.prototype.constructor = CircleBucket;
    CircleBucket.prototype.addFeature = function addFeature(feature) {
        var arrays = this.arrays;
        for (var i = 0, list = loadGeometry(feature); i < list.length; i += 1) {
            var ring = list[i];
            for (var i$1 = 0, list$1 = ring; i$1 < list$1.length; i$1 += 1) {
                var point = list$1[i$1];
                var x = point.x;
                var y = point.y;
                if (x < 0 || x >= EXTENT || y < 0 || y >= EXTENT)
                    continue;
                var segment = arrays.prepareSegment(4);
                var index = segment.vertexLength;
                addCircleVertex(arrays.layoutVertexArray, x, y, -1, -1);
                addCircleVertex(arrays.layoutVertexArray, x, y, 1, -1);
                addCircleVertex(arrays.layoutVertexArray, x, y, 1, 1);
                addCircleVertex(arrays.layoutVertexArray, x, y, -1, 1);
                arrays.elementArray.emplaceBack(index, index + 1, index + 2);
                arrays.elementArray.emplaceBack(index, index + 3, index + 2);
                segment.vertexLength += 4;
                segment.primitiveLength += 2;
            }
        }
        arrays.populatePaintArrays(feature.properties);
    };
    return CircleBucket;
}(Bucket);
module.exports = CircleBucket;
},{"../bucket":72,"../element_array_type":80,"../extent":81,"../load_geometry":83,"../vertex_array_type":87}],74:[function(require,module,exports){
'use strict';
var Bucket = require('../bucket');
var createVertexArrayType = require('../vertex_array_type');
var createElementArrayType = require('../element_array_type');
var loadGeometry = require('../load_geometry');
var earcut = require('earcut');
var classifyRings = require('../../util/classify_rings');
var EARCUT_MAX_RINGS = 500;
var fillInterface = {
    layoutVertexArrayType: createVertexArrayType([{
            name: 'a_pos',
            components: 2,
            type: 'Int16'
        }]),
    elementArrayType: createElementArrayType(3),
    elementArrayType2: createElementArrayType(2),
    paintAttributes: [
        {
            property: 'fill-color',
            type: 'Uint8'
        },
        {
            property: 'fill-outline-color',
            type: 'Uint8'
        },
        {
            property: 'fill-opacity',
            type: 'Uint8',
            multiplier: 255
        }
    ]
};
var FillBucket = function (Bucket) {
    function FillBucket(options) {
        Bucket.call(this, options, fillInterface);
    }
    if (Bucket)
        FillBucket.__proto__ = Bucket;
    FillBucket.prototype = Object.create(Bucket && Bucket.prototype);
    FillBucket.prototype.constructor = FillBucket;
    FillBucket.prototype.addFeature = function addFeature(feature) {
        var arrays = this.arrays;
        for (var i$2 = 0, list = classifyRings(loadGeometry(feature), EARCUT_MAX_RINGS); i$2 < list.length; i$2 += 1) {
            var polygon = list[i$2];
            var numVertices = 0;
            for (var i$3 = 0, list$1 = polygon; i$3 < list$1.length; i$3 += 1) {
                var ring = list$1[i$3];
                numVertices += ring.length;
            }
            var triangleSegment = arrays.prepareSegment(numVertices);
            var triangleIndex = triangleSegment.vertexLength;
            var flattened = [];
            var holeIndices = [];
            for (var i$4 = 0, list$2 = polygon; i$4 < list$2.length; i$4 += 1) {
                var ring$1 = list$2[i$4];
                if (ring$1.length === 0) {
                    continue;
                }
                if (ring$1 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }
                var lineSegment = arrays.prepareSegment2(ring$1.length);
                var lineIndex = lineSegment.vertexLength;
                arrays.layoutVertexArray.emplaceBack(ring$1[0].x, ring$1[0].y);
                arrays.elementArray2.emplaceBack(lineIndex + ring$1.length - 1, lineIndex);
                flattened.push(ring$1[0].x);
                flattened.push(ring$1[0].y);
                for (var i = 1; i < ring$1.length; i++) {
                    arrays.layoutVertexArray.emplaceBack(ring$1[i].x, ring$1[i].y);
                    arrays.elementArray2.emplaceBack(lineIndex + i - 1, lineIndex + i);
                    flattened.push(ring$1[i].x);
                    flattened.push(ring$1[i].y);
                }
                lineSegment.vertexLength += ring$1.length;
                lineSegment.primitiveLength += ring$1.length;
            }
            var indices = earcut(flattened, holeIndices);
            for (var i$1 = 0; i$1 < indices.length; i$1 += 3) {
                arrays.elementArray.emplaceBack(triangleIndex + indices[i$1], triangleIndex + indices[i$1 + 1], triangleIndex + indices[i$1 + 2]);
            }
            triangleSegment.vertexLength += numVertices;
            triangleSegment.primitiveLength += indices.length / 3;
        }
        arrays.populatePaintArrays(feature.properties);
    };
    return FillBucket;
}(Bucket);
module.exports = FillBucket;
},{"../../util/classify_rings":181,"../bucket":72,"../element_array_type":80,"../load_geometry":83,"../vertex_array_type":87,"earcut":13}],75:[function(require,module,exports){
'use strict';
var Bucket = require('../bucket');
var createVertexArrayType = require('../vertex_array_type');
var createElementArrayType = require('../element_array_type');
var loadGeometry = require('../load_geometry');
var EXTENT = require('../extent');
var earcut = require('earcut');
var classifyRings = require('../../util/classify_rings');
var EARCUT_MAX_RINGS = 500;
var fillExtrusionInterface = {
    layoutVertexArrayType: createVertexArrayType([
        {
            name: 'a_pos',
            components: 2,
            type: 'Int16'
        },
        {
            name: 'a_normal',
            components: 3,
            type: 'Int16'
        },
        {
            name: 'a_edgedistance',
            components: 1,
            type: 'Int16'
        }
    ]),
    elementArrayType: createElementArrayType(3),
    paintAttributes: [
        {
            property: 'fill-extrusion-base',
            type: 'Uint16'
        },
        {
            property: 'fill-extrusion-height',
            type: 'Uint16'
        },
        {
            property: 'fill-extrusion-color',
            type: 'Uint8'
        }
    ]
};
var FACTOR = Math.pow(2, 13);
function addVertex(vertexArray, x, y, nx, ny, nz, t, e) {
    vertexArray.emplaceBack(x, y, Math.floor(nx * FACTOR) * 2 + t, ny * FACTOR * 2, nz * FACTOR * 2, Math.round(e));
}
var FillExtrusionBucket = function (Bucket) {
    function FillExtrusionBucket(options) {
        Bucket.call(this, options, fillExtrusionInterface);
    }
    if (Bucket)
        FillExtrusionBucket.__proto__ = Bucket;
    FillExtrusionBucket.prototype = Object.create(Bucket && Bucket.prototype);
    FillExtrusionBucket.prototype.constructor = FillExtrusionBucket;
    FillExtrusionBucket.prototype.addFeature = function addFeature(feature) {
        var arrays = this.arrays;
        for (var i = 0, list = classifyRings(loadGeometry(feature), EARCUT_MAX_RINGS); i < list.length; i += 1) {
            var polygon = list[i];
            var numVertices = 0;
            for (var i$1 = 0, list$1 = polygon; i$1 < list$1.length; i$1 += 1) {
                var ring = list$1[i$1];
                numVertices += ring.length;
            }
            var segment = arrays.prepareSegment(numVertices * 5);
            var flattened = [];
            var holeIndices = [];
            var indices = [];
            for (var i$2 = 0, list$2 = polygon; i$2 < list$2.length; i$2 += 1) {
                var ring$1 = list$2[i$2];
                if (ring$1.length === 0) {
                    continue;
                }
                if (ring$1 !== polygon[0]) {
                    holeIndices.push(flattened.length / 2);
                }
                var edgeDistance = 0;
                for (var p = 0; p < ring$1.length; p++) {
                    var p1 = ring$1[p];
                    addVertex(arrays.layoutVertexArray, p1.x, p1.y, 0, 0, 1, 1, 0);
                    indices.push(segment.vertexLength++);
                    if (p >= 1) {
                        var p2 = ring$1[p - 1];
                        if (!isBoundaryEdge(p1, p2)) {
                            var perp = p1.sub(p2)._perp()._unit();
                            addVertex(arrays.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 0, edgeDistance);
                            addVertex(arrays.layoutVertexArray, p1.x, p1.y, perp.x, perp.y, 0, 1, edgeDistance);
                            edgeDistance += p2.dist(p1);
                            addVertex(arrays.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 0, edgeDistance);
                            addVertex(arrays.layoutVertexArray, p2.x, p2.y, perp.x, perp.y, 0, 1, edgeDistance);
                            var bottomRight = segment.vertexLength;
                            arrays.elementArray.emplaceBack(bottomRight, bottomRight + 1, bottomRight + 2);
                            arrays.elementArray.emplaceBack(bottomRight + 1, bottomRight + 2, bottomRight + 3);
                            segment.vertexLength += 4;
                            segment.primitiveLength += 2;
                        }
                    }
                    flattened.push(p1.x);
                    flattened.push(p1.y);
                }
            }
            var triangleIndices = earcut(flattened, holeIndices);
            for (var j = 0; j < triangleIndices.length; j += 3) {
                arrays.elementArray.emplaceBack(indices[triangleIndices[j]], indices[triangleIndices[j + 1]], indices[triangleIndices[j + 2]]);
            }
            segment.primitiveLength += triangleIndices.length / 3;
        }
        arrays.populatePaintArrays(feature.properties);
    };
    return FillExtrusionBucket;
}(Bucket);
module.exports = FillExtrusionBucket;
function isBoundaryEdge(p1, p2) {
    return p1.x === p2.x && (p1.x < 0 || p1.x > EXTENT) || p1.y === p2.y && (p1.y < 0 || p1.y > EXTENT);
}
},{"../../util/classify_rings":181,"../bucket":72,"../element_array_type":80,"../extent":81,"../load_geometry":83,"../vertex_array_type":87,"earcut":13}],76:[function(require,module,exports){
'use strict';
var Bucket = require('../bucket');
var createVertexArrayType = require('../vertex_array_type');
var createElementArrayType = require('../element_array_type');
var loadGeometry = require('../load_geometry');
var EXTENT = require('../extent');
var EXTRUDE_SCALE = 63;
var COS_HALF_SHARP_CORNER = Math.cos(75 / 2 * (Math.PI / 180));
var SHARP_CORNER_OFFSET = 15;
var LINE_DISTANCE_BUFFER_BITS = 15;
var LINE_DISTANCE_SCALE = 1 / 2;
var MAX_LINE_DISTANCE = Math.pow(2, LINE_DISTANCE_BUFFER_BITS - 1) / LINE_DISTANCE_SCALE;
var lineInterface = {
    layoutVertexArrayType: createVertexArrayType([
        {
            name: 'a_pos',
            components: 2,
            type: 'Int16'
        },
        {
            name: 'a_data',
            components: 4,
            type: 'Uint8'
        }
    ]),
    paintAttributes: [
        {
            property: 'line-color',
            type: 'Uint8'
        },
        {
            property: 'line-blur',
            multiplier: 10,
            type: 'Uint8'
        },
        {
            property: 'line-opacity',
            multiplier: 10,
            type: 'Uint8'
        },
        {
            property: 'line-gap-width',
            multiplier: 10,
            type: 'Uint8',
            name: 'a_gapwidth'
        },
        {
            property: 'line-offset',
            multiplier: 1,
            type: 'Int8'
        }
    ],
    elementArrayType: createElementArrayType()
};
function addLineVertex(layoutVertexBuffer, point, extrude, tx, ty, dir, linesofar) {
    layoutVertexBuffer.emplaceBack(point.x << 1 | tx, point.y << 1 | ty, Math.round(EXTRUDE_SCALE * extrude.x) + 128, Math.round(EXTRUDE_SCALE * extrude.y) + 128, (dir === 0 ? 0 : dir < 0 ? -1 : 1) + 1 | (linesofar * LINE_DISTANCE_SCALE & 63) << 2, linesofar * LINE_DISTANCE_SCALE >> 6);
}
var LineBucket = function (Bucket) {
    function LineBucket(options) {
        Bucket.call(this, options, lineInterface);
    }
    if (Bucket)
        LineBucket.__proto__ = Bucket;
    LineBucket.prototype = Object.create(Bucket && Bucket.prototype);
    LineBucket.prototype.constructor = LineBucket;
    LineBucket.prototype.addFeature = function addFeature(feature) {
        var this$1 = this;
        var layout = this.layers[0].layout;
        var join = layout['line-join'];
        var cap = layout['line-cap'];
        var miterLimit = layout['line-miter-limit'];
        var roundLimit = layout['line-round-limit'];
        for (var i = 0, list = loadGeometry(feature, LINE_DISTANCE_BUFFER_BITS); i < list.length; i += 1) {
            var line = list[i];
            this$1.addLine(line, feature.properties, join, cap, miterLimit, roundLimit);
        }
    };
    LineBucket.prototype.addLine = function addLine(vertices, featureProperties, join, cap, miterLimit, roundLimit) {
        var this$1 = this;
        var len = vertices.length;
        while (len > 2 && vertices[len - 1].equals(vertices[len - 2])) {
            len--;
        }
        if (vertices.length < 2)
            return;
        if (join === 'bevel')
            miterLimit = 1.05;
        var sharpCornerOffset = SHARP_CORNER_OFFSET * (EXTENT / (512 * this.overscaling));
        var firstVertex = vertices[0], lastVertex = vertices[len - 1], closed = firstVertex.equals(lastVertex);
        var arrays = this.arrays;
        var segment = arrays.prepareSegment(len * 10);
        if (len === 2 && closed)
            return;
        this.distance = 0;
        var beginCap = cap, endCap = closed ? 'butt' : cap;
        var startOfLine = true;
        var currentVertex, prevVertex, nextVertex, prevNormal, nextNormal, offsetA, offsetB;
        this.e1 = this.e2 = this.e3 = -1;
        if (closed) {
            currentVertex = vertices[len - 2];
            nextNormal = firstVertex.sub(currentVertex)._unit()._perp();
        }
        for (var i = 0; i < len; i++) {
            nextVertex = closed && i === len - 1 ? vertices[1] : vertices[i + 1];
            if (nextVertex && vertices[i].equals(nextVertex))
                continue;
            if (nextNormal)
                prevNormal = nextNormal;
            if (currentVertex)
                prevVertex = currentVertex;
            currentVertex = vertices[i];
            nextNormal = nextVertex ? nextVertex.sub(currentVertex)._unit()._perp() : prevNormal;
            prevNormal = prevNormal || nextNormal;
            var joinNormal = prevNormal.add(nextNormal)._unit();
            var cosHalfAngle = joinNormal.x * nextNormal.x + joinNormal.y * nextNormal.y;
            var miterLength = 1 / cosHalfAngle;
            var isSharpCorner = cosHalfAngle < COS_HALF_SHARP_CORNER && prevVertex && nextVertex;
            if (isSharpCorner && i > 0) {
                var prevSegmentLength = currentVertex.dist(prevVertex);
                if (prevSegmentLength > 2 * sharpCornerOffset) {
                    var newPrevVertex = currentVertex.sub(currentVertex.sub(prevVertex)._mult(sharpCornerOffset / prevSegmentLength)._round());
                    this$1.distance += newPrevVertex.dist(prevVertex);
                    this$1.addCurrentVertex(newPrevVertex, this$1.distance, prevNormal.mult(1), 0, 0, false, segment);
                    prevVertex = newPrevVertex;
                }
            }
            var middleVertex = prevVertex && nextVertex;
            var currentJoin = middleVertex ? join : nextVertex ? beginCap : endCap;
            if (middleVertex && currentJoin === 'round') {
                if (miterLength < roundLimit) {
                    currentJoin = 'miter';
                } else if (miterLength <= 2) {
                    currentJoin = 'fakeround';
                }
            }
            if (currentJoin === 'miter' && miterLength > miterLimit) {
                currentJoin = 'bevel';
            }
            if (currentJoin === 'bevel') {
                if (miterLength > 2)
                    currentJoin = 'flipbevel';
                if (miterLength < miterLimit)
                    currentJoin = 'miter';
            }
            if (prevVertex)
                this$1.distance += currentVertex.dist(prevVertex);
            if (currentJoin === 'miter') {
                joinNormal._mult(miterLength);
                this$1.addCurrentVertex(currentVertex, this$1.distance, joinNormal, 0, 0, false, segment);
            } else if (currentJoin === 'flipbevel') {
                if (miterLength > 100) {
                    joinNormal = nextNormal.clone();
                } else {
                    var direction = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0 ? -1 : 1;
                    var bevelLength = miterLength * prevNormal.add(nextNormal).mag() / prevNormal.sub(nextNormal).mag();
                    joinNormal._perp()._mult(bevelLength * direction);
                }
                this$1.addCurrentVertex(currentVertex, this$1.distance, joinNormal, 0, 0, false, segment);
                this$1.addCurrentVertex(currentVertex, this$1.distance, joinNormal.mult(-1), 0, 0, false, segment);
            } else if (currentJoin === 'bevel' || currentJoin === 'fakeround') {
                var lineTurnsLeft = prevNormal.x * nextNormal.y - prevNormal.y * nextNormal.x > 0;
                var offset = -Math.sqrt(miterLength * miterLength - 1);
                if (lineTurnsLeft) {
                    offsetB = 0;
                    offsetA = offset;
                } else {
                    offsetA = 0;
                    offsetB = offset;
                }
                if (!startOfLine) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, prevNormal, offsetA, offsetB, false, segment);
                }
                if (currentJoin === 'fakeround') {
                    var n = Math.floor((0.5 - (cosHalfAngle - 0.5)) * 8);
                    var approxFractionalJoinNormal;
                    for (var m = 0; m < n; m++) {
                        approxFractionalJoinNormal = nextNormal.mult((m + 1) / (n + 1))._add(prevNormal)._unit();
                        this$1.addPieSliceVertex(currentVertex, this$1.distance, approxFractionalJoinNormal, lineTurnsLeft, segment);
                    }
                    this$1.addPieSliceVertex(currentVertex, this$1.distance, joinNormal, lineTurnsLeft, segment);
                    for (var k = n - 1; k >= 0; k--) {
                        approxFractionalJoinNormal = prevNormal.mult((k + 1) / (n + 1))._add(nextNormal)._unit();
                        this$1.addPieSliceVertex(currentVertex, this$1.distance, approxFractionalJoinNormal, lineTurnsLeft, segment);
                    }
                }
                if (nextVertex) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, nextNormal, -offsetA, -offsetB, false, segment);
                }
            } else if (currentJoin === 'butt') {
                if (!startOfLine) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, prevNormal, 0, 0, false, segment);
                }
                if (nextVertex) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, nextNormal, 0, 0, false, segment);
                }
            } else if (currentJoin === 'square') {
                if (!startOfLine) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, prevNormal, 1, 1, false, segment);
                    this$1.e1 = this$1.e2 = -1;
                }
                if (nextVertex) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, nextNormal, -1, -1, false, segment);
                }
            } else if (currentJoin === 'round') {
                if (!startOfLine) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, prevNormal, 0, 0, false, segment);
                    this$1.addCurrentVertex(currentVertex, this$1.distance, prevNormal, 1, 1, true, segment);
                    this$1.e1 = this$1.e2 = -1;
                }
                if (nextVertex) {
                    this$1.addCurrentVertex(currentVertex, this$1.distance, nextNormal, -1, -1, true, segment);
                    this$1.addCurrentVertex(currentVertex, this$1.distance, nextNormal, 0, 0, false, segment);
                }
            }
            if (isSharpCorner && i < len - 1) {
                var nextSegmentLength = currentVertex.dist(nextVertex);
                if (nextSegmentLength > 2 * sharpCornerOffset) {
                    var newCurrentVertex = currentVertex.add(nextVertex.sub(currentVertex)._mult(sharpCornerOffset / nextSegmentLength)._round());
                    this$1.distance += newCurrentVertex.dist(currentVertex);
                    this$1.addCurrentVertex(newCurrentVertex, this$1.distance, nextNormal.mult(1), 0, 0, false, segment);
                    currentVertex = newCurrentVertex;
                }
            }
            startOfLine = false;
        }
        arrays.populatePaintArrays(featureProperties);
    };
    LineBucket.prototype.addCurrentVertex = function addCurrentVertex(currentVertex, distance, normal, endLeft, endRight, round, segment) {
        var tx = round ? 1 : 0;
        var extrude;
        var arrays = this.arrays;
        var layoutVertexArray = arrays.layoutVertexArray;
        var elementArray = arrays.elementArray;
        extrude = normal.clone();
        if (endLeft)
            extrude._sub(normal.perp()._mult(endLeft));
        addLineVertex(layoutVertexArray, currentVertex, extrude, tx, 0, endLeft, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            elementArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;
        extrude = normal.mult(-1);
        if (endRight)
            extrude._sub(normal.perp()._mult(endRight));
        addLineVertex(layoutVertexArray, currentVertex, extrude, tx, 1, -endRight, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            elementArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        this.e1 = this.e2;
        this.e2 = this.e3;
        if (distance > MAX_LINE_DISTANCE / 2) {
            this.distance = 0;
            this.addCurrentVertex(currentVertex, this.distance, normal, endLeft, endRight, round, segment);
        }
    };
    LineBucket.prototype.addPieSliceVertex = function addPieSliceVertex(currentVertex, distance, extrude, lineTurnsLeft, segment) {
        var ty = lineTurnsLeft ? 1 : 0;
        extrude = extrude.mult(lineTurnsLeft ? -1 : 1);
        var arrays = this.arrays;
        var layoutVertexArray = arrays.layoutVertexArray;
        var elementArray = arrays.elementArray;
        addLineVertex(layoutVertexArray, currentVertex, extrude, 0, ty, 0, distance);
        this.e3 = segment.vertexLength++;
        if (this.e1 >= 0 && this.e2 >= 0) {
            elementArray.emplaceBack(this.e1, this.e2, this.e3);
            segment.primitiveLength++;
        }
        if (lineTurnsLeft) {
            this.e2 = this.e3;
        } else {
            this.e1 = this.e3;
        }
    };
    return LineBucket;
}(Bucket);
module.exports = LineBucket;
},{"../bucket":72,"../element_array_type":80,"../extent":81,"../load_geometry":83,"../vertex_array_type":87}],77:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var ArrayGroup = require('../array_group');
var BufferGroup = require('../buffer_group');
var createVertexArrayType = require('../vertex_array_type');
var createElementArrayType = require('../element_array_type');
var EXTENT = require('../extent');
var Anchor = require('../../symbol/anchor');
var getAnchors = require('../../symbol/get_anchors');
var resolveTokens = require('../../util/token');
var Quads = require('../../symbol/quads');
var Shaping = require('../../symbol/shaping');
var resolveText = require('../../symbol/resolve_text');
var mergeLines = require('../../symbol/mergelines');
var clipLine = require('../../symbol/clip_line');
var util = require('../../util/util');
var scriptDetection = require('../../util/script_detection');
var loadGeometry = require('../load_geometry');
var CollisionFeature = require('../../symbol/collision_feature');
var findPoleOfInaccessibility = require('../../util/find_pole_of_inaccessibility');
var classifyRings = require('../../util/classify_rings');
var VectorTileFeature = require('vector-tile').VectorTileFeature;
var shapeText = Shaping.shapeText;
var shapeIcon = Shaping.shapeIcon;
var WritingMode = Shaping.WritingMode;
var getGlyphQuads = Quads.getGlyphQuads;
var getIconQuads = Quads.getIconQuads;
var elementArrayType = createElementArrayType();
var layoutVertexArrayType = createVertexArrayType([
    {
        name: 'a_pos',
        components: 2,
        type: 'Int16'
    },
    {
        name: 'a_offset',
        components: 2,
        type: 'Int16'
    },
    {
        name: 'a_texture_pos',
        components: 2,
        type: 'Uint16'
    },
    {
        name: 'a_data',
        components: 4,
        type: 'Uint8'
    }
]);
var symbolInterfaces = {
    glyph: {
        layoutVertexArrayType: layoutVertexArrayType,
        elementArrayType: elementArrayType
    },
    icon: {
        layoutVertexArrayType: layoutVertexArrayType,
        elementArrayType: elementArrayType
    },
    collisionBox: {
        layoutVertexArrayType: createVertexArrayType([
            {
                name: 'a_pos',
                components: 2,
                type: 'Int16'
            },
            {
                name: 'a_extrude',
                components: 2,
                type: 'Int16'
            },
            {
                name: 'a_data',
                components: 2,
                type: 'Uint8'
            }
        ]),
        elementArrayType: createElementArrayType(2)
    }
};
function addVertex(array, x, y, ox, oy, tx, ty, minzoom, maxzoom, labelminzoom, labelangle) {
    array.emplaceBack(x, y, Math.round(ox * 64), Math.round(oy * 64), tx / 4, ty / 4, (labelminzoom || 0) * 10, labelangle, (minzoom || 0) * 10, Math.min(maxzoom || 25, 25) * 10);
}
function addCollisionBoxVertex(layoutVertexArray, point, extrude, maxZoom, placementZoom) {
    return layoutVertexArray.emplaceBack(point.x, point.y, Math.round(extrude.x), Math.round(extrude.y), maxZoom * 10, placementZoom * 10);
}
var SymbolBucket = function SymbolBucket(options) {
    var this$1 = this;
    this.collisionBoxArray = options.collisionBoxArray;
    this.symbolQuadsArray = options.symbolQuadsArray;
    this.symbolInstancesArray = options.symbolInstancesArray;
    this.zoom = options.zoom;
    this.overscaling = options.overscaling;
    this.layers = options.layers;
    this.index = options.index;
    this.sdfIcons = options.sdfIcons;
    this.iconsNeedLinear = options.iconsNeedLinear;
    this.adjustedTextSize = options.adjustedTextSize;
    this.adjustedIconSize = options.adjustedIconSize;
    this.fontstack = options.fontstack;
    if (options.arrays) {
        this.buffers = {};
        for (var id in options.arrays) {
            if (options.arrays[id]) {
                this$1.buffers[id] = new BufferGroup(symbolInterfaces[id], options.layers, options.zoom, options.arrays[id]);
            }
        }
    }
};
SymbolBucket.prototype.populate = function populate(features, options) {
    var this$1 = this;
    var layout = this.layers[0].layout;
    var textField = layout['text-field'];
    var textFont = layout['text-font'];
    var iconImage = layout['icon-image'];
    var hasText = textField && textFont;
    var hasIcon = iconImage;
    this.features = [];
    if (!hasText && !hasIcon) {
        return;
    }
    var icons = options.iconDependencies;
    var stacks = options.glyphDependencies;
    var stack = stacks[textFont] = stacks[textFont] || {};
    for (var i = 0; i < features.length; i++) {
        var feature = features[i];
        if (!this$1.layers[0].filter(feature)) {
            continue;
        }
        var text;
        if (hasText) {
            text = resolveText(feature, layout);
        }
        var icon;
        if (hasIcon) {
            icon = resolveTokens(feature.properties, iconImage);
        }
        if (!text && !icon) {
            continue;
        }
        this$1.features.push({
            text: text,
            icon: icon,
            index: i,
            sourceLayerIndex: feature.sourceLayerIndex,
            geometry: loadGeometry(feature),
            properties: feature.properties,
            type: VectorTileFeature.types[feature.type]
        });
        if (icon) {
            icons[icon] = true;
        }
        if (text) {
            for (var i$1 = 0; i$1 < text.length; i$1++) {
                stack[text.charCodeAt(i$1)] = true;
            }
        }
    }
    if (layout['symbol-placement'] === 'line') {
        this.features = mergeLines(this.features);
    }
};
SymbolBucket.prototype.isEmpty = function isEmpty() {
    return this.arrays.icon.isEmpty() && this.arrays.glyph.isEmpty() && this.arrays.collisionBox.isEmpty();
};
SymbolBucket.prototype.serialize = function serialize(transferables) {
    return {
        zoom: this.zoom,
        layerIds: this.layers.map(function (l) {
            return l.id;
        }),
        sdfIcons: this.sdfIcons,
        iconsNeedLinear: this.iconsNeedLinear,
        adjustedTextSize: this.adjustedTextSize,
        adjustedIconSize: this.adjustedIconSize,
        fontstack: this.fontstack,
        arrays: util.mapObject(this.arrays, function (a) {
            return a.isEmpty() ? null : a.serialize(transferables);
        })
    };
};
SymbolBucket.prototype.destroy = function destroy() {
    if (this.buffers) {
        if (this.buffers.icon)
            this.buffers.icon.destroy();
        if (this.buffers.glyph)
            this.buffers.glyph.destroy();
        if (this.buffers.collisionBox)
            this.buffers.collisionBox.destroy();
        this.buffers = null;
    }
};
SymbolBucket.prototype.createArrays = function createArrays() {
    var this$1 = this;
    this.arrays = util.mapObject(symbolInterfaces, function (programInterface) {
        return new ArrayGroup(programInterface, this$1.layers, this$1.zoom);
    });
};
SymbolBucket.prototype.prepare = function prepare(stacks, icons) {
    var this$1 = this;
    this.createArrays();
    this.adjustedTextMaxSize = this.layers[0].getLayoutValue('text-size', { zoom: 18 });
    this.adjustedTextSize = this.layers[0].getLayoutValue('text-size', { zoom: this.zoom + 1 });
    this.adjustedIconMaxSize = this.layers[0].getLayoutValue('icon-size', { zoom: 18 });
    this.adjustedIconSize = this.layers[0].getLayoutValue('icon-size', { zoom: this.zoom + 1 });
    var tileSize = 512 * this.overscaling;
    this.tilePixelRatio = EXTENT / tileSize;
    this.compareText = {};
    this.iconsNeedLinear = false;
    this.symbolInstancesStartIndex = this.symbolInstancesArray.length;
    var layout = this.layers[0].layout;
    var horizontalAlign = 0.5, verticalAlign = 0.5;
    switch (layout['text-anchor']) {
    case 'right':
    case 'top-right':
    case 'bottom-right':
        horizontalAlign = 1;
        break;
    case 'left':
    case 'top-left':
    case 'bottom-left':
        horizontalAlign = 0;
        break;
    }
    switch (layout['text-anchor']) {
    case 'bottom':
    case 'bottom-right':
    case 'bottom-left':
        verticalAlign = 1;
        break;
    case 'top':
    case 'top-right':
    case 'top-left':
        verticalAlign = 0;
        break;
    }
    var justify = layout['text-justify'] === 'right' ? 1 : layout['text-justify'] === 'left' ? 0 : 0.5;
    var oneEm = 24;
    var lineHeight = layout['text-line-height'] * oneEm;
    var maxWidth = layout['symbol-placement'] !== 'line' ? layout['text-max-width'] * oneEm : 0;
    var spacing = layout['text-letter-spacing'] * oneEm;
    var textOffset = [
        layout['text-offset'][0] * oneEm,
        layout['text-offset'][1] * oneEm
    ];
    var fontstack = this.fontstack = layout['text-font'].join(',');
    var textAlongLine = layout['text-rotation-alignment'] === 'map' && layout['symbol-placement'] === 'line';
    for (var i = 0, list = this.features; i < list.length; i += 1) {
        var feature = list[i];
        var shapedTextOrientations;
        if (feature.text) {
            var allowsVerticalWritingMode = scriptDetection.allowsVerticalWritingMode(feature.text);
            shapedTextOrientations = {};
            shapedTextOrientations[WritingMode.horizontal] = shapeText(feature.text, stacks[fontstack], maxWidth, lineHeight, horizontalAlign, verticalAlign, justify, spacing, textOffset, oneEm, WritingMode.horizontal);
            shapedTextOrientations[WritingMode.vertical] = allowsVerticalWritingMode && textAlongLine && shapeText(feature.text, stacks[fontstack], maxWidth, lineHeight, horizontalAlign, verticalAlign, justify, spacing, textOffset, oneEm, WritingMode.vertical);
        } else {
            shapedTextOrientations = {};
        }
        var shapedIcon;
        if (feature.icon) {
            var image = icons[feature.icon];
            var iconOffset = this$1.layers[0].getLayoutValue('icon-offset', { zoom: this$1.zoom }, feature.properties);
            shapedIcon = shapeIcon(image, iconOffset);
            if (image) {
                if (this$1.sdfIcons === undefined) {
                    this$1.sdfIcons = image.sdf;
                } else if (this$1.sdfIcons !== image.sdf) {
                    util.warnOnce('Style sheet warning: Cannot mix SDF and non-SDF icons in one buffer');
                }
                if (image.pixelRatio !== 1) {
                    this$1.iconsNeedLinear = true;
                } else if (layout['icon-rotate'] !== 0 || !this$1.layers[0].isLayoutValueFeatureConstant('icon-rotate')) {
                    this$1.iconsNeedLinear = true;
                }
            }
        }
        if (shapedTextOrientations[WritingMode.horizontal] || shapedIcon) {
            this$1.addFeature(feature, shapedTextOrientations, shapedIcon);
        }
    }
    this.symbolInstancesEndIndex = this.symbolInstancesArray.length;
};
SymbolBucket.prototype.addFeature = function addFeature(feature, shapedTextOrientations, shapedIcon) {
    var this$1 = this;
    var layout = this.layers[0].layout, glyphSize = 24, fontScale = this.adjustedTextSize / glyphSize, textMaxSize = this.adjustedTextMaxSize !== undefined ? this.adjustedTextMaxSize : this.adjustedTextSize, textBoxScale = this.tilePixelRatio * fontScale, textMaxBoxScale = this.tilePixelRatio * textMaxSize / glyphSize, iconBoxScale = this.tilePixelRatio * this.adjustedIconSize, symbolMinDistance = this.tilePixelRatio * layout['symbol-spacing'], avoidEdges = layout['symbol-avoid-edges'], textPadding = layout['text-padding'] * this.tilePixelRatio, iconPadding = layout['icon-padding'] * this.tilePixelRatio, textMaxAngle = layout['text-max-angle'] / 180 * Math.PI, textAlongLine = layout['text-rotation-alignment'] === 'map' && layout['symbol-placement'] === 'line', iconAlongLine = layout['icon-rotation-alignment'] === 'map' && layout['symbol-placement'] === 'line', mayOverlap = layout['text-allow-overlap'] || layout['icon-allow-overlap'] || layout['text-ignore-placement'] || layout['icon-ignore-placement'], symbolPlacement = layout['symbol-placement'], textRepeatDistance = symbolMinDistance / 2;
    var addSymbolInstance = function (line, anchor) {
        var inside = !(anchor.x < 0 || anchor.x > EXTENT || anchor.y < 0 || anchor.y > EXTENT);
        if (avoidEdges && !inside)
            return;
        var addToBuffers = inside || mayOverlap;
        this$1.addSymbolInstance(anchor, line, shapedTextOrientations, shapedIcon, this$1.layers[0], addToBuffers, this$1.symbolInstancesArray.length, this$1.collisionBoxArray, feature.index, feature.sourceLayerIndex, this$1.index, textBoxScale, textPadding, textAlongLine, iconBoxScale, iconPadding, iconAlongLine, { zoom: this$1.zoom }, feature.properties);
    };
    if (symbolPlacement === 'line') {
        for (var i = 0, list = clipLine(feature.geometry, 0, 0, EXTENT, EXTENT); i < list.length; i += 1) {
            var line = list[i];
            var anchors = getAnchors(line, symbolMinDistance, textMaxAngle, shapedTextOrientations[WritingMode.vertical] || shapedTextOrientations[WritingMode.horizontal], shapedIcon, glyphSize, textMaxBoxScale, this$1.overscaling, EXTENT);
            for (var i$1 = 0, list$1 = anchors; i$1 < list$1.length; i$1 += 1) {
                var anchor = list$1[i$1];
                var shapedText = shapedTextOrientations[WritingMode.horizontal];
                if (!shapedText || !this$1.anchorIsTooClose(shapedText.text, textRepeatDistance, anchor)) {
                    addSymbolInstance(line, anchor);
                }
            }
        }
    } else if (feature.type === 'Polygon') {
        for (var i$2 = 0, list$2 = classifyRings(feature.geometry, 0); i$2 < list$2.length; i$2 += 1) {
            var polygon = list$2[i$2];
            var poi = findPoleOfInaccessibility(polygon, 16);
            addSymbolInstance(polygon[0], new Anchor(poi.x, poi.y, 0));
        }
    } else if (feature.type === 'LineString') {
        for (var i$3 = 0, list$3 = feature.geometry; i$3 < list$3.length; i$3 += 1) {
            var line$1 = list$3[i$3];
            addSymbolInstance(line$1, new Anchor(line$1[0].x, line$1[0].y, 0));
        }
    } else if (feature.type === 'Point') {
        for (var i$4 = 0, list$4 = feature.geometry; i$4 < list$4.length; i$4 += 1) {
            var points = list$4[i$4];
            for (var i$5 = 0, list$5 = points; i$5 < list$5.length; i$5 += 1) {
                var point = list$5[i$5];
                addSymbolInstance([point], new Anchor(point.x, point.y, 0));
            }
        }
    }
};
SymbolBucket.prototype.anchorIsTooClose = function anchorIsTooClose(text, repeatDistance, anchor) {
    var compareText = this.compareText;
    if (!(text in compareText)) {
        compareText[text] = [];
    } else {
        var otherAnchors = compareText[text];
        for (var k = otherAnchors.length - 1; k >= 0; k--) {
            if (anchor.dist(otherAnchors[k]) < repeatDistance) {
                return true;
            }
        }
    }
    compareText[text].push(anchor);
    return false;
};
SymbolBucket.prototype.place = function place(collisionTile, showCollisionBoxes) {
    var this$1 = this;
    this.createArrays();
    var layout = this.layers[0].layout;
    var maxScale = collisionTile.maxScale;
    var textAlongLine = layout['text-rotation-alignment'] === 'map' && layout['symbol-placement'] === 'line';
    var iconAlongLine = layout['icon-rotation-alignment'] === 'map' && layout['symbol-placement'] === 'line';
    var mayOverlap = layout['text-allow-overlap'] || layout['icon-allow-overlap'] || layout['text-ignore-placement'] || layout['icon-ignore-placement'];
    if (mayOverlap) {
        var symbolInstancesStructTypeArray = this.symbolInstancesArray.toArray(this.symbolInstancesStartIndex, this.symbolInstancesEndIndex);
        var angle = collisionTile.angle;
        var sin = Math.sin(angle), cos = Math.cos(angle);
        this.sortedSymbolInstances = symbolInstancesStructTypeArray.sort(function (a, b) {
            var aRotated = sin * a.anchorPointX + cos * a.anchorPointY | 0;
            var bRotated = sin * b.anchorPointX + cos * b.anchorPointY | 0;
            return aRotated - bRotated || b.index - a.index;
        });
    }
    for (var p = this.symbolInstancesStartIndex; p < this.symbolInstancesEndIndex; p++) {
        var symbolInstance = this$1.sortedSymbolInstances ? this$1.sortedSymbolInstances[p - this$1.symbolInstancesStartIndex] : this$1.symbolInstancesArray.get(p);
        var textCollisionFeature = {
            boxStartIndex: symbolInstance.textBoxStartIndex,
            boxEndIndex: symbolInstance.textBoxEndIndex
        };
        var iconCollisionFeature = {
            boxStartIndex: symbolInstance.iconBoxStartIndex,
            boxEndIndex: symbolInstance.iconBoxEndIndex
        };
        var hasText = !(symbolInstance.textBoxStartIndex === symbolInstance.textBoxEndIndex);
        var hasIcon = !(symbolInstance.iconBoxStartIndex === symbolInstance.iconBoxEndIndex);
        var iconWithoutText = layout['text-optional'] || !hasText, textWithoutIcon = layout['icon-optional'] || !hasIcon;
        var glyphScale = hasText ? collisionTile.placeCollisionFeature(textCollisionFeature, layout['text-allow-overlap'], layout['symbol-avoid-edges']) : collisionTile.minScale;
        var iconScale = hasIcon ? collisionTile.placeCollisionFeature(iconCollisionFeature, layout['icon-allow-overlap'], layout['symbol-avoid-edges']) : collisionTile.minScale;
        if (!iconWithoutText && !textWithoutIcon) {
            iconScale = glyphScale = Math.max(iconScale, glyphScale);
        } else if (!textWithoutIcon && glyphScale) {
            glyphScale = Math.max(iconScale, glyphScale);
        } else if (!iconWithoutText && iconScale) {
            iconScale = Math.max(iconScale, glyphScale);
        }
        if (hasText) {
            collisionTile.insertCollisionFeature(textCollisionFeature, glyphScale, layout['text-ignore-placement']);
            if (glyphScale <= maxScale) {
                this$1.addSymbols(this$1.arrays.glyph, symbolInstance.glyphQuadStartIndex, symbolInstance.glyphQuadEndIndex, glyphScale, layout['text-keep-upright'], textAlongLine, collisionTile.angle, symbolInstance.writingModes);
            }
        }
        if (hasIcon) {
            collisionTile.insertCollisionFeature(iconCollisionFeature, iconScale, layout['icon-ignore-placement']);
            if (iconScale <= maxScale) {
                this$1.addSymbols(this$1.arrays.icon, symbolInstance.iconQuadStartIndex, symbolInstance.iconQuadEndIndex, iconScale, layout['icon-keep-upright'], iconAlongLine, collisionTile.angle);
            }
        }
    }
    if (showCollisionBoxes)
        this.addToDebugBuffers(collisionTile);
};
SymbolBucket.prototype.addSymbols = function addSymbols(arrays, quadsStart, quadsEnd, scale, keepUpright, alongLine, placementAngle, writingModes) {
    var this$1 = this;
    var elementArray = arrays.elementArray;
    var layoutVertexArray = arrays.layoutVertexArray;
    var zoom = this.zoom;
    var placementZoom = Math.max(Math.log(scale) / Math.LN2 + zoom, 0);
    for (var k = quadsStart; k < quadsEnd; k++) {
        var symbol = this$1.symbolQuadsArray.get(k).SymbolQuad;
        var a = (symbol.anchorAngle + placementAngle + Math.PI) % (Math.PI * 2);
        if (writingModes & WritingMode.vertical) {
            if (alongLine && symbol.writingMode === WritingMode.vertical) {
                if (keepUpright && alongLine && a <= Math.PI * 5 / 4 || a > Math.PI * 7 / 4)
                    continue;
            } else if (keepUpright && alongLine && a <= Math.PI * 3 / 4 || a > Math.PI * 5 / 4)
                continue;
        } else if (keepUpright && alongLine && (a <= Math.PI / 2 || a > Math.PI * 3 / 2))
            continue;
        var tl = symbol.tl, tr = symbol.tr, bl = symbol.bl, br = symbol.br, tex = symbol.tex, anchorPoint = symbol.anchorPoint;
        var minZoom = Math.max(zoom + Math.log(symbol.minScale) / Math.LN2, placementZoom);
        var maxZoom = Math.min(zoom + Math.log(symbol.maxScale) / Math.LN2, 25);
        if (maxZoom <= minZoom)
            continue;
        if (minZoom === placementZoom)
            minZoom = 0;
        var glyphAngle = Math.round(symbol.glyphAngle / (Math.PI * 2) * 256);
        var segment = arrays.prepareSegment(4);
        var index = segment.vertexLength;
        addVertex(layoutVertexArray, anchorPoint.x, anchorPoint.y, tl.x, tl.y, tex.x, tex.y, minZoom, maxZoom, placementZoom, glyphAngle);
        addVertex(layoutVertexArray, anchorPoint.x, anchorPoint.y, tr.x, tr.y, tex.x + tex.w, tex.y, minZoom, maxZoom, placementZoom, glyphAngle);
        addVertex(layoutVertexArray, anchorPoint.x, anchorPoint.y, bl.x, bl.y, tex.x, tex.y + tex.h, minZoom, maxZoom, placementZoom, glyphAngle);
        addVertex(layoutVertexArray, anchorPoint.x, anchorPoint.y, br.x, br.y, tex.x + tex.w, tex.y + tex.h, minZoom, maxZoom, placementZoom, glyphAngle);
        elementArray.emplaceBack(index, index + 1, index + 2);
        elementArray.emplaceBack(index + 1, index + 2, index + 3);
        segment.vertexLength += 4;
        segment.primitiveLength += 2;
    }
};
SymbolBucket.prototype.addToDebugBuffers = function addToDebugBuffers(collisionTile) {
    var this$1 = this;
    var arrays = this.arrays.collisionBox;
    var layoutVertexArray = arrays.layoutVertexArray;
    var elementArray = arrays.elementArray;
    var angle = -collisionTile.angle;
    var yStretch = collisionTile.yStretch;
    for (var j = this.symbolInstancesStartIndex; j < this.symbolInstancesEndIndex; j++) {
        var symbolInstance = this$1.symbolInstancesArray.get(j);
        symbolInstance.textCollisionFeature = {
            boxStartIndex: symbolInstance.textBoxStartIndex,
            boxEndIndex: symbolInstance.textBoxEndIndex
        };
        symbolInstance.iconCollisionFeature = {
            boxStartIndex: symbolInstance.iconBoxStartIndex,
            boxEndIndex: symbolInstance.iconBoxEndIndex
        };
        for (var i = 0; i < 2; i++) {
            var feature = symbolInstance[i === 0 ? 'textCollisionFeature' : 'iconCollisionFeature'];
            if (!feature)
                continue;
            for (var b = feature.boxStartIndex; b < feature.boxEndIndex; b++) {
                var box = this$1.collisionBoxArray.get(b);
                var anchorPoint = box.anchorPoint;
                var tl = new Point(box.x1, box.y1 * yStretch)._rotate(angle);
                var tr = new Point(box.x2, box.y1 * yStretch)._rotate(angle);
                var bl = new Point(box.x1, box.y2 * yStretch)._rotate(angle);
                var br = new Point(box.x2, box.y2 * yStretch)._rotate(angle);
                var maxZoom = Math.max(0, Math.min(25, this$1.zoom + Math.log(box.maxScale) / Math.LN2));
                var placementZoom = Math.max(0, Math.min(25, this$1.zoom + Math.log(box.placementScale) / Math.LN2));
                var segment = arrays.prepareSegment(4);
                var index = segment.vertexLength;
                addCollisionBoxVertex(layoutVertexArray, anchorPoint, tl, maxZoom, placementZoom);
                addCollisionBoxVertex(layoutVertexArray, anchorPoint, tr, maxZoom, placementZoom);
                addCollisionBoxVertex(layoutVertexArray, anchorPoint, br, maxZoom, placementZoom);
                addCollisionBoxVertex(layoutVertexArray, anchorPoint, bl, maxZoom, placementZoom);
                elementArray.emplaceBack(index, index + 1);
                elementArray.emplaceBack(index + 1, index + 2);
                elementArray.emplaceBack(index + 2, index + 3);
                elementArray.emplaceBack(index + 3, index);
                segment.vertexLength += 4;
                segment.primitiveLength += 4;
            }
        }
    }
};
SymbolBucket.prototype.addSymbolInstance = function addSymbolInstance(anchor, line, shapedTextOrientations, shapedIcon, layer, addToBuffers, index, collisionBoxArray, featureIndex, sourceLayerIndex, bucketIndex, textBoxScale, textPadding, textAlongLine, iconBoxScale, iconPadding, iconAlongLine, globalProperties, featureProperties) {
    var this$1 = this;
    var textCollisionFeature, iconCollisionFeature, iconQuads;
    var glyphQuads = [];
    for (var writingModeString in shapedTextOrientations) {
        var writingMode = parseInt(writingModeString, 10);
        if (!shapedTextOrientations[writingMode])
            continue;
        glyphQuads = glyphQuads.concat(addToBuffers ? getGlyphQuads(anchor, shapedTextOrientations[writingMode], textBoxScale, line, layer, textAlongLine, writingMode) : []);
        textCollisionFeature = new CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shapedTextOrientations[writingMode], textBoxScale, textPadding, textAlongLine, false);
    }
    var glyphQuadStartIndex = this.symbolQuadsArray.length;
    if (glyphQuads && glyphQuads.length) {
        for (var i = 0; i < glyphQuads.length; i++) {
            this$1.addSymbolQuad(glyphQuads[i]);
        }
    }
    var glyphQuadEndIndex = this.symbolQuadsArray.length;
    var textBoxStartIndex = textCollisionFeature ? textCollisionFeature.boxStartIndex : this.collisionBoxArray.length;
    var textBoxEndIndex = textCollisionFeature ? textCollisionFeature.boxEndIndex : this.collisionBoxArray.length;
    if (shapedIcon) {
        iconQuads = addToBuffers ? getIconQuads(anchor, shapedIcon, iconBoxScale, line, layer, iconAlongLine, shapedTextOrientations[WritingMode.horizontal], globalProperties, featureProperties) : [];
        iconCollisionFeature = new CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shapedIcon, iconBoxScale, iconPadding, iconAlongLine, true);
    }
    var iconQuadStartIndex = this.symbolQuadsArray.length;
    if (iconQuads && iconQuads.length === 1) {
        this.addSymbolQuad(iconQuads[0]);
    }
    var iconQuadEndIndex = this.symbolQuadsArray.length;
    var iconBoxStartIndex = iconCollisionFeature ? iconCollisionFeature.boxStartIndex : this.collisionBoxArray.length;
    var iconBoxEndIndex = iconCollisionFeature ? iconCollisionFeature.boxEndIndex : this.collisionBoxArray.length;
    if (iconQuadEndIndex > SymbolBucket.MAX_QUADS)
        util.warnOnce('Too many symbols being rendered in a tile. See https://github.com/mapbox/mapbox-gl-js/issues/2907');
    if (glyphQuadEndIndex > SymbolBucket.MAX_QUADS)
        util.warnOnce('Too many glyphs being rendered in a tile. See https://github.com/mapbox/mapbox-gl-js/issues/2907');
    var writingModes = (shapedTextOrientations[WritingMode.vertical] ? WritingMode.vertical : 0) | (shapedTextOrientations[WritingMode.horizontal] ? WritingMode.horizontal : 0);
    return this.symbolInstancesArray.emplaceBack(textBoxStartIndex, textBoxEndIndex, iconBoxStartIndex, iconBoxEndIndex, glyphQuadStartIndex, glyphQuadEndIndex, iconQuadStartIndex, iconQuadEndIndex, anchor.x, anchor.y, index, writingModes);
};
SymbolBucket.prototype.addSymbolQuad = function addSymbolQuad(symbolQuad) {
    return this.symbolQuadsArray.emplaceBack(symbolQuad.anchorPoint.x, symbolQuad.anchorPoint.y, symbolQuad.tl.x, symbolQuad.tl.y, symbolQuad.tr.x, symbolQuad.tr.y, symbolQuad.bl.x, symbolQuad.bl.y, symbolQuad.br.x, symbolQuad.br.y, symbolQuad.tex.h, symbolQuad.tex.w, symbolQuad.tex.x, symbolQuad.tex.y, symbolQuad.anchorAngle, symbolQuad.glyphAngle, symbolQuad.maxScale, symbolQuad.minScale, symbolQuad.writingMode);
};
SymbolBucket.MAX_QUADS = 65535;
module.exports = SymbolBucket;
},{"../../symbol/anchor":143,"../../symbol/clip_line":145,"../../symbol/collision_feature":147,"../../symbol/get_anchors":149,"../../symbol/mergelines":152,"../../symbol/quads":153,"../../symbol/resolve_text":154,"../../symbol/shaping":155,"../../util/classify_rings":181,"../../util/find_pole_of_inaccessibility":187,"../../util/script_detection":194,"../../util/token":196,"../../util/util":197,"../array_group":71,"../buffer_group":79,"../element_array_type":80,"../extent":81,"../load_geometry":83,"../vertex_array_type":87,"point-geometry":204,"vector-tile":210}],78:[function(require,module,exports){
'use strict';
var AttributeType = {
    Int8: 'BYTE',
    Uint8: 'UNSIGNED_BYTE',
    Int16: 'SHORT',
    Uint16: 'UNSIGNED_SHORT'
};
var Buffer = function Buffer(array, arrayType, type) {
    this.arrayBuffer = array.arrayBuffer;
    this.length = array.length;
    this.attributes = arrayType.members;
    this.itemSize = arrayType.bytesPerElement;
    this.type = type;
    this.arrayType = arrayType;
};
Buffer.fromStructArray = function fromStructArray(array, type) {
    return new Buffer(array.serialize(), array.constructor.serialize(), type);
};
Buffer.prototype.bind = function bind(gl) {
    var type = gl[this.type];
    if (!this.buffer) {
        this.gl = gl;
        this.buffer = gl.createBuffer();
        gl.bindBuffer(type, this.buffer);
        gl.bufferData(type, this.arrayBuffer, gl.STATIC_DRAW);
        this.arrayBuffer = null;
    } else {
        gl.bindBuffer(type, this.buffer);
    }
};
Buffer.prototype.setVertexAttribPointers = function setVertexAttribPointers(gl, program, vertexOffset) {
    var this$1 = this;
    for (var j = 0; j < this.attributes.length; j++) {
        var member = this$1.attributes[j];
        var attribIndex = program[member.name];
        if (attribIndex !== undefined) {
            gl.vertexAttribPointer(attribIndex, member.components, gl[AttributeType[member.type]], false, this$1.arrayType.bytesPerElement, member.offset + (this$1.arrayType.bytesPerElement * vertexOffset || 0));
        }
    }
};
Buffer.prototype.destroy = function destroy() {
    if (this.buffer) {
        this.gl.deleteBuffer(this.buffer);
    }
};
Buffer.BufferType = {
    VERTEX: 'ARRAY_BUFFER',
    ELEMENT: 'ELEMENT_ARRAY_BUFFER'
};
module.exports = Buffer;
},{}],79:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var Buffer = require('./buffer');
var ProgramConfiguration = require('./program_configuration');
var VertexArrayObject = require('../render/vertex_array_object');
var BufferGroup = function BufferGroup(programInterface, layers, zoom, arrays) {
    var this$1 = this;
    this.layoutVertexBuffer = new Buffer(arrays.layoutVertexArray, programInterface.layoutVertexArrayType.serialize(), Buffer.BufferType.VERTEX);
    if (arrays.elementArray) {
        this.elementBuffer = new Buffer(arrays.elementArray, programInterface.elementArrayType.serialize(), Buffer.BufferType.ELEMENT);
    }
    if (arrays.elementArray2) {
        this.elementBuffer2 = new Buffer(arrays.elementArray2, programInterface.elementArrayType2.serialize(), Buffer.BufferType.ELEMENT);
    }
    this.layerData = {};
    for (var i = 0, list = layers; i < list.length; i += 1) {
        var layer = list[i];
        var array = arrays.paintVertexArrays && arrays.paintVertexArrays[layer.id];
        var programConfiguration = ProgramConfiguration.createDynamic(programInterface.paintAttributes || [], layer, zoom);
        var paintVertexBuffer = array ? new Buffer(array.array, array.type, Buffer.BufferType.VERTEX) : null;
        this$1.layerData[layer.id] = {
            programConfiguration: programConfiguration,
            paintVertexBuffer: paintVertexBuffer
        };
    }
    this.segments = arrays.segments;
    this.segments2 = arrays.segments2;
    for (var i$1 = 0, list$1 = [
                this.segments,
                this.segments2
            ]; i$1 < list$1.length; i$1 += 1) {
        var segments = list$1[i$1];
        for (var i$2 = 0, list$2 = segments || []; i$2 < list$2.length; i$2 += 1) {
            var segment = list$2[i$2];
            segment.vaos = util.mapObject(this$1.layerData, function () {
                return new VertexArrayObject();
            });
        }
    }
};
BufferGroup.prototype.destroy = function destroy() {
    var this$1 = this;
    this.layoutVertexBuffer.destroy();
    if (this.elementBuffer) {
        this.elementBuffer.destroy();
    }
    if (this.elementBuffer2) {
        this.elementBuffer2.destroy();
    }
    for (var layerId in this.layerData) {
        var paintVertexBuffer = this$1.layerData[layerId].paintVertexBuffer;
        if (paintVertexBuffer) {
            paintVertexBuffer.destroy();
        }
    }
    for (var i = 0, list = [
                this.segments,
                this.segments2
            ]; i < list.length; i += 1) {
        var segments = list[i];
        for (var i$1 = 0, list$1 = segments || []; i$1 < list$1.length; i$1 += 1) {
            var segment = list$1[i$1];
            for (var k in segment.vaos) {
                segment.vaos[k].destroy();
            }
        }
    }
};
module.exports = BufferGroup;
},{"../render/vertex_array_object":109,"../util/util":197,"./buffer":78,"./program_configuration":85}],80:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
module.exports = createElementArrayType;
function createElementArrayType(components) {
    return createStructArrayType({
        members: [{
                type: 'Uint16',
                name: 'vertices',
                components: components || 3
            }]
    });
}
},{"../util/struct_array":195}],81:[function(require,module,exports){
'use strict';
module.exports = 8192;
},{}],82:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var loadGeometry = require('./load_geometry');
var EXTENT = require('./extent');
var featureFilter = require('feature-filter');
var createStructArrayType = require('../util/struct_array');
var Grid = require('grid-index');
var DictionaryCoder = require('../util/dictionary_coder');
var vt = require('vector-tile');
var Protobuf = require('pbf');
var GeoJSONFeature = require('../util/vectortile_to_geojson');
var arraysIntersect = require('../util/util').arraysIntersect;
var intersection = require('../util/intersection_tests');
var multiPolygonIntersectsBufferedMultiPoint = intersection.multiPolygonIntersectsBufferedMultiPoint;
var multiPolygonIntersectsMultiPolygon = intersection.multiPolygonIntersectsMultiPolygon;
var multiPolygonIntersectsBufferedMultiLine = intersection.multiPolygonIntersectsBufferedMultiLine;
var FeatureIndexArray = createStructArrayType({
    members: [
        {
            type: 'Uint32',
            name: 'featureIndex'
        },
        {
            type: 'Uint16',
            name: 'sourceLayerIndex'
        },
        {
            type: 'Uint16',
            name: 'bucketIndex'
        }
    ]
});
var FeatureIndex = function FeatureIndex(coord, overscaling, collisionTile) {
    if (coord.grid) {
        var serialized = coord;
        var rawTileData = overscaling;
        coord = serialized.coord;
        overscaling = serialized.overscaling;
        this.grid = new Grid(serialized.grid);
        this.featureIndexArray = new FeatureIndexArray(serialized.featureIndexArray);
        this.rawTileData = rawTileData;
        this.bucketLayerIDs = serialized.bucketLayerIDs;
    } else {
        this.grid = new Grid(EXTENT, 16, 0);
        this.featureIndexArray = new FeatureIndexArray();
    }
    this.coord = coord;
    this.overscaling = overscaling;
    this.x = coord.x;
    this.y = coord.y;
    this.z = coord.z - Math.log(overscaling) / Math.LN2;
    this.setCollisionTile(collisionTile);
};
FeatureIndex.prototype.insert = function insert(feature, bucketIndex) {
    var this$1 = this;
    var key = this.featureIndexArray.length;
    this.featureIndexArray.emplaceBack(feature.index, feature.sourceLayerIndex, bucketIndex);
    var geometry = loadGeometry(feature);
    for (var r = 0; r < geometry.length; r++) {
        var ring = geometry[r];
        var bbox = [
            Infinity,
            Infinity,
            -Infinity,
            -Infinity
        ];
        for (var i = 0; i < ring.length; i++) {
            var p = ring[i];
            bbox[0] = Math.min(bbox[0], p.x);
            bbox[1] = Math.min(bbox[1], p.y);
            bbox[2] = Math.max(bbox[2], p.x);
            bbox[3] = Math.max(bbox[3], p.y);
        }
        this$1.grid.insert(key, bbox[0], bbox[1], bbox[2], bbox[3]);
    }
};
FeatureIndex.prototype.setCollisionTile = function setCollisionTile(collisionTile) {
    this.collisionTile = collisionTile;
};
FeatureIndex.prototype.serialize = function serialize(transferables) {
    var grid = this.grid.toArrayBuffer();
    if (transferables) {
        transferables.push(grid);
    }
    return {
        coord: this.coord,
        overscaling: this.overscaling,
        grid: grid,
        featureIndexArray: this.featureIndexArray.serialize(transferables),
        bucketLayerIDs: this.bucketLayerIDs
    };
};
FeatureIndex.prototype.query = function query(args, styleLayers) {
    if (!this.vtLayers) {
        this.vtLayers = new vt.VectorTile(new Protobuf(this.rawTileData)).layers;
        this.sourceLayerCoder = new DictionaryCoder(this.vtLayers ? Object.keys(this.vtLayers).sort() : ['_geojsonTileLayer']);
    }
    var result = {};
    var params = args.params || {}, pixelsToTileUnits = EXTENT / args.tileSize / args.scale, filter = featureFilter(params.filter);
    var additionalRadius = 0;
    for (var id in styleLayers) {
        var styleLayer = styleLayers[id];
        var paint = styleLayer.paint;
        var styleLayerDistance = 0;
        if (styleLayer.type === 'line') {
            styleLayerDistance = getLineWidth(paint) / 2 + Math.abs(paint['line-offset']) + translateDistance(paint['line-translate']);
        } else if (styleLayer.type === 'fill') {
            styleLayerDistance = translateDistance(paint['fill-translate']);
        } else if (styleLayer.type === 'fill-extrusion') {
            styleLayerDistance = translateDistance(paint['fill-extrusion-translate']);
        } else if (styleLayer.type === 'circle') {
            styleLayerDistance = paint['circle-radius'] + translateDistance(paint['circle-translate']);
        }
        additionalRadius = Math.max(additionalRadius, styleLayerDistance * pixelsToTileUnits);
    }
    var queryGeometry = args.queryGeometry.map(function (q) {
        return q.map(function (p) {
            return new Point(p.x, p.y);
        });
    });
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < queryGeometry.length; i++) {
        var ring = queryGeometry[i];
        for (var k = 0; k < ring.length; k++) {
            var p = ring[k];
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
        }
    }
    var matching = this.grid.query(minX - additionalRadius, minY - additionalRadius, maxX + additionalRadius, maxY + additionalRadius);
    matching.sort(topDownFeatureComparator);
    this.filterMatching(result, matching, this.featureIndexArray, queryGeometry, filter, params.layers, styleLayers, args.bearing, pixelsToTileUnits);
    var matchingSymbols = this.collisionTile.queryRenderedSymbols(queryGeometry, args.scale);
    matchingSymbols.sort();
    this.filterMatching(result, matchingSymbols, this.collisionTile.collisionBoxArray, queryGeometry, filter, params.layers, styleLayers, args.bearing, pixelsToTileUnits);
    return result;
};
FeatureIndex.prototype.filterMatching = function filterMatching(result, matching, array, queryGeometry, filter, filterLayerIDs, styleLayers, bearing, pixelsToTileUnits) {
    var this$1 = this;
    var previousIndex;
    for (var k = 0; k < matching.length; k++) {
        var index = matching[k];
        if (index === previousIndex)
            continue;
        previousIndex = index;
        var match = array.get(index);
        var layerIDs = this$1.bucketLayerIDs[match.bucketIndex];
        if (filterLayerIDs && !arraysIntersect(filterLayerIDs, layerIDs))
            continue;
        var sourceLayerName = this$1.sourceLayerCoder.decode(match.sourceLayerIndex);
        var sourceLayer = this$1.vtLayers[sourceLayerName];
        var feature = sourceLayer.feature(match.featureIndex);
        if (!filter(feature))
            continue;
        var geometry = null;
        for (var l = 0; l < layerIDs.length; l++) {
            var layerID = layerIDs[l];
            if (filterLayerIDs && filterLayerIDs.indexOf(layerID) < 0) {
                continue;
            }
            var styleLayer = styleLayers[layerID];
            if (!styleLayer)
                continue;
            var translatedPolygon;
            if (styleLayer.type !== 'symbol') {
                if (!geometry)
                    geometry = loadGeometry(feature);
                var paint = styleLayer.paint;
                if (styleLayer.type === 'line') {
                    translatedPolygon = translate(queryGeometry, paint['line-translate'], paint['line-translate-anchor'], bearing, pixelsToTileUnits);
                    var halfWidth = getLineWidth(paint) / 2 * pixelsToTileUnits;
                    if (paint['line-offset']) {
                        geometry = offsetLine(geometry, paint['line-offset'] * pixelsToTileUnits);
                    }
                    if (!multiPolygonIntersectsBufferedMultiLine(translatedPolygon, geometry, halfWidth))
                        continue;
                } else if (styleLayer.type === 'fill' || styleLayer.type === 'fill-extrusion') {
                    var typePrefix = styleLayer.type;
                    translatedPolygon = translate(queryGeometry, paint[typePrefix + '-translate'], paint[typePrefix + '-translate-anchor'], bearing, pixelsToTileUnits);
                    if (!multiPolygonIntersectsMultiPolygon(translatedPolygon, geometry))
                        continue;
                } else if (styleLayer.type === 'circle') {
                    translatedPolygon = translate(queryGeometry, paint['circle-translate'], paint['circle-translate-anchor'], bearing, pixelsToTileUnits);
                    var circleRadius = paint['circle-radius'] * pixelsToTileUnits;
                    if (!multiPolygonIntersectsBufferedMultiPoint(translatedPolygon, geometry, circleRadius))
                        continue;
                }
            }
            var geojsonFeature = new GeoJSONFeature(feature, this$1.z, this$1.x, this$1.y);
            geojsonFeature.layer = styleLayer.serialize();
            var layerResult = result[layerID];
            if (layerResult === undefined) {
                layerResult = result[layerID] = [];
            }
            layerResult.push(geojsonFeature);
        }
    }
};
module.exports = FeatureIndex;
function translateDistance(translate) {
    return Math.sqrt(translate[0] * translate[0] + translate[1] * translate[1]);
}
function topDownFeatureComparator(a, b) {
    return b - a;
}
function getLineWidth(paint) {
    if (paint['line-gap-width'] > 0) {
        return paint['line-gap-width'] + 2 * paint['line-width'];
    } else {
        return paint['line-width'];
    }
}
function translate(queryGeometry, translate, translateAnchor, bearing, pixelsToTileUnits) {
    if (!translate[0] && !translate[1]) {
        return queryGeometry;
    }
    translate = Point.convert(translate);
    if (translateAnchor === 'viewport') {
        translate._rotate(-bearing);
    }
    var translated = [];
    for (var i = 0; i < queryGeometry.length; i++) {
        var ring = queryGeometry[i];
        var translatedRing = [];
        for (var k = 0; k < ring.length; k++) {
            translatedRing.push(ring[k].sub(translate._mult(pixelsToTileUnits)));
        }
        translated.push(translatedRing);
    }
    return translated;
}
function offsetLine(rings, offset) {
    var newRings = [];
    var zero = new Point(0, 0);
    for (var k = 0; k < rings.length; k++) {
        var ring = rings[k];
        var newRing = [];
        for (var i = 0; i < ring.length; i++) {
            var a = ring[i - 1];
            var b = ring[i];
            var c = ring[i + 1];
            var aToB = i === 0 ? zero : b.sub(a)._unit()._perp();
            var bToC = i === ring.length - 1 ? zero : c.sub(b)._unit()._perp();
            var extrude = aToB._add(bToC)._unit();
            var cosHalfAngle = extrude.x * bToC.x + extrude.y * bToC.y;
            extrude._mult(1 / cosHalfAngle);
            newRing.push(extrude._mult(offset)._add(b));
        }
        newRings.push(newRing);
    }
    return newRings;
}
},{"../util/dictionary_coder":183,"../util/intersection_tests":190,"../util/struct_array":195,"../util/util":197,"../util/vectortile_to_geojson":198,"./extent":81,"./load_geometry":83,"feature-filter":15,"grid-index":26,"pbf":203,"point-geometry":204,"vector-tile":210}],83:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var EXTENT = require('./extent');
function createBounds(bits) {
    return {
        min: -1 * Math.pow(2, bits - 1),
        max: Math.pow(2, bits - 1) - 1
    };
}
var boundsLookup = {
    15: createBounds(15),
    16: createBounds(16)
};
module.exports = function loadGeometry(feature, bits) {
    var bounds = boundsLookup[bits || 16];
    var scale = EXTENT / feature.extent;
    var geometry = feature.loadGeometry();
    for (var r = 0; r < geometry.length; r++) {
        var ring = geometry[r];
        for (var p = 0; p < ring.length; p++) {
            var point = ring[p];
            point.x = Math.round(point.x * scale);
            point.y = Math.round(point.y * scale);
            if (point.x < bounds.min || point.x > bounds.max || point.y < bounds.min || point.y > bounds.max) {
                util.warnOnce('Geometry exceeds allowed extent, reduce your vector tile buffer size');
            }
        }
    }
    return geometry;
};
},{"../util/util":197,"./extent":81}],84:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
var PosArray = createStructArrayType({
    members: [{
            name: 'a_pos',
            type: 'Int16',
            components: 2
        }]
});
module.exports = PosArray;
},{"../util/struct_array":195}],85:[function(require,module,exports){
'use strict';
var createVertexArrayType = require('./vertex_array_type');
var util = require('../util/util');
var ProgramConfiguration = function ProgramConfiguration() {
    this.attributes = [];
    this.uniforms = [];
    this.interpolationUniforms = [];
    this.pragmas = {
        vertex: {},
        fragment: {}
    };
    this.cacheKey = '';
};
ProgramConfiguration.createDynamic = function createDynamic(attributes, layer, zoom) {
    var self = new ProgramConfiguration();
    for (var i = 0, list = attributes; i < list.length; i += 1) {
        var attributeConfig = list[i];
        var attribute = normalizePaintAttribute(attributeConfig, layer);
        var name = attribute.name.slice(2);
        if (layer.isPaintValueFeatureConstant(attribute.property)) {
            self.addZoomAttribute(name, attribute);
        } else if (layer.isPaintValueZoomConstant(attribute.property)) {
            self.addPropertyAttribute(name, attribute);
        } else {
            self.addZoomAndPropertyAttribute(name, attribute, layer, zoom);
        }
    }
    self.PaintVertexArray = createVertexArrayType(self.attributes);
    return self;
};
ProgramConfiguration.createStatic = function createStatic(uniformNames) {
    var self = new ProgramConfiguration();
    for (var i = 0, list = uniformNames; i < list.length; i += 1) {
        var name = list[i];
        self.addUniform(name, 'u_' + name);
    }
    return self;
};
ProgramConfiguration.prototype.addUniform = function addUniform(name, inputName) {
    var pragmas = this.getPragmas(name);
    pragmas.define.push('uniform {precision} {type} ' + inputName + ';');
    pragmas.initialize.push('{precision} {type} ' + name + ' = ' + inputName + ';');
    this.cacheKey += '/u_' + name;
};
ProgramConfiguration.prototype.addZoomAttribute = function addZoomAttribute(name, attribute) {
    this.uniforms.push(attribute);
    this.addUniform(name, attribute.name);
};
ProgramConfiguration.prototype.addPropertyAttribute = function addPropertyAttribute(name, attribute) {
    var pragmas = this.getPragmas(name);
    this.attributes.push(attribute);
    pragmas.define.push('varying {precision} {type} ' + name + ';');
    pragmas.vertex.define.push('attribute {precision} {type} ' + attribute.name + ';');
    pragmas.vertex.initialize.push(name + ' = ' + attribute.name + ' / ' + attribute.multiplier + '.0;');
    this.cacheKey += '/a_' + name;
};
ProgramConfiguration.prototype.addZoomAndPropertyAttribute = function addZoomAndPropertyAttribute(name, attribute, layer, zoom) {
    var this$1 = this;
    var pragmas = this.getPragmas(name);
    pragmas.define.push('varying {precision} {type} ' + name + ';');
    var numStops = 0;
    var zoomLevels = layer.getPaintValueStopZoomLevels(attribute.property);
    while (numStops < zoomLevels.length && zoomLevels[numStops] < zoom)
        numStops++;
    var stopOffset = Math.max(0, Math.min(zoomLevels.length - 4, numStops - 2));
    var tName = 'u_' + name + '_t';
    pragmas.vertex.define.push('uniform lowp float ' + tName + ';');
    this.interpolationUniforms.push({
        name: tName,
        property: attribute.property,
        stopOffset: stopOffset
    });
    var zoomStops = [];
    for (var s = 0; s < 4; s++) {
        zoomStops.push(zoomLevels[Math.min(stopOffset + s, zoomLevels.length - 1)]);
    }
    var componentNames = [];
    if (attribute.components === 1) {
        this.attributes.push(util.extend({}, attribute, {
            components: 4,
            zoomStops: zoomStops
        }));
        pragmas.vertex.define.push('attribute {precision} vec4 ' + attribute.name + ';');
        componentNames.push(attribute.name);
    } else {
        for (var k = 0; k < 4; k++) {
            var componentName = attribute.name + k;
            componentNames.push(componentName);
            this$1.attributes.push(util.extend({}, attribute, {
                name: componentName,
                zoomStops: [zoomStops[k]]
            }));
            pragmas.vertex.define.push('attribute {precision} {type} ' + componentName + ';');
        }
    }
    pragmas.vertex.initialize.push(name + ' = evaluate_zoom_function_' + attribute.components + '(            ' + componentNames.join(', ') + ', ' + tName + ') / ' + attribute.multiplier + '.0;');
    this.cacheKey += '/z_' + name;
};
ProgramConfiguration.prototype.getPragmas = function getPragmas(name) {
    if (!this.pragmas[name]) {
        this.pragmas[name] = {
            define: [],
            initialize: []
        };
        this.pragmas[name].fragment = {
            define: [],
            initialize: []
        };
        this.pragmas[name].vertex = {
            define: [],
            initialize: []
        };
    }
    return this.pragmas[name];
};
ProgramConfiguration.prototype.applyPragmas = function applyPragmas(source, shaderType) {
    var this$1 = this;
    return source.replace(/#pragma mapbox: ([\w]+) ([\w]+) ([\w]+) ([\w]+)/g, function (match, operation, precision, type, name) {
        return this$1.pragmas[name][operation].concat(this$1.pragmas[name][shaderType][operation]).join('\n').replace(/{type}/g, type).replace(/{precision}/g, precision);
    });
};
ProgramConfiguration.prototype.populatePaintArray = function populatePaintArray(layer, paintArray, length, globalProperties, featureProperties) {
    var start = paintArray.length;
    paintArray.resize(length);
    for (var i$1 = 0, list = this.attributes; i$1 < list.length; i$1 += 1) {
        var attribute = list[i$1];
        var value = getPaintAttributeValue(attribute, layer, globalProperties, featureProperties);
        for (var i = start; i < length; i++) {
            var vertex = paintArray.get(i);
            if (attribute.components === 4) {
                for (var c = 0; c < 4; c++) {
                    vertex[attribute.name + c] = value[c] * attribute.multiplier;
                }
            } else {
                vertex[attribute.name] = value * attribute.multiplier;
            }
        }
    }
};
ProgramConfiguration.prototype.setUniforms = function setUniforms(gl, program, layer, globalProperties) {
    for (var i = 0, list = this.uniforms; i < list.length; i += 1) {
        var uniform = list[i];
        var value = layer.getPaintValue(uniform.property, globalProperties);
        if (uniform.components === 4) {
            gl.uniform4fv(program[uniform.name], value);
        } else {
            gl.uniform1f(program[uniform.name], value);
        }
    }
    for (var i$1 = 0, list$1 = this.interpolationUniforms; i$1 < list$1.length; i$1 += 1) {
        var uniform$1 = list$1[i$1];
        var stopInterp = layer.getPaintInterpolationT(uniform$1.property, globalProperties);
        gl.uniform1f(program[uniform$1.name], Math.max(0, Math.min(4, stopInterp - uniform$1.stopOffset)));
    }
};
function getPaintAttributeValue(attribute, layer, globalProperties, featureProperties) {
    if (!attribute.zoomStops) {
        return layer.getPaintValue(attribute.property, globalProperties, featureProperties);
    }
    var values = attribute.zoomStops.map(function (zoom) {
        return layer.getPaintValue(attribute.property, util.extend({}, globalProperties, { zoom: zoom }), featureProperties);
    });
    return values.length === 1 ? values[0] : values;
}
function normalizePaintAttribute(attribute, layer) {
    var name = attribute.property.replace(layer.type + '-', '').replace(/-/g, '_');
    var isColor = layer._paintSpecifications[attribute.property].type === 'color';
    return util.extend({
        name: 'a_' + name,
        components: isColor ? 4 : 1,
        multiplier: isColor ? 255 : 1
    }, attribute);
}
module.exports = ProgramConfiguration;
},{"../util/util":197,"./vertex_array_type":87}],86:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
var RasterBoundsArray = createStructArrayType({
    members: [
        {
            name: 'a_pos',
            type: 'Int16',
            components: 2
        },
        {
            name: 'a_texture_pos',
            type: 'Int16',
            components: 2
        }
    ]
});
module.exports = RasterBoundsArray;
},{"../util/struct_array":195}],87:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
module.exports = createVertexArrayType;
function createVertexArrayType(members) {
    return createStructArrayType({
        members: members,
        alignment: 4
    });
}
},{"../util/struct_array":195}],88:[function(require,module,exports){
'use strict';
var Coordinate = function Coordinate(column, row, zoom) {
    this.column = column;
    this.row = row;
    this.zoom = zoom;
};
Coordinate.prototype.clone = function clone() {
    return new Coordinate(this.column, this.row, this.zoom);
};
Coordinate.prototype.zoomTo = function zoomTo(zoom) {
    return this.clone()._zoomTo(zoom);
};
Coordinate.prototype.sub = function sub(c) {
    return this.clone()._sub(c);
};
Coordinate.prototype._zoomTo = function _zoomTo(zoom) {
    var scale = Math.pow(2, zoom - this.zoom);
    this.column *= scale;
    this.row *= scale;
    this.zoom = zoom;
    return this;
};
Coordinate.prototype._sub = function _sub(c) {
    c = c.zoomTo(this.zoom);
    this.column -= c.column;
    this.row -= c.row;
    return this;
};
module.exports = Coordinate;
},{}],89:[function(require,module,exports){
'use strict';
var wrap = require('../util/util').wrap;
var LngLat = function LngLat(lng, lat) {
    if (isNaN(lng) || isNaN(lat)) {
        throw new Error('Invalid LngLat object: (' + lng + ', ' + lat + ')');
    }
    this.lng = +lng;
    this.lat = +lat;
    if (this.lat > 90 || this.lat < -90) {
        throw new Error('Invalid LngLat latitude value: must be between -90 and 90');
    }
};
LngLat.prototype.wrap = function wrap$1() {
    return new LngLat(wrap(this.lng, -180, 180), this.lat);
};
LngLat.prototype.toArray = function toArray() {
    return [
        this.lng,
        this.lat
    ];
};
LngLat.prototype.toString = function toString() {
    return 'LngLat(' + this.lng + ', ' + this.lat + ')';
};
LngLat.convert = function (input) {
    if (input instanceof LngLat) {
        return input;
    } else if (input && input.hasOwnProperty('lng') && input.hasOwnProperty('lat')) {
        return new LngLat(input.lng, input.lat);
    } else if (Array.isArray(input) && input.length === 2) {
        return new LngLat(input[0], input[1]);
    } else {
        throw new Error('`LngLatLike` argument must be specified as a LngLat instance, an object {lng: <lng>, lat: <lat>}, or an array of [<lng>, <lat>]');
    }
};
module.exports = LngLat;
},{"../util/util":197}],90:[function(require,module,exports){
'use strict';
var LngLat = require('./lng_lat');
var LngLatBounds = function LngLatBounds(sw, ne) {
    if (!sw) {
        return;
    } else if (ne) {
        this.setSouthWest(sw).setNorthEast(ne);
    } else if (sw.length === 4) {
        this.setSouthWest([
            sw[0],
            sw[1]
        ]).setNorthEast([
            sw[2],
            sw[3]
        ]);
    } else {
        this.setSouthWest(sw[0]).setNorthEast(sw[1]);
    }
};
LngLatBounds.prototype.setNorthEast = function setNorthEast(ne) {
    this._ne = LngLat.convert(ne);
    return this;
};
LngLatBounds.prototype.setSouthWest = function setSouthWest(sw) {
    this._sw = LngLat.convert(sw);
    return this;
};
LngLatBounds.prototype.extend = function extend(obj) {
    var sw = this._sw, ne = this._ne;
    var sw2, ne2;
    if (obj instanceof LngLat) {
        sw2 = obj;
        ne2 = obj;
    } else if (obj instanceof LngLatBounds) {
        sw2 = obj._sw;
        ne2 = obj._ne;
        if (!sw2 || !ne2)
            return this;
    } else {
        if (Array.isArray(obj)) {
            if (obj.every(Array.isArray)) {
                return this.extend(LngLatBounds.convert(obj));
            } else {
                return this.extend(LngLat.convert(obj));
            }
        }
        return this;
    }
    if (!sw && !ne) {
        this._sw = new LngLat(sw2.lng, sw2.lat);
        this._ne = new LngLat(ne2.lng, ne2.lat);
    } else {
        sw.lng = Math.min(sw2.lng, sw.lng);
        sw.lat = Math.min(sw2.lat, sw.lat);
        ne.lng = Math.max(ne2.lng, ne.lng);
        ne.lat = Math.max(ne2.lat, ne.lat);
    }
    return this;
};
LngLatBounds.prototype.getCenter = function getCenter() {
    return new LngLat((this._sw.lng + this._ne.lng) / 2, (this._sw.lat + this._ne.lat) / 2);
};
LngLatBounds.prototype.getSouthWest = function getSouthWest() {
    return this._sw;
};
LngLatBounds.prototype.getNorthEast = function getNorthEast() {
    return this._ne;
};
LngLatBounds.prototype.getNorthWest = function getNorthWest() {
    return new LngLat(this.getWest(), this.getNorth());
};
LngLatBounds.prototype.getSouthEast = function getSouthEast() {
    return new LngLat(this.getEast(), this.getSouth());
};
LngLatBounds.prototype.getWest = function getWest() {
    return this._sw.lng;
};
LngLatBounds.prototype.getSouth = function getSouth() {
    return this._sw.lat;
};
LngLatBounds.prototype.getEast = function getEast() {
    return this._ne.lng;
};
LngLatBounds.prototype.getNorth = function getNorth() {
    return this._ne.lat;
};
LngLatBounds.prototype.toArray = function toArray() {
    return [
        this._sw.toArray(),
        this._ne.toArray()
    ];
};
LngLatBounds.prototype.toString = function toString() {
    return 'LngLatBounds(' + this._sw.toString() + ', ' + this._ne.toString() + ')';
};
LngLatBounds.convert = function (input) {
    if (!input || input instanceof LngLatBounds)
        return input;
    return new LngLatBounds(input);
};
module.exports = LngLatBounds;
},{"./lng_lat":89}],91:[function(require,module,exports){
'use strict';
var LngLat = require('./lng_lat'), Point = require('point-geometry'), Coordinate = require('./coordinate'), util = require('../util/util'), interp = require('../util/interpolate'), TileCoord = require('../source/tile_coord'), EXTENT = require('../data/extent'), glmatrix = require('@mapbox/gl-matrix');
var vec4 = glmatrix.vec4, mat4 = glmatrix.mat4, mat2 = glmatrix.mat2;
var Transform = function Transform(minZoom, maxZoom) {
    this.tileSize = 512;
    this._minZoom = minZoom || 0;
    this._maxZoom = maxZoom || 22;
    this.latRange = [
        -85.05113,
        85.05113
    ];
    this.width = 0;
    this.height = 0;
    this._center = new LngLat(0, 0);
    this.zoom = 0;
    this.angle = 0;
    this._fov = 0.6435011087932844;
    this._pitch = 0;
    this._unmodified = true;
};
var prototypeAccessors = {
    minZoom: {},
    maxZoom: {},
    worldSize: {},
    centerPoint: {},
    size: {},
    bearing: {},
    pitch: {},
    fov: {},
    zoom: {},
    center: {},
    unmodified: {},
    x: {},
    y: {},
    point: {}
};
prototypeAccessors.minZoom.get = function () {
    return this._minZoom;
};
prototypeAccessors.minZoom.set = function (zoom) {
    if (this._minZoom === zoom)
        return;
    this._minZoom = zoom;
    this.zoom = Math.max(this.zoom, zoom);
};
prototypeAccessors.maxZoom.get = function () {
    return this._maxZoom;
};
prototypeAccessors.maxZoom.set = function (zoom) {
    if (this._maxZoom === zoom)
        return;
    this._maxZoom = zoom;
    this.zoom = Math.min(this.zoom, zoom);
};
prototypeAccessors.worldSize.get = function () {
    return this.tileSize * this.scale;
};
prototypeAccessors.centerPoint.get = function () {
    return this.size._div(2);
};
prototypeAccessors.size.get = function () {
    return new Point(this.width, this.height);
};
prototypeAccessors.bearing.get = function () {
    return -this.angle / Math.PI * 180;
};
prototypeAccessors.bearing.set = function (bearing) {
    var b = -util.wrap(bearing, -180, 180) * Math.PI / 180;
    if (this.angle === b)
        return;
    this._unmodified = false;
    this.angle = b;
    this._calcMatrices();
    this.rotationMatrix = mat2.create();
    mat2.rotate(this.rotationMatrix, this.rotationMatrix, this.angle);
};
prototypeAccessors.pitch.get = function () {
    return this._pitch / Math.PI * 180;
};
prototypeAccessors.pitch.set = function (pitch) {
    var p = util.clamp(pitch, 0, 60) / 180 * Math.PI;
    if (this._pitch === p)
        return;
    this._unmodified = false;
    this._pitch = p;
    this._calcMatrices();
};
prototypeAccessors.fov.get = function () {
    return this._fov / Math.PI * 180;
};
prototypeAccessors.fov.set = function (fov) {
    fov = Math.max(0.01, Math.min(60, fov));
    if (this._fov === fov)
        return;
    this._unmodified = false;
    this._fov = fov / 180 * Math.PI;
    this._calcMatrices();
};
prototypeAccessors.zoom.get = function () {
    return this._zoom;
};
prototypeAccessors.zoom.set = function (zoom) {
    var z = Math.min(Math.max(zoom, this.minZoom), this.maxZoom);
    if (this._zoom === z)
        return;
    this._unmodified = false;
    this._zoom = z;
    this.scale = this.zoomScale(z);
    this.tileZoom = Math.floor(z);
    this.zoomFraction = z - this.tileZoom;
    this._constrain();
    this._calcMatrices();
};
prototypeAccessors.center.get = function () {
    return this._center;
};
prototypeAccessors.center.set = function (center) {
    if (center.lat === this._center.lat && center.lng === this._center.lng)
        return;
    this._unmodified = false;
    this._center = center;
    this._constrain();
    this._calcMatrices();
};
Transform.prototype.coveringZoomLevel = function coveringZoomLevel(options) {
    return (options.roundZoom ? Math.round : Math.floor)(this.zoom + this.scaleZoom(this.tileSize / options.tileSize));
};
Transform.prototype.coveringTiles = function coveringTiles(options) {
    var z = this.coveringZoomLevel(options);
    var actualZ = z;
    if (z < options.minzoom)
        return [];
    if (z > options.maxzoom)
        z = options.maxzoom;
    var centerCoord = this.pointCoordinate(this.centerPoint, z);
    var centerPoint = new Point(centerCoord.column - 0.5, centerCoord.row - 0.5);
    var cornerCoords = [
        this.pointCoordinate(new Point(0, 0), z),
        this.pointCoordinate(new Point(this.width, 0), z),
        this.pointCoordinate(new Point(this.width, this.height), z),
        this.pointCoordinate(new Point(0, this.height), z)
    ];
    return TileCoord.cover(z, cornerCoords, options.reparseOverscaled ? actualZ : z).sort(function (a, b) {
        return centerPoint.dist(a) - centerPoint.dist(b);
    });
};
Transform.prototype.resize = function resize(width, height) {
    this.width = width;
    this.height = height;
    this.pixelsToGLUnits = [
        2 / width,
        -2 / height
    ];
    this._constrain();
    this._calcMatrices();
};
prototypeAccessors.unmodified.get = function () {
    return this._unmodified;
};
Transform.prototype.zoomScale = function zoomScale(zoom) {
    return Math.pow(2, zoom);
};
Transform.prototype.scaleZoom = function scaleZoom(scale) {
    return Math.log(scale) / Math.LN2;
};
Transform.prototype.project = function project(lnglat) {
    return new Point(this.lngX(lnglat.lng), this.latY(lnglat.lat));
};
Transform.prototype.unproject = function unproject(point) {
    return new LngLat(this.xLng(point.x), this.yLat(point.y));
};
prototypeAccessors.x.get = function () {
    return this.lngX(this.center.lng);
};
prototypeAccessors.y.get = function () {
    return this.latY(this.center.lat);
};
prototypeAccessors.point.get = function () {
    return new Point(this.x, this.y);
};
Transform.prototype.lngX = function lngX(lng) {
    return (180 + lng) * this.worldSize / 360;
};
Transform.prototype.latY = function latY(lat) {
    var y = 180 / Math.PI * Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360));
    return (180 - y) * this.worldSize / 360;
};
Transform.prototype.xLng = function xLng(x) {
    return x * 360 / this.worldSize - 180;
};
Transform.prototype.yLat = function yLat(y) {
    var y2 = 180 - y * 360 / this.worldSize;
    return 360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90;
};
Transform.prototype.setLocationAtPoint = function setLocationAtPoint(lnglat, point) {
    var translate = this.pointCoordinate(point)._sub(this.pointCoordinate(this.centerPoint));
    this.center = this.coordinateLocation(this.locationCoordinate(lnglat)._sub(translate));
};
Transform.prototype.locationPoint = function locationPoint(lnglat) {
    return this.coordinatePoint(this.locationCoordinate(lnglat));
};
Transform.prototype.pointLocation = function pointLocation(p) {
    return this.coordinateLocation(this.pointCoordinate(p));
};
Transform.prototype.locationCoordinate = function locationCoordinate(lnglat) {
    return new Coordinate(this.lngX(lnglat.lng) / this.tileSize, this.latY(lnglat.lat) / this.tileSize, this.zoom).zoomTo(this.tileZoom);
};
Transform.prototype.coordinateLocation = function coordinateLocation(coord) {
    var zoomedCoord = coord.zoomTo(this.zoom);
    return new LngLat(this.xLng(zoomedCoord.column * this.tileSize), this.yLat(zoomedCoord.row * this.tileSize));
};
Transform.prototype.pointCoordinate = function pointCoordinate(p, zoom) {
    if (zoom === undefined)
        zoom = this.tileZoom;
    var targetZ = 0;
    var coord0 = [
        p.x,
        p.y,
        0,
        1
    ];
    var coord1 = [
        p.x,
        p.y,
        1,
        1
    ];
    vec4.transformMat4(coord0, coord0, this.pixelMatrixInverse);
    vec4.transformMat4(coord1, coord1, this.pixelMatrixInverse);
    var w0 = coord0[3];
    var w1 = coord1[3];
    var x0 = coord0[0] / w0;
    var x1 = coord1[0] / w1;
    var y0 = coord0[1] / w0;
    var y1 = coord1[1] / w1;
    var z0 = coord0[2] / w0;
    var z1 = coord1[2] / w1;
    var t = z0 === z1 ? 0 : (targetZ - z0) / (z1 - z0);
    return new Coordinate(interp(x0, x1, t) / this.tileSize, interp(y0, y1, t) / this.tileSize, this.zoom)._zoomTo(zoom);
};
Transform.prototype.coordinatePoint = function coordinatePoint(coord) {
    var zoomedCoord = coord.zoomTo(this.zoom);
    var p = [
        zoomedCoord.column * this.tileSize,
        zoomedCoord.row * this.tileSize,
        0,
        1
    ];
    vec4.transformMat4(p, p, this.pixelMatrix);
    return new Point(p[0] / p[3], p[1] / p[3]);
};
Transform.prototype.calculatePosMatrix = function calculatePosMatrix(tileCoord, maxZoom) {
    var coord = tileCoord.toCoordinate(maxZoom);
    var scale = this.worldSize / this.zoomScale(coord.zoom);
    var posMatrix = mat4.identity(new Float64Array(16));
    mat4.translate(posMatrix, posMatrix, [
        coord.column * scale,
        coord.row * scale,
        0
    ]);
    mat4.scale(posMatrix, posMatrix, [
        scale / EXTENT,
        scale / EXTENT,
        1
    ]);
    mat4.multiply(posMatrix, this.projMatrix, posMatrix);
    return new Float32Array(posMatrix);
};
Transform.prototype._constrain = function _constrain() {
    if (!this.center || !this.width || !this.height || this._constraining)
        return;
    this._constraining = true;
    var minY, maxY, minX, maxX, sy, sx, x2, y2;
    var size = this.size, unmodified = this._unmodified;
    if (this.latRange) {
        minY = this.latY(this.latRange[1]);
        maxY = this.latY(this.latRange[0]);
        sy = maxY - minY < size.y ? size.y / (maxY - minY) : 0;
    }
    if (this.lngRange) {
        minX = this.lngX(this.lngRange[0]);
        maxX = this.lngX(this.lngRange[1]);
        sx = maxX - minX < size.x ? size.x / (maxX - minX) : 0;
    }
    var s = Math.max(sx || 0, sy || 0);
    if (s) {
        this.center = this.unproject(new Point(sx ? (maxX + minX) / 2 : this.x, sy ? (maxY + minY) / 2 : this.y));
        this.zoom += this.scaleZoom(s);
        this._unmodified = unmodified;
        this._constraining = false;
        return;
    }
    if (this.latRange) {
        var y = this.y, h2 = size.y / 2;
        if (y - h2 < minY)
            y2 = minY + h2;
        if (y + h2 > maxY)
            y2 = maxY - h2;
    }
    if (this.lngRange) {
        var x = this.x, w2 = size.x / 2;
        if (x - w2 < minX)
            x2 = minX + w2;
        if (x + w2 > maxX)
            x2 = maxX - w2;
    }
    if (x2 !== undefined || y2 !== undefined) {
        this.center = this.unproject(new Point(x2 !== undefined ? x2 : this.x, y2 !== undefined ? y2 : this.y));
    }
    this._unmodified = unmodified;
    this._constraining = false;
};
Transform.prototype._calcMatrices = function _calcMatrices() {
    if (!this.height)
        return;
    this.cameraToCenterDistance = 0.5 / Math.tan(this._fov / 2) * this.height;
    var halfFov = this._fov / 2;
    var groundAngle = Math.PI / 2 + this._pitch;
    var topHalfSurfaceDistance = Math.sin(halfFov) * this.cameraToCenterDistance / Math.sin(Math.PI - groundAngle - halfFov);
    var furthestDistance = Math.cos(Math.PI / 2 - this._pitch) * topHalfSurfaceDistance + this.cameraToCenterDistance;
    var farZ = furthestDistance * 1.01;
    var m = new Float64Array(16);
    mat4.perspective(m, this._fov, this.width / this.height, 1, farZ);
    mat4.scale(m, m, [
        1,
        -1,
        1
    ]);
    mat4.translate(m, m, [
        0,
        0,
        -this.cameraToCenterDistance
    ]);
    mat4.rotateX(m, m, this._pitch);
    mat4.rotateZ(m, m, this.angle);
    mat4.translate(m, m, [
        -this.x,
        -this.y,
        0
    ]);
    var verticalScale = this.worldSize / (2 * Math.PI * 6378137 * Math.abs(Math.cos(this.center.lat * (Math.PI / 180))));
    mat4.scale(m, m, [
        1,
        1,
        verticalScale,
        1
    ]);
    this.projMatrix = m;
    m = mat4.create();
    mat4.scale(m, m, [
        this.width / 2,
        -this.height / 2,
        1
    ]);
    mat4.translate(m, m, [
        1,
        -1,
        0
    ]);
    this.pixelMatrix = mat4.multiply(new Float64Array(16), m, this.projMatrix);
    m = mat4.invert(new Float64Array(16), this.pixelMatrix);
    if (!m)
        throw new Error('failed to invert matrix');
    this.pixelMatrixInverse = m;
};
Object.defineProperties(Transform.prototype, prototypeAccessors);
module.exports = Transform;
},{"../data/extent":81,"../source/tile_coord":121,"../util/interpolate":189,"../util/util":197,"./coordinate":88,"./lng_lat":89,"@mapbox/gl-matrix":7,"point-geometry":204}],92:[function(require,module,exports){
'use strict';
var WorkerPool = require('./util/worker_pool');
var globalWorkerPool;
module.exports = function getGlobalWorkerPool() {
    if (!globalWorkerPool) {
        globalWorkerPool = new WorkerPool();
    }
    return globalWorkerPool;
};
},{"./util/worker_pool":200}],93:[function(require,module,exports){
'use strict';
var simplexFont = {
    ' ': [
        16,
        []
    ],
    '!': [
        10,
        [
            5,
            21,
            5,
            7,
            -1,
            -1,
            5,
            2,
            4,
            1,
            5,
            0,
            6,
            1,
            5,
            2
        ]
    ],
    '"': [
        16,
        [
            4,
            21,
            4,
            14,
            -1,
            -1,
            12,
            21,
            12,
            14
        ]
    ],
    '#': [
        21,
        [
            11,
            25,
            4,
            -7,
            -1,
            -1,
            17,
            25,
            10,
            -7,
            -1,
            -1,
            4,
            12,
            18,
            12,
            -1,
            -1,
            3,
            6,
            17,
            6
        ]
    ],
    '$': [
        20,
        [
            8,
            25,
            8,
            -4,
            -1,
            -1,
            12,
            25,
            12,
            -4,
            -1,
            -1,
            17,
            18,
            15,
            20,
            12,
            21,
            8,
            21,
            5,
            20,
            3,
            18,
            3,
            16,
            4,
            14,
            5,
            13,
            7,
            12,
            13,
            10,
            15,
            9,
            16,
            8,
            17,
            6,
            17,
            3,
            15,
            1,
            12,
            0,
            8,
            0,
            5,
            1,
            3,
            3
        ]
    ],
    '%': [
        24,
        [
            21,
            21,
            3,
            0,
            -1,
            -1,
            8,
            21,
            10,
            19,
            10,
            17,
            9,
            15,
            7,
            14,
            5,
            14,
            3,
            16,
            3,
            18,
            4,
            20,
            6,
            21,
            8,
            21,
            10,
            20,
            13,
            19,
            16,
            19,
            19,
            20,
            21,
            21,
            -1,
            -1,
            17,
            7,
            15,
            6,
            14,
            4,
            14,
            2,
            16,
            0,
            18,
            0,
            20,
            1,
            21,
            3,
            21,
            5,
            19,
            7,
            17,
            7
        ]
    ],
    '&': [
        26,
        [
            23,
            12,
            23,
            13,
            22,
            14,
            21,
            14,
            20,
            13,
            19,
            11,
            17,
            6,
            15,
            3,
            13,
            1,
            11,
            0,
            7,
            0,
            5,
            1,
            4,
            2,
            3,
            4,
            3,
            6,
            4,
            8,
            5,
            9,
            12,
            13,
            13,
            14,
            14,
            16,
            14,
            18,
            13,
            20,
            11,
            21,
            9,
            20,
            8,
            18,
            8,
            16,
            9,
            13,
            11,
            10,
            16,
            3,
            18,
            1,
            20,
            0,
            22,
            0,
            23,
            1,
            23,
            2
        ]
    ],
    '\'': [
        10,
        [
            5,
            19,
            4,
            20,
            5,
            21,
            6,
            20,
            6,
            18,
            5,
            16,
            4,
            15
        ]
    ],
    '(': [
        14,
        [
            11,
            25,
            9,
            23,
            7,
            20,
            5,
            16,
            4,
            11,
            4,
            7,
            5,
            2,
            7,
            -2,
            9,
            -5,
            11,
            -7
        ]
    ],
    ')': [
        14,
        [
            3,
            25,
            5,
            23,
            7,
            20,
            9,
            16,
            10,
            11,
            10,
            7,
            9,
            2,
            7,
            -2,
            5,
            -5,
            3,
            -7
        ]
    ],
    '*': [
        16,
        [
            8,
            21,
            8,
            9,
            -1,
            -1,
            3,
            18,
            13,
            12,
            -1,
            -1,
            13,
            18,
            3,
            12
        ]
    ],
    '+': [
        26,
        [
            13,
            18,
            13,
            0,
            -1,
            -1,
            4,
            9,
            22,
            9
        ]
    ],
    ',': [
        10,
        [
            6,
            1,
            5,
            0,
            4,
            1,
            5,
            2,
            6,
            1,
            6,
            -1,
            5,
            -3,
            4,
            -4
        ]
    ],
    '-': [
        26,
        [
            4,
            9,
            22,
            9
        ]
    ],
    '.': [
        10,
        [
            5,
            2,
            4,
            1,
            5,
            0,
            6,
            1,
            5,
            2
        ]
    ],
    '/': [
        22,
        [
            20,
            25,
            2,
            -7
        ]
    ],
    '0': [
        20,
        [
            9,
            21,
            6,
            20,
            4,
            17,
            3,
            12,
            3,
            9,
            4,
            4,
            6,
            1,
            9,
            0,
            11,
            0,
            14,
            1,
            16,
            4,
            17,
            9,
            17,
            12,
            16,
            17,
            14,
            20,
            11,
            21,
            9,
            21
        ]
    ],
    '1': [
        20,
        [
            6,
            17,
            8,
            18,
            11,
            21,
            11,
            0
        ]
    ],
    '2': [
        20,
        [
            4,
            16,
            4,
            17,
            5,
            19,
            6,
            20,
            8,
            21,
            12,
            21,
            14,
            20,
            15,
            19,
            16,
            17,
            16,
            15,
            15,
            13,
            13,
            10,
            3,
            0,
            17,
            0
        ]
    ],
    '3': [
        20,
        [
            5,
            21,
            16,
            21,
            10,
            13,
            13,
            13,
            15,
            12,
            16,
            11,
            17,
            8,
            17,
            6,
            16,
            3,
            14,
            1,
            11,
            0,
            8,
            0,
            5,
            1,
            4,
            2,
            3,
            4
        ]
    ],
    '4': [
        20,
        [
            13,
            21,
            3,
            7,
            18,
            7,
            -1,
            -1,
            13,
            21,
            13,
            0
        ]
    ],
    '5': [
        20,
        [
            15,
            21,
            5,
            21,
            4,
            12,
            5,
            13,
            8,
            14,
            11,
            14,
            14,
            13,
            16,
            11,
            17,
            8,
            17,
            6,
            16,
            3,
            14,
            1,
            11,
            0,
            8,
            0,
            5,
            1,
            4,
            2,
            3,
            4
        ]
    ],
    '6': [
        20,
        [
            16,
            18,
            15,
            20,
            12,
            21,
            10,
            21,
            7,
            20,
            5,
            17,
            4,
            12,
            4,
            7,
            5,
            3,
            7,
            1,
            10,
            0,
            11,
            0,
            14,
            1,
            16,
            3,
            17,
            6,
            17,
            7,
            16,
            10,
            14,
            12,
            11,
            13,
            10,
            13,
            7,
            12,
            5,
            10,
            4,
            7
        ]
    ],
    '7': [
        20,
        [
            17,
            21,
            7,
            0,
            -1,
            -1,
            3,
            21,
            17,
            21
        ]
    ],
    '8': [
        20,
        [
            8,
            21,
            5,
            20,
            4,
            18,
            4,
            16,
            5,
            14,
            7,
            13,
            11,
            12,
            14,
            11,
            16,
            9,
            17,
            7,
            17,
            4,
            16,
            2,
            15,
            1,
            12,
            0,
            8,
            0,
            5,
            1,
            4,
            2,
            3,
            4,
            3,
            7,
            4,
            9,
            6,
            11,
            9,
            12,
            13,
            13,
            15,
            14,
            16,
            16,
            16,
            18,
            15,
            20,
            12,
            21,
            8,
            21
        ]
    ],
    '9': [
        20,
        [
            16,
            14,
            15,
            11,
            13,
            9,
            10,
            8,
            9,
            8,
            6,
            9,
            4,
            11,
            3,
            14,
            3,
            15,
            4,
            18,
            6,
            20,
            9,
            21,
            10,
            21,
            13,
            20,
            15,
            18,
            16,
            14,
            16,
            9,
            15,
            4,
            13,
            1,
            10,
            0,
            8,
            0,
            5,
            1,
            4,
            3
        ]
    ],
    ':': [
        10,
        [
            5,
            14,
            4,
            13,
            5,
            12,
            6,
            13,
            5,
            14,
            -1,
            -1,
            5,
            2,
            4,
            1,
            5,
            0,
            6,
            1,
            5,
            2
        ]
    ],
    ';': [
        10,
        [
            5,
            14,
            4,
            13,
            5,
            12,
            6,
            13,
            5,
            14,
            -1,
            -1,
            6,
            1,
            5,
            0,
            4,
            1,
            5,
            2,
            6,
            1,
            6,
            -1,
            5,
            -3,
            4,
            -4
        ]
    ],
    '<': [
        24,
        [
            20,
            18,
            4,
            9,
            20,
            0
        ]
    ],
    '=': [
        26,
        [
            4,
            12,
            22,
            12,
            -1,
            -1,
            4,
            6,
            22,
            6
        ]
    ],
    '>': [
        24,
        [
            4,
            18,
            20,
            9,
            4,
            0
        ]
    ],
    '?': [
        18,
        [
            3,
            16,
            3,
            17,
            4,
            19,
            5,
            20,
            7,
            21,
            11,
            21,
            13,
            20,
            14,
            19,
            15,
            17,
            15,
            15,
            14,
            13,
            13,
            12,
            9,
            10,
            9,
            7,
            -1,
            -1,
            9,
            2,
            8,
            1,
            9,
            0,
            10,
            1,
            9,
            2
        ]
    ],
    '@': [
        27,
        [
            18,
            13,
            17,
            15,
            15,
            16,
            12,
            16,
            10,
            15,
            9,
            14,
            8,
            11,
            8,
            8,
            9,
            6,
            11,
            5,
            14,
            5,
            16,
            6,
            17,
            8,
            -1,
            -1,
            12,
            16,
            10,
            14,
            9,
            11,
            9,
            8,
            10,
            6,
            11,
            5,
            -1,
            -1,
            18,
            16,
            17,
            8,
            17,
            6,
            19,
            5,
            21,
            5,
            23,
            7,
            24,
            10,
            24,
            12,
            23,
            15,
            22,
            17,
            20,
            19,
            18,
            20,
            15,
            21,
            12,
            21,
            9,
            20,
            7,
            19,
            5,
            17,
            4,
            15,
            3,
            12,
            3,
            9,
            4,
            6,
            5,
            4,
            7,
            2,
            9,
            1,
            12,
            0,
            15,
            0,
            18,
            1,
            20,
            2,
            21,
            3,
            -1,
            -1,
            19,
            16,
            18,
            8,
            18,
            6,
            19,
            5
        ]
    ],
    'A': [
        18,
        [
            9,
            21,
            1,
            0,
            -1,
            -1,
            9,
            21,
            17,
            0,
            -1,
            -1,
            4,
            7,
            14,
            7
        ]
    ],
    'B': [
        21,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            13,
            21,
            16,
            20,
            17,
            19,
            18,
            17,
            18,
            15,
            17,
            13,
            16,
            12,
            13,
            11,
            -1,
            -1,
            4,
            11,
            13,
            11,
            16,
            10,
            17,
            9,
            18,
            7,
            18,
            4,
            17,
            2,
            16,
            1,
            13,
            0,
            4,
            0
        ]
    ],
    'C': [
        21,
        [
            18,
            16,
            17,
            18,
            15,
            20,
            13,
            21,
            9,
            21,
            7,
            20,
            5,
            18,
            4,
            16,
            3,
            13,
            3,
            8,
            4,
            5,
            5,
            3,
            7,
            1,
            9,
            0,
            13,
            0,
            15,
            1,
            17,
            3,
            18,
            5
        ]
    ],
    'D': [
        21,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            11,
            21,
            14,
            20,
            16,
            18,
            17,
            16,
            18,
            13,
            18,
            8,
            17,
            5,
            16,
            3,
            14,
            1,
            11,
            0,
            4,
            0
        ]
    ],
    'E': [
        19,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            17,
            21,
            -1,
            -1,
            4,
            11,
            12,
            11,
            -1,
            -1,
            4,
            0,
            17,
            0
        ]
    ],
    'F': [
        18,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            17,
            21,
            -1,
            -1,
            4,
            11,
            12,
            11
        ]
    ],
    'G': [
        21,
        [
            18,
            16,
            17,
            18,
            15,
            20,
            13,
            21,
            9,
            21,
            7,
            20,
            5,
            18,
            4,
            16,
            3,
            13,
            3,
            8,
            4,
            5,
            5,
            3,
            7,
            1,
            9,
            0,
            13,
            0,
            15,
            1,
            17,
            3,
            18,
            5,
            18,
            8,
            -1,
            -1,
            13,
            8,
            18,
            8
        ]
    ],
    'H': [
        22,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            18,
            21,
            18,
            0,
            -1,
            -1,
            4,
            11,
            18,
            11
        ]
    ],
    'I': [
        8,
        [
            4,
            21,
            4,
            0
        ]
    ],
    'J': [
        16,
        [
            12,
            21,
            12,
            5,
            11,
            2,
            10,
            1,
            8,
            0,
            6,
            0,
            4,
            1,
            3,
            2,
            2,
            5,
            2,
            7
        ]
    ],
    'K': [
        21,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            18,
            21,
            4,
            7,
            -1,
            -1,
            9,
            12,
            18,
            0
        ]
    ],
    'L': [
        17,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            0,
            16,
            0
        ]
    ],
    'M': [
        24,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            12,
            0,
            -1,
            -1,
            20,
            21,
            12,
            0,
            -1,
            -1,
            20,
            21,
            20,
            0
        ]
    ],
    'N': [
        22,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            18,
            0,
            -1,
            -1,
            18,
            21,
            18,
            0
        ]
    ],
    'O': [
        22,
        [
            9,
            21,
            7,
            20,
            5,
            18,
            4,
            16,
            3,
            13,
            3,
            8,
            4,
            5,
            5,
            3,
            7,
            1,
            9,
            0,
            13,
            0,
            15,
            1,
            17,
            3,
            18,
            5,
            19,
            8,
            19,
            13,
            18,
            16,
            17,
            18,
            15,
            20,
            13,
            21,
            9,
            21
        ]
    ],
    'P': [
        21,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            13,
            21,
            16,
            20,
            17,
            19,
            18,
            17,
            18,
            14,
            17,
            12,
            16,
            11,
            13,
            10,
            4,
            10
        ]
    ],
    'Q': [
        22,
        [
            9,
            21,
            7,
            20,
            5,
            18,
            4,
            16,
            3,
            13,
            3,
            8,
            4,
            5,
            5,
            3,
            7,
            1,
            9,
            0,
            13,
            0,
            15,
            1,
            17,
            3,
            18,
            5,
            19,
            8,
            19,
            13,
            18,
            16,
            17,
            18,
            15,
            20,
            13,
            21,
            9,
            21,
            -1,
            -1,
            12,
            4,
            18,
            -2
        ]
    ],
    'R': [
        21,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            21,
            13,
            21,
            16,
            20,
            17,
            19,
            18,
            17,
            18,
            15,
            17,
            13,
            16,
            12,
            13,
            11,
            4,
            11,
            -1,
            -1,
            11,
            11,
            18,
            0
        ]
    ],
    'S': [
        20,
        [
            17,
            18,
            15,
            20,
            12,
            21,
            8,
            21,
            5,
            20,
            3,
            18,
            3,
            16,
            4,
            14,
            5,
            13,
            7,
            12,
            13,
            10,
            15,
            9,
            16,
            8,
            17,
            6,
            17,
            3,
            15,
            1,
            12,
            0,
            8,
            0,
            5,
            1,
            3,
            3
        ]
    ],
    'T': [
        16,
        [
            8,
            21,
            8,
            0,
            -1,
            -1,
            1,
            21,
            15,
            21
        ]
    ],
    'U': [
        22,
        [
            4,
            21,
            4,
            6,
            5,
            3,
            7,
            1,
            10,
            0,
            12,
            0,
            15,
            1,
            17,
            3,
            18,
            6,
            18,
            21
        ]
    ],
    'V': [
        18,
        [
            1,
            21,
            9,
            0,
            -1,
            -1,
            17,
            21,
            9,
            0
        ]
    ],
    'W': [
        24,
        [
            2,
            21,
            7,
            0,
            -1,
            -1,
            12,
            21,
            7,
            0,
            -1,
            -1,
            12,
            21,
            17,
            0,
            -1,
            -1,
            22,
            21,
            17,
            0
        ]
    ],
    'X': [
        20,
        [
            3,
            21,
            17,
            0,
            -1,
            -1,
            17,
            21,
            3,
            0
        ]
    ],
    'Y': [
        18,
        [
            1,
            21,
            9,
            11,
            9,
            0,
            -1,
            -1,
            17,
            21,
            9,
            11
        ]
    ],
    'Z': [
        20,
        [
            17,
            21,
            3,
            0,
            -1,
            -1,
            3,
            21,
            17,
            21,
            -1,
            -1,
            3,
            0,
            17,
            0
        ]
    ],
    '[': [
        14,
        [
            4,
            25,
            4,
            -7,
            -1,
            -1,
            5,
            25,
            5,
            -7,
            -1,
            -1,
            4,
            25,
            11,
            25,
            -1,
            -1,
            4,
            -7,
            11,
            -7
        ]
    ],
    '\\': [
        14,
        [
            0,
            21,
            14,
            -3
        ]
    ],
    ']': [
        14,
        [
            9,
            25,
            9,
            -7,
            -1,
            -1,
            10,
            25,
            10,
            -7,
            -1,
            -1,
            3,
            25,
            10,
            25,
            -1,
            -1,
            3,
            -7,
            10,
            -7
        ]
    ],
    '^': [
        16,
        [
            6,
            15,
            8,
            18,
            10,
            15,
            -1,
            -1,
            3,
            12,
            8,
            17,
            13,
            12,
            -1,
            -1,
            8,
            17,
            8,
            0
        ]
    ],
    '_': [
        16,
        [
            0,
            -2,
            16,
            -2
        ]
    ],
    '`': [
        10,
        [
            6,
            21,
            5,
            20,
            4,
            18,
            4,
            16,
            5,
            15,
            6,
            16,
            5,
            17
        ]
    ],
    'a': [
        19,
        [
            15,
            14,
            15,
            0,
            -1,
            -1,
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'b': [
        19,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            11,
            6,
            13,
            8,
            14,
            11,
            14,
            13,
            13,
            15,
            11,
            16,
            8,
            16,
            6,
            15,
            3,
            13,
            1,
            11,
            0,
            8,
            0,
            6,
            1,
            4,
            3
        ]
    ],
    'c': [
        18,
        [
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'd': [
        19,
        [
            15,
            21,
            15,
            0,
            -1,
            -1,
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'e': [
        18,
        [
            3,
            8,
            15,
            8,
            15,
            10,
            14,
            12,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'f': [
        12,
        [
            10,
            21,
            8,
            21,
            6,
            20,
            5,
            17,
            5,
            0,
            -1,
            -1,
            2,
            14,
            9,
            14
        ]
    ],
    'g': [
        19,
        [
            15,
            14,
            15,
            -2,
            14,
            -5,
            13,
            -6,
            11,
            -7,
            8,
            -7,
            6,
            -6,
            -1,
            -1,
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'h': [
        19,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            4,
            10,
            7,
            13,
            9,
            14,
            12,
            14,
            14,
            13,
            15,
            10,
            15,
            0
        ]
    ],
    'i': [
        8,
        [
            3,
            21,
            4,
            20,
            5,
            21,
            4,
            22,
            3,
            21,
            -1,
            -1,
            4,
            14,
            4,
            0
        ]
    ],
    'j': [
        10,
        [
            5,
            21,
            6,
            20,
            7,
            21,
            6,
            22,
            5,
            21,
            -1,
            -1,
            6,
            14,
            6,
            -3,
            5,
            -6,
            3,
            -7,
            1,
            -7
        ]
    ],
    'k': [
        17,
        [
            4,
            21,
            4,
            0,
            -1,
            -1,
            14,
            14,
            4,
            4,
            -1,
            -1,
            8,
            8,
            15,
            0
        ]
    ],
    'l': [
        8,
        [
            4,
            21,
            4,
            0
        ]
    ],
    'm': [
        30,
        [
            4,
            14,
            4,
            0,
            -1,
            -1,
            4,
            10,
            7,
            13,
            9,
            14,
            12,
            14,
            14,
            13,
            15,
            10,
            15,
            0,
            -1,
            -1,
            15,
            10,
            18,
            13,
            20,
            14,
            23,
            14,
            25,
            13,
            26,
            10,
            26,
            0
        ]
    ],
    'n': [
        19,
        [
            4,
            14,
            4,
            0,
            -1,
            -1,
            4,
            10,
            7,
            13,
            9,
            14,
            12,
            14,
            14,
            13,
            15,
            10,
            15,
            0
        ]
    ],
    'o': [
        19,
        [
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3,
            16,
            6,
            16,
            8,
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14
        ]
    ],
    'p': [
        19,
        [
            4,
            14,
            4,
            -7,
            -1,
            -1,
            4,
            11,
            6,
            13,
            8,
            14,
            11,
            14,
            13,
            13,
            15,
            11,
            16,
            8,
            16,
            6,
            15,
            3,
            13,
            1,
            11,
            0,
            8,
            0,
            6,
            1,
            4,
            3
        ]
    ],
    'q': [
        19,
        [
            15,
            14,
            15,
            -7,
            -1,
            -1,
            15,
            11,
            13,
            13,
            11,
            14,
            8,
            14,
            6,
            13,
            4,
            11,
            3,
            8,
            3,
            6,
            4,
            3,
            6,
            1,
            8,
            0,
            11,
            0,
            13,
            1,
            15,
            3
        ]
    ],
    'r': [
        13,
        [
            4,
            14,
            4,
            0,
            -1,
            -1,
            4,
            8,
            5,
            11,
            7,
            13,
            9,
            14,
            12,
            14
        ]
    ],
    's': [
        17,
        [
            14,
            11,
            13,
            13,
            10,
            14,
            7,
            14,
            4,
            13,
            3,
            11,
            4,
            9,
            6,
            8,
            11,
            7,
            13,
            6,
            14,
            4,
            14,
            3,
            13,
            1,
            10,
            0,
            7,
            0,
            4,
            1,
            3,
            3
        ]
    ],
    't': [
        12,
        [
            5,
            21,
            5,
            4,
            6,
            1,
            8,
            0,
            10,
            0,
            -1,
            -1,
            2,
            14,
            9,
            14
        ]
    ],
    'u': [
        19,
        [
            4,
            14,
            4,
            4,
            5,
            1,
            7,
            0,
            10,
            0,
            12,
            1,
            15,
            4,
            -1,
            -1,
            15,
            14,
            15,
            0
        ]
    ],
    'v': [
        16,
        [
            2,
            14,
            8,
            0,
            -1,
            -1,
            14,
            14,
            8,
            0
        ]
    ],
    'w': [
        22,
        [
            3,
            14,
            7,
            0,
            -1,
            -1,
            11,
            14,
            7,
            0,
            -1,
            -1,
            11,
            14,
            15,
            0,
            -1,
            -1,
            19,
            14,
            15,
            0
        ]
    ],
    'x': [
        17,
        [
            3,
            14,
            14,
            0,
            -1,
            -1,
            14,
            14,
            3,
            0
        ]
    ],
    'y': [
        16,
        [
            2,
            14,
            8,
            0,
            -1,
            -1,
            14,
            14,
            8,
            0,
            6,
            -4,
            4,
            -6,
            2,
            -7,
            1,
            -7
        ]
    ],
    'z': [
        17,
        [
            14,
            14,
            3,
            0,
            -1,
            -1,
            3,
            14,
            14,
            14,
            -1,
            -1,
            3,
            0,
            14,
            0
        ]
    ],
    '{': [
        14,
        [
            9,
            25,
            7,
            24,
            6,
            23,
            5,
            21,
            5,
            19,
            6,
            17,
            7,
            16,
            8,
            14,
            8,
            12,
            6,
            10,
            -1,
            -1,
            7,
            24,
            6,
            22,
            6,
            20,
            7,
            18,
            8,
            17,
            9,
            15,
            9,
            13,
            8,
            11,
            4,
            9,
            8,
            7,
            9,
            5,
            9,
            3,
            8,
            1,
            7,
            0,
            6,
            -2,
            6,
            -4,
            7,
            -6,
            -1,
            -1,
            6,
            8,
            8,
            6,
            8,
            4,
            7,
            2,
            6,
            1,
            5,
            -1,
            5,
            -3,
            6,
            -5,
            7,
            -6,
            9,
            -7
        ]
    ],
    '|': [
        8,
        [
            4,
            25,
            4,
            -7
        ]
    ],
    '}': [
        14,
        [
            5,
            25,
            7,
            24,
            8,
            23,
            9,
            21,
            9,
            19,
            8,
            17,
            7,
            16,
            6,
            14,
            6,
            12,
            8,
            10,
            -1,
            -1,
            7,
            24,
            8,
            22,
            8,
            20,
            7,
            18,
            6,
            17,
            5,
            15,
            5,
            13,
            6,
            11,
            10,
            9,
            6,
            7,
            5,
            5,
            5,
            3,
            6,
            1,
            7,
            0,
            8,
            -2,
            8,
            -4,
            7,
            -6,
            -1,
            -1,
            8,
            8,
            6,
            6,
            6,
            4,
            7,
            2,
            8,
            1,
            9,
            -1,
            9,
            -3,
            8,
            -5,
            7,
            -6,
            5,
            -7
        ]
    ],
    '~': [
        24,
        [
            3,
            6,
            3,
            8,
            4,
            11,
            6,
            12,
            8,
            12,
            10,
            11,
            14,
            8,
            16,
            7,
            18,
            7,
            20,
            8,
            21,
            10,
            -1,
            -1,
            3,
            8,
            4,
            10,
            6,
            11,
            8,
            11,
            10,
            10,
            14,
            7,
            16,
            6,
            18,
            6,
            20,
            7,
            21,
            10,
            21,
            12
        ]
    ]
};
module.exports = function textVertices(text, left, baseline, scale) {
    scale = scale || 1;
    var strokes = [];
    var i, len, j, len2, glyph, x, y, prev;
    for (i = 0, len = text.length; i < len; i++) {
        glyph = simplexFont[text[i]];
        if (!glyph)
            continue;
        prev = null;
        for (j = 0, len2 = glyph[1].length; j < len2; j += 2) {
            if (glyph[1][j] === -1 && glyph[1][j + 1] === -1) {
                prev = null;
            } else {
                x = left + glyph[1][j] * scale;
                y = baseline - glyph[1][j + 1] * scale;
                if (prev) {
                    strokes.push(prev.x, prev.y, x, y);
                }
                prev = {
                    x: x,
                    y: y
                };
            }
        }
        left += glyph[0] * scale;
    }
    return strokes;
};
},{}],94:[function(require,module,exports){
'use strict';
var browser = require('./util/browser');
var mapboxgl = module.exports = {};
mapboxgl.version = require('../package.json').version;
mapboxgl.workerCount = Math.max(Math.floor(browser.hardwareConcurrency / 2), 1);
mapboxgl.Map = require('./ui/map');
mapboxgl.NavigationControl = require('./ui/control/navigation_control');
mapboxgl.GeolocateControl = require('./ui/control/geolocate_control');
mapboxgl.AttributionControl = require('./ui/control/attribution_control');
mapboxgl.ScaleControl = require('./ui/control/scale_control');
mapboxgl.Popup = require('./ui/popup');
mapboxgl.Marker = require('./ui/marker');
mapboxgl.Style = require('./style/style');
mapboxgl.LngLat = require('./geo/lng_lat');
mapboxgl.LngLatBounds = require('./geo/lng_lat_bounds');
mapboxgl.Point = require('point-geometry');
mapboxgl.Evented = require('./util/evented');
mapboxgl.util = require('./util/util');
mapboxgl.supported = require('./util/browser').supported;
var ajax = require('./util/ajax');
mapboxgl.util.getJSON = ajax.getJSON;
mapboxgl.util.getArrayBuffer = ajax.getArrayBuffer;
var config = require('./util/config');
mapboxgl.config = config;
Object.defineProperty(mapboxgl, 'accessToken', {
    get: function () {
        return config.ACCESS_TOKEN;
    },
    set: function (token) {
        config.ACCESS_TOKEN = token;
    }
});
},{"../package.json":201,"./geo/lng_lat":89,"./geo/lng_lat_bounds":90,"./style/style":131,"./ui/control/attribution_control":161,"./ui/control/geolocate_control":162,"./ui/control/navigation_control":163,"./ui/control/scale_control":164,"./ui/map":173,"./ui/marker":174,"./ui/popup":175,"./util/ajax":177,"./util/browser":178,"./util/config":182,"./util/evented":186,"./util/util":197,"point-geometry":204}],95:[function(require,module,exports){
'use strict';
var pattern = require('./pattern');
module.exports = drawBackground;
function drawBackground(painter, sourceCache, layer) {
    var gl = painter.gl;
    var transform = painter.transform;
    var tileSize = transform.tileSize;
    var color = layer.paint['background-color'];
    var image = layer.paint['background-pattern'];
    var opacity = layer.paint['background-opacity'];
    var isOpaque = !image && color[3] === 1 && opacity === 1;
    if (painter.isOpaquePass !== isOpaque)
        return;
    gl.disable(gl.STENCIL_TEST);
    painter.setDepthSublayer(0);
    var program;
    if (image) {
        program = painter.useProgram('fillPattern', painter.basicFillProgramConfiguration);
        pattern.prepare(image, painter, program);
        painter.tileExtentPatternVAO.bind(gl, program, painter.tileExtentBuffer);
    } else {
        program = painter.useProgram('fill', painter.basicFillProgramConfiguration);
        gl.uniform4fv(program.u_color, color);
        painter.tileExtentVAO.bind(gl, program, painter.tileExtentBuffer);
    }
    gl.uniform1f(program.u_opacity, opacity);
    var coords = transform.coveringTiles({ tileSize: tileSize });
    for (var i = 0, list = coords; i < list.length; i += 1) {
        var coord = list[i];
        if (image) {
            pattern.setTile({
                coord: coord,
                tileSize: tileSize
            }, painter, program);
        }
        gl.uniformMatrix4fv(program.u_matrix, false, painter.transform.calculatePosMatrix(coord));
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, painter.tileExtentBuffer.length);
    }
}
},{"./pattern":107}],96:[function(require,module,exports){
'use strict';
var browser = require('../util/browser');
module.exports = drawCircles;
function drawCircles(painter, sourceCache, layer, coords) {
    if (painter.isOpaquePass)
        return;
    var gl = painter.gl;
    painter.setDepthSublayer(0);
    painter.depthMask(false);
    gl.disable(gl.STENCIL_TEST);
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i];
        var tile = sourceCache.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket)
            continue;
        var buffers = bucket.buffers;
        var layerData = buffers.layerData[layer.id];
        var programConfiguration = layerData.programConfiguration;
        var program = painter.useProgram('circle', programConfiguration);
        programConfiguration.setUniforms(gl, program, layer, { zoom: painter.transform.zoom });
        if (layer.paint['circle-pitch-scale'] === 'map') {
            gl.uniform1i(program.u_scale_with_map, true);
            gl.uniform2f(program.u_extrude_scale, painter.transform.pixelsToGLUnits[0] * painter.transform.cameraToCenterDistance, painter.transform.pixelsToGLUnits[1] * painter.transform.cameraToCenterDistance);
        } else {
            gl.uniform1i(program.u_scale_with_map, false);
            gl.uniform2fv(program.u_extrude_scale, painter.transform.pixelsToGLUnits);
        }
        gl.uniform1f(program.u_devicepixelratio, browser.devicePixelRatio);
        gl.uniformMatrix4fv(program.u_matrix, false, painter.translatePosMatrix(coord.posMatrix, tile, layer.paint['circle-translate'], layer.paint['circle-translate-anchor']));
        for (var i$1 = 0, list = buffers.segments; i$1 < list.length; i$1 += 1) {
            var segment = list[i$1];
            segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, layerData.paintVertexBuffer, segment.vertexOffset);
            gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
        }
    }
}
},{"../util/browser":178}],97:[function(require,module,exports){
'use strict';
module.exports = drawCollisionDebug;
function drawCollisionDebug(painter, sourceCache, layer, coords) {
    var gl = painter.gl;
    gl.enable(gl.STENCIL_TEST);
    var program = painter.useProgram('collisionBox');
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i];
        var tile = sourceCache.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket)
            continue;
        var buffers = bucket.buffers.collisionBox;
        if (!buffers)
            continue;
        gl.uniformMatrix4fv(program.u_matrix, false, coord.posMatrix);
        painter.enableTileClippingMask(coord);
        painter.lineWidth(1);
        gl.uniform1f(program.u_scale, Math.pow(2, painter.transform.zoom - tile.coord.z));
        gl.uniform1f(program.u_zoom, painter.transform.zoom * 10);
        gl.uniform1f(program.u_maxzoom, (tile.coord.z + 1) * 10);
        for (var i$1 = 0, list = buffers.segments; i$1 < list.length; i$1 += 1) {
            var segment = list[i$1];
            segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, null, segment.vertexOffset);
            gl.drawElements(gl.LINES, segment.primitiveLength * 2, gl.UNSIGNED_SHORT, segment.primitiveOffset * 2 * 2);
        }
    }
}
},{}],98:[function(require,module,exports){
'use strict';
var textVertices = require('../lib/debugtext');
var browser = require('../util/browser');
var mat4 = require('@mapbox/gl-matrix').mat4;
var EXTENT = require('../data/extent');
var Buffer = require('../data/buffer');
var VertexArrayObject = require('./vertex_array_object');
var PosArray = require('../data/pos_array');
module.exports = drawDebug;
function drawDebug(painter, sourceCache, coords) {
    for (var i = 0; i < coords.length; i++) {
        drawDebugTile(painter, sourceCache, coords[i]);
    }
}
function drawDebugTile(painter, sourceCache, coord) {
    var gl = painter.gl;
    gl.disable(gl.STENCIL_TEST);
    painter.lineWidth(1 * browser.devicePixelRatio);
    var posMatrix = coord.posMatrix;
    var program = painter.useProgram('debug');
    gl.uniformMatrix4fv(program.u_matrix, false, posMatrix);
    gl.uniform4f(program.u_color, 1, 0, 0, 1);
    painter.debugVAO.bind(gl, program, painter.debugBuffer);
    gl.drawArrays(gl.LINE_STRIP, 0, painter.debugBuffer.length);
    var vertices = textVertices(coord.toString(), 50, 200, 5);
    var debugTextArray = new PosArray();
    for (var v = 0; v < vertices.length; v += 2) {
        debugTextArray.emplaceBack(vertices[v], vertices[v + 1]);
    }
    var debugTextBuffer = Buffer.fromStructArray(debugTextArray, Buffer.BufferType.VERTEX);
    var debugTextVAO = new VertexArrayObject();
    debugTextVAO.bind(gl, program, debugTextBuffer);
    gl.uniform4f(program.u_color, 1, 1, 1, 1);
    var tileSize = sourceCache.getTile(coord).tileSize;
    var onePixel = EXTENT / (Math.pow(2, painter.transform.zoom - coord.z) * tileSize);
    var translations = [
        [
            -1,
            -1
        ],
        [
            -1,
            1
        ],
        [
            1,
            -1
        ],
        [
            1,
            1
        ]
    ];
    for (var i = 0; i < translations.length; i++) {
        var translation = translations[i];
        gl.uniformMatrix4fv(program.u_matrix, false, mat4.translate([], posMatrix, [
            onePixel * translation[0],
            onePixel * translation[1],
            0
        ]));
        gl.drawArrays(gl.LINES, 0, debugTextBuffer.length);
    }
    gl.uniform4f(program.u_color, 0, 0, 0, 1);
    gl.uniformMatrix4fv(program.u_matrix, false, posMatrix);
    gl.drawArrays(gl.LINES, 0, debugTextBuffer.length);
}
},{"../data/buffer":78,"../data/extent":81,"../data/pos_array":84,"../lib/debugtext":93,"../util/browser":178,"./vertex_array_object":109,"@mapbox/gl-matrix":7}],99:[function(require,module,exports){
'use strict';
var pattern = require('./pattern');
module.exports = drawFill;
function drawFill(painter, sourceCache, layer, coords) {
    var gl = painter.gl;
    gl.enable(gl.STENCIL_TEST);
    var isOpaque = !layer.paint['fill-pattern'] && layer.isPaintValueFeatureConstant('fill-color') && layer.isPaintValueFeatureConstant('fill-opacity') && layer.paint['fill-color'][3] === 1 && layer.paint['fill-opacity'] === 1;
    if (painter.isOpaquePass === isOpaque) {
        painter.setDepthSublayer(1);
        drawFillTiles(painter, sourceCache, layer, coords, drawFillTile);
    }
    if (!painter.isOpaquePass && layer.paint['fill-antialias']) {
        painter.lineWidth(2);
        painter.depthMask(false);
        painter.setDepthSublayer(layer.getPaintProperty('fill-outline-color') ? 2 : 0);
        drawFillTiles(painter, sourceCache, layer, coords, drawStrokeTile);
    }
}
function drawFillTiles(painter, sourceCache, layer, coords, drawFn) {
    var firstTile = true;
    for (var i = 0, list = coords; i < list.length; i += 1) {
        var coord = list[i];
        var tile = sourceCache.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket)
            continue;
        painter.enableTileClippingMask(coord);
        drawFn(painter, sourceCache, layer, tile, coord, bucket.buffers, firstTile);
        firstTile = false;
    }
}
function drawFillTile(painter, sourceCache, layer, tile, coord, buffers, firstTile) {
    var gl = painter.gl;
    var layerData = buffers.layerData[layer.id];
    var program = setFillProgram('fill', layer.paint['fill-pattern'], painter, layerData, layer, tile, coord, firstTile);
    for (var i = 0, list = buffers.segments; i < list.length; i += 1) {
        var segment = list[i];
        segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, layerData.paintVertexBuffer, segment.vertexOffset);
        gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
    }
}
function drawStrokeTile(painter, sourceCache, layer, tile, coord, buffers, firstTile) {
    var gl = painter.gl;
    var layerData = buffers.layerData[layer.id];
    var usePattern = layer.paint['fill-pattern'] && !layer.getPaintProperty('fill-outline-color');
    var program = setFillProgram('fillOutline', usePattern, painter, layerData, layer, tile, coord, firstTile);
    gl.uniform2f(program.u_world, gl.drawingBufferWidth, gl.drawingBufferHeight);
    for (var i = 0, list = buffers.segments2; i < list.length; i += 1) {
        var segment = list[i];
        segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer2, layerData.paintVertexBuffer, segment.vertexOffset);
        gl.drawElements(gl.LINES, segment.primitiveLength * 2, gl.UNSIGNED_SHORT, segment.primitiveOffset * 2 * 2);
    }
}
function setFillProgram(programId, usePattern, painter, layerData, layer, tile, coord, firstTile) {
    var program;
    var prevProgram = painter.currentProgram;
    if (!usePattern) {
        program = painter.useProgram(programId, layerData.programConfiguration);
        if (firstTile || program !== prevProgram) {
            layerData.programConfiguration.setUniforms(painter.gl, program, layer, { zoom: painter.transform.zoom });
        }
    } else {
        program = painter.useProgram(programId + 'Pattern', layerData.programConfiguration);
        if (firstTile || program !== prevProgram) {
            layerData.programConfiguration.setUniforms(painter.gl, program, layer, { zoom: painter.transform.zoom });
            pattern.prepare(layer.paint['fill-pattern'], painter, program);
        }
        pattern.setTile(tile, painter, program);
    }
    painter.gl.uniformMatrix4fv(program.u_matrix, false, painter.translatePosMatrix(coord.posMatrix, tile, layer.paint['fill-translate'], layer.paint['fill-translate-anchor']));
    return program;
}
},{"./pattern":107}],100:[function(require,module,exports){
'use strict';
var glMatrix = require('@mapbox/gl-matrix');
var Buffer = require('../data/buffer');
var VertexArrayObject = require('./vertex_array_object');
var PosArray = require('../data/pos_array');
var pattern = require('./pattern');
var mat3 = glMatrix.mat3;
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;
module.exports = draw;
function draw(painter, source, layer, coords) {
    if (layer.paint['fill-extrusion-opacity'] === 0)
        return;
    var gl = painter.gl;
    gl.disable(gl.STENCIL_TEST);
    gl.enable(gl.DEPTH_TEST);
    painter.depthMask(true);
    var texture = new ExtrusionTexture(gl, painter, layer);
    texture.bindFramebuffer();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < coords.length; i++) {
        drawExtrusion(painter, source, layer, coords[i]);
    }
    texture.unbindFramebuffer();
    texture.renderToMap();
}
function ExtrusionTexture(gl, painter, layer) {
    this.gl = gl;
    this.width = painter.width;
    this.height = painter.height;
    this.painter = painter;
    this.layer = layer;
    this.texture = null;
    this.fbo = null;
    this.fbos = this.painter.preFbos[this.width] && this.painter.preFbos[this.width][this.height];
}
ExtrusionTexture.prototype.bindFramebuffer = function () {
    var gl = this.gl;
    this.texture = this.painter.getViewportTexture(this.width, this.height);
    gl.activeTexture(gl.TEXTURE1);
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        this.texture.width = this.width;
        this.texture.height = this.height;
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    if (!this.fbos) {
        this.fbo = gl.createFramebuffer();
        var stencil = gl.createRenderbuffer();
        var depthRenderBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, stencil);
        gl.bindRenderbuffer(gl.RENDERBUFFER, depthRenderBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.RGBA4, this.width, this.height);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, this.width, this.height);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.RENDERBUFFER, stencil);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, depthRenderBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    } else {
        this.fbo = this.fbos.pop();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
    }
};
ExtrusionTexture.prototype.unbindFramebuffer = function () {
    this.painter.bindDefaultFramebuffer();
    if (this.fbos) {
        this.fbos.push(this.fbo);
    } else {
        if (!this.painter.preFbos[this.width])
            this.painter.preFbos[this.width] = {};
        this.painter.preFbos[this.width][this.height] = [this.fbo];
    }
    this.painter.saveViewportTexture(this.texture);
};
ExtrusionTexture.prototype.renderToMap = function () {
    var gl = this.gl;
    var painter = this.painter;
    var program = painter.useProgram('extrusionTexture');
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1f(program.u_opacity, this.layer.paint['fill-extrusion-opacity']);
    gl.uniform1i(program.u_texture, 1);
    gl.uniformMatrix4fv(program.u_matrix, false, mat4.ortho(mat4.create(), 0, painter.width, painter.height, 0, 0, 1));
    gl.disable(gl.DEPTH_TEST);
    gl.uniform1i(program.u_xdim, painter.width);
    gl.uniform1i(program.u_ydim, painter.height);
    var array = new PosArray();
    array.emplaceBack(0, 0);
    array.emplaceBack(painter.width, 0);
    array.emplaceBack(0, painter.height);
    array.emplaceBack(painter.width, painter.height);
    var buffer = Buffer.fromStructArray(array, Buffer.BufferType.VERTEX);
    var vao = new VertexArrayObject();
    vao.bind(gl, program, buffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    gl.enable(gl.DEPTH_TEST);
};
function drawExtrusion(painter, source, layer, coord) {
    if (painter.isOpaquePass)
        return;
    var tile = source.getTile(coord);
    var bucket = tile.getBucket(layer);
    if (!bucket)
        return;
    var buffers = bucket.buffers;
    var gl = painter.gl;
    var image = layer.paint['fill-extrusion-pattern'];
    var layerData = buffers.layerData[layer.id];
    var programConfiguration = layerData.programConfiguration;
    var program = painter.useProgram(image ? 'fillExtrusionPattern' : 'fillExtrusion', programConfiguration);
    programConfiguration.setUniforms(gl, program, layer, { zoom: painter.transform.zoom });
    if (image) {
        pattern.prepare(image, painter, program);
        pattern.setTile(tile, painter, program);
        gl.uniform1f(program.u_height_factor, -Math.pow(2, coord.z) / tile.tileSize / 8);
    }
    painter.gl.uniformMatrix4fv(program.u_matrix, false, painter.translatePosMatrix(coord.posMatrix, tile, layer.paint['fill-extrusion-translate'], layer.paint['fill-extrusion-translate-anchor']));
    setLight(program, painter);
    for (var i = 0, list = buffers.segments; i < list.length; i += 1) {
        var segment = list[i];
        segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, layerData.paintVertexBuffer, segment.vertexOffset);
        gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
    }
}
function setLight(program, painter) {
    var gl = painter.gl;
    var light = painter.style.light;
    var _lp = light.calculated.position, lightPos = [
            _lp.x,
            _lp.y,
            _lp.z
        ];
    var lightMat = mat3.create();
    if (light.calculated.anchor === 'viewport')
        mat3.fromRotation(lightMat, -painter.transform.angle);
    vec3.transformMat3(lightPos, lightPos, lightMat);
    gl.uniform3fv(program.u_lightpos, lightPos);
    gl.uniform1f(program.u_lightintensity, light.calculated.intensity);
    gl.uniform3fv(program.u_lightcolor, light.calculated.color.slice(0, 3));
}
},{"../data/buffer":78,"../data/pos_array":84,"./pattern":107,"./vertex_array_object":109,"@mapbox/gl-matrix":7}],101:[function(require,module,exports){
'use strict';
var browser = require('../util/browser');
var pixelsToTileUnits = require('../source/pixels_to_tile_units');
module.exports = function drawLine(painter, sourceCache, layer, coords) {
    if (painter.isOpaquePass)
        return;
    painter.setDepthSublayer(0);
    painter.depthMask(false);
    var gl = painter.gl;
    gl.enable(gl.STENCIL_TEST);
    if (layer.paint['line-width'] <= 0)
        return;
    var programId = layer.paint['line-dasharray'] ? 'lineSDF' : layer.paint['line-pattern'] ? 'linePattern' : 'line';
    var prevTileZoom;
    var firstTile = true;
    for (var i = 0, list = coords; i < list.length; i += 1) {
        var coord = list[i];
        var tile = sourceCache.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket)
            continue;
        var layerData = bucket.buffers.layerData[layer.id];
        var prevProgram = painter.currentProgram;
        var program = painter.useProgram(programId, layerData.programConfiguration);
        var programChanged = firstTile || program !== prevProgram;
        var tileRatioChanged = prevTileZoom !== tile.coord.z;
        if (programChanged) {
            layerData.programConfiguration.setUniforms(painter.gl, program, layer, { zoom: painter.transform.zoom });
        }
        drawLineTile(program, painter, tile, bucket.buffers, layer, coord, layerData, programChanged, tileRatioChanged);
        prevTileZoom = tile.coord.z;
        firstTile = false;
    }
};
function drawLineTile(program, painter, tile, buffers, layer, coord, layerData, programChanged, tileRatioChanged) {
    var gl = painter.gl;
    var dasharray = layer.paint['line-dasharray'];
    var image = layer.paint['line-pattern'];
    var posA, posB, imagePosA, imagePosB;
    if (programChanged || tileRatioChanged) {
        var tileRatio = 1 / pixelsToTileUnits(tile, 1, painter.transform.tileZoom);
        if (dasharray) {
            posA = painter.lineAtlas.getDash(dasharray.from, layer.layout['line-cap'] === 'round');
            posB = painter.lineAtlas.getDash(dasharray.to, layer.layout['line-cap'] === 'round');
            var widthA = posA.width * dasharray.fromScale;
            var widthB = posB.width * dasharray.toScale;
            gl.uniform2f(program.u_patternscale_a, tileRatio / widthA, -posA.height / 2);
            gl.uniform2f(program.u_patternscale_b, tileRatio / widthB, -posB.height / 2);
            gl.uniform1f(program.u_sdfgamma, painter.lineAtlas.width / (Math.min(widthA, widthB) * 256 * browser.devicePixelRatio) / 2);
        } else if (image) {
            imagePosA = painter.spriteAtlas.getPosition(image.from, true);
            imagePosB = painter.spriteAtlas.getPosition(image.to, true);
            if (!imagePosA || !imagePosB)
                return;
            gl.uniform2f(program.u_pattern_size_a, imagePosA.size[0] * image.fromScale / tileRatio, imagePosB.size[1]);
            gl.uniform2f(program.u_pattern_size_b, imagePosB.size[0] * image.toScale / tileRatio, imagePosB.size[1]);
        }
        gl.uniform2f(program.u_gl_units_to_pixels, 1 / painter.transform.pixelsToGLUnits[0], 1 / painter.transform.pixelsToGLUnits[1]);
    }
    if (programChanged) {
        if (dasharray) {
            gl.uniform1i(program.u_image, 0);
            gl.activeTexture(gl.TEXTURE0);
            painter.lineAtlas.bind(gl);
            gl.uniform1f(program.u_tex_y_a, posA.y);
            gl.uniform1f(program.u_tex_y_b, posB.y);
            gl.uniform1f(program.u_mix, dasharray.t);
        } else if (image) {
            gl.uniform1i(program.u_image, 0);
            gl.activeTexture(gl.TEXTURE0);
            painter.spriteAtlas.bind(gl, true);
            gl.uniform2fv(program.u_pattern_tl_a, imagePosA.tl);
            gl.uniform2fv(program.u_pattern_br_a, imagePosA.br);
            gl.uniform2fv(program.u_pattern_tl_b, imagePosB.tl);
            gl.uniform2fv(program.u_pattern_br_b, imagePosB.br);
            gl.uniform1f(program.u_fade, image.t);
        }
        gl.uniform1f(program.u_width, layer.paint['line-width']);
    }
    painter.enableTileClippingMask(coord);
    var posMatrix = painter.translatePosMatrix(coord.posMatrix, tile, layer.paint['line-translate'], layer.paint['line-translate-anchor']);
    gl.uniformMatrix4fv(program.u_matrix, false, posMatrix);
    gl.uniform1f(program.u_ratio, 1 / pixelsToTileUnits(tile, 1, painter.transform.zoom));
    for (var i = 0, list = buffers.segments; i < list.length; i += 1) {
        var segment = list[i];
        segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, layerData.paintVertexBuffer, segment.vertexOffset);
        gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
    }
}
},{"../source/pixels_to_tile_units":115,"../util/browser":178}],102:[function(require,module,exports){
'use strict';
var util = require('../util/util');
module.exports = drawRaster;
function drawRaster(painter, sourceCache, layer, coords) {
    if (painter.isOpaquePass)
        return;
    var gl = painter.gl;
    gl.enable(gl.DEPTH_TEST);
    painter.depthMask(true);
    gl.depthFunc(gl.LESS);
    var minTileZ = coords.length && coords[0].z;
    for (var i = 0; i < coords.length; i++) {
        var coord = coords[i];
        painter.setDepthSublayer(coord.z - minTileZ);
        drawRasterTile(painter, sourceCache, layer, coord);
    }
    gl.depthFunc(gl.LEQUAL);
}
function drawRasterTile(painter, sourceCache, layer, coord) {
    var gl = painter.gl;
    gl.disable(gl.STENCIL_TEST);
    var tile = sourceCache.getTile(coord);
    var posMatrix = painter.transform.calculatePosMatrix(coord, sourceCache.getSource().maxzoom);
    tile.registerFadeDuration(painter.style.animationLoop, layer.paint['raster-fade-duration']);
    var program = painter.useProgram('raster');
    gl.uniformMatrix4fv(program.u_matrix, false, posMatrix);
    gl.uniform1f(program.u_brightness_low, layer.paint['raster-brightness-min']);
    gl.uniform1f(program.u_brightness_high, layer.paint['raster-brightness-max']);
    gl.uniform1f(program.u_saturation_factor, saturationFactor(layer.paint['raster-saturation']));
    gl.uniform1f(program.u_contrast_factor, contrastFactor(layer.paint['raster-contrast']));
    gl.uniform3fv(program.u_spin_weights, spinWeights(layer.paint['raster-hue-rotate']));
    var parentTile = tile.sourceCache && tile.sourceCache.findLoadedParent(coord, 0, {}), fade = getFadeValues(tile, parentTile, layer, painter.transform);
    var parentScaleBy, parentTL;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tile.texture);
    gl.activeTexture(gl.TEXTURE1);
    if (parentTile) {
        gl.bindTexture(gl.TEXTURE_2D, parentTile.texture);
        parentScaleBy = Math.pow(2, parentTile.coord.z - tile.coord.z);
        parentTL = [
            tile.coord.x * parentScaleBy % 1,
            tile.coord.y * parentScaleBy % 1
        ];
    } else {
        gl.bindTexture(gl.TEXTURE_2D, tile.texture);
    }
    gl.uniform2fv(program.u_tl_parent, parentTL || [
        0,
        0
    ]);
    gl.uniform1f(program.u_scale_parent, parentScaleBy || 1);
    gl.uniform1f(program.u_buffer_scale, 1);
    gl.uniform1f(program.u_fade_t, fade.mix);
    gl.uniform1f(program.u_opacity, fade.opacity * layer.paint['raster-opacity']);
    gl.uniform1i(program.u_image0, 0);
    gl.uniform1i(program.u_image1, 1);
    var buffer = tile.boundsBuffer || painter.rasterBoundsBuffer;
    var vao = tile.boundsVAO || painter.rasterBoundsVAO;
    vao.bind(gl, program, buffer);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, buffer.length);
}
function spinWeights(angle) {
    angle *= Math.PI / 180;
    var s = Math.sin(angle);
    var c = Math.cos(angle);
    return [
        (2 * c + 1) / 3,
        (-Math.sqrt(3) * s - c + 1) / 3,
        (Math.sqrt(3) * s - c + 1) / 3
    ];
}
function contrastFactor(contrast) {
    return contrast > 0 ? 1 / (1 - contrast) : 1 + contrast;
}
function saturationFactor(saturation) {
    return saturation > 0 ? 1 - 1 / (1.001 - saturation) : -saturation;
}
function getFadeValues(tile, parentTile, layer, transform) {
    var fadeDuration = layer.paint['raster-fade-duration'];
    if (tile.sourceCache && fadeDuration > 0) {
        var now = Date.now();
        var sinceTile = (now - tile.timeAdded) / fadeDuration;
        var sinceParent = parentTile ? (now - parentTile.timeAdded) / fadeDuration : -1;
        var source = tile.sourceCache.getSource();
        var idealZ = transform.coveringZoomLevel({
            tileSize: source.tileSize,
            roundZoom: source.roundZoom
        });
        var fadeIn = !parentTile || Math.abs(parentTile.coord.z - idealZ) > Math.abs(tile.coord.z - idealZ);
        var childOpacity = util.clamp(fadeIn ? sinceTile : 1 - sinceParent, 0, 1);
        if (parentTile) {
            return {
                opacity: 1,
                mix: 1 - childOpacity
            };
        } else {
            return {
                opacity: childOpacity,
                mix: 0
            };
        }
    } else {
        return {
            opacity: 1,
            mix: 0
        };
    }
}
},{"../util/util":197}],103:[function(require,module,exports){
'use strict';
var browser = require('../util/browser');
var drawCollisionDebug = require('./draw_collision_debug');
var pixelsToTileUnits = require('../source/pixels_to_tile_units');
module.exports = drawSymbols;
var sdfPx = 8;
var blurOffset = 1.19;
var haloOffset = 6;
var gamma = 0.105 / browser.devicePixelRatio;
function drawSymbols(painter, sourceCache, layer, coords) {
    if (painter.isOpaquePass)
        return;
    var drawAcrossEdges = !layer.layout['text-allow-overlap'] && !layer.layout['icon-allow-overlap'] && !layer.layout['text-ignore-placement'] && !layer.layout['icon-ignore-placement'];
    var gl = painter.gl;
    if (drawAcrossEdges) {
        gl.disable(gl.STENCIL_TEST);
    } else {
        gl.enable(gl.STENCIL_TEST);
    }
    painter.setDepthSublayer(0);
    painter.depthMask(false);
    drawLayerSymbols(painter, sourceCache, layer, coords, false, layer.paint['icon-translate'], layer.paint['icon-translate-anchor'], layer.layout['icon-rotation-alignment'], layer.layout['icon-rotation-alignment'], layer.layout['icon-size'], layer.paint['icon-halo-width'], layer.paint['icon-halo-color'], layer.paint['icon-halo-blur'], layer.paint['icon-opacity'], layer.paint['icon-color']);
    drawLayerSymbols(painter, sourceCache, layer, coords, true, layer.paint['text-translate'], layer.paint['text-translate-anchor'], layer.layout['text-rotation-alignment'], layer.layout['text-pitch-alignment'], layer.layout['text-size'], layer.paint['text-halo-width'], layer.paint['text-halo-color'], layer.paint['text-halo-blur'], layer.paint['text-opacity'], layer.paint['text-color']);
    if (sourceCache.map.showCollisionBoxes) {
        drawCollisionDebug(painter, sourceCache, layer, coords);
    }
}
function drawLayerSymbols(painter, sourceCache, layer, coords, isText, translate, translateAnchor, rotationAlignment, pitchAlignment, size, haloWidth, haloColor, haloBlur, opacity, color) {
    if (!isText && painter.style.sprite && !painter.style.sprite.loaded())
        return;
    var gl = painter.gl;
    var rotateWithMap = rotationAlignment === 'map';
    var pitchWithMap = pitchAlignment === 'map';
    var depthOn = pitchWithMap;
    if (depthOn) {
        gl.enable(gl.DEPTH_TEST);
    } else {
        gl.disable(gl.DEPTH_TEST);
    }
    var program;
    for (var i = 0, list = coords; i < list.length; i += 1) {
        var coord = list[i];
        var tile = sourceCache.getTile(coord);
        var bucket = tile.getBucket(layer);
        if (!bucket)
            continue;
        var buffers = isText ? bucket.buffers.glyph : bucket.buffers.icon;
        if (!buffers || !buffers.segments.length)
            continue;
        var isSDF = isText || bucket.sdfIcons;
        if (!program) {
            program = painter.useProgram(isSDF ? 'symbolSDF' : 'symbolIcon');
            setSymbolDrawState(program, painter, isText, isSDF, rotateWithMap, pitchWithMap, bucket.fontstack, size, bucket.iconsNeedLinear, isText ? bucket.adjustedTextSize : bucket.adjustedIconSize, opacity);
        }
        painter.enableTileClippingMask(coord);
        gl.uniformMatrix4fv(program.u_matrix, false, painter.translatePosMatrix(coord.posMatrix, tile, translate, translateAnchor));
        drawTileSymbols(program, painter, layer, tile, buffers, isText, isSDF, pitchWithMap, size, haloWidth, haloColor, haloBlur, color);
    }
    if (!depthOn)
        gl.enable(gl.DEPTH_TEST);
}
function setSymbolDrawState(program, painter, isText, isSDF, rotateWithMap, pitchWithMap, fontstack, size, iconsNeedLinear, adjustedSize, opacity) {
    var gl = painter.gl;
    var tr = painter.transform;
    gl.uniform1i(program.u_rotate_with_map, rotateWithMap);
    gl.uniform1i(program.u_pitch_with_map, pitchWithMap);
    gl.activeTexture(gl.TEXTURE0);
    gl.uniform1i(program.u_texture, 0);
    if (isText) {
        var glyphAtlas = fontstack && painter.glyphSource.getGlyphAtlas(fontstack);
        if (!glyphAtlas)
            return;
        glyphAtlas.updateTexture(gl);
        gl.uniform2f(program.u_texsize, glyphAtlas.width / 4, glyphAtlas.height / 4);
    } else {
        var mapMoving = painter.options.rotating || painter.options.zooming;
        var iconScaled = size !== 1 || browser.devicePixelRatio !== painter.spriteAtlas.pixelRatio || iconsNeedLinear;
        var iconTransformed = pitchWithMap || tr.pitch;
        painter.spriteAtlas.bind(gl, isSDF || mapMoving || iconScaled || iconTransformed);
        gl.uniform2f(program.u_texsize, painter.spriteAtlas.width / 4, painter.spriteAtlas.height / 4);
    }
    gl.activeTexture(gl.TEXTURE1);
    painter.frameHistory.bind(gl);
    gl.uniform1i(program.u_fadetexture, 1);
    var zoomAdjust = Math.log(size / adjustedSize) / Math.LN2 || 0;
    gl.uniform1f(program.u_zoom, (tr.zoom - zoomAdjust) * 10);
    gl.uniform1f(program.u_pitch, tr.pitch / 360 * 2 * Math.PI);
    gl.uniform1f(program.u_bearing, tr.bearing / 360 * 2 * Math.PI);
    gl.uniform1f(program.u_aspect_ratio, tr.width / tr.height);
    gl.uniform1f(program.u_opacity, opacity);
}
function drawTileSymbols(program, painter, layer, tile, buffers, isText, isSDF, pitchWithMap, size, haloWidth, haloColor, haloBlur, color) {
    var gl = painter.gl;
    var tr = painter.transform;
    var fontScale = size / (isText ? 24 : 1);
    if (pitchWithMap) {
        var s = pixelsToTileUnits(tile, fontScale, tr.zoom);
        gl.uniform2f(program.u_extrude_scale, s, s);
    } else {
        var s$1 = tr.cameraToCenterDistance * fontScale;
        gl.uniform2f(program.u_extrude_scale, tr.pixelsToGLUnits[0] * s$1, tr.pixelsToGLUnits[1] * s$1);
    }
    if (isSDF) {
        var gammaScale = fontScale * (pitchWithMap ? Math.cos(tr._pitch) : 1) * tr.cameraToCenterDistance;
        if (haloWidth) {
            gl.uniform1f(program.u_gamma, (haloBlur * blurOffset / sdfPx + gamma) / gammaScale);
            gl.uniform4fv(program.u_color, haloColor);
            gl.uniform1f(program.u_buffer, (haloOffset - haloWidth / fontScale) / sdfPx);
            drawSymbolElements(buffers, layer, gl, program);
        }
        gl.uniform1f(program.u_gamma, gamma / gammaScale);
        gl.uniform4fv(program.u_color, color);
        gl.uniform1f(program.u_buffer, (256 - 64) / 256);
    }
    drawSymbolElements(buffers, layer, gl, program);
}
function drawSymbolElements(buffers, layer, gl, program) {
    for (var i = 0, list = buffers.segments; i < list.length; i += 1) {
        var segment = list[i];
        segment.vaos[layer.id].bind(gl, program, buffers.layoutVertexBuffer, buffers.elementBuffer, null, segment.vertexOffset);
        gl.drawElements(gl.TRIANGLES, segment.primitiveLength * 3, gl.UNSIGNED_SHORT, segment.primitiveOffset * 3 * 2);
    }
}
},{"../source/pixels_to_tile_units":115,"../util/browser":178,"./draw_collision_debug":97}],104:[function(require,module,exports){
'use strict';
var FrameHistory = function FrameHistory() {
    this.changeTimes = new Float64Array(256);
    this.changeOpacities = new Uint8Array(256);
    this.opacities = new Uint8ClampedArray(256);
    this.array = new Uint8Array(this.opacities.buffer);
    this.previousZoom = 0;
    this.firstFrame = true;
};
FrameHistory.prototype.record = function record(now, zoom, duration) {
    var this$1 = this;
    if (this.firstFrame) {
        now = 0;
        this.firstFrame = false;
    }
    zoom = Math.floor(zoom * 10);
    var z;
    if (zoom < this.previousZoom) {
        for (z = zoom + 1; z <= this.previousZoom; z++) {
            this$1.changeTimes[z] = now;
            this$1.changeOpacities[z] = this$1.opacities[z];
        }
    } else {
        for (z = zoom; z > this.previousZoom; z--) {
            this$1.changeTimes[z] = now;
            this$1.changeOpacities[z] = this$1.opacities[z];
        }
    }
    for (z = 0; z < 256; z++) {
        var timeSince = now - this$1.changeTimes[z];
        var opacityChange = (duration ? timeSince / duration : 1) * 255;
        if (z <= zoom) {
            this$1.opacities[z] = this$1.changeOpacities[z] + opacityChange;
        } else {
            this$1.opacities[z] = this$1.changeOpacities[z] - opacityChange;
        }
    }
    this.changed = true;
    this.previousZoom = zoom;
};
FrameHistory.prototype.bind = function bind(gl) {
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, 256, 1, 0, gl.ALPHA, gl.UNSIGNED_BYTE, this.array);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if (this.changed) {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, 256, 1, gl.ALPHA, gl.UNSIGNED_BYTE, this.array);
            this.changed = false;
        }
    }
};
module.exports = FrameHistory;
},{}],105:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var LineAtlas = function LineAtlas(width, height) {
    this.width = width;
    this.height = height;
    this.nextRow = 0;
    this.bytes = 4;
    this.data = new Uint8Array(this.width * this.height * this.bytes);
    this.positions = {};
};
LineAtlas.prototype.setSprite = function setSprite(sprite) {
    this.sprite = sprite;
};
LineAtlas.prototype.getDash = function getDash(dasharray, round) {
    var key = dasharray.join(',') + round;
    if (!this.positions[key]) {
        this.positions[key] = this.addDash(dasharray, round);
    }
    return this.positions[key];
};
LineAtlas.prototype.addDash = function addDash(dasharray, round) {
    var this$1 = this;
    var n = round ? 7 : 0;
    var height = 2 * n + 1;
    var offset = 128;
    if (this.nextRow + height > this.height) {
        util.warnOnce('LineAtlas out of space');
        return null;
    }
    var length = 0;
    for (var i = 0; i < dasharray.length; i++) {
        length += dasharray[i];
    }
    var stretch = this.width / length;
    var halfWidth = stretch / 2;
    var oddLength = dasharray.length % 2 === 1;
    for (var y = -n; y <= n; y++) {
        var row = this$1.nextRow + n + y;
        var index = this$1.width * row;
        var left = oddLength ? -dasharray[dasharray.length - 1] : 0;
        var right = dasharray[0];
        var partIndex = 1;
        for (var x = 0; x < this.width; x++) {
            while (right < x / stretch) {
                left = right;
                right = right + dasharray[partIndex];
                if (oddLength && partIndex === dasharray.length - 1) {
                    right += dasharray[0];
                }
                partIndex++;
            }
            var distLeft = Math.abs(x - left * stretch);
            var distRight = Math.abs(x - right * stretch);
            var dist = Math.min(distLeft, distRight);
            var inside = partIndex % 2 === 1;
            var signedDistance;
            if (round) {
                var distMiddle = n ? y / n * (halfWidth + 1) : 0;
                if (inside) {
                    var distEdge = halfWidth - Math.abs(distMiddle);
                    signedDistance = Math.sqrt(dist * dist + distEdge * distEdge);
                } else {
                    signedDistance = halfWidth - Math.sqrt(dist * dist + distMiddle * distMiddle);
                }
            } else {
                signedDistance = (inside ? 1 : -1) * dist;
            }
            this$1.data[3 + (index + x) * 4] = Math.max(0, Math.min(255, signedDistance + offset));
        }
    }
    var pos = {
        y: (this.nextRow + n + 0.5) / this.height,
        height: 2 * n / this.height,
        width: length
    };
    this.nextRow += height;
    this.dirty = true;
    return pos;
};
LineAtlas.prototype.bind = function bind(gl) {
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width, this.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        if (this.dirty) {
            this.dirty = false;
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.RGBA, gl.UNSIGNED_BYTE, this.data);
        }
    }
};
module.exports = LineAtlas;
},{"../util/util":197}],106:[function(require,module,exports){
'use strict';
var browser = require('../util/browser');
var mat4 = require('@mapbox/gl-matrix').mat4;
var FrameHistory = require('./frame_history');
var SourceCache = require('../source/source_cache');
var EXTENT = require('../data/extent');
var pixelsToTileUnits = require('../source/pixels_to_tile_units');
var util = require('../util/util');
var Buffer = require('../data/buffer');
var VertexArrayObject = require('./vertex_array_object');
var RasterBoundsArray = require('../data/raster_bounds_array');
var PosArray = require('../data/pos_array');
var ProgramConfiguration = require('../data/program_configuration');
var shaders = require('./shaders');
var draw = {
    symbol: require('./draw_symbol'),
    circle: require('./draw_circle'),
    line: require('./draw_line'),
    fill: require('./draw_fill'),
    'fill-extrusion': require('./draw_fill_extrusion'),
    raster: require('./draw_raster'),
    background: require('./draw_background'),
    debug: require('./draw_debug')
};
var Painter = function Painter(gl, transform) {
    this.gl = gl;
    this.transform = transform;
    this.reusableTextures = {};
    this.preFbos = {};
    this.frameHistory = new FrameHistory();
    this.setup();
    this.numSublayers = SourceCache.maxUnderzooming + SourceCache.maxOverzooming + 1;
    this.depthEpsilon = 1 / Math.pow(2, 16);
    this.lineWidthRange = gl.getParameter(gl.ALIASED_LINE_WIDTH_RANGE);
    this.basicFillProgramConfiguration = ProgramConfiguration.createStatic([
        'color',
        'opacity'
    ]);
    this.emptyProgramConfiguration = new ProgramConfiguration();
};
Painter.prototype.resize = function resize(width, height) {
    var gl = this.gl;
    this.width = width * browser.devicePixelRatio;
    this.height = height * browser.devicePixelRatio;
    gl.viewport(0, 0, this.width, this.height);
};
Painter.prototype.setup = function setup() {
    var gl = this.gl;
    gl.verbose = true;
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.enable(gl.STENCIL_TEST);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LEQUAL);
    this._depthMask = false;
    gl.depthMask(false);
    var tileExtentArray = new PosArray();
    tileExtentArray.emplaceBack(0, 0);
    tileExtentArray.emplaceBack(EXTENT, 0);
    tileExtentArray.emplaceBack(0, EXTENT);
    tileExtentArray.emplaceBack(EXTENT, EXTENT);
    this.tileExtentBuffer = Buffer.fromStructArray(tileExtentArray, Buffer.BufferType.VERTEX);
    this.tileExtentVAO = new VertexArrayObject();
    this.tileExtentPatternVAO = new VertexArrayObject();
    var debugArray = new PosArray();
    debugArray.emplaceBack(0, 0);
    debugArray.emplaceBack(EXTENT, 0);
    debugArray.emplaceBack(EXTENT, EXTENT);
    debugArray.emplaceBack(0, EXTENT);
    debugArray.emplaceBack(0, 0);
    this.debugBuffer = Buffer.fromStructArray(debugArray, Buffer.BufferType.VERTEX);
    this.debugVAO = new VertexArrayObject();
    var rasterBoundsArray = new RasterBoundsArray();
    rasterBoundsArray.emplaceBack(0, 0, 0, 0);
    rasterBoundsArray.emplaceBack(EXTENT, 0, 32767, 0);
    rasterBoundsArray.emplaceBack(0, EXTENT, 0, 32767);
    rasterBoundsArray.emplaceBack(EXTENT, EXTENT, 32767, 32767);
    this.rasterBoundsBuffer = Buffer.fromStructArray(rasterBoundsArray, Buffer.BufferType.VERTEX);
    this.rasterBoundsVAO = new VertexArrayObject();
};
Painter.prototype.clearColor = function clearColor() {
    var gl = this.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
};
Painter.prototype.clearStencil = function clearStencil() {
    var gl = this.gl;
    gl.clearStencil(0);
    gl.stencilMask(255);
    gl.clear(gl.STENCIL_BUFFER_BIT);
};
Painter.prototype.clearDepth = function clearDepth() {
    var gl = this.gl;
    gl.clearDepth(1);
    this.depthMask(true);
    gl.clear(gl.DEPTH_BUFFER_BIT);
};
Painter.prototype._renderTileClippingMasks = function _renderTileClippingMasks(coords) {
    var this$1 = this;
    var gl = this.gl;
    gl.colorMask(false, false, false, false);
    this.depthMask(false);
    gl.disable(gl.DEPTH_TEST);
    gl.enable(gl.STENCIL_TEST);
    gl.stencilMask(248);
    gl.stencilOp(gl.KEEP, gl.KEEP, gl.REPLACE);
    var idNext = 1;
    this._tileClippingMaskIDs = {};
    for (var i = 0, list = coords; i < list.length; i += 1) {
        var coord = list[i];
        var id = this$1._tileClippingMaskIDs[coord.id] = idNext++ << 3;
        gl.stencilFunc(gl.ALWAYS, id, 248);
        var program = this$1.useProgram('fill', this$1.basicFillProgramConfiguration);
        gl.uniformMatrix4fv(program.u_matrix, false, coord.posMatrix);
        this$1.tileExtentVAO.bind(gl, program, this$1.tileExtentBuffer);
        gl.drawArrays(gl.TRIANGLE_STRIP, 0, this$1.tileExtentBuffer.length);
    }
    gl.stencilMask(0);
    gl.colorMask(true, true, true, true);
    this.depthMask(true);
    gl.enable(gl.DEPTH_TEST);
};
Painter.prototype.enableTileClippingMask = function enableTileClippingMask(coord) {
    var gl = this.gl;
    gl.stencilFunc(gl.EQUAL, this._tileClippingMaskIDs[coord.id], 248);
};
Painter.prototype.prepareBuffers = function prepareBuffers() {
};
Painter.prototype.bindDefaultFramebuffer = function bindDefaultFramebuffer() {
    var gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
};
Painter.prototype.render = function render(style, options) {
    this.style = style;
    this.options = options;
    this.lineAtlas = style.lineAtlas;
    this.spriteAtlas = style.spriteAtlas;
    this.spriteAtlas.setSprite(style.sprite);
    this.glyphSource = style.glyphSource;
    this.frameHistory.record(Date.now(), this.transform.zoom, style.getTransition().duration);
    this.prepareBuffers();
    this.clearColor();
    this.clearDepth();
    this.showOverdrawInspector(options.showOverdrawInspector);
    this.depthRange = (style._order.length + 2) * this.numSublayers * this.depthEpsilon;
    this.isOpaquePass = true;
    this.renderPass();
    this.isOpaquePass = false;
    this.renderPass();
    if (this.options.showTileBoundaries) {
        var sourceCache = this.style.sourceCaches[Object.keys(this.style.sourceCaches)[0]];
        if (sourceCache) {
            draw.debug(this, sourceCache, sourceCache.getVisibleCoordinates());
        }
    }
};
Painter.prototype.renderPass = function renderPass() {
    var this$1 = this;
    var layerIds = this.style._order;
    var sourceCache, coords;
    this.currentLayer = this.isOpaquePass ? layerIds.length - 1 : 0;
    if (this.isOpaquePass) {
        if (!this._showOverdrawInspector) {
            this.gl.disable(this.gl.BLEND);
        }
    } else {
        this.gl.enable(this.gl.BLEND);
    }
    for (var i = 0; i < layerIds.length; i++) {
        var layer = this$1.style._layers[layerIds[this$1.currentLayer]];
        if (layer.source !== (sourceCache && sourceCache.id)) {
            sourceCache = this$1.style.sourceCaches[layer.source];
            coords = [];
            if (sourceCache) {
                if (sourceCache.prepare)
                    sourceCache.prepare();
                this$1.clearStencil();
                coords = sourceCache.getVisibleCoordinates();
                if (sourceCache.getSource().isTileClipped) {
                    this$1._renderTileClippingMasks(coords);
                }
            }
            if (!this$1.isOpaquePass) {
                coords.reverse();
            }
        }
        this$1.renderLayer(this$1, sourceCache, layer, coords);
        this$1.currentLayer += this$1.isOpaquePass ? -1 : 1;
    }
};
Painter.prototype.depthMask = function depthMask(mask) {
    if (mask !== this._depthMask) {
        this._depthMask = mask;
        this.gl.depthMask(mask);
    }
};
Painter.prototype.renderLayer = function renderLayer(painter, sourceCache, layer, coords) {
    if (layer.isHidden(this.transform.zoom))
        return;
    if (layer.type !== 'background' && !coords.length)
        return;
    this.id = layer.id;
    draw[layer.type](painter, sourceCache, layer, coords);
};
Painter.prototype.setDepthSublayer = function setDepthSublayer(n) {
    var farDepth = 1 - ((1 + this.currentLayer) * this.numSublayers + n) * this.depthEpsilon;
    var nearDepth = farDepth - 1 + this.depthRange;
    this.gl.depthRange(nearDepth, farDepth);
};
Painter.prototype.translatePosMatrix = function translatePosMatrix(matrix, tile, translate, anchor) {
    if (!translate[0] && !translate[1])
        return matrix;
    if (anchor === 'viewport') {
        var sinA = Math.sin(-this.transform.angle);
        var cosA = Math.cos(-this.transform.angle);
        translate = [
            translate[0] * cosA - translate[1] * sinA,
            translate[0] * sinA + translate[1] * cosA
        ];
    }
    var translation = [
        pixelsToTileUnits(tile, translate[0], this.transform.zoom),
        pixelsToTileUnits(tile, translate[1], this.transform.zoom),
        0
    ];
    var translatedMatrix = new Float32Array(16);
    mat4.translate(translatedMatrix, matrix, translation);
    return translatedMatrix;
};
Painter.prototype.saveTileTexture = function saveTileTexture(texture) {
    var textures = this.reusableTextures[texture.size];
    if (!textures) {
        this.reusableTextures[texture.size] = [texture];
    } else {
        textures.push(texture);
    }
};
Painter.prototype.saveViewportTexture = function saveViewportTexture(texture) {
    if (!this.reusableTextures.viewport)
        this.reusableTextures.viewport = {};
    this.reusableTextures.viewport.texture = texture;
};
Painter.prototype.getTileTexture = function getTileTexture(width, height) {
    var widthTextures = this.reusableTextures[width];
    if (widthTextures) {
        var textures = widthTextures[height || width];
        return textures && textures.length > 0 ? textures.pop() : null;
    }
};
Painter.prototype.getViewportTexture = function getViewportTexture(width, height) {
    if (!this.reusableTextures.viewport)
        return;
    var texture = this.reusableTextures.viewport.texture;
    if (texture.width === width && texture.height === height) {
        return texture;
    } else {
        this.gl.deleteTexture(texture);
        this.reusableTextures.viewport.texture = null;
        return;
    }
};
Painter.prototype.lineWidth = function lineWidth(width) {
    this.gl.lineWidth(util.clamp(width, this.lineWidthRange[0], this.lineWidthRange[1]));
};
Painter.prototype.showOverdrawInspector = function showOverdrawInspector(enabled) {
    if (!enabled && !this._showOverdrawInspector)
        return;
    this._showOverdrawInspector = enabled;
    var gl = this.gl;
    if (enabled) {
        gl.blendFunc(gl.CONSTANT_COLOR, gl.ONE);
        var numOverdrawSteps = 8;
        var a = 1 / numOverdrawSteps;
        gl.blendColor(a, a, a, 0);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT);
    } else {
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    }
};
Painter.prototype.createProgram = function createProgram(name, configuration) {
    var gl = this.gl;
    var program = gl.createProgram();
    var definition = shaders[name];
    var definesSource = '#define MAPBOX_GL_JS\n#define DEVICE_PIXEL_RATIO ' + browser.devicePixelRatio.toFixed(1) + '\n';
    if (this._showOverdrawInspector) {
        definesSource += '#define OVERDRAW_INSPECTOR;\n';
    }
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, configuration.applyPragmas(definesSource + shaders.prelude.fragmentSource + definition.fragmentSource, 'fragment'));
    gl.compileShader(fragmentShader);
    gl.attachShader(program, fragmentShader);
    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, configuration.applyPragmas(definesSource + shaders.prelude.vertexSource + definition.vertexSource, 'vertex'));
    gl.compileShader(vertexShader);
    gl.attachShader(program, vertexShader);
    gl.linkProgram(program);
    var numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    var result = {
        program: program,
        numAttributes: numAttributes
    };
    for (var i = 0; i < numAttributes; i++) {
        var attribute = gl.getActiveAttrib(program, i);
        result[attribute.name] = gl.getAttribLocation(program, attribute.name);
    }
    var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    for (var i$1 = 0; i$1 < numUniforms; i$1++) {
        var uniform = gl.getActiveUniform(program, i$1);
        result[uniform.name] = gl.getUniformLocation(program, uniform.name);
    }
    return result;
};
Painter.prototype._createProgramCached = function _createProgramCached(name, programConfiguration) {
    this.cache = this.cache || {};
    var key = '' + name + (programConfiguration.cacheKey || '') + (this._showOverdrawInspector ? '/overdraw' : '');
    if (!this.cache[key]) {
        this.cache[key] = this.createProgram(name, programConfiguration);
    }
    return this.cache[key];
};
Painter.prototype.useProgram = function useProgram(name, programConfiguration) {
    var gl = this.gl;
    var nextProgram = this._createProgramCached(name, programConfiguration || this.emptyProgramConfiguration);
    if (this.currentProgram !== nextProgram) {
        gl.useProgram(nextProgram.program);
        this.currentProgram = nextProgram;
    }
    return nextProgram;
};
module.exports = Painter;
},{"../data/buffer":78,"../data/extent":81,"../data/pos_array":84,"../data/program_configuration":85,"../data/raster_bounds_array":86,"../source/pixels_to_tile_units":115,"../source/source_cache":119,"../util/browser":178,"../util/util":197,"./draw_background":95,"./draw_circle":96,"./draw_debug":98,"./draw_fill":99,"./draw_fill_extrusion":100,"./draw_line":101,"./draw_raster":102,"./draw_symbol":103,"./frame_history":104,"./shaders":108,"./vertex_array_object":109,"@mapbox/gl-matrix":7}],107:[function(require,module,exports){
'use strict';
var pixelsToTileUnits = require('../source/pixels_to_tile_units');
exports.prepare = function (image, painter, program) {
    var gl = painter.gl;
    var imagePosA = painter.spriteAtlas.getPosition(image.from, true);
    var imagePosB = painter.spriteAtlas.getPosition(image.to, true);
    if (!imagePosA || !imagePosB)
        return;
    gl.uniform1i(program.u_image, 0);
    gl.uniform2fv(program.u_pattern_tl_a, imagePosA.tl);
    gl.uniform2fv(program.u_pattern_br_a, imagePosA.br);
    gl.uniform2fv(program.u_pattern_tl_b, imagePosB.tl);
    gl.uniform2fv(program.u_pattern_br_b, imagePosB.br);
    gl.uniform1f(program.u_mix, image.t);
    gl.uniform2fv(program.u_pattern_size_a, imagePosA.size);
    gl.uniform2fv(program.u_pattern_size_b, imagePosB.size);
    gl.uniform1f(program.u_scale_a, image.fromScale);
    gl.uniform1f(program.u_scale_b, image.toScale);
    gl.activeTexture(gl.TEXTURE0);
    painter.spriteAtlas.bind(gl, true);
};
exports.setTile = function (tile, painter, program) {
    var gl = painter.gl;
    gl.uniform1f(program.u_tile_units_to_pixels, 1 / pixelsToTileUnits(tile, 1, painter.transform.tileZoom));
    var numTiles = Math.pow(2, tile.coord.z);
    var tileSizeAtNearestZoom = tile.tileSize * Math.pow(2, painter.transform.tileZoom) / numTiles;
    var pixelX = tileSizeAtNearestZoom * (tile.coord.x + tile.coord.w * numTiles);
    var pixelY = tileSizeAtNearestZoom * tile.coord.y;
    gl.uniform2f(program.u_pixel_coord_upper, pixelX >> 16, pixelY >> 16);
    gl.uniform2f(program.u_pixel_coord_lower, pixelX & 65535, pixelY & 65535);
};
},{"../source/pixels_to_tile_units":115}],108:[function(require,module,exports){
'use strict';

var path = require('path');
module.exports = {
    prelude: {
        fragmentSource: "#ifdef GL_ES\nprecision mediump float;\n#else\n\n#if !defined(lowp)\n#define lowp\n#endif\n\n#if !defined(mediump)\n#define mediump\n#endif\n\n#if !defined(highp)\n#define highp\n#endif\n\n#endif\n",
        vertexSource: "#ifdef GL_ES\nprecision highp float;\n#else\n\n#if !defined(lowp)\n#define lowp\n#endif\n\n#if !defined(mediump)\n#define mediump\n#endif\n\n#if !defined(highp)\n#define highp\n#endif\n\n#endif\n\nfloat evaluate_zoom_function_1(const vec4 values, const float t) {\n    if (t < 1.0) {\n        return mix(values[0], values[1], t);\n    } else if (t < 2.0) {\n        return mix(values[1], values[2], t - 1.0);\n    } else {\n        return mix(values[2], values[3], t - 2.0);\n    }\n}\nvec4 evaluate_zoom_function_4(const vec4 value0, const vec4 value1, const vec4 value2, const vec4 value3, const float t) {\n    if (t < 1.0) {\n        return mix(value0, value1, t);\n    } else if (t < 2.0) {\n        return mix(value1, value2, t - 1.0);\n    } else {\n        return mix(value2, value3, t - 2.0);\n    }\n}\n\n// The offset depends on how many pixels are between the world origin and the edge of the tile:\n// vec2 offset = mod(pixel_coord, size)\n//\n// At high zoom levels there are a ton of pixels between the world origin and the edge of the tile.\n// The glsl spec only guarantees 16 bits of precision for highp floats. We need more than that.\n//\n// The pixel_coord is passed in as two 16 bit values:\n// pixel_coord_upper = floor(pixel_coord / 2^16)\n// pixel_coord_lower = mod(pixel_coord, 2^16)\n//\n// The offset is calculated in a series of steps that should preserve this precision:\nvec2 get_pattern_pos(const vec2 pixel_coord_upper, const vec2 pixel_coord_lower,\n    const vec2 pattern_size, const float tile_units_to_pixels, const vec2 pos) {\n\n    vec2 offset = mod(mod(mod(pixel_coord_upper, pattern_size) * 256.0, pattern_size) * 256.0 + pixel_coord_lower, pattern_size);\n    return (tile_units_to_pixels * pos + offset) / pattern_size;\n}\n"
    },
    circle: {
        fragmentSource: "#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define mediump float radius\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 stroke_color\n#pragma mapbox: define mediump float stroke_width\n#pragma mapbox: define lowp float stroke_opacity\n\nvarying vec2 v_extrude;\nvarying lowp float v_antialiasblur;\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize mediump float radius\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n    #pragma mapbox: initialize lowp vec4 stroke_color\n    #pragma mapbox: initialize mediump float stroke_width\n    #pragma mapbox: initialize lowp float stroke_opacity\n\n    float extrude_length = length(v_extrude);\n    float antialiased_blur = -max(blur, v_antialiasblur);\n\n    float opacity_t = smoothstep(0.0, antialiased_blur, extrude_length - 1.0);\n\n    float color_t = stroke_width < 0.01 ? 0.0 : smoothstep(\n        antialiased_blur,\n        0.0,\n        extrude_length - radius / (radius + stroke_width)\n    );\n\n    gl_FragColor = opacity_t * mix(color * opacity, stroke_color * stroke_opacity, color_t);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform bool u_scale_with_map;\nuniform vec2 u_extrude_scale;\n\nattribute vec2 a_pos;\n\n#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define mediump float radius\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp vec4 stroke_color\n#pragma mapbox: define mediump float stroke_width\n#pragma mapbox: define lowp float stroke_opacity\n\nvarying vec2 v_extrude;\nvarying lowp float v_antialiasblur;\n\nvoid main(void) {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize mediump float radius\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n    #pragma mapbox: initialize lowp vec4 stroke_color\n    #pragma mapbox: initialize mediump float stroke_width\n    #pragma mapbox: initialize lowp float stroke_opacity\n\n    // unencode the extrusion vector that we snuck into the a_pos vector\n    v_extrude = vec2(mod(a_pos, 2.0) * 2.0 - 1.0);\n\n    vec2 extrude = v_extrude * (radius + stroke_width) * u_extrude_scale;\n    // multiply a_pos by 0.5, since we had it * 2 in order to sneak\n    // in extrusion data\n    gl_Position = u_matrix * vec4(floor(a_pos * 0.5), 0, 1);\n\n    if (u_scale_with_map) {\n        gl_Position.xy += extrude;\n    } else {\n        gl_Position.xy += extrude * gl_Position.w;\n    }\n\n    // This is a minimum blur distance that serves as a faux-antialiasing for\n    // the circle. since blur is a ratio of the circle's size and the intent is\n    // to keep the blur at roughly 1px, the two are inversely related.\n    v_antialiasblur = 1.0 / DEVICE_PIXEL_RATIO / (radius + stroke_width);\n}\n"
    },
    collisionBox: {
        fragmentSource: "uniform float u_zoom;\nuniform float u_maxzoom;\n\nvarying float v_max_zoom;\nvarying float v_placement_zoom;\n\nvoid main() {\n\n    float alpha = 0.5;\n\n    gl_FragColor = vec4(0.0, 1.0, 0.0, 1.0) * alpha;\n\n    if (v_placement_zoom > u_zoom) {\n        gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0) * alpha;\n    }\n\n    if (u_zoom >= v_max_zoom) {\n        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0) * alpha * 0.25;\n    }\n\n    if (v_placement_zoom >= u_maxzoom) {\n        gl_FragColor = vec4(0.0, 0.0, 1.0, 1.0) * alpha * 0.2;\n    }\n}\n",
        vertexSource: "attribute vec2 a_pos;\nattribute vec2 a_extrude;\nattribute vec2 a_data;\n\nuniform mat4 u_matrix;\nuniform float u_scale;\n\nvarying float v_max_zoom;\nvarying float v_placement_zoom;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos + a_extrude / u_scale, 0.0, 1.0);\n\n    v_max_zoom = a_data.x;\n    v_placement_zoom = a_data.y;\n}\n"
    },
    debug: {
        fragmentSource: "uniform lowp vec4 u_color;\n\nvoid main() {\n    gl_FragColor = u_color;\n}\n",
        vertexSource: "attribute vec2 a_pos;\n\nuniform mat4 u_matrix;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, step(32767.0, a_pos.x), 1);\n}\n"
    },
    fill: {
        fragmentSource: "#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float opacity\n\n    gl_FragColor = color * opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "attribute vec2 a_pos;\n\nuniform mat4 u_matrix;\n\n#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float opacity\n\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n}\n"
    },
    fillOutline: {
        fragmentSource: "#pragma mapbox: define lowp vec4 outline_color\n#pragma mapbox: define lowp float opacity\n\nvarying vec2 v_pos;\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 outline_color\n    #pragma mapbox: initialize lowp float opacity\n\n    float dist = length(v_pos - gl_FragCoord.xy);\n    float alpha = smoothstep(1.0, 0.0, dist);\n    gl_FragColor = outline_color * (alpha * opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "attribute vec2 a_pos;\n\nuniform mat4 u_matrix;\nuniform vec2 u_world;\n\nvarying vec2 v_pos;\n\n#pragma mapbox: define lowp vec4 outline_color\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 outline_color\n    #pragma mapbox: initialize lowp float opacity\n\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n    v_pos = (gl_Position.xy / gl_Position.w + 1.0) / 2.0 * u_world;\n}\n"
    },
    fillOutlinePattern: {
        fragmentSource: "uniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_mix;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec2 v_pos;\n\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp float opacity\n\n    vec2 imagecoord = mod(v_pos_a, 1.0);\n    vec2 pos = mix(u_pattern_tl_a, u_pattern_br_a, imagecoord);\n    vec4 color1 = texture2D(u_image, pos);\n\n    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n    vec2 pos2 = mix(u_pattern_tl_b, u_pattern_br_b, imagecoord_b);\n    vec4 color2 = texture2D(u_image, pos2);\n\n    // find distance to outline for alpha interpolation\n\n    float dist = length(v_pos - gl_FragCoord.xy);\n    float alpha = smoothstep(1.0, 0.0, dist);\n\n\n    gl_FragColor = mix(color1, color2, u_mix) * alpha * opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform vec2 u_world;\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pixel_coord_upper;\nuniform vec2 u_pixel_coord_lower;\nuniform float u_scale_a;\nuniform float u_scale_b;\nuniform float u_tile_units_to_pixels;\n\nattribute vec2 a_pos;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec2 v_pos;\n\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp float opacity\n\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n\n    v_pos_a = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_a * u_pattern_size_a, u_tile_units_to_pixels, a_pos);\n    v_pos_b = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_b * u_pattern_size_b, u_tile_units_to_pixels, a_pos);\n\n    v_pos = (gl_Position.xy / gl_Position.w + 1.0) / 2.0 * u_world;\n}\n"
    },
    fillPattern: {
        fragmentSource: "uniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_mix;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\n\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp float opacity\n\n    vec2 imagecoord = mod(v_pos_a, 1.0);\n    vec2 pos = mix(u_pattern_tl_a, u_pattern_br_a, imagecoord);\n    vec4 color1 = texture2D(u_image, pos);\n\n    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n    vec2 pos2 = mix(u_pattern_tl_b, u_pattern_br_b, imagecoord_b);\n    vec4 color2 = texture2D(u_image, pos2);\n\n    gl_FragColor = mix(color1, color2, u_mix) * opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pixel_coord_upper;\nuniform vec2 u_pixel_coord_lower;\nuniform float u_scale_a;\nuniform float u_scale_b;\nuniform float u_tile_units_to_pixels;\n\nattribute vec2 a_pos;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\n\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp float opacity\n\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n\n    v_pos_a = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_a * u_pattern_size_a, u_tile_units_to_pixels, a_pos);\n    v_pos_b = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_b * u_pattern_size_b, u_tile_units_to_pixels, a_pos);\n}\n"
    },
    fillExtrusion: {
        fragmentSource: "varying vec4 v_color;\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n#pragma mapbox: define lowp vec4 color\n\nvoid main() {\n    #pragma mapbox: initialize lowp float base\n    #pragma mapbox: initialize lowp float height\n    #pragma mapbox: initialize lowp vec4 color\n\n    gl_FragColor = v_color;\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform vec3 u_lightcolor;\nuniform lowp vec3 u_lightpos;\nuniform lowp float u_lightintensity;\nuniform lowp vec4 u_outline_color;\n\nattribute vec2 a_pos;\nattribute vec3 a_normal;\nattribute float a_edgedistance;\n\nvarying vec4 v_color;\n\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n\n#pragma mapbox: define lowp vec4 color\n\nvoid main() {\n    #pragma mapbox: initialize lowp float base\n    #pragma mapbox: initialize lowp float height\n    #pragma mapbox: initialize lowp vec4 color\n\n    float ed = a_edgedistance; // use each attrib in order to not trip a VAO assert\n    float t = mod(a_normal.x, 2.0);\n\n    gl_Position = u_matrix * vec4(a_pos, t > 0.0 ? height : base, 1);\n\n#ifdef OUTLINE\n    color = u_outline_color;\n#endif\n\n    // Relative luminance (how dark/bright is the surface color?)\n    float colorvalue = color.r * 0.2126 + color.g * 0.7152 + color.b * 0.0722;\n\n    v_color = vec4(0.0, 0.0, 0.0, 1.0);\n\n    // Add slight ambient lighting so no extrusions are totally black\n    vec4 ambientlight = vec4(0.03, 0.03, 0.03, 1.0);\n    color += ambientlight;\n\n    // Calculate cos(theta), where theta is the angle between surface normal and diffuse light ray\n    float directional = clamp(dot(a_normal / 16384.0, u_lightpos), 0.0, 1.0);\n\n    // Adjust directional so that\n    // the range of values for highlight/shading is narrower\n    // with lower light intensity\n    // and with lighter/brighter surface colors\n    directional = mix((1.0 - u_lightintensity), max((1.0 - colorvalue + u_lightintensity), 1.0), directional);\n\n    // Add gradient along z axis of side surfaces\n    if (a_normal.y != 0.0) {\n        directional *= clamp((t + base) * pow(height / 150.0, 0.5), mix(0.7, 0.98, 1.0 - u_lightintensity), 1.0);\n    }\n\n    // Assign final color based on surface + ambient light color, diffuse light directional, and light color\n    // with lower bounds adjusted to hue of light\n    // so that shading is tinted with the complementary (opposite) color to the light color\n    v_color.r += clamp(color.r * directional * u_lightcolor.r, mix(0.0, 0.3, 1.0 - u_lightcolor.r), 1.0);\n    v_color.g += clamp(color.g * directional * u_lightcolor.g, mix(0.0, 0.3, 1.0 - u_lightcolor.g), 1.0);\n    v_color.b += clamp(color.b * directional * u_lightcolor.b, mix(0.0, 0.3, 1.0 - u_lightcolor.b), 1.0);\n}\n"
    },
    fillExtrusionPattern: {
        fragmentSource: "uniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_mix;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec4 v_lighting;\n\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n\nvoid main() {\n    #pragma mapbox: initialize lowp float base\n    #pragma mapbox: initialize lowp float height\n\n    vec2 imagecoord = mod(v_pos_a, 1.0);\n    vec2 pos = mix(u_pattern_tl_a, u_pattern_br_a, imagecoord);\n    vec4 color1 = texture2D(u_image, pos);\n\n    vec2 imagecoord_b = mod(v_pos_b, 1.0);\n    vec2 pos2 = mix(u_pattern_tl_b, u_pattern_br_b, imagecoord_b);\n    vec4 color2 = texture2D(u_image, pos2);\n\n    vec4 mixedColor = mix(color1, color2, u_mix);\n\n    gl_FragColor = mixedColor * v_lighting;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pixel_coord_upper;\nuniform vec2 u_pixel_coord_lower;\nuniform float u_scale_a;\nuniform float u_scale_b;\nuniform float u_tile_units_to_pixels;\nuniform float u_height_factor;\n\nuniform vec3 u_lightcolor;\nuniform lowp vec3 u_lightpos;\nuniform lowp float u_lightintensity;\n\nattribute vec2 a_pos;\nattribute vec3 a_normal;\nattribute float a_edgedistance;\n\nvarying vec2 v_pos_a;\nvarying vec2 v_pos_b;\nvarying vec4 v_lighting;\nvarying float v_directional;\n\n#pragma mapbox: define lowp float base\n#pragma mapbox: define lowp float height\n\nvoid main() {\n    #pragma mapbox: initialize lowp float base\n    #pragma mapbox: initialize lowp float height\n\n    float t = mod(a_normal.x, 2.0);\n    float z = t > 0.0 ? height : base;\n\n    gl_Position = u_matrix * vec4(a_pos, z, 1);\n\n    vec2 pos = a_normal.x == 1.0 && a_normal.y == 0.0 && a_normal.z == 16384.0\n        ? a_pos // extrusion top\n        : vec2(a_edgedistance, z * u_height_factor); // extrusion side\n\n    v_pos_a = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_a * u_pattern_size_a, u_tile_units_to_pixels, pos);\n    v_pos_b = get_pattern_pos(u_pixel_coord_upper, u_pixel_coord_lower, u_scale_b * u_pattern_size_b, u_tile_units_to_pixels, pos);\n\n    v_lighting = vec4(0.0, 0.0, 0.0, 1.0);\n    float directional = clamp(dot(a_normal / 16383.0, u_lightpos), 0.0, 1.0);\n    directional = mix((1.0 - u_lightintensity), max((0.5 + u_lightintensity), 1.0), directional);\n\n    if (a_normal.y != 0.0) {\n        directional *= clamp((t + base) * pow(height / 150.0, 0.5), mix(0.7, 0.98, 1.0 - u_lightintensity), 1.0);\n    }\n\n    v_lighting.rgb += clamp(directional * u_lightcolor, mix(vec3(0.0), vec3(0.3), 1.0 - u_lightcolor), vec3(1.0));\n}\n"
    },
    extrusionTexture: {
        fragmentSource: "uniform sampler2D u_texture;\nuniform float u_opacity;\n\nvarying vec2 v_pos;\n\nvoid main() {\n    gl_FragColor = texture2D(u_texture, v_pos) * u_opacity;\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform int u_xdim;\nuniform int u_ydim;\nattribute vec2 a_pos;\nvarying vec2 v_pos;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n\n    v_pos.x = a_pos.x / float(u_xdim);\n    v_pos.y = 1.0 - a_pos.y / float(u_ydim);\n}\n"
    },
    line: {
        fragmentSource: "#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n\nvarying vec2 v_width2;\nvarying vec2 v_normal;\nvarying float v_gamma_scale;\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_width2.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_width2.t) or when fading out\n    // (v_width2.s)\n    float blur2 = (blur + 1.0 / DEVICE_PIXEL_RATIO) * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n\n    gl_FragColor = color * (alpha * opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "\n\n// the distance over which the line edge fades out.\n// Retina devices need a smaller distance to avoid aliasing.\n#define ANTIALIASING 1.0 / DEVICE_PIXEL_RATIO / 2.0\n\n// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform mediump float u_width;\nuniform vec2 u_gl_units_to_pixels;\n\nvarying vec2 v_normal;\nvarying vec2 v_width2;\nvarying float v_gamma_scale;\n\n#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define lowp float offset\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n    #pragma mapbox: initialize mediump float gapwidth\n    #pragma mapbox: initialize lowp float offset\n\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n\n    // these transformations used to be applied in the JS and native code bases. \n    // moved them into the shader for clarity and simplicity. \n    gapwidth = gapwidth / 2.0;\n    float width = u_width / 2.0;\n    offset = -1.0 * offset; \n\n    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n    float outset = gapwidth + width * (gapwidth > 0.0 ? 2.0 : 1.0) + ANTIALIASING;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist = outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit to get the position\n    vec2 pos = floor(a_pos * 0.5);\n\n    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;\n\n    // calculate how much the perspective view squishes or stretches the extrude\n    float extrude_length_without_perspective = length(dist);\n    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_gl_units_to_pixels);\n    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n\n    v_width2 = vec2(outset, inset);\n}\n"
    },
    linePattern: {
        fragmentSource: "uniform vec2 u_pattern_size_a;\nuniform vec2 u_pattern_size_b;\nuniform vec2 u_pattern_tl_a;\nuniform vec2 u_pattern_br_a;\nuniform vec2 u_pattern_tl_b;\nuniform vec2 u_pattern_br_b;\nuniform float u_fade;\n\nuniform sampler2D u_image;\n\nvarying vec2 v_normal;\nvarying vec2 v_width2;\nvarying float v_linesofar;\nvarying float v_gamma_scale;\n\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_width2.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_width2.t) or when fading out\n    // (v_width2.s)\n    float blur2 = (blur + 1.0 / DEVICE_PIXEL_RATIO) * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n\n    float x_a = mod(v_linesofar / u_pattern_size_a.x, 1.0);\n    float x_b = mod(v_linesofar / u_pattern_size_b.x, 1.0);\n    float y_a = 0.5 + (v_normal.y * v_width2.s / u_pattern_size_a.y);\n    float y_b = 0.5 + (v_normal.y * v_width2.s / u_pattern_size_b.y);\n    vec2 pos_a = mix(u_pattern_tl_a, u_pattern_br_a, vec2(x_a, y_a));\n    vec2 pos_b = mix(u_pattern_tl_b, u_pattern_br_b, vec2(x_b, y_b));\n\n    vec4 color = mix(texture2D(u_image, pos_a), texture2D(u_image, pos_b), u_fade);\n\n    gl_FragColor = color * alpha * opacity;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\n// We scale the distance before adding it to the buffers so that we can store\n// long distances for long segments. Use this value to unscale the distance.\n#define LINE_DISTANCE_SCALE 2.0\n\n// the distance over which the line edge fades out.\n// Retina devices need a smaller distance to avoid aliasing.\n#define ANTIALIASING 1.0 / DEVICE_PIXEL_RATIO / 2.0\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform mediump float u_width;\nuniform vec2 u_gl_units_to_pixels;\n\nvarying vec2 v_normal;\nvarying vec2 v_width2;\nvarying float v_linesofar;\nvarying float v_gamma_scale;\n\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define lowp float offset\n#pragma mapbox: define mediump float gapwidth\n\nvoid main() {\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n    #pragma mapbox: initialize lowp float offset\n    #pragma mapbox: initialize mediump float gapwidth\n\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n    // these transformations used to be applied in the JS and native code bases. \n    // moved them into the shader for clarity and simplicity. \n    gapwidth = gapwidth / 2.0;\n    float width = u_width / 2.0;\n    offset = -1.0 * offset; \n\n    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n    float outset = gapwidth + width * (gapwidth > 0.0 ? 2.0 : 1.0) + ANTIALIASING;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist = outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit to get the position\n    vec2 pos = floor(a_pos * 0.5);\n\n    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;\n\n    // calculate how much the perspective view squishes or stretches the extrude\n    float extrude_length_without_perspective = length(dist);\n    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_gl_units_to_pixels);\n    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n\n    v_linesofar = a_linesofar;\n    v_width2 = vec2(outset, inset);\n}\n"
    },
    lineSDF: {
        fragmentSource: "\nuniform sampler2D u_image;\nuniform float u_sdfgamma;\nuniform float u_mix;\n\nvarying vec2 v_normal;\nvarying vec2 v_width2;\nvarying vec2 v_tex_a;\nvarying vec2 v_tex_b;\nvarying float v_gamma_scale;\n\n#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n\n    // Calculate the distance of the pixel from the line in pixels.\n    float dist = length(v_normal) * v_width2.s;\n\n    // Calculate the antialiasing fade factor. This is either when fading in\n    // the line in case of an offset line (v_width2.t) or when fading out\n    // (v_width2.s)\n    float blur2 = (blur + 1.0 / DEVICE_PIXEL_RATIO) * v_gamma_scale;\n    float alpha = clamp(min(dist - (v_width2.t - blur2), v_width2.s - dist) / blur2, 0.0, 1.0);\n\n    float sdfdist_a = texture2D(u_image, v_tex_a).a;\n    float sdfdist_b = texture2D(u_image, v_tex_b).a;\n    float sdfdist = mix(sdfdist_a, sdfdist_b, u_mix);\n    alpha *= smoothstep(0.5 - u_sdfgamma, 0.5 + u_sdfgamma, sdfdist);\n\n    gl_FragColor = color * (alpha * opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "// floor(127 / 2) == 63.0\n// the maximum allowed miter limit is 2.0 at the moment. the extrude normal is\n// stored in a byte (-128..127). we scale regular normals up to length 63, but\n// there are also \"special\" normals that have a bigger length (of up to 126 in\n// this case).\n// #define scale 63.0\n#define scale 0.015873016\n\n// We scale the distance before adding it to the buffers so that we can store\n// long distances for long segments. Use this value to unscale the distance.\n#define LINE_DISTANCE_SCALE 2.0\n\n// the distance over which the line edge fades out.\n// Retina devices need a smaller distance to avoid aliasing.\n#define ANTIALIASING 1.0 / DEVICE_PIXEL_RATIO / 2.0\n\nattribute vec2 a_pos;\nattribute vec4 a_data;\n\nuniform mat4 u_matrix;\nuniform mediump float u_ratio;\nuniform vec2 u_patternscale_a;\nuniform float u_tex_y_a;\nuniform vec2 u_patternscale_b;\nuniform float u_tex_y_b;\nuniform vec2 u_gl_units_to_pixels;\nuniform mediump float u_width;\n\nvarying vec2 v_normal;\nvarying vec2 v_width2;\nvarying vec2 v_tex_a;\nvarying vec2 v_tex_b;\nvarying float v_gamma_scale;\n\n#pragma mapbox: define lowp vec4 color\n#pragma mapbox: define lowp float blur\n#pragma mapbox: define lowp float opacity\n#pragma mapbox: define mediump float gapwidth\n#pragma mapbox: define lowp float offset\n\nvoid main() {\n    #pragma mapbox: initialize lowp vec4 color\n    #pragma mapbox: initialize lowp float blur\n    #pragma mapbox: initialize lowp float opacity\n    #pragma mapbox: initialize mediump float gapwidth\n    #pragma mapbox: initialize lowp float offset\n\n    vec2 a_extrude = a_data.xy - 128.0;\n    float a_direction = mod(a_data.z, 4.0) - 1.0;\n    float a_linesofar = (floor(a_data.z / 4.0) + a_data.w * 64.0) * LINE_DISTANCE_SCALE;\n\n    // We store the texture normals in the most insignificant bit\n    // transform y so that 0 => -1 and 1 => 1\n    // In the texture normal, x is 0 if the normal points straight up/down and 1 if it's a round cap\n    // y is 1 if the normal points up, and -1 if it points down\n    mediump vec2 normal = mod(a_pos, 2.0);\n    normal.y = sign(normal.y - 0.5);\n    v_normal = normal;\n\n    // these transformations used to be applied in the JS and native code bases. \n    // moved them into the shader for clarity and simplicity. \n    gapwidth = gapwidth / 2.0;\n    float width = u_width / 2.0;\n    offset = -1.0 * offset;\n \n    float inset = gapwidth + (gapwidth > 0.0 ? ANTIALIASING : 0.0);\n    float outset = gapwidth + width * (gapwidth > 0.0 ? 2.0 : 1.0) + ANTIALIASING;\n\n    // Scale the extrusion vector down to a normal and then up by the line width\n    // of this vertex.\n    mediump vec2 dist =outset * a_extrude * scale;\n\n    // Calculate the offset when drawing a line that is to the side of the actual line.\n    // We do this by creating a vector that points towards the extrude, but rotate\n    // it when we're drawing round end points (a_direction = -1 or 1) since their\n    // extrude vector points in another direction.\n    mediump float u = 0.5 * a_direction;\n    mediump float t = 1.0 - abs(u);\n    mediump vec2 offset2 = offset * a_extrude * scale * normal.y * mat2(t, -u, u, t);\n\n    // Remove the texture normal bit to get the position\n    vec2 pos = floor(a_pos * 0.5);\n\n    vec4 projected_extrude = u_matrix * vec4(dist / u_ratio, 0.0, 0.0);\n    gl_Position = u_matrix * vec4(pos + offset2 / u_ratio, 0.0, 1.0) + projected_extrude;\n\n    // calculate how much the perspective view squishes or stretches the extrude\n    float extrude_length_without_perspective = length(dist);\n    float extrude_length_with_perspective = length(projected_extrude.xy / gl_Position.w * u_gl_units_to_pixels);\n    v_gamma_scale = extrude_length_without_perspective / extrude_length_with_perspective;\n\n    v_tex_a = vec2(a_linesofar * u_patternscale_a.x, normal.y * u_patternscale_a.y + u_tex_y_a);\n    v_tex_b = vec2(a_linesofar * u_patternscale_b.x, normal.y * u_patternscale_b.y + u_tex_y_b);\n\n    v_width2 = vec2(outset, inset);\n}\n"
    },
    raster: {
        fragmentSource: "uniform float u_fade_t;\nuniform float u_opacity;\nuniform sampler2D u_image0;\nuniform sampler2D u_image1;\nvarying vec2 v_pos0;\nvarying vec2 v_pos1;\n\nuniform float u_brightness_low;\nuniform float u_brightness_high;\n\nuniform float u_saturation_factor;\nuniform float u_contrast_factor;\nuniform vec3 u_spin_weights;\n\nvoid main() {\n\n    // read and cross-fade colors from the main and parent tiles\n    vec4 color0 = texture2D(u_image0, v_pos0);\n    vec4 color1 = texture2D(u_image1, v_pos1);\n    vec4 color = mix(color0, color1, u_fade_t);\n    color.a *= u_opacity;\n    vec3 rgb = color.rgb;\n\n    // spin\n    rgb = vec3(\n        dot(rgb, u_spin_weights.xyz),\n        dot(rgb, u_spin_weights.zxy),\n        dot(rgb, u_spin_weights.yzx));\n\n    // saturation\n    float average = (color.r + color.g + color.b) / 3.0;\n    rgb += (average - rgb) * u_saturation_factor;\n\n    // contrast\n    rgb = (rgb - 0.5) * u_contrast_factor + 0.5;\n\n    // brightness\n    vec3 u_high_vec = vec3(u_brightness_low, u_brightness_low, u_brightness_low);\n    vec3 u_low_vec = vec3(u_brightness_high, u_brightness_high, u_brightness_high);\n\n    gl_FragColor = vec4(mix(u_high_vec, u_low_vec, rgb) * color.a, color.a);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "uniform mat4 u_matrix;\nuniform vec2 u_tl_parent;\nuniform float u_scale_parent;\nuniform float u_buffer_scale;\n\nattribute vec2 a_pos;\nattribute vec2 a_texture_pos;\n\nvarying vec2 v_pos0;\nvarying vec2 v_pos1;\n\nvoid main() {\n    gl_Position = u_matrix * vec4(a_pos, 0, 1);\n    v_pos0 = (((a_texture_pos / 32767.0) - 0.5) / u_buffer_scale ) + 0.5;\n    v_pos1 = (v_pos0 * u_scale_parent) + u_tl_parent;\n}\n"
    },
    symbolIcon: {
        fragmentSource: "uniform sampler2D u_texture;\nuniform sampler2D u_fadetexture;\nuniform lowp float u_opacity;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\n\nvoid main() {\n    lowp float alpha = texture2D(u_fadetexture, v_fade_tex).a * u_opacity;\n    gl_FragColor = texture2D(u_texture, v_tex) * alpha;\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "attribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec2 a_texture_pos;\nattribute vec4 a_data;\n\n\n// matrix is for the vertex position.\nuniform mat4 u_matrix;\n\nuniform mediump float u_zoom;\nuniform bool u_rotate_with_map;\nuniform vec2 u_extrude_scale;\n\nuniform vec2 u_texsize;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\n\nvoid main() {\n    vec2 a_tex = a_texture_pos.xy;\n    mediump float a_labelminzoom = a_data[0];\n    mediump vec2 a_zoom = a_data.pq;\n    mediump float a_minzoom = a_zoom[0];\n    mediump float a_maxzoom = a_zoom[1];\n\n    // u_zoom is the current zoom level adjusted for the change in font size\n    mediump float z = 2.0 - step(a_minzoom, u_zoom) - (1.0 - step(a_maxzoom, u_zoom));\n\n    vec2 extrude = u_extrude_scale * (a_offset / 64.0);\n    if (u_rotate_with_map) {\n        gl_Position = u_matrix * vec4(a_pos + extrude, 0, 1);\n        gl_Position.z += z * gl_Position.w;\n    } else {\n        gl_Position = u_matrix * vec4(a_pos, 0, 1) + vec4(extrude, 0, 0);\n    }\n\n    v_tex = a_tex / u_texsize;\n    v_fade_tex = vec2(a_labelminzoom / 255.0, 0.0);\n}\n"
    },
    symbolSDF: {
        fragmentSource: "uniform sampler2D u_texture;\nuniform sampler2D u_fadetexture;\nuniform lowp vec4 u_color;\nuniform lowp float u_opacity;\nuniform lowp float u_buffer;\nuniform lowp float u_gamma;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\nvarying float v_gamma_scale;\n\nvoid main() {\n    lowp float dist = texture2D(u_texture, v_tex).a;\n    lowp float fade_alpha = texture2D(u_fadetexture, v_fade_tex).a;\n    lowp float gamma = u_gamma * v_gamma_scale;\n    lowp float alpha = smoothstep(u_buffer - gamma, u_buffer + gamma, dist) * fade_alpha;\n\n    gl_FragColor = u_color * (alpha * u_opacity);\n\n#ifdef OVERDRAW_INSPECTOR\n    gl_FragColor = vec4(1.0);\n#endif\n}\n",
        vertexSource: "const float PI = 3.141592653589793;\n\nattribute vec2 a_pos;\nattribute vec2 a_offset;\nattribute vec2 a_texture_pos;\nattribute vec4 a_data;\n\n\n// matrix is for the vertex position.\nuniform mat4 u_matrix;\n\nuniform mediump float u_zoom;\nuniform bool u_rotate_with_map;\nuniform bool u_pitch_with_map;\nuniform mediump float u_pitch;\nuniform mediump float u_bearing;\nuniform mediump float u_aspect_ratio;\nuniform vec2 u_extrude_scale;\n\nuniform vec2 u_texsize;\n\nvarying vec2 v_tex;\nvarying vec2 v_fade_tex;\nvarying float v_gamma_scale;\n\nvoid main() {\n    vec2 a_tex = a_texture_pos.xy;\n    mediump float a_labelminzoom = a_data[0];\n    mediump vec2 a_zoom = a_data.pq;\n    mediump float a_minzoom = a_zoom[0];\n    mediump float a_maxzoom = a_zoom[1];\n\n    // u_zoom is the current zoom level adjusted for the change in font size\n    mediump float z = 2.0 - step(a_minzoom, u_zoom) - (1.0 - step(a_maxzoom, u_zoom));\n\n    // pitch-alignment: map\n    // rotation-alignment: map | viewport\n    if (u_pitch_with_map) {\n        lowp float angle = u_rotate_with_map ? (a_data[1] / 256.0 * 2.0 * PI) : u_bearing;\n        lowp float asin = sin(angle);\n        lowp float acos = cos(angle);\n        mat2 RotationMatrix = mat2(acos, asin, -1.0 * asin, acos);\n        vec2 offset = RotationMatrix * a_offset;\n        vec2 extrude = u_extrude_scale * (offset / 64.0);\n        gl_Position = u_matrix * vec4(a_pos + extrude, 0, 1);\n        gl_Position.z += z * gl_Position.w;\n    // pitch-alignment: viewport\n    // rotation-alignment: map\n    } else if (u_rotate_with_map) {\n        // foreshortening factor to apply on pitched maps\n        // as a label goes from horizontal <=> vertical in angle\n        // it goes from 0% foreshortening to up to around 70% foreshortening\n        lowp float pitchfactor = 1.0 - cos(u_pitch * sin(u_pitch * 0.75));\n\n        lowp float lineangle = a_data[1] / 256.0 * 2.0 * PI;\n\n        // use the lineangle to position points a,b along the line\n        // project the points and calculate the label angle in projected space\n        // this calculation allows labels to be rendered unskewed on pitched maps\n        vec4 a = u_matrix * vec4(a_pos, 0, 1);\n        vec4 b = u_matrix * vec4(a_pos + vec2(cos(lineangle),sin(lineangle)), 0, 1);\n        lowp float angle = atan((b[1]/b[3] - a[1]/a[3])/u_aspect_ratio, b[0]/b[3] - a[0]/a[3]);\n        lowp float asin = sin(angle);\n        lowp float acos = cos(angle);\n        mat2 RotationMatrix = mat2(acos, -1.0 * asin, asin, acos);\n\n        vec2 offset = RotationMatrix * (vec2((1.0-pitchfactor)+(pitchfactor*cos(angle*2.0)), 1.0) * a_offset);\n        vec2 extrude = u_extrude_scale * (offset / 64.0);\n        gl_Position = u_matrix * vec4(a_pos, 0, 1) + vec4(extrude, 0, 0);\n        gl_Position.z += z * gl_Position.w;\n    // pitch-alignment: viewport\n    // rotation-alignment: viewport\n    } else {\n        vec2 extrude = u_extrude_scale * (a_offset / 64.0);\n        gl_Position = u_matrix * vec4(a_pos, 0, 1) + vec4(extrude, 0, 0);\n    }\n\n    v_gamma_scale = gl_Position.w;\n\n    v_tex = a_tex / u_texsize;\n    v_fade_tex = vec2(a_labelminzoom / 255.0, 0.0);\n}\n"
    }
};
},{"path":1}],109:[function(require,module,exports){
'use strict';
var VertexArrayObject = function VertexArrayObject() {
    this.boundProgram = null;
    this.boundVertexBuffer = null;
    this.boundVertexBuffer2 = null;
    this.boundElementBuffer = null;
    this.boundVertexOffset = null;
    this.vao = null;
};
VertexArrayObject.prototype.bind = function bind(gl, program, layoutVertexBuffer, elementBuffer, vertexBuffer2, vertexOffset) {
    if (gl.extVertexArrayObject === undefined) {
        gl.extVertexArrayObject = gl.getExtension('OES_vertex_array_object');
    }
    var isFreshBindRequired = !this.vao || this.boundProgram !== program || this.boundVertexBuffer !== layoutVertexBuffer || this.boundVertexBuffer2 !== vertexBuffer2 || this.boundElementBuffer !== elementBuffer || this.boundVertexOffset !== vertexOffset;
    if (!gl.extVertexArrayObject || isFreshBindRequired) {
        this.freshBind(gl, program, layoutVertexBuffer, elementBuffer, vertexBuffer2, vertexOffset);
        this.gl = gl;
    } else {
        gl.extVertexArrayObject.bindVertexArrayOES(this.vao);
    }
};
VertexArrayObject.prototype.freshBind = function freshBind(gl, program, layoutVertexBuffer, elementBuffer, vertexBuffer2, vertexOffset) {
    var numPrevAttributes;
    var numNextAttributes = program.numAttributes;
    if (gl.extVertexArrayObject) {
        if (this.vao)
            this.destroy();
        this.vao = gl.extVertexArrayObject.createVertexArrayOES();
        gl.extVertexArrayObject.bindVertexArrayOES(this.vao);
        numPrevAttributes = 0;
        this.boundProgram = program;
        this.boundVertexBuffer = layoutVertexBuffer;
        this.boundVertexBuffer2 = vertexBuffer2;
        this.boundElementBuffer = elementBuffer;
        this.boundVertexOffset = vertexOffset;
    } else {
        numPrevAttributes = gl.currentNumAttributes || 0;
        for (var i = numNextAttributes; i < numPrevAttributes; i++) {
            gl.disableVertexAttribArray(i);
        }
    }
    for (var j = numPrevAttributes; j < numNextAttributes; j++) {
        gl.enableVertexAttribArray(j);
    }
    layoutVertexBuffer.bind(gl);
    layoutVertexBuffer.setVertexAttribPointers(gl, program, vertexOffset);
    if (vertexBuffer2) {
        vertexBuffer2.bind(gl);
        vertexBuffer2.setVertexAttribPointers(gl, program, vertexOffset);
    }
    if (elementBuffer) {
        elementBuffer.bind(gl);
    }
    gl.currentNumAttributes = numNextAttributes;
};
VertexArrayObject.prototype.destroy = function destroy() {
    if (this.vao) {
        this.gl.extVertexArrayObject.deleteVertexArrayOES(this.vao);
        this.vao = null;
    }
};
module.exports = VertexArrayObject;
},{}],110:[function(require,module,exports){
'use strict';
var Evented = require('../util/evented');
var util = require('../util/util');
var window = require('../util/window');
var EXTENT = require('../data/extent');
var GeoJSONSource = function (Evented) {
    function GeoJSONSource(id, options, dispatcher, eventedParent) {
        Evented.call(this);
        options = options || {};
        this.id = id;
        this.type = 'geojson';
        this.minzoom = 0;
        this.maxzoom = 18;
        this.tileSize = 512;
        this.isTileClipped = true;
        this.reparseOverscaled = true;
        this.dispatcher = dispatcher;
        this.setEventedParent(eventedParent);
        this._data = options.data;
        if (options.maxzoom !== undefined)
            this.maxzoom = options.maxzoom;
        if (options.type)
            this.type = options.type;
        var scale = EXTENT / this.tileSize;
        this.workerOptions = util.extend({
            source: this.id,
            cluster: options.cluster || false,
            geojsonVtOptions: {
                buffer: (options.buffer !== undefined ? options.buffer : 128) * scale,
                tolerance: (options.tolerance !== undefined ? options.tolerance : 0.375) * scale,
                extent: EXTENT,
                maxZoom: this.maxzoom
            },
            superclusterOptions: {
                maxZoom: Math.min(options.clusterMaxZoom, this.maxzoom - 1) || this.maxzoom - 1,
                extent: EXTENT,
                radius: (options.clusterRadius || 50) * scale,
                log: false
            }
        }, options.workerOptions);
    }
    if (Evented)
        GeoJSONSource.__proto__ = Evented;
    GeoJSONSource.prototype = Object.create(Evented && Evented.prototype);
    GeoJSONSource.prototype.constructor = GeoJSONSource;
    GeoJSONSource.prototype.load = function load() {
        var this$1 = this;
        this.fire('dataloading', { dataType: 'source' });
        this._updateWorkerData(function (err) {
            if (err) {
                this$1.fire('error', { error: err });
                return;
            }
            this$1.fire('data', { dataType: 'source' });
            this$1.fire('source.load');
        });
    };
    GeoJSONSource.prototype.onAdd = function onAdd(map) {
        this.load();
        this.map = map;
    };
    GeoJSONSource.prototype.setData = function setData(data) {
        var this$1 = this;
        this._data = data;
        this.fire('dataloading', { dataType: 'source' });
        this._updateWorkerData(function (err) {
            if (err) {
                return this$1.fire('error', { error: err });
            }
            this$1.fire('data', { dataType: 'source' });
        });
        return this;
    };
    GeoJSONSource.prototype._updateWorkerData = function _updateWorkerData(callback) {
        var this$1 = this;
        var options = util.extend({}, this.workerOptions);
        var data = this._data;
        if (typeof data === 'string') {
            options.url = resolveURL(data);
        } else {
            options.data = JSON.stringify(data);
        }
        this.workerID = this.dispatcher.send(this.type + '.loadData', options, function (err) {
            this$1._loaded = true;
            callback(err);
        });
    };
    GeoJSONSource.prototype.loadTile = function loadTile(tile, callback) {
        var this$1 = this;
        var overscaling = tile.coord.z > this.maxzoom ? Math.pow(2, tile.coord.z - this.maxzoom) : 1;
        var params = {
            type: this.type,
            uid: tile.uid,
            coord: tile.coord,
            zoom: tile.coord.z,
            maxZoom: this.maxzoom,
            tileSize: this.tileSize,
            source: this.id,
            overscaling: overscaling,
            angle: this.map.transform.angle,
            pitch: this.map.transform.pitch,
            showCollisionBoxes: this.map.showCollisionBoxes
        };
        tile.workerID = this.dispatcher.send('loadTile', params, function (err, data) {
            tile.unloadVectorData();
            if (tile.aborted)
                return;
            if (err) {
                return callback(err);
            }
            tile.loadVectorData(data, this$1.map.painter);
            if (tile.redoWhenDone) {
                tile.redoWhenDone = false;
                tile.redoPlacement(this$1);
            }
            return callback(null);
        }, this.workerID);
    };
    GeoJSONSource.prototype.abortTile = function abortTile(tile) {
        tile.aborted = true;
    };
    GeoJSONSource.prototype.unloadTile = function unloadTile(tile) {
        tile.unloadVectorData();
        this.dispatcher.send('removeTile', {
            uid: tile.uid,
            type: this.type,
            source: this.id
        }, function () {
        }, tile.workerID);
    };
    GeoJSONSource.prototype.onRemove = function onRemove() {
        this.dispatcher.broadcast('removeSource', {
            type: this.type,
            source: this.id
        }, function () {
        });
    };
    GeoJSONSource.prototype.serialize = function serialize() {
        return {
            type: this.type,
            data: this._data
        };
    };
    return GeoJSONSource;
}(Evented);
function resolveURL(url) {
    var a = window.document.createElement('a');
    a.href = url;
    return a.href;
}
module.exports = GeoJSONSource;
},{"../data/extent":81,"../util/evented":186,"../util/util":197,"../util/window":180}],111:[function(require,module,exports){
'use strict';
var ajax = require('../util/ajax');
var rewind = require('geojson-rewind');
var GeoJSONWrapper = require('./geojson_wrapper');
var vtpbf = require('vt-pbf');
var supercluster = require('supercluster');
var geojsonvt = require('geojson-vt');
var VectorTileWorkerSource = require('./vector_tile_worker_source');
var GeoJSONWorkerSource = function (VectorTileWorkerSource) {
    function GeoJSONWorkerSource(actor, layerIndex, loadGeoJSON) {
        VectorTileWorkerSource.call(this, actor, layerIndex);
        if (loadGeoJSON) {
            this.loadGeoJSON = loadGeoJSON;
        }
        this._geoJSONIndexes = {};
    }
    if (VectorTileWorkerSource)
        GeoJSONWorkerSource.__proto__ = VectorTileWorkerSource;
    GeoJSONWorkerSource.prototype = Object.create(VectorTileWorkerSource && VectorTileWorkerSource.prototype);
    GeoJSONWorkerSource.prototype.constructor = GeoJSONWorkerSource;
    GeoJSONWorkerSource.prototype.loadVectorData = function loadVectorData(params, callback) {
        var source = params.source, coord = params.coord;
        if (!this._geoJSONIndexes[source]) {
            return callback(null, null);
        }
        var geoJSONTile = this._geoJSONIndexes[source].getTile(Math.min(coord.z, params.maxZoom), coord.x, coord.y);
        if (!geoJSONTile) {
            return callback(null, null);
        }
        var geojsonWrapper = new GeoJSONWrapper(geoJSONTile.features);
        geojsonWrapper.name = '_geojsonTileLayer';
        var pbf = vtpbf({ layers: { '_geojsonTileLayer': geojsonWrapper } });
        if (pbf.byteOffset !== 0 || pbf.byteLength !== pbf.buffer.byteLength) {
            pbf = new Uint8Array(pbf);
        }
        geojsonWrapper.rawData = pbf.buffer;
        callback(null, geojsonWrapper);
    };
    GeoJSONWorkerSource.prototype.loadData = function loadData(params, callback) {
        var handleData = function (err, data) {
            var this$1 = this;
            if (err)
                return callback(err);
            if (typeof data != 'object') {
                return callback(new Error('Input data is not a valid GeoJSON object.'));
            }
            rewind(data, true);
            this._indexData(data, params, function (err, indexed) {
                if (err) {
                    return callback(err);
                }
                this$1._geoJSONIndexes[params.source] = indexed;
                callback(null);
            });
        }.bind(this);
        this.loadGeoJSON(params, handleData);
    };
    GeoJSONWorkerSource.prototype.loadGeoJSON = function loadGeoJSON(params, callback) {
        if (params.url) {
            ajax.getJSON(params.url, callback);
        } else if (typeof params.data === 'string') {
            try {
                return callback(null, JSON.parse(params.data));
            } catch (e) {
                return callback(new Error('Input data is not a valid GeoJSON object.'));
            }
        } else {
            return callback(new Error('Input data is not a valid GeoJSON object.'));
        }
    };
    GeoJSONWorkerSource.prototype.removeSource = function removeSource(params) {
        if (this._geoJSONIndexes[params.source]) {
            delete this._geoJSONIndexes[params.source];
        }
    };
    GeoJSONWorkerSource.prototype._indexData = function _indexData(data, params, callback) {
        try {
            if (params.cluster) {
                callback(null, supercluster(params.superclusterOptions).load(data.features));
            } else {
                callback(null, geojsonvt(data, params.geojsonVtOptions));
            }
        } catch (err) {
            return callback(err);
        }
    };
    return GeoJSONWorkerSource;
}(VectorTileWorkerSource);
module.exports = GeoJSONWorkerSource;
},{"../util/ajax":177,"./geojson_wrapper":112,"./vector_tile_worker_source":123,"geojson-rewind":17,"geojson-vt":21,"supercluster":207,"vt-pbf":214}],112:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var VectorTileFeature = require('vector-tile').VectorTileFeature;
var EXTENT = require('../data/extent');
var FeatureWrapper = function FeatureWrapper(feature) {
    var this$1 = this;
    this.type = feature.type;
    if (feature.type === 1) {
        this.rawGeometry = [];
        for (var i = 0; i < feature.geometry.length; i++) {
            this$1.rawGeometry.push([feature.geometry[i]]);
        }
    } else {
        this.rawGeometry = feature.geometry;
    }
    this.properties = feature.tags;
    this.extent = EXTENT;
};
FeatureWrapper.prototype.loadGeometry = function loadGeometry() {
    var this$1 = this;
    var rings = this.rawGeometry;
    this.geometry = [];
    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i], newRing = [];
        for (var j = 0; j < ring.length; j++) {
            newRing.push(new Point(ring[j][0], ring[j][1]));
        }
        this$1.geometry.push(newRing);
    }
    return this.geometry;
};
FeatureWrapper.prototype.bbox = function bbox() {
    if (!this.geometry)
        this.loadGeometry();
    var rings = this.geometry;
    var x1 = Infinity, x2 = -Infinity, y1 = Infinity, y2 = -Infinity;
    for (var i = 0; i < rings.length; i++) {
        var ring = rings[i];
        for (var j = 0; j < ring.length; j++) {
            var coord = ring[j];
            x1 = Math.min(x1, coord.x);
            x2 = Math.max(x2, coord.x);
            y1 = Math.min(y1, coord.y);
            y2 = Math.max(y2, coord.y);
        }
    }
    return [
        x1,
        y1,
        x2,
        y2
    ];
};
FeatureWrapper.prototype.toGeoJSON = function toGeoJSON() {
    VectorTileFeature.prototype.toGeoJSON.call(this);
};
var GeoJSONWrapper = function GeoJSONWrapper(features) {
    this.features = features;
    this.length = features.length;
    this.extent = EXTENT;
};
GeoJSONWrapper.prototype.feature = function feature(i) {
    return new FeatureWrapper(this.features[i]);
};
module.exports = GeoJSONWrapper;
},{"../data/extent":81,"point-geometry":204,"vector-tile":210}],113:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var window = require('../util/window');
var TileCoord = require('./tile_coord');
var LngLat = require('../geo/lng_lat');
var Point = require('point-geometry');
var Evented = require('../util/evented');
var ajax = require('../util/ajax');
var EXTENT = require('../data/extent');
var RasterBoundsArray = require('../data/raster_bounds_array');
var Buffer = require('../data/buffer');
var VertexArrayObject = require('../render/vertex_array_object');
var ImageSource = function (Evented) {
    function ImageSource(id, options, dispatcher, eventedParent) {
        Evented.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.coordinates = options.coordinates;
        this.minzoom = 0;
        this.maxzoom = 22;
        this.tileSize = 512;
        this.setEventedParent(eventedParent);
        this.options = options;
    }
    if (Evented)
        ImageSource.__proto__ = Evented;
    ImageSource.prototype = Object.create(Evented && Evented.prototype);
    ImageSource.prototype.constructor = ImageSource;
    ImageSource.prototype.load = function load() {
        var this$1 = this;
        this.fire('dataloading', { dataType: 'source' });
        this.url = this.options.url;
        ajax.getImage(this.options.url, function (err, image) {
            if (err)
                return this$1.fire('error', { error: err });
            this$1.image = image;
            this$1._finishLoading();
        });
    };
    ImageSource.prototype._finishLoading = function _finishLoading() {
        this.fire('source.load');
        if (this.map) {
            this.setCoordinates(this.coordinates);
        }
    };
    ImageSource.prototype.onAdd = function onAdd(map) {
        this.load();
        this.map = map;
        if (this.image) {
            this.setCoordinates(this.coordinates);
        }
    };
    ImageSource.prototype.setCoordinates = function setCoordinates(coordinates) {
        this.coordinates = coordinates;
        var map = this.map;
        var cornerZ0Coords = coordinates.map(function (coord) {
            return map.transform.locationCoordinate(LngLat.convert(coord)).zoomTo(0);
        });
        var centerCoord = this.centerCoord = util.getCoordinatesCenter(cornerZ0Coords);
        centerCoord.column = Math.round(centerCoord.column);
        centerCoord.row = Math.round(centerCoord.row);
        this.minzoom = this.maxzoom = centerCoord.zoom;
        this.coord = new TileCoord(centerCoord.zoom, centerCoord.column, centerCoord.row);
        this._tileCoords = cornerZ0Coords.map(function (coord) {
            var zoomedCoord = coord.zoomTo(centerCoord.zoom);
            return new Point(Math.round((zoomedCoord.column - centerCoord.column) * EXTENT), Math.round((zoomedCoord.row - centerCoord.row) * EXTENT));
        });
        this.fire('data', { dataType: 'source' });
        return this;
    };
    ImageSource.prototype._setTile = function _setTile(tile) {
        this.tile = tile;
        var maxInt16 = 32767;
        var array = new RasterBoundsArray();
        array.emplaceBack(this._tileCoords[0].x, this._tileCoords[0].y, 0, 0);
        array.emplaceBack(this._tileCoords[1].x, this._tileCoords[1].y, maxInt16, 0);
        array.emplaceBack(this._tileCoords[3].x, this._tileCoords[3].y, 0, maxInt16);
        array.emplaceBack(this._tileCoords[2].x, this._tileCoords[2].y, maxInt16, maxInt16);
        this.tile.buckets = {};
        this.tile.boundsBuffer = Buffer.fromStructArray(array, Buffer.BufferType.VERTEX);
        this.tile.boundsVAO = new VertexArrayObject();
    };
    ImageSource.prototype.prepare = function prepare() {
        if (!this.tile || !this.image)
            return;
        this._prepareImage(this.map.painter.gl, this.image);
    };
    ImageSource.prototype._prepareImage = function _prepareImage(gl, image) {
        if (this.tile.state !== 'loaded') {
            this.tile.state = 'loaded';
            this.tile.texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, this.tile.texture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        } else if (image instanceof window.HTMLVideoElement) {
            gl.bindTexture(gl.TEXTURE_2D, this.tile.texture);
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, image);
        }
    };
    ImageSource.prototype.loadTile = function loadTile(tile, callback) {
        if (this.coord && this.coord.toString() === tile.coord.toString()) {
            this._setTile(tile);
            callback(null);
        } else {
            tile.state = 'errored';
            callback(null);
        }
    };
    ImageSource.prototype.serialize = function serialize() {
        return {
            type: 'image',
            urls: this.url,
            coordinates: this.coordinates
        };
    };
    return ImageSource;
}(Evented);
module.exports = ImageSource;
},{"../data/buffer":78,"../data/extent":81,"../data/raster_bounds_array":86,"../geo/lng_lat":89,"../render/vertex_array_object":109,"../util/ajax":177,"../util/evented":186,"../util/util":197,"../util/window":180,"./tile_coord":121,"point-geometry":204}],114:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var ajax = require('../util/ajax');
var browser = require('../util/browser');
var normalizeURL = require('../util/mapbox').normalizeSourceURL;
module.exports = function (options, callback) {
    var loaded = function (err, tileJSON) {
        if (err) {
            return callback(err);
        }
        var result = util.pick(tileJSON, [
            'tiles',
            'minzoom',
            'maxzoom',
            'attribution'
        ]);
        if (tileJSON.vector_layers) {
            result.vectorLayers = tileJSON.vector_layers;
            result.vectorLayerIds = result.vectorLayers.map(function (layer) {
                return layer.id;
            });
        }
        callback(null, result);
    };
    if (options.url) {
        ajax.getJSON(normalizeURL(options.url), loaded);
    } else {
        browser.frame(loaded.bind(null, null, options));
    }
};
},{"../util/ajax":177,"../util/browser":178,"../util/mapbox":193,"../util/util":197}],115:[function(require,module,exports){
'use strict';
var EXTENT = require('../data/extent');
module.exports = function (tile, pixelValue, z) {
    return pixelValue * (EXTENT / (tile.tileSize * Math.pow(2, z - tile.coord.z)));
};
},{"../data/extent":81}],116:[function(require,module,exports){
'use strict';
var TileCoord = require('./tile_coord');
exports.rendered = function (sourceCache, styleLayers, queryGeometry, params, zoom, bearing) {
    var tilesIn = sourceCache.tilesIn(queryGeometry);
    tilesIn.sort(sortTilesIn);
    var renderedFeatureLayers = [];
    for (var r = 0; r < tilesIn.length; r++) {
        var tileIn = tilesIn[r];
        if (!tileIn.tile.featureIndex)
            continue;
        renderedFeatureLayers.push(tileIn.tile.featureIndex.query({
            queryGeometry: tileIn.queryGeometry,
            scale: tileIn.scale,
            tileSize: tileIn.tile.tileSize,
            bearing: bearing,
            params: params
        }, styleLayers));
    }
    return mergeRenderedFeatureLayers(renderedFeatureLayers);
};
exports.source = function (sourceCache, params) {
    var tiles = sourceCache.getRenderableIds().map(function (id) {
        return sourceCache.getTileByID(id);
    });
    var result = [];
    var dataTiles = {};
    for (var i = 0; i < tiles.length; i++) {
        var tile = tiles[i];
        var dataID = new TileCoord(Math.min(tile.sourceMaxZoom, tile.coord.z), tile.coord.x, tile.coord.y, 0).id;
        if (!dataTiles[dataID]) {
            dataTiles[dataID] = true;
            tile.querySourceFeatures(result, params);
        }
    }
    return result;
};
function sortTilesIn(a, b) {
    var coordA = a.coord;
    var coordB = b.coord;
    return coordA.z - coordB.z || coordA.y - coordB.y || coordA.w - coordB.w || coordA.x - coordB.x;
}
function mergeRenderedFeatureLayers(tiles) {
    var result = tiles[0] || {};
    for (var i = 1; i < tiles.length; i++) {
        var tile = tiles[i];
        for (var layerID in tile) {
            var tileFeatures = tile[layerID];
            var resultFeatures = result[layerID];
            if (resultFeatures === undefined) {
                resultFeatures = result[layerID] = tileFeatures;
            } else {
                for (var f = 0; f < tileFeatures.length; f++) {
                    resultFeatures.push(tileFeatures[f]);
                }
            }
        }
    }
    return result;
}
},{"./tile_coord":121}],117:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var ajax = require('../util/ajax');
var Evented = require('../util/evented');
var loadTileJSON = require('./load_tilejson');
var normalizeURL = require('../util/mapbox').normalizeTileURL;
var RasterTileSource = function (Evented) {
    function RasterTileSource(id, options, dispatcher, eventedParent) {
        Evented.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.setEventedParent(eventedParent);
        this.minzoom = 0;
        this.maxzoom = 22;
        this.roundZoom = true;
        this.scheme = 'xyz';
        this.tileSize = 512;
        this._loaded = false;
        this.options = options;
        util.extend(this, util.pick(options, [
            'url',
            'scheme',
            'tileSize'
        ]));
    }
    if (Evented)
        RasterTileSource.__proto__ = Evented;
    RasterTileSource.prototype = Object.create(Evented && Evented.prototype);
    RasterTileSource.prototype.constructor = RasterTileSource;
    RasterTileSource.prototype.load = function load() {
        var this$1 = this;
        this.fire('dataloading', { dataType: 'source' });
        loadTileJSON(this.options, function (err, tileJSON) {
            if (err) {
                return this$1.fire('error', err);
            }
            util.extend(this$1, tileJSON);
            this$1.fire('data', { dataType: 'source' });
            this$1.fire('source.load');
        });
    };
    RasterTileSource.prototype.onAdd = function onAdd(map) {
        this.load();
        this.map = map;
    };
    RasterTileSource.prototype.serialize = function serialize() {
        return {
            type: 'raster',
            url: this.url,
            tileSize: this.tileSize,
            tiles: this.tiles
        };
    };
    RasterTileSource.prototype.loadTile = function loadTile(tile, callback) {
        var url = normalizeURL(tile.coord.url(this.tiles, null, this.scheme), this.url, this.tileSize);
        tile.request = ajax.getImage(url, done.bind(this));
        function done(err, img) {
            delete tile.request;
            if (tile.aborted) {
                this.state = 'unloaded';
                return callback(null);
            }
            if (err) {
                this.state = 'errored';
                return callback(err);
            }
            var gl = this.map.painter.gl;
            tile.texture = this.map.painter.getTileTexture(img.width);
            if (tile.texture) {
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, img);
            } else {
                tile.texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, tile.texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
                tile.texture.size = img.width;
            }
            gl.generateMipmap(gl.TEXTURE_2D);
            tile.state = 'loaded';
            callback(null);
        }
    };
    RasterTileSource.prototype.abortTile = function abortTile(tile) {
        if (tile.request) {
            tile.request.abort();
            delete tile.request;
        }
    };
    RasterTileSource.prototype.unloadTile = function unloadTile(tile) {
        if (tile.texture)
            this.map.painter.saveTileTexture(tile.texture);
    };
    return RasterTileSource;
}(Evented);
module.exports = RasterTileSource;
},{"../util/ajax":177,"../util/evented":186,"../util/mapbox":193,"../util/util":197,"./load_tilejson":114}],118:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var sourceTypes = {
    'vector': require('../source/vector_tile_source'),
    'raster': require('../source/raster_tile_source'),
    'geojson': require('../source/geojson_source'),
    'video': require('../source/video_source'),
    'image': require('../source/image_source')
};
exports.create = function (id, source, dispatcher, eventedParent) {
    source = new sourceTypes[source.type](id, source, dispatcher, eventedParent);
    if (source.id !== id) {
        throw new Error('Expected Source id to be ' + id + ' instead of ' + source.id);
    }
    util.bindAll([
        'load',
        'abort',
        'unload',
        'serialize',
        'prepare'
    ], source);
    return source;
};
exports.getType = function (name) {
    return sourceTypes[name];
};
exports.setType = function (name, type) {
    sourceTypes[name] = type;
};
},{"../source/geojson_source":110,"../source/image_source":113,"../source/raster_tile_source":117,"../source/vector_tile_source":122,"../source/video_source":124,"../util/util":197}],119:[function(require,module,exports){
'use strict';
var Source = require('./source');
var Tile = require('./tile');
var Evented = require('../util/evented');
var TileCoord = require('./tile_coord');
var Cache = require('../util/lru_cache');
var Coordinate = require('../geo/coordinate');
var util = require('../util/util');
var EXTENT = require('../data/extent');
var SourceCache = function (Evented) {
    function SourceCache(id, options, dispatcher) {
        Evented.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.on('source.load', function () {
            this._sourceLoaded = true;
        });
        this.on('error', function () {
            this._sourceErrored = true;
        });
        this.on('data', function (event) {
            if (this._sourceLoaded && event.dataType === 'source') {
                this.reload();
                if (this.transform) {
                    this.update(this.transform);
                }
            }
        });
        this._source = Source.create(id, options, dispatcher, this);
        this._tiles = {};
        this._cache = new Cache(0, this.unloadTile.bind(this));
        this._isIdRenderable = this._isIdRenderable.bind(this);
    }
    if (Evented)
        SourceCache.__proto__ = Evented;
    SourceCache.prototype = Object.create(Evented && Evented.prototype);
    SourceCache.prototype.constructor = SourceCache;
    SourceCache.prototype.onAdd = function onAdd(map) {
        this.map = map;
        if (this._source && this._source.onAdd) {
            this._source.onAdd(map);
        }
    };
    SourceCache.prototype.onRemove = function onRemove(map) {
        if (this._source && this._source.onRemove) {
            this._source.onRemove(map);
        }
    };
    SourceCache.prototype.loaded = function loaded() {
        var this$1 = this;
        if (this._sourceErrored) {
            return true;
        }
        if (!this._sourceLoaded) {
            return false;
        }
        for (var t in this._tiles) {
            var tile = this$1._tiles[t];
            if (tile.state !== 'loaded' && tile.state !== 'errored')
                return false;
        }
        return true;
    };
    SourceCache.prototype.getSource = function getSource() {
        return this._source;
    };
    SourceCache.prototype.loadTile = function loadTile(tile, callback) {
        return this._source.loadTile(tile, callback);
    };
    SourceCache.prototype.unloadTile = function unloadTile(tile) {
        if (this._source.unloadTile)
            return this._source.unloadTile(tile);
    };
    SourceCache.prototype.abortTile = function abortTile(tile) {
        if (this._source.abortTile)
            return this._source.abortTile(tile);
    };
    SourceCache.prototype.serialize = function serialize() {
        return this._source.serialize();
    };
    SourceCache.prototype.prepare = function prepare() {
        if (this._sourceLoaded && this._source.prepare)
            return this._source.prepare();
    };
    SourceCache.prototype.getIds = function getIds() {
        return Object.keys(this._tiles).map(Number).sort(compareKeyZoom);
    };
    SourceCache.prototype.getRenderableIds = function getRenderableIds() {
        return this.getIds().filter(this._isIdRenderable);
    };
    SourceCache.prototype._isIdRenderable = function _isIdRenderable(id) {
        return this._tiles[id].hasData() && !this._coveredTiles[id];
    };
    SourceCache.prototype.reload = function reload() {
        var this$1 = this;
        this._cache.reset();
        for (var i in this._tiles) {
            var tile = this$1._tiles[i];
            if (tile.state !== 'loading') {
                tile.state = 'reloading';
            }
            this$1.loadTile(this$1._tiles[i], this$1._tileLoaded.bind(this$1, this$1._tiles[i]));
        }
    };
    SourceCache.prototype._tileLoaded = function _tileLoaded(tile, err) {
        if (err) {
            tile.state = 'errored';
            this._source.fire('error', {
                tile: tile,
                error: err
            });
            return;
        }
        tile.sourceCache = this;
        tile.timeAdded = new Date().getTime();
        this._source.fire('data', {
            tile: tile,
            coord: tile.coord,
            dataType: 'tile'
        });
        if (this.map)
            this.map.painter.tileExtentVAO.vao = null;
    };
    SourceCache.prototype.getTile = function getTile(coord) {
        return this.getTileByID(coord.id);
    };
    SourceCache.prototype.getTileByID = function getTileByID(id) {
        return this._tiles[id];
    };
    SourceCache.prototype.getZoom = function getZoom(transform) {
        return transform.zoom + transform.scaleZoom(transform.tileSize / this._source.tileSize);
    };
    SourceCache.prototype.findLoadedChildren = function findLoadedChildren(coord, maxCoveringZoom, retain) {
        var this$1 = this;
        var found = false;
        for (var id in this._tiles) {
            var tile = this$1._tiles[id];
            if (retain[id] || !tile.hasData() || tile.coord.z <= coord.z || tile.coord.z > maxCoveringZoom)
                continue;
            var z2 = Math.pow(2, Math.min(tile.coord.z, this$1._source.maxzoom) - Math.min(coord.z, this$1._source.maxzoom));
            if (Math.floor(tile.coord.x / z2) !== coord.x || Math.floor(tile.coord.y / z2) !== coord.y)
                continue;
            retain[id] = true;
            found = true;
            while (tile && tile.coord.z - 1 > coord.z) {
                var parentId = tile.coord.parent(this$1._source.maxzoom).id;
                tile = this$1._tiles[parentId];
                if (tile && tile.hasData()) {
                    delete retain[id];
                    retain[parentId] = true;
                }
            }
        }
        return found;
    };
    SourceCache.prototype.findLoadedParent = function findLoadedParent(coord, minCoveringZoom, retain) {
        var this$1 = this;
        for (var z = coord.z - 1; z >= minCoveringZoom; z--) {
            coord = coord.parent(this$1._source.maxzoom);
            var tile = this$1._tiles[coord.id];
            if (tile && tile.hasData()) {
                retain[coord.id] = true;
                return tile;
            }
            if (this$1._cache.has(coord.id)) {
                retain[coord.id] = true;
                return this$1._cache.get(coord.id);
            }
        }
    };
    SourceCache.prototype.updateCacheSize = function updateCacheSize(transform) {
        var widthInTiles = Math.ceil(transform.width / transform.tileSize) + 1;
        var heightInTiles = Math.ceil(transform.height / transform.tileSize) + 1;
        var approxTilesInView = widthInTiles * heightInTiles;
        var commonZoomRange = 5;
        this._cache.setMaxSize(Math.floor(approxTilesInView * commonZoomRange));
    };
    SourceCache.prototype.update = function update(transform) {
        var this$1 = this;
        if (!this._sourceLoaded) {
            return;
        }
        var i;
        var coord;
        var tile;
        var parentTile;
        this.updateCacheSize(transform);
        var zoom = (this._source.roundZoom ? Math.round : Math.floor)(this.getZoom(transform));
        var minCoveringZoom = Math.max(zoom - SourceCache.maxOverzooming, this._source.minzoom);
        var maxCoveringZoom = Math.max(zoom + SourceCache.maxUnderzooming, this._source.minzoom);
        var retain = {};
        this._coveredTiles = {};
        var visibleCoords;
        if (!this.used) {
            visibleCoords = [];
        } else if (this._source.coord) {
            visibleCoords = [this._source.coord];
        } else {
            visibleCoords = transform.coveringTiles({
                tileSize: this._source.tileSize,
                minzoom: this._source.minzoom,
                maxzoom: this._source.maxzoom,
                roundZoom: this._source.roundZoom,
                reparseOverscaled: this._source.reparseOverscaled
            });
        }
        for (i = 0; i < visibleCoords.length; i++) {
            coord = visibleCoords[i];
            tile = this$1.addTile(coord);
            retain[coord.id] = true;
            if (tile.hasData())
                continue;
            if (!this$1.findLoadedChildren(coord, maxCoveringZoom, retain)) {
                parentTile = this$1.findLoadedParent(coord, minCoveringZoom, retain);
                if (parentTile) {
                    this$1.addTile(parentTile.coord);
                }
            }
        }
        var parentsForFading = {};
        var ids = Object.keys(retain);
        for (var k = 0; k < ids.length; k++) {
            var id = ids[k];
            coord = TileCoord.fromID(id);
            tile = this$1._tiles[id];
            if (tile && tile.fadeEndTime >= Date.now()) {
                if (this$1.findLoadedChildren(coord, maxCoveringZoom, retain)) {
                    retain[id] = true;
                }
                parentTile = this$1.findLoadedParent(coord, minCoveringZoom, parentsForFading);
                if (parentTile) {
                    this$1.addTile(parentTile.coord);
                }
            }
        }
        var fadedParent;
        for (fadedParent in parentsForFading) {
            if (!retain[fadedParent]) {
                this$1._coveredTiles[fadedParent] = true;
            }
        }
        for (fadedParent in parentsForFading) {
            retain[fadedParent] = true;
        }
        var remove = util.keysDifference(this._tiles, retain);
        for (i = 0; i < remove.length; i++) {
            this$1.removeTile(+remove[i]);
        }
        this.transform = transform;
    };
    SourceCache.prototype.addTile = function addTile(coord) {
        var tile = this._tiles[coord.id];
        if (tile)
            return tile;
        var wrapped = coord.wrapped();
        tile = this._tiles[wrapped.id];
        if (!tile) {
            tile = this._cache.get(wrapped.id);
            if (tile) {
                tile.redoPlacement(this._source);
            }
        }
        if (!tile) {
            var zoom = coord.z;
            var overscaling = zoom > this._source.maxzoom ? Math.pow(2, zoom - this._source.maxzoom) : 1;
            tile = new Tile(wrapped, this._source.tileSize * overscaling, this._source.maxzoom);
            this.loadTile(tile, this._tileLoaded.bind(this, tile));
        }
        tile.uses++;
        this._tiles[coord.id] = tile;
        this._source.fire('dataloading', {
            tile: tile,
            coord: tile.coord,
            dataType: 'tile'
        });
        return tile;
    };
    SourceCache.prototype.removeTile = function removeTile(id) {
        var tile = this._tiles[id];
        if (!tile)
            return;
        tile.uses--;
        delete this._tiles[id];
        this._source.fire('data', {
            tile: tile,
            coord: tile.coord,
            dataType: 'tile'
        });
        if (tile.uses > 0)
            return;
        if (tile.hasData()) {
            this._cache.add(tile.coord.wrapped().id, tile);
        } else {
            tile.aborted = true;
            this.abortTile(tile);
            this.unloadTile(tile);
        }
    };
    SourceCache.prototype.clearTiles = function clearTiles() {
        var this$1 = this;
        for (var id in this._tiles)
            this$1.removeTile(id);
        this._cache.reset();
    };
    SourceCache.prototype.tilesIn = function tilesIn(queryGeometry) {
        var this$1 = this;
        var tileResults = {};
        var ids = this.getIds();
        var minX = Infinity;
        var minY = Infinity;
        var maxX = -Infinity;
        var maxY = -Infinity;
        var z = queryGeometry[0].zoom;
        for (var k = 0; k < queryGeometry.length; k++) {
            var p = queryGeometry[k];
            minX = Math.min(minX, p.column);
            minY = Math.min(minY, p.row);
            maxX = Math.max(maxX, p.column);
            maxY = Math.max(maxY, p.row);
        }
        for (var i = 0; i < ids.length; i++) {
            var tile = this$1._tiles[ids[i]];
            var coord = TileCoord.fromID(ids[i]);
            var tileSpaceBounds = [
                coordinateToTilePoint(coord, tile.sourceMaxZoom, new Coordinate(minX, minY, z)),
                coordinateToTilePoint(coord, tile.sourceMaxZoom, new Coordinate(maxX, maxY, z))
            ];
            if (tileSpaceBounds[0].x < EXTENT && tileSpaceBounds[0].y < EXTENT && tileSpaceBounds[1].x >= 0 && tileSpaceBounds[1].y >= 0) {
                var tileSpaceQueryGeometry = [];
                for (var j = 0; j < queryGeometry.length; j++) {
                    tileSpaceQueryGeometry.push(coordinateToTilePoint(coord, tile.sourceMaxZoom, queryGeometry[j]));
                }
                var tileResult = tileResults[tile.coord.id];
                if (tileResult === undefined) {
                    tileResult = tileResults[tile.coord.id] = {
                        tile: tile,
                        coord: coord,
                        queryGeometry: [],
                        scale: Math.pow(2, this$1.transform.zoom - tile.coord.z)
                    };
                }
                tileResult.queryGeometry.push(tileSpaceQueryGeometry);
            }
        }
        var results = [];
        for (var t in tileResults) {
            results.push(tileResults[t]);
        }
        return results;
    };
    SourceCache.prototype.redoPlacement = function redoPlacement() {
        var this$1 = this;
        var ids = this.getIds();
        for (var i = 0; i < ids.length; i++) {
            var tile = this$1.getTileByID(ids[i]);
            tile.redoPlacement(this$1._source);
        }
    };
    SourceCache.prototype.getVisibleCoordinates = function getVisibleCoordinates() {
        var this$1 = this;
        var coords = this.getRenderableIds().map(TileCoord.fromID);
        for (var i = 0, list = coords; i < list.length; i += 1) {
            var coord = list[i];
            coord.posMatrix = this$1.transform.calculatePosMatrix(coord, this$1._source.maxzoom);
        }
        return coords;
    };
    return SourceCache;
}(Evented);
SourceCache.maxOverzooming = 10;
SourceCache.maxUnderzooming = 3;
function coordinateToTilePoint(tileCoord, sourceMaxZoom, coord) {
    var zoomedCoord = coord.zoomTo(Math.min(tileCoord.z, sourceMaxZoom));
    return {
        x: (zoomedCoord.column - (tileCoord.x + tileCoord.w * Math.pow(2, tileCoord.z))) * EXTENT,
        y: (zoomedCoord.row - tileCoord.y) * EXTENT
    };
}
function compareKeyZoom(a, b) {
    return a % 32 - b % 32;
}
module.exports = SourceCache;
},{"../data/extent":81,"../geo/coordinate":88,"../util/evented":186,"../util/lru_cache":192,"../util/util":197,"./source":118,"./tile":120,"./tile_coord":121}],120:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var Bucket = require('../data/bucket');
var FeatureIndex = require('../data/feature_index');
var vt = require('vector-tile');
var Protobuf = require('pbf');
var GeoJSONFeature = require('../util/vectortile_to_geojson');
var featureFilter = require('feature-filter');
var CollisionTile = require('../symbol/collision_tile');
var CollisionBoxArray = require('../symbol/collision_box');
var SymbolInstancesArray = require('../symbol/symbol_instances');
var SymbolQuadsArray = require('../symbol/symbol_quads');
var Tile = function Tile(coord, size, sourceMaxZoom) {
    this.coord = coord;
    this.uid = util.uniqueId();
    this.uses = 0;
    this.tileSize = size;
    this.sourceMaxZoom = sourceMaxZoom;
    this.buckets = {};
    this.state = 'loading';
};
Tile.prototype.registerFadeDuration = function registerFadeDuration(animationLoop, duration) {
    var fadeEndTime = duration + this.timeAdded;
    if (fadeEndTime < Date.now())
        return;
    if (this.fadeEndTime && fadeEndTime < this.fadeEndTime)
        return;
    this.fadeEndTime = fadeEndTime;
    animationLoop.set(this.fadeEndTime - Date.now());
};
Tile.prototype.loadVectorData = function loadVectorData(data, painter) {
    if (this.hasData()) {
        this.unloadVectorData(painter);
    }
    this.state = 'loaded';
    if (!data)
        return;
    if (data.rawTileData) {
        this.rawTileData = data.rawTileData;
    }
    this.collisionBoxArray = new CollisionBoxArray(data.collisionBoxArray);
    this.collisionTile = new CollisionTile(data.collisionTile, this.collisionBoxArray);
    this.symbolInstancesArray = new SymbolInstancesArray(data.symbolInstancesArray);
    this.symbolQuadsArray = new SymbolQuadsArray(data.symbolQuadsArray);
    this.featureIndex = new FeatureIndex(data.featureIndex, this.rawTileData, this.collisionTile);
    this.buckets = Bucket.deserialize(data.buckets, painter.style);
};
Tile.prototype.reloadSymbolData = function reloadSymbolData(data, style) {
    var this$1 = this;
    if (this.state === 'unloaded')
        return;
    this.collisionTile = new CollisionTile(data.collisionTile, this.collisionBoxArray);
    this.featureIndex.setCollisionTile(this.collisionTile);
    for (var id in this.buckets) {
        var bucket = this$1.buckets[id];
        if (bucket.type === 'symbol') {
            bucket.destroy();
            delete this$1.buckets[id];
        }
    }
    util.extend(this.buckets, Bucket.deserialize(data.buckets, style));
};
Tile.prototype.unloadVectorData = function unloadVectorData() {
    var this$1 = this;
    for (var id in this.buckets) {
        this$1.buckets[id].destroy();
    }
    this.buckets = {};
    this.collisionBoxArray = null;
    this.symbolQuadsArray = null;
    this.symbolInstancesArray = null;
    this.collisionTile = null;
    this.featureIndex = null;
    this.state = 'unloaded';
};
Tile.prototype.redoPlacement = function redoPlacement(source) {
    if (source.type !== 'vector' && source.type !== 'geojson') {
        return;
    }
    if (this.state !== 'loaded' || this.state === 'reloading') {
        this.redoWhenDone = true;
        return;
    }
    this.state = 'reloading';
    source.dispatcher.send('redoPlacement', {
        type: source.type,
        uid: this.uid,
        source: source.id,
        angle: source.map.transform.angle,
        pitch: source.map.transform.pitch,
        showCollisionBoxes: source.map.showCollisionBoxes
    }, done.bind(this), this.workerID);
    function done(_, data) {
        this.reloadSymbolData(data, source.map.style);
        source.fire('data', {
            tile: this,
            coord: this.coord,
            dataType: 'tile'
        });
        if (source.map)
            source.map.painter.tileExtentVAO.vao = null;
        this.state = 'loaded';
        if (this.redoWhenDone) {
            this.redoPlacement(source);
            this.redoWhenDone = false;
        }
    }
};
Tile.prototype.getBucket = function getBucket(layer) {
    return this.buckets[layer.id];
};
Tile.prototype.querySourceFeatures = function querySourceFeatures(result, params) {
    var this$1 = this;
    if (!this.rawTileData)
        return;
    if (!this.vtLayers) {
        this.vtLayers = new vt.VectorTile(new Protobuf(this.rawTileData)).layers;
    }
    var layer = this.vtLayers._geojsonTileLayer || this.vtLayers[params.sourceLayer];
    if (!layer)
        return;
    var filter = featureFilter(params && params.filter);
    var coord = {
        z: this.coord.z,
        x: this.coord.x,
        y: this.coord.y
    };
    for (var i = 0; i < layer.length; i++) {
        var feature = layer.feature(i);
        if (filter(feature)) {
            var geojsonFeature = new GeoJSONFeature(feature, this$1.coord.z, this$1.coord.x, this$1.coord.y);
            geojsonFeature.tile = coord;
            result.push(geojsonFeature);
        }
    }
};
Tile.prototype.hasData = function hasData() {
    return this.state === 'loaded' || this.state === 'reloading';
};
module.exports = Tile;
},{"../data/bucket":72,"../data/feature_index":82,"../symbol/collision_box":146,"../symbol/collision_tile":148,"../symbol/symbol_instances":157,"../symbol/symbol_quads":158,"../util/util":197,"../util/vectortile_to_geojson":198,"feature-filter":15,"pbf":203,"vector-tile":210}],121:[function(require,module,exports){
'use strict';
var WhooTS = require('whoots-js');
var Coordinate = require('../geo/coordinate');
var TileCoord = function TileCoord(z, x, y, w) {
    if (isNaN(w))
        w = 0;
    this.z = +z;
    this.x = +x;
    this.y = +y;
    this.w = +w;
    w *= 2;
    if (w < 0)
        w = w * -1 - 1;
    var dim = 1 << this.z;
    this.id = (dim * dim * w + dim * this.y + this.x) * 32 + this.z;
    this.posMatrix = null;
};
TileCoord.prototype.toString = function toString() {
    return this.z + '/' + this.x + '/' + this.y;
};
TileCoord.prototype.toCoordinate = function toCoordinate(sourceMaxZoom) {
    var zoom = Math.min(this.z, sourceMaxZoom === undefined ? this.z : sourceMaxZoom);
    var tileScale = Math.pow(2, zoom);
    var row = this.y;
    var column = this.x + tileScale * this.w;
    return new Coordinate(column, row, zoom);
};
TileCoord.prototype.url = function url(urls, sourceMaxZoom, scheme) {
    var bbox = WhooTS.getTileBBox(this.x, this.y, this.z);
    var quadkey = getQuadkey(this.z, this.x, this.y);
    return urls[(this.x + this.y) % urls.length].replace('{prefix}', (this.x % 16).toString(16) + (this.y % 16).toString(16)).replace('{z}', Math.min(this.z, sourceMaxZoom || this.z)).replace('{x}', this.x).replace('{y}', scheme === 'tms' ? Math.pow(2, this.z) - this.y - 1 : this.y).replace('{quadkey}', quadkey).replace('{bbox-epsg-3857}', bbox);
};
TileCoord.prototype.parent = function parent(sourceMaxZoom) {
    if (this.z === 0)
        return null;
    if (this.z > sourceMaxZoom) {
        return new TileCoord(this.z - 1, this.x, this.y, this.w);
    }
    return new TileCoord(this.z - 1, Math.floor(this.x / 2), Math.floor(this.y / 2), this.w);
};
TileCoord.prototype.wrapped = function wrapped() {
    return new TileCoord(this.z, this.x, this.y, 0);
};
TileCoord.prototype.children = function children(sourceMaxZoom) {
    if (this.z >= sourceMaxZoom) {
        return [new TileCoord(this.z + 1, this.x, this.y, this.w)];
    }
    var z = this.z + 1;
    var x = this.x * 2;
    var y = this.y * 2;
    return [
        new TileCoord(z, x, y, this.w),
        new TileCoord(z, x + 1, y, this.w),
        new TileCoord(z, x, y + 1, this.w),
        new TileCoord(z, x + 1, y + 1, this.w)
    ];
};
function edge(a, b) {
    if (a.row > b.row) {
        var t = a;
        a = b;
        b = t;
    }
    return {
        x0: a.column,
        y0: a.row,
        x1: b.column,
        y1: b.row,
        dx: b.column - a.column,
        dy: b.row - a.row
    };
}
function scanSpans(e0, e1, ymin, ymax, scanLine) {
    var y0 = Math.max(ymin, Math.floor(e1.y0));
    var y1 = Math.min(ymax, Math.ceil(e1.y1));
    if (e0.x0 === e1.x0 && e0.y0 === e1.y0 ? e0.x0 + e1.dy / e0.dy * e0.dx < e1.x1 : e0.x1 - e1.dy / e0.dy * e0.dx < e1.x0) {
        var t = e0;
        e0 = e1;
        e1 = t;
    }
    var m0 = e0.dx / e0.dy;
    var m1 = e1.dx / e1.dy;
    var d0 = e0.dx > 0;
    var d1 = e1.dx < 0;
    for (var y = y0; y < y1; y++) {
        var x0 = m0 * Math.max(0, Math.min(e0.dy, y + d0 - e0.y0)) + e0.x0;
        var x1 = m1 * Math.max(0, Math.min(e1.dy, y + d1 - e1.y0)) + e1.x0;
        scanLine(Math.floor(x1), Math.ceil(x0), y);
    }
}
function scanTriangle(a, b, c, ymin, ymax, scanLine) {
    var ab = edge(a, b), bc = edge(b, c), ca = edge(c, a);
    var t;
    if (ab.dy > bc.dy) {
        t = ab;
        ab = bc;
        bc = t;
    }
    if (ab.dy > ca.dy) {
        t = ab;
        ab = ca;
        ca = t;
    }
    if (bc.dy > ca.dy) {
        t = bc;
        bc = ca;
        ca = t;
    }
    if (ab.dy)
        scanSpans(ca, ab, ymin, ymax, scanLine);
    if (bc.dy)
        scanSpans(ca, bc, ymin, ymax, scanLine);
}
TileCoord.cover = function (z, bounds, actualZ) {
    var tiles = 1 << z;
    var t = {};
    function scanLine(x0, x1, y) {
        var x, wx, coord;
        if (y >= 0 && y <= tiles) {
            for (x = x0; x < x1; x++) {
                wx = (x % tiles + tiles) % tiles;
                coord = new TileCoord(actualZ, wx, y, Math.floor(x / tiles));
                t[coord.id] = coord;
            }
        }
    }
    scanTriangle(bounds[0], bounds[1], bounds[2], 0, tiles, scanLine);
    scanTriangle(bounds[2], bounds[3], bounds[0], 0, tiles, scanLine);
    return Object.keys(t).map(function (id) {
        return t[id];
    });
};
TileCoord.fromID = function (id) {
    var z = id % 32, dim = 1 << z;
    var xy = (id - z) / 32;
    var x = xy % dim, y = (xy - x) / dim % dim;
    var w = Math.floor(xy / (dim * dim));
    if (w % 2 !== 0)
        w = w * -1 - 1;
    w /= 2;
    return new TileCoord(z, x, y, w);
};
function getQuadkey(z, x, y) {
    var quadkey = '', mask;
    for (var i = z; i > 0; i--) {
        mask = 1 << i - 1;
        quadkey += (x & mask ? 1 : 0) + (y & mask ? 2 : 0);
    }
    return quadkey;
}
module.exports = TileCoord;
},{"../geo/coordinate":88,"whoots-js":219}],122:[function(require,module,exports){
'use strict';
var Evented = require('../util/evented');
var util = require('../util/util');
var loadTileJSON = require('./load_tilejson');
var normalizeURL = require('../util/mapbox').normalizeTileURL;
var VectorTileSource = function (Evented) {
    function VectorTileSource(id, options, dispatcher, eventedParent) {
        Evented.call(this);
        this.id = id;
        this.dispatcher = dispatcher;
        this.type = 'vector';
        this.minzoom = 0;
        this.maxzoom = 22;
        this.scheme = 'xyz';
        this.tileSize = 512;
        this.reparseOverscaled = true;
        this.isTileClipped = true;
        util.extend(this, util.pick(options, [
            'url',
            'scheme',
            'tileSize'
        ]));
        this._options = util.extend({ type: 'vector' }, options);
        if (this.tileSize !== 512) {
            throw new Error('vector tile sources must have a tileSize of 512');
        }
        this.setEventedParent(eventedParent);
    }
    if (Evented)
        VectorTileSource.__proto__ = Evented;
    VectorTileSource.prototype = Object.create(Evented && Evented.prototype);
    VectorTileSource.prototype.constructor = VectorTileSource;
    VectorTileSource.prototype.load = function load() {
        var this$1 = this;
        this.fire('dataloading', { dataType: 'source' });
        loadTileJSON(this._options, function (err, tileJSON) {
            if (err) {
                this$1.fire('error', err);
                return;
            }
            util.extend(this$1, tileJSON);
            this$1.fire('data', { dataType: 'source' });
            this$1.fire('source.load');
        });
    };
    VectorTileSource.prototype.onAdd = function onAdd(map) {
        this.load();
        this.map = map;
    };
    VectorTileSource.prototype.serialize = function serialize() {
        return util.extend({}, this._options);
    };
    VectorTileSource.prototype.loadTile = function loadTile(tile, callback) {
        var overscaling = tile.coord.z > this.maxzoom ? Math.pow(2, tile.coord.z - this.maxzoom) : 1;
        var params = {
            url: normalizeURL(tile.coord.url(this.tiles, this.maxzoom, this.scheme), this.url),
            uid: tile.uid,
            coord: tile.coord,
            zoom: tile.coord.z,
            tileSize: this.tileSize * overscaling,
            type: this.type,
            source: this.id,
            overscaling: overscaling,
            angle: this.map.transform.angle,
            pitch: this.map.transform.pitch,
            showCollisionBoxes: this.map.showCollisionBoxes
        };
        if (!tile.workerID) {
            tile.workerID = this.dispatcher.send('loadTile', params, done.bind(this));
        } else if (tile.state === 'loading') {
            tile.reloadCallback = callback;
        } else {
            this.dispatcher.send('reloadTile', params, done.bind(this), tile.workerID);
        }
        function done(err, data) {
            if (tile.aborted)
                return;
            if (err) {
                return callback(err);
            }
            tile.loadVectorData(data, this.map.painter);
            if (tile.redoWhenDone) {
                tile.redoWhenDone = false;
                tile.redoPlacement(this);
            }
            callback(null);
            if (tile.reloadCallback) {
                this.loadTile(tile, tile.reloadCallback);
                tile.reloadCallback = null;
            }
        }
    };
    VectorTileSource.prototype.abortTile = function abortTile(tile) {
        this.dispatcher.send('abortTile', {
            uid: tile.uid,
            type: this.type,
            source: this.id
        }, null, tile.workerID);
    };
    VectorTileSource.prototype.unloadTile = function unloadTile(tile) {
        tile.unloadVectorData();
        this.dispatcher.send('removeTile', {
            uid: tile.uid,
            type: this.type,
            source: this.id
        }, null, tile.workerID);
    };
    return VectorTileSource;
}(Evented);
module.exports = VectorTileSource;
},{"../util/evented":186,"../util/mapbox":193,"../util/util":197,"./load_tilejson":114}],123:[function(require,module,exports){
'use strict';
var ajax = require('../util/ajax');
var vt = require('vector-tile');
var Protobuf = require('pbf');
var WorkerTile = require('./worker_tile');
var util = require('../util/util');
var VectorTileWorkerSource = function VectorTileWorkerSource(actor, layerIndex, loadVectorData) {
    this.actor = actor;
    this.layerIndex = layerIndex;
    if (loadVectorData) {
        this.loadVectorData = loadVectorData;
    }
    this.loading = {};
    this.loaded = {};
};
VectorTileWorkerSource.prototype.loadTile = function loadTile(params, callback) {
    var source = params.source, uid = params.uid;
    if (!this.loading[source])
        this.loading[source] = {};
    var workerTile = this.loading[source][uid] = new WorkerTile(params);
    workerTile.abort = this.loadVectorData(params, done.bind(this));
    function done(err, vectorTile) {
        delete this.loading[source][uid];
        if (err)
            return callback(err);
        if (!vectorTile)
            return callback(null, null);
        workerTile.vectorTile = vectorTile;
        workerTile.parse(vectorTile, this.layerIndex, this.actor, function (err, result, transferrables) {
            if (err)
                return callback(err);
            callback(null, util.extend({ rawTileData: vectorTile.rawData }, result), transferrables);
        });
        this.loaded[source] = this.loaded[source] || {};
        this.loaded[source][uid] = workerTile;
    }
};
VectorTileWorkerSource.prototype.reloadTile = function reloadTile(params, callback) {
    var loaded = this.loaded[params.source], uid = params.uid, vtSource = this;
    if (loaded && loaded[uid]) {
        var workerTile = loaded[uid];
        if (workerTile.status === 'parsing') {
            workerTile.reloadCallback = callback;
        } else if (workerTile.status === 'done') {
            workerTile.parse(workerTile.vectorTile, this.layerIndex, this.actor, done.bind(workerTile));
        }
    }
    function done(err, data) {
        if (this.reloadCallback) {
            var reloadCallback = this.reloadCallback;
            delete this.reloadCallback;
            this.parse(this.vectorTile, vtSource.layerIndex, vtSource.actor, reloadCallback);
        }
        callback(err, data);
    }
};
VectorTileWorkerSource.prototype.abortTile = function abortTile(params) {
    var loading = this.loading[params.source], uid = params.uid;
    if (loading && loading[uid] && loading[uid].abort) {
        loading[uid].abort();
        delete loading[uid];
    }
};
VectorTileWorkerSource.prototype.removeTile = function removeTile(params) {
    var loaded = this.loaded[params.source], uid = params.uid;
    if (loaded && loaded[uid]) {
        delete loaded[uid];
    }
};
VectorTileWorkerSource.prototype.loadVectorData = function loadVectorData(params, callback) {
    var xhr = ajax.getArrayBuffer(params.url, done.bind(this));
    return function abort() {
        xhr.abort();
    };
    function done(err, arrayBuffer) {
        if (err) {
            return callback(err);
        }
        var vectorTile = new vt.VectorTile(new Protobuf(arrayBuffer));
        vectorTile.rawData = arrayBuffer;
        callback(err, vectorTile);
    }
};
VectorTileWorkerSource.prototype.redoPlacement = function redoPlacement(params, callback) {
    var loaded = this.loaded[params.source], loading = this.loading[params.source], uid = params.uid;
    if (loaded && loaded[uid]) {
        var workerTile = loaded[uid];
        var result = workerTile.redoPlacement(params.angle, params.pitch, params.showCollisionBoxes);
        if (result.result) {
            callback(null, result.result, result.transferables);
        }
    } else if (loading && loading[uid]) {
        loading[uid].angle = params.angle;
    }
};
module.exports = VectorTileWorkerSource;
},{"../util/ajax":177,"../util/util":197,"./worker_tile":126,"pbf":203,"vector-tile":210}],124:[function(require,module,exports){
'use strict';
var ajax = require('../util/ajax');
var ImageSource = require('./image_source');
var VideoSource = function (ImageSource) {
    function VideoSource(id, options, dispatcher, eventedParent) {
        ImageSource.call(this, id, options, dispatcher, eventedParent);
        this.roundZoom = true;
        this.options = options;
    }
    if (ImageSource)
        VideoSource.__proto__ = ImageSource;
    VideoSource.prototype = Object.create(ImageSource && ImageSource.prototype);
    VideoSource.prototype.constructor = VideoSource;
    VideoSource.prototype.load = function load() {
        var this$1 = this;
        var options = this.options;
        this.urls = options.urls;
        ajax.getVideo(options.urls, function (err, video) {
            if (err)
                return this$1.fire('error', { error: err });
            this$1.video = video;
            this$1.video.loop = true;
            var loopID;
            this$1.video.addEventListener('playing', function () {
                loopID = this$1.map.style.animationLoop.set(Infinity);
                this$1.map._rerender();
            });
            this$1.video.addEventListener('pause', function () {
                this$1.map.style.animationLoop.cancel(loopID);
            });
            if (this$1.map) {
                this$1.video.play();
            }
            this$1._finishLoading();
        });
    };
    VideoSource.prototype.getVideo = function getVideo() {
        return this.video;
    };
    VideoSource.prototype.onAdd = function onAdd(map) {
        if (this.map)
            return;
        this.load();
        this.map = map;
        if (this.video) {
            this.video.play();
            this.setCoordinates(this.coordinates);
        }
    };
    VideoSource.prototype.prepare = function prepare() {
        if (!this.tile || this.video.readyState < 2)
            return;
        this._prepareImage(this.map.painter.gl, this.video);
    };
    VideoSource.prototype.serialize = function serialize() {
        return {
            type: 'video',
            urls: this.urls,
            coordinates: this.coordinates
        };
    };
    return VideoSource;
}(ImageSource);
module.exports = VideoSource;
},{"../util/ajax":177,"./image_source":113}],125:[function(require,module,exports){
'use strict';
var Actor = require('../util/actor');
var StyleLayerIndex = require('../style/style_layer_index');
var VectorTileWorkerSource = require('./vector_tile_worker_source');
var GeoJSONWorkerSource = require('./geojson_worker_source');
var Worker = function Worker(self) {
    var this$1 = this;
    this.self = self;
    this.actor = new Actor(self, this);
    this.layerIndexes = {};
    this.workerSourceTypes = {
        vector: VectorTileWorkerSource,
        geojson: GeoJSONWorkerSource
    };
    this.workerSources = {};
    this.self.registerWorkerSource = function (name, WorkerSource) {
        if (this$1.workerSourceTypes[name]) {
            throw new Error('Worker source with name "' + name + '" already registered.');
        }
        this$1.workerSourceTypes[name] = WorkerSource;
    };
};
Worker.prototype.setLayers = function setLayers(mapId, layers) {
    this.getLayerIndex(mapId).replace(layers);
};
Worker.prototype.updateLayers = function updateLayers(mapId, params) {
    this.getLayerIndex(mapId).update(params.layers, params.removedIds, params.symbolOrder);
};
Worker.prototype.loadTile = function loadTile(mapId, params, callback) {
    this.getWorkerSource(mapId, params.type).loadTile(params, callback);
};
Worker.prototype.reloadTile = function reloadTile(mapId, params, callback) {
    this.getWorkerSource(mapId, params.type).reloadTile(params, callback);
};
Worker.prototype.abortTile = function abortTile(mapId, params) {
    this.getWorkerSource(mapId, params.type).abortTile(params);
};
Worker.prototype.removeTile = function removeTile(mapId, params) {
    this.getWorkerSource(mapId, params.type).removeTile(params);
};
Worker.prototype.removeSource = function removeSource(mapId, params) {
    var worker = this.getWorkerSource(mapId, params.type);
    if (worker.removeSource !== undefined) {
        worker.removeSource(params);
    }
};
Worker.prototype.redoPlacement = function redoPlacement(mapId, params, callback) {
    this.getWorkerSource(mapId, params.type).redoPlacement(params, callback);
};
Worker.prototype.loadWorkerSource = function loadWorkerSource(map, params, callback) {
    try {
        this.self.importScripts(params.url);
        callback();
    } catch (e) {
        callback(e);
    }
};
Worker.prototype.getLayerIndex = function getLayerIndex(mapId) {
    var layerIndexes = this.layerIndexes[mapId];
    if (!layerIndexes) {
        layerIndexes = this.layerIndexes[mapId] = new StyleLayerIndex();
    }
    return layerIndexes;
};
Worker.prototype.getWorkerSource = function getWorkerSource(mapId, type) {
    var this$1 = this;
    if (!this.workerSources[mapId])
        this.workerSources[mapId] = {};
    if (!this.workerSources[mapId][type]) {
        var actor = {
            send: function (type, data, callback, buffers) {
                this$1.actor.send(type, data, callback, buffers, mapId);
            }
        };
        this.workerSources[mapId][type] = new this.workerSourceTypes[type](actor, this.getLayerIndex(mapId));
    }
    return this.workerSources[mapId][type];
};
module.exports = function createWorker(self) {
    return new Worker(self);
};
},{"../style/style_layer_index":139,"../util/actor":176,"./geojson_worker_source":111,"./vector_tile_worker_source":123}],126:[function(require,module,exports){
'use strict';
var FeatureIndex = require('../data/feature_index');
var CollisionTile = require('../symbol/collision_tile');
var CollisionBoxArray = require('../symbol/collision_box');
var DictionaryCoder = require('../util/dictionary_coder');
var util = require('../util/util');
var SymbolInstancesArray = require('../symbol/symbol_instances');
var SymbolQuadsArray = require('../symbol/symbol_quads');
var WorkerTile = function WorkerTile(params) {
    this.coord = params.coord;
    this.uid = params.uid;
    this.zoom = params.zoom;
    this.tileSize = params.tileSize;
    this.source = params.source;
    this.overscaling = params.overscaling;
    this.angle = params.angle;
    this.pitch = params.pitch;
    this.showCollisionBoxes = params.showCollisionBoxes;
};
WorkerTile.prototype.parse = function parse(data, layerIndex, actor, callback) {
    var this$1 = this;
    if (!data.layers) {
        data = { layers: { '_geojsonTileLayer': data } };
    }
    this.status = 'parsing';
    this.data = data;
    this.collisionBoxArray = new CollisionBoxArray();
    this.symbolInstancesArray = new SymbolInstancesArray();
    this.symbolQuadsArray = new SymbolQuadsArray();
    var sourceLayerCoder = new DictionaryCoder(Object.keys(data.layers).sort());
    var featureIndex = new FeatureIndex(this.coord, this.overscaling);
    featureIndex.bucketLayerIDs = {};
    var buckets = {};
    var bucketIndex = 0;
    var options = {
        featureIndex: featureIndex,
        iconDependencies: {},
        glyphDependencies: {}
    };
    var layerFamilies = layerIndex.familiesBySource[this.source];
    for (var sourceLayerId in layerFamilies) {
        var sourceLayer = data.layers[sourceLayerId];
        if (!sourceLayer) {
            continue;
        }
        if (sourceLayer.version === 1) {
            util.warnOnce('Vector tile source "' + this$1.source + '" layer "' + sourceLayerId + '" does not use vector tile spec v2 ' + 'and therefore may have some rendering errors.');
        }
        var sourceLayerIndex = sourceLayerCoder.encode(sourceLayerId);
        var features = [];
        for (var i = 0; i < sourceLayer.length; i++) {
            var feature = sourceLayer.feature(i);
            feature.index = i;
            feature.sourceLayerIndex = sourceLayerIndex;
            features.push(feature);
        }
        for (var i$2 = 0, list = layerFamilies[sourceLayerId]; i$2 < list.length; i$2 += 1) {
            var family = list[i$2];
            var layer = family[0];
            if (layer.minzoom && this$1.zoom < layer.minzoom)
                continue;
            if (layer.maxzoom && this$1.zoom >= layer.maxzoom)
                continue;
            if (layer.layout && layer.layout.visibility === 'none')
                continue;
            for (var i$3 = 0, list$1 = family; i$3 < list$1.length; i$3 += 1) {
                var layer$1 = list$1[i$3];
                layer$1.recalculate(this$1.zoom);
            }
            var bucket = buckets[layer.id] = layer.createBucket({
                index: bucketIndex,
                layers: family,
                zoom: this$1.zoom,
                overscaling: this$1.overscaling,
                collisionBoxArray: this$1.collisionBoxArray,
                symbolQuadsArray: this$1.symbolQuadsArray,
                symbolInstancesArray: this$1.symbolInstancesArray
            });
            bucket.populate(features, options);
            featureIndex.bucketLayerIDs[bucketIndex] = family.map(function (l) {
                return l.id;
            });
            bucketIndex++;
        }
    }
    var done = function (collisionTile) {
        this$1.status = 'done';
        var transferables = [];
        callback(null, {
            buckets: serializeBuckets(util.values(buckets), transferables),
            featureIndex: featureIndex.serialize(transferables),
            collisionTile: collisionTile.serialize(transferables),
            collisionBoxArray: this$1.collisionBoxArray.serialize(),
            symbolInstancesArray: this$1.symbolInstancesArray.serialize(),
            symbolQuadsArray: this$1.symbolQuadsArray.serialize()
        }, transferables);
    };
    this.symbolBuckets = [];
    for (var i$1 = layerIndex.symbolOrder.length - 1; i$1 >= 0; i$1--) {
        var bucket$1 = buckets[layerIndex.symbolOrder[i$1]];
        if (bucket$1) {
            this$1.symbolBuckets.push(bucket$1);
        }
    }
    if (this.symbolBuckets.length === 0) {
        return done(new CollisionTile(this.angle, this.pitch, this.collisionBoxArray));
    }
    var deps = 0;
    var icons = Object.keys(options.iconDependencies);
    var stacks = util.mapObject(options.glyphDependencies, function (glyphs) {
        return Object.keys(glyphs).map(Number);
    });
    var gotDependency = function (err) {
        if (err)
            return callback(err);
        deps++;
        if (deps === 2) {
            var collisionTile = new CollisionTile(this$1.angle, this$1.pitch, this$1.collisionBoxArray);
            for (var i = 0, list = this$1.symbolBuckets; i < list.length; i += 1) {
                var bucket = list[i];
                recalculateLayers(bucket, this$1.zoom);
                bucket.prepare(stacks, icons);
                bucket.place(collisionTile, this$1.showCollisionBoxes);
            }
            done(collisionTile);
        }
    };
    if (Object.keys(stacks).length) {
        actor.send('getGlyphs', {
            uid: this.uid,
            stacks: stacks
        }, function (err, newStacks) {
            stacks = newStacks;
            gotDependency(err);
        });
    } else {
        gotDependency();
    }
    if (icons.length) {
        actor.send('getIcons', { icons: icons }, function (err, newIcons) {
            icons = newIcons;
            gotDependency(err);
        });
    } else {
        gotDependency();
    }
};
WorkerTile.prototype.redoPlacement = function redoPlacement(angle, pitch, showCollisionBoxes) {
    var this$1 = this;
    this.angle = angle;
    this.pitch = pitch;
    if (this.status !== 'done') {
        return {};
    }
    var collisionTile = new CollisionTile(this.angle, this.pitch, this.collisionBoxArray);
    for (var i = 0, list = this.symbolBuckets; i < list.length; i += 1) {
        var bucket = list[i];
        recalculateLayers(bucket, this$1.zoom);
        bucket.place(collisionTile, showCollisionBoxes);
    }
    var transferables = [];
    return {
        result: {
            buckets: serializeBuckets(this.symbolBuckets, transferables),
            collisionTile: collisionTile.serialize(transferables)
        },
        transferables: transferables
    };
};
function recalculateLayers(bucket, zoom) {
    for (var i = 0, list = bucket.layers; i < list.length; i += 1) {
        var layer = list[i];
        layer.recalculate(zoom);
    }
}
function serializeBuckets(buckets, transferables) {
    return buckets.filter(function (b) {
        return !b.isEmpty();
    }).map(function (b) {
        return b.serialize(transferables);
    });
}
module.exports = WorkerTile;
},{"../data/feature_index":82,"../symbol/collision_box":146,"../symbol/collision_tile":148,"../symbol/symbol_instances":157,"../symbol/symbol_quads":158,"../util/dictionary_coder":183,"../util/util":197}],127:[function(require,module,exports){
'use strict';
var AnimationLoop = function AnimationLoop() {
    this.n = 0;
    this.times = [];
};
AnimationLoop.prototype.stopped = function stopped() {
    this.times = this.times.filter(function (t) {
        return t.time >= new Date().getTime();
    });
    return !this.times.length;
};
AnimationLoop.prototype.set = function set(t) {
    this.times.push({
        id: this.n,
        time: t + new Date().getTime()
    });
    return this.n++;
};
AnimationLoop.prototype.cancel = function cancel(n) {
    this.times = this.times.filter(function (t) {
        return t.id !== n;
    });
};
module.exports = AnimationLoop;
},{}],128:[function(require,module,exports){
'use strict';
var Evented = require('../util/evented');
var ajax = require('../util/ajax');
var browser = require('../util/browser');
var normalizeURL = require('../util/mapbox').normalizeSpriteURL;
var SpritePosition = function SpritePosition() {
    this.x = 0;
    this.y = 0;
    this.width = 0;
    this.height = 0;
    this.pixelRatio = 1;
    this.sdf = false;
};
var ImageSprite = function (Evented) {
    function ImageSprite(base, eventedParent) {
        var this$1 = this;
        Evented.call(this);
        this.base = base;
        this.retina = browser.devicePixelRatio > 1;
        this.setEventedParent(eventedParent);
        var format = this.retina ? '@2x' : '';
        ajax.getJSON(normalizeURL(base, format, '.json'), function (err, data) {
            if (err) {
                this$1.fire('error', { error: err });
                return;
            }
            this$1.data = data;
            if (this$1.imgData)
                this$1.fire('data', { dataType: 'style' });
        });
        ajax.getImage(normalizeURL(base, format, '.png'), function (err, img) {
            if (err) {
                this$1.fire('error', { error: err });
                return;
            }
            this$1.imgData = browser.getImageData(img);
            for (var i = 0; i < this$1.imgData.length; i += 4) {
                var alpha = this$1.imgData[i + 3] / 255;
                this$1.imgData[i + 0] *= alpha;
                this$1.imgData[i + 1] *= alpha;
                this$1.imgData[i + 2] *= alpha;
            }
            this$1.width = img.width;
            if (this$1.data)
                this$1.fire('data', { dataType: 'style' });
        });
    }
    if (Evented)
        ImageSprite.__proto__ = Evented;
    ImageSprite.prototype = Object.create(Evented && Evented.prototype);
    ImageSprite.prototype.constructor = ImageSprite;
    ImageSprite.prototype.toJSON = function toJSON() {
        return this.base;
    };
    ImageSprite.prototype.loaded = function loaded() {
        return !!(this.data && this.imgData);
    };
    ImageSprite.prototype.resize = function resize() {
        var this$1 = this;
        if (browser.devicePixelRatio > 1 !== this.retina) {
            var newSprite = new ImageSprite(this.base);
            newSprite.on('data', function () {
                this$1.data = newSprite.data;
                this$1.imgData = newSprite.imgData;
                this$1.width = newSprite.width;
                this$1.retina = newSprite.retina;
            });
        }
    };
    ImageSprite.prototype.getSpritePosition = function getSpritePosition(name) {
        if (!this.loaded())
            return new SpritePosition();
        var pos = this.data && this.data[name];
        if (pos && this.imgData)
            return pos;
        return new SpritePosition();
    };
    return ImageSprite;
}(Evented);
module.exports = ImageSprite;
},{"../util/ajax":177,"../util/browser":178,"../util/evented":186,"../util/mapbox":193}],129:[function(require,module,exports){
'use strict';
var styleSpec = require('./style_spec');
var util = require('../util/util');
var Evented = require('../util/evented');
var validateStyle = require('./validate_style');
var StyleDeclaration = require('./style_declaration');
var StyleTransition = require('./style_transition');
var TRANSITION_SUFFIX = '-transition';
var Light = function (Evented) {
    function Light(lightOptions) {
        Evented.call(this);
        this.properties = [
            'anchor',
            'color',
            'position',
            'intensity'
        ];
        this._specifications = styleSpec.light;
        this.set(lightOptions);
    }
    if (Evented)
        Light.__proto__ = Evented;
    Light.prototype = Object.create(Evented && Evented.prototype);
    Light.prototype.constructor = Light;
    Light.prototype.set = function set(lightOpts) {
        var this$1 = this;
        if (this._validate(validateStyle.light, lightOpts))
            return;
        this._declarations = {};
        this._transitions = {};
        this._transitionOptions = {};
        this.calculated = {};
        lightOpts = util.extend({
            anchor: this._specifications.anchor.default,
            color: this._specifications.color.default,
            position: this._specifications.position.default,
            intensity: this._specifications.intensity.default
        }, lightOpts);
        for (var i = 0, list = this.properties; i < list.length; i += 1) {
            var prop = list[i];
            this$1._declarations[prop] = new StyleDeclaration(this$1._specifications[prop], lightOpts[prop]);
        }
        return this;
    };
    Light.prototype.getLight = function getLight() {
        return {
            anchor: this.getLightProperty('anchor'),
            color: this.getLightProperty('color'),
            position: this.getLightProperty('position'),
            intensity: this.getLightProperty('intensity')
        };
    };
    Light.prototype.getLightProperty = function getLightProperty(property) {
        if (util.endsWith(property, TRANSITION_SUFFIX)) {
            return this._transitionOptions[property];
        } else {
            return this._declarations[property] && this._declarations[property].value;
        }
    };
    Light.prototype.getLightValue = function getLightValue(property, globalProperties) {
        if (property === 'position') {
            var calculated = this._transitions[property].calculate(globalProperties), cartesian = util.sphericalToCartesian(calculated);
            return {
                x: cartesian[0],
                y: cartesian[1],
                z: cartesian[2]
            };
        }
        return this._transitions[property].calculate(globalProperties);
    };
    Light.prototype.setLight = function setLight(options) {
        var this$1 = this;
        if (this._validate(validateStyle.light, options))
            return;
        for (var key in options) {
            var value = options[key];
            if (util.endsWith(key, TRANSITION_SUFFIX)) {
                this$1._transitionOptions[key] = value;
            } else if (value === null || value === undefined) {
                delete this$1._declarations[key];
            } else {
                this$1._declarations[key] = new StyleDeclaration(this$1._specifications[key], value);
            }
        }
    };
    Light.prototype.recalculate = function recalculate(zoom) {
        var this$1 = this;
        for (var property in this._declarations) {
            this$1.calculated[property] = this$1.getLightValue(property, { zoom: zoom });
        }
    };
    Light.prototype._applyLightDeclaration = function _applyLightDeclaration(property, declaration, options, globalOptions, animationLoop) {
        var oldTransition = options.transition ? this._transitions[property] : undefined;
        var spec = this._specifications[property];
        if (declaration === null || declaration === undefined) {
            declaration = new StyleDeclaration(spec, spec.default);
        }
        if (oldTransition && oldTransition.declaration.json === declaration.json)
            return;
        var transitionOptions = util.extend({
            duration: 300,
            delay: 0
        }, globalOptions, this.getLightProperty(property + TRANSITION_SUFFIX));
        var newTransition = this._transitions[property] = new StyleTransition(spec, declaration, oldTransition, transitionOptions);
        if (!newTransition.instant()) {
            newTransition.loopID = animationLoop.set(newTransition.endTime - Date.now());
        }
        if (oldTransition) {
            animationLoop.cancel(oldTransition.loopID);
        }
    };
    Light.prototype.updateLightTransitions = function updateLightTransitions(options, globalOptions, animationLoop) {
        var this$1 = this;
        var property;
        for (property in this._declarations) {
            this$1._applyLightDeclaration(property, this$1._declarations[property], options, globalOptions, animationLoop);
        }
    };
    Light.prototype._validate = function _validate(validate, value) {
        return validateStyle.emitErrors(this, validate.call(validateStyle, util.extend({
            value: value,
            style: {
                glyphs: true,
                sprite: true
            },
            styleSpec: styleSpec
        })));
    };
    return Light;
}(Evented);
module.exports = Light;
},{"../util/evented":186,"../util/util":197,"./style_declaration":132,"./style_spec":140,"./style_transition":141,"./validate_style":142}],130:[function(require,module,exports){
'use strict';
var parseColorString = require('csscolorparser').parseCSSColor;
var util = require('../util/util');
var MapboxGLFunction = require('mapbox-gl-function');
var cache = {};
module.exports = function parseColor(input) {
    if (input && MapboxGLFunction.isFunctionDefinition(input)) {
        if (!input.stops)
            return input;
        else
            return util.extend({}, input, {
                stops: input.stops.map(function (stop) {
                    return [
                        stop[0],
                        parseColor(stop[1])
                    ];
                })
            });
    } else if (typeof input === 'string') {
        if (!cache[input]) {
            var rgba = parseColorString(input);
            if (!rgba) {
                throw new Error('Invalid color ' + input);
            }
            cache[input] = [
                rgba[0] / 255 * rgba[3],
                rgba[1] / 255 * rgba[3],
                rgba[2] / 255 * rgba[3],
                rgba[3]
            ];
        }
        return cache[input];
    } else if (Array.isArray(input)) {
        return input;
    } else {
        throw new Error('Invalid color ' + input);
    }
};
},{"../util/util":197,"csscolorparser":8,"mapbox-gl-function":41}],131:[function(require,module,exports){
'use strict';
var Evented = require('../util/evented');
var StyleLayer = require('./style_layer');
var ImageSprite = require('./image_sprite');
var Light = require('./light');
var GlyphSource = require('../symbol/glyph_source');
var SpriteAtlas = require('../symbol/sprite_atlas');
var LineAtlas = require('../render/line_atlas');
var util = require('../util/util');
var ajax = require('../util/ajax');
var mapbox = require('../util/mapbox');
var browser = require('../util/browser');
var Dispatcher = require('../util/dispatcher');
var AnimationLoop = require('./animation_loop');
var validateStyle = require('./validate_style');
var Source = require('../source/source');
var QueryFeatures = require('../source/query_features');
var SourceCache = require('../source/source_cache');
var styleSpec = require('./style_spec');
var MapboxGLFunction = require('mapbox-gl-function');
var getWorkerPool = require('../global_worker_pool');
var deref = require('mapbox-gl-style-spec/lib/deref');
var diff = require('mapbox-gl-style-spec/lib/diff');
var supportedDiffOperations = util.pick(diff.operations, [
    'addLayer',
    'removeLayer',
    'setPaintProperty',
    'setLayoutProperty',
    'setFilter',
    'addSource',
    'removeSource',
    'setLayerZoomRange',
    'setLight',
    'setTransition'
]);
var ignoredDiffOperations = util.pick(diff.operations, [
    'setCenter',
    'setZoom',
    'setBearing',
    'setPitch'
]);
var Style = function (Evented) {
    function Style(stylesheet, map, options) {
        var this$1 = this;
        Evented.call(this);
        this.map = map;
        this.animationLoop = map && map.animationLoop || new AnimationLoop();
        this.dispatcher = new Dispatcher(getWorkerPool(), this);
        this.spriteAtlas = new SpriteAtlas(1024, 1024);
        this.lineAtlas = new LineAtlas(256, 512);
        this._layers = {};
        this._order = [];
        this.sourceCaches = {};
        this.zoomHistory = {};
        this._loaded = false;
        util.bindAll(['_redoPlacement'], this);
        this._resetUpdates();
        options = util.extend({ validate: typeof stylesheet === 'string' ? !mapbox.isMapboxURL(stylesheet) : true }, options);
        this.setEventedParent(map);
        this.fire('dataloading', { dataType: 'style' });
        var stylesheetLoaded = function (err, stylesheet) {
            if (err) {
                this$1.fire('error', { error: err });
                return;
            }
            if (options.validate && validateStyle.emitErrors(this$1, validateStyle(stylesheet)))
                return;
            this$1._loaded = true;
            this$1.stylesheet = stylesheet;
            this$1.updateClasses();
            for (var id in stylesheet.sources) {
                this$1.addSource(id, stylesheet.sources[id], options);
            }
            if (stylesheet.sprite) {
                this$1.sprite = new ImageSprite(stylesheet.sprite, this$1);
            }
            this$1.glyphSource = new GlyphSource(stylesheet.glyphs);
            this$1._resolve();
            this$1.fire('data', { dataType: 'style' });
            this$1.fire('style.load');
        };
        if (typeof stylesheet === 'string') {
            ajax.getJSON(mapbox.normalizeStyleURL(stylesheet), stylesheetLoaded);
        } else {
            browser.frame(stylesheetLoaded.bind(this, null, stylesheet));
        }
        this.on('source.load', function (event) {
            var source = this$1.sourceCaches[event.sourceId].getSource();
            if (source && source.vectorLayerIds) {
                for (var layerId in this$1._layers) {
                    var layer = this$1._layers[layerId];
                    if (layer.source === source.id) {
                        this$1._validateLayer(layer);
                    }
                }
            }
        });
    }
    if (Evented)
        Style.__proto__ = Evented;
    Style.prototype = Object.create(Evented && Evented.prototype);
    Style.prototype.constructor = Style;
    Style.prototype._validateLayer = function _validateLayer(layer) {
        var sourceCache = this.sourceCaches[layer.source];
        if (!layer.sourceLayer)
            return;
        if (!sourceCache)
            return;
        var source = sourceCache.getSource();
        if (source.type === 'geojson' || source.vectorLayerIds && source.vectorLayerIds.indexOf(layer.sourceLayer) === -1) {
            this.fire('error', { error: new Error('Source layer "' + layer.sourceLayer + '" ' + 'does not exist on source "' + source.id + '" ' + 'as specified by style layer "' + layer.id + '"') });
        }
    };
    Style.prototype.loaded = function loaded() {
        var this$1 = this;
        if (!this._loaded)
            return false;
        if (Object.keys(this._updatedSources).length)
            return false;
        for (var id in this.sourceCaches)
            if (!this$1.sourceCaches[id].loaded())
                return false;
        if (this.sprite && !this.sprite.loaded())
            return false;
        return true;
    };
    Style.prototype._resolve = function _resolve() {
        var this$1 = this;
        var layers = deref(this.stylesheet.layers);
        this._order = layers.map(function (layer) {
            return layer.id;
        });
        this._layers = {};
        for (var i = 0, list = layers; i < list.length; i += 1) {
            var layer = list[i];
            layer = StyleLayer.create(layer);
            layer.setEventedParent(this$1, { layer: { id: layer.id } });
            this$1._layers[layer.id] = layer;
        }
        this.dispatcher.broadcast('setLayers', this._serializeLayers(this._order));
        this.light = new Light(this.stylesheet.light);
    };
    Style.prototype._serializeLayers = function _serializeLayers(ids) {
        var this$1 = this;
        return ids.map(function (id) {
            return this$1._layers[id].serialize();
        });
    };
    Style.prototype._applyClasses = function _applyClasses(classes, options) {
        var this$1 = this;
        if (!this._loaded)
            return;
        classes = classes || [];
        options = options || { transition: true };
        var transition = this.stylesheet.transition || {};
        var layers = this._updatedAllPaintProps ? this._layers : this._updatedPaintProps;
        for (var id in layers) {
            var layer = this$1._layers[id];
            var props = this$1._updatedPaintProps[id];
            if (this$1._updatedAllPaintProps || props.all) {
                layer.updatePaintTransitions(classes, options, transition, this$1.animationLoop, this$1.zoomHistory);
            } else {
                for (var paintName in props) {
                    this$1._layers[id].updatePaintTransition(paintName, classes, options, transition, this$1.animationLoop, this$1.zoomHistory);
                }
            }
        }
        this.light.updateLightTransitions(options, transition, this.animationLoop);
    };
    Style.prototype._recalculate = function _recalculate(z) {
        var this$1 = this;
        if (!this._loaded)
            return;
        for (var sourceId in this.sourceCaches)
            this$1.sourceCaches[sourceId].used = false;
        this._updateZoomHistory(z);
        for (var i = 0, list = this._order; i < list.length; i += 1) {
            var layerId = list[i];
            var layer = this$1._layers[layerId];
            layer.recalculate(z);
            if (!layer.isHidden(z) && layer.source) {
                this$1.sourceCaches[layer.source].used = true;
            }
        }
        this.light.recalculate(z);
        var maxZoomTransitionDuration = 300;
        if (Math.floor(this.z) !== Math.floor(z)) {
            this.animationLoop.set(maxZoomTransitionDuration);
        }
        this.z = z;
    };
    Style.prototype._updateZoomHistory = function _updateZoomHistory(z) {
        var zh = this.zoomHistory;
        if (zh.lastIntegerZoom === undefined) {
            zh.lastIntegerZoom = Math.floor(z);
            zh.lastIntegerZoomTime = 0;
            zh.lastZoom = z;
        }
        if (Math.floor(zh.lastZoom) < Math.floor(z)) {
            zh.lastIntegerZoom = Math.floor(z);
            zh.lastIntegerZoomTime = Date.now();
        } else if (Math.floor(zh.lastZoom) > Math.floor(z)) {
            zh.lastIntegerZoom = Math.floor(z + 1);
            zh.lastIntegerZoomTime = Date.now();
        }
        zh.lastZoom = z;
    };
    Style.prototype._checkLoaded = function _checkLoaded() {
        if (!this._loaded) {
            throw new Error('Style is not done loading');
        }
    };
    Style.prototype.update = function update(classes, options) {
        var this$1 = this;
        if (!this._changed)
            return;
        var updatedIds = Object.keys(this._updatedLayers);
        var removedIds = Object.keys(this._removedLayers);
        if (updatedIds.length || removedIds.length || this._updatedSymbolOrder) {
            this._updateWorkerLayers(updatedIds, removedIds);
        }
        for (var id in this._updatedSources) {
            var action = this$1._updatedSources[id];
            if (action === 'reload') {
                this$1._reloadSource(id);
            } else if (action === 'clear') {
                this$1._clearSource(id);
            }
        }
        this._applyClasses(classes, options);
        this._resetUpdates();
        this.fire('data', { dataType: 'style' });
    };
    Style.prototype._updateWorkerLayers = function _updateWorkerLayers(updatedIds, removedIds) {
        var this$1 = this;
        var symbolOrder = this._updatedSymbolOrder ? this._order.filter(function (id) {
            return this$1._layers[id].type === 'symbol';
        }) : null;
        this.dispatcher.broadcast('updateLayers', {
            layers: this._serializeLayers(updatedIds),
            removedIds: removedIds,
            symbolOrder: symbolOrder
        });
    };
    Style.prototype._resetUpdates = function _resetUpdates() {
        this._changed = false;
        this._updatedLayers = {};
        this._removedLayers = {};
        this._updatedSymbolOrder = false;
        this._updatedSources = {};
        this._updatedPaintProps = {};
        this._updatedAllPaintProps = false;
    };
    Style.prototype.setState = function setState(nextState) {
        var this$1 = this;
        this._checkLoaded();
        if (validateStyle.emitErrors(this, validateStyle(nextState)))
            return false;
        nextState = util.extend({}, nextState);
        nextState.layers = deref(nextState.layers);
        var changes = diff(this.serialize(), nextState).filter(function (op) {
            return !(op.command in ignoredDiffOperations);
        });
        if (changes.length === 0) {
            return false;
        }
        var unimplementedOps = changes.filter(function (op) {
            return !(op.command in supportedDiffOperations);
        });
        if (unimplementedOps.length > 0) {
            throw new Error('Unimplemented: ' + unimplementedOps.map(function (op) {
                return op.command;
            }).join(', ') + '.');
        }
        changes.forEach(function (op) {
            if (op.command === 'setTransition') {
                return;
            }
            this$1[op.command].apply(this$1, op.args);
        });
        this.stylesheet = nextState;
        return true;
    };
    Style.prototype.addSource = function addSource(id, source, options) {
        this._checkLoaded();
        if (this.sourceCaches[id] !== undefined) {
            throw new Error('There is already a source with this ID');
        }
        if (!source.type) {
            throw new Error('The type property must be defined, but the only the following properties were given: ' + Object.keys(source) + '.');
        }
        var builtIns = [
            'vector',
            'raster',
            'geojson',
            'video',
            'image'
        ];
        var shouldValidate = builtIns.indexOf(source.type) >= 0;
        if (shouldValidate && this._validate(validateStyle.source, 'sources.' + id, source, null, options))
            return;
        var sourceCache = this.sourceCaches[id] = new SourceCache(id, source, this.dispatcher);
        sourceCache.style = this;
        sourceCache.setEventedParent(this, function () {
            return {
                isSourceLoaded: sourceCache.loaded(),
                source: sourceCache.serialize(),
                sourceId: id
            };
        });
        sourceCache.onAdd(this.map);
        this._changed = true;
    };
    Style.prototype.removeSource = function removeSource(id) {
        this._checkLoaded();
        if (this.sourceCaches[id] === undefined) {
            throw new Error('There is no source with this ID');
        }
        var sourceCache = this.sourceCaches[id];
        delete this.sourceCaches[id];
        delete this._updatedSources[id];
        sourceCache.setEventedParent(null);
        sourceCache.clearTiles();
        if (sourceCache.onRemove)
            sourceCache.onRemove(this.map);
        this._changed = true;
    };
    Style.prototype.getSource = function getSource(id) {
        return this.sourceCaches[id] && this.sourceCaches[id].getSource();
    };
    Style.prototype.addLayer = function addLayer(layerObject, before, options) {
        this._checkLoaded();
        var id = layerObject.id;
        if (typeof layerObject.source === 'object') {
            this.addSource(id, layerObject.source);
            layerObject = util.extend(layerObject, { source: id });
        }
        if (this._validate(validateStyle.layer, 'layers.' + id, layerObject, { arrayIndex: -1 }, options))
            return;
        var layer = StyleLayer.create(layerObject);
        this._validateLayer(layer);
        layer.setEventedParent(this, { layer: { id: id } });
        var index = before ? this._order.indexOf(before) : this._order.length;
        this._order.splice(index, 0, id);
        this._layers[id] = layer;
        if (this._removedLayers[id]) {
            delete this._removedLayers[id];
            this._updatedSources[layer.source] = 'clear';
        }
        this._updateLayer(layer);
        if (layer.type === 'symbol') {
            this._updatedSymbolOrder = true;
        }
        this.updateClasses(id);
    };
    Style.prototype.moveLayer = function moveLayer(id, before) {
        this._checkLoaded();
        this._changed = true;
        var layer = this._layers[id];
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + id + '\' does not exist in ' + 'the map\'s style and cannot be moved.') });
            return;
        }
        var index = this._order.indexOf(id);
        this._order.splice(index, 1);
        var newIndex = before ? this._order.indexOf(before) : this._order.length;
        this._order.splice(newIndex, 0, id);
        if (layer.type === 'symbol') {
            this._updatedSymbolOrder = true;
            if (layer.source && !this._updatedSources[layer.source]) {
                this._updatedSources[layer.source] = 'reload';
            }
        }
    };
    Style.prototype.removeLayer = function removeLayer(id) {
        this._checkLoaded();
        var layer = this._layers[id];
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + id + '\' does not exist in ' + 'the map\'s style and cannot be removed.') });
            return;
        }
        layer.setEventedParent(null);
        var index = this._order.indexOf(id);
        this._order.splice(index, 1);
        if (layer.type === 'symbol') {
            this._updatedSymbolOrder = true;
        }
        this._changed = true;
        this._removedLayers[id] = true;
        delete this._layers[id];
        delete this._updatedLayers[id];
        delete this._updatedPaintProps[id];
    };
    Style.prototype.getLayer = function getLayer(id) {
        return this._layers[id];
    };
    Style.prototype.setLayerZoomRange = function setLayerZoomRange(layerId, minzoom, maxzoom) {
        this._checkLoaded();
        var layer = this.getLayer(layerId);
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + layerId + '\' does not exist in ' + 'the map\'s style and cannot have zoom extent.') });
            return;
        }
        if (layer.minzoom === minzoom && layer.maxzoom === maxzoom)
            return;
        if (minzoom != null) {
            layer.minzoom = minzoom;
        }
        if (maxzoom != null) {
            layer.maxzoom = maxzoom;
        }
        this._updateLayer(layer);
    };
    Style.prototype.setFilter = function setFilter(layerId, filter) {
        this._checkLoaded();
        var layer = this.getLayer(layerId);
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + layerId + '\' does not exist in ' + 'the map\'s style and cannot be filtered.') });
            return;
        }
        if (filter !== null && filter !== undefined && this._validate(validateStyle.filter, 'layers.' + layer.id + '.filter', filter))
            return;
        if (util.deepEqual(layer.filter, filter))
            return;
        layer.filter = util.clone(filter);
        this._updateLayer(layer);
    };
    Style.prototype.getFilter = function getFilter(layer) {
        return util.clone(this.getLayer(layer).filter);
    };
    Style.prototype.setLayoutProperty = function setLayoutProperty(layerId, name, value) {
        this._checkLoaded();
        var layer = this.getLayer(layerId);
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + layerId + '\' does not exist in ' + 'the map\'s style and cannot be styled.') });
            return;
        }
        if (util.deepEqual(layer.getLayoutProperty(name), value))
            return;
        layer.setLayoutProperty(name, value);
        this._updateLayer(layer);
    };
    Style.prototype.getLayoutProperty = function getLayoutProperty(layer, name) {
        return this.getLayer(layer).getLayoutProperty(name);
    };
    Style.prototype.setPaintProperty = function setPaintProperty(layerId, name, value, klass) {
        this._checkLoaded();
        var layer = this.getLayer(layerId);
        if (!layer) {
            this.fire('error', { error: new Error('The layer \'' + layerId + '\' does not exist in ' + 'the map\'s style and cannot be styled.') });
            return;
        }
        if (util.deepEqual(layer.getPaintProperty(name, klass), value))
            return;
        var wasFeatureConstant = layer.isPaintValueFeatureConstant(name);
        layer.setPaintProperty(name, value, klass);
        var isFeatureConstant = !(value && MapboxGLFunction.isFunctionDefinition(value) && value.property !== '$zoom' && value.property !== undefined);
        if (!isFeatureConstant || !wasFeatureConstant) {
            this._updateLayer(layer);
        }
        this.updateClasses(layerId, name);
    };
    Style.prototype.getPaintProperty = function getPaintProperty(layer, name, klass) {
        return this.getLayer(layer).getPaintProperty(name, klass);
    };
    Style.prototype.getTransition = function getTransition() {
        return util.extend({
            duration: 300,
            delay: 0
        }, this.stylesheet && this.stylesheet.transition);
    };
    Style.prototype.updateClasses = function updateClasses(layerId, paintName) {
        this._changed = true;
        if (!layerId) {
            this._updatedAllPaintProps = true;
        } else {
            var props = this._updatedPaintProps;
            if (!props[layerId])
                props[layerId] = {};
            props[layerId][paintName || 'all'] = true;
        }
    };
    Style.prototype.serialize = function serialize() {
        var this$1 = this;
        return util.filterObject({
            version: this.stylesheet.version,
            name: this.stylesheet.name,
            metadata: this.stylesheet.metadata,
            light: this.stylesheet.light,
            center: this.stylesheet.center,
            zoom: this.stylesheet.zoom,
            bearing: this.stylesheet.bearing,
            pitch: this.stylesheet.pitch,
            sprite: this.stylesheet.sprite,
            glyphs: this.stylesheet.glyphs,
            transition: this.stylesheet.transition,
            sources: util.mapObject(this.sourceCaches, function (source) {
                return source.serialize();
            }),
            layers: this._order.map(function (id) {
                return this$1._layers[id].serialize();
            })
        }, function (value) {
            return value !== undefined;
        });
    };
    Style.prototype._updateLayer = function _updateLayer(layer) {
        this._updatedLayers[layer.id] = true;
        if (layer.source && !this._updatedSources[layer.source]) {
            this._updatedSources[layer.source] = 'reload';
        }
        this._changed = true;
    };
    Style.prototype._flattenRenderedFeatures = function _flattenRenderedFeatures(sourceResults) {
        var this$1 = this;
        var features = [];
        for (var l = this._order.length - 1; l >= 0; l--) {
            var layerId = this$1._order[l];
            for (var i = 0, list = sourceResults; i < list.length; i += 1) {
                var sourceResult = list[i];
                var layerFeatures = sourceResult[layerId];
                if (layerFeatures) {
                    for (var i$1 = 0, list$1 = layerFeatures; i$1 < list$1.length; i$1 += 1) {
                        var feature = list$1[i$1];
                        features.push(feature);
                    }
                }
            }
        }
        return features;
    };
    Style.prototype.queryRenderedFeatures = function queryRenderedFeatures(queryGeometry, params, zoom, bearing) {
        var this$1 = this;
        if (params && params.filter) {
            this._validate(validateStyle.filter, 'queryRenderedFeatures.filter', params.filter);
        }
        var includedSources = {};
        if (params && params.layers) {
            for (var i = 0, list = params.layers; i < list.length; i += 1) {
                var layerId = list[i];
                var layer = this$1._layers[layerId];
                if (!layer) {
                    this$1.fire('error', { error: 'The layer \'' + layerId + '\' does not exist in the map\'s style and cannot be queried for features.' });
                    return;
                }
                includedSources[layer.source] = true;
            }
        }
        var sourceResults = [];
        for (var id in this.sourceCaches) {
            if (params.layers && !includedSources[id])
                continue;
            var results = QueryFeatures.rendered(this$1.sourceCaches[id], this$1._layers, queryGeometry, params, zoom, bearing);
            sourceResults.push(results);
        }
        return this._flattenRenderedFeatures(sourceResults);
    };
    Style.prototype.querySourceFeatures = function querySourceFeatures(sourceID, params) {
        if (params && params.filter) {
            this._validate(validateStyle.filter, 'querySourceFeatures.filter', params.filter);
        }
        var sourceCache = this.sourceCaches[sourceID];
        return sourceCache ? QueryFeatures.source(sourceCache, params) : [];
    };
    Style.prototype.addSourceType = function addSourceType(name, SourceType, callback) {
        if (Source.getType(name)) {
            return callback(new Error('A source type called "' + name + '" already exists.'));
        }
        Source.setType(name, SourceType);
        if (!SourceType.workerSourceURL) {
            return callback(null, null);
        }
        this.dispatcher.broadcast('loadWorkerSource', {
            name: name,
            url: SourceType.workerSourceURL
        }, callback);
    };
    Style.prototype.getLight = function getLight() {
        return this.light.getLight();
    };
    Style.prototype.setLight = function setLight(lightOptions, transitionOptions) {
        this._checkLoaded();
        var light = this.light.getLight();
        var _update = false;
        for (var key in lightOptions) {
            if (!util.deepEqual(lightOptions[key], light[key])) {
                _update = true;
                break;
            }
        }
        if (!_update)
            return;
        var transition = this.stylesheet.transition || {};
        this.light.setLight(lightOptions);
        this.light.updateLightTransitions(transitionOptions || { transition: true }, transition, this.animationLoop);
    };
    Style.prototype._validate = function _validate(validate, key, value, props, options) {
        if (options && options.validate === false) {
            return false;
        }
        return validateStyle.emitErrors(this, validate.call(validateStyle, util.extend({
            key: key,
            style: this.serialize(),
            value: value,
            styleSpec: styleSpec
        }, props)));
    };
    Style.prototype._remove = function _remove() {
        var this$1 = this;
        for (var id in this.sourceCaches) {
            this$1.sourceCaches[id].clearTiles();
        }
        this.dispatcher.remove();
    };
    Style.prototype._clearSource = function _clearSource(id) {
        this.sourceCaches[id].clearTiles();
    };
    Style.prototype._reloadSource = function _reloadSource(id) {
        this.sourceCaches[id].reload();
    };
    Style.prototype._updateSources = function _updateSources(transform) {
        var this$1 = this;
        for (var id in this.sourceCaches) {
            this$1.sourceCaches[id].update(transform);
        }
    };
    Style.prototype._redoPlacement = function _redoPlacement() {
        var this$1 = this;
        for (var id in this.sourceCaches) {
            this$1.sourceCaches[id].redoPlacement();
        }
    };
    Style.prototype.getIcons = function getIcons(mapId, params, callback) {
        var this$1 = this;
        var updateSpriteAtlas = function () {
            this$1.spriteAtlas.setSprite(this$1.sprite);
            this$1.spriteAtlas.addIcons(params.icons, callback);
        };
        if (this.sprite.loaded()) {
            updateSpriteAtlas();
        } else {
            this.sprite.on('data', updateSpriteAtlas);
        }
    };
    Style.prototype.getGlyphs = function getGlyphs(mapId, params, callback) {
        var this$1 = this;
        var stacks = params.stacks;
        var remaining = Object.keys(stacks).length;
        var allGlyphs = {};
        for (var fontName in stacks) {
            this$1.glyphSource.getSimpleGlyphs(fontName, stacks[fontName], params.uid, done);
        }
        function done(err, glyphs, fontName) {
            if (err)
                console.error(err);
            allGlyphs[fontName] = glyphs;
            remaining--;
            if (remaining === 0)
                callback(null, allGlyphs);
        }
    };
    return Style;
}(Evented);
module.exports = Style;
},{"../global_worker_pool":92,"../render/line_atlas":105,"../source/query_features":116,"../source/source":118,"../source/source_cache":119,"../symbol/glyph_source":151,"../symbol/sprite_atlas":156,"../util/ajax":177,"../util/browser":178,"../util/dispatcher":184,"../util/evented":186,"../util/mapbox":193,"../util/util":197,"./animation_loop":127,"./image_sprite":128,"./light":129,"./style_layer":133,"./style_spec":140,"./validate_style":142,"mapbox-gl-function":41,"mapbox-gl-style-spec/lib/deref":42,"mapbox-gl-style-spec/lib/diff":43}],132:[function(require,module,exports){
'use strict';
var MapboxGLFunction = require('mapbox-gl-function');
var parseColor = require('./parse_color');
var util = require('../util/util');
var StyleDeclaration = function StyleDeclaration(reference, value) {
    var this$1 = this;
    this.value = util.clone(value);
    this.isFunction = MapboxGLFunction.isFunctionDefinition(value);
    this.json = JSON.stringify(this.value);
    this.minimum = reference.minimum;
    this.isColor = reference.type === 'color';
    var parsedValue = this.isColor && this.value ? parseColor(this.value) : value;
    var specDefault = reference.default;
    if (specDefault && reference.type === 'color')
        specDefault = parseColor(specDefault);
    this.function = MapboxGLFunction[reference.function || 'piecewise-constant'](parsedValue, specDefault);
    this.isFeatureConstant = this.function.isFeatureConstant;
    this.isZoomConstant = this.function.isZoomConstant;
    if (!this.isFeatureConstant && !this.isZoomConstant) {
        this.stopZoomLevels = [];
        var interpolationAmountStops = [];
        for (var i = 0, list = this.value.stops; i < list.length; i += 1) {
            var stop = list[i];
            var zoom = stop[0].zoom;
            if (this$1.stopZoomLevels.indexOf(zoom) < 0) {
                this$1.stopZoomLevels.push(zoom);
                interpolationAmountStops.push([
                    zoom,
                    interpolationAmountStops.length
                ]);
            }
        }
        this.functionInterpolationT = MapboxGLFunction.interpolated({
            stops: interpolationAmountStops,
            base: value.base,
            colorSpace: value.colorSpace
        });
    }
};
StyleDeclaration.prototype.calculate = function calculate(globalProperties, featureProperties) {
    var value = this.function(globalProperties && globalProperties.zoom, featureProperties || {});
    if (this.isColor && value) {
        return parseColor(value);
    }
    if (this.minimum !== undefined && value < this.minimum) {
        return this.minimum;
    }
    return value;
};
StyleDeclaration.prototype.calculateInterpolationT = function calculateInterpolationT(globalProperties, featureProperties) {
    return this.functionInterpolationT(globalProperties && globalProperties.zoom, featureProperties || {});
};
module.exports = StyleDeclaration;
},{"../util/util":197,"./parse_color":130,"mapbox-gl-function":41}],133:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var StyleTransition = require('./style_transition');
var StyleDeclaration = require('./style_declaration');
var styleSpec = require('./style_spec');
var validateStyle = require('./validate_style');
var parseColor = require('./parse_color');
var Evented = require('../util/evented');
var TRANSITION_SUFFIX = '-transition';
var StyleLayer = function (Evented) {
    function StyleLayer(layer) {
        var this$1 = this;
        Evented.call(this);
        this.id = layer.id;
        this.metadata = layer.metadata;
        this.type = layer.type;
        this.source = layer.source;
        this.sourceLayer = layer['source-layer'];
        this.minzoom = layer.minzoom;
        this.maxzoom = layer.maxzoom;
        this.filter = layer.filter;
        this.paint = {};
        this.layout = {};
        this._paintSpecifications = styleSpec['paint_' + this.type];
        this._layoutSpecifications = styleSpec['layout_' + this.type];
        this._paintTransitions = {};
        this._paintTransitionOptions = {};
        this._paintDeclarations = {};
        this._layoutDeclarations = {};
        this._layoutFunctions = {};
        var paintName, layoutName;
        var options = { validate: false };
        for (var key in layer) {
            var match = key.match(/^paint(?:\.(.*))?$/);
            if (match) {
                var klass = match[1] || '';
                for (paintName in layer[key]) {
                    this$1.setPaintProperty(paintName, layer[key][paintName], klass, options);
                }
            }
        }
        for (layoutName in layer.layout) {
            this$1.setLayoutProperty(layoutName, layer.layout[layoutName], options);
        }
        for (paintName in this._paintSpecifications) {
            this$1.paint[paintName] = this$1.getPaintValue(paintName);
        }
        for (layoutName in this._layoutSpecifications) {
            this$1._updateLayoutValue(layoutName);
        }
    }
    if (Evented)
        StyleLayer.__proto__ = Evented;
    StyleLayer.prototype = Object.create(Evented && Evented.prototype);
    StyleLayer.prototype.constructor = StyleLayer;
    StyleLayer.prototype.setLayoutProperty = function setLayoutProperty(name, value, options) {
        if (value == null) {
            delete this._layoutDeclarations[name];
        } else {
            var key = 'layers.' + this.id + '.layout.' + name;
            if (this._validate(validateStyle.layoutProperty, key, name, value, options))
                return;
            this._layoutDeclarations[name] = new StyleDeclaration(this._layoutSpecifications[name], value);
        }
        this._updateLayoutValue(name);
    };
    StyleLayer.prototype.getLayoutProperty = function getLayoutProperty(name) {
        return this._layoutDeclarations[name] && this._layoutDeclarations[name].value;
    };
    StyleLayer.prototype.getLayoutValue = function getLayoutValue(name, globalProperties, featureProperties) {
        var specification = this._layoutSpecifications[name];
        var declaration = this._layoutDeclarations[name];
        if (declaration) {
            return declaration.calculate(globalProperties, featureProperties);
        } else {
            return specification.default;
        }
    };
    StyleLayer.prototype.setPaintProperty = function setPaintProperty(name, value, klass, options) {
        var validateStyleKey = 'layers.' + this.id + (klass ? '["paint.' + klass + '"].' : '.paint.') + name;
        if (util.endsWith(name, TRANSITION_SUFFIX)) {
            if (!this._paintTransitionOptions[klass || '']) {
                this._paintTransitionOptions[klass || ''] = {};
            }
            if (value === null || value === undefined) {
                delete this._paintTransitionOptions[klass || ''][name];
            } else {
                if (this._validate(validateStyle.paintProperty, validateStyleKey, name, value, options))
                    return;
                this._paintTransitionOptions[klass || ''][name] = value;
            }
        } else {
            if (!this._paintDeclarations[klass || '']) {
                this._paintDeclarations[klass || ''] = {};
            }
            if (value === null || value === undefined) {
                delete this._paintDeclarations[klass || ''][name];
            } else {
                if (this._validate(validateStyle.paintProperty, validateStyleKey, name, value, options))
                    return;
                this._paintDeclarations[klass || ''][name] = new StyleDeclaration(this._paintSpecifications[name], value);
            }
        }
    };
    StyleLayer.prototype.getPaintProperty = function getPaintProperty(name, klass) {
        klass = klass || '';
        if (util.endsWith(name, TRANSITION_SUFFIX)) {
            return this._paintTransitionOptions[klass] && this._paintTransitionOptions[klass][name];
        } else {
            return this._paintDeclarations[klass] && this._paintDeclarations[klass][name] && this._paintDeclarations[klass][name].value;
        }
    };
    StyleLayer.prototype.getPaintValue = function getPaintValue(name, globalProperties, featureProperties) {
        var specification = this._paintSpecifications[name];
        var transition = this._paintTransitions[name];
        if (transition) {
            return transition.calculate(globalProperties, featureProperties);
        } else if (specification.type === 'color' && specification.default) {
            return parseColor(specification.default);
        } else {
            return specification.default;
        }
    };
    StyleLayer.prototype.getPaintValueStopZoomLevels = function getPaintValueStopZoomLevels(name) {
        var transition = this._paintTransitions[name];
        if (transition) {
            return transition.declaration.stopZoomLevels;
        } else {
            return [];
        }
    };
    StyleLayer.prototype.getPaintInterpolationT = function getPaintInterpolationT(name, globalProperties) {
        var transition = this._paintTransitions[name];
        return transition.declaration.calculateInterpolationT(globalProperties);
    };
    StyleLayer.prototype.isPaintValueFeatureConstant = function isPaintValueFeatureConstant(name) {
        var transition = this._paintTransitions[name];
        if (transition) {
            return transition.declaration.isFeatureConstant;
        } else {
            return true;
        }
    };
    StyleLayer.prototype.isLayoutValueFeatureConstant = function isLayoutValueFeatureConstant(name) {
        var declaration = this._layoutDeclarations[name];
        if (declaration) {
            return declaration.isFeatureConstant;
        } else {
            return true;
        }
    };
    StyleLayer.prototype.isPaintValueZoomConstant = function isPaintValueZoomConstant(name) {
        var transition = this._paintTransitions[name];
        if (transition) {
            return transition.declaration.isZoomConstant;
        } else {
            return true;
        }
    };
    StyleLayer.prototype.isHidden = function isHidden(zoom) {
        if (this.minzoom && zoom < this.minzoom)
            return true;
        if (this.maxzoom && zoom >= this.maxzoom)
            return true;
        if (this.layout['visibility'] === 'none')
            return true;
        return false;
    };
    StyleLayer.prototype.updatePaintTransitions = function updatePaintTransitions(classes, options, globalOptions, animationLoop, zoomHistory) {
        var this$1 = this;
        var declarations = util.extend({}, this._paintDeclarations['']);
        for (var i = 0; i < classes.length; i++) {
            util.extend(declarations, this$1._paintDeclarations[classes[i]]);
        }
        var name;
        for (name in declarations) {
            this$1._applyPaintDeclaration(name, declarations[name], options, globalOptions, animationLoop, zoomHistory);
        }
        for (name in this._paintTransitions) {
            if (!(name in declarations))
                this$1._applyPaintDeclaration(name, null, options, globalOptions, animationLoop, zoomHistory);
        }
    };
    StyleLayer.prototype.updatePaintTransition = function updatePaintTransition(name, classes, options, globalOptions, animationLoop, zoomHistory) {
        var this$1 = this;
        var declaration = this._paintDeclarations[''][name];
        for (var i = 0; i < classes.length; i++) {
            var classPaintDeclarations = this$1._paintDeclarations[classes[i]];
            if (classPaintDeclarations && classPaintDeclarations[name]) {
                declaration = classPaintDeclarations[name];
            }
        }
        this._applyPaintDeclaration(name, declaration, options, globalOptions, animationLoop, zoomHistory);
    };
    StyleLayer.prototype.recalculate = function recalculate(zoom) {
        var this$1 = this;
        for (var paintName in this._paintTransitions) {
            this$1.paint[paintName] = this$1.getPaintValue(paintName, { zoom: zoom });
        }
        for (var layoutName in this._layoutFunctions) {
            this$1.layout[layoutName] = this$1.getLayoutValue(layoutName, { zoom: zoom });
        }
    };
    StyleLayer.prototype.serialize = function serialize() {
        var this$1 = this;
        var output = {
            'id': this.id,
            'type': this.type,
            'source': this.source,
            'source-layer': this.sourceLayer,
            'metadata': this.metadata,
            'minzoom': this.minzoom,
            'maxzoom': this.maxzoom,
            'filter': this.filter,
            'layout': util.mapObject(this._layoutDeclarations, getDeclarationValue)
        };
        for (var klass in this._paintDeclarations) {
            var key = klass === '' ? 'paint' : 'paint.' + klass;
            output[key] = util.mapObject(this$1._paintDeclarations[klass], getDeclarationValue);
        }
        return util.filterObject(output, function (value, key) {
            return value !== undefined && !(key === 'layout' && !Object.keys(value).length);
        });
    };
    StyleLayer.prototype._applyPaintDeclaration = function _applyPaintDeclaration(name, declaration, options, globalOptions, animationLoop, zoomHistory) {
        var oldTransition = options.transition ? this._paintTransitions[name] : undefined;
        var spec = this._paintSpecifications[name];
        if (declaration === null || declaration === undefined) {
            declaration = new StyleDeclaration(spec, spec.default);
        }
        if (oldTransition && oldTransition.declaration.json === declaration.json)
            return;
        var transitionOptions = util.extend({
            duration: 300,
            delay: 0
        }, globalOptions, this.getPaintProperty(name + TRANSITION_SUFFIX));
        var newTransition = this._paintTransitions[name] = new StyleTransition(spec, declaration, oldTransition, transitionOptions, zoomHistory);
        if (!newTransition.instant()) {
            newTransition.loopID = animationLoop.set(newTransition.endTime - Date.now());
        }
        if (oldTransition) {
            animationLoop.cancel(oldTransition.loopID);
        }
    };
    StyleLayer.prototype._updateLayoutValue = function _updateLayoutValue(name) {
        var declaration = this._layoutDeclarations[name];
        if (declaration && declaration.isFunction) {
            this._layoutFunctions[name] = true;
        } else {
            delete this._layoutFunctions[name];
            this.layout[name] = this.getLayoutValue(name);
        }
    };
    StyleLayer.prototype._validate = function _validate(validate, key, name, value, options) {
        if (options && options.validate === false) {
            return false;
        }
        return validateStyle.emitErrors(this, validate.call(validateStyle, {
            key: key,
            layerType: this.type,
            objectKey: name,
            value: value,
            styleSpec: styleSpec,
            style: {
                glyphs: true,
                sprite: true
            }
        }));
    };
    return StyleLayer;
}(Evented);
module.exports = StyleLayer;
var subclasses = {
    'circle': require('./style_layer/circle_style_layer'),
    'fill': require('./style_layer/fill_style_layer'),
    'fill-extrusion': require('./style_layer/fill_extrusion_style_layer'),
    'line': require('./style_layer/line_style_layer'),
    'symbol': require('./style_layer/symbol_style_layer')
};
StyleLayer.create = function (layer) {
    var LayerClass = subclasses[layer.type] || StyleLayer;
    return new LayerClass(layer);
};
function getDeclarationValue(declaration) {
    return declaration.value;
}
},{"../util/evented":186,"../util/util":197,"./parse_color":130,"./style_declaration":132,"./style_layer/circle_style_layer":134,"./style_layer/fill_extrusion_style_layer":135,"./style_layer/fill_style_layer":136,"./style_layer/line_style_layer":137,"./style_layer/symbol_style_layer":138,"./style_spec":140,"./style_transition":141,"./validate_style":142}],134:[function(require,module,exports){
'use strict';
var StyleLayer = require('../style_layer');
var CircleBucket = require('../../data/bucket/circle_bucket');
var CircleStyleLayer = function (StyleLayer) {
    function CircleStyleLayer() {
        StyleLayer.apply(this, arguments);
    }
    if (StyleLayer)
        CircleStyleLayer.__proto__ = StyleLayer;
    CircleStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    CircleStyleLayer.prototype.constructor = CircleStyleLayer;
    CircleStyleLayer.prototype.createBucket = function createBucket(options) {
        return new CircleBucket(options);
    };
    return CircleStyleLayer;
}(StyleLayer);
module.exports = CircleStyleLayer;
},{"../../data/bucket/circle_bucket":73,"../style_layer":133}],135:[function(require,module,exports){
'use strict';
var StyleLayer = require('../style_layer');
var FillExtrusionBucket = require('../../data/bucket/fill_extrusion_bucket');
var FillExtrusionStyleLayer = function (StyleLayer) {
    function FillExtrusionStyleLayer() {
        StyleLayer.apply(this, arguments);
    }
    if (StyleLayer)
        FillExtrusionStyleLayer.__proto__ = StyleLayer;
    FillExtrusionStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    FillExtrusionStyleLayer.prototype.constructor = FillExtrusionStyleLayer;
    FillExtrusionStyleLayer.prototype.getPaintValue = function getPaintValue(name, globalProperties, featureProperties) {
        var value = StyleLayer.prototype.getPaintValue.call(this, name, globalProperties, featureProperties);
        if (name === 'fill-extrusion-color' && value) {
            value[3] = 1;
        }
        return value;
    };
    FillExtrusionStyleLayer.prototype.createBucket = function createBucket(options) {
        return new FillExtrusionBucket(options);
    };
    return FillExtrusionStyleLayer;
}(StyleLayer);
module.exports = FillExtrusionStyleLayer;
},{"../../data/bucket/fill_extrusion_bucket":75,"../style_layer":133}],136:[function(require,module,exports){
'use strict';
var StyleLayer = require('../style_layer');
var FillBucket = require('../../data/bucket/fill_bucket');
var FillStyleLayer = function (StyleLayer) {
    function FillStyleLayer() {
        StyleLayer.apply(this, arguments);
    }
    if (StyleLayer)
        FillStyleLayer.__proto__ = StyleLayer;
    FillStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    FillStyleLayer.prototype.constructor = FillStyleLayer;
    FillStyleLayer.prototype.getPaintValue = function getPaintValue(name, globalProperties, featureProperties) {
        if (name === 'fill-outline-color' && this.getPaintProperty('fill-outline-color') === undefined) {
            return StyleLayer.prototype.getPaintValue.call(this, 'fill-color', globalProperties, featureProperties);
        } else {
            return StyleLayer.prototype.getPaintValue.call(this, name, globalProperties, featureProperties);
        }
    };
    FillStyleLayer.prototype.getPaintValueStopZoomLevels = function getPaintValueStopZoomLevels(name) {
        if (name === 'fill-outline-color' && this.getPaintProperty('fill-outline-color') === undefined) {
            return StyleLayer.prototype.getPaintValueStopZoomLevels.call(this, 'fill-color');
        } else {
            return StyleLayer.prototype.getPaintValueStopZoomLevels.call(this, name);
        }
    };
    FillStyleLayer.prototype.getPaintInterpolationT = function getPaintInterpolationT(name, globalProperties) {
        if (name === 'fill-outline-color' && this.getPaintProperty('fill-outline-color') === undefined) {
            return StyleLayer.prototype.getPaintInterpolationT.call(this, 'fill-color', globalProperties);
        } else {
            return StyleLayer.prototype.getPaintInterpolationT.call(this, name, globalProperties);
        }
    };
    FillStyleLayer.prototype.isPaintValueFeatureConstant = function isPaintValueFeatureConstant(name) {
        if (name === 'fill-outline-color' && this.getPaintProperty('fill-outline-color') === undefined) {
            return StyleLayer.prototype.isPaintValueFeatureConstant.call(this, 'fill-color');
        } else {
            return StyleLayer.prototype.isPaintValueFeatureConstant.call(this, name);
        }
    };
    FillStyleLayer.prototype.isPaintValueZoomConstant = function isPaintValueZoomConstant(name) {
        if (name === 'fill-outline-color' && this.getPaintProperty('fill-outline-color') === undefined) {
            return StyleLayer.prototype.isPaintValueZoomConstant.call(this, 'fill-color');
        } else {
            return StyleLayer.prototype.isPaintValueZoomConstant.call(this, name);
        }
    };
    FillStyleLayer.prototype.createBucket = function createBucket(options) {
        return new FillBucket(options);
    };
    return FillStyleLayer;
}(StyleLayer);
module.exports = FillStyleLayer;
},{"../../data/bucket/fill_bucket":74,"../style_layer":133}],137:[function(require,module,exports){
'use strict';
var StyleLayer = require('../style_layer');
var LineBucket = require('../../data/bucket/line_bucket');
var util = require('../../util/util');
var LineStyleLayer = function (StyleLayer) {
    function LineStyleLayer() {
        StyleLayer.apply(this, arguments);
    }
    if (StyleLayer)
        LineStyleLayer.__proto__ = StyleLayer;
    LineStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    LineStyleLayer.prototype.constructor = LineStyleLayer;
    LineStyleLayer.prototype.getPaintValue = function getPaintValue(name, globalProperties, featureProperties) {
        var value = StyleLayer.prototype.getPaintValue.call(this, name, globalProperties, featureProperties);
        if (value && name === 'line-dasharray') {
            var width = this.getPaintValue('line-width', util.extend({}, globalProperties, { zoom: Math.floor(globalProperties.zoom) }), featureProperties);
            value.fromScale *= width;
            value.toScale *= width;
        }
        return value;
    };
    LineStyleLayer.prototype.createBucket = function createBucket(options) {
        return new LineBucket(options);
    };
    return LineStyleLayer;
}(StyleLayer);
module.exports = LineStyleLayer;
},{"../../data/bucket/line_bucket":76,"../../util/util":197,"../style_layer":133}],138:[function(require,module,exports){
'use strict';
var StyleLayer = require('../style_layer');
var SymbolBucket = require('../../data/bucket/symbol_bucket');
var SymbolStyleLayer = function (StyleLayer) {
    function SymbolStyleLayer() {
        StyleLayer.apply(this, arguments);
    }
    if (StyleLayer)
        SymbolStyleLayer.__proto__ = StyleLayer;
    SymbolStyleLayer.prototype = Object.create(StyleLayer && StyleLayer.prototype);
    SymbolStyleLayer.prototype.constructor = SymbolStyleLayer;
    SymbolStyleLayer.prototype.getLayoutValue = function getLayoutValue(name, globalProperties, featureProperties) {
        var value = StyleLayer.prototype.getLayoutValue.call(this, name, globalProperties, featureProperties);
        if (value !== 'auto') {
            return value;
        }
        switch (name) {
        case 'text-rotation-alignment':
        case 'icon-rotation-alignment':
            return this.getLayoutValue('symbol-placement', globalProperties, featureProperties) === 'line' ? 'map' : 'viewport';
        case 'text-pitch-alignment':
            return this.getLayoutValue('text-rotation-alignment', globalProperties, featureProperties);
        default:
            return value;
        }
    };
    SymbolStyleLayer.prototype.createBucket = function createBucket(options) {
        return new SymbolBucket(options);
    };
    return SymbolStyleLayer;
}(StyleLayer);
module.exports = SymbolStyleLayer;
},{"../../data/bucket/symbol_bucket":77,"../style_layer":133}],139:[function(require,module,exports){
'use strict';
var StyleLayer = require('./style_layer');
var util = require('../util/util');
var featureFilter = require('feature-filter');
var groupByLayout = require('mapbox-gl-style-spec/lib/group_by_layout');
var StyleLayerIndex = function StyleLayerIndex(layerConfigs) {
    if (layerConfigs) {
        this.replace(layerConfigs);
    }
};
StyleLayerIndex.prototype.replace = function replace(layerConfigs) {
    var this$1 = this;
    this.symbolOrder = [];
    for (var i = 0, list = layerConfigs; i < list.length; i += 1) {
        var layerConfig = list[i];
        if (layerConfig.type === 'symbol') {
            this$1.symbolOrder.push(layerConfig.id);
        }
    }
    this._layerConfigs = {};
    this._layers = {};
    this.update(layerConfigs, []);
};
StyleLayerIndex.prototype.update = function update(layerConfigs, removedIds, symbolOrder) {
    var this$1 = this;
    for (var i = 0, list = layerConfigs; i < list.length; i += 1) {
        var layerConfig = list[i];
        this$1._layerConfigs[layerConfig.id] = layerConfig;
        var layer = this$1._layers[layerConfig.id] = StyleLayer.create(layerConfig);
        layer.updatePaintTransitions({}, { transition: false });
        layer.filter = featureFilter(layer.filter);
    }
    for (var i$1 = 0, list$1 = removedIds; i$1 < list$1.length; i$1 += 1) {
        var id = list$1[i$1];
        delete this$1._layerConfigs[id];
        delete this$1._layers[id];
    }
    if (symbolOrder) {
        this.symbolOrder = symbolOrder;
    }
    this.familiesBySource = {};
    var groups = groupByLayout(util.values(this._layerConfigs));
    for (var i$2 = 0, list$2 = groups; i$2 < list$2.length; i$2 += 1) {
        var layerConfigs$1 = list$2[i$2];
        var layers = layerConfigs$1.map(function (layerConfig) {
            return this$1._layers[layerConfig.id];
        });
        var layer$1 = layers[0];
        if (layer$1.layout && layer$1.layout.visibility === 'none') {
            continue;
        }
        var sourceId = layer$1.source || '';
        var sourceGroup = this$1.familiesBySource[sourceId];
        if (!sourceGroup) {
            sourceGroup = this$1.familiesBySource[sourceId] = {};
        }
        var sourceLayerId = layer$1.sourceLayer || '_geojsonTileLayer';
        var sourceLayerFamilies = sourceGroup[sourceLayerId];
        if (!sourceLayerFamilies) {
            sourceLayerFamilies = sourceGroup[sourceLayerId] = [];
        }
        sourceLayerFamilies.push(layers);
    }
};
module.exports = StyleLayerIndex;
},{"../util/util":197,"./style_layer":133,"feature-filter":15,"mapbox-gl-style-spec/lib/group_by_layout":45}],140:[function(require,module,exports){
'use strict';
module.exports = require('mapbox-gl-style-spec/reference/latest.min');
},{"mapbox-gl-style-spec/reference/latest.min":68}],141:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var interpolate = require('../util/interpolate');
var fakeZoomHistory = {
    lastIntegerZoom: 0,
    lastIntegerZoomTime: 0,
    lastZoom: 0
};
var StyleTransition = function StyleTransition(reference, declaration, oldTransition, options, zoomHistory) {
    this.declaration = declaration;
    this.startTime = this.endTime = new Date().getTime();
    this.oldTransition = oldTransition;
    this.duration = options.duration || 0;
    this.delay = options.delay || 0;
    this.zoomTransitioned = reference.function === 'piecewise-constant' && reference.transition;
    this.interp = this.zoomTransitioned ? interpZoomTransitioned : interpolate[reference.type];
    this.zoomHistory = zoomHistory || fakeZoomHistory;
    if (!this.instant()) {
        this.endTime = this.startTime + this.duration + this.delay;
    }
    if (oldTransition && oldTransition.endTime <= this.startTime) {
        delete oldTransition.oldTransition;
    }
};
StyleTransition.prototype.instant = function instant() {
    return !this.oldTransition || !this.interp || this.duration === 0 && this.delay === 0;
};
StyleTransition.prototype.calculate = function calculate(globalProperties, featureProperties, time) {
    var value = this._calculateTargetValue(globalProperties, featureProperties);
    if (this.instant())
        return value;
    time = time || Date.now();
    if (time >= this.endTime)
        return value;
    var oldValue = this.oldTransition.calculate(globalProperties, featureProperties, this.startTime);
    var t = util.easeCubicInOut((time - this.startTime - this.delay) / this.duration);
    return this.interp(oldValue, value, t);
};
StyleTransition.prototype._calculateTargetValue = function _calculateTargetValue(globalProperties, featureProperties) {
    if (!this.zoomTransitioned)
        return this.declaration.calculate(globalProperties, featureProperties);
    var z = globalProperties.zoom;
    var lastIntegerZoom = this.zoomHistory.lastIntegerZoom;
    var fromScale = z > lastIntegerZoom ? 2 : 0.5;
    var from = this.declaration.calculate({ zoom: z > lastIntegerZoom ? z - 1 : z + 1 }, featureProperties);
    var to = this.declaration.calculate({ zoom: z }, featureProperties);
    var timeFraction = Math.min((Date.now() - this.zoomHistory.lastIntegerZoomTime) / this.duration, 1);
    var zoomFraction = Math.abs(z - lastIntegerZoom);
    var t = interpolate(timeFraction, 1, zoomFraction);
    if (from === undefined || to === undefined)
        return undefined;
    return {
        from: from,
        fromScale: fromScale,
        to: to,
        toScale: 1,
        t: t
    };
};
module.exports = StyleTransition;
function interpZoomTransitioned(from, to, t) {
    if (from === undefined || to === undefined)
        return undefined;
    return {
        from: from.to,
        fromScale: from.toScale,
        to: to.to,
        toScale: to.toScale,
        t: t
    };
}
},{"../util/interpolate":189,"../util/util":197}],142:[function(require,module,exports){
'use strict';
module.exports = require('mapbox-gl-style-spec/lib/validate_style.min');
module.exports.emitErrors = function (emitter, errors) {
    if (errors && errors.length) {
        for (var i = 0; i < errors.length; i++) {
            emitter.fire('error', { error: new Error(errors[i].message) });
        }
        return true;
    } else {
        return false;
    }
};
},{"mapbox-gl-style-spec/lib/validate_style.min":67}],143:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var Anchor = function (Point) {
    function Anchor(x, y, angle, segment) {
        Point.call(this, x, y);
        this.angle = angle;
        if (segment !== undefined) {
            this.segment = segment;
        }
    }
    if (Point)
        Anchor.__proto__ = Point;
    Anchor.prototype = Object.create(Point && Point.prototype);
    Anchor.prototype.constructor = Anchor;
    Anchor.prototype.clone = function clone() {
        return new Anchor(this.x, this.y, this.angle, this.segment);
    };
    return Anchor;
}(Point);
module.exports = Anchor;
},{"point-geometry":204}],144:[function(require,module,exports){
'use strict';
module.exports = checkMaxAngle;
function checkMaxAngle(line, anchor, labelLength, windowSize, maxAngle) {
    if (anchor.segment === undefined)
        return true;
    var p = anchor;
    var index = anchor.segment + 1;
    var anchorDistance = 0;
    while (anchorDistance > -labelLength / 2) {
        index--;
        if (index < 0)
            return false;
        anchorDistance -= line[index].dist(p);
        p = line[index];
    }
    anchorDistance += line[index].dist(line[index + 1]);
    index++;
    var recentCorners = [];
    var recentAngleDelta = 0;
    while (anchorDistance < labelLength / 2) {
        var prev = line[index - 1];
        var current = line[index];
        var next = line[index + 1];
        if (!next)
            return false;
        var angleDelta = prev.angleTo(current) - current.angleTo(next);
        angleDelta = Math.abs((angleDelta + 3 * Math.PI) % (Math.PI * 2) - Math.PI);
        recentCorners.push({
            distance: anchorDistance,
            angleDelta: angleDelta
        });
        recentAngleDelta += angleDelta;
        while (anchorDistance - recentCorners[0].distance > windowSize) {
            recentAngleDelta -= recentCorners.shift().angleDelta;
        }
        if (recentAngleDelta > maxAngle)
            return false;
        index++;
        anchorDistance += current.dist(next);
    }
    return true;
}
},{}],145:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
module.exports = clipLine;
function clipLine(lines, x1, y1, x2, y2) {
    var clippedLines = [];
    for (var l = 0; l < lines.length; l++) {
        var line = lines[l];
        var clippedLine;
        for (var i = 0; i < line.length - 1; i++) {
            var p0 = line[i];
            var p1 = line[i + 1];
            if (p0.x < x1 && p1.x < x1) {
                continue;
            } else if (p0.x < x1) {
                p0 = new Point(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
            } else if (p1.x < x1) {
                p1 = new Point(x1, p0.y + (p1.y - p0.y) * ((x1 - p0.x) / (p1.x - p0.x)))._round();
            }
            if (p0.y < y1 && p1.y < y1) {
                continue;
            } else if (p0.y < y1) {
                p0 = new Point(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
            } else if (p1.y < y1) {
                p1 = new Point(p0.x + (p1.x - p0.x) * ((y1 - p0.y) / (p1.y - p0.y)), y1)._round();
            }
            if (p0.x >= x2 && p1.x >= x2) {
                continue;
            } else if (p0.x >= x2) {
                p0 = new Point(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
            } else if (p1.x >= x2) {
                p1 = new Point(x2, p0.y + (p1.y - p0.y) * ((x2 - p0.x) / (p1.x - p0.x)))._round();
            }
            if (p0.y >= y2 && p1.y >= y2) {
                continue;
            } else if (p0.y >= y2) {
                p0 = new Point(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
            } else if (p1.y >= y2) {
                p1 = new Point(p0.x + (p1.x - p0.x) * ((y2 - p0.y) / (p1.y - p0.y)), y2)._round();
            }
            if (!clippedLine || !p0.equals(clippedLine[clippedLine.length - 1])) {
                clippedLine = [p0];
                clippedLines.push(clippedLine);
            }
            clippedLine.push(p1);
        }
    }
    return clippedLines;
}
},{"point-geometry":204}],146:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
var Point = require('point-geometry');
var CollisionBoxArray = createStructArrayType({
    members: [
        {
            type: 'Int16',
            name: 'anchorPointX'
        },
        {
            type: 'Int16',
            name: 'anchorPointY'
        },
        {
            type: 'Int16',
            name: 'x1'
        },
        {
            type: 'Int16',
            name: 'y1'
        },
        {
            type: 'Int16',
            name: 'x2'
        },
        {
            type: 'Int16',
            name: 'y2'
        },
        {
            type: 'Float32',
            name: 'maxScale'
        },
        {
            type: 'Uint32',
            name: 'featureIndex'
        },
        {
            type: 'Uint16',
            name: 'sourceLayerIndex'
        },
        {
            type: 'Uint16',
            name: 'bucketIndex'
        },
        {
            type: 'Int16',
            name: 'bbox0'
        },
        {
            type: 'Int16',
            name: 'bbox1'
        },
        {
            type: 'Int16',
            name: 'bbox2'
        },
        {
            type: 'Int16',
            name: 'bbox3'
        },
        {
            type: 'Float32',
            name: 'placementScale'
        }
    ]
});
Object.defineProperty(CollisionBoxArray.prototype.StructType.prototype, 'anchorPoint', {
    get: function get() {
        return new Point(this.anchorPointX, this.anchorPointY);
    }
});
module.exports = CollisionBoxArray;
},{"../util/struct_array":195,"point-geometry":204}],147:[function(require,module,exports){
'use strict';
var CollisionFeature = function CollisionFeature(collisionBoxArray, line, anchor, featureIndex, sourceLayerIndex, bucketIndex, shaped, boxScale, padding, alignLine, straight) {
    var y1 = shaped.top * boxScale - padding;
    var y2 = shaped.bottom * boxScale + padding;
    var x1 = shaped.left * boxScale - padding;
    var x2 = shaped.right * boxScale + padding;
    this.boxStartIndex = collisionBoxArray.length;
    if (alignLine) {
        var height = y2 - y1;
        var length = x2 - x1;
        if (height > 0) {
            height = Math.max(10 * boxScale, height);
            if (straight) {
                var vector = line[anchor.segment + 1].sub(line[anchor.segment])._unit()._mult(length);
                var straightLine = [
                    anchor.sub(vector),
                    anchor.add(vector)
                ];
                this._addLineCollisionBoxes(collisionBoxArray, straightLine, anchor, 0, length, height, featureIndex, sourceLayerIndex, bucketIndex);
            } else {
                this._addLineCollisionBoxes(collisionBoxArray, line, anchor, anchor.segment, length, height, featureIndex, sourceLayerIndex, bucketIndex);
            }
        }
    } else {
        collisionBoxArray.emplaceBack(anchor.x, anchor.y, x1, y1, x2, y2, Infinity, featureIndex, sourceLayerIndex, bucketIndex, 0, 0, 0, 0, 0);
    }
    this.boxEndIndex = collisionBoxArray.length;
};
CollisionFeature.prototype._addLineCollisionBoxes = function _addLineCollisionBoxes(collisionBoxArray, line, anchor, segment, labelLength, boxSize, featureIndex, sourceLayerIndex, bucketIndex) {
    var step = boxSize / 2;
    var nBoxes = Math.floor(labelLength / step);
    var firstBoxOffset = -boxSize / 2;
    var bboxes = this.boxes;
    var p = anchor;
    var index = segment + 1;
    var anchorDistance = firstBoxOffset;
    do {
        index--;
        if (index < 0)
            return bboxes;
        anchorDistance -= line[index].dist(p);
        p = line[index];
    } while (anchorDistance > -labelLength / 2);
    var segmentLength = line[index].dist(line[index + 1]);
    for (var i = 0; i < nBoxes; i++) {
        var boxDistanceToAnchor = -labelLength / 2 + i * step;
        while (anchorDistance + segmentLength < boxDistanceToAnchor) {
            anchorDistance += segmentLength;
            index++;
            if (index + 1 >= line.length)
                return bboxes;
            segmentLength = line[index].dist(line[index + 1]);
        }
        var segmentBoxDistance = boxDistanceToAnchor - anchorDistance;
        var p0 = line[index];
        var p1 = line[index + 1];
        var boxAnchorPoint = p1.sub(p0)._unit()._mult(segmentBoxDistance)._add(p0)._round();
        var distanceToInnerEdge = Math.max(Math.abs(boxDistanceToAnchor - firstBoxOffset) - step / 2, 0);
        var maxScale = labelLength / 2 / distanceToInnerEdge;
        collisionBoxArray.emplaceBack(boxAnchorPoint.x, boxAnchorPoint.y, -boxSize / 2, -boxSize / 2, boxSize / 2, boxSize / 2, maxScale, featureIndex, sourceLayerIndex, bucketIndex, 0, 0, 0, 0, 0);
    }
    return bboxes;
};
module.exports = CollisionFeature;
},{}],148:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var EXTENT = require('../data/extent');
var Grid = require('grid-index');
var intersectionTests = require('../util/intersection_tests');
var CollisionTile = function CollisionTile(angle, pitch, collisionBoxArray) {
    if (typeof angle === 'object') {
        var serialized = angle;
        collisionBoxArray = pitch;
        angle = serialized.angle;
        pitch = serialized.pitch;
        this.grid = new Grid(serialized.grid);
        this.ignoredGrid = new Grid(serialized.ignoredGrid);
    } else {
        this.grid = new Grid(EXTENT, 12, 6);
        this.ignoredGrid = new Grid(EXTENT, 12, 0);
    }
    this.minScale = 0.5;
    this.maxScale = 2;
    this.angle = angle;
    this.pitch = pitch;
    var sin = Math.sin(angle), cos = Math.cos(angle);
    this.rotationMatrix = [
        cos,
        -sin,
        sin,
        cos
    ];
    this.reverseRotationMatrix = [
        cos,
        sin,
        -sin,
        cos
    ];
    this.yStretch = 1 / Math.cos(pitch / 180 * Math.PI);
    this.yStretch = Math.pow(this.yStretch, 1.3);
    this.collisionBoxArray = collisionBoxArray;
    if (collisionBoxArray.length === 0) {
        collisionBoxArray.emplaceBack();
        var maxInt16 = 32767;
        collisionBoxArray.emplaceBack(0, 0, 0, -maxInt16, 0, maxInt16, maxInt16, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        collisionBoxArray.emplaceBack(EXTENT, 0, 0, -maxInt16, 0, maxInt16, maxInt16, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        collisionBoxArray.emplaceBack(0, 0, -maxInt16, 0, maxInt16, 0, maxInt16, 0, 0, 0, 0, 0, 0, 0, 0, 0);
        collisionBoxArray.emplaceBack(0, EXTENT, -maxInt16, 0, maxInt16, 0, maxInt16, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    }
    this.tempCollisionBox = collisionBoxArray.get(0);
    this.edges = [
        collisionBoxArray.get(1),
        collisionBoxArray.get(2),
        collisionBoxArray.get(3),
        collisionBoxArray.get(4)
    ];
};
CollisionTile.prototype.serialize = function serialize(transferables) {
    var grid = this.grid.toArrayBuffer();
    var ignoredGrid = this.ignoredGrid.toArrayBuffer();
    if (transferables) {
        transferables.push(grid);
        transferables.push(ignoredGrid);
    }
    return {
        angle: this.angle,
        pitch: this.pitch,
        grid: grid,
        ignoredGrid: ignoredGrid
    };
};
CollisionTile.prototype.placeCollisionFeature = function placeCollisionFeature(collisionFeature, allowOverlap, avoidEdges) {
    var this$1 = this;
    var collisionBoxArray = this.collisionBoxArray;
    var minPlacementScale = this.minScale;
    var rotationMatrix = this.rotationMatrix;
    var yStretch = this.yStretch;
    for (var b = collisionFeature.boxStartIndex; b < collisionFeature.boxEndIndex; b++) {
        var box = collisionBoxArray.get(b);
        var anchorPoint = box.anchorPoint._matMult(rotationMatrix);
        var x = anchorPoint.x;
        var y = anchorPoint.y;
        var x1 = x + box.x1;
        var y1 = y + box.y1 * yStretch;
        var x2 = x + box.x2;
        var y2 = y + box.y2 * yStretch;
        box.bbox0 = x1;
        box.bbox1 = y1;
        box.bbox2 = x2;
        box.bbox3 = y2;
        if (!allowOverlap) {
            var blockingBoxes = this$1.grid.query(x1, y1, x2, y2);
            for (var i = 0; i < blockingBoxes.length; i++) {
                var blocking = collisionBoxArray.get(blockingBoxes[i]);
                var blockingAnchorPoint = blocking.anchorPoint._matMult(rotationMatrix);
                minPlacementScale = this$1.getPlacementScale(minPlacementScale, anchorPoint, box, blockingAnchorPoint, blocking);
                if (minPlacementScale >= this$1.maxScale) {
                    return minPlacementScale;
                }
            }
        }
        if (avoidEdges) {
            var rotatedCollisionBox;
            if (this$1.angle) {
                var reverseRotationMatrix = this$1.reverseRotationMatrix;
                var tl = new Point(box.x1, box.y1).matMult(reverseRotationMatrix);
                var tr = new Point(box.x2, box.y1).matMult(reverseRotationMatrix);
                var bl = new Point(box.x1, box.y2).matMult(reverseRotationMatrix);
                var br = new Point(box.x2, box.y2).matMult(reverseRotationMatrix);
                rotatedCollisionBox = this$1.tempCollisionBox;
                rotatedCollisionBox.anchorPointX = box.anchorPoint.x;
                rotatedCollisionBox.anchorPointY = box.anchorPoint.y;
                rotatedCollisionBox.x1 = Math.min(tl.x, tr.x, bl.x, br.x);
                rotatedCollisionBox.y1 = Math.min(tl.y, tr.x, bl.x, br.x);
                rotatedCollisionBox.x2 = Math.max(tl.x, tr.x, bl.x, br.x);
                rotatedCollisionBox.y2 = Math.max(tl.y, tr.x, bl.x, br.x);
                rotatedCollisionBox.maxScale = box.maxScale;
            } else {
                rotatedCollisionBox = box;
            }
            for (var k = 0; k < this.edges.length; k++) {
                var edgeBox = this$1.edges[k];
                minPlacementScale = this$1.getPlacementScale(minPlacementScale, box.anchorPoint, rotatedCollisionBox, edgeBox.anchorPoint, edgeBox);
                if (minPlacementScale >= this$1.maxScale) {
                    return minPlacementScale;
                }
            }
        }
    }
    return minPlacementScale;
};
CollisionTile.prototype.queryRenderedSymbols = function queryRenderedSymbols(queryGeometry, scale) {
    var sourceLayerFeatures = {};
    var result = [];
    if (queryGeometry.length === 0 || this.grid.length === 0 && this.ignoredGrid.length === 0) {
        return result;
    }
    var collisionBoxArray = this.collisionBoxArray;
    var rotationMatrix = this.rotationMatrix;
    var yStretch = this.yStretch;
    var rotatedQuery = [];
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < queryGeometry.length; i++) {
        var ring = queryGeometry[i];
        for (var k = 0; k < ring.length; k++) {
            var p = ring[k].matMult(rotationMatrix);
            minX = Math.min(minX, p.x);
            minY = Math.min(minY, p.y);
            maxX = Math.max(maxX, p.x);
            maxY = Math.max(maxY, p.y);
            rotatedQuery.push(p);
        }
    }
    var features = this.grid.query(minX, minY, maxX, maxY);
    var ignoredFeatures = this.ignoredGrid.query(minX, minY, maxX, maxY);
    for (var i$1 = 0; i$1 < ignoredFeatures.length; i$1++) {
        features.push(ignoredFeatures[i$1]);
    }
    var roundedScale = Math.pow(2, Math.ceil(Math.log(scale) / Math.LN2 * 10) / 10);
    for (var i$2 = 0; i$2 < features.length; i$2++) {
        var blocking = collisionBoxArray.get(features[i$2]);
        var sourceLayer = blocking.sourceLayerIndex;
        var featureIndex = blocking.featureIndex;
        if (sourceLayerFeatures[sourceLayer] === undefined) {
            sourceLayerFeatures[sourceLayer] = {};
        }
        if (sourceLayerFeatures[sourceLayer][featureIndex])
            continue;
        if (roundedScale < blocking.placementScale || roundedScale > blocking.maxScale)
            continue;
        var anchor = blocking.anchorPoint.matMult(rotationMatrix);
        var x1 = anchor.x + blocking.x1 / scale;
        var y1 = anchor.y + blocking.y1 / scale * yStretch;
        var x2 = anchor.x + blocking.x2 / scale;
        var y2 = anchor.y + blocking.y2 / scale * yStretch;
        var bbox = [
            new Point(x1, y1),
            new Point(x2, y1),
            new Point(x2, y2),
            new Point(x1, y2)
        ];
        if (!intersectionTests.polygonIntersectsPolygon(rotatedQuery, bbox))
            continue;
        sourceLayerFeatures[sourceLayer][featureIndex] = true;
        result.push(features[i$2]);
    }
    return result;
};
CollisionTile.prototype.getPlacementScale = function getPlacementScale(minPlacementScale, anchorPoint, box, blockingAnchorPoint, blocking) {
    var anchorDiffX = anchorPoint.x - blockingAnchorPoint.x;
    var anchorDiffY = anchorPoint.y - blockingAnchorPoint.y;
    var s1 = (blocking.x1 - box.x2) / anchorDiffX;
    var s2 = (blocking.x2 - box.x1) / anchorDiffX;
    var s3 = (blocking.y1 - box.y2) * this.yStretch / anchorDiffY;
    var s4 = (blocking.y2 - box.y1) * this.yStretch / anchorDiffY;
    if (isNaN(s1) || isNaN(s2))
        s1 = s2 = 1;
    if (isNaN(s3) || isNaN(s4))
        s3 = s4 = 1;
    var collisionFreeScale = Math.min(Math.max(s1, s2), Math.max(s3, s4));
    var blockingMaxScale = blocking.maxScale;
    var boxMaxScale = box.maxScale;
    if (collisionFreeScale > blockingMaxScale) {
        collisionFreeScale = blockingMaxScale;
    }
    if (collisionFreeScale > boxMaxScale) {
        collisionFreeScale = boxMaxScale;
    }
    if (collisionFreeScale > minPlacementScale && collisionFreeScale >= blocking.placementScale) {
        minPlacementScale = collisionFreeScale;
    }
    return minPlacementScale;
};
CollisionTile.prototype.insertCollisionFeature = function insertCollisionFeature(collisionFeature, minPlacementScale, ignorePlacement) {
    var this$1 = this;
    var grid = ignorePlacement ? this.ignoredGrid : this.grid;
    var collisionBoxArray = this.collisionBoxArray;
    for (var k = collisionFeature.boxStartIndex; k < collisionFeature.boxEndIndex; k++) {
        var box = collisionBoxArray.get(k);
        box.placementScale = minPlacementScale;
        if (minPlacementScale < this$1.maxScale) {
            grid.insert(k, box.bbox0, box.bbox1, box.bbox2, box.bbox3);
        }
    }
};
module.exports = CollisionTile;
},{"../data/extent":81,"../util/intersection_tests":190,"grid-index":26,"point-geometry":204}],149:[function(require,module,exports){
'use strict';
var interpolate = require('../util/interpolate');
var Anchor = require('../symbol/anchor');
var checkMaxAngle = require('./check_max_angle');
module.exports = getAnchors;
function getAnchors(line, spacing, maxAngle, shapedText, shapedIcon, glyphSize, boxScale, overscaling, tileExtent) {
    var angleWindowSize = shapedText ? 3 / 5 * glyphSize * boxScale : 0;
    var labelLength = Math.max(shapedText ? shapedText.right - shapedText.left : 0, shapedIcon ? shapedIcon.right - shapedIcon.left : 0);
    var isLineContinued = line[0].x === 0 || line[0].x === tileExtent || line[0].y === 0 || line[0].y === tileExtent;
    if (spacing - labelLength * boxScale < spacing / 4) {
        spacing = labelLength * boxScale + spacing / 4;
    }
    var fixedExtraOffset = glyphSize * 2;
    var offset = !isLineContinued ? (labelLength / 2 + fixedExtraOffset) * boxScale * overscaling % spacing : spacing / 2 * overscaling % spacing;
    return resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength * boxScale, isLineContinued, false, tileExtent);
}
function resample(line, offset, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, placeAtMiddle, tileExtent) {
    var halfLabelLength = labelLength / 2;
    var lineLength = 0;
    for (var k = 0; k < line.length - 1; k++) {
        lineLength += line[k].dist(line[k + 1]);
    }
    var distance = 0, markedDistance = offset - spacing;
    var anchors = [];
    for (var i = 0; i < line.length - 1; i++) {
        var a = line[i], b = line[i + 1];
        var segmentDist = a.dist(b), angle = b.angleTo(a);
        while (markedDistance + spacing < distance + segmentDist) {
            markedDistance += spacing;
            var t = (markedDistance - distance) / segmentDist, x = interpolate(a.x, b.x, t), y = interpolate(a.y, b.y, t);
            if (x >= 0 && x < tileExtent && y >= 0 && y < tileExtent && markedDistance - halfLabelLength >= 0 && markedDistance + halfLabelLength <= lineLength) {
                var anchor = new Anchor(x, y, angle, i)._round();
                if (!angleWindowSize || checkMaxAngle(line, anchor, labelLength, angleWindowSize, maxAngle)) {
                    anchors.push(anchor);
                }
            }
        }
        distance += segmentDist;
    }
    if (!placeAtMiddle && !anchors.length && !isLineContinued) {
        anchors = resample(line, distance / 2, spacing, angleWindowSize, maxAngle, labelLength, isLineContinued, true, tileExtent);
    }
    return anchors;
}
},{"../symbol/anchor":143,"../util/interpolate":189,"./check_max_angle":144}],150:[function(require,module,exports){
'use strict';
var ShelfPack = require('shelf-pack');
var util = require('../util/util');
var SIZE_GROWTH_RATE = 4;
var DEFAULT_SIZE = 128;
var MAX_SIZE = 2048;
var GlyphAtlas = function GlyphAtlas() {
    this.width = DEFAULT_SIZE;
    this.height = DEFAULT_SIZE;
    this.bin = new ShelfPack(this.width, this.height);
    this.index = {};
    this.ids = {};
    this.data = new Uint8Array(this.width * this.height);
};
GlyphAtlas.prototype.getGlyphs = function getGlyphs() {
    var glyphs = {};
    var split, name, id;
    for (var key in this.ids) {
        split = key.split('#');
        name = split[0];
        id = split[1];
        if (!glyphs[name])
            glyphs[name] = [];
        glyphs[name].push(id);
    }
    return glyphs;
};
GlyphAtlas.prototype.getRects = function getRects() {
    var this$1 = this;
    var rects = {};
    var split, name, id;
    for (var key in this.ids) {
        split = key.split('#');
        name = split[0];
        id = split[1];
        if (!rects[name])
            rects[name] = {};
        rects[name][id] = this$1.index[key];
    }
    return rects;
};
GlyphAtlas.prototype.addGlyph = function addGlyph(id, name, glyph, buffer) {
    var this$1 = this;
    if (!glyph)
        return null;
    var key = name + '#' + glyph.id;
    if (this.index[key]) {
        if (this.ids[key].indexOf(id) < 0) {
            this.ids[key].push(id);
        }
        return this.index[key];
    }
    if (!glyph.bitmap) {
        return null;
    }
    var bufferedWidth = glyph.width + buffer * 2;
    var bufferedHeight = glyph.height + buffer * 2;
    var padding = 1;
    var packWidth = bufferedWidth + 2 * padding;
    var packHeight = bufferedHeight + 2 * padding;
    packWidth += 4 - packWidth % 4;
    packHeight += 4 - packHeight % 4;
    var rect = this.bin.packOne(packWidth, packHeight);
    if (!rect) {
        this.resize();
        rect = this.bin.packOne(packWidth, packHeight);
    }
    if (!rect) {
        util.warnOnce('glyph bitmap overflow');
        return null;
    }
    this.index[key] = rect;
    this.ids[key] = [id];
    var target = this.data;
    var source = glyph.bitmap;
    for (var y = 0; y < bufferedHeight; y++) {
        var y1 = this$1.width * (rect.y + y + padding) + rect.x + padding;
        var y2 = bufferedWidth * y;
        for (var x = 0; x < bufferedWidth; x++) {
            target[y1 + x] = source[y2 + x];
        }
    }
    this.dirty = true;
    return rect;
};
GlyphAtlas.prototype.resize = function resize() {
    var this$1 = this;
    var prevWidth = this.width;
    var prevHeight = this.height;
    if (prevWidth >= MAX_SIZE || prevHeight >= MAX_SIZE)
        return;
    if (this.texture) {
        if (this.gl) {
            this.gl.deleteTexture(this.texture);
        }
        this.texture = null;
    }
    this.width *= SIZE_GROWTH_RATE;
    this.height *= SIZE_GROWTH_RATE;
    this.bin.resize(this.width, this.height);
    var buf = new ArrayBuffer(this.width * this.height);
    for (var i = 0; i < prevHeight; i++) {
        var src = new Uint8Array(this$1.data.buffer, prevHeight * i, prevWidth);
        var dst = new Uint8Array(buf, prevHeight * i * SIZE_GROWTH_RATE, prevWidth);
        dst.set(src);
    }
    this.data = new Uint8Array(buf);
};
GlyphAtlas.prototype.bind = function bind(gl) {
    this.gl = gl;
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.ALPHA, this.width, this.height, 0, gl.ALPHA, gl.UNSIGNED_BYTE, null);
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
};
GlyphAtlas.prototype.updateTexture = function updateTexture(gl) {
    this.bind(gl);
    if (this.dirty) {
        gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width, this.height, gl.ALPHA, gl.UNSIGNED_BYTE, this.data);
        this.dirty = false;
    }
};
module.exports = GlyphAtlas;
},{"../util/util":197,"shelf-pack":206}],151:[function(require,module,exports){
'use strict';
var normalizeURL = require('../util/mapbox').normalizeGlyphsURL;
var ajax = require('../util/ajax');
var verticalizePunctuation = require('../util/verticalize_punctuation');
var Glyphs = require('../util/glyphs');
var GlyphAtlas = require('../symbol/glyph_atlas');
var Protobuf = require('pbf');
var SimpleGlyph = function SimpleGlyph(glyph, rect, buffer) {
    var padding = 1;
    this.advance = glyph.advance;
    this.left = glyph.left - buffer - padding;
    this.top = glyph.top + buffer + padding;
    this.rect = rect;
};
var GlyphSource = function GlyphSource(url) {
    this.url = url && normalizeURL(url);
    this.atlases = {};
    this.stacks = {};
    this.loading = {};
};
GlyphSource.prototype.getSimpleGlyphs = function getSimpleGlyphs(fontstack, glyphIDs, uid, callback) {
    var this$1 = this;
    if (this.stacks[fontstack] === undefined) {
        this.stacks[fontstack] = {};
    }
    if (this.atlases[fontstack] === undefined) {
        this.atlases[fontstack] = new GlyphAtlas();
    }
    var glyphs = {};
    var stack = this.stacks[fontstack];
    var atlas = this.atlases[fontstack];
    var buffer = 3;
    var missing = {};
    var remaining = 0;
    var getGlyph = function (glyphID) {
        var range = Math.floor(glyphID / 256);
        if (stack[range]) {
            var glyph = stack[range].glyphs[glyphID];
            var rect = atlas.addGlyph(uid, fontstack, glyph, buffer);
            if (glyph)
                glyphs[glyphID] = new SimpleGlyph(glyph, rect, buffer);
        } else {
            if (missing[range] === undefined) {
                missing[range] = [];
                remaining++;
            }
            missing[range].push(glyphID);
        }
    };
    for (var i = 0; i < glyphIDs.length; i++) {
        var glyphID = glyphIDs[i];
        var string = String.fromCharCode(glyphID);
        getGlyph(glyphID);
        if (verticalizePunctuation.lookup[string]) {
            getGlyph(verticalizePunctuation.lookup[string].charCodeAt(0));
        }
    }
    if (!remaining)
        callback(undefined, glyphs, fontstack);
    var onRangeLoaded = function (err, range, data) {
        if (!err) {
            var stack = this$1.stacks[fontstack][range] = data.stacks[0];
            for (var i = 0; i < missing[range].length; i++) {
                var glyphID = missing[range][i];
                var glyph = stack.glyphs[glyphID];
                var rect = atlas.addGlyph(uid, fontstack, glyph, buffer);
                if (glyph)
                    glyphs[glyphID] = new SimpleGlyph(glyph, rect, buffer);
            }
        }
        remaining--;
        if (!remaining)
            callback(undefined, glyphs, fontstack);
    };
    for (var r in missing) {
        this$1.loadRange(fontstack, r, onRangeLoaded);
    }
};
GlyphSource.prototype.loadRange = function loadRange(fontstack, range, callback) {
    if (range * 256 > 65535)
        return callback('glyphs > 65535 not supported');
    if (this.loading[fontstack] === undefined) {
        this.loading[fontstack] = {};
    }
    var loading = this.loading[fontstack];
    if (loading[range]) {
        loading[range].push(callback);
    } else {
        loading[range] = [callback];
        var rangeName = range * 256 + '-' + (range * 256 + 255);
        var url = glyphUrl(fontstack, rangeName, this.url);
        ajax.getArrayBuffer(url, function (err, data) {
            var glyphs = !err && new Glyphs(new Protobuf(data));
            for (var i = 0; i < loading[range].length; i++) {
                loading[range][i](err, range, glyphs);
            }
            delete loading[range];
        });
    }
};
GlyphSource.prototype.getGlyphAtlas = function getGlyphAtlas(fontstack) {
    return this.atlases[fontstack];
};
function glyphUrl(fontstack, range, url, subdomains) {
    subdomains = subdomains || 'abc';
    return url.replace('{s}', subdomains[fontstack.length % subdomains.length]).replace('{fontstack}', fontstack).replace('{range}', range);
}
module.exports = GlyphSource;
},{"../symbol/glyph_atlas":150,"../util/ajax":177,"../util/glyphs":188,"../util/mapbox":193,"../util/verticalize_punctuation":199,"pbf":203}],152:[function(require,module,exports){
'use strict';
module.exports = function (features) {
    var leftIndex = {};
    var rightIndex = {};
    var mergedFeatures = [];
    var mergedIndex = 0;
    function add(k) {
        mergedFeatures.push(features[k]);
        mergedIndex++;
    }
    function mergeFromRight(leftKey, rightKey, geom) {
        var i = rightIndex[leftKey];
        delete rightIndex[leftKey];
        rightIndex[rightKey] = i;
        mergedFeatures[i].geometry[0].pop();
        mergedFeatures[i].geometry[0] = mergedFeatures[i].geometry[0].concat(geom[0]);
        return i;
    }
    function mergeFromLeft(leftKey, rightKey, geom) {
        var i = leftIndex[rightKey];
        delete leftIndex[rightKey];
        leftIndex[leftKey] = i;
        mergedFeatures[i].geometry[0].shift();
        mergedFeatures[i].geometry[0] = geom[0].concat(mergedFeatures[i].geometry[0]);
        return i;
    }
    function getKey(text, geom, onRight) {
        var point = onRight ? geom[0][geom[0].length - 1] : geom[0][0];
        return text + ':' + point.x + ':' + point.y;
    }
    for (var k = 0; k < features.length; k++) {
        var feature = features[k];
        var geom = feature.geometry;
        var text = feature.text;
        if (!text) {
            add(k);
            continue;
        }
        var leftKey = getKey(text, geom), rightKey = getKey(text, geom, true);
        if (leftKey in rightIndex && rightKey in leftIndex && rightIndex[leftKey] !== leftIndex[rightKey]) {
            var j = mergeFromLeft(leftKey, rightKey, geom);
            var i = mergeFromRight(leftKey, rightKey, mergedFeatures[j].geometry);
            delete leftIndex[leftKey];
            delete rightIndex[rightKey];
            rightIndex[getKey(text, mergedFeatures[i].geometry, true)] = i;
            mergedFeatures[j].geometry = null;
        } else if (leftKey in rightIndex) {
            mergeFromRight(leftKey, rightKey, geom);
        } else if (rightKey in leftIndex) {
            mergeFromLeft(leftKey, rightKey, geom);
        } else {
            add(k);
            leftIndex[leftKey] = mergedIndex - 1;
            rightIndex[rightKey] = mergedIndex - 1;
        }
    }
    return mergedFeatures.filter(function (f) {
        return f.geometry;
    });
};
},{}],153:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
module.exports = {
    getIconQuads: getIconQuads,
    getGlyphQuads: getGlyphQuads,
    SymbolQuad: SymbolQuad
};
var minScale = 0.5;
function SymbolQuad(anchorPoint, tl, tr, bl, br, tex, anchorAngle, glyphAngle, minScale, maxScale, writingMode) {
    this.anchorPoint = anchorPoint;
    this.tl = tl;
    this.tr = tr;
    this.bl = bl;
    this.br = br;
    this.tex = tex;
    this.anchorAngle = anchorAngle;
    this.glyphAngle = glyphAngle;
    this.minScale = minScale;
    this.maxScale = maxScale;
    this.writingMode = writingMode;
}
function getIconQuads(anchor, shapedIcon, boxScale, line, layer, alongLine, shapedText, globalProperties, featureProperties) {
    var rect = shapedIcon.image.rect;
    var layout = layer.layout;
    var border = 1;
    var left = shapedIcon.left - border;
    var right = left + rect.w / shapedIcon.image.pixelRatio;
    var top = shapedIcon.top - border;
    var bottom = top + rect.h / shapedIcon.image.pixelRatio;
    var tl, tr, br, bl;
    if (layout['icon-text-fit'] !== 'none' && shapedText) {
        var iconWidth = right - left, iconHeight = bottom - top, size = layout['text-size'] / 24, textLeft = shapedText.left * size, textRight = shapedText.right * size, textTop = shapedText.top * size, textBottom = shapedText.bottom * size, textWidth = textRight - textLeft, textHeight = textBottom - textTop, padT = layout['icon-text-fit-padding'][0], padR = layout['icon-text-fit-padding'][1], padB = layout['icon-text-fit-padding'][2], padL = layout['icon-text-fit-padding'][3], offsetY = layout['icon-text-fit'] === 'width' ? (textHeight - iconHeight) * 0.5 : 0, offsetX = layout['icon-text-fit'] === 'height' ? (textWidth - iconWidth) * 0.5 : 0, width = layout['icon-text-fit'] === 'width' || layout['icon-text-fit'] === 'both' ? textWidth : iconWidth, height = layout['icon-text-fit'] === 'height' || layout['icon-text-fit'] === 'both' ? textHeight : iconHeight;
        tl = new Point(textLeft + offsetX - padL, textTop + offsetY - padT);
        tr = new Point(textLeft + offsetX + padR + width, textTop + offsetY - padT);
        br = new Point(textLeft + offsetX + padR + width, textTop + offsetY + padB + height);
        bl = new Point(textLeft + offsetX - padL, textTop + offsetY + padB + height);
    } else {
        tl = new Point(left, top);
        tr = new Point(right, top);
        br = new Point(right, bottom);
        bl = new Point(left, bottom);
    }
    var angle = layer.getLayoutValue('icon-rotate', globalProperties, featureProperties) * Math.PI / 180;
    if (alongLine) {
        var prev = line[anchor.segment];
        if (anchor.y === prev.y && anchor.x === prev.x && anchor.segment + 1 < line.length) {
            var next = line[anchor.segment + 1];
            angle += Math.atan2(anchor.y - next.y, anchor.x - next.x) + Math.PI;
        } else {
            angle += Math.atan2(anchor.y - prev.y, anchor.x - prev.x);
        }
    }
    if (angle) {
        var sin = Math.sin(angle), cos = Math.cos(angle), matrix = [
                cos,
                -sin,
                sin,
                cos
            ];
        tl = tl.matMult(matrix);
        tr = tr.matMult(matrix);
        bl = bl.matMult(matrix);
        br = br.matMult(matrix);
    }
    return [new SymbolQuad(new Point(anchor.x, anchor.y), tl, tr, bl, br, shapedIcon.image.rect, 0, 0, minScale, Infinity)];
}
function getGlyphQuads(anchor, shaping, boxScale, line, layer, alongLine) {
    var textRotate = layer.layout['text-rotate'] * Math.PI / 180;
    var keepUpright = layer.layout['text-keep-upright'];
    var positionedGlyphs = shaping.positionedGlyphs;
    var quads = [];
    for (var k = 0; k < positionedGlyphs.length; k++) {
        var positionedGlyph = positionedGlyphs[k];
        var glyph = positionedGlyph.glyph;
        if (!glyph)
            continue;
        var rect = glyph.rect;
        if (!rect)
            continue;
        var centerX = (positionedGlyph.x + glyph.advance / 2) * boxScale;
        var glyphInstances;
        var labelMinScale = minScale;
        if (alongLine) {
            glyphInstances = [];
            labelMinScale = getSegmentGlyphs(glyphInstances, anchor, centerX, line, anchor.segment, true);
            if (keepUpright) {
                labelMinScale = Math.min(labelMinScale, getSegmentGlyphs(glyphInstances, anchor, centerX, line, anchor.segment, false));
            }
        } else {
            glyphInstances = [{
                    anchorPoint: new Point(anchor.x, anchor.y),
                    offset: 0,
                    angle: 0,
                    maxScale: Infinity,
                    minScale: minScale
                }];
        }
        var x1 = positionedGlyph.x + glyph.left;
        var y1 = positionedGlyph.y - glyph.top;
        var x2 = x1 + rect.w;
        var y2 = y1 + rect.h;
        var center = new Point(positionedGlyph.x, glyph.advance / 2);
        var otl = new Point(x1, y1);
        var otr = new Point(x2, y1);
        var obl = new Point(x1, y2);
        var obr = new Point(x2, y2);
        if (positionedGlyph.angle !== 0) {
            otl._sub(center)._rotate(positionedGlyph.angle)._add(center);
            otr._sub(center)._rotate(positionedGlyph.angle)._add(center);
            obl._sub(center)._rotate(positionedGlyph.angle)._add(center);
            obr._sub(center)._rotate(positionedGlyph.angle)._add(center);
        }
        for (var i = 0; i < glyphInstances.length; i++) {
            var instance = glyphInstances[i];
            var tl = otl, tr = otr, bl = obl, br = obr;
            if (textRotate) {
                var sin = Math.sin(textRotate), cos = Math.cos(textRotate), matrix = [
                        cos,
                        -sin,
                        sin,
                        cos
                    ];
                tl = tl.matMult(matrix);
                tr = tr.matMult(matrix);
                bl = bl.matMult(matrix);
                br = br.matMult(matrix);
            }
            var glyphMinScale = Math.max(instance.minScale, labelMinScale);
            var anchorAngle = (anchor.angle + instance.offset + 2 * Math.PI) % (2 * Math.PI);
            var glyphAngle = (instance.angle + instance.offset + 2 * Math.PI) % (2 * Math.PI);
            quads.push(new SymbolQuad(instance.anchorPoint, tl, tr, bl, br, rect, anchorAngle, glyphAngle, glyphMinScale, instance.maxScale, shaping.writingMode));
        }
    }
    return quads;
}
function getSegmentGlyphs(glyphs, anchor, offset, line, segment, forward) {
    var upsideDown = !forward;
    if (offset < 0)
        forward = !forward;
    if (forward)
        segment++;
    var newAnchorPoint = new Point(anchor.x, anchor.y);
    var end = line[segment];
    var prevScale = Infinity;
    offset = Math.abs(offset);
    var placementScale = minScale;
    while (true) {
        var distance = newAnchorPoint.dist(end);
        var scale = offset / distance;
        var angle = Math.atan2(end.y - newAnchorPoint.y, end.x - newAnchorPoint.x);
        if (!forward)
            angle += Math.PI;
        glyphs.push({
            anchorPoint: newAnchorPoint,
            offset: upsideDown ? Math.PI : 0,
            minScale: scale,
            maxScale: prevScale,
            angle: (angle + 2 * Math.PI) % (2 * Math.PI)
        });
        if (scale <= placementScale)
            break;
        newAnchorPoint = end;
        while (newAnchorPoint.equals(end)) {
            segment += forward ? 1 : -1;
            end = line[segment];
            if (!end) {
                return scale;
            }
        }
        var unit = end.sub(newAnchorPoint)._unit();
        newAnchorPoint = newAnchorPoint.sub(unit._mult(distance));
        prevScale = scale;
    }
    return placementScale;
}
},{"point-geometry":204}],154:[function(require,module,exports){
'use strict';
var resolveTokens = require('../util/token');
module.exports = function resolveText(feature, layout) {
    var text = resolveTokens(feature.properties, layout['text-field']);
    if (!text) {
        return;
    }
    text = text.toString();
    var transform = layout['text-transform'];
    if (transform === 'uppercase') {
        text = text.toLocaleUpperCase();
    } else if (transform === 'lowercase') {
        text = text.toLocaleLowerCase();
    }
    return text;
};
},{"../util/token":196}],155:[function(require,module,exports){
'use strict';
var scriptDetection = require('../util/script_detection');
var verticalizePunctuation = require('../util/verticalize_punctuation');
var WritingMode = {
    horizontal: 1,
    vertical: 2
};
module.exports = {
    shapeText: shapeText,
    shapeIcon: shapeIcon,
    WritingMode: WritingMode
};
function PositionedGlyph(codePoint, x, y, glyph, angle) {
    this.codePoint = codePoint;
    this.x = x;
    this.y = y;
    this.glyph = glyph || null;
    this.angle = angle;
}
function Shaping(positionedGlyphs, text, top, bottom, left, right, writingMode) {
    this.positionedGlyphs = positionedGlyphs;
    this.text = text;
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
    this.writingMode = writingMode;
}
var newLine = 10;
function breakLines(text, lineBreakPoints) {
    var lines = [];
    var start = 0;
    for (var i = 0, list = lineBreakPoints; i < list.length; i += 1) {
        var lineBreak = list[i];
        lines.push(text.substring(start, lineBreak));
        start = lineBreak;
    }
    if (start < text.length) {
        lines.push(text.substring(start, text.length));
    }
    return lines;
}
function shapeText(text, glyphs, maxWidth, lineHeight, horizontalAlign, verticalAlign, justify, spacing, translate, verticalHeight, writingMode) {
    text = text.trim();
    if (writingMode === WritingMode.vertical)
        text = verticalizePunctuation(text);
    var positionedGlyphs = [];
    var shaping = new Shaping(positionedGlyphs, text, translate[1], translate[1], translate[0], translate[0], writingMode);
    var lines = writingMode === WritingMode.horizontal && maxWidth ? breakLines(text, determineLineBreaks(text, spacing, maxWidth, glyphs)) : [text];
    shapeLines(shaping, glyphs, lines, lineHeight, horizontalAlign, verticalAlign, justify, translate, writingMode, spacing, verticalHeight);
    if (!positionedGlyphs.length)
        return false;
    return shaping;
}
var whitespace = {
    9: true,
    10: true,
    11: true,
    12: true,
    13: true,
    32: true
};
var breakable = {
    32: true,
    38: true,
    40: true,
    41: true,
    43: true,
    45: true,
    47: true,
    173: true,
    183: true,
    8203: true,
    8208: true,
    8211: true,
    8231: true
};
breakable[newLine] = true;
function determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphs) {
    var totalWidth = 0;
    for (var index in logicalInput) {
        var glyph = glyphs[logicalInput.charCodeAt(index)];
        if (!glyph)
            continue;
        totalWidth += glyph.advance + spacing;
    }
    var lineCount = Math.max(1, Math.ceil(totalWidth / maxWidth));
    return totalWidth / lineCount;
}
function calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) {
    var raggedness = Math.pow(lineWidth - targetWidth, 2);
    if (isLastBreak) {
        if (lineWidth < targetWidth) {
            return raggedness / 2;
        } else {
            return raggedness * 2;
        }
    }
    return raggedness + Math.abs(penalty) * penalty;
}
function calculatePenalty(codePoint, nextCodePoint) {
    var penalty = 0;
    if (codePoint === 10) {
        penalty -= 10000;
    }
    if (codePoint === 40 || codePoint === 65288) {
        penalty += 50;
    }
    if (nextCodePoint === 41 || nextCodePoint === 65289) {
        penalty += 50;
    }
    return penalty;
}
function evaluateBreak(breakIndex, breakX, targetWidth, potentialBreaks, penalty, isLastBreak) {
    var bestPriorBreak = null;
    var bestBreakBadness = calculateBadness(breakX, targetWidth, penalty, isLastBreak);
    for (var i = 0, list = potentialBreaks; i < list.length; i += 1) {
        var potentialBreak = list[i];
        var lineWidth = breakX - potentialBreak.x;
        var breakBadness = calculateBadness(lineWidth, targetWidth, penalty, isLastBreak) + potentialBreak.badness;
        if (breakBadness <= bestBreakBadness) {
            bestPriorBreak = potentialBreak;
            bestBreakBadness = breakBadness;
        }
    }
    return {
        index: breakIndex,
        x: breakX,
        priorBreak: bestPriorBreak,
        badness: bestBreakBadness
    };
}
function leastBadBreaks(lastLineBreak) {
    if (!lastLineBreak) {
        return [];
    }
    return leastBadBreaks(lastLineBreak.priorBreak).concat(lastLineBreak.index);
}
function determineLineBreaks(logicalInput, spacing, maxWidth, glyphs) {
    if (!maxWidth)
        return [];
    if (!logicalInput)
        return [];
    var potentialLineBreaks = [];
    var targetWidth = determineAverageLineWidth(logicalInput, spacing, maxWidth, glyphs);
    var currentX = 0;
    for (var i = 0; i < logicalInput.length; i++) {
        var codePoint = logicalInput.charCodeAt(i);
        var glyph = glyphs[codePoint];
        if (glyph && !whitespace[codePoint])
            currentX += glyph.advance + spacing;
        if (i < logicalInput.length - 1 && (breakable[codePoint] || scriptDetection.charAllowsIdeographicBreaking(codePoint))) {
            potentialLineBreaks.push(evaluateBreak(i + 1, currentX, targetWidth, potentialLineBreaks, calculatePenalty(codePoint, logicalInput.charCodeAt(i + 1)), false));
        }
    }
    return leastBadBreaks(evaluateBreak(logicalInput.length, currentX, targetWidth, potentialLineBreaks, 0, true));
}
function shapeLines(shaping, glyphs, lines, lineHeight, horizontalAlign, verticalAlign, justify, translate, writingMode, spacing, verticalHeight) {
    var yOffset = -17;
    var x = 0;
    var y = yOffset;
    var maxLineLength = 0;
    var positionedGlyphs = shaping.positionedGlyphs;
    for (var i in lines) {
        var line = lines[i].trim();
        if (!line.length) {
            y += lineHeight;
            continue;
        }
        var lineStartIndex = positionedGlyphs.length;
        for (var i$1 = 0; i$1 < line.length; i$1++) {
            var codePoint = line.charCodeAt(i$1);
            var glyph = glyphs[codePoint];
            if (!glyph)
                continue;
            if (!scriptDetection.charHasUprightVerticalOrientation(codePoint) || writingMode === WritingMode.horizontal) {
                positionedGlyphs.push(new PositionedGlyph(codePoint, x, y, glyph, 0));
                x += glyph.advance + spacing;
            } else {
                positionedGlyphs.push(new PositionedGlyph(codePoint, x, 0, glyph, -Math.PI / 2));
                x += verticalHeight + spacing;
            }
        }
        if (positionedGlyphs.length !== lineStartIndex) {
            var lineLength = x - spacing;
            maxLineLength = Math.max(lineLength, maxLineLength);
            justifyLine(positionedGlyphs, glyphs, lineStartIndex, positionedGlyphs.length - 1, justify);
        }
        x = 0;
        y += lineHeight;
    }
    align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lines.length, translate);
    var height = lines.length * lineHeight;
    shaping.top += -verticalAlign * height;
    shaping.bottom = shaping.top + height;
    shaping.left += -horizontalAlign * maxLineLength;
    shaping.right = shaping.left + maxLineLength;
}
function justifyLine(positionedGlyphs, glyphs, start, end, justify) {
    if (!justify)
        return;
    var lastAdvance = glyphs[positionedGlyphs[end].codePoint].advance;
    var lineIndent = (positionedGlyphs[end].x + lastAdvance) * justify;
    for (var j = start; j <= end; j++) {
        positionedGlyphs[j].x -= lineIndent;
    }
}
function align(positionedGlyphs, justify, horizontalAlign, verticalAlign, maxLineLength, lineHeight, lineCount, translate) {
    var shiftX = (justify - horizontalAlign) * maxLineLength + translate[0];
    var shiftY = (-verticalAlign * lineCount + 0.5) * lineHeight + translate[1];
    for (var j = 0; j < positionedGlyphs.length; j++) {
        positionedGlyphs[j].x += shiftX;
        positionedGlyphs[j].y += shiftY;
    }
}
function shapeIcon(image, iconOffset) {
    if (!image || !image.rect)
        return null;
    var dx = iconOffset[0];
    var dy = iconOffset[1];
    var x1 = dx - image.width / 2;
    var x2 = x1 + image.width;
    var y1 = dy - image.height / 2;
    var y2 = y1 + image.height;
    return new PositionedIcon(image, y1, y2, x1, x2);
}
function PositionedIcon(image, top, bottom, left, right) {
    this.image = image;
    this.top = top;
    this.bottom = bottom;
    this.left = left;
    this.right = right;
}
},{"../util/script_detection":194,"../util/verticalize_punctuation":199}],156:[function(require,module,exports){
'use strict';
var ShelfPack = require('shelf-pack');
var browser = require('../util/browser');
var util = require('../util/util');
var AtlasImage = function AtlasImage(rect, width, height, sdf, pixelRatio) {
    this.rect = rect;
    this.width = width;
    this.height = height;
    this.sdf = sdf;
    this.pixelRatio = pixelRatio;
};
var SpriteAtlas = function SpriteAtlas(width, height) {
    this.width = width;
    this.height = height;
    this.bin = new ShelfPack(width, height);
    this.images = {};
    this.data = false;
    this.texture = 0;
    this.filter = 0;
    this.pixelRatio = 1;
    this.dirty = true;
};
SpriteAtlas.prototype.allocateImage = function allocateImage(pixelWidth, pixelHeight) {
    pixelWidth = pixelWidth / this.pixelRatio;
    pixelHeight = pixelHeight / this.pixelRatio;
    var padding = 2;
    var packWidth = pixelWidth + padding + (4 - (pixelWidth + padding) % 4);
    var packHeight = pixelHeight + padding + (4 - (pixelHeight + padding) % 4);
    var rect = this.bin.packOne(packWidth, packHeight);
    if (!rect) {
        util.warnOnce('SpriteAtlas out of space.');
        return null;
    }
    return rect;
};
SpriteAtlas.prototype.getImage = function getImage(name, wrap) {
    if (this.images[name]) {
        return this.images[name];
    }
    if (!this.sprite) {
        return null;
    }
    var pos = this.sprite.getSpritePosition(name);
    if (!pos.width || !pos.height) {
        return null;
    }
    var rect = this.allocateImage(pos.width, pos.height);
    if (!rect) {
        return null;
    }
    var image = new AtlasImage(rect, pos.width / pos.pixelRatio, pos.height / pos.pixelRatio, pos.sdf, pos.pixelRatio / this.pixelRatio);
    this.images[name] = image;
    this.copy(rect, pos, wrap);
    return image;
};
SpriteAtlas.prototype.getPosition = function getPosition(name, repeating) {
    var image = this.getImage(name, repeating);
    var rect = image && image.rect;
    if (!rect) {
        return null;
    }
    var width = image.width * image.pixelRatio;
    var height = image.height * image.pixelRatio;
    var padding = 1;
    return {
        size: [
            image.width,
            image.height
        ],
        tl: [
            (rect.x + padding) / this.width,
            (rect.y + padding) / this.height
        ],
        br: [
            (rect.x + padding + width) / this.width,
            (rect.y + padding + height) / this.height
        ]
    };
};
SpriteAtlas.prototype.allocate = function allocate() {
    var this$1 = this;
    if (!this.data) {
        var w = Math.floor(this.width * this.pixelRatio);
        var h = Math.floor(this.height * this.pixelRatio);
        this.data = new Uint32Array(w * h);
        for (var i = 0; i < this.data.length; i++) {
            this$1.data[i] = 0;
        }
    }
};
SpriteAtlas.prototype.copy = function copy(dst, src, wrap) {
    if (!this.sprite.imgData)
        return;
    var srcImg = new Uint32Array(this.sprite.imgData.buffer);
    this.allocate();
    var dstImg = this.data;
    var padding = 1;
    copyBitmap(srcImg, this.sprite.width, src.x, src.y, dstImg, this.width * this.pixelRatio, (dst.x + padding) * this.pixelRatio, (dst.y + padding) * this.pixelRatio, src.width, src.height, wrap);
    this.dirty = true;
};
SpriteAtlas.prototype.setSprite = function setSprite(sprite) {
    if (sprite) {
        this.pixelRatio = browser.devicePixelRatio > 1 ? 2 : 1;
        if (this.canvas) {
            this.canvas.width = this.width * this.pixelRatio;
            this.canvas.height = this.height * this.pixelRatio;
        }
    }
    this.sprite = sprite;
};
SpriteAtlas.prototype.addIcons = function addIcons(icons, callback) {
    var this$1 = this;
    for (var i = 0; i < icons.length; i++) {
        this$1.getImage(icons[i]);
    }
    callback(null, this.images);
};
SpriteAtlas.prototype.bind = function bind(gl, linear) {
    var first = false;
    if (!this.texture) {
        this.texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        first = true;
    } else {
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
    }
    var filterVal = linear ? gl.LINEAR : gl.NEAREST;
    if (filterVal !== this.filter) {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filterVal);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filterVal);
        this.filter = filterVal;
    }
    if (this.dirty) {
        this.allocate();
        if (first) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, this.width * this.pixelRatio, this.height * this.pixelRatio, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.data.buffer));
        } else {
            gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, this.width * this.pixelRatio, this.height * this.pixelRatio, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(this.data.buffer));
        }
        this.dirty = false;
    }
};
module.exports = SpriteAtlas;
function copyBitmap(src, srcStride, srcX, srcY, dst, dstStride, dstX, dstY, width, height, wrap) {
    var srcI = srcY * srcStride + srcX;
    var dstI = dstY * dstStride + dstX;
    var x, y;
    if (wrap) {
        dstI -= dstStride;
        for (y = -1; y <= height; y++, srcI = ((y + height) % height + srcY) * srcStride + srcX, dstI += dstStride) {
            for (x = -1; x <= width; x++) {
                dst[dstI + x] = src[srcI + (x + width) % width];
            }
        }
    } else {
        for (y = 0; y < height; y++, srcI += srcStride, dstI += dstStride) {
            for (x = 0; x < width; x++) {
                dst[dstI + x] = src[srcI + x];
            }
        }
    }
}
},{"../util/browser":178,"../util/util":197,"shelf-pack":206}],157:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
var Point = require('point-geometry');
var SymbolInstancesArray = createStructArrayType({
    members: [
        {
            type: 'Uint16',
            name: 'textBoxStartIndex'
        },
        {
            type: 'Uint16',
            name: 'textBoxEndIndex'
        },
        {
            type: 'Uint16',
            name: 'iconBoxStartIndex'
        },
        {
            type: 'Uint16',
            name: 'iconBoxEndIndex'
        },
        {
            type: 'Uint16',
            name: 'glyphQuadStartIndex'
        },
        {
            type: 'Uint16',
            name: 'glyphQuadEndIndex'
        },
        {
            type: 'Uint16',
            name: 'iconQuadStartIndex'
        },
        {
            type: 'Uint16',
            name: 'iconQuadEndIndex'
        },
        {
            type: 'Int16',
            name: 'anchorPointX'
        },
        {
            type: 'Int16',
            name: 'anchorPointY'
        },
        {
            type: 'Int8',
            name: 'index'
        },
        {
            type: 'Uint8',
            name: 'writingModes'
        }
    ]
});
Object.defineProperty(SymbolInstancesArray.prototype.StructType.prototype, 'anchorPoint', {
    get: function get() {
        return new Point(this.anchorPointX, this.anchorPointY);
    }
});
module.exports = SymbolInstancesArray;
},{"../util/struct_array":195,"point-geometry":204}],158:[function(require,module,exports){
'use strict';
var createStructArrayType = require('../util/struct_array');
var Point = require('point-geometry');
var SymbolQuad = require('./quads').SymbolQuad;
var SymbolQuadsArray = createStructArrayType({
    members: [
        {
            type: 'Int16',
            name: 'anchorPointX'
        },
        {
            type: 'Int16',
            name: 'anchorPointY'
        },
        {
            type: 'Float32',
            name: 'tlX'
        },
        {
            type: 'Float32',
            name: 'tlY'
        },
        {
            type: 'Float32',
            name: 'trX'
        },
        {
            type: 'Float32',
            name: 'trY'
        },
        {
            type: 'Float32',
            name: 'blX'
        },
        {
            type: 'Float32',
            name: 'blY'
        },
        {
            type: 'Float32',
            name: 'brX'
        },
        {
            type: 'Float32',
            name: 'brY'
        },
        {
            type: 'Int16',
            name: 'texH'
        },
        {
            type: 'Int16',
            name: 'texW'
        },
        {
            type: 'Int16',
            name: 'texX'
        },
        {
            type: 'Int16',
            name: 'texY'
        },
        {
            type: 'Float32',
            name: 'anchorAngle'
        },
        {
            type: 'Float32',
            name: 'glyphAngle'
        },
        {
            type: 'Float32',
            name: 'maxScale'
        },
        {
            type: 'Float32',
            name: 'minScale'
        },
        {
            type: 'Uint8',
            name: 'writingMode'
        }
    ]
});
Object.defineProperty(SymbolQuadsArray.prototype.StructType.prototype, 'anchorPoint', {
    get: function get() {
        return new Point(this.anchorPointX, this.anchorPointY);
    }
});
Object.defineProperty(SymbolQuadsArray.prototype.StructType.prototype, 'SymbolQuad', {
    get: function get$1() {
        return new SymbolQuad(this.anchorPoint, new Point(this.tlX, this.tlY), new Point(this.trX, this.trY), new Point(this.blX, this.blY), new Point(this.brX, this.brY), {
            x: this.texX,
            y: this.texY,
            h: this.texH,
            w: this.texW,
            height: this.texH,
            width: this.texW
        }, this.anchorAngle, this.glyphAngle, this.minScale, this.maxScale, this.writingMode);
    }
});
module.exports = SymbolQuadsArray;
},{"../util/struct_array":195,"./quads":153,"point-geometry":204}],159:[function(require,module,exports){
'use strict';
var DOM = require('../util/dom');
var Point = require('point-geometry');
var handlers = {
    scrollZoom: require('./handler/scroll_zoom'),
    boxZoom: require('./handler/box_zoom'),
    dragRotate: require('./handler/drag_rotate'),
    dragPan: require('./handler/drag_pan'),
    keyboard: require('./handler/keyboard'),
    doubleClickZoom: require('./handler/dblclick_zoom'),
    touchZoomRotate: require('./handler/touch_zoom_rotate')
};
module.exports = function bindHandlers(map, options) {
    var el = map.getCanvasContainer();
    var contextMenuEvent = null;
    var mouseDown = false;
    var startPos = null;
    var tapped = null;
    for (var name in handlers) {
        map[name] = new handlers[name](map, options);
        if (options.interactive && options[name]) {
            map[name].enable();
        }
    }
    el.addEventListener('mouseout', onMouseOut, false);
    el.addEventListener('mousedown', onMouseDown, false);
    el.addEventListener('mouseup', onMouseUp, false);
    el.addEventListener('mousemove', onMouseMove, false);
    el.addEventListener('touchstart', onTouchStart, false);
    el.addEventListener('touchend', onTouchEnd, false);
    el.addEventListener('touchmove', onTouchMove, false);
    el.addEventListener('touchcancel', onTouchCancel, false);
    el.addEventListener('click', onClick, false);
    el.addEventListener('dblclick', onDblClick, false);
    el.addEventListener('contextmenu', onContextMenu, false);
    function onMouseOut(e) {
        fireMouseEvent('mouseout', e);
    }
    function onMouseDown(e) {
        map.stop();
        startPos = DOM.mousePos(el, e);
        fireMouseEvent('mousedown', e);
        mouseDown = true;
    }
    function onMouseUp(e) {
        var rotating = map.dragRotate && map.dragRotate.isActive();
        if (contextMenuEvent && !rotating) {
            fireMouseEvent('contextmenu', contextMenuEvent);
        }
        contextMenuEvent = null;
        mouseDown = false;
        fireMouseEvent('mouseup', e);
    }
    function onMouseMove(e) {
        if (map.dragPan && map.dragPan.isActive())
            return;
        if (map.dragRotate && map.dragRotate.isActive())
            return;
        var target = e.toElement || e.target;
        while (target && target !== el)
            target = target.parentNode;
        if (target !== el)
            return;
        fireMouseEvent('mousemove', e);
    }
    function onTouchStart(e) {
        map.stop();
        fireTouchEvent('touchstart', e);
        if (!e.touches || e.touches.length > 1)
            return;
        if (!tapped) {
            tapped = setTimeout(onTouchTimeout, 300);
        } else {
            clearTimeout(tapped);
            tapped = null;
            fireMouseEvent('dblclick', e);
        }
    }
    function onTouchMove(e) {
        fireTouchEvent('touchmove', e);
    }
    function onTouchEnd(e) {
        fireTouchEvent('touchend', e);
    }
    function onTouchCancel(e) {
        fireTouchEvent('touchcancel', e);
    }
    function onTouchTimeout() {
        tapped = null;
    }
    function onClick(e) {
        var pos = DOM.mousePos(el, e);
        if (pos.equals(startPos)) {
            fireMouseEvent('click', e);
        }
    }
    function onDblClick(e) {
        fireMouseEvent('dblclick', e);
        e.preventDefault();
    }
    function onContextMenu(e) {
        var rotating = map.dragRotate && map.dragRotate.isActive();
        if (!mouseDown && !rotating) {
            fireMouseEvent('contextmenu', e);
        } else if (mouseDown) {
            contextMenuEvent = e;
        }
        e.preventDefault();
    }
    function fireMouseEvent(type, e) {
        var pos = DOM.mousePos(el, e);
        return map.fire(type, {
            lngLat: map.unproject(pos),
            point: pos,
            originalEvent: e
        });
    }
    function fireTouchEvent(type, e) {
        var touches = DOM.touchPos(el, e);
        var singular = touches.reduce(function (prev, curr, i, arr) {
            return prev.add(curr.div(arr.length));
        }, new Point(0, 0));
        return map.fire(type, {
            lngLat: map.unproject(singular),
            point: singular,
            lngLats: touches.map(function (t) {
                return map.unproject(t);
            }, this),
            points: touches,
            originalEvent: e
        });
    }
};
},{"../util/dom":185,"./handler/box_zoom":165,"./handler/dblclick_zoom":166,"./handler/drag_pan":167,"./handler/drag_rotate":168,"./handler/keyboard":169,"./handler/scroll_zoom":170,"./handler/touch_zoom_rotate":171,"point-geometry":204}],160:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var interpolate = require('../util/interpolate');
var browser = require('../util/browser');
var LngLat = require('../geo/lng_lat');
var LngLatBounds = require('../geo/lng_lat_bounds');
var Point = require('point-geometry');
var Evented = require('../util/evented');
var Camera = function (Evented) {
    function Camera(transform, options) {
        Evented.call(this);
        this.transform = transform;
        this._bearingSnap = options.bearingSnap;
    }
    if (Evented)
        Camera.__proto__ = Evented;
    Camera.prototype = Object.create(Evented && Evented.prototype);
    Camera.prototype.constructor = Camera;
    Camera.prototype.getCenter = function getCenter() {
        return this.transform.center;
    };
    Camera.prototype.setCenter = function setCenter(center, eventData) {
        this.jumpTo({ center: center }, eventData);
        return this;
    };
    Camera.prototype.panBy = function panBy(offset, options, eventData) {
        this.panTo(this.transform.center, util.extend({ offset: Point.convert(offset).mult(-1) }, options), eventData);
        return this;
    };
    Camera.prototype.panTo = function panTo(lnglat, options, eventData) {
        return this.easeTo(util.extend({ center: lnglat }, options), eventData);
    };
    Camera.prototype.getZoom = function getZoom() {
        return this.transform.zoom;
    };
    Camera.prototype.setZoom = function setZoom(zoom, eventData) {
        this.jumpTo({ zoom: zoom }, eventData);
        return this;
    };
    Camera.prototype.zoomTo = function zoomTo(zoom, options, eventData) {
        return this.easeTo(util.extend({ zoom: zoom }, options), eventData);
    };
    Camera.prototype.zoomIn = function zoomIn(options, eventData) {
        this.zoomTo(this.getZoom() + 1, options, eventData);
        return this;
    };
    Camera.prototype.zoomOut = function zoomOut(options, eventData) {
        this.zoomTo(this.getZoom() - 1, options, eventData);
        return this;
    };
    Camera.prototype.getBearing = function getBearing() {
        return this.transform.bearing;
    };
    Camera.prototype.setBearing = function setBearing(bearing, eventData) {
        this.jumpTo({ bearing: bearing }, eventData);
        return this;
    };
    Camera.prototype.rotateTo = function rotateTo(bearing, options, eventData) {
        return this.easeTo(util.extend({ bearing: bearing }, options), eventData);
    };
    Camera.prototype.resetNorth = function resetNorth(options, eventData) {
        this.rotateTo(0, util.extend({ duration: 1000 }, options), eventData);
        return this;
    };
    Camera.prototype.snapToNorth = function snapToNorth(options, eventData) {
        if (Math.abs(this.getBearing()) < this._bearingSnap) {
            return this.resetNorth(options, eventData);
        }
        return this;
    };
    Camera.prototype.getPitch = function getPitch() {
        return this.transform.pitch;
    };
    Camera.prototype.setPitch = function setPitch(pitch, eventData) {
        this.jumpTo({ pitch: pitch }, eventData);
        return this;
    };
    Camera.prototype.fitBounds = function fitBounds(bounds, options, eventData) {
        options = util.extend({
            padding: 0,
            offset: [
                0,
                0
            ],
            maxZoom: this.getMaxZoom()
        }, options);
        bounds = LngLatBounds.convert(bounds);
        var offset = Point.convert(options.offset), tr = this.transform, nw = tr.project(bounds.getNorthWest()), se = tr.project(bounds.getSouthEast()), size = se.sub(nw), scaleX = (tr.width - options.padding * 2 - Math.abs(offset.x) * 2) / size.x, scaleY = (tr.height - options.padding * 2 - Math.abs(offset.y) * 2) / size.y;
        options.center = tr.unproject(nw.add(se).div(2));
        options.zoom = Math.min(tr.scaleZoom(tr.scale * Math.min(scaleX, scaleY)), options.maxZoom);
        options.bearing = 0;
        return options.linear ? this.easeTo(options, eventData) : this.flyTo(options, eventData);
    };
    Camera.prototype.jumpTo = function jumpTo(options, eventData) {
        this.stop();
        var tr = this.transform;
        var zoomChanged = false, bearingChanged = false, pitchChanged = false;
        if ('zoom' in options && tr.zoom !== +options.zoom) {
            zoomChanged = true;
            tr.zoom = +options.zoom;
        }
        if ('center' in options) {
            tr.center = LngLat.convert(options.center);
        }
        if ('bearing' in options && tr.bearing !== +options.bearing) {
            bearingChanged = true;
            tr.bearing = +options.bearing;
        }
        if ('pitch' in options && tr.pitch !== +options.pitch) {
            pitchChanged = true;
            tr.pitch = +options.pitch;
        }
        this.fire('movestart', eventData).fire('move', eventData);
        if (zoomChanged) {
            this.fire('zoomstart', eventData).fire('zoom', eventData).fire('zoomend', eventData);
        }
        if (bearingChanged) {
            this.fire('rotate', eventData);
        }
        if (pitchChanged) {
            this.fire('pitch', eventData);
        }
        return this.fire('moveend', eventData);
    };
    Camera.prototype.easeTo = function easeTo(options, eventData) {
        var this$1 = this;
        this.stop();
        options = util.extend({
            offset: [
                0,
                0
            ],
            duration: 500,
            easing: util.ease
        }, options);
        var tr = this.transform, offset = Point.convert(options.offset), startZoom = this.getZoom(), startBearing = this.getBearing(), startPitch = this.getPitch(), zoom = 'zoom' in options ? +options.zoom : startZoom, bearing = 'bearing' in options ? this._normalizeBearing(options.bearing, startBearing) : startBearing, pitch = 'pitch' in options ? +options.pitch : startPitch;
        var toLngLat, toPoint;
        if ('center' in options) {
            toLngLat = LngLat.convert(options.center);
            toPoint = tr.centerPoint.add(offset);
        } else if ('around' in options) {
            toLngLat = LngLat.convert(options.around);
            toPoint = tr.locationPoint(toLngLat);
        } else {
            toPoint = tr.centerPoint.add(offset);
            toLngLat = tr.pointLocation(toPoint);
        }
        var fromPoint = tr.locationPoint(toLngLat);
        if (options.animate === false)
            options.duration = 0;
        this.zooming = zoom !== startZoom;
        this.rotating = startBearing !== bearing;
        this.pitching = pitch !== startPitch;
        if (options.smoothEasing && options.duration !== 0) {
            options.easing = this._smoothOutEasing(options.duration);
        }
        if (!options.noMoveStart) {
            this.fire('movestart', eventData);
        }
        if (this.zooming) {
            this.fire('zoomstart', eventData);
        }
        clearTimeout(this._onEaseEnd);
        this._ease(function (k) {
            if (this.zooming) {
                tr.zoom = interpolate(startZoom, zoom, k);
            }
            if (this.rotating) {
                tr.bearing = interpolate(startBearing, bearing, k);
            }
            if (this.pitching) {
                tr.pitch = interpolate(startPitch, pitch, k);
            }
            tr.setLocationAtPoint(toLngLat, fromPoint.add(toPoint.sub(fromPoint)._mult(k)));
            this.fire('move', eventData);
            if (this.zooming) {
                this.fire('zoom', eventData);
            }
            if (this.rotating) {
                this.fire('rotate', eventData);
            }
            if (this.pitching) {
                this.fire('pitch', eventData);
            }
        }, function () {
            if (options.delayEndEvents) {
                this$1._onEaseEnd = setTimeout(this$1._easeToEnd.bind(this$1, eventData), options.delayEndEvents);
            } else {
                this$1._easeToEnd(eventData);
            }
        }, options);
        return this;
    };
    Camera.prototype._easeToEnd = function _easeToEnd(eventData) {
        var wasZooming = this.zooming;
        this.zooming = false;
        this.rotating = false;
        this.pitching = false;
        if (wasZooming) {
            this.fire('zoomend', eventData);
        }
        this.fire('moveend', eventData);
    };
    Camera.prototype.flyTo = function flyTo(options, eventData) {
        this.stop();
        options = util.extend({
            offset: [
                0,
                0
            ],
            speed: 1.2,
            curve: 1.42,
            easing: util.ease
        }, options);
        var tr = this.transform, offset = Point.convert(options.offset), startZoom = this.getZoom(), startBearing = this.getBearing(), startPitch = this.getPitch();
        var center = 'center' in options ? LngLat.convert(options.center) : this.getCenter();
        var zoom = 'zoom' in options ? +options.zoom : startZoom;
        var bearing = 'bearing' in options ? this._normalizeBearing(options.bearing, startBearing) : startBearing;
        var pitch = 'pitch' in options ? +options.pitch : startPitch;
        if (Math.abs(tr.center.lng) + Math.abs(center.lng) > 180) {
            if (tr.center.lng > 0 && center.lng < 0) {
                center.lng += 360;
            } else if (tr.center.lng < 0 && center.lng > 0) {
                center.lng -= 360;
            }
        }
        var scale = tr.zoomScale(zoom - startZoom), from = tr.point, to = 'center' in options ? tr.project(center).sub(offset.div(scale)) : from;
        var rho = options.curve;
        var w0 = Math.max(tr.width, tr.height), w1 = w0 / scale, u1 = to.sub(from).mag();
        if ('minZoom' in options) {
            var minZoom = util.clamp(Math.min(options.minZoom, startZoom, zoom), tr.minZoom, tr.maxZoom);
            var wMax = w0 / tr.zoomScale(minZoom - startZoom);
            rho = Math.sqrt(wMax / u1 * 2);
        }
        var rho2 = rho * rho;
        function r(i) {
            var b = (w1 * w1 - w0 * w0 + (i ? -1 : 1) * rho2 * rho2 * u1 * u1) / (2 * (i ? w1 : w0) * rho2 * u1);
            return Math.log(Math.sqrt(b * b + 1) - b);
        }
        function sinh(n) {
            return (Math.exp(n) - Math.exp(-n)) / 2;
        }
        function cosh(n) {
            return (Math.exp(n) + Math.exp(-n)) / 2;
        }
        function tanh(n) {
            return sinh(n) / cosh(n);
        }
        var r0 = r(0);
        var w = function (s) {
                return cosh(r0) / cosh(r0 + rho * s);
            }, u = function (s) {
                return w0 * ((cosh(r0) * tanh(r0 + rho * s) - sinh(r0)) / rho2) / u1;
            }, S = (r(1) - r0) / rho;
        if (Math.abs(u1) < 0.000001) {
            if (Math.abs(w0 - w1) < 0.000001)
                return this.easeTo(options);
            var k = w1 < w0 ? -1 : 1;
            S = Math.abs(Math.log(w1 / w0)) / rho;
            u = function () {
                return 0;
            };
            w = function (s) {
                return Math.exp(k * rho * s);
            };
        }
        if ('duration' in options) {
            options.duration = +options.duration;
        } else {
            var V = 'screenSpeed' in options ? +options.screenSpeed / rho : +options.speed;
            options.duration = 1000 * S / V;
        }
        this.zooming = true;
        if (startBearing !== bearing)
            this.rotating = true;
        if (startPitch !== pitch)
            this.pitching = true;
        this.fire('movestart', eventData);
        this.fire('zoomstart', eventData);
        this._ease(function (k) {
            var s = k * S, us = u(s);
            var scale = 1 / w(s);
            tr.zoom = startZoom + tr.scaleZoom(scale);
            tr.center = tr.unproject(from.add(to.sub(from).mult(us)).mult(scale));
            if (this.rotating) {
                tr.bearing = interpolate(startBearing, bearing, k);
            }
            if (this.pitching) {
                tr.pitch = interpolate(startPitch, pitch, k);
            }
            this.fire('move', eventData);
            this.fire('zoom', eventData);
            if (this.rotating) {
                this.fire('rotate', eventData);
            }
            if (this.pitching) {
                this.fire('pitch', eventData);
            }
        }, function () {
            this.zooming = false;
            this.rotating = false;
            this.pitching = false;
            this.fire('zoomend', eventData);
            this.fire('moveend', eventData);
        }, options);
        return this;
    };
    Camera.prototype.isEasing = function isEasing() {
        return !!this._abortFn;
    };
    Camera.prototype.stop = function stop() {
        if (this._abortFn) {
            this._abortFn();
            this._finishEase();
        }
        return this;
    };
    Camera.prototype._ease = function _ease(frame, finish, options) {
        this._finishFn = finish;
        this._abortFn = browser.timed(function (t) {
            frame.call(this, options.easing(t));
            if (t === 1) {
                this._finishEase();
            }
        }, options.animate === false ? 0 : options.duration, this);
    };
    Camera.prototype._finishEase = function _finishEase() {
        delete this._abortFn;
        var finish = this._finishFn;
        delete this._finishFn;
        finish.call(this);
    };
    Camera.prototype._normalizeBearing = function _normalizeBearing(bearing, currentBearing) {
        bearing = util.wrap(bearing, -180, 180);
        var diff = Math.abs(bearing - currentBearing);
        if (Math.abs(bearing - 360 - currentBearing) < diff)
            bearing -= 360;
        if (Math.abs(bearing + 360 - currentBearing) < diff)
            bearing += 360;
        return bearing;
    };
    Camera.prototype._smoothOutEasing = function _smoothOutEasing(duration) {
        var easing = util.ease;
        if (this._prevEase) {
            var ease = this._prevEase, t = (Date.now() - ease.start) / ease.duration, speed = ease.easing(t + 0.01) - ease.easing(t), x = 0.27 / Math.sqrt(speed * speed + 0.0001) * 0.01, y = Math.sqrt(0.27 * 0.27 - x * x);
            easing = util.bezier(x, y, 0.25, 1);
        }
        this._prevEase = {
            start: new Date().getTime(),
            duration: duration,
            easing: easing
        };
        return easing;
    };
    return Camera;
}(Evented);
module.exports = Camera;
},{"../geo/lng_lat":89,"../geo/lng_lat_bounds":90,"../util/browser":178,"../util/evented":186,"../util/interpolate":189,"../util/util":197,"point-geometry":204}],161:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var AttributionControl = function AttributionControl(options) {
    this.options = options;
    util.bindAll([
        '_updateEditLink',
        '_updateData',
        '_updateCompact'
    ], this);
};
AttributionControl.prototype.getDefaultPosition = function getDefaultPosition() {
    return 'bottom-right';
};
AttributionControl.prototype.onAdd = function onAdd(map) {
    var compact = this.options && this.options.compact;
    this._map = map;
    this._container = DOM.create('div', 'mapboxgl-ctrl mapboxgl-ctrl-attrib');
    if (compact) {
        this._container.classList.add('compact');
    }
    this._updateAttributions();
    this._updateEditLink();
    this._map.on('data', this._updateData);
    this._map.on('moveend', this._updateEditLink);
    if (compact === undefined) {
        this._map.on('resize', this._updateCompact);
        this._updateCompact();
    }
    return this._container;
};
AttributionControl.prototype.onRemove = function onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map.off('data', this._updateData);
    this._map.off('moveend', this._updateEditLink);
    this._map.off('resize', this._updateCompact);
    this._map = undefined;
};
AttributionControl.prototype._updateEditLink = function _updateEditLink() {
    if (!this._editLink)
        this._editLink = this._container.querySelector('.mapbox-improve-map');
    if (this._editLink) {
        var center = this._map.getCenter();
        this._editLink.href = 'https://www.mapbox.com/map-feedback/#/' + center.lng + '/' + center.lat + '/' + Math.round(this._map.getZoom() + 1);
    }
};
AttributionControl.prototype._updateData = function _updateData(event) {
    if (event.dataType === 'source') {
        this._updateAttributions();
        this._updateEditLink();
    }
};
AttributionControl.prototype._updateAttributions = function _updateAttributions() {
    if (!this._map.style)
        return;
    var attributions = [];
    var sourceCaches = this._map.style.sourceCaches;
    for (var id in sourceCaches) {
        var source = sourceCaches[id].getSource();
        if (source.attribution && attributions.indexOf(source.attribution) < 0) {
            attributions.push(source.attribution);
        }
    }
    attributions.sort(function (a, b) {
        return a.length - b.length;
    });
    attributions = attributions.filter(function (attrib, i) {
        for (var j = i + 1; j < attributions.length; j++) {
            if (attributions[j].indexOf(attrib) >= 0) {
                return false;
            }
        }
        return true;
    });
    this._container.innerHTML = attributions.join(' | ');
    this._editLink = null;
};
AttributionControl.prototype._updateCompact = function _updateCompact() {
    var compact = this._map.getCanvasContainer().offsetWidth <= 640;
    this._container.classList[compact ? 'add' : 'remove']('compact');
};
module.exports = AttributionControl;
},{"../../util/dom":185,"../../util/util":197}],162:[function(require,module,exports){
'use strict';
var Evented = require('../../util/evented');
var DOM = require('../../util/dom');
var window = require('../../util/window');
var util = require('../../util/util');
var defaultGeoPositionOptions = {
    enableHighAccuracy: false,
    timeout: 6000
};
var className = 'mapboxgl-ctrl';
var supportsGeolocation;
function checkGeolocationSupport(callback) {
    if (supportsGeolocation !== undefined) {
        callback(supportsGeolocation);
    } else if (window.navigator.permissions !== undefined) {
        window.navigator.permissions.query({ name: 'geolocation' }).then(function (p) {
            supportsGeolocation = p.state !== 'denied';
            callback(supportsGeolocation);
        });
    } else {
        supportsGeolocation = !!window.navigator.geolocation;
        callback(supportsGeolocation);
    }
}
var GeolocateControl = function (Evented) {
    function GeolocateControl(options) {
        Evented.call(this);
        this.options = options || {};
        util.bindAll([
            '_onSuccess',
            '_onError',
            '_finish',
            '_setupUI'
        ], this);
    }
    if (Evented)
        GeolocateControl.__proto__ = Evented;
    GeolocateControl.prototype = Object.create(Evented && Evented.prototype);
    GeolocateControl.prototype.constructor = GeolocateControl;
    GeolocateControl.prototype.onAdd = function onAdd(map) {
        this._map = map;
        this._container = DOM.create('div', className + ' ' + className + '-group');
        checkGeolocationSupport(this._setupUI);
        return this._container;
    };
    GeolocateControl.prototype.onRemove = function onRemove() {
        this._container.parentNode.removeChild(this._container);
        this._map = undefined;
    };
    GeolocateControl.prototype._onSuccess = function _onSuccess(position) {
        this._map.jumpTo({
            center: [
                position.coords.longitude,
                position.coords.latitude
            ],
            zoom: 17,
            bearing: 0,
            pitch: 0
        });
        this.fire('geolocate', position);
        this._finish();
    };
    GeolocateControl.prototype._onError = function _onError(error) {
        this.fire('error', error);
        this._finish();
    };
    GeolocateControl.prototype._finish = function _finish() {
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this._timeoutId = undefined;
    };
    GeolocateControl.prototype._setupUI = function _setupUI(supported) {
        if (supported === false)
            return;
        this._container.addEventListener('contextmenu', function (e) {
            return e.preventDefault();
        });
        this._geolocateButton = DOM.create('button', className + '-icon ' + className + '-geolocate', this._container);
        this._geolocateButton.type = 'button';
        this._geolocateButton.setAttribute('aria-label', 'Geolocate');
        if (this.options.watchPosition)
            this._geolocateButton.setAttribute('aria-pressed', false);
        this._geolocateButton.addEventListener('click', this._onClickGeolocate.bind(this));
    };
    GeolocateControl.prototype._onClickGeolocate = function _onClickGeolocate() {
        var positionOptions = util.extend(defaultGeoPositionOptions, this.options && this.options.positionOptions || {});
        if (this.options.watchPosition) {
            if (this._geolocationWatchID !== undefined) {
                this._geolocateButton.classList.remove('watching');
                this._geolocateButton.setAttribute('aria-pressed', false);
                window.navigator.geolocation.clearWatch(this._geolocationWatchID);
                this._geolocationWatchID = undefined;
            } else {
                this._geolocateButton.classList.add('watching');
                this._geolocateButton.setAttribute('aria-pressed', true);
                this._geolocationWatchID = window.navigator.geolocation.watchPosition(this._onSuccess, this._onError, positionOptions);
            }
        } else {
            window.navigator.geolocation.getCurrentPosition(this._onSuccess, this._onError, positionOptions);
            this._timeoutId = setTimeout(this._finish, 10000);
        }
    };
    return GeolocateControl;
}(Evented);
module.exports = GeolocateControl;
},{"../../util/dom":185,"../../util/evented":186,"../../util/util":197,"../../util/window":180}],163:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var window = require('../../util/window');
var util = require('../../util/util');
var className = 'mapboxgl-ctrl';
var NavigationControl = function NavigationControl() {
    util.bindAll(['_rotateCompassArrow'], this);
};
NavigationControl.prototype._rotateCompassArrow = function _rotateCompassArrow() {
    var rotate = 'rotate(' + this._map.transform.angle * (180 / Math.PI) + 'deg)';
    this._compassArrow.style.transform = rotate;
};
NavigationControl.prototype.onAdd = function onAdd(map) {
    this._map = map;
    this._container = DOM.create('div', className + ' ' + className + '-group', map.getContainer());
    this._container.addEventListener('contextmenu', this._onContextMenu.bind(this));
    this._zoomInButton = this._createButton(className + '-icon ' + className + '-zoom-in', 'Zoom In', map.zoomIn.bind(map));
    this._zoomOutButton = this._createButton(className + '-icon ' + className + '-zoom-out', 'Zoom Out', map.zoomOut.bind(map));
    this._compass = this._createButton(className + '-icon ' + className + '-compass', 'Reset North', map.resetNorth.bind(map));
    this._compassArrow = DOM.create('span', 'arrow', this._compass);
    this._compass.addEventListener('mousedown', this._onCompassDown.bind(this));
    this._onCompassMove = this._onCompassMove.bind(this);
    this._onCompassUp = this._onCompassUp.bind(this);
    this._map.on('rotate', this._rotateCompassArrow);
    this._rotateCompassArrow();
    return this._container;
};
NavigationControl.prototype.onRemove = function onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map.off('rotate', this._rotateCompassArrow);
    this._map = undefined;
};
NavigationControl.prototype._onContextMenu = function _onContextMenu(e) {
    e.preventDefault();
};
NavigationControl.prototype._onCompassDown = function _onCompassDown(e) {
    if (e.button !== 0)
        return;
    DOM.disableDrag();
    window.document.addEventListener('mousemove', this._onCompassMove);
    window.document.addEventListener('mouseup', this._onCompassUp);
    this._map.getCanvasContainer().dispatchEvent(copyMouseEvent(e));
    e.stopPropagation();
};
NavigationControl.prototype._onCompassMove = function _onCompassMove(e) {
    if (e.button !== 0)
        return;
    this._map.getCanvasContainer().dispatchEvent(copyMouseEvent(e));
    e.stopPropagation();
};
NavigationControl.prototype._onCompassUp = function _onCompassUp(e) {
    if (e.button !== 0)
        return;
    window.document.removeEventListener('mousemove', this._onCompassMove);
    window.document.removeEventListener('mouseup', this._onCompassUp);
    DOM.enableDrag();
    this._map.getCanvasContainer().dispatchEvent(copyMouseEvent(e));
    e.stopPropagation();
};
NavigationControl.prototype._createButton = function _createButton(className, ariaLabel, fn) {
    var a = DOM.create('button', className, this._container);
    a.type = 'button';
    a.setAttribute('aria-label', ariaLabel);
    a.addEventListener('click', function () {
        fn();
    });
    return a;
};
module.exports = NavigationControl;
function copyMouseEvent(e) {
    return new window.MouseEvent(e.type, {
        button: 2,
        buttons: 2,
        bubbles: true,
        cancelable: true,
        detail: e.detail,
        view: e.view,
        screenX: e.screenX,
        screenY: e.screenY,
        clientX: e.clientX,
        clientY: e.clientY,
        movementX: e.movementX,
        movementY: e.movementY,
        ctrlKey: e.ctrlKey,
        shiftKey: e.shiftKey,
        altKey: e.altKey,
        metaKey: e.metaKey
    });
}
},{"../../util/dom":185,"../../util/util":197,"../../util/window":180}],164:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var ScaleControl = function ScaleControl(options) {
    this.options = options;
    util.bindAll(['_onMove'], this);
};
ScaleControl.prototype.getDefaultPosition = function getDefaultPosition() {
    return 'bottom-left';
};
ScaleControl.prototype._onMove = function _onMove() {
    updateScale(this._map, this._container, this.options);
};
ScaleControl.prototype.onAdd = function onAdd(map) {
    this._map = map;
    this._container = DOM.create('div', 'mapboxgl-ctrl mapboxgl-ctrl-scale', map.getContainer());
    this._map.on('move', this._onMove);
    this._onMove();
    return this._container;
};
ScaleControl.prototype.onRemove = function onRemove() {
    this._container.parentNode.removeChild(this._container);
    this._map.off('move', this._onMove);
    this._map = undefined;
};
module.exports = ScaleControl;
function updateScale(map, container, options) {
    var maxWidth = options && options.maxWidth || 100;
    var y = map._container.clientHeight / 2;
    var maxMeters = getDistance(map.unproject([
        0,
        y
    ]), map.unproject([
        maxWidth,
        y
    ]));
    if (options && options.unit === 'imperial') {
        var maxFeet = 3.2808 * maxMeters;
        if (maxFeet > 5280) {
            var maxMiles = maxFeet / 5280;
            setScale(container, maxWidth, maxMiles, 'mi');
        } else {
            setScale(container, maxWidth, maxFeet, 'ft');
        }
    } else {
        setScale(container, maxWidth, maxMeters, 'm');
    }
}
function setScale(container, maxWidth, maxDistance, unit) {
    var distance = getRoundNum(maxDistance);
    var ratio = distance / maxDistance;
    if (unit === 'm' && distance >= 1000) {
        distance = distance / 1000;
        unit = 'km';
    }
    container.style.width = maxWidth * ratio + 'px';
    container.innerHTML = distance + unit;
}
function getDistance(latlng1, latlng2) {
    var R = 6371000;
    var rad = Math.PI / 180, lat1 = latlng1.lat * rad, lat2 = latlng2.lat * rad, a = Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1) * Math.cos(lat2) * Math.cos((latlng2.lng - latlng1.lng) * rad);
    var maxMeters = R * Math.acos(Math.min(a, 1));
    return maxMeters;
}
function getRoundNum(num) {
    var pow10 = Math.pow(10, ('' + Math.floor(num)).length - 1);
    var d = num / pow10;
    d = d >= 10 ? 10 : d >= 5 ? 5 : d >= 3 ? 3 : d >= 2 ? 2 : 1;
    return pow10 * d;
}
},{"../../util/dom":185,"../../util/util":197}],165:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var LngLatBounds = require('../../geo/lng_lat_bounds');
var util = require('../../util/util');
var window = require('../../util/window');
var BoxZoomHandler = function BoxZoomHandler(map) {
    this._map = map;
    this._el = map.getCanvasContainer();
    this._container = map.getContainer();
    util.bindAll([
        '_onMouseDown',
        '_onMouseMove',
        '_onMouseUp',
        '_onKeyDown'
    ], this);
};
BoxZoomHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
BoxZoomHandler.prototype.isActive = function isActive() {
    return !!this._active;
};
BoxZoomHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('mousedown', this._onMouseDown, false);
    this._enabled = true;
};
BoxZoomHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('mousedown', this._onMouseDown);
    this._enabled = false;
};
BoxZoomHandler.prototype._onMouseDown = function _onMouseDown(e) {
    if (!(e.shiftKey && e.button === 0))
        return;
    window.document.addEventListener('mousemove', this._onMouseMove, false);
    window.document.addEventListener('keydown', this._onKeyDown, false);
    window.document.addEventListener('mouseup', this._onMouseUp, false);
    DOM.disableDrag();
    this._startPos = DOM.mousePos(this._el, e);
    this._active = true;
};
BoxZoomHandler.prototype._onMouseMove = function _onMouseMove(e) {
    var p0 = this._startPos, p1 = DOM.mousePos(this._el, e);
    if (!this._box) {
        this._box = DOM.create('div', 'mapboxgl-boxzoom', this._container);
        this._container.classList.add('mapboxgl-crosshair');
        this._fireEvent('boxzoomstart', e);
    }
    var minX = Math.min(p0.x, p1.x), maxX = Math.max(p0.x, p1.x), minY = Math.min(p0.y, p1.y), maxY = Math.max(p0.y, p1.y);
    DOM.setTransform(this._box, 'translate(' + minX + 'px,' + minY + 'px)');
    this._box.style.width = maxX - minX + 'px';
    this._box.style.height = maxY - minY + 'px';
};
BoxZoomHandler.prototype._onMouseUp = function _onMouseUp(e) {
    if (e.button !== 0)
        return;
    var p0 = this._startPos, p1 = DOM.mousePos(this._el, e), bounds = new LngLatBounds().extend(this._map.unproject(p0)).extend(this._map.unproject(p1));
    this._finish();
    if (p0.x === p1.x && p0.y === p1.y) {
        this._fireEvent('boxzoomcancel', e);
    } else {
        this._map.fitBounds(bounds, { linear: true }).fire('boxzoomend', {
            originalEvent: e,
            boxZoomBounds: bounds
        });
    }
};
BoxZoomHandler.prototype._onKeyDown = function _onKeyDown(e) {
    if (e.keyCode === 27) {
        this._finish();
        this._fireEvent('boxzoomcancel', e);
    }
};
BoxZoomHandler.prototype._finish = function _finish() {
    this._active = false;
    window.document.removeEventListener('mousemove', this._onMouseMove, false);
    window.document.removeEventListener('keydown', this._onKeyDown, false);
    window.document.removeEventListener('mouseup', this._onMouseUp, false);
    this._container.classList.remove('mapboxgl-crosshair');
    if (this._box) {
        this._box.parentNode.removeChild(this._box);
        this._box = null;
    }
    DOM.enableDrag();
};
BoxZoomHandler.prototype._fireEvent = function _fireEvent(type, e) {
    return this._map.fire(type, { originalEvent: e });
};
module.exports = BoxZoomHandler;
},{"../../geo/lng_lat_bounds":90,"../../util/dom":185,"../../util/util":197,"../../util/window":180}],166:[function(require,module,exports){
'use strict';
var DoubleClickZoomHandler = function DoubleClickZoomHandler(map) {
    this._map = map;
    this._onDblClick = this._onDblClick.bind(this);
};
DoubleClickZoomHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
DoubleClickZoomHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._map.on('dblclick', this._onDblClick);
    this._enabled = true;
};
DoubleClickZoomHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._map.off('dblclick', this._onDblClick);
    this._enabled = false;
};
DoubleClickZoomHandler.prototype._onDblClick = function _onDblClick(e) {
    this._map.zoomTo(this._map.getZoom() + (e.originalEvent.shiftKey ? -1 : 1), { around: e.lngLat }, e);
};
module.exports = DoubleClickZoomHandler;
},{}],167:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var window = require('../../util/window');
var inertiaLinearity = 0.3, inertiaEasing = util.bezier(0, 0, inertiaLinearity, 1), inertiaMaxSpeed = 1400, inertiaDeceleration = 2500;
var DragPanHandler = function DragPanHandler(map) {
    this._map = map;
    this._el = map.getCanvasContainer();
    util.bindAll([
        '_onDown',
        '_onMove',
        '_onUp',
        '_onTouchEnd',
        '_onMouseUp'
    ], this);
};
DragPanHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
DragPanHandler.prototype.isActive = function isActive() {
    return !!this._active;
};
DragPanHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('mousedown', this._onDown);
    this._el.addEventListener('touchstart', this._onDown);
    this._enabled = true;
};
DragPanHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('mousedown', this._onDown);
    this._el.removeEventListener('touchstart', this._onDown);
    this._enabled = false;
};
DragPanHandler.prototype._onDown = function _onDown(e) {
    if (this._ignoreEvent(e))
        return;
    if (this.isActive())
        return;
    if (e.touches) {
        window.document.addEventListener('touchmove', this._onMove);
        window.document.addEventListener('touchend', this._onTouchEnd);
    } else {
        window.document.addEventListener('mousemove', this._onMove);
        window.document.addEventListener('mouseup', this._onMouseUp);
    }
    this._active = false;
    this._startPos = this._pos = DOM.mousePos(this._el, e);
    this._inertia = [[
            Date.now(),
            this._pos
        ]];
};
DragPanHandler.prototype._onMove = function _onMove(e) {
    if (this._ignoreEvent(e))
        return;
    if (!this.isActive()) {
        this._active = true;
        this._fireEvent('dragstart', e);
        this._fireEvent('movestart', e);
    }
    var pos = DOM.mousePos(this._el, e), map = this._map;
    map.stop();
    this._drainInertiaBuffer();
    this._inertia.push([
        Date.now(),
        pos
    ]);
    map.transform.setLocationAtPoint(map.transform.pointLocation(this._pos), pos);
    this._fireEvent('drag', e);
    this._fireEvent('move', e);
    this._pos = pos;
    e.preventDefault();
};
DragPanHandler.prototype._onUp = function _onUp(e) {
    var this$1 = this;
    if (!this.isActive())
        return;
    this._active = false;
    this._fireEvent('dragend', e);
    this._drainInertiaBuffer();
    var finish = function () {
        return this$1._fireEvent('moveend', e);
    };
    var inertia = this._inertia;
    if (inertia.length < 2) {
        finish();
        return;
    }
    var last = inertia[inertia.length - 1], first = inertia[0], flingOffset = last[1].sub(first[1]), flingDuration = (last[0] - first[0]) / 1000;
    if (flingDuration === 0 || last[1].equals(first[1])) {
        finish();
        return;
    }
    var velocity = flingOffset.mult(inertiaLinearity / flingDuration);
    var speed = velocity.mag();
    if (speed > inertiaMaxSpeed) {
        speed = inertiaMaxSpeed;
        velocity._unit()._mult(speed);
    }
    var duration = speed / (inertiaDeceleration * inertiaLinearity), offset = velocity.mult(-duration / 2);
    this._map.panBy(offset, {
        duration: duration * 1000,
        easing: inertiaEasing,
        noMoveStart: true
    }, { originalEvent: e });
};
DragPanHandler.prototype._onMouseUp = function _onMouseUp(e) {
    if (this._ignoreEvent(e))
        return;
    this._onUp(e);
    window.document.removeEventListener('mousemove', this._onMove);
    window.document.removeEventListener('mouseup', this._onMouseUp);
};
DragPanHandler.prototype._onTouchEnd = function _onTouchEnd(e) {
    if (this._ignoreEvent(e))
        return;
    this._onUp(e);
    window.document.removeEventListener('touchmove', this._onMove);
    window.document.removeEventListener('touchend', this._onTouchEnd);
};
DragPanHandler.prototype._fireEvent = function _fireEvent(type, e) {
    return this._map.fire(type, { originalEvent: e });
};
DragPanHandler.prototype._ignoreEvent = function _ignoreEvent(e) {
    var map = this._map;
    if (map.boxZoom && map.boxZoom.isActive())
        return true;
    if (map.dragRotate && map.dragRotate.isActive())
        return true;
    if (e.touches) {
        return e.touches.length > 1;
    } else {
        if (e.ctrlKey)
            return true;
        var buttons = 1, button = 0;
        return e.type === 'mousemove' ? e.buttons & buttons === 0 : e.button !== button;
    }
};
DragPanHandler.prototype._drainInertiaBuffer = function _drainInertiaBuffer() {
    var inertia = this._inertia, now = Date.now(), cutoff = 160;
    while (inertia.length > 0 && now - inertia[0][0] > cutoff)
        inertia.shift();
};
module.exports = DragPanHandler;
},{"../../util/dom":185,"../../util/util":197,"../../util/window":180}],168:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var window = require('../../util/window');
var inertiaLinearity = 0.25, inertiaEasing = util.bezier(0, 0, inertiaLinearity, 1), inertiaMaxSpeed = 180, inertiaDeceleration = 720;
var DragRotateHandler = function DragRotateHandler(map, options) {
    this._map = map;
    this._el = map.getCanvasContainer();
    this._bearingSnap = options.bearingSnap;
    this._pitchWithRotate = options.pitchWithRotate !== false;
    util.bindAll([
        '_onDown',
        '_onMove',
        '_onUp'
    ], this);
};
DragRotateHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
DragRotateHandler.prototype.isActive = function isActive() {
    return !!this._active;
};
DragRotateHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('mousedown', this._onDown);
    this._enabled = true;
};
DragRotateHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('mousedown', this._onDown);
    this._enabled = false;
};
DragRotateHandler.prototype._onDown = function _onDown(e) {
    if (this._ignoreEvent(e))
        return;
    if (this.isActive())
        return;
    window.document.addEventListener('mousemove', this._onMove);
    window.document.addEventListener('mouseup', this._onUp);
    this._active = false;
    this._inertia = [[
            Date.now(),
            this._map.getBearing()
        ]];
    this._startPos = this._pos = DOM.mousePos(this._el, e);
    this._center = this._map.transform.centerPoint;
    e.preventDefault();
};
DragRotateHandler.prototype._onMove = function _onMove(e) {
    if (this._ignoreEvent(e))
        return;
    if (!this.isActive()) {
        this._active = true;
        this._fireEvent('rotatestart', e);
        this._fireEvent('movestart', e);
    }
    var map = this._map;
    map.stop();
    var p1 = this._pos, p2 = DOM.mousePos(this._el, e), bearingDiff = (p1.x - p2.x) * 0.8, pitchDiff = (p1.y - p2.y) * -0.5, bearing = map.getBearing() - bearingDiff, pitch = map.getPitch() - pitchDiff, inertia = this._inertia, last = inertia[inertia.length - 1];
    this._drainInertiaBuffer();
    inertia.push([
        Date.now(),
        map._normalizeBearing(bearing, last[1])
    ]);
    map.transform.bearing = bearing;
    if (this._pitchWithRotate)
        map.transform.pitch = pitch;
    this._fireEvent('rotate', e);
    this._fireEvent('move', e);
    this._pos = p2;
};
DragRotateHandler.prototype._onUp = function _onUp(e) {
    var this$1 = this;
    if (this._ignoreEvent(e))
        return;
    window.document.removeEventListener('mousemove', this._onMove);
    window.document.removeEventListener('mouseup', this._onUp);
    if (!this.isActive())
        return;
    this._active = false;
    this._fireEvent('rotateend', e);
    this._drainInertiaBuffer();
    var map = this._map, mapBearing = map.getBearing(), inertia = this._inertia;
    var finish = function () {
        if (Math.abs(mapBearing) < this$1._bearingSnap) {
            map.resetNorth({ noMoveStart: true }, { originalEvent: e });
        } else {
            this$1._fireEvent('moveend', e);
        }
    };
    if (inertia.length < 2) {
        finish();
        return;
    }
    var first = inertia[0], last = inertia[inertia.length - 1], previous = inertia[inertia.length - 2];
    var bearing = map._normalizeBearing(mapBearing, previous[1]);
    var flingDiff = last[1] - first[1], sign = flingDiff < 0 ? -1 : 1, flingDuration = (last[0] - first[0]) / 1000;
    if (flingDiff === 0 || flingDuration === 0) {
        finish();
        return;
    }
    var speed = Math.abs(flingDiff * (inertiaLinearity / flingDuration));
    if (speed > inertiaMaxSpeed) {
        speed = inertiaMaxSpeed;
    }
    var duration = speed / (inertiaDeceleration * inertiaLinearity), offset = sign * speed * (duration / 2);
    bearing += offset;
    if (Math.abs(map._normalizeBearing(bearing, 0)) < this._bearingSnap) {
        bearing = map._normalizeBearing(0, bearing);
    }
    map.rotateTo(bearing, {
        duration: duration * 1000,
        easing: inertiaEasing,
        noMoveStart: true
    }, { originalEvent: e });
};
DragRotateHandler.prototype._fireEvent = function _fireEvent(type, e) {
    return this._map.fire(type, { originalEvent: e });
};
DragRotateHandler.prototype._ignoreEvent = function _ignoreEvent(e) {
    var map = this._map;
    if (map.boxZoom && map.boxZoom.isActive())
        return true;
    if (map.dragPan && map.dragPan.isActive())
        return true;
    if (e.touches) {
        return e.touches.length > 1;
    } else {
        var buttons = e.ctrlKey ? 1 : 2, button = e.ctrlKey ? 0 : 2;
        var eventButton = e.button;
        if (typeof InstallTrigger !== 'undefined' && e.button === 2 && e.ctrlKey && window.navigator.platform.toUpperCase().indexOf('MAC') >= 0) {
            eventButton = 0;
        }
        return e.type === 'mousemove' ? e.buttons & buttons === 0 : eventButton !== button;
    }
};
DragRotateHandler.prototype._drainInertiaBuffer = function _drainInertiaBuffer() {
    var inertia = this._inertia, now = Date.now(), cutoff = 160;
    while (inertia.length > 0 && now - inertia[0][0] > cutoff)
        inertia.shift();
};
module.exports = DragRotateHandler;
},{"../../util/dom":185,"../../util/util":197,"../../util/window":180}],169:[function(require,module,exports){
'use strict';
var panStep = 100, bearingStep = 15, pitchStep = 10;
var KeyboardHandler = function KeyboardHandler(map) {
    this._map = map;
    this._el = map.getCanvasContainer();
    this._onKeyDown = this._onKeyDown.bind(this);
};
KeyboardHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
KeyboardHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('keydown', this._onKeyDown, false);
    this._enabled = true;
};
KeyboardHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('keydown', this._onKeyDown);
    this._enabled = false;
};
KeyboardHandler.prototype._onKeyDown = function _onKeyDown(e) {
    if (e.altKey || e.ctrlKey || e.metaKey)
        return;
    var zoomDir = 0;
    var bearingDir = 0;
    var pitchDir = 0;
    var xDir = 0;
    var yDir = 0;
    switch (e.keyCode) {
    case 61:
    case 107:
    case 171:
    case 187:
        zoomDir = 1;
        break;
    case 189:
    case 109:
    case 173:
        zoomDir = -1;
        break;
    case 37:
        if (e.shiftKey) {
            bearingDir = -1;
        } else {
            e.preventDefault();
            xDir = -1;
        }
        break;
    case 39:
        if (e.shiftKey) {
            bearingDir = 1;
        } else {
            e.preventDefault();
            xDir = 1;
        }
        break;
    case 38:
        if (e.shiftKey) {
            pitchDir = 1;
        } else {
            e.preventDefault();
            yDir = -1;
        }
        break;
    case 40:
        if (e.shiftKey) {
            pitchDir = -1;
        } else {
            yDir = 1;
            e.preventDefault();
        }
        break;
    }
    var map = this._map;
    var zoom = map.getZoom();
    var easeOptions = {
        duration: 300,
        delayEndEvents: 500,
        easing: easeOut,
        zoom: zoomDir ? Math.round(zoom) + zoomDir * (e.shiftKey ? 2 : 1) : zoom,
        bearing: map.getBearing() + bearingDir * bearingStep,
        pitch: map.getPitch() + pitchDir * pitchStep,
        offset: [
            -xDir * panStep,
            -yDir * panStep
        ],
        center: map.getCenter()
    };
    map.easeTo(easeOptions, { originalEvent: e });
};
function easeOut(t) {
    return t * (2 - t);
}
module.exports = KeyboardHandler;
},{}],170:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var browser = require('../../util/browser');
var window = require('../../util/window');
var ua = window.navigator.userAgent.toLowerCase(), firefox = ua.indexOf('firefox') !== -1, safari = ua.indexOf('safari') !== -1 && ua.indexOf('chrom') === -1;
var ScrollZoomHandler = function ScrollZoomHandler(map) {
    this._map = map;
    this._el = map.getCanvasContainer();
    util.bindAll([
        '_onWheel',
        '_onTimeout'
    ], this);
};
ScrollZoomHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
ScrollZoomHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('wheel', this._onWheel, false);
    this._el.addEventListener('mousewheel', this._onWheel, false);
    this._enabled = true;
};
ScrollZoomHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('wheel', this._onWheel);
    this._el.removeEventListener('mousewheel', this._onWheel);
    this._enabled = false;
};
ScrollZoomHandler.prototype._onWheel = function _onWheel(e) {
    var value;
    if (e.type === 'wheel') {
        value = e.deltaY;
        if (firefox && e.deltaMode === window.WheelEvent.DOM_DELTA_PIXEL)
            value /= browser.devicePixelRatio;
        if (e.deltaMode === window.WheelEvent.DOM_DELTA_LINE)
            value *= 40;
    } else if (e.type === 'mousewheel') {
        value = -e.wheelDeltaY;
        if (safari)
            value = value / 3;
    }
    var now = browser.now(), timeDelta = now - (this._time || 0);
    this._pos = DOM.mousePos(this._el, e);
    this._time = now;
    if (value !== 0 && value % 4.000244140625 === 0) {
        this._type = 'wheel';
    } else if (value !== 0 && Math.abs(value) < 4) {
        this._type = 'trackpad';
    } else if (timeDelta > 400) {
        this._type = null;
        this._lastValue = value;
        this._timeout = setTimeout(this._onTimeout, 40);
    } else if (!this._type) {
        this._type = Math.abs(timeDelta * value) < 200 ? 'trackpad' : 'wheel';
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null;
            value += this._lastValue;
        }
    }
    if (e.shiftKey && value)
        value = value / 4;
    if (this._type)
        this._zoom(-value, e);
    e.preventDefault();
};
ScrollZoomHandler.prototype._onTimeout = function _onTimeout() {
    this._type = 'wheel';
    this._zoom(-this._lastValue);
};
ScrollZoomHandler.prototype._zoom = function _zoom(delta, e) {
    if (delta === 0)
        return;
    var map = this._map;
    var scale = 2 / (1 + Math.exp(-Math.abs(delta / 100)));
    if (delta < 0 && scale !== 0)
        scale = 1 / scale;
    var fromScale = map.ease ? map.ease.to : map.transform.scale, targetZoom = map.transform.scaleZoom(fromScale * scale);
    map.zoomTo(targetZoom, {
        duration: this._type === 'wheel' ? 200 : 0,
        around: map.unproject(this._pos),
        delayEndEvents: 200,
        smoothEasing: true
    }, { originalEvent: e });
};
module.exports = ScrollZoomHandler;
},{"../../util/browser":178,"../../util/dom":185,"../../util/util":197,"../../util/window":180}],171:[function(require,module,exports){
'use strict';
var DOM = require('../../util/dom');
var util = require('../../util/util');
var window = require('../../util/window');
var inertiaLinearity = 0.15, inertiaEasing = util.bezier(0, 0, inertiaLinearity, 1), inertiaDeceleration = 12, inertiaMaxSpeed = 2.5, significantScaleThreshold = 0.15, significantRotateThreshold = 4;
var TouchZoomRotateHandler = function TouchZoomRotateHandler(map) {
    this._map = map;
    this._el = map.getCanvasContainer();
    util.bindAll([
        '_onStart',
        '_onMove',
        '_onEnd'
    ], this);
};
TouchZoomRotateHandler.prototype.isEnabled = function isEnabled() {
    return !!this._enabled;
};
TouchZoomRotateHandler.prototype.enable = function enable() {
    if (this.isEnabled())
        return;
    this._el.addEventListener('touchstart', this._onStart, false);
    this._enabled = true;
};
TouchZoomRotateHandler.prototype.disable = function disable() {
    if (!this.isEnabled())
        return;
    this._el.removeEventListener('touchstart', this._onStart);
    this._enabled = false;
};
TouchZoomRotateHandler.prototype.disableRotation = function disableRotation() {
    this._rotationDisabled = true;
};
TouchZoomRotateHandler.prototype.enableRotation = function enableRotation() {
    this._rotationDisabled = false;
};
TouchZoomRotateHandler.prototype._onStart = function _onStart(e) {
    if (e.touches.length !== 2)
        return;
    var p0 = DOM.mousePos(this._el, e.touches[0]), p1 = DOM.mousePos(this._el, e.touches[1]);
    this._startVec = p0.sub(p1);
    this._startScale = this._map.transform.scale;
    this._startBearing = this._map.transform.bearing;
    this._gestureIntent = undefined;
    this._inertia = [];
    window.document.addEventListener('touchmove', this._onMove, false);
    window.document.addEventListener('touchend', this._onEnd, false);
};
TouchZoomRotateHandler.prototype._onMove = function _onMove(e) {
    if (e.touches.length !== 2)
        return;
    var p0 = DOM.mousePos(this._el, e.touches[0]), p1 = DOM.mousePos(this._el, e.touches[1]), p = p0.add(p1).div(2), vec = p0.sub(p1), scale = vec.mag() / this._startVec.mag(), bearing = this._rotationDisabled ? 0 : vec.angleWith(this._startVec) * 180 / Math.PI, map = this._map;
    if (!this._gestureIntent) {
        var scalingSignificantly = Math.abs(1 - scale) > significantScaleThreshold, rotatingSignificantly = Math.abs(bearing) > significantRotateThreshold;
        if (rotatingSignificantly) {
            this._gestureIntent = 'rotate';
        } else if (scalingSignificantly) {
            this._gestureIntent = 'zoom';
        }
        if (this._gestureIntent) {
            this._startVec = vec;
            this._startScale = map.transform.scale;
            this._startBearing = map.transform.bearing;
        }
    } else {
        var param = {
            duration: 0,
            around: map.unproject(p)
        };
        if (this._gestureIntent === 'rotate') {
            param.bearing = this._startBearing + bearing;
        }
        if (this._gestureIntent === 'zoom' || this._gestureIntent === 'rotate') {
            param.zoom = map.transform.scaleZoom(this._startScale * scale);
        }
        map.stop();
        this._drainInertiaBuffer();
        this._inertia.push([
            Date.now(),
            scale,
            p
        ]);
        map.easeTo(param, { originalEvent: e });
    }
    e.preventDefault();
};
TouchZoomRotateHandler.prototype._onEnd = function _onEnd(e) {
    window.document.removeEventListener('touchmove', this._onMove);
    window.document.removeEventListener('touchend', this._onEnd);
    this._drainInertiaBuffer();
    var inertia = this._inertia, map = this._map;
    if (inertia.length < 2) {
        map.snapToNorth({}, { originalEvent: e });
        return;
    }
    var last = inertia[inertia.length - 1], first = inertia[0], lastScale = map.transform.scaleZoom(this._startScale * last[1]), firstScale = map.transform.scaleZoom(this._startScale * first[1]), scaleOffset = lastScale - firstScale, scaleDuration = (last[0] - first[0]) / 1000, p = last[2];
    if (scaleDuration === 0 || lastScale === firstScale) {
        map.snapToNorth({}, { originalEvent: e });
        return;
    }
    var speed = scaleOffset * inertiaLinearity / scaleDuration;
    if (Math.abs(speed) > inertiaMaxSpeed) {
        if (speed > 0) {
            speed = inertiaMaxSpeed;
        } else {
            speed = -inertiaMaxSpeed;
        }
    }
    var duration = Math.abs(speed / (inertiaDeceleration * inertiaLinearity)) * 1000;
    var targetScale = lastScale + speed * duration / 2000;
    if (targetScale < 0) {
        targetScale = 0;
    }
    map.easeTo({
        zoom: targetScale,
        duration: duration,
        easing: inertiaEasing,
        around: map.unproject(p)
    }, { originalEvent: e });
};
TouchZoomRotateHandler.prototype._drainInertiaBuffer = function _drainInertiaBuffer() {
    var inertia = this._inertia, now = Date.now(), cutoff = 160;
    while (inertia.length > 2 && now - inertia[0][0] > cutoff)
        inertia.shift();
};
module.exports = TouchZoomRotateHandler;
},{"../../util/dom":185,"../../util/util":197,"../../util/window":180}],172:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var window = require('../util/window');
var Hash = function Hash() {
    util.bindAll([
        '_onHashChange',
        '_updateHash'
    ], this);
};
Hash.prototype.addTo = function addTo(map) {
    this._map = map;
    window.addEventListener('hashchange', this._onHashChange, false);
    this._map.on('moveend', this._updateHash);
    return this;
};
Hash.prototype.remove = function remove() {
    window.removeEventListener('hashchange', this._onHashChange, false);
    this._map.off('moveend', this._updateHash);
    delete this._map;
    return this;
};
Hash.prototype._onHashChange = function _onHashChange() {
    var loc = window.location.hash.replace('#', '').split('/');
    if (loc.length >= 3) {
        this._map.jumpTo({
            center: [
                +loc[2],
                +loc[1]
            ],
            zoom: +loc[0],
            bearing: +(loc[3] || 0),
            pitch: +(loc[4] || 0)
        });
        return true;
    }
    return false;
};
Hash.prototype._updateHash = function _updateHash() {
    var center = this._map.getCenter(), zoom = this._map.getZoom(), bearing = this._map.getBearing(), pitch = this._map.getPitch(), precision = Math.max(0, Math.ceil(Math.log(zoom) / Math.LN2));
    var hash = '#' + Math.round(zoom * 100) / 100 + '/' + center.lat.toFixed(precision) + '/' + center.lng.toFixed(precision);
    if (bearing || pitch)
        hash += '/' + Math.round(bearing * 10) / 10;
    if (pitch)
        hash += '/' + Math.round(pitch);
    window.history.replaceState('', '', hash);
};
module.exports = Hash;
},{"../util/util":197,"../util/window":180}],173:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var browser = require('../util/browser');
var window = require('../util/window');
var DOM = require('../util/dom');
var Style = require('../style/style');
var AnimationLoop = require('../style/animation_loop');
var Painter = require('../render/painter');
var Transform = require('../geo/transform');
var Hash = require('./hash');
var bindHandlers = require('./bind_handlers');
var Camera = require('./camera');
var LngLat = require('../geo/lng_lat');
var LngLatBounds = require('../geo/lng_lat_bounds');
var Point = require('point-geometry');
var AttributionControl = require('./control/attribution_control');
var isSupported = require('mapbox-gl-supported');
var defaultMinZoom = 0;
var defaultMaxZoom = 20;
var defaultOptions = {
    center: [
        0,
        0
    ],
    zoom: 0,
    bearing: 0,
    pitch: 0,
    minZoom: defaultMinZoom,
    maxZoom: defaultMaxZoom,
    interactive: true,
    scrollZoom: true,
    boxZoom: true,
    dragRotate: true,
    dragPan: true,
    keyboard: true,
    doubleClickZoom: true,
    touchZoomRotate: true,
    bearingSnap: 7,
    hash: false,
    attributionControl: true,
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: false,
    trackResize: true
};
var Map = function (Camera) {
    function Map(options) {
        var this$1 = this;
        options = util.extend({}, defaultOptions, options);
        var transform = new Transform(options.minZoom, options.maxZoom);
        Camera.call(this, transform, options);
        this._interactive = options.interactive;
        this._failIfMajorPerformanceCaveat = options.failIfMajorPerformanceCaveat;
        this._preserveDrawingBuffer = options.preserveDrawingBuffer;
        this._trackResize = options.trackResize;
        this._bearingSnap = options.bearingSnap;
        if (typeof options.container === 'string') {
            this._container = window.document.getElementById(options.container);
            if (!this._container)
                throw new Error('Container \'' + options.container + '\' not found.');
        } else {
            this._container = options.container;
        }
        this.animationLoop = new AnimationLoop();
        if (options.maxBounds) {
            this.setMaxBounds(options.maxBounds);
        }
        util.bindAll([
            '_onWindowOnline',
            '_onWindowResize',
            '_contextLost',
            '_contextRestored',
            '_update',
            '_render',
            '_onData',
            '_onDataLoading'
        ], this);
        this._setupContainer();
        this._setupPainter();
        this.on('move', this._update.bind(this, false));
        this.on('zoom', this._update.bind(this, true));
        this.on('moveend', function () {
            this$1.animationLoop.set(300);
            this$1._rerender();
        });
        if (typeof window !== 'undefined') {
            window.addEventListener('online', this._onWindowOnline, false);
            window.addEventListener('resize', this._onWindowResize, false);
        }
        bindHandlers(this, options);
        this._hash = options.hash && new Hash().addTo(this);
        if (!this._hash || !this._hash._onHashChange()) {
            this.jumpTo({
                center: options.center,
                zoom: options.zoom,
                bearing: options.bearing,
                pitch: options.pitch
            });
        }
        this._classes = [];
        this.resize();
        if (options.classes)
            this.setClasses(options.classes);
        if (options.style)
            this.setStyle(options.style);
        if (options.attributionControl)
            this.addControl(new AttributionControl());
        this.on('style.load', function () {
            if (this.transform.unmodified) {
                this.jumpTo(this.style.stylesheet);
            }
            this.style.update(this._classes, { transition: false });
        });
        this.on('data', this._onData);
        this.on('dataloading', this._onDataLoading);
    }
    if (Camera)
        Map.__proto__ = Camera;
    Map.prototype = Object.create(Camera && Camera.prototype);
    Map.prototype.constructor = Map;
    var prototypeAccessors = {
        showTileBoundaries: {},
        showCollisionBoxes: {},
        showOverdrawInspector: {},
        repaint: {},
        vertices: {}
    };
    Map.prototype.addControl = function addControl(control, position) {
        if (position === undefined && control.getDefaultPosition) {
            position = control.getDefaultPosition();
        }
        if (position === undefined) {
            position = 'top-right';
        }
        var controlElement = control.onAdd(this);
        var positionContainer = this._controlPositions[position];
        if (position.indexOf('bottom') !== -1) {
            positionContainer.insertBefore(controlElement, positionContainer.firstChild);
        } else {
            positionContainer.appendChild(controlElement);
        }
        return this;
    };
    Map.prototype.removeControl = function removeControl(control) {
        control.onRemove(this);
        return this;
    };
    Map.prototype.addClass = function addClass(klass, options) {
        if (this._classes.indexOf(klass) >= 0 || klass === '')
            return this;
        this._classes.push(klass);
        this._classOptions = options;
        if (this.style)
            this.style.updateClasses();
        return this._update(true);
    };
    Map.prototype.removeClass = function removeClass(klass, options) {
        var i = this._classes.indexOf(klass);
        if (i < 0 || klass === '')
            return this;
        this._classes.splice(i, 1);
        this._classOptions = options;
        if (this.style)
            this.style.updateClasses();
        return this._update(true);
    };
    Map.prototype.setClasses = function setClasses(klasses, options) {
        var uniqueClasses = {};
        for (var i = 0; i < klasses.length; i++) {
            if (klasses[i] !== '')
                uniqueClasses[klasses[i]] = true;
        }
        this._classes = Object.keys(uniqueClasses);
        this._classOptions = options;
        if (this.style)
            this.style.updateClasses();
        return this._update(true);
    };
    Map.prototype.hasClass = function hasClass(klass) {
        return this._classes.indexOf(klass) >= 0;
    };
    Map.prototype.getClasses = function getClasses() {
        return this._classes;
    };
    Map.prototype.resize = function resize() {
        var dimensions = this._containerDimensions();
        var width = dimensions[0];
        var height = dimensions[1];
        this._resizeCanvas(width, height);
        this.transform.resize(width, height);
        this.painter.resize(width, height);
        return this.fire('movestart').fire('move').fire('resize').fire('moveend');
    };
    Map.prototype.getBounds = function getBounds() {
        var bounds = new LngLatBounds(this.transform.pointLocation(new Point(0, this.transform.height)), this.transform.pointLocation(new Point(this.transform.width, 0)));
        if (this.transform.angle || this.transform.pitch) {
            bounds.extend(this.transform.pointLocation(new Point(this.transform.size.x, 0)));
            bounds.extend(this.transform.pointLocation(new Point(0, this.transform.size.y)));
        }
        return bounds;
    };
    Map.prototype.setMaxBounds = function setMaxBounds(lnglatbounds) {
        if (lnglatbounds) {
            var b = LngLatBounds.convert(lnglatbounds);
            this.transform.lngRange = [
                b.getWest(),
                b.getEast()
            ];
            this.transform.latRange = [
                b.getSouth(),
                b.getNorth()
            ];
            this.transform._constrain();
            this._update();
        } else if (lnglatbounds === null || lnglatbounds === undefined) {
            this.transform.lngRange = [];
            this.transform.latRange = [];
            this._update();
        }
        return this;
    };
    Map.prototype.setMinZoom = function setMinZoom(minZoom) {
        minZoom = minZoom === null || minZoom === undefined ? defaultMinZoom : minZoom;
        if (minZoom >= defaultMinZoom && minZoom <= this.transform.maxZoom) {
            this.transform.minZoom = minZoom;
            this._update();
            if (this.getZoom() < minZoom)
                this.setZoom(minZoom);
            return this;
        } else
            throw new Error('minZoom must be between ' + defaultMinZoom + ' and the current maxZoom, inclusive');
    };
    Map.prototype.getMinZoom = function getMinZoom() {
        return this.transform.minZoom;
    };
    Map.prototype.setMaxZoom = function setMaxZoom(maxZoom) {
        maxZoom = maxZoom === null || maxZoom === undefined ? defaultMaxZoom : maxZoom;
        if (maxZoom >= this.transform.minZoom) {
            this.transform.maxZoom = maxZoom;
            this._update();
            if (this.getZoom() > maxZoom)
                this.setZoom(maxZoom);
            return this;
        } else
            throw new Error('maxZoom must be greater than the current minZoom');
    };
    Map.prototype.getMaxZoom = function getMaxZoom() {
        return this.transform.maxZoom;
    };
    Map.prototype.project = function project(lnglat) {
        return this.transform.locationPoint(LngLat.convert(lnglat));
    };
    Map.prototype.unproject = function unproject(point) {
        return this.transform.pointLocation(Point.convert(point));
    };
    Map.prototype.queryRenderedFeatures = function queryRenderedFeatures() {
        var params = {};
        var geometry;
        if (arguments.length === 2) {
            geometry = arguments[0];
            params = arguments[1];
        } else if (arguments.length === 1 && isPointLike(arguments[0])) {
            geometry = arguments[0];
        } else if (arguments.length === 1) {
            params = arguments[0];
        }
        return this.style.queryRenderedFeatures(this._makeQueryGeometry(geometry), params, this.transform.zoom, this.transform.angle);
        function isPointLike(input) {
            return input instanceof Point || Array.isArray(input);
        }
    };
    Map.prototype._makeQueryGeometry = function _makeQueryGeometry(pointOrBox) {
        var this$1 = this;
        if (pointOrBox === undefined) {
            pointOrBox = [
                Point.convert([
                    0,
                    0
                ]),
                Point.convert([
                    this.transform.width,
                    this.transform.height
                ])
            ];
        }
        var queryGeometry;
        var isPoint = pointOrBox instanceof Point || typeof pointOrBox[0] === 'number';
        if (isPoint) {
            var point = Point.convert(pointOrBox);
            queryGeometry = [point];
        } else {
            var box = [
                Point.convert(pointOrBox[0]),
                Point.convert(pointOrBox[1])
            ];
            queryGeometry = [
                box[0],
                new Point(box[1].x, box[0].y),
                box[1],
                new Point(box[0].x, box[1].y),
                box[0]
            ];
        }
        queryGeometry = queryGeometry.map(function (p) {
            return this$1.transform.pointCoordinate(p);
        });
        return queryGeometry;
    };
    Map.prototype.querySourceFeatures = function querySourceFeatures(sourceID, parameters) {
        return this.style.querySourceFeatures(sourceID, parameters);
    };
    Map.prototype.setStyle = function setStyle(style, options) {
        var shouldTryDiff = (!options || options.diff !== false) && this.style && style && !(style instanceof Style) && typeof style !== 'string';
        if (shouldTryDiff) {
            try {
                if (this.style.setState(style)) {
                    this._update(true);
                }
                return this;
            } catch (e) {
                util.warnOnce('Unable to perform style diff: ' + (e.message || e.error || e) + '.  Rebuilding the style from scratch.');
            }
        }
        if (this.style) {
            this.style.setEventedParent(null);
            this.style._remove();
            this.off('rotate', this.style._redoPlacement);
            this.off('pitch', this.style._redoPlacement);
        }
        if (!style) {
            this.style = null;
            return this;
        } else if (style instanceof Style) {
            this.style = style;
        } else {
            this.style = new Style(style, this);
        }
        this.style.setEventedParent(this, { style: this.style });
        this.on('rotate', this.style._redoPlacement);
        this.on('pitch', this.style._redoPlacement);
        return this;
    };
    Map.prototype.getStyle = function getStyle() {
        if (this.style) {
            return this.style.serialize();
        }
    };
    Map.prototype.addSource = function addSource(id, source) {
        this.style.addSource(id, source);
        this._update(true);
        return this;
    };
    Map.prototype.addSourceType = function addSourceType(name, SourceType, callback) {
        return this.style.addSourceType(name, SourceType, callback);
    };
    Map.prototype.removeSource = function removeSource(id) {
        this.style.removeSource(id);
        this._update(true);
        return this;
    };
    Map.prototype.getSource = function getSource(id) {
        return this.style.getSource(id);
    };
    Map.prototype.addLayer = function addLayer(layer, before) {
        this.style.addLayer(layer, before);
        this._update(true);
        return this;
    };
    Map.prototype.moveLayer = function moveLayer(id, beforeId) {
        this.style.moveLayer(id, beforeId);
        this._update(true);
        return this;
    };
    Map.prototype.removeLayer = function removeLayer(id) {
        this.style.removeLayer(id);
        this._update(true);
        return this;
    };
    Map.prototype.getLayer = function getLayer(id) {
        return this.style.getLayer(id);
    };
    Map.prototype.setFilter = function setFilter(layer, filter) {
        this.style.setFilter(layer, filter);
        this._update(true);
        return this;
    };
    Map.prototype.setLayerZoomRange = function setLayerZoomRange(layerId, minzoom, maxzoom) {
        this.style.setLayerZoomRange(layerId, minzoom, maxzoom);
        this._update(true);
        return this;
    };
    Map.prototype.getFilter = function getFilter(layer) {
        return this.style.getFilter(layer);
    };
    Map.prototype.setPaintProperty = function setPaintProperty(layer, name, value, klass) {
        this.style.setPaintProperty(layer, name, value, klass);
        this._update(true);
        return this;
    };
    Map.prototype.getPaintProperty = function getPaintProperty(layer, name, klass) {
        return this.style.getPaintProperty(layer, name, klass);
    };
    Map.prototype.setLayoutProperty = function setLayoutProperty(layer, name, value) {
        this.style.setLayoutProperty(layer, name, value);
        this._update(true);
        return this;
    };
    Map.prototype.getLayoutProperty = function getLayoutProperty(layer, name) {
        return this.style.getLayoutProperty(layer, name);
    };
    Map.prototype.setLight = function setLight(lightOptions) {
        this.style.setLight(lightOptions);
        this._update(true);
        return this;
    };
    Map.prototype.getLight = function getLight() {
        return this.style.getLight();
    };
    Map.prototype.getContainer = function getContainer() {
        return this._container;
    };
    Map.prototype.getCanvasContainer = function getCanvasContainer() {
        return this._canvasContainer;
    };
    Map.prototype.getCanvas = function getCanvas() {
        return this._canvas;
    };
    Map.prototype._containerDimensions = function _containerDimensions() {
        var width = 0;
        var height = 0;
        if (this._container) {
            width = this._container.offsetWidth || 400;
            height = this._container.offsetHeight || 300;
        }
        return [
            width,
            height
        ];
    };
    Map.prototype._setupContainer = function _setupContainer() {
        var container = this._container;
        container.classList.add('mapboxgl-map');
        var canvasContainer = this._canvasContainer = DOM.create('div', 'mapboxgl-canvas-container', container);
        if (this._interactive) {
            canvasContainer.classList.add('mapboxgl-interactive');
        }
        this._canvas = DOM.create('canvas', 'mapboxgl-canvas', canvasContainer);
        this._canvas.style.position = 'absolute';
        this._canvas.addEventListener('webglcontextlost', this._contextLost, false);
        this._canvas.addEventListener('webglcontextrestored', this._contextRestored, false);
        this._canvas.setAttribute('tabindex', 0);
        this._canvas.setAttribute('aria-label', 'Map');
        var dimensions = this._containerDimensions();
        this._resizeCanvas(dimensions[0], dimensions[1]);
        var controlContainer = this._controlContainer = DOM.create('div', 'mapboxgl-control-container', container);
        var positions = this._controlPositions = {};
        [
            'top-left',
            'top-right',
            'bottom-left',
            'bottom-right'
        ].forEach(function (positionName) {
            positions[positionName] = DOM.create('div', 'mapboxgl-ctrl-' + positionName, controlContainer);
        });
    };
    Map.prototype._resizeCanvas = function _resizeCanvas(width, height) {
        var pixelRatio = window.devicePixelRatio || 1;
        this._canvas.width = pixelRatio * width;
        this._canvas.height = pixelRatio * height;
        this._canvas.style.width = width + 'px';
        this._canvas.style.height = height + 'px';
    };
    Map.prototype._setupPainter = function _setupPainter() {
        var attributes = util.extend({
            failIfMajorPerformanceCaveat: this._failIfMajorPerformanceCaveat,
            preserveDrawingBuffer: this._preserveDrawingBuffer
        }, isSupported.webGLContextAttributes);
        var gl = this._canvas.getContext('webgl', attributes) || this._canvas.getContext('experimental-webgl', attributes);
        if (!gl) {
            this.fire('error', { error: new Error('Failed to initialize WebGL') });
            return;
        }
        var MAX_RENDERBUFFER_SIZE = gl.getParameter(gl.MAX_RENDERBUFFER_SIZE) / 2;
        if (this._canvas.width > MAX_RENDERBUFFER_SIZE || this._canvas.height > MAX_RENDERBUFFER_SIZE) {
            throw new Error('Map canvas (' + this._canvas.width + 'x' + this._canvas.height + ') ' + 'is larger than half of gl.MAX_RENDERBUFFER_SIZE (' + MAX_RENDERBUFFER_SIZE + ')');
        }
        this.painter = new Painter(gl, this.transform);
    };
    Map.prototype._contextLost = function _contextLost(event) {
        event.preventDefault();
        if (this._frameId) {
            browser.cancelFrame(this._frameId);
        }
        this.fire('webglcontextlost', { originalEvent: event });
    };
    Map.prototype._contextRestored = function _contextRestored(event) {
        this._setupPainter();
        this.resize();
        this._update();
        this.fire('webglcontextrestored', { originalEvent: event });
    };
    Map.prototype.loaded = function loaded() {
        if (this._styleDirty || this._sourcesDirty)
            return false;
        if (!this.style || !this.style.loaded())
            return false;
        return true;
    };
    Map.prototype._update = function _update(updateStyle) {
        if (!this.style)
            return this;
        this._styleDirty = this._styleDirty || updateStyle;
        this._sourcesDirty = true;
        this._rerender();
        return this;
    };
    Map.prototype._render = function _render() {
        if (this.style && this._styleDirty) {
            this._styleDirty = false;
            this.style.update(this._classes, this._classOptions);
            this._classOptions = null;
            this.style._recalculate(this.transform.zoom);
        }
        if (this.style && this._sourcesDirty) {
            this._sourcesDirty = false;
            this.style._updateSources(this.transform);
        }
        this.painter.render(this.style, {
            showTileBoundaries: this.showTileBoundaries,
            showOverdrawInspector: this._showOverdrawInspector,
            rotating: this.rotating,
            zooming: this.zooming
        });
        this.fire('render');
        if (this.loaded() && !this._loaded) {
            this._loaded = true;
            this.fire('load');
        }
        this._frameId = null;
        if (!this.animationLoop.stopped()) {
            this._styleDirty = true;
        }
        if (this._sourcesDirty || this._repaint || this._styleDirty) {
            this._rerender();
        }
        return this;
    };
    Map.prototype.remove = function remove() {
        if (this._hash)
            this._hash.remove();
        browser.cancelFrame(this._frameId);
        this.setStyle(null);
        if (typeof window !== 'undefined') {
            window.removeEventListener('resize', this._onWindowResize, false);
        }
        var extension = this.painter.gl.getExtension('WEBGL_lose_context');
        if (extension)
            extension.loseContext();
        removeNode(this._canvasContainer);
        removeNode(this._controlContainer);
        this._container.classList.remove('mapboxgl-map');
        this.fire('remove');
    };
    Map.prototype._rerender = function _rerender() {
        if (this.style && !this._frameId) {
            this._frameId = browser.frame(this._render);
        }
    };
    Map.prototype._onWindowOnline = function _onWindowOnline() {
        this._update();
    };
    Map.prototype._onWindowResize = function _onWindowResize() {
        if (this._trackResize) {
            this.stop().resize()._update();
        }
    };
    prototypeAccessors.showTileBoundaries.get = function () {
        return !!this._showTileBoundaries;
    };
    prototypeAccessors.showTileBoundaries.set = function (value) {
        if (this._showTileBoundaries === value)
            return;
        this._showTileBoundaries = value;
        this._update();
    };
    prototypeAccessors.showCollisionBoxes.get = function () {
        return !!this._showCollisionBoxes;
    };
    prototypeAccessors.showCollisionBoxes.set = function (value) {
        if (this._showCollisionBoxes === value)
            return;
        this._showCollisionBoxes = value;
        this.style._redoPlacement();
    };
    prototypeAccessors.showOverdrawInspector.get = function () {
        return !!this._showOverdrawInspector;
    };
    prototypeAccessors.showOverdrawInspector.set = function (value) {
        if (this._showOverdrawInspector === value)
            return;
        this._showOverdrawInspector = value;
        this._update();
    };
    prototypeAccessors.repaint.get = function () {
        return !!this._repaint;
    };
    prototypeAccessors.repaint.set = function (value) {
        this._repaint = value;
        this._update();
    };
    prototypeAccessors.vertices.get = function () {
        return !!this._vertices;
    };
    prototypeAccessors.vertices.set = function (value) {
        this._vertices = value;
        this._update();
    };
    Map.prototype._onData = function _onData(event) {
        this._update(event.dataType === 'style');
        this.fire(event.dataType + 'data', event);
    };
    Map.prototype._onDataLoading = function _onDataLoading(event) {
        this.fire(event.dataType + 'dataloading', event);
    };
    Object.defineProperties(Map.prototype, prototypeAccessors);
    return Map;
}(Camera);
module.exports = Map;
function removeNode(node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
}
},{"../geo/lng_lat":89,"../geo/lng_lat_bounds":90,"../geo/transform":91,"../render/painter":106,"../style/animation_loop":127,"../style/style":131,"../util/browser":178,"../util/dom":185,"../util/util":197,"../util/window":180,"./bind_handlers":159,"./camera":160,"./control/attribution_control":161,"./hash":172,"mapbox-gl-supported":70,"point-geometry":204}],174:[function(require,module,exports){
'use strict';
var DOM = require('../util/dom');
var LngLat = require('../geo/lng_lat');
var Point = require('point-geometry');
var Marker = function Marker(element, options) {
    this._offset = Point.convert(options && options.offset || [
        0,
        0
    ]);
    this._update = this._update.bind(this);
    this._onMapClick = this._onMapClick.bind(this);
    if (!element)
        element = DOM.create('div');
    element.classList.add('mapboxgl-marker');
    this._element = element;
    this._popup = null;
};
Marker.prototype.addTo = function addTo(map) {
    this.remove();
    this._map = map;
    map.getCanvasContainer().appendChild(this._element);
    map.on('move', this._update);
    map.on('moveend', this._update);
    this._update();
    this._map.on('click', this._onMapClick);
    return this;
};
Marker.prototype.remove = function remove() {
    if (this._map) {
        this._map.off('click', this._onMapClick);
        this._map.off('move', this._update);
        this._map.off('moveend', this._update);
        this._map = null;
    }
    DOM.remove(this._element);
    if (this._popup)
        this._popup.remove();
    return this;
};
Marker.prototype.getLngLat = function getLngLat() {
    return this._lngLat;
};
Marker.prototype.setLngLat = function setLngLat(lnglat) {
    this._lngLat = LngLat.convert(lnglat);
    if (this._popup)
        this._popup.setLngLat(this._lngLat);
    this._update();
    return this;
};
Marker.prototype.getElement = function getElement() {
    return this._element;
};
Marker.prototype.setPopup = function setPopup(popup) {
    if (this._popup) {
        this._popup.remove();
        this._popup = null;
    }
    if (popup) {
        this._popup = popup;
        this._popup.setLngLat(this._lngLat);
    }
    return this;
};
Marker.prototype._onMapClick = function _onMapClick(event) {
    var targetElement = event.originalEvent.target;
    var element = this._element;
    if (this._popup && (targetElement === element || element.contains(targetElement))) {
        this.togglePopup();
    }
};
Marker.prototype.getPopup = function getPopup() {
    return this._popup;
};
Marker.prototype.togglePopup = function togglePopup() {
    var popup = this._popup;
    if (!popup)
        return;
    else if (popup.isOpen())
        popup.remove();
    else
        popup.addTo(this._map);
};
Marker.prototype._update = function _update(e) {
    if (!this._map)
        return;
    var pos = this._map.project(this._lngLat)._add(this._offset);
    if (!e || e.type === 'moveend')
        pos = pos.round();
    DOM.setTransform(this._element, 'translate(' + pos.x + 'px, ' + pos.y + 'px)');
};
module.exports = Marker;
},{"../geo/lng_lat":89,"../util/dom":185,"point-geometry":204}],175:[function(require,module,exports){
'use strict';
var util = require('../util/util');
var Evented = require('../util/evented');
var DOM = require('../util/dom');
var LngLat = require('../geo/lng_lat');
var Point = require('point-geometry');
var window = require('../util/window');
var defaultOptions = {
    closeButton: true,
    closeOnClick: true
};
var Popup = function (Evented) {
    function Popup(options) {
        Evented.call(this);
        this.options = util.extend(Object.create(defaultOptions), options);
        util.bindAll([
            '_update',
            '_onClickClose'
        ], this);
    }
    if (Evented)
        Popup.__proto__ = Evented;
    Popup.prototype = Object.create(Evented && Evented.prototype);
    Popup.prototype.constructor = Popup;
    Popup.prototype.addTo = function addTo(map) {
        this._map = map;
        this._map.on('move', this._update);
        if (this.options.closeOnClick) {
            this._map.on('click', this._onClickClose);
        }
        this._update();
        return this;
    };
    Popup.prototype.isOpen = function isOpen() {
        return !!this._map;
    };
    Popup.prototype.remove = function remove() {
        if (this._content && this._content.parentNode) {
            this._content.parentNode.removeChild(this._content);
        }
        if (this._container) {
            this._container.parentNode.removeChild(this._container);
            delete this._container;
        }
        if (this._map) {
            this._map.off('move', this._update);
            this._map.off('click', this._onClickClose);
            delete this._map;
        }
        this.fire('close');
        return this;
    };
    Popup.prototype.getLngLat = function getLngLat() {
        return this._lngLat;
    };
    Popup.prototype.setLngLat = function setLngLat(lnglat) {
        this._lngLat = LngLat.convert(lnglat);
        this._update();
        return this;
    };
    Popup.prototype.setText = function setText(text) {
        return this.setDOMContent(window.document.createTextNode(text));
    };
    Popup.prototype.setHTML = function setHTML(html) {
        var frag = window.document.createDocumentFragment();
        var temp = window.document.createElement('body');
        var child;
        temp.innerHTML = html;
        while (true) {
            child = temp.firstChild;
            if (!child)
                break;
            frag.appendChild(child);
        }
        return this.setDOMContent(frag);
    };
    Popup.prototype.setDOMContent = function setDOMContent(htmlNode) {
        this._createContent();
        this._content.appendChild(htmlNode);
        this._update();
        return this;
    };
    Popup.prototype._createContent = function _createContent() {
        if (this._content && this._content.parentNode) {
            this._content.parentNode.removeChild(this._content);
        }
        this._content = DOM.create('div', 'mapboxgl-popup-content', this._container);
        if (this.options.closeButton) {
            this._closeButton = DOM.create('button', 'mapboxgl-popup-close-button', this._content);
            this._closeButton.type = 'button';
            this._closeButton.innerHTML = '&#215;';
            this._closeButton.addEventListener('click', this._onClickClose);
        }
    };
    Popup.prototype._update = function _update() {
        if (!this._map || !this._lngLat || !this._content) {
            return;
        }
        if (!this._container) {
            this._container = DOM.create('div', 'mapboxgl-popup', this._map.getContainer());
            this._tip = DOM.create('div', 'mapboxgl-popup-tip', this._container);
            this._container.appendChild(this._content);
        }
        var anchor = this.options.anchor;
        var offset = normalizeOffset(this.options.offset);
        var pos = this._map.project(this._lngLat).round();
        if (!anchor) {
            var width = this._container.offsetWidth, height = this._container.offsetHeight;
            if (pos.y + offset.bottom.y < height) {
                anchor = ['top'];
            } else if (pos.y > this._map.transform.height - height) {
                anchor = ['bottom'];
            } else {
                anchor = [];
            }
            if (pos.x < width / 2) {
                anchor.push('left');
            } else if (pos.x > this._map.transform.width - width / 2) {
                anchor.push('right');
            }
            if (anchor.length === 0) {
                anchor = 'bottom';
            } else {
                anchor = anchor.join('-');
            }
        }
        var offsetedPos = pos.add(offset[anchor]);
        var anchorTranslate = {
            'top': 'translate(-50%,0)',
            'top-left': 'translate(0,0)',
            'top-right': 'translate(-100%,0)',
            'bottom': 'translate(-50%,-100%)',
            'bottom-left': 'translate(0,-100%)',
            'bottom-right': 'translate(-100%,-100%)',
            'left': 'translate(0,-50%)',
            'right': 'translate(-100%,-50%)'
        };
        var classList = this._container.classList;
        for (var key in anchorTranslate) {
            classList.remove('mapboxgl-popup-anchor-' + key);
        }
        classList.add('mapboxgl-popup-anchor-' + anchor);
        DOM.setTransform(this._container, anchorTranslate[anchor] + ' translate(' + offsetedPos.x + 'px,' + offsetedPos.y + 'px)');
    };
    Popup.prototype._onClickClose = function _onClickClose() {
        this.remove();
    };
    return Popup;
}(Evented);
function normalizeOffset(offset) {
    if (!offset) {
        return normalizeOffset(new Point(0, 0));
    } else if (typeof offset === 'number') {
        var cornerOffset = Math.round(Math.sqrt(0.5 * Math.pow(offset, 2)));
        return {
            'top': new Point(0, offset),
            'top-left': new Point(cornerOffset, cornerOffset),
            'top-right': new Point(-cornerOffset, cornerOffset),
            'bottom': new Point(0, -offset),
            'bottom-left': new Point(cornerOffset, -cornerOffset),
            'bottom-right': new Point(-cornerOffset, -cornerOffset),
            'left': new Point(offset, 0),
            'right': new Point(-offset, 0)
        };
    } else if (isPointLike(offset)) {
        var convertedOffset = Point.convert(offset);
        return {
            'top': convertedOffset,
            'top-left': convertedOffset,
            'top-right': convertedOffset,
            'bottom': convertedOffset,
            'bottom-left': convertedOffset,
            'bottom-right': convertedOffset,
            'left': convertedOffset,
            'right': convertedOffset
        };
    } else {
        return {
            'top': Point.convert(offset['top'] || [
                0,
                0
            ]),
            'top-left': Point.convert(offset['top-left'] || [
                0,
                0
            ]),
            'top-right': Point.convert(offset['top-right'] || [
                0,
                0
            ]),
            'bottom': Point.convert(offset['bottom'] || [
                0,
                0
            ]),
            'bottom-left': Point.convert(offset['bottom-left'] || [
                0,
                0
            ]),
            'bottom-right': Point.convert(offset['bottom-right'] || [
                0,
                0
            ]),
            'left': Point.convert(offset['left'] || [
                0,
                0
            ]),
            'right': Point.convert(offset['right'] || [
                0,
                0
            ])
        };
    }
}
function isPointLike(input) {
    return input instanceof Point || Array.isArray(input);
}
module.exports = Popup;
},{"../geo/lng_lat":89,"../util/dom":185,"../util/evented":186,"../util/util":197,"../util/window":180,"point-geometry":204}],176:[function(require,module,exports){
'use strict';
var Actor = function Actor(target, parent, mapId) {
    this.target = target;
    this.parent = parent;
    this.mapId = mapId;
    this.callbacks = {};
    this.callbackID = 0;
    this.receive = this.receive.bind(this);
    this.target.addEventListener('message', this.receive, false);
};
Actor.prototype.send = function send(type, data, callback, buffers, targetMapId) {
    var id = callback ? this.mapId + ':' + this.callbackID++ : null;
    if (callback)
        this.callbacks[id] = callback;
    this.target.postMessage({
        targetMapId: targetMapId,
        sourceMapId: this.mapId,
        type: type,
        id: String(id),
        data: data
    }, buffers);
};
Actor.prototype.receive = function receive(message) {
    var this$1 = this;
    var data = message.data, id = data.id;
    var callback;
    if (data.targetMapId && this.mapId !== data.targetMapId)
        return;
    var done = function (err, data, buffers) {
        this$1.target.postMessage({
            sourceMapId: this$1.mapId,
            type: '<response>',
            id: String(id),
            error: err ? String(err) : null,
            data: data
        }, buffers);
    };
    if (data.type === '<response>') {
        callback = this.callbacks[data.id];
        delete this.callbacks[data.id];
        if (callback)
            callback(data.error || null, data.data);
    } else if (typeof data.id !== 'undefined' && this.parent[data.type]) {
        this.parent[data.type](data.sourceMapId, data.data, done);
    } else if (typeof data.id !== 'undefined' && this.parent.getWorkerSource) {
        var keys = data.type.split('.');
        var workerSource = this.parent.getWorkerSource(data.sourceMapId, keys[0]);
        workerSource[keys[1]](data.data, done);
    } else {
        this.parent[data.type](data.data);
    }
};
Actor.prototype.remove = function remove() {
    this.target.removeEventListener('message', this.receive, false);
};
module.exports = Actor;
},{}],177:[function(require,module,exports){
'use strict';
var window = require('./window');
exports.getJSON = function (url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.onerror = function (e) {
        callback(e);
    };
    xhr.onload = function () {
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            var data;
            try {
                data = JSON.parse(xhr.response);
            } catch (err) {
                return callback(err);
            }
            callback(null, data);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};
exports.getArrayBuffer = function (url, callback) {
    var xhr = new window.XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onerror = function (e) {
        callback(e);
    };
    xhr.onload = function () {
        if (xhr.response.byteLength === 0 && xhr.status === 200) {
            return callback(new Error('http status 200 returned without content.'));
        }
        if (xhr.status >= 200 && xhr.status < 300 && xhr.response) {
            callback(null, xhr.response);
        } else {
            callback(new Error(xhr.statusText));
        }
    };
    xhr.send();
    return xhr;
};
function sameOrigin(url) {
    var a = window.document.createElement('a');
    a.href = url;
    return a.protocol === window.document.location.protocol && a.host === window.document.location.host;
}
var transparentPngUrl = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVQYV2NgAAIAAAUAAarVyFEAAAAASUVORK5CYII=';
exports.getImage = function (url, callback) {
    return exports.getArrayBuffer(url, function (err, imgData) {
        if (err)
            return callback(err);
        var img = new window.Image();
        var URL = window.URL || window.webkitURL;
        img.onload = function () {
            callback(null, img);
            URL.revokeObjectURL(img.src);
        };
        var blob = new window.Blob([new Uint8Array(imgData)], { type: 'image/png' });
        img.src = imgData.byteLength ? URL.createObjectURL(blob) : transparentPngUrl;
    });
};
exports.getVideo = function (urls, callback) {
    var video = window.document.createElement('video');
    video.onloadstart = function () {
        callback(null, video);
    };
    for (var i = 0; i < urls.length; i++) {
        var s = window.document.createElement('source');
        if (!sameOrigin(urls[i])) {
            video.crossOrigin = 'Anonymous';
        }
        s.src = urls[i];
        video.appendChild(s);
    }
    return video;
};
},{"./window":180}],178:[function(require,module,exports){
'use strict';
var window = require('./window');
module.exports.now = function () {
    if (window.performance && window.performance.now) {
        return window.performance.now.bind(window.performance);
    } else {
        return Date.now.bind(Date);
    }
}();
var frame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
exports.frame = function (fn) {
    return frame(fn);
};
var cancel = window.cancelAnimationFrame || window.mozCancelAnimationFrame || window.webkitCancelAnimationFrame || window.msCancelAnimationFrame;
exports.cancelFrame = function (id) {
    cancel(id);
};
exports.timed = function (fn, dur, ctx) {
    if (!dur) {
        fn.call(ctx, 1);
        return null;
    }
    var abort = false;
    var start = module.exports.now();
    function tick(now) {
        if (abort)
            return;
        now = module.exports.now();
        if (now >= start + dur) {
            fn.call(ctx, 1);
        } else {
            fn.call(ctx, (now - start) / dur);
            exports.frame(tick);
        }
    }
    exports.frame(tick);
    return function () {
        abort = true;
    };
};
exports.getImageData = function (img) {
    var canvas = window.document.createElement('canvas');
    var context = canvas.getContext('2d');
    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);
    return context.getImageData(0, 0, img.width, img.height).data;
};
exports.supported = require('mapbox-gl-supported');
exports.hardwareConcurrency = window.navigator.hardwareConcurrency || 4;
Object.defineProperty(exports, 'devicePixelRatio', {
    get: function () {
        return window.devicePixelRatio;
    }
});
exports.supportsWebp = false;
var webpImgTest = window.document.createElement('img');
webpImgTest.onload = function () {
    exports.supportsWebp = true;
};
webpImgTest.src = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAQAAAAfQ//73v/+BiOh/AAA=';
},{"./window":180,"mapbox-gl-supported":70}],179:[function(require,module,exports){
'use strict';
var WebWorkify = require('webworkify');
var window = require('../window');
var workerURL = window.URL.createObjectURL(new WebWorkify(require('../../source/worker'), { bare: true }));
module.exports = function () {
    return new window.Worker(workerURL);
};
},{"../../source/worker":125,"../window":180,"webworkify":217}],180:[function(require,module,exports){
'use strict';
module.exports = self;
},{}],181:[function(require,module,exports){
'use strict';
var quickselect = require('quickselect');
var calculateSignedArea = require('./util').calculateSignedArea;
module.exports = function classifyRings(rings, maxRings) {
    var len = rings.length;
    if (len <= 1)
        return [rings];
    var polygons = [];
    var polygon, ccw;
    for (var i = 0; i < len; i++) {
        var area = calculateSignedArea(rings[i]);
        if (area === 0)
            continue;
        rings[i].area = Math.abs(area);
        if (ccw === undefined)
            ccw = area < 0;
        if (ccw === area < 0) {
            if (polygon)
                polygons.push(polygon);
            polygon = [rings[i]];
        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon)
        polygons.push(polygon);
    if (maxRings > 1) {
        for (var j = 0; j < polygons.length; j++) {
            if (polygons[j].length <= maxRings)
                continue;
            quickselect(polygons[j], maxRings, 1, polygons[j].length - 1, compareAreas);
            polygons[j] = polygons[j].slice(0, maxRings);
        }
    }
    return polygons;
};
function compareAreas(a, b) {
    return b.area - a.area;
}
},{"./util":197,"quickselect":205}],182:[function(require,module,exports){
'use strict';
var config = {
    API_URL: 'https://api.mapbox.com',
    REQUIRE_ACCESS_TOKEN: true,
    ACCESS_TOKEN: null
};
module.exports = config;
},{}],183:[function(require,module,exports){
'use strict';
var DictionaryCoder = function DictionaryCoder(strings) {
    var this$1 = this;
    this._stringToNumber = {};
    this._numberToString = [];
    for (var i = 0; i < strings.length; i++) {
        var string = strings[i];
        this$1._stringToNumber[string] = i;
        this$1._numberToString[i] = string;
    }
};
DictionaryCoder.prototype.encode = function encode(string) {
    return this._stringToNumber[string];
};
DictionaryCoder.prototype.decode = function decode(n) {
    return this._numberToString[n];
};
module.exports = DictionaryCoder;
},{}],184:[function(require,module,exports){
'use strict';
var util = require('./util');
var Actor = require('./actor');
var Dispatcher = function Dispatcher(workerPool, parent) {
    var this$1 = this;
    this.workerPool = workerPool;
    this.actors = [];
    this.currentActor = 0;
    this.id = util.uniqueId();
    var workers = this.workerPool.acquire(this.id);
    for (var i = 0; i < workers.length; i++) {
        var worker = workers[i];
        var actor = new Actor(worker, parent, this$1.id);
        actor.name = 'Worker ' + i;
        this$1.actors.push(actor);
    }
};
Dispatcher.prototype.broadcast = function broadcast(type, data, cb) {
    cb = cb || function () {
    };
    util.asyncAll(this.actors, function (actor, done) {
        actor.send(type, data, done);
    }, cb);
};
Dispatcher.prototype.send = function send(type, data, callback, targetID, buffers) {
    if (typeof targetID !== 'number' || isNaN(targetID)) {
        targetID = this.currentActor = (this.currentActor + 1) % this.actors.length;
    }
    this.actors[targetID].send(type, data, callback, buffers);
    return targetID;
};
Dispatcher.prototype.remove = function remove() {
    this.actors.forEach(function (actor) {
        actor.remove();
    });
    this.actors = [];
    this.workerPool.release(this.id);
};
module.exports = Dispatcher;
},{"./actor":176,"./util":197}],185:[function(require,module,exports){
'use strict';
var Point = require('point-geometry');
var window = require('./window');
exports.create = function (tagName, className, container) {
    var el = window.document.createElement(tagName);
    if (className)
        el.className = className;
    if (container)
        container.appendChild(el);
    return el;
};
var docStyle = window.document.documentElement.style;
function testProp(props) {
    for (var i = 0; i < props.length; i++) {
        if (props[i] in docStyle) {
            return props[i];
        }
    }
    return props[0];
}
var selectProp = testProp([
    'userSelect',
    'MozUserSelect',
    'WebkitUserSelect',
    'msUserSelect'
]);
var userSelect;
exports.disableDrag = function () {
    if (selectProp) {
        userSelect = docStyle[selectProp];
        docStyle[selectProp] = 'none';
    }
};
exports.enableDrag = function () {
    if (selectProp) {
        docStyle[selectProp] = userSelect;
    }
};
var transformProp = testProp([
    'transform',
    'WebkitTransform'
]);
exports.setTransform = function (el, value) {
    el.style[transformProp] = value;
};
function suppressClick(e) {
    e.preventDefault();
    e.stopPropagation();
    window.removeEventListener('click', suppressClick, true);
}
exports.suppressClick = function () {
    window.addEventListener('click', suppressClick, true);
    window.setTimeout(function () {
        window.removeEventListener('click', suppressClick, true);
    }, 0);
};
exports.mousePos = function (el, e) {
    var rect = el.getBoundingClientRect();
    e = e.touches ? e.touches[0] : e;
    return new Point(e.clientX - rect.left - el.clientLeft, e.clientY - rect.top - el.clientTop);
};
exports.touchPos = function (el, e) {
    var rect = el.getBoundingClientRect(), points = [];
    var touches = e.type === 'touchend' ? e.changedTouches : e.touches;
    for (var i = 0; i < touches.length; i++) {
        points.push(new Point(touches[i].clientX - rect.left - el.clientLeft, touches[i].clientY - rect.top - el.clientTop));
    }
    return points;
};
exports.remove = function (node) {
    if (node.parentNode) {
        node.parentNode.removeChild(node);
    }
};
},{"./window":180,"point-geometry":204}],186:[function(require,module,exports){
'use strict';
var util = require('./util');
var Evented = function Evented() {
};
Evented.prototype.on = function on(type, listener) {
    this._listeners = this._listeners || {};
    this._listeners[type] = this._listeners[type] || [];
    this._listeners[type].push(listener);
    return this;
};
Evented.prototype.off = function off(type, listener) {
    if (this._listeners && this._listeners[type]) {
        var index = this._listeners[type].indexOf(listener);
        if (index !== -1) {
            this._listeners[type].splice(index, 1);
        }
    }
    return this;
};
Evented.prototype.once = function once(type, listener) {
    var this$1 = this;
    var wrapper = function (data) {
        this$1.off(type, wrapper);
        listener.call(this$1, data);
    };
    this.on(type, wrapper);
    return this;
};
Evented.prototype.fire = function fire(type, data) {
    var this$1 = this;
    if (this.listens(type)) {
        data = util.extend({}, data, {
            type: type,
            target: this
        });
        var listeners = this._listeners && this._listeners[type] ? this._listeners[type].slice() : [];
        for (var i = 0; i < listeners.length; i++) {
            listeners[i].call(this$1, data);
        }
        if (this._eventedParent) {
            this._eventedParent.fire(type, util.extend({}, data, this._eventedParentData));
        }
    } else if (util.endsWith(type, 'error')) {
        console.error(data && data.error || data || 'Empty error event');
    }
    return this;
};
Evented.prototype.listens = function listens(type) {
    return this._listeners && this._listeners[type] || this._eventedParent && this._eventedParent.listens(type);
};
Evented.prototype.setEventedParent = function setEventedParent(parent, data) {
    this._eventedParent = parent;
    this._eventedParentData = typeof data === 'function' ? data() : data;
    return this;
};
module.exports = Evented;
},{"./util":197}],187:[function(require,module,exports){
'use strict';
var Queue = require('tinyqueue');
var Point = require('point-geometry');
var distToSegmentSquared = require('./intersection_tests').distToSegmentSquared;
module.exports = function (polygonRings, precision, debug) {
    precision = precision || 1;
    var minX, minY, maxX, maxY;
    var outerRing = polygonRings[0];
    for (var i = 0; i < outerRing.length; i++) {
        var p = outerRing[i];
        if (!i || p.x < minX)
            minX = p.x;
        if (!i || p.y < minY)
            minY = p.y;
        if (!i || p.x > maxX)
            maxX = p.x;
        if (!i || p.y > maxY)
            maxY = p.y;
    }
    var width = maxX - minX;
    var height = maxY - minY;
    var cellSize = Math.min(width, height);
    var h = cellSize / 2;
    var cellQueue = new Queue(null, compareMax);
    for (var x = minX; x < maxX; x += cellSize) {
        for (var y = minY; y < maxY; y += cellSize) {
            cellQueue.push(new Cell(x + h, y + h, h, polygonRings));
        }
    }
    var bestCell = getCentroidCell(polygonRings);
    var numProbes = cellQueue.length;
    while (cellQueue.length) {
        var cell = cellQueue.pop();
        if (cell.d > bestCell.d) {
            bestCell = cell;
            if (debug)
                console.log('found best %d after %d probes', Math.round(10000 * cell.d) / 10000, numProbes);
        }
        if (cell.max - bestCell.d <= precision)
            continue;
        h = cell.h / 2;
        cellQueue.push(new Cell(cell.p.x - h, cell.p.y - h, h, polygonRings));
        cellQueue.push(new Cell(cell.p.x + h, cell.p.y - h, h, polygonRings));
        cellQueue.push(new Cell(cell.p.x - h, cell.p.y + h, h, polygonRings));
        cellQueue.push(new Cell(cell.p.x + h, cell.p.y + h, h, polygonRings));
        numProbes += 4;
    }
    if (debug) {
        console.log('num probes: ' + numProbes);
        console.log('best distance: ' + bestCell.d);
    }
    return bestCell.p;
};
function compareMax(a, b) {
    return b.max - a.max;
}
function Cell(x, y, h, polygon) {
    this.p = new Point(x, y);
    this.h = h;
    this.d = pointToPolygonDist(this.p, polygon);
    this.max = this.d + this.h * Math.SQRT2;
}
function pointToPolygonDist(p, polygon) {
    var inside = false;
    var minDistSq = Infinity;
    for (var k = 0; k < polygon.length; k++) {
        var ring = polygon[k];
        for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
            var a = ring[i];
            var b = ring[j];
            if (a.y > p.y !== b.y > p.y && p.x < (b.x - a.x) * (p.y - a.y) / (b.y - a.y) + a.x)
                inside = !inside;
            minDistSq = Math.min(minDistSq, distToSegmentSquared(p, a, b));
        }
    }
    return (inside ? 1 : -1) * Math.sqrt(minDistSq);
}
function getCentroidCell(polygon) {
    var area = 0;
    var x = 0;
    var y = 0;
    var points = polygon[0];
    for (var i = 0, len = points.length, j = len - 1; i < len; j = i++) {
        var a = points[i];
        var b = points[j];
        var f = a.x * b.y - b.x * a.y;
        x += (a.x + b.x) * f;
        y += (a.y + b.y) * f;
        area += f * 3;
    }
    return new Cell(x / area, y / area, 0, polygon);
}
},{"./intersection_tests":190,"point-geometry":204,"tinyqueue":208}],188:[function(require,module,exports){
'use strict';
module.exports = Glyphs;
function Glyphs(pbf, end) {
    this.stacks = pbf.readFields(readFontstacks, [], end);
}
function readFontstacks(tag, stacks, pbf) {
    if (tag === 1) {
        var fontstack = pbf.readMessage(readFontstack, { glyphs: {} });
        stacks.push(fontstack);
    }
}
function readFontstack(tag, fontstack, pbf) {
    if (tag === 1)
        fontstack.name = pbf.readString();
    else if (tag === 2)
        fontstack.range = pbf.readString();
    else if (tag === 3) {
        var glyph = pbf.readMessage(readGlyph, {});
        fontstack.glyphs[glyph.id] = glyph;
    }
}
function readGlyph(tag, glyph, pbf) {
    if (tag === 1)
        glyph.id = pbf.readVarint();
    else if (tag === 2)
        glyph.bitmap = pbf.readBytes();
    else if (tag === 3)
        glyph.width = pbf.readVarint();
    else if (tag === 4)
        glyph.height = pbf.readVarint();
    else if (tag === 5)
        glyph.left = pbf.readSVarint();
    else if (tag === 6)
        glyph.top = pbf.readSVarint();
    else if (tag === 7)
        glyph.advance = pbf.readVarint();
}
},{}],189:[function(require,module,exports){
'use strict';
module.exports = interpolate;
function interpolate(a, b, t) {
    return a * (1 - t) + b * t;
}
interpolate.number = interpolate;
interpolate.vec2 = function (from, to, t) {
    return [
        interpolate(from[0], to[0], t),
        interpolate(from[1], to[1], t)
    ];
};
interpolate.color = function (from, to, t) {
    return [
        interpolate(from[0], to[0], t),
        interpolate(from[1], to[1], t),
        interpolate(from[2], to[2], t),
        interpolate(from[3], to[3], t)
    ];
};
interpolate.array = function (from, to, t) {
    return from.map(function (d, i) {
        return interpolate(d, to[i], t);
    });
};
},{}],190:[function(require,module,exports){
'use strict';
var isCounterClockwise = require('./util').isCounterClockwise;
module.exports = {
    multiPolygonIntersectsBufferedMultiPoint: multiPolygonIntersectsBufferedMultiPoint,
    multiPolygonIntersectsMultiPolygon: multiPolygonIntersectsMultiPolygon,
    multiPolygonIntersectsBufferedMultiLine: multiPolygonIntersectsBufferedMultiLine,
    polygonIntersectsPolygon: polygonIntersectsPolygon,
    distToSegmentSquared: distToSegmentSquared
};
function polygonIntersectsPolygon(polygonA, polygonB) {
    for (var i = 0; i < polygonA.length; i++) {
        if (polygonContainsPoint(polygonB, polygonA[i]))
            return true;
    }
    for (var i$1 = 0; i$1 < polygonB.length; i$1++) {
        if (polygonContainsPoint(polygonA, polygonB[i$1]))
            return true;
    }
    if (lineIntersectsLine(polygonA, polygonB))
        return true;
    return false;
}
function multiPolygonIntersectsBufferedMultiPoint(multiPolygon, rings, radius) {
    for (var j = 0; j < multiPolygon.length; j++) {
        var polygon = multiPolygon[j];
        for (var i = 0; i < rings.length; i++) {
            var ring = rings[i];
            for (var k = 0; k < ring.length; k++) {
                var point = ring[k];
                if (polygonContainsPoint(polygon, point))
                    return true;
                if (pointIntersectsBufferedLine(point, polygon, radius))
                    return true;
            }
        }
    }
    return false;
}
function multiPolygonIntersectsMultiPolygon(multiPolygonA, multiPolygonB) {
    if (multiPolygonA.length === 1 && multiPolygonA[0].length === 1) {
        return multiPolygonContainsPoint(multiPolygonB, multiPolygonA[0][0]);
    }
    for (var m = 0; m < multiPolygonB.length; m++) {
        var ring = multiPolygonB[m];
        for (var n = 0; n < ring.length; n++) {
            if (multiPolygonContainsPoint(multiPolygonA, ring[n]))
                return true;
        }
    }
    for (var j = 0; j < multiPolygonA.length; j++) {
        var polygon = multiPolygonA[j];
        for (var i = 0; i < polygon.length; i++) {
            if (multiPolygonContainsPoint(multiPolygonB, polygon[i]))
                return true;
        }
        for (var k = 0; k < multiPolygonB.length; k++) {
            if (lineIntersectsLine(polygon, multiPolygonB[k]))
                return true;
        }
    }
    return false;
}
function multiPolygonIntersectsBufferedMultiLine(multiPolygon, multiLine, radius) {
    for (var i = 0; i < multiLine.length; i++) {
        var line = multiLine[i];
        for (var j = 0; j < multiPolygon.length; j++) {
            var polygon = multiPolygon[j];
            if (polygon.length >= 3) {
                for (var k = 0; k < line.length; k++) {
                    if (polygonContainsPoint(polygon, line[k]))
                        return true;
                }
            }
            if (lineIntersectsBufferedLine(polygon, line, radius))
                return true;
        }
    }
    return false;
}
function lineIntersectsBufferedLine(lineA, lineB, radius) {
    if (lineA.length > 1) {
        if (lineIntersectsLine(lineA, lineB))
            return true;
        for (var j = 0; j < lineB.length; j++) {
            if (pointIntersectsBufferedLine(lineB[j], lineA, radius))
                return true;
        }
    }
    for (var k = 0; k < lineA.length; k++) {
        if (pointIntersectsBufferedLine(lineA[k], lineB, radius))
            return true;
    }
    return false;
}
function lineIntersectsLine(lineA, lineB) {
    if (lineA.length === 0 || lineB.length === 0)
        return false;
    for (var i = 0; i < lineA.length - 1; i++) {
        var a0 = lineA[i];
        var a1 = lineA[i + 1];
        for (var j = 0; j < lineB.length - 1; j++) {
            var b0 = lineB[j];
            var b1 = lineB[j + 1];
            if (lineSegmentIntersectsLineSegment(a0, a1, b0, b1))
                return true;
        }
    }
    return false;
}
function lineSegmentIntersectsLineSegment(a0, a1, b0, b1) {
    return isCounterClockwise(a0, b0, b1) !== isCounterClockwise(a1, b0, b1) && isCounterClockwise(a0, a1, b0) !== isCounterClockwise(a0, a1, b1);
}
function pointIntersectsBufferedLine(p, line, radius) {
    var radiusSquared = radius * radius;
    if (line.length === 1)
        return p.distSqr(line[0]) < radiusSquared;
    for (var i = 1; i < line.length; i++) {
        var v = line[i - 1], w = line[i];
        if (distToSegmentSquared(p, v, w) < radiusSquared)
            return true;
    }
    return false;
}
function distToSegmentSquared(p, v, w) {
    var l2 = v.distSqr(w);
    if (l2 === 0)
        return p.distSqr(v);
    var t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
    if (t < 0)
        return p.distSqr(v);
    if (t > 1)
        return p.distSqr(w);
    return p.distSqr(w.sub(v)._mult(t)._add(v));
}
function multiPolygonContainsPoint(rings, p) {
    var c = false, ring, p1, p2;
    for (var k = 0; k < rings.length; k++) {
        ring = rings[k];
        for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
            p1 = ring[i];
            p2 = ring[j];
            if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
                c = !c;
            }
        }
    }
    return c;
}
function polygonContainsPoint(ring, p) {
    var c = false;
    for (var i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        var p1 = ring[i];
        var p2 = ring[j];
        if (p1.y > p.y !== p2.y > p.y && p.x < (p2.x - p1.x) * (p.y - p1.y) / (p2.y - p1.y) + p1.x) {
            c = !c;
        }
    }
    return c;
}
},{"./util":197}],191:[function(require,module,exports){
'use strict';
var unicodeBlockLookup = {
    'Latin-1 Supplement': function (char) {
        return char >= 128 && char <= 255;
    },
    'Hangul Jamo': function (char) {
        return char >= 4352 && char <= 4607;
    },
    'Unified Canadian Aboriginal Syllabics': function (char) {
        return char >= 5120 && char <= 5759;
    },
    'Unified Canadian Aboriginal Syllabics Extended': function (char) {
        return char >= 6320 && char <= 6399;
    },
    'General Punctuation': function (char) {
        return char >= 8192 && char <= 8303;
    },
    'Letterlike Symbols': function (char) {
        return char >= 8448 && char <= 8527;
    },
    'Number Forms': function (char) {
        return char >= 8528 && char <= 8591;
    },
    'Miscellaneous Technical': function (char) {
        return char >= 8960 && char <= 9215;
    },
    'Control Pictures': function (char) {
        return char >= 9216 && char <= 9279;
    },
    'Optical Character Recognition': function (char) {
        return char >= 9280 && char <= 9311;
    },
    'Enclosed Alphanumerics': function (char) {
        return char >= 9312 && char <= 9471;
    },
    'Geometric Shapes': function (char) {
        return char >= 9632 && char <= 9727;
    },
    'Miscellaneous Symbols': function (char) {
        return char >= 9728 && char <= 9983;
    },
    'Miscellaneous Symbols and Arrows': function (char) {
        return char >= 11008 && char <= 11263;
    },
    'CJK Radicals Supplement': function (char) {
        return char >= 11904 && char <= 12031;
    },
    'Kangxi Radicals': function (char) {
        return char >= 12032 && char <= 12255;
    },
    'Ideographic Description Characters': function (char) {
        return char >= 12272 && char <= 12287;
    },
    'CJK Symbols and Punctuation': function (char) {
        return char >= 12288 && char <= 12351;
    },
    'Hiragana': function (char) {
        return char >= 12352 && char <= 12447;
    },
    'Katakana': function (char) {
        return char >= 12448 && char <= 12543;
    },
    'Bopomofo': function (char) {
        return char >= 12544 && char <= 12591;
    },
    'Hangul Compatibility Jamo': function (char) {
        return char >= 12592 && char <= 12687;
    },
    'Kanbun': function (char) {
        return char >= 12688 && char <= 12703;
    },
    'Bopomofo Extended': function (char) {
        return char >= 12704 && char <= 12735;
    },
    'CJK Strokes': function (char) {
        return char >= 12736 && char <= 12783;
    },
    'Katakana Phonetic Extensions': function (char) {
        return char >= 12784 && char <= 12799;
    },
    'Enclosed CJK Letters and Months': function (char) {
        return char >= 12800 && char <= 13055;
    },
    'CJK Compatibility': function (char) {
        return char >= 13056 && char <= 13311;
    },
    'CJK Unified Ideographs Extension A': function (char) {
        return char >= 13312 && char <= 19903;
    },
    'Yijing Hexagram Symbols': function (char) {
        return char >= 19904 && char <= 19967;
    },
    'CJK Unified Ideographs': function (char) {
        return char >= 19968 && char <= 40959;
    },
    'Yi Syllables': function (char) {
        return char >= 40960 && char <= 42127;
    },
    'Yi Radicals': function (char) {
        return char >= 42128 && char <= 42191;
    },
    'Hangul Jamo Extended-A': function (char) {
        return char >= 43360 && char <= 43391;
    },
    'Hangul Syllables': function (char) {
        return char >= 44032 && char <= 55215;
    },
    'Hangul Jamo Extended-B': function (char) {
        return char >= 55216 && char <= 55295;
    },
    'Private Use Area': function (char) {
        return char >= 57344 && char <= 63743;
    },
    'CJK Compatibility Ideographs': function (char) {
        return char >= 63744 && char <= 64255;
    },
    'Vertical Forms': function (char) {
        return char >= 65040 && char <= 65055;
    },
    'CJK Compatibility Forms': function (char) {
        return char >= 65072 && char <= 65103;
    },
    'Small Form Variants': function (char) {
        return char >= 65104 && char <= 65135;
    },
    'Halfwidth and Fullwidth Forms': function (char) {
        return char >= 65280 && char <= 65519;
    }
};
module.exports = unicodeBlockLookup;
},{}],192:[function(require,module,exports){
'use strict';
var LRUCache = function LRUCache(max, onRemove) {
    this.max = max;
    this.onRemove = onRemove;
    this.reset();
};
LRUCache.prototype.reset = function reset() {
    var this$1 = this;
    for (var key in this.data) {
        this$1.onRemove(this$1.data[key]);
    }
    this.data = {};
    this.order = [];
    return this;
};
LRUCache.prototype.add = function add(key, data) {
    if (this.has(key)) {
        this.order.splice(this.order.indexOf(key), 1);
        this.data[key] = data;
        this.order.push(key);
    } else {
        this.data[key] = data;
        this.order.push(key);
        if (this.order.length > this.max) {
            var removedData = this.get(this.order[0]);
            if (removedData)
                this.onRemove(removedData);
        }
    }
    return this;
};
LRUCache.prototype.has = function has(key) {
    return key in this.data;
};
LRUCache.prototype.keys = function keys() {
    return this.order;
};
LRUCache.prototype.get = function get(key) {
    if (!this.has(key)) {
        return null;
    }
    var data = this.data[key];
    delete this.data[key];
    this.order.splice(this.order.indexOf(key), 1);
    return data;
};
LRUCache.prototype.setMaxSize = function setMaxSize(max) {
    var this$1 = this;
    this.max = max;
    while (this.order.length > this.max) {
        var removedData = this$1.get(this$1.order[0]);
        if (removedData)
            this$1.onRemove(removedData);
    }
    return this;
};
module.exports = LRUCache;
},{}],193:[function(require,module,exports){
'use strict';
var config = require('./config');
var browser = require('./browser');
var help = 'See https://www.mapbox.com/developers/api/#access-tokens';
function makeAPIURL(urlObject, accessToken) {
    var apiUrlObject = parseUrl(config.API_URL);
    urlObject.protocol = apiUrlObject.protocol;
    urlObject.authority = apiUrlObject.authority;
    if (!config.REQUIRE_ACCESS_TOKEN)
        return formatUrl(urlObject);
    accessToken = accessToken || config.ACCESS_TOKEN;
    if (!accessToken)
        throw new Error('An API access token is required to use Mapbox GL. ' + help);
    if (accessToken[0] === 's')
        throw new Error('Use a public access token (pk.*) with Mapbox GL, not a secret access token (sk.*). ' + help);
    urlObject.params.push('access_token=' + accessToken);
    return formatUrl(urlObject);
}
function isMapboxURL(url) {
    return url.indexOf('mapbox:') === 0;
}
exports.isMapboxURL = isMapboxURL;
exports.normalizeStyleURL = function (url, accessToken) {
    if (!isMapboxURL(url))
        return url;
    var urlObject = parseUrl(url);
    urlObject.path = '/styles/v1' + urlObject.path;
    return makeAPIURL(urlObject, accessToken);
};
exports.normalizeGlyphsURL = function (url, accessToken) {
    if (!isMapboxURL(url))
        return url;
    var urlObject = parseUrl(url);
    urlObject.path = '/fonts/v1' + urlObject.path;
    return makeAPIURL(urlObject, accessToken);
};
exports.normalizeSourceURL = function (url, accessToken) {
    if (!isMapboxURL(url))
        return url;
    var urlObject = parseUrl(url);
    urlObject.path = '/v4/' + urlObject.authority + '.json';
    urlObject.params.push('secure');
    return makeAPIURL(urlObject, accessToken);
};
exports.normalizeSpriteURL = function (url, format, extension, accessToken) {
    var urlObject = parseUrl(url);
    if (!isMapboxURL(url)) {
        urlObject.path += '' + format + extension;
        return formatUrl(urlObject);
    }
    urlObject.path = '/styles/v1' + urlObject.path + '/sprite' + format + extension;
    return makeAPIURL(urlObject, accessToken);
};
var imageExtensionRe = /(\.(png|jpg)\d*)(?=$)/;
exports.normalizeTileURL = function (tileURL, sourceURL, tileSize) {
    if (!sourceURL || !isMapboxURL(sourceURL))
        return tileURL;
    var urlObject = parseUrl(tileURL);
    var suffix = browser.devicePixelRatio >= 2 || tileSize === 512 ? '@2x' : '';
    var extension = browser.supportsWebp ? '.webp' : '$1';
    urlObject.path = urlObject.path.replace(imageExtensionRe, '' + suffix + extension);
    replaceTempAccessToken(urlObject.params);
    return formatUrl(urlObject);
};
function replaceTempAccessToken(params) {
    for (var i = 0; i < params.length; i++) {
        if (params[i].indexOf('access_token=tk.') === 0) {
            params[i] = 'access_token=' + (config.ACCESS_TOKEN || '');
        }
    }
}
var urlRe = /^(\w+):\/\/([^\/?]+)(\/[^?]+)?\??(.+)?/;
function parseUrl(url) {
    var parts = url.match(urlRe);
    if (!parts) {
        throw new Error('Unable to parse URL object');
    }
    return {
        protocol: parts[1],
        authority: parts[2],
        path: parts[3] || '/',
        params: parts[4] ? parts[4].split('&') : []
    };
}
function formatUrl(obj) {
    var params = obj.params.length ? '?' + obj.params.join('&') : '';
    return obj.protocol + '://' + obj.authority + obj.path + params;
}
},{"./browser":178,"./config":182}],194:[function(require,module,exports){
'use strict';
var isChar = require('./is_char_in_unicode_block');
module.exports.allowsIdeographicBreaking = function (chars) {
    for (var i = 0, list = chars; i < list.length; i += 1) {
        var char = list[i];
        if (!exports.charAllowsIdeographicBreaking(char.charCodeAt(0)))
            return false;
    }
    return true;
};
module.exports.allowsVerticalWritingMode = function (chars) {
    for (var i = 0, list = chars; i < list.length; i += 1) {
        var char = list[i];
        if (exports.charHasUprightVerticalOrientation(char.charCodeAt(0)))
            return true;
    }
    return false;
};
module.exports.charAllowsIdeographicBreaking = function (char) {
    if (char < 11904)
        return false;
    if (isChar['Bopomofo Extended'](char))
        return true;
    if (isChar['Bopomofo'](char))
        return true;
    if (isChar['CJK Compatibility Forms'](char))
        return true;
    if (isChar['CJK Compatibility Ideographs'](char))
        return true;
    if (isChar['CJK Compatibility'](char))
        return true;
    if (isChar['CJK Radicals Supplement'](char))
        return true;
    if (isChar['CJK Strokes'](char))
        return true;
    if (isChar['CJK Symbols and Punctuation'](char))
        return true;
    if (isChar['CJK Unified Ideographs Extension A'](char))
        return true;
    if (isChar['CJK Unified Ideographs'](char))
        return true;
    if (isChar['Enclosed CJK Letters and Months'](char))
        return true;
    if (isChar['Halfwidth and Fullwidth Forms'](char))
        return true;
    if (isChar['Hiragana'](char))
        return true;
    if (isChar['Ideographic Description Characters'](char))
        return true;
    if (isChar['Kangxi Radicals'](char))
        return true;
    if (isChar['Katakana Phonetic Extensions'](char))
        return true;
    if (isChar['Katakana'](char))
        return true;
    if (isChar['Vertical Forms'](char))
        return true;
    if (isChar['Yi Radicals'](char))
        return true;
    if (isChar['Yi Syllables'](char))
        return true;
    return false;
};
exports.charHasUprightVerticalOrientation = function (char) {
    if (char === 746 || char === 747) {
        return true;
    }
    if (char < 4352)
        return false;
    if (isChar['Bopomofo Extended'](char))
        return true;
    if (isChar['Bopomofo'](char))
        return true;
    if (isChar['CJK Compatibility Forms'](char)) {
        if (!(char >= 65097 && char <= 65103)) {
            return true;
        }
    }
    if (isChar['CJK Compatibility Ideographs'](char))
        return true;
    if (isChar['CJK Compatibility'](char))
        return true;
    if (isChar['CJK Radicals Supplement'](char))
        return true;
    if (isChar['CJK Strokes'](char))
        return true;
    if (isChar['CJK Symbols and Punctuation'](char)) {
        if (!(char >= 12296 && char <= 12305) && !(char >= 12308 && char <= 12319) && char !== 12336) {
            return true;
        }
    }
    if (isChar['CJK Unified Ideographs Extension A'](char))
        return true;
    if (isChar['CJK Unified Ideographs'](char))
        return true;
    if (isChar['Enclosed CJK Letters and Months'](char))
        return true;
    if (isChar['Hangul Compatibility Jamo'](char))
        return true;
    if (isChar['Hangul Jamo Extended-A'](char))
        return true;
    if (isChar['Hangul Jamo Extended-B'](char))
        return true;
    if (isChar['Hangul Jamo'](char))
        return true;
    if (isChar['Hangul Syllables'](char))
        return true;
    if (isChar['Hiragana'](char))
        return true;
    if (isChar['Ideographic Description Characters'](char))
        return true;
    if (isChar['Kanbun'](char))
        return true;
    if (isChar['Kangxi Radicals'](char))
        return true;
    if (isChar['Katakana Phonetic Extensions'](char))
        return true;
    if (isChar['Katakana'](char)) {
        if (char !== 12540) {
            return true;
        }
    }
    if (isChar['Halfwidth and Fullwidth Forms'](char)) {
        if (char !== 65288 && char !== 65289 && char !== 65293 && !(char >= 65306 && char <= 65310) && char !== 65339 && char !== 65341 && char !== 65343 && !(char >= 65371 && char <= 65503) && char !== 65507 && !(char >= 65512 && char <= 65519)) {
            return true;
        }
    }
    if (isChar['Small Form Variants'](char)) {
        if (!(char >= 65112 && char <= 65118) && !(char >= 65123 && char <= 65126)) {
            return true;
        }
    }
    if (isChar['Unified Canadian Aboriginal Syllabics'](char))
        return true;
    if (isChar['Unified Canadian Aboriginal Syllabics Extended'](char))
        return true;
    if (isChar['Vertical Forms'](char))
        return true;
    if (isChar['Yijing Hexagram Symbols'](char))
        return true;
    if (isChar['Yi Syllables'](char))
        return true;
    if (isChar['Yi Radicals'](char))
        return true;
    return false;
};
exports.charHasNeutralVerticalOrientation = function (char) {
    if (isChar['Latin-1 Supplement'](char)) {
        if (char === 167 || char === 169 || char === 174 || char === 177 || char === 188 || char === 189 || char === 190 || char === 215 || char === 247) {
            return true;
        }
    }
    if (isChar['General Punctuation'](char)) {
        if (char === 8214 || char === 8224 || char === 8225 || char === 8240 || char === 8241 || char === 8251 || char === 8252 || char === 8258 || char === 8263 || char === 8264 || char === 8265 || char === 8273) {
            return true;
        }
    }
    if (isChar['Letterlike Symbols'](char))
        return true;
    if (isChar['Number Forms'](char))
        return true;
    if (isChar['Miscellaneous Technical'](char)) {
        if (char >= 8960 && char <= 8967 || char >= 8972 && char <= 8991 || char >= 8996 && char <= 9000 || char === 9003 || char >= 9085 && char <= 9114 || char >= 9150 && char <= 9165 || char === 9167 || char >= 9169 && char <= 9179 || char >= 9186 && char <= 9215) {
            return true;
        }
    }
    if (isChar['Control Pictures'](char) && char !== 9251)
        return true;
    if (isChar['Optical Character Recognition'](char))
        return true;
    if (isChar['Enclosed Alphanumerics'](char))
        return true;
    if (isChar['Geometric Shapes'](char))
        return true;
    if (isChar['Miscellaneous Symbols'](char)) {
        if (!(char >= 9754 && char <= 9759)) {
            return true;
        }
    }
    if (isChar['Miscellaneous Symbols and Arrows'](char)) {
        if (char >= 11026 && char <= 11055 || char >= 11088 && char <= 11097 || char >= 11192 && char <= 11243) {
            return true;
        }
    }
    if (isChar['CJK Symbols and Punctuation'](char))
        return true;
    if (isChar['Katakana'](char))
        return true;
    if (isChar['Private Use Area'](char))
        return true;
    if (isChar['CJK Compatibility Forms'](char))
        return true;
    if (isChar['Small Form Variants'](char))
        return true;
    if (isChar['Halfwidth and Fullwidth Forms'](char))
        return true;
    if (char === 8734 || char === 8756 || char === 8757 || char >= 9984 && char <= 10087 || char >= 10102 && char <= 10131 || char === 65532 || char === 65533) {
        return true;
    }
    return false;
};
exports.charHasRotatedVerticalOrientation = function (char) {
    return !(exports.charHasUprightVerticalOrientation(char) || exports.charHasNeutralVerticalOrientation(char));
};
},{"./is_char_in_unicode_block":191}],195:[function(require,module,exports){
'use strict';
module.exports = createStructArrayType;
var viewTypes = {
    'Int8': Int8Array,
    'Uint8': Uint8Array,
    'Uint8Clamped': Uint8ClampedArray,
    'Int16': Int16Array,
    'Uint16': Uint16Array,
    'Int32': Int32Array,
    'Uint32': Uint32Array,
    'Float32': Float32Array,
    'Float64': Float64Array
};
var Struct = function Struct(structArray, index) {
    this._structArray = structArray;
    this._pos1 = index * this.size;
    this._pos2 = this._pos1 / 2;
    this._pos4 = this._pos1 / 4;
    this._pos8 = this._pos1 / 8;
};
var DEFAULT_CAPACITY = 128;
var RESIZE_MULTIPLIER = 5;
var StructArray = function StructArray(serialized) {
    this.isTransferred = false;
    if (serialized !== undefined) {
        this.arrayBuffer = serialized.arrayBuffer;
        this.length = serialized.length;
        this.capacity = this.arrayBuffer.byteLength / this.bytesPerElement;
        this._refreshViews();
    } else {
        this.capacity = -1;
        this.resize(0);
    }
};
StructArray.serialize = function serialize() {
    return {
        members: this.prototype.members,
        alignment: this.prototype.StructType.prototype.alignment,
        bytesPerElement: this.prototype.bytesPerElement
    };
};
StructArray.prototype.serialize = function serialize(transferables) {
    this._trim();
    if (transferables) {
        this.isTransferred = true;
        transferables.push(this.arrayBuffer);
    }
    return {
        length: this.length,
        arrayBuffer: this.arrayBuffer
    };
};
StructArray.prototype.get = function get(index) {
    return new this.StructType(this, index);
};
StructArray.prototype._trim = function _trim() {
    if (this.length !== this.capacity) {
        this.capacity = this.length;
        this.arrayBuffer = this.arrayBuffer.slice(0, this.length * this.bytesPerElement);
        this._refreshViews();
    }
};
StructArray.prototype.resize = function resize(n) {
    this.length = n;
    if (n > this.capacity) {
        this.capacity = Math.max(n, Math.floor(this.capacity * RESIZE_MULTIPLIER), DEFAULT_CAPACITY);
        this.arrayBuffer = new ArrayBuffer(this.capacity * this.bytesPerElement);
        var oldUint8Array = this.uint8;
        this._refreshViews();
        if (oldUint8Array)
            this.uint8.set(oldUint8Array);
    }
};
StructArray.prototype._refreshViews = function _refreshViews() {
    var this$1 = this;
    for (var i = 0, list = this._usedTypes; i < list.length; i += 1) {
        var type = list[i];
        this$1[getArrayViewName(type)] = new viewTypes[type](this$1.arrayBuffer);
    }
};
StructArray.prototype.toArray = function toArray(startIndex, endIndex) {
    var this$1 = this;
    var array = [];
    for (var i = startIndex; i < endIndex; i++) {
        var struct = this$1.get(i);
        array.push(struct);
    }
    return array;
};
var structArrayTypeCache = {};
function createStructArrayType(options) {
    var key = JSON.stringify(options);
    if (structArrayTypeCache[key]) {
        return structArrayTypeCache[key];
    }
    var alignment = options.alignment === undefined ? 1 : options.alignment;
    var offset = 0;
    var maxSize = 0;
    var usedTypes = ['Uint8'];
    var members = options.members.map(function (member) {
        if (usedTypes.indexOf(member.type) < 0)
            usedTypes.push(member.type);
        var typeSize = sizeOf(member.type);
        var memberOffset = offset = align(offset, Math.max(alignment, typeSize));
        var components = member.components || 1;
        maxSize = Math.max(maxSize, typeSize);
        offset += typeSize * components;
        return {
            name: member.name,
            type: member.type,
            components: components,
            offset: memberOffset
        };
    });
    var size = align(offset, Math.max(maxSize, alignment));
    var StructType = function (Struct) {
        function StructType() {
            Struct.apply(this, arguments);
        }
        if (Struct)
            StructType.__proto__ = Struct;
        StructType.prototype = Object.create(Struct && Struct.prototype);
        StructType.prototype.constructor = StructType;
        return StructType;
    }(Struct);
    StructType.prototype.alignment = alignment;
    StructType.prototype.size = size;
    for (var i = 0, list = members; i < list.length; i += 1) {
        var member = list[i];
        for (var c = 0; c < member.components; c++) {
            var name = member.name + (member.components === 1 ? '' : c);
            Object.defineProperty(StructType.prototype, name, {
                get: createGetter(member, c),
                set: createSetter(member, c)
            });
        }
    }
    var StructArrayType = function (StructArray) {
        function StructArrayType() {
            StructArray.apply(this, arguments);
        }
        if (StructArray)
            StructArrayType.__proto__ = StructArray;
        StructArrayType.prototype = Object.create(StructArray && StructArray.prototype);
        StructArrayType.prototype.constructor = StructArrayType;
        return StructArrayType;
    }(StructArray);
    StructArrayType.prototype.members = members;
    StructArrayType.prototype.StructType = StructType;
    StructArrayType.prototype.bytesPerElement = size;
    StructArrayType.prototype.emplaceBack = createEmplaceBack(members, size);
    StructArrayType.prototype._usedTypes = usedTypes;
    structArrayTypeCache[key] = StructArrayType;
    return StructArrayType;
}
function align(offset, size) {
    return Math.ceil(offset / size) * size;
}
function sizeOf(type) {
    return viewTypes[type].BYTES_PER_ELEMENT;
}
function getArrayViewName(type) {
    return type.toLowerCase();
}
function createEmplaceBack(members, bytesPerElement) {
    var usedTypeSizes = [];
    var argNames = [];
    var body = 'var i = this.length;\n' + 'this.resize(this.length + 1);\n';
    for (var i = 0, list = members; i < list.length; i += 1) {
        var member = list[i];
        var size = sizeOf(member.type);
        if (usedTypeSizes.indexOf(size) < 0) {
            usedTypeSizes.push(size);
            body += 'var o' + size.toFixed(0) + ' = i * ' + (bytesPerElement / size).toFixed(0) + ';\n';
        }
        for (var c = 0; c < member.components; c++) {
            var argName = 'v' + argNames.length;
            var index = 'o' + size.toFixed(0) + ' + ' + (member.offset / size + c).toFixed(0);
            body += 'this.' + getArrayViewName(member.type) + '[' + index + '] = ' + argName + ';\n';
            argNames.push(argName);
        }
    }
    body += 'return i;';
    return new Function(argNames.toString(), body);
}
function createMemberComponentString(member, component) {
    var elementOffset = 'this._pos' + sizeOf(member.type).toFixed(0);
    var componentOffset = (member.offset / sizeOf(member.type) + component).toFixed(0);
    var index = elementOffset + ' + ' + componentOffset;
    return 'this._structArray.' + getArrayViewName(member.type) + '[' + index + ']';
}
function createGetter(member, c) {
    return new Function('return ' + createMemberComponentString(member, c) + ';');
}
function createSetter(member, c) {
    return new Function('x', createMemberComponentString(member, c) + ' = x;');
}
},{}],196:[function(require,module,exports){
'use strict';
module.exports = resolveTokens;
function resolveTokens(properties, text) {
    return text.replace(/{([^{}]+)}/g, function (match, key) {
        return key in properties ? properties[key] : '';
    });
}
},{}],197:[function(require,module,exports){
'use strict';
var UnitBezier = require('unitbezier');
var Coordinate = require('../geo/coordinate');
var Point = require('point-geometry');
exports.easeCubicInOut = function (t) {
    if (t <= 0)
        return 0;
    if (t >= 1)
        return 1;
    var t2 = t * t, t3 = t2 * t;
    return 4 * (t < 0.5 ? t3 : 3 * (t - t2) + t3 - 0.75);
};
exports.bezier = function (p1x, p1y, p2x, p2y) {
    var bezier = new UnitBezier(p1x, p1y, p2x, p2y);
    return function (t) {
        return bezier.solve(t);
    };
};
exports.ease = exports.bezier(0.25, 0.1, 0.25, 1);
exports.clamp = function (n, min, max) {
    return Math.min(max, Math.max(min, n));
};
exports.wrap = function (n, min, max) {
    var d = max - min;
    var w = ((n - min) % d + d) % d + min;
    return w === min ? max : w;
};
exports.asyncAll = function (array, fn, callback) {
    if (!array.length) {
        return callback(null, []);
    }
    var remaining = array.length;
    var results = new Array(array.length);
    var error = null;
    array.forEach(function (item, i) {
        fn(item, function (err, result) {
            if (err)
                error = err;
            results[i] = result;
            if (--remaining === 0)
                callback(error, results);
        });
    });
};
exports.values = function (obj) {
    var result = [];
    for (var k in obj) {
        result.push(obj[k]);
    }
    return result;
};
exports.keysDifference = function (obj, other) {
    var difference = [];
    for (var i in obj) {
        if (!(i in other)) {
            difference.push(i);
        }
    }
    return difference;
};
exports.extend = function (dest, source0, source1, source2) {
    var arguments$1 = arguments;
    for (var i = 1; i < arguments.length; i++) {
        var src = arguments$1[i];
        for (var k in src) {
            dest[k] = src[k];
        }
    }
    return dest;
};
exports.pick = function (src, properties) {
    var result = {};
    for (var i = 0; i < properties.length; i++) {
        var k = properties[i];
        if (k in src) {
            result[k] = src[k];
        }
    }
    return result;
};
var id = 1;
exports.uniqueId = function () {
    return id++;
};
exports.bindAll = function (fns, context) {
    fns.forEach(function (fn) {
        if (!context[fn]) {
            return;
        }
        context[fn] = context[fn].bind(context);
    });
};
exports.getCoordinatesCenter = function (coords) {
    var minX = Infinity;
    var minY = Infinity;
    var maxX = -Infinity;
    var maxY = -Infinity;
    for (var i = 0; i < coords.length; i++) {
        minX = Math.min(minX, coords[i].column);
        minY = Math.min(minY, coords[i].row);
        maxX = Math.max(maxX, coords[i].column);
        maxY = Math.max(maxY, coords[i].row);
    }
    var dx = maxX - minX;
    var dy = maxY - minY;
    var dMax = Math.max(dx, dy);
    return new Coordinate((minX + maxX) / 2, (minY + maxY) / 2, 0).zoomTo(Math.floor(-Math.log(dMax) / Math.LN2));
};
exports.endsWith = function (string, suffix) {
    return string.indexOf(suffix, string.length - suffix.length) !== -1;
};
exports.mapObject = function (input, iterator, context) {
    var this$1 = this;
    var output = {};
    for (var key in input) {
        output[key] = iterator.call(context || this$1, input[key], key, input);
    }
    return output;
};
exports.filterObject = function (input, iterator, context) {
    var this$1 = this;
    var output = {};
    for (var key in input) {
        if (iterator.call(context || this$1, input[key], key, input)) {
            output[key] = input[key];
        }
    }
    return output;
};
exports.deepEqual = function (a, b) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length)
            return false;
        for (var i = 0; i < a.length; i++) {
            if (!exports.deepEqual(a[i], b[i]))
                return false;
        }
        return true;
    }
    if (typeof a === 'object' && a !== null && b !== null) {
        if (!(typeof b === 'object'))
            return false;
        var keys = Object.keys(a);
        if (keys.length !== Object.keys(b).length)
            return false;
        for (var key in a) {
            if (!exports.deepEqual(a[key], b[key]))
                return false;
        }
        return true;
    }
    return a === b;
};
exports.clone = function (input) {
    if (Array.isArray(input)) {
        return input.map(exports.clone);
    } else if (typeof input === 'object' && input) {
        return exports.mapObject(input, exports.clone);
    } else {
        return input;
    }
};
exports.arraysIntersect = function (a, b) {
    for (var l = 0; l < a.length; l++) {
        if (b.indexOf(a[l]) >= 0)
            return true;
    }
    return false;
};
var warnOnceHistory = {};
exports.warnOnce = function (message) {
    if (!warnOnceHistory[message]) {
        if (typeof console !== 'undefined')
            console.warn(message);
        warnOnceHistory[message] = true;
    }
};
exports.isCounterClockwise = function (a, b, c) {
    return (c.y - a.y) * (b.x - a.x) > (b.y - a.y) * (c.x - a.x);
};
exports.calculateSignedArea = function (ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
};
exports.isClosedPolygon = function (points) {
    if (points.length < 4)
        return false;
    var p1 = points[0];
    var p2 = points[points.length - 1];
    if (Math.abs(p1.x - p2.x) > 0 || Math.abs(p1.y - p2.y) > 0) {
        return false;
    }
    return Math.abs(exports.calculateSignedArea(points)) > 0.01;
};
exports.sphericalToCartesian = function (spherical) {
    var r = spherical[0];
    var azimuthal = spherical[1], polar = spherical[2];
    azimuthal += 90;
    azimuthal *= Math.PI / 180;
    polar *= Math.PI / 180;
    return [
        r * Math.cos(azimuthal) * Math.sin(polar),
        r * Math.sin(azimuthal) * Math.sin(polar),
        r * Math.cos(polar)
    ];
};
},{"../geo/coordinate":88,"point-geometry":204,"unitbezier":209}],198:[function(require,module,exports){
'use strict';
var Feature = function Feature(vectorTileFeature, z, x, y) {
    this.type = 'Feature';
    this._vectorTileFeature = vectorTileFeature;
    vectorTileFeature._z = z;
    vectorTileFeature._x = x;
    vectorTileFeature._y = y;
    this.properties = vectorTileFeature.properties;
    if (vectorTileFeature.id != null) {
        this.id = vectorTileFeature.id;
    }
};
var prototypeAccessors = { geometry: {} };
prototypeAccessors.geometry.get = function () {
    if (this._geometry === undefined) {
        this._geometry = this._vectorTileFeature.toGeoJSON(this._vectorTileFeature._x, this._vectorTileFeature._y, this._vectorTileFeature._z).geometry;
    }
    return this._geometry;
};
prototypeAccessors.geometry.set = function (g) {
    this._geometry = g;
};
Feature.prototype.toJSON = function toJSON() {
    var this$1 = this;
    var json = { geometry: this.geometry };
    for (var i in this) {
        if (i === '_geometry' || i === '_vectorTileFeature')
            continue;
        json[i] = this$1[i];
    }
    return json;
};
Object.defineProperties(Feature.prototype, prototypeAccessors);
module.exports = Feature;
},{}],199:[function(require,module,exports){
'use strict';
var scriptDetection = require('./script_detection');
module.exports = function verticalizePunctuation(input) {
    var output = '';
    for (var i = 0; i < input.length; i++) {
        var nextCharCode = input.charCodeAt(i + 1) || null;
        var prevCharCode = input.charCodeAt(i - 1) || null;
        var canReplacePunctuation = (!nextCharCode || !scriptDetection.charHasRotatedVerticalOrientation(nextCharCode) || module.exports.lookup[input[i + 1]]) && (!prevCharCode || !scriptDetection.charHasRotatedVerticalOrientation(prevCharCode) || module.exports.lookup[input[i - 1]]);
        if (canReplacePunctuation && module.exports.lookup[input[i]]) {
            output += module.exports.lookup[input[i]];
        } else {
            output += input[i];
        }
    }
    return output;
};
module.exports.lookup = {
    '!': '\uFE15',
    '#': '\uFF03',
    '$': '\uFF04',
    '%': '\uFF05',
    '&': '\uFF06',
    '(': '\uFE35',
    ')': '\uFE36',
    '*': '\uFF0A',
    '+': '\uFF0B',
    ',': '\uFE10',
    '-': '\uFE32',
    '.': '\u30FB',
    '/': '\uFF0F',
    ':': '\uFE13',
    ';': '\uFE14',
    '<': '\uFE3F',
    '=': '\uFF1D',
    '>': '\uFE40',
    '?': '\uFE16',
    '@': '\uFF20',
    '[': '\uFE47',
    '\\': '\uFF3C',
    ']': '\uFE48',
    '^': '\uFF3E',
    '_': '︳',
    '`': '\uFF40',
    '{': '\uFE37',
    '|': '\u2015',
    '}': '\uFE38',
    '~': '\uFF5E',
    '\xA2': '\uFFE0',
    '\xA3': '\uFFE1',
    '\xA5': '\uFFE5',
    '\xA6': '\uFFE4',
    '\xAC': '\uFFE2',
    '\xAF': '\uFFE3',
    '\u2013': '\uFE32',
    '\u2014': '\uFE31',
    '\u2018': '\uFE43',
    '\u2019': '\uFE44',
    '\u201C': '\uFE41',
    '\u201D': '\uFE42',
    '\u2026': '\uFE19',
    '\u2027': '\u30FB',
    '\u20A9': '\uFFE6',
    '\u3001': '\uFE11',
    '\u3002': '\uFE12',
    '\u3008': '\uFE3F',
    '\u3009': '\uFE40',
    '\u300A': '\uFE3D',
    '\u300B': '\uFE3E',
    '\u300C': '\uFE41',
    '\u300D': '\uFE42',
    '\u300E': '\uFE43',
    '\u300F': '\uFE44',
    '\u3010': '\uFE3B',
    '\u3011': '\uFE3C',
    '\u3014': '\uFE39',
    '\u3015': '\uFE3A',
    '\u3016': '\uFE17',
    '\u3017': '\uFE18',
    '\uFF01': '\uFE15',
    '\uFF08': '\uFE35',
    '\uFF09': '\uFE36',
    '\uFF0C': '\uFE10',
    '\uFF0D': '\uFE32',
    '\uFF0E': '\u30FB',
    '\uFF1A': '\uFE13',
    '\uFF1B': '\uFE14',
    '\uFF1C': '\uFE3F',
    '\uFF1E': '\uFE40',
    '\uFF1F': '\uFE16',
    '\uFF3B': '\uFE47',
    '\uFF3D': '\uFE48',
    '＿': '︳',
    '\uFF5B': '\uFE37',
    '\uFF5C': '\u2015',
    '\uFF5D': '\uFE38',
    '\uFF5F': '\uFE35',
    '\uFF60': '\uFE36',
    '\uFF61': '\uFE12',
    '\uFF62': '\uFE41',
    '\uFF63': '\uFE42'
};
},{"./script_detection":194}],200:[function(require,module,exports){
'use strict';
var WebWorker = require('./web_worker');
var WorkerPool = function WorkerPool() {
    this.active = {};
};
WorkerPool.prototype.acquire = function acquire(mapId) {
    var this$1 = this;
    if (!this.workers) {
        var workerCount = require('../mapbox-gl').workerCount;
        this.workers = [];
        while (this.workers.length < workerCount) {
            this$1.workers.push(new WebWorker());
        }
    }
    this.active[mapId] = true;
    return this.workers.slice();
};
WorkerPool.prototype.release = function release(mapId) {
    delete this.active[mapId];
    if (Object.keys(this.active).length === 0) {
        this.workers.forEach(function (w) {
            w.terminate();
        });
        this.workers = null;
    }
};
module.exports = WorkerPool;
},{"../mapbox-gl":94,"./web_worker":179}],201:[function(require,module,exports){
module.exports={
  "version": "0.30.0"
}
},{}],202:[function(require,module,exports){
'use strict';

// lightweight Buffer shim for pbf browser build
// based on code from github.com/feross/buffer (MIT-licensed)

module.exports = Buffer;

var ieee754 = require('ieee754');

var BufferMethods;

function Buffer(length) {
    var arr;
    if (length && length.length) {
        arr = length;
        length = arr.length;
    }
    var buf = new Uint8Array(length || 0);
    if (arr) buf.set(arr);

    buf.readUInt32LE = BufferMethods.readUInt32LE;
    buf.writeUInt32LE = BufferMethods.writeUInt32LE;
    buf.readInt32LE = BufferMethods.readInt32LE;
    buf.writeInt32LE = BufferMethods.writeInt32LE;
    buf.readFloatLE = BufferMethods.readFloatLE;
    buf.writeFloatLE = BufferMethods.writeFloatLE;
    buf.readDoubleLE = BufferMethods.readDoubleLE;
    buf.writeDoubleLE = BufferMethods.writeDoubleLE;
    buf.toString = BufferMethods.toString;
    buf.write = BufferMethods.write;
    buf.slice = BufferMethods.slice;
    buf.copy = BufferMethods.copy;

    buf._isBuffer = true;
    return buf;
}

var lastStr, lastStrEncoded;

BufferMethods = {
    readUInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] * 0x1000000);
    },

    writeUInt32LE: function(val, pos) {
        this[pos] = val;
        this[pos + 1] = (val >>> 8);
        this[pos + 2] = (val >>> 16);
        this[pos + 3] = (val >>> 24);
    },

    readInt32LE: function(pos) {
        return ((this[pos]) |
            (this[pos + 1] << 8) |
            (this[pos + 2] << 16)) +
            (this[pos + 3] << 24);
    },

    readFloatLE:  function(pos) { return ieee754.read(this, pos, true, 23, 4); },
    readDoubleLE: function(pos) { return ieee754.read(this, pos, true, 52, 8); },

    writeFloatLE:  function(val, pos) { return ieee754.write(this, val, pos, true, 23, 4); },
    writeDoubleLE: function(val, pos) { return ieee754.write(this, val, pos, true, 52, 8); },

    toString: function(encoding, start, end) {
        var str = '',
            tmp = '';

        start = start || 0;
        end = Math.min(this.length, end || this.length);

        for (var i = start; i < end; i++) {
            var ch = this[i];
            if (ch <= 0x7F) {
                str += decodeURIComponent(tmp) + String.fromCharCode(ch);
                tmp = '';
            } else {
                tmp += '%' + ch.toString(16);
            }
        }

        str += decodeURIComponent(tmp);

        return str;
    },

    write: function(str, pos) {
        var bytes = str === lastStr ? lastStrEncoded : encodeString(str);
        for (var i = 0; i < bytes.length; i++) {
            this[pos + i] = bytes[i];
        }
    },

    slice: function(start, end) {
        return this.subarray(start, end);
    },

    copy: function(buf, pos) {
        pos = pos || 0;
        for (var i = 0; i < this.length; i++) {
            buf[pos + i] = this[i];
        }
    }
};

BufferMethods.writeInt32LE = BufferMethods.writeUInt32LE;

Buffer.byteLength = function(str) {
    lastStr = str;
    lastStrEncoded = encodeString(str);
    return lastStrEncoded.length;
};

Buffer.isBuffer = function(buf) {
    return !!(buf && buf._isBuffer);
};

function encodeString(str) {
    var length = str.length,
        bytes = [];

    for (var i = 0, c, lead; i < length; i++) {
        c = str.charCodeAt(i); // code point

        if (c > 0xD7FF && c < 0xE000) {

            if (lead) {
                if (c < 0xDC00) {
                    bytes.push(0xEF, 0xBF, 0xBD);
                    lead = c;
                    continue;

                } else {
                    c = lead - 0xD800 << 10 | c - 0xDC00 | 0x10000;
                    lead = null;
                }

            } else {
                if (c > 0xDBFF || (i + 1 === length)) bytes.push(0xEF, 0xBF, 0xBD);
                else lead = c;

                continue;
            }

        } else if (lead) {
            bytes.push(0xEF, 0xBF, 0xBD);
            lead = null;
        }

        if (c < 0x80) bytes.push(c);
        else if (c < 0x800) bytes.push(c >> 0x6 | 0xC0, c & 0x3F | 0x80);
        else if (c < 0x10000) bytes.push(c >> 0xC | 0xE0, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
        else bytes.push(c >> 0x12 | 0xF0, c >> 0xC & 0x3F | 0x80, c >> 0x6 & 0x3F | 0x80, c & 0x3F | 0x80);
    }
    return bytes;
}

},{"ieee754":27}],203:[function(require,module,exports){
(function (global){
'use strict';

module.exports = Pbf;

var Buffer = global.Buffer || require('./buffer');

function Pbf(buf) {
    this.buf = !Buffer.isBuffer(buf) ? new Buffer(buf || 0) : buf;
    this.pos = 0;
    this.length = this.buf.length;
}

Pbf.Varint  = 0; // varint: int32, int64, uint32, uint64, sint32, sint64, bool, enum
Pbf.Fixed64 = 1; // 64-bit: double, fixed64, sfixed64
Pbf.Bytes   = 2; // length-delimited: string, bytes, embedded messages, packed repeated fields
Pbf.Fixed32 = 5; // 32-bit: float, fixed32, sfixed32

var SHIFT_LEFT_32 = (1 << 16) * (1 << 16),
    SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32,
    POW_2_63 = Math.pow(2, 63);

Pbf.prototype = {

    destroy: function() {
        this.buf = null;
    },

    // === READING =================================================================

    readFields: function(readField, result, end) {
        end = end || this.length;

        while (this.pos < end) {
            var val = this.readVarint(),
                tag = val >> 3,
                startPos = this.pos;

            readField(tag, result, this);

            if (this.pos === startPos) this.skip(val);
        }
        return result;
    },

    readMessage: function(readField, result) {
        return this.readFields(readField, result, this.readVarint() + this.pos);
    },

    readFixed32: function() {
        var val = this.buf.readUInt32LE(this.pos);
        this.pos += 4;
        return val;
    },

    readSFixed32: function() {
        var val = this.buf.readInt32LE(this.pos);
        this.pos += 4;
        return val;
    },

    // 64-bit int handling is based on github.com/dpw/node-buffer-more-ints (MIT-licensed)

    readFixed64: function() {
        var val = this.buf.readUInt32LE(this.pos) + this.buf.readUInt32LE(this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readSFixed64: function() {
        var val = this.buf.readUInt32LE(this.pos) + this.buf.readInt32LE(this.pos + 4) * SHIFT_LEFT_32;
        this.pos += 8;
        return val;
    },

    readFloat: function() {
        var val = this.buf.readFloatLE(this.pos);
        this.pos += 4;
        return val;
    },

    readDouble: function() {
        var val = this.buf.readDoubleLE(this.pos);
        this.pos += 8;
        return val;
    },

    readVarint: function() {
        var buf = this.buf,
            val, b;

        b = buf[this.pos++]; val  =  b & 0x7f;        if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 7;  if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 14; if (b < 0x80) return val;
        b = buf[this.pos++]; val |= (b & 0x7f) << 21; if (b < 0x80) return val;

        return readVarintRemainder(val, this);
    },

    readVarint64: function() {
        var startPos = this.pos,
            val = this.readVarint();

        if (val < POW_2_63) return val;

        var pos = this.pos - 2;
        while (this.buf[pos] === 0xff) pos--;
        if (pos < startPos) pos = startPos;

        val = 0;
        for (var i = 0; i < pos - startPos + 1; i++) {
            var b = ~this.buf[startPos + i] & 0x7f;
            val += i < 4 ? b << i * 7 : b * Math.pow(2, i * 7);
        }

        return -val - 1;
    },

    readSVarint: function() {
        var num = this.readVarint();
        return num % 2 === 1 ? (num + 1) / -2 : num / 2; // zigzag encoding
    },

    readBoolean: function() {
        return Boolean(this.readVarint());
    },

    readString: function() {
        var end = this.readVarint() + this.pos,
            str = this.buf.toString('utf8', this.pos, end);
        this.pos = end;
        return str;
    },

    readBytes: function() {
        var end = this.readVarint() + this.pos,
            buffer = this.buf.slice(this.pos, end);
        this.pos = end;
        return buffer;
    },

    // verbose for performance reasons; doesn't affect gzipped size

    readPackedVarint: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readVarint());
        return arr;
    },
    readPackedSVarint: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSVarint());
        return arr;
    },
    readPackedBoolean: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readBoolean());
        return arr;
    },
    readPackedFloat: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFloat());
        return arr;
    },
    readPackedDouble: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readDouble());
        return arr;
    },
    readPackedFixed32: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFixed32());
        return arr;
    },
    readPackedSFixed32: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSFixed32());
        return arr;
    },
    readPackedFixed64: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readFixed64());
        return arr;
    },
    readPackedSFixed64: function() {
        var end = this.readVarint() + this.pos, arr = [];
        while (this.pos < end) arr.push(this.readSFixed64());
        return arr;
    },

    skip: function(val) {
        var type = val & 0x7;
        if (type === Pbf.Varint) while (this.buf[this.pos++] > 0x7f) {}
        else if (type === Pbf.Bytes) this.pos = this.readVarint() + this.pos;
        else if (type === Pbf.Fixed32) this.pos += 4;
        else if (type === Pbf.Fixed64) this.pos += 8;
        else throw new Error('Unimplemented type: ' + type);
    },

    // === WRITING =================================================================

    writeTag: function(tag, type) {
        this.writeVarint((tag << 3) | type);
    },

    realloc: function(min) {
        var length = this.length || 16;

        while (length < this.pos + min) length *= 2;

        if (length !== this.length) {
            var buf = new Buffer(length);
            this.buf.copy(buf);
            this.buf = buf;
            this.length = length;
        }
    },

    finish: function() {
        this.length = this.pos;
        this.pos = 0;
        return this.buf.slice(0, this.length);
    },

    writeFixed32: function(val) {
        this.realloc(4);
        this.buf.writeUInt32LE(val, this.pos);
        this.pos += 4;
    },

    writeSFixed32: function(val) {
        this.realloc(4);
        this.buf.writeInt32LE(val, this.pos);
        this.pos += 4;
    },

    writeFixed64: function(val) {
        this.realloc(8);
        this.buf.writeInt32LE(val & -1, this.pos);
        this.buf.writeUInt32LE(Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeSFixed64: function(val) {
        this.realloc(8);
        this.buf.writeInt32LE(val & -1, this.pos);
        this.buf.writeInt32LE(Math.floor(val * SHIFT_RIGHT_32), this.pos + 4);
        this.pos += 8;
    },

    writeVarint: function(val) {
        val = +val;

        if (val > 0xfffffff) {
            writeBigVarint(val, this);
            return;
        }

        this.realloc(4);

        this.buf[this.pos++] =           val & 0x7f  | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] = ((val >>>= 7) & 0x7f) | (val > 0x7f ? 0x80 : 0); if (val <= 0x7f) return;
        this.buf[this.pos++] =   (val >>> 7) & 0x7f;
    },

    writeSVarint: function(val) {
        this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
    },

    writeBoolean: function(val) {
        this.writeVarint(Boolean(val));
    },

    writeString: function(str) {
        str = String(str);
        var bytes = Buffer.byteLength(str);
        this.writeVarint(bytes);
        this.realloc(bytes);
        this.buf.write(str, this.pos);
        this.pos += bytes;
    },

    writeFloat: function(val) {
        this.realloc(4);
        this.buf.writeFloatLE(val, this.pos);
        this.pos += 4;
    },

    writeDouble: function(val) {
        this.realloc(8);
        this.buf.writeDoubleLE(val, this.pos);
        this.pos += 8;
    },

    writeBytes: function(buffer) {
        var len = buffer.length;
        this.writeVarint(len);
        this.realloc(len);
        for (var i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
    },

    writeRawMessage: function(fn, obj) {
        this.pos++; // reserve 1 byte for short message length

        // write the message directly to the buffer and see how much was written
        var startPos = this.pos;
        fn(obj, this);
        var len = this.pos - startPos;

        if (len >= 0x80) reallocForRawMessage(startPos, len, this);

        // finally, write the message length in the reserved place and restore the position
        this.pos = startPos - 1;
        this.writeVarint(len);
        this.pos += len;
    },

    writeMessage: function(tag, fn, obj) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeRawMessage(fn, obj);
    },

    writePackedVarint:   function(tag, arr) { this.writeMessage(tag, writePackedVarint, arr);   },
    writePackedSVarint:  function(tag, arr) { this.writeMessage(tag, writePackedSVarint, arr);  },
    writePackedBoolean:  function(tag, arr) { this.writeMessage(tag, writePackedBoolean, arr);  },
    writePackedFloat:    function(tag, arr) { this.writeMessage(tag, writePackedFloat, arr);    },
    writePackedDouble:   function(tag, arr) { this.writeMessage(tag, writePackedDouble, arr);   },
    writePackedFixed32:  function(tag, arr) { this.writeMessage(tag, writePackedFixed32, arr);  },
    writePackedSFixed32: function(tag, arr) { this.writeMessage(tag, writePackedSFixed32, arr); },
    writePackedFixed64:  function(tag, arr) { this.writeMessage(tag, writePackedFixed64, arr);  },
    writePackedSFixed64: function(tag, arr) { this.writeMessage(tag, writePackedSFixed64, arr); },

    writeBytesField: function(tag, buffer) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeBytes(buffer);
    },
    writeFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFixed32(val);
    },
    writeSFixed32Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeSFixed32(val);
    },
    writeFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeFixed64(val);
    },
    writeSFixed64Field: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeSFixed64(val);
    },
    writeVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeVarint(val);
    },
    writeSVarintField: function(tag, val) {
        this.writeTag(tag, Pbf.Varint);
        this.writeSVarint(val);
    },
    writeStringField: function(tag, str) {
        this.writeTag(tag, Pbf.Bytes);
        this.writeString(str);
    },
    writeFloatField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed32);
        this.writeFloat(val);
    },
    writeDoubleField: function(tag, val) {
        this.writeTag(tag, Pbf.Fixed64);
        this.writeDouble(val);
    },
    writeBooleanField: function(tag, val) {
        this.writeVarintField(tag, Boolean(val));
    }
};

function readVarintRemainder(val, pbf) {
    var buf = pbf.buf, b;

    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x10000000;         if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x800000000;        if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x40000000000;      if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x2000000000000;    if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x100000000000000;  if (b < 0x80) return val;
    b = buf[pbf.pos++]; val += (b & 0x7f) * 0x8000000000000000; if (b < 0x80) return val;

    throw new Error('Expected varint not more than 10 bytes');
}

function writeBigVarint(val, pbf) {
    pbf.realloc(10);

    var maxPos = pbf.pos + 10;

    while (val >= 1) {
        if (pbf.pos >= maxPos) throw new Error('Given varint doesn\'t fit into 10 bytes');
        var b = val & 0xff;
        pbf.buf[pbf.pos++] = b | (val >= 0x80 ? 0x80 : 0);
        val /= 0x80;
    }
}

function reallocForRawMessage(startPos, len, pbf) {
    var extraLen =
        len <= 0x3fff ? 1 :
        len <= 0x1fffff ? 2 :
        len <= 0xfffffff ? 3 : Math.ceil(Math.log(len) / (Math.LN2 * 7));

    // if 1 byte isn't enough for encoding message length, shift the data to the right
    pbf.realloc(extraLen);
    for (var i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}

function writePackedVarint(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);   }
function writePackedSVarint(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);  }
function writePackedFloat(arr, pbf)    { for (var i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);    }
function writePackedDouble(arr, pbf)   { for (var i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);   }
function writePackedBoolean(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);  }
function writePackedFixed32(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);  }
function writePackedSFixed32(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]); }
function writePackedFixed64(arr, pbf)  { for (var i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);  }
function writePackedSFixed64(arr, pbf) { for (var i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]); }

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{"./buffer":202}],204:[function(require,module,exports){
'use strict';

module.exports = Point;

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype = {
    clone: function() { return new Point(this.x, this.y); },

    add:     function(p) { return this.clone()._add(p);     },
    sub:     function(p) { return this.clone()._sub(p);     },
    mult:    function(k) { return this.clone()._mult(k);    },
    div:     function(k) { return this.clone()._div(k);     },
    rotate:  function(a) { return this.clone()._rotate(a);  },
    matMult: function(m) { return this.clone()._matMult(m); },
    unit:    function() { return this.clone()._unit(); },
    perp:    function() { return this.clone()._perp(); },
    round:   function() { return this.clone()._round(); },

    mag: function() {
        return Math.sqrt(this.x * this.x + this.y * this.y);
    },

    equals: function(p) {
        return this.x === p.x &&
               this.y === p.y;
    },

    dist: function(p) {
        return Math.sqrt(this.distSqr(p));
    },

    distSqr: function(p) {
        var dx = p.x - this.x,
            dy = p.y - this.y;
        return dx * dx + dy * dy;
    },

    angle: function() {
        return Math.atan2(this.y, this.x);
    },

    angleTo: function(b) {
        return Math.atan2(this.y - b.y, this.x - b.x);
    },

    angleWith: function(b) {
        return this.angleWithSep(b.x, b.y);
    },

    // Find the angle of the two vectors, solving the formula for the cross product a x b = |a||b|sin(θ) for θ.
    angleWithSep: function(x, y) {
        return Math.atan2(
            this.x * y - this.y * x,
            this.x * x + this.y * y);
    },

    _matMult: function(m) {
        var x = m[0] * this.x + m[1] * this.y,
            y = m[2] * this.x + m[3] * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _add: function(p) {
        this.x += p.x;
        this.y += p.y;
        return this;
    },

    _sub: function(p) {
        this.x -= p.x;
        this.y -= p.y;
        return this;
    },

    _mult: function(k) {
        this.x *= k;
        this.y *= k;
        return this;
    },

    _div: function(k) {
        this.x /= k;
        this.y /= k;
        return this;
    },

    _unit: function() {
        this._div(this.mag());
        return this;
    },

    _perp: function() {
        var y = this.y;
        this.y = this.x;
        this.x = -y;
        return this;
    },

    _rotate: function(angle) {
        var cos = Math.cos(angle),
            sin = Math.sin(angle),
            x = cos * this.x - sin * this.y,
            y = sin * this.x + cos * this.y;
        this.x = x;
        this.y = y;
        return this;
    },

    _round: function() {
        this.x = Math.round(this.x);
        this.y = Math.round(this.y);
        return this;
    }
};

// constructs Point from an array if necessary
Point.convert = function (a) {
    if (a instanceof Point) {
        return a;
    }
    if (Array.isArray(a)) {
        return new Point(a[0], a[1]);
    }
    return a;
};

},{}],205:[function(require,module,exports){
'use strict';

module.exports = partialSort;

// Floyd-Rivest selection algorithm:
// Rearrange items so that all items in the [left, k] range are smaller than all items in (k, right];
// The k-th element will have the (k - left + 1)th smallest value in [left, right]

function partialSort(arr, k, left, right, compare) {
    left = left || 0;
    right = right || (arr.length - 1);
    compare = compare || defaultCompare;

    while (right > left) {
        if (right - left > 600) {
            var n = right - left + 1;
            var m = k - left + 1;
            var z = Math.log(n);
            var s = 0.5 * Math.exp(2 * z / 3);
            var sd = 0.5 * Math.sqrt(z * s * (n - s) / n) * (m - n / 2 < 0 ? -1 : 1);
            var newLeft = Math.max(left, Math.floor(k - m * s / n + sd));
            var newRight = Math.min(right, Math.floor(k + (n - m) * s / n + sd));
            partialSort(arr, k, newLeft, newRight, compare);
        }

        var t = arr[k];
        var i = left;
        var j = right;

        swap(arr, left, k);
        if (compare(arr[right], t) > 0) swap(arr, left, right);

        while (i < j) {
            swap(arr, i, j);
            i++;
            j--;
            while (compare(arr[i], t) < 0) i++;
            while (compare(arr[j], t) > 0) j--;
        }

        if (compare(arr[left], t) === 0) swap(arr, left, j);
        else {
            j++;
            swap(arr, j, right);
        }

        if (j <= k) left = j + 1;
        if (k <= j) right = j - 1;
    }
}

function swap(arr, i, j) {
    var tmp = arr[i];
    arr[i] = arr[j];
    arr[j] = tmp;
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

},{}],206:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.ShelfPack = factory());
}(this, function () {

/**
 * Create a new ShelfPack bin allocator.
 *
 * Uses the Shelf Best Height Fit algorithm from
 * http://clb.demon.fi/files/RectangleBinPack.pdf
 *
 * @class  ShelfPack
 * @param  {number}  [w=64]  Initial width of the sprite
 * @param  {number}  [h=64]  Initial width of the sprite
 * @param  {Object}  [options]
 * @param  {boolean} [options.autoResize=false]  If `true`, the sprite will automatically grow
 * @example
 * var sprite = new ShelfPack(64, 64, { autoResize: false });
 */
function ShelfPack(w, h, options) {
    options = options || {};
    this.w = w || 64;
    this.h = h || 64;
    this.autoResize = !!options.autoResize;
    this.shelves = [];
    this.stats = {};
    this.count = function(h) {
        this.stats[h] = (this.stats[h] | 0) + 1;
    };
}

/**
 * Batch pack multiple bins into the sprite.
 *
 * @param   {Array}   bins Array of requested bins - each object should have `width`, `height` (or `w`, `h`) properties
 * @param   {Object}  [options]
 * @param   {boolean} [options.inPlace=false] If `true`, the supplied bin objects will be updated inplace with `x` and `y` properties
 * @returns {Array}   Array of allocated bins - each bin is an object with `x`, `y`, `w`, `h` properties
 * @example
 * var bins = [
 *     { id: 'a', width: 12, height: 12 },
 *     { id: 'b', width: 12, height: 16 },
 *     { id: 'c', width: 12, height: 24 }
 * ];
 * var results = sprite.pack(bins, { inPlace: false });
 */
ShelfPack.prototype.pack = function(bins, options) {
    bins = [].concat(bins);
    options = options || {};

    var results = [],
        w, h, allocation;

    for (var i = 0; i < bins.length; i++) {
        w = bins[i].w || bins[i].width;
        h = bins[i].h || bins[i].height;
        if (w && h) {
            allocation = this.packOne(w, h);
            if (!allocation) {
                continue;
            }
            if (options.inPlace) {
                bins[i].x = allocation.x;
                bins[i].y = allocation.y;
            }
            results.push(allocation);
        }
    }

    // Shrink the width/height of the sprite to the bare minimum.
    // Since shelf-pack doubles first width, then height when running out of shelf space
    // this can result in fairly large unused space both in width and height if that happens
    // towards the end of bin packing.
    if (this.shelves.length > 0) {
        var w2 = 0;
        var h2 = 0;

        for (var j = 0; j < this.shelves.length; j++) {
            var shelf = this.shelves[j];
            h2 += shelf.h;
            w2 = Math.max(shelf.w - shelf.free, w2);
        }

        this.resize(w2, h2);
    }

    return results;
};

/**
 * Pack a single bin into the sprite.
 *
 * @param   {number}  w   Width of the bin to allocate
 * @param   {number}  h   Height of the bin to allocate
 * @returns {Object}  Allocated bin object with `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * var results = sprite.packOne(12, 16);
 */
ShelfPack.prototype.packOne = function(w, h) {
    var y = 0,
        best = { shelf: -1, waste: Infinity },
        shelf, waste;

    // find the best shelf
    for (var i = 0; i < this.shelves.length; i++) {
        shelf = this.shelves[i];
        y += shelf.h;

        // exactly the right height with width to spare, pack it..
        if (h === shelf.h && w <= shelf.free) {
            this.count(h);
            return shelf.alloc(w, h);
        }
        // not enough height or width, skip it..
        if (h > shelf.h || w > shelf.free) {
            continue;
        }
        // maybe enough height or width, minimize waste..
        if (h < shelf.h && w <= shelf.free) {
            waste = shelf.h - h;
            if (waste < best.waste) {
                best.waste = waste;
                best.shelf = i;
            }
        }
    }

    if (best.shelf !== -1) {
        shelf = this.shelves[best.shelf];
        this.count(h);
        return shelf.alloc(w, h);
    }

    // add shelf..
    if (h <= (this.h - y) && w <= this.w) {
        shelf = new Shelf(y, this.w, h);
        this.shelves.push(shelf);
        this.count(h);
        return shelf.alloc(w, h);
    }

    // no more space..
    // If `autoResize` option is set, grow the sprite as follows:
    //  * double whichever sprite dimension is smaller (`w1` or `h1`)
    //  * if sprite dimensions are equal, grow width before height
    //  * accomodate very large bin requests (big `w` or `h`)
    if (this.autoResize) {
        var h1, h2, w1, w2;

        h1 = h2 = this.h;
        w1 = w2 = this.w;

        if (w1 <= h1 || w > w1) {   // grow width..
            w2 = Math.max(w, w1) * 2;
        }
        if (h1 < w1 || h > h1) {    // grow height..
            h2 = Math.max(h, h1) * 2;
        }

        this.resize(w2, h2);
        return this.packOne(w, h);  // retry
    }

    return null;
};

/**
 * Clear the sprite.
 *
 * @example
 * sprite.clear();
 */
ShelfPack.prototype.clear = function() {
    this.shelves = [];
    this.stats = {};
};

/**
 * Resize the sprite.
 *
 * @param   {number}  w  Requested new sprite width
 * @param   {number}  h  Requested new sprite height
 * @returns {boolean} `true` if resize succeeded, `false` if failed
 * @example
 * sprite.resize(256, 256);
 */
ShelfPack.prototype.resize = function(w, h) {
    this.w = w;
    this.h = h;
    for (var i = 0; i < this.shelves.length; i++) {
        this.shelves[i].resize(w);
    }
    return true;
};



/**
 * Create a new Shelf.
 *
 * @private
 * @class  Shelf
 * @param  {number}  y   Top coordinate of the new shelf
 * @param  {number}  w   Width of the new shelf
 * @param  {number}  h   Height of the new shelf
 * @example
 * var shelf = new Shelf(64, 512, 24);
 */
function Shelf(y, w, h) {
    this.x = 0;
    this.y = y;
    this.w = this.free = w;
    this.h = h;
}

/**
 * Allocate a single bin into the shelf.
 *
 * @private
 * @param   {number}  w   Width of the bin to allocate
 * @param   {number}  h   Height of the bin to allocate
 * @returns {Object}  Allocated bin object with `x`, `y`, `w`, `h` properties, or `null` if allocation failed
 * @example
 * shelf.alloc(12, 16);
 */
Shelf.prototype.alloc = function(w, h) {
    if (w > this.free || h > this.h) {
        return null;
    }
    var x = this.x;
    this.x += w;
    this.free -= w;
    return { x: x, y: this.y, w: w, h: h, width: w, height: h };
};

/**
 * Resize the shelf.
 *
 * @private
 * @param   {number}  w  Requested new width of the shelf
 * @returns {boolean} true if resize succeeded, false if failed
 * @example
 * shelf.resize(512);
 */
Shelf.prototype.resize = function(w) {
    this.free += (w - this.w);
    this.w = w;
    return true;
};

return ShelfPack;

}));
},{}],207:[function(require,module,exports){
'use strict';

var kdbush = require('kdbush');

module.exports = supercluster;

function supercluster(options) {
    return new SuperCluster(options);
}

function SuperCluster(options) {
    this.options = extend(Object.create(this.options), options);
    this.trees = new Array(this.options.maxZoom + 1);
}

SuperCluster.prototype = {
    options: {
        minZoom: 0,   // min zoom to generate clusters on
        maxZoom: 16,  // max zoom level to cluster the points on
        radius: 40,   // cluster radius in pixels
        extent: 512,  // tile extent (radius is calculated relative to it)
        nodeSize: 64, // size of the KD-tree leaf node, affects performance
        log: false    // whether to log timing info
    },

    load: function (points) {
        var log = this.options.log;

        if (log) console.time('total time');

        var timerId = 'prepare ' + points.length + ' points';
        if (log) console.time(timerId);

        this.points = points;

        // generate a cluster object for each point
        var clusters = points.map(createPointCluster);
        if (log) console.timeEnd(timerId);

        // cluster points on max zoom, then cluster the results on previous zoom, etc.;
        // results in a cluster hierarchy across zoom levels
        for (var z = this.options.maxZoom; z >= this.options.minZoom; z--) {
            var now = +Date.now();

            // index input points into a KD-tree
            this.trees[z + 1] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

            clusters = this._cluster(clusters, z); // create a new set of clusters for the zoom

            if (log) console.log('z%d: %d clusters in %dms', z, clusters.length, +Date.now() - now);
        }

        // index top-level clusters
        this.trees[this.options.minZoom] = kdbush(clusters, getX, getY, this.options.nodeSize, Float32Array);

        if (log) console.timeEnd('total time');

        return this;
    },

    getClusters: function (bbox, zoom) {
        var tree = this.trees[this._limitZoom(zoom)];
        var ids = tree.range(lngX(bbox[0]), latY(bbox[3]), lngX(bbox[2]), latY(bbox[1]));
        var clusters = [];
        for (var i = 0; i < ids.length; i++) {
            var c = tree.points[ids[i]];
            clusters.push(c.id !== -1 ? this.points[c.id] : getClusterJSON(c));
        }
        return clusters;
    },

    getTile: function (z, x, y) {
        var tree = this.trees[this._limitZoom(z)];
        var z2 = Math.pow(2, z);
        var extent = this.options.extent;
        var r = this.options.radius;
        var p = r / extent;
        var top = (y - p) / z2;
        var bottom = (y + 1 + p) / z2;

        var tile = {
            features: []
        };

        this._addTileFeatures(
            tree.range((x - p) / z2, top, (x + 1 + p) / z2, bottom),
            tree.points, x, y, z2, tile);

        if (x === 0) {
            this._addTileFeatures(
                tree.range(1 - p / z2, top, 1, bottom),
                tree.points, z2, y, z2, tile);
        }
        if (x === z2 - 1) {
            this._addTileFeatures(
                tree.range(0, top, p / z2, bottom),
                tree.points, -1, y, z2, tile);
        }

        return tile.features.length ? tile : null;
    },

    _addTileFeatures: function (ids, points, x, y, z2, tile) {
        for (var i = 0; i < ids.length; i++) {
            var c = points[ids[i]];
            tile.features.push({
                type: 1,
                geometry: [[
                    Math.round(this.options.extent * (c.x * z2 - x)),
                    Math.round(this.options.extent * (c.y * z2 - y))
                ]],
                tags: c.id !== -1 ? this.points[c.id].properties : getClusterProperties(c)
            });
        }
    },

    _limitZoom: function (z) {
        return Math.max(this.options.minZoom, Math.min(z, this.options.maxZoom + 1));
    },

    _cluster: function (points, zoom) {
        var clusters = [];
        var r = this.options.radius / (this.options.extent * Math.pow(2, zoom));

        // loop through each point
        for (var i = 0; i < points.length; i++) {
            var p = points[i];
            // if we've already visited the point at this zoom level, skip it
            if (p.zoom <= zoom) continue;
            p.zoom = zoom;

            // find all nearby points
            var tree = this.trees[zoom + 1];
            var neighborIds = tree.within(p.x, p.y, r);

            var foundNeighbors = false;
            var numPoints = p.numPoints;
            var wx = p.x * numPoints;
            var wy = p.y * numPoints;

            for (var j = 0; j < neighborIds.length; j++) {
                var b = tree.points[neighborIds[j]];
                // filter out neighbors that are too far or already processed
                if (zoom < b.zoom) {
                    foundNeighbors = true;
                    b.zoom = zoom; // save the zoom (so it doesn't get processed twice)
                    wx += b.x * b.numPoints; // accumulate coordinates for calculating weighted center
                    wy += b.y * b.numPoints;
                    numPoints += b.numPoints;
                }
            }

            clusters.push(foundNeighbors ? createCluster(wx / numPoints, wy / numPoints, numPoints, -1) : p);
        }

        return clusters;
    }
};

function createCluster(x, y, numPoints, id) {
    return {
        x: x, // weighted cluster center
        y: y,
        zoom: Infinity, // the last zoom the cluster was processed at
        id: id, // index of the source feature in the original input array
        numPoints: numPoints
    };
}

function createPointCluster(p, i) {
    var coords = p.geometry.coordinates;
    return createCluster(lngX(coords[0]), latY(coords[1]), 1, i);
}

function getClusterJSON(cluster) {
    return {
        type: 'Feature',
        properties: getClusterProperties(cluster),
        geometry: {
            type: 'Point',
            coordinates: [xLng(cluster.x), yLat(cluster.y)]
        }
    };
}

function getClusterProperties(cluster) {
    var count = cluster.numPoints;
    var abbrev = count >= 10000 ? Math.round(count / 1000) + 'k' :
                 count >= 1000 ? (Math.round(count / 100) / 10) + 'k' : count;
    return {
        cluster: true,
        point_count: count,
        point_count_abbreviated: abbrev
    };
}

// longitude/latitude to spherical mercator in [0..1] range
function lngX(lng) {
    return lng / 360 + 0.5;
}
function latY(lat) {
    var sin = Math.sin(lat * Math.PI / 180),
        y = (0.5 - 0.25 * Math.log((1 + sin) / (1 - sin)) / Math.PI);
    return y < 0 ? 0 :
           y > 1 ? 1 : y;
}

// spherical mercator to longitude/latitude
function xLng(x) {
    return (x - 0.5) * 360;
}
function yLat(y) {
    var y2 = (180 - y * 360) * Math.PI / 180;
    return 360 * Math.atan(Math.exp(y2)) / Math.PI - 90;
}

function extend(dest, src) {
    for (var id in src) dest[id] = src[id];
    return dest;
}

function getX(p) {
    return p.x;
}
function getY(p) {
    return p.y;
}

},{"kdbush":28}],208:[function(require,module,exports){
'use strict';

module.exports = TinyQueue;

function TinyQueue(data, compare) {
    if (!(this instanceof TinyQueue)) return new TinyQueue(data, compare);

    this.data = data || [];
    this.length = this.data.length;
    this.compare = compare || defaultCompare;

    if (data) for (var i = Math.floor(this.length / 2); i >= 0; i--) this._down(i);
}

function defaultCompare(a, b) {
    return a < b ? -1 : a > b ? 1 : 0;
}

TinyQueue.prototype = {

    push: function (item) {
        this.data.push(item);
        this.length++;
        this._up(this.length - 1);
    },

    pop: function () {
        var top = this.data[0];
        this.data[0] = this.data[this.length - 1];
        this.length--;
        this.data.pop();
        this._down(0);
        return top;
    },

    peek: function () {
        return this.data[0];
    },

    _up: function (pos) {
        var data = this.data,
            compare = this.compare;

        while (pos > 0) {
            var parent = Math.floor((pos - 1) / 2);
            if (compare(data[pos], data[parent]) < 0) {
                swap(data, parent, pos);
                pos = parent;

            } else break;
        }
    },

    _down: function (pos) {
        var data = this.data,
            compare = this.compare,
            len = this.length;

        while (true) {
            var left = 2 * pos + 1,
                right = left + 1,
                min = pos;

            if (left < len && compare(data[left], data[min]) < 0) min = left;
            if (right < len && compare(data[right], data[min]) < 0) min = right;

            if (min === pos) return;

            swap(data, min, pos);
            pos = min;
        }
    }
};

function swap(data, i, j) {
    var tmp = data[i];
    data[i] = data[j];
    data[j] = tmp;
}

},{}],209:[function(require,module,exports){
/*
 * Copyright (C) 2008 Apple Inc. All Rights Reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY APPLE INC. ``AS IS'' AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR
 * PURPOSE ARE DISCLAIMED.  IN NO EVENT SHALL APPLE INC. OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 * EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 * PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 * PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY
 * OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * Ported from Webkit
 * http://svn.webkit.org/repository/webkit/trunk/Source/WebCore/platform/graphics/UnitBezier.h
 */

module.exports = UnitBezier;

function UnitBezier(p1x, p1y, p2x, p2y) {
    // Calculate the polynomial coefficients, implicit first and last control points are (0,0) and (1,1).
    this.cx = 3.0 * p1x;
    this.bx = 3.0 * (p2x - p1x) - this.cx;
    this.ax = 1.0 - this.cx - this.bx;

    this.cy = 3.0 * p1y;
    this.by = 3.0 * (p2y - p1y) - this.cy;
    this.ay = 1.0 - this.cy - this.by;

    this.p1x = p1x;
    this.p1y = p2y;
    this.p2x = p2x;
    this.p2y = p2y;
}

UnitBezier.prototype.sampleCurveX = function(t) {
    // `ax t^3 + bx t^2 + cx t' expanded using Horner's rule.
    return ((this.ax * t + this.bx) * t + this.cx) * t;
};

UnitBezier.prototype.sampleCurveY = function(t) {
    return ((this.ay * t + this.by) * t + this.cy) * t;
};

UnitBezier.prototype.sampleCurveDerivativeX = function(t) {
    return (3.0 * this.ax * t + 2.0 * this.bx) * t + this.cx;
};

UnitBezier.prototype.solveCurveX = function(x, epsilon) {
    if (typeof epsilon === 'undefined') epsilon = 1e-6;

    var t0, t1, t2, x2, i;

    // First try a few iterations of Newton's method -- normally very fast.
    for (t2 = x, i = 0; i < 8; i++) {

        x2 = this.sampleCurveX(t2) - x;
        if (Math.abs(x2) < epsilon) return t2;

        var d2 = this.sampleCurveDerivativeX(t2);
        if (Math.abs(d2) < 1e-6) break;

        t2 = t2 - x2 / d2;
    }

    // Fall back to the bisection method for reliability.
    t0 = 0.0;
    t1 = 1.0;
    t2 = x;

    if (t2 < t0) return t0;
    if (t2 > t1) return t1;

    while (t0 < t1) {

        x2 = this.sampleCurveX(t2);
        if (Math.abs(x2 - x) < epsilon) return t2;

        if (x > x2) {
            t0 = t2;
        } else {
            t1 = t2;
        }

        t2 = (t1 - t0) * 0.5 + t0;
    }

    // Failure.
    return t2;
};

UnitBezier.prototype.solve = function(x, epsilon) {
    return this.sampleCurveY(this.solveCurveX(x, epsilon));
};

},{}],210:[function(require,module,exports){
module.exports.VectorTile = require('./lib/vectortile.js');
module.exports.VectorTileFeature = require('./lib/vectortilefeature.js');
module.exports.VectorTileLayer = require('./lib/vectortilelayer.js');

},{"./lib/vectortile.js":211,"./lib/vectortilefeature.js":212,"./lib/vectortilelayer.js":213}],211:[function(require,module,exports){
'use strict';

var VectorTileLayer = require('./vectortilelayer');

module.exports = VectorTile;

function VectorTile(pbf, end) {
    this.layers = pbf.readFields(readTile, {}, end);
}

function readTile(tag, layers, pbf) {
    if (tag === 3) {
        var layer = new VectorTileLayer(pbf, pbf.readVarint() + pbf.pos);
        if (layer.length) layers[layer.name] = layer;
    }
}


},{"./vectortilelayer":213}],212:[function(require,module,exports){
'use strict';

var Point = require('point-geometry');

module.exports = VectorTileFeature;

function VectorTileFeature(pbf, end, extent, keys, values) {
    // Public
    this.properties = {};
    this.extent = extent;
    this.type = 0;

    // Private
    this._pbf = pbf;
    this._geometry = -1;
    this._keys = keys;
    this._values = values;

    pbf.readFields(readFeature, this, end);
}

function readFeature(tag, feature, pbf) {
    if (tag == 1) feature.id = pbf.readVarint();
    else if (tag == 2) readTag(pbf, feature);
    else if (tag == 3) feature.type = pbf.readVarint();
    else if (tag == 4) feature._geometry = pbf.pos;
}

function readTag(pbf, feature) {
    var end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var key = feature._keys[pbf.readVarint()],
            value = feature._values[pbf.readVarint()];
        feature.properties[key] = value;
    }
}

VectorTileFeature.types = ['Unknown', 'Point', 'LineString', 'Polygon'];

VectorTileFeature.prototype.loadGeometry = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        lines = [],
        line;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();

            if (cmd === 1) { // moveTo
                if (line) lines.push(line);
                line = [];
            }

            line.push(new Point(x, y));

        } else if (cmd === 7) {

            // Workaround for https://github.com/mapbox/mapnik-vector-tile/issues/90
            if (line) {
                line.push(line[0].clone()); // closePolygon
            }

        } else {
            throw new Error('unknown command ' + cmd);
        }
    }

    if (line) lines.push(line);

    return lines;
};

VectorTileFeature.prototype.bbox = function() {
    var pbf = this._pbf;
    pbf.pos = this._geometry;

    var end = pbf.readVarint() + pbf.pos,
        cmd = 1,
        length = 0,
        x = 0,
        y = 0,
        x1 = Infinity,
        x2 = -Infinity,
        y1 = Infinity,
        y2 = -Infinity;

    while (pbf.pos < end) {
        if (!length) {
            var cmdLen = pbf.readVarint();
            cmd = cmdLen & 0x7;
            length = cmdLen >> 3;
        }

        length--;

        if (cmd === 1 || cmd === 2) {
            x += pbf.readSVarint();
            y += pbf.readSVarint();
            if (x < x1) x1 = x;
            if (x > x2) x2 = x;
            if (y < y1) y1 = y;
            if (y > y2) y2 = y;

        } else if (cmd !== 7) {
            throw new Error('unknown command ' + cmd);
        }
    }

    return [x1, y1, x2, y2];
};

VectorTileFeature.prototype.toGeoJSON = function(x, y, z) {
    var size = this.extent * Math.pow(2, z),
        x0 = this.extent * x,
        y0 = this.extent * y,
        coords = this.loadGeometry(),
        type = VectorTileFeature.types[this.type],
        i, j;

    function project(line) {
        for (var j = 0; j < line.length; j++) {
            var p = line[j], y2 = 180 - (p.y + y0) * 360 / size;
            line[j] = [
                (p.x + x0) * 360 / size - 180,
                360 / Math.PI * Math.atan(Math.exp(y2 * Math.PI / 180)) - 90
            ];
        }
    }

    switch (this.type) {
    case 1:
        var points = [];
        for (i = 0; i < coords.length; i++) {
            points[i] = coords[i][0];
        }
        coords = points;
        project(coords);
        break;

    case 2:
        for (i = 0; i < coords.length; i++) {
            project(coords[i]);
        }
        break;

    case 3:
        coords = classifyRings(coords);
        for (i = 0; i < coords.length; i++) {
            for (j = 0; j < coords[i].length; j++) {
                project(coords[i][j]);
            }
        }
        break;
    }

    if (coords.length === 1) {
        coords = coords[0];
    } else {
        type = 'Multi' + type;
    }

    var result = {
        type: "Feature",
        geometry: {
            type: type,
            coordinates: coords
        },
        properties: this.properties
    };

    if ('id' in this) {
        result.id = this.id;
    }

    return result;
};

// classifies an array of rings into polygons with outer rings and holes

function classifyRings(rings) {
    var len = rings.length;

    if (len <= 1) return [rings];

    var polygons = [],
        polygon,
        ccw;

    for (var i = 0; i < len; i++) {
        var area = signedArea(rings[i]);
        if (area === 0) continue;

        if (ccw === undefined) ccw = area < 0;

        if (ccw === area < 0) {
            if (polygon) polygons.push(polygon);
            polygon = [rings[i]];

        } else {
            polygon.push(rings[i]);
        }
    }
    if (polygon) polygons.push(polygon);

    return polygons;
}

function signedArea(ring) {
    var sum = 0;
    for (var i = 0, len = ring.length, j = len - 1, p1, p2; i < len; j = i++) {
        p1 = ring[i];
        p2 = ring[j];
        sum += (p2.x - p1.x) * (p1.y + p2.y);
    }
    return sum;
}

},{"point-geometry":204}],213:[function(require,module,exports){
'use strict';

var VectorTileFeature = require('./vectortilefeature.js');

module.exports = VectorTileLayer;

function VectorTileLayer(pbf, end) {
    // Public
    this.version = 1;
    this.name = null;
    this.extent = 4096;
    this.length = 0;

    // Private
    this._pbf = pbf;
    this._keys = [];
    this._values = [];
    this._features = [];

    pbf.readFields(readLayer, this, end);

    this.length = this._features.length;
}

function readLayer(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 5) layer.extent = pbf.readVarint();
    else if (tag === 2) layer._features.push(pbf.pos);
    else if (tag === 3) layer._keys.push(pbf.readString());
    else if (tag === 4) layer._values.push(readValueMessage(pbf));
}

function readValueMessage(pbf) {
    var value = null,
        end = pbf.readVarint() + pbf.pos;

    while (pbf.pos < end) {
        var tag = pbf.readVarint() >> 3;

        value = tag === 1 ? pbf.readString() :
            tag === 2 ? pbf.readFloat() :
            tag === 3 ? pbf.readDouble() :
            tag === 4 ? pbf.readVarint64() :
            tag === 5 ? pbf.readVarint() :
            tag === 6 ? pbf.readSVarint() :
            tag === 7 ? pbf.readBoolean() : null;
    }

    return value;
}

// return feature `i` from this layer as a `VectorTileFeature`
VectorTileLayer.prototype.feature = function(i) {
    if (i < 0 || i >= this._features.length) throw new Error('feature index out of bounds');

    this._pbf.pos = this._features[i];

    var end = this._pbf.readVarint() + this._pbf.pos;
    return new VectorTileFeature(this._pbf, end, this.extent, this._keys, this._values);
};

},{"./vectortilefeature.js":212}],214:[function(require,module,exports){
var Pbf = require('pbf')
var vtpb = require('./vector-tile-pb')
var GeoJSONWrapper = require('./lib/geojson_wrapper')

module.exports = fromVectorTileJs
module.exports.fromVectorTileJs = fromVectorTileJs
module.exports.fromGeojsonVt = fromGeojsonVt
module.exports.GeoJSONWrapper = GeoJSONWrapper

/**
 * Serialize a vector-tile-js-created tile to pbf
 *
 * @param {Object} tile
 * @return {Buffer} uncompressed, pbf-serialized tile data
 */
function fromVectorTileJs (tile) {
  var layers = []
  for (var l in tile.layers) {
    layers.push(prepareLayer(tile.layers[l]))
  }

  var out = new Pbf()
  vtpb.tile.write({ layers: layers }, out)
  return out.finish()
}

/**
 * Serialized a geojson-vt-created tile to pbf.
 *
 * @param {Object} layers - An object mapping layer names to geojson-vt-created vector tile objects
 * @return {Buffer} uncompressed, pbf-serialized tile data
 */
function fromGeojsonVt (layers) {
  var l = {}
  for (var k in layers) {
    l[k] = new GeoJSONWrapper(layers[k].features)
    l[k].name = k
  }
  return fromVectorTileJs({layers: l})
}

/**
 * Prepare the given layer to be serialized by the auto-generated pbf
 * serializer by encoding the feature geometry and properties.
 */
function prepareLayer (layer) {
  var preparedLayer = {
    name: layer.name || '',
    version: layer.version || 1,
    extent: layer.extent || 4096,
    keys: [],
    values: [],
    features: []
  }

  var keycache = {}
  var valuecache = {}

  for (var i = 0; i < layer.length; i++) {
    var feature = layer.feature(i)
    feature.geometry = encodeGeometry(feature.loadGeometry())

    var tags = []
    for (var key in feature.properties) {
      var keyIndex = keycache[key]
      if (typeof keyIndex === 'undefined') {
        preparedLayer.keys.push(key)
        keyIndex = preparedLayer.keys.length - 1
        keycache[key] = keyIndex
      }
      var value = wrapValue(feature.properties[key])
      var valueIndex = valuecache[value.key]
      if (typeof valueIndex === 'undefined') {
        preparedLayer.values.push(value)
        valueIndex = preparedLayer.values.length - 1
        valuecache[value.key] = valueIndex
      }
      tags.push(keyIndex)
      tags.push(valueIndex)
    }

    feature.tags = tags
    preparedLayer.features.push(feature)
  }

  return preparedLayer
}

function command (cmd, length) {
  return (length << 3) + (cmd & 0x7)
}

function zigzag (num) {
  return (num << 1) ^ (num >> 31)
}

/**
 * Encode a polygon's geometry into an array ready to be serialized
 * to mapbox vector tile specified geometry data.
 *
 * @param {Array} Rings, each being an array of [x, y] tile-space coordinates
 * @return {Array} encoded geometry
 */
function encodeGeometry (geometry) {
  var encoded = []
  var x = 0
  var y = 0
  var rings = geometry.length
  for (var r = 0; r < rings; r++) {
    var ring = geometry[r]
    encoded.push(command(1, 1)) // moveto
    for (var i = 0; i < ring.length; i++) {
      if (i === 1) {
        encoded.push(command(2, ring.length - 1)) // lineto
      }
      var dx = ring[i].x - x
      var dy = ring[i].y - y
      encoded.push(zigzag(dx), zigzag(dy))
      x += dx
      y += dy
    }
  }

  return encoded
}

/**
 * Wrap a property value according to its type. The returned object
 * is of the form { xxxx_value: primitiveValue }, which is what the generated
 * protobuf serializer expects.
 */
function wrapValue (value) {
  var result
  var type = typeof value
  if (type === 'string') {
    result = { string_value: value }
  } else if (type === 'boolean') {
    result = { bool_value: value }
  } else if (type === 'number') {
    if (value % 1 !== 0) {
      result = { double_value: value }
    } else if (value < 0) {
      result = { sint_value: value }
    } else {
      result = { uint_value: value }
    }
  } else {
    value = JSON.stringify(value)
    result = { string_value: value }
  }

  result.key = type + ':' + value
  return result
}

},{"./lib/geojson_wrapper":215,"./vector-tile-pb":216,"pbf":203}],215:[function(require,module,exports){
'use strict'

var Point = require('point-geometry')
var VectorTileFeature = require('vector-tile').VectorTileFeature

module.exports = GeoJSONWrapper

// conform to vectortile api
function GeoJSONWrapper (features) {
  this.features = features
  this.length = features.length
}

GeoJSONWrapper.prototype.feature = function (i) {
  return new FeatureWrapper(this.features[i])
}

function FeatureWrapper (feature) {
  this.id = typeof feature.id === 'number' ? feature.id : undefined
  this.type = feature.type
  this.rawGeometry = feature.type === 1 ? [feature.geometry] : feature.geometry
  this.properties = feature.tags
  this.extent = 4096
}

FeatureWrapper.prototype.loadGeometry = function () {
  var rings = this.rawGeometry
  this.geometry = []

  for (var i = 0; i < rings.length; i++) {
    var ring = rings[i]
    var newRing = []
    for (var j = 0; j < ring.length; j++) {
      newRing.push(new Point(ring[j][0], ring[j][1]))
    }
    this.geometry.push(newRing)
  }
  return this.geometry
}

FeatureWrapper.prototype.bbox = function () {
  if (!this.geometry) this.loadGeometry()

  var rings = this.geometry
  var x1 = Infinity
  var x2 = -Infinity
  var y1 = Infinity
  var y2 = -Infinity

  for (var i = 0; i < rings.length; i++) {
    var ring = rings[i]

    for (var j = 0; j < ring.length; j++) {
      var coord = ring[j]

      x1 = Math.min(x1, coord.x)
      x2 = Math.max(x2, coord.x)
      y1 = Math.min(y1, coord.y)
      y2 = Math.max(y2, coord.y)
    }
  }

  return [x1, y1, x2, y2]
}

FeatureWrapper.prototype.toGeoJSON = VectorTileFeature.prototype.toGeoJSON

},{"point-geometry":204,"vector-tile":210}],216:[function(require,module,exports){
'use strict';

// tile ========================================

var tile = exports.tile = {read: readTile, write: writeTile};

tile.GeomType = {
    "Unknown": 0,
    "Point": 1,
    "LineString": 2,
    "Polygon": 3
};

function readTile(pbf, end) {
    return pbf.readFields(readTileField, {"layers": []}, end);
}

function readTileField(tag, tile, pbf) {
    if (tag === 3) tile.layers.push(readLayer(pbf, pbf.readVarint() + pbf.pos));
}

function writeTile(tile, pbf) {
    var i;
    if (tile.layers !== undefined) for (i = 0; i < tile.layers.length; i++) pbf.writeMessage(3, writeLayer, tile.layers[i]);
}

// value ========================================

tile.value = {read: readValue, write: writeValue};

function readValue(pbf, end) {
    return pbf.readFields(readValueField, {}, end);
}

function readValueField(tag, value, pbf) {
    if (tag === 1) value.string_value = pbf.readString();
    else if (tag === 2) value.float_value = pbf.readFloat();
    else if (tag === 3) value.double_value = pbf.readDouble();
    else if (tag === 4) value.int_value = pbf.readVarint();
    else if (tag === 5) value.uint_value = pbf.readVarint();
    else if (tag === 6) value.sint_value = pbf.readSVarint();
    else if (tag === 7) value.bool_value = pbf.readBoolean();
}

function writeValue(value, pbf) {
    if (value.string_value !== undefined) pbf.writeStringField(1, value.string_value);
    if (value.float_value !== undefined) pbf.writeFloatField(2, value.float_value);
    if (value.double_value !== undefined) pbf.writeDoubleField(3, value.double_value);
    if (value.int_value !== undefined) pbf.writeVarintField(4, value.int_value);
    if (value.uint_value !== undefined) pbf.writeVarintField(5, value.uint_value);
    if (value.sint_value !== undefined) pbf.writeSVarintField(6, value.sint_value);
    if (value.bool_value !== undefined) pbf.writeBooleanField(7, value.bool_value);
}

// feature ========================================

tile.feature = {read: readFeature, write: writeFeature};

function readFeature(pbf, end) {
    var feature = pbf.readFields(readFeatureField, {}, end);
    if (feature.type === undefined) feature.type = "Unknown";
    return feature;
}

function readFeatureField(tag, feature, pbf) {
    if (tag === 1) feature.id = pbf.readVarint();
    else if (tag === 2) feature.tags = pbf.readPackedVarint();
    else if (tag === 3) feature.type = pbf.readVarint();
    else if (tag === 4) feature.geometry = pbf.readPackedVarint();
}

function writeFeature(feature, pbf) {
    if (feature.id !== undefined) pbf.writeVarintField(1, feature.id);
    if (feature.tags !== undefined) pbf.writePackedVarint(2, feature.tags);
    if (feature.type !== undefined) pbf.writeVarintField(3, feature.type);
    if (feature.geometry !== undefined) pbf.writePackedVarint(4, feature.geometry);
}

// layer ========================================

tile.layer = {read: readLayer, write: writeLayer};

function readLayer(pbf, end) {
    return pbf.readFields(readLayerField, {"features": [], "keys": [], "values": []}, end);
}

function readLayerField(tag, layer, pbf) {
    if (tag === 15) layer.version = pbf.readVarint();
    else if (tag === 1) layer.name = pbf.readString();
    else if (tag === 2) layer.features.push(readFeature(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 3) layer.keys.push(pbf.readString());
    else if (tag === 4) layer.values.push(readValue(pbf, pbf.readVarint() + pbf.pos));
    else if (tag === 5) layer.extent = pbf.readVarint();
}

function writeLayer(layer, pbf) {
    if (layer.version !== undefined) pbf.writeVarintField(15, layer.version);
    if (layer.name !== undefined) pbf.writeStringField(1, layer.name);
    var i;
    if (layer.features !== undefined) for (i = 0; i < layer.features.length; i++) pbf.writeMessage(2, writeFeature, layer.features[i]);
    if (layer.keys !== undefined) for (i = 0; i < layer.keys.length; i++) pbf.writeStringField(3, layer.keys[i]);
    if (layer.values !== undefined) for (i = 0; i < layer.values.length; i++) pbf.writeMessage(4, writeValue, layer.values[i]);
    if (layer.extent !== undefined) pbf.writeVarintField(5, layer.extent);
}

},{}],217:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],218:[function(require,module,exports){
module.exports.RADIUS = 6378137;
module.exports.FLATTENING = 1/298.257223563;
module.exports.POLAR_RADIUS = 6356752.3142;

},{}],219:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.WhooTS = global.WhooTS || {})));
}(this, function (exports) {

/**
 * getURL
 *
 * @param    {String}  baseUrl  Base url of the WMS server
 * @param    {String}  layer    Layer name
 * @param    {Number}  x        Tile coordinate x
 * @param    {Number}  y        Tile coordinate y
 * @param    {Number}  z        Tile zoom
 * @param    {Object}  [options]
 * @param    {String}  [options.format='image/png']
 * @param    {String}  [options.service='WMS']
 * @param    {String}  [options.version='1.1.1']
 * @param    {String}  [options.request='GetMap']
 * @param    {String}  [options.srs='EPSG:3857']
 * @param    {Number}  [options.width='256']
 * @param    {Number}  [options.height='256']
 * @returns  {String}  url
 * @example
 * var baseUrl = 'http://geodata.state.nj.us/imagerywms/Natural2015';
 * var layer = 'Natural2015';
 * var url = whoots.getURL(baseUrl, layer, 154308, 197167, 19);
 */
function getURL(baseUrl, layer, x, y, z, options) {
    options = options || {};

    var url = baseUrl + '?' + [
        'bbox='    + getTileBBox(x, y, z),
        'format='  + (options.format || 'image/png'),
        'service=' + (options.service || 'WMS'),
        'version=' + (options.version || '1.1.1'),
        'request=' + (options.request || 'GetMap'),
        'srs='     + (options.srs || 'EPSG:3857'),
        'width='   + (options.width || 256),
        'height='  + (options.height || 256),
        'layers='  + layer
    ].join('&');

    return url;
}


/**
 * getTileBBox
 *
 * @param    {Number}  x  Tile coordinate x
 * @param    {Number}  y  Tile coordinate y
 * @param    {Number}  z  Tile zoom
 * @returns  {String}  String of the bounding box
 */
function getTileBBox(x, y, z) {
    // for Google/OSM tile scheme we need to alter the y
    y = (Math.pow(2, z) - y - 1);

    var min = getMercCoords(x * 256, y * 256, z),
        max = getMercCoords((x + 1) * 256, (y + 1) * 256, z);

    return min[0] + ',' + min[1] + ',' + max[0] + ',' + max[1];
}


/**
 * getMercCoords
 *
 * @param    {Number}  x  Pixel coordinate x
 * @param    {Number}  y  Pixel coordinate y
 * @param    {Number}  z  Tile zoom
 * @returns  {Array}   [x, y]
 */
function getMercCoords(x, y, z) {
    var resolution = (2 * Math.PI * 6378137 / 256) / Math.pow(2, z),
        merc_x = (x * resolution - 2 * Math.PI  * 6378137 / 2.0),
        merc_y = (y * resolution - 2 * Math.PI  * 6378137 / 2.0);

    return [merc_x, merc_y];
}

exports.getURL = getURL;
exports.getTileBBox = getTileBBox;
exports.getMercCoords = getMercCoords;

Object.defineProperty(exports, '__esModule', { value: true });

}));
},{}]},{},[6]);

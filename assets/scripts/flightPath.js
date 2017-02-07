(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./melbourneRoute":2}],2:[function(require,module,exports){
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

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbWVsYm91cm5lUm91dGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDQ0E7OzBKQURBOzs7QUFHQTs7OztBQUlBLFNBQVMsVUFBVCxDQUFvQixHQUFwQixFQUF5QixDQUF6QixFQUE0QjtBQUN4QixRQUFJLElBQUksTUFBSixFQUFKLEVBQWtCO0FBQ2QsZ0JBQVEsR0FBUixDQUFZLGlCQUFaO0FBQ0E7QUFDSCxLQUhELE1BSUs7QUFDRCxnQkFBUSxHQUFSLENBQVksZUFBWjtBQUNBLFlBQUksSUFBSixDQUFTLE1BQVQsRUFBaUIsQ0FBakI7QUFDSDtBQUNKOztBQUVELElBQUksTUFBTSxTQUFOLEdBQU0sQ0FBQyxDQUFELEVBQUksQ0FBSjtBQUFBLFdBQVUsTUFBTSxTQUFOLEdBQWtCLENBQWxCLEdBQXNCLENBQWhDO0FBQUEsQ0FBVjs7SUFFYSxVLFdBQUEsVSxHQUVULG9CQUFZLEdBQVosRUFBaUIsS0FBakIsRUFBd0I7QUFBQTs7QUFBQTs7QUFDcEIsU0FBSyxLQUFMLEdBQWEsS0FBYjtBQUNBLFFBQUksS0FBSyxLQUFMLEtBQWUsU0FBbkIsRUFDSSxLQUFLLEtBQUw7O0FBRUosU0FBSyxHQUFMLEdBQVcsR0FBWDs7QUFFQSxTQUFLLEtBQUwsR0FBYSxJQUFiOztBQUVBLFNBQUssS0FBTCxHQUFhLENBQWI7O0FBRUEsU0FBSyxTQUFMLEdBQWlCLEtBQUssS0FBTCxDQUFXLFFBQVgsQ0FBb0IsR0FBcEIsQ0FBd0I7QUFBQSxlQUFZO0FBQ2pELG9CQUFRLFFBQVEsUUFBUixDQUFpQixXQUR3QjtBQUVqRCxrQkFBTSxJQUFJLFFBQVEsVUFBUixDQUFtQixJQUF2QixFQUE2QixFQUE3QixDQUYyQztBQUdqRCxxQkFBUyxR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QUFJWixpQkFBVztBQUpDLEtBRmhCO0FBUUUsZ0JBQVk7QUFDVixjQUFRLE9BREU7QUFFVixxQkFBZSxDQUNiLGtCQURhLEVBRWIsQ0FBQyxpQkFGWTtBQUZMO0FBUmQsR0E5Q1U7QUFGZ0IsQ0FBdkIiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5pbXBvcnQgeyBtZWxib3VybmVSb3V0ZSB9IGZyb20gJy4vbWVsYm91cm5lUm91dGUnO1xuXG4vKlxuQ29udGludW91c2x5IG1vdmVzIHRoZSBNYXBib3ggdmFudGFnZSBwb2ludCBhcm91bmQgYSBHZW9KU09OLWRlZmluZWQgcGF0aC5cbiovXG5cbmZ1bmN0aW9uIHdoZW5Mb2FkZWQobWFwLCBmKSB7XG4gICAgaWYgKG1hcC5sb2FkZWQoKSkge1xuICAgICAgICBjb25zb2xlLmxvZygnQWxyZWFkeSBsb2FkZWQuJyk7XG4gICAgICAgIGYoKTtcbiAgICB9XG4gICAgZWxzZSB7IFxuICAgICAgICBjb25zb2xlLmxvZygnV2FpdCBmb3IgbG9hZCcpO1xuICAgICAgICBtYXAub25jZSgnbG9hZCcsIGYpO1xuICAgIH1cbn1cblxubGV0IGRlZiA9IChhLCBiKSA9PiBhICE9PSB1bmRlZmluZWQgPyBhIDogYjtcblxuZXhwb3J0IGNsYXNzIEZsaWdodFBhdGgge1xuXG4gICAgY29uc3RydWN0b3IobWFwLCByb3V0ZSkge1xuICAgICAgICB0aGlzLnJvdXRlID0gcm91dGU7XG4gICAgICAgIGlmICh0aGlzLnJvdXRlID09PSB1bmRlZmluZWQpXG4gICAgICAgICAgICB0aGlzLnJvdXRlID0gbWVsYm91cm5lUm91dGU7XG5cbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG5cbiAgICAgICAgdGhpcy5zcGVlZCA9IDAuMDE7XG5cbiAgICAgICAgdGhpcy5wb3NObyA9IDA7XG5cbiAgICAgICAgdGhpcy5wb3NpdGlvbnMgPSB0aGlzLnJvdXRlLmZlYXR1cmVzLm1hcChmZWF0dXJlID0+ICh7XG4gICAgICAgICAgICBjZW50ZXI6IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXMsXG4gICAgICAgICAgICB6b29tOiBkZWYoZmVhdHVyZS5wcm9wZXJ0aWVzLnpvb20sIDE0KSxcbiAgICAgICAgICAgIGJlYXJpbmc6IGZlYXR1cmUucHJvcGVydGllcy5iZWFyaW5nLFxuICAgICAgICAgICAgcGl0Y2g6IGRlZihmZWF0dXJlLnByb3BlcnRpZXMucGl0Y2gsIDYwKVxuICAgICAgICB9KSk7XG5cbiAgICAgICAgdGhpcy5wYXVzZVRpbWUgPSAwO1xuXG4gICAgICAgIHRoaXMuYmVhcmluZz0wO1xuXG4gICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuXG5cblxuICAgIC8qdmFyIHBvc2l0aW9ucyA9IFtcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTYsIC0zNy44XSwgem9vbTogMTUsIGJlYXJpbmc6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTgsIC0zNy44NF0sIHpvb206IDE1LCBiZWFyaW5nOiAxNjAsIHBpdGNoOiAxMH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk5NSwgLTM3LjgyNV0sIHpvb206IDE1LCBiZWFyaW5nOiAtOTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45NywgLTM3LjgyXSwgem9vbTogMTUsIGJlYXJpbmc6IDE0MH1cblxuICAgIF07Ki9cblxuICAgICAgICB0aGlzLm1vdmVDYW1lcmEgPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ21vdmVDYW1lcmEnKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnN0b3BwZWQpIHJldHVybjtcbiAgICAgICAgICAgIHZhciBwb3MgPSB0aGlzLnBvc2l0aW9uc1t0aGlzLnBvc05vXTtcbiAgICAgICAgICAgIHBvcy5zcGVlZCA9IHRoaXMuc3BlZWQ7XG4gICAgICAgICAgICBwb3MuY3VydmUgPSAwLjQ4OyAvLzE7XG4gICAgICAgICAgICBwb3MuZWFzaW5nID0gKHQpID0+IHQ7IC8vIGxpbmVhciBlYXNpbmdcblxuICAgICAgICAgICAgY29uc29sZS5sb2coJ2ZseVRvJyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5mbHlUbyhwb3MsIHsgc291cmNlOiAnZmxpZ2h0cGF0aCcgfSk7XG5cbiAgICAgICAgICAgIHRoaXMucG9zTm8gPSAodGhpcy5wb3NObyArIDEpICUgdGhpcy5wb3NpdGlvbnMubGVuZ3RoO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAvL21hcC5yb3RhdGVUbyhiZWFyaW5nLCB7IGVhc2luZzogZWFzaW5nIH0pO1xuICAgICAgICAgICAgLy9iZWFyaW5nICs9IDU7XG4gICAgICAgIH0uYmluZCh0aGlzKTtcbiBcbiAgICAgICAgdGhpcy5tYXAub24oJ21vdmVlbmQnLCAoZGF0YSkgPT4geyBcbiAgICAgICAgICAgIGlmIChkYXRhLnNvdXJjZSA9PT0gJ2ZsaWdodHBhdGgnKSBcbiAgICAgICAgICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgdGhpcy5wYXVzZVRpbWUpO1xuICAgICAgICB9KTtcblxuXG4gICAgICAgIC8qXG4gICAgICAgIFRoaXMgc2VlbWVkIHRvIGJlIHVucmVsaWFibGUgLSB3YXNuJ3QgYWx3YXlzIGdldHRpbmcgdGhlIGxvYWRlZCBldmVudC5cbiAgICAgICAgd2hlbkxvYWRlZCh0aGlzLm1hcCwgKCkgPT4ge1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0xvYWRlZC4nKTtcbiAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuICAgICAgICAqL1xuICAgICAgICBcbiAgICAgICAgdGhpcy5tYXAuanVtcFRvKHRoaXMucG9zaXRpb25zWzBdKTtcbiAgICAgICAgdGhpcy5wb3NObyArKztcbiAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIDAgLyp0aGlzLnBhdXNlVGltZSovKTtcblxuICAgICAgICB0aGlzLm1hcC5vbignY2xpY2snLCAoKSA9PiB7IFxuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RvcHBlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuc3RvcCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuXG4gICAgfSAgICBcblxufSIsImV4cG9ydCBjb25zdCBtZWxib3VybmVSb3V0ZSA9IHtcbiAgXCJ0eXBlXCI6IFwiRmVhdHVyZUNvbGxlY3Rpb25cIixcbiAgXCJmZWF0dXJlc1wiOiBbXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAzNTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk2Mjg4Mjk5NTYwNTQ3LFxuICAgICAgICAgIC0zNy44MjE3MTc2NDc4Mzk2NVxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcImJlYXJpbmdcIjogMjcwXG4gICAgICB9LFxuICAgICAgXCJnZW9tZXRyeVwiOiB7XG4gICAgICAgIFwidHlwZVwiOiBcIlBvaW50XCIsXG4gICAgICAgIFwiY29vcmRpbmF0ZXNcIjogW1xuICAgICAgICAgIDE0NC45Nzg1MDQxODA5MDgyLFxuICAgICAgICAgIC0zNy44MDgzNTk5MTc0MjM1OTRcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiAxODBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk1NTU4NzM4NzA4NDk2LFxuICAgICAgICAgIC0zNy44MDU3ODMwMjEzMTQ1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwibWFya2VyLWNvbG9yXCI6IFwiIzdlN2U3ZVwiLFxuICAgICAgICBcIm1hcmtlci1zaXplXCI6IFwibWVkaXVtXCIsXG4gICAgICAgIFwibWFya2VyLXN5bWJvbFwiOiBcIlwiLFxuICAgICAgICBcImJlYXJpbmdcIjogOTBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk0NDM0MzU2Njg5NDUzLFxuICAgICAgICAgIC0zNy44MTY0OTY4OTM3MjMwOFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfVxuICBdXG59OyJdfQ==

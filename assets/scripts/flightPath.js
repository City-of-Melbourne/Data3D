(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.FlightPath = undefined;

var _melbourneRoute = require('./melbourneRoute');

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } } /* jshint esnext:true */


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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2ZsaWdodFBhdGguanMiLCJzcmMvanMvbWVsYm91cm5lUm91dGUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDQ0E7OzBKQURBOzs7QUFHQSxTQUFTLFVBQVQsQ0FBb0IsR0FBcEIsRUFBeUIsQ0FBekIsRUFBNEI7QUFDeEIsUUFBSSxJQUFJLE1BQUosRUFBSixFQUFrQjtBQUNkLGdCQUFRLEdBQVIsQ0FBWSxpQkFBWjtBQUNBO0FBQ0gsS0FIRCxNQUlLO0FBQ0QsZ0JBQVEsR0FBUixDQUFZLGVBQVo7QUFDQSxZQUFJLElBQUosQ0FBUyxNQUFULEVBQWlCLENBQWpCO0FBQ0g7QUFDSjs7QUFFRCxJQUFJLE1BQU0sU0FBTixHQUFNLENBQUMsQ0FBRCxFQUFJLENBQUo7QUFBQSxXQUFVLE1BQU0sU0FBTixHQUFrQixDQUFsQixHQUFzQixDQUFoQztBQUFBLENBQVY7O0lBRWEsVSxXQUFBLFUsR0FFVCxvQkFBWSxHQUFaLEVBQWlCLEtBQWpCLEVBQXdCO0FBQUE7O0FBQUE7O0FBQ3BCLFNBQUssS0FBTCxHQUFhLEtBQWI7QUFDQSxRQUFJLEtBQUssS0FBTCxLQUFlLFNBQW5CLEVBQ0ksS0FBSyxLQUFMOztBQUVKLFNBQUssR0FBTCxHQUFXLEdBQVg7O0FBRUEsU0FBSyxLQUFMLEdBQWEsSUFBYjs7QUFFQSxTQUFLLEtBQUwsR0FBYSxDQUFiOztBQUVBLFNBQUssU0FBTCxHQUFpQixLQUFLLEtBQUwsQ0FBVyxRQUFYLENBQW9CLEdBQXBCLENBQXdCO0FBQUEsZUFBWTtBQUNqRCxvQkFBUSxRQUFRLFFBQVIsQ0FBaUIsV0FEd0I7QUFFakQsa0JBQU0sSUFBSSxRQUFRLFVBQVIsQ0FBbUIsSUFBdkIsRUFBNkIsRUFBN0IsQ0FGMkM7QUFHakQscUJBQVMsUUFBUSxVQUFS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QVc7QUFKQyxLQUZoQjtBQVFFLGdCQUFZO0FBQ1YsY0FBUSxPQURFO0FBRVYscUJBQWUsQ0FDYixrQkFEYSxFQUViLENBQUMsaUJBRlk7QUFGTDtBQVJkLEdBOUNVO0FBRmdCLENBQXZCIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuaW1wb3J0IHsgbWVsYm91cm5lUm91dGUgfSBmcm9tICcuL21lbGJvdXJuZVJvdXRlJztcblxuZnVuY3Rpb24gd2hlbkxvYWRlZChtYXAsIGYpIHtcbiAgICBpZiAobWFwLmxvYWRlZCgpKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdBbHJlYWR5IGxvYWRlZC4nKTtcbiAgICAgICAgZigpO1xuICAgIH1cbiAgICBlbHNlIHsgXG4gICAgICAgIGNvbnNvbGUubG9nKCdXYWl0IGZvciBsb2FkJyk7XG4gICAgICAgIG1hcC5vbmNlKCdsb2FkJywgZik7XG4gICAgfVxufVxuXG5sZXQgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5leHBvcnQgY2xhc3MgRmxpZ2h0UGF0aCB7XG5cbiAgICBjb25zdHJ1Y3RvcihtYXAsIHJvdXRlKSB7XG4gICAgICAgIHRoaXMucm91dGUgPSByb3V0ZTtcbiAgICAgICAgaWYgKHRoaXMucm91dGUgPT09IHVuZGVmaW5lZClcbiAgICAgICAgICAgIHRoaXMucm91dGUgPSBtZWxib3VybmVSb3V0ZTtcblxuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcblxuICAgICAgICB0aGlzLnNwZWVkID0gMC4wMTtcblxuICAgICAgICB0aGlzLnBvc05vID0gMDtcblxuICAgICAgICB0aGlzLnBvc2l0aW9ucyA9IHRoaXMucm91dGUuZmVhdHVyZXMubWFwKGZlYXR1cmUgPT4gKHtcbiAgICAgICAgICAgIGNlbnRlcjogZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcyxcbiAgICAgICAgICAgIHpvb206IGRlZihmZWF0dXJlLnByb3BlcnRpZXMuem9vbSwgMTQpLFxuICAgICAgICAgICAgYmVhcmluZzogZmVhdHVyZS5wcm9wZXJ0aWVzLmJlYXJpbmcsXG4gICAgICAgICAgICBwaXRjaDogZGVmKGZlYXR1cmUucHJvcGVydGllcy5waXRjaCwgNjApXG4gICAgICAgIH0pKTtcblxuICAgICAgICB0aGlzLnBhdXNlVGltZSA9IDA7XG5cbiAgICAgICAgdGhpcy5iZWFyaW5nPTA7XG5cbiAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG5cblxuXG4gICAgLyp2YXIgcG9zaXRpb25zID0gW1xuICAgICAgICB7IGNlbnRlcjogWzE0NC45NiwgLTM3LjhdLCB6b29tOiAxNSwgYmVhcmluZzogMTB9LFxuICAgICAgICB7IGNlbnRlcjogWzE0NC45OCwgLTM3Ljg0XSwgem9vbTogMTUsIGJlYXJpbmc6IDE2MCwgcGl0Y2g6IDEwfSxcbiAgICAgICAgeyBjZW50ZXI6IFsxNDQuOTk1LCAtMzcuODI1XSwgem9vbTogMTUsIGJlYXJpbmc6IC05MH0sXG4gICAgICAgIHsgY2VudGVyOiBbMTQ0Ljk3LCAtMzcuODJdLCB6b29tOiAxNSwgYmVhcmluZzogMTQwfVxuXG4gICAgXTsqL1xuXG4gICAgICAgIHRoaXMubW92ZUNhbWVyYSA9IGZ1bmN0aW9uKCl7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnbW92ZUNhbWVyYScpO1xuICAgICAgICAgICAgaWYgKHRoaXMuc3RvcHBlZCkgcmV0dXJuO1xuICAgICAgICAgICAgdmFyIHBvcyA9IHRoaXMucG9zaXRpb25zW3RoaXMucG9zTm9dO1xuICAgICAgICAgICAgcG9zLnNwZWVkID0gdGhpcy5zcGVlZDtcbiAgICAgICAgICAgIHBvcy5jdXJ2ZSA9IDAuNDg7IC8vMTtcbiAgICAgICAgICAgIHBvcy5lYXNpbmcgPSAodCkgPT4gdDsgLy8gbGluZWFyIGVhc2luZ1xuXG4gICAgICAgICAgICBjb25zb2xlLmxvZygnZmx5VG8nKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmZseVRvKHBvcywgeyBzb3VyY2U6ICdmbGlnaHRwYXRoJyB9KTtcblxuICAgICAgICAgICAgdGhpcy5wb3NObyA9ICh0aGlzLnBvc05vICsgMSkgJSB0aGlzLnBvc2l0aW9ucy5sZW5ndGg7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vbWFwLnJvdGF0ZVRvKGJlYXJpbmcsIHsgZWFzaW5nOiBlYXNpbmcgfSk7XG4gICAgICAgICAgICAvL2JlYXJpbmcgKz0gNTtcbiAgICAgICAgfS5iaW5kKHRoaXMpO1xuIFxuICAgICAgICB0aGlzLm1hcC5vbignbW92ZWVuZCcsIChkYXRhKSA9PiB7IFxuICAgICAgICAgICAgaWYgKGRhdGEuc291cmNlID09PSAnZmxpZ2h0cGF0aCcpIFxuICAgICAgICAgICAgICAgIHNldFRpbWVvdXQodGhpcy5tb3ZlQ2FtZXJhLCB0aGlzLnBhdXNlVGltZSk7XG4gICAgICAgIH0pO1xuXG5cbiAgICAgICAgLypcbiAgICAgICAgVGhpcyBzZWVtZWQgdG8gYmUgdW5yZWxpYWJsZSAtIHdhc24ndCBhbHdheXMgZ2V0dGluZyB0aGUgbG9hZGVkIGV2ZW50LlxuICAgICAgICB3aGVuTG9hZGVkKHRoaXMubWFwLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnTG9hZGVkLicpO1xuICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgfSk7XG4gICAgICAgICovXG4gICAgICAgIFxuICAgICAgICB0aGlzLm1hcC5qdW1wVG8odGhpcy5wb3NpdGlvbnNbMF0pO1xuICAgICAgICB0aGlzLnBvc05vICsrO1xuICAgICAgICBzZXRUaW1lb3V0KHRoaXMubW92ZUNhbWVyYSwgMCAvKnRoaXMucGF1c2VUaW1lKi8pO1xuXG4gICAgICAgIHRoaXMubWFwLm9uKCdjbGljaycsICgpID0+IHsgXG4gICAgICAgICAgICBpZiAodGhpcy5zdG9wcGVkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgc2V0VGltZW91dCh0aGlzLm1vdmVDYW1lcmEsIHRoaXMucGF1c2VUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zdG9wcGVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5zdG9wKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG5cbiAgICB9ICAgIFxuXG59IiwiZXhwb3J0IGNvbnN0IG1lbGJvdXJuZVJvdXRlID0ge1xuICBcInR5cGVcIjogXCJGZWF0dXJlQ29sbGVjdGlvblwiLFxuICBcImZlYXR1cmVzXCI6IFtcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDM1MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTYyODgyOTk1NjA1NDcsXG4gICAgICAgICAgLTM3LjgyMTcxNzY0NzgzOTY1XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgIFwidHlwZVwiOiBcIkZlYXR1cmVcIixcbiAgICAgIFwicHJvcGVydGllc1wiOiB7XG4gICAgICAgIFwiYmVhcmluZ1wiOiAyNzBcbiAgICAgIH0sXG4gICAgICBcImdlb21ldHJ5XCI6IHtcbiAgICAgICAgXCJ0eXBlXCI6IFwiUG9pbnRcIixcbiAgICAgICAgXCJjb29yZGluYXRlc1wiOiBbXG4gICAgICAgICAgMTQ0Ljk3ODUwNDE4MDkwODIsXG4gICAgICAgICAgLTM3LjgwODM1OTkxNzQyMzU5NFxuICAgICAgICBdXG4gICAgICB9XG4gICAgfSxcbiAgICB7XG4gICAgICBcInR5cGVcIjogXCJGZWF0dXJlXCIsXG4gICAgICBcInByb3BlcnRpZXNcIjoge1xuICAgICAgICBcIm1hcmtlci1jb2xvclwiOiBcIiM3ZTdlN2VcIixcbiAgICAgICAgXCJtYXJrZXItc2l6ZVwiOiBcIm1lZGl1bVwiLFxuICAgICAgICBcIm1hcmtlci1zeW1ib2xcIjogXCJcIixcbiAgICAgICAgXCJiZWFyaW5nXCI6IDE4MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTU1NTg3Mzg3MDg0OTYsXG4gICAgICAgICAgLTM3LjgwNTc4MzAyMTMxNDVcbiAgICAgICAgXVxuICAgICAgfVxuICAgIH0sXG4gICAge1xuICAgICAgXCJ0eXBlXCI6IFwiRmVhdHVyZVwiLFxuICAgICAgXCJwcm9wZXJ0aWVzXCI6IHtcbiAgICAgICAgXCJtYXJrZXItY29sb3JcIjogXCIjN2U3ZTdlXCIsXG4gICAgICAgIFwibWFya2VyLXNpemVcIjogXCJtZWRpdW1cIixcbiAgICAgICAgXCJtYXJrZXItc3ltYm9sXCI6IFwiXCIsXG4gICAgICAgIFwiYmVhcmluZ1wiOiA5MFxuICAgICAgfSxcbiAgICAgIFwiZ2VvbWV0cnlcIjoge1xuICAgICAgICBcInR5cGVcIjogXCJQb2ludFwiLFxuICAgICAgICBcImNvb3JkaW5hdGVzXCI6IFtcbiAgICAgICAgICAxNDQuOTQ0MzQzNTY2ODk0NTMsXG4gICAgICAgICAgLTM3LjgxNjQ5Njg5MzcyMzA4XG4gICAgICAgIF1cbiAgICAgIH1cbiAgICB9XG4gIF1cbn07Il19

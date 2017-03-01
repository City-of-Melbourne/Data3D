(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./legend":1}]},{},[2])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2xlZ2VuZC5qcyIsInNyYy9qcy9tYXBWaXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0NnQixnQixHQUFBLGdCO1FBY0EseUIsR0FBQSx5QjtRQWVBLGtCLEdBQUEsa0I7QUE5QmhCO0FBQ08sU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QixVQUE5QixFQUEwQyxNQUExQyxFQUFrRCxNQUFsRCxFQUEwRCxZQUExRCxFQUF3RTtBQUMzRSxRQUFJLGFBQ0EsQ0FBQyxlQUFlLGtDQUFmLEdBQW9ELEVBQXJELGNBQ08sVUFEUDtBQUVBO0FBRkEsK0ZBR3lGLE1BSHpGLHFIQUk0RixNQUo1RixjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUVNLFNBQVMseUJBQVQsQ0FBbUMsRUFBbkMsRUFBdUMsVUFBdkMsRUFBbUQsTUFBbkQsRUFBMkQsTUFBM0QsRUFBbUUsWUFBbkUsRUFBaUY7QUFDcEYsUUFBSSxhQUNBLENBQUMsZUFBZSxrQ0FBZixHQUFvRCxFQUFyRCxjQUNPLFVBRFAsb0hBR21HLE1BSG5HLDBIQUlpRyxNQUpqRyxjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUdNLFNBQVMs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QUFnQyxPQUFoQyxFQUF5QyxTQUF6QyxFQUFvRDtBQUNqRCxXQUFPO0FBQ0gsWUFBSSxPQUREO0FBRUgsY0FBTSxnQkFGSDtBQUdILGdCQUFRLFFBSEw7QUFJSCx3QkFBZ0Isc0NBSmIsRUFJcUQ7QUFDeEQsZUFBTztBQUNGLHNDQUEwQixDQUFDLFNBQUQsR0FBYSxHQUFiLEdBQW1CLENBRDNDO0FBRUYscUNBQXlCLENBRnZCO0FBR0Ysb0NBQXdCO0FBSHRCO0FBTEosS0FBUDtBQVdIO0FBQ0EsU0FBUyxxQkFBVCxDQUErQixRQUEvQixFQUF5QyxPQUF6QyxFQUFrRDtBQUMvQyxXQUFPO0FBQ0gsWUFBSSxPQUREO0FBRUgsY0FBTSxNQUZIO0FBR0gsZ0JBQVEsUUFITDtBQUlILHdCQUFnQixzQ0FKYixFQUlxRDtBQUN4RCxlQUFPO0FBQ0YsMEJBQWM7QUFEWixTQUxKO0FBUUgsZ0JBQVEsQ0FBQyxJQUFELEVBQU8sVUFBUCxFQUFtQixHQUFuQjtBQVJMLEtBQVA7QUFVSCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cbmV4cG9ydCBmdW5jdGlvbiBzaG93UmFkaXVzTGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICAvLyBUT0RPIHBhZCB0aGUgc21hbGwgY2lyY2xlIHNvIHRoZSB0ZXh0IHN0YXJ0cyBhdCB0aGUgc2FtZSBYIHBvc2l0aW9uIGZvciBib3RoXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjZweDsgd2lkdGg6IDZweDsgYm9yZGVyLXJhZGl1czogM3B4XCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAyMHB4OyBib3JkZXItcmFkaXVzOiAxMHB4XCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPmA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dFeHRydXNpb25IZWlnaHRMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG5cbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYig0MCw0MCwyNTApXCI+PC9zcGFuPjxsYWJlbD4ke21heFZhbH08L2xhYmVsPjxici8+YCArXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjNweDsgd2lkdGg6IDEycHg7IGJhY2tncm91bmQ6IHJnYigyMCwyMCw0MClcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+YDsgXG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGlmIChjbG9zZUhhbmRsZXIpIHtcbiAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0NhdGVnb3J5TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBjb2xvclN0b3BzLCBjbG9zZUhhbmRsZXIpIHtcbiAgICBsZXQgbGVnZW5kSHRtbCA9IFxuICAgICAgICAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyArXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuICAgICAgICBjb2xvclN0b3BzXG4gICAgICAgICAgICAuc29ydCgoc3RvcGEsIHN0b3BiKSA9PiBzdG9wYVswXS5sb2NhbGVDb21wYXJlKHN0b3BiWzBdKSkgLy8gc29ydCBvbiB2YWx1ZXNcbiAgICAgICAgICAgIC5tYXAoc3RvcCA9PiBgPHNwYW4gY2xhc3M9XCJib3hcIiBzdHlsZT0nYmFja2dyb3VuZDogJHtzdG9wWzFdfSc+PC9zcGFuPjxsYWJlbD4ke3N0b3BbMF19PC9sYWJlbD48YnIvPmApXG4gICAgICAgICAgICAuam9pbignXFxuJylcbiAgICAgICAgO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG59IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5cbmltcG9ydCAqIGFzIGxlZ2VuZCBmcm9tICcuL2xlZ2VuZCc7XG4vKlxuV3JhcHMgYSBNYXBib3ggbWFwIHdpdGggZGF0YSB2aXMgY2FwYWJpbGl0aWVzIGxpa2UgY2lyY2xlIHNpemUgYW5kIGNvbG9yLCBhbmQgcG9seWdvbiBoZWlnaHQuXG5cbnNvdXJjZURhdGEgaXMgYW4gb2JqZWN0IHdpdGg6XG4tIGRhdGFJZFxuLSBsb2NhdGlvbkNvbHVtblxuLSB0ZXh0Q29sdW1uc1xuLSBudW1lcmljQ29sdW1uc1xuLSByb3dzXG4tIHNoYXBlXG4tIG1pbnMsIG1heHNcbiovXG5jb25zdCBkZWYgPSAoYSwgYikgPT4gYSAhPT0gdW5kZWZpbmVkID8gYSA6IGI7XG5cbmxldCB1bmlxdWUgPSAwO1xuXG5leHBvcnQgY2xhc3MgTWFwVmlzIHtcbiAgICBjb25zdHJ1Y3RvcihtYXAsIHNvdXJjZURhdGEsIGZpbHRlciwgZmVhdHVyZUhvdmVySG9vaywgb3B0aW9ucykge1xuICAgICAgICB0aGlzLm1hcCA9IG1hcDtcbiAgICAgICAgdGhpcy5zb3VyY2VEYXRhID0gc291cmNlRGF0YTtcbiAgICAgICAgdGhpcy5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgICAgIHRoaXMuZmVhdHVyZUhvdmVySG9vayA9IGZlYXR1cmVIb3Zlckhvb2s7IC8vIGYocHJvcGVydGllcywgc291cmNlRGF0YSlcbiAgICAgICAgb3B0aW9ucyA9IGRlZihvcHRpb25zLCB7fSk7XG4gICAgICAgIHRoaXMub3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGNpcmNsZVJhZGl1czogZGVmKG9wdGlvbnMuY2lyY2xlUmFkaXVzLCAyMCksXG4gICAgICAgICAgICBpbnZpc2libGU6IG9wdGlvbnMuaW52aXNpYmxlLCAvLyB3aGV0aGVyIHRvIGNyZWF0ZSB3aXRoIG9wYWNpdHkgMFxuICAgICAgICAgICAgc3ltYm9sOiBvcHRpb25zLnN5bWJvbCwgLy8gTWFwYm94IHN5bWJvbCBwcm9wZXJ0aWVzLCBtZWFuaW5nIHdlIHNob3cgc3ltYm9sIGluc3RlYWQgb2YgY2lyY2xlXG4gICAgICAgICAgICBlbnVtQ29sb3JzOiBvcHRpb25zLmVudW1Db2xvcnMgLy8gb3ZlcnJpZGUgZGVmYXVsdCBjb2xvciBjaG9pY2VzXG4gICAgICAgIH07XG5cbiAgICAgICAgLy90aGlzLm9wdGlvbnMuaW52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIC8vIFRPRE8gc2hvdWxkIGJlIHBhc3NlZCBhIExlZ2VuZCBvYmplY3Qgb2Ygc29tZSBraW5kLlxuXG4gICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLmxheWVySWQgPSBzb3VyY2VEYXRhLnNoYXBlICsgJy0nICsgc291cmNlRGF0YS5kYXRhSWQgKyAnLScgKyAodW5pcXVlKyspO1xuICAgICAgICB0aGlzLmxheWVySWRIaWdobGlnaHQgPSB0aGlzLmxheWVySWQgKyAnLWhpZ2hsaWdodCc7XG5cblxuICAgICAgICBcbiAgICAgICAgLy8gQ29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gYSBNYXBib3ggZGF0YXNvdXJjZVxuICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgcG9pbnREYXRhc2V0VG9HZW9KU09OKHRoaXMuc291cmNlRGF0YSkgKTtcblxuICAgICAgICAgICAgaWYgKCF0aGlzLm9wdGlvbnMuc3ltYm9sKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgdGhpcy5maWx0ZXIsIGZhbHNlLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaylcbiAgICAgICAgICAgICAgICAgICAgLy8gdHJ5IHVzaW5nIGEgY2lyY2xlIGhpZ2hsaWdodCBldmVuIG9uIGFuIGljb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIoY2lyY2xlTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgICAgICAgICAgLy90aGlzLm1hcC5hZGRMYXllcihzeW1ib2xMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuc3ltYm9sLCBbJz09JywgdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uLCAnLSddLCB0cnVlKSk7IC8vIGhpZ2hsaWdodCBsYXllclxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIFxuXG4gICAgICAgIHRoaXMuYWRkUG9seWdvbnNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgLy8gd2UgZG9uJ3QgbmVlZCB0byBjb25zdHJ1Y3QgYSBcInBvbHlnb24gZGF0YXNvdXJjZVwiLCB0aGUgZ2VvbWV0cnkgZXhpc3RzIGluIE1hcGJveCBhbHJlYWR5XG4gICAgICAgICAgICAvLyBodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvRWNvbm9teS9FbXBsb3ltZW50LWJ5LWJsb2NrLWJ5LWluZHVzdHJ5L2IzNmota2l5NFxuICAgICAgICAgICAgXG4gICAgICAgICAgICAvLyBhZGQgQ0xVRSBibG9ja3MgcG9seWdvbiBkYXRhc2V0LCByaXBlIGZvciBjaG9yb3BsZXRoaW5nXG4gICAgICAgICAgICBsZXQgc291cmNlSWQgPSAnZGF0YXNldC0nICsgdGhpcy5zb3VyY2VEYXRhLmRhdGFJZDtcbiAgICAgICAgICAgIGlmICghdGhpcy5tYXAuZ2V0U291cmNlKHNvdXJjZUlkKSkgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZFNvdXJjZShzb3VyY2VJZCwgeyBcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ3ZlY3RvcicsIFxuICAgICAgICAgICAgICAgICAgICB1cmw6ICdtYXBib3g6Ly9vcGVuY291bmNpbGRhdGEuYWVkZm15cDgnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBpZiAodGhpcy5mZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkhpZ2hsaWdodExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25MYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkLCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coJ1RoaXMgaXMgYSBzeW1ib2wgbGF5ZXIsIHdlIGlnbm9yZSBzZXRWaXNDb2x1bW4uJyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbHVtbk5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGNvbHVtbk5hbWUgPSBzb3VyY2VEYXRhLnRleHRDb2x1bW5zWzBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gY29sdW1uTmFtZTtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCdEYXRhIGNvbHVtbjogJyArIHRoaXMuZGF0YUNvbHVtbik7XG5cbiAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLm51bWVyaWNDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7IC8vIHBvbHlnb25cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gVE9ETyBhZGQgY2xvc2UgYnV0dG9uIGJlaGF2aW91ci4gbWF5YmU/XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChzb3VyY2VEYXRhLnRleHRDb2x1bW5zLmluZGV4T2YodGhpcy5kYXRhQ29sdW1uKSA+PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gVE9ETyBoYW5kbGUgZW51bSBmaWVsZHMgb24gcG9seWdvbnMgKG5vIGV4YW1wbGUgY3VycmVudGx5KVxuICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgbGV0IG1pblNpemUgPSAwLjMgKiB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuICAgICAgICAgICAgbGV0IG1heFNpemUgPSB0aGlzLm9wdGlvbnMuY2lyY2xlUmFkaXVzO1xuXG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1yYWRpdXMnLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6IGRhdGFDb2x1bW4sXG4gICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl19LCBtaW5TaXplLzNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemUvM10sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgbWluU2l6ZV0sXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDE3LCB2YWx1ZTogc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dfSwgbWF4U2l6ZV1cbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgbGVnZW5kLnNob3dSYWRpdXNMZWdlbmQoJyNsZWdlbmQtbnVtZXJpYycsIGRhdGFDb2x1bW4sIHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgLy8gQ2FuJ3Qgc2FmZWx5IGNsb3NlIG51bWVyaWMgY29sdW1ucyB5ZXQuIGh0dHBzOi8vZ2l0aHViLmNvbS9tYXBib3gvbWFwYm94LWdsLWpzL2lzc3Vlcy8zOTQ5XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5yZW1vdmVDaXJjbGVSYWRpdXMgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLXJhZGl1cycsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNsZWdlbmQtbnVtZXJpYycpLmlubmVySFRNTCA9ICcnO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlQ29sb3JTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIC8vIGZyb20gQ29sb3JCcmV3ZXJcbiAgICAgICAgICAgIGNvbnN0IGVudW1Db2xvcnMgPSBkZWYodGhpcy5vcHRpb25zLmVudW1Db2xvcnMsIFsnIzFmNzhiNCcsJyNmYjlhOTknLCcjYjJkZjhhJywnIzMzYTAyYycsJyNlMzFhMWMnLCcjZmRiZjZmJywnI2E2Y2VlMycsICcjZmY3ZjAwJywnI2NhYjJkNicsJyM2YTNkOWEnLCcjZmZmZjk5JywnI2IxNTkyOCddKTtcblxuICAgICAgICAgICAgbGV0IGVudW1TdG9wcyA9IHRoaXMuc291cmNlRGF0YS5zb3J0ZWRGcmVxdWVuY2llc1tkYXRhQ29sdW1uXS5tYXAoKHZhbCxpKSA9PiBbdmFsLCBlbnVtQ29sb3JzW2kgJSBlbnVtQ29sb3JzLmxlbmd0aF1dKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnY2lyY2xlLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IGVudW1TdG9wc1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAvLyBUT0RPIHRlc3QgY2xvc2UgaGFuZGxlciwgY3VycmVudGx5IG5vbiBmdW5jdGlvbmFsIGR1ZSB0byBwb2ludGVyLWV2ZW50czpub25lIGluIENTU1xuICAgICAgICAgICAgbGVnZW5kLnNob3dDYXRlZ29yeUxlZ2VuZCgnI2xlZ2VuZC1lbnVtJywgZGF0YUNvbHVtbiwgZW51bVN0b3BzLCB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yLmJpbmQodGhpcykpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlQ29sb3IgPSBmdW5jdGlvbihlKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwnY2lyY2xlLWNvbG9yJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtY29sb3InXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLWVudW0nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICAgIEFwcGxpZXMgYSBzdHlsZSB0aGF0IHJlcHJlc2VudHMgbnVtZXJpYyBkYXRhIHZhbHVlcyBhcyBoZWlnaHRzIG9mIGV4dHJ1ZGVkIHBvbHlnb25zLlxuICAgICAgICAgICAgVE9ETzogYWRkIHJlbW92ZVBvbHlnb25IZWlnaHRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCcsICB7XG4gICAgICAgICAgICAgICAgLy8gcmVtZW1iZXIsIHRoZSBkYXRhIGRvZXNuJ3QgZXhpc3QgaW4gdGhlIHBvbHlnb24gc2V0LCBpdCdzIGp1c3QgYSBodWdlIHZhbHVlIGxvb2t1cFxuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLC8vbG9jYXRpb25Db2x1bW4sIC8vIHRoZSBJRCBvbiB0aGUgYWN0dWFsIGdlb21ldHJ5IGRhdGFzZXRcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKCkgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAxMDAwXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJyxcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAgICAgLy8ubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdyZ2IoMCwwLCcgKyBNYXRoLnJvdW5kKDQwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiAyMDApICsgJyknXSlcbiAgICAgICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAnaHNsKDM0MCw4OCUsJyArIE1hdGgucm91bmQoMjAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDUwKSArICclKSddKVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIodGhpcy5sYXllcklkLCBbJyFpbicsICdibG9ja19pZCcsIC4uLigvKiAjIyMgVE9ETyBnZW5lcmFsaXNlICovIFxuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvd1tkYXRhQ29sdW1uXSA9PT0gMClcbiAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiByb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkpXSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCB0aGlzLnNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLmxheWVySWQpO1xuICAgICAgICAgICAgaWYgKHRoaXMubW91c2Vtb3ZlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkSGlnaGxpZ2h0KTtcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5vZmYoJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgICAgICAgICB0aGlzLm1vdXNlbW92ZSA9IHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICAgICAgLy8gVGhlIGFjdHVhbCBjb25zdHJ1Y3Rvci4uLlxuICAgICAgICBpZiAodGhpcy5zb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvaW50c1RvTWFwKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSAoZSA9PiB7XG4gICAgICAgICAgICAgICAgdmFyIGYgPSB0aGlzLm1hcC5xdWVyeVJlbmRlcmVkRmVhdHVyZXMoZS5wb2ludCwgeyBsYXllcnM6IFt0aGlzLmxheWVySWRdfSlbMF07ICBcbiAgICAgICAgICAgICAgICBpZiAoZiAmJiBmICE9PSB0aGlzLmxhc3RGZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcblxuICAgICAgICAgICAgICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gZjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZlYXR1cmVIb3Zlckhvb2soZi5wcm9wZXJ0aWVzLCB0aGlzLnNvdXJjZURhdGEsIHRoaXMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgZi5wcm9wZXJ0aWVzW3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1dKTsgLy8gd2UgZG9uJ3QgaGF2ZSBhbnkgb3RoZXIgcmVsaWFibGUga2V5P1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgWyc9PScsICdibG9ja19pZCcsIGYucHJvcGVydGllcy5ibG9ja19pZF0pOyAvLyBkb24ndCBoYXZlIGEgZ2VuZXJhbCB3YXkgdG8gbWF0Y2ggb3RoZXIga2luZHMgb2YgcG9seWdvbnNcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZi5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pLmJpbmQodGhpcyk7XG4gICAgICAgICAgICB0aGlzLm1hcC5vbignbW91c2Vtb3ZlJywgdGhpcy5tb3VzZW1vdmUpO1xuICAgICAgICB9XG4gICAgICAgIFxuXG5cblxuICAgICAgICBcblxuICAgIH1cbn1cblxuLy8gY29udmVydCBhIHRhYmxlIG9mIHJvd3MgdG8gR2VvSlNPTlxuZnVuY3Rpb24gcG9pbnREYXRhc2V0VG9HZW9KU09OKHNvdXJjZURhdGEpIHtcbiAgICBsZXQgZGF0YXNvdXJjZSA9IHtcbiAgICAgICAgdHlwZTogJ2dlb2pzb24nLFxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICB0eXBlOiAnRmVhdHVyZUNvbGxlY3Rpb24nLFxuICAgICAgICAgICAgZmVhdHVyZXM6IFtdXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgc291cmNlRGF0YS5yb3dzLmZvckVhY2gocm93ID0+IHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pIHtcbiAgICAgICAgICAgICAgICBkYXRhc291cmNlLmRhdGEuZmVhdHVyZXMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdGZWF0dXJlJyxcbiAgICAgICAgICAgICAgICAgICAgcHJvcGVydGllczogcm93LFxuICAgICAgICAgICAgICAgICAgICBnZW9tZXRyeToge1xuICAgICAgICAgICAgICAgICAgICAgICAgdHlwZTogJ1BvaW50JyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvb3JkaW5hdGVzOiByb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pOyAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHsgLy8gSnVzdCBkb24ndCBwdXNoIGl0IFxuICAgICAgICAgICAgY29uc29sZS5sb2coYEJhZCBsb2NhdGlvbjogJHtyb3dbc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl19YCk7ICAgICAgICAgICAgXG4gICAgICAgIH1cbiAgICB9KTtcbiAgICByZXR1cm4gZGF0YXNvdXJjZTtcbn07XG5cbmZ1bmN0aW9uIGNpcmNsZUxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBmaWx0ZXIsIGhpZ2hsaWdodCwgc2l6ZSwgaW52aXNpYmxlKSB7XG4gICAgbGV0IHJldCA9IHtcbiAgICAgICAgaWQ6IGxheWVySWQsXG4gICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICBzb3VyY2U6IHNvdXJjZUlkLFxuICAgICAgICBwYWludDoge1xuLy8gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ2hzbCgyMCwgOTUlLCA1MCUpJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAncmdiYSgwLDAsMCwwKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAhaW52aXNpYmxlID8gMC45NSA6IDAsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOTUgOiAwLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2UtY29sb3InOiBoaWdobGlnaHQgPyAnd2hpdGUnIDogJ3JnYmEoNTAsNTAsNTAsMC41KScsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IHtcbiAgICAgICAgICAgICAgICBzdG9wczogaGlnaGxpZ2h0ID8gW1xuICAgICAgICAgICAgICAgICAgICBbMTAsc2l6ZSAqIDAuNF0sIFxuICAgICAgICAgICAgICAgICAgICBbMTcsc2l6ZSAqIDEuMF1cbiAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBbMTAsc2l6ZSAqIDAuMl0sIFxuICAgICAgICAgICAgICAgICAgICBbMTcsc2l6ZSAqIDAuNV1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc3ltYm9sTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIHN5bWJvbCwgZmlsdGVyLCBoaWdobGlnaHQsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZFxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcblxuICAgIHJldC5wYWludCA9IGRlZihzeW1ib2wucGFpbnQsIHt9KTtcbiAgICByZXQucGFpbnRbJ2ljb24tb3BhY2l0eSddID0gIWludmlzaWJsZSA/IDAuOTUgOiAwO1xuXG4gICAgLy9yZXQubGF5b3V0ID0gZGVmKHN5bWJvbC5sYXlvdXQsIHt9KTtcbiAgICBpZiAoc3ltYm9sLmxheW91dCkge1xuICAgICAgICBpZiAoc3ltYm9sLmxheW91dFsndGV4dC1maWVsZCddICYmIGludmlzaWJsZSlcbiAgICAgICAgICAgIHJldC5wYWludFsndGV4dC1vcGFjaXR5J10gPSAwO1xuICAgICAgICByZXQubGF5b3V0ID0gc3ltYm9sLmxheW91dDtcbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuXG4gZnVuY3Rpb24gcG9seWdvbkxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBpbnZpc2libGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjggOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICcjMDAzJ1xuICAgICAgICAgfSxcbiAgICB9O1xufVxuIGZ1bmN0aW9uIHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnd2hpdGUnXG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlcjogWyc9PScsICdibG9ja19pZCcsICctJ11cbiAgICB9O1xufVxuXG4iXX0=

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2xlZ2VuZC5qcyIsInNyYy9qcy9tYXBWaXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0NnQixnQixHQUFBLGdCO1FBY0EseUIsR0FBQSx5QjtRQWVBLGtCLEdBQUEsa0I7QUE5QmhCO0FBQ08sU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QixVQUE5QixFQUEwQyxNQUExQyxFQUFrRCxNQUFsRCxFQUEwRCxZQUExRCxFQUF3RTtBQUMzRSxRQUFJLGFBQ0EsQ0FBQyxlQUFlLGtDQUFmLEdBQW9ELEVBQXJELGNBQ08sVUFEUDtBQUVBO0FBRkEsK0ZBR3lGLE1BSHpGLHFIQUk0RixNQUo1RixjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUVNLFNBQVMseUJBQVQsQ0FBbUMsRUFBbkMsRUFBdUMsVUFBdkMsRUFBbUQsTUFBbkQsRUFBMkQsTUFBM0QsRUFBbUUsWUFBbkUsRUFBaUY7QUFDcEYsUUFBSSxhQUNBLENBQUMsZUFBZSxrQ0FBZixHQUFvRCxFQUFyRCxjQUNPLFVBRFAsb0hBR21HLE1BSG5HLDBIQUlpRyxNQUpqRyxjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUdNLFNBQVMs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LFlBQUksT0FERDtBQUVILGNBQU0sZ0JBRkg7QUFHSCxnQkFBUSxRQUhMO0FBSUgsd0JBQWdCLHNDQUpiLEVBSXFEO0FBQ3hELGVBQU87QUFDRixzQ0FBMEIsQ0FBQyxTQUFELEdBQWEsR0FBYixHQUFtQixDQUQzQztBQUVGLHFDQUF5QixDQUZ2QjtBQUdGLG9DQUF3QjtBQUh0QjtBQUxKLEtBQVA7QUFXSDtBQUNBLFNBQVMscUJBQVQsQ0FBK0IsUUFBL0IsRUFBeUMsT0FBekMsRUFBa0Q7QUFDL0MsV0FBTztBQUNILFlBQUksT0FERDtBQUVILGNBQU0sTUFGSDtBQUdILGdCQUFRLFFBSEw7QUFJSCx3QkFBZ0Isc0NBSmIsRUFJcUQ7QUFDeEQsZUFBTztBQUNGLDBCQUFjO0FBRFosU0FMSjtBQVFILGdCQUFRLENBQUMsSUFBRCxFQUFPLFVBQVAsRUFBbUIsR0FBbkI7QUFSTCxLQUFQO0FBVUgiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5leHBvcnQgZnVuY3Rpb24gc2hvd1JhZGl1c0xlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgLy8gVE9ETyBwYWQgdGhlIHNtYWxsIGNpcmNsZSBzbyB0aGUgdGV4dCBzdGFydHMgYXQgdGhlIHNhbWUgWCBwb3NpdGlvbiBmb3IgYm90aFxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDo2cHg7IHdpZHRoOiA2cHg7IGJvcmRlci1yYWRpdXM6IDNweFwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMjBweDsgYm9yZGVyLXJhZGl1czogMTBweFwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD5gO1xuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKGlkLCBjb2x1bW5OYW1lLCBtaW5WYWwsIG1heFZhbCwgY2xvc2VIYW5kbGVyKSB7XG4gICAgdmFyIGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgKGNsb3NlSGFuZGxlciA/ICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nIDogJycpICsgXG4gICAgICAgIGA8aDM+JHtjb2x1bW5OYW1lfTwvaDM+YCArIFxuXG4gICAgICAgIGA8c3BhbiBjbGFzcz1cImNpcmNsZVwiIHN0eWxlPVwiaGVpZ2h0OjIwcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoNDAsNDAsMjUwKVwiPjwvc3Bhbj48bGFiZWw+JHttYXhWYWx9PC9sYWJlbD48YnIvPmAgK1xuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDozcHg7IHdpZHRoOiAxMnB4OyBiYWNrZ3JvdW5kOiByZ2IoMjAsMjAsNDApXCI+PC9zcGFuPjxsYWJlbD4ke21pblZhbH08L2xhYmVsPmA7IFxuXG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCkuaW5uZXJIVE1MID0gbGVnZW5kSHRtbDtcbiAgICBpZiAoY2xvc2VIYW5kbGVyKSB7XG4gICAgICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbiAgICB9XG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHNob3dDYXRlZ29yeUxlZ2VuZChpZCwgY29sdW1uTmFtZSwgY29sb3JTdG9wcywgY2xvc2VIYW5kbGVyKSB7XG4gICAgbGV0IGxlZ2VuZEh0bWwgPSBcbiAgICAgICAgJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgK1xuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcbiAgICAgICAgY29sb3JTdG9wc1xuICAgICAgICAgICAgLnNvcnQoKHN0b3BhLCBzdG9wYikgPT4gc3RvcGFbMF0ubG9jYWxlQ29tcGFyZShzdG9wYlswXSkpIC8vIHNvcnQgb24gdmFsdWVzXG4gICAgICAgICAgICAubWFwKHN0b3AgPT4gYDxzcGFuIGNsYXNzPVwiYm94XCIgc3R5bGU9J2JhY2tncm91bmQ6ICR7c3RvcFsxXX0nPjwvc3Bhbj48bGFiZWw+JHtzdG9wWzBdfTwvbGFiZWw+PGJyLz5gKVxuICAgICAgICAgICAgLmpvaW4oJ1xcbicpXG4gICAgICAgIDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcihpZCArICcgLmNsb3NlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjbG9zZUhhbmRsZXIpO1xufSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuXG5pbXBvcnQgKiBhcyBsZWdlbmQgZnJvbSAnLi9sZWdlbmQnO1xuLypcbldyYXBzIGEgTWFwYm94IG1hcCB3aXRoIGRhdGEgdmlzIGNhcGFiaWxpdGllcyBsaWtlIGNpcmNsZSBzaXplIGFuZCBjb2xvciwgYW5kIHBvbHlnb24gaGVpZ2h0LlxuXG5zb3VyY2VEYXRhIGlzIGFuIG9iamVjdCB3aXRoOlxuLSBkYXRhSWRcbi0gbG9jYXRpb25Db2x1bW5cbi0gdGV4dENvbHVtbnNcbi0gbnVtZXJpY0NvbHVtbnNcbi0gcm93c1xuLSBzaGFwZVxuLSBtaW5zLCBtYXhzXG4qL1xuY29uc3QgZGVmID0gKGEsIGIpID0+IGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xuXG5sZXQgdW5pcXVlID0gMDtcblxuZXhwb3J0IGNsYXNzIE1hcFZpcyB7XG4gICAgY29uc3RydWN0b3IobWFwLCBzb3VyY2VEYXRhLCBmaWx0ZXIsIGZlYXR1cmVIb3Zlckhvb2ssIG9wdGlvbnMpIHtcbiAgICAgICAgdGhpcy5tYXAgPSBtYXA7XG4gICAgICAgIHRoaXMuc291cmNlRGF0YSA9IHNvdXJjZURhdGE7XG4gICAgICAgIHRoaXMuZmlsdGVyID0gZmlsdGVyO1xuICAgICAgICB0aGlzLmZlYXR1cmVIb3Zlckhvb2sgPSBmZWF0dXJlSG92ZXJIb29rOyAvLyBmKHByb3BlcnRpZXMsIHNvdXJjZURhdGEpXG4gICAgICAgIG9wdGlvbnMgPSBkZWYob3B0aW9ucywge30pO1xuICAgICAgICB0aGlzLm9wdGlvbnMgPSB7XG4gICAgICAgICAgICBjaXJjbGVSYWRpdXM6IGRlZihvcHRpb25zLmNpcmNsZVJhZGl1cywgMjApLFxuICAgICAgICAgICAgaW52aXNpYmxlOiBvcHRpb25zLmludmlzaWJsZSwgLy8gd2hldGhlciB0byBjcmVhdGUgd2l0aCBvcGFjaXR5IDBcbiAgICAgICAgICAgIHN5bWJvbDogb3B0aW9ucy5zeW1ib2wsIC8vIE1hcGJveCBzeW1ib2wgcHJvcGVydGllcywgbWVhbmluZyB3ZSBzaG93IHN5bWJvbCBpbnN0ZWFkIG9mIGNpcmNsZVxuICAgICAgICAgICAgZW51bUNvbG9yczogb3B0aW9ucy5lbnVtQ29sb3JzIC8vIG92ZXJyaWRlIGRlZmF1bHQgY29sb3IgY2hvaWNlc1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vdGhpcy5vcHRpb25zLmludmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBUT0RPIHNob3VsZCBiZSBwYXNzZWQgYSBMZWdlbmQgb2JqZWN0IG9mIHNvbWUga2luZC5cblxuICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSB1bmRlZmluZWQ7XG5cbiAgICAgICAgdGhpcy5sYXllcklkID0gc291cmNlRGF0YS5zaGFwZSArICctJyArIHNvdXJjZURhdGEuZGF0YUlkICsgJy0nICsgKHVuaXF1ZSsrKTtcbiAgICAgICAgdGhpcy5sYXllcklkSGlnaGxpZ2h0ID0gdGhpcy5sYXllcklkICsgJy1oaWdobGlnaHQnO1xuXG5cbiAgICAgICAgXG4gICAgICAgIC8vIENvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIGEgTWFwYm94IGRhdGFzb3VyY2VcbiAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHBvaW50RGF0YXNldFRvR2VvSlNPTih0aGlzLnNvdXJjZURhdGEpICk7XG5cbiAgICAgICAgICAgIGlmICghdGhpcy5vcHRpb25zLnN5bWJvbCkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cywgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHN5bWJvbExheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWQsIHRoaXMub3B0aW9ucy5zeW1ib2wsIHRoaXMuZmlsdGVyLCBmYWxzZSwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmZlYXR1cmVIb3Zlckhvb2spXG4gICAgICAgICAgICAgICAgICAgIC8vIHRyeSB1c2luZyBhIGNpcmNsZSBoaWdobGlnaHQgZXZlbiBvbiBhbiBpY29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKGNpcmNsZUxheWVyKHNvdXJjZUlkLCB0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUsIHRoaXMub3B0aW9ucy5jaXJjbGVSYWRpdXMsIHRoaXMub3B0aW9ucy5pbnZpc2libGUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgICAgICAgICAgICAgIC8vdGhpcy5tYXAuYWRkTGF5ZXIoc3ltYm9sTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZEhpZ2hsaWdodCwgdGhpcy5vcHRpb25zLnN5bWJvbCwgWyc9PScsIHRoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbiwgJy0nXSwgdHJ1ZSkpOyAvLyBoaWdobGlnaHQgbGF5ZXJcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICBcblxuICAgICAgICB0aGlzLmFkZFBvbHlnb25zVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIHdlIGRvbid0IG5lZWQgdG8gY29uc3RydWN0IGEgXCJwb2x5Z29uIGRhdGFzb3VyY2VcIiwgdGhlIGdlb21ldHJ5IGV4aXN0cyBpbiBNYXBib3ggYWxyZWFkeVxuICAgICAgICAgICAgLy8gaHR0cHM6Ly9kYXRhLm1lbGJvdXJuZS52aWMuZ292LmF1L0Vjb25vbXkvRW1wbG95bWVudC1ieS1ibG9jay1ieS1pbmR1c3RyeS9iMzZqLWtpeTRcbiAgICAgICAgICAgIFxuICAgICAgICAgICAgLy8gYWRkIENMVUUgYmxvY2tzIHBvbHlnb24gZGF0YXNldCwgcmlwZSBmb3IgY2hvcm9wbGV0aGluZ1xuICAgICAgICAgICAgbGV0IHNvdXJjZUlkID0gJ2RhdGFzZXQtJyArIHRoaXMuc291cmNlRGF0YS5kYXRhSWQ7XG4gICAgICAgICAgICBpZiAoIXRoaXMubWFwLmdldFNvdXJjZShzb3VyY2VJZCkpICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLm1hcC5hZGRTb3VyY2Uoc291cmNlSWQsIHsgXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICd2ZWN0b3InLCBcbiAgICAgICAgICAgICAgICAgICAgdXJsOiAnbWFwYm94Oi8vb3BlbmNvdW5jaWxkYXRhLmFlZGZteXA4J1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMuZmVhdHVyZUhvdmVySG9vaykge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgdGhpcy5sYXllcklkSGlnaGxpZ2h0LCB0aGlzLm9wdGlvbnMuaW52aXNpYmxlKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm1hcC5hZGRMYXllcihwb2x5Z29uTGF5ZXIoc291cmNlSWQsIHRoaXMubGF5ZXJJZCwgdGhpcy5vcHRpb25zLmludmlzaWJsZSkpO1xuICAgICAgICAgICAgXG4gICAgICAgIH07XG5cblxuXG4gICAgXG4gICAgICAgIC8vIHN3aXRjaCB2aXN1YWxpc2F0aW9uIHRvIHVzaW5nIHRoaXMgY29sdW1uXG4gICAgICAgIHRoaXMuc2V0VmlzQ29sdW1uID0gZnVuY3Rpb24oY29sdW1uTmFtZSkge1xuICAgICAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5zeW1ib2wpIHtcbiAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKCdUaGlzIGlzIGEgc3ltYm9sIGxheWVyLCB3ZSBpZ25vcmUgc2V0VmlzQ29sdW1uLicpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChjb2x1bW5OYW1lID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICBjb2x1bW5OYW1lID0gc291cmNlRGF0YS50ZXh0Q29sdW1uc1swXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuZGF0YUNvbHVtbiA9IGNvbHVtbk5hbWU7XG4gICAgICAgICAgICBjb25zb2xlLmxvZygnRGF0YSBjb2x1bW46ICcgKyB0aGlzLmRhdGFDb2x1bW4pO1xuXG4gICAgICAgICAgICBpZiAoc291cmNlRGF0YS5udW1lcmljQ29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBwb2x5Z29uXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE8gYWRkIGNsb3NlIGJ1dHRvbiBiZWhhdmlvdXIuIG1heWJlP1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291cmNlRGF0YS50ZXh0Q29sdW1ucy5pbmRleE9mKHRoaXMuZGF0YUNvbHVtbikgPj0gMCkge1xuICAgICAgICAgICAgICAgIC8vIFRPRE8gaGFuZGxlIGVudW0gZmllbGRzIG9uIHBvbHlnb25zIChubyBleGFtcGxlIGN1cnJlbnRseSlcbiAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUodGhpcy5kYXRhQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5zZXRDaXJjbGVSYWRpdXNTdHlsZSA9IGZ1bmN0aW9uKGRhdGFDb2x1bW4pIHtcbiAgICAgICAgICAgIGxldCBtaW5TaXplID0gMC4zICogdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcbiAgICAgICAgICAgIGxldCBtYXhTaXplID0gdGhpcy5vcHRpb25zLmNpcmNsZVJhZGl1cztcblxuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdjaXJjbGUtcmFkaXVzJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiBkYXRhQ29sdW1uLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgIFt7IHpvb206IDEwLCB2YWx1ZTogc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dfSwgbWluU2l6ZS8zXSxcbiAgICAgICAgICAgICAgICAgICAgW3sgem9vbTogMTAsIHZhbHVlOiBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl19LCBtYXhTaXplLzNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIG1pblNpemVdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIG1heFNpemVdXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93UmFkaXVzTGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCBzb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXS8qLCByZW1vdmVDaXJjbGVSYWRpdXMqLyk7IC8vIENhbid0IHNhZmVseSBjbG9zZSBudW1lcmljIGNvbHVtbnMgeWV0LiBodHRwczovL2dpdGh1Yi5jb20vbWFwYm94L21hcGJveC1nbC1qcy9pc3N1ZXMvMzk0OVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMucmVtb3ZlQ2lyY2xlUmFkaXVzID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgY29uc29sZS5sb2cocG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtcmFkaXVzJ10pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1yYWRpdXMnLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLW51bWVyaWMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICAvLyBmcm9tIENvbG9yQnJld2VyXG4gICAgICAgICAgICBjb25zdCBlbnVtQ29sb3JzID0gZGVmKHRoaXMub3B0aW9ucy5lbnVtQ29sb3JzLCBbJyMxZjc4YjQnLCcjZmI5YTk5JywnI2IyZGY4YScsJyMzM2EwMmMnLCcjZTMxYTFjJywnI2ZkYmY2ZicsJyNhNmNlZTMnLCAnI2ZmN2YwMCcsJyNjYWIyZDYnLCcjNmEzZDlhJywnI2ZmZmY5OScsJyNiMTU5MjgnXSk7XG5cbiAgICAgICAgICAgIGxldCBlbnVtU3RvcHMgPSB0aGlzLnNvdXJjZURhdGEuc29ydGVkRnJlcXVlbmNpZXNbZGF0YUNvbHVtbl0ubWFwKCh2YWwsaSkgPT4gW3ZhbCwgZW51bUNvbG9yc1tpICUgZW51bUNvbG9ycy5sZW5ndGhdXSk7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KHRoaXMubGF5ZXJJZCwgJ2NpcmNsZS1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBlbnVtU3RvcHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVE9ETyB0ZXN0IGNsb3NlIGhhbmRsZXIsIGN1cnJlbnRseSBub24gZnVuY3Rpb25hbCBkdWUgdG8gcG9pbnRlci1ldmVudHM6bm9uZSBpbiBDU1NcbiAgICAgICAgICAgIGxlZ2VuZC5zaG93Q2F0ZWdvcnlMZWdlbmQoJyNsZWdlbmQtZW51bScsIGRhdGFDb2x1bW4sIGVudW1TdG9wcywgdGhpcy5yZW1vdmVDaXJjbGVDb2xvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsJ2NpcmNsZS1jb2xvcicsIHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLWNvbG9yJ10pO1xuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xlZ2VuZC1lbnVtJykuaW5uZXJIVE1MID0gJyc7XG4gICAgICAgIH07XG4gICAgICAgIC8qXG4gICAgICAgICAgICBBcHBsaWVzIGEgc3R5bGUgdGhhdCByZXByZXNlbnRzIG51bWVyaWMgZGF0YSB2YWx1ZXMgYXMgaGVpZ2h0cyBvZiBleHRydWRlZCBwb2x5Z29ucy5cbiAgICAgICAgICAgIFRPRE86IGFkZCByZW1vdmVQb2x5Z29uSGVpZ2h0XG4gICAgICAgICovXG4gICAgICAgIHRoaXMuc2V0UG9seWdvbkhlaWdodFN0eWxlID0gZnVuY3Rpb24oZGF0YUNvbHVtbikge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSh0aGlzLmxheWVySWQsICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnLCAge1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyLCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0IGluIHRoZSBwb2x5Z29uIHNldCwgaXQncyBqdXN0IGEgaHVnZSB2YWx1ZSBsb29rdXBcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJywvL2xvY2F0aW9uQ29sdW1uLCAvLyB0aGUgSUQgb24gdGhlIGFjdHVhbCBnZW9tZXRyeSBkYXRhc2V0XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMTAwMF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkodGhpcy5sYXllcklkLCAnZmlsbC1leHRydXNpb24tY29sb3InLCB7XG4gICAgICAgICAgICAgICAgcHJvcGVydHk6ICdibG9ja19pZCcsXG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpXG4gICAgICAgICAgICAgICAgICAgIC8vLm1hcChyb3cgPT4gW3Jvd1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dLCAncmdiKDAsMCwnICsgTWF0aC5yb3VuZCg0MCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMjAwKSArICcpJ10pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ2hzbCgzNDAsODglLCcgKyBNYXRoLnJvdW5kKDIwICsgcm93W2RhdGFDb2x1bW5dIC8gdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0gKiA1MCkgKyAnJSknXSlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0RmlsdGVyKHRoaXMubGF5ZXJJZCwgWychaW4nLCAnYmxvY2tfaWQnLCAuLi4oLyogIyMjIFRPRE8gZ2VuZXJhbGlzZSAqLyBcbiAgICAgICAgICAgICAgICB0aGlzLnNvdXJjZURhdGEuZmlsdGVyZWRSb3dzKClcbiAgICAgICAgICAgICAgICAuZmlsdGVyKHJvdyA9PiByb3dbZGF0YUNvbHVtbl0gPT09IDApXG4gICAgICAgICAgICAgICAgLm1hcChyb3cgPT4gcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0pKV0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgdGhpcy5zb3VyY2VEYXRhLm1pbnNbZGF0YUNvbHVtbl0sIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dLyosIHJlbW92ZUNpcmNsZVJhZGl1cyovKTsgXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IHVuZGVmaW5lZDtcblxuICAgICAgICB0aGlzLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5sYXllcklkKTtcbiAgICAgICAgICAgIGlmICh0aGlzLm1vdXNlbW92ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLnJlbW92ZUxheWVyKHRoaXMubGF5ZXJJZEhpZ2hsaWdodCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIC8vIFRoZSBhY3R1YWwgY29uc3RydWN0b3IuLi5cbiAgICAgICAgaWYgKHRoaXMuc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgIHRoaXMubW91c2Vtb3ZlID0gKGUgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBmID0gdGhpcy5tYXAucXVlcnlSZW5kZXJlZEZlYXR1cmVzKGUucG9pbnQsIHsgbGF5ZXJzOiBbdGhpcy5sYXllcklkXX0pWzBdOyAgXG4gICAgICAgICAgICAgICAgaWYgKGYgJiYgZiAhPT0gdGhpcy5sYXN0RmVhdHVyZSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAncG9pbnRlcic7XG5cbiAgICAgICAgICAgICAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IGY7XG4gICAgICAgICAgICAgICAgICAgIGlmIChmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmZWF0dXJlSG92ZXJIb29rKGYucHJvcGVydGllcywgdGhpcy5zb3VyY2VEYXRhLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEuc2hhcGUgPT09ICdwb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sIGYucHJvcGVydGllc1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXSk7IC8vIHdlIGRvbid0IGhhdmUgYW55IG90aGVyIHJlbGlhYmxlIGtleT9cbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcih0aGlzLmxheWVySWRIaWdobGlnaHQsIFsnPT0nLCAnYmxvY2tfaWQnLCBmLnByb3BlcnRpZXMuYmxvY2tfaWRdKTsgLy8gZG9uJ3QgaGF2ZSBhIGdlbmVyYWwgd2F5IHRvIG1hdGNoIG90aGVyIGtpbmRzIG9mIHBvbHlnb25zXG4gICAgICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGYucHJvcGVydGllcyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5nZXRDYW52YXMoKS5zdHlsZS5jdXJzb3IgPSAnJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgICAgICAgICAgdGhpcy5tYXAub24oJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcbiAgICAgICAgfVxuICAgICAgICBcblxuXG5cbiAgICAgICAgXG5cbiAgICB9XG59XG5cbi8vIGNvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIEdlb0pTT05cbmZ1bmN0aW9uIHBvaW50RGF0YXNldFRvR2VvSlNPTihzb3VyY2VEYXRhKSB7XG4gICAgbGV0IGRhdGFzb3VyY2UgPSB7XG4gICAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIGZlYXR1cmVzOiBbXVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNvdXJjZURhdGEucm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSB7XG4gICAgICAgICAgICAgICAgZGF0YXNvdXJjZS5kYXRhLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHJvdyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7IC8vIEp1c3QgZG9uJ3QgcHVzaCBpdCBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWQgbG9jYXRpb246ICR7cm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dfWApOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFzb3VyY2U7XG59O1xuXG5mdW5jdGlvbiBjaXJjbGVMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCwgZmlsdGVyLCBoaWdobGlnaHQsIHNpemUsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgcGFpbnQ6IHtcbi8vICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdoc2woMjAsIDk1JSwgNTAlKScgOiAnaHNsKDIyMCw4MCUsNTAlKScsXG4gICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogaGlnaGxpZ2h0ID8gJ3JnYmEoMCwwLDAsMCknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1vcGFjaXR5JzogIWludmlzaWJsZSA/IDAuOTUgOiAwLFxuICAgICAgICAgICAgJ2NpcmNsZS1zdHJva2UtY29sb3InOiBoaWdobGlnaHQgPyAnd2hpdGUnIDogJ3JnYmEoNTAsNTAsNTAsMC41KScsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS13aWR0aCc6IDEsXG4gICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IHtcbiAgICAgICAgICAgICAgICBzdG9wczogaGlnaGxpZ2h0ID8gW1xuICAgICAgICAgICAgICAgICAgICBbMTAsc2l6ZSAqIDAuNF0sIFxuICAgICAgICAgICAgICAgICAgICBbMTcsc2l6ZSAqIDEuMF1cbiAgICAgICAgICAgICAgICBdIDogW1xuICAgICAgICAgICAgICAgICAgICBbMTAsc2l6ZSAqIDAuMl0sIFxuICAgICAgICAgICAgICAgICAgICBbMTcsc2l6ZSAqIDAuNV1dXG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIGlmIChmaWx0ZXIpXG4gICAgICAgIHJldC5maWx0ZXIgPSBmaWx0ZXI7XG4gICAgcmV0dXJuIHJldDtcbn1cblxuZnVuY3Rpb24gc3ltYm9sTGF5ZXIoc291cmNlSWQsIGxheWVySWQsIHN5bWJvbCwgZmlsdGVyLCBoaWdobGlnaHQsIGludmlzaWJsZSkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZFxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcblxuICAgIHJldC5wYWludCA9IGRlZihzeW1ib2wucGFpbnQsIHt9KTtcbiAgICByZXQucGFpbnRbJ2ljb24tb3BhY2l0eSddID0gIWludmlzaWJsZSA/IDAuOTUgOiAwO1xuXG4gICAgLy9yZXQubGF5b3V0ID0gZGVmKHN5bWJvbC5sYXlvdXQsIHt9KTtcbiAgICBpZiAoc3ltYm9sLmxheW91dCkge1xuICAgICAgICBpZiAoc3ltYm9sLmxheW91dFsndGV4dC1maWVsZCddICYmIGludmlzaWJsZSlcbiAgICAgICAgICAgIHJldC5wYWludFsndGV4dC1vcGFjaXR5J10gPSAwO1xuICAgICAgICByZXQubGF5b3V0ID0gc3ltYm9sLmxheW91dDtcbiAgICB9XG5cblxuXG4gICAgcmV0dXJuIHJldDtcbn1cblxuXG4gZnVuY3Rpb24gcG9seWdvbkxheWVyKHNvdXJjZUlkLCBsYXllcklkLCBpbnZpc2libGUpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogbGF5ZXJJZCxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6ICFpbnZpc2libGUgPyAwLjggOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiAwLFxuICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1jb2xvcic6ICcjMDAzJ1xuICAgICAgICAgfSxcbiAgICB9O1xufVxuIGZ1bmN0aW9uIHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCwgbGF5ZXJJZCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIGlkOiBsYXllcklkLFxuICAgICAgICB0eXBlOiAnZmlsbCcsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQmxvY2tzX2Zvcl9DZW5zdXNfb2ZfTGFuZF9Vc2UtN3lqOXZoJywgLy8gVE9EbyBhcmd1bWVudD9cbiAgICAgICAgcGFpbnQ6IHsgXG4gICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnd2hpdGUnXG4gICAgICAgIH0sXG4gICAgICAgIGZpbHRlcjogWyc9PScsICdibG9ja19pZCcsICctJ11cbiAgICB9O1xufVxuXG4iXX0=

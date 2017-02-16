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
var MapVis = exports.MapVis = function MapVis(map, sourceData, filter, featureHoverHook) {
    var _this2 = this;

    _classCallCheck(this, MapVis);

    this.map = map;
    this.sourceData = sourceData;
    this.filter = filter;
    this.featureHoverHook = featureHoverHook; // f(properties, sourceData)

    // TODO should be passed a Legend object of some kind.

    this.dataColumn = undefined;

    // Convert a table of rows to a Mapbox datasource
    this.addPointsToMap = function () {
        var sourceId = 'dataset-' + this.sourceData.dataId;
        if (!this.map.getSource(sourceId)) this.map.addSource(sourceId, pointDatasetToGeoJSON(this.sourceData));
        this.map.addLayer(pointLayer(sourceId, this.filter));
        this.map.addLayer(pointLayer(sourceId, ['==', this.sourceData.locationColumn, '-'], true)); // highlight layer
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
        this.map.addLayer(polygonHighlightLayer(sourceId));
        this.map.addLayer(polygonLayer(sourceId));
    };

    // switch visualisation to using this column
    this.setVisColumn = function (columnName) {
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
        this.map.setPaintProperty('points', 'circle-radius', {
            property: dataColumn,
            stops: [[{ zoom: 10, value: sourceData.mins[dataColumn] }, 1], [{ zoom: 10, value: sourceData.maxs[dataColumn] }, 3], [{ zoom: 17, value: sourceData.mins[dataColumn] }, 3], [{ zoom: 17, value: sourceData.maxs[dataColumn] }, 10]]
        });

        legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn] /*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
    };

    this.removeCircleRadius = function (e) {
        console.log(pointLayer().paint['circle-radius']);
        this.map.setPaintProperty('points', 'circle-radius', pointLayer().paint['circle-radius']);
        document.querySelector('#legend-numeric').innerHTML = '';
    };

    this.setCircleColorStyle = function (dataColumn) {
        // from ColorBrewer
        var enumColors = ['#1f78b4', '#fb9a99', '#b2df8a', '#33a02c', '#e31a1c', '#fdbf6f', '#a6cee3', '#ff7f00', '#cab2d6', '#6a3d9a', '#ffff99', '#b15928'];

        var enumStops = this.sourceData.sortedFrequencies[dataColumn].map(function (val, i) {
            return [val, enumColors[i]];
        });
        this.map.setPaintProperty('points', 'circle-color', {
            property: dataColumn,
            type: 'categorical',
            stops: enumStops
        });
        // TODO test close handler, currently non functional due to pointer-events:none in CSS
        legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, this.removeCircleColor.bind(this));
    };

    this.removeCircleColor = function (e) {
        this.map.setPaintProperty('points', 'circle-color', pointLayer().paint['circle-color']);
        document.querySelector('#legend-enum').innerHTML = '';
    };
    /*
        Applies a style that represents numeric data values as heights of extruded polygons.
        TODO: add removePolygonHeight
    */
    this.setPolygonHeightStyle = function (dataColumn) {
        var _this = this;

        this.map.setPaintProperty('polygons', 'fill-extrusion-height', {
            // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
            property: 'block_id', //locationColumn, // the ID on the actual geometry dataset
            type: 'categorical',
            stops: this.sourceData.filteredRows().map(function (row) {
                return [row[_this.sourceData.locationColumn], row[dataColumn] / _this.sourceData.maxs[dataColumn] * 1000];
            })
        });
        this.map.setPaintProperty('polygons', 'fill-extrusion-color', {
            property: 'block_id',
            type: 'categorical',
            stops: this.sourceData.filteredRows()
            //.map(row => [row[this.sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / this.sourceData.maxs[dataColumn] * 200) + ')'])
            .map(function (row) {
                return [row[_this.sourceData.locationColumn], 'hsl(340,88%,' + Math.round(20 + row[dataColumn] / _this.sourceData.maxs[dataColumn] * 50) + '%)'];
            })
        });
        this.map.setFilter('polygons', ['!in', 'block_id'].concat(_toConsumableArray( /* ### TODO generalise */
        this.sourceData.filteredRows().filter(function (row) {
            return row[dataColumn] === 0;
        }).map(function (row) {
            return row[_this.sourceData.locationColumn];
        }))));

        legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, this.sourceData.mins[dataColumn], this.sourceData.maxs[dataColumn] /*, removeCircleRadius*/);
    };

    this.lastFeature = undefined;

    this.remove = function () {
        // TODO ideally we'd be careful to only remove layers we created
        this.map.removeLayer(this.sourceData.shape + 's');
        this.map.removeLayer(this.sourceData.shape + 's-highlight');
        /*if (map.getLayer('polygons')) {
            map.removeLayer('polygons');
            map.removeLayer('polygons-highlight');
        }
        if (map.getLayer('points')) {
            map.removeLayer('points');
            map.removeLayer('points-highlight');
        }*/
        this.map.off('mousemove', this.mousemove);
    };

    this.mousemove = function (e) {
        var f = _this2.map.queryRenderedFeatures(e.point, { layers: [_this2.sourceData.shape + 's'] })[0]; /* yes, that's gross */
        if (f && f !== _this2.lastFeature) {
            _this2.map.getCanvas().style.cursor = 'pointer';

            _this2.lastFeature = f;
            if (featureHoverHook) {
                featureHoverHook(f.properties, _this2.sourceData, _this2);
            }

            if (sourceData.shape === 'point') {
                _this2.map.setFilter('points-highlight', ['==', _this2.sourceData.locationColumn, f.properties[_this2.sourceData.locationColumn]]); // we don't have any other reliable key?
            } else {
                _this2.map.setFilter('polygons-highlight', ['==', 'block_id', f.properties.block_id]); // don't have a general way to match other kinds of polygons
                //console.log(f.properties);
            }
        } else {
            _this2.map.getCanvas().style.cursor = '';
        }
    }.bind(this);

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

function pointLayer(sourceId, filter, highlight) {
    var ret = {
        id: 'points' + (highlight ? '-highlight' : ''),
        type: 'circle',
        source: sourceId,
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

function polygonLayer(sourceId) {
    return {
        id: 'polygons',
        type: 'fill-extrusion',
        source: sourceId,
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: {
            'fill-extrusion-opacity': 0.8,
            'fill-extrusion-height': 0,
            'fill-extrusion-color': '#003'
        }
    };
}
function polygonHighlightLayer(sourceId) {
    return {
        id: 'polygons-highlight',
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2xlZ2VuZC5qcyIsInNyYy9qcy9tYXBWaXMuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0NnQixnQixHQUFBLGdCO1FBY0EseUIsR0FBQSx5QjtRQWVBLGtCLEdBQUEsa0I7QUE5QmhCO0FBQ08sU0FBUyxnQkFBVCxDQUEwQixFQUExQixFQUE4QixVQUE5QixFQUEwQyxNQUExQyxFQUFrRCxNQUFsRCxFQUEwRCxZQUExRCxFQUF3RTtBQUMzRSxRQUFJLGFBQ0EsQ0FBQyxlQUFlLGtDQUFmLEdBQW9ELEVBQXJELGNBQ08sVUFEUDtBQUVBO0FBRkEsK0ZBR3lGLE1BSHpGLHFIQUk0RixNQUo1RixjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUVNLFNBQVMseUJBQVQsQ0FBbUMsRUFBbkMsRUFBdUMsVUFBdkMsRUFBbUQsTUFBbkQsRUFBMkQsTUFBM0QsRUFBbUUsWUFBbkUsRUFBaUY7QUFDcEYsUUFBSSxhQUNBLENBQUMsZUFBZSxrQ0FBZixHQUFvRCxFQUFyRCxjQUNPLFVBRFAsb0hBR21HLE1BSG5HLDBIQUlpRyxNQUpqRyxjQURKOztBQU9BLGFBQVMsYUFBVCxDQUF1QixFQUF2QixFQUEyQixTQUEzQixHQUF1QyxVQUF2QztBQUNBLFFBQUksWUFBSixFQUFrQjtBQUNkLGlCQUFTLGFBQVQsQ0FBdUIsS0FBSyxTQUE1QixFQUF1QyxnQkFBdkMsQ0FBd0QsT0FBeEQsRUFBaUUsWUFBakU7QUFDSDtBQUNKOztBQUdNLFNBQVMs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b0JBREQ7QUFFSCxjQUFNLE1BRkg7QUFHSCxnQkFBUSxRQUhMO0FBSUgsd0JBQWdCLHNDQUpiLEVBSXFEO0FBQ3hELGVBQU87QUFDRiwwQkFBYztBQURaLFNBTEo7QUFRSCxnQkFBUSxDQUFDLElBQUQsRUFBTyxVQUFQLEVBQW1CLEdBQW5CO0FBUkwsS0FBUDtBQVVIIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8qIGpzaGludCBlc25leHQ6dHJ1ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNob3dSYWRpdXNMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIG1pblZhbCwgbWF4VmFsLCBjbG9zZUhhbmRsZXIpIHtcbiAgICB2YXIgbGVnZW5kSHRtbCA9IFxuICAgICAgICAoY2xvc2VIYW5kbGVyID8gJzxkaXYgY2xhc3M9XCJjbG9zZVwiPkNsb3NlIOKcljwvZGl2PicgOiAnJykgKyBcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIC8vIFRPRE8gcGFkIHRoZSBzbWFsbCBjaXJjbGUgc28gdGhlIHRleHQgc3RhcnRzIGF0IHRoZSBzYW1lIFggcG9zaXRpb24gZm9yIGJvdGhcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6NnB4OyB3aWR0aDogNnB4OyBib3JkZXItcmFkaXVzOiAzcHhcIj48L3NwYW4+PGxhYmVsPiR7bWluVmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6MjBweDsgd2lkdGg6IDIwcHg7IGJvcmRlci1yYWRpdXM6IDEwcHhcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+YDtcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2hvd0V4dHJ1c2lvbkhlaWdodExlZ2VuZChpZCwgY29sdW1uTmFtZSwgbWluVmFsLCBtYXhWYWwsIGNsb3NlSGFuZGxlcikge1xuICAgIHZhciBsZWdlbmRIdG1sID0gXG4gICAgICAgIChjbG9zZUhhbmRsZXIgPyAnPGRpdiBjbGFzcz1cImNsb3NlXCI+Q2xvc2Ug4pyWPC9kaXY+JyA6ICcnKSArIFxuICAgICAgICBgPGgzPiR7Y29sdW1uTmFtZX08L2gzPmAgKyBcblxuICAgICAgICBgPHNwYW4gY2xhc3M9XCJjaXJjbGVcIiBzdHlsZT1cImhlaWdodDoyMHB4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDQwLDQwLDI1MClcIj48L3NwYW4+PGxhYmVsPiR7bWF4VmFsfTwvbGFiZWw+PGJyLz5gICtcbiAgICAgICAgYDxzcGFuIGNsYXNzPVwiY2lyY2xlXCIgc3R5bGU9XCJoZWlnaHQ6M3B4OyB3aWR0aDogMTJweDsgYmFja2dyb3VuZDogcmdiKDIwLDIwLDQwKVwiPjwvc3Bhbj48bGFiZWw+JHttaW5WYWx9PC9sYWJlbD5gOyBcblxuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQpLmlubmVySFRNTCA9IGxlZ2VuZEh0bWw7XG4gICAgaWYgKGNsb3NlSGFuZGxlcikge1xuICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkICsgJyAuY2xvc2UnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNsb3NlSGFuZGxlcik7XG4gICAgfVxufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBzaG93Q2F0ZWdvcnlMZWdlbmQoaWQsIGNvbHVtbk5hbWUsIGNvbG9yU3RvcHMsIGNsb3NlSGFuZGxlcikge1xuICAgIGxldCBsZWdlbmRIdG1sID0gXG4gICAgICAgICc8ZGl2IGNsYXNzPVwiY2xvc2VcIj5DbG9zZSDinJY8L2Rpdj4nICtcbiAgICAgICAgYDxoMz4ke2NvbHVtbk5hbWV9PC9oMz5gICsgXG4gICAgICAgIGNvbG9yU3RvcHNcbiAgICAgICAgICAgIC5zb3J0KChzdG9wYSwgc3RvcGIpID0+IHN0b3BhWzBdLmxvY2FsZUNvbXBhcmUoc3RvcGJbMF0pKSAvLyBzb3J0IG9uIHZhbHVlc1xuICAgICAgICAgICAgLm1hcChzdG9wID0+IGA8c3BhbiBjbGFzcz1cImJveFwiIHN0eWxlPSdiYWNrZ3JvdW5kOiAke3N0b3BbMV19Jz48L3NwYW4+PGxhYmVsPiR7c3RvcFswXX08L2xhYmVsPjxici8+YClcbiAgICAgICAgICAgIC5qb2luKCdcXG4nKVxuICAgICAgICA7XG5cbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGlkKS5pbm5lckhUTUwgPSBsZWdlbmRIdG1sO1xuICAgIGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoaWQgKyAnIC5jbG9zZScpLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY2xvc2VIYW5kbGVyKTtcbn0iLCIvKiBqc2hpbnQgZXNuZXh0OnRydWUgKi9cblxuaW1wb3J0ICogYXMgbGVnZW5kIGZyb20gJy4vbGVnZW5kJztcbi8qXG5XcmFwcyBhIE1hcGJveCBtYXAgd2l0aCBkYXRhIHZpcyBjYXBhYmlsaXRpZXMgbGlrZSBjaXJjbGUgc2l6ZSBhbmQgY29sb3IsIGFuZCBwb2x5Z29uIGhlaWdodC5cblxuc291cmNlRGF0YSBpcyBhbiBvYmplY3Qgd2l0aDpcbi0gZGF0YUlkXG4tIGxvY2F0aW9uQ29sdW1uXG4tIHRleHRDb2x1bW5zXG4tIG51bWVyaWNDb2x1bW5zXG4tIHJvd3Ncbi0gc2hhcGVcbi0gbWlucywgbWF4c1xuKi9cbmV4cG9ydCBjbGFzcyBNYXBWaXMge1xuICAgIGNvbnN0cnVjdG9yKG1hcCwgc291cmNlRGF0YSwgZmlsdGVyLCBmZWF0dXJlSG92ZXJIb29rKSB7XG4gICAgICAgIHRoaXMubWFwID0gbWFwO1xuICAgICAgICB0aGlzLnNvdXJjZURhdGEgPSBzb3VyY2VEYXRhO1xuICAgICAgICB0aGlzLmZpbHRlciA9IGZpbHRlcjtcbiAgICAgICAgdGhpcy5mZWF0dXJlSG92ZXJIb29rID0gZmVhdHVyZUhvdmVySG9vazsgLy8gZihwcm9wZXJ0aWVzLCBzb3VyY2VEYXRhKVxuICAgICAgICBcbiAgICAgICAgLy8gVE9ETyBzaG91bGQgYmUgcGFzc2VkIGEgTGVnZW5kIG9iamVjdCBvZiBzb21lIGtpbmQuXG5cbiAgICAgICAgdGhpcy5kYXRhQ29sdW1uID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIFxuICAgICAgICAvLyBDb252ZXJ0IGEgdGFibGUgb2Ygcm93cyB0byBhIE1hcGJveCBkYXRhc291cmNlXG4gICAgICAgIHRoaXMuYWRkUG9pbnRzVG9NYXAgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCBwb2ludERhdGFzZXRUb0dlb0pTT04odGhpcy5zb3VyY2VEYXRhKSApO1xuICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9pbnRMYXllcihzb3VyY2VJZCwgdGhpcy5maWx0ZXIpKTtcbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvaW50TGF5ZXIoc291cmNlSWQsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sICctJ10sIHRydWUpKTsgLy8gaGlnaGxpZ2h0IGxheWVyXG4gICAgICAgIH07XG5cbiAgICAgICAgXG5cbiAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyB3ZSBkb24ndCBuZWVkIHRvIGNvbnN0cnVjdCBhIFwicG9seWdvbiBkYXRhc291cmNlXCIsIHRoZSBnZW9tZXRyeSBleGlzdHMgaW4gTWFwYm94IGFscmVhZHlcbiAgICAgICAgICAgIC8vIGh0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9FY29ub215L0VtcGxveW1lbnQtYnktYmxvY2stYnktaW5kdXN0cnkvYjM2ai1raXk0XG4gICAgICAgICAgICBcbiAgICAgICAgICAgIC8vIGFkZCBDTFVFIGJsb2NrcyBwb2x5Z29uIGRhdGFzZXQsIHJpcGUgZm9yIGNob3JvcGxldGhpbmdcbiAgICAgICAgICAgIGxldCBzb3VyY2VJZCA9ICdkYXRhc2V0LScgKyB0aGlzLnNvdXJjZURhdGEuZGF0YUlkO1xuICAgICAgICAgICAgaWYgKCF0aGlzLm1hcC5nZXRTb3VyY2Uoc291cmNlSWQpKSAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuYWRkU291cmNlKHNvdXJjZUlkLCB7IFxuICAgICAgICAgICAgICAgICAgICB0eXBlOiAndmVjdG9yJywgXG4gICAgICAgICAgICAgICAgICAgIHVybDogJ21hcGJveDovL29wZW5jb3VuY2lsZGF0YS5hZWRmbXlwOCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLmFkZExheWVyKHBvbHlnb25IaWdobGlnaHRMYXllcihzb3VyY2VJZCkpO1xuICAgICAgICAgICAgdGhpcy5tYXAuYWRkTGF5ZXIocG9seWdvbkxheWVyKHNvdXJjZUlkKSk7XG4gICAgICAgICAgICBcbiAgICAgICAgfTtcblxuXG5cbiAgICBcbiAgICAgICAgLy8gc3dpdGNoIHZpc3VhbGlzYXRpb24gdG8gdXNpbmcgdGhpcyBjb2x1bW5cbiAgICAgICAgdGhpcy5zZXRWaXNDb2x1bW4gPSBmdW5jdGlvbihjb2x1bW5OYW1lKSB7XG4gICAgICAgICAgICBpZiAoY29sdW1uTmFtZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uTmFtZSA9IHNvdXJjZURhdGEudGV4dENvbHVtbnNbMF07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLmRhdGFDb2x1bW4gPSBjb2x1bW5OYW1lO1xuICAgICAgICAgICAgY29uc29sZS5sb2coJ0RhdGEgY29sdW1uOiAnICsgdGhpcy5kYXRhQ29sdW1uKTtcblxuICAgICAgICAgICAgaWYgKHNvdXJjZURhdGEubnVtZXJpY0NvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldENpcmNsZVJhZGl1c1N0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHsgLy8gcG9seWdvblxuICAgICAgICAgICAgICAgICAgICB0aGlzLnNldFBvbHlnb25IZWlnaHRTdHlsZSh0aGlzLmRhdGFDb2x1bW4pO1xuICAgICAgICAgICAgICAgICAgICAvLyBUT0RPIGFkZCBjbG9zZSBidXR0b24gYmVoYXZpb3VyLiBtYXliZT9cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdXJjZURhdGEudGV4dENvbHVtbnMuaW5kZXhPZih0aGlzLmRhdGFDb2x1bW4pID49IDApIHtcbiAgICAgICAgICAgICAgICAvLyBUT0RPIGhhbmRsZSBlbnVtIGZpZWxkcyBvbiBwb2x5Z29ucyAobm8gZXhhbXBsZSBjdXJyZW50bHkpXG4gICAgICAgICAgICAgICAgdGhpcy5zZXRDaXJjbGVDb2xvclN0eWxlKHRoaXMuZGF0YUNvbHVtbik7XG4gICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuc2V0Q2lyY2xlUmFkaXVzU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KCdwb2ludHMnLCAnY2lyY2xlLXJhZGl1cycsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIDFdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxMCwgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIDNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXX0sIDNdLFxuICAgICAgICAgICAgICAgICAgICBbeyB6b29tOiAxNywgdmFsdWU6IHNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXX0sIDEwXVxuICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBsZWdlbmQuc2hvd1JhZGl1c0xlZ2VuZCgnI2xlZ2VuZC1udW1lcmljJywgZGF0YUNvbHVtbiwgc291cmNlRGF0YS5taW5zW2RhdGFDb2x1bW5dLCBzb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyAvLyBDYW4ndCBzYWZlbHkgY2xvc2UgbnVtZXJpYyBjb2x1bW5zIHlldC4gaHR0cHM6Ly9naXRodWIuY29tL21hcGJveC9tYXBib3gtZ2wtanMvaXNzdWVzLzM5NDlcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZVJhZGl1cyA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHBvaW50TGF5ZXIoKS5wYWludFsnY2lyY2xlLXJhZGl1cyddKTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkoJ3BvaW50cycsJ2NpcmNsZS1yYWRpdXMnLCBwb2ludExheWVyKCkucGFpbnRbJ2NpcmNsZS1yYWRpdXMnXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLW51bWVyaWMnKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnNldENpcmNsZUNvbG9yU3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICAvLyBmcm9tIENvbG9yQnJld2VyXG4gICAgICAgICAgICBjb25zdCBlbnVtQ29sb3JzID0gWycjMWY3OGI0JywnI2ZiOWE5OScsJyNiMmRmOGEnLCcjMzNhMDJjJywnI2UzMWExYycsJyNmZGJmNmYnLCcjYTZjZWUzJywgJyNmZjdmMDAnLCcjY2FiMmQ2JywnIzZhM2Q5YScsJyNmZmZmOTknLCcjYjE1OTI4J107XG5cbiAgICAgICAgICAgIGxldCBlbnVtU3RvcHMgPSB0aGlzLnNvdXJjZURhdGEuc29ydGVkRnJlcXVlbmNpZXNbZGF0YUNvbHVtbl0ubWFwKCh2YWwsaSkgPT4gW3ZhbCwgZW51bUNvbG9yc1tpXV0pO1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSgncG9pbnRzJywgJ2NpcmNsZS1jb2xvcicsIHtcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogZGF0YUNvbHVtbixcbiAgICAgICAgICAgICAgICB0eXBlOiAnY2F0ZWdvcmljYWwnLFxuICAgICAgICAgICAgICAgIHN0b3BzOiBlbnVtU3RvcHNcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gVE9ETyB0ZXN0IGNsb3NlIGhhbmRsZXIsIGN1cnJlbnRseSBub24gZnVuY3Rpb25hbCBkdWUgdG8gcG9pbnRlci1ldmVudHM6bm9uZSBpbiBDU1NcbiAgICAgICAgICAgIGxlZ2VuZC5zaG93Q2F0ZWdvcnlMZWdlbmQoJyNsZWdlbmQtZW51bScsIGRhdGFDb2x1bW4sIGVudW1TdG9wcywgdGhpcy5yZW1vdmVDaXJjbGVDb2xvci5iaW5kKHRoaXMpKTtcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLnJlbW92ZUNpcmNsZUNvbG9yID0gZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgdGhpcy5tYXAuc2V0UGFpbnRQcm9wZXJ0eSgncG9pbnRzJywnY2lyY2xlLWNvbG9yJywgcG9pbnRMYXllcigpLnBhaW50WydjaXJjbGUtY29sb3InXSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjbGVnZW5kLWVudW0nKS5pbm5lckhUTUwgPSAnJztcbiAgICAgICAgfTtcbiAgICAgICAgLypcbiAgICAgICAgICAgIEFwcGxpZXMgYSBzdHlsZSB0aGF0IHJlcHJlc2VudHMgbnVtZXJpYyBkYXRhIHZhbHVlcyBhcyBoZWlnaHRzIG9mIGV4dHJ1ZGVkIHBvbHlnb25zLlxuICAgICAgICAgICAgVE9ETzogYWRkIHJlbW92ZVBvbHlnb25IZWlnaHRcbiAgICAgICAgKi9cbiAgICAgICAgdGhpcy5zZXRQb2x5Z29uSGVpZ2h0U3R5bGUgPSBmdW5jdGlvbihkYXRhQ29sdW1uKSB7XG4gICAgICAgICAgICB0aGlzLm1hcC5zZXRQYWludFByb3BlcnR5KCdwb2x5Z29ucycsICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnLCAge1xuICAgICAgICAgICAgICAgIC8vIHJlbWVtYmVyLCB0aGUgZGF0YSBkb2Vzbid0IGV4aXN0IGluIHRoZSBwb2x5Z29uIHNldCwgaXQncyBqdXN0IGEgaHVnZSB2YWx1ZSBsb29rdXBcbiAgICAgICAgICAgICAgICBwcm9wZXJ0eTogJ2Jsb2NrX2lkJywvL2xvY2F0aW9uQ29sdW1uLCAvLyB0aGUgSUQgb24gdGhlIGFjdHVhbCBnZW9tZXRyeSBkYXRhc2V0XG4gICAgICAgICAgICAgICAgdHlwZTogJ2NhdGVnb3JpY2FsJyxcbiAgICAgICAgICAgICAgICBzdG9wczogdGhpcy5zb3VyY2VEYXRhLmZpbHRlcmVkUm93cygpICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogMTAwMF0pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldFBhaW50UHJvcGVydHkoJ3BvbHlnb25zJywgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJywge1xuICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnYmxvY2tfaWQnLFxuICAgICAgICAgICAgICAgIHR5cGU6ICdjYXRlZ29yaWNhbCcsXG4gICAgICAgICAgICAgICAgc3RvcHM6IHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgICAgICAvLy5tYXAocm93ID0+IFtyb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSwgJ3JnYigwLDAsJyArIE1hdGgucm91bmQoNDAgKyByb3dbZGF0YUNvbHVtbl0gLyB0aGlzLnNvdXJjZURhdGEubWF4c1tkYXRhQ29sdW1uXSAqIDIwMCkgKyAnKSddKVxuICAgICAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiBbcm93W3RoaXMuc291cmNlRGF0YS5sb2NhdGlvbkNvbHVtbl0sICdoc2woMzQwLDg4JSwnICsgTWF0aC5yb3VuZCgyMCArIHJvd1tkYXRhQ29sdW1uXSAvIHRoaXMuc291cmNlRGF0YS5tYXhzW2RhdGFDb2x1bW5dICogNTApICsgJyUpJ10pXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcigncG9seWdvbnMnLCBbJyFpbicsICdibG9ja19pZCcsIC4uLigvKiAjIyMgVE9ETyBnZW5lcmFsaXNlICovIFxuICAgICAgICAgICAgICAgIHRoaXMuc291cmNlRGF0YS5maWx0ZXJlZFJvd3MoKVxuICAgICAgICAgICAgICAgIC5maWx0ZXIocm93ID0+IHJvd1tkYXRhQ29sdW1uXSA9PT0gMClcbiAgICAgICAgICAgICAgICAubWFwKHJvdyA9PiByb3dbdGhpcy5zb3VyY2VEYXRhLmxvY2F0aW9uQ29sdW1uXSkpXSk7XG5cbiAgICAgICAgICAgIGxlZ2VuZC5zaG93RXh0cnVzaW9uSGVpZ2h0TGVnZW5kKCcjbGVnZW5kLW51bWVyaWMnLCBkYXRhQ29sdW1uLCB0aGlzLnNvdXJjZURhdGEubWluc1tkYXRhQ29sdW1uXSwgdGhpcy5zb3VyY2VEYXRhLm1heHNbZGF0YUNvbHVtbl0vKiwgcmVtb3ZlQ2lyY2xlUmFkaXVzKi8pOyBcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmxhc3RGZWF0dXJlID0gdW5kZWZpbmVkO1xuXG4gICAgICAgIHRoaXMucmVtb3ZlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBUT0RPIGlkZWFsbHkgd2UnZCBiZSBjYXJlZnVsIHRvIG9ubHkgcmVtb3ZlIGxheWVycyB3ZSBjcmVhdGVkXG4gICAgICAgICAgICB0aGlzLm1hcC5yZW1vdmVMYXllcih0aGlzLnNvdXJjZURhdGEuc2hhcGUgKyAncycpO1xuICAgICAgICAgICAgdGhpcy5tYXAucmVtb3ZlTGF5ZXIodGhpcy5zb3VyY2VEYXRhLnNoYXBlICsgJ3MtaGlnaGxpZ2h0Jyk7XG4gICAgICAgICAgICAvKmlmIChtYXAuZ2V0TGF5ZXIoJ3BvbHlnb25zJykpIHtcbiAgICAgICAgICAgICAgICBtYXAucmVtb3ZlTGF5ZXIoJ3BvbHlnb25zJyk7XG4gICAgICAgICAgICAgICAgbWFwLnJlbW92ZUxheWVyKCdwb2x5Z29ucy1oaWdobGlnaHQnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXAuZ2V0TGF5ZXIoJ3BvaW50cycpKSB7XG4gICAgICAgICAgICAgICAgbWFwLnJlbW92ZUxheWVyKCdwb2ludHMnKTtcbiAgICAgICAgICAgICAgICBtYXAucmVtb3ZlTGF5ZXIoJ3BvaW50cy1oaWdobGlnaHQnKTtcbiAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgdGhpcy5tYXAub2ZmKCdtb3VzZW1vdmUnLCB0aGlzLm1vdXNlbW92ZSk7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5tb3VzZW1vdmUgPSAoZSA9PiB7XG4gICAgICAgICAgICB2YXIgZiA9IHRoaXMubWFwLnF1ZXJ5UmVuZGVyZWRGZWF0dXJlcyhlLnBvaW50LCB7IGxheWVyczogW3RoaXMuc291cmNlRGF0YS5zaGFwZSArICdzJ119KVswXTsgIC8qIHllcywgdGhhdCdzIGdyb3NzICovXG4gICAgICAgICAgICBpZiAoZiAmJiBmICE9PSB0aGlzLmxhc3RGZWF0dXJlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXAuZ2V0Q2FudmFzKCkuc3R5bGUuY3Vyc29yID0gJ3BvaW50ZXInO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0RmVhdHVyZSA9IGY7XG4gICAgICAgICAgICAgICAgaWYgKGZlYXR1cmVIb3Zlckhvb2spIHtcbiAgICAgICAgICAgICAgICAgICAgZmVhdHVyZUhvdmVySG9vayhmLnByb3BlcnRpZXMsIHRoaXMuc291cmNlRGF0YSwgdGhpcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmIChzb3VyY2VEYXRhLnNoYXBlID09PSAncG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMubWFwLnNldEZpbHRlcigncG9pbnRzLWhpZ2hsaWdodCcsIFsnPT0nLCB0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW4sIGYucHJvcGVydGllc1t0aGlzLnNvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXSk7IC8vIHdlIGRvbid0IGhhdmUgYW55IG90aGVyIHJlbGlhYmxlIGtleT9cbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm1hcC5zZXRGaWx0ZXIoJ3BvbHlnb25zLWhpZ2hsaWdodCcsIFsnPT0nLCAnYmxvY2tfaWQnLCBmLnByb3BlcnRpZXMuYmxvY2tfaWRdKTsgLy8gZG9uJ3QgaGF2ZSBhIGdlbmVyYWwgd2F5IHRvIG1hdGNoIG90aGVyIGtpbmRzIG9mIHBvbHlnb25zXG4gICAgICAgICAgICAgICAgICAgIC8vY29uc29sZS5sb2coZi5wcm9wZXJ0aWVzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMubWFwLmdldENhbnZhcygpLnN0eWxlLmN1cnNvciA9ICcnO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuXG4gICAgICAgIC8vIFRoZSBhY3R1YWwgY29uc3RydWN0b3IuLi5cbiAgICAgICAgaWYgKHRoaXMuc291cmNlRGF0YS5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2ludHNUb01hcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5hZGRQb2x5Z29uc1RvTWFwKCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tYXAub24oJ21vdXNlbW92ZScsIHRoaXMubW91c2Vtb3ZlKTtcblxuXG5cbiAgICAgICAgXG5cbiAgICB9XG59XG5cbi8vIGNvbnZlcnQgYSB0YWJsZSBvZiByb3dzIHRvIEdlb0pTT05cbmZ1bmN0aW9uIHBvaW50RGF0YXNldFRvR2VvSlNPTihzb3VyY2VEYXRhKSB7XG4gICAgbGV0IGRhdGFzb3VyY2UgPSB7XG4gICAgICAgIHR5cGU6ICdnZW9qc29uJyxcbiAgICAgICAgZGF0YToge1xuICAgICAgICAgICAgdHlwZTogJ0ZlYXR1cmVDb2xsZWN0aW9uJyxcbiAgICAgICAgICAgIGZlYXR1cmVzOiBbXVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHNvdXJjZURhdGEucm93cy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBpZiAocm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dKSB7XG4gICAgICAgICAgICAgICAgZGF0YXNvdXJjZS5kYXRhLmZlYXR1cmVzLnB1c2goe1xuICAgICAgICAgICAgICAgICAgICB0eXBlOiAnRmVhdHVyZScsXG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnRpZXM6IHJvdyxcbiAgICAgICAgICAgICAgICAgICAgZ2VvbWV0cnk6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHR5cGU6ICdQb2ludCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBjb29yZGluYXRlczogcm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTsgICAgICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfVxuICAgICAgICB9IGNhdGNoIChlKSB7IC8vIEp1c3QgZG9uJ3QgcHVzaCBpdCBcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKGBCYWQgbG9jYXRpb246ICR7cm93W3NvdXJjZURhdGEubG9jYXRpb25Db2x1bW5dfWApOyAgICAgICAgICAgIFxuICAgICAgICB9XG4gICAgfSk7XG4gICAgcmV0dXJuIGRhdGFzb3VyY2U7XG59O1xuXG5mdW5jdGlvbiBwb2ludExheWVyKHNvdXJjZUlkLCBmaWx0ZXIsIGhpZ2hsaWdodCkge1xuICAgIGxldCByZXQgPSB7XG4gICAgICAgIGlkOiAncG9pbnRzJyArIChoaWdobGlnaHQgPyAnLWhpZ2hsaWdodCc6ICcnKSxcbiAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgIHNvdXJjZTogc291cmNlSWQsXG4gICAgICAgIHBhaW50OiB7XG4vLyAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiBoaWdobGlnaHQgPyAnaHNsKDIwLCA5NSUsIDUwJSknIDogJ2hzbCgyMjAsODAlLDUwJSknLFxuICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6IGhpZ2hsaWdodCA/ICdyZ2JhKDAsMCwwLDApJyA6ICdoc2woMjIwLDgwJSw1MCUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOTUsXG4gICAgICAgICAgICAnY2lyY2xlLXN0cm9rZS1jb2xvcic6IGhpZ2hsaWdodCA/ICd3aGl0ZScgOiAncmdiYSg1MCw1MCw1MCwwLjUpJyxcbiAgICAgICAgICAgICdjaXJjbGUtc3Ryb2tlLXdpZHRoJzogMSxcbiAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzoge1xuICAgICAgICAgICAgICAgIHN0b3BzOiBoaWdobGlnaHQgPyBbWzEwLDRdLCBbMTcsMTBdXSA6IFtbMTAsMl0sIFsxNyw1XV1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgaWYgKGZpbHRlcilcbiAgICAgICAgcmV0LmZpbHRlciA9IGZpbHRlcjtcbiAgICByZXR1cm4gcmV0O1xufVxuXG5cbiBmdW5jdGlvbiBwb2x5Z29uTGF5ZXIoc291cmNlSWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogJ3BvbHlnb25zJyxcbiAgICAgICAgdHlwZTogJ2ZpbGwtZXh0cnVzaW9uJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tb3BhY2l0eSc6IDAuOCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24taGVpZ2h0JzogMCxcbiAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnIzAwMydcbiAgICAgICAgIH0sXG4gICAgfTtcbn1cbiBmdW5jdGlvbiBwb2x5Z29uSGlnaGxpZ2h0TGF5ZXIoc291cmNlSWQpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICBpZDogJ3BvbHlnb25zLWhpZ2hsaWdodCcsXG4gICAgICAgIHR5cGU6ICdmaWxsJyxcbiAgICAgICAgc291cmNlOiBzb3VyY2VJZCxcbiAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCbG9ja3NfZm9yX0NlbnN1c19vZl9MYW5kX1VzZS03eWo5dmgnLCAvLyBUT0RvIGFyZ3VtZW50P1xuICAgICAgICBwYWludDogeyBcbiAgICAgICAgICAgICAnZmlsbC1jb2xvcic6ICd3aGl0ZSdcbiAgICAgICAgfSxcbiAgICAgICAgZmlsdGVyOiBbJz09JywgJ2Jsb2NrX2lkJywgJy0nXVxuICAgIH07XG59Il19

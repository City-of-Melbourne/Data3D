/* jshint esnext:true */

import * as legend from './legend';
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
const def = (a, b) => a !== undefined ? a : b;

let unique = 0;

export class MapVis {
    constructor(map, sourceData, filter, featureHoverHook, options) {
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

        this.layerId = sourceData.shape + '-' + sourceData.dataId + '-' + (unique++);
        this.layerIdHighlight = this.layerId + '-highlight';


        
        // Convert a table of rows to a Mapbox datasource
        this.addPointsToMap = function() {
            let sourceId = 'dataset-' + this.sourceData.dataId;
            if (!this.map.getSource(sourceId))        
                this.map.addSource(sourceId, pointDatasetToGeoJSON(this.sourceData) );

            if (!this.options.symbol) {
                this.map.addLayer(circleLayer(sourceId, this.layerId, this.filter, false, this.options.invisible));
                if (this.featureHoverHook)
                    this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
            } else {
                this.map.addLayer(symbolLayer(sourceId, this.layerId, this.options.symbol, this.filter, false, this.options.invisible));
                if (this.featureHoverHook)
                    // try using a circle highlight even on an icon
                    this.map.addLayer(circleLayer(sourceId, this.layerIdHighlight, ['==', this.sourceData.locationColumn, '-'], true, this.options.invisible)); // highlight layer
                    //this.map.addLayer(symbolLayer(sourceId, this.layerIdHighlight, this.options.symbol, ['==', this.sourceData.locationColumn, '-'], true)); // highlight layer
            }
        };

        

        this.addPolygonsToMap = function() {
            // we don't need to construct a "polygon datasource", the geometry exists in Mapbox already
            // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4
            
            // add CLUE blocks polygon dataset, ripe for choroplething
            let sourceId = 'dataset-' + this.sourceData.dataId;
            if (!this.map.getSource(sourceId))        
                this.map.addSource(sourceId, { 
                    type: 'vector', 
                    url: 'mapbox://opencouncildata.aedfmyp8'
                });
            if (this.featureHoverHook) {
                this.map.addLayer(polygonHighlightLayer(sourceId, this.layerIdHighlight, this.options.invisible));
            }
            this.map.addLayer(polygonLayer(sourceId, this.layerId, this.options.invisible));
            
        };



    
        // switch visualisation to using this column
        this.setVisColumn = function(columnName) {
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
                } else { // polygon
                    this.setPolygonHeightStyle(this.dataColumn);
                    // TODO add close button behaviour. maybe?
                }
            } else if (sourceData.textColumns.indexOf(this.dataColumn) >= 0) {
                // TODO handle enum fields on polygons (no example currently)
                this.setCircleColorStyle(this.dataColumn);
                    
            }
        };

        this.setCircleRadiusStyle = function(dataColumn) {
            let minSize = 0.3 * this.options.circleRadius;
            let maxSize = this.options.circleRadius;

            this.map.setPaintProperty(this.layerId, 'circle-radius', {
                property: dataColumn,
                stops: [
                    [{ zoom: 10, value: sourceData.mins[dataColumn]}, 1],
                    [{ zoom: 10, value: sourceData.maxs[dataColumn]}, 3],
                    [{ zoom: 17, value: sourceData.mins[dataColumn]}, minSize],
                    [{ zoom: 17, value: sourceData.maxs[dataColumn]}, maxSize]
                ]
            });

            legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn]/*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
        };

        this.removeCircleRadius = function(e) {
            console.log(pointLayer().paint['circle-radius']);
            this.map.setPaintProperty(this.layerId,'circle-radius', pointLayer().paint['circle-radius']);
            document.querySelector('#legend-numeric').innerHTML = '';
        };

        this.setCircleColorStyle = function(dataColumn) {
            // from ColorBrewer
            const enumColors = ['#1f78b4','#fb9a99','#b2df8a','#33a02c','#e31a1c','#fdbf6f','#a6cee3', '#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

            let enumStops = this.sourceData.sortedFrequencies[dataColumn].map((val,i) => [val, enumColors[i]]);
            this.map.setPaintProperty(this.layerId, 'circle-color', {
                property: dataColumn,
                type: 'categorical',
                stops: enumStops
            });
            // TODO test close handler, currently non functional due to pointer-events:none in CSS
            legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, this.removeCircleColor.bind(this));
        };

        this.removeCircleColor = function(e) {
            this.map.setPaintProperty(this.layerId,'circle-color', pointLayer().paint['circle-color']);
            document.querySelector('#legend-enum').innerHTML = '';
        };
        /*
            Applies a style that represents numeric data values as heights of extruded polygons.
            TODO: add removePolygonHeight
        */
        this.setPolygonHeightStyle = function(dataColumn) {
            this.map.setPaintProperty(this.layerId, 'fill-extrusion-height',  {
                // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
                property: 'block_id',//locationColumn, // the ID on the actual geometry dataset
                type: 'categorical',
                stops: this.sourceData.filteredRows()                
                    .map(row => [row[this.sourceData.locationColumn], row[dataColumn] / this.sourceData.maxs[dataColumn] * 1000])
            });
            this.map.setPaintProperty(this.layerId, 'fill-extrusion-color', {
                property: 'block_id',
                type: 'categorical',
                stops: this.sourceData.filteredRows()
                    //.map(row => [row[this.sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / this.sourceData.maxs[dataColumn] * 200) + ')'])
                    .map(row => [row[this.sourceData.locationColumn], 'hsl(340,88%,' + Math.round(20 + row[dataColumn] / this.sourceData.maxs[dataColumn] * 50) + '%)'])
            });
            this.map.setFilter(this.layerId, ['!in', 'block_id', ...(/* ### TODO generalise */ 
                this.sourceData.filteredRows()
                .filter(row => row[dataColumn] === 0)
                .map(row => row[this.sourceData.locationColumn]))]);

            legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, this.sourceData.mins[dataColumn], this.sourceData.maxs[dataColumn]/*, removeCircleRadius*/); 
        };

        this.lastFeature = undefined;

        this.remove = function() {
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
            this.mousemove = (e => {
                var f = this.map.queryRenderedFeatures(e.point, { layers: [this.layerId]})[0];  
                if (f && f !== this.lastFeature) {
                    this.map.getCanvas().style.cursor = 'pointer';

                    this.lastFeature = f;
                    if (featureHoverHook) {
                        featureHoverHook(f.properties, this.sourceData, this);
                    }
                    
                    if (sourceData.shape === 'point') {
                        this.map.setFilter(this.layerIdHighlight, ['==', this.sourceData.locationColumn, f.properties[this.sourceData.locationColumn]]); // we don't have any other reliable key?
                    } else {
                        this.map.setFilter(this.layerIdHighlight, ['==', 'block_id', f.properties.block_id]); // don't have a general way to match other kinds of polygons
                        //console.log(f.properties);
                    }
                } else {
                    this.map.getCanvas().style.cursor = '';
                }
            }).bind(this);
            this.map.on('mousemove', this.mousemove);
        }
        



        

    }
}

// convert a table of rows to GeoJSON
function pointDatasetToGeoJSON(sourceData) {
    let datasource = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    sourceData.rows.forEach(row => {
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
        } catch (e) { // Just don't push it 
            console.log(`Bad location: ${row[sourceData.locationColumn]}`);            
        }
    });
    return datasource;
};

function circleLayer(sourceId, layerId, filter, highlight, invisible) {
    let ret = {
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
                stops: highlight ? [[10,4], [17,10]] : [[10,2], [17,5]]
            }
        }
    };
    if (filter)
        ret.filter = filter;
    return ret;
}

function symbolLayer(sourceId, layerId, symbol, filter, highlight, invisible) {
    let ret = {
        id: layerId,
        type: 'symbol',
        source: sourceId
    };
    if (filter)
        ret.filter = filter;

    ret.paint = def(symbol.paint, {});
    ret.paint['icon-opacity'] = !invisible ? 0.95 : 0;

    //ret.layout = def(symbol.layout, {});
    if (symbol.layout)
        ret.layout = symbol.layout;

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
         },
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


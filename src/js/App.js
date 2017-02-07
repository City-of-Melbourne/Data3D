/* jshint esnext:true */
//var mapboxgl = require('mapbox-gl');
import * as legend from './legend';
import { SourceData } from './sourceData';
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v9',
    center: [144.95, -37.813],
    zoom: 13,
    pitch: 45 // TODO revert for flat
});

/*
Pedestrian sensor locations: ygaw-6rzq
Trees: http://localhost:3002/#fp38-wiyy
Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/


function pointLayer(filter, highlight) {
    let ret = {
        id: 'points' + (highlight ? '-highlight': ''),
        type: 'circle',
        source: 'dataset',
        paint: {
//            'circle-color': highlight ? 'hsl(20, 95%, 50%)' : 'hsl(220,80%,50%)',
            'circle-color': highlight ? 'rgba(0,0,0,0)' : 'hsl(220,80%,50%)',
            'circle-opacity': 0.95,
            'circle-stroke-color': highlight ? 'white' : 'rgba(50,50,50,0.5)',
            'circle-stroke-width': 1,
            'circle-radius': {
                stops: highlight ? [[10,4], [17,10]] : [[10,2], [17,5]]
            }
        }
    };
    if (filter)
        ret.filter = filter;
    //console.log(ret);
    return ret;
}

function polygonLayer(sourcename, highlight /* not used */) {
    let ret = {
        id: 'polygons' + (highlight ? '-highlight': ''),
        type: 'fill-extrusion',
        source: 'dataset',
        'source-layer': 'Blocks_for_Census_of_Land_Use-7yj9vh', // TODo argument?
        paint: { 
             'fill-extrusion-opacity': 0.9,
             'fill-extrusion-height': 0,
             'fill-extrusion-color': '#003'
         },
    };
    return ret;
}



function removeCircleRadius(e) {
    console.log(pointLayer().paint['circle-radius']);
    map.setPaintProperty('points','circle-radius', pointLayer().paint['circle-radius']);
    document.querySelector('#legend-numeric').innerHTML = '';
}

function removeCircleColor(e) {
    map.setPaintProperty('points','circle-color', pointLayer().paint['circle-color']);
    document.querySelector('#legend-enum').innerHTML = '';
}

let dataColumn;

// switch visualisation to using this column
function setVisColumn(columnName) {
    dataColumn = columnName;
    console.log('Data column: ' + dataColumn);

    if (sourceData.numericColumns.indexOf(dataColumn) >= 0) {
        if (sourceData.shape === 'point') {
            let radiusProps = {
                property: dataColumn,
                stops: [
                    [{ zoom: 10, value: sourceData.mins[dataColumn]}, 1],
                    [{ zoom: 10, value: sourceData.maxs[dataColumn]}, 3],
                    [{ zoom: 17, value: sourceData.mins[dataColumn]}, 3],
                    [{ zoom: 17, value: sourceData.maxs[dataColumn]}, 10]
                ]
            };
            console.log(radiusProps);
            map.setPaintProperty('points', 'circle-radius', radiusProps);
            legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn]/*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
        } else { // polygon
            // TODO this filtering should be done in sourceData
            let heightStops = sourceData.filteredRows()                
                .map(row => [row[sourceData.locationColumn], row[dataColumn] / sourceData.maxs[dataColumn] * 1000]);
            
            let colorStops = sourceData.filteredRows()
                .map(row => [row[sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / sourceData.maxs[dataColumn] * 200) + ')']);

            map.setPaintProperty('polygons', 'fill-extrusion-height',  {
                // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
                property: 'block_id',//locationColumn, // the ID on the actual geometry dataset
                type: 'categorical',
                stops: heightStops
            });
            map.setPaintProperty('polygons', 'fill-extrusion-color', {
                property: 'block_id',
                type: 'categorical',
                stops: colorStops
            });
            map.setFilter('polygons', ['!in', 'block_id', /* ### TODO generalise */ 
                ...(sourceData.filteredRows()
                    .filter(row => row[dataColumn] === 0)
                    .map(row => row[sourceData.locationColumn]))]);

            legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn]/*, removeCircleRadius*/); 
        }
    } else if (textColumns.indexOf(dataColumn) >= 0) {
        var colorProps = {
            property: dataColumn,
            type: 'categorical',
            stops: sortedFrequencies[dataColumn].map((val,i) => [val, enumColors[i]])
        };
        console.log(JSON.stringify(colorProps));
        map.setPaintProperty('points', 'circle-color', colorProps);
        legend.showCategoryLegend('#legend-enum', dataColumn, colorProps.stops, removeCircleColor);
    }
}
// from ColorBrewer
const enumColors = ['#1f78b4','#fb9a99','#b2df8a','#33a02c','#e31a1c','#fdbf6f','#a6cee3', '#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

// convert a table of rows to GeoJSON
function rowsToPoints(rows) {
    let points = {
        type: 'FeatureCollection',
        features: []
    };

    rows.forEach(row => {
            try {
                if (row[locationColumn]) {
                    let feature = {
                        type: 'Feature',
                        properties: row,
                        geometry: {
                            type: 'Point',
                            coordinates: row[locationColumn]
                        }
                    };
                    points.features.push(feature);
                }
            } catch (e) {
                console.log(`Bad location: ${row[locationColumn]}`);
                // Just don't push it 
            }
        });
    return points;
}

// Convert a table of rows to a Mapbox datasource
function rowsToPointsLayer(rows) {
    console.log(maxs);
    let points = { type: 'geojson', data: rowsToPoints(rows) } ;
    function addPoints() {
        map.addSource('dataset', points);
        map.addLayer(pointLayer());
        map.addLayer(pointLayer(['==',locationColumn, '-'], true)); // highlight layer
        
        document.querySelectorAll('#loading')[0].outerHTML='';

        map.on('mousemove', mousemove);
    }
    whenLoaded(addPoints);
}



// TODO obviously merge with rowsToPointsLayer
function rowsToPolygonsLayer(rows) {
    // we don't need to construct a "polygon layer", the geometry exists in Mapbox already
    // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4
    
    //dataColumn = 'Accommodation'; // ### just temporary.
    
    function addPolygons() {
        // add CLUE blocks polygon dataset, ripe for choroplething
        map.addSource('dataset', { 
            type: 'vector', 
            url: 'mapbox://opencouncildata.aedfmyp8'
        });
        map.addLayer(polygonLayer());
        //map.addLayer(polygonLayer('dataset', ['==', locationColumn, '-'], true)); // highlight layer
        
        document.querySelectorAll('#loading')[0].outerHTML='';

        map.on('mousemove', mousemove);
    }
    whenLoaded(() => {
        addPolygons();
        // after source data is loaded, safe to mess with style
        false && whenLoaded(() =>
            setVisColumn(numericColumns[Math.floor(Math.random() * numericColumns.length)]));
    });

}

function whenLoaded(f) {
    if (map.loaded())
        f();
    else
        map.once('load', f);
}
let def = (a, b) => a !== undefined ? a : b;
    
function showFeatureTable(feature) {
    function rowsInArray(array, classStr) {
        return '<table>' + 
            Object.keys(feature)
                .filter(key => 
                    array === undefined || array.indexOf(key) >= 0)
                .map(key =>
                    `<tr><td ${classStr}>${key}</td><td>${feature[key]}</td></tr>`)
                .join('\n') + 
            '</table>';
        }

    if (feature === undefined) {
        // Called before the user has selected anything
        feature = {};
        sourceData.textColumns.forEach(c => feature[c] = '');
        sourceData.numericColumns.forEach(c => feature[c] = '');
        sourceData.boringColumns.forEach(c => feature[c] = '');

    } else if (sourceData.shape === 'polygon') { // TODO check that this is a block lookup choropleth
        feature = sourceData.getRowForBlock(feature.block_id, feature.census_yr);        
    }



    document.getElementById('features').innerHTML = 
        '<h4>Click a field to visualise with colour</h4>' +
        rowsInArray(sourceData.textColumns, 'class="enum-field"') + 
        '<h4>Click a field to visualise with size</h4>' +
        rowsInArray(sourceData.numericColumns, 'class="numeric-field"') + 
        '<h4>Other fields</h4>' +
        rowsInArray(sourceData.boringColumns, '');


    document.querySelectorAll('#features td').forEach(td => 
        td.addEventListener('click', e => {
            console.log(e);
            setVisColumn(e.target.innerText) ;
        }));

}

var lastFeature;
function mousemove(e) {
    var feature = map.queryRenderedFeatures(e.point, { layers: [sourceData.shape + 's']})[0];  /* yes, that's gross */
    if (feature && feature !== lastFeature) {
        map.getCanvas().style.cursor = 'pointer';

        lastFeature = feature;
        showFeatureTable(feature.properties);
        //d3s.selectAll('#features td').on('click', function(e) { console.log(this);   });
        
        if (sourceData.shape === 'point') {
            map.setFilter('points-highlight', ['==', locationColumn, feature.properties[locationColumn]]); // we don't have any other reliable key?
        } else {
            // ### TODO add polygon highlights 
            console.log(feature.properties);
        }
    } else {
        map.getCanvas().style.cursor = '';
    }
}

/********** Here we drive the thing - pick a dataset to load, and go for it. ************/

function keyToId(key) {
    return key.replace(/[^A-Za-z0-9_-]/g, '_');
}


// known point datasets that work ok
var choices = [
    'b36j-kiy4', // employment
    '234q-gg83', // floor space by use by block
    'c3gt-hrz6' // business establishments
];
let dataId;
if (window.location.hash) {
    dataId = window.location.hash.replace('#','');
} else {
    dataId =  choices[Math.floor(Math.random() * choices.length)];
    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';
}
var x = new SourceData();

var sourceData = new SourceData(dataId);
    sourceData.load()
    .then((rows) => {
        document.querySelector('#caption h1').innerHTML = sourceData.name;
        document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
        document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
        //
        if (sourceData.shape === 'point') {
            rowsToPointsLayer(rows);
        } else {
            rowsToPolygonsLayer(rows);
        }
        showFeatureTable();
    });


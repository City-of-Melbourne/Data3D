/* jshint esnext:true */
//var mapboxgl = require('mapbox-gl');
import * as legend from './legend';
import { SourceData } from './sourceData';
import { FlightPath } from './flightPath';
mapboxgl.accessToken = 'pk.eyJ1Ijoic3RldmFnZSIsImEiOiJjaXhxcGs0bzcwYnM3MnZsOWJiajVwaHJ2In0.RN7KywMOxLLNmcTFfn0cig';

/*
Pedestrian sensor locations: ygaw-6rzq
Trees: http://localhost:3002/#fp38-wiyy
Event bookings: http://localhost:3002/#84bf-dihi
Bike share stations: http://localhost:3002/#tdvh-n9dv
DAM: http://localhost:3002/#gh7s-qda8
*/

function whenMapLoaded(map, f) {
    if (map.loaded())
        f();
    else
        map.once('load', f);
}
let def = (a, b) => a !== undefined ? a : b;

function setCircleRadiusStyle(dataColumn) {
   map.setPaintProperty('points', 'circle-radius', {
        property: dataColumn,
        stops: [
            [{ zoom: 10, value: sourceData.mins[dataColumn]}, 1],
            [{ zoom: 10, value: sourceData.maxs[dataColumn]}, 3],
            [{ zoom: 17, value: sourceData.mins[dataColumn]}, 3],
            [{ zoom: 17, value: sourceData.maxs[dataColumn]}, 10]
        ]
    });

    legend.showRadiusLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn]/*, removeCircleRadius*/); // Can't safely close numeric columns yet. https://github.com/mapbox/mapbox-gl-js/issues/3949
}

function removeCircleRadius(e) {
    console.log(pointLayer().paint['circle-radius']);
    map.setPaintProperty('points','circle-radius', pointLayer().paint['circle-radius']);
    document.querySelector('#legend-numeric').innerHTML = '';
}

function setCircleColorStyle(dataColumn) {
    let enumStops = sourceData.sortedFrequencies[dataColumn].map((val,i) => [val, enumColors[i]]);
    map.setPaintProperty('points', 'circle-color', {
        property: dataColumn,
        type: 'categorical',
        stops: enumStops
    });
    legend.showCategoryLegend('#legend-enum', dataColumn, enumStops, removeCircleColor);
}

function removeCircleColor(e) {
    map.setPaintProperty('points','circle-color', pointLayer().paint['circle-color']);
    document.querySelector('#legend-enum').innerHTML = '';
}

function setPolygonHeightStyle(dataColumn) {
    map.setPaintProperty('polygons', 'fill-extrusion-height',  {
        // remember, the data doesn't exist in the polygon set, it's just a huge value lookup
        property: 'block_id',//locationColumn, // the ID on the actual geometry dataset
        type: 'categorical',
        stops: sourceData.filteredRows()                
            .map(row => [row[sourceData.locationColumn], row[dataColumn] / sourceData.maxs[dataColumn] * 1000])
    });
    map.setPaintProperty('polygons', 'fill-extrusion-color', {
        property: 'block_id',
        type: 'categorical',
        stops: sourceData.filteredRows()
            .map(row => [row[sourceData.locationColumn], 'rgb(0,0,' + Math.round(40 + row[dataColumn] / sourceData.maxs[dataColumn] * 200) + ')'])
    });
    map.setFilter('polygons', ['!in', 'block_id', ...(/* ### TODO generalise */ 
        sourceData.filteredRows()
        .filter(row => row[dataColumn] === 0)
        .map(row => row[sourceData.locationColumn]))]);

    legend.showExtrusionHeightLegend('#legend-numeric', dataColumn, sourceData.mins[dataColumn], sourceData.maxs[dataColumn]/*, removeCircleRadius*/); 
}

let dataColumn;

// switch visualisation to using this column
function setVisColumn(columnName) {
    dataColumn = columnName;
    console.log('Data column: ' + dataColumn);

    if (sourceData.numericColumns.indexOf(dataColumn) >= 0) {
        if (sourceData.shape === 'point') {
            setCircleRadiusStyle(dataColumn);
        } else { // polygon
            setPolygonHeightStyle(dataColumn);
            // TODO add close button behaviour. maybe?
        }
    } else if (sourceData.textColumns.indexOf(dataColumn) >= 0) {
        // TODO handle enum fields on polygons (no example currently)
        setCircleColorStyle(dataColumn);
            
    }
}
// from ColorBrewer
const enumColors = ['#1f78b4','#fb9a99','#b2df8a','#33a02c','#e31a1c','#fdbf6f','#a6cee3', '#ff7f00','#cab2d6','#6a3d9a','#ffff99','#b15928'];

// convert a table of rows to GeoJSON
function rowsToPointDatasource(rows) {
    let datasource = {
        type: 'geojson',
        data: {
            type: 'FeatureCollection',
            features: []
        }
    };

    rows.forEach(row => {
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
}

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
    return ret;
}


// Convert a table of rows to a Mapbox datasource
function addPointsToMap(rows, map) {
    map.addSource('dataset', rowsToPointDatasource(rows) );
    map.addLayer(pointLayer());
    map.addLayer(pointLayer(['==',sourceData.locationColumn, '-'], true)); // highlight layer
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

function addPolygonsToMap(rows, map) {
    // we don't need to construct a "polygon datasource", the geometry exists in Mapbox already
    // https://data.melbourne.vic.gov.au/Economy/Employment-by-block-by-industry/b36j-kiy4
    
    // add CLUE blocks polygon dataset, ripe for choroplething
    map.addSource('dataset', { 
        type: 'vector', 
        url: 'mapbox://opencouncildata.aedfmyp8'
    });
    map.addLayer(polygonLayer());
    //map.addLayer(polygonLayer('dataset', ['==', locationColumn, '-'], true)); // highlight layer
    
}
//false && whenMapLoaded(() =>
//  setVisColumn(sourceData.numericColumns[Math.floor(Math.random() * sourceData.numericColumns.length)]));

    
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
            setVisColumn(e.target.innerText) ; // TODO highlight the selected row
        }));
}

var lastFeature;
function mousemove(e) {
    var feature = map.queryRenderedFeatures(e.point, { layers: [sourceData.shape + 's']})[0];  /* yes, that's gross */
    if (feature && feature !== lastFeature) {
        map.getCanvas().style.cursor = 'pointer';

        lastFeature = feature;
        showFeatureTable(feature.properties);
        
        if (sourceData.shape === 'point') {
            map.setFilter('points-highlight', ['==', sourceData.locationColumn, feature.properties[sourceData.locationColumn]]); // we don't have any other reliable key?
        } else {
            // ### TODO add polygon highlights 
            console.log(feature.properties);
        }
    } else {
        map.getCanvas().style.cursor = '';
    }
}


//function keyToId(key) {
//    return key.replace(/[^A-Za-z0-9_-]/g, '_');
//}

function chooseDataset() {
    if (window.location.hash) {
        return window.location.hash.replace('#','');
    }

    // known point datasets that work ok
    var clueChoices = [
        'b36j-kiy4', // employment
        '234q-gg83', // floor space by use by block
        'c3gt-hrz6' // business establishments -- this one is complete, the others have gappy data for confidentiality
    ];

    var pointChoices = [
        'fp38-wiyy', // trees
        'ygaw-6rzq', // pedestrian sensor locations
        '84bf-dihi', // Venues for events
        'tdvh-n9dv', // Live bike share
        'gh7s-qda8', // DAM
        'sfrg-zygb', // Cafes and Restaurants
        'ew6k-chz4', // Bio Blitz 2016
        '7vrd-4av5', // wayfinding
        'ss79-v558', // bus stops
        'mffi-m9yn', // pubs
        'svux-bada', // soil textures - nice one
        'qjwc-f5sh', // community food guide - good
        'fthy-zajy', // properties over $2.5m
        'tx8h-2jgi', // accessible toilets
        '6u5z-ubvh', // bicycle parking
        //bs7n-5veh, // business establishments. 100,000 rows, too fragile.
        ];

    document.querySelectorAll('#caption h1')[0].innerHTML = 'Loading random dataset...';
    
    return 'c3gt-hrz6';
    //return 'gh7s-qda8';
    //return clueChoices[Math.floor(Math.random() * clueChoices.length)];
}

function showCaption(name, dataId) {
    document.querySelector('#caption h1').innerHTML = name;
    document.querySelector('#source').setAttribute('href', 'https://data.melbourne.vic.gov.au/d/' + dataId);
    document.querySelector('#share').innerHTML = `Share this: <a href="https://city-of-melbourne.github.io/Data3D/#${dataId}">https://city-of-melbourne.github.io/Data3D/#${dataId}</a>`;    
 
    // ### Hide it for now
    document.querySelector('#caption').style.display = 'none';
 }

let map, sourceData;

(function start() {

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/dark-v9',
        center: [144.95, -37.813],
        zoom: 13,
        pitch: 45 // TODO revert for flat
    });

    let dataId = chooseDataset();
    sourceData = new SourceData(dataId);

        sourceData
        .load()
        .then(rows => {
            showCaption(sourceData.name, dataId);

            whenMapLoaded(map, () => {
                if (sourceData.shape === 'point') {
                    addPointsToMap(rows, map);
                } else {
                    addPolygonsToMap(rows, map);
                }
                showFeatureTable(); 
                document.querySelectorAll('#loading')[0].outerHTML='';

                map.on('mousemove', mousemove);
            });
            //var fp = new FlightPath(map);

        });
})();

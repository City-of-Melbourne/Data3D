(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.datasets2 = exports.datasets = undefined;

var _sourceData = require('./sourceData');

/* jshint esnext:true */

/*
Suggestions:

This is Melbourne
Here are our precincts
As you'd guess, we have a lot of data:
- addresses, boundaries


1. Orient with precincts

2. But we also have: 
- wedding
- bin nights
- dogs last 
- toilets
-- all
-- wheelchairs with icons

*/

/*
Intro
- Overview (suburb names highlighted)
- Property boundaries
- Street addresses

Urban forest:
- elms
- gums
- planes
- all

CLUE
- employment
- transport sector
- social/health sector

DAM
- applications
- construction
- completed

Did you know:
- community food
- Garbage Collection Zones
- Bookable Event Venues
-- weddingable
-- all
- Toilets
-- all 
-- accessible
- Cafes and Restaurants
- Dog walking zones

Finale:
- Skyline
- What can you do with our open data?


Garbage Collection Zones
Dog Walking Zones off-leash
Bike Share Stations
Bookable Event Venues
- weddingable


Grand finale "What can you do with our open data"?
- buildings
- cafes
- 



These need a home:
- bike share stations
- pedestrian sensors
- addresses
- property boundaries
- buildings
- cafes
- community food



*/

/*

Dataset run order
- buildings (3D)
- trees (from my opentrees account)
- cafes (city of melbourne, styled with coffee symbol)
- bars (similar)
- garbage collection zones
- dog walking zones
- CLUE (3D blocks)
-- business establishments per block
--- various types, then total
-- employment (various types with specific vantage points - beware that not all data included; then total)
-- floor use (ditto)




Minimum
- floaty cameras
- clue 3D,
- bike share stations

Header:
- dataset name
- column name

Footer: data.melbourne.vic.gov.au

CoM logo


Medium
- Municipality boundary overlaid

Stretch goals
- overlay a text label on a building/clueblock (eg, Freemasons Hospital - to show why so much healthcare)





*/

var CoM = {
    blue: 'rgb(0,174,203)',
    magenta: 'rgb(227, 4, 80)',
    green: 'rgb(0,183,79)'
};
CoM.enumColors = [CoM.blue, CoM.magenta, CoM.green];

var datasets = exports.datasets = [{
    delay: 5000,
    caption: 'Melbourne has a lot of data.',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 8000,
    caption: 'This is Melbourne',
    paint: [['place-suburb', 'text-color', 'rgb(0,183,79)'], ['place-neighbourhood', 'text-color', 'rgb(0,183,79)']],
    name: '',
    flyTo: { center: { lng: 144.95, lat: -37.813 }, zoom: 13, pitch: 45, bearing: 0 }

}, {
    delay: 1000,
    name: 'Property boundaries',
    caption: 'We have data like property boundaries for planning',
    opacity: 1,
    mapbox: {
        id: 'boundaries-1',
        type: 'line',
        source: 'mapbox://cityofmelbourne.799drouh',
        'source-layer': 'Property_boundaries-061k0x',
        paint: {

            'line-color': 'rgb(0,183,79)',
            'line-width': {
                stops: [[13, 0.5], [16, 2]]
            }

        }
    },
    linger: 1000, // just to avoid flash
    flyTo: { "center": { lng: 144.953086, lat: -37.807509 }, zoom: 14, bearing: 0, pitch: 0, duration: 10000 }
},
// repeat - just to force the timing
{
    delay: 10000,
    linger: 3000,
    name: 'Property boundaries',
    caption: 'We have data like property boundaries for planning',
    opacity: 1,
    mapbox: {
        id: 'boundaries-2',
        type: 'line',
        source: 'mapbox://cityofmelbourne.799drouh',
        'source-layer': 'Property_boundaries-061k0x',
        paint: {

            'line-color': 'rgb(0,183,79)',
            'line-width': {
                stops: [[13, 0.5], [16, 2]]
            }

        }
    }
}, {
    delay: 14000,
    name: 'Street addresses',
    caption: 'As you\'d guess, we have data like every street address',
    // need to zoom in close on this one
    mapbox: {
        id: 'addresses',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.3ip3couo',
        'source-layer': 'Street_addresses-97e5on',
        paint: {

            'text-color': 'rgb(0,183,79)'

        },
        layout: {
            'text-field': '{street_no}',
            'text-allow-overlap': true,
            'text-size': 10
        }
    },
    // near uni-ish
    flyTo: { "center": { "lng": 144.97001736426068, "lat": -37.79770798860123 }, "zoom": 18, "bearing": -45.70203040506084, "pitch": 48, duration: 14000 }
    // roundabout of death lookng nw
    //flyTo: {"center":{"lng":144.95910487061184,"lat":-37.80061088971732},"zoom":18.572204782819195,"bearing":-20.435636691643822,"pitch":57.99999999999999}
},

/*{
    delay: 10000,
    caption: 'The health and type of each tree in our urban forest',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',            
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 2,
            'circle-color': 'hsl(146, 50%, 36%)',
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-opacity': 0.6
        },
        filter: [ 'in', 'Genus', 'Ulmus' ]
     },
    flyTo: {"center":{"lng":144.95767415418266,"lat":-37.791686619772975},"zoom":15.487337457356691,"bearing":-122.40000000000009,"pitch":60}
    //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
},*/
{
    delay: 5000,
    caption: 'Urban Forest',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 10000,
    caption: 'The Urban Forest contains every elm tree...',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            'circle-color': 'hsl(30, 80%, 56%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Ulmus']

    },
    flyTo: { "center": { "lng": 144.963138, "lat": -37.788843 }, "zoom": 15.2, "bearing": -106.14, "pitch": 55 }

}, {
    delay: 5000,
    caption: '...every gum tree...', // add a number
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'gumtrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            'circle-color': 'hsl(146, 100%, 36%)',
            //'circle-color': 'hsl(146, 50%, 36%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Eucalyptus', 'Corymbia', 'Angophora']

    },
    //flyTo: {"center":{"lng":144.8473748868907,"lat":-37.811779740787244},"zoom":13.162524150847315,"bearing":0,"pitch":45}
    flyTo: { "center": { "lng": 144.94318163755105, "lat": -37.78351953419449 }, "zoom": 15.773488574721082, "bearing": 200, "pitch": 59.99589825769096 }
    //flyTo: {"center":{"lng":144.9427325673331,"lat":-37.78444940593038},"zoom":14.5,"bearing":-163.3102224426674,"pitch":35.500000000000014}
}, {
    delay: 8000,
    //datasetLead: 3000,
    caption: '...and every plane tree.', // add a number
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'planetrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 3,
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-color': 'hsl(340, 97%,65%)',
            'circle-opacity': 0.9
        },
        filter: ['in', 'Genus', 'Platanus']

    },
    flyTo: { "center": { "lng": 144.94394633838965, "lat": -37.79588870668271 }, "zoom": 15.905130361446668, "bearing": 157.5999999999974, "pitch": 60 }
    //flyTo: {"center":{"lng":144.92672531478553,"lat":-37.804385949276394},"zoom":15,"bearing":119.78868682882374,"pitch":60}

    //flyTo: {"center":{"lng":144.91478510016202,"lat":-37.78434147167477},"zoom":13.922228461793669,"bearing":122.9947834604346,"pitch":47.50000000000003}
    //flyTo: {"center":{"lng":144.9534345075516,"lat":-37.80134118012522},"zoom":15,"bearing":151.00073048827338,"pitch":58.99999999999999}
    //flyTo: {"center":{"lng":144.9561388488409,"lat":-37.80902710531632},"zoom":14.241757030816636,"bearing":-163.3102224426674,"pitch":35.500000000000014}
}, {
    delay: 10000,
    caption: 'Nearly 70,000 trees in all.',
    name: 'Trees, with species and dimensions (Urban Forest)',
    mapbox: {
        id: 'alltrees',
        type: 'circle',
        source: 'mapbox://cityofmelbourne.9trpnbu6',
        'source-layer': 'Trees__with_species_and_dimen-77b9mn',
        paint: {
            'circle-radius': 2,
            'circle-color': 'hsl(146, 50%, 36%)',
            //'circle-color': 'hsl(146, 100%, 36%)',
            'circle-opacity': 0.9
        }

    },
    flyTo: { "center": { "lng": 144.94191157000034, "lat": -37.80036709214022 }, "zoom": 14.1, "bearing": 144.92728392742694, "pitch": 60 }
    //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
}, {
    delay: 5000,
    caption: 'Census of Land Use and Employment (CLUE)',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('b36j-kiy4'),
    column: 'Total employment in block',
    caption: 'CLUE reveals where employment is concentrated',
    flyTo: { "center": { "lng": 144.9267253147857, "lat": -37.804385949276494 }, "zoom": 13.88628732015981, "bearing": 119.78868682882374, "pitch": 60 }
    //flyTo: {"center":{"lng":144.9598533456214,"lat":-37.83581916243661},"zoom":13.649116614872836,"bearing":0,"pitch":45}
},

/*{
    delay:12000,
    caption: 'Where the Council\'s significant property holdings are located.',
    dataset: new SourceData('fthi-zajy'),
    column: 'Ownership or Control',
    showLegend: true,
    flyTo: {"center":{"lng":144.96390308723846,"lat":-37.818631660810425},"zoom":13.5,"bearing":0,"pitch":45}
 },
*/

{
    delay: 10000,
    dataset: new _sourceData.SourceData('c3gt-hrz6'),
    column: 'Transport, Postal and Storage',
    caption: '...where the transport, postal and storage sector is located.',
    flyTo: { "center": { "lng": 144.92768176710712, "lat": -37.829218248587246 }, "zoom": 12.728431217914919, "bearing": 68.70388312187458, "pitch": 60 }
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('c3gt-hrz6'),
    column: 'Health Care and Social Assistance',
    caption: 'and where the healthcare and social assistance organisations are based.',
    flyTo: { "center": { "lng": 144.9572331121853, "lat": -37.82706374763824 }, "zoom": 13.063757386232242, "bearing": 26.37478691852334, "pitch": 60 }
}, {
    delay: 5000,
    caption: 'Development Activity Monitor (DAM)',
    superCaption: true,
    paint: [],
    name: ''
}, {
    delay: 7000,
    linger: 9000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    options: { enumColors: CoM.enumColors },
    filter: ['==', 'status', 'APPLIED'],
    caption: 'DAM tracks major projects in the planning stage...',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 4000,
    linger: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    options: { enumColors: CoM.enumColors },
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: '...projects under construction',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

}, {
    delay: 5000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    options: { enumColors: CoM.enumColors },
    column: 'status',
    filter: ['==', 'status', 'COMPLETED'],
    caption: '...and those already completed.',
    flyTo: { "center": { "lng": 144.96354379775335, "lat": -37.82595306646476 }, "zoom": 14.665437375740426, "bearing": 0, "pitch": 59.5 }

},
//*********************  "But did you know" data
{
    delay: 10000,
    caption: 'But did you know we have data about healthy, affordable food services?',
    name: 'Community food services with opening hours, public transport and parking options',
    mapbox: {
        id: 'food',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.7xvk0k3l',
        'source-layer': 'Community_food_services_with_-a7cj9v',
        paint: {
            'text-color': 'hsl(30, 80%, 56%)' // bright orange
            //'text-color': 'rgb(249, 243, 178)', // muted orange, a city for people
        },
        layout: {
            'text-field': '{Name}',
            'text-size': 12

        }
    },
    //south Melbourne ish
    flyTo: { "center": { "lng": 144.96844507663542, "lat": -37.82459949103244 }, "zoom": 14.016979864482233, "bearing": -11.578336166142888, "pitch": 60 }
    //flyTo: {"center":{"lng":144.97473730944466,"lat":-37.8049071559513},"zoom":15.348676099922852,"bearing":-154.4971333289701,"pitch":60}
    //flyTo: {"center":{"lng":144.98492251438307,"lat":-37.80310972727281},"zoom":15.358509789790808,"bearing":-78.3999999999997,"pitch":58.500000000000014}
}, {
    delay: 1,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night?',
    mapbox: {
        id: 'garbage-1',
        type: 'line',
        source: 'mapbox://cityofmelbourne.8arqwmhr',
        'source-layer': 'Garbage_collection_zones-9nytsk',
        paint: {

            'line-color': 'hsl(23, 94%, 64%)',
            'line-width': {
                stops: [[13, 6], [16, 10]]
            }

        }
    },
    linger: 10000,
    // Fawkner Parkish
    flyTo: { center: { lng: 144.965437, lat: -37.814225 }, zoom: 13.7, bearing: -30.8, pitch: 60 }
    // birds eye, zoomed out
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:13,bearing:0,pitch:0},
}, {
    delay: 10000,
    name: 'Garbage collection zones',
    caption: 'Which night is bin night',
    mapbox: {
        id: 'garbage-2',
        type: 'symbol',
        source: 'mapbox://cityofmelbourne.8arqwmhr',
        'source-layer': 'Garbage_collection_zones-9nytsk',
        paint: {

            'text-color': 'hsl(23, 94%, 64%)'
        },
        layout: {
            'text-field': '{rub_day}',
            'text-size': {
                stops: [[13, 18], [16, 20]]
            }
        }
    }
    // birds eye
    //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
}, {
    name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
    caption: 'How many "Blue Bikes" are ready in each station.',
    column: 'NBBikes',
    delay: 20000,
    dataset: new _sourceData.SourceData('tdvh-n9dv'),
    options: {
        symbol: {
            layout: {
                'icon-image': 'bicycle-share-15',
                'icon-allow-overlap': true,
                'icon-size': 2,
                'text-field': '{NBBikes}',
                //'text-allow-overlap': true,
                'text-offset': [1.5, 0],
                'text-size': 20
                // for some reason it gets silently rejected with this:
                /*'icon-size': {
                    property: 'NBBikes',
                     "stops": [
                      [0, 0.5],
                      [30, 3]
                     ]
                }*/
            },
            paint: {
                'text-color': 'hsl(239,71%,66%)' // match the blue bike icons
                //'text-color': 'rgb(0,174,203)' // CoM pop blue
            }
        }
    },

    flyTo: { "center": { "lng": 144.97768414562887, "lat": -37.81998948372839 }, "zoom": 14.670221676238507, "bearing": -57.93230251736117, "pitch": 60 }
}, // bike share
{
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...',
    filter: ['==', 'WEDDING', 'Y'],
    column: 'WEDDING',
    delay: 4000,
    opacity: 0.8,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -67.19999999999999, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('84bf-dihi'),
    caption: 'Places you can book for a wedding...or something else.',
    column: 'WEDDING',
    delay: 6000,
    opacity: 0.8,
    flyTo: { "center": { "lng": 144.9736255669336, "lat": -37.81396271334432 }, "zoom": 14.405591091671058, "bearing": -80, "pitch": 54.00000000000002 }
}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...',
    delay: 5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    options: {
        symbol: {
            layout: {
                'icon-image': 'toilet-15',
                'icon-allow-overlap': true
            }
        }
    }
}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...that are accessible for wheelchair users',
    filter: ['==', 'wheelchair', 'yes'],
    delay: 1,
    linger: 5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    options: {
        symbol: {
            layout: {
                'icon-image': 'wheelchair-15',
                'icon-allow-overlap': true
            }
        }
    }

}, {
    dataset: new _sourceData.SourceData('ru3z-44we'),
    caption: 'Public toilets...that are accessible for wheelchair users',
    delay: 5000,
    //linger:5000,
    flyTo: { "center": { "lng": 144.97027688989027, "lat": -37.81107254397835 }, "zoom": 14.8, "bearing": -89.74253780407638, "pitch": 60 },
    filter: ['!=', 'wheelchair', 'yes'],
    options: {
        symbol: {
            layout: {
                'icon-image': 'toilet-15',
                'icon-allow-overlap': true
            }
        }
    }

}, {
    delay: 10000,

    caption: 'Our data tells you where your dog doesn\'t need a leash',
    name: 'Dog Walking Zones',
    mapbox: {
        id: '2',
        type: 'fill',
        source: 'mapbox://cityofmelbourne.clzap2je',
        'source-layer': 'Dog_Walking_Zones-3fh9q4',
        paint: {
            'fill-color': 'hsl(340, 97%,65%)', //hsl(340, 97%, 45%)
            'fill-opacity': 0.8
        },
        filter: ['==', 'status', 'offleash']
    },
    flyTo: { "center": { "lng": 144.95746092528066, "lat": -37.79450697427422 }, "zoom": 14.955544903145544, "bearing": -44.84132745183728, "pitch": 60 }
    //flyTo: {"center":{"lng":144.96472084161525,"lat":-37.79947747257584},"zoom":14.933931528036048,"bearing":-57.64132745183708,"pitch":60}
    //flyTo:{"center":{"lng":144.98613987732932,"lat":-37.83888266596187},"zoom":15.096419579432878,"bearing":-30,"pitch":57.49999999999999}
}, {
    delay: 10000,
    caption: 'There\'s even every cafe and restaurant',

    dataset: new _sourceData.SourceData('sfrg-zygb'),
    // CBD looking towards Carlton
    flyTo: { "center": { "lng": 144.96420099897045, "lat": -37.8040762916216 }, "zoom": 15.695662136339653, "bearing": -22.56971876500631, "pitch": 60 },
    //flyTo: {"center":{"lng":144.97027688989027,"lat":-37.81107254397835},"zoom":14.8,"bearing":-89.74253780407638,"pitch":60},
    //flyTo:{"center":{"lng":144.97098789992964,"lat":-37.81021310404749},"zoom":16.02773233201699,"bearing":-135.21975308641981,"pitch":60},
    options: {
        symbol: {
            layout: {
                'icon-image': 'cafe-15',
                'icon-allow-overlap': true
            }
        }
    }
}, {
    delay: 2000,
    linger: 26000,
    caption: 'What will <b><i>you</i></b> do with our data?',
    name: 'Building outlines',
    opacity: 0.1,
    mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': {
                property: 'height',
                stops: [[0, 'hsl(146, 50%, 10%)'], [200, 'hsl(146, 100%, 60%)']]
            },
            //'hsl(146, 100%, 20%)',

            'fill-extrusion-height': {
                'property': 'height',
                type: 'identity'
            }
        }

    }
}, {
    delay: 2000,
    paint: [['buildings', 'fill-extrusion-opacity', 0.3]],
    keepPaint: true,
    flyTo: { center: { lng: 144.95, lat: -37.813 }, bearing: 0, zoom: 14, pitch: 45, duration: 20000 }
}, {
    delay: 2000,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.5]]
}, {
    delay: 2000,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.6]]
}, {
    delay: 20000,
    caption: 'What will <b><i>you</i></b> do with our data?',
    name: 'Building outlines',
    //opacity:0.6,
    keepPaint: true,
    paint: [['buildings', 'fill-extrusion-opacity', 0.7]],
    /*mapbox: {
        id: 'buildings',
        type: 'fill-extrusion',
        source: 'mapbox://cityofmelbourne.052wfh9y',
        'source-layer': 'Building_outlines-0mm7az',
        paint: {
            'fill-extrusion-color': 'hsl(146, 100%, 20%)',
            'fill-extrusion-opacity': 0.6,
            'fill-extrusion-height': {
                'property':'height',
                type: 'identity'
            }
        }
     },*/
    //matching starting position?
    flyTo: { center: { lng: 144.95, lat: -37.813 }, bearing: 0, zoom: 14, pitch: 45, duration: 20000 }
    // from abbotsfordish
    //flyTo:{"center":{"lng":144.9725135032764,"lat":-37.807415209051285},"zoom":14.896259153012243,"bearing":-106.40000000000015,"pitch":60}
    //from south
    //flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
}];
/*
const crappyFinale = [
    //////////////////////////////////
    // Ze grande finale
    {
        delay:1,
        dataset: new SourceData('sfrg-zygb'), // cafes
        options: {
            symbol: {
                layout: {
                    'icon-image': 'cafe-15',
                    'icon-allow-overlap': true,
                    'icon-size': 0.5
                }
            }
        },
        linger:20000
    },
    {
        delay: 1,
        mapbox: {
            id: 'alltrees',            
            type: 'circle',
            source: 'mapbox://cityofmelbourne.9trpnbu6',
            'source-layer': 'Trees__with_species_and_dimen-77b9mn',
            paint: {
                'circle-radius': 2,
                'circle-color': 'hsl(146, 50%, 36%)',
                //'circle-color': 'hsl(146, 100%, 36%)',
                'circle-opacity': 0.9
            },

        },
        linger:20000
    },   
    { 
        delay:11, linger:20000,
        mapbox: {
            id: 'boundaries',
            type: 'line',
            source: 'mapbox://cityofmelbourne.799drouh',
            'source-layer': 'Property_boundaries-061k0x',
            paint: {
                
                'line-color': 'rgb(0,183,79)',
                'line-width': {
                    stops: [
                        [13, 0.5],
                        [16, 2]
                    ]
                }

                
            },
        },
    },
    { // pedestrian sensors
        delay:1,linger:20000,
        dataset: new SourceData('ygaw-6rzq'),
        flyTo: {"center":{"lng":144.96367854761945,"lat":-37.80236896106898},"zoom":15.389393850725732,"bearing":-143.5844675124954,"pitch":60}                                
    },

    {
        caption: 'What will <u>you</u>&nbsp; do with our data?',
        delay:20000,
        linger:30000,
        opacity:0.4,
        mapbox: {
            id: 'buildings',
            type: 'fill-extrusion',
            source: 'mapbox://cityofmelbourne.052wfh9y',
            'source-layer': 'Building_outlines-0mm7az',
            paint: {
                'fill-extrusion-color': 'hsl(146, 0%, 20%)',
                'fill-extrusion-opacity': 0.9,
                'fill-extrusion-height': {
                    'property':'height',
                    type: 'identity'
                }
            }

        },
    },

];
*/

var unused = [{
    delay: 10000,
    caption: 'Pedestrian sensors count foot traffic every hour',
    name: 'Pedestrian sensor locations',
    dataset: new _sourceData.SourceData('ygaw-6rzq'),
    flyTo: { "center": { "lng": 144.96367854761945, "lat": -37.80236896106898 }, "zoom": 15.389393850725732, "bearing": -143.5844675124954, "pitch": 60 }
}];

var datasets2 = exports.datasets2 = [{
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPLIED'],
    caption: 'Major development project applications'

}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'APPROVED'],
    caption: 'Major development projects approved'
}, {
    delay: 10000,
    dataset: new _sourceData.SourceData('gh7s-qda8'),
    column: 'status',
    filter: ['==', 'status', 'UNDER CONSTRUCTION'],
    caption: 'Major development projects under construction'
}, { delay: 5000, dataset: new _sourceData.SourceData('tdvh-n9dv') }, // bike share
{ delay: 9000, dataset: new _sourceData.SourceData('c3gt-hrz6'), column: 'Accommodation' }, { delay: 10000, dataset: new _sourceData.SourceData('b36j-kiy4'), column: 'Arts and Recreation Services' },
//{ delay: 3000, dataset: new SourceData('c3gt-hrz6'), column: 'Retail Trade' },
{ delay: 9000, dataset: new _sourceData.SourceData('c3gt-hrz6'), column: 'Construction' }
//{ delay: 1000, dataset: 'b36j-kiy4' },
//{ delay: 2000, dataset: '234q-gg83' }
];

},{"./sourceData":7}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{}],4:[function(require,module,exports){
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
},{}],5:[function(require,module,exports){
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

},{"d3-collection":2,"d3-dispatch":3,"d3-dsv":4}],6:[function(require,module,exports){
!function(e,n){"object"==typeof exports&&"undefined"!=typeof module?module.exports=n(require("d3-request")):"function"==typeof define&&define.amd?define(["d3-request"],n):(e.d3=e.d3||{},e.d3.promise=n(e.d3))}(this,function(e){"use strict";function n(e,n){return function(){for(var t=arguments.length,r=Array(t),o=0;t>o;o++)r[o]=arguments[o];return new Promise(function(t,o){var u=function(e,n){return e?void o(Error(e)):void t(n)};n.apply(e,r.concat(u))})}}var t={};return["csv","tsv","json","xml","text","html"].forEach(function(r){t[r]=n(e,e[r])}),t});
},{"d3-request":5}],7:[function(require,module,exports){
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
                try {
                    // "new backend" datasets use a WKT field [POINT (lon lat)] instead of (lat, lon)
                    if (this.locationIsPoint) {
                        return location.replace('POINT (', '').replace(')', '').split(' ').map(function (n) {
                            return Number(n);
                        });
                    } else if (this.shape === 'point') {
                        //console.log(location.length);
                        return [Number(location.split(', ')[1].replace(')', '')), Number(location.split(', ')[0].replace('(', ''))];
                    } else return location;
                } catch (e) {
                    console.log('Unreadable location ' + location + ' in ' + this.name + '.');
                    console.error(e);
                }
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

            if (!row[this.locationColumn]) return null; // skip this row.

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
                try {
                    return d3.csv('https://data.melbourne.vic.gov.au/api/views/' + _this4.dataId + '/rows.csv?accessType=DOWNLOAD', _this4.convertRow.bind(_this4)).then(function (rows) {
                        //console.log("Got rows for " + this.name);
                        _this4.rows = rows;
                        _this4.computeSortedFrequencies();
                        if (_this4.shape === 'polygon') _this4.computeBlockIndex();
                        return _this4;
                    }).catch(function (e) {
                        console.error('Problem loading ' + _this4.name + '.');
                        console.error(e);
                    });
                } catch (e) {
                    console.error('Problem loading ' + _this4.name);
                    console.error(e);
                }
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

},{"d3.promise":6}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL25wbS9saWIvbm9kZV9tb2R1bGVzL3dlYi1ib2lsZXJwbGF0ZS9ub2RlX21vZHVsZXMvYnJvd3Nlci1wYWNrL19wcmVsdWRlLmpzIiwic3JjL2pzL2N5Y2xlRGF0YXNldHMuanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLWNvbGxlY3Rpb24vYnVpbGQvZDMtY29sbGVjdGlvbi5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMtZGlzcGF0Y2gvYnVpbGQvZDMtZGlzcGF0Y2guanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLWRzdi9idWlsZC9kMy1kc3YuanMiLCJzcmMvanMvbm9kZV9tb2R1bGVzL2QzLXJlcXVlc3QvYnVpbGQvZDMtcmVxdWVzdC5qcyIsInNyYy9qcy9ub2RlX21vZHVsZXMvZDMucHJvbWlzZS9kaXN0L2QzLnByb21pc2UubWluLmpzIiwic3JjL2pzL3NvdXJjZURhdGEuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7Ozs7O0FDMEpBOztBQTFKQTs7QUFFQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBeUJBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUEyRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBNkNBLElBQU0sTUFBTTtBQUNSLFVBQU0sZ0JBREU7QUFFUixhQUFRLGlCQUZBO0FBR1IsV0FBTztBQUhDLENBQVo7QUFLQSxJQUFJLFVBQUosR0FBaUIsQ0FBQyxJQUFJLElBQUwsRUFBVyxJQUFJLE9BQWYsRUFBd0IsSUFBSSxLQUE1QixDQUFqQjs7QUFJTyxJQUFNLDhCQUFXLENBQ3BCO0FBQ0ksV0FBTSxJQURWO0FBRUksYUFBUSw4QkFGWjtBQUdJLGtCQUFjLElBSGxCO0FBSUksV0FBTSxFQUpWO0FBS0ksVUFBSztBQUxULENBRG9CLEVBU3BCO0FBQ0ksV0FBTSxJQURWO0FBRUksYUFB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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN6TkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeE5BOzs7Ozs7Ozs7Ozs7QUNBQTtBQUNBLElBQUksS0FBSyxRQUFRLFlBQVIsQ0FBVDs7QUFFQSxTQUFTLEdBQVQsQ0FBYSxDQUFiLEVBQWdCLENBQWhCLEVBQW1CO0FBQ2YsV0FBTyxNQUFNLFNBQU4sR0FBa0IsQ0FBbEIsR0FBc0IsQ0FBN0I7QUFDSDtBQUNEOzs7OztJQUlhLFUs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QUFoQixJQUFzQyxFQUF0QztBQUNKLHVCQUFLLFVBQUwsQ0FBZ0IsSUFBSSxhQUFKLENBQWhCLEVBQW9DLElBQUksVUFBSixDQUFwQyxJQUF1RCxLQUF2RDtBQUNILGFBSkQ7QUFLSDs7O3VDQUVjLE8sQ0FBUSxpQixFQUFtQjtBQUN0QyxtQkFBTyxLQUFLLElBQUwsQ0FBVSxLQUFLLFVBQUwsQ0FBZ0IsS0FBSyxnQkFBckIsRUFBdUMsT0FBdkMsQ0FBVixDQUFQO0FBQ0g7Ozt1Q0FFYztBQUFBOztBQUNYLG1CQUFPLEtBQUssSUFBTCxDQUFVLE1BQVYsQ0FBaUI7QUFBQSx1QkFBTyxJQUFJLGFBQUosTUFBdUIsT0FBSyxnQkFBNUIsSUFBZ0QsSUFBSSxpQkFBSixNQUEyQix5QkFBbEY7QUFBQSxhQUFqQixDQUFQO0FBQ0giLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG5cbi8qXG5TdWdnZXN0aW9uczpcblxuVGhpcyBpcyBNZWxib3VybmVcbkhlcmUgYXJlIG91ciBwcmVjaW5jdHNcbkFzIHlvdSdkIGd1ZXNzLCB3ZSBoYXZlIGEgbG90IG9mIGRhdGE6XG4tIGFkZHJlc3NlcywgYm91bmRhcmllc1xuXG5cbjEuIE9yaWVudCB3aXRoIHByZWNpbmN0c1xuXG4yLiBCdXQgd2UgYWxzbyBoYXZlOiBcbi0gd2VkZGluZ1xuLSBiaW4gbmlnaHRzXG4tIGRvZ3MgbGFzdCBcbi0gdG9pbGV0c1xuLS0gYWxsXG4tLSB3aGVlbGNoYWlycyB3aXRoIGljb25zXG5cbiovXG5cblxuXG5cblxuLypcbkludHJvXG4tIE92ZXJ2aWV3IChzdWJ1cmIgbmFtZXMgaGlnaGxpZ2h0ZWQpXG4tIFByb3BlcnR5IGJvdW5kYXJpZXNcbi0gU3RyZWV0IGFkZHJlc3Nlc1xuXG5VcmJhbiBmb3Jlc3Q6XG4tIGVsbXNcbi0gZ3Vtc1xuLSBwbGFuZXNcbi0gYWxsXG5cbkNMVUVcbi0gZW1wbG95bWVudFxuLSB0cmFuc3BvcnQgc2VjdG9yXG4tIHNvY2lhbC9oZWFsdGggc2VjdG9yXG5cbkRBTVxuLSBhcHBsaWNhdGlvbnNcbi0gY29uc3RydWN0aW9uXG4tIGNvbXBsZXRlZFxuXG5EaWQgeW91IGtub3c6XG4tIGNvbW11bml0eSBmb29kXG4tIEdhcmJhZ2UgQ29sbGVjdGlvbiBab25lc1xuLSBCb29rYWJsZSBFdmVudCBWZW51ZXNcbi0tIHdlZGRpbmdhYmxlXG4tLSBhbGxcbi0gVG9pbGV0c1xuLS0gYWxsIFxuLS0gYWNjZXNzaWJsZVxuLSBDYWZlcyBhbmQgUmVzdGF1cmFudHNcbi0gRG9nIHdhbGtpbmcgem9uZXNcblxuRmluYWxlOlxuLSBTa3lsaW5lXG4tIFdoYXQgY2FuIHlvdSBkbyB3aXRoIG91ciBvcGVuIGRhdGE/XG5cblxuR2FyYmFnZSBDb2xsZWN0aW9uIFpvbmVzXG5Eb2cgV2Fsa2luZyBab25lcyBvZmYtbGVhc2hcbkJpa2UgU2hhcmUgU3RhdGlvbnNcbkJvb2thYmxlIEV2ZW50IFZlbnVlc1xuLSB3ZWRkaW5nYWJsZVxuXG5cbkdyYW5kIGZpbmFsZSBcIldoYXQgY2FuIHlvdSBkbyB3aXRoIG91ciBvcGVuIGRhdGFcIj9cbi0gYnVpbGRpbmdzXG4tIGNhZmVzXG4tIFxuXG5cblxuVGhlc2UgbmVlZCBhIGhvbWU6XG4tIGJpa2Ugc2hhcmUgc3RhdGlvbnNcbi0gcGVkZXN0cmlhbiBzZW5zb3JzXG4tIGFkZHJlc3Nlc1xuLSBwcm9wZXJ0eSBib3VuZGFyaWVzXG4tIGJ1aWxkaW5nc1xuLSBjYWZlc1xuLSBjb21tdW5pdHkgZm9vZFxuXG5cblxuKi9cblxuXG5cblxuXG5cblxuXG5cblxuLypcblxuRGF0YXNldCBydW4gb3JkZXJcbi0gYnVpbGRpbmdzICgzRClcbi0gdHJlZXMgKGZyb20gbXkgb3BlbnRyZWVzIGFjY291bnQpXG4tIGNhZmVzIChjaXR5IG9mIG1lbGJvdXJuZSwgc3R5bGVkIHdpdGggY29mZmVlIHN5bWJvbClcbi0gYmFycyAoc2ltaWxhcilcbi0gZ2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzXG4tIGRvZyB3YWxraW5nIHpvbmVzXG4tIENMVUUgKDNEIGJsb2Nrcylcbi0tIGJ1c2luZXNzIGVzdGFibGlzaG1lbnRzIHBlciBibG9ja1xuLS0tIHZhcmlvdXMgdHlwZXMsIHRoZW4gdG90YWxcbi0tIGVtcGxveW1lbnQgKHZhcmlvdXMgdHlwZXMgd2l0aCBzcGVjaWZpYyB2YW50YWdlIHBvaW50cyAtIGJld2FyZSB0aGF0IG5vdCBhbGwgZGF0YSBpbmNsdWRlZDsgdGhlbiB0b3RhbClcbi0tIGZsb29yIHVzZSAoZGl0dG8pXG5cblxuXG5cbk1pbmltdW1cbi0gZmxvYXR5IGNhbWVyYXNcbi0gY2x1ZSAzRCxcbi0gYmlrZSBzaGFyZSBzdGF0aW9uc1xuXG5IZWFkZXI6XG4tIGRhdGFzZXQgbmFtZVxuLSBjb2x1bW4gbmFtZVxuXG5Gb290ZXI6IGRhdGEubWVsYm91cm5lLnZpYy5nb3YuYXVcblxuQ29NIGxvZ29cblxuXG5NZWRpdW1cbi0gTXVuaWNpcGFsaXR5IGJvdW5kYXJ5IG92ZXJsYWlkXG5cblN0cmV0Y2ggZ29hbHNcbi0gb3ZlcmxheSBhIHRleHQgbGFiZWwgb24gYSBidWlsZGluZy9jbHVlYmxvY2sgKGVnLCBGcmVlbWFzb25zIEhvc3BpdGFsIC0gdG8gc2hvdyB3aHkgc28gbXVjaCBoZWFsdGhjYXJlKVxuXG5cblxuXG5cbiovXG5cblxuY29uc3QgQ29NID0ge1xuICAgIGJsdWU6ICdyZ2IoMCwxNzQsMjAzKScsXG4gICAgbWFnZW50YToncmdiKDIyNywgNCwgODApJyxcbiAgICBncmVlbjogJ3JnYigwLDE4Myw3OSknXG59O1xuQ29NLmVudW1Db2xvcnMgPSBbQ29NLmJsdWUsIENvTS5tYWdlbnRhLCBDb00uZ3JlZW5dO1xuXG5pbXBvcnQgeyBTb3VyY2VEYXRhIH0gZnJvbSAnLi9zb3VyY2VEYXRhJztcblxuZXhwb3J0IGNvbnN0IGRhdGFzZXRzID0gW1xuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonTWVsYm91cm5lIGhhcyBhIGxvdCBvZiBkYXRhLicsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAge1xuICAgICAgICBkZWxheTo4MDAwLFxuICAgICAgICBjYXB0aW9uOidUaGlzIGlzIE1lbGJvdXJuZScsXG4gICAgICAgIHBhaW50OiBbXG4gICAgICAgICAgICBbJ3BsYWNlLXN1YnVyYicsICd0ZXh0LWNvbG9yJywgJ3JnYigwLDE4Myw3OSknXSxcbiAgICAgICAgICAgIFsncGxhY2UtbmVpZ2hib3VyaG9vZCcsICd0ZXh0LWNvbG9yJywgJ3JnYigwLDE4Myw3OSknXVxuICAgICAgICBdLFxuICAgICAgICBuYW1lOiAnJyxcbiAgICAgICAgZmx5VG86IHtjZW50ZXI6e2xuZzoxNDQuOTUsbGF0Oi0zNy44MTN9LHpvb206MTMscGl0Y2g6NDUsYmVhcmluZzowfVxuXG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkZWxheToxMDAwLFxuICAgICAgICBuYW1lOiAnUHJvcGVydHkgYm91bmRhcmllcycsXG4gICAgICAgIGNhcHRpb246ICdXZSBoYXZlIGRhdGEgbGlrZSBwcm9wZXJ0eSBib3VuZGFyaWVzIGZvciBwbGFubmluZycsXG4gICAgICAgIG9wYWNpdHk6IDEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzLTEnLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgbGluZ2VyOjEwMDAsIC8vIGp1c3QgdG8gYXZvaWQgZmxhc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOiB7bG5nOjE0NC45NTMwODYsbGF0Oi0zNy44MDc1MDl9LHpvb206MTQsYmVhcmluZzowLHBpdGNoOjAsIGR1cmF0aW9uOjEwMDAwfSxcbiAgICB9LFxuICAgIC8vIHJlcGVhdCAtIGp1c3QgdG8gZm9yY2UgdGhlIHRpbWluZ1xuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBsaW5nZXI6MzAwMCxcbiAgICAgICAgbmFtZTogJ1Byb3BlcnR5IGJvdW5kYXJpZXMnLFxuICAgICAgICBjYXB0aW9uOiAnV2UgaGF2ZSBkYXRhIGxpa2UgcHJvcGVydHkgYm91bmRhcmllcyBmb3IgcGxhbm5pbmcnLFxuICAgICAgICBvcGFjaXR5OjEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzLTInLFxuICAgICAgICAgICAgdHlwZTogJ2xpbmUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjc5OWRyb3VoJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnUHJvcGVydHlfYm91bmRhcmllcy0wNjFrMHgnLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICAnbGluZS1jb2xvcic6ICdyZ2IoMCwxODMsNzkpJyxcbiAgICAgICAgICAgICAgICAnbGluZS13aWR0aCc6IHtcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxMywgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMl1cbiAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgICAgLy8ganVzdCByZXBlYXQgcHJldmlvdXMgdmlldy5cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6IHtsbmc6MTQ0Ljk1MzA4NixsYXQ6LTM3LjgwNzUwOX0sem9vbToxNCxiZWFyaW5nOjAscGl0Y2g6MCwgZHVyYXRpb246MTAwMDB9LFxuICAgIH0sXG5cbiAgICB7IFxuICAgICAgICBkZWxheToxNDAwMCxcbiAgICAgICAgbmFtZTogJ1N0cmVldCBhZGRyZXNzZXMnLFxuICAgICAgICBjYXB0aW9uOiAnQXMgeW91XFwnZCBndWVzcywgd2UgaGF2ZSBkYXRhIGxpa2UgZXZlcnkgc3RyZWV0IGFkZHJlc3MnLFxuICAgICAgICAvLyBuZWVkIHRvIHpvb20gaW4gY2xvc2Ugb24gdGhpcyBvbmVcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FkZHJlc3NlcycsXG4gICAgICAgICAgICB0eXBlOiAnc3ltYm9sJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS4zaXAzY291bycsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1N0cmVldF9hZGRyZXNzZXMtOTdlNW9uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtZmllbGQnOiAne3N0cmVldF9ub30nLFxuICAgICAgICAgICAgICAgICd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMCxcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgLy8gbmVhciB1bmktaXNoXG4gICAgICAgIGZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAwMTczNjQyNjA2OCxcImxhdFwiOi0zNy43OTc3MDc5ODg2MDEyM30sXCJ6b29tXCI6MTgsXCJiZWFyaW5nXCI6LTQ1LjcwMjAzMDQwNTA2MDg0LFwicGl0Y2hcIjo0OCwgZHVyYXRpb246MTQwMDB9XG4gICAgICAgIC8vIHJvdW5kYWJvdXQgb2YgZGVhdGggbG9va25nIG53XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTkxMDQ4NzA2MTE4NCxcImxhdFwiOi0zNy44MDA2MTA4ODk3MTczMn0sXCJ6b29tXCI6MTguNTcyMjA0NzgyODE5MTk1LFwiYmVhcmluZ1wiOi0yMC40MzU2MzY2OTE2NDM4MjIsXCJwaXRjaFwiOjU3Ljk5OTk5OTk5OTk5OTk5fVxuICAgIH0sXG5cblxuICAgIC8qe1xuICAgICAgICBkZWxheTogMTAwMDAsXG4gICAgICAgIGNhcHRpb246ICdUaGUgaGVhbHRoIGFuZCB0eXBlIG9mIGVhY2ggdHJlZSBpbiBvdXIgdXJiYW4gZm9yZXN0JyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDIsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjZcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1VsbXVzJyBdXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTc2NzQxNTQxODI2NixcImxhdFwiOi0zNy43OTE2ODY2MTk3NzI5NzV9LFwiem9vbVwiOjE1LjQ4NzMzNzQ1NzM1NjY5MSxcImJlYXJpbmdcIjotMTIyLjQwMDAwMDAwMDAwMDA5LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0MzE4MTYzNzU1MTA1LFwibGF0XCI6LTM3Ljc4MzUxOTUzNDE5NDQ5fSxcInpvb21cIjoxNS43NzM0ODg1NzQ3MjEwODIsXCJiZWFyaW5nXCI6MTQ3LjY1MjE5MzgyMzczMTA3LFwicGl0Y2hcIjo1OS45OTU4OTgyNTc2OTA5Nn1cbiAgICB9LCovXG4gICAge1xuICAgICAgICBkZWxheTo1MDAwLFxuICAgICAgICBjYXB0aW9uOidVcmJhbiBGb3Jlc3QnLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnVGhlIFVyYmFuIEZvcmVzdCBjb250YWlucyBldmVyeSBlbG0gdHJlZS4uLicsXG4gICAgICAgIG5hbWU6ICdUcmVlcywgd2l0aCBzcGVjaWVzIGFuZCBkaW1lbnNpb25zIChVcmJhbiBGb3Jlc3QpJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2FsbHRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAzLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtY29sb3InOiAnaHNsKDMwLCA4MCUsIDU2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnVWxtdXMnIF1cblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzEzOCxcImxhdFwiOi0zNy43ODg4NDN9LFwiem9vbVwiOjE1LjIsXCJiZWFyaW5nXCI6LTEwNi4xNCxcInBpdGNoXCI6NTV9XG5cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDUwMDAsXG4gICAgICAgIGNhcHRpb246ICcuLi5ldmVyeSBndW0gdHJlZS4uLicsIC8vIGFkZCBhIG51bWJlclxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdndW10cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGZpbHRlcjogWyAnaW4nLCAnR2VudXMnLCAnRXVjYWx5cHR1cycsICdDb3J5bWJpYScsICdBbmdvcGhvcmEnIF1cblxuICAgICAgICB9LFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuODQ3Mzc0ODg2ODkwNyxcImxhdFwiOi0zNy44MTE3Nzk3NDA3ODcyNDR9LFwiem9vbVwiOjEzLjE2MjUyNDE1MDg0NzMxNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDMxODE2Mzc1NTEwNSxcImxhdFwiOi0zNy43ODM1MTk1MzQxOTQ0OX0sXCJ6b29tXCI6MTUuNzczNDg4NTc0NzIxMDgyLFwiYmVhcmluZ1wiOjIwMCxcInBpdGNoXCI6NTkuOTk1ODk4MjU3NjkwOTZ9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDI3MzI1NjczMzMxLFwibGF0XCI6LTM3Ljc4NDQ0OTQwNTkzMDM4fSxcInpvb21cIjoxNC41LFwiYmVhcmluZ1wiOi0xNjMuMzEwMjIyNDQyNjY3NCxcInBpdGNoXCI6MzUuNTAwMDAwMDAwMDAwMDE0fVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheTogODAwMCxcbiAgICAgICAgLy9kYXRhc2V0TGVhZDogMzAwMCxcbiAgICAgICAgY2FwdGlvbjogJy4uLmFuZCBldmVyeSBwbGFuZSB0cmVlLicsIC8vIGFkZCBhIG51bWJlclxuICAgICAgICBuYW1lOiAnVHJlZXMsIHdpdGggc3BlY2llcyBhbmQgZGltZW5zaW9ucyAoVXJiYW4gRm9yZXN0KScsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdwbGFuZXRyZWVzJywgICAgICAgICAgICBcbiAgICAgICAgICAgIHR5cGU6ICdjaXJjbGUnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjl0cnBuYnU2JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnVHJlZXNfX3dpdGhfc3BlY2llc19hbmRfZGltZW4tNzdiOW1uJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1yYWRpdXMnOiAzLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgzNDAsIDk3JSw2NSUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsgJ2luJywgJ0dlbnVzJywgJ1BsYXRhbnVzJyBdXG4gICAgICAgICAgICBcblxuICAgICAgICB9LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk0Mzk0NjMzODM4OTY1LFwibGF0XCI6LTM3Ljc5NTg4ODcwNjY4MjcxfSxcInpvb21cIjoxNS45MDUxMzAzNjE0NDY2NjgsXCJiZWFyaW5nXCI6MTU3LjU5OTk5OTk5OTk5NzQsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTI2NzI1MzE0Nzg1NTMsXCJsYXRcIjotMzcuODA0Mzg1OTQ5Mjc2Mzk0fSxcInpvb21cIjoxNSxcImJlYXJpbmdcIjoxMTkuNzg4Njg2ODI4ODIzNzQsXCJwaXRjaFwiOjYwfVxuICAgICAgICBcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkxNDc4NTEwMDE2MjAyLFwibGF0XCI6LTM3Ljc4NDM0MTQ3MTY3NDc3fSxcInpvb21cIjoxMy45MjIyMjg0NjE3OTM2NjksXCJiZWFyaW5nXCI6MTIyLjk5NDc4MzQ2MDQzNDYsXCJwaXRjaFwiOjQ3LjUwMDAwMDAwMDAwMDAzfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTUzNDM0NTA3NTUxNixcImxhdFwiOi0zNy44MDEzNDExODAxMjUyMn0sXCJ6b29tXCI6MTUsXCJiZWFyaW5nXCI6MTUxLjAwMDczMDQ4ODI3MzM4LFwicGl0Y2hcIjo1OC45OTk5OTk5OTk5OTk5OX1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1NjEzODg0ODg0MDksXCJsYXRcIjotMzcuODA5MDI3MTA1MzE2MzJ9LFwiem9vbVwiOjE0LjI0MTc1NzAzMDgxNjYzNixcImJlYXJpbmdcIjotMTYzLjMxMDIyMjQ0MjY2NzQsXCJwaXRjaFwiOjM1LjUwMDAwMDAwMDAwMDAxNH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnTmVhcmx5IDcwLDAwMCB0cmVlcyBpbiBhbGwuJyxcbiAgICAgICAgbmFtZTogJ1RyZWVzLCB3aXRoIHNwZWNpZXMgYW5kIGRpbWVuc2lvbnMgKFVyYmFuIEZvcmVzdCknLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYWxsdHJlZXMnLCAgICAgICAgICAgIFxuICAgICAgICAgICAgdHlwZTogJ2NpcmNsZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOXRycG5idTYnLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdUcmVlc19fd2l0aF9zcGVjaWVzX2FuZF9kaW1lbi03N2I5bW4nLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnY2lyY2xlLXJhZGl1cyc6IDIsXG4gICAgICAgICAgICAgICAgJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCA1MCUsIDM2JSknLFxuICAgICAgICAgICAgICAgIC8vJ2NpcmNsZS1jb2xvcic6ICdoc2woMTQ2LCAxMDAlLCAzNiUpJyxcbiAgICAgICAgICAgICAgICAnY2lyY2xlLW9wYWNpdHknOiAwLjlcbiAgICAgICAgICAgIH0sXG5cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDE5MTE1NzAwMDAzNCxcImxhdFwiOi0zNy44MDAzNjcwOTIxNDAyMn0sXCJ6b29tXCI6MTQuMSxcImJlYXJpbmdcIjoxNDQuOTI3MjgzOTI3NDI2OTQsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQzMTgxNjM3NTUxMDUsXCJsYXRcIjotMzcuNzgzNTE5NTM0MTk0NDl9LFwiem9vbVwiOjE1Ljc3MzQ4ODU3NDcyMTA4MixcImJlYXJpbmdcIjoxNDcuNjUyMTkzODIzNzMxMDcsXCJwaXRjaFwiOjU5Ljk5NTg5ODI1NzY5MDk2fVxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OjUwMDAsXG4gICAgICAgIGNhcHRpb246J0NlbnN1cyBvZiBMYW5kIFVzZSBhbmQgRW1wbG95bWVudCAoQ0xVRSknLFxuICAgICAgICBzdXBlckNhcHRpb246IHRydWUsXG4gICAgICAgIHBhaW50OltdLFxuICAgICAgICBuYW1lOicnXG4gICAgfSxcblxuICAgIFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2IzNmota2l5NCcpLCBcbiAgICAgICAgY29sdW1uOiAnVG90YWwgZW1wbG95bWVudCBpbiBibG9jaycgLFxuICAgICAgICBjYXB0aW9uOiAnQ0xVRSByZXZlYWxzIHdoZXJlIGVtcGxveW1lbnQgaXMgY29uY2VudHJhdGVkJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45MjY3MjUzMTQ3ODU3LFwibGF0XCI6LTM3LjgwNDM4NTk0OTI3NjQ5NH0sXCJ6b29tXCI6MTMuODg2Mjg3MzIwMTU5ODEsXCJiZWFyaW5nXCI6MTE5Ljc4ODY4NjgyODgyMzc0LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk1OTg1MzM0NTYyMTQsXCJsYXRcIjotMzcuODM1ODE5MTYyNDM2NjF9LFwiem9vbVwiOjEzLjY0OTExNjYxNDg3MjgzNixcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cbiAgICB9LFxuXG4gICAgLyp7XG4gICAgICAgIGRlbGF5OjEyMDAwLFxuICAgICAgICBjYXB0aW9uOiAnV2hlcmUgdGhlIENvdW5jaWxcXCdzIHNpZ25pZmljYW50IHByb3BlcnR5IGhvbGRpbmdzIGFyZSBsb2NhdGVkLicsXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdmdGhpLXphanknKSxcbiAgICAgICAgY29sdW1uOiAnT3duZXJzaGlwIG9yIENvbnRyb2wnLFxuICAgICAgICBzaG93TGVnZW5kOiB0cnVlLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzkwMzA4NzIzODQ2LFwibGF0XCI6LTM3LjgxODYzMTY2MDgxMDQyNX0sXCJ6b29tXCI6MTMuNSxcImJlYXJpbmdcIjowLFwicGl0Y2hcIjo0NX1cblxuICAgIH0sXG4gICAgKi9cbiAgICAgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBcbiAgICAgICAgY29sdW1uOiAnVHJhbnNwb3J0LCBQb3N0YWwgYW5kIFN0b3JhZ2UnICxcbiAgICAgICAgY2FwdGlvbjogJy4uLndoZXJlIHRoZSB0cmFuc3BvcnQsIHBvc3RhbCBhbmQgc3RvcmFnZSBzZWN0b3IgaXMgbG9jYXRlZC4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0LjkyNzY4MTc2NzEwNzEyLFwibGF0XCI6LTM3LjgyOTIxODI0ODU4NzI0Nn0sXCJ6b29tXCI6MTIuNzI4NDMxMjE3OTE0OTE5LFwiYmVhcmluZ1wiOjY4LjcwMzg4MzEyMTg3NDU4LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdjM2d0LWhyejYnKSwgXG4gICAgICAgIGNvbHVtbjogJ0hlYWx0aCBDYXJlIGFuZCBTb2NpYWwgQXNzaXN0YW5jZScgLFxuICAgICAgICBjYXB0aW9uOiAnYW5kIHdoZXJlIHRoZSBoZWFsdGhjYXJlIGFuZCBzb2NpYWwgYXNzaXN0YW5jZSBvcmdhbmlzYXRpb25zIGFyZSBiYXNlZC4nLFxuICAgICAgICBmbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTU3MjMzMTEyMTg1MyxcImxhdFwiOi0zNy44MjcwNjM3NDc2MzgyNH0sXCJ6b29tXCI6MTMuMDYzNzU3Mzg2MjMyMjQyLFwiYmVhcmluZ1wiOjI2LjM3NDc4NjkxODUyMzM0LFwicGl0Y2hcIjo2MH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6NTAwMCxcbiAgICAgICAgY2FwdGlvbjonRGV2ZWxvcG1lbnQgQWN0aXZpdHkgTW9uaXRvciAoREFNKScsXG4gICAgICAgIHN1cGVyQ2FwdGlvbjogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6W10sXG4gICAgICAgIG5hbWU6JydcbiAgICB9LFxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDcwMDAsIFxuICAgICAgICBsaW5nZXI6OTAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ0RBTSB0cmFja3MgbWFqb3IgcHJvamVjdHMgaW4gdGhlIHBsYW5uaW5nIHN0YWdlLi4uJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcblxuICAgIHsgXG4gICAgICAgIGRlbGF5OiA0MDAwLFxuICAgICAgICBsaW5nZXI6NTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCAgICAgICAgIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdVTkRFUiBDT05TVFJVQ1RJT04nIF0sIFxuICAgICAgICBjYXB0aW9uOiAnLi4ucHJvamVjdHMgdW5kZXIgY29uc3RydWN0aW9uJyxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjM1NDM3OTc3NTMzNSxcImxhdFwiOi0zNy44MjU5NTMwNjY0NjQ3Nn0sXCJ6b29tXCI6MTQuNjY1NDM3Mzc1NzQwNDI2LFwiYmVhcmluZ1wiOjAsXCJwaXRjaFwiOjU5LjV9XG5cbiAgICB9LCBcbiAgICB7IFxuICAgICAgICBkZWxheTogNTAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIG9wdGlvbnM6IHsgZW51bUNvbG9yczogQ29NLmVudW1Db2xvcnN9LFxuICAgICAgICBjb2x1bW46ICdzdGF0dXMnLCBcbiAgICAgICAgZmlsdGVyOiBbICc9PScsICdzdGF0dXMnLCAnQ09NUExFVEVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJy4uLmFuZCB0aG9zZSBhbHJlYWR5IGNvbXBsZXRlZC4nLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzU0Mzc5Nzc1MzM1LFwibGF0XCI6LTM3LjgyNTk1MzA2NjQ2NDc2fSxcInpvb21cIjoxNC42NjU0MzczNzU3NDA0MjYsXCJiZWFyaW5nXCI6MCxcInBpdGNoXCI6NTkuNX1cblxuICAgIH0sIFxuLy8qKioqKioqKioqKioqKioqKioqKiogIFwiQnV0IGRpZCB5b3Uga25vd1wiIGRhdGFcbiAgICB7XG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBjYXB0aW9uOiAnQnV0IGRpZCB5b3Uga25vdyB3ZSBoYXZlIGRhdGEgYWJvdXQgaGVhbHRoeSwgYWZmb3JkYWJsZSBmb29kIHNlcnZpY2VzPycsXG4gICAgICAgIG5hbWU6ICdDb21tdW5pdHkgZm9vZCBzZXJ2aWNlcyB3aXRoIG9wZW5pbmcgaG91cnMsIHB1YmxpYyB0cmFuc3BvcnQgYW5kIHBhcmtpbmcgb3B0aW9ucycsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdmb29kJyxcbiAgICAgICAgICAgIHR5cGU6ICdzeW1ib2wnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjd4dmswazNsJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQ29tbXVuaXR5X2Zvb2Rfc2VydmljZXNfd2l0aF8tYTdjajl2JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAnaHNsKDMwLCA4MCUsIDU2JSknIC8vIGJyaWdodCBvcmFuZ2VcbiAgICAgICAgICAgICAgICAvLyd0ZXh0LWNvbG9yJzogJ3JnYigyNDksIDI0MywgMTc4KScsIC8vIG11dGVkIG9yYW5nZSwgYSBjaXR5IGZvciBwZW9wbGVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7TmFtZX0nLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiAxMixcblxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvL3NvdXRoIE1lbGJvdXJuZSBpc2hcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45Njg0NDUwNzY2MzU0MixcImxhdFwiOi0zNy44MjQ1OTk0OTEwMzI0NH0sXCJ6b29tXCI6MTQuMDE2OTc5ODY0NDgyMjMzLFwiYmVhcmluZ1wiOi0xMS41NzgzMzYxNjYxNDI4ODgsXCJwaXRjaFwiOjYwfVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTc0NzM3MzA5NDQ0NjYsXCJsYXRcIjotMzcuODA0OTA3MTU1OTUxM30sXCJ6b29tXCI6MTUuMzQ4Njc2MDk5OTIyODUyLFwiYmVhcmluZ1wiOi0xNTQuNDk3MTMzMzI4OTcwMSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45ODQ5MjI1MTQzODMwNyxcImxhdFwiOi0zNy44MDMxMDk3MjcyNzI4MX0sXCJ6b29tXCI6MTUuMzU4NTA5Nzg5NzkwODA4LFwiYmVhcmluZ1wiOi03OC4zOTk5OTk5OTk5OTk3LFwicGl0Y2hcIjo1OC41MDAwMDAwMDAwMDAwMTR9XG4gICAgfSxcbiAgICBcblxuXG4gICAgeyBcbiAgICAgICAgZGVsYXk6MSxcbiAgICAgICAgbmFtZTogJ0dhcmJhZ2UgY29sbGVjdGlvbiB6b25lcycsXG4gICAgICAgIGNhcHRpb246ICdXaGljaCBuaWdodCBpcyBiaW4gbmlnaHQ/JyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2dhcmJhZ2UtMScsXG4gICAgICAgICAgICB0eXBlOiAnbGluZScsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOGFycXdtaHInLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdHYXJiYWdlX2NvbGxlY3Rpb25fem9uZXMtOW55dHNrJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAnaHNsKDIzLCA5NCUsIDY0JSknLFxuICAgICAgICAgICAgICAgICdsaW5lLXdpZHRoJzoge1xuICAgICAgICAgICAgICAgICAgICBzdG9wczogW1xuICAgICAgICAgICAgICAgICAgICAgICAgWzEzLCA2XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMTBdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgICAgIGxpbmdlcjoxMDAwMCxcbiAgICAgICAgLy8gRmF3a25lciBQYXJraXNoXG4gICAgICAgIGZseVRvOiB7Y2VudGVyOiB7IGxuZzoxNDQuOTY1NDM3LCBsYXQ6LTM3LjgxNDIyNX0sIHpvb206IDEzLjcsYmVhcmluZzotMzAuOCwgcGl0Y2g6NjB9XG4gICAgICAgIC8vIGJpcmRzIGV5ZSwgem9vbWVkIG91dFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjEzLGJlYXJpbmc6MCxwaXRjaDowfSxcbiAgICB9LFxuXG5cblxuICAgIHsgXG4gICAgICAgIGRlbGF5OjEwMDAwLFxuICAgICAgICBuYW1lOiAnR2FyYmFnZSBjb2xsZWN0aW9uIHpvbmVzJyxcbiAgICAgICAgY2FwdGlvbjogJ1doaWNoIG5pZ2h0IGlzIGJpbiBuaWdodCcsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdnYXJiYWdlLTInLFxuICAgICAgICAgICAgdHlwZTogJ3N5bWJvbCcsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuOGFycXdtaHInLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdHYXJiYWdlX2NvbGxlY3Rpb25fem9uZXMtOW55dHNrJyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOiAnaHNsKDIzLCA5NCUsIDY0JSknLFxuICAgICAgICAgICAgfSwgXG4gICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7cnViX2RheX0nLFxuICAgICAgICAgICAgICAgICd0ZXh0LXNpemUnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDE4XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIFsxNiwgMjBdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9LFxuICAgICAgICB9XG4gICAgICAgIC8vIGJpcmRzIGV5ZVxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjoge2xuZzoxNDQuOTUzMDg2LGxhdDotMzcuODA3NTA5fSx6b29tOjE0LGJlYXJpbmc6MCxwaXRjaDowLCBkdXJhdGlvbjoxMDAwMH0sXG4gICAgfSxcblxuXG4gICAgeyBcbiAgICAgICAgbmFtZTogJ01lbGJvdXJuZSBCaWtlIFNoYXJlIHN0YXRpb25zLCB3aXRoIGN1cnJlbnQgbnVtYmVyIG9mIGZyZWUgYW5kIHVzZWQgZG9ja3MgKGV2ZXJ5IDE1IG1pbnV0ZXMpJyxcbiAgICAgICAgY2FwdGlvbjogJ0hvdyBtYW55IFwiQmx1ZSBCaWtlc1wiIGFyZSByZWFkeSBpbiBlYWNoIHN0YXRpb24uJyxcbiAgICAgICAgY29sdW1uOiAnTkJCaWtlcycsXG4gICAgICAgIGRlbGF5OiAyMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSAsXG4gICAgICAgIG9wdGlvbnM6IHtcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICdiaWN5Y2xlLXNoYXJlLTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWUsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLXNpemUnOiAyLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1maWVsZCc6ICd7TkJCaWtlc30nLFxuICAgICAgICAgICAgICAgICAgICAvLyd0ZXh0LWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1vZmZzZXQnOiBbMS41LDBdLFxuICAgICAgICAgICAgICAgICAgICAndGV4dC1zaXplJzoyMFxuICAgICAgICAgICAgICAgICAgICAvLyBmb3Igc29tZSByZWFzb24gaXQgZ2V0cyBzaWxlbnRseSByZWplY3RlZCB3aXRoIHRoaXM6XG4gICAgICAgICAgICAgICAgICAgIC8qJ2ljb24tc2l6ZSc6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnTkJCaWtlcycsXG5cbiAgICAgICAgICAgICAgICAgICAgICAgIFwic3RvcHNcIjogW1xuICAgICAgICAgICAgICAgICAgICAgICAgICBbMCwgMC41XSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgWzMwLCAzXVxuXG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgIH0qL1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3RleHQtY29sb3InOidoc2woMjM5LDcxJSw2NiUpJyAvLyBtYXRjaCB0aGUgYmx1ZSBiaWtlIGljb25zXG4gICAgICAgICAgICAgICAgICAgIC8vJ3RleHQtY29sb3InOiAncmdiKDAsMTc0LDIwMyknIC8vIENvTSBwb3AgYmx1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcblxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3NzY4NDE0NTYyODg3LFwibGF0XCI6LTM3LjgxOTk4OTQ4MzcyODM5fSxcInpvb21cIjoxNC42NzAyMjE2NzYyMzg1MDcsXCJiZWFyaW5nXCI6LTU3LjkzMjMwMjUxNzM2MTE3LFwicGl0Y2hcIjo2MH1cbiAgICB9LCAvLyBiaWtlIHNoYXJlXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi4nLFxuICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnV0VERElORycsICdZJ10sXG4gICAgICAgIGNvbHVtbjogJ1dFRERJTkcnLFxuICAgICAgICBkZWxheTogNDAwMCxcbiAgICAgICAgb3BhY2l0eTogMC44LFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MzYyNTU2NjkzMzYsXCJsYXRcIjotMzcuODEzOTYyNzEzMzQ0MzJ9LFwiem9vbVwiOjE0LjQwNTU5MTA5MTY3MTA1OCxcImJlYXJpbmdcIjotNjcuMTk5OTk5OTk5OTk5OTksXCJwaXRjaFwiOjU0LjAwMDAwMDAwMDAwMDAyfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnODRiZi1kaWhpJyksXG4gICAgICAgIGNhcHRpb246ICdQbGFjZXMgeW91IGNhbiBib29rIGZvciBhIHdlZGRpbmcuLi5vciBzb21ldGhpbmcgZWxzZS4nLFxuICAgICAgICBjb2x1bW46ICdXRURESU5HJyxcbiAgICAgICAgZGVsYXk6IDYwMDAsXG4gICAgICAgIG9wYWNpdHk6IDAuOCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzM2MjU1NjY5MzM2LFwibGF0XCI6LTM3LjgxMzk2MjcxMzM0NDMyfSxcInpvb21cIjoxNC40MDU1OTEwOTE2NzEwNTgsXCJiZWFyaW5nXCI6LTgwLFwicGl0Y2hcIjo1NC4wMDAwMDAwMDAwMDAwMn1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi4nLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgb3B0aW9uczp7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAndG9pbGV0LTE1JyxcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24tYWxsb3ctb3ZlcmxhcCc6IHRydWVcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3J1M3otNDR3ZScpLFxuICAgICAgICBjYXB0aW9uOiAnUHVibGljIHRvaWxldHMuLi50aGF0IGFyZSBhY2Nlc3NpYmxlIGZvciB3aGVlbGNoYWlyIHVzZXJzJyxcbiAgICAgICAgZmlsdGVyOiBbJz09Jywnd2hlZWxjaGFpcicsJ3llcyddLFxuICAgICAgICBkZWxheTogMSxcbiAgICAgICAgbGluZ2VyOjUwMDAsXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcwMjc2ODg5ODkwMjcsXCJsYXRcIjotMzcuODExMDcyNTQzOTc4MzV9LFwiem9vbVwiOjE0LjgsXCJiZWFyaW5nXCI6LTg5Ljc0MjUzNzgwNDA3NjM4LFwicGl0Y2hcIjo2MH0sXG4gICAgICAgIG9wdGlvbnM6e1xuICAgICAgICAgICAgc3ltYm9sOiB7XG4gICAgICAgICAgICAgICAgbGF5b3V0OiB7XG4gICAgICAgICAgICAgICAgICAgICdpY29uLWltYWdlJzogJ3doZWVsY2hhaXItMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgfSxcbiAgICB7IFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgncnUzei00NHdlJyksXG4gICAgICAgIGNhcHRpb246ICdQdWJsaWMgdG9pbGV0cy4uLnRoYXQgYXJlIGFjY2Vzc2libGUgZm9yIHdoZWVsY2hhaXIgdXNlcnMnLFxuICAgICAgICBkZWxheTogNTAwMCxcbiAgICAgICAgLy9saW5nZXI6NTAwMCxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzAyNzY4ODk4OTAyNyxcImxhdFwiOi0zNy44MTEwNzI1NDM5NzgzNX0sXCJ6b29tXCI6MTQuOCxcImJlYXJpbmdcIjotODkuNzQyNTM3ODA0MDc2MzgsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgZmlsdGVyOiBbJyE9Jywnd2hlZWxjaGFpcicsJ3llcyddLFxuICAgICAgICBvcHRpb25zOntcbiAgICAgICAgICAgIHN5bWJvbDoge1xuICAgICAgICAgICAgICAgIGxheW91dDoge1xuICAgICAgICAgICAgICAgICAgICAnaWNvbi1pbWFnZSc6ICd0b2lsZXQtMTUnLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1hbGxvdy1vdmVybGFwJzogdHJ1ZVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG5cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEwMDAwLFxuICAgICAgICBcbiAgICAgICAgY2FwdGlvbjogJ091ciBkYXRhIHRlbGxzIHlvdSB3aGVyZSB5b3VyIGRvZyBkb2VzblxcJ3QgbmVlZCBhIGxlYXNoJyxcbiAgICAgICAgbmFtZTogJ0RvZyBXYWxraW5nIFpvbmVzJyxcbiAgICAgICAgbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJzInLFxuICAgICAgICAgICAgdHlwZTogJ2ZpbGwnLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLmNsemFwMmplJyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnRG9nX1dhbGtpbmdfWm9uZXMtM2ZoOXE0JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtY29sb3InOiAnaHNsKDM0MCwgOTclLDY1JSknLCAvL2hzbCgzNDAsIDk3JSwgNDUlKVxuICAgICAgICAgICAgICAgICdmaWxsLW9wYWNpdHknOiAwLjhcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBmaWx0ZXI6IFsnPT0nLCAnc3RhdHVzJywgJ29mZmxlYXNoJ11cbiAgICAgICAgfSxcbiAgICAgICAgZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NTc0NjA5MjUyODA2NixcImxhdFwiOi0zNy43OTQ1MDY5NzQyNzQyMn0sXCJ6b29tXCI6MTQuOTU1NTQ0OTAzMTQ1NTQ0LFwiYmVhcmluZ1wiOi00NC44NDEzMjc0NTE4MzcyOCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NjQ3MjA4NDE2MTUyNSxcImxhdFwiOi0zNy43OTk0Nzc0NzI1NzU4NH0sXCJ6b29tXCI6MTQuOTMzOTMxNTI4MDM2MDQ4LFwiYmVhcmluZ1wiOi01Ny42NDEzMjc0NTE4MzcwOCxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk4NjEzOTg3NzMyOTMyLFwibGF0XCI6LTM3LjgzODg4MjY2NTk2MTg3fSxcInpvb21cIjoxNS4wOTY0MTk1Nzk0MzI4NzgsXCJiZWFyaW5nXCI6LTMwLFwicGl0Y2hcIjo1Ny40OTk5OTk5OTk5OTk5OX1cbiAgICB9LFxuXG5cbiAgICB7XG4gICAgICAgIGRlbGF5OiAxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1RoZXJlXFwncyBldmVuIGV2ZXJ5IGNhZmUgYW5kIHJlc3RhdXJhbnQnLFxuICAgICAgICBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLFxuICAgICAgICAvLyBDQkQgbG9va2luZyB0b3dhcmRzIENhcmx0b25cbiAgICAgICAgZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2NDIwMDk5ODk3MDQ1LFwibGF0XCI6LTM3LjgwNDA3NjI5MTYyMTZ9LFwiem9vbVwiOjE1LjY5NTY2MjEzNjMzOTY1MyxcImJlYXJpbmdcIjotMjIuNTY5NzE4NzY1MDA2MzEsXCJwaXRjaFwiOjYwfSxcbiAgICAgICAgLy9mbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MDI3Njg4OTg5MDI3LFwibGF0XCI6LTM3LjgxMTA3MjU0Mzk3ODM1fSxcInpvb21cIjoxNC44LFwiYmVhcmluZ1wiOi04OS43NDI1Mzc4MDQwNzYzOCxcInBpdGNoXCI6NjB9LFxuICAgICAgICAvL2ZseVRvOntcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NzA5ODc4OTk5Mjk2NCxcImxhdFwiOi0zNy44MTAyMTMxMDQwNDc0OX0sXCJ6b29tXCI6MTYuMDI3NzMyMzMyMDE2OTksXCJiZWFyaW5nXCI6LTEzNS4yMTk3NTMwODY0MTk4MSxcInBpdGNoXCI6NjB9LFxuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnY2FmZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlXG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSxcbiAgICBcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIGxpbmdlcjoyNjAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1doYXQgd2lsbCA8Yj48aT55b3U8L2k+PC9iPiBkbyB3aXRoIG91ciBkYXRhPycsXG4gICAgICAgIG5hbWU6ICdCdWlsZGluZyBvdXRsaW5lcycsXG4gICAgICAgIG9wYWNpdHk6MC4xLFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiB7XG4gICAgICAgICAgICAgICAgICAgIHByb3BlcnR5OiAnaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgc3RvcHM6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIFswLCAnaHNsKDE0NiwgNTAlLCAxMCUpJ10sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMjAwLCAnaHNsKDE0NiwgMTAwJSwgNjAlKSddXG4gICAgICAgICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgLy8naHNsKDE0NiwgMTAwJSwgMjAlKScsXG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWhlaWdodCc6IHtcbiAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5JzonaGVpZ2h0JyxcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogJ2lkZW50aXR5J1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LFxuICAgICAgICAvLyBmcm9tIGFiYm90c2ZvcmRpc2hcbiAgICAgICAgLy9mbHlUbzp7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTcyNTEzNTAzMjc2NCxcImxhdFwiOi0zNy44MDc0MTUyMDkwNTEyODV9LFwiem9vbVwiOjE0Ljg5NjI1OTE1MzAxMjI0MyxcImJlYXJpbmdcIjotMTA2LjQwMDAwMDAwMDAwMDE1LFwicGl0Y2hcIjo2MH1cbiAgICAgICAgLy9mcm9tIHNvdXRoXG4gICAgICAgIC8vZmx5VG86IHtcImNlbnRlclwiOntcImxuZ1wiOjE0NC45NDcwMTQwNzUzNDQ1LFwibGF0XCI6LTM3LjgxNTIwMDYyNzI2NjY2fSxcInpvb21cIjoxNS40NTg3ODQ5MzAyMzg2NzIsXCJiZWFyaW5nXCI6OTguMzk5OTk5OTk5OTk5ODgsXCJwaXRjaFwiOjYwfVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBwYWludDogWyBbJ2J1aWxkaW5ncycsICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JywgMC4zXV0sXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgZmx5VG86e2NlbnRlcjp7bG5nOjE0NC45NSxsYXQ6LTM3LjgxM30sYmVhcmluZzowLHpvb206MTQscGl0Y2g6NDUsZHVyYXRpb246MjAwMDB9XG4gICAgfSxcbiAgICB7XG4gICAgICAgIGRlbGF5OjIwMDAsXG4gICAgICAgIGtlZXBQYWludDogdHJ1ZSxcbiAgICAgICAgcGFpbnQ6IFsgWydidWlsZGluZ3MnLCAnZmlsbC1leHRydXNpb24tb3BhY2l0eScsIDAuNV0gXVxuICAgIH0sXG4gICAge1xuICAgICAgICBkZWxheToyMDAwLFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjZdIF1cbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6MjAwMDAsXG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPGI+PGk+eW91PC9pPjwvYj4gZG8gd2l0aCBvdXIgZGF0YT8nLFxuICAgICAgICBuYW1lOiAnQnVpbGRpbmcgb3V0bGluZXMnLFxuICAgICAgICAvL29wYWNpdHk6MC42LFxuICAgICAgICBrZWVwUGFpbnQ6IHRydWUsXG4gICAgICAgIHBhaW50OiBbIFsnYnVpbGRpbmdzJywgJ2ZpbGwtZXh0cnVzaW9uLW9wYWNpdHknLCAwLjddIF0sXG4gICAgICAgIC8qbWFwYm94OiB7XG4gICAgICAgICAgICBpZDogJ2J1aWxkaW5ncycsXG4gICAgICAgICAgICB0eXBlOiAnZmlsbC1leHRydXNpb24nLFxuICAgICAgICAgICAgc291cmNlOiAnbWFwYm94Oi8vY2l0eW9mbWVsYm91cm5lLjA1MndmaDl5JyxcbiAgICAgICAgICAgICdzb3VyY2UtbGF5ZXInOiAnQnVpbGRpbmdfb3V0bGluZXMtMG1tN2F6JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgJ2ZpbGwtZXh0cnVzaW9uLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogMC42LFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSwqL1xuICAgICAgICAvL21hdGNoaW5nIHN0YXJ0aW5nIHBvc2l0aW9uP1xuICAgICAgICBmbHlUbzp7Y2VudGVyOntsbmc6MTQ0Ljk1LGxhdDotMzcuODEzfSxiZWFyaW5nOjAsem9vbToxNCxwaXRjaDo0NSxkdXJhdGlvbjoyMDAwMH1cbiAgICAgICAgLy8gZnJvbSBhYmJvdHNmb3JkaXNoXG4gICAgICAgIC8vZmx5VG86e1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk3MjUxMzUwMzI3NjQsXCJsYXRcIjotMzcuODA3NDE1MjA5MDUxMjg1fSxcInpvb21cIjoxNC44OTYyNTkxNTMwMTIyNDMsXCJiZWFyaW5nXCI6LTEwNi40MDAwMDAwMDAwMDAxNSxcInBpdGNoXCI6NjB9XG4gICAgICAgIC8vZnJvbSBzb3V0aFxuICAgICAgICAvL2ZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTQ3MDE0MDc1MzQ0NSxcImxhdFwiOi0zNy44MTUyMDA2MjcyNjY2Nn0sXCJ6b29tXCI6MTUuNDU4Nzg0OTMwMjM4NjcyLFwiYmVhcmluZ1wiOjk4LjM5OTk5OTk5OTk5OTg4LFwicGl0Y2hcIjo2MH1cbiAgICB9XG5dO1xuLypcbmNvbnN0IGNyYXBweUZpbmFsZSA9IFtcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gWmUgZ3JhbmRlIGZpbmFsZVxuICAgIHtcbiAgICAgICAgZGVsYXk6MSxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3NmcmctenlnYicpLCAvLyBjYWZlc1xuICAgICAgICBvcHRpb25zOiB7XG4gICAgICAgICAgICBzeW1ib2w6IHtcbiAgICAgICAgICAgICAgICBsYXlvdXQ6IHtcbiAgICAgICAgICAgICAgICAgICAgJ2ljb24taW1hZ2UnOiAnY2FmZS0xNScsXG4gICAgICAgICAgICAgICAgICAgICdpY29uLWFsbG93LW92ZXJsYXAnOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICAnaWNvbi1zaXplJzogMC41XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LFxuICAgIHtcbiAgICAgICAgZGVsYXk6IDEsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdhbGx0cmVlcycsICAgICAgICAgICAgXG4gICAgICAgICAgICB0eXBlOiAnY2lyY2xlJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS45dHJwbmJ1NicsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1RyZWVzX193aXRoX3NwZWNpZXNfYW5kX2RpbWVuLTc3YjltbicsXG4gICAgICAgICAgICBwYWludDoge1xuICAgICAgICAgICAgICAgICdjaXJjbGUtcmFkaXVzJzogMixcbiAgICAgICAgICAgICAgICAnY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDUwJSwgMzYlKScsXG4gICAgICAgICAgICAgICAgLy8nY2lyY2xlLWNvbG9yJzogJ2hzbCgxNDYsIDEwMCUsIDM2JSknLFxuICAgICAgICAgICAgICAgICdjaXJjbGUtb3BhY2l0eSc6IDAuOVxuICAgICAgICAgICAgfSxcblxuICAgICAgICB9LFxuICAgICAgICBsaW5nZXI6MjAwMDBcbiAgICB9LCAgIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OjExLCBsaW5nZXI6MjAwMDAsXG4gICAgICAgIG1hcGJveDoge1xuICAgICAgICAgICAgaWQ6ICdib3VuZGFyaWVzJyxcbiAgICAgICAgICAgIHR5cGU6ICdsaW5lJyxcbiAgICAgICAgICAgIHNvdXJjZTogJ21hcGJveDovL2NpdHlvZm1lbGJvdXJuZS43OTlkcm91aCcsXG4gICAgICAgICAgICAnc291cmNlLWxheWVyJzogJ1Byb3BlcnR5X2JvdW5kYXJpZXMtMDYxazB4JyxcbiAgICAgICAgICAgIHBhaW50OiB7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgJ2xpbmUtY29sb3InOiAncmdiKDAsMTgzLDc5KScsXG4gICAgICAgICAgICAgICAgJ2xpbmUtd2lkdGgnOiB7XG4gICAgICAgICAgICAgICAgICAgIHN0b3BzOiBbXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTMsIDAuNV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBbMTYsIDJdXG4gICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0sXG4gICAgICAgIH0sXG4gICAgfSxcbiAgICB7IC8vIHBlZGVzdHJpYW4gc2Vuc29yc1xuICAgICAgICBkZWxheToxLGxpbmdlcjoyMDAwMCxcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ3lnYXctNnJ6cScpLFxuICAgICAgICBmbHlUbzoge1wiY2VudGVyXCI6e1wibG5nXCI6MTQ0Ljk2MzY3ODU0NzYxOTQ1LFwibGF0XCI6LTM3LjgwMjM2ODk2MTA2ODk4fSxcInpvb21cIjoxNS4zODkzOTM4NTA3MjU3MzIsXCJiZWFyaW5nXCI6LTE0My41ODQ0Njc1MTI0OTU0LFwicGl0Y2hcIjo2MH0gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIFxuICAgIH0sXG5cbiAgICB7XG4gICAgICAgIGNhcHRpb246ICdXaGF0IHdpbGwgPHU+eW91PC91PiZuYnNwOyBkbyB3aXRoIG91ciBkYXRhPycsXG4gICAgICAgIGRlbGF5OjIwMDAwLFxuICAgICAgICBsaW5nZXI6MzAwMDAsXG4gICAgICAgIG9wYWNpdHk6MC40LFxuICAgICAgICBtYXBib3g6IHtcbiAgICAgICAgICAgIGlkOiAnYnVpbGRpbmdzJyxcbiAgICAgICAgICAgIHR5cGU6ICdmaWxsLWV4dHJ1c2lvbicsXG4gICAgICAgICAgICBzb3VyY2U6ICdtYXBib3g6Ly9jaXR5b2ZtZWxib3VybmUuMDUyd2ZoOXknLFxuICAgICAgICAgICAgJ3NvdXJjZS1sYXllcic6ICdCdWlsZGluZ19vdXRsaW5lcy0wbW03YXonLFxuICAgICAgICAgICAgcGFpbnQ6IHtcbiAgICAgICAgICAgICAgICAnZmlsbC1leHRydXNpb24tY29sb3InOiAnaHNsKDE0NiwgMCUsIDIwJSknLFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1vcGFjaXR5JzogMC45LFxuICAgICAgICAgICAgICAgICdmaWxsLWV4dHJ1c2lvbi1oZWlnaHQnOiB7XG4gICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eSc6J2hlaWdodCcsXG4gICAgICAgICAgICAgICAgICAgIHR5cGU6ICdpZGVudGl0eSdcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgfSxcbiAgICB9LFxuXG5dO1xuKi9cblxuY29uc3QgdW51c2VkID0gW1xue1xuICAgICAgICBkZWxheToxMDAwMCxcbiAgICAgICAgY2FwdGlvbjogJ1BlZGVzdHJpYW4gc2Vuc29ycyBjb3VudCBmb290IHRyYWZmaWMgZXZlcnkgaG91cicsXG4gICAgICAgIG5hbWU6ICdQZWRlc3RyaWFuIHNlbnNvciBsb2NhdGlvbnMnLFxuICAgICAgICBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgneWdhdy02cnpxJyksXG4gICAgICAgIGZseVRvOiB7XCJjZW50ZXJcIjp7XCJsbmdcIjoxNDQuOTYzNjc4NTQ3NjE5NDUsXCJsYXRcIjotMzcuODAyMzY4OTYxMDY4OTh9LFwiem9vbVwiOjE1LjM4OTM5Mzg1MDcyNTczMixcImJlYXJpbmdcIjotMTQzLjU4NDQ2NzUxMjQ5NTQsXCJwaXRjaFwiOjYwfSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXG4gICAgfVxuXTtcblxuXG5cblxuXG5leHBvcnQgY29uc3QgZGF0YXNldHMyID0gW1xuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBMSUVEJyBdLCBcbiAgICAgICAgY2FwdGlvbjogJ01ham9yIGRldmVsb3BtZW50IHByb2plY3QgYXBwbGljYXRpb25zJyxcblxuICAgIH0sIFxuICAgIHsgXG4gICAgICAgIGRlbGF5OiAxMDAwMCwgXG4gICAgICAgIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCdnaDdzLXFkYTgnKSwgXG4gICAgICAgIGNvbHVtbjogJ3N0YXR1cycsIFxuICAgICAgICBmaWx0ZXI6IFsgJz09JywgJ3N0YXR1cycsICdBUFBST1ZFRCcgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyBhcHByb3ZlZCcgXG4gICAgfSwgXG4gICAgeyBcbiAgICAgICAgZGVsYXk6IDEwMDAwLCBcbiAgICAgICAgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2doN3MtcWRhOCcpLCBcbiAgICAgICAgY29sdW1uOiAnc3RhdHVzJywgXG4gICAgICAgIGZpbHRlcjogWyAnPT0nLCAnc3RhdHVzJywgJ1VOREVSIENPTlNUUlVDVElPTicgXSwgXG4gICAgICAgIGNhcHRpb246ICdNYWpvciBkZXZlbG9wbWVudCBwcm9qZWN0cyB1bmRlciBjb25zdHJ1Y3Rpb24nIFxuICAgIH0sIFxuICAgIHsgZGVsYXk6IDUwMDAsIGRhdGFzZXQ6IG5ldyBTb3VyY2VEYXRhKCd0ZHZoLW45ZHYnKSB9LCAvLyBiaWtlIHNoYXJlXG4gICAgeyBkZWxheTogOTAwMCwgZGF0YXNldDogbmV3IFNvdXJjZURhdGEoJ2MzZ3QtaHJ6NicpLCBjb2x1bW46ICdBY2NvbW1vZGF0aW9uJyB9LFxuICAgIHsgZGVsYXk6IDEwMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYjM2ai1raXk0JyksIGNvbHVtbjogJ0FydHMgYW5kIFJlY3JlYXRpb24gU2VydmljZXMnIH0sXG4gICAgLy97IGRlbGF5OiAzMDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ1JldGFpbCBUcmFkZScgfSxcbiAgICB7IGRlbGF5OiA5MDAwLCBkYXRhc2V0OiBuZXcgU291cmNlRGF0YSgnYzNndC1ocno2JyksIGNvbHVtbjogJ0NvbnN0cnVjdGlvbicgfVxuICAgIC8veyBkZWxheTogMTAwMCwgZGF0YXNldDogJ2IzNmota2l5NCcgfSxcbiAgICAvL3sgZGVsYXk6IDIwMDAsIGRhdGFzZXQ6ICcyMzRxLWdnODMnIH1cbl07XG4iLCIvLyBodHRwczovL2QzanMub3JnL2QzLWNvbGxlY3Rpb24vIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIHByZWZpeCA9IFwiJFwiO1xuXG5mdW5jdGlvbiBNYXAoKSB7fVxuXG5NYXAucHJvdG90eXBlID0gbWFwLnByb3RvdHlwZSA9IHtcbiAgY29uc3RydWN0b3I6IE1hcCxcbiAgaGFzOiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gKHByZWZpeCArIGtleSkgaW4gdGhpcztcbiAgfSxcbiAgZ2V0OiBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gdGhpc1twcmVmaXggKyBrZXldO1xuICB9LFxuICBzZXQ6IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB0aGlzW3ByZWZpeCArIGtleV0gPSB2YWx1ZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfSxcbiAgcmVtb3ZlOiBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgcHJvcGVydHkgPSBwcmVmaXggKyBrZXk7XG4gICAgcmV0dXJuIHByb3BlcnR5IGluIHRoaXMgJiYgZGVsZXRlIHRoaXNbcHJvcGVydHldO1xuICB9LFxuICBjbGVhcjogZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIGRlbGV0ZSB0aGlzW3Byb3BlcnR5XTtcbiAgfSxcbiAga2V5czogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkga2V5cy5wdXNoKHByb3BlcnR5LnNsaWNlKDEpKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfSxcbiAgdmFsdWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpIHZhbHVlcy5wdXNoKHRoaXNbcHJvcGVydHldKTtcbiAgICByZXR1cm4gdmFsdWVzO1xuICB9LFxuICBlbnRyaWVzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgZW50cmllcyA9IFtdO1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSBlbnRyaWVzLnB1c2goe2tleTogcHJvcGVydHkuc2xpY2UoMSksIHZhbHVlOiB0aGlzW3Byb3BlcnR5XX0pO1xuICAgIHJldHVybiBlbnRyaWVzO1xuICB9LFxuICBzaXplOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcHJvcGVydHkgaW4gdGhpcykgaWYgKHByb3BlcnR5WzBdID09PSBwcmVmaXgpICsrc2l6ZTtcbiAgICByZXR1cm4gc2l6ZTtcbiAgfSxcbiAgZW1wdHk6IGZ1bmN0aW9uKCkge1xuICAgIGZvciAodmFyIHByb3BlcnR5IGluIHRoaXMpIGlmIChwcm9wZXJ0eVswXSA9PT0gcHJlZml4KSByZXR1cm4gZmFsc2U7XG4gICAgcmV0dXJuIHRydWU7XG4gIH0sXG4gIGVhY2g6IGZ1bmN0aW9uKGYpIHtcbiAgICBmb3IgKHZhciBwcm9wZXJ0eSBpbiB0aGlzKSBpZiAocHJvcGVydHlbMF0gPT09IHByZWZpeCkgZih0aGlzW3Byb3BlcnR5XSwgcHJvcGVydHkuc2xpY2UoMSksIHRoaXMpO1xuICB9XG59O1xuXG5mdW5jdGlvbiBtYXAob2JqZWN0LCBmKSB7XG4gIHZhciBtYXAgPSBuZXcgTWFwO1xuXG4gIC8vIENvcHkgY29uc3RydWN0b3IuXG4gIGlmIChvYmplY3QgaW5zdGFuY2VvZiBNYXApIG9iamVjdC5lYWNoKGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHsgbWFwLnNldChrZXksIHZhbHVlKTsgfSk7XG5cbiAgLy8gSW5kZXggYXJyYXkgYnkgbnVtZXJpYyBpbmRleCBvciBzcGVjaWZpZWQga2V5IGZ1bmN0aW9uLlxuICBlbHNlIGlmIChBcnJheS5pc0FycmF5KG9iamVjdCkpIHtcbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gb2JqZWN0Lmxlbmd0aCxcbiAgICAgICAgbztcblxuICAgIGlmIChmID09IG51bGwpIHdoaWxlICgrK2kgPCBuKSBtYXAuc2V0KGksIG9iamVjdFtpXSk7XG4gICAgZWxzZSB3aGlsZSAoKytpIDwgbikgbWFwLnNldChmKG8gPSBvYmplY3RbaV0sIGksIG9iamVjdCksIG8pO1xuICB9XG5cbiAgLy8gQ29udmVydCBvYmplY3QgdG8gbWFwLlxuICBlbHNlIGlmIChvYmplY3QpIGZvciAodmFyIGtleSBpbiBvYmplY3QpIG1hcC5zZXQoa2V5LCBvYmplY3Rba2V5XSk7XG5cbiAgcmV0dXJuIG1hcDtcbn1cblxudmFyIG5lc3QgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGtleXMgPSBbXSxcbiAgICAgIHNvcnRLZXlzID0gW10sXG4gICAgICBzb3J0VmFsdWVzLFxuICAgICAgcm9sbHVwLFxuICAgICAgbmVzdDtcblxuICBmdW5jdGlvbiBhcHBseShhcnJheSwgZGVwdGgsIGNyZWF0ZVJlc3VsdCwgc2V0UmVzdWx0KSB7XG4gICAgaWYgKGRlcHRoID49IGtleXMubGVuZ3RoKSByZXR1cm4gcm9sbHVwICE9IG51bGxcbiAgICAgICAgPyByb2xsdXAoYXJyYXkpIDogKHNvcnRWYWx1ZXMgIT0gbnVsbFxuICAgICAgICA/IGFycmF5LnNvcnQoc29ydFZhbHVlcylcbiAgICAgICAgOiBhcnJheSk7XG5cbiAgICB2YXIgaSA9IC0xLFxuICAgICAgICBuID0gYXJyYXkubGVuZ3RoLFxuICAgICAgICBrZXkgPSBrZXlzW2RlcHRoKytdLFxuICAgICAgICBrZXlWYWx1ZSxcbiAgICAgICAgdmFsdWUsXG4gICAgICAgIHZhbHVlc0J5S2V5ID0gbWFwKCksXG4gICAgICAgIHZhbHVlcyxcbiAgICAgICAgcmVzdWx0ID0gY3JlYXRlUmVzdWx0KCk7XG5cbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHZhbHVlcyA9IHZhbHVlc0J5S2V5LmdldChrZXlWYWx1ZSA9IGtleSh2YWx1ZSA9IGFycmF5W2ldKSArIFwiXCIpKSB7XG4gICAgICAgIHZhbHVlcy5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlc0J5S2V5LnNldChrZXlWYWx1ZSwgW3ZhbHVlXSk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgdmFsdWVzQnlLZXkuZWFjaChmdW5jdGlvbih2YWx1ZXMsIGtleSkge1xuICAgICAgc2V0UmVzdWx0KHJlc3VsdCwga2V5LCBhcHBseSh2YWx1ZXMsIGRlcHRoLCBjcmVhdGVSZXN1bHQsIHNldFJlc3VsdCkpO1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVudHJpZXMobWFwJCQxLCBkZXB0aCkge1xuICAgIGlmICgrK2RlcHRoID4ga2V5cy5sZW5ndGgpIHJldHVybiBtYXAkJDE7XG4gICAgdmFyIGFycmF5LCBzb3J0S2V5ID0gc29ydEtleXNbZGVwdGggLSAxXTtcbiAgICBpZiAocm9sbHVwICE9IG51bGwgJiYgZGVwdGggPj0ga2V5cy5sZW5ndGgpIGFycmF5ID0gbWFwJCQxLmVudHJpZXMoKTtcbiAgICBlbHNlIGFycmF5ID0gW10sIG1hcCQkMS5lYWNoKGZ1bmN0aW9uKHYsIGspIHsgYXJyYXkucHVzaCh7a2V5OiBrLCB2YWx1ZXM6IGVudHJpZXModiwgZGVwdGgpfSk7IH0pO1xuICAgIHJldHVybiBzb3J0S2V5ICE9IG51bGwgPyBhcnJheS5zb3J0KGZ1bmN0aW9uKGEsIGIpIHsgcmV0dXJuIHNvcnRLZXkoYS5rZXksIGIua2V5KTsgfSkgOiBhcnJheTtcbiAgfVxuXG4gIHJldHVybiBuZXN0ID0ge1xuICAgIG9iamVjdDogZnVuY3Rpb24oYXJyYXkpIHsgcmV0dXJuIGFwcGx5KGFycmF5LCAwLCBjcmVhdGVPYmplY3QsIHNldE9iamVjdCk7IH0sXG4gICAgbWFwOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gYXBwbHkoYXJyYXksIDAsIGNyZWF0ZU1hcCwgc2V0TWFwKTsgfSxcbiAgICBlbnRyaWVzOiBmdW5jdGlvbihhcnJheSkgeyByZXR1cm4gZW50cmllcyhhcHBseShhcnJheSwgMCwgY3JlYXRlTWFwLCBzZXRNYXApLCAwKTsgfSxcbiAgICBrZXk6IGZ1bmN0aW9uKGQpIHsga2V5cy5wdXNoKGQpOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0S2V5czogZnVuY3Rpb24ob3JkZXIpIHsgc29ydEtleXNba2V5cy5sZW5ndGggLSAxXSA9IG9yZGVyOyByZXR1cm4gbmVzdDsgfSxcbiAgICBzb3J0VmFsdWVzOiBmdW5jdGlvbihvcmRlcikgeyBzb3J0VmFsdWVzID0gb3JkZXI7IHJldHVybiBuZXN0OyB9LFxuICAgIHJvbGx1cDogZnVuY3Rpb24oZikgeyByb2xsdXAgPSBmOyByZXR1cm4gbmVzdDsgfVxuICB9O1xufTtcblxuZnVuY3Rpb24gY3JlYXRlT2JqZWN0KCkge1xuICByZXR1cm4ge307XG59XG5cbmZ1bmN0aW9uIHNldE9iamVjdChvYmplY3QsIGtleSwgdmFsdWUpIHtcbiAgb2JqZWN0W2tleV0gPSB2YWx1ZTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTWFwKCkge1xuICByZXR1cm4gbWFwKCk7XG59XG5cbmZ1bmN0aW9uIHNldE1hcChtYXAkJDEsIGtleSwgdmFsdWUpIHtcbiAgbWFwJCQxLnNldChrZXksIHZhbHVlKTtcbn1cblxuZnVuY3Rpb24gU2V0KCkge31cblxudmFyIHByb3RvID0gbWFwLnByb3RvdHlwZTtcblxuU2V0LnByb3RvdHlwZSA9IHNldC5wcm90b3R5cGUgPSB7XG4gIGNvbnN0cnVjdG9yOiBTZXQsXG4gIGhhczogcHJvdG8uaGFzLFxuICBhZGQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgdmFsdWUgKz0gXCJcIjtcbiAgICB0aGlzW3ByZWZpeCArIHZhbHVlXSA9IHZhbHVlO1xuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICByZW1vdmU6IHByb3RvLnJlbW92ZSxcbiAgY2xlYXI6IHByb3RvLmNsZWFyLFxuICB2YWx1ZXM6IHByb3RvLmtleXMsXG4gIHNpemU6IHByb3RvLnNpemUsXG4gIGVtcHR5OiBwcm90by5lbXB0eSxcbiAgZWFjaDogcHJvdG8uZWFjaFxufTtcblxuZnVuY3Rpb24gc2V0KG9iamVjdCwgZikge1xuICB2YXIgc2V0ID0gbmV3IFNldDtcblxuICAvLyBDb3B5IGNvbnN0cnVjdG9yLlxuICBpZiAob2JqZWN0IGluc3RhbmNlb2YgU2V0KSBvYmplY3QuZWFjaChmdW5jdGlvbih2YWx1ZSkgeyBzZXQuYWRkKHZhbHVlKTsgfSk7XG5cbiAgLy8gT3RoZXJ3aXNlLCBhc3N1bWUgaXTigJlzIGFuIGFycmF5LlxuICBlbHNlIGlmIChvYmplY3QpIHtcbiAgICB2YXIgaSA9IC0xLCBuID0gb2JqZWN0Lmxlbmd0aDtcbiAgICBpZiAoZiA9PSBudWxsKSB3aGlsZSAoKytpIDwgbikgc2V0LmFkZChvYmplY3RbaV0pO1xuICAgIGVsc2Ugd2hpbGUgKCsraSA8IG4pIHNldC5hZGQoZihvYmplY3RbaV0sIGksIG9iamVjdCkpO1xuICB9XG5cbiAgcmV0dXJuIHNldDtcbn1cblxudmFyIGtleXMgPSBmdW5jdGlvbihtYXApIHtcbiAgdmFyIGtleXMgPSBbXTtcbiAgZm9yICh2YXIga2V5IGluIG1hcCkga2V5cy5wdXNoKGtleSk7XG4gIHJldHVybiBrZXlzO1xufTtcblxudmFyIHZhbHVlcyA9IGZ1bmN0aW9uKG1hcCkge1xuICB2YXIgdmFsdWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIHZhbHVlcy5wdXNoKG1hcFtrZXldKTtcbiAgcmV0dXJuIHZhbHVlcztcbn07XG5cbnZhciBlbnRyaWVzID0gZnVuY3Rpb24obWFwKSB7XG4gIHZhciBlbnRyaWVzID0gW107XG4gIGZvciAodmFyIGtleSBpbiBtYXApIGVudHJpZXMucHVzaCh7a2V5OiBrZXksIHZhbHVlOiBtYXBba2V5XX0pO1xuICByZXR1cm4gZW50cmllcztcbn07XG5cbmV4cG9ydHMubmVzdCA9IG5lc3Q7XG5leHBvcnRzLnNldCA9IHNldDtcbmV4cG9ydHMubWFwID0gbWFwO1xuZXhwb3J0cy5rZXlzID0ga2V5cztcbmV4cG9ydHMudmFsdWVzID0gdmFsdWVzO1xuZXhwb3J0cy5lbnRyaWVzID0gZW50cmllcztcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtZGlzcGF0Y2gvIFZlcnNpb24gMS4wLjIuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxudmFyIG5vb3AgPSB7dmFsdWU6IGZ1bmN0aW9uKCkge319O1xuXG5mdW5jdGlvbiBkaXNwYXRjaCgpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSBhcmd1bWVudHMubGVuZ3RoLCBfID0ge30sIHQ7IGkgPCBuOyArK2kpIHtcbiAgICBpZiAoISh0ID0gYXJndW1lbnRzW2ldICsgXCJcIikgfHwgKHQgaW4gXykpIHRocm93IG5ldyBFcnJvcihcImlsbGVnYWwgdHlwZTogXCIgKyB0KTtcbiAgICBfW3RdID0gW107XG4gIH1cbiAgcmV0dXJuIG5ldyBEaXNwYXRjaChfKTtcbn1cblxuZnVuY3Rpb24gRGlzcGF0Y2goXykge1xuICB0aGlzLl8gPSBfO1xufVxuXG5mdW5jdGlvbiBwYXJzZVR5cGVuYW1lcyh0eXBlbmFtZXMsIHR5cGVzKSB7XG4gIHJldHVybiB0eXBlbmFtZXMudHJpbSgpLnNwbGl0KC9efFxccysvKS5tYXAoZnVuY3Rpb24odCkge1xuICAgIHZhciBuYW1lID0gXCJcIiwgaSA9IHQuaW5kZXhPZihcIi5cIik7XG4gICAgaWYgKGkgPj0gMCkgbmFtZSA9IHQuc2xpY2UoaSArIDEpLCB0ID0gdC5zbGljZSgwLCBpKTtcbiAgICBpZiAodCAmJiAhdHlwZXMuaGFzT3duUHJvcGVydHkodCkpIHRocm93IG5ldyBFcnJvcihcInVua25vd24gdHlwZTogXCIgKyB0KTtcbiAgICByZXR1cm4ge3R5cGU6IHQsIG5hbWU6IG5hbWV9O1xuICB9KTtcbn1cblxuRGlzcGF0Y2gucHJvdG90eXBlID0gZGlzcGF0Y2gucHJvdG90eXBlID0ge1xuICBjb25zdHJ1Y3RvcjogRGlzcGF0Y2gsXG4gIG9uOiBmdW5jdGlvbih0eXBlbmFtZSwgY2FsbGJhY2spIHtcbiAgICB2YXIgXyA9IHRoaXMuXyxcbiAgICAgICAgVCA9IHBhcnNlVHlwZW5hbWVzKHR5cGVuYW1lICsgXCJcIiwgXyksXG4gICAgICAgIHQsXG4gICAgICAgIGkgPSAtMSxcbiAgICAgICAgbiA9IFQubGVuZ3RoO1xuXG4gICAgLy8gSWYgbm8gY2FsbGJhY2sgd2FzIHNwZWNpZmllZCwgcmV0dXJuIHRoZSBjYWxsYmFjayBvZiB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDIpIHtcbiAgICAgIHdoaWxlICgrK2kgPCBuKSBpZiAoKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSAmJiAodCA9IGdldChfW3RdLCB0eXBlbmFtZS5uYW1lKSkpIHJldHVybiB0O1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIElmIGEgdHlwZSB3YXMgc3BlY2lmaWVkLCBzZXQgdGhlIGNhbGxiYWNrIGZvciB0aGUgZ2l2ZW4gdHlwZSBhbmQgbmFtZS5cbiAgICAvLyBPdGhlcndpc2UsIGlmIGEgbnVsbCBjYWxsYmFjayB3YXMgc3BlY2lmaWVkLCByZW1vdmUgY2FsbGJhY2tzIG9mIHRoZSBnaXZlbiBuYW1lLlxuICAgIGlmIChjYWxsYmFjayAhPSBudWxsICYmIHR5cGVvZiBjYWxsYmFjayAhPT0gXCJmdW5jdGlvblwiKSB0aHJvdyBuZXcgRXJyb3IoXCJpbnZhbGlkIGNhbGxiYWNrOiBcIiArIGNhbGxiYWNrKTtcbiAgICB3aGlsZSAoKytpIDwgbikge1xuICAgICAgaWYgKHQgPSAodHlwZW5hbWUgPSBUW2ldKS50eXBlKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIGNhbGxiYWNrKTtcbiAgICAgIGVsc2UgaWYgKGNhbGxiYWNrID09IG51bGwpIGZvciAodCBpbiBfKSBfW3RdID0gc2V0KF9bdF0sIHR5cGVuYW1lLm5hbWUsIG51bGwpO1xuICAgIH1cblxuICAgIHJldHVybiB0aGlzO1xuICB9LFxuICBjb3B5OiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY29weSA9IHt9LCBfID0gdGhpcy5fO1xuICAgIGZvciAodmFyIHQgaW4gXykgY29weVt0XSA9IF9bdF0uc2xpY2UoKTtcbiAgICByZXR1cm4gbmV3IERpc3BhdGNoKGNvcHkpO1xuICB9LFxuICBjYWxsOiBmdW5jdGlvbih0eXBlLCB0aGF0KSB7XG4gICAgaWYgKChuID0gYXJndW1lbnRzLmxlbmd0aCAtIDIpID4gMCkgZm9yICh2YXIgYXJncyA9IG5ldyBBcnJheShuKSwgaSA9IDAsIG4sIHQ7IGkgPCBuOyArK2kpIGFyZ3NbaV0gPSBhcmd1bWVudHNbaSArIDJdO1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh0ID0gdGhpcy5fW3R5cGVdLCBpID0gMCwgbiA9IHQubGVuZ3RoOyBpIDwgbjsgKytpKSB0W2ldLnZhbHVlLmFwcGx5KHRoYXQsIGFyZ3MpO1xuICB9LFxuICBhcHBseTogZnVuY3Rpb24odHlwZSwgdGhhdCwgYXJncykge1xuICAgIGlmICghdGhpcy5fLmhhc093blByb3BlcnR5KHR5cGUpKSB0aHJvdyBuZXcgRXJyb3IoXCJ1bmtub3duIHR5cGU6IFwiICsgdHlwZSk7XG4gICAgZm9yICh2YXIgdCA9IHRoaXMuX1t0eXBlXSwgaSA9IDAsIG4gPSB0Lmxlbmd0aDsgaSA8IG47ICsraSkgdFtpXS52YWx1ZS5hcHBseSh0aGF0LCBhcmdzKTtcbiAgfVxufTtcblxuZnVuY3Rpb24gZ2V0KHR5cGUsIG5hbWUpIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aCwgYzsgaSA8IG47ICsraSkge1xuICAgIGlmICgoYyA9IHR5cGVbaV0pLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHJldHVybiBjLnZhbHVlO1xuICAgIH1cbiAgfVxufVxuXG5mdW5jdGlvbiBzZXQodHlwZSwgbmFtZSwgY2FsbGJhY2spIHtcbiAgZm9yICh2YXIgaSA9IDAsIG4gPSB0eXBlLmxlbmd0aDsgaSA8IG47ICsraSkge1xuICAgIGlmICh0eXBlW2ldLm5hbWUgPT09IG5hbWUpIHtcbiAgICAgIHR5cGVbaV0gPSBub29wLCB0eXBlID0gdHlwZS5zbGljZSgwLCBpKS5jb25jYXQodHlwZS5zbGljZShpICsgMSkpO1xuICAgICAgYnJlYWs7XG4gICAgfVxuICB9XG4gIGlmIChjYWxsYmFjayAhPSBudWxsKSB0eXBlLnB1c2goe25hbWU6IG5hbWUsIHZhbHVlOiBjYWxsYmFja30pO1xuICByZXR1cm4gdHlwZTtcbn1cblxuZXhwb3J0cy5kaXNwYXRjaCA9IGRpc3BhdGNoO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpO1xuIiwiLy8gaHR0cHM6Ly9kM2pzLm9yZy9kMy1kc3YvIFZlcnNpb24gMS4wLjMuIENvcHlyaWdodCAyMDE2IE1pa2UgQm9zdG9jay5cbihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IGZhY3RvcnkoZXhwb3J0cykgOlxuICB0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgPyBkZWZpbmUoWydleHBvcnRzJ10sIGZhY3RvcnkpIDpcbiAgKGZhY3RvcnkoKGdsb2JhbC5kMyA9IGdsb2JhbC5kMyB8fCB7fSkpKTtcbn0odGhpcywgKGZ1bmN0aW9uIChleHBvcnRzKSB7ICd1c2Ugc3RyaWN0JztcblxuZnVuY3Rpb24gb2JqZWN0Q29udmVydGVyKGNvbHVtbnMpIHtcbiAgcmV0dXJuIG5ldyBGdW5jdGlvbihcImRcIiwgXCJyZXR1cm4ge1wiICsgY29sdW1ucy5tYXAoZnVuY3Rpb24obmFtZSwgaSkge1xuICAgIHJldHVybiBKU09OLnN0cmluZ2lmeShuYW1lKSArIFwiOiBkW1wiICsgaSArIFwiXVwiO1xuICB9KS5qb2luKFwiLFwiKSArIFwifVwiKTtcbn1cblxuZnVuY3Rpb24gY3VzdG9tQ29udmVydGVyKGNvbHVtbnMsIGYpIHtcbiAgdmFyIG9iamVjdCA9IG9iamVjdENvbnZlcnRlcihjb2x1bW5zKTtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJvdywgaSkge1xuICAgIHJldHVybiBmKG9iamVjdChyb3cpLCBpLCBjb2x1bW5zKTtcbiAgfTtcbn1cblxuLy8gQ29tcHV0ZSB1bmlxdWUgY29sdW1ucyBpbiBvcmRlciBvZiBkaXNjb3ZlcnkuXG5mdW5jdGlvbiBpbmZlckNvbHVtbnMocm93cykge1xuICB2YXIgY29sdW1uU2V0ID0gT2JqZWN0LmNyZWF0ZShudWxsKSxcbiAgICAgIGNvbHVtbnMgPSBbXTtcblxuICByb3dzLmZvckVhY2goZnVuY3Rpb24ocm93KSB7XG4gICAgZm9yICh2YXIgY29sdW1uIGluIHJvdykge1xuICAgICAgaWYgKCEoY29sdW1uIGluIGNvbHVtblNldCkpIHtcbiAgICAgICAgY29sdW1ucy5wdXNoKGNvbHVtblNldFtjb2x1bW5dID0gY29sdW1uKTtcbiAgICAgIH1cbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBjb2x1bW5zO1xufVxuXG5mdW5jdGlvbiBkc3YoZGVsaW1pdGVyKSB7XG4gIHZhciByZUZvcm1hdCA9IG5ldyBSZWdFeHAoXCJbXFxcIlwiICsgZGVsaW1pdGVyICsgXCJcXG5dXCIpLFxuICAgICAgZGVsaW1pdGVyQ29kZSA9IGRlbGltaXRlci5jaGFyQ29kZUF0KDApO1xuXG4gIGZ1bmN0aW9uIHBhcnNlKHRleHQsIGYpIHtcbiAgICB2YXIgY29udmVydCwgY29sdW1ucywgcm93cyA9IHBhcnNlUm93cyh0ZXh0LCBmdW5jdGlvbihyb3csIGkpIHtcbiAgICAgIGlmIChjb252ZXJ0KSByZXR1cm4gY29udmVydChyb3csIGkgLSAxKTtcbiAgICAgIGNvbHVtbnMgPSByb3csIGNvbnZlcnQgPSBmID8gY3VzdG9tQ29udmVydGVyKHJvdywgZikgOiBvYmplY3RDb252ZXJ0ZXIocm93KTtcbiAgICB9KTtcbiAgICByb3dzLmNvbHVtbnMgPSBjb2x1bW5zO1xuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gcGFyc2VSb3dzKHRleHQsIGYpIHtcbiAgICB2YXIgRU9MID0ge30sIC8vIHNlbnRpbmVsIHZhbHVlIGZvciBlbmQtb2YtbGluZVxuICAgICAgICBFT0YgPSB7fSwgLy8gc2VudGluZWwgdmFsdWUgZm9yIGVuZC1vZi1maWxlXG4gICAgICAgIHJvd3MgPSBbXSwgLy8gb3V0cHV0IHJvd3NcbiAgICAgICAgTiA9IHRleHQubGVuZ3RoLFxuICAgICAgICBJID0gMCwgLy8gY3VycmVudCBjaGFyYWN0ZXIgaW5kZXhcbiAgICAgICAgbiA9IDAsIC8vIHRoZSBjdXJyZW50IGxpbmUgbnVtYmVyXG4gICAgICAgIHQsIC8vIHRoZSBjdXJyZW50IHRva2VuXG4gICAgICAgIGVvbDsgLy8gaXMgdGhlIGN1cnJlbnQgdG9rZW4gZm9sbG93ZWQgYnkgRU9MP1xuXG4gICAgZnVuY3Rpb24gdG9rZW4oKSB7XG4gICAgICBpZiAoSSA+PSBOKSByZXR1cm4gRU9GOyAvLyBzcGVjaWFsIGNhc2U6IGVuZCBvZiBmaWxlXG4gICAgICBpZiAoZW9sKSByZXR1cm4gZW9sID0gZmFsc2UsIEVPTDsgLy8gc3BlY2lhbCBjYXNlOiBlbmQgb2YgbGluZVxuXG4gICAgICAvLyBzcGVjaWFsIGNhc2U6IHF1b3Rlc1xuICAgICAgdmFyIGogPSBJLCBjO1xuICAgICAgaWYgKHRleHQuY2hhckNvZGVBdChqKSA9PT0gMzQpIHtcbiAgICAgICAgdmFyIGkgPSBqO1xuICAgICAgICB3aGlsZSAoaSsrIDwgTikge1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSkgPT09IDM0KSB7XG4gICAgICAgICAgICBpZiAodGV4dC5jaGFyQ29kZUF0KGkgKyAxKSAhPT0gMzQpIGJyZWFrO1xuICAgICAgICAgICAgKytpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBJID0gaSArIDI7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoaSArIDEpO1xuICAgICAgICBpZiAoYyA9PT0gMTMpIHtcbiAgICAgICAgICBlb2wgPSB0cnVlO1xuICAgICAgICAgIGlmICh0ZXh0LmNoYXJDb2RlQXQoaSArIDIpID09PSAxMCkgKytJO1xuICAgICAgICB9IGVsc2UgaWYgKGMgPT09IDEwKSB7XG4gICAgICAgICAgZW9sID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGV4dC5zbGljZShqICsgMSwgaSkucmVwbGFjZSgvXCJcIi9nLCBcIlxcXCJcIik7XG4gICAgICB9XG5cbiAgICAgIC8vIGNvbW1vbiBjYXNlOiBmaW5kIG5leHQgZGVsaW1pdGVyIG9yIG5ld2xpbmVcbiAgICAgIHdoaWxlIChJIDwgTikge1xuICAgICAgICB2YXIgayA9IDE7XG4gICAgICAgIGMgPSB0ZXh0LmNoYXJDb2RlQXQoSSsrKTtcbiAgICAgICAgaWYgKGMgPT09IDEwKSBlb2wgPSB0cnVlOyAvLyBcXG5cbiAgICAgICAgZWxzZSBpZiAoYyA9PT0gMTMpIHsgZW9sID0gdHJ1ZTsgaWYgKHRleHQuY2hhckNvZGVBdChJKSA9PT0gMTApICsrSSwgKytrOyB9IC8vIFxccnxcXHJcXG5cbiAgICAgICAgZWxzZSBpZiAoYyAhPT0gZGVsaW1pdGVyQ29kZSkgY29udGludWU7XG4gICAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGosIEkgLSBrKTtcbiAgICAgIH1cblxuICAgICAgLy8gc3BlY2lhbCBjYXNlOiBsYXN0IHRva2VuIGJlZm9yZSBFT0ZcbiAgICAgIHJldHVybiB0ZXh0LnNsaWNlKGopO1xuICAgIH1cblxuICAgIHdoaWxlICgodCA9IHRva2VuKCkpICE9PSBFT0YpIHtcbiAgICAgIHZhciBhID0gW107XG4gICAgICB3aGlsZSAodCAhPT0gRU9MICYmIHQgIT09IEVPRikge1xuICAgICAgICBhLnB1c2godCk7XG4gICAgICAgIHQgPSB0b2tlbigpO1xuICAgICAgfVxuICAgICAgaWYgKGYgJiYgKGEgPSBmKGEsIG4rKykpID09IG51bGwpIGNvbnRpbnVlO1xuICAgICAgcm93cy5wdXNoKGEpO1xuICAgIH1cblxuICAgIHJldHVybiByb3dzO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0KHJvd3MsIGNvbHVtbnMpIHtcbiAgICBpZiAoY29sdW1ucyA9PSBudWxsKSBjb2x1bW5zID0gaW5mZXJDb2x1bW5zKHJvd3MpO1xuICAgIHJldHVybiBbY29sdW1ucy5tYXAoZm9ybWF0VmFsdWUpLmpvaW4oZGVsaW1pdGVyKV0uY29uY2F0KHJvd3MubWFwKGZ1bmN0aW9uKHJvdykge1xuICAgICAgcmV0dXJuIGNvbHVtbnMubWFwKGZ1bmN0aW9uKGNvbHVtbikge1xuICAgICAgICByZXR1cm4gZm9ybWF0VmFsdWUocm93W2NvbHVtbl0pO1xuICAgICAgfSkuam9pbihkZWxpbWl0ZXIpO1xuICAgIH0pKS5qb2luKFwiXFxuXCIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0Um93cyhyb3dzKSB7XG4gICAgcmV0dXJuIHJvd3MubWFwKGZvcm1hdFJvdykuam9pbihcIlxcblwiKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGZvcm1hdFJvdyhyb3cpIHtcbiAgICByZXR1cm4gcm93Lm1hcChmb3JtYXRWYWx1ZSkuam9pbihkZWxpbWl0ZXIpO1xuICB9XG5cbiAgZnVuY3Rpb24gZm9ybWF0VmFsdWUodGV4dCkge1xuICAgIHJldHVybiB0ZXh0ID09IG51bGwgPyBcIlwiXG4gICAgICAgIDogcmVGb3JtYXQudGVzdCh0ZXh0ICs9IFwiXCIpID8gXCJcXFwiXCIgKyB0ZXh0LnJlcGxhY2UoL1xcXCIvZywgXCJcXFwiXFxcIlwiKSArIFwiXFxcIlwiXG4gICAgICAgIDogdGV4dDtcbiAgfVxuXG4gIHJldHVybiB7XG4gICAgcGFyc2U6IHBhcnNlLFxuICAgIHBhcnNlUm93czogcGFyc2VSb3dzLFxuICAgIGZvcm1hdDogZm9ybWF0LFxuICAgIGZvcm1hdFJvd3M6IGZvcm1hdFJvd3NcbiAgfTtcbn1cblxudmFyIGNzdiA9IGRzdihcIixcIik7XG5cbnZhciBjc3ZQYXJzZSA9IGNzdi5wYXJzZTtcbnZhciBjc3ZQYXJzZVJvd3MgPSBjc3YucGFyc2VSb3dzO1xudmFyIGNzdkZvcm1hdCA9IGNzdi5mb3JtYXQ7XG52YXIgY3N2Rm9ybWF0Um93cyA9IGNzdi5mb3JtYXRSb3dzO1xuXG52YXIgdHN2ID0gZHN2KFwiXFx0XCIpO1xuXG52YXIgdHN2UGFyc2UgPSB0c3YucGFyc2U7XG52YXIgdHN2UGFyc2VSb3dzID0gdHN2LnBhcnNlUm93cztcbnZhciB0c3ZGb3JtYXQgPSB0c3YuZm9ybWF0O1xudmFyIHRzdkZvcm1hdFJvd3MgPSB0c3YuZm9ybWF0Um93cztcblxuZXhwb3J0cy5kc3ZGb3JtYXQgPSBkc3Y7XG5leHBvcnRzLmNzdlBhcnNlID0gY3N2UGFyc2U7XG5leHBvcnRzLmNzdlBhcnNlUm93cyA9IGNzdlBhcnNlUm93cztcbmV4cG9ydHMuY3N2Rm9ybWF0ID0gY3N2Rm9ybWF0O1xuZXhwb3J0cy5jc3ZGb3JtYXRSb3dzID0gY3N2Rm9ybWF0Um93cztcbmV4cG9ydHMudHN2UGFyc2UgPSB0c3ZQYXJzZTtcbmV4cG9ydHMudHN2UGFyc2VSb3dzID0gdHN2UGFyc2VSb3dzO1xuZXhwb3J0cy50c3ZGb3JtYXQgPSB0c3ZGb3JtYXQ7XG5leHBvcnRzLnRzdkZvcm1hdFJvd3MgPSB0c3ZGb3JtYXRSb3dzO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG59KSkpOyIsIi8vIGh0dHBzOi8vZDNqcy5vcmcvZDMtcmVxdWVzdC8gVmVyc2lvbiAxLjAuMy4gQ29weXJpZ2h0IDIwMTYgTWlrZSBCb3N0b2NrLlxuKGZ1bmN0aW9uIChnbG9iYWwsIGZhY3RvcnkpIHtcbiAgdHlwZW9mIGV4cG9ydHMgPT09ICdvYmplY3QnICYmIHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnID8gZmFjdG9yeShleHBvcnRzLCByZXF1aXJlKCdkMy1jb2xsZWN0aW9uJyksIHJlcXVpcmUoJ2QzLWRpc3BhdGNoJyksIHJlcXVpcmUoJ2QzLWRzdicpKSA6XG4gIHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCA/IGRlZmluZShbJ2V4cG9ydHMnLCAnZDMtY29sbGVjdGlvbicsICdkMy1kaXNwYXRjaCcsICdkMy1kc3YnXSwgZmFjdG9yeSkgOlxuICAoZmFjdG9yeSgoZ2xvYmFsLmQzID0gZ2xvYmFsLmQzIHx8IHt9KSxnbG9iYWwuZDMsZ2xvYmFsLmQzLGdsb2JhbC5kMykpO1xufSh0aGlzLCAoZnVuY3Rpb24gKGV4cG9ydHMsZDNDb2xsZWN0aW9uLGQzRGlzcGF0Y2gsZDNEc3YpIHsgJ3VzZSBzdHJpY3QnO1xuXG52YXIgcmVxdWVzdCA9IGZ1bmN0aW9uKHVybCwgY2FsbGJhY2spIHtcbiAgdmFyIHJlcXVlc3QsXG4gICAgICBldmVudCA9IGQzRGlzcGF0Y2guZGlzcGF0Y2goXCJiZWZvcmVzZW5kXCIsIFwicHJvZ3Jlc3NcIiwgXCJsb2FkXCIsIFwiZXJyb3JcIiksXG4gICAgICBtaW1lVHlwZSxcbiAgICAgIGhlYWRlcnMgPSBkM0NvbGxlY3Rpb24ubWFwKCksXG4gICAgICB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QsXG4gICAgICB1c2VyID0gbnVsbCxcbiAgICAgIHBhc3N3b3JkID0gbnVsbCxcbiAgICAgIHJlc3BvbnNlLFxuICAgICAgcmVzcG9uc2VUeXBlLFxuICAgICAgdGltZW91dCA9IDA7XG5cbiAgLy8gSWYgSUUgZG9lcyBub3Qgc3VwcG9ydCBDT1JTLCB1c2UgWERvbWFpblJlcXVlc3QuXG4gIGlmICh0eXBlb2YgWERvbWFpblJlcXVlc3QgIT09IFwidW5kZWZpbmVkXCJcbiAgICAgICYmICEoXCJ3aXRoQ3JlZGVudGlhbHNcIiBpbiB4aHIpXG4gICAgICAmJiAvXihodHRwKHMpPzopP1xcL1xcLy8udGVzdCh1cmwpKSB4aHIgPSBuZXcgWERvbWFpblJlcXVlc3Q7XG5cbiAgXCJvbmxvYWRcIiBpbiB4aHJcbiAgICAgID8geGhyLm9ubG9hZCA9IHhoci5vbmVycm9yID0geGhyLm9udGltZW91dCA9IHJlc3BvbmRcbiAgICAgIDogeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uKG8pIHsgeGhyLnJlYWR5U3RhdGUgPiAzICYmIHJlc3BvbmQobyk7IH07XG5cbiAgZnVuY3Rpb24gcmVzcG9uZChvKSB7XG4gICAgdmFyIHN0YXR1cyA9IHhoci5zdGF0dXMsIHJlc3VsdDtcbiAgICBpZiAoIXN0YXR1cyAmJiBoYXNSZXNwb25zZSh4aHIpXG4gICAgICAgIHx8IHN0YXR1cyA+PSAyMDAgJiYgc3RhdHVzIDwgMzAwXG4gICAgICAgIHx8IHN0YXR1cyA9PT0gMzA0KSB7XG4gICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICByZXN1bHQgPSByZXNwb25zZS5jYWxsKHJlcXVlc3QsIHhocik7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHQgPSB4aHI7XG4gICAgICB9XG4gICAgICBldmVudC5jYWxsKFwibG9hZFwiLCByZXF1ZXN0LCByZXN1bHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBldmVudC5jYWxsKFwiZXJyb3JcIiwgcmVxdWVzdCwgbyk7XG4gICAgfVxuICB9XG5cbiAgeGhyLm9ucHJvZ3Jlc3MgPSBmdW5jdGlvbihlKSB7XG4gICAgZXZlbnQuY2FsbChcInByb2dyZXNzXCIsIHJlcXVlc3QsIGUpO1xuICB9O1xuXG4gIHJlcXVlc3QgPSB7XG4gICAgaGVhZGVyOiBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgICAgbmFtZSA9IChuYW1lICsgXCJcIikudG9Mb3dlckNhc2UoKTtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMikgcmV0dXJuIGhlYWRlcnMuZ2V0KG5hbWUpO1xuICAgICAgaWYgKHZhbHVlID09IG51bGwpIGhlYWRlcnMucmVtb3ZlKG5hbWUpO1xuICAgICAgZWxzZSBoZWFkZXJzLnNldChuYW1lLCB2YWx1ZSArIFwiXCIpO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIC8vIElmIG1pbWVUeXBlIGlzIG5vbi1udWxsIGFuZCBubyBBY2NlcHQgaGVhZGVyIGlzIHNldCwgYSBkZWZhdWx0IGlzIHVzZWQuXG4gICAgbWltZVR5cGU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICBpZiAoIWFyZ3VtZW50cy5sZW5ndGgpIHJldHVybiBtaW1lVHlwZTtcbiAgICAgIG1pbWVUeXBlID0gdmFsdWUgPT0gbnVsbCA/IG51bGwgOiB2YWx1ZSArIFwiXCI7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gU3BlY2lmaWVzIHdoYXQgdHlwZSB0aGUgcmVzcG9uc2UgdmFsdWUgc2hvdWxkIHRha2U7XG4gICAgLy8gZm9yIGluc3RhbmNlLCBhcnJheWJ1ZmZlciwgYmxvYiwgZG9jdW1lbnQsIG9yIHRleHQuXG4gICAgcmVzcG9uc2VUeXBlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgaWYgKCFhcmd1bWVudHMubGVuZ3RoKSByZXR1cm4gcmVzcG9uc2VUeXBlO1xuICAgICAgcmVzcG9uc2VUeXBlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgdGltZW91dDogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIGlmICghYXJndW1lbnRzLmxlbmd0aCkgcmV0dXJuIHRpbWVvdXQ7XG4gICAgICB0aW1lb3V0ID0gK3ZhbHVlO1xuICAgICAgcmV0dXJuIHJlcXVlc3Q7XG4gICAgfSxcblxuICAgIHVzZXI6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICByZXR1cm4gYXJndW1lbnRzLmxlbmd0aCA8IDEgPyB1c2VyIDogKHVzZXIgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIHBhc3N3b3JkOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPCAxID8gcGFzc3dvcmQgOiAocGFzc3dvcmQgPSB2YWx1ZSA9PSBudWxsID8gbnVsbCA6IHZhbHVlICsgXCJcIiwgcmVxdWVzdCk7XG4gICAgfSxcblxuICAgIC8vIFNwZWNpZnkgaG93IHRvIGNvbnZlcnQgdGhlIHJlc3BvbnNlIGNvbnRlbnQgdG8gYSBzcGVjaWZpYyB0eXBlO1xuICAgIC8vIGNoYW5nZXMgdGhlIGNhbGxiYWNrIHZhbHVlIG9uIFwibG9hZFwiIGV2ZW50cy5cbiAgICByZXNwb25zZTogZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHJlc3BvbnNlID0gdmFsdWU7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJHRVRcIiwg4oCmKS5cbiAgICBnZXQ6IGZ1bmN0aW9uKGRhdGEsIGNhbGxiYWNrKSB7XG4gICAgICByZXR1cm4gcmVxdWVzdC5zZW5kKFwiR0VUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gQWxpYXMgZm9yIHNlbmQoXCJQT1NUXCIsIOKApikuXG4gICAgcG9zdDogZnVuY3Rpb24oZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHJldHVybiByZXF1ZXN0LnNlbmQoXCJQT1NUXCIsIGRhdGEsIGNhbGxiYWNrKTtcbiAgICB9LFxuXG4gICAgLy8gSWYgY2FsbGJhY2sgaXMgbm9uLW51bGwsIGl0IHdpbGwgYmUgdXNlZCBmb3IgZXJyb3IgYW5kIGxvYWQgZXZlbnRzLlxuICAgIHNlbmQ6IGZ1bmN0aW9uKG1ldGhvZCwgZGF0YSwgY2FsbGJhY2spIHtcbiAgICAgIHhoci5vcGVuKG1ldGhvZCwgdXJsLCB0cnVlLCB1c2VyLCBwYXNzd29yZCk7XG4gICAgICBpZiAobWltZVR5cGUgIT0gbnVsbCAmJiAhaGVhZGVycy5oYXMoXCJhY2NlcHRcIikpIGhlYWRlcnMuc2V0KFwiYWNjZXB0XCIsIG1pbWVUeXBlICsgXCIsKi8qXCIpO1xuICAgICAgaWYgKHhoci5zZXRSZXF1ZXN0SGVhZGVyKSBoZWFkZXJzLmVhY2goZnVuY3Rpb24odmFsdWUsIG5hbWUpIHsgeGhyLnNldFJlcXVlc3RIZWFkZXIobmFtZSwgdmFsdWUpOyB9KTtcbiAgICAgIGlmIChtaW1lVHlwZSAhPSBudWxsICYmIHhoci5vdmVycmlkZU1pbWVUeXBlKSB4aHIub3ZlcnJpZGVNaW1lVHlwZShtaW1lVHlwZSk7XG4gICAgICBpZiAocmVzcG9uc2VUeXBlICE9IG51bGwpIHhoci5yZXNwb25zZVR5cGUgPSByZXNwb25zZVR5cGU7XG4gICAgICBpZiAodGltZW91dCA+IDApIHhoci50aW1lb3V0ID0gdGltZW91dDtcbiAgICAgIGlmIChjYWxsYmFjayA9PSBudWxsICYmIHR5cGVvZiBkYXRhID09PSBcImZ1bmN0aW9uXCIpIGNhbGxiYWNrID0gZGF0YSwgZGF0YSA9IG51bGw7XG4gICAgICBpZiAoY2FsbGJhY2sgIT0gbnVsbCAmJiBjYWxsYmFjay5sZW5ndGggPT09IDEpIGNhbGxiYWNrID0gZml4Q2FsbGJhY2soY2FsbGJhY2spO1xuICAgICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHJlcXVlc3Qub24oXCJlcnJvclwiLCBjYWxsYmFjaykub24oXCJsb2FkXCIsIGZ1bmN0aW9uKHhocikgeyBjYWxsYmFjayhudWxsLCB4aHIpOyB9KTtcbiAgICAgIGV2ZW50LmNhbGwoXCJiZWZvcmVzZW5kXCIsIHJlcXVlc3QsIHhocik7XG4gICAgICB4aHIuc2VuZChkYXRhID09IG51bGwgPyBudWxsIDogZGF0YSk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgYWJvcnQ6IGZ1bmN0aW9uKCkge1xuICAgICAgeGhyLmFib3J0KCk7XG4gICAgICByZXR1cm4gcmVxdWVzdDtcbiAgICB9LFxuXG4gICAgb246IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHZhbHVlID0gZXZlbnQub24uYXBwbHkoZXZlbnQsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gdmFsdWUgPT09IGV2ZW50ID8gcmVxdWVzdCA6IHZhbHVlO1xuICAgIH1cbiAgfTtcblxuICBpZiAoY2FsbGJhY2sgIT0gbnVsbCkge1xuICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgcmV0dXJuIHJlcXVlc3QuZ2V0KGNhbGxiYWNrKTtcbiAgfVxuXG4gIHJldHVybiByZXF1ZXN0O1xufTtcblxuZnVuY3Rpb24gZml4Q2FsbGJhY2soY2FsbGJhY2spIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKGVycm9yLCB4aHIpIHtcbiAgICBjYWxsYmFjayhlcnJvciA9PSBudWxsID8geGhyIDogbnVsbCk7XG4gIH07XG59XG5cbmZ1bmN0aW9uIGhhc1Jlc3BvbnNlKHhocikge1xuICB2YXIgdHlwZSA9IHhoci5yZXNwb25zZVR5cGU7XG4gIHJldHVybiB0eXBlICYmIHR5cGUgIT09IFwidGV4dFwiXG4gICAgICA/IHhoci5yZXNwb25zZSAvLyBudWxsIG9uIGVycm9yXG4gICAgICA6IHhoci5yZXNwb25zZVRleHQ7IC8vIFwiXCIgb24gZXJyb3Jcbn1cblxudmFyIHR5cGUgPSBmdW5jdGlvbihkZWZhdWx0TWltZVR5cGUsIHJlc3BvbnNlKSB7XG4gIHJldHVybiBmdW5jdGlvbih1cmwsIGNhbGxiYWNrKSB7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKS5yZXNwb25zZShyZXNwb25zZSk7XG4gICAgaWYgKGNhbGxiYWNrICE9IG51bGwpIHtcbiAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT09IFwiZnVuY3Rpb25cIikgdGhyb3cgbmV3IEVycm9yKFwiaW52YWxpZCBjYWxsYmFjazogXCIgKyBjYWxsYmFjayk7XG4gICAgICByZXR1cm4gci5nZXQoY2FsbGJhY2spO1xuICAgIH1cbiAgICByZXR1cm4gcjtcbiAgfTtcbn07XG5cbnZhciBodG1sID0gdHlwZShcInRleHQvaHRtbFwiLCBmdW5jdGlvbih4aHIpIHtcbiAgcmV0dXJuIGRvY3VtZW50LmNyZWF0ZVJhbmdlKCkuY3JlYXRlQ29udGV4dHVhbEZyYWdtZW50KHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciBqc29uID0gdHlwZShcImFwcGxpY2F0aW9uL2pzb25cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiBKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpO1xufSk7XG5cbnZhciB0ZXh0ID0gdHlwZShcInRleHQvcGxhaW5cIiwgZnVuY3Rpb24oeGhyKSB7XG4gIHJldHVybiB4aHIucmVzcG9uc2VUZXh0O1xufSk7XG5cbnZhciB4bWwgPSB0eXBlKFwiYXBwbGljYXRpb24veG1sXCIsIGZ1bmN0aW9uKHhocikge1xuICB2YXIgeG1sID0geGhyLnJlc3BvbnNlWE1MO1xuICBpZiAoIXhtbCkgdGhyb3cgbmV3IEVycm9yKFwicGFyc2UgZXJyb3JcIik7XG4gIHJldHVybiB4bWw7XG59KTtcblxudmFyIGRzdiA9IGZ1bmN0aW9uKGRlZmF1bHRNaW1lVHlwZSwgcGFyc2UpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHVybCwgcm93LCBjYWxsYmFjaykge1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykgY2FsbGJhY2sgPSByb3csIHJvdyA9IG51bGw7XG4gICAgdmFyIHIgPSByZXF1ZXN0KHVybCkubWltZVR5cGUoZGVmYXVsdE1pbWVUeXBlKTtcbiAgICByLnJvdyA9IGZ1bmN0aW9uKF8pIHsgcmV0dXJuIGFyZ3VtZW50cy5sZW5ndGggPyByLnJlc3BvbnNlKHJlc3BvbnNlT2YocGFyc2UsIHJvdyA9IF8pKSA6IHJvdzsgfTtcbiAgICByLnJvdyhyb3cpO1xuICAgIHJldHVybiBjYWxsYmFjayA/IHIuZ2V0KGNhbGxiYWNrKSA6IHI7XG4gIH07XG59O1xuXG5mdW5jdGlvbiByZXNwb25zZU9mKHBhcnNlLCByb3cpIHtcbiAgcmV0dXJuIGZ1bmN0aW9uKHJlcXVlc3QkJDEpIHtcbiAgICByZXR1cm4gcGFyc2UocmVxdWVzdCQkMS5yZXNwb25zZVRleHQsIHJvdyk7XG4gIH07XG59XG5cbnZhciBjc3YgPSBkc3YoXCJ0ZXh0L2NzdlwiLCBkM0Rzdi5jc3ZQYXJzZSk7XG5cbnZhciB0c3YgPSBkc3YoXCJ0ZXh0L3RhYi1zZXBhcmF0ZWQtdmFsdWVzXCIsIGQzRHN2LnRzdlBhcnNlKTtcblxuZXhwb3J0cy5yZXF1ZXN0ID0gcmVxdWVzdDtcbmV4cG9ydHMuaHRtbCA9IGh0bWw7XG5leHBvcnRzLmpzb24gPSBqc29uO1xuZXhwb3J0cy50ZXh0ID0gdGV4dDtcbmV4cG9ydHMueG1sID0geG1sO1xuZXhwb3J0cy5jc3YgPSBjc3Y7XG5leHBvcnRzLnRzdiA9IHRzdjtcblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcblxufSkpKTtcbiIsIiFmdW5jdGlvbihlLG4pe1wib2JqZWN0XCI9PXR5cGVvZiBleHBvcnRzJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlP21vZHVsZS5leHBvcnRzPW4ocmVxdWlyZShcImQzLXJlcXVlc3RcIikpOlwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoW1wiZDMtcmVxdWVzdFwiXSxuKTooZS5kMz1lLmQzfHx7fSxlLmQzLnByb21pc2U9bihlLmQzKSl9KHRoaXMsZnVuY3Rpb24oZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gbihlLG4pe3JldHVybiBmdW5jdGlvbigpe2Zvcih2YXIgdD1hcmd1bWVudHMubGVuZ3RoLHI9QXJyYXkodCksbz0wO3Q+bztvKyspcltvXT1hcmd1bWVudHNbb107cmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uKHQsbyl7dmFyIHU9ZnVuY3Rpb24oZSxuKXtyZXR1cm4gZT92b2lkIG8oRXJyb3IoZSkpOnZvaWQgdChuKX07bi5hcHBseShlLHIuY29uY2F0KHUpKX0pfX12YXIgdD17fTtyZXR1cm5bXCJjc3ZcIixcInRzdlwiLFwianNvblwiLFwieG1sXCIsXCJ0ZXh0XCIsXCJodG1sXCJdLmZvckVhY2goZnVuY3Rpb24ocil7dFtyXT1uKGUsZVtyXSl9KSx0fSk7IiwiLyoganNoaW50IGVzbmV4dDp0cnVlICovXG52YXIgZDMgPSByZXF1aXJlKCdkMy5wcm9taXNlJyk7XG5cbmZ1bmN0aW9uIGRlZihhLCBiKSB7XG4gICAgcmV0dXJuIGEgIT09IHVuZGVmaW5lZCA/IGEgOiBiO1xufVxuLypcbk1hbmFnZXMgZmV0Y2hpbmcgYSBkYXRhc2V0IGZyb20gU29jcmF0YSBhbmQgcHJlcGFyaW5nIGl0IGZvciB2aXN1YWxpc2F0aW9uIGJ5XG5jb3VudGluZyBmaWVsZCB2YWx1ZSBmcmVxdWVuY2llcyBldGMuIFxuKi9cbmV4cG9ydCBjbGFzcyBTb3VyY2VEYXRhIHtcbiAgICBjb25zdHJ1Y3RvcihkYXRhSWQsIGFjdGl2ZUNlbnN1c1llYXIpIHtcbiAgICAgICAgdGhpcy5kYXRhSWQgPSBkYXRhSWQ7XG4gICAgICAgIHRoaXMuYWN0aXZlQ2Vuc3VzWWVhciA9IGRlZihhY3RpdmVDZW5zdXNZZWFyLCAyMDE1KTtcblxuICAgICAgICB0aGlzLmxvY2F0aW9uQ29sdW1uID0gdW5kZWZpbmVkOyAgLy8gbmFtZSBvZiBjb2x1bW4gd2hpY2ggaG9sZHMgbGF0L2xvbiBvciBibG9jayBJRFxuICAgICAgICB0aGlzLmxvY2F0aW9uSXNQb2ludCA9IHVuZGVmaW5lZDsgLy8gaWYgdGhlIGRhdGFzZXQgdHlwZSBpcyAncG9pbnQnICh1c2VkIGZvciBwYXJzaW5nIGxvY2F0aW9uIGZpZWxkKVxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zID0gW107ICAgICAgICAgLy8gbmFtZXMgb2YgY29sdW1ucyBzdWl0YWJsZSBmb3IgbnVtZXJpYyBkYXRhdmlzXG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBbXTsgICAgICAgICAgICAvLyBuYW1lcyBvZiBjb2x1bW5zIHN1aXRhYmxlIGZvciBlbnVtIGRhdGF2aXNcbiAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zID0gW107ICAgICAgICAgIC8vIG5hbWVzIG9mIG90aGVyIGNvbHVtbnNcbiAgICAgICAgdGhpcy5taW5zID0ge307ICAgICAgICAgICAgICAgICAgIC8vIG1pbiBhbmQgbWF4IG9mIGVhY2ggbnVtZXJpYyBjb2x1bW5cbiAgICAgICAgdGhpcy5tYXhzID0ge307XG4gICAgICAgIHRoaXMuZnJlcXVlbmNpZXMgPSB7fTsgICAgICAgICAgICAvLyBcbiAgICAgICAgdGhpcy5zb3J0ZWRGcmVxdWVuY2llcyA9IHt9OyAgICAgIC8vIG1vc3QgZnJlcXVlbnQgdmFsdWVzIGluIGVhY2ggdGV4dCBjb2x1bW5cbiAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2ludCc7ICAgICAgICAgICAgIC8vIHBvaW50IG9yIHBvbHlnb24gKENMVUUgYmxvY2spXG4gICAgICAgIHRoaXMucm93cyA9IHVuZGVmaW5lZDsgICAgICAgICAgICAvLyBwcm9jZXNzZWQgcm93c1xuICAgICAgICB0aGlzLmJsb2NrSW5kZXggPSB7fTsgICAgICAgICAgICAgLy8gY2FjaGUgb2YgQ0xVRSBibG9jayBJRHNcbiAgICB9XG5cblxuICAgIGNob29zZUNvbHVtblR5cGVzIChjb2x1bW5zKSB7XG4gICAgICAgIC8vdmFyIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JyB8fCBjb2wubmFtZSA9PT0gJ0Jsb2NrIElEJylbMF07XG4gICAgICAgIC8vIFwibG9jYXRpb25cIiBhbmQgXCJwb2ludFwiIGFyZSBib3RoIHBvaW50IGRhdGEgdHlwZXMsIGV4cHJlc3NlZCBkaWZmZXJlbnRseS5cbiAgICAgICAgLy8gT3RoZXJ3aXNlLCBhIFwiYmxvY2sgSURcIiBjYW4gYmUgam9pbmVkIGFnYWluc3QgdGhlIENMVUUgQmxvY2sgcG9seWdvbnMgd2hpY2ggYXJlIGluIE1hcGJveC5cbiAgICAgICAgbGV0IGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdsb2NhdGlvbicgfHwgY29sLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylbMF07XG4gICAgICAgIGlmICghbGMpIHtcbiAgICAgICAgICAgIGxjID0gY29sdW1ucy5maWx0ZXIoY29sID0+IGNvbC5uYW1lID09PSAnQmxvY2sgSUQnKVswXTtcbiAgICAgICAgfVxuXG5cbiAgICAgICAgaWYgKGxjLmRhdGFUeXBlTmFtZSA9PT0gJ3BvaW50JylcbiAgICAgICAgICAgIHRoaXMubG9jYXRpb25Jc1BvaW50ID0gdHJ1ZTtcblxuICAgICAgICBpZiAobGMubmFtZSA9PT0gJ0Jsb2NrIElEJykge1xuICAgICAgICAgICAgdGhpcy5zaGFwZSA9ICdwb2x5Z29uJztcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMubG9jYXRpb25Db2x1bW4gPSBsYy5uYW1lO1xuXG4gICAgICAgIGNvbHVtbnMgPSBjb2x1bW5zLmZpbHRlcihjb2wgPT4gY29sICE9PSBsYyk7XG5cbiAgICAgICAgdGhpcy5udW1lcmljQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICdudW1iZXInICYmIGNvbC5uYW1lICE9PSAnTGF0aXR1ZGUnICYmIGNvbC5uYW1lICE9PSAnTG9uZ2l0dWRlJylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcbiAgICAgICAgXG4gICAgICAgIHRoaXMubnVtZXJpY0NvbHVtbnNcbiAgICAgICAgICAgIC5mb3JFYWNoKGNvbCA9PiB7IHRoaXMubWluc1tjb2xdID0gMWU5OyB0aGlzLm1heHNbY29sXSA9IC0xZTk7IH0pO1xuICAgICAgICBcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5maWx0ZXIoY29sID0+IGNvbC5kYXRhVHlwZU5hbWUgPT09ICd0ZXh0JylcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKTtcblxuICAgICAgICB0aGlzLnRleHRDb2x1bW5zXG4gICAgICAgICAgICAuZm9yRWFjaChjb2wgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdID0ge30pO1xuXG4gICAgICAgIHRoaXMuYm9yaW5nQ29sdW1ucyA9IGNvbHVtbnNcbiAgICAgICAgICAgIC5tYXAoY29sID0+IGNvbC5uYW1lKVxuICAgICAgICAgICAgLmZpbHRlcihjb2wgPT4gdGhpcy5udW1lcmljQ29sdW1ucy5pbmRleE9mKGNvbCkgPCAwICYmIHRoaXMudGV4dENvbHVtbnMuaW5kZXhPZihjb2wpIDwgMCk7XG4gICAgfVxuXG4gICAgLy8gVE9ETyBiZXR0ZXIgbmFtZSBhbmQgYmVoYXZpb3VyXG4gICAgZmlsdGVyKHJvdykge1xuICAgICAgICAvLyBUT0RPIG1vdmUgdGhpcyBzb21ld2hlcmUgYmV0dGVyXG4gICAgICAgIGlmIChyb3dbJ0NMVUUgc21hbGwgYXJlYSddICYmIHJvd1snQ0xVRSBzbWFsbCBhcmVhJ10gPT09ICdDaXR5IG9mIE1lbGJvdXJuZSB0b3RhbCcpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIGlmIChyb3dbJ0NlbnN1cyB5ZWFyJ10gJiYgcm93WydDZW5zdXMgeWVhciddICE9PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIpXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuXG5cbiAgICAvLyBjb252ZXJ0IG51bWVyaWMgY29sdW1ucyB0byBudW1iZXJzIGZvciBkYXRhIHZpc1xuICAgIGNvbnZlcnRSb3cocm93KSB7XG5cbiAgICAgICAgLy8gY29udmVydCBsb2NhdGlvbiB0eXBlcyAoc3RyaW5nKSB0byBbbG9uLCBsYXRdIGFycmF5LlxuICAgICAgICBmdW5jdGlvbiBsb2NhdGlvblRvQ29vcmRzKGxvY2F0aW9uKSB7XG4gICAgICAgICAgICBpZiAoU3RyaW5nKGxvY2F0aW9uKS5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgICAgIC8vIFwibmV3IGJhY2tlbmRcIiBkYXRhc2V0cyB1c2UgYSBXS1QgZmllbGQgW1BPSU5UIChsb24gbGF0KV0gaW5zdGVhZCBvZiAobGF0LCBsb24pXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubG9jYXRpb25Jc1BvaW50KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBsb2NhdGlvbi5yZXBsYWNlKCdQT0lOVCAoJywgJycpLnJlcGxhY2UoJyknLCAnJykuc3BsaXQoJyAnKS5tYXAobiA9PiBOdW1iZXIobikpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy5zaGFwZSA9PT0gJ3BvaW50Jykge1xuICAgICAgICAgICAgICAgICAgICAvL2NvbnNvbGUubG9nKGxvY2F0aW9uLmxlbmd0aCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBbTnVtYmVyKGxvY2F0aW9uLnNwbGl0KCcsICcpWzFdLnJlcGxhY2UoJyknLCAnJykpLCBOdW1iZXIobG9jYXRpb24uc3BsaXQoJywgJylbMF0ucmVwbGFjZSgnKCcsICcnKSldO1xuICAgICAgICAgICAgICAgIH0gZWxzZSBcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGxvY2F0aW9uO1xuXG4gICAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYFVucmVhZGFibGUgbG9jYXRpb24gJHtsb2NhdGlvbn0gaW4gJHt0aGlzLm5hbWV9LmApO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG5cbiAgICAgICAgICAgIH1cblxuICAgICAgICB9XG5cbiAgICAgICAgLy8gVE9ETyB1c2UgY29sdW1uLmNhY2hlZENvbnRlbnRzLnNtYWxsZXN0IGFuZCAubGFyZ2VzdFxuICAgICAgICB0aGlzLm51bWVyaWNDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHJvd1tjb2xdID0gTnVtYmVyKHJvd1tjb2xdKSA7IC8vICtyb3dbY29sXSBhcHBhcmVudGx5IGZhc3RlciwgYnV0IGJyZWFrcyBvbiBzaW1wbGUgdGhpbmdzIGxpa2UgYmxhbmsgdmFsdWVzXG4gICAgICAgICAgICAvLyB3ZSBkb24ndCB3YW50IHRvIGluY2x1ZGUgdGhlIHRvdGFsIHZhbHVlcyBpbiBcbiAgICAgICAgICAgIGlmIChyb3dbY29sXSA8IHRoaXMubWluc1tjb2xdICYmIHRoaXMuZmlsdGVyKHJvdykpXG4gICAgICAgICAgICAgICAgdGhpcy5taW5zW2NvbF0gPSByb3dbY29sXTtcblxuICAgICAgICAgICAgaWYgKHJvd1tjb2xdID4gdGhpcy5tYXhzW2NvbF0gJiYgdGhpcy5maWx0ZXIocm93KSlcbiAgICAgICAgICAgICAgICB0aGlzLm1heHNbY29sXSA9IHJvd1tjb2xdO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy50ZXh0Q29sdW1ucy5mb3JFYWNoKGNvbCA9PiB7XG4gICAgICAgICAgICB2YXIgdmFsID0gcm93W2NvbF07XG4gICAgICAgICAgICB0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSA9ICh0aGlzLmZyZXF1ZW5jaWVzW2NvbF1bdmFsXSB8fCAwKSArIDE7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJvd1t0aGlzLmxvY2F0aW9uQ29sdW1uXSA9IGxvY2F0aW9uVG9Db29yZHMuY2FsbCh0aGlzLCByb3dbdGhpcy5sb2NhdGlvbkNvbHVtbl0pO1xuXG4gICAgICAgIGlmICghcm93W3RoaXMubG9jYXRpb25Db2x1bW5dKVxuICAgICAgICAgICAgcmV0dXJuIG51bGw7IC8vIHNraXAgdGhpcyByb3cuXG5cbiAgICAgICAgcmV0dXJuIHJvdztcbiAgICB9XG5cbiAgICBjb21wdXRlU29ydGVkRnJlcXVlbmNpZXMoKSB7XG4gICAgICAgIHZhciBuZXdUZXh0Q29sdW1ucyA9IFtdO1xuICAgICAgICB0aGlzLnRleHRDb2x1bW5zLmZvckVhY2goY29sID0+IHtcbiAgICAgICAgICAgIHRoaXMuc29ydGVkRnJlcXVlbmNpZXNbY29sXSA9IE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSlcbiAgICAgICAgICAgICAgICAuc29ydCgodmFsYSwgdmFsYikgPT4gdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGFdIDwgdGhpcy5mcmVxdWVuY2llc1tjb2xdW3ZhbGJdID8gMSA6IC0xKVxuICAgICAgICAgICAgICAgIC5zbGljZSgwLDEyKTtcblxuICAgICAgICAgICAgaWYgKE9iamVjdC5rZXlzKHRoaXMuZnJlcXVlbmNpZXNbY29sXSkubGVuZ3RoIDwgMiB8fCBPYmplY3Qua2V5cyh0aGlzLmZyZXF1ZW5jaWVzW2NvbF0pLmxlbmd0aCA+IDIwICYmIHRoaXMuZnJlcXVlbmNpZXNbY29sXVt0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzW2NvbF1bMV1dIDw9IDUpIHtcbiAgICAgICAgICAgICAgICAvLyBJdCdzIGJvcmluZyBpZiBhbGwgdmFsdWVzIHRoZSBzYW1lLCBvciBpZiB0b28gbWFueSBkaWZmZXJlbnQgdmFsdWVzIChhcyBqdWRnZWQgYnkgc2Vjb25kLW1vc3QgY29tbW9uIHZhbHVlIGJlaW5nIDUgdGltZXMgb3IgZmV3ZXIpXG4gICAgICAgICAgICAgICAgdGhpcy5ib3JpbmdDb2x1bW5zLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbmV3VGV4dENvbHVtbnMucHVzaChjb2wpOyAvLyBob3cgZG8geW91IHNhZmVseSBkZWxldGUgZnJvbSBhcnJheSB5b3UncmUgbG9vcGluZyBvdmVyP1xuICAgICAgICAgICAgfVxuXG5cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudGV4dENvbHVtbnMgPSBuZXdUZXh0Q29sdW1ucztcbiAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzLnNvcnRlZEZyZXF1ZW5jaWVzKTtcbiAgICB9XG5cbiAgICAvLyBSZXRyaWV2ZSByb3dzIGZyb20gU29jcmF0YSAocmV0dXJucyBQcm9taXNlKS4gXCJOZXcgYmFja2VuZFwiIHZpZXdzIGdvIHRocm91Z2ggYW4gYWRkaXRpb25hbCBzdGVwIHRvIGZpbmQgdGhlIHJlYWxcbiAgICAvLyBBUEkgZW5kcG9pbnQuXG4gICAgbG9hZCgpIHtcbiAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkICsgJy5qc29uJylcbiAgICAgICAgLnRoZW4ocHJvcHMgPT4ge1xuICAgICAgICAgICAgdGhpcy5uYW1lID0gcHJvcHMubmFtZTtcbiAgICAgICAgICAgIGlmIChwcm9wcy5uZXdCYWNrZW5kICYmIHByb3BzLmNoaWxkVmlld3MubGVuZ3RoID4gMCkge1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhSWQgPSBwcm9wcy5jaGlsZFZpZXdzWzBdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGQzLmpzb24oJ2h0dHBzOi8vZGF0YS5tZWxib3VybmUudmljLmdvdi5hdS9hcGkvdmlld3MvJyArIHRoaXMuZGF0YUlkKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihwcm9wcyA9PiB0aGlzLmNob29zZUNvbHVtblR5cGVzKHByb3BzLmNvbHVtbnMpKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jaG9vc2VDb2x1bW5UeXBlcyhwcm9wcy5jb2x1bW5zKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKHRydWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICByZXR1cm4gZDMuY3N2KCdodHRwczovL2RhdGEubWVsYm91cm5lLnZpYy5nb3YuYXUvYXBpL3ZpZXdzLycgKyB0aGlzLmRhdGFJZCArICcvcm93cy5jc3Y/YWNjZXNzVHlwZT1ET1dOTE9BRCcsIHRoaXMuY29udmVydFJvdy5iaW5kKHRoaXMpKVxuICAgICAgICAgICAgLnRoZW4ocm93cyA9PiB7XG4gICAgICAgICAgICAgICAgLy9jb25zb2xlLmxvZyhcIkdvdCByb3dzIGZvciBcIiArIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgdGhpcy5yb3dzID0gcm93cztcbiAgICAgICAgICAgICAgICB0aGlzLmNvbXB1dGVTb3J0ZWRGcmVxdWVuY2llcygpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLnNoYXBlID09PSAncG9seWdvbicpXG4gICAgICAgICAgICAgICAgICAgIHRoaXMuY29tcHV0ZUJsb2NrSW5kZXgoKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAuY2F0Y2goZSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcignUHJvYmxlbSBsb2FkaW5nICcgKyB0aGlzLm5hbWUgKyAnLicpO1xuICAgICAgICAgICAgICAgIGNvbnNvbGUuZXJyb3IoZSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCdQcm9ibGVtIGxvYWRpbmcgJyArIHRoaXMubmFtZSk7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcihlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBDcmVhdGUgYSBoYXNoIHRhYmxlIGxvb2t1cCBmcm9tIFt5ZWFyLCBibG9jayBJRF0gdG8gZGF0YXNldCByb3dcbiAgICBjb21wdXRlQmxvY2tJbmRleCgpIHtcbiAgICAgICAgdGhpcy5yb3dzLmZvckVhY2goKHJvdywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgIGlmICh0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXSA9PT0gdW5kZWZpbmVkKVxuICAgICAgICAgICAgICAgIHRoaXMuYmxvY2tJbmRleFtyb3dbJ0NlbnN1cyB5ZWFyJ11dID0ge307XG4gICAgICAgICAgICB0aGlzLmJsb2NrSW5kZXhbcm93WydDZW5zdXMgeWVhciddXVtyb3dbJ0Jsb2NrIElEJ11dID0gaW5kZXg7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGdldFJvd0ZvckJsb2NrKGJsb2NrSWQgLyogY2Vuc3VzX3llYXIgKi8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucm93c1t0aGlzLmJsb2NrSW5kZXhbdGhpcy5hY3RpdmVDZW5zdXNZZWFyXVtibG9ja0lkXV07XG4gICAgfVxuXG4gICAgZmlsdGVyZWRSb3dzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5yb3dzLmZpbHRlcihyb3cgPT4gcm93WydDZW5zdXMgeWVhciddID09PSB0aGlzLmFjdGl2ZUNlbnN1c1llYXIgJiYgcm93WydDTFVFIHNtYWxsIGFyZWEnXSAhPT0gJ0NpdHkgb2YgTWVsYm91cm5lIHRvdGFsJyk7XG4gICAgfVxufSJdfQ==

/* jshint esnext:true */
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

import { SourceData } from './sourceData';

export const datasets = [
    { 
        delay: 10000, 
        dataset: new SourceData('b36j-kiy4'), 
        column: 'Total employment in block' ,
        caption: 'Where everyone works',
        flyTo: {"center":{"lng":144.9598533456214,"lat":-37.83581916243661},"zoom":13.649116614872836,"bearing":0,"pitch":45}
    },
    { 
        delay: 10000, 
        dataset: new SourceData('c3gt-hrz6'), 
        column: 'Transport, Postal and Storage' ,
        caption: 'Where the transport, postal and storage businesses are.',
        flyTo: {"center":{"lng":144.92768176710712,"lat":-37.829218248587246},"zoom":12.728431217914919,"bearing":68.70388312187458,"pitch":60}
    },
    { 
        delay: 10000, 
        dataset: new SourceData('c3gt-hrz6'), 
        column: 'Health Care and Social Assistance' ,
        caption: 'Where the healthcare and social assistance organisations are based.',
        flyTo:{"center":{"lng":144.9572331121853,"lat":-37.82706374763824},"zoom":13.063757386232242,"bearing":26.37478691852334,"pitch":60}
    },

    { 
        delay: 10000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'APPLIED' ], 
        caption: 'Major development project applications',

    }, 
    {
        delay:10000,
        caption: 'Food services available free or low cost to our community',
        name: 'Community food services with opening hours, public transport and parking options',
        mapbox: {
            id: 'food',
            type: 'symbol',
            source: 'mapbox://cityofmelbourne.7xvk0k3l',
            'source-layer': 'Community_food_services_with_-a7cj9v',
            paint: {
                'text-color': 'rgb(249, 243, 178)', // a city for people
            },
            layout: {
                'text-field': '{Name}',
                'text-size': 12,

            }
        },
        flyTo: {"center":{"lng":144.98492251438307,"lat":-37.80310972727281},"zoom":15.358509789790808,"bearing":-78.3999999999997,"pitch":58.500000000000014}
    },

    {
        delay: 10000,
        caption: 'The health and type of each tree in our urban forest',
        name: 'Trees, with species and dimensions (Urban Forest)',
        mapbox: {
            id: 'trees',            
            type: 'circle',
            source: 'mapbox://cityofmelbourne.9trpnbu6',
            'source-layer': 'Trees__with_species_and_dimen-77b9mn',
            paint: {
                'circle-radius': 2,
                'circle-color': 'hsl(146, 50%, 36%)',
                //'circle-color': 'hsl(146, 100%, 36%)',
                'circle-opacity': 0.6
            },

        },
        flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
    },
    {
        delay: 5000,
        caption: 'Including gum trees', // add a number
        name: 'Trees, with species and dimensions (Urban Forest)',
        mapbox: {
            id: 'trees',            
            type: 'circle',
            source: 'mapbox://cityofmelbourne.9trpnbu6',
            'source-layer': 'Trees__with_species_and_dimen-77b9mn',
            paint: {
                'circle-radius': 2,
                'circle-color': 'hsl(146, 100%, 36%)',
                //'circle-color': 'hsl(146, 50%, 36%)',
                'circle-opacity': 0.6
            },
            filter: [ 'in', 'Genus', 'Eucalyptus', 'Corymbia', 'Angophora' ]

        },
        flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
        //flyTo: {"center":{"lng":144.9427325673331,"lat":-37.78444940593038},"zoom":14.5,"bearing":-163.3102224426674,"pitch":35.500000000000014}
    },
    {
        delay: 5000,
        caption: 'And Melbourne\'s famous London plane trees.', // add a number
        name: 'Trees, with species and dimensions (Urban Forest)',
        mapbox: {
            id: 'trees',            
            type: 'circle',
            source: 'mapbox://cityofmelbourne.9trpnbu6',
            'source-layer': 'Trees__with_species_and_dimen-77b9mn',
            paint: {
                'circle-radius': 2,
                //'circle-color': 'hsl(146, 100%, 36%)',
                'circle-color': 'hsl(340, 97%,65%)',
                'circle-opacity': 0.6
            },
            filter: [ 'in', 'Genus', 'Platanus' ]

        },
        flyTo: {"center":{"lng":144.9534345075516,"lat":-37.80134118012522},"zoom":15,"bearing":151.00073048827338,"pitch":58.99999999999999}
        //flyTo: {"center":{"lng":144.9561388488409,"lat":-37.80902710531632},"zoom":14.241757030816636,"bearing":-163.3102224426674,"pitch":35.500000000000014}
    },

    {
        delay:10000,
        caption: 'The skyline of our city',
        name: 'Building outlines',
        mapbox: {
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

        },
        flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
    },
    


    {
        delay: 10000,
        caption: 'Where you can walk your dog off the leash',
        name: 'dogzones-offleash',
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
        flyTo:{"center":{"lng":144.98613987732932,"lat":-37.83888266596187},"zoom":15.096419579432878,"bearing":0,"pitch":57.49999999999999}
    },
    { 
        delay:10000,
        name: 'Street addresses',
        caption: 'Every single street address in the municipality',
        // need to zoom in close on this one
        mapbox: {
            id: '1',
            type: 'symbol',
            source: 'mapbox://cityofmelbourne.3ip3couo',
            'source-layer': 'Street_addresses-97e5on',
            paint: {
                
                'text-color': 'rgb(0,183,79)',
                
            },
            layout: {
                'text-field': '{street_no}',
                'text-allow-overlap': false,
                'text-size': 10,
            }
        },
        //mapboxpoints: 'mapbox://cityofmelbourne.3ip3couo'//'Street_addresses-97e5on',
        flyTo: {"center":{"lng":144.91686220714365,"lat":-37.79330210287267},"zoom":18.098035466133457,"bearing":64.79999999999961,"pitch":45}
    }

];
export const datasets2 = [
    { 
        delay: 10000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'APPLIED' ], 
        caption: 'Major development project applications',

    }, 
    { 
        delay: 10000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'APPROVED' ], 
        caption: 'Major development projects approved' 
    }, 
    { 
        delay: 10000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'UNDER CONSTRUCTION' ], 
        caption: 'Major development projects under construction' 
    }, 
    { delay: 5000, dataset: new SourceData('tdvh-n9dv') }, // bike share
    { delay: 9000, dataset: new SourceData('c3gt-hrz6'), column: 'Accommodation' },
    { delay: 10000, dataset: new SourceData('b36j-kiy4'), column: 'Arts and Recreation Services' },
    //{ delay: 3000, dataset: new SourceData('c3gt-hrz6'), column: 'Retail Trade' },
    { delay: 9000, dataset: new SourceData('c3gt-hrz6'), column: 'Construction' }
    //{ delay: 1000, dataset: 'b36j-kiy4' },
    //{ delay: 2000, dataset: '234q-gg83' }
];

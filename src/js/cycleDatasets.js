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



Garbage Collection Zones
Dog Walking Zones off-leash
Bike Share Stations
Bookable Event Venues
- weddingable
- all
Toilets
- accessible
- all 


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

import { SourceData } from './sourceData';

export const datasets = [
    {
        delay:6000,
        caption:'This is Melbourne',
        paint: [
            ['place-suburb', 'text-color', 'green'],
            ['place-neighbourhood', 'text-color', 'green']
        ],
        name: ''

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
                'text-color': 'hsl(30, 80%, 56%)' // bright orange
                //'text-color': 'rgb(249, 243, 178)', // muted orange, a city for people
            },
            layout: {
                'text-field': '{Name}',
                'text-size': 12,

            }
        },
        flyTo: {"center":{"lng":144.97473730944466,"lat":-37.8049071559513},"zoom":15.348676099922852,"bearing":-154.4971333289701,"pitch":60}
        //flyTo: {"center":{"lng":144.98492251438307,"lat":-37.80310972727281},"zoom":15.358509789790808,"bearing":-78.3999999999997,"pitch":58.500000000000014}
    },
    {
        delay:10000,
        caption: 'Pedestrian sensors count foot traffic every hour',
        name: 'Pedestrian sensor locations',
        dataset: new SourceData('ygaw-6rzq'),
        flyTo: {"center":{"lng":144.96367854761945,"lat":-37.80236896106898},"zoom":15.389393850725732,"bearing":-143.5844675124954,"pitch":60}                                
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
            filter: [ 'in', 'Genus', 'Ulmus' ]

        },
        flyTo: {"center":{"lng":144.963138,"lat":-37.788843},"zoom":15.2,"bearing":-106.14,"pitch":55}

    },
    {
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
            filter: [ 'in', 'Genus', 'Eucalyptus', 'Corymbia', 'Angophora' ]

        },
        //flyTo: {"center":{"lng":144.8473748868907,"lat":-37.811779740787244},"zoom":13.162524150847315,"bearing":0,"pitch":45}
        flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":200,"pitch":59.99589825769096}
        //flyTo: {"center":{"lng":144.9427325673331,"lat":-37.78444940593038},"zoom":14.5,"bearing":-163.3102224426674,"pitch":35.500000000000014}
    },
    {
        delay: 10000,
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
            filter: [ 'in', 'Genus', 'Platanus' ]
            

        },
        flyTo: {"center":{"lng":144.94394633838965,"lat":-37.79588870668271},"zoom":15.905130361446668,"bearing":157.5999999999974,"pitch":60}
        //flyTo: {"center":{"lng":144.92672531478553,"lat":-37.804385949276394},"zoom":15,"bearing":119.78868682882374,"pitch":60}
        
        //flyTo: {"center":{"lng":144.91478510016202,"lat":-37.78434147167477},"zoom":13.922228461793669,"bearing":122.9947834604346,"pitch":47.50000000000003}
        //flyTo: {"center":{"lng":144.9534345075516,"lat":-37.80134118012522},"zoom":15,"bearing":151.00073048827338,"pitch":58.99999999999999}
        //flyTo: {"center":{"lng":144.9561388488409,"lat":-37.80902710531632},"zoom":14.241757030816636,"bearing":-163.3102224426674,"pitch":35.500000000000014}
    },
    {
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
            },

        },
        flyTo: {"center":{"lng":144.94191157000034,"lat":-37.80036709214022},"zoom":14.1,"bearing":144.92728392742694,"pitch":60}
        //flyTo: {"center":{"lng":144.94318163755105,"lat":-37.78351953419449},"zoom":15.773488574721082,"bearing":147.65219382373107,"pitch":59.99589825769096}
    },


    
    {
        delay: 10000, 
        dataset: new SourceData('b36j-kiy4'), 
        column: 'Total employment in block' ,
        caption: 'The Census of Land Use and Employment (CLUE) reveals where employment is concentrated',
        flyTo: {"center":{"lng":144.9267253147857,"lat":-37.804385949276494},"zoom":13.88628732015981,"bearing":119.78868682882374,"pitch":60}
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
        dataset: new SourceData('c3gt-hrz6'), 
        column: 'Transport, Postal and Storage' ,
        caption: '...where the transport, postal and storage sector is located.',
        flyTo: {"center":{"lng":144.92768176710712,"lat":-37.829218248587246},"zoom":12.728431217914919,"bearing":68.70388312187458,"pitch":60}
    },
    { 
        delay: 10000, 
        dataset: new SourceData('c3gt-hrz6'), 
        column: 'Health Care and Social Assistance' ,
        caption: 'and where the healthcare and social assistance organisations are based.',
        flyTo:{"center":{"lng":144.9572331121853,"lat":-37.82706374763824},"zoom":13.063757386232242,"bearing":26.37478691852334,"pitch":60}
    },

    { 
        delay: 7000, 
        linger:9000,
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'APPLIED' ], 
        caption: 'Development Activity Monitor tracks major projects in the planning stage...',
        flyTo: {"center":{"lng":144.96354379775335,"lat":-37.82595306646476},"zoom":14.665437375740426,"bearing":0,"pitch":59.5}

    }, 

    { 
        delay: 4000,
        linger:5000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'UNDER CONSTRUCTION' ], 
        caption: '...projects under construction',
        flyTo: {"center":{"lng":144.96354379775335,"lat":-37.82595306646476},"zoom":14.665437375740426,"bearing":0,"pitch":59.5}

    }, 
    { 
        delay: 5000, 
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'COMPLETED' ], 
        caption: '...and those already completed.',
        flyTo: {"center":{"lng":144.96354379775335,"lat":-37.82595306646476},"zoom":14.665437375740426,"bearing":0,"pitch":59.5}

    }, 
    


    {
        delay: 10000,
        linger: 5000,
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
        flyTo:{"center":{"lng":144.98613987732932,"lat":-37.83888266596187},"zoom":15.096419579432878,"bearing":-30,"pitch":57.49999999999999}
    },
    { 
        delay:10000,
        name: 'Street addresses',
        caption: 'Every single street address in the municipality',
        // need to zoom in close on this one
        mapbox: {
            id: 'addresses',
            type: 'symbol',
            source: 'mapbox://cityofmelbourne.3ip3couo',
            'source-layer': 'Street_addresses-97e5on',
            paint: {
                
                'text-color': 'rgb(0,183,79)',
                
            },
            layout: {
                'text-field': '{street_no}',
                'text-allow-overlap': true,
                'text-size': 10,
            }
        },
        //mapboxpoints: 'mapbox://cityofmelbourne.3ip3couo'//'Street_addresses-97e5on',
        // north melbourne
        //flyTo: {"center":{"lng":144.91686220714365,"lat":-37.79330210287267},"zoom":18.098035466133457,"bearing":64.79999999999961,"pitch":45}
        // south yarra/prahran ish
        flyTo: {"center":{"lng":144.984790451856,"lat":-37.83391831182901},"zoom":18,"bearing":-39.99999999999949,"pitch":60}
    },
    { 
        delay:1000,
        name: 'Property boundaries',
        caption: 'And every property boundary',
        // need to zoom in close on this one
        mapbox: {
            id: 'boundaries-repeat',
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
        // just repeat previous view.
        flyTo: {"center":{"lng":144.984790451856,"lat":-37.83391831182901},"zoom":18,"bearing":-39.99999999999949,"pitch":60}
    },
    { 
        delay:15000,
        name: 'Property boundaries',
        caption: 'And every property boundary',
        // need to zoom in close on this one
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
        // birds eye
        flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
        
        // south yarra/prahran ish
        //flyTo: {"center":{"lng":144.984790451856,"lat":-37.83391831182901},"zoom":16.19242336690863,"bearing":-39.99999999999949,"pitch":60}
        

        //mapboxpoints: 'mapbox://cityofmelbourne.3ip3couo'//'Street_addresses-97e5on',
        // north melbourne
        //flyTo: {"center":{"lng":144.91686220714365,"lat":-37.79330210287267},"zoom":18.098035466133457,"bearing":64.79999999999961,"pitch":45}
        //flyTo: {"center":{"lng":144.984790451856,"lat":-37.83391831182901},"zoom":16.19242336690863,"bearing":-39.99999999999949,"pitch":60}
    },
    { 
        delay:0,
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
                    stops: [
                        [13, 1],
                        [16, 3]
                    ]
                }

                
            },
        },
        linger:10000,
        // birds eye, zoomed out
        flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:13,bearing:0,pitch:0},
    },
    { 
        delay:10000,
        name: 'Garbage collection zones',
        caption: 'Which night is bin night',
        // need to zoom in close on this one
        mapbox: {
            id: 'garbage-2',
            type: 'symbol',
            source: 'mapbox://cityofmelbourne.8arqwmhr',
            'source-layer': 'Garbage_collection_zones-9nytsk',
            paint: {
                
                'text-color': 'hsl(23, 94%, 64%)',
            }, 
            layout: {
                'text-field': '{rub_day}',
                'text-size': {
                    stops: [
                        [13, 14],
                        [16, 16]
                    ]
                }
            },
        }
        // birds eye
        //flyTo: {"center": {lng:144.953086,lat:-37.807509},zoom:14,bearing:0,pitch:0, duration:10000},
    },


    { 
        name: 'Melbourne Bike Share stations, with current number of free and used docks (every 15 minutes)',
        caption: 'How many "Blue Bikes" are ready in each station.',
        column: 'NBBikes',
        delay: 20000, 
        dataset: new SourceData('tdvh-n9dv') ,
        options: {
            symbol: {
                layout: {
                    'icon-image': 'bicycle-share-15',
                    'icon-allow-overlap': true,
                    // for some reason it gets silently rejected with this:
                    /*'icon-size': {
                        property: 'NBBikes',

                        "stops": [
                          [0, 0.5],
                          [30, 3]

                        ]
                    }*/
                }
            }
        },

        flyTo: {"center":{"lng":144.97768414562887,"lat":-37.81998948372839},"zoom":14.670221676238507,"bearing":-57.93230251736117,"pitch":60}
    }, // bike share
    {
        dataset: new SourceData('84bf-dihi'),
        caption: 'Places you can book for a wedding...',
        filter: ['==', 'WEDDING', 'Y'],
        column: 'WEDDING',
        delay: 4000,
        flyTo: {"center":{"lng":144.9736255669336,"lat":-37.81396271334432},"zoom":14.405591091671058,"bearing":-67.19999999999999,"pitch":54.00000000000002}
    },
    {
        dataset: new SourceData('84bf-dihi'),
        caption: 'Places you can book for a wedding...or something else.',
        column: 'WEDDING',
        delay: 6000,
        flyTo: {"center":{"lng":144.9736255669336,"lat":-37.81396271334432},"zoom":14.405591091671058,"bearing":-80,"pitch":54.00000000000002}
    },
    {
        dataset: new SourceData('ru3z-44we'),
        caption: 'Public toilets...',
        delay: 5000,
        flyTo: {"center":{"lng":144.97027688989027,"lat":-37.81107254397835},"zoom":14.8,"bearing":-89.74253780407638,"pitch":60}
    },
    {
        dataset: new SourceData('ru3z-44we'),
        caption: 'Public toilets...that are accessible for wheelchair users',
        filter: ['==','wheelchair','yes'],
        delay: 5000,
        flyTo: {"center":{"lng":144.97027688989027,"lat":-37.81107254397835},"zoom":14.8,"bearing":-89.74253780407638,"pitch":60}
    },
    
    {
        delay:10000,
        caption: 'The skyline of our city',
        name: 'Building outlines',
        opacity:0.6,
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
        // from abbotsfordish
        flyTo:{"center":{"lng":144.9725135032764,"lat":-37.807415209051285},"zoom":14.896259153012243,"bearing":-106.40000000000015,"pitch":60}
        //from south
        //flyTo: {"center":{"lng":144.9470140753445,"lat":-37.81520062726666},"zoom":15.458784930238672,"bearing":98.39999999999988,"pitch":60}
    },
    {
        delay: 10000,
        caption: 'Every cafe and restaurant',
        
        dataset: new SourceData('sfrg-zygb'),
        flyTo:{"center":{"lng":144.97098789992964,"lat":-37.81021310404749},"zoom":16.02773233201699,"bearing":-135.21975308641981,"pitch":60},
        options: {
            symbol: {
                layout: {
                    'icon-image': 'cafe-15',
                    'icon-allow-overlap': true
                }
            }
        }
    },
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
        caption: 'What will <u>you</u> do with our data?',
        delay:20000,
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

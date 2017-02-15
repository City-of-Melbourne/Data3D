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
        dataset: new SourceData('gh7s-qda8'), 
        column: 'status', 
        filter: [ '==', 'status', 'APPLIED' ], 
        caption: 'Major development project applications' 
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

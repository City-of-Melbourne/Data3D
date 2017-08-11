/* jshint esnext:true */
var d3 = require('d3.promise');

function def(a, b) {
    return a !== undefined ? a : b;
}
/*
Manages fetching a dataset from Socrata and preparing it for visualisation by
counting field value frequencies etc. 
*/
export class SourceData {
    constructor(dataId, activeCensusYear) {
        this.dataId = dataId;
        this.activeCensusYear = def(activeCensusYear, 2016);

        this.locationColumn = undefined;  // name of column which holds lat/lon or block ID
        this.locationIsPoint = undefined; // if the dataset type is 'point' (used for parsing location field)
        this.numericColumns = [];         // names of columns suitable for numeric datavis
        this.textColumns = [];            // names of columns suitable for enum datavis
        this.boringColumns = [];          // names of other columns
        this.mins = {};                   // min and max of each numeric column
        this.maxs = {};
        this.frequencies = {};            // 
        this.sortedFrequencies = {};      // most frequent values in each text column
        this.shape = 'point';             // point or polygon (CLUE block)
        this.rows = undefined;            // processed rows
        this.blockIndex = {};             // cache of CLUE block IDs
    }


    chooseColumnTypes (columns) {
        //var lc = columns.filter(col => col.dataTypeName === 'location' || col.dataTypeName === 'point' || col.name === 'Block ID')[0];
        // "location" and "point" are both point data types, expressed differently.
        // Otherwise, a "block ID" can be joined against the CLUE Block polygons which are in Mapbox.
        let lc = columns.filter(col => col.dataTypeName === 'location' || col.dataTypeName === 'point')[0];
        if (!lc) {
            lc = columns.filter(col => col.name === 'Block ID')[0];
        }


        if (lc.dataTypeName === 'point')
            this.locationIsPoint = true;

        if (lc.name === 'Block ID') {
            this.shape = 'polygon';
        }

        this.locationColumn = lc.name;

        columns = columns.filter(col => col !== lc);

        this.numericColumns = columns
            .filter(col => col.dataTypeName === 'number' && col.name !== 'Latitude' && col.name !== 'Longitude')
            .map(col => col.name);
        
        this.numericColumns
            .forEach(col => { this.mins[col] = 1e9; this.maxs[col] = -1e9; });
        
        this.textColumns = columns
            .filter(col => col.dataTypeName === 'text')
            .map(col => col.name);

        this.textColumns
            .forEach(col => this.frequencies[col] = {});

        this.boringColumns = columns
            .map(col => col.name)
            .filter(col => this.numericColumns.indexOf(col) < 0 && this.textColumns.indexOf(col) < 0);
    }

    // TODO better name and behaviour
    filter(row) {
        // TODO move this somewhere better
        if (row['CLUE small area'] && row['CLUE small area'] === 'City of Melbourne total')
            return false;
        if (row['Census year'] && row['Census year'] !== this.activeCensusYear)
            return false;
        return true;
    }



    // convert numeric columns to numbers for data vis
    convertRow(row) {
        //if (!filter(row))
        //    return;
        // convert location types (string) to [lon, lat] array.
        function locationToCoords(location) {
            if (String(location).length === 0)
                return null;
            try {
                // "new backend" datasets use a WKT field [POINT (lon lat)] instead of (lat, lon)
                if (this.locationIsPoint) {
                    return location.replace('POINT (', '').replace(')', '').split(' ').map(n => Number(n));
                } else if (this.shape === 'point') {
                    //console.log(location.length);
                    return [Number(location.split(', ')[1].replace(')', '')), Number(location.split(', ')[0].replace('(', ''))];
                } else 
                    return location;

            } catch (e) {
                console.log(`Unreadable location ${location} in ${this.name}.`);
                console.error(e);

            }

        }

        // TODO use column.cachedContents.smallest and .largest
        this.numericColumns.forEach(col => {
            row[col] = Number(row[col]) ; // +row[col] apparently faster, but breaks on simple things like blank values
            if (this.filter(row)) {
                if (row[col] < this.mins[col])
                    this.mins[col] = row[col];

                if (row[col] > this.maxs[col])
                    this.maxs[col] = row[col];
            }
        });
        this.textColumns.forEach(col => {
            var val = row[col];
            this.frequencies[col][val] = (this.frequencies[col][val] || 0) + 1;
        });

        row[this.locationColumn] = locationToCoords.call(this, row[this.locationColumn]);

        if (!row[this.locationColumn])
            return null; // skip this row.

        return row;
    }

    computeSortedFrequencies() {
        var newTextColumns = [];
        this.textColumns.forEach(col => {
            this.sortedFrequencies[col] = Object.keys(this.frequencies[col])
                .sort((vala, valb) => this.frequencies[col][vala] < this.frequencies[col][valb] ? 1 : -1)
                .slice(0,12); // Take this many of the most frequent values to assign to colors.

            if (Object.keys(this.frequencies[col]).length < 2 || Object.keys(this.frequencies[col]).length > 20 && this.frequencies[col][this.sortedFrequencies[col][1]] <= 5) {
                // It's boring if all values the same, or if too many different values (as judged by second-most common value being 5 times or fewer)
                this.boringColumns.push(col);
                
            } else {
                newTextColumns.push(col); // how do you safely delete from array you're looping over?
            }


        });
        this.textColumns = newTextColumns;
        //console.log(this.sortedFrequencies);
    }

    // Retrieve rows from Socrata (returns Promise). "New backend" views go through an additional step to find the real
    // API endpoint.
    load() {
        return d3.json('https://data.melbourne.vic.gov.au/api/views/' + this.dataId + '.json')
        .then(props => {
            this.name = props.name;
            if (props.newBackend && props.childViews.length > 0) {

                this.dataId = props.childViews[0];

                return d3.json('https://data.melbourne.vic.gov.au/api/views/' + this.dataId)
                    .then(props => this.chooseColumnTypes(props.columns));
            } else {
                this.chooseColumnTypes(props.columns);
                return Promise.resolve(true);
            }
        }).then(() => {
            try {
                return d3.csv('https://data.melbourne.vic.gov.au/api/views/' + this.dataId + '/rows.csv?accessType=DOWNLOAD', this.convertRow.bind(this))
                .then(rows => {
                    //console.log("Got rows for " + this.name);
                    this.rows = rows.filter(this.filter.bind(this)); // no idea why this bind step is needed for some datasets but not others
                    this.computeSortedFrequencies();
                    if (this.shape === 'polygon')
                        this.computeBlockIndex();
                    return this;
                })
                .catch(e => {
                    console.error(`Problem loading #${this.dataId}, ${this.name}.`);
                    console.error(e);
                });
            } catch (e) {
                console.error('Problem loading ' + this.name + '!');
                console.error(e);
            }
        });
    }


    // Create a hash table lookup from [year, block ID] to dataset row
    computeBlockIndex() {
        this.rows.forEach((row, index) => {
            let year = row['Census year'];
            if (this.blockIndex[year] === undefined)
                this.blockIndex[year] = {};
            this.blockIndex[year][row['Block ID']] = index;
        });
    }

    getRowForBlock(blockId /* census_year */) {
        return this.rows[this.blockIndex[this.activeCensusYear][blockId]];
    }

    filteredRows() {
        return this.rows.filter(this.filter);
        //return this.rows.filter(row => row['Census year'] === this.activeCensusYear && row['CLUE small area'] !== 'City of Melbourne total');
    }
}
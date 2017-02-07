/* jshint esnext:true */
import { melbourneRoute } from './melbourneRoute';

/*
Continuously moves the Mapbox vantage point around a GeoJSON-defined path.
*/

function whenLoaded(map, f) {
    if (map.loaded()) {
        console.log('Already loaded.');
        f();
    }
    else { 
        console.log('Wait for load');
        map.once('load', f);
    }
}

let def = (a, b) => a !== undefined ? a : b;

export class FlightPath {

    constructor(map, route) {
        this.route = route;
        if (this.route === undefined)
            this.route = melbourneRoute;

        this.map = map;

        this.speed = 0.01;

        this.posNo = 0;

        this.positions = this.route.features.map(feature => ({
            center: feature.geometry.coordinates,
            zoom: def(feature.properties.zoom, 14),
            bearing: feature.properties.bearing,
            pitch: def(feature.properties.pitch, 60)
        }));

        this.pauseTime = 0;

        this.bearing=0;

        this.stopped = false;



    /*var positions = [
        { center: [144.96, -37.8], zoom: 15, bearing: 10},
        { center: [144.98, -37.84], zoom: 15, bearing: 160, pitch: 10},
        { center: [144.995, -37.825], zoom: 15, bearing: -90},
        { center: [144.97, -37.82], zoom: 15, bearing: 140}

    ];*/

        this.moveCamera = function(){
            console.log('moveCamera');
            if (this.stopped) return;
            var pos = this.positions[this.posNo];
            pos.speed = this.speed;
            pos.curve = 0.48; //1;
            pos.easing = (t) => t; // linear easing

            console.log('flyTo');
            this.map.flyTo(pos, { source: 'flightpath' });

            this.posNo = (this.posNo + 1) % this.positions.length;
            
            //map.rotateTo(bearing, { easing: easing });
            //bearing += 5;
        }.bind(this);
 
        this.map.on('moveend', (data) => { 
            if (data.source === 'flightpath') 
                setTimeout(this.moveCamera, this.pauseTime);
        });


        /*
        This seemed to be unreliable - wasn't always getting the loaded event.
        whenLoaded(this.map, () => {
            console.log('Loaded.');
            setTimeout(this.moveCamera, this.pauseTime);
        });
        */
        
        this.map.jumpTo(this.positions[0]);
        this.posNo ++;
        setTimeout(this.moveCamera, 0 /*this.pauseTime*/);

        this.map.on('click', () => { 
            if (this.stopped) {
                this.stopped = false;
                setTimeout(this.moveCamera, this.pauseTime);
            } else {
                this.stopped = true;
                this.map.stop();
            }
        });


    }    

}
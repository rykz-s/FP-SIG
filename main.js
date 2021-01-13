mapboxgl.accessToken = 'pk.eyJ1Ijoicnl1a2F6dWFzIiwiYSI6ImNrajJ6cDRhdDBoYmEyem5seG1hMnoyOGwifQ.LYTAS8IvX4_f-UpsE6-hJg';
mapboxgl.setRTLTextPlugin(
    'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js'
);

var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/mapbox/dark-v10', // stylesheet location
    center: [112.73724627, -7.25722936], // starting position [lng, lat]
    zoom: 10 // starting zoom
});

map.on('load', function() {
    map.setLayoutProperty('country-label', 'text-field', [
        'format', ['get', 'name_en'], {
            'font-scale': 1.2
        },
        '\n', {},
        ['get', 'name'], {
            'font-scale': 0.8,
            'text-font': [
                'literal', ['DIN Offc Pro Italic', 'Arial Unicode MS Regular']
            ]
        }
    ]);
    map.addSource('trees', {
        type: 'geojson',
        data: './kelurahan.geojson'
    });
    // add heatmap layer here
    map.addLayer({
        id: 'trees-heat',
        type: 'heatmap',
        source: 'trees',
        maxzoom: 15,
        paint: {
            // increase weight as diameter breast height increases
            'heatmap-weight': {
                property: 'K_Konfirmasi',
                type: 'exponential',
                stops: [
                    [1, 0],
                    [62, 1]
                ]
            },
            // increase intensity as zoom level increases
            'heatmap-intensity': {
                stops: [
                    [11, 1],
                    [15, 3]
                ]
            },
            // assign color values be applied to points depending on their density
            'heatmap-color': [
                'interpolate', ['linear'],
                ['heatmap-density'],
                0, 'rgba(236,222,239,0)',
                0.2, 'rgb(208,209,230)',
                0.4, 'rgb(166,189,219)',
                0.6, 'rgb(103,169,207)',
                0.8, 'rgb(28,144,153)'
            ],
            // increase radius as zoom increases
            'heatmap-radius': {
                stops: [
                    [11, 15],
                    [15, 20]
                ]
            },
            // decrease opacity to transition into the circle layer
            'heatmap-opacity': {
                default: 1,
                stops: [
                    [14, 1],
                    [15, 0]
                ]
            },
        }
    }, 'waterway-label');
    // add circle layer here
    map.addLayer({
        id: 'trees-point',
        type: 'circle',
        source: 'trees',
        minzoom: 14,
        paint: {
            // increase the radius of the circle as the zoom level and dbh value increases
            'circle-radius': {
                property: 'K_Konfirmasi',
                type: 'exponential',
                stops: [
                    [{ zoom: 12, value: 1 }, 5],
                    [{ zoom: 12, value: 42 }, 10],
                    [{ zoom: 22, value: 1 }, 20],
                    [{ zoom: 22, value: 42 }, 50],
                ]
            },
            'circle-color': {
                property: 'K_Konfirmasi',
                type: 'exponential',
                stops: [
                    [0, 'rgba(236,222,239,0)'],
                    [10, 'rgb(236,222,239)'],
                    [20, 'rgb(208,209,230)'],
                    [30, 'rgb(166,189,219)'],
                    [40, 'rgb(103,169,207)'],
                    [50, 'rgb(28,144,153)'],
                    [60, 'rgb(1,108,89)']
                ]
            },
            'circle-stroke-color': 'white',
            'circle-stroke-width': 1,
            'circle-opacity': {
                stops: [
                    [14, 0],
                    [15, 1]
                ]
            }
        }
    }, 'waterway-label');
    map.on('click', 'trees-point', function(e) {
        new mapboxgl.Popup()
            // var p = e.features[0].properties
            .setLngLat(e.features[0].geometry.coordinates)
            // .setHTML(p.Kelurahan + '(' + p.K_Konfirmasi + ')')
            .setHTML('<b>Kelurahan: </b>' + e.features[0].properties.Kelurahan + '<br>' + '<b>Kumulatif Konfirmasi:</b> ' + e.features[0].properties.K_Konfirmasi + '<br>' + '<b>Konfirmasi Sembuh:</b> ' + e.features[0].properties.K_Sembuh + '<br>' + '<b>Konfirmasi Meninggal:</b> ' + e.features[0].properties.K_Meninggal + '<br>' + '<b>Dalam Perawatan:</b> ' + e.features[0].properties.Perawatan)
            .addTo(map);
    });
});
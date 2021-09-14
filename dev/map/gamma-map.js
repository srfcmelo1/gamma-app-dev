import {LitElement, html, css} from 'lit';
import {map as createMap, DomUtil, marker, icon, tileLayer, control, geoJSON, layerGroup, circleMarker, latLng} from '../../node_modules/leaflet/dist/leaflet-src.esm.js';


export class GammaMap extends LitElement{

    static get styles() {
        return [css`
          :host {
            display:block;
            height: 800px;
            scroll-padding-bottom: 10px;
          }
        `];
    }

    /* Atributos das classes map */
    static get properties(){
        return {
          mymap: {type: Object},
          name: {type: String},
          lat: {type: Number},
          long: {type: Number},
          zoom: {type: Number},
          layers : {type: Object}
         };
    }

    constructor() {
        super();
        this.name = 'Mapa 1';
        this.lat = -22.9027;
        this.long = -43.2075;
        this.zoom = 9;
        this.layers = []
    }


    
    gmLayers(){

    }

    gmMapTiles(){
        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' + 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

        var grayscale   = tileLayer(mbUrl, {id: 'mapbox/light-v9',    tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
		    streets     = tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
        
        var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };
        return baseLayers
    }
    
    gmSymbology(markerType){
        /** tenho que criar um CSS ou algo do tipo para buscar quais seriam os simbolos e cores que poderiamos utilizar */
        

    }

    gmLegends(mymap, legposition, itemsLegend){
        /*Legend specific*/
        var legend = control({ position: legposition });
        legend.onAdd = function(mymap) {
            var div = DomUtil.create("div", "legend");
            var itemsLegend = [
                "<h4>Analise de Risco</h4>",
                '<i style="background: green"></i></i><span>Grau entre 0 e 0.11</span><br>',
                '<i style="background: yellow"></i><span>Grau entre 0.11 e 0.3</span><br>',
                '<i style="background: orange"></i><span>Grau entre 0.3 e 0.5</span><br>',
                '<i style="background: red"></i><span>Grau maior que 0.5</span><br>',
                '<i class="icon" style="background-image: url(https://d30y9cdsu7xlg0.cloudfront.net/png/194515-200.png);background-repeat: no-repeat;"></i><span>Grænse</span><br>'
            ];
            itemsLegend.forEach(function (item, index, array) {
                div.innerHTML += item;
            });
            return div;
        };
        legend.addTo(mymap);
    }

    gmMiniMap(urlTemplate){
		/*var map = new .Map('map');
		var osmUrl='http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
		var osmAttrib='Map data &copy; OpenStreetMap contributors';
		var osm = new this.TileLayer(osmUrl, {minZoom: 5, maxZoom: 18, attribution: osmAttrib});

		map.addLayer(osm);
		map.setView(new this.LatLng(59.92448055859924, 10.758276373601069),10);
		
		//Plugin magic goes here! Note that you cannot use the same layer object again, as that will confuse the two map controls
		var osm2 = new this.TileLayer(osmUrl, {minZoom: 0, maxZoom: 13, attribution: osmAttrib });
		var miniMap = new this.Control.MiniMap(osm2, { toggleDisplay: true }).addTo(map);*/
    }

    firstUpdated(mymap) {
        /* Create map */
        const mapEl = this.shadowRoot.querySelector('#mapid');
        this.mymap = createMap(mapEl).setView([this.lat, this.long], this.zoom, this.gmMapTiles());
        let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        this.mymap.addLayer(tileLayer(urlTemplate, {minZoom: 4}));

        /*this.gmMiniMap(mapEl, this.mymap, urlTemplate)*/

        function getColors(vrisco){
            if (vrisco > 0.5)
                return "red";
            if (vrisco > 0.3)
                return "yellow";                
            if (vrisco > 0.11)
                return "orange";                
            if (vrisco => 0)
                return "green";                
        };  

        var legvector = []
        this.gmLegends(this.mymap, "bottomright", legvector);

        /* le de um arquivo json as subestacoes */
        async function addGeoJson(mymap) {
            var MarkerStyleDefault = {
                radius: 5,
                fillColor: "#ff7800",
                color: "#000",
                weight: 1,
                opacity: 1,
                fillOpacity: 0.8
            };
            
            const response = await fetch("../bd/subestacoes2.geojson");
            const data = await response.json();
            var ses = {"subestacoes" : geoJSON(data, { 
                            style: function(feature) {
                                return feature.properties && feature.properties.risco;
                            },

                            markerToLayer: function (feature, latlng) {
                                return marker(latlng, { icon: mymap.divIcon(setDivIcon(feature)) });
                            },                               

                            pointToLayer: function(feature, latlng) {
                                feature.properties.grau_defeito = Math.random();
                                feature.properties.risco = Math.random();
                                return new circleMarker(
                                    latlng, {
                                        radius: 7, 
                                        fillOpacity: 0.85,
                                        fillColor: getColors(feature.properties.risco),
                                        color: getColors(feature.properties.risco),
                            })},

                            onEachFeature: function (feature, layer) {
                                var sel_style = {
                                    click:{
                                        "color": "red"
                                    }
                                }
                                layer.bindPopup(feature.properties.Nome + '</b><br>' + feature.properties.Concession);
                                layer.on('click', function(e){
                                     /*console.log('click', e);*/
                                    document.getElementById("nome").innerHTML = feature.properties.Nome;
                                    document.getElementById("lat").innerHTML = feature.properties.latitude;
                                    document.getElementById("lon").innerHTML = feature.properties.longitude;
                                    document.getElementById("tensao").innerHTML = feature.properties.Tensao;
                                    document.getElementById("risco").innerHTML = feature.properties.risco;
                                    document.getElementById("grau_defeito").innerHTML = feature.properties.grau_defeito;
                                    mymap.setView(new latLng(feature.properties.latitude, feature.properties.longitude), 10);
                                })
                                layer.on('mouseover', function(e){
                                    /*console.log('click', e);*/
                                   document.getElementById("nome").innerHTML = feature.properties.Nome;
                                   document.getElementById("lat").innerHTML = feature.properties.latitude;
                                   document.getElementById("lon").innerHTML = feature.properties.longitude;
                                   document.getElementById("tensao").innerHTML = feature.properties.Tensao;
                                   document.getElementById("risco").innerHTML = feature.properties.risco;
                                   document.getElementById("grau_defeito").innerHTML = feature.properties.grau_defeito;
                               })
                                
                            }
                        }).addTo(mymap)
                    };
            return ses;
        };

        var subestacoes = {
            "Subestacoes": addGeoJson(this.mymap)
        };

        control.layers(null, this.gmMapTiles()).addTo(this.mymap);
        /*control.scale({imperial: false, maxWidth: 150}).addTo(this.mymap);*/
        control.scale({maxWidth: 150}).addTo(this.mymap);

        /*var miniMap = new control.MiniMap(L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png'), {
            toggleDisplay: true,
            position: 'bottomright'
        }).addTo(this.map);

        var options = {
            modal: true,
            title: "Box area zoom"
        };
        var zbcontrol = control.zoomBox(options);
        this.mymap.addControl(zbcontrol);*/        

    };
    render() {
        return html`
            <link rel="stylesheet" href="map/gamma-map.css">
            <link rel="stylesheet" href="../node_modules/leaflet/dist/leaflet.css">
            <link rel="stylesheet" href="../node_modules/leaflet-minimap/dist/Control.MiniMap.min.css">
	        <script src="../node_modules/leaflet-minimap/dist/Control.MiniMap.min.js" type="text/javascript"></script>            
            <div id="mapid" style="height: 100%"></div>
        `;
    }
}
customElements.define("gamma-map", GammaMap);




/*var overlays = {
    "Subestacoes": this.getSubstations(this.mymap)
};
        icon dynamical size
        setIconSize(mymap){
            var marker_icon = icon({
                iconUrl: '../dev/assets/images/se_1.png',
                iconSize:     [25, 25],  // size of the icon
                iconAnchor:   [0, 0],    // point of the icon which will correspond to marker's location
                popupAnchor:  [-3, -3]   // point from which the popup should open relative to the iconAnchor
                });

            mymap.on('zoomend', function() {
                    const zoom = mymap.getZoom() + 1;
                    const w = 15 * zoom/5;
                    const h = 15 * zoom/5;
                    marker_icon.options.iconSize = [w, h];
                    marker_icon.options.iconAnchor = [w / 2, h / 2];
                    mymap.removeLayer(marker)})
        }    

*/

/*Read BD and create array with the markers to map
var rawFile = new XMLHttpRequest();
rawFile.open("GET", '../bd/subestacoes.csv', false);
var aux_map = this.mymap;
var arraySE = [];
rawFile.onreadystatechange = function () {
    if(rawFile.readyState === 4)
    {
        if(rawFile.status === 200 || rawFile.status == 0){
            var allText = rawFile.responseText;
            const csvToArray = (data, delimiter = ',', omitFirstRow = false) =>  data
                .slice(omitFirstRow ? data.indexOf('\n') + 1 : 0)
                .split('\n')
                .map(v => v.split(delimiter));
            let seArray = csvToArray(allText, ',', true);
            for (let index = 0; index < seArray.length; index++) {
                try{
                    let auxSE = marker(
                                [seArray[index][5], 
                                seArray[index][4]],
                                {icon: marker_icon}).addTo(aux_map).bindPopup('<b>' + seArray[index][0] + 
                                '</b><br>Tensao: ' + seArray[index][3] + 
                                ' V<br> Concessão: ' + seArray[index][1] + 
                                '<br> Prob. Falha: ' + seArray[index][6]);
                    arraySE.push(auxSE);
                } catch (error) {
                    console.log(error);
                }
            }                    
        }
    }
}
rawFile.send(null);
var subestacoes = layerGroup(arraySE);
return subestacoes;*/
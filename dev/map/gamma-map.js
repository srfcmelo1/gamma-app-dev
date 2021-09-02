import {LitElement, html, css} from 'lit';
import {map as createMap, marker, icon,  tileLayer, control,  layerGroup} from '../../node_modules/leaflet/dist/leaflet-src.esm.js';

export class Map extends LitElement{

    static get styles() {
        return [css`
          :host {
            display:block;
            height: 800px;
            scroll-padding-bottom: 10px;
          }
        `];
    }

    /* DIZ SE ELE E UM ATRIBUTO OU NAO DA MINHA CLASSE*/
    static get properties(){
      return {
          mymap: {type: Object},
          name: {type: String},
          lat: {type: Number},
          long: {type: Number},
          zoom: {type: Number}
      };
  }

    constructor() {
        super();
        this.name = 'Mapa 1';
        this.lat = -22.9027;
        this.long = -43.2075;
        this.zoom = 4;
        this.layers = []
    }
    
    firstUpdated() {
    
        var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
            mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

        var grayscale   = tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr}),
		    streets     = tileLayer(mbUrl, {id: 'mapbox/streets-v11', tileSize: 512, zoomOffset: -1, attribution: mbAttr});
        
        const mapEl = this.shadowRoot.querySelector('#mapid');

        this.mymap = createMap(mapEl).setView([this.lat, this.long],this.zoom, [grayscale, streets]);
        let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        this.mymap.addLayer(tileLayer(urlTemplate, {minZoom: 4}));
        

        var baseLayers = {
            "Grayscale": grayscale,
            "Streets": streets
        };

        var overlays = {
            "Subestacoes": this.getSubstations(),
        };

        control.layers(baseLayers, overlays).addTo(this.mymap);
    }

    getSubstations(){
        var marker_icon = icon({
            iconUrl: '../dev/assets/images/se_1.png',
            iconSize:     [25, 25], // size of the icon
            iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
            popupAnchor:  [-3, -3] // point from which the popup should open relative to the iconAnchor
            });


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
                            let auxSE = marker([seArray[index][5], seArray[index][4]],{icon: marker_icon}).addTo(aux_map).bindPopup('<b>' + seArray[index][0] + '</b><br>Tensao: ' + seArray[index][3] + ' V<br> Concessão: ' + seArray[index][1] + '<br> Prob. Falha: ' + seArray[index][6]);
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
        return subestacoes;

    }

    render() {
        return html`
            <link rel="stylesheet" href="../node_modules/leaflet/dist/leaflet.css">
            <div id="mapid" style="height: 100%"></div>
        `;
    }
}

customElements.define("my-map", Map);
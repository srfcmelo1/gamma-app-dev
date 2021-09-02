import {LitElement, html, css} from 'lit';
import {map as createMap, marker, icon,  tileLayer, layerGroup} from '../../node_modules/leaflet/dist/leaflet-src.esm.js';

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
    }
    
    firstUpdated() {
        const mapEl = this.shadowRoot.querySelector('#mapid');
        this.mymap = createMap(mapEl).setView([this.lat, this.long],this.zoom);
        let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
        this.mymap.addLayer(tileLayer(urlTemplate, {minZoom: 4}));
        this.setMarker();
    }

    setMarker() {
      var marker_icon = icon({
        iconUrl: '../node_modules/leaflet/dist/images/se_1.png',
        iconSize:     [30, 30], // size of the icon
        iconAnchor:   [0, 0], // point of the icon which will correspond to marker's location
        popupAnchor:  [-3, -3] // point from which the popup should open relative to the iconAnchor
     });
      this.getSubstations(marker_icon);
    }

    getSubstations(myicon){
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
                            let auxSE = marker([seArray[index][5], seArray[index][4]],{icon: myicon}).addTo(aux_map).bindPopup('<b>' + seArray[index][0] + '</b><br>Tensao: ' + seArray[index][3] + ' V<br> Concessão: ' + seArray[index][1] );
                            arraySE.push(auxSE);

                        } catch (error) {
                            alert(seArray[index]);
                        }
                    }                    
                }
            }
        }
        rawFile.send(null);
        var cities = layerGroup(arraySE);
    }

    render() {
        return html`
            <link rel="stylesheet" href="../node_modules/leaflet/dist/leaflet.css">
            <div id="mapid" style="height: 100%"></div>
        `;
    }
}

customElements.define("my-map", Map);
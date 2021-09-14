/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';
import '../node_modules/leaflet/dist/leaflet.js';
import 'https://cdn.skypack.dev/leaflet/dist/leaflet.js';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class MyElement extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        border: solid 1px gray;
        padding: 16px;
        max-width: 800px;
      }
    `;
  }

  static get properties() {
    return {
      /**
       * The name to say "Hello" to.
       */
      name: {type: String},

      /**
       * The number of times the button has been clicked.
       */
      count: {type: Number},
    };
  }

  constructor() {
    super();
    this.name = 'Sergio';
    this.count = 0;
  }


  
  firstUpdated() {
    const mapEl = this.shadowRoot.querySelector('#mapid');
    let map = L.map(mapEl).setView([51.505, -0.09], 13);

    let urlTemplate = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
    map.addLayer(L.tileLayer(urlTemplate, {minZoom: 4}));
  }

  render() {
    return html`
      <h1>Hello, ${this.name}!</h1>
      <button @click=${this._onClick} part="button">
        Click Count: ${this.count}
      </button>
      <slot></slot>
      <link rel="stylesheet" href="./node_modules/leaflet/dist/leaflet.css">
      <div id="mapid" style="height: 100%"></div>
    `;
  }

  _onClick() {
    this.count++;
  }
}

window.customElements.define('my-element', MyElement);

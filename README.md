# Draught

![Travis](http://img.shields.io/travis/Wildhoney/Draught.svg?style=flat)
&nbsp;
![npm](http://img.shields.io/npm/v/draught.svg?style=flat)
&nbsp;
![License MIT](http://img.shields.io/badge/License-MIT-lightgrey.svg?style=flat)

* **npm:** `npm install draught --save`

---

# Getting Started

```javascript
import create from 'draught';
import rectangle from 'draught/shape/rectangle';

const element = document.querySelector('svg');
const diagram = create(element, { width: 200, height: 200 });

const rectangle = diagram.render(rectangle).attr({ fill: 'blue' }).sendToBack();
    ```
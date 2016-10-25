## SVG Annotate Panel for Grafana

The SVG Annotate Panel loads an SVG and replaces text elements with grafana metrics.  This enables easy creation of plant visualizations or other image based diagrams. 


### Options

- **Metric Bindings**:

  The fields in this section tell SVG Annotate which elements to replace (using a jquery selector).  The order corresponds to order of the Metrics in the Metrics tab.  There are two types of fields: Label and Value.  The Label field displays the "Alias By" option in metrics.  The Value field displays the metrics value.  The binding is a jquery selector, which targets elements inside the svg.  Html attributes like ID can be added in graphics editing applications like Adobe Illustrator.  Html attributes can also be added manually because SVGs are XML.

  Example: 

  ```
	#group-selector text
  ```    

- **Image**:

  The url of the SVG source file.  Can either be relative to the Grafana root directory, or external to Grafana. 

### Screenshots

- [Screenshot of the options screen](src/img/screenshot-svg-annotate-options.png)

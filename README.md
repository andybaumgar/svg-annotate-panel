## SVG Annotate Panel for Grafana

The SVG Annotate Panel loads an SVG and replaces text elements with grafana metrics.  This enables easy creation of plant visualizations or other image based diagrams. 


### Options

- **Metric Bindings**:

  The fields in this section tell SVG Annotate which elements to replace (using a jquery selector).  The order of the bindings corresponds to the order of the Metrics in the Metrics tab.  The Label field displays the "Alias By" option in metrics.  The Value field displays the metrics value.  

  The bindings themselves are jquery selectors, which target elements inside the svg.  Html attributes like 'id', 'class', etc can be added to the svg in graphics editing applications like Adobe Illustrator or manually in a text editor.

  Example: 

  ```
	#group-selector text
  ```    

- **Image**:

  The url of the SVG source file.  Can either be relative to the Grafana root directory, or external to Grafana. 

### Screenshots

- [Screenshot of the options screen](src/img/screenshot-svg-annotate-options.png)

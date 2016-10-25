import {MetricsPanelCtrl} from 'app/plugins/sdk';
import _ from 'lodash';
import kbn from 'app/core/utils/kbn';
import TimeSeries from 'app/core/time_series';
import moment from 'moment';
import './css/svg-annotate-panel.css!';


export class SVGAnnotateCtrl extends MetricsPanelCtrl {
  // constructor($scope, $injector, private templateSrv, private $sce) { 
  constructor($scope, $injector,$rootScope, templateSrv, $sce, $http, $filter) {
    super($scope, $injector);
    this.$rootScope = $rootScope;

    var panelDefaults = {
      method: 'GET',
      errorMode: 'show',
      params_js: "{\n" +
                 " from:ctrl.range.from.format('x'),  // x is unix ms timestampppp???\n" +
                 " to:ctrl.range.to.format('x'), \n" +
                 " height:ctrl.height\n" +
                 "}",
      legend: {
        show: true, // disable/enable legend
        values: true
      },
      links: [],
      datasource: null,
      maxDataPoints: 3,
      interval: null,
      targets: [{}],
      cacheTimeout: null,
      nullPointMode: 'connected',
      legendType: 'Under graph',
      aliasColors: {},
      format: 'short',
      valueName: 'current',
      imageUrl:"",
      metricMappings:[],
      span:4
    };

    this.$sce = $sce;
    this.$http = $http;
    this.templateSrv = templateSrv;

    _.defaults(this.panel, panelDefaults);

    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('render', this.onRender.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
    this.events.on('data-error', this.onDataError.bind(this));
    this.events.on('panel-initialized', this.onPanelInitalized.bind(this));
    this.events.on('refresh', this.onRefresh.bind(this));
  }


  onRefresh(){
    // console.log("onRefresh()")
    this.replaceSVGContents();
  }

  onDataError() {
//    console.log("onDataError");
    this.series = [];
    this.replaceSVGContents();
//    console.log("data error!")
  }

  onInitEditMode() {
//    console.log("onInitEditMode");
    // this.editorTabs.splice(1,1); // remove the 'Metrics Tab'
    this.addEditorTab('Options', 'public/plugins/grafana-svg-annotate-panel/editor.html',1);
    this.editorTabIndex = 1;
  }

  onPanelInitalized() {
//    console.log("onPanelInitalized()")
    this.loadImage();
  }

  onRender() {
//    console.log("onRender");
    this.loadImage();
    this.replaceSVGContents()
  }

  parseSeries(series) {
    return _.map(this.series, (serie, i) => {
      return {
        label: serie.alias,
        data: serie.stats[this.panel.valueName],
        color: this.panel.aliasColors[serie.alias] || this.$rootScope.colors[i]
      };
    });
  }


  onDataReceived(dataList) {
//    console.log("dataList", dataList)
//    console.log("onDataReceived()");

    // parse data from grafana
    this.series = dataList.map(this.seriesHandler.bind(this));
    this.data = this.parseSeries(this.series);

    // create data mappings if they don't already exist
    if(this.panel.metricMappings.length != this.data.length){
      for (var i = 0; i < this.data.length; i++) {
        this.panel.metricMappings[i] = {label:"", data:""};
      }
    }

    this.replaceSVGContents();
  }

  loadImage(){
//    console.log("loadImage")
    // load svg into panel
    if(this.panel.imageUrl){

      var params;
      var self = this;

      this.$http({
        method: 'GET',
        url: this.panel.imageUrl,
        params: {}
      }).then(function successCallback(response) {
//        //console.log('success', response, this);
//        console.log("successCallback()")
        var html = response.data;

        self.updateContent( html );
        self.replaceSVGContents();

      }, function errorCallback(response) {
        console.warn('error', response);
        // var body = '<h1>Error</h1><pre>' + JSON.stringify(response, null, " ") + "</pre>";
        var body = "<span class='warning-text'>Error loading source image url.</span>";
        self.updateContent(body);
      });

    }
    else{
      this.updateContent("");
    }
  }

  updateContent(html) {
//    console.log("Panel: "+ this.panel.id)
//    console.log("updateContent()")
    try {
      // sce not playing nice with jquery.  Just add raw html instead
      // var content = this.$sce.trustAsHtml(this.templateSrv.replace(html, this.panel.scopedVars));

      if(html){
        $("#panel-"+ this.panel.id+" .svg-annotate-body").html(html);
      }
      else{
        html = "<span class='warning-text'>No image specified. <br>Use the options panel to specify an image source URL.</span>";
        $("#panel-"+ this.panel.id+" .svg-annotate-body").html(html);
      }


    } catch (e) {
//      console.log('Text panel error: ', e);
      this.content = this.$sce.trustAsHtml(html);
    }
  }

  replaceSVGContents(){
//    console.log("replaceSVGContents()");

    if (this.data){
      // replace values in svg with data from grafana
//      console.log("this in replaceSVGContents", this)

      for (var i = 0; i < this.data.length; i++) {

          var valueMapping = this.panel.metricMappings[i].value;
          var labelMapping = this.panel.metricMappings[i].label;
          var roundedValue = this.data[i].data.toPrecision(4)
//          console.log("replacing values in svg")

          if(labelMapping){
            $("#panel-"+ this.panel.id + " svg " + labelMapping).html(this.data[i].label)
          }
          if(valueMapping){
            $("#panel-"+ this.panel.id + " svg " + valueMapping).html(roundedValue)
          }
      }
    }

//    console.log("height", this.height)
    // this.panel.height=this.height;
  }


  seriesHandler(seriesData) {
    var series = new TimeSeries({
      datapoints: seriesData.datapoints,
      alias: seriesData.target
    });

    series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
    return series;
  }

}

SVGAnnotateCtrl.templateUrl = 'module.html';
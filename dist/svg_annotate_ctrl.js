'use strict';

System.register(['app/plugins/sdk', 'lodash', 'app/core/utils/kbn', 'app/core/time_series', 'moment', './css/svg-annotate-panel.css!'], function (_export, _context) {
  "use strict";

  var MetricsPanelCtrl, _, kbn, TimeSeries, moment, _createClass, SVGAnnotateCtrl;

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _possibleConstructorReturn(self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  }

  return {
    setters: [function (_appPluginsSdk) {
      MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
    }, function (_lodash) {
      _ = _lodash.default;
    }, function (_appCoreUtilsKbn) {
      kbn = _appCoreUtilsKbn.default;
    }, function (_appCoreTime_series) {
      TimeSeries = _appCoreTime_series.default;
    }, function (_moment) {
      moment = _moment.default;
    }, function (_cssSvgAnnotatePanelCss) {}],
    execute: function () {
      _createClass = function () {
        function defineProperties(target, props) {
          for (var i = 0; i < props.length; i++) {
            var descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.writable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
          }
        }

        return function (Constructor, protoProps, staticProps) {
          if (protoProps) defineProperties(Constructor.prototype, protoProps);
          if (staticProps) defineProperties(Constructor, staticProps);
          return Constructor;
        };
      }();

      _export('SVGAnnotateCtrl', SVGAnnotateCtrl = function (_MetricsPanelCtrl) {
        _inherits(SVGAnnotateCtrl, _MetricsPanelCtrl);

        // constructor($scope, $injector, private templateSrv, private $sce) { 
        function SVGAnnotateCtrl($scope, $injector, $rootScope, templateSrv, $sce, $http, $filter) {
          _classCallCheck(this, SVGAnnotateCtrl);

          var _this = _possibleConstructorReturn(this, (SVGAnnotateCtrl.__proto__ || Object.getPrototypeOf(SVGAnnotateCtrl)).call(this, $scope, $injector));

          _this.$rootScope = $rootScope;

          var panelDefaults = {
            method: 'GET',
            errorMode: 'show',
            params_js: "{\n" + " from:ctrl.range.from.format('x'),  // x is unix ms timestampppp???\n" + " to:ctrl.range.to.format('x'), \n" + " height:ctrl.height\n" + "}",
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
            imageUrl: "",
            metricMappings: [],
            span: 4
          };

          _this.$sce = $sce;
          _this.$http = $http;
          _this.templateSrv = templateSrv;

          _.defaults(_this.panel, panelDefaults);

          _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
          _this.events.on('render', _this.onRender.bind(_this));
          _this.events.on('data-received', _this.onDataReceived.bind(_this));
          _this.events.on('data-error', _this.onDataError.bind(_this));
          _this.events.on('panel-initialized', _this.onPanelInitalized.bind(_this));
          _this.events.on('refresh', _this.onRefresh.bind(_this));
          return _this;
        }

        _createClass(SVGAnnotateCtrl, [{
          key: 'onRefresh',
          value: function onRefresh() {
            // console.log("onRefresh()")
            this.replaceSVGContents();
          }
        }, {
          key: 'onDataError',
          value: function onDataError() {
            //    console.log("onDataError");
            this.series = [];
            this.replaceSVGContents();
            //    console.log("data error!")
          }
        }, {
          key: 'onInitEditMode',
          value: function onInitEditMode() {
            //    console.log("onInitEditMode");
            // this.editorTabs.splice(1,1); // remove the 'Metrics Tab'
            this.addEditorTab('Options', 'public/plugins/grafana-svg-annotate-panel/editor.html', 1);
            this.editorTabIndex = 1;
          }
        }, {
          key: 'onPanelInitalized',
          value: function onPanelInitalized() {
            //    console.log("onPanelInitalized()")
            this.loadImage();
          }
        }, {
          key: 'onRender',
          value: function onRender() {
            //    console.log("onRender");
            this.loadImage();
            this.replaceSVGContents();
          }
        }, {
          key: 'parseSeries',
          value: function parseSeries(series) {
            var _this2 = this;

            return _.map(this.series, function (serie, i) {
              return {
                label: serie.alias,
                data: serie.stats[_this2.panel.valueName],
                color: _this2.panel.aliasColors[serie.alias] || _this2.$rootScope.colors[i]
              };
            });
          }
        }, {
          key: 'onDataReceived',
          value: function onDataReceived(dataList) {
            //    console.log("dataList", dataList)
            //    console.log("onDataReceived()");

            // parse data from grafana
            this.series = dataList.map(this.seriesHandler.bind(this));
            this.data = this.parseSeries(this.series);

            // create data mappings if they don't already exist
            if (this.panel.metricMappings.length != this.data.length) {
              for (var i = 0; i < this.data.length; i++) {
                this.panel.metricMappings[i] = { label: "", data: "" };
              }
            }

            this.replaceSVGContents();
          }
        }, {
          key: 'loadImage',
          value: function loadImage() {
            //    console.log("loadImage")
            // load svg into panel
            if (this.panel.imageUrl) {

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

                self.updateContent(html);
                self.replaceSVGContents();
              }, function errorCallback(response) {
                console.warn('error', response);
                // var body = '<h1>Error</h1><pre>' + JSON.stringify(response, null, " ") + "</pre>";
                var body = "<span class='warning-text'>Error loading source image url.</span>";
                self.updateContent(body);
              });
            } else {
              this.updateContent("");
            }
          }
        }, {
          key: 'updateContent',
          value: function updateContent(html) {
            //    console.log("Panel: "+ this.panel.id)
            //    console.log("updateContent()")
            try {
              // sce not playing nice with jquery.  Just add raw html instead
              // var content = this.$sce.trustAsHtml(this.templateSrv.replace(html, this.panel.scopedVars));

              if (html) {
                $("#panel-" + this.panel.id + " .svg-annotate-body").html(html);
              } else {
                html = "<span class='warning-text'>No image specified. <br>Use the options panel to specify an image source URL.</span>";
                $("#panel-" + this.panel.id + " .svg-annotate-body").html(html);
              }
            } catch (e) {
              //      console.log('Text panel error: ', e);
              this.content = this.$sce.trustAsHtml(html);
            }
          }
        }, {
          key: 'replaceSVGContents',
          value: function replaceSVGContents() {
            //    console.log("replaceSVGContents()");

            if (this.data) {
              // replace values in svg with data from grafana
              //      console.log("this in replaceSVGContents", this)

              for (var i = 0; i < this.data.length; i++) {

                var valueMapping = this.panel.metricMappings[i].value;
                var labelMapping = this.panel.metricMappings[i].label;
                var roundedValue = this.data[i].data.toPrecision(4);
                //          console.log("replacing values in svg")

                if (labelMapping) {
                  $("#panel-" + this.panel.id + " svg " + labelMapping).html(this.data[i].label);
                }
                if (valueMapping) {
                  $("#panel-" + this.panel.id + " svg " + valueMapping).html(roundedValue);
                }
              }
            }

            //    console.log("height", this.height)
            // this.panel.height=this.height;
          }
        }, {
          key: 'seriesHandler',
          value: function seriesHandler(seriesData) {
            var series = new TimeSeries({
              datapoints: seriesData.datapoints,
              alias: seriesData.target
            });

            series.flotpairs = series.getFlotPairs(this.panel.nullPointMode);
            return series;
          }
        }]);

        return SVGAnnotateCtrl;
      }(MetricsPanelCtrl));

      _export('SVGAnnotateCtrl', SVGAnnotateCtrl);

      SVGAnnotateCtrl.templateUrl = 'module.html';
    }
  };
});
//# sourceMappingURL=svg_annotate_ctrl.js.map

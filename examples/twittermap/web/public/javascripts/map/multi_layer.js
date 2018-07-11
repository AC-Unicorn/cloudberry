angular.module('cloudberry.map')
  .controller('multiLayerCtrl', function($timeout, $scope, $rootScope, $window, $http, $compile, cloudberryConfig, cloudberry, leafletData, Cache, createLayerService) {
    
    cloudberry.logicalLevel = 'state';
    cloudberry.parameters.layers = {
        countmaps:{},
        polygons:{}
    };
    $scope.watchVariables = {};
    
    var styles = {
        initStyle: {
          weight: 0.5,
          fillOpacity: 0,
          color: "white"
        },
        stateStyle: {
          fillColor: "#f7f7f7",
          weight: 0.5,
          opacity: 1,
          color: "#92d1e1",
          fillOpacity: 0
        },
        stateUpperStyle: {
          fillColor: "#f7f7f7",
          weight: 0.5,
          opacity: 1,
          color: "#92d1e1",
          fillOpacity: 0
        },
        countyStyle: {
          fillColor: "#f7f7f7",
          weight: 0.5,
          opacity: 1,
          color: "#92d1e1",
          fillOpacity: 0
        },
        countyUpperStyle: {
          fillColor: "#f7f7f7",
          weight: 0.5,
          opacity: 1,
          color: "#92d1e1",
          fillOpacity: 0
        },
        cityStyle: {
          fillColor: "#f7f7f7",
          weight: 0.5,
          opacity: 1,
          color: "#92d1e1",
          fillOpacity: 0
        },
        hoverStyle: {
          weight: 0.7,
          color: "#666",
          fillOpacity: 0
        },
        colors: [ "#ffffff", "#92d1e1", "#4393c3", "#2166ac", "#f4a582", "#d6604d", "#b2182b"],
        sentimentColors: ["#ff0000", "#C0C0C0", "#00ff00"]
      }
    
    // initialize
    
    $rootScope.$on('multiLayer', function (event, data) {
        var layer_name = cloudberry.parameters.maptype;
        
        var layer_type = 'polygons';
        if(layer_name==='countmap')
            layer_type = 'countmaps';
        //deactive unused layers
        /*if(layer_name!='heatmap' || layer_name!='pinmap'){

                    $scope.map.removeLayer(cloudberry.parameters.layers[layer_type]['heatmap'].layer);
                    $scope.map.removeLayer(cloudberry.parameters.layers[layer_type]['pinmap'].layer);

                    
                    cloudberry.parameters.layers[layer_type]['heatmap'].active = 0;
                    cloudberry.parameters.layers[layer_type]['pinmap'].active = 0;

        
        }*/
        
        for(var key in cloudberry.parameters.layers)
            for(var k in cloudberry.parameters.layers[key])
                if(k!=layer_name || key!=layer_type)
                    {   
                        
                        if(cloudberry.parameters.layers[key][k].layer && k!='polygon'){
                            $scope.map.removeLayer(cloudberry.parameters.layers[key][k].layer);
                            cloudberry.parameters.layers[key][k].clear();
                            cloudberry.parameters.layers[key][k].active = 0;
                        }
                    }
                
        //activate selected layer
        if (cloudberry.parameters.layers[layer_type][layer_name].active == 0 ){

            var current_layer = cloudberry.parameters.layers[layer_type][layer_name];
            if (typeof current_layer.activate === "function"){
                current_layer.activate();
            }
            current_layer.active = 1;
            $scope.map.addLayer(current_layer.layer);
        }
        

        
        cloudberry.query(cloudberry.parameters);
    })
    
    function addLayer(layerID, active, parameters,type){
        
        createLayerService[layerID](parameters).then(function(layer){
            cloudberry.parameters.layers[type][layerID] = layer;
            cloudberry.parameters.layers[type][layerID].init($scope).then(function(){
                cloudberry.parameters.layers[type][layerID].active = active;
                for (var key in layer.watchVariables){
                    $scope.watchVariables[key] = layer.watchVariables[key];
                }
                if (cloudberry.parameters.layers[type][layerID].active){
                    $scope.map.addLayer(cloudberry.parameters.layers[type][layerID].layer);
                }
            });
        });

    }
    
  
    
    var heatmapParameters = {
        id: "heatmap",
        dataset: "twitter.ds_tweet",
    }
    addLayer("heatmap", 0, heatmapParameters,'polygons');
    
    var pinmapParameters = {
        id: "pinmap",
        dataset: "twitter.ds_tweet",
        pinStyle: {
            opacity: 0.8,
            radius: 1.2,//80,
            useAbsoluteRadius: false,//true,
            color: "#00aced",//"#0084b4"
            noMask: true,
            lineColor: "#00aced"//"#00aced"
        },
        highlightPinStyle: {
            radius : 6,
            color : "#0d3e99",
            weight : 3,
            fillColor : "#b8e3ff",
            fillOpacity : 1.0
        }
    }
    
    addLayer("pinmap", 0, pinmapParameters,'polygons');
    addLayer("polygon", 1, {},'polygons');
    addLayer('countmap',1,{},'countmaps');
    
    
        

    
    $scope.$on("leafletDirectiveMap.zoomend", function() {
        for (var key in cloudberry.parameters.layers['polygons']) {
            var current_layer = cloudberry.parameters.layers['polygons'][key];
            if (current_layer.active && typeof current_layer.zoom === "function"){
                current_layer.zoom();
            }
        }
        for (var key in cloudberry.parameters.layers['countmaps']){
            var currentLayer = cloudberry.parameters.layers['countmaps'][key];
            if(currentLayer.active && typeof currentLayer.zoom === 'function')
                current_layer.zoom();
        }
    
    });
    
    $scope.$on("leafletDirectiveMap.dragend", function() {
        for (var key in cloudberry.parameters.layers['polygons']) {
            var current_layer = cloudberry.parameters.layers['polygons'][key];
            if (current_layer.active && typeof current_layer.drag === "function"){
                current_layer.drag();
            }
        }
        for (var key in cloudberry.parameters.layers['countmaps']){
            var currentLayer = cloudberry.parameters.layers['countmaps'][key];
            if(currentLayer.active && typeof currentLayer.zoom === 'function')
                current_layer.drag();
        }
    });
    
    


    
    
    
    $scope.$watchCollection(
        function() {
            var obj = {}
        
            for (var key in $scope.watchVariables){
                obj[key] = eval($scope.watchVariables[key]);
            }
          
            return obj;
        },
        function(newResult, oldValue) {
            var layer_name = cloudberry.parameters.maptype;  
            var result_name = layer_name + "MapResult";  
            var current_layer =  cloudberry.parameters.layers['polygons'][layer_name];
            if(!current_layer)
                current_layer =  cloudberry.parameters.layers['countmaps'][layer_name];
            if (newResult[result_name] !== oldValue[result_name]) {
                $scope.result = newResult[result_name];
                if (Object.keys($scope.result).length !== 0) {
                    $scope.status.init = false;
                    current_layer.draw($scope.result);
                } else {
                    current_layer.draw($scope.result);
                }
            }
            if(newResult['doNormalization'] !== oldValue['doNormalization']) {
                $scope.doNormalization = newResult['doNormalization'];
            
            }
            if(newResult['doSentiment'] !== oldValue['doSentiment']) {
                $scope.doSentiment = newResult['doSentiment'];
                if($scope.doSentiment) {
                    $scope.infoPromp = "Score";  // change the info promp
                } else {
                    $scope.infoPromp = config.mapLegend;
                }
            
            }
           
        
        });
    
    
    
    
  });

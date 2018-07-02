angular.module('cloudberry.map')
  .controller('multiLayerCtrl', function($timeout, $scope, $rootScope, $window, $http, $compile, cloudberryConfig, cloudberry, leafletData, Cache, createLayerService) {
    
    cloudberry.parameters.layers = {};
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
    
        
        
        if(layer_name!='heatmap' || layer_name!='pinmap'){

                    $scope.map.removeLayer(cloudberry.parameters.layers['heatmap'].layer);
                    $scope.map.removeLayer(cloudberry.parameters.layers['pinmap'].layer);

                    
                    cloudberry.parameters.layers['heatmap'].active = 0;
                    cloudberry.parameters.layers['pinmap'].active = 0;

        
        }
        if (layer_name==='heatmap' || layer_name === 'pinmap' && cloudberry.parameters.layers[layer_name].active == 0 ){
            
            $scope.setStyles(styles);
            $scope.resetPolygonLayers();
            if (typeof cloudberry.parameters.layers[layer_name].activate === "function"){
                cloudberry.parameters.layers[layer_name].activate();
            }
            cloudberry.parameters.layers[layer_name].active = 1;
            $scope.map.addLayer(cloudberry.parameters.layers[layer_name].layer);
        }
        

        
        cloudberry.query(cloudberry.parameters);
    })
    
    function addLayer(layerID, active, parameters){
        createLayerService[layerID](parameters).then(function(layer){
            cloudberry.parameters.layers[layerID] = layer;
            cloudberry.parameters.layers[layerID].init($scope).then(function(){
                cloudberry.parameters.layers[layerID].active = active;
                for (var key in layer.watchVariables){
                    $scope.watchVariables[key] = layer.watchVariables[key];
                }
                if (cloudberry.parameters.layers[layerID].active){
                    $scope.map.addLayer(cloudberry.parameters.layers[layerID].layer);
                }
            });
        });
    }
    
  
    
    var heatmapParameters = {
        id: "heatmap",
        dataset: "twitter.ds_tweet",
    }
    addLayer("heatmap", 0, heatmapParameters);
    
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
    
    addLayer("pinmap", 0, pinmapParameters);

    
    

    
    $scope.$on("leafletDirectiveMap.zoomend", function() {
        for (var key in cloudberry.parameters.layers) {
            if (cloudberry.parameters.layers[key].active && typeof cloudberry.parameters.layers[key].zoom === "function"){
                cloudberry.parameters.layers[key].zoom();
            }
        }
    });
    
    $scope.$on("leafletDirectiveMap.dragend", function() {
        for (var key in cloudberry.parameters.layers) {
            if (cloudberry.parameters.layers[key].active && typeof cloudberry.parameters.layers[key].drag === "function"){
                cloudberry.parameters.layers[key].drag();
            }
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
        
            if (newResult[result_name] !== oldValue[result_name]) {
                $scope.result = newResult[result_name];
                if (Object.keys($scope.result).length !== 0) {
                    $scope.status.init = false;
                    cloudberry.parameters.layers[layer_name].draw($scope.result);
                } else {
                    cloudberry.parameters.layers[layer_name].draw($scope.result);
                }
            }
        }
    );
    
    
    
    
  });

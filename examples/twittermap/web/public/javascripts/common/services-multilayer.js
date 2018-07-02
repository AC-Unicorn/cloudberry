angular.module('cloudberry.common')
    .service('createLayerService', function(multilayerHeatmap,multilayerPinmap){
        var createLayerService = {
            polygon: {},
            countmap: {},
            heatmap: multilayerHeatmap.createLayer,
            pinmap: multilayerPinmap.createLayer
        };
        
        return createLayerService;
    });

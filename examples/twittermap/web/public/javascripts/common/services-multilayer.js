angular.module('cloudberry.common')
    .service('createLayerService', function(multilayerHeatmap,multilayerPinmap,multilayerPolygon){
        var createLayerService = {
            polygon: {},
            countmap: multilayerPolygon.createLayer,
            heatmap: multilayerHeatmap.createLayer,
            pinmap: multilayerPinmap.createLayer
        };
        
        return createLayerService;
    });

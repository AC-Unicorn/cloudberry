angular.module('cloudberry.common')
    .service('createLayerService', function(multilayerHeatmap,multilayerPinmap,multilayerPolygon){
        var createLayerService = {
            polygon:multilayerPolygon.createLayer,
            countmap: {},
            heatmap: multilayerHeatmap.createLayer,
            pinmap: multilayerPinmap.createLayer
        };
        
        return createLayerService;
    });

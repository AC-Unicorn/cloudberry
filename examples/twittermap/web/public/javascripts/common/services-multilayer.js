angular.module('cloudberry.common')
    .service('createLayerService', function(multilayerHeatmap,multilayerPinmap,multilayerPolygon,multilayerCountmap){
        var createLayerService = {
            polygon:multilayerPolygon.createLayer,
            countmap: multilayerCountmap.createLayer,
            heatmap: multilayerHeatmap.createLayer,
            pinmap: multilayerPinmap.createLayer
        };
        
        return createLayerService;
    });

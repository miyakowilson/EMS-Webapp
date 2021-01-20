'use strict';

angular.module('mms.directives')
.directive('mmsViewPlot', ['$compile','$window', mmsViewPlot]);

function mmsViewPlot($compile, $window) {
    var mmsViewLink = function(scope, domElement, element, attrs, mmsViewCtrl) {
        if ( scope.plot.type === "Plot") {
            if ( scope.plot.config !== undefined  && scope.plot.config.trim().length !== 0){
                try{
                    scope.plot.config = JSON.parse(scope.plot.config.replace(/'/g, '"'));
                    if( scope.plot.config.ptype !== undefined) {
                        scope.plot.ptype = scope.plot.config.ptype;
                    }
                }
                catch (err){
                   console.log("error ignored"); 
                }
            }
			if (scope.plot.config.startsWith("d3-")) //d3-zoomable-sunburst
				domElement[0].innerHTML = '<figure><mms-' + scope.plot.config + '-plot plot="plot"></mms-' + scope.plot.config + '-plot><figcaption>{{plot.title}}</figcaption></figure>';
			else
				domElement[0].innerHTML = '<figure><mms-' + scope.plot.ptype + '-plot plot="plot"></mms-' + scope.plot.ptype + '-plot><figcaption>{{plot.title}}</figcaption></figure>';
            $compile(domElement.contents())(scope);
        }
    };
    return {
        restrict: 'E',
        require: '?^mmsView',
        scope: {
            plot: '<mmsPlot'
        },
        link: mmsViewLink
    };
}
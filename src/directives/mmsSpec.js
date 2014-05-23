'use strict';

angular.module('mms.directives')
.directive('mmsSpec', ['ElementService', '$compile', mmsSpec]);

/**
 * @ngdoc directive
 * @name mms.directives.directive:mmsSpec
 *
 * @requires mms.ElementService
 * @requires $compile
 *
 * @restrict E
 *
 * @description
 * Outputs a "spec window" of the element whose id is specified. Spec includes name,
 * documentation, and value if the element is a property. Also last modified time, 
 * last user, element id. Fields are editable and will be saved to server on clicking 
 * save button. Documentation and string values can have html and can transclude other
 * element properties.  
 *
 * @param {string} mmsEid The id of the element
 * @param {string} mmsWs Workspace to use, defaults to master
 * @param {string} mmsVersion Version can be alfresco version number or timestamp, default is latest
 * @param {string} mmsEditField One of ["all", "none", "name", "doc", or "val" if property]
 * @param {Array=} mmsCfElements Array of element objects as returned by ElementService
 *      that can be transcluded into documentation or string values. Regardless, transclusion
 *      allows keyword searching elements to transclude from alfresco
 */
function mmsSpec(ElementService, $compile) {
    var heading = '<div>Last Modified: {{element.lastModified | date:\'M/d/yy h:mm a\'}} by {{element.author}}</div>';
    var nameTemplate = '<div>Name: {{element.name}} </div>';
    var nameEditTemplate = '<div>Name: <input class="form-control" type="text" ng-model="edit.name"></input></div>';
    
    var docTemplate = '<div>Documentation:</div><div ng-bind-html="element.documentation"></div>';
    var docEditTemplate = '<div>Documentation:</div><div ng-model="edit.documentation" mms-froala mms-cf-elements="mmsCfElements"></div>';
    var docEditPlain = '<div>Documentation:</div><textarea ng-model="edit.documentation"></textarea>';
    
    var valueStringEdit = '<div>Value:</div><div ng-repeat="val in values" ng-model="val.value" mms-froala mms-cf-elements="mmsCfElements"></div>';
    var valueBooleanEdit = '<div>Value:</div><input ng-repeat="val in values" type="checkbox" ng-model="val.value"></input>';
    var valueNumberEdit = '<div>Value:</div><input ng-repeat="val in values" type="number" ng-model="val.value"></input>';
    
    var saveTemplate = '<div><button class="btn btn-primary btn-sm" ng-click="save()">Save</button></div>';
    var template = '';
    
    var mmsSpecLink = function(scope, element, attrs) {
        scope.$watch('mmsEid', function(newVal, oldVal) {
            if (!newVal) {
                element.empty();
                return;
            }
            ElementService.getElement(scope.mmsEid, false, scope.mmsWs, scope.mmsVersion)
            .then(function(data) {
                scope.element = data;
                template = '' + heading;
                if (scope.mmsEditField === 'none' || !scope.element.editable) {
                    template += nameTemplate + docTemplate;
                    element.empty();
                    element.append(template);
                    $compile(element.contents())(scope); 
                } else {
                    ElementService.getElementForEdit(scope.mmsEid, false, scope.mmsWs).then(function(data) {
                        scope.edit = data;
                        template += nameEditTemplate + docEditTemplate;
                        if (scope.edit.type === 'Property' && angular.isArray(scope.edit.value)) {
                            scope.values = [];
                            for (var i = 0; i < scope.edit.value.length; i++) {
                                scope.values.push({value: scope.edit.value[i]});
                            }
                            if (scope.edit.valueType === 'LiteralString')
                                template += valueStringEdit;
                            else if (scope.edit.valueType === 'LiteralBoolean')
                                template += valueBooleanEdit;
                            else if (scope.edit.valueType === 'LiteralInteger' || 
                                    scope.edit.valueType === 'LiteralUnlimitedNatural' ||
                                    scope.edit.valueType === 'LiteralReal')
                                template += valueNumberEdit;
                        }
                        template += saveTemplate;
                        element.empty();
                        element.append(template);
                        $compile(element.contents())(scope); 
                    });
                }
            });
        });
        scope.save = function() {
            if (scope.edit.type === 'Property' && angular.isArray(scope.edit.value)) {
                var i = 0;
                for (i = 0; i < scope.values.length; i++) {
                    if (scope.edit.value.length < i+1) {
                        scope.edit.value.push(scope.values[i].value);
                    } else
                        scope.edit.value[i] = scope.values[i].value;
                }
                scope.edit.value.length = i;
            }
            ElementService.updateElement(scope.edit, scope.mmsWs)
            .then(function() {
                
            });
        };
    };

    return {
        restrict: 'E',
        //template: template,
        scope: {
            mmsEid: '@',
            mmsEditField: '@', //all or none or individual field
            mmsWs: '@',
            mmsVersion: '@',
            mmsCfElements: '=' //array of element objects
        },
        link: mmsSpecLink
    };
}
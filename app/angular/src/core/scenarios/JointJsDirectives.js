define(['./module', 'joint', 'jquery','lodash', 'angular'], function (module, joint, $, _, angular) {
  'use strict';


  joint.shapes.devs.AngularAtomicView = joint.shapes.devs.ModelView;
  joint.shapes.devs.QueryInputView = joint.shapes.devs.ModelView;
  joint.shapes.devs.DisplayCampaignView = joint.shapes.devs.ModelView;
  joint.shapes.devs.EmailCampaignView = joint.shapes.devs.ModelView;
  joint.shapes.devs.AbnNodeView = joint.shapes.devs.ModelView;
  joint.shapes.devs.CoupledView = joint.shapes.devs.ModelView;

  joint.shapes.devs.AngularAtomic = joint.shapes.devs.Model.extend({

    defaults: joint.util.deepSupplement({

        type: 'devs.AngularAtomic',
        size: { width: 200, height: 120 },
        attrs: {

            '.body': { 'rx': 0, 'ry': 0 },
            '.label': { text: '' },
            '.inPorts .port circle': {  magnet: 'passive', type: 'input' },
            '.outPorts .port circle': { type: 'output'},
            '.inPorts .port-label':{ x: -8, y: 15, fill: '#000000', 'text-anchor': 'end', type: 'input' },
            '.outPorts .port-label':{ x: 8, y: 15, fill: '#000000',type: 'output'}
        }

    }, joint.shapes.devs.Model.prototype.defaults),
    getPortAttrs: function(portName, index, total, selector, type) {

        var attrs = {};

        var portClass = 'port' + index;
        var portSelector = selector + '>.' + portClass;
        var portLabelSelector = portSelector + '>.port-label';
        var portBodySelector = portSelector + '>.port-body';

        attrs[portLabelSelector] = { text: portName };
        attrs[portBodySelector] = { port: { id: portName || _.uniqueId(type) , type: type } };
        attrs[portSelector] = { ref: '.body', 'ref-y': (index + 0.5  ) * (1 / total) };

        if (selector === '.outPorts') { attrs[portSelector]['ref-dx'] = 0; }

        return attrs;
    }

});



  function createNode(node) {
    var outs = ["ON_GOAL", "ON_VISIT"];
    var ins = ["in"];

    if(node.type === 'QUERY_INPUT') {
      outs = ["OUT"];
    } else if(node.type === 'ABN_NODE'){
      outs = ["OUT"];
    } else if(node.type === 'EMAIL_CAMPAIGN'){
      outs = [];
    }
    var element = new joint.shapes.devs.AngularAtomic({
      position: { x: node.x , y: node.y  },
      type: "devs."+_.capitalize(_.camelCase(node.type)),
      inPorts: ins,
      outPorts: outs

    });
    element.prop('ngObject', node);

    return element;

  }

  function createLink(edge, source, sourcePort, target) {
    var element = new joint.shapes.devs.Link({
      source: {id: source.id, selector: source.getPortSelector(sourcePort)},
      target: {id: target.id, selector: target.getPortSelector('in')},
      router: { name: 'manhattan' },
      connector: { name: 'rounded' },
      attrs: {
        '.marker-target': { d: 'M 10 0 L 0 5 L 10 10 z' }
      }


    });
    element.attr('.label/text', edge.id);
    element.prop('ngObject', edge);
    return element;

  }

  function findById(id) {
    return function(e) {
      return e.get("ngObject").id === id;
    };
  }

  module.directive('jsJointCanvas', function ($log, $compile, $interpolate) {

   var def = {
       restrict: 'E',
       scope: {
           onConnection: '=onConnection',
           onDeconnect: '=onDeconnect',
           storyline: '=storyline',
           campaignsInfo: '=',
           labelTemplate: '=',
           zoom: '=',
           disabled: '@',
           x: '=',
           y: '='
       },
       controller: function ($scope) {
           this.scope = $scope;
       },
       transclude: true,
       template: '<div ng-transclude></div>',
       link: function(scope, element, attr){
         var graph = new joint.dia.Graph();
         var paper = new joint.dia.Paper({
           el: element,
           width: 1000,
           height: 400,
           model: graph,
           gridSize: 10,
           snapLinks: true,
           multiLinks: false,
           linkPinning: false,
           interactive: scope.disabled !== "true",
           defaultLink: new joint.shapes.devs.Link({
             router: { name: 'manhattan' },
             connector: { name: 'rounded' },
             attrs: {
               '.marker-target': {d: 'M 10 0 L 0 5 L 10 10 z' }
             }

           }),
           validateConnection: function(cellViewS, magnetS, cellViewT, magnetT, end, linkView) {
             // Prevent linking from input ports.
             if (magnetS && magnetS.getAttribute('type') === 'input') {
               return false;
             }
             // Prevent linking from output ports to input ports within one element.
             if (cellViewS === cellViewT) {
               return false;
             }
             // Prevent linking to input ports.
             return magnetT && magnetT.getAttribute('type') === 'input';
           },
           // Enable marking available cells & magnets
           markAvailable: true
         });
         scope.graph = graph;
         scope.paper = paper;
         scope.$watchCollection('storyline["edges"]', function (newValue, oldValue, scope) {
           $log.log("watched edges", arguments);
           if(newValue !== undefined) {
             $log.log("modified storyline", arguments);
             var added = _.difference(newValue, oldValue);
             $log.log("added : ", added);
             var cells = _(added).forEach(function (edge) {
               var elements = graph.getElements();
               var sourceId = _(elements).find(findById(edge.source.id));
               var targetId = _(elements).find(findById(edge.target.id));
               var successors = graph.getSuccessors(sourceId, false);

               if(!_(successors).includes(targetId)) {
                 var c = createLink(edge,sourceId, edge.handler, targetId);
                 $log.log("adding edge : ", edge);
                 c.addTo(graph).reparent();
                 return c;
               } else {
                 var links = graph.getConnectedLinks(sourceId, false);
                 var link = _(links).find(function(l) {return l.getTargetElement() === targetId;});
                 link.set('ngObject', edge);
                 $log.log("adding ngObject to ", link, edge);
               }
               });


             $log.log("adding to graph", cells.value());
//             graph.addCells(cells.value());


           }
         });

         scope.jsJointGraph = graph;
         scope.$watch('zoom', function(newVal, oldVal){

         });
      graph.on("remove", function(cell) {
        if(cell.isLink()){
          var edge =  cell.get("ngObject");
          scope.onDeconnect(cell,edge);

        }
        scope.$apply();
      });


      graph.on("change:source change:target", function(link) {
          $log.log("change target or source", arguments);
          var sourcePort = link.get('source').port;
          var sourceId = link.get('source').id;
          var targetPort = link.get('target').port;
          var targetId = link.get('target').id;
          if(sourceId && targetId) {
            var sourceCell = graph.getCell(sourceId);
            var targetCell = graph.getCell(targetId);
            $log.log(sourcePort, sourceCell.get("ngObject"), targetCell.get("ngObject"));
            var source = sourceCell.get("ngObject");
            var target = targetCell.get("ngObject");

            scope.onConnection(link,sourcePort, source, target);
            scope.$apply();
          }
          if(targetId === undefined) {
            var edge =  link.get("ngObject");
            scope.onDeconnect(link);
            scope.$apply();
          }
        });


         $(element).bind('mousewheel', function(e){
           if(e.originalEvent.wheelDelta /120 > 0) {
             scope.zoom += 10;
             scope.$apply();
           }
           else{
             scope.zoom -= 10;
             scope.$apply();
           }
         });


         scope.$watch('x', function(newVal, oldVal){
           $(element).css('left', newVal);
         });
         scope.$watch('y', function(newVal, oldVal){
           $(element).css('top', newVal);
         });


       }
   };


    return def;
  });


  function updateJointHtmlDiv(cell, element, margin) {
   var bbox = cell.getBBox();
   element.css({ width: bbox.width - margin * 2 ,  left: bbox.x +margin, top: bbox.y+margin, transform: 'rotate(' + (cell.get('angle') || 0) + 'deg)' });

  }

  module.directive('jsJointNode', function ($log, $compile, $interpolate) {
    var def = {
      restrict: 'E',
      require: '^jsJointCanvas',
      transclude: true,
      replace: true,
      scope:{
        node: "="
      },
      template: '<div class="html-element" ng-transclude ></div>',
      link: function (scope, element, attrs, jsJointCanvas) {
        $log.log("initializing with ", scope.storyline);

        var cell = createNode(scope.node);
        var padding = { top: 10, right: 10, bottom: 10, left: 10 };
        updateJointHtmlDiv(cell, element, 8);
        cell.on('change:position', function() {
          var position = cell.get('position');
          updateJointHtmlDiv(cell, element, 8);
          scope.node.y = position.y;
          scope.node.x = position.x;
          jsJointCanvas.scope.paper.fitToContent({padding: padding});
          scope.$apply();

        });
        jsJointCanvas.scope.graph.addCells([cell]);

        jsJointCanvas.scope.paper.fitToContent({padding: padding});
        element.on('$destroy', function () {
          $log.log("removing ", element);
          cell.remove();
        });



      }
    };
    return def;
  });


  /**
   * CONNECTION
   */
  module.directive('jsJointConnection', function ($timeout, $log) {
    var def = {
      restrict: 'E',
      require: '^jsJointCanvas',
      scope: {
        ngClick: '&ngClick',
        ngModel: '=ngModel'
      },
      link: function (scope, element, attrs, jsJointCanvas) {





        var graph = jsJointCanvas.scope.jsJointGraph;



      }
    };
    return def;
  });
});

define(function(require) {

    var Container = require("./Container");
    var ko = require("knockout");
    var ListItem = require("../meta/ListItem");
    var _ = require('_');

    var List = Container.derive(function() {

        return {
            
            dataSource : ko.observableArray([]),

            itemView : ko.observable(ListItem), // item component constructor
            
            selected : ko.observableArray([]),

            multipleSelect : false,
            dragSort : false
        }
    }, {
        type : "LIST",
        
        css : "list",

        template : '<div data-bind="foreach:children" >\
                        <div class="qpf-container-item">\
                            <div data-bind="qpf_view:$data"></div>\
                        </div>\
                    </div>',

        eventsProvided : _.union(Container.prototype.eventsProvided, "select"),

        initialize : function() {

            var oldArray = _.clone(this.dataSource());
            var self = this;
            
            this.dataSource.subscribe(function(newArray) {
                this._update(oldArray, newArray);
                oldArray = _.clone(newArray);
                _.each(oldArray, function(item, idx) {
                    if(ko.utils.unwrapObservable(item.selected)) {
                        this.selected(idx)
                    }
                }, this);
            }, this);

            this.selected.subscribe(function(idxList) {
                this._unSelectAll();

                _.each(idxList, function(idx) {
                    var child = this.children()[idx];
                    child &&
                        child.$el.addClass("selected");
                }, this)

                self.trigger("select", this._getSelectedData());
            }, this);

            this.$el.delegate(".qpf-container-item", "click", function() {
                var context = ko.contextFor(this);
                self.selected([context.$index()]);
            });

            this._update([], oldArray);
        },

        _getSelectedData : function() {
            var dataSource = this.dataSource();
            var result = _.map(this.selected(), function(idx) {
                return dataSource[idx];
            }, this);
            return result;
        },

        _update : function(oldArray, newArray) {

            var children = this.children();
            var ItemView = this.itemView();
            var result = [];

            var differences = ko.utils.compareArrays(oldArray, newArray);
            var newChildren = [];
            _.each(differences, function(item) {
                if(item.status === "retained") {
                    var index = oldArray.indexOf(item.value);
                    result[ index ] = children[ index ];
                }else if(item.status === "added") {
                    var newChild = new ItemView({
                        attributes : item.value
                    });
                    result[item.index] = newChild;
                    children.splice(item.index, 0, newChild);
                    newChildren.push(newChild);
                }
            }, this)
            this.children(result);
            // render after it is appended in the dom
            // so the component like range will be resized proply
            _.each(newChildren, function(child) {
                child.render();
            });
        },

        _unSelectAll : function() {
            _.each(this.children(), function(child, idx) {
                if(child) {
                    child.$el.removeClass("selected")
                }
            }, this);
        }

    });

    Container.provideBinding("list", List);

    return List;
});
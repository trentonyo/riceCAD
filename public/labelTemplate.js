(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['label'] = template({"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<span class=\"project_label\"\r\n      style=\"background-color: "
    + alias4(((helper = (helper = lookupProperty(helpers,"background-color") || (depth0 != null ? lookupProperty(depth0,"background-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"background-color","hash":{},"data":data,"loc":{"start":{"line":2,"column":31},"end":{"line":2,"column":51}}}) : helper)))
    + ";\r\n              color: "
    + alias4(((helper = (helper = lookupProperty(helpers,"text-color") || (depth0 != null ? lookupProperty(depth0,"text-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text-color","hash":{},"data":data,"loc":{"start":{"line":3,"column":21},"end":{"line":3,"column":35}}}) : helper)))
    + "\">\r\n    "
    + alias4(((helper = (helper = lookupProperty(helpers,"tag") || (depth0 != null ? lookupProperty(depth0,"tag") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"tag","hash":{},"data":data,"loc":{"start":{"line":4,"column":4},"end":{"line":4,"column":11}}}) : helper)))
    + "\r\n</span>";
},"useData":true});
})();
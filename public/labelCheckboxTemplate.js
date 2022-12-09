(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['labelCheckbox'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "checked";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<label class=\"project_label\"\r\n    style=\" background-color: "
    + alias4(((helper = (helper = lookupProperty(helpers,"background-color") || (depth0 != null ? lookupProperty(depth0,"background-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"background-color","hash":{},"data":data,"loc":{"start":{"line":2,"column":30},"end":{"line":2,"column":50}}}) : helper)))
    + ";\r\n            color: "
    + alias4(((helper = (helper = lookupProperty(helpers,"text-color") || (depth0 != null ? lookupProperty(depth0,"text-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text-color","hash":{},"data":data,"loc":{"start":{"line":3,"column":19},"end":{"line":3,"column":33}}}) : helper)))
    + " \"\r\n           data-background-color=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"background-color") || (depth0 != null ? lookupProperty(depth0,"background-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"background-color","hash":{},"data":data,"loc":{"start":{"line":4,"column":34},"end":{"line":4,"column":54}}}) : helper)))
    + "\"\r\n           data-text-color=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"text-color") || (depth0 != null ? lookupProperty(depth0,"text-color") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text-color","hash":{},"data":data,"loc":{"start":{"line":5,"column":28},"end":{"line":5,"column":42}}}) : helper)))
    + "\" >\r\n\r\n    <input type=\"checkbox\" value=\""
    + alias4(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data,"loc":{"start":{"line":7,"column":34},"end":{"line":7,"column":42}}}) : helper)))
    + "\" "
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"checked") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":7,"column":44},"end":{"line":7,"column":73}}})) != null ? stack1 : "")
    + " >\r\n    "
    + alias4(((helper = (helper = lookupProperty(helpers,"key") || (data && lookupProperty(data,"key"))) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"key","hash":{},"data":data,"loc":{"start":{"line":8,"column":4},"end":{"line":8,"column":12}}}) : helper)))
    + "\r\n</label>";
},"useData":true});
})();
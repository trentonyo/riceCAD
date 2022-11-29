(function() {
  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['materialCard'] = template({"1":function(container,depth0,helpers,partials,data) {
    return "                checked\r\n            ";
},"compiler":[8,">= 4.3.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : (container.nullContext || {}), alias2=container.hooks.helperMissing, alias3="function", alias4=container.escapeExpression, lookupProperty = container.lookupProperty || function(parent, propertyName) {
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return parent[propertyName];
        }
        return undefined
    };

  return "<div class=\"material-settings-card card"
    + alias4(((helper = (helper = lookupProperty(helpers,"materialID") || (depth0 != null ? lookupProperty(depth0,"materialID") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"materialID","hash":{},"data":data,"loc":{"start":{"line":1,"column":39},"end":{"line":1,"column":53}}}) : helper)))
    + "\">\r\n    <label class=\"material-settings-card-label\">"
    + alias4(((helper = (helper = lookupProperty(helpers,"materialID") || (depth0 != null ? lookupProperty(depth0,"materialID") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"materialID","hash":{},"data":data,"loc":{"start":{"line":2,"column":48},"end":{"line":2,"column":62}}}) : helper)))
    + "</label>\r\n    <input type=\"color\" class=\"material-colorpicker\" id=\"material-"
    + alias4(((helper = (helper = lookupProperty(helpers,"materialID") || (depth0 != null ? lookupProperty(depth0,"materialID") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"materialID","hash":{},"data":data,"loc":{"start":{"line":3,"column":66},"end":{"line":3,"column":80}}}) : helper)))
    + "\" value=\"#"
    + alias4(((helper = (helper = lookupProperty(helpers,"materialHex") || (depth0 != null ? lookupProperty(depth0,"materialHex") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"materialHex","hash":{},"data":data,"loc":{"start":{"line":3,"column":90},"end":{"line":3,"column":105}}}) : helper)))
    + "\">\r\n\r\n    <div>\r\n        <label class=\"switch\">\r\n            <input type=\"checkbox\" id=\"material-"
    + alias4(((helper = (helper = lookupProperty(helpers,"materialID") || (depth0 != null ? lookupProperty(depth0,"materialID") : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"materialID","hash":{},"data":data,"loc":{"start":{"line":7,"column":48},"end":{"line":7,"column":62}}}) : helper)))
    + "-glass\"\r\n"
    + ((stack1 = lookupProperty(helpers,"if").call(alias1,(depth0 != null ? lookupProperty(depth0,"materialGlass") : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data,"loc":{"start":{"line":8,"column":12},"end":{"line":10,"column":19}}})) != null ? stack1 : "")
    + " >\r\n            <span class=\"slider\"></span></label>\r\n    </div>\r\n    <div class=\"material-settings-enableGlass disabled\">Enable Glass</div>\r\n</div>";
},"useData":true});
})();

function Menu (config) {

    var default_config = {
        span: "vertical",
        margin: {
            top: 20,
            bottom: 100,
            left: 100,
            right: 100
        },
        width: 200,
        height: 25,
        text_yoffset: 18
    };

    this.config = _.extend(default_config, config);
    this.container = this.config.container;
    this.options = _.map(this.config.options, function(d,i) {return _.extend(d, {idx:i})});
}

Menu.prototype = {

    constructor: Menu,

    render: function() {

        var self = this;
        if (self.control) self.control.remove();

        var menu = this.container.append("g")
            .classed(self.config.classed || {menu:true})
            .attr("transform", function(d,i) {return "translate("+(Math.floor(self.config.margin.left)+0.5)+","+(Math.floor(self.config.margin.top)+0.5)+")"})

        var option = menu.selectAll("g.option")
            .data(this.options)
          .enter().append("g")
            //.classed(function(d) {return {option:true, disabled:d.disabled && true}})
            .classed({option:true, selected:function(d) {return d.selected}, disabled:function(d) {return d.disabled}})
            .attr("transform", function(d,i) {return "translate("+(self.config.span !== "horizontal" ? 0 : i*self.config.width)+","+(self.config.span === "horizontal" ? 0 : i*self.config.height)+")"})

        option.append("rect")
            .attr("width", this.config.width)
            .attr("height", this.config.height)
            .on("click", function(d,i) {
                if (d.disabled) return false;
                menu.selectAll("g.option.selected").classed({selected:false});
                d3.select(this.parentNode).classed({selected:true});
                _.each(self.options, function(opt) {
                    opt.selected = !!(d.id === opt.id);
                });
                _.isFunction(d.action) ? d.action.call(option, d) : null;
            });

        option.append("text")
            .attr("x", 10)
            .attr("y", self.config.text_yoffset)
            .text(function(d) {return d.name})

        self.control = menu;
    }
};

function ColorLegend (config) {

    var default_config = {
        swatch_size: 13,
        intrapadding: 5,
        position: {
            top: 20,
            left: 20
        },
        margin: {
            top: 10,
            bottom: 10,
            left: 10,
            right: 60
        },
        gap: 15,
        extra: []
    };

    this.config = _.extend(default_config, config);
    this.container = this.config.container;

}

ColorLegend.prototype = {

    set_scale: function(scale) {
        if (!scale) throw new Error("Scale is undefined or invalid");
        this.scale = scale;
    },

    render: function() {

        var self = this;
        if (self.control) self.control.remove();

        var data = this.scale.range();

        var height = self.config.margin.top + (data.length * (self.config.swatch_size+self.config.intrapadding)) - self.config.intrapadding + (!_.isEmpty(self.config.extra) ? self.config.gap + self.config.extra.length * (self.config.swatch_size+self.config.intrapadding) : 0) + self.config.margin.bottom;
        var width = self.config.margin.left + self.config.swatch_size + self.config.margin.right;

        var legend = this.container.append("g")
            .classed({"legend":true})
            .attr("transform", function(d,i) {
                var top = self.config.position.top ? self.config.position.top : self.container.attr("height") - height - self.config.position.bottom;
                var left = self.config.position.left ? self.config.position.left : self.container.attr("width") - width - self.config.position.right;
                return "translate("+(left+0.5)+","+(top+0.5)+")";
            });

        var legend_scale = d3.scale.linear()
            .domain([_.first(this.scale.domain()),_.last(this.scale.domain())])
            .range([(data.length * (self.config.swatch_size+self.config.intrapadding)) - self.config.intrapadding, 0])

        // bg
        legend.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("rx", 6)
            .attr("ry", 6)
            .style("stroke", "#bbb")
            .style("stroke-width", 0.5)
            .style("fill", "#ccc")
            .style("fill-opacity", 0.85)

        var swatch = legend.selectAll("rect.swatch")
            .data(data)
          .enter().append("rect")
            .classed({"swatch":true})
            .attr("x", self.config.margin.left)
            .attr("y", function(d,i) {return self.config.margin.top + (((data.length-1)-i) * (self.config.swatch_size+self.config.intrapadding))})
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", self.config.swatch_size)
            .attr("height", self.config.swatch_size)
            .style("fill", function(d) {return d})
            .style("stroke", "#555")
            .style("stroke-opacity", 0.7)

        var extra = legend.selectAll("rect.extra")
            .data(self.config.extra)
          .enter().append("rect")
            .classed({"swatch":true, "extra":true})
            .attr("x", self.config.margin.left)
            .attr("y", function(d,i) {return self.config.margin.top + (data.length * (self.config.swatch_size+self.config.intrapadding)) + self.config.gap + (((self.config.extra.length-1)-i) * (self.config.swatch_size+self.config.intrapadding))})
            .attr("rx", 2)
            .attr("ry", 2)
            .attr("width", self.config.swatch_size)
            .attr("height", self.config.swatch_size)
            .style("fill", function(d) {return d[0]})
            .style("stroke", "#555")
            .style("stroke-opacity", 0.7)

        legend.append("line")
            .attr("x1", self.config.margin.left+self.config.swatch_size+7)
            .attr("y1", Math.round(self.config.margin.top+(self.config.swatch_size/2)))
            .attr("x2", self.config.margin.left+self.config.swatch_size+7)
            .attr("y2", Math.round(self.config.margin.top+(data.length*(self.config.swatch_size+self.config.intrapadding))-self.config.intrapadding-(self.config.swatch_size/2)))
            .style("stroke", "#555")
            .style("stroke-opacity", 0.4)

        legend.selectAll("line.tick1")
            .data(data)
          .enter().append("line")
            .classed({tick1:true})
            .attr("x1", self.config.margin.left+self.config.swatch_size+4)
            .attr("y1", function(d,i) {return Math.round(self.config.margin.top + (((data.length-1)-i) * (self.config.swatch_size+self.config.intrapadding)+(self.config.swatch_size/2)))})
            .attr("x2", self.config.margin.left+self.config.swatch_size+7)
            .attr("y2", function(d,i) {return Math.round(self.config.margin.top + (((data.length-1)-i) * (self.config.swatch_size+self.config.intrapadding)+(self.config.swatch_size/2)))})
            .style("stroke", "#555")
            .style("stroke-opacity", 0.4)

        var scale_ticks = legend_scale.ticks(5);

        legend.selectAll("line.tick2")
            .data(scale_ticks)
          .enter().append("line")
            .classed({tick2:true})
            .attr("x1", self.config.margin.left+self.config.swatch_size+7)
            .attr("y1", function(d,i) {return Math.round(self.config.margin.top + Math.round(legend_scale(d)))})
            .attr("x2", self.config.margin.left+self.config.swatch_size+10)
            .attr("y2", function(d,i) {return Math.round(self.config.margin.top + Math.round(legend_scale(d)))})
            .style("stroke", "#555")
            .style("stroke-opacity", 0.4)

        legend.selectAll("text.tick2")
            .data(scale_ticks)
          .enter().append("text")
            .classed({tick2:true})
            .attr("x", self.config.margin.left+self.config.swatch_size+12)
            .attr("y", function(d,i) {return self.config.margin.top + legend_scale(d) + 3})
            .text(function(d) {return self.config.format(d)})

        legend.selectAll("line.tick2.extra")
            .data(self.config.extra)
          .enter().append("line")
            .classed({tick2:true,extra:true})
            .attr("x1", self.config.margin.left+self.config.swatch_size+5)
            .attr("y1", function(d,i) {return Math.round(self.config.margin.top + (data.length * (self.config.swatch_size+self.config.intrapadding)) + self.config.gap + (((self.config.extra.length-1)-i) * (self.config.swatch_size+self.config.intrapadding))+(self.config.swatch_size/2))})
            .attr("x2", self.config.margin.left+self.config.swatch_size+8)
            .attr("y2", function(d,i) {return Math.round(self.config.margin.top + (data.length * (self.config.swatch_size+self.config.intrapadding)) + self.config.gap + (((self.config.extra.length-1)-i) * (self.config.swatch_size+self.config.intrapadding))+(self.config.swatch_size/2))})
            .style("stroke", "#555")
            .style("stroke-opacity", 0.4)

        legend.selectAll("text.tick2.extra")
            .data(self.config.extra)
          .enter().append("text")
            .classed({tick2:true,extra:true})
            .attr("x", self.config.margin.left+self.config.swatch_size+12)
            .attr("y", function(d,i) {return self.config.margin.top + (data.length * (self.config.swatch_size+self.config.intrapadding)) + self.config.gap + (((self.config.extra.length-1)-i) * (self.config.swatch_size+self.config.intrapadding)) + 8})
            .text(function(d) {return d[1]})

        self.control = legend;

    },

};

function Tooltip(config) {

    var default_config = {
        x: 100,
        y: 100,
        offset: {
            x: 50,
            y: -20
        },
        width: 300,
        height: 300
    };

    this.config = _.extend(default_config, config);
    this.container = this.config.container;
    this.id = config.id || Math.random().toString().replace("0.","TOOLTIP-");
    this.template = this.config.template;
    this.record = {};
    this.x = this.config.x;
    this.y = this.config.y;
    this.width = this.config.width;
    this.height = this.config.height;
    this.offset = this.config.offset;
}

Tooltip.prototype = {

    render: function(record) {

        var self = this;
        this.remove();

        var tooltip = this.container.append("g")
            .attr("id", this.id)
            .classed({tooltip:true})
            .attr("transform", function(d,i) {return "translate("+(self.x+0.5)+","+(self.y+0.5)+")"})
            .style("pointer-events", "none")

        tooltip.append("rect")
            .attr("x", this.offset.x)
            .attr("y", this.offset.y)
            .attr("width", this.width)
            .attr("height", this.height)
            .attr("stroke", "#555")
            .attr("stroke-width", 1.0)
            .attr("stroke-opacity", 0.5)
            .style("fill", "#fff");

        var svg_switch = tooltip.append("switch");

        svg_switch.append("foreignObject")
            .attr("x", this.offset.x)
            .attr("y", this.offset.y)
            .attr("width", this.width)
            .attr("height", this.height)
          .append("xhtml:body")
            .html(this.template(record))

    },

    remove: function() {
        this.container.select("g#"+this.id).remove();
    }

};

// http://stackoverflow.com/a/2035211/880891
function get_viewport() {

    var viewPortWidth;
    var viewPortHeight;

    // the more standards compliant browsers (mozilla/netscape/opera/IE7) use window.innerWidth and window.innerHeight
    if (typeof window.innerWidth != 'undefined') {
        viewPortWidth = window.innerWidth,
        viewPortHeight = window.innerHeight
    }

    // IE6 in standards compliant mode (i.e. with a valid doctype as the first line in the document)
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
        viewPortWidth = document.documentElement.clientWidth,
        viewPortHeight = document.documentElement.clientHeight
    }

    // older versions of IE
    else {
        viewPortWidth = document.getElementsByTagName('body')[0].clientWidth,
        viewPortHeight = document.getElementsByTagName('body')[0].clientHeight
    }
    return [viewPortWidth, viewPortHeight];
}
;
var map;
var overlay;
var appdata = {};

// controls
var election_selector;
var div_selector;
var legend;

// state vars
var selected_election = null;
var selected_sub = null;
var selected_div = null;

var app_options = {
    opacity: 0.75  // Opacity of the colored polygons
};

google.maps.event.addDomListener(window, 'load', function() {

    // title background
    d3.select("#top-glass").insert("rect", "#title-text-1")
        .attr("id", "title-bg")
        .attr("x", 10.5)
        .attr("y", 10.5)
        .attr("rx", 2)
        .attr("ry", 2)
        .attr("width", function() {return d3.select("#title-text-1").node().getBBox().width + 22})
        .attr("height", 58)

    // on resize, adjust SVG dimensions and reposition/resize some overlays
    var on_resize = function() {
        var vport = get_viewport();
        d3.select("#top-glass")
            .attr("width", vport[0])
            .attr("height", vport[1]);
        if (legend) legend.render(); // legend
        // description
        var width = Math.round(d3.select("#title-bg").attr("width") - 10);
        d3.select("#description").attr("style", "top:450px;left:10px;width:" + width + "px;height:" + Math.max(vport[1] - 500,0) + "px;");
        d3.select("#source").attr("style", "top:" + Math.max(vport[1] - 54,0) + "px;left:10px;width:" + width + "px;height:10px;");
    };

    d3.select(window).on('resize', on_resize);
    on_resize();

    // perform asynchronous tasks
    async.auto({

        data: function(cb) {
            d3.json('appdata.min.json', function(data) {
                appdata = data;
                cb();
            });
        },

        map: ['data', function(cb) {
            map = new google.maps.Map(document.getElementById('map-canvas'), {
                center: {lat: 7, lng: -66.1},
                zoom: 6,
                minZoom: 6,
                maxZoom: 12,
                mapTypeControl: true,
                mapTypeControlOptions: {
                    style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
                    position: google.maps.ControlPosition.RIGHT_BOTTOM
                },
                scaleControl: true,
                scaleControlOptions: {},
                streetViewControl: false,
                zoomControl: true,
                zoomControlOptions: {
                    style: google.maps.ZoomControlStyle.LARGE,
                    position: google.maps.ControlPosition.RIGHT_TOP
                },
                panControl: true,
                panControlOptions: {
                    position: google.maps.ControlPosition.RIGHT_TOP
                },
                // source: https://snazzymaps.com/style/4183/mostly-grayscale
                styles: [{"featureType":"landscape","stylers":[{"saturation":-100},{"lightness":65},{"visibility":"on"}]},{"featureType":"poi","stylers":[{"saturation":-100},{"lightness":51},{"visibility":"simplified"}]},{"featureType":"road.highway","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"road.arterial","stylers":[{"saturation":-100},{"lightness":30},{"visibility":"on"}]},{"featureType":"road.local","stylers":[{"saturation":-100},{"lightness":40},{"visibility":"on"}]},{"featureType":"transit","stylers":[{"saturation":-100},{"visibility":"simplified"}]},{"featureType":"administrative.province","stylers":[{"visibility":"off"}]},{"featureType":"water","elementType":"labels","stylers":[{"visibility":"on"},{"lightness":-25},{"saturation":-100}]},{"featureType":"water","elementType":"geometry","stylers":[{"hue":"#3178C8"},{"lightness":-25},{"saturation":-85}]}]
            });

            google.maps.event.addListener(map.data, 'addfeature', function(event) {
                event.feature.setProperty('color', '#359');
            });

            overlay = new google.maps.OverlayView();
            overlay.draw = function() {};
            overlay.setMap(map);

            map.data.setStyle(function(feature) {
                var isHover = feature.getProperty('hover');
                var color = feature.getProperty('color') || "#999";
                return {
                    strokeWeight: isHover ? 2.0 : 0.5,
                    strokeOpacity: 1.0,
                    strokeColor: isHover ? "red" : "#345",
                    fillColor: isHover ? d3.rgb(color).brighter(1.2) : color,
                    fillOpacity: app_options.opacity,
                    zIndex: isHover ? 1 : 0
                };
            });
            cb();
        }],

        overlays: ['data', 'map', function(cb) {

            var topglass = d3.select("#top-glass");

            var tooltip;

            function show_tooltip(event) {
                if (!event || !event.feature) return;
                var pos = overlay.getProjection().fromLatLngToContainerPixel(event.latLng);
                var feat = event.feature;
                if (tooltip) tooltip.remove();
                tooltip = new Tooltip({
                    container: topglass,
                    x: pos.x,
                    y: pos.y,
                    width: 280,
                    height: 150,
                    template: _.template(
                        "<div style='width:100%;padding:10px 15px;'>" +
                            "<span style='font-size:16px;color:#000;'><%=name || \"<span style='font-style:italic;color:#444;'>unknown</span>\"%></span><br>" +
                            "<span style='color:#B98640;font-size:12px;'><%=loc%></span><br>" +
                            "<br>" +
                            "<table><tbody>" +
                                "<tr><th><%=election.vtype%></th><td><%=value||'.'%></td></tr>" +
                                "<tr><th>Turnout</th><td><%=turnout%></td></tr>" +
                            "</tbody></table>" +
                        "</div>")
                });

                if (selected_election) {
                    var elec_id = selected_election.id;
                    var elec_sub = selected_sub && selected_sub[1] || ''; // nominal + lista suboptions (_nom, _lst)
                    var props = {};
                    event.feature.forEachProperty(function(val, key) {
                        props[key] = val;
                    });
                    tooltip.render(_.extend(props, {
                        numformat: d3.format(','), // format numbers with thousands commas
                        value: ((Math.round(feat.getProperty(elec_id + "_c" + elec_sub) * 1000) / 10).toString() + '%'),
                        rep_text: (elec_id === "pr12" || elec_id === "pr13" ? "Counted Voters<br> (<i>escrutados</i>)" : "Registered Voters"),
                        registered: feat.getProperty(elec_id + "_n"),
                        loc: feat.getProperty("MUNICIPIO") ? feat.getProperty("MUNICIPIO") + ", " + feat.getProperty("ESTADO") : (feat.getProperty("ESTADO") || ""),
                        election: appdata.elections[elec_id],
                        area: google.maps.geometry.spherical.computeArea(feat.getGeometry()),
                        repinc: (function(){
                            if (feat.getProperty(appdata.elections[elec_id].prev + "_n") === undefined || feat.getProperty(elec_id + "_n") === undefined || parseInt(feat.getProperty(appdata.elections[elec_id].prev + "_n")) === 0 || parseInt(feat.getProperty(elec_id + "_n")) === 0) {
                                return "<span style='font-style:italic;color:#777;'>N/A</span>";
                            } else {
                                return (Math.round((parseInt(feat.getProperty(elec_id + "_n")) - parseInt(feat.getProperty(appdata.elections[elec_id].prev + "_n"))) * 10000 / parseInt(feat.getProperty(appdata.elections[elec_id].prev + "_n"))) / 100).toString() + "%";
                            }
                        }()),
                        turnout: (function(){
                            if (feat.getProperty(elec_id + "_to" + elec_sub) === undefined) {
                                return "<span style='font-style:italic;color:#777;'>N/A</span>";
                            } else {
                                return (Math.round(parseFloat(feat.getProperty(elec_id + "_to" + elec_sub)) * 10000) / 100).toString() + "%";
                            }
                        }()),
                        vdensity: (function(){
                            // TODO
                        }())
                    }));
                }
            }

            google.maps.event.addListener(map.data, 'mouseover', function(event) {
                if (event && event.feature) {
                    event.feature.setProperty('hover', true);
                    show_tooltip(event);
                }
            });
            google.maps.event.addListener(map.data, 'mouseout', function(event) {
                if (event && event.feature) {
                    event.feature.setProperty('hover', false);
                    if (tooltip) tooltip.remove();
                }
            });
            map.addListener('dragstart', function(event) {
                topglass.selectAll(".tooltip").remove();
            });

            // set up D3 widgets

            // election menu
            election_selector = new Menu({
                classed: {menu: 1, elecsel: 1},
                span: "vertical",
                options: _.map(appdata.elections, function(val, key) {
                    return {
                        id: key,
                        name: val.label,
                        desc: val.desc,
                        maps: val.maps,
                        scale_type: val.scale_type,
                        action: load_election,
                        disabled: val.disabled,
                        subs: val.subs,
                        selected: val.selected
                    };
                }),
                margin: {
                    top: 89,
                    bottom: 100,
                    left: 10,
                    right: 100
                },
                container: topglass,
                width: Math.round(d3.select("#title-bg").attr("width"))
            });

            // map subdivision menu
            div_selector = new Menu({
                classed: {menu: 1, divsel: 1},
                span: "horizontal",
                options: [
                    {id: "parroquias", name: "PARISH", action: load_div, selected: true},
                    {id: "municipios", name: "MUNICIP.", action: load_div},
                    {id: "estados", name: "STATE", action: load_div},
                    {id: "circuitos", name: "CIRCUIT", action: load_div}
                ],
                margin: {
                    top: 68,
                    left: 10
                },
                container: topglass,
                width: d3.select("#title-bg").attr("width") / 4,
                height: 15,
                text_yoffset: 11
            });

            legend = new ColorLegend({
                swatch_size: 10,
                intrapadding: 3,
                position: {
                    top: 15,
                    right: 110
                },
                margin: {
                    top: 15,
                    bottom: 10,
                    left: 5,
                    right: 45
                },
                extra: [
                    ["#777", "No data"]
                ],
                container: topglass,
                format: function(val) {return Math.round(val * 100) + "%"},
            });

            ///////////////////////////////////////////////////////////////////////////////////////////

            // called when a subdivision type is selected
            function load_div(option) {

                selected_div = option;
                var div_id = option.id;

                // remove all features currently on map
                map.data.forEach(function(feat) {
                    map.data.remove(feat);
                });

                map.data.addGeoJson(appdata[div_id]);
                if (selected_election) load_election(selected_election);
            }

            // called when an election is selected
            function load_election(option) {

                selected_election = option;
                var elec_id = option.id;
                var quit = false;

                // update map selector
                _.each(div_selector.options, function(div) {
                    div.disabled = !!(selected_election.maps.indexOf(div.id) === -1);
                    if (selected_div.id === div.id && div.disabled) {
                        _.each(div_selector.options, function(opt) {
                            opt.selected = false;
                        });
                        _.first(div_selector.options).selected = true;
                        load_div(_.first(div_selector.options));
                        quit = true;
                    }
                });
                if (quit) return;

                div_selector.render();

                // disable nominal/lista suboptions for circuitos
                if (selected_election.subs && selected_div.id !== 'circuitos') {
                    if (!selected_sub) {
                        selected_sub = _.first(selected_election.subs);
                        load_voting_system(selected_sub[1]);
                        return;
                    }
                } else {
                    selected_sub = null;
                }

                var color_scale;
                if (option.scale_type == 'sequential') {
                    // Sequential color scale - http://colorbrewer2.org/?type=sequential&scheme=BuGn&n=9
                    var color_range = ["#F7FCFD", "#E5F5F9", "#CCECE6", "#99D8C9", "#66C2A4", "#41AE76", "#238B45", "#006D2C", "#00441B"];
                    color_scale = d3.scale.linear()
                        .domain(color_range.map(function(e, i) {return i / (color_range.length - 1)}))
                        .range(color_range)
                        .clamp(true);
                } else { // assume diverging color scale
                    // Diverging color scale - http://colorbrewer2.org/?type=diverging&scheme=RdBu&n=10
                    var color_range = ["#053061", "#2166ac", "#4393c3", "#92c5de", "#d1e5f0", "#fddbc7", "#f4a582", "#d6604d", "#b2182b", "#67001f"];
                    color_scale = d3.scale.linear()
                        .domain(color_range.map(function(e, i) {return i / (color_range.length - 1)}))
                        .range(color_range)
                        .clamp(true);
                }

                map.data.forEach(function(feat) {
                    //var id = feat.getId();
                    var val = feat.getProperty(elec_id + "_c" + (selected_sub ? selected_sub[1] : ''));
                    if (val && val !== 0) {
                        feat.setProperty('color', color_scale(val));
                    } else {
                        feat.setProperty('color', '#666');
                    }
                });

                // update legend
                legend.set_scale(color_scale);
                legend.render();

                // update description
                $('#description').text('');
                if (option.subs && selected_div.id !== 'circuitos') {
                    var sel = $('<select>');
                    _.each(option.subs, function(sub) {
                        var opt = $('<option>').text(sub[0]).val(sub[1]);
                        sel.append(opt);
                    });
                    sel.val(selected_sub);
                    sel.on('change', function() {
                        load_voting_system(sel.val());
                    });
                    $('#description').append('<span>Use electoral system:</span><br>').append(sel).append('<br><br>');
                }
                $('<div>').html(option.desc).appendTo('#description');
            }

            // called when voting system dropdown is changed, where applicable
            function load_voting_system(suffix) {

                if (!_.isArray(selected_election.subs)) return;

                selected_sub = _.find(selected_election.subs, function(sub) {
                    return sub[1] === suffix;
                });

                load_election(selected_election);
            }

            election_selector.render();
            div_selector.render();

            // auto-load first menu option
            load_div(div_selector.options[0]);
            load_election(election_selector.options[election_selector.options.length - 1]);

        }]

    }, function(err) {
        if (err) console.error(err);
    });

});

//# sourceMappingURL=local.js.map
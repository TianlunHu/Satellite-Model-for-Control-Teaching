"use strict";

function insertHtml(containerId, html) {
    const containerEl = document.getElementById(containerId);
    containerEl.insertAdjacentHTML('beforeend', html);
}

class LinePlot {
    constructor(id, container, width, height, signals, labels, colors, ylim) {
        if (container) {
            let html = "<p style=\"text-align: center\"><canvas id=\""+id+"\" width=\""+width+"\" height=\""+height+"\"></canvas></p>\n";
            if (labels) {
                html += "<p style=\"text-align: center\">";
                for (let i = 0; i < signals.length; i++) {
                    if (!labels[i]) {
                        continue;
                    }
                    html += "<span class=\"badge\" style=\"background-color: " + colors[i] + "\">&nbsp;</span> " + labels[i] + " &nbsp;\n";
                }
                html += "</p>";
            }
            insertHtml(container, html);
        }

        this.canvas = document.getElementById(id);
        this.signals = signals;
        this.clip = true;
        this.ylim = ylim;
        this.scaleFactor = 1.0;

        this.startTimeSys = new Date().getTime();
        // this.startTimeData = -1;

        // http://smoothiecharts.org/builder/
        this.chart = new SmoothieChart({
            interpolation: 'linear',
            maxValue: ylim[1],
            minValue: ylim[0],
            grid: {
                fillStyle: '#ffffff',
                sharpLines: true,
                verticalSections: 6,
            },
            labels: {
                fillStyle: '#000000',
                precision: 1
            },
            timestampFormatter: function (t) {
                return Math.round((t.getTime() - this.startTimeSys) / 1000).toString() + ' '
            }.bind(this)
        });

        this.series = [];
        for (let color of colors) {
            const s = new TimeSeries();
            this.chart.addTimeSeries(s, {lineWidth: 3, strokeStyle: color});
            this.series.push(s);
        }
        this.chart.streamTo(this.canvas, 0);

    }

    addSample(sample) {
        if (this.startTimeData === -1) {
            this.startTimeData = sample.t;
        }
        for (let i=0; i<this.signals.length; i++) {
            const name = this.signals[i].split('#');
            let value = -1;
            if (name.length === 1) {
                value = this.scaleFactor * sample[name[0]];
            } else if (name.length === 2) {
                const index = name[1];
                value = this.scaleFactor*sample[name[0]][index];
            } else {
                console.log('invalid name', this.signals[i]);
                return;
            }
            if(this.clip) {
                this.clipVal(value);
            }
            this.series[i].append(new Date().getTime(), value);
        }
    }

    clipVal(value) {
        const eps = Math.abs(this.ylim[1]-this.ylim[0])/200;
        return Math.min(Math.max(value, this.ylim[0]+eps), this.ylim[1]-eps);
    }
}

class Checkbox extends Emitter {
    constructor(id, container, text, checked) {
        super();

        if (container) {
            const html = '<div class="checkbox"><label><input id="' + id + '" type="checkbox" value="">' + text + '</label></div>';
            insertHtml(container, html);
        }

        this.$checkbox = $('#'+id);
        this.checked = checked;
        this.$checkbox.prop('checked', checked);
        this.$checkbox.change(this.onCheckBoxChange.bind(this));
    }

    onCheckBoxChange() {
        this.checked = this.$checkbox.prop('checked');
        this.emit('change');
    }
}

class DebugLayerCheckbox extends Checkbox {
    constructor(id, container, scene, text='Debug Layer', checked=false) {
        super(id, container, text, checked);
        this.$checkbox.change(function() {
            if ($(this).prop('checked')) {
                scene.scene.debugLayer.show();
            } else {
                scene.scene.debugLayer.hide();
            }
        });
    }
}

class ToggleButton extends Emitter {
    constructor(id, container, text) {
        super();
        if (container) {
            const html = '<button id="'+id+'" type="button" class="btn btn-primary btn-block">'+text+'</button>';
            insertHtml(container, html);
        }

        this.$button = $('#'+id);
        this.$button.on('click', this.onClick.bind(this));

        this.value = 0;
    }

    onClick() {
        this.value = (this.value + 1) % 2;
        this.emit('change');
    }
}

class Dropdown extends Emitter {
    constructor(id, container, options, value) {
        super();
        if (container) {
            let html = '<select class="form-control" id="'+id+'">';
            for (let i=0; i < options.length; i++) {
                html += '<option>' + options[i] + '</option>';
            }
            html += '</select>';
            insertHtml(container, html);
        }

        this.$select = $('#'+id);
        this.$select.on('change', this.onChange.bind(this));

        this.$select.prop('selectedIndex', value);
        this.value = value;
    }

    onChange() {
        this.value = this.$select.prop('selectedIndex');
        this.emit('change');
    }
}

class CollapsiblePanel {
    constructor(id, container, name, collapsed) {
        let html = '<div class="panel panel-default">';
        html += '<div class="panel-heading" data-toggle="collapse" data-target="#'+id+'_collapseTarget" style="cursor: pointer">';
        html += '<h3 class="panel-title">'+name+'</h3>';
        html += '</div>';
        const inCls = collapsed ? '' : ' in';
        html += '<div id="'+id+'_collapseTarget" class="panel-collapse collapse' + inCls + '">';
        html += '<div class="panel-body" id="'+id+'">';
        html += '</div>';
        html += '</div>';
        html += '</div>';
        insertHtml(container, html);
    }
}

class Slider extends Emitter {
    constructor(id, container, params, options) {
        super();
        // https://github.com/seiyria/bootstrap-slider
        // http://seiyria.com/bootstrap-slider/

        const defaults = {
            sliderStyle: 'width: 300px;',
            labelWidth: '0em',
            checkbox: false,
        };
        options = Object.assign({}, defaults, options);

        this.enabled = true;

        if (container) {
            let html = '<p>';
            if (options.checkbox) {
                html +='<input id="' + id + '_checkbox" type="checkbox" value=""> ';
            }
            html += '<span id="'+id+'_label" style="display: inline-block; width: '+options.labelWidth+';"></span>';
            html += '<input style="'+options.sliderStyle+'" id="'+id+'" /><span id="'+id+'_value" style="margin-left: 2em"></span></p>';
            insertHtml(container, html);
            if (options.checkbox) {
                this.$checkbox = $('#'+id+'_checkbox');
                this.$checkbox.prop('checked', true);
                this.$checkbox.change(this.onCheckBoxChange.bind(this));
            }
        }

        if (params === undefined) {
            params = {
                value: 0,
                min: 0,
                max: 100,
            };
        }

        this.$slider = $('#'+id).slider(params);
        this.$label = $('#'+id+'_label');
        this.$value = $('#'+id+'_value');
        this.$slider.on('slide', this.onChange.bind(this));

        this.value = params.value;
        this.valueLabelText = undefined;
        this.updateValueLabel();
    }

    onChange() {
        this.value = this.$slider.slider('getValue');
        this.updateValueLabel();
        this.emit('change');
    }

    onCheckBoxChange() {
        this.enabled = this.$checkbox.prop('checked');
        this.$slider.slider(this.enabled ? 'enable' : 'disable');
        this.emit('change');
    }

    setCustomValueLabel(text) {
        this.valueLabelText = text;
        this.updateValueLabel();
    }

    updateValueLabel() {
        if (this.valueLabelText === undefined)
            this.$value.text(this.value);
        else
            this.$value.text(this.valueLabelText);
    }

    setLabel(text) {
        this.$label.html(text);
    }

    hide() {
        this.$slider.parent().hide();
    }

    show() {
        this.$slider.parent().show();
        this.$slider.slider('relayout');
    }

    setValue(value) {
        this.$slider.slider('setValue', value);
        this.value = this.$slider.slider('getValue');
        this.updateValueLabel();
    }
}

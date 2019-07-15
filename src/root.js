"use strict";
function insertHtml(containerId, html) {
    const containerEl = document.getElementById(containerId);
    containerEl.insertAdjacentHTML('beforeend', html);
}
    class EqnElementScalar {
        constructor(equation, callbackBase, idPrefix, options) {
            this.equation = equation;
            this.callbackBase = callbackBase;
            this.idPrefix = idPrefix;
            this.$elem = undefined;
            const defaults = {
                value: 0,
            };
            this.options = Object.assign({}, defaults, options);
        }

        render() {
            let text = this.options.value;
            text = '\\color{black}{'+text+'}';
            text = '\\href{javascript:'+this.callbackBase+')}{'+text+'}';
            return text;
        }

        postRender($elem) {
            $elem.popover({
                html: true,
                content: '<p><form onsubmit="'+this.callbackBase+',1); return false;"><span style="vertical-align:center;">k: <input id="'+this.idPrefix+'_val" type="number" value="'+this.options.value+'" step="0.5" min="-10" max="10"></span>&nbsp;&nbsp;&nbsp;'+
                '<button style="vertical-align:center;" type="submit" class="btn btn-primary">OK</button></form></p>',
                title: undefined, //"Edit coefficient",
                placement: 'auto bottom',
                container: 'body'
            });
            this.$elem = $elem;
        }

        callback(args) {
            console.log('callback!', args);
            if (args === 1) { // OK clicked
                this.options.value = parseFloat($('#'+this.idPrefix+'_val').val());
                this.$elem.popover('hide');
                return true;
            }
            return false;
        }

        getValues() {
            return {val: this.options.value};
        }
    }

    class EqnElementTF {
        constructor(equation, callbackBase, idPrefix, options) {
            this.equation = equation;
            this.callbackBase = callbackBase;
            this.idPrefix = idPrefix;
            this.$elem = undefined;
            const defaults = {
                re: 0,
                im: 0,
                enabled: true,
            };
            this.options = Object.assign({}, defaults, options);
        }

        render() {
            let text = '\\Big(s-('+ (this.options.re<0?'':'+') + this.options.re+(this.options.im !== 0.0 ? (this.options.im<0?'':'+')+this.options.im+'j' : '') + ')\\Big)';
            if (this.options.enabled)
                text = '\\color{black}{'+text+'}';
            else
                // text = '\\quad'; //'\\color{lightgray}{'+text+'}';
                text = '\\color{lightgray}{\\square}';
            text = '\\href{javascript:'+this.callbackBase+')}{'+text+'}';
            return text;
        }

        postRender($elem) {
            $elem.popover({
                html: true,
                content: '<form onsubmit="'+this.callbackBase+',1); return false;"><p>'+
                    '<input id="'+this.idPrefix+'_re" type="number" value="'+this.options.re+'" step="0.5" min="-10" max="10"></span>&nbsp;+&nbsp;'+
                    '<input id="'+this.idPrefix+'_im" type="number" value="'+this.options.im+'" step="0.5" min="-10" max="10"></span>&nbsp;j</p>'+
                    '<p><span style="vertical-align:center; float:left;" class="checkbox"><label><input id="'+this.idPrefix+'_enabled" type="checkbox"'+(true || this.options.enabled ? ' checked="checked"' : '')+'>enabled</label></span><button style="vertical-align:center; float:right;" type="submit" class="btn btn-primary">OK</button></p></form><div style="clear: both;"></div>',
                title: undefined, //"Edit coefficient",
                placement: 'auto bottom',
                container: 'body'
            });
            this.$elem = $elem;
        }

        callback(args) {
            if (args === 1) { // OK clicked
                const re = parseFloat($('#'+this.idPrefix+'_re').val());
                const im = parseFloat($('#'+this.idPrefix+'_im').val());
                const enabled = $('#'+this.idPrefix+'_enabled').prop('checked');
                this.updateValues(re, im, enabled);
                this.$elem.popover('hide');
                return true;
            }
            return false;
        }

        updateValues(re, im, enabled) {
            console.log('updateValues:', re, im, enabled);
            if (isNaN(re))
                re = 0.0;
            if (isNaN(im))
                im = 0.0;

            // determine name of this element in the InteractiveEquation class (e.g. Kz1/Gp0)
            let name;
            for (let e of this.equation.elements) {
                if (e[1] === this) {
                    name = e[0];
                    break;
                }
            }

            // find out if there is another pole/zero that will be cancelled out
            const c = (name[1] === 'z') ? 'p' : 'z';
            let cancelled = false;
            for (let e of this.equation.elements) {
                if (e[0].length !== 3 || e[0][1] !== c)
                    continue;
                if (enabled && e[1].options.enabled && re === e[1].options.re && (im === e[1].options.im || im === -e[1].options.im)) {
                    e[1].options.enabled = false;
                    cancelled = true;
                }
            }
            if (cancelled) {
                alert('Pole-zero cancellation!');
                enabled = false;
            }

            // if the pole/zero is/was complex and is enabled, ensure there is another one which is its conjugate
            if (enabled && (im !== 0.0 || (this.options.enabled && this.options.im !== 0.0))) {
                const elems = [];
                // first, find the two corresponding elements (e.g. Kz1 and Kz3 if the name == "Kz2")
                for (let e of this.equation.elements) {
                    if (e[0].length !== 3 || e[0].substring(0, 2) !== name.substring(0, 2) || e[0] === name)
                        continue;
                    elems.push(e[1]);
                }
                console.assert(elems.length === 2, elems);
                let elem = undefined;
                // find the element to update. first: is there an enabled complex one?
                if (elems[0].options.enabled && elems[0].options.im !== 0.0) {
                    elem = elems[0];
                    if (elems[1].options.enabled && elems[1].options.im !== 0.0) {
                        alert('Imaginary part of third pole/zero set to zero!')
                        elems[1].options.im = 0.0;
                    }
                } else if (elems[1].options.enabled && elems[1].options.im !== 0.0) {
                    elem = elems[1];
                    // if not, is there a disabled one?
                } else if (!elems[0].options.enabled) {
                    elem = elems[0];
                } else if (!elems[1].options.enabled) {
                    elem = elems[1];
                } else {
                    elem = elems[0]; // whatever...
                }
                // this element has to enabled and be the complex conjugate
                elem.options.re = re;
                elem.options.im = -im;
                elem.options.enabled = true;
            }

            // if the pole/zero was complex and is now disabled, look for other complex poles/zeros and disable them
            if (!enabled && this.options.enabled && this.options.im !== 0.0) {
                for (let e of this.equation.elements) {
                    if (e[0].length !== 3 || e[0].substring(0, 2) !== name.substring(0, 2) || e[0] === name)
                        continue;
                    if (e[1].options.im !== 0)
                        e[1].options.enabled = false;
                }
            }

            this.options.re = re;
            this.options.im = im;
            this.options.enabled = enabled;

            // count the number of enabled poles and zeros
            let pCount = 0;
            let zCount = 0;
            for (let e of this.equation.elements) {
                if (e[0].length !== 3 || !e[1].options.enabled)
                    continue;
                if (e[0][1] === 'p')
                    pCount++;
                else {
                    console.assert(e[0][1] === 'z', e[0]);
                    zCount++;
                }
            }
            console.log(zCount, pCount);
            if (zCount > pCount) {
                alert('Warning: The total number of zeros is greater than the number of poles!')
            }
        }

        getValues() {
            return {re: this.options.re, im: this.options.im, enabled: this.options.enabled};
        }
    }

    class InteractiveEquation extends Emitter {
        constructor(id, template, elements) {
            super();
            this.id = id;
            this.template = template;
            this.elements = elements;
            this.math = undefined;
            this.values = {};
            for(let i in this.elements) {
                const name = this.elements[i][0];
                const cls = this.elements[i][1];
                const opts = this.elements[i][2];
                const callbackBase = this.id + '.callback('+i;
                this.elements[i] = [name, new cls(this, callbackBase, this.id+'_'+name, opts), callbackBase];
            }

            MathJax.Hub.Queue(this.setup.bind(this));
            this.updateValues();
        }

        callback(id, args) {
            console.log('callback', id);
            if (this.elements[id][1].callback(args)) {
                this.updateValues();
                this.render();
            }
        }

        setup() {
            this.math = MathJax.Hub.getAllJax(this.id)[0];
            this.render();
        }

        preRenderHook(template) {
            return template;
        }

        render() {
            let text = this.preRenderHook(this.template);
            for(let i in this.elements) {
                const name = this.elements[i][0];
                const obj = this.elements[i][1];
                text = text.replace('<'+name+'/>', obj.render());
            }
            MathJax.Hub.Queue(["Text", this.math, text]);
            MathJax.Hub.Queue(this.postRender.bind(this));
        }

        postRender() {
            console.log('post render');
            for (let i in this.elements) {
                const obj = this.elements[i][1];
                const callbackBase = this.elements[i][2];
                const $elem = $('[href="javascript:' + callbackBase + ')"]');
                obj.postRender($elem);

            }
        }

        updateValues() {
            for (let i in this.elements) {
                const name = this.elements[i][0];
                const obj = this.elements[i][1];
                const vals = obj.getValues();
                for (let valName in vals) {
                    this.values[name+'_'+valName] = vals[valName];
                }
            }
            this.emit('change');
            console.log(this.values)
        }

        applyPreset(preset) {
            for(let i in this.elements) {
                const name = this.elements[i][0];
                const obj = this.elements[i][1];

                if (preset[name] !== undefined) {
                    obj.options = preset[name];
                }
            }
            this.updateValues();
            this.render();
        }
    }


    class RootLocusPlot {
        constructor(id, container, eqEditor, width=400, height=400) {
            this.eqEditor = eqEditor;
            if (container) {
                const html = '<div style="margin: 0 auto; width: '+width+'px"><canvas id="'+id+'" width="'+width+'" height="'+height+'"></canvas></div>';
                insertHtml(container, html);
            }

            this.chart = new Chart(document.getElementById(id), {
                type: 'scatter',
                data: {
                    datasets: [{
                        label: "Lines",
                        pointRadius: 0,
                        pointStyle: "crossRot",
                        fill: false,
                        borderColor: "#d62728",
                        data: [],
                    }, {
                        label: "KPoles",
                        pointStyle: "crossRot",
                        pointRadius: 15,
                        pointBorderWidth: 3,
                        pointHoverRadius: 17,
                        pointHoverBorderWidth: 3,
                        borderColor: "#2ca02c",
                        showLine: false,
                        fill: false,
                        data: [],
                    }, {
                        label: "KZeros",
                        pointStyle: "circle",
                        pointRadius: 15,
                        pointBorderWidth: 3,
                        pointHoverRadius: 17,
                        pointHoverBorderWidth: 3,
                        borderColor: "#2ca02c",
                        showLine: false,
                        fill: false,
                        backgroundColor: "transparent",
                        data: [],
                    }, {
                        label: "GPoles",
                        pointStyle: "crossRot",
                        pointRadius: 15,
                        pointBorderWidth: 3,
                        pointHoverRadius: 17,
                        pointHoverBorderWidth: 3,
                        borderColor: "#1f77b4",
                        showLine: false,
                        fill: false,
                        data: [],
                    }, {
                        label: "GZeros",
                        pointStyle: "circle",
                        pointRadius: 15,
                        pointBorderWidth: 3,
                        pointHoverRadius: 17,
                        pointHoverBorderWidth: 3,
                        borderColor: "#1f77b4",
                        showLine: false,
                        fill: false,
                        backgroundColor: "transparent",
                        data: [],
                    }, {
                        label: "Arrowheads",
                        pointRadius: 0,
                        fill: false,
                        borderColor: "#d62728",
                        lineTension: 0,
                        data: [],
                    }, {
                        label: "ClPoles",
                        pointStyle: "circle",
                        pointRadius: 7,
                        pointBorderWidth: 2,
                        pointHoverRadius: 12,
                        pointHoverBorderWidth: 2,
                        borderColor: "#d62728",
                        backgroundColor: "#d62728",
                        showLine: false,
                        fill: false,
                        data: [],
                    }]
                },
                options: {
                    responsive: true,
                    legend: {display: false},
                    scales: {
                        xAxes: [{
                            ticks:{min: -1, max: 10},
                            scaleLabel: {display: true, labelString: "Re"}
                        }],
                        yAxes: [{
                            ticks: {min: -1, max: 10},
                            scaleLabel: {display: true, labelString: "Im"}
                        }],
                    }
                }
            });

            this.lastUpdate = Date.now();
        }

        addSample(sample) {
            if (Date.now() - this.lastUpdate < 1000)
                return;
            // sample.en_wok[2] = 4;
            // const updateWok = !sample.en_wok.every(v => v === 0.0);
            // console.log('rl sample:', updateWok);

            const xPos = [];
            const yPos = [];

            const points = this.chart.data.datasets[0].data;
            points.length = 0;
            const arrowArgs = [];
            for (let i in sample.en_wok) {
                if (sample.en_wok[i] !== 1.0)
                    continue;
                const vals = sample['wok'+(parseInt(i)+1)];
                const len = Math.floor(vals.length / 2);
                let count = 0;

                for (let j = 0; j < len; j++) {
                    if (vals[j] >= 998)
                        break;
                    points.push({x: vals[j], y: vals[len+j]});
                    xPos.push(vals[j]);
                    yPos.push(vals[len+j]);
                    count++;
                }
                if (count >= 2) {
                    const tip = points[points.length-1];
                    let start = points[points.length-2];
                    let k = 2;
                    while (k <= points.length && (start.x-tip.x)*(start.x-tip.x) + (start.y-tip.y)*(start.y-tip.y) < 0.001) {
                        start = points[points.length-k];
                        k++;
                    }
                    arrowArgs.push([start.x, start.y, tip.x, tip.y]);
                }
                points.push({x: NaN, y: NaN});
            }

            const kpoles = this.chart.data.datasets[1].data;
            kpoles.length = 0;
            for(let elem of ['Kp1', 'Kp2', 'Kp3']) {
                if (!this.eqEditor.values[elem + '_enabled'])
                    continue;
                const x = this.eqEditor.values[elem + '_re'];
                const y = this.eqEditor.values[elem + '_im'];
                kpoles.push({x: x, y: y});
                xPos.push(x);
                yPos.push(y);
            }

            const kzeros = this.chart.data.datasets[2].data;
            kzeros.length = 0;
            for(let elem of ['Kz1', 'Kz2', 'Kz3']) {
                if (!this.eqEditor.values[elem + '_enabled'])
                    continue;
                const x = this.eqEditor.values[elem + '_re'];
                const y = this.eqEditor.values[elem + '_im'];
                kzeros.push({x: x, y: y});
                xPos.push(x);
                yPos.push(y);
            }

            const gpoles = this.chart.data.datasets[3].data;
            gpoles.length = 0;
            for(let elem of ['Gp1', 'Gp2', 'Gp3']) {
                if (!this.eqEditor.values[elem + '_enabled'])
                    continue;
                const x = this.eqEditor.values[elem + '_re'];
                const y = this.eqEditor.values[elem + '_im'];
                gpoles.push({x: x, y: y});
                xPos.push(x);
                yPos.push(y);
            }

            const gzeros = this.chart.data.datasets[4].data;
            gzeros.length = 0;
            for(let elem of ['Gz1', 'Gz2', 'Gz3']) {
                if (!this.eqEditor.values[elem + '_enabled'])
                    continue;
                const x = this.eqEditor.values[elem + '_re'];
                const y = this.eqEditor.values[elem + '_im'];
                gzeros.push({x: x, y: y});
                xPos.push(x);
                yPos.push(y);
            }

            const clpoles = this.chart.data.datasets[6].data;
            clpoles.length = 0;
            const len2 = Math.floor(sample.clpoles.length / 2);
            for (let i = 0; i < len2; i++) {
                if (sample.clpoles[i] >= 998)
                    break;
                const x = sample.clpoles[i];
                const y = sample.clpoles[len2+i];
                clpoles.push({x: x, y: y});
                xPos.push(x);
                yPos.push(y);
            }



            let xMin = Math.min(...xPos)-0.2;
            let xMax = Math.max(...xPos)+0.2;
            let yMin = Math.min(...yPos)-0.2;
            let yMax = Math.max(...yPos)+0.2;

            this.chart.options.scales.xAxes[0].ticks.min = xMin;
            this.chart.options.scales.xAxes[0].ticks.max = xMax;
            this.chart.options.scales.yAxes[0].ticks.min = yMin;
            this.chart.options.scales.yAxes[0].ticks.max = yMax;


            const arrows = this.chart.data.datasets[5].data;
            arrows.length = 0;
            for (let args of arrowArgs) {
                arrows.push(...this.createArrowhead(...args, xMax-xMin, yMax-yMin));
            }

            this.chart.update();

            this.lastUpdate = Date.now();
        }

        createArrowhead(xStart, yStart, xTip, yTip, xRange, yRange) {
            xStart = xStart / xRange;
            yStart = yStart / yRange;
            xTip = xTip / xRange;
            yTip = yTip / yRange;

            let xDir = xStart - xTip;
            let yDir = yStart - yTip;

            const a = 20*Math.PI/180; // angle
            const len = 0.08; // length in normalized coordinates

            const norm = Math.sqrt(xDir*xDir + yDir*yDir);
            xDir = xDir / norm * len;
            yDir = yDir / norm * len;

            const x1 = xDir*Math.cos(a) - yDir*Math.sin(a);
            const y1 = xDir*Math.sin(a) + yDir*Math.cos(a);

            const x2 = xDir*Math.cos(-a) - yDir*Math.sin(-a);
            const y2 = xDir*Math.sin(-a) + yDir*Math.cos(-a);

            // console.log({x: (xTip+x1)*xRange, y: (yTip+y1)*yRange}, {x: xTip*xRange, y: yTip*yRange}, {x: (xTip+x2)*xRange, y: (yTip+y2)*yRange}, {x: NaN, y: NaN});
            return [{x: (xTip+x1)*xRange, y: (yTip+y1)*yRange}, {x: xTip*xRange, y: yTip*yRange}, {x: (xTip+x2)*xRange, y: (yTip+y2)*yRange}, {x: NaN, y: NaN}];
        }
    }

class EqPresetDropdown {
        constructor(varname, container, eq, presets) {
            this.eq = eq;
            this.presets = presets;
            if (container) {
                let html = '<div class="dropdown">';
                html += '<button class="btn btn-primary dropdown-toggle" type="button" data-toggle="dropdown"><span class="glyphicon glyphicon-menu-hamburger"></span> <span class="caret"></span></button>';
                html += '<ul class="dropdown-menu dropdown-menu-right">';
                for (let i in presets) {
                    html += '<li><a href="javascript:'+varname+'.set('+i+')">'+presets[i].name+'</a></li>';
                }
                html += '</ul></div>';
                insertHtml(container, html);
            }
        }

        set(index) {
            this.eq.applyPreset(this.presets[index]);
        }
    }

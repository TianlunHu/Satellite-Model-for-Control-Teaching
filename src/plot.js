"use strict";
function insertHtml(containerId, html) {
    const containerEl = document.getElementById(containerId);
    containerEl.insertAdjacentHTML('beforeend', html);
}

class myLinePlot {
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
                verticalSections: 5,
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
            if (name.length === 2) {
                value = this.scaleFactor * sample[name[0]];
            } else if (name.length === 1) {
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

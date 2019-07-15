// less common user interface classes

// see examples/oriestimu/
class OriEstImuSliders extends Emitter {
    constructor(id, container) {
        super();

        const tauSliderParams = {
            value: 1,
            min: 0.01,
            max: 100,
            ticks: [0.01, 0.1, 1, 10, 100],
            ticks_labels: [0.01, 0.1, 1, 10, 100],
            scale: 'logarithmic',
            step: 0.001
        };

        const zetaSliderParams = {
            value: 0,
            min: 0,
            max: 10,
            step: 0.1,
            ticks: [0, 1, 5, 10],
            ticks_labels: [0, 1, 5, 10],
            ticks_positions: [0, 10, 5*10, 10*10],
            ticks_snap_bounds: 0.2,
        };

        const ratingSliderParams = {
            value: 1,
            min: 0,
            max: 5,
            step: 0.1,
            ticks: [0, 1, 5],
            ticks_labels: [0, 1, 5],
            ticks_positions: [0, 20, 100],
            ticks_snap_bounds: 0.2,
        };

        const sliderOpts = {
            sliderStyle: 'width: 300px;',
            labelWidth: '3em',
            checkbox: true,
        };

        this.sliders = {};
        this.values = {};


        this.sliders.tauAcc = new Slider(id + '_slider_tauAcc', container, tauSliderParams, sliderOpts);
        this.sliders.tauAcc.setLabel('τ<sub>acc</sub>');

        this.sliders.tauMag = new Slider(id + '_slider_tauMag', container, tauSliderParams, sliderOpts);
        this.sliders.tauMag.setLabel('τ<sub>mag</sub>');

        this.sliders.zeta = new Slider(id + '_slider_zeta', container, zetaSliderParams, sliderOpts);
        this.sliders.zeta.setLabel('ζ<sub>bias</sub>');

        this.sliders.accRating = new Slider(id + '_slider_accRating', container, ratingSliderParams, sliderOpts);
        this.sliders.accRating.setLabel('r<sub>acc</sub>');

        this.sliders.tauAcc.on('change', this.onSliderChange.bind(this));
        this.sliders.tauMag.on('change', this.onSliderChange.bind(this));
        this.sliders.zeta.on('change', this.onSliderChange.bind(this));
        this.sliders.accRating.on('change', this.onSliderChange.bind(this));

        this.onSliderChange();
    }

    onSliderChange() {
        for (let paramName in this.sliders) {
            if (this.sliders[paramName].enabled) {
                this.values[paramName] = this.sliders[paramName].value;
                this.sliders[paramName].setCustomValueLabel(undefined);
            } else {
                let val = 0;
                if (paramName === 'tauAcc' || paramName === 'tauMag') {
                    val = -1;
                }
                this.values[paramName] = val;
                this.sliders[paramName].setCustomValueLabel(val);
            }
        }

        this.emit('change');
    }
}

// see examples/euler-angles/
class QuatEulerSliders extends Emitter {
    constructor(id, container, defaultMode=0) {
        super();

        this.quat = new Quaternion(1, 0, 0, 0);

        const angleSliderParams = {
            value: 0,
            min: -180,
            max: 180,
            step: 1,
            ticks: [-180, -90,  0, 90, 180],
            ticks_labels: [-180, -90,  0, 90, 180],
            ticks_snap_bounds: 4,
            precision: 1
        };

        const quatSliderParams = {
            value: 1,
            min: -1,
            max: 1,
            step: 0.01,
            ticks: [-1, 0, 1],
            ticks_labels: [-1, 0, 1],
            ticks_snap_bounds: 0.04,
            precision: 3
        };

        this.modes = ['Quaternion'];
        for (let inex of ['intrinsic', 'extrinsic']) {
            for (let order of ['zyx', 'zxy', 'yxz', 'yzx', 'xyz', 'zxy', 'zxz', 'zyz', 'yxy', 'yzy', 'xyx', 'xzx']) {
                this.modes.push('Euler ' + order + ' ' + inex);
            }
        }

        this.mode = -1;
        this.mode_dropdown = new Dropdown(id + '_mode', container, this.modes, defaultMode);
        this.mode_dropdown.on('change', this.onModeChange.bind(this));

        const sliderOpts = {
            sliderStyle: 'width: 300px;',
            labelWidth: '2em'
        };

        this.slider_q0 = new Slider(id + '_slider_q0', container, quatSliderParams, sliderOpts);
        this.slider_q0.setLabel('w');
        quatSliderParams.value = 0;
        this.slider_q1 = new Slider(id + '_slider_q1', container, quatSliderParams, sliderOpts);
        this.slider_q1.setLabel('x');
        this.slider_q2 = new Slider(id + '_slider_q2', container, quatSliderParams, sliderOpts);
        this.slider_q2.setLabel('y');
        this.slider_q3 = new Slider(id + '_slider_q3', container, quatSliderParams, sliderOpts);
        this.slider_q3.setLabel('z');

        this.slider_alpha = new Slider(id + '_slider_alpha', container, angleSliderParams, sliderOpts);
        this.slider_alpha.setLabel('α');
        this.slider_beta = new Slider(id + '_slider_beta', container, angleSliderParams, sliderOpts);
        this.slider_beta.setLabel('β');
        this.slider_gamma = new Slider(id + '_slider_gamma', container, angleSliderParams, sliderOpts);
        this.slider_gamma.setLabel('γ');

        this.slider_q0.on('change', this.updateQuaternion.bind(this));
        this.slider_q1.on('change', this.updateQuaternion.bind(this));
        this.slider_q2.on('change', this.updateQuaternion.bind(this));
        this.slider_q3.on('change', this.updateQuaternion.bind(this));
        this.slider_alpha.on('change', this.updateQuaternion.bind(this));
        this.slider_beta.on('change', this.updateQuaternion.bind(this));
        this.slider_gamma.on('change', this.updateQuaternion.bind(this));

        this.onModeChange();
    }

    onModeChange() {
        const mode = this.mode_dropdown.value;
        if (mode === this.mode)
            return;

        if (mode === 0) {
            this.slider_q0.show();
            this.slider_q1.show();
            this.slider_q2.show();
            this.slider_q3.show();
            this.slider_alpha.hide();
            this.slider_beta.hide();
            this.slider_gamma.hide();

            this.slider_q0.setValue(this.quat.w);
            this.slider_q1.setValue(this.quat.x);
            this.slider_q2.setValue(this.quat.y);
            this.slider_q3.setValue(this.quat.z);
        } else {
            this.slider_q0.hide();
            this.slider_q1.hide();
            this.slider_q2.hide();
            this.slider_q3.hide();
            this.slider_alpha.show();
            this.slider_beta.show();
            this.slider_gamma.show();

            const modeStr = this.modes[mode].split(' ');
            const angles = this.quat.eulerAngles(modeStr[1], modeStr[2] === 'intrinsic');
            this.slider_alpha.setValue(rad2deg(angles[0]));
            this.slider_beta.setValue(rad2deg(angles[1]));
            this.slider_gamma.setValue(rad2deg(angles[2]));
        }

        this.mode = mode;
        this.updateQuaternion();
    }

    updateQuaternion() {
        let quat;
        if (this.mode === 0) {
            // quaternion
            quat = new Quaternion(this.slider_q0.value, this.slider_q1.value, this.slider_q2.value, this.slider_q3.value);

            // set value labels next to slider to normalized values
            this.slider_q0.setCustomValueLabel(Math.round(100.0*quat.w)/100.0);
            this.slider_q1.setCustomValueLabel(Math.round(100.0*quat.x)/100.0);
            this.slider_q2.setCustomValueLabel(Math.round(100.0*quat.y)/100.0);
            this.slider_q3.setCustomValueLabel(Math.round(100.0*quat.z)/100.0);

        } else {
            // euler angles
            const modeStr = this.modes[this.mode].split(' ');
            console.assert(modeStr[0] === 'Euler', modeStr);
            console.assert(modeStr[1].length === 3, modeStr);
            console.assert(modeStr[2] === 'intrinsic' || modeStr[2] === 'extrinsic', modeStr);

            const angles = [deg2rad(this.slider_alpha.value), deg2rad(this.slider_beta.value), deg2rad(this.slider_gamma.value)];
            quat = Quaternion.fromEulerAngles(angles, modeStr[1], modeStr[2] === 'intrinsic');
        }

        this.quat = quat;
        this.emit('change');
    }
}

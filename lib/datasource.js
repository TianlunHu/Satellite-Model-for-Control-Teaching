"use strict";

class WebSocketDataSource extends Emitter {
    constructor(url, options) {
        super();
        this.url = url;

        const defaults = {
            sendParamsOnReceivedMsg: true,
            sendParamsInteval: undefined, // TO IMPLEMENT, interval in ms
        };
        options = Object.assign({}, defaults, options);

        this.sendParamsOnReceivedMsg = options.sendParamsOnReceivedMsg;

        this.open = false;
        this.sendQueue = [];
        this.sinks = [];
        this.parameters = [];

        this.openSocket();
    }

    openSocket() {
        this.socket = new WebSocket(this.url);
        if (!this.socket) {
            alert('Opening WebSocket failed!');
        }

        this.socket.onopen = this.onOpen.bind(this);
        this.socket.onmessage = this.onMessage.bind(this);
        this.socket.onerror = this.onError.bind(this);
        this.socket.onclose = this.onClose.bind(this);
    }

    addSink(sink) {
        this.sinks.push(sink);
    }

    onOpen(open) {
        console.log("WebSocket has been opened", open, this);
        this.open = true;
        for (let message of this.sendQueue) {
            this.socket.send(message);
        }
        this.sendQueue = [];
    };

    onMessage(message) {
        //console.log(message.data);
        this.lastSample = this.processSample(JSON.parse(message.data));

        for (let sink of this.sinks) {
            sink.addSample(this.lastSample);
        }
        this.emit('sample', this.lastSample);

        if (this.sendParamsOnReceivedMsg && this.parameters.length) {
            let params = {};
            for (let entry of this.parameters) {
                const object = entry[0];
                const propertyName = entry[1];
                const parameterName = entry[2];
                params[parameterName] = object[propertyName];
            }
            this.lastParams = params;
            //console.log(JSON.stringify(params));
            this.socket.send(JSON.stringify(params));
        }
    }

    onError(error) {
        console.log("WebSocket error:", error, this);
    }

    onClose(close) {
        console.log("WebSocket has been closed", close, this);
        this.open = false;

        this.openSocket();
    }

    addParameter(object, propertyName, parameterName) {
        this.parameters.push([object, propertyName, parameterName]);
    }

    processSample(sample) {
        return sample;
    }

    sendMessage(message) {
        const msg = JSON.stringify(message);
        if (!this.open) {
            this.sendQueue.push(msg);
        } else {
            this.socket.send(msg);
        }
    }
}

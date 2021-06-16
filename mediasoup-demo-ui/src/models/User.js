export default class User {
    name;
    id;
    producerTransport;
    consumerTransport;
    videoProducer;
    audioProducer;
    screenShareProducer;
    audioStream;
    videoStream;
    screenShareStream;

    constructor(name, id) {
        this.name = name;
        this.id = id;

        // Transport created to send the streams to server 
        this.producerTransport = null;

        // Transport created to receive the other streams from the server
        this.consumerTransport = null;

        // Wrapper around the video/audio/screen media which will be 
        // passed to the server through producerTransport
        this.videoProducer = null;
        this.audioProducer = null;
        this.screenShareProducer = null;

        // Streams received from the browser 
        this.audioStream = null;
        this.videoStream = null;
        this.screenShareStream = null;
    }

    getProducer(kind) {
        if (kind === 'audio') return this.audioProducer;
        else if (kind === 'video') return this.videoProducer;
        else if (kind === 'screen') return this.screenShareProducer;
    }

    setProducer(kind, consumer) {
        if (kind === 'audio') this.audioProducer = consumer;
        else if (kind === 'video') this.videoProducer = consumer;
        else if (kind === 'screen') this.screenShareProducer = consumer;
    }

    setStream(kind, stream) {
        if (kind === 'audio') this.audioStream = stream;
        else if (kind === 'video') this.videoStream = stream;
        else if (kind === 'screen') this.screenShareStream = stream;
    }
}
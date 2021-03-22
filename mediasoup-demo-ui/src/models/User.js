export default class User {
    name;
    id;
    producerTransport;    
    consumerTransport;
    videoProducer;
    audioProducer;
    audioStream;
    videoStream;

    constructor(name, id) {
        this.name = name;
        this.id = id;
        this.producerTransport = null;
        this.consumerTransport = null;
        this.videoProducer = null;
        this.audioProducer = null;
        this.audioStream = null;
        this.videoStream = null;
    }

    getProducer(kind) {
        if (kind === 'audio') return this.audioProducer;
        else if (kind === 'video') return this.videoProducer;
    }

    setProducer(kind, consumer) {
        if (kind === 'audio') this.audioProducer = consumer;
        else if (kind === 'video') this.videoProducer = consumer;
    }

    setStream(kind, stream) {
        if (kind === 'audio') this.audioStream = stream;
        else if (kind === 'video') this.videoStream = stream;
    }
}
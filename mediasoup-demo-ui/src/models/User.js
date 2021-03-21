class User {
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
}
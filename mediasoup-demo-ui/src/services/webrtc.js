import * as mediasoupClient from "mediasoup-client";

export default class WebRTC {
    device = null;

    constructor(socket, user) {
        this.socket = socket;
        this.selfUser = user;
    }

    async loadDevice(routerRtpCapabilities) {
        try {
            this.device = new mediasoupClient.Device();
        } catch (e) {
            console.error(e);
        }
        await this.device.load({ routerRtpCapabilities });
    }

    async consumeTransport() {
        const data = await this.socket.request("createConsumerTransport", {
            forceTcp: false,
        });

        if (data.error) {
            console.error(data.error);
            return;
        }

        const transport = this.device.createRecvTransport(data);

        transport.on("connect", ({ dtlsParameters }, callback, errback) => {
            this.socket
                .request("connectConsumerTransport", {
                    transportId: transport.id,
                    dtlsParameters,
                })
                .then(callback)
                .catch(errback);
        });

        transport.on("connectionstatechange", async (state) => {
            switch (state) {
                case "connecting":
                    console.log("consume connecting");
                    break;

                case "connected":
                    console.log("consume connected");
                    // this.connectToRemoteConsumer(consumerPromise, users, producer, kind);
                    break;

                case "failed":
                    console.log("consume failed");
                    transport.close();
                    break;

                default:
                    break;
            }
        });

        return transport;
    }

    async produceTransport() {
        const data = await this.socket.request("createProducerTransport", {
            forceTcp: false,
        });
        if (data.error) {
            console.error(data.error);
            return;
        }

        const transport = this.device.createSendTransport(data);

        transport.on(
            "connect",
            async ({ dtlsParameters }, callback, errback) => {
                console.log("GETTING CONNECTED");
                this.socket
                    .request("connectProducerTransport", {
                        dtlsParameters,
                        transportId: transport.id,
                    })
                    .then(callback)
                    .catch(errback);
            }
        );

        transport.on(
            "produce",
            async ({ kind, rtpParameters }, callback, errback) => {
                try {
                    const { id } = await this.socket.request("produce", {
                        transportId: transport.id,
                        kind,
                        rtpParameters,
                    });
                    callback({ id });
                } catch (err) {
                    errback(err);
                }
            }
        );

        transport.on("connectionstatechange", (state) => {
            switch (state) {
                case "connecting":
                    console.log("transport connecting");
                    break;

                case "connected":
                    console.log("transport connected");
                    break;

                case "failed":
                    console.log("transport close");
                    transport.close();
                    break;

                default:
                    break;
            }
        });

        return transport;
    }

    async createConsumer(producerId, kind) {
        // transport, producerId, kind
        const transport = this.selfUser.consumeTransport;
        const { rtpCapabilities } = this.device;

        const data = await this.socket.request("consume", {
            rtpCapabilities,
            userId: producerId,
            kind,
        });

        const consumer = await transport.consume({ ...data });

        await this.socket.request("resume", {
            consumerId: consumer.id,
            socketId: producerId,
            type: kind,
        });

        return consumer
    }

    async getUserMedia(kind) {
        return navigator.mediaDevices.getUserMedia({
            [kind]: true
        })
    }

    async produce(kind, transport) {
        const stream = await this.getUserMedia(kind);
        const track = await this.getTrack(stream, kind);
        const producer = await this.createProducer(track, transport)
        return { producer, stream };
    }

    async getTrack(stream, kind) {
        if (kind === 'audio') return stream.getAudioTracks()[0];
        else if (kind === 'video') return stream.getVideoTracks()[0];
    }

    async createProducer(track, transport) {
        const params = {};
        params.track = track;
        params.encodings = [{ dtx: true }];
        params.codecOptions = {
            videoGoogleStartBitrate: 1000,
        };

        const producer = await transport.produce(params);
        return producer;
    }

    async consumeAll(producers, type) {
        return Promise.all(
            producers.map(async (producer) => {
                const { producerId } = producer;
                const consumer = await this.createConsumer(producerId, type);
                return { producerId, consumer };
            })
        );
    }
}

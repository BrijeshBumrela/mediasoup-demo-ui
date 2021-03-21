import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socketIO from "socket.io-client";
import User from "../../components/User/User";
import config from "../../config/config";
import WebRTC from "../../services/webrtc";
import { promise } from "../../utils/promise";
import { getUser } from "../../utils/helpers";

let socket;
let webrtc;

const Meeting = (props) => {
    const { meetingId } = useParams();
    const [users, setUsers] = useState([]);
    const [selfUser, setSelfUser] = useState(null);

    useEffect(() => {
        const name = `name-something`;

        const url = `${config.host}?meetingId=${meetingId}&name=${name}`;
        socket = socketIO.io(url, { transports: ["websockets", "polling"] });

        socket.request = promise(socket);

        socket.on("connect", async () => {
            const user = new User(name, socket.id);
            webrtc = new WebRTC(socket, user);

            try {
                const data = await socket.request("getRouterCapabilities");
                await webrtc.loadDevice(data);

                const producerTransport = await webrtc.produceTransport();
                const consumerTransport = await webrtc.consumeTransport();

                user.consumeTransport = consumerTransport;
                user.produceTransport = producerTransport;

                const userList = await socket.request("getusers", null);
                const prevUsers = userList.map(
                    (each) => new User(each.name, each.id)
                );

                setUsers(prevUsers);
                setSelfUser(user);

                const existingAudioProducers = await socket.request(
                    "getExistingAudioProducers",
                    {}
                );

                const existingVideoProducers = await socket.request(
                    "getExistingVideoProducers",
                    {}
                );

                const audioConsumers = await webrtc.consumeAll(
                    existingAudioProducers,
                    "audio"
                );
                const videoConsumers = await webrtc.consumeAll(
                    existingVideoProducers,
                    "video"
                );

                setUsers((users) => {
                    const updatedUsers = [...users];

                    audioConsumers.forEach(({ producerId, consumer }) => {
                        const currUser = getUser(updatedUsers, producerId);

                        if (!currUser) throw new Error("No user exists");
                        currUser.audioProducer = consumer;

                        let stream = new MediaStream();
                        stream.addTrack(consumer.track);

                        currUser.audioStream = stream;
                    });

                    videoConsumers.forEach(({ producerId, consumer }) => {
                        const currUser = getUser(updatedUsers, producerId);
                        if (!currUser) throw new Error("No user exists");
                        currUser.videoProducer = consumer;

                        let stream = new MediaStream();
                        stream.addTrack(consumer.track);

                        currUser.videoStream = stream;
                    });
                });
            } catch (e) {
                console.error(e);
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <div>
        {users.map(user => <User user={user}  />)}
    </div>;
};

export default Meeting;

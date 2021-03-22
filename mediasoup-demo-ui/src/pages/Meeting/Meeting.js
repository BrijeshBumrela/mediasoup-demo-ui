import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import socketIO from "socket.io-client";
import faker from "faker";
import UserComponent from "../../components/User/User";
import User from "../../models/User";
import config from "../../config/config";
import WebRTC from "../../services/webrtc";
import { promise } from "../../utils/promise";
import { getUser } from "../../utils/helpers";

let webrtc;

const Meeting = (props) => {
    const [preview, setPreview] = useState(true);
    const { meetingId } = useParams();
    const [users, setUsers] = useState([]);
    const [selfUser, setSelfUser] = useState(null);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        const name = faker.name.firstName();
        const url = `${config.host}?meetingId=${meetingId}&name=${name}`;

        const socket = socketIO.io(url, {
            transports: ["websockets", "polling"],
        });

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

                console.log("YAHAHA");

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

                console.log(
                    "VIDEO CONSUMERS",
                    videoConsumers,
                    existingVideoProducers
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

                    return updatedUsers;
                });
            } catch (e) {
                console.error(e);
            }
        });

        socket.on("UserAdded", ({ name, id }) => {
            setUsers((users) => [...users, new User(name, id)]);
        });

        socket.on("UserLeft", ({ id }) => {
            setUsers((users) => users.filter((user) => user.id !== id));
        });

        socket.on("newProducer", async ({ socketId, kind }) => {
            const consumer = await webrtc.createConsumer(socketId, kind);

            setUsers((users) => {
                const newUsers = [...users];
                const selectedUser = newUsers.find(
                    (user) => user.id === socketId
                );
                selectedUser.setProducer(kind, consumer);

                let stream = new MediaStream();
                stream.addTrack(consumer.track);

                selectedUser.setStream(kind, stream);
                return newUsers;
            });
        });

        socket.on("consumerPause", ({ producerId, kind }) => {
            setUsers((users) => {
                const newUsers = [...users];
                newUsers.forEach((user) => {
                    if (
                        user.id === producerId &&
                        user.getProducer(kind).pause()
                    );
                });

                return newUsers;
            });
        });

        socket.on("consumerResume", ({ producerId, kind }) => {
            setUsers((users) => {
                const newUsers = [...users];
                newUsers.forEach((user) => {
                    if (
                        user.id === producerId &&
                        user.getProducer(kind).resume()
                    );
                });

                return newUsers;
            });
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [socket]);

    const toggleVideo = async () => {
        if (!selfUser) throw new Error("Self user is not created");

        const updatedSelfUser = { ...selfUser };

        if (!updatedSelfUser.videoProducer) {
            const { producer, stream } = await webrtc.produce(
                "video",
                selfUser.produceTransport
            );
            updatedSelfUser.videoProducer = producer;
            updatedSelfUser.videoStream = stream;
        } else {
            if (updatedSelfUser.videoProducer.paused) {
                updatedSelfUser.videoProducer.resume();
            } else {
                updatedSelfUser.videoProducer.pause();
            }
        }

        setSelfUser(updatedSelfUser);
    };

    const toggleAudio = async () => {
        if (!selfUser) throw new Error("Self user is not created");

        const updatedSelfUser = { ...selfUser };

        if (!updatedSelfUser.audioProducer) {
            const { producer, stream } = await webrtc.produce(
                "audio",
                selfUser.produceTransport
            );
            updatedSelfUser.audioProducer = producer;
            updatedSelfUser.audioStream = stream;
        } else {
            if (updatedSelfUser.audioProducer.paused) {
                updatedSelfUser.audioProducer.resume();
            } else {
                updatedSelfUser.audioProducer.pause();
            }
        }

        setSelfUser(updatedSelfUser);
    };

    if (preview) {
        return (
            <div
                style={{
                    height: "85vh",
                    width: "80vw",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <button
                    class="waves-effect waves-light btn"
                    onClick={() => setPreview(false)}
                >
                    JOIN
                </button>
            </div>
        );
    }

    return (
        <div>
            <h5>MEETING JOINED with id {meetingId}. Bring your friends by sharing the url link</h5>
            <UserComponent
                toggleVideo={toggleVideo}
                toggleAudio={toggleAudio}
                user={selfUser}
                selfUser={selfUser}
            />
            <div style={{ display: 'flex', margin: '10px', flexWrap: 'wrap' }}>
                {users.map((user) => (
                    <UserComponent
                        toggleVideo={toggleVideo}
                        toggleAudio={toggleAudio}
                        key={user.id}
                        user={user}
                        selfUser={selfUser}
                    />
                ))}
            </div>
        </div>
    );
};

export default Meeting;

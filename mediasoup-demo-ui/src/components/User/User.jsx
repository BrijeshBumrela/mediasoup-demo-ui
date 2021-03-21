import React from "react";

const User = ({ user }) => {
    const {
        name,
        audioStream,
        videoStream,
        audioProducer,
        videoProducer,
    } = user;

    const setSrcObject = (ref, stream) => {
        if (ref && stream) ref.srcObject = stream;
    };

    return (
        <div>
            <h1>{name}</h1>
            {audioProducer && !audioProducer.paused && (
                <audio
                    autoPlay
                    ref={(ref) => setSrcObject(ref, audioStream)}
                ></audio>
            )}
            {videoProducer && !videoProducer.paused && (
                <video
                    style={{ maxWidth: "320px", objectFit: "cover" }}
                    ref={(ref) => setSrcObject(ref, videoStream)}
                    autoPlay
                ></video>
            )}
        </div>
    );
};

export default User;

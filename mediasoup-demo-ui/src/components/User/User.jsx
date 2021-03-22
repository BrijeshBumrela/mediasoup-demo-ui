import React from "react";

const UserComponent = ({ user, toggleVideo, selfUser, toggleAudio }) => {
    const {
        name,
        audioStream,
        videoStream,
        audioProducer,
        videoProducer,
        id,
    } = user;

    const setSrcObject = (ref, stream) => {
        if (ref && stream) ref.srcObject = stream;
    };

    return (
        <div>
            <h4>
                {name} {selfUser === user && "(You)"}
            </h4>
            {audioProducer &&
                !audioProducer.paused &&
                selfUser.id !== user.id && (
                    <audio
                        autoPlay
                        ref={(ref) => setSrcObject(ref, audioStream)}
                    ></audio>
                )}
            <div
                style={{
                    marginBottom: "10px",
                    maxWidth: "320px",
                    width: "320px",
                    height: "320px",
                    objectFit: "cover",
                    border: "1px solid gray",
                }}
            >
                {videoProducer && !videoProducer.paused && (
                    <video
                        style={{ width: "100%", height: "100%" }}
                        ref={(ref) => setSrcObject(ref, videoStream)}
                        autoPlay
                    ></video>
                )}
            </div>

            {id === selfUser.id && (
                <div>
                    <button
                        class="waves-effect waves-light btn"
                        style={{ marginRight: "10px" }}
                        onClick={toggleVideo}
                    >
                        {!videoProducer
                            ? "Start video"
                            : videoProducer.paused
                            ? "resume video"
                            : "pause video"}
                    </button>
                    <button
                        class="waves-effect waves-light btn"
                        onClick={toggleAudio}
                    >
                        {!audioProducer
                            ? "Start audio"
                            : audioProducer.paused
                            ? "resume audio"
                            : "pause audio"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserComponent;

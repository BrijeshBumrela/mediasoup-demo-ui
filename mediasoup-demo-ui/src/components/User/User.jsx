import React from "react";

const UserComponent = ({ user, toggleVideo, selfUser, toggleAudio, toggleScreenShare }) => {
    const {
        name,
        audioStream,
        videoStream,
        screenShareStream,
        audioProducer,
        videoProducer,
        screenShareProducer,
        id,
    } = user;

    const setSrcObject = (ref, stream) => {
        if (ref) ref.srcObject = stream;
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


            <div style={{ display: 'flex' }}>
                <div
                    style={{
                        marginBottom: "10px",
                        maxWidth: "320px",
                        width: "320px",
                        height: "320px",
                        objectFit: "cover",
                        border: "1px solid gray",
                        marginRight: 20
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
                    {screenShareProducer && !screenShareProducer.paused && (
                        <video
                            style={{ width: "100%", height: "100%" }}
                            ref={(ref) => setSrcObject(ref, screenShareStream)}
                            autoPlay
                        ></video>
                    )}
                </div>
            </div>

            {id === selfUser.id && (
                <div>
                    <button
                        className="waves-effect waves-light btn"
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
                        className="waves-effect waves-light btn"
                        style={{ marginRight: "10px" }}
                        onClick={toggleAudio}
                    >
                        {!audioProducer
                            ? "Start audio"
                            : audioProducer.paused
                                ? "resume audio"
                                : "pause audio"}
                    </button>
                    <button
                        className="waves-effect waves-light btn"
                        onClick={toggleScreenShare}
                    >
                        {!screenShareProducer
                            ? "Start Screen Share"
                            : screenShareProducer.paused
                                ? "Start screen share"
                                : "Stop screen share"}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserComponent;

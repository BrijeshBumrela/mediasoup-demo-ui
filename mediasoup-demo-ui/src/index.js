import ReactDOM from "react-dom";
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { v4 as uuid4 } from 'uuid';
import Meeting from './pages/Meeting/Meeting';

const App = () => {
    return (
        <>
            {" "}
            <h1>Mediasoup demo</h1>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <Redirect to={`/${uuid4()}`} />
                    </Route>
                    <Route path="/:meetingId">
                        <Meeting />
                    </Route>
                </Switch>
            </Router>
        </>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));

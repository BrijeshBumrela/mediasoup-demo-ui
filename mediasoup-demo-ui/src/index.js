import ReactDOM from "react-dom";
import React from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { v4 as uuid4 } from 'uuid';
import Meeting from './pages/Meeting/Meeting';

const App = () => {
    return (
        <div style={{ width: '80%', margin: 'auto' }}>
            {" "}
            <h3>Mediasoup demo</h3>
            <Router>
                <Switch>
                    <Route path="/" exact>
                        <Redirect to={`/${uuid4()}}`} />
                    </Route>
                    <Route path="/:meetingId">
                        <Meeting />
                    </Route>
                </Switch>
            </Router>
        </div>
    );
};

ReactDOM.render(<App />, document.getElementById("root"));

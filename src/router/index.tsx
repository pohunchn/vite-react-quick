import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import App from "../App";

function loadRoutes() {
    const context = import.meta.globEager("../views/*.tsx");

    const routes: any[] = [<Route exact path="/" component={App} key="router-App"></Route>];
    let views = Object.keys(context);
    for (let key of views) {
        let view = context[key].default;
        let name = key.replace(/(\.\.\/views\/|\.tsx)/g, '');
        routes.push(<Route exact path={ '/' + name } component={view} key={'router-' + name}></Route>)
    }
    return routes;
}

export default function AppRouter() {
    return (
        <Router>
            <Switch>
                { loadRoutes() }
            </Switch>
        </Router>
    )
}
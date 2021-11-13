import React from "react";
import ReactDOM from "react-dom";

//import MainRoute from "routes/MainRoute";
import { useHistory } from 'react-router';
import 'assets/css/general.css';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import moment from "moment";
import "moment/locale/pt-BR";

moment.locale("pt-BR");

import { BrowserRouter as Router, Route, Link, HashRouter, Switch} from "react-router-dom";

class SiteRouter extends React.Component {

   render() {
      return <HashRouter>
               <React.Fragment>
                  <MuiPickersUtilsProvider utils={MomentUtils} locale='pt-BR'>
               		 <div id="app">
               		 	<Switch>
                           {/*<Route path="/" component={MainRoute} />*/}
                     	</Switch>
                     </div>
                  </MuiPickersUtilsProvider>
               </React.Fragment>
            </HashRouter>
   }
}

ReactDOM.render(<SiteRouter/>, document.getElementById("root"));
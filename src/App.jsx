import React from "react";
import ReactDOM from "react-dom";

import LoginRoute from "routes/LoginRoute";
import PainelRoute from "routes/PainelRoute";
import ProfilesRoute from "routes/ProfilesRoute";
import UsersRoute from "routes/UsersRoute";
import { useHistory } from 'react-router';
import 'assets/css/general.css';

import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import moment from "moment";
import "moment/locale/pt-BR";

moment.locale("pt-BR");

import { BrowserRouter as Router, Route, Link, HashRouter, Switch} from "react-router-dom";
import { createTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createTheme({
   palette: {
      /*primary: pink,
      secondary: pink,*/
      primary: {
         light: '#f47b9b',
          main: '#f26389',
          dark: '#f04b77',
          contrastText: '#fff'
      }
   }
});

class SiteRouter extends React.Component {

   render() {
      return <HashRouter>
               <React.Fragment>
                  <ThemeProvider theme={theme}>
                     <MuiPickersUtilsProvider utils={MomentUtils} locale='pt-BR'>
                  		 <div id="app">
                  		 	<Switch>
                              <Route path="/" exact component={LoginRoute} />
                              <Route path="/painel" exact component={PainelRoute} />
                              <Route path="/usuarios" exact component={UsersRoute} />
                              <Route path="/perfis" exact component={ProfilesRoute} />
                        	</Switch>
                        </div>
                     </MuiPickersUtilsProvider>
                  </ThemeProvider>
               </React.Fragment>
            </HashRouter>
   }
}

ReactDOM.render(<SiteRouter/>, document.getElementById("root"));
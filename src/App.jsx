import React from "react";
import ReactDOM from "react-dom";

import LoginRoute from "routes/LoginRoute";
import PainelRoute from "routes/PainelRoute";
import ProfilesRoute from "routes/ProfilesRoute";
import ProductsRoute from "routes/ProductsRoute";
import UsersRoute from "routes/UsersRoute";
import CategoriesRoute from "routes/CategoriesRoute";
import SizesRoute from "routes/SizesRoute";
import CitiesRoute from "routes/CitiesRoute";
import DistrictsRoute from "routes/DistrictsRoute";
import CouponsRoute from "routes/CouponsRoute";
import ConsultantsRoute from "routes/ConsultantsRoute";
import CustomersRoute from "routes/CustomersRoute";
import OrdersRoute from "routes/OrdersRoute";
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
                              <Route path="/produtos" exact component={ProductsRoute} />
                              <Route path="/categorias" exact component={CategoriesRoute} />
                              <Route path="/tamanhos" exact component={SizesRoute} />
                              <Route path="/cidades" exact component={CitiesRoute} />
                              <Route path="/bairros" exact component={DistrictsRoute} />
                              <Route path="/cupons" exact component={CouponsRoute} />
                              <Route path="/consultores" exact component={ConsultantsRoute} />
                              <Route path="/clientes" exact component={CustomersRoute} />
                              <Route path="/pedidos" exact component={OrdersRoute} />
                        	</Switch>
                        </div>
                     </MuiPickersUtilsProvider>
                  </ThemeProvider>
               </React.Fragment>
            </HashRouter>
   }
}

ReactDOM.render(<SiteRouter/>, document.getElementById("root"));
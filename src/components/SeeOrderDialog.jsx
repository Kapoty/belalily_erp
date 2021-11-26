import React from "react";
import ReactDOM from "react-dom";

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

import {withStyles, useTheme} from '@material-ui/core/styles';

import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import Slide from '@material-ui/core/Slide';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import OrdersProductsTable from './OrdersProductsTable';

import {toCEP} from '../util/CEP';
import {toDateAndTime, toAge} from '../util/Dates';
import {toCPF} from '../util/CPF';
import {toPhone} from '../util/Phone';

const useStyles = (theme) => ({
	progressArea: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	},
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class SeeOrderDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			orderLoaded: false,
			order: {},
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getOrder = this.getOrder.bind(this);
	}

	componentDidMount() {
		this.getOrder();
	}

	getOrder() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "orders/" + this.props.orderId, {
			method: "GET",
			headers: { 
			"Content-type": "application/json; charset=UTF-8",
			"x-user-token": cookies.get('user-token'),
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if ('auth' in data) {
					cookies.remove('user-token');
					this.props.history.push('/');
				} else if ('error' in data)
					this.props.history.push('/painel');
				else {
					let products = [];
					let products_id = data.order.products_product_id.split(',');
					let products_price = data.order.products_product_price.split(',');
					let products_name = data.order.products_product_name.split(',');
					let products_quantity = data.order.products_product_quantity.split(',');
					let products_size_name = data.order.products_size_name.split(',');
					products_id.forEach((pId, i) => {
						let product = {};
						product.id = pId;
						product.price = products_price[i];
						product.name = products_name[i];
						product.quantity = products_quantity[i];
						product.size_name = products_size_name[i];
						products.push(product);
					});
					data.order.products = products;
					this.setState({
						orderLoaded: true,
						order: data.order,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getOrder, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	render() {
		const { classes } = this.props;

		let order = this.state.order;

		return <React.Fragment>
			<Dialog open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Ver Pedido
				</DialogTitle>
				<DialogContent dividers>
					{this.state.orderLoaded ? <React.Fragment>
						<Typography variant="h6" gutterBottom>
							Informações Principais
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>ID:</b> {toCEP(order.id)}<br/>
							<b>Status:</b> {{'IN_PROGRESS': 'EM ANDAMENTO', 'FINISHED': 'CONCLUÍDO', 'CANCELED': 'CANCELADO'}[order.status]}<br/>
							<b>Data:</b> {toDateAndTime(order.creation_datetime)}<br/>
							<b>Método de Pagamento:</b> {{'PIX': 'PIX', 'BOLETO': 'BOLETO', 'CREDIT': `CARTÃO DE CRÉDITO (em ${order.payment_installment_quantity}x)`}[order.payment_method]}<br/>
							<b>Status do Pagamento</b> {{'NOT_STARTED': 'NÃO INICIADO', 'AWAITING_PAYMENT': 'AGUARDANDO CONFIRMAÇÃO', 'CONFIRMED': 'CONFIRMADO', 'CANCELED': 'CANCELADO'}[order.payment_status]}<br/>
							<b>Forma de Entrega:</b> {{'EXPRESS': 'EXPRESSA', 'NORMAL': 'NORMAL', 'FREE': 'GRATUITA'}[order.shipping_type]}<br/>
							<b>Status da Entrega</b> {{'NOT_STARTED': 'NÃO INICIADA', 'IN_SEPARATION': 'EM SEPARAÇÃO', 'READY_FOR_DELIVERY': 'PRONTO PARA ENTREGA', 'OUT_TO_DELIVERY': 'SAIU PARA ENTREGA','DELIVERED': 'ENTREGUE', 'DELIVERY_FAILURE': 'FALHA NA ENTREGA'}[order.shipping_status]}<br/>
						</Typography>
						<Typography variant="h6" gutterBottom>
							Dados do Cliente
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>ID:</b> {order.customer_id}<br/>
							<b>Nome:</b> {order.customer_name}<br/>
							<b>Deseja ser tratada(o) como:</b> {order.customer_desired_name}<br/>
							<b>CPF:</b> {toCPF(order.customer_cpf)}<br/>
							<b>Idade:</b> {toAge(order.customer_birthday)}<br/>
							<b>Telefone:</b> {toPhone(order.customer_mobile)}<br/>
							<b>Whatsapp:</b> {toPhone(order.customer_whatsapp)}<br/>
						</Typography>
						<OrdersProductsTable order={order}/>
						<Typography variant="h6" gutterBottom>
							Endereço de Entrega
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>CEP:</b> {toCEP(order.shipping_cep)}<br/>
							<b>Bairro:</b> {order.shipping_district_name}<br/>
							<b>Cidade:</b> {order.shipping_city_name}<br/>
							<b>Estado:</b> {order.shipping_city_uf}<br/>
							<b>Logradouro:</b> {order.shipping_street}<br/>
							<b>Número:</b> {order.shipping_number}<br/>
							<b>Complemento:</b> {order.shipping_complement}<br/>
							<b>Observação:</b> {order.shipping_address_observation}<br/>
						</Typography>
					</React.Fragment>
					: <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose} color="primary">
						Voltar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(SeeOrderDialog)
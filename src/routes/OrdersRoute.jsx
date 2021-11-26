import React from "react";
import ReactDOM from "react-dom";

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

import {withStyles, useTheme} from '@material-ui/core/styles';

import CustomAppBar from '../components/CustomAppBar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LockIcon from '@material-ui/icons/Lock';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Button from '@material-ui/core/Button';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import SeeOrderDialog from '../components/SeeOrderDialog';
import SeeOrderEventsDialog from '../components/SeeOrderEventsDialog';
import TextField from '@material-ui/core/TextField';
import Pagination from '@material-ui/lab/Pagination';
import Autocomplete from '@material-ui/lab/Autocomplete';
import InfoIcon from '@material-ui/icons/Info';
import EditAttributesIcon from '@material-ui/icons/EditAttributes';
import ChangeOrderStatusDialog from '../components/ChangeOrderStatusDialog';
import PaymentIcon from '@material-ui/icons/Payment';
import ChangeOrderPaymentStatusDialog from '../components/ChangeOrderPaymentStatusDialog';
import LocalShippingIcon from '@material-ui/icons/LocalShipping';
import ChangeOrderShippingStatusDialog from '../components/ChangeOrderShippingStatusDialog';

import {toDateAndTime} from '../util/Dates';

const useStyles = (theme) => ({
	root: {
		width: '100%',
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		padding: theme.spacing(2),
		boxSizing: 'border-box',
	},
	progressArea: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	},
	actions: {
		marginTop: theme.spacing(1),
	},
	alert: {
		marginTop: theme.spacing(1),
	},
	filterPaper: {
		width: '100%',
		marginBottom: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'left',
		alignItems: 'center',
		gap: theme.spacing(1),
		flexWrap: 'wrap',
	},
	paginationArea: {
		marginTop: theme.spacing(1),
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		gap: theme.spacing(1),
		flexWrap: 'wrap'
	}
});

class OrdersRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			ordersLoaded: false, orders: [],
			profileLoaded: false, profile: {},
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
			filter: {
				customerInfo: '',
				orderId: '',
				status: null,
				payment_method: null,
				payment_status: null,
			},
			pagination: {
				rowsPerPage: 5,
				page: 1,
				count: 0,
			}
		}

		this.statusOptionsForFilter = [
			{type: 'IN_PROGRESS', name: 'EM ANDAMENTO'},
			{type: 'FINISHED', name: 'CONCLUÍDO'},
			{type: 'CANCELED', name: 'CANCELADO'},
		];

		this.paymentMethodOptionsForFilter = [
			{type: 'PIX', name: 'PIX'},
			{type: 'BOLETO', name: 'BOLETO'},
			{type: 'CREDIT', name: 'CARTÃO DE CRÉDITO'},
		];

		this.paymentStatusOptionsForFilter = [
			{type: 'NOT_STARTED', name: 'NÃO INICIADO'},
			{type: 'AWAITING_PAYMENT', name: 'AGUARDANDO CONFIRMAÇÃO'},
			{type: 'CONFIRMED', name: 'CONFIRMADO'},
			{type: 'CANCELED', name: 'CANCELADO'},
		];

		this.getOrders = this.getOrders.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSeeOrder = this.handleSeeOrder.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.handleSeeOrderEvents = this.handleSeeOrderEvents.bind(this);
		this.getUserProfile = this.getUserProfile.bind(this);
		this.handleChangeOrderStatus = this.handleChangeOrderStatus.bind(this);
		this.handleChangeOrderPaymentStatus = this.handleChangeOrderPaymentStatus.bind(this);
		this.handleChangeOrderShippingStatus = this.handleChangeOrderShippingStatus.bind(this);
	}

	componentDidMount() {
		this.getOrders();
		this.getUserProfile();
	}

	getOrders() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "orders/with-filter", {
			method: "POST",
			body: JSON.stringify({
				customerInfo: this.state.filter.customerInfo,
				orderId: this.state.filter.orderId,
				status: (this.state.filter.status != null) ? this.state.filter.status.type : '',
				payment_method: (this.state.filter.payment_method != null) ? this.state.filter.payment_method.type : '',
				payment_status: (this.state.filter.payment_status != null) ? this.state.filter.payment_status.type : '',
			}),
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
					let count = Math.ceil(data.orders.length / this.state.pagination.rowsPerPage);
					this.setState({
						ordersLoaded: true,
						orders: data.orders,
						pagination: {
							...this.state.pagination,
							count: count,
							page: Math.max(Math.min(this.state.pagination.page, count), 1),
						}
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getOrders, 5000);
			console.log(e);
		});
	}

	getUserProfile() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "users/me/profile", {
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
				}
				else
					this.setState({profileLoaded: true, profile: data.profile});
			})
		})
		.catch((e) => {
			setTimeout(this.getUserProfile, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({ordersLoaded: false, action: ''});
		this.getOrders();
	}

	handleSeeOrder(orderId) {
		this.setState({action: 'see order', actionInfo: {orderId: orderId}});
	}

	handleSeeOrderEvents(orderId) {
		this.setState({action: 'see order events', actionInfo: {orderId: orderId}});
	}

	handleChangeOrderStatus(orderId) {
		this.setState({action: 'change order status', actionInfo: {orderId: orderId}});
	}

	handleChangeOrderPaymentStatus(orderId) {
		this.setState({action: 'change order payment status', actionInfo: {orderId: orderId}});
	}

	handleChangeOrderShippingStatus(orderId) {
		this.setState({action: 'change order shipping status', actionInfo: {orderId: orderId}});
	}

	handleFilter(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({ordersLoaded: false});
		this.getOrders();
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Pedidos
						</Typography>
						<form action="#" onSubmit={this.handleFilter} autoComplete="on" style={{width: '100%'}}>
							<Paper className={classes.filterPaper}>
								<TextField
									style={{minWidth: '200px'}}
									onChange={(e) => this.setState({filter: {...this.state.filter, customerInfo: e.target.value}})}
									margin="normal"
									id="customerInfo"
									label="Nome, CPF ou ID do cliente"
									value={this.state.filter.customerInfo}
									InputProps={{
										inputProps: {
											maxLength: 50
										}
									}}
									disabled={this.state.trying}
								/>
								<TextField
									style={{minWidth: '200px'}}
									onChange={(e) => this.setState({filter: {...this.state.filter, orderId: e.target.value}})}
									margin="normal"
									id="orderId"
									label="ID do pedido"
									value={this.state.filter.orderId}
									InputProps={{
										inputProps: {
											maxLength: 10
										}
									}}
									disabled={this.state.trying}
								/>
								<Autocomplete
									id="filterStatus"
									style={{minWidth: '200px'}}
									value={this.state.filter.status}
									onChange={(e, newValue) => this.setState({filter: {...this.state.filter, status: newValue}})}
									options={this.statusOptionsForFilter}
									getOptionLabel={(option) => `${option.name}`}
									disabled={this.state.trying}
									renderInput={(params) => <TextField {...params} margin="normal" label="Status" />}
								/>
								<Autocomplete
									id="filterPaymentMethod"
									style={{minWidth: '200px'}}
									value={this.state.filter.payment_method}
									onChange={(e, newValue) => this.setState({filter: {...this.state.filter, payment_method: newValue}})}
									options={this.paymentMethodOptionsForFilter}
									getOptionLabel={(option) => `${option.name}`}
									disabled={this.state.trying}
									renderInput={(params) => <TextField {...params} margin="normal" label="Pagamento" />}
								/>
								<Autocomplete
									id="filterPaymentStatus"
									style={{minWidth: '200px'}}
									value={this.state.filter.payment_status}
									onChange={(e, newValue) => this.setState({filter: {...this.state.filter, payment_status: newValue}})}
									options={this.paymentStatusOptionsForFilter}
									getOptionLabel={(option) => `${option.name}`}
									disabled={this.state.trying}
									renderInput={(params) => <TextField {...params} margin="normal" label="Status do Pagamento" />}
								/>
								<Button variant="contained" color="primary" onClick={this.handleFilter} disabled={this.state.trying}>Filtrar</Button>
							</Paper>
							<input type="submit" style={{display: 'none'}}/>
						</form>
						<TableContainer component={Paper}>
							{(this.state.ordersLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Cliente</TableCell>
											<TableCell align="right">Status</TableCell>
											<TableCell align="right">Status do Pagamento</TableCell>
											<TableCell align="right">Data</TableCell>
											<TableCell align="right">Pagamento</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.orders.map((order, i) => (i>=(this.state.pagination.page-1) * this.state.pagination.rowsPerPage && i<=this.state.pagination.page * this.state.pagination.rowsPerPage - 1) ? <TableRow key={order.id}>
											<TableCell>{order.id}</TableCell>
											<TableCell align="right">({order.customer_id}) {order.customer_name}</TableCell>
											<TableCell align="right" style={{color: {'IN_PROGRESS': '#2196F3', 'FINISHED': '#4CAF50', 'CANCELED': '#F44336'}[order.status]}}><b>{{'IN_PROGRESS': 'EM ANDAMENTO', 'FINISHED': 'CONCLUÍDO', 'CANCELED': 'CANCELADO'}[order.status]}</b></TableCell>
											<TableCell align="right" style={{color: {'NOT_STARTED': '#FFC107', 'AWAITING_PAYMENT': '#2196F3', 'CONFIRMED': '#4CAF50', 'CANCELED': '#F44336'}[order.payment_status]}}><b>{{'NOT_STARTED': 'NÃO INICIADO', 'AWAITING_PAYMENT': 'AGUARDANDO CONFIRMAÇÃO', 'CONFIRMED': 'CONFIRMADO', 'CANCELED': 'CANCELADO'}[order.payment_status]}</b></TableCell>
											<TableCell align="right">{toDateAndTime(order.creation_datetime)}</TableCell>
											<TableCell align="right">{{'PIX': 'PIX', 'BOLETO': 'BOLETO', 'CREDIT': `CARTÃO DE CRÉDITO (em ${order.payment_installment_quantity}x)`}[order.payment_method]}</TableCell>
											<TableCell align="right">
												<Tooltip title="Ver" aria-label="Ver">
													<IconButton color="inherit" aria-label="Ver" onClick={() => this.handleSeeOrder(order.id)} disabled={this.state.trying}>
														<VisibilityIcon />
													</IconButton>
												</Tooltip>
												{(this.state.profileLoaded && this.state.profile['change_order_status'] && order.status != 'CANCELED') ? <Tooltip title="Alterar Status" aria-label="Alterar Status">
													<IconButton color="inherit" aria-label="Alterar Status" onClick={() => this.handleChangeOrderStatus(order.id)} disabled={this.state.trying}>
														<EditAttributesIcon />
													</IconButton>
												</Tooltip> : ''}
												{(this.state.profileLoaded && this.state.profile['change_order_payment_status'] && order.status == 'IN_PROGRESS') ? <Tooltip title="Alterar Status de Pagamento" aria-label="Alterar Status de Pagamento">
													<IconButton color="inherit" aria-label="Alterar Status de Pagamento" onClick={() => this.handleChangeOrderPaymentStatus(order.id)} disabled={this.state.trying}>
														<PaymentIcon />
													</IconButton>
												</Tooltip> : ''}
												{(this.state.profileLoaded && this.state.profile['change_order_shipping_status'] && order.status == 'IN_PROGRESS') ? <Tooltip title="Alterar Status de Entrega" aria-label="Alterar Status de Entrega">
													<IconButton color="inherit" aria-label="Alterar Status de Entrega" onClick={() => this.handleChangeOrderShippingStatus(order.id)} disabled={this.state.trying}>
														<LocalShippingIcon />
													</IconButton>
												</Tooltip> : ''}
												<Tooltip title="Ver Eventos" aria-label="Ver Eventos">
													<IconButton color="inherit" aria-label="Ver Eventos" onClick={() => this.handleSeeOrderEvents(order.id)} disabled={this.state.trying}>
														<InfoIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow> : '')}
									</TableBody>
								</Table>
							</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
						</TableContainer>
						<div className={classes.paginationArea}>
							<Pagination count={this.state.pagination.count} page={this.state.pagination.page} onChange={(e, newValue) => this.setState({pagination: {...this.state.pagination, page: newValue}})} />
							<Typography variant='caption'>Mostrando {Math.min((this.state.pagination.page-1) * this.state.pagination.rowsPerPage + 1, this.state.orders.length)}-{Math.min(this.state.pagination.page * this.state.pagination.rowsPerPage, this.state.orders.length)} de {this.state.orders.length}</Typography>
						</div>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								{(this.state.errorInput == 'error') ?
									<Alert className={classes.alert} severity="error" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert> : ''}
								{(this.state.errorInput == 'success') ?
									<Alert className={classes.alert} severity="success" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert> : ''}
							</Grid>
						</Grid>
						{/*<div className={classes.actions}>
							
						</div>*/}
						{(this.state.action == 'see order') ? <SeeOrderDialog orderId={this.state.actionInfo.orderId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'see order events') ? <SeeOrderEventsDialog orderId={this.state.actionInfo.orderId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'change order status') ? <ChangeOrderStatusDialog orderId={this.state.actionInfo.orderId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'change order payment status') ? <ChangeOrderPaymentStatusDialog orderId={this.state.actionInfo.orderId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'change order shipping status') ? <ChangeOrderShippingStatusDialog orderId={this.state.actionInfo.orderId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(OrdersRoute)
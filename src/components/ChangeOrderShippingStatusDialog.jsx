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

class ChangeOrderShippingStatusDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			shippingStatus: null,
			reason: '',
			orderLoaded: false,
			order: {},
			trying: false,
		}

		this.shippingStatusOptions = [
			{type: 'NOT_STARTED', name: 'NÃO INICIADA'},
			{type: 'IN_SEPARATION', name: 'EM SEPARAÇÃO'},
			{type: 'READY_FOR_DELIVERY', name: 'PRONTO PARA ENTREGA'},
			{type: 'OUT_TO_DELIVERY', name: 'SAIU PARA ENTREGA'},
			{type: 'DELIVERED', name: 'ENTREGUE'},
			{type: 'DELIVERY_FAILURE', name: 'FALHA NA ENTREGA'},
		];

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getOrder = this.getOrder.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
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
					
					this.setState({
						orderLoaded: true,
						order: data.order,
						shippingStatus: {
							'NOT_STARTED': this.shippingStatusOptions[0],
							'IN_SEPARATION': this.shippingStatusOptions[1],
							'READY_FOR_DELIVERY': this.shippingStatusOptions[2],
							'OUT_TO_DELIVERY': this.shippingStatusOptions[3],
							'DELIVERED': this.shippingStatusOptions[4],
							'DELIVERY_FAILURE': this.shippingStatusOptions[5],
						}[data.order.shipping_status]
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

	handleSubmit(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		fetch(Config.apiURL + "orders/" + this.props.orderId + "/update-shipping-status", {
			method: "PATCH",
			body: JSON.stringify({
				reason: this.state.reason,
				shipping_status: (this.state.shippingStatus != null) ? this.state.shippingStatus.type : '',
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
				} else if ('error' in data) {
					let input = '', message = '';
					switch(data.error) {
						case 'reason too short':
							input = 'reason';
							message = 'Motivo muito curto (min. 1)'
						break;
						case 'reason too long':
							input = 'reason';
							message = 'Motivo muito longo (max. 100)'
						break;
						case 'shipping_status invalid':
							input = 'shipping_status';
							message = 'Status inválido'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Status atualizado!', orderLoaded: false});
					this.getOrder();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.handleSubmit, 5000);
			console.log(e);
		});	
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<Dialog open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Alterar Status de Entrega		
				</DialogTitle>
				<DialogContent dividers>
					{this.state.orderLoaded ?
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<Grid container spacing={1}>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									<Autocomplete
										id="shippingStatus"
										style={{minWidth: '200px'}}
										fullWidth
										value={this.state.shippingStatus}
										onChange={(e, newValue) => this.setState({shippingStatus: newValue})}
										options={this.shippingStatusOptions}
										getOptionLabel={(option) => `${option.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'shipping_status'} helperText={(this.state.errorInput == 'shipping_status') ? this.state.errorMessage : ''} required margin="normal" label="Status" />}
									/>
								</Grid>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({reason: e.target.value})}
										margin="normal"
										id="reason"
										label="Motivo"
										value={this.state.reason}
										InputProps={{
											inputProps: {
												maxLength: 100
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'reason'}
										helperText={(this.state.errorInput == 'reason') ? this.state.errorMessage : ''}
									/>
								</Grid>
								{(this.state.errorInput == 'error') ?
								<Grid item xs={12}>
									<Alert severity="error" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert>
								</Grid> : ''}
								{(this.state.errorInput == 'success') ?
								<Grid item xs={12}>
									<Alert severity="success" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert>
								</Grid> : ''}
							</Grid>
							<input type="submit" style={{display: 'none'}}/>
						</form> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose}>
						Cancelar
					</Button>
					<Button onClick={this.handleSubmit} color="primary" disabled={this.state.trying}>
						Alterar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(ChangeOrderShippingStatusDialog)
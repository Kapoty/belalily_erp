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

class ChangeOrderPaymentStatusDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			paymentStatus: null,
			reason: '',
			orderLoaded: false,
			order: {},
			trying: false,
		}

		this.paymentStatusOptions = [
			{type: 'NOT_STARTED', name: 'NÃO INICIADO'},
			{type: 'AWAITING_PAYMENT', name: 'AGUARDANDO CONFIRMAÇÃO'},
			{type: 'CONFIRMED', name: 'CONFIRMADO'},
			{type: 'CANCELED', name: 'CANCELADO'},
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
						paymentStatus: {'NOT_STARTED': this.paymentStatusOptions[0], 'AWAITING_PAYMENT': this.paymentStatusOptions[1], 'CONFIRMED': this.paymentStatusOptions[2], 'CANCELED': this.paymentStatusOptions[3]}[data.order.payment_status]
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
		fetch(Config.apiURL + "orders/" + this.props.orderId + "/update-payment-status", {
			method: "PATCH",
			body: JSON.stringify({
				reason: this.state.reason,
				payment_status: (this.state.paymentStatus != null) ? this.state.paymentStatus.type : '',
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
						case 'payment_status invalid':
							input = 'payment_status';
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
					Alterar Status de Pagamento			
				</DialogTitle>
				<DialogContent dividers>
					{this.state.orderLoaded ?
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<Grid container spacing={1}>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									<Autocomplete
										id="paymentStatus"
										style={{minWidth: '200px'}}
										fullWidth
										value={this.state.paymentStatus}
										onChange={(e, newValue) => this.setState({paymentStatus: newValue})}
										options={this.paymentStatusOptions.filter((option) => option.type != 'NOT_STARTED')}
										getOptionLabel={(option) => `${option.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'payment_status'} helperText={(this.state.errorInput == 'payment_status') ? this.state.errorMessage : ''} required margin="normal" label="Status" />}
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

export default withStyles(useStyles)(ChangeOrderPaymentStatusDialog)
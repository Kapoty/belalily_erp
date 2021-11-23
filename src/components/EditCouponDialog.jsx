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

class EditCouponDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			code: '',
			type: null,
			value: 0.01,
			minimum_amount: 0,
			max_uses: 0,
			max_units: 0,
			consultant: null,
			consultantsLoaded: false,
			consultants: [],
			couponLoaded: false,
			coupon: {},
			trying: false,
		}

		this.types = [
			{type: 'PERCENT', name: 'PORCENTAGEM'},
			{type: 'GROSS', name: 'BRUTO'},
			{type: 'TWO_PERCENT', name: 'DOIS_PORCENTAGEM'},
			{type: 'TWO_GROSS', name: 'DOIS_BRUTO'}
		];

		this.getCoupon = this.getCoupon.bind(this);
		this.getConsultants = this.getConsultants.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.getConsultants();
	}

	getCoupon() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "coupons/" + this.props.couponId, {
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
					let consultant = null;
					for (let i=0; i< this.state.consultants.length; i++)
						if (this.state.consultants[i].id == data.coupon.consultant_id) {
							consultant = this.state.consultants[i];
							break;
						}
					let type = null;
					for (let i=0; i< this.types.length; i++)
						if (this.types[i].type == data.coupon.type) {
							type = this.types[i];
							break;
						}
					this.setState({
						couponLoaded: true,
						coupon: data.coupon,
						code: data.coupon.code,
						consultant: consultant,
						type: type,
						value: data.coupon.value,
						minimum_amount: data.coupon.minimum_amount,
						max_uses: data.coupon.max_uses,
						max_units: data.coupon.max_units,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCoupon, 5000);
			console.log(e);
		});
	}

	getConsultants() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "consultants/module", {
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
					this.setState({consultantsLoaded: true, consultants: data.consultants});
					this.getCoupon();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getConsultants, 5000);
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
		fetch(Config.apiURL + "coupons/" + this.props.couponId, {
			method: "PATCH",
			body: JSON.stringify({
				code: this.state.code,
				type: (this.state.type != null) ? this.state.type.type : '',
				value: parseFloat(this.state.value),
				minimum_amount: parseFloat(this.state.minimum_amount),
				max_uses: parseInt(this.state.max_uses),
				max_units: parseInt(this.state.max_units),
				consultant_id: (this.state.consultant != null) ? this.state.consultant.id : null,
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
						case 'code too short':
							input = 'code';
							message = 'Código muito curto (min. 3)'
						break;
						case 'code too long':
							input = 'code';
							message = 'Código muito longo (max. 20)'
						break;
						case 'code duplicate':
							input = 'code';
							message = 'Cupom já cadastrado'
						break;
						case 'code invalid':
							input = 'code';
							message = 'Código inválido (somente números/letras)'
						break;
						case 'type invalid':
							input = 'type';
							message = 'Tipo inválido'
						break;
						case 'value invalid':
							input = 'value';
							message = 'Valor inválido'
						break;
						case 'minimum_amount invalid':
							input = 'minimum_amount';
							message = 'Valor inválido'
						break;
						case 'max_uses invalid':
							input = 'max_uses';
							message = 'Valor inválido'
						break;
						case 'max_units invalid':
							input = 'max_units';
							message = 'Valor inválido'
						break;
						case 'consultant invalid':
							input = 'consultant';
							message = 'Consultor inválido'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Cupom salvo!', couponLoaded: false});
					this.getCoupon();
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
					Editar Cupom
				</DialogTitle>
				<DialogContent dividers>
					{this.state.couponLoaded ?
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<Grid container spacing={1}>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({code: e.target.value.toUpperCase()})}
										margin="normal"
										id="code"
										label="Código"
										value={this.state.code}
										InputProps={{
											inputProps: {
												maxLength: 20
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'code'}
										helperText={(this.state.errorInput == 'code') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									<Autocomplete
										id="type"
										fullWidth
										value={this.state.type}
										onChange={(e, newValue) => this.setState({type: newValue})}
										options={this.types}
										getOptionLabel={(type) => `${type.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'type'} helperText={(this.state.errorInput == 'type') ? this.state.errorMessage : ''} required margin="normal" label="Tipo" />}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										type="number"
										fullWidth
										onChange={(e) => this.setState({value: e.target.value})}
										margin="normal"
										id="value"
										label="Valor"
										value={this.state.value}
										InputProps={{
											inputProps: {
												min: 0.01,
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'value'}
										helperText={(this.state.errorInput == 'value') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										type="number"
										fullWidth
										onChange={(e) => this.setState({minimum_amount: e.target.value})}
										margin="normal"
										id="minimum_amount"
										label="Valor mínimo"
										value={this.state.minimum_amount}
										InputProps={{
											inputProps: {
												min: 0.01,
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'minimum_amount'}
										helperText={(this.state.errorInput == 'minimum_amount') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										type="number"
										fullWidth
										onChange={(e) => this.setState({max_uses: e.target.value})}
										margin="normal"
										id="max_uses"
										label="Máximo de usos"
										value={this.state.max_uses}
										InputProps={{
											inputProps: {
												min: 0,
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'max_uses'}
										helperText={(this.state.errorInput == 'max_uses') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={6}>
									<TextField
										required
										type="number"
										fullWidth
										onChange={(e) => this.setState({max_units: e.target.value})}
										margin="normal"
										id="max_units"
										label="Máximo de unidades"
										value={this.state.max_units}
										InputProps={{
											inputProps: {
												min: 0,
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'max_units'}
										helperText={(this.state.errorInput == 'max_units') ? this.state.errorMessage : ''}
									/>
								</Grid>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									{(this.state.consultantsLoaded) ?
										<Autocomplete
											id="consultant"
											fullWidth
											value={this.state.consultant}
											onChange={(e, newValue) => this.setState({consultant: newValue})}
											options={this.state.consultants}
											getOptionLabel={(consultant) => `${consultant.name}`}
											disabled={this.state.trying}
											renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'consultant'} helperText={(this.state.errorInput == 'consultant') ? this.state.errorMessage : ''} margin="normal" label="Consultor" />}
										/>
										: <CircularProgress color="primary"/>}
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
						Salvar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(EditCouponDialog)
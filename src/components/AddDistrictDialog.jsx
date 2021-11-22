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
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class AddDistrictDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			city: null,
			api_name: '',
			shipping_free_available: false,
			shipping_express_price: 0.01,
			shipping_normal_price: 0.01,
			citiesLoaded: false,
			cities: [],
			trying: false,
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getCities = this.getCities.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.getCities();
	}

	getCities() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "cities/module", {
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
				else 
					this.setState({citiesLoaded: true, cities: data.cities});
			})
		})
		.catch((e) => {
			setTimeout(this.getCities, 5000);
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
		fetch(Config.apiURL + "districts/", {
			method: "POST",
			body: JSON.stringify({
				name: this.state.name,
				city_id: (this.state.city != null) ? this.state.city.id : -1,
				api_name: this.state.api_name,
				shipping_free_available: this.state.shipping_free_available,
				shipping_normal_price: parseFloat(this.state.shipping_normal_price),
				shipping_express_price: parseFloat(this.state.shipping_express_price),
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
						case 'name too short':
							input = 'name';
							message = 'Nome muito curto (min. 1)'
						break;
						case 'name too long':
							input = 'name';
							message = 'Nome muito longo (max. 30)'
						break;
						case 'name duplicate':
							input = 'name';
							message = 'Bairro já cadastrado'
						break;
						case 'city invalid':
							input = 'city';
							message = 'Cidade inválida'
						break;
						case 'api_name too short':
							input = 'api_name';
							message = 'Nome muito curto (min. 1)'
						break;
						case 'api_name too long':
							input = 'api_name';
							message = 'Nome muito longo (max. 30)'
						break;
						case 'shipping_normal_price invalid':
							input = 'shipping_normal_price';
							message = 'Valor inválido'
						break;
						case 'shipping_express_price invalid':
							input = 'shipping_express_price';
							message = 'Valor inválido'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Bairro adicionado!'});
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
					Adicionar Bairro			
				</DialogTitle>
				<DialogContent dividers>
					<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
						<Grid container spacing={1}>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									onChange={(e) => this.setState({name: e.target.value})}
									margin="normal"
									id="name"
									label="Nome"
									value={this.state.name}
									InputProps={{
										inputProps: {
											maxLength: 30
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'name'}
									helperText={(this.state.errorInput == 'name') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
								{(this.state.citiesLoaded) ?
									<Autocomplete
										id="city"
										fullWidth
										value={this.state.city}
										onChange={(e, newValue) => this.setState({city: newValue})}
										options={this.state.cities}
										getOptionLabel={(city) => `${city.name} - ${city.uf}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'city'} helperText={(this.state.errorInput == 'city') ? this.state.errorMessage : ''} required margin="normal" label="Cidade" />}
									/>
									: <CircularProgress color="primary"/>}
							</Grid>
							<Grid item xs={12}>
								<TextField
									required
									fullWidth
									onChange={(e) => this.setState({api_name: e.target.value})}
									margin="normal"
									id="api_name"
									label="Nome na API"
									value={this.state.api_name}
									InputProps={{
										inputProps: {
											maxLength: 30
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'api_name'}
									helperText={(this.state.errorInput == 'api_name') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									type="number"
									fullWidth
									onChange={(e) => this.setState({shipping_normal_price: e.target.value})}
									margin="normal"
									id="shipping_normal_price"
									label="Valor da entrega normal"
									value={this.state.shipping_normal_price}
									InputProps={{
										inputProps: {
											min: 0.01,
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'shipping_normal_price'}
									helperText={(this.state.errorInput == 'shipping_normal_price') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									type="number"
									fullWidth
									onChange={(e) => this.setState({shipping_express_price: e.target.value})}
									margin="normal"
									id="shipping_express_price"
									label="Valor da entrega expressa"
									value={this.state.shipping_express_price}
									InputProps={{
										inputProps: {
											min: 0.01,
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'shipping_express_price'}
									helperText={(this.state.errorInput == 'shipping_express_price') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={12}>
								<FormControlLabel
									value={this.state.shipping_free_available}
									onChange={(e, newValue) => this.setState({shipping_free_available: newValue})}
									control={<Switch color="primary" checked={this.state.shipping_free_available}/>}
									label="Entrega Grátis disponível"
									labelPlacement="start"
									disabled={this.state.trying}
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
					</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose}>
						Cancelar
					</Button>
					<Button onClick={this.handleSubmit} color="primary" disabled={this.state.trying}>
						Adicionar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(AddDistrictDialog)
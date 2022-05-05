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
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';

const useStyles = (theme) => ({
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class EditProductDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			price: 0.01,
			price_in_cash: 0.01,
			description: '',
			position: 0,
			visible: false,
			productLoaded: false,
			product: {},
			trying: false,
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getProduct = this.getProduct.bind(this);
	}

	componentDidMount() {
		this.getProduct();
	}

	getProduct() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/" + this.props.productId, {
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
						productLoaded: true,
						product: data.product,
						name: data.product.name,
						price: data.product.price,
						price_in_cash: data.product.price_in_cash,
						description: data.product.description.replace(/<br\/>/g, '\n'),
						position: data.product.position,
						visible: data.product.visible,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProduct, 5000);
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
		fetch(Config.apiURL + "products/" + this.props.productId, {
			method: "PATCH",
			body: JSON.stringify({
				name: this.state.name,
				price: parseFloat(this.state.price),
				price_in_cash: parseFloat(this.state.price_in_cash),
				description: this.state.description.replace(/\n/g, '<br/>'),
				position: parseInt(this.state.position),
				visible: this.state.visible,
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
							message = 'Nome muito longo (max. 50)'
						break;
						case 'price invalid':
							input = 'price';
							message = 'Preço inválido'
						break;
						case 'price_in_cash invalid':
							input = 'price_in_cash';
							message = 'Preço à vista inválido'
						break;
						case 'position invalid':
							input = 'position';
							message = 'Posição inválida'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Produto atualizado!', productLoaded: false});
					this.getProduct();
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
					Editar Produto			
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
											maxLength: 50
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'name'}
									helperText={(this.state.errorInput == 'name') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									type="number"
									fullWidth
									onChange={(e) => this.setState({price: e.target.value})}
									margin="normal"
									id="price"
									label="Preço"
									value={this.state.price}
									InputProps={{
										inputProps: {
											min: 0.01,
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'price'}
									helperText={(this.state.errorInput == 'price') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									type="number"
									fullWidth
									onChange={(e) => this.setState({price_in_cash: e.target.value})}
									margin="normal"
									id="price_in_cash"
									label="Preço à vista"
									value={this.state.price_in_cash}
									InputProps={{
										inputProps: {
											min: 0.01,
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'price_in_cash'}
									helperText={(this.state.errorInput == 'price_in_cash') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={12}>
								<Typography variant="caption" color="textSecondary">Descrição</Typography>
								<TextareaAutosize
									style={{width: '100%', resize: 'none'}}
									onChange={(e) => this.setState({description: e.target.value})}
									value={this.state.description}
									disabled={this.state.trying}
									minRows={3}
								/>
							</Grid>
							<Grid item xs={12}>
								<TextField
									required
									type="number"
									fullWidth
									onChange={(e) => this.setState({position: e.target.value})}
									margin="normal"
									id="position"
									label="Posição"
									value={this.state.position}
									InputProps={{
										inputProps: {
											min: 0,
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'position'}
									helperText={(this.state.errorInput == 'position') ? this.state.errorMessage : ''}
								/>
							</Grid>
							<Grid item xs={6}>
								<FormControlLabel
									value={this.state.visible}
									onChange={(e, newValue) => this.setState({visible: newValue})}
									control={<Switch color="primary" checked={this.state.visible}/>}
									label="Visível"
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
						Salvar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(EditProductDialog)
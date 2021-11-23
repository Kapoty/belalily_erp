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

class AddCategoryDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			visible: false,
			positon: 0,
			categoryLoaded: false,
			category: {},
			trying: false,
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.getCategory = this.getCategory.bind(this);
	}

	componentDidMount() {
		this.getCategory();
	}

	getCategory() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "categories/" + this.props.categoryId, {
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
						categoryLoaded: true,
						category: data.category,
						name: data.category.name,
						visible: data.category.visible,
						position: data.category.position,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCategory, 5000);
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
		fetch(Config.apiURL + "categories/" + this.props.categoryId, {
			method: "PATCH",
			body: JSON.stringify({
				name: this.state.name,
				visible: this.state.visible,
				position: parseInt(this.state.position),
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
							message = 'Nome muito curto (min. 2)'
						break;
						case 'name too long':
							input = 'name';
							message = 'Nome muito longo (max. 20)'
						break;
						case 'name duplicate':
							input = 'name';
							message = 'Categoria já cadastrada'
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
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Categoria atualizada!', categoryLoaded: false});
					this.getCategory();
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
					Editar Categoria		
				</DialogTitle>
				<DialogContent dividers>
					{this.state.categoryLoaded ?
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
												maxLength: 20
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'name'}
										helperText={(this.state.errorInput == 'name') ? this.state.errorMessage : ''}
										autoComplete='name'
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
					 : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
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

export default withStyles(useStyles)(AddCategoryDialog)
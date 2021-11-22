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

class AddCityDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			uf: '',
			trying: false,
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	handleSubmit(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		fetch(Config.apiURL + "cities/", {
			method: "POST",
			body: JSON.stringify({
				name: this.state.name,
				uf: this.state.uf,
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
							message = 'Nome muito longo (max. 20)'
						break;
						case 'name duplicate':
							input = 'name';
							message = 'Cidade já cadastrada'
						break;
						case 'uf too short':
							input = 'uf';
							message = 'UF muito curta (min. 2)'
						break;
						case 'uf too long':
							input = 'uf';
							message = 'Nome muito longa (max. 2)'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Cidade adicionada!'});
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
					Adicionar Cidade
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
									fullWidth
									onChange={(e) => this.setState({uf: e.target.value})}
									margin="normal"
									id="uf"
									label="UF"
									value={this.state.uf}
									InputProps={{
										inputProps: {
											maxLength: 2
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'uf'}
									helperText={(this.state.errorInput == 'uf') ? this.state.errorMessage : ''}
									autoComplete='uf'
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

export default withStyles(useStyles)(AddCityDialog)
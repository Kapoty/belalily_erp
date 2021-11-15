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
import TextField from '@material-ui/core/TextField';
import LockIcon from '@material-ui/icons/Lock';
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';

const useStyles = (theme) => ({
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class ChangeUserPasswordDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			password: '',
			password_confirm: '',
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
		fetch(Config.apiURL + "users/" + this.props.userId + "/update-password", {
			method: "POST",
			body: JSON.stringify({
				password: this.state.password,
				password_confirm: this.state.password_confirm,
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
						case 'password too short':
							input = 'password';
							message = 'Senha muito curta (min. 8)'
						break;
						case 'password too long':
							input = 'password';
							message = 'Senha muito longa (max. 15)'
						break;
						case 'password invalid':
							input = 'password';
							message = 'Senha inválida (somente números/letras/@_)'
						break;
						case 'password_confirm not match':
							input = 'password_confirm';
							message = 'As senhas não conferem'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Senha alterada!'});
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
					Alterar Senha			
				</DialogTitle>
				<DialogContent dividers>
					<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
						<Grid container spacing={1}>
							<Grid item xs={6}>
								<TextField
									required
									fullWidth
									onChange={(e) => this.setState({password: e.target.value})}
									margin="normal"
									type="password"
									id="password"
									label="Nova Senha"
									value={this.state.password}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon />
											</InputAdornment>
										),
										inputProps: {
											maxLength: 15
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'password'}
									helperText={(this.state.errorInput == 'password') ? this.state.errorMessage : ''}
									autoComplete='password'
								/>
							</Grid>
							<Grid item xs={6}>
								<TextField
									required
									fullWidth
									onChange={(e) => this.setState({password_confirm: e.target.value})}
									margin="normal"
									type="password"
									id="password_confirm"
									label="Confirmação de Senha"
									value={this.state.password_confirm}
									InputProps={{
										startAdornment: (
											<InputAdornment position="start">
												<LockIcon />
											</InputAdornment>
										),
										inputProps: {
											maxLength: 15
										}
									}}
									disabled={this.state.trying}
									error={this.state.errorInput == 'password_confirm'}
									helperText={(this.state.errorInput == 'password_confirm') ? this.state.errorMessage : ''}
									autoComplete='password'
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
						Alterar Senha
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(ChangeUserPasswordDialog)
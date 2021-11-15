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
import Checkbox from '@material-ui/core/Checkbox';

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

class EditUserDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			userLoaded: false,
			user: {},
			username: '',
			profile: null,
			active: false,
			profilesLoaded: false,
			profiles: [],
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getUser = this.getUser.bind(this);
		this.getProfiles = this.getProfiles.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.getProfiles();
	}

	getUser() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "users/" + this.props.userId, {
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
					let profile = null;
					for (let i=0; i< this.state.profiles.length; i++)
						if (this.state.profiles[i].id == data.user.profile_id) {
							profile = this.state.profiles[i];
							break;
						}
					this.setState({
						userLoaded: true,
						user: data.user,
						username: data.user.username,
						profile: profile,
						active: data.user.active,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getUser, 5000);
			console.log(e);
		});
	}

	getProfiles() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "profiles/", {
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
					this.setState({profilesLoaded: true, profiles: data.profiles});
					this.getUser();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProfiles, 5000);
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
		fetch(Config.apiURL + "users/" + this.props.userId, {
			method: "PATCH",
			body: JSON.stringify({
				username: this.state.username,
				profile_id: (this.state.profile != null) ? this.state.profile.id : -1,
				active: this.state.active,
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
						case 'username too short':
							input = 'username';
							message = 'Usuário muito curto (min. 4)'
						break;
						case 'username too long':
							input = 'username';
							message = 'Usuário muito longo (max. 12)'
						break;
						case 'username duplicate':
							input = 'username';
							message = 'Usuário já cadastrado'
						break;
						case 'username invalid':
							input = 'username';
							message = 'Usuário inválido (somente números/letras/_)'
						break;
						case 'profile invalid':
							input = 'profile';
							message = 'Perfil inválido'
						break;
						case 'active invalid':
							input = 'error';
							message = 'Situação de ativo inválida'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', userLoaded: false, errorMessage: 'Usuário atualizado!'});
					this.getUser();
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
					Editar Usuário			
				</DialogTitle>
				<DialogContent dividers>
					{this.state.userLoaded ?
						<form action="#" onSubmit={this.handleSubmit} autoComplete="on">
							<Grid container spacing={1}>
								<Grid item xs={12}>
									<TextField
										required
										fullWidth
										onChange={(e) => this.setState({username: e.target.value})}
										margin="normal"
										id="username"
										label="Usuário"
										value={this.state.username}
										InputProps={{
											startAdornment: (
												<InputAdornment position="start">
													<AccountCircle />
												</InputAdornment>
											),
											inputProps: {
												maxLength: 12
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'username'}
										helperText={(this.state.errorInput == 'username') ? this.state.errorMessage : ''}
										autoComplete='username'
									/>
								</Grid>
								<Grid item xs={12} style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
									{(this.state.profilesLoaded) ?
										<Autocomplete
											id="profile"
											fullWidth
											value={this.state.profile}
											onChange={(e, newValue) => this.setState({profile: newValue})}
											options={this.state.profiles}
											getOptionLabel={(profile) => `${profile.name}`}
											disabled={this.state.trying}
											renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'profile'} helperText={(this.state.errorInput == 'profile') ? this.state.errorMessage : ''} required margin="normal" label="Perfil" />}
										/>
										: <CircularProgress color="primary"/>}
								</Grid>
								<Grid item xs={12}>
									<FormControlLabel
										value={this.state.active}
										onChange={(e, newValue) => this.setState({active: newValue})}
										control={<Checkbox color="primary" checked={this.state.active}/>}
										label="Ativo"
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

export default withStyles(useStyles)(EditUserDialog)
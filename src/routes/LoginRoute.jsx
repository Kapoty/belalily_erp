import React from "react";
import ReactDOM from "react-dom";

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

import {withStyles, useTheme} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import AccountCircle from '@material-ui/icons/AccountCircle';
import LockIcon from '@material-ui/icons/Lock';
import InputAdornment from '@material-ui/core/InputAdornment';
import Grid from '@material-ui/core/Grid';
import { Alert, AlertTitle } from '@material-ui/lab';
import Paper from '@material-ui/core/Paper';
import CircularProgress from '@material-ui/core/CircularProgress';

const useStyles = (theme) => ({
	root: {
		minWidth: '100vw',
		minHeight: '100vh',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	paper: {
		width: '400px',
		margin: theme.spacing(2),
		padding: theme.spacing(2),
		boxSizing: 'border-box',
	},
	logoImg: {
		width: '128px',
	}
});

class LoginRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {verifying: true, login: '', password: '', trying: false, errorMessage: ''};

		this.handleLogin = this.handleLogin.bind(this);
		this.verifyToken = this.verifyToken.bind(this);
	}

	componentDidMount() {
		this.verifyToken();
	}

	verifyToken() {
		if (cookies.get('user-token') == null) {
			this.setState({verifying: false});
			return;
		}
		fetch(Config.apiURL + "users/me/verify-token", {
			method: "GET",
			headers: { 
			"Content-type": "application/json; charset=UTF-8",
			"x-user-token": cookies.get('user-token'),
			} 
		})
		.then((resp) => {
			resp.json().then((data) => {
				if (!('auth' in data) || !data.auth) {
					cookies.remove('user-token');
					this.setState({verifying: false});
				}
				else
					this.props.history.push('/painel')
			})
		})
		.catch((e) => {
			setTimeout(this.verifyToken, 5000);
			console.log(e);
		});
	}

	handleLogin(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		fetch(Config.apiURL + "users/login", {
				method: "POST",
				body: JSON.stringify({login: this.state.login, password: this.state.password}),
				headers: { 
					"Content-type": "application/json; charset=UTF-8",
				} 
			})
			.then((resp) => {
				resp.json().then((data) => {
					if ('error' in data) {
						let input = '', message = '';
						switch(data.error) {
							case 'incorrect data':
								input = 'error';
								message = 'Dados inválidos'
							break;
						}
						this.setState({trying: false, errorMessage: message});
					}
					else {
						cookies.set('user-token', data.userToken);
						this.props.history.push('/painel');
					}
				})
			})
			.catch((e) => {
				setTimeout(this.handleLogin, 5000);
				console.log(e);
			});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<div className={classes.root}>
						{(this.state.verifying) ? <CircularProgress color="primary"/> :
						<form action="#" onSubmit={this.handleLogin} autoComplete="on">
							<Paper className={classes.paper} elevation={3}>
								<Grid container spacing={3}>
									<Grid item xs={12} container justifyContent='center'>
										<img className={classes.logoImg} src='./assets/image/logo-round.png'/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											required
											fullWidth
											onChange={(e) => this.setState({login: e.target.value})}
											margin="normal"
											id="login"
											label="Usuário"
											value={this.state.login}
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
											autoComplete='username'
										/>
									</Grid>
									<Grid item xs={12}>
										<TextField
											required
											fullWidth
											onChange={(e) => this.setState({password: e.target.value})}
											margin="normal"
											type="password"
											id="password"
											label="Senha"
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
											autoComplete='password'
										/>
									</Grid>
									<input type="submit" style={{display: 'none'}}/>
									{(this.state.errorMessage != '') ? <Grid item xs={12}>
										<Alert severity="error">
											<AlertTitle>{this.state.errorMessage}</AlertTitle>
										</Alert>
									</Grid> : ''}
									<Grid item xs={6}>
										<Button onClick={this.handleLogin} color="primary" disabled={this.state.trying}>
											Entrar
										</Button>
									</Grid>
									<Grid item xs={6}>
									</Grid>
								</Grid>
							</Paper>
						</form>}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(LoginRoute)
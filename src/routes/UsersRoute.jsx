import React from "react";
import ReactDOM from "react-dom";

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

import {withStyles, useTheme} from '@material-ui/core/styles';

import CustomAppBar from '../components/CustomAppBar';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import LockIcon from '@material-ui/icons/Lock';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import EditIcon from '@material-ui/icons/Edit';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Button from '@material-ui/core/Button';
import AddUserDialog from '../components/AddUserDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditUserDialog from '../components/EditUserDialog';
import ChangeUserPasswordDialog from '../components/ChangeUserPasswordDialog';

const useStyles = (theme) => ({
	root: {
		width: '100%',
		display: 'flex',
		flexWrap: 'wrap',
		justifyContent: 'center',
		padding: theme.spacing(2),
		boxSizing: 'border-box',
	},
	progressArea: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	},
	actions: {
		marginTop: theme.spacing(1),
	},
	alert: {
		marginTop: theme.spacing(1),
	}
});

class UsersRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			usersLoaded: false, users: [],
			profilesLoaded: false, profiles: [], profilesById: {},
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
		}
		this.getUsers = this.getUsers.bind(this);
		this.getProfiles = this.getProfiles.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteUser = this.handleDeleteUser.bind(this);
		this.handleEditUser = this.handleEditUser.bind(this);
		this.handleChangeUserPassword = this.handleChangeUserPassword.bind(this);
	}

	componentDidMount() {
		this.getUsers();
		this.getProfiles();
	}

	getUsers() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "users/", {
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
					this.setState({usersLoaded: true, users: data.users});
			})
		})
		.catch((e) => {
			setTimeout(this.getUsers, 5000);
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
					let profilesById = {}
					data.profiles.forEach((profile) => profilesById[profile.id] = profile)
					this.setState({profilesLoaded: true, profiles: data.profiles, profilesById: profilesById});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProfiles, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({usersLoaded: false, profilesLoaded: false, action: ''});
		this.getUsers();
		this.getProfiles();
	}

	handleDeleteUser(userId) {
		if (window.confirm(`Deseja realmente deletar o usuário id ${userId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "users/"+userId, {
				method: "DELETE",
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
							case 'cannot delete yourself':
									input = 'error';
									message = 'Não é possível deletar a si mesmo'
								break;
							default:
								input = 'error';
								message = 'Erro inesperado: '+data.error;
						}
						this.setState({trying: false, errorInput: input, errorMessage: message});
					}
					else {
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Usuário deletado!', usersLoaded: false});
						this.getUsers();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteUser(userId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditUser(userId) {
		this.setState({action: 'edit user', actionInfo: {userId: userId}});
	}

	handleChangeUserPassword(userId) {
		this.setState({action: 'change user password', actionInfo: {userId: userId}});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Usuários
						</Typography>
						<TableContainer component={Paper}>
							{(this.state.usersLoaded && this.state.profilesLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Usuário</TableCell>
											<TableCell align="right">Perfil</TableCell>
											<TableCell align="right">Ativo</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.users.map((user) => <TableRow key={user.id}>
											<TableCell>{user.id}</TableCell>
											<TableCell align="right">{user.username}</TableCell>
											<TableCell align="right">{this.state.profilesById[user.profile_id].name}</TableCell>
											<TableCell align="right">{['Não', 'Sim'][user.active]}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditUser(user.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Alterar Senha" aria-label="Alterar Senha">
													<IconButton color="inherit" aria-label="Alterar Senha" onClick={() => this.handleChangeUserPassword(user.id)} disabled={this.state.trying}>
														<LockIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Apagar Usuário" aria-label="Apagar Usuário">
													<IconButton color="inherit" aria-label="Apagar Usuário" onClick={() => this.handleDeleteUser(user.id)} disabled={this.state.trying}>
														<DeleteForeverIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow>)}
									</TableBody>
								</Table>
							</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
						</TableContainer>
						<Grid container spacing={1}>
							<Grid item xs={12}>
								{(this.state.errorInput == 'error') ?
									<Alert className={classes.alert} severity="error" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert> : ''}
								{(this.state.errorInput == 'success') ?
									<Alert className={classes.alert} severity="success" onClose={() => this.setState({errorInput: ''})}>
										<AlertTitle>{this.state.errorMessage}</AlertTitle>
									</Alert> : ''}
							</Grid>
						</Grid>
						<div className={classes.actions} onClick={() => this.setState({action: 'add user'})}>
							<Button variant="contained" color="primary" disabled={this.state.trying}>Adicionar Usuário</Button>
						</div>
						{(this.state.action == 'add user') ? <AddUserDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit user') ? <EditUserDialog userId={this.state.actionInfo.userId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'change user password') ? <ChangeUserPasswordDialog userId={this.state.actionInfo.userId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(UsersRoute)
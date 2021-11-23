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

class EditConsultantDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			name: '',
			code: '',
			trying: false,
			consultantLoaded: false,
			consultant: {},
		}

		this.getConsultant = this.getConsultant.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentDidMount() {
		this.getConsultant();
	}

	getConsultant() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "consultants/" + this.props.consultantId, {
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
						consultantLoaded: true,
						consultant: data.consultant,
						name: data.consultant.name,
						code: data.consultant.code,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getConsultant, 5000);
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
		fetch(Config.apiURL + "consultants/" + this.props.consultantId, {
			method: "PATCH",
			body: JSON.stringify({
				name: this.state.name,
				code: this.state.code,
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
							message = 'Nome muito longo (max. 50)'
						break;
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
							message = 'Código já cadastrado'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Consultor atualizado!', consultantLoaded: false});
					this.getConsultant();
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
					Editar Consultor
				</DialogTitle>
				<DialogContent dividers>
					{this.state.consultantLoaded ?
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
												maxLength: 10
											}
										}}
										disabled={this.state.trying}
										error={this.state.errorInput == 'code'}
										helperText={(this.state.errorInput == 'code') ? this.state.errorMessage : ''}
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

export default withStyles(useStyles)(EditConsultantDialog)
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

import {toCEP} from '../util/CEP';
import {toDate} from '../util/Dates';
import {toCPF} from '../util/CPF';
import {toPhone} from '../util/Phone';

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

class SeeCustomerDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			customerLoaded: false,
			customer: {},
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getCustomer = this.getCustomer.bind(this);
	}

	componentDidMount() {
		this.getCustomer();
	}

	getCustomer() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "customers/" + this.props.customerId, {
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
						customerLoaded: true,
						customer: data.customer,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCustomer, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<Dialog open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Ver Cliente
				</DialogTitle>
				<DialogContent dividers>
					{this.state.customerLoaded ? <React.Fragment>
						<Typography variant="h6" gutterBottom>
							Informações Pessoais
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>Nome:</b> {this.state.customer.name}<br/>
							<b>Desejo ser tratada(o) como:</b> {this.state.customer.desired_name}<br/>
							<b>CPF:</b> {toCPF(this.state.customer.cpf)}<br/>
							<b>Data de Nascimento:</b> {toDate(this.state.customer.birthday)}<br/>
							<b>Telefone:</b> {toPhone(this.state.customer.mobile)}<br/>
							<b>Whatsapp:</b> {toPhone(this.state.customer.whatsapp)}<br/>
						</Typography>
						<Typography variant="h6" gutterBottom>
							Endereço de Entrega
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>CEP:</b> {toCEP(this.state.customer.cep)}<br/>
							<b>Bairro:</b> {this.state.customer.district_name}<br/>
							<b>Cidade:</b> {this.state.customer.city_name}<br/>
							<b>Estado:</b> {this.state.customer.uf}<br/>
							<b>Logradouro:</b> {this.state.customer.street}<br/>
							<b>Número:</b> {this.state.customer.number}<br/>
							<b>Complemento:</b> {this.state.customer.complement}<br/>
							<b>Observação:</b> {this.state.customer.address_observation}<br/>
						</Typography>
						<Typography variant="h6" gutterBottom>
							Dados de Acesso
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>E-mail:</b> {this.state.customer.email}<br/>
						</Typography>
						<Typography variant="h6" gutterBottom>
							Recuperação de Conta
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>Pergunta Secreta:</b> {this.state.customer.secret_question}<br/>
						</Typography>
						<Typography variant="h6" gutterBottom>
							Notificações
						</Typography>
						<Typography variant="body1" gutterBottom>
							<b>Aceito receber promoções e avisos por E-mail:</b> {['Não', 'Sim'][this.state.customer.allow_email]}<br/>
							<b>Aceito receber promoções e avisos pelo Whatsapp:</b> {['Não', 'Sim'][this.state.customer.allow_whatsapp]}<br/>
						</Typography>
					</React.Fragment>
					: <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose} color="primary">
						Voltar
					</Button>
				</DialogActions>
			</Dialog>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(SeeCustomerDialog)
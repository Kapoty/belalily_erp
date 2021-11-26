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
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';

import {toCEP} from '../util/CEP';
import {toDateAndTime} from '../util/Dates';
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

class SeeOrderEventsDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			eventsLoaded: false,
			events: [],
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getEvents = this.getEvents.bind(this);
	}

	componentDidMount() {
		this.getEvents();
	}

	getEvents() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "orders/" + this.props.orderId + "/events", {
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
						eventsLoaded: true,
						events: data.events,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getEvents, 5000);
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
					Ver Eventos
				</DialogTitle>
				<DialogContent dividers>
					{this.state.eventsLoaded ? <React.Fragment>
						<Table aria-label="spanning table" size="small">
							<TableHead>
								<TableRow>
									<TableCell align="right">Data</TableCell>
									<TableCell align="right">Tipo</TableCell>
									<TableCell align="left">Descrição</TableCell>
									<TableCell align="right">Usuário</TableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								{this.state.events.map((event) => <TableRow key={event.id}>
									<TableCell align="right">{toDateAndTime(event.date)}</TableCell>
									<TableCell align="right">{event.type}</TableCell>
									<TableCell align="left"><pre style={{whiteSpace: 'pre-wrap', wordWrap: 'break-word'}}>{event.description}</pre></TableCell>
									<TableCell align="right">{event.user_username}</TableCell>
								</TableRow>)}
							</TableBody>
						</Table>
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

export default withStyles(useStyles)(SeeOrderEventsDialog)
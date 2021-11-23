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
import VisibilityIcon from '@material-ui/icons/Visibility';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Button from '@material-ui/core/Button';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import SeeCustomerDialog from '../components/SeeCustomerDialog';
import TextField from '@material-ui/core/TextField';
import Pagination from '@material-ui/lab/Pagination';

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
	},
	filterPaper: {
		width: '100%',
		marginBottom: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		alignItems: 'center',
		gap: theme.spacing(1),
	},
	paginationArea: {
		marginTop: theme.spacing(1),
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		gap: theme.spacing(1),
		flexWrap: 'wrap'
	}
});

class CustomersRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			customersLoaded: false, customers: [],
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
			filter: {
				text: '',
			},
			pagination: {
				rowsPerPage: 5,
				page: 1,
				count: 0,
			}
		}
		this.getCustomers = this.getCustomers.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleSeeCustomer = this.handleSeeCustomer.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}

	componentDidMount() {
		this.getCustomers();
	}

	getCustomers() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "customers/with-filter", {
			method: "POST",
			body: JSON.stringify({
				text: this.state.filter.text,
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
				} else if ('error' in data)
					this.props.history.push('/painel');
				else {
					let count = Math.ceil(data.customers.length / this.state.pagination.rowsPerPage);
					this.setState({
						customersLoaded: true,
						customers: data.customers,
						pagination: {
							...this.state.pagination,
							count: count,
							page: Math.max(Math.min(this.state.pagination.page, count), 1),
						}
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCustomers, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({customersLoaded: false, action: ''});
		this.getCustomers();
	}

	handleSeeCustomer(customerId) {
		this.setState({action: 'see customer', actionInfo: {customerId: customerId}});
	}

	handleFilter(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({customersLoaded: false});
		this.getCustomers();
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Clientes
						</Typography>
						<form action="#" onSubmit={this.handleFilter} autoComplete="on" style={{width: '100%'}}>
							<Paper className={classes.filterPaper}>
								<TextField
									fullWidth
									onChange={(e) => this.setState({filter: {...this.state.filter, text: e.target.value}})}
									margin="normal"
									id="filterText"
									label="Nome, CPF ou ID"
									value={this.state.filter.text}
									InputProps={{
										inputProps: {
											maxLength: 50
										}
									}}
									disabled={this.state.trying}
								/>
								<Button variant="contained" color="primary" onClick={this.handleFilter} disabled={this.state.trying}>Filtrar</Button>
							</Paper>
							<input type="submit" style={{display: 'none'}}/>
						</form>
						<TableContainer component={Paper}>
							{(this.state.customersLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Nome</TableCell>
											<TableCell align="right">CPF</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.customers.map((customer, i) => (i>=(this.state.pagination.page-1) * this.state.pagination.rowsPerPage && i<=this.state.pagination.page * this.state.pagination.rowsPerPage - 1) ? <TableRow key={customer.id}>
											<TableCell>{customer.id}</TableCell>
											<TableCell align="right">{customer.name}</TableCell>
											<TableCell align="right">{customer.cpf}</TableCell>
											<TableCell align="right">
												<Tooltip title="Ver" aria-label="Ver">
													<IconButton color="inherit" aria-label="Ver" onClick={() => this.handleSeeCustomer(customer.id)} disabled={this.state.trying}>
														<VisibilityIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow> : '')}
									</TableBody>
								</Table>
							</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
						</TableContainer>
						<div className={classes.paginationArea}>
							<Pagination count={this.state.pagination.count} page={this.state.pagination.page} onChange={(e, newValue) => this.setState({pagination: {...this.state.pagination, page: newValue}})} />
							<Typography variant='caption'>Mostrando {(this.state.pagination.page-1) * this.state.pagination.rowsPerPage + 1}-{Math.min(this.state.pagination.page * this.state.pagination.rowsPerPage, this.state.customers.length)} de {this.state.customers.length}</Typography>
						</div>
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
						{/*<div className={classes.actions}>
							
						</div>*/}
						{(this.state.action == 'see customer') ? <SeeCustomerDialog customerId={this.state.actionInfo.customerId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(CustomersRoute)
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
import AddDistrictDialog from '../components/AddDistrictDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditDistrictDialog from '../components/EditDistrictDialog';
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
	pagination: {
		marginTop: theme.spacing(1),
	}
});

class DistrictsRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			districtsLoaded: false, districts: [],
			citiesLoaded: false, cities: [], citiesById: {},
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
			filter: {
				text: '',
			},
			pagination: {
				rowsPerPage: 10,
				page: 1,
				count: 0,
			}
		}
		this.getCities = this.getCities.bind(this);
		this.getDistricts = this.getDistricts.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteDistrict = this.handleDeleteDistrict.bind(this);
		this.handleEditDistrict = this.handleEditDistrict.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}

	componentDidMount() {
		this.getDistricts();
		this.getCities();
	}

	getDistricts() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "districts/with-filter", {
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
					let count = Math.ceil(data.districts.length / this.state.pagination.rowsPerPage);
					this.setState({
						districtsLoaded: true,
						districts: data.districts,
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
			setTimeout(this.getDistricts, 5000);
			console.log(e);
		});
	}

	getCities() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "cities/module", {
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
					let citiesById = {}
					data.cities.forEach((city) => citiesById[city.id] = city)
					this.setState({citiesLoaded: true, cities: data.cities, citiesById: citiesById});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCities, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({districtsLoaded: false, citiesLoaded: false, action: ''});
		this.getDistricts();
		this.getCities();
	}

	handleDeleteDistrict(districtId) {
		if (window.confirm(`Deseja realmente deletar o bairro id ${districtId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "districts/" + districtId, {
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
							default:
								input = 'error';
								message = 'Erro inesperado: '+data.error;
						}
						this.setState({trying: false, errorInput: input, errorMessage: message});
					}
					else {
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Bairro deletado!', districtsLoaded: false, citiesLoaded: false});
						this.getDistricts();
						this.getCities();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteDistrict(districtId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditDistrict(districtId) {
		this.setState({action: 'edit district', actionInfo: {districtId: districtId}});
	}

	handleFilter(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({districtsLoaded: false, citiesLoaded: false});
		this.getDistricts();
		this.getCities();
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Bairros
						</Typography>
						<form action="#" onSubmit={this.handleFilter} autoComplete="on" style={{width: '100%'}}>
							<Paper className={classes.filterPaper}>
								<TextField
									fullWidth
									onChange={(e) => this.setState({filter: {...this.state.filter, text: e.target.value}})}
									margin="normal"
									id="filterText"
									label="Nome ou ID"
									value={this.state.filter.text}
									InputProps={{
										inputProps: {
											maxLength: 30
										}
									}}
									disabled={this.state.trying}
								/>
								<Button variant="contained" color="primary" onClick={this.handleFilter} disabled={this.state.trying}>Filtrar</Button>
							</Paper>
							<input type="submit" style={{display: 'none'}}/>
						</form>
						<TableContainer component={Paper}>
							{(this.state.districtsLoaded && this.state.citiesLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Nome</TableCell>
											<TableCell align="right">Cidade</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.districts.map((district, i) => (i>=(this.state.pagination.page-1) * this.state.pagination.rowsPerPage && i<=this.state.pagination.page * this.state.pagination.rowsPerPage - 1) ? <TableRow key={district.id}>
											<TableCell>{district.id}</TableCell>
											<TableCell align="right">{district.name}</TableCell>
											<TableCell align="right">{this.state.citiesById[district.city_id].name + ' - ' + this.state.citiesById[district.city_id].uf}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditDistrict(district.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Apagar Bairro" aria-label="Apagar Bairro">
													<IconButton color="inherit" aria-label="Apagar Bairro" onClick={() => this.handleDeleteDistrict(district.id)} disabled={this.state.trying}>
														<DeleteForeverIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow> : '')}
									</TableBody>
								</Table>
							</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
						</TableContainer>
						<Pagination className={classes.pagination} count={this.state.pagination.count} page={this.state.pagination.page} onChange={(e, newValue) => this.setState({pagination: {...this.state.pagination, page: newValue}})} />
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
						<div className={classes.actions}>
							<Button variant="contained" color="primary" disabled={this.state.trying} onClick={() => this.setState({action: 'add district'})}>Adicionar Bairro</Button>
						</div>
						{(this.state.action == 'add district') ? <AddDistrictDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit district') ? <EditDistrictDialog districtId={this.state.actionInfo.districtId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(DistrictsRoute)
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
import InputAdornment from '@material-ui/core/InputAdornment';
import CircularProgress from '@material-ui/core/CircularProgress';
import { Alert, AlertTitle } from '@material-ui/lab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import TextareaAutosize from '@material-ui/core/TextareaAutosize';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import InfoIcon from '@material-ui/icons/Info';
import SeeProductInventoryEventsDialog from '../components/SeeProductInventoryEventsDialog';
import EditAttributesIcon from '@material-ui/icons/EditAttributes';
import ChangeProductInventoryStatusDialog from '../components/ChangeProductInventoryStatusDialog';
import Pagination from '@material-ui/lab/Pagination';
import Accordion from '@material-ui/core/Accordion';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import AccordionSummary from '@material-ui/core/AccordionSummary';

const useStyles = (theme) => ({
	addPaper: {
		minWidth: '300px',
		width: '100%',
		maxWidth: '400px',
		marginTop: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
	},
	table: {
		marginBottom: theme.spacing(1),
	},
	progressArea: {
		display: 'flex',
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	},
	filterPaper: {
		width: '100%',
		marginBottom: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'left',
		alignItems: 'center',
		gap: theme.spacing(1),
		flexWrap: 'wrap',
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

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class EditProductInventoryDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			productInventoryLoaded: false,
			productInventory: [],
			filteredProductInventory: [],
			sizesLoaded: false,
			sizes: [],
			sizesById: {},
			productSizesLoaded: false,
			productSizes: [],
			size: null,
			status: null,
			reason: '',
			trying: false,
			action: '', actionInfo: {},
			filter: {
				size: null,
				status: null,
			},
			pagination: {
				rowsPerPage: 5,
				page: 1,
				count: 0,
			},
			addAccordionOpenend: false,
		}

		this.statusOptions = [
			{type: 'AVAILABLE', name: 'DISPONÍVEL'},
			{type: 'UNAVAILABLE', name: 'INDISPONÍVEL'},
		];

		this.statusOptionsForFilter = [
			{type: 'AVAILABLE', name: 'DISPONÍVEL'},
			{type: 'UNAVAILABLE', name: 'INDISPONÍVEL'},
			{type: 'IN_ORDER', name: 'EM_PEDIDO'},
		];

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getProductInventory = this.getProductInventory.bind(this);
		this.getSizes = this.getSizes.bind(this);
		this.getProductSizes = this.getProductSizes.bind(this);
		this.handleAddProductInventory = this.handleAddProductInventory.bind(this);
		this.handleSeeProductInventoryEvents = this.handleSeeProductInventoryEvents.bind(this);
		this.handleChildDialogClose = this.handleChildDialogClose.bind(this);
		this.handleChangeProductInventoryStatus = this.handleChangeProductInventoryStatus.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
	}

	componentDidMount() {
		this.getProductInventory();
		this.getSizes();
		this.getProductSizes();
	}

	getProductInventory() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/" + this.props.productId + "/inventory/module", {
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
						productInventoryLoaded: true,
						productInventory: data.inventory,
					}, () => this.handleFilter());
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductInventory, 5000);
			console.log(e);
		});
	}

	getSizes() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "sizes/", {
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
					let sizesById = {}
					data.sizes.forEach((size) => sizesById[size.id] = size);
					this.setState({
						sizesLoaded: true,
						sizes: data.sizes,
						sizesById: sizesById,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductSizes, 5000);
			console.log(e);
		});
	}

	getProductSizes() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/" + this.props.productId + "/sizes", {
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
						productSizesLoaded: true,
						productSizes: data.sizes,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductSizes, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	handleAddProductInventory(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		fetch(Config.apiURL + "products/" + this.props.productId + "/inventory/", {
			method: "POST",
			body: JSON.stringify({
				size_id: (this.state.size != null) ? this.state.size.id : -1,
				status: (this.state.status != null) ? this.state.status.type : '',
				reason: this.state.reason,
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
						case 'reason too short':
							input = 'reason';
							message = 'Motivo muito curto (min. 1)'
						break;
						case 'reason too long':
							input = 'reason';
							message = 'Motivo muito longo (max. 100)'
						break;
						case 'status invalid':
							input = 'status';
							message = 'Status inválido'
						break;
						case 'size invalid':
							input = 'size';
							message = 'Tamanho inválido'
						break;
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Unidade adicionada!', productInventoryLoaded: false});
					this.getProductInventory();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.handleAddProductSize, 5000);
			console.log(e);
		});	
	}

	handleSeeProductInventoryEvents(productInventoryId) {
		this.setState({action: 'see product inventory events', actionInfo: {productInventoryId: productInventoryId}});
	}

	handleChangeProductInventoryStatus(productInventoryId) {
		this.setState({action: 'change product inventory status', actionInfo: {productInventoryId: productInventoryId}});
	}

	handleChildDialogClose() {
		this.setState({productInventoryLoaded: false, action: ''});
		this.getProductInventory();
	}

	handleFilter(e) {
		if (e != undefined)
			e.preventDefault();
		let filteredProductInventory = this.state.productInventory.filter((inventory) => {
			return (
				(this.state.filter.size == null || inventory.size_id == this.state.filter.size.id) &&
				(this.state.filter.status == null || inventory.status == this.state.filter.status.type)
					)
		});
		let count = Math.ceil(filteredProductInventory.length / this.state.pagination.rowsPerPage);
		this.setState({
			filteredProductInventory: filteredProductInventory,
			pagination: {
					...this.state.pagination,
					count: count,
					page: Math.max(Math.min(this.state.pagination.page, count), 1),
				}
		});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<Dialog fullScreen open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Editar Estoque
				</DialogTitle>
				<DialogContent dividers>
						<form action="#" onSubmit={this.handleFilter} autoComplete="on" style={{width: '100%'}}>
							<Paper className={classes.filterPaper}>
								{(this.state.sizesLoaded && this.state.productSizesLoaded) ? <React.Fragment>
									<Autocomplete
										id="filterSize"
										style={{minWidth: '200px'}}
										value={this.state.filter.size}
										onChange={(e, newValue) => this.setState({filter: {...this.state.filter, size: newValue}})}
										options={this.state.sizes.filter((size) => this.state.productSizes.some((productSize) => productSize.size_id == size.id))}
										getOptionLabel={(size) => `${size.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} margin="normal" label="Tamanho" />}
									/>
									<Autocomplete
										id="filterStatus"
										style={{minWidth: '200px'}}
										value={this.state.filter.status}
										onChange={(e, newValue) => this.setState({filter: {...this.state.filter, status: newValue}})}
										options={this.statusOptionsForFilter}
										getOptionLabel={(option) => `${option.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} margin="normal" label="Status" />}
									/>
								</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
								<Button variant="contained" color="primary" onClick={this.handleFilter} disabled={this.state.trying}>Filtrar</Button>
							</Paper>
							<input type="submit" style={{display: 'none'}}/>
						</form>
						<TableContainer component={Paper} className={classes.table}>
							{(this.state.productInventoryLoaded && this.state.sizesLoaded && this.state.productSizesLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Tam.</TableCell>
											<TableCell align="right">Pedido</TableCell>
											<TableCell align="right">Status</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.filteredProductInventory.map((inventory, i) => (i>=(this.state.pagination.page-1) * this.state.pagination.rowsPerPage && i<=this.state.pagination.page * this.state.pagination.rowsPerPage - 1) ? <TableRow key={inventory.id}>
											<TableCell>{inventory.id}</TableCell>
											<TableCell align="right">{this.state.sizesById[inventory.size_id].name}</TableCell>
											<TableCell align="right">{(inventory.order_id != null) ? inventory.order_id : '-'}</TableCell>
											<TableCell align="right">{{'AVAILABLE': 'DISPONÍVEL', 'UNAVAILABLE': 'INDISPONÍVEL', 'IN_ORDER': 'EM_PEDIDO'}[inventory.status]}</TableCell>
											<TableCell align="right">
												{(inventory.status !== 'IN_ORDER') ? <Tooltip title="Alterar Status" aria-label="Alterar Status">
													<IconButton color="inherit" aria-label="Alterar Status" onClick={() => this.handleChangeProductInventoryStatus(inventory.id)} disabled={this.state.trying}>
														<EditAttributesIcon />
													</IconButton>
												</Tooltip> : ''}
												<Tooltip title="Ver Eventos" aria-label="Ver Eventos">
													<IconButton color="inherit" aria-label="Ver Eventos" onClick={() => this.handleSeeProductInventoryEvents(inventory.id)} disabled={this.state.trying}>
														<InfoIcon />
													</IconButton>
												</Tooltip>
											</TableCell>
										</TableRow> : '')}
									</TableBody>
								</Table>
							</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
						</TableContainer>
						<Grid container spacing={1}>
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
						<div className={classes.paginationArea}>
							<Pagination count={this.state.pagination.count} page={this.state.pagination.page} onChange={(e, newValue) => this.setState({pagination: {...this.state.pagination, page: newValue}})} />
							<Typography variant='caption'>Mostrando {Math.min((this.state.pagination.page-1) * this.state.pagination.rowsPerPage + 1, this.state.filteredProductInventory.length)}-{Math.min(this.state.pagination.page * this.state.pagination.rowsPerPage, this.state.filteredProductInventory.length)} de {this.state.filteredProductInventory.length}</Typography>
						</div>
						<form action="#" onSubmit={this.handleAddProductSize} autoComplete="on" style={{width: '100%', display: 'flex', justifyContent: 'center'}}>
							<Paper className={classes.addPaper}>
								{(this.state.sizesLoaded && this.state.productSizesLoaded) ? <React.Fragment>
									<Autocomplete
										id="size"
										style={{minWidth: '200px'}}
										fullWidth
										value={this.state.size}
										onChange={(e, newValue) => this.setState({size: newValue})}
										options={this.state.sizes.filter((size) => this.state.productSizes.some((productSize) => productSize.size_id == size.id))}
										getOptionLabel={(size) => `${size.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'size'} helperText={(this.state.errorInput == 'size') ? this.state.errorMessage : ''} required margin="normal" label="Tamanho" />}
									/>
									<Autocomplete
										id="status"
										style={{minWidth: '200px'}}
										fullWidth
										value={this.state.status}
										onChange={(e, newValue) => this.setState({status: newValue})}
										options={this.statusOptions}
										getOptionLabel={(option) => `${option.name}`}
										disabled={this.state.trying}
										renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'status'} helperText={(this.state.errorInput == 'status') ? this.state.errorMessage : ''} required margin="normal" label="Status" />}
									/>
									<Grid item xs={12}>
										<TextField
											required
											fullWidth
											onChange={(e) => this.setState({reason: e.target.value})}
											margin="normal"
											id="reason"
											label="Motivo"
											value={this.state.reason}
											InputProps={{
												inputProps: {
													maxLength: 100
												}
											}}
											disabled={this.state.trying}
											error={this.state.errorInput == 'reason'}
											helperText={(this.state.errorInput == 'reason') ? this.state.errorMessage : ''}
										/>
									</Grid>
								</React.Fragment> : <div className={classes.progressArea}><CircularProgress color="primary"/></div>}
								<Button variant="contained" color="primary" onClick={this.handleAddProductInventory} disabled={this.state.trying}>Adicionar</Button>
								<input type="submit" style={{display: 'none'}}/>
							</Paper>
						</form>
				</DialogContent>
				<DialogActions>
					<Button onClick={this.handleDialogClose}>
						Voltar
					</Button>
				</DialogActions>
			</Dialog>
			{(this.state.action == 'see product inventory events') ? <SeeProductInventoryEventsDialog productInventoryId={this.state.actionInfo.productInventoryId} handleDialogClose={this.handleChildDialogClose} history={this.props.history}/> : ''}
			{(this.state.action == 'change product inventory status') ? <ChangeProductInventoryStatusDialog productInventoryId={this.state.actionInfo.productInventoryId} handleDialogClose={this.handleChildDialogClose} history={this.props.history}/> : ''}
		</React.Fragment>
	}

}

export default withStyles(useStyles)(EditProductInventoryDialog)
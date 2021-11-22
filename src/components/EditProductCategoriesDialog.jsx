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

const useStyles = (theme) => ({
	addPaper: {
		minWidth: '300px',
		width: '100%',
		marginTop: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
	},
	table: {
		marginBottom: theme.spacing(1),
	}
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class EditProductCategoriesDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			categoriesLoaded: false,
			categories: [],
			categoriesById: {},
			productCategoriesLoaded: false,
			productCategories: [],
			category: null,
			trying: false,
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getCategories = this.getCategories.bind(this);
		this.getProductCategories = this.getProductCategories.bind(this);
		this.handleAddProductCategory = this.handleAddProductCategory.bind(this);
		this.handleDeleteProductCategory = this.handleDeleteProductCategory.bind(this);
	}

	componentDidMount() {
		this.getCategories();
		this.getProductCategories();
	}

	getCategories() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "categories/all", {
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
					let categoriesById = {}
					data.categories.forEach((category) => categoriesById[category.id] = category)
					this.setState({
						categoriesLoaded: true,
						categories: data.categories,
						categoriesById: categoriesById,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductCategories, 5000);
			console.log(e);
		});
	}

	getProductCategories() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/" + this.props.productId + "/categories", {
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
						productCategoriesLoaded: true,
						productCategories: data.categories,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductCategories, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	handleAddProductCategory(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({trying: true});
		fetch(Config.apiURL + "products/" + this.props.productId + "/categories/", {
			method: "POST",
			body: JSON.stringify({
				category_id: (this.state.category != null) ? this.state.category.id : -1,
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
						default:
							input = 'error';
							message = 'Erro inesperado: '+data.error;
					}
					this.setState({trying: false, errorInput: input, errorMessage: message});
				}
				else {
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Categoria adicionada!', productCategoriesLoaded: false, category: null});
					this.getProductCategories();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.handleAddProductCategory, 5000);
			console.log(e);
		});	
	}

	handleDeleteProductCategory(categoryId) {
		this.setState({trying: true});
		fetch(Config.apiURL + "products/" + this.props.productId + "/categories/" + categoryId, {
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
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Categoria deletada!', productCategoriesLoaded: false});
					this.getProductCategories();
				}
			})
		})
		.catch((e) => {
			setTimeout(() => this.handleDeleteProductCategory(categoryId), 5000);
			console.log(e);
		});	
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<Dialog open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Editar Categorias	
				</DialogTitle>
				<DialogContent dividers>
					<TableContainer component={Paper} className={classes.table}>
						{(this.state.productCategoriesLoaded && this.state.categoriesLoaded) ? <React.Fragment>
							<Table aria-label="spanning table" size="small">
								<TableHead>
									<TableRow>
										<TableCell>ID</TableCell>
										<TableCell align="right">Nome</TableCell>
										<TableCell align="right">Ações</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.productCategories.map((category) => <TableRow key={category.id}>
										<TableCell>{this.state.categoriesById[category.category_id].id}</TableCell>
										<TableCell align="right">{this.state.categoriesById[category.category_id].name}</TableCell>
										<TableCell align="right">
											<Tooltip title="Apagar Categoria" aria-label="Apagar Categoria">
												<IconButton color="inherit" aria-label="Apagar Categoria" onClick={() => this.handleDeleteProductCategory(category.category_id)} disabled={this.state.trying}>
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
					<form action="#" onSubmit={this.handleAddProductCategory} autoComplete="on" style={{width: '100%'}}>
						<Paper className={classes.addPaper}>
							<Autocomplete
								id="category"
								style={{minWidth: '200px'}}
								fullWidth
								value={this.state.category}
								onChange={(e, newValue) => this.setState({category: newValue})}
								options={this.state.categories.filter((category) => !this.state.productCategories.some((productCategory) => productCategory.category_id == category.id))}
								getOptionLabel={(category) => `${category.name}`}
								disabled={this.state.trying}
								renderInput={(params) => <TextField {...params} error={this.state.errorInput == 'category'} helperText={(this.state.errorInput == 'category') ? this.state.errorMessage : ''} required margin="normal" label="Categoria" />}
							/>
							<Button variant="contained" color="primary" onClick={this.handleAddProductCategory} disabled={this.state.trying || this.state.category == null}>Adicionar</Button>
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
		</React.Fragment>
	}

}

export default withStyles(useStyles)(EditProductCategoriesDialog)
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
import AddProductDialog from '../components/AddProductDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditProductDialog from '../components/EditProductDialog';
import TextField from '@material-ui/core/TextField';
import EditProductCategoriesDialog from '../components/EditProductCategoriesDialog';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';
import EditProductSizesDialog from '../components/EditProductSizesDialog';
import HeightIcon from '@material-ui/icons/Height';
import EditProductImagesDialog from '../components/EditProductImagesDialog';
import PhotoLibraryIcon from '@material-ui/icons/PhotoLibrary';
import HorizontalSplitIcon from '@material-ui/icons/HorizontalSplit';
import EditProductInventoryDialog from '../components/EditProductInventoryDialog';

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
});

class ProductsRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			productsLoaded: false, products: [],
			profileLoaded: false, profile: {},
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
			filter: {
				text: '',
			}
		}
		this.getProducts = this.getProducts.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteProduct = this.handleDeleteProduct.bind(this);
		this.handleEditProduct = this.handleEditProduct.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.handleEditProductCategories = this.handleEditProductCategories.bind(this);
		this.handleEditProductSizes = this.handleEditProductSizes.bind(this);
		this.handleEditProductInventory = this.handleEditProductInventory.bind(this);
		this.getUserProfile = this.getUserProfile.bind(this);
	}

	componentDidMount() {
		this.getProducts();
		this.getUserProfile();
	}

	getProducts() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/with-filter", {
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
					this.setState({productsLoaded: true, products: data.products});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProducts, 5000);
			console.log(e);
		});
	}

	getUserProfile() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "users/me/profile", {
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
				}
				else
					this.setState({profileLoaded: true, profile: data.profile});
			})
		})
		.catch((e) => {
			setTimeout(this.getUserProfile, 5000);
			console.log(e);
		});
	}

	handleFilter(e) {
		if (e != undefined)
			e.preventDefault();
		this.setState({productsLoaded: false});
		this.getProducts();
	}

	handleDialogClose() {
		this.setState({productsLoaded: false, action: ''});
		this.getProducts();
	}

	handleDeleteProduct(productId) {
		if (window.confirm(`Deseja realmente deletar o produto id ${productId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "products/" + productId, {
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
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Produto deletado!', productsLoaded: false});
						this.getProducts();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteProduct(productId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditProduct(productId) {
		this.setState({action: 'edit product', actionInfo: {productId: productId}});
	}

	handleEditProductCategories(productId) {
		this.setState({action: 'edit product categories', actionInfo: {productId: productId}});
	}

	handleEditProductSizes(productId) {
		this.setState({action: 'edit product sizes', actionInfo: {productId: productId}});
	}

	handleEditProductImages(productId) {
		this.setState({action: 'edit product images', actionInfo: {productId: productId}});
	}

	handleEditProductInventory(productId) {
		this.setState({action: 'edit product inventory', actionInfo: {productId: productId}});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Produtos
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
							{(this.state.productsLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Nome</TableCell>
											<TableCell align="right">Vísível</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.products.map((product) => <TableRow key={product.id}>
											<TableCell>{product.id}</TableCell>
											<TableCell align="right">{product.name}</TableCell>
											<TableCell align="right">{['Não', 'Sim'][product.visible]}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditProduct(product.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Categorias" aria-label="Categorias">
													<IconButton color="inherit" aria-label="Categorias" onClick={() => this.handleEditProductCategories(product.id)} disabled={this.state.trying}>
														<ViewColumnIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Tamanhos" aria-label="Tamanhos">
													<IconButton color="inherit" aria-label="Tamanhos" onClick={() => this.handleEditProductSizes(product.id)} disabled={this.state.trying}>
														<HeightIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Fotos" aria-label="Fotos">
													<IconButton color="inherit" aria-label="Fotos" onClick={() => this.handleEditProductImages(product.id)} disabled={this.state.trying}>
														<PhotoLibraryIcon />
													</IconButton>
												</Tooltip>
												{(this.state.profileLoaded && this.state.profile['product_inventory_module']) ? <Tooltip title="Estoque" aria-label="Estoque">
													<IconButton color="inherit" aria-label="Estoque" onClick={() => this.handleEditProductInventory(product.id)} disabled={this.state.trying}>
														<HorizontalSplitIcon />
													</IconButton>
												</Tooltip> : ''}
												<Tooltip title="Apagar Produto" aria-label="Apagar Produto">
													<IconButton color="inherit" aria-label="Apagar Produto" onClick={() => this.handleDeleteProduct(product.id)} disabled={this.state.trying}>
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
						<div className={classes.actions}>
							<Button variant="contained" color="primary" disabled={this.state.trying} onClick={() => this.setState({action: 'add product'})}>Adicionar Produto</Button>
						</div>
						{(this.state.action == 'add product') ? <AddProductDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit product') ? <EditProductDialog productId={this.state.actionInfo.productId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit product categories') ? <EditProductCategoriesDialog productId={this.state.actionInfo.productId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit product sizes') ? <EditProductSizesDialog productId={this.state.actionInfo.productId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit product images') ? <EditProductImagesDialog productId={this.state.actionInfo.productId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit product inventory') ? <EditProductInventoryDialog productId={this.state.actionInfo.productId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(ProductsRoute)
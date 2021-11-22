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
import AddCategoryDialog from '../components/AddCategoryDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditCategoryDialog from '../components/EditCategoryDialog';

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

class CategoriesRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			categoriesLoaded: false, categories: [],
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
		}
		this.getCategories = this.getCategories.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteCategory = this.handleDeleteCategory.bind(this);
		this.handleEditCategory = this.handleEditCategory.bind(this);
	}

	componentDidMount() {
		this.getCategories();
	}

	getCategories() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "categories/module", {
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
					this.setState({categoriesLoaded: true, categories: data.categories});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCategories, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({categoriesLoaded: false, action: ''});
		this.getCategories();
	}

	handleDeleteCategory(categoryId) {
		if (window.confirm(`Deseja realmente deletar a categoria id ${categoryId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "categories/" + categoryId, {
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
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Categoria deletada!', categoriesLoaded: false});
						this.getCategories();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteCategory(categoryId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditCategory(categoryId) {
		this.setState({action: 'edit category', actionInfo: {categoryId: categoryId}});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Categorias
						</Typography>
						<TableContainer component={Paper}>
							{(this.state.categoriesLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Nome</TableCell>
											<TableCell align="right">Visível</TableCell>
											<TableCell align="right">Posição</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.categories.map((category) => <TableRow key={category.id}>
											<TableCell>{category.id}</TableCell>
											<TableCell align="right">{category.name}</TableCell>
											<TableCell align="right">{['Não', 'Sim'][category.visible]}</TableCell>
											<TableCell align="right">{category.position}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditCategory(category.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Apagar Categoria" aria-label="Apagar Categoria">
													<IconButton color="inherit" aria-label="Apagar Categoria" onClick={() => this.handleDeleteCategory(category.id)} disabled={this.state.trying}>
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
							<Button variant="contained" color="primary" disabled={this.state.trying} onClick={() => this.setState({action: 'add category'})}>Adicionar Categoria</Button>
						</div>
						{(this.state.action == 'add category') ? <AddCategoryDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit category') ? <EditCategoryDialog categoryId={this.state.actionInfo.categoryId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(CategoriesRoute)
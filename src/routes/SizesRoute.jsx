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
import AddSizeDialog from '../components/AddSizeDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditSizeDialog from '../components/EditSizeDialog';

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

class SizesRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			sizesLoaded: false, sizes: [],
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
		}
		this.getSizes = this.getSizes.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteSize = this.handleDeleteSize.bind(this);
		this.handleEditSize = this.handleEditSize.bind(this);
	}

	componentDidMount() {
		this.getSizes();
	}

	getSizes() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "sizes/module", {
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
					this.setState({sizesLoaded: true, sizes: data.sizes});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getSizes, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({sizesLoaded: false, action: ''});
		this.getSizes();
	}

	handleDeleteSize(sizeId) {
		if (window.confirm(`Deseja realmente deletar o tamanho id ${sizeId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "sizes/" + sizeId, {
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
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Tamanho deletado!', sizesLoaded: false});
						this.getSizes();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteSize(sizeId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditSize(sizeId) {
		this.setState({action: 'edit size', actionInfo: {sizeId: sizeId}});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Tamanhos
						</Typography>
						<TableContainer component={Paper}>
							{(this.state.sizesLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Nome</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.sizes.map((size) => <TableRow key={size.id}>
											<TableCell>{size.id}</TableCell>
											<TableCell align="right">{size.name}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditSize(size.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Apagar Tamanho" aria-label="Apagar Tamanho">
													<IconButton color="inherit" aria-label="Apagar Tamanho" onClick={() => this.handleDeleteSize(size.id)} disabled={this.state.trying}>
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
							<Button variant="contained" color="primary" disabled={this.state.trying} onClick={() => this.setState({action: 'add size'})}>Adicionar Tamanho</Button>
						</div>
						{(this.state.action == 'add size') ? <AddSizeDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit size') ? <EditSizeDialog sizeId={this.state.actionInfo.sizeId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(SizesRoute)
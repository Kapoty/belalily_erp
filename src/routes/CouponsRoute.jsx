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
import AddCouponDialog from '../components/AddCouponDialog';
import { Alert, AlertTitle } from '@material-ui/lab';
import Grid from '@material-ui/core/Grid';
import EditCouponDialog from '../components/EditCouponDialog';

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

class CouponsRoute extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			couponsLoaded: false, coupons: [],
			trying: false,
			errorInput: '', errorMessage: '',
			action: '', actionInfo: {},
		}
		this.getCoupons = this.getCoupons.bind(this);
		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.handleDeleteCoupon = this.handleDeleteCoupon.bind(this);
		this.handleEditCoupon = this.handleEditCoupon.bind(this);
	}

	componentDidMount() {
		this.getCoupons();
	}

	getCoupons() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "coupons/module", {
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
					this.setState({couponsLoaded: true, coupons: data.coupons});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getCoupons, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.setState({couponsLoaded: false, action: ''});
		this.getCoupons();
	}

	handleDeleteCoupon(couponId) {
		if (window.confirm(`Deseja realmente deletar o cupom id ${couponId}?`)) {
			this.setState({trying: true});
			fetch(Config.apiURL + "coupons/" + couponId, {
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
						this.setState({trying: false, errorInput: 'success', errorMessage: 'Cupom deletado!', couponsLoaded: false});
						this.getCoupons();
					}
				})
			})
			.catch((e) => {
				setTimeout(() => this.handleDeleteCoupon(couponId), 5000);
				console.log(e);
			});	
		}
	}

	handleEditCoupon(couponId) {
		this.setState({action: 'edit coupon', actionInfo: {couponId: couponId}});
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
					<CustomAppBar history={this.props.history} location={this.props.location}/>
					<div className={classes.root}>
						<Typography variant="h4" align='center' gutterBottom style={{width: '100%'}}>
							Cupons
						</Typography>
						<TableContainer component={Paper}>
							{(this.state.couponsLoaded) ? <React.Fragment>
								<Table aria-label="spanning table" size="small">
									<TableHead>
										<TableRow>
											<TableCell>ID</TableCell>
											<TableCell align="right">Código</TableCell>
											<TableCell align="right">Tipo</TableCell>
											<TableCell align="right">Valor</TableCell>
											<TableCell align="right">Ações</TableCell>
										</TableRow>
									</TableHead>
									<TableBody>
										{this.state.coupons.map((coupon) => <TableRow key={coupon.id}>
											<TableCell>{coupon.id}</TableCell>
											<TableCell align="right">{coupon.code}</TableCell>
											<TableCell align="right">{{'PERCENT': 'PORCENTAGEM', 'GROSS': 'BRUTO', 'TWO_PERCENT': 'DOIS_PORCENTAGEM', 'TWO_GROSS': 'DOIS_BRUTO'}[coupon.type]}</TableCell>
											<TableCell align="right">{coupon.value}</TableCell>
											<TableCell align="right">
												<Tooltip title="Editar" aria-label="Editar">
													<IconButton color="inherit" aria-label="Editar" onClick={() => this.handleEditCoupon(coupon.id)} disabled={this.state.trying}>
														<EditIcon />
													</IconButton>
												</Tooltip>
												<Tooltip title="Apagar Cupom" aria-label="Apagar Cupom">
													<IconButton color="inherit" aria-label="Apagar Cupom" onClick={() => this.handleDeleteCoupon(coupon.id)} disabled={this.state.trying}>
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
							<Button variant="contained" color="primary" disabled={this.state.trying} onClick={() => this.setState({action: 'add coupon'})}>Adicionar Cupom</Button>
						</div>
						{(this.state.action == 'add coupon') ? <AddCouponDialog handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
						{(this.state.action == 'edit coupon') ? <EditCouponDialog couponId={this.state.actionInfo.couponId} handleDialogClose={this.handleDialogClose} history={this.props.history}/> : ''}
					</div>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(CouponsRoute)
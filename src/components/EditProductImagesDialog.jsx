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
	progressArea: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		padding: theme.spacing(1),
		boxSizing: 'border-box',
	},
	addPaper: {
		minWidth: '300px',
		width: '100%',
		marginTop: theme.spacing(1),
		padding: theme.spacing(1),
		boxSizing: 'border-box',
		display: 'flex',
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center',
		gap: theme.spacing(1),
	},
	table: {
		marginBottom: theme.spacing(1),
	},
	image: {
		width: '128px',
	},
	imageInput: {
		border: 0,
		width: '100%',
	},
});

const Transition = React.forwardRef(function Transition(props, ref) {
	return <Slide direction="up" ref={ref} mountOnEnter unmountOnExit {...props} />;
});

class EditProductImagesDialog extends React.Component {

	constructor(props) {
		super(props);
		this.state = {
			productImagesLoaded: false,
			productImages: [],
			image: null,
			trying: false,
			selectedImageSrc: '',
			image256: '',
			image512: '',
		}

		this.handleDialogClose = this.handleDialogClose.bind(this);
		this.getProductImages = this.getProductImages.bind(this);
		this.handleAddProductImage = this.handleAddProductImage.bind(this);
		this.handleDeleteProductImage = this.handleDeleteProductImage.bind(this);
		this.onImageSelected = this.onImageSelected.bind(this);
	}

	componentDidMount() {
		this.getProductImages();
	}

	getProductImages() {
		if (cookies.get('user-token') == null) {
			this.props.history.push('/');
			return;
		}
		fetch(Config.apiURL + "products/" + this.props.productId + "/images", {
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
					let productImages = [];
					productImages = Array.from({length: data.images.img_number}, (_, i) => i + 1);
					this.setState({
						productImagesLoaded: true,
						productImages: productImages,
					});
				}
			})
		})
		.catch((e) => {
			setTimeout(this.getProductImages, 5000);
			console.log(e);
		});
	}

	handleDialogClose() {
		this.props.handleDialogClose();
	}

	handleAddProductImage(e) {
		if (e != undefined)
			e.preventDefault();
		if (!this.state.selectedImageSrc.startsWith('data:image/jpeg;base64,') ||
			!this.state.image256.startsWith('data:image/jpeg;base64,') || 
			!this.state.image512.startsWith('data:image/jpeg;base64,'))
			return;
		this.setState({trying: true});
		fetch(Config.apiURL + "products/" + this.props.productId + "/images/", {
			method: "POST",
			body: JSON.stringify({
				image: this.state.selectedImageSrc.split(',')[1],
				image256: this.state.image256.split(',')[1],
				image512: this.state.image512.split(',')[1],
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
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Foto adicionada!', productImagesLoaded: false});
					this.getProductImages();
				}
			})
		})
		.catch((e) => {
			setTimeout(this.handleAddProductSize, 5000);
			console.log(e);
		});	
	}

	handleDeleteProductImage(imageId) {
		this.setState({trying: true});
		fetch(Config.apiURL + "products/" + this.props.productId + "/images/" + imageId, {
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
					this.setState({trying: false, errorInput: 'success', errorMessage: 'Imagem deletada!', productImagesLoaded: false});
					this.getProductImages();
				}
			})
		})
		.catch((e) => {
			setTimeout(() => this.handleDeleteProductImage(imageId), 5000);
			console.log(e);
		});	
	}

	onImageSelected(e) {
		try {
				let selectedFile = e.target.files[0];
				let reader = new FileReader();

				reader.onload = ((e) => {

					let canvas = document.createElement("canvas");
					let ctx = canvas.getContext("2d");

					let image = new Image();
					image.onload = (() => {
						let src = '', image256 = '', image512 = '';
						canvas.width = image.width;
						canvas.height = image.height;
						ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
						src = canvas.toDataURL("image/jpeg", 0.8);
						canvas.width = 256;
						canvas.height = 256;
						ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
						image256 = canvas.toDataURL("image/jpeg", 0.8);
						canvas.width = 512;
						canvas.height = 512;
						ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
						image512 = canvas.toDataURL("image/jpeg", 0.8);
						this.setState({selectedImageSrc: src, image256: image256, image512: image512});
						canvas.remove();
					}).bind(this);
					image.src = e.target.result;

				}).bind(this);

			reader.readAsDataURL(selectedFile);
		} catch (e) {
			this.setState({selectedImageSrc: ''});
		}
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
			<Dialog open onClose={this.handleDialogClose} TransitionComponent={Transition}>
				<DialogTitle id="customized-dialog-title" onClose={this.handleDialogClose}>
					Editar Fotos
				</DialogTitle>
				<DialogContent dividers>
					<TableContainer component={Paper} className={classes.table}>
						{(this.state.productImagesLoaded) ? <React.Fragment>
							<Table aria-label="spanning table" size="small">
								<TableHead>
									<TableRow>
										<TableCell>Posição</TableCell>
										<TableCell align="right">Foto</TableCell>
										<TableCell align="right">Ações</TableCell>
									</TableRow>
								</TableHead>
								<TableBody>
									{this.state.productImages.map((image) => <TableRow key={image}>
										<TableCell>{image}</TableCell>
										<TableCell align="right"><img src={`${Config.mediaURL}/products/${this.props.productId}/${image}.jpg?n=${Date.now()}`} className={classes.image}/></TableCell>
										<TableCell align="right">
											<Tooltip title="Apagar Foto" aria-label="Apagar Foto">
												<IconButton color="inherit" aria-label="Apagar Foto" onClick={() => this.handleDeleteProductImage(image)} disabled={this.state.trying}>
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
					<form action="#" onSubmit={this.handleAddProductSize} autoComplete="on" style={{width: '100%'}}>
						<Paper className={classes.addPaper}>
							<input type="file" accept="image/png, image/jpeg" onChange={this.onImageSelected} className={classes.imageInput}/>
							{(this.state.selectedImageSrc != '') ? <img src={this.state.selectedImageSrc} className={classes.image}/> : ''}
							<Button fullWidth variant="contained" color="primary" onClick={this.handleAddProductImage} disabled={this.state.trying || this.state.selectedImageSrc == ''}>Adicionar</Button>
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

export default withStyles(useStyles)(EditProductImagesDialog)
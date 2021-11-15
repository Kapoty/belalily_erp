import React from "react";

import {withStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import MenuIcon from '@material-ui/icons/Menu';
import IconButton from '@material-ui/core/IconButton';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';

import Drawer from '@material-ui/core/Drawer';
import Button from '@material-ui/core/Button';
import List from '@material-ui/core/List';
import Divider from '@material-ui/core/Divider';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Link from '@material-ui/core/Link';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import GroupIcon from '@material-ui/icons/Group';
import FaceIcon from '@material-ui/icons/Face';
import HomeIcon from '@material-ui/icons/Home';

import Config from "../config/Config";
import Cookies from 'universal-cookie';
const cookies = new Cookies();

const useStyles = (theme) => ({
	logo: {
		position: 'absolute',
		left: '50%',
		top: '50%',
		height: '80%',
		transform: 'translate(-50%, -50%)',
	},
	grow: {
    	flexGrow: 1,
  	},
});

class CustomAppBar extends React.Component {

	constructor(props) {
		super(props);
		this.state = {menuAnchor: null, userMenuAnchor: null, profileLoaded: false, profile: {}};

		this.modules = [
			{name: 'Início', link: '/painel', requirement: '', iconComponent: HomeIcon},
			{name: 'Usuários', link: '/usuarios', requirement: 'users_module', iconComponent: AccountCircleIcon},
			{name: 'Perfis', link: '/perfis', requirement: 'profiles_module', iconComponent: GroupIcon},
		];

		this.handleMenuOpen = this.handleMenuOpen.bind(this);
		this.handleMenuClose = this.handleMenuClose.bind(this);
		this.handleMenuClick = this.handleMenuClick.bind(this);
		this.handleUserMenuOpen = this.handleUserMenuOpen.bind(this);
		this.handleUserMenuClose = this.handleUserMenuClose.bind(this);
		this.handleUserLogout = this.handleUserLogout.bind(this);
		this.getUserProfile = this.getUserProfile.bind(this);
	}

	componentDidMount() {
		this.getUserProfile();
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

	handleMenuOpen = (event) => {
		this.setState({menuAnchor: event.currentTarget});
	};

	handleMenuClose = (event) => {
		this.setState({menuAnchor: null});
	};

	handleMenuClick = (page) => {
		this.setState({menuAnchor: null});
		this.props.history.push(page);
	}

	handleUserMenuOpen = (event) => {
		this.setState({userMenuAnchor: event.currentTarget});
	};

	handleUserMenuClose = (event) => {
		this.setState({userMenuAnchor: null});
	};

	handleUserLogout() {
		this.setState({userMenuAnchor: null});
		cookies.remove('user-token', { path: '/' });
		this.props.history.push("/");
	}

	render() {
		const { classes } = this.props;
		return <React.Fragment>
			<AppBar position="fixed">
				<Toolbar>
					<IconButton edge="start" color="inherit" aria-label="menu" onClick={this.handleMenuOpen}>
						<MenuIcon />
					</IconButton>
					<img className={classes.logoImg} src='./assets/image/logo-small.png' onClick={() => this.props.history.push('/')}/>
					<Drawer anchor={'left'} open={Boolean(this.state.menuAnchor)} onClose={this.handleMenuClose}>
						<Link href="#/" onClick={() => this.props.history.push("")}><img src='./assets/image/logo-256.png'/></Link>
						<List>
							{(this.state.profileLoaded) ? this.modules.map((m, i) => (m.requirement == '' || this.state.profile[m.requirement]) ? <ListItem button key={i} onClick={() => this.handleMenuClick(m.link)}>
								<ListItemIcon>{React.createElement(m.iconComponent, {})}</ListItemIcon>
								<ListItemText primary={m.name} />
							</ListItem> : '') : ''}
						</List>
					</Drawer>
					<img className={classes.logo} src='./assets/image/logo-texto.png' onClick={() => this.props.history.push('/painel')}/>
					<div className={classes.grow} />
					<IconButton edge="end" color="inherit" aria-label="account" style={{marginLeft: '20px'}} onClick={this.handleUserMenuOpen}>
						<AccountCircleIcon />
					</IconButton>
					<Menu
						id="menu-appbar"
						anchorEl={this.state.userMenuAnchor}
						anchorOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						keepMounted
						transformOrigin={{
							vertical: 'top',
							horizontal: 'right',
						}}
						open={Boolean(this.state.userMenuAnchor)}
						onClose={this.handleUserMenuClose}
					>
						{(this.state.profileLoaded) ? <List>
							<ListItem>
								<ListItemIcon><FaceIcon /></ListItemIcon>
								<ListItemText primary={this.state.profile.username} />
							</ListItem>
							<ListItem>
								<ListItemIcon><GroupIcon /></ListItemIcon>
								<ListItemText primary={this.state.profile.name} />
							</ListItem>
						</List> : ''}
						<MenuItem onClick={this.handleUserLogout}>Sair</MenuItem>
					</Menu>
				</Toolbar>
			</AppBar>
			<Toolbar><img className={classes.logoImg} src='./assets/image/logo-small.png'/></Toolbar>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(CustomAppBar)
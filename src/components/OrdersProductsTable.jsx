import React from "react";

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import CircularProgress from '@material-ui/core/CircularProgress';

import {withStyles, useTheme} from '@material-ui/core/styles';

import {toBRL} from '../util/Currency';

const useStyles = (theme) => ({
	table: {
		marginBottom: theme.spacing(1),
	}
});

class OrdersProductsTable extends React.Component {

	constructor(props) {
		super(props);
		this.state = {};
	}

	componentDidUpdate(prevProps) {
	}

	render() {
		const { classes } = this.props;

		return <React.Fragment>
				<Typography variant="h6" gutterBottom>
					Resumo do Pedido
				</Typography>
				<TableContainer component={Paper} className={classes.table}>
					<Table aria-label="spanning table" size="small">
						<TableHead>
							<TableRow>
								<TableCell>Produto</TableCell>
								<TableCell align="right">Qtd.</TableCell>
								<TableCell align="right">Valor</TableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{this.props.order.products.map((product, i) => <TableRow key={i}>
								<TableCell>{`${product.name} (${product.size_name})`}</TableCell>
								<TableCell align="right">{product.quantity}</TableCell>
								<TableCell align="right">
									<Typography variant="body1" color="primary" component="p">
									<b>{toBRL(product.price * product.quantity)}</b>
									</Typography>
								</TableCell>
							</TableRow>)}
							<TableRow>
								<TableCell colSpan={2} align="right">Total dos produtos</TableCell>
								<TableCell align="right">{toBRL(this.props.order.subtotal)}</TableCell>
							</TableRow>
							{(this.props.order.extra_amount < 0) ?
								<TableRow>
									<TableCell colSpan={2} align="right">Descontos</TableCell>
									<TableCell align="right">{toBRL(this.props.order.extra_amount)}</TableCell>
								</TableRow> : ''}
							<TableRow>
								<TableCell colSpan={2} align="right">Entrega</TableCell>
								<TableCell align="right">{toBRL(this.props.order.shipping_cost)}</TableCell>
							</TableRow>
							{(this.props.order.coupon_discount != 0) ?
								<TableRow>
									<TableCell colSpan={2} align="right">
										Desconto de Cupom<br/>
										<Typography variant="caption" color="primary" component="p">{this.props.order.coupon_code}</Typography>
									</TableCell>
									<TableCell align="right">{toBRL(-this.props.order.coupon_discount)}</TableCell>
								</TableRow> : ''}
							{(this.props.order.fees != 0) ?
								<TableRow>
									<TableCell colSpan={2} align="right">Taxas</TableCell>
									<TableCell align="right">{toBRL(this.props.order.fees)}</TableCell>
								</TableRow> : ''}
							<TableRow>
								<TableCell colSpan={2} align="right">Valor total</TableCell>
								<TableCell align="right">
									<Typography variant="body1" color="primary" component="p">
									<b>{toBRL(this.props.order.total)}</b>
									</Typography>
								</TableCell>
							</TableRow>
						</TableBody>
					</Table>
				</TableContainer>
		</React.Fragment>
	}

}

export default withStyles(useStyles)(OrdersProductsTable)
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const helpers_1 = require("../functions/helpers");
const promise_helpers_1 = require("../functions/promise-helpers");
const express = require("express");
const async_database_1 = require("../middleware/async-database");
const router = express.Router();
router.route('/cart')
    .post((req, res) => {
    let product = req.body.product.split(',');
    let inputs = {
        product_id: product[0],
        name: product[1],
        price: product[2],
        size: product[3],
        uuid: req.session.user.uuid,
        quantity: req.body.quantity
    };
    let query = 'SELECT product_id FROM cart WHERE user_uuid = $1 and product_id = $2';
    let values = [inputs.uuid, inputs.product_id];
    async_database_1.db.query(query, values)
        .then((result) => {
        if (result.rows.length === 0) {
            return async_database_1.db.query('INSERT INTO cart(product_id, name, price, size, user_uuid, quantity) VALUES ($1, $2, $3, $4, $5, $6)', [inputs.product_id, inputs.name, inputs.price, inputs.size, inputs.uuid, inputs.quantity]);
        }
        else {
            return async_database_1.db.query('UPDATE cart SET quantity = quantity+$1 WHERE user_uuid = $2', [inputs.quantity, inputs.uuid]);
        }
    })
        .then((result) => {
        res.redirect('../../products');
    })
        .catch((err) => {
        console.log(err);
        let userError = helpers_1.dbErrTranslator(err.message);
        res.render('products', { dbError: userError });
    });
})
    .get((req, res) => {
    let uuid = req.session.user.uuid, cartContent = [], totalCost = 0, totalItems = 0, price, quantity;
    let query = 'SELECT * FROM cart WHERE user_uuid = $1';
    let values = [uuid];
    async_database_1.db.query(query, values)
        .then((result) => {
        cartContent = result.rows;
        for (let i = 0; i < result.rows.length; i++) {
            price = parseInt(result.rows[i].price);
            quantity = parseInt(result.rows[i].quantity);
            totalCost = totalCost + (price * quantity);
            totalItems = totalItems + quantity;
        }
        return async_database_1.db.query('SELECT card_number FROM payment_credit WHERE (user_uuid, active) = ($1, $2)', [uuid, true]);
    })
        .then((result) => {
        let lastFour = promise_helpers_1.lastFourOnly(result.rows[0].card_number);
        res.render('cart', {
            cartContent: cartContent,
            totalCost: totalCost,
            totalItems: totalItems,
            card_number: lastFour
        });
    })
        .catch((err) => {
        console.log(err);
        let userError = helpers_1.dbErrTranslator(err.message);
        res.render('cart', { dbError: userError });
    });
});
router.route('/cart/:product_id')
    .get((req, res) => {
    let uuid = req.session.user.uuid;
    async_database_1.db.query('SELECT * FROM cart WHERE user_uuid = $1 AND product_id = $2', [uuid, req.query.product_id])
        .then((result) => {
        res.render('edit-cart-item', {
            name: result.rows[0].name,
            product_id: result.rows[0].product_id,
            quantity: result.rows[0].quantity,
            uuid: uuid
        });
    })
        .catch((err) => {
        console.log(err.stack);
        res.render('cart', { dbError: err.stack });
    });
})
    .put((req, res) => {
    let quantity = parseInt(req.body.quantity);
    let product_id = req.body.product_id;
    let uuid = req.session.user.uuid;
    if (req.body.quantity === 0) {
        async_database_1.db.query('DELETE FROM cart WHERE product_id = $1 AND user_uuid = $2', [req.query.product_id, uuid])
            .then((result) => {
            res.redirect('/acccounts/:email/cart');
        })
            .catch((err) => {
            console.log(err.stack);
            res.render('cart', { dbError: err.stack });
        });
    }
    async_database_1.db.query('UPDATE cart SET quantity = $1 WHERE user_uuid = $2 AND product_id = $3', [quantity, uuid, product_id])
        .then((result) => {
        res.redirect('/accounts/' + req.session.user.email + '/cart');
    })
        .catch((err) => {
        console.log(err.stack);
        res.render('cart', { dbError: err.stack });
    });
})
    .delete((req, res) => {
    let uuid = req.session.user.uuid;
    async_database_1.db.query('DELETE FROM cart WHERE product_id = $1 AND user_uuid = $2', [req.body.product_id, uuid])
        .then((result) => {
        res.redirect('/accounts/' + req.session.user.email + '/cart');
    })
        .catch((err) => {
        console.log(err.stack);
        res.render('cart', { dbError: err.stack });
    });
});
module.exports = router;
//# sourceMappingURL=cart.js.map
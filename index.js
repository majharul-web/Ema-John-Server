const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.6soco.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        console.log('database connected');

        const database = client.db('online_shop');
        const productsCollection = database.collection('products');
        const ordersCollection = database.collection('orders');

        app.get('/products', async (req, res) => {
            const page = req.query.page;
            const size = parseInt(req.query.size);
            const cursor = productsCollection.find({});
            const count = await cursor.count();

            let products;
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        })

        // get data by product keys
        app.post('/products/byeKeys', async (req, res) => {
            const keys = req.body;
            const query = {
                key: { $in: keys }
            }
            const products = await productsCollection.find(query).toArray();
            res.json(products);
        })

        // get order data
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await ordersCollection.insertOne(order);
            res.json(result)
        })
    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('ema john server running');
})

app.listen(port, () => {
    console.log(`Ema-John listening at http://localhost:${port}`)
})
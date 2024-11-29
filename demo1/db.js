const { MongoClient } = require('mongodb');

async function main() {
    const uri = "mongodb://localhost:27017"; // 本地MongoDB地址
    const client = new MongoClient(uri);

    try {
        await client.connect();
        console.log("Connected to MongoDB!");

        const database = client.db("testDatabase");
        const collection = database.collection("testCollection");

        // 插入数据
        await collection.insertOne({ name: "Bob", age: 30 });

        // 查询数据
        const results = await collection.find({}).toArray();
        console.log("Data:", results);
    } finally {
        await client.close();
    }
}

main().catch(console.error);
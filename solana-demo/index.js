require('dotenv').config();
const solanaWeb3 = require("@solana/web3.js");

// 从环境变量中获取私钥
const SAVED_PRIVATE_KEY = process.env.SOLANA_PRIVATE_KEY;
if (!SAVED_PRIVATE_KEY) {
    throw new Error("请在 .env 文件中设置 SOLANA_PRIVATE_KEY");
}

(async () => {
    try {
        // 连接到 Solana 的主网
        const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("mainnet-beta"), "confirmed");  

        console.log("\n=== 钱包信息 ===");
        // 从保存的私钥创建钱包（16进制格式）
        const secretKey = Uint8Array.from(Buffer.from(SAVED_PRIVATE_KEY, 'hex'));
        const wallet = solanaWeb3.Keypair.fromSecretKey(secretKey);
        console.log("钱包公钥 (地址):", wallet.publicKey.toBase58());

        // 查询钱包余额
        const balance = await connection.getBalance(wallet.publicKey);
        console.log("钱包余额:", balance / solanaWeb3.LAMPORTS_PER_SOL, "SOL");

        // 创建接收方钱包
        const recipient = solanaWeb3.Keypair.generate();
        console.log("\n=== 接收方钱包信息 ===");
        console.log("接收方钱包地址:", recipient.publicKey.toBase58());

        // 创建转账交易
        const transaction = new solanaWeb3.Transaction().add(
            solanaWeb3.SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: recipient.publicKey,
                lamports: solanaWeb3.LAMPORTS_PER_SOL / 100, // 转移 0.01 SOL
            })
        );

        const signature = await solanaWeb3.sendAndConfirmTransaction(connection, transaction, [wallet]);
        console.log("\n=== 交易信息 ===");
        console.log("交易签名:", signature);
        
    } catch (error) {
        console.error("\n=== 错误信息 ===");
        console.error(error.message);
        // 如果是钱包相关的错误，可能是私钥格式不正确
        if (error.message.includes("secret key")) {
            console.error("\n私钥格式可能不正确。请确保私钥是16进制格式。");
            console.error("例如: 88a7c0e366b049f...");
        }
    }
})();

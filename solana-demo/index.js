const solanaWeb3 = require("@solana/web3.js");
(async () => {
    // 连接到 Solana 的 devnet
    const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl("devnet"), "confirmed");  
     // 创建一个新的 Solana 钱包密钥对
    const wallet = solanaWeb3.Keypair.generate();
    console.log("Generated Wallet Address:", wallet.publicKey.toBase58());
    // 查询钱包余额（初始为 0）
    const initialBalance = await connection.getBalance(wallet.publicKey);
    console.log("Initial Balance:", initialBalance);
     // 从 Airdrop 请求一些 SOL（在测试网或 devnet 上使用）
    const airdropSignature = await connection.requestAirdrop(wallet.publicKey, solanaWeb3.LAMPORTS_PER_SOL);
    await connection.confirmTransaction(airdropSignature);
    
})();

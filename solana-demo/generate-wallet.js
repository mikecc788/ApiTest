const { Keypair } = require("@solana/web3.js");

// 生成新的钱包
const wallet = Keypair.generate();

console.log("\n=== 新钱包信息 ===");
console.log("公钥 (地址):", wallet.publicKey.toString());
console.log("\n私钥 (16进制格式):");
console.log("SOLANA_PRIVATE_KEY=" + Buffer.from(wallet.secretKey).toString('hex'));

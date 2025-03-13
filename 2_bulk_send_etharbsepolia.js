require("dotenv").config();
const { ethers } = require("ethers");
const fs = require("fs");

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);

const AMOUNT_TO_SEND = ethers.parseEther("0.001"); // Jumlah ETH per transaksi
const ADDRESSES_FILE = "addresses.txt";

async function sendBulkTransactions() {
    const addresses = fs.readFileSync(ADDRESSES_FILE, "utf-8").split("\n").map(addr => addr.trim()).filter(addr => addr !== "");
    
    console.log(`🔹 Mengirim ${AMOUNT_TO_SEND} ETH ke ${addresses.length} wallet...`);

    for (let i = 0; i < addresses.length; i++) {
        const to = addresses[i];
        try {
            console.log(`🚀 Mengirim ke ${to}...`);
            const tx = await senderWallet.sendTransaction({
                to: to,
                value: AMOUNT_TO_SEND
            });

            console.log(`✅ Tx Terkirim! Hash: ${tx.hash}`);
            await tx.wait(); // Menunggu transaksi dikonfirmasi
        } catch (error) {
            console.error(`❌ Gagal mengirim ke ${to}:`, error);
        }
    }

    console.log("\n🎉 Semua transaksi selesai!");
}

sendBulkTransactions();

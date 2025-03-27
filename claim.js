const { Wallet } = require("ethers");
const fs = require("fs");
const readline = require("readline");
require("dotenv").config();
const { ethers } = require("ethers");
const axios = require("axios");
const { HttpsProxyAgent } = require("https-proxy-agent");

const RPC_URL = "https://sepolia-rollup.arbitrum.io/rpc";
const provider = new ethers.JsonRpcProvider(RPC_URL);
const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const AMOUNT_TO_SEND = ethers.parseEther("0.001");
const ADDRESSES_FILE = "addresses.txt";
const PRIVATE_KEYS_FILE = "pk.txt";
const PROXIES_FILE = "proxies.txt";
const INTERVAL_HOURS = 25; // Interval waktu untuk klaim faucet & pengiriman token
const RECEIVER_ADDRESS = process.env.RECEIVER_ADDRESS;  // Alamat penerima dari .env
const CA_TOKEN = process.env.CA_TOKEN;  // Kontrak token yang akan dikirim

function logSuccess(message) {
    console.log(`✅ ${message}`);
}

function logError(message) {
    console.log(`❌ ${message}`);
}

function logInfo(message) {
    console.log(`ℹ️ ${message}`);
}

// Input jumlah wallet yang akan dibuat
function askForWalletCount() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question("Berapa banyak wallet yang ingin Anda buat? ", (count) => {
        const numWallets = parseInt(count);
        if (isNaN(numWallets) || numWallets <= 0) {
            logError("Jumlah wallet tidak valid. Mohon masukkan angka yang valid.");
            rl.close();
            return;
        }
        generateWallets(numWallets);
        rl.close();
    });
}

// Generate Wallets
function generateWallets(count) {
    let addressData = "", privateKeyData = "";

    for (let i = 0; i < count; i++) {
        let wallet = Wallet.createRandom();
        addressData += `${wallet.address}\n`;
        privateKeyData += `${wallet.privateKey}\n`;
        logSuccess(`Wallet ${i + 1}: ${wallet.address}`);
    }

    fs.writeFileSync(ADDRESSES_FILE, addressData);
    fs.writeFileSync(PRIVATE_KEYS_FILE, privateKeyData);
    logSuccess(`${count} wallet berhasil dibuat!`);
    runPostWalletCreationTasks();  // Langsung jalankan tugas setelah pembuatan wallet
}

// Fungsi untuk menjalankan tugas setelah pembuatan wallet
async function runPostWalletCreationTasks() {
    logInfo("🔥 Memulai pengiriman ETH ke wallet...");
    await sendBulkTransactions();

    logInfo("🔥 Memulai klaim faucet...");
    await startClaim();

    logInfo("🔥 Memulai pengiriman token...");
    await sendTokens();
}

// Kirim ETH ke beberapa wallet
async function sendBulkTransactions() {
    if (!fs.existsSync(ADDRESSES_FILE)) {
        logError("File addresses.txt tidak ditemukan!");
        return;
    }

    const addresses = fs.readFileSync(ADDRESSES_FILE, "utf-8").split("\n").filter(addr => addr.trim() !== "");
    logInfo(`Mengirim ${AMOUNT_TO_SEND} ETH ke ${addresses.length} wallet...`);

    let nonce = await provider.getTransactionCount(senderWallet.address, "latest");
    const feeData = await provider.getFeeData();
    const maxFeePerGas = feeData.maxFeePerGas || ethers.parseUnits("0.3", "gwei");
    const maxPriorityFeePerGas = feeData.maxPriorityFeePerGas || ethers.parseUnits("0.1", "gwei");

    for (let i = 0; i < addresses.length; i++) {
        const to = addresses[i];

        try {
            logInfo(`🚀 Mengirim ke ${to}...`);

            const tx = await senderWallet.sendTransaction({
                to,
                value: AMOUNT_TO_SEND,
                maxFeePerGas,
                maxPriorityFeePerGas,
                nonce: nonce + i
            });

            logSuccess(`Tx terkirim! Hash: ${tx.hash}`);

            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error) {
            logError(`Gagal mengirim ke ${to}: ${error.message}`);
        }
    }
}

// Klaim Faucet untuk semua wallet terlebih dahulu
async function startClaim() {
    if (!fs.existsSync(ADDRESSES_FILE)) {
        logError("File addresses.txt tidak ditemukan!");
        return;
    }

    const wallets = fs.readFileSync(ADDRESSES_FILE, 'utf8').split('\n').filter(addr => addr);
    const FAUCET_URL = "https://app.x-network.io/maitrix-faucet/faucet/";

    const proxies = fs.readFileSync(PROXIES_FILE, 'utf-8').split('\n').filter(proxy => proxy.trim() !== "");

    for (const wallet of wallets) {
        try {
            const proxy = proxies[Math.floor(Math.random() * proxies.length)];  // Ambil proxy acak
            const agent = new HttpsProxyAgent(proxy);

            logInfo(`🔹 Memproses klaim untuk ${wallet}...`);
            const response = await axios.post(FAUCET_URL, { address: wallet }, { httpsAgent: agent });

            logSuccess(`✅ ${wallet}: ${response.data.message}`);
        } catch (error) {
            logError(`❌ ${wallet}: Gagal klaim.`);
        }

        await new Promise(resolve => setTimeout(resolve, Math.random() * (5000 - 2000) + 2000));
    }

    logSuccess("✅ Semua address sudah diproses!");
}

async function sendTokens() {
    if (!fs.existsSync(PRIVATE_KEYS_FILE)) {
        logError("File pk.txt tidak ditemukan!");
        return;
    }

    const privateKeys = fs.readFileSync(PRIVATE_KEYS_FILE, "utf-8").split("\n").filter(pk => pk.trim() !== "");

    for (let i = 0; i < privateKeys.length; i++) {
        const privateKey = privateKeys[i].trim();
        const wallet = new ethers.Wallet(privateKey, provider);

        try {
            logInfo(`🚀 Mengirim dari ${wallet.address}...`);

            // Buat instance kontrak token ERC-20
            const contract = new ethers.Contract(CA_TOKEN, ['function transfer(address to, uint256 amount)', 'function balanceOf(address owner) view returns (uint256)'], wallet);

            // Ambil saldo token ERC-20 di wallet
            const balance = await contract.balanceOf(wallet.address);

            // Cek jika saldo 0
            if (balance.toString() === '0') {
                logInfo(`Saldo ${wallet.address} kosong, tidak ada token yang dapat dikirim.`);
                continue;
            }

            // Kirim saldo maksimal (jumlah seluruh saldo yang tersedia)
            const tx = await contract.transfer(RECEIVER_ADDRESS, balance);

            logSuccess(`Tx terkirim! Hash: ${tx.hash}`);
            await new Promise(resolve => setTimeout(resolve, 5000));

        } catch (error) {
            logError(`Gagal mengirim dari ${wallet.address}: ${error.message}`);
        }
    }
}

// Menu utama untuk memilih mode
function showMenu() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(
        "Pilih mode:\n1. Auto Run\n2. Manual Run\nPilih 1 atau 2: ",
        (choice) => {
            if (choice === '1') {
                autoRun();
            } else if (choice === '2') {
                manualRun();
            } else {
                logError("Pilihan tidak valid.");
                rl.close();
            }
        }
    );
}

// Fungsi manual untuk memilih aksi
async function manualRun() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    rl.question(
        "Pilih aksi:\n1. Generate Wallet\n2. Send Fee Eth\n3. Claim Faucet\n4. Send Token ATH\nPilih 1-4: ",
        async (action) => {
            switch (action) {
                case '1':
                    askForWalletCount();
                    break;
                case '2':
                    await sendBulkTransactions();
                    break;
                case '3':
                    await startClaim();
                    break;
                case '4':
                    await sendTokens();
                    break;
                default:
                    logError("Pilihan tidak valid.");
            }

            // Setelah pembuatan wallet, langsung jalankan auto-run
            if (action === '1') {
                logInfo("🔥 Memulai proses otomatis setelah pembuatan wallet...");
                await sendBulkTransactions();
                await startClaim();
                await sendTokens();  // Loop akan terus berjalan untuk klaim & kirim token
            }

            rl.close();
        }
    );
}

// Fungsi auto run
async function autoRun() {
    logInfo("🚀 Memulai proses otomatis...");

    try {
        await startClaim();
        logInfo("🔄 Memulai pengiriman token setelah klaim faucet...");
        await sendTokens();
        logInfo(`⏳ Menunggu ${INTERVAL_HOURS} jam sebelum kirim ulang...`);
        setTimeout(autoRun, INTERVAL_HOURS * 60 * 60 * 1000); // Loop otomatis setelah 25 jam
    } catch (error) {
        logError(`Terjadi kesalahan saat menjalankan autoRun: ${error.message}`);
    }
}

// Jika file addresses.txt atau pk.txt tidak ada, minta jumlah wallet dan buat wallet
if (!fs.existsSync(ADDRESSES_FILE) || !fs.existsSync(PRIVATE_KEYS_FILE)) {
    askForWalletCount();
} else {
    showMenu(); // Minta pemilihan mode
}
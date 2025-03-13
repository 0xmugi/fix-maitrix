const axios = require('axios');
const fs = require('fs').promises;
const path = require('path');
const { HttpsProxyAgent } = require('https-proxy-agent');

// List proxy
const proxies = [
    "http://slgevqoz:r7ydnqnutblk@38.154.227.167:5868",
    "http://slgevqoz:r7ydnqnutblk@38.153.152.244:9594"
];

// Simpan cookies session per wallet
let sessionCookies = {};

// Baca file address.txt
async function readWallets() {
    const filePath = path.join(__dirname, 'addresses.txt');
    const fileContent = await fs.readFile(filePath, 'utf8');
    return fileContent.split('\n').map(addr => addr.trim()).filter(addr => addr);
}

// Simpan wallet yang kena rate limit ke file
async function saveRateLimitedWallet(wallet) {
    const filePath = path.join(__dirname, 'rate_limited.txt');
    await fs.appendFile(filePath, wallet + '\n');
}

// URL API Faucet
const FAUCET_URL = "https://app.x-network.io/maitrix-faucet/faucet/";

// Fungsi untuk generate User-Agent random
function getRandomUserAgent() {
    const userAgents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/118.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Firefox/117.0"
    ];
    return userAgents[Math.floor(Math.random() * userAgents.length)];
}

// Fungsi untuk memilih proxy secara acak
function getRandomProxy() {
    return proxies[Math.floor(Math.random() * proxies.length)];
}

// Fungsi untuk claim faucet
async function claimFaucet(wallet) {
    try {
        const proxy = getRandomProxy();
        const agent = new HttpsProxyAgent(proxy);

        const headers = {
            "Content-Type": "application/json",
            "User-Agent": getRandomUserAgent(),
            "Accept-Language": "en-US,en;q=0.9",
            "Referer": "https://app.x-network.io/",
            "Origin": "https://app.x-network.io",
            "Connection": "keep-alive",
            "Cookie": sessionCookies[wallet] || "" // Gunakan cookie yang sudah disimpan jika ada
        };

        const response = await axios.post(FAUCET_URL, { address: wallet }, { headers, httpsAgent: agent });

        if (response.data && response.data.message) {
            if (response.data.message.includes("already claimed")) {
                console.log(`⏳ [SKIPPED] ${wallet}: Already claimed today.`);
                return false;
            }
        }

        // Simpan cookie session jika ada
        if (response.headers['set-cookie']) {
            sessionCookies[wallet] = response.headers['set-cookie'].join("; ");
        }

        console.log(`✅ [SUCCESS] ${wallet}:`, response.data);
        return true;

    } catch (error) {
        if (error.response && error.response.data && error.response.data.message === "Too many requests!") {
            const retryDelay = Math.floor(Math.random() * (60000 - 30000 + 1)) + 30000; // Delay 30 - 60 detik
            console.log(`⏳ [RATE LIMIT] ${wallet}: Too many requests! Saving to rate_limited.txt...`);
            
            // Simpan ke file rate_limited.txt
            await saveRateLimitedWallet(wallet);
            return false;
        }

        console.error(`❌ [ERROR] ${wallet}:`, error.response ? error.response.data : error.message);
        return false;
    }
}

// Fungsi utama untuk melakukan klaim dengan delay acak
async function startClaim() {
    let wallets = await readWallets();
    let claimedWallets = 0;

    for (const wallet of wallets) {
        console.log(`🚀 Claiming for ${wallet}...`);
        const success = await claimFaucet(wallet);

        if (!success) continue; // Skip ke wallet berikutnya jika gagal

        claimedWallets++;
        console.log(`🎉 [INFO] ${claimedWallets}/${wallets.length} addresses claimed!`);

        if (claimedWallets >= wallets.length) {
            console.log("✅ Semua address sudah diklaim! Bot berhenti.");
            return;
        }

        // Delay acak antara 15 - 30 detik
        const delay = Math.floor(Math.random() * (30000 - 15000 + 1)) + 15000;
        console.log(`⏳ Waiting ${delay / 1000} seconds before next claim...`);
        await new Promise(resolve => setTimeout(resolve, delay));
    }
}

// Mulai klaim faucet
startClaim().catch(err => console.error("Terjadi kesalahan dalam proses klaim:", err));

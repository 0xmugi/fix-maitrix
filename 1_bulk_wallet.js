const { Wallet } = require("ethers");
const fs = require("fs");

const WALLET_COUNT = 50; // Jumlah wallet yang ingin dibuat
const OUTPUT_FILE = "wallets.txt";
const ADDRESSES_FILE = "addresses.txt"; // Ini berisi WALLET DOANG
const PRIVATE_KEYS_FILE = "pk.txt"; // Nama file untuk menyimpan private key

function generateWallets(count) {
    let fullData = "Address | Private Key | Mnemonic\n";
    fullData += "-----------------------------------------------\n";
    let addressData = "";
    let privateKeyData = ""; // Untuk menyimpan private key

    for (let i = 0; i < count; i++) {
        let wallet = Wallet.createRandom();
        let address = wallet.address;
        let privateKey = wallet.privateKey;
        let mnemonic = wallet.mnemonic ? wallet.mnemonic.phrase : "No Mnemonic";

        console.log(`Wallet ${i + 1}: ${address}`);

        fullData += `${address} | ${privateKey} | ${mnemonic}\n`;
        addressData += `${address}\n`;
        privateKeyData += `${privateKey}\n`; // Menambahkan private key ke dalam privateKeyData
    }

    // Simpan ke file
    fs.writeFileSync(OUTPUT_FILE, fullData);
    fs.writeFileSync(ADDRESSES_FILE, addressData);
    fs.writeFileSync(PRIVATE_KEYS_FILE, privateKeyData); // Menyimpan private key ke dalam pk.txt

    console.log(`\n✅ ${count} wallet berhasil dibuat dan disimpan di '${OUTPUT_FILE}', '${ADDRESSES_FILE}', dan '${PRIVATE_KEYS_FILE}'`);
}

generateWallets(WALLET_COUNT);

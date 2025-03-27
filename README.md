# Maitrix_BOT
 
# Faucet Claim & Token Sender Bot

Bot ini dirancang untuk membantu Anda mengklaim faucet secara otomatis dan mengirimkan token ERC-20 ke berbagai alamat wallet. Bot ini menggunakan jaringan Sepolia di Ethereum Rollup (Arbitrum) dan token ERC-20 yang Anda tentukan dalam file `.env`. Bot dapat berjalan dalam mode otomatis (auto run) atau manual, sesuai dengan kebutuhan Anda.

## Fitur

1. **Buat Wallet Baru**: Buat beberapa wallet Ethereum secara acak dan simpan alamat serta private key-nya.
2. **Klaim Faucet**: Klaim faucet Ethereum untuk setiap wallet yang dihasilkan.
3. **Kirim Ether ke Wallet**: Kirim Ether ke beberapa wallet yang terdaftar dalam file `addresses.txt`.
4. **Kirim Token ERC-20**: Kirim token ERC-20 dari wallet yang terdaftar di file `pk.txt` ke alamat penerima yang telah ditentukan.
5. **Mode Otomatis & Manual**: Pilih mode eksekusi yang sesuai (otomatis atau manual).

## Persyaratan

- Node.js (v16.0.0 atau lebih tinggi)
- NPM (v8.0.0 atau lebih tinggi)

## Instalasi

1. **Clone repositori ini:**
   ```bash
   git clone https://github.com/0xmugi/fix-maitrix.git
   cd fix-maitrix

2. **Instal Node.js dan NPM:**
   ```bash
   sudo apt update
   sudo apt install nodejs npm
   
2. **Instal dependensi:**
   ```bash
   npm install

4. **Edit File .env TANPA TANDA <>:**
   ```bash
   PRIVATE_KEY=<private_key_anda>
   RECEIVER_ADDRESS=<alamat_penerima_token>
   CA_TOKEN=0x1428444Eacdc0Fd115dd4318FcE65B61Cd1ef399

5. **Buat file proxies.txt:**
   proxies.txt: Daftar proxy (1 per baris).
   

# Cara Penggunaan

## Mode Manual
Pilih mode Manual untuk memilih aksi secara manual. Anda dapat memilih aksi berikut:

1. **Generate Wallet**: Membuat wallet baru dan menyimpan alamat serta private key.
2. **Send Fee Eth**: Mengirim Ether ke wallet yang terdaftar di `addresses.txt`.
3. **Claim Faucet**: Mengklaim faucet untuk wallet yang terdaftar di `addresses.txt`.
4. **Send Token ATH**: Mengirim token ERC-20 dari wallet yang terdaftar di `pk.txt` ke alamat penerima.

## Mode Otomatis
Pilih mode Auto Run untuk menjalankan proses otomatis. Bot akan melakukan aksi berikut:

1. Klaim faucet untuk semua wallet.
2. Kirim token ERC-20 ke alamat penerima.
3. Tunggu selama 25 jam dan ulangi proses secara otomatis.

Tinggal duduk manis dan biarkan bot berjalan!


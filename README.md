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
   
2. **Instal dependensi:**
   npm install

3. **Buat file .env: Salin template file .env.example ke .env dan sesuaikan isinya:**
   PRIVATE_KEY=<private_key_anda>
   
   RECEIVER_ADDRESS=<alamat_penerima_token>
   
   CA_TOKEN=0x1428444Eacdc0Fd115dd4318FcE65B61Cd1ef399

4. **Buat file proxies.txt, addresses.txt, dan pk.txt:**
   proxies.txt: Daftar proxy (1 per baris).
   
   addresses.txt: Daftar alamat wallet yang akan diklaim faucet (1 per baris).
   
   pk.txt: Daftar private key wallet yang digunakan untuk mengirim token ERC-20 (1 per baris)

# Cara Penggunaan
 # Mode Manual
    Pilih mode Manual untuk memilih aksi secara manual.
    
    Anda dapat memilih aksi berikut:
    
    Generate Wallet: Membuat wallet baru dan menyimpan alamat serta private key.
    
    Send Fee Eth: Mengirim Ether ke wallet yang terdaftar di addresses.txt.
    
    Claim Faucet: Mengklaim faucet untuk wallet yang terdaftar di addresses.txt.
    
    Send Token ATH: Mengirim token ERC-20 dari wallet yang terdaftar di pk.txt ke alamat penerima.
 
 # Mode Otomatis
    Pilih mode Auto Run untuk menjalankan proses otomatis:
    
    Klaim faucet untuk semua wallet.
    
    Kirim token ERC-20 ke alamat penerima.
    
    Tunggu selama 25 jam dan ulangi.

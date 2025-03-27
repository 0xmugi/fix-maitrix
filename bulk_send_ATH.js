const Web3 = require('web3');
const fs = require('fs');

// Sepolia RPC URL
const rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc';
const web3 = new Web3(rpcUrl);

// Token contract address
const tokenAddress = '0x1428444Eacdc0Fd115dd4318FcE65B61Cd1ef399';

// ERC-20 Token ABI
const tokenABI = [
  {
    "constant": false,
    "inputs": [
      { "name": "to", "type": "address" },
      { "name": "value", "type": "uint256" }
    ],
    "name": "transfer",
    "outputs": [{ "name": "", "type": "bool" }],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "constant": true,
    "inputs": [{ "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "name": "balance", "type": "uint256" }],
    "payable": false,
    "stateMutability": "view",
    "type": "function"
  }
];

// Alamat penerima
const receiverAddress = '0x9fb3f8750454035EB9D2942Bd6247e6BF680CbCC';

// Load private keys dari file
const privateKeys = fs
  .readFileSync('pk.txt', 'utf-8')
  .split('\n')
  .map(line => line.trim())
  .filter(line => line.length === 64 || line.startsWith('0x')); // Filter hanya private key valid

// Fungsi untuk mengirim token dari setiap wallet
async function sendTokens() {
  for (const privateKey of privateKeys) {
    try {
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);
      const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

      // Cek saldo token
      const balance = await tokenContract.methods.balanceOf(account.address).call();
      if (balance === '0') {
        console.log(`⚠️ Wallet ${account.address} tidak memiliki saldo token. SKIP.`);
        continue; // Skip jika saldo token 0
      }

      const amount = web3.utils.toWei('50', 'ether'); // Sesuaikan jumlah token

      // Ambil baseFee dari blok terbaru dan konversi ke BigNumber
      const latestBlock = await web3.eth.getBlock('latest');
      const baseFee = web3.utils.toBN(latestBlock.baseFeePerGas || '1000000000'); // Default 1 Gwei jika undefined
      const priorityFee = web3.utils.toBN(web3.utils.toWei('2', 'gwei')); // Priority fee 2 Gwei
      const maxFeePerGas = baseFee.add(priorityFee); // Tambahkan base fee dengan priority fee

      // Estimasi gas
      const gas = await tokenContract.methods.transfer(receiverAddress, amount).estimateGas({ from: account.address });

      // Kirim transaksi
      const tx = await tokenContract.methods.transfer(receiverAddress, amount).send({
        from: account.address,
        gas,
        maxFeePerGas,
        maxPriorityFeePerGas: priorityFee
      });

      console.log(`✅ Transaksi sukses dari ${account.address} - Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error(`❌ Gagal mengirim token dari ${privateKey}: ${error.message}`);
    }
  }
}

// Jalankan pengiriman token
sendTokens();

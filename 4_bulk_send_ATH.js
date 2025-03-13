const Web3 = require('web3');
const fs = require('fs');

// Sepolia RPC URL
const rpcUrl = 'https://sepolia-rollup.arbitrum.io/rpc';
const web3 = new Web3(rpcUrl);  // Directly passing the RPC URL to Web3 constructor

// Token contract address (replace with your token contract address)
const tokenAddress = '0x1428444Eacdc0Fd115dd4318FcE65B61Cd1ef399';

// ERC-20 Token ABI (replace this with your contract ABI)
const tokenABI = [
  {
    "constant": false,
    "inputs": [
      {
        "name": "to",
        "type": "address"
      },
      {
        "name": "value",
        "type": "uint256"
      }
    ],
    "name": "transfer",
    "outputs": [
      {
        "name": "",
        "type": "bool"
      }
    ],
    "payable": false,
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

// Receiver's address
const receiverAddress = '0x9fb3f8750454035EB9D2942Bd6247e6BF680CbCC';

// Load the private keys from the file
const privateKeys = fs.readFileSync('pk.txt', 'utf-8').split('\n').map(line => line.trim());

// Function to send tokens from each wallet
async function sendTokens() {
  for (const privateKey of privateKeys) {
    try {
      // Create account from private key
      const account = web3.eth.accounts.privateKeyToAccount(privateKey);
      web3.eth.accounts.wallet.add(account);

      // Create the token contract instance
      const tokenContract = new web3.eth.Contract(tokenABI, tokenAddress);

      // Amount to send (50 tokens, adjust based on token's decimals)
      const amount = web3.utils.toWei('50', 'ether');  // Adjust based on token's decimals

      // Estimate gas for the transaction
      const gas = await tokenContract.methods.transfer(receiverAddress, amount).estimateGas({ from: account.address });

      // Send the transaction
      const tx = await tokenContract.methods.transfer(receiverAddress, amount).send({
        from: account.address,
        gas,
        gasPrice: await web3.eth.getGasPrice()
      });

      console.log(`Transaction successful from ${account.address} - Tx Hash: ${tx.transactionHash}`);
    } catch (error) {
      console.error(`Error sending tokens from ${privateKey}:`, error.message);
    }
  }
}

// Start sending tokens
sendTokens();

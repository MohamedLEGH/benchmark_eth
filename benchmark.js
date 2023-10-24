const ethers = require('ethers');
const { NonceManager } = require("@ethersproject/experimental");

const rpcUrl = 'http://IP_ADDRESS:PORT';
const privateKey = 'PRIVATE_KEY';

const numTransactions = 1000;

async function main() {
  const provider = new ethers.JsonRpcProvider(rpcUrl);

  const wallet = new ethers.Wallet(privateKey, provider);
  const manager = new NonceManager(wallet);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Solde du compte: ${ethers.formatEther(balance)} ETH`);
  let currentNonce = await provider.getTransactionCount(wallet.address);

  const transactions = [];
  let tx_list = [];
  const start = Date.now()
  for (let i = 0; i < numTransactions; i++) {
    const randomAddress = ethers.Wallet.createRandom().address;

    const tx = {
      to: randomAddress,
      value: 0n, // 0 wei
      // nonce: await provider.getTransactionCount(wallet.address, 'latest'),
      nonce: currentNonce,
    };
    //nonceManager.incrementTransactionCount();
    currentNonce++;
    //transactions.push(tx);

    let tx_send = await manager.sendTransaction(tx);
    let hash = tx_send.hash;
    console.log(hash);
    tx_list.push(hash);
    // await provider.waitForTransaction(hash);    
  }
  let promise_list = [];
  for (const tx of tx_list) {
  	const promise = provider.waitForTransaction(tx);
  	promise_list.push(promise);
  }
  await Promise.all(promise_list);
  const end = Date.now();
  // Envoyez les transactions simultanément
//   const promises = [];
//   const start = Date.now();
//   transactions.forEach((tx) => {
//     wallet.sendTransaction(tx).then((tx) => tx.wait(tx));
//     // const promise = wallet.sendTransaction(tx);
//     // const promise = wallet.sendTransaction(tx)//.then((tx) => tx.wait()); // Attendre la confirmation du bloc
//     // promises.push(promise);
//   });
// 
//   const end = Date.now();

  // const callTasks = () => {
  // 	for (const promise of promises) {
  // 		promise().then((tx) => print(tx));
  // 	}
  // };
  
  // const start = Date.now();
  // //await Promise.all(promises);
  // callTasks();
  // const end = Date.now();

  const elapsedTime = end - start;
  const tps = numTransactions / (elapsedTime / 1000);

  console.log(`Transactions envoyées: ${numTransactions}`);
  console.log(`Temps écoulé: ${elapsedTime} ms`);
  console.log(`Débit de transactions par seconde (TPS): ${tps}`);
}

main().catch((error) => {
  console.error(error);
});

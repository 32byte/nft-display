// can be run using `yarn withdraw`

import { Provider, Wallet, Contract, utils } from 'zksync-web3';
import * as ethers from 'ethers';

const PRIVATE_KEY = 'YOUR_PRIVATE_KEY';

const paymentToken = {
  symbol: 'DAI',
  address: '0x5C221E77624690fff6dd741493D735a17716c26B',
  decimals: 18,
};
// address of the display smart contract
const displayAddress = '0x40850C538129B3DeC54A54cc0eAc7a7D333f78A9';
// get display contract abi
const abi = require('./website/contracts/Display.json');

const main = async () => {
  // create provider
  const provider = new Provider("https://zksync2-testnet.zksync.dev")
  const wallet = new Wallet(PRIVATE_KEY).connect(provider);

  // create erc20 token contract
  const tokenContract = new Contract(
    paymentToken.address,
    utils.IERC20,
    provider
  );
  // create display contract
  const displayContract = new Contract(
    displayAddress,
    abi,
    wallet
  );


  // get balance of the display contract
  const balance = await tokenContract.balanceOf(displayAddress);
  const formattedBalance = ethers.utils.formatUnits(balance, paymentToken.decimals);

  // print balance
  console.log(`Display contract balance: ${formattedBalance} ${paymentToken.symbol}`);

  if (balance > 0) {
    console.log('Withdrawing...');

    // withdraw tokens
    const tx = await displayContract.withdraw();
    // wait for transaction to be mined
    await tx.wait();
    
    console.log('Success!');
  }
}

main();
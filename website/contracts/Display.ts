import { Contract, Web3Provider } from 'zksync-web3';

// TODO: adjust if needed
const ABI = require('./Display.json');

export default function getDisplayContract(provider: Web3Provider) {
  // TODO: fill this out
  return new Contract('DISPLAY_CONTRACT_ADDRESS', ABI, provider.getSigner());
}

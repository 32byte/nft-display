import { Contract, Web3Provider } from 'zksync-web3';

// TODO: adjust if needed
const ABI = require('./NFT.json');

export default function getNFTContract(provider: Web3Provider) {
  // TODO: fill this out
  return new Contract('NFT_CONTRACT_ADDRESS', ABI, provider.getSigner());
}

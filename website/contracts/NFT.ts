import { Contract, Web3Provider } from 'zksync-web3';

const ABI = require('./NFT.json');

export default function getNFTContract(provider: Web3Provider) {
  return new Contract('0x67656E6453876e096b7dDEE9Fb5Bc65Ea8F019fB', ABI, provider.getSigner());
}

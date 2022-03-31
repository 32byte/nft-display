import { Contract, Web3Provider } from 'zksync-web3';

const ABI = require('./NFT.json');

export default function getNFTContract(provider: Web3Provider) {
  return new Contract('0xc2Bc9961A8D71B4e784b9227aFe3Ef12d2af0E26', ABI, provider.getSigner());
}

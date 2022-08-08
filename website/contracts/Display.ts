import { Contract, Web3Provider } from 'zksync-web3';

const ABI = require('./Display.json');

export default function getDisplayContract(provider: Web3Provider) {
  return new Contract('0x95D9D3d680d411902B0B8245E9124ded50354221', ABI, provider.getSigner());
}

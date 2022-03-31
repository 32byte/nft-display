import { Contract, Web3Provider } from 'zksync-web3';

const ABI = require('./Display.json');

export default function getDisplayContract(provider: Web3Provider) {
  return new Contract('0x40850C538129B3DeC54A54cc0eAc7a7D333f78A9', ABI, provider.getSigner());
}

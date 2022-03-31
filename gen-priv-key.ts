import { ethers } from 'ethers';

const PRIVATE_KEY = ethers.utils.hexlify(ethers.utils.randomBytes(32));

console.log(`Private key generate: ${PRIVATE_KEY}`);
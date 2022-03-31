import { Wallet, Provider } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// set your private key
// you can generate one using `yarn generate-private-key`
// make sure to request funds from the faucet to pay the deploy fees
// you can do that at portal.zksync.io
const PRIVATE_KEY = 'YOUR_PRIVATE_KEY';

// USDC: 0xd35CCeEAD182dcee0F148EbaC9447DA2c4D449c4
//  DAI: 0x5C221E77624690fff6dd741493D735a17716c26B
const FEE_TOKEN = '0x5C221E77624690fff6dd741493D735a17716c26B';

// contract interface 
interface CONTRACT {
  // the name of the contract specified in the file
  name: string,
  // arguments which are passed to the constructor
  args: any[]
}
// contracts to be deployed
const CONTRACTS: CONTRACT[] = [
  {
    name: 'Display',
    // the token address in which we accept payments
    args: ['0x5C221E77624690fff6dd741493D735a17716c26B']
  },
  {
    name: 'NFT',
    args: []
  }
]

// this function will deploy both contracts at the same time.
export default async function (hre: HardhatRuntimeEnvironment) {
  // get private key
  const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY || PRIVATE_KEY;
  if (!DEPLOYER_PRIVATE_KEY) throw new Error("PRIVATE_KEY not set!");
  // get fee token
  const DEPLOY_FEE_TOKEN = process.env.FEE_TOKEN || FEE_TOKEN;
  if (!DEPLOY_FEE_TOKEN) throw new Error("FEE_TOKEN not set!");

  // initialize deployer
  const provider = new Provider("https://zksync2-testnet.zksync.dev")
  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY).connect(provider);
  const deployer = new Deployer(hre, wallet);

  for (const contract of CONTRACTS) {
    console.log(`Deploying ${contract.name}!`);
    // load artifact
    const artifact = await deployer.loadArtifact(contract.name);
    // deploy the contract
    const deployed_contract = await deployer.deploy(artifact, contract.args, DEPLOY_FEE_TOKEN);
    // Show the contract info.
    const contractAddress = deployed_contract.address;
    console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
  };
}
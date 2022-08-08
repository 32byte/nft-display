import { Wallet, Provider } from "zksync-web3";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { Deployer } from "@matterlabs/hardhat-zksync-deploy";

// set your private key
// you can generate one using `yarn generate-private-key`
// make sure to request funds from the faucet to pay the deploy fees
// you can do that at portal.zksync.io
// recommended to set privateKey in .env file
import * as dotenv from "dotenv";
dotenv.config();

const PRIVATE_KEY = 'private-key';


// contract interface 
interface CONTRACT {
  // the name of the contract specified in the file
  name: string,
  // arguments which are passed to the constructor
  args: any[]
}

// this function will deploy both contracts at the same time.
export default async function (hre: HardhatRuntimeEnvironment) {
  var provider = new Provider('https://zksync2-testnet.zksync.dev');
  // WARNING THESE ADDRESSES ARE ON GOERLI NOT MAINNNET
  // https://goerli.etherscan.io/token/0x5ffbac75efc9547fbc822166fed19b05cd5890bb
  // https://etherscan.io/token/0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
  // const L1_DAI_ADDRESS = "0xe68104d83e647b7c1c15a91a8d8aad21a51b3b3e"
  const L1_USDC_ADDRESS = "0xd35cceead182dcee0f148ebac9447da2c4d449c4"
  const L2_FEE_TOKEN = await provider.l2TokenAddress(L1_USDC_ADDRESS)
  
  // contracts to be deployed
  const CONTRACTS: CONTRACT[] = [
    {
      name: 'Display',
      // the token address in which we accept payments
      args: [L2_FEE_TOKEN]
    },
    {
      name: 'NFT',
      args: []
    }
  ]
  // get private key
  const DEPLOYER_PRIVATE_KEY = process.env.PRIVATE_KEY || PRIVATE_KEY;
  if (!DEPLOYER_PRIVATE_KEY) throw new Error("PRIVATE_KEY not set!");
  // get fee token
  const DEPLOY_FEE_TOKEN = process.env.FEE_TOKEN || L2_FEE_TOKEN;
  if (!DEPLOY_FEE_TOKEN) throw new Error("FEE_TOKEN not set!");

  // initialize deployer
  const wallet = new Wallet(DEPLOYER_PRIVATE_KEY).connect(provider);
  const deployer = new Deployer(hre, wallet);

  for (const contract of CONTRACTS) {
    try {
      console.log(`Deploying ${contract.name}! if it takes too long deploy again... Was known issue`);
      // load artifact
      const artifact = await deployer.loadArtifact(contract.name);
      // deploy the contract
      const deployed_contract = await deployer.deploy(artifact, contract.args, { feeToken: DEPLOY_FEE_TOKEN }); // todo why I get error
      // const deployed_contract = await deployer.deploy(artifact, contract.args); // deploying with eth
      // Show the contract info.
      const contractAddress = deployed_contract.address;
      console.log(`${artifact.contractName} was deployed to ${contractAddress}`);
    } catch (err) {
      console.log(err)
    }
  };
}
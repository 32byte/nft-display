import * as fs from 'fs';

interface Contract {
  fileName: string,
  contractName: string,
}

// files in ./artifacts-zk/contracts/
const dir = fs.readdirSync('./artifacts-zk/contracts');

for (const subfolder of dir) {
  // read files in that subfolder
  const files = fs.readdirSync(`./artifacts-zk/contracts/${subfolder}`);
  for (const file of files) {
    // skip non-json files
    if (!file.endsWith('.json')) continue;
    // skip .dbg.json files
    if (file.endsWith('.dbg.json')) continue;

    try{
      // read content of file
      const content = fs.readFileSync(`./artifacts-zk/contracts/${subfolder}/${file}`, 'utf8');
      // parse json
      const data = JSON.parse(content);
      const abi = data.abi;

      // get contract name
      const contractName = file.replace('.json', '');
  
      fs.writeFileSync(`./website/contracts/${contractName}.json`, JSON.stringify(abi));
    } catch(err) {
      console.error(err);
    }
  }
}
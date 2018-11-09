'use strict';

const yaml = require('js-yaml');
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');

// A wallet stores a collection of identities for use
const wallet = new FileSystemWallet('./_idwallet');

async function main() {

  // A gateway defines the peers used to access Fabric networks
  const gateway = new Gateway();

  // Main try/catch block
  try {
    const CONTRACT_NAME = 'sample-fabric-code';

    const identityLabel = 'User1@org1.example.com';
    let connectionProfile = yaml.safeLoad(fs.readFileSync('./network.yaml', 'utf8'));

    let connectionOptions = {
      identity: identityLabel,
      wallet: wallet
    };

    // Connect to gateway using application specified parameters
    await gateway.connect(connectionProfile, connectionOptions);

    console.log('Connected to Fabric gateway.');

    // Get addressability to PaperNet network
    const network = await gateway.getNetwork('mychannel');

    console.log('Connected to mychannel. ');

    // Get addressability to commercial paper contract
    const contract = await network.getContract(CONTRACT_NAME);

    console.log('\nSubmit hello world transaction.');

    // issue commercial paper
    let response = await contract.submitTransaction('transaction1', 'hello');
    console.log(JSON.parse(response.toString()));
    
    const channel = network.getChannel();
    let request = { chaincodeId: CONTRACT_NAME, fcn: 'getData', args: ['ITEM', ''] };
    let resultBuffer = await channel.queryByChaincode(request);
    let result = JSON.parse(resultBuffer.toString());
    console.log(result);

  } catch (error) {
    console.log(`Error processing transaction. ${error}`);
    console.log(error.stack);
  } finally {
    // Disconnect from the gateway
    console.log('Disconnect from Fabric gateway.');
    gateway.disconnect();
  }
}

// invoke the main function, can catch any error that might escape
main().then(() => {
  console.log('done');
}).catch((e) => {
  console.log('Final error checking.......');
  console.log(e);
  console.log(e.stack);
  process.exit(-1);
});

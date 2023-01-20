// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

//const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();

  const stringsLib = await deploy("strings")

  const stringsAddress = stringsLib.address //hard code this and comment out the line above after the first deploy

  const yourContract = await deploy("YourCollectible",{from: deployer,from: deployer},{ "strings": stringsLib.address }) // <-- add in constructor args like line 16 vvvv

  /*const lib = await deploy("strings", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
     from: deployer,
  });*/

 /* await deploy("YourCollectible", {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  },{
    strings: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
   });*/

   /*const contractFactory = await ethers.getContractFactory("YourCollectible", {
      signer: deployer,
      libraries: {
        strings: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
      },
    });*/


  /*const contract = await contractFactory.deploy();
  console.log(contract.address);
  // Getting a previously deployed contract
  const YourContract = await ethers.getContract("YourCollectible", deployer);*/
  //console.log(lib.address);
  /*  await YourContract.setPurpose("Hello");
  
    To take ownership of yourContract using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */

  /*
  //If you want to send value to an address from the deployer
  const deployerWallet = ethers.provider.getSigner()
  await deployerWallet.sendTransaction({
    to: "0x34aA3F359A9D614239015126635CE7732c18fDF3",
    value: ethers.utils.parseEther("0.001")
  })
  */

  /*
  //If you want to send some ETH to a contract on deploy (make your constructor payable!)
  const yourContract = await deploy("YourContract", [], {
  value: ethers.utils.parseEther("0.05")
  });
  */

  /*
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  const yourContract = await deploy("YourContract", [], {}, {
   LibraryName: **LibraryAddress**
  });
  */
};
module.exports.tags = ["YourCollectible"];

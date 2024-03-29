// deploy/00_deploy_your_contract.js

const { ethers } = require("hardhat");

//const localChainId = "31337";

module.exports = async ({ getNamedAccounts, deployments, getChainId }) => {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const chainId = await getChainId();


  const lib = await deploy("MadLibsUtility", { //0x762C0F40849f03815997C79BbB17C6d96593fdE3
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
  });

   await deploy("MadLibs", { //0x5FbDB2315678afecb367f032d93F642f64180aa3
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: [ "Hello", ethers.utils.parseEther("1.5") ],
    log: true,
    libraries:{
      MadLibsUtility: lib.address,
    }
  });
    const yourContract = await ethers.getContractAt('MadLibs', deployer) //<-- if you want to instantiate a version of a contract at a specific address!

  // const YourCollectible = await hre.ethers.getContractFactory("YourCollectible", 
  //   { signer: deployer,
  //     libraries:{
  //       MadLibsUtility: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
  //     }
  //   }
  // );
  // // if you need to add constructor arguments for the particular game, add them here:
  // const contract = await YourCollectible.deploy();
  // console.log(contract.address);
  // const yourContract = await ethers.getContractAt('YourCollectible', contract.address) //<-- if you want to instantiate a version of a contract at a specific address!

  // Getting a previously deployed contract
  /*  await YourContract.setPurpose("Hello");
  
    To take ownership of yourContract using the ownable library uncomment next line and add the 
    address you want to be the owner. 
    // yourContract.transferOwnership(YOUR_ADDRESS_HERE);

    const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
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

  
  //If you want to link a library into your contract:
  // reference: https://github.com/austintgriffith/scaffold-eth/blob/using-libraries-example/packages/hardhat/scripts/deploy.js#L19
  // const yourContract = await deploy("YourContract", [], {}, {
  //  LibraryName: **LibraryAddress**
  // });
  
};
module.exports.tags = ["MadLibs"];

const { ethers } = require("hardhat");
const { use, expect } = require("chai");
const { solidity } = require("ethereum-waffle");

use(solidity);

describe("My MadLibs", function () {
  let myContract;

  // quick fix to let gas reporter fetch data from gas station & coinmarketcap
  before((done) => {
    setTimeout(done, 2000);
  });
  
  beforeEach(async () => {
    const Lib = await ethers.getContractFactory("MadLibsUtility");
    const lib = await Lib.deploy();

    const MadLibs = await ethers.getContractFactory("MadLibs",{
      libraries:{
        MadLibsUtility: lib.address,
      }
    });

    myContract = await MadLibs.deploy();
  });

  describe("MadLibs", function () {

    describe("testContract", function () {
      it("Should be able to mint a new mad lib", async function () {
        const text = "live, love, #!";

        await myContract.mintItem(text, 1,{value: (await myContract.price())});
        expect((await myContract.totalSupply())).to.equal(1);
      });
    });
    //   // Uncomment the event and emit lines in YourContract.sol to make this test pass

      it("Should be able to insert a proposal ", async function () {
        const text = "live, love, #!";

        await myContract.mintItem(text, 1,{value: (await myContract.price())});
        expect((await myContract.totalSupply())).to.equal(1);

        const newProposal = ["web3"];
        await myContract.addProposal(newProposal);
        expect( (await myContract.getProposal(0,0)).proposer).to.equal(await ethers.provider.getSigner(0).getAddress());
      });
      it("Should be able to vote a proposal ", async function () {
        const text = "live, love, #!";

        await myContract.mintItem(text, 1,{value: (await myContract.price())});
        expect((await myContract.totalSupply())).to.equal(1);

        const newProposal = ["web3"];
        await myContract.addProposal(newProposal);
        expect( (await myContract.getProposal(0,0)).proposer).to.equal(await ethers.provider.getSigner(0).getAddress());
        
        await myContract.voteProposal(0);
        expect(((await myContract.getProposal(0,0)).countVotes)).to.equal(1);
      
     });
     it("Should not be able to insert more than a proposal ", async function () {
      const text = "live, love, #!";

      await myContract.mintItem(text, 1,{value: (await myContract.price())});
      expect((await myContract.totalSupply())).to.equal(1);

      const newProposal = ["web3"];
      await myContract.addProposal(newProposal);
      expect( (await myContract.getProposal(0,0)).proposer).to.equal(await ethers.provider.getSigner(0).getAddress());
      
      const newProposal2= ["web2"];
      
      await expect(myContract.addProposal(newProposal2)).to.be.reverted;    
   });
    it("Should be able to close the madlib ", async function () {
      const text = "live, love, #!";

      await myContract.mintItem(text, 1,{value: (await myContract.price())});
      expect((await myContract.totalSupply())).to.equal(1);

      const newProposal = ["web3"];
      await myContract.addProposal(newProposal);
      expect( (await myContract.getProposal(0,0)).proposer).to.equal(await ethers.provider.getSigner(0).getAddress());
      
      await myContract.voteProposal(0);
      expect(((await myContract.getProposal(0,0)).countVotes)).to.equal(1);

      await myContract.closeMadLib(0);
      expect(((await myContract._madlibs(0)).closed)).to.equal(true);
    });
    it("only owners should be able to close the madlib ", async function () {
      const text = "live, love, #!";

      await myContract.mintItem(text, 1,{value: (await myContract.price())});
      expect((await myContract.totalSupply())).to.equal(1);

      const newProposal = ["web3"];
      await myContract.addProposal(newProposal);
      expect( (await myContract.getProposal(0,0)).proposer).to.equal(await ethers.provider.getSigner(0).getAddress());
      
      await myContract.voteProposal(0);
      expect(((await myContract.getProposal(0,0)).countVotes)).to.equal(1);

      await expect(myContract.connect(ethers.provider.getSigner(1)).closeMadLib(0)).to.be.reverted;
    });
    it("only owner should be able to set maxVotes ", async function () {

      await myContract.setMaxVotes(1);

      expect(await (myContract.maxVotes())).to.equal(1);

      await expect(myContract.connect(ethers.provider.getSigner(1)).setMaxVotes(2)).to.be.reverted;
    });
    it("only owner should be able to withdraw", async function () {

      await myContract.withdraw();

      await expect(myContract.connect(ethers.provider.getSigner(1)).withdraw()).to.be.reverted;
    });
  });
});

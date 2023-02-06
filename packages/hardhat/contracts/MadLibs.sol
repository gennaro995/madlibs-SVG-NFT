pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import { MadLibsUtility } from "./MadLibsUtility.sol";
import "hardhat/console.sol";

contract MadLibs is ERC721Enumerable, Ownable {
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  uint8 public maxVotes = 99;
  MadLib[] public _madlibs;
  uint256 public price = 0.001 ether;
 
  struct Proposal{
    string[] words;
    uint256 countVotes;
    address proposer;
  }
 
  /**
  * @dev MadLibs -> NFT
  * Note: 
  *   -
  *   - id
  *   - text of Mad Lib
  *   - number of blanks to fill
  *   - proposals of the users
  *   - map to record the proposer
  *   - map to record how many votes of an address for the mad lib
  *   - flag closed
  */
  struct MadLib{ 
    uint256 id;
    string text;
    uint8 nBlanks;
    Proposal[] proposals;
    mapping(address => bool) addrProposed;
    mapping(address => uint8) addrVotes;
    bool closed;
  }

  constructor() ERC721("MadLibs onChain", "MLC") {
  }

  function mintItem(string memory _text, uint8 _nBlanks) public payable returns (uint256) {
    if(0 != _madlibs.length)
        require(_madlibs[_madlibs.length-1].closed, "You can open a new MadLibs only if previous one is closed!");
    require(MadLibsUtility.strlen(_text)<=450, "shorten your text please");
    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    MadLib storage item2mint = _madlibs.push();
    item2mint.id = id;
    item2mint.text = _text;
    item2mint.nBlanks = _nBlanks;
    item2mint.closed = false;
    return id;
  }

  function closeMadLib(uint _id) public {
    require(msg.sender == ownerOf(_id) || msg.sender == owner(), "You are not the owner of nft or MadLibs Owner!");
    require(_madlibs[_tokenIds.current()].closed == false, "Selected MadLib already closed!");
    _madlibs[_id].closed = true;

    if(_madlibs[_id].proposals.length > 0){
      string[] memory replacement = getBestProposal(_id);
      _madlibs[_id].text = MadLibsUtility.replacePlaceholders(_madlibs[_id].text, _madlibs[_id].nBlanks, replacement);
    }

    _tokenIds.increment();
  }

   function getProposal(uint _id, uint _idProposal) public view returns(Proposal memory){
    return _madlibs[_id].proposals[_idProposal]; 
  }

  function getProposals(uint _id) public view returns(Proposal[] memory){
    return _madlibs[_id].proposals; 
  }

  function getBestProposal(uint _id) public view returns(string[] memory){
    uint max = 0;
    uint maxindex = 0;
    for(uint i = 0; i < _madlibs[_id].proposals.length; i++){
      if(_madlibs[_id].proposals[i].countVotes >= max){
        max = _madlibs[_id].proposals[i].countVotes;
        maxindex = i;
      }
    }
    return _madlibs[_id].proposals[maxindex].words;
  }

  function addProposal(string[] memory _words) public{ 
    uint256 id = _tokenIds.current();
    require (_madlibs[id].addrProposed[msg.sender] == false, "Player already has a proposal for this MadLib!");
    require (_words.length == _madlibs[id].nBlanks, "Please insert the correct number of words!");
    require(MadLibsUtility.checkLenArray(_words,35), "Each word must be less than 36 characters");
    _madlibs[id].addrProposed[msg.sender] = true;
    Proposal storage currentProposal = _madlibs[id].proposals.push();
    currentProposal.proposer = msg.sender;
    currentProposal.words = _words;

  }

  function voteProposal(uint _idProposal) public{
    uint256 id = _tokenIds.current();
    require (_madlibs[id].closed == false, "Proposal must be for open/current MadLib!");
    require (_madlibs[id].addrVotes[msg.sender] < maxVotes , "You have already used all yours aviable votes for this MadLib!");
    _madlibs[id].addrVotes[msg.sender]++;
    _madlibs[id].proposals[_idProposal].countVotes++;
  }

  function tokenURI(uint256 _id) public view override returns (string memory) {
    require(_exists(_id), "Not exist!");
    return MadLibsUtility.tokenURI(_id,  ownerOf(_id), _madlibs[_id].text);
  }

  function setMaxVotes(uint8 _maxVotes) public onlyOwner {
    maxVotes = _maxVotes;
  }

  function withdraw() external onlyOwner {
    (bool success, ) = payable(owner()).call{value: address(this).balance}("");
    require(success);
  }
  receive() external payable {
        // React to receiving ether
    }
}
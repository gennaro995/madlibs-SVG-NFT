pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import 'base64-sol/base64.sol';

contract YourCollectible is ERC721Enumerable, Ownable {

  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;
  Counters.Counter private _proposalIds;
  uint8 public max_votes = 3;

  /**
  * @dev
  * Note: 
  *   - words -> parole della proposta
  *   - votes -> voti totalizzati dalla proposta
  * Requirements:
  *   -
  *   -
  * Returns:
  *   -
  */
  struct Proposal{
    uint256 id;
    string[] words;
    uint256 nvotes;
    bool isProposal;
  }
 
  /**
  * @dev MadLibs -> NFT
  * Note: 
  *   - L'ho messo come esempio di come si dovrebbe commentare il codice in solidity
  *   -
  * Requirements:
  *   -
  *   -
  * Returns:
  *   -
  */
  struct MadLib{ 
    uint256 id;
    string text;
    uint8 nwords;
    mapping(address => Proposal) proposals;
    mapping(address => uint8) nvote;
    bool closed;
  }

  MadLib[] public madlibs;

  event WordGuessed(address indexed sender, string word, uint8 index);

  

  constructor() ERC721("MadLibs onChain", "MLC") {
  }

  function mintItem(string memory _text, uint8 _nwords) public onlyOwner returns (uint256) {
    _tokenIds.increment();
    _proposalIds.increment();
    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    //processText(_text, sessions[0]);
    MadLib storage item2mint;
    item2mint.id = id;
    item2mint.text = _text;
    item2mint.nwords = _nwords;
    item2mint.closed = false;
    //madlibs.push(item2mint); //TODO
    return id;
  }

  /*function getMadLib(uint _id) public view returns(MadLib memory) {  //TODO
    return madlibs[_id]; 
  }*/

   function getProposal(uint _id, address _addr) public view returns(Proposal memory){
    return madlibs[_id].proposals[_addr]; 
  }

  /*function getProposals(uint _id, address _addr) public view returns(mapping(address => Proposal) memory){ //TODO
    return madlibs[_id].proposals; 
  }*/

  function addProposal(uint _id, string memory _words) public { 
    require (madlibs[_id].proposals[msg.sender].isProposal == false, "Player already has a proposal for this MadLib!");
    Proposal memory proposal;
    proposal.isProposal = true;
    proposal.id = _tokenIds.current();
    uint8 n = madlibs[_id].nwords;

    for (uint i = 0; i < n; i++) {
      proposal.words[i] = _words; // TODO si deve capire come far arrivale le parole
    }

    madlibs[_id].proposals[msg.sender] = proposal;

  }

  // find #x where x is the first letter of a type of word (a->adjective, v -> verb, n-> noun ecc) those will be the mad lips
  function processText (string memory _at, MadLib storage session) private {
    bytes memory whatBytes = bytes ("#");
    bytes memory whereBytes = bytes (_at);

    bool found = false;
    for (uint i = 0; i <= whereBytes.length - whatBytes.length; i++) {
        bool flag = true;
        for (uint j = 0; j < whatBytes.length; j++)
            if (whereBytes [i + j] != whatBytes [j]) {
                flag = false;
                break;
            }
        if (flag) {
           found = true;
          session.madLibs[session.nMadLibs] = MadLib({
             typeOfWord: whereBytes[i+1],guessed: false
             });

           session.nMadLibs++;
        }
    }
    require (found);

  }


}
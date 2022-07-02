pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT


//ho aggiunto ../node_modules/ perchè vsc mi dava errore forse va tolto prima di deployare
import "../node_modules/@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Counters.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";
import "../node_modules/@openzeppelin/contracts/utils/Strings.sol";
import '../node_modules/base64-sol/base64.sol';

contract YourCollectible is ERC721Enumerable, Ownable {

  using Strings for uint256;
  using Counters for Counters.Counter;
  Counters.Counter private _tokenIds;

  // all funds go to buidlguidl.eth
  address payable public constant recipient = payable(0xa81a6a910FeD20374361B35C451a4a44F86CeD46);
  uint256 public price = 0.001 ether;
 
 //the type of word indicates if it's a verb, adjective, noun ecc and index of the word
  struct MadLib{
    bytes1 typeOfWord;
    bool guessed; //flag to guess
  }
  //we use indexToGuess to show which word of the text is assignet to the player, other players should not see other guesses
  struct Session {
    string text;
    uint8 indexToGuess;
    uint8 nMadLibs;
    uint8 playerCounter;
    mapping(uint => MadLib) madLibs; 
    mapping(address => MadLib) players;
  }

  Session[] public sessions;

  event WordGuessed(address indexed sender, string word, uint8 index);

  

  constructor() ERC721("MadLibs onChain", "MLC") {
  }

  function mintItem(string memory _text) public returns (uint256){
    //require(msg.value >= price, "NOT ENOUGH");
    _tokenIds.increment();

    uint256 id = _tokenIds.current();
    _mint(msg.sender, id);
    Session storage session = sessions.push();
    session.text = _text;

    processText(_text, sessions[0]);

    //(bool success, ) = recipient.call{value: msg.value}("");
    //require(success, "could not send");

    return id;
  }
  function getMadLib(uint sessionIndex, uint madLibIndex) public view returns(MadLib memory) { 
    return sessions[sessionIndex].madLibs[madLibIndex]; 
  }

  //payable?
  // to each player is assigned one word
  function newPlayer(uint sessionIndex) public { 
    require (sessionIndex <= sessions.length -1);
    Session storage session = sessions[sessionIndex];
    require(session.playerCounter<session.nMadLibs, "no more space");
    //TODO require not registred yet require(session.players[msg.sender]!=null??)

    session.players[msg.sender] = session.madLibs[session.playerCounter];
    session.playerCounter++;
  }

  // find #x where x is the first letter of a type of word (a->adjective, v -> verb, n-> noun ecc) those will be the mad lips
  function processText (string memory where, Session storage session) private {
    bytes memory whatBytes = bytes ("#");
    bytes memory whereBytes = bytes (where);

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
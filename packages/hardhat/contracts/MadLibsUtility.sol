pragma solidity ^0.8.0;
//SPDX-License-Identifier: MIT
import "./strings.sol";
import './HexStrings.sol';
import 'base64-sol/base64.sol';
import "@openzeppelin/contracts/utils/Strings.sol";

library MadLibsUtility {
    using strings for *;
    using HexStrings for uint160;
    using Strings for uint256;

    function replacePlaceholders(string memory text, uint nBlanks, string[] memory replacements) public pure returns (string memory){
        strings.slice[] memory parts = new strings.slice[](nBlanks);
        strings.slice memory temptext = "".toSlice();
        strings.slice memory space = " ".toSlice();
        strings.slice memory slicetext = text.toSlice();
        for(uint i = 0; i < nBlanks; i++) {
        parts[i] = slicetext.split("#".toSlice());
        temptext = strings.concat(temptext, parts[i]).toSlice();
        temptext = strings.concat(temptext, space).toSlice();
        temptext = strings.concat(temptext, replacements[i].toSlice()).toSlice();
        temptext = strings.concat(temptext, space).toSlice();
        }
        return temptext.toString();        
    }
    function tokenURI(uint256 _id, address owner, string memory text) public pure returns (string memory) {
      string memory name = string(abi.encodePacked('MadLib #',_id.toString()));
      string memory description = string(abi.encodePacked('This is MabLibs Game onChain'));
      string memory image = Base64.encode(bytes(generateSVGofToken(text)));

      return
          string(
              abi.encodePacked(
                'data:application/json;base64,',
                Base64.encode(
                    bytes(
                          abi.encodePacked(
                              '{"name":"',
                              name,
                              '", "description":"',
                              description,
                              '", "external_url":"https://burnyboys.com/token/',
                              _id.toString(),
                              '", "owner":"',
                                (uint160(owner)).toHexString(20),
                              '", "image": "',
                              'data:image/svg+xml;base64,',
                              image,
                              '"}'
                          )
                        )
                    )
              )
          );
  }

  function generateSVGofToken(string memory text) internal pure returns (string memory) {

    string memory svg = string(abi.encodePacked(
      '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">',
        '<rect width="300" height="300" x="0" y="0" fill="#28D7B8"/>',
        '<rect width="295" height="295" x="0" y="0" fill="#B828D7"/>',
        '<rect width="290" height="290" x="0" y="0" fill="white"/>',
        renderToken(text),
      '</svg>'
    ));

    return svg;
  }

  function renderToken(string memory text) internal pure returns (string memory) {

    return string(abi.encodePacked(
      '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300">   <rect width="300" height="300" x="0" y="0" fill="#28D7B8"/><rect width="295" height="295" x="0" y="0" fill="#B828D7"/><rect width="290" height="290" x="0" y="0" fill="white"/>   <foreignObject x="0cm" y="0cm" width="290" height="300">     <p xmlns="http://www.w3.org/1999/xhtml"    style="font-size:12;">',text,'</p>   </foreignObject> </svg>'));
  }
  function strlen(string memory s) public pure returns (uint256) {
        uint256 len;
        uint256 i = 0;
        uint256 bytelength = bytes(s).length;
        for (len = 0; i < bytelength; len++) {
            bytes1 b = bytes(s)[i];
            if (b < 0x80) {
                i += 1;
            } else if (b < 0xE0) {
                i += 2;
            } else if (b < 0xF0) {
                i += 3;
            } else if (b < 0xF8) {
                i += 4;
            } else if (b < 0xFC) {
                i += 5;
            } else {
                i += 6;
            }
        }
        return len;
    }
  function checkLenArray(string[] memory array, uint limit) public pure returns (bool) {
        for (uint i = 0; i < array.length; i++) {
          if(strlen(array[i])> limit){
            return false;
          }
        }
        return true;
    }
}
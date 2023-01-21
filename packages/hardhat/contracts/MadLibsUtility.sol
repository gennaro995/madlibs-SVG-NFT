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
      '<svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">',
        renderToken(text),
      '</svg>'
    ));

    return svg;
  }

  function renderToken(string memory text) internal pure returns (string memory) {

    return string(abi.encodePacked(
      '<rect width="99%" height="99%" fill="white" />',
      //'<text x="0" y="15" fill="white">I love SVG! Targa:', targa[id] ,'</text>'
      '<text x="15" y="30" style="fill:black;"> ' ,text,' ',
        '<tspan x="15" y="85"> </tspan> ',
      '</text>'
    ));
  }
}
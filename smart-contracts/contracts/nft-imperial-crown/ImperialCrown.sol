// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ImperialCrown
 * @dev Ultra-rare Imperial Crown NFT contract for NFT Gaming Research 086
 * @notice ERC-721 implementation with royalty system and utility integration
 * 
 * NFT Type: A - Ultra-Rare Imperial Crown
 * Supply: 100 copies (1-off, ultra-rare)
 * Benefits: 30% IAP discount, +15% PvP win-rate, exclusive 3D crown skin
 * Price: €150-€200 each
 * Royalty: 5% on secondary sales
 */

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ImperialCrown is 
    ERC721, 
    ERC721Enumerable, 
    ERC721URIStorage, 
    Pausable, 
    AccessControl,
    ERC2981 
{
    using Counters for Counters.Counter;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");
    
    uint256 public constant MAX_SUPPLY = 100;
    Counters.Counter private _tokenIdCounter;
    
    string private _baseTokenURI;
    
    // Events
    event CrownMinted(address indexed to, uint256 indexed tokenId);
    event RoyaltyUpdated(address indexed receiver, uint96 fee);
    event MetadataUpdated(uint256 indexed tokenId, string newURI);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) ERC721(name, symbol) {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(MINTER_ROLE, msg.sender);
        _grantRole(PAUSER_ROLE, msg.sender);
        
        _baseTokenURI = baseTokenURI;
        
        // Set default royalty to 5%
        _setDefaultRoyalty(msg.sender, 500); // 5% = 500 basis points
    }

    function mintCrown(address to) public onlyRole(MINTER_ROLE) whenNotPaused {
        require(_tokenIdCounter.current() < MAX_SUPPLY, "Max supply reached");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId))));
        
        emit CrownMinted(to, tokenId);
    }

    function batchMintCrown(address[] calldata recipients) external onlyRole(MINTER_ROLE) whenNotPaused {
        require(_tokenIdCounter.current() + recipients.length <= MAX_SUPPLY, "Exceeds max supply");
        
        for (uint256 i = 0; i < recipients.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            _tokenIdCounter.increment();
            
            _safeMint(recipients[i], tokenId);
            _setTokenURI(tokenId, string(abi.encodePacked(_baseTokenURI, Strings.toString(tokenId))));
            
            emit CrownMinted(recipients[i], tokenId);
        }
    }

    function setBaseURI(string memory newBaseURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _baseTokenURI = newBaseURI;
    }

    function updateTokenURI(uint256 tokenId, string memory newURI) external onlyRole(DEFAULT_ADMIN_ROLE) {
        require(_exists(tokenId), "Token does not exist");
        _setTokenURI(tokenId, newURI);
        emit MetadataUpdated(tokenId, newURI);
    }

    function setRoyaltyInfo(address receiver, uint96 feeNumerator) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _setDefaultRoyalty(receiver, feeNumerator);
        emit RoyaltyUpdated(receiver, feeNumerator);
    }

    function pause() public onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() public onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function getUtilityBenefits(uint256 tokenId) external view returns (
        uint256 iapDiscount,      // 30% discount (3000 basis points)
        uint256 pvpWinRateBonus,  // +15% win rate (1500 basis points)
        bool hasCrownSkin         // Exclusive 3D crown skin access
    ) {
        require(_exists(tokenId), "Token does not exist");
        
        return (
            3000,  // 30% IAP discount
            1500,  // +15% PvP win rate bonus
            true   // Has crown skin access
        );
    }

    function getTotalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    function getRemainingSupply() external view returns (uint256) {
        return MAX_SUPPLY - _tokenIdCounter.current();
    }

    function isHolder(address account) external view returns (bool) {
        return balanceOf(account) > 0;
    }

    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721Enumerable, ERC721URIStorage, ERC2981, AccessControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
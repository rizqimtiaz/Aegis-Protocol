// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract AegisRegistry {
    struct AnalysisRecord {
        bytes32 imageHash;
        uint8 trustScore;
        address analyst;
        uint256 timestamp;
        string metadataURI;
    }

    mapping(bytes32 => AnalysisRecord) public records;

    event RecordAdded(
        bytes32 indexed imageHash, 
        uint8 trustScore, 
        address indexed analyst, 
        uint256 timestamp
    );

    function addRecord(bytes32 _imageHash, uint8 _trustScore, string calldata _metadataURI) external {
        require(records[_imageHash].timestamp == 0, "Aegis: Record already exists for this image hash");
        require(_trustScore <= 100, "Aegis: Trust score out of bounds");

        records[_imageHash] = AnalysisRecord({
            imageHash: _imageHash,
            trustScore: _trustScore,
            analyst: msg.sender,
            timestamp: block.timestamp,
            metadataURI: _metadataURI
        });

        emit RecordAdded(_imageHash, _trustScore, msg.sender, block.timestamp);
    }
}

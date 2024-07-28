// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CheckpointOasis {
    // Mapping to keep track of the owners and obstacles for each chain
    mapping(address => bool) public owners;
    mapping(uint256 => uint256[]) private chainObstacles; // Make obstacles private
    uint256 constant COLUMNS = 5;

    // Mapping for checkpoint ownership
    mapping(uint256 => address) public checkpointNumberOwner;
    mapping(address => uint256[]) public senderCheckpointNumbers;

    uint256 public checkpointCounter;

    // Modifier to restrict certain functions to only the owner of the contract
    modifier onlyOwner() {
        require(owners[msg.sender], "Caller is not an owner");
        _;
    }

    // Modifier to restrict certain functions to checkpoint owners
    modifier onlyCheckpointOwner() {
        require(senderCheckpointNumbers[msg.sender].length > 0, "Caller is not a checkpoint owner");
        _;
    }

    // Modifier to prevent successive checkpoint creation by the same address
    modifier noSuccessiveCheckpoints() {
        require(
            senderCheckpointNumbers[msg.sender].length == 0 ||
            senderCheckpointNumbers[msg.sender][senderCheckpointNumbers[msg.sender].length - 1] != checkpointCounter - 1,
            "Cannot create two successive checkpoints"
        );
        _;
    }

    // Constructor sets the initial owner to the creator of the contract
    constructor() {
        owners[msg.sender] = true;
        checkpointCounter = 0; // Start checkpoint counter from 0
    }

    // Event to log checkpoint creation
    event CheckpointCreated(address indexed creator, uint256 checkpointNumber);

    // Function to add a new segment of obstacles to the chain with checkpoint ownership
    function addSegment(uint256 chainId, uint256[] memory obstacleIds) public noSuccessiveCheckpoints {
        require(obstacleIds.length == 50, "Incorrect number of obstacle IDs provided."); // Ensure there are exactly 50 obstacles (10 rows * 5 columns)

        for (uint256 i = 0; i < obstacleIds.length; i += 5) {
            uint256[] memory row = new uint256[](5);
            for (uint256 j = 0; j < 5; j++) {
                row[j] = obstacleIds[i + j];
            }
            addRow(chainId, row);
        }

        // Assign checkpoint ownership
        checkpointNumberOwner[checkpointCounter] = msg.sender;
        senderCheckpointNumbers[msg.sender].push(checkpointCounter);

        emit CheckpointCreated(msg.sender, checkpointCounter);

        checkpointCounter++;
    }

    // Helper function to add a row of obstacles to the chain's obstacle list
    function addRow(uint256 chainId, uint256[] memory obstacleIds) public {
        for (uint i = 0; i < obstacleIds.length; i++) {
            addObstacle(chainId, obstacleIds[i]);
        }
    }

    // Function to add a single obstacle to the list for a chain
    function addObstacle(uint256 chainId, uint256 obstacleId) public {
        chainObstacles[chainId].push(obstacleId);
    }

    // Function to add a new owner to the contract
    function addOwner(address newOwner) public onlyCheckpointOwner {
        owners[newOwner] = true;
    }

    // Function to get the number of rows of obstacles stored for a chain
    function getRowCount(uint256 chainId) public view returns (uint256) {
        uint256 length = chainObstacles[chainId].length;
        return (length + COLUMNS - 1) / COLUMNS; // Rounds up to account for partial rows
    }

    // Function to remove an owner from the contract (cannot remove oneself)
    function removeOwner(address ownerToRemove) public onlyCheckpointOwner {
        require(msg.sender != ownerToRemove, "Cannot remove self as owner");
        owners[ownerToRemove] = false;
    }

    // Function to retrieve obstacles in a specific row for a chain
    function getObstaclesInRow(uint256 chainId, uint256 rowIndex) public view onlyOwner returns (uint256[] memory) {
        require(rowIndex < getRowCount(chainId), "Row index out of bounds");
        uint256[] memory obstaclesInRow = new uint256[](COLUMNS);
        for(uint i = 0; i < COLUMNS; i++) {
            obstaclesInRow[i] = chainObstacles[chainId][rowIndex * COLUMNS + i];
        }
        return obstaclesInRow;
    }

    
}

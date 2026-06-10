// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title WavePortal
/// @notice Visitors connect a wallet and send a "wave" with a message,
///         stored on-chain. A classic first Ethereum project covering the
///         full lifecycle: wallet -> signature -> transaction -> contract
///         storage -> event -> frontend rendering.
contract WavePortal {
    struct Wave {
        address waver;
        string message;
        uint256 timestamp;
    }

    event NewWave(address indexed from, uint256 timestamp, string message);

    error CooldownActive(uint256 secondsLeft);
    error EmptyMessage();

    uint256 public constant COOLDOWN = 30 seconds;

    Wave[] private waves;
    mapping(address => uint256) public lastWavedAt;

    /// @notice Send a wave with a message. One wave per address per cooldown
    ///         window, to keep spam out of the demo.
    function wave(string calldata message) external {
        if (bytes(message).length == 0) revert EmptyMessage();

        uint256 last = lastWavedAt[msg.sender];
        if (last != 0 && block.timestamp < last + COOLDOWN) {
            revert CooldownActive(last + COOLDOWN - block.timestamp);
        }
        lastWavedAt[msg.sender] = block.timestamp;

        waves.push(Wave(msg.sender, message, block.timestamp));
        emit NewWave(msg.sender, block.timestamp, message);
    }

    function getAllWaves() external view returns (Wave[] memory) {
        return waves;
    }

    function totalWaves() external view returns (uint256) {
        return waves.length;
    }
}

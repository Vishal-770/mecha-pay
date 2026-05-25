// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IERC1271 {
    function isValidSignature(bytes32 hash, bytes calldata signature) external view returns (bytes4);
}

contract MockSmartAccount is IERC1271 {
    address public owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function isValidSignature(bytes32 hash, bytes calldata signature) external view override returns (bytes4) {
        // Recover signer from signature and check if it's the owner
        bytes32 ethHash = keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
        address signer = recoverSigner(ethHash, signature);
        if (signer == owner) {
            return 0x1626ba7e; // Magic value
        }
        // Also try without ethereum prefix
        signer = recoverSigner(hash, signature);
        if (signer == owner) {
            return 0x1626ba7e; // Magic value
        }
        return 0xffffffff;
    }

    function recoverSigner(bytes32 _messageHash, bytes memory _signature) internal pure returns (address) {
        if (_signature.length != 65) {
            return address(0);
        }
        (bytes32 r, bytes32 s, uint8 v) = splitSignature(_signature);
        return ecrecover(_messageHash, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
    }
}

contract MockSmartAccountHelper is MockSmartAccount {
    constructor(address _owner) MockSmartAccount(_owner) {}

    function executeApprove(address token, address spender, uint256 amount) external {
        IERC20(token).approve(spender, amount);
    }
}

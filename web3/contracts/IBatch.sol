// SPDX-License-Identifier: MIT 
pragma solidity ^0.8.16;
interface IBatch {
    enum BatchOpType {Transfer, Approve, SetApprovalForAll, Mint, Burn}

    struct BatchOp {
        BatchOpType op;
        address sender;
        address to;
        uint256 tokenId;
        uint256 amount;
    }
    function batch(BatchOp[] calldata ops) external;
}
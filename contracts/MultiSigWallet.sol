// SPDX-License-Identifier: MIT
import "hardhat/console.sol";

pragma solidity ^0.8.0;

contract MultiSigWallet {
    // Events
    event OwnerAdded(address indexed owner);
    event OwnerDeleted(address indexed owner);
    event Deposit(address indexed sender, uint amount);
    event ConfirmTransaction(address indexed owner, uint indexed txIndex);
    event RevokeConfirmation(address indexed owner, uint indexed txIndex);
    event ExecuteTransaction(address indexed owner, uint indexed txIndex);
    event CreateTransaction(
        address indexed owner,
        uint indexed index,
        address indexed to,
        uint value
    );

    // Modifiers
    modifier onlyOwner() {
        require(isOwner[msg.sender], "not an owner");
        _;
    }

    modifier exist(uint _index) {
        require(transactions[_index].to != address(0), "does not exist");
        _;
    }

    modifier notExecuted(uint _index) {
        require(!transactions[_index].executed, "already executed");
        _;
    }

    modifier notConfirmed(uint _index) {
        require(!isConfirmed[_index][msg.sender], "already confirmed");
        _;
    }

    address[] public owners;
    mapping(address => bool) public isOwner;
    uint public numConfirmsRequired;
    uint maxOwnerCount = 100;

    struct Transaction {
        address to;
        uint value;
        bool executed;
        uint numConfirms;
    }

    // mapping from tx index => owner => bool
    mapping(uint => mapping(address => bool)) public isConfirmed;

    // index => transaction index = count
    uint index = 0;
    mapping(uint => Transaction) public transactions;

    constructor(address[] memory _owners, uint _numConfirmsRequired) {
        require(_owners.length > 0, "owners required");
        require(_owners.length < 100, "too many owners");
        require(
            _numConfirmsRequired > 0 &&
                _numConfirmsRequired <= _owners.length,
            "invalid number of required confirmations"
        );

        for (uint i = 0; i < _owners.length; i++) {
            address owner = _owners[i];

            require(owner != address(0), "invalid owner");
            require(!isOwner[owner], "owner already exist");

            isOwner[owner] = true;
            owners.push(owner);
        }

        numConfirmsRequired = _numConfirmsRequired;
    }

    receive() external payable {
        emit Deposit(msg.sender, msg.value);
    }

    function createTransaction(address _to, uint _value) public onlyOwner {
        index++;
        transactions[index] = Transaction({
                to: _to,
                value: _value,
                executed: false,
                numConfirms: 0
            });
            
        emit CreateTransaction(msg.sender, index, _to, _value);
    }

    function confirmTransaction(uint _index) public onlyOwner exist(_index) notExecuted(_index) notConfirmed(_index) {
        Transaction storage transaction = transactions[_index];
        transaction.numConfirms += 1;
        isConfirmed[_index][msg.sender] = true;

        emit ConfirmTransaction(msg.sender, _index);
    }

    function executeTransaction(uint _index) public onlyOwner exist(_index) notExecuted(_index) {
        Transaction storage transaction = transactions[_index];

        require(transaction.numConfirms >= numConfirmsRequired,"cannot execute tx");

        transaction.executed = true;

        (bool sent,) = transaction.to.call{value: transaction.value}("");
        require(sent, "tx failed");

        emit ExecuteTransaction(msg.sender, _index);
    }

    function revokeConfirmation(uint _index) public onlyOwner exist(_index) notExecuted(_index) {
        Transaction storage transaction = transactions[_index];

        require(isConfirmed[_index][msg.sender], "tx not confirmed");

        transaction.numConfirms -= 1;
        isConfirmed[_index][msg.sender] = false;

        emit RevokeConfirmation(msg.sender, _index);
    }

    function addOwner(address _owner) external onlyOwner {
        require(owners.length < 100, "reached max count");
        require(isOwner[_owner] == false, "owner already exist");
        owners.push(_owner);
        isOwner[_owner] = true;

        emit OwnerAdded(_owner);
    }

    function deleteOwner(address _owner) external onlyOwner {
        require(isOwner[_owner] == true, "owner not found");
        for(uint i=0; i<owners.length-1; i++) {
            if(isOwner[owners[i]]== true) {
                owners[i] = owners[owners.length-1];
                owners.pop();
                break;
            }
        }
        isOwner[_owner] = false;

        emit OwnerDeleted(_owner);
    }

    function getOwners() public view returns (address[] memory) {
        return owners;
    }

    function getTransactionCount() public view returns (uint) {
        return index;
    }

    function getTransaction(uint _index) public view 
    returns (
            address to,
            uint value,
            bool executed,
            uint numConfirms
        )
    {
        Transaction storage transaction = transactions[_index];

        return (
            transaction.to,
            transaction.value,
            transaction.executed,
            transaction.numConfirms
        );
    }
}
// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.18;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {LinkTokenInterface} from "@chainlink/contracts/src/v0.8/shared/interfaces/LinkTokenInterface.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

contract GasTransfer  is OwnerIsCreator, CCIPReceiver {
    // Custom errors to provide more descriptive revert messages.
    error NotEnoughBalance(uint256 currentBalance, uint256 calculatedFees); // Used to make sure contract has enough balance.

    // Event emitted when a message is sent to another chain.
    event MessageSent(
        bytes32 indexed messageId, // The unique ID of the CCIP message.
        uint64 indexed destinationChainSelector, // The chain selector of the destination chain.
        address receiver, // The address of the receiver on the destination chain.
        address feeToken, // the token address used to pay CCIP fees.
        uint256 fees // The fees paid for sending the CCIP message.
    );

    event MessageReceived(
        bytes32 indexed messageId, // The unique ID of the message.
        uint64 indexed sourceChainSelector, // The chain selector of the source chain.
        address sender, // The address of the sender from the source chain.
        string text // The text that was received.
    );

    bytes32 private lastReceivedMessageId; // Store the last received messageId.

    IRouterClient router;

    LinkTokenInterface linkToken;

    AggregatorV3Interface internal dataFeed;

    mapping(address => uint) private stakes;
    mapping(address => uint) private stakesForReward;
    uint public totalStaked;
    uint public totalRewards;

    constructor(address _dataFeed, address _router, address _link) CCIPReceiver(_router) {
        dataFeed = AggregatorV3Interface(
            _dataFeed
        );
        router = IRouterClient(_router);
        linkToken = LinkTokenInterface(_link);
    }

    error InsufficientFunds();
    error InvalidArguments();

    function getLatestData() public view returns (uint) {
        (
            /* uint80 roundID */,
            int answer,
            /*uint startedAt*/,
            /*uint timeStamp*/,
            /*uint80 answeredInRound*/
        ) = dataFeed.latestRoundData();
        return uint(answer);
    }

    function getTotalRewards(address user) public view returns(uint) {
        uint myStakes = stakesForReward[user];
        if(myStakes == 0 || (myStakes > totalStaked)) {
            return 0;
        }

        uint rewards = (myStakes * totalRewards) / totalStaked;
        return rewards;
    }

    function claimRewards() external {
        uint rewards = getTotalRewards(msg.sender);

        if(rewards > 0) {
            totalRewards = totalRewards - rewards;
            totalStaked = totalStaked - stakesForReward[msg.sender];
            stakesForReward[msg.sender] = 0;

            payable(msg.sender).transfer(rewards);
        }
    }

    function getFee(uint amount) external pure returns(uint, uint) {
        if(amount == 0) {
            revert InvalidArguments();
        } 

        uint nativeTokenAmount = (amount * 95) / 100;
        uint fees = amount - nativeTokenAmount;
        return (nativeTokenAmount, fees);
    }

    function getDeposits(address user) external view returns(uint) {
        return stakes[user];
    }

    function Deposit() external payable {
        if(msg.value == 0) {
            revert InvalidArguments();
        } 

        stakes[msg.sender] = stakes[msg.sender] + msg.value;  
        stakesForReward[msg.sender] = stakesForReward[msg.sender] + msg.value;
        totalStaked = totalStaked + msg.value;      
    }

    function Withdraw(uint withdrawAmount) external {
        if(stakes[msg.sender] < withdrawAmount) {
            revert InvalidArguments();
        }

        if(address(this).balance < withdrawAmount) {
            revert InsufficientFunds();
        }

        stakes[msg.sender] = stakes[msg.sender] - withdrawAmount;

        payable(msg.sender).transfer(withdrawAmount);
    }

    function bridgeGas(uint64 destinationChainSelector, address receiver) external payable {
        // if(msg.value == 0 || msg.value <= gasFee) {
        //     revert InvalidArguments();
        // }

        if(destinationChainSelector == 0 || address(0) == receiver) {
            revert InvalidArguments();
        }

        uint bridgeAmount = msg.value;

        uint nativeTokenAmount = (bridgeAmount * 95) / 100;
        totalRewards = totalRewards + (bridgeAmount - nativeTokenAmount);

        uint nativeTokenUsdAmount = (nativeTokenAmount * getLatestData()) / 10e8;
        bytes memory message = abi.encode(nativeTokenUsdAmount, receiver);
        _sendMessage(destinationChainSelector, receiver, message);
    }

    /// handle a received message
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {

        uint nativeTokenAmount;
        uint nativeTokenUsdAmount;
        address msgSender;

        lastReceivedMessageId = any2EvmMessage.messageId; // fetch the messageId
        (nativeTokenUsdAmount, msgSender) = abi.decode(any2EvmMessage.data,(uint, address));
        nativeTokenAmount = (nativeTokenUsdAmount / getLatestData()) * 10e8;
        _unlockToken(nativeTokenAmount, payable(msgSender));

        emit MessageReceived(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector, // fetch the source chain identifier (aka selector)
            abi.decode(any2EvmMessage.sender, (address)), // abi-decoding of the sender address,
            abi.decode(any2EvmMessage.data, (string))
        );
    }

    // To send message to multichain contract
    function _sendMessage(
        uint64 destinationChainSelector, 
        address receiver,
        bytes memory _message
    ) private {

        // Create an EVM2AnyMessage struct in memory with necessary information for sending a cross-chain message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(receiver), // ABI-encoded receiver address
            data: _message, // ABI-encoded string
            tokenAmounts: new Client.EVMTokenAmount[](0), // Empty array indicating no tokens are being sent
            extraArgs: Client._argsToBytes(
                // Additional arguments, setting gas limit and non-strict sequencing mode
                Client.EVMExtraArgsV1({gasLimit: 200_000, strict: false})
            ),
            // Set the feeToken  address, indicating LINK will be used for fees
            feeToken: address(linkToken)
        });

        // Get the fee required to send the message
        uint256 fees = router.getFee(destinationChainSelector, evm2AnyMessage);

        if (fees > linkToken.balanceOf(address(this)))
            revert NotEnoughBalance(linkToken.balanceOf(address(this)), fees);

        // approve the Router to transfer LINK tokens on contract's behalf. It will spend the fees in LINK
        linkToken.approve(address(router), fees);

        // Send the message through the router and store the returned message ID
        bytes32 messageId = router.ccipSend(destinationChainSelector, evm2AnyMessage);

        emit MessageSent(
            messageId,
            destinationChainSelector,
            receiver,
            address(linkToken),
            fees
        );
    }

    function _unlockToken(uint nativeTokenAmount, address payable msgSender) private {
        if(address(this).balance < nativeTokenAmount) revert InsufficientFunds();
        msgSender.transfer(nativeTokenAmount);
    }

}
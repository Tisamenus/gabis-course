pragma solidity >=0.8.0;

//                                          &&C&H&OO&motherfucker
//                                        HOO
//                                       &C
//     me, hopefully                    &  _____ ___________  ___________
//     \ O /                           II__|[] | |   I I   |  |   I I   |
//      | |                           |        |_|_  I I  _|__|_  I I  _|
//      / \                          < OO----OOO   OO---OO      OO---OO
//************************************************************************************

// this feature is still not integrated
import {ERC20Permit} from "@openzeppelin/contracts/drafts/ERC20Permit.sol";
//
import {SafeMath} from "@openzeppelin/contracts/utils/math/SafeMath.sol";
// TH because it is supreme since i dont have to initialize objects
import {
    TransferHelper
} from "@Uniswap/uniswap-lib/contracts/libraries/TransferHelper.sol";

interface IHomeOmniBridge {
    function relayTokens(
        IERC677 token,
        address _receiver,
        uint256 _value
    ) external;
}

contract MainStation {
    using SafeMath for uint256;

    /**
    Index address(this) is reserved for amount of passengers
    It is only necessary to remember how much each address deposits.
    Thus, CarriageChain
    */

    // VARIABLES
    mapping(uint256 => address) private Cargo;
    mapping(uint256 => mapping(address => uint256)) private CarriageChain;
    uint256 private NextRentableCarriage;
    address private constant MEDIATOR_ADDR;
    IHomeOmniBridge private constant OMNI_BRIDGE;

    constructor(uint256 _westernBankTreasury, address _MEDIATOR) {
        MEDIATOR_ADDR = _MEDIATOR;
        OMNI_BRIDGE = IHomeOmniBridge(_MEDIATOR);
    }
    /**
     */

    function fetchCoalPrice() private returns (uint256);

    /**
    We have to approve token transfers to the mediator;
     */
    function approveMediator(address _tokenAddress, uint256 exact) private {
        TransferHelper.safeApprove(_tokenAddress, MEDIATOR_ADDR, exact);
    }

    function CHOOCHOO(address _tokenAddress, uint256 _rentableCarriage)
        private
    {}

    function loadGoodsIntoCarriage(
        uint256 _amountIn,
        uint256 _carriageIndex,
        address _tokenAddress
    ) external {
        require(
            Cargo[_carriageIndex] == _tokenAddress,
            "This Carriage doesn't take that token"
        );
        TransferHelper.safeTransferFrom(
            _tokenAddress,
            msg.sender,
            address(this),
            _amountIn
        );
        CarriageChain[_carriageIndex][msg.sender].add(_amountIn);
    }

    function rentCarriage(uint256 minPassengers, uint256 _amountIn, address _tokenAddress)
        external
        returns (uint256 _carriageIndex)
    {
        TransferHelper.safeTransferFrom(
            _tokenAddress,
            msg.sender,
            address(this),
            _amountIn
        );
        Cargo[NextRentableCarriage] = _tokenAddress;
        _carriageIndex = NextRentableCarriage;
        NextRentableCarriage++;
        CarriageChain[NextRentableCarriage][msg.sender].add(_amountIn);
        CarriageChain[NextRentable][address(this)].add(minPassengers);
        return _carriageIndex;
    }

    function payTicket() external payable {
        if (msg.value < fetchCoalPrice()) {}
    }
}

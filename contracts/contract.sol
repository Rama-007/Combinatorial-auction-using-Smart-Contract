pragma solidity ^0.4.15;
pragma experimental ABIEncoderV2;

library SafeMath {
  function mul(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a * b;
    assert(a == 0 || c / a == b);
    return c;
  }
 
  function div(uint256 a, uint256 b) internal constant returns (uint256) {
    // assert(b > 0); // Solidity automatically throws when dividing by 0
    uint256 c = a / b;
    // assert(a == b * c + a % b); // There is no case in which this doesn't hold
    return c;
  }
 
  function sub(uint256 a, uint256 b) internal constant returns (uint256) {
    assert(b <= a);
    return a - b;
  }
 
  function add(uint256 a, uint256 b) internal constant returns (uint256) {
    uint256 c = a + b;
    assert(c >= a);
    return c;
  }
}

contract Auction{
    //static
    address auctioneer;
    uint public startBlock;
    uint public endBlock;
    uint256 public q;//large prime
    uint256 public M;// Number of items
    
    //state
    bool public cancelled;
    int128 notary_size;
    int128 bidder_size;
    int128 notary_no;
    uint256 rew=1;
    
    struct Bidder{
        address notary;
        uint256 no_items;
        bool is_valid;
    }
    
    mapping (address => Bidder) bidder;
    mapping (int128 => address) bidder_map;
    struct Notaries{
        address bidder;
        bool assigned;
        uint256[][] input_items;
        uint256[2] input_value;
        bool is_valid;
        uint256 interaction;
    }
   
    
    mapping (address => Notaries) notaries;
    mapping (int128 => address) notary_map;
    int128[] winner;
    uint256[] payments;
    
    constructor(uint _q, uint256 _M, uint _no_of_Blocks)
    {
        startBlock=block.number;
        endBlock=startBlock+_no_of_Blocks;
        // if (_startBlock >= _endBlock) throw;
        // if (_startBlock < block.number) throw;
        auctioneer=msg.sender;
        q=_q;
        M=_M;
        // startBlock=_startBlock;
        // endBlock=_endBlock;
        notary_size=0;
        bidder_size=0;
        notary_no=0;
    }
    function notaryRegister() public{
        assert(!notaries[msg.sender].is_valid && !bidder[msg.sender].is_valid && auctioneer!=msg.sender);
        assert(now<endtime);
        // if(notaries[msg.sender].is_valid || bidder[msg.sender].is_valid || auctioneer==msg.sender) throw;
        notaries[msg.sender].is_valid=true;
        notary_map[notary_size]=msg.sender;
        notary_size=notary_size+1;
    }
    function randomgenerator() private returns(uint128)
    {
        // bytes32 rand=oraclize_query("WolframAlpha", "random number between 0 and 100");
        // emit oracle(rand);
        return uint128(int128(keccak256(block.timestamp, block.difficulty))%notary_size)%uint128(notary_size);
    }
}

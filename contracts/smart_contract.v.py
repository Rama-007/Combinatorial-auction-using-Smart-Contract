
Registration: event({_from:address, size: int128})
printf: event({var: uint256})
Assignment: event({_from:address, _to:address})


auctioneer: public(address)
starttime: public(timestamp)
endtime: public(timestamp)
q: public(uint256)
M: public(uint256)

cancelled: public(bool)
notary_size: public(int128)
bidder_size: int128
notary_no: int128
winner_flag: public(bool)
winner_count: int128

reward: wei_value

bidder: public({
	notary: address,
	no_items: uint256,
	value: uint256(wei),
	is_valid: bool,
	}[address])

bidder_map: address[int128]

notaries: public({
	bidder: address,
	assigned: bool,
	input_items: uint256[15][2],
	input_value: uint256[2],
	is_valid: bool,
	interaction: uint256
	}[address])
notary_map: address[int128]

winner: public(int128[15])

payments: public(uint256[15])




@public
def __init__(_q: uint256, _M: uint256, _biddingTime: timedelta):
	assert _M > 0
	assert _q>1
	
	for i in range(1000):
		if(i>convert(_q/2,'int128')):
			break
		if(i==0 or i==1):
			continue
		if(convert(_q,'int128')%i==0):
			assert(1<0)

	self.starttime=block.timestamp
	self.endtime=self.starttime+_biddingTime
	self.q=_q
	self.M=_M
	self.auctioneer=msg.sender

	self.notary_size=0
	self.bidder_size=0
	self.notary_no=0
	self.winner_flag=False
	self.cancelled=False
	self.reward=2

@public
def notaryRegister():
	assert (not self.notaries[msg.sender].is_valid and not self.cancelled) and (not self.bidder[msg.sender].is_valid and not self.auctioneer==msg.sender)
	assert block.timestamp<self.endtime
	self.notaries[msg.sender].is_valid=True
	self.notary_map[self.notary_size]=msg.sender
	self.notary_size=self.notary_size+1
	log.Registration(msg.sender,self.notary_size)




# @private
# def randomgenerator() -> uint256:
# 	currentHash: bytes32  = block.blockhash(block.number - 1)
# 	randomNumber: uint256  = (uint256(currentHash) * uint256(msg.sender)) % self.notary_size
#     return randomNumber


@private
def sqrt(x: uint256) -> uint256:
        if (x == 0):
        	return 0
        elif (x <= 3):
        	return 1
        z: uint256 = (x + 1) / 2
        y: uint256 = x
        for i in range(0,100):
        	if(z<y):
        		break
        	y = z
        	z = (x / z + z) / 2
        return y

@public
@payable
def bidderRegister(items: uint256[15][2], _input: uint256[2], num_items: uint256):
	assert block.timestamp<self.endtime
	assert (not self.notaries[msg.sender].is_valid and not self.cancelled) and (not self.bidder[msg.sender].is_valid and not self.auctioneer==msg.sender)
	assert self.notary_no<self.notary_size
	# log.printf(len(items))
	assert num_items<=self.M and num_items>0
	self.bidder_map[self.bidder_size]=msg.sender
	self.bidder_size+=1

	self.notaries[self.notary_map[self.notary_no]].assigned=True
	self.notaries[self.notary_map[self.notary_no]].bidder=msg.sender
	self.bidder[msg.sender].notary=self.notary_map[self.notary_no]

	self.bidder[msg.sender].is_valid=True
	self.notary_no+=1
	self.bidder[msg.sender].no_items=num_items
	self.bidder[msg.sender].value=msg.value
	self.notaries[self.bidder[msg.sender].notary].input_items=items
	self.notaries[self.bidder[msg.sender].notary].input_value=_input

	val: uint256 =((_input[1]+_input[0])%self.q)*(self.sqrt(num_items)+1)

	assert msg.value > as_wei_value(val,'wei')

	log.Assignment(msg.sender,self.bidder[msg.sender].notary)


@private
def comparator(a: uint256[2], b: uint256[2]) -> uint256:
	val1: int128 = convert(a[0],'int128')-convert(b[0],'int128')
	val2: int128 = convert(a[1],'int128')-convert(b[1],'int128')

	Q: int128 = convert(self.q,'int128')

	if val1<0 and val2<0 :
		assert((-1*(val1+val2))>(-1*val1))
	if(val1>0 and val2>0):
		assert((val1+val2)>(val1))
	if(val1+val2==0):
		return 2
	if((val1+val2+Q)%Q<(Q/2)):
		return 1
	return 0

@private
def sort():
	k: int128
	l: int128
	temp: address
	for i in range(0,15):
		if(i>=self.notary_no):
			break
		k=i
		for j in range(l,l+99):
			if(j>=self.notary_no):
				break
			if (self.comparator(self.notaries[self.notary_map[j]].input_value,self.notaries[self.notary_map[k]].input_value)==1):
				self.notaries[self.notary_map[j]].interaction+=1
				self.notaries[self.notary_map[k]].interaction+=1
				k=j
		temp=self.notary_map[i]
		self.notary_map[i]=self.notary_map[k]
		self.notary_map[k]=temp

	# i: int128 =left
	# j: int128 =right
	# k: address
	# # k: int128 =i
	# # l: int128 =j
	# pivot: address =self.notary_map[left + (right - left)/2]
	# for f in range(0,150):
	# 	if(i>j):
	# 		break
	# 	for ff in range(0,150):
	# 		if(i>right or (self.comparator(self.notaries[self.notary_map[i]].input_value,self.notaries[pivot].input_value)!=1 and self.notaries[pivot].assigned!=False)):
	# 			break
	# 		self.notaries[self.notary_map[i]].interaction+=1
	# 		self.notaries[pivot].interaction+=1
	# 		i+=1

	# 	for ff in range(0,150):
	# 		if(j<0 or (self.comparator(self.notaries[self.notary_map[j]].input_value,self.notaries[pivot].input_value)!=0 and self.notaries[pivot].assigned!=False)):
	# 			break
	# 		self.notaries[self.notary_map[j]].interaction+=1
	# 		self.notaries[pivot].interaction+=1
	# 		j-=1
	# 	if(i<=j):
	# 		k=self.notary_map[i]
	# 		self.notary_map[i]=self.notary_map[j]
	# 		self.notary_map[j]=k

	# if(left<j):
	# 	self.sort(left,j)
	# if(i<right):
	# 	self.sort(i,right)


@private
def intersection(items: uint256[15][2], upcoming: uint256[15][2], l1: int128, l2: int128) -> bool:
	
	for i in range(15):
		if(i>=l1):
			break
		for j in range(15):
			if(j>=l2):
				break
			if(self.comparator([upcoming[i][0],upcoming[i][1]],[items[j][0],items[j][1]])==2):
				return True
		return False


@private
def get_payment():
	flag: bool
	payment_count: int128=0
	for k in range(15):
		if(k>=self.winner_count):
			break
		l: int128 =self.winner[k]
		flag=False
		ans: uint256 =0
		for j in range(15):
			if(j>=self.notary_no):
				break
			for i in range(15):
				if(i>=j):
					break
				if(i==l):
					continue
				l1: int128 = convert(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items,'int128')
				l2: int128 = convert(self.bidder[self.notaries[self.notary_map[i]].bidder].no_items,'int128')
				if(self.intersection(self.notaries[self.notary_map[j]].input_items,self.notaries[self.notary_map[i]].input_items,l1,l2)):
					self.notaries[self.notary_map[j]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[i]].bidder].no_items)
					self.notaries[self.notary_map[i]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[i]].bidder].no_items)
					flag=True
					break
			if(flag==False):
				l1: int128 = convert(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items,'int128')
				l2: int128 = convert(self.bidder[self.notaries[self.notary_map[l]].bidder].no_items,'int128')
				if(self.intersection(self.notaries[self.notary_map[j]].input_items,self.notaries[self.notary_map[l]].input_items,l1,l2)):
					self.notaries[self.notary_map[j]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[l]].bidder].no_items)
					self.notaries[self.notary_map[l]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[l]].bidder].no_items)
					ans=(self.notaries[self.notary_map[j]].input_value[0]+self.notaries[self.notary_map[j]].input_value[1])%self.q
					ans=ans*self.sqrt(self.bidder[self.notaries[self.notary_map[l]].bidder].no_items)
					break

		self.payments[payment_count]=ans
		payment_count+=1


@private
def cancel():
	assert(msg.sender==self.auctioneer and (block.timestamp>self.endtime and not self.winner_flag))
	for i in range(15):
		if(i>=self.notary_no):
			break
		l: address =self.notaries[self.notary_map[i]].bidder
		send(l,self.bidder[self.notaries[self.notary_map[i]].bidder].value)
	self.cancelled=True

@public 
def find_winner():
	assert((msg.sender==self.auctioneer and not self.cancelled) and (block.timestamp>self.endtime and not self.winner_flag))
	self.sort()
	self.winner[0]=0
	self.winner_count=1
	flag: bool
	for j in range(15):
		flag=False
		if(j>=self.notary_no):
			break
		for k in range(15):
			if(k>=self.winner_count):
				break
			l1: int128 = convert(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items,'int128')
			l2: int128 = convert(self.bidder[self.notaries[self.notary_map[k]].bidder].no_items,'int128')
			if(self.intersection(self.notaries[self.notary_map[j]].input_items,self.notaries[self.notary_map[k]].input_items,l1,l2)):
				self.notaries[self.notary_map[j]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[k]].bidder].no_items)
				self.notaries[self.notary_map[k]].interaction+=(self.bidder[self.notaries[self.notary_map[j]].bidder].no_items*self.bidder[self.notaries[self.notary_map[k]].bidder].no_items)
				flag=True
				break
		if(flag==True):
			continue
		self.winner[self.winner_count]=j
		self.winner_count+=1
	self.winner_flag=True
	self.get_payment()

	for i in range(15):
		if(i>=self.winner_count):
			break
		l: int128= self.winner[i]
		self.bidder[self.notaries[self.notary_map[l]].bidder].value-=as_wei_value(self.payments[i],'wei')
		
	for i in range(15):
		if(i>=self.notary_no):
			break
		l: address =self.notaries[self.notary_map[i]].bidder
		send(l,self.bidder[self.notaries[self.notary_map[i]].bidder].value)

	for i in range(15):
		if(i>=self.notary_no):
			break
		l: address =self.notary_map[i]
		send(l,self.reward*self.notaries[self.notary_map[i]].interaction)

const coinToFlip = artifacts.require("CoinToFlip");

contract("CoinToFlip", () => {
    // Test 1: If not deployer, executing kill function is strictly prohibited.
    it("self-destruct only executable by the deployer", async() => {
        // given
        let instance = await coinToFlip.deployed();
        let accounts = await web3.eth.getAccounts();
        let NOT_DEPLOYER = accounts[9];
        let err;

        // when
        try {
            await instance.kill({
                from: NOT_DEPLOYER
            });
        } catch (e) {
            err = e;
        }

        // then
        assert.isOk(err instanceof Error, "Test Failed! Anyone can kill the contract!");
    }),

    // Test 2: if sending 5 ETH to contract, the balance of contract should be 5 ETH.
    it("should have 5 ether", async() => {
        // given
        let instance = await coinToFlip.deployed();
        let accounts = await web3.eth.getAccounts();
        let NOT_DEPLOYER = accounts[9];

        // when
        let tx = await instance.sendTransaction({
            from: NOT_DEPLOYER,
            value: web3.utils.toWei("5", "ether")
        });

        console.log(tx);

        // then
        let bal = await web3.eth.getBalance(instance.address);
        console.log(bal);

        assert.equal(web3.utils.fromWei(bal, "ether").toString(), "5", "Test Failed! House does not have 5 ETH!");
    })

    // Test 3: If betting 5.1 ETH, the balance of contract should be 5.1 ETH.
    it("should have 5.1 ether after betting 0.1 ether", async() => {
        // given
        let instance = await coinToFlip.deployed();
        let accounts = await web3.eth.getAccounts();

        const val = 0.1;
        const mask = 1; // Tails 0000 0001
        
        // when
        await instance.placeBet(mask, {
            from: accounts[3],
            value: web3.utils.toWei(val.toString(), "ether")
        })

        // then
        let bal = await web3.eth.getBalance(instance.address);

        assert.equal(await web3.utils.fromWei(bal, "ether").toString(), "5.1", "Test failed! placeBet has gone something wrong.");
    })

    it("should have only one bet at a time", async() => {
    // Test 4: Players are only allowed play once; after betting they must check the result.
        // given
        let instance = await coinToFlip.deployed();
        let accounts = await web3.eth.getAccounts();

        const val = 0.1;
        const mask = 1; // Tails 0000 0001
        let err;

        // when
        try {
            await instance.placeBet(mask, {
                from: accounts[3],
                value: web3.utils.toWei(val.toString(), "ether")
            });
        } catch (e) {
            err = e;
        }

        // then
        assert.isOk(err instanceof Error, "Test Failed! Anyone can play multiple times!");
    })
})
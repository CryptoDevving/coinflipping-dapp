let hello = artifacts.require('./HelloWorld.sol')

contract('HelloWorld', function () {
  it('should be same as constructor argument', async() => {
    let instance = await hello.deployed();
    let greeting = await instance.say.call();
    assert.equal(greeting, "Hello World!");
  })

  it('should change the greeting value by setGreeting', async() => {
    let instance = await hello.deployed();
    let accounts = await web3.eth.getAccounts();
    await instance.setGreeting("Hello, Blockchain!", { from: accounts[0] })

    let greeting = await instance.say.call();
    assert.equal(greeting, "Hello, Blockchain!");
  })
})

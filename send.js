module.exports = async () => {
    let accounts = await web3.eth.getAccounts(); 
    web3.eth.sendTransaction({
        from: accounts[8],
        to: "0x39D95dB2824c069018865824ee6FC0D7639d9359",
        value: web3.utils.toWei('1.50', "ether")
    })
    console.log('done!')
}
import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Image, Alert } from 'react-bootstrap';
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { InputGroup, FormControl, Radio } from 'react-bootstrap';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import "./css/bootstrap.min.css";
import "./css/style.css";
import { EthOne, CoinHeads, CoinTails, CoinUnknown } from './images';
import getWeb3 from './utils/getWeb3';
import CoinToFlip from './contracts/CoinToFlip.json';
import * as Utils from 'web3-utils';

class CoinFlip extends Component {

    async componentDidMount() {

        try {
            // Get network provider and web3 instance.
            const web3 = await getWeb3();

            // Use web3 to get the user's accounts.
            let accounts = await web3.eth.getAccounts();

            // Get the contract instance.
            const networkId = await web3.eth.net.getId();
            const instance = new web3.eth.Contract(
                CoinToFlip.abi,
                '0xd803bb23a8bfc0ed8404b2ee113de3f3d8b7e87e'
            );

            //TODO-4
            instance.events.Reveal()
                .on('data', (event) => this.watchEvent(event))
                .on('error', (error) => console.log(error));


            // Metamask event subscription
            // web3.currentProvider.publicConfigStore.on("update", (r) => {
            //     if (r !== undefined) {
            //         console.log(r);
            //     }
            // });

            this.setState({web3, accounts, contract: instance}, this.getHouseBalance);

        } catch (error) {
            // Catch any errors for any of the above operations.
            alert('Failed to load web3, accounts, or contract. Check console for details.');
            console.log(error);
        }
    }

    state = {
        web3: null,
        accounts: null,
        contract: null,

        value: 0,
        checked: 0, // radio button
        houseBalance: 0,
        show: false,
        reveal: 0,
        reward: 0,
        txList: []
    }

    constructor(props) {
        super(props);
        this.handleClickCoin = this.handleClickCoin.bind(this);
    }

    handleClickCoin(e) {
        if (this.state.checked === 0) { // toggle
            if (e.target.id == 'Heads') {
                this.setState({
                    checked: 2
                })
            }
            if (e.target.id == 'Tails') {
                this.setState({
                    checked: 1
                })
            }
            return;
        }
        this.setState({
            checked: 0
        })
    }

    handleClickFlip = async() => {
        const {accounts, contract} = this.state;
        if (!this.state.web3) {
            console.log('App is not ready');
            return;
        }
        if (accounts[0] === undefined) {
            alert('Please refresh the webpage to activate metamask.');
            return;
        }
        this.setState({
            pending: true
        });

        try {
            await contract.methods.revealResult().send({
                from: accounts[0]
            });
            
            this.saveBetStatus("");
            this.setState({
                pending: false,
                show: {
                    flag: false,
                    msg: ''
                }
            });

        } catch (e) {
            console.log(e.message);
            this.setState({
                pending: false
            })
        }
    }

    handleClickReset = () => {
        this.setState({value: 0, checked: 0, reveal: 0, reward: 0});

        this.saveBetStatus("");
        this.inputEth.value = '';
    }

    handleValChange = (e) => {
        this.setState({value: parseFloat(e.target.value)});
    }

    checkBetStatus = () => {
        let bBet = false;
        if (localStorage.getItem("txHash") !== "") {
            this.setState({
                pending: false
            });
            this.setState({
                show: {
                    flag: true,
                    msg: 'You have already bet!'
                }
            });
            bBet = true;
        }
        return bBet;
    }

    saveBetStatus = (txHash) => {
        localStorage.setItem('txHash', txHash);
        this.getHouseBalance();
    }

    getHouseBalance = () => {
        const {web3, contract} = this.state;
        web3.eth.getBalance(contract._address, (err, result) => {
            this.setState({
                houseBalance: web3.utils.fromWei(String(result), 'ether')
            });
        });
    }

    watchEvent = (event) => {
        const {web3} = this.state;
        const reveal = parseInt(event.returnValues.reveal);
        const reward = web3.utils.fromWei(event.returnValues.amount.toString(), 'ether');
        this.setState({
            reveal,
            reward
        })
    }

    handleClickBet = async() => {
        const {web3, accounts, contract} = this.state;
        
        if (!this.state.web3) {
            console.log("App is not ready!");
            return;
        }

        if (accounts[0] === undefined) {
            alert('Please refresh the webpage to connect to your Metamask.');
            return;
        }

        if (this.state.value <= 0 || this.state.checked === 0) {
            this.setState({
                show: {
                    flag: true,
                    msg: 'You should bet bigger than 0.01 ETH'
                }
            })
            return;
        }
        
        this.setState({
            pending: true,
            show: {
                flag: true,
                msg: ''
            },
            reveal: 0,
            reward: 0
        })

        try {
            if (!this.checkBetStatus()) {
                const r = await contract.methods.placeBet(this.state.checked).send({
                    from: accounts[0],
                    value: Utils.toWei(String(this.state.value), 'ether')
                });
                console.log(r.transactionHash);
                this.saveBetStatus(r.transactionHash);
                this.setState({
                    pending: false
                })
            }
        } catch (e) {
            console.log(web3)
            console.log(e.message);
        } finally {
            this.setState({
                pending: false
            })
        }
    }

    AlertMsg = (props) => {
        if (props.show.flag) {
            return (
                <Alert bsStyle='danger'>
                    <strong>{props.show.msg}</strong>
                </Alert>
            )
        }
        return <br/>
    }

    handleRefund = async() => {
        const {accounts, contract} = this.state;
        if (!this.state.web3) {
            console.log('App is not ready');
            return;
        }
        if (accounts[0] === undefined) {
            alert('Please refresh the webpage to activate metamask.');
            return;
        }

        const r = await contract.methods.refundBetBeforeReveal().send({
            from: accounts[0]
        })
        if (r.transactionHash !== "") {
            this.saveBetStatus("");
        }
    }

    Reveal = (props) => {
        // console.log("PROPS:", props)
        console.log("P", props)
        let coinImg = CoinUnknown;
        if (props.reveal == 2) {
            coinImg = CoinHeads;
        }
        if (props.reveal == 1) {
            coinImg = CoinTails;
        }

        let coin = <Image src={coinImg} className="img-coin"></Image>

        return (
            <Panel bsStyle="info">
                <Panel.Heading>
                    <Panel.Title>
                        <Glyphicon glyph="adjust">Coin Reveal</Glyphicon>
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body className="custom-align-center">
                    {coin}
                    Ξ {props.reward}{props.reward>0?" YOU WIN!": "   GREAT PONZI YEAH!"}
                </Panel.Body>
            </Panel>
        )
    }

    render() {

        let AlertMsg = this.AlertMsg;

        let Reveal = this.Reveal;

        let coin = 
            <div>
                <Image src={CoinHeads} id="Heads" onClick={this.handleClickCoin} className="img-coin"></Image>
                <Image src={CoinTails} id="Tails" onClick={this.handleClickCoin} className="img-coin"></Image>
                <Image src={EthOne} id="EthOne"></Image>
            </div>

        return (
            <Grid fluid={true}>
                <Row className="show-grid">
                    <Col md={5}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                                <Panel.Title>
                                    <Glyphicon glyph="thumbs-up">
                                    House Balance: Ξ {this.state.houseBalance}
                                    </Glyphicon>
                                </Panel.Title>
                            </Panel.Heading>
                            <Panel.Body className="custom-align-center">
                                <div>
                                    There are the head and the tail of Ethereum.
                                    Click each images of the head and tail to go to the moon.
                                    {coin}
                                    Do not gamble with sacred Ethereum. Your wife would get mad.
                                </div>
                            </Panel.Body>
                        </Panel>
                    </Col>
                </Row>

                <Row className="show-grid">
                    <Col md={5}>
                        2
                    </Col>
                </Row>

                <Row className="show-grid">
                    <Col md={5}>
                        <Panel bsStyle="info">
                            <Panel.Heading>
                                <Panel.Title>
                                    <Glyphicon glyph="ok-circle">
                                        Your Bet
                                    </Glyphicon>
                                </Panel.Title>
                            </Panel.Heading>
                            <Panel.Body className="custom-align-center">
                                <form>
                                    <InputGroup style={{paddingBottom:'10px'}}>
                                        <Radio name="coinRadioGroup" onChange={this.handleClickCoin} checked={this.state.checked === 2} inline disabled>
                                            Heads
                                        </Radio>
                                        <Radio name="coinRadioGroup" onChange={this.handleClickCoin} checked={this.state.checked === 1} inline disabled>
                                            Tails
                                        </Radio>
                                    </InputGroup>
                                    <InputGroup style={{paddingBottom:'10px'}}>
                                        <InputGroup.Addon>ETH</InputGroup.Addon>
                                        <FormControl type="number" placeholder="Enter number" bsSize="lg"
                                                     onChange={this.handleValChange} inputRef={(ref)=>this.inputEth=ref} min={0.01} max={10} step={0.01}/>
                                    </InputGroup>
                                    <AlertMsg show={this.state.show}/>
                                </form>
                                <ButtonToolbar>
                                    <ButtonGroup justified>
                                        <Button href="#" bsStyle="primary" bsSize="large" onClick={this.handleClickBet}>
                                            Bet
                                        </Button>
                                        <Button href="#" bsStyle="success" bsSize="large" onClick={this.handleClickFlip}>
                                            Flip!
                                        </Button>
                                        <Button href="#" bsSize="large" onClick={this.handleRefund}>
                                            Refund
                                        </Button>
                                        <Button href="#" bsStyle="info" bsSize="large" onClick={this.handleClickReset}>
                                            Clear
                                        </Button>
                                    </ButtonGroup>
                                </ButtonToolbar>
                            </Panel.Body>
                        </Panel>
                    </Col>
                </Row>


                <Row className="show-grid">
                    <Col md={5}>
                        <Reveal reveal={this.state.reveal} reward={this.state.reward} />
                    </Col>
                </Row>

            </Grid>
        );
    }
}

export default CoinFlip;
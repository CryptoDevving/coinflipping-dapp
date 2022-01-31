import React, { Component } from 'react';
import { Grid, Row, Col, Panel, Image } from 'react-bootstrap';
import { Button, ButtonGroup, ButtonToolbar } from 'react-bootstrap';
import { InputGroup, FormControl, Radio } from 'react-bootstrap';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import "./css/bootstrap.min.css";
import "./css/style.css";
import { EthOne, CoinHeads, CoinTails } from './images';

class CoinFlip extends Component {

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
        web3.eth.getBalance(contract._address, (e, r) => {
            this.setState({
                houseBalance: web3.utils.fromWei(r, 'ether')
            });
        });
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
                    value: web3.util.toWei(String(this.state.value), 'ether')
                });
                console.log(r.transactionHash);
                this.saveBetStatus(r.transactionHash);
                this.setState({
                    pending: false
                })
            }
        } catch (e) {
            console.log(e.message);
        } finally {
            this.setState({
                pending: false
            })
        }
    }

    render() {

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
                                    <Glyphicon glyph="thumbs-up" />
                                    House: 0 ETH
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
                                        <Radio name="coinRadioGroup" checked={this.state.checked === 2} inline disabled>
                                            Heads
                                        </Radio>
                                        <Radio name="coinRadioGroup" checked={this.state.checked === 1} inline disabled>
                                            Tails
                                        </Radio>
                                    </InputGroup>
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
                        4
                    </Col>
                </Row>

            </Grid>
        );
    }
}

export default CoinFlip;
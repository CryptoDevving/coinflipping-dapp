import React, {Component} from 'react';
import {Grid, Row, Col, Panel, Image} from 'react-bootstrap';
import Glyphicon from 'react-bootstrap/lib/Glyphicon';
import "./css/bootstrap.min.css";
import "./css/style.css";
import {EthOne} from './images';

class CoinFlip extends Component {
    constructor(props) {
        super(props);
    }

    render() {

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
                                    <Image src={EthOne} id="EthOne"></Image>
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
                        3
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
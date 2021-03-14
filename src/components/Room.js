import logo from '../logo.svg';
import React from 'react';
import '../App.css';
import { LioWebRTC } from 'react-liowebrtc';
import { ListGroup } from 'react-bootstrap';
import FormControl from 'react-bootstrap/FormControl';
import Button from 'react-bootstrap/Button';
import { withRouter } from "react-router";

class Room extends React.Component {
  constructor() {
    super();
    this.webRTCRef = React.createRef();
    this.join = this.join.bind(this);
    this.handleCreatedPeer = this.handleCreatedPeer.bind(this);
    this.handlePeerData = this.handlePeerData.bind(this);
    this.handleRemovedPeer = this.handleRemovedPeer.bind(this);
    this.permutations = this.permutations.bind(this);
    this.calculateGroups = this.calculateGroups.bind(this);
    this.state = {
      id: '',
      remoteNames: [],
      localNames: [''],
      joined: false,
      nGroups: 2,
      calculated: false,
      random: -1,
      groups: []
    };
  }

  componentDidMount() {
    this.setState({ id: this.props.match.params.id })
  }

  componentWillUnmount() {
    this.webRTCRef.current.webrtc.quit() 
  }

  join(webrtc) {
    webrtc.joinRoom(this.state.id)
  };

  handleCreatedPeer(webrtc, peer) {
    this.setState(state => { return { remoteNames: [...state.remoteNames, peer.id + '$Unnamed']}})
  }

  handleRemovedPeer(webrtc, peer) {
    this.setState(state => { return { remoteNames: state.remoteNames.filter(x => !x.startsWith(peer.id))}})
  }

  handlePeerData (webrtc, type, payload, peer) {
    if (type === 'names') {
        let tmpNames = this.state.remoteNames.filter(x => !x.startsWith(peer.id))
        console.log(tmpNames)
        for (let n of JSON.parse(payload)) {
            tmpNames.push(peer.id + '$' + n)
        }
        this.setState({ remoteNames: tmpNames, calculated: false })
        //setCalculated(false)
    } else if (type === 'create') {
      this.setState({ random: payload, calculated: true })
      this.calculateGroups()
    } else if (type === 'new') {
        if(this.webRTCRef.current != null) {
            this.webRTCRef.current.webrtc.shout('names', JSON.stringify(this.state.localNames.filter(x => x !== '')))
        }
    }
  }

  permutations(arr) {
    if (arr.length <= 2) return arr.length === 2 ? [arr, [arr[1], arr[0]]] : arr;
    return arr.reduce(
      (acc, item, i) =>
      acc.concat(
          this.permutations([...arr.slice(0, i), ...arr.slice(i + 1)]).map(val => [
          item,
          ...val,
          ])
      ),
      []
    );
  };

  calculateGroups() {
    if (this.state.random !== -1 && this.state.remoteNames.length + this.state.localNames.length > 2) {
        let groups = Array(this.state.nGroups)
        let combinations = new Set(this.permutations([...this.state.localNames.filter(x => x !== ''), ...this.state.remoteNames.map(x => {
            let i = x.indexOf("$");
            return x.slice(i+1)
        })].sort()))
        let allcomb = Array.from(combinations)
        let comb = allcomb[Math.floor(this.state.random*(allcomb.length+1))]

        let j = 0
        for (let i = 0; i < this.state.nGroups; ++i) {
            groups[i] = []
            let nPeople = Math.floor(comb.length/this.state.nGroups)
            if ((comb.length%this.state.nGroups) > i) nPeople += 1
            for (let x = j; x < j+nPeople; ++x) {
                groups[i].push(comb[x])
            }
            j = j + nPeople;
        }
        this.setState({ groups: groups })
    }
  }

  render() {
    return (
      <div className="d-flex min-vh-100 align-items-center flex-column justify-content-center">
          <LioWebRTC
              options={{
                  debug: true,
                  dataOnly: true,
              }}
              onReady={this.join}
              onCreatedPeer={this.handleCreatedPeer}
              onReceivedPeerData={this.handlePeerData}
              onJoinedRoom={() => {
                  this.setState({joined: true})
                  setTimeout(() => {
                    if(this.webRTCRef.current != null)
                      this.webRTCRef.current.webrtc.shout('new', 'hi')
                  }, 1000)
              }}
              onRemovedPeer={this.handleRemovedPeer}
              ref={this.webRTCRef}
          />
          <p className="mb-2">Room {this.state.id}</p>
          {!this.state.joined ? <p>Connecting...</p> : 
          <ListGroup>
              {this.state.localNames.map((name, i) => {
                  return <FormControl
                      key={"input-"+i}
                      placeholder="Your Name"
                      aria-label="Your Name"
                      value={name}
                      className="mb-1"
                      onChange={(event) => {
                          let tmpNames = this.state.localNames.slice()
                          tmpNames[i] = event.target.value
                          if(this.webRTCRef.current != null) {
                              this.webRTCRef.current.webrtc.shout('names', JSON.stringify(tmpNames.filter(x => x !== '')))
                          }
                          this.setState({
                            localNames: tmpNames,
                            calculated: false
                          })
                      }}
                  />
              })}
              {this.state.remoteNames.filter(x => x !== '').map(n => {
                  let i = n.indexOf("$");
                  return <ListGroup.Item key={n}>{n.slice(i+1)}</ListGroup.Item>
              })}
          </ListGroup>}
          <div className="mt-1">
              <Button variant="primary" onClick={() => {
                  this.setState(prev => { return { localNames: [...prev.localNames, '']}})
              }}>Add more</Button>
          </div>
          <p className="mt-3 mb-1">Number of groups:</p>
            <ListGroup>
                <FormControl
                    placeholder="Number of groups"
                    aria-label="Number of groups"
                    type="number"
                    className="mb-1"
                    value={this.state.nGroups}
                    onChange={(event) => {
                        this.setState({ nGroups: event.target.value })
                    }}
                />
            </ListGroup>
            <div className="mt-1">
                <Button variant="primary" className="mb-2" disabled={this.state.calculated} onClick={() => {
                    let r = Math.random()
                    if (this.webRTCRef.current != null) {
                        this.webRTCRef.current.webrtc.shout('create', r)
                    }
                    this.setState({ random: r, calculated: true }, () => this.calculateGroups())
                }}>Create groups</Button>
            </div>
            {this.state.random !== -1 && <p className="mt-2 mb-1">Result:</p>}
            <ListGroup>
                {this.state.groups.map((g,i) => {
                  return <ListGroup className="mt-1 mb-2" key={'list_' + i}>
                      {g.map(n => {
                        return <ListGroup.Item key={'people_'+n} className="w-100">{n}</ListGroup.Item>
                      })}
                    </ListGroup>
                })}
            </ListGroup>
      </div>
    );
  }
}

export default withRouter(Room)


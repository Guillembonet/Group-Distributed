import logo from '../logo.svg';
import React, { Component, useState } from 'react';
import '../App.css';
import { LioWebRTC } from 'react-liowebrtc';
import { withWebRTC } from 'react-liowebrtc';
import Button from 'react-bootstrap/Button';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import { useHistory } from "react-router-dom";

export default function Home() {
  const history = useHistory();
  const [joinCode, setJoinCode] = useState('')

  function createRoom() {
    //console.log(this.props)
    history.push("/room/" + makeid(5));
    //this.props.history.push('/room/' + 'ADBS')
  };

  function joinRoom() {
    //console.log(this.props)
    history.push("/room/" + joinCode);
    //this.props.history.push('/room/' + 'ADBS')
  };

  function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  return (
    <div className="d-flex min-vh-100 align-items-center flex-column justify-content-center" >
      <p className="title mb-2">Anti-Jaen group creator</p>
      <p className="mb5">Make sure you are connected to a Wi-Fi.</p>
      <div>
        <Button variant="primary" onClick={createRoom}>Create Room</Button>
      </div>

      <div>
        <InputGroup className="mt-3">
          <FormControl
            placeholder="Room Code"
            aria-label="Recipient's username"
            value={joinCode}
            onChange={(event) => {
              console.log(event)
              setJoinCode(event.target.value)
            }}
          />
          <InputGroup.Append>
            <Button variant="primary" onClick={joinRoom}>Join</Button>
          </InputGroup.Append>
        </InputGroup>
      </div>
      
    </div>
  );
}

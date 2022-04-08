import './App.css';
import './style.css';
import React, { Component } from 'react';
import Video from './Video';
import MyForm from './MyForm';
import Recorder from './Recorder';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output: "",
      url: "videos/Emma/Emma.mp4",
      round: 0
    };
  }

  handleInputChange = mess => {
    this.setState({input : mess});
  }

  handleOutputChange = res => {
    this.setState({output : res});
  }

  handleUrlChange = newUrl => {
    this.setState({url : newUrl});
  }

  handleRoundChange = newRound => {
    this.setState({round : newRound});
  }

  render() {
    return (
      <div className="App">
        <div className="backImage">
          <div className='title'>
            <h1>Talk To Emma - Your Wine Expert</h1>
          </div>
          <Video output = {this.state.output} url = {this.state.url} onUrlChange = {this.handleUrlChange} round = {this.state.round} />
          <MyForm onOutputChange = {this.handleOutputChange} onUrlChange = {this.handleUrlChange} onRoundChange = {this.handleRoundChange} round = {this.state.round} />
          {/* <div>{this.state.round}</div> */}
          {/* <Recorder /> */}
        </div>
      </div>
    )
  }
}

export default App;

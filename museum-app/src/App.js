import './App.css';
import './style.css';
import React, { Component } from 'react';
import Video from './Video';
import MyForm from './MyForm';
import HelperButton from './HelperButton';
import MyFormRealTime from './MyFormRealTime';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      output: "",
      url: "videos/Ryan/Ryan.mp4",
      showHelp: true,
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

  handleShowHelpChange = show => {
    this.setState({showHelp : show});
  }

  render() {
    return (
      <div className="App">
        <Video output = {this.state.output} url = {this.state.url} onUrlChange = {this.handleUrlChange} round = {this.state.round} />
        {this.state.showHelp ? <div className='hint-text'>How can I help you today?</div> : null}
        {this.state.showHelp ? <HelperButton /> : null}
        <MyFormRealTime onOutputChange = {this.handleOutputChange} onUrlChange = {this.handleUrlChange} onShowHelpChange = {this.handleShowHelpChange}/>
        {/* <div>{this.state.round}</div> */}
        {/* <Recorder /> */}
      </div>
    )
  }
}

export default App;

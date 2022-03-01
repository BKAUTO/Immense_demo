import React, { Component } from 'react'
import ReactPlayer from 'react-player'

class Video extends Component {

    render () {
        return (
        <div className='player-wrapper'>
            <ReactPlayer
                className='react-player fixed-bottom'
                url= {this.props.url}
                width = '60%'
                height = '60%'
                loop = {false}
                playing = {true}
                controls = {false}
                key = {this.props.round}
                // onEnded = {() => {this.props.onUrlChange("videos/default.mp4")}}
            />
        </div>
        )
    }
}

export default Video;
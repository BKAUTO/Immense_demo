import { useState, useRef, useEffect } from "react";
import RasaServices from "./rasa-services";
import { videos } from './videoList';
import RecordRTC, { StereoAudioRecorder } from 'recordrtc';
import $ from 'jquery';

function MyFormRealTime(props) {
    const socket = useRef(null);
    const recorder = useRef(null);
    const [mess, setMess] = useState("");

    const requestRasa = (request) => {
      RasaServices.getRasaReponse(request)
        .then(response => {
            let url = searchVideo(response.data[0]["text"]);
            props.onOutputChange(response.data[0]["text"]);
            props.onUrlChange(url);
            props.onShowHelpChange(false);
        })
        .catch(e => {
            console.log(e);
        })
    }

    const searchVideo = (output) => {
        console.log(output)
        let video = videos.find(o => o.content === output);
        if (typeof video === 'undefined') {
            return videos[0].url;
        }
        else {
            return video.url;
        }
    }

    const handleClick = async () => {
      if($('#recButton').hasClass('notRec')){
        $('#recButton').removeClass("notRec");
        $('#recButton').addClass("Rec");

        if (!socket.current) {
            const response = await fetch('http://localhost:8000'); // get temp session token from server.js (backend)
            const data = await response.json();

            if(data.error){
                alert(data.error)
            }
            
            const { token } = data;

            // establish wss with AssemblyAI (AAI) at 16000 sample rate
            socket.current = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
        }

        const texts = {};
        socket.current.onmessage = (message) => {
            let msg = '';
            const res = JSON.parse(message.data);
            texts[res.audio_start] = res.text;
            const keys = Object.keys(texts);
            keys.sort((a, b) => a - b);
            for (const key of keys) {
                if (texts[key]) {
                msg += ` ${texts[key]}`;
                }
            }
            console.log(msg);
            setMess(msg);
            props.onSubChange(msg);
        };

        socket.current.onopen = () => {
            // once socket is open, begin recording
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                if (!recorder.current) {
                    recorder.current = new RecordRTC(stream, {
                        type: 'audio',
                        mimeType: 'audio/webm;codecs=pcm', // endpoint requires 16bit PCM audio
                        recorderType: StereoAudioRecorder,
                        timeSlice: 250, // set 250 ms intervals of data that sends to AAI
                        desiredSampRate: 16000,
                        numberOfAudioChannels: 1, // real-time requires only one channel
                        bufferSize: 4096,
                        audioBitsPerSecond: 128000,
                        ondataavailable: (blob) => {
                            const reader = new FileReader();
                            reader.onload = () => {
                            const base64data = reader.result;
            
                            // audio data must be sent as a base64 encoded string
                            if (socket.current) {
                                socket.current.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
                            }
                            };
                            reader.readAsDataURL(blob);
                        },
                    });
                }
                recorder.current.startRecording();
            })
            .catch((err) => console.error(err));
        };

        socket.current.onclose = event => {
            console.log(event);
            socket.current = null;
        }

        socket.current.onerror = (event) => {
            console.error(event);
            socket.current.close();
        }
      }
      else{
        $('#recButton').removeClass("Rec");
        $('#recButton').addClass("notRec");
        if (socket.current) {
            socket.current.send(JSON.stringify({terminate_session: true}));
            socket.current.close();
            socket.current = null;
        }
        if (recorder.current) {
            recorder.current.pauseRecording();
            recorder.current = null;
        }
        let request = {
            "sender": "test_user",
            "message": mess
        }
        requestRasa(request);
        setMess("");
        props.onSubChange("");
      }
    }
  
    return (
          <div className='form-wrapper'>
                <button type="button" className='notRec' id="recButton" onClick={handleClick}></button>
          </div>
    )
}

export default MyFormRealTime;
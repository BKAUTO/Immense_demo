import { useState, useRef, useEffect } from "react";
import RasaServices from "./rasa-services";
import SpeechServices from "./speech-services";
import { videos } from './videoList';
import $ from 'jquery';

function MyForm(props) {
    const [messageEl, setMessageEl] = useState("")
    const [isRecording, setIsRecording] = useState(false)   
    const [transcriptData, setTranscriptData] = useState("")
    const [input, setInput] = useState(""); // content of text input

    let recorder;
    let socket;

    useEffect(() => {
      const script = document.createElement('script');
    
      script.src = "https://www.WebRTC-Experiment.com/RecordRTC.js";
      script.async = true;
    
      document.body.appendChild(script);
    
      return () => {
        document.body.removeChild(script);
      }
    }, []);

    const requestRasa = (request) => {
      RasaServices.getRasaReponse(request)
        .then(response => {
            let url = searchVideo(response.data[0]["text"]);
            console.log(response.data[0]["text"])
            // props.onOutputChange(response.data[0]["text"]);
            props.onUrlChange(url);
            // props.onRoundChange(props.round+1);
        })
        .catch(e => {
            console.log(e);
        })
    }

    const searchVideo = (output) => {
      let video = videos.find(o => o.content === output);
      if (typeof video === 'undefined') {
          return videos[0].url;
      }
      else {
          return video.url;
      }
    }
  
    const handleSubmit = (event) => {
      event.preventDefault();
      if (input !== "") {
        let request = {
          "sender": "test_user",
          "message": input
        }
        requestRasa(request);
        setInput("");
      }
      else {
      }
    }

    const stream = async () =>{
      if (isRecording) { 
        if (socket) {
          socket.send(JSON.stringify({terminate_session: true}));
          socket.close();
          socket = null;
        }
    
        if (recorder) {
          recorder.pauseRecording();
          recorder = null;
        }
      } else {
        const response = await fetch('http://localhost:8000'); // get temp session token from server.js (backend)
        const data = await response.json();
    
        if(data.error){
          alert(data.error)
        }
        
        const { token } = data;
        console.log(data)
        // establish wss with AssemblyAI (AAI) at 16000 sample rate
        socket = await new WebSocket(`wss://api.assemblyai.com/v2/realtime/ws?sample_rate=16000&token=${token}`);
    
        // handle incoming messages to display transcription to the DOM
        const texts = {};
        socket.onmessage = (message) => {
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
          setMessageEl(msg);
        };
    
        socket.onerror = (event) => {
          console.error(event);
          socket.close();
        }
        
        socket.onclose = event => {
          console.log(event);
          socket = null;
        }
    
        socket.onopen = () => {
          // once socket is open, begin recording
          navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
              recorder = new window.RecordRTC(stream, {
                type: 'audio',
                mimeType: 'audio/webm;codecs=pcm', // endpoint requires 16bit PCM audio
                recorderType: window.StereoAudioRecorder,
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
                    if (socket) {
                      socket.send(JSON.stringify({ audio_data: base64data.split('base64,')[1] }));
                    }
                  };
                  reader.readAsDataURL(blob);
                },
              });
    
              recorder.startRecording();
            })
            .catch((err) => console.error(err));
        };
      }
    
      isRecording = !isRecording;
      if(isRecording){
        $('#recButton').removeClass("notRec");
        $('#recButton').addClass("Rec");
      }
      else{
        $('#recButton').removeClass("Rec");
        $('#recButton').addClass("notRec");
        setMessageEl("");
      }
    }

  
    return (
        <div className='form-wrapper'>
          <form onSubmit={handleSubmit}>
              <button type="button" className='notRec' id="recButton" onClick={stream}></button>
              <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
              />
              <input type="submit" className="submitButton" value="Send"/>
          </form>
          <p>{messageEl}</p>
          {/* <audio ref={audioPlayer} src={blobURL} controls='controls' /> */}
          {transcriptData.status === "completed" ? (
            <p>{transcriptData.text}</p>
          ) : (
            <p>{transcriptData.status}</p>
          )}
        </div>
        
    )
  }

export default MyForm;
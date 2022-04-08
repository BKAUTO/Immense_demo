import { useState, useRef, useEffect } from "react";
import RasaServices from "./rasa-services";
import SpeechServices from "./speech-services";
import { videos } from './videoList';
import MicRecorder from "mic-recorder-to-mp3";
import $ from 'jquery';

function MyForm(props) {
    // Mic-Recorder-To-MP3
    const recorder = useRef(null) //Recorder
    const audioPlayer = useRef(null) //Ref for the HTML Audio Tag
    const [blobURL, setBlobUrl] = useState(null)
    const [audioFile, setAudioFile] = useState(null)
    const [uploadURL, setUploadURL] = useState("");
    const [isRecording, setIsRecording] = useState(null)
    const [transcriptID, setTranscriptID] = useState("");    
    const [transcriptData, setTranscriptData] = useState("")
    const [transcript, setTranscript] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [input, setInput] = useState("");

    useEffect(() => {
      //Declares the recorder object and stores it inside of ref
      recorder.current = new MicRecorder({ bitRate: 128 })
    }, [])

    const requestRasa = (request) => {
      RasaServices.getRasaReponse(request)
        .then(response => {
            let url = searchVideo(response.data[0]["text"]);
            props.onOutputChange(response.data[0]["text"]);
            props.onUrlChange(url);
            props.onRoundChange(props.round+1);
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
      if (input === "") {
        SpeechServices.submitTranscriptionHandler(uploadURL)
        .then((res) => {
          setTranscriptID(res.data.id);
          console.log(transcriptID);
          checkStatusHandler()
          })
        .catch((err) => console.error(err));
      }
    }

    const handleGetResponse = () => {
      if (input !== "") {
        let request = {
          "sender": "test_user",
          "message": input
        }
        requestRasa(request);
        setInput("");
      }
      else if (transcript !== "") {
        let request = {
          "sender": "test_user",
          "message": transcript
        }
        requestRasa(request);
      }
    }

    // Check the status of the Transcript
    const checkStatusHandler = async () => {
      setIsLoading(true)
      try {
        await SpeechServices.checkStatusHandler(transcriptID)
          .then((res) => {
            setTranscriptData(res.data);
            console.log(transcriptData);
          })
      } catch (err) {
        console.error(err)
      }
    }

    // Periodically check the status of the Transcript
    useEffect(() => {
      const interval = setInterval(() => {
        if (transcriptData.status !== "completed" && isLoading) {
          checkStatusHandler();
        } else {
          setIsLoading(false);
          setTranscript(transcriptData.text);
          clearInterval(interval);
        }
      }, 1000)
      return () => clearInterval(interval)
    },)

    const startRecording = () => {
      // Check if recording isn't blocked by browser
      recorder.current.start().then(() => {
        setIsRecording(true)
      })
    }

    const stopRecording = () => {
      recorder.current
        .stop()
        .getMp3()
        .then(([buffer, blob]) => {
          const file = new File(buffer, "audio.mp3", {
            type: blob.type,
            lastModified: Date.now(),
          })
          const newBlobUrl = URL.createObjectURL(blob)
          setBlobUrl(newBlobUrl)
          setIsRecording(false)
          setAudioFile(file)
        })
        .catch((e) => console.log(e))
    }

    const handleClick = () => {
      if($('#recButton').hasClass('notRec')){
        $('#recButton').removeClass("notRec");
        $('#recButton').addClass("Rec");
        startRecording();
      }
      else{
        $('#recButton').removeClass("Rec");
        $('#recButton').addClass("notRec");
        stopRecording();
      }
    }

    // Upload the Audio File and retrieve the Upload URL
    useEffect(() => {
      if (audioFile) {
        SpeechServices.submitAudio(audioFile)
          .then((res) => {
            setUploadURL(res.data.upload_url);
          })
          .catch((err) => console.error(err));
      }
    }, [audioFile])
  
    return (
        <div className='form-wrapper'>
          <button className="getButton" onClick={handleGetResponse}>Play</button>
          <form onSubmit={handleSubmit}>
              <button type="button" className='notRec' id="recButton" onClick={handleClick}></button>
              <input 
                  type="text" 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
              />
              <input type="submit" className="submitButton" value="Send"/>
          </form>
          <audio ref={audioPlayer} src={blobURL} controls='controls' />
          {transcriptData.status === "completed" ? (
            <p>{transcript}</p>
          ) : (
            <p>{transcriptData.status}</p>
          )}
        </div>
    )
  }

export default MyForm;
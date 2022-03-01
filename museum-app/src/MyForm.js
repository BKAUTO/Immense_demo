import { useState } from "react";
import RasaServices from "./rasa-services";
import { videos } from './videoList';

function MyForm(props) {
    const [mess, setMess] = useState("");

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
      props.onInputChange(mess);
      setMess("");
      let request = {
        "sender": "test_user",
        "message": mess
      }
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
  
    return (
        <div className='form-wrapper'>
        <form onSubmit={handleSubmit}>
            <label>Chat With Emma</label>
            <input 
                type="text" 
                value={mess}
                onChange={(e) => setMess(e.target.value)}
            />
            <input type="submit" className="submitButton"/>
        </form>
        </div>
    )
  }

export default MyForm;
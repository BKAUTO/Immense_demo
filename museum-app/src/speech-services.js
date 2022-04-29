import assemblyApi from "./speech-util";
import axios from "axios";


class SpeechServices {
    submitAudio(audioFile) {
        return assemblyApi.post("/upload", audioFile)
    }

    submitTranscriptionHandler(uploadURL) {
        return assemblyApi.post("/transcript", {
            audio_url: uploadURL,
        })
    }

    checkStatusHandler(transcriptID) {
        return assemblyApi.get(`/transcript/${transcriptID}`)
    }

    async getTempSessionToken() {
        let res = null;
        try {
            const response = await axios.post('https://api.assemblyai.com/v2/realtime/token', // use account token to get a temp user token
              { expires_in: 3600 }, // can set a TTL timer in seconds.
              { headers: { authorization: 'b4792de861744ea492bd66db7f6844c5'} }); // AssemblyAI API Key goes here
            const { data } = response;
            res.json(data);
            return res;
          } catch (error) {
            const {response: {status, data}} = error;
            res.status(status).json(data);
            return res;
          }
    }
}

export default new SpeechServices();

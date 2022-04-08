import assemblyApi from "./speech-util";

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
}

export default new SpeechServices();

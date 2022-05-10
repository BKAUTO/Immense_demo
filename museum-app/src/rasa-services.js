import rasaApi from "./rasa-util";

class RasaServices {
    getRasaReponse(request) {
        return rasaApi.post("/webhooks/rest/webhook", request);
    }
}

export default new RasaServices();

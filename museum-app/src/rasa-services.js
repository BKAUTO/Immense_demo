import http from "./http-util";

class RasaServices {
    getRasaReponse(request) {
        return http.post("/webhooks/rest/webhook", request);
    }
}

export default new RasaServices();

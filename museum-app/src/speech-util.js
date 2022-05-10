import axios from "axios";

export default axios.create({
  baseURL: "https://api.assemblyai.com/v2",
  headers: {
    authorization: "b4792de861744ea492bd66db7f6844c5",
    "content-type": "application/json",
  }
});
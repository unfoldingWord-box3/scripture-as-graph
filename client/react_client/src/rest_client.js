import Axios from "axios";

class RestClient {

    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async doGet(url, callback) {
        await this.sendRequest("get", `${this.baseUrl}/${url}`, callback);
    }

    async sendRequest(method, url, callback) {
        callback((await Axios.request({
            method: method,
            url: url
        })).data);
    }
}

export default RestClient;

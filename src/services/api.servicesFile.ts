import { apiConst } from "./api.constant";
import httpClient from "./api.services";
import httpClientFile from "./api.configFile";

class fileService {
  async uploadFile(file: any) {
    return await httpClientFile.post(apiConst.upload, file, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  }

  async insert(model: any) {
    return await httpClient.post(apiConst.insert, model);
  }
}
export default new fileService();

// src/services/api.constant.ts
export const apiConst = Object.freeze({
  webLogin: "api/Login/LoginO",
  sendOtp: "api/SendOtp",
  loginWithOtp: "api/loginWithOtp",
  tokenSetup: "api/tokenSetup",
  getIdByUserToken: "api/user/GetByToken",
  getAllConfiguration: "api/Setting/GetAll",
  insertConfiguration: "api/Setting/Insert",
  updateConfiguration: "api/Setting/Update",
  deleteConfiguration: "api/Setting/Delete",
  getAllProgramTemplate: "api/ProgramTemplate/GetAll",
  getAllDefaultRibbons: "api/Menu/GetAll",
  // EntityType جداول مختلف (LessonLearnedFormTemplate, CommentFormTemplate, ProcedureFormTemplate)
  getTableTransmittal: "api/EntityType/GetAllComplete",
  // LessonLearnedAfTemplate
  getAllWfTemplate: "api/WFTemplate/GetAll",
  getAllAfbtn: "api/AFBtn/GetAll",
  insertAFBtn: "api/AFBtn/Insert",
  updateAFBtn: "api/AFBtn/Update",
  deleteAFBtn: "api/AFBtn/Delete",
  inserConfiguration: "api/Setting/Insert",
  uploadFile: "api/File/Upload",
  insert: "api/File/Insert",
  download: "api/File/Download",
  getFile: "api/File/GetById",
  getCommand: "api/Command/GetAll",
  insertCommand: "api/Command/Insert",
  deleteCommand: "api/Command/Delete",
  updateCommand: "api/Command/Update",
  getEnum: "api/GetEnumByName",

});

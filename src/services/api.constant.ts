// src/services/api.constant.ts
export const apiConst = Object.freeze({
  webLogin: "api/Login/LoginO",
  sendOtp: "api/SendOtp",
  loginWithOtp: "api/loginWithOtp",
  tokenSetup: "api/tokenSetup",
  getAllConfiguration: "api/Setting/GetAll",
  getAllProgramTemplate: "api/ProgramTemplate/GetAll",
  getAllDefaultRibbons: "api/Menu/GetAll",
  // EntityType جداول مختلف (LessonLearnedFormTemplate, CommentFormTemplate, ProcedureFormTemplate)
  getTableTransmittal: "api/EntityType/GetAllComplete",
  // LessonLearnedAfTemplate
  getAllWfTemplate: "api/WFTemplate/GetAll",
  getAllAfbtn: "api/AFBtn/GetAll",
});

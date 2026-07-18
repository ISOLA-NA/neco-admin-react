// src/context/ProgramDesignerContext.tsx

import React, { createContext, useContext } from "react";
import ProgramDesignerServices from "../services/programDesigner/services";
import {
  SinglePFI,
  UpdateProgramFieldPayload,
  ProgramDesignerRow,
  ProgramValidationResult,
  ImportExcelTemplatePayload,
  ExcelTemplateFileInfo,
} from "../services/programDesigner/types";

interface ProgramDesignerContextType {
  getRootRows: (programTemplateId: number) => Promise<ProgramDesignerRow[]>;
  getChildRows: (parentGPIC: string) => Promise<ProgramDesignerRow[]>;
  getSinglePFI: (id: number) => Promise<SinglePFI>;
  addOneProgramFieldTemplate: (
    payload: UpdateProgramFieldPayload
  ) => Promise<SinglePFI>;
  updateOneProgramFieldTemplate: (
    payload: UpdateProgramFieldPayload
  ) => Promise<any>;
  deleteOneProgramFieldTemplate: (id: number) => Promise<boolean>;
  checkIsWaitingForEngine: (programTemplateId: number) => Promise<boolean>;
  checkValidation: (
    programTemplateId: number
  ) => Promise<ProgramValidationResult>;
  getExcelTemplate: (
    programTemplateId: number
  ) => Promise<ExcelTemplateFileInfo>;
  downloadFile: (fileName: string, folderName: string) => Promise<Blob>;
  uploadFile: (file: File) => Promise<any>;
  insertFileRecord: (fileMeta: any) => Promise<any>;
  importExcelTemplate: (
    payload: ImportExcelTemplatePayload
  ) => Promise<void>;
}

const ProgramDesignerContext = createContext<ProgramDesignerContextType | undefined>(undefined);

export const ProgramDesignerProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const api: ProgramDesignerContextType = {
    getRootRows: ProgramDesignerServices.getRootRows.bind(
      ProgramDesignerServices
    ),
    getChildRows: ProgramDesignerServices.getChildRows.bind(
      ProgramDesignerServices
    ),
    getSinglePFI: ProgramDesignerServices.getSinglePFI.bind(
      ProgramDesignerServices
    ),
    addOneProgramFieldTemplate:
      ProgramDesignerServices.addOneProgramFieldTemplate.bind(
        ProgramDesignerServices
      ),
    updateOneProgramFieldTemplate:
      ProgramDesignerServices.updateOneProgramFieldTemplate.bind(
        ProgramDesignerServices
      ),
    deleteOneProgramFieldTemplate:
      ProgramDesignerServices.deleteOneProgramFieldTemplate.bind(
        ProgramDesignerServices
      ),
    checkIsWaitingForEngine:
      ProgramDesignerServices.checkIsWaitingForEngine.bind(
        ProgramDesignerServices
      ),
    checkValidation: ProgramDesignerServices.checkValidation.bind(
      ProgramDesignerServices
    ),
    getExcelTemplate: ProgramDesignerServices.getExcelTemplate.bind(
      ProgramDesignerServices
    ),
    downloadFile: ProgramDesignerServices.downloadFile.bind(
      ProgramDesignerServices
    ),
    uploadFile: ProgramDesignerServices.uploadFile.bind(
      ProgramDesignerServices
    ),
    insertFileRecord: ProgramDesignerServices.insertFileRecord.bind(
      ProgramDesignerServices
    ),
    importExcelTemplate: ProgramDesignerServices.importExcelTemplate.bind(
      ProgramDesignerServices
    ),
  };

  return (
    <ProgramDesignerContext.Provider value={api}>
      {children}
    </ProgramDesignerContext.Provider>
  );
};

export const useProgramDesigner = (): ProgramDesignerContextType => {
  const context = useContext(ProgramDesignerContext);
  if (!context) {
    throw new Error(
      "useProgramDesigner باید داخل یک ProgramDesignerProvider استفاده شود"
    );
  }
  return context;
};
// src/types.ts

export interface ConfigurationItem {
  ID: number;
  Name: string;
  FirstIDProgramTemplate: number;
  SelMenuIDForMain: number;
  Description: string;
  IsVisible: boolean;
  LastModified: string;
  DefaultBtn: string;
  LetterBtns: string;
  MeetingBtns: string;
  EntityTypeIDForLessonLearn: number;
  SelMenuIDForLessonLearnAfTemplate: number;
  EntityTypeIDForTaskComment: number;
  EntityTypeIDForProcedure: number;
  // سایر فیلدها در صورت نیاز...
}

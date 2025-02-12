// src/helper/formGeneratorHelper.ts

export interface Entity {
  Field?: any;
  Value?: any;
}

export interface Rule {
  type: string;
  label: string;
  title: string;
  value: any;
  name: string;
  [key: string]: any;
}

export function initEntity(entity: Entity): Rule {
  let field = entity.Field;
  let value = entity.Value;
  if (field === undefined) {
    field = entity;
    value = {
      ID: field.ID,
      Value: "",
      nEntityFieldID: field.ID,
      nEntityID: 0,
      nEntityTypeID: 0,
    };
  }
  const rule: Rule = {
    type: "",
    label: "",
    title: "",
    value: "",
    name: "",
  };

  // بر اساس نوع ستون (ColumnType) آبجکت تنظیمات (rule) ساخته می‌شود
  switch (field.ColumnType) {
    case 1: {
      // RichText (Textarea)
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "textarea";
      rule.name = "CtrTextArea";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.placeholder = field.DisplayName;
      rule.desc = field.Description;
      rule.disabled = field.IsForceReadOnly;
      rule.value =
        value.Value == null
          ? ""
          : value.Value.replace(/\n/g, "\\n")
              .replace(/\r/g, "\\r")
              .replace(/\t/g, "\\t")
              .replace(/\f/g, "\\f");
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        IsRequire: field.IsRequire,
        validation: [{ type: "string", required: true }],
        class: "textarea-b",
      };
      return rule;
    }
    case 2: {
      // Choice
      if (field.metaType2 === "drop") {
        rule.entityField = field;
        rule.entityValue = value;
        rule.type = "select";
        rule.name = "CtrSelect";
        rule.disabled = field.IsForceReadOnly;
        rule.selValue = value.Value == null ? "" : value.Value;
        const op = field.metaType3.replace("\r", "").split("\n");
        rule.options = [];
        rule.setting = {
          placeholder: "please choose",
          metaType4: field.metaType4,
          metaType3: field.metaType3,
          metaType2: field.metaType2,
          metaType1: field.metaType1,
          IsRequire: field.IsRequire,
          IsRtl: field.IsRTL,
          ID: value.ID,
          entityFieldId: value.nEntityFieldID,
          entityId: value.nEntityID,
          entityTypeId: field.nEntityTypeID,
        };

        op.forEach((opt: string) => {
          const option = {
            value: opt,
            label: opt,
            disabled: false,
          };
          rule.options.push(option);
        });
      } else if (field.metaType2 === "radio") {
        rule.entityField = field;
        rule.entityValue = value;
        rule.type = "radio";
        rule.name = "CtrRadio";
        rule.label = field.DisplayName;
        rule.title = field.DisplayName;
        rule.selValue = value.Value == null ? "" : value.Value;
        rule.selValue =
          rule.selValue === ""
            ? field.metaType1.replace("\r", "")
            : rule.selValue.replace("\r", "");
        const radioItems = field.metaType3.replace("\r", "").split("\n");
        rule.options = [];
        radioItems.forEach((opt: string) => {
          if (opt !== undefined && opt.length > 0) {
            const option = {
              value: opt.replace("\r", ""),
              label: opt.replace("\r", ""),
              disabled: false,
            };
            rule.options.push(option);
          }
        });
        rule.setting = {
          placeholder: "please choose",
          disabled: field.IsForceReadOnly,
          IsRequire: field.IsRequire,
          metaType4: field.metaType4,
          metaType3: field.metaType3,
          metaType2: field.metaType2,
          metaType1: field.metaType1,
          IsRtl: field.IsRTL,
          ID: value.ID,
          entityFieldId: value.nEntityFieldID,
          entityId: value.nEntityID,
          entityTypeId: field.nEntityTypeID,
        };
      } else if (field.metaType2 === "check") {
        rule.type = "checkBox";
        rule.name = "CtrCheckBox";
        rule.SelectedItems = [];
        rule.entityField = field;
        rule.entityValue = value;
        if (value && value.Value) {
          const selectedItems = value.Value.replace("\r", "").split("\n");
          selectedItems.forEach((sel: string) => {
            if (sel.charCodeAt(0) === 13 && sel.length === 1) sel = "";
            if (sel && sel.length > 0) rule.SelectedItems.push(sel);
          });
        }
        rule.selValue = rule.SelectedItems;
        const checkItems = field.metaType3.replace("\r", "").split("\n");
        rule.options = [];
        checkItems.forEach((opt: string) => {
          if (opt.charCodeAt(0) === 13 && opt.length === 1) opt = "";
          if (opt !== undefined && opt.length > 0) {
            const option = {
              value: opt,
              label: opt,
              disabled: false,
            };
            rule.options.push(option);
          }
        });
        rule.setting = {
          placeholder: "please choose",
          disabled: field.IsForceReadOnly,
          IsRequire: field.IsRequire,
          metaType4: field.metaType4,
          metaType3: field.metaType3,
          metaType2: field.metaType2,
          metaType1: field.metaType1,
          IsRtl: field.IsRTL,
          ID: value.ID,
          entityFieldId: value.nEntityFieldID,
          entityId: value.nEntityID,
          entityTypeId: field.nEntityTypeID,
        };
      } else {
        rule.setting = { ProjectID: "" };
        rule.type = "CtrSelect";
        rule.name = "CtrSelect";
      }
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      return rule;
    }
    case 3: {
      // Number
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "InputNumber";
      rule.name = "CtrInputNumber";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.placeholder = field.DisplayName;
      rule.value = value.Value == null ? field.metaType1 : value.Value;
      rule.min = parseInt(field.metaType2);
      rule.max = parseInt(field.metaType3);
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 4: {
      // DateTime
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "DatePicker";
      rule.name = "CtrDatePicker";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.value = value.Value == null ? "" : value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        type: "datetime",
        format: "yyyy-MM-dd",
        placeholder: "Please select event date",
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
      };

      if (field.metaType2 === "today") {
        rule.value = new Date();
      }
      if (field.metaType2 === "selected") {
        rule.value = field.metaType3;
      }
      if (
        value.Value !== undefined &&
        value.Value !== null &&
        value.Value.length > 1
      ) {
        rule.value = value.Value;
      }
      if (field.metaType1 === "dateonly") {
        rule.value = value.Value == null ? "" : value.Value.split(" ")[0];
        rule.setting.format = "yyyy-MM-dd";
      }
      return rule;
    }
    case 5: {
      // Lookup
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Lookup";
      rule.name = "CtrLookup";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 6: {
      // Yes/No (Switch)
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "switch";
      rule.name = "CtrSwitch";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.disabled = field.IsForceReadOnly;
      if (field.metaType1 === "Yes" || value.Value === "True") {
        rule.value = true;
      } else {
        rule.value = false;
      }
      if (
        value.Value !== undefined &&
        value.Value !== null &&
        value.Value.length > 1
      ) {
        rule.value = value.Value.toLowerCase() === "true";
      }
      rule.setting = {
        activeValue: "Yes",
        inactiveValue: "No",
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 7: {
      // HyperLink
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "HyperLink";
      rule.name = "CtrHyperLink";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 8: {
      // SelectUserInPost
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "SelectUserInPost";
      rule.name = "CtrSelectUserInPost";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 9: {
      // AttachFile
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "upload";
      rule.name = "CtrUpload";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        type: "select",
        uploadType: "image",
        action: "/upload.php",
        name: "pic",
        multiple: true,
        format: ["jpg", "jpeg", "png", "gif"],
        maxSize: 2048,
        maxLength: 5,
        onSuccess: function (res: any) {
          return "http://img1.touxiang.cn/uploads/20131030/30-075657_191.jpg";
        },
      };
      return rule;
    }
    case 10: {
      // Table
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Table";
      rule.name = "CtrTable";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.disabled = field.IsForceReadOnly;
      let tableData: any[] = [];
      try {
        const header = field.metaType1.replace("\r", "").split("\n");
        let dataRow = `{`;
        for (let key in header) {
          dataRow += `"${header[key]
            .replace("\n", "")
            .replace("\r", "")}": "",`;
        }
        dataRow = dataRow.substring(0, dataRow.length - 1) + "}";
        tableData.push(JSON.parse(dataRow));
      } catch (error) {
        // خطا در پردازش داده
      }
      rule.tableData = tableData;
      rule.data = field.metaType3;
      if (value.Value && value.Value != null && value.Value.length > 0) {
        rule.data = value.Value;
      }
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
      };
      return rule;
    }
    case 11: {
      // Title
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Title";
      rule.name = "CtrTitle";
      rule.value = field.DisplayName;
      rule.setting = {
        IsRtl: field.IsRTL,
      };
      return rule;
    }
    case 12: {
      // Section
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Section";
      rule.name = "CtrSection";
      rule.value = field.DisplayName;
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 13: {
      // SubSection
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "SubSection";
      rule.name = "CtrSubSection";
      rule.value = field.DisplayName;
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 14: {
      // NewLine
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "NewLine";
      rule.name = "CtrNewLine";
      rule.setting = {
        IsRtl: field.IsRTL,
      };
      return rule;
    }
    case 15: {
      // Input (Text)
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "input";
      rule.name = "CtrTextBox";
      rule.label = field.DisplayName.trim();
      rule.title = field.DisplayName;
      rule.value = value.Value == null ? field.metaType1 : value.Value;
      rule.placeholder = field.DisplayName;
      rule.setting = {
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        type: "text",
      };
      rule.validate = [
        {
          required: field.IsRequire,
          message: "مقدار نباید خالی باشد",
          trigger: "blur",
        },
      ];
      return rule;
    }
    case 16: {
      // PFILookup
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "PFILookup";
      rule.name = "CtrPFILookup";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 17: {
      // AdvanceLookup
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "AdvanceLookup";
      rule.name = "CtrAdvanceLookup";
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        ID: value.ID,
        IsRtl: field.IsRTL,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 18: {
      // MePostSelector
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "MePostSelector";
      rule.name = "CtrMePostSelector";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 19: {
      // PostPickerList
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "PostPickerList";
      rule.name = "CtrPostPickerList";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 20: {
      // SeqenialNumber
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "SeqenialNamber";
      rule.name = "CtrSeqenialNumber";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 21: {
      // PersianDate
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "PersianDate";
      rule.name = "CtrPersianDate";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 22: {
      // AdvanceTable
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "AdvanceTable";
      rule.name = "CtrAdvanceTable";
      rule.label = field.DisplayName;
      rule.title = field.DisplayName;
      rule.disabled = field.IsForceReadOnly;
      let tableData2: any[] = [];
      try {
        const header2 = field.metaType1.replace("\r", "").split("\n");
        let dataRow2 = `{`;
        for (let key in header2) {
          dataRow2 += `"${header2[key]
            .replace("\n", "")
            .replace("\r", "")}": "",`;
        }
        dataRow2 = dataRow2.substring(0, dataRow2.length - 1) + "}";
        tableData2.push(JSON.parse(dataRow2));
      } catch (error) {
        // خطا در پردازش داده‌ها
      }
      rule.tableData = tableData2;
      rule.data = field.metaType3;
      if (value.Value && value.Value != null && value.Value.length > 0) {
        rule.data = value.Value;
      }
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
        RowCount: field.metaType2,
      };
      return rule;
    }
    case 23: {
      // AdvanceWF
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "AdvanceWF";
      rule.name = "CtrAdvanceWF";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 24: {
      // WordPanel
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "WordPanel";
      rule.name = "CtrWordPanel";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 25: {
      // ExcelPanel
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "ExcelPanel";
      rule.name = "CtrExcelPanel";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 26: {
      // PictureBox
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "PictureBox";
      rule.name = "CtrPictureBox";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType1: field.metaType1,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 27: {
      // CalCulatedField
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "CalCulatedField";
      rule.name = "CtrCalCulatedField";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType2: field.metaType2,
        metaType3: field.metaType3,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 28: {
      // Map
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Map";
      rule.name = "CtrMap";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType2: field.metaType2,
        metaType3: field.metaType3,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 29: {
      // ExcelCalculator
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "ExcelCalculator";
      rule.name = "CtrExcelCalculator";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType2: field.metaType2,
        metaType3: field.metaType3,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 30: {
      // LookupImage
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "LookupImage";
      rule.name = "CtrLookupImage";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 34: {
      // LookupRealValue
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "LookupRealValue";
      rule.name = "CtrLookupRealValue";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 32: {
      // Tab
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "Tab";
      rule.name = "Tab";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 35: {
      // LookupAdvanceTable
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "LookupAdvanceTable";
      rule.name = "CtrLookupAdvanceTable";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    case 36: {
      rule.entityField = field;
      rule.entityValue = value;
      rule.type = "AdvanceLookupAdvanceTable";
      rule.name = "CtrAvanceLookupAdvanceTable";
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
    default: {
      rule.entityField = field;
      rule.entityValue = value;
      rule.label = field.DisplayName;
      rule.value = value.Value;
      rule.disabled = field.IsForceReadOnly;
      rule.setting = {
        metaType4: field.metaType4,
        metaType3: field.metaType3,
        metaType2: field.metaType2,
        metaType1: field.metaType1,
        IsRequire: field.IsRequire,
        IsRtl: field.IsRTL,
        ID: value.ID,
        entityFieldId: value.nEntityFieldID,
        entityId: value.nEntityID,
        entityTypeId: field.nEntityTypeID,
      };
      return rule;
    }
  }
}

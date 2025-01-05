import { inflate } from "pako";
export const unGZip = (data: string) => {
  const compressData = data;
  const b64Data = atob(compressData);
  const charCode = b64Data.split("").map((e) => e.charCodeAt(0));
  const int8Arr = new Uint8Array(charCode);
  const unZipped = inflate(int8Arr);
  let i;
  let str = "";
  for (i = 0; i < unZipped.length; i++) {
    str += "%" + ("0" + unZipped[i].toString(16)).slice(-2);
  }
  str = decodeURIComponent(str);
  return JSON.parse(str);
};

// با یک فایل util کوچک، تبدیل‌ها همیشه یکسان می‌شوند
export const toNumberOrNull = (val: string | number | null | undefined) =>
    val === "" || val === null || val === undefined ? null : Number(val);
  
  export const toStringId = (val: string | number | null | undefined) =>
    val === null || val === undefined ? "" : String(val);
  
  export const ensureUniqueIds = (ids: string[]) =>
    Array.from(new Set(ids.filter(Boolean)));
  
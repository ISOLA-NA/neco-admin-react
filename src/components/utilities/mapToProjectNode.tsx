// src/utils/mapToProjectNode.ts
import { ProjectNode } from "../../services/api.services";

export function mapToProjectNode(raw: any): ProjectNode {
  return {
    ID:        raw.ID  ?? raw.id  ?? raw.PrgId,           // شناسه
    Name:      raw.Name ?? raw.ProgramName ?? "-",        // نام قابل‌نمایش
    HasChild:  raw.HasChild ?? raw.HasSub ?? false        // آیا فرزند دارد؟
  };
}

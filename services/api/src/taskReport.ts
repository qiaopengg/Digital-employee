export type TaskReportParagraphBlock = Readonly<{
  type: "paragraph";
  text: string;
}>;

export type TaskReportBulletsBlock = Readonly<{
  type: "bullets";
  items: ReadonlyArray<string>;
}>;

export type TaskReportMetric = Readonly<{
  label: string;
  value: string;
  note?: string;
}>;

export type TaskReportMetricsBlock = Readonly<{
  type: "metrics";
  items: ReadonlyArray<TaskReportMetric>;
}>;

export type TaskReportTableBlock = Readonly<{
  type: "table";
  caption?: string;
  columns: ReadonlyArray<string>;
  rows: ReadonlyArray<ReadonlyArray<string>>;
}>;

export type TaskReportBlock =
  | TaskReportParagraphBlock
  | TaskReportBulletsBlock
  | TaskReportMetricsBlock
  | TaskReportTableBlock;

export type TaskReportSection = Readonly<{
  title?: string;
  blocks: ReadonlyArray<TaskReportBlock>;
}>;

export type TaskReportNextStep = Readonly<{
  text: string;
  owner?: string;
  due?: string;
}>;

export type TaskReportV1 = Readonly<{
  schema: "task-report.v1";
  title: string;
  summary: string;
  sections: ReadonlyArray<TaskReportSection>;
  nextSteps?: ReadonlyArray<TaskReportNextStep>;
}>;

const fallbackReports = new WeakSet<object>();

type JsonObject = Record<string, unknown>;

function objectValue(value: unknown): JsonObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Expected an object.");
  }
  return value as JsonObject;
}

function stringValue(value: unknown): string {
  if (typeof value !== "string") throw new Error("Expected a string.");
  const normalized = value.trim();
  if (!normalized) throw new Error("Expected a non-empty string.");
  return normalized;
}

function optionalString(value: unknown): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string") throw new Error("Expected a string.");
  return value.trim() || undefined;
}

function stringArray(value: unknown, maximum: number): ReadonlyArray<string> {
  if (!Array.isArray(value) || value.length > maximum) {
    throw new Error("Expected a bounded array.");
  }
  return value.map(stringValue);
}

function parseBlock(value: unknown): TaskReportBlock {
  const block = objectValue(value);
  if (block.type === "paragraph") {
    return { type: "paragraph", text: stringValue(block.text) };
  }
  if (block.type === "bullets") {
    return { type: "bullets", items: stringArray(block.items, 12) };
  }
  if (block.type === "metrics") {
    if (!Array.isArray(block.items) || block.items.length > 8) {
      throw new Error("Expected bounded metrics.");
    }
    return {
      type: "metrics",
      items: block.items.map((itemValue) => {
        const item = objectValue(itemValue);
        const note = optionalString(item.note);
        return {
          label: stringValue(item.label),
          value: stringValue(item.value),
          ...(note ? { note } : {}),
        };
      }),
    };
  }
  if (block.type === "table") {
    const columns = stringArray(block.columns, 6);
    if (
      columns.length === 0 ||
      !Array.isArray(block.rows) ||
      block.rows.length > 20
    ) {
      throw new Error("Expected a bounded table.");
    }
    const rows = block.rows.map((row) => {
      const values = stringArray(row, 6);
      if (values.length !== columns.length) {
        throw new Error("Table rows must match the column count.");
      }
      return values;
    });
    const caption = optionalString(block.caption);
    return {
      type: "table",
      ...(caption ? { caption } : {}),
      columns,
      rows,
    };
  }
  throw new Error("Unknown report block.");
}

function parseReport(value: unknown): TaskReportV1 {
  const report = objectValue(value);
  if (report.schema !== "task-report.v1") {
    throw new Error("Unsupported report schema.");
  }
  if (!Array.isArray(report.sections) || report.sections.length > 8) {
    throw new Error("Expected bounded sections.");
  }

  let blockCount = 0;
  const sections = report.sections.map((sectionValue) => {
    const section = objectValue(sectionValue);
    if (!Array.isArray(section.blocks)) throw new Error("Expected blocks.");
    blockCount += section.blocks.length;
    if (blockCount > 24) throw new Error("Too many report blocks.");
    const title = optionalString(section.title);
    return {
      ...(title ? { title } : {}),
      blocks: section.blocks.map(parseBlock),
    };
  });

  let nextSteps: ReadonlyArray<TaskReportNextStep> | undefined;
  if (report.nextSteps !== undefined) {
    if (!Array.isArray(report.nextSteps) || report.nextSteps.length > 8) {
      throw new Error("Expected bounded next steps.");
    }
    nextSteps = report.nextSteps.map((stepValue) => {
      const step = objectValue(stepValue);
      const owner = optionalString(step.owner);
      const due = optionalString(step.due);
      return {
        text: stringValue(step.text),
        ...(owner ? { owner } : {}),
        ...(due ? { due } : {}),
      };
    });
  }

  return {
    schema: "task-report.v1",
    title: stringValue(report.title),
    summary: stringValue(report.summary),
    sections,
    ...(nextSteps ? { nextSteps } : {}),
  };
}

function jsonCandidate(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```json\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

export function isJsonLikeTaskReportPayload(raw: string): boolean {
  const candidate = jsonCandidate(raw);
  return candidate.startsWith("{") || candidate.startsWith("[");
}

function fallbackReport(raw: string, prompt: string): TaskReportV1 {
  const normalizedRaw = raw.trim();
  const safeText = isJsonLikeTaskReportPayload(raw)
    ? "本次成果已生成，但返回结构未通过安全展示校验。请重新执行任务以生成可视化汇报。"
    : normalizedRaw || prompt.trim();
  const report: TaskReportV1 = {
    schema: "task-report.v1",
    title: "任务成果",
    summary: "已完成任务处理，以下为正式交付内容。",
    sections: [
      {
        blocks: [
          {
            type: "paragraph",
            text: safeText,
          },
        ],
      },
    ],
  };
  fallbackReports.add(report);
  return report;
}

export function parseTaskReport(raw: string, prompt: string): TaskReportV1 {
  try {
    return parseReport(JSON.parse(jsonCandidate(raw)) as unknown);
  } catch {
    return fallbackReport(raw, prompt);
  }
}

export function isFallbackTaskReport(report: TaskReportV1): boolean {
  return fallbackReports.has(report);
}

function tableCell(value: string): string {
  return value.replaceAll("|", "\\|").replaceAll("\n", " ");
}

export function taskReportToPlainText(report: TaskReportV1): string {
  const lines: string[] = [report.title, "", report.summary];

  for (const section of report.sections) {
    if (section.title) lines.push("", section.title);
    for (const block of section.blocks) {
      if (block.type === "paragraph") {
        lines.push("", block.text);
      } else if (block.type === "bullets") {
        lines.push("", ...block.items.map((item) => `- ${item}`));
      } else if (block.type === "metrics") {
        lines.push(
          "",
          ...block.items.map(
            (item) =>
              `- ${item.label}：${item.value}${
                item.note ? `（${item.note}）` : ""
              }`
          )
        );
      } else {
        if (block.caption) lines.push("", block.caption);
        lines.push(
          `| ${block.columns.map(tableCell).join(" | ")} |`,
          `| ${block.columns.map(() => "---").join(" | ")} |`,
          ...block.rows.map((row) => `| ${row.map(tableCell).join(" | ")} |`)
        );
      }
    }
  }

  if (report.nextSteps?.length) {
    lines.push("", "下一步");
    lines.push(
      ...report.nextSteps.map((step) => {
        const details = [step.owner, step.due].filter(Boolean).join("，");
        return `- ${step.text}${details ? `（${details}）` : ""}`;
      })
    );
  }

  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

import type { TaskReportBlock, TaskReportV1 } from './taskTypes';

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | undefined {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as UnknownRecord)
    : undefined;
}

function requiredString(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  return value.trim() || undefined;
}

function optionalString(value: unknown): string | undefined | null {
  if (value === undefined) return undefined;
  return typeof value === 'string' ? value.trim() || undefined : null;
}

function stringArray(
  value: unknown,
  limit: number,
): ReadonlyArray<string> | undefined {
  if (!Array.isArray(value) || value.length > limit) return undefined;
  const items = value.map(requiredString);
  return items.every(Boolean) ? (items as ReadonlyArray<string>) : undefined;
}

function normalizeBlock(value: unknown): TaskReportBlock | undefined {
  const block = asRecord(value);
  if (!block || typeof block.type !== 'string') return undefined;

  if (block.type === 'paragraph') {
    const text = requiredString(block.text);
    return text ? { type: 'paragraph', text } : undefined;
  }

  if (block.type === 'bullets') {
    const items = stringArray(block.items, 12);
    return items ? { type: 'bullets', items } : undefined;
  }

  if (block.type === 'metrics') {
    if (!Array.isArray(block.items) || block.items.length > 8) return undefined;
    const items = block.items.map(item => {
      const metric = asRecord(item);
      const label = requiredString(metric?.label);
      const valueText = requiredString(metric?.value);
      const note = optionalString(metric?.note);
      return metric && label && valueText && note !== null
        ? {
            label,
            value: valueText,
            ...(note === undefined ? {} : { note }),
          }
        : undefined;
    });

    return items.every(Boolean)
      ? {
          type: 'metrics',
          items: items as ReadonlyArray<
            Readonly<{ label: string; value: string; note?: string }>
          >,
        }
      : undefined;
  }

  if (block.type === 'table') {
    const caption = optionalString(block.caption);
    const columns = stringArray(block.columns, 6);
    if (
      caption === null ||
      !columns?.length ||
      !Array.isArray(block.rows) ||
      block.rows.length > 20
    ) {
      return undefined;
    }

    const rows = block.rows.map(row => stringArray(row, 6));
    return rows.every(row => row?.length === columns.length)
      ? {
          type: 'table',
          columns,
          rows: rows as ReadonlyArray<ReadonlyArray<string>>,
          ...(caption === undefined ? {} : { caption }),
        }
      : undefined;
  }

  return undefined;
}

export function normalizeTaskReport(value: unknown): TaskReportV1 | undefined {
  const report = asRecord(value);
  const title = requiredString(report?.title);
  const summary = requiredString(report?.summary);
  if (
    !report ||
    report.schema !== 'task-report.v1' ||
    !title ||
    !summary ||
    !Array.isArray(report.sections) ||
    report.sections.length > 8
  ) {
    return undefined;
  }

  let blockCount = 0;
  const sections = report.sections.map(sectionValue => {
    const section = asRecord(sectionValue);
    const sectionTitle = optionalString(section?.title);
    if (!section || sectionTitle === null || !Array.isArray(section.blocks)) {
      return undefined;
    }

    blockCount += section.blocks.length;
    if (blockCount > 24) return undefined;

    const blocks = section.blocks.map(normalizeBlock);
    return blocks.every(Boolean)
      ? {
          blocks: blocks as ReadonlyArray<TaskReportBlock>,
          ...(sectionTitle === undefined ? {} : { title: sectionTitle }),
        }
      : undefined;
  });

  if (!sections.every(Boolean)) return undefined;

  let nextSteps: TaskReportV1['nextSteps'];
  if (report.nextSteps !== undefined) {
    if (!Array.isArray(report.nextSteps) || report.nextSteps.length > 8) {
      return undefined;
    }

    const normalizedSteps = report.nextSteps.map(stepValue => {
      const step = asRecord(stepValue);
      const text = requiredString(step?.text);
      const owner = optionalString(step?.owner);
      const due = optionalString(step?.due);
      return step && text && owner !== null && due !== null
        ? {
            text,
            ...(owner === undefined ? {} : { owner }),
            ...(due === undefined ? {} : { due }),
          }
        : undefined;
    });
    if (!normalizedSteps.every(Boolean)) return undefined;
    nextSteps = normalizedSteps as NonNullable<TaskReportV1['nextSteps']>;
  }

  return {
    schema: 'task-report.v1',
    title,
    summary,
    sections: sections as TaskReportV1['sections'],
    ...(nextSteps === undefined ? {} : { nextSteps }),
  };
}

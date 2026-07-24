import { randomUUID } from "node:crypto";

import type { ApiConfig } from "./config.ts";
import { DeepSeekClient } from "./deepseekClient.ts";
import {
  isFallbackTaskReport,
  isJsonLikeTaskReportPayload,
  parseTaskReport,
  taskReportToPlainText,
  type TaskReportV1,
} from "./taskReport.ts";

export type TaskMode = "deep" | "quick" | "standard";

export type TaskResult = Readonly<{
  answer: string;
  completedAt: string;
  id: string;
  model: string;
  personaReport: string;
  providerRequestId?: string;
  report: TaskReportV1;
  status: "completed";
  usage: Readonly<{
    completionTokens: number;
    promptTokens: number;
    totalTokens: number;
  }>;
}>;

const SYSTEM_PROMPT = `你是数字员工公司的统一 AI 交付引擎。
直接完成用户要求，优先给出可使用的成果，再补充必要的依据、限制与下一步。
默认使用简体中文；用户明确要求其他语言时服从用户。
不要声称多个数字员工分别进行过独立模型调用、检索或审核。
不知道或无法验证的事实必须明确说明，禁止编造来源、进度或已执行操作。

只输出一个符合 TaskReportV1 的 JSON object，不要输出 Markdown、代码围栏、前后说明或其他文本：
{
  "schema": "task-report.v1",
  "title": "自然语言标题",
  "summary": "自然语言摘要",
  "sections": [{ "title": "可选的自然语言章节标题", "blocks": [...] }],
  "nextSteps": [{ "text": "下一步内容", "owner": "可选负责人", "due": "可选期限" }]
}
blocks 只允许以下四种形状：
1. paragraph：{ "type": "paragraph", "text": "正文" }
2. bullets：{ "type": "bullets", "items": ["要点"] }
3. metrics：{ "type": "metrics", "items": [{ "label": "自然语言指标名", "value": "指标值", "note": "可选说明" }] }
4. table：{ "type": "table", "caption": "可选表题", "columns": ["自然语言列名"], "rows": [["单元格"]] }
所有标题、章节名、指标标签和表格列名必须使用面向用户的自然语言。禁止把内部 ID、状态码、程序字段名或实现细节作为面向用户的内容。`;

export class TaskService {
  private readonly client: DeepSeekClient;
  private readonly completedTasks = new Map<string, TaskResult>();
  private readonly flashModel: string;
  private readonly proModel: string;

  constructor(config: ApiConfig, client = new DeepSeekClient(config)) {
    this.client = client;
    this.flashModel = config.flashModel;
    this.proModel = config.proModel;
  }

  async validateModels(signal?: AbortSignal) {
    const models = await this.client.listModels(signal);
    const requiredModels = [this.flashModel, this.proModel];

    return {
      available: requiredModels.filter((model) => models.includes(model)),
      missing: requiredModels.filter((model) => !models.includes(model)),
    };
  }

  async execute({
    idempotencyKey,
    mode,
    prompt,
    signal,
  }: {
    idempotencyKey: string;
    mode: TaskMode;
    prompt: string;
    signal?: AbortSignal;
  }): Promise<TaskResult> {
    const existing = this.completedTasks.get(idempotencyKey);
    if (existing) return existing;

    const normalizedPrompt = prompt.trim();
    if (!normalizedPrompt || normalizedPrompt.length > 12000) {
      throw new Error(
        "Task prompt must contain between 1 and 12000 characters."
      );
    }

    const model = mode === "deep" ? this.proModel : this.flashModel;
    const completion = await this.client.createCompletion({
      messages: [
        { content: SYSTEM_PROMPT, role: "system" },
        { content: normalizedPrompt, role: "user" },
      ],
      mode,
      model,
      signal,
    });
    const report = parseTaskReport(completion.content, normalizedPrompt);
    const result: TaskResult = {
      answer:
        isFallbackTaskReport(report) &&
        !isJsonLikeTaskReportPayload(completion.content)
          ? completion.content.trim()
          : taskReportToPlainText(report),
      completedAt: new Date().toISOString(),
      id: randomUUID(),
      model: completion.model,
      personaReport: "顾宁：成果已完成统一审核，请老板查看正式交付内容。",
      providerRequestId: completion.requestId,
      report,
      status: "completed",
      usage: completion.usage,
    };

    this.completedTasks.set(idempotencyKey, result);
    return result;
  }
}

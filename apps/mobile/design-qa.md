# Product Design QA

## Comparison target

- Source visual truth: `/Users/qiaopeng/Downloads/IMG_3733.jpg`
- Source role: interaction and spatial-structure reference, not a pixel-identical portrait screen
- Implementation screenshot: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/artifacts/ui/01-office-overview.png`
- Full-view comparison: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/artifacts/ui/qa-reference-vs-implementation.png`
- State: office overview, one active handoff, one employee on break, one selected virtual asset

## Viewport and normalization

- Source pixels: 1482 × 989, landscape reference, density treated as 1×
- Implementation pixels: 1206 × 2622 from iPhone 17 Pro Simulator
- Implementation logical viewport: 402 × 874 pt at 3× density
- Product target remains portrait mobile; the source's landscape composition was adapted rather than stretched or cropped into a false 1:1 match
- Full-view comparison scales both artifacts independently on a shared white canvas. Device chrome is excluded from design findings.

## Full-view evidence

The implementation preserves the source's useful interaction structure: a fixed high-front office, clear workstation slots, independently identifiable employees, a single task dialogue, and a persistent office control bar. It adapts that structure to the project's required portrait layout, five-tab navigation, warm product palette, selected asset state, and break area.

No actionable P0, P1, or P2 differences remain. The deliberate differences are required by the product specification: portrait layout, native navigation, larger mobile hit targets, a warmer non-pixel illustration system, and separate native detail sheets.

## Focused state evidence

- Employee break detail: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/artifacts/ui/02-employee-break-detail.png`
- Asset lifecycle detail: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/artifacts/ui/03-asset-lifecycle-detail.jpeg`
- Completed handoff detail: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/artifacts/ui/04-handoff-complete.jpeg`

Focused region crops were not required because each state is readable at full simulator resolution. The screenshots show that employees, the handoff bubble, and the coffee machine are separate accessible press targets rather than baked into the office background.

## Required fidelity surfaces

- Fonts and typography: iOS system typography is used consistently. Office title, object names, statuses, and control labels retain clear weight hierarchy and remain legible at the captured size.
- Spacing and layout rhythm: safe-area header, scene, control bar, and tab bar form a stable vertical stack. The second pass moved the handoff bubble and narrowed employee labels so no task or employee state is obscured.
- Colors and visual tokens: existing project tokens remain authoritative. Warm white, pale wood, mist blue, plant green, charcoal text, and semantic success colors match the frozen design language.
- Image quality and asset fidelity: the office is one background asset; four employees and the coffee machine are separate transparent assets. No character, task dialogue, status label, or asset action is rasterized into the background.
- Copy and content: visible copy uses the confirmed product language, including “资料已交给审核经理”, “休息中”, “可接任务”, “标准公司楼层 · 租赁中”, and “直接汇报给老板”.

## Interaction verification

- Employee press target opens an employee-specific sheet and keeps “休息中” distinct from offline or unavailable.
- Handoff press target opens a task-specific sheet and changes the visible route to “资料已接收，正在审核”.
- Coffee-machine press target opens lifecycle data for ownership, use, maintenance, depreciation, residual value, movement, and sale.
- Asset maintenance produces a visible state notice.
- Sale requires a second confirmation and transitions to an “已出售 · 槽位空闲” state; covered by the component test.
- Top-level tabs, scene list, and task composer remain connected to the existing application shell.

## Comparison history

1. Initial concept image: rejected because characters, furniture, and UI were baked into one raster image and could not support independent interaction.
2. First coded pass: separate assets and working sheets were implemented, but the handoff bubble overlapped employee status labels and the break label clipped at the left edge.
3. Final coded pass: the bubble moved into the open aisle, handoff actors were separated, label bounds were reduced, and the break label was brought inside the scene edge. Post-fix evidence is the implementation screenshot above.

## Follow-up polish

- P3: the selected coffee-machine outline is intentionally strong for this interaction proof; production motion can soften it after the asset-selection transition is signed off.

final result: passed

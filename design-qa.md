# Office Layout Design QA

**Source visual truth**

- Primary scene asset: `/Users/qiaopeng/Desktop/owner/数字员工/apps/mobile/src/assets/office/office-floor-v3.png`
- User references:
  - `/Users/qiaopeng/Downloads/已生成图像 3.png`
  - `/Users/qiaopeng/Downloads/已生成图像 2.png`
  - `/Users/qiaopeng/Downloads/已生成图像 1 (1).png`
- The source asset is the resolved visual target: six aligned workstations, a secretary reception desk, central circulation, a furnished boss office, meeting room, lounge, and pantry.

**Implementation evidence**

- Final full-device screenshot: `/tmp/digital-office-layout-v3-final-refined.png`
- Final scene-only screenshot: `/tmp/digital-office-layout-v3-scene.png`
- Handoff stance screenshot: `/tmp/digital-office-layout-v3-conversation-2.png`
- Dialogue-state screenshot after refinement: `/tmp/digital-office-layout-v3-dialogue-refined.png`
- Full side-by-side comparison: `/tmp/office-design-qa-full.png`
- Focused workstation and furniture comparison: `/tmp/office-design-qa-focus.png`
- Pre-fix employee/chair capture: `/tmp/office-seat-audit-before.png`
- Final employee/chair capture: `/tmp/office-seat-audit-after-2.png`
- Final native preview capture: `/tmp/office-seat-audit-final.png`
- Final secretary-identity capture: `/tmp/office-seat-audit-final-secretary.png`
- Employee/chair before-and-after comparison: `/tmp/office-seat-qa-comparison.png`
- Final employee/chair comparison: `/tmp/office-seat-qa-comparison-final.png`
- Walking and handoff checks: `/tmp/office-seat-handoff.png` and `/tmp/office-seat-return.png`
- Scale audit source: `/Users/qiaopeng/Downloads/已生成图像 1 (1).png`
- Pre-scale capture: `/tmp/office-scale-audit-before.png`
- Final scale capture: `/tmp/office-scale-audit-after-1.png`
- Full scale comparison: `/tmp/office-scale-qa-comparison-full.png`
- Focused furniture comparison: `/tmp/office-scale-qa-comparison-focus.png`
- Enlarged walking, handoff, and return checks: `/tmp/office-scale-walk.png`, `/tmp/office-scale-handoff.png`, and `/tmp/office-scale-return.png`
- Pre-redesign seated-angle capture: `/tmp/office-seated-angle-before.png`
- Final seated-angle capture: `/tmp/office-seated-angle-final.png`
- Seated-angle before-and-after comparison: `/tmp/office-seated-angle-qa-comparison.png`
- Updated high-angle sprite sheet: `/tmp/office-seated-v4-assets.png`
- Updated handoff and return checks: `/tmp/office-seated-angle-handoff.png` and `/tmp/office-seated-angle-return.png`

**Viewport and normalization**

- Device: iPhone 17 Pro simulator.
- Device screenshot: 1206 × 2622 px at 3× density, equivalent to a 402 × 874 pt viewport.
- Source scene: 1024 × 1536 px.
- Rendered office scene crop: 1134 × 2120 px, equivalent to 378 × 706.7 pt at 3× density.
- For the side-by-side comparison, the source scene was normalized to the rendered scene crop. The mobile stage intentionally uses the entire office frame; characters, status markers, and bottom task controls are implementation-owned overlays.
- State: task handoff completed and reviewer working. Separate captures verify walking and face-to-face handoff states.

**Full-view comparison evidence**

- The left open office keeps exactly six same-family desks in a legible two-column by three-row physical grid.
- The main corridor remains unobstructed from the entrance to the upper floor and has clear branches to desks and rooms.
- The secretary has a dedicated reception workstation with computer, phone, trays, storage, and a visitor chair.
- Boss office, meeting room, lounge, and pantry remain clearly separated and materially richer than the previous sparse layout.
- Implementation overlays do not replace or redraw visible furniture; they add only employees, semantic status, task controls, and interaction targets.

**Focused-region comparison evidence**

- Occupied and empty workstation furniture is identical; occupancy is represented only by animated employee layers.
- Both working employees are shown from the rear while seated and keep one world scale when standing or walking.
- Working employees now sit deeper in the chair, reach the desk edge, and remain behind the chair arms and front caster geometry instead of appearing pasted over the chair.
- The reviewer is centered on the physical chair rather than on the older workstation coordinate.
- The secretary now uses a rear seated pose at the reception chair. The chair arms, seat front, center post, and casters correctly occlude the body, replacing the previous standing sprite that appeared on top of the desk.
- The resting employee follows the sofa direction and remains visually seated rather than floating over the furniture.
- The two working employees and secretary now use a steep rear three-quarter overhead camera that matches the office floor asset. The visible crown, foreshortened back, compact legs, and desk-facing hands replace the previous near-eye-level rear view.
- The updated transparent rigs share one normalized foot/chair baseline, so swapping between seated, reviewing, rising, standing, and walking states does not introduce a vertical or scale jump.

**Required fidelity surfaces**

- Fonts and typography: existing native type hierarchy is preserved. Scene labels were reduced to compact status markers, and the handoff bubble was reduced to a two-line, non-obstructive size.
- Spacing and layout rhythm: the workstation grid, corridor, room boundaries, entrance, and bottom floating controls are visually ordered and do not overlap primary furniture.
- Colors and visual tokens: the generated warm oak, ivory, slate-blue, and sage palette remains intact; existing semantic success, movement, handoff, and rest colors are reused.
- Image quality and asset fidelity: the 1024 × 1536 production raster is sharp at the rendered density. No workstation or furniture is approximated with code-drawn shapes.
- Copy and content: task state, boss-room status, asset access, secretary access, and handoff dialogue remain available without permanently covering the office.

**Comparison history**

1. Initial implementation capture: `/tmp/digital-office-layout-v3-initial.png`
   - P2: legacy scene chips and full employee labels obscured furniture.
   - P2: the reception foreground hid too much of the secretary.
   - Fixes: removed redundant scene chips, changed employee states to compact markers, repositioned the boss-room marker, and recalibrated the reception occlusion and secretary anchor.
2. Dialogue capture: `/tmp/digital-office-layout-v3-dialogue.png`
   - P2: the dialogue bubble covered both employees and the handoff stance.
   - Fixes: moved the bubble above the interaction, reduced typography and padding, constrained it to two lines, and kept it visible only during real exchange phases.
3. Final comparison: `/tmp/office-design-qa-full.png` and `/tmp/office-design-qa-focus.png`
   - No actionable P0, P1, or P2 findings remain.
4. Employee/chair calibration: `/tmp/office-seat-qa-comparison.png`
   - P2: the two workstation employees sat too low, leaving their hands below the desk edge and making their bodies look overlaid on the chairs.
   - P2: the reviewer chair occlusion was horizontally offset from the updated workstation center.
   - P2: the secretary used a standing sprite behind a broad desk mask, leaving a miniature half-body on the desktop while the chair stayed empty.
   - Fixes: raised the seated sprite anchor, derived the reviewer occlusion from the layout anchor, bound the secretary to the reception seat, added a secretary-specific rear seated sprite, and translated the same chair foreground geometry to the reception chair.
   - Final review: no actionable P0, P1, or P2 findings remain in seated, walking, handoff, or resting states.
5. Human-to-furniture scale calibration: `/tmp/office-scale-qa-comparison-full.png` and `/tmp/office-scale-qa-comparison-focus.png`
   - P2: the earlier `0.082` actor width came from the superseded office scene. In the current furniture asset, visible shoulder width remained narrower than the chair back and the resting employee read as a miniature figure on the sofa.
   - Fixes: increased the shared work-area actor width to `0.096`, introduced a `0.105` near-field scale for the lower reception and lounge zones, and kept every seated/standing/walking pose on the same shared world scale.
   - Final review: shoulders now approximately match chair-back width, seated hands reach the work surface, standing height is consistent with desk depth, and no chair, desk, corridor, or handoff collision is visible.
6. Seated camera and anatomy redesign: `/tmp/office-seated-angle-qa-comparison.png`
   - P2: the previous seated assets were drawn from an almost eye-level rear camera. Their elongated backs and exposed legs could not align with the steep top-down chairs even after anchor and scale tuning.
   - Fixes: replaced the strategy, reviewer-idle, reviewer-reviewing, and secretary seated rigs with new 65-degree overhead rear views; normalized all transparent rig baselines; and recalibrated the shared work-area and near-field widths to `0.11` and `0.118`.
   - Final review: crown and shoulder planes match the office camera, torsos are visibly foreshortened, legs remain under the desk or chair, hands meet the work surface, chair arms and caster geometry remain in front, and the handoff/return sequence has no scale pop or route collision.

**Primary interactions tested**

- Automatic task handoff: seated work → stand → turn → walk along the branch aisle → face-to-face exchange → return by the routed aisle → reseat.
- Dialogue is phase-bound and is absent in normal working and resting states.
- Employee, asset, task, and secretary controls remain accessible and are covered by the interaction regression suite.
- The native app launched without a red error overlay, and the iOS simulator build completed successfully.

**Follow-up polish**

- P3: the small boss-room status marker still overlaps a decorative wall area. It is acceptable for this pass but could become a tap-revealed marker in a later interaction-polish round.

**Implementation checklist**

- [x] Six aligned, full-size workstation modules
- [x] Dedicated secretary reception workstation
- [x] Rich boss office
- [x] Meeting, lounge, and pantry zoning
- [x] Clear main corridor and branch paths
- [x] Recalibrated seat, standing, handoff, and rest anchors
- [x] Reception chair seat constraint and foreground occlusion
- [x] Camera-matched high-angle seated rigs
- [x] Shared seated, standing, and walking scale continuity
- [x] Furniture collision checks
- [x] Compact state markers
- [x] Phase-bound dialogue
- [x] Native visual and regression validation

final result: passed

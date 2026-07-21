# Digital Employee Office · Unity vertical slice

Unity 6.3 LTS office experience used to validate the mobile product's core 3D
interaction before iOS embedding.

## Implemented experience

- Portrait, front-facing high orthographic camera with the office centered.
- Work, meeting, and lounge zones built from licensed production assets.
- Two selectable humanoid employees: Lin (core employee) and Mia (secretary).
- Humanoid idle and walk animation driven by employee state.
- User-driven state flow: idle, assigned, walking, working, break, and reporting.
- UI Toolkit overlay with company status, employee cards, task composer, and dock.
- Task submission sends the selected employee to the correct workplace and changes
  status only after the destination is reached.
- A deterministic `--office-qa` path that exercises the real task composer and
  verifies assigned -> walking -> working.

This slice does not call an AI model, calculate revenue, or persist employee state.
Those services will feed the existing `EmployeeVisualIntent` projection contract.

## Open and preview

1. Open this folder with Unity `6000.3.20f1`.
2. Open `Assets/Office/Scenes/OfficePoc.unity`.
3. Press Play.
4. Select an employee, open the task composer, enter a task, and submit it.

To recreate the scene, use `数字员工 > 重建办公室 PoC 场景`.

The checked macOS prototype is generated at `Build/OfficePrototype.app` and the
portrait acceptance captures are under `Preview/OfficeAcceptance*.png`.

## Verification

Rebuild and validate the generated scene from the repository root:

```sh
'/Applications/Unity/Hub/Editor/6000.3.20f1/Unity.app/Contents/MacOS/Unity' \
  --burst-disable-compilation \
  -batchmode -quit -accept-apiupdate \
  -projectPath "$PWD/apps/office-unity" \
  -executeMethod DigitalEmployee.Office.Editor.OfficeSceneBuilder.BuildAndValidate \
  -logFile -
```

Run the UI-path smoke test after building:

```sh
'apps/office-unity/Build/OfficePrototype.app/Contents/MacOS/数字员工办公室' \
  --office-qa -screen-fullscreen 0 -screen-width 390 -screen-height 844 \
  -logFile /tmp/digital-employee-office-ui-path-qa.log
```

The expected terminal marker is:

`OFFICE_QA_PASSED: assigned -> walking -> working`

## Asset attribution

Furniture comes from Kenney's Furniture Kit. Character meshes and textures come
from Quaternius Universal Base Characters. Idle and walk clips come from Unity
Starter Assets. License texts and source links are recorded in
`THIRD_PARTY_NOTICES.md` and alongside the imported files.

## Current boundary

The functional interaction slice is complete. The visual result is intentionally
stylized and is not yet a photorealistic match for the approved reference image.
Production-quality environment art, tailored clothing, facial expression, a larger
employee roster, NavMesh routing, the React Native bridge, and iOS
Unity-as-a-Library export remain subsequent milestones.

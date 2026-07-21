using System;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;
using UnityEngine.SceneManagement;
using UnityEngine.UIElements;

namespace DigitalEmployee.Office.Editor
{
    public static class OfficeSceneBuilder
    {
        public const string ScenePath = "Assets/Office/Scenes/OfficePoc.unity";

        [MenuItem("数字员工/重建办公室 PoC 场景")]
        public static void Build()
        {
            OfficeProjectConfigurator.Configure();
            OfficeProjectConfigurator.EnsureFolder("Assets/Office/Scenes");

            Scene scene = EditorSceneManager.NewScene(
                NewSceneSetup.EmptyScene,
                NewSceneMode.Single);

            GameObject root = new("Office Runtime");
            root.AddComponent<OfficeRuntimeBootstrap>();

            OfficeLayout layout = OfficeEnvironmentBuilder.Build(root.transform);
            Transform characters = OfficeAssetFactory
                .CreateEmpty("Characters", root.transform, Vector3.zero)
                .transform;

            EmployeeVisualController coreEmployee = OfficeEmployeeFactory.Create(
                characters,
                "employee-core-lin",
                "林策",
                "策略负责人",
                layout.CoreHome,
                new Color(0.14f, 0.36f, 0.55f),
                new Color(0.11f, 0.08f, 0.06f));

            EmployeeVisualController secretary = OfficeEmployeeFactory.Create(
                characters,
                "employee-secretary-mia",
                "小岚",
                "老板秘书",
                layout.SecretaryHome,
                new Color(0.55f, 0.28f, 0.46f),
                new Color(0.24f, 0.13f, 0.08f));

            GameObject demoObject = new("Office Task Flow");
            demoObject.transform.SetParent(root.transform, false);
            OfficeDemoDirector demoDirector = demoObject.AddComponent<OfficeDemoDirector>();
            demoDirector.Configure(
                coreEmployee,
                secretary,
                layout.CoreHome,
                layout.CoreDesk,
                layout.ReportPoint,
                layout.BreakPoint,
                layout.SecretaryHome,
                layout.SecretaryDesk);

            GameObject interactionObject = new("Employee Focus Interaction");
            interactionObject.transform.SetParent(root.transform, false);
            OfficeInteractionController interaction =
                interactionObject.AddComponent<OfficeInteractionController>();
            interaction.Configure(layout.Camera, null);

            GameObject overlayObject = new("Office Experience UI");
            overlayObject.transform.SetParent(root.transform, false);
            UIDocument document = overlayObject.AddComponent<UIDocument>();
            document.panelSettings = BuildPanelSettings();
            document.visualTreeAsset = AssetDatabase.LoadAssetAtPath<VisualTreeAsset>(
                "Assets/Office/UI/OfficeExperience.uxml");
            if (document.visualTreeAsset == null)
            {
                throw new BuildFailedException("OfficeExperience.uxml could not be loaded.");
            }

            OfficeExperienceOverlay overlay = overlayObject.AddComponent<OfficeExperienceOverlay>();
            overlay.Configure(
                demoDirector,
                interaction,
                layout.Camera,
                coreEmployee,
                secretary);

            OfficeTaskFlowQaRunner qaRunner = root.AddComponent<OfficeTaskFlowQaRunner>();
            qaRunner.Configure(demoDirector, interaction, overlay);

            EditorSceneManager.MarkSceneDirty(scene);
            if (!EditorSceneManager.SaveScene(scene, ScenePath))
            {
                throw new BuildFailedException("Failed to save the office PoC scene.");
            }

            EditorBuildSettings.scenes = new[]
            {
                new EditorBuildSettingsScene(ScenePath, true),
            };

            Selection.activeGameObject = root;
            AssetDatabase.SaveAssets();
            Debug.Log("Office PoC scene generated at " + ScenePath);
        }

        [MenuItem("数字员工/验证办公室 PoC")]
        public static void Validate()
        {
            if (AssetDatabase.LoadAssetAtPath<SceneAsset>(ScenePath) == null)
            {
                throw new BuildFailedException("Office scene asset is missing: " + ScenePath);
            }

            Scene scene = EditorSceneManager.OpenScene(ScenePath, OpenSceneMode.Single);
            if (!scene.IsValid())
            {
                throw new BuildFailedException("Office scene could not be opened.");
            }

            if (GraphicsSettings.defaultRenderPipeline is not UniversalRenderPipelineAsset)
            {
                throw new BuildFailedException("The project is not using URP.");
            }

            Camera camera = Camera.main;
            if (camera == null || !camera.orthographic)
            {
                throw new BuildFailedException("The locked orthographic office camera is missing.");
            }

            if (camera.GetComponent<OfficeCameraFramer>() == null)
            {
                throw new BuildFailedException("The mobile safe-frame camera component is missing.");
            }

            EmployeeVisualController[] employees =
                UnityEngine.Object.FindObjectsByType<EmployeeVisualController>(FindObjectsSortMode.None);
            if (employees.Length != 2)
            {
                throw new BuildFailedException(
                    "Expected two PoC employees, found " + employees.Length + ".");
            }

            RequireSingleComponent<OfficeRuntimeBootstrap>();
            RequireSingleComponent<OfficeDemoDirector>();
            RequireSingleComponent<OfficeInteractionController>();
            RequireSingleComponent<OfficeExperienceOverlay>();
            RequireSingleComponent<OfficeTaskFlowQaRunner>();
            ValidateIntentOrdering();

            Debug.Log(
                "Office PoC validation passed: URP, orthographic camera, " +
                "two employees, user-driven task flow, interaction, and sequence guard are present.");
        }

        public static void BuildAndValidate()
        {
            Build();
            Validate();
        }

        private static PanelSettings BuildPanelSettings()
        {
            const string panelPath = "Assets/Office/Generated/OfficePanelSettings.asset";
            PanelSettings panel = AssetDatabase.LoadAssetAtPath<PanelSettings>(panelPath);
            if (panel == null)
            {
                panel = ScriptableObject.CreateInstance<PanelSettings>();
                panel.name = "OfficePanelSettings";
                AssetDatabase.CreateAsset(panel, panelPath);
            }

            panel.scaleMode = PanelScaleMode.ScaleWithScreenSize;
            panel.referenceResolution = new Vector2Int(390, 844);
            panel.screenMatchMode = PanelScreenMatchMode.MatchWidthOrHeight;
            panel.match = 0.5f;
            panel.sortingOrder = 100;
            EditorUtility.SetDirty(panel);
            return panel;
        }

        private static void RequireSingleComponent<T>() where T : Component
        {
            T[] components = UnityEngine.Object.FindObjectsByType<T>(FindObjectsSortMode.None);
            if (components.Length != 1)
            {
                throw new BuildFailedException(
                    "Expected one " + typeof(T).Name + ", found " + components.Length + ".");
            }
        }

        private static void ValidateIntentOrdering()
        {
            VisualIntentSequenceGate gate = new("validation-employee");
            EmployeeVisualIntent newest = new(
                "validation-employee",
                10,
                EmployeeVisualState.Working,
                Vector3.zero);
            EmployeeVisualIntent stale = new(
                "validation-employee",
                9,
                EmployeeVisualState.Idle,
                Vector3.zero);
            EmployeeVisualIntent wrongEmployee = new(
                "someone-else",
                11,
                EmployeeVisualState.Working,
                Vector3.zero);

            if (!gate.TryAccept(newest) || gate.TryAccept(stale) || gate.TryAccept(wrongEmployee))
            {
                throw new BuildFailedException("Visual intent sequence guard is invalid.");
            }
        }
    }
}

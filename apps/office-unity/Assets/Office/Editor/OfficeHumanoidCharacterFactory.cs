using System;
using System.Linq;
using UnityEditor;
using UnityEditor.Animations;
using UnityEngine;
using UnityEngine.Rendering;

namespace DigitalEmployee.Office.Editor
{
    internal sealed class OfficeCharacterVisual
    {
        public Transform Root { get; set; }
        public Transform ReportAnchor { get; set; }
        public Animator[] Animators { get; set; }
    }

    internal static class OfficeHumanoidCharacterFactory
    {
        private const string CharacterRoot =
            "Assets/Office/ThirdParty/Quaternius/UniversalBaseCharacters/";
        private const string GeneratedControllerPath =
            "Assets/Office/Generated/OfficeEmployeeAnimator.controller";
        private const float TargetHeight = 2.18f;

        public static OfficeCharacterVisual Create(
            Transform parent,
            string employeeId,
            bool isFemale,
            Color outfitColor,
            Color hairTint)
        {
            string bodyName = isFemale
                ? "Superhero_Female_FullBody"
                : "Superhero_Male_FullBody";
            string hairName = isFemale ? "Hair_Buns" : "Hair_SimpleParted";
            GameObject body = InstantiateModel(bodyName, parent);
            GameObject hair = InstantiateModel(hairName, parent);

            body.name = "HumanoidBody";
            hair.name = "HumanoidHair";
            body.transform.localPosition = Vector3.zero;
            hair.transform.localPosition = Vector3.zero;
            body.transform.localRotation = Quaternion.identity;
            hair.transform.localRotation = Quaternion.identity;

            float scale = NormalizeHeight(body, TargetHeight);
            hair.transform.localScale = Vector3.one * scale;
            AlignBottom(body, parent.position.y);
            hair.transform.localPosition = body.transform.localPosition;

            ApplyBodyMaterials(body, employeeId, isFemale, hairTint);
            ApplyHairMaterial(hair, employeeId, isFemale, hairTint);
            OfficeCharacterClothingFactory.Apply(body, employeeId, outfitColor);
            ConfigureRenderers(body);
            ConfigureRenderers(hair);
            RemoveColliders(body);
            RemoveColliders(hair);

            RuntimeAnimatorController controller = GetAnimatorController();
            Animator bodyAnimator = ConfigureAnimator(body, controller);
            Animator hairAnimator = ConfigureAnimator(hair, controller);
            Transform reportAnchor = bodyAnimator != null && bodyAnimator.isHuman
                ? bodyAnimator.GetBoneTransform(HumanBodyBones.RightHand)
                : parent;

            return new OfficeCharacterVisual
            {
                Root = parent,
                ReportAnchor = reportAnchor,
                Animators = new[] { bodyAnimator, hairAnimator }
                    .Where(animator => animator != null && animator.avatar != null)
                    .ToArray(),
            };
        }

        private static GameObject InstantiateModel(string assetName, Transform parent)
        {
            string path = CharacterRoot + "Models/" + assetName + ".fbx";
            GameObject source = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (source == null)
            {
                throw new InvalidOperationException("Missing character model: " + path);
            }

            GameObject instance = PrefabUtility.InstantiatePrefab(source) as GameObject;
            if (instance == null)
            {
                throw new InvalidOperationException("Unable to instantiate character model: " + path);
            }

            instance.transform.SetParent(parent, false);
            return instance;
        }

        private static float NormalizeHeight(GameObject body, float targetHeight)
        {
            Bounds bounds = CalculateBounds(body);
            if (bounds.size.y <= 0.001f)
            {
                return 1f;
            }

            float scale = targetHeight / bounds.size.y;
            body.transform.localScale = Vector3.one * scale;
            return scale;
        }

        private static void AlignBottom(GameObject body, float targetY)
        {
            Bounds bounds = CalculateBounds(body);
            body.transform.position += Vector3.up * (targetY - bounds.min.y);
        }

        private static Bounds CalculateBounds(GameObject instance)
        {
            Renderer[] renderers = instance.GetComponentsInChildren<Renderer>(true);
            if (renderers.Length == 0)
            {
                return new Bounds(instance.transform.position, Vector3.one);
            }

            Bounds bounds = renderers[0].bounds;
            for (int index = 1; index < renderers.Length; index++)
            {
                bounds.Encapsulate(renderers[index].bounds);
            }

            return bounds;
        }

        private static void ApplyBodyMaterials(
            GameObject body,
            string employeeId,
            bool isFemale,
            Color hairTint)
        {
            string bodyTextureName = isFemale
                ? "T_Superhero_Female_Light_BaseColor"
                : "T_Superhero_Male_Ligh";
            Texture2D bodyTexture = LoadTexture(bodyTextureName);
            Texture2D eyeTexture = LoadTexture("T_Eye_Brown");
            Material bodyMaterial = OfficeAssetFactory.GetMaterial(
                "QuaterniusBody_" + employeeId, Color.white, 0.32f, 0f, bodyTexture);
            Material eyeMaterial = OfficeAssetFactory.GetMaterial(
                "QuaterniusEyes", Color.white, 0.5f, 0f, eyeTexture);
            Material browMaterial = OfficeAssetFactory.GetMaterial(
                "QuaterniusBrows_" + employeeId, hairTint, 0.24f);

            foreach (Renderer renderer in body.GetComponentsInChildren<Renderer>(true))
            {
                string rendererName = renderer.name.ToLowerInvariant();
                Material material = rendererName.Contains("eye")
                    ? eyeMaterial
                    : rendererName.Contains("brow")
                        ? browMaterial
                        : bodyMaterial;
                renderer.sharedMaterials = Enumerable
                    .Repeat(material, Math.Max(1, renderer.sharedMaterials.Length))
                    .ToArray();
            }
        }

        private static void ApplyHairMaterial(
            GameObject hair,
            string employeeId,
            bool isFemale,
            Color hairTint)
        {
            Texture2D texture = LoadTexture(isFemale
                ? "T_Hair_2_BaseColor"
                : "T_Hair_1_BaseColor");
            Color tint = Color.Lerp(Color.white, hairTint, 0.28f);
            Material material = OfficeAssetFactory.GetMaterial(
                "QuaterniusHair_" + employeeId, tint, 0.28f, 0f, texture);

            foreach (Renderer renderer in hair.GetComponentsInChildren<Renderer>(true))
            {
                renderer.sharedMaterials = Enumerable
                    .Repeat(material, Math.Max(1, renderer.sharedMaterials.Length))
                    .ToArray();
            }
        }

        private static Texture2D LoadTexture(string textureName)
        {
            string path = CharacterRoot + "Textures/" + textureName + ".png";
            Texture2D texture = AssetDatabase.LoadAssetAtPath<Texture2D>(path);
            if (texture == null)
            {
                throw new InvalidOperationException("Missing character texture: " + path);
            }

            return texture;
        }

        private static void ConfigureRenderers(GameObject instance)
        {
            foreach (Renderer renderer in instance.GetComponentsInChildren<Renderer>(true))
            {
                renderer.shadowCastingMode = ShadowCastingMode.On;
                renderer.receiveShadows = true;
            }
        }

        private static void RemoveColliders(GameObject instance)
        {
            foreach (Collider collider in instance.GetComponentsInChildren<Collider>(true))
            {
                UnityEngine.Object.DestroyImmediate(collider);
            }
        }

        private static Animator ConfigureAnimator(
            GameObject instance,
            RuntimeAnimatorController controller)
        {
            Animator animator = instance.GetComponent<Animator>();
            if (animator == null)
            {
                return null;
            }

            animator.runtimeAnimatorController = controller;
            animator.applyRootMotion = false;
            animator.cullingMode = AnimatorCullingMode.CullUpdateTransforms;
            return animator;
        }

        private static RuntimeAnimatorController GetAnimatorController()
        {
            AnimatorController controller =
                AssetDatabase.LoadAssetAtPath<AnimatorController>(GeneratedControllerPath);
            if (controller == null)
            {
                controller = AnimatorController.CreateAnimatorControllerAtPath(
                    GeneratedControllerPath);
            }

            AnimationClip idle = LoadAnimationClip(
                CharacterRoot + "Animations/Stand--Idle.anim.fbx");
            AnimationClip walk = LoadAnimationClip(
                CharacterRoot + "Animations/Locomotion--Walk_N.anim.fbx");
            AnimatorStateMachine stateMachine = controller.layers[0].stateMachine;
            AnimatorState idleState = GetOrAddState(stateMachine, "Idle");
            idleState.motion = idle;
            stateMachine.defaultState = idleState;
            GetOrAddState(stateMachine, "Assigned").motion = idle;
            GetOrAddState(stateMachine, "Walking").motion = walk;
            GetOrAddState(stateMachine, "Working").motion = idle;
            GetOrAddState(stateMachine, "Break").motion = idle;
            GetOrAddState(stateMachine, "Reporting").motion = idle;
            EditorUtility.SetDirty(controller);
            return controller;
        }

        private static AnimationClip LoadAnimationClip(string path)
        {
            AnimationClip clip = AssetDatabase.LoadAllAssetsAtPath(path)
                .OfType<AnimationClip>()
                .FirstOrDefault(candidate => !candidate.name.StartsWith("__preview__"));
            if (clip == null)
            {
                throw new InvalidOperationException("Missing animation clip: " + path);
            }

            return clip;
        }

        private static AnimatorState GetOrAddState(
            AnimatorStateMachine stateMachine,
            string name)
        {
            foreach (ChildAnimatorState childState in stateMachine.states)
            {
                if (childState.state.name == name)
                {
                    return childState.state;
                }
            }

            return stateMachine.AddState(name);
        }
    }
}

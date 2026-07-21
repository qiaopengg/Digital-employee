using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeAssetFactory
    {
        private const string MaterialFolder = "Assets/Office/Generated/Materials";

        public static Material GetMaterial(
            string assetName,
            Color color,
            float smoothness = 0.2f,
            float metallic = 0f,
            Texture mainTexture = null)
        {
            OfficeProjectConfigurator.EnsureFolder(MaterialFolder);
            string path = MaterialFolder + "/" + assetName + ".mat";
            Material material = AssetDatabase.LoadAssetAtPath<Material>(path);
            Shader shader = Shader.Find("Universal Render Pipeline/Lit");
            if (shader == null)
            {
                throw new System.InvalidOperationException("URP Lit shader is unavailable.");
            }

            if (material == null)
            {
                material = new Material(shader)
                {
                    name = assetName,
                    enableInstancing = true,
                };
                AssetDatabase.CreateAsset(material, path);
            }
            else if (material.shader != shader)
            {
                material.shader = shader;
            }

            material.SetColor("_BaseColor", color);
            material.SetColor("_Color", color);
            material.SetFloat("_Smoothness", smoothness);
            material.SetFloat("_Metallic", metallic);
            material.SetFloat("_Smoothness", smoothness);
            material.SetTexture("_BaseMap", mainTexture);
            material.SetTexture("_MainTex", mainTexture);
            material.DisableKeyword("_EMISSION");
            EditorUtility.SetDirty(material);
            return material;
        }

        public static GameObject CreatePrimitive(
            PrimitiveType type,
            string name,
            Transform parent,
            Vector3 localPosition,
            Vector3 localScale,
            Material material,
            Vector3? localEulerAngles = null)
        {
            GameObject instance = GameObject.CreatePrimitive(type);
            instance.name = name;
            instance.transform.SetParent(parent, false);
            instance.transform.localPosition = localPosition;
            instance.transform.localScale = localScale;
            instance.transform.localEulerAngles = localEulerAngles ?? Vector3.zero;

            Collider collider = instance.GetComponent<Collider>();
            if (collider != null)
            {
                Object.DestroyImmediate(collider);
            }

            if (material != null)
            {
                Renderer renderer = instance.GetComponent<Renderer>();
                renderer.sharedMaterial = material;
                renderer.shadowCastingMode = ShadowCastingMode.On;
                renderer.receiveShadows = true;
            }

            return instance;
        }

        public static GameObject CreateEmpty(string name, Transform parent, Vector3 localPosition)
        {
            GameObject instance = new(name);
            instance.transform.SetParent(parent, false);
            instance.transform.localPosition = localPosition;
            return instance;
        }
    }
}

using System;
using UnityEditor;
using UnityEngine;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeModelFactory
    {
        private const string FurnitureRoot =
            "Assets/Office/ThirdParty/Kenney/Furniture/";

        public static GameObject CreateFurniture(
            string assetName,
            Transform parent,
            Vector3 position,
            Vector3 eulerAngles,
            Vector3 scale)
        {
            string path = FurnitureRoot + assetName + ".fbx";
            GameObject source = AssetDatabase.LoadAssetAtPath<GameObject>(path);
            if (source == null)
            {
                throw new InvalidOperationException("Missing office model: " + path);
            }

            GameObject instance = PrefabUtility.InstantiatePrefab(source) as GameObject;
            if (instance == null)
            {
                throw new InvalidOperationException("Unable to instantiate office model: " + path);
            }

            instance.name = assetName;
            instance.transform.SetParent(parent, false);
            instance.transform.localPosition = position;
            instance.transform.localEulerAngles = eulerAngles;
            // Normalize the pack's authoring units once so office placement
            // values remain readable Unity-metre measurements.
            instance.transform.localScale = scale * 0.25f;
            UpgradeMaterials(instance, assetName);
            return instance;
        }

        private static void UpgradeMaterials(GameObject instance, string assetName)
        {
            foreach (Renderer renderer in instance.GetComponentsInChildren<Renderer>(true))
            {
                Material[] sourceMaterials = renderer.sharedMaterials;
                Material[] upgraded = new Material[sourceMaterials.Length];
                for (int index = 0; index < sourceMaterials.Length; index++)
                {
                    Material source = sourceMaterials[index];
                    if (source == null)
                    {
                        continue;
                    }

                    Color color = ReadColor(source);
                    string materialName = Sanitize(assetName + "_" + source.name);
                    upgraded[index] = OfficeAssetFactory.GetMaterial(
                        "Kenney_" + materialName,
                        color,
                        0.24f,
                        0f,
                        source.mainTexture);
                }

                renderer.sharedMaterials = upgraded;
            }
        }

        private static Color ReadColor(Material source)
        {
            if (source.HasProperty("_BaseColor"))
            {
                return source.GetColor("_BaseColor");
            }

            if (source.HasProperty("_Color"))
            {
                return source.GetColor("_Color");
            }

            return Color.white;
        }

        private static string Sanitize(string value)
        {
            foreach (char invalidCharacter in System.IO.Path.GetInvalidFileNameChars())
            {
                value = value.Replace(invalidCharacter, '_');
            }

            return value.Replace('/', '_').Replace(' ', '_');
        }
    }
}

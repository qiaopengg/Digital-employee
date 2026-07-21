using System;
using System.Linq;
using UnityEditor;
using UnityEngine;
using UnityEngine.Rendering;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeCharacterClothingFactory
    {
        public static void Apply(GameObject body, string employeeId, Color shirtColor)
        {
            Shader shader = Shader.Find("DigitalEmployee/OfficeHumanoidClothing");
            if (shader == null)
            {
                throw new InvalidOperationException("Office clothing shader is unavailable.");
            }

            Material material = GetOrCreateMaterial(shader, employeeId);
            material.SetColor("_ShirtColor", shirtColor);
            material.SetColor("_PantsColor", new Color(0.10f, 0.13f, 0.18f));
            material.SetColor("_ShoeColor", new Color(0.035f, 0.04f, 0.055f));
            material.SetFloat("_GarmentMinY", 0.02f);
            material.SetFloat("_ShoeEndY", 0.2f);
            material.SetFloat("_ShirtStartY", 0.88f);
            material.SetFloat("_GarmentMaxY", 1.86f);
            material.SetFloat("_SurfaceOffset", 0.012f);
            EditorUtility.SetDirty(material);

            foreach (SkinnedMeshRenderer source in
                body.GetComponentsInChildren<SkinnedMeshRenderer>(true))
            {
                if (!source.name.ToLowerInvariant().Contains("superhero"))
                {
                    continue;
                }

                CreateGarmentRenderer(source, material);
            }
        }

        private static Material GetOrCreateMaterial(Shader shader, string employeeId)
        {
            string path = "Assets/Office/Generated/Materials/OfficeClothing_" +
                employeeId + ".mat";
            Material material = AssetDatabase.LoadAssetAtPath<Material>(path);
            if (material == null)
            {
                material = new Material(shader)
                {
                    name = "OfficeClothing_" + employeeId,
                    enableInstancing = true,
                };
                AssetDatabase.CreateAsset(material, path);
            }
            else
            {
                material.shader = shader;
            }

            return material;
        }

        private static void CreateGarmentRenderer(
            SkinnedMeshRenderer source,
            Material material)
        {
            GameObject garmentObject = new("OfficeClothing");
            garmentObject.transform.SetParent(source.transform.parent, false);
            garmentObject.transform.localPosition = source.transform.localPosition;
            garmentObject.transform.localRotation = source.transform.localRotation;
            garmentObject.transform.localScale = source.transform.localScale;

            SkinnedMeshRenderer garment = garmentObject.AddComponent<SkinnedMeshRenderer>();
            garment.sharedMesh = source.sharedMesh;
            garment.rootBone = source.rootBone;
            garment.bones = source.bones;
            garment.localBounds = source.localBounds;
            garment.updateWhenOffscreen = source.updateWhenOffscreen;
            garment.shadowCastingMode = ShadowCastingMode.Off;
            garment.receiveShadows = true;
            garment.sharedMaterials = Enumerable
                .Repeat(material, Math.Max(1, source.sharedMaterials.Length))
                .ToArray();
        }
    }
}

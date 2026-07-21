using UnityEditor;
using UnityEditor.Build;
using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeProjectConfigurator
    {
        private const string GeneratedFolder = "Assets/Office/Generated";
        private const string RendererAssetPath = GeneratedFolder + "/OfficeForwardRenderer.asset";
        private const string PipelineAssetPath = GeneratedFolder + "/OfficeMobilePipeline.asset";

        public static UniversalRenderPipelineAsset Configure()
        {
            EnsureFolder(GeneratedFolder);

            UniversalRendererData rendererData =
                AssetDatabase.LoadAssetAtPath<UniversalRendererData>(RendererAssetPath);
            if (rendererData == null)
            {
                rendererData = ScriptableObject.CreateInstance<UniversalRendererData>();
                rendererData.name = "Office Forward Renderer";
                AssetDatabase.CreateAsset(rendererData, RendererAssetPath);
            }

            UniversalRenderPipelineAsset pipeline =
                AssetDatabase.LoadAssetAtPath<UniversalRenderPipelineAsset>(PipelineAssetPath);
            if (pipeline == null)
            {
                pipeline = UniversalRenderPipelineAsset.Create(rendererData);
                pipeline.name = "Office Mobile Pipeline";
                AssetDatabase.CreateAsset(pipeline, PipelineAssetPath);
            }

            pipeline.supportsHDR = false;
            pipeline.supportsCameraDepthTexture = false;
            pipeline.supportsCameraOpaqueTexture = false;
            pipeline.msaaSampleCount = 4;
            pipeline.renderScale = 1f;
            pipeline.shadowDistance = 22f;

            GraphicsSettings.defaultRenderPipeline = pipeline;
            QualitySettings.renderPipeline = pipeline;
            QualitySettings.vSyncCount = 0;
            PlayerSettings.colorSpace = ColorSpace.Linear;
            PlayerSettings.companyName = "Digital Employee Studio";
            PlayerSettings.productName = "Digital Employee Office";
            PlayerSettings.defaultInterfaceOrientation = UIOrientation.Portrait;
            PlayerSettings.SetScriptingBackend(NamedBuildTarget.iOS, ScriptingImplementation.IL2CPP);

            EditorUtility.SetDirty(rendererData);
            EditorUtility.SetDirty(pipeline);
            AssetDatabase.SaveAssets();
            return pipeline;
        }

        public static void EnsureFolder(string assetPath)
        {
            if (AssetDatabase.IsValidFolder(assetPath))
            {
                return;
            }

            int slashIndex = assetPath.LastIndexOf('/');
            string parent = assetPath.Substring(0, slashIndex);
            string child = assetPath.Substring(slashIndex + 1);
            EnsureFolder(parent);
            AssetDatabase.CreateFolder(parent, child);
        }
    }
}

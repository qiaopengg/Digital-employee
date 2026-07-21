using System.IO;
using UnityEditor;
using UnityEditor.Build;
using UnityEditor.SceneManagement;
using UnityEngine;
using UnityEngine.Rendering;

namespace DigitalEmployee.Office.Editor
{
    public static class OfficePreviewCapture
    {
        private const int PreviewWidth = 768;
        private const int PreviewHeight = 1664;

        [MenuItem("数字员工/导出办公室竖屏预览")]
        public static void Capture()
        {
            OfficeSceneBuilder.Validate();
            EditorSceneManager.OpenScene(OfficeSceneBuilder.ScenePath, OpenSceneMode.Single);

            Camera camera = Camera.main;
            if (camera == null)
            {
                throw new BuildFailedException("Cannot capture preview without the office camera.");
            }

            OfficeCameraFramer framer = camera.GetComponent<OfficeCameraFramer>();
            framer.Reframe((float)PreviewWidth / PreviewHeight);

            RenderTexture target = new(
                PreviewWidth,
                PreviewHeight,
                24,
                RenderTextureFormat.ARGB32,
                RenderTextureReadWrite.sRGB);
            target.Create();

            RenderPipeline.StandardRequest request = new()
            {
                destination = target,
                mipLevel = 0,
                slice = 0,
                face = CubemapFace.Unknown,
            };
            RenderPipeline.SubmitRenderRequest(camera, request);

            RenderTexture previous = RenderTexture.active;
            RenderTexture.active = target;
            Texture2D texture = new(PreviewWidth, PreviewHeight, TextureFormat.RGB24, false);
            texture.ReadPixels(new Rect(0f, 0f, PreviewWidth, PreviewHeight), 0, 0);
            texture.Apply();
            RenderTexture.active = previous;

            string previewDirectory = Path.GetFullPath(
                Path.Combine(Application.dataPath, "../Preview"));
            Directory.CreateDirectory(previewDirectory);
            string previewPath = Path.Combine(previewDirectory, "OfficePocPreview.png");
            File.WriteAllBytes(previewPath, texture.EncodeToPNG());

            Object.DestroyImmediate(texture);
            target.Release();
            Object.DestroyImmediate(target);
            Debug.Log("Office portrait preview captured at " + previewPath);
        }
    }
}

using System.IO;
using UnityEditor;
using UnityEditor.Build.Reporting;
using UnityEngine;

namespace DigitalEmployee.Office.Editor
{
    public static class OfficeStandaloneBuilder
    {
        public const string PrototypePath = "Build/OfficePrototype.app";

        [MenuItem("数字员工/构建 macOS 可交互体验包")]
        public static void Build()
        {
            OfficeSceneBuilder.Validate();

            PlayerSettings.fullScreenMode = FullScreenMode.Windowed;
            PlayerSettings.defaultScreenWidth = 390;
            PlayerSettings.defaultScreenHeight = 844;
            PlayerSettings.resizableWindow = false;
            PlayerSettings.runInBackground = true;
            PlayerSettings.productName = "数字员工办公室";

            string fullPath = Path.GetFullPath(
                Path.Combine(Application.dataPath, "..", PrototypePath));
            Directory.CreateDirectory(Path.GetDirectoryName(fullPath));

            BuildReport report = BuildPipeline.BuildPlayer(new BuildPlayerOptions
            {
                scenes = new[] { OfficeSceneBuilder.ScenePath },
                locationPathName = fullPath,
                target = BuildTarget.StandaloneOSX,
                options = BuildOptions.Development,
            });

            if (report.summary.result != BuildResult.Succeeded)
            {
                throw new System.InvalidOperationException(
                    "Office prototype build failed: " + report.summary.result);
            }

            Debug.Log(
                "Office macOS prototype built at " + fullPath +
                " (" + report.summary.totalSize + " bytes)");
        }
    }
}

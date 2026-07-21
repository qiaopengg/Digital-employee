using UnityEditor;

namespace DigitalEmployee.Office.Editor
{
    internal sealed class OfficeCharacterAssetPostprocessor : AssetPostprocessor
    {
        private const string CharacterRoot =
            "Assets/Office/ThirdParty/Quaternius/UniversalBaseCharacters/";

        private void OnPreprocessModel()
        {
            if (!assetPath.StartsWith(CharacterRoot, System.StringComparison.Ordinal))
            {
                return;
            }

            ModelImporter importer = (ModelImporter)assetImporter;
            importer.animationType = ModelImporterAnimationType.Human;
            importer.avatarSetup = ModelImporterAvatarSetup.CreateFromThisModel;
            importer.importBlendShapes = false;
            importer.importCameras = false;
            importer.importLights = false;
            importer.materialImportMode = ModelImporterMaterialImportMode.None;

            bool isAnimation = assetPath.Contains("/Animations/");
            importer.importAnimation = isAnimation;
            if (!isAnimation)
            {
                return;
            }

            ModelImporterClipAnimation[] clips = importer.defaultClipAnimations;
            foreach (ModelImporterClipAnimation clip in clips)
            {
                clip.loopTime = true;
                clip.loopPose = true;
            }

            importer.clipAnimations = clips;
        }
    }
}

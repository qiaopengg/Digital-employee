using UnityEngine;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeEmployeeFactory
    {
        public static EmployeeVisualController Create(
            Transform parent,
            string employeeId,
            string displayName,
            string roleName,
            Vector3 position,
            Color outfitColor,
            Color hairColor)
        {
            Material paper = OfficeAssetFactory.GetMaterial(
                "ReportFolder", new Color(0.94f, 0.75f, 0.25f), 0.22f);
            Material selection = OfficeAssetFactory.GetMaterial(
                "SelectionRing", new Color(0.22f, 0.63f, 0.96f), 0.45f, 0.05f);
            Material status = OfficeAssetFactory.GetMaterial(
                "StatusIndicator", new Color(0.62f, 0.67f, 0.74f), 0.5f);
            Material contactShadow = OfficeAssetFactory.GetMaterial(
                "CharacterContactShadow", new Color(0.19f, 0.22f, 0.24f), 0.08f);

            GameObject root = OfficeAssetFactory.CreateEmpty(displayName, parent, position);
            CapsuleCollider collider = root.AddComponent<CapsuleCollider>();
            collider.center = new Vector3(0f, 1.18f, 0f);
            collider.height = 2.4f;
            collider.radius = 0.5f;

            Transform visualRoot = OfficeAssetFactory
                .CreateEmpty("VisualRig", root.transform, Vector3.zero)
                .transform;
            bool isFemale = employeeId.Contains("secretary");
            OfficeCharacterVisual character = OfficeHumanoidCharacterFactory.Create(
                visualRoot, employeeId, isFemale, outfitColor, hairColor);

            GameObject folder = OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "ReportFolder", character.ReportAnchor,
                new Vector3(0.08f, 0.03f, 0.04f), new Vector3(0.2f, 0.035f, 0.28f), paper,
                new Vector3(8f, 22f, -74f));
            folder.SetActive(false);

            GameObject selectionRing = OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cylinder, "SelectionRing", root.transform,
                new Vector3(0f, 0.025f, 0f), new Vector3(0.7f, 0.025f, 0.7f), selection);
            selectionRing.SetActive(false);

            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Sphere, "ContactShadow", root.transform,
                new Vector3(0.08f, 0.018f, 0.12f), new Vector3(0.58f, 0.018f, 0.38f), contactShadow);

            GameObject indicatorObject = OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Sphere, "StatusIndicator", root.transform,
                new Vector3(0f, 2.78f, 0f), new Vector3(0.17f, 0.17f, 0.17f), status);
            Renderer indicator = indicatorObject.GetComponent<Renderer>();

            EmployeeVisualController controller = root.AddComponent<EmployeeVisualController>();
            controller.Configure(
                employeeId,
                displayName,
                roleName,
                character.Root,
                null,
                null,
                null,
                null,
                null,
                folder,
                selectionRing,
                indicator,
                character.Animators);
            return controller;
        }
    }
}

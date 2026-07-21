using UnityEngine;
using UnityEngine.Rendering;
using UnityEngine.Rendering.Universal;

namespace DigitalEmployee.Office.Editor
{
    internal static class OfficeEnvironmentBuilder
    {
        public static OfficeLayout Build(Transform sceneRoot)
        {
            Transform environment = OfficeAssetFactory
                .CreateEmpty("Environment", sceneRoot, Vector3.zero)
                .transform;

            Material floor = OfficeAssetFactory.GetMaterial(
                "FloorWarm", new Color(0.83f, 0.76f, 0.65f), 0.32f);
            Material wall = OfficeAssetFactory.GetMaterial(
                "WallIvory", new Color(0.95f, 0.94f, 0.89f), 0.2f);
            Material trim = OfficeAssetFactory.GetMaterial(
                "WoodHoney", new Color(0.49f, 0.29f, 0.15f), 0.32f);
            Material charcoal = OfficeAssetFactory.GetMaterial(
                "Charcoal", new Color(0.08f, 0.11f, 0.12f), 0.45f);
            Material glass = OfficeAssetFactory.GetMaterial(
                "GlassBlue", new Color(0.34f, 0.60f, 0.70f), 0.78f, 0.05f);

            CreateRoomShell(environment, floor, wall, trim, glass, charcoal);
            CreateWorkArea(environment);
            CreateMeetingArea(environment);
            CreateLoungeArea(environment);
            CreateDetails(environment);

            Camera camera = CreateCamera(sceneRoot);
            CreateLighting(sceneRoot);

            return new OfficeLayout
            {
                Camera = camera,
                CoreHome = new Vector3(-2.15f, 0f, -5.75f),
                CoreDesk = new Vector3(-1.7f, 0f, 2.72f),
                ReportPoint = new Vector3(-1.25f, 0f, -3.35f),
                BreakPoint = new Vector3(1.65f, 0f, -1.6f),
                SecretaryHome = new Vector3(2.15f, 0f, -5.75f),
                SecretaryDesk = new Vector3(1.7f, 0f, 2.72f),
            };
        }

        private static void CreateRoomShell(
            Transform parent,
            Material floor,
            Material wall,
            Material trim,
            Material glass,
            Material charcoal)
        {
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "Floor", parent,
                new Vector3(0f, -0.12f, 0f), new Vector3(7f, 0.24f, 14f), floor);
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "BackWall", parent,
                new Vector3(0f, 1.55f, 6.98f), new Vector3(7f, 3.1f, 0.16f), wall);
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "LeftWall", parent,
                new Vector3(-3.5f, 1.55f, 0f), new Vector3(0.16f, 3.1f, 14f), wall);
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "RightWall", parent,
                new Vector3(3.5f, 1.55f, 0f), new Vector3(0.16f, 3.1f, 14f), wall);

            CreateWindow(parent, -2.15f, glass, charcoal);
            CreateWindow(parent, 0f, glass, charcoal);
            CreateWindow(parent, 2.15f, glass, charcoal);

            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "FrontTrim", parent,
                new Vector3(0f, 0.03f, -6.98f), new Vector3(7f, 0.06f, 0.12f), trim);
        }

        private static void CreateWorkArea(Transform parent)
        {
            CreateDeskCluster(parent, new Vector3(-1.7f, 0f, 3.65f), 0f);
            CreateDeskCluster(parent, new Vector3(1.7f, 0f, 3.65f), 0f);
            OfficeModelFactory.CreateFurniture(
                "rugRectangle", parent, new Vector3(-2.85f, 0.015f, 3.45f),
                Vector3.zero, new Vector3(0.95f, 1f, 0.92f));
        }

        private static void CreateDeskCluster(Transform parent, Vector3 position, float yaw)
        {
            OfficeModelFactory.CreateFurniture(
                "desk", parent, position, new Vector3(0f, yaw, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "chairDesk", parent, position + new Vector3(0f, 0f, -0.92f),
                new Vector3(0f, 180f + yaw, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "computerScreen", parent, position + new Vector3(0f, 0.78f, 0.14f),
                new Vector3(0f, 180f + yaw, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "computerKeyboard", parent, position + new Vector3(0f, 0.78f, -0.22f),
                new Vector3(0f, yaw, 0f), Vector3.one);
        }

        private static void CreateMeetingArea(Transform parent)
        {
            Vector3 center = new(-1.35f, 0f, 0f);
            OfficeModelFactory.CreateFurniture(
                "tableRound", parent, center, Vector3.zero, new Vector3(0.92f, 1f, 0.92f));
            OfficeModelFactory.CreateFurniture(
                "chairRounded", parent, center + new Vector3(-1.05f, 0f, 0f),
                new Vector3(0f, 90f, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "chairRounded", parent, center + new Vector3(1.05f, 0f, 0f),
                new Vector3(0f, -90f, 0f), Vector3.one);
        }

        private static void CreateLoungeArea(Transform parent)
        {
            OfficeModelFactory.CreateFurniture(
                "loungeDesignSofa", parent, new Vector3(1.65f, 0f, -1.0f),
                new Vector3(0f, 180f, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "loungeDesignChair", parent, new Vector3(2.75f, 0f, -2.25f),
                new Vector3(0f, -90f, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "tableCoffee", parent, new Vector3(1.65f, 0f, -2.55f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "lampRoundFloor", parent, new Vector3(2.95f, 0f, -0.6f),
                Vector3.zero, Vector3.one);
        }

        private static void CreateDetails(Transform parent)
        {
            OfficeModelFactory.CreateFurniture(
                "bookcaseClosedWide", parent, new Vector3(-2.95f, 0f, 5.95f),
                new Vector3(0f, 90f, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "books", parent, new Vector3(-2.75f, 1.22f, 5.95f),
                new Vector3(0f, 90f, 0f), Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "pottedPlant", parent, new Vector3(2.95f, 0f, 5.95f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "plantSmall1", parent, new Vector3(-2.8f, 0f, -4.15f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "sideTable", parent, new Vector3(0f, 0f, -4.75f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "kitchenCoffeeMachine", parent, new Vector3(0f, 0.62f, -4.75f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "coatRackStanding", parent, new Vector3(2.95f, 0f, -4.65f),
                Vector3.zero, Vector3.one);
            OfficeModelFactory.CreateFurniture(
                "trashcan", parent, new Vector3(-2.9f, 0f, 1.85f),
                Vector3.zero, Vector3.one);
        }

        private static Camera CreateCamera(Transform parent)
        {
            GameObject cameraObject = new("Office Camera");
            cameraObject.tag = "MainCamera";
            cameraObject.transform.SetParent(parent, false);
            cameraObject.transform.position = new Vector3(0f, 14.8f, -16.2f);
            cameraObject.transform.LookAt(new Vector3(0f, 0.65f, 0.25f));

            Camera camera = cameraObject.AddComponent<Camera>();
            camera.orthographic = true;
            camera.nearClipPlane = 0.1f;
            camera.farClipPlane = 50f;
            camera.clearFlags = CameraClearFlags.SolidColor;
            camera.backgroundColor = new Color(0.76f, 0.82f, 0.83f);

            UniversalAdditionalCameraData cameraData =
                cameraObject.AddComponent<UniversalAdditionalCameraData>();
            cameraData.renderPostProcessing = false;
            cameraData.antialiasing = AntialiasingMode.FastApproximateAntialiasing;

            OfficeCameraFramer framer = cameraObject.AddComponent<OfficeCameraFramer>();
            framer.Configure(
                new Bounds(Vector3.up * 1.45f, new Vector3(7.3f, 3.2f, 14.2f)),
                0.90f,
                0.82f);
            return camera;
        }

        private static void CreateLighting(Transform parent)
        {
            GameObject lightObject = new("Sun Light");
            lightObject.transform.SetParent(parent, false);
            lightObject.transform.rotation = Quaternion.Euler(48f, -34f, 0f);

            Light light = lightObject.AddComponent<Light>();
            light.type = LightType.Directional;
            light.color = new Color(1f, 0.96f, 0.89f);
            light.lightUnit = LightUnit.Lux;
            light.intensity = 1.25f;
            light.shadows = LightShadows.Soft;
            light.shadowStrength = 0.36f;

            RenderSettings.ambientMode = AmbientMode.Flat;
            RenderSettings.ambientLight = new Color(0.52f, 0.55f, 0.55f);
            RenderSettings.ambientIntensity = 1f;
            RenderSettings.sun = light;
        }

        private static void CreateWindow(
            Transform parent,
            float x,
            Material glass,
            Material frame)
        {
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "WindowGlass", parent,
                new Vector3(x, 1.85f, 6.87f), new Vector3(1.75f, 1.65f, 0.05f), glass);
            OfficeAssetFactory.CreatePrimitive(
                PrimitiveType.Cube, "WindowFrame", parent,
                new Vector3(x, 1.85f, 6.81f), new Vector3(0.07f, 1.75f, 0.08f), frame);
        }
    }
}

using UnityEngine;

namespace DigitalEmployee.Office
{
    [ExecuteAlways]
    [RequireComponent(typeof(Camera))]
    public sealed class OfficeCameraFramer : MonoBehaviour
    {
        [SerializeField] private Bounds officeContentBounds =
            new(Vector3.up * 1.5f, new Vector3(7.4f, 3.2f, 14.2f));
        [SerializeField, Range(0.4f, 1f)] private float widthOccupancy = 0.72f;
        [SerializeField, Range(0.4f, 1f)] private float heightOccupancy = 0.62f;

        private Camera officeCamera;
        private int previousWidth;
        private int previousHeight;

        private void OnEnable()
        {
            officeCamera = GetComponent<Camera>();
            Reframe(CurrentAspect());
        }

        private void Update()
        {
            if (Screen.width == previousWidth && Screen.height == previousHeight)
            {
                return;
            }

            previousWidth = Screen.width;
            previousHeight = Screen.height;
            Reframe(CurrentAspect());
        }

        public void Configure(Bounds contentBounds, float targetWidthOccupancy, float targetHeightOccupancy)
        {
            officeContentBounds = contentBounds;
            widthOccupancy = targetWidthOccupancy;
            heightOccupancy = targetHeightOccupancy;
            officeCamera = GetComponent<Camera>();
            Reframe(CurrentAspect());
        }

        public void Reframe(float aspect)
        {
            officeCamera ??= GetComponent<Camera>();
            if (officeCamera == null || aspect <= 0f)
            {
                return;
            }

            Vector3 min = officeContentBounds.min;
            Vector3 max = officeContentBounds.max;
            float maxCameraX = 0f;
            float maxCameraY = 0f;

            for (int x = 0; x < 2; x++)
            {
                for (int y = 0; y < 2; y++)
                {
                    for (int z = 0; z < 2; z++)
                    {
                        Vector3 corner = new(
                            x == 0 ? min.x : max.x,
                            y == 0 ? min.y : max.y,
                            z == 0 ? min.z : max.z);
                        Vector3 cameraSpace = transform.InverseTransformPoint(corner);
                        maxCameraX = Mathf.Max(maxCameraX, Mathf.Abs(cameraSpace.x));
                        maxCameraY = Mathf.Max(maxCameraY, Mathf.Abs(cameraSpace.y));
                    }
                }
            }

            float verticalSize = maxCameraY / Mathf.Max(0.01f, heightOccupancy);
            float horizontalSize = maxCameraX /
                Mathf.Max(0.01f, aspect * widthOccupancy);
            officeCamera.orthographicSize = Mathf.Max(verticalSize, horizontalSize);
        }

        private float CurrentAspect()
        {
            if (officeCamera == null)
            {
                officeCamera = GetComponent<Camera>();
            }

            return officeCamera == null ? 1f : officeCamera.aspect;
        }
    }
}

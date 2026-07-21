using UnityEngine;

namespace DigitalEmployee.Office
{
    public sealed class OfficeRuntimeBootstrap : MonoBehaviour
    {
        [SerializeField, Range(30, 120)] private int targetFrameRate = 60;

        private void Awake()
        {
            Application.targetFrameRate = targetFrameRate;
        }

#if DEVELOPMENT_BUILD || UNITY_EDITOR
        private void Update()
        {
            if (Input.GetMouseButtonDown(0))
            {
                Debug.Log("Office pointer down at " + Input.mousePosition);
            }
        }
#endif
    }
}

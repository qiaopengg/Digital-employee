using System;
using UnityEngine;

namespace DigitalEmployee.Office
{
    public sealed class OfficeInteractionController : MonoBehaviour
    {
        [SerializeField] private Camera officeCamera;
        [SerializeField] private EmployeeVisualController initiallySelectedEmployee;

        public EmployeeVisualController SelectedEmployee { get; private set; }
        public event Action<EmployeeVisualController> SelectionChanged;

        private void Start()
        {
            Select(initiallySelectedEmployee);
        }

        private void Update()
        {
            if (TryGetPointerDown(out Vector2 screenPosition))
            {
                TrySelectAt(screenPosition);
            }
        }

        public void Configure(Camera camera, EmployeeVisualController initialSelection)
        {
            officeCamera = camera;
            initiallySelectedEmployee = initialSelection;
        }

        public void Select(EmployeeVisualController employee)
        {
            if (SelectedEmployee == employee)
            {
                return;
            }

            if (SelectedEmployee != null)
            {
                SelectedEmployee.SetSelected(false);
            }

            SelectedEmployee = employee;
            if (SelectedEmployee != null)
            {
                SelectedEmployee.SetSelected(true);
            }

            SelectionChanged?.Invoke(SelectedEmployee);
        }

        private void TrySelectAt(Vector2 screenPosition)
        {
            if (officeCamera == null)
            {
                return;
            }

            Ray ray = officeCamera.ScreenPointToRay(screenPosition);
            if (!Physics.Raycast(ray, out RaycastHit hit, 100f))
            {
                return;
            }

            EmployeeVisualController employee = hit.collider.GetComponentInParent<EmployeeVisualController>();
            if (employee != null)
            {
                Select(employee);
            }
        }

        private static bool TryGetPointerDown(out Vector2 position)
        {
            if (Input.touchCount > 0)
            {
                Touch touch = Input.GetTouch(0);
                position = touch.position;
                return touch.phase == TouchPhase.Began;
            }

            position = Input.mousePosition;
            return Input.GetMouseButtonDown(0);
        }
    }
}

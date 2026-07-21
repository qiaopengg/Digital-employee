using UnityEngine;

namespace DigitalEmployee.Office.Editor
{
    internal sealed class OfficeLayout
    {
        public Camera Camera { get; set; }
        public Vector3 CoreHome { get; set; }
        public Vector3 CoreDesk { get; set; }
        public Vector3 ReportPoint { get; set; }
        public Vector3 BreakPoint { get; set; }
        public Vector3 SecretaryHome { get; set; }
        public Vector3 SecretaryDesk { get; set; }
    }
}

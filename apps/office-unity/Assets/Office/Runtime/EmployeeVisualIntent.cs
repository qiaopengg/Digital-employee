using System;
using UnityEngine;

namespace DigitalEmployee.Office
{
    [Serializable]
    public struct EmployeeVisualIntent
    {
        public const int CurrentSchemaVersion = 1;

        [SerializeField] private int schemaVersion;
        [SerializeField] private string employeeId;
        [SerializeField] private long sequence;
        [SerializeField] private EmployeeVisualState state;
        [SerializeField] private Vector3 targetPosition;

        public int SchemaVersion => schemaVersion;
        public string EmployeeId => employeeId;
        public long Sequence => sequence;
        public EmployeeVisualState State => state;
        public Vector3 TargetPosition => targetPosition;

        public bool IsSupported => schemaVersion == CurrentSchemaVersion;

        public EmployeeVisualIntent(
            string employeeId,
            long sequence,
            EmployeeVisualState state,
            Vector3 targetPosition)
        {
            schemaVersion = CurrentSchemaVersion;
            this.employeeId = employeeId;
            this.sequence = sequence;
            this.state = state;
            this.targetPosition = targetPosition;
        }
    }
}

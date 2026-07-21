using System;

namespace DigitalEmployee.Office
{
    public sealed class VisualIntentSequenceGate
    {
        private readonly string employeeId;
        private long lastAcceptedSequence = long.MinValue;

        public long LastAcceptedSequence => lastAcceptedSequence;

        public VisualIntentSequenceGate(string employeeId)
        {
            this.employeeId = employeeId;
        }

        public bool TryAccept(EmployeeVisualIntent intent)
        {
            if (!intent.IsSupported || string.IsNullOrWhiteSpace(intent.EmployeeId))
            {
                return false;
            }

            if (!string.Equals(employeeId, intent.EmployeeId, StringComparison.Ordinal))
            {
                return false;
            }

            if (intent.Sequence <= lastAcceptedSequence)
            {
                return false;
            }

            lastAcceptedSequence = intent.Sequence;
            return true;
        }
    }
}

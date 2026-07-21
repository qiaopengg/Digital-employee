using System;
using System.Collections;
using UnityEngine;

namespace DigitalEmployee.Office
{
    public enum OfficeTaskFlowPhase
    {
        WaitingForTask,
        Assigned,
        WalkingToDesk,
        Working,
    }

    public sealed class OfficeDemoDirector : MonoBehaviour
    {
        [SerializeField] private EmployeeVisualController coreEmployee;
        [SerializeField] private EmployeeVisualController secretary;
        [SerializeField] private Vector3 coreHome;
        [SerializeField] private Vector3 coreDesk;
        [SerializeField] private Vector3 secretaryHome;
        [SerializeField] private Vector3 secretaryDesk;
        [SerializeField, Min(0.2f)] private float acceptanceBeatSeconds = 0.9f;

        private long coreSequence;
        private long secretarySequence;
        private Coroutine assignmentRoutine;
        private EmployeeVisualController assignedEmployee;

        public const string SourceLabel = "交互体验切片";
        public OfficeTaskFlowPhase Phase { get; private set; } = OfficeTaskFlowPhase.WaitingForTask;
        public string CurrentTaskTitle { get; private set; } = string.Empty;
        public string CurrentBeatLabel { get; private set; } = "点一名员工，看看谁现在有空";
        public EmployeeVisualController CoreEmployee => coreEmployee;
        public EmployeeVisualController Secretary => secretary;

        public event Action StateChanged;

        private void Start()
        {
            coreEmployee.DestinationReached += HandleDestinationReached;
            secretary.DestinationReached += HandleDestinationReached;
            Send(coreEmployee, EmployeeVisualState.Idle, coreHome);
            Send(secretary, EmployeeVisualState.Idle, secretaryHome);
            RaiseStateChanged();
        }

        private void OnDestroy()
        {
            if (coreEmployee != null)
            {
                coreEmployee.DestinationReached -= HandleDestinationReached;
            }

            if (secretary != null)
            {
                secretary.DestinationReached -= HandleDestinationReached;
            }
        }

        public void Configure(
            EmployeeVisualController primaryEmployee,
            EmployeeVisualController officeSecretary,
            Vector3 primaryHome,
            Vector3 primaryDesk,
            Vector3 reportingSpot,
            Vector3 loungeSpot,
            Vector3 officeSecretaryHome,
            Vector3 officeSecretaryDesk)
        {
            coreEmployee = primaryEmployee;
            secretary = officeSecretary;
            coreHome = primaryHome;
            coreDesk = primaryDesk;
            secretaryHome = officeSecretaryHome;
            secretaryDesk = officeSecretaryDesk;
        }

        public bool AssignTask(EmployeeVisualController employee, string taskTitle)
        {
            string normalizedTitle = taskTitle == null ? string.Empty : taskTitle.Trim();
            if (employee == null || normalizedTitle.Length == 0 || Phase != OfficeTaskFlowPhase.WaitingForTask)
            {
                return false;
            }

            assignedEmployee = employee;
            CurrentTaskTitle = normalizedTitle;
            if (assignmentRoutine != null)
            {
                StopCoroutine(assignmentRoutine);
            }

            assignmentRoutine = StartCoroutine(PlayAssignmentFlow());
            return true;
        }

        public string StatusFor(EmployeeVisualController employee)
        {
            if (employee == assignedEmployee && Phase != OfficeTaskFlowPhase.WaitingForTask)
            {
                return employee.CurrentStateLabel;
            }

            return employee == secretary
                ? "在前台整理今天的待办"
                : "正在等你交代下一件事";
        }

        private IEnumerator PlayAssignmentFlow()
        {
            Phase = OfficeTaskFlowPhase.Assigned;
            CurrentBeatLabel = assignedEmployee.DisplayName + "：收到，我先回工位把重点理清。";
            Send(assignedEmployee, EmployeeVisualState.Assigned, assignedEmployee.transform.position);
            RaiseStateChanged();

            yield return new WaitForSeconds(acceptanceBeatSeconds);

            Phase = OfficeTaskFlowPhase.WalkingToDesk;
            CurrentBeatLabel = assignedEmployee.DisplayName + " 正带着任务走向工位";
            Send(assignedEmployee, EmployeeVisualState.Walking, DeskFor(assignedEmployee));
            RaiseStateChanged();
            assignmentRoutine = null;
        }

        private void HandleDestinationReached(EmployeeVisualController employee)
        {
            if (employee != assignedEmployee || Phase != OfficeTaskFlowPhase.WalkingToDesk)
            {
                return;
            }

            Phase = OfficeTaskFlowPhase.Working;
            CurrentBeatLabel = employee.DisplayName + " 已经坐下来，正在先搭任务结构";
            Send(employee, EmployeeVisualState.Working, DeskFor(employee));
            RaiseStateChanged();
        }

        private Vector3 DeskFor(EmployeeVisualController employee)
        {
            return employee == secretary ? secretaryDesk : coreDesk;
        }

        private void Send(
            EmployeeVisualController employee,
            EmployeeVisualState state,
            Vector3 target)
        {
            if (employee == null)
            {
                return;
            }

            long sequence;
            if (employee == secretary)
            {
                secretarySequence++;
                sequence = secretarySequence;
            }
            else
            {
                coreSequence++;
                sequence = coreSequence;
            }

            employee.TryApplyIntent(new EmployeeVisualIntent(
                employee.EmployeeId,
                sequence,
                state,
                target));
        }

        private void RaiseStateChanged()
        {
            StateChanged?.Invoke();
        }
    }
}

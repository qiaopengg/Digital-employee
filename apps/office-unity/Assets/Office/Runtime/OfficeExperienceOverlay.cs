using UnityEngine;
using UnityEngine.UIElements;

namespace DigitalEmployee.Office
{
    [RequireComponent(typeof(UIDocument))]
    public sealed class OfficeExperienceOverlay : MonoBehaviour
    {
        [SerializeField] private OfficeDemoDirector director;
        [SerializeField] private OfficeInteractionController interaction;
        [SerializeField] private Camera officeCamera;
        [SerializeField] private EmployeeVisualController coreEmployee;
        [SerializeField] private EmployeeVisualController secretary;

        private VisualElement root;
        private VisualElement employeeCard;
        private VisualElement composerLayer;
        private VisualElement linChip;
        private VisualElement secretaryChip;
        private Label phaseBanner;
        private Label employeeName;
        private Label employeeRole;
        private Label employeeStatusPill;
        private Label employeeDetail;
        private Label composerRecipient;
        private Label linChipStatus;
        private Label secretaryChipStatus;
        private TextField taskInput;
        private Button submitTaskButton;
        private Button[] modeButtons;
        private EmployeeVisualController recipient;
        private Font runtimeFont;

        public void Configure(
            OfficeDemoDirector taskDirector,
            OfficeInteractionController interactionController,
            Camera camera,
            EmployeeVisualController primaryEmployee,
            EmployeeVisualController officeSecretary)
        {
            director = taskDirector;
            interaction = interactionController;
            officeCamera = camera;
            coreEmployee = primaryEmployee;
            secretary = officeSecretary;
        }

        private void OnEnable()
        {
            UIDocument document = GetComponent<UIDocument>();
            root = document.rootVisualElement;
            CacheElements();
            ConfigureRuntimeFont();
            RegisterCallbacks();
            RefreshAll();
        }

        private void OnDisable()
        {
            if (interaction != null)
            {
                interaction.SelectionChanged -= HandleSelectionChanged;
            }

            if (director != null)
            {
                director.StateChanged -= RefreshAll;
            }
        }

        private void Update()
        {
            PositionChip(linChip, coreEmployee, new Vector2(-46f, -62f));
            PositionChip(secretaryChip, secretary, new Vector2(-46f, -62f));
        }

        private void CacheElements()
        {
            employeeCard = root.Q("employee-card");
            composerLayer = root.Q("composer-layer");
            linChip = root.Q("lin-chip");
            secretaryChip = root.Q("secretary-chip");
            phaseBanner = root.Q<Label>("phase-banner");
            employeeName = root.Q<Label>("employee-name");
            employeeRole = root.Q<Label>("employee-role");
            employeeStatusPill = root.Q<Label>("employee-status-pill");
            employeeDetail = root.Q<Label>("employee-detail");
            composerRecipient = root.Q<Label>("composer-recipient");
            linChipStatus = root.Q<Label>("lin-chip-status");
            secretaryChipStatus = root.Q<Label>("secretary-chip-status");
            taskInput = root.Q<TextField>("task-input");
            submitTaskButton = root.Q<Button>("submit-task-button");
            modeButtons = new[]
            {
                root.Q<Button>("quick-mode-button"),
                root.Q<Button>("standard-mode-button"),
                root.Q<Button>("deep-mode-button"),
            };
        }

        private void RegisterCallbacks()
        {
            interaction.SelectionChanged += HandleSelectionChanged;
            director.StateChanged += RefreshAll;

            RegisterPointerAction(root.Q("assign-button"), OpenComposerForSelection);
            RegisterPointerAction(root.Q("employee-assign-button"), OpenComposerForSelection);
            RegisterPointerAction(root.Q("cancel-composer-button"), CloseComposer);
            RegisterPointerAction(root.Q("composer-scrim"), CloseComposer);
            RegisterPointerAction(submitTaskButton, SubmitTask);
            RegisterPointerAction(root.Q("profile-button"), ShowProfileNotice);
            RegisterPointerAction(root.Q("tasks-button"), ShowTasksNotice);
            RegisterPointerAction(root.Q("reports-button"), ShowReportsNotice);
            RegisterPointerAction(linChip, () => interaction.Select(coreEmployee));
            RegisterPointerAction(secretaryChip, () => interaction.Select(secretary));

            foreach (Button button in modeButtons)
            {
                Button capturedButton = button;
                RegisterPointerAction(button, () => SelectMode(capturedButton));
            }

            taskInput.RegisterValueChangedCallback(_ => RefreshSubmitState());
        }

        private void HandleSelectionChanged(EmployeeVisualController employee)
        {
            recipient = employee;
            if (employee == null)
            {
                employeeCard.AddToClassList("hidden");
                return;
            }

            employeeName.text = employee.DisplayName;
            employeeRole.text = employee.RoleName;
            employeeStatusPill.text = employee.CurrentStateLabel;
            employeeDetail.text = director.StatusFor(employee);
            employeeCard.RemoveFromClassList("hidden");
        }

        private void OpenComposerForSelection()
        {
            if (director.Phase != OfficeTaskFlowPhase.WaitingForTask)
            {
                phaseBanner.text = "当前任务已经在推进，稍后可从任务列表继续管理";
                return;
            }

            recipient = interaction.SelectedEmployee ?? coreEmployee;
            composerRecipient.text = "交给 " + recipient.DisplayName;
            taskInput.value = string.Empty;
            taskInput.label = string.Empty;
            taskInput.textEdition.placeholder = "例如：帮我为下周的新品发布整理一份执行方案";
            employeeCard.AddToClassList("hidden");
            composerLayer.RemoveFromClassList("hidden");
            RefreshSubmitState();
            taskInput.Focus();
            Debug.Log("Office task composer opened for " + recipient.EmployeeId);
        }

        private void CloseComposer()
        {
            composerLayer.AddToClassList("hidden");
            HandleSelectionChanged(interaction.SelectedEmployee);
        }

        private void SubmitTask()
        {
            string normalizedTask = taskInput.value == null ? string.Empty : taskInput.value.Trim();
            if (!director.AssignTask(recipient, normalizedTask))
            {
                RefreshSubmitState();
                return;
            }

            composerLayer.AddToClassList("hidden");
            employeeCard.AddToClassList("hidden");
            Debug.Log("Office task submitted: " + normalizedTask);
        }

        internal bool PrepareComposerForQa(
            EmployeeVisualController employee,
            string taskTitle)
        {
            if (employee == null || string.IsNullOrWhiteSpace(taskTitle))
            {
                return false;
            }

            interaction.Select(employee);
            OpenComposerForSelection();
            taskInput.value = taskTitle;
            RefreshSubmitState();
            return !composerLayer.ClassListContains("hidden") && submitTaskButton.enabledSelf;
        }

        internal bool SubmitComposerForQa()
        {
            string expectedTask = taskInput.value == null ? string.Empty : taskInput.value.Trim();
            SubmitTask();
            return expectedTask.Length > 0 &&
                composerLayer.ClassListContains("hidden") &&
                director.CurrentTaskTitle == expectedTask;
        }

        private void RefreshAll()
        {
            phaseBanner.text = director.CurrentBeatLabel;
            linChipStatus.text = director.StatusFor(coreEmployee);
            secretaryChipStatus.text = director.StatusFor(secretary);

            EmployeeVisualController selected = interaction.SelectedEmployee;
            if (selected != null && !employeeCard.ClassListContains("hidden"))
            {
                HandleSelectionChanged(selected);
            }
        }

        private void SelectMode(Button selectedButton)
        {
            foreach (Button button in modeButtons)
            {
                button.EnableInClassList("selected", button == selectedButton);
            }
        }

        private void RefreshSubmitState()
        {
            bool canSubmit = !string.IsNullOrWhiteSpace(taskInput.value);
            submitTaskButton.SetEnabled(canSubmit);
            submitTaskButton.style.opacity = canSubmit ? 1f : 0.38f;
        }

        private void PositionChip(
            VisualElement chip,
            EmployeeVisualController employee,
            Vector2 offset)
        {
            if (chip == null || employee == null || officeCamera == null || root.panel == null)
            {
                return;
            }

            Vector3 screen = officeCamera.WorldToScreenPoint(
                employee.transform.position + Vector3.up * 3.05f);
            if (screen.z <= 0f)
            {
                chip.style.display = DisplayStyle.None;
                return;
            }

            Vector2 panelPosition = RuntimePanelUtils.ScreenToPanel(
                root.panel,
                new Vector2(screen.x, Screen.height - screen.y));
            chip.style.display = DisplayStyle.Flex;
            chip.style.left = panelPosition.x + offset.x;
            chip.style.top = panelPosition.y + offset.y;
        }

        private void ShowProfileNotice()
        {
            phaseBanner.text = recipient.DisplayName + " 的完整档案将在员工模块中打开";
        }

        private void ShowTasksNotice()
        {
            phaseBanner.text = string.IsNullOrEmpty(director.CurrentTaskTitle)
                ? "现在还没有进行中的任务"
                : "进行中：" + director.CurrentTaskTitle;
        }

        private void ShowReportsNotice()
        {
            phaseBanner.text = "目前没有等待查看的汇报";
        }

        private void ConfigureRuntimeFont()
        {
            runtimeFont = Font.CreateDynamicFontFromOSFont(
                new[] { "PingFang SC", "Helvetica Neue", "Arial Unicode MS" },
                18);
            if (runtimeFont != null)
            {
                root.style.unityFont = runtimeFont;
            }
        }

        private static void RegisterPointerAction(VisualElement element, System.Action action)
        {
            element.RegisterCallback<PointerDownEvent>(pointerEvent =>
            {
                if (pointerEvent.button != 0)
                {
                    return;
                }

                Debug.Log("Office UI action: " + element.name);
                action();
                pointerEvent.StopPropagation();
            });
        }

        private void OnDestroy()
        {
            if (runtimeFont != null)
            {
                Destroy(runtimeFont);
            }
        }
    }
}

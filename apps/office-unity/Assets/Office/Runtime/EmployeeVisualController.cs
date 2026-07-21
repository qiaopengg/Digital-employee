using System;
using UnityEngine;

namespace DigitalEmployee.Office
{
    public sealed class EmployeeVisualController : MonoBehaviour
    {
        [Header("Identity")]
        [SerializeField] private string employeeId;
        [SerializeField] private string displayName;
        [SerializeField] private string roleName;

        [Header("Procedural rig")]
        [SerializeField] private Transform visualRoot;
        [SerializeField] private Transform head;
        [SerializeField] private Transform leftArm;
        [SerializeField] private Transform rightArm;
        [SerializeField] private Transform leftLeg;
        [SerializeField] private Transform rightLeg;
        [SerializeField] private GameObject reportFolder;
        [SerializeField] private GameObject selectionRing;
        [SerializeField] private Renderer statusIndicator;
        [SerializeField] private Animator[] characterAnimators;

        [Header("Movement")]
        [SerializeField, Min(0.1f)] private float movementSpeed = 1.45f;
        [SerializeField, Min(1f)] private float rotationSpeed = 8f;

        private MaterialPropertyBlock statusProperties;
        private VisualIntentSequenceGate sequenceGate;
        private EmployeeVisualState currentState = EmployeeVisualState.Idle;
        private Vector3 targetPosition;
        private Vector3 visualRootBasePosition;
        private Quaternion headBaseRotation;
        private Quaternion leftArmBaseRotation;
        private Quaternion rightArmBaseRotation;
        private Quaternion leftLegBaseRotation;
        private Quaternion rightLegBaseRotation;
        private bool destinationNotificationSent;

        public event Action<EmployeeVisualController> DestinationReached;

        public string EmployeeId => employeeId;
        public string DisplayName => displayName;
        public string RoleName => roleName;
        public EmployeeVisualState CurrentState => currentState;
        public string CurrentStateLabel => EmployeeVisualStateLabels.ToDisplayName(currentState);

        private void Awake()
        {
            statusProperties = new MaterialPropertyBlock();
            ResetRuntimeState();
            CacheRigPose();
            SetSelected(false);
            RefreshStateIndicator();
        }

        private void Update()
        {
            if (currentState == EmployeeVisualState.Walking)
            {
                MoveTowardsTarget();
            }

            AnimateCurrentState();
        }

        public void Configure(
            string id,
            string employeeName,
            string role,
            Transform characterVisualRoot,
            Transform characterHead,
            Transform characterLeftArm,
            Transform characterRightArm,
            Transform characterLeftLeg,
            Transform characterRightLeg,
            GameObject folder,
            GameObject ring,
            Renderer indicator,
            Animator[] animators)
        {
            employeeId = id;
            displayName = employeeName;
            roleName = role;
            visualRoot = characterVisualRoot;
            head = characterHead;
            leftArm = characterLeftArm;
            rightArm = characterRightArm;
            leftLeg = characterLeftLeg;
            rightLeg = characterRightLeg;
            reportFolder = folder;
            selectionRing = ring;
            statusIndicator = indicator;
            characterAnimators = animators;
            ResetRuntimeState();
            CacheRigPose();
            RefreshAnimatorState(0f);
        }

        public bool TryApplyIntent(EmployeeVisualIntent intent)
        {
            sequenceGate ??= new VisualIntentSequenceGate(employeeId);
            if (!sequenceGate.TryAccept(intent))
            {
                return false;
            }

            currentState = intent.State;
            targetPosition = intent.TargetPosition;
            destinationNotificationSent = currentState != EmployeeVisualState.Walking;
            RefreshStateIndicator();
            RefreshAnimatorState(0.14f);
            return true;
        }

        public void SetSelected(bool isSelected)
        {
            if (selectionRing != null)
            {
                selectionRing.SetActive(isSelected);
            }
        }

        private void ResetRuntimeState()
        {
            sequenceGate = new VisualIntentSequenceGate(employeeId);
            targetPosition = transform.position;
        }

        private void CacheRigPose()
        {
            if (visualRoot != null)
            {
                visualRootBasePosition = visualRoot.localPosition;
            }

            headBaseRotation = GetLocalRotation(head);
            leftArmBaseRotation = GetLocalRotation(leftArm);
            rightArmBaseRotation = GetLocalRotation(rightArm);
            leftLegBaseRotation = GetLocalRotation(leftLeg);
            rightLegBaseRotation = GetLocalRotation(rightLeg);
        }

        private void MoveTowardsTarget()
        {
            Vector3 offset = targetPosition - transform.position;
            offset.y = 0f;
            if (offset.sqrMagnitude <= 0.001f)
            {
                NotifyDestinationReached();
                return;
            }

            Vector3 direction = offset.normalized;
            transform.position = Vector3.MoveTowards(
                transform.position,
                targetPosition,
                movementSpeed * Time.deltaTime);

            Quaternion desiredRotation = Quaternion.LookRotation(direction, Vector3.up);
            transform.rotation = Quaternion.Slerp(
                transform.rotation,
                desiredRotation,
                rotationSpeed * Time.deltaTime);

            if ((targetPosition - transform.position).sqrMagnitude <= 0.001f)
            {
                transform.position = targetPosition;
                NotifyDestinationReached();
            }
        }

        private void AnimateCurrentState()
        {
            if (visualRoot == null)
            {
                return;
            }

            float time = Time.time;
            float bob = 0f;
            float armAngle = 0f;
            float legAngle = 0f;
            float headAngle = 0f;

            switch (currentState)
            {
                case EmployeeVisualState.Assigned:
                    bob = Mathf.Sin(time * 3f) * 0.012f;
                    armAngle = -34f;
                    headAngle = Mathf.Sin(time * 2.4f) * 2f;
                    break;
                case EmployeeVisualState.Walking:
                    float stride = Mathf.Sin(time * 8.5f);
                    bob = Mathf.Abs(Mathf.Sin(time * 8.5f)) * 0.045f;
                    armAngle = stride * 28f;
                    legAngle = -stride * 24f;
                    break;
                case EmployeeVisualState.Working:
                    bob = Mathf.Sin(time * 3.2f) * 0.012f;
                    armAngle = -28f + Mathf.Sin(time * 7f) * 7f;
                    headAngle = Mathf.Sin(time * 1.8f) * 3f;
                    break;
                case EmployeeVisualState.Break:
                    bob = Mathf.Sin(time * 2f) * 0.018f;
                    armAngle = Mathf.Sin(time * 1.5f) * 4f;
                    headAngle = Mathf.Sin(time * 1.2f) * 7f;
                    break;
                case EmployeeVisualState.Reporting:
                    bob = Mathf.Sin(time * 2.5f) * 0.01f;
                    armAngle = -42f;
                    headAngle = Mathf.Sin(time * 2f) * 2f;
                    break;
                default:
                    bob = Mathf.Sin(time * 2.2f) * 0.015f;
                    armAngle = Mathf.Sin(time * 1.6f) * 3f;
                    headAngle = Mathf.Sin(time * 1.3f) * 5f;
                    break;
            }

            visualRoot.localPosition = visualRootBasePosition + Vector3.up * bob;
            SetLocalRotation(head, headBaseRotation, 0f, headAngle, 0f);
            SetLocalRotation(leftArm, leftArmBaseRotation, armAngle, 0f, 0f);
            SetLocalRotation(rightArm, rightArmBaseRotation, -armAngle, 0f, 0f);
            SetLocalRotation(leftLeg, leftLegBaseRotation, legAngle, 0f, 0f);
            SetLocalRotation(rightLeg, rightLegBaseRotation, -legAngle, 0f, 0f);

            if (reportFolder != null)
            {
                reportFolder.SetActive(
                    currentState == EmployeeVisualState.Assigned ||
                    currentState == EmployeeVisualState.Reporting);
            }
        }

        private void NotifyDestinationReached()
        {
            if (destinationNotificationSent)
            {
                return;
            }

            destinationNotificationSent = true;
            DestinationReached?.Invoke(this);
        }

        private void RefreshStateIndicator()
        {
            if (statusIndicator == null)
            {
                return;
            }

            statusProperties ??= new MaterialPropertyBlock();
            Color color = currentState switch
            {
                EmployeeVisualState.Assigned => new Color(0.93f, 0.62f, 0.18f),
                EmployeeVisualState.Walking => new Color(0.27f, 0.58f, 0.96f),
                EmployeeVisualState.Working => new Color(0.22f, 0.75f, 0.48f),
                EmployeeVisualState.Break => new Color(0.96f, 0.67f, 0.25f),
                EmployeeVisualState.Reporting => new Color(0.65f, 0.42f, 0.94f),
                _ => new Color(0.62f, 0.67f, 0.74f),
            };

            statusIndicator.GetPropertyBlock(statusProperties);
            statusProperties.SetColor("_BaseColor", color);
            statusProperties.SetColor("_Color", color);
            statusIndicator.SetPropertyBlock(statusProperties);
        }

        private void RefreshAnimatorState(float transitionDuration)
        {
            if (characterAnimators == null)
            {
                return;
            }

            string stateName = currentState switch
            {
                EmployeeVisualState.Assigned => "Assigned",
                EmployeeVisualState.Walking => "Walking",
                EmployeeVisualState.Working => "Working",
                EmployeeVisualState.Break => "Break",
                EmployeeVisualState.Reporting => "Reporting",
                _ => "Idle",
            };

            foreach (Animator animator in characterAnimators)
            {
                if (animator == null || animator.runtimeAnimatorController == null)
                {
                    continue;
                }

                if (transitionDuration <= 0f)
                {
                    animator.Play(stateName, 0, 0f);
                }
                else
                {
                    animator.CrossFadeInFixedTime(stateName, transitionDuration);
                }
            }
        }

        private static Quaternion GetLocalRotation(Transform target)
        {
            return target == null ? Quaternion.identity : target.localRotation;
        }

        private static void SetLocalRotation(
            Transform target,
            Quaternion baseRotation,
            float x,
            float y,
            float z)
        {
            if (target != null)
            {
                target.localRotation = baseRotation * Quaternion.Euler(x, y, z);
            }
        }
    }
}

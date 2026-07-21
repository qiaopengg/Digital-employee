using System.Collections;
using System.IO;
using System.Linq;
using UnityEngine;

namespace DigitalEmployee.Office
{
    public sealed class OfficeTaskFlowQaRunner : MonoBehaviour
    {
        [SerializeField] private OfficeDemoDirector director;
        [SerializeField] private OfficeInteractionController interaction;
        [SerializeField] private OfficeExperienceOverlay overlay;
        [SerializeField, Min(2f)] private float timeoutSeconds = 15f;

        public void Configure(
            OfficeDemoDirector taskDirector,
            OfficeInteractionController interactionController,
            OfficeExperienceOverlay experienceOverlay)
        {
            director = taskDirector;
            interaction = interactionController;
            overlay = experienceOverlay;
        }

        private void Start()
        {
            if (!System.Environment.GetCommandLineArgs().Contains("--office-qa"))
            {
                return;
            }

            StartCoroutine(RunQaFlow());
        }

        private IEnumerator RunQaFlow()
        {
            yield return null;

            Capture("OfficeQaInitial.png");
            yield return new WaitForSeconds(0.35f);

            EmployeeVisualController employee = director.CoreEmployee;
            interaction.Select(employee);
            if (interaction.SelectedEmployee != employee)
            {
                Fail("employee selection did not become authoritative");
                yield break;
            }

            const string task = "为下周新品发布整理一份执行方案";
            if (!overlay.PrepareComposerForQa(employee, task))
            {
                Fail("task composer did not become ready");
                yield break;
            }

            Debug.Log("OFFICE_UI_QA_COMPOSER_READY");
            Capture("OfficeQaComposer.png");
            yield return new WaitForSeconds(0.35f);

            if (!overlay.SubmitComposerForQa())
            {
                Fail("task composer submission did not reach the director");
                yield break;
            }

            Debug.Log("OFFICE_QA_ASSIGNED: " + task);
            Capture("OfficeQaAssigned.png");
            yield return new WaitForSeconds(0.35f);

            float deadline = Time.realtimeSinceStartup + timeoutSeconds;
            while (director.Phase != OfficeTaskFlowPhase.Working)
            {
                if (Time.realtimeSinceStartup >= deadline)
                {
                    Fail("employee did not reach the working phase before timeout");
                    yield break;
                }

                yield return null;
            }

            if (employee.CurrentState != EmployeeVisualState.Working)
            {
                Fail("visual state and task flow phase diverged");
                yield break;
            }

            Debug.Log("OFFICE_QA_PASSED: assigned -> walking -> working");
            Capture("OfficeQaWorking.png");
            yield return new WaitForSeconds(0.5f);
            Application.Quit(0);
        }

        private static void Capture(string filename)
        {
            string path = Path.Combine(Application.persistentDataPath, filename);
            ScreenCapture.CaptureScreenshot(path);
            Debug.Log("OFFICE_QA_CAPTURE: " + path);
        }

        private static void Fail(string reason)
        {
            Debug.LogError("OFFICE_QA_FAILED: " + reason);
            Application.Quit(2);
        }
    }
}

using UnityEngine;

namespace DigitalEmployee.Office
{
    public sealed class LocalDemoOverlay : MonoBehaviour
    {
        [SerializeField] private OfficeDemoDirector demoDirector;
        [SerializeField] private OfficeInteractionController interactionController;

        private GUIStyle badgeStyle;
        private GUIStyle titleStyle;
        private GUIStyle detailStyle;
        private Texture2D panelTexture;

        public void Configure(
            OfficeDemoDirector director,
            OfficeInteractionController interaction)
        {
            demoDirector = director;
            interactionController = interaction;
        }

        private void OnGUI()
        {
            EnsureStyles();

            Rect safeArea = Screen.safeArea;
            float safeTop = Screen.height - safeArea.yMax;
            float margin = Mathf.Max(16f, Screen.width * 0.025f);

            Rect badgeRect = new(
                safeArea.x + margin,
                safeTop + margin,
                Mathf.Min(250f, safeArea.width - margin * 2f),
                44f);
            GUI.Box(badgeRect, OfficeDemoDirector.SourceLabel, badgeStyle);

            string beat = demoDirector == null
                ? "Preparing the office"
                : demoDirector.CurrentBeatLabel;
            Rect beatRect = new(
                badgeRect.x,
                badgeRect.yMax + 10f,
                Mathf.Min(390f, safeArea.width - margin * 2f),
                30f);
            GUI.Label(beatRect, beat, detailStyle);

            EmployeeVisualController selected = interactionController == null
                ? null
                : interactionController.SelectedEmployee;
            if (selected == null)
            {
                return;
            }

            float cardWidth = Mathf.Min(420f, safeArea.width - margin * 2f);
            Rect cardRect = new(
                safeArea.x + (safeArea.width - cardWidth) * 0.5f,
                safeTop + safeArea.height - 118f - margin,
                cardWidth,
                118f);
            GUI.Box(cardRect, GUIContent.none, titleStyle);
            GUI.Label(
                new Rect(cardRect.x + 20f, cardRect.y + 15f, cardRect.width - 40f, 30f),
                selected.DisplayName + "  ·  " + selected.RoleName,
                titleStyle);
            GUI.Label(
                new Rect(cardRect.x + 20f, cardRect.y + 52f, cardRect.width - 40f, 28f),
                selected.CurrentStateLabel,
                detailStyle);
            GUI.Label(
                new Rect(cardRect.x + 20f, cardRect.y + 81f, cardRect.width - 40f, 22f),
                "Tap another employee to switch focus",
                detailStyle);
        }

        private void EnsureStyles()
        {
            if (badgeStyle != null)
            {
                return;
            }

            panelTexture = new Texture2D(1, 1)
            {
                hideFlags = HideFlags.HideAndDontSave,
            };
            panelTexture.SetPixel(0, 0, new Color(0.055f, 0.07f, 0.09f, 0.88f));
            panelTexture.Apply();

            badgeStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.MiddleCenter,
                fontSize = 13,
                fontStyle = FontStyle.Bold,
                normal = { textColor = new Color(0.9f, 0.94f, 0.98f) },
            };
            badgeStyle.normal.background = panelTexture;

            titleStyle = new GUIStyle(GUI.skin.box)
            {
                alignment = TextAnchor.UpperLeft,
                fontSize = 20,
                fontStyle = FontStyle.Bold,
                padding = new RectOffset(0, 0, 0, 0),
                normal = { textColor = Color.white },
            };
            titleStyle.normal.background = panelTexture;

            detailStyle = new GUIStyle(GUI.skin.label)
            {
                alignment = TextAnchor.MiddleLeft,
                fontSize = 14,
                normal = { textColor = new Color(0.84f, 0.88f, 0.92f) },
            };
        }

        private void OnDestroy()
        {
            if (panelTexture != null)
            {
                Destroy(panelTexture);
            }
        }
    }
}

namespace DigitalEmployee.Office
{
    public enum EmployeeVisualState
    {
        Idle = 0,
        Assigned = 1,
        Walking = 2,
        Working = 3,
        Break = 4,
        Reporting = 5,
    }

    public static class EmployeeVisualStateLabels
    {
        public static string ToDisplayName(EmployeeVisualState state)
        {
            return state switch
            {
                EmployeeVisualState.Assigned => "刚收到任务",
                EmployeeVisualState.Walking => "正走向工位",
                EmployeeVisualState.Working => "正在专心工作",
                EmployeeVisualState.Break => "正在休息",
                EmployeeVisualState.Reporting => "汇报已准备好",
                _ => "现在有空",
            };
        }
    }
}

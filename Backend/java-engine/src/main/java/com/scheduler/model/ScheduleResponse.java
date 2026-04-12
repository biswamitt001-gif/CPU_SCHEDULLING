package com.scheduler.model;

import java.util.List;

public class ScheduleResponse {
    private List<GanttData> ganttChart;
    private List<ProcessMetrics> metrics;
    private double averageWaitingTime;
    private double averageTurnaroundTime;

    public List<GanttData> getGanttChart() { return ganttChart; }
    public void setGanttChart(List<GanttData> ganttChart) { this.ganttChart = ganttChart; }

    public List<ProcessMetrics> getMetrics() { return metrics; }
    public void setMetrics(List<ProcessMetrics> metrics) { this.metrics = metrics; }

    public double getAverageWaitingTime() { return averageWaitingTime; }
    public void setAverageWaitingTime(double averageWaitingTime) { this.averageWaitingTime = averageWaitingTime; }

    public double getAverageTurnaroundTime() { return averageTurnaroundTime; }
    public void setAverageTurnaroundTime(double averageTurnaroundTime) { this.averageTurnaroundTime = averageTurnaroundTime; }
}

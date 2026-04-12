package com.scheduler.model;

public class GanttData {
    private String processId;
    private int startTime;
    private int endTime;

    public GanttData() {}

    public GanttData(String processId, int startTime, int endTime) {
        this.processId = processId;
        this.startTime = startTime;
        this.endTime = endTime;
    }

    public String getProcessId() { return processId; }
    public void setProcessId(String processId) { this.processId = processId; }
    
    public int getStartTime() { return startTime; }
    public void setStartTime(int startTime) { this.startTime = startTime; }
    
    public int getEndTime() { return endTime; }
    public void setEndTime(int endTime) { this.endTime = endTime; }
}

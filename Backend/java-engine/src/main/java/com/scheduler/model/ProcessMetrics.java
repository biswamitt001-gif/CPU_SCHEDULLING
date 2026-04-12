package com.scheduler.model;

public class ProcessMetrics {
    private String processId;
    private int completionTime;
    private int turnaroundTime;
    private int waitingTime;

    public ProcessMetrics() {}

    public ProcessMetrics(String processId, int completionTime, int turnaroundTime, int waitingTime) {
        this.processId = processId;
        this.completionTime = completionTime;
        this.turnaroundTime = turnaroundTime;
        this.waitingTime = waitingTime;
    }

    public String getProcessId() { return processId; }
    public void setProcessId(String processId) { this.processId = processId; }

    public int getCompletionTime() { return completionTime; }
    public void setCompletionTime(int completionTime) { this.completionTime = completionTime; }

    public int getTurnaroundTime() { return turnaroundTime; }
    public void setTurnaroundTime(int turnaroundTime) { this.turnaroundTime = turnaroundTime; }

    public int getWaitingTime() { return waitingTime; }
    public void setWaitingTime(int waitingTime) { this.waitingTime = waitingTime; }
}

package com.scheduler.model;

import java.util.List;

public class ScheduleRequest {
    private String algorithm;
    private Integer timeQuantum;
    private List<Process> processes;

    public String getAlgorithm() { return algorithm; }
    public void setAlgorithm(String algorithm) { this.algorithm = algorithm; }

    public Integer getTimeQuantum() { return timeQuantum; }
    public void setTimeQuantum(Integer timeQuantum) { this.timeQuantum = timeQuantum; }

    public List<Process> getProcesses() { return processes; }
    public void setProcesses(List<Process> processes) { this.processes = processes; }
}

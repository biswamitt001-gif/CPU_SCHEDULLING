package com.scheduler.model;

public class Process {
    private String id;
    private int arrivalTime;
    private int burstTime;
    private int priority;
    
    // Default constructor for Jackson
    public Process() {}

    public Process(String id, int arrivalTime, int burstTime, int priority) {
        this.id = id;
        this.arrivalTime = arrivalTime;
        this.burstTime = burstTime;
        this.priority = priority;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    
    public int getArrivalTime() { return arrivalTime; }
    public void setArrivalTime(int arrivalTime) { this.arrivalTime = arrivalTime; }
    
    public int getBurstTime() { return burstTime; }
    public void setBurstTime(int burstTime) { this.burstTime = burstTime; }
    
    public int getPriority() { return priority; }
    public void setPriority(int priority) { this.priority = priority; }
}

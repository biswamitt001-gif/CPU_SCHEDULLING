package com.scheduler.algorithm;

import com.scheduler.model.GanttData;
import com.scheduler.model.Process;
import com.scheduler.model.ProcessMetrics;
import com.scheduler.model.ScheduleResponse;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

public class FCFS implements SchedulingAlgorithm {

    @Override
    public ScheduleResponse schedule(List<Process> processes, Integer timeQuantum) {
        List<Process> sortedProcesses = new ArrayList<>(processes);
        sortedProcesses.sort(Comparator.comparingInt(Process::getArrivalTime));

        List<GanttData> ganttChart = new ArrayList<>();
        List<ProcessMetrics> metrics = new ArrayList<>();

        int currentTime = 0;
        double totalWaitingTime = 0;
        double totalTurnaroundTime = 0;

        for (Process p : sortedProcesses) {
            if (currentTime < p.getArrivalTime()) {
                currentTime = p.getArrivalTime(); // Handle idle CPU
            }
            int startTime = currentTime;
            int endTime = startTime + p.getBurstTime();
            
            ganttChart.add(new GanttData(p.getId(), startTime, endTime));
            
            int completionTime = endTime;
            int turnaroundTime = completionTime - p.getArrivalTime();
            int waitingTime = turnaroundTime - p.getBurstTime();
            
            metrics.add(new ProcessMetrics(p.getId(), completionTime, turnaroundTime, waitingTime));
            
            totalTurnaroundTime += turnaroundTime;
            totalWaitingTime += waitingTime;
            
            currentTime = endTime;
        }

        ScheduleResponse response = new ScheduleResponse();
        response.setGanttChart(ganttChart);
        response.setMetrics(metrics);
        response.setAverageTurnaroundTime(totalTurnaroundTime / processes.size());
        response.setAverageWaitingTime(totalWaitingTime / processes.size());

        return response;
    }
}

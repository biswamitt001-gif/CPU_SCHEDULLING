package com.scheduler.algorithm;

import com.scheduler.model.GanttData;
import com.scheduler.model.Process;
import com.scheduler.model.ProcessMetrics;
import com.scheduler.model.ScheduleResponse;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

public class SJF implements SchedulingAlgorithm {

    @Override
    public ScheduleResponse schedule(List<Process> processes, Integer timeQuantum) {
        List<Process> remainingProcesses = new ArrayList<>(processes);
        
        List<GanttData> ganttChart = new ArrayList<>();
        List<ProcessMetrics> metrics = new ArrayList<>();

        int currentTime = 0;
        double totalWaitingTime = 0;
        double totalTurnaroundTime = 0;

        while (!remainingProcesses.isEmpty()) {
            final int time = currentTime;
            List<Process> available = remainingProcesses.stream()
                .filter(p -> p.getArrivalTime() <= time)
                .collect(Collectors.toList());

            if (available.isEmpty()) {
                // Determine next arrival time to skip idle ticks
                int nextArrival = remainingProcesses.stream()
                    .mapToInt(Process::getArrivalTime)
                    .min().orElse(currentTime + 1);
                currentTime = nextArrival;
                continue;
            }

            Process p = available.stream()
                .min(Comparator.comparingInt(Process::getBurstTime)
                    .thenComparingInt(Process::getArrivalTime))
                .get();

            remainingProcesses.remove(p);

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

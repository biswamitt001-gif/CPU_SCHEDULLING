package com.scheduler.algorithm;

import com.scheduler.model.GanttData;
import com.scheduler.model.Process;
import com.scheduler.model.ProcessMetrics;
import com.scheduler.model.ScheduleResponse;

import java.util.*;

public class SRTF implements SchedulingAlgorithm {

    @Override
    public ScheduleResponse schedule(List<Process> processes, Integer timeQuantum) {
        int n = processes.size();
        int[] remainingBurst = new int[n];
        for (int i = 0; i < n; i++) {
            remainingBurst[i] = processes.get(i).getBurstTime();
        }

        List<GanttData> ganttChart = new ArrayList<>();
        List<ProcessMetrics> metrics = new ArrayList<>();

        int completed = 0;
        int currentTime = 0;
        double totalWaitingTime = 0;
        double totalTurnaroundTime = 0;

        String currentProcessId = null;
        int sliceStartTime = 0;

        while (completed != n) {
            int shortestIdx = -1;
            int minRemaining = Integer.MAX_VALUE;

            for (int i = 0; i < n; i++) {
                Process p = processes.get(i);
                if (p.getArrivalTime() <= currentTime && remainingBurst[i] > 0 && remainingBurst[i] < minRemaining) {
                    minRemaining = remainingBurst[i];
                    shortestIdx = i;
                }
            }

            if (shortestIdx == -1) {
                if (currentProcessId != null) {
                    ganttChart.add(new GanttData(currentProcessId, sliceStartTime, currentTime));
                    currentProcessId = null;
                }
                currentTime++; // Idle
                continue;
            }

            Process p = processes.get(shortestIdx);
            if (currentProcessId == null || !currentProcessId.equals(p.getId())) {
                if (currentProcessId != null) {
                    ganttChart.add(new GanttData(currentProcessId, sliceStartTime, currentTime));
                }
                currentProcessId = p.getId();
                sliceStartTime = currentTime;
            }

            // advance time
            remainingBurst[shortestIdx]--;
            currentTime++;

            if (remainingBurst[shortestIdx] == 0) {
                completed++;
                int completionTime = currentTime;
                int turnaroundTime = completionTime - p.getArrivalTime();
                int waitingTime = turnaroundTime - p.getBurstTime();

                metrics.add(new ProcessMetrics(p.getId(), completionTime, turnaroundTime, waitingTime));
                totalTurnaroundTime += turnaroundTime;
                totalWaitingTime += waitingTime;
                
                ganttChart.add(new GanttData(currentProcessId, sliceStartTime, currentTime));
                currentProcessId = null;
            }
        }

        ScheduleResponse response = new ScheduleResponse();
        response.setGanttChart(mergeGantt(ganttChart));
        response.setMetrics(metrics);
        response.setAverageTurnaroundTime(totalTurnaroundTime / n);
        response.setAverageWaitingTime(totalWaitingTime / n);

        return response;
    }

    private List<GanttData> mergeGantt(List<GanttData> list) {
        if (list.isEmpty()) return list;
        List<GanttData> merged = new ArrayList<>();
        GanttData current = list.get(0);
        for (int i = 1; i < list.size(); i++) {
            GanttData next = list.get(i);
            if (current.getProcessId().equals(next.getProcessId()) && current.getEndTime() == next.getStartTime()) {
                current.setEndTime(next.getEndTime());
            } else {
                merged.add(current);
                current = next;
            }
        }
        merged.add(current);
        return merged;
    }
}

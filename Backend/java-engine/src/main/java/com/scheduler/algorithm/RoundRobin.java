package com.scheduler.algorithm;

import com.scheduler.model.GanttData;
import com.scheduler.model.Process;
import com.scheduler.model.ProcessMetrics;
import com.scheduler.model.ScheduleResponse;

import java.util.*;

public class RoundRobin implements SchedulingAlgorithm {

    @Override
    public ScheduleResponse schedule(List<Process> processes, Integer timeQuantum) {
        if (timeQuantum == null || timeQuantum <= 0) {
            timeQuantum = 2; // Default
        }

        int n = processes.size();
        int[] remainingBurst = new int[n];
        for (int i = 0; i < n; i++) {
            remainingBurst[i] = processes.get(i).getBurstTime();
        }

        List<Process> sortedProcesses = new ArrayList<>(processes);
        sortedProcesses.sort(Comparator.comparingInt(Process::getArrivalTime));

        List<GanttData> ganttChart = new ArrayList<>();
        List<ProcessMetrics> metrics = new ArrayList<>();

        Queue<Integer> queue = new LinkedList<>();
        boolean[] inQueue = new boolean[n];

        int currentTime = sortedProcesses.get(0).getArrivalTime();
        queue.add(0);
        inQueue[0] = true;

        int completed = 0;
        int nextIdx = 1;
        
        double totalWaitingTime = 0;
        double totalTurnaroundTime = 0;

        while (completed != n) {
            if (queue.isEmpty() && nextIdx < n) {
                currentTime = Math.max(currentTime, sortedProcesses.get(nextIdx).getArrivalTime());
                queue.add(nextIdx);
                inQueue[nextIdx] = true;
                nextIdx++;
                continue;
            } else if (queue.isEmpty()) {
                break;
            }

            int idx = queue.poll();
            Process p = sortedProcesses.get(idx);
            int executeTime = Math.min(timeQuantum, remainingBurst[idx]);

            int startTime = currentTime;
            currentTime += executeTime;
            remainingBurst[idx] -= executeTime;

            ganttChart.add(new GanttData(p.getId(), startTime, currentTime));

            // Check array of arrived elements and add to queue
            while (nextIdx < n && sortedProcesses.get(nextIdx).getArrivalTime() <= currentTime) {
                if (!inQueue[nextIdx]) {
                    queue.add(nextIdx);
                    inQueue[nextIdx] = true;
                }
                nextIdx++;
            }

            if (remainingBurst[idx] > 0) {
                queue.add(idx);
            } else {
                completed++;
                int turnaroundTime = currentTime - p.getArrivalTime();
                int waitingTime = turnaroundTime - p.getBurstTime();
                
                metrics.add(new ProcessMetrics(p.getId(), currentTime, turnaroundTime, waitingTime));
                totalTurnaroundTime += turnaroundTime;
                totalWaitingTime += waitingTime;
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

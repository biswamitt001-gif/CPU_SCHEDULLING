package com.scheduler.algorithm;

import com.scheduler.model.Process;
import com.scheduler.model.ScheduleResponse;
import java.util.List;

public interface SchedulingAlgorithm {
    ScheduleResponse schedule(List<Process> processes, Integer timeQuantum);
}

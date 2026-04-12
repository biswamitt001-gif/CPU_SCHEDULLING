package com.scheduler.controller;

import com.scheduler.algorithm.*;
import com.scheduler.model.ScheduleRequest;
import com.scheduler.model.ScheduleResponse;
import org.springframework.web.bind.annotation.*;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/compute")
public class ScheduleController {

    @PostMapping
    public ScheduleResponse compute(@RequestBody ScheduleRequest request) {
        SchedulingAlgorithm algorithm;
        switch (request.getAlgorithm().toUpperCase()) {
            case "FCFS":
                algorithm = new FCFS();
                break;
            case "SJF": // Non-preemptive
                algorithm = new SJF();
                break;
            case "SRTF": // Preemptive SJF
                algorithm = new SRTF();
                break;
            case "RR": // Round Robin
                algorithm = new RoundRobin();
                break;
            case "PRIORITY": // Priority Non-preemptive
                algorithm = new Priority();
                break;
            default:
                throw new IllegalArgumentException("Unknown algorithm: " + request.getAlgorithm());
        }

        return algorithm.schedule(request.getProcesses(), request.getTimeQuantum());
    }
}

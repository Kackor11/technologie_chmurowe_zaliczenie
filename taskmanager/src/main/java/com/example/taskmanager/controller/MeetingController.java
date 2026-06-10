package com.example.taskmanager.controller;

import com.example.taskmanager.model.Meeting;
import com.example.taskmanager.repository.MeetingRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/meetings")
@CrossOrigin(origins = "*")
public class MeetingController {
    private final MeetingRepository meetingRepository;

    public MeetingController(MeetingRepository meetingRepository) {
        this.meetingRepository = meetingRepository;
    }

    @GetMapping("/user/{userId}")
    public List<Meeting> getMeetingsByUser(@PathVariable Long userId) {
        return meetingRepository.findByUserId(userId);
    }

    @PostMapping
    public Meeting createMeeting(@RequestBody Meeting meeting) {
        return meetingRepository.save(meeting);
    }

    @DeleteMapping("/{id}")
    public void deleteMeeting(@PathVariable Long id) {
        meetingRepository.deleteById(id);
    }
}
import { validateSchedule } from "../../utils/interviewValidation.js";

const createFutureSchedule = ({
    startAfterMinutes = 60,
    durationMinutes = 30,
    timezone = "Asia/Kolkata",
    meetingType = "ONLINE",
    meetingLink = "https://meet.example.com/interview",
    physicalLocation,
    phoneInstructions
} = {}) => {
    const start = new Date(Date.now() + startAfterMinutes * 60 * 1000);
    const end = new Date(start.getTime() + durationMinutes * 60 * 1000);

    return {
        scheduledStartAt: start.toISOString(),
        scheduledEndAt: end.toISOString(),
        timezone,
        meetingType,
        meetingLink,
        physicalLocation,
        phoneInstructions
    };
};

describe("Interview schedule validation", () => {
    test("accepts a valid online interview", () => {
        const schedule = createFutureSchedule();

        const result = validateSchedule(schedule);

        expect(result.start).toBeInstanceOf(Date);
        expect(result.end).toBeInstanceOf(Date);
        expect(result.end.getTime()).toBeGreaterThan(result.start.getTime());
    });

    test("accepts a valid in-person interview", () => {
        const schedule = createFutureSchedule({
            meetingType: "IN_PERSON",
            meetingLink: undefined,
            physicalLocation: "CareerForge Office, Vijayawada"
        });

        expect(() => validateSchedule(schedule)).not.toThrow();
    });

    test("accepts a valid phone interview", () => {
        const schedule = createFutureSchedule({
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call the candidate."
        });

        expect(() => validateSchedule(schedule)).not.toThrow();
    });

    test("rejects an invalid start timestamp", () => {
        const schedule = createFutureSchedule({
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        schedule.scheduledStartAt = "invalid-date";

        expect(() => validateSchedule(schedule)).toThrow(
            "Invalid interview timestamp."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.statusCode).toBe(422);
            expect(error.code).toBe("INVALID_INTERVIEW_TIMESTAMP");
        }
    });

    test("rejects an invalid end timestamp", () => {
        const schedule = createFutureSchedule({
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        schedule.scheduledEndAt = "invalid-date";

        expect(() => validateSchedule(schedule)).toThrow(
            "Invalid interview timestamp."
        );
    });

    test("rejects an interview scheduled in the past", () => {
        const start = new Date(Date.now() - 60 * 60 * 1000);
        const end = new Date(start.getTime() + 30 * 60 * 1000);

        const schedule = {
            scheduledStartAt: start.toISOString(),
            scheduledEndAt: end.toISOString(),
            timezone: "Asia/Kolkata",
            meetingType: "PHONE",
            phoneInstructions: "Recruiter will call."
        };

        expect(() => validateSchedule(schedule)).toThrow(
            "Interview must be scheduled in the future."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("INTERVIEW_MUST_BE_FUTURE");
            expect(error.statusCode).toBe(422);
        }
    });

    test("allows a started schedule when allowStarted is true", () => {
        const start = new Date(Date.now() - 30 * 60 * 1000);
        const end = new Date(start.getTime() + 60 * 60 * 1000);

        const schedule = {
            scheduledStartAt: start.toISOString(),
            scheduledEndAt: end.toISOString(),
            timezone: "Asia/Kolkata",
            meetingType: "PHONE",
            phoneInstructions: "Recruiter will call."
        };

        expect(() =>
            validateSchedule(schedule, { allowStarted: true })
        ).not.toThrow();
    });

    test("rejects duration shorter than 15 minutes", () => {
        const schedule = createFutureSchedule({
            durationMinutes: 14,
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "Interview duration must be between 15 minutes and 8 hours."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("INVALID_INTERVIEW_DURATION");
        }
    });

    test("accepts exactly 15 minutes duration", () => {
        const schedule = createFutureSchedule({
            durationMinutes: 15,
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        expect(() => validateSchedule(schedule)).not.toThrow();
    });

    test("accepts exactly 8 hours duration", () => {
        const schedule = createFutureSchedule({
            durationMinutes: 480,
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        expect(() => validateSchedule(schedule)).not.toThrow();
    });

    test("rejects duration longer than 8 hours", () => {
        const schedule = createFutureSchedule({
            durationMinutes: 481,
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "Interview duration must be between 15 minutes and 8 hours."
        );
    });

    test("rejects when end time is before start time", () => {
        const start = new Date(Date.now() + 60 * 60 * 1000);
        const end = new Date(start.getTime() - 30 * 60 * 1000);

        const schedule = {
            scheduledStartAt: start.toISOString(),
            scheduledEndAt: end.toISOString(),
            timezone: "Asia/Kolkata",
            meetingType: "PHONE",
            phoneInstructions: "Recruiter will call."
        };

        expect(() => validateSchedule(schedule)).toThrow(
            "Interview duration must be between 15 minutes and 8 hours."
        );
    });

    test("rejects an invalid IANA timezone", () => {
        const schedule = createFutureSchedule({
            timezone: "Invalid/Timezone",
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: "Recruiter will call."
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "Invalid IANA timezone."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("INVALID_TIMEZONE");
        }
    });

    test("rejects online interview without meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE"
        });

        delete schedule.meetingLink;

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.statusCode).toBe(422);
            expect(error.code).toBe("INVALID_MEETING_LINK");
        }
    });

    test("rejects online interview with HTTP meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE",
            meetingLink: "http://meet.example.com/interview"
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("INVALID_MEETING_LINK");
        }
    });

    test("rejects malformed online meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE",
            meetingLink: "not-a-url"
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );
    });

    test("rejects online interview with null meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE",
            meetingLink: null
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );
    });

    test("rejects online interview with empty meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE",
            meetingLink: ""
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );
    });

    test("rejects online interview with blank meeting link", () => {
        const schedule = createFutureSchedule({
            meetingType: "ONLINE",
            meetingLink: "   "
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "A valid HTTPS meeting link is required."
        );
    });

    test("rejects in-person interview without physical location", () => {
        const schedule = createFutureSchedule({
            meetingType: "IN_PERSON",
            meetingLink: undefined,
            physicalLocation: "   "
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "Physical location is required."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("PHYSICAL_LOCATION_REQUIRED");
        }
    });

    test("rejects phone interview without phone instructions", () => {
        const schedule = createFutureSchedule({
            meetingType: "PHONE",
            meetingLink: undefined,
            phoneInstructions: ""
        });

        expect(() => validateSchedule(schedule)).toThrow(
            "Phone instructions are required."
        );

        try {
            validateSchedule(schedule);
        } catch (error) {
            expect(error.code).toBe("PHONE_INSTRUCTIONS_REQUIRED");
        }
    });
});
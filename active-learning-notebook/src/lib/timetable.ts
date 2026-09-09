export const generateMasterTimetable = (
  courses: any[], 
  profileSettings?: {
    daily_study_goal_hours?: number;
    study_days?: string[];
    busyness?: string;
  }
) => {
  // Default settings if profile not provided
  const dailyGoalHours = profileSettings?.daily_study_goal_hours || 2;
  const studyDays = profileSettings?.study_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  // 1. Gather all uncompleted topics
  const allTopics: { courseName: string, courseId: string, topicTitle: string, estimatedMinutes: number }[] = [];
  
  courses.forEach(course => {
    course.syllabus?.modules?.forEach((m: any) => {
      m.topics?.forEach((t: any) => {
        if (!t.completed) {
          allTopics.push({
            courseName: course.title,
            courseId: course.id,
            topicTitle: t.title,
            estimatedMinutes: t.estimatedMinutes || 60
          });
        }
      });
    });
  });

  const topicsByCourse: Record<string, typeof allTopics> = {};
  allTopics.forEach(t => {
    if (!topicsByCourse[t.courseId]) topicsByCourse[t.courseId] = [];
    topicsByCourse[t.courseId].push(t);
  });

  const maxMinsPerDay = dailyGoalHours * 60;
  const days: any[][] = [];
  let currentDay: any[] = [];
  let currentDayMins = 0;

  const courseIds = Object.keys(topicsByCourse);
  let allEmpty = false;

  // We need to keep track of the actual calendar date so we know if it's a study day
  let currentDate = new Date();
  
  // Helper to check if a date is a study day
  const isStudyDay = (date: Date) => {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayName = dayNames[date.getDay()];
    return studyDays.includes(dayName);
  };

  while (!allEmpty) {
    allEmpty = true;
    let addedThisRound = false;

    // Advance to the next valid study day
    while (!isStudyDay(currentDate)) {
      days.push([]); // Push an empty day to represent the rest day
      currentDate.setDate(currentDate.getDate() + 1);
    }

    for (const cId of courseIds) {
      if (topicsByCourse[cId].length > 0) {
        allEmpty = false;
        const nextTopic = topicsByCourse[cId][0]; // peek
        
        if (currentDayMins + nextTopic.estimatedMinutes > maxMinsPerDay && currentDay.length > 0) {
          // Day is full, push it and start a new one
          days.push([...currentDay]);
          currentDay = [];
          currentDayMins = 0;
          currentDate.setDate(currentDate.getDate() + 1);
          
          // Fast-forward through rest days again
          while (!isStudyDay(currentDate)) {
            days.push([]);
            currentDate.setDate(currentDate.getDate() + 1);
          }
        }
        
        // Pop and add
        currentDay.push(topicsByCourse[cId].shift());
        currentDayMins += nextTopic.estimatedMinutes;
        addedThisRound = true;
      }
    }
    
    // If we didn't add anything this round (e.g. one huge topic), but not empty, just force push
    if (!allEmpty && !addedThisRound && currentDay.length > 0) {
      days.push([...currentDay]);
      currentDay = [];
      currentDayMins = 0;
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  if (currentDay.length > 0) days.push(currentDay);
  return days;
};

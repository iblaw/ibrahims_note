export const generateMasterTimetable = (courses: any[]) => {
  // 1. Gather all uncompleted topics, tagged by their course
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

  // 2. Group them back by course for easy popping (round-robin)
  const topicsByCourse: Record<string, typeof allTopics> = {};
  allTopics.forEach(t => {
    if (!topicsByCourse[t.courseId]) topicsByCourse[t.courseId] = [];
    topicsByCourse[t.courseId].push(t);
  });

  // 3. Build days
  const maxMinsPerDay = 4 * 60; // 4 hours a day limit
  const days: any[][] = [];
  let currentDay: any[] = [];
  let currentDayMins = 0;

  const courseIds = Object.keys(topicsByCourse);
  let allEmpty = false;

  while (!allEmpty) {
    allEmpty = true;
    let addedThisRound = false;

    for (const cId of courseIds) {
      if (topicsByCourse[cId].length > 0) {
        allEmpty = false;
        const nextTopic = topicsByCourse[cId][0]; // peek
        
        if (currentDayMins + nextTopic.estimatedMinutes > maxMinsPerDay && currentDay.length > 0) {
          // Day is full, push it and start a new one
          days.push([...currentDay]);
          currentDay = [];
          currentDayMins = 0;
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
    }
  }

  if (currentDay.length > 0) days.push(currentDay);
  return days;
};

export function getConsolidatedStudentEmotions(sessionData) {
  let consolidatedEmotion = {
    angry: 0,
    disgust: 0,
    fear: 0,
    happy: 0,
    neutral: 0,
    sad: 0,
    surprise: 0
  }
  sessionData.forEach(student => {
    if (student.stats == undefined || student.stats.emotions == undefined) { return; }
    Object.keys(consolidatedEmotion).forEach(x => {
      if (student.stats.emotions[x]) {
        if (student.stats.emotions[x] < 0) {
          consolidatedEmotion[x] += (student.stats.emotions[x] * (-1));
        } else {
          consolidatedEmotion[x] += student.stats.emotions[x];
        }
      }
    });
  });
  return consolidatedEmotion;
}

export function getConsolidatedStudentDrowsiness(sessionData) {
  let consolidatedDrowsiness = {
    drowsy: 0,
    awaken: 0
  }
  sessionData.forEach(student => {
    if (student.stats == undefined || student.stats.drowsiness == undefined) { return; }
    Object.keys(consolidatedDrowsiness).forEach(x => {
      if (student.stats.drowsiness[x]) {
        consolidatedDrowsiness[x] += student.stats.drowsiness[x];
      }
    });
  });
  return consolidatedDrowsiness;
}

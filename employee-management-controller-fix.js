// Fixed getEmployeeById function for employee management controller
const getEmployeeById = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await User.findById(employeeId)
      .select('-password -refreshTokens')
      .populate('employment.manager', 'name employeeId email')
      .lean();

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: 'Employee not found'
      });
    }

    // Get basic wellness statistics with error handling
    try {
      const [
        checkIns,
        journals,
        recentActivity
      ] = await Promise.all([
        CheckIn.find({ userId: employeeId })
          .sort({ createdAt: -1 })
          .limit(10)
          .select('mood energy stress createdAt feedback')
          .lean(),
        Journal.find({ userId: employeeId, isDeleted: false })
          .sort({ createdAt: -1 })
          .limit(5)
          .select('title mood wordCount createdAt')
          .lean(),
        CheckIn.findOne({ userId: employeeId })
          .sort({ createdAt: -1 })
          .select('createdAt')
          .lean()
      ]);

      // Try to get survey responses, but don't fail if there's an issue
      let surveyResponses = [];
      try {
        // Use a simpler query approach for surveys
        const surveyCollection = await Survey.find({}).lean();
        surveyResponses = surveyCollection
          .filter(survey => 
            survey.responses && 
            survey.responses.some(r => r.userId && r.userId.toString() === employeeId.toString())
          )
          .slice(0, 5)
          .map(survey => {
            const userResponse = survey.responses.find(r => r.userId && r.userId.toString() === employeeId.toString());
            return {
              title: survey.title,
              completedAt: userResponse?.completedAt || userResponse?.createdAt
            };
          });
      } catch (surveyError) {
        console.error('Error fetching survey responses:', surveyError);
        // Continue without survey data
      }

      // Calculate wellness trends
      const moodTrend = checkIns.slice(0, 7).map(c => ({
        date: c.createdAt,
        mood: c.mood || 0,
        energy: c.energy || 0,
        stress: c.stress || 0
      }));

      // Calculate engagement score
      const daysSinceLastActivity = recentActivity 
        ? Math.floor((new Date() - new Date(recentActivity.createdAt)) / (1000 * 60 * 60 * 24))
        : null;
      
      const engagementScore = daysSinceLastActivity !== null 
        ? Math.max(0, 100 - (daysSinceLastActivity * 5)) 
        : 0;

      res.json({
        success: true,
        data: {
          ...employee,
          wellness: {
            recentCheckIns: checkIns,
            recentJournals: journals,
            recentSurveys: surveyResponses,
            moodTrend,
            engagementScore,
            daysSinceLastActivity
          },
          stats: {
            totalCheckIns: checkIns.length,
            totalJournals: journals.length,
            totalSurveys: surveyResponses.length,
            lastActivity: recentActivity?.createdAt || null
          }
        }
      });

    } catch (statsError) {
      console.error('Error fetching employee stats:', statsError);
      
      // Return basic employee data without stats if there's an error
      res.json({
        success: true,
        data: {
          ...employee,
          wellness: {
            recentCheckIns: [],
            recentJournals: [],
            recentSurveys: [],
            moodTrend: [],
            engagementScore: 0,
            daysSinceLastActivity: null
          },
          stats: {
            totalCheckIns: 0,
            totalJournals: 0,
            totalSurveys: 0,
            lastActivity: null
          }
        }
      });
    }

  } catch (error) {
    console.error('Error in getEmployeeById:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch employee details',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
};
import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  TrendingUp, 
  Users, 
  Brain,
  AlertCircle,
  CheckCircle,
  Filter,
  RefreshCw,
  Eye,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';
import api from '../../services/api';
import { useToast } from '../../components/shared/Toast';

const WordCloudChart = ({ timeframe, selectedDepartment }) => {
  const [wordData, setWordData] = useState(null);
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedWord, setSelectedWord] = useState(null);
  const [sourceFilter, setSourceFilter] = useState('all');
  const { toast } = useToast();

  useEffect(() => {
    loadWordCloudData();
  }, [timeframe, selectedDepartment, sourceFilter]);

  const loadWordCloudData = async () => {
    setLoading(true);
    try {
      const params = {
        timeframe: timeframe === '7d' ? 'Last 7 days' : 
                   timeframe === '30d' ? 'Last 30 days' : 
                   timeframe === '90d' ? 'Last 3 months' : 'Last 30 days',
        limit: 50,
        minOccurrences: 3
      };

      // Add date range based on timeframe
      const days = parseInt(timeframe.replace('d', ''));
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - days);
      
      params.startDate = startDate.toISOString().split('T')[0];
      params.endDate = endDate.toISOString().split('T')[0];

      if (selectedDepartment && selectedDepartment !== 'all') {
        params.departments = [selectedDepartment];
      }

      if (sourceFilter !== 'all') {
        params.sourceTypes = [sourceFilter];
      }

      const response = await api.getCompanyWordCloud(params);
      
      if (response.success) {
        setWordData(response.data.words || []);
        setInsights(response.data.insights);
      } else {
        setWordData([]);
        setInsights(null);
      }
    } catch (error) {
      console.error('Error loading word cloud data:', error);
      toast.error('Failed to load word analytics data');
      setWordData([]);
      setInsights(null);
    } finally {
      setLoading(false);
    }
  };

  const getWordSize = (frequency, maxFrequency) => {
    const minSize = 14;
    const maxSize = 48; // Increased max size for more dramatic effect
    
    // Use exponential scaling to make high-frequency words much more prominent
    const ratio = frequency / maxFrequency;
    const exponentialRatio = Math.pow(ratio, 0.6); // Makes differences more dramatic
    
    return Math.floor(minSize + (maxSize - minSize) * exponentialRatio);
  };

  const getWordColor = (sentiment) => {
    switch (sentiment?.positive > sentiment?.negative ? 'positive' : 
           sentiment?.negative > sentiment?.positive ? 'negative' : 'neutral') {
      case 'positive':
        return 'text-green-600 hover:text-green-700';
      case 'negative':
        return 'text-red-600 hover:text-red-700';
      default:
        return 'text-blue-600 hover:text-blue-700';
    }
  };

  const getSentimentIcon = (sentimentBreakdown) => {
    const positive = sentimentBreakdown?.positive || 0;
    const negative = sentimentBreakdown?.negative || 0;
    
    if (positive > negative) {
      return <ThumbsUp size={14} className="text-green-600" />;
    } else if (negative > positive) {
      return <ThumbsDown size={14} className="text-red-600" />;
    }
    return <Eye size={14} className="text-gray-600" />;
  };

  const maxFrequency = wordData?.length > 0 ? Math.max(...wordData.map(w => w.frequency)) : 1;

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-gradient-to-r from-indigo-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
              <MessageSquare size={24} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Employee Word Analytics</h3>
              <p className="text-sm text-gray-600">Most frequently used words in employee communications</p>
            </div>
          </div>
          <RefreshCw size={16} className="text-gray-400 animate-spin" />
        </div>
        
        <div className="h-96 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-pulse">
              <Brain size={48} className="text-indigo-400 mx-auto mb-4" />
              <p className="text-lg font-medium text-indigo-600">Analyzing word patterns...</p>
              <p className="text-indigo-500 text-sm">Processing employee communications with AI</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-to-r from-indigo-50 to-purple-100 rounded-xl flex items-center justify-center shadow-sm">
            <MessageSquare size={24} className="text-indigo-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">Employee Word Analytics</h3>
            <p className="text-sm text-gray-600">AI-powered analysis of employee communication patterns</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={sourceFilter}
            onChange={(e) => setSourceFilter(e.target.value)}
            className="text-sm border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="all">All Sources</option>
            <option value="journal">Journal Entries</option>
            <option value="survey">Survey Responses</option>
            <option value="checkin">Check-in Feedback</option>
          </select>
          
          <button
            onClick={loadWordCloudData}
            className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Data Definitions */}
      <div className="mb-6 p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border border-indigo-200">
        <h4 className="font-semibold text-indigo-900 mb-3 flex items-center space-x-2">
          <Brain size={16} />
          <span>Word Analytics Definitions</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-indigo-800">
          <div className="flex items-start space-x-2">
            <div className="w-3 h-3 bg-indigo-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <strong>Word Size:</strong> Represents frequency of usage across all employee communications
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <strong>Color Coding:</strong> Green (positive sentiment), Red (negative), Blue (neutral)
            </div>
          </div>
          <div className="flex items-start space-x-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 flex-shrink-0"></div>
            <div>
              <strong>Smart Analysis:</strong> Advanced sentiment and theme detection across all communications
            </div>
          </div>
        </div>
      </div>

      {wordData && wordData.length > 0 ? (
        <>
          {/* Word Cloud */}
          <div className="mb-8">
            <div className="flex flex-wrap gap-4 justify-center items-center p-12 bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 rounded-xl border border-slate-200 min-h-[400px] shadow-inner">
              {wordData.slice(0, 35).map((wordItem, index) => {
                const fontSize = getWordSize(wordItem.frequency, maxFrequency);
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedWord(selectedWord?.word === wordItem.word ? null : wordItem)}
                    className={`
                      font-bold transition-all duration-300 transform hover:scale-110 cursor-pointer shadow-sm hover:shadow-md rounded px-2 py-1
                      ${getWordColor(wordItem.sentimentBreakdown)}
                      ${selectedWord?.word === wordItem.word ? 'scale-110 opacity-100 ring-2 ring-indigo-400' : 'opacity-85 hover:opacity-100'}
                      ${fontSize > 35 ? 'font-extrabold' : fontSize > 25 ? 'font-bold' : 'font-semibold'}
                    `}
                    style={{ 
                      fontSize: `${fontSize}px`,
                      lineHeight: '1.3',
                      margin: `${Math.max(2, fontSize * 0.1)}px`,
                      textShadow: fontSize > 30 ? '0 1px 2px rgba(0,0,0,0.1)' : 'none'
                    }}
                    title={`"${wordItem.word}" - Used ${wordItem.frequency} times by ${wordItem.userCount} employees across ${wordItem.departmentCount || 1} departments`}
                  >
                    {wordItem.word}
                  </button>
                );
              })}
            </div>

            {selectedWord && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <span>"{selectedWord.word}"</span>
                    {getSentimentIcon(selectedWord.sentimentBreakdown)}
                  </h4>
                  <button
                    onClick={() => setSelectedWord(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <p className="text-gray-900">{selectedWord.frequency} occurrences</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Users:</span>
                    <p className="text-gray-900">{selectedWord.userCount} employees</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Departments:</span>
                    <p className="text-gray-900">{selectedWord.departmentCount} departments</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Sentiment:</span>
                    <div className="flex space-x-2 mt-1">
                      <span className="text-green-600">+{selectedWord.sentimentBreakdown?.positive || 0}</span>
                      <span className="text-gray-600">{selectedWord.sentimentBreakdown?.neutral || 0}</span>
                      <span className="text-red-600">-{selectedWord.sentimentBreakdown?.negative || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* AI Insights */}
          {insights && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Overall Sentiment */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <Brain size={16} className="text-purple-600" />
                  <h4 className="font-semibold text-gray-900">Overall Sentiment</h4>
                </div>
                <div className="mb-2">
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${
                      insights.overallSentiment?.score > 0.1 ? 'bg-green-500' :
                      insights.overallSentiment?.score < -0.1 ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <span className="font-medium capitalize">{insights.overallSentiment?.label}</span>
                    <span className="text-sm text-gray-600">({insights.overallSentiment?.score?.toFixed(2)})</span>
                  </div>
                </div>
                <p className="text-sm text-gray-700">{insights.overallSentiment?.description}</p>
              </div>

              {/* Key Themes */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-2 mb-3">
                  <TrendingUp size={16} className="text-blue-600" />
                  <h4 className="font-semibold text-gray-900">Key Themes</h4>
                </div>
                <div className="space-y-2">
                  {insights.keyThemes?.slice(0, 3).map((theme, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{theme.theme}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        theme.significance === 'high' ? 'bg-red-100 text-red-800' :
                        theme.significance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {theme.significance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Positive Indicators */}
              {insights.wellnessInsights?.positiveIndicators?.length > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <CheckCircle size={16} className="text-green-600" />
                    <h4 className="font-semibold text-gray-900">Positive Indicators</h4>
                  </div>
                  <div className="space-y-2">
                    {insights.wellnessInsights.positiveIndicators.slice(0, 2).map((indicator, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium text-green-800">{indicator.indicator}</p>
                        <p className="text-xs text-green-700">{indicator.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Areas of Concern */}
              {insights.wellnessInsights?.concerns?.length > 0 && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-3">
                    <AlertCircle size={16} className="text-red-600" />
                    <h4 className="font-semibold text-gray-900">Areas of Concern</h4>
                  </div>
                  <div className="space-y-2">
                    {insights.wellnessInsights.concerns.slice(0, 2).map((concern, index) => (
                      <div key={index}>
                        <p className="text-sm font-medium text-red-800">{concern.concern}</p>
                        <p className="text-xs text-red-700">{concern.recommendation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Summary Stats */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-indigo-50 rounded-lg">
              <MessageSquare size={24} className="text-indigo-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-indigo-600">{wordData.length}</div>
              <div className="text-xs text-indigo-500">Unique Words</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Users size={24} className="text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-600">
                {wordData.reduce((sum, w) => sum + (w.userCount || 0), 0)}
              </div>
              <div className="text-xs text-green-500">Total Participants</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <TrendingUp size={24} className="text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">
                {wordData.reduce((sum, w) => sum + (w.frequency || 0), 0)}
              </div>
              <div className="text-xs text-purple-500">Total Occurrences</div>
            </div>
            <div className="text-center p-4 bg-amber-50 rounded-lg">
              <Brain size={24} className="text-amber-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-amber-600">
                {insights ? 'Available' : 'Processing'}
              </div>
              <div className="text-xs text-amber-500">AI Insights</div>
            </div>
          </div>
        </>
      ) : (
        <div className="h-96 flex items-center justify-center bg-gradient-to-br from-gray-50 to-indigo-50 rounded-lg border border-gray-200">
          <div className="text-center">
            <MessageSquare size={56} className="text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-500 mb-2">No Word Analytics Data Available</p>
            <p className="text-gray-400 text-sm max-w-md">
              Employee communications through journals, surveys, and check-ins are needed to generate word analytics insights
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordCloudChart;
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface SecurityQuestion {
  id: string;
  question: string;
}

interface SecurityQuestionsSetupProps {
  onComplete: (answers: Array<{ questionId: string; answer: string }>) => void;
  loading?: boolean;
}

export function SecurityQuestionsSetup({ onComplete, loading = false }: SecurityQuestionsSetupProps) {
  const [questions, setQuestions] = useState<SecurityQuestion[]>([]);
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>(['', '', '']);
  const [answers, setAnswers] = useState<string[]>(['', '', '']);
  const [error, setError] = useState('');
  const [fetchLoading, setFetchLoading] = useState(true);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/security-questions`);
      const data = await response.json();
      setQuestions(data);
      setFetchLoading(false);
    } catch (err) {
      setError('Failed to load security questions');
      setFetchLoading(false);
    }
  };

  const handleQuestionChange = (index: number, value: string) => {
    const newSelected = [...selectedQuestions];
    newSelected[index] = value;
    setSelectedQuestions(newSelected);
  };

  const handleAnswerChange = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate all questions are selected
    if (selectedQuestions.some(q => !q)) {
      setError('Please select all security questions');
      return;
    }

    // Check for duplicate questions
    if (new Set(selectedQuestions).size !== selectedQuestions.length) {
      setError('Please select different security questions');
      return;
    }

    // Validate all answers are filled
    if (answers.some(a => !a.trim())) {
      setError('Please answer all security questions');
      return;
    }

    const questionsAnswers = selectedQuestions.map((questionId, index) => ({
      questionId,
      answer: answers[index].trim(),
    }));

    onComplete(questionsAnswers);
  };

  if (fetchLoading) {
    return <div className="text-center">Loading security questions...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Security Questions</CardTitle>
        <CardDescription>
          Set up security questions to help recover your account if you forget your password
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-2">
              <Label htmlFor={`question-${index}`}>
                Security Question {index + 1}
              </Label>
              <Select
                value={selectedQuestions[index]}
                onValueChange={(value) => handleQuestionChange(index, value)}
                disabled={loading}
              >
                <SelectTrigger id={`question-${index}`}>
                  <SelectValue placeholder="Select a question" />
                </SelectTrigger>
                <SelectContent>
                  {questions.map((q) => (
                    <SelectItem
                      key={q.id}
                      value={q.id}
                      disabled={selectedQuestions.some(
                        (selected, idx) => selected === q.id && idx !== index
                      )}
                    >
                      {q.question}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {selectedQuestions[index] && (
                <div>
                  <Label htmlFor={`answer-${index}`} className="text-sm">
                    Your Answer
                  </Label>
                  <Input
                    id={`answer-${index}`}
                    type="text"
                    placeholder="Enter your answer"
                    value={answers[index]}
                    onChange={(e) => handleAnswerChange(index, e.target.value)}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          ))}

          <Button type="submit" className="w-full" disabled={loading || fetchLoading}>
            {loading ? 'Setting up...' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

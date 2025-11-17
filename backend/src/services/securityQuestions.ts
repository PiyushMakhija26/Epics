import { SecurityQuestion, SecurityAnswer } from '../db/models';
import bcrypt from 'bcryptjs';

export const securityQuestionService = {
  // Get all available security questions
  async getAllQuestions() {
    const questions = await SecurityQuestion.find({}, { id: 1, question: 1 }).sort({ id: 1 });
    return questions;
  },

  // Set user security answers
  async setUserAnswers(userId: string, answers: Array<{ questionId: string; answer: string }>) {
    // Hash all answers
    const hashedAnswers = await Promise.all(
      answers.map(async (item) => ({
        user_id: userId,
        question_id: item.questionId,
        answer_hash: await bcrypt.hash(item.answer.toLowerCase().trim(), 10),
      }))
    );

    // Delete old answers and insert new ones
    await SecurityAnswer.deleteMany({ user_id: userId });
    const result = await SecurityAnswer.insertMany(hashedAnswers);
    return result;
  },

  // Get user's security questions for password reset
  async getUserSecurityQuestions(userId: string) {
    const answers = await SecurityAnswer.find({ user_id: userId });
    
    // Get the question text for each answer
    const questionsWithText = await Promise.all(
      answers.map(async (answer: any) => {
        const question = await SecurityQuestion.findOne({ id: answer.question_id });
        return {
          question_id: answer.question_id,
          question: question?.question || 'Unknown question',
        };
      })
    );
    
    return questionsWithText;
  },

  // Verify security answer
  async verifySecurityAnswer(userId: string, questionId: string, answer: string): Promise<boolean> {
    const record = await SecurityAnswer.findOne({
      user_id: userId,
      question_id: questionId,
    });

    if (!record) return false;

    const isValid = await bcrypt.compare(answer.toLowerCase().trim(), record.answer_hash);
    return isValid;
  },

  // Check if user has set security answers
  async hasSecurityAnswers(userId: string): Promise<boolean> {
    const count = await SecurityAnswer.countDocuments({ user_id: userId });
    return count > 0;
  },
};

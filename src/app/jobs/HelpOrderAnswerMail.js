import Mail from '../../lib/Mail';

class HelpOrderAnswerMail {
  get key() {
    return 'HelpOrderAnswerMail';
  }

  async handle({ data }) {
    await Mail.sendMail({
      to: `${data.student.name} <${data.student.email}>`,
      subject: 'GymPoint: Sua pergunta foi respondida!',
      template: 'answeredHelpOrder',
      context: {
        name: data.student.name,
        question: data.question,
        answer: data.answer,
      },
    });
  }
}

export default new HelpOrderAnswerMail();

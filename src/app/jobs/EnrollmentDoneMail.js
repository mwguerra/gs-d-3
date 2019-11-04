import { format, parseISO } from 'date-fns';
import pt from 'date-fns/locale/pt';
import Mail from '../../lib/Mail';

class EnrollmentDoneMail {
  get key() {
    return 'EnrollmentDoneMail';
  }

  async handle({ data }) {
    await Mail.sendMail({
      to: `${data.student.name} <${data.student.email}>`,
      subject: 'Matrícula realizada na GymPoint!',
      template: 'enrollmentDone',
      context: {
        name: data.student.name,
        plan: data.plan.title,
        start: format(parseISO(data.start_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        end: format(parseISO(data.end_date), 'dd/MM/yyyy', {
          locale: pt,
        }),
        price: data.price,
      },
    });
  }
}

export default new EnrollmentDoneMail();

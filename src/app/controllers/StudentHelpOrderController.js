import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';

class StudentHelpOrderController {
  async index(req, res) {
    const orders = await HelpOrder.findAll({
      where: {
        student_id: req.params.id,
      },
      attributes: ['id', 'question', 'student_id'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email'],
        },
      ],
    });

    return res.json(orders);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      question: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const order = await HelpOrder.create({
      student_id: req.params.id,
      question: req.body.question,
    });

    return res.json(order);
  }
}

export default new StudentHelpOrderController();

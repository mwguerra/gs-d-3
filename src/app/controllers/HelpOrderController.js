import * as Yup from 'yup';
import HelpOrder from '../models/HelpOrder';
import Student from '../models/Student';
import Queue from '../../lib/Queue';
import HelpOrderAnswerMail from '../jobs/HelpOrderAnswerMail';

class HelpOrderController {
  async index(req, res) {
    const orders = await HelpOrder.findAll({
      where: {
        answer: null,
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

  async update(req, res) {
    const schema = Yup.object().shape({
      answer: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const order = await HelpOrder.findByPk(req.params.id);

    if (!order) {
      return res.status(400).json({ error: 'Help Order not found.' });
    }

    order.answer = req.body.answer;
    order.answered_at = new Date();

    order.save();

    const orderWithAssociations = await HelpOrder.findByPk(order.id, {
      attributes: ['id', 'question', 'answer', 'answered_at', 'student_id'],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age', 'weight', 'height'],
        },
      ],
    });

    await Queue.add(HelpOrderAnswerMail.key, orderWithAssociations);

    return res.json(order);
  }
}

export default new HelpOrderController();

import { subDays, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import Student from '../models/Student';
import Checkin from '../models/Checkin';

class CheckinController {
  async index(req, res) {
    const checkins = await Checkin.findAll({
      where: {
        student_id: req.params.id,
      },
    });

    return res.json(checkins);
  }

  async store(req, res) {
    const student = await Student.findByPk(req.params.id);

    if (!student) {
      return res.status(400).json({ error: 'Student not found.' });
    }

    const todayLess7Days = subDays(startOfDay(new Date()), 7);

    const checkinsCount = await Checkin.count({
      where: {
        created_at: {
          [Op.gte]: todayLess7Days,
        },
      },
    });

    const checkinsLeft = 5 - checkinsCount;

    if (checkinsLeft === 0) {
      return res.json({
        message: `Sorry, you have no checkins left. Come back tomorrow and try again.`,
      });
    }

    await Checkin.create({
      student_id: req.params.id,
    });

    return res.json({
      message: `Welcome, ${student.name}. You have ${checkinsLeft} checkins left.`,
    });
  }
}

export default new CheckinController();

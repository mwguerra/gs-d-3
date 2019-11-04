import * as Yup from 'yup';
import { differenceInDays, addMonths, parseISO, isSameDay } from 'date-fns';
import Enrollment from '../models/Enrollment';
import Student from '../models/Student';
import Plan from '../models/Plan';
import Queue from '../../lib/Queue';
import EnrollmentDoneMail from '../jobs/EnrollmentDoneMail';

class EnrollmentController {
  async index(req, res) {
    const enrollments = await Enrollment.findAll({
      attributes: [
        'id',
        'start_date',
        'end_date',
        'price',
        'student_id',
        'plan_id',
      ],
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['name', 'email', 'age', 'weight', 'height'],
        },
        {
          model: Plan,
          as: 'plan',
          attributes: ['title', 'duration', 'price'],
        },
      ],
    });

    return res.json(enrollments);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      email: Yup.string().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    const student = await Student.findOne({
      where: {
        email: req.body.email,
      },
    });

    if (!student) {
      return res
        .status(400)
        .json({ error: 'A student with this email was not found.' });
    }

    const existingEnrollment = await Enrollment.findOne({
      where: {
        student_id: student.id,
      },
    });

    if (existingEnrollment) {
      const daysToExpire = differenceInDays(
        existingEnrollment.end_date,
        new Date()
      );
      return res.status(400).json({
        error: `This student is already enrolled (${daysToExpire} days until expiration).`,
      });
    }

    const enrollmentData = {
      plan_id: req.body.plan_id,
      student_id: student.id,
      start_date: req.body.start_date,
      end_date: addMonths(parseISO(req.body.start_date), plan.duration),
      price: plan.price * plan.duration,
    };

    const enrollment = await Enrollment.create(enrollmentData);
    const enrollmentWithAssociations = await Enrollment.findByPk(
      enrollment.id,
      {
        attributes: [
          'id',
          'start_date',
          'end_date',
          'price',
          'student_id',
          'plan_id',
        ],
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['name', 'email', 'age', 'weight', 'height'],
          },
          {
            model: Plan,
            as: 'plan',
            attributes: ['title', 'duration', 'price'],
          },
        ],
      }
    );

    await Queue.add(EnrollmentDoneMail.key, enrollmentWithAssociations);

    return res.json({
      id: enrollment.id,
      start_date: enrollment.start_date,
      end_date: enrollment.end_date,
      price: enrollment.price,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      plan_id: Yup.number().required(),
      start_date: Yup.date().required(),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation failed.' });
    }

    const plan = await Plan.findByPk(req.body.plan_id);

    if (!plan) {
      return res.status(400).json({ error: 'Invalid plan.' });
    }

    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found.' });
    }

    if (isSameDay(enrollment.start_date, parseISO(req.body.start_date))) {
      const daysToExpire = differenceInDays(enrollment.end_date, new Date());
      return res.status(400).json({
        error: `This student is already enrolled at this plan (${daysToExpire} days until expiration).`,
      });
    }

    const enrollmentData = {
      plan_id: req.body.plan_id,
      start_date: req.body.start_date,
      end_date: addMonths(parseISO(req.body.start_date), plan.duration),
      price: plan.price * plan.duration,
    };

    const { id, start_date, end_date, price } = await enrollment.update(
      enrollmentData
    );

    return res.json({
      id,
      start_date,
      end_date,
      price,
    });
  }

  async delete(req, res) {
    const enrollment = await Enrollment.findByPk(req.params.id);

    if (!enrollment) {
      return res.status(400).json({ error: 'Enrollment not found.' });
    }

    await enrollment.destroy();

    return res.json({ message: 'Enrollment successfully deleted.' });
  }
}

export default new EnrollmentController();

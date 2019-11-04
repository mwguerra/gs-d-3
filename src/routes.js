import { Router } from 'express';
import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import CheckinController from './app/controllers/CheckinController';
import HelpOrderController from './app/controllers/HelpOrderController';
import StudentHelpOrderController from './app/controllers/StudentHelpOrderController';
import PlanController from './app/controllers/PlanController';
import SessionController from './app/controllers/SessionController';
import EnrollmentController from './app/controllers/EnrollmentController';
import authMiddleware from './app/middlewares/auth';
import adminOnlyMiddleware from './app/middlewares/adminOnly';

const routes = new Router();

// Sessões
routes.post('/sessions', SessionController.store);

// /////////////////////
// Auth
// /////////////////////

routes.use(authMiddleware);

// Users
routes.put('/users', UserController.update);
routes.post('/users', UserController.store);

// Students
routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

// Checkins
routes.get('/students/:id/checkins', CheckinController.index);
routes.post('/students/:id/checkins', CheckinController.store);

// Plans
routes.get('/plans', PlanController.index);
routes.post('/plans', adminOnlyMiddleware, PlanController.store);
routes.put('/plans/:id', adminOnlyMiddleware, PlanController.update);
routes.delete('/plans/:id', adminOnlyMiddleware, PlanController.delete);

// Enrollments
routes.get('/enrollments', EnrollmentController.index);
routes.post('/enrollments', adminOnlyMiddleware, EnrollmentController.store);
routes.put(
  '/enrollments/:id',
  adminOnlyMiddleware,
  EnrollmentController.update
);
routes.delete(
  '/enrollments/:id',
  adminOnlyMiddleware,
  EnrollmentController.delete
);

// Help Orders
routes.get('/students/:id/help-orders', StudentHelpOrderController.index);
routes.post('/students/:id/help-orders', StudentHelpOrderController.store);
routes.get('/help-orders', HelpOrderController.index);
routes.put('/help-orders/:id/answer', HelpOrderController.update);

export default routes;
